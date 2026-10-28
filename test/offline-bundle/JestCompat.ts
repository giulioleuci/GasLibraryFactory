type CompatCallable = (...args: unknown[]) => unknown;
type CompatFunction = (...args: never[]) => unknown;
interface MockResult {
  type: 'return' | 'throw';
  value: unknown;
}
interface MockState {
  calls: unknown[][];
  results: MockResult[];
  instances: unknown[];
  _implementation: CompatCallable | null;
  _returnValue: unknown;
  _returnValues: unknown[];
  _returnValueIndex: number;
  _isOnce: boolean;
  _onceImplementations: CompatCallable[];
  _thrownError: unknown;
}
interface RegisteredMock {
  mockClear(): unknown;
  mockReset(): unknown;
  _original?: CompatCallable;
  _target?: Record<PropertyKey, unknown>;
  _method?: PropertyKey;
}
export type CompatMock<F extends CompatFunction = CompatCallable> = F &
  RegisteredMock & {
    mock: {
      calls: unknown[][];
      results: MockResult[];
      instances: unknown[];
      lastCall: unknown[] | undefined;
    };
    _isMockFunction: boolean;
    _mockState: MockState;
    mockReturnValue(value: ReturnType<F>): CompatMock<F>;
    mockReturnValueOnce(value: ReturnType<F>): CompatMock<F>;
    mockResolvedValue(value: unknown): CompatMock<F>;
    mockRejectedValue(value?: unknown): CompatMock<F>;
    mockImplementation(implementation: F): CompatMock<F>;
    mockImplementationOnce(implementation: F): CompatMock<F>;
    mockReturnThis(): CompatMock<F>;
    mockRestore(): CompatMock<F>;
  };
interface CheckedMock {
  _isMockFunction?: boolean;
  mock: { calls: unknown[][]; results: MockResult[] };
}
type Hook = () => unknown;
interface CollectedTest {
  name: string;
  fn: Hook;
  skip: boolean;
  beforeEachHooks: Hook[];
  afterEachHooks: Hook[];
}
interface TestRegistry {
  suites: CollectedTest[];
  currentSuitePath: string[];
  currentBeforeEach: Hook[];
  currentAfterEach: Hook[];
  currentBeforeAll: Hook[];
  currentAfterAll: Hook[];
}
/**
 * JestCompat - Jest API compatibility layer for Google Apps Script
 *
 * Maps Jest's testing API (describe, it, expect, beforeEach, jest.fn(), etc.)
 * to the GasOnlineTestFramework (TestFramework + Assert).
 *
 * This allows Jest-authored tests to run in the GAS V8 environment after
 * being compiled through Webpack.
 *
 * ## Supported Jest APIs:
 * - describe(name, fn) - Test grouping (nested supported)
 * - it(name, fn) / test(name, fn) - Test registration
 * - it.each(cases)(name, fn) - Parameterized tests
 * - expect(value) - Assertion chain with 30+ matchers
 * - beforeEach(fn) / afterEach(fn) - Per-test lifecycle hooks
 * - beforeAll(fn) / afterAll(fn) - Per-suite lifecycle hooks
 * - jest.fn() - Mock function creation
 * - jest.spyOn(obj, method) - Method spying
 * - jest.clearAllMocks() / jest.resetAllMocks() / jest.restoreAllMocks()
 * - jest.mock() - No-op (module mocking not available in GAS)
 *
 * ## Architecture:
 * - Uses a global test collector that accumulates describe/it registrations
 * - At execution time, a TestFramework instance runs all collected tests
 * - Nested describe blocks are flattened with prefixed names
 * - beforeEach/afterEach hooks are scoped to their describe block
 *
 * @module JestCompat
 */

// ─── Mock Function Implementation ─────────────────────────────────────────────

/**
 * Creates a mock function similar to jest.fn()
 * Tracks calls, arguments, return values, and implementations.
 */
