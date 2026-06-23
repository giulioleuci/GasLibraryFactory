/**
 * @file CoreUtilsLib/src/Result.js
 * @description Shared immutable-friendly outcome wrapper base class.
 *
 * Provides the common success/error value-object shape reused by domain result
 * types across libraries (e.g. ComposableContentLib BlockResult, PipelineFramework
 * PostProcessorResult), eliminating the duplicated `error`/predicate/serialization
 * boilerplate (F-1.4). Subclasses keep their own domain fields and factory names
 * and decide whether to `Object.freeze(this)` after construction.
 * @version 1.0.0
 */

/**
 * Base outcome wrapper. An outcome is considered successful when it carries no
 * error. Subclasses may layer additional semantics (explicit success flags,
 * frozen immutability, richer payloads) on top of this contract.
 *
 * @class Result
 */
export class Result {
  /**
   * @param {Object} [options={}] Initialization payload.
   * @param {*} [options.value=null] Success payload, when applicable.
   * @param {Error|null} [options.error=null] Failure cause, when applicable.
   */
  constructor({ value = null, error = null } = {}) {
    /**
     * Generic success payload.
     * @type {*}
     */
    this.value = value;

    /**
     * Failure cause, or null on success.
     * @type {Error|null}
     */
    this.error = error;
  }

  /**
   * @returns {boolean} True when no error is attached.
   */
  isSuccess() {
    return this.error === null;
  }

  /**
   * @returns {boolean} True when an error is attached.
   */
  isError() {
    return this.error !== null;
  }

  /**
   * @returns {Object} JSON-safe representation (errors reduced to their message).
   */
  toJSON() {
    return {
      success: this.isSuccess(),
      value: this.value,
      error: this.error ? (this.error.message != null ? this.error.message : String(this.error)) : null
    };
  }

  /**
   * @returns {string} Brief diagnostic status string.
   */
  toString() {
    return `Result[${this.isError() ? 'ERROR' : 'OK'}]`;
  }

  /**
   * @param {*} [value=null] Success payload.
   * @returns {Result} Success-state result.
   * @static
   */
  static ok(value = null) {
    return new Result({ value, error: null });
  }

  /**
   * @param {Error} error Failure cause.
   * @returns {Result} Failure-state result.
   * @static
   */
  static fail(error) {
    return new Result({ value: null, error });
  }

  /**
   * @returns {Result} Empty success-state result.
   * @static
   */
  static empty() {
    return new Result({ value: null, error: null });
  }
}
