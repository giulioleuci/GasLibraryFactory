// ===================================================================
// FILE: GasResilienceLib/src/exceptions/TimeoutException.js
// ===================================================================

/**
 * Exception class for execution time violations, categorized as non-recoverable within the current runtime context.
 * @class
 * @extends Error
 */
export class TimeoutException extends Error {
  /**
   * Initializes timeout exception with descriptive failure context.
   * @param {string} [message='Timeout exceeded'] explanation of the temporal threshold violation.
   */
  constructor(message = 'Timeout exceeded') {
    super(message);

    /**
     * The name of this exception type.
     * @type {string}
     * @readonly
     */
    this.name = 'TimeoutException';
  }
}
