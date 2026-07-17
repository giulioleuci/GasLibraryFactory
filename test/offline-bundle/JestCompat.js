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
function createMockFn(implementation) {
  const mockState = {
    calls: [],
    results: [],
    instances: [],
    _implementation: implementation || null,
    _returnValue: undefined,
    _returnValues: [],
    _returnValueIndex: 0,
    _isOnce: false,
    _onceImplementations: [],
    _thrownError: null
  };

  function mockFn() {
    const args = Array.prototype.slice.call(arguments);
    mockState.calls.push(args);

    // Check once implementations first
    if (mockState._onceImplementations.length > 0) {
      const onceFn = mockState._onceImplementations.shift();
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
      var err = mockState._thrownError;
      mockState.results.push({ type: 'throw', value: err });
      throw err;
    }

    // Check return values queue
    if (mockState._returnValues.length > 0) {
      var idx = Math.min(mockState._returnValueIndex, mockState._returnValues.length - 1);
      mockState._returnValueIndex++;
      var val = mockState._returnValues[idx];
      mockState.results.push({ type: 'return', value: val });
      return val;
    }

    // Check implementation
    if (mockState._implementation) {
      try {
        var result = mockState._implementation.apply(this, args);
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
  mockFn.mockReturnValue = function (val) {
    mockState._returnValue = val;
    return mockFn;
  };

  mockFn.mockReturnValueOnce = function (val) {
    mockState._onceImplementations.push(function () {
      return val;
    });
    return mockFn;
  };

  mockFn.mockResolvedValue = function (val) {
    mockState._returnValue = val;
    return mockFn;
  };

  mockFn.mockImplementation = function (fn) {
    mockState._implementation = fn;
    return mockFn;
  };

  mockFn.mockImplementationOnce = function (fn) {
    mockState._onceImplementations.push(fn);
    return mockFn;
  };

  mockFn.mockReturnThis = function () {
    mockState._implementation = function () {
      return this;
    };
    return mockFn;
  };

  mockFn.mockRejectedValue = function () {
    return mockFn;
  };

  mockFn.mockClear = function () {
    mockState.calls.length = 0;
    mockState.results.length = 0;
    mockState.instances.length = 0;
    mockState._returnValueIndex = 0;
    return mockFn;
  };

  mockFn.mockReset = function () {
    mockFn.mockClear();
    mockState._implementation = null;
    mockState._returnValue = undefined;
    mockState._returnValues = [];
    mockState._onceImplementations = [];
    mockState._thrownError = null;
    return mockFn;
  };

  mockFn.mockRestore = function () {
    mockFn.mockReset();
    return mockFn;
  };

  return mockFn;
}

// ─── Global Mock Registry ──────────────────────────────────────────────────────

var __allMockFns = [];

// ─── Expect / Matchers ─────────────────────────────────────────────────────────

function safeStringify(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') return '[Function]';
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  var keysA = Object.keys(a).sort();
  var keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) return false;
  for (var j = 0; j < keysA.length; j++) {
    if (keysA[j] !== keysB[j]) return false;
    if (!deepEqual(a[keysA[j]], b[keysA[j]])) return false;
  }
  return true;
}

function objectContaining(expected, actual) {
  if (typeof actual !== 'object' || actual === null) return false;
  var keys = Object.keys(expected);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!(key in actual)) return false;
    if (!deepEqual(expected[key], actual[key])) return false;
  }
  return true;
}

