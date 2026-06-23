/**
 * @file SheetDBLib/src/query/managers/AdvancedQueryCompiler.js
 * @description Execution engine for AdvancedQueryBuilder, including JOIN, GROUP BY, and optimizations.
 */

import { HashUtils } from '@CoreUtilsLib';
import { AdvancedQueryParser } from './AdvancedQueryParser.js';

const { _isNullOrUndefined, _safeParseFloat, _compareValues } = AdvancedQueryParser;

/**
 * @class QueryCache
 * @description Internal TTL-based cache manager for advanced query results.
 * Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.
 */
export class QueryCache {
  /**
   * @param {Object} service - Cache service implementation (e.g., Apps Script CacheService).
   */
  constructor(service) {
    this.service = service;
    this.prefix = 'query_';
    this.expiration = 300;
  }

  /**
   * @description Generates a deterministic hash key for a query configuration.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @returns {string} Hashed cache key.
   * @private
   */
  _generateKey(query) {
    const queryJSON = JSON.stringify({
      spreadsheetId: query.dbService ? query.dbService._spreadsheetId : null,
      selectedColumns: query.selectedColumns,
      tableName: query.tableName,
      conditions: query.conditions || null,
      groupBy: query.groupByFields && query.groupByFields.length > 0 ? query.groupByFields : null,
      orderBy: query.orderByFields && query.orderByFields.length > 0 ? query.orderByFields : null,
      limit: query._limit,
      offset: query._offset,
      joins: query.joins && query.joins.length > 0 ? query.joins : null,
      aggregations: query.aggregations && query.aggregations.length > 0 ? query.aggregations : null
    });
    return this.prefix + HashUtils.generateHash(queryJSON);
  }

  /**
   * @description Retrieves cached results for a specific query.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @returns {Object[]|null} Cached records or null on miss/error.
   */
  get(query) {
    if (!this.service) return null;
    const key = this._generateKey(query);
    const cached = this.service.get(key);
    if (cached === null || cached === undefined) return null;
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }

  /**
   * @description Persists query results to the cache with configured TTL.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @param {Object[]} result - Collection of records to cache.
   * @returns {boolean} True if successfully stored.
   */
  store(query, result) {
    if (!this.service) return false;
    const key = this._generateKey(query);
    return this.service.put(key, JSON.stringify(result), this.expiration);
  }

  /**
   * @description Invalidates all cached entries (full flush).
   * @returns {boolean} True if flush was successful.
   */
  invalidateTable() {
    if (!this.service) return false;
    this.service.removeAll();
    return true;
  }

  /**
   * @description Alias for invalidateTable().
   * @returns {boolean} True if flush was successful.
   */
  clear() {
    if (!this.service) return false;
    return this.service.removeAll();
  }
}

/**
 * @class AdvancedQueryCompiler
 * @description Core execution engine for AdvancedQueryBuilder.
 * Implements relational logic (JOINs), dataset partitioning (GROUP BY), and performance optimizations (Index probing).
 */
export class AdvancedQueryCompiler {
  /**
   * @param {Object} facade - The AdvancedQueryBuilder instance being compiled.
   */
  constructor(facade) {
    this.facade = facade;
  }

  /**
   * @description Resolves a field value from a row, supporting dotted-path prefixes (e.g., 'Table.Field').
   * @param {Object} row - Data record.
   * @param {string} fieldSpec - Target field identifier or path.
   * @returns {*} Value from the row or undefined.
   * @private
   */
  _extractFieldValue(row, fieldSpec) {
    if (Object.prototype.hasOwnProperty.call(row, fieldSpec)) {
      return row[fieldSpec];
    }
    if (fieldSpec.includes('.')) {
      const parts = fieldSpec.split('.');
      const fieldName = parts[parts.length - 1];
      if (Object.prototype.hasOwnProperty.call(row, fieldName)) {
        return row[fieldName];
      }
    }
    const suffix = fieldSpec.includes('.') ? fieldSpec.split('.').pop() : fieldSpec;
    for (const key in row) {
      if (key === suffix || key.endsWith(`.${suffix}`)) {
        return row[key];
      }
    }
    return undefined;
  }