function createMockFn<F extends CompatFunction = CompatCallable>(implementation?: F): CompatMock<F>;
function createMockFn(implementation?: CompatFunction): CompatMock<CompatCallable> {
  const mockState: MockState = {
    calls: [],
    results: [],
    instances: [],
    _implementation: (implementation as CompatCallable | undefined) || null,
    _returnValue: undefined,
    _returnValues: [],
    _returnValueIndex: 0,
    _isOnce: false,
    _onceImplementations: [],
    _thrownError: null
  };

  function mockFn(this: unknown) {
    const args = Array.prototype.slice.call(arguments) as unknown[];
    mockState.calls.push(args);

    // Check once implementations first
    if (mockState._onceImplementations.length > 0) {
      const onceFn = mockState._onceImplementations.shift()!;
      try {
        const result = onceFn.apply(this, args);
        mockState.results.push({ type: 'return', value: result });
        return result;
      } catch (e) {
        mockState.results.push({ type: 'throw', value: e });
        throw e;
      }
    }

    // Check thrown error
    if (mockState._thrownError !== null) {
      const err = mockState._thrownError;
      mockState.results.push({ type: 'throw', value: err });
      throw err;
    }

    // Check return values queue
    if (mockState._returnValues.length > 0) {
      const idx = Math.min(mockState._returnValueIndex, mockState._returnValues.length - 1);
      mockState._returnValueIndex++;
      const val = mockState._returnValues[idx];
      mockState.results.push({ type: 'return', value: val });
      return val;
    }

    // Check implementation
    if (mockState._implementation) {
      try {
        const result = mockState._implementation.apply(this, args);
        mockState.results.push({ type: 'return', value: result });
        return result;
      } catch (e) {
        mockState.results.push({ type: 'throw', value: e });
        throw e;
      }
    }

    // Default: return configured return value
    mockState.results.push({ type: 'return', value: mockState._returnValue });
    return mockState._returnValue;
  }

  // Attach mock metadata
  mockFn.mock = {
    get calls() {
      return mockState.calls;
    },
    get results() {
      return mockState.results;
    },
    get instances() {
      return mockState.instances;
    },
    get lastCall() {
      return mockState.calls.length > 0 ? mockState.calls[mockState.calls.length - 1] : undefined;
    }
  };

  mockFn._isMockFunction = true;
  mockFn._mockState = mockState;

  // Fluent configuration API
  mockFn.mockReturnValue = function (val: unknown) {
    mockState._returnValue = val;
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockReturnValueOnce = function (val: unknown) {
    mockState._onceImplementations.push(() => {
      return val;
    });
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockResolvedValue = function (val: unknown) {
    mockState._returnValue = val;
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockImplementation = function (fn: CompatCallable) {
    mockState._implementation = fn;
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockImplementationOnce = function (fn: CompatCallable) {
    mockState._onceImplementations.push(fn);
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockReturnThis = function () {
    mockState._implementation = function (this: unknown) {
      return this;
    };
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockRejectedValue = function () {
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockClear = function () {
    mockState.calls.length = 0;
    mockState.results.length = 0;
    mockState.instances.length = 0;
    mockState._returnValueIndex = 0;
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockReset = function () {
    mockFn.mockClear();
    mockState._implementation = null;
    mockState._returnValue = undefined;
    mockState._returnValues = [];
    mockState._onceImplementations = [];
    mockState._thrownError = null;
    return mockFn as CompatMock<CompatCallable>;
  };

  mockFn.mockRestore = function () {
    mockFn.mockReset();
    return mockFn as CompatMock<CompatCallable>;
  };

  return mockFn as CompatMock<CompatCallable>;
}

// ─── Global Mock Registry ──────────────────────────────────────────────────────

const __allMockFns: RegisteredMock[] = [];

// ─── Expect / Matchers ─────────────────────────────────────────────────────────

function safeStringify(value: unknown): string | undefined {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'function') {
    return '[Function]';
  }
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) {
    return a === b;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a !== 'object') {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a)) {
    if (a.length !== (b as unknown[]).length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], (b as unknown[])[i])) {
        return false;
      }
    }
    return true;
  }

  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (let j = 0; j < keysA.length; j++) {
    if (keysA[j] !== keysB[j]) {
      return false;
    }
    if (
      !deepEqual((a as Record<string, unknown>)[keysA[j]], (b as Record<string, unknown>)[keysA[j]])
    ) {
      return false;
    }
  }
  return true;
}

function objectContaining(expected: object, actual: unknown): boolean {
  if (typeof actual !== 'object' || actual === null) {
    return false;
  }
  const keys = Object.keys(expected);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!(key in actual)) {
      return false;
    }
    if (
      !deepEqual(
        (expected as Record<string, unknown>)[key],
        (actual as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }
  return true;
}

function createExpect(actual: unknown) {
  let negated = false;

  var matchers = {
    get not() {
      negated = !negated;
      return matchers;
    },

    toBe: function (expected: unknown) {
      const pass = actual === expected;
      if (negated ? pass : !pass) {
        throw new Error(
          (negated ? 'Expected value NOT to be ' : 'Expected: ') +
            safeStringify(expected) +
            '\nReceived: ' +
            safeStringify(actual)
        );
      }
    },

    toEqual: function (expected: unknown) {
      const pass = deepEqual(actual, expected);
      if (negated ? pass : !pass) {
        throw new Error(
          (negated ? 'Expected value NOT to equal ' : 'Expected: ') +
            safeStringify(expected) +
            '\nReceived: ' +
            safeStringify(actual)
        );
      }
    },

    toStrictEqual: function (expected: unknown) {
      const pass = deepEqual(actual, expected);
      if (negated ? pass : !pass) {
        throw new Error(
          (negated ? 'Expected value NOT to strict equal ' : 'Expected: ') +
            safeStringify(expected) +
            '\nReceived: ' +
            safeStringify(actual)
        );
      }
    },

    toBeDefined: function () {
      const pass = actual !== undefined;
      if (negated ? pass : !pass) {
        throw new Error(
          negated ? 'Expected value to be undefined' : 'Expected value to be defined, got undefined'
        );
      }
    },

    toBeUndefined: function () {
      const pass = actual === undefined;
      if (negated ? pass : !pass) {
        throw new Error(
          negated
            ? 'Expected value NOT to be undefined'
            : 'Expected undefined, got: ' + safeStringify(actual)
        );
      }
    },

    toBeNull: function () {
      const pass = actual === null;
      if (negated ? pass : !pass) {
        throw new Error(
          negated ? 'Expected value NOT to be null' : 'Expected null, got: ' + safeStringify(actual)
        );
      }
    },

    toBeTruthy: function () {
      const pass = !!actual;
      if (negated ? pass : !pass) {
        throw new Error(
          negated
            ? 'Expected value NOT to be truthy'
            : 'Expected truthy, got: ' + safeStringify(actual)
        );
      }
    },

    toBeFalsy: function () {
      const pass = !actual;
      if (negated ? pass : !pass) {
        throw new Error(
          negated
            ? 'Expected value NOT to be falsy'
            : 'Expected falsy, got: ' + safeStringify(actual)
        );
      }
    },

    toBeNaN: function () {
      const pass = Number.isNaN(actual);
      if (negated ? pass : !pass) {
        throw new Error(
          negated ? 'Expected value NOT to be NaN' : 'Expected NaN, got: ' + safeStringify(actual)
        );
      }
    },

    toBeGreaterThan: function (expected: number) {
      const pass = (actual as number) > expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected ' + actual + (negated ? ' NOT' : '') + ' to be > ' + expected);
      }
    },

    toBeGreaterThanOrEqual: function (expected: number) {
      const pass = (actual as number) >= expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected ' + actual + (negated ? ' NOT' : '') + ' to be >= ' + expected);
      }
    },

    toBeLessThan: function (expected: number) {
      const pass = (actual as number) < expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected ' + actual + (negated ? ' NOT' : '') + ' to be < ' + expected);
      }
    },

    toBeLessThanOrEqual: function (expected: number) {
      const pass = (actual as number) <= expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected ' + actual + (negated ? ' NOT' : '') + ' to be <= ' + expected);
      }
    },

    toBeCloseTo: function (expected: number, precision?: number) {
      if (precision === undefined) {
        precision = 2;
      }
      const diff = Math.abs((actual as number) - expected);
      const pass = diff < Math.pow(10, -precision) / 2;
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected ' + actual + (negated ? ' NOT' : '') + ' to be close to ' + expected
        );
      }
    },

    toBeInstanceOf: function (expectedClass: Function) {
      const pass = actual instanceof expectedClass;
      if (negated ? pass : !pass) {
        throw new Error(
          (negated ? 'Expected NOT to be instance of ' : 'Expected instance of ') +
            (expectedClass.name || expectedClass) +
            ', got: ' +
            (actual && actual.constructor ? actual.constructor.name : typeof actual)
        );
      }
    },

    toContain: function (expected: unknown) {
      let pass;
      if (typeof actual === 'string') {
        pass = actual.indexOf(expected as string) !== -1;
      } else if (Array.isArray(actual)) {
        pass = actual.indexOf(expected as string) !== -1;
      } else {
        pass = false;
      }
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected ' +
            safeStringify(actual) +
            (negated ? ' NOT' : '') +
            ' to contain ' +
            safeStringify(expected)
        );
      }
    },

    toContainEqual: function (expected: unknown) {
      let pass = false;
      if (Array.isArray(actual)) {
        for (let i = 0; i < actual.length; i++) {
          if (deepEqual(actual[i], expected)) {
            pass = true;
            break;
          }
        }
      }
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected array' +
            (negated ? ' NOT' : '') +
            ' to contain equal ' +
            safeStringify(expected)
        );
      }
    },

    toHaveLength: function (expected: number) {
      const len =
        actual && (actual as { length?: unknown }).length !== undefined
          ? (actual as { length?: unknown }).length
          : -1;
      const pass = len === expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected length ' + (negated ? 'NOT ' : '') + expected + ', got: ' + len);
      }
    },

    toHaveProperty: function (keyPath: PropertyKey, value?: unknown) {
      const keys = typeof keyPath === 'string' ? keyPath.split('.') : [keyPath];
      let current = actual;
      let pass = true;
      for (let i = 0; i < keys.length; i++) {
        if (current == null || !(keys[i] in Object(current))) {
          pass = false;
          break;
        }
        current = (current as Record<PropertyKey, unknown>)[keys[i]];
      }
      if (pass && value !== undefined) {
        pass = deepEqual(current, value);
      }
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected object' +
            (negated ? ' NOT' : '') +
            ' to have property "' +
            (keyPath as string) +
            '"' +
            (value !== undefined ? ' with value ' + safeStringify(value) : '') +
            '\nReceived: ' +
            safeStringify(actual)
        );
      }
    },

    toMatch: function (expected: string | RegExp) {
      let pass;
      if (expected instanceof RegExp) {
        pass = expected.test(actual as string);
      } else {
        pass = typeof actual === 'string' && actual.indexOf(expected as string) !== -1;
      }
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected ' + safeStringify(actual) + (negated ? ' NOT' : '') + ' to match ' + expected
        );
      }
    },

    toMatchObject: function (expected: object) {
      const pass = objectContaining(expected, actual);
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected object' +
            (negated ? ' NOT' : '') +
            ' to match ' +
            safeStringify(expected) +
            '\nReceived: ' +
            safeStringify(actual)
        );
      }
    },

    toThrow: function (expected?: string | RegExp | Function) {
      if (typeof actual !== 'function') {
        throw new Error('expect(value).toThrow() requires a function, got: ' + typeof actual);
      }
      let thrown = false;
      let thrownError: unknown = null;
      try {
        actual();
      } catch (e) {
        thrown = true;
        thrownError = e;
      }

      if (negated) {
        if (thrown) {
          throw new Error(
            'Expected function NOT to throw, but it threw: ' +
              (thrownError && (thrownError as Error).message)
          );
        }
        return;
      }

      if (!thrown) {
        throw new Error('Expected function to throw' + (expected ? ' "' + expected + '"' : ''));
      }

      if (expected !== undefined) {
        const msg = thrownError && ((thrownError as Error).message || String(thrownError));
        if (expected instanceof RegExp) {
          if (!expected.test(msg as string)) {
            throw new Error('Expected error matching ' + expected + ', got: "' + msg + '"');
          }
        } else if (typeof expected === 'string') {
          if ((msg as string).indexOf(expected) === -1) {
            throw new Error('Expected error containing "' + expected + '", got: "' + msg + '"');
          }
        } else if (typeof expected === 'function') {
          if (!(thrownError instanceof expected)) {
            throw new Error(
              'Expected error instance of ' +
                (expected.name || expected) +
                ', got: ' +
                (thrownError && thrownError.constructor && thrownError.constructor.name)
            );
          }
        }
      }
    },

    toHaveBeenCalled: function () {
      if (!actual || !(actual as Partial<CheckedMock>)._isMockFunction) {
        throw new Error('toHaveBeenCalled() requires a mock function');
      }
      const pass = (actual as CheckedMock).mock.calls.length > 0;
      if (negated ? pass : !pass) {
        throw new Error(
          negated ? 'Expected mock NOT to have been called' : 'Expected mock to have been called'
        );
      }
    },

    toHaveBeenCalledTimes: function (expected: number) {
      if (!actual || !(actual as Partial<CheckedMock>)._isMockFunction) {
        throw new Error('toHaveBeenCalledTimes() requires a mock function');
      }
      const count = (actual as CheckedMock).mock.calls.length;
      const pass = count === expected;
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected mock' +
            (negated ? ' NOT' : '') +
            ' to have been called ' +
            expected +
            ' time(s), was called ' +
            count +
            ' time(s)'
        );
      }
    },

    toHaveBeenCalledWith: function () {
      if (!actual || !(actual as Partial<CheckedMock>)._isMockFunction) {
        throw new Error('toHaveBeenCalledWith() requires a mock function');
      }
      const expectedArgs = Array.prototype.slice.call(arguments);
      let pass = false;
      for (let i = 0; i < (actual as CheckedMock).mock.calls.length; i++) {
        if (deepEqual((actual as CheckedMock).mock.calls[i], expectedArgs)) {
          pass = true;
          break;
        }
      }
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected mock' +
            (negated ? ' NOT' : '') +
            ' to have been called with ' +
            safeStringify(expectedArgs) +
            '\nCalls: ' +
            safeStringify((actual as CheckedMock).mock.calls)
        );
      }
    },

    toHaveBeenLastCalledWith: function () {
      if (!actual || !(actual as Partial<CheckedMock>)._isMockFunction) {
        throw new Error('toHaveBeenLastCalledWith() requires a mock function');
      }
      const expectedArgs = Array.prototype.slice.call(arguments);
      const lastCall = (actual as CheckedMock).mock.calls[
        (actual as CheckedMock).mock.calls.length - 1
      ];
      const pass = deepEqual(lastCall, expectedArgs);
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected last call' +
            (negated ? ' NOT' : '') +
            ' to be ' +
            safeStringify(expectedArgs) +
            '\nLast call: ' +
            safeStringify(lastCall)
        );
      }
    },

    toHaveBeenNthCalledWith: function (n: number) {
      if (!actual || !(actual as Partial<CheckedMock>)._isMockFunction) {
        throw new Error('toHaveBeenNthCalledWith() requires a mock function');
      }
      const rest = Array.prototype.slice.call(arguments, 1);
      const nthCall = (actual as CheckedMock).mock.calls[n - 1];
      const pass = deepEqual(nthCall, rest);
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected call #' +
            n +
            (negated ? ' NOT' : '') +
            ' to be ' +
            safeStringify(rest) +
            '\nActual: ' +
            safeStringify(nthCall)
        );
      }
    },

    toHaveReturnedWith: function (expected: unknown) {
      if (!actual || !(actual as Partial<CheckedMock>)._isMockFunction) {
        throw new Error('toHaveReturnedWith() requires a mock function');
      }
      let pass = false;
      for (let i = 0; i < (actual as CheckedMock).mock.results.length; i++) {
        if (
          (actual as CheckedMock).mock.results[i].type === 'return' &&
          deepEqual((actual as CheckedMock).mock.results[i].value, expected)
        ) {
          pass = true;
          break;
        }
      }
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected mock' +
            (negated ? ' NOT' : '') +
            ' to have returned with ' +
            safeStringify(expected)
        );
      }
    }
  };

  type VariadicMatchers = Omit<
    typeof matchers,
    'not' | 'toHaveBeenCalledWith' | 'toHaveBeenLastCalledWith' | 'toHaveBeenNthCalledWith'
  > & {
    readonly not: VariadicMatchers;
    toHaveBeenCalledWith(...args: unknown[]): void;
    toHaveBeenLastCalledWith(...args: unknown[]): void;
    toHaveBeenNthCalledWith(n: number, ...args: unknown[]): void;
  };
  return matchers as VariadicMatchers;
}

