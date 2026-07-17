/**
 * @file SheetDBLib/src/TableService.js
 * @description Service for representing and managing a single table (sheet) in a Google Spreadsheet.
 *
 * Provides ORM-lite operations for individual sheets with advanced features:
 * - Full CRUD operations with batch optimization
 * - Schema validation with type checking and custom validators
 * - Virtual computed columns for dynamic fields
 * - Fuzzy search using Fuse.js
 * - Indexing for O(1) lookups
 * - Dirty checking to skip unnecessary writes
 * - Lazy or eager loading modes
 *
 * @version 1.0
 * @requires GoogleApiWrapper - SpreadsheetService for Google Sheets API access
 * @requires CoreUtilsLib - isEqual for efficient dirty checking and deep equality
 * @requires fuse.js (npm) - For fuzzy search with configurable scoring
 */

import { isEqual, OperationError, isPlainObject } from '@CoreUtilsLib';
import { TableDataModifier } from './TableDataModifier.js';
import { TableSchemaValidator } from './TableSchemaValidator.js';
import { TableSearchEngine } from './TableSearchEngine.js';

/**
 * @class TableService
 * @description ORM-lite facade for a single Google Sheet. Orchestrates CRUD, validation, computed virtual columns, and write-through caching.
 */
export class TableService {
  // SDL-M008: Extract hardcoded column limit to constants
  static get ALPHABET_SIZE() {
    return 26;
  } // Number of letters in alphabet (A-Z)
  static get ASCII_CODE_A() {
    return 65;
  } // ASCII code for 'A'

  /**
   * @constructor
   * @param {string} sheetName - Target tab name.
   * @param {string} spreadsheetId - Parent file UUID.
   * @param {SpreadsheetService} spreadsheetService - Injected API wrapper.
   * @param {LoggerService} logger - Injected logging.
   * @param {UtilsService} utils - Provides UUID generation.
   * @param {Array<Array<*>>} [preloadedData=null] - Raw 2D array for Eager Loading.
   * @param {TableSchemaValidator} [schemaValidator=null] - Pre-instantiated validator.
   */
  constructor(
    sheetName,
    spreadsheetId,
    spreadsheetService,
    logger,
    utils,
    preloadedData = null,
    schemaValidator = null
  ) {
    this.sheetName = sheetName;
    this.spreadsheetId = spreadsheetId;
    this.spreadsheetService = spreadsheetService;
    this._logger = logger;
    this.utils = utils;

    this._manualPrimaryKey = null;
    this._virtualColumns = {};
    this._rowsCache = null;
    this._dataLoaded = false;
    this._indices = {};

    this._schema = null;
    this._schemaValidationEnabled = false;
    this._schemaValidator = schemaValidator;

    this._processedRowsCache = null;
    this._virtualColumnVersion = 0;
    this._originalRowData = new Map();

    this._insertQueue = [];
    this._updateQueue = new Map();
    this._deleteQueue = new Set();

    // Facade delegate instantiation. Public methods are exposed via explicit
    // delegating methods below (see the "Delegated sub-service methods" section)
    // rather than dynamic bind-loops, so the public surface is statically visible.
    this.dataModifier = new TableDataModifier(this);
    this.schemaValidator = new TableSchemaValidator(this);
    this.searchEngine = new TableSearchEngine(this);

    if (preloadedData) {
      this._logger.debug('EAGER initialization for table: ' + this.sheetName);
      const { columns, rows } = this._processRawData(preloadedData);
      this.columns = columns;
      this._rowsCache = rows;
      this._dataLoaded = true;
    } else {
      this._logger.debug('LAZY initialization for table: ' + this.sheetName);
      this.columns = this._loadHeader();
    }

    this._keyField = this._determinePrimaryKey();

    if (preloadedData && this._rowsCache) {
      for (const row of this._rowsCache) {
        this._storeOriginalRowData(row);
      }
    }
  }

