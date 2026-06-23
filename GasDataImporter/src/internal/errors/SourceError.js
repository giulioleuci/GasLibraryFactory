/**
 * @fileoverview Error class for data source extraction errors (Extract phase)
 * @author GasLibraryFactory
 */

import { ImportError } from './ImportError.js';

/**
 * Exception class for failures during the extraction phase, capturing file resolution errors, permission denials, and malformed source configurations.
 * @class
 * @extends ImportError
 */
class SourceError extends ImportError {
  /**
   * Initializes source exception with diagnostic code and extraction context.
   * @param {string} message Descriptive error explanation.
   * @param {string} [code='SOURCE_ERROR'] Unique classification code.
   * @param {Object} [context={}] Metadata detailing the extraction failure (e.g., sourceType, sheetId).
   */
  constructor(message, code = 'SOURCE_ERROR', context = {}) {
    super(message, code, context);
    this.name = 'SourceError';
  }
}

export { SourceError };