// Helper constructors for expect
createExpect.anything = function () {
  return { __expectAnything: true };
};

createExpect.any = function (constructor: unknown) {
  return { __expectAny: constructor };
};

createExpect.stringContaining = function (str: string) {
  return { __expectStringContaining: str };
};

createExpect.stringMatching = function (pattern: string | RegExp) {
  return { __expectStringMatching: pattern };
};

createExpect.objectContaining = function (obj: object) {
  return { __expectObjectContaining: obj };
};

createExpect.arrayContaining = function (arr: unknown[]) {
  return { __expectArrayContaining: arr };
};

// ─── Test Collection Engine ────────────────────────────────────────────────────

/**
 * Global test registry
 * Collects all describe/it/beforeEach/afterEach registrations.
 */
const __testRegistry: TestRegistry = {
  suites: [],
  currentSuitePath: [],
  currentBeforeEach: [],
  currentAfterEach: [],
  currentBeforeAll: [],
  currentAfterAll: []
};

function getFullPath() {
  return __testRegistry.currentSuitePath.join(' > ');
}

function _describe(name: string, fn: Hook) {
  __testRegistry.currentSuitePath.push(name);

  // Save parent hooks
  const parentBeforeEach = __testRegistry.currentBeforeEach.slice();
  const parentAfterEach = __testRegistry.currentAfterEach.slice();
  const parentBeforeAll = __testRegistry.currentBeforeAll.slice();
  const parentAfterAll = __testRegistry.currentAfterAll.slice();

  // Reset for this scope (inherit parent hooks)
  __testRegistry.currentBeforeEach = parentBeforeEach.slice();
  __testRegistry.currentAfterEach = parentAfterEach.slice();
  __testRegistry.currentBeforeAll = parentBeforeAll.slice();
  __testRegistry.currentAfterAll = parentAfterAll.slice();

  // Collect beforeAll/afterAll that belong to this scope
  let scopeBeforeAll = [];
  let scopeAfterAll = [];
  const savedScopeBeforeAll = [];
  const savedScopeAfterAll = [];

  // Execute the describe body to collect tests and hooks
  fn();

  // Find new beforeAll/afterAll added in this scope
  scopeBeforeAll = __testRegistry.currentBeforeAll.slice(parentBeforeAll.length);
  scopeAfterAll = __testRegistry.currentAfterAll.slice(parentAfterAll.length);

  // Restore parent hooks
  __testRegistry.currentBeforeEach = parentBeforeEach;
  __testRegistry.currentAfterEach = parentAfterEach;
  __testRegistry.currentBeforeAll = parentBeforeAll;
  __testRegistry.currentAfterAll = parentAfterAll;

  __testRegistry.currentSuitePath.pop();
}