  /**
   * @description Internal JOIN dispatcher. Supports LEFT, RIGHT, INNER, and FULL joins.
   * Uses hash-join optimization for equality operators.
   * @param {Object[]} leftRows - Pre-filtered records from the primary table.
   * @param {Object} joinConfig - Join specification (table, type, keys, operator).
   * @returns {Object[]} Merged result set with prefixed keys.
   * @throws {Error} If the target join table is not registered in the DatabaseService.
   * @private
   */
  _performJoin(leftRows, joinConfig) {
    const { type, table: tableName, localField, operator, foreignField } = joinConfig;
    const rightTable = this.facade.dbService.tables[tableName];
    if (!rightTable) throw new Error(`Join table ${tableName} not found.`);
    const rightRows = rightTable.getRows();

    const prefixRow = (row, tableName) => {
      const prefixed = {};
      for (const key in row) {
        prefixed[`${tableName}.${key}`] = row[key];
      }
      return prefixed;
    };

    const result = [];
    const matchedRightIndices = new Set();
    const useHashJoin = operator === '=' || operator === '==';
    let rightHashMap = null;

    if (useHashJoin) {
      rightHashMap = new Map();
      for (let i = 0; i < rightRows.length; i++) {
        const rightRow = rightRows[i];
        const foreignValue = rightRow[foreignField.includes('.') ? foreignField.split('.').pop() : foreignField];
        if (!rightHashMap.has(foreignValue)) rightHashMap.set(foreignValue, []);
        rightHashMap.get(foreignValue).push({ row: rightRow, index: i });
      }
    }

    for (const leftRow of leftRows) {
      const localValue = this._extractFieldValue(leftRow, localField);
      let hasMatch = false;

      if (useHashJoin) {
        const matchingRightRows = rightHashMap.get(localValue) || [];
        for (const { row: rightRow, index: rightIndex } of matchingRightRows) {
          if (_compareValues(localValue, operator, rightRow[foreignField.includes('.') ? foreignField.split('.').pop() : foreignField])) {
            hasMatch = true;
            const mergedRow = { ...leftRow, ...prefixRow(rightRow, tableName) };
            result.push(mergedRow);
            matchedRightIndices.add(rightIndex);
          }
        }
      } else {
        for (let i = 0; i < rightRows.length; i++) {
          const rightRow = rightRows[i];
          const foreignValue = rightRow[foreignField.includes('.') ? foreignField.split('.').pop() : foreignField];
          if (_compareValues(localValue, operator, foreignValue)) {
            hasMatch = true;
            const mergedRow = { ...leftRow, ...prefixRow(rightRow, tableName) };
            result.push(mergedRow);
            matchedRightIndices.add(i);
          }
        }
      }

      if (!hasMatch && (type === 'LEFT' || type === 'FULL')) {
        const mergedRow = { ...leftRow };
        if (rightRows.length > 0) {
          const firstRightRow = rightRows[0];
          for (const key in firstRightRow) {
            const prefixedKey = `${tableName}.${key}`;
            if (!Object.prototype.hasOwnProperty.call(mergedRow, prefixedKey)) {
              mergedRow[prefixedKey] = null;
            }
          }
        }
        result.push(mergedRow);
      }
    }

    if (type === 'RIGHT' || type === 'FULL') {
      for (let i = 0; i < rightRows.length; i++) {
        if (!matchedRightIndices.has(i)) {
          const rightRow = rightRows[i];
          const prefixedRight = prefixRow(rightRow, tableName);
          const mergedRow = { ...prefixedRight };
          if (leftRows.length > 0) {
            for (const key in leftRows[0]) {
              if (!Object.prototype.hasOwnProperty.call(mergedRow, key)) {
                mergedRow[key] = null;
              }
            }
          }
          result.push(mergedRow);
        }
      }
    }
    return result;
  }

