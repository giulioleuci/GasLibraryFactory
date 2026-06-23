/**
 * @file GasResilienceLib/src/handlers/CircuitBreaker.js
 * @description Circuit breaker implementation for preventing cascading failures
 * @version 1.0 - GRL-H007
 */

/**
 * Implementation of the Circuit Breaker pattern, preventing cascading failures by monitoring failure rates and gating requests through CLOSED, OPEN, and HALF_OPEN states.
 * @class
 * @private
 */
export class CircuitBreaker {
  /**
   * Initializes the circuit breaker with configurable thresholds and optional cache-based state persistence.
   * @param {Object} [config={}] logic parameters (failureThreshold, successThreshold, resetTimeout, monitoringPeriod).
   * @param {Object|null} [logger] Optional diagnostic logger.
   * @param {Object|null} [cache] Optional Google CacheService facade for cross-execution state.
   * @throws {Error} If configuration values are invalid or out of range.
   */
  constructor(config = {}, logger = null, cache = null) {
    // Validate config
    if (typeof config !== 'object' || config === null) {
      throw new Error('CircuitBreaker: config must be an object');
    }

    // Configuration with defaults
    this._failureThreshold = config.failureThreshold || 5;
    this._successThreshold = config.successThreshold || 2;
    this._resetTimeout = config.resetTimeout || 60000; // 1 minute
    this._monitoringPeriod = config.monitoringPeriod || 120000; // 2 minutes
    this._logger = logger;
    this._cache = cache; // Store cache for persistence

    // Validate configuration values
    if (this._failureThreshold < 1) {
      throw new Error('CircuitBreaker: failureThreshold must be at least 1');
    }
    if (this._successThreshold < 1) {
      throw new Error('CircuitBreaker: successThreshold must be at least 1');
    }
    if (this._resetTimeout < 1000) {
      throw new Error('CircuitBreaker: resetTimeout must be at least 1000ms');
    }
    if (this._monitoringPeriod < 1000) {
      throw new Error('CircuitBreaker: monitoringPeriod must be at least 1000ms');
    }

    // Cache TTL: 6 hours (in seconds)
    this._cacheTTL = 21600; // 6 hours (in seconds) for cache API
  }

  /**
   * Generates a unique persistence identifier for an operation's state.
   * @private
   * @param {string} operationName target identifier.
   * @returns {string} Fully qualified cache key.
   */
  _getCacheKey(operationName) {
    return `CircuitBreaker_${operationName}`;
  }

  /**
   * Retrieves the current circuit metadata from cache or synthesizes a baseline state.
   * @private
   * @param {string} operationName target identifier.
   * @returns {Object} circuit state metadata.
   */
  _loadState(operationName) {
    // If no cache available, return default state
    if (!this._cache) {
      return {
        state: CircuitBreaker.STATE.CLOSED,
        failures: [],
        consecutiveSuccesses: 0,
        lastFailureTime: null,
        nextAttemptTime: null
      };
    }

    try {
      const cacheKey = this._getCacheKey(operationName);
      const cached = this._cache.get(cacheKey);

      if (cached) {
        const state = JSON.parse(cached);
        // Ensure failures is an array (JSON serialization preserves it)
        return state;
      }
    } catch (error) {
      this._log(`Failed to load circuit state from cache: ${error.message}`);
    }

    // Return default state if cache miss or error
    return {
      state: CircuitBreaker.STATE.CLOSED,
      failures: [],
      consecutiveSuccesses: 0,
      lastFailureTime: null,
      nextAttemptTime: null
    };
  }

  /**
   * Commits the current circuit state to the cache tier if available.
   * @private
   * @param {string} operationName target identifier.
   * @param {Object} state Serialized circuit metadata.
   */
  _saveState(operationName, state) {
    // If no cache available, skip persistence
    if (!this._cache) {
      return;
    }

    try {
      const cacheKey = this._getCacheKey(operationName);
      const serialized = JSON.stringify(state);
      this._cache.put(cacheKey, serialized, this._cacheTTL);
    } catch (error) {
      this._log(`Failed to save circuit state to cache: ${error.message}`);
    }
  }

  /**
   * Removes old failures outside the monitoring period.
   * @private
   * @param {Object} circuit - Circuit state object
   */
  _cleanOldFailures(circuit) {
    const now = Date.now();
    const cutoff = now - this._monitoringPeriod;
    circuit.failures = circuit.failures.filter((timestamp) => timestamp > cutoff);
  }

  /**
   * Checks if a request should be allowed through the circuit breaker.
   *
   * @param {string} operationName - Name of the operation to check
   * @returns {boolean} True if request is allowed, false if circuit is open
   */
  allowRequest(operationName) {
    if (!operationName || typeof operationName !== 'string') {
      throw new Error('CircuitBreaker.allowRequest: operationName must be a non-empty string');
    }

    const circuit = this._loadState(operationName);
    const now = Date.now();

    switch (circuit.state) {
      case CircuitBreaker.STATE.CLOSED:
        // Normal operation
        return true;

      case CircuitBreaker.STATE.OPEN:
        // Check if enough time has passed to try half-open
        if (circuit.nextAttemptTime && now >= circuit.nextAttemptTime) {
          this._log(`Circuit breaker for '${operationName}' entering HALF_OPEN state`);
          circuit.state = CircuitBreaker.STATE.HALF_OPEN;
          circuit.consecutiveSuccesses = 0;
          this._saveState(operationName, circuit);
          return true;
        }
        // Still in timeout period
        return false;

      case CircuitBreaker.STATE.HALF_OPEN:
        // Allow limited requests through
        return true;

      default:
        return true;
    }
  }

