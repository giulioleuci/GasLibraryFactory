/**
 * @file CoreUtilsLib/src/__tests__/HashUtils.test.js
 * @description Test suite for HashUtils with SHA-256 cryptographic hashing
 * @version 3.0 - Updated for SHA-256 implementation
 */

import { HashUtils } from '../internal/HashUtils';

describe('HashUtils - SHA-256 Implementation', () => {
  beforeEach(() => {
    // Mock Google Apps Script Utilities.computeDigest
    global.Utilities = {
      computeDigest: jest.fn((algorithm, input, charset) => {
        // Simulate SHA-256 output as byte array
        // For 'hello', SHA-256 is: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
        if (input === 'hello') {
          return [
            44, 242, 77, 186, 95, 176, 163, 14, 38, 232, 59, 42, 197, 185, 226, 158, 27, 22, 30, 92,
            31, 167, 66, 94, 115, 4, 51, 98, 147, 139, 152, 36
          ];
        }
        // For 'world', SHA-256 is: 486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7
        if (input === 'world') {
          return [
            72, 110, 164, 98, 36, 209, 187, 79, 182, 128, 243, 79, 124, 154, 217, 106, 143, 36, 236,
            136, 190, 115, 234, 142, 90, 108, 101, 38, 14, 156, 184, 167
          ];
        }
        // For empty string, SHA-256 is: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        if (input === '') {
          return [
            227, 176, 196, 66, 152, 252, 28, 20, 154, 251, 244, 200, 153, 111, 185, 36, 39, 174, 65,
            228, 100, 155, 147, 76, 164, 149, 153, 27, 120, 82, 184, 85
          ];
        }
        // Default mock response (32 bytes for SHA-256)
        return [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
          26, 27, 28, 29, 30, 31, 32
        ];
      }),
      DigestAlgorithm: {
        MD5: 'MD5',
        SHA_256: 'SHA_256'
      },
      Charset: {
        UTF_8: 'UTF-8'
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateHash()', () => {
    it('should generate SHA-256 hash for a string', () => {
      const hash = HashUtils.generateHash('hello');

      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
      expect(global.Utilities.computeDigest).toHaveBeenCalledWith('SHA_256', 'hello', 'UTF-8');
    });

    it('should generate consistent hash for same input', () => {
      const hash1 = HashUtils.generateHash('hello');
      const hash2 = HashUtils.generateHash('hello');

      expect(hash1).toBe(hash2);
      expect(hash1).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    it('should generate different hash for different input', () => {
      const hash1 = HashUtils.generateHash('hello');
      const hash2 = HashUtils.generateHash('world');

      expect(hash1).not.toBe(hash2);
      expect(hash1).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
      expect(hash2).toBe('486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7');
    });

    it('should handle empty string', () => {
      const hash = HashUtils.generateHash('');

      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should return 64-character hexadecimal string (SHA-256)', () => {
      const hash = HashUtils.generateHash('test');

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle negative bytes correctly', () => {
      // Mock with negative byte values (32 bytes)
      global.Utilities.computeDigest.mockReturnValue([
        -128, -1, 127, 0, 255, -127, 1, -2, 100, -100, 50, -50, 25, -25, 10, -10, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0
      ]);

      const hash = HashUtils.generateHash('test');

      // Verify it converts negative bytes to unsigned
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
      // -128 -> 128 (80), -1 -> 255 (ff), 127 -> 127 (7f), 0 -> 0 (00)
      expect(hash.substring(0, 8)).toBe('80ff7f00');
    });

    it('should pad single-digit hex values with leading zero', () => {
      // Mock with small byte values that produce single hex digits
      global.Utilities.computeDigest.mockReturnValue([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
        26, 27, 28, 29, 30, 31
      ]);

      const hash = HashUtils.generateHash('test');

      // All values should be padded to 2 characters
      expect(hash).toBe(
        '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'
      );
    });
  });

  describe('hashObject()', () => {
    it('should hash an object by converting to JSON', () => {
      const obj = { foo: 'bar', baz: 123 };
      const hash = HashUtils.hashObject(obj);

      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(64);

      // Verify it called generateHash with JSON string
      const jsonString = JSON.stringify(obj);
      expect(global.Utilities.computeDigest).toHaveBeenCalledWith('SHA_256', jsonString, 'UTF-8');
    });

    it('should generate same hash for same object structure', () => {
      const obj1 = { foo: 'bar', baz: 123 };
      const obj2 = { foo: 'bar', baz: 123 };

      const hash1 = HashUtils.hashObject(obj1);
      const hash2 = HashUtils.hashObject(obj2);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different objects', () => {
      const obj1 = { foo: 'bar' };
      const obj2 = { foo: 'baz' };

      // Mock different outputs for different JSON strings
      let callCount = 0;
      global.Utilities.computeDigest.mockImplementation((alg, input, charset) => {
        if (input === JSON.stringify(obj1)) {
          return [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            25, 26, 27, 28, 29, 30, 31, 32
          ];
        } else if (input === JSON.stringify(obj2)) {
          return [
            2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            26, 27, 28, 29, 30, 31, 32, 33
          ];
        }
        return [callCount++, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      });

      const hash1 = HashUtils.hashObject(obj1);
      const hash2 = HashUtils.hashObject(obj2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle nested objects', () => {
      const obj = {
        user: {
          name: 'John',
          address: {
            city: 'New York'
          }
        }
      };

      const hash = HashUtils.hashObject(obj);

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle arrays', () => {
      const obj = {
        items: [1, 2, 3, 4, 5]
      };

      const hash = HashUtils.hashObject(obj);

      expect(hash).toHaveLength(64);
    });
  });

  describe('isValidHash()', () => {
    it('should validate 64-character hexadecimal strings (SHA-256)', () => {
      expect(
        HashUtils.isValidHash('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
      ).toBe(true);
      expect(
        HashUtils.isValidHash('486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7')
      ).toBe(true);
      expect(
        HashUtils.isValidHash('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
      ).toBe(true);
    });

    it('should accept hexadecimal strings of any length', () => {
      // The implementation accepts any hex string, not just 32 chars
      expect(HashUtils.isValidHash('abc123')).toBe(true);
      expect(HashUtils.isValidHash('ff')).toBe(true);
    });

    it('should reject non-hexadecimal strings', () => {
      expect(HashUtils.isValidHash('not-a-hash')).toBe(false);
      expect(HashUtils.isValidHash('zz12345')).toBe(false);
      expect(HashUtils.isValidHash('hello world')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(HashUtils.isValidHash(123)).toBe(false);
      expect(HashUtils.isValidHash(null)).toBe(false);
      expect(HashUtils.isValidHash(undefined)).toBe(false);
      expect(HashUtils.isValidHash({})).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(HashUtils.isValidHash('ABCDEF')).toBe(true);
      expect(HashUtils.isValidHash('abcdef')).toBe(true);
      expect(HashUtils.isValidHash('AbCdEf')).toBe(true);
    });

    it('should reject empty strings', () => {
      expect(HashUtils.isValidHash('')).toBe(false);
    });
  });

  describe('Cache Key Use Case', () => {
    it('should generate consistent cache keys for query parameters', () => {
      const queryParams1 = { table: 'Users', filters: [{ age: '>18' }] };
      const queryParams2 = { table: 'Users', filters: [{ age: '>18' }] };

      const key1 = HashUtils.hashObject(queryParams1);
      const key2 = HashUtils.hashObject(queryParams2);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different parameters', () => {
      const params1 = { table: 'Users' };
      const params2 = { table: 'Orders' };

      // Mock different outputs for different JSON strings
      global.Utilities.computeDigest.mockImplementation((alg, input, charset) => {
        if (input === JSON.stringify(params1)) {
          return [
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
            200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320
          ];
        } else if (input === JSON.stringify(params2)) {
          return [
            20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
            210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330
          ];
        }
        return [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
          26, 27, 28, 29, 30, 31, 32
        ];
      });

      const key1 = HashUtils.hashObject(params1);
      const key2 = HashUtils.hashObject(params2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Collision Resistance', () => {
    it('should have low collision probability with SHA-256', () => {
      // Generate hashes for similar inputs
      const inputs = ['test1', 'test2', 'test3', 'test_1', 'test_2', 'Test1'];

      // Mock different outputs for each (32 bytes)
      const mockOutputs = [
        [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
          26, 27, 28, 29, 30, 31, 32
        ],
        [
          2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
          27, 28, 29, 30, 31, 32, 33
        ],
        [
          3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
          28, 29, 30, 31, 32, 33, 34
        ],
        [
          4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
          28, 29, 30, 31, 32, 33, 34, 35
        ],
        [
          5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
          29, 30, 31, 32, 33, 34, 35, 36
        ],
        [
          6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
          30, 31, 32, 33, 34, 35, 36, 37
        ]
      ];

      let callCount = 0;
      global.Utilities.computeDigest.mockImplementation(() => {
        return mockOutputs[callCount++ % mockOutputs.length];
      });

      const hashes = inputs.map((input) => HashUtils.generateHash(input));

      // All hashes should be unique
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(inputs.length);
    });
  });
});
