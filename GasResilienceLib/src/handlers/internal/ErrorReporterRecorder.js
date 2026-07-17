/**
 * @file GasResilienceLib/src/handlers/managers/ErrorReporterRecorder.js
 * @description Manager for recording error events and managing session history.
 */

export class ErrorReporterRecorder {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
  }

  reset() {
    this.facade._sessionErrors = [];
    this.facade._counters = {
      total: 0,
      recovered: 0,
      notRecovered: 0,
      byType: {}
    };
  }

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

    this.facade._sessionErrors.push({
      timestamp: new Date(),
      ...details
    });

    const MAX_SESSION_ERRORS = this.facade.constructor.MAX_SESSION_ERRORS || 1000;
    if (this.facade._sessionErrors.length > MAX_SESSION_ERRORS) {
      this.facade._sessionErrors.shift();
      this._logger.warn(
        `[MEMORY_LIMIT] Session error log exceeded ${MAX_SESSION_ERRORS} entries. ` +
          'Oldest entry removed. Counters remain accurate.'
      );
    }

    if (details.type === 'FAILURE') {
      this.facade._counters.total++;
      this.facade._counters.notRecovered++;
      const errorType = details.classification.type;
      this.facade._counters.byType[errorType] = (this.facade._counters.byType[errorType] || 0) + 1;
      const originalMessage = details.classification.originalMessage || 'Unknown error';
      const sanitizedMessage = this.facade.constructor._sanitizeMessage(originalMessage);
      this._logger.error(`[FAILURE] ${details.operation}: ${sanitizedMessage}`);
    } else if (details.type === 'RECOVERED') {
      this.facade._counters.total++;
      this.facade._counters.recovered++;
      this._logger.warn(`[RECOVERED] ${details.operation} after ${details.attempt} attempts.`);
    }
  }
}
