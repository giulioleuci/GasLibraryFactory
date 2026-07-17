/**
 * @fileoverview Comprehensive tests for GoogleService (GoogleService) abstract base class
 * @author GasLibraryFactory
 */

import { GoogleService } from '../GoogleService.js';
import { MockFactory } from '../../../../../test/fakes/MockFactory';

describe('GoogleService - Comprehensive Test Suite', () => {
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    // Extend cache mock with removeByPrefix for GoogleService
    mocks.cache.removeByPrefix = jest.fn();

    // Extend exceptionService mock with executeWithBypass for GoogleService
    mocks.exceptionService.executeWithBypass = jest.fn();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // ===================================================================
  // Constructor and Initialization Tests
  // ===================================================================
  describe('Constructor and Initialization', () => {
    it('should throw error when instantiated directly (abstract class)', () => {
      expect(() => {
        new GoogleService(mocks.logger, mocks.cache, mocks.utils, mocks.exceptionService);
      }).toThrow('Abstract class GoogleService cannot be instantiated directly.');
    });

    it('should allow instantiation of subclasses', () => {
      class ConcreteService extends GoogleService {
        constructor(logger, cache, utils, exceptionService) {
          super(logger, cache, utils, exceptionService);
        }
      }

      const service = new ConcreteService(
        mocks.logger,
        mocks.cache,
        mocks.utils,
        mocks.exceptionService
      );

      expect(service).toBeInstanceOf(GoogleService);
      expect(service).toBeInstanceOf(ConcreteService);
    });

    it('should properly store dependencies in protected properties', () => {
      class ConcreteService extends GoogleService {
        getLogger() {
          return this._logger;
        }
        getCache() {
          return this._cache;
        }
        getUtils() {
          return this._utils;
        }
        getExceptionService() {
          return this._exceptionService;
        }
      }

      const service = new ConcreteService(
        mocks.logger,
        mocks.cache,
        mocks.utils,
        mocks.exceptionService
      );

      expect(service.getLogger()).toBe(mocks.logger);
      expect(service.getCache()).toBe(mocks.cache);
      expect(service.getUtils()).toBe(mocks.utils);
      expect(service.getExceptionService()).toBe(mocks.exceptionService);
    });

    it('should require exceptionService parameter', () => {
      class ConcreteService extends GoogleService {
        getExceptionService() {
          return this._exceptionService;
        }
      }

      expect(() => {
        new ConcreteService(mocks.logger, mocks.cache, mocks.utils, null);
      }).toThrow('GoogleService: exceptionService is required and cannot be null or undefined');
    });

    it('should export GoogleService as alias for backwards compatibility', () => {
      expect(GoogleService).toBe(GoogleService);
    });
  });

  // ===================================================================
  // _verifyAdvancedService Tests
  // ===================================================================
  describe('_verifyAdvancedService', () => {
    let service;

    beforeEach(() => {
      class ConcreteService extends GoogleService {
        verifyService(name) {
          return this._verifyAdvancedService(name);
        }
      }
      service = new ConcreteService(mocks.logger, mocks.cache, mocks.utils, mocks.exceptionService);
    });

    it('should return true when service exists in globalThis', () => {
      globalThis.Drive = { Files: {} };

      const result = service.verifyService('Drive');

      expect(result).toBe(true);

      delete globalThis.Drive;
    });

    it('should return false when service does not exist', () => {
      const result = service.verifyService('NonExistentService');

      expect(result).toBe(false);
    });

    it('should return false when service is undefined', () => {
      globalThis.TestService = undefined;

      const result = service.verifyService('TestService');

      expect(result).toBe(false);

      delete globalThis.TestService;
    });

    it('should handle errors gracefully and return false', () => {
      // Create a getter that throws an error
      Object.defineProperty(globalThis, 'ErrorService', {
        get() {
          throw new Error('Access denied');
        },
        configurable: true
      });

      const result = service.verifyService('ErrorService');

      expect(result).toBe(false);

      delete globalThis.ErrorService;
    });

    it('should return true when service is defined but null', () => {
      globalThis.NullService = null;

      const result = service.verifyService('NullService');

      // typeof null is 'object', so it's !== 'undefined'
      expect(result).toBe(true);

      delete globalThis.NullService;
    });
  });

  // ===================================================================
  // _generateCacheKey Tests
  // ===================================================================
  describe('_generateCacheKey', () => {
    let service;

    beforeEach(() => {
      class ConcreteService extends GoogleService {
        generateKey(prefix, id, method) {
          return this._generateCacheKey(prefix, id, method);
        }
      }
      service = new ConcreteService(mocks.logger, mocks.cache, mocks.utils, mocks.exceptionService);
    });

    it('should generate cache key with correct format', () => {
      const key = service.generateKey('drive', 'abc123', 'get');

      expect(key).toBe('drive_abc123_get');
    });

    it('should handle different prefix/id/method combinations', () => {
      expect(service.generateKey('sheet', 'xyz789', 'update')).toBe('sheet_xyz789_update');
      expect(service.generateKey('doc', '12345', 'create')).toBe('doc_12345_create');
      expect(service.generateKey('mail', 'draft1', 'send')).toBe('mail_draft1_send');
    });

    it('should handle special characters in parameters', () => {
      const key = service.generateKey('drive-v2', 'file@123', 'get:metadata');

      expect(key).toBe('drive-v2_file@123_get:metadata');
    });

    it('should handle empty strings', () => {
      const key = service.generateKey('', '', '');

      expect(key).toBe('__');
    });

    it('should handle numeric parameters (converted to strings)', () => {
      const key = service.generateKey('cache', 123, 456);

      expect(key).toBe('cache_123_456');
    });
  });

  // ===================================================================
  // _getOrExecute Tests
  // ===================================================================
  describe('_getOrExecute', () => {
    let service;

    beforeEach(() => {
      class ConcreteService extends GoogleService {
        getOrExecute(key, func, expirationSeconds, useCache) {
          return this._getOrExecute(key, func, expirationSeconds, useCache);
        }
      }
      service = new ConcreteService(mocks.logger, mocks.cache, mocks.utils, mocks.exceptionService);
    });

    it('should return cached value on cache hit', () => {
      const cachedValue = { data: 'cached' };
      mocks.cache.get.mockReturnValue(cachedValue);

      const func = jest.fn();
      const result = service.getOrExecute('testKey', func);

      expect(result).toBe(cachedValue);
      expect(mocks.cache.get).toHaveBeenCalledWith('testKey');
      expect(func).not.toHaveBeenCalled();
      expect(mocks.logger.debug).toHaveBeenCalledWith('Cache hit for key: testKey');
    });

    it('should execute function and cache result on cache miss', () => {
      mocks.cache.get.mockReturnValue(null);
      const computedValue = { data: 'computed' };
      const func = jest.fn().mockReturnValue(computedValue);

      const result = service.getOrExecute('testKey', func, 300);

      expect(result).toBe(computedValue);
      expect(mocks.cache.get).toHaveBeenCalledWith('testKey');
      expect(func).toHaveBeenCalled();
      expect(mocks.cache.put).toHaveBeenCalledWith('testKey', computedValue, 300);
      expect(mocks.logger.debug).toHaveBeenCalledWith('Cache miss for key: testKey');
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        'Cached result for key: testKey (expires in 300s)'
      );
    });

    it('should bypass cache when useCache is false', () => {
      const computedValue = { data: 'computed' };
      const func = jest.fn().mockReturnValue(computedValue);

      const result = service.getOrExecute('testKey', func, 300, false);

      expect(result).toBe(computedValue);
      expect(mocks.cache.get).not.toHaveBeenCalled();
      expect(func).toHaveBeenCalled();
      expect(mocks.cache.put).not.toHaveBeenCalled();
    });

    it('should not cache null results', () => {
      mocks.cache.get.mockReturnValue(null);
      const func = jest.fn().mockReturnValue(null);

      const result = service.getOrExecute('testKey', func);

      expect(result).toBeNull();
      expect(func).toHaveBeenCalled();
      expect(mocks.cache.put).not.toHaveBeenCalled();
    });

    it('should not cache undefined results', () => {
      mocks.cache.get.mockReturnValue(null);
      const func = jest.fn().mockReturnValue(undefined);

      const result = service.getOrExecute('testKey', func);

      expect(result).toBeUndefined();
      expect(func).toHaveBeenCalled();
      expect(mocks.cache.put).not.toHaveBeenCalled();
    });

    it('should use default expiration (600s) when not specified', () => {
      mocks.cache.get.mockReturnValue(null);
      const computedValue = { data: 'computed' };
      const func = jest.fn().mockReturnValue(computedValue);

      service.getOrExecute('testKey', func);

      expect(mocks.cache.put).toHaveBeenCalledWith('testKey', computedValue, 600);
    });

    it('should cache falsy values except null and undefined', () => {
      mocks.cache.get.mockReturnValue(null);

      // Test with 0
      const func1 = jest.fn().mockReturnValue(0);
      service.getOrExecute('key1', func1);
      expect(mocks.cache.put).toHaveBeenCalledWith('key1', 0, 600);

      // Test with false
      const func2 = jest.fn().mockReturnValue(false);
      service.getOrExecute('key2', func2);
      expect(mocks.cache.put).toHaveBeenCalledWith('key2', false, 600);

      // Test with empty string
      const func3 = jest.fn().mockReturnValue('');
      service.getOrExecute('key3', func3);
      expect(mocks.cache.put).toHaveBeenCalledWith('key3', '', 600);
    });

    it('should handle function that throws error', () => {
      mocks.cache.get.mockReturnValue(null);
      const func = jest.fn().mockImplementation(() => {
        throw new Error('Function failed');
      });

      expect(() => {
        service.getOrExecute('testKey', func);
      }).toThrow('Function failed');

      expect(mocks.cache.put).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // _invalidateCache Tests
  // ===================================================================
  describe('_invalidateCache', () => {
    let service;

    beforeEach(() => {
      class ConcreteService extends GoogleService {
        invalidate(key) {
          return this._invalidateCache(key);
        }
      }
      service = new ConcreteService(mocks.logger, mocks.cache, mocks.utils, mocks.exceptionService);
    });

    it('should remove cache entry and log debug message', () => {
      service.invalidate('testKey');

      expect(mocks.cache.remove).toHaveBeenCalledWith('testKey');
      expect(mocks.logger.debug).toHaveBeenCalledWith('Invalidated cache for key: testKey');
    });

    it('should handle invalidation of non-existent key', () => {
      service.invalidate('nonExistentKey');

      expect(mocks.cache.remove).toHaveBeenCalledWith('nonExistentKey');
      expect(mocks.logger.debug).toHaveBeenCalledWith('Invalidated cache for key: nonExistentKey');
    });

    it('should handle multiple invalidations', () => {
      service.invalidate('key1');
      service.invalidate('key2');
      service.invalidate('key3');

      expect(mocks.cache.remove).toHaveBeenCalledTimes(3);
      expect(mocks.logger.debug).toHaveBeenCalledTimes(3);
    });
  });

  // ===================================================================
  // _invalidateCacheByPrefix Tests
  // ===================================================================
  describe('_invalidateCacheByPrefix', () => {
    let service;

    beforeEach(() => {
      class ConcreteService extends GoogleService {
        invalidateByPrefix(prefix) {
          return this._invalidateCacheByPrefix(prefix);
        }
      }
      service = new ConcreteService(mocks.logger, mocks.cache, mocks.utils, mocks.exceptionService);
    });

    it('should call removeByPrefix when cache service supports it', () => {
      service.invalidateByPrefix('drive_');

      expect(mocks.cache.removeByPrefix).toHaveBeenCalledWith('drive_');
      expect(mocks.logger.debug).toHaveBeenCalledWith('Invalidated cache with prefix: drive_');
    });

    it('should log warning when cache service does not support removeByPrefix', () => {
      const cacheWithoutPrefix = {
        get: jest.fn(),
        put: jest.fn(),
        remove: jest.fn()
        // No removeByPrefix method
      };

      class ConcreteService extends GoogleService {
        invalidateByPrefix(prefix) {
          return this._invalidateCacheByPrefix(prefix);
        }
      }

      const serviceNoPrefix = new ConcreteService(
        mocks.logger,
        cacheWithoutPrefix,
        mocks.utils,
        mocks.exceptionService
      );

      serviceNoPrefix.invalidateByPrefix('test_');

      expect(mocks.logger.warn).toHaveBeenCalledWith(
        'Cache service does not support prefix-based invalidation'
      );
    });

    it('should handle different prefixes', () => {
      service.invalidateByPrefix('drive_file123_');
      service.invalidateByPrefix('sheet_abc_');
      service.invalidateByPrefix('doc_');

      expect(mocks.cache.removeByPrefix).toHaveBeenCalledTimes(3);
      expect(mocks.logger.debug).toHaveBeenCalledTimes(3);
    });

    it('should handle empty prefix', () => {
      service.invalidateByPrefix('');

      expect(mocks.cache.removeByPrefix).toHaveBeenCalledWith('');
      expect(mocks.logger.debug).toHaveBeenCalledWith('Invalidated cache with prefix: ');
    });

    it('should handle cache service with removeByPrefix as undefined', () => {
      mocks.cache.removeByPrefix = undefined;

      service.invalidateByPrefix('test_');

      expect(mocks.logger.warn).toHaveBeenCalledWith(
        'Cache service does not support prefix-based invalidation'
      );
    });
  });

  // ===================================================================
  // _executeWithRetry Tests
  // ===================================================================
  describe('_executeWithRetry', () => {
    let service;

    beforeEach(() => {
      class ConcreteService extends GoogleService {
        executeWithRetry(func, context, maxAttempts) {
          return this._executeWithRetry(func, context, maxAttempts);
        }
      }
      service = new ConcreteService(mocks.logger, mocks.cache, mocks.utils, mocks.exceptionService);
    });

    it('should use exceptionService.executeWithRetry when available', () => {
      const func = jest.fn().mockReturnValue('result');
      const context = { fileId: '123' };
      mocks.exceptionService.executeWithRetry.mockReturnValue('result');

      const result = service.executeWithRetry(func, context, 5);

      expect(mocks.exceptionService.executeWithRetry).toHaveBeenCalledWith(func, context, 5);
      expect(result).toBe('result');
    });

    it('should require exceptionService parameter', () => {
      class ConcreteService extends GoogleService {
        executeWithRetry(func, context, maxAttempts) {
          return this._executeWithRetry(func, context, maxAttempts);
        }
      }

      expect(() => {
        new ConcreteService(
          mocks.logger,
          mocks.cache,
          mocks.utils,
          null // No exception service
        );
      }).toThrow('GoogleService: exceptionService is required and cannot be null or undefined');
    });

    it('should require exceptionService to have executeWithRetry method', () => {
      const exceptionServiceWithoutRetry = {
        executeWithBypass: jest.fn()
        // No executeWithRetry method
      };

      class ConcreteService extends GoogleService {
        executeWithRetry(func, context, maxAttempts) {
          return this._executeWithRetry(func, context, maxAttempts);
        }
      }

      expect(() => {
        new ConcreteService(mocks.logger, mocks.cache, mocks.utils, exceptionServiceWithoutRetry);
      }).toThrow('GoogleService: exceptionService must have method: executeWithRetry');
    });

    it('should use default context and maxAttempts when not specified', () => {
      const func = jest.fn().mockReturnValue('result');
      mocks.exceptionService.executeWithRetry.mockReturnValue('result');

      service.executeWithRetry(func);

      expect(mocks.exceptionService.executeWithRetry).toHaveBeenCalledWith(func, {}, 3);
    });

    it('should handle errors thrown by function', () => {
      const func = jest.fn().mockImplementation(() => {
        throw new Error('Function error');
      });

      mocks.exceptionService.executeWithRetry.mockImplementation((f) => {
        return f(); // Simulate retry by calling function
      });

      expect(() => {
        service.executeWithRetry(func, {}, 3);
      }).toThrow('Function error');
    });

    it('should pass through return value from exceptionService', () => {
      const func = jest.fn();
      mocks.exceptionService.executeWithRetry.mockReturnValue({ data: 'success', retries: 2 });

      const result = service.executeWithRetry(func, { test: true }, 5);

      expect(result).toEqual({ data: 'success', retries: 2 });
    });

    it('should throw error when exceptionService is undefined', () => {
      class ConcreteService extends GoogleService {
        executeWithRetry(func, context, maxAttempts) {
          return this._executeWithRetry(func, context, maxAttempts);
        }
      }

      expect(() => {
        new ConcreteService(mocks.logger, mocks.cache, mocks.utils, undefined);
      }).toThrow('GoogleService: exceptionService is required and cannot be null or undefined');
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should work in realistic service subclass scenario', () => {
      class DriveServiceMock extends GoogleService {
        constructor(logger, cache, utils, exceptionService) {
          super(logger, cache, utils, exceptionService);
          this._cachePrefix = 'drive';
        }

        getFile(fileId) {
          const cacheKey = this._generateCacheKey(this._cachePrefix, fileId, 'get');

          return this._getOrExecute(
            cacheKey,
            () => {
              return this._executeWithRetry(
                () => {
                  // Simulate Drive API call
                  if (this._verifyAdvancedService('Drive')) {
                    return { id: fileId, name: 'Test File' };
                  }
                  throw new Error('Drive service not available');
                },
                { fileId },
                3
              );
            },
            600,
            true
          );
        }

        invalidateFile(fileId) {
          const cacheKey = this._generateCacheKey(this._cachePrefix, fileId, 'get');
          this._invalidateCache(cacheKey);
        }
      }

      globalThis.Drive = { Files: {} };
      mocks.cache.get.mockReturnValue(null);
      mocks.exceptionService.executeWithRetry.mockImplementation((func) => func());

      const driveService = new DriveServiceMock(
        mocks.logger,
        mocks.cache,
        mocks.utils,
        mocks.exceptionService
      );

      // First call - cache miss
      const result1 = driveService.getFile('123');
      expect(result1).toEqual({ id: '123', name: 'Test File' });
      expect(mocks.cache.put).toHaveBeenCalledWith('drive_123_get', result1, 600);

      // Invalidate cache
      driveService.invalidateFile('123');
      expect(mocks.cache.remove).toHaveBeenCalledWith('drive_123_get');

      delete globalThis.Drive;
    });
  });
});
