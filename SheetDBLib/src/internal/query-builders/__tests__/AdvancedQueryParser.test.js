// ===================================================================
// FILE: SheetDBLib/src/internal/query-builders/__tests__/AdvancedQueryParser.test.js
// ===================================================================
// Direct unit tests for the internal helper functions (_isNullOrUndefined,
// _safeParseFloat, _compareValues) and the QueryCondition/QueryAggregation/
// QueryGroup classes exported from AdvancedQueryParser.js.
//
// NOTE: QueryCondition/QueryAggregation/QueryGroup already have broad
// coverage exercised through AdvancedQueryBuilder in
// src/query/__tests__/AdvancedQueryBuilder.test.js. This file focuses on
// direct, module-local edge cases (malformed inputs, helper functions)
// that aren't reached through the builder's public fluent API.
// ===================================================================

import {
  QueryCondition,
  QueryAggregation,
  QueryGroup,
  AdvancedQueryParser
} from '../AdvancedQueryParser.js';

const { _isNullOrUndefined, _safeParseFloat, _compareValues } = AdvancedQueryParser;

describe('AdvancedQueryParser internal helpers', () => {
  describe('_isNullOrUndefined()', () => {
    it('returns true for null', () => {
      expect(_isNullOrUndefined(null)).toBe(true);
    });
    it('returns true for undefined', () => {
      expect(_isNullOrUndefined(undefined)).toBe(true);
    });
    it('returns false for 0, empty string, and false', () => {
      expect(_isNullOrUndefined(0)).toBe(false);
      expect(_isNullOrUndefined('')).toBe(false);
      expect(_isNullOrUndefined(false)).toBe(false);
    });
  });

  describe('_safeParseFloat()', () => {
    it('parses numeric strings', () => {
      expect(_safeParseFloat('3.14')).toBeCloseTo(3.14);
    });
    it('parses numbers as-is', () => {
      expect(_safeParseFloat(42)).toBe(42);
    });
    it('returns default (0) for non-numeric input', () => {
      expect(_safeParseFloat('abc')).toBe(0);
    });
    it('returns custom default for non-numeric input', () => {
      expect(_safeParseFloat('abc', -1)).toBe(-1);
    });
    it('returns default for null/undefined', () => {
      expect(_safeParseFloat(null)).toBe(0);
      expect(_safeParseFloat(undefined, 99)).toBe(99);
    });
  });

  describe('_compareValues()', () => {
    it('handles = with both sides null', () => {
      expect(_compareValues(null, '=', undefined)).toBe(true);
    });
    it('handles = with left null, right non-null', () => {
      expect(_compareValues(null, '=', 5)).toBe(false);
    });
    it('handles != with left null, right non-null', () => {
      expect(_compareValues(null, '!=', 5)).toBe(true);
    });
    it('handles <> as alias for !=', () => {
      expect(_compareValues(null, '<>', null)).toBe(false);
    });

    it('evaluates strict equality for =/==', () => {
      expect(_compareValues(5, '=', 5)).toBe(true);
      expect(_compareValues('5', '==', 5)).toBe(false); // strict, no coercion
    });

    it('evaluates ordering operators', () => {
      expect(_compareValues(5, '>', 3)).toBe(true);
      expect(_compareValues(3, '>', 5)).toBe(false);
      expect(_compareValues(5, '>=', 5)).toBe(true);
      expect(_compareValues(4, '<', 5)).toBe(true);
      expect(_compareValues(5, '<=', 5)).toBe(true);
    });

    it('LIKE returns false for non-string leftValue', () => {
      expect(_compareValues(123, 'LIKE', '12%')).toBe(false);
    });

    it('LIKE supports % wildcard, case-insensitively', () => {
      expect(_compareValues('Hello World', 'LIKE', 'hello%')).toBe(true);
      expect(_compareValues('Hello World', 'LIKE', '%world')).toBe(true);
      expect(_compareValues('Hello World', 'LIKE', 'xyz%')).toBe(false);
    });

    it('IN returns false when rightValue is not an array', () => {
      expect(_compareValues(1, 'IN', 'not-an-array')).toBe(false);
    });

    it('IN uses loose equality against the collection', () => {
      expect(_compareValues('1', 'IN', [1, 2, 3])).toBe(true);
      expect(_compareValues(4, 'IN', [1, 2, 3])).toBe(false);
    });

    it('NOT IN returns false when rightValue is not an array', () => {
      expect(_compareValues(1, 'NOT IN', 'not-an-array')).toBe(false);
    });

    it('NOT IN negates membership', () => {
      expect(_compareValues(4, 'NOT IN', [1, 2, 3])).toBe(true);
      expect(_compareValues(1, 'NOT IN', [1, 2, 3])).toBe(false);
    });

    it('CONTAINS requires both operands to be strings', () => {
      expect(_compareValues(123, 'CONTAINS', '2')).toBe(false);
      expect(_compareValues('123', 'CONTAINS', 2)).toBe(false);
    });

    it('CONTAINS is case-insensitive substring match', () => {
      expect(_compareValues('Hello World', 'CONTAINS', 'lo wo')).toBe(true);
      expect(_compareValues('Hello World', 'CONTAINS', 'zzz')).toBe(false);
    });

    it('returns false for an unknown operator', () => {
      expect(_compareValues(1, 'BETWEEN', 1)).toBe(false);
    });
  });
});

