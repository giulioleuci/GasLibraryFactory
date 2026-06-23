/**
 * @fileoverview Base error class for GasDataImporter library
 * @author GasLibraryFactory
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * Foundational error class for the ETL pipeline, providing structured diagnostic state including classification codes, contextual metadata, and occurrence timestamps.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 * @class
 * @extends BaseError
 */
class ImportError extends BaseError {
  /**
   * Initializes import error with diagnostic classification and contextual metadata.
   * @param {string} message Descriptive error explanation.
   * @param {string} [code='IMPORT_ERROR'] Unique classification identifier.
   * @param {Object} [context={}] Metadata detailing the failure environment.
   */
  constructor(message, code = 'IMPORT_ERROR', context = {}) {
    super(message, context);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'ImportError';
    this.code = code;
  }

  /**
   * Serializes the structured error state into a plain object for logging or diagnostic transmission.
   * @returns {Object} Serialized error state.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * Generates a readable summary of the error including classification and description.
   * @returns {string} Formatted error string ([name] CODE: message).
   */
  toString() {
    return `[${this.name}] ${this.code}: ${this.message}`;
  }
}

export { ImportError };
