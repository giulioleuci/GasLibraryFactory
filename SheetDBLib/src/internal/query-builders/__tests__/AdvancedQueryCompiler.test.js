// ===================================================================
// FILE: SheetDBLib/src/internal/query-builders/__tests__/AdvancedQueryCompiler.test.js
// ===================================================================
// Direct unit tests for AdvancedQueryCompiler and QueryCache, exercised
// against a minimal fake "facade" (the shape AdvancedQueryBuilder
// provides: dbService, conditions, tableName, _optimizedField).
//
// SheetDBLib/src/query/__tests__/AdvancedQueryBuilder_Joins.test.js already
// gives _performJoin broad functional coverage (INNER/LEFT/RIGHT/FULL,
// multi-join chains, null keys, non-equality operators) through the public
// builder API. This file targets the compiler module directly, focusing on
// paths that are hard or impossible to reach through the builder:
//  - _tryIndexOptimization (no existing test populates `_indices` with real
//    entries; every builder-level test uses `_indices: {}`), including
//    smallest-cardinality selection among multiple AND-equality conditions
//    and the primary-key fast path.
//  - _extractFieldValue's fallback resolution branches in isolation.
//  - _performJoin edge cases: empty right table for LEFT/FULL (no null-key
//    fill), calling the method directly without going through execute().
//  - QueryCache's JSON.parse failure path (corrupted cache payload).
// ===================================================================

import { AdvancedQueryCompiler, QueryCache } from '../AdvancedQueryCompiler.js';

function makeTable({ rows, keyField = 'id', indices = {} }) {
  return {
    getRows: jest.fn(() => rows),
    _keyField: keyField,
    _indices: indices,
    _rowsCache: rows,
    _ensureDataLoaded: jest.fn(),
    getRowById: jest.fn((id) => rows.find((r) => r[keyField] === id) || null)
  };
}

function makeFacade({ dbService, conditions = [], tableName = null } = {}) {
  return {
    dbService,
    conditions,
    tableName,
    _optimizedField: null
  };
}

