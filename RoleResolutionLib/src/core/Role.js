/**
 * @file RoleResolutionLib/src/core/Role.js
 * @description Role value object representing a role definition.
 * @version 1.0.0
 */

import { ScopeType, isValidScopeType } from './ScopeType.js';
import { ResolutionStrategy, isValidResolutionStrategy } from './ResolutionStrategy.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class Role
 * @description Immutable Value Object defining a responsibility, its scope requirements, and resolution logic.
 */
export class Role {
  /**
   * @constructor
   * @param {Object} definition - Role specification.
   * @param {string} definition.id - Unique role identifier.
   * @param {string} definition.name - Human-readable label.
   * @param {string} [definition.description=''] - Functional purpose details.
   * @param {string} [definition.scopeType=ScopeType.GLOBAL] - Level from ScopeType enum.
   * @param {string} [definition.resolutionStrategy=ResolutionStrategy.FIRST] - Algorithm from ResolutionStrategy enum.
   * @param {boolean} [definition.allowsDelegation=true] - Toggle for delegation chain support.
   * @param {string[]} [definition.fallbackRoles=[]] - Ordered list of role IDs to query if primary search fails.
   * @param {Object} [definition.metadata={}] - Custom domain attributes.
   * @throws {Error} If id/name is missing, scopeType/strategy is invalid, or fallbackRoles is non-array.
   */
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('Role definition is required');
    }

    const {
      id,
      name,
      description = '',
      scopeType = ScopeType.GLOBAL,
      resolutionStrategy = ResolutionStrategy.FIRST,
      allowsDelegation = true,
      fallbackRoles = [],
      metadata = {}
    } = definition;

    // Validate required fields
    if (!id || typeof id !== 'string') {
      throw new Error('Role id is required and must be a string');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('Role name is required and must be a string');
    }
    if (!isValidScopeType(scopeType)) {
      throw new Error(`Invalid scope type: ${scopeType}`);
    }
    if (!isValidResolutionStrategy(resolutionStrategy)) {
      throw new Error(`Invalid resolution strategy: ${resolutionStrategy}`);
    }
    if (!Array.isArray(fallbackRoles)) {
      throw new Error('fallbackRoles must be an array');
    }

    /** @type {string} @readonly */
    this.id = id;

    /** @type {string} @readonly */
    this.name = name;

    /** @type {string} @readonly */
    this.description = description;

    /** @type {string} @readonly */
    this.scopeType = scopeType;

    /** @type {string} @readonly */
    this.resolutionStrategy = resolutionStrategy;

    /** @type {boolean} @readonly */
    this.allowsDelegation = allowsDelegation;

    /** @type {string[]} @readonly */
    this.fallbackRoles = [...fallbackRoles];

    /** @type {Object} @readonly */
    this.metadata = cloneDeep(metadata);

    // Freeze the instance
    Object.freeze(this);
    Object.freeze(this.fallbackRoles);
    Object.freeze(this.metadata);
  }

  /**
   * @function isGlobal
   * @returns {boolean} True if scopeType is GLOBAL.
   */
  isGlobal() {
    return this.scopeType === ScopeType.GLOBAL;
  }

  /**
   * @function resolvesToAll
   * @returns {boolean} True if strategy is ALL.
   */
  resolvesToAll() {
    return this.resolutionStrategy === ResolutionStrategy.ALL;
  }

  /**
   * @function usesPriority
   * @returns {boolean} True if strategy is PRIORITY.
   */
  usesPriority() {
    return this.resolutionStrategy === ResolutionStrategy.PRIORITY;
  }

  /**
   * @function hasFallbacks
   * @returns {boolean} True if fallbackRoles array is non-empty.
   */
  hasFallbacks() {
    return this.fallbackRoles.length > 0;
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
   * @function equals
   * @description Comparison based on unique role ID.
   * @param {Role} other - Target for comparison.
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof Role)) {
      return false;
    }
    return this.id === other.id;
  }

  /**
   * @function toJSON
   * @description Deeply serializes role definition to POJO.
   * @returns {Object} JSON-compatible structure.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      scopeType: this.scopeType,
      resolutionStrategy: this.resolutionStrategy,
      allowsDelegation: this.allowsDelegation,
      fallbackRoles: [...this.fallbackRoles],
      metadata: { ...this.metadata }
    };
  }

  /**
   * @static
   * @description Factory to hydrate a Role from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {Role}
   * @throws {Error} If obj is invalid.
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid role object');
    }
    return new Role(obj);
  }

  /**
   * @function toString
   * @returns {string} Debug string: Role[ID] Name (Scope, Strategy).
   */
  toString() {
    return `Role[${this.id}] ${this.name} (${this.scopeType}, ${this.resolutionStrategy})`;
  }
}
