/**
 * @file CoreUtilsLib/src/utils/SystemQuotaManager.js
 * @description Collection and math utilities related to quota and limit management.
 */

import {
  chunk as _chunk,
  flatten as _flatten,
  flattenDeep as _flattenDeep,
  compact,
  difference,
  differenceBy,
  groupBy,
  intersection,
  keyBy,
  orderBy,
  uniq,
  uniqBy,
  every,
  filter as _filter,
  find as _find,
  forEach as _forEach,
  map as _map,
  reduce as _reduce,
  size,
  some,
  maxBy,
  meanBy,
  minBy,
  sumBy
} from '../facades/LodashFacade.js';

export class SystemQuotaManager {
  /**
   * Splits array into multiple smaller arrays of specified maximum size.
   * @param {Array} array Input collection to chunk.
   * @param {number} size Maximum length of each chunk.
   * @returns {Array[]} Collection of array segments.
   */
  chunk(array, size) {
    if (!Array.isArray(array) || size <= 0) {
      return [];
    }
    return _chunk(array, size);
  }

  /**
   * Deduplicates array values using a Set-based implementation for uniqueness.
   * @param {Array} array Input collection.
   * @returns {Array} Array containing only unique elements.
   */
  unique(array) {
    if (!Array.isArray(array)) {
      return [];
    }
    return [...new Set(array)];
  }

  /**
   * Flattens a nested array structure to the specified recursion depth.
   * @param {Array} array Nested input collection.
   * @param {number} [depth=1] Recursion limit (Infinity for deep flattening).
   * @returns {Array} Flattened collection.
   */
  flatten(array, depth = 1) {
    if (!Array.isArray(array)) {
      return [];
    }
    if (depth === Infinity) {
      return _flattenDeep(array);
    }
    let result = array;
    for (let i = 0; i < depth; i++) {
      result = _flatten(result);
    }
    return result;
  }

  /**
   * Flattens array structure by exactly one level.
   * @param {Array} array Nested input collection.
   * @returns {Array} Shallowly flattened array.
   */
  flattenShallow(array) {
    if (!Array.isArray(array)) {
      return [];
    }
    return _flatten(array);
  }

  /**
   * Recursively flattens all nested array levels into a single-dimensional array.
   * @param {Array} array Nested input collection.
   * @returns {Array} Fully flattened array.
   */
  flattenDeep(array) {
    if (!Array.isArray(array)) {
      return [];
    }
    return _flattenDeep(array);
  }

  /**
   * Removes all falsy values (false, null, 0, "", undefined, NaN) from the array.
   * @param {Array} array Input collection.
   * @returns {Array} Filtered collection with truthy values only.
   */
  compact(array) {
    if (!Array.isArray(array)) {
      return [];
    }
    return compact(array);
  }

  /**
   * Returns values from first array that are not present in subsequent arrays.
   * @param {Array} array Source collection to inspect.
   * @param {...Array} values Collections of values to exclude.
   * @returns {Array} Filtered collection of unique differences.
   */
  difference(array, ...values) {
    if (!Array.isArray(array)) {
      return [];
    }
    return difference(array, ...values);
  }

  /**
   * Returns differences between arrays using an iteratee for value comparison.
   * @param {Array} array Source collection.
   * @param {Array} values Exclusion collection.
   * @param {Function|string} iteratee Criteria for element comparison.
   * @returns {Array} Filtered collection.
   */
  differenceBy(array, values, iteratee) {
    if (!Array.isArray(array)) {
      return [];
    }
    return differenceBy(array, values, iteratee);
  }

  /**
   * Organizes array elements into an object keyed by the result of an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Logic to determine group keys.
   * @returns {Object.<string, Array>} Grouped elements object.
   */
  groupBy(array, iteratee) {
    if (!Array.isArray(array)) {
      return {};
    }
    return groupBy(array, iteratee);
  }

  /**
   * Returns unique values present in all provided arrays.
   * @param {...Array} arrays Collections to intersect.
   * @returns {Array} Collection of common elements.
   */
  intersection(...arrays) {
    return intersection(...arrays);
  }

  /**
   * Creates an object composed of keys generated from array elements using an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Logic to determine unique object keys.
   * @returns {Object} Object indexed by generated keys.
   */
  keyBy(array, iteratee) {
    if (!Array.isArray(array)) {
      return {};
    }
    return keyBy(array, iteratee);
  }

  /**
   * Sorts array elements by specified iteratees and sort orders.
   * @param {Array} array Input collection.
   * @param {Array|string} iteratees Sort criteria.
   * @param {Array|string} orders Sort directions ('asc' or 'desc').
   * @returns {Array} Ordered collection.
   */
  orderBy(array, iteratees, orders) {
    if (!Array.isArray(array)) {
      return [];
    }
    return orderBy(array, iteratees, orders);
  }

