/**
 * @file RoleResolutionLib/src/__tests__/core/ScopeType.test.js
 * @description Unit tests for ScopeType enumeration and related functions.
 */

import { describe, it, expect } from '@jest/globals';
import { ScopeType, isValidScopeType, getScopeTypes } from '../../core/ScopeType.js';

describe('ScopeType', () => {
  describe('Enum Definition', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(ScopeType)).toBe(true);
    });

    it('should contain expected keys and values', () => {
      expect(ScopeType).toEqual({
        GLOBAL: 'GLOBAL',
        ORG_UNIT: 'ORG_UNIT',
        PROJECT: 'PROJECT',
        RESOURCE: 'RESOURCE',
        CUSTOM: 'CUSTOM'
      });
    });
  });

  describe('isValidScopeType', () => {
    it('should return true for valid scope types', () => {
      expect(isValidScopeType(ScopeType.GLOBAL)).toBe(true);
      expect(isValidScopeType(ScopeType.ORG_UNIT)).toBe(true);
      expect(isValidScopeType(ScopeType.PROJECT)).toBe(true);
      expect(isValidScopeType(ScopeType.RESOURCE)).toBe(true);
      expect(isValidScopeType(ScopeType.CUSTOM)).toBe(true);
      expect(isValidScopeType('GLOBAL')).toBe(true);
    });

    it('should return false for invalid scope types', () => {
      expect(isValidScopeType('INVALID_TYPE')).toBe(false);
      expect(isValidScopeType('global')).toBe(false); // Case sensitive
      expect(isValidScopeType('')).toBe(false);
      expect(isValidScopeType(null)).toBe(false);
      expect(isValidScopeType(undefined)).toBe(false);
      expect(isValidScopeType(123)).toBe(false);
      expect(isValidScopeType({})).toBe(false);
      expect(isValidScopeType([])).toBe(false);
    });
  });

  describe('getScopeTypes', () => {
    it('should return an array of all valid scope types', () => {
      const types = getScopeTypes();
      expect(types).toBeInstanceOf(Array);
      expect(types).toHaveLength(5);
      expect(types).toContain(ScopeType.GLOBAL);
      expect(types).toContain(ScopeType.ORG_UNIT);
      expect(types).toContain(ScopeType.PROJECT);
      expect(types).toContain(ScopeType.RESOURCE);
      expect(types).toContain(ScopeType.CUSTOM);
    });
  });
});
