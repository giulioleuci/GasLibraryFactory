import type { SourceConfiguration } from './types.js';
import type { ImporterLogger, ImportRecipe, LoadConfig, TransformConfig } from './types.js';
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
  declare _logger: ImporterLogger;
  declare _recipe: ImportRecipe;

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
  static registerSourceType(type: string) {
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
  constructor(recipe: unknown, logger: ImporterLogger = console as Console & ImporterLogger) {
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
  _validate(recipe: unknown): asserts recipe is ImportRecipe {
    // Validate root structure
    if (!recipe || typeof recipe !== 'object') {
      throw new ConfigurationError('Recipe must be an object', 'INVALID_RECIPE');
    }

    if (!(recipe as ImportRecipe).name || typeof (recipe as ImportRecipe).name !== 'string') {
      throw new ConfigurationError('Recipe must have a name (string)', 'MISSING_NAME');
    }

    // Validate source configuration
    this._validateSource((recipe as ImportRecipe).source);

    // Validate transform configuration (optional but if present must be valid)
    if ((recipe as ImportRecipe).transform) {
      this._validateTransform((recipe as ImportRecipe).transform);
    }

    // Validate load configuration
    this._validateLoad((recipe as ImportRecipe).load);
  }

  /**
   * Enforces extraction source requirements based on strategy type (e.g., SheetById, Folder).
   * @private
   * @param {Object} source Source configuration segment.
   * @throws {ConfigurationError} If type is unknown or type-specific identifiers are missing.
   */
  _validateSource(source: unknown) {
    if (!source || typeof source !== 'object') {
      throw new ConfigurationError('Recipe must have a source configuration', 'MISSING_SOURCE');
    }

    if (!ImportConfiguration.VALID_SOURCE_TYPES.includes((source as SourceConfiguration).type)) {
      throw new ConfigurationError(
        `Invalid source type: ${(source as SourceConfiguration).type}. Valid types: ${ImportConfiguration.VALID_SOURCE_TYPES.join(', ')}`,
        'INVALID_SOURCE_TYPE',
        { sourceType: (source as SourceConfiguration).type }
      );
    }

    if (
      !(source as SourceConfiguration).config ||
      typeof (source as SourceConfiguration).config !== 'object'
    ) {
      throw new ConfigurationError('Source must have a config object', 'MISSING_SOURCE_CONFIG');
    }

    // Validate type-specific requirements
    if ((source as SourceConfiguration).type === 'SheetById') {
      if (
        !(source as SourceConfiguration).config.sheetId ||
        typeof (source as SourceConfiguration).config.sheetId !== 'string'
      ) {
        throw new ConfigurationError(
          'SheetById source requires config.sheetId (string)',
          'MISSING_SHEET_ID'
        );
      }
    } else if ((source as SourceConfiguration).type === 'Folder') {
      if (
        !(source as SourceConfiguration).config.folderId ||
        typeof (source as SourceConfiguration).config.folderId !== 'string'
      ) {
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
  _validateTransform(transform: unknown) {
    if (typeof transform !== 'object') {
      throw new ConfigurationError(
        'Transform configuration must be an object',
        'INVALID_TRANSFORM'
      );
    }

    // Validate mapping if present
    if (
      (transform as TransformConfig).mapping &&
      typeof (transform as TransformConfig).mapping !== 'object'
    ) {
      throw new ConfigurationError('Transform mapping must be an object', 'INVALID_MAPPING');
    }

    // Validate calculated if present
    if (
      (transform as TransformConfig).calculated &&
      typeof (transform as TransformConfig).calculated !== 'object'
    ) {
      throw new ConfigurationError('Transform calculated must be an object', 'INVALID_CALCULATED');
    }

    // Validate normalization if present
    if (
      (transform as TransformConfig).normalization &&
      typeof (transform as TransformConfig).normalization !== 'object'
    ) {
      throw new ConfigurationError(
        'Transform normalization must be an object',
        'INVALID_NORMALIZATION'
      );
    }

    // Validate validation if present
    if ((transform as TransformConfig).validation) {
      if (
        typeof (transform as TransformConfig).validation !== 'string' &&
        !Array.isArray((transform as TransformConfig).validation)
      ) {
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
  _validateLoad(load: unknown) {
    if (!load || typeof load !== 'object') {
      throw new ConfigurationError('Recipe must have a load configuration', 'MISSING_LOAD');
    }

    if (!(load as LoadConfig).targetTable || typeof (load as LoadConfig).targetTable !== 'string') {
      throw new ConfigurationError(
        'Load configuration must specify targetTable (string)',
        'MISSING_TARGET_TABLE'
      );
    }

    if (
      !ImportConfiguration.VALID_CONFLICT_STRATEGIES.includes(
        (load as LoadConfig).conflictResolution
      )
    ) {
      throw new ConfigurationError(
        `Invalid conflict resolution: ${(load as LoadConfig).conflictResolution}. Valid strategies: ${ImportConfiguration.VALID_CONFLICT_STRATEGIES.join(', ')}`,
        'INVALID_CONFLICT_STRATEGY',
        { conflictResolution: (load as LoadConfig).conflictResolution }
      );
    }

    // Validate conflict key for strategies that need it
    if (['UPDATE_ONLY', 'UPSERT', 'OVERWRITE'].includes((load as LoadConfig).conflictResolution)) {
      if (
        !(load as LoadConfig).conflictKey ||
        typeof (load as LoadConfig).conflictKey !== 'string'
      ) {
        throw new ConfigurationError(
          `Conflict resolution strategy "${(load as LoadConfig).conflictResolution}" requires a conflictKey`,
          'MISSING_CONFLICT_KEY',
          { conflictResolution: (load as LoadConfig).conflictResolution }
        );
      }
    }

    // Validate updateIfNewer if present
    if ((load as LoadConfig).updateIfNewer) {
      if (typeof (load as LoadConfig).updateIfNewer !== 'object') {
        throw new ConfigurationError(
          'Load updateIfNewer must be an object',
          'INVALID_UPDATE_IF_NEWER'
        );
      }

      if (
        (load as LoadConfig).updateIfNewer!.enabled &&
        !(load as LoadConfig).updateIfNewer!.timestampColumn
      ) {
        throw new ConfigurationError(
          'updateIfNewer requires timestampColumn when enabled',
          'MISSING_TIMESTAMP_COLUMN'
        );
      }
    }
  }

  /**
   * Returns the identification name of the import process.
   * @returns {string} Import name.
   */
  getName() {
    return this._recipe.name;
  }

  /**
   * Retrieves the extraction source configuration.
   * @returns {Object} Source parameters.
   */
  getSource() {
    return this._recipe.source;
  }

  /**
   * Retrieves data transformation rules or an empty object if none are defined.
   * @returns {Object} Transform parameters.
   */
  getTransform() {
    return this._recipe.transform || {};
  }

  /**
   * Retrieves persistence and conflict resolution configuration.
   * @returns {Object} Load parameters.
   */
  getLoad() {
    return this._recipe.load;
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
