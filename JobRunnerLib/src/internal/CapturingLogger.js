import { HtmlSanitizer } from '@CoreUtilsLib';

/**
 * @file JobRunnerLib/src/CapturingLogger.js
 * @description Proxy logger that captures all log messages while forwarding to a real logger
 * @version 1.0 - Initial implementation
 */

/**
 * Transparent proxy logger that captures and buffers log messages for post-execution analysis.
 *
 * @description
 * Intercepts all log calls (debug, info, warn, error), stores them in a memory buffer with timestamps
 * and levels, and forwards them to an underlying LoggerService. Optimized for background job logging
 * and UI replay.
 *
 * @class
 */
export class CapturingLogger {
  /**
   * @param {Object} realLogger Underlying logger instance (must implement debug, info, warn, error).
   * @param {number} [maxBufferSize=1000] Maximum number of entries before oldest are evicted (FIFO).
   * @throws {Error} If realLogger is null or lacks required logging methods.
   * @throws {Error} If maxBufferSize is not a positive number.
   */
  constructor(realLogger, maxBufferSize = 1000) {
    // Validate realLogger
    if (!realLogger) {
      throw new Error('CapturingLogger: realLogger is required');
    }

    const requiredMethods = ['debug', 'info', 'warn', 'error'];
    for (const method of requiredMethods) {
      if (typeof realLogger[method] !== 'function') {
        throw new Error(`CapturingLogger: realLogger must have method: ${method}`);
      }
    }

    // Validate maxBufferSize
    if (typeof maxBufferSize !== 'number' || maxBufferSize <= 0) {
      throw new Error('CapturingLogger: maxBufferSize must be a positive number');
    }

    /**
     * The underlying logger to forward calls to
     * @private
     * @type {Object}
     */
    this._realLogger = realLogger;

    /**
     * Maximum number of log entries to keep in buffer
     * @private
     * @type {number}
     */
    this._maxBufferSize = maxBufferSize;

    /**
     * Captured log entries
     * @private
     * @type {Array<{level: string, timestamp: Date, message: string, context: Object}>}
     */
    this._capturedLogs = [];
  }

  /**
   * Internal buffer ingestion and eviction logic.
   * @private
   * @param {string} level Log level identifier (DEBUG|INFO|WARN|ERROR).
   * @param {string} message Formatted log message string.
   * @param {Object} [context=null] Metadata object associated with the log entry.
   */
  _capture(level, message, context = null) {
    // Capture the log entry
    const entry = {
      level: level,
      timestamp: new Date(),
      message: message,
      context: context
    };

    this._capturedLogs.push(entry);

    // Trim buffer if needed (FIFO)
    if (this._capturedLogs.length > this._maxBufferSize) {
      this._capturedLogs.shift(); // Remove oldest entry
    }
  }

  // ===================================================================
  // LOGGER INTERFACE IMPLEMENTATION (PROXY METHODS)
  // ===================================================================

