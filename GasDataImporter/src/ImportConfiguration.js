/**
 * @fileoverview Import configuration validator and value object
 * @author GasLibraryFactory
 */

import { ConfigurationError } from './internal/errors/ConfigurationError.js';

/**
 * Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.
 * @class
 */
class ImportConfiguration {
  /**
   * Valid source strategy types
   *
   * @static
   * @type {string[]}
   */
  static VALID_SOURCE_TYPES = ['SheetById', 'Folder'];

  /**
   * Registers an additional source type as valid for recipe validation. Consumers
   * that add a custom `SourceStrategy` via `ImportEngine.registerCustomSource()`
   * must also call this (or use `registerCustomSource`, which does it for them)
   * so recipes using the new type pass `_validateSource` instead of being
   * rejected as unknown before the custom strategy is ever reached. No-op if the
   * type is already valid.
   *
   * @static
   * @param {string} type Source strategy type name (matches the key passed to
   *   `SourceStrategyFactory.registerStrategy`).
   */
  static registerSourceType(type) {
    if (!ImportConfiguration.VALID_SOURCE_TYPES.includes(type)) {
      ImportConfiguration.VALID_SOURCE_TYPES.push(type);
    }
  }

  /**
   * Valid conflict resolution strategies
   *
   * @static
   * @type {string[]}
   */
  static VALID_CONFLICT_STRATEGIES = ['INSERT_ONLY', 'UPDATE_ONLY', 'UPSERT', 'OVERWRITE'];

  /**
   * Initializes and validates an import recipe against internal schema rules.
   * @param {Object} recipe ETL configuration JSON.
   * @param {string} recipe.name Identifiable name for the import process.
   * @param {Object} recipe.source Extraction source details.
   * @param {Object} [recipe.transform] Optional data transformation rules.
   * @param {Object} recipe.load persistence and conflict resolution strategy.
   * @param {Object} [logger=console] Diagnostic output interface.
   * @throws {ConfigurationError} If recipe structure is invalid or required fields are missing.
   */
  constructor(recipe, logger = console) {
    this._logger = logger;
    this._validate(recipe);
    this._recipe = recipe;
  }

  /**
   * Orchestrates full recipe validation across root, source, transform, and load segments.
   * @private
   * @param {Object} recipe target configuration to validate.
   * @throws {ConfigurationError} On first detected structural violation.
   */
  _validate(recipe) {
    // Validate root structure
    if (!recipe || typeof recipe !== 'object') {
      throw new ConfigurationError('Recipe must be an object', 'INVALID_RECIPE');
    }

    if (!recipe.name || typeof recipe.name !== 'string') {
      throw new ConfigurationError('Recipe must have a name (string)', 'MISSING_NAME');
    }

    // Validate source configuration
    this._validateSource(recipe.source);

    // Validate transform configuration (optional but if present must be valid)
    if (recipe.transform) {
      this._validateTransform(recipe.transform);
    }

    // Validate load configuration
    this._validateLoad(recipe.load);
  }

  /**
   * Enforces extraction source requirements based on strategy type (e.g., SheetById, Folder).
   * @private
   * @param {Object} source Source configuration segment.
   * @throws {ConfigurationError} If type is unknown or type-specific identifiers are missing.
   */
  _validateSource(source) {
    if (!source || typeof source !== 'object') {
      throw new ConfigurationError('Recipe must have a source configuration', 'MISSING_SOURCE');
    }

    if (!ImportConfiguration.VALID_SOURCE_TYPES.includes(source.type)) {
      throw new ConfigurationError(
        `Invalid source type: ${source.type}. Valid types: ${ImportConfiguration.VALID_SOURCE_TYPES.join(', ')}`,
        'INVALID_SOURCE_TYPE',
        { sourceType: source.type }
      );
    }

    if (!source.config || typeof source.config !== 'object') {
      throw new ConfigurationError('Source must have a config object', 'MISSING_SOURCE_CONFIG');
    }

    // Validate type-specific requirements
    if (source.type === 'SheetById') {
      if (!source.config.sheetId || typeof source.config.sheetId !== 'string') {
        throw new ConfigurationError(
          'SheetById source requires config.sheetId (string)',
          'MISSING_SHEET_ID'
        );
      }
    } else if (source.type === 'Folder') {
      if (!source.config.folderId || typeof source.config.folderId !== 'string') {
        throw new ConfigurationError(
          'Folder source requires config.folderId (string)',
          'MISSING_FOLDER_ID'
        );
      }
    }
  }

