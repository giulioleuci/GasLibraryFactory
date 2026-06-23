/**
 * @file ContextEngine/src/ContextInterceptor.js
 * @description Abstract base class for context interceptors.
 * @version 1.0.0
 */

/**
 * Abstract base class for context middleware/interceptor patterns.
 * Enables transparent transformation, enrichment, or substitution of provider results before UDC integration.
 * @class
 * @abstract
 */
export class ContextInterceptor {
  /**
   * Initializes the interceptor with a required logger service.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger) {
    // Validate inputs
    if (!logger || typeof logger !== 'object') {
      throw new Error('ContextInterceptor: logger is required and must be an object');
    }

    if (
      typeof logger.debug !== 'function' ||
      typeof logger.info !== 'function' ||
      typeof logger.warn !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error('ContextInterceptor: logger must have debug, info, warn, and error methods');
    }

    /**
     * Logger service.
     * @protected
     * @type {Object}
     */
    this._logger = logger;
  }

  /**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
  get logger() {
    return this._logger;
  }

  /**
   * Evaluates if interception should occur based on runtime state and provider metadata.
   * @param {string} name Provider name from recipe.
   * @param {*} data Provider result payload (after post-processing).
   * @param {Object} context Current partially assembled context.
   * @param {Object} options Runtime options passed to ContextAssembler.assemble().
   * @returns {boolean} True to activate interception, false to skip.
   * @protected
   */
  _shouldIntercept(_name, _data, _context, _options) {
    // Default: always intercept
    return true;
  }

  /**
   * Executes core interception logic. Must be implemented by subclasses.
   * @param {string} name Provider name from recipe.
   * @param {*} data Provider result payload.
   * @param {Object} context Current partially assembled context.
   * @param {Object} options Runtime options.
   * @returns {*} Modified data payload (type must match input data).
   * @throws {Error} If not implemented by subclass or logic fails.
   * @protected
   * @abstract
   * @example
   * // Swap Pattern: return { ...substitute, titular: data }
   * // Enrich Pattern: return { ...data, timestamp: Date.now() }
   */
  _performIntercept(_name, _data, _context, _options) {
    throw new Error('ContextInterceptor._performIntercept must be implemented by subclass');
  }

  /**
   * Primary entry point for provider result interception. Orchestrates conditional checks and error wrapping.
   * @param {string} name Provider name from recipe.
   * @param {*} data Provider result payload.
   * @param {Object} context Current assembled context.
   * @param {Object} [options={}] Runtime options.
   * @returns {*} Modified data if intercepted, original data if skipped.
   * @throws {Error} If inputs are invalid or _performIntercept fails.
   */
  intercept(name, data, context, options = {}) {
    // Validate inputs
    if (!name || typeof name !== 'string') {
      throw new Error('ContextInterceptor.intercept: name is required and must be a string');
    }

    if (context == null || typeof context !== 'object') {
      throw new Error('ContextInterceptor.intercept: context is required and must be an object');
    }

    if (options !== null && typeof options !== 'object') {
      throw new Error('ContextInterceptor.intercept: options must be an object or null');
    }

    try {
      // Check if interception should occur
      const shouldIntercept = this._shouldIntercept(name, data, context, options);

      if (!shouldIntercept) {
        this._logger.debug(`[${name}] Interceptor skipped (condition not met)`);
        return data;
      }

      // Perform interception
      this._logger.debug(`[${name}] Intercepting data...`);
      const startTime = Date.now();

      const modifiedData = this._performIntercept(name, data, context, options);

      const durationMs = Date.now() - startTime;
      this._logger.debug(`[${name}] Interception completed in ${durationMs}ms`);

      return modifiedData;
    } catch (error) {
      this._logger.error(`[${name}] Interception failed: ${error.message}`);
      throw new Error(`Interceptor failed for '${name}': ${error.message}`);
    }
  }
}

