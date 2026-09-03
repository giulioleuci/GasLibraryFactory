// ===================================================================
// FILE: GasResilienceLib/src/ExceptionService.js
// ===================================================================

import { ErrorClassifier } from './handlers/ErrorClassifier';
import { ErrorReporter } from './handlers/ErrorReporter';
import { RecoveryManager } from './handlers/RecoveryManager';
import { CircuitBreaker } from './handlers/CircuitBreaker';
import { UtilsService } from '@CoreUtilsLib';
import { ResilienceConfiguration } from './Configuration';

/**
 * Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.
 * @class
 */
export class ExceptionService {
  // GRL-M008: Extract magic numbers to named constants
  static get ABSOLUTE_MAX_ATTEMPTS() {
    return 100;
  } // Safety limit to prevent infinite loops
  static get MAX_JITTER_MS() {
    return 1000;
  } // Random jitter up to 1 second
  static get MAX_WAIT_TIME_MS() {
    return 300000;
  } // Cap maximum wait time at 5 minutes

  /**
   * Initializes the resilience service with required logger and utility facades.
   * @param {Object} logger Diagnostic output interface.
   * @param {Object} utils CoreUtilsLib service for sleep and operations.
   * @param {Object} [dependencies={}] Optional overrides for internal components.
   * @param {Object} [dependencies.classifier] Custom classification logic (ErrorClassifier).
   * @param {Object} [dependencies.recoveryManager] Custom retry orchestrator (RecoveryManager).
   * @param {Object} [dependencies.reporter] Custom analytics engine (ErrorReporter).
   * @param {Object} [dependencies.circuitBreaker] Custom fail-fast logic (CircuitBreaker).
   * @param {Object} [dependencies.config] Central behavior settings (ResilienceConfiguration).
   * @throws {Error} If logger or utils are invalid, or if native Google Utilities are passed directly.
   */
  constructor(logger, utils, dependencies = {}) {
    // Validate logger
    if (!logger || typeof logger !== 'object') {
      throw new Error('ExceptionService: logger is required and must be an object');
    }
    if (typeof logger.error !== 'function') {
      throw new Error('ExceptionService: logger.error must be a function');
    }
    if (typeof logger.warn !== 'function') {
      throw new Error('ExceptionService: logger.warn must be a function');
    }

    // Validate utils - must be UtilitiesService from GoogleApiWrapper, not native Utilities
    if (!utils || typeof utils !== 'object') {
      throw new Error(
        'ExceptionService: utils is required and must be an object. Pass UtilitiesService from @GoogleApiWrapper, not native Utilities.'
      );
    }
    if (typeof utils.sleep !== 'function') {
      throw new Error(
        'ExceptionService: utils.sleep must be a function. Ensure you are passing UtilitiesService from @GoogleApiWrapper.'
      );
    }
    // Additional guard: Check that it's not the native Utilities object by verifying it's not a global.
    // Referencing the native Utilities here is intentional — the guard exists to REJECT it — so the
    // layer-integrity rule is disabled for this defensive check only.
    // eslint-disable-next-line no-restricted-globals
    if (utils === global.Utilities || (typeof Utilities !== 'undefined' && utils === Utilities)) {
      throw new Error(
        'ExceptionService: Do not pass native Utilities directly. Use UtilitiesService from @GoogleApiWrapper instead.'
      );
    }

    // Validate dependencies
    if (dependencies !== null && typeof dependencies !== 'object') {
      throw new Error('ExceptionService: dependencies must be an object or null');
    }

    // Ensure logger has all required methods; provide no-op fallback for debug
    this._logger = {
      error: logger.error.bind(logger),
      warn: logger.warn.bind(logger),
      debug: typeof logger.debug === 'function' ? logger.debug.bind(logger) : () => {}
    };
    this._utils = utils;
    this._cache = dependencies.cache || null; // Store cache for circuit breaker

    // GRL-M002: Store configuration for internal use; ResilienceConfiguration is the
    // sole source of default patterns/strategies, so a real config is always supplied.
    const config = dependencies.config || ResilienceConfiguration.createDefault();
    this._config = config;

    // Dependency Injection: Allow custom implementations for testing/extensibility (GRL-H004)
    // GRL-M002: Pass configuration to components
    this._classifier = dependencies.classifier || new ErrorClassifier(config);
    this._recoveryManager = dependencies.recoveryManager || new RecoveryManager(utils, config);
    this._reporter = dependencies.reporter || new ErrorReporter(logger);

    // GRL-H007: Circuit breaker integration
    if (dependencies.circuitBreaker) {
      this._circuitBreaker = dependencies.circuitBreaker;
    } else if (dependencies.circuitBreakerConfig) {
      this._circuitBreaker = new CircuitBreaker(
        dependencies.circuitBreakerConfig,
        logger,
        this._cache
      );
    } else {
      this._circuitBreaker = null; // Circuit breaker is optional
    }
  }

