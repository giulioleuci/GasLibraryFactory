/**
 * @file WorkspaceTemplateEngine/src/filters/AdvancedFilters.js
 * @description Advanced filter implementations inspired by Handlebars and Liquid.
 *              Extends the Mustache template engine with "logic-light" features.
 * @version 2.1.0
 */

import { FilterStrategy } from '../../FilterStrategy.js';

// ==================== LOGIC & DEFAULTS ====================

/**
 * @description Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.
 * @class
 */
export class DefaultFilter extends FilterStrategy {
  declare _name: string;

  /**
   * @param {string} [name='default'] Registered filter name. Also registered
   *   as 'fallback' — same null/undefined/empty-string(/array) behavior.
   */
  constructor(name = 'default') {
    super();
    this._name = name;
  }

  getName() {
    return this._name;
  }
  getDescription() {
    return 'Returns the argument if value is null/undefined/empty';
  }

  execute(value: unknown, defaultValue: unknown = '') {
    // Check for null, undefined, empty string, or empty array
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    if (Array.isArray(value) && value.length === 0) {
      return defaultValue;
    }
    return value;
  }
}

/**
 * @description Boolean-to-string transformer. Format: "YesString,NoString".
 * @class
 */
export class YesNoFilter extends FilterStrategy {
  getName() {
    return 'yesno';
  }
  getDescription() {
    return 'Converts boolean to "YesString,NoString"';
  }

  execute(value: unknown, yesNoString: string = 'Yes,No') {
    const parts = yesNoString.split(',');
    const yesString = parts[0] || 'Yes';
    const noString = parts[1] || 'No';

    return value ? yesString : noString;
  }
}

// ==================== STRING MANIPULATION ====================

/**
 * @description String truncator with optional suffix. Defaults to 50 chars and "...".
 * @class
 */
export class TruncateFilter extends FilterStrategy {
  getName() {
    return 'truncate';
  }
  getDescription() {
    return 'Truncates string to N chars with optional suffix';
  }

  execute(value: unknown, length: string | number = 50, suffix: string = '...') {
    const str = String(value);
    const len = parseInt(length as string, 10);

    if (isNaN(len) || len <= 0) {
      return str;
    }

    if (str.length <= len) {
      return str;
    }

    return str.substring(0, len) + suffix;
  }
}

/**
 * @description String-to-array splitter using a specified separator (default: ",").
 * @class
 */
export class SplitFilter extends FilterStrategy {
  getName() {
    return 'split';
  }
  getDescription() {
    return 'Splits string by separator into an array';
  }

  execute(value: unknown, separator: string = ',') {
    return String(value).split(separator);
  }
}

/**
 * @description Global string replacer. Replaces all occurrences of searchValue with replaceValue.
 * @class
 */
export class ReplaceFilter extends FilterStrategy {
  getName() {
    return 'replace';
  }
  getDescription() {
    return 'Replaces occurrences of a string';
  }

  execute(value: unknown, searchValue?: string, replaceValue: string = '') {
    if (!searchValue) {
      return value;
    }

    // Use global replace (replaceAll equivalent)
    const str = String(value);
    return str.split(searchValue).join(replaceValue);
  }
}

/**
 * @description URI component encoder for URL-safe string generation.
 * @class
 */
export class UrlEncodeFilter extends FilterStrategy {
  getName() {
    return 'url_encode';
  }
  getDescription() {
    return 'Encodes URI components';
  }

  execute(value: unknown) {
    try {
      return encodeURIComponent(String(value));
    } catch (_e) {
      return String(value);
    }
  }
}

// ==================== ARRAY MANIPULATION ====================

/**
 * @description Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.
 * @class
 */
export class MapFilter extends FilterStrategy {
  getName() {
    return 'map';
  }
  getDescription() {
    return 'Extracts a specific property from an array of objects';
  }

  _isDangerousKey(key: string) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  execute<T, K extends keyof T>(array: T[], propertyName: K): T[K][];
  execute(array: unknown, propertyName?: string): unknown;
  execute(array: unknown, propertyName?: string): unknown {
    if (!Array.isArray(array)) {
      return array;
    }

    if (!propertyName || this._isDangerousKey(propertyName)) {
      return array;
    }

    return array.map((item) => {
      if (
        item &&
        typeof item === 'object' &&
        Object.prototype.hasOwnProperty.call(item, propertyName)
      ) {
        return item[propertyName];
      }
      return undefined;
    });
  }
}

/**
 * @description Array slicer. Returns the first N items (default: 10).
 * @class
 */
export class LimitFilter extends FilterStrategy {
  getName() {
    return 'limit';
  }
  getDescription() {
    return 'Returns the first N items';
  }

  execute<T>(array: T[], count?: string | number): T[];
  execute<T>(array: T, count?: string | number): T;
  execute(array: unknown, count: string | number = 10): unknown {
    if (!Array.isArray(array)) {
      return array;
    }

    const n = parseInt(count as string, 10);
    if (isNaN(n) || n <= 0) {
      return array;
    }

    return array.slice(0, n);
  }
}

/**
 * @description Array offsetter. Skips the first N items.
 * @class
 */
export class SkipFilter extends FilterStrategy {
  getName() {
    return 'skip';
  }
  getDescription() {
    return 'Skips the first N items';
  }

