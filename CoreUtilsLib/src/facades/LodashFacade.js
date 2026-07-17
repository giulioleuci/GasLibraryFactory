/**
 * @file CoreUtilsLib/src/LodashFacade.js
 * @description Centralized facade for utility functions using a Hybrid Approach.
 *
 * This module provides a unified interface to utility functions, employing a
 * Strategic Hybrid Approach for optimal performance in Google Apps Script V8:
 * 1. **Native JS**: Used for trivial utilities (compact, flatten, isString, etc.)
 *    to eliminate overhead and minimize external dependencies.
 * 2. **es-toolkit/compat**: Retained for complex, edge-case utilities
 *    (cloneDeep, merge, get, set, debounce) where external testing adds high value.
 *
 * **Benefits:**
 * - Minimal bundle size via native code for common patterns
 * - Robustness via es-toolkit for complex data transformations
 * - Full API compatibility with existing library usage
 * - Optimized for GAS V8 runtime
 *
 * **Exported Categories:**
 *
 * **Array Utilities:**
 * - chunk, compact (native), difference, differenceBy, flatten (native), flattenDeep
 * - groupBy, intersection, keyBy, orderBy, uniq (native), uniqBy
 *
 * **Object Utilities:**
 * - cloneDeep, get, has, mapKeys, mapValues, merge, omit, pick, set
 *
 * **Collection Utilities:**
 * - every, filter, find, forEach, map, reduce, size, some
 *
 * **String Utilities:**
 * - camelCase, capitalize, kebabCase, snakeCase, startCase, truncate
 * - pascalCase, constantCase, dotCase, pathCase (custom)
 * - stringToArray, humanisePath (custom)
 *
 * **Type Checking:**
 * - isEmpty (native), isEqual, isNil (native), isNumber (native), isString (native)
 *
 * **Math Utilities:**
 * - maxBy, meanBy, minBy, sumBy
 *
 * **Function Utilities:**
 * - debounce, once, noop
 *
 * @module LodashFacade
 * @version 1.1.0
 */

// =============================================================================
// ES-TOOLKIT/COMPAT IMPORTS
// =============================================================================

// Array utilities
import {
  chunk,
  difference,
  differenceBy,
  flattenDeep,
  groupBy,
  intersection,
  keyBy,
  orderBy,
  uniqBy
} from 'es-toolkit/compat';

export const compact = (arr) => (Array.isArray(arr) ? arr.filter(Boolean) : []);
export const flatten = (arr) => (Array.isArray(arr) ? arr.flat() : []);
export const uniq = (arr) => (Array.isArray(arr) ? [...new Set(arr)] : []);

// Object utilities
import { cloneDeep, get, has, mapKeys, mapValues, merge, omit, pick, set } from 'es-toolkit/compat';

// Collection utilities (work on arrays and objects)
import { every, filter, find, forEach, map, reduce, size, some } from 'es-toolkit/compat';

// String utilities
import {
  camelCase,
  capitalize as esToolkitCapitalize,
  kebabCase,
  snakeCase,
  startCase,
  truncate as esToolkitTruncate
} from 'es-toolkit/compat';

// Type checking utilities
import { isEqual } from 'es-toolkit/compat';

export const isString = (val) => typeof val === 'string';
export const isNumber = (val) => typeof val === 'number'; // lodash-compatible: NaN has typeof 'number'
export const isNil = (val) => val == null;
export const isEmpty = (val) => {
  if (val == null) return true;
  if (typeof val === 'string' || Array.isArray(val)) return val.length === 0;
  if (val instanceof Map || val instanceof Set) return val.size === 0;
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
};

// Math utilities
import { maxBy, meanBy, minBy, sumBy } from 'es-toolkit/compat';

// Function utilities
import { debounce, once, noop } from 'es-toolkit/compat';

// =============================================================================
// CUSTOM STRING UTILITIES
// =============================================================================

/**
 * Decompose any naming convention (camel, snake, kebab) into an array of lowercase words.
 * @param {string} str - Identifier to decompose.
 * @returns {string[]} Ordered collection of lowercase word segments.
 */
export function stringToArray(str) {
  if (!str || typeof str !== 'string') {
    return [];
  }

  // Use kebabCase to normalize, then split - this handles all common cases
  return kebabCase(str)
    .split('-')
    .filter((word) => word.length > 0);
}

/**
 * Transform a string into PascalCase (UpperCamelCase) notation.
 * @param {string} str - Input identifier to format.
 * @returns {string} PascalCase representation.
 */
export function pascalCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  // Get words, capitalize first letter of each, join
  const words = stringToArray(str);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}

