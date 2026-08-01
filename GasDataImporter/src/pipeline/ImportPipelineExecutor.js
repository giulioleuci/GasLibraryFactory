import { ImportConfiguration } from '../ImportConfiguration.js';
import { ImportError } from '../internal/errors/ImportError.js';
import { ImportCheckpoint } from '../ImportCheckpoint.js';

export class ImportPipelineExecutor {
  constructor(facade) {
    this.facade = facade;
  }

  /**
   * Creates the initial checkpoint for a resumable/checkpointed import run,
   * without executing any pipeline phase yet. Pair with `runImportChunk` in
   * a loop (persisting the checkpoint to `PropertiesService` between GAS
   * execution windows via `JobRunnerLib`) to drive the recipe to completion
   * across multiple bounded chunks instead of one synchronous `runImport`.
   * @param {Object} recipe Import configuration (see ImportConfiguration).
   * @param {Object} [_options={}] Reserved for future use.
   * @returns {ImportCheckpoint} Initial checkpoint at the EXTRACT stage.
   * @throws {ConfigurationError} If the recipe fails validation.
   */
  startImport(recipe, _options = {}) {
    const config = new ImportConfiguration(recipe, this.facade.logger);
    this.facade.logger.info(`[ImportEngine] startImport: ${config.getName()}`);
    return ImportCheckpoint.initial(config.getName());
  }