  // --- Delegated sub-service methods (explicit, statically visible) ---
  // These forward to the TableDataModifier / TableSchemaValidator / TableSearchEngine
  // collaborators. Rest args preserve each sub-service method's exact signature.

  /** @description Inserts a single row. @returns {*} Result from TableDataModifier. */
  insertRow(...args) {
    return this.dataModifier.insertRow(...args);
  }

  /** @description Inserts multiple rows. @returns {*} Result from TableDataModifier. */
  insertRows(...args) {
    return this.dataModifier.insertRows(...args);
  }

  /** @description Updates a row by id. @returns {*} Result from TableDataModifier. */
  updateRowById(...args) {
    return this.dataModifier.updateRowById(...args);
  }

  /** @description Patches a row. @returns {*} Result from TableDataModifier. */
  patchRow(...args) {
    return this.dataModifier.patchRow(...args);
  }

  /** @description Deletes a row by id. @returns {*} Result from TableDataModifier. */
  deleteRowById(...args) {
    return this.dataModifier.deleteRowById(...args);
  }

  /** @description Updates multiple rows by ids. @returns {*} Result from TableDataModifier. */
  updateRowsByIds(...args) {
    return this.dataModifier.updateRowsByIds(...args);
  }

  /** @description Deletes multiple rows by ids. @returns {*} Result from TableDataModifier. */
  deleteRowsByIds(...args) {
    return this.dataModifier.deleteRowsByIds(...args);
  }

  /** @description Sets the validation schema. @returns {*} Result from TableSchemaValidator. */
  setSchema(...args) {
    return this.schemaValidator.setSchema(...args);
  }

  /** @description Disables schema validation. @returns {*} Result from TableSchemaValidator. */
  disableSchemaValidation(...args) {
    return this.schemaValidator.disableSchemaValidation(...args);
  }

  /** @description Enables schema validation. @returns {*} Result from TableSchemaValidator. */
  enableSchemaValidation(...args) {
    return this.schemaValidator.enableSchemaValidation(...args);
  }

  /** @description Fuzzy-searches rows. @returns {*} Result from TableSearchEngine. */
  fuzzySearch(...args) {
    return this.searchEngine.fuzzySearch(...args);
  }

  /** @description Creates an index. @returns {*} Result from TableSearchEngine. */
  createIndex(...args) {
    return this.searchEngine.createIndex(...args);
  }

  /** @private @description Validates a row against the schema. */
  _validateRow(...args) {
    return this.schemaValidator.validateRow(...args);
  }

  /** @private @description Performs an indexed lookup. */
  _indexedLookup(...args) {
    return this.searchEngine.indexedLookup(...args);
  }

  /** @private @description Invalidates a search index. */
  _invalidateIndex(...args) {
    return this.searchEngine.invalidateIndex(...args);
  }

  // --- PUBLIC METHODS ---

  /**
   * @function getRows
   * @description Retrieves all records as plain objects. Lazy-loads data on first call. Virtual columns are recomputed only if version mismatches.
   * @returns {Object[]} Cloned array of row objects.
   */
  getRows() {
    this._ensureDataLoaded();

    // PERFORMANCE: Build cache if not available
    if (this._processedRowsCache === null) {
      this._processedRowsCache = this._rowsCache.map((row) =>
        this._applyVirtualColumns({ ...row })
      );
    }

    // Return a deep copy (new row objects) to prevent external mutations
    // while still benefiting from cached virtual column computation
    return this._processedRowsCache.map((row) => ({ ...row }));
  }

  /**
   * Deletes a row from the spreadsheet identified by its primary key.
   *
   * @param {string|number} id - The value of the primary key of the row to delete
   * @returns {boolean} `true` if deletion was successful, `false` otherwise
   *
   * @example
   * const deleted = table.deleteRowById('USER_123');
   * if (deleted) {
   *   console.log('User deleted successfully');
   * }
   */