  /**
   * Returns a duplicate-free version of the array using strict equality.
   * @param {Array} array Input collection.
   * @returns {Array} Unique value collection.
   */
  uniq(array) {
    if (!Array.isArray(array)) {
      return [];
    }
    return uniq(array);
  }

  /**
   * Returns a duplicate-free array based on an iteratee comparison.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Uniqueness criteria.
   * @returns {Array} Unique value collection.
   */
  uniqBy(array, iteratee) {
    if (!Array.isArray(array)) {
      return [];
    }
    return uniqBy(array, iteratee);
  }

  /**
   * Generates a pseudo-random integer within the specified inclusive range.
   * @param {number} min Minimum possible value.
   * @param {number} max Maximum possible value.
   * @returns {number} Random integer.
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Rounds a number to a specified number of decimal places.
   * @param {number} number Value to round.
   * @param {number} [decimals=0] Precision limit.
   * @returns {number} Rounded value.
   */
  round(number, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(number * multiplier) / multiplier;
  }

  /**
   * Constrains a number to stay within a defined minimum and maximum boundary.
   * @param {number} number Value to clamp.
   * @param {number} min Lower bound.
   * @param {number} max Upper bound.
   * @returns {number} Boundary-constrained value.
   */
  clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  /**
   * Identifies the collection element with the highest value according to an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Criteria for comparison.
   * @returns {*} Element with the maximum resolved value.
   */
  maxBy(array, iteratee) {
    if (!Array.isArray(array) || array.length === 0) {
      return undefined;
    }
    return maxBy(array, iteratee);
  }

  /**
   * Identifies the collection element with the lowest value according to an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Criteria for comparison.
   * @returns {*} Element with the minimum resolved value.
   */
  minBy(array, iteratee) {
    if (!Array.isArray(array) || array.length === 0) {
      return undefined;
    }
    return minBy(array, iteratee);
  }

  /**
   * Calculates the arithmetic sum of values resolved via an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Logic to extract numeric values.
   * @returns {number} Calculated sum.
   */
  sumBy(array, iteratee) {
    if (!Array.isArray(array) || array.length === 0) {
      return 0;
    }
    return sumBy(array, iteratee);
  }

  /**
   * Calculates the arithmetic mean (average) of values resolved via an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Logic to extract numeric values.
   * @returns {number} Calculated mean.
   */
  meanBy(array, iteratee) {
    if (!Array.isArray(array) || array.length === 0) {
      return NaN;
    }
    return meanBy(array, iteratee);
  }

  /**
   * Checks if all elements in the collection satisfy the provided predicate.
   * @param {Array|Object} collection Input collection.
   * @param {Function} predicate Validation logic.
   * @returns {boolean} True if every element passes.
   */
  every(collection, predicate) {
    return every(collection, predicate);
  }

  /**
   * Returns a subset of the collection containing only elements passing the predicate.
   * @param {Array|Object} collection Input collection.
   * @param {Function} predicate Filtering logic.
   * @returns {Array} Filtered subset.
   */
  filter(collection, predicate) {
    return _filter(collection, predicate);
  }

  /**
   * Locates the first element in the collection that satisfies the predicate.
   * @param {Array|Object} collection Input collection.
   * @param {Function} predicate Search logic.
   * @param {number} [fromIndex=0] Starting search index.
   * @returns {*} First matching element or undefined.
   */
  find(collection, predicate, fromIndex = 0) {
    return _find(collection, predicate, fromIndex);
  }

  /**
   * Executes the provided iteratee for each element in the collection.
   * @param {Array|Object} collection Input collection.
   * @param {Function} iteratee Operation to perform.
   * @returns {Array|Object} Original collection (chainable).
   */
  forEach(collection, iteratee) {
    return _forEach(collection, iteratee);
  }

  /**
   * Creates a new array by transforming each collection element through an iteratee.
   * @param {Array|Object} collection Input collection.
   * @param {Function} iteratee Transformation logic.
   * @returns {Array} Transformed collection.
   */
  map(collection, iteratee) {
    return _map(collection, iteratee);
  }

  /**
   * Accumulates collection elements into a single value using a reducer function.
   * @param {Array|Object} collection Input collection.
   * @param {Function} iteratee Accumulator logic.
   * @param {*} [accumulator] Initial state.
   * @returns {*} Final accumulated value.
   */
  reduce(collection, iteratee, accumulator) {
    return _reduce(collection, iteratee, accumulator);
  }

  /**
   * Returns the count of elements in a collection, object properties, or string length.
   * @param {Array|Object|string} collection Input to measure.
   * @returns {number} Element count.
   */
  size(collection) {
    return size(collection);
  }

  /**
   * Checks if at least one element in the collection satisfies the provided predicate.
   * @param {Array|Object} collection Input collection.
   * @param {Function} predicate Validation logic.
   * @returns {boolean} True if any element passes.
   */
  some(collection, predicate) {
    return some(collection, predicate);
  }
}
