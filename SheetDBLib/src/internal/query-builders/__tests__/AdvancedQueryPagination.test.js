// ===================================================================
// FILE: SheetDBLib/src/internal/query-builders/__tests__/AdvancedQueryPagination.test.js
// ===================================================================
// Direct unit tests for AdvancedQueryPagination, exercised against a
// minimal fake "facade" (the shape AdvancedQueryBuilder provides:
// orderByFields + _getFieldValue).
//
// AdvancedQueryBuilder.test.js/.coverage.test.js exercise the sort/limit
// path with small datasets, which always takes the plain Array#sort
// branch (see AdvancedQueryBuilder.execute(): partial sort only kicks in
// when limit < 100 AND rows.length > 1000). This file directly targets
// the quickselect-based _partialSort/_quickSelect/_partition/
// _medianOfThree methods, which are otherwise entirely untested.
// ===================================================================

import { AdvancedQueryPagination } from '../AdvancedQueryPagination.js';

function makeFacade(orderByFields) {
  return {
    orderByFields,
    _getFieldValue(row, field) {
      return row[field];
    }
  };
}

describe('AdvancedQueryPagination', () => {
  describe('_createComparator()', () => {
    it('returns 0 when there are no orderByFields', () => {
      const pagination = new AdvancedQueryPagination(makeFacade([]));
      const comparator = pagination._createComparator();
      expect(comparator({ a: 1 }, { a: 2 })).toBe(0);
    });

    it('sorts ascending by default and descending when configured', () => {
      const facade = makeFacade([{ field: 'age', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const comparator = pagination._createComparator();
      expect(comparator({ age: 1 }, { age: 2 })).toBeLessThan(0);
      expect(comparator({ age: 2 }, { age: 1 })).toBeGreaterThan(0);

      facade.orderByFields[0].direction = 'DESC';
      const descComparator = pagination._createComparator();
      expect(descComparator({ age: 1 }, { age: 2 })).toBeGreaterThan(0);
    });

    it('sorts nulls first in ASC and last in DESC', () => {
      const pagination = new AdvancedQueryPagination(
        makeFacade([{ field: 'age', direction: 'ASC' }])
      );
      const comparator = pagination._createComparator();
      expect(comparator({ age: null }, { age: 5 })).toBeLessThan(0);
      expect(comparator({ age: 5 }, { age: null })).toBeGreaterThan(0);
      expect(comparator({ age: undefined }, { age: 5 })).toBeLessThan(0);
    });

    it('falls through to the next field on ties (multi-field sort)', () => {
      const facade = makeFacade([
        { field: 'dept', direction: 'ASC' },
        { field: 'level', direction: 'DESC' }
      ]);
      const pagination = new AdvancedQueryPagination(facade);
      const comparator = pagination._createComparator();
      const rows = [
        { dept: 'Eng', level: 1 },
        { dept: 'Eng', level: 3 },
        { dept: 'Eng', level: 2 }
      ];
      rows.sort(comparator);
      expect(rows.map((r) => r.level)).toEqual([3, 2, 1]);
    });
  });

  describe('_partialSort()', () => {
    it('falls back to a full sort when k >= rows.length', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const rows = [{ val: 3 }, { val: 1 }, { val: 2 }];
      const result = pagination._partialSort(rows, 10);
      expect(result.map((r) => r.val)).toEqual([1, 2, 3]);
    });

    it('returns the correct top-K rows in sorted order for a large dataset (ASC)', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      // 2000 rows in reverse order to force real quickselect work
      const rows = Array.from({ length: 2000 }, (_, i) => ({ val: 2000 - i }));
      const topK = pagination._partialSort(rows, 5);
      expect(topK).toHaveLength(5);
      expect(topK.map((r) => r.val)).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns the correct top-K rows in sorted order for a large dataset (DESC)', () => {
      const facade = makeFacade([{ field: 'val', direction: 'DESC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const rows = Array.from({ length: 1500 }, (_, i) => ({ val: i }));
      const topK = pagination._partialSort(rows, 3);
      expect(topK).toHaveLength(3);
      expect(topK.map((r) => r.val)).toEqual([1499, 1498, 1497]);
    });

    it('handles k = 1 (single winner)', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const rows = Array.from({ length: 1200 }, () => ({ val: Math.random() * 1000 }));
      rows.push({ val: -999 });
      const topK = pagination._partialSort(rows, 1);
      expect(topK).toHaveLength(1);
      expect(topK[0].val).toBe(-999);
    });

    it('does not mutate the original rows array order (uses a copy for quickselect)', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const rows = Array.from({ length: 1100 }, (_, i) => ({ val: 1100 - i }));
      const originalOrder = rows.map((r) => r.val);
      pagination._partialSort(rows, 5);
      expect(rows.map((r) => r.val)).toEqual(originalOrder);
    });

    it('handles duplicate values correctly', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const rows = Array.from({ length: 1100 }, () => ({ val: 42 }));
      rows.push({ val: 1 });
      const topK = pagination._partialSort(rows, 2);
      expect(topK.map((r) => r.val)).toEqual([1, 42]);
    });
  });

  describe('_medianOfThree() and _partition()', () => {
    it('orders left/mid/right such that arr[left] <= arr[mid] <= arr[right]', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const comparator = pagination._createComparator();
      const arr = [{ val: 5 }, { val: 1 }, { val: 3 }];
      pagination._medianOfThree(arr, 0, 2, comparator);
      expect(arr[0].val).toBeLessThanOrEqual(arr[1].val);
      expect(arr[1].val).toBeLessThanOrEqual(arr[2].val);
    });

    it('partitions the array around the pivot value', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const comparator = pagination._createComparator();
      const arr = [{ val: 4 }, { val: 2 }, { val: 6 }, { val: 1 }, { val: 5 }];
      const pivotIndex = 2; // val: 6
      const storeIndex = pagination._partition(arr, 0, 4, pivotIndex, comparator);
      const pivotValue = arr[storeIndex].val;
      for (let i = 0; i < storeIndex; i++) {
        expect(arr[i].val).toBeLessThan(pivotValue);
      }
      for (let i = storeIndex + 1; i < arr.length; i++) {
        expect(arr[i].val).toBeGreaterThanOrEqual(pivotValue);
      }
    });
  });

  describe('_quickSelect()', () => {
    it('is a no-op when left >= right', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const comparator = pagination._createComparator();
      const arr = [{ val: 1 }];
      expect(() => pagination._quickSelect(arr, 0, 0, 1, comparator)).not.toThrow();
      expect(arr).toEqual([{ val: 1 }]);
    });

    it('places the k-th smallest element at index k-1', () => {
      const facade = makeFacade([{ field: 'val', direction: 'ASC' }]);
      const pagination = new AdvancedQueryPagination(facade);
      const comparator = pagination._createComparator();
      const values = [50, 20, 90, 10, 40, 70, 30, 60, 80, 100];
      const arr = values.map((val) => ({ val }));
      const k = 4;
      pagination._quickSelect(arr, 0, arr.length - 1, k, comparator);
      const sorted = [...values].sort((a, b) => a - b);
      expect(arr[k - 1].val).toBe(sorted[k - 1]);
    });
  });
});