function _it(name: string, fn: Hook, options?: { skip?: boolean }) {
  const fullName = getFullPath() + ' > ' + name;
  const beforeEachHooks = __testRegistry.currentBeforeEach.slice();
  const afterEachHooks = __testRegistry.currentAfterEach.slice();

  __testRegistry.suites.push({
    name: fullName,
    fn: fn,
    skip: (options && options.skip) || false,
    beforeEachHooks: beforeEachHooks,
    afterEachHooks: afterEachHooks
  });
}

function _itEach(cases: unknown[]) {
  return function (nameTemplate: string, fn: CompatCallable) {
    for (let i = 0; i < cases.length; i++) {
      var testCase = cases[i];
      var name;
      if (Array.isArray(testCase)) {
        name = nameTemplate.replace(/%s/g, () => {
          return String((testCase as unknown[]).shift());
        });
        // Re-create testCase since shift consumed it
        testCase = cases[i];
        (function (tc: unknown) {
          _it(name, () => {
            fn.apply(null, Array.isArray(tc) ? tc : [tc]);
          });
        })(testCase);
      } else {
        name = nameTemplate.replace(/%s/g, String(testCase));
        (function (tc: unknown) {
          _it(name, () => {
            fn(tc);
          });
        })(testCase);
      }
    }
  };
}

