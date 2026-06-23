/**
 * @file SheetDBLib/src/dynamic/ColumnType.js
 * @description Enumeration of column data types for dynamic schemas.
 * @version 1.0.0
 */

/**
 * @enum {string}
 * @readonly
 * @description Native data types supported by the SheetDB schema engine.
 */
export const ColumnType = Object.freeze({
  /** Primitive string. */
  STRING: 'STRING',
  /** Float or integer. */
  NUMBER: 'NUMBER',
  /** True/False literal. */
  BOOLEAN: 'BOOLEAN',
  /** JS Date object or ISO string. */
  DATE: 'DATE',
  /** Plain object or array. */
  JSON: 'JSON'
});

/**
 * @function isValidColumnType
 * @description Validates if a string is a recognized ColumnType.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ColumnType.
 */
export function isValidColumnType(value) {
  return Object.values(ColumnType).includes(value);
}

/**
 * @function getColumnTypes
 * @description Retrieves all supported type strings.
 * @returns {string[]} Array of ColumnType values.
 */
export function getColumnTypes() {
  return Object.values(ColumnType);
}

/**
 * @function coerceToType
 * @description Enforces type conversion logic based on ColumnType mapping.
 * @param {*} value - Raw input.
 * @param {string} type - Target ColumnType.
 * @returns {*} Coerced primitive or null if conversion fails.
 */
export function coerceToType(value, type) {
  if (value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case ColumnType.STRING:
      return String(value);

    case ColumnType.NUMBER:
      const num = Number(value);
      return isNaN(num) ? null : num;

    case ColumnType.BOOLEAN:
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);

    case ColumnType.DATE:
      if (value instanceof Date) {
        return value;
      }
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;

    case ColumnType.JSON:
      if (typeof value === 'object') {
        return value;
      }
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }

    default:
      return value;
  }
}
