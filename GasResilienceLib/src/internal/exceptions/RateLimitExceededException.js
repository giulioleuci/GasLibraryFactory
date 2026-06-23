// ===================================================================
// FILE: GasResilienceLib/src/exceptions/RateLimitExceededException.js
// ===================================================================

/**
 * Exception class for rate limit violations, signaling that an operation must be suspended and rescheduled due to excessive wait times.
 * @class
 * @extends Error
 */
export class RateLimitExceededException extends Error {
  /**
   * Initializes rate limit exception with operation context and required recovery duration.
   * @param {string} operationName identifier of the throttled task.
   * @param {number} requiredWaitMs Milliseconds to wait before retry is permitted.
   * @param {string} [message] Optional descriptive error message.
   */
  constructor(operationName, requiredWaitMs, message) {
    const defaultMessage = `Rate limit exceeded for operation '${operationName}'. Required wait time: ${requiredWaitMs}ms`;
    super(message || defaultMessage);

    /**
     * The name of this exception type.
     * @type {string}
     * @readonly
     */
    this.name = 'RateLimitExceededException';

    /**
     * The name of the operation that exceeded the rate limit.
     * @type {string}
     * @readonly
     */
    this.operationName = operationName;

    /**
     * The required wait time in milliseconds before the operation can proceed.
     * @type {number}
     * @readonly
     */
    this.requiredWaitMs = requiredWaitMs;
  }
}
