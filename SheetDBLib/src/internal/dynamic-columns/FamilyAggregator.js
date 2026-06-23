/**
 * @file SheetDBLib/src/dynamic/FamilyAggregator.js
 * @description FamilyAggregator provides aggregation operations on column families.
 * @version 1.0.0
 */

import { ColumnFamily } from './ColumnFamily.js';
import { ColumnType, coerceToType } from './ColumnType.js';

/**
 * AggregationType - Supported aggregation operations.
 *
 * @enum {string}
 * @readonly
 */
export const AggregationType = Object.freeze({
  /** Sum of all values */
  SUM: 'SUM',
  /** Average of all values */
  AVG: 'AVG',
  /** Minimum value */
  MIN: 'MIN',
  /** Maximum value */
  MAX: 'MAX',
  /** Count of non-null values */
  COUNT: 'COUNT',
  /** Count of distinct values */
  COUNT_DISTINCT: 'COUNT_DISTINCT',
  /** First non-null value */
  FIRST: 'FIRST',
  /** Last non-null value */
  LAST: 'LAST',
  /** Concatenate string values */
  CONCAT: 'CONCAT',
  /** Collect values into array */
  COLLECT: 'COLLECT'
});

/**
 * AggregationResult - Result of a family aggregation.
 *
 * @typedef {Object} AggregationResult
 * @property {string} familyId - The family ID
 * @property {string} aggregationType - The aggregation type
 * @property {*} value - The aggregated value
 * @property {number} inputCount - Number of input values
 * @property {number} nullCount - Number of null values
 */

/**
 * @class FamilyAggregator
 * @description Logic for cross-column and cross-row aggregations on ColumnFamily structures.
 * Supports SUM, AVG, MIN, MAX, COUNT, COUNT_DISTINCT, FIRST, LAST, CONCAT, and COLLECT operations.
 *
 * @example
 * const agg = new FamilyAggregator({ families: [metricsFamily] });
 * const total = agg.aggregateRow(row, 'metrics', AggregationType.SUM);
 */
export class FamilyAggregator {
  /**
   * @param {Object} [options={}] - Aggregator configuration.
   * @param {ColumnFamily[]} [options.families=[]] - Array of column families to manage.
   * @param {Map<string, ColumnFamily>} [options.familyMap] - Pre-indexed map of family IDs.
   * @param {boolean} [options.ignoreNulls=true] - If true, null/undefined values are omitted from calculations.
   * @param {Object} [options.logger=console] - Logger instance for error/debug reporting.
   */
  constructor(options = {}) {
    const { families = [], familyMap = null, ignoreNulls = true, logger = console } = options;

    /**
     * Map of family IDs to families.
     * @type {Map<string, ColumnFamily>}
     * @private
     */
    this._familyMap = familyMap || new Map(families.map((f) => [f.id, f]));

    /**
     * Whether to ignore null values.
     * @type {boolean}
     * @private
     */
    this._ignoreNulls = ignoreNulls;

    /**
     * Logger instance.
     * @type {Object}
     * @private
     */
    this._logger = logger;
  }

  /**
   * @description Registers a ColumnFamily for aggregation operations.
   * @param {ColumnFamily} family - ColumnFamily instance to register.
   * @returns {FamilyAggregator} Current instance for method chaining.
   * @throws {Error} If the provided family is not an instance of ColumnFamily.
   */
  registerFamily(family) {
    if (!(family instanceof ColumnFamily)) {
      throw new Error('Family must be a ColumnFamily instance');
    }
    this._familyMap.set(family.id, family);
    return this;
  }

  /**
   * @description Aggregates family values within a single row.
   * @param {Object} row - Key-value row data matching column names.
   * @param {string} familyId - ID of the ColumnFamily to aggregate.
   * @param {string} aggregationType - Type of aggregation (see AggregationType).
   * @param {Object} [options={}] - Aggregation options.
   * @param {string[]} [options.memberKeys] - Optional subset of family members to aggregate.
   * @param {string} [options.separator=', '] - Separator string for CONCAT operations.
   * @returns {AggregationResult} Structural aggregation result.
   * @throws {Error} If familyId is not registered or aggregationType is invalid.
   */
  aggregateRow(row, familyId, aggregationType, options = {}) {
    const family = this._getFamily(familyId);
    const memberKeys = options.memberKeys || family.members;

    // Collect values
    const values = [];
    let nullCount = 0;

    for (const memberKey of memberKeys) {
      const columnName = family.generateColumnName(memberKey);
      let value = row[columnName];

      if (value === null || value === undefined) {
        nullCount++;
        if (!this._ignoreNulls) {
          values.push(null);
        }
      } else {
        // Coerce to family type for numeric operations
        if (this._isNumericAggregation(aggregationType)) {
          value = coerceToType(value, ColumnType.NUMBER);
        }
        values.push(value);
      }
    }

    const aggregatedValue = this._performAggregation(values, aggregationType, options);

    return {
      familyId,
      aggregationType,
      value: aggregatedValue,
      inputCount: memberKeys.length,
      nullCount
    };
  }

