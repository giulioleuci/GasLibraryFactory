/**
 * @file SheetDBLib/src/multi/PartitionConfiguration.js
 * @description Configuration for multi-database partition setup.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';
import { DatabasePartition } from './DatabasePartition.js';
import { RoutingStrategy, isValidRoutingStrategy } from './RoutingStrategy.js';

/**
 * @class PartitionConfiguration
 * @description Centralized registry for multi-database topology.
 * Manages partition definitions, routing strategies, aliases, and global connection settings for the MultiDatabaseManager.
 *
 * @example
 * const config = new PartitionConfiguration({
 *   partitions: [{ id: 'main', spreadsheetId: '1abc...' }],
 *   aliases: { active: 'main' }
 * });
 */
export class PartitionConfiguration {
  /**
   * @param {Object} config - Topology definition.
   * @param {Array<Object|DatabasePartition>} config.partitions - Collection of partition specifications.
   * @param {string} [config.defaultPartition] - Partition ID used when no routing context is provided.
   * @param {string} [config.routingStrategy='EXPLICIT'] - Default logic for selecting partitions.
   * @param {Object<string, string>} [config.aliases={}] - Map of semantic aliases to physical partition IDs.
   * @param {boolean} [config.crossPartitionEnabled=true] - Flag to toggle distributed query support.
   * @param {Object} [config.globalConnectionOptions={}] - Settings applied to every partition connection.
   * @throws {Error} If partitions is empty, IDs are duplicated, or routing strategy is invalid.
   */
  constructor(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('PartitionConfiguration requires a config object');
    }

    const {
      partitions = [],
      defaultPartition = null,
      routingStrategy = RoutingStrategy.EXPLICIT,
      aliases = {},
      crossPartitionEnabled = true,
      globalConnectionOptions = {}
    } = config;

    // Validate and convert partitions
    if (!Array.isArray(partitions) || partitions.length === 0) {
      throw new Error('At least one partition must be provided');
    }

    /**
     * Map of partition ID to DatabasePartition.
     * @type {Map<string, DatabasePartition>}
     * @private
     */
    this._partitions = new Map();

    for (const p of partitions) {
      const partition = p instanceof DatabasePartition ? p : new DatabasePartition(p);
      if (this._partitions.has(partition.id)) {
        throw new Error(`Duplicate partition ID: ${partition.id}`);
      }
      this._partitions.set(partition.id, partition);
    }

    // Validate default partition
    if (defaultPartition && !this._partitions.has(defaultPartition)) {
      throw new Error(`Default partition not found: ${defaultPartition}`);
    }

    /**
     * Default partition ID.
     * @type {string|null}
     * @readonly
     */
    this.defaultPartition = defaultPartition || this._partitions.keys().next().value;

    // Validate routing strategy
    if (!isValidRoutingStrategy(routingStrategy)) {
      throw new Error(`Invalid routing strategy: ${routingStrategy}`);
    }

    /**
     * Default routing strategy.
     * @type {string}
     * @readonly
     */
    this.routingStrategy = routingStrategy;

    // Validate and store aliases
    for (const [alias, partitionId] of Object.entries(aliases)) {
      if (!this._partitions.has(partitionId)) {
        throw new Error(`Alias "${alias}" references unknown partition: ${partitionId}`);
      }
    }

    /**
     * Alias to partition ID mappings.
     * @type {Object<string, string>}
     * @readonly
     */
    this.aliases = Object.freeze({ ...aliases });

    /**
     * Whether cross-partition queries are enabled.
     * @type {boolean}
     * @readonly
     */
    this.crossPartitionEnabled = Boolean(crossPartitionEnabled);

    /**
     * Global connection options applied to all partitions.
     * @type {Object}
     * @readonly
     */
    this.globalConnectionOptions = Object.freeze(cloneDeep(globalConnectionOptions));

