// ===================================================================
// FILE: JobRunnerLib/src/__tests__/CapturingLogger.test.js
// ===================================================================
// Comprehensive test suite for CapturingLogger
// Coverage: Log capture, forwarding, and retrieval
// ===================================================================

import { CapturingLogger } from '../internal/CapturingLogger';

describe('CapturingLogger - Comprehensive Test Suite', () => {
  let realLogger;
  let capturingLogger;

  beforeEach(() => {
    realLogger = {
      debug: jest.fn().mockReturnThis(),
      info: jest.fn().mockReturnThis(),
      warn: jest.fn().mockReturnThis(),
      error: jest.fn().mockReturnThis(),
      log: jest.fn().mockReturnThis(),
      setLevel: jest.fn().mockReturnThis(),
      getLevel: jest.fn(() => 'INFO')
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR
  // ===================================================================

  describe('Constructor', () => {
    it('should initialize with real logger', () => {
      capturingLogger = new CapturingLogger(realLogger);

      expect(capturingLogger._realLogger).toBe(realLogger);
      expect(capturingLogger._maxBufferSize).toBe(1000);
      expect(capturingLogger._capturedLogs).toEqual([]);
    });

    it('should initialize with custom buffer size', () => {
      capturingLogger = new CapturingLogger(realLogger, 500);

      expect(capturingLogger._maxBufferSize).toBe(500);
    });

    it('should throw error if realLogger is null', () => {
      expect(() => {
        new CapturingLogger(null);
      }).toThrow('CapturingLogger: realLogger is required');
    });

    it('should throw error if realLogger missing debug method', () => {
      const invalidLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

      expect(() => {
        new CapturingLogger(invalidLogger);
      }).toThrow('CapturingLogger: realLogger must have method: debug');
    });

    it('should throw error if realLogger missing info method', () => {
      const invalidLogger = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };

      expect(() => {
        new CapturingLogger(invalidLogger);
      }).toThrow('CapturingLogger: realLogger must have method: info');
    });

    it('should throw error if maxBufferSize is not a number', () => {
      expect(() => {
        new CapturingLogger(realLogger, '500');
      }).toThrow('CapturingLogger: maxBufferSize must be a positive number');
    });

    it('should throw error if maxBufferSize is zero', () => {
      expect(() => {
        new CapturingLogger(realLogger, 0);
      }).toThrow('CapturingLogger: maxBufferSize must be a positive number');
    });

    it('should throw error if maxBufferSize is negative', () => {
      expect(() => {
        new CapturingLogger(realLogger, -100);
      }).toThrow('CapturingLogger: maxBufferSize must be a positive number');
    });
  });

  // ===================================================================
  // LOGGING METHODS (CAPTURE AND FORWARD)
  // ===================================================================

  describe('debug()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should forward to real logger', () => {
      capturingLogger.debug('Debug message');

      expect(realLogger.debug).toHaveBeenCalledWith('Debug message', null);
    });

    it('should capture log entry', () => {
      capturingLogger.debug('Debug message');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('DEBUG');
      expect(logs[0].message).toBe('Debug message');
      expect(logs[0].context).toBeNull();
    });

    it('should capture log entry with context', () => {
      capturingLogger.debug('Debug message', { userId: 123 });

      const logs = capturingLogger.getCapturedLogs();
      expect(logs[0].context).toEqual({ userId: 123 });
    });

    it('should support method chaining', () => {
      const result = capturingLogger.debug('Message');

      expect(result).toBe(capturingLogger);
    });

    it('should handle object messages', () => {
      capturingLogger.debug({ key: 'value' });

      const logs = capturingLogger.getCapturedLogs();
      expect(logs[0].message).toBe('{"key":"value"}');
    });

    it('should handle lazy evaluation with function', () => {
      capturingLogger.debug(() => 'Lazy message');

      expect(realLogger.debug).toHaveBeenCalled();
      const logs = capturingLogger.getCapturedLogs();
      expect(logs[0].message).toBe('Lazy message');
    });
  });

  describe('info()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should forward to real logger', () => {
      capturingLogger.info('Info message');

      expect(realLogger.info).toHaveBeenCalledWith('Info message', null);
    });

    it('should capture log entry', () => {
      capturingLogger.info('Info message');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('INFO');
      expect(logs[0].message).toBe('Info message');
    });

    it('should support method chaining', () => {
      const result = capturingLogger.info('Message');

      expect(result).toBe(capturingLogger);
    });
  });

  describe('warn()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should forward to real logger', () => {
      capturingLogger.warn('Warning message');

      expect(realLogger.warn).toHaveBeenCalledWith('Warning message', null);
    });

    it('should capture log entry', () => {
      capturingLogger.warn('Warning message');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('WARN');
      expect(logs[0].message).toBe('Warning message');
    });

    it('should support method chaining', () => {
      const result = capturingLogger.warn('Message');

      expect(result).toBe(capturingLogger);
    });
  });

  describe('error()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should forward to real logger', () => {
      capturingLogger.error('Error message');

      expect(realLogger.error).toHaveBeenCalledWith('Error message', null);
    });

    it('should capture log entry', () => {
      capturingLogger.error('Error message');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('ERROR');
      expect(logs[0].message).toBe('Error message');
    });

    it('should support method chaining', () => {
      const result = capturingLogger.error('Message');

      expect(result).toBe(capturingLogger);
    });
  });

  describe('log()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should forward to real logger', () => {
      capturingLogger.log('INFO', 'Info message');

      expect(realLogger.log).toHaveBeenCalledWith('INFO', 'Info message');
    });

    it('should capture log entry', () => {
      capturingLogger.log('WARN', 'Warning message');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('WARN');
      expect(logs[0].message).toBe('Warning message');
    });

    it('should uppercase level', () => {
      capturingLogger.log('info', 'Message');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs[0].level).toBe('INFO');
    });

    it('should support method chaining', () => {
      const result = capturingLogger.log('INFO', 'Message');

      expect(result).toBe(capturingLogger);
    });
  });

  // ===================================================================
  // BUFFER MANAGEMENT
  // ===================================================================

  describe('Buffer Management', () => {
    it('should trim buffer when exceeding max size', () => {
      capturingLogger = new CapturingLogger(realLogger, 3);

      capturingLogger.info('Message 1');
      capturingLogger.info('Message 2');
      capturingLogger.info('Message 3');
      capturingLogger.info('Message 4'); // Should remove Message 1

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('Message 2');
      expect(logs[1].message).toBe('Message 3');
      expect(logs[2].message).toBe('Message 4');
    });

    it('should handle large buffer sizes', () => {
      capturingLogger = new CapturingLogger(realLogger, 10000);

      for (let i = 0; i < 100; i++) {
        capturingLogger.info(`Message ${i}`);
      }

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(100);
    });
  });

  // ===================================================================
  // CAPTURE RETRIEVAL METHODS
  // ===================================================================

  describe('getCapturedLogs()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should return empty array initially', () => {
      const logs = capturingLogger.getCapturedLogs();

      expect(logs).toEqual([]);
    });

    it('should return all captured logs', () => {
      capturingLogger.debug('Debug 1');
      capturingLogger.info('Info 1');
      capturingLogger.warn('Warn 1');
      capturingLogger.error('Error 1');

      const logs = capturingLogger.getCapturedLogs();

      expect(logs).toHaveLength(4);
      expect(logs[0].level).toBe('DEBUG');
      expect(logs[1].level).toBe('INFO');
      expect(logs[2].level).toBe('WARN');
      expect(logs[3].level).toBe('ERROR');
    });

    it('should return shallow copy (prevent external modification)', () => {
      capturingLogger.info('Original message');

      const logs1 = capturingLogger.getCapturedLogs();
      logs1.push({ level: 'FAKE', message: 'Fake', context: null, timestamp: new Date() });

      const logs2 = capturingLogger.getCapturedLogs();

      expect(logs2).toHaveLength(1);
      expect(logs2[0].message).toBe('Original message');
    });

    it('should include timestamps', () => {
      capturingLogger.info('Message 1');

      const logs = capturingLogger.getCapturedLogs();

      expect(logs[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getLogsAsText()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should return empty string for no logs', () => {
      const text = capturingLogger.getLogsAsText();

      expect(text).toBe('');
    });

    it('should format logs as text with default separator', () => {
      capturingLogger.info('Message 1');
      capturingLogger.warn('Message 2');

      const text = capturingLogger.getLogsAsText();
      const lines = text.split('\n');

      expect(lines).toHaveLength(2);
      expect(lines[0]).toContain('[INFO]');
      expect(lines[0]).toContain('Message 1');
      expect(lines[1]).toContain('[WARN]');
      expect(lines[1]).toContain('Message 2');
    });

    it('should use custom separator', () => {
      capturingLogger.info('Message 1');
      capturingLogger.info('Message 2');

      const text = capturingLogger.getLogsAsText(' | ');

      expect(text).toContain(' | ');
    });

    it('should include context in output', () => {
      capturingLogger.info('User action', { userId: 123 });

      const text = capturingLogger.getLogsAsText();

      expect(text).toContain('User action');
      expect(text).toContain('{"userId":123}');
    });

    it('should include ISO timestamps', () => {
      capturingLogger.info('Message');

      const text = capturingLogger.getLogsAsText();

      expect(text).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });
  });

  describe('getLogsAsHtml()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should return empty HTML container for no logs', () => {
      const html = capturingLogger.getLogsAsHtml();

      expect(html).toContain('<div');
      expect(html).toContain('</div>');
    });

    it('should format logs as color-coded HTML', () => {
      capturingLogger.debug('Debug msg');
      capturingLogger.info('Info msg');
      capturingLogger.warn('Warn msg');
      capturingLogger.error('Error msg');

      const html = capturingLogger.getLogsAsHtml();

      expect(html).toContain('#888888'); // DEBUG color
      expect(html).toContain('#0066cc'); // INFO color
      expect(html).toContain('#ff9900'); // WARN color
      expect(html).toContain('#cc0000'); // ERROR color
    });

    it('should escape HTML in messages', () => {
      capturingLogger.info('<script>alert("XSS")</script>');

      const html = capturingLogger.getLogsAsHtml();

      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;/script&gt;');
      expect(html).not.toContain('<script>alert');
    });

    it('should use monospace font', () => {
      capturingLogger.info('Message');

      const html = capturingLogger.getLogsAsHtml();

      expect(html).toContain('font-family: monospace');
    });
  });

  describe('clearCapturedLogs()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should clear all captured logs', () => {
      capturingLogger.info('Message 1');
      capturingLogger.info('Message 2');

      capturingLogger.clearCapturedLogs();

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toEqual([]);
    });

    it('should allow logging after clearing', () => {
      capturingLogger.info('Message 1');
      capturingLogger.clearCapturedLogs();
      capturingLogger.info('Message 2');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Message 2');
    });
  });

  describe('getLogCount()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should return zero initially', () => {
      expect(capturingLogger.getLogCount()).toBe(0);
    });

    it('should return correct count', () => {
      capturingLogger.info('Message 1');
      capturingLogger.warn('Message 2');
      capturingLogger.error('Message 3');

      expect(capturingLogger.getLogCount()).toBe(3);
    });

    it('should update after clearing', () => {
      capturingLogger.info('Message');
      expect(capturingLogger.getLogCount()).toBe(1);

      capturingLogger.clearCapturedLogs();
      expect(capturingLogger.getLogCount()).toBe(0);
    });
  });

  // ===================================================================
  // PASS-THROUGH METHODS
  // ===================================================================

  describe('setLevel()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should forward to real logger', () => {
      capturingLogger.setLevel('DEBUG');

      expect(realLogger.setLevel).toHaveBeenCalledWith('DEBUG');
    });

    it('should return capturing logger for chaining', () => {
      const result = capturingLogger.setLevel('WARN');

      expect(result).toBe(capturingLogger);
    });

    it('should handle logger without setLevel', () => {
      const minimalLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      capturingLogger = new CapturingLogger(minimalLogger);
      const result = capturingLogger.setLevel('INFO');

      expect(result).toBe(capturingLogger);
    });
  });

  describe('getLevel()', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should forward to real logger', () => {
      const level = capturingLogger.getLevel();

      expect(realLogger.getLevel).toHaveBeenCalled();
      expect(level).toBe('INFO');
    });

    it('should return UNKNOWN for logger without getLevel', () => {
      const minimalLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      capturingLogger = new CapturingLogger(minimalLogger);
      const level = capturingLogger.getLevel();

      expect(level).toBe('UNKNOWN');
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    beforeEach(() => {
      capturingLogger = new CapturingLogger(realLogger);
    });

    it('should capture and forward mixed log levels', () => {
      capturingLogger.debug('Debug 1');
      capturingLogger.info('Info 1');
      capturingLogger.warn('Warn 1');
      capturingLogger.error('Error 1');
      capturingLogger.info('Info 2');

      expect(realLogger.debug).toHaveBeenCalledTimes(1);
      expect(realLogger.info).toHaveBeenCalledTimes(2);
      expect(realLogger.warn).toHaveBeenCalledTimes(1);
      expect(realLogger.error).toHaveBeenCalledTimes(1);

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(5);
    });

    it('should maintain chronological order', () => {
      capturingLogger.info('First');
      capturingLogger.warn('Second');
      capturingLogger.debug('Third');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs[0].message).toBe('First');
      expect(logs[1].message).toBe('Second');
      expect(logs[2].message).toBe('Third');
    });

    it('should support method chaining across different levels', () => {
      capturingLogger.info('Info').warn('Warn').error('Error');

      const logs = capturingLogger.getCapturedLogs();
      expect(logs).toHaveLength(3);
    });
  });
});
