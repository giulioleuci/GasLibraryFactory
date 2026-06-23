/**
 * @file PipelineFramework/src/postprocessor/PostProcessorResult.js
 * @description Result object returned by post-processor execution.
 * @version 1.0.0
 */

import { Result } from '@CoreUtilsLib';

/**
 * Detailed record of a single state modification performed by a post-processor.
 *
 * @typedef {Object} ChangeRecord
 * @property {string} type - Identifier for the change category (e.g., 'CELL_UPDATE', 'LOG_INSERT').
 * @property {string} target - Identifier of the resource modified (e.g., 'SheetName!A1').
 * @property {*} [oldValue] - State prior to modification.
 * @property {*} newValue - State after modification.
 */

/**
 * Standardized outcome container for post-processor execution.
 * Encapsulates success status, execution telemetry, and a chronological audit of state changes.
 *
 * @class PostProcessorResult
 * @extends Result
 *
 * @example
 * return PostProcessorResult.success('p1').addChange('UPDATE', 'cell', 'val');
 */
export class PostProcessorResult extends Result {
  /**
   * @param {Object} options - Result initialization parameters.
   * @param {boolean} options.success - True if the processor completed without fatal errors.
   * @param {string} options.processorId - Unique identifier of the originating processor.
   * @param {number} [options.duration=0] - Execution time in milliseconds.
   * @param {ChangeRecord[]} [options.changes=[]] - Chronological list of performed modifications.
   * @param {Error|null} [options.error=null] - Exception object if execution failed.
   * @param {Object} [options.metadata={}] - Diagnostic metadata.
   */
  constructor(options = {}) {
    // Initialize the shared Result base (sets this.error and this.value).
    super({ error: options.error || null });

    /**
     * Whether execution succeeded.
     * @type {boolean}
     */
    this.success = options.success === true;

    /**
     * Post-processor ID.
     * @type {string}
     */
    this.processorId = options.processorId || 'unknown';

    /**
     * Execution duration in milliseconds.
     * @type {number}
     */
    this.duration = options.duration || 0;

    /**
     * Record of changes made.
     * @type {ChangeRecord[]}
     */
    this.changes = options.changes || [];

    // Note: this.error is set by the Result base constructor above.

    /**
     * Additional metadata.
     * @type {Object}
     */
    this.metadata = options.metadata || {};
  }

  /**
   * Factory for positive outcomes.
   *
   * @param {string} processorId - Originating processor ID.
   * @param {ChangeRecord[]} [changes=[]] - List of recorded modifications.
   * @param {number} [duration=0] - Execution time in milliseconds.
   * @param {Object} [metadata={}] - Diagnostic metadata.
   * @returns {PostProcessorResult} Success-state result instance.
   */
  static success(processorId, changes = [], duration = 0, metadata = {}) {
    return new PostProcessorResult({
      success: true,
      processorId,
      changes,
      duration,
      metadata
    });
  }

  /**
   * Factory for error outcomes.
   *
   * @param {string} processorId - Originating processor ID.
   * @param {Error} error - Root cause exception.
   * @param {number} [duration=0] - Time elapsed before failure.
   * @param {Object} [metadata={}] - Diagnostic metadata.
   * @returns {PostProcessorResult} Failure-state result instance.
   */
  static failure(processorId, error, duration = 0, metadata = {}) {
    return new PostProcessorResult({
      success: false,
      processorId,
      error,
      duration,
      metadata
    });
  }

  /**
   * Factory for bypassed executions.
   *
   * @param {string} processorId - Originating processor ID.
   * @param {string} [reason='Condition not met'] - Justification for skipping.
   * @returns {PostProcessorResult} Success-state result marked as skipped.
   */
  static skipped(processorId, reason = 'Condition not met') {
    return new PostProcessorResult({
      success: true,
      processorId,
      duration: 0,
      metadata: { skipped: true, skipReason: reason }
    });
  }

  /**
   * @returns {boolean} True if the processor was bypassed during execution.
   */
  wasSkipped() {
    return this.metadata.skipped === true;
  }

  /**
   * Appends a modification record to the results audit trail.
   *
   * @param {string} type - Category of change.
   * @param {string} target - Identifier of modified resource.
   * @param {*} newValue - Final state.
   * @param {*} [oldValue] - Initial state.
   * @returns {PostProcessorResult} Current instance for chaining.
   */
  addChange(type, target, newValue, oldValue = undefined) {
    const change = { type, target, newValue };
    if (oldValue !== undefined) {
      change.oldValue = oldValue;
    }
    this.changes.push(change);
    return this;
  }

  /**
   * @returns {Object} High-level execution overview for reporting and logging.
   */
  getSummary() {
    return {
      processorId: this.processorId,
      success: this.success,
      skipped: this.wasSkipped(),
      duration: this.duration,
      changeCount: this.changes.length,
      error: this.error ? this.error.message : null
    };
  }

  /**
   * @returns {Object} Deep-cloned, serializable representation of the result.
   */
  toObject() {
    return {
      success: this.success,
      processorId: this.processorId,
      duration: this.duration,
      changes: [...this.changes],
      error: this.error ? { message: this.error.message, stack: this.error.stack } : null,
      metadata: { ...this.metadata }
    };
  }
}