function createExpect(actual) {
  var negated = false;

  var matchers = {
    get not() {
      negated = !negated;
      return matchers;
    },

    toBe: function (expected) {
      var pass = actual === expected;
      if (negated ? pass : !pass) {
        throw new Error(
          (negated ? 'Expected value NOT to be ' : 'Expected: ') +
            safeStringify(expected) +
            '\nReceived: ' +
            safeStringify(actual)
        );
      }
    },

    toEqual: function (expected) {
      var pass = deepEqual(actual, expected);
      if (negated ? pass : !pass) {
        throw new Error(
          (negated ? 'Expected value NOT to equal ' : 'Expected: ') +
            safeStringify(expected) +
            '\nReceived: ' +
            safeStringify(actual)
        );
      }
    },

    toStrictEqual: function (expected) {
      var pass = deepEqual(actual, expected);
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
      var pass = actual !== undefined;
      if (negated ? pass : !pass) {
        throw new Error(
          negated ? 'Expected value to be undefined' : 'Expected value to be defined, got undefined'
        );
      }
    },

    toBeUndefined: function () {
      var pass = actual === undefined;
      if (negated ? pass : !pass) {
        throw new Error(
          negated
            ? 'Expected value NOT to be undefined'
            : 'Expected undefined, got: ' + safeStringify(actual)
        );
      }
    },

    toBeNull: function () {
      var pass = actual === null;
      if (negated ? pass : !pass) {
        throw new Error(
          negated ? 'Expected value NOT to be null' : 'Expected null, got: ' + safeStringify(actual)
        );
      }
    },

    toBeTruthy: function () {
      var pass = !!actual;
      if (negated ? pass : !pass) {
        throw new Error(
          negated
            ? 'Expected value NOT to be truthy'
            : 'Expected truthy, got: ' + safeStringify(actual)
        );
      }
    },

    toBeFalsy: function () {
      var pass = !actual;
      if (negated ? pass : !pass) {
        throw new Error(
          negated
            ? 'Expected value NOT to be falsy'
            : 'Expected falsy, got: ' + safeStringify(actual)
        );
      }
    },

    toBeNaN: function () {
      var pass = Number.isNaN(actual);
      if (negated ? pass : !pass) {
        throw new Error(
          negated ? 'Expected value NOT to be NaN' : 'Expected NaN, got: ' + safeStringify(actual)
        );
      }
    },

    toBeGreaterThan: function (expected) {
      var pass = actual > expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected ' + actual + (negated ? ' NOT' : '') + ' to be > ' + expected);
      }
    },

    toBeGreaterThanOrEqual: function (expected) {
      var pass = actual >= expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected ' + actual + (negated ? ' NOT' : '') + ' to be >= ' + expected);
      }
    },

    toBeLessThan: function (expected) {
      var pass = actual < expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected ' + actual + (negated ? ' NOT' : '') + ' to be < ' + expected);
      }
    },

    toBeLessThanOrEqual: function (expected) {
      var pass = actual <= expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected ' + actual + (negated ? ' NOT' : '') + ' to be <= ' + expected);
      }
    },

    toBeCloseTo: function (expected, precision) {
      if (precision === undefined) precision = 2;
      var diff = Math.abs(actual - expected);
      var pass = diff < Math.pow(10, -precision) / 2;
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected ' + actual + (negated ? ' NOT' : '') + ' to be close to ' + expected
        );
      }
    },

    toBeInstanceOf: function (expectedClass) {
      var pass = actual instanceof expectedClass;
      if (negated ? pass : !pass) {
        throw new Error(
          (negated ? 'Expected NOT to be instance of ' : 'Expected instance of ') +
            (expectedClass.name || expectedClass) +
            ', got: ' +
            (actual && actual.constructor ? actual.constructor.name : typeof actual)
        );
      }
    },

    toContain: function (expected) {
      var pass;
      if (typeof actual === 'string') {
        pass = actual.indexOf(expected) !== -1;
      } else if (Array.isArray(actual)) {
        pass = actual.indexOf(expected) !== -1;
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

    toContainEqual: function (expected) {
      var pass = false;
      if (Array.isArray(actual)) {
        for (var i = 0; i < actual.length; i++) {
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

    toHaveLength: function (expected) {
      var len = actual && actual.length !== undefined ? actual.length : -1;
      var pass = len === expected;
      if (negated ? pass : !pass) {
        throw new Error('Expected length ' + (negated ? 'NOT ' : '') + expected + ', got: ' + len);
      }
    },

    toHaveProperty: function (keyPath, value) {
      var keys = typeof keyPath === 'string' ? keyPath.split('.') : [keyPath];
      var current = actual;
      var pass = true;
      for (var i = 0; i < keys.length; i++) {
        if (current == null || !(keys[i] in Object(current))) {
          pass = false;
          break;
        }
        current = current[keys[i]];
      }
      if (pass && value !== undefined) {
        pass = deepEqual(current, value);
      }
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected object' +
            (negated ? ' NOT' : '') +
            ' to have property "' +
            keyPath +
            '"' +
            (value !== undefined ? ' with value ' + safeStringify(value) : '') +
            '\nReceived: ' +
            safeStringify(actual)
        );
      }
    },

    toMatch: function (expected) {
      var pass;
      if (expected instanceof RegExp) {
        pass = expected.test(actual);
      } else {
        pass = typeof actual === 'string' && actual.indexOf(expected) !== -1;
      }
      if (negated ? pass : !pass) {
        throw new Error(
          'Expected ' + safeStringify(actual) + (negated ? ' NOT' : '') + ' to match ' + expected
        );
      }
    },

    toMatchObject: function (expected) {
      var pass = objectContaining(expected, actual);
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

    toThrow: function (expected) {
      if (typeof actual !== 'function') {
        throw new Error('expect(value).toThrow() requires a function, got: ' + typeof actual);
      }
      var thrown = false;
      var thrownError = null;
      try {
        actual();
      } catch (e) {
        thrown = true;
        thrownError = e;
      }

      if (negated) {
        if (thrown) {
          throw new Error(
            'Expected function NOT to throw, but it threw: ' + (thrownError && thrownError.message)
          );
        }
        return;
      }

      if (!thrown) {
        throw new Error('Expected function to throw' + (expected ? ' "' + expected + '"' : ''));
      }

      if (expected !== undefined) {
        var msg = thrownError && (thrownError.message || String(thrownError));
        if (expected instanceof RegExp) {
          if (!expected.test(msg)) {
            throw new Error('Expected error matching ' + expected + ', got: "' + msg + '"');
          }
        } else if (typeof expected === 'string') {
          if (msg.indexOf(expected) === -1) {
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
      if (!actual || !actual._isMockFunction) {
        throw new Error('toHaveBeenCalled() requires a mock function');
      }
      var pass = actual.mock.calls.length > 0;
      if (negated ? pass : !pass) {
        throw new Error(
          negated ? 'Expected mock NOT to have been called' : 'Expected mock to have been called'
        );
      }
    },

    toHaveBeenCalledTimes: function (expected) {
      if (!actual || !actual._isMockFunction) {
        throw new Error('toHaveBeenCalledTimes() requires a mock function');
      }
      var count = actual.mock.calls.length;
      var pass = count === expected;
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
      if (!actual || !actual._isMockFunction) {
        throw new Error('toHaveBeenCalledWith() requires a mock function');
      }
      var expectedArgs = Array.prototype.slice.call(arguments);
      var pass = false;
      for (var i = 0; i < actual.mock.calls.length; i++) {
        if (deepEqual(actual.mock.calls[i], expectedArgs)) {
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
            safeStringify(actual.mock.calls)
        );
      }
    },

    toHaveBeenLastCalledWith: function () {
      if (!actual || !actual._isMockFunction) {
        throw new Error('toHaveBeenLastCalledWith() requires a mock function');
      }
      var expectedArgs = Array.prototype.slice.call(arguments);
      var lastCall = actual.mock.calls[actual.mock.calls.length - 1];
      var pass = deepEqual(lastCall, expectedArgs);
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

    toHaveBeenNthCalledWith: function (n) {
      if (!actual || !actual._isMockFunction) {
        throw new Error('toHaveBeenNthCalledWith() requires a mock function');
      }
      var rest = Array.prototype.slice.call(arguments, 1);
      var nthCall = actual.mock.calls[n - 1];
      var pass = deepEqual(nthCall, rest);
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

    toHaveReturnedWith: function (expected) {
      if (!actual || !actual._isMockFunction) {
        throw new Error('toHaveReturnedWith() requires a mock function');
      }
      var pass = false;
      for (var i = 0; i < actual.mock.results.length; i++) {
        if (
          actual.mock.results[i].type === 'return' &&
          deepEqual(actual.mock.results[i].value, expected)
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

  return matchers;
}

// Helper constructors for expect
createExpect.anything = function () {
  return { __expectAnything: true };
};

createExpect.any = function (constructor) {
  return { __expectAny: constructor };
};

createExpect.stringContaining = function (str) {
  return { __expectStringContaining: str };
};

createExpect.stringMatching = function (pattern) {
  return { __expectStringMatching: pattern };
};

createExpect.objectContaining = function (obj) {
  return { __expectObjectContaining: obj };
};

createExpect.arrayContaining = function (arr) {
  return { __expectArrayContaining: arr };
};

// ─── Test Collection Engine ────────────────────────────────────────────────────

/**
 * Global test registry
 * Collects all describe/it/beforeEach/afterEach registrations.
 */
var __testRegistry = {
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

function _describe(name, fn) {
  __testRegistry.currentSuitePath.push(name);

  // Save parent hooks
  var parentBeforeEach = __testRegistry.currentBeforeEach.slice();
  var parentAfterEach = __testRegistry.currentAfterEach.slice();
  var parentBeforeAll = __testRegistry.currentBeforeAll.slice();
  var parentAfterAll = __testRegistry.currentAfterAll.slice();

  // Reset for this scope (inherit parent hooks)
  __testRegistry.currentBeforeEach = parentBeforeEach.slice();
  __testRegistry.currentAfterEach = parentAfterEach.slice();
  __testRegistry.currentBeforeAll = parentBeforeAll.slice();
  __testRegistry.currentAfterAll = parentAfterAll.slice();

  // Collect beforeAll/afterAll that belong to this scope
  var scopeBeforeAll = [];
  var scopeAfterAll = [];
  var savedScopeBeforeAll = [];
  var savedScopeAfterAll = [];

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

function _it(name, fn, options) {
  var fullName = getFullPath() + ' > ' + name;
  var beforeEachHooks = __testRegistry.currentBeforeEach.slice();
  var afterEachHooks = __testRegistry.currentAfterEach.slice();

  __testRegistry.suites.push({
    name: fullName,
    fn: fn,
    skip: (options && options.skip) || false,
    beforeEachHooks: beforeEachHooks,
    afterEachHooks: afterEachHooks
  });
}

function _itEach(cases) {
  return function (nameTemplate, fn) {
    for (var i = 0; i < cases.length; i++) {
      var testCase = cases[i];
      var name;
      if (Array.isArray(testCase)) {
        name = nameTemplate.replace(/%s/g, function () {
          return String(testCase.shift());
        });
        // Re-create testCase since shift consumed it
        testCase = cases[i];
        (function (tc) {
          _it(name, function () {
            fn.apply(null, Array.isArray(tc) ? tc : [tc]);
          });
        })(testCase);
      } else {
        name = nameTemplate.replace(/%s/g, String(testCase));
        (function (tc) {
          _it(name, function () {
            fn(tc);
          });
        })(testCase);
      }
    }
  };
}

function _beforeEach(fn) {
  __testRegistry.currentBeforeEach.push(fn);
}

function _afterEach(fn) {
  __testRegistry.currentAfterEach.push(fn);
}

function _beforeAll(fn) {
  __testRegistry.currentBeforeAll.push(fn);
}

function _afterAll(fn) {
  __testRegistry.currentAfterAll.push(fn);
}

// ─── Jest Object ───────────────────────────────────────────────────────────────

var jestObject = {
  fn: function (implementation) {
    var mock = createMockFn(implementation);
    __allMockFns.push(mock);
    return mock;
  },

  spyOn: function (obj, method) {
    var original = obj[method];
    var spy = createMockFn(function () {
      return original.apply(obj, arguments);
    });
    spy._original = original;
    spy._target = obj;
    spy._method = method;
    obj[method] = spy;
    __allMockFns.push(spy);
    return spy;
  },

  clearAllMocks: function () {
    for (var i = 0; i < __allMockFns.length; i++) {
      __allMockFns[i].mockClear();
    }
  },

  resetAllMocks: function () {
    for (var i = 0; i < __allMockFns.length; i++) {
      __allMockFns[i].mockReset();
    }
  },

  restoreAllMocks: function () {
    for (var i = 0; i < __allMockFns.length; i++) {
      var mock = __allMockFns[i];
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
  requireActual: function (m) {
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
function runCollectedTests(suiteName, TestFramework, Assert) {
  var framework = new TestFramework(suiteName);
  var tests = __testRegistry.suites;

  for (var i = 0; i < tests.length; i++) {
    (function (testEntry) {
      framework.test(
        testEntry.name,
        function () {
          // Run beforeEach hooks
          for (var j = 0; j < testEntry.beforeEachHooks.length; j++) {
            testEntry.beforeEachHooks[j]();
          }

          try {
            testEntry.fn();
          } finally {
            // Run afterEach hooks (even on failure)
            for (var k = 0; k < testEntry.afterEachHooks.length; k++) {
              try {
                testEntry.afterEachHooks[k]();
              } catch (e) {
                // Log but don't fail the test for afterEach errors
                Logger.log('  afterEach error: ' + e.message);
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
_describe.skip = function (name, fn) {
  // Mark all tests inside as skipped
  __testRegistry.currentSuitePath.push(name + ' [SKIPPED]');
  fn();
  __testRegistry.currentSuitePath.pop();
};

_describe.only = _describe; // In GAS, .only behaves same as normal

// Attach to it
_it.skip = function (name) {
  _it(name, function () {}, { skip: true });
};

_it.only = _it; // In GAS, .only behaves same as normal

_it.each = _itEach;

// test is an alias for it
var _test = _it;
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
