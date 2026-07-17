/**
 * @file GoogleApiWrapper/src/core/ErrorHandler.js
 * @description Standardized error handling utilities for GoogleApiWrapper services.
 * GAW-H003: Provides consistent error handling patterns across all services.
 * @version 1.0
 */

import { LoggerService, BaseError } from '@CoreUtilsLib';

// =============================================================================
// ERROR CLASSES
// =============================================================================

/**
 * Base infrastructure error for GoogleApiWrapper services (L1).
 * High-density error structure preserving service identity, operation context, and original error chaining.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 *
 * @class
 * @extends BaseError
 * @property {string} name - Error type name (default: 'ServiceError').
 * @property {string} serviceName - Originating service identifier.
 * @property {string} operation - Failed method or operation name.
 * @property {Error|null} originalError - Chained error instance for root cause analysis.
 * @property {Object} context - Diagnostic metadata (IDs, params, state).
 * @property {string} timestamp - ISO 8601 timestamp of error occurrence.
 */
export class ServiceError extends BaseError {
  /**
   * Initializes ServiceError with full operation context and chained error.
   *
   * @param {string} message - Precise failure description.
   * @param {string} serviceName - Originating service name.
   * @param {string} operation - Failed method name.
   * @param {Error} [originalError=null] - Root cause instance.
   * @param {Object} [context={}] - Diagnostic metadata (e.g., { fileId: '...' }).
   */
  constructor(message, serviceName, operation, originalError = null, context = {}) {
    super(message, context, originalError);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'ServiceError';
    this.serviceName = serviceName;
    this.operation = operation;
  }

  /**
   * Transforms error into structured POJO for logging.
   *
   * @returns {Object} Structured error data { name, message, serviceName, operation, timestamp, context, originalError: { message, stack } | null }.
   */
  toLogObject() {
    return {
      name: this.name,
      message: this.message,
      serviceName: this.serviceName,
      operation: this.operation,
      timestamp: this.timestamp,
      context: this.context,
      originalError: this.originalError
        ? {
            message: this.originalError.message,
            stack: this.originalError.stack
          }
        : null
    };
  }
}

/**
 * Error for Google API quota/rate limit violations (L1).
 * Automatically classified from "User rate limit exceeded", "Quota exceeded", or 429 responses.
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'QuotaExceededError'.
 * @property {boolean} retryable - Always true.
 * @property {number} retryAfter - Default wait time (60000ms) before retry.
 */
export class QuotaExceededError extends ServiceError {
  /**
   * Initializes QuotaExceededError with retry metadata.
   *
   * @param {string} message - Violation description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} originalError - Root Google API error.
   * @param {Object} [context={}] - Metadata (e.g., quotaType, limits).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'QuotaExceededError';
    this.retryable = true;
    this.retryAfter = 60000; // Default: retry after 1 minute
  }
}

/**
 * Error for authorization or permission failures (L1).
 * Classified from "Permission denied", "Unauthorized" (401), or "Forbidden" (403).
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'PermissionDeniedError'.
 * @property {boolean} retryable - Always false.
 */
export class PermissionDeniedError extends ServiceError {
  /**
   * Initializes PermissionDeniedError.
   *
   * @param {string} message - Precise failure description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} originalError - Root Google API error.
   * @param {Object} [context={}] - Metadata (e.g., fileId, scopes).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'PermissionDeniedError';
    this.retryable = false;
  }
}

/**
 * Error for non-existent or deleted Google resources (L1).
 * Classified from "not found", "does not exist", or 404 responses.
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'ResourceNotFoundError'.
 * @property {boolean} retryable - Always false.
 */
export class ResourceNotFoundError extends ServiceError {
  /**
   * Initializes ResourceNotFoundError.
   *
   * @param {string} message - Precise failure description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} originalError - Root Google API error.
   * @param {Object} [context={}] - Metadata (e.g., resourceId, type).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'ResourceNotFoundError';
    this.retryable = false;
  }
}

/**
 * Error for temporary Google service outages or timeouts (L1).
 * Classified from "service unavailable", 503, 502, or "timeout" responses.
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'ServiceUnavailableError'.
 * @property {boolean} retryable - Always true.
 * @property {number} retryAfter - Default wait time (5000ms) before retry.
 */
export class ServiceUnavailableError extends ServiceError {
  /**
   * Initializes ServiceUnavailableError with retry metadata.
   *
   * @param {string} message - Service failure description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} originalError - Root Google API error.
   * @param {Object} [context={}] - Metadata (e.g., httpStatus, attemptNumber).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'ServiceUnavailableError';
    this.retryable = true;
    this.retryAfter = 5000; // Default: retry after 5 seconds
  }
}

/**
 * Error for input validation or business rule failures (L1).
 * Used for pre-flight checks, schema validation, or malformed data detection.
 *
 * @class
 * @extends ServiceError
 * @property {string} name - Always 'ValidationError'.
 * @property {boolean} retryable - Always false.
 */
export class ValidationError extends ServiceError {
  /**
   * Initializes ValidationError.
   *
   * @param {string} message - Validation failure description.
   * @param {string} serviceName - Originating service.
   * @param {string} operation - Failed operation.
   * @param {Error} [originalError=null] - Root cause (if any).
   * @param {Object} [context={}] - Metadata (e.g., parameterName, expectedType).
   */
  constructor(message, serviceName, operation, originalError, context) {
    super(message, serviceName, operation, originalError, context);
    this.name = 'ValidationError';
    this.retryable = false;
  }
}

// =============================================================================
// ERROR HANDLER UTILITY
// =============================================================================

/**
 * Standardized error handling, classification, and retry management for GoogleApiWrapper services (L1).
 * Implements exponential backoff and structured error mapping (GAW-H003).
 *
 * @class
 * @property {string} serviceName - Target service identity for error tagging.
 * @property {Object} logger - Logger instance for diagnostic output.
 */
export class ErrorHandler {
  /**
   * Initializes ErrorHandler for a specific service.
   *
   * @param {string} serviceName - Name of the service (e.g., 'DriveService').
   * @param {Object} logger - Logger instance with error/warn methods.
   */
  constructor(serviceName, logger) {
    this.serviceName = serviceName;
    this.logger = logger || new LoggerService();
  }

