/**
 * @fileoverview Error class for data transformation errors (Transform phase)
 * @author GasLibraryFactory
 */

import { ImportError } from './ImportError.js';

/**
 * Exception class for failures during the data transformation phase, capturing mapping errors, normalization failures, and expression evaluation exceptions.
 * @class
 * @extends ImportError
 */
class TransformError extends ImportError {
  /**
   * Initializes transform exception with diagnostic code and transformation context.
   * @param {string} message Descriptive error explanation.
   * @param {string} [code='TRANSFORM_ERROR'] Unique classification code.
   * @param {Object} [context={}] Metadata detailing the transformation failure (e.g., rowIndex, fieldName).
   */
  constructor(message, code = 'TRANSFORM_ERROR', context = {}) {
    super(message, code, context);
    this.name = 'TransformError';
  }
}

export { TransformError };
