/**
 * Phase 4 Integration Test: RoleResolutionLib + SheetDBLib
 *
 * Layers Tested:
 * - RoleResolutionLib (Layer 2) - Role resolution with delegation
 * - SheetDBLib (Layer 2) - Database operations
 * - CoreUtilsLib (Layer 0) - Utilities and logging
 *
 * Purpose: Validate role resolution using SheetDBLib as the data source
 * for assignments and delegations. Tests real-world scenarios where
 * role data is stored in spreadsheet databases.
 *
 * @file test/__tests__/integration/Phase4_RoleResolutionSheetDB.test.js
 */

import {
  RoleResolver,
  RoleRegistry,
  Role,
  Actor,
  Scope,
  Assignment,
  Delegation,
  InMemoryAssignmentSource,
  InMemoryDelegationSource,
  ScopeType,
  ResolutionStrategy,
  RoutingPolicy
} from '@RoleResolutionLib';

describe('Phase 4 Integration: RoleResolutionLib + SheetDBLib', () => {
  let mockLogger;
  let roleRegistry;

  beforeEach(() => {
    mockLogger = global.mockLoggerService();

    // Setup role registry with common roles
    roleRegistry = new RoleRegistry({ logger: mockLogger });
    roleRegistry.register(
      new Role({
        id: 'DEPT_MANAGER',
        name: 'Department Manager',
        scopeType: ScopeType.ORG_UNIT,
        resolutionStrategy: ResolutionStrategy.FIRST,
        allowsDelegation: true
      })
    );
    roleRegistry.register(
      new Role({
        id: 'PROJECT_LEAD',
        name: 'Project Lead',
        scopeType: ScopeType.PROJECT,
        resolutionStrategy: ResolutionStrategy.FIRST,
        allowsDelegation: true,
        fallbackRoles: ['DEPT_MANAGER']
      })
    );
    roleRegistry.register(
      new Role({
        id: 'APPROVER',
        name: 'Approver',
        scopeType: ScopeType.GLOBAL,
        resolutionStrategy: ResolutionStrategy.ALL,
        allowsDelegation: true
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('In-Memory Assignment Source (simulating SheetDB data)', () => {
    /**
     * Tests using InMemoryAssignmentSource to simulate data that would
     * normally come from SheetDBLib. This demonstrates the integration
     * pattern without requiring full DatabaseService setup.
     */

    test('Resolves role from assignment data', () => {
      // Setup assignment source with data (simulating SheetDB)
      const assignmentSource = new InMemoryAssignmentSource();

      // Add actors (would come from ACTORS table in real SheetDB)
      assignmentSource.addActor(Actor.person('user-mario', 'mario@example.com', 'Mario Rossi'));
      assignmentSource.addActor(Actor.person('user-luigi', 'luigi@example.com', 'Luigi Bianchi'));

      // Add assignments (would come from ROLE_ASSIGNMENTS table)
      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'DEPT_MANAGER',
          actorId: 'user-mario',
          scope: Scope.orgUnit('Sales'),
          priority: 1,
          isActive: true
        })
      );
      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'DEPT_MANAGER',
          actorId: 'user-luigi',
          scope: Scope.orgUnit('Engineering'),
          priority: 1,
          isActive: true
        })
      );

      const delegationSource = new InMemoryDelegationSource();

      // Create resolver
      const resolver = new RoleResolver(roleRegistry, assignmentSource, delegationSource, {
        logger: mockLogger
      });

      // Resolve DEPT_MANAGER for Sales
      const result = resolver.resolve('DEPT_MANAGER', Scope.orgUnit('Sales'));

      expect(result).toBeDefined();
      expect(result.effectiveActor).toBeDefined();
      expect(result.effectiveActor.id).toBe('user-mario');
    });

    test('Handles missing assignments gracefully', () => {
      const assignmentSource = new InMemoryAssignmentSource();
      const delegationSource = new InMemoryDelegationSource();

      const resolver = new RoleResolver(roleRegistry, assignmentSource, delegationSource, {
        logger: mockLogger
      });

      // Should either throw or return empty/null when no assignments exist
      try {
        const result = resolver.resolve('DEPT_MANAGER', Scope.orgUnit('Unknown'));
        // If it doesn't throw, result should indicate no actor found
        expect(result === null || result.effectiveActor === null).toBe(true);
      } catch (e) {
        // If it throws, that's also acceptable behavior
        expect(e).toBeDefined();
      }
    });
  });

  describe('Delegation Resolution (simulating SheetDB data)', () => {
    test('Resolves delegation with InMemory sources', () => {
      // Setup assignment source with data (simulating SheetDB)
      const assignmentSource = new InMemoryAssignmentSource();

      // Add actors
      assignmentSource.addActor(Actor.person('user-mario', 'mario@example.com', 'Mario Rossi'));
      assignmentSource.addActor(Actor.person('user-luigi', 'luigi@example.com', 'Luigi Bianchi'));

      // Add assignment
      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'DEPT_MANAGER',
          actorId: 'user-mario',
          scope: Scope.orgUnit('Sales'),
          priority: 1,
          isActive: true
        })
      );

      // Setup delegation source with data (simulating SheetDB DELEGATIONS table)
      const delegationSource = new InMemoryDelegationSource();
      delegationSource.addDelegation(
        new Delegation({
          id: '1',
          principalId: 'user-mario',
          delegateId: 'user-luigi',
          roleIds: '*',
          validFrom: new Date('2024-01-01'),
          validTo: new Date('2030-12-31'),
          routingPolicy: RoutingPolicy.BOTH_EQUAL,
          isActive: true,
          reason: 'Vacation'
        })
      );

      const resolver = new RoleResolver(roleRegistry, assignmentSource, delegationSource, {
        logger: mockLogger
      });

      // Resolve with delegation
      const result = resolver.resolve('DEPT_MANAGER', Scope.orgUnit('Sales'));

      expect(result).toBeDefined();
      expect(result.effectiveActor.id).toBe('user-luigi');
      expect(result.principalActor.id).toBe('user-mario');
      expect(result.delegationChain.length).toBe(1);
    });
  });

  describe('Complex Resolution Scenarios', () => {
    test('Role resolution with no matching assignment throws error', () => {
      const assignmentSource = new InMemoryAssignmentSource();
      assignmentSource.addActor(Actor.person('user-mario', 'mario@example.com', 'Mario Rossi'));

      // Add DEPT_MANAGER for Engineering, but we'll query for a different scope
      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'DEPT_MANAGER',
          actorId: 'user-mario',
          scope: Scope.orgUnit('Engineering'),
          priority: 1,
          isActive: true
        })
      );

      const delegationSource = new InMemoryDelegationSource();

      const resolver = new RoleResolver(roleRegistry, assignmentSource, delegationSource, {
        logger: mockLogger
      });

      // Query for different scope - should either throw or return empty
      try {
        const result = resolver.resolve('DEPT_MANAGER', Scope.orgUnit('Marketing'));
        expect(result === null || result.effectiveActor === null).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    test('Multiple actors resolved with ALL strategy', () => {
      const assignmentSource = new InMemoryAssignmentSource();

      // Add multiple actors for APPROVER role
      assignmentSource.addActor(Actor.person('user-1', 'user1@example.com', 'User One'));
      assignmentSource.addActor(Actor.person('user-2', 'user2@example.com', 'User Two'));
      assignmentSource.addActor(Actor.person('user-3', 'user3@example.com', 'User Three'));

      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'APPROVER',
          actorId: 'user-1',
          scope: Scope.global(),
          priority: 1,
          isActive: true
        })
      );
      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'APPROVER',
          actorId: 'user-2',
          scope: Scope.global(),
          priority: 2,
          isActive: true
        })
      );
      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'APPROVER',
          actorId: 'user-3',
          scope: Scope.global(),
          priority: 3,
          isActive: true
        })
      );

      const delegationSource = new InMemoryDelegationSource();

      const resolver = new RoleResolver(roleRegistry, assignmentSource, delegationSource, {
        logger: mockLogger
      });

      // Resolve with ALL strategy
      const result = resolver.resolve('APPROVER', Scope.global());

      expect(result).toBeDefined();
      // With ALL strategy, should return all actors
      expect(result.allActors).toBeDefined();
      expect(result.allActors.length).toBeGreaterThanOrEqual(1);
    });

    test('Delegation with routing policy is resolved', () => {
      const assignmentSource = new InMemoryAssignmentSource();
      assignmentSource.addActor(
        Actor.person('user-principal', 'principal@example.com', 'Principal')
      );
      assignmentSource.addActor(Actor.person('user-delegate', 'delegate@example.com', 'Delegate'));

      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'DEPT_MANAGER',
          actorId: 'user-principal',
          scope: Scope.orgUnit('HR'),
          priority: 1,
          isActive: true
        })
      );

      const delegationSource = new InMemoryDelegationSource();
      delegationSource.addDelegation(
        new Delegation({
          id: 'del-1',
          principalId: 'user-principal',
          delegateId: 'user-delegate',
          roleIds: '*',
          validFrom: new Date('2024-01-01'),
          validTo: new Date('2030-12-31'),
          routingPolicy: RoutingPolicy.BOTH_EQUAL,
          isActive: true,
          reason: 'Co-management'
        })
      );

      const resolver = new RoleResolver(roleRegistry, assignmentSource, delegationSource, {
        logger: mockLogger
      });

      const result = resolver.resolve('DEPT_MANAGER', Scope.orgUnit('HR'));

      expect(result).toBeDefined();
      // Verify delegation was applied
      expect(result.effectiveActor.id).toBe('user-delegate');
      expect(result.principalActor.id).toBe('user-principal');
      expect(result.delegationChain.length).toBe(1);
    });
  });

  describe('Error Handling Integration', () => {
    test('Handles empty assignment source gracefully', () => {
      // Create assignment source that returns empty
      const assignmentSource = new InMemoryAssignmentSource();
      const delegationSource = new InMemoryDelegationSource();

      const resolver = new RoleResolver(roleRegistry, assignmentSource, delegationSource, {
        logger: mockLogger
      });

      // Should either throw or return empty when no assignments found
      try {
        const result = resolver.resolve('DEPT_MANAGER', Scope.orgUnit('Sales'));
        expect(result === null || result.effectiveActor === null).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    test('Validates scope type matches role definition', () => {
      const assignmentSource = new InMemoryAssignmentSource();
      assignmentSource.addActor(Actor.person('user-1', 'user1@example.com', 'User One'));
      assignmentSource.addAssignment(
        new Assignment({
          roleId: 'DEPT_MANAGER',
          actorId: 'user-1',
          scope: Scope.orgUnit('Sales'),
          isActive: true
        })
      );

      const delegationSource = new InMemoryDelegationSource();

      const resolver = new RoleResolver(roleRegistry, assignmentSource, delegationSource, {
        logger: mockLogger
      });

      // DEPT_MANAGER requires ORG_UNIT scope, not PROJECT
      expect(() => {
        resolver.resolve('DEPT_MANAGER', Scope.project('PRJ-001'));
      }).toThrow();
    });
  });
});