  /**
   * Generates a collision-resistant correlation id for tracing a single execution attempt chain.
   * @returns {string} 21-character compact random id.
   */
  _generateCorrelationId() {
    // Use CoreUtilsLib's collision-resistant compact ID generator
    const utils = new UtilsService();
    return utils.generateCompactId(21);
  }

  /**
   * Executes a function with classification, retry/backoff, and optional circuit-breaker protection,
   * returning a detailed result object rather than throwing.
   * @param {Function} func Operation to execute; receives `parameters`.
   * @param {Object} [parameters={}] Arguments passed to `func`.
   * @param {Object} [options={}] Execution behavior overrides.
   * @param {string} [options.operationName] Label used in logs/circuit-breaker keys.
   * @param {string} [options.mode] STRICT|LENIENT|RECOVERY.
   * @param {number} [options.maxAttempts] Override for the strategy's max attempts.
   * @param {string} [options.correlationId] Caller-supplied trace id.
   * @param {boolean} [options.useCircuitBreaker] Defaults to true.
   * @returns {Object} Detailed execution result (success, result, attempts, correlationId, error).
   * @throws {Error} If func/parameters/options are invalid.
   */
  executeWithAdvancedHandling(func, parameters = {}, options = {}) {
    // Validate inputs
    if (typeof func !== 'function') {
      throw new Error('ExceptionService.executeWithAdvancedHandling: func must be a function');
    }
    if (parameters !== null && typeof parameters !== 'object') {
      throw new Error(
        'ExceptionService.executeWithAdvancedHandling: parameters must be an object or null'
      );
    }
    if (typeof options !== 'object') {
      throw new Error('ExceptionService.executeWithAdvancedHandling: options must be an object');
    }
    if (options.maxAttempts !== undefined) {
      if (
        typeof options.maxAttempts !== 'number' ||
        options.maxAttempts < 1 ||
        !Number.isInteger(options.maxAttempts)
      ) {
        throw new Error(
          'ExceptionService.executeWithAdvancedHandling: options.maxAttempts must be a positive integer'
        );
      }
    }
    if (options.correlationId !== undefined && typeof options.correlationId !== 'string') {
      throw new Error(
        'ExceptionService.executeWithAdvancedHandling: options.correlationId must be a string'
      );
    }

    const operationName = options.operationName || 'Operation';
    const mode = options.mode || 'RECOVERY';
    const maxAttempts = options.maxAttempts; // Custom max attempts (GRL-H005)
    const correlationId = options.correlationId || this._generateCorrelationId(); // GRL-H008
    const useCircuitBreaker = options.useCircuitBreaker !== false; // Default true (GRL-H007)
    let attempt = 0;
    let lastError = null;
    let classification = null;

    // GRL-H007: Check circuit breaker before attempting execution
    if (
      useCircuitBreaker &&
      this._circuitBreaker &&
      !this._circuitBreaker.allowRequest(operationName)
    ) {
      this._logger.warn(
        `[CircuitBreaker] Request blocked for '${operationName}' - circuit is OPEN`
      );
      return {
        success: false,
        result: null,
        attempts: 0,
        correlationId,
        error: {
          message: 'Circuit breaker is OPEN - operation blocked',
          type: 'CIRCUIT_OPEN',
          category: 'CIRCUIT_BREAKER',
          recoverable: false,
          originalMessage: 'Circuit breaker is OPEN'
        }
      };
    }

    // GRL-M003 & GRL-M002: Use explicit loop condition with safety limit from configuration
    const absoluteMaxAttempts = this._config
      ? this._config.getLimit('ABSOLUTE_MAX_ATTEMPTS')
      : this.constructor.ABSOLUTE_MAX_ATTEMPTS;

    while (attempt < absoluteMaxAttempts) {
      attempt++;
      try {
        // Attempt to execute the function
        const result = func(parameters);

        // GRL-H007: Record success in circuit breaker
        if (useCircuitBreaker && this._circuitBreaker) {
          this._circuitBreaker.recordSuccess(operationName);
        }

        // If we recovered from previous errors, record the recovery
        const recovered = attempt > 1;
        if (recovered) {
          this._reporter.record({
            type: 'RECOVERED',
            operation: operationName,
            attempt,
            correlationId // GRL-H008
          });
          this._logger.debug(
            `[${operationName}] Operation recovered successfully after ${attempt} attempt(s)`
          );
        } else {
          this._logger.debug(
            `[${operationName}] Operation completed successfully on attempt ${attempt}`
          );
        }

        return {
          success: true,
          result,
          attempts: attempt,
          recovered,
          correlationId, // GRL-H008
          error: null
        };
      } catch (e) {
        // Handle non-Error throws by converting to Error (GRL-C005)
        if (!(e instanceof Error)) {
          lastError = new Error(String(e));
          lastError.originalValue = e;
        } else {
          lastError = e;
        }

        classification = this._classifier.classify(lastError);

        // Check if we should retry based on the recovery strategy (GRL-H005)
        if (!this._recoveryManager.applyStrategy(classification, attempt, mode, maxAttempts)) {
          break; // Max retries reached or error is not recoverable
        }
        // If applyStrategy returns true, it has already applied the backoff delay
        // Log the retry attempt
        this._logger.warn(
          `[${operationName}] Retry attempt ${attempt} after error: ${lastError.message}`
        );
      }
    }

    // GRL-H007: Record failure in circuit breaker
    if (useCircuitBreaker && this._circuitBreaker) {
      this._circuitBreaker.recordFailure(operationName);
    }

    // Record the final failure
    this._reporter.record({
      type: 'FAILURE',
      operation: operationName,
      classification,
      correlationId // GRL-H008
    });

    // Log the final failure
    this._logger.error(
      `[${operationName}] Operation failed after ${attempt} attempt(s): ${lastError.message}`
    );

    return {
      success: false,
      result: null,
      attempts: attempt,
      correlationId, // GRL-H008
      error: {
        message: lastError.message,
        ...classification
      }
    };
  }

