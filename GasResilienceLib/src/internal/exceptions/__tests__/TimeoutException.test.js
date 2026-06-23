// ===================================================================
// FILE: GasResilienceLib/src/exceptions/__tests__/TimeoutException.test.js
// ===================================================================
// Comprehensive test suite for TimeoutException
// Coverage: 100% of features
// ===================================================================

import { TimeoutException } from '../TimeoutException';

describe('TimeoutException - Comprehensive Test Suite', () => {
  describe('Constructor and Initialization', () => {
    it('should create instance with default message', () => {
      const exception = new TimeoutException();

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(TimeoutException);
      expect(exception.message).toBe('Timeout exceeded');
      expect(exception.name).toBe('TimeoutException');
    });

    it('should create instance with custom message', () => {
      const customMessage = 'Operation exceeded 5 minute timeout';
      const exception = new TimeoutException(customMessage);

      expect(exception.message).toBe(customMessage);
      expect(exception.name).toBe('TimeoutException');
    });

    it('should have proper prototype chain', () => {
      const exception = new TimeoutException();

      expect(exception instanceof Error).toBe(true);
      expect(exception instanceof TimeoutException).toBe(true);
    });

    it('should be catchable as Error', () => {
      try {
        throw new TimeoutException('Test timeout');
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect(error.message).toBe('Test timeout');
      }
    });

    it('should be catchable as TimeoutException', () => {
      try {
        throw new TimeoutException('Specific timeout');
      } catch (error) {
        if (error instanceof TimeoutException) {
          expect(error.message).toBe('Specific timeout');
          expect(error.name).toBe('TimeoutException');
        } else {
          fail('Should have caught TimeoutException');
        }
      }
    });
  });

  describe('Error Behavior', () => {
    it('should have stack trace', () => {
      const exception = new TimeoutException('Test');

      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
      expect(exception.stack.length).toBeGreaterThan(0);
    });

    it('should include TimeoutException in stack trace', () => {
      const exception = new TimeoutException('Test');

      expect(exception.stack).toContain('TimeoutException');
    });

    it('should be distinguishable from generic Error', () => {
      const timeoutError = new TimeoutException('Timeout');
      const genericError = new Error('Generic');

      expect(timeoutError.name).not.toBe(genericError.name);
      expect(timeoutError.name).toBe('TimeoutException');
      expect(genericError.name).toBe('Error');
    });

    it('should preserve message when thrown and caught', () => {
      const originalMessage = 'Job execution timeout after 25 minutes';

      try {
        throw new TimeoutException(originalMessage);
      } catch (error) {
        expect(error.message).toBe(originalMessage);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string message', () => {
      const exception = new TimeoutException('');

      expect(exception.message).toBe('');
      expect(exception.name).toBe('TimeoutException');
    });

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(1000);
      const exception = new TimeoutException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(1000);
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Timeout: ñ, é, 中文, 🚀, "quotes", \'apostrophes\'';
      const exception = new TimeoutException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    it('should handle null message (converts to string)', () => {
      const exception = new TimeoutException(null);

      expect(exception.message).toBe('null');
    });

    it('should handle undefined message (uses default)', () => {
      const exception = new TimeoutException(undefined);

      expect(exception.message).toBe('Timeout exceeded');
    });

    it('should handle number as message (converts to string)', () => {
      const exception = new TimeoutException(42);

      expect(exception.message).toBe('42');
    });
  });

  describe('Comparison with Other Exceptions', () => {
    it('should be distinct from RangeError', () => {
      const timeoutError = new TimeoutException();
      const rangeError = new RangeError();

      expect(timeoutError.name).not.toBe(rangeError.name);
    });

    it('should be distinct from TypeError', () => {
      const timeoutError = new TimeoutException();
      const typeError = new TypeError();

      expect(timeoutError.name).not.toBe(typeError.name);
    });

    it('should be instanceof Error but not instanceof TypeError', () => {
      const exception = new TimeoutException();

      expect(exception instanceof Error).toBe(true);
      expect(exception instanceof TypeError).toBe(false);
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should work in timeout detection pattern', () => {
      function executeWithTimeout(fn, maxDuration) {
        const startTime = Date.now();

        try {
          const result = fn();

          if (Date.now() - startTime > maxDuration) {
            throw new TimeoutException(`Execution exceeded ${maxDuration}ms`);
          }

          return result;
        } catch (error) {
          if (error instanceof TimeoutException) {
            // Handle timeout specifically
            throw error;
          }
          // Handle other errors
          throw error;
        }
      }

      const fastFn = () => 'quick result';
      expect(executeWithTimeout(fastFn, 1000)).toBe('quick result');

      const slowFn = () => {
        // Simulate long execution
        const start = Date.now();
        while (Date.now() - start < 100) {
          /* busy wait */
        }
        return 'slow result';
      };

      expect(() => {
        executeWithTimeout(slowFn, 50);
      }).toThrow(TimeoutException);
    });

    it('should work in retry with timeout pattern', () => {
      function retryWithTimeout(fn, maxAttempts, timeout) {
        for (let i = 0; i < maxAttempts; i++) {
          try {
            return fn();
          } catch (error) {
            if (error instanceof TimeoutException) {
              // Don't retry on timeout
              throw error;
            }
            // Retry on other errors
            if (i === maxAttempts - 1) {
              throw error;
            }
          }
        }
      }

      const timeoutFn = () => {
        throw new TimeoutException('Execution too slow');
      };

      const errorFn = () => {
        throw new Error('Retriable error');
      };

      // Timeout should not be retried
      expect(() => {
        retryWithTimeout(timeoutFn, 3, 1000);
      }).toThrow(TimeoutException);

      // Other errors should be retried
      expect(() => {
        retryWithTimeout(errorFn, 3, 1000);
      }).toThrow(Error);
    });

    it('should provide useful error messages for debugging', () => {
      const exception = new TimeoutException(
        'Job "ImportData" exceeded maximum execution time of 25 minutes at step 1523 of 5000'
      );

      expect(exception.message).toContain('ImportData');
      expect(exception.message).toContain('25 minutes');
      expect(exception.message).toContain('1523');
      expect(exception.message).toContain('5000');
    });
  });
});
