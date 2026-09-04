/**
 * @file SheetDBLib/src/DatabaseService.js
 * @description Main database service for managing Google Spreadsheet-based databases.
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { cloneDeep } from '@CoreUtilsLib';
import { SpreadsheetService } from '@GoogleApiWrapper';
import { TableService } from './TableService.js';
import { AdvancedQueryBuilder } from './query/AdvancedQueryBuilder.js';

export class DatabaseService {
  constructor(spreadsheetId, logger, utils, cache, exceptionService = null, options = {}) {
    this._spreadsheetId = spreadsheetId;
    this._logger = logger;
    this._utils = utils;
    this._cache = cache;
    this._exceptionService = exceptionService;

    const effectiveExceptionService = exceptionService || {
      executeWithRetry: (fn) => fn(),
      executeWithBypass: (fn) => fn()
    };
    this._spreadsheetService = new SpreadsheetService(
      logger,
      cache,
      utils,
      effectiveExceptionService
    );

    this.tables = {};
    this._loaded = false;
    this._transaction = null;
    this._inTransaction = false;
    this._dryRun = options.dryRun || false;
    this._schemaValidator = options.schemaValidator || null;
    this._verifyTables = options.verifyTables || null;

    if (this._dryRun) {
      this._logger.debug('[DRY-RUN] DatabaseService initialized in dry-run mode.');
    }

    this._initialize();
  }

  // --- Connection / transaction methods (folded from the former DatabaseConnectionManager) ---

  save(options = {}) {
    try {
      if (this._inTransaction) {
        throw new Error('Cannot call save() during a transaction. Use commit() to apply changes.');
      }

      if (this._isDryRun(options)) {
        const pendingChanges = [];
        Object.keys(this.tables).forEach((tableName) => {
          const table = this.tables[tableName];
          const dirtyRows = table._updateQueue ? table._updateQueue.size : 0;
          const newRows = table._insertQueue ? table._insertQueue.length : 0;
          const deletedRows = table._deleteQueue ? table._deleteQueue.size : 0;

          if (dirtyRows > 0 || newRows > 0 || deletedRows > 0) {
            pendingChanges.push({
              table: tableName,
              updates: dirtyRows,
              inserts: newRows,
              deletes: deletedRows
            });
          }
        });

        if (pendingChanges.length > 0) {
          this._logger.info(`[DRY-RUN] Would save changes to ${pendingChanges.length} table(s):`);
          pendingChanges.forEach((change) => {
            this._logger.debug(
              `[DRY-RUN] - ${change.table}: ${change.inserts} inserts, ${change.updates} updates, ${change.deletes} deletes`
            );
          });
        } else {
          this._logger.debug('[DRY-RUN] No pending changes to save');
        }

        return { success: true, pendingChanges, dryRun: true };
      }

      let totalOperations = 0;
      Object.keys(this.tables).forEach((tableName) => {
        const table = this.tables[tableName];
        totalOperations += table.flush(options);
      });

      this._logger.debug(
        `Database saved successfully. Executed operations across ${totalOperations} tables.`
      );
      return this;
    } catch (e) {
      this._logger.error(`Error saving database: ${e.message}`);
      throw new Error(`Failed to save database: ${e.message}`);
    }
  }

  beginTransaction() {
    if (this._inTransaction) {
      throw new Error(
        'Transaction already in progress. Commit or rollback current transaction first.'
      );
    }

    this._transaction = {
      startTime: Date.now(),
      savedStates: {},
      operations: []
    };

    for (const tableName in this.tables) {
      const table = this.tables[tableName];
      this._transaction.savedStates[tableName] = cloneDeep(table._rowsCache);
    }

    this._inTransaction = true;
    this._logger.debug('Transaction started');
    return this;
  }

  commit() {
    if (!this._inTransaction) {
      throw new Error('No transaction in progress. Call beginTransaction() first.');
    }

    try {
      Object.keys(this.tables).forEach((tableName) => {
        this.tables[tableName].flush();
      });
      this._spreadsheetService.flushBatch();
      const duration = Date.now() - this._transaction.startTime;
      this._logger.debug(`Transaction committed successfully (${duration}ms)`);
      this._transaction = null;
      this._inTransaction = false;
      return this;
    } catch (e) {
      this._logger.error(`Transaction commit failed: ${e.message}`);
      try {
        this._performRollback();
      } catch (rollbackError) {
        this._logger.error(`Rollback after commit failure also failed: ${rollbackError.message}`);
      }
      throw new Error(`Transaction commit failed: ${e.message}`);
    }
  }

  rollback() {
    if (!this._inTransaction) {
      throw new Error('No transaction in progress. Call beginTransaction() first.');
    }

    try {
      this._performRollback();
      const duration = Date.now() - this._transaction.startTime;
      this._logger.info(`Transaction rolled back (${duration}ms)`);
      this._transaction = null;
      this._inTransaction = false;
      return this;
    } catch (e) {
      this._logger.error(`Rollback failed: ${e.message}`);
      this._transaction = null;
      this._inTransaction = false;
      throw new Error(`Rollback failed: ${e.message}`);
    }
  }

  _performRollback() {
    if (!this._transaction || !this._transaction.savedStates) {
      throw new Error('No saved state to rollback to');
    }

    for (const tableName in this._transaction.savedStates) {
      if (this.tables[tableName]) {
        this.tables[tableName]._rowsCache = JSON.parse(
          JSON.stringify(this._transaction.savedStates[tableName])
        );
        this.tables[tableName]._invalidateInternalCache();
      }
    }

    if (this._spreadsheetService._batchUpdates) {
      this._spreadsheetService._batchUpdates = [];
    }
  }

  inTransaction() {
    return this._inTransaction;
  }

  // --- Schema-discovery methods (folded from the former DatabaseSchemaExplorer) ---

  /**
   * Reads sheet metadata via the Advanced Sheets API, retrying (bounded, with a short
   * pause between attempts) when `this._verifyTables` names aren't all present yet.
   * `SpreadsheetApp.flush()` only guarantees `SpreadsheetApp`-view consistency — the
   * Advanced Sheets API (`Sheets.Spreadsheets.get`, what `getSheetInfo` calls) is a
   * separate REST-backed read path that can briefly lag a structural write (new/renamed
   * sheet) even after flush(). Costs nothing extra when the caller doesn't opt in, or
   * when the first read already satisfies it.
   */
  _readVerifiedSheetInfo() {
    const expected = this._verifyTables;
    let sheets = this._spreadsheetService.getSheetInfo(this._spreadsheetId, {
      includeHidden: false
    });
    if (!expected || expected.length === 0) {
      return sheets;
    }

    const maxAttempts = 3;
    const delayMs = 300;
    let attempt = 1;
    while (attempt < maxAttempts && !this._allTablesVisible(sheets, expected)) {
      this._logger.debug(
        `Expected table(s) [${expected.join(', ')}] not yet visible via Advanced Sheets API for ${this._spreadsheetId} (attempt ${attempt}/${maxAttempts}); retrying in ${delayMs}ms.`
      );
      this._utils.sleep(delayMs);
      sheets = this._spreadsheetService.getSheetInfo(this._spreadsheetId, {
        includeHidden: false
      });
      attempt++;
    }
    if (!this._allTablesVisible(sheets, expected)) {
      const missing = expected.filter((name) => !sheets.some((sheet) => sheet.name === name));
      this._logger.warn(
        `Expected table(s) [${missing.join(', ')}] still not visible via Advanced Sheets API for ${this._spreadsheetId} after ${maxAttempts} attempts; proceeding with what was returned.`
      );
    }
    return sheets;
  }

  _allTablesVisible(sheets, expectedNames) {
    const present = new Set(sheets.map((sheet) => sheet.name));
    return expectedNames.every((name) => present.has(name));
  }

  _initialize() {
    try {
      const sheets = this._readVerifiedSheetInfo();
      if (sheets.length === 0) {
        this._logger.warn(
          `No visible sheets (tables) found in database ID ${this._spreadsheetId}.`
        );
        this._loaded = true;
        return;
      }

      const ranges = sheets.map((sheet) => {
        const escapedName = sheet.name.replace(/'/g, "''");
        return `'${escapedName}'!A:ZZ`;
      });

      this._logger.debug(`Preparing for batch loading of ${sheets.length} tables.`);
      const rangeDataMap = this._spreadsheetService.getRanges(this._spreadsheetId, ranges, {
        valueRenderOption: 'UNFORMATTED_VALUE',
        majorDimension: 'ROWS'
      });

      const dataBySheetName = new Map();
      sheets.forEach((sheet, index) => {
        const rangeName = ranges[index];
        const data = rangeDataMap[rangeName] || [];
        dataBySheetName.set(sheet.name, data);
        this._logger.debug(`Mapped sheet "${sheet.name}" with ${data.length} rows`);
      });

      sheets.forEach((sheet) => {
        const tableData = dataBySheetName.get(sheet.name) || [];
        const table = new TableService(
          sheet.name,
          this._spreadsheetId,
          this._spreadsheetService,
          this._logger,
          this._utils,
          tableData,
          this._schemaValidator
        );
        this.tables[sheet.name] = table;
      });

      this._loaded = true;
      this._logger.debug(
        `Database initialized with ${Object.keys(this.tables).length} tables loaded in batch.`
      );
    } catch (e) {
      this._logger.error(`Error initializing database: ${e.message}`);
      throw e;
    }
  }

  // --- Table-registry methods (folded from the former DatabaseTableRegistry) ---

  getTable(tableName) {
    return this.tables[tableName] || null;
  }

  hasTable(tableName) {
    return !!this.tables[tableName];
  }

  listTables() {
    return Object.keys(this.tables);
  }

  // --- Metadata methods (folded from the former DatabaseMetaDataHandler) ---

  _isDryRun(options = {}) {
    if (typeof options.dryRun === 'boolean') {
      return options.dryRun;
    }
    return this._dryRun;
  }

  getMetadata() {
    return {
      spreadsheetId: this._spreadsheetId,
      loaded: this._loaded,
      inTransaction: this._inTransaction,
      dryRun: this._dryRun,
      tableCount: Object.keys(this.tables).length
    };
  }

  select(fields = ['*']) {
    return new AdvancedQueryBuilder(this, fields);
  }
}

/** @deprecated nome storico, rimosso alla prossima release. */
export { DatabaseService as MyDatabaseService };
