/**
 * Unit tests for Assert class
 */

import { SmartAssert } from '../src/SmartAssert.js';

describe('SmartAssert', () => {
  describe('isTrue', () => {
    it('should pass when value is truthy', () => {
      expect(() => SmartAssert.isTrue(true)).not.toThrow();
      expect(() => SmartAssert.isTrue(1)).not.toThrow();
      expect(() => SmartAssert.isTrue('string')).not.toThrow();
      expect(() => SmartAssert.isTrue({})).not.toThrow();
    });

    it('should throw when value is falsy', () => {
      expect(() => SmartAssert.isTrue(false)).toThrow();
      expect(() => SmartAssert.isTrue(0)).toThrow();
      expect(() => SmartAssert.isTrue('')).toThrow();
      expect(() => SmartAssert.isTrue(null)).toThrow();
    });

    it('should use custom message', () => {
      expect(() => SmartAssert.isTrue(false, 'Custom message')).toThrow();
    });
  });

  describe('isFalse', () => {
    it('should pass when value is falsy', () => {
      expect(() => SmartAssert.isFalse(false)).not.toThrow();
      expect(() => SmartAssert.isFalse(0)).not.toThrow();
      expect(() => SmartAssert.isFalse('')).not.toThrow();
      expect(() => SmartAssert.isFalse(null)).not.toThrow();
    });

    it('should throw when value is truthy', () => {
      expect(() => SmartAssert.isFalse(true)).toThrow();
      expect(() => SmartAssert.isFalse(1)).toThrow();
      expect(() => SmartAssert.isFalse('string')).toThrow();
    });
  });

  describe('equals', () => {
    it('should pass when values are strictly equal', () => {
      expect(() => SmartAssert.equals(1, 1)).not.toThrow();
      expect(() => SmartAssert.equals('hello', 'hello')).not.toThrow();
      expect(() => SmartAssert.equals(true, true)).not.toThrow();
    });

    it('should throw when values are not equal', () => {
      expect(() => SmartAssert.equals(1, 2)).toThrow();
      expect(() => SmartAssert.equals('hello', 'world')).toThrow();
    });

    it('should use strict equality', () => {
      expect(() => SmartAssert.equals(1, '1')).toThrow();
      expect(() => SmartAssert.equals(0, false)).toThrow();
    });
  });

  describe('deepEquals', () => {
    it('should pass when objects are deeply equal', () => {
      expect(() => SmartAssert.deepEquals({ a: 1 }, { a: 1 })).not.toThrow();
      expect(() => SmartAssert.deepEquals([1, 2, 3], [1, 2, 3])).not.toThrow();
      expect(() => SmartAssert.deepEquals({ a: { b: 1 } }, { a: { b: 1 } })).not.toThrow();
    });

    it('should throw when objects are not deeply equal', () => {
      expect(() => SmartAssert.deepEquals({ a: 1 }, { a: 2 })).toThrow();
      expect(() => SmartAssert.deepEquals([1, 2], [1, 3])).toThrow();
    });
  });

  describe('notNull', () => {
    it('should pass when value is not null or undefined', () => {
      expect(() => SmartAssert.notNull(0)).not.toThrow();
      expect(() => SmartAssert.notNull('')).not.toThrow();
      expect(() => SmartAssert.notNull(false)).not.toThrow();
      expect(() => SmartAssert.notNull({})).not.toThrow();
    });

    it('should throw when value is null or undefined', () => {
      expect(() => SmartAssert.notNull(null)).toThrow();
      expect(() => SmartAssert.notNull(undefined)).toThrow();
    });
  });

  describe('isNull', () => {
    it('should pass when value is null or undefined', () => {
      expect(() => SmartAssert.isNull(null)).not.toThrow();
      expect(() => SmartAssert.isNull(undefined)).not.toThrow();
    });

    it('should throw when value is not null', () => {
      expect(() => SmartAssert.isNull(0)).toThrow();
      expect(() => SmartAssert.isNull('')).toThrow();
      expect(() => SmartAssert.isNull(false)).toThrow();
    });
  });

  describe('contains', () => {
    it('should pass when array contains value', () => {
      expect(() => SmartAssert.contains([1, 2, 3], 2)).not.toThrow();
      expect(() => SmartAssert.contains(['a', 'b', 'c'], 'b')).not.toThrow();
    });

    it('should throw when array does not contain value', () => {
      expect(() => SmartAssert.contains([1, 2, 3], 4)).toThrow();
    });

    it('should throw when first argument is not an array', () => {
      expect(() => SmartAssert.contains('not array', 1)).toThrow();
      expect(() => SmartAssert.contains(null, 1)).toThrow();
    });
  });

  describe('fail', () => {
    it('should always throw with message', () => {
      expect(() => SmartAssert.fail('Test failure')).toThrow();
      expect(() => SmartAssert.fail()).toThrow();
    });
  });
});