  /**
   * Executes a function with automatic retry, throwing the underlying error on final failure.
   * @param {Function} func Operation to execute; receives `parameters`.
   * @param {Object} [parameters={}] Arguments passed to `func`.
   * @param {number} [maxAttempts=3] Maximum retry attempts.
   * @returns {*} The operation's return value on success.
   * @throws {Error} If func/parameters/maxAttempts are invalid, or on final failure.
   */
  executeWithRetry(func, parameters = {}, maxAttempts = 3) {
    // Validate inputs
    if (typeof func !== 'function') {
      throw new Error('ExceptionService.executeWithRetry: func must be a function');
    }
    if (parameters !== null && typeof parameters !== 'object') {
      throw new Error('ExceptionService.executeWithRetry: parameters must be an object or null');
    }
    if (typeof maxAttempts !== 'number' || maxAttempts < 1 || !Number.isInteger(maxAttempts)) {
      throw new Error('ExceptionService.executeWithRetry: maxAttempts must be a positive integer');
    }

    // Pass maxAttempts through options (GRL-H005)
    // Wait, since this method calls `this.executeWithAdvancedHandling`, we just use that so any subclass overrides work properly.
    const result = this.executeWithAdvancedHandling(func, parameters, {
      mode: 'RECOVERY',
      maxAttempts
    });

    if (result.success) {
      return result.result;
    }

    throw new Error(result.error.message);
  }

  /**
   * Executes a function leniently, returning a fallback value instead of throwing on failure.
   * @param {Function} func Operation to execute; receives `parameters`.
   * @param {Object} [parameters={}] Arguments passed to `func`.
   * @param {*} [defaultValue=null] Value returned when the operation fails.
   * @returns {*} The operation's return value on success, otherwise `defaultValue`.
   * @throws {Error} If func/parameters are invalid.
   */
  executeWithBypass(func, parameters, defaultValue) {
    // Handle default values
    if (parameters === undefined) {
      parameters = {};
    }
    if (arguments.length < 3) {
      defaultValue = null;
    }

    // Validate inputs
    if (typeof func !== 'function') {
      throw new Error('ExceptionService.executeWithBypass: func must be a function');
    }
    if (parameters !== null && typeof parameters !== 'object') {
      throw new Error('ExceptionService.executeWithBypass: parameters must be an object or null');
    }

    const result = this.executeWithAdvancedHandling(func, parameters, { mode: 'LENIENT' });

    if (result.success) {
      return result.result;
    } else {
      this._logger.warn(`Operation failed, returning fallback value`);
      return defaultValue;
    }
  }

