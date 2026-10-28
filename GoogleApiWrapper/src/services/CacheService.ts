import type { GoogleLogger } from '../internal/core/GoogleService.js';
type CacheLogger = Pick<GoogleLogger, 'error' | 'warn' | 'debug'>;

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
// shortcut: GAS Console types omit legacy debug, revisit the existing console fallback separately.
export class CacheService {
  declare _logger: CacheLogger;
  declare _exceptionService: unknown;
  /**
   * @description Initializes CacheService with optional logging and resiliency providers.
   * @param {LoggerService} [logger=console] Diagnostic logger.
   * @param {ExceptionService} [exceptionService=null] Resiliency and retry logic provider.
   */
  constructor(
    logger: CacheLogger | null = console as Console & CacheLogger,
    exceptionService: unknown = null
  ) {
    this._logger = logger || (console as Console & CacheLogger);
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
      this._logger.error(`Error getting script cache: ${(error as Error).message}`);
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
      this._logger.error(`Error getting user cache: ${(error as Error).message}`);
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
      this._logger.error(`Error getting document cache: ${(error as Error).message}`);
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
 */
export class Cache<
  Backend extends Partial<GoogleAppsScript.Cache.Cache> | null = GoogleAppsScript.Cache.Cache
> {
  declare _cache: Backend;
  declare _logger: CacheLogger;
  declare _type: string;
  /**
   * @description Initializes Cache wrapper for a native GAS cache object.
   * @param {Object} gasCache Native GAS Cache instance.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {string} type Cache scope identifier ('script', 'user', 'document').
   */
  constructor(gasCache: Backend, logger: CacheLogger, type: string) {
    this._cache = gasCache;
    this._logger = logger;
    this._type = type;
  }

  /**
   * @description Retrieves value from cache.
   * @param {string} key Cache key.
   * @returns {string|null} Cached value or null on miss/error.
   */
  get(key: string) {
    try {
      const value = this._cache!.get!(key);
      if (value !== null) {
        this._logger.debug(`Cache hit (${this._type}): ${key}`);
      } else {
        this._logger.debug(`Cache miss (${this._type}): ${key}`);
      }
      return value;
    } catch (error) {
      this._logger.error(`Error getting cache key ${key}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * @description Retrieves multiple values in a single batch operation.
   * @param {string[]} keys Array of cache keys.
   * @returns {Object<string, string|null>} Map of keys to cached values (null if missing).
   */
  getAll(keys: string[]) {
    try {
      const values = this._cache!.getAll!(keys);
      this._logger.debug(`Retrieved ${keys.length} keys from ${this._type} cache`);
      return values;
    } catch (error) {
      this._logger.error(`Error getting multiple cache keys: ${(error as Error).message}`);
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
  put(key: string, value: unknown, expirationInSeconds: number = 600) {
    try {
      // Ensure value is a string
      const stringValue = typeof value === 'string' ? value : String(value);

      // Cap expiration at 6 hours (GAS limit)
      const cappedExpiration = Math.min(expirationInSeconds, 21600);

      this._cache!.put!(key, stringValue, cappedExpiration);

      this._logger.debug(`Cached (${this._type}): ${key} (expires in ${cappedExpiration}s)`);
    } catch (error) {
      this._logger.error(`Error caching key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * @description Stores multiple key-value pairs in a single batch operation.
   * @param {Object<string, *>} values Map of keys to values.
   * @param {number} [expirationInSeconds=600] TTL in seconds (max 21,600).
   * @throws {Error} If batch caching operation fails.
   */
  putAll(values: Record<string, unknown>, expirationInSeconds: number = 600) {
    try {
      // Ensure all values are strings
      const stringValues: Record<string, string> = {};
      for (const [key, value] of Object.entries(values)) {
        stringValues[key] = typeof value === 'string' ? value : String(value);
      }

      // Cap expiration at 6 hours (GAS limit)
      const cappedExpiration = Math.min(expirationInSeconds, 21600);

      this._cache!.putAll!(stringValues, cappedExpiration);

      this._logger.debug(`Cached ${Object.keys(values).length} keys (${this._type})`);
    } catch (error) {
      this._logger.error(`Error caching multiple keys: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * @description Deletes specific key from cache.
   * @param {string} key Target cache key.
   * @throws {Error} If removal operation fails.
   */
  remove(key: string) {
    try {
      this._cache!.remove!(key);
      this._logger.debug(`Removed from ${this._type} cache: ${key}`);
    } catch (error) {
      this._logger.error(`Error removing cache key ${key}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * @description Deletes multiple keys in a single batch operation.
   * @param {string[]} keys Array of keys to remove.
   * @throws {Error} If batch removal fails.
   */
  removeAll(keys?: string[] | null) {
    try {
      if (keys && keys.length > 0) {
        this._cache!.removeAll!(keys);
        this._logger.debug(`Removed ${keys.length} keys from ${this._type} cache`);
      } else {
        // If no keys provided, remove all (not supported by GAS, so we do nothing)
        this._logger.warn('removeAll called with no keys - no action taken');
      }
    } catch (error) {
      this._logger.error(`Error removing multiple cache keys: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * @description Returns the underlying native GAS Cache instance. Bypasses wrapper logic (logging, auto-string, TTL capping).
   * @returns {GoogleAppsScript.Cache.Cache} Native GAS cache object.
   */
  unwrap() {
    return this._cache;
  }
}
