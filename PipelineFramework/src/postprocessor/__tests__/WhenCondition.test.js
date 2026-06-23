/**
 * @file PipelineFramework/src/postprocessor/__tests__/WhenCondition.test.js
 * @description Unit tests for WhenCondition enum
 */

import { WhenCondition, isValidWhenCondition } from '../WhenCondition';

describe('WhenCondition', () => {
  describe('Enum Values', () => {
    it('should have ALWAYS condition', () => {
      expect(WhenCondition.ALWAYS).toBe('ALWAYS');
    });

    it('should have ON_SUCCESS condition', () => {
      expect(WhenCondition.ON_SUCCESS).toBe('ON_SUCCESS');
    });

    it('should have ON_ERROR condition', () => {
      expect(WhenCondition.ON_ERROR).toBe('ON_ERROR');
    });

    it('should have CUSTOM condition', () => {
      expect(WhenCondition.CUSTOM).toBe('CUSTOM');
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(WhenCondition)).toBe(true);
    });

    it('should have exactly 4 conditions', () => {
      expect(Object.keys(WhenCondition)).toHaveLength(4);
    });
  });

  describe('isValidWhenCondition', () => {
    it('should return true for valid conditions', () => {
      expect(isValidWhenCondition(WhenCondition.ALWAYS)).toBe(true);
      expect(isValidWhenCondition(WhenCondition.ON_SUCCESS)).toBe(true);
      expect(isValidWhenCondition(WhenCondition.ON_ERROR)).toBe(true);
      expect(isValidWhenCondition(WhenCondition.CUSTOM)).toBe(true);
    });

    it('should return true for string values', () => {
      expect(isValidWhenCondition('ALWAYS')).toBe(true);
      expect(isValidWhenCondition('ON_SUCCESS')).toBe(true);
      expect(isValidWhenCondition('ON_ERROR')).toBe(true);
      expect(isValidWhenCondition('CUSTOM')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isValidWhenCondition('INVALID')).toBe(false);
      expect(isValidWhenCondition('')).toBe(false);
      expect(isValidWhenCondition(null)).toBe(false);
      expect(isValidWhenCondition(undefined)).toBe(false);
      expect(isValidWhenCondition(123)).toBe(false);
      expect(isValidWhenCondition({})).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isValidWhenCondition('always')).toBe(false);
      expect(isValidWhenCondition('Always')).toBe(false);
      expect(isValidWhenCondition('on_success')).toBe(false);
    });
  });
});
