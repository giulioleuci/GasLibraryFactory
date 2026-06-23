/**
 * @file RoleResolutionLib/src/__tests__/core/ActorType.test.js
 * @description Unit tests for ActorType enum and utility functions.
 */

import { describe, it, expect } from '@jest/globals';
import { ActorType, isValidActorType, getActorTypes } from '../../core/ActorType.js';

describe('ActorType Module', () => {
  describe('ActorType enum', () => {
    it('should define PERSON actor type', () => {
      expect(ActorType.PERSON).toBe('PERSON');
    });

    it('should define SYSTEM actor type', () => {
      expect(ActorType.SYSTEM).toBe('SYSTEM');
    });

    it('should define GROUP actor type', () => {
      expect(ActorType.GROUP).toBe('GROUP');
    });

    it('should be immutable', () => {
      expect(Object.isFrozen(ActorType)).toBe(true);
    });
  });

  describe('isValidActorType()', () => {
    it('should return true for valid actor types', () => {
      expect(isValidActorType(ActorType.PERSON)).toBe(true);
      expect(isValidActorType(ActorType.SYSTEM)).toBe(true);
      expect(isValidActorType(ActorType.GROUP)).toBe(true);
      expect(isValidActorType('PERSON')).toBe(true);
      expect(isValidActorType('SYSTEM')).toBe(true);
      expect(isValidActorType('GROUP')).toBe(true);
    });

    it('should return false for invalid actor types', () => {
      expect(isValidActorType('INVALID')).toBe(false);
      expect(isValidActorType('person')).toBe(false); // Case sensitive
      expect(isValidActorType('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidActorType(null)).toBe(false);
      expect(isValidActorType(undefined)).toBe(false);
      expect(isValidActorType(123)).toBe(false);
      expect(isValidActorType({})).toBe(false);
      expect(isValidActorType([])).toBe(false);
    });
  });

  describe('getActorTypes()', () => {
    it('should return all valid actor types', () => {
      const types = getActorTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types).toHaveLength(3);
      expect(types).toContain(ActorType.PERSON);
      expect(types).toContain(ActorType.SYSTEM);
      expect(types).toContain(ActorType.GROUP);
    });
  });
});
