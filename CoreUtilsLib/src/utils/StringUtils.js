/**
 * @file CoreUtilsLib/src/utils/StringUtils.js
 * @description Extracted StringUtils utility module.
 */

import {
  camelCase,
  kebabCase,
  snakeCase,
  startCase,
  pascalCase,
  constantCase,
  dotCase,
  pathCase,
  stringToArray,
  humanisePath
} from '../facades/LodashFacade.js';

export class StringUtils {
  /**
   * Checks if a string is null, undefined, empty, or consists only of whitespace.
   * @param {string} str String to evaluate.
   * @returns {boolean} True if string lacks non-whitespace content.
   */
  isEmpty(str) {
    return !str || (typeof str === 'string' && str.trim().length === 0);
  }

  /**
   * Truncates string to maximum length, appending a suffix if content exceeds limit.
   * @param {string} str Input string.
   * @param {number} maxLength Total allowed length including suffix.
   * @param {string} [suffix='...'] Truncation indicator.
   * @returns {string} Truncated result.
   */
  truncate(str, maxLength, suffix = '...') {
    if (!str || str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Converts the first character of the string to uppercase.
   * @param {string} str Input string.
   * @returns {string} String with capitalized first character.
   */
  capitalize(str) {
    if (!str) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Native implementation to convert hyphenated, underscored, or spaced strings to camelCase.
   * @param {string} str Input string.
   * @returns {string} Lower camelCase string.
   */
  toCamelCase(str) {
    if (!str) {
      return str;
    }
    return str.replace(/[-_\s](.)/g, (_, char) => char.toUpperCase());
  }

  /**
   * Native implementation to convert camelCase or PascalCase strings to snake_case.
   * @param {string} str Input string.
   * @returns {string} Underscored lowercase string.
   */
  toSnakeCase(str) {
    if (!str) {
      return str;
    }
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Lodash-based conversion of string to lower camelCase.
   * @param {string} str Input string.
   * @returns {string} camelCase string.
   */
  camelCase(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return camelCase(str);
  }

  /**
   * Lodash-based conversion of string to hyphenated kebab-case.
   * @param {string} str Input string.
   * @returns {string} kebab-case string.
   */
  kebabCase(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return kebabCase(str);
  }

  /**
   * Lodash-based conversion of string to underscored snake_case.
   * @param {string} str Input string.
   * @returns {string} snake_case string.
   */
  snakeCase(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return snakeCase(str);
  }

  /**
   * Lodash-based conversion of string to Start Case (space-separated, first letter of words capitalized).
   * @param {string} str Input string.
   * @returns {string} Start Case string.
   */
  startCase(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return startCase(str);
  }

  /**
   * Lodash-based conversion of string to PascalCase (UpperCamelCase).
   * @param {string} str Input string.
   * @returns {string} PascalCase string.
   */
  pascalCase(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return pascalCase(str);
  }

  /**
   * Lodash-based conversion of string to CONSTANT_CASE (SCREAMING_SNAKE_CASE).
   * @param {string} str Input string.
   * @returns {string} CONSTANT_CASE string.
   */
  constantCase(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return constantCase(str);
  }

  /**
   * Lodash-based conversion of string to dot.case notation.
   * @param {string} str Input string.
   * @returns {string} dot.case string.
   */
  dotCase(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return dotCase(str);
  }

  /**
   * Lodash-based conversion of string to path/case notation.
   * @param {string} str Input string.
   * @returns {string} path/case string.
   */
  pathCase(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return pathCase(str);
  }

  /**
   * Decomposes any format string (camel, Pascal, snake, etc.) into an array of lowercase words.
   * @param {string} str Input string to decompose.
   * @returns {string[]} Ordered array of lowercase word components.
   */
  stringToArray(str) {
    if (!str || typeof str !== 'string') {
      return [];
    }
    return stringToArray(str);
  }

  /**
   * Transforms technical paths or identifiers into human-readable text using specified separators.
   * @param {string} path Technical identifier or file path.
   * @param {string} [separator=' > '] Segment separator for output.
   * @returns {string} Human-readable path representation.
   */
  humanisePath(path, separator = ' > ') {
    if (!path || typeof path !== 'string') {
      return '';
    }
    return humanisePath(path, separator);
  }
}
