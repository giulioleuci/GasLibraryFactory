// ===================================================================
// FILE: GasResilienceLib/src/ExceptionService.js
// ===================================================================

import { ErrorClassifier } from './handlers/ErrorClassifier';
import { ErrorReporter } from './handlers/ErrorReporter';
import { RecoveryManager } from './handlers/RecoveryManager';
import { CircuitBreaker } from './handlers/CircuitBreaker';
import { UtilsService } from '@CoreUtilsLib';
import { ResilienceExecutionHandler } from './handlers/ResilienceExecutionHandler';
import { ResilienceStatsTracker } from './handlers/ResilienceStatsTracker';

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

    // GRL-M002: Store configuration for internal use
    const config = dependencies.config || null;
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

    // Facade Delegation
    this._executionHandler = new ResilienceExecutionHandler(this);
    this._statsTracker = new ResilienceStatsTracker(this);

    const executionMethods = [
      'executeWithAdvancedHandling',
      'executeWithRetry',
      'executeWithBypass',
      '_generateCorrelationId'
    ];
    executionMethods.forEach((m) => {
      this[m] = this._executionHandler[m].bind(this._executionHandler);
    });

    const statsMethods = [
      'resetStatistics',
      'getErrorSummary',
      'printErrorAnalysis',
      'getStatistics',
      'getCircuitBreaker',
      'getCircuitBreakerStatistics',
      'resetCircuit',
      'classifyError'
    ];
    statsMethods.forEach((m) => {
      this[m] = this._statsTracker[m].bind(this._statsTracker);
    });
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
