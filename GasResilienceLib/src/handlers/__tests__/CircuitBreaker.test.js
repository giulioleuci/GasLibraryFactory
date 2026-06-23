// ===================================================================
// FILE: GasResilienceLib/src/handlers/__tests__/CircuitBreaker.test.js
// ===================================================================
// Comprehensive test suite for CircuitBreaker
// Coverage: 100% of features including all states, transitions, and edge cases
// ===================================================================

import { CircuitBreaker } from '../CircuitBreaker';

describe('CircuitBreaker - Comprehensive Test Suite', () => {
  let logger;
  let cache;
  let breaker;

  beforeEach(() => {
    // Mock logger
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Mock cache (in-memory Map)
    const cacheStore = new Map();
    cache = {
      get: jest.fn((key) => cacheStore.get(key) || null),
      put: jest.fn((key, value, ttl) => cacheStore.set(key, value)),
      remove: jest.fn((key) => cacheStore.delete(key))
    };

    // Create breaker with default config
    breaker = new CircuitBreaker({}, logger, cache);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with default configuration', () => {
      const breaker = new CircuitBreaker();

      expect(breaker).toBeDefined();
      expect(breaker._failureThreshold).toBe(5);
      expect(breaker._successThreshold).toBe(2);
      expect(breaker._resetTimeout).toBe(60000);
      expect(breaker._monitoringPeriod).toBe(120000);
    });

    it('should create instance with custom configuration', () => {
      const breaker = new CircuitBreaker({
        failureThreshold: 10,
        successThreshold: 3,
        resetTimeout: 120000,
        monitoringPeriod: 300000
      });

      expect(breaker._failureThreshold).toBe(10);
      expect(breaker._successThreshold).toBe(3);
      expect(breaker._resetTimeout).toBe(120000);
      expect(breaker._monitoringPeriod).toBe(300000);
    });

    it('should accept logger and cache dependencies', () => {
      const breaker = new CircuitBreaker({}, logger, cache);

      expect(breaker._logger).toBe(logger);
      expect(breaker._cache).toBe(cache);
    });

    it('should define state constants', () => {
      expect(CircuitBreaker.STATE.CLOSED).toBe('CLOSED');
      expect(CircuitBreaker.STATE.OPEN).toBe('OPEN');
      expect(CircuitBreaker.STATE.HALF_OPEN).toBe('HALF_OPEN');
    });

    it('should throw error for invalid config (not object)', () => {
      expect(() => {
        new CircuitBreaker('invalid');
      }).toThrow('CircuitBreaker: config must be an object');

      expect(() => {
        new CircuitBreaker(null);
      }).toThrow('CircuitBreaker: config must be an object');
    });

    it('should throw error for failureThreshold < 1', () => {
      // Note: config uses || operator, so we need to check implementation behavior
      // The validation happens AFTER the || assignment, so negative values are caught
      expect(() => {
        new CircuitBreaker({ failureThreshold: -5 });
      }).toThrow('CircuitBreaker: failureThreshold must be at least 1');
    });

    it('should throw error for successThreshold < 1', () => {
      // Note: config uses || operator, so we need to check implementation behavior
      expect(() => {
        new CircuitBreaker({ successThreshold: -3 });
      }).toThrow('CircuitBreaker: successThreshold must be at least 1');
    });

    it('should throw error for resetTimeout < 1000ms', () => {
      expect(() => {
        new CircuitBreaker({ resetTimeout: 500 });
      }).toThrow('CircuitBreaker: resetTimeout must be at least 1000ms');
    });

    it('should throw error for monitoringPeriod < 1000ms', () => {
      expect(() => {
        new CircuitBreaker({ monitoringPeriod: 500 });
      }).toThrow('CircuitBreaker: monitoringPeriod must be at least 1000ms');
    });

    it('should work without logger (no errors)', () => {
      const breaker = new CircuitBreaker({}, null, cache);

      expect(() => {
        breaker.allowRequest('test');
        breaker.recordSuccess('test');
      }).not.toThrow();
    });

    it('should work without cache (in-memory only)', () => {
      const breaker = new CircuitBreaker({}, logger, null);

      expect(() => {
        breaker.allowRequest('test');
        breaker.recordSuccess('test');
      }).not.toThrow();
    });
  });

  // ===================================================================
  // STATE MANAGEMENT AND CACHE PERSISTENCE
  // ===================================================================

  describe('State Management and Cache Persistence', () => {
    it('should return default state when no cache available', () => {
      const breaker = new CircuitBreaker({}, logger, null);
      const state = breaker._loadState('testOp');

      expect(state.state).toBe('CLOSED');
      expect(state.failures).toEqual([]);
      expect(state.consecutiveSuccesses).toBe(0);
      expect(state.lastFailureTime).toBeNull();
      expect(state.nextAttemptTime).toBeNull();
    });

    it('should return default state on cache miss', () => {
      const state = breaker._loadState('newOperation');

      expect(state.state).toBe('CLOSED');
      expect(state.failures).toEqual([]);
      expect(cache.get).toHaveBeenCalledWith('CircuitBreaker_newOperation');
    });

    it('should load state from cache', () => {
      const savedState = {
        state: 'OPEN',
        failures: [Date.now() - 1000, Date.now() - 500],
        consecutiveSuccesses: 0,
        lastFailureTime: Date.now() - 500,
        nextAttemptTime: Date.now() + 60000
      };

      cache.get.mockReturnValue(JSON.stringify(savedState));

      const state = breaker._loadState('cachedOp');

      expect(state.state).toBe('OPEN');
      expect(state.failures).toHaveLength(2);
      expect(state.consecutiveSuccesses).toBe(0);
    });

    it('should save state to cache', () => {
      const state = {
        state: 'CLOSED',
        failures: [],
        consecutiveSuccesses: 0,
        lastFailureTime: null,
        nextAttemptTime: null
      };

      breaker._saveState('testOp', state);

      expect(cache.put).toHaveBeenCalledWith(
        'CircuitBreaker_testOp',
        JSON.stringify(state),
        21600 // 6 hours TTL
      );
    });

    it('should handle cache load errors gracefully', () => {
      cache.get.mockImplementation(() => {
        throw new Error('Cache read error');
      });

      const state = breaker._loadState('errorOp');

      // Should return default state on error
      expect(state.state).toBe('CLOSED');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load circuit state from cache')
      );
    });

    it('should handle cache save errors gracefully', () => {
      cache.put.mockImplementation(() => {
        throw new Error('Cache write error');
      });

      const state = { state: 'CLOSED', failures: [] };

      expect(() => {
        breaker._saveState('errorOp', state);
      }).not.toThrow();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save circuit state to cache')
      );
    });

    it('should generate correct cache keys', () => {
      const key1 = breaker._getCacheKey('operation1');
      const key2 = breaker._getCacheKey('operation2');

      expect(key1).toBe('CircuitBreaker_operation1');
      expect(key2).toBe('CircuitBreaker_operation2');
      expect(key1).not.toBe(key2);
    });

    it('should track multiple operations independently', () => {
      breaker.recordFailure('api1');
      breaker.recordFailure('api2');

      const state1 = breaker.getState('api1');
      const state2 = breaker.getState('api2');

      expect(state1.failureCount).toBe(1);
      expect(state2.failureCount).toBe(1);
      // Both are independent
      expect(cache.put).toHaveBeenCalledWith('CircuitBreaker_api1', expect.any(String), 21600);
      expect(cache.put).toHaveBeenCalledWith('CircuitBreaker_api2', expect.any(String), 21600);
    });

    it('should clean old failures outside monitoring period', () => {
      const now = Date.now();
      const circuit = {
        failures: [
          now - 150000, // 2.5 minutes ago (outside 2 min window)
          now - 100000, // 1.67 minutes ago (inside 2 min window)
          now - 60000, // 1 minute ago (inside window)
          now - 30000 // 30 seconds ago (inside window)
        ]
      };

      breaker._cleanOldFailures(circuit);

      // Monitoring period is 120000ms (2 minutes)
      // Only the first failure (2.5 min ago) should be removed
      expect(circuit.failures).toHaveLength(3);
      expect(circuit.failures[0]).toBe(now - 100000);
      expect(circuit.failures[1]).toBe(now - 60000);
      expect(circuit.failures[2]).toBe(now - 30000);
    });
  });

  // ===================================================================
  // CLOSED STATE BEHAVIOR
  // ===================================================================

  describe('CLOSED State Behavior', () => {
    it('should allow all requests when CLOSED', () => {
      const allowed = breaker.allowRequest('testOp');

      expect(allowed).toBe(true);
    });

    it('should record success in CLOSED state', () => {
      breaker.recordSuccess('testOp');

      const state = breaker.getState('testOp');
      expect(state.state).toBe('CLOSED');
      expect(cache.put).toHaveBeenCalled();
    });

    it('should record failure in CLOSED state', () => {
      breaker.recordFailure('testOp');

      const state = breaker.getState('testOp');
      expect(state.state).toBe('CLOSED');
      expect(state.failureCount).toBe(1);
    });

    it('should transition to OPEN when failure threshold reached', () => {
      // Record 5 failures (default threshold)
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }

      const state = breaker.getState('testOp');
      expect(state.state).toBe('OPEN');
      expect(state.failureCount).toBe(5);
      expect(state.nextAttemptTime).toBeGreaterThan(Date.now());
    });

    it('should log transition to OPEN', () => {
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Circuit breaker for 'testOp' opening after 5 failures")
      );
    });

    it('should clean old failures on success', () => {
      // Create breaker with short monitoring period for testing
      const testBreaker = new CircuitBreaker(
        { monitoringPeriod: 1000 }, // 1 second
        logger,
        cache
      );

      // Record a failure
      testBreaker.recordFailure('testOp');
      expect(testBreaker.getState('testOp').failureCount).toBe(1);

      // Wait for monitoring period to pass (simulated by manipulating state)
      const state = testBreaker._loadState('testOp');
      state.failures = [Date.now() - 2000]; // 2 seconds ago
      testBreaker._saveState('testOp', state);

      // Record success (should clean old failures)
      testBreaker.recordSuccess('testOp');

      const newState = testBreaker.getState('testOp');
      expect(newState.failureCount).toBe(0);
    });

    it('should not transition to OPEN if failures below threshold', () => {
      // Record 4 failures (below default threshold of 5)
      for (let i = 0; i < 4; i++) {
        breaker.recordFailure('testOp');
      }

      const state = breaker.getState('testOp');
      expect(state.state).toBe('CLOSED');
      expect(state.failureCount).toBe(4);
    });

    it('should accumulate failures over time', () => {
      breaker.recordFailure('testOp');
      expect(breaker.getState('testOp').failureCount).toBe(1);

      breaker.recordFailure('testOp');
      expect(breaker.getState('testOp').failureCount).toBe(2);

      breaker.recordFailure('testOp');
      expect(breaker.getState('testOp').failureCount).toBe(3);
    });
  });

  // ===================================================================
  // OPEN STATE BEHAVIOR
  // ===================================================================

  describe('OPEN State Behavior', () => {
    beforeEach(() => {
      // Transition to OPEN state
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }
    });

    it('should reject all requests when OPEN', () => {
      const allowed = breaker.allowRequest('testOp');

      expect(allowed).toBe(false);
    });

    it('should maintain OPEN state on additional failures', () => {
      breaker.recordFailure('testOp');

      const state = breaker.getState('testOp');
      expect(state.state).toBe('OPEN');
    });

    it('should calculate nextAttemptTime correctly', () => {
      const state = breaker.getState('testOp');

      expect(state.nextAttemptTime).toBeDefined();
      expect(state.nextAttemptTime).toBeGreaterThan(Date.now());
      expect(state.nextAttemptTime).toBeLessThanOrEqual(Date.now() + 60000); // Within resetTimeout
    });

    it('should transition to HALF_OPEN after reset timeout', () => {
      // Manipulate state to simulate timeout passing
      const state = breaker._loadState('testOp');
      state.nextAttemptTime = Date.now() - 1000; // 1 second ago
      breaker._saveState('testOp', state);

      const allowed = breaker.allowRequest('testOp');

      expect(allowed).toBe(true);
      const newState = breaker.getState('testOp');
      expect(newState.state).toBe('HALF_OPEN');
      expect(newState.consecutiveSuccesses).toBe(0);
    });

    it('should log transition to HALF_OPEN', () => {
      const state = breaker._loadState('testOp');
      state.nextAttemptTime = Date.now() - 1000;
      breaker._saveState('testOp', state);

      jest.clearAllMocks(); // Clear previous logs
      breaker.allowRequest('testOp');

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Circuit breaker for 'testOp' entering HALF_OPEN state")
      );
    });

    it('should not transition before reset timeout', () => {
      const state = breaker._loadState('testOp');
      state.nextAttemptTime = Date.now() + 50000; // 50 seconds in future

      breaker._saveState('testOp', state);

      const allowed = breaker.allowRequest('testOp');

      expect(allowed).toBe(false);
      const newState = breaker.getState('testOp');
      expect(newState.state).toBe('OPEN');
    });

    it('should track lastFailureTime', () => {
      const state = breaker.getState('testOp');

      expect(state.lastFailureTime).toBeDefined();
      expect(state.lastFailureTime).toBeLessThanOrEqual(Date.now());
    });
  });

  // ===================================================================
  // HALF_OPEN STATE BEHAVIOR
  // ===================================================================

  describe('HALF_OPEN State Behavior', () => {
    beforeEach(() => {
      // Transition to HALF_OPEN
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }
      const state = breaker._loadState('testOp');
      state.nextAttemptTime = Date.now() - 1000;
      breaker._saveState('testOp', state);
      breaker.allowRequest('testOp'); // Triggers HALF_OPEN
    });

    it('should allow requests when HALF_OPEN', () => {
      const allowed = breaker.allowRequest('testOp');

      expect(allowed).toBe(true);
    });

    it('should increment consecutive successes on success', () => {
      breaker.recordSuccess('testOp');

      const state = breaker.getState('testOp');
      expect(state.consecutiveSuccesses).toBe(1);
      expect(state.state).toBe('HALF_OPEN');
    });

    it('should transition to CLOSED after success threshold', () => {
      // Record 2 successes (default threshold)
      breaker.recordSuccess('testOp');
      breaker.recordSuccess('testOp');

      const state = breaker.getState('testOp');
      expect(state.state).toBe('CLOSED');
      expect(state.failureCount).toBe(0);
      expect(state.consecutiveSuccesses).toBe(0);
      expect(state.lastFailureTime).toBeNull();
      expect(state.nextAttemptTime).toBeNull();
    });

    it('should log transition to CLOSED', () => {
      jest.clearAllMocks();

      breaker.recordSuccess('testOp');
      breaker.recordSuccess('testOp');

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Circuit breaker for 'testOp' closing after 2 successes")
      );
    });

    it('should immediately reopen on failure', () => {
      breaker.recordFailure('testOp');

      const state = breaker.getState('testOp');
      expect(state.state).toBe('OPEN');
      expect(state.nextAttemptTime).toBeGreaterThan(Date.now());
    });

    it('should log reopening after HALF_OPEN failure', () => {
      jest.clearAllMocks();

      breaker.recordFailure('testOp');

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining(
          "Circuit breaker for 'testOp' reopening after failure in HALF_OPEN state"
        )
      );
    });

    it('should reset consecutive successes on failure', () => {
      breaker.recordSuccess('testOp'); // 1 success
      expect(breaker.getState('testOp').consecutiveSuccesses).toBe(1);

      breaker.recordFailure('testOp'); // Failure resets

      const state = breaker.getState('testOp');
      expect(state.state).toBe('OPEN');
      expect(state.consecutiveSuccesses).toBe(0);
    });

    it('should not transition to CLOSED before success threshold', () => {
      breaker.recordSuccess('testOp'); // 1 success (need 2)

      const state = breaker.getState('testOp');
      expect(state.state).toBe('HALF_OPEN');
      expect(state.consecutiveSuccesses).toBe(1);
    });
  });

  // ===================================================================
  // STATE TRANSITIONS
  // ===================================================================

  describe('State Transitions', () => {
    it('should transition CLOSED → OPEN → HALF_OPEN → CLOSED', () => {
      // Start in CLOSED
      expect(breaker.getState('testOp').state).toBe('CLOSED');

      // CLOSED → OPEN (5 failures)
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }
      expect(breaker.getState('testOp').state).toBe('OPEN');

      // OPEN → HALF_OPEN (timeout)
      const state = breaker._loadState('testOp');
      state.nextAttemptTime = Date.now() - 1000;
      breaker._saveState('testOp', state);
      breaker.allowRequest('testOp');
      expect(breaker.getState('testOp').state).toBe('HALF_OPEN');

      // HALF_OPEN → CLOSED (2 successes)
      breaker.recordSuccess('testOp');
      breaker.recordSuccess('testOp');
      expect(breaker.getState('testOp').state).toBe('CLOSED');
    });

    it('should transition HALF_OPEN → OPEN on failure', () => {
      // Setup HALF_OPEN state
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }
      const state = breaker._loadState('testOp');
      state.nextAttemptTime = Date.now() - 1000;
      breaker._saveState('testOp', state);
      breaker.allowRequest('testOp');

      expect(breaker.getState('testOp').state).toBe('HALF_OPEN');

      // HALF_OPEN → OPEN
      breaker.recordFailure('testOp');
      expect(breaker.getState('testOp').state).toBe('OPEN');
    });

    it('should persist state across executions', () => {
      // Record failures
      for (let i = 0; i < 3; i++) {
        breaker.recordFailure('testOp');
      }

      // Create new breaker instance (simulates new execution)
      const newBreaker = new CircuitBreaker({}, logger, cache);

      // Should load state from cache
      const state = newBreaker.getState('testOp');
      expect(state.failureCount).toBe(3);
      expect(state.state).toBe('CLOSED');
    });

    it('should maintain state after manual reset', () => {
      // Open circuit
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }
      expect(breaker.getState('testOp').state).toBe('OPEN');

      // Reset
      breaker.reset('testOp');

      // Should be CLOSED
      expect(breaker.getState('testOp').state).toBe('CLOSED');
      expect(breaker.getState('testOp').failureCount).toBe(0);

      // Verify persistence
      const newBreaker = new CircuitBreaker({}, logger, cache);
      expect(newBreaker.getState('testOp').state).toBe('CLOSED');
    });
  });

  // ===================================================================
  // getState() METHOD
  // ===================================================================

  describe('getState() Method', () => {
    it('should return complete state information', () => {
      breaker.recordFailure('testOp');

      const state = breaker.getState('testOp');

      expect(state).toHaveProperty('state');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('consecutiveSuccesses');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('nextAttemptTime');
    });

    it('should clean old failures before returning', () => {
      const now = Date.now();
      const state = {
        state: 'CLOSED',
        failures: [now - 150000, now - 30000], // One old, one recent
        consecutiveSuccesses: 0,
        lastFailureTime: now - 30000,
        nextAttemptTime: null
      };

      breaker._saveState('testOp', state);

      const result = breaker.getState('testOp');
      expect(result.failureCount).toBe(1); // Only recent failure
    });

    it('should throw error for invalid operationName (empty)', () => {
      expect(() => {
        breaker.getState('');
      }).toThrow('CircuitBreaker.getState: operationName must be a non-empty string');
    });

    it('should throw error for invalid operationName (null)', () => {
      expect(() => {
        breaker.getState(null);
      }).toThrow('CircuitBreaker.getState: operationName must be a non-empty string');
    });

    it('should throw error for invalid operationName (number)', () => {
      expect(() => {
        breaker.getState(123);
      }).toThrow('CircuitBreaker.getState: operationName must be a non-empty string');
    });

    it('should return correct metrics for OPEN state', () => {
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }

      const state = breaker.getState('testOp');

      expect(state.state).toBe('OPEN');
      expect(state.failureCount).toBe(5);
      expect(state.lastFailureTime).toBeDefined();
      expect(state.nextAttemptTime).toBeGreaterThan(Date.now());
    });

    it('should return correct metrics for HALF_OPEN state', () => {
      // Transition to HALF_OPEN
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }
      const state = breaker._loadState('testOp');
      state.nextAttemptTime = Date.now() - 1000;
      breaker._saveState('testOp', state);
      breaker.allowRequest('testOp');

      breaker.recordSuccess('testOp');

      const result = breaker.getState('testOp');
      expect(result.state).toBe('HALF_OPEN');
      expect(result.consecutiveSuccesses).toBe(1);
    });
  });

  // ===================================================================
  // reset() METHOD
  // ===================================================================

  describe('reset() Method', () => {
    it('should reset circuit to CLOSED state', () => {
      // Open circuit
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }
      expect(breaker.getState('testOp').state).toBe('OPEN');

      // Reset
      breaker.reset('testOp');

      const state = breaker.getState('testOp');
      expect(state.state).toBe('CLOSED');
    });

    it('should clear all failure metrics', () => {
      breaker.recordFailure('testOp');
      breaker.recordFailure('testOp');

      breaker.reset('testOp');

      const state = breaker.getState('testOp');
      expect(state.failureCount).toBe(0);
      expect(state.consecutiveSuccesses).toBe(0);
      expect(state.lastFailureTime).toBeNull();
      expect(state.nextAttemptTime).toBeNull();
    });

    it('should persist reset state to cache', () => {
      breaker.recordFailure('testOp');
      breaker.reset('testOp');

      expect(cache.put).toHaveBeenCalledWith(
        'CircuitBreaker_testOp',
        expect.stringContaining('"state":"CLOSED"'),
        21600
      );
    });

    it('should log manual reset', () => {
      jest.clearAllMocks();

      breaker.reset('testOp');

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Circuit breaker for 'testOp' manually reset to CLOSED")
      );
    });

    it('should throw error for invalid operationName', () => {
      expect(() => {
        breaker.reset('');
      }).toThrow('CircuitBreaker.reset: operationName must be a non-empty string');

      expect(() => {
        breaker.reset(null);
      }).toThrow('CircuitBreaker.reset: operationName must be a non-empty string');
    });

    it('should allow immediate requests after reset', () => {
      // Open circuit
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('testOp');
      }
      expect(breaker.allowRequest('testOp')).toBe(false);

      // Reset
      breaker.reset('testOp');

      expect(breaker.allowRequest('testOp')).toBe(true);
    });
  });

  // ===================================================================
  // allowRequest() VALIDATION
  // ===================================================================

  describe('allowRequest() Validation', () => {
    it('should throw error for empty operationName', () => {
      expect(() => {
        breaker.allowRequest('');
      }).toThrow('CircuitBreaker.allowRequest: operationName must be a non-empty string');
    });

    it('should throw error for null operationName', () => {
      expect(() => {
        breaker.allowRequest(null);
      }).toThrow('CircuitBreaker.allowRequest: operationName must be a non-empty string');
    });

    it('should throw error for undefined operationName', () => {
      expect(() => {
        breaker.allowRequest(undefined);
      }).toThrow('CircuitBreaker.allowRequest: operationName must be a non-empty string');
    });

    it('should throw error for number operationName', () => {
      expect(() => {
        breaker.allowRequest(123);
      }).toThrow('CircuitBreaker.allowRequest: operationName must be a non-empty string');
    });
  });

  // ===================================================================
  // recordSuccess() VALIDATION
  // ===================================================================

  describe('recordSuccess() Validation', () => {
    it('should throw error for empty operationName', () => {
      expect(() => {
        breaker.recordSuccess('');
      }).toThrow('CircuitBreaker.recordSuccess: operationName must be a non-empty string');
    });

    it('should throw error for null operationName', () => {
      expect(() => {
        breaker.recordSuccess(null);
      }).toThrow('CircuitBreaker.recordSuccess: operationName must be a non-empty string');
    });
  });

  // ===================================================================
  // recordFailure() VALIDATION
  // ===================================================================

  describe('recordFailure() Validation', () => {
    it('should throw error for empty operationName', () => {
      expect(() => {
        breaker.recordFailure('');
      }).toThrow('CircuitBreaker.recordFailure: operationName must be a non-empty string');
    });

    it('should throw error for null operationName', () => {
      expect(() => {
        breaker.recordFailure(null);
      }).toThrow('CircuitBreaker.recordFailure: operationName must be a non-empty string');
    });
  });

  // ===================================================================
  // getStatistics() METHOD
  // ===================================================================

  describe('getStatistics() Method', () => {
    it('should return empty object (cache limitation)', () => {
      const stats = breaker.getStatistics();

      expect(stats).toEqual({});
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('getStatistics() returns empty object with cache-based persistence')
      );
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle very large failure counts', () => {
      for (let i = 0; i < 1000; i++) {
        breaker.recordFailure('testOp');
      }

      const state = breaker.getState('testOp');
      expect(state.state).toBe('OPEN');
      // All failures happen rapidly, so all are within monitoring period
      // But circuit should still be OPEN and functional
      expect(state.failureCount).toBeGreaterThan(0);
      expect(state.failureCount).toBeLessThanOrEqual(1000);
    });

    it('should handle rapid consecutive operations', () => {
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          breaker.recordSuccess('testOp');
        } else {
          breaker.recordFailure('testOp');
        }
      }

      // Should not throw errors
      expect(breaker.getState('testOp')).toBeDefined();
    });

    it('should handle multiple independent circuits concurrently', () => {
      breaker.recordFailure('api1');
      breaker.recordFailure('api2');
      breaker.recordFailure('api3');

      expect(breaker.getState('api1').failureCount).toBe(1);
      expect(breaker.getState('api2').failureCount).toBe(1);
      expect(breaker.getState('api3').failureCount).toBe(1);
    });

    it('should work without cache (no persistence)', () => {
      const noCacheBreaker = new CircuitBreaker({}, logger, null);

      noCacheBreaker.recordFailure('testOp');
      noCacheBreaker.recordSuccess('testOp');

      expect(noCacheBreaker.getState('testOp')).toBeDefined();
    });

    it('should work without logger (no logging)', () => {
      const noLoggerBreaker = new CircuitBreaker({}, null, cache);

      expect(() => {
        noLoggerBreaker.recordFailure('testOp');
        noLoggerBreaker.recordSuccess('testOp');
      }).not.toThrow();
    });

    it('should handle malformed cache data', () => {
      cache.get.mockReturnValue('invalid json{');

      const state = breaker._loadState('testOp');

      // Should return default state
      expect(state.state).toBe('CLOSED');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load circuit state from cache')
      );
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    it('should protect API calls from cascading failures', () => {
      const apiCall = jest
        .fn()
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockRejectedValueOnce(new Error('Service unavailable'));

      // Simulate 5 failures
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('externalAPI');
      }

      // Circuit should now be OPEN
      const allowed = breaker.allowRequest('externalAPI');
      expect(allowed).toBe(false);

      // API call is prevented
      expect(apiCall).not.toHaveBeenCalled();
    });

    it('should allow gradual recovery via HALF_OPEN state', () => {
      // Open circuit
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('database');
      }

      // Simulate timeout passing
      const state = breaker._loadState('database');
      state.nextAttemptTime = Date.now() - 1000;
      breaker._saveState('database', state);

      // First request after timeout (HALF_OPEN)
      expect(breaker.allowRequest('database')).toBe(true);
      breaker.recordSuccess('database');

      // Second success closes circuit
      expect(breaker.allowRequest('database')).toBe(true);
      breaker.recordSuccess('database');

      expect(breaker.getState('database').state).toBe('CLOSED');
    });

    it('should handle recovery failure and reopen circuit', () => {
      // Open circuit
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('unstableService');
      }

      // Transition to HALF_OPEN
      const state = breaker._loadState('unstableService');
      state.nextAttemptTime = Date.now() - 1000;
      breaker._saveState('unstableService', state);
      breaker.allowRequest('unstableService');

      // Attempt fails
      breaker.recordFailure('unstableService');

      // Should reopen immediately
      expect(breaker.getState('unstableService').state).toBe('OPEN');
      expect(breaker.allowRequest('unstableService')).toBe(false);
    });

    it('should handle manual intervention after fixing issue', () => {
      // Circuit opens due to failures
      for (let i = 0; i < 5; i++) {
        breaker.recordFailure('fixedService');
      }

      expect(breaker.getState('fixedService').state).toBe('OPEN');

      // Admin fixes underlying issue and manually resets circuit
      breaker.reset('fixedService');

      // Service is immediately available
      expect(breaker.allowRequest('fixedService')).toBe(true);
      expect(breaker.getState('fixedService').state).toBe('CLOSED');
    });

    it('should handle custom thresholds for critical services', () => {
      // More sensitive circuit for critical service
      const criticalBreaker = new CircuitBreaker(
        {
          failureThreshold: 2, // Open after just 2 failures
          successThreshold: 5, // Need 5 successes to close
          resetTimeout: 120000 // Wait 2 minutes
        },
        logger,
        cache
      );

      criticalBreaker.recordFailure('criticalAPI');
      expect(criticalBreaker.getState('criticalAPI').state).toBe('CLOSED');

      criticalBreaker.recordFailure('criticalAPI');
      expect(criticalBreaker.getState('criticalAPI').state).toBe('OPEN');
    });

    it('should track statistics across multiple operations', () => {
      // Simulate multiple services
      breaker.recordFailure('api1');
      breaker.recordFailure('api1');

      breaker.recordFailure('api2');

      breaker.recordSuccess('api3');
      breaker.recordSuccess('api3');

      // Each tracked independently
      expect(breaker.getState('api1').failureCount).toBe(2);
      expect(breaker.getState('api2').failureCount).toBe(1);
      expect(breaker.getState('api3').failureCount).toBe(0);
    });
  });
});