describe('QueryCondition', () => {
  it('defaults operator to = and type to AND', () => {
    const cond = new QueryCondition('status');
    expect(cond.operator).toBe('=');
    expect(cond.type).toBe('AND');
  });

  it('evaluates to true for malformed leaf (missing field/operator)', () => {
    const cond = new QueryCondition(null, null, null);
    expect(cond.evaluate({ anything: 1 })).toBe(true);
  });

  it('resolves suffix-matched fields when direct key is undefined', () => {
    const cond = new QueryCondition('name', '=', 'Alice');
    expect(cond.evaluate({ 'Users.name': 'Alice' })).toBe(true);
    expect(cond.evaluate({ 'Users.name': 'Bob' })).toBe(false);
  });

  it('combines its own field/operator with AND-joined subConditions', () => {
    const root = new QueryCondition('active', '=', true, 'AND');
    root.addSubCondition(new QueryCondition('age', '>=', 18));
    expect(root.evaluate({ active: true, age: 20 })).toBe(true);
    expect(root.evaluate({ active: true, age: 10 })).toBe(false);
    expect(root.evaluate({ active: false, age: 20 })).toBe(false);
  });

  it('combines its own field/operator with OR-joined subConditions and short-circuits', () => {
    const root = new QueryCondition('vip', '=', true, 'OR');
    root.addSubCondition(new QueryCondition('age', '>=', 65));
    expect(root.evaluate({ vip: true, age: 10 })).toBe(true);
    expect(root.evaluate({ vip: false, age: 70 })).toBe(true);
    expect(root.evaluate({ vip: false, age: 10 })).toBe(false);
  });

  it('short-circuits AND evaluation on the first false subCondition', () => {
    const root = new QueryCondition(null, null, null, 'AND');
    const first = new QueryCondition('a', '=', 1);
    const second = new QueryCondition('b', '=', 2);
    const evalSpy = jest.spyOn(second, 'evaluate');
    root.addSubCondition(first).addSubCondition(second);
    expect(root.evaluate({ a: 999, b: 2 })).toBe(false);
    expect(evalSpy).not.toHaveBeenCalled();
  });
});

describe('QueryAggregation', () => {
  it('derives a default alias from function and field', () => {
    const agg = new QueryAggregation('sum', 'price');
    expect(agg.function).toBe('SUM');
    expect(agg.alias).toBe('SUM_price');
  });

  it('returns null for an unrecognized aggregation function', () => {
    const agg = new QueryAggregation('MEDIAN', 'price');
    expect(agg.calculate([{ price: 10 }])).toBeNull();
  });

  it('resolves suffix-matched fields (e.g., Table.field)', () => {
    const agg = new QueryAggregation('SUM', 'price');
    const result = agg.calculate([{ 'Products.price': 10 }, { 'Products.price': 20 }]);
    expect(result).toBe(30);
  });

  it('ignores null/undefined values in the collection', () => {
    const agg = new QueryAggregation('AVG', 'price');
    const result = agg.calculate([{ price: 10 }, { price: null }, { price: 20 }]);
    expect(result).toBe(15);
  });
});

describe('QueryGroup', () => {
  it('groups a single row into a single group', () => {
    const group = new QueryGroup('dept');
    group.addAggregation(new QueryAggregation('COUNT', 'dept', 'count'));
    const results = group.group([{ dept: 'Eng' }]);
    expect(results).toHaveLength(1);
    expect(results[0].count).toBe(1);
  });

  it('returns an empty array for empty input', () => {
    const group = new QueryGroup('dept');
    expect(group.group([])).toEqual([]);
    expect(group.group(null)).toEqual([]);
  });

  it('treats null grouping values as a single NULL bucket', () => {
    const group = new QueryGroup('dept');
    const results = group.group([{ dept: null }, { dept: null }, { dept: 'Eng' }]);
    expect(results).toHaveLength(2);
  });

  it('applies a HAVING condition to filter aggregated groups', () => {
    const group = new QueryGroup('dept');
    group.addAggregation(new QueryAggregation('COUNT', 'dept', 'count'));
    group.setCondition(new QueryCondition('count', '>', 1));
    const results = group.group([{ dept: 'Eng' }, { dept: 'Eng' }, { dept: 'Sales' }]);
    expect(results).toHaveLength(1);
    expect(results[0].dept).toBe('Eng');
  });
});
