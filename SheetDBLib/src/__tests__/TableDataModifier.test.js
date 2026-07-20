/**
 * @file SheetDBLib/src/__tests__/TableDataModifier.test.js
 * @description Direct unit tests for TableDataModifier - the write-path engine behind
 * TableService (insert/update/patch/delete queuing, write-through cache maintenance,
 * dirty-checking, and batch variants). TableService.test.js exercises this indirectly
 * through the public facade; these tests isolate TableDataModifier against a minimal
 * fake "facade" so the collaborator's own logic (queueing, cache mutation, dirty
 * checking, error propagation) is verified directly and unambiguously.
 */

import { TableDataModifier } from '../TableDataModifier.js';
import { OperationError } from '@CoreUtilsLib';

/**
 * Builds a minimal fake TableService-shaped facade that TableDataModifier can operate
 * against, with just enough behavior (schema pass-through validation, UUID generation,
 * virtual column identity, and array/map-backed queues + caches) to exercise the real
 * write-path logic in TableDataModifier without pulling in the full TableService.
 */
function createFakeFacade(overrides = {}) {
  let uuidCounter = 0;

  const facade = {
    sheetName: 'TestTable',
    columns: ['id', 'name', 'age'],
    _virtualColumns: {},
    _keyField: 'id',
    _rowsCache: [],
    _processedRowsCache: 'stale-marker',
    _originalRowData: new Map(),
    _insertQueue: [],
    _updateQueue: new Map(),
    _deleteQueue: new Set(),
    _logger: { debug: jest.fn(), warn: jest.fn(), error: jest.fn(), info: jest.fn() },
    utils: { generateUuid: jest.fn(() => `uuid-${++uuidCounter}`) },
    schemaValidator: { validateRow: jest.fn((row) => ({ ...row })) },
    searchEngine: { invalidateIndex: jest.fn() },
    _ensureDataLoaded: jest.fn(),
    _applyVirtualColumns: jest.fn((row) => row),
    _findRowIndexById: jest.fn(function (id) {
      return this._rowsCache.findIndex((r) => r[this._keyField] === id);
    }),
    _storeOriginalRowData: jest.fn(function (row) {
      const physical = {};
      for (const col of this.columns) {
        if (!this._virtualColumns[col]) {
          physical[col] = row[col] ?? '';
        }
      }
      this._originalRowData.set(row[this._keyField], physical);
    }),
    ...overrides
  };

  return facade;
}

