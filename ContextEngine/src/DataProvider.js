/**
 * @file ContextEngine/src/DataProvider.js
 * @description Abstract base class for data providers.
 * @version 1.0.0
 */

import { ProviderExecutionError } from './internal/errors/ProviderExecutionError';

/**
 * Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.
 * @class
 * @abstract
 */
export class DataProvider {
  /**
   * Initializes the provider with required logger and optional caching configuration.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @param {Object} [options={}] Provider configuration.
   * @param {boolean} [options.cacheable=false] Enables in-memory result caching.
   * @param {number} [options.cacheDurationMs=300000] Cache TTL in milliseconds (default: 5 minutes).
   * @throws {Error} If logger is missing or lacks required interface methods.
   * @throws {Error} If options is provided but is not an object.
   */
  constructor(logger, options = {}) {
    // Validate inputs
    if (!logger || typeof logger !== 'object') {
      throw new Error('DataProvider: logger is required and must be an object');
    }

    if (
      typeof logger.debug !== 'function' ||
      typeof logger.info !== 'function' ||
      typeof logger.warn !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error('DataProvider: logger must have debug, info, warn, and error methods');
    }

    if (options !== null && typeof options !== 'object') {
      throw new Error('DataProvider: options must be an object or null');
    }

    /**
     * Logger service.
     * @protected
     * @type {Object}
     */
    this._logger = logger;

    /**
     * Cache enablement flag.
     * @protected
     * @type {boolean}
     */
    this._cacheable = options.cacheable || false;

    /**
     * Cache TTL in milliseconds.
     * @protected
     * @type {number}
     */
    this._cacheDurationMs = options.cacheDurationMs || 300000;

    /**
     * Internal in-memory cache storage.
     * @private
     * @type {Map}
     */
    this._cache = new Map();
  }

  /**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
  get logger() {
    return this._logger;
  }

  /**
   * Core data fetching logic. Must be implemented by subclasses.
   * @param {Object} parameters Validated parameters for the fetch operation.
   * @returns {*} Fetched data payload.
   * @throws {Error} If not implemented by subclass or fetch fails.
   * @protected
   * @abstract
   */
  _fetchData(_parameters) {
    throw new Error('DataProvider._fetchData must be implemented by subclass');
  }

  /**
   * Generates a unique, stable cache key from input parameters.
   * @param {Object} parameters Input parameters.
   * @returns {string} Pipe-delimited key string.
   * @private
   */
  _generateCacheKey(parameters) {
    const sortedKeys = Object.keys(parameters).sort();
    const keyParts = sortedKeys.map((key) => `${key}:${JSON.stringify(parameters[key])}`);
    return keyParts.join('|');
  }

  /**
   * Retrieves non-expired data from the internal cache.
   * @param {string} cacheKey Target cache key.
   * @returns {*|null} Cached data or null if missing/expired.
   * @private
   */
  _getFromCache(cacheKey) {
    if (!this._cacheable) {
      return null;
    }

    const cached = this._cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this._cacheDurationMs) {
      this._cache.delete(cacheKey);
      return null;
    }

    this._logger.debug(`DataProvider: Cache hit for key: ${cacheKey}`);
    return cached.data;
  }

  /**
   * Stores data in the internal cache with current timestamp.
   * @param {string} cacheKey Target cache key.
   * @param {*} data Data payload to cache.
   * @private
   */
  _storeInCache(cacheKey, data) {
    if (!this._cacheable) {
      return;
    }

    this._cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });

    this._logger.debug(`DataProvider: Cached data for key: ${cacheKey}`);
  }

  /**
   * Purges all entries from the internal in-memory cache.
   * @returns {DataProvider} Fluent interface for chaining.
   */
  clearCache() {
    this._cache.clear();
    this._logger.debug('DataProvider: Cache cleared');
    return this;
  }

  /**
   * Orchestrates the data providing process including validation, caching, performance tracking, and error wrapping.
   * @param {string} providerName Identifier for the provider (used in logging/errors).
   * @param {Object} parameters Parameters for the data fetch.
   * @returns {*} Fetched or cached data payload.
   * @throws {Error} If providerName or parameters are invalid.
   * @throws {ProviderExecutionError} If underlying fetch or validation fails.
   */
  provide(providerName, parameters) {
    // Validate inputs
    if (!providerName || typeof providerName !== 'string') {
      throw new Error('DataProvider.provide: providerName is required and must be a string');
    }

    if (!parameters || typeof parameters !== 'object') {
      throw new Error('DataProvider.provide: parameters is required and must be an object');
    }

    try {
      const startTime = Date.now();

      // Generate cache key
      const cacheKey = this._generateCacheKey(parameters);

      // Check cache
      const cachedData = this._getFromCache(cacheKey);
      if (cachedData !== null) {
        const durationMs = Date.now() - startTime;
        this._logger.debug(`[${providerName}] Returned cached data in ${durationMs}ms`);
        return cachedData;
      }

      // Fetch data
      this._logger.debug(`[${providerName}] Fetching data...`);
      const data = this._fetchData(parameters);

      // Store in cache
      this._storeInCache(cacheKey, data);

      const durationMs = Date.now() - startTime;
      this._logger.debug(`[${providerName}] Fetched data in ${durationMs}ms`);

      return data;
    } catch (error) {
      this._logger.error(`[${providerName}] Failed to provide data: ${error.message}`);
      throw new ProviderExecutionError(providerName, error, parameters);
    }
  }

  /**
   * Hooks for subclass-specific parameter validation. Executed before _fetchData().
   * @param {Object} parameters Parameters to validate.
   * @throws {Error} If validation constraints are violated.
   * @protected
   */
  _validateParameters(_parameters) {
    // Default: no validation
  }
}

