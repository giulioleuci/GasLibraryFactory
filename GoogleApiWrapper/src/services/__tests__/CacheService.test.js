/**
 * @file GoogleApiWrapper/src/services/__tests__/CacheService.test.js
 * @description Comprehensive test suite for CacheService and Cache wrapper
 * @version 1.0
 */

import { CacheService, Cache } from '../CacheService';
import { MockFactory } from '../../../../test/fakes/MockFactory';

describe('CacheService - Comprehensive Test Suite', () => {
  let mocks;
  let mockGasCache;
  let mockGasCacheService;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

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
    global.CacheService = mockGasCacheService;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.CacheService;
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
    let cache;

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

      it('should initialize empty tracked keys set', () => {
        expect(cache._trackedKeys).toBeInstanceOf(Set);
        expect(cache._trackedKeys.size).toBe(0);
      });

      it('should initialize auto track keys to false', () => {
        expect(cache._autoTrackKeys).toBe(false);
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

    describe('Key Tracking Features', () => {
      describe('enableKeyTracking()', () => {
        it('should enable auto key tracking', () => {
          cache.enableKeyTracking();

          expect(cache._autoTrackKeys).toBe(true);
        });

        it('should return cache instance for chaining', () => {
          const result = cache.enableKeyTracking();

          expect(result).toBe(cache);
        });

        it('should log debug message', () => {
          cache.enableKeyTracking();

          expect(mocks.logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('Key tracking enabled')
          );
        });
      });

      describe('disableKeyTracking()', () => {
        it('should disable auto key tracking', () => {
          cache.enableKeyTracking();
          cache.disableKeyTracking();

          expect(cache._autoTrackKeys).toBe(false);
        });

        it('should return cache instance for chaining', () => {
          const result = cache.disableKeyTracking();

          expect(result).toBe(cache);
        });

        it('should log debug message', () => {
          cache.disableKeyTracking();

          expect(mocks.logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('Key tracking disabled')
          );
        });
      });

      describe('trackKey()', () => {
        it('should add key to tracked keys', () => {
          cache.trackKey('my-key');

          expect(cache._trackedKeys.has('my-key')).toBe(true);
        });

        it('should return cache instance for chaining', () => {
          const result = cache.trackKey('key');

          expect(result).toBe(cache);
        });

        it('should allow tracking multiple keys', () => {
          cache.trackKey('key1').trackKey('key2').trackKey('key3');

          expect(cache._trackedKeys.size).toBe(3);
        });
      });

      describe('getTrackedKeyCount()', () => {
        it('should return 0 when no keys tracked', () => {
          expect(cache.getTrackedKeyCount()).toBe(0);
        });

        it('should return correct count of tracked keys', () => {
          cache.trackKey('a').trackKey('b').trackKey('c');

          expect(cache.getTrackedKeyCount()).toBe(3);
        });
      });

      describe('clearTrackedKeys()', () => {
        it('should clear all tracked keys', () => {
          cache.trackKey('a').trackKey('b').trackKey('c');

          cache.clearTrackedKeys();

          expect(cache._trackedKeys.size).toBe(0);
        });

        it('should return cache instance for chaining', () => {
          const result = cache.clearTrackedKeys();

          expect(result).toBe(cache);
        });

        it('should log debug message', () => {
          cache.clearTrackedKeys();

          expect(mocks.logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('Cleared tracked keys')
          );
        });
      });

      describe('put() with key tracking', () => {
        it('should track key when auto tracking is enabled', () => {
          cache.enableKeyTracking();
          cache.put('tracked-key', 'value', 600);

          expect(cache._trackedKeys.has('tracked-key')).toBe(true);
        });

        it('should not track key when auto tracking is disabled', () => {
          cache.put('untracked-key', 'value', 600);

          expect(cache._trackedKeys.has('untracked-key')).toBe(false);
        });
      });

      describe('putAll() with key tracking', () => {
        it('should track all keys when auto tracking is enabled', () => {
          cache.enableKeyTracking();
          cache.putAll({ key1: 'v1', key2: 'v2', key3: 'v3' }, 600);

          expect(cache._trackedKeys.has('key1')).toBe(true);
          expect(cache._trackedKeys.has('key2')).toBe(true);
          expect(cache._trackedKeys.has('key3')).toBe(true);
        });

        it('should not track keys when auto tracking is disabled', () => {
          cache.putAll({ key1: 'v1', key2: 'v2' }, 600);

          expect(cache._trackedKeys.size).toBe(0);
        });
      });

      describe('remove() with key tracking', () => {
        it('should remove key from tracked keys', () => {
          cache.trackKey('key-to-remove');

          cache.remove('key-to-remove');

          expect(cache._trackedKeys.has('key-to-remove')).toBe(false);
        });
      });

      describe('removeAll() with key tracking', () => {
        it('should remove keys from tracked keys', () => {
          cache.trackKey('key1').trackKey('key2').trackKey('key3');

          cache.removeAll(['key1', 'key2']);

          expect(cache._trackedKeys.has('key1')).toBe(false);
          expect(cache._trackedKeys.has('key2')).toBe(false);
          expect(cache._trackedKeys.has('key3')).toBe(true);
        });
      });

      describe('removeByPrefix()', () => {
        it('should return 0 when no tracked keys', () => {
          const removed = cache.removeByPrefix('prefix_');

          expect(removed).toBe(0);
          expect(mockGasCache.removeAll).not.toHaveBeenCalled();
        });

        it('should return 0 when no keys match prefix', () => {
          cache.trackKey('other_key1').trackKey('other_key2');

          const removed = cache.removeByPrefix('prefix_');

          expect(removed).toBe(0);
          expect(mockGasCache.removeAll).not.toHaveBeenCalled();
        });

        it('should remove keys matching prefix', () => {
          cache.trackKey('user_123_profile');
          cache.trackKey('user_123_settings');
          cache.trackKey('user_456_profile');
          cache.trackKey('other_key');

          const removed = cache.removeByPrefix('user_123_');

          expect(removed).toBe(2);
          expect(mockGasCache.removeAll).toHaveBeenCalledWith([
            'user_123_profile',
            'user_123_settings'
          ]);
        });

        it('should remove matching keys from tracked keys set', () => {
          cache.trackKey('prefix_a');
          cache.trackKey('prefix_b');
          cache.trackKey('other');

          cache.removeByPrefix('prefix_');

          expect(cache._trackedKeys.has('prefix_a')).toBe(false);
          expect(cache._trackedKeys.has('prefix_b')).toBe(false);
          expect(cache._trackedKeys.has('other')).toBe(true);
        });

        it('should log debug message on success', () => {
          cache.trackKey('api_data');
          cache.removeByPrefix('api_');

          expect(mocks.logger.debug).toHaveBeenCalledWith(
            expect.stringContaining("Removed 1 keys with prefix 'api_'")
          );
        });

        it('should log debug message when no tracked keys', () => {
          cache.removeByPrefix('prefix_');

          expect(mocks.logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('No tracked keys')
          );
        });

        it('should log debug message when no matching keys', () => {
          cache.trackKey('other');
          cache.removeByPrefix('prefix_');

          expect(mocks.logger.debug).toHaveBeenCalledWith(
            expect.stringContaining("No keys matching prefix 'prefix_'")
          );
        });

        it('should throw on error', () => {
          cache.trackKey('key');
          mockGasCache.removeAll.mockImplementation(() => {
            throw new Error('Remove failed');
          });

          expect(() => cache.removeByPrefix('ke')).toThrow('Remove failed');
          expect(mocks.logger.error).toHaveBeenCalled();
        });

        it('should work with empty prefix (removes all tracked)', () => {
          cache.trackKey('a').trackKey('b').trackKey('c');

          const removed = cache.removeByPrefix('');

          expect(removed).toBe(3);
          expect(cache._trackedKeys.size).toBe(0);
        });

        it('should work with auto-tracked keys', () => {
          cache.enableKeyTracking();
          cache.put('drive_abc_meta', 'meta', 600);
          cache.put('drive_abc_content', 'content', 600);
          cache.put('sheet_xyz_data', 'data', 600);

          const removed = cache.removeByPrefix('drive_abc_');

          expect(removed).toBe(2);
          expect(cache._trackedKeys.has('sheet_xyz_data')).toBe(true);
        });
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
    let cacheService;
    let cache;

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
      const parsed = JSON.parse(retrieved);

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
    let cache;

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
