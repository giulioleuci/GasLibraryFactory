/**
 * @file CoreUtilsLib/src/LoggerService.js
 * @description Advanced logging service with configurable log levels.
 * Provides structured logging with level-based filtering.
 * @version 2.0 - Moved to CoreUtilsLib (foundation layer).
 */

/**
 * Hierarchical logging service with structured output and lazy evaluation.
 * @class LoggerService
 */
export class LoggerService {
  /**
   * Initialize LoggerService with configurable verbosity.
   * @param {Object} [options={}] - Configuration payload.
   * @param {string} [options.level='INFO'] - Filter threshold: OFF, ERROR, WARN, INFO, DEBUG.
   */
  constructor(options = {}) {
    /**
     * Current log level.
     * @private
     * @type {string}
     */
    this._level = options.level || 'INFO';

    /**
     * Log level hierarchy mapping.
     * Lower numbers mean higher priority (less verbose).
     * @private
     * @type {Object.<string, number>}
     */
    this._logLevels = {
      OFF: 0,
      ERROR: 1,
      WARN: 2,
      INFO: 3,
      DEBUG: 4
    };
  }

  /**
   * Update the active logging threshold.
   * @param {string} level - New filter threshold identifier.
   * @returns {LoggerService} Fluent instance for chaining.
   */
  setLevel(level) {
    if (this._logLevels[level] !== undefined) {
      this._level = level;
    }
    return this;
  }

  /**
   * Retrieve the current logging threshold.
   * @returns {string} Threshold identifier.
   */
  getLevel() {
    return this._level;
  }

  /**
   * Validate if a specific threshold is eligible for logging.
   * @private
   * @param {string} level - Level to test.
   * @returns {boolean} True if the level meets the active threshold.
   */
  _isLevelActive(level) {
    return this._logLevels[level] <= this._logLevels[this._level];
  }

  /**
   * Safely serialize an object with circular reference and depth protection.
   * @private
   * @param {*} obj - Payload to stringify.
   * @param {number} [maxDepth=5] - Recursion limit.
   * @param {number} [maxLength=5000] - Output character limit.
   * @returns {string} JSON-formatted string with truncation markers.
   */
  _safeStringify(obj, maxDepth = 5, maxLength = 5000) {
    const seen = new WeakSet();

    const replacer = (key, value, depth = 0) => {
      // Depth limit protection
      if (depth > maxDepth) {
        return '[Max depth reached]';
      }

      // Handle null and primitives
      if (value === null || typeof value !== 'object') {
        return value;
      }

      // Circular reference protection
      if (seen.has(value)) {
        return '[Circular reference]';
      }
      seen.add(value);

      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length > 100) {
          return `[Array(${value.length}) - showing first 100]`;
        }
        return value.map((item) => replacer(null, item, depth + 1));
      }

      // Handle objects
      const keys = Object.keys(value);
      if (keys.length > 50) {
        return `[Object with ${keys.length} keys - truncated]`;
      }

