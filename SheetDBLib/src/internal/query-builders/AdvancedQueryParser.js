/**
 * @file SheetDBLib/src/query/managers/AdvancedQueryParser.js
 * @description Internal classes and functions for parsing and representing query structures.
 */

/**
 * @description Verifies if a value is strictly null or undefined.
 * @param {*} value - The value to verify.
 * @returns {boolean} True if the value is null-ish.
 * @private
 */
function _isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * @description Coerces a value to float, providing a fallback for NaN results.
 * @param {*} value - The input value to parse.
 * @param {number} [defaultValue=0] - Fallback if parsing fails.
 * @returns {number} The parsed float or default value.
 * @private
 */
function _safeParseFloat(value, defaultValue = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * @description Executes relational comparison between two operands based on a string operator.
 * Supports standard equality, inequality, range checks, LIKE (regex-based), IN (collection), and CONTAINS.
 * @param {*} leftValue - Primary operand.
 * @param {string} operator - Relational operator (e.g., '=', '>=', 'LIKE', 'IN').
 * @param {*} rightValue - Secondary operand or collection.
 * @returns {boolean} Evaluation result.
 * @private
 */
function _compareValues(leftValue, operator, rightValue) {
  // Handle null/undefined values for equality operators specifically to maintain loose equality behavior (null == undefined)
  if (
    leftValue == null &&
    (operator === '=' || operator === '==' || operator === '!=' || operator === '<>')
  ) {
    if (operator === '=' || operator === '==') {
      return rightValue == null;
    }
    return rightValue != null;
  }

  switch (operator) {
    case '=':
    case '==':
      return leftValue === rightValue;
    case '!=':
    case '<>':
      return leftValue !== rightValue;
    case '>':
      return leftValue > rightValue;
    case '>=':
      return leftValue >= rightValue;
    case '<':
      return leftValue < rightValue;
    case '<=':
      return leftValue <= rightValue;
    case 'LIKE': {
      if (typeof leftValue !== 'string') {
        return false;
      }
      const pattern = rightValue.toString().replace(/%/g, '.*');
      const regex = new RegExp(`^${pattern}$`, 'i');
      return regex.test(leftValue.toString());
    }
    case 'IN':
      return Array.isArray(rightValue) && rightValue.some((v) => v == leftValue);
    case 'NOT IN':
      return Array.isArray(rightValue) && !rightValue.some((v) => v == leftValue);
    case 'CONTAINS':
      return (
        typeof leftValue === 'string' &&
        typeof rightValue === 'string' &&
        leftValue.toLowerCase().includes(rightValue.toLowerCase())
      );
    default:
      return false;
  }
}

/**
 * @class QueryAggregation
 * @description Operational model for computing scalar aggregations over record collections.
 * Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.
 */
export class QueryAggregation {
  /**
   * @param {string} functionName - Aggregation type (e.g., 'SUM', 'AVG').
   * @param {string} field - Target field path for computation.
   * @param {string} [alias=null] - Output field name for the aggregated value.
   */
  constructor(functionName, field, alias = null) {
    this.function = functionName.toUpperCase();
    this.field = field;
    this.alias = alias || `${this.function}_${this.field}`;
  }

  /**
   * @description Internal field resolution supporting path-prefix handling.
   * @param {Object} row - Data record.
   * @param {string} field - Target identifier.
   * @returns {*} Resolved value or undefined.
   * @private
   */
  _getFieldValue(row, field) {
    if (Object.prototype.hasOwnProperty.call(row, field)) {
      return row[field];
    }
    for (const key in row) {
      if (key.endsWith(`.${field}`)) {
        return row[key];
      }
    }
    return undefined;
  }

  /**
   * @description Computes the configured aggregation over a collection of records.
   * @param {Object[]} rows - Data set to process.
   * @returns {number|null} Scalar result or null if input is empty/invalid.
   */
  calculate(rows) {
    if (!rows || rows.length === 0) {
      return null;
    }

    const values = rows
      .map((r) => this._getFieldValue(r, this.field))
      .filter((v) => !_isNullOrUndefined(v));

    if (values.length === 0) {
      return null;
    }

    switch (this.function) {
      case 'COUNT':
        return values.length;
      case 'SUM':
        return values.reduce((acc, val) => acc + _safeParseFloat(val), 0);
      case 'AVG':
        return values.reduce((acc, val) => acc + _safeParseFloat(val), 0) / values.length;
      case 'MIN':
        return Math.min(...values.map((v) => _safeParseFloat(v)));
      case 'MAX':
        return Math.max(...values.map((v) => _safeParseFloat(v)));
      default:
        return null;
    }
  }
}

// Export internal helper functions as well
export const AdvancedQueryParser = {
  _isNullOrUndefined,
  _safeParseFloat,
  _compareValues
};
