// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/CacheUtils.test.js
// ===================================================================
// Comprehensive test suite for CacheUtils
// Coverage: 100% of all static methods
// ===================================================================

import { CacheUtils } from '../internal/CacheUtils';
import { HashUtils } from '../internal/HashUtils';

describe('CacheUtils - Comprehensive Test Suite', () => {
  // ===================================================================
  // STATIC CONSTANTS
  // ===================================================================

  describe('Static Constants', () => {
    it('should have KEY_SEPARATOR constant', () => {
      expect(CacheUtils.KEY_SEPARATOR).toBe('_');
    });

    it('should have MAX_TTL_SECONDS constant (6 hours)', () => {
      expect(CacheUtils.MAX_TTL_SECONDS).toBe(21600);
    });
  });

  // ===================================================================
  // generateKey()
  // ===================================================================

  describe('generateKey()', () => {
    it('should generate key with prefix only', () => {
      const key = CacheUtils.generateKey('user');
      expect(key).toBe('user');
    });

    it('should generate key with prefix and one part', () => {
      const key = CacheUtils.generateKey('user', 123);
      expect(key).toBe('user_123');
    });

    it('should generate key with prefix and multiple parts', () => {
      const key = CacheUtils.generateKey('user', 123, 'profile');
      expect(key).toBe('user_123_profile');
    });

    it('should convert non-string parts to strings', () => {
      const key = CacheUtils.generateKey('api', 1, true, { foo: 'bar' });
      expect(key).toBe('api_1_true_[object Object]');
    });

    it('should filter out null parts', () => {
      const key = CacheUtils.generateKey('user', null, 'profile');
      expect(key).toBe('user_profile');
    });

    it('should filter out undefined parts', () => {
      const key = CacheUtils.generateKey('user', undefined, 'profile');
      expect(key).toBe('user_profile');
    });

    it('should handle empty string parts', () => {
      const key = CacheUtils.generateKey('user', '', 'profile');
      expect(key).toBe('user__profile');
    });
  });

  // ===================================================================
  // generateHashKey()
  // ===================================================================

  describe('generateHashKey()', () => {
    it('should generate key with prefix and hash', () => {
      const obj = { table: 'users', filter: { active: true } };
      const key = CacheUtils.generateHashKey('query', obj);

      expect(key.startsWith('query_')).toBe(true);
      expect(key.length).toBeGreaterThan(10);
    });

    it('should generate consistent hash for same object', () => {
      const obj = { a: 1, b: 2 };
      const key1 = CacheUtils.generateHashKey('test', obj);
      const key2 = CacheUtils.generateHashKey('test', obj);

      expect(key1).toBe(key2);
    });

    it('should generate different hash for different objects', () => {
      const key1 = CacheUtils.generateHashKey('test', { a: 1 });
      const key2 = CacheUtils.generateHashKey('test', { a: 2 });

      expect(key1).not.toBe(key2);
    });

    it('should use HashUtils.hashObject internally', () => {
      const obj = { test: 'data' };
      const expectedHash = HashUtils.hashObject(obj);
      const key = CacheUtils.generateHashKey('prefix', obj);

      expect(key).toBe(`prefix_${expectedHash}`);
    });
  });

  // ===================================================================
  // generateVersionedKey()
  // ===================================================================

  describe('generateVersionedKey()', () => {
    it('should generate versioned key', () => {
      const key = CacheUtils.generateVersionedKey('user', 'v2', 123, 'profile');
      expect(key).toBe('user_v2_123_profile');
    });

    it('should handle numeric version', () => {
      const key = CacheUtils.generateVersionedKey('api', 2, 'endpoint');
      expect(key).toBe('api_2_endpoint');
    });
  });

  // ===================================================================
  // hasPrefix()
  // ===================================================================

  describe('hasPrefix()', () => {
    it('should return true when key has matching prefix', () => {
      expect(CacheUtils.hasPrefix('user_123_profile', 'user')).toBe(true);
    });

    it('should return false when key has different prefix', () => {
      expect(CacheUtils.hasPrefix('user_123_profile', 'drive')).toBe(false);
    });

    it('should return false for partial prefix match', () => {
      expect(CacheUtils.hasPrefix('user_123', 'use')).toBe(false);
    });

    it('should handle single-part keys', () => {
      expect(CacheUtils.hasPrefix('user', 'user')).toBe(false);
    });
  });

  // ===================================================================
  // getPrefix()
  // ===================================================================

  describe('getPrefix()', () => {
    it('should extract prefix from multi-part key', () => {
      expect(CacheUtils.getPrefix('user_123_profile')).toBe('user');
    });

    it('should return entire key if no separator', () => {
      expect(CacheUtils.getPrefix('singlepart')).toBe('singlepart');
    });

    it('should handle key with empty prefix', () => {
      expect(CacheUtils.getPrefix('_123_profile')).toBe('');
    });
  });

  // ===================================================================
  // calculateTtl()
  // ===================================================================

  describe('calculateTtl()', () => {
    it('should return requested TTL if within limit', () => {
      expect(CacheUtils.calculateTtl(3600)).toBe(3600);
    });

    it('should cap TTL at MAX_TTL_SECONDS', () => {
      expect(CacheUtils.calculateTtl(86400)).toBe(21600);
    });

    it('should return MAX_TTL_SECONDS for exact match', () => {
      expect(CacheUtils.calculateTtl(21600)).toBe(21600);
    });

    it('should handle zero TTL', () => {
      expect(CacheUtils.calculateTtl(0)).toBe(0);
    });
  });

  // ===================================================================
  // msToSeconds() and secondsToMs()
  // ===================================================================

  describe('Time Conversion Methods', () => {
    describe('msToSeconds()', () => {
      it('should convert milliseconds to seconds', () => {
        expect(CacheUtils.msToSeconds(60000)).toBe(60);
      });

      it('should floor the result', () => {
        expect(CacheUtils.msToSeconds(1500)).toBe(1);
      });

      it('should handle zero', () => {
        expect(CacheUtils.msToSeconds(0)).toBe(0);
      });
    });

    describe('secondsToMs()', () => {
      it('should convert seconds to milliseconds', () => {
        expect(CacheUtils.secondsToMs(60)).toBe(60000);
      });

      it('should handle zero', () => {
        expect(CacheUtils.secondsToMs(0)).toBe(0);
      });
    });
  });

  // ===================================================================
  // parseKey()
  // ===================================================================

  describe('parseKey()', () => {
    it('should parse multi-part key into array', () => {
      const parts = CacheUtils.parseKey('user_123_profile');
      expect(parts).toEqual(['user', '123', 'profile']);
    });

    it('should handle single-part key', () => {
      const parts = CacheUtils.parseKey('user');
      expect(parts).toEqual(['user']);
    });

    it('should handle empty parts', () => {
      const parts = CacheUtils.parseKey('user__profile');
      expect(parts).toEqual(['user', '', 'profile']);
    });
  });

  // ===================================================================
  // createPattern()
  // ===================================================================

  describe('createPattern()', () => {
    it('should create pattern with wildcard', () => {
      const pattern = CacheUtils.createPattern('user', '*', 'profile');
      expect(pattern).toBe('user_*_profile');
    });

    it('should create pattern without wildcard', () => {
      const pattern = CacheUtils.createPattern('user', 123);
      expect(pattern).toBe('user_123');
    });
  });

  // ===================================================================
  // matchesPattern()
  // ===================================================================

  describe('matchesPattern()', () => {
    it('should match key with wildcard pattern', () => {
      expect(CacheUtils.matchesPattern('user_123_profile', 'user_*_profile')).toBe(true);
    });

    it('should not match key with different structure', () => {
      expect(CacheUtils.matchesPattern('user_123_settings', 'user_*_profile')).toBe(false);
    });

    it('should match exact key without wildcard', () => {
      expect(CacheUtils.matchesPattern('user_123', 'user_123')).toBe(true);
    });

    it('should match multiple wildcards', () => {
      expect(CacheUtils.matchesPattern('api_v2_users_list', 'api_*_users_*')).toBe(true);
    });

    it('should handle wildcard at start', () => {
      expect(CacheUtils.matchesPattern('api_endpoint', '*_endpoint')).toBe(true);
    });

    it('should handle wildcard at end', () => {
      expect(CacheUtils.matchesPattern('prefix_anything', 'prefix_*')).toBe(true);
    });

    it('should escape regex special characters', () => {
      expect(CacheUtils.matchesPattern('test.key', 'test.key')).toBe(true);
      expect(CacheUtils.matchesPattern('test_key', 'test.key')).toBe(false);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle empty string key generation', () => {
      const key = CacheUtils.generateKey('');
      expect(key).toBe('');
    });

    it('should handle special characters in key parts', () => {
      const key = CacheUtils.generateKey('user', 'john@example.com');
      expect(key).toBe('user_john@example.com');
    });

    it('should handle unicode in key parts', () => {
      const key = CacheUtils.generateKey('user', '日本語');
      expect(key).toBe('user_日本語');
    });
  });
});
