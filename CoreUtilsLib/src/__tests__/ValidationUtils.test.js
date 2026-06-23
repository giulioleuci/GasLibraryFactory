// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/ValidationUtils.test.js
// ===================================================================
// Comprehensive test suite for ValidationUtils
// Coverage: 100% of all static methods
// ===================================================================

import { ValidationUtils } from '../ValidationUtils';

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

  // ===================================================================
  // validateRequired()
  // ===================================================================

  describe('validateRequired()', () => {
    it('should pass for defined values', () => {
      expect(ValidationUtils.validateRequired('value', 'param', 'Test')).toBe(true);
      expect(ValidationUtils.validateRequired(0, 'param', 'Test')).toBe(true);
      expect(ValidationUtils.validateRequired('', 'param', 'Test')).toBe(true);
      expect(ValidationUtils.validateRequired(false, 'param', 'Test')).toBe(true);
    });

    it('should throw for null', () => {
      expect(() => ValidationUtils.validateRequired(null, 'userId', 'getUser')).toThrow(
        'getUser: userId is required'
      );
    });

    it('should throw for undefined', () => {
      expect(() => ValidationUtils.validateRequired(undefined, 'userId', 'getUser')).toThrow(
        'getUser: userId is required'
      );
    });
  });

  // ===================================================================
  // validateNonEmptyString()
  // ===================================================================

  describe('validateNonEmptyString()', () => {
    it('should pass for non-empty string', () => {
      expect(ValidationUtils.validateNonEmptyString('hello', 'name', 'Test')).toBe(true);
    });

    it('should throw for empty string', () => {
      expect(() => ValidationUtils.validateNonEmptyString('', 'name', 'Test')).toThrow(
        'Test: name must be a non-empty string'
      );
    });

    it('should throw for whitespace-only string', () => {
      expect(() => ValidationUtils.validateNonEmptyString('   ', 'name', 'Test')).toThrow(
        'Test: name must be a non-empty string'
      );
    });

    it('should throw for non-string', () => {
      expect(() => ValidationUtils.validateNonEmptyString(123, 'name', 'Test')).toThrow(
        'Test: name must be a non-empty string'
      );
    });

    it('should throw for null', () => {
      expect(() => ValidationUtils.validateNonEmptyString(null, 'name', 'Test')).toThrow(
        'Test: name must be a non-empty string'
      );
    });
  });

  // ===================================================================
  // validatePositiveInteger()
  // ===================================================================

  describe('validatePositiveInteger()', () => {
    it('should pass for positive integers', () => {
      expect(ValidationUtils.validatePositiveInteger(1, 'count', 'Test')).toBe(true);
      expect(ValidationUtils.validatePositiveInteger(100, 'count', 'Test')).toBe(true);
    });

    it('should throw for zero', () => {
      expect(() => ValidationUtils.validatePositiveInteger(0, 'count', 'Test')).toThrow(
        'Test: count must be a positive integer'
      );
    });

    it('should throw for negative integer', () => {
      expect(() => ValidationUtils.validatePositiveInteger(-1, 'count', 'Test')).toThrow(
        'Test: count must be a positive integer'
      );
    });

    it('should throw for float', () => {
      expect(() => ValidationUtils.validatePositiveInteger(3.14, 'count', 'Test')).toThrow(
        'Test: count must be a positive integer'
      );
    });

    it('should throw for non-number', () => {
      expect(() => ValidationUtils.validatePositiveInteger('5', 'count', 'Test')).toThrow(
        'Test: count must be a positive integer'
      );
    });
  });

  // ===================================================================
  // validateFunction()
  // ===================================================================

  describe('validateFunction()', () => {
    it('should pass for functions', () => {
      expect(ValidationUtils.validateFunction(() => {}, 'callback', 'Test')).toBe(true);
      expect(ValidationUtils.validateFunction(() => {}, 'callback', 'Test')).toBe(true);
      expect(ValidationUtils.validateFunction(jest.fn(), 'callback', 'Test')).toBe(true);
    });

    it('should throw for non-function', () => {
      expect(() => ValidationUtils.validateFunction('not a function', 'callback', 'Test')).toThrow(
        'Test: callback must be a function'
      );
    });

    it('should throw for null', () => {
      expect(() => ValidationUtils.validateFunction(null, 'callback', 'Test')).toThrow(
        'Test: callback must be a function'
      );
    });
  });

  // ===================================================================
  // validateArray()
  // ===================================================================

  describe('validateArray()', () => {
    it('should pass for arrays', () => {
      expect(ValidationUtils.validateArray([], 'items', 'Test')).toBe(true);
      expect(ValidationUtils.validateArray([1, 2, 3], 'items', 'Test')).toBe(true);
    });

    it('should throw for non-arrays', () => {
      expect(() => ValidationUtils.validateArray({}, 'items', 'Test')).toThrow(
        'Test: items must be an array'
      );
    });

    it('should throw for null', () => {
      expect(() => ValidationUtils.validateArray(null, 'items', 'Test')).toThrow(
        'Test: items must be an array'
      );
    });

    it('should pass empty array by default', () => {
      expect(ValidationUtils.validateArray([], 'items', 'Test')).toBe(true);
    });

    it('should throw for empty array when allowEmpty is false', () => {
      expect(() => ValidationUtils.validateArray([], 'items', 'Test', false)).toThrow(
        'Test: items must be a non-empty array'
      );
    });

    it('should pass non-empty array when allowEmpty is false', () => {
      expect(ValidationUtils.validateArray([1], 'items', 'Test', false)).toBe(true);
    });
  });

  // ===================================================================
  // validateObject()
  // ===================================================================

  describe('validateObject()', () => {
    it('should pass for plain objects', () => {
      expect(ValidationUtils.validateObject({}, 'options', 'Test')).toBe(true);
      expect(ValidationUtils.validateObject({ key: 'value' }, 'options', 'Test')).toBe(true);
    });

    it('should throw for null', () => {
      expect(() => ValidationUtils.validateObject(null, 'options', 'Test')).toThrow(
        'Test: options must be a plain object'
      );
    });

    it('should throw for arrays', () => {
      expect(() => ValidationUtils.validateObject([], 'options', 'Test')).toThrow(
        'Test: options must be a plain object'
      );
    });

    it('should throw for primitives', () => {
      expect(() => ValidationUtils.validateObject('string', 'options', 'Test')).toThrow(
        'Test: options must be a plain object'
      );
      expect(() => ValidationUtils.validateObject(123, 'options', 'Test')).toThrow(
        'Test: options must be a plain object'
      );
    });
  });

  // ===================================================================
  // validateEnum()
  // ===================================================================

  describe('validateEnum()', () => {
    const allowedStatuses = ['pending', 'active', 'completed'];

    it('should pass for allowed values', () => {
      expect(ValidationUtils.validateEnum('pending', allowedStatuses, 'status', 'Test')).toBe(true);
      expect(ValidationUtils.validateEnum('active', allowedStatuses, 'status', 'Test')).toBe(true);
      expect(ValidationUtils.validateEnum('completed', allowedStatuses, 'status', 'Test')).toBe(
        true
      );
    });

    it('should throw for disallowed value', () => {
      expect(() =>
        ValidationUtils.validateEnum('invalid', allowedStatuses, 'status', 'Test')
      ).toThrow("Test: status must be one of: 'pending', 'active', 'completed'");
    });

    it('should work with number enums', () => {
      expect(ValidationUtils.validateEnum(1, [1, 2, 3], 'level', 'Test')).toBe(true);
    });
  });

  // ===================================================================
  // validateAll()
  // ===================================================================

  describe('validateAll()', () => {
    it('should pass when all validations pass', () => {
      const result = ValidationUtils.validateAll(
        [
          [true, 'error1'],
          [true, 'error2'],
          [true, 'error3']
        ],
        'Test'
      );

      expect(result).toBe(true);
    });

    it('should throw with all error messages on failure', () => {
      expect(() =>
        ValidationUtils.validateAll(
          [
            [false, 'name is required'],
            [true, 'this passes'],
            [false, 'age must be positive']
          ],
          'createUser'
        )
      ).toThrow('createUser: Validation failed:\n- name is required\n- age must be positive');
    });

    it('should throw with single error message', () => {
      expect(() =>
        ValidationUtils.validateAll(
          [
            [true, 'passes'],
            [false, 'single error']
          ],
          'Test'
        )
      ).toThrow('Test: Validation failed:\n- single error');
    });

    it('should work with expression conditions', () => {
      const name = '';
      const age = -1;

      expect(() =>
        ValidationUtils.validateAll(
          [
            [name.length > 0, 'name must not be empty'],
            [age > 0, 'age must be positive']
          ],
          'validate'
        )
      ).toThrow('validate: Validation failed:\n- name must not be empty\n- age must be positive');
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

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
