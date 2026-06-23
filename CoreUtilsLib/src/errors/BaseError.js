/**
 * @file CoreUtilsLib/src/BaseError.js
 * @description Base error class providing standardized error handling across all libraries.
 * Eliminates duplicate stack trace capture and serialization code.
 * @version 1.0.0
 */

/**
 * Base standardized error class for all GasLibraryFactory custom exceptions.
 * @class BaseError
 * @extends Error
 */
export class BaseError extends Error {
  /**
   * Initialize BaseError with message, metadata context, and optional cause chaining.
   * @param {string} message - Error description.
   * @param {Object} [context={}] - Metadata for diagnostic tracking.
   * @param {Error} [originalError=null] - Upstream exception being wrapped.
   */
  constructor(message, context = {}, originalError = null) {
    super(message);

    /**
     * The name of the error class.
     * @type {string}
     */
    this.name = this.constructor.name;

    /**
     * Additional context/metadata for the error.
     * @type {Object}
     */
    this.context = context;

    /**
     * ISO timestamp when the error occurred.
     * @type {string}
     */
    this.timestamp = new Date().toISOString();

    /**
     * The original error that was caught (for error chaining).
     * @type {Error|null}
     */
    this.originalError = originalError;

    // Capture stack trace, excluding the constructor from the trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Gets the original error message if one exists.
   *
   * @returns {string|null} The original error message or null
   */
  get originalMessage() {
    return this.originalError ? this.originalError.message : null;
  }

  /**
   * Checks if this error wraps another error.
   *
   * @returns {boolean} True if an original error exists
   */
  get hasOriginalError() {
    return this.originalError !== null;
  }

  /**
   * Serialize error state to a plain object for logging or transport.
   * @returns {Object} JSON-compatible representation including name, message, context, and stack.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack
          }
        : null,
      stack: this.stack
    };
  }

  /**
   * Generate a formatted string including error type, message, and serialized context.
   * @returns {string} Human-readable error summary.
   */
  toString() {
    let result = `${this.name}: ${this.message}`;

    if (this.context && Object.keys(this.context).length > 0) {
      result += '\nContext: ' + JSON.stringify(this.context, null, 2);
    }

    if (this.originalError) {
      result += `\nCaused by: ${this.originalError.name}: ${this.originalError.message}`;
    }

    return result;
  }

  /**
   * Create a shallow clone of the error with additional merged metadata.
   * @param {Object} additionalContext - New metadata to append to existing context.
   * @returns {BaseError} New instance with updated context and preserved stack trace.
   */
  withContext(additionalContext) {
    const mergedContext = { ...this.context, ...additionalContext };
    const newError = new this.constructor(this.message, mergedContext, this.originalError);
    newError.stack = this.stack; // Preserve original stack
    return newError;
  }

  /**
   * Static factory method to wrap any error as a BaseError.
   *
   * If the error is already a BaseError, returns it unchanged.
   * Otherwise, wraps it in a new BaseError with the original as the cause.
   *
   * @param {Error|*} error - The error to wrap
   * @param {Object} [context={}] - Additional context to add
   * @returns {BaseError} A BaseError instance
   *
   * @example
   * try {
   *   riskyOperation();
   * } catch (error) {
   *   const wrapped = BaseError.wrap(error, { operation: 'riskyOperation' });
   *   logger.error(wrapped.toJSON());
   * }
   */
  static wrap(error, context = {}) {
    if (error instanceof BaseError) {
      return Object.keys(context).length > 0 ? error.withContext(context) : error;
    }

    // Handle non-Error throws
    if (!(error instanceof Error)) {
      return new BaseError(String(error), context);
    }

    return new BaseError(error.message, context, error);
  }
}

/**
 * Exception for parameter or schema validation failures.
 * @class ValidationError
 * @extends BaseError
 */
export class ValidationError extends BaseError {
  /**
   * Initialize ValidationError with specific field and value identifiers.
   * @param {string} message - Validation failure reason.
   * @param {string} [field=null] - Identifier of the invalid property.
   * @param {*} [value=undefined] - The value that failed validation.
   * @param {Object} [context={}] - Additional diagnostic metadata.
   */
  constructor(message, field = null, value = undefined, context = {}) {
    super(message, { ...context, field, value });
    this.field = field;
    this.value = value;
  }
}

/**
 * Exception for missing or malformed library/service configuration.
 * @class ConfigurationError
 * @extends BaseError
 */
export class ConfigurationError extends BaseError {
  /**
   * Initialize ConfigurationError with the problematic configuration key.
   * @param {string} message - Configuration failure reason.
   * @param {string} [configKey=null] - Identifier of the missing/invalid setting.
   * @param {Object} [context={}] - Additional diagnostic metadata.
   */
  constructor(message, configKey = null, context = {}) {
    super(message, { ...context, configKey });
    this.configKey = configKey;
  }
}

/**
 * Exception for failed functional operations with recovery indicators.
 * @class OperationError
 * @extends BaseError
 */
export class OperationError extends BaseError {
  /**
   * Initialize OperationError with operation type and recoverability flag.
   * @param {string} message - Operational failure reason.
   * @param {string} [operation=null] - Name of the failing functional process.
   * @param {boolean} [recoverable=true] - Flag indicating if retry or fallback is viable.
   * @param {Object} [context={}] - Additional diagnostic metadata.
   * @param {Error} [originalError=null] - Upstream exception being wrapped.
   */
  constructor(message, operation = null, recoverable = true, context = {}, originalError = null) {
    super(message, { ...context, operation, recoverable }, originalError);
    this.operation = operation;
    this.recoverable = recoverable;
  }
}
