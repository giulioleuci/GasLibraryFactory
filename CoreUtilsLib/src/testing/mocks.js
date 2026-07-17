/**
 * @file CoreUtilsLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for CoreUtilsLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity mock for LoggerService with jest.fn() instrumentation and method chaining.
 * @class
 */
export class LoggerServiceMock {
  constructor() {
    this.debug = jest.fn().mockReturnThis();
    this.info = jest.fn().mockReturnThis();
    this.warn = jest.fn().mockReturnThis();
    this.error = jest.fn().mockReturnThis();
    this.fatal = jest.fn().mockReturnThis();
    this.log = jest.fn().mockReturnThis();
    this.setLevel = jest.fn().mockReturnThis();
    this.getLevel = jest.fn(() => 'INFO');
    this.child = jest.fn(() => this);
    this.clear = jest.fn().mockReturnThis();
  }

  /**
   * Checks for log messages matching level and pattern in jest.fn() calls.
   * @param {string} level Log level.
   * @param {string|RegExp} pattern Pattern to match.
   * @returns {boolean} True if match exists.
   */
  hasLog(level, pattern) {
    const methodName = level.toLowerCase();
    const mock = this[methodName];
    if (!mock || !mock.mock) return false;

    return mock.mock.calls.some((call) => {
      const msg = typeof call[0] === 'function' ? call[0]() : call[0];
      if (pattern instanceof RegExp) {
        return pattern.test(msg);
      }
      return String(msg).includes(pattern);
    });
  }

  /**
   * Reconstructs all recorded log entries from individual level mock calls.
   * @returns {Array<Object>} Recorded log entries.
   */
  getLogs() {
    const logs = [];
    ['debug', 'info', 'warn', 'error', 'fatal', 'log'].forEach((level) => {
      const mock = this[level];
      if (mock && mock.mock) {
        mock.mock.calls.forEach((call) => {
          logs.push({
            level: level.toUpperCase(),
            message: typeof call[0] === 'function' ? call[0]() : call[0],
            context: call[1] || null
          });
        });
      }
    });
    return logs;
  }

  /**
   * Filters captured logs by case-insensitive level identifier.
   * @param {string} level Log level (DEBUG|INFO|WARN|ERROR|FATAL|LOG).
   * @returns {Array<{level:string, message:string, context:Object|null}>}
   */
  getLogsByLevel(level) {
    return this.getLogs().filter((log) => log.level === level.toUpperCase());
  }

  /**
   * Filters captured logs by message content using string or regular expression.
   * @param {string|RegExp} pattern Search pattern for log message matching.
   * @returns {Array<{level:string, message:string, context:Object|null}>}
   */
  getLogsMatching(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return this.getLogs().filter((log) => regex.test(log.message));
  }

  /**
   * Checks if any captured log entry matches specified level and message pattern.
   * @param {string} level Case-insensitive log level identifier.
   * @param {string|RegExp} pattern Message content or pattern to match.
   * @returns {boolean} True if matching log entry is found.
   */
  hasLog(level, pattern) {
    const logs = this.getLogsByLevel(level);
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return logs.some((log) => regex.test(log.message));
  }

  /**
   * Outputs all recorded log entries to the system console.
   */
  printLogs() {
    this.getLogs().forEach((log) => {
      console.log(`[${log.level}] ${log.message}`, log.context || '');
    });
  }

  /**
   * Resets all internal Jest mock functions and call history.
   * @returns {this} Chainable mock instance for fluent API usage.
   */
  reset() {
    this.debug.mockClear();
    this.info.mockClear();
    this.warn.mockClear();
    this.error.mockClear();
    this.fatal.mockClear();
    this.setLevel.mockClear();
    this.getLevel.mockClear();
    this.child.mockClear();
    this.clear.mockClear();
    return this;
  }
}

/**
 * Mock for UtilsService providing common utility behaviors with jest.fn() instrumentation.
 * @class
 */
export class UtilsServiceMock {
  constructor() {
    this.sleep = jest.fn().mockImplementation((ms) => Promise.resolve());
    this.generateUuid = jest.fn(() => 'GENERATED_UUID_123');
    this.formatDate = jest.fn((date, format) =>
      date instanceof Date ? date.toISOString() : String(date)
    );
    this.parseDate = jest.fn((str) => new Date(str));
    this.isEmpty = jest.fn(
      (val) =>
        val === null ||
        val === undefined ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0)
    );
    this.isEqual = jest.fn((a, b) => JSON.stringify(a) === JSON.stringify(b));
    this.deepClone = jest.fn((obj) => (obj ? JSON.parse(JSON.stringify(obj)) : obj));
    this.deepMerge = jest.fn((target, source) => Object.assign({}, target, source));
    this.chunk = jest.fn((arr, size) => {
      const result = [];
      for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
      return result;
    });

    // Compatibility aliases
    this.getUuid = this.generateUuid;
  }
}

/**
 * Mock for CacheInterface implementing a simple in-memory store for testing.
 * @class
 */
export class CacheInterfaceMock {
  constructor() {
    this._store = new Map();
    this.get = jest.fn((key) => this._store.get(key) || null);
    this.put = jest.fn((key, value, expirationInSeconds) => {
      this._store.set(key, value);
      return this;
    });
    this.remove = jest.fn((key) => {
      // Handle wildcard patterns (e.g., "Users_*" should match "Users:id", "Users_id", etc.)
      if (key && key.endsWith('*')) {
        const pattern = key.slice(0, -1); // Remove the *
        // Extract table name by removing trailing separator (_)
        const tableName = pattern.replace(/[_:]$/, '');
        for (const [cacheKey] of this._store) {
          // Match if key starts with tableName followed by : or _
          if (cacheKey.startsWith(tableName + ':') || cacheKey.startsWith(tableName + '_')) {
            this._store.delete(cacheKey);
          }
        }
        return this;
      }

      this._store.delete(key);
      return this;
    });
    this.removeAll = jest.fn(() => {
      this._store.clear();
      return this;
    });
    this.removeByPrefix = jest.fn((prefix) => {
      for (const key of this._store.keys()) {
        if (key.startsWith(prefix)) this._store.delete(key);
      }
      return this;
    });

    // Compatibility aliases
    this._clear = this.removeAll;
  }
}

/**
 * Mock for CacheUtils static utilities.
 */
export const CacheUtilsMock = {
  generateKey: jest.fn((prefix, ...parts) => [prefix, ...parts].filter(Boolean).join('_')),
  generateHashKey: jest.fn((prefix, obj) => `${prefix}_hash_${JSON.stringify(obj).length}`)
};