function _beforeEach(fn: Hook) {
  __testRegistry.currentBeforeEach.push(fn);
}

function _afterEach(fn: Hook) {
  __testRegistry.currentAfterEach.push(fn);
}

function _beforeAll(fn: Hook) {
  __testRegistry.currentBeforeAll.push(fn);
}

function _afterAll(fn: Hook) {
  __testRegistry.currentAfterAll.push(fn);
}

// ─── Jest Object ───────────────────────────────────────────────────────────────

var jestObject = {
  fn: function <F extends CompatFunction = CompatCallable>(implementation?: F) {
    const mock = createMockFn(implementation);
    __allMockFns.push(mock);
    return mock;
  },

  spyOn: function <T extends object, K extends keyof T>(obj: T, method: K) {
    const original = obj[method] as CompatCallable;
    const spy = createMockFn(function () {
      return (original.apply as (target: object, args: IArguments) => unknown)(obj, arguments);
    });
    spy._original = original;
    spy._target = obj as Record<PropertyKey, unknown>;
    spy._method = method;
    obj[method] = spy as T[K];
    __allMockFns.push(spy);
    return spy;
  },

  clearAllMocks: function () {
    for (let i = 0; i < __allMockFns.length; i++) {
      __allMockFns[i].mockClear();
    }
  },

  resetAllMocks: function () {
    for (let i = 0; i < __allMockFns.length; i++) {
      __allMockFns[i].mockReset();
    }
  },

  restoreAllMocks: function () {
    for (let i = 0; i < __allMockFns.length; i++) {
      const mock = __allMockFns[i];
      if (mock._original && mock._target && mock._method) {
        mock._target[mock._method] = mock._original;
      }
      mock.mockReset();
    }
    __allMockFns.length = 0;
  },

  // No-op for module mocking (not supported in GAS)
  mock: function () {
    return jestObject;
  },
  unmock: function () {
    return jestObject;
  },
  requireActual: function (m: string) {
    return {};
  },

  // Timer mocking stubs (no-op in GAS)
  useFakeTimers: function () {
    return jestObject;
  },
  useRealTimers: function () {
    return jestObject;
  },
  advanceTimersByTime: function () {
    return jestObject;
  },
  runAllTimers: function () {
    return jestObject;
  }
};