  /**
   * Proxies and captures DEBUG message.
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
  debug(message, context = null) {
    // Evaluate if message or context are functions (lazy evaluation)
    const evaluatedMessage = typeof message === 'function' ? message() : message;
    const evaluatedContext = context && typeof context === 'function' ? context() : context;

    // Convert to string if needed
    const messageStr =
      typeof evaluatedMessage === 'object'
        ? JSON.stringify(evaluatedMessage)
        : String(evaluatedMessage);

    // Capture
    this._capture('DEBUG', messageStr, evaluatedContext);

    // Forward to real logger
    this._realLogger.debug(message, context);

    return this;
  }

  /**
   * Proxies and captures INFO message.
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
  info(message, context = null) {
    const evaluatedMessage = typeof message === 'function' ? message() : message;
    const evaluatedContext = context && typeof context === 'function' ? context() : context;

    const messageStr =
      typeof evaluatedMessage === 'object'
        ? JSON.stringify(evaluatedMessage)
        : String(evaluatedMessage);

    this._capture('INFO', messageStr, evaluatedContext);
    this._realLogger.info(message, context);

    return this;
  }

  /**
   * Proxies and captures WARN message.
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
  warn(message, context = null) {
    const evaluatedMessage = typeof message === 'function' ? message() : message;
    const evaluatedContext = context && typeof context === 'function' ? context() : context;

    const messageStr =
      typeof evaluatedMessage === 'object'
        ? JSON.stringify(evaluatedMessage)
        : String(evaluatedMessage);

    this._capture('WARN', messageStr, evaluatedContext);
    this._realLogger.warn(message, context);

    return this;
  }

  /**
   * Proxies and captures ERROR message.
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
  error(message, context = null) {
    const evaluatedMessage = typeof message === 'function' ? message() : message;
    const evaluatedContext = context && typeof context === 'function' ? context() : context;

    const messageStr =
      typeof evaluatedMessage === 'object'
        ? JSON.stringify(evaluatedMessage)
        : String(evaluatedMessage);

    this._capture('ERROR', messageStr, evaluatedContext);
    this._realLogger.error(message, context);

    return this;
  }

  /**
   * Programmatic log entry capture and proxying.
   * @param {string} level Log level identifier.
   * @param {string|Object|Function} message Log message or evaluator.
   * @returns {CapturingLogger} Current instance for chaining.
   */
  log(level, message) {
    const evaluatedMessage = typeof message === 'function' ? message() : message;

    const messageStr =
      typeof evaluatedMessage === 'object'
        ? JSON.stringify(evaluatedMessage)
        : String(evaluatedMessage);

    this._capture(level.toUpperCase(), messageStr, null);
    this._realLogger.log(level, message);

    return this;
  }

  _semantic(method, args, level, message, status) {
    this._capture(level, message, { method, status });
    if (typeof this._realLogger[method] === 'function') {
      this._realLogger[method](...args);
    } else {
      this._realLogger[level.toLowerCase()](message);
    }
    return this;
  }

  _withoutTrailingUndefined(args) {
    const result = args.slice();
    while (result.length && result[result.length - 1] === undefined) result.pop();
    return result;
  }

  logJobStart(jobName, jobType) {
    const args = [jobName, jobType];
    return this._semantic(
      'logJobStart',
      args,
      'INFO',
      `Job '${jobName}' started (${jobType})`,
      'INIT'
    );
  }

  logJobResume(jobName, jobType, details) {
    const args = this._withoutTrailingUndefined([jobName, jobType, details]);
    return this._semantic(
      'logJobResume',
      args,
      'INFO',
      `Job resume: ${jobName} (${jobType})`,
      'RESUME'
    );
  }

  logJobEnd(jobName, isSuccess, details) {
    const args = this._withoutTrailingUndefined([jobName, isSuccess, details]);
    const status = isSuccess ? 'COMPLETED' : 'FAILED';
    return this._semantic(
      'logJobEnd',
      args,
      isSuccess ? 'INFO' : 'ERROR',
      `Job end: ${jobName} (${status})`,
      status
    );
  }

  logJobSuspended(jobName, details) {
    const args = this._withoutTrailingUndefined([jobName, details]);
    return this._semantic(
      'logJobSuspended',
      args,
      'WARN',
      `Job suspended: ${jobName}`,
      'SUSPENDED'
    );
  }

  logBatchStart(totalItems, label) {
    const args = this._withoutTrailingUndefined([totalItems, label]);
    return this._semantic(
      'logBatchStart',
      args,
      'INFO',
      `Batch start: ${totalItems}${label ? ` ${label}` : ''}`,
      'BATCH'
    );
  }

  logItemStart(itemIndex, totalItems, itemLabel, identifier, kind) {
    const args = [itemIndex, totalItems, itemLabel, identifier, kind];
    return this._semantic(
      'logItemStart',
      args,
      'INFO',
      `Item ${itemIndex}/${totalItems}: ${itemLabel} ${identifier}`,
      'ITEM'
    );
  }

  logStep(message, position) {
    const args = [message, position];
    return this._semantic('logStep', args, 'INFO', `Step: ${message}`, 'STEP');
  }

  logPipelineStart(pipelineName, totalSteps, position) {
    const args = this._withoutTrailingUndefined([pipelineName, totalSteps, position]);
    return this._semantic(
      'logPipelineStart',
      args,
      'INFO',
      `Pipeline start: ${pipelineName} (${totalSteps})`,
      'PIPELINE'
    );
  }