  /**
   * @function flush
   * @description Synchronizes queued changes (deletes, updates, inserts) to Google Sheets via batch API calls.
   * @param {Object} [options={}] - Options.
   * @param {boolean} [options.dryRun=false] - If true, skips API execution.
   * @returns {number} Count of batch operations performed.
   */
  flush(options = {}) {
    let operationsPerformed = 0;
    let writeHeader = false;

    // Ensure columns are loaded before attempting write operations
    if (
      this.columns.length === 0 &&
      (this._deleteQueue.size > 0 || this._updateQueue.size > 0 || this._insertQueue.length > 0)
    ) {
      if (this._insertQueue.length > 0) {
        // Sheet has no header yet — derive columns from queued insert rows
        this._logger.debug(
          `Deriving columns from queued inserts for empty table "${this.sheetName}"`
        );
        const columnSet = new Set();
        for (const row of this._insertQueue) {
          for (const key of Object.keys(row)) {
            if (!this._virtualColumns[key]) {
              columnSet.add(key);
            }
          }
        }
        this.columns = Array.from(columnSet);
        this._keyField = this._determinePrimaryKey();
        writeHeader = true;
      } else {
        this._logger.debug(
          `Columns empty for table "${this.sheetName}", reloading header before flush`
        );
        this.columns = this._loadHeader();
        this._keyField = this._determinePrimaryKey();
      }
    }

    // 1. Process deletes (bottom-up to avoid index shifting)
    if (this._deleteQueue.size > 0 && !options.dryRun) {
      const deleteIds = Array.from(this._deleteQueue);

      // Need real spreadsheet state rows to find exact indices for deletion since our local cache already removed them
      // Actually wait, if we removed them from cache, how do we know their spreadsheet row indices?
      // Spreadsheet row indices correspond to the ORIGINAL data before we modified our local cache!
      // This means if we do multiple inserts/deletes, the spreadsheet row numbers will drift from our cache.
      // But we just need to delete them. Since we deleted them from cache, _findRowIndexById will return -1.
      // We must query the spreadsheet directly or keep track of mapping.
      // To simplify, if we just use a column search? No, deleteRows requires indices.
      // Instead of manual indices, we can fetch all IDs from the sheet right before flush.
      const pkColLetter = this._getPkColumnLetter();
      const pkRange = `'${this.sheetName}'!${pkColLetter}:${pkColLetter}`;
      const pkColumnArray = this.spreadsheetService.getRanges(this.spreadsheetId, pkRange) || [];

      const realRowIndicesToDelete = [];
      const pkValues = pkColumnArray.map((r) => r[0]);

      for (const id of deleteIds) {
        // find index in pkValues. It's 0-indexed, but sheets are 1-indexed. row 1 is header, so values start at index 1 -> row 2.
        const idx = pkValues.findIndex((val) => val == id); // == for string/num conversion
        if (idx !== -1) {
          realRowIndicesToDelete.push(idx + 1); // 1-based index
        }
      }

      if (realRowIndicesToDelete.length > 0) {
        this.spreadsheetService.deleteRows(
          this.spreadsheetId,
          this.sheetName,
          realRowIndicesToDelete
        );
        operationsPerformed++;
      }
      this._deleteQueue.clear();
    }

    // 2. Process updates
    if (this._updateQueue.size > 0 && !options.dryRun) {
      const updates = [];
      const physicalColumns = this.columns.filter((col) => !this._virtualColumns[col]);

      // Need current row indices from remote to safely update
      const pkColLetter = this._getPkColumnLetter();
      const pkRange = `'${this.sheetName}'!${pkColLetter}:${pkColLetter}`;
      const pkColumnArray = this.spreadsheetService.getRanges(this.spreadsheetId, pkRange) || [];
      const pkValues = pkColumnArray.map((r) => (r ? r[0] : null));

      for (const [id, rowToUpdate] of this._updateQueue.entries()) {
        const idx = pkValues.findIndex((val) => val == id);
        if (idx !== -1) {
          const sheetRowIndex = idx + 1;
          const newPhysicalData = {};
          for (const col of physicalColumns) {
            newPhysicalData[col] = rowToUpdate[col] ?? '';
          }

          // Re-check dirty just before update
          const originalData = this._originalRowData.get(id);
          if (originalData && isEqual(originalData, newPhysicalData)) {
            continue; // skip
          }

          const rowValues = physicalColumns.map((col) => newPhysicalData[col] ?? '');

          const rangeA1 = `A${sheetRowIndex}:${this._convertIndexToColumn(physicalColumns.length)}${sheetRowIndex}`;
          updates.push({
            range: `${this.sheetName}!${rangeA1}`,
            values: [rowValues]
          });

          this._originalRowData.set(id, newPhysicalData);
        }
      }

      if (updates.length > 0) {
        this.spreadsheetService.updateRanges(this.spreadsheetId, updates);
        operationsPerformed++;
      }
      this._updateQueue.clear();
    }

    // 3. Process inserts
    if (this._insertQueue.length > 0 && !options.dryRun) {
      const physicalColumns = this.columns.filter((col) => !this._virtualColumns[col]);
      const dataMatrix = this._insertQueue.map((completeRow) => {
        return physicalColumns.map((col) => completeRow[col] ?? '');
      });

      // Prepend header row if the sheet was empty (columns derived from insert queue)
      if (writeHeader) {
        dataMatrix.unshift(physicalColumns);
      }

      // Append rows to bottom
      // appendRows operates on value arrays, we don't need updateRanges here because append calculates the bottom
      this.spreadsheetService.appendRows(this.spreadsheetId, {
        range: `'${this.sheetName}'!A1`,
        values: dataMatrix
      });
      operationsPerformed++;

      // Update original data cache
      for (const row of this._insertQueue) {
        this._storeOriginalRowData(row);
      }
      this._insertQueue = [];
    }

    return operationsPerformed;
  }