      const result = {};
      for (const k of keys) {
        try {
          result[k] = replacer(k, value[k], depth + 1);
        } catch (_e) {
          result[k] = '[Error accessing property]';
        }
      }
      return result;
    };

    try {
      let result = JSON.stringify(replacer(null, obj, 0), null, 2);

      // Truncate if too long
      if (result.length > maxLength) {
        result = result.substring(0, maxLength) + '... [truncated]';
      }

      return result;
    } catch (e) {
      return `[Error stringifying object: ${e.message}]`;
    }
  }

  /**
   * Resolve a message or execute a lazy-evaluation callback.
   * @private
   * @param {string|Object|Function} messageOrCallback - Static payload or generator.
   * @returns {string|Object} Evaluated content.
   */
  _evaluateMessage(messageOrCallback) {
    if (typeof messageOrCallback === 'function') {
      return messageOrCallback();
    }
    return messageOrCallback;
  }

  /**
   * Compose a formatted log entry string.
   * @private
   * @param {string} level - Threshold identifier.
   * @param {string|Object} message - Evaluated content.
   * @param {Object} [context=null] - Optional diagnostic metadata.
   * @returns {string} Standardized log line.
   */
  _formatMessage(level, message, context = null) {
    let formattedMessage = `[${level}]`;

    if (typeof message === 'object') {
      formattedMessage += ' ' + this._safeStringify(message);
    } else {
      formattedMessage += ' ' + message;
    }

    // Append context if provided
    if (context && typeof context === 'object') {
      formattedMessage += ' ' + this._safeStringify(context);
    }

    return formattedMessage;
  }

  /**
   * Log a DEBUG message with optional context and lazy evaluation.
   * @param {string|Object|Function} message - Content or callback.
   * @param {Object|Function} [context=null] - Metadata or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
  debug(message, context = null) {
    if (!this._isLevelActive('DEBUG')) {
      return this;
    }
    const evaluatedMessage = this._evaluateMessage(message);
    const evaluatedContext = context !== null ? this._evaluateMessage(context) : null;
    Logger.log(this._formatMessage('DEBUG', evaluatedMessage, evaluatedContext));
    return this;
  }

  /**
   * Log an INFO message with optional context and lazy evaluation.
   * @param {string|Object|Function} message - Content or callback.
   * @param {Object|Function} [context=null] - Metadata or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
  info(message, context = null) {
    if (!this._isLevelActive('INFO')) {
      return this;
    }
    const evaluatedMessage = this._evaluateMessage(message);
    const evaluatedContext = context !== null ? this._evaluateMessage(context) : null;
    Logger.log(this._formatMessage('INFO', evaluatedMessage, evaluatedContext));
    return this;
  }

  /**
   * Log a WARN message with optional context and lazy evaluation.
   * @param {string|Object|Function} message - Content or callback.
   * @param {Object|Function} [context=null] - Metadata or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
  warn(message, context = null) {
    if (!this._isLevelActive('WARN')) {
      return this;
    }
    const evaluatedMessage = this._evaluateMessage(message);
    const evaluatedContext = context !== null ? this._evaluateMessage(context) : null;
    Logger.log(this._formatMessage('WARN', evaluatedMessage, evaluatedContext));
    return this;
  }

  /**
   * Log an ERROR message with optional context and lazy evaluation.
   * @param {string|Object|Function} message - Content or callback.
   * @param {Object|Function} [context=null] - Metadata or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
  error(message, context = null) {
    if (!this._isLevelActive('ERROR')) {
      return this;
    }
    const evaluatedMessage = this._evaluateMessage(message);
    const evaluatedContext = context !== null ? this._evaluateMessage(context) : null;
    Logger.log(this._formatMessage('ERROR', evaluatedMessage, evaluatedContext));
    return this;
  }

  /**
   * Extract all buffered messages from the global GAS Logger.
   * @returns {string[]} Ordered collection of log entries.
   */
  get() {
    return Logger.getLog().split('\n');
  }

  /**
   * Purge all buffered messages from the global GAS Logger.
   * @returns {LoggerService} Fluent instance for chaining.
   */
  clear() {
    Logger.clear();
    return this;
  }

  /**
   * Log a message at a dynamic threshold level.
   * @param {string} level - Priority threshold for this entry.
   * @param {string|Object|Function} message - Content or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
  log(level, message) {
    const upperLevel = level.toUpperCase();
    if (this._logLevels[upperLevel] === undefined || !this._isLevelActive(upperLevel)) {
      return this;
    }
    const evaluatedMessage = this._evaluateMessage(message);
    Logger.log(this._formatMessage(upperLevel, evaluatedMessage));
    return this;
  }

  /**
   * Spawn a namespaced logger with a message prefix.
   * @param {string} prefix - Namespace identifier.
   * @returns {Object} Proxy object with level-specific logging methods.
   */
  child(prefix) {
    const parentLogger = this;
    return {
      debug: (msg) => {
        if (typeof msg === 'function') {
          return parentLogger.debug(() => `[${prefix}] ${msg()}`);
        }
        return parentLogger.debug(`[${prefix}] ${msg}`);
      },
      info: (msg) => {
        if (typeof msg === 'function') {
          return parentLogger.info(() => `[${prefix}] ${msg()}`);
        }
        return parentLogger.info(`[${prefix}] ${msg}`);
      },
      warn: (msg) => {
        if (typeof msg === 'function') {
          return parentLogger.warn(() => `[${prefix}] ${msg()}`);
        }
        return parentLogger.warn(`[${prefix}] ${msg}`);
      },
      error: (msg) => {
        if (typeof msg === 'function') {
          return parentLogger.error(() => `[${prefix}] ${msg()}`);
        }
        return parentLogger.error(`[${prefix}] ${msg}`);
      },
      log: (level, msg) => {
        if (typeof msg === 'function') {
          return parentLogger.log(level, () => `[${prefix}] ${msg()}`);
        }
        return parentLogger.log(level, `[${prefix}] ${msg}`);
      }
    };
  }
}