  logPipelineStep(stepName, status, details, position) {
    const args = [stepName, status, details, position];
    const level = status === 'ERROR' ? 'ERROR' : status === 'SKIPPED' ? 'WARN' : 'INFO';
    return this._semantic(
      'logPipelineStep',
      args,
      level,
      `Pipeline step: ${stepName} (${status})`,
      status
    );
  }

  logSummary(label, durationMs, itemDetails, position) {
    const args = this._withoutTrailingUndefined([label, durationMs, itemDetails, position]);
    return this._semantic(
      'logSummary',
      args,
      'INFO',
      `Summary: ${label} (${durationMs}ms)`,
      'SUMMARY'
    );
  }

  // ===================================================================
  // CAPTURE RETRIEVAL METHODS
  // ===================================================================

  /**
   * Retrieves raw capture buffer.
   * @returns {Array<{level: string, timestamp: Date, message: string, context: Object|null}>} Chronological logs.
   */
  getCapturedLogs() {
    // Return a shallow copy to prevent external modification
    return [...this._capturedLogs];
  }

  /**
   * Formats captured logs as plain text.
   * @param {string} [separator='\n'] Line delimiter.
   * @returns {string} Formatted string: `[LEVEL] ISO_TIMESTAMP - MESSAGE {JSON_CONTEXT}`.
   */
  getLogsAsText(separator = '\n') {
    return this._capturedLogs
      .map((entry) => {
        let line = `[${entry.level}] ${entry.timestamp.toISOString()} - ${entry.message}`;

        if (entry.context) {
          line += ` ${JSON.stringify(entry.context)}`;
        }

        return line;
      })
      .join(separator);
  }

  /**
   * Formats captured logs as a styled HTML block.
   * @description
   * Returns a <div> containing color-coded log entries (DEBUG:gray, INFO:blue, WARN:orange, ERROR:red).
   * @returns {string} Sanitized HTML string for UI display.
   * @example
   * const html = capturingLogger.getLogsAsHtml();
   * uiService.createSidebar().setTitle('Job Logs').setContent(html).show();
   */
  getLogsAsHtml() {
    const colorMap = {
      DEBUG: '#888888',
      INFO: '#0066cc',
      WARN: '#ff9900',
      ERROR: '#cc0000'
    };

    const lines = this._capturedLogs
      .map((entry) => {
        const color = colorMap[entry.level] || '#000000';
        let text = `[${entry.level}] ${entry.timestamp.toISOString()} - ${entry.message}`;

        if (entry.context) {
          text += ` ${JSON.stringify(entry.context)}`;
        }

        return `<div style="color: ${color}; margin: 2px 0;">${this._escapeHtml(text)}</div>`;
      })
      .join('');

    return `<div style="font-family: monospace; font-size: 12px; padding: 10px; background: #f5f5f5; overflow-x: auto;">${lines}</div>`;
  }

  /**
   * XSS mitigation for HTML log output.
   * @private
   * @param {string} text Raw text to sanitize.
   * @returns {string} HTML-escaped string.
   */
  _escapeHtml(text) {
    return HtmlSanitizer.escapeHtml(text);
  }

  /**
   * Clears internal memory buffer. Does not affect realLogger.
   */
  clearCapturedLogs() {
    this._capturedLogs = [];
  }

  /**
   * @returns {number} Current entry count in buffer.
   */
  getLogCount() {
    return this._capturedLogs.length;
  }

  // ===================================================================
  // PASS-THROUGH METHODS (Delegate to real logger)
  // ===================================================================

  /**
   * Delegates log level configuration to realLogger.
   * @param {string} level Target log level.
   * @returns {CapturingLogger} Current instance for chaining.
   */
  setLevel(level) {
    if (typeof this._realLogger.setLevel === 'function') {
      this._realLogger.setLevel(level);
    }
    return this;
  }

  /**
   * Retrieves current level from realLogger.
   * @returns {string} Active log level or 'UNKNOWN' if realLogger is not configurable.
   */
  getLevel() {
    if (typeof this._realLogger.getLevel === 'function') {
      return this._realLogger.getLevel();
    }
    return 'UNKNOWN';
  }
}
