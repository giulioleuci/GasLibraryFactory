/**
 * @file SheetDBLib/src/multi/MultiDatabaseError.js
 * @description Error classes for MultiDatabase extension.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * @class MultiDatabaseError
 * @extends BaseError
 * @description Base error class for all multi-database operations.
 * Includes standardized details and timestamp for debugging across partition operations.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 */
export class MultiDatabaseError extends BaseError {
  /**
   * @param {string} message - Descriptive error message.
   * @param {Object} [details={}] - Arbitrary metadata for error context.
   */
  constructor(message, details = {}) {
    super(message, details);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'MultiDatabaseError';
    this.details = details;
  }
}

/**
 * @class PartitionNotFoundError
 * @extends MultiDatabaseError
 * @description Thrown when an operation targets a partition ID not present in the current configuration.
 */
export class PartitionNotFoundError extends MultiDatabaseError {
  /**
   * @param {string} partitionId - The identifier of the missing partition.
   */
  constructor(partitionId) {
    super(`Partition not found: ${partitionId}`, { partitionId });
    this.name = 'PartitionNotFoundError';
    this.partitionId = partitionId;
  }
}

/**
 * @class PartitionConnectionError
 * @extends MultiDatabaseError
 * @description Thrown when the MultiDatabaseManager fails to establish a connection to a specific partition.
 */
export class PartitionConnectionError extends MultiDatabaseError {
  /**
   * @param {string} partitionId - The identifier of the partition that failed to connect.
   * @param {Error} cause - The underlying exception triggered during the connection attempt.
   */
  constructor(partitionId, cause) {
    super(`Failed to connect to partition: ${partitionId}`, {
      partitionId,
      cause: cause?.message || String(cause)
    });
    this.name = 'PartitionConnectionError';
    this.partitionId = partitionId;
    this.cause = cause;
  }
}

/**
 * @class ReadOnlyPartitionError
 * @extends MultiDatabaseError
 * @description Thrown when a write operation is attempted on a partition explicitly marked as read-only.
 */
export class ReadOnlyPartitionError extends MultiDatabaseError {
  /**
   * @param {string} partitionId - The identifier of the read-only partition.
   * @param {string} operation - The type of write operation attempted (e.g., insert, update, delete).
   */
  constructor(partitionId, operation) {
    super(`Cannot perform ${operation} on read-only partition: ${partitionId}`, {
      partitionId,
      operation
    });
    this.name = 'ReadOnlyPartitionError';
    this.partitionId = partitionId;
    this.operation = operation;
  }
}

/**
 * @class CrossPartitionQueryError
 * @extends MultiDatabaseError
 * @description Thrown when a distributed query fails, aggregating individual errors from multiple partitions.
 */
export class CrossPartitionQueryError extends MultiDatabaseError {
  /**
   * @param {string} message - Summary error message.
   * @param {Map<string, Error>} [partitionErrors=new Map()] - Map of partition IDs to their specific query errors.
   */
  constructor(message, partitionErrors = new Map()) {
    super(message, {
      partitionErrors: Object.fromEntries(
        Array.from(partitionErrors.entries()).map(([k, v]) => [k, v.message])
      )
    });
    this.name = 'CrossPartitionQueryError';
    this.partitionErrors = partitionErrors;
  }
}

/**
 * @class CrossPartitionDisabledError
 * @extends MultiDatabaseError
 * @description Thrown when a cross-partition query is initiated while the feature is disabled in the configuration.
 */
export class CrossPartitionDisabledError extends MultiDatabaseError {
  /**
   * @description Creates a new CrossPartitionDisabledError.
   */
  constructor() {
    super('Cross-partition queries are disabled in configuration');
    this.name = 'CrossPartitionDisabledError';
  }
}