  /**
   * Validates optional transformation blocks including field mappings, calculations, and normalization rules.
   * @private
   * @param {Object} transform Transform configuration segment.
   * @throws {ConfigurationError} If sub-blocks are not objects or validation rules are malformed.
   */
  _validateTransform(transform) {
    if (typeof transform !== 'object') {
      throw new ConfigurationError(
        'Transform configuration must be an object',
        'INVALID_TRANSFORM'
      );
    }

    // Validate mapping if present
    if (transform.mapping && typeof transform.mapping !== 'object') {
      throw new ConfigurationError('Transform mapping must be an object', 'INVALID_MAPPING');
    }

    // Validate calculated if present
    if (transform.calculated && typeof transform.calculated !== 'object') {
      throw new ConfigurationError('Transform calculated must be an object', 'INVALID_CALCULATED');
    }

    // Validate normalization if present
    if (transform.normalization && typeof transform.normalization !== 'object') {
      throw new ConfigurationError(
        'Transform normalization must be an object',
        'INVALID_NORMALIZATION'
      );
    }

    // Validate validation if present
    if (transform.validation) {
      if (typeof transform.validation !== 'string' && !Array.isArray(transform.validation)) {
        throw new ConfigurationError(
          'Transform validation must be a string or an array of strings',
          'INVALID_VALIDATION'
        );
      }
    }
  }

  /**
   * Validates persistence parameters, conflict resolution strategies, and conditional update rules.
   * @private
   * @param {Object} load Load configuration segment.
   * @throws {ConfigurationError} If target table is missing or conflict resolution logic is incomplete.
   */
  _validateLoad(load) {
    if (!load || typeof load !== 'object') {
      throw new ConfigurationError('Recipe must have a load configuration', 'MISSING_LOAD');
    }

    if (!load.targetTable || typeof load.targetTable !== 'string') {
      throw new ConfigurationError(
        'Load configuration must specify targetTable (string)',
        'MISSING_TARGET_TABLE'
      );
    }

    if (!ImportConfiguration.VALID_CONFLICT_STRATEGIES.includes(load.conflictResolution)) {
      throw new ConfigurationError(
        `Invalid conflict resolution: ${load.conflictResolution}. Valid strategies: ${ImportConfiguration.VALID_CONFLICT_STRATEGIES.join(', ')}`,
        'INVALID_CONFLICT_STRATEGY',
        { conflictResolution: load.conflictResolution }
      );
    }

    // Validate conflict key for strategies that need it
    if (['UPDATE_ONLY', 'UPSERT', 'OVERWRITE'].includes(load.conflictResolution)) {
      if (!load.conflictKey || typeof load.conflictKey !== 'string') {
        throw new ConfigurationError(
          `Conflict resolution strategy "${load.conflictResolution}" requires a conflictKey`,
          'MISSING_CONFLICT_KEY',
          { conflictResolution: load.conflictResolution }
        );
      }
    }

    // Validate updateIfNewer if present
    if (load.updateIfNewer) {
      if (typeof load.updateIfNewer !== 'object') {
        throw new ConfigurationError(
          'Load updateIfNewer must be an object',
          'INVALID_UPDATE_IF_NEWER'
        );
      }

      if (load.updateIfNewer.enabled && !load.updateIfNewer.timestampColumn) {
        throw new ConfigurationError(
          'updateIfNewer requires timestampColumn when enabled',
          'MISSING_TIMESTAMP_COLUMN'
        );
      }
    }
  }

  /**
   * Gets the import name
   *
   * @returns {string} Import name
   */
  get name() {
    return this._recipe.name;
  }

  /**
   * Returns the identification name of the import process.
   * @returns {string} Import name.
   */
  getName() {
    return this.name;
  }

  /**
   * Gets the source configuration
   *
   * @returns {Object} Source configuration
   */
  get source() {
    return this._recipe.source;
  }

  /**
   * Retrieves the extraction source configuration.
   * @returns {Object} Source parameters.
   */
  getSource() {
    return this.source;
  }

  /**
   * Gets the transform configuration
   *
   * @returns {Object} Transform configuration
   */
  get transform() {
    return this._recipe.transform || {};
  }

  /**
   * Retrieves data transformation rules or an empty object if none are defined.
   * @returns {Object} Transform parameters.
   */
  getTransform() {
    return this.transform;
  }

  /**
   * Gets the load configuration
   *
   * @returns {Object} Load configuration
   */
  get load() {
    return this._recipe.load;
  }

  /**
   * Retrieves persistence and conflict resolution configuration.
   * @returns {Object} Load parameters.
   */
  getLoad() {
    return this.load;
  }

  /**
   * Returns the full original recipe configuration.
   * @returns {Object} Complete recipe object.
   */
  getRecipe() {
    return this._recipe;
  }

  /**
   * Generates a high-level overview of the configuration for diagnostic and logging purposes.
   * @returns {Object} Logic summary.
   */
  getSummary() {
    return {
      name: this.getName(),
      sourceType: this._recipe.source.type,
      targetTable: this._recipe.load.targetTable,
      conflictResolution: this._recipe.load.conflictResolution,
      hasMapping: !!(this._recipe.transform && this._recipe.transform.mapping),
      hasCalculated: !!(this._recipe.transform && this._recipe.transform.calculated),
      hasNormalization: !!(this._recipe.transform && this._recipe.transform.normalization)
    };
  }
}

export { ImportConfiguration };
