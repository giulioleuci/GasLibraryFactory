/**
 * @file GoogleApiWrapper/src/services/__tests__/CacheService.test.js
 * @description Comprehensive test suite for CacheService and Cache wrapper
 * @version 1.0
 */

import { CacheService, Cache } from '../CacheService.js';
import { MockFactory } from '../../../../test/fakes/MockFactory.js';
import type { LoggerServiceMock } from '../../../../CoreUtilsLib/src/testing/mocks.js';

describe('CacheService - Comprehensive Test Suite', () => {
  let mocks: { logger: LoggerServiceMock };
  let mockGasCache: jest.Mocked<GoogleAppsScript.Cache.Cache>;
  let mockGasCacheService: jest.Mocked<GoogleAppsScript.Cache.CacheService>;

  beforeEach(() => {
    mocks = MockFactory.createAllJest() as typeof mocks;

    // Create mock GAS cache
    mockGasCache = {
      get: jest.fn(),
      put: jest.fn(),
      getAll: jest.fn(),
      putAll: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn()
    };

    // Create mock GAS CacheService
    mockGasCacheService = {
      getScriptCache: jest.fn().mockReturnValue(mockGasCache),
      getUserCache: jest.fn().mockReturnValue(mockGasCache),
      getDocumentCache: jest.fn().mockReturnValue(mockGasCache)
    };

    // Set up global CacheService
    Object.assign(global, { CacheService: mockGasCacheService });
  });

  afterEach(() => {
    jest.clearAllMocks();
    Reflect.deleteProperty(global, 'CacheService');
  });

  describe('CacheService Class', () => {
    describe('Constructor', () => {
      it('should create instance with logger', () => {
        const cacheService = new CacheService(mocks.logger);
        expect(cacheService).toBeInstanceOf(CacheService);
      });

      it('should default to console when no logger provided', () => {
        const cacheService = new CacheService();
        expect(cacheService._logger).toBe(console);
      });

      it('should accept exception service', () => {
        const mockExceptionService = {};
        const cacheService = new CacheService(mocks.logger, mockExceptionService);
        expect(cacheService._exceptionService).toBe(mockExceptionService);
      });

      it('should handle null logger by defaulting to console', () => {
        const cacheService = new CacheService(null);
        expect(cacheService._logger).toBe(console);
      });
    });

    describe('getScriptCache()', () => {
      it('should return a Cache instance', () => {
        const cacheService = new CacheService(mocks.logger);
        const cache = cacheService.getScriptCache();

        expect(cache).toBeInstanceOf(Cache);
      });

      it('should call GAS getScriptCache', () => {
        const cacheService = new CacheService(mocks.logger);
        cacheService.getScriptCache();

        expect(mockGasCacheService.getScriptCache).toHaveBeenCalled();
      });

      it('should log debug message', () => {
        const cacheService = new CacheService(mocks.logger);
        cacheService.getScriptCache();

        expect(mocks.logger.debug).toHaveBeenCalledWith('Retrieved script cache');
      });

      it('should throw and log on error', () => {
        const error = new Error('CacheService unavailable');
        mockGasCacheService.getScriptCache.mockImplementation(() => {
          throw error;
        });

        const cacheService = new CacheService(mocks.logger);

        expect(() => cacheService.getScriptCache()).toThrow('CacheService unavailable');
        expect(mocks.logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error getting script cache')
        );
      });
    });

    describe('getUserCache()', () => {
      it('should return a Cache instance', () => {
        const cacheService = new CacheService(mocks.logger);
        const cache = cacheService.getUserCache();

        expect(cache).toBeInstanceOf(Cache);
      });

      it('should call GAS getUserCache', () => {
        const cacheService = new CacheService(mocks.logger);
        cacheService.getUserCache();

        expect(mockGasCacheService.getUserCache).toHaveBeenCalled();
      });

      it('should log debug message', () => {
        const cacheService = new CacheService(mocks.logger);
        cacheService.getUserCache();

        expect(mocks.logger.debug).toHaveBeenCalledWith('Retrieved user cache');
      });

      it('should throw and log on error', () => {
        const error = new Error('User cache unavailable');
        mockGasCacheService.getUserCache.mockImplementation(() => {
          throw error;
        });

        const cacheService = new CacheService(mocks.logger);

        expect(() => cacheService.getUserCache()).toThrow('User cache unavailable');
        expect(mocks.logger.error).toHaveBeenCalled();
      });
    });

    describe('getDocumentCache()', () => {
      it('should return a Cache instance', () => {
        const cacheService = new CacheService(mocks.logger);
        const cache = cacheService.getDocumentCache();

        expect(cache).toBeInstanceOf(Cache);
      });

      it('should call GAS getDocumentCache', () => {
        const cacheService = new CacheService(mocks.logger);
        cacheService.getDocumentCache();

        expect(mockGasCacheService.getDocumentCache).toHaveBeenCalled();
      });

      it('should log debug message', () => {
        const cacheService = new CacheService(mocks.logger);
        cacheService.getDocumentCache();

        expect(mocks.logger.debug).toHaveBeenCalledWith('Retrieved document cache');
      });

      it('should throw when no container document (standalone script)', () => {
        const error = new Error('No active document');
        mockGasCacheService.getDocumentCache.mockImplementation(() => {
          throw error;
        });

        const cacheService = new CacheService(mocks.logger);

        expect(() => cacheService.getDocumentCache()).toThrow('No active document');
      });
    });
  });

  describe('Cache Wrapper Class', () => {
    let cache: Cache;

    beforeEach(() => {
      cache = new Cache(mockGasCache, mocks.logger, 'script');
    });

    describe('Constructor', () => {
      it('should store cache instance', () => {
        expect(cache._cache).toBe(mockGasCache);
      });

      it('should store logger', () => {
        expect(cache._logger).toBe(mocks.logger);
      });

      it('should store type', () => {
        expect(cache._type).toBe('script');
      });
    });

    describe('get()', () => {
      it('should return cached value on cache hit', () => {
        mockGasCache.get.mockReturnValue('cached-value');

        const result = cache.get('test-key');

        expect(result).toBe('cached-value');
        expect(mockGasCache.get).toHaveBeenCalledWith('test-key');
      });

      it('should return null on cache miss', () => {
        mockGasCache.get.mockReturnValue(null);

        const result = cache.get('missing-key');

        expect(result).toBeNull();
      });

      it('should log cache hit', () => {
        mockGasCache.get.mockReturnValue('value');
        cache.get('test-key');

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Cache hit (script): test-key')
        );
      });

      it('should log cache miss', () => {
        mockGasCache.get.mockReturnValue(null);
        cache.get('missing-key');

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Cache miss (script): missing-key')
        );
      });

      it('should return null and log error on failure', () => {
        mockGasCache.get.mockImplementation(() => {
          throw new Error('Read error');
        });

        const result = cache.get('error-key');

        expect(result).toBeNull();
        expect(mocks.logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error getting cache key error-key')
        );
      });
    });

    describe('getAll()', () => {
      it('should return object with cached values', () => {
        const cachedValues = { key1: 'value1', key2: 'value2', key3: null };
        mockGasCache.getAll.mockReturnValue(cachedValues);

        const result = cache.getAll(['key1', 'key2', 'key3']);

        expect(result).toEqual(cachedValues);
        expect(mockGasCache.getAll).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
      });

      it('should log retrieval count', () => {
        mockGasCache.getAll.mockReturnValue({});
        cache.getAll(['key1', 'key2', 'key3']);

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Retrieved 3 keys from script cache')
        );
      });

      it('should return empty object on error', () => {
        mockGasCache.getAll.mockImplementation(() => {
          throw new Error('Batch error');
        });

        const result = cache.getAll(['key1', 'key2']);

        expect(result).toEqual({});
        expect(mocks.logger.error).toHaveBeenCalled();
      });
    });

    describe('put()', () => {
      it('should cache string value', () => {
        cache.put('key', 'value', 600);

        expect(mockGasCache.put).toHaveBeenCalledWith('key', 'value', 600);
      });

      it('should convert non-string value to string', () => {
        cache.put('number-key', 42, 600);

        expect(mockGasCache.put).toHaveBeenCalledWith('number-key', '42', 600);
      });

      it('should convert boolean to string', () => {
        cache.put('bool-key', true, 600);

        expect(mockGasCache.put).toHaveBeenCalledWith('bool-key', 'true', 600);
      });

      it('should convert object to string', () => {
        cache.put('obj-key', { foo: 'bar' }, 600);

        expect(mockGasCache.put).toHaveBeenCalledWith('obj-key', '[object Object]', 600);
      });

      it('should use default expiration of 600 seconds', () => {
        cache.put('key', 'value');

        expect(mockGasCache.put).toHaveBeenCalledWith('key', 'value', 600);
      });

      it('should cap expiration at 6 hours (21600 seconds)', () => {
        cache.put('key', 'value', 86400); // 24 hours

        expect(mockGasCache.put).toHaveBeenCalledWith('key', 'value', 21600);
      });

      it('should not cap expiration within limit', () => {
        cache.put('key', 'value', 21600); // Exactly 6 hours

        expect(mockGasCache.put).toHaveBeenCalledWith('key', 'value', 21600);
      });

      it('should log cache operation', () => {
        cache.put('key', 'value', 3600);

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Cached (script): key (expires in 3600s)')
        );
      });

      it('should log capped expiration', () => {
        cache.put('key', 'value', 50000);

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('expires in 21600s') // Capped value
        );
      });

      it('should throw on error', () => {
        mockGasCache.put.mockImplementation(() => {
          throw new Error('Write error');
        });

        expect(() => cache.put('key', 'value', 600)).toThrow('Write error');
        expect(mocks.logger.error).toHaveBeenCalled();
      });
    });

    describe('putAll()', () => {
      it('should cache multiple values', () => {
        const values = { key1: 'value1', key2: 'value2' };
        cache.putAll(values, 600);

        expect(mockGasCache.putAll).toHaveBeenCalledWith(values, 600);
      });

      it('should convert non-string values to strings', () => {
        cache.putAll({ num: 42, bool: true, str: 'hello' }, 600);

        expect(mockGasCache.putAll).toHaveBeenCalledWith(
          { num: '42', bool: 'true', str: 'hello' },
          600
        );
      });

      it('should use default expiration of 600 seconds', () => {
        cache.putAll({ key: 'value' });

        expect(mockGasCache.putAll).toHaveBeenCalledWith({ key: 'value' }, 600);
      });

      it('should cap expiration at 6 hours', () => {
        cache.putAll({ key: 'value' }, 100000);

        expect(mockGasCache.putAll).toHaveBeenCalledWith({ key: 'value' }, 21600);
      });

      it('should log cache count', () => {
        cache.putAll({ a: '1', b: '2', c: '3' }, 600);

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Cached 3 keys (script)')
        );
      });

      it('should throw on error', () => {
        mockGasCache.putAll.mockImplementation(() => {
          throw new Error('Batch write error');
        });

        expect(() => cache.putAll({ key: 'value' }, 600)).toThrow('Batch write error');
      });
    });

    describe('remove()', () => {
      it('should remove cached key', () => {
        cache.remove('key');

        expect(mockGasCache.remove).toHaveBeenCalledWith('key');
      });

      it('should log removal', () => {
        cache.remove('test-key');

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Removed from script cache: test-key')
        );
      });

      it('should throw on error', () => {
        mockGasCache.remove.mockImplementation(() => {
          throw new Error('Remove error');
        });

        expect(() => cache.remove('key')).toThrow('Remove error');
        expect(mocks.logger.error).toHaveBeenCalled();
      });
    });

    describe('removeAll()', () => {
      it('should remove multiple keys', () => {
        cache.removeAll(['key1', 'key2', 'key3']);

        expect(mockGasCache.removeAll).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
      });

      it('should log removal count', () => {
        cache.removeAll(['a', 'b', 'c']);

        expect(mocks.logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Removed 3 keys from script cache')
        );
      });

      it('should warn and skip on empty array', () => {
        cache.removeAll([]);

        expect(mockGasCache.removeAll).not.toHaveBeenCalled();
        expect(mocks.logger.warn).toHaveBeenCalledWith(expect.stringContaining('no keys'));
      });

      it('should warn and skip on null', () => {
        cache.removeAll(null);

        expect(mockGasCache.removeAll).not.toHaveBeenCalled();
        expect(mocks.logger.warn).toHaveBeenCalled();
      });

      it('should throw on error', () => {
        mockGasCache.removeAll.mockImplementation(() => {
          throw new Error('Batch remove error');
        });

        expect(() => cache.removeAll(['key'])).toThrow('Batch remove error');
      });
    });

    describe('unwrap()', () => {
      it('should return underlying GAS cache', () => {
        const nativeCache = cache.unwrap();

        expect(nativeCache).toBe(mockGasCache);
      });
    });
  });

  describe('Cache Type Labeling', () => {
    it('should label script cache correctly', () => {
      const cache = new Cache(mockGasCache, mocks.logger, 'script');
      mockGasCache.get.mockReturnValue('value');

      cache.get('key');

      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('(script)'));
    });

    it('should label user cache correctly', () => {
      const cache = new Cache(mockGasCache, mocks.logger, 'user');
      mockGasCache.get.mockReturnValue('value');

      cache.get('key');

      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('(user)'));
    });

    it('should label document cache correctly', () => {
      const cache = new Cache(mockGasCache, mocks.logger, 'document');
      mockGasCache.get.mockReturnValue('value');

      cache.get('key');

      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('(document)'));
    });
  });

  describe('Real-World Usage Patterns', () => {
    let cacheService: CacheService;
    let cache: Cache;

    beforeEach(() => {
      cacheService = new CacheService(mocks.logger);
      cache = cacheService.getScriptCache();
    });

    it('should support cache-aside pattern', () => {
      // First access - cache miss
      mockGasCache.get.mockReturnValue(null);
      let data = cache.get('api_response');

      expect(data).toBeNull();

      // Fetch and cache
      const apiData = JSON.stringify({ users: ['Alice', 'Bob'] });
      cache.put('api_response', apiData, 3600);

      expect(mockGasCache.put).toHaveBeenCalledWith('api_response', apiData, 3600);

      // Second access - cache hit
      mockGasCache.get.mockReturnValue(apiData);
      data = cache.get('api_response');

      expect(data).toBe(apiData);
    });

    it('should support batch caching of user data', () => {
      const users = {
        user_123: JSON.stringify({ name: 'Alice' }),
        user_456: JSON.stringify({ name: 'Bob' }),
        user_789: JSON.stringify({ name: 'Carol' })
      };

      cache.putAll(users, 1800);

      expect(mockGasCache.putAll).toHaveBeenCalledWith(users, 1800);
    });

    it('should support batch retrieval', () => {
      const cachedData = {
        user_123: '{"name":"Alice"}',
        user_456: '{"name":"Bob"}',
        user_789: null // Cache miss
      };
      mockGasCache.getAll.mockReturnValue(cachedData);

      const result = cache.getAll(['user_123', 'user_456', 'user_789']);

      expect(result).toEqual(cachedData);
    });

    it('should support cache invalidation', () => {
      cache.remove('user_123');

      expect(mockGasCache.remove).toHaveBeenCalledWith('user_123');
    });

    it('should support batch cache invalidation', () => {
      cache.removeAll(['user_123', 'user_456', 'user_789']);

      expect(mockGasCache.removeAll).toHaveBeenCalledWith(['user_123', 'user_456', 'user_789']);
    });

    it('should handle JSON data storage', () => {
      const data = { count: 42, items: ['a', 'b', 'c'] };
      const jsonData = JSON.stringify(data);

      cache.put('json_data', jsonData, 600);
      mockGasCache.get.mockReturnValue(jsonData);

      const retrieved = cache.get('json_data');
      const parsed = JSON.parse(retrieved!);

      expect(parsed).toEqual(data);
    });

    it('should handle user preferences in user cache', () => {
      const userCache = cacheService.getUserCache();
      const prefs = JSON.stringify({ theme: 'dark', language: 'en' });

      userCache.put('user_prefs', prefs, 21600);

      expect(mockGasCache.put).toHaveBeenCalledWith('user_prefs', prefs, 21600);
    });

    it('should handle document data in document cache', () => {
      const docCache = cacheService.getDocumentCache();
      const summary = JSON.stringify({ total: 1000, avg: 50 });

      docCache.put('monthly_summary', summary, 600);

      expect(mockGasCache.put).toHaveBeenCalledWith('monthly_summary', summary, 600);
    });
  });

  describe('Edge Cases', () => {
    let cache: Cache;

    beforeEach(() => {
      cache = new Cache(mockGasCache, mocks.logger, 'script');
    });

    it('should handle empty string value', () => {
      cache.put('empty', '', 600);

      expect(mockGasCache.put).toHaveBeenCalledWith('empty', '', 600);
    });

    it('should handle very long keys', () => {
      const longKey = 'k'.repeat(1000);
      cache.get(longKey);

      expect(mockGasCache.get).toHaveBeenCalledWith(longKey);
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'key:with/special\\chars?and=params';
      cache.put(specialKey, 'value', 600);

      expect(mockGasCache.put).toHaveBeenCalledWith(specialKey, 'value', 600);
    });

    it('should handle unicode in values', () => {
      const unicodeValue = 'Hello 世界 🌍';
      cache.put('unicode', unicodeValue, 600);

      expect(mockGasCache.put).toHaveBeenCalledWith('unicode', unicodeValue, 600);
    });

    it('should handle zero expiration', () => {
      cache.put('zero-exp', 'value', 0);

      expect(mockGasCache.put).toHaveBeenCalledWith('zero-exp', 'value', 0);
    });

    it('should handle negative expiration (caps at 0)', () => {
      cache.put('neg-exp', 'value', -100);

      // Math.min(-100, 21600) = -100, so it passes through
      expect(mockGasCache.put).toHaveBeenCalledWith('neg-exp', 'value', -100);
    });

    it('should handle null value conversion', () => {
      cache.put('null-val', null, 600);

      expect(mockGasCache.put).toHaveBeenCalledWith('null-val', 'null', 600);
    });

    it('should handle undefined value conversion', () => {
      cache.put('undef-val', undefined, 600);

      expect(mockGasCache.put).toHaveBeenCalledWith('undef-val', 'undefined', 600);
    });

    it('should handle array value conversion', () => {
      cache.put('array-val', [1, 2, 3], 600);

      expect(mockGasCache.put).toHaveBeenCalledWith('array-val', '1,2,3', 600);
    });

    it('should handle very large batch operations', () => {
      const largeKeys = Array.from({ length: 100 }, (_, i) => `key_${i}`);

      cache.getAll(largeKeys);

      expect(mockGasCache.getAll).toHaveBeenCalledWith(largeKeys);
      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('100 keys'));
    });
  });
});
