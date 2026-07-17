/**
 * @file ContextEngine/src/errors/ContextEngineError.js
 * @description Base error class for context engine-related errors.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * Foundation error class for the ContextEngine hierarchy, providing structured metadata and error chaining.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 * @class
 * @extends BaseError
 */
export class ContextEngineError extends BaseError {
  /**
   * Initializes the error instance with an enriched context payload.
   * @param {string} message Descriptive error message.
   * @param {Object} [context={}] Metadata payload for diagnostics.
   * @param {string} [context.recipeName] Identifier of the executing recipe.
   * @param {string} [context.currentProvider] Identifier of the active provider.
   * @param {Error} [context.originalError] Upstream error instance for chaining.
   * @param {Object} [context.parameters] Arguments passed to the provider.
   * @param {string} [context.step] Pipeline stage (e.g., 'resolution', 'execution').
   */
  constructor(message, context = {}) {
    super(message, context);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'ContextEngineError';
  }

  /**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
  toString() {
    let message = `${this.name}: ${this.message}`;

    if (this.context && Object.keys(this.context).length > 0) {
      message += '\nContext: ' + JSON.stringify(this.context, null, 2);
    }

    return message;
  }
}
