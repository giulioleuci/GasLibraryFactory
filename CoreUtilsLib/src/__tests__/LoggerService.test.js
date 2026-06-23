/**
 * @file CoreUtilsLib/src/__tests__/LoggerService.test.js
 * @description Comprehensive unit tests for LoggerService.
 */

import { LoggerService } from '../LoggerService.js';

describe('LoggerService', () => {
  let logger;
  let mockLogs;

  beforeEach(() => {
    mockLogs = [];

    // Mock the global Logger object (Google Apps Script)
    global.Logger = {
      log: jest.fn((msg) => mockLogs.push(msg)),
      getLog: jest.fn(() => mockLogs.join('\n')),
      clear: jest.fn(() => {
        mockLogs = [];
      })
    };

    logger = new LoggerService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default INFO level', () => {
      const defaultLogger = new LoggerService();
      expect(defaultLogger.getLevel()).toBe('INFO');
    });

    it('should create logger with custom level', () => {
      const debugLogger = new LoggerService({ level: 'DEBUG' });
      expect(debugLogger.getLevel()).toBe('DEBUG');
    });

    it('should accept ERROR level', () => {
      const errorLogger = new LoggerService({ level: 'ERROR' });
      expect(errorLogger.getLevel()).toBe('ERROR');
    });

    it('should accept WARN level', () => {
      const warnLogger = new LoggerService({ level: 'WARN' });
      expect(warnLogger.getLevel()).toBe('WARN');
    });

    it('should accept OFF level', () => {
      const offLogger = new LoggerService({ level: 'OFF' });
      expect(offLogger.getLevel()).toBe('OFF');
    });

    it('should keep invalid level as-is (but filtering will use undefined mapping)', () => {
      const invalidLogger = new LoggerService({ level: 'INVALID' });
      expect(invalidLogger.getLevel()).toBe('INVALID');
    });

    it('should handle empty options', () => {
      const emptyLogger = new LoggerService({});
      expect(emptyLogger.getLevel()).toBe('INFO');
    });
  });

  describe('setLevel', () => {
    it('should change the log level', () => {
      logger.setLevel('DEBUG');
      expect(logger.getLevel()).toBe('DEBUG');
    });

    it('should ignore invalid level', () => {
      logger.setLevel('DEBUG');
      logger.setLevel('INVALID');
      expect(logger.getLevel()).toBe('DEBUG');
    });

    it('should return this for method chaining', () => {
      const result = logger.setLevel('DEBUG');
      expect(result).toBe(logger);
    });

    it('should allow chaining multiple calls', () => {
      logger.setLevel('DEBUG').setLevel('WARN').setLevel('ERROR');
      expect(logger.getLevel()).toBe('ERROR');
    });
  });

  describe('getLevel', () => {
    it('should return current log level', () => {
      expect(logger.getLevel()).toBe('INFO');
      logger.setLevel('DEBUG');
      expect(logger.getLevel()).toBe('DEBUG');
    });
  });

  describe('Log Level Filtering', () => {
    describe('at DEBUG level', () => {
      beforeEach(() => {
        logger.setLevel('DEBUG');
      });

      it('should log DEBUG messages', () => {
        logger.debug('debug message');
        expect(Logger.log).toHaveBeenCalledWith('[DEBUG] debug message');
      });

      it('should log INFO messages', () => {
        logger.info('info message');
        expect(Logger.log).toHaveBeenCalledWith('[INFO] info message');
      });

      it('should log WARN messages', () => {
        logger.warn('warn message');
        expect(Logger.log).toHaveBeenCalledWith('[WARN] warn message');
      });

      it('should log ERROR messages', () => {
        logger.error('error message');
        expect(Logger.log).toHaveBeenCalledWith('[ERROR] error message');
      });
    });

    describe('at INFO level', () => {
      beforeEach(() => {
        logger.setLevel('INFO');
      });

      it('should NOT log DEBUG messages', () => {
        logger.debug('debug message');
        expect(Logger.log).not.toHaveBeenCalled();
      });

      it('should log INFO messages', () => {
        logger.info('info message');
        expect(Logger.log).toHaveBeenCalledWith('[INFO] info message');
      });

      it('should log WARN messages', () => {
        logger.warn('warn message');
        expect(Logger.log).toHaveBeenCalledWith('[WARN] warn message');
      });

      it('should log ERROR messages', () => {
        logger.error('error message');
        expect(Logger.log).toHaveBeenCalledWith('[ERROR] error message');
      });
    });

    describe('at WARN level', () => {
      beforeEach(() => {
        logger.setLevel('WARN');
      });

      it('should NOT log DEBUG messages', () => {
        logger.debug('debug message');
        expect(Logger.log).not.toHaveBeenCalled();
      });

      it('should NOT log INFO messages', () => {
        logger.info('info message');
        expect(Logger.log).not.toHaveBeenCalled();
      });

      it('should log WARN messages', () => {
        logger.warn('warn message');
        expect(Logger.log).toHaveBeenCalledWith('[WARN] warn message');
      });

      it('should log ERROR messages', () => {
        logger.error('error message');
        expect(Logger.log).toHaveBeenCalledWith('[ERROR] error message');
      });
    });

    describe('at ERROR level', () => {
      beforeEach(() => {
        logger.setLevel('ERROR');
      });

      it('should NOT log DEBUG messages', () => {
        logger.debug('debug message');
        expect(Logger.log).not.toHaveBeenCalled();
      });

      it('should NOT log INFO messages', () => {
        logger.info('info message');
        expect(Logger.log).not.toHaveBeenCalled();
      });

      it('should NOT log WARN messages', () => {
        logger.warn('warn message');
        expect(Logger.log).not.toHaveBeenCalled();
      });

      it('should log ERROR messages', () => {
        logger.error('error message');
        expect(Logger.log).toHaveBeenCalledWith('[ERROR] error message');
      });
    });

    describe('at OFF level', () => {
      beforeEach(() => {
        logger.setLevel('OFF');
      });

      it('should NOT log any messages', () => {
        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        logger.error('error');
        expect(Logger.log).not.toHaveBeenCalled();
      });
    });
  });

  describe('debug', () => {
    beforeEach(() => {
      logger.setLevel('DEBUG');
    });

    it('should log string message', () => {
      logger.debug('test message');
      expect(Logger.log).toHaveBeenCalledWith('[DEBUG] test message');
    });

    it('should log object message', () => {
      logger.debug({ key: 'value' });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('"key": "value"'));
    });

    it('should log message with context object', () => {
      logger.debug('message', { contextKey: 'contextValue' });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] message'));
      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringContaining('"contextKey": "contextValue"')
      );
    });

    it('should support lazy evaluation with callback', () => {
      const callback = jest.fn(() => 'lazy message');
      logger.debug(callback);
      expect(callback).toHaveBeenCalled();
      expect(Logger.log).toHaveBeenCalledWith('[DEBUG] lazy message');
    });

    it('should NOT call callback when level is not active', () => {
      logger.setLevel('INFO');
      const callback = jest.fn(() => 'lazy message');
      logger.debug(callback);
      expect(callback).not.toHaveBeenCalled();
      expect(Logger.log).not.toHaveBeenCalled();
    });

    it('should support lazy evaluation for context', () => {
      const contextCallback = jest.fn(() => ({ computed: 'value' }));
      logger.debug('message', contextCallback);
      expect(contextCallback).toHaveBeenCalled();
    });

    it('should NOT call context callback when level is not active', () => {
      logger.setLevel('INFO');
      const contextCallback = jest.fn(() => ({ computed: 'value' }));
      logger.debug('message', contextCallback);
      expect(contextCallback).not.toHaveBeenCalled();
    });

    it('should return this for method chaining', () => {
      const result = logger.debug('message');
      expect(result).toBe(logger);
    });
  });

  describe('info', () => {
    it('should log string message', () => {
      logger.info('test message');
      expect(Logger.log).toHaveBeenCalledWith('[INFO] test message');
    });

    it('should log object message', () => {
      logger.info({ key: 'value' });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
    });

    it('should log message with context', () => {
      logger.info('message', { ctx: 'value' });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[INFO] message'));
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('"ctx": "value"'));
    });

    it('should support lazy evaluation', () => {
      const callback = jest.fn(() => 'lazy');
      logger.info(callback);
      expect(callback).toHaveBeenCalled();
    });

    it('should return this for method chaining', () => {
      const result = logger.info('message');
      expect(result).toBe(logger);
    });
  });

  describe('warn', () => {
    it('should log string message', () => {
      logger.warn('warning message');
      expect(Logger.log).toHaveBeenCalledWith('[WARN] warning message');
    });

    it('should log object message', () => {
      logger.warn({ warning: true });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
    });

    it('should log message with context', () => {
      logger.warn('warning', { code: 500 });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[WARN] warning'));
    });

    it('should support lazy evaluation', () => {
      const callback = jest.fn(() => 'lazy warning');
      logger.warn(callback);
      expect(callback).toHaveBeenCalled();
    });

    it('should return this for method chaining', () => {
      const result = logger.warn('message');
      expect(result).toBe(logger);
    });
  });

  describe('error', () => {
    it('should log string message', () => {
      logger.error('error message');
      expect(Logger.log).toHaveBeenCalledWith('[ERROR] error message');
    });

    it('should log object message', () => {
      logger.error({ error: 'details' });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
    });

    it('should log message with context', () => {
      logger.error('error', { stack: 'trace' });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[ERROR] error'));
    });

    it('should support lazy evaluation', () => {
      const callback = jest.fn(() => 'lazy error');
      logger.error(callback);
      expect(callback).toHaveBeenCalled();
    });

    it('should return this for method chaining', () => {
      const result = logger.error('message');
      expect(result).toBe(logger);
    });
  });

  describe('log (dynamic level)', () => {
    beforeEach(() => {
      logger.setLevel('DEBUG');
    });

    it('should log at specified level', () => {
      logger.log('INFO', 'dynamic message');
      expect(Logger.log).toHaveBeenCalledWith('[INFO] dynamic message');
    });

    it('should be case-insensitive', () => {
      logger.log('info', 'lowercase level');
      expect(Logger.log).toHaveBeenCalledWith('[INFO] lowercase level');
    });

    it('should ignore invalid level', () => {
      logger.log('INVALID', 'message');
      expect(Logger.log).not.toHaveBeenCalled();
    });

    it('should respect current log level', () => {
      logger.setLevel('ERROR');
      logger.log('INFO', 'filtered message');
      expect(Logger.log).not.toHaveBeenCalled();
    });

    it('should support lazy evaluation', () => {
      const callback = jest.fn(() => 'lazy dynamic');
      logger.log('DEBUG', callback);
      expect(callback).toHaveBeenCalled();
      expect(Logger.log).toHaveBeenCalledWith('[DEBUG] lazy dynamic');
    });

    it('should NOT call callback when level is not active', () => {
      logger.setLevel('ERROR');
      const callback = jest.fn(() => 'lazy');
      logger.log('DEBUG', callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return this for method chaining', () => {
      const result = logger.log('INFO', 'message');
      expect(result).toBe(logger);
    });
  });

  describe('get', () => {
    it('should return logged messages as array', () => {
      logger.info('message 1');
      logger.warn('message 2');
      const logs = logger.get();
      expect(logs).toEqual(mockLogs.join('\n').split('\n'));
    });

    it('should return empty array when no logs', () => {
      global.Logger.getLog = jest.fn(() => '');
      const logs = logger.get();
      expect(logs).toEqual(['']);
    });
  });

  describe('clear', () => {
    it('should call Logger.clear()', () => {
      logger.clear();
      expect(Logger.clear).toHaveBeenCalled();
    });

    it('should return this for method chaining', () => {
      const result = logger.clear();
      expect(result).toBe(logger);
    });
  });

  describe('_safeStringify', () => {
    beforeEach(() => {
      logger.setLevel('DEBUG');
    });

    it('should handle circular references', () => {
      const obj = { name: 'test' };
      obj.self = obj;
      logger.debug(obj);
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[Circular reference]'));
    });

    it('should handle deeply nested objects', () => {
      const obj = { level: 0 };
      let current = obj;
      for (let i = 1; i <= 10; i++) {
        current.child = { level: i };
        current = current.child;
      }
      logger.debug(obj);
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[Max depth reached]'));
    });

    it('should handle large arrays', () => {
      const largeArray = Array(150).fill('item');
      logger.debug(largeArray);
      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringContaining('[Array(150) - showing first 100]')
      );
    });

    it('should handle objects with many keys', () => {
      const largeObject = {};
      for (let i = 0; i < 60; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }
      logger.debug(largeObject);
      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringContaining('[Object with 60 keys - truncated]')
      );
    });

    it('should truncate very long output', () => {
      const longString = 'a'.repeat(10000);
      logger.debug({ data: longString });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('... [truncated]'));
    });

    it('should handle null values', () => {
      logger.debug({ value: null });
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('"value": null'));
    });

    it('should handle primitive values', () => {
      logger.debug({ num: 42, str: 'text', bool: true });
      const call = Logger.log.mock.calls[0][0];
      expect(call).toContain('"num": 42');
      expect(call).toContain('"str": "text"');
      expect(call).toContain('"bool": true');
    });

    it('should handle arrays within depth limit', () => {
      logger.debug([1, 2, 3]);
      const call = Logger.log.mock.calls[0][0];
      expect(call).toContain('1');
      expect(call).toContain('2');
      expect(call).toContain('3');
    });

    it('should handle property access errors', () => {
      const obj = {};
      Object.defineProperty(obj, 'bad', {
        enumerable: true, // Must be enumerable to be included in Object.keys()
        get() {
          throw new Error('Access denied');
        }
      });
      logger.debug(obj);
      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringContaining('[Error accessing property]')
      );
    });
  });

  describe('child logger', () => {
    let childLogger;

    beforeEach(() => {
      logger.setLevel('DEBUG');
      childLogger = logger.child('MODULE');
    });

    it('should create child logger with prefix', () => {
      childLogger.info('child message');
      expect(Logger.log).toHaveBeenCalledWith('[INFO] [MODULE] child message');
    });

    describe('debug', () => {
      it('should log debug with prefix', () => {
        childLogger.debug('debug message');
        expect(Logger.log).toHaveBeenCalledWith('[DEBUG] [MODULE] debug message');
      });

      it('should support lazy evaluation', () => {
        const callback = jest.fn(() => 'lazy');
        childLogger.debug(callback);
        expect(callback).toHaveBeenCalled();
        expect(Logger.log).toHaveBeenCalledWith('[DEBUG] [MODULE] lazy');
      });

      it('should NOT call callback when level is not active', () => {
        logger.setLevel('INFO');
        const callback = jest.fn(() => 'lazy');
        childLogger.debug(callback);
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe('info', () => {
      it('should log info with prefix', () => {
        childLogger.info('info message');
        expect(Logger.log).toHaveBeenCalledWith('[INFO] [MODULE] info message');
      });

      it('should support lazy evaluation', () => {
        const callback = jest.fn(() => 'lazy');
        childLogger.info(callback);
        expect(callback).toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('should log warn with prefix', () => {
        childLogger.warn('warn message');
        expect(Logger.log).toHaveBeenCalledWith('[WARN] [MODULE] warn message');
      });

      it('should support lazy evaluation', () => {
        const callback = jest.fn(() => 'lazy');
        childLogger.warn(callback);
        expect(callback).toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('should log error with prefix', () => {
        childLogger.error('error message');
        expect(Logger.log).toHaveBeenCalledWith('[ERROR] [MODULE] error message');
      });

      it('should support lazy evaluation', () => {
        const callback = jest.fn(() => 'lazy');
        childLogger.error(callback);
        expect(callback).toHaveBeenCalled();
      });
    });

    describe('log', () => {
      it('should log at specified level with prefix', () => {
        childLogger.log('WARN', 'dynamic message');
        expect(Logger.log).toHaveBeenCalledWith('[WARN] [MODULE] dynamic message');
      });

      it('should support lazy evaluation', () => {
        const callback = jest.fn(() => 'lazy');
        childLogger.log('INFO', callback);
        expect(callback).toHaveBeenCalled();
        expect(Logger.log).toHaveBeenCalledWith('[INFO] [MODULE] lazy');
      });
    });

    it('should respect parent log level', () => {
      logger.setLevel('ERROR');
      childLogger.info('filtered');
      childLogger.warn('filtered');
      childLogger.debug('filtered');
      childLogger.error('logged');
      expect(Logger.log).toHaveBeenCalledTimes(1);
      expect(Logger.log).toHaveBeenCalledWith('[ERROR] [MODULE] logged');
    });

    it('should allow multiple child loggers', () => {
      const child1 = logger.child('AUTH');
      const child2 = logger.child('DATA');
      const child3 = logger.child('API');

      child1.info('auth log');
      child2.info('data log');
      child3.info('api log');

      expect(Logger.log).toHaveBeenCalledWith('[INFO] [AUTH] auth log');
      expect(Logger.log).toHaveBeenCalledWith('[INFO] [DATA] data log');
      expect(Logger.log).toHaveBeenCalledWith('[INFO] [API] api log');
    });
  });

  describe('Method Chaining', () => {
    it('should support chaining all methods', () => {
      logger.setLevel('DEBUG');

      const result = logger
        .clear()
        .setLevel('DEBUG')
        .debug('debug')
        .info('info')
        .warn('warn')
        .error('error')
        .log('INFO', 'dynamic');

      expect(result).toBe(logger);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined context', () => {
      logger.info('message', undefined);
      expect(Logger.log).toHaveBeenCalledWith('[INFO] message');
    });

    it('should handle null context', () => {
      logger.info('message', null);
      expect(Logger.log).toHaveBeenCalledWith('[INFO] message');
    });

    it('should handle empty string message', () => {
      logger.info('');
      expect(Logger.log).toHaveBeenCalledWith('[INFO] ');
    });

    it('should handle number message', () => {
      logger.info(42);
      expect(Logger.log).toHaveBeenCalledWith('[INFO] 42');
    });

    it('should handle boolean message', () => {
      logger.info(true);
      expect(Logger.log).toHaveBeenCalledWith('[INFO] true');
    });

    it('should handle array message as object', () => {
      logger.info([1, 2, 3]);
      // Arrays are objects, so they get stringified
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
    });

    it('should handle nested lazy evaluation', () => {
      logger.setLevel('DEBUG');
      const inner = jest.fn(() => 'inner result');
      const outer = jest.fn(() => `outer: ${inner()}`);
      logger.debug(outer);
      expect(outer).toHaveBeenCalled();
      expect(inner).toHaveBeenCalled();
      expect(Logger.log).toHaveBeenCalledWith('[DEBUG] outer: inner result');
    });

    it('should handle context that is not an object', () => {
      logger.info('message', 'string context');
      // Non-object context is passed but not formatted as JSON
      expect(Logger.log).toHaveBeenCalledWith('[INFO] message');
    });
  });
});
