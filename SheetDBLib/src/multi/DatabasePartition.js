/**
 * @file SheetDBLib/src/multi/DatabasePartition.js
 * @description DatabasePartition representing a single partition (spreadsheet) in a multi-database setup.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class DatabasePartition
 * @description Configuration entity representing a logical database partition mapping to a unique Google Spreadsheet.
 * Supports metadata tagging, priority-based routing, and read-only flags for multi-database architectures.
 *
 * @example
 * const partition = new DatabasePartition({
 *   id: 'warehouse_milan',
 *   spreadsheetId: '1abc...',
 *   tags: ['europe', 'active'],
 *   priority: 10
 * });
 */
export class DatabasePartition {
  /**
   * @param {Object} definition - Partition configuration.
   * @param {string} definition.id - Unique logical identifier for routing.
   * @param {string} definition.spreadsheetId - Target Google Spreadsheet ID.
   * @param {string} [definition.label=''] - Human-readable display label.
   * @param {string[]} [definition.tags=[]] - Category tags for routing filters.
   * @param {Object} [definition.metadata={}] - Arbitrary metadata key-value pairs.
   * @param {Object} [definition.connectionOptions={}] - Spreadsheet-specific connection settings.
   * @param {boolean} [definition.isReadOnly=false] - If true, write operations are blocked for this partition.
   * @param {number} [definition.priority=0] - Numerical priority for preferred routing (higher = preferred).
   * @throws {Error} If definition is missing or required fields (id, spreadsheetId) are invalid.
   */
  constructor(definition) {
    if (!definition || typeof definition !== 'object') {
      throw new Error('DatabasePartition definition is required');
    }

    const {
      id,
      spreadsheetId,
      label = '',
      tags = [],
      metadata = {},
      connectionOptions = {},
      isReadOnly = false,
      priority = 0
    } = definition;

    // Validate required fields
    if (!id || typeof id !== 'string') {
      throw new Error('DatabasePartition id is required and must be a string');
    }
    if (!spreadsheetId || typeof spreadsheetId !== 'string') {
      throw new Error('DatabasePartition spreadsheetId is required and must be a string');
    }
    if (!Array.isArray(tags)) {
      throw new Error('DatabasePartition tags must be an array');
    }
    if (typeof priority !== 'number' || !isFinite(priority)) {
      throw new Error('DatabasePartition priority must be a valid number');
    }

    /**
     * Unique logical identifier for the partition.
     * @type {string}
     * @readonly
     */
    this.id = id;

    /**
     * Google Spreadsheet ID.
     * @type {string}
     * @readonly
     */
    this.spreadsheetId = spreadsheetId;

    /**
     * Human-readable label.
     * @type {string}
     * @readonly
     */
    this.label = label || id;

    /**
     * Tags for filtering and routing.
     * @type {string[]}
     * @readonly
     */
    this.tags = Object.freeze([...tags]);

    /**
     * Custom metadata.
     * @type {Object}
     * @readonly
     */
    this.metadata = Object.freeze(cloneDeep(metadata));

    /**
     * Connection options for DatabaseService.
     * @type {Object}
     * @readonly
     */
    this.connectionOptions = Object.freeze(cloneDeep(connectionOptions));

    /**
     * Whether this partition is read-only.
     * @type {boolean}
     * @readonly
     */
    this.isReadOnly = Boolean(isReadOnly);

    /**
     * Priority for routing (higher values = higher priority).
     * @type {number}
     * @readonly
     */
    this.priority = priority;

    Object.freeze(this);
  }

  /**
   * @description Checks for the existence of a specific metadata tag.
   * @param {string} tag - Tag to verify.
   * @returns {boolean} True if the tag is present in the partition's tags collection.
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }

  /**
   * @description Verifies if the partition contains all provided tags.
   * @param {string[]} requiredTags - Collection of tags that must all be present.
   * @returns {boolean} True only if every required tag exists in the partition.
   */
  hasAllTags(requiredTags) {
    return requiredTags.every((tag) => this.tags.includes(tag));
  }

  /**
   * @description Verifies if the partition contains at least one of the provided tags.
   * @param {string[]} anyTags - Collection of tags where at least one match is sufficient.
   * @returns {boolean} True if any of the provided tags exist in the partition.
   */
  hasAnyTag(anyTags) {
    return anyTags.some((tag) => this.tags.includes(tag));
  }

  /**
   * @description Retrieves a value from the custom metadata storage.
   * @param {string} key - Metadata entry key.
   * @param {*} [defaultValue=null] - Value to return if the key is missing.
   * @returns {*} Metadata value or the specified default.
   */
  getMetadata(key, defaultValue = null) {
    return key in this.metadata ? this.metadata[key] : defaultValue;
  }

  /**
   * @description Returns a new DatabasePartition instance with the provided tags merged into existing ones.
   * @param {string[]} newTags - Collection of tags to append.
   * @returns {DatabasePartition} New immutable partition instance with updated tags.
   */
  withTags(newTags) {
    const mergedTags = [...new Set([...this.tags, ...newTags])];
    return new DatabasePartition({
      id: this.id,
      spreadsheetId: this.spreadsheetId,
      label: this.label,
      tags: mergedTags,
      metadata: this.metadata,
      connectionOptions: this.connectionOptions,
      isReadOnly: this.isReadOnly,
      priority: this.priority
    });
  }

  /**
   * @description Returns a new DatabasePartition instance with an updated priority value.
   * @param {number} newPriority - The target priority level.
   * @returns {DatabasePartition} New immutable partition instance with updated priority.
   */
  withPriority(newPriority) {
    return new DatabasePartition({
      id: this.id,
      spreadsheetId: this.spreadsheetId,
      label: this.label,
      tags: this.tags,
      metadata: this.metadata,
      connectionOptions: this.connectionOptions,
      isReadOnly: this.isReadOnly,
      priority: newPriority
    });
  }

  /**
   * @description Serializes the partition definition to a plain object.
   * @returns {Object} JSON-serializable partition definition.
   */
  toJSON() {
    return {
      id: this.id,
      spreadsheetId: this.spreadsheetId,
      label: this.label,
      tags: [...this.tags],
      metadata: { ...this.metadata },
      connectionOptions: { ...this.connectionOptions },
      isReadOnly: this.isReadOnly,
      priority: this.priority
    };
  }

  /**
   * @description Reconstructs a DatabasePartition instance from its serialized form.
   * @param {Object} obj - Serialized partition data.
   * @returns {DatabasePartition} New partition instance.
   * @throws {Error} If input object is invalid.
   * @static
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid partition object');
    }
    return new DatabasePartition(obj);
  }

  /**
   * @description Returns a technical summary of the partition's identity, tags, and read-only status.
   * @returns {string} Debug string representation.
   */
  toString() {
    const readOnlyStr = this.isReadOnly ? ' (read-only)' : '';
    return `DatabasePartition[${this.id}] "${this.label}" [${this.tags.join(', ')}]${readOnlyStr}`;
  }
}