  /**
   * Advances a checkpoint by one bounded unit of work. The recipe must be
   * re-passed on every call — it is intentionally not part of the
   * serializable checkpoint, to keep checkpoints small (`PropertiesService`
   * has per-key size limits) and because the recipe is normally already
   * available to the caller (e.g. `JobHandlerParams` in ALDO's `JobRunnerLib`
   * integration).
   *
   * Unlike the original design (extract everything into the buffer, then
   * transform the whole buffer, then load the whole buffer), each call now
   * does bounded work and `checkpoint.buffer` never holds more than roughly
   * one `maxRows`-sized batch at rest between calls (for the cursor-aware
   * case) — otherwise `checkpoint.buffer` could grow to the size of the
   * entire dataset, which won't fit in `PropertiesService` (~9KB per key,
   * ~500KB total), and TRANSFORM/LOAD would each still run unbounded in one
   * call, defeating the point of chunking:
   *
   * - **`EXTRACT`** (entered when `checkpoint.buffer` is empty and
   *   extraction isn't exhausted): pulls one bounded window of rows (see
   *   "Cursor-aware extraction" below), immediately transforms *that chunk*
   *   (`Transformer.transform` is a pure per-row mapping, so transforming a
   *   bounded slice is safe), and stores the transformed, load-ready rows as
   *   `checkpoint.buffer`. Moves to `LOAD`. Whether the source is now fully
   *   consumed is remembered in `checkpoint.rowOffset` (repurposed as a 0/1
   *   "extraction exhausted" flag — the field was previously reserved and
   *   unused) so the `LOAD` branch below can decide, without re-extracting,
   *   whether there is more to pull after this buffer is loaded.
   * - **`LOAD`** (entered when `checkpoint.buffer` has pending rows): loads
   *   the buffer via `Loader.loadChunk` (already handles arbitrary-size
   *   input, since it's already one bounded chunk) and clears the buffer.
   *   `isFirstChunk` is true only on the very first `LOAD` call of the
   *   entire run that actually carries a non-empty buffer
   *   (`checkpoint.loadOffset === 0`); `loadOffset` only increments when the
   *   chunk being loaded is non-empty — an empty chunk (e.g. a leading block
   *   of rows that were all rejected by transform validation, or a genuinely
   *   empty extracted window) does NOT consume the "first chunk" slot,
   *   because `Loader.loadChunk` short-circuits on `data.length === 0`
   *   before OVERWRITE's purge-then-insert logic ever runs — if `loadOffset`
   *   advanced anyway, the table would never get purged for a run whose
   *   first real data happened to arrive after an empty chunk. If
   *   extraction was already exhausted, moves to `DONE`; otherwise moves
   *   back to `EXTRACT` to pull the next bounded chunk.
   *
   * There is no standalone `TRANSFORM` stage: an earlier design produced one
   * (transforming the whole accumulated buffer in its own step), but that
   * design was replaced before ever shipping — transform now happens inline
   * during `EXTRACT`, on the bounded chunk — so no checkpoint constructed by
   * this pipeline (`startImport`, or any transition below) ever carries
   * `stage: 'TRANSFORM'`. A checkpoint whose `stage` isn't `EXTRACT`, `LOAD`,
   * or `DONE` is therefore foreign/corrupt and `runImportChunk` throws
   * rather than silently treating it as complete.
   *
   * Extract-phase behavior depends on `SourceStrategy.supportsCursor()`:
   * cursor-aware strategies (currently only `SheetByIdStrategy`) extract one
   * bounded window per call via `extractChunk`, so the streaming/
   * bounded-buffer guarantee above holds for them. Strategies that don't
   * support cursors fall back to a compatibility path: the entire source is
   * extracted (and, in this call, transformed) in a single call, reported as
   * immediately exhausted — so the bounded-buffer guarantee does NOT hold
   * for non-cursor sources; only `SheetById` truly streams.
   * @param {Object} recipe Import configuration — must match `checkpoint.recipeName`.
   * @param {ImportCheckpoint} checkpoint Checkpoint to resume from.
   * @param {Object} [budget={}] Per-call work limits.
   * @param {number} [budget.maxRows=500] Maximum rows to extract in this call.
   * @returns {{checkpoint: ImportCheckpoint, done: boolean}} Advanced checkpoint and completion flag.
   * @throws {ConfigurationError} If the recipe fails validation.
   * @throws {Error} If `checkpoint.recipeName` doesn't match the recipe being resumed.
   * @throws {ImportError} `UNRECOGNIZED_CHECKPOINT_STAGE` if `checkpoint.stage` isn't
   *   one of `EXTRACT`, `LOAD`, or `DONE` (a foreign/corrupt checkpoint).
   */
  runImportChunk(recipe, checkpoint, budget = {}) {
    const maxRows = budget.maxRows || 500;
    const config = new ImportConfiguration(recipe, this.facade.logger);
    ImportCheckpoint.assertMatches(checkpoint, config.getName());

    if (checkpoint.stage === 'EXTRACT') {
      const sourceConfig = config.getSource();
      const strategy = this.facade._sourceFactory.createStrategy(sourceConfig.type);
      let rows;
      let cursor = checkpoint.sourceCursor;
      let exhausted;
      if (strategy.supportsCursor()) {
        const result = strategy.extractChunk(
          sourceConfig.config,
          cursor ?? { rowOffset: 0, headers: null },
          maxRows
        );
        rows = result.rows;
        cursor = result.nextCursor;
        exhausted = result.exhausted;
      } else {
        rows = strategy.extract(sourceConfig.config);
        exhausted = true;
      }

      // Transform this bounded chunk immediately — Transformer.transform is a
      // pure per-row mapping, not an aggregate, so transforming a slice is
      // safe and keeps the checkpoint buffer to one chunk's worth of data.
      const transformConfig = config.getTransform();
      const transformedChunk = this.facade._transformer.transform(rows, transformConfig);

      const counters = {
        ...checkpoint.counters,
        extracted: checkpoint.counters.extracted + rows.length,
        transformed: checkpoint.counters.transformed + transformedChunk.length
      };

      return {
        checkpoint: new ImportCheckpoint(
          checkpoint.recipeName,
          'LOAD',
          cursor,
          exhausted ? 1 : 0, // repurposed: 0/1 "extraction exhausted" flag (see method doc)
          checkpoint.loadOffset,
          counters,
          transformedChunk,
          false
        ),
        done: false
      };
    }

    if (checkpoint.stage === 'LOAD') {
      const loadConfig = config.getLoad();
      const buffer = checkpoint.buffer || [];
      const isFirstChunk = checkpoint.loadOffset === 0;
      const result = this.facade._loader.loadChunk(buffer, loadConfig, {
        isFirstChunk
      });
      const counters = {
        ...checkpoint.counters,
        inserted: checkpoint.counters.inserted + result.inserted,
        updated: checkpoint.counters.updated + result.updated,
        skipped: checkpoint.counters.skipped + result.skipped,
        deleted: checkpoint.counters.deleted + result.deleted
      };
      // Only a chunk that actually carried load-ready rows consumes the
      // "first chunk" slot (see method doc) — an empty chunk leaves
      // loadOffset untouched so the next chunk with real data is still
      // treated as the first one, and OVERWRITE still purges exactly once.
      const newLoadOffset = buffer.length > 0 ? checkpoint.loadOffset + 1 : checkpoint.loadOffset;
      const extractionExhausted = checkpoint.rowOffset === 1;

      if (extractionExhausted) {
        const doneCheckpoint = new ImportCheckpoint(
          checkpoint.recipeName,
          'DONE',
          checkpoint.sourceCursor,
          checkpoint.rowOffset,
          newLoadOffset,
          counters,
          null,
          true
        );
        return { checkpoint: doneCheckpoint, done: true };
      }

      return {
        checkpoint: new ImportCheckpoint(
          checkpoint.recipeName,
          'EXTRACT',
          checkpoint.sourceCursor,
          checkpoint.rowOffset,
          newLoadOffset,
          counters,
          null,
          false
        ),
        done: false
      };
    }

    if (checkpoint.stage === 'DONE') {
      // Already DONE — nothing left to do; safe to call again idempotently.
      return { checkpoint, done: true };
    }

    // No stage this pipeline produces (EXTRACT/LOAD/DONE) matches — this is a
    // foreign or corrupt checkpoint (e.g. a stale 'TRANSFORM'-stage checkpoint
    // from a design this pipeline never shipped). Fail loudly rather than
    // silently treating unknown progress as complete.
    throw new ImportError(
      `Cannot resume checkpoint with unrecognized stage "${checkpoint.stage}" for recipe "${checkpoint.recipeName}"; expected one of EXTRACT, LOAD, DONE.`,
      'UNRECOGNIZED_CHECKPOINT_STAGE',
      { stage: checkpoint.stage, recipeName: checkpoint.recipeName }
    );
  }

