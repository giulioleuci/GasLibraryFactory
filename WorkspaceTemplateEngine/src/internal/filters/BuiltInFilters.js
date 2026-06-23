/**
 * @file WorkspaceTemplateEngine/src/filters/BuiltInFilters.js
 * @description Built-in filter implementations using Strategy pattern.
 *              WTE-HIGH-001: Refactored from inline implementations in MyMustache.
 * @version 2.0.0
 */

import { FilterStrategy } from '../../FilterStrategy.js';

// ==================== STRING FILTERS ====================

/**
 * @description String transformer. Converts all characters to uppercase.
 * @class
 */
export class UppercaseFilter extends FilterStrategy {
  getName() {
    return 'uppercase';
  }
  getDescription() {
    return 'Converts text to uppercase';
  }
  execute(value) {
    return String(value).toUpperCase();
  }
}

/**
 * @description String transformer. Converts all characters to lowercase.
 * @class
 */
export class LowercaseFilter extends FilterStrategy {
  getName() {
    return 'lowercase';
  }
  getDescription() {
    return 'Converts text to lowercase';
  }
  execute(value) {
    return String(value).toLowerCase();
  }
}

/**
 * @description String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.
 * @class
 */
export class CapitalizeFilter extends FilterStrategy {
  getName() {
    return 'capitalize';
  }
  getDescription() {
    return 'Capitalizes the first character of text';
  }
  execute(value) {
    if (!value) {
      return '';
    }
    value = String(value);
    const chars = Array.from(value);
    return chars[0].toUpperCase() + value.slice(chars[0].length).toLowerCase();
  }
}

// ==================== NUMERIC/DATE FILTERS ====================

/**
 * @description Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.
 * @class
 */
export class DateFilter extends FilterStrategy {
  constructor(utils) {
    super();
    this.utils = utils;
  }

  getName() {
    return 'date';
  }
  getDescription() {
    return 'Formats a date value';
  }

  execute(value) {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      return String(value);
    }
    try {
      if (this.utils && typeof this.utils.formatDate === 'function') {
        const formatted = this.utils.formatDate(value, 'dd/MM/yyyy');
        if (formatted) {
          return formatted;
        }
      }
    } catch (_e) {
      // Fall through to the self-contained formatter below.
    }
    // Honor the filter's dd/MM/yyyy contract even without a UtilsService,
    // and without relying on GAS's unreliable locale support.
    return DateFilter._formatDDMMYYYY(value);
  }

  /**
   * @description Formats a Date as dd/MM/yyyy using only arithmetic (no locale).
   * @param {Date} date Valid Date instance.
   * @returns {string} Zero-padded dd/MM/yyyy string.
   * @private
   */
  static _formatDDMMYYYY(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }
}

/**
 * @description Number formatter. Applies locale-specific formatting with optional fixed decimals.
 * @class
 */
export class NumberFilter extends FilterStrategy {
  getName() {
    return 'number';
  }
  getDescription() {
    return 'Formats a number with locale-specific formatting';
  }

  execute(value, decimals) {
    if (typeof value !== 'number') {
      return String(value);
    }
    if (decimals !== undefined) {
      const d = parseInt(decimals, 10);
      if (!isNaN(d) && d >= 0) {
        return value.toLocaleString('en-US', {
          minimumFractionDigits: d,
          maximumFractionDigits: d
        });
      }
    }
    return value.toLocaleString('en-US');
  }
}

// ==================== ARRAY FILTERS ====================

/**
 * @description Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.
 * @class
 */
export class JoinFilter extends FilterStrategy {
  getName() {
    return 'join';
  }
  getDescription() {
    return 'Joins array elements with a separator';
  }

  /**
   * @description Security guard against prototype pollution.
   * @param {string} key Property key.
   * @returns {boolean} True if restricted.
   * @private
   */
  _isDangerousKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  execute(array, key, separator = ', ') {
    if (!Array.isArray(array)) {
      return '';
    }
    // GEL-C004: Prevent prototype pollution in filter
    if (this._isDangerousKey(key)) {
      return '';
    }
    return array
      .map((item) => {
        if (item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, key)) {
          return item[key];
        }
        return item;
      })
      .join(separator);
  }
}

/**
 * @description Conditional string selector. Returns singular or plural form based on a numeric count.
 * @class
 */
export class PluralizeFilter extends FilterStrategy {
  getName() {
    return 'pluralize';
  }
  getDescription() {
    return 'Returns singular or plural form based on count';
  }

  execute(number, singular, plural) {
    const n = Number(number);
    if (isNaN(n)) {
      return singular;
    }
    return n === 1 ? singular : plural;
  }
}

/**
 * @description Array sorter. Performs in-place sorting based on a specific property key. Includes prototype pollution protection.
 * @class
 */
export class SortByFilter extends FilterStrategy {
  getName() {
    return 'sortBy';
  }
  getDescription() {
    return 'Sorts an array by a property';
  }

  _isDangerousKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  execute(array, key) {
    if (!Array.isArray(array)) {
      return array;
    }
    // GEL-C004: Prevent prototype pollution in filter
    if (this._isDangerousKey(key)) {
      return array;
    }
    return [...array].sort((a, b) => {
      const valA =
        a && typeof a === 'object' && Object.prototype.hasOwnProperty.call(a, key) ? a[key] : null;
      const valB =
        b && typeof b === 'object' && Object.prototype.hasOwnProperty.call(b, key) ? b[key] : null;
      if (valA == null && valB != null) {
        return 1;
      }
      if (valA != null && valB == null) {
        return -1;
      }
      if (valA == null && valB == null) {
        return 0;
      }
      if (typeof valA !== 'string' || typeof valB !== 'string') {
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      }
      return valA.localeCompare(valB, 'en', { sensitivity: 'base' });
    });
  }
}

/**
 * @description Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.
 * @class
 */
export class WhereFilter extends FilterStrategy {
  getName() {
    return 'where';
  }
  getDescription() {
    return 'Filters array elements where a property matches a value';
  }

  _isDangerousKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  execute(array, key, value) {
    if (!Array.isArray(array)) {
      return [];
    }
    // GEL-C004: Prevent prototype pollution in filter
    if (this._isDangerousKey(key)) {
      return [];
    }
    return array.filter((item) => {
      return (
        item &&
        typeof item === 'object' &&
        Object.prototype.hasOwnProperty.call(item, key) &&
        item[key] === value
      );
    });
  }
}

/**
 * @description Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.
 * @class
 */
export class ExcludeFilter extends FilterStrategy {
  getName() {
    return 'exclude';
  }
  getDescription() {
    return 'Excludes array elements where a property matches a value';
  }

  _isDangerousKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  execute(array, key, value) {
    if (!Array.isArray(array)) {
      return [];
    }
    // GEL-C004: Prevent prototype pollution in filter
    if (this._isDangerousKey(key)) {
      return [];
    }
    return array.filter((item) => {
      return (
        item &&
        typeof item === 'object' &&
        Object.prototype.hasOwnProperty.call(item, key) &&
        item[key] !== value
      );
    });
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * @description Factory function that instantiates and returns all core built-in filter strategies.
 * @param {UtilsService} [utils] Optional utility service for date formatting.
 * @returns {FilterStrategy[]} Collection of core filter instances.
 */
export function createBuiltInFilters(utils) {
  return [
    new UppercaseFilter(),
    new LowercaseFilter(),
    new CapitalizeFilter(),
    new DateFilter(utils),
    new NumberFilter(),
    new JoinFilter(),
    new PluralizeFilter(),
    new SortByFilter(),
    new WhereFilter(),
    new ExcludeFilter()
  ];
}