  /**
   * @description Computes per-member aggregations across multiple rows.
   * @param {Object[]} rows - Collection of row data objects.
   * @param {string} familyId - ID of the ColumnFamily to aggregate.
   * @param {string} aggregationType - Type of aggregation (see AggregationType).
   * @param {Object} [options={}] - Aggregation options.
   * @param {string[]} [options.memberKeys] - Optional subset of family members to aggregate.
   * @returns {Object<string, *>} Map of member keys to aggregated values.
   * @throws {Error} If familyId is not registered or aggregationType is invalid.
   */
  aggregateRows(rows, familyId, aggregationType, options = {}) {
    const family = this._getFamily(familyId);
    const memberKeys = options.memberKeys || family.members;
    const result = {};

    for (const memberKey of memberKeys) {
      const columnName = family.generateColumnName(memberKey);
      const values = [];

      for (const row of rows) {
        let value = row[columnName];

        if (value === null || value === undefined) {
          if (!this._ignoreNulls) {
            values.push(null);
          }
        } else {
          if (this._isNumericAggregation(aggregationType)) {
            value = coerceToType(value, ColumnType.NUMBER);
          }
          values.push(value);
        }
      }

      result[memberKey] = this._performAggregation(values, aggregationType, options);
    }

    return result;
  }

  /**
   * @description Aggregates all family values across multiple rows into a single scalar result.
   * @param {Object[]} rows - Collection of row data objects.
   * @param {string} familyId - ID of the ColumnFamily to aggregate.
   * @param {string} aggregationType - Type of aggregation (see AggregationType).
   * @param {Object} [options={}] - Aggregation options.
   * @returns {AggregationResult} Structural aggregation result.
   * @throws {Error} If familyId is not registered or aggregationType is invalid.
   */
  aggregateAll(rows, familyId, aggregationType, options = {}) {
    const family = this._getFamily(familyId);
    const memberKeys = options.memberKeys || family.members;
    const allValues = [];
    let nullCount = 0;

    for (const row of rows) {
      for (const memberKey of memberKeys) {
        const columnName = family.generateColumnName(memberKey);
        let value = row[columnName];

        if (value === null || value === undefined) {
          nullCount++;
          if (!this._ignoreNulls) {
            allValues.push(null);
          }
        } else {
          if (this._isNumericAggregation(aggregationType)) {
            value = coerceToType(value, ColumnType.NUMBER);
          }
          allValues.push(value);
        }
      }
    }

    return {
      familyId,
      aggregationType,
      value: this._performAggregation(allValues, aggregationType, options),
      inputCount: rows.length * memberKeys.length,
      nullCount
    };
  }

  /**
   * @description Executes multiple aggregation types on a single row simultaneously.
   * @param {Object} row - Key-value row data.
   * @param {string} familyId - ID of the ColumnFamily to aggregate.
   * @param {string[]} aggregationTypes - Collection of aggregation types to compute.
   * @returns {Object<string, AggregationResult>} Map of aggregation types to results.
   * @throws {Error} If familyId is invalid or any aggregationType is unsupported.
   */
  multiAggregate(row, familyId, aggregationTypes) {
    const result = {};
    for (const aggType of aggregationTypes) {
      result[aggType] = this.aggregateRow(row, familyId, aggType);
    }
    return result;
  }

