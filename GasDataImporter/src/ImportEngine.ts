import type { SourceFactoryAdapter, ImportTransformer } from './types.js';
import type {
  ImporterLogger,
  ImportDatabase,
  ImporterExpression,
  SourceConstructor,
  ImportMonitor,
  RetryExecutor
} from './types.js';
import type { ImportPipelineExecutor as PipelineMethods } from './pipeline/ImportPipelineExecutor.js';
/**
 * @fileoverview Main facade for the GasDataImporter ETL pipeline
 * @author GasLibraryFactory
 */

import { ImportConfiguration } from './ImportConfiguration.js';
import { SourceStrategyFactory } from './internal/extract-strategies/SourceStrategyFactory.js';
import { Transformer } from './pipeline/Transformer.js';
import { Loader } from './internal/load/Loader.js';
import type { ImportError } from './internal/errors/ImportError.js';
import { ImportPipelineExecutor } from './pipeline/ImportPipelineExecutor.js';

/**
 * Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.
 * @class
 */
interface ImportEngine extends Pick<
  PipelineMethods,
  | 'runImport'
  | '_executePipeline'
  | '_executeExtract'
  | '_executeTransform'
  | '_executeLoad'
  | '_generateDryRunLoadResult'
  | 'startImport'
  | 'runImportChunk'
> {}

class ImportEngine {
  declare logger: ImporterLogger;
  declare _exceptionService: RetryExecutor | null;
  declare _monitor: ImportMonitor | null;
  declare _sourceFactory: SourceFactoryAdapter;
  declare _transformer: ImportTransformer;
  declare _loader: Loader;
  declare _pipelineExecutor: ImportPipelineExecutor;

  /**
   * Initializes the ETL engine with required service dependencies and optional feature extensions.
   * @param {Object} logger Diagnostic output interface (LoggerService).
   * @param {Object} driveService GoogleApiWrapper facade for file operations.
   * @param {Object} spreadsheetService GoogleApiWrapper facade for sheet data.
   * @param {Object} databaseService SheetDBLib persistence interface.
   * @param {Object|null} [expressionEngine=null] Optional engine for calculated fields.
   * @param {Object|null} [exceptionService=null] Optional resilience engine for automatic retries.
   * @param {Object|null} [monitor=null] Optional service for real-time process visualization.
   */
  constructor(
    logger: ImporterLogger,
    driveService: object,
    spreadsheetService: object,
    databaseService: ImportDatabase,
    expressionEngine: ImporterExpression | null = null,
    exceptionService: RetryExecutor | null = null,
    monitor: ImportMonitor | null = null
  ) {
    this.logger = logger;
    this._exceptionService = exceptionService;

    /**
     * Optional process monitoring service for visualization.
     * @private
     * @type {Object|null}
     */
    this._monitor = monitor;

    // Initialize ETL components
    this._sourceFactory = new SourceStrategyFactory(logger, driveService, spreadsheetService);
    this._transformer = new Transformer(logger, expressionEngine);
    this._loader = new Loader(logger, databaseService);

    this.logger.debug('[ImportEngine] Initialized successfully');

    // Facade Delegation
    this._pipelineExecutor = new ImportPipelineExecutor(this);

    const pipelineMethods = [
      'runImport',
      '_executePipeline',
      '_executeExtract',
      '_executeTransform',
      '_executeLoad',
      '_generateDryRunLoadResult',
      'startImport',
      'runImportChunk'
    ] as const;
    pipelineMethods.forEach((m) => {
      (this[m] as PipelineMethods[typeof m]) = this._pipelineExecutor[m].bind(
        this._pipelineExecutor
      );
    });
  }

  /**
   * Registers a custom source-extraction strategy and whitelists its type for recipe validation.
   * @param {string} name Source type identifier.
   * @param {Function} strategyClass Strategy class implementing the source-extraction contract.
   */
  registerCustomSource(name: string, strategyClass: SourceConstructor) {
    this.logger.debug(`[ImportEngine] Registering custom source strategy: ${name}`);
    this._sourceFactory.registerStrategy(name, strategyClass);
    // Also whitelist the type for recipe validation — otherwise a recipe using
    // this custom source is rejected by ImportConfiguration before extraction
    // ever runs, defeating the point of registering a custom strategy.
    ImportConfiguration.registerSourceType(name);
  }

  /**
   * @returns {Array<string>} Registered source-strategy type identifiers.
   */
  getAvailableSourceTypes() {
    return this._sourceFactory.getAvailableStrategies();
  }

  /**
   * @returns {Object} Summary of the engine's configured capabilities.
   */
  getConfigSummary() {
    return {
      sourceStrategies: this._sourceFactory.getAvailableStrategies(),
      hasExpressionEngine: !!this._transformer._expressionEngine,
      hasExceptionService: !!this._exceptionService,
      hasMonitor: !!this._monitor
    };
  }

  /**
   * Validates an import recipe without executing it.
   * @param {Object} recipe Import configuration (see ImportConfiguration).
   * @returns {{valid: boolean, summary: Object, message: string}|{valid: boolean, error: string, code: string}}
   */
  validateRecipe(recipe: unknown) {
    try {
      const config = new ImportConfiguration(recipe, this.logger);
      const summary = config.getSummary();

      return {
        valid: true,
        summary,
        message: 'Recipe is valid'
      };
    } catch (error) {
      return {
        valid: false,
        error: (error as Error).message,
        code: (error as ImportError).code || 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Executes a complete ETL pipeline (Extract -> Transform -> Load) based on a recipe configuration.
   * @param {Object} recipe Import configuration (see ImportConfiguration).
   * @param {Object} [options={}] Execution behavior overrides.
   * @param {boolean} [options.dryRun=false] If true, skips the persistent Load phase.
   * @param {number} [options.maxRetries=3] Maximum attempts for transient error recovery.
   * @param {Function} [options.postTransform] Optional hook `(transformedData, config) => filteredData`
   *   invoked after Transform and before Load, letting the caller filter/mutate the
   *   transformed batch (e.g. dropping records) without reaching into private
   *   `_execute*` pipeline-phase methods.
   * @returns {Object} Statistics from all pipeline phases.
   * @throws {ConfigurationError} If the recipe fails validation.
   * @throws {ImportError} If an unrecoverable failure occurs during any pipeline phase.
   */
}

export { ImportEngine };
