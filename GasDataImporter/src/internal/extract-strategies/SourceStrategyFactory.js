/**
 * @fileoverview Factory for creating source strategy instances
 * @author GasLibraryFactory
 */

import { SheetByIdStrategy } from './SheetByIdStrategy.js';
import { FolderStrategy } from './FolderStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
 * Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.
 * @class
 */
class SourceStrategyFactory {
  /**
   * Initializes factory with service facades required for built-in strategies.
   * @param {Object} logger Diagnostic output interface.
   * @param {Object} driveService GoogleApiWrapper DriveService for folder traversal.
   * @param {Object} spreadsheetService GoogleApiWrapper SpreadsheetService for data access.
   */
  constructor(logger, driveService, spreadsheetService) {
    this.logger = logger;
    this._driveService = driveService;
    this._spreadsheetService = spreadsheetService;

    // Registry of strategy constructors
    this._strategies = new Map();

    // Register built-in strategies
    this._registerBuiltInStrategies();
  }

  /**
   * Populates the internal registry with SheetById and Folder extraction adapters.
   * @private
   */
  _registerBuiltInStrategies() {
    this._strategies.set('SheetById', SheetByIdStrategy);
    this._strategies.set('Folder', FolderStrategy);
  }

  /**
   * Extends the factory with a custom extraction adapter at runtime.
   * @param {string} name Unique strategy identifier (used in recipe source.type).
   * @param {Function} strategyClass Constructor for the strategy class (must extend SourceStrategy).
   * @throws {SourceError} If name is invalid or class is not a constructor.
   */
  registerStrategy(name, strategyClass) {
    if (!name || typeof name !== 'string') {
      throw new SourceError('Strategy name must be a non-empty string', 'INVALID_STRATEGY_NAME');
    }

    if (typeof strategyClass !== 'function') {
      throw new SourceError('Strategy must be a class constructor', 'INVALID_STRATEGY_CLASS', {
        name
      });
    }

    if (this._strategies.has(name)) {
      this.logger.warn(`[SourceStrategyFactory] Overwriting existing strategy: ${name}`);
    }

    this._strategies.set(name, strategyClass);
    this.logger.info(`[SourceStrategyFactory] Registered strategy: ${name}`);
  }

  /**
   * Instantiates the requested extraction strategy, automatically injecting required service facades.
   * @param {string} type Strategy identifier.
   * @param {Object} [dependencies={}] Optional dependencies for custom strategies.
   * @returns {Object} Initialized strategy instance.
   * @throws {SourceError} If type is unregistered or instantiation fails.
   */
  createStrategy(type, dependencies = {}) {
    if (!this._strategies.has(type)) {
      throw new SourceError(
        `Unknown source strategy type: ${type}. Available types: ${Array.from(this._strategies.keys()).join(', ')}`,
        'UNKNOWN_STRATEGY_TYPE',
        { type, availableTypes: Array.from(this._strategies.keys()) }
      );
    }

    const StrategyClass = this._strategies.get(type);

    try {
      // Inject dependencies based on built-in strategy type
      if (type === 'SheetById') {
        return new StrategyClass(this.logger, this._spreadsheetService);
      } else if (type === 'Folder') {
        return new StrategyClass(this.logger, this._driveService, this._spreadsheetService);
      } else {
        // Custom strategy - pass provided dependencies
        return new StrategyClass(this.logger, dependencies);
      }
    } catch (error) {
      this.logger.error(
        `[SourceStrategyFactory] Failed to create strategy "${type}": ${error.message}`
      );
      throw new SourceError(
        `Failed to create source strategy: ${error.message}`,
        'STRATEGY_CREATION_FAILED',
        { type, originalError: error.message }
      );
    }
  }

  /**
   * Verifies if a specific strategy identifier is present in the factory registry.
   * @param {string} type Strategy identifier to verify.
   * @returns {boolean} True if the strategy is registered.
   */
  hasStrategy(type) {
    return this._strategies.has(type);
  }

  /**
   * Retrieves a list of all registered extraction strategy identifiers.
   * @returns {Array<string>} Collection of available strategy names.
   */
  getAvailableStrategies() {
    return Array.from(this._strategies.keys());
  }
}

export { SourceStrategyFactory };
