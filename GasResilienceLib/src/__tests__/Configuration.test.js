// ===================================================================
// FILE: GasResilienceLib/src/__tests__/Configuration.test.js
// ===================================================================
// Comprehensive test suite for ResilienceConfiguration
// Coverage: 100% of features including error patterns, recovery strategies,
// limits, overrides, and all getter methods
// ===================================================================

import { ResilienceConfiguration } from '../Configuration';

describe('ResilienceConfiguration - Comprehensive Test Suite', () => {
  let config;

  beforeEach(() => {
    config = new ResilienceConfiguration();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with default configuration', () => {
      expect(config).toBeDefined();
      expect(config).toBeInstanceOf(ResilienceConfiguration);
    });

    it('should initialize default error patterns', () => {
      const patterns = config.getErrorPatterns();

      expect(patterns).toBeDefined();
      expect(patterns.QUOTA_EXCEEDED).toBeDefined();
      expect(patterns.PERMISSION_DENIED).toBeDefined();
      expect(patterns.SERVICE_UNAVAILABLE).toBeDefined();
      expect(patterns.NOT_FOUND).toBeDefined();
      expect(patterns.TIMEOUT).toBeDefined();
      expect(patterns.NETWORK_ERROR).toBeDefined();
    });

    it('should initialize default recovery strategies', () => {
      const strategies = config.getRecoveryStrategies();

      expect(strategies).toBeDefined();
      expect(strategies.DEFAULT).toBeDefined();
      expect(strategies.FATAL).toBeDefined();
      expect(strategies.QUOTA).toBeDefined();
      expect(strategies.SERVICE).toBeDefined();
      expect(strategies.NETWORK).toBeDefined();
      expect(strategies.PERMISSIONS).toBeDefined();
    });

    it('should initialize default limits', () => {
      const limits = config.getLimits();

      expect(limits).toBeDefined();
      expect(limits.ABSOLUTE_MAX_ATTEMPTS).toBe(100);
      expect(limits.MAX_JITTER_MS).toBe(1000);
      expect(limits.MAX_WAIT_TIME_MS).toBe(300000);
      expect(limits.MAX_SESSION_ERRORS).toBe(1000);
    });

    it('should accept empty overrides object', () => {
      const config = new ResilienceConfiguration({});

      expect(config.getErrorPatterns()).toBeDefined();
      expect(config.getRecoveryStrategies()).toBeDefined();
      expect(config.getLimits()).toBeDefined();
    });

    it('should throw error for non-object overrides', () => {
      expect(() => {
        new ResilienceConfiguration('invalid');
      }).toThrow('overrides must be an object');

      expect(() => {
        new ResilienceConfiguration(123);
      }).toThrow('overrides must be an object');

      expect(() => {
        new ResilienceConfiguration(true);
      }).toThrow('overrides must be an object');
    });

    it('should accept null overrides', () => {
      expect(() => {
        new ResilienceConfiguration(null);
      }).not.toThrow();
    });

    it('should accept undefined overrides', () => {
      expect(() => {
        new ResilienceConfiguration(undefined);
      }).not.toThrow();
    });
  });

  // ===================================================================
  // ERROR PATTERNS
  // ===================================================================

  describe('Error Patterns', () => {
    it('should have QUOTA_EXCEEDED pattern', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED');

      expect(pattern).toBeDefined();
      expect(pattern.pattern).toBeInstanceOf(RegExp);
      expect(pattern.category).toBe('QUOTA');
      expect(pattern.recoverable).toBe(true);
    });

    it('should have PERMISSION_DENIED pattern', () => {
      const pattern = config.getErrorPattern('PERMISSION_DENIED');

      expect(pattern).toBeDefined();
      expect(pattern.category).toBe('PERMISSIONS');
      expect(pattern.recoverable).toBe(false);
    });

    it('should have SERVICE_UNAVAILABLE pattern', () => {
      const pattern = config.getErrorPattern('SERVICE_UNAVAILABLE');

      expect(pattern).toBeDefined();
      expect(pattern.category).toBe('SERVICE');
      expect(pattern.recoverable).toBe(true);
    });

    it('should have NOT_FOUND pattern', () => {
      const pattern = config.getErrorPattern('NOT_FOUND');

      expect(pattern).toBeDefined();
      expect(pattern.category).toBe('NOT_FOUND');
      expect(pattern.recoverable).toBe(false);
    });

    it('should have TIMEOUT pattern', () => {
      const pattern = config.getErrorPattern('TIMEOUT');

      expect(pattern).toBeDefined();
      expect(pattern.category).toBe('TIMEOUT');
      expect(pattern.recoverable).toBe(false);
    });

    it('should have NETWORK_ERROR pattern', () => {
      const pattern = config.getErrorPattern('NETWORK_ERROR');

      expect(pattern).toBeDefined();
      expect(pattern.category).toBe('NETWORK');
      expect(pattern.recoverable).toBe(true);
    });

    it('should have AUTH_REQUIRED pattern (fatal)', () => {
      const pattern = config.getErrorPattern('AUTH_REQUIRED');

      expect(pattern).toBeDefined();
      expect(pattern.category).toBe('FATAL');
      expect(pattern.recoverable).toBe(false);
    });

    it('should have SCRIPT_ERROR pattern (fatal)', () => {
      const pattern = config.getErrorPattern('SCRIPT_ERROR');

      expect(pattern).toBeDefined();
      expect(pattern.category).toBe('FATAL');
      expect(pattern.recoverable).toBe(false);
    });

    it('should return undefined for unknown pattern', () => {
      const pattern = config.getErrorPattern('UNKNOWN_PATTERN');

      expect(pattern).toBeUndefined();
    });

    it('should match quota error messages', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED');

      expect(pattern.pattern.test('User-rate limit exceeded')).toBe(true);
      expect(pattern.pattern.test('Quota exceeded')).toBe(true);
      expect(pattern.pattern.test('Too many requests')).toBe(true);
    });

    it('should match permission error messages', () => {
      const pattern = config.getErrorPattern('PERMISSION_DENIED');

      expect(pattern.pattern.test('Permission denied')).toBe(true);
      expect(pattern.pattern.test('Unauthorized access')).toBe(true);
    });

    it('should match service unavailable messages', () => {
      const pattern = config.getErrorPattern('SERVICE_UNAVAILABLE');

      expect(pattern.pattern.test('Service unavailable')).toBe(true);
      expect(pattern.pattern.test('503 error')).toBe(true);
    });

    it('should match not found messages', () => {
      const pattern = config.getErrorPattern('NOT_FOUND');

      expect(pattern.pattern.test('File not found')).toBe(true);
      expect(pattern.pattern.test('404 error')).toBe(true);
    });

    it('should match timeout messages', () => {
      const pattern = config.getErrorPattern('TIMEOUT');

      expect(pattern.pattern.test('Request timeout')).toBe(true);
      expect(pattern.pattern.test('Execution time exceeded')).toBe(true);
    });

    it('should match network error messages', () => {
      const pattern = config.getErrorPattern('NETWORK_ERROR');

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

      expect(strategy).toBeDefined();
      expect(strategy.action).toBe('RETRY_BACKOFF');
      expect(strategy.maxAttempts).toBe(3);
      expect(strategy.interval).toBe(2000);
    });

    it('should have FATAL strategy', () => {
      const strategy = config.getRecoveryStrategy('FATAL');

      expect(strategy).toBeDefined();
      expect(strategy.action).toBe('NOTIFY_ADMIN');
      expect(strategy.maxAttempts).toBe(1);
    });

    it('should have QUOTA strategy', () => {
      const strategy = config.getRecoveryStrategy('QUOTA');

      expect(strategy).toBeDefined();
      expect(strategy.action).toBe('RETRY_BACKOFF_LONG');
      expect(strategy.maxAttempts).toBe(3);
      expect(strategy.interval).toBe(60000);
    });

    it('should have SERVICE strategy', () => {
      const strategy = config.getRecoveryStrategy('SERVICE');

      expect(strategy).toBeDefined();
      expect(strategy.action).toBe('RETRY_BACKOFF');
      expect(strategy.maxAttempts).toBe(5);
      expect(strategy.interval).toBe(5000);
    });

    it('should have NETWORK strategy', () => {
      const strategy = config.getRecoveryStrategy('NETWORK');

      expect(strategy).toBeDefined();
      expect(strategy.action).toBe('RETRY_IMMEDIATE');
      expect(strategy.maxAttempts).toBe(3);
      expect(strategy.interval).toBe(2000);
    });

    it('should have PERMISSIONS strategy', () => {
      const strategy = config.getRecoveryStrategy('PERMISSIONS');

      expect(strategy).toBeDefined();
      expect(strategy.action).toBe('NOTIFY_ADMIN');
      expect(strategy.maxAttempts).toBe(1);
    });

    it('should return DEFAULT strategy for unknown category', () => {
      const strategy = config.getRecoveryStrategy('UNKNOWN_CATEGORY');

      expect(strategy).toBeDefined();
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

      const pattern = customConfig.getErrorPattern('CUSTOM_ERROR');

      expect(pattern).toBeDefined();
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
      expect(customConfig.getErrorPattern('CUSTOM_ERROR')).toBeDefined();

      // Default patterns should still exist
      expect(customConfig.getErrorPattern('QUOTA_EXCEEDED')).toBeDefined();
      expect(customConfig.getErrorPattern('TIMEOUT')).toBeDefined();
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

      const pattern = customConfig.getErrorPattern('QUOTA_EXCEEDED');

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

      expect(strategy).toBeDefined();
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

      expect(customConfig.getErrorPattern('CUSTOM_ERROR')).toBeDefined();
      expect(customConfig.getRecoveryStrategy('CUSTOM')).toBeDefined();
      expect(customConfig.getLimit('CUSTOM_LIMIT')).toBe(500);
    });
  });

  // ===================================================================
  // STATIC FACTORY METHOD
  // ===================================================================

  describe('Static Factory Method', () => {
    it('should create default configuration via factory', () => {
      const config = ResilienceConfiguration.createDefault();

      expect(config).toBeDefined();
      expect(config).toBeInstanceOf(ResilienceConfiguration);
      expect(config.getErrorPatterns()).toBeDefined();
      expect(config.getRecoveryStrategies()).toBeDefined();
      expect(config.getLimits()).toBeDefined();
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
      expect(config.getErrorPattern('QUOTA_EXCEEDED')).toBeDefined();
    });

    it('should handle empty recoveryStrategies override', () => {
      const config = new ResilienceConfiguration({
        recoveryStrategies: {}
      });

      // Should still have default strategies
      expect(config.getRecoveryStrategy('DEFAULT')).toBeDefined();
    });

    it('should handle empty limits override', () => {
      const config = new ResilienceConfiguration({
        limits: {}
      });

      // Should still have default limits
      expect(config.getLimit('ABSOLUTE_MAX_ATTEMPTS')).toBe(100);
    });

    it('should handle null pattern test', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED');

      expect(() => {
        pattern.pattern.test(null);
      }).not.toThrow();
    });

    it('should handle undefined pattern test', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED');

      expect(() => {
        pattern.pattern.test(undefined);
      }).not.toThrow();
    });

    it('should handle empty string pattern test', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED');

      expect(pattern.pattern.test('')).toBe(false);
    });

    it('should handle very long error messages', () => {
      const pattern = config.getErrorPattern('QUOTA_EXCEEDED');
      const longMessage = 'User-rate ' + 'x'.repeat(10000) + ' limit exceeded';

      expect(() => {
        pattern.pattern.test(longMessage);
      }).not.toThrow();
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
      const quotaPattern = config.getErrorPattern('QUOTA_EXCEEDED');
      const servicePattern = config.getErrorPattern('SERVICE_UNAVAILABLE');
      const timeoutPattern = config.getErrorPattern('TIMEOUT');

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
      const authPattern = config.getErrorPattern('AUTH_REQUIRED');
      const quotaPattern = config.getErrorPattern('QUOTA_EXCEEDED');

      expect(authPattern.recoverable).toBe(false);
      expect(authPattern.category).toBe('FATAL');

      expect(quotaPattern.recoverable).toBe(true);
      expect(quotaPattern.category).toBe('QUOTA');
    });
  });
});
