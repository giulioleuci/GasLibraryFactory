import { UtilsService } from '@CoreUtilsLib';

export class ResilienceExecutionHandler {
  constructor(facade) {
    this.facade = facade;
  }

  _generateCorrelationId() {
    // Use CoreUtilsLib's collision-resistant compact ID generator
    const utils = new UtilsService();
    return utils.generateCompactId(21);
  }

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
      this.facade._circuitBreaker &&
      !this.facade._circuitBreaker.allowRequest(operationName)
    ) {
      this.facade._logger.warn(
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
    const absoluteMaxAttempts = this.facade._config
      ? this.facade._config.getLimit('ABSOLUTE_MAX_ATTEMPTS')
      : this.facade.constructor.ABSOLUTE_MAX_ATTEMPTS;
      
    while (attempt < absoluteMaxAttempts) {
      attempt++;
      try {
        // Attempt to execute the function
        const result = func(parameters);

        // GRL-H007: Record success in circuit breaker
        if (useCircuitBreaker && this.facade._circuitBreaker) {
          this.facade._circuitBreaker.recordSuccess(operationName);
        }

        // If we recovered from previous errors, record the recovery
        const recovered = attempt > 1;
        if (recovered) {
          this.facade._reporter.record({
            type: 'RECOVERED',
            operation: operationName,
            attempt,
            correlationId // GRL-H008
          });
          this.facade._logger.debug(
            `[${operationName}] Operation recovered successfully after ${attempt} attempt(s)`
          );
        } else {
          this.facade._logger.debug(
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

        classification = this.facade._classifier.classify(lastError);

        // Check if we should retry based on the recovery strategy (GRL-H005)
        if (!this.facade._recoveryManager.applyStrategy(classification, attempt, mode, maxAttempts)) {
          break; // Max retries reached or error is not recoverable
        }
        // If applyStrategy returns true, it has already applied the backoff delay
        // Log the retry attempt
        this.facade._logger.warn(
          `[${operationName}] Retry attempt ${attempt} after error: ${lastError.message}`
        );
      }
    }

    // GRL-H007: Record failure in circuit breaker
    if (useCircuitBreaker && this.facade._circuitBreaker) {
      this.facade._circuitBreaker.recordFailure(operationName);
    }

    // Record the final failure
    this.facade._reporter.record({
      type: 'FAILURE',
      operation: operationName,
      classification,
      correlationId // GRL-H008
    });

    // Log the final failure
    this.facade._logger.error(
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
    // Wait, since this method calls `this.facade.executeWithAdvancedHandling`, we just use that so any facade overrides work properly.
    const result = this.facade.executeWithAdvancedHandling(func, parameters, {
      mode: 'RECOVERY',
      maxAttempts
    });

    if (result.success) {
      return result.result;
    }

    throw new Error(result.error.message);
  }

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

    const result = this.facade.executeWithAdvancedHandling(func, parameters, { mode: 'LENIENT' });

    if (result.success) {
      return result.result;
    } else {
      this.facade._logger.warn(`Operation failed, returning fallback value`);
      return defaultValue;
    }
  }
}