  /**
   * @function setPrimaryKey
   * @description Overrides auto-detection of PK column. Re-triggers PK mapping.
   * @param {string} columnName - Target physical column name.
   * @returns {TableService} For chaining.
   */
  setPrimaryKey(columnName) {
    this._manualPrimaryKey = columnName;
    this._keyField = this._determinePrimaryKey();
    return this;
  }

  /**
   * @function getRowById
   * @description O(1) lookup (if indexed) or O(N) scan for a specific record.
   * @param {string|number} id - PK value.
   * @returns {Object|null} Hydrated row object or null.
   */
  getRowById(id) {
    this._ensureDataLoaded();
    const targetRowIndex = this._findRowIndexById(id);

    if (targetRowIndex === -1) {
      return null;
    }

    const row = { ...this._rowsCache[targetRowIndex] };
    return this._applyVirtualColumns(row);
  }

  /**
   * @function defineVirtualColumn
   * @description Registers a computed property. Invalidates internal processed cache.
   * @param {string} columnName - Virtual property key.
   * @param {Function} computeFunction - Logic: (row) => any.
   * @returns {TableService} For chaining.
   * @throws {Error} If computeFunction is not a function.
   */
  defineVirtualColumn(columnName, computeFunction) {
    if (typeof computeFunction !== 'function') {
      throw new Error(
        `The compute function for virtual column "${columnName}" must be a function.`
      );
    }
    this._virtualColumns[columnName] = computeFunction;
    if (!this.columns.includes(columnName)) {
      this.columns.push(columnName);
    }
    // PERFORMANCE: Invalidate processed rows cache since virtual columns changed
    this._processedRowsCache = null;
    this._virtualColumnVersion++;
    return this;
  }

  /**
   * @function getByPK
   * @alias getRowById
   * @param {*} pkValue - PK value.
   * @returns {Object|null}
   */
  getByPK(pkValue) {
    this._ensureDataLoaded();
    const targetRowIndex = this._findRowIndexById(pkValue);
    if (targetRowIndex === -1) {
      return null;
    }
    const foundRow = { ...this._rowsCache[targetRowIndex] };
    return this._applyVirtualColumns(foundRow);
  }

