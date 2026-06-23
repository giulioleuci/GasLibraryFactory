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
  if (leftValue == null && (operator === '=' || operator === '==' || operator === '!=' || operator === '<>')) {
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
      return Array.isArray(rightValue) && rightValue.some(v => v == leftValue);
    case 'NOT IN':
      return Array.isArray(rightValue) && !rightValue.some(v => v == leftValue);
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
 * @class QueryCondition
 * @description Hierarchical model for data filtering rules.
 * Supports leaf-node comparisons and recursive branch nodes for AND/OR logic.
 */
export class QueryCondition {
  /**
   * @param {string} field - Target field path or identifier.
   * @param {string} [operator='='] - Relational operator.
   * @param {*} value - Comparison target or collection.
   * @param {'AND'|'OR'} [type='AND'] - Boolean join logic for sibling/child conditions.
   */
  constructor(field, operator, value, type = 'AND') {
    this.field = field;
    this.operator = operator || '=';
    this.value = value;
    this.type = type.toUpperCase();
    this.subConditions = [];
  }

  /**
   * @description Direct comparison of a raw value against this condition's configuration.
   * @param {*} rowValue - Value to evaluate.
   * @returns {boolean} Comparison result.
   */
  compareValue(rowValue) {
    return _compareValues(rowValue, this.operator, this.value);
  }

  /**
   * @description Appends a nested condition for recursive evaluation.
   * @param {QueryCondition} condition - Child node.
   * @returns {QueryCondition} Current instance for method chaining.
   */
  addSubCondition(condition) {
    this.subConditions.push(condition);
    return this;
  }

  /**
   * @description Evaluates this condition node (and its hierarchy) against a data record.
   * Resolves field path prefixes and applies AND/OR branch-cutting logic.
   * @param {Object} row - Data record to evaluate.
   * @returns {boolean} Node evaluation result.
   */
  evaluate(row) {
    if (this.subConditions.length === 0) {
      if (!this.field || !this.operator) {
        return true;
      }

      let rowValue = row[this.field];
      if (rowValue === undefined) {
        const suffix = `.${this.field}`;
        for (const key in row) {
          if (key.endsWith(suffix)) {
            rowValue = row[key];
            break;
          }
        }
      }

      return this.compareValue(rowValue);
    }

    let result = true;
    if (this.field && this.operator) {
      const rowValue = row[this.field];
      result = this.compareValue(rowValue);
    }

    for (const subCondition of this.subConditions) {
      if (this.type === 'AND') {
        result = result && subCondition.evaluate(row);
        if (!result) break;
      } else {
        result = result || subCondition.evaluate(row);
        if (result) break;
      }
    }

    return result;
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

/**
 * @class QueryGroup
 * @description Logic for dataset partitioning and group-level aggregation.
 * Generates group keys from field value combinations and applies QueryAggregation rules per group.
 */
export class QueryGroup {
  /**
   * @param {string|string[]} fields - Field identifier(s) used to define group uniqueness.
   */
  constructor(fields) {
    this.fields = Array.isArray(fields) ? fields : [fields];
    this.aggregations = [];
    this.condition = null;
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
   * @description Generates a composite string key for a row based on grouping fields.
   * @param {Object} row - Record to key.
   * @returns {string} Pipe-delimited group key.
   * @private
   */
  _calculateKey(row) {
    return this.fields
      .map((field) => {
        const value = this._getFieldValue(row, field);
        return _isNullOrUndefined(value) ? 'NULL' : value.toString();
      })
      .join('|');
  }

  /**
   * @description Registers an aggregation operation to be computed for each group.
   * @param {QueryAggregation} aggregation - Aggregation logic.
   */
  addAggregation(aggregation) {
    this.aggregations.push(aggregation);
  }

  /**
   * @description Configures a post-aggregation filter (HAVING clause).
   * @param {QueryCondition} condition - Condition to evaluate against aggregated results.
   */
  setCondition(condition) {
    this.condition = condition;
  }

  /**
   * @description Partitions rows into groups and computes all registered aggregations.
   * @param {Object[]} rows - Dataset to partition.
   * @returns {Object[]} Aggregated result set (one record per group).
   */
  group(rows) {
    if (!rows || rows.length === 0) {
      return [];
    }

    const groups = {};
    for (const row of rows) {
      const key = this._calculateKey(row);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    }

    const results = [];
    for (const key in groups) {
      const group = groups[key];
      const resultRow = {};

      const firstRow = group[0];
      for (const field of this.fields) {
        resultRow[field] = this._getFieldValue(firstRow, field);
      }

      for (const agg of this.aggregations) {
        resultRow[agg.alias] = agg.calculate(group);
      }

      if (!this.condition || this.condition.evaluate(resultRow)) {
        results.push(resultRow);
      }
    }

    return results;
  }
}

// Export internal helper functions as well
export const AdvancedQueryParser = {
  _isNullOrUndefined,
  _safeParseFloat,
  _compareValues
};
