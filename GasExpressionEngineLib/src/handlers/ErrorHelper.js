// ===================================================================
// FILE: GasExpressionEngineLib/src/ErrorHelper.js
// ===================================================================

/**
 * Static factory for standardized error object generation, enforcing consistent diagnostic message patterns across the expression engine.
 * @class
 */
export class ErrorHelper {
  /**
   * Generates a basic structured error with component and type classification.
   * @param {string} component Name of the failing module.
   * @param {string} errorType Classification of the failure.
   * @param {string} [details] Optional explanatory metadata.
   * @returns {Error} Formatted Error instance.
   */
  static create(component, errorType, details) {
    let message = `[${component}] ${errorType}`;
    if (details) {
      message += `: ${details}`;
    }
    return new Error(message);
  }

  /**
   * Generates a parsing error including the problematic value and its source offset.
   * @param {string} component Name of the failing module.
   * @param {string} errorType Classification of the failure.
   * @param {string|number} value The literal token that triggered the error.
   * @param {number} position Zero-based source character offset.
   * @returns {Error} Formatted Error instance.
   */
  static createWithPosition(component, errorType, value, position) {
    const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
    const message = `[${component}] ${errorType}: ${valueStr} at position ${position}`;
    return new Error(message);
  }

  /**
   * Generates a parameter validation error specifying the expected contract.
   * @param {string} component Name of the failing module.
   * @param {string} paramName Identifier of the malformed argument.
   * @param {string} expectedType Description of the required type or interface.
   * @returns {Error} Formatted Error instance.
   */
  static createValidation(component, paramName, expectedType) {
    const message = `[${component}] Invalid parameter '${paramName}': must be ${expectedType}`;
    return new Error(message);
  }

  /**
   * Generates an error for operations or tokens that lack a corresponding engine implementation.
   * @param {string} component Name of the failing module.
   * @param {string} operation Identifier of the requested logic.
   * @param {string} value The specific value that is unsupported.
   * @returns {Error} Formatted Error instance.
   */
  static createUnsupported(component, operation, value) {
    const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
    const message = `[${component}] Unsupported ${operation}: ${valueStr}`;
    return new Error(message);
  }

  /**
   * Generates an error when a numeric threshold (e.g., recursion depth, string length) is violated.
   * @param {string} component Name of the failing module.
   * @param {string} limitType Description of the threshold category.
   * @param {number} actual The observed runtime value.
   * @param {number} max The strictly enforced maximum limit.
   * @returns {Error} Formatted Error instance.
   */
  static createLimitExceeded(component, limitType, actual, max) {
    const message = `[${component}] Limit exceeded: ${limitType} is ${actual} (maximum: ${max})`;
    return new Error(message);
  }
}