  /**
   * @description Groups rows by one family member and computes aggregation on another within the same family.
   * @param {Object[]} rows - Collection of row data objects.
   * @param {string} familyId - ID of the ColumnFamily to process.
   * @param {string} groupByMember - Member key used for grouping.
   * @param {string} aggregateMember - Member key whose values are aggregated.
   * @param {string} aggregationType - Type of aggregation (see AggregationType).
   * @returns {Object<string, *>} Map of group keys (stringified) to aggregated values.
   * @throws {Error} If familyId is invalid or parameters are unsupported.
   */
  groupAggregate(rows, familyId, groupByMember, aggregateMember, aggregationType) {
    const family = this._getFamily(familyId);
    const groupByColumn = family.generateColumnName(groupByMember);
    const aggregateColumn = family.generateColumnName(aggregateMember);

    // Group rows
    const groups = new Map();
    for (const row of rows) {
      const groupKey = String(row[groupByColumn] ?? 'null');
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      let value = row[aggregateColumn];
      if (value !== null && value !== undefined) {
        if (this._isNumericAggregation(aggregationType)) {
          value = coerceToType(value, ColumnType.NUMBER);
        }
        groups.get(groupKey).push(value);
      } else if (!this._ignoreNulls) {
        groups.get(groupKey).push(null);
      }
    }

    // Aggregate each group
    const result = {};
    for (const [groupKey, values] of groups) {
      result[groupKey] = this._performAggregation(values, aggregationType);
    }

    return result;
  }

  /**
   * @description Internal dispatcher for aggregation logic execution.
   * @param {*[]} values - Array of raw values to aggregate.
   * @param {string} aggregationType - The aggregation operation to perform.
   * @param {Object} [options={}] - Operation-specific options (e.g., separator).
   * @returns {*} Aggregated scalar result or null if no valid input.
   * @throws {Error} If aggregationType is unsupported.
   * @private
   */
  _performAggregation(values, aggregationType, options = {}) {
    if (values.length === 0) {
      return null;
    }

    // Filter nulls for most operations
    const nonNullValues = values.filter((v) => v !== null && v !== undefined);
    if (nonNullValues.length === 0 && aggregationType !== AggregationType.COUNT) {
      return null;
    }

    switch (aggregationType) {
      case AggregationType.SUM:
        return nonNullValues.reduce((sum, v) => sum + v, 0);

      case AggregationType.AVG:
        if (nonNullValues.length === 0) {
          return null;
        }
        return nonNullValues.reduce((sum, v) => sum + v, 0) / nonNullValues.length;

      case AggregationType.MIN:
        return Math.min(...nonNullValues);

      case AggregationType.MAX:
        return Math.max(...nonNullValues);

      case AggregationType.COUNT:
        return nonNullValues.length;

      case AggregationType.COUNT_DISTINCT:
        return new Set(nonNullValues).size;

      case AggregationType.FIRST:
        return nonNullValues[0] ?? null;

      case AggregationType.LAST:
        return nonNullValues[nonNullValues.length - 1] ?? null;

      case AggregationType.CONCAT:
        const separator = options.separator ?? ', ';
        return nonNullValues.join(separator);

      case AggregationType.COLLECT:
        return [...nonNullValues];

      default:
        throw new Error(`Unknown aggregation type: ${aggregationType}`);
    }
  }

  /**
   * @description Determines if an aggregation operation requires numeric type coercion.
   * @param {string} aggregationType - The operation to check.
   * @returns {boolean} True if numeric coercion is mandatory.
   * @private
   */
  _isNumericAggregation(aggregationType) {
    return [
      AggregationType.SUM,
      AggregationType.AVG,
      AggregationType.MIN,
      AggregationType.MAX
    ].includes(aggregationType);
  }

  /**
   * @description Internal lookup for registered ColumnFamily instances.
   * @param {string} familyId - The ID of the family to retrieve.
   * @returns {ColumnFamily} The registered ColumnFamily instance.
   * @throws {Error} If the family ID is not registered in this aggregator.
   * @private
   */
  _getFamily(familyId) {
    const family = this._familyMap.get(familyId);
    if (!family) {
      throw new Error(`Column family not found: ${familyId}`);
    }
    return family;
  }

  /**
   * @description Static factory for creating a FamilyAggregator pre-configured with multiple families.
   * @param {ColumnFamily[]} families - Collection of ColumnFamily instances.
   * @param {Object} [options={}] - Additional aggregator configuration options.
   * @returns {FamilyAggregator} Initialized aggregator instance.
   * @static
   */
  static forFamilies(families, options = {}) {
    return new FamilyAggregator({ families, ...options });
  }
}
