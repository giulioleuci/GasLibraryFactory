/**
 * @file SheetDBLib/src/multi/__tests__/RoutingStrategy.test.js
 * @description Unit tests for RoutingStrategy enum.
 */

import {
  RoutingStrategy,
  isValidRoutingStrategy,
  getRoutingStrategies
} from '../RoutingStrategy.js';

describe('RoutingStrategy', () => {
  describe('enum values', () => {
    it('should have all expected strategies', () => {
      expect(RoutingStrategy.EXPLICIT).toBe('EXPLICIT');
      expect(RoutingStrategy.TAG_BASED).toBe('TAG_BASED');
      expect(RoutingStrategy.ROUND_ROBIN).toBe('ROUND_ROBIN');
      expect(RoutingStrategy.PRIORITY).toBe('PRIORITY');
      expect(RoutingStrategy.CUSTOM).toBe('CUSTOM');
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(RoutingStrategy)).toBe(true);
    });

    it('should have exactly 5 strategies', () => {
      expect(Object.keys(RoutingStrategy)).toHaveLength(5);
    });
  });

  describe('isValidRoutingStrategy', () => {
    it('should return true for valid strategies', () => {
      expect(isValidRoutingStrategy('EXPLICIT')).toBe(true);
      expect(isValidRoutingStrategy('TAG_BASED')).toBe(true);
      expect(isValidRoutingStrategy('ROUND_ROBIN')).toBe(true);
      expect(isValidRoutingStrategy('PRIORITY')).toBe(true);
      expect(isValidRoutingStrategy('CUSTOM')).toBe(true);
    });

    it('should return false for invalid strategies', () => {
      expect(isValidRoutingStrategy('INVALID')).toBe(false);
      expect(isValidRoutingStrategy('')).toBe(false);
      expect(isValidRoutingStrategy(null)).toBe(false);
      expect(isValidRoutingStrategy(undefined)).toBe(false);
      expect(isValidRoutingStrategy(123)).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isValidRoutingStrategy('explicit')).toBe(false);
      expect(isValidRoutingStrategy('Explicit')).toBe(false);
    });
  });

  describe('getRoutingStrategies', () => {
    it('should return all strategy values', () => {
      const strategies = getRoutingStrategies();
      expect(strategies).toContain('EXPLICIT');
      expect(strategies).toContain('TAG_BASED');
      expect(strategies).toContain('ROUND_ROBIN');
      expect(strategies).toContain('PRIORITY');
      expect(strategies).toContain('CUSTOM');
    });

    it('should return an array', () => {
      expect(Array.isArray(getRoutingStrategies())).toBe(true);
    });

    it('should return 5 strategies', () => {
      expect(getRoutingStrategies()).toHaveLength(5);
    });
  });
});
