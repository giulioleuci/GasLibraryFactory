/**
 * @file SheetDBLib/src/multi/internal/PartitionCoordinator.js
 * @description Internal module managing partition connections, pooling, and statistics.
 * @version 1.0.0
 */

import { DatabaseService } from '../../DatabaseService.js';
import { PartitionConnectionError, PartitionNotFoundError } from '../../multi/MultiDatabaseError.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class PartitionCoordinator
 * @description Internal orchestration module for partition connection lifecycle management.
 * Handles lazy initialization of DatabaseService instances, connection pooling, and usage telemetry tracking.
 */
export class PartitionCoordinator {
  /**
   * @param {PartitionConfiguration} configuration - Active partition registry.
   * @param {Object} context - Shared service dependencies.
   * @param {Object} [context.logger] - Logger instance.
   * @param {Object} [context.utils] - CoreUtilsLib reference.
   * @param {Object} [context.cache] - Data caching service.
   * @param {Object} [context.defaultConnectionOptions] - Global connection overrides.
   */
  constructor(configuration, context) {
    this._configuration = configuration;
    this._logger = context.logger || console;
    this._utils = context.utils || null;
    this._cache = context.cache || null;
    this._defaultConnectionOptions = cloneDeep(context.defaultConnectionOptions || {});

    this._connections = new Map();
    this._statistics = new Map();

    // Initialize statistics for all partitions
    for (const partition of this._configuration.getAllPartitions()) {
      this._statistics.set(partition.id, {
        queries: 0,
        hits: 0,
        misses: 0,
        lastAccess: null,
        isConnected: false
      });
    }
  }

  /**
   * @description Retrieves an active connection from the pool or initializes a new DatabaseService instance.
   * @param {string} partitionIdOrAlias - Physical ID or semantic alias of the target partition.
   * @returns {DatabaseService} The established database service connection.
   * @throws {PartitionNotFoundError} If the identifier is not registered.
   * @throws {PartitionConnectionError} If the underlying connection initialization fails.
   */
  getPartition(partitionIdOrAlias) {
    const partition = this._configuration.getPartition(partitionIdOrAlias);

    if (!partition) {
      throw new PartitionNotFoundError(partitionIdOrAlias);
    }

    if (this._connections.has(partition.id)) {
      this.updateStatistics(partition.id, 'access');
      return this._connections.get(partition.id);
    }

    return this._createConnection(partition);
  }

  /**
   * @description Internal factory for Spreadsheet-linked DatabaseService instances.
   * Merges global, partition-specific, and default connection options.
   * @param {DatabasePartition} partition - The partition configuration to connect to.
   * @returns {DatabaseService} New database service instance.
   * @throws {PartitionConnectionError} On connection failure.
   * @private
   */
  _createConnection(partition) {
    this._logger.debug?.(`Creating connection to partition: ${partition.id}`);

    try {
      const connectionOptions = {
        ...this._configuration.globalConnectionOptions,
        ...partition.connectionOptions,
        ...this._defaultConnectionOptions
      };

      const db = new DatabaseService(
        partition.spreadsheetId,
        this._logger,
        this._utils,
        this._cache,
        null, // spreadsheetService
        connectionOptions
      );

      this._connections.set(partition.id, db);
      this.updateStatistics(partition.id, 'connect');

      this._logger.info?.(`Connected to partition: ${partition.id}`);
      return db;
    } catch (error) {
      throw new PartitionConnectionError(partition.id, error);
    }
  }

  /**
   * @description Verifies if a specific partition currently holds an active pooled connection.
   * @param {string} partitionIdOrAlias - ID or alias to check.
   * @returns {boolean} True if a connection is established.
   */
  isConnected(partitionIdOrAlias) {
    const partition = this._configuration.getPartition(partitionIdOrAlias);
    return partition ? this._connections.has(partition.id) : false;
  }

  /**
   * @description Returns physical IDs of all partitions with established connections.
   * @returns {string[]} Collection of connected partition identifiers.
   */
  getConnectedPartitions() {
    return Array.from(this._connections.keys());
  }

  /**
   * @description Returns an iterator for all active pooled connections.
   * @returns {IterableIterator<[string, DatabaseService]>} Map-style entries of [id, service].
   */
  getConnectionsEntries() {
    return this._connections.entries();
  }

  /**
   * @description Terminates a specific pooled connection and updates telemetry.
   * @param {string} partitionIdOrAlias - ID or alias of the connection to drop.
   * @returns {boolean} True if a connection was found and closed.
   */
  closePartition(partitionIdOrAlias) {
    const partition = this._configuration.getPartition(partitionIdOrAlias);

    if (!partition || !this._connections.has(partition.id)) {
      return false;
    }

    this._connections.delete(partition.id);
    this.updateStatistics(partition.id, 'disconnect');
    this._logger.debug?.(`Closed connection to partition: ${partition.id}`);
    return true;
  }

  /**
   * @description Closes all pooled connections and updates telemetry for each.
   * @returns {number} Total count of connections terminated.
   */
  closeAll() {
    const count = this._connections.size;
    for (const partitionId of this._connections.keys()) {
      this.updateStatistics(partitionId, 'disconnect');
    }
    this._connections.clear();
    this._logger.info?.(`Closed all ${count} partition connections`);
    return count;
  }

  /**
   * @description Aggregates telemetry data for all configured partitions.
   * @returns {Object<string, PartitionStatistics>} Map of partition IDs to their usage metrics.
   */
  getStatistics() {
    const stats = {};
    for (const [partitionId, partitionStats] of this._statistics.entries()) {
      stats[partitionId] = { ...partitionStats };
    }
    return stats;
  }

  /**
   * @description Retrieves telemetry for a specific partition.
   * @param {string} partitionIdOrAlias - Target identifier.
   * @returns {PartitionStatistics|null} Usage metrics or null if not registered.
   */
  getPartitionStatistics(partitionIdOrAlias) {
    const partition = this._configuration.getPartition(partitionIdOrAlias);
    if (!partition) return null;
    const stats = this._statistics.get(partition.id);
    return stats ? { ...stats } : null;
  }

  /**
   * @description Wipes telemetry metrics for all partitions, preserving connection status.
   */
  resetStatistics() {
    for (const partitionId of this._statistics.keys()) {
      const isConnected = this._connections.has(partitionId);
      this._statistics.set(partitionId, {
        queries: 0,
        hits: 0,
        misses: 0,
        lastAccess: isConnected ? new Date() : null,
        isConnected
      });
    }
  }

  /**
   * @description Records a lifecycle or operational event for a partition's telemetry.
   * @param {string} partitionId - Physical partition ID.
   * @param {'access'|'query'|'connect'|'disconnect'} event - Type of event to record.
   */
  updateStatistics(partitionId, event) {
    const stats = this._statistics.get(partitionId);
    if (!stats) return;

    switch (event) {
      case 'access':
      case 'query':
        stats.queries++;
        stats.lastAccess = new Date();
        break;
      case 'connect':
        stats.isConnected = true;
        stats.lastAccess = new Date();
        break;
      case 'disconnect':
        stats.isConnected = false;
        break;
    }
  }

  /**
   * @description Returns the total number of currently established pooled connections.
   * @type {number}
   * @readonly
   */
  get activeConnectionsCount() {
    return this._connections.size;
  }
}
