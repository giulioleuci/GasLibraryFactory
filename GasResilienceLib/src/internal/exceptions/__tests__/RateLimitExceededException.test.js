// ===================================================================
// FILE: GasResilienceLib/src/exceptions/__tests__/RateLimitExceededException.test.js
// ===================================================================
// Comprehensive test suite for RateLimitExceededException
// Coverage: 100% of features
// ===================================================================

import { RateLimitExceededException } from '../RateLimitExceededException';

describe('RateLimitExceededException - Comprehensive Test Suite', () => {
  describe('Constructor and Initialization', () => {
    it('should create instance with operation name and required wait time', () => {
      const exception = new RateLimitExceededException('api-call', 10000);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(RateLimitExceededException);
      expect(exception.operationName).toBe('api-call');
      expect(exception.requiredWaitMs).toBe(10000);
      expect(exception.message).toContain('api-call');
      expect(exception.message).toContain('10000ms');
      expect(exception.name).toBe('RateLimitExceededException');
    });

    it('should create instance with custom message', () => {
      const customMessage = 'Custom rate limit message';
      const exception = new RateLimitExceededException('test-op', 5000, customMessage);

      expect(exception.message).toBe(customMessage);
      expect(exception.operationName).toBe('test-op');
      expect(exception.requiredWaitMs).toBe(5000);
      expect(exception.name).toBe('RateLimitExceededException');
    });

    it('should use default message when not provided', () => {
      const exception = new RateLimitExceededException('sheets-api', 8000);

      expect(exception.message).toContain('Rate limit exceeded');
      expect(exception.message).toContain('sheets-api');
      expect(exception.message).toContain('8000ms');
    });

    it('should have proper prototype chain', () => {
      const exception = new RateLimitExceededException('test', 1000);

      expect(exception instanceof Error).toBe(true);
      expect(exception instanceof RateLimitExceededException).toBe(true);
    });

    it('should be catchable as Error', () => {
      try {
        throw new RateLimitExceededException('test-op', 3000);
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect(error.operationName).toBe('test-op');
        expect(error.requiredWaitMs).toBe(3000);
      }
    });

    it('should be catchable as RateLimitExceededException', () => {
      try {
        throw new RateLimitExceededException('api-call', 7000);
      } catch (error) {
        if (error instanceof RateLimitExceededException) {
          expect(error.operationName).toBe('api-call');
          expect(error.requiredWaitMs).toBe(7000);
          expect(error.name).toBe('RateLimitExceededException');
        } else {
          fail('Should have caught RateLimitExceededException');
        }
      }
    });
  });

  describe('Properties', () => {
    it('should expose operationName property', () => {
      const exception = new RateLimitExceededException('drive-api', 15000);

      expect(exception.operationName).toBe('drive-api');
    });

    it('should expose requiredWaitMs property', () => {
      const exception = new RateLimitExceededException('docs-api', 12000);

      expect(exception.requiredWaitMs).toBe(12000);
    });

    it('should handle various operation names', () => {
      const operations = ['api-call', 'sheets.read', 'drive.delete', 'batch-operation'];

      operations.forEach((op) => {
        const exception = new RateLimitExceededException(op, 5000);
        expect(exception.operationName).toBe(op);
      });
    });

    it('should handle various wait times', () => {
      const waitTimes = [1000, 5000, 10000, 30000, 60000];

      waitTimes.forEach((wait) => {
        const exception = new RateLimitExceededException('test', wait);
        expect(exception.requiredWaitMs).toBe(wait);
      });
    });
  });

  describe('Error Behavior', () => {
    it('should have stack trace', () => {
      const exception = new RateLimitExceededException('test', 5000);

      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
      expect(exception.stack.length).toBeGreaterThan(0);
    });

    it('should include RateLimitExceededException in stack trace', () => {
      const exception = new RateLimitExceededException('test', 5000);

      expect(exception.stack).toContain('RateLimitExceededException');
    });

    it('should be distinguishable from generic Error', () => {
      const rateLimitError = new RateLimitExceededException('test', 5000);
      const genericError = new Error('Generic');

      expect(rateLimitError.name).not.toBe(genericError.name);
      expect(rateLimitError.name).toBe('RateLimitExceededException');
      expect(genericError.name).toBe('Error');
    });

    it('should preserve properties when thrown and caught', () => {
      const originalOperation = 'batch-delete';
      const originalWait = 15000;

      try {
        throw new RateLimitExceededException(originalOperation, originalWait);
      } catch (error) {
        expect(error.operationName).toBe(originalOperation);
        expect(error.requiredWaitMs).toBe(originalWait);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large wait times', () => {
      const largeWait = 3600000; // 1 hour
      const exception = new RateLimitExceededException('test', largeWait);

      expect(exception.requiredWaitMs).toBe(largeWait);
    });

    it('should handle small wait times', () => {
      const smallWait = 100; // 100ms
      const exception = new RateLimitExceededException('test', smallWait);

      expect(exception.requiredWaitMs).toBe(smallWait);
    });

    it('should handle operation names with special characters', () => {
      const specialOperation = 'api.v3/sheets:batchUpdate';
      const exception = new RateLimitExceededException(specialOperation, 5000);

      expect(exception.operationName).toBe(specialOperation);
    });

    it('should handle empty operation name', () => {
      const exception = new RateLimitExceededException('', 5000);

      expect(exception.operationName).toBe('');
      expect(exception.message).toContain("''");
    });

    it('should handle zero wait time', () => {
      const exception = new RateLimitExceededException('test', 0);

      expect(exception.requiredWaitMs).toBe(0);
    });
  });

  describe('Comparison with Other Exceptions', () => {
    it('should be distinct from RangeError', () => {
      const rateLimitError = new RateLimitExceededException('test', 5000);
      const rangeError = new RangeError();

      expect(rateLimitError.name).not.toBe(rangeError.name);
    });

    it('should be distinct from TypeError', () => {
      const rateLimitError = new RateLimitExceededException('test', 5000);
      const typeError = new TypeError();

      expect(rateLimitError.name).not.toBe(typeError.name);
    });

    it('should be instanceof Error but not instanceof TypeError', () => {
      const exception = new RateLimitExceededException('test', 5000);

      expect(exception instanceof Error).toBe(true);
      expect(exception instanceof TypeError).toBe(false);
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should work in rate limiter pattern', () => {
      function executeWithRateLimit(operation, fn) {
        const tokensAvailable = 0;
        const requiredWait = 10000;

        if (tokensAvailable === 0) {
          throw new RateLimitExceededException(operation, requiredWait);
        }

        return fn();
      }

      expect(() => {
        executeWithRateLimit('api-call', () => 'result');
      }).toThrow(RateLimitExceededException);
    });

    it('should allow job suspension based on required wait time', () => {
      function processWithSuspension(operation) {
        try {
          // Simulate rate-limited operation
          throw new RateLimitExceededException(operation, 15000);
        } catch (error) {
          if (error instanceof RateLimitExceededException) {
            // Suspend job and schedule resume
            return {
              suspended: true,
              resumeAfterMs: error.requiredWaitMs,
              operation: error.operationName
            };
          }
          throw error;
        }
      }

      const result = processWithSuspension('batch-upload');

      expect(result.suspended).toBe(true);
      expect(result.resumeAfterMs).toBe(15000);
      expect(result.operation).toBe('batch-upload');
    });

    it('should work in retry pattern with exponential backoff', () => {
      function retryWithBackoff(operation, fn, maxAttempts) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return fn();
          } catch (error) {
            if (error instanceof RateLimitExceededException) {
              // Calculate backoff based on required wait time
              const backoffMs = error.requiredWaitMs * Math.pow(2, attempt - 1);

              return {
                shouldWait: true,
                waitMs: backoffMs,
                operation: error.operationName
              };
            }
            throw error;
          }
        }
      }

      const rateLimitedFn = () => {
        throw new RateLimitExceededException('sheets-api', 5000);
      };

      const result = retryWithBackoff('sheets-api', rateLimitedFn, 3);

      expect(result.shouldWait).toBe(true);
      expect(result.waitMs).toBeGreaterThanOrEqual(5000);
      expect(result.operation).toBe('sheets-api');
    });

    it('should provide useful error messages for debugging', () => {
      const exception = new RateLimitExceededException(
        'Drive.BatchDelete',
        25000,
        'Rate limit exceeded for Drive.BatchDelete. Required wait time: 25000ms. Job will be suspended.'
      );

      expect(exception.message).toContain('Drive.BatchDelete');
      expect(exception.message).toContain('25000ms');
      expect(exception.message).toContain('suspended');
    });

    it('should distinguish rate limit errors from other errors', () => {
      function handleError(error) {
        if (error instanceof RateLimitExceededException) {
          return {
            type: 'rate_limit',
            shouldSuspend: true,
            waitMs: error.requiredWaitMs
          };
        } else {
          return {
            type: 'other',
            shouldRetry: true
          };
        }
      }

      const rateLimitError = new RateLimitExceededException('test', 10000);
      const genericError = new Error('Generic error');

      const rateLimitResult = handleError(rateLimitError);
      const genericResult = handleError(genericError);

      expect(rateLimitResult.type).toBe('rate_limit');
      expect(rateLimitResult.shouldSuspend).toBe(true);
      expect(rateLimitResult.waitMs).toBe(10000);

      expect(genericResult.type).toBe('other');
      expect(genericResult.shouldRetry).toBe(true);
    });
  });
});
