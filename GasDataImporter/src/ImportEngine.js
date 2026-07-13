/**
 * @fileoverview Main facade for the GasDataImporter ETL pipeline
 * @author GasLibraryFactory
 */

import { ImportConfiguration } from './ImportConfiguration.js';
import { SourceStrategyFactory } from './internal/extract-strategies/SourceStrategyFactory.js';
import { Transformer } from './pipeline/Transformer.js';
import { Loader } from './internal/load/Loader.js';
import { ImportError } from './internal/errors/ImportError.js';
import { ImportPipelineExecutor } from './pipeline/ImportPipelineExecutor.js';
import { ImportStrategyRegistry } from './ImportStrategyRegistry.js';
import { ImportRecipeValidator } from './ImportRecipeValidator.js';

/**
 * Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.
 * @class
 */
class ImportEngine {
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
    logger,
    driveService,
    spreadsheetService,
    databaseService,
    expressionEngine = null,
    exceptionService = null,
    monitor = null
  ) {
    this.logger = logger;
    this._exceptionService = exceptionService;

    /**
     * Optional ProcessMonitorService for visualization.
     * @private
     * @type {Object|null}
     */
    this._monitor = monitor;

    // Initialize ETL components
    this._sourceFactory = new SourceStrategyFactory(logger, driveService, spreadsheetService);
    this._transformer = new Transformer(logger, expressionEngine);
    this._loader = new Loader(logger, databaseService);

    this.logger.info('[ImportEngine] Initialized successfully');

    // Facade Delegation
    this._pipelineExecutor = new ImportPipelineExecutor(this);
    this._strategyRegistry = new ImportStrategyRegistry(this);
    this._recipeValidator = new ImportRecipeValidator(this);

    const pipelineMethods = [
      'runImport',
      '_executePipeline',
      '_executeExtract',
      '_executeTransform',
      '_executeLoad',
      '_generateDryRunLoadResult'
    ];
    pipelineMethods.forEach(m => {
      this[m] = this._pipelineExecutor[m].bind(this._pipelineExecutor);
    });

    const registryMethods = [
      'registerCustomSource',
      'getAvailableSourceTypes',
      'getConfigSummary'
    ];
    registryMethods.forEach(m => {
      this[m] = this._strategyRegistry[m].bind(this._strategyRegistry);
    });

    this.validateRecipe = this._recipeValidator.validateRecipe.bind(this._recipeValidator);
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
