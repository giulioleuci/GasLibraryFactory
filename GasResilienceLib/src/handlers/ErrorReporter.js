/**
 * @file GasResilienceLib/src/handlers/ErrorReporter.js
 * @description Internal handler that tracks error statistics and provides analytics for error resilience.
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { PiiRedactor } from '@CoreUtilsLib';
import { ErrorReporterRecorder } from './internal/ErrorReporterRecorder.js';
import { ErrorReporterStatistics } from './internal/ErrorReporterStatistics.js';
import { ErrorReporterSanitizer } from './internal/ErrorReporterSanitizer.js';

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

    // Initialize managers
    this._recorder = new ErrorReporterRecorder(this);
    this._statistics = new ErrorReporterStatistics(this);
    this._sanitizer = new ErrorReporterSanitizer(this);

    // Delegate methods
    this._delegate([
      {
        manager: this._recorder,
        methods: ['reset', 'record']
      },
      {
        manager: this._statistics,
        methods: ['getSummary']
      },
      {
        manager: this._sanitizer,
        methods: ['_parseStackTrace']
      }
    ]);
  }

  _delegate(delegations) {
    delegations.forEach(({ manager, methods }) => {
      methods.forEach(method => {
        if (typeof manager[method] === 'function') {
          this[method] = manager[method].bind(manager);
        }
      });
    });
  }
}
