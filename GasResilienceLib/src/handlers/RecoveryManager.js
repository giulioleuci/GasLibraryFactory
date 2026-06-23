// ===================================================================
// FILE: GasResilienceLib/src/handlers/RecoveryManager.js
// ===================================================================

/**
 * Decision engine for error recovery, implementing exponential backoff with jitter and category-specific retry strategies to maintain system stability.
 * @class
 * @private
 */
export class RecoveryManager {
  // GRL-M008: Extract magic numbers to named constants
  static get MAX_JITTER_MS() {
    return 1000;
  } // Safety limit to prevent infinite loops
  static get MAX_WAIT_TIME_MS() {
    return 300000;
  } // Cap maximum wait time at 5 minutes

  /**
   * Initializes the recovery manager with sleep utilities and optional behavior configuration.
   * @param {Object} utils CoreUtilsLib service for temporal delays.
   * @param {Function} utils.sleep Logic to pause execution.
   * @param {Object} [config] optional central settings (ResilienceConfiguration).
   * @throws {Error} If utils or sleep function are missing.
   */
  constructor(utils, config) {
    // Validate utils
    if (!utils || typeof utils !== 'object') {
      throw new Error('RecoveryManager: utils is required and must be an object');
    }
    if (typeof utils.sleep !== 'function') {
      throw new Error('RecoveryManager: utils.sleep must be a function');
    }

    // Validate config if provided
    if (config !== undefined && config !== null && typeof config !== 'object') {
      throw new Error('RecoveryManager: config must be an object or null');
    }

    this._utils = utils;

    /**
     * Recovery strategies mapped by error category.
     * Each strategy defines the retry action, maximum attempts, and base interval.
     * @private
     */
    // GRL-M002: Use configuration object instead of hard-coded values
    if (config && typeof config.getRecoveryStrategies === 'function') {
      this._strategies = config.getRecoveryStrategies();
      this._config = config;
    } else {
      // Fallback to default strategies for backward compatibility
      this._strategies = {
        DEFAULT: {
          action: 'RETRY_BACKOFF',
          maxAttempts: 3,
          interval: 2000 // 2 seconds base interval
        },
        FATAL: {
          action: 'NOTIFY_ADMIN',
          maxAttempts: 1
        },
        QUOTA: {
          action: 'RETRY_BACKOFF_LONG',
          maxAttempts: 3,
          interval: 60000 // 1 minute base interval
        },
        SERVICE: {
          action: 'RETRY_BACKOFF',
          maxAttempts: 5,
          interval: 5000 // 5 seconds base interval
        },
        NETWORK: {
          action: 'RETRY_IMMEDIATE',
          maxAttempts: 3,
          interval: 2000 // 2 seconds base interval
        },
        PERMISSIONS: {
          action: 'NOTIFY_ADMIN',
          maxAttempts: 1
        }
      };
      this._config = null;
    }
  }

  /**
   * Evaluates retry eligibility and executes calculated backoff delays based on error classification and attempt history.
   * @param {Object} classification error diagnostic state (category, recoverable).
   * @param {number} attempt 1-based current attempt count.
   * @param {string} mode execution behavior modifier (STRICT|LENIENT|RECOVERY).
   * @param {number} [customMaxAttempts] optional override for strategy-specific limits.
   * @returns {boolean} True if the operation should be retried after the applied delay.
   * @throws {Error} If classification or attempt parameters are invalid.
   */
  applyStrategy(classification, attempt, mode, customMaxAttempts) {
    // Validate inputs
    if (!classification || typeof classification !== 'object') {
      throw new Error('RecoveryManager.applyStrategy: classification must be an object');
    }
    if (typeof classification.category !== 'string') {
      throw new Error('RecoveryManager.applyStrategy: classification.category must be a string');
    }
    if (typeof classification.recoverable !== 'boolean') {
      throw new Error(
        'RecoveryManager.applyStrategy: classification.recoverable must be a boolean'
      );
    }
    if (typeof attempt !== 'number' || attempt < 1 || !Number.isInteger(attempt)) {
      throw new Error('RecoveryManager.applyStrategy: attempt must be a positive integer');
    }
    if (customMaxAttempts !== undefined) {
      if (
        typeof customMaxAttempts !== 'number' ||
        customMaxAttempts < 1 ||
        !Number.isInteger(customMaxAttempts)
      ) {
        throw new Error(
          'RecoveryManager.applyStrategy: customMaxAttempts must be a positive integer'
        );
      }
    }

    // STRICT mode: never retry, fail immediately
    if (mode === 'STRICT') {
      return false;
    }

    const strategy = this._strategies[classification.category] || this._strategies.DEFAULT;

    // Use custom max attempts if provided, otherwise use strategy default (GRL-H005)
    const maxAttempts = customMaxAttempts !== undefined ? customMaxAttempts : strategy.maxAttempts;

    // Don't retry if max attempts exceeded
    if (attempt >= maxAttempts) {
      return false;
    }

    // In LENIENT mode, retry all errors regardless of recoverability
    // In other modes (RECOVERY), respect the recoverability flag
    if (mode !== 'LENIENT' && !classification.recoverable) {
      return false;
    }

    // Apply retry strategy
    // In LENIENT mode, if the strategy action is non-retry (e.g., NOTIFY_ADMIN),
    // fall back to the DEFAULT strategy to force a retry with backoff
    const effectiveStrategy =
      mode === 'LENIENT' && !strategy.action.startsWith('RETRY')
        ? this._strategies.DEFAULT
        : strategy;

    if (effectiveStrategy.action.startsWith('RETRY')) {
      if (effectiveStrategy.interval > 0) {
        // GRL-M007: Calculate exponential backoff with jitter using Math.pow for safe integer handling
        // GRL-M008 & GRL-M002: Use configuration for limits instead of hard-coded constants
        const maxJitter = this._config
          ? this._config.getLimit('MAX_JITTER_MS')
          : RecoveryManager.MAX_JITTER_MS;
        const maxWaitTime = this._config
          ? this._config.getLimit('MAX_WAIT_TIME_MS')
          : RecoveryManager.MAX_WAIT_TIME_MS;

        const exponentialBackoff = effectiveStrategy.interval * Math.pow(2, attempt - 1);
        const jitter = Math.random() * maxJitter;
        const waitTime = exponentialBackoff + jitter;

        // Cap maximum wait time
        const cappedWaitTime = Math.min(waitTime, maxWaitTime);

        // Execute the sleep
        this._utils.sleep(cappedWaitTime);
      }
      return true;
    }

    // For non-retry actions (e.g., NOTIFY_ADMIN), don't retry
    return false;
  }
}
