/**
 * @file SheetDBLib/src/multi/MultiDatabaseManager.js
 * @description Manager for multiple database partitions with connection pooling.
 * @version 1.1.0 - Refactored to Facade/Delegation pattern
 */

import { PartitionConfiguration } from './PartitionConfiguration.js';
import { PartitionRouter } from './PartitionRouter.js';
import { CrossPartitionQuery } from './CrossPartitionQuery.js';
import { CrossPartitionDisabledError } from './MultiDatabaseError.js';
import { PartitionCoordinator } from '../internal/multi-coordination/PartitionCoordinator.js';
import { CrossPartitionAggregator } from '../internal/multi-coordination/CrossPartitionAggregator.js';

/**
 * PartitionStatistics - Usage statistics for a partition.
 *
 * @typedef {Object} PartitionStatistics
 * @property {number} queries - Total queries executed
 * @property {number} hits - Cache hits (if applicable)
 * @property {number} misses - Cache misses (if applicable)
 * @property {Date|null} lastAccess - Last access timestamp
 * @property {boolean} isConnected - Whether partition is currently connected
 */

/**
 * @class MultiDatabaseManager
 * @description Orchestration facade for multi-partition database architectures.
 * Manages connection pooling, lazy-loading of DatabaseService instances, routing logic, and distributed queries across multiple Google Spreadsheets.
 *
 * @example
 * const manager = new MultiDatabaseManager(config, { logger, cache });
 * const db = manager.getPartition('warehouse_milan');
 */
export class MultiDatabaseManager {
  /**
   * @param {PartitionConfiguration|Object} configuration - Partition registry and global multi-db settings.
   * @param {Object} [options={}] - Manager operational parameters.
   * @param {Object} [options.logger=console] - Logger for connection and routing events.
   * @param {Object} [options.utils=null] - CoreUtilsLib service injection.
   * @param {Object} [options.cache=null] - Cache service for partition data.
   * @param {Object} [options.defaultConnectionOptions={}] - Settings passed to each new DatabaseService.
   * @param {Function} [options.customRouter=null] - Logic for choosing partitions based on context.
   */
  constructor(configuration, options = {}) {
    // Convert plain object to PartitionConfiguration if needed
    /**
     * Partition configuration.
     * @type {PartitionConfiguration}
     * @private
     */
    this._configuration =
      configuration instanceof PartitionConfiguration
        ? configuration
        : new PartitionConfiguration(configuration);

    /**
     * Partition router.
     * @type {PartitionRouter}
     * @private
     */
    this._router = new PartitionRouter(this._configuration, {
      logger: options.logger || console,
      customRouter: options.customRouter
    });

    /**
     * Internal coordinator for connection pooling and statistics
     * @type {PartitionCoordinator}
     * @private
     */
    this._coordinator = new PartitionCoordinator(this._configuration, options);

    (options.logger || console).info?.(
      `MultiDatabaseManager initialized with ${this._configuration.size()} partitions`
    );
  }
  /**
   * @description Retrieves a DatabaseService for a specific partition, using connection pooling.
   * @param {string} partitionIdOrAlias - Target partition ID or registered alias.
   * @returns {DatabaseService} Initialized database service instance.
   * @throws {PartitionNotFoundError} If the identifier is not registered.
   * @throws {PartitionConnectionError} If the underlying Spreadsheet connection fails.
   */
  getPartition(partitionIdOrAlias) {
    return this._coordinator.getPartition(partitionIdOrAlias);
  }

  /**
   * @description Retrieves the DatabaseService for the designated default partition.
   * @returns {DatabaseService} The default database service instance.
   * @throws {PartitionNotFoundError} If no default partition is configured.
   */
  getDefault() {
    return this.getPartition(this._configuration.defaultPartition);
  }

  /**
   * @description Retrieves DatabaseService instances for all partitions matching a specific tag.
   * @param {string} tag - Tag identifier to filter by.
   * @returns {DatabaseService[]} Collection of matching database services.
   */
  getByTag(tag) {
    const partitions = this._configuration.getPartitionsByTag(tag);
    return partitions.map((p) => this.getPartition(p.id));
  }

