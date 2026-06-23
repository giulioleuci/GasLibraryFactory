/**
 * @file SheetDBLib/src/managers/DatabaseConnectionManager.js
 * @description Manager for database connections, transactions, and save operations.
 */

import { cloneDeep } from '@CoreUtilsLib';

export class DatabaseConnectionManager {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._spreadsheetService = facade._spreadsheetService;
  }

  save(options = {}) {
    try {
      if (this.facade._inTransaction) {
        throw new Error('Cannot call save() during a transaction. Use commit() to apply changes.');
      }

      if (this.facade._isDryRun(options)) {
        const pendingChanges = [];
        Object.keys(this.facade.tables).forEach((tableName) => {
          const table = this.facade.tables[tableName];
          const dirtyRows = table._updateQueue ? table._updateQueue.size : 0;
          const newRows = table._insertQueue ? table._insertQueue.length : 0;
          const deletedRows = table._deleteQueue ? table._deleteQueue.size : 0;

          if (dirtyRows > 0 || newRows > 0 || deletedRows > 0) {
            pendingChanges.push({ table: tableName, updates: dirtyRows, inserts: newRows, deletes: deletedRows });
          }
        });

        if (pendingChanges.length > 0) {
          this._logger.info(`[DRY-RUN] Would save changes to ${pendingChanges.length} table(s):`);
          pendingChanges.forEach((change) => {
            this._logger.info(`[DRY-RUN]   - ${change.table}: ${change.inserts} inserts, ${change.updates} updates, ${change.deletes} deletes`);
          });
        } else {
          this._logger.info('[DRY-RUN] No pending changes to save');
        }

        return { success: true, pendingChanges, dryRun: true };
      }

      let totalOperations = 0;
      Object.keys(this.facade.tables).forEach((tableName) => {
        const table = this.facade.tables[tableName];
        totalOperations += table.flush(options);
      });
      
      this._logger.debug(`Database saved successfully. Executed operations across ${totalOperations} tables.`);
      return this.facade;
    } catch (e) {
      this._logger.error(`Error saving database: ${e.message}`);
      throw new Error(`Failed to save database: ${e.message}`);
    }
  }

  beginTransaction() {
    if (this.facade._inTransaction) {
      throw new Error('Transaction already in progress. Commit or rollback current transaction first.');
    }

    this.facade._transaction = {
      startTime: Date.now(),
      savedStates: {},
      operations: []
    };

    for (const tableName in this.facade.tables) {
      const table = this.facade.tables[tableName];
      this.facade._transaction.savedStates[tableName] = cloneDeep(table._rowsCache);
    }

    this.facade._inTransaction = true;
    this._logger.info('Transaction started');
    return this.facade;
  }

  commit() {
    if (!this.facade._inTransaction) {
      throw new Error('No transaction in progress. Call beginTransaction() first.');
    }

    try {
      this._spreadsheetService.flushBatch();
      const duration = Date.now() - this.facade._transaction.startTime;
      this._logger.info(`Transaction committed successfully (${duration}ms)`);
      this.facade._transaction = null;
      this.facade._inTransaction = false;
      return this.facade;
    } catch (e) {
      this._logger.error(`Transaction commit failed: ${e.message}`);
      try {
        this.facade._performRollback();
      } catch (rollbackError) {
        this._logger.error(`Rollback after commit failure also failed: ${rollbackError.message}`);
      }
      throw new Error(`Transaction commit failed: ${e.message}`);
    }
  }

  rollback() {
    if (!this.facade._inTransaction) {
      throw new Error('No transaction in progress. Call beginTransaction() first.');
    }

    try {
      this.facade._performRollback();
      const duration = Date.now() - this.facade._transaction.startTime;
      this._logger.info(`Transaction rolled back (${duration}ms)`);
      this.facade._transaction = null;
      this.facade._inTransaction = false;
      return this.facade;
    } catch (e) {
      this._logger.error(`Rollback failed: ${e.message}`);
      this.facade._transaction = null;
      this.facade._inTransaction = false;
      throw new Error(`Rollback failed: ${e.message}`);
    }
  }

  _performRollback() {
    if (!this.facade._transaction || !this.facade._transaction.savedStates) {
      throw new Error('No saved state to rollback to');
    }

    for (const tableName in this.facade._transaction.savedStates) {
      if (this.facade.tables[tableName]) {
        this.facade.tables[tableName]._rowsCache = JSON.parse(
          JSON.stringify(this.facade._transaction.savedStates[tableName])
        );
        this.facade.tables[tableName]._invalidateInternalCache();
      }
    }

    if (this._spreadsheetService._batchUpdates) {
      this._spreadsheetService._batchUpdates = [];
    }
  }

  inTransaction() {
    return this.facade._inTransaction;
  }
}
