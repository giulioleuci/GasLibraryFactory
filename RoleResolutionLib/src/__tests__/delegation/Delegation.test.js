/**
 * @file RoleResolutionLib/src/__tests__/delegation/Delegation.test.js
 * @description Unit tests for Delegation value object
 */

import { Delegation } from '../../internal/delegation/Delegation.js';
import { Scope } from '../../core/Scope.js';
import { RoutingPolicy } from '../../internal/routing/RoutingPolicy.js';

describe('Delegation', () => {
  describe('Constructor', () => {
    it('should create a valid delegation with minimal definition', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456'
      });

      expect(delegation.id).toBe('del-001');
      expect(delegation.principalId).toBe('user-123');
      expect(delegation.delegateId).toBe('user-456');
      expect(delegation.roleIds).toBe('*');
      expect(delegation.routingPolicy).toBe(RoutingPolicy.DELEGATE_ONLY);
      expect(delegation.isActive).toBe(true);
    });

    it('should create a valid delegation with full definition', () => {
      const delegation = new Delegation({
        id: 'del-002',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: ['APPROVER', 'REVIEWER'],
        scope: Scope.project('PRJ-001'),
        scopeRestriction: Scope.project('PRJ-001'),
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-01-31'),
        routingPolicy: RoutingPolicy.BOTH_EQUAL,
        isActive: true,
        reason: 'Vacation'
      });

      expect(delegation.roleIds).toEqual(['APPROVER', 'REVIEWER']);
      expect(delegation.scope).toBeInstanceOf(Scope);
      expect(delegation.routingPolicy).toBe(RoutingPolicy.BOTH_EQUAL);
      expect(delegation.reason).toBe('Vacation');
    });

    it('should throw error for missing id', () => {
      expect(
        () =>
          new Delegation({
            principalId: 'user-123',
            delegateId: 'user-456'
          })
      ).toThrow('Delegation id is required');
    });

    it('should throw error when principal equals delegate', () => {
      expect(
        () =>
          new Delegation({
            id: 'del-001',
            principalId: 'user-123',
            delegateId: 'user-123'
          })
      ).toThrow('Principal and delegate cannot be the same actor');
    });

    it('should throw error for invalid routing policy', () => {
      expect(
        () =>
          new Delegation({
            id: 'del-001',
            principalId: 'user-123',
            delegateId: 'user-456',
            routingPolicy: 'INVALID'
          })
      ).toThrow('Invalid routing policy');
    });

    it('should be immutable', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456'
      });

      expect(() => {
        delegation.id = 'other';
      }).toThrow();
      expect(() => {
        delegation.isActive = false;
      }).toThrow();
    });
  });

  describe('Validity checks', () => {
    it('should be valid when active with no date constraints', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        isActive: true
      });

      expect(delegation.isValidAt(new Date())).toBe(true);
    });

    it('should be invalid when not active', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        isActive: false
      });

      expect(delegation.isValidAt(new Date())).toBe(false);
    });

    it('should be invalid before validFrom', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        validFrom: new Date('2030-01-01')
      });

      expect(delegation.isValidAt(new Date())).toBe(false);
    });

    it('should be invalid after validTo', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        validFrom: new Date('2020-01-01'),
        validTo: new Date('2020-12-31')
      });

      expect(delegation.isValidAt(new Date())).toBe(false);
    });

    it('should be valid within date range', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        validFrom: new Date('2020-01-01'),
        validTo: new Date('2030-12-31')
      });

      expect(delegation.isValidAt(new Date())).toBe(true);
    });
  });

  describe('Role applicability', () => {
    it('should apply to all roles with "*"', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: '*'
      });

      expect(delegation.appliesToRole('MANAGER')).toBe(true);
      expect(delegation.appliesToRole('APPROVER')).toBe(true);
      expect(delegation.appliesToRole('ANYTHING')).toBe(true);
    });

    it('should apply only to specified roles', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: ['APPROVER', 'REVIEWER']
      });

      expect(delegation.appliesToRole('APPROVER')).toBe(true);
      expect(delegation.appliesToRole('REVIEWER')).toBe(true);
      expect(delegation.appliesToRole('MANAGER')).toBe(false);
    });

    it('should check full delegation', () => {
      const full = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: '*'
      });
      const partial = new Delegation({
        id: 'del-002',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: ['APPROVER']
      });

      expect(full.isFullDelegation()).toBe(true);
      expect(partial.isFullDelegation()).toBe(false);
    });
  });

  describe('Scope applicability', () => {
    it('should apply to all scopes without restriction', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456'
      });

      expect(delegation.appliesToScope(Scope.global())).toBe(true);
      expect(delegation.appliesToScope(Scope.project('PRJ-001'))).toBe(true);
    });

    it('should apply only to matching scope with restriction', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        scopeRestriction: Scope.project('PRJ-001')
      });

      expect(delegation.appliesToScope(Scope.project('PRJ-001'))).toBe(true);
      expect(delegation.appliesToScope(Scope.project('PRJ-002'))).toBe(false);
    });
  });

  describe('Combined applicability', () => {
    it('should check role, scope, and validity together', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: ['MANAGER'],
        validFrom: new Date('2020-01-01'),
        validTo: new Date('2030-12-31')
      });

      expect(delegation.appliesTo('MANAGER', Scope.global())).toBe(true);
      expect(delegation.appliesTo('APPROVER', Scope.global())).toBe(false);
    });
  });

  describe('Utility methods', () => {
    it('should check indefinite delegation', () => {
      const indefinite = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        validTo: null
      });
      const finite = new Delegation({
        id: 'del-002',
        principalId: 'user-123',
        delegateId: 'user-456',
        validTo: new Date('2025-12-31')
      });

      expect(indefinite.isIndefinite()).toBe(true);
      expect(finite.isIndefinite()).toBe(false);
    });

    it('should calculate remaining days', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });

      const remaining = delegation.getRemainingDays();
      expect(remaining).toBeGreaterThanOrEqual(6);
      expect(remaining).toBeLessThanOrEqual(8);
    });

    it('should return null for indefinite remaining days', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456'
      });

      expect(delegation.getRemainingDays()).toBeNull();
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const delegation = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: ['APPROVER'],
        reason: 'Vacation'
      });
      const json = delegation.toJSON();

      expect(json.id).toBe('del-001');
      expect(json.principalId).toBe('user-123');
      expect(json.delegateId).toBe('user-456');
      expect(json.roleIds).toEqual(['APPROVER']);
      expect(json.reason).toBe('Vacation');
    });

    it('should deserialize from JSON', () => {
      const json = {
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: '*',
        routingPolicy: 'BOTH_EQUAL'
      };

      const delegation = Delegation.fromJSON(json);

      expect(delegation.id).toBe('del-001');
      expect(delegation.roleIds).toBe('*');
      expect(delegation.routingPolicy).toBe(RoutingPolicy.BOTH_EQUAL);
    });

    it('should round-trip through JSON', () => {
      const original = new Delegation({
        id: 'del-001',
        principalId: 'user-123',
        delegateId: 'user-456',
        roleIds: ['MANAGER', 'APPROVER'],
        reason: 'Vacation',
        routingPolicy: RoutingPolicy.DELEGATE_PRIMARY_PRINCIPAL_CC
      });
      const json = original.toJSON();
      const restored = Delegation.fromJSON(json);

      expect(restored.equals(original)).toBe(true);
      expect(restored.reason).toBe(original.reason);
      expect(restored.roleIds).toEqual(original.roleIds);
    });
  });
});