/**
 * Transform a string into CONSTANT_CASE (SCREAMING_SNAKE_CASE) notation.
 * @param {string} str - Input identifier to format.
 * @returns {string} CONSTANT_CASE representation.
 */
export function constantCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return stringToArray(str).join('_').toUpperCase();
}

/**
 * Transform a string into dot.case notation.
 * @param {string} str - Input identifier to format.
 * @returns {string} Dot-delimited lowercase string.
 */
export function dotCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return stringToArray(str).join('.');
}

/**
 * Transform a string into path/case notation.
 * @param {string} str - Input identifier to format.
 * @returns {string} Slash-delimited lowercase string.
 */
export function pathCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return stringToArray(str).join('/');
}

/**
 * Convert technical identifiers or paths into Title Case human-readable text.
 * @param {string} path - Technical path or ID to transform.
 * @param {string} [separator=' > '] - Hierarchical delimiter for segments.
 * @returns {string} Title Case representation with segments joined by the separator.
 */
export function humanisePath(path, separator = ' > ') {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Split by common path separators: /, \, or .
  const segments = path.split(/[/\\.]+/).filter((segment) => segment.length > 0);

  // Process each segment
  const humanizedSegments = segments.map((segment) => {
    // Get words from the segment (handles camelCase, snake_case, kebab-case, etc.)
    const words = stringToArray(segment);

    // Capitalize each word (Title Case)
    return words
      .map((word) => {
        // Keep numbers as-is
        if (/^\d+$/.test(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  });

  return humanizedSegments.join(separator);
}

// =============================================================================
// WRAPPED TRUNCATE (for backward compatibility with existing signature)
// =============================================================================

/**
 * Truncate a string to a specified length, appending a suffix if exceeded.
 * @param {string} str - Input text to truncate.
 * @param {number} maxLength - Maximum character limit before truncation.
 * @param {string} [suffix='...'] - Text appended to truncated results.
 * @returns {string} Truncated string or original if within bounds.
 */
export function truncate(str, maxLength, suffix = '...') {
  if (!str || typeof str !== 'string') {
    return str;
  }
  if (str.length <= maxLength) {
    return str;
  }

  return esToolkitTruncate(str, { length: maxLength, omission: suffix });
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Array utilities
export {
  chunk,
  difference,
  differenceBy,
  flattenDeep,
  groupBy,
  intersection,
  keyBy,
  orderBy,
  uniqBy
};

// Object utilities
export { cloneDeep, get, has, mapKeys, mapValues, merge, omit, pick, set };

// Collection utilities
export { every, filter, find, forEach, map, reduce, size, some };

// String utilities (es-toolkit)
export { camelCase, esToolkitCapitalize as capitalize, kebabCase, snakeCase, startCase };

// Type checking utilities
export { isEqual };

// Math utilities
export { maxBy, meanBy, minBy, sumBy };

// Function utilities
export { debounce, once, noop };

// =============================================================================
// NAMED EXPORT - Full facade object
// =============================================================================

/**
 * Full facade object containing all utility functions.
 *
 * Note: Changed from default export to named export to avoid gas-webpack-plugin
 * creating an invalid `function default()` which Terser cannot parse.
 *
 * @example
 * import { LodashFacade } from '@CoreUtilsLib/src/LodashFacade';
 * const result = LodashFacade.chunk([1, 2, 3, 4], 2);
 *
 * // Or import default for backward compatibility
 * import LodashFacade from '@CoreUtilsLib/src/LodashFacade';
 */
export const LodashFacade = {
  // Array utilities
  chunk,
  compact,
  difference,
  differenceBy,
  flatten,
  flattenDeep,
  groupBy,
  intersection,
  keyBy,
  orderBy,
  uniq,
  uniqBy,

  // Object utilities
  cloneDeep,
  get,
  has,
  mapKeys,
  mapValues,
  merge,
  omit,
  pick,
  set,

  // Collection utilities
  every,
  filter,
  find,
  forEach,
  map,
  reduce,
  size,
  some,

  // String utilities
  camelCase,
  capitalize: esToolkitCapitalize,
  kebabCase,
  snakeCase,
  startCase,
  truncate,
  pascalCase,
  constantCase,
  dotCase,
  pathCase,
  stringToArray,
  humanisePath,

  // Type checking utilities
  isEmpty,
  isEqual,
  isNil,
  isNumber,
  isString,

  // Math utilities
  maxBy,
  meanBy,
  minBy,
  sumBy,

  // Function utilities
  debounce,
  once,
  noop
};

// Note: No default export to avoid gas-webpack-plugin creating invalid 'function default()'
// Tests and external code should import via: import { LodashFacade } from '...'
// Or use individual named exports: import { chunk, merge, ... } from '...'
