import type { ActorTypeValue } from './ActorType.js';
import type { RoleMetadata } from '../types.js';
/**
 * @file RoleResolutionLib/src/core/Actor.js
 * @description Actor value object representing an entity that can hold roles.
 * @version 1.0.0
 */

import { ActorType, isValidActorType } from './ActorType.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class Actor
 * @description Immutable Value Object representing a role-bearing entity (PERSON, SYSTEM, or GROUP).
 */
export class Actor {
  declare readonly id: string;
  declare readonly type: ActorTypeValue;
  declare readonly identifier: string;
  declare readonly displayName: string;
  declare readonly metadata: RoleMetadata;

  /**
   * @constructor
   * @param {string} id - UUID or unique database identifier.
   * @param {string} type - Enum value from ActorType.
   * @param {string} identifier - Primary handle (e.g., email, service account ID).
   * @param {string} displayName - Human-readable name.
   * @param {Object} [metadata={}] - Domain-specific attributes.
   * @throws {Error} If id/identifier/displayName is missing or type is invalid.
   */
  constructor(
    id: unknown,
    type: unknown,
    identifier: unknown,
    displayName: unknown,
    metadata: RoleMetadata = {}
  ) {
    if (!id || typeof id !== 'string') {
      throw new Error('Actor id is required and must be a string');
    }
    if (!isValidActorType(type)) {
      throw new Error(
        `Invalid actor type: ${type}. Must be one of: ${Object.values(ActorType).join(', ')}`
      );
    }
    if (!identifier || typeof identifier !== 'string') {
      throw new Error('Actor identifier is required and must be a string');
    }
    if (!displayName || typeof displayName !== 'string') {
      throw new Error('Actor displayName is required and must be a string');
    }

    /** @type {string} @readonly */
    this.id = id;

    /** @type {string} @readonly */
    this.type = type;

    /** @type {string} @readonly */
    this.identifier = identifier;

    /** @type {string} @readonly */
    this.displayName = displayName;

    /** @type {Object} @readonly */
    this.metadata = cloneDeep(metadata);

    // Freeze the instance to ensure immutability
    Object.freeze(this);
    Object.freeze(this.metadata);
  }

  /**
   * @static
   * @description Factory for PERSON type actors.
   * @param {string} id - Unique ID.
   * @param {string} email - Actor email.
   * @param {string} displayName - Full name.
   * @param {Object} [metadata={}] - Attributes.
   * @returns {Actor}
   */
  static person(id: string, email: string, displayName: string, metadata: RoleMetadata = {}) {
    return new Actor(id, ActorType.PERSON, email, displayName, metadata);
  }

  /**
   * @static
   * @description Factory for SYSTEM type actors.
   * @param {string} id - Unique ID.
   * @param {string} serviceId - Service/Bot handle.
   * @param {string} displayName - Display name.
   * @param {Object} [metadata={}] - Attributes.
   * @returns {Actor}
   */
  static system(id: string, serviceId: string, displayName: string, metadata: RoleMetadata = {}) {
    return new Actor(id, ActorType.SYSTEM, serviceId, displayName, metadata);
  }

  /**
   * @static
   * @description Factory for GROUP type actors.
   * @param {string} id - Unique ID.
   * @param {string} groupId - Group identifier/email.
   * @param {string} displayName - Team name.
   * @param {Object} [metadata={}] - Attributes.
   * @returns {Actor}
   */
  static group(id: string, groupId: string, displayName: string, metadata: RoleMetadata = {}) {
    return new Actor(id, ActorType.GROUP, groupId, displayName, metadata);
  }

  /**
   * @function isPerson
   * @returns {boolean} True if type is PERSON.
   */
  isPerson() {
    return this.type === ActorType.PERSON;
  }

  /**
   * @function isSystem
   * @returns {boolean} True if type is SYSTEM.
   */
  isSystem() {
    return this.type === ActorType.SYSTEM;
  }

  /**
   * @function isGroup
   * @returns {boolean} True if type is GROUP.
   */
  isGroup() {
    return this.type === ActorType.GROUP;
  }

  /**
   * @function equals
   * @description Comparison based on unique ID.
   * @param {Actor} other - Target for comparison.
   * @returns {boolean}
   */
  equals(other: unknown) {
    if (!(other instanceof Actor)) {
      return false;
    }
    return this.id === other.id;
  }

  /**
   * @function getMetadata
   * @description Safe access to metadata object.
   * @param {string} key - Property name.
   * @param {*} [defaultValue=null] - Fallback value.
   * @returns {*} Value or defaultValue.
   */
  getMetadata(key: string, defaultValue: unknown = null) {
    return this.metadata.hasOwnProperty(key) ? this.metadata[key] : defaultValue;
  }

  /**
   * @function withMetadata
   * @description Creates a new instance with merged metadata (Functional Update).
   * @param {Object} additionalMetadata - Fields to merge.
   * @returns {Actor} New immutable instance.
   */
  withMetadata(additionalMetadata: RoleMetadata) {
    return new Actor(this.id, this.type, this.identifier, this.displayName, {
      ...this.metadata,
      ...additionalMetadata
    });
  }

  /**
   * @function toJSON
   * @description Serializes to plain object.
   * @returns {Object} {id, type, identifier, displayName, metadata}
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      identifier: this.identifier,
      displayName: this.displayName,
      metadata: { ...this.metadata }
    };
  }

  /**
   * @static
   * @description Hydrates an Actor from a plain object.
   * @param {Object} obj - Serialized actor data.
   * @returns {Actor}
   * @throws {Error} If obj is null or invalid.
   */
  static fromJSON(obj: unknown) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid actor object');
    }
    return new Actor(
      (obj as Record<string, unknown>).id,
      (obj as Record<string, unknown>).type,
      (obj as Record<string, unknown>).identifier,
      (obj as Record<string, unknown>).displayName,
      (obj as { metadata?: RoleMetadata }).metadata || {}
    );
  }

  /**
   * @function toString
   * @returns {string} Debug representation: Actor[TYPE:ID] Name <Identifier>
   */
  toString() {
    return `Actor[${this.type}:${this.id}] ${this.displayName} <${this.identifier}>`;
  }
}