  /**
   * @function getAllRows
   * @alias getRows
   * @returns {Object[]}
   */
  getAllRows() {
    return this.getRows();
  }

  // --- PRIVATE METHODS ---

  /**
   * @function _invalidateInternalCache
   * @description Selectively purges local data, indices, or original state.
   * @param {Object} [options={data: true, indices: true}] - Purge targets.
   * @private
   */
  _invalidateInternalCache(options = { data: true, indices: true }) {
    if (options.data) {
      this._dataLoaded = false;
      this._rowsCache = null;
      this._processedRowsCache = null; // PERFORMANCE: Clear processed rows cache
      this._originalRowData.clear(); // OPTIMIZATION: Clear original data cache
    }
    if (options.indices) {
      this._indices = {};
    }
  }

  /**
   * @function _ensureDataLoaded
   * @description Lazy-load trigger. Fetches all rows from range A:ZZ and populates original data cache.
   * @private
   */
  _ensureDataLoaded() {
    if (this._dataLoaded) {
      return;
    }

    this._logger.debug(`Lazy loading data for table: ${this.sheetName}`);

    const data =
      this.spreadsheetService.getRanges(this.spreadsheetId, `'${this.sheetName}'!A:ZZ`) || [];

    const { rows } = this._processRawData(data);
    this._rowsCache = rows;
    this._dataLoaded = true;

    // OPTIMIZATION: Store original data for dirty checking
    for (const row of this._rowsCache) {
      this._storeOriginalRowData(row);
    }
  }

  /**
   * @function _processRawData
   * @description Transformer: 2D API array -> physical columns + row objects with type coercion.
   * @param {any[][]} data - Matrix from Sheets API.
   * @returns {Object} {columns: string[], rows: Object[]}
   * @private
   */
  _processRawData(data) {
    if (!data || data.length === 0) {
      this._logger.warn(`No data (not even header) provided or found for sheet ${this.sheetName}`);
      return { columns: [], rows: [] };
    }

    const header = data[0].filter((col) => col && String(col).trim() !== '');
    const rows = [];

    for (let i = 1; i < data.length; i++) {
      // Skip completely empty rows
      if (!data[i] || data[i].every((cell) => cell === '' || cell === null || cell === undefined)) {
        continue;
      }

      const rowObject = {};
      for (let j = 0; j < header.length; j++) {
        if (header[j]) {
          rowObject[header[j]] = this._coerceValue(data[i][j] ?? null);
        }
      }
      rows.push(rowObject);
    }
    return { columns: header, rows: rows };
  }

