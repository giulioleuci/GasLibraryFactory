// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/TypeGuards.test.js
// ===================================================================
// Comprehensive test suite for TypeGuards
// Coverage: 100% of all 27 static methods
// ===================================================================

import {
  TypeGuards,
  isString,
  isNonEmptyString,
  isNumber,
  isFiniteNumber,
  isInteger,
  isPositiveInteger,
  isNonNegativeInteger,
  isBoolean,
  isPlainObject,
  isObject,
  isValidObject,
  isNonEmptyObject,
  isArray,
  isNonEmptyArray,
  isArrayOf,
  isFunction,
  isNil,
  isNull,
  isUndefined,
  isDefined,
  isValidDate,
  isRegExp,
  isPromise,
  isError,
  isEmpty,
  isTruthy,
  isFalsy
} from '../TypeGuards';

describe('TypeGuards - Comprehensive Test Suite', () => {
  // ===================================================================
  // STRING TYPE GUARDS
  // ===================================================================

  describe('String Type Guards', () => {
    describe('isString()', () => {
      it('should return true for string primitives', () => {
        expect(TypeGuards.isString('')).toBe(true);
        expect(TypeGuards.isString('hello')).toBe(true);
        expect(TypeGuards.isString('123')).toBe(true);
      });

      it('should return false for non-strings', () => {
        expect(TypeGuards.isString(123)).toBe(false);
        expect(TypeGuards.isString(null)).toBe(false);
        expect(TypeGuards.isString(undefined)).toBe(false);
        expect(TypeGuards.isString([])).toBe(false);
        expect(TypeGuards.isString({})).toBe(false);
        expect(TypeGuards.isString(true)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isString('test')).toBe(true);
        expect(isString(42)).toBe(false);
      });
    });

    describe('isNonEmptyString()', () => {
      it('should return true for non-empty strings', () => {
        expect(TypeGuards.isNonEmptyString('hello')).toBe(true);
        expect(TypeGuards.isNonEmptyString('a')).toBe(true);
        expect(TypeGuards.isNonEmptyString('  a  ')).toBe(true);
      });

      it('should return false for empty or whitespace-only strings', () => {
        expect(TypeGuards.isNonEmptyString('')).toBe(false);
        expect(TypeGuards.isNonEmptyString('   ')).toBe(false);
        expect(TypeGuards.isNonEmptyString('\t\n')).toBe(false);
      });

      it('should return false for non-strings', () => {
        expect(TypeGuards.isNonEmptyString(null)).toBe(false);
        expect(TypeGuards.isNonEmptyString(undefined)).toBe(false);
        expect(TypeGuards.isNonEmptyString(123)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isNonEmptyString('test')).toBe(true);
        expect(isNonEmptyString('')).toBe(false);
      });
    });
  });

  // ===================================================================
  // NUMBER TYPE GUARDS
  // ===================================================================

  describe('Number Type Guards', () => {
    describe('isNumber()', () => {
      it('should return true for valid numbers', () => {
        expect(TypeGuards.isNumber(0)).toBe(true);
        expect(TypeGuards.isNumber(123)).toBe(true);
        expect(TypeGuards.isNumber(-456)).toBe(true);
        expect(TypeGuards.isNumber(3.14)).toBe(true);
        expect(TypeGuards.isNumber(Infinity)).toBe(true);
        expect(TypeGuards.isNumber(-Infinity)).toBe(true);
      });

      it('should return false for NaN', () => {
        expect(TypeGuards.isNumber(NaN)).toBe(false);
      });

      it('should return false for non-numbers', () => {
        expect(TypeGuards.isNumber('123')).toBe(false);
        expect(TypeGuards.isNumber(null)).toBe(false);
        expect(TypeGuards.isNumber(undefined)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isNumber(42)).toBe(true);
        expect(isNumber(NaN)).toBe(false);
      });
    });

    describe('isFiniteNumber()', () => {
      it('should return true for finite numbers', () => {
        expect(TypeGuards.isFiniteNumber(0)).toBe(true);
        expect(TypeGuards.isFiniteNumber(123)).toBe(true);
        expect(TypeGuards.isFiniteNumber(-456.789)).toBe(true);
      });

      it('should return false for Infinity and NaN', () => {
        expect(TypeGuards.isFiniteNumber(Infinity)).toBe(false);
        expect(TypeGuards.isFiniteNumber(-Infinity)).toBe(false);
        expect(TypeGuards.isFiniteNumber(NaN)).toBe(false);
      });

      it('should return false for non-numbers', () => {
        expect(TypeGuards.isFiniteNumber('123')).toBe(false);
        expect(TypeGuards.isFiniteNumber(null)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isFiniteNumber(42)).toBe(true);
        expect(isFiniteNumber(Infinity)).toBe(false);
      });
    });

    describe('isInteger()', () => {
      it('should return true for integers', () => {
        expect(TypeGuards.isInteger(0)).toBe(true);
        expect(TypeGuards.isInteger(123)).toBe(true);
        expect(TypeGuards.isInteger(-456)).toBe(true);
      });

      it('should return false for non-integers', () => {
        expect(TypeGuards.isInteger(3.14)).toBe(false);
        expect(TypeGuards.isInteger(NaN)).toBe(false);
        expect(TypeGuards.isInteger(Infinity)).toBe(false);
        expect(TypeGuards.isInteger('123')).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isInteger(42)).toBe(true);
        expect(isInteger(3.14)).toBe(false);
      });
    });

    describe('isPositiveInteger()', () => {
      it('should return true for positive integers', () => {
        expect(TypeGuards.isPositiveInteger(1)).toBe(true);
        expect(TypeGuards.isPositiveInteger(100)).toBe(true);
      });

      it('should return false for zero and negative integers', () => {
        expect(TypeGuards.isPositiveInteger(0)).toBe(false);
        expect(TypeGuards.isPositiveInteger(-1)).toBe(false);
      });

      it('should return false for non-integers', () => {
        expect(TypeGuards.isPositiveInteger(3.14)).toBe(false);
        expect(TypeGuards.isPositiveInteger('1')).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isPositiveInteger(5)).toBe(true);
        expect(isPositiveInteger(0)).toBe(false);
      });
    });

    describe('isNonNegativeInteger()', () => {
      it('should return true for zero and positive integers', () => {
        expect(TypeGuards.isNonNegativeInteger(0)).toBe(true);
        expect(TypeGuards.isNonNegativeInteger(1)).toBe(true);
        expect(TypeGuards.isNonNegativeInteger(100)).toBe(true);
      });

      it('should return false for negative integers', () => {
        expect(TypeGuards.isNonNegativeInteger(-1)).toBe(false);
        expect(TypeGuards.isNonNegativeInteger(-100)).toBe(false);
      });

      it('should return false for non-integers', () => {
        expect(TypeGuards.isNonNegativeInteger(3.14)).toBe(false);
        expect(TypeGuards.isNonNegativeInteger('0')).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isNonNegativeInteger(0)).toBe(true);
        expect(isNonNegativeInteger(-1)).toBe(false);
      });
    });
  });

  // ===================================================================
  // BOOLEAN TYPE GUARDS
  // ===================================================================

  describe('Boolean Type Guards', () => {
    describe('isBoolean()', () => {
      it('should return true for booleans', () => {
        expect(TypeGuards.isBoolean(true)).toBe(true);
        expect(TypeGuards.isBoolean(false)).toBe(true);
      });

      it('should return false for non-booleans', () => {
        expect(TypeGuards.isBoolean(0)).toBe(false);
        expect(TypeGuards.isBoolean(1)).toBe(false);
        expect(TypeGuards.isBoolean('true')).toBe(false);
        expect(TypeGuards.isBoolean(null)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(1)).toBe(false);
      });
    });
  });

  // ===================================================================
  // OBJECT TYPE GUARDS
  // ===================================================================

  describe('Object Type Guards', () => {
    describe('isPlainObject()', () => {
      it('should return true for plain objects', () => {
        expect(TypeGuards.isPlainObject({})).toBe(true);
        expect(TypeGuards.isPlainObject({ a: 1 })).toBe(true);
        expect(TypeGuards.isPlainObject(Object.create(null))).toBe(true);
      });

      it('should return false for non-plain objects', () => {
        expect(TypeGuards.isPlainObject(null)).toBe(false);
        expect(TypeGuards.isPlainObject([])).toBe(false);
        expect(TypeGuards.isPlainObject(new Date())).toBe(false);
        expect(TypeGuards.isPlainObject(new Map())).toBe(false);
        expect(TypeGuards.isPlainObject(/regex/)).toBe(false);
      });

      it('should return false for primitives', () => {
        expect(TypeGuards.isPlainObject('string')).toBe(false);
        expect(TypeGuards.isPlainObject(123)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject([])).toBe(false);
      });
    });

    describe('isObject()', () => {
      it('should return true for objects', () => {
        expect(TypeGuards.isObject({})).toBe(true);
        expect(TypeGuards.isObject([])).toBe(true);
        expect(TypeGuards.isObject(new Date())).toBe(true);
        expect(TypeGuards.isObject(/regex/)).toBe(true);
      });

      it('should return false for null and primitives', () => {
        expect(TypeGuards.isObject(null)).toBe(false);
        expect(TypeGuards.isObject('string')).toBe(false);
        expect(TypeGuards.isObject(123)).toBe(false);
        expect(TypeGuards.isObject(undefined)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isObject({})).toBe(true);
        expect(isObject(null)).toBe(false);
      });
    });

    describe('isValidObject()', () => {
      it('should return true for non-null objects', () => {
        expect(TypeGuards.isValidObject({})).toBe(true);
        expect(TypeGuards.isValidObject([])).toBe(true);
        expect(TypeGuards.isValidObject(new Date())).toBe(true);
      });

      it('should return false for null and non-objects', () => {
        expect(TypeGuards.isValidObject(null)).toBe(false);
        expect(TypeGuards.isValidObject(undefined)).toBe(false);
        expect(TypeGuards.isValidObject('string')).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isValidObject({})).toBe(true);
        expect(isValidObject(null)).toBe(false);
      });
    });

    describe('isNonEmptyObject()', () => {
      it('should return true for non-empty plain objects', () => {
        expect(TypeGuards.isNonEmptyObject({ a: 1 })).toBe(true);
        expect(TypeGuards.isNonEmptyObject({ a: 1, b: 2 })).toBe(true);
      });

      it('should return false for empty objects', () => {
        expect(TypeGuards.isNonEmptyObject({})).toBe(false);
      });

      it('should return false for non-plain objects', () => {
        expect(TypeGuards.isNonEmptyObject([1, 2])).toBe(false);
        expect(TypeGuards.isNonEmptyObject(null)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isNonEmptyObject({ a: 1 })).toBe(true);
        expect(isNonEmptyObject({})).toBe(false);
      });
    });
  });

  // ===================================================================
  // ARRAY TYPE GUARDS
  // ===================================================================

  describe('Array Type Guards', () => {
    describe('isArray()', () => {
      it('should return true for arrays', () => {
        expect(TypeGuards.isArray([])).toBe(true);
        expect(TypeGuards.isArray([1, 2, 3])).toBe(true);
        expect(TypeGuards.isArray(new Array())).toBe(true);
      });

      it('should return false for non-arrays', () => {
        expect(TypeGuards.isArray({})).toBe(false);
        expect(TypeGuards.isArray('array')).toBe(false);
        expect(TypeGuards.isArray(null)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isArray([1, 2])).toBe(true);
        expect(isArray({})).toBe(false);
      });
    });

    describe('isNonEmptyArray()', () => {
      it('should return true for non-empty arrays', () => {
        expect(TypeGuards.isNonEmptyArray([1])).toBe(true);
        expect(TypeGuards.isNonEmptyArray([1, 2, 3])).toBe(true);
      });

      it('should return false for empty arrays', () => {
        expect(TypeGuards.isNonEmptyArray([])).toBe(false);
      });

      it('should return false for non-arrays', () => {
        expect(TypeGuards.isNonEmptyArray(null)).toBe(false);
        expect(TypeGuards.isNonEmptyArray({ length: 1 })).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isNonEmptyArray([1])).toBe(true);
        expect(isNonEmptyArray([])).toBe(false);
      });
    });

    describe('isArrayOf()', () => {
      it('should return true for arrays matching type', () => {
        expect(TypeGuards.isArrayOf([1, 2, 3], TypeGuards.isNumber)).toBe(true);
        expect(TypeGuards.isArrayOf(['a', 'b'], TypeGuards.isString)).toBe(true);
        expect(TypeGuards.isArrayOf([true, false], TypeGuards.isBoolean)).toBe(true);
      });

      it('should return true for empty arrays', () => {
        expect(TypeGuards.isArrayOf([], TypeGuards.isNumber)).toBe(true);
      });

      it('should return false for mixed type arrays', () => {
        expect(TypeGuards.isArrayOf([1, 'a', 3], TypeGuards.isNumber)).toBe(false);
        expect(TypeGuards.isArrayOf([1, null, 3], TypeGuards.isNumber)).toBe(false);
      });

      it('should return false for non-arrays', () => {
        expect(TypeGuards.isArrayOf({}, TypeGuards.isNumber)).toBe(false);
        expect(TypeGuards.isArrayOf(null, TypeGuards.isNumber)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isArrayOf([1, 2], isNumber)).toBe(true);
        expect(isArrayOf([1, 'a'], isNumber)).toBe(false);
      });
    });
  });

  // ===================================================================
  // FUNCTION TYPE GUARDS
  // ===================================================================

  describe('Function Type Guards', () => {
    describe('isFunction()', () => {
      it('should return true for functions', () => {
        expect(TypeGuards.isFunction(() => {})).toBe(true);
        expect(TypeGuards.isFunction(() => {})).toBe(true);
        expect(TypeGuards.isFunction(async () => {})).toBe(true);
        expect(TypeGuards.isFunction(class {})).toBe(true);
      });

      it('should return false for non-functions', () => {
        expect(TypeGuards.isFunction({})).toBe(false);
        expect(TypeGuards.isFunction(null)).toBe(false);
        expect(TypeGuards.isFunction('function')).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isFunction(() => {})).toBe(true);
        expect(isFunction(null)).toBe(false);
      });
    });
  });

  // ===================================================================
  // NULL/UNDEFINED TYPE GUARDS
  // ===================================================================

  describe('Null/Undefined Type Guards', () => {
    describe('isNil()', () => {
      it('should return true for null and undefined', () => {
        expect(TypeGuards.isNil(null)).toBe(true);
        expect(TypeGuards.isNil(undefined)).toBe(true);
      });

      it('should return false for other values', () => {
        expect(TypeGuards.isNil(0)).toBe(false);
        expect(TypeGuards.isNil('')).toBe(false);
        expect(TypeGuards.isNil(false)).toBe(false);
        expect(TypeGuards.isNil(NaN)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isNil(null)).toBe(true);
        expect(isNil(0)).toBe(false);
      });
    });

    describe('isNull()', () => {
      it('should return true for null', () => {
        expect(TypeGuards.isNull(null)).toBe(true);
      });

      it('should return false for non-null values', () => {
        expect(TypeGuards.isNull(undefined)).toBe(false);
        expect(TypeGuards.isNull(0)).toBe(false);
        expect(TypeGuards.isNull('')).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isNull(null)).toBe(true);
        expect(isNull(undefined)).toBe(false);
      });
    });

    describe('isUndefined()', () => {
      it('should return true for undefined', () => {
        expect(TypeGuards.isUndefined(undefined)).toBe(true);
      });

      it('should return false for non-undefined values', () => {
        expect(TypeGuards.isUndefined(null)).toBe(false);
        expect(TypeGuards.isUndefined(0)).toBe(false);
        expect(TypeGuards.isUndefined('')).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isUndefined(undefined)).toBe(true);
        expect(isUndefined(null)).toBe(false);
      });
    });

    describe('isDefined()', () => {
      it('should return true for defined values', () => {
        expect(TypeGuards.isDefined(0)).toBe(true);
        expect(TypeGuards.isDefined('')).toBe(true);
        expect(TypeGuards.isDefined(false)).toBe(true);
        expect(TypeGuards.isDefined({})).toBe(true);
      });

      it('should return false for null and undefined', () => {
        expect(TypeGuards.isDefined(null)).toBe(false);
        expect(TypeGuards.isDefined(undefined)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isDefined(0)).toBe(true);
        expect(isDefined(null)).toBe(false);
      });
    });
  });

  // ===================================================================
  // SPECIAL TYPE GUARDS
  // ===================================================================

  describe('Special Type Guards', () => {
    describe('isValidDate()', () => {
      it('should return true for valid Date objects', () => {
        expect(TypeGuards.isValidDate(new Date())).toBe(true);
        expect(TypeGuards.isValidDate(new Date('2025-01-15'))).toBe(true);
        expect(TypeGuards.isValidDate(new Date(0))).toBe(true);
      });

      it('should return false for invalid Date objects', () => {
        expect(TypeGuards.isValidDate(new Date('invalid'))).toBe(false);
        expect(TypeGuards.isValidDate(new Date(NaN))).toBe(false);
      });

      it('should return false for non-Date values', () => {
        expect(TypeGuards.isValidDate('2025-01-15')).toBe(false);
        expect(TypeGuards.isValidDate(1705286400000)).toBe(false);
        expect(TypeGuards.isValidDate(null)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isValidDate(new Date())).toBe(true);
        expect(isValidDate('2025-01-15')).toBe(false);
      });
    });

    describe('isRegExp()', () => {
      it('should return true for RegExp objects', () => {
        expect(TypeGuards.isRegExp(/test/)).toBe(true);
        expect(TypeGuards.isRegExp(new RegExp('test'))).toBe(true);
        expect(TypeGuards.isRegExp(/test/gi)).toBe(true);
      });

      it('should return false for non-RegExp values', () => {
        expect(TypeGuards.isRegExp('/test/')).toBe(false);
        expect(TypeGuards.isRegExp({})).toBe(false);
        expect(TypeGuards.isRegExp(null)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isRegExp(/test/)).toBe(true);
        expect(isRegExp('test')).toBe(false);
      });
    });

    describe('isPromise()', () => {
      it('should return true for Promises', () => {
        expect(TypeGuards.isPromise(Promise.resolve())).toBe(true);
        expect(TypeGuards.isPromise(Promise.reject().catch(() => {}))).toBe(true);
        expect(TypeGuards.isPromise(new Promise(() => {}))).toBe(true);
      });

      it('should return true for thenables', () => {
        expect(TypeGuards.isPromise({ then: () => {} })).toBe(true);
      });

      it('should return false for non-Promises', () => {
        expect(TypeGuards.isPromise({})).toBe(false);
        expect(TypeGuards.isPromise(null)).toBe(false);
        expect(TypeGuards.isPromise({ then: 'not a function' })).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isPromise(Promise.resolve())).toBe(true);
        expect(isPromise({})).toBe(false);
      });
    });

    describe('isError()', () => {
      it('should return true for Error objects', () => {
        expect(TypeGuards.isError(new Error('test'))).toBe(true);
        expect(TypeGuards.isError(new TypeError('test'))).toBe(true);
        expect(TypeGuards.isError(new RangeError('test'))).toBe(true);
      });

      it('should return false for error-like objects', () => {
        expect(TypeGuards.isError({ message: 'test' })).toBe(false);
        expect(TypeGuards.isError({ message: 'test', stack: 'stack' })).toBe(false);
      });

      it('should return false for non-Error values', () => {
        expect(TypeGuards.isError(null)).toBe(false);
        expect(TypeGuards.isError('error')).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isError(new Error())).toBe(true);
        expect(isError({})).toBe(false);
      });
    });
  });

  // ===================================================================
  // EMPTY/TRUTHY/FALSY GUARDS
  // ===================================================================

  describe('Empty/Truthy/Falsy Guards', () => {
    describe('isEmpty()', () => {
      it('should return true for empty values', () => {
        expect(TypeGuards.isEmpty('')).toBe(true);
        expect(TypeGuards.isEmpty([])).toBe(true);
        expect(TypeGuards.isEmpty({})).toBe(true);
        expect(TypeGuards.isEmpty(null)).toBe(true);
        expect(TypeGuards.isEmpty(undefined)).toBe(true);
      });

      it('should return false for non-empty values', () => {
        expect(TypeGuards.isEmpty('a')).toBe(false);
        expect(TypeGuards.isEmpty([1])).toBe(false);
        expect(TypeGuards.isEmpty({ a: 1 })).toBe(false);
        expect(TypeGuards.isEmpty(0)).toBe(false);
        expect(TypeGuards.isEmpty(false)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isEmpty('')).toBe(true);
        expect(isEmpty('a')).toBe(false);
      });
    });

    describe('isTruthy()', () => {
      it('should return true for truthy values', () => {
        expect(TypeGuards.isTruthy(true)).toBe(true);
        expect(TypeGuards.isTruthy(1)).toBe(true);
        expect(TypeGuards.isTruthy('a')).toBe(true);
        expect(TypeGuards.isTruthy({})).toBe(true);
        expect(TypeGuards.isTruthy([])).toBe(true);
      });

      it('should return false for falsy values', () => {
        expect(TypeGuards.isTruthy(false)).toBe(false);
        expect(TypeGuards.isTruthy(0)).toBe(false);
        expect(TypeGuards.isTruthy('')).toBe(false);
        expect(TypeGuards.isTruthy(null)).toBe(false);
        expect(TypeGuards.isTruthy(undefined)).toBe(false);
        expect(TypeGuards.isTruthy(NaN)).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isTruthy(1)).toBe(true);
        expect(isTruthy(0)).toBe(false);
      });
    });

    describe('isFalsy()', () => {
      it('should return true for falsy values', () => {
        expect(TypeGuards.isFalsy(false)).toBe(true);
        expect(TypeGuards.isFalsy(0)).toBe(true);
        expect(TypeGuards.isFalsy('')).toBe(true);
        expect(TypeGuards.isFalsy(null)).toBe(true);
        expect(TypeGuards.isFalsy(undefined)).toBe(true);
        expect(TypeGuards.isFalsy(NaN)).toBe(true);
      });

      it('should return false for truthy values', () => {
        expect(TypeGuards.isFalsy(true)).toBe(false);
        expect(TypeGuards.isFalsy(1)).toBe(false);
        expect(TypeGuards.isFalsy('a')).toBe(false);
        expect(TypeGuards.isFalsy({})).toBe(false);
      });

      it('should work as standalone export', () => {
        expect(isFalsy(0)).toBe(true);
        expect(isFalsy(1)).toBe(false);
      });
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle Symbol values', () => {
      const sym = Symbol('test');
      expect(TypeGuards.isString(sym)).toBe(false);
      expect(TypeGuards.isNumber(sym)).toBe(false);
      expect(TypeGuards.isObject(sym)).toBe(false);
    });

    it('should handle BigInt values', () => {
      const big = BigInt(123);
      expect(TypeGuards.isNumber(big)).toBe(false);
      expect(TypeGuards.isInteger(big)).toBe(false);
    });

    it('should handle class instances', () => {
      class MyClass {}
      const instance = new MyClass();
      expect(TypeGuards.isObject(instance)).toBe(true);
      expect(TypeGuards.isPlainObject(instance)).toBe(false);
    });

    it('should handle array-like objects', () => {
      const arrayLike = { 0: 'a', 1: 'b', length: 2 };
      expect(TypeGuards.isArray(arrayLike)).toBe(false);
      expect(TypeGuards.isNonEmptyArray(arrayLike)).toBe(false);
    });

    it('should handle sparse arrays', () => {
      // eslint-disable-next-line no-sparse-arrays
      const sparse = [1, , 3];
      expect(TypeGuards.isArray(sparse)).toBe(true);
      expect(TypeGuards.isNonEmptyArray(sparse)).toBe(true);
    });

    it('should handle frozen objects', () => {
      const frozen = Object.freeze({ a: 1 });
      expect(TypeGuards.isPlainObject(frozen)).toBe(true);
      expect(TypeGuards.isNonEmptyObject(frozen)).toBe(true);
    });
  });
});
