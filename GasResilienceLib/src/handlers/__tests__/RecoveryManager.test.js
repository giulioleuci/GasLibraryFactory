// ===================================================================
// FILE: GasResilienceLib/src/handlers/__tests__/RecoveryManager.test.js
// ===================================================================
// Comprehensive test suite for RecoveryManager
// Coverage: 100% of features including recovery strategies, exponential backoff, and retry logic
// ===================================================================

import { RecoveryManager } from '../RecoveryManager';
import { ResilienceConfiguration } from '../../Configuration';

describe('RecoveryManager - Comprehensive Test Suite', () => {
  let utils;
  let manager;

  beforeEach(() => {
    utils = {
      sleep: jest.fn()
    };

    manager = new RecoveryManager(utils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with valid utils', () => {
      const manager = new RecoveryManager(utils);

      expect(manager).toBeDefined();
      expect(manager._utils).toBe(utils);
    });

    it('should throw error for missing utils', () => {
      expect(() => {
        new RecoveryManager();
      }).toThrow('RecoveryManager: utils is required and must be an object');

      expect(() => {
        new RecoveryManager(null);
      }).toThrow('RecoveryManager: utils is required and must be an object');
    });

    it('should throw error for invalid utils (not object)', () => {
      expect(() => {
        new RecoveryManager('invalid');
      }).toThrow('RecoveryManager: utils is required and must be an object');

      expect(() => {
        new RecoveryManager(123);
      }).toThrow('RecoveryManager: utils is required and must be an object');
    });

    it('should throw error for utils missing sleep() method', () => {
      expect(() => {
        new RecoveryManager({});
      }).toThrow('RecoveryManager: utils.sleep must be a function');

      expect(() => {
        new RecoveryManager({ sleep: 'not a function' });
      }).toThrow('RecoveryManager: utils.sleep must be a function');
    });

    it('should throw error for invalid config (not object)', () => {
      expect(() => {
        new RecoveryManager(utils, 'invalid');
      }).toThrow('RecoveryManager: config must be an object or null');

      expect(() => {
        new RecoveryManager(utils, 123);
      }).toThrow('RecoveryManager: config must be an object or null');
    });

    it('should accept null or undefined config', () => {
      expect(() => {
        new RecoveryManager(utils, null);
      }).not.toThrow();

      expect(() => {
        new RecoveryManager(utils, undefined);
      }).not.toThrow();
    });

    it('should initialize default strategies', () => {
      const manager = new RecoveryManager(utils);

      expect(manager._strategies.DEFAULT).toBeDefined();
      expect(manager._strategies.FATAL).toBeDefined();
      expect(manager._strategies.QUOTA).toBeDefined();
      expect(manager._strategies.SERVICE).toBeDefined();
      expect(manager._strategies.NETWORK).toBeDefined();
      expect(manager._strategies.PERMISSIONS).toBeDefined();
    });

    it('should use custom strategies from configuration', () => {
      const config = new ResilienceConfiguration({
        recoveryStrategies: {
          CUSTOM_CATEGORY: {
            action: 'RETRY_BACKOFF',
            maxAttempts: 10,
            interval: 3000
          }
        }
      });

      const manager = new RecoveryManager(utils, config);

      expect(manager._strategies.CUSTOM_CATEGORY).toBeDefined();
      expect(manager._strategies.CUSTOM_CATEGORY.maxAttempts).toBe(10);
      expect(manager._strategies.CUSTOM_CATEGORY.interval).toBe(3000);
    });

    it('should have static constants', () => {
      expect(RecoveryManager.MAX_JITTER_MS).toBe(1000);
      expect(RecoveryManager.MAX_WAIT_TIME_MS).toBe(300000);
    });

    it('should store config reference when provided', () => {
      const config = new ResilienceConfiguration();
      const manager = new RecoveryManager(utils, config);

      expect(manager._config).toBe(config);
    });
  });

  // ===================================================================
  // applyStrategy() - BASIC BEHAVIOR
  // ===================================================================

  describe('applyStrategy() - Basic Behavior', () => {
    it('should retry on recoverable errors', () => {
      const classification = {
        category: 'QUOTA',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(true);
      expect(utils.sleep).toHaveBeenCalled();
    });

    it('should not retry when max attempts reached', () => {
      const classification = {
        category: 'QUOTA', // maxAttempts: 3
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 3, 'RECOVERY');

      expect(shouldRetry).toBe(false);
      expect(utils.sleep).not.toHaveBeenCalled();
    });

    it('should not retry when error is not recoverable', () => {
      const classification = {
        category: 'QUOTA',
        recoverable: false
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(false);
      expect(utils.sleep).not.toHaveBeenCalled();
    });

    it('should use DEFAULT strategy for unknown categories', () => {
      const classification = {
        category: 'UNKNOWN_CATEGORY',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(true);
      // DEFAULT strategy has maxAttempts: 3
      expect(manager.applyStrategy(classification, 3, 'RECOVERY')).toBe(false);
    });

    it('should respect custom max attempts override', () => {
      const classification = {
        category: 'QUOTA', // default maxAttempts: 3
        recoverable: true
      };

      // Override to 5 attempts
      const shouldRetry = manager.applyStrategy(classification, 4, 'RECOVERY', 5);

      expect(shouldRetry).toBe(true);
      expect(utils.sleep).toHaveBeenCalled();
    });

    it('should not retry when custom max attempts reached', () => {
      const classification = {
        category: 'QUOTA',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 2, 'RECOVERY', 2);

      expect(shouldRetry).toBe(false);
      expect(utils.sleep).not.toHaveBeenCalled();
    });

    it('should return true and sleep for valid retry', () => {
      const classification = {
        category: 'SERVICE',
        recoverable: true
      };

      const result = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(result).toBe(true);
      expect(utils.sleep).toHaveBeenCalledTimes(1);
      expect(utils.sleep).toHaveBeenCalledWith(expect.any(Number));
    });

    it('should return false for non-recoverable errors', () => {
      const classification = {
        category: 'FATAL',
        recoverable: false
      };

      const result = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(result).toBe(false);
      expect(utils.sleep).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // applyStrategy() - EXPONENTIAL BACKOFF
  // ===================================================================

  describe('applyStrategy() - Exponential Backoff', () => {
    it('should apply exponential backoff for first attempt', () => {
      const classification = {
        category: 'DEFAULT', // interval: 2000ms
        recoverable: true
      };

      manager.applyStrategy(classification, 1, 'RECOVERY');

      // First attempt: 2000 * 2^0 + jitter = 2000 + (0-1000)
      const sleepTime = utils.sleep.mock.calls[0][0];
      expect(sleepTime).toBeGreaterThanOrEqual(2000);
      expect(sleepTime).toBeLessThan(3000);
    });

    it('should apply exponential backoff for second attempt', () => {
      const classification = {
        category: 'DEFAULT', // interval: 2000ms
        recoverable: true
      };

      manager.applyStrategy(classification, 2, 'RECOVERY');

      // Second attempt: 2000 * 2^1 + jitter = 4000 + (0-1000)
      const sleepTime = utils.sleep.mock.calls[0][0];
      expect(sleepTime).toBeGreaterThanOrEqual(4000);
      expect(sleepTime).toBeLessThan(5000);
    });

    it('should apply exponential backoff for third attempt', () => {
      const classification = {
        category: 'SERVICE', // interval: 5000ms, maxAttempts: 5
        recoverable: true
      };

      manager.applyStrategy(classification, 3, 'RECOVERY');

      // Third attempt: 5000 * 2^2 + jitter = 20000 + (0-1000)
      const sleepTime = utils.sleep.mock.calls[0][0];
      expect(sleepTime).toBeGreaterThanOrEqual(20000);
      expect(sleepTime).toBeLessThan(21000);
    });

    it('should cap wait time at MAX_WAIT_TIME_MS', () => {
      const classification = {
        category: 'QUOTA', // interval: 60000ms
        recoverable: true
      };

      // Large attempt number: 60000 * 2^10 = 61,440,000ms (exceeds MAX_WAIT_TIME)
      manager.applyStrategy(classification, 11, 'RECOVERY', 15);

      const sleepTime = utils.sleep.mock.calls[0][0];
      expect(sleepTime).toBeLessThanOrEqual(RecoveryManager.MAX_WAIT_TIME_MS);
    });

    it('should add random jitter to backoff', () => {
      const classification = {
        category: 'DEFAULT',
        recoverable: true
      };

      // Call multiple times and verify sleep times are different (due to jitter)
      const sleepTimes = [];
      for (let i = 0; i < 10; i++) {
        jest.clearAllMocks();
        manager.applyStrategy(classification, 1, 'RECOVERY');
        sleepTimes.push(utils.sleep.mock.calls[0][0]);
      }

      // At least some sleep times should be different due to random jitter
      const uniqueTimes = new Set(sleepTimes);
      expect(uniqueTimes.size).toBeGreaterThan(1);
    });

    it('should use strategy interval for backoff calculation', () => {
      const classification = {
        category: 'QUOTA', // interval: 60000ms (1 minute)
        recoverable: true
      };

      manager.applyStrategy(classification, 1, 'RECOVERY');

      // First attempt: 60000 * 2^0 + jitter = 60000 + (0-1000)
      const sleepTime = utils.sleep.mock.calls[0][0];
      expect(sleepTime).toBeGreaterThanOrEqual(60000);
      expect(sleepTime).toBeLessThan(61000);
    });

    it('should handle zero interval gracefully', () => {
      // Create custom strategy with zero interval
      const customManager = new RecoveryManager(utils);
      customManager._strategies.ZERO_INTERVAL = {
        action: 'RETRY_BACKOFF',
        maxAttempts: 3,
        interval: 0
      };

      const classification = {
        category: 'ZERO_INTERVAL',
        recoverable: true
      };

      const shouldRetry = customManager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(true);
      expect(utils.sleep).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // applyStrategy() - STRATEGY TYPES
  // ===================================================================

  describe('applyStrategy() - Strategy Types', () => {
    it('should apply DEFAULT strategy', () => {
      const classification = {
        category: 'DEFAULT',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(true);
      expect(manager.applyStrategy(classification, 3, 'RECOVERY')).toBe(false);
    });

    it('should apply FATAL strategy (no retry)', () => {
      const classification = {
        category: 'FATAL',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(false);
      expect(utils.sleep).not.toHaveBeenCalled();
    });

    it('should apply QUOTA strategy (long backoff)', () => {
      const classification = {
        category: 'QUOTA',
        recoverable: true
      };

      manager.applyStrategy(classification, 1, 'RECOVERY');

      // QUOTA has 60000ms interval
      const sleepTime = utils.sleep.mock.calls[0][0];
      expect(sleepTime).toBeGreaterThanOrEqual(60000);
      expect(sleepTime).toBeLessThan(61000);
    });

    it('should apply SERVICE strategy (5 attempts)', () => {
      const classification = {
        category: 'SERVICE',
        recoverable: true
      };

      expect(manager.applyStrategy(classification, 1, 'RECOVERY')).toBe(true);
      expect(manager.applyStrategy(classification, 2, 'RECOVERY')).toBe(true);
      expect(manager.applyStrategy(classification, 3, 'RECOVERY')).toBe(true);
      expect(manager.applyStrategy(classification, 4, 'RECOVERY')).toBe(true);
      expect(manager.applyStrategy(classification, 5, 'RECOVERY')).toBe(false); // Max reached
    });

    it('should apply NETWORK strategy (immediate retry)', () => {
      const classification = {
        category: 'NETWORK',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(true);
      expect(utils.sleep).toHaveBeenCalled();
    });

    it('should apply PERMISSIONS strategy (no retry)', () => {
      const classification = {
        category: 'PERMISSIONS',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(false);
      expect(utils.sleep).not.toHaveBeenCalled();
    });

    it('should fallback to DEFAULT for undefined categories', () => {
      const classification = {
        category: 'SOME_UNKNOWN_CATEGORY',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(true);
      // Verify DEFAULT limits apply (maxAttempts: 3)
      expect(manager.applyStrategy(classification, 3, 'RECOVERY')).toBe(false);
    });

    it('should handle RETRY_BACKOFF action', () => {
      const classification = {
        category: 'DEFAULT', // action: 'RETRY_BACKOFF'
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(true);
      expect(utils.sleep).toHaveBeenCalled();
    });

    it('should handle RETRY_IMMEDIATE action', () => {
      const classification = {
        category: 'NETWORK', // action: 'RETRY_IMMEDIATE'
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(true);
      expect(utils.sleep).toHaveBeenCalled();
    });

    it('should handle NOTIFY_ADMIN action (no retry)', () => {
      const classification = {
        category: 'FATAL', // action: 'NOTIFY_ADMIN'
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(false);
      expect(utils.sleep).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // applyStrategy() - INPUT VALIDATION
  // ===================================================================

  describe('applyStrategy() - Input Validation', () => {
    it('should throw error for null classification', () => {
      expect(() => {
        manager.applyStrategy(null, 1, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: classification must be an object');
    });

    it('should throw error for undefined classification', () => {
      expect(() => {
        manager.applyStrategy(undefined, 1, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: classification must be an object');
    });

    it('should throw error for classification not object', () => {
      expect(() => {
        manager.applyStrategy('invalid', 1, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: classification must be an object');
    });

    it('should throw error for missing category', () => {
      expect(() => {
        manager.applyStrategy({ recoverable: true }, 1, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: classification.category must be a string');
    });

    it('should throw error for invalid category (not string)', () => {
      expect(() => {
        manager.applyStrategy({ category: 123, recoverable: true }, 1, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: classification.category must be a string');
    });

    it('should throw error for missing recoverable', () => {
      expect(() => {
        manager.applyStrategy({ category: 'QUOTA' }, 1, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: classification.recoverable must be a boolean');
    });

    it('should throw error for invalid recoverable (not boolean)', () => {
      expect(() => {
        manager.applyStrategy({ category: 'QUOTA', recoverable: 'yes' }, 1, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: classification.recoverable must be a boolean');
    });

    it('should throw error for invalid attempt (negative)', () => {
      const classification = { category: 'QUOTA', recoverable: true };

      expect(() => {
        manager.applyStrategy(classification, -1, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: attempt must be a positive integer');
    });

    it('should throw error for invalid attempt (zero)', () => {
      const classification = { category: 'QUOTA', recoverable: true };

      expect(() => {
        manager.applyStrategy(classification, 0, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: attempt must be a positive integer');
    });

    it('should throw error for invalid attempt (float)', () => {
      const classification = { category: 'QUOTA', recoverable: true };

      expect(() => {
        manager.applyStrategy(classification, 1.5, 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: attempt must be a positive integer');
    });

    it('should throw error for invalid attempt (not number)', () => {
      const classification = { category: 'QUOTA', recoverable: true };

      expect(() => {
        manager.applyStrategy(classification, '1', 'RECOVERY');
      }).toThrow('RecoveryManager.applyStrategy: attempt must be a positive integer');
    });

    it('should throw error for invalid customMaxAttempts (negative)', () => {
      const classification = { category: 'QUOTA', recoverable: true };

      expect(() => {
        manager.applyStrategy(classification, 1, 'RECOVERY', -1);
      }).toThrow('RecoveryManager.applyStrategy: customMaxAttempts must be a positive integer');
    });

    it('should throw error for invalid customMaxAttempts (zero)', () => {
      const classification = { category: 'QUOTA', recoverable: true };

      expect(() => {
        manager.applyStrategy(classification, 1, 'RECOVERY', 0);
      }).toThrow('RecoveryManager.applyStrategy: customMaxAttempts must be a positive integer');
    });

    it('should throw error for invalid customMaxAttempts (float)', () => {
      const classification = { category: 'QUOTA', recoverable: true };

      expect(() => {
        manager.applyStrategy(classification, 1, 'RECOVERY', 2.5);
      }).toThrow('RecoveryManager.applyStrategy: customMaxAttempts must be a positive integer');
    });

    it('should throw error for invalid customMaxAttempts (not number)', () => {
      const classification = { category: 'QUOTA', recoverable: true };

      expect(() => {
        manager.applyStrategy(classification, 1, 'RECOVERY', '5');
      }).toThrow('RecoveryManager.applyStrategy: customMaxAttempts must be a positive integer');
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    it('should handle quota error with progressive backoff', () => {
      const classification = {
        category: 'QUOTA',
        recoverable: true
      };

      // First retry
      manager.applyStrategy(classification, 1, 'RECOVERY');
      const firstWait = utils.sleep.mock.calls[0][0];
      expect(firstWait).toBeGreaterThanOrEqual(60000); // 60s + jitter

      jest.clearAllMocks();

      // Second retry
      manager.applyStrategy(classification, 2, 'RECOVERY');
      const secondWait = utils.sleep.mock.calls[0][0];
      expect(secondWait).toBeGreaterThanOrEqual(120000); // 120s + jitter

      // Second wait should be longer
      expect(secondWait).toBeGreaterThan(firstWait);
    });

    it('should handle network error retry sequence', () => {
      const classification = {
        category: 'NETWORK',
        recoverable: true
      };

      // Attempt 1: retry
      expect(manager.applyStrategy(classification, 1, 'RECOVERY')).toBe(true);

      // Attempt 2: retry
      expect(manager.applyStrategy(classification, 2, 'RECOVERY')).toBe(true);

      // Attempt 3: max reached, no retry
      expect(manager.applyStrategy(classification, 3, 'RECOVERY')).toBe(false);
    });

    it('should not retry fatal errors', () => {
      const classification = {
        category: 'FATAL',
        recoverable: true
      };

      const shouldRetry = manager.applyStrategy(classification, 1, 'RECOVERY');

      expect(shouldRetry).toBe(false);
      expect(utils.sleep).not.toHaveBeenCalled();
    });

    it('should handle service errors with multiple attempts', () => {
      const classification = {
        category: 'SERVICE',
        recoverable: true
      };

      // SERVICE allows up to 5 attempts
      for (let i = 1; i < 5; i++) {
        expect(manager.applyStrategy(classification, i, 'RECOVERY')).toBe(true);
      }

      // 5th attempt should fail (max reached)
      expect(manager.applyStrategy(classification, 5, 'RECOVERY')).toBe(false);
    });

    it('should respect custom max attempts override', () => {
      const classification = {
        category: 'QUOTA', // default max: 3
        recoverable: true
      };

      // Override to allow 10 attempts
      for (let i = 1; i < 10; i++) {
        expect(manager.applyStrategy(classification, i, 'RECOVERY', 10)).toBe(true);
      }

      // 10th attempt should fail (custom max reached)
      expect(manager.applyStrategy(classification, 10, 'RECOVERY', 10)).toBe(false);
    });

    it('should use configuration limits for jitter and max wait time', () => {
      const config = new ResilienceConfiguration({
        systemLimits: {
          MAX_JITTER_MS: 500,
          MAX_WAIT_TIME_MS: 60000
        }
      });

      const customManager = new RecoveryManager(utils, config);

      const classification = {
        category: 'DEFAULT',
        recoverable: true
      };

      customManager.applyStrategy(classification, 1, 'RECOVERY');

      const sleepTime = utils.sleep.mock.calls[0][0];
      // Should use custom max wait time
      expect(sleepTime).toBeLessThanOrEqual(60000);
    });

    it('should handle mixed error types in sequence', () => {
      const quotaError = { category: 'QUOTA', recoverable: true };
      const networkError = { category: 'NETWORK', recoverable: true };
      const fatalError = { category: 'FATAL', recoverable: false };

      expect(manager.applyStrategy(quotaError, 1, 'RECOVERY')).toBe(true);
      expect(manager.applyStrategy(networkError, 1, 'RECOVERY')).toBe(true);
      expect(manager.applyStrategy(fatalError, 1, 'RECOVERY')).toBe(false);
    });

    it('should provide deterministic backoff for testing', () => {
      const classification = {
        category: 'DEFAULT',
        recoverable: true
      };

      // Override Math.random for deterministic testing
      const originalRandom = Math.random;
      Math.random = () => 0.5;

      manager.applyStrategy(classification, 1, 'RECOVERY');

      // First attempt: 2000 * 2^0 + (0.5 * 1000) = 2500ms
      expect(utils.sleep).toHaveBeenCalledWith(2500);

      Math.random = originalRandom;
    });
  });
});
