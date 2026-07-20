/**
 * @file GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js
 * @description Built-in numeric/math functions for expression evaluation.
 *              Extracted from ExpressionEvaluatorService#_builtInFunctions (GEL-HIGH-001).
 * @version 1.0.0
 */

/**
 * Builds the numeric built-in functions map.
 * @returns {Object<string, Function>} Map of numeric function name to implementation.
 */
export function createNumericFunctions() {
  return {
    /**
     * Returns the absolute value of a number.
     *
     * @param {number} num - The number to process
     * @returns {number} The absolute value of the number
     * @throws {Error} If num is not a valid number
     *
     * @example
     * abs(-5) // Returns: 5
     * abs(3.14) // Returns: 3.14
     * abs({{temperature}}) // Returns absolute value of temperature
     */
    abs: (num) => {
      if (typeof num !== 'number' || isNaN(num)) {
        throw new Error('abs() requires a number');
      }
      return Math.abs(num);
    },

    /**
     * Rounds a number to the nearest integer or specified decimal places.
     *
     * @param {number} num - The number to round
     * @param {number} [decimals] - The number of decimal places (optional). If omitted, rounds to nearest integer.
     * @returns {number} The rounded number
     * @throws {Error} If num is not a valid number
     *
     * @example
     * round(3.7) // Returns: 4
     * round(3.14159, 2) // Returns: 3.14
     * round({{price}}, 2) // Rounds price to 2 decimal places
     */
    round: (num, decimals) => {
      if (typeof num !== 'number' || isNaN(num)) {
        throw new Error('round() requires a number');
      }
      if (decimals === undefined) {
        return Math.round(num);
      }
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
    },

    /**
     * Rounds a number up to the nearest integer.
     *
     * @param {number} num - The number to round up
     * @returns {number} The smallest integer greater than or equal to num
     * @throws {Error} If num is not a valid number
     *
     * @example
     * ceil(3.1) // Returns: 4
     * ceil(-1.5) // Returns: -1
     * ceil({{value}}) // Rounds value up to nearest integer
     */
    ceil: (num) => {
      if (typeof num !== 'number' || isNaN(num)) {
        throw new Error('ceil() requires a number');
      }
      return Math.ceil(num);
    },

    /**
     * Rounds a number down to the nearest integer.
     *
     * @param {number} num - The number to round down
     * @returns {number} The largest integer less than or equal to num
     * @throws {Error} If num is not a valid number
     *
     * @example
     * floor(3.9) // Returns: 3
     * floor(-1.5) // Returns: -2
     * floor({{value}}) // Rounds value down to nearest integer
     */
    floor: (num) => {
      if (typeof num !== 'number' || isNaN(num)) {
        throw new Error('floor() requires a number');
      }
      return Math.floor(num);
    },

    /**
     * Returns the minimum of provided numbers.
     *
     * Non-number values are filtered out before comparison.
     *
     * @param {...number} numbers - Variable number of numeric arguments
     * @returns {number|null} The smallest number, or null if no arguments provided
     * @throws {Error} If no valid numbers are provided
     *
     * @example
     * min(5, 3, 8) // Returns: 3
     * min({{a}}, {{b}}, {{c}}) // Returns smallest of a, b, c
     * min() // Returns: null
     */
    min: (...numbers) => {
      if (numbers.length === 0) {
        return null;
      }
      const nums = numbers.filter((n) => typeof n === 'number' && !isNaN(n));
      if (nums.length === 0) {
        throw new Error('min() requires at least one number');
      }
      return Math.min(...nums);
    },

    /**
     * Returns the maximum of provided numbers.
     *
     * Non-number values are filtered out before comparison.
     *
     * @param {...number} numbers - Variable number of numeric arguments
     * @returns {number|null} The largest number, or null if no arguments provided
     * @throws {Error} If no valid numbers are provided
     *
     * @example
     * max(5, 3, 8) // Returns: 8
     * max({{a}}, {{b}}, {{c}}) // Returns largest of a, b, c
     * max() // Returns: null
     */
    max: (...numbers) => {
      if (numbers.length === 0) {
        return null;
      }
      const nums = numbers.filter((n) => typeof n === 'number' && !isNaN(n));
      if (nums.length === 0) {
        throw new Error('max() requires at least one number');
      }
      return Math.max(...nums);
    },

    /**
     * Returns the square root of a number.
     *
     * @param {number} num - The number (must be non-negative)
     * @returns {number} The square root of the number
     * @throws {Error} If num is not a valid non-negative number
     *
     * @example
     * sqrt(9) // Returns: 3
     * sqrt(2) // Returns: 1.4142135623730951
     * sqrt({{area}}) // Returns square root of area
     */
    sqrt: (num) => {
      if (typeof num !== 'number' || isNaN(num)) {
        throw new Error('sqrt() requires a number');
      }
      if (num < 0) {
        throw new Error('sqrt() requires a non-negative number');
      }
      return Math.sqrt(num);
    },

    /**
     * Returns base raised to the power of exponent.
     *
     * @param {number} base - The base number
     * @param {number} exponent - The exponent
     * @returns {number} The result of base^exponent
     * @throws {Error} If base or exponent is not a valid number
     *
     * @example
     * pow(2, 3) // Returns: 8
     * pow(10, 2) // Returns: 100
     * pow({{base}}, {{exp}}) // Returns base to the power of exp
     */
    pow: (base, exponent) => {
      if (
        typeof base !== 'number' ||
        isNaN(base) ||
        typeof exponent !== 'number' ||
        isNaN(exponent)
      ) {
        throw new Error('pow() requires two numbers');
      }
      return Math.pow(base, exponent);
    },

    /**
     * Checks if a value falls within a range (inclusive).
     *
     * This function is used internally for the 'between' operator.
     *
     * @param {number} value - The value to check
     * @param {number} min - The minimum value (inclusive)
     * @param {number} max - The maximum value (inclusive)
     * @returns {boolean} True if value is between min and max (inclusive)
     * @throws {Error} If any argument is not a valid number
     *
     * @example
     * between(5, 1, 10) // Returns: true
     * between(0, 1, 10) // Returns: false
     * between({{age}}, 18, 65) // Returns true if age is 18-65
     */
    between: (value, min, max) => {
      if (
        typeof value !== 'number' ||
        isNaN(value) ||
        typeof min !== 'number' ||
        isNaN(min) ||
        typeof max !== 'number' ||
        isNaN(max)
      ) {
        throw new Error(
          'between() requires three numeric values. Received: ' +
            `${typeof value}, ${typeof min}, ${typeof max}`
        );
      }
      return value >= min && value <= max;
    }
  };
}