  /**
   * @description Retrieves DatabaseService instances for partitions matching multiple tags.
   * @param {string[]} tags - Collection of tag identifiers.
   * @param {'ALL'|'ANY'} [matchMode='ALL'] - Logic for combining multiple tag filters.
   * @returns {DatabaseService[]} Collection of matching database services.
   */
  getByTags(tags, matchMode = 'ALL') {
    const partitions = this._configuration.getPartitionsByTags(tags, matchMode);
    return partitions.map((p) => this.getPartition(p.id));
  }

  /**
   * @description Directs operations to appropriate DatabaseService(s) based on provided operational context.
   * @param {Object} routingContext - Data determining target partitions (e.g., table name, operation type).
   * @returns {DatabaseService|DatabaseService[]} Single service or collection of services based on routing logic.
   */
  route(routingContext) {
    const partitions = this._router.route(routingContext);

    if (partitions.length === 1) {
      return this.getPartition(partitions[0].id);
    }

    return partitions.map((p) => this.getPartition(p.id));
  }

  /**
   * @description Initiates a cross-partition query builder for distributed data retrieval.
   * @param {string} tableName - The identifier of the table to query across partitions.
   * @returns {CrossPartitionQuery} Query builder instance for aggregation logic.
   * @throws {CrossPartitionDisabledError} If the multi-partition query feature is disabled in configuration.
   */
  query(tableName) {
    if (!this._configuration.crossPartitionEnabled) {
      throw new CrossPartitionDisabledError();
    }

    return new CrossPartitionQuery(this, tableName);
  }

  /**
   * @description Accesses the underlying partition and global multi-db settings.
   * @returns {PartitionConfiguration} The active manager configuration.
   */
  getConfiguration() {
    return this._configuration;
  }

  /**
   * @description Accesses the routing logic used for context-aware partition selection.
   * @returns {PartitionRouter} The active routing service.
   */
  getRouter() {
    return this._router;
  }

  /**
   * @description Verifies if a connection is currently active for a specific partition.
   * @param {string} partitionIdOrAlias - Partition ID or registered alias.
   * @returns {boolean} True if the partition has an established connection in the pool.
   */
  isConnected(partitionIdOrAlias) {
    return this._coordinator.isConnected(partitionIdOrAlias);
  }

  /**
   * @description Returns identifiers for all partitions currently holding an active connection.
   * @returns {string[]} Collection of connected partition IDs.
   */
  getConnectedPartitions() {
    return this._coordinator.getConnectedPartitions();
  }

  /**
   * @description Persists pending changes across all currently connected partitions.
   * @param {Object} [options={}] - Persistence configuration.
   * @param {boolean} [options.dryRun=false] - If true, validation is performed without actual Spreadsheet writing.
   * @returns {Object<string, *>} Summary of save operations indexed by partition ID.
   */
  saveAll(options = {}) {
    return CrossPartitionAggregator.saveAll(this._coordinator, options);
  }

  /**
   * @description Explicitly terminates the connection for a specific partition.
   * @param {string} partitionIdOrAlias - Partition ID or registered alias.
   * @returns {boolean} True if a connection existed and was successfully terminated.
   */
  closePartition(partitionIdOrAlias) {
    return this._coordinator.closePartition(partitionIdOrAlias);
  }

  /**
   * @description Terminates all active Spreadsheet connections in the pool.
   * @returns {number} Total number of connections closed.
   */
  closeAll() {
    return this._coordinator.closeAll();
  }

  /**
   * @description Retrieves usage and performance metrics for all configured partitions.
   * @returns {Object<string, PartitionStatistics>} Map of partition IDs to their respective metrics.
   */
  getStatistics() {
    return this._coordinator.getStatistics();
  }

  /**
   * @description Retrieves usage metrics for a specific partition.
   * @param {string} partitionIdOrAlias - Partition ID or registered alias.
   * @returns {PartitionStatistics|null} Detailed metrics or null if the partition was never accessed.
   */
  getPartitionStatistics(partitionIdOrAlias) {
    return this._coordinator.getPartitionStatistics(partitionIdOrAlias);
  }

  /**
   * @description Wipes performance metrics for all partitions.
   */
  resetStatistics() {
    this._coordinator.resetStatistics();
  }

  /**
   * @description Returns a technical summary of active connections vs total configured partitions.
   * @returns {string} Debug string representation.
   */
  toString() {
    const connected = this._coordinator.activeConnectionsCount;
    const total = this._configuration.size();
    return `MultiDatabaseManager[${connected}/${total} connected]`;
  }
}
