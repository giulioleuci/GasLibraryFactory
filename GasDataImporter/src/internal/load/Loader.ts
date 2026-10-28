import type {
  ImportRow,
  ImporterLogger,
  LoadConfig,
  UpdateIfNewer,
  ImportDatabase,
  ImportTable,
  LoadResult
} from '../../types.js';
/**
 * @fileoverview Data loading engine with conflict resolution for the ETL pipeline (Load phase)
 * @author GasLibraryFactory
 */

import { LoadError } from '../errors/LoadError.js';

/**
 * Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.
 * @class
 */
class Loader<Row extends object = ImportRow> {
  declare logger: ImporterLogger;
  declare _db: ImportDatabase<Row>;

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
  constructor(logger: ImporterLogger, databaseService: ImportDatabase<Row>) {
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
  load(data: Row[], loadConfig: LoadConfig<Row>) {
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

    this.logger.debug(
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

      const table = this._db.tables[targetTable]!;

      // Execute strategy (OVERWRITE always purges in a single-shot load)
      const result = this._executeStrategy(
        table,
        data,
        conflictResolution,
        conflictKey,
        updateIfNewer,
        this._overwrite
      );

      // Save changes to spreadsheet
      this.logger.debug('[Loader] Saving changes to database...');
      this._db.save();

      this.logger.debug(`[Loader] Load complete: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      if (error instanceof LoadError) {
        throw error;
      }

      this.logger.error(`[Loader] Load failed: ${(error as Error).message}`);
      throw new LoadError(`Failed to load data: ${(error as Error).message}`, 'LOAD_FAILED', {
        targetTable,
        conflictResolution,
        originalError: (error as Error).message
      });
    }
  }

  /**
   * Executes a single load chunk for a resumable/checkpointed import run.
   * Reuses the exact same conflict-resolution strategies as {@link Loader#load}
   * (INSERT_ONLY/UPDATE_ONLY/UPSERT are naturally idempotent if the same chunk
   * is re-applied after a resume), except OVERWRITE, whose destructive purge
   * only runs on `isFirstChunk` — subsequent chunks within the same run append
   * **unconditionally** (no conflict-key dedupe), matching {@link
   * Loader#_overwrite}'s single-shot semantics exactly: `load()` with
   * OVERWRITE inserts every row unconditionally in one call, so a chunked
   * OVERWRITE run must insert every row across all its chunks unconditionally
   * too, not silently drop rows that share (or omit) a conflict-key value
   * with a row from an earlier chunk. Always commits via `this._db.save()`
   * at the end, which is the durable checkpoint boundary a resumed run picks
   * up from.
   * @param {Array<Object>} data Transformed row collection for this chunk only.
   * @param {Object} loadConfig persistence parameters (see {@link Loader#load}).
   * @param {Object} state Chunk-position metadata.
   * @param {boolean} state.isFirstChunk True for the first LOAD chunk of a run.
   * @returns {Object} Operational statistics for this chunk.
   * @throws {LoadError} If database is inaccessible or strategy execution fails.
   */
  loadChunk(data: Row[], loadConfig: LoadConfig<Row>, { isFirstChunk }: { isFirstChunk: boolean }) {
    if (!Array.isArray(data)) {
      throw new LoadError('Data must be an array', 'INVALID_DATA', { dataType: typeof data });
    }

    this._validateLoadConfig(loadConfig);

    const targetTable = loadConfig.targetTable;
    const conflictResolution = loadConfig.conflictResolution;
    const conflictKey = loadConfig.conflictKey;
    const updateIfNewer = loadConfig.updateIfNewer || {};

    this.logger.debug(
      `[Loader] Loading chunk of ${data.length} rows into table "${targetTable}" using strategy "${conflictResolution}" (isFirstChunk=${isFirstChunk})`
    );

    try {
      if (!this._db.tables[targetTable]) {
        throw new LoadError(
          `Target table "${targetTable}" not found in database`,
          'TABLE_NOT_FOUND',
          { targetTable, availableTables: Object.keys(this._db.tables) }
        );
      }

      const table = this._db.tables[targetTable]!;

      // OVERWRITE purges only on the first chunk; later chunks append
      // unconditionally (see _appendAll JSDoc).
      const result = this._executeStrategy(
        table,
        data,
        conflictResolution,
        conflictKey,
        updateIfNewer,
        isFirstChunk ? this._overwrite : this._appendAll
      );

      // Commit boundary: flush after every chunk so a resumed run picks up
      // from durable state.
      this.logger.debug('[Loader] Saving chunk to database...');
      this._db.save();

      this.logger.debug(`[Loader] Chunk load complete: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      if (error instanceof LoadError) {
        throw error;
      }

      this.logger.error(`[Loader] Chunk load failed: ${(error as Error).message}`);
      throw new LoadError(`Failed to load data chunk: ${(error as Error).message}`, 'LOAD_FAILED', {
        targetTable,
        conflictResolution,
        originalError: (error as Error).message
      });
    }
  }

  /**
   * Dispatches the conflict-resolution strategy, returning zeroed statistics
   * for empty data. Shared by {@link Loader#load} and {@link Loader#loadChunk}.
   * @private
   * @param {Object} table Target persistence table.
   * @param {Array<Object>} data Records to process (may be empty).
   * @param {string} strategy Resolution strategy (INSERT_ONLY|UPDATE_ONLY|UPSERT|OVERWRITE).
   * @param {string} conflictKey Attribute used for collision detection.
   * @param {Object} updateIfNewer Optional timestamp comparison rules.
   * @param {Function} overwriteHandler OVERWRITE implementation: `_overwrite`
   *   for a single-shot load or the first chunk of a chunked run, `_appendAll`
   *   for later chunks (see {@link Loader#_appendAll}).
   * @returns {Object} Operational statistics.
   * @throws {LoadError} If the strategy is unknown.
   */
  _executeStrategy(
    table: ImportTable<Row>,
    data: Row[],
    strategy: string,
    conflictKey: string | undefined,
    updateIfNewer: UpdateIfNewer<Row>,
    overwriteHandler: (table: ImportTable<Row>, data: Row[], conflictKey?: string) => LoadResult
  ) {
    if (data.length === 0) {
      return { success: true, inserted: 0, updated: 0, skipped: 0, deleted: 0, total: 0 };
    }

    switch (strategy) {
      case 'INSERT_ONLY':
        return this._insertOnly(table, data, conflictKey);

      case 'UPDATE_ONLY':
        return this._updateOnly(table, data, conflictKey, updateIfNewer);

      case 'UPSERT':
        return this._upsert(table, data, conflictKey, updateIfNewer);

      case 'OVERWRITE':
        return overwriteHandler.call(this, table, data, conflictKey);

      default:
        throw new LoadError(
          `Unknown conflict resolution strategy: ${strategy}`,
          'UNKNOWN_STRATEGY',
          { conflictResolution: strategy }
        );
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
  _insertOnly(table: ImportTable<Row>, data: Row[], conflictKey: string | undefined) {
    try {
      // OPTIMIZATION: Read existing keys once
      const existingRows = table.getAllRows();
      const existingKeys = new Set(
        existingRows.map((row) => String((row as ImportRow)[conflictKey as string]))
      );

      // OPTIMIZATION: Separate data into insert vs skip buckets
      const rowsToInsert = [];
      let skipped = 0;

      for (const row of data) {
        const keyValue = String((row as ImportRow)[conflictKey as string]);
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
        this.logger.debug(`[Loader] Bulk inserted ${inserted} new rows`);
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
      this.logger.error(`[Loader] Failed to insert rows: ${(error as Error).message}`);
      throw new LoadError(`Failed to insert rows: ${(error as Error).message}`, 'INSERT_FAILED', {
        originalError: (error as Error).message
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
  _updateOnly(
    table: ImportTable<Row>,
    data: Row[],
    conflictKey: string | undefined,
    updateIfNewer: UpdateIfNewer<Row>
  ) {
    try {
      // OPTIMIZATION: Read existing rows once and build lookup map
      const existingRows = table.getAllRows();
      const existingMap = new Map();
      for (const row of existingRows) {
        existingMap.set(String((row as ImportRow)[conflictKey as string]), row);
      }

      let updated = 0;
      let skipped = 0;

      // OPTIMIZATION: Process updates in batch
      for (const row of data) {
        const keyValue = String((row as ImportRow)[conflictKey as string]);
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
          table.updateRowById!((existing as ImportRow)[pkField], row);
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
      this.logger.error(`[Loader] Failed to update rows: ${(error as Error).message}`);
      throw new LoadError(`Failed to update rows: ${(error as Error).message}`, 'UPDATE_FAILED', {
        originalError: (error as Error).message
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
  _upsert(
    table: ImportTable<Row>,
    data: Row[],
    conflictKey: string | undefined,
    updateIfNewer: UpdateIfNewer<Row>
  ) {
    try {
      // OPTIMIZATION: Read existing rows once and build lookup map
      const existingRows = table.getAllRows();
      const existingMap = new Map();
      for (const row of existingRows) {
        existingMap.set(String((row as ImportRow)[conflictKey as string]), row);
      }

      // OPTIMIZATION: Separate data into insert vs update buckets
      const rowsToInsert = [];
      const rowsToUpdate = [];
      let skipped = 0;

      for (const row of data) {
        const keyValue = String((row as ImportRow)[conflictKey as string]);
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
          rowsToUpdate.push({ id: (existing as ImportRow)[pkField], data: row });
        }
      }

      // OPTIMIZATION: Bulk insert all new rows at once
      let inserted = 0;
      if (rowsToInsert.length > 0) {
        table.insertRows(rowsToInsert);
        inserted = rowsToInsert.length;
        this.logger.debug(`[Loader] Bulk inserted ${inserted} new rows`);
      }

      // Batch update existing rows (still one-by-one but cached)
      let updated = 0;
      for (const { id, data } of rowsToUpdate) {
        table.updateRowById!(id, data);
        updated++;
      }
      if (updated > 0) {
        this.logger.debug(`[Loader] Updated ${updated} existing rows`);
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
      this.logger.error(`[Loader] Failed to upsert rows: ${(error as Error).message}`);
      throw new LoadError(`Failed to upsert rows: ${(error as Error).message}`, 'UPSERT_FAILED', {
        originalError: (error as Error).message
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
  _overwrite(table: ImportTable<Row>, data: Row[], conflictKey: string | undefined) {
    try {
      // Read all existing rows and delete them ALL (OVERWRITE = full replacement)
      const existingRows = table.getAllRows();
      let deleted = 0;
      const pkField = table._keyField || 'ID';

      // Delete all existing rows in reverse order to avoid index shifting
      for (let i = existingRows.length - 1; i >= 0; i--) {
        const row = existingRows[i];
        table.deleteRowById!((row as ImportRow)[pkField]);
        deleted++;
      }

      if (deleted > 0) {
        this.logger.debug(`[Loader] Deleted ${deleted} existing rows`);
      }

      // OPTIMIZATION: Bulk insert all rows at once
      let inserted = 0;
      if (data.length > 0) {
        table.insertRows(data);
        inserted = data.length;
        this.logger.debug(`[Loader] Bulk inserted ${inserted} rows`);
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
      this.logger.error(`[Loader] Failed to overwrite rows: ${(error as Error).message}`);
      throw new LoadError(
        `Failed to overwrite rows: ${(error as Error).message}`,
        'OVERWRITE_FAILED',
        {
          originalError: (error as Error).message
        }
      );
    }
  }

  /**
   * Unconditional bulk-insert with no conflict-key dedupe and no purge —
   * used exclusively for chunks 2+ of a chunked OVERWRITE run (see
   * {@link Loader#loadChunk}). Chunk 1 already purged the table via
   * {@link Loader#_overwrite}; later chunks must simply append every row
   * they carry, the same way `_overwrite` itself inserts everything
   * unconditionally in a single-shot `load()` call. Unlike
   * {@link Loader#_insertOnly}, this never skips a row because its
   * conflict-key value collides with (or is blank/missing like) another
   * row already in the table — that dedupe behavior is correct for
   * INSERT_ONLY's own semantics but wrong here, since it would silently
   * drop legitimate OVERWRITE rows that a single-shot `load()` call would
   * have inserted without question.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to insert unconditionally.
   * @returns {Object} statistics.
   */
  _appendAll(table: ImportTable<Row>, data: Row[]) {
    try {
      let inserted = 0;
      if (data.length > 0) {
        table.insertRows(data);
        inserted = data.length;
        this.logger.debug(
          `[Loader] Bulk appended ${inserted} rows unconditionally (chunked OVERWRITE, non-first chunk)`
        );
      }

      return {
        success: true,
        inserted,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: data.length
      };
    } catch (error) {
      this.logger.error(`[Loader] Failed to append rows: ${(error as Error).message}`);
      throw new LoadError(`Failed to append rows: ${(error as Error).message}`, 'APPEND_FAILED', {
        originalError: (error as Error).message
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
  _shouldUpdate(existing: Row, incoming: Row, timestampColumn: string | undefined) {
    if (!timestampColumn) {
      return true; // No timestamp comparison, always update
    }

    const existingTimestamp = (existing as ImportRow)[timestampColumn];
    const incomingTimestamp = (incoming as ImportRow)[timestampColumn];

    if (!existingTimestamp) {
      return true; // Existing has no timestamp, update
    }

    if (!incomingTimestamp) {
      return false; // Incoming has no timestamp, don't update
    }

    try {
      const existingDate = new Date(existingTimestamp as string | number);
      const incomingDate = new Date(incomingTimestamp as string | number);

      if (isNaN(existingDate.getTime()) || isNaN(incomingDate.getTime())) {
        this.logger.warn(`[Loader] Invalid timestamp values, skipping comparison`);
        return true; // Can't compare, default to update
      }

      return incomingDate > existingDate;
    } catch (error) {
      this.logger.warn(`[Loader] Timestamp comparison failed: ${(error as Error).message}`);
      return true; // Error comparing, default to update
    }
  }

  /**
   * Enforces structural requirements for the load configuration block.
   * @private
   * @param {Object} config target configuration segment.
   * @throws {LoadError} If mandatory fields (table, strategy, conflict key) are missing.
   */
  _validateLoadConfig(config: LoadConfig<Row>) {
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
