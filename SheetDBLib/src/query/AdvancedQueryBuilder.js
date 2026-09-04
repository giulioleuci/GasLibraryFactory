/**
 * @file SheetDBLib/src/query/AdvancedQueryBuilder.js
 * @description Advanced SQL-like query builder with JOIN support, aggregations, and query optimization.
 */

import { HashUtils } from '@CoreUtilsLib';
import {
  QueryAggregation,
  AdvancedQueryParser
} from '../internal/query-builders/AdvancedQueryParser.js';
import { AdvancedQueryValidator } from '../internal/query-builders/AdvancedQueryValidator.js';

const { _isNullOrUndefined, _compareValues } = AdvancedQueryParser;

export { QueryAggregation };

/**
 * Creates a normalized, immutable fuzzy condition after its inputs have been validated.
 * Inlined here because AdvancedQueryBuilder.whereFuzzy()/orWhereFuzzy() are its only callers.
 *
 * @param {string} field Target field.
 * @param {string} query Search text.
 * @param {Object} [options={}] Supported Fuse options.
 * @param {'AND'|'OR'} type Boolean connector.
 * @returns {Readonly<Object>} Immutable fuzzy condition.
 */
function _createFuzzyCondition(field, query, options = {}, type) {
  return Object.freeze({
    kind: 'FUZZY',
    field,
    query,
    options: Object.freeze({ threshold: 0.4, ...options }),
    type
  });
}

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
    if (!this.service) {
      return null;
    }
    const key = this._generateKey(query);
    const cached = this.service.get(key);
    if (cached === null || cached === undefined) {
      return null;
    }
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
    if (!this.service) {
      return false;
    }
    const key = this._generateKey(query);
    return this.service.put(key, JSON.stringify(result), this.expiration);
  }

  /**
   * @description Invalidates all cached entries (full flush).
   * @returns {boolean} True if flush was successful.
   */
  invalidateTable() {
    if (!this.service) {
      return false;
    }
    this.service.removeAll();
    return true;
  }
}

export class AdvancedQueryBuilder {
  constructor(dbService, columns = ['*']) {
    this.dbService = dbService;
    this.selectedColumns = Array.isArray(columns) ? [...columns] : [columns];
    this.tableName = null;
    this.conditions = [];
    this.groupByFields = [];
    this.orderByFields = [];
    this._limit = null;
    this._offset = 0;
    this.useCache = true;
    this.aggregations = [];
    this._optimizedField = null;
    this.joins = [];

    this._validator = new AdvancedQueryValidator();
    this._cache = dbService._cache ? new QueryCache(dbService._cache) : null;
  }

  select(columns) {
    if (Array.isArray(columns)) {
      this.selectedColumns = [...columns];
    } else if (typeof columns === 'string') {
      this.selectedColumns = [columns];
    } else if (columns === '*' || columns === undefined) {
      this.selectedColumns = ['*'];
    }
    return this;
  }

  from(tableName) {
    this._validator.validateTable(this.dbService, tableName);
    this.tableName = tableName;
    return this;
  }

  join(table, localField, operator, foreignField) {
    if (arguments.length === 3) {
      foreignField = operator;
      operator = '=';
    }
    this._validator.validateJoin(this.dbService, table);
    this.joins.push({
      type: 'INNER',
      table: table,
      localField: localField,
      operator: operator || '=',
      foreignField: foreignField
    });
    return this;
  }

  leftJoin(table, localField, operator, foreignField) {
    if (arguments.length === 3) {
      foreignField = operator;
      operator = '=';
    }
    this._validator.validateJoin(this.dbService, table, 'LEFT JOIN');
    this.joins.push({
      type: 'LEFT',
      table: table,
      localField: localField,
      operator: operator || '=',
      foreignField: foreignField
    });
    return this;
  }

  rightJoin(table, localField, operator, foreignField) {
    if (arguments.length === 3) {
      foreignField = operator;
      operator = '=';
    }
    this._validator.validateJoin(this.dbService, table, 'RIGHT JOIN');
    this.joins.push({
      type: 'RIGHT',
      table: table,
      localField: localField,
      operator: operator || '=',
      foreignField: foreignField
    });
    return this;
  }

  fullOuterJoin(table, localField, operator, foreignField) {
    if (arguments.length === 3) {
      foreignField = operator;
      operator = '=';
    }
    this._validator.validateJoin(this.dbService, table, 'FULL OUTER JOIN');
    this.joins.push({
      type: 'FULL',
      table: table,
      localField: localField,
      operator: operator || '=',
      foreignField: foreignField
    });
    return this;
  }

