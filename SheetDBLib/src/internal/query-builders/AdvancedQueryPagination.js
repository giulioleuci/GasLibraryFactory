/**
 * @file SheetDBLib/src/query/managers/AdvancedQueryPagination.js
 * @description Sorting and pagination optimizations for AdvancedQueryBuilder.
 */

export class AdvancedQueryPagination {
  constructor(facade) {
    this.facade = facade;
  }

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
      for (const sorting of this.facade.orderByFields) {
        const valueA = this.facade._getFieldValue(a, sorting.field);
        const valueB = this.facade._getFieldValue(b, sorting.field);
        if (valueA === valueB) continue;
        if (valueA === null || valueA === undefined) return sorting.direction === 'ASC' ? -1 : 1;
        if (valueB === null || valueB === undefined) return sorting.direction === 'ASC' ? 1 : -1;
        const comparison = valueA < valueB ? -1 : 1;
        return sorting.direction === 'ASC' ? comparison : -comparison;
      }
      return 0;
    };
  }

  _quickSelect(arr, left, right, k, comparator) {
    if (left >= right) return;
    const pivotIndex = this._medianOfThree(arr, left, right, comparator);
    const newPivotIndex = this._partition(arr, left, right, pivotIndex, comparator);
    if (k - 1 === newPivotIndex) return;
    else if (k - 1 < newPivotIndex) this._quickSelect(arr, left, newPivotIndex - 1, k, comparator);
    else this._quickSelect(arr, newPivotIndex + 1, right, k, comparator);
  }

  _medianOfThree(arr, left, right, comparator) {
    const mid = Math.floor((left + right) / 2);
    if (comparator(arr[left], arr[mid]) > 0) [arr[left], arr[mid]] = [arr[mid], arr[left]];
    if (comparator(arr[left], arr[right]) > 0) [arr[left], arr[right]] = [arr[right], arr[left]];
    if (comparator(arr[mid], arr[right]) > 0) [arr[mid], arr[right]] = [arr[right], arr[mid]];
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
}
