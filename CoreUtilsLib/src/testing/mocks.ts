import type { Mock, MockedFunction } from 'jest-mock';
import type { TreePosition } from '../internal/StructuredLogFormatter.js';

declare const jest: Pick<typeof import('jest-mock'), 'fn'>;

type FluentMock<T> = Mock<(...args: unknown[]) => T>;
type ScopedCallback = <T>(position: TreePosition, callback: () => T) => T;
type Clone = <T>(value: T) => T;
type Merge = <T extends object, S extends object>(target: T, source: S) => T & S;
type Chunk = <T>(items: T[], size: number) => T[][];

interface CapturedLog {
  level: string;
  message: unknown;
  context: unknown;
}

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
  declare debug: FluentMock<this>;
  declare info: FluentMock<this>;
  declare warn: FluentMock<this>;
  declare error: FluentMock<this>;
  declare fatal: FluentMock<this>;
  declare log: FluentMock<this>;
  declare logJobStart: FluentMock<this>;
  declare logJobResume: FluentMock<this>;
  declare logJobEnd: FluentMock<this>;
  declare logJobSuspended: FluentMock<this>;
  declare logBatchStart: FluentMock<this>;
  declare logItemStart: FluentMock<this>;
  declare logStep: FluentMock<this>;
  declare logPipelineStart: FluentMock<this>;
  declare logPipelineStep: FluentMock<this>;
  declare logSummary: FluentMock<this>;
  declare setLevel: FluentMock<this>;
  declare clear: FluentMock<this>;
  declare withPosition: MockedFunction<ScopedCallback>;
  declare getLevel: Mock<() => string>;
  declare child: Mock<(prefix?: string) => this>;
  constructor() {
    this.debug = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.info = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.warn = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.error = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.fatal = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.log = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logJobStart = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logJobResume = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logJobEnd = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logJobSuspended = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logBatchStart = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logItemStart = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logStep = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logPipelineStart = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logPipelineStep = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logSummary = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.withPosition = jest.fn(<T>(_position: TreePosition, callback: () => T) =>
      callback()
    ) as MockedFunction<ScopedCallback>;
    this.setLevel = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.getLevel = jest.fn(() => 'INFO');
    this.child = jest.fn<(prefix?: string) => this>(() => this);
    this.clear = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
  }

  /**
   * Reconstructs all recorded log entries from individual level mock calls.
   * @returns {Array<Object>} Recorded log entries.
   */
  getLogs(): CapturedLog[] {
    const logs: CapturedLog[] = [];
    (['debug', 'info', 'warn', 'error', 'fatal', 'log'] as const).forEach((level) => {
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
  getLogsByLevel(level: string) {
    return this.getLogs().filter((log) => log.level === level.toUpperCase());
  }

  /**
   * Filters captured logs by message content using string or regular expression.
   * @param {string|RegExp} pattern Search pattern for log message matching.
   * @returns {Array<{level:string, message:string, context:Object|null}>}
   */
  getLogsMatching(pattern: string | RegExp) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return this.getLogs().filter((log) => regex.test(log.message as string));
  }

  /**
   * Checks if any captured log entry matches specified level and message pattern.
   * @param {string} level Case-insensitive log level identifier.
   * @param {string|RegExp} pattern Message content or pattern to match.
   * @returns {boolean} True if matching log entry is found.
   */
  hasLog(level: string, pattern: string | RegExp) {
    const logs = this.getLogsByLevel(level);
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return logs.some((log) => regex.test(log.message as string));
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
    this.log.mockClear();
    this.logJobStart.mockClear();
    this.logJobResume.mockClear();
    this.logJobEnd.mockClear();
    this.logJobSuspended.mockClear();
    this.logBatchStart.mockClear();
    this.logItemStart.mockClear();
    this.logStep.mockClear();
    this.logPipelineStart.mockClear();
    this.logPipelineStep.mockClear();
    this.logSummary.mockClear();
    this.withPosition.mockClear();
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
  declare sleep: Mock<(ms: number) => Promise<void>>;
  declare generateUuid: Mock<() => string>;
  declare formatDate: Mock<(date: unknown, format?: string) => string>;
  declare parseDate: Mock<(str: string) => Date>;
  declare isEmpty: Mock<(value: unknown) => boolean>;
  declare isEqual: Mock<(a: unknown, b: unknown) => boolean>;
  declare deepClone: MockedFunction<Clone>;
  declare deepMerge: MockedFunction<Merge>;
  declare chunk: MockedFunction<Chunk>;
  declare getUuid: UtilsServiceMock['generateUuid'];
  constructor() {
    this.sleep = jest
      .fn<(ms: number) => Promise<void>>()
      .mockImplementation((_ms) => Promise.resolve());
    this.generateUuid = jest.fn(() => 'GENERATED_UUID_123');
    this.formatDate = jest.fn((date: unknown, _format?: string) =>
      date instanceof Date ? date.toISOString() : String(date)
    );
    this.parseDate = jest.fn((str: string) => new Date(str));
    this.isEmpty = jest.fn(
      (val: unknown) =>
        val === null ||
        val === undefined ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0)
    );
    this.isEqual = jest.fn((a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b));
    this.deepClone = jest.fn(<T>(obj: T): T =>
      obj ? (JSON.parse(JSON.stringify(obj)) as T) : obj
    ) as MockedFunction<Clone>;
    this.deepMerge = jest.fn(<T extends object, S extends object>(target: T, source: S) =>
      Object.assign({}, target, source)
    ) as MockedFunction<Merge>;
    this.chunk = jest.fn(<T>(arr: T[], size: number): T[][] => {
      const result: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    }) as MockedFunction<Chunk>;

    // Compatibility aliases
    this.getUuid = this.generateUuid;
  }
}

/**
 * Mock for CacheInterface implementing a simple in-memory store for testing.
 * @class
 */
export class CacheInterfaceMock<V = unknown> {
  declare _store: Map<string, V>;
  declare get: Mock<(key: string) => V | null>;
  declare put: Mock<(key: string, value: V, expirationInSeconds?: number) => this>;
  declare remove: Mock<(key: string) => this>;
  declare removeAll: Mock<() => this>;
  declare removeByPrefix: Mock<(prefix: string) => this>;
  declare _clear: CacheInterfaceMock<V>['removeAll'];
  constructor() {
    this._store = new Map<string, V>();
    this.get = jest.fn((key: string) => this._store.get(key) || null);
    this.put = jest.fn((key: string, value: V, _expirationInSeconds?: number) => {
      this._store.set(key, value);
      return this;
    });
    this.remove = jest.fn((key: string) => {
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
    this.removeByPrefix = jest.fn((prefix: string) => {
      for (const key of this._store.keys()) {
        if (key.startsWith(prefix)) {
          this._store.delete(key);
        }
      }
      return this;
    });

    // Compatibility aliases
    this._clear = this.removeAll;
  }
}