  /**
   * @function _coerceValue
   * @description Normalizes Sheets API strings into JS primitives (number, boolean).
   * @param {*} value - Raw cell data.
   * @returns {*} Primitive or original string.
   * @private
   */
  _coerceValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'string') return value;
    if (value.trim() === '') return value;

    const num = Number(value);
    if (!isNaN(num) && isFinite(num)) {
      return num;
    }

    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;

    return value;
  }

  /**
   * @function _storeOriginalRowData
   * @description Dirty checking snapshot. Excludes virtual columns to ensure physical integrity.
   * @param {Object} row - Object to clone into Map.
   * @private
   */
  _storeOriginalRowData(row) {
    if (!this._keyField || !row[this._keyField]) {
      return; // Can't store without a valid ID
    }

    // Store only physical columns (exclude virtual columns)
    const physicalData = {};
    for (const [key, value] of Object.entries(row)) {
      if (!this._virtualColumns[key]) {
        physicalData[key] = value;
      }
    }

    this._originalRowData.set(row[this._keyField], physicalData);
  }

  /**
   * @function _findRowIndexById
   * @description Memory-safe search for row index by PK. Uses Map index if available.
   * @param {string|number} id - Target PK.
   * @returns {number} 0-based index or -1.
   * @private
   */
  _findRowIndexById(id) {
    // Use an index if available for performance
    if (this._indices[this._keyField] && this._indices[this._keyField][id] !== undefined) {
      return this._indices[this._keyField][id];
    }
    // Use loose equality to handle type coercion (e.g. number vs string from Sheets API)
    return this._rowsCache.findIndex((row) => {
      const rowWithVirtuals = this._applyVirtualColumns({ ...row });
      return rowWithVirtuals[this._keyField] == id;
    });
  }

  /**
   * @function _getNextEmptyRow
   * @description Predicts next insertion point based on current cache length.
   * @returns {number} 1-based index for Sheets API.
   * @private
   */
  _getNextEmptyRow() {
    this._ensureDataLoaded();
    return this._rowsCache.length + 2; // +1 for header, +1 for new row
  }

  /**
   * @function _loadHeader
   * @description On-demand fetch of range A1:ZZ1.
   * @returns {string[]} Sanitized header keys.
   * @throws {Error} If sheet is empty.
   * @private
   */
  _loadHeader() {
    this._logger.debug(`Loading header on-demand for table: ${this.sheetName}`);
    const headerData = this.spreadsheetService.getRanges(
      this.spreadsheetId,
      `'${this.sheetName}'!A1:ZZ1`
    );
    if (!headerData || headerData.length === 0) {
      throw new Error(`No header found in sheet ${this.sheetName}`);
    }
    return headerData[0].filter((col) => col && col.trim() !== '');
  }

  /**
   * @function _determinePrimaryKey
   * @description PK Discovery: manual -> 'ID' -> '*_ID' -> first column.
   * @returns {string} Effective key field name.
   * @private
   */
  _determinePrimaryKey() {
    if (this._manualPrimaryKey) {
      return this._manualPrimaryKey;
    }
    if (this.columns.includes('ID')) {
      return 'ID';
    }
    const idField = this.columns.find((col) => col.toUpperCase().endsWith('_ID'));
    if (idField) {
      return idField;
    }
    return this.columns[0] || 'ID'; // Fallback to first column
  }

  /**
   * @function _applyVirtualColumns
   * @description Enriches a row object with registered computed properties.
   * @param {Object} row - Object to mutate.
   * @returns {Object} Mutated object.
   * @private
   */
  _applyVirtualColumns(row) {
    for (const columnName in this._virtualColumns) {
      try {
        row[columnName] = this._virtualColumns[columnName](row);
      } catch (e) {
        this._logger.warn(`Error computing virtual column "${columnName}": ${e.message}`);
        row[columnName] = null;
      }
    }
    return row;
  }

  /**
   * @function _convertIndexToColumn
   * @description Utility: 1-based index -> A1 Notation (e.g., 27 -> 'AA').
   * @param {number} index - 1-based column position.
   * @returns {string} Letter code.
   * @private
   */
  _convertIndexToColumn(index) {
    let column = '';
    let tempIndex = index;
    while (tempIndex > 0) {
      // SDL-M008: Use constants instead of hardcoded values
      const modulo = (tempIndex - 1) % TableService.ALPHABET_SIZE;
      column = String.fromCharCode(TableService.ASCII_CODE_A + modulo) + column;
      tempIndex = Math.floor((tempIndex - modulo) / TableService.ALPHABET_SIZE);
    }
    return column;
  }

  /**
   * @function _getPkColumnLetter
   * @description Resolves A1 letter for the mapped primary key.
   * @returns {string}
   * @throws {Error} If keyField is missing from columns.
   * @private
   */
  _getPkColumnLetter() {
    const pkIndex = this.columns.indexOf(this._keyField);
    if (pkIndex === -1) {
      throw new Error(
        `Primary key field "${this._keyField}" not found in columns [${this.columns.join(', ')}] for sheet "${this.sheetName}"`
      );
    }
    return this._convertIndexToColumn(pkIndex + 1);
  }
}
