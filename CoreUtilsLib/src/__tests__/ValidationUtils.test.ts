// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/ValidationUtils.test.js
// ===================================================================
// Comprehensive test suite for ValidationUtils
// Coverage: 100% of all static methods
// ===================================================================

import { ValidationUtils } from '../ValidationUtils.js';

describe('ValidationUtils - Comprehensive Test Suite', () => {
  // ===================================================================
  // STATIC CONSTANTS
  // ===================================================================

  describe('Static Constants', () => {
    it('should have LOGGER_METHODS constant', () => {
      expect(ValidationUtils.LOGGER_METHODS).toEqual(['debug', 'info', 'warn', 'error']);
    });
  });

  // ===================================================================
  // validateLogger()
  // ===================================================================

  describe('validateLogger()', () => {
    const validLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    it('should pass for valid logger', () => {
      expect(ValidationUtils.validateLogger(validLogger)).toBe(true);
    });

    it('should throw for null logger', () => {
      expect(() => ValidationUtils.validateLogger(null, 'MyService')).toThrow(
        'MyService: logger is required and must be an object'
      );
    });

    it('should throw for undefined logger', () => {
      expect(() => ValidationUtils.validateLogger(undefined, 'MyService')).toThrow(
        'MyService: logger is required and must be an object'
      );
    });

    it('should throw for non-object logger', () => {
      expect(() => ValidationUtils.validateLogger('not an object', 'MyService')).toThrow(
        'MyService: logger is required and must be an object'
      );
    });

    it('should throw for missing debug method', () => {
      const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
      expect(() => ValidationUtils.validateLogger(logger, 'Test')).toThrow(
        'Test: logger.debug must be a function'
      );
    });

    it('should throw for missing info method', () => {
      const logger = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
      expect(() => ValidationUtils.validateLogger(logger, 'Test')).toThrow(
        'Test: logger.info must be a function'
      );
    });

    it('should throw for missing warn method', () => {
      const logger = { debug: jest.fn(), info: jest.fn(), error: jest.fn() };
      expect(() => ValidationUtils.validateLogger(logger, 'Test')).toThrow(
        'Test: logger.warn must be a function'
      );
    });

    it('should throw for missing error method', () => {
      const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn() };
      expect(() => ValidationUtils.validateLogger(logger, 'Test')).toThrow(
        'Test: logger.error must be a function'
      );
    });

    it('should throw for non-function method', () => {
      const logger = {
        debug: 'not a function',
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      expect(() => ValidationUtils.validateLogger(logger, 'Test')).toThrow(
        'Test: logger.debug must be a function'
      );
    });

    it('should use default context if not provided', () => {
      expect(() => ValidationUtils.validateLogger(null)).toThrow(
        'ValidationUtils: logger is required'
      );
    });
  });

  // ===================================================================
  // validateDependency()
  // ===================================================================

  describe('validateDependency()', () => {
    it('should pass for valid dependency', () => {
      const dep = { method1: jest.fn() };
      expect(ValidationUtils.validateDependency(dep, 'dep', 'Test')).toBe(true);
    });

    it('should pass for valid dependency with required methods', () => {
      const dep = { get: jest.fn(), put: jest.fn() };
      expect(ValidationUtils.validateDependency(dep, 'cache', 'Test', ['get', 'put'])).toBe(true);
    });

    it('should throw for null required dependency', () => {
      expect(() => ValidationUtils.validateDependency(null, 'utils', 'MyService')).toThrow(
        'MyService: utils is required and must be an object'
      );
    });

    it('should throw for missing required method', () => {
      const dep = { get: jest.fn() };
      expect(() =>
        ValidationUtils.validateDependency(dep, 'cache', 'Test', ['get', 'put'])
      ).toThrow('Test: cache.put must be a function');
    });

    it('should pass for null optional dependency', () => {
      expect(ValidationUtils.validateDependency(null, 'cache', 'Test', [], false)).toBe(true);
    });

    it('should pass for undefined optional dependency', () => {
      expect(ValidationUtils.validateDependency(undefined, 'cache', 'Test', [], false)).toBe(true);
    });

    it('should still validate methods if optional dependency is provided', () => {
      const dep = { get: jest.fn() };
      expect(() =>
        ValidationUtils.validateDependency(dep, 'cache', 'Test', ['get', 'put'], false)
      ).toThrow('Test: cache.put must be a function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle object with extra properties as valid logger', () => {
      const logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        extra: 'property'
      };
      expect(ValidationUtils.validateLogger(logger)).toBe(true);
    });

    it('should handle empty requiredMethods array', () => {
      const dep = {};
      expect(ValidationUtils.validateDependency(dep, 'dep', 'Test', [])).toBe(true);
    });

    it('should validate console as valid logger', () => {
      expect(ValidationUtils.validateLogger(console)).toBe(true);
    });
  });
});
