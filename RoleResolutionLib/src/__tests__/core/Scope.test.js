/**
 * @file RoleResolutionLib/src/__tests__/core/Scope.test.js
 * @description Unit tests for Scope value object
 */

import { Scope } from '../../core/Scope.js';
import { ScopeType } from '../../core/ScopeType.js';

describe('Scope', () => {
  describe('Constructor', () => {
    it('should create a valid scope with type only', () => {
      const scope = new Scope(ScopeType.GLOBAL);

      expect(scope.type).toBe(ScopeType.GLOBAL);
      expect(scope.value).toBeNull();
      expect(scope.hierarchy).toEqual([]);
    });

    it('should create a valid scope with type and value', () => {
      const scope = new Scope(ScopeType.ORG_UNIT, 'Sales');

      expect(scope.type).toBe(ScopeType.ORG_UNIT);
      expect(scope.value).toBe('Sales');
    });

    it('should create a valid scope with hierarchy', () => {
      const scope = new Scope(ScopeType.ORG_UNIT, 'Team-A', ['Company', 'Sales', 'Team-A']);

      expect(scope.hierarchy).toEqual(['Company', 'Sales', 'Team-A']);
    });

    it('should throw error for invalid scope type', () => {
      expect(() => new Scope('INVALID')).toThrow('Invalid scope type');
    });

    it('should be immutable', () => {
      const scope = new Scope(ScopeType.PROJECT, 'PRJ-001');

      expect(() => {
        scope.type = 'OTHER';
      }).toThrow();
      expect(() => {
        scope.value = 'OTHER';
      }).toThrow();
    });
  });

  describe('Static Factory Methods', () => {
    it('should create global scope', () => {
      const scope = Scope.global();

      expect(scope.type).toBe(ScopeType.GLOBAL);
      expect(scope.isGlobal()).toBe(true);
    });

    it('should create org unit scope', () => {
      const scope = Scope.orgUnit('Engineering', ['Company', 'Engineering']);

      expect(scope.type).toBe(ScopeType.ORG_UNIT);
      expect(scope.value).toBe('Engineering');
    });

    it('should create project scope', () => {
      const scope = Scope.project('PRJ-001');

      expect(scope.type).toBe(ScopeType.PROJECT);
      expect(scope.value).toBe('PRJ-001');
    });

    it('should create resource scope', () => {
      const scope = Scope.resource('doc-12345');

      expect(scope.type).toBe(ScopeType.RESOURCE);
      expect(scope.value).toBe('doc-12345');
    });

    it('should create custom scope', () => {
      const scope = Scope.custom({ region: 'EU', zone: 'west' });

      expect(scope.type).toBe(ScopeType.CUSTOM);
      expect(scope.value).toEqual({ region: 'EU', zone: 'west' });
    });
  });

  describe('contains()', () => {
    it('should return true for global containing any scope', () => {
      const global = Scope.global();
      const dept = Scope.orgUnit('Sales');
      const project = Scope.project('PRJ-001');

      expect(global.contains(dept)).toBe(true);
      expect(global.contains(project)).toBe(true);
      expect(global.contains(global)).toBe(true);
    });

    it('should return false for non-global not containing global', () => {
      const dept = Scope.orgUnit('Sales');
      const global = Scope.global();

      expect(dept.contains(global)).toBe(false);
    });

    it('should return false for different types', () => {
      const dept = Scope.orgUnit('Sales');
      const project = Scope.project('PRJ-001');

      expect(dept.contains(project)).toBe(false);
    });

    it('should return true for same type and matching value', () => {
      const scope1 = Scope.project('PRJ-001');
      const scope2 = Scope.project('PRJ-001');

      expect(scope1.contains(scope2)).toBe(true);
    });

    it('should handle hierarchy containment', () => {
      const parent = new Scope(ScopeType.ORG_UNIT, 'Sales', ['Company', 'Sales']);
      const child = new Scope(ScopeType.ORG_UNIT, 'Team-A', ['Company', 'Sales', 'Team-A']);

      expect(parent.contains(child)).toBe(true);
      expect(child.contains(parent)).toBe(false);
    });
  });

  describe('matches()', () => {
    it('should return true for identical scopes', () => {
      const scope1 = Scope.project('PRJ-001');
      const scope2 = Scope.project('PRJ-001');

      expect(scope1.matches(scope2)).toBe(true);
    });

    it('should return false for different values', () => {
      const scope1 = Scope.project('PRJ-001');
      const scope2 = Scope.project('PRJ-002');

      expect(scope1.matches(scope2)).toBe(false);
    });

    it('should return false for different types', () => {
      const scope1 = Scope.project('PRJ-001');
      const scope2 = Scope.resource('PRJ-001');

      expect(scope1.matches(scope2)).toBe(false);
    });

    it('should return true for global scopes', () => {
      const scope1 = Scope.global();
      const scope2 = Scope.global();

      expect(scope1.matches(scope2)).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const scope = Scope.orgUnit('Sales', ['Company', 'Sales']);
      const json = scope.toJSON();

      expect(json).toEqual({
        type: 'ORG_UNIT',
        value: 'Sales',
        hierarchy: ['Company', 'Sales']
      });
    });

    it('should deserialize from JSON', () => {
      const json = {
        type: 'PROJECT',
        value: 'PRJ-001',
        hierarchy: []
      };

      const scope = Scope.fromJSON(json);

      expect(scope.type).toBe(ScopeType.PROJECT);
      expect(scope.value).toBe('PRJ-001');
    });

    it('should round-trip through JSON', () => {
      const original = Scope.orgUnit('Engineering', ['Company', 'Engineering']);
      const json = original.toJSON();
      const restored = Scope.fromJSON(json);

      expect(restored.matches(original)).toBe(true);
    });
  });

  describe('toString()', () => {
    it('should format global scope', () => {
      const scope = Scope.global();
      expect(scope.toString()).toBe('Scope[GLOBAL]');
    });

    it('should format scoped scope', () => {
      const scope = Scope.project('PRJ-001');
      expect(scope.toString()).toBe('Scope[PROJECT:PRJ-001]');
    });

    it('should include hierarchy', () => {
      const scope = new Scope(ScopeType.ORG_UNIT, 'Team', ['Company', 'Dept', 'Team']);
      expect(scope.toString()).toContain('Company/Dept/Team');
    });
  });
});