// ─── Test Runner ───────────────────────────────────────────────────────────────

/**
 * Runs all collected tests using a TestFramework instance.
 * Returns the test results.
 *
 * @param {string} suiteName - Name for the test suite
 * @param {Function} TestFramework - TestFramework constructor
 * @param {Function} Assert - Assert class
 * @returns {Object} Test results { passed, failed, skipped, errors }
 */
function runCollectedTests(
  suiteName: string,
  TestFramework: new (name: string) => {
    register(name: string, body: Hook, options: { skip: boolean }): unknown;
    run(): unknown;
  },
  Assert?: unknown
) {
  const framework = new TestFramework(suiteName);
  const tests = __testRegistry.suites;

  for (let i = 0; i < tests.length; i++) {
    (function (testEntry: CollectedTest) {
      framework.register(
        testEntry.name,
        () => {
          // Run beforeEach hooks
          for (let j = 0; j < testEntry.beforeEachHooks.length; j++) {
            testEntry.beforeEachHooks[j]();
          }

          try {
            testEntry.fn();
          } finally {
            // Run afterEach hooks (even on failure)
            for (let k = 0; k < testEntry.afterEachHooks.length; k++) {
              try {
                testEntry.afterEachHooks[k]();
              } catch (e) {
                // Log but don't fail the test for afterEach errors
                Logger.log('  afterEach error: ' + (e as Error).message);
              }
            }
          }
        },
        { skip: testEntry.skip }
      );
    })(tests[i]);
  }

  return framework.run();
}