    Object.freeze(this);
  }

  /**
   * @description Retrieves a partition definition by its unique ID or a registered alias.
   * @param {string} idOrAlias - Physical ID or semantic alias.
   * @returns {DatabasePartition|null} The matching partition instance or null if not found.
   */
  getPartition(idOrAlias) {
    // Check direct ID first
    if (this._partitions.has(idOrAlias)) {
      return this._partitions.get(idOrAlias);
    }
    // Check alias
    const aliasedId = this.aliases[idOrAlias];
    if (aliasedId && this._partitions.has(aliasedId)) {
      return this._partitions.get(aliasedId);
    }
    return null;
  }

  /**
   * @description Returns the primary partition definition.
   * @returns {DatabasePartition} The configured default partition instance.
   */
  getDefaultPartition() {
    return this._partitions.get(this.defaultPartition);
  }

  /**
   * @description Retrieves all registered partitions.
   * @returns {DatabasePartition[]} Collection of all partition instances.
   */
  getAllPartitions() {
    return Array.from(this._partitions.values());
  }

  /**
   * @description Returns physical IDs of all registered partitions.
   * @returns {string[]} Collection of unique partition identifiers.
   */
  getPartitionIds() {
    return Array.from(this._partitions.keys());
  }

  /**
   * @description Filters partitions that possess a specific metadata tag.
   * @param {string} tag - Target tag identifier.
   * @returns {DatabasePartition[]} Collection of matching partitions.
   */
  getPartitionsByTag(tag) {
    return this.getAllPartitions().filter((p) => p.hasTag(tag));
  }

  /**
   * @description Filters partitions using multiple tag criteria.
   * @param {string[]} tags - Collection of tag identifiers.
   * @param {'ALL'|'ANY'} [matchMode='ALL'] - Matching logic (all tags vs at least one).
   * @returns {DatabasePartition[]} Collection of matching partitions.
   */
  getPartitionsByTags(tags, matchMode = 'ALL') {
    const partitions = this.getAllPartitions();
    if (matchMode === 'ALL') {
      return partitions.filter((p) => p.hasAllTags(tags));
    }
    return partitions.filter((p) => p.hasAnyTag(tags));
  }

  /**
   * @description Returns all partitions sorted by their numerical priority.
   * @returns {DatabasePartition[]} Partitions in descending priority order.
   */
  getPartitionsByPriority() {
    return this.getAllPartitions().sort((a, b) => b.priority - a.priority);
  }

  /**
   * @description Returns partitions explicitly marked as read-only.
   * @returns {DatabasePartition[]} Collection of read-only partitions.
   */
  getReadOnlyPartitions() {
    return this.getAllPartitions().filter((p) => p.isReadOnly);
  }

  /**
   * @description Returns partitions where write operations are permitted.
   * @returns {DatabasePartition[]} Collection of writable partitions.
   */
  getWritablePartitions() {
    return this.getAllPartitions().filter((p) => !p.isReadOnly);
  }

  /**
   * @description Verifies the existence of a partition ID or alias in the registry.
   * @param {string} idOrAlias - Physical ID or registered alias.
   * @returns {boolean} True if the identifier is recognized.
   */
  hasPartition(idOrAlias) {
    return this.getPartition(idOrAlias) !== null;
  }

  /**
   * @description Translates a semantic alias to its corresponding physical partition ID.
   * @param {string} alias - Registered alias identifier.
   * @returns {string|null} The physical ID or null if the alias is unregistered.
   */
  resolveAlias(alias) {
    return this.aliases[alias] || null;
  }

  /**
   * @description Returns the total number of registered partitions.
   * @returns {number} Partition count.
   */
  size() {
    return this._partitions.size;
  }

  /**
   * @description Aggregates all unique metadata tags present across the entire topology.
   * @returns {string[]} Sorted collection of unique tag identifiers.
   */
  getAllTags() {
    const tags = new Set();
    for (const partition of this._partitions.values()) {
      for (const tag of partition.tags) {
        tags.add(tag);
      }
    }
    return Array.from(tags).sort();
  }

  /**
   * @description Serializes the entire topology configuration to a plain object.
   * @returns {Object} JSON-serializable configuration.
   */
  toJSON() {
    return {
      partitions: this.getAllPartitions().map((p) => p.toJSON()),
      defaultPartition: this.defaultPartition,
      routingStrategy: this.routingStrategy,
      aliases: { ...this.aliases },
      crossPartitionEnabled: this.crossPartitionEnabled,
      globalConnectionOptions: { ...this.globalConnectionOptions }
    };
  }

  /**
   * @description Factory to reconstruct a PartitionConfiguration from its serialized form.
   * @param {Object} obj - Serialized configuration data.
   * @returns {PartitionConfiguration} New configuration instance.
   * @throws {Error} If input object is invalid.
   * @static
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid configuration object');
    }
    return new PartitionConfiguration(obj);
  }

  /**
   * @description Returns a technical summary of partition counts and default routing target.
   * @returns {string} Debug string representation.
   */
  toString() {
    return `PartitionConfiguration[${this._partitions.size} partitions, default: ${this.defaultPartition}]`;
  }
}
