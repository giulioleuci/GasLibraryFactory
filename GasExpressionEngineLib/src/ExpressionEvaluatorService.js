/**
 * @file GasExpressionEngineLib/src/ExpressionEvaluatorService.js
 * @description Service for evaluating dynamic logical expressions.
 *              Evaluates Abstract Syntax Trees (AST) against a Unified Data Context (UDC)
 *              by delegating placeholder resolution to PlaceholderService.
 * @version 1.0.0
 */

import { RegexUtils, ValidationUtils } from '@CoreUtilsLib';
import { AstNodeEvaluator } from './internal/AstNodeEvaluator.js';
import { EvaluationContextHandler } from './handlers/EvaluationContextHandler.js';
import { OperatorHandler } from './internal/OperatorHandler.js';

/**
 * Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.
 * @class
 */
export class ExpressionEvaluatorService {
  /**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
  static get di() {
    return {
      name: 'expressionEvaluatorService',
      dependencies: ['logger', 'expressionParserService', 'placeholderService'],
      isSingleton: true,
      factory: (logger, expressionParserService, placeholderService) =>
        new ExpressionEvaluatorService(logger, expressionParserService, placeholderService)
    };
  }

  /**
   * Initializes the evaluator with required parsing and placeholder resolution services.
   * @param {Object} logger Diagnostic output interface.
   * @param {ExpressionParserService} parserService Logic parser for AST generation.
   * @param {Object} placeholderService Template engine for {{placeholder}} resolution.
   * @throws {Error} If mandatory dependencies are missing or malformed.
   */
  constructor(logger, parserService, placeholderService) {
    // GEL-H004: Use ValidationUtils from CoreUtilsLib for input validation
    ValidationUtils.validateLogger(logger, 'ExpressionEvaluatorService');
    ValidationUtils.validateDependency(
      parserService,
      'parserService',
      'ExpressionEvaluatorService',
      ['parse']
    );

    ValidationUtils.validateDependency(
      placeholderService,
      'placeholderService',
      'ExpressionEvaluatorService',
      ['resolve']
    );

    this.logger = logger;
    this.parser = parserService;
    this.placeholderService = placeholderService;

    // Facade Delegation. Public/internal methods are exposed via explicit
    // delegating methods below rather than dynamic bind-loops, so the surface
    // is statically visible. Rest args preserve each sub-service signature.
    this._astEvaluator = new AstNodeEvaluator(this);
    this._contextHandler = new EvaluationContextHandler(this);
    this._operatorHandler = new OperatorHandler(this);
  }

  // --- Delegated AstNodeEvaluator methods ---

  /** @private */
  _evaluateNode(...args) {
    return this._astEvaluator._evaluateNode(...args);
  }

  /** @private */
  _evaluateIdentifier(...args) {
    return this._astEvaluator._evaluateIdentifier(...args);
  }

  /** @private */
  _evaluateMemberExpression(...args) {
    return this._astEvaluator._evaluateMemberExpression(...args);
  }

  /** @private */
  _buildPathFromMemberExpression(...args) {
    return this._astEvaluator._buildPathFromMemberExpression(...args);
  }

  /** @private */
  _evaluateLiteral(...args) {
    return this._astEvaluator._evaluateLiteral(...args);
  }

  /** @private */
  _evaluateArrayExpression(...args) {
    return this._astEvaluator._evaluateArrayExpression(...args);
  }

  /** @private */
  _evaluateCallExpression(...args) {
    return this._astEvaluator._evaluateCallExpression(...args);
  }

  // --- Delegated EvaluationContextHandler methods ---

  /** @private */
  _areBothNullOrUndefined(...args) {
    return this._contextHandler._areBothNullOrUndefined(...args);
  }

  /** @private */
  _hasCircularReference(...args) {
    return this._contextHandler._hasCircularReference(...args);
  }

  /** @description Evaluates an expression string against a context. */
  evaluate(...args) {
    return this._contextHandler.evaluate(...args);
  }

  /** @description Evaluates a pre-parsed AST against a context. */
  evaluateAst(...args) {
    return this._contextHandler.evaluateAst(...args);
  }

  /** @private */
  _parseValue(...args) {
    return this._contextHandler._parseValue(...args);
  }

  // --- Delegated OperatorHandler methods ---

  /** @private */
  _evaluateLogicalExpression(...args) {
    return this._operatorHandler._evaluateLogicalExpression(...args);
  }

  /** @private */
  _evaluateBinaryExpression(...args) {
    return this._operatorHandler._evaluateBinaryExpression(...args);
  }

  /** @private */
  _evaluateUnaryExpression(...args) {
    return this._operatorHandler._evaluateUnaryExpression(...args);
  }

  /** @private */
  _compare(...args) {
    return this._operatorHandler._compare(...args);
  }

  /** @private */
  _equals(...args) {
    return this._operatorHandler._equals(...args);
  }

  // =============================================================================
  // TYPE CHECKING UTILITIES (GEL-M003: Reduce code duplication)
  // =============================================================================

  // Type checking methods removed - now using CoreUtilsLib TypeUtils
  // _isString, _isNumber, _isBoolean, _isNullOrUndefined -> TypeUtils methods

  /**
   * Checks if both values are null or undefined.
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} True if both values are null or undefined
   * @private
   */
  // =============================================================================
  // BUILT-IN FUNCTIONS (GEL-HIGH-001)
  // =============================================================================

