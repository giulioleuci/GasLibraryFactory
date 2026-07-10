/**
 * @file ContextEngine/src/ContextInterceptor.js
 * @description Abstract base class for context interceptors.
 * @version 1.0.0
 */

import { get } from '@CoreUtilsLib';

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

  /**
   * Walks an array nested inside `data` at `path` (a dot-path string resolved
   * via CoreUtilsLib's `get`, lodash-compatible) and applies a per-item
   * decision to each element. This generalizes the "one atomic swap" model
   * (a single `_performIntercept` deciding for the whole `data` payload) to
   * "independent per-item decisions inside a nested array" — needed by
   * consumers whose `data` is one shared, deeply nested object (e.g. a CDU)
   * containing arrays that must be walked and decided on item-by-item.
   *
   * `itemFn(item, index, array)` may either:
   *  - mutate `item` in place and return `undefined`/`null` (no further
   *    action taken by this helper — the mutation already happened); or
   *  - return a 3-way outcome descriptor the helper applies itself:
   *    - `{ action: 'replace', value }` → `array[index] = value`
   *    - `{ action: 'annotate', meta }` → `Object.assign(array[index], meta)`
   *    - `{ action: 'skip' }` → no-op (equivalent to returning `null`)
   *
   * No-op (with a debug log) if `path` does not resolve to an array on `data`.
   *
   * @param {Object} data The object to resolve `path` against.
   * @param {string} path Dot-path string (e.g. `'focus.classe.consiglioDiClasse'`).
   * @param {Function} itemFn `(item, index, array) => undefined|null|{action, value?, meta?}`.
   * @protected
   */
  _forEachAt(data, path, itemFn) {
    const array = get(data, path);

    if (!Array.isArray(array)) {
      this._logger.debug(
        `ContextInterceptor._forEachAt: path '${path}' does not resolve to an array - no-op`
      );
      return;
    }

    array.forEach((item, index) => {
      const outcome = itemFn(item, index, array);

      if (outcome == null) {
        // undefined: itemFn mutated item in place. null: explicit no-op.
        return;
      }

      switch (outcome.action) {
        case 'replace':
          array[index] = outcome.value;
          break;
        case 'annotate':
          Object.assign(array[index], outcome.meta);
          break;
        case 'skip':
        default:
          break;
      }
    });
  }
}
