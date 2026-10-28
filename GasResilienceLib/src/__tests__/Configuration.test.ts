// ===================================================================
// FILE: GasResilienceLib/src/__tests__/Configuration.test.js
// ===================================================================
// Comprehensive test suite for ResilienceConfiguration
// Coverage: 100% of features including error patterns, recovery strategies,
// limits, overrides, and all getter methods
// ===================================================================

import { ResilienceConfiguration } from '../Configuration.js';

describe('ResilienceConfiguration - Comprehensive Test Suite', () => {
  let config: ResilienceConfiguration;

  beforeEach(() => {
    config = new ResilienceConfiguration();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with default configuration', () => {
      expect(Object.keys(config)).toEqual(['errorPatterns', 'recoveryStrategies', 'limits']);
      expect(config).toBeInstanceOf(ResilienceConfiguration);
    });

    it('should initialize default error patterns', () => {
      const patterns = config.getErrorPatterns();

      expect(Object.keys(patterns)).toEqual([
        'AUTH_REQUIRED',
        'SCRIPT_ERROR',
        'TIMEOUT',
        'QUOTA_EXCEEDED',
        'PERMISSION_DENIED',
        'SERVICE_UNAVAILABLE',
        'NOT_FOUND',
        'NETWORK_ERROR'
      ]);
      expect(patterns.QUOTA_EXCEEDED).toEqual({
        pattern: /quota|limit.*exceeded|too many (requests|times)|service invoked too many/i,
        category: 'QUOTA',
        recoverable: true
      });
      expect(patterns.PERMISSION_DENIED).toEqual({
        pattern: /permission.*(denied|to access)|unauthorized|you do not have permission/i,
        category: 'PERMISSIONS',
        recoverable: false
      });
      expect(patterns.SERVICE_UNAVAILABLE).toEqual({
        pattern: /service.*(unavailable|error|failed)|503/i,
        category: 'SERVICE',
        recoverable: true
      });
      expect(patterns.NOT_FOUND).toEqual({
        pattern: /not found|(?:^|\s)404(?:\s|$)/i,
        category: 'NOT_FOUND',
        recoverable: false
      });
      expect(patterns.TIMEOUT).toEqual({
        pattern: /timeout|time.*limit|execution.*time.*exceeded|exceeded.*time/i,
        category: 'TIMEOUT',
        recoverable: false
      });
      expect(patterns.NETWORK_ERROR).toEqual({
        pattern: /network.*error|connection.*(refused|failed)|failed to establish connection/i,
        category: 'NETWORK',
        recoverable: true
      });
    });

    it('should initialize default recovery strategies', () => {
      const strategies = config.getRecoveryStrategies();

      expect(Object.keys(strategies)).toEqual([
        'DEFAULT',
        'FATAL',
        'QUOTA',
        'SERVICE',
        'NETWORK',
        'PERMISSIONS'
      ]);
      expect(strategies.DEFAULT).toEqual({
        action: 'RETRY_BACKOFF',
        maxAttempts: 3,
        interval: 2000
      });
      expect(strategies.FATAL).toEqual({ action: 'NOTIFY_ADMIN', maxAttempts: 1 });
      expect(strategies.QUOTA).toEqual({
        action: 'RETRY_BACKOFF_LONG',
        maxAttempts: 3,
        interval: 60000
      });
      expect(strategies.SERVICE).toEqual({
        action: 'RETRY_BACKOFF',
        maxAttempts: 5,
        interval: 5000
      });
      expect(strategies.NETWORK).toEqual({
        action: 'RETRY_IMMEDIATE',
        maxAttempts: 3,
        interval: 2000
      });
      expect(strategies.PERMISSIONS).toEqual({ action: 'NOTIFY_ADMIN', maxAttempts: 1 });
    });

    it('should initialize default limits', () => {
      const limits = config.getLimits();

      expect(limits).toEqual({
        ABSOLUTE_MAX_ATTEMPTS: 100,
        MAX_JITTER_MS: 1000,
        MAX_WAIT_TIME_MS: 300000,
        MAX_SESSION_ERRORS: 1000
      });
      expect(limits.ABSOLUTE_MAX_ATTEMPTS).toBe(100);
      expect(limits.MAX_JITTER_MS).toBe(1000);
      expect(limits.MAX_WAIT_TIME_MS).toBe(300000);
      expect(limits.MAX_SESSION_ERRORS).toBe(1000);
    });

    it('should accept empty overrides object', () => {
      const config = new ResilienceConfiguration({});

      expect(config.getErrorPatterns()).toEqual(new ResilienceConfiguration().getErrorPatterns());
      expect(config.getRecoveryStrategies()).toEqual(
        new ResilienceConfiguration().getRecoveryStrategies()
      );
      expect(config.getLimits()).toEqual(new ResilienceConfiguration().getLimits());
    });

    it('should throw error for non-object overrides', () => {
      expect(() => {
        // @ts-expect-error Deliberately invalid input exercises the existing runtime guard.
        new ResilienceConfiguration('invalid');
      }).toThrow('overrides must be an object');

      expect(() => {
        // @ts-expect-error Deliberately invalid input exercises the existing runtime guard.
        new ResilienceConfiguration(123);
      }).toThrow('overrides must be an object');

      expect(() => {
        // @ts-expect-error Deliberately invalid input exercises the existing runtime guard.
        new ResilienceConfiguration(true);
      }).toThrow('overrides must be an object');
    });

    it('should accept null overrides', () => {
      expect(new ResilienceConfiguration(null).getLimits()).toEqual({
        ABSOLUTE_MAX_ATTEMPTS: 100,
        MAX_JITTER_MS: 1000,
        MAX_WAIT_TIME_MS: 300000,
        MAX_SESSION_ERRORS: 1000
      });
    });

    it('should accept undefined overrides', () => {
      expect(new ResilienceConfiguration(undefined).getLimits()).toEqual({
        ABSOLUTE_MAX_ATTEMPTS: 100,
        MAX_JITTER_MS: 1000,
        MAX_WAIT_TIME_MS: 300000,
        MAX_SESSION_ERRORS: 1000
      });
    });
  });

  // ===================================================================
  // ERROR PATTERNS
  // ===================================================================

  describe('Error Patterns', () => {
    it('should have QUOTA_EXCEEDED pattern', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED')!;

      expect(pattern).toEqual({
        pattern: /quota|limit.*exceeded|too many (requests|times)|service invoked too many/i,
        category: 'QUOTA',
        recoverable: true
      });
      expect(pattern.pattern).toBeInstanceOf(RegExp);
      expect(pattern.category).toBe('QUOTA');
      expect(pattern.recoverable).toBe(true);
    });

    it('should have PERMISSION_DENIED pattern', () => {
      const pattern = config.getErrorPattern('PERMISSION_DENIED')!;

      expect(pattern).toEqual({
        pattern: /permission.*(denied|to access)|unauthorized|you do not have permission/i,
        category: 'PERMISSIONS',
        recoverable: false
      });
      expect(pattern.category).toBe('PERMISSIONS');
      expect(pattern.recoverable).toBe(false);
    });

    it('should have SERVICE_UNAVAILABLE pattern', () => {
      const pattern = config.getErrorPattern('SERVICE_UNAVAILABLE')!;

      expect(pattern).toEqual({
        pattern: /service.*(unavailable|error|failed)|503/i,
        category: 'SERVICE',
        recoverable: true
      });
      expect(pattern.category).toBe('SERVICE');
      expect(pattern.recoverable).toBe(true);
    });

    it('should have NOT_FOUND pattern', () => {
      const pattern = config.getErrorPattern('NOT_FOUND')!;

      expect(pattern).toEqual({
        pattern: /not found|(?:^|\s)404(?:\s|$)/i,
        category: 'NOT_FOUND',
        recoverable: false
      });
      expect(pattern.category).toBe('NOT_FOUND');
      expect(pattern.recoverable).toBe(false);
    });

    it('should have TIMEOUT pattern', () => {
      const pattern = config.getErrorPattern('TIMEOUT')!;

      expect(pattern).toEqual({
        pattern: /timeout|time.*limit|execution.*time.*exceeded|exceeded.*time/i,
        category: 'TIMEOUT',
        recoverable: false
      });
      expect(pattern.category).toBe('TIMEOUT');
      expect(pattern.recoverable).toBe(false);
    });

    it('should have NETWORK_ERROR pattern', () => {
      const pattern = config.getErrorPattern('NETWORK_ERROR')!;

      expect(pattern).toEqual({
        pattern: /network.*error|connection.*(refused|failed)|failed to establish connection/i,
        category: 'NETWORK',
        recoverable: true
      });
      expect(pattern.category).toBe('NETWORK');
      expect(pattern.recoverable).toBe(true);
    });

    it('should have AUTH_REQUIRED pattern (fatal)', () => {
      const pattern = config.getErrorPattern('AUTH_REQUIRED')!;

      expect(pattern).toEqual({
        pattern: /authorization is required|access_token/i,
        category: 'FATAL',
        recoverable: false
      });
      expect(pattern.category).toBe('FATAL');
      expect(pattern.recoverable).toBe(false);
    });

    it('should have SCRIPT_ERROR pattern (fatal)', () => {
      const pattern = config.getErrorPattern('SCRIPT_ERROR')!;

      expect(pattern).toEqual({
        pattern: /script error|syntax error|reference error|type error|is not a function/i,
        category: 'FATAL',
        recoverable: false
      });
      expect(pattern.category).toBe('FATAL');
      expect(pattern.recoverable).toBe(false);
    });

    it('should return undefined for unknown pattern', () => {
      const pattern = config.getErrorPattern('UNKNOWN_PATTERN')!;

      expect(pattern).toBeUndefined();
    });

    it('should match quota error messages', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED')!;

      expect(pattern.pattern.test('User-rate limit exceeded')).toBe(true);
      expect(pattern.pattern.test('Quota exceeded')).toBe(true);
      expect(pattern.pattern.test('Too many requests')).toBe(true);
    });

    it('should match permission error messages', () => {
      const pattern = config.getErrorPattern('PERMISSION_DENIED')!;

      expect(pattern.pattern.test('Permission denied')).toBe(true);
      expect(pattern.pattern.test('Unauthorized access')).toBe(true);
    });

    it('should match service unavailable messages', () => {
      const pattern = config.getErrorPattern('SERVICE_UNAVAILABLE')!;

      expect(pattern.pattern.test('Service unavailable')).toBe(true);
      expect(pattern.pattern.test('503 error')).toBe(true);
    });

    it('should match not found messages', () => {
      const pattern = config.getErrorPattern('NOT_FOUND')!;

      expect(pattern.pattern.test('File not found')).toBe(true);
      expect(pattern.pattern.test('404 error')).toBe(true);
    });

    it('should match timeout messages', () => {
      const pattern = config.getErrorPattern('TIMEOUT')!;

      expect(pattern.pattern.test('Request timeout')).toBe(true);
      expect(pattern.pattern.test('Execution time exceeded')).toBe(true);
    });

    it('should match network error messages', () => {
      const pattern = config.getErrorPattern('NETWORK_ERROR')!;

      expect(pattern.pattern.test('Network error')).toBe(true);
      expect(pattern.pattern.test('Connection refused')).toBe(true);
    });
  });

  // ===================================================================
  // RECOVERY STRATEGIES
  // ===================================================================

  describe('Recovery Strategies', () => {
    it('should have DEFAULT strategy', () => {
      const strategy = config.getRecoveryStrategy('DEFAULT');

      expect(strategy).toEqual({ action: 'RETRY_BACKOFF', maxAttempts: 3, interval: 2000 });
      expect(strategy.action).toBe('RETRY_BACKOFF');
      expect(strategy.maxAttempts).toBe(3);
      expect(strategy.interval).toBe(2000);
    });

    it('should have FATAL strategy', () => {
      const strategy = config.getRecoveryStrategy('FATAL');

      expect(strategy).toEqual({ action: 'NOTIFY_ADMIN', maxAttempts: 1 });
      expect(strategy.action).toBe('NOTIFY_ADMIN');
      expect(strategy.maxAttempts).toBe(1);
    });

    it('should have QUOTA strategy', () => {
      const strategy = config.getRecoveryStrategy('QUOTA');

      expect(strategy).toEqual({ action: 'RETRY_BACKOFF_LONG', maxAttempts: 3, interval: 60000 });
      expect(strategy.action).toBe('RETRY_BACKOFF_LONG');
      expect(strategy.maxAttempts).toBe(3);
      expect(strategy.interval).toBe(60000);
    });

    it('should have SERVICE strategy', () => {
      const strategy = config.getRecoveryStrategy('SERVICE');

      expect(strategy).toEqual({ action: 'RETRY_BACKOFF', maxAttempts: 5, interval: 5000 });
      expect(strategy.action).toBe('RETRY_BACKOFF');
      expect(strategy.maxAttempts).toBe(5);
      expect(strategy.interval).toBe(5000);
    });

    it('should have NETWORK strategy', () => {
      const strategy = config.getRecoveryStrategy('NETWORK');

      expect(strategy).toEqual({ action: 'RETRY_IMMEDIATE', maxAttempts: 3, interval: 2000 });
      expect(strategy.action).toBe('RETRY_IMMEDIATE');
      expect(strategy.maxAttempts).toBe(3);
      expect(strategy.interval).toBe(2000);
    });

    it('should have PERMISSIONS strategy', () => {
      const strategy = config.getRecoveryStrategy('PERMISSIONS');

      expect(strategy).toEqual({ action: 'NOTIFY_ADMIN', maxAttempts: 1 });
      expect(strategy.action).toBe('NOTIFY_ADMIN');
      expect(strategy.maxAttempts).toBe(1);
    });

    it('should return DEFAULT strategy for unknown category', () => {
      const strategy = config.getRecoveryStrategy('UNKNOWN_CATEGORY');

      expect(strategy).toEqual({ action: 'RETRY_BACKOFF', maxAttempts: 3, interval: 2000 });
      expect(strategy.action).toBe('RETRY_BACKOFF');
      expect(strategy).toEqual(config.getRecoveryStrategy('DEFAULT'));
    });
  });

  // ===================================================================
  // SYSTEM LIMITS
  // ===================================================================

  describe('System Limits', () => {
    it('should have ABSOLUTE_MAX_ATTEMPTS limit', () => {
      const limit = config.getLimit('ABSOLUTE_MAX_ATTEMPTS');

      expect(limit).toBe(100);
    });

    it('should have MAX_JITTER_MS limit', () => {
      const limit = config.getLimit('MAX_JITTER_MS');

      expect(limit).toBe(1000);
    });

    it('should have MAX_WAIT_TIME_MS limit', () => {
      const limit = config.getLimit('MAX_WAIT_TIME_MS');

      expect(limit).toBe(300000); // 5 minutes
    });

    it('should have MAX_SESSION_ERRORS limit', () => {
      const limit = config.getLimit('MAX_SESSION_ERRORS');

      expect(limit).toBe(1000);
    });

    it('should return undefined for unknown limit', () => {
      const limit = config.getLimit('UNKNOWN_LIMIT');

      expect(limit).toBeUndefined();
    });
  });

  // ===================================================================
  // CUSTOM OVERRIDES
  // ===================================================================

  describe('Custom Overrides', () => {
    it('should accept custom error patterns', () => {
      const customConfig = new ResilienceConfiguration({
        errorPatterns: {
          CUSTOM_ERROR: {
            pattern: /custom error/i,
            category: 'CUSTOM',
            recoverable: true
          }
        }
      });

      const pattern = customConfig.getErrorPattern('CUSTOM_ERROR')!;

      expect(pattern).toEqual({ pattern: /custom error/i, category: 'CUSTOM', recoverable: true });
      expect(pattern.category).toBe('CUSTOM');
      expect(pattern.recoverable).toBe(true);
    });

    it('should merge custom patterns with defaults', () => {
      const customConfig = new ResilienceConfiguration({
        errorPatterns: {
          CUSTOM_ERROR: {
            pattern: /custom/i,
            category: 'CUSTOM',
            recoverable: true
          }
        }
      });

      // Custom pattern should exist
      expect(customConfig.getErrorPattern('CUSTOM_ERROR')).toEqual({
        pattern: /custom/i,
        category: 'CUSTOM',
        recoverable: true
      });

      // Default patterns should still exist
      expect(customConfig.getErrorPattern('QUOTA_EXCEEDED')).toEqual({
        pattern: /quota|limit.*exceeded|too many (requests|times)|service invoked too many/i,
        category: 'QUOTA',
        recoverable: true
      });
      expect(customConfig.getErrorPattern('TIMEOUT')).toEqual({
        pattern: /timeout|time.*limit|execution.*time.*exceeded|exceeded.*time/i,
        category: 'TIMEOUT',
        recoverable: false
      });
    });

    it('should override default patterns', () => {
      const customConfig = new ResilienceConfiguration({
        errorPatterns: {
          QUOTA_EXCEEDED: {
            pattern: /custom quota pattern/i,
            category: 'CUSTOM_QUOTA',
            recoverable: false
          }
        }
      });

      const pattern = customConfig.getErrorPattern('QUOTA_EXCEEDED')!;

      expect(pattern.category).toBe('CUSTOM_QUOTA');
      expect(pattern.recoverable).toBe(false);
    });

    it('should accept custom recovery strategies', () => {
      const customConfig = new ResilienceConfiguration({
        recoveryStrategies: {
          CUSTOM_CATEGORY: {
            action: 'CUSTOM_ACTION',
            maxAttempts: 10,
            interval: 30000
          }
        }
      });

      const strategy = customConfig.getRecoveryStrategy('CUSTOM_CATEGORY');

      expect(strategy).toEqual({ action: 'CUSTOM_ACTION', maxAttempts: 10, interval: 30000 });
      expect(strategy.action).toBe('CUSTOM_ACTION');
      expect(strategy.maxAttempts).toBe(10);
      expect(strategy.interval).toBe(30000);
    });

    it('should override default recovery strategies', () => {
      const customConfig = new ResilienceConfiguration({
        recoveryStrategies: {
          QUOTA: {
            action: 'CUSTOM_QUOTA_ACTION',
            maxAttempts: 10,
            interval: 120000
          }
        }
      });

      const strategy = customConfig.getRecoveryStrategy('QUOTA');

      expect(strategy.action).toBe('CUSTOM_QUOTA_ACTION');
      expect(strategy.maxAttempts).toBe(10);
      expect(strategy.interval).toBe(120000);
    });

    it('should accept custom limits', () => {
      const customConfig = new ResilienceConfiguration({
        limits: {
          CUSTOM_LIMIT: 999
        }
      });

      const limit = customConfig.getLimit('CUSTOM_LIMIT');

      expect(limit).toBe(999);
    });

    it('should override default limits', () => {
      const customConfig = new ResilienceConfiguration({
        limits: {
          ABSOLUTE_MAX_ATTEMPTS: 200,
          MAX_JITTER_MS: 2000
        }
      });

      expect(customConfig.getLimit('ABSOLUTE_MAX_ATTEMPTS')).toBe(200);
      expect(customConfig.getLimit('MAX_JITTER_MS')).toBe(2000);
      expect(customConfig.getLimit('MAX_WAIT_TIME_MS')).toBe(300000); // Unchanged
    });

    it('should accept all three override types together', () => {
      const customConfig = new ResilienceConfiguration({
        errorPatterns: {
          CUSTOM_ERROR: {
            pattern: /custom/i,
            category: 'CUSTOM',
            recoverable: true
          }
        },
        recoveryStrategies: {
          CUSTOM: {
            action: 'CUSTOM_ACTION',
            maxAttempts: 5
          }
        },
        limits: {
          CUSTOM_LIMIT: 500
        }
      });

      expect(customConfig.getErrorPattern('CUSTOM_ERROR')).toEqual({
        pattern: /custom/i,
        category: 'CUSTOM',
        recoverable: true
      });
      expect(customConfig.getRecoveryStrategy('CUSTOM')).toEqual({
        action: 'CUSTOM_ACTION',
        maxAttempts: 5
      });
      expect(customConfig.getLimit('CUSTOM_LIMIT')).toBe(500);
    });
  });

  // ===================================================================
  // STATIC FACTORY METHOD
  // ===================================================================

  describe('Static Factory Method', () => {
    it('should create default configuration via factory', () => {
      const config = ResilienceConfiguration.createDefault();

      expect(Object.keys(config)).toEqual(['errorPatterns', 'recoveryStrategies', 'limits']);
      expect(config).toBeInstanceOf(ResilienceConfiguration);
      expect(config.getErrorPatterns()).toEqual(new ResilienceConfiguration().getErrorPatterns());
      expect(config.getRecoveryStrategies()).toEqual(
        new ResilienceConfiguration().getRecoveryStrategies()
      );
      expect(config.getLimits()).toEqual(new ResilienceConfiguration().getLimits());
    });

    it('should create equivalent configuration to constructor', () => {
      const config1 = new ResilienceConfiguration();
      const config2 = ResilienceConfiguration.createDefault();

      expect(config1.getErrorPatterns()).toEqual(config2.getErrorPatterns());
      expect(config1.getRecoveryStrategies()).toEqual(config2.getRecoveryStrategies());
      expect(config1.getLimits()).toEqual(config2.getLimits());
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle empty errorPatterns override', () => {
      const config = new ResilienceConfiguration({
        errorPatterns: {}
      });

      // Should still have default patterns
      expect(config.getErrorPattern('QUOTA_EXCEEDED')).toEqual({
        pattern: /quota|limit.*exceeded|too many (requests|times)|service invoked too many/i,
        category: 'QUOTA',
        recoverable: true
      });
    });

    it('should handle empty recoveryStrategies override', () => {
      const config = new ResilienceConfiguration({
        recoveryStrategies: {}
      });

      // Should still have default strategies
      expect(config.getRecoveryStrategy('DEFAULT')).toEqual({
        action: 'RETRY_BACKOFF',
        maxAttempts: 3,
        interval: 2000
      });
    });

    it('should handle empty limits override', () => {
      const config = new ResilienceConfiguration({
        limits: {}
      });

      // Should still have default limits
      expect(config.getLimit('ABSOLUTE_MAX_ATTEMPTS')).toBe(100);
    });

    it('should handle null pattern test', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED')!;

      // @ts-expect-error Exercise native RegExp coercion for nullish inputs.
      expect(pattern.pattern.test(null)).toBe(false);
    });

    it('should handle undefined pattern test', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED')!;

      // @ts-expect-error Exercise native RegExp coercion for nullish inputs.
      expect(pattern.pattern.test(undefined)).toBe(false);
    });

    it('should handle empty string pattern test', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED')!;

      expect(pattern.pattern.test('')).toBe(false);
    });

    it('should handle very long error messages', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED')!;
      const longMessage = 'User-rate ' + 'x'.repeat(10000) + ' limit exceeded';

      expect(pattern.pattern.test(longMessage)).toBe(true);
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    it('should configure for high-traffic application', () => {
      const highTrafficConfig = new ResilienceConfiguration({
        recoveryStrategies: {
          QUOTA: {
            action: 'RETRY_BACKOFF_LONG',
            maxAttempts: 5,
            interval: 120000 // 2 minutes
          }
        },
        limits: {
          ABSOLUTE_MAX_ATTEMPTS: 50,
          MAX_WAIT_TIME_MS: 600000 // 10 minutes
        }
      });

      const quotaStrategy = highTrafficConfig.getRecoveryStrategy('QUOTA');
      expect(quotaStrategy.maxAttempts).toBe(5);
      expect(quotaStrategy.interval).toBe(120000);
      expect(highTrafficConfig.getLimit('MAX_WAIT_TIME_MS')).toBe(600000);
    });

    it('should configure for low-latency application', () => {
      const lowLatencyConfig = new ResilienceConfiguration({
        recoveryStrategies: {
          DEFAULT: {
            action: 'RETRY_IMMEDIATE',
            maxAttempts: 2,
            interval: 500
          }
        },
        limits: {
          MAX_WAIT_TIME_MS: 10000 // 10 seconds
        }
      });

      const strategy = lowLatencyConfig.getRecoveryStrategy('DEFAULT');
      expect(strategy.maxAttempts).toBe(2);
      expect(strategy.interval).toBe(500);
    });

    it('should configure for development environment', () => {
      const devConfig = new ResilienceConfiguration({
        recoveryStrategies: {
          DEFAULT: {
            action: 'RETRY_BACKOFF',
            maxAttempts: 1, // Fail fast in dev
            interval: 1000
          }
        },
        limits: {
          MAX_SESSION_ERRORS: 100 // Lower limit for dev
        }
      });

      const strategy = devConfig.getRecoveryStrategy('DEFAULT');
      expect(strategy.maxAttempts).toBe(1);
      expect(devConfig.getLimit('MAX_SESSION_ERRORS')).toBe(100);
    });

    it('should match real Google Apps Script error messages', () => {
      const quotaPattern = config.getErrorPattern('QUOTA_EXCEEDED')!;
      const servicePattern = config.getErrorPattern('SERVICE_UNAVAILABLE')!;
      const timeoutPattern = config.getErrorPattern('TIMEOUT')!;

      // Real GAS error messages
      expect(
        quotaPattern.pattern.test('Service invoked too many times for one day: UrlFetchApp')
      ).toBe(true);
      expect(servicePattern.pattern.test('Service error: Spreadsheet service failed')).toBe(true);
      expect(timeoutPattern.pattern.test('Exceeded maximum execution time')).toBe(true);
    });
  });

  // ===================================================================
  // PATTERN PRIORITY AND ORDERING
  // ===================================================================

  describe('Pattern Priority and Ordering', () => {
    it('should have fatal patterns defined before similar recoverable patterns', () => {
      const patterns = config.getErrorPatterns();
      const keys = Object.keys(patterns);

      // AUTH_REQUIRED should come before other patterns
      const authIndex = keys.indexOf('AUTH_REQUIRED');
      const scriptIndex = keys.indexOf('SCRIPT_ERROR');

      expect(authIndex).toBeGreaterThanOrEqual(0);
      expect(scriptIndex).toBeGreaterThanOrEqual(0);
    });

    it('should differentiate between fatal and recoverable errors', () => {
      const authPattern = config.getErrorPattern('AUTH_REQUIRED')!;
      const quotaPattern = config.getErrorPattern('QUOTA_EXCEEDED')!;

      expect(authPattern.recoverable).toBe(false);
      expect(authPattern.category).toBe('FATAL');

      expect(quotaPattern.recoverable).toBe(true);
      expect(quotaPattern.category).toBe('QUOTA');
    });
  });
});
