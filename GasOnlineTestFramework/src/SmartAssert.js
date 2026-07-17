/**
 * Verbose assertion engine providing machine-readable diagnostic logs for every verification, optimized for LLM-driven test analysis.
 * @class
 */
export class SmartAssert {
  /**
   * Routes assertion outcomes to system logs and enforces test failure by throwing exceptions on mismatch.
   * @private
   * @param {boolean} passed Validation outcome.
   * @param {*} expected benchmark value.
   * @param {*} actual observed runtime value.
   * @param {string} message Contextual description of the assertion.
   * @throws {Error} If the assertion fails (passed is false).
   */
  static _safeStringify(value) {
    if (value === undefined) return 'undefined';
    try {
      return JSON.stringify(value);
    } catch (_e) {
      const seen = new WeakSet();
      try {
        return JSON.stringify(value, (_k, v) => {
          if (v && typeof v === 'object') {
            if (seen.has(v)) return '[Circular]';
            seen.add(v);
          }
          return v;
        });
      } catch (_e2) {
        try {
          return String(value);
        } catch (_e3) {
          return '[Unserializable]';
        }
      }
    }
  }

  static _log(passed, expected, actual, message) {
    const status = passed ? 'PASS' : 'FAIL';
    const expectedStr = this._safeStringify(expected);
    const actualStr = this._safeStringify(actual);
    const logMessage = `[ASSERT:${status}] Expected: ${expectedStr} | Actual: ${actualStr} | Desc: ${message}`;

    if (typeof Logger !== 'undefined') {
      Logger.log(logMessage);
    } else {
      console.log(logMessage);
    }

    if (!passed) {
      throw new Error(logMessage);
    }
  }

  /**
   * Performs a strict equality check (===) between two values.
   * @param {*} actual observed value.
   * @param {*} expected baseline value.
   * @param {string} [message='Values should be equal'] diagnostic context.
   */
  static equals(actual, expected, message = 'Values should be equal') {
    const passed = actual === expected;
    this._log(passed, expected, actual, message);
  }

  /**
   * Verifies that the observed value is strictly greater than the threshold.
   * @param {number|Date} actual observed value.
   * @param {number|Date} expected threshold baseline.
   * @param {string} [message='Actual should be greater than expected'] diagnostic context.
   */
  static greaterThan(actual, expected, message = 'Actual should be greater than expected') {
    const passed = actual > expected;
    this._log(passed, `> ${expected}`, actual, message);
  }

  /**
   * Verifies that the observed value is strictly less than the threshold.
   * @param {number|Date} actual observed value.
   * @param {number|Date} expected threshold baseline.
   * @param {string} [message='Actual should be less than expected'] diagnostic context.
   */
  static lessThan(actual, expected, message = 'Actual should be less than expected') {
    const passed = actual < expected;
    this._log(passed, `< ${expected}`, actual, message);
  }

  /**
   * Performs a strict inequality check (!==) between two values.
   * @param {*} actual observed value.
   * @param {*} expected baseline value.
   * @param {string} [message='Values should not be equal'] diagnostic context.
   */
  static notEquals(actual, expected, message = 'Values should not be equal') {
    const passed = actual !== expected;
    this._log(passed, expected, actual, message);
  }

  /**
   * Asserts that the provided value evaluates to a truthy state.
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be true'] diagnostic context.
   */
  static isTrue(actual, message = 'Value should be true') {
    const passed = !!actual;
    this._log(passed, true, actual, message);
  }

  /**
   * Asserts that the provided value evaluates to a falsy state.
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be false'] diagnostic context.
   */
  static isFalse(actual, message = 'Value should be false') {
    const passed = !actual;
    this._log(passed, false, actual, message);
  }

  /**
   * Verifies that the value is strictly null or undefined.
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be null or undefined'] diagnostic context.
   */
  static isNull(actual, message = 'Value should be null or undefined') {
    const passed = actual === null || actual === undefined;
    this._log(passed, null, actual, message);
  }

  /**
   * Verifies that the value is neither null nor undefined.
   * @param {*} actual candidate value.
   * @param {string} [message='Value should not be null or undefined'] diagnostic context.
   */
  static notNull(actual, message = 'Value should not be null or undefined') {
    const passed = actual !== null && actual !== undefined;
    this._log(passed, 'not null/undefined', actual, message);
  }

  /**
   * Evaluates structural equality of complex objects or arrays using JSON-based comparison.
   * @param {*} actual observed structure.
   * @param {*} expected baseline structure.
   * @param {string} [message='Objects should be deeply equal'] diagnostic context.
   */
  static deepEquals(actual, expected, message = 'Objects should be deeply equal') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    const passed = actualStr === expectedStr;
    this._log(passed, expected, actual, message);
  }

  /**
   * Verifies that the candidate value matches the specified JavaScript primitive or object type.
   * @param {*} actual candidate value.
   * @param {string} expectedType target classification (string|number|boolean|object|function).
   * @param {string} [message] diagnostic context.
   */
  static isType(actual, expectedType, message = `Value should be of type ${expectedType}`) {
    const actualType = typeof actual;
    const passed = actualType === expectedType;
    this._log(passed, expectedType, actualType, message);
  }

  /**
   * Verifies that the candidate value is a finite number (typeof === 'number' and not NaN).
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be a number'] diagnostic context.
   */
  static isNumber(actual, message = 'Value should be a number') {
    const passed = typeof actual === 'number' && !isNaN(actual);
    this._log(passed, 'number', typeof actual, message);
  }

  /**
   * Verifies that the candidate value is a string (typeof === 'string').
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be a string'] diagnostic context.
   */
  static isString(actual, message = 'Value should be a string') {
    const passed = typeof actual === 'string';
    this._log(passed, 'string', typeof actual, message);
  }

  /**
   * Asserts that the provided collection contains the target element.
   * @param {Array} array Search target collection.
   * @param {*} value Element to locate.
   * @param {string} [message='Array should contain value'] diagnostic context.
   */
  static contains(array, value, message = 'Array should contain value') {
    const passed = Array.isArray(array) && array.indexOf(value) !== -1;
    this._log(passed, `Array containing ${JSON.stringify(value)}`, array, message);
  }

  /**
   * Unconditionally triggers an assertion failure.
   * @param {string} [message='Intentional failure'] failure explanation.
   */
  static fail(message = 'Intentional failure') {
    this._log(false, 'N/A', 'N/A', message);
  }

  /**
   * Asserts that the provided logic block results in an exception.
   * @param {Function} fn Implementation logic to test.
   * @param {string} [message='Function should throw an error'] diagnostic context.
   */
  static throws(fn, message = 'Function should throw an error') {
    let caught = false;
    let errorActual = 'No error thrown';
    try {
      fn();
    } catch (e) {
      caught = true;
      errorActual = e.message;
    }
    this._log(caught, 'Error thrown', errorActual, message);
  }
}
