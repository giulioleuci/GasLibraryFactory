/**
 * @file SheetDBLib/src/dynamic/SchemaTemplate.js
 * @description SchemaTemplate representing a schema with dynamic columns.
 * @version 1.0.0
 */

import { ColumnFamily } from './ColumnFamily.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class SchemaTemplate
 * @description Immutable definition of a database table structure containing both static (fixed) and dynamic (family-based) column configurations.
 * Used as the primary input for SchemaResolver to generate concrete ResolvedSchema objects.
 *
 * @example
 * const template = new SchemaTemplate({
 *   tableId: 'PRODUCTS',
 *   fixedColumns: [{ name: 'sku', type: 'STRING', primaryKey: true }],
 *   dynamicColumns: [{ familyId: 'attributes' }]
 * });
 */
export class SchemaTemplate {
  /**
   * @param {Object} definition - Template structure.
   * @param {string} definition.tableId - Unique table identifier.
   * @param {Object[]} [definition.fixedColumns=[]] - Collection of static column definitions.
   * @param {Object[]} [definition.dynamicColumns=[]] - Collection of dynamic column (family) configurations.
   * @param {Object} [definition.metadata={}] - Arbitrary template metadata.
   * @throws {Error} If definition is invalid or tableId is missing/non-string.
   */
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('SchemaTemplate definition is required');
    }

    const { tableId, fixedColumns = [], dynamicColumns = [], metadata = {} } = definition;

    if (!tableId || typeof tableId !== 'string') {
      throw new Error('SchemaTemplate tableId is required and must be a string');
    }

    /**
     * Table identifier.
     * @type {string}
     * @readonly
     */
    this.tableId = tableId;

    /**
     * Fixed column definitions.
     * @type {Object[]}
     * @readonly
     */
    this.fixedColumns = cloneDeep(fixedColumns);

    /**
     * Dynamic column configurations.
     * @type {Object[]}
     * @readonly
     */
    this.dynamicColumns = cloneDeep(dynamicColumns);

    /**
     * Additional metadata.
     * @type {Object}
     * @readonly
     */
    this.metadata = cloneDeep(metadata);

    Object.freeze(this);
    Object.freeze(this.fixedColumns);
    Object.freeze(this.dynamicColumns);
    Object.freeze(this.metadata);
  }

  /**
   * @description Identifies the primary key column name within fixed columns.
   * @returns {string|null} Column name or null if no primary key is defined.
   */
  getPrimaryKeyColumn() {
    const pkColumn = this.fixedColumns.find((col) => col.primaryKey === true);
    return pkColumn ? pkColumn.name : null;
  }

  /**
   * @description Returns names of all static (fixed) columns.
   * @returns {string[]} Collection of fixed column names.
   */
  getFixedColumnNames() {
    return this.fixedColumns.map((col) => col.name);
  }

  /**
   * @description Returns IDs of all ColumnFamilies referenced in dynamic configurations.
   * @returns {string[]} Collection of family IDs.
   */
  getDynamicFamilyIds() {
    return this.dynamicColumns.map((dc) => dc.familyId);
  }

  /**
   * @description Checks if any dynamic column families are configured.
   * @returns {boolean} True if the template contains dynamic configurations.
   */
  hasDynamicColumns() {
    return this.dynamicColumns.length > 0;
  }

  /**
   * @description Retrieves a specific fixed column definition by name.
   * @param {string} name - The name of the fixed column.
   * @returns {Object|null} Column definition object or null if not found.
   */
  getFixedColumn(name) {
    return this.fixedColumns.find((col) => col.name === name) || null;
  }

  /**
   * @description Validates template structure for required fields and unique naming.
   * Checks for duplicate fixed columns, primary key existence, and valid family IDs.
   * @returns {Object} Validation result { isValid: boolean, errors: string[] }.
   */
  validate() {
    const errors = [];

    // Check for duplicate fixed column names
    const fixedNames = this.getFixedColumnNames();
    const uniqueNames = new Set(fixedNames);
    if (uniqueNames.size !== fixedNames.length) {
      errors.push('Duplicate fixed column names found');
    }

    // Check that primary key is defined
    if (!this.getPrimaryKeyColumn()) {
      errors.push('No primary key column defined');
    }

    // Check dynamic column configurations
    this.dynamicColumns.forEach((dc, index) => {
      if (!dc.familyId) {
        errors.push(`Dynamic column at index ${index} is missing familyId`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * @description Produces a plain-object representation of the template for serialization.
   * @returns {Object} JSON-serializable template definition.
   */
  toJSON() {
    return {
      tableId: this.tableId,
      fixedColumns: this.fixedColumns.map((c) => ({ ...c })),
      dynamicColumns: this.dynamicColumns.map((c) => ({ ...c })),
      metadata: { ...this.metadata }
    };
  }

  /**
   * @description Factory to reconstruct a SchemaTemplate from its serialized form.
   * @param {Object} obj - Serialized template data.
   * @returns {SchemaTemplate} New immutable template instance.
   * @throws {Error} If input object is invalid.
   * @static
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid schema template object');
    }
    return new SchemaTemplate(obj);
  }

  /**
   * @description Returns a technical summary string for the template.
   * @returns {string} Debug string representation.
   */
  toString() {
    const fixedCount = this.fixedColumns.length;
    const dynamicCount = this.dynamicColumns.length;
    return `SchemaTemplate[${this.tableId}] ${fixedCount} fixed, ${dynamicCount} dynamic column families`;
  }
}
