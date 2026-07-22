/**
 * @file CoreUtilsLib/src/__tests__/IdGenerator.test.js
 * @description Unit tests for secure IdGenerator.
 */

import { IdGenerator } from '../utils/IdGenerator';

describe('IdGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new IdGenerator();
    delete global.Utilities;
    delete global.crypto;
    jest.clearAllMocks();
  });

  describe('generateUuid', () => {
    it('should use Utilities.getUuid if available (GAS)', () => {
      global.Utilities = {
        getUuid: jest.fn().mockReturnValue('gas-uuid-123')
      };
      expect(generator.generateUuid()).toBe('gas-uuid-123');
      expect(global.Utilities.getUuid).toHaveBeenCalled();
    });

    it('should use crypto.randomUUID if available (Web/Node)', () => {
      global.crypto = {
        randomUUID: jest.fn().mockReturnValue('crypto-uuid-456')
      };
      expect(generator.generateUuid()).toBe('crypto-uuid-456');
      expect(global.crypto.randomUUID).toHaveBeenCalled();
    });

    it('should generate valid v4 UUID as fallback', () => {
      const uuid = generator.generateUuid();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  describe('generateCustomId', () => {
    it('should generate ID with correct length', () => {
      expect(IdGenerator.generateCustomId(5).length).toBe(5);
      expect(IdGenerator.generateCustomId(20).length).toBe(20);
    });

    it('should use specified alphabet', () => {
      const id = IdGenerator.generateCustomId(100, 'A');
      expect(id).toBe('A'.repeat(100));
    });

    it('should work as instance method', () => {
      expect(generator.generateCustomId(8, 'B')).toBe('BBBBBBBB');
    });

    it('should handle GAS environment for custom ID', () => {
      // Mock hash bytes [0, 1, 2, 3] which map directly to indices in alphabet 'ABCD'
      global.Utilities = {
        getUuid: jest.fn().mockReturnValue('seed'),
        computeDigest: jest.fn().mockReturnValue([0, 1, 2, 3]),
        DigestAlgorithm: { SHA_256: 'SHA_256' }
      };

      const id = IdGenerator.generateCustomId(4, 'ABCD');
      expect(id).toBe('ABCD');
      expect(global.Utilities.getUuid).toHaveBeenCalled();
    });
  });

  describe('generateShortId', () => {
    it('should generate 8-char alphanumeric ID', () => {
      const id = generator.generateShortId();
      expect(id.length).toBe(8);
      expect(id).toMatch(/^[a-z0-9]{8}$/);
    });
  });

  describe('generateCompactId', () => {
    it('should generate 21-char ID by default', () => {
      const id = generator.generateCompactId();
      expect(id.length).toBe(21);
    });

    it('should handle custom size', () => {
      const id = generator.generateCompactId(10);
      expect(id.length).toBe(10);
    });
  });

  describe('getRandomValues', () => {
    it('should return the requested number of bytes', () => {
      global.Utilities = {
        getUuid: jest.fn().mockReturnValue('seed'),
        computeDigest: jest.fn().mockReturnValue([10, 20, 30, 40]),
        DigestAlgorithm: { SHA_256: 'SHA_256' }
      };

      const bytes = generator.getRandomValues(4);
      expect(bytes).toHaveLength(4);
    });

    it('should delegate to the secure random byte source (crypto.getRandomValues)', () => {
      const mockBytes = new Uint8Array(8);
      global.crypto = {
        getRandomValues: jest.fn().mockReturnValue(mockBytes)
      };

      const result = generator.getRandomValues(8);
      expect(result).toBe(mockBytes);
      expect(global.crypto.getRandomValues).toHaveBeenCalled();
    });
  });

  describe('_getSecureRandomBytes', () => {
    it('should use crypto.getRandomValues if available', () => {
      const mockBytes = new Uint8Array(4);
      global.crypto = {
        getRandomValues: jest.fn().mockReturnValue(mockBytes)
      };

      const result = IdGenerator._getSecureRandomBytes(4);
      expect(result).toBe(mockBytes);
      expect(global.crypto.getRandomValues).toHaveBeenCalled();
    });

    it('should fallback to Math.random if no secure source exists', () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const result = IdGenerator._getSecureRandomBytes(2);
      expect(result).toEqual([128, 128]);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
