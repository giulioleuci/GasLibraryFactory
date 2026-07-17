/**
 * @file GoogleApiWrapper/src/core/MyGoogleService.js
 * @description Abstract base class for all Google service wrappers.
 * Provides common functionality for caching, service verification, and dependency injection.
 * @version 2.0 - Translated from Italian and refactored with ExceptionService support.
 */

// No imports needed - using native validation

/**
 * @class GoogleService
 * @abstract
 * @description Abstract foundation for Google Apps Script service wrappers. Implements standardized dependency injection (DI), multi-level caching strategies, and resilient execution patterns via GasResilienceLib.
 *
 * @property {LoggerService} _logger Diagnostic logging provider.
 * @property {Cache} _cache State persistence provider (get/put/remove).
 * @property {UtilsService} _utils Foundational utility provider.
 * @property {ExceptionService} _exceptionService Resiliency and retry logic provider.
 */
export class GoogleService {
  /**
   * @protected
   * @description Initializes service with validated dependencies. Enforces abstract class restriction.
   *
   * @param {LoggerService} logger Diagnostic logger (required methods: debug, info, warn, error).
   * @param {Cache} cache GAS Cache service (required methods: get, put, remove).
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} exceptionService Resiliency provider (required methods: executeWithRetry).
   *
   * @throws {TypeError} If instantiated directly as GoogleService.
   * @throws {Error} If any dependency is null, undefined, or missing required methods.
   */
  constructor(logger, cache, utils, exceptionService) {
    // Parameter validation
    if (logger == null) {
      throw new Error('GoogleService: logger is required and cannot be null or undefined');
    }
    if (typeof logger !== 'object') {
      throw new Error('GoogleService: logger must be of type object');
    }
    for (const method of ['debug', 'info', 'warn', 'error']) {
      if (typeof logger[method] !== 'function') {
        throw new Error('GoogleService: logger must have method: ' + method);
      }
    }

    if (cache == null) {
      throw new Error('GoogleService: cache is required and cannot be null or undefined');
    }
    if (typeof cache !== 'object') {
      throw new Error('GoogleService: cache must be of type object');
    }
    for (const method of ['get', 'put', 'remove']) {
      if (typeof cache[method] !== 'function') {
        throw new Error('GoogleService: cache must have method: ' + method);
      }
    }

    if (utils == null) {
      throw new Error('GoogleService: utils is required and cannot be null or undefined');
    }
    if (typeof utils !== 'object') {
      throw new Error('GoogleService: utils must be of type object');
    }

    if (exceptionService == null) {
      throw new Error(
        'GoogleService: exceptionService is required and cannot be null or undefined'
      );
    }
    if (typeof exceptionService !== 'object') {
      throw new Error('GoogleService: exceptionService must be of type object');
    }
    if (typeof exceptionService.executeWithRetry !== 'function') {
      throw new Error('GoogleService: exceptionService must have method: executeWithRetry');
    }

    /**
     * Logger service for recording operations and errors.
     * @protected
     * @type {Object}
     */
    this._logger = logger;

    /**
     * Cache service for storing temporary data.
     * @protected
     * @type {Object}
     */
    this._cache = cache;

    /**
     * Utility service for helper functions.
     * @protected
     * @type {Object}
     */
    this._utils = utils;

    /**
     * Exception handling service for resilient API calls.
     * @protected
     * @type {Object}
     */
    this._exceptionService = exceptionService;

    // Prevent direct instantiation of abstract class
    if (this.constructor === GoogleService) {
      throw new Error('Abstract class GoogleService cannot be instantiated directly.');
    }
  }

  /**
   * @protected
   * @description Verifies availability of advanced Google service.
   * @param {string} serviceName Service object name (e.g., 'Drive').
   * @returns {boolean} True if service exists in globalThis.
   */
  _verifyAdvancedService(serviceName) {
    try {
      // Use safe property access instead of eval() to avoid security vulnerabilities
      return typeof globalThis[serviceName] !== 'undefined';
    } catch (_e) {
      return false;
    }
  }

  /**
   * @protected
   * @description Generates standardized cache key: `{prefix}_{id}_{method}`.
   * @param {string} prefix Logic domain prefix.
   * @param {string} id Resource identifier.
   * @param {string} method Operation name.
   * @returns {string} Formatted cache key.
   */
  _generateCacheKey(prefix, id, method) {
    return `${prefix}_${id}_${method}`;
  }

  /**
   * @protected
   * @description Implements Get-or-Execute caching pattern.
   * @param {string} key Cache key.
   * @param {Function} func Execution logic for cache misses.
   * @param {number} [expirationSeconds=600] TTL in seconds.
   * @param {boolean} [useCache=true] Enable/disable cache lookups.
   * @returns {*} Cached or computed result.
   */
  _getOrExecute(key, func, expirationSeconds = 600, useCache = true) {
    if (useCache) {
      const cachedData = this._cache.get(key);
      if (cachedData !== null) {
        this._logger.debug(`Cache hit for key: ${key}`);
        return cachedData;
      }
      this._logger.debug(`Cache miss for key: ${key}`);
    }

    const result = func();

    if (useCache && result !== null && result !== undefined) {
      this._cache.put(key, result, expirationSeconds);
      this._logger.debug(`Cached result for key: ${key} (expires in ${expirationSeconds}s)`);
    }

    return result;
  }

  /**
   * @protected
   * @description Purges specific key from cache.
   * @param {string} key Target cache key.
   */
  _invalidateCache(key) {
    this._cache.remove(key);
    this._logger.debug(`Invalidated cache for key: ${key}`);
  }

  /**
   * @protected
   * @description Purges all keys matching prefix.
   * @param {string} prefix Key prefix filter.
   */
  _invalidateCacheByPrefix(prefix) {
    // Note: This assumes the cache service has a removeByPrefix method
    if (typeof this._cache.removeByPrefix === 'function') {
      this._cache.removeByPrefix(prefix);
      this._logger.debug(`Invalidated cache with prefix: ${prefix}`);
    } else {
      this._logger.warn('Cache service does not support prefix-based invalidation');
    }
  }

  /**
   * @protected
   * @description Executes function with resilient retry logic via exceptionService.
   * @param {Function} func Logic to execute.
   * @param {Object} [context={}] Metadata for error classification.
   * @param {number} [maxAttempts=3] Maximum execution attempts.
   * @returns {*} Function execution result.
   * @throws {Error} Propagates classified exceptions from exceptionService.
   */
  _executeWithRetry(func, context = {}, maxAttempts = 3) {
    if (this._exceptionService && typeof this._exceptionService.executeWithRetry === 'function') {
      return this._exceptionService.executeWithRetry(func, context, maxAttempts);
    } else {
      // No exception service available, execute directly
      return func();
    }
  }
}
