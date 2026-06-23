// ===================================================================
// FILE: GasResilienceLib/src/Configuration.js
// ===================================================================

/**
 * Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.
 * @class
 */
export class ResilienceConfiguration {
  /**
   * Initializes resilience settings with optional overrides, merging with system defaults.
   * @param {Object} [overrides={}] configuration metadata.
   * @param {Object} [overrides.errorPatterns] regex maps for error classification.
   * @param {Object} [overrides.recoveryStrategies] logic definitions for retries and backoffs.
   * @param {Object} [overrides.limits] safety thresholds for resource consumption.
   * @throws {Error} If overrides is not a valid object.
   */
  constructor(overrides = {}) {
    // Validate overrides
    if (overrides !== null && typeof overrides !== 'object') {
      throw new Error('ResilienceConfiguration: overrides must be an object or null');
    }

    // Default error classification patterns
    // Note: Patterns are evaluated in order - more specific patterns should come first
    this.errorPatterns = Object.assign(
      {
        // Fatal errors that should never be retried (must come first)
        AUTH_REQUIRED: {
          pattern: /authorization is required|access_token/i,
          category: 'FATAL',
          recoverable: false
        },
        SCRIPT_ERROR: {
          pattern: /script error|syntax error|reference error/i,
          category: 'FATAL',
          recoverable: false
        },
        // Recoverable and non-recoverable errors
        QUOTA_EXCEEDED: {
          pattern:
            /quota|limit.*exceeded|too many requests|too many times|service invoked too many/i,
          category: 'QUOTA',
          recoverable: true
        },
        PERMISSION_DENIED: {
          pattern: /permission.*denied|unauthorized/i,
          category: 'PERMISSIONS',
          recoverable: false
        },
        SERVICE_UNAVAILABLE: {
          pattern: /service.*unavailable|service.*error|service.*failed|503/i,
          category: 'SERVICE',
          recoverable: true
        },
        NOT_FOUND: {
          pattern: /not found|404/i,
          category: 'NOT_FOUND',
          recoverable: false
        },
        TIMEOUT: {
          pattern: /timeout|execution.*time.*exceeded|exceeded.*maximum.*execution.*time/i,
          category: 'TIMEOUT',
          recoverable: false
        },
        NETWORK_ERROR: {
          pattern: /network.*error|connection.*refused/i,
          category: 'NETWORK',
          recoverable: true
        }
      },
      (overrides && overrides.errorPatterns) || {}
    );

    // Default recovery strategies
    this.recoveryStrategies = Object.assign(
      {
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
      },
      (overrides && overrides.recoveryStrategies) || {}
    );

    // Default system limits
    this.limits = Object.assign(
      {
        ABSOLUTE_MAX_ATTEMPTS: 100, // Safety limit to prevent infinite loops
        MAX_JITTER_MS: 1000, // Random jitter up to 1 second
        MAX_WAIT_TIME_MS: 300000, // Cap maximum wait time at 5 minutes
        MAX_SESSION_ERRORS: 1000 // Maximum errors stored in session (GRL-H001)
      },
      (overrides && overrides.limits) || {}
    );
  }

  /**
   * Retrieves the comprehensive registry of regex patterns used for diagnostic classification.
   * @returns {Object} Pattern registry.
   */
  getErrorPatterns() {
    return this.errorPatterns;
  }

  /**
   * Retrieves the comprehensive map of automated recovery actions keyed by error category.
   * @returns {Object} strategy registry.
   */
  getRecoveryStrategies() {
    return this.recoveryStrategies;
  }

  /**
   * Retrieves the set of architectural safety constraints and timeouts.
   * @returns {Object} System limits.
   */
  getLimits() {
    return this.limits;
  }

  /**
   * Resolves a specific error pattern definition by its unique identifier.
   * @param {string} type Pattern key.
   * @returns {Object|undefined} Resolved pattern or undefined.
   */
  getErrorPattern(type) {
    return this.errorPatterns[type];
  }

  /**
   * Resolves the recovery logic for a given category, falling back to the DEFAULT strategy if unmapped.
   * @param {string} category error classification.
   * @returns {Object} execution strategy.
   */
  getRecoveryStrategy(category) {
    return this.recoveryStrategies[category] || this.recoveryStrategies.DEFAULT;
  }

  /**
   * Resolves a specific numeric safety threshold by name.
   * @param {string} limitName constraint identifier.
   * @returns {number|undefined} threshold value or undefined.
   */
  getLimit(limitName) {
    return this.limits[limitName];
  }

  /**
   * Static factory for instantiating a configuration with baseline system settings.
   * @static
   * @returns {ResilienceConfiguration} Default configuration instance.
   */
  static createDefault() {
    return new ResilienceConfiguration();
  }
}
