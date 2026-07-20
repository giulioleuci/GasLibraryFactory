// ===================================================================
// FILE: GasResilienceLib/src/handlers/__tests__/ResilienceExecutionHandler.test.js
// ===================================================================
// Direct unit tests for ResilienceExecutionHandler, exercised against a
// minimal fake facade (rather than through the full ExceptionService) so
// each branch of executeWithAdvancedHandling (retry/backoff, circuit
// breaker, absoluteMaxAttempts safety limit, non-Error throws) can be
// driven deterministically.
// ===================================================================

import { ResilienceExecutionHandler } from '../ResilienceExecutionHandler';

function createFacade(overrides = {}) {
  const logger = {
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  };
  const classifier = {
    classify: jest.fn((error) => ({
      category: 'DEFAULT',
      recoverable: true,
      message: error.message
    }))
  };
  const recoveryManager = {
    applyStrategy: jest.fn(() => false)
  };
  const reporter = {
    record: jest.fn()
  };

  const facade = {
    _logger: logger,
    _classifier: classifier,
    _recoveryManager: recoveryManager,
    _reporter: reporter,
    _circuitBreaker: null,
    _config: null,
    constructor: { ABSOLUTE_MAX_ATTEMPTS: 100 },
    ...overrides
  };
  return facade;
}

