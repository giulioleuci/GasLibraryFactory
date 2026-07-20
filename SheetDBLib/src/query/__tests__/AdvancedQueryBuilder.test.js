// ===================================================================
// FILE: SheetDBLib/src/query/__tests__/AdvancedQueryBuilder.test.js
// ===================================================================
// Comprehensive test suite for AdvancedQueryBuilder
// Using centralized MockFactory
// ===================================================================

import { AdvancedQueryBuilder } from '../AdvancedQueryBuilder';
import { MockFactory } from '../../../../test/fakes';

describe('AdvancedQueryBuilder - Comprehensive Test Suite', () => {
  let mockDatabase;
  let mockLogger;
  let queryBuilder;

  beforeEach(() => {
    mockLogger = MockFactory.createJestLogger();

    // Mock database with standardized mocks
    const dbMock = MockFactory.createJestDatabase();
    const tableMock = dbMock.registerTable('Users');
    tableMock.setData([
      { ID: '1', name: 'Alice', age: 30, status: 'active' },
      { ID: '2', name: 'Bob', age: 25, status: 'active' },
      { ID: '3', name: 'Charlie', age: 35, status: 'inactive' },
      { ID: '4', name: 'David', age: 28, status: 'active' }
    ]);

    dbMock._logger = mockLogger;
    mockDatabase = dbMock;

    queryBuilder = new AdvancedQueryBuilder(mockDatabase);
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with database reference', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);

      expect(qb).toBeDefined();
    });

    it('should initialize with empty query state', () => {
      const qb = new AdvancedQueryBuilder(mockDatabase);

      expect(qb.tableName).toBeNull();
      expect(qb.selectedColumns).toEqual(['*']);
      expect(qb.conditions).toEqual([]);
    });
  });

  // ===================================================================
  // SELECT
  // ===================================================================

  describe('select()', () => {
    it('should set columns to select', () => {
      queryBuilder.select(['name', 'age']);

      expect(queryBuilder.selectedColumns).toEqual(['name', 'age']);
    });

    it('should handle select all (empty array)', () => {
      queryBuilder.select([]);

      expect(queryBuilder.selectedColumns).toEqual([]);
    });

    it('should support method chaining', () => {
      const result = queryBuilder.select(['name']);

      expect(result).toBe(queryBuilder);
    });

    it('should handle single column as string', () => {
      queryBuilder.select('name');

      expect(queryBuilder.selectedColumns).toContain('name');
    });
  });

  // ===================================================================
  // FROM
  // ===================================================================

  describe('from()', () => {
    it('should set table name', () => {
      queryBuilder.from('Users');

      expect(queryBuilder.tableName).toBe('Users');
    });

    it('should support method chaining', () => {
      const result = queryBuilder.from('Users');

      expect(result).toBe(queryBuilder);
    });

    it('should throw error for non-existent table', () => {
      expect(() => {
        queryBuilder.from('NonExistent').execute();
      }).toThrow();
    });
  });

  // ===================================================================
  // WHERE - BASIC FILTERING
  // ===================================================================

  describe('where()', () => {
    it('should filter with equals condition', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .where('name', '=', 'Alice')
        .execute();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice');
    });

    it('should filter with greater than condition', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .where('age', '>', 28)
        .execute();

      expect(results).toHaveLength(2); // Alice (30) and Charlie (35)
      expect(results.every((r) => r.age > 28)).toBe(true);
    });

    it('should filter with less than condition', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .where('age', '<', 30)
        .execute();

      expect(results).toHaveLength(2); // Bob (25) and David (28)
      expect(results.every((r) => r.age < 30)).toBe(true);
    });

    it('should filter with not equals condition', () => {
      const results = queryBuilder
        .select(['name', 'status'])
        .from('Users')
        .where('status', '!=', 'active')
        .execute();

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('inactive');
    });

    it('should support method chaining', () => {
      const result = queryBuilder.where('name', '=', 'Alice');

      expect(result).toBe(queryBuilder);
    });
  });

  // ===================================================================
  // AND WHERE - MULTIPLE CONDITIONS
  // ===================================================================

  describe('andWhere()', () => {
    it('should combine multiple conditions with AND', () => {
      const results = queryBuilder
        .select(['name', 'age', 'status'])
        .from('Users')
        .where('status', '=', 'active')
        .andWhere('age', '>', 26)
        .execute();

      expect(results).toHaveLength(2); // Alice and David
      expect(results.every((r) => r.status === 'active' && r.age > 26)).toBe(true);
    });

    it('should handle multiple andWhere calls', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .where('status', '=', 'active')
        .andWhere('age', '>', 25)
        .andWhere('age', '<', 35)
        .execute();

      expect(results).toHaveLength(2); // Bob and David
    });
  });

  // ===================================================================
  // OR WHERE
  // ===================================================================

  describe('orWhere()', () => {
    it('should combine conditions with OR', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .where('age', '<', 26)
        .orWhere('age', '>', 34)
        .execute();

      expect(results).toHaveLength(2); // Bob (25) and Charlie (35)
    });

    it('should support complex AND/OR combinations', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .where('status', '=', 'active')
        .andWhere('age', '>', 26)
        .orWhere('name', '=', 'Bob')
        .execute();

      expect(results.length).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // WHERE IN
  // ===================================================================

  describe('whereIn()', () => {
    it('should filter with IN condition', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .whereIn('name', ['Alice', 'Bob'])
        .execute();

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.name)).toEqual(['Alice', 'Bob']);
    });

    it('should handle empty array (return no results)', () => {
      const results = queryBuilder.select(['name']).from('Users').whereIn('name', []).execute();

      expect(results).toHaveLength(0);
    });

    it('should handle single value in array', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .whereIn('name', ['Alice'])
        .execute();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice');
    });
  });

  // ===================================================================
  // WHERE LIKE
  // ===================================================================

  describe('whereLike()', () => {
    it('should filter with LIKE condition (contains)', () => {
      const results = queryBuilder.select(['name']).from('Users').whereLike('name', 'li').execute();

      expect(results).toHaveLength(2); // Alice and Charlie
    });

    it('should be case-insensitive', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .whereLike('name', 'ALICE')
        .execute();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice');
    });

    it('should handle no matches', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .whereLike('name', 'xyz')
        .execute();

      expect(results).toHaveLength(0);
    });
  });

  // ===================================================================
  // WHERE FUZZY
  // ===================================================================

  describe('whereFuzzy()', () => {
    it('delegates fuzzy matching for materialized candidates to the table search engine once', () => {
      const table = mockDatabase.tables.Users;
      const fuzzySearchRows = jest.spyOn(table.searchEngine, 'fuzzySearchRows');

      const rows = queryBuilder
        .from('Users')
        .where('status', '=', 'active')
        .whereFuzzy('name', 'alce', { threshold: 0.4 })
        .get();

      expect(rows.map((row) => row.name)).toEqual(['Alice']);
      expect(fuzzySearchRows).toHaveBeenCalledTimes(1);
      expect(fuzzySearchRows).toHaveBeenCalledWith(
        [{ row: expect.any(Object), value: 'Alice' }, { row: expect.any(Object), value: 'Bob' }, { row: expect.any(Object), value: 'David' }],
        'alce',
        ['value'],
        0.4
      );
    });

    it('finds approximate field matches without changing LIKE behavior', () => {
      const fuzzyRows = queryBuilder
        .from('Users')
        .whereFuzzy('name', 'alce', { threshold: 0.4 })
        .get();
      const likeRows = new AdvancedQueryBuilder(mockDatabase)
        .from('Users')
        .whereLike('name', 'Ali')
        .get();

      expect(fuzzyRows.map((row) => row.name)).toEqual(['Alice']);
      expect(likeRows.map((row) => row.name)).toEqual(['Alice']);
    });

    it('adds an OR fuzzy predicate using the existing left-to-right OR grouping', () => {
      const rows = queryBuilder
        .from('Users')
        .where('status', '=', 'inactive')
        .orWhereFuzzy('name', 'alce', { threshold: 0.4 })
        .get();

      expect(rows.map((row) => row.name)).toEqual(['Alice', 'Charlie']);
    });

    it('preserves source-row order when Fuse gives fuzzy matches equal scores', () => {
      mockDatabase.tables.Users.setData([
        { ID: 'second', name: 'Alice' },
        { ID: 'first', name: 'Alice' }
      ]);

      const rows = queryBuilder.from('Users').whereFuzzy('name', 'Alice').get();

      expect(rows.map((row) => row.ID)).toEqual(['second', 'first']);
    });

    it.each([
      ['', 'alice', {}],
      ['name', '', {}],
      ['name', 17, {}],
      ['name', 'alice', { threshold: -0.01 }],
      ['name', 'alice', { threshold: 1.01 }],
      ['name', 'alice', { includeScore: true }]
    ])('rejects invalid fuzzy arguments', (field, query, options) => {
      expect(() => queryBuilder.whereFuzzy(field, query, options)).toThrow();
    });
  });

  // ===================================================================
  // ORDER BY
  // ===================================================================

  describe('orderBy()', () => {
    it('should sort results in ascending order', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .orderBy('age', 'ASC')
        .execute();

      expect(results[0].age).toBe(25); // Bob
      expect(results[1].age).toBe(28); // David
      expect(results[2].age).toBe(30); // Alice
      expect(results[3].age).toBe(35); // Charlie
    });

    it('should sort results in descending order', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .orderBy('age', 'DESC')
        .execute();

      expect(results[0].age).toBe(35); // Charlie
      expect(results[1].age).toBe(30); // Alice
      expect(results[2].age).toBe(28); // David
      expect(results[3].age).toBe(25); // Bob
    });

    it('should default to ASC if no direction specified', () => {
      const results = queryBuilder.select(['name', 'age']).from('Users').orderBy('age').execute();

      expect(results[0].age).toBeLessThanOrEqual(results[1].age);
    });

    it('should sort by string column', () => {
      const results = queryBuilder.select(['name']).from('Users').orderBy('name', 'ASC').execute();

      expect(results[0].name).toBe('Alice');
      expect(results[1].name).toBe('Bob');
      expect(results[2].name).toBe('Charlie');
      expect(results[3].name).toBe('David');
    });
  });

  // ===================================================================
  // ORDER BY DESC (Convenience Method)
  // ===================================================================

  describe('orderByDesc()', () => {
    it('should sort in descending order', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .orderByDesc('age')
        .execute();

      expect(results[0].age).toBe(35);
      expect(results[3].age).toBe(25);
    });
  });

  // ===================================================================
  // LIMIT
  // ===================================================================

  describe('limit()', () => {
    it('should limit number of results', () => {
      const results = queryBuilder.select(['name']).from('Users').limit(2).execute();

      expect(results).toHaveLength(2);
    });

    it('should return all results if limit exceeds total', () => {
      const results = queryBuilder.select(['name']).from('Users').limit(100).execute();

      expect(results).toHaveLength(4); // Total available
    });

    it('should handle limit of 0', () => {
      const results = queryBuilder.select(['name']).from('Users').limit(0).execute();

      expect(results).toHaveLength(0);
    });
  });

  // ===================================================================
  // OFFSET
  // ===================================================================

  describe('offset()', () => {
    it('should skip specified number of results', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .orderBy('name', 'ASC')
        .offset(2)
        .execute();

      expect(results).toHaveLength(2); // 4 - 2
      expect(results[0].name).toBe('Charlie');
    });

    it('should combine with limit for pagination', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .orderBy('name', 'ASC')
        .offset(1)
        .limit(2)
        .execute();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Bob');
      expect(results[1].name).toBe('Charlie');
    });

    it('should return empty if offset exceeds total', () => {
      const results = queryBuilder.select(['name']).from('Users').offset(100).execute();

      expect(results).toHaveLength(0);
    });
  });

  // ===================================================================
  // PAGINATE (Convenience Method)
  // ===================================================================

  describe('paginate()', () => {
    it('should paginate results', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .orderBy('name', 'ASC')
        .paginate(1, 2) // Page 1, 2 per page
        .execute();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Alice');
      expect(results[1].name).toBe('Bob');
    });

    it('should get second page', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .orderBy('name', 'ASC')
        .paginate(2, 2) // Page 2, 2 per page
        .execute();

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Charlie');
      expect(results[1].name).toBe('David');
    });

    it('should handle last incomplete page', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .paginate(2, 3) // Page 2, 3 per page
        .execute();

      expect(results).toHaveLength(1); // Only 1 left
    });
  });

  // ===================================================================
  // FIRST (Convenience Method)
  // ===================================================================

  describe('first()', () => {
    it('should return first result', () => {
      const result = queryBuilder.select(['name']).from('Users').orderBy('name', 'ASC').first();

      expect(result).toBeDefined();
      expect(result.name).toBe('Alice');
    });

    it('should return null if no results', () => {
      const result = queryBuilder
        .select(['name'])
        .from('Users')
        .where('name', '=', 'NonExistent')
        .first();

      expect(result).toBeNull();
    });
  });

  // ===================================================================
  // EXISTS (Convenience Method)
  // ===================================================================

  describe('exists()', () => {
    it('should return true if results exist', () => {
      const exists = queryBuilder.from('Users').where('name', '=', 'Alice').exists();

      expect(exists).toBe(true);
    });

    it('should return false if no results', () => {
      const exists = queryBuilder.from('Users').where('name', '=', 'NonExistent').exists();

      expect(exists).toBe(false);
    });
  });

  // ===================================================================
  // COMPLEX QUERIES
  // ===================================================================

  describe('Complex Queries', () => {
    it('should execute complex query with multiple conditions', () => {
      const results = queryBuilder
        .select(['name', 'age', 'status'])
        .from('Users')
        .where('status', '=', 'active')
        .andWhere('age', '>=', 25)
        .orderBy('age', 'DESC')
        .limit(2)
        .execute();

      expect(results).toHaveLength(2);
      expect(results[0].age).toBeGreaterThan(results[1].age);
      expect(results.every((r) => r.status === 'active')).toBe(true);
    });

    it('should handle query with all features combined', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .where('age', '>', 20)
        .andWhere('status', '=', 'active')
        .orderBy('age', 'ASC')
        .offset(1)
        .limit(2)
        .execute();

      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle query with no filters', () => {
      const results = queryBuilder.select(['name']).from('Users').execute();

      expect(results).toHaveLength(4); // All users
    });

    it('should handle empty result set', () => {
      const results = queryBuilder.select(['name']).from('Users').where('age', '>', 100).execute();

      expect(results).toHaveLength(0);
    });

    it('should handle null values in data', () => {
      mockDatabase.tables.Users.getRows.mockReturnValue([{ ID: '1', name: null, age: 30 }]);

      const results = queryBuilder.select(['name', 'age']).from('Users').execute();

      expect(results[0].name).toBeNull();
    });

    it('should handle select without columns (select all)', () => {
      const results = queryBuilder.from('Users').where('name', '=', 'Alice').execute();

      expect(results[0]).toHaveProperty('ID');
      expect(results[0]).toHaveProperty('name');
      expect(results[0]).toHaveProperty('age');
      expect(results[0]).toHaveProperty('status');
    });
  });

  // ===================================================================
  // QUERY CONDITION CLASS - COMPREHENSIVE TESTS
  // ===================================================================

  describe('QueryCondition Class', () => {
    const { QueryCondition } = require('../AdvancedQueryBuilder');

    it('should create condition with default AND type', () => {
      const cond = new QueryCondition('age', '>', 18);

      expect(cond.field).toBe('age');
      expect(cond.operator).toBe('>');
      expect(cond.value).toBe(18);
      expect(cond.type).toBe('AND');
    });

    it('should support OR type', () => {
      const cond = new QueryCondition('status', '=', 'active', 'OR');

      expect(cond.type).toBe('OR');
    });

    it('should normalize type to uppercase', () => {
      const cond = new QueryCondition('field', '=', 'value', 'and');

      expect(cond.type).toBe('AND');
    });

    it('should use default operator = when null', () => {
      const cond = new QueryCondition('field', null, 'value');

      expect(cond.operator).toBe('=');
    });

    it('should support adding sub-conditions', () => {
      const root = new QueryCondition('age', '>', 18);
      root.addSubCondition(new QueryCondition('status', '=', 'active'));

      expect(root.subConditions).toHaveLength(1);
    });

    it('should evaluate LIKE with pattern matching', () => {
      const cond = new QueryCondition('name', 'LIKE', 'Al%');

      expect(cond.compareValue('Alice')).toBe(true);
      expect(cond.compareValue('Bob')).toBe(false);
    });

    it('should evaluate IN operator', () => {
      const cond = new QueryCondition('status', 'IN', ['active', 'pending']);

      expect(cond.compareValue('active')).toBe(true);
      expect(cond.compareValue('deleted')).toBe(false);
    });

    it('should evaluate NOT IN operator', () => {
      const cond = new QueryCondition('status', 'NOT IN', ['deleted', 'archived']);

      expect(cond.compareValue('active')).toBe(true);
      expect(cond.compareValue('deleted')).toBe(false);
    });

    it('should evaluate CONTAINS operator', () => {
      const cond = new QueryCondition('description', 'CONTAINS', 'test');

      expect(cond.compareValue('This is a test')).toBe(true);
      expect(cond.compareValue('No match')).toBe(false);
    });

    it('should handle null values with = operator', () => {
      const cond = new QueryCondition('value', '=', null);

      expect(cond.compareValue(null)).toBe(true);
      expect(cond.compareValue(undefined)).toBe(true);
      expect(cond.compareValue('test')).toBe(false);
    });

    it('should handle null values with != operator', () => {
      const cond = new QueryCondition('value', '!=', null);

      expect(cond.compareValue('test')).toBe(true);
      expect(cond.compareValue(null)).toBe(false);
    });

    it('should evaluate complex nested conditions', () => {
      const root = new QueryCondition('age', '>', 18, 'AND');
      root.addSubCondition(new QueryCondition('status', '=', 'active', 'AND'));

      expect(root.evaluate({ age: 25, status: 'active' })).toBe(true);
      expect(root.evaluate({ age: 25, status: 'inactive' })).toBe(false);
    });

    it('should handle table-prefixed fields', () => {
      const cond = new QueryCondition('name', '=', 'Alice');

      expect(cond.evaluate({ 'Users.name': 'Alice' })).toBe(true);
    });

    it('should return chaining from addSubCondition', () => {
      const cond = new QueryCondition('field', '=', 'value');
      const result = cond.addSubCondition(new QueryCondition('other', '>', 5));

      expect(result).toBe(cond);
    });
  });

  // ===================================================================
  // QUERY AGGREGATION CLASS - COMPREHENSIVE TESTS
  // ===================================================================

  describe('QueryAggregation Class', () => {
    const { QueryAggregation } = require('../AdvancedQueryBuilder');

    const testData = [
      { price: 10, count: 5 },
      { price: 20, count: 3 },
      { price: 15, count: 4 },
      { price: null, count: 2 }
    ];

    it('should create aggregation with default alias', () => {
      const agg = new QueryAggregation('SUM', 'price');

      expect(agg.alias).toBe('SUM_price');
    });

    it('should create aggregation with custom alias', () => {
      const agg = new QueryAggregation('AVG', 'salary', 'avg_salary');

      expect(agg.alias).toBe('avg_salary');
    });

    it('should normalize function name to uppercase', () => {
      const agg = new QueryAggregation('sum', 'field');

      expect(agg.function).toBe('SUM');
    });

    it('should calculate COUNT', () => {
      const agg = new QueryAggregation('COUNT', 'price');

      expect(agg.calculate(testData)).toBe(3); // excludes null
    });

    it('should calculate SUM', () => {
      const agg = new QueryAggregation('SUM', 'price');

      expect(agg.calculate(testData)).toBe(45);
    });

    it('should calculate AVG', () => {
      const agg = new QueryAggregation('AVG', 'price');

      expect(agg.calculate(testData)).toBe(15);
    });

    it('should calculate MIN', () => {
      const agg = new QueryAggregation('MIN', 'price');

      expect(agg.calculate(testData)).toBe(10);
    });

    it('should calculate MAX', () => {
      const agg = new QueryAggregation('MAX', 'price');

      expect(agg.calculate(testData)).toBe(20);
    });

    it('should return null for empty array', () => {
      const agg = new QueryAggregation('SUM', 'field');

      expect(agg.calculate([])).toBeNull();
    });

    it('should return null for null input', () => {
      const agg = new QueryAggregation('COUNT', 'field');

      expect(agg.calculate(null)).toBeNull();
    });

    it('should return null when all values are null', () => {
      const agg = new QueryAggregation('AVG', 'value');
      const nullData = [{ value: null }, { value: null }];

      expect(agg.calculate(nullData)).toBeNull();
    });

    it('should handle non-numeric values safely', () => {
      const agg = new QueryAggregation('SUM', 'value');
      const mixedData = [{ value: 10 }, { value: 'invalid' }, { value: 5 }];

      expect(agg.calculate(mixedData)).toBe(15);
    });

    it('should return null for unknown aggregation function', () => {
      const agg = new QueryAggregation('MEDIAN', 'field');

      expect(agg.calculate(testData)).toBeNull();
    });
  });

  // ===================================================================
  // QUERY GROUP CLASS - COMPREHENSIVE TESTS
  // ===================================================================

  describe('QueryGroup Class', () => {
    const { QueryGroup, QueryAggregation, QueryCondition } = require('../AdvancedQueryBuilder');

    const salesData = [
      { dept: 'Sales', region: 'East', revenue: 1000 },
      { dept: 'Sales', region: 'West', revenue: 1500 },
      { dept: 'Engineering', region: 'East', revenue: 2000 },
      { dept: 'Sales', region: 'East', revenue: 800 }
    ];

    it('should create group with single field', () => {
      const group = new QueryGroup('dept');

      expect(group.fields).toEqual(['dept']);
    });

    it('should create group with array of fields', () => {
      const group = new QueryGroup(['dept', 'region']);

      expect(group.fields).toEqual(['dept', 'region']);
    });

    it('should group by single field', () => {
      const group = new QueryGroup('dept');
      group.addAggregation(new QueryAggregation('COUNT', 'revenue', 'count'));

      const result = group.group(salesData);

      expect(result).toHaveLength(2); // Sales, Engineering
      expect(result.find((r) => r.dept === 'Sales').count).toBe(3);
    });

    it('should group by multiple fields', () => {
      const group = new QueryGroup(['dept', 'region']);
      group.addAggregation(new QueryAggregation('SUM', 'revenue', 'total'));

      const result = group.group(salesData);

      expect(result).toHaveLength(3); // Sales-East, Sales-West, Engineering-East
    });

    it('should apply aggregations', () => {
      const group = new QueryGroup('dept');
      group.addAggregation(new QueryAggregation('SUM', 'revenue', 'total'));
      group.addAggregation(new QueryAggregation('AVG', 'revenue', 'avg'));

      const result = group.group(salesData);
      const sales = result.find((r) => r.dept === 'Sales');

      expect(sales.total).toBe(3300);
      expect(sales.avg).toBeCloseTo(1100, 1);
    });

    it('should apply HAVING condition', () => {
      const group = new QueryGroup('dept');
      group.addAggregation(new QueryAggregation('SUM', 'revenue', 'total'));
      group.setCondition(new QueryCondition('total', '>', 2500));

      const result = group.group(salesData);

      expect(result).toHaveLength(1);
      expect(result[0].dept).toBe('Sales');
    });

    it('should handle null/undefined in grouping key', () => {
      const dataWithNull = [
        { category: 'A', value: 1 },
        { category: null, value: 2 },
        { category: undefined, value: 3 }
      ];

      const group = new QueryGroup('category');
      const result = group.group(dataWithNull);

      expect(result).toHaveLength(2); // 'A' and 'NULL'
    });

    it('should return empty array for null input', () => {
      const group = new QueryGroup('field');

      expect(group.group(null)).toEqual([]);
    });

    it('should return empty array for empty input', () => {
      const group = new QueryGroup('field');

      expect(group.group([])).toEqual([]);
    });

    it('should preserve grouping field values', () => {
      const group = new QueryGroup('dept');
      const result = group.group(salesData);

      expect(result.every((r) => r.dept)).toBe(true);
    });
  });

  // ===================================================================
  // QUERY CACHE CLASS - COMPREHENSIVE TESTS
  // ===================================================================

  describe('QueryCache Class', () => {
    const { QueryCache } = require('../AdvancedQueryBuilder');

    let cacheService;
    let queryCache;
    let mockQuery;

    beforeEach(() => {
      cacheService = {
        get: jest.fn(() => null),
        put: jest.fn(() => true),
        removeAll: jest.fn(() => true)
      };

      queryCache = new QueryCache(cacheService);

      mockQuery = {
        selectedColumns: ['name'],
        tableName: 'Users',
        conditions: [],
        groupByFields: [],
        orderByFields: [],
        _limit: null,
        _offset: 0,
        joins: [],
        aggregations: [],
        dbService: null
      };
    });

    it('should initialize with cache service', () => {
      expect(queryCache.service).toBe(cacheService);
    });

    it('should have default prefix and expiration', () => {
      expect(queryCache.prefix).toBe('query_');
      expect(queryCache.expiration).toBe(300);
    });

    it('should generate cache key', () => {
      const key = queryCache._generateKey(mockQuery);

      expect(key).toContain('query_');
    });

    it('should generate different keys for different queries', () => {
      const key1 = queryCache._generateKey(mockQuery);
      mockQuery.tableName = 'Products';
      const key2 = queryCache._generateKey(mockQuery);

      expect(key1).not.toBe(key2);
    });

    it('should get from cache', () => {
      const cachedData = [{ name: 'Alice' }];
      cacheService.get.mockReturnValue(JSON.stringify(cachedData));

      const result = queryCache.get(mockQuery);

      expect(result).toEqual(cachedData);
    });

    it('should return null when cache service is unavailable', () => {
      queryCache.service = null;

      expect(queryCache.get(mockQuery)).toBeNull();
    });

    it('should store in cache', () => {
      const results = [{ name: 'Alice' }];

      queryCache.store(mockQuery, results);

      expect(cacheService.put).toHaveBeenCalledWith(
        expect.stringContaining('query_'),
        JSON.stringify(results),
        300
      );
    });

    it('should return false when storing without cache service', () => {
      queryCache.service = null;

      expect(queryCache.store(mockQuery, [])).toBe(false);
    });

    it('should invalidate table cache', () => {
      queryCache.invalidateTable('Users');

      expect(cacheService.removeAll).toHaveBeenCalled();
    });

    it('should clear all cache', () => {
      queryCache.clear();

      expect(cacheService.removeAll).toHaveBeenCalled();
    });

    it('should generate consistent cache keys for same query', () => {
      const query1 = { selectedColumns: ['name'], tableName: 'Users', conditions: [] };
      const query2 = { selectedColumns: ['name'], tableName: 'Users', conditions: [] };

      const key1 = queryCache._generateKey(query1);
      const key2 = queryCache._generateKey(query2);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different queries', () => {
      const query1 = { selectedColumns: ['name'], tableName: 'Users', conditions: [] };
      const query2 = { selectedColumns: ['age'], tableName: 'Users', conditions: [] };

      const key1 = queryCache._generateKey(query1);
      const key2 = queryCache._generateKey(query2);

      expect(key1).not.toBe(key2);
    });

    it('should include conditions in cache key', () => {
      const query1 = { selectedColumns: ['name'], tableName: 'Users', conditions: [] };
      const query2 = {
        selectedColumns: ['name'],
        tableName: 'Users',
        conditions: [{ field: 'age', operator: '>', value: 18 }]
      };

      const key1 = queryCache._generateKey(query1);
      const key2 = queryCache._generateKey(query2);

      expect(key1).not.toBe(key2);
    });
  });

  // ===================================================================
  // AGGREGATION METHODS - sum, avg, count, min, max
  // ===================================================================

  describe('Aggregation Methods', () => {
    beforeEach(() => {
      mockDatabase.tables.Products = {
        getRows: jest.fn(() => [
          { category: 'Electronics', price: 100, stock: 10 },
          { category: 'Electronics', price: 200, stock: 5 },
          { category: 'Books', price: 20, stock: 50 },
          { category: 'Books', price: 30, stock: 30 }
        ]),
        _indices: {},
        _keyField: 'id'
      };
    });

    it('should add SUM aggregation to query', () => {
      queryBuilder
        .select(['category'])
        .from('Products')
        .groupBy('category')
        .sum('price', 'total_price');

      expect(queryBuilder.aggregations).toHaveLength(1);
      expect(queryBuilder.aggregations[0].function).toBe('SUM');
      expect(queryBuilder.aggregations[0].field).toBe('price');
      expect(queryBuilder.aggregations[0].alias).toBe('total_price');
    });

    it('should add AVG aggregation to query', () => {
      queryBuilder.from('Products').avg('price', 'avg_price');

      expect(queryBuilder.aggregations).toHaveLength(1);
      expect(queryBuilder.aggregations[0].function).toBe('AVG');
    });

    it('should add COUNT aggregation to query', () => {
      queryBuilder.from('Products').count('price', 'product_count');

      expect(queryBuilder.aggregations).toHaveLength(1);
      expect(queryBuilder.aggregations[0].function).toBe('COUNT');
    });

    it('should add MIN aggregation to query', () => {
      queryBuilder.from('Products').min('price', 'min_price');

      expect(queryBuilder.aggregations).toHaveLength(1);
      expect(queryBuilder.aggregations[0].function).toBe('MIN');
    });

    it('should add MAX aggregation to query', () => {
      queryBuilder.from('Products').max('price', 'max_price');

      expect(queryBuilder.aggregations).toHaveLength(1);
      expect(queryBuilder.aggregations[0].function).toBe('MAX');
    });

    it('should support multiple aggregations', () => {
      queryBuilder
        .from('Products')
        .sum('price', 'total')
        .avg('stock', 'avg_stock')
        .count('price', 'count');

      expect(queryBuilder.aggregations).toHaveLength(3);
      expect(queryBuilder.aggregations[0].alias).toBe('total');
      expect(queryBuilder.aggregations[1].alias).toBe('avg_stock');
      expect(queryBuilder.aggregations[2].alias).toBe('count');
    });

    it('should return queryBuilder for chaining', () => {
      const result = queryBuilder.sum('price', 'total');

      expect(result).toBe(queryBuilder);
    });

    it('should automatically add groupBy fields to selection', () => {
      queryBuilder.select([]).from('Products').groupBy('category').sum('price', 'total');

      expect(queryBuilder.selectedColumns).toContain('category');
    });

    it('should support aggregation without custom alias', () => {
      queryBuilder.sum('price');

      expect(queryBuilder.aggregations[0].alias).toBe('SUM_price');
    });
  });

  // ===================================================================
  // ADDITIONAL WHERE OPERATORS
  // ===================================================================

  describe('Additional WHERE Operators', () => {
    it('should support >= operator', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .where('age', '>=', 30)
        .execute();

      expect(results.every((r) => r.age >= 30)).toBe(true);
    });

    it('should support <= operator', () => {
      const results = queryBuilder
        .select(['name', 'age'])
        .from('Users')
        .where('age', '<=', 28)
        .execute();

      expect(results.every((r) => r.age <= 28)).toBe(true);
    });

    it('should support <> operator (not equal)', () => {
      const results = queryBuilder
        .select(['name', 'status'])
        .from('Users')
        .where('status', '<>', 'active')
        .execute();

      expect(results.every((r) => r.status !== 'active')).toBe(true);
    });

    it('should support object syntax for where()', () => {
      const results = queryBuilder
        .select(['name'])
        .from('Users')
        .where({ status: 'active', age: 30 })
        .execute();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice');
    });

    it('should handle object syntax with single field', () => {
      const results = queryBuilder
        .select(['name', 'status'])
        .from('Users')
        .where({ status: 'active' })
        .execute();

      expect(results.length).toBeGreaterThan(0);
      // All results should have name property
      expect(results.every((r) => r.name)).toBe(true);
    });

    it('should support whereIn with validation', () => {
      expect(() => {
        queryBuilder.whereIn('status', 'not-an-array');
      }).toThrow('whereIn requires an array');
    });
  });

  // ===================================================================
  // SORTING ENHANCEMENTS
  // ===================================================================

  describe('Sorting Enhancements', () => {
    it('should sort with null values', () => {
      mockDatabase.tables.Users.getRows.mockReturnValue([
        { name: 'Alice', priority: 1 },
        { name: 'Bob', priority: null },
        { name: 'Charlie', priority: 3 }
      ]);

      const results = queryBuilder
        .select(['name', 'priority'])
        .from('Users')
        .orderBy('priority', 'ASC')
        .execute();

      expect(results[0].priority).toBeNull(); // nulls first in ASC
    });

    it('should sort by multiple fields', () => {
      mockDatabase.tables.Users.getRows.mockReturnValue([
        { dept: 'Sales', level: 2 },
        { dept: 'Sales', level: 1 },
        { dept: 'Eng', level: 3 }
      ]);

      const results = queryBuilder
        .select(['dept', 'level'])
        .from('Users')
        .orderBy(['dept', 'level'], 'ASC')
        .execute();

      expect(results[0].dept).toBe('Eng');
      expect(results[1].level).toBe(1);
    });

    it('should throw error for invalid sort direction', () => {
      expect(() => {
        queryBuilder.orderBy('name', 'INVALID');
      }).toThrow('Sort direction must be');
    });
  });

  // ===================================================================
  // ALIAS METHODS
  // ===================================================================

  describe('Alias Methods', () => {
    it('should support and() alias for andWhere()', () => {
      const results = queryBuilder
        .from('Users')
        .where('status', '=', 'active')
        .and('age', '>', 26)
        .execute();

      expect(results.every((r) => r.status === 'active' && r.age > 26)).toBe(true);
    });

    it('should support or() alias for orWhere()', () => {
      const results = queryBuilder.from('Users').where('age', '<', 26).or('age', '>', 34).execute();

      expect(results.length).toBeGreaterThan(0);
    });

    it('should support get() alias for execute()', () => {
      const results = queryBuilder.from('Users').where('status', '=', 'active').get();

      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ===================================================================
  // ERROR HANDLING
  // ===================================================================

  describe('Error Handling', () => {
    it('should throw error when executing without table', () => {
      expect(() => {
        queryBuilder.execute();
      }).toThrow('A table must be specified');
    });

    it('should handle invalid table gracefully', () => {
      expect(() => {
        queryBuilder.from('InvalidTable');
      }).toThrow('Table InvalidTable not found');
    });
  });
});
