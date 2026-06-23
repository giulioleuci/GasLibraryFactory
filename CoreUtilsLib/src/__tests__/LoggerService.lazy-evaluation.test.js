// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/LoggerService.lazy-evaluation.test.js
// ===================================================================
// Test suite for LoggerService lazy evaluation feature
// Coverage: Callback-based lazy evaluation to prevent unnecessary CPU usage
// ===================================================================

import { LoggerService } from '../LoggerService';

describe('LoggerService - Lazy Evaluation', () => {
  let logger;
  let loggerSpy;

  beforeEach(() => {
    global.resetGasMocks();

    // Spy on global Logger
    loggerSpy = jest.spyOn(global.Logger, 'log');

    logger = new LoggerService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ===================================================================
  // LAZY EVALUATION - DEBUG LEVEL
  // ===================================================================

  describe('debug() - Lazy Evaluation', () => {
    it('should NOT execute callback when DEBUG level is disabled', () => {
      logger.setLevel('INFO'); // DEBUG is not active at INFO level

      const expensiveCallback = jest.fn(() => 'expensive result');

      logger.debug(expensiveCallback);

      // Callback should NOT be executed
      expect(expensiveCallback).not.toHaveBeenCalled();
      // Logger should NOT be called
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should execute callback when DEBUG level is enabled', () => {
      logger.setLevel('DEBUG');

      const expensiveCallback = jest.fn(() => 'debug message');

      logger.debug(expensiveCallback);

      // Callback should be executed exactly once
      expect(expensiveCallback).toHaveBeenCalledTimes(1);
      // Logger should be called with the callback result
      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain('debug message');
    });

    it('should support lazy evaluation for both message and context', () => {
      logger.setLevel('DEBUG');

      const messageCallback = jest.fn(() => 'message');
      const contextCallback = jest.fn(() => ({ key: 'value' }));

      logger.debug(messageCallback, contextCallback);

      expect(messageCallback).toHaveBeenCalledTimes(1);
      expect(contextCallback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should NOT execute context callback when DEBUG level is disabled', () => {
      logger.setLevel('INFO');

      const messageCallback = jest.fn(() => 'message');
      const contextCallback = jest.fn(() => ({ key: 'value' }));

      logger.debug(messageCallback, contextCallback);

      // Neither callback should be executed
      expect(messageCallback).not.toHaveBeenCalled();
      expect(contextCallback).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should handle callback returning object', () => {
      logger.setLevel('DEBUG');

      const callback = jest.fn(() => ({ userId: 123, action: 'login' }));

      logger.debug(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
      const logMessage = loggerSpy.mock.calls[0][0];
      expect(logMessage).toContain('userId');
      expect(logMessage).toContain('123');
    });

    it('should handle callback with expensive JSON.stringify', () => {
      logger.setLevel('DEBUG');

      const largeObject = { data: Array(1000).fill({ value: 'test' }) };
      const callback = jest.fn(() => JSON.stringify(largeObject));

      logger.debug(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // LAZY EVALUATION - INFO LEVEL
  // ===================================================================

  describe('info() - Lazy Evaluation', () => {
    it('should NOT execute callback when INFO level is disabled', () => {
      logger.setLevel('ERROR'); // INFO is not active at ERROR level

      const expensiveCallback = jest.fn(() => 'expensive result');

      logger.info(expensiveCallback);

      expect(expensiveCallback).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should execute callback when INFO level is enabled', () => {
      logger.setLevel('INFO');

      const callback = jest.fn(() => 'info message');

      logger.info(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain('info message');
    });

    it('should support lazy evaluation for context parameter', () => {
      logger.setLevel('INFO');

      const contextCallback = jest.fn(() => ({ timestamp: Date.now() }));

      logger.info('Message', contextCallback);

      expect(contextCallback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // LAZY EVALUATION - WARN LEVEL
  // ===================================================================

  describe('warn() - Lazy Evaluation', () => {
    it('should NOT execute callback when WARN level is disabled', () => {
      logger.setLevel('ERROR'); // WARN is not active at ERROR level

      const expensiveCallback = jest.fn(() => 'expensive result');

      logger.warn(expensiveCallback);

      expect(expensiveCallback).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should execute callback when WARN level is enabled', () => {
      logger.setLevel('WARN');

      const callback = jest.fn(() => 'warning message');

      logger.warn(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain('warning message');
    });
  });

  // ===================================================================
  // LAZY EVALUATION - ERROR LEVEL
  // ===================================================================

  describe('error() - Lazy Evaluation', () => {
    it('should NOT execute callback when ERROR level is disabled', () => {
      logger.setLevel('OFF'); // ERROR is not active at OFF level

      const expensiveCallback = jest.fn(() => 'expensive result');

      logger.error(expensiveCallback);

      expect(expensiveCallback).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should execute callback when ERROR level is enabled', () => {
      logger.setLevel('ERROR');

      const callback = jest.fn(() => 'error message');

      logger.error(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain('error message');
    });

    it('should handle callback returning error details', () => {
      logger.setLevel('ERROR');

      const callback = jest.fn(() => ({
        error: 'Connection timeout',
        code: 500,
        stack: 'Error: Connection timeout\n  at ...'
      }));

      logger.error(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
      const logMessage = loggerSpy.mock.calls[0][0];
      expect(logMessage).toContain('Connection timeout');
      expect(logMessage).toContain('500');
    });
  });

  // ===================================================================
  // LAZY EVALUATION - DYNAMIC log() METHOD
  // ===================================================================

  describe('log() - Lazy Evaluation with Dynamic Levels', () => {
    it('should NOT execute callback for disabled level', () => {
      logger.setLevel('ERROR');

      const callback = jest.fn(() => 'debug message');

      logger.log('DEBUG', callback);

      expect(callback).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should execute callback for enabled level', () => {
      logger.setLevel('DEBUG');

      const callback = jest.fn(() => 'debug message');

      logger.log('DEBUG', callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should handle lowercase level names', () => {
      logger.setLevel('DEBUG');

      const callback = jest.fn(() => 'debug message');

      logger.log('debug', callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should NOT execute callback for invalid level', () => {
      const callback = jest.fn(() => 'message');

      logger.log('INVALID', callback);

      expect(callback).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // LAZY EVALUATION - CHILD LOGGER
  // ===================================================================

  describe('child() - Lazy Evaluation with Prefixed Logger', () => {
    it('should NOT execute callback in child logger when level is disabled', () => {
      logger.setLevel('INFO');
      const childLogger = logger.child('MODULE');

      const callback = jest.fn(() => 'debug message');

      childLogger.debug(callback);

      expect(callback).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should execute callback in child logger when level is enabled', () => {
      logger.setLevel('DEBUG');
      const childLogger = logger.child('MODULE');

      const callback = jest.fn(() => 'debug message');

      childLogger.debug(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
      const logMessage = loggerSpy.mock.calls[0][0];
      expect(logMessage).toContain('[MODULE]');
      expect(logMessage).toContain('debug message');
    });

    it('should support lazy evaluation in child logger info()', () => {
      logger.setLevel('INFO');
      const childLogger = logger.child('API');

      const callback = jest.fn(() => 'request received');

      childLogger.info(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
      const logMessage = loggerSpy.mock.calls[0][0];
      expect(logMessage).toContain('[API]');
      expect(logMessage).toContain('request received');
    });

    it('should support lazy evaluation in child logger warn()', () => {
      logger.setLevel('WARN');
      const childLogger = logger.child('CACHE');

      const callback = jest.fn(() => 'cache miss');

      childLogger.warn(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should support lazy evaluation in child logger error()', () => {
      logger.setLevel('ERROR');
      const childLogger = logger.child('DB');

      const callback = jest.fn(() => 'connection failed');

      childLogger.error(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should support lazy evaluation in child logger log()', () => {
      logger.setLevel('INFO');
      const childLogger = logger.child('WORKER');

      const callback = jest.fn(() => 'processing task');

      childLogger.log('INFO', callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should NOT execute callback in child logger log() when level is disabled', () => {
      logger.setLevel('ERROR');
      const childLogger = logger.child('WORKER');

      const callback = jest.fn(() => 'debug info');

      childLogger.log('DEBUG', callback);

      expect(callback).not.toHaveBeenCalled();
      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // BACKWARDS COMPATIBILITY - NON-CALLBACK USAGE
  // ===================================================================

  describe('Backwards Compatibility - Regular Usage Still Works', () => {
    it('should still work with regular string messages', () => {
      logger.setLevel('DEBUG');

      logger.debug('Regular message');

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy.mock.calls[0][0]).toContain('Regular message');
    });

    it('should still work with object messages', () => {
      logger.setLevel('INFO');

      logger.info({ key: 'value' });

      expect(loggerSpy).toHaveBeenCalled();
      const logMessage = loggerSpy.mock.calls[0][0];
      expect(logMessage).toContain('key');
      expect(logMessage).toContain('value');
    });

    it('should still work with message and context', () => {
      logger.setLevel('INFO');

      logger.info('Message', { userId: 123 });

      expect(loggerSpy).toHaveBeenCalled();
      const logMessage = loggerSpy.mock.calls[0][0];
      expect(logMessage).toContain('Message');
      expect(logMessage).toContain('123');
    });

    it('should still work with child logger regular usage', () => {
      logger.setLevel('INFO');
      const childLogger = logger.child('MODULE');

      childLogger.info('Regular message');

      expect(loggerSpy).toHaveBeenCalled();
      const logMessage = loggerSpy.mock.calls[0][0];
      expect(logMessage).toContain('[MODULE]');
      expect(logMessage).toContain('Regular message');
    });
  });

  // ===================================================================
  // PERFORMANCE SCENARIOS
  // ===================================================================

  describe('Performance Benefits - Real-World Scenarios', () => {
    it('should avoid expensive JSON.stringify when level is disabled', () => {
      logger.setLevel('INFO'); // DEBUG disabled

      const largeObject = { data: Array(10000).fill({ value: 'test' }) };
      const stringifyCallback = jest.fn(() => JSON.stringify(largeObject));

      logger.debug(stringifyCallback);

      // JSON.stringify should NOT be called
      expect(stringifyCallback).not.toHaveBeenCalled();
    });

    it('should avoid expensive computations when level is disabled', () => {
      logger.setLevel('ERROR'); // INFO disabled

      const expensiveComputation = jest.fn(() => {
        // Simulate expensive operation
        let result = 0;
        for (let i = 0; i < 1000; i++) {
          result += Math.sqrt(i);
        }
        return `Result: ${result}`;
      });

      logger.info(expensiveComputation);

      // Computation should NOT be executed
      expect(expensiveComputation).not.toHaveBeenCalled();
    });

    it('should avoid multiple expensive operations in context', () => {
      logger.setLevel('WARN'); // DEBUG disabled

      const messageCallback = jest.fn(() => 'message');
      const contextCallback = jest.fn(() => ({
        timestamp: Date.now(),
        data: JSON.stringify({ large: 'object' })
      }));

      logger.debug(messageCallback, contextCallback);

      // Neither should be executed
      expect(messageCallback).not.toHaveBeenCalled();
      expect(contextCallback).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases - Lazy Evaluation', () => {
    it('should handle callback returning null', () => {
      logger.setLevel('INFO');

      const callback = jest.fn(() => null);

      logger.info(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should handle callback returning undefined', () => {
      logger.setLevel('INFO');

      const callback = jest.fn(() => undefined);

      logger.info(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should handle callback returning empty string', () => {
      logger.setLevel('INFO');

      const callback = jest.fn(() => '');

      logger.info(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should handle callback throwing error', () => {
      logger.setLevel('INFO');

      const callback = jest.fn(() => {
        throw new Error('Callback error');
      });

      expect(() => {
        logger.info(callback);
      }).toThrow('Callback error');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle null context callback', () => {
      logger.setLevel('INFO');

      logger.info('Message', null);

      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