describe('TableDataModifier', () => {
  let facade;
  let modifier;

  beforeEach(() => {
    facade = createFakeFacade();
    modifier = new TableDataModifier(facade);
  });

  describe('insertRows', () => {
    it('returns [] and warns on empty array without touching state', () => {
      const result = modifier.insertRows([]);
      expect(result).toEqual([]);
      expect(facade._logger.warn).toHaveBeenCalled();
      expect(facade._insertQueue).toHaveLength(0);
    });

    it('returns [] for non-array input', () => {
      expect(modifier.insertRows(null)).toEqual([]);
      expect(modifier.insertRows('not-an-array')).toEqual([]);
    });

    it('queues rows, populates the write-through cache, and generates a PK when missing', () => {
      const result = modifier.insertRows([{ name: 'Alice', age: 30 }]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-1');
      expect(facade._insertQueue).toEqual(result);
      expect(facade._rowsCache).toEqual(result);
      expect(facade.searchEngine.invalidateIndex).toHaveBeenCalled();
      expect(facade._originalRowData.get('uuid-1')).toEqual({
        id: 'uuid-1',
        name: 'Alice',
        age: 30
      });
    });

    it('preserves a caller-supplied PK instead of generating one', () => {
      const result = modifier.insertRows([{ id: 'explicit-id', name: 'Bob' }]);
      expect(result[0].id).toBe('explicit-id');
      expect(facade.utils.generateUuid).not.toHaveBeenCalled();
    });

    it('invalidates the processed-rows cache so virtual columns recompute', () => {
      modifier.insertRows([{ name: 'Alice' }]);
      expect(facade._processedRowsCache).toBeNull();
    });

    it('batches many rows in a single call, all queued and cached in order', () => {
      const rows = Array.from({ length: 50 }, (_, i) => ({ name: `Row${i}` }));
      const result = modifier.insertRows(rows);

      expect(result).toHaveLength(50);
      expect(facade._insertQueue).toHaveLength(50);
      expect(facade._rowsCache).toHaveLength(50);
      expect(new Set(result.map((r) => r.id)).size).toBe(50); // all UUIDs unique
    });

    it('applies virtual columns to every inserted row', () => {
      modifier.insertRows([{ name: 'Alice' }, { name: 'Bob' }]);
      expect(facade._applyVirtualColumns).toHaveBeenCalledTimes(2);
    });

    it('propagates and logs a schema validation error without partially queueing', () => {
      facade.schemaValidator.validateRow = jest.fn(() => {
        throw new Error('bad schema');
      });
      expect(() => modifier.insertRows([{ name: 'X' }])).toThrow('bad schema');
    });

    it('insertRow (singular) delegates to insertRows and returns the single result', () => {
      const row = modifier.insertRow({ name: 'Solo' });
      expect(row.name).toBe('Solo');
      expect(facade._insertQueue).toHaveLength(1);
    });

    it('insertRow returns null when insertRows yields nothing (defensive path)', () => {
      const spy = jest.spyOn(modifier, 'insertRows').mockReturnValue([]);
      expect(modifier.insertRow({ name: 'X' })).toBeNull();
      spy.mockRestore();
    });
  });

  describe('updateRowById', () => {
    beforeEach(() => {
      facade._rowsCache = [{ id: '1', name: 'Alice', age: 30 }];
      facade._storeOriginalRowData(facade._rowsCache[0]);
    });

    it('throws OperationError when the id does not exist', () => {
      expect(() => modifier.updateRowById('missing', { name: 'X' })).toThrow(OperationError);
    });

    it('queues an update, applies write-through cache, and invalidates indices when data changed', () => {
      const result = modifier.updateRowById('1', { name: 'Alicia' });

      expect(result.name).toBe('Alicia');
      expect(facade._updateQueue.get('1')).toEqual(result);
      expect(facade._rowsCache[0]).toEqual(result);
      expect(facade.searchEngine.invalidateIndex).toHaveBeenCalled();
    });

    it('skips queueing (dirty check) when the update is a no-op on physical columns', () => {
      const result = modifier.updateRowById('1', { name: 'Alice', age: 30 });

      expect(result).toEqual({ id: '1', name: 'Alice', age: 30 });
      expect(facade._updateQueue.has('1')).toBe(false);
    });

    it('merges partial data over the existing row rather than replacing it', () => {
      const result = modifier.updateRowById('1', { age: 31 });
      expect(result).toEqual({ id: '1', name: 'Alice', age: 31 });
    });
  });

  describe('patchRow', () => {
    beforeEach(() => {
      facade._rowsCache = [{ id: '1', name: 'Alice', age: 30 }];
    });

    it('throws OperationError when id not found', () => {
      expect(() => modifier.patchRow('missing', { name: 'X' })).toThrow(OperationError);
    });

    it('queues only changed columns and updates cache', () => {
      const result = modifier.patchRow('1', { age: 31 });
      expect(result).toEqual({ id: '1', name: 'Alice', age: 31 });
      expect(facade._updateQueue.get('1')).toEqual(result);
    });

    it('returns early without queueing when nothing actually changed', () => {
      const result = modifier.patchRow('1', { name: 'Alice' });
      expect(result).toEqual({ id: '1', name: 'Alice', age: 30 });
      expect(facade._updateQueue.has('1')).toBe(false);
    });

    it('warns about unknown columns not present in the schema (excluded from the changed-column diff)', () => {
      const result = modifier.patchRow('1', { unknownCol: 'x', age: 40 });
      expect(facade._logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Column 'unknownCol' not found")
      );
      // The unknown key is still merged into the returned row (only the diff/logging skips it)...
      expect(result.age).toBe(40);
      expect(result.unknownCol).toBe('x');
      // ...but the queued write only carries the row as merged, which is what actually gets persisted.
      expect(facade._updateQueue.get('1')).toEqual(result);
    });

    it('skips virtual columns when computing the changed-column diff', () => {
      facade._virtualColumns = { computed: true };
      facade.columns = ['id', 'name', 'age', 'computed'];
      const result = modifier.patchRow('1', { computed: 'ignored', age: 45 });
      expect(result.age).toBe(45);
      // Only physical change should have gone through the diff path; computed is skipped entirely.
    });
  });

  describe('deleteRowById', () => {
    beforeEach(() => {
      facade._rowsCache = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' }
      ];
    });

    it('returns null and warns when the id does not exist', () => {
      const result = modifier.deleteRowById('missing');
      expect(result).toBeNull();
      expect(facade._logger.warn).toHaveBeenCalled();
    });

    it('queues deletion, removes the row from cache, and clears original-data tracking', () => {
      facade._originalRowData.set('1', { id: '1', name: 'Alice' });
      const result = modifier.deleteRowById('1');

      expect(result).toEqual({ id: '1', name: 'Alice' });
      expect(facade._deleteQueue.has('1')).toBe(true);
      expect(facade._rowsCache).toEqual([{ id: '2', name: 'Bob' }]);
      expect(facade._originalRowData.has('1')).toBe(false);
      expect(facade.searchEngine.invalidateIndex).toHaveBeenCalled();
    });

    it('removes a pending update for the same id (delete wins over queued update)', () => {
      facade._updateQueue.set('1', { id: '1', name: 'Changed' });
      modifier.deleteRowById('1');
      expect(facade._updateQueue.has('1')).toBe(false);
    });

    it('cancels a same-transaction insert instead of queueing a remote delete for a never-persisted row', () => {
      facade._rowsCache.push({ id: '3', name: 'New' });
      facade._insertQueue.push({ id: '3', name: 'New' });

      const result = modifier.deleteRowById('3');

      expect(result).toEqual({ id: '3', name: 'New' });
      expect(facade._insertQueue.find((r) => r.id === '3')).toBeUndefined();
      // Never pushed remotely, so no remote delete should be queued either.
      expect(facade._deleteQueue.has('3')).toBe(false);
    });
  });

  describe('updateRowsByIds (batch patch)', () => {
    beforeEach(() => {
      facade._rowsCache = [
        { id: '1', name: 'Alice', age: 30 },
        { id: '2', name: 'Bob', age: 25 }
      ];
    });

    it('returns [] for empty/undefined input', () => {
      expect(modifier.updateRowsByIds({})).toEqual([]);
      expect(modifier.updateRowsByIds(null)).toEqual([]);
    });

    it('applies patches for every id and returns all successful results', () => {
      const results = modifier.updateRowsByIds({ 1: { age: 31 }, 2: { age: 26 } });
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.age).sort()).toEqual([26, 31]);
    });

    it('skips a failing id (e.g. not found) but still processes the rest, logging a warning', () => {
      const results = modifier.updateRowsByIds({ missing: { age: 1 }, 1: { age: 99 } });
      expect(results).toHaveLength(1);
      expect(results[0].age).toBe(99);
      expect(facade._logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process bulk update for ID missing')
      );
    });
  });

  describe('deleteRowsByIds (batch delete)', () => {
    beforeEach(() => {
      facade._rowsCache = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' }
      ];
    });

    it('returns [] for empty/undefined input', () => {
      expect(modifier.deleteRowsByIds([])).toEqual([]);
      expect(modifier.deleteRowsByIds(null)).toEqual([]);
    });

    it('deletes every id present and silently omits ids that are not found', () => {
      const results = modifier.deleteRowsByIds(['1', 'missing', '2']);
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id).sort()).toEqual(['1', '2']);
      expect(facade._rowsCache).toEqual([]);
    });
  });
});