  where(field, operator, value) {
    if (typeof field === 'object' && operator === undefined && value === undefined) {
      for (const key in field) {
        this.conditions.push({ field: key, operator: '=', value: field[key], type: 'AND' });
      }
      return this;
    }
    this.conditions.push({ field, operator, value, type: 'AND' });
    return this;
  }

  orWhere(field, operator, value) {
    this.conditions.push({ field, operator, value, type: 'OR' });
    return this;
  }

  or(field, operator, value) {
    return this.orWhere(field, operator, value);
  }
  andWhere(field, operator, value) {
    return this.where(field, operator, value);
  }
  and(field, operator, value) {
    return this.where(field, operator, value);
  }

  whereLike(field, pattern) {
    return this.where(field, 'LIKE', `%${pattern}%`);
  }

  whereFuzzy(field, query, options = {}) {
    this._validator.validateFuzzyCondition(field, query, options);
    this.conditions.push(_createFuzzyCondition(field, query, options, 'AND'));
    return this;
  }

  orWhereFuzzy(field, query, options = {}) {
    this._validator.validateFuzzyCondition(field, query, options);
    this.conditions.push(_createFuzzyCondition(field, query, options, 'OR'));
    return this;
  }

  whereIn(field, values) {
    this._validator.validateWhereIn(field, values);
    return this.where(field, 'IN', values);
  }

  groupBy(fields) {
    const fieldsArray = Array.isArray(fields) ? fields : [fields];
    this.groupByFields = fieldsArray;
    for (const field of fieldsArray) {
      if (!this.selectedColumns.includes(field) && !this.selectedColumns.includes('*')) {
        this.selectedColumns.push(field);
      }
    }
    return this;
  }

  sum(field, alias = null) {
    this.aggregations.push(new QueryAggregation('SUM', field, alias));
    return this;
  }

  avg(field, alias = null) {
    this.aggregations.push(new QueryAggregation('AVG', field, alias));
    return this;
  }

  count(field, alias = null) {
    this.aggregations.push(new QueryAggregation('COUNT', field, alias));
    return this;
  }

  min(field, alias = null) {
    this.aggregations.push(new QueryAggregation('MIN', field, alias));
    return this;
  }

  max(field, alias = null) {
    this.aggregations.push(new QueryAggregation('MAX', field, alias));
    return this;
  }

  orderBy(fields, direction = 'ASC') {
    const fieldsArray = Array.isArray(fields) ? fields : [fields];
    this._validator.validateOrderDirection(direction);
    const dir = direction.toUpperCase();
    for (const field of fieldsArray) {
      this.orderByFields.push({ field, direction: dir });
    }
    return this;
  }

  orderByDesc(fields) {
    return this.orderBy(fields, 'DESC');
  }

  limit(limitValue) {
    this._limit = parseInt(limitValue, 10);
    return this;
  }

  offset(offsetValue) {
    this._offset = parseInt(offsetValue, 10);
    return this;
  }

  paginate(page, pageSize) {
    const pageNum = parseInt(page, 10) || 1;
    const size = parseInt(pageSize, 10) || 10;
    this._limit = size;
    this._offset = (pageNum - 1) * size;
    return this;
  }

