/**
 * @file RoleResolutionLib/src/registry/RoleRegistry.js
 * @description Registry for role definitions.
 * @version 1.0.0
 */

import { Role } from '../core/Role.js';
import { RoleNotFoundError, RoleValidationError } from '../internal/errors/RoleResolutionError.js';
import { cloneDeep, Registry } from '@CoreUtilsLib';

/**
 * @class RoleRegistry
 * @description Centralized CRUD store for Role definitions. Handles validation and indexing.
 */
export class RoleRegistry {
  /**
   * @constructor
   * @param {Object} [options={}] - Configuration.
   * @param {Object} [options.logger=console] - Telemetry target.
   * @param {Role[]} [options.initialRoles=[]] - Bulk seed roles.
   */
  constructor(options = {}) {
    /** @type {Object} @private */
    this._logger = options.logger || console;

    /** @type {Map<string, Role>} @private */
    this._roles = new Registry({ entityName: 'role' });

    // Register initial roles
    if (Array.isArray(options.initialRoles)) {
      options.initialRoles.forEach((role) => this.register(role));
    }
  }

  /**
   * @function register
   * @description Validates and persists a role. Overwrites existing IDs with a warning.
   * @param {Role|Object} roleOrDefinition - Role instance or raw definition POJO.
   * @returns {Role} The indexed Role instance.
   * @throws {RoleValidationError} If definition violates Role schema.
   */
  register(roleOrDefinition) {
    let role;

    if (roleOrDefinition instanceof Role) {
      role = roleOrDefinition;
    } else {
      try {
        role = new Role(roleOrDefinition);
      } catch (error) {
        throw new RoleValidationError(`Failed to create role: ${error.message}`, [error.message]);
      }
    }

    if (this._roles.has(role.id)) {
      this._logger.warn(`Overwriting existing role: ${role.id}`);
    }

    this._roles.set(role.id, role);
    this._logger.debug?.(`Registered role: ${role.id}`);

    return role;
  }

  /**
   * @function registerAll
   * @param {(Role|Object)[]} roles - Set of definitions.
   * @returns {Role[]} Indexed instances.
   * @throws {Error} If roles is not an array.
   */
  registerAll(roles) {
    if (!Array.isArray(roles)) {
      throw new Error('roles must be an array');
    }
    return roles.map((r) => this.register(r));
  }

  /**
   * @function get
   * @param {string} roleId - Unique ID.
   * @returns {Role}
   * @throws {RoleNotFoundError} If ID is missing.
   */
  get(roleId) {
    const role = this._roles.get(roleId);
    if (!role) {
      throw new RoleNotFoundError(roleId);
    }
    return role;
  }

  /**
   * @function getOrNull
   * @param {string} roleId - Unique ID.
   * @returns {Role|null}
   */
  getOrNull(roleId) {
    return this._roles.get(roleId) || null;
  }

  /**
   * @function has
   * @param {string} roleId - Unique ID.
   * @returns {boolean}
   */
  has(roleId) {
    return this._roles.has(roleId);
  }

  /**
   * @function unregister
   * @param {string} roleId - ID to purge.
   * @returns {boolean} True if found and deleted.
   */
  unregister(roleId) {
    const removed = this._roles.unregister(roleId);
    if (removed) {
      this._logger.debug?.(`Unregistered role: ${roleId}`);
    }
    return removed;
  }

  /**
   * @function getAll
   * @returns {Role[]} Complete set.
   */
  getAll() {
    return Array.from(this._roles.values());
  }

  /**
   * @function getAllIds
   * @returns {string[]} Keys only.
   */
  getAllIds() {
    return Array.from(this._roles.keys());
  }

  /**
   * @function size
   * @returns {number}
   */
  size() {
    return this._roles.size;
  }

  /**
   * @function clear
   * @description Purges all registrations.
   */
  clear() {
    this._roles.clear();
    this._logger.debug?.('Cleared role registry');
  }

  /**
   * @function find
   * @param {Function} predicate - Boolean filter.
   * @returns {Role[]}
   */
  find(predicate) {
    return this.getAll().filter(predicate);
  }

  /**
   * @function findByScopeType
   * @param {string} scopeType - Enum filter.
   * @returns {Role[]}
   */
  findByScopeType(scopeType) {
    return this.find((role) => role.scopeType === scopeType);
  }

  /**
   * @function findDelegatable
   * @returns {Role[]} Roles with allowsDelegation: true.
   */
  findDelegatable() {
    return this.find((role) => role.allowsDelegation);
  }

  /**
   * @function toJSON
   * @description Serializes indexed roles to mapped POJO.
   * @returns {Object} {roles: Object.<string, Object>}
   */
  toJSON() {
    const roles = {};
    this._roles.entries().forEach(([id, role]) => {
      roles[id] = role.toJSON();
    });
    return { roles };
  }

  /**
   * @static
   * @description Factory to hydrate a RoleRegistry from POJO.
   * @param {Object} obj - Serialized data.
   * @param {Object} [options={}] - New registry options.
   * @returns {RoleRegistry}
   * @throws {Error} If obj is invalid.
   */
  static fromJSON(obj, options = {}) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid registry object');
    }

    const registry = new RoleRegistry(options);

    if (obj.roles) {
      Object.values(obj.roles).forEach((roleData) => {
        registry.register(roleData);
      });
    }

    return registry;
  }
}