  /**
   * Classifies an error without executing retry logic.
   * @param {Error|*} error target failure (non-Error throws are wrapped).
   * @returns {Object} error classification state (type, category, recoverable, originalMessage).
   * @throws {Error} If error is null or undefined.
   */
  classifyError(error) {
    // Validate input - handle non-Error throws (GRL-C005)
    if (error === null || error === undefined) {
      throw new Error('ExceptionService.classifyError: error is required');
    }

    if (error instanceof Error) {
      return this._classifier.classify(error);
    }

    // Convert non-Error throws to Error objects. A synthetic wrapper's own call
    // stack (this method's frame) carries no diagnostic value and must not be
    // fed to classification, so it's cleared to keep classification message-only.
    const wrapped = new Error(String(error));
    wrapped.stack = '';
    return this._classifier.classify(wrapped);
  }

  /**
   * Resets accumulated error statistics.
   */
  resetStatistics() {
    this._reporter.reset();
  }

  /**
   * Gets the current error summary (counters and recovery rate).
   * @returns {Object} Error summary.
   */
  getErrorSummary() {
    return this._reporter.getSummary();
  }

  /**
   * Logs a human-readable error analysis report.
   */
  printErrorAnalysis() {
    const summary = this._reporter.getSummary();
    this._logger.warn('=== Error Analysis Report ===');
    this._logger.warn(`Total Errors: ${summary.counters.total}`);
    this._logger.warn(`Recovered: ${summary.counters.recovered}`);
    this._logger.warn(`Failed: ${summary.counters.notRecovered}`);
    this._logger.warn(`Recovery Rate: ${summary.recoveryRate}%`);
    this._logger.warn('Errors by Type:', summary.counters.byType);
  }

  /**
   * Gets aggregate execution statistics.
   * @returns {Object} totalAttempts, recoveryRate, and counters.
   */
  getStatistics() {
    const summary = this._reporter.getSummary();
    return {
      totalAttempts: summary.counters.total,
      recoveryRate: summary.recoveryRate,
      counters: summary.counters
    };
  }

  /**
   * Gets the circuit breaker instance if configured.
   * @returns {Object|null} Circuit breaker instance, or null if not configured.
   */
  getCircuitBreaker() {
    return this._circuitBreaker;
  }

  /**
   * Gets circuit breaker statistics.
   * @returns {Object} Statistics, or an empty object if no circuit breaker is configured.
   */
  getCircuitBreakerStatistics() {
    if (!this._circuitBreaker) {
      return {};
    }
    return this._circuitBreaker.getStatistics();
  }

  /**
   * Resets the circuit breaker state for a given operation.
   * @param {string} operationName Operation key to reset.
   * @returns {boolean} True if reset was applied, false if no circuit breaker is configured.
   * @throws {Error} If operationName is missing or not a string.
   */
  resetCircuit(operationName) {
    if (!operationName || typeof operationName !== 'string') {
      throw new Error('ExceptionService.resetCircuit: operationName must be a non-empty string');
    }

    if (!this._circuitBreaker) {
      this._logger.warn('ExceptionService.resetCircuit: No circuit breaker configured');
      return false;
    }

    this._circuitBreaker.reset(operationName);
    return true;
  }

  /**
   * Gets the logger instance used by this service.
   *
   * @returns {Object} Logger instance with error, warn, debug, and info methods
   */
  get logger() {
    return this._logger;
  }

  /**
   * Gets the utils instance used by this service.
   *
   * @returns {Object} Utils instance with sleep and other utility methods
   */
  get utils() {
    return this._utils;
  }

  /**
   * Gets the error classifier instance.
   *
   * @returns {Object} Error classifier instance for manual error classification
   */
  get errorClassifier() {
    return this._classifier;
  }

  /**
   * Gets the error reporter instance.
   *
   * @returns {Object} Error reporter instance for statistics and reporting
   */
  get errorReporter() {
    return this._reporter;
  }

  /**
   * Gets the recovery manager instance.
   *
   * @returns {Object} Recovery manager instance for retry strategies
   */
  get recoveryManager() {
    return this._recoveryManager;
  }

  /**
   * Gets the circuit breaker instance if configured.
   *
   * @returns {Object|null} Circuit breaker instance, or null if not configured
   */
  get circuitBreaker() {
    return this._circuitBreaker;
  }
}
