/**
 * @file GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.js
 * @description Built-in array functions for expression evaluation.
 *              Extracted from ExpressionEvaluatorService#_builtInFunctions (GEL-HIGH-001).
 * @version 1.0.0
 */

/**
 * Builds the array built-in functions map.
 *
 * `contains` and `indexOf` delegate equality checks to the owning
 * ExpressionEvaluatorService's `_equals` (strict, type-aware equality), so
 * this factory requires the evaluator instance rather than being a
 * standalone pure module like StringFunctions/NumericFunctions.
 *
 * @param {ExpressionEvaluatorService} evaluator - The evaluator instance providing `_equals`.
 * @returns {Object<string, Function>} Map of array function name to implementation.
 */
export function createArrayFunctions(evaluator) {
  return {
    /**
     * Returns the length of an array or string.
     *
     * @param {Array|string|*} arr - The array or string to measure (non-arrays converted to string)
     * @returns {number} The length of the array/string, or 0 if null/undefined
     *
     * @example
     * length([1, 2, 3]) // Returns: 3
     * length('hello') // Returns: 5
     * length({{items}}) // Returns length of items array
     */
    length: (arr) => {
      if (arr == null) {
        return 0;
      }
      if (Array.isArray(arr)) {
        return arr.length;
      }
      // Also handle strings
      return String(arr).length;
    },

    /**
     * Checks if an array contains a value using strict equality.
     *
     * @param {Array} arr - The array to search
     * @param {*} value - The value to find
     * @returns {boolean} True if the array contains the value, false otherwise
     *
     * @example
     * contains([1, 2, 3], 2) // Returns: true
     * contains(['a', 'b'], 'c') // Returns: false
     * contains({{roles}}, 'admin') // Returns true if roles contains 'admin'
     */
    contains: (arr, value) => {
      if (!Array.isArray(arr)) {
        return false;
      }
      return arr.some((elem) => evaluator._equals(elem, value));
    },

    /**
     * Returns the index of a value in an array, or -1 if not found.
     *
     * Uses strict equality for comparison.
     *
     * @param {Array} arr - The array to search
     * @param {*} value - The value to find
     * @returns {number} The index of the value (0-based), or -1 if not found
     *
     * @example
     * indexOf([1, 2, 3], 2) // Returns: 1
     * indexOf(['a', 'b'], 'c') // Returns: -1
     * indexOf({{items}}, {{target}}) // Returns index of target in items
     */
    indexOf: (arr, value) => {
      if (!Array.isArray(arr)) {
        return -1;
      }
      for (let i = 0; i < arr.length; i++) {
        if (evaluator._equals(arr[i], value)) {
          return i;
        }
      }
      return -1;
    },

    /**
     * Returns the first element of an array.
     *
     * @param {Array} arr - The array
     * @returns {*|null} The first element, or null if array is empty/null/not an array
     *
     * @example
     * first([1, 2, 3]) // Returns: 1
     * first([]) // Returns: null
     * first({{items}}) // Returns first item in items array
     */
    first: (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) {
        return null;
      }
      return arr[0];
    },

    /**
     * Returns the last element of an array.
     *
     * @param {Array} arr - The array
     * @returns {*|null} The last element, or null if array is empty/null/not an array
     *
     * @example
     * last([1, 2, 3]) // Returns: 3
     * last([]) // Returns: null
     * last({{items}}) // Returns last item in items array
     */
    last: (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) {
        return null;
      }
      return arr[arr.length - 1];
    }
  };
}