describe('ResilienceExecutionHandler - Direct Unit Tests', () => {
  let facade;
  let handler;

  beforeEach(() => {
    facade = createFacade();
    handler = new ResilienceExecutionHandler(facade);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('stores the facade reference', () => {
      expect(handler.facade).toBe(facade);
    });
  });

  describe('_generateCorrelationId()', () => {
    it('generates a non-empty string id', () => {
      const id = handler._generateCorrelationId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('generates distinct ids across calls', () => {
      const id1 = handler._generateCorrelationId();
      const id2 = handler._generateCorrelationId();
      expect(id1).not.toBe(id2);
    });
  });

  // ===================================================================
  // executeWithAdvancedHandling - input validation
  // ===================================================================
  describe('executeWithAdvancedHandling() - input validation', () => {
    it('throws if func is not a function', () => {
      expect(() => handler.executeWithAdvancedHandling(null)).toThrow(
        'ExceptionService.executeWithAdvancedHandling: func must be a function'
      );
      expect(() => handler.executeWithAdvancedHandling('not a func')).toThrow(
        'func must be a function'
      );
    });

    it('throws if parameters is neither null nor an object', () => {
      expect(() => handler.executeWithAdvancedHandling(() => {}, 'nope')).toThrow(
        'parameters must be an object or null'
      );
    });

    it('accepts null parameters', () => {
      const result = handler.executeWithAdvancedHandling(() => 'ok', null);
      expect(result.success).toBe(true);
    });

    it('throws if options is not an object', () => {
      expect(() => handler.executeWithAdvancedHandling(() => {}, {}, 'nope')).toThrow(
        'options must be an object'
      );
    });

    it('throws if options.maxAttempts is not a positive integer', () => {
      expect(() => handler.executeWithAdvancedHandling(() => {}, {}, { maxAttempts: 0 })).toThrow(
        'options.maxAttempts must be a positive integer'
      );
      expect(() => handler.executeWithAdvancedHandling(() => {}, {}, { maxAttempts: 1.5 })).toThrow(
        'options.maxAttempts must be a positive integer'
      );
      expect(() =>
        handler.executeWithAdvancedHandling(() => {}, {}, { maxAttempts: 'three' })
      ).toThrow('options.maxAttempts must be a positive integer');
    });

    it('throws if options.correlationId is not a string', () => {
      expect(() =>
        handler.executeWithAdvancedHandling(() => {}, {}, { correlationId: 123 })
      ).toThrow('options.correlationId must be a string');
    });
  });

  // ===================================================================
  // Successful first try
  // ===================================================================
  describe('executeWithAdvancedHandling() - success on first attempt', () => {
    it('returns success result without recovery flag on attempt 1', () => {
      const func = jest.fn(() => 'result-value');
      const result = handler.executeWithAdvancedHandling(func, { x: 1 }, { operationName: 'Op' });

      expect(result).toEqual({
        success: true,
        result: 'result-value',
        attempts: 1,
        recovered: false,
        correlationId: expect.any(String),
        error: null
      });
      expect(func).toHaveBeenCalledWith({ x: 1 });
      expect(facade._logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('completed successfully on attempt 1')
      );
      expect(facade._reporter.record).not.toHaveBeenCalled();
    });

    it('generates a correlationId when not provided', () => {
      const result = handler.executeWithAdvancedHandling(() => 'ok');
      expect(result.correlationId).toEqual(expect.any(String));
      expect(result.correlationId.length).toBeGreaterThan(0);
    });

    it('uses the provided correlationId', () => {
      const result = handler.executeWithAdvancedHandling(
        () => 'ok',
        {},
        {
          correlationId: 'fixed-id-123'
        }
      );
      expect(result.correlationId).toBe('fixed-id-123');
    });

    it('records success in the circuit breaker when enabled', () => {
      const circuitBreaker = {
        allowRequest: jest.fn(() => true),
        recordSuccess: jest.fn(),
        recordFailure: jest.fn()
      };
      facade._circuitBreaker = circuitBreaker;
      handler.executeWithAdvancedHandling(() => 'ok', {}, { operationName: 'Op' });

      expect(circuitBreaker.allowRequest).toHaveBeenCalledWith('Op');
      expect(circuitBreaker.recordSuccess).toHaveBeenCalledWith('Op');
    });

    it('does not touch the circuit breaker when useCircuitBreaker is false', () => {
      const circuitBreaker = {
        allowRequest: jest.fn(() => true),
        recordSuccess: jest.fn(),
        recordFailure: jest.fn()
      };
      facade._circuitBreaker = circuitBreaker;
      handler.executeWithAdvancedHandling(() => 'ok', {}, { useCircuitBreaker: false });

      expect(circuitBreaker.allowRequest).not.toHaveBeenCalled();
      expect(circuitBreaker.recordSuccess).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // Circuit breaker OPEN path
  // ===================================================================
  describe('executeWithAdvancedHandling() - circuit breaker OPEN', () => {
    it('blocks execution without invoking func when circuit is open', () => {
      const circuitBreaker = {
        allowRequest: jest.fn(() => false),
        recordSuccess: jest.fn(),
        recordFailure: jest.fn()
      };
      facade._circuitBreaker = circuitBreaker;
      const func = jest.fn();

      const result = handler.executeWithAdvancedHandling(func, {}, { operationName: 'PaymentOp' });

      expect(func).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        result: null,
        attempts: 0,
        correlationId: expect.any(String),
        error: {
          message: 'Circuit breaker is OPEN - operation blocked',
          type: 'CIRCUIT_OPEN',
          category: 'CIRCUIT_BREAKER',
          recoverable: false,
          originalMessage: 'Circuit breaker is OPEN'
        }
      });
      expect(facade._logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Request blocked for 'PaymentOp'")
      );
    });
  });

  // ===================================================================
  // Retry then succeed
  // ===================================================================
  describe('executeWithAdvancedHandling() - retry then succeed', () => {
    it('retries when applyStrategy allows it and eventually succeeds', () => {
      let calls = 0;
      const func = jest.fn(() => {
        calls++;
        if (calls < 3) {
          throw new Error('transient failure');
        }
        return 'recovered-value';
      });
      facade._recoveryManager.applyStrategy = jest.fn(() => true);

      const result = handler.executeWithAdvancedHandling(func, {}, { operationName: 'Flaky' });

      expect(result.success).toBe(true);
      expect(result.result).toBe('recovered-value');
      expect(result.attempts).toBe(3);
      expect(result.recovered).toBe(true);
      expect(facade._reporter.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'RECOVERED', operation: 'Flaky', attempt: 3 })
      );
      expect(facade._logger.warn).toHaveBeenCalledTimes(2); // one per failed attempt before success
    });
  });

  // ===================================================================
  // Retry exhausted
  // ===================================================================
  describe('executeWithAdvancedHandling() - retry exhausted / non-recoverable', () => {
    it('returns failure result when applyStrategy returns false immediately', () => {
      const func = jest.fn(() => {
        throw new Error('boom');
      });
      // Default fake recoveryManager.applyStrategy returns false already.

      const result = handler.executeWithAdvancedHandling(func, {}, { operationName: 'Op' });

      expect(result.success).toBe(false);
      expect(result.result).toBe(null);
      expect(result.attempts).toBe(1);
      expect(result.error.message).toBe('boom');
      expect(facade._reporter.record).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'FAILURE', operation: 'Op' })
      );
      expect(facade._logger.error).toHaveBeenCalledWith(
        expect.stringContaining('failed after 1 attempt(s): boom')
      );
    });

    it('records failure in the circuit breaker after exhaustion', () => {
      const circuitBreaker = {
        allowRequest: jest.fn(() => true),
        recordSuccess: jest.fn(),
        recordFailure: jest.fn()
      };
      facade._circuitBreaker = circuitBreaker;
      const func = jest.fn(() => {
        throw new Error('boom');
      });

      handler.executeWithAdvancedHandling(func, {}, { operationName: 'Op' });

      expect(circuitBreaker.recordFailure).toHaveBeenCalledWith('Op');
    });

    it('handles non-Error throws by wrapping them', () => {
      const func = jest.fn(() => {
        // eslint-disable-next-line no-throw-literal
        throw 'string failure';
      });

      const result = handler.executeWithAdvancedHandling(func, {}, {});

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('string failure');
      expect(facade._classifier.classify).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'string failure', originalValue: 'string failure' })
      );
    });

    it('respects the absoluteMaxAttempts safety limit from the static constant', () => {
      facade.constructor.ABSOLUTE_MAX_ATTEMPTS = 3;
      facade._recoveryManager.applyStrategy = jest.fn(() => true); // always says retry
      const func = jest.fn(() => {
        throw new Error('always fails');
      });

      const result = handler.executeWithAdvancedHandling(func, {}, {});

      expect(func).toHaveBeenCalledTimes(3);
      expect(result.attempts).toBe(3);
      expect(result.success).toBe(false);
    });

    it('uses facade._config.getLimit for the absolute max attempts when config is present', () => {
      facade._config = { getLimit: jest.fn(() => 2) };
      facade._recoveryManager.applyStrategy = jest.fn(() => true);
      const func = jest.fn(() => {
        throw new Error('always fails');
      });

      const result = handler.executeWithAdvancedHandling(func, {}, {});

      expect(facade._config.getLimit).toHaveBeenCalledWith('ABSOLUTE_MAX_ATTEMPTS');
      expect(func).toHaveBeenCalledTimes(2);
      expect(result.attempts).toBe(2);
    });
  });

  // ===================================================================
  // Fallback / bypass paths (executeWithBypass and executeWithRetry
  // delegate to the facade's executeWithAdvancedHandling)
  // ===================================================================
  describe('executeWithRetry()', () => {
    it('throws for invalid func', () => {
      expect(() => handler.executeWithRetry(null)).toThrow(
        'ExceptionService.executeWithRetry: func must be a function'
      );
    });

    it('throws for invalid parameters', () => {
      expect(() => handler.executeWithRetry(() => {}, 'nope')).toThrow(
        'parameters must be an object or null'
      );
    });

    it('throws for invalid maxAttempts', () => {
      expect(() => handler.executeWithRetry(() => {}, {}, 0)).toThrow(
        'maxAttempts must be a positive integer'
      );
      expect(() => handler.executeWithRetry(() => {}, {}, 1.5)).toThrow(
        'maxAttempts must be a positive integer'
      );
    });

    it('delegates to facade.executeWithAdvancedHandling and returns result.result on success', () => {
      facade.executeWithAdvancedHandling = jest.fn(() => ({
        success: true,
        result: 'delegated-value'
      }));

      const value = handler.executeWithRetry(() => {}, {}, 3);

      expect(facade.executeWithAdvancedHandling).toHaveBeenCalledWith(
        expect.any(Function),
        {},
        { mode: 'RECOVERY', maxAttempts: 3 }
      );
      expect(value).toBe('delegated-value');
    });

    it('throws with the underlying error message on failure', () => {
      facade.executeWithAdvancedHandling = jest.fn(() => ({
        success: false,
        error: { message: 'failed hard' }
      }));

      expect(() => handler.executeWithRetry(() => {}, {}, 3)).toThrow('failed hard');
    });
  });

  describe('executeWithBypass()', () => {
    it('throws for invalid func', () => {
      expect(() => handler.executeWithBypass(null)).toThrow(
        'ExceptionService.executeWithBypass: func must be a function'
      );
    });

    it('throws for invalid parameters (when explicitly provided and invalid)', () => {
      expect(() => handler.executeWithBypass(() => {}, 'nope')).toThrow(
        'parameters must be an object or null'
      );
    });

    it('defaults parameters to {} and defaultValue to null when omitted', () => {
      facade.executeWithAdvancedHandling = jest.fn(() => ({ success: true, result: 'val' }));
      const value = handler.executeWithBypass(() => {});
      expect(facade.executeWithAdvancedHandling).toHaveBeenCalledWith(
        expect.any(Function),
        {},
        { mode: 'LENIENT' }
      );
      expect(value).toBe('val');
    });

    it('returns result.result on success', () => {
      facade.executeWithAdvancedHandling = jest.fn(() => ({ success: true, result: 'ok-value' }));
      const value = handler.executeWithBypass(() => {}, {}, 'fallback');
      expect(value).toBe('ok-value');
    });

    it('returns the fallback value and warns on failure', () => {
      facade.executeWithAdvancedHandling = jest.fn(() => ({ success: false }));
      const value = handler.executeWithBypass(() => {}, {}, 'fallback-value');
      expect(value).toBe('fallback-value');
      expect(facade._logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Operation failed, returning fallback value')
      );
    });

    it('handles null fallback value explicitly', () => {
      facade.executeWithAdvancedHandling = jest.fn(() => ({ success: false }));
      const value = handler.executeWithBypass(() => {}, {}, null);
      expect(value).toBe(null);
    });
  });
});