  /**
   * Records a successful operation execution.
   *
   * @param {string} operationName - Name of the operation
   */
  recordSuccess(operationName) {
    if (!operationName || typeof operationName !== 'string') {
      throw new Error('CircuitBreaker.recordSuccess: operationName must be a non-empty string');
    }

    const circuit = this._loadState(operationName);
    let stateChanged = false;

    if (circuit.state === CircuitBreaker.STATE.HALF_OPEN) {
      circuit.consecutiveSuccesses++;
      stateChanged = true;

      if (circuit.consecutiveSuccesses >= this._successThreshold) {
        this._log(
          `Circuit breaker for '${operationName}' closing after ${circuit.consecutiveSuccesses} successes`
        );
        circuit.state = CircuitBreaker.STATE.CLOSED;
        circuit.failures = [];
        circuit.consecutiveSuccesses = 0;
        circuit.lastFailureTime = null;
        circuit.nextAttemptTime = null;
      }
    } else if (circuit.state === CircuitBreaker.STATE.CLOSED) {
      // In closed state, success just maintains the state
      // Clean old failures to keep memory usage bounded
      this._cleanOldFailures(circuit);
      stateChanged = true;
    }

    if (stateChanged) {
      this._saveState(operationName, circuit);
    }
  }

  /**
   * Records a failed operation execution.
   *
   * @param {string} operationName - Name of the operation
   */
  recordFailure(operationName) {
    if (!operationName || typeof operationName !== 'string') {
      throw new Error('CircuitBreaker.recordFailure: operationName must be a non-empty string');
    }

    const circuit = this._loadState(operationName);
    const now = Date.now();

    circuit.lastFailureTime = now;
    circuit.failures.push(now);
    this._cleanOldFailures(circuit);

    if (circuit.state === CircuitBreaker.STATE.HALF_OPEN) {
      // Failure in half-open state immediately reopens the circuit
      this._log(
        `Circuit breaker for '${operationName}' reopening after failure in HALF_OPEN state`
      );
      circuit.state = CircuitBreaker.STATE.OPEN;
      circuit.nextAttemptTime = now + this._resetTimeout;
      circuit.consecutiveSuccesses = 0;
    } else if (circuit.state === CircuitBreaker.STATE.CLOSED) {
      // Check if we've exceeded the failure threshold
      if (circuit.failures.length >= this._failureThreshold) {
        this._log(
          `Circuit breaker for '${operationName}' opening after ${circuit.failures.length} failures`
        );
        circuit.state = CircuitBreaker.STATE.OPEN;
        circuit.nextAttemptTime = now + this._resetTimeout;
        circuit.consecutiveSuccesses = 0;
      }
    }

    this._saveState(operationName, circuit);
  }

  /**
   * Gets the current state of a circuit.
   *
   * @param {string} operationName - Name of the operation
   * @returns {Object} Object containing state, failureCount, and other metrics
   */
  getState(operationName) {
    if (!operationName || typeof operationName !== 'string') {
      throw new Error('CircuitBreaker.getState: operationName must be a non-empty string');
    }

    const circuit = this._loadState(operationName);
    this._cleanOldFailures(circuit);

    return {
      state: circuit.state,
      failureCount: circuit.failures.length,
      consecutiveSuccesses: circuit.consecutiveSuccesses,
      lastFailureTime: circuit.lastFailureTime,
      nextAttemptTime: circuit.nextAttemptTime
    };
  }

  /**
   * Manually resets a circuit to CLOSED state.
   *
   * @param {string} operationName - Name of the operation
   */
  reset(operationName) {
    if (!operationName || typeof operationName !== 'string') {
      throw new Error('CircuitBreaker.reset: operationName must be a non-empty string');
    }

    const circuit = {
      state: CircuitBreaker.STATE.CLOSED,
      failures: [],
      consecutiveSuccesses: 0,
      lastFailureTime: null,
      nextAttemptTime: null
    };

    this._saveState(operationName, circuit);
    this._log(`Circuit breaker for '${operationName}' manually reset to CLOSED`);
  }

  /**
   * Gets statistics for all circuits.
   * @returns {Object} Statistics object with circuit states.
   */
  getStatistics() {
    // With cache-based persistence, we cannot enumerate all circuits
    // without maintaining a separate index in cache
    this._log(
      'getStatistics() returns empty object with cache-based persistence. Use getState(operationName) instead.'
    );
    return {};
  }

  /**
   * Logs a message if logger is available.
   * @private
   * @param {string} message - Message to log
   */
  _log(message) {
    if (this._logger && typeof this._logger.info === 'function') {
      this._logger.info(`[CircuitBreaker] ${message}`);
    }
  }

  static get STATE() {
    return { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };
  }
}
