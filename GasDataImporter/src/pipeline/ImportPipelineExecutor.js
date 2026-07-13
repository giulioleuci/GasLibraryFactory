import { ImportConfiguration } from '../ImportConfiguration.js';
import { ImportError } from '../internal/errors/ImportError.js';

export class ImportPipelineExecutor {
  constructor(facade) {
    this.facade = facade;
  }

  runImport(recipe, options = {}) {
    const startTime = Date.now();
    const dryRun = options.dryRun === true;
    const maxRetries = options.maxRetries || 3;
    const jobId = options.jobId || null;
    const postTransform = typeof options.postTransform === 'function' ? options.postTransform : null;

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
      this.facade.logger.error(`[ImportEngine] Import failed after ${duration}ms: ${error.message}`);

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