  execute<T>(array: T[], count?: string | number): T[];
  execute<T>(array: T, count?: string | number): T;
  execute(array: unknown, count: string | number = 0): unknown {
    if (!Array.isArray(array)) {
      return array;
    }

    const n = parseInt(count as string, 10);
    if (isNaN(n) || n <= 0) {
      return array;
    }

    return array.slice(n);
  }
}

/**
 * @description Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.
 * @class
 */
export class SortFilter extends FilterStrategy {
  declare _name: string;

  /**
   * @param {string} [name='sort'] Registered filter name. Also registered as
   *   'sortBy' (BuiltInFilters) for the single-property-ascending call shape.
   */
  constructor(name = 'sort') {
    super();
    this._name = name;
  }

  getName() {
    return this._name;
  }
  getDescription() {
    return 'Sorts array by property (optional: "desc")';
  }

  _isDangerousKey(key: string) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  execute<T>(array: T[], propertyOrDirection?: string, direction?: string): T[];
  execute<T>(array: T, propertyOrDirection?: string, direction?: string): T;
  execute(array: unknown, propertyOrDirection?: string, direction?: string): unknown {
    if (!Array.isArray(array)) {
      return array;
    }

    // If array is empty, return as-is
    if (array.length === 0) {
      return array;
    }

    // Determine if first arg is property name or direction
    let property: string | null = null;
    let isDescending = false;

    // Check if first argument is a direction keyword
    if (propertyOrDirection === 'desc' || propertyOrDirection === 'asc') {
      isDescending = propertyOrDirection === 'desc';
    } else if (propertyOrDirection) {
      property = propertyOrDirection;
      isDescending = direction === 'desc';
    } else {
      // No arguments, sort primitive values
      isDescending = false;
    }

    // Clone array to avoid mutation
    const sorted = [...array];

    sorted.sort((a, b) => {
      let valA, valB;

      if (property && !this._isDangerousKey(property)) {
        // Sort by property
        valA =
          a && typeof a === 'object' && Object.prototype.hasOwnProperty.call(a, property)
            ? a[property]
            : null;
        valB =
          b && typeof b === 'object' && Object.prototype.hasOwnProperty.call(b, property)
            ? b[property]
            : null;
      } else {
        // Sort by value directly
        valA = a;
        valB = b;
      }

      // Handle null/undefined
      if (valA == null && valB != null) {
        return 1;
      }
      if (valA != null && valB == null) {
        return -1;
      }
      if (valA == null && valB == null) {
        return 0;
      }

      // String comparison
      if (typeof valA === 'string' || typeof valB === 'string') {
        const result = String(valA).localeCompare(String(valB), 'en', { sensitivity: 'base' });
        return isDescending ? -result : result;
      }

      // Numeric comparison
      if (valA < valB) {
        return isDescending ? 1 : -1;
      }
      if (valA > valB) {
        return isDescending ? -1 : 1;
      }
      return 0;
    });

    return sorted;
  }
}

/**
 * @description Array order reverser. Creates a shallow copy before reversing.
 * @class
 */
export class ReverseFilter extends FilterStrategy {
  getName() {
    return 'reverse';
  }
  getDescription() {
    return 'Reverses array order';
  }

  execute<T>(array: T[]): T[];
  execute<T>(array: T): T;
  execute(array: unknown): unknown {
    if (!Array.isArray(array)) {
      return array;
    }

    return [...array].reverse();
  }
}

// ==================== MATH & FORMATTING ====================

/**
 * @description Numeric addition filter. Adds addend to the value.
 * @class
 */
export class PlusFilter extends FilterStrategy {
  getName() {
    return 'plus';
  }
  getDescription() {
    return 'Adds N to the value';
  }

  execute(value: unknown, addend: unknown = 0) {
    const num = Number(value);
    const add = Number(addend);

    if (isNaN(num) || isNaN(add)) {
      return value;
    }

    return num + add;
  }
}

/**
 * @description Numeric subtraction filter. Subtracts subtrahend from the value.
 * @class
 */
export class MinusFilter extends FilterStrategy {
  getName() {
    return 'minus';
  }
  getDescription() {
    return 'Subtracts N from the value';
  }

  execute(value: unknown, subtrahend: unknown = 0) {
    const num = Number(value);
    const sub = Number(subtrahend);

    if (isNaN(num) || isNaN(sub)) {
      return value;
    }

    return num - sub;
  }
}

/**
 * @description JSON serializer with optional indentation support.
 * @class
 */
export class JsonFilter extends FilterStrategy {
  getName() {
    return 'json';
  }
  getDescription() {
    return 'Serializes object to JSON string';
  }

  execute(value: unknown, indent?: string | number) {
    try {
      const indentValue = indent ? parseInt(indent as string, 10) : 0;
      return JSON.stringify(value, null, indentValue || undefined);
    } catch (_e) {
      return String(value);
    }
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * @description Factory function that instantiates and returns all advanced filter strategies.
 * @returns {FilterStrategy[]} Collection of advanced filter instances.
 */
export function createAdvancedFilters() {
  return [
    // Logic & Defaults
    new DefaultFilter(),
    new YesNoFilter(),
    new DefaultFilter('fallback'),

    // String Manipulation
    new TruncateFilter(),
    new SplitFilter(),
    new ReplaceFilter(),
    new UrlEncodeFilter(),

    // Array Manipulation
    new MapFilter(),
    new LimitFilter(),
    new SkipFilter(),
    new SortFilter(),
    new ReverseFilter(),

    // Math & Formatting
    new PlusFilter(),
    new MinusFilter(),
    new JsonFilter()
  ];
}
