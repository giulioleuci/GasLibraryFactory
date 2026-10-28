/**
 * @file PipelineFramework/src/PipelineContext.js
 * @description Wrapper for shared context state with metadata tracking.
 * @version 1.0.0
 */

/**
 * Shared state container and telemetry tracker for pipeline executions.
 *
 * @description
 * Wraps a mutable data payload and maintains execution metadata, including step history,
 * timing, and graceful termination signals.
 *
 * @class
 */
import type { ContextMetadata } from './internal/contracts.js';

export class PipelineContext<Data extends object = Record<string, unknown>> {
  declare _data: Partial<Data>;
  declare _metadata: ContextMetadata;
  /**
   * @param {Object} [initialData={}] Starting context payload.
   * @throws {Error} If initialData is not an object or null.
   */
  constructor(initialData: Partial<Data> | null = {}) {
    if (initialData !== null && (typeof initialData !== 'object' || Array.isArray(initialData))) {
      throw new Error('PipelineContext: initialData must be an object or null');
    }

    this._data = initialData === null ? {} : { ...initialData };
    this._metadata = {
      startTime: Date.now(),
      endTime: null,
      stopRequested: false,
      stopReason: null,
      executionHistory: []
    };
  }

  /** @returns {Object} Raw underlying data reference. */
  getData() {
    return this._data;
  }

  /**
   * Retrieves a value from context.
   * @param {string} key Target key.
   * @param {*} [defaultValue=null] Value returned if key is missing.
   * @returns {*}
   * @throws {Error} If key is not a string.
   */
  get<K extends string, Fallback = null>(
    key: K,
    defaultValue?: Fallback
  ):
    | (K extends keyof Data ? Data[K] | undefined : unknown)
    | Exclude<Fallback, undefined>
    | (undefined extends Fallback ? null : never);
  get(key: string, defaultValue: unknown = null): unknown {
    if (typeof key !== 'string') {
      throw new Error('PipelineContext.get: key must be a string');
    }
    return Object.prototype.hasOwnProperty.call(this._data, key)
      ? (this._data as Record<string, unknown>)[key]
      : defaultValue;
  }

  /**
   * persists a value in context.
   * @param {string} key Target key.
   * @param {*} value Data to store.
   * @returns {PipelineContext} Current instance for chaining.
   * @throws {Error} If key is not a string.
   */
  set<K extends string>(key: K, value: K extends keyof Data ? Data[K] : unknown): this;
  set(key: string, value: unknown) {
    if (typeof key !== 'string') {
      throw new Error('PipelineContext.set: key must be a string');
    }
    (this._data as Record<string, unknown>)[key] = value;
    return this;
  }

  /**
   * Verifies key existence.
   * @param {string} key Target key.
   * @returns {boolean}
   * @throws {Error} If key is not a string.
   */
  has(key: string) {
    if (typeof key !== 'string') {
      throw new Error('PipelineContext.has: key must be a string');
    }
    return Object.prototype.hasOwnProperty.call(this._data, key);
  }

  /**
   * Triggers graceful pipeline termination.
   * @param {string} [reason=''] Diagnostic explanation for the stop.
   * @returns {PipelineContext} Current instance.
   */
  requestStop(reason = '') {
    this._metadata.stopRequested = true;
    this._metadata.stopReason = reason;
    return this;
  }

  /** @returns {boolean} True if requestStop() was invoked. */
  shouldStop() {
    return this._metadata.stopRequested;
  }

  /** @returns {string|null} */
  getStopReason() {
    return this._metadata.stopReason;
  }

  /**
   * Records step telemetry.
   * @private
   * @param {string} stepName Source step.
   * @param {string} status (completed|skipped|failed).
   * @param {number} durationMs Execution time.
   * @param {Object} [details={}] Supplemental metadata.
   * @returns {PipelineContext} Current instance.
   */
  recordStepExecution(
    stepName: string,
    status: string,
    durationMs: number,
    details: Record<string, unknown> = {}
  ) {
    this._metadata.executionHistory.push({
      stepName,
      status,
      durationMs,
      details,
      timestamp: Date.now()
    });
    return this;
  }

  /** @returns {Array<Object>} Chronological step execution logs. */
  getExecutionHistory() {
    return this._metadata.executionHistory;
  }

  /** @returns {Object} Raw metadata snapshot (startTime, stopRequested, etc.). */
  getMetadata() {
    return this._metadata;
  }

  /**
   * Finalizes execution timer.
   * @private
   * @returns {PipelineContext} Current instance.
   */
  markCompleted() {
    this._metadata.endTime = Date.now();
    return this;
  }

  /** @returns {number} Wall-clock duration in milliseconds. */
  getTotalDuration() {
    if (this._metadata.endTime === null) {
      return 0;
    }
    return this._metadata.endTime - this._metadata.startTime;
  }

  /**
   * Aggregates execution statistics and history.
   * @returns {{startTime: number, endTime: number, totalDuration: number, totalSteps: number, completedSteps: number, skippedSteps: number, failedSteps: number, stopRequested: boolean, stopReason: string|null, history: Array}}
   */
  getSummary() {
    const history = this._metadata.executionHistory;
    return {
      startTime: this._metadata.startTime,
      endTime: this._metadata.endTime,
      totalDuration: this.getTotalDuration(),
      totalSteps: history.length,
      completedSteps: history.filter((r) => r.status === 'completed').length,
      skippedSteps: history.filter((r) => r.status === 'skipped').length,
      failedSteps: history.filter((r) => r.status === 'failed').length,
      stopRequested: this._metadata.stopRequested,
      stopReason: this._metadata.stopReason,
      history: history
    };
  }
}
