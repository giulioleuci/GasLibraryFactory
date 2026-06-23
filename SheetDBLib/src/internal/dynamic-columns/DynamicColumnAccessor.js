/**
 * @file SheetDBLib/src/dynamic/DynamicColumnAccessor.js
 * @description DynamicColumnAccessor provides type-safe access to dynamic columns in rows.
 * @version 1.0.0
 */

import { ColumnFamily } from './ColumnFamily.js';
import { coerceToType } from './ColumnType.js';

/**
 * @class DynamicColumnAccessor
 * @description State-safe wrapper for row objects providing type-coerced access to ColumnFamily members.
 */
export class DynamicColumnAccessor {
  /**
   * @constructor
   * @param {Object} row - Raw data object to wrap.
   * @param {Object} [options={}] - Accessor configuration.
   * @param {ColumnFamily[]} [options.families=[]] - Available templates.
   * @param {Map<string, ColumnFamily>} [options.familyMap] - Pre-built template index.
   * @param {boolean} [options.coerceTypes=true] - Toggle automatic ColumnType coercion.
   * @param {boolean} [options.useDefaults=true] - Toggle fallback to ColumnFamily.defaultValue.
   */
  constructor(row, options = {}) {
    const { families = [], familyMap = null, coerceTypes = true, useDefaults = true } = options;

    /** @type {Object} @private */
    this._row = row;

    /** @type {Map<string, ColumnFamily>} @private */
    this._familyMap = familyMap || new Map(families.map((f) => [f.id, f]));

    /** @type {boolean} @private */
    this._coerceTypes = coerceTypes;

    /** @type {boolean} @private */
    this._useDefaults = useDefaults;
  }

  /**
   * @function getRow
   * @returns {Object} The underlying mutated row.
   */
  getRow() {
    return this._row;
  }

  /**
   * @function get
   * @description Resolves physical name from family/memberKey and retrieves value with optional coercion/defaulting.
   * @param {string} familyId - Template identifier.
   * @param {string} memberKey - Dynamic part.
   * @returns {*} Value or null.
   * @throws {Error} If familyId is unregistered.
   */
  get(familyId, memberKey) {
    const family = this._getFamily(familyId);
    const columnName = family.generateColumnName(memberKey);

    let value = this._row[columnName];

    // Handle missing value
    if (value === undefined || value === null) {
      if (this._useDefaults) {
        value = family.defaultValue;
      } else {
        return null;
      }
    }

    // Coerce type if configured
    if (this._coerceTypes && value !== null) {
      value = coerceToType(value, family.type);
    }

    return value;
  }

  /**
   * @function getAll
   * @description Retrieves all member values for a family as a POJO mapping.
   * @param {string} familyId - Template identifier.
   * @returns {Object.<string, *>}
   * @throws {Error} If familyId is unregistered.
   */
  getAll(familyId) {
    const family = this._getFamily(familyId);
    const result = {};

    for (const memberKey of family.members) {
      result[memberKey] = this.get(familyId, memberKey);
    }

    return result;
  }

  /**
   * @function getAllAsArray
   * @param {string} familyId - Template identifier.
   * @returns {Array<{key: string, value: *}>}
   */
  getAllAsArray(familyId) {
    const family = this._getFamily(familyId);
    return family.members.map((memberKey) => ({
      key: memberKey,
      value: this.get(familyId, memberKey)
    }));
  }

  /**
   * @function getMembers
   * @param {string} familyId - Template identifier.
   * @param {string[]} memberKeys - Subset of keys.
   * @returns {Object.<string, *>}
   */
  getMembers(familyId, memberKeys) {
    const result = {};
    for (const memberKey of memberKeys) {
      result[memberKey] = this.get(familyId, memberKey);
    }
    return result;
  }

  /**
   * @function has
   * @description Direct existence check (non-null/non-undefined) in underlying row.
   * @param {string} familyId - Template identifier.
   * @param {string} memberKey - Dynamic part.
   * @returns {boolean}
   */
  has(familyId, memberKey) {
    const family = this._getFamily(familyId);
    const columnName = family.generateColumnName(memberKey);
    const value = this._row[columnName];
    return value !== undefined && value !== null;
  }

