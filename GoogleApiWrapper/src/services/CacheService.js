/**
 * @file GoogleApiWrapper/src/services/CacheService.js
 * @description Facade for Google Apps Script's CacheService.
 * Provides a consistent interface for caching with error handling and logging.
 */

// Access native GAS CacheService which may be shadowed after webpack bundling.
// In the GAS online environment, src/index.js saves the native reference to
// global.__nativeCacheService__ before Object.assign overwrites it.
// In Jest/test environments, falls back to global.CacheService (the mock).
function _getNativeCacheService() {
  return global.__nativeCacheService__ || global.CacheService;
}

/**
 * @class CacheService
 * @description Facade for Google Apps Script native CacheService. Provides unified access to Script, User, and Document cache scopes with consistent error handling, automatic serialization, and TTL enforcement.
 * 
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {ExceptionService} _exceptionService Resiliency provider.
 */
export class CacheService {
  /**
   * @description Initializes CacheService with optional logging and resiliency providers.
   * @param {LoggerService} [logger=console] Diagnostic logger.
   * @param {ExceptionService} [exceptionService=null] Resiliency and retry logic provider.
   */
  constructor(logger = console, exceptionService = null) {
    this._logger = logger || console;
    this._exceptionService = exceptionService;
  }

  /**
   * @description Returns a Cache wrapper for the GAS Script Cache (global scope).
   * @returns {Cache} Script cache wrapper.
   * @throws {Error} If native CacheService is unavailable.
   */
  getScriptCache() {
    try {
      const gasCache = _getNativeCacheService().getScriptCache();
      this._logger.debug('Retrieved script cache');
      return new Cache(gasCache, this._logger, 'script');
    } catch (error) {
      this._logger.error(`Error getting script cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Returns a Cache wrapper for the GAS User Cache (per-user scope).
   * @returns {Cache} User cache wrapper.
   * @throws {Error} If native CacheService is unavailable.
   */
  getUserCache() {
    try {
      const gasCache = _getNativeCacheService().getUserCache();
      this._logger.debug('Retrieved user cache');
      return new Cache(gasCache, this._logger, 'user');
    } catch (error) {
      this._logger.error(`Error getting user cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Returns a Cache wrapper for the GAS Document Cache (per-document scope).
   * @returns {Cache} Document cache wrapper.
   * @throws {Error} If native CacheService is unavailable or if called from a standalone script.
   */
  getDocumentCache() {
    try {
      const gasCache = _getNativeCacheService().getDocumentCache();
      this._logger.debug('Retrieved document cache');
      return new Cache(gasCache, this._logger, 'document');
    } catch (error) {
      this._logger.error(`Error getting document cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * @static
   * @description Native GAS Script Cache accessor (backward compatibility).
   * @returns {Object} Native GAS script cache.
   */
  static getScriptCache() {
    return _getNativeCacheService().getScriptCache();
  }

  /**
   * @static
   * @description Native GAS User Cache accessor.
   * @returns {Object} Native GAS user cache.
   */
  static getUserCache() {
    return _getNativeCacheService().getUserCache();
  }

  /**
   * @static
   * @description Native GAS Document Cache accessor.
   * @returns {Object} Native GAS document cache.
   */
  static getDocumentCache() {
    return _getNativeCacheService().getDocumentCache();
  }
}

/**
 * @class Cache
 * @description Wrapper for Google Apps Script Cache instances. Extends native functionality with automatic string conversion, TTL enforcement (max 6h), and diagnostic logging.
 * 
 * @property {Object} _cache Native GAS Cache instance.
 * @property {LoggerService} _logger Diagnostic logger.
 * @property {string} _type Cache scope identifier ('script', 'user', 'document').
 * @property {Set<string>} _trackedKeys Set of keys modified in current instance.
 * @property {boolean} _autoTrackKeys Enable/disable key tracking.
 */
export class Cache {
  /**
   * @description Initializes Cache wrapper for a native GAS cache object.
   * @param {Object} gasCache Native GAS Cache instance.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {string} type Cache scope identifier ('script', 'user', 'document').
   */
  constructor(gasCache, logger, type) {
    this._cache = gasCache;
    this._logger = logger;
    this._type = type;
    /**
     * Set of tracked cache keys for prefix-based operations.
     * Keys are added when put() is called with trackKey=true or when enableKeyTracking() is called.
     * @private
     * @type {Set<string>}
     */
    this._trackedKeys = new Set();
    /**
     * Whether to automatically track all keys on put() operations.
     * @private
     * @type {boolean}
     */
    this._autoTrackKeys = false;
  }

  /**
   * @description Retrieves value from cache.
   * @param {string} key Cache key.
   * @returns {string|null} Cached value or null on miss/error.
   */
  get(key) {
    try {
      const value = this._cache.get(key);
      if (value !== null) {
        this._logger.debug(`Cache hit (${this._type}): ${key}`);
      } else {
        this._logger.debug(`Cache miss (${this._type}): ${key}`);
      }
      return value;
    } catch (error) {
      this._logger.error(`Error getting cache key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * @description Retrieves multiple values in a single batch operation.
   * @param {string[]} keys Array of cache keys.
   * @returns {Object<string, string|null>} Map of keys to cached values (null if missing).
   */
  getAll(keys) {
    try {
      const values = this._cache.getAll(keys);
      this._logger.debug(`Retrieved ${keys.length} keys from ${this._type} cache`);
      return values;
    } catch (error) {
      this._logger.error(`Error getting multiple cache keys: ${error.message}`);
      return {};
    }
  }

  /**
   * @description Stores value in cache with automatic string conversion and TTL capping.
   * @param {string} key Cache key.
   * @param {*} value Value to cache (auto-converted to string).
   * @param {number} [expirationInSeconds=600] TTL in seconds (max 21,600).
   * @throws {Error} If caching operation fails.
   */
  put(key, value, expirationInSeconds = 600) {
    try {
      // Ensure value is a string
      const stringValue = typeof value === 'string' ? value : String(value);

      // Cap expiration at 6 hours (GAS limit)
      const cappedExpiration = Math.min(expirationInSeconds, 21600);

      this._cache.put(key, stringValue, cappedExpiration);

      // Track key if auto-tracking is enabled
      if (this._autoTrackKeys) {
        this._trackedKeys.add(key);
      }

      this._logger.debug(`Cached (${this._type}): ${key} (expires in ${cappedExpiration}s)`);
    } catch (error) {
      this._logger.error(`Error caching key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Stores multiple key-value pairs in a single batch operation.
   * @param {Object<string, *>} values Map of keys to values.
   * @param {number} [expirationInSeconds=600] TTL in seconds (max 21,600).
   * @throws {Error} If batch caching operation fails.
   */
  putAll(values, expirationInSeconds = 600) {
    try {
      // Ensure all values are strings
      const stringValues = {};
      for (const [key, value] of Object.entries(values)) {
        stringValues[key] = typeof value === 'string' ? value : String(value);
      }

      // Cap expiration at 6 hours (GAS limit)
      const cappedExpiration = Math.min(expirationInSeconds, 21600);

      this._cache.putAll(stringValues, cappedExpiration);

      // Track keys if auto-tracking is enabled
      if (this._autoTrackKeys) {
        Object.keys(values).forEach((key) => this._trackedKeys.add(key));
      }

      this._logger.debug(`Cached ${Object.keys(values).length} keys (${this._type})`);
    } catch (error) {
      this._logger.error(`Error caching multiple keys: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Deletes specific key from cache.
   * @param {string} key Target cache key.
   * @throws {Error} If removal operation fails.
   */
  remove(key) {
    try {
      this._cache.remove(key);
      // Also remove from tracked keys
      this._trackedKeys.delete(key);
      this._logger.debug(`Removed from ${this._type} cache: ${key}`);
    } catch (error) {
      this._logger.error(`Error removing cache key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Deletes multiple keys in a single batch operation.
   * @param {string[]} keys Array of keys to remove.
   * @throws {Error} If batch removal fails.
   */
  removeAll(keys) {
    try {
      if (keys && keys.length > 0) {
        this._cache.removeAll(keys);
        // Also remove from tracked keys
        keys.forEach((key) => this._trackedKeys.delete(key));
        this._logger.debug(`Removed ${keys.length} keys from ${this._type} cache`);
      } else {
        // If no keys provided, remove all (not supported by GAS, so we do nothing)
        this._logger.warn('removeAll called with no keys - no action taken');
      }
    } catch (error) {
      this._logger.error(`Error removing multiple cache keys: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Purges cached entries matching prefix. Relies on internal key tracking.
   * @param {string} prefix Key prefix filter.
   * @returns {number} Count of removed entries.
   * @throws {Error} If prefix removal fails.
   */
  removeByPrefix(prefix) {
    try {
      if (this._trackedKeys.size === 0) {
        this._logger.debug(`removeByPrefix: No tracked keys in ${this._type} cache`);
        return 0;
      }

      // Find all keys that start with the prefix
      const keysToRemove = [];
      for (const key of this._trackedKeys) {
        if (key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      if (keysToRemove.length === 0) {
        this._logger.debug(
          `removeByPrefix: No keys matching prefix '${prefix}' in ${this._type} cache`
        );
        return 0;
      }

      // Remove from cache
      this._cache.removeAll(keysToRemove);

      // Remove from tracked keys
      keysToRemove.forEach((key) => this._trackedKeys.delete(key));

      this._logger.debug(
        `Removed ${keysToRemove.length} keys with prefix '${prefix}' from ${this._type} cache`
      );
      return keysToRemove.length;
    } catch (error) {
      this._logger.error(`Error removing cache keys by prefix '${prefix}': ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Enables automatic key tracking for all subsequent put/putAll operations. Required for removeByPrefix.
   * @returns {Cache} Current instance for chaining.
   */
  enableKeyTracking() {
    this._autoTrackKeys = true;
    this._logger.debug(`Key tracking enabled for ${this._type} cache`);
    return this;
  }

  /**
   * @description Disables automatic key tracking. Existing tracked keys are retained.
   * @returns {Cache} Current instance for chaining.
   */
  disableKeyTracking() {
    this._autoTrackKeys = false;
    this._logger.debug(`Key tracking disabled for ${this._type} cache`);
    return this;
  }

  /**
   * @description Manually registers a key in the internal tracking set.
   * @param {string} key Cache key to track.
   * @returns {Cache} Current instance for chaining.
   */
  trackKey(key) {
    this._trackedKeys.add(key);
    return this;
  }

  /**
   * @description Returns the number of keys currently being tracked.
   * @returns {number} Tracked key count.
   */
  getTrackedKeyCount() {
    return this._trackedKeys.size;
  }

  /**
   * @description Clears the internal tracking set without modifying cached data.
   * @returns {Cache} Current instance for chaining.
   */
  clearTrackedKeys() {
    this._trackedKeys.clear();
    this._logger.debug(`Cleared tracked keys for ${this._type} cache`);
    return this;
  }

  /**
   * @description Returns the underlying native GAS Cache instance. Bypasses wrapper logic (logging, auto-string, TTL capping).
   * @returns {GoogleAppsScript.Cache.Cache} Native GAS cache object.
   */
  unwrap() {
    return this._cache;
  }
}