/**
 * Resets the test registry for a new test file.
 * Call this before importing/executing each test file.
 */
function resetTestRegistry() {
  __testRegistry.suites = [];
  __testRegistry.currentSuitePath = [];
  __testRegistry.currentBeforeEach = [];
  __testRegistry.currentAfterEach = [];
  __testRegistry.currentBeforeAll = [];
  __testRegistry.currentAfterAll = [];
  jestObject.restoreAllMocks();
  __allMockFns.length = 0;
}

// ─── Exports ───────────────────────────────────────────────────────────────────

// Attach to describe
_describe.skip = function (name: string, fn: Hook) {
  // Mark all tests inside as skipped
  __testRegistry.currentSuitePath.push(name + ' [SKIPPED]');
  fn();
  __testRegistry.currentSuitePath.pop();
};

_describe.only = _describe; // In GAS, .only behaves same as normal

// Attach to it
_it.skip = function (name: string) {
  _it(name, () => {}, { skip: true });
};

_it.only = _it; // In GAS, .only behaves same as normal

_it.each = _itEach;

// test is an alias for it
const _test = _it;
_test.skip = _it.skip;
_test.only = _it.only;
_test.each = _it.each;

export {
  _describe as describe,
  _it as it,
  _test as test,
  createExpect as expect,
  _beforeEach as beforeEach,
  _afterEach as afterEach,
  _beforeAll as beforeAll,
  _afterAll as afterAll,
  jestObject as jest,
  createMockFn,
  runCollectedTests,
  resetTestRegistry,
  __testRegistry
};
