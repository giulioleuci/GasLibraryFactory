/**
 * @file CoreUtilsLib/src/utils/SystemEnvironmentUtils.js
 * @description System environment and runtime control utilities.
 */

import {
  isNil,
  isNumber,
  isString,
  isEmpty,
  isEqual,
  debounce,
  once,
  noop
} from '../facades/LodashFacade.js';

export class SystemEnvironmentUtils {
  declare _sleepFn: ((milliseconds: number) => void) | null;
  constructor(sleepFn: ((milliseconds: number) => void) | null = null) {
    this._sleepFn = sleepFn;
  }

  /**
   * Pauses execution for specified duration. Requires sleep function injection.
   * @param {number} milliseconds Duration to pause.
   * @throws {Error} If sleep function is not provided to constructor.
   */
  sleep(milliseconds: number) {
    if (!this._sleepFn) {
      throw new Error(
        'Sleep function not provided. CoreUtilsLib requires sleep to be injected via constructor. Import UtilitiesService from @GoogleApiWrapper to provide sleep implementation.'
      );
    }
    this._sleepFn(milliseconds);
  }

  /**
   * Executes provided function after a specified millisecond delay.
   * @param {Function} fn Function to execute.
   * @param {number} milliseconds Delay duration.
   * @returns {*} Return value of the executed function.
   */
  delay<T>(fn: () => T, milliseconds: number): T {
    this.sleep(milliseconds);
    return fn();
  }

  /**
   * Validates if a string matches basic email format (user@domain.tld).
   * @param {string} email String to validate.
   * @returns {boolean} True if format is valid.
   */
  isValidEmail(email: unknown) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates if a string matches basic URL format with protocol.
   * @param {string} url String to validate.
   * @returns {boolean} True if format is valid.
   */
  isValidUrl(url: unknown) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]+$/.test(url);
  }

  /**
   * Performs deep comparison between two values to determine equality.
   * @param {*} value First value.
   * @param {*} other Second value.
   * @returns {boolean} True if values are deeply equivalent.
   */
  isEqual(value: unknown, other: unknown) {
    return isEqual(value, other);
  }

  /**
   * Checks if value is strictly null or undefined.
   * @param {*} value Value to check.
   * @returns {boolean} True if null/undefined.
   */
  isNil(value: unknown) {
    return isNil(value);
  }

  /**
   * Checks if value is a Number primitive or object.
   * @param {*} value Value to check.
   * @returns {boolean} True if value is a number.
   */
  isNumber(value: unknown) {
    return isNumber(value);
  }

  /**
   * Checks if value is a String primitive or object.
   * @param {*} value Value to check.
   * @returns {boolean} True if value is a string.
   */
  isString(value: unknown) {
    return isString(value);
  }

  /**
   * Checks if value is an empty object, collection, map, or set.
   * @param {*} value Value to check.
   * @returns {boolean} True if empty.
   */
  isEmptyValue(value: unknown) {
    return isEmpty(value);
  }

  /**
   * Creates a debounced function that delays invocation until after wait milliseconds.
   * @param {Function} func Function to debounce.
   * @param {number} wait Milliseconds to delay.
   * @param {Object} [options] Debounce options.
   * @returns {Function} Debounced function.
   */
  debounce<T extends (...args: never[]) => unknown>(
    func: T,
    wait: number,
    options?: Parameters<typeof debounce>[2]
  ) {
    return debounce(func, wait, options);
  }

  /**
   * Restricts function invocation to a single execution.
   * @param {Function} func Function to restrict.
   * @returns {Function} Restricted function.
   */
  once<T extends (...args: never[]) => unknown>(func: T) {
    return once(func);
  }

  /**
   * Performs no operation and returns undefined.
   */
  noop() {
    return noop();
  }
}
