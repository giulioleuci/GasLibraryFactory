/**
 * @file RoleResolutionLib/src/__tests__/registry/AssignmentSource.test.js
 * @description Unit tests for AssignmentSource and InMemoryAssignmentSource
 */

import { AssignmentSource, InMemoryAssignmentSource } from '../../registry/AssignmentSource.js';
import { Assignment } from '../../core/Assignment.js';
import { Scope } from '../../core/Scope.js';

describe('AssignmentSource Interface', () => {
  let source: AssignmentSource;

  beforeEach(() => {
    source = new AssignmentSource();
  });

  it('should throw an error for getAssignmentsForRole', () => {
    expect(() => source.getAssignmentsForRole('role1', Scope.global())).toThrow(
      'AssignmentSource.getAssignmentsForRole() must be implemented'
    );
  });

  it('should throw an error for getAssignmentsForActor', () => {
    expect(() => source.getAssignmentsForActor('actor1')).toThrow(
      'AssignmentSource.getAssignmentsForActor() must be implemented'
    );
  });

  it('should throw an error for getActorById', () => {
    expect(() => source.getActorById('actor1')).toThrow(
      'AssignmentSource.getActorById() must be implemented'
    );
  });
});

describe('InMemoryAssignmentSource', () => {
  let source: InMemoryAssignmentSource<import('../../types.js').RoleActor>;
  const now = new Date('2023-01-01T12:00:00Z');
  const pastDate = new Date('2022-01-01T12:00:00Z');
  const futureDate = new Date('2024-01-01T12:00:00Z');

  beforeEach(() => {
    source = new InMemoryAssignmentSource();
  });

  describe('constructor', () => {
    it('should initialize empty if no data provided', () => {
      expect(source.getAllAssignments()).toEqual([]);
      expect(source.getAllActors()).toEqual([]);
    });

    it('should initialize with provided assignments and actors', () => {
      const assignment = new Assignment({
        roleId: 'role-1',
        actorId: 'actor-1',
        scope: Scope.global()
      });
      const actor = { id: 'actor-1', displayName: 'Test Actor' };

      const s2 = new InMemoryAssignmentSource({
        assignments: [assignment],
        actors: [actor]
      });

      expect(s2.getAllAssignments()).toEqual([assignment]);
      expect(s2.getAllActors()).toEqual([actor]);
      expect(s2.getActorById('actor-1')).toEqual(actor);
    });
  });

  describe('addAssignment and clear', () => {
    it('should add an assignment and clear it', () => {
      const assignment = new Assignment({
        roleId: 'role-1',
        actorId: 'actor-1',
        scope: Scope.global()
      });
      source.addAssignment(assignment);
      expect(source.getAllAssignments()).toEqual([assignment]);

      source.clear();
      expect(source.getAllAssignments()).toEqual([]);
    });
  });

  describe('addActor and getActorById', () => {
    it('should add an actor and retrieve it by id', () => {
      const actor = { id: 'actor-1', displayName: 'Test Actor' };
      source.addActor(actor);
      expect(source.getAllActors()).toEqual([actor]);
      expect(source.getActorById('actor-1')).toEqual(actor);

      // Retrieval for non-existent actor should return null
      expect(source.getActorById('actor-2')).toBeNull();

      source.clear();
      expect(source.getAllActors()).toEqual([]);
      expect(source.getActorById('actor-1')).toBeNull();
    });
  });

  describe('Retrieval Methods', () => {
    let assignment1, assignment2, assignment3;

    beforeEach(() => {
      assignment1 = new Assignment({
        roleId: 'role-1',
        actorId: 'actor-1',
        scope: Scope.global(),
        validFrom: pastDate,
        validTo: futureDate
      });
      assignment2 = new Assignment({
        roleId: 'role-2',
        actorId: 'actor-1',
        scope: Scope.project('proj-1'),
        validFrom: pastDate,
        validTo: new Date('2022-12-31T12:00:00Z') // Expired
      });
      assignment3 = new Assignment({
        roleId: 'role-1',
        actorId: 'actor-2',
        scope: Scope.orgUnit('org-1'),
        validFrom: pastDate,
        validTo: futureDate
      });

      source.addAssignment(assignment1);
      source.addAssignment(assignment2);
      source.addAssignment(assignment3);
    });

    describe('getAssignmentsForActor', () => {
      it('should return active assignments for an actor using isValidAt', () => {
        const results = source.getAssignmentsForActor('actor-1', now);
        expect(results).toHaveLength(1);
        expect(results[0].roleId).toBe('role-1');
      });

      it('should return empty array if actor has no active assignments', () => {
        const results = source.getAssignmentsForActor('actor-1', new Date('2025-01-01'));
        expect(results).toHaveLength(0);
      });
    });

    describe('getAssignmentsForRole', () => {
      it('should return active assignments for a role within scope', () => {
        // Querying for role-1 globally should return assignment1, but not assignment3 (org-1)
        // Wait, assignment1 has GLOBAL scope, it contains anything.
        // Let's refine the test based on actual implementation.
        // The implementation does: assignment.scope.contains(scope) || assignment.scope.matches(scope)
        // If we query with GLOBAL, assignment1 (GLOBAL) contains GLOBAL -> true.
        // assignment3 (org-1) does not contain GLOBAL -> false.
        const results = source.getAssignmentsForRole('role-1', Scope.global(), now);
        expect(results).toHaveLength(1);
        expect(results[0].actorId).toBe('actor-1');
      });

      it('should match role if assignment scope contains query scope', () => {
        // assignment1 has GLOBAL scope. It contains ALL scopes.
        const results = source.getAssignmentsForRole('role-1', Scope.orgUnit('org-2'), now);
        // Should find assignment1 (GLOBAL)
        expect(results).toHaveLength(1);
        expect(results[0].actorId).toBe('actor-1');
      });

      it('should return empty array if role has no active assignments', () => {
        const results = source.getAssignmentsForRole('role-2', Scope.project('proj-1'), now);
        expect(results).toHaveLength(0); // assignment2 is expired
      });
    });
  });
});
