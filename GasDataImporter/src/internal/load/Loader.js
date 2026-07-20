/**
 * @fileoverview Data loading engine with conflict resolution for the ETL pipeline (Load phase)
 * @author GasLibraryFactory
 */

import { LoadError } from '../errors/LoadError.js';

/**
 * Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.
 * @class
 */
class Loader {
  /**
   * Valid conflict resolution strategies
   *
   * @static
   * @type {string[]}
   */
  static STRATEGIES = ['INSERT_ONLY', 'UPDATE_ONLY', 'UPSERT', 'OVERWRITE'];

  /**
   * Initializes the loader with persistence and diagnostic dependencies.
   * @param {Object} logger Diagnostic output interface.
   * @param {Object} databaseService SheetDBLib persistence facade.
   */
  constructor(logger, databaseService) {
    this.logger = logger;
    this._db = databaseService;
  }

  /**
   * Executes the persistence phase, applying conflict resolution and timestamp-based update rules to the provided data collection.
   * @param {Array<Object>} data Transformed row collection.
   * @param {Object} loadConfig persistence parameters.
   * @param {string} loadConfig.targetTable Destination table identifier.
   * @param {string} loadConfig.conflictResolution resolution strategy (INSERT_ONLY|UPDATE_ONLY|UPSERT|OVERWRITE).
   * @param {string} [loadConfig.conflictKey] Attribute used for collision detection.
   * @param {Object} [loadConfig.updateIfNewer] Optional timestamp comparison rules.
   * @returns {Object} Operational statistics.
   * @throws {LoadError} If database is inaccessible or strategy execution fails.
   */
  load(data, loadConfig) {
    if (!Array.isArray(data)) {
      throw new LoadError('Data must be an array', 'INVALID_DATA', { dataType: typeof data });
    }

    if (data.length === 0) {
      this.logger.warn('[Loader] Data is empty, nothing to load');
      return {
        success: true,
        inserted: 0,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 0
      };
    }

    this._validateLoadConfig(loadConfig);

    const targetTable = loadConfig.targetTable;
    const conflictResolution = loadConfig.conflictResolution;
    const conflictKey = loadConfig.conflictKey;
    const updateIfNewer = loadConfig.updateIfNewer || {};

    this.logger.info(
      `[Loader] Loading ${data.length} rows into table "${targetTable}" using strategy "${conflictResolution}"`
    );

    try {
      // Get table reference
      if (!this._db.tables[targetTable]) {
        throw new LoadError(
          `Target table "${targetTable}" not found in database`,
          'TABLE_NOT_FOUND',
          { targetTable, availableTables: Object.keys(this._db.tables) }
        );
      }

      const table = this._db.tables[targetTable];

      // Execute strategy
      let result;
      switch (conflictResolution) {
        case 'INSERT_ONLY':
          result = this._insertOnly(table, data, conflictKey);
          break;

        case 'UPDATE_ONLY':
          result = this._updateOnly(table, data, conflictKey, updateIfNewer);
          break;

        case 'UPSERT':
          result = this._upsert(table, data, conflictKey, updateIfNewer);
          break;

        case 'OVERWRITE':
          result = this._overwrite(table, data, conflictKey);
          break;

        default:
          throw new LoadError(
            `Unknown conflict resolution strategy: ${conflictResolution}`,
            'UNKNOWN_STRATEGY',
            { conflictResolution }
          );
      }

      // Save changes to spreadsheet
      this.logger.info('[Loader] Saving changes to database...');
      this._db.save();

      this.logger.info(`[Loader] Load complete: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      if (error instanceof LoadError) {
        throw error;
      }

      this.logger.error(`[Loader] Load failed: ${error.message}`);
      throw new LoadError(`Failed to load data: ${error.message}`, 'LOAD_FAILED', {
        targetTable,
        conflictResolution,
        originalError: error.message
      });
    }
  }

  /**
   * Strategy to exclusively add new records while ignoring existing collisions.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to evaluate.
   * @param {string} conflictKey Attribute for collision detection.
   * @returns {Object} statistics.
   */
  _insertOnly(table, data, conflictKey) {
    try {
      // OPTIMIZATION: Read existing keys once
      const existingRows = table.getAllRows();
      const existingKeys = new Set(existingRows.map((row) => String(row[conflictKey])));

      // OPTIMIZATION: Separate data into insert vs skip buckets
      const rowsToInsert = [];
      let skipped = 0;

      for (const row of data) {
        const keyValue = String(row[conflictKey]);
        if (existingKeys.has(keyValue)) {
          skipped++;
          this.logger.debug(`[Loader] Skipping existing record: ${conflictKey}=${keyValue}`);
        } else {
          rowsToInsert.push(row);
        }
      }

      // OPTIMIZATION: Bulk insert all new rows at once
      let inserted = 0;
      if (rowsToInsert.length > 0) {
        table.insertRows(rowsToInsert);
        inserted = rowsToInsert.length;
        this.logger.info(`[Loader] Bulk inserted ${inserted} new rows`);
      }

      return {
        success: true,
        inserted,
        updated: 0,
        skipped,
        deleted: 0,
        total: data.length
      };
    } catch (error) {
      this.logger.error(`[Loader] Failed to insert rows: ${error.message}`);
      throw new LoadError(`Failed to insert rows: ${error.message}`, 'INSERT_FAILED', {
        originalError: error.message
      });
    }
  }

  /**
   * Strategy to refresh existing records while ignoring new entries.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to evaluate.
   * @param {string} conflictKey Attribute for record matching.
   * @param {Object} updateIfNewer Timestamp comparison configuration.
   * @returns {Object} statistics.
   */
  _updateOnly(table, data, conflictKey, updateIfNewer) {
    try {
      // OPTIMIZATION: Read existing rows once and build lookup map
      const existingRows = table.getAllRows();
      const existingMap = new Map();
      for (const row of existingRows) {
        existingMap.set(String(row[conflictKey]), row);
      }

      let updated = 0;
      let skipped = 0;

      // OPTIMIZATION: Process updates in batch
      for (const row of data) {
        const keyValue = String(row[conflictKey]);
        const existing = existingMap.get(keyValue);

        if (!existing) {
          skipped++;
          this.logger.debug(
            `[Loader] Skipping new record (UPDATE_ONLY): ${conflictKey}=${keyValue}`
          );
        } else {
          // Check timestamp if updateIfNewer is enabled
          if (updateIfNewer.enabled) {
            if (!this._shouldUpdate(existing, row, updateIfNewer.timestampColumn)) {
              skipped++;
              continue;
            }
          }

          // Get primary key (usually 'ID' or first column with '_ID' suffix)
          const pkField = table._keyField || 'ID';
          table.updateRowById(existing[pkField], row);
          updated++;
        }
      }

      return {
        success: true,
        inserted: 0,
        updated,
        skipped,
        deleted: 0,
        total: data.length
      };
    } catch (error) {
      this.logger.error(`[Loader] Failed to update rows: ${error.message}`);
      throw new LoadError(`Failed to update rows: ${error.message}`, 'UPDATE_FAILED', {
        originalError: error.message
      });
    }
  }

  /**
   * Strategy to synchronize data by updating existing matches and inserting new entries.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to evaluate.
   * @param {string} conflictKey Attribute for matching and detection.
   * @param {Object} updateIfNewer Timestamp comparison configuration.
   * @returns {Object} statistics.
   */
  _upsert(table, data, conflictKey, updateIfNewer) {
    try {
      // OPTIMIZATION: Read existing rows once and build lookup map
      const existingRows = table.getAllRows();
      const existingMap = new Map();
      for (const row of existingRows) {
        existingMap.set(String(row[conflictKey]), row);
      }

      // OPTIMIZATION: Separate data into insert vs update buckets
      const rowsToInsert = [];
      const rowsToUpdate = [];
      let skipped = 0;

      for (const row of data) {
        const keyValue = String(row[conflictKey]);
        const existing = existingMap.get(keyValue);

        if (!existing) {
          rowsToInsert.push(row);
        } else {
          // Check timestamp if updateIfNewer is enabled
          if (updateIfNewer.enabled) {
            if (!this._shouldUpdate(existing, row, updateIfNewer.timestampColumn)) {
              skipped++;
              continue;
            }
          }

          // Get primary key for updates
          const pkField = table._keyField || 'ID';
          rowsToUpdate.push({ id: existing[pkField], data: row });
        }
      }

      // OPTIMIZATION: Bulk insert all new rows at once
      let inserted = 0;
      if (rowsToInsert.length > 0) {
        table.insertRows(rowsToInsert);
        inserted = rowsToInsert.length;
        this.logger.info(`[Loader] Bulk inserted ${inserted} new rows`);
      }

      // Batch update existing rows (still one-by-one but cached)
      let updated = 0;
      for (const { id, data } of rowsToUpdate) {
        table.updateRowById(id, data);
        updated++;
      }
      if (updated > 0) {
        this.logger.info(`[Loader] Updated ${updated} existing rows`);
      }

      return {
        success: true,
        inserted,
        updated,
        skipped,
        deleted: 0,
        total: data.length
      };
    } catch (error) {
      this.logger.error(`[Loader] Failed to upsert rows: ${error.message}`);
      throw new LoadError(`Failed to upsert rows: ${error.message}`, 'UPSERT_FAILED', {
        originalError: error.message
      });
    }
  }

  /**
   * Destructive strategy that purges existing table content before performing bulk insertion.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to insert.
   * @param {string} conflictKey Attribute for row identification.
   * @returns {Object} statistics.
   */
  _overwrite(table, data, conflictKey) {
    try {
      // Read all existing rows and delete them ALL (OVERWRITE = full replacement)
      const existingRows = table.getAllRows();
      let deleted = 0;
      const pkField = table._keyField || 'ID';

      // Delete all existing rows in reverse order to avoid index shifting
      for (let i = existingRows.length - 1; i >= 0; i--) {
        const row = existingRows[i];
        table.deleteRowById(row[pkField]);
        deleted++;
      }

      if (deleted > 0) {
        this.logger.info(`[Loader] Deleted ${deleted} existing rows`);
      }

      // OPTIMIZATION: Bulk insert all rows at once
      let inserted = 0;
      if (data.length > 0) {
        table.insertRows(data);
        inserted = data.length;
        this.logger.info(`[Loader] Bulk inserted ${inserted} rows`);
      }

      return {
        success: true,
        inserted,
        updated: 0,
        skipped: 0,
        deleted,
        total: data.length
      };
    } catch (error) {
      this.logger.error(`[Loader] Failed to overwrite rows: ${error.message}`);
      throw new LoadError(`Failed to overwrite rows: ${error.message}`, 'OVERWRITE_FAILED', {
        originalError: error.message
      });
    }
  }

  /**
   * Evaluates if an incoming record possesses a more recent timestamp than the existing persistence state.
   * @private
   * @param {Object} existing current database record.
   * @param {Object} incoming candidate update record.
   * @param {string} timestampColumn Name of the attribute containing temporal metadata.
   * @returns {boolean} True if the update should proceed.
   */
  _shouldUpdate(existing, incoming, timestampColumn) {
    if (!timestampColumn) {
      return true; // No timestamp comparison, always update
    }

    const existingTimestamp = existing[timestampColumn];
    const incomingTimestamp = incoming[timestampColumn];

    if (!existingTimestamp) {
      return true; // Existing has no timestamp, update
    }

    if (!incomingTimestamp) {
      return false; // Incoming has no timestamp, don't update
    }

    try {
      const existingDate = new Date(existingTimestamp);
      const incomingDate = new Date(incomingTimestamp);

      if (isNaN(existingDate.getTime()) || isNaN(incomingDate.getTime())) {
        this.logger.warn(`[Loader] Invalid timestamp values, skipping comparison`);
        return true; // Can't compare, default to update
      }

      return incomingDate > existingDate;
    } catch (error) {
      this.logger.warn(`[Loader] Timestamp comparison failed: ${error.message}`);
      return true; // Error comparing, default to update
    }
  }

  /**
   * Enforces structural requirements for the load configuration block.
   * @private
   * @param {Object} config target configuration segment.
   * @throws {LoadError} If mandatory fields (table, strategy, conflict key) are missing.
   */
  _validateLoadConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new LoadError('Load configuration must be an object', 'INVALID_CONFIG');
    }

    if (!config.targetTable || typeof config.targetTable !== 'string') {
      throw new LoadError(
        'Load configuration must specify targetTable (string)',
        'MISSING_TARGET_TABLE'
      );
    }

    if (!Loader.STRATEGIES.includes(config.conflictResolution)) {
      throw new LoadError(
        `Invalid conflict resolution strategy: ${config.conflictResolution}. Valid: ${Loader.STRATEGIES.join(', ')}`,
        'INVALID_STRATEGY',
        { conflictResolution: config.conflictResolution }
      );
    }

    // Validate conflict key for strategies that require it
    if (['UPDATE_ONLY', 'UPSERT', 'OVERWRITE'].includes(config.conflictResolution)) {
      if (!config.conflictKey || typeof config.conflictKey !== 'string') {
        throw new LoadError(
          `Conflict resolution strategy "${config.conflictResolution}" requires a conflictKey`,
          'MISSING_CONFLICT_KEY',
          { conflictResolution: config.conflictResolution }
        );
      }
    }
  }
}

export { Loader };
