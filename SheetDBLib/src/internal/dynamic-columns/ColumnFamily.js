/**
 * @file SheetDBLib/src/dynamic/ColumnFamily.js
 * @description ColumnFamily representing a group of dynamically generated columns.
 * @version 1.0.0
 */

import { ColumnType, isValidColumnType } from './ColumnType.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * MemberSource types for determining where column family members come from.
 *
 * @readonly
 * @enum {string}
 */
export const MemberSourceType = Object.freeze({
  /** Members are defined inline in the configuration */
  STATIC: 'STATIC',

  /** Members come from external configuration */
  CONFIG: 'CONFIG',

  /** Members come from a query result */
  QUERY: 'QUERY'
});

/**
 * @class ColumnFamily
 * @description Immutable Value Object defining a template for generating multiple spreadsheet columns based on a key pattern (e.g., 'attr_{{key}}').
 */
export class ColumnFamily {
  /**
   * @constructor
   * @param {Object} definition - Family specification.
   * @param {string} definition.id - Unique family identifier.
   * @param {string} definition.namePattern - String containing '{{key}}' placeholder.
   * @param {string} [definition.type=ColumnType.STRING] - Uniform data type for all members.
   * @param {boolean} [definition.nullable=true] - Nullability constraint.
   * @param {*} [definition.defaultValue=null] - Initial state for new members.
   * @param {string[]} [definition.members=[]] - Static list of keys.
   * @param {Object} [definition.memberSource=null] - Configuration for dynamic key discovery.
   * @throws {Error} If id/pattern is missing, pattern lacks placeholder, or type is invalid.
   */
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('ColumnFamily definition is required');
    }

    const {
      id,
      namePattern,
      type = ColumnType.STRING,
      nullable = true,
      defaultValue = null,
      members = [],
      memberSource = null,
      metadata = {}
    } = definition;

    // Validate required fields
    if (!id || typeof id !== 'string') {
      throw new Error('ColumnFamily requires an id');
    }
    if (!namePattern || typeof namePattern !== 'string') {
      throw new Error('ColumnFamily requires a namePattern');
    }
    if (!namePattern.includes('{{key}}')) {
      throw new Error('namePattern must contain {{key}} placeholder');
    }
    if (!isValidColumnType(type)) {
      throw new Error(`Invalid column type: ${type}`);
    }

    /** @type {string} @readonly */
    this.id = id;

    /** @type {string} @readonly */
    this.namePattern = namePattern;

    /** @type {string} @readonly */
    this.type = type;

    /** @type {boolean} @readonly */
    this.nullable = nullable;

    /** @type {*} @readonly */
    this.defaultValue = cloneDeep(defaultValue);

    /** @type {string[]} @readonly */
    this.members = Array.isArray(members) ? [...members] : [];

    /** @type {Object|null} @readonly */
    this.memberSource = memberSource ? cloneDeep(memberSource) : null;

    /** @type {Object} @readonly */
    this.metadata = cloneDeep(metadata);

    Object.freeze(this);
    Object.freeze(this.members);
    Object.freeze(this.metadata);
  }

  /**
   * @function generateColumnName
   * @description Interpolates memberKey into the namePattern.
   * @param {string} memberKey - Dynamic part.
   * @returns {string} Fully qualified physical column name.
   */
  generateColumnName(memberKey) {
    return this.namePattern.replace('{{key}}', memberKey);
  }

  /**
   * @function parseMemberKey
   * @description Inverse mapping: extracts the dynamic key from a physical column string.
   * @param {string} columnName - Physical name to parse.
   * @returns {string|null} The key if pattern matches, else null.
   */
  parseMemberKey(columnName) {
    // Create a regex from the pattern
    const patternParts = this.namePattern.split('{{key}}');
    const prefix = patternParts[0] || '';
    const suffix = patternParts[1] || '';

    if (!columnName.startsWith(prefix) || !columnName.endsWith(suffix)) {
      return null;
    }

    const key = columnName.slice(prefix.length, columnName.length - suffix.length || undefined);
    return key || null;
  }

  /**
   * @function matchesColumn
   * @description Pattern matching check.
   * @param {string} columnName - Physical name.
   * @returns {boolean} True if column fits family pattern.
   */
  matchesColumn(columnName) {
    return this.parseMemberKey(columnName) !== null;
  }

  /**
   * @function generateAllColumnNames
   * @description Expands the current members list into physical names.
   * @returns {string[]}
   */
  generateAllColumnNames() {
    return this.members.map((key) => this.generateColumnName(key));
  }

  /**
   * @function getColumnNames
   * @alias generateAllColumnNames
   * @returns {string[]}
   */
  getColumnNames() {
    return this.generateAllColumnNames();
  }

  /**
   * @function isStatic
   * @returns {boolean} True if keys are defined inline.
   */
  isStatic() {
    return !this.memberSource || this.memberSource.type === MemberSourceType.STATIC;
  }

  /**
   * @function isConfigBased
   * @returns {boolean} True if keys come from external config.
   */
  isConfigBased() {
    return this.memberSource?.type === MemberSourceType.CONFIG;
  }

  /**
   * @function isQueryBased
   * @returns {boolean} True if keys are discovered via DB query.
   */
  isQueryBased() {
    return this.memberSource?.type === MemberSourceType.QUERY;
  }

  /**
   * @function getMemberCount
   * @returns {number}
   */
  getMemberCount() {
    return this.members.length;
  }

  /**
   * @function hasMember
   * @param {string} key - Member key.
   * @returns {boolean}
   */
  hasMember(key) {
    return this.members.includes(key);
  }

  /**
   * @function withMembers
   * @description Functional update returning new instance with deduplicated union of members.
   * @param {string[]} newMembers - Keys to add.
   * @returns {ColumnFamily}
   */
  withMembers(newMembers) {
    const mergedMembers = [...new Set([...this.members, ...newMembers])];
    return new ColumnFamily({
      id: this.id,
      namePattern: this.namePattern,
      type: this.type,
      nullable: this.nullable,
      defaultValue: this.defaultValue,
      members: mergedMembers,
      memberSource: this.memberSource,
      metadata: this.metadata
    });
  }

  /**
   * @function toJSON
   * @description Serializes to POJO.
   * @returns {Object} {id, namePattern, type, nullable, defaultValue, members, memberSource}
   */
  toJSON() {
    return {
      id: this.id,
      namePattern: this.namePattern,
      type: this.type,
      nullable: this.nullable,
      defaultValue: this.defaultValue,
      members: [...this.members],
      memberSource: this.memberSource ? { ...this.memberSource } : null
    };
  }

  /**
   * @static
   * @description Factory to hydrate a ColumnFamily from POJO.
   * @param {Object} obj - Serialized data.
   * @returns {ColumnFamily}
   * @throws {Error} If obj is invalid.
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid column family object');
    }
    return new ColumnFamily(obj);
  }

  /**
   * @function toString
   * @returns {string} Debug string: ColumnFamily[ID] PATTERN (TYPE, COUNT members).
   */
  toString() {
    return `ColumnFamily[${this.id}] ${this.namePattern} (${this.type}, ${this.members.length} members)`;
  }
}