  /**
   * @function hasAny
   * @param {string} familyId - Template identifier.
   * @returns {boolean} True if at least one member is populated.
   */
  hasAny(familyId) {
    const family = this._getFamily(familyId);
    return family.members.some((key) => this.has(familyId, key));
  }

  /**
   * @function hasAll
   * @param {string} familyId - Template identifier.
   * @returns {boolean} True if all members are populated.
   */
  hasAll(familyId) {
    const family = this._getFamily(familyId);
    return family.members.every((key) => this.has(familyId, key));
  }

  /**
   * @function set
   * @description Writes value to underlying row using pattern-generated column name. Applies coercion if enabled.
   * @param {string} familyId - Template identifier.
   * @param {string} memberKey - Dynamic part.
   * @param {*} value - Data to store.
   * @returns {DynamicColumnAccessor} For chaining.
   * @throws {Error} If familyId is unregistered.
   */
  set(familyId, memberKey, value) {
    const family = this._getFamily(familyId);
    const columnName = family.generateColumnName(memberKey);

    // Coerce type if configured
    let finalValue = value;
    if (this._coerceTypes && value !== null && value !== undefined) {
      finalValue = coerceToType(value, family.type);
    }

    this._row[columnName] = finalValue;
    return this;
  }

  /**
   * @function setAll
   * @description Bulk write.
   * @param {string} familyId - Template identifier.
   * @param {Object.<string, *>} values - Key-value map.
   * @returns {DynamicColumnAccessor}
   */
  setAll(familyId, values) {
    for (const [memberKey, value] of Object.entries(values)) {
      this.set(familyId, memberKey, value);
    }
    return this;
  }

  /**
   * @function clear
   * @description Sets specific member to null.
   * @param {string} familyId - Template identifier.
   * @param {string} memberKey - Dynamic part.
   * @returns {DynamicColumnAccessor}
   */
  clear(familyId, memberKey) {
    const family = this._getFamily(familyId);
    const columnName = family.generateColumnName(memberKey);
    this._row[columnName] = null;
    return this;
  }

  /**
   * @function clearAll
   * @description Sets all family members to null.
   * @param {string} familyId - Template identifier.
   * @returns {DynamicColumnAccessor}
   */
  clearAll(familyId) {
    const family = this._getFamily(familyId);
    for (const memberKey of family.members) {
      this.clear(familyId, memberKey);
    }
    return this;
  }

  /**
   * @function count
   * @returns {number} Non-null member count.
   */
  count(familyId) {
    const family = this._getFamily(familyId);
    return family.members.filter((key) => this.has(familyId, key)).length;
  }

  /**
   * @function getFilledMembers
   * @returns {string[]} Keys with non-null values.
   */
  getFilledMembers(familyId) {
    const family = this._getFamily(familyId);
    return family.members.filter((key) => this.has(familyId, key));
  }

  /**
   * @function getEmptyMembers
   * @returns {string[]} Keys with null/undefined values.
   */
  getEmptyMembers(familyId) {
    const family = this._getFamily(familyId);
    return family.members.filter((key) => !this.has(familyId, key));
  }

  /**
   * @function _getFamily
   * @param {string} familyId - Target ID.
   * @returns {ColumnFamily}
   * @throws {Error} If missing.
   * @private
   */
  _getFamily(familyId) {
    const family = this._familyMap.get(familyId);
    if (!family) {
      throw new Error(`Column family not found: ${familyId}`);
    }
    return family;
  }

  /**
   * @static
   * @description Factory for single-row wrapping.
   * @param {Object} row - Data.
   * @param {ColumnFamily[]} families - Templates.
   * @param {Object} [options={}] - Config.
   * @returns {DynamicColumnAccessor}
   */
  static forRow(row, families, options = {}) {
    return new DynamicColumnAccessor(row, { families, ...options });
  }

  /**
   * @static
   * @description Factory for bulk wrapping.
   * @param {Object[]} rows - Data array.
   * @param {ColumnFamily[]} families - Templates.
   * @param {Object} [options={}] - Config.
   * @returns {DynamicColumnAccessor[]}
   */
  static forRows(rows, families, options = {}) {
    const familyMap = new Map(families.map((f) => [f.id, f]));
    return rows.map((row) => new DynamicColumnAccessor(row, { familyMap, ...options }));
  }
}
