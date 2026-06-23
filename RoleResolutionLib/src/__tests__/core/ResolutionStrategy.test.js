import {
  ResolutionStrategy,
  isValidResolutionStrategy,
  getResolutionStrategies
} from '../../core/ResolutionStrategy.js';

describe('ResolutionStrategy', () => {
  describe('Constants', () => {
    it('should have FIRST defined', () => {
      expect(ResolutionStrategy.FIRST).toBe('FIRST');
    });

    it('should have ALL defined', () => {
      expect(ResolutionStrategy.ALL).toBe('ALL');
    });

    it('should have PRIORITY defined', () => {
      expect(ResolutionStrategy.PRIORITY).toBe('PRIORITY');
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(ResolutionStrategy)).toBe(true);
    });
  });

  describe('isValidResolutionStrategy()', () => {
    it('should return true for FIRST', () => {
      expect(isValidResolutionStrategy('FIRST')).toBe(true);
    });

    it('should return true for ALL', () => {
      expect(isValidResolutionStrategy('ALL')).toBe(true);
    });

    it('should return true for PRIORITY', () => {
      expect(isValidResolutionStrategy('PRIORITY')).toBe(true);
    });

    it('should return false for invalid string', () => {
      expect(isValidResolutionStrategy('INVALID')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidResolutionStrategy(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidResolutionStrategy(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidResolutionStrategy('')).toBe(false);
    });

    it('should return false for completely different type', () => {
      expect(isValidResolutionStrategy(123)).toBe(false);
      expect(isValidResolutionStrategy({})).toBe(false);
    });
  });

  describe('getResolutionStrategies()', () => {
    it('should return all valid strategies', () => {
      const strategies = getResolutionStrategies();
      expect(strategies).toBeInstanceOf(Array);
      expect(strategies).toHaveLength(3);
      expect(strategies).toContain('FIRST');
      expect(strategies).toContain('ALL');
      expect(strategies).toContain('PRIORITY');
    });
  });
});