  get _builtInFunctions() {
    return {
      // ===== STRING FUNCTIONS =====

      /**
       * Returns the length of a string.
       *
       * @param {*} str - The string to measure (converted to string if not already)
       * @returns {number} The length of the string, or 0 if null/undefined
       *
       * @example
       * len('hello') // Returns: 5
       * len({{name}}) // Returns length of name value
       * len(null) // Returns: 0
       */
      len: (str) => {
        if (str == null) {
          return 0;
        }
        return String(str).length;
      },

      /**
       * Converts a string to uppercase.
       *
       * @param {*} str - The string to convert (converted to string if not already)
       * @returns {string} The uppercase string, or empty string if null/undefined
       *
       * @example
       * upper('hello') // Returns: 'HELLO'
       * upper({{status}}) // Returns uppercase status value
       * upper(null) // Returns: ''
       */
      upper: (str) => {
        if (str == null) {
          return '';
        }
        return String(str).toUpperCase();
      },

      /**
       * Converts a string to lowercase.
       *
       * @param {*} str - The string to convert (converted to string if not already)
       * @returns {string} The lowercase string, or empty string if null/undefined
       *
       * @example
       * lower('HELLO') // Returns: 'hello'
       * lower({{name}}) // Returns lowercase name value
       * lower(null) // Returns: ''
       */
      lower: (str) => {
        if (str == null) {
          return '';
        }
        return String(str).toLowerCase();
      },

      /**
       * Trims whitespace from both ends of a string.
       *
       * @param {*} str - The string to trim (converted to string if not already)
       * @returns {string} The trimmed string, or empty string if null/undefined
       *
       * @example
       * trim('  hello  ') // Returns: 'hello'
       * trim({{input}}) // Returns trimmed input value
       * trim(null) // Returns: ''
       */
      trim: (str) => {
        if (str == null) {
          return '';
        }
        return String(str).trim();
      },

      /**
       * Extracts a substring from start index to end index (exclusive).
       *
       * @param {*} str - The source string (converted to string if not already)
       * @param {number} start - The starting index (0-based, inclusive)
       * @param {number} [end] - The ending index (0-based, exclusive). If omitted, extracts to end of string.
       * @returns {string} The extracted substring, or empty string if str is null/undefined
       *
       * @example
       * substring('hello', 0, 3) // Returns: 'hel'
       * substring('hello', 2) // Returns: 'llo'
       * substring({{name}}, 0, 5) // Returns first 5 characters of name
       */
      substring: (str, start, end) => {
        if (str == null) {
          return '';
        }
        str = String(str);
        if (end === undefined) {
          return str.substring(start);
        }
        return str.substring(start, end);
      },

      /**
       * Replaces all occurrences of a substring with another string.
       *
       * Uses global regex replacement to replace all occurrences.
       *
       * @param {*} str - The source string (converted to string if not already)
       * @param {*} search - The substring to search for (converted to string, treated as literal)
       * @param {*} replacement - The replacement string (converted to string)
       * @returns {string} The string with all replacements made, or original string if search is null
       *
       * @example
       * replace('hello world', 'o', '0') // Returns: 'hell0 w0rld'
       * replace({{text}}, 'old', 'new') // Replaces all 'old' with 'new'
       * replace('test', null, 'x') // Returns: 'test' (no replacement)
       */
      replace: (str, search, replacement) => {
        if (str == null) {
          return '';
        }
        if (search == null) {
          return String(str);
        }
        return String(str).replace(new RegExp(String(search), 'g'), String(replacement || ''));
      },

      /**
       * Splits a string by a delimiter into an array.
       *
       * @param {*} str - The source string (converted to string if not already)
       * @param {*} delimiter - The delimiter to split on (converted to string). If empty string, splits into individual characters.
       * @returns {Array<string>} Array of substrings, or empty array if str is null/undefined
       *
       * @example
       * split('a,b,c', ',') // Returns: ['a', 'b', 'c']
       * split('hello', '') // Returns: ['h', 'e', 'l', 'l', 'o']
       * split({{csv}}, ',') // Splits CSV value into array
       */
      split: (str, delimiter) => {
        if (str == null) {
          return [];
        }
        return String(str).split(String(delimiter || ''));
      },

      // ===== NUMERIC FUNCTIONS =====

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
      },

      // ===== ARRAY FUNCTIONS =====

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
        return arr.some((elem) => this._equals(elem, value));
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
          if (this._equals(arr[i], value)) {
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

  // =============================================================================
  // COMPARISON UTILITIES
  // =============================================================================

  /**
   * Compares two values with STRICT type checking.
   *
   * Returns: -1 if a < b, 0 if a == b, 1 if a > b
   *
   * STRICT MODE BEHAVIOR (enforced for reliability):
   * - Requires both operands to be of the same type
   * - Throws an error if types don't match (except null/undefined)
   * - No implicit type coercion or string conversion
   *
   * The comparison logic handles:
   * - null/undefined values
   * - Numeric comparisons (numbers only)
   * - String comparisons (strings only, case-sensitive)
   * - Boolean comparisons (booleans only)
   * - Date comparisons (dates only)
   *
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {number} Comparison result
   * @throws {Error} If operand types don't match
   * @private
   */
}
