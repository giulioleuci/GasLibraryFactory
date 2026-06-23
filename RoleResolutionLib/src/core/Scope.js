/**
 * @file RoleResolutionLib/src/core/Scope.js
 * @description Scope value object representing a validity context for roles.
 * @version 1.0.0
 */

import { ScopeType, isValidScopeType } from './ScopeType.js';
import { cloneDeep, isEqual } from '@CoreUtilsLib';

/**
 * @class Scope
 * @description Immutable Value Object defining the context (GLOBAL, ORG_UNIT, PROJECT, etc.) for role assignments.
 */
export class Scope {
  /**
   * @constructor
   * @param {string} type - Enum value from ScopeType.
   * @param {string|Object|null} [value=null] - Unique identifier for the scope instance.
   * @param {string[]} [hierarchy=[]] - Ordered list of parent identifiers for containment logic.
   * @throws {Error} If type is invalid.
   */
  constructor(type, value = null, hierarchy = []) {
    if (!isValidScopeType(type)) {
      throw new Error(
        `Invalid scope type: ${type}. Must be one of: ${Object.values(ScopeType).join(', ')}`
      );
    }

    /** @type {string} @readonly */
    this.type = type;

    /** @type {string|Object|null} @readonly */
    this.value = value !== null ? cloneDeep(value) : null;

    /** @type {string[]} @readonly */
    this.hierarchy = Array.isArray(hierarchy) ? [...hierarchy] : [];

    // Freeze the instance to ensure immutability
    Object.freeze(this);
    Object.freeze(this.hierarchy);
  }

  /**
   * @static
   * @description Factory for GLOBAL scope.
   * @returns {Scope}
   */
  static global() {
    return new Scope(ScopeType.GLOBAL);
  }

  /**
   * @static
   * @description Factory for organizational unit scope.
   * @param {string} value - Org ID.
   * @param {string[]} [hierarchy=[]] - Parent path.
   * @returns {Scope}
   */
  static orgUnit(value, hierarchy = []) {
    return new Scope(ScopeType.ORG_UNIT, value, hierarchy);
  }

  /**
   * @static
   * @description Factory for project-level scope.
   * @param {string|Object} value - Project ID.
   * @returns {Scope}
   */
  static project(value) {
    return new Scope(ScopeType.PROJECT, value);
  }

  /**
   * @static
   * @description Factory for specific resource scope.
   * @param {string|Object} value - Resource ID.
   * @returns {Scope}
   */
  static resource(value) {
    return new Scope(ScopeType.RESOURCE, value);
  }

  /**
   * @static
   * @description Factory for non-standard scope types.
   * @param {string|Object} value - Custom identifier.
   * @param {string[]} [hierarchy=[]] - Optional path.
   * @returns {Scope}
   */
  static custom(value, hierarchy = []) {
    return new Scope(ScopeType.CUSTOM, value, hierarchy);
  }

  /**
   * @function isGlobal
   * @returns {boolean} True if type is GLOBAL.
   */
  isGlobal() {
    return this.type === ScopeType.GLOBAL;
  }

  /**
   * @function contains
   * @description Logical containment check. Returns true if this scope equals other OR is a parent in the hierarchy.
   * @param {Scope} other - Query scope.
   * @returns {boolean}
   */
  contains(other) {
    if (!(other instanceof Scope)) {
      return false;
    }

    // Global scope contains everything
    if (this.isGlobal()) {
      return true;
    }

    // Different types cannot contain each other (unless global)
    if (this.type !== other.type) {
      return false;
    }

    // Same type - check if this hierarchy is a prefix of other's
    if (this.hierarchy.length === 0 && other.hierarchy.length === 0) {
      // No hierarchy - check value equality
      return this._valuesEqual(other);
    }

    // Check hierarchy prefix
    if (this.hierarchy.length > other.hierarchy.length) {
      return false;
    }

    for (let i = 0; i < this.hierarchy.length; i++) {
      if (this.hierarchy[i] !== other.hierarchy[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * @function matches
   * @description Structural equality check (type, value, hierarchy).
   * @param {Scope} other - Target for comparison.
   * @returns {boolean}
   */
  matches(other) {
    if (!(other instanceof Scope)) {
      return false;
    }

    return this.type === other.type && this._valuesEqual(other) && this._hierarchiesEqual(other);
  }

  /**
   * @function getValueString
   * @description Stringifies the scope value.
   * @returns {string}
   */
  getValueString() {
    if (this.value === null) {
      return '';
    }
    if (typeof this.value === 'object') {
      return JSON.stringify(this.value);
    }
    return String(this.value);
  }

  /**
   * @function toJSON
   * @description Serializes to POJO.
   * @returns {Object} {type, value, hierarchy}
   */
  toJSON() {
    return {
      type: this.type,
      value: this.value,
      hierarchy: [...this.hierarchy]
    };
  }

  /**
   * @static
   * @description Hydrates a Scope from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {Scope}
   * @throws {Error} If obj is invalid.
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid scope object');
    }
    return new Scope(obj.type, obj.value, obj.hierarchy);
  }

  /**
   * @function toString
   * @returns {string} Debug string: Scope[TYPE:VALUE] (Path)
   */
  toString() {
    if (this.isGlobal()) {
      return 'Scope[GLOBAL]';
    }
    const valueStr = this.getValueString();
    const hierarchyStr = this.hierarchy.length > 0 ? ` (${this.hierarchy.join('/')})` : '';
    return `Scope[${this.type}:${valueStr}${hierarchyStr}]`;
  }

  /**
   * @function _valuesEqual
   * @private
   * @description Checks if the value of this scope equals another scope's value.
   * @param {Scope} other - The other scope.
   * @returns {boolean}
   */
  _valuesEqual(other) {
    return isEqual(this.value, other.value);
  }

  /**
   * @function _hierarchiesEqual
   * @private
   * @description Checks if the hierarchy of this scope equals another scope's hierarchy.
   * @param {Scope} other - The other scope.
   * @returns {boolean}
   */
  _hierarchiesEqual(other) {
    if (this.hierarchy.length !== other.hierarchy.length) {
      return false;
    }
    for (let i = 0; i < this.hierarchy.length; i++) {
      if (this.hierarchy[i] !== other.hierarchy[i]) {
        return false;
      }
    }
    return true;
  }
}
