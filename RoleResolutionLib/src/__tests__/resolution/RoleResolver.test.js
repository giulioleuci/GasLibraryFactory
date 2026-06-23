/**
 * @file RoleResolutionLib/src/__tests__/resolution/RoleResolver.test.js
 * @description Unit tests for RoleResolver
 */

import { RoleResolver } from '../../internal/resolution/RoleResolver.js';
import { RoleRegistry } from '../../registry/RoleRegistry.js';
import { InMemoryAssignmentSource } from '../../registry/AssignmentSource.js';
import { InMemoryDelegationSource } from '../../registry/DelegationSource.js';
import { Role } from '../../core/Role.js';
import { Actor } from '../../core/Actor.js';
import { Scope } from '../../core/Scope.js';
import { Assignment } from '../../core/Assignment.js';
import { Delegation } from '../../internal/delegation/Delegation.js';
import { ScopeType } from '../../core/ScopeType.js';
import { ResolutionStrategy } from '../../core/ResolutionStrategy.js';
import { RoutingPolicy } from '../../internal/routing/RoutingPolicy.js';
import { RoleNotFoundError, NoActorFoundError } from '../../internal/errors/RoleResolutionError.js';
import { MockFactory } from '../../../../test/fakes';

describe('RoleResolver', () => {
  let registry;
  let assignmentSource;
  let delegationSource;
  let resolver;
  let mockLogger;

  // Test actors
  const john = Actor.person('user-john', 'john@example.com', 'John Doe');
  const jane = Actor.person('user-jane', 'jane@example.com', 'Jane Smith');
  const bob = Actor.person('user-bob', 'bob@example.com', 'Bob Wilson');

  // Test roles
  const managerRole = new Role({
    id: 'MANAGER',
    name: 'Manager',
    scopeType: ScopeType.ORG_UNIT,
    resolutionStrategy: ResolutionStrategy.FIRST,
    allowsDelegation: true
  });

  // Fallback role for approver with GLOBAL scope (works with any scope)
  const projectManagerRole = new Role({
    id: 'PROJECT_MANAGER',
    name: 'Project Manager',
    scopeType: ScopeType.PROJECT,
    resolutionStrategy: ResolutionStrategy.FIRST,
    allowsDelegation: true
  });

  const approverRole = new Role({
    id: 'APPROVER',
    name: 'Approver',
    scopeType: ScopeType.PROJECT,
    resolutionStrategy: ResolutionStrategy.FIRST,
    fallbackRoles: ['PROJECT_MANAGER']
  });

  // Test scope
  const salesScope = Scope.orgUnit('Sales');
  const projectScope = Scope.project('PRJ-001');

  beforeEach(() => {
    mockLogger = MockFactory.createJestLogger();
    registry = new RoleRegistry();
    registry.register(managerRole);
    registry.register(projectManagerRole);
    registry.register(approverRole);

    assignmentSource = new InMemoryAssignmentSource({
      actors: [john, jane, bob]
    });

    delegationSource = new InMemoryDelegationSource();

    resolver = new RoleResolver(registry, assignmentSource, delegationSource, {
      logger: mockLogger
    });
  });

  describe('Constructor', () => {
    it('should create a valid resolver', () => {
      expect(resolver).toBeInstanceOf(RoleResolver);
    });

    it('should throw error for missing registry', () => {
      expect(() => new RoleResolver(null, assignmentSource, delegationSource)).toThrow(
        'RoleRegistry is required'
      );
    });

    it('should throw error for missing assignment source', () => {
      expect(() => new RoleResolver(registry, null, delegationSource)).toThrow(
        'AssignmentSource is required'
      );
    });

    it('should throw error for missing delegation source', () => {
      expect(() => new RoleResolver(registry, assignmentSource, null)).toThrow(
        'DelegationSource is required'
      );
    });
  });

  describe('resolve()', () => {
    it('should resolve direct assignments', () => {
      assignmentSource.addAssignment(
        new Assignment({
          id: 'as-1',
          roleId: 'MANAGER',
          actorId: john.id,
          scope: salesScope
        })
      );

      const result = resolver.resolve('MANAGER', salesScope);
      expect(result.isResolved()).toBe(true);
      expect(result.effectiveActor.id).toBe(john.id);
    });

    it('should resolve multiple assignments', () => {
      const multiRole = new Role({
        id: 'MULTI',
        name: 'Multi',
        scopeType: ScopeType.ORG_UNIT,
        resolutionStrategy: ResolutionStrategy.ALL
      });
      registry.register(multiRole);
      
      assignmentSource.addAssignment(new Assignment({ id: 'as-1', roleId: 'MULTI', actorId: john.id, scope: salesScope }));
      assignmentSource.addAssignment(new Assignment({ id: 'as-2', roleId: 'MULTI', actorId: jane.id, scope: salesScope }));

      const result = resolver.resolve('MULTI', salesScope);
      expect(result.allActors).toHaveLength(2);
    });

    it('should return empty result if no assignments found and no fallback', () => {
      const result = resolver.resolve('MANAGER', salesScope);
      expect(result.isResolved()).toBe(false);
      expect(result.allActors).toEqual([]);
    });

    it('should resolve using fallback roles', () => {
      // No direct APPROVER, but we have PROJECT_MANAGER as fallback
      assignmentSource.addAssignment(
        new Assignment({
          id: 'as-1',
          roleId: 'PROJECT_MANAGER',
          actorId: bob.id,
          scope: projectScope
        })
      );

      const result = resolver.resolve('APPROVER', projectScope);

      expect(result.isResolved()).toBe(true);
      expect(result.fallbackUsed).toBe(true);
      expect(result.effectiveActor.id).toBe(bob.id);
    });

    it('should prioritize direct assignments over fallback', () => {
      assignmentSource.addAssignment(
        new Assignment({ id: 'as-1', roleId: 'APPROVER', actorId: john.id, scope: projectScope })
      );
      assignmentSource.addAssignment(
        new Assignment({ id: 'as-2', roleId: 'PROJECT_MANAGER', actorId: bob.id, scope: projectScope })
      );

      const result = resolver.resolve('APPROVER', projectScope);

      expect(result.fallbackUsed).toBe(false);
      expect(result.effectiveActor.id).toBe(john.id);
    });

    it('should handle delegations', () => {
      assignmentSource.addAssignment(
        new Assignment({ id: 'as-1', roleId: 'MANAGER', actorId: john.id, scope: salesScope })
      );

      delegationSource.addDelegation(
        new Delegation({
          id: 'del-1',
          principalId: john.id,
          delegateId: jane.id,
          roleIds: ['MANAGER'],
          scope: salesScope,
          routingPolicy: RoutingPolicy.BOTH_EQUAL
        })
      );

      const result = resolver.resolve('MANAGER', salesScope);

      // effectiveActor should be jane
      expect(result.effectiveActor.id).toBe(jane.id);
      expect(result.principalActor.id).toBe(john.id);
      
      // Routing should contain both due to BOTH_EQUAL policy from delegation
      expect(result.routing.primary.map(a => a.id)).toContain(john.id);
      expect(result.routing.primary.map(a => a.id)).toContain(jane.id);
    });

    it('should filter out inactive delegations', () => {
      assignmentSource.addAssignment(
        new Assignment({ id: 'as-1', roleId: 'MANAGER', actorId: john.id, scope: salesScope })
      );

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      delegationSource.addDelegation(
        new Delegation({
          id: 'del-1',
          principalId: john.id,
          delegateId: jane.id,
          roleIds: ['MANAGER'],
          scope: salesScope,
          validTo: pastDate // Expired
        })
      );

      const result = resolver.resolve('MANAGER', salesScope);

      // Should still be john
      expect(result.effectiveActor.id).toBe(john.id);
    });
  });

  describe('throwOnNotFound option', () => {
    it('should throw NoActorFoundError if enabled', () => {
      const strictResolver = new RoleResolver(registry, assignmentSource, delegationSource, {
        throwOnNotFound: true
      });
      
      expect(() => strictResolver.resolve('MANAGER', salesScope)).toThrow(NoActorFoundError);
    });

    it('should throw RoleNotFoundError for unknown role regardless of option', () => {
      expect(() => resolver.resolve('UNKNOWN_ROLE', salesScope)).toThrow(RoleNotFoundError);
    });
  });
});
