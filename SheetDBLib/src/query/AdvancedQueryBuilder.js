/**
 * @file SheetDBLib/src/query/AdvancedQueryBuilder.js
 * @description Advanced SQL-like query builder with JOIN support, aggregations, and query optimization.
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { QueryCondition, QueryAggregation, QueryGroup } from '../internal/query-builders/AdvancedQueryParser.js';
import { AdvancedQueryValidator } from '../internal/query-builders/AdvancedQueryValidator.js';
import { AdvancedQueryCompiler, QueryCache } from '../internal/query-builders/AdvancedQueryCompiler.js';
import { AdvancedQueryPagination } from '../internal/query-builders/AdvancedQueryPagination.js';

export { QueryCondition, QueryAggregation, QueryGroup, QueryCache };

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

    // Initialize managers
    this._validator = new AdvancedQueryValidator();
    this._compiler = new AdvancedQueryCompiler(this);
    this._pagination = new AdvancedQueryPagination(this);
    this._cache = dbService._cache ? new QueryCache(dbService._cache) : null;

    // Delegate execution methods
    this._delegate([
      {
        manager: this._compiler,
        methods: [
          '_extractFieldValue', '_performJoin', '_tryIndexOptimization',
          '_getRemainingConditions', '_getFieldValue', '_applyConditionsFiltered',
          '_applyConditions', '_applyGroupBy'
        ]
      },
      {
        manager: this._pagination,
        methods: [
          '_partialSort', '_createComparator', '_quickSelect',
          '_medianOfThree', '_partition'
        ]
      }
    ]);
  }

  _delegate(delegations) {
    delegations.forEach(({ manager, methods }) => {
      methods.forEach(method => {
        if (typeof manager[method] === 'function') {
          this[method] = manager[method].bind(manager);
        }
      });
    });
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

  or(field, operator, value) { return this.orWhere(field, operator, value); }
  andWhere(field, operator, value) { return this.where(field, operator, value); }
  and(field, operator, value) { return this.where(field, operator, value); }

  whereLike(field, pattern) {
    return this.where(field, 'LIKE', `%${pattern}%`);
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

  orderByDesc(fields) { return this.orderBy(fields, 'DESC'); }

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

  execute() {
    if (!this.tableName) throw new Error('A table must be specified with from().');
    this._optimizedField = null;

    if (this.useCache && this._cache) {
      const cachedResults = this._cache.get(this);
      if (cachedResults !== null) return cachedResults;
    }

    const table = this.dbService.tables[this.tableName];
    let resultRows;

    const indexOptimization = this._tryIndexOptimization(table);
    if (indexOptimization) {
      resultRows = indexOptimization;
    } else {
      resultRows = table.getRows();
    }

    const prefixFn = (row, prefix) => {
      const newRow = {};
      for (const key in row) newRow[`${prefix}.${key}`] = row[key];
      return newRow;
    };

    resultRows = resultRows.map(row => prefixFn(row, this.tableName));

    if (this.joins.length > 0) {
      for (const joinConfig of this.joins) {
        resultRows = this._performJoin(resultRows, joinConfig);
      }
    }

    if (this.conditions.length > 0) {
      const remainingConditions = indexOptimization ? this._getRemainingConditions() : this.conditions;
      if (remainingConditions.length > 0) {
        resultRows = this._applyConditionsFiltered(resultRows, remainingConditions);
      }
    }

    if (this.groupByFields.length > 0) {
      resultRows = this._applyGroupBy(resultRows);
    }

    if (this.orderByFields.length > 0) {
      const shouldUsePartialSort = this._limit !== null && this._limit < 100 && resultRows.length > 1000;
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

    const hasGroupByWithAggregations = this.groupByFields.length > 0 && this.aggregations.length > 0;

    if (!hasGroupByWithAggregations && this.selectedColumns.length > 0 && !this.selectedColumns.includes('*')) {
      resultRows = resultRows.map(row => {
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
    } else if (!hasGroupByWithAggregations && this.joins.length === 0 && this.groupByFields.length === 0) {
      resultRows = resultRows.map(row => {
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
