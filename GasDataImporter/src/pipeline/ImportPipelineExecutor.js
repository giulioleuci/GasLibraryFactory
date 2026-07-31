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
   * Advances a checkpoint by one bounded unit of work: a single extraction
   * window (for cursor-aware source strategies) or a whole-stage step
   * (TRANSFORM, LOAD) for stages that aren't chunked. The recipe must be
   * re-passed on every call — it is intentionally not part of the
   * serializable checkpoint, to keep checkpoints small (`PropertiesService`
   * has per-key size limits) and because the recipe is normally already
   * available to the caller (e.g. `JobHandlerParams` in ALDO's `JobRunnerLib`
   * integration).
   *
   * Extract-phase behavior depends on `SourceStrategy.supportsCursor()`:
   * cursor-aware strategies (currently only `SheetByIdStrategy`) extract one
   * bounded window per call via `extractChunk`. Strategies that don't
   * support cursors fall back to a compatibility path: the entire source is
   * extracted in a single call via `extract()`, reported as immediately
   * exhausted.
   * @param {Object} recipe Import configuration — must match `checkpoint.recipeName`.
   * @param {ImportCheckpoint} checkpoint Checkpoint to resume from.
   * @param {Object} [budget={}] Per-call work limits.
   * @param {number} [budget.maxRows=500] Maximum rows to extract in this call.
   * @returns {{checkpoint: ImportCheckpoint, done: boolean}} Advanced checkpoint and completion flag.
   * @throws {ConfigurationError} If the recipe fails validation.
   * @throws {Error} If `checkpoint.recipeName` doesn't match the recipe being resumed.
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
      const buffer = (checkpoint.buffer || []).concat(rows);
      const counters = {
        ...checkpoint.counters,
        extracted: checkpoint.counters.extracted + rows.length
      };
      const nextStage = exhausted ? 'TRANSFORM' : 'EXTRACT';
      return {
        checkpoint: new ImportCheckpoint(
          checkpoint.recipeName,
          nextStage,
          cursor,
          checkpoint.rowOffset,
          checkpoint.loadOffset,
          counters,
          buffer,
          false
        ),
        done: false
      };
    }

    if (checkpoint.stage === 'TRANSFORM') {
      const transformConfig = config.getTransform();
      const transformed = this.facade._transformer.transform(
        checkpoint.buffer || [],
        transformConfig
      );
      const counters = { ...checkpoint.counters, transformed: transformed.length };
      return {
        checkpoint: new ImportCheckpoint(
          checkpoint.recipeName,
          'LOAD',
          checkpoint.sourceCursor,
          checkpoint.rowOffset,
          checkpoint.loadOffset,
          counters,
          transformed,
          false
        ),
        done: false
      };
    }

    if (checkpoint.stage === 'LOAD') {
      const loadConfig = config.getLoad();
      const isFirstChunk = checkpoint.loadOffset === 0;
      const result = this.facade._loader.loadChunk(checkpoint.buffer || [], loadConfig, {
        isFirstChunk
      });
      const counters = {
        ...checkpoint.counters,
        inserted: checkpoint.counters.inserted + result.inserted,
        updated: checkpoint.counters.updated + result.updated,
        skipped: checkpoint.counters.skipped + result.skipped,
        deleted: checkpoint.counters.deleted + result.deleted
      };
      const doneCheckpoint = new ImportCheckpoint(
        checkpoint.recipeName,
        'DONE',
        checkpoint.sourceCursor,
        checkpoint.rowOffset,
        checkpoint.loadOffset + 1,
        counters,
        null,
        true
      );
      return { checkpoint: doneCheckpoint, done: true };
    }

    // Already DONE (or an unrecognized stage on a foreign checkpoint) — nothing left to do.
    return { checkpoint, done: true };
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
