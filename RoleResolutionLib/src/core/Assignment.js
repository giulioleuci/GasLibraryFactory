/**
 * @file RoleResolutionLib/src/core/Assignment.js
 * @description Assignment value object representing a role-actor-scope association.
 * @version 1.0.0
 */

import { Scope } from './Scope.js';
import { cloneDeep } from '@CoreUtilsLib';
import { parseDate } from '../internal/DateParsing.js';

/**
 * @class Assignment
 * @description Immutable Value Object binding an Actor to a Role within a Scope (with temporal validity).
 */
export class Assignment {
  /**
   * @constructor
   * @param {Object} definition - Initialization object.
   * @param {string} definition.roleId - Unique role identifier.
   * @param {string} definition.actorId - Unique actor identifier.
   * @param {Scope|Object} definition.scope - Visibility/control boundary.
   * @param {number} [definition.priority=0] - Resolution weight (descending).
   * @param {Date|string|null} [definition.validFrom=null] - Start of eligibility.
   * @param {Date|string|null} [definition.validTo=null] - End of eligibility.
   * @param {boolean} [definition.isActive=true] - Soft-enable flag.
   * @param {Object} [definition.metadata={}] - Custom domain attributes.
   * @throws {Error} If roleId, actorId, or scope is missing.
   */
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('Assignment definition is required');
    }

    const {
      roleId,
      actorId,
      scope,
      priority = 0,
      validFrom = null,
      validTo = null,
      isActive = true,
      metadata = {}
    } = definition;

    // Validate required fields
    if (!roleId || typeof roleId !== 'string') {
      throw new Error('Assignment roleId is required and must be a string');
    }
    if (!actorId || typeof actorId !== 'string') {
      throw new Error('Assignment actorId is required and must be a string');
    }
    if (!scope) {
      throw new Error('Assignment scope is required');
    }

    /** @type {string} @readonly */
    this.roleId = roleId;

    /** @type {string} @readonly */
    this.actorId = actorId;

    /** @type {Scope} @readonly */
    this.scope = scope instanceof Scope ? scope : Scope.fromJSON(scope);

    /** @type {number} @readonly */
    this.priority = typeof priority === 'number' ? priority : 0;

    /** @type {Date|null} @readonly */
    this.validFrom = this._parseDate(validFrom);

    /** @type {Date|null} @readonly */
    this.validTo = this._parseDate(validTo);

    /** @type {boolean} @readonly */
    this.isActive = isActive === true;

    /** @type {Object} @readonly */
    this.metadata = cloneDeep(metadata);

    // Freeze the instance
    Object.freeze(this);
    Object.freeze(this.metadata);
  }

  /**
   * @function _parseDate
   * @description Normalizes Date objects or ISO strings. Delegates to the
   * shared internal DateParsing helper (dedupe of the duplicate previously
   * kept in sync manually with DelegationState).
   * @param {Date|string|null} value - Raw input.
   * @returns {Date|null} Valid Date or null if unparseable.
   * @private
   */
  _parseDate(value) {
    return parseDate(value);
  }

  /**
   * @function isValidAt
   * @description Checks isActive status and temporal boundaries.
   * @param {Date} [asOfDate=new Date()] - Reference point.
   * @returns {boolean} True if within [validFrom, validTo].
   */
  isValidAt(asOfDate = new Date()) {
    // Check active flag
    if (!this.isActive) {
      return false;
    }

    // Check validFrom
    if (this.validFrom !== null && asOfDate < this.validFrom) {
      return false;
    }

    // Check validTo
    if (this.validTo !== null && asOfDate > this.validTo) {
      return false;
    }

    return true;
  }

  /**
   * @function matches
   * @description Validates roleId, temporal eligibility, and scope containment.
   * @param {string} roleId - Query role.
   * @param {Scope} scope - Query scope.
   * @param {Date} [asOfDate=new Date()] - Query time.
   * @returns {boolean} True if assignment satisfies query parameters.
   */
  matches(roleId, scope, asOfDate = new Date()) {
    // Check role
    if (this.roleId !== roleId) {
      return false;
    }

    // Check validity
    if (!this.isValidAt(asOfDate)) {
      return false;
    }

    // Check scope - assignment scope must contain the query scope
    // or be exactly equal to it
    return this.scope.contains(scope) || this.scope.matches(scope);
  }

  /**
   * @function equals
   * @description Structural equality check (role, actor, scope).
   * @param {Assignment} other - Target for comparison.
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof Assignment)) {
      return false;
    }
    return (
      this.roleId === other.roleId &&
      this.actorId === other.actorId &&
      this.scope.matches(other.scope)
    );
  }

  /**
   * @function getMetadata
   * @description Safe access to metadata object.
   * @param {string} key - Property name.
   * @param {*} [defaultValue=null] - Fallback value.
   * @returns {*} Value or defaultValue.
   */
  getMetadata(key, defaultValue = null) {
    return this.metadata.hasOwnProperty(key) ? this.metadata[key] : defaultValue;
  }

  /**
   * @function toJSON
   * @description Serializes to plain object for persistence.
   * @returns {Object} JSON-compatible representation.
   */
  toJSON() {
    return {
      roleId: this.roleId,
      actorId: this.actorId,
      scope: this.scope.toJSON(),
      priority: this.priority,
      validFrom: this.validFrom ? this.validFrom.toISOString() : null,
      validTo: this.validTo ? this.validTo.toISOString() : null,
      isActive: this.isActive,
      metadata: { ...this.metadata }
    };
  }

  /**
   * @static
   * @description Factory to hydrate an Assignment from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {Assignment}
   * @throws {Error} If obj is invalid.
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid assignment object');
    }
    return new Assignment(obj);
  }

  /**
   * @function toString
   * @returns {string} Debug string: Assignment[ROLE -> ACTOR] Scope [Validity]
   */
  toString() {
    const validityStr = this.isActive
      ? this.validFrom || this.validTo
        ? ` [${this.validFrom?.toISOString() || '...'} to ${this.validTo?.toISOString() || '...'}]`
        : ''
      : ' [INACTIVE]';
    return `Assignment[${this.roleId} -> ${this.actorId}] ${this.scope.toString()}${validityStr}`;
  }
}