  runImport(recipe, options = {}) {
    const startTime = Date.now();
    const dryRun = options.dryRun === true;
    const maxRetries = options.maxRetries || 3;
    const jobId = options.jobId || null;
    const postTransform =
      typeof options.postTransform === 'function' ? options.postTransform : null;

    this.facade.logger.info(`[ImportEngine] Starting import: ${recipe.name || 'Unnamed'}`);
    if (dryRun) {
      this.facade.logger.warn('[ImportEngine] DRY RUN mode - data will not be persisted');
    }

    try {
      // Validate and parse configuration
      const config = new ImportConfiguration(recipe, this.facade.logger);
      this.facade.logger.info(
        `[ImportEngine] Configuration validated: ${JSON.stringify(config.getSummary())}`
      );

      // Execute ETL pipeline with optional resilience
      const executeWithRetry = this.facade._exceptionService
        ? () =>
            this.facade._exceptionService.executeWithRetry(
              () => this._executePipeline(config, dryRun, jobId, postTransform),
              {},
              maxRetries
            )
        : () => this._executePipeline(config, dryRun, jobId, postTransform);

      const result = executeWithRetry();

      const duration = Date.now() - startTime;
      this.facade.logger.info(`[ImportEngine] Import completed successfully in ${duration}ms`);

      return {
        success: true,
        importName: config.getName(),
        durationMs: duration,
        ...result
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.facade.logger.error(
        `[ImportEngine] Import failed after ${duration}ms: ${error.message}`
      );

      if (error instanceof ImportError) {
        throw error;
      }

      throw new ImportError(`Import failed: ${error.message}`, 'IMPORT_FAILED', {
        recipeName: recipe.name,
        durationMs: duration,
        originalError: error.message
      });
    }
  }

  _executePipeline(config, dryRun, jobId = null, postTransform = null) {
    // Register job with monitor if provided
    if (this.facade._monitor && jobId) {
      this.facade._monitor.registerJob(jobId);
      this.facade._monitor.startJob(jobId);
    }

    try {
      // Phase 1: Extract (0-33%)
      this.facade._monitor?.logStepStart(jobId, 'Extract');
      this.facade._monitor?.updateProgress(jobId, 5, 'Extracting data...');
      const extractedData = this._executeExtract(config);
      this.facade._monitor?.logStepComplete(jobId, 'Extract', true);
      this.facade._monitor?.updateProgress(jobId, 33, `Extracted ${extractedData.length} rows`);

      // Phase 2: Transform (33-66%)
      this.facade._monitor?.logStepStart(jobId, 'Transform');
      this.facade._monitor?.updateProgress(jobId, 40, 'Transforming data...');
      let transformedData = this._executeTransform(extractedData, config);
      if (postTransform) {
        transformedData = postTransform(transformedData, config);
      }
      this.facade._monitor?.logStepComplete(jobId, 'Transform', true);
      this.facade._monitor?.updateProgress(jobId, 66, `Transformed ${transformedData.length} rows`);

      // Phase 3: Load (66-100%, skip in dry run mode)
      this.facade._monitor?.logStepStart(jobId, 'Load');
      this.facade._monitor?.updateProgress(
        jobId,
        70,
        dryRun ? 'Dry run - skipping load...' : 'Loading data...'
      );
      const loadResult = dryRun
        ? this._generateDryRunLoadResult(transformedData)
        : this._executeLoad(transformedData, config);
      this.facade._monitor?.logStepComplete(jobId, 'Load', true);
      this.facade._monitor?.updateProgress(jobId, 100, 'Complete');

      // Mark job as complete
      this.facade._monitor?.completeJob(jobId, `Imported ${loadResult.inserted || 0} rows`);

      return {
        extract: {
          rowsExtracted: extractedData.length,
          rowCount: extractedData.length
        },
        transform: {
          rowsTransformed: transformedData.length,
          recordsProcessed: transformedData.length
        },
        load: {
          ...loadResult,
          recordsProcessed: loadResult.total,
          failed: 0
        }
      };
    } catch (error) {
      // Mark job as failed if monitor is present
      this.facade._monitor?.setError(jobId, error);
      throw error;
    }
  }

  _executeExtract(config) {
    this.facade.logger.info('[ImportEngine] Phase 1: EXTRACT');

    const sourceConfig = config.getSource();
    const strategy = this.facade._sourceFactory.createStrategy(sourceConfig.type);
    const data = strategy.extract(sourceConfig.config);

    this.facade.logger.info(`[ImportEngine] Extracted ${data.length} rows`);
    return data;
  }

  _executeTransform(data, config) {
    this.facade.logger.info('[ImportEngine] Phase 2: TRANSFORM');

    const transformConfig = config.getTransform();
    const transformedData = this.facade._transformer.transform(data, transformConfig);

    this.facade.logger.info(`[ImportEngine] Transformed ${transformedData.length} rows`);
    return transformedData;
  }

  _executeLoad(data, config) {
    this.facade.logger.info('[ImportEngine] Phase 3: LOAD');

    const loadConfig = config.getLoad();
    const result = this.facade._loader.load(data, loadConfig);

    this.facade.logger.info(`[ImportEngine] Load complete: ${JSON.stringify(result)}`);
    return result;
  }

  _generateDryRunLoadResult(data) {
    this.facade.logger.info('[ImportEngine] Phase 3: LOAD (DRY RUN - skipped)');

    return {
      success: true,
      inserted: 0,
      updated: 0,
      skipped: 0,
      deleted: 0,
      total: data.length,
      dryRun: true
    };
  }
}