  /**
   * @description Attempts to bypass full table scans by probing Primary Keys or secondary indices.
   * Selects the index with the lowest cardinality for optimized filtering.
   * @param {Object} table - TableService instance to probe.
   * @returns {Object[]|null} Filtered records from index or null if no optimization is viable.
   * @private
   */
  _tryIndexOptimization(table) {
    if (this.facade.conditions.length === 0) return null;
    const allAndEquality = this.facade.conditions.every(cond => cond.type === 'AND' && (cond.operator === '=' || cond.operator === '=='));

    if (!allAndEquality) {
      if (this.facade.conditions.length !== 1) return null;
      const condition = this.facade.conditions[0];
      if ((condition.operator === '=' || condition.operator === '==') && condition.field === table._keyField) {
        const row = table.getRowById(condition.value);
        this.facade._optimizedField = condition.field;
        return row ? [row] : [];
      }
      if (table._indices[condition.field] && (condition.operator === '=' || condition.operator === '==')) {
        const index = table._indices[condition.field];
        const rowIndices = index.get(condition.value) || [];
        this.facade._optimizedField = condition.field;
        table._ensureDataLoaded();
        return rowIndices.map(idx => ({ ...table._rowsCache[idx] }));
      }
      return null;
    }

    let bestCondition = null;
    let bestIndex = null;
    let smallestCardinality = Infinity;

    for (const condition of this.facade.conditions) {
      if (condition.field === table._keyField) {
        const row = table.getRowById(condition.value);
        this.facade._optimizedField = condition.field;
        return row ? [row] : [];
      }
      if (table._indices[condition.field]) {
        const index = table._indices[condition.field];
        const rowIndices = index.get(condition.value);
        const cardinality = rowIndices ? rowIndices.length : 0;
        if (cardinality < smallestCardinality) {
          smallestCardinality = cardinality;
          bestCondition = condition;
          bestIndex = rowIndices;
        }
      }
    }

    if (bestCondition && bestIndex) {
      table._ensureDataLoaded();
      this.facade._optimizedField = bestCondition.field;
      const candidateRows = bestIndex.map(idx => ({ ...table._rowsCache[idx] }));
      const remainingConditions = this.facade.conditions.filter(c => c.field !== bestCondition.field);
      if (remainingConditions.length === 0) return candidateRows;
      return this._applyConditionsFiltered(candidateRows, remainingConditions);
    }
    return null;
  }

  /**
   * @description Returns the subset of query conditions that were not satisfied by index optimization.
   * @returns {Object[]} Collection of pending conditions for full-scan filtering.
   * @private
   */
  _getRemainingConditions() {
    if (!this.facade._optimizedField) return this.facade.conditions;
    return this.facade.conditions.filter(cond => cond.field !== this.facade._optimizedField);
  }

  /**
   * @description Low-level field resolution supporting direct keys, table-prefixed keys, and cross-join suffixes.
   * @param {Object} row - Target record.
   * @param {string} field - Field identifier.
   * @returns {*} Resolved value or undefined.
   * @private
   */
  _getFieldValue(row, field) {
    if (Object.prototype.hasOwnProperty.call(row, field)) return row[field];
    const prefixedField = `${this.facade.tableName}.${field}`;
    if (Object.prototype.hasOwnProperty.call(row, prefixedField)) return row[prefixedField];
    for (const key in row) {
      if (key.endsWith(`.${field}`)) return row[key];
    }
    return undefined;
  }

  /**
   * @description Applies a collection of conditions to a result set using AND/OR logic.
   * @param {Object[]} rows - Collection of records to filter.
   * @param {Object[]} conditions - The conditions to evaluate.
   * @returns {Object[]} Filtered result set.
   * @private
   */
  _applyConditionsFiltered(rows, conditions) {
    return rows.filter(row => {
      let finalResult = true;
      for (const cond of conditions) {
        const rowValue = this._getFieldValue(row, cond.field);
        let conditionResult = _compareValues(rowValue, cond.operator, cond.value);
        if (cond.type === 'AND') finalResult = finalResult && conditionResult;
        else finalResult = finalResult || conditionResult;
      }
      return finalResult;
    });
  }

  /**
   * @description Applies all query conditions to the provided dataset.
   * @param {Object[]} rows - Raw or partially filtered records.
   * @returns {Object[]} Fully filtered result set.
   * @private
   */
  _applyConditions(rows) {
    return this._applyConditionsFiltered(rows, this.facade.conditions);
  }

  /**
   * @description Partitions the result set into groups and computes configured aggregations.
   * @param {Object[]} rows - Filtered records to be grouped.
   * @returns {Object[]} Aggregated result set (one record per group).
   * @private
   */
  _applyGroupBy(rows) {
    if (!rows || rows.length === 0) return [];
    const groups = {};
    for (const row of rows) {
      const key = this.facade.groupByFields.map(f => {
        const val = this._getFieldValue(row, f);
        return _isNullOrUndefined(val) ? 'NULL' : val.toString();
      }).join('|');
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    }
    const results = [];
    for (const key in groups) {
      const group = groups[key];
      const resultRow = {};
      const firstRow = group[0];
      for (const field of this.facade.groupByFields) resultRow[field] = this._getFieldValue(firstRow, field);
      for (const agg of this.facade.aggregations) resultRow[agg.alias] = agg.calculate(group);
      results.push(resultRow);
    }
    return results;
  }
}
