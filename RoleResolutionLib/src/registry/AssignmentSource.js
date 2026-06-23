/**
 * @file RoleResolutionLib/src/registry/AssignmentSource.js
 * @description Interface definition for assignment data sources.
 * @version 1.0.0
 */

/**
 * @interface AssignmentSource
 * @description Contract for persistence layers providing role assignments and actor metadata.
 */
export class AssignmentSource {
  /**
   * @function getAssignmentsForRole
   * @description Fetches active assignments for a role within a scope at a given time.
   * @param {string} roleId - Role to query.
   * @param {Scope} scope - Context boundary.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Assignment[]}
   * @abstract
   */
  getAssignmentsForRole(roleId, scope, asOfDate = new Date()) {
    throw new Error('AssignmentSource.getAssignmentsForRole() must be implemented');
  }

  /**
   * @function getAssignmentsForActor
   * @description Retrieves all roles currently held by a specific actor.
   * @param {string} actorId - Target actor ID.
   * @param {Date} [asOfDate=new Date()] - Temporal validity point.
   * @returns {Assignment[]}
   * @abstract
   */
  getAssignmentsForActor(actorId, asOfDate = new Date()) {
    throw new Error('AssignmentSource.getAssignmentsForActor() must be implemented');
  }

  /**
   * @function getActorById
   * @description Resolves actor metadata (type, identifier, displayName) by unique ID.
   * @param {string} actorId - ID to resolve.
   * @returns {Actor|null}
   * @abstract
   */
  getActorById(actorId) {
    throw new Error('AssignmentSource.getActorById() must be implemented');
  }
}

/**
 * @class InMemoryAssignmentSource
 * @extends AssignmentSource
 * @description Non-persistent implementation using arrays/maps for assignment storage.
 */
export class InMemoryAssignmentSource extends AssignmentSource {
  /**
   * @constructor
   * @param {Object} [data={}] - Initial state.
   * @param {Assignment[]} [data.assignments=[]] - Seed assignments.
   * @param {Actor[]} [data.actors=[]] - Seed actors.
   */
  constructor(data = {}) {
    super();

    /** @type {Assignment[]} @private */
    this._assignments = data.assignments || [];

    /** @type {Map<string, Actor>} @private */
    this._actors = new Map();

    // Index actors
    if (Array.isArray(data.actors)) {
      data.actors.forEach((actor) => {
        this._actors.set(actor.id, actor);
      });
    }
  }

  /**
   * @function addAssignment
   * @param {Assignment} assignment - Record to append.
   */
  addAssignment(assignment) {
    this._assignments.push(assignment);
  }

  /**
   * @function addActor
   * @param {Actor} actor - Entity to register.
   */
  addActor(actor) {
    this._actors.set(actor.id, actor);
  }

  /**
   * @function getAssignmentsForRole
   * @description Performs filter-based lookup on internal array.
   * @param {string} roleId - Role to match.
   * @param {Scope} scope - Scope to match or contain.
   * @param {Date} [asOfDate=new Date()] - Validity check.
   * @returns {Assignment[]}
   */
  getAssignmentsForRole(roleId, scope, asOfDate = new Date()) {
    return this._assignments.filter((assignment) => {
      // Check role match
      if (assignment.roleId !== roleId) {
        return false;
      }

      // Check validity if assignment has isValidAt method
      if (typeof assignment.isValidAt === 'function') {
        if (!assignment.isValidAt(asOfDate)) {
          return false;
        }
      } else {
        // Manual validity check
        if (assignment.isActive === false) {
          return false;
        }
        if (assignment.validFrom && asOfDate < new Date(assignment.validFrom)) {
          return false;
        }
        if (assignment.validTo && asOfDate > new Date(assignment.validTo)) {
          return false;
        }
      }

      // Check scope match if assignment has scope matching method
      if (typeof assignment.scope?.contains === 'function') {
        return assignment.scope.contains(scope) || assignment.scope.matches(scope);
      }

      // Simple scope match - check type and value
      if (assignment.scope) {
        const assignmentScope = assignment.scope;
        const queryScope = scope;

        // Global scope matches everything
        if (assignmentScope.type === 'GLOBAL') {
          return true;
        }

        // Same type and value match
        if (assignmentScope.type === queryScope.type) {
          return assignmentScope.value === queryScope.value;
        }
      }

      return true;
    });
  }

  /**
   * @function getAssignmentsForActor
   * @description Performs ID-based filtering on internal assignments.
   * @param {string} actorId - Actor to match.
   * @param {Date} [asOfDate=new Date()] - Validity check.
   * @returns {Assignment[]}
   */
  getAssignmentsForActor(actorId, asOfDate = new Date()) {
    return this._assignments.filter((assignment) => {
      if (assignment.actorId !== actorId) {
        return false;
      }

      // Check validity
      if (typeof assignment.isValidAt === 'function') {
        return assignment.isValidAt(asOfDate);
      }

      // Manual validity check
      if (assignment.isActive === false) {
        return false;
      }
      if (assignment.validFrom && asOfDate < new Date(assignment.validFrom)) {
        return false;
      }
      if (assignment.validTo && asOfDate > new Date(assignment.validTo)) {
        return false;
      }

      return true;
    });
  }

  /**
   * @function getActorById
   * @param {string} actorId - Entity ID.
   * @returns {Actor|null}
   */
  getActorById(actorId) {
    return this._actors.get(actorId) || null;
  }

  /**
   * @function getAllAssignments
   * @returns {Assignment[]} Complete set.
   */
  getAllAssignments() {
    return [...this._assignments];
  }

  /**
   * @function getAllActors
   * @returns {Actor[]} Complete set.
   */
  getAllActors() {
    return Array.from(this._actors.values());
  }

  /**
   * @function clear
   * @description Purges all internal state.
   */
  clear() {
    this._assignments = [];
    this._actors.clear();
  }
}
