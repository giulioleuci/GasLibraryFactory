/**
 * @file GasResilienceLib/src/handlers/ErrorReporter.js
 * @description Internal handler that tracks error statistics and provides analytics for error resilience.
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { PiiRedactor } from '@CoreUtilsLib';

export class ErrorReporter {
  /**
   * Maximum number of error entries to keep in session log.
   */
  static MAX_SESSION_ERRORS = 1000;

  /**
   * Sanitizes error messages to remove potential PII.
   */
  static _sanitizeMessage(message) {
    return PiiRedactor.redact(message);
  }

  constructor(logger) {
    if (!logger || typeof logger !== 'object') {
      throw new Error('ErrorReporter: logger is required and must be an object');
    }
    if (typeof logger.error !== 'function') {
      throw new Error('ErrorReporter: logger.error must be a function');
    }
    if (typeof logger.warn !== 'function') {
      throw new Error('ErrorReporter: logger.warn must be a function');
    }

    this._logger = logger;

    // Initialize state
    this._sessionErrors = [];
    this._counters = {
      total: 0,
      recovered: 0,
      notRecovered: 0,
      byType: {}
    };
  }

  /**
   * Resets accumulated error statistics and session history.
   */
  reset() {
    this._sessionErrors = [];
    this._counters = {
      total: 0,
      recovered: 0,
      notRecovered: 0,
      byType: {}
    };
  }

  /**
   * Records a FAILURE or RECOVERED event, updating counters and session history.
   * @param {Object} details Event details.
   * @param {string} details.type 'FAILURE' or 'RECOVERED'.
   * @param {string} details.operation Operation label.
   * @param {Object} [details.classification] Required for FAILURE type.
   * @param {number} [details.attempt] Required for RECOVERED type (>= 1).
   * @throws {Error} If details are missing/invalid for the given type.
   */
  record(details) {
    if (!details || typeof details !== 'object') {
      throw new Error('ErrorReporter.record: details must be an object');
    }
    if (!details.type || typeof details.type !== 'string') {
      throw new Error('ErrorReporter.record: details.type is required and must be a string');
    }
    if (!details.operation || typeof details.operation !== 'string') {
      throw new Error('ErrorReporter.record: details.operation is required and must be a string');
    }

    if (details.type === 'FAILURE') {
      if (!details.classification || typeof details.classification !== 'object') {
        throw new Error(
          'ErrorReporter.record: details.classification is required for FAILURE type'
        );
      }
      if (!details.classification.type || typeof details.classification.type !== 'string') {
        throw new Error('ErrorReporter.record: details.classification.type is required');
      }
    } else if (details.type === 'RECOVERED') {
      if (typeof details.attempt !== 'number' || details.attempt < 1) {
        throw new Error(
          'ErrorReporter.record: details.attempt is required for RECOVERED type and must be >= 1'
        );
      }
    } else {
      throw new Error(
        `ErrorReporter.record: invalid type "${details.type}". Must be "FAILURE" or "RECOVERED"`
      );
    }

    this._sessionErrors.push({
      timestamp: new Date(),
      ...details
    });

    const MAX_SESSION_ERRORS = this.constructor.MAX_SESSION_ERRORS || 1000;
    if (this._sessionErrors.length > MAX_SESSION_ERRORS) {
      this._sessionErrors.shift();
      this._logger.warn(
        `[MEMORY_LIMIT] Session error log exceeded ${MAX_SESSION_ERRORS} entries. ` +
          'Oldest entry removed. Counters remain accurate.'
      );
    }

    if (details.type === 'FAILURE') {
      this._counters.total++;
      this._counters.notRecovered++;
      const errorType = details.classification.type;
      this._counters.byType[errorType] = (this._counters.byType[errorType] || 0) + 1;
      const originalMessage = details.classification.originalMessage || 'Unknown error';
      const sanitizedMessage = this.constructor._sanitizeMessage(originalMessage);
      this._logger.error(`[FAILURE] ${details.operation}: ${sanitizedMessage}`);
    } else if (details.type === 'RECOVERED') {
      this._counters.total++;
      this._counters.recovered++;
      this._logger.warn(`[RECOVERED] ${details.operation} after ${details.attempt} attempts.`);
    }
  }

  /**
   * Gets the current error summary (counters and recovery rate).
   * @returns {Object} counters and recoveryRate.
   */
  getSummary() {
    const counters = this._counters;
    const recoveryRate =
      counters.total > 0 ? Math.round((counters.recovered / counters.total) * 100) : 100;

    return {
      counters: counters,
      recoveryRate
    };
  }
}
