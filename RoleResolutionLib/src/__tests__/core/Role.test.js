/**
 * @file RoleResolutionLib/src/__tests__/core/Role.test.js
 * @description Unit tests for Role value object
 */

import { Role } from '../../core/Role.js';
import { ScopeType } from '../../core/ScopeType.js';
import { ResolutionStrategy } from '../../core/ResolutionStrategy.js';

describe('Role', () => {
  describe('Constructor', () => {
    it('should create a valid role with minimal definition', () => {
      const role = new Role({
        id: 'MANAGER',
        name: 'Manager'
      });

      expect(role.id).toBe('MANAGER');
      expect(role.name).toBe('Manager');
      expect(role.scopeType).toBe(ScopeType.GLOBAL);
      expect(role.resolutionStrategy).toBe(ResolutionStrategy.FIRST);
      expect(role.allowsDelegation).toBe(true);
      expect(role.fallbackRoles).toEqual([]);
    });

    it('should create a valid role with full definition', () => {
      const role = new Role({
        id: 'DEPT_MANAGER',
        name: 'Department Manager',
        description: 'Manages a department',
        scopeType: ScopeType.ORG_UNIT,
        resolutionStrategy: ResolutionStrategy.PRIORITY,
        allowsDelegation: true,
        fallbackRoles: ['DIVISION_MANAGER'],
        metadata: { category: 'management' }
      });

      expect(role.id).toBe('DEPT_MANAGER');
      expect(role.description).toBe('Manages a department');
      expect(role.scopeType).toBe(ScopeType.ORG_UNIT);
      expect(role.resolutionStrategy).toBe(ResolutionStrategy.PRIORITY);
      expect(role.fallbackRoles).toEqual(['DIVISION_MANAGER']);
      expect(role.metadata.category).toBe('management');
    });

    it('should throw error for missing id', () => {
      expect(() => new Role({ name: 'Test' })).toThrow('Role id is required');
    });

    it('should throw error for missing name', () => {
      expect(() => new Role({ id: 'TEST' })).toThrow('Role name is required');
    });

    it('should throw error for invalid scope type', () => {
      expect(() => new Role({ id: 'TEST', name: 'Test', scopeType: 'INVALID' })).toThrow(
        'Invalid scope type'
      );
    });

    it('should throw error for invalid resolution strategy', () => {
      expect(() => new Role({ id: 'TEST', name: 'Test', resolutionStrategy: 'INVALID' })).toThrow(
        'Invalid resolution strategy'
      );
    });

    it('should be immutable', () => {
      const role = new Role({ id: 'TEST', name: 'Test' });

      expect(() => {
        role.id = 'OTHER';
      }).toThrow();
      expect(() => {
        role.allowsDelegation = false;
      }).toThrow();
    });
  });

  describe('Type checks', () => {
    it('should identify global role', () => {
      const role = new Role({ id: 'CEO', name: 'CEO', scopeType: ScopeType.GLOBAL });
      expect(role.isGlobal()).toBe(true);
    });

    it('should identify non-global role', () => {
      const role = new Role({ id: 'MGR', name: 'Manager', scopeType: ScopeType.ORG_UNIT });
      expect(role.isGlobal()).toBe(false);
    });

    it('should identify ALL resolution strategy', () => {
      const role = new Role({
        id: 'NOTIFY',
        name: 'Notify',
        resolutionStrategy: ResolutionStrategy.ALL
      });
      expect(role.resolvesToAll()).toBe(true);
    });

    it('should identify PRIORITY resolution strategy', () => {
      const role = new Role({
        id: 'APPROVER',
        name: 'Approver',
        resolutionStrategy: ResolutionStrategy.PRIORITY
      });
      expect(role.usesPriority()).toBe(true);
    });
  });

  describe('Fallbacks', () => {
    it('should check for fallback roles', () => {
      const withFallbacks = new Role({
        id: 'DEPT_MGR',
        name: 'Dept Manager',
        fallbackRoles: ['DIV_MGR']
      });
      const withoutFallbacks = new Role({
        id: 'CEO',
        name: 'CEO'
      });

      expect(withFallbacks.hasFallbacks()).toBe(true);
      expect(withoutFallbacks.hasFallbacks()).toBe(false);
    });
  });

  describe('Metadata', () => {
    it('should get metadata value', () => {
      const role = new Role({
        id: 'TEST',
        name: 'Test',
        metadata: { level: 3 }
      });

      expect(role.getMetadata('level')).toBe(3);
      expect(role.getMetadata('missing', 'default')).toBe('default');
    });
  });

  describe('equals()', () => {
    it('should return true for same id', () => {
      const role1 = new Role({ id: 'MANAGER', name: 'Manager' });
      const role2 = new Role({ id: 'MANAGER', name: 'Department Manager' });

      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false for different id', () => {
      const role1 = new Role({ id: 'MANAGER', name: 'Manager' });
      const role2 = new Role({ id: 'APPROVER', name: 'Approver' });

      expect(role1.equals(role2)).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const role = new Role({
        id: 'MANAGER',
        name: 'Manager',
        scopeType: ScopeType.ORG_UNIT
      });
      const json = role.toJSON();

      expect(json.id).toBe('MANAGER');
      expect(json.name).toBe('Manager');
      expect(json.scopeType).toBe('ORG_UNIT');
    });

    it('should deserialize from JSON', () => {
      const json = {
        id: 'MANAGER',
        name: 'Manager',
        scopeType: 'ORG_UNIT',
        resolutionStrategy: 'FIRST'
      };

      const role = Role.fromJSON(json);

      expect(role.id).toBe('MANAGER');
      expect(role.scopeType).toBe(ScopeType.ORG_UNIT);
    });

    it('should round-trip through JSON', () => {
      const original = new Role({
        id: 'MANAGER',
        name: 'Manager',
        description: 'Test role',
        scopeType: ScopeType.PROJECT,
        fallbackRoles: ['BACKUP']
      });
      const json = original.toJSON();
      const restored = Role.fromJSON(json);

      expect(restored.equals(original)).toBe(true);
      expect(restored.description).toBe(original.description);
      expect(restored.fallbackRoles).toEqual(original.fallbackRoles);
    });
  });
});
