// ===================================================================
// FILE: GasResilienceLib/src/handlers/__tests__/ErrorReporter.test.js
// ===================================================================
// Comprehensive test suite for ErrorReporter
// Coverage: 100% of features including error tracking, PII sanitization, and statistics
// ===================================================================

import { ErrorReporter } from '../ErrorReporter';

describe('ErrorReporter - Comprehensive Test Suite', () => {
  let logger;
  let reporter;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    };

    reporter = new ErrorReporter(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with valid logger', () => {
      const reporter = new ErrorReporter(logger);

      expect(reporter).toBeDefined();
      expect(reporter._logger).toBe(logger);
    });

    it('should throw error for missing logger', () => {
      expect(() => {
        new ErrorReporter();
      }).toThrow('ErrorReporter: logger is required and must be an object');

      expect(() => {
        new ErrorReporter(null);
      }).toThrow('ErrorReporter: logger is required and must be an object');
    });

    it('should throw error for invalid logger (not object)', () => {
      expect(() => {
        new ErrorReporter('invalid');
      }).toThrow('ErrorReporter: logger is required and must be an object');

      expect(() => {
        new ErrorReporter(123);
      }).toThrow('ErrorReporter: logger is required and must be an object');
    });

    it('should throw error for logger missing error() method', () => {
      expect(() => {
        new ErrorReporter({ warn: jest.fn() });
      }).toThrow('ErrorReporter: logger.error must be a function');
    });

    it('should throw error for logger missing warn() method', () => {
      expect(() => {
        new ErrorReporter({ error: jest.fn() });
      }).toThrow('ErrorReporter: logger.warn must be a function');
    });

    it('should initialize empty session errors', () => {
      const reporter = new ErrorReporter(logger);

      expect(reporter._sessionErrors).toEqual([]);
    });

    it('should initialize counters to zero', () => {
      const reporter = new ErrorReporter(logger);

      expect(reporter._counters.total).toBe(0);
      expect(reporter._counters.recovered).toBe(0);
      expect(reporter._counters.notRecovered).toBe(0);
      expect(reporter._counters.byType).toEqual({});
    });

    it('should have MAX_SESSION_ERRORS constant', () => {
      expect(ErrorReporter.MAX_SESSION_ERRORS).toBe(1000);
    });
  });

  // ===================================================================
  // STATIC _sanitizeMessage() METHOD
  // ===================================================================

  describe('Static _sanitizeMessage() - PII Redaction', () => {
    it('should redact email addresses', () => {
      const message = 'User john.doe@example.com encountered an error';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toBe('User [EMAIL_REDACTED] encountered an error');
      expect(sanitized).not.toContain('john.doe@example.com');
    });

    it('should redact multiple email addresses', () => {
      const message = 'Sent from user1@test.com to user2@test.com';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toBe('Sent from [EMAIL_REDACTED] to [EMAIL_REDACTED]');
    });

    it('should redact OAuth bearer tokens', () => {
      const message = 'Authorization failed: bearer abc123xyz456';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toContain('bearer [TOKEN_REDACTED]');
      expect(sanitized).not.toContain('abc123xyz456');
    });

    it('should redact API keys', () => {
      const message = 'Request failed with api_key=sk_live_abcdefghijk123456789';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toContain('api_key=[KEY_REDACTED]');
      expect(sanitized).not.toContain('sk_live_abcdefghijk123456789');
    });

    it('should redact URL query parameters', () => {
      const message = 'Failed to fetch https://api.example.com/data?token=secret123&key=value';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toContain('https://api.example.com/data?[PARAMS_REDACTED]');
      expect(sanitized).not.toContain('token=secret123');
    });

    it('should redact JWT tokens', () => {
      // JWT pattern matches the three-part base64 structure
      const message =
        'Auth: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toContain('[JWT_REDACTED]');
      expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should redact credit card numbers', () => {
      const message = 'Payment failed for card 4532-1234-5678-9010';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toContain('[CC_REDACTED]');
      expect(sanitized).not.toContain('4532-1234-5678-9010');
    });

    it('should redact phone numbers (various formats)', () => {
      const message1 = 'Call 555-123-4567 for support';
      const message2 = 'Phone: (555) 123-4567';
      const message3 = 'Contact +1-555-123-4567';

      expect(ErrorReporter._sanitizeMessage(message1)).toContain('[PHONE_REDACTED]');
      expect(ErrorReporter._sanitizeMessage(message2)).toContain('[PHONE_REDACTED]');
      expect(ErrorReporter._sanitizeMessage(message3)).toContain('[PHONE_REDACTED]');
    });

    it('should redact session IDs (long hex strings)', () => {
      const message = 'Session abc123def456789012345678901234567890 expired';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toContain('[ID_REDACTED]');
      expect(sanitized).not.toContain('abc123def456789012345678901234567890');
    });

    it('should handle non-string input', () => {
      expect(ErrorReporter._sanitizeMessage(123)).toBe('123');
      expect(ErrorReporter._sanitizeMessage(null)).toBe('null');
      expect(ErrorReporter._sanitizeMessage(undefined)).toBe('undefined');
      expect(ErrorReporter._sanitizeMessage({ error: 'test' })).toBe('[object Object]');
    });

    it('should handle messages with multiple PII patterns', () => {
      const message =
        'User john@example.com failed with token abc123 at https://api.com?key=secret';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).not.toContain('john@example.com');
      expect(sanitized).not.toContain('abc123');
      expect(sanitized).not.toContain('key=secret');
      expect(sanitized).toContain('[EMAIL_REDACTED]');
      expect(sanitized).toContain('[TOKEN_REDACTED]');
      expect(sanitized).toContain('[PARAMS_REDACTED]');
    });

    it('should preserve non-PII content', () => {
      const message = 'Operation failed with status 500';
      const sanitized = ErrorReporter._sanitizeMessage(message);

      expect(sanitized).toBe(message);
    });
  });

  // ===================================================================
  // record() METHOD - FAILURE TYPE
  // ===================================================================

  describe('record() - FAILURE Type', () => {
    it('should record FAILURE event', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'fetchData',
        classification: {
          type: 'QUOTA_EXCEEDED',
          originalMessage: 'Quota exceeded'
        }
      });

      expect(reporter._sessionErrors).toHaveLength(1);
      expect(reporter._sessionErrors[0].type).toBe('FAILURE');
      expect(reporter._sessionErrors[0].operation).toBe('fetchData');
    });

    it('should increment total counter on FAILURE', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      expect(reporter._counters.total).toBe(1);
    });

    it('should increment notRecovered counter on FAILURE', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      expect(reporter._counters.notRecovered).toBe(1);
      expect(reporter._counters.recovered).toBe(0);
    });

    it('should increment error type counter', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'QUOTA_EXCEEDED', originalMessage: 'Error' }
      });

      reporter.record({
        type: 'FAILURE',
        operation: 'op2',
        classification: { type: 'QUOTA_EXCEEDED', originalMessage: 'Error' }
      });

      reporter.record({
        type: 'FAILURE',
        operation: 'op3',
        classification: { type: 'PERMISSION_DENIED', originalMessage: 'Error' }
      });

      expect(reporter._counters.byType.QUOTA_EXCEEDED).toBe(2);
      expect(reporter._counters.byType.PERMISSION_DENIED).toBe(1);
    });

    it('should add timestamp to session log entry', () => {
      const beforeTime = new Date();
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });
      const afterTime = new Date();

      const entry = reporter._sessionErrors[0];
      expect(entry.timestamp).toBeInstanceOf(Date);
      expect(entry.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(entry.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should log FAILURE with sanitized message', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'sendEmail',
        classification: {
          type: 'ERROR',
          originalMessage: 'Failed for user john@example.com'
        }
      });

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('[FAILURE] sendEmail:'));
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('[EMAIL_REDACTED]'));
      expect(logger.error).toHaveBeenCalledWith(expect.not.stringContaining('john@example.com'));
    });

    it('should handle FAILURE with missing originalMessage', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR' }
      });

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Unknown error'));
    });

    it('should throw error for FAILURE without classification', () => {
      expect(() => {
        reporter.record({
          type: 'FAILURE',
          operation: 'op1'
        });
      }).toThrow('ErrorReporter.record: details.classification is required for FAILURE type');
    });

    it('should throw error for FAILURE with invalid classification', () => {
      expect(() => {
        reporter.record({
          type: 'FAILURE',
          operation: 'op1',
          classification: 'invalid'
        });
      }).toThrow('ErrorReporter.record: details.classification is required for FAILURE type');
    });

    it('should throw error for FAILURE without classification.type', () => {
      expect(() => {
        reporter.record({
          type: 'FAILURE',
          operation: 'op1',
          classification: { originalMessage: 'Error' }
        });
      }).toThrow('ErrorReporter.record: details.classification.type is required');
    });

    it('should throw error for FAILURE with invalid classification.type', () => {
      expect(() => {
        reporter.record({
          type: 'FAILURE',
          operation: 'op1',
          classification: { type: 123, originalMessage: 'Error' }
        });
      }).toThrow('ErrorReporter.record: details.classification.type is required');
    });
  });

  // ===================================================================
  // record() METHOD - RECOVERED TYPE
  // ===================================================================

  describe('record() - RECOVERED Type', () => {
    it('should record RECOVERED event', () => {
      reporter.record({
        type: 'RECOVERED',
        operation: 'retryOperation',
        attempt: 3
      });

      expect(reporter._sessionErrors).toHaveLength(1);
      expect(reporter._sessionErrors[0].type).toBe('RECOVERED');
      expect(reporter._sessionErrors[0].attempt).toBe(3);
    });

    it('should increment total counter on RECOVERED', () => {
      reporter.record({
        type: 'RECOVERED',
        operation: 'op1',
        attempt: 2
      });

      expect(reporter._counters.total).toBe(1);
    });

    it('should increment recovered counter on RECOVERED', () => {
      reporter.record({
        type: 'RECOVERED',
        operation: 'op1',
        attempt: 2
      });

      expect(reporter._counters.recovered).toBe(1);
      expect(reporter._counters.notRecovered).toBe(0);
    });

    it('should log RECOVERED with attempt count', () => {
      reporter.record({
        type: 'RECOVERED',
        operation: 'apiCall',
        attempt: 4
      });

      expect(logger.warn).toHaveBeenCalledWith('[RECOVERED] apiCall after 4 attempts.');
    });

    it('should throw error for RECOVERED without attempt', () => {
      expect(() => {
        reporter.record({
          type: 'RECOVERED',
          operation: 'op1'
        });
      }).toThrow(
        'ErrorReporter.record: details.attempt is required for RECOVERED type and must be >= 1'
      );
    });

    it('should throw error for RECOVERED with invalid attempt (zero)', () => {
      expect(() => {
        reporter.record({
          type: 'RECOVERED',
          operation: 'op1',
          attempt: 0
        });
      }).toThrow(
        'ErrorReporter.record: details.attempt is required for RECOVERED type and must be >= 1'
      );
    });

    it('should throw error for RECOVERED with invalid attempt (negative)', () => {
      expect(() => {
        reporter.record({
          type: 'RECOVERED',
          operation: 'op1',
          attempt: -1
        });
      }).toThrow(
        'ErrorReporter.record: details.attempt is required for RECOVERED type and must be >= 1'
      );
    });

    it('should throw error for RECOVERED with invalid attempt (not number)', () => {
      expect(() => {
        reporter.record({
          type: 'RECOVERED',
          operation: 'op1',
          attempt: '2'
        });
      }).toThrow(
        'ErrorReporter.record: details.attempt is required for RECOVERED type and must be >= 1'
      );
    });
  });

  // ===================================================================
  // record() METHOD - INPUT VALIDATION
  // ===================================================================

  describe('record() - Input Validation', () => {
    it('should throw error for null details', () => {
      expect(() => {
        reporter.record(null);
      }).toThrow('ErrorReporter.record: details must be an object');
    });

    it('should throw error for undefined details', () => {
      expect(() => {
        reporter.record(undefined);
      }).toThrow('ErrorReporter.record: details must be an object');
    });

    it('should throw error for string details', () => {
      expect(() => {
        reporter.record('invalid');
      }).toThrow('ErrorReporter.record: details must be an object');
    });

    it('should throw error for missing type', () => {
      expect(() => {
        reporter.record({ operation: 'op1' });
      }).toThrow('ErrorReporter.record: details.type is required and must be a string');
    });

    it('should throw error for invalid type (not string)', () => {
      expect(() => {
        reporter.record({ type: 123, operation: 'op1' });
      }).toThrow('ErrorReporter.record: details.type is required and must be a string');
    });

    it('should throw error for missing operation', () => {
      expect(() => {
        reporter.record({ type: 'FAILURE' });
      }).toThrow('ErrorReporter.record: details.operation is required and must be a string');
    });

    it('should throw error for invalid operation (not string)', () => {
      expect(() => {
        reporter.record({ type: 'FAILURE', operation: 123 });
      }).toThrow('ErrorReporter.record: details.operation is required and must be a string');
    });

    it('should throw error for invalid type value', () => {
      expect(() => {
        reporter.record({
          type: 'INVALID',
          operation: 'op1'
        });
      }).toThrow('ErrorReporter.record: invalid type "INVALID". Must be "FAILURE" or "RECOVERED"');
    });
  });

  // ===================================================================
  // MEMORY MANAGEMENT
  // ===================================================================

  describe('Memory Management', () => {
    it('should limit session errors to MAX_SESSION_ERRORS', () => {
      // Record more than MAX_SESSION_ERRORS
      for (let i = 0; i < 1100; i++) {
        reporter.record({
          type: 'FAILURE',
          operation: `op${i}`,
          classification: { type: 'ERROR', originalMessage: 'Error' }
        });
      }

      expect(reporter._sessionErrors.length).toBe(1000);
    });

    it('should remove oldest entries when limit exceeded (FIFO)', () => {
      // Record exactly MAX_SESSION_ERRORS + 1
      for (let i = 0; i < 1001; i++) {
        reporter.record({
          type: 'FAILURE',
          operation: `op${i}`,
          classification: { type: 'ERROR', originalMessage: `Error ${i}` }
        });
      }

      // First entry (op0) should be removed
      expect(reporter._sessionErrors.length).toBe(1000);
      expect(reporter._sessionErrors[0].operation).toBe('op1'); // op0 removed
      expect(reporter._sessionErrors[999].operation).toBe('op1000');
    });

    it('should log warning when memory limit exceeded', () => {
      for (let i = 0; i < 1001; i++) {
        reporter.record({
          type: 'FAILURE',
          operation: `op${i}`,
          classification: { type: 'ERROR', originalMessage: 'Error' }
        });
      }

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('[MEMORY_LIMIT] Session error log exceeded 1000 entries')
      );
    });

    it('should maintain accurate counters despite log trimming', () => {
      // Record 1100 failures
      for (let i = 0; i < 1100; i++) {
        reporter.record({
          type: 'FAILURE',
          operation: `op${i}`,
          classification: { type: 'ERROR', originalMessage: 'Error' }
        });
      }

      // Session log is trimmed to 1000, but counters should reflect all 1100
      expect(reporter._sessionErrors.length).toBe(1000);
      expect(reporter._counters.total).toBe(1100);
      expect(reporter._counters.notRecovered).toBe(1100);
    });

    it('should handle mixed FAILURE and RECOVERED with memory limit', () => {
      for (let i = 0; i < 600; i++) {
        reporter.record({
          type: 'FAILURE',
          operation: `op${i}`,
          classification: { type: 'ERROR', originalMessage: 'Error' }
        });
      }

      for (let i = 0; i < 600; i++) {
        reporter.record({
          type: 'RECOVERED',
          operation: `op${i}`,
          attempt: 2
        });
      }

      expect(reporter._sessionErrors.length).toBe(1000);
      expect(reporter._counters.total).toBe(1200);
      expect(reporter._counters.notRecovered).toBe(600);
      expect(reporter._counters.recovered).toBe(600);
    });
  });

  // ===================================================================
  // getSummary() METHOD
  // ===================================================================

  describe('getSummary() Method', () => {
    it('should return summary with counters and recovery rate', () => {
      const summary = reporter.getSummary();

      expect(summary).toHaveProperty('counters');
      expect(summary).toHaveProperty('recoveryRate');
    });

    it('should return 100% recovery rate when no errors', () => {
      const summary = reporter.getSummary();

      expect(summary.recoveryRate).toBe(100);
    });

    it('should calculate 0% recovery rate when all failures', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      reporter.record({
        type: 'FAILURE',
        operation: 'op2',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      const summary = reporter.getSummary();
      expect(summary.recoveryRate).toBe(0);
    });

    it('should calculate 100% recovery rate when all recovered', () => {
      reporter.record({ type: 'RECOVERED', operation: 'op1', attempt: 2 });
      reporter.record({ type: 'RECOVERED', operation: 'op2', attempt: 3 });

      const summary = reporter.getSummary();
      expect(summary.recoveryRate).toBe(100);
    });

    it('should calculate 50% recovery rate for mixed events', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });
      reporter.record({ type: 'RECOVERED', operation: 'op2', attempt: 2 });

      const summary = reporter.getSummary();
      expect(summary.recoveryRate).toBe(50);
    });

    it('should round recovery rate to nearest integer', () => {
      // 2 recovered, 1 failure = 66.666...%
      reporter.record({ type: 'RECOVERED', operation: 'op1', attempt: 2 });
      reporter.record({ type: 'RECOVERED', operation: 'op2', attempt: 2 });
      reporter.record({
        type: 'FAILURE',
        operation: 'op3',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      const summary = reporter.getSummary();
      expect(summary.recoveryRate).toBe(67);
    });

    it('should include error breakdown by type', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'QUOTA_EXCEEDED', originalMessage: 'Error' }
      });
      reporter.record({
        type: 'FAILURE',
        operation: 'op2',
        classification: { type: 'QUOTA_EXCEEDED', originalMessage: 'Error' }
      });
      reporter.record({
        type: 'FAILURE',
        operation: 'op3',
        classification: { type: 'PERMISSION_DENIED', originalMessage: 'Error' }
      });

      const summary = reporter.getSummary();
      expect(summary.counters.byType.QUOTA_EXCEEDED).toBe(2);
      expect(summary.counters.byType.PERMISSION_DENIED).toBe(1);
    });

    it('should return accurate total count', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });
      reporter.record({ type: 'RECOVERED', operation: 'op2', attempt: 2 });

      const summary = reporter.getSummary();
      expect(summary.counters.total).toBe(2);
      expect(summary.counters.recovered).toBe(1);
      expect(summary.counters.notRecovered).toBe(1);
    });
  });

  // ===================================================================
  // reset() METHOD
  // ===================================================================

  describe('reset() Method', () => {
    it('should clear session errors', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      expect(reporter._sessionErrors.length).toBe(1);

      reporter.reset();

      expect(reporter._sessionErrors).toEqual([]);
    });

    it('should reset all counters to zero', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'QUOTA_EXCEEDED', originalMessage: 'Error' }
      });
      reporter.record({ type: 'RECOVERED', operation: 'op2', attempt: 2 });

      reporter.reset();

      expect(reporter._counters.total).toBe(0);
      expect(reporter._counters.recovered).toBe(0);
      expect(reporter._counters.notRecovered).toBe(0);
      expect(reporter._counters.byType).toEqual({});
    });

    it('should allow recording after reset', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      reporter.reset();

      reporter.record({
        type: 'FAILURE',
        operation: 'op2',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      expect(reporter._sessionErrors.length).toBe(1);
      expect(reporter._counters.total).toBe(1);
    });

    it('should return 100% recovery rate after reset (no errors)', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: 'Error' }
      });

      reporter.reset();

      const summary = reporter.getSummary();
      expect(summary.recoveryRate).toBe(100);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle rapid consecutive error recording', () => {
      for (let i = 0; i < 100; i++) {
        reporter.record({
          type: 'FAILURE',
          operation: `op${i}`,
          classification: { type: 'ERROR', originalMessage: 'Error' }
        });
      }

      expect(reporter._sessionErrors.length).toBe(100);
      expect(reporter._counters.total).toBe(100);
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);

      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: longMessage }
      });

      expect(reporter._sessionErrors.length).toBe(1);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle special characters in error messages', () => {
      const message = 'Error: ñ, é, 中文, 🚀, "quotes", \'apostrophes\'';

      reporter.record({
        type: 'FAILURE',
        operation: 'op1',
        classification: { type: 'ERROR', originalMessage: message }
      });

      expect(reporter._sessionErrors.length).toBe(1);
    });

    it('should handle errors with same operation name', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'fetchData',
        classification: { type: 'ERROR', originalMessage: 'Error 1' }
      });

      reporter.record({
        type: 'FAILURE',
        operation: 'fetchData',
        classification: { type: 'ERROR', originalMessage: 'Error 2' }
      });

      expect(reporter._sessionErrors.length).toBe(2);
      expect(reporter._counters.total).toBe(2);
    });

    it('should handle alternating FAILURE and RECOVERED events', () => {
      for (let i = 0; i < 50; i++) {
        reporter.record({
          type: 'FAILURE',
          operation: `op${i}`,
          classification: { type: 'ERROR', originalMessage: 'Error' }
        });

        reporter.record({
          type: 'RECOVERED',
          operation: `op${i}`,
          attempt: 2
        });
      }

      expect(reporter._counters.total).toBe(100);
      expect(reporter._counters.recovered).toBe(50);
      expect(reporter._counters.notRecovered).toBe(50);
    });

    it('should handle multiple error types simultaneously', () => {
      const types = ['QUOTA', 'PERMISSION', 'NETWORK', 'TIMEOUT', 'SERVICE'];

      types.forEach((type) => {
        reporter.record({
          type: 'FAILURE',
          operation: 'op',
          classification: { type, originalMessage: 'Error' }
        });
      });

      expect(reporter._counters.byType).toEqual({
        QUOTA: 1,
        PERMISSION: 1,
        NETWORK: 1,
        TIMEOUT: 1,
        SERVICE: 1
      });
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    it('should track quota error with eventual recovery', () => {
      // Initial failure
      reporter.record({
        type: 'FAILURE',
        operation: 'spreadsheetWrite',
        classification: {
          type: 'QUOTA_EXCEEDED',
          originalMessage: 'Quota exceeded for quota metric'
        }
      });

      // Eventual recovery
      reporter.record({
        type: 'RECOVERED',
        operation: 'spreadsheetWrite',
        attempt: 3
      });

      const summary = reporter.getSummary();
      expect(summary.counters.total).toBe(2);
      expect(summary.counters.recovered).toBe(1);
      expect(summary.recoveryRate).toBe(50);
    });

    it('should track non-recoverable permission errors', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'fileAccess',
        classification: {
          type: 'PERMISSION_DENIED',
          originalMessage: 'Permission denied to access file'
        }
      });

      const summary = reporter.getSummary();
      expect(summary.counters.notRecovered).toBe(1);
      expect(summary.recoveryRate).toBe(0);
    });

    it('should track multiple operations with different outcomes', () => {
      // Operation 1: Recovered
      reporter.record({
        type: 'FAILURE',
        operation: 'apiCall1',
        classification: { type: 'NETWORK_ERROR', originalMessage: 'Network error' }
      });
      reporter.record({ type: 'RECOVERED', operation: 'apiCall1', attempt: 2 });

      // Operation 2: Not recovered
      reporter.record({
        type: 'FAILURE',
        operation: 'apiCall2',
        classification: { type: 'TIMEOUT', originalMessage: 'Timeout' }
      });

      // Operation 3: Recovered
      reporter.record({
        type: 'FAILURE',
        operation: 'apiCall3',
        classification: { type: 'SERVICE_UNAVAILABLE', originalMessage: 'Service down' }
      });
      reporter.record({ type: 'RECOVERED', operation: 'apiCall3', attempt: 4 });

      const summary = reporter.getSummary();
      expect(summary.counters.total).toBe(5);
      expect(summary.counters.recovered).toBe(2);
      expect(summary.counters.notRecovered).toBe(3);
      expect(summary.recoveryRate).toBe(40); // 2/5 = 40%
    });

    it('should sanitize PII in production error reporting', () => {
      reporter.record({
        type: 'FAILURE',
        operation: 'emailSend',
        classification: {
          type: 'ERROR',
          originalMessage: 'Failed to send email to user john.doe@example.com with token abc123xyz'
        }
      });

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('[EMAIL_REDACTED]'));
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('[TOKEN_REDACTED]'));
      expect(logger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('john.doe@example.com')
      );
    });

    it('should provide useful statistics for monitoring', () => {
      // Simulate a session with mixed errors
      const errorTypes = [
        'QUOTA_EXCEEDED',
        'QUOTA_EXCEEDED',
        'NETWORK_ERROR',
        'SERVICE_UNAVAILABLE',
        'PERMISSION_DENIED'
      ];

      errorTypes.forEach((type, i) => {
        reporter.record({
          type: 'FAILURE',
          operation: `op${i}`,
          classification: { type, originalMessage: 'Error' }
        });
      });

      // Some recover
      reporter.record({ type: 'RECOVERED', operation: 'op0', attempt: 2 });
      reporter.record({ type: 'RECOVERED', operation: 'op2', attempt: 3 });

      const summary = reporter.getSummary();

      // 5 failures + 2 recoveries = 7 total events
      expect(summary.counters.total).toBe(7);
      expect(summary.counters.recovered).toBe(2);
      expect(summary.counters.notRecovered).toBe(5);
      expect(summary.recoveryRate).toBe(29); // 2/7 = 28.57% → 29%

      // Error breakdown
      expect(summary.counters.byType.QUOTA_EXCEEDED).toBe(2);
      expect(summary.counters.byType.NETWORK_ERROR).toBe(1);
      expect(summary.counters.byType.SERVICE_UNAVAILABLE).toBe(1);
      expect(summary.counters.byType.PERMISSION_DENIED).toBe(1);
    });
  });
});