describe('AdvancedQueryCompiler', () => {
  describe('_extractFieldValue()', () => {
    let compiler;
    beforeEach(() => {
      compiler = new AdvancedQueryCompiler(makeFacade());
    });

    it('returns the value for a direct key match', () => {
      expect(compiler._extractFieldValue({ name: 'Alice' }, 'name')).toBe('Alice');
    });

    it('resolves a dotted-path field to its plain suffix key', () => {
      expect(compiler._extractFieldValue({ name: 'Alice' }, 'Users.name')).toBe('Alice');
    });

    it('resolves a dotted-path field to a differently-prefixed key via suffix scan', () => {
      expect(compiler._extractFieldValue({ 'Users.name': 'Alice' }, 'Accounts.name')).toBe('Alice');
    });

    it('returns undefined when the field cannot be resolved', () => {
      expect(compiler._extractFieldValue({ name: 'Alice' }, 'age')).toBeUndefined();
    });

    it('prefers a direct hasOwnProperty match over suffix scanning', () => {
      const row = { 'Users.name': 'Wrong', name: 'Right' };
      expect(compiler._extractFieldValue(row, 'name')).toBe('Right');
    });
  });

  describe('_performJoin()', () => {
    it('throws when the join target table is not registered', () => {
      const dbService = { tables: {} };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      expect(() =>
        compiler._performJoin([{ id: 1 }], {
          type: 'INNER',
          table: 'Ghost',
          localField: 'id',
          operator: '=',
          foreignField: 'ref'
        })
      ).toThrow('Join table Ghost not found.');
    });

    it('performs a hash-join (equality operator) and prefixes right-side keys', () => {
      const dbService = {
        tables: {
          Books: makeTable({ rows: [{ id: 'b1', author_id: '1', title: 'Book One' }] })
        }
      };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const leftRows = [{ id: '1', name: 'Alice' }];
      const result = compiler._performJoin(leftRows, {
        type: 'INNER',
        table: 'Books',
        localField: 'id',
        operator: '=',
        foreignField: 'author_id'
      });
      expect(result).toEqual([
        {
          id: '1',
          name: 'Alice',
          'Books.id': 'b1',
          'Books.author_id': '1',
          'Books.title': 'Book One'
        }
      ]);
    });

    it('falls back to nested-loop scanning for non-equality operators', () => {
      const dbService = {
        tables: {
          Ranges: makeTable({
            rows: [
              { id: 'r1', max: 10 },
              { id: 'r2', max: 100 }
            ]
          })
        }
      };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const leftRows = [{ id: 'i1', price: 5 }];
      const result = compiler._performJoin(leftRows, {
        type: 'INNER',
        table: 'Ranges',
        localField: 'price',
        operator: '<=',
        foreignField: 'max'
      });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r['Ranges.id']).sort()).toEqual(['r1', 'r2']);
    });

    it('excludes unmatched left rows for INNER join', () => {
      const dbService = { tables: { Books: makeTable({ rows: [] }) } };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const result = compiler._performJoin([{ id: '1' }], {
        type: 'INNER',
        table: 'Books',
        localField: 'id',
        operator: '=',
        foreignField: 'author_id'
      });
      expect(result).toEqual([]);
    });

    it('includes unmatched left rows with no null-fill when the right table is empty (LEFT)', () => {
      const dbService = { tables: { Books: makeTable({ rows: [] }) } };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const result = compiler._performJoin([{ id: '1', name: 'Alice' }], {
        type: 'LEFT',
        table: 'Books',
        localField: 'id',
        operator: '=',
        foreignField: 'author_id'
      });
      // No right-side columns to know about, so no Books.* null keys are added.
      expect(result).toEqual([{ id: '1', name: 'Alice' }]);
    });

    it('fills right-side columns with null for unmatched left rows (LEFT, non-empty right table)', () => {
      const dbService = {
        tables: { Books: makeTable({ rows: [{ id: 'b1', author_id: '99', title: 'Orphan' }] }) }
      };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const result = compiler._performJoin([{ id: '1', name: 'Alice' }], {
        type: 'LEFT',
        table: 'Books',
        localField: 'id',
        operator: '=',
        foreignField: 'author_id'
      });
      expect(result).toEqual([
        { id: '1', name: 'Alice', 'Books.id': null, 'Books.author_id': null, 'Books.title': null }
      ]);
    });

    it('does not double-fill an existing prefixed key on unmatched LEFT rows', () => {
      const dbService = {
        tables: { Books: makeTable({ rows: [{ id: 'b1', author_id: '99' }] }) }
      };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      // leftRow already carries a 'Books.id' key (e.g., from a prior join step).
      const result = compiler._performJoin([{ id: '1', 'Books.id': 'preexisting' }], {
        type: 'LEFT',
        table: 'Books',
        localField: 'id',
        operator: '=',
        foreignField: 'author_id'
      });
      expect(result[0]['Books.id']).toBe('preexisting');
      expect(result[0]['Books.author_id']).toBeNull();
    });

    it('includes unmatched right rows with left columns null-filled for RIGHT join', () => {
      const dbService = {
        tables: {
          Books: makeTable({ rows: [{ id: 'b1', author_id: '99', title: 'Orphan' }] })
        }
      };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const result = compiler._performJoin([{ id: '1', name: 'Alice' }], {
        type: 'RIGHT',
        table: 'Books',
        localField: 'id',
        operator: '=',
        foreignField: 'author_id'
      });
      expect(result).toHaveLength(1);
      expect(result[0]['Books.title']).toBe('Orphan');
      expect(result[0].id).toBeNull();
      expect(result[0].name).toBeNull();
    });

    it('produces the union of unmatched left and right rows for FULL join', () => {
      const dbService = {
        tables: {
          Books: makeTable({
            rows: [
              { id: 'b1', author_id: '1', title: 'Matched' },
              { id: 'b2', author_id: '99', title: 'Orphan Book' }
            ]
          })
        }
      };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const result = compiler._performJoin(
        [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Orphan Author' }
        ],
        {
          type: 'FULL',
          table: 'Books',
          localField: 'id',
          operator: '=',
          foreignField: 'author_id'
        }
      );
      // Alice+Matched, Orphan Author (null Books.*), Orphan Book (null left)
      expect(result).toHaveLength(3);
      const orphanAuthorRow = result.find((r) => r.name === 'Orphan Author');
      expect(orphanAuthorRow['Books.title']).toBeNull();
      const orphanBookRow = result.find((r) => r['Books.title'] === 'Orphan Book');
      expect(orphanBookRow.name).toBeNull();
    });

    it('handles multiple matches per left row (one-to-many hash join)', () => {
      const dbService = {
        tables: {
          Books: makeTable({
            rows: [
              { id: 'b1', author_id: '1', title: 'First' },
              { id: 'b2', author_id: '1', title: 'Second' }
            ]
          })
        }
      };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const result = compiler._performJoin([{ id: '1', name: 'Alice' }], {
        type: 'INNER',
        table: 'Books',
        localField: 'id',
        operator: '=',
        foreignField: 'author_id'
      });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r['Books.title']).sort()).toEqual(['First', 'Second']);
    });

    it('resolves dotted localField/foreignField specs against prefixed rows', () => {
      const dbService = {
        tables: { Books: makeTable({ rows: [{ id: 'b1', author_id: '1' }] }) }
      };
      const compiler = new AdvancedQueryCompiler(makeFacade({ dbService }));
      const leftRows = [{ 'Authors.id': '1' }];
      const result = compiler._performJoin(leftRows, {
        type: 'INNER',
        table: 'Books',
        localField: 'Authors.id',
        operator: '=',
        foreignField: 'Books.author_id'
      });
      expect(result).toHaveLength(1);
      expect(result[0]['Books.author_id']).toBe('1');
    });
  });

  describe('_tryIndexOptimization()', () => {
    it('returns null when there are no conditions', () => {
      const compiler = new AdvancedQueryCompiler(makeFacade({ conditions: [] }));
      const table = makeTable({ rows: [] });
      expect(compiler._tryIndexOptimization(table)).toBeNull();
    });

    it('uses getRowById for a single primary-key equality condition', () => {
      const rows = [
        { id: 'u1', name: 'Alice' },
        { id: 'u2', name: 'Bob' }
      ];
      const table = makeTable({ rows });
      const facade = makeFacade({
        conditions: [{ field: 'id', operator: '=', value: 'u2', type: 'AND' }]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      const result = compiler._tryIndexOptimization(table);
      expect(table.getRowById).toHaveBeenCalledWith('u2');
      expect(result).toEqual([{ id: 'u2', name: 'Bob' }]);
      expect(facade._optimizedField).toBe('id');
    });

    it('returns an empty array when the primary key lookup misses', () => {
      const table = makeTable({ rows: [{ id: 'u1', name: 'Alice' }] });
      const facade = makeFacade({
        conditions: [{ field: 'id', operator: '=', value: 'ghost', type: 'AND' }]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._tryIndexOptimization(table)).toEqual([]);
    });

    it('probes a secondary index for a single non-AND-equality condition', () => {
      const rows = [
        { id: 'u1', status: 'active' },
        { id: 'u2', status: 'active' },
        { id: 'u3', status: 'inactive' }
      ];
      const table = makeTable({
        rows,
        indices: {
          status: new Map([
            ['active', [0, 1]],
            ['inactive', [2]]
          ])
        }
      });
      const facade = makeFacade({
        conditions: [{ field: 'status', operator: '=', value: 'active', type: 'OR' }]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      const result = compiler._tryIndexOptimization(table);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id).sort()).toEqual(['u1', 'u2']);
      expect(facade._optimizedField).toBe('status');
    });

    it('returns null for a single non-equality, non-indexed condition', () => {
      const table = makeTable({ rows: [] });
      const facade = makeFacade({
        conditions: [{ field: 'age', operator: '>', value: 18, type: 'AND' }]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._tryIndexOptimization(table)).toBeNull();
    });

    it('returns null when multiple conditions are not all AND-equality', () => {
      const table = makeTable({ rows: [] });
      const facade = makeFacade({
        conditions: [
          { field: 'status', operator: '=', value: 'active', type: 'AND' },
          { field: 'age', operator: '>', value: 18, type: 'AND' }
        ]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._tryIndexOptimization(table)).toBeNull();
    });

    it('short-circuits on the primary key among multiple AND-equality conditions', () => {
      const rows = [{ id: 'u1', status: 'active', dept: 'Eng' }];
      const table = makeTable({ rows });
      const facade = makeFacade({
        conditions: [
          { field: 'status', operator: '=', value: 'active', type: 'AND' },
          { field: 'id', operator: '=', value: 'u1', type: 'AND' }
        ]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      const result = compiler._tryIndexOptimization(table);
      expect(table.getRowById).toHaveBeenCalledWith('u1');
      expect(result).toEqual([{ id: 'u1', status: 'active', dept: 'Eng' }]);
    });

    it('picks the lowest-cardinality index among multiple AND-equality conditions and filters the rest', () => {
      const rows = [
        { id: 'u1', status: 'active', dept: 'Eng' },
        { id: 'u2', status: 'active', dept: 'Sales' },
        { id: 'u3', status: 'active', dept: 'Eng' }
      ];
      const table = makeTable({
        rows,
        indices: {
          status: new Map([['active', [0, 1, 2]]]), // cardinality 3
          dept: new Map([
            ['Eng', [0, 2]],
            ['Sales', [1]]
          ]) // cardinality 2 for 'Eng'
        }
      });
      const facade = makeFacade({
        conditions: [
          { field: 'status', operator: '=', value: 'active', type: 'AND' },
          { field: 'dept', operator: '=', value: 'Eng', type: 'AND' }
        ]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      const result = compiler._tryIndexOptimization(table);
      // Should probe 'dept' (cardinality 2) and then filter remaining 'status' condition.
      expect(facade._optimizedField).toBe('dept');
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.dept === 'Eng' && r.status === 'active')).toBe(true);
    });

    it('returns null when no condition field has a usable index', () => {
      const table = makeTable({ rows: [{ id: 'u1', status: 'active', dept: 'Eng' }] });
      const facade = makeFacade({
        conditions: [
          { field: 'status', operator: '=', value: 'active', type: 'AND' },
          { field: 'dept', operator: '=', value: 'Eng', type: 'AND' }
        ]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._tryIndexOptimization(table)).toBeNull();
    });
  });

  describe('_getRemainingConditions()', () => {
    it('returns all conditions when no field was optimized', () => {
      const conditions = [{ field: 'a', operator: '=', value: 1, type: 'AND' }];
      const facade = makeFacade({ conditions });
      facade._optimizedField = null;
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._getRemainingConditions()).toBe(conditions);
    });

    it('excludes the optimized field from the remaining conditions', () => {
      const conditions = [
        { field: 'a', operator: '=', value: 1, type: 'AND' },
        { field: 'b', operator: '=', value: 2, type: 'AND' }
      ];
      const facade = makeFacade({ conditions });
      facade._optimizedField = 'a';
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._getRemainingConditions()).toEqual([
        { field: 'b', operator: '=', value: 2, type: 'AND' }
      ]);
    });
  });

  describe('_getFieldValue()', () => {
    it('resolves a direct key', () => {
      const facade = makeFacade({ tableName: 'Users' });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._getFieldValue({ name: 'Alice' }, 'name')).toBe('Alice');
    });

    it('resolves via the facade tableName prefix', () => {
      const facade = makeFacade({ tableName: 'Users' });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._getFieldValue({ 'Users.name': 'Alice' }, 'name')).toBe('Alice');
    });

    it('resolves via a suffix scan for other prefixes', () => {
      const facade = makeFacade({ tableName: 'Users' });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._getFieldValue({ 'Accounts.name': 'Alice' }, 'name')).toBe('Alice');
    });

    it('returns undefined when nothing matches', () => {
      const facade = makeFacade({ tableName: 'Users' });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._getFieldValue({}, 'name')).toBeUndefined();
    });
  });

  describe('_applyConditionsFiltered() / _applyConditions()', () => {
    it('applies ordinary conditions without requiring a database service', () => {
      const compiler = new AdvancedQueryCompiler(makeFacade({ tableName: 'Users' }));

      expect(compiler._applyConditionsFiltered(
        [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 20 }],
        [{ field: 'age', operator: '>=', value: 25, type: 'AND' }]
      )).toEqual([{ name: 'Alice', age: 30 }]);
    });

    it('applies AND semantics across all conditions', () => {
      const facade = makeFacade({ tableName: 'Users' });
      const compiler = new AdvancedQueryCompiler(facade);
      const rows = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 20 }
      ];
      const conditions = [
        { field: 'age', operator: '>=', value: 25, type: 'AND' },
        { field: 'name', operator: '=', value: 'Alice', type: 'AND' }
      ];
      expect(compiler._applyConditionsFiltered(rows, conditions)).toEqual([
        { name: 'Alice', age: 30 }
      ]);
    });

    it('applies OR semantics when mixed with AND', () => {
      const facade = makeFacade({ tableName: 'Users' });
      const compiler = new AdvancedQueryCompiler(facade);
      const rows = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 20 },
        { name: 'Carl', age: 40 }
      ];
      // AND age>=100 (false) OR name=Bob (true) -> per-row OR overrides
      const conditions = [
        { field: 'age', operator: '>=', value: 100, type: 'AND' },
        { field: 'name', operator: '=', value: 'Bob', type: 'OR' }
      ];
      const result = compiler._applyConditionsFiltered(rows, conditions);
      expect(result.map((r) => r.name)).toEqual(['Bob']);
    });

    it('returns an empty array for an empty input set', () => {
      const facade = makeFacade({ tableName: 'Users' });
      const compiler = new AdvancedQueryCompiler(facade);
      expect(
        compiler._applyConditionsFiltered([], [{ field: 'a', operator: '=', value: 1 }])
      ).toEqual([]);
    });

    it('_applyConditions() delegates to facade.conditions', () => {
      const facade = makeFacade({
        tableName: 'Users',
        conditions: [{ field: 'age', operator: '>', value: 25, type: 'AND' }]
      });
      const compiler = new AdvancedQueryCompiler(facade);
      const rows = [{ age: 30 }, { age: 10 }];
      expect(compiler._applyConditions(rows)).toEqual([{ age: 30 }]);
    });
  });

  describe('_applyGroupBy()', () => {
    it('returns an empty array for empty/null input', () => {
      const facade = makeFacade({ tableName: 'Users' });
      facade.groupByFields = ['dept'];
      facade.aggregations = [];
      const compiler = new AdvancedQueryCompiler(facade);
      expect(compiler._applyGroupBy([])).toEqual([]);
      expect(compiler._applyGroupBy(null)).toEqual([]);
    });

    it('groups rows and computes aggregations per group', () => {
      const facade = makeFacade({ tableName: 'Products' });
      facade.groupByFields = ['category'];
      facade.aggregations = [
        { alias: 'total', calculate: (group) => group.reduce((s, r) => s + r.price, 0) }
      ];
      const compiler = new AdvancedQueryCompiler(facade);
      const rows = [
        { category: 'Books', price: 10 },
        { category: 'Books', price: 20 },
        { category: 'Toys', price: 5 }
      ];
      const result = compiler._applyGroupBy(rows);
      expect(result).toHaveLength(2);
      const books = result.find((r) => r.category === 'Books');
      expect(books.total).toBe(30);
      const toys = result.find((r) => r.category === 'Toys');
      expect(toys.total).toBe(5);
    });

    it('treats null grouping values as a shared NULL bucket', () => {
      const facade = makeFacade({ tableName: 'Products' });
      facade.groupByFields = ['category'];
      facade.aggregations = [];
      const compiler = new AdvancedQueryCompiler(facade);
      const rows = [{ category: null }, { category: null }, { category: 'Toys' }];
      const result = compiler._applyGroupBy(rows);
      expect(result).toHaveLength(2);
    });

    it('supports multi-field grouping', () => {
      const facade = makeFacade({ tableName: 'Sales' });
      facade.groupByFields = ['region', 'quarter'];
      facade.aggregations = [];
      const compiler = new AdvancedQueryCompiler(facade);
      const rows = [
        { region: 'EU', quarter: 'Q1' },
        { region: 'EU', quarter: 'Q2' },
        { region: 'US', quarter: 'Q1' }
      ];
      const result = compiler._applyGroupBy(rows);
      expect(result).toHaveLength(3);
    });
  });
});

describe('QueryCache', () => {
  // NOTE: QueryCache already has broad direct coverage in
  // src/query/__tests__/AdvancedQueryBuilder.test.js. This block only
  // adds the JSON-parse-failure path, which was not previously covered.
  it('returns null when the cached payload is corrupted JSON', () => {
    const service = {
      get: jest.fn(() => '{not-valid-json'),
      put: jest.fn(),
      removeAll: jest.fn()
    };
    const cache = new QueryCache(service);
    const query = { selectedColumns: ['*'], tableName: 'Users', conditions: [] };
    expect(cache.get(query)).toBeNull();
  });

  it('returns null when the cache service returns undefined', () => {
    const service = { get: jest.fn(() => undefined), put: jest.fn(), removeAll: jest.fn() };
    const cache = new QueryCache(service);
    const query = { selectedColumns: ['*'], tableName: 'Users', conditions: [] };
    expect(cache.get(query)).toBeNull();
  });
});