  /**
   * Classifies error and wraps in ServiceError subclass.
   * Priority: Quota (1) > Permission (2) > Resource (3) > Availability (4) > Default (5).
   *
   * @param {Error|string} error - Root error.
   * @param {string} operation - Failed operation name.
   * @param {Object} [context={}] - Diagnostic metadata.
   * @returns {ServiceError} Specialized error instance (QuotaExceededError, etc.).
   */
  classifyError(error, operation, context = {}) {
    const message = error.message || String(error);

    // Quota exceeded
    if (/quota|limit.*exceeded|too many requests/i.test(message)) {
      return new QuotaExceededError(message, this.serviceName, operation, error, context);
    }

    // Permission denied
    if (/permission.*denied|unauthorized|forbidden/i.test(message)) {
      return new PermissionDeniedError(message, this.serviceName, operation, error, context);
    }

    // Resource not found
    if (/not found|does not exist|404/i.test(message)) {
      return new ResourceNotFoundError(message, this.serviceName, operation, error, context);
    }

    // Service unavailable
    if (/service.*unavailable|503|502|timeout/i.test(message)) {
      return new ServiceUnavailableError(message, this.serviceName, operation, error, context);
    }

    // Default to generic ServiceError
    return new ServiceError(message, this.serviceName, operation, error, context);
  }

  /**
   * Executes callback and wraps any thrown error.
   *
   * @param {Function} func - Operation to execute.
   * @param {string} operation - Operation name for tagging.
   * @param {Object} [context={}] - Diagnostic metadata.
   * @returns {*} Callback result.
   * @throws {ServiceError} Classified error instance.
   */
  wrap(func, operation, context = {}) {
    try {
      return func();
    } catch (error) {
      const classifiedError = this.classifyError(error, operation, context);
      this.logger.error(
        `[${this.serviceName}] ${operation} failed:`,
        classifiedError.toLogObject()
      );
      throw classifiedError;
    }
  }

  /**
   * NOTE: Google Apps Script does not support async/await.
   * All operations in GAS are synchronous, so use the wrap() method instead.
   * This method has been removed as part of GRL-CRITICAL-001.
   */

  /**
   * Executes callback with exponential backoff retry logic.
   * Uses bitshift optimization (GAW-M003). Retries only QuotaExceededError and ServiceUnavailableError.
   *
   * @param {Function} func - Operation to execute.
   * @param {string} operation - Operation name for tagging.
   * @param {Object} [options={}] - Retry configuration.
   * @param {number} [options.maxAttempts=3] - Max execution attempts.
   * @param {number} [options.baseDelay=1000] - Initial delay in ms.
   * @param {Object} [options.context={}] - Diagnostic metadata.
   * @returns {*} Callback result.
   * @throws {ServiceError} Final error after all attempts fail.
   */
  withRetry(func, operation, options = {}) {
    const maxAttempts = options.maxAttempts || 3;
    const baseDelay = options.baseDelay || 1000;
    const context = options.context || {};

    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return func();
      } catch (error) {
        const classifiedError = this.classifyError(error, operation, context);
        lastError = classifiedError;

        // Don't retry if error is not retryable
        if (!classifiedError.retryable || attempt === maxAttempts) {
          this.logger.error(
            `[${this.serviceName}] ${operation} failed after ${attempt} attempts:`,
            classifiedError.toLogObject()
          );
          throw classifiedError;
        }

        // Calculate retry delay with exponential backoff
        // GAW-M003: Use bitshift instead of Math.pow for performance
        const retryDelay = classifiedError.retryAfter || baseDelay * (1 << (attempt - 1));
        this.logger.warn(
          `[${this.serviceName}] ${operation} failed (attempt ${attempt}/${maxAttempts}), retrying in ${retryDelay}ms...`
        );

        Utilities.sleep(retryDelay);
      }
    }

    throw lastError;
  }
}

// Export for use in services
