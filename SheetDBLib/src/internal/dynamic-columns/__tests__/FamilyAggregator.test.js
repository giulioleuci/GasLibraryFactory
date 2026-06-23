/**
 * @file SheetDBLib/src/dynamic/__tests__/FamilyAggregator.test.js
 * @description Unit tests for FamilyAggregator class
 */

import { FamilyAggregator, AggregationType } from '../FamilyAggregator.js';
import { ColumnFamily } from '../ColumnFamily.js';
import { ColumnType } from '../ColumnType.js';

describe('FamilyAggregator', () => {
  let metricsFamily;
  let scoresFamily;
  let aggregator;

  beforeEach(() => {
    metricsFamily = new ColumnFamily({
      id: 'metrics',
      namePattern: 'metric_{{key}}',
      type: ColumnType.NUMBER,
      members: ['count', 'total', 'average']
    });

    scoresFamily = new ColumnFamily({
      id: 'scores',
      namePattern: 'score_{{key}}',
      type: ColumnType.NUMBER,
      members: ['math', 'science', 'english']
    });

    aggregator = new FamilyAggregator({
      families: [metricsFamily, scoresFamily]
    });
  });

  describe('constructor', () => {
    it('should create aggregator with families', () => {
      const agg = new FamilyAggregator({
        families: [metricsFamily]
      });

      expect(agg._familyMap.has('metrics')).toBe(true);
    });

    it('should create aggregator with familyMap', () => {
      const familyMap = new Map([['metrics', metricsFamily]]);
      const agg = new FamilyAggregator({ familyMap });

      expect(agg._familyMap.has('metrics')).toBe(true);
    });
  });

  describe('registerFamily', () => {
    it('should register a family', () => {
      const agg = new FamilyAggregator();
      agg.registerFamily(metricsFamily);

      expect(agg._familyMap.has('metrics')).toBe(true);
    });

    it('should throw for non-ColumnFamily', () => {
      const agg = new FamilyAggregator();

      expect(() => agg.registerFamily({ id: 'test' })).toThrow(
        'Family must be a ColumnFamily instance'
      );
    });
  });

  describe('aggregateRow', () => {
    describe('SUM', () => {
      it('should sum all values in a family', () => {
        const row = {
          metric_count: 10,
          metric_total: 20,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.SUM);

        expect(result.value).toBe(60);
        expect(result.familyId).toBe('metrics');
        expect(result.aggregationType).toBe('SUM');
      });

      it('should ignore null values', () => {
        const row = {
          metric_count: 10,
          metric_total: null,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.SUM);

        expect(result.value).toBe(40);
        expect(result.nullCount).toBe(1);
      });

      it('should coerce string values to numbers', () => {
        const row = {
          metric_count: '10',
          metric_total: '20',
          metric_average: '30'
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.SUM);

        expect(result.value).toBe(60);
      });
    });

    describe('AVG', () => {
      it('should calculate average of all values', () => {
        const row = {
          metric_count: 10,
          metric_total: 20,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.AVG);

        expect(result.value).toBe(20);
      });

      it('should return null for empty values', () => {
        const row = {};

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.AVG);

        expect(result.value).toBeNull();
      });
    });

    describe('MIN', () => {
      it('should find minimum value', () => {
        const row = {
          metric_count: 10,
          metric_total: 5,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.MIN);

        expect(result.value).toBe(5);
      });
    });

    describe('MAX', () => {
      it('should find maximum value', () => {
        const row = {
          metric_count: 10,
          metric_total: 5,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.MAX);

        expect(result.value).toBe(30);
      });
    });

    describe('COUNT', () => {
      it('should count non-null values', () => {
        const row = {
          metric_count: 10,
          metric_total: null,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.COUNT);

        expect(result.value).toBe(2);
      });
    });

    describe('COUNT_DISTINCT', () => {
      it('should count distinct values', () => {
        const row = {
          metric_count: 10,
          metric_total: 10,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.COUNT_DISTINCT);

        expect(result.value).toBe(2);
      });
    });

    describe('FIRST', () => {
      it('should return first non-null value', () => {
        const row = {
          metric_count: null,
          metric_total: 20,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.FIRST);

        expect(result.value).toBe(20);
      });
    });

    describe('LAST', () => {
      it('should return last non-null value', () => {
        const row = {
          metric_count: 10,
          metric_total: 20,
          metric_average: null
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.LAST);

        expect(result.value).toBe(20);
      });
    });

    describe('CONCAT', () => {
      it('should concatenate string values', () => {
        const attrFamily = new ColumnFamily({
          id: 'attrs',
          namePattern: 'attr_{{key}}',
          type: ColumnType.STRING,
          members: ['a', 'b', 'c']
        });
        aggregator.registerFamily(attrFamily);

        const row = {
          attr_a: 'red',
          attr_b: 'green',
          attr_c: 'blue'
        };

        const result = aggregator.aggregateRow(row, 'attrs', AggregationType.CONCAT);

        expect(result.value).toBe('red, green, blue');
      });

      it('should use custom separator', () => {
        const attrFamily = new ColumnFamily({
          id: 'attrs',
          namePattern: 'attr_{{key}}',
          type: ColumnType.STRING,
          members: ['a', 'b', 'c']
        });
        aggregator.registerFamily(attrFamily);

        const row = {
          attr_a: 'red',
          attr_b: 'green',
          attr_c: 'blue'
        };

        const result = aggregator.aggregateRow(row, 'attrs', AggregationType.CONCAT, {
          separator: ' | '
        });

        expect(result.value).toBe('red | green | blue');
      });
    });

    describe('COLLECT', () => {
      it('should collect values into array', () => {
        const row = {
          metric_count: 10,
          metric_total: 20,
          metric_average: 30
        };

        const result = aggregator.aggregateRow(row, 'metrics', AggregationType.COLLECT);

        expect(result.value).toEqual([10, 20, 30]);
      });
    });

    it('should filter by memberKeys', () => {
      const row = {
        metric_count: 10,
        metric_total: 20,
        metric_average: 30
      };

      const result = aggregator.aggregateRow(row, 'metrics', AggregationType.SUM, {
        memberKeys: ['count', 'total']
      });

      expect(result.value).toBe(30);
    });

    it('should throw for unknown family', () => {
      const row = {};

      expect(() => aggregator.aggregateRow(row, 'unknown', AggregationType.SUM)).toThrow(
        'Column family not found: unknown'
      );
    });
  });

  describe('aggregateRows', () => {
    it('should aggregate by member across rows', () => {
      const rows = [
        { score_math: 80, score_science: 90, score_english: 70 },
        { score_math: 90, score_science: 80, score_english: 80 },
        { score_math: 100, score_science: 100, score_english: 90 }
      ];

      const result = aggregator.aggregateRows(rows, 'scores', AggregationType.AVG);

      expect(result.math).toBe(90);
      expect(result.science).toBe(90);
      expect(result.english).toBe(80);
    });

    it('should handle missing values', () => {
      const rows = [
        { score_math: 80, score_science: 90 },
        { score_math: 90, score_english: 80 },
        { score_math: 100, score_science: 100, score_english: 90 }
      ];

      const result = aggregator.aggregateRows(rows, 'scores', AggregationType.COUNT);

      expect(result.math).toBe(3);
      expect(result.science).toBe(2);
      expect(result.english).toBe(2);
    });
  });

  describe('aggregateAll', () => {
    it('should aggregate all values across all rows', () => {
      const rows = [
        { score_math: 80, score_science: 90, score_english: 70 },
        { score_math: 90, score_science: 80, score_english: 80 }
      ];

      const result = aggregator.aggregateAll(rows, 'scores', AggregationType.SUM);

      expect(result.value).toBe(490);
      expect(result.inputCount).toBe(6);
    });

    it('should count nulls', () => {
      const rows = [
        { score_math: 80, score_science: null, score_english: 70 },
        { score_math: null, score_science: 80, score_english: 80 }
      ];

      const result = aggregator.aggregateAll(rows, 'scores', AggregationType.SUM);

      expect(result.nullCount).toBe(2);
    });
  });

  describe('multiAggregate', () => {
    it('should compute multiple aggregations', () => {
      const row = {
        metric_count: 10,
        metric_total: 20,
        metric_average: 30
      };

      const result = aggregator.multiAggregate(row, 'metrics', [
        AggregationType.SUM,
        AggregationType.AVG,
        AggregationType.COUNT
      ]);

      expect(result[AggregationType.SUM].value).toBe(60);
      expect(result[AggregationType.AVG].value).toBe(20);
      expect(result[AggregationType.COUNT].value).toBe(3);
    });
  });

  describe('groupAggregate', () => {
    it('should group and aggregate', () => {
      const regionFamily = new ColumnFamily({
        id: 'sales',
        namePattern: 'sales_{{key}}',
        type: ColumnType.STRING,
        members: ['region', 'amount']
      });
      aggregator.registerFamily(regionFamily);

      const rows = [
        { sales_region: 'North', sales_amount: 100 },
        { sales_region: 'South', sales_amount: 200 },
        { sales_region: 'North', sales_amount: 150 },
        { sales_region: 'South', sales_amount: 250 }
      ];

      const result = aggregator.groupAggregate(
        rows,
        'sales',
        'region',
        'amount',
        AggregationType.SUM
      );

      expect(result['North']).toBe(250);
      expect(result['South']).toBe(450);
    });

    it('should handle null group keys', () => {
      const regionFamily = new ColumnFamily({
        id: 'sales',
        namePattern: 'sales_{{key}}',
        type: ColumnType.STRING,
        members: ['region', 'amount']
      });
      aggregator.registerFamily(regionFamily);

      const rows = [
        { sales_region: 'North', sales_amount: 100 },
        { sales_region: null, sales_amount: 200 }
      ];

      const result = aggregator.groupAggregate(
        rows,
        'sales',
        'region',
        'amount',
        AggregationType.SUM
      );

      expect(result['North']).toBe(100);
      expect(result['null']).toBe(200);
    });
  });

  describe('AggregationType', () => {
    it('should have all expected types', () => {
      expect(AggregationType.SUM).toBe('SUM');
      expect(AggregationType.AVG).toBe('AVG');
      expect(AggregationType.MIN).toBe('MIN');
      expect(AggregationType.MAX).toBe('MAX');
      expect(AggregationType.COUNT).toBe('COUNT');
      expect(AggregationType.COUNT_DISTINCT).toBe('COUNT_DISTINCT');
      expect(AggregationType.FIRST).toBe('FIRST');
      expect(AggregationType.LAST).toBe('LAST');
      expect(AggregationType.CONCAT).toBe('CONCAT');
      expect(AggregationType.COLLECT).toBe('COLLECT');
    });
  });

  describe('static forFamilies', () => {
    it('should create aggregator for families', () => {
      const agg = FamilyAggregator.forFamilies([metricsFamily]);
      const row = { metric_count: 10, metric_total: 20, metric_average: 30 };

      const result = agg.aggregateRow(row, 'metrics', AggregationType.SUM);

      expect(result.value).toBe(60);
    });
  });
});