  // --- Execution-engine methods (folded from the former AdvancedQueryCompiler) ---

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
    const rightTable = this.dbService.tables[tableName];
    if (!rightTable) {
      throw new Error(`Join table ${tableName} not found.`);
    }
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
        const foreignValue =
          rightRow[foreignField.includes('.') ? foreignField.split('.').pop() : foreignField];
        if (!rightHashMap.has(foreignValue)) {
          rightHashMap.set(foreignValue, []);
        }
        rightHashMap.get(foreignValue).push({ row: rightRow, index: i });
      }
    }

    for (const leftRow of leftRows) {
      const localValue = this._extractFieldValue(leftRow, localField);
      let hasMatch = false;

      if (useHashJoin) {
        const matchingRightRows = rightHashMap.get(localValue) || [];
        for (const { row: rightRow, index: rightIndex } of matchingRightRows) {
          if (
            _compareValues(
              localValue,
              operator,
              rightRow[foreignField.includes('.') ? foreignField.split('.').pop() : foreignField]
            )
          ) {
            hasMatch = true;
            const mergedRow = { ...leftRow, ...prefixRow(rightRow, tableName) };
            result.push(mergedRow);
            matchedRightIndices.add(rightIndex);
          }
        }
      } else {
        for (let i = 0; i < rightRows.length; i++) {
          const rightRow = rightRows[i];
          const foreignValue =
            rightRow[foreignField.includes('.') ? foreignField.split('.').pop() : foreignField];
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
  _tryIndexOptimization(table, conditions = this.conditions) {
    if (conditions.length === 0) {
      return null;
    }
    const allAndEquality = conditions.every(
      (cond) => cond.type === 'AND' && (cond.operator === '=' || cond.operator === '==')
    );

    if (!allAndEquality) {
      if (conditions.length !== 1) {
        return null;
      }
      const condition = conditions[0];
      if (
        (condition.operator === '=' || condition.operator === '==') &&
        condition.field === table._keyField
      ) {
        const row = table.getRowById(condition.value);
        this._optimizedField = condition.field;
        return row ? [row] : [];
      }
      if (
        table._indices[condition.field] &&
        (condition.operator === '=' || condition.operator === '==')
      ) {
        const index = table._indices[condition.field];
        const rowIndices = index.get(condition.value) || [];
        this._optimizedField = condition.field;
        table._ensureDataLoaded();
        return rowIndices.map((idx) => ({ ...table._rowsCache[idx] }));
      }
      return null;
    }

    let bestCondition = null;
    let bestIndex = null;
    let smallestCardinality = Infinity;

    for (const condition of conditions) {
      if (condition.field === table._keyField) {
        const row = table.getRowById(condition.value);
        this._optimizedField = condition.field;
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
      this._optimizedField = bestCondition.field;
      const candidateRows = bestIndex.map((idx) => ({ ...table._rowsCache[idx] }));
      const remainingConditions = conditions.filter((c) => c.field !== bestCondition.field);
      if (remainingConditions.length === 0) {
        return candidateRows;
      }
      return this._applyConditionsFiltered(candidateRows, remainingConditions);
    }
    return null;
  }

  /**
   * @description Returns the subset of query conditions that were not satisfied by index optimization.
   * @returns {Object[]} Collection of pending conditions for full-scan filtering.
   * @private
   */
  _getRemainingConditions(conditions = this.conditions) {
    if (!this._optimizedField) {
      return conditions;
    }
    return conditions.filter((cond) => cond.field !== this._optimizedField);
  }

  /**
   * @description Low-level field resolution supporting direct keys, table-prefixed keys, and cross-join suffixes.
   * @param {Object} row - Target record.
   * @param {string} field - Field identifier.
   * @returns {*} Resolved value or undefined.
   * @private
   */
  _getFieldValue(row, field) {
    if (Object.prototype.hasOwnProperty.call(row, field)) {
      return row[field];
    }
    const prefixedField = `${this.tableName}.${field}`;
    if (Object.prototype.hasOwnProperty.call(row, prefixedField)) {
      return row[prefixedField];
    }
    for (const key in row) {
      if (key.endsWith(`.${field}`)) {
        return row[key];
      }
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
    const fuzzyMatches = this._compileFuzzyMatches(rows, conditions);
    return rows.filter((row) => {
      let finalResult = true;
      for (let conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
        const cond = conditions[conditionIndex];
        const rowValue = this._getFieldValue(row, cond.field);
        const conditionResult =
          cond.kind === 'FUZZY'
            ? fuzzyMatches.get(conditionIndex).has(row)
            : _compareValues(rowValue, cond.operator, cond.value);
        if (cond.type === 'AND') {
          finalResult = finalResult && conditionResult;
        } else {
          finalResult = finalResult || conditionResult;
        }
      }
      return finalResult;
    });
  }

  /**
   * Builds one Fuse index per fuzzy condition for the current materialized row set.
   * Results are consumed as membership sets, so filtering retains the source-row
   * ordering already established by the query pipeline (including equal scores).
   *
   * @param {Object[]} rows Materialized candidate rows.
   * @param {Object[]} conditions Conditions to inspect.
   * @returns {Map<number, Set<Object>>} Matches indexed by condition position.
   * @private
   */
  _compileFuzzyMatches(rows, conditions) {
    const matchesByCondition = new Map();
    if (!conditions.some((condition) => condition.kind === 'FUZZY')) {
      return matchesByCondition;
    }

    const hasOrCondition = conditions.some((condition) => condition.type === 'OR');
    const ordinaryConditions = conditions.filter((condition) => condition.kind !== 'FUZZY');
    const candidateRows = hasOrCondition
      ? rows
      : rows.filter((row) =>
          ordinaryConditions.every((condition) =>
            _compareValues(
              this._getFieldValue(row, condition.field),
              condition.operator,
              condition.value
            )
          )
        );
    const table = this.dbService.tables[this.tableName];

    for (let index = 0; index < conditions.length; index++) {
      const condition = conditions[index];
      if (condition.kind !== 'FUZZY') {
        continue;
      }

      const candidates = candidateRows.map((row) => ({
        row,
        value: this._getFieldValue(row, condition.field)
      }));
      const results = table.fuzzySearchRows(
        candidates,
        condition.query,
        ['value'],
        condition.options.threshold
      );
      matchesByCondition.set(index, new Set(results.map((result) => result.item.row)));
    }
    return matchesByCondition;
  }

  /**
   * @description Applies all query conditions to the provided dataset.
   * @param {Object[]} rows - Raw or partially filtered records.
   * @returns {Object[]} Fully filtered result set.
   * @private
   */
  _applyConditions(rows) {
    return this._applyConditionsFiltered(rows, this.conditions);
  }

  /**
   * @description Partitions the result set into groups and computes configured aggregations.
   * @param {Object[]} rows - Filtered records to be grouped.
   * @returns {Object[]} Aggregated result set (one record per group).
   * @private
   */
  _applyGroupBy(rows) {
    if (!rows || rows.length === 0) {
      return [];
    }
    const groups = {};
    for (const row of rows) {
      const key = this.groupByFields
        .map((f) => {
          const val = this._getFieldValue(row, f);
          return _isNullOrUndefined(val) ? 'NULL' : val.toString();
        })
        .join('|');
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
      for (const field of this.groupByFields) {
        resultRow[field] = this._getFieldValue(firstRow, field);
      }
      for (const agg of this.aggregations) {
        resultRow[agg.alias] = agg.calculate(group);
      }
      results.push(resultRow);
    }
    return results;
  }

  // --- Sort / pagination methods (folded from the former AdvancedQueryPagination) ---

  _partialSort(rows, k) {
    if (k >= rows.length) {
      rows.sort(this._createComparator());
      return rows;
    }
    const comparator = this._createComparator();
    const working = rows.slice(0);
    this._quickSelect(working, 0, working.length - 1, k, comparator);
    const topK = working.slice(0, k);
    topK.sort(comparator);
    return topK;
  }

  _createComparator() {
    return (a, b) => {
      for (const sorting of this.orderByFields) {
        const valueA = this._getFieldValue(a, sorting.field);
        const valueB = this._getFieldValue(b, sorting.field);
        if (valueA === valueB) {
          continue;
        }
        if (valueA === null || valueA === undefined) {
          return sorting.direction === 'ASC' ? -1 : 1;
        }
        if (valueB === null || valueB === undefined) {
          return sorting.direction === 'ASC' ? 1 : -1;
        }
        const comparison = valueA < valueB ? -1 : 1;
        return sorting.direction === 'ASC' ? comparison : -comparison;
      }
      return 0;
    };
  }

  _quickSelect(arr, left, right, k, comparator) {
    if (left >= right) {
      return;
    }
    const pivotIndex = this._medianOfThree(arr, left, right, comparator);
    const newPivotIndex = this._partition(arr, left, right, pivotIndex, comparator);
    if (k - 1 === newPivotIndex) {
      return;
    } else if (k - 1 < newPivotIndex) {
      this._quickSelect(arr, left, newPivotIndex - 1, k, comparator);
    } else {
      this._quickSelect(arr, newPivotIndex + 1, right, k, comparator);
    }
  }

  _medianOfThree(arr, left, right, comparator) {
    const mid = Math.floor((left + right) / 2);
    if (comparator(arr[left], arr[mid]) > 0) {
      [arr[left], arr[mid]] = [arr[mid], arr[left]];
    }
    if (comparator(arr[left], arr[right]) > 0) {
      [arr[left], arr[right]] = [arr[right], arr[left]];
    }
    if (comparator(arr[mid], arr[right]) > 0) {
      [arr[mid], arr[right]] = [arr[right], arr[mid]];
    }
    return mid;
  }

  _partition(arr, left, right, pivotIndex, comparator) {
    const pivotValue = arr[pivotIndex];
    [arr[pivotIndex], arr[right]] = [arr[right], arr[pivotIndex]];
    let storeIndex = left;
    for (let i = left; i < right; i++) {
      if (comparator(arr[i], pivotValue) < 0) {
        [arr[i], arr[storeIndex]] = [arr[storeIndex], arr[i]];
        storeIndex++;
      }
    }
    [arr[storeIndex], arr[right]] = [arr[right], arr[storeIndex]];
    return storeIndex;
  }

  execute() {
    if (!this.tableName) {
      throw new Error('A table must be specified with from().');
    }
    this._optimizedField = null;

    if (this.useCache && this._cache) {
      const cachedResults = this._cache.get(this);
      if (cachedResults !== null) {
        return cachedResults;
      }
    }

    const table = this.dbService.tables[this.tableName];
    let resultRows;

    const fuzzyConditions = this.conditions.filter((condition) => condition.kind === 'FUZZY');
    const ordinaryConditions = this.conditions.filter((condition) => condition.kind !== 'FUZZY');
    const hasOrCondition = this.conditions.some((condition) => condition.type === 'OR');
    const indexOptimization = hasOrCondition
      ? null
      : this._tryIndexOptimization(table, ordinaryConditions);
    if (indexOptimization) {
      resultRows = indexOptimization;
    } else {
      resultRows = table.getRows();
    }

    const prefixFn = (row, prefix) => {
      const newRow = {};
      for (const key in row) {
        newRow[`${prefix}.${key}`] = row[key];
      }
      return newRow;
    };

    resultRows = resultRows.map((row) => prefixFn(row, this.tableName));

    if (this.joins.length > 0) {
      for (const joinConfig of this.joins) {
        resultRows = this._performJoin(resultRows, joinConfig);
      }
    }

    if (this.conditions.length > 0) {
      if (hasOrCondition) {
        resultRows = this._applyConditionsFiltered(resultRows, this.conditions);
      } else {
        const remainingConditions = indexOptimization
          ? this._getRemainingConditions(ordinaryConditions)
          : ordinaryConditions;
        if (remainingConditions.length > 0) {
          resultRows = this._applyConditionsFiltered(resultRows, remainingConditions);
        }
        if (fuzzyConditions.length > 0) {
          resultRows = this._applyConditionsFiltered(resultRows, fuzzyConditions);
        }
      }
    }

    if (this.groupByFields.length > 0) {
      resultRows = this._applyGroupBy(resultRows);
    }

    if (this.orderByFields.length > 0) {
      const shouldUsePartialSort =
        this._limit !== null && this._limit < 100 && resultRows.length > 1000;
      if (shouldUsePartialSort) {
        resultRows = this._partialSort(resultRows, this._limit + this._offset);
      } else {
        resultRows.sort(this._createComparator());
      }
    }

    if (this._offset > 0 || this._limit !== null) {
      const start = this._offset || 0;
      const end = this._limit !== null ? start + this._limit : undefined;
      resultRows = resultRows.slice(start, end);
    }

    const hasGroupByWithAggregations =
      this.groupByFields.length > 0 && this.aggregations.length > 0;

    if (
      !hasGroupByWithAggregations &&
      this.selectedColumns.length > 0 &&
      !this.selectedColumns.includes('*')
    ) {
      resultRows = resultRows.map((row) => {
        const selected = {};
        for (const col of this.selectedColumns) {
          if (typeof col === 'string' && col.toLowerCase().includes(' as ')) {
            const parts = col.split(/ as /i);
            const field = parts[0].trim();
            const alias = parts[1].trim();
            selected[alias] = this._getFieldValue(row, field);
          } else {
            selected[col] = this._getFieldValue(row, col);
          }
        }
        return selected;
      });
    } else if (
      !hasGroupByWithAggregations &&
      this.joins.length === 0 &&
      this.groupByFields.length === 0
    ) {
      resultRows = resultRows.map((row) => {
        const unprefixed = {};
        for (const key in row) {
          const unprefixedKey = key.includes('.') ? key.split('.').pop() : key;
          unprefixed[unprefixedKey] = row[key];
        }
        return unprefixed;
      });
    }

    if (this.useCache && this._cache) {
      this._cache.store(this, resultRows);
    }

    return resultRows;
  }

  get() {
    return this.execute();
  }

  first() {
    const results = this.limit(1).execute();
    return results.length > 0 ? results[0] : null;
  }

  exists() {
    return this.limit(1).execute().length > 0;
  }
}
