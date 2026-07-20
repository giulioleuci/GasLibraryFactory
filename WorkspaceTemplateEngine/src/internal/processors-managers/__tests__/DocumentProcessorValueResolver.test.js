// ===================================================================
// FILE: WorkspaceTemplateEngine/src/internal/processors-managers/__tests__/DocumentProcessorValueResolver.test.js
// ===================================================================
// Direct unit tests for DocumentProcessorValueResolver, exercised against a
// minimal fake facade rather than through the full DocumentProcessor. This
// isolates _applyFilters (the highest cognitive-complexity method in the
// repo) and its helpers (_sortByProperty, _getNestedProperty) from the
// document-scanning/template concerns owned by DocumentProcessor.
// ===================================================================

import { DocumentProcessorValueResolver } from '../DocumentProcessorValueResolver';

function createFacade({ strictFilters = false } = {}) {
  const logger = {
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  };
  const mustache = {
    getValue: jest.fn((path, obj) => (obj == null ? undefined : obj[path]))
  };
  return { strictFilters, logger, mustache };
}

describe('DocumentProcessorValueResolver - Direct Unit Tests', () => {
  let facade;
  let resolver;

  beforeEach(() => {
    facade = createFacade();
    resolver = new DocumentProcessorValueResolver(facade);
    // Mirror DocumentProcessor's real wiring: the facade re-exposes
    // _getNestedProperty as a delegate back onto the resolver itself
    // (see DocumentProcessor.js's `methods: [...]` delegation list), since
    // _sortByProperty calls `this.facade._getNestedProperty(...)`.
    facade._getNestedProperty = (obj, path) => resolver._getNestedProperty(obj, path);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('stores the facade reference', () => {
      expect(resolver.facade).toBe(facade);
    });
  });

  // ===================================================================
  // _applyFilters - guard clauses
  // ===================================================================
  describe('_applyFilters() - guard clauses', () => {
    it('returns the input unchanged when array is not an array', () => {
      expect(resolver._applyFilters('not-an-array', [{ name: 'reverse', args: [] }])).toBe(
        'not-an-array'
      );
      expect(resolver._applyFilters(null, [{ name: 'reverse', args: [] }])).toBe(null);
    });

    it('returns the input unchanged when filters is falsy', () => {
      const arr = [1, 2, 3];
      expect(resolver._applyFilters(arr, null)).toBe(arr);
      expect(resolver._applyFilters(arr, undefined)).toBe(arr);
    });

    it('returns the input unchanged when filters is empty', () => {
      const arr = [1, 2, 3];
      expect(resolver._applyFilters(arr, [])).toBe(arr);
    });
  });

  // ===================================================================
  // sortBy filter
  // ===================================================================
  describe("_applyFilters() - 'sortBy' filter", () => {
    it('sorts by the given string property (case-insensitive)', () => {
      const data = [{ name: 'banana' }, { name: 'Apple' }, { name: 'cherry' }];
      const result = resolver._applyFilters(data, [{ name: 'sortBy', args: ['name'] }]);
      expect(result.map((x) => x.name)).toEqual(['Apple', 'banana', 'cherry']);
    });

    it('sorts numerically for numeric properties', () => {
      const data = [{ n: 3 }, { n: 1 }, { n: 2 }];
      const result = resolver._applyFilters(data, [{ name: 'sortBy', args: ['n'] }]);
      expect(result.map((x) => x.n)).toEqual([1, 2, 3]);
    });

    it('pushes null/undefined values to the end', () => {
      const data = [{ n: 2 }, { n: null }, { n: 1 }, { n: undefined }];
      const result = resolver._applyFilters(data, [{ name: 'sortBy', args: ['n'] }]);
      expect(result.map((x) => x.n)).toEqual([1, 2, null, undefined]);
    });

    it('does not mutate the original array', () => {
      const data = [{ n: 2 }, { n: 1 }];
      resolver._applyFilters(data, [{ name: 'sortBy', args: ['n'] }]);
      expect(data.map((x) => x.n)).toEqual([2, 1]);
    });

    it('warns and ignores the filter when no argument is given (non-strict)', () => {
      const data = [{ n: 2 }, { n: 1 }];
      const result = resolver._applyFilters(data, [{ name: 'sortBy', args: [] }]);
      expect(result).toEqual(data); // unchanged
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'sortBy' requires a property name argument")
      );
    });

    it('throws when no argument is given (strict mode)', () => {
      facade.strictFilters = true;
      const data = [{ n: 2 }, { n: 1 }];
      expect(() => resolver._applyFilters(data, [{ name: 'sortBy', args: [] }])).toThrow(
        "Error applying filter 'sortBy': Filter 'sortBy' requires a property name argument"
      );
    });
  });

  // ===================================================================
  // reverse filter
  // ===================================================================
  describe("_applyFilters() - 'reverse' filter", () => {
    it('reverses the array', () => {
      const data = [1, 2, 3];
      const result = resolver._applyFilters(data, [{ name: 'reverse', args: [] }]);
      expect(result).toEqual([3, 2, 1]);
    });

    it('does not mutate the original array', () => {
      const data = [1, 2, 3];
      resolver._applyFilters(data, [{ name: 'reverse', args: [] }]);
      expect(data).toEqual([1, 2, 3]);
    });
  });

  // ===================================================================
  // limit filter
  // ===================================================================
  describe("_applyFilters() - 'limit' filter", () => {
    it('limits the array to the given count', () => {
      const data = [1, 2, 3, 4, 5];
      const result = resolver._applyFilters(data, [{ name: 'limit', args: ['2'] }]);
      expect(result).toEqual([1, 2]);
    });

    it('handles a limit larger than the array length', () => {
      const data = [1, 2];
      const result = resolver._applyFilters(data, [{ name: 'limit', args: ['10'] }]);
      expect(result).toEqual([1, 2]);
    });

    it('handles a limit of zero', () => {
      const data = [1, 2, 3];
      const result = resolver._applyFilters(data, [{ name: 'limit', args: ['0'] }]);
      expect(result).toEqual([]);
    });

    it('warns and ignores the filter when no argument is given (non-strict)', () => {
      const data = [1, 2, 3];
      const result = resolver._applyFilters(data, [{ name: 'limit', args: [] }]);
      expect(result).toEqual(data);
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'limit' requires a number argument")
      );
    });

    it('throws when no argument is given (strict mode)', () => {
      facade.strictFilters = true;
      expect(() => resolver._applyFilters([1, 2, 3], [{ name: 'limit', args: [] }])).toThrow(
        "Error applying filter 'limit': Filter 'limit' requires a number argument"
      );
    });

    it('warns and ignores the filter for a negative limit (non-strict)', () => {
      const data = [1, 2, 3];
      const result = resolver._applyFilters(data, [{ name: 'limit', args: ['-1'] }]);
      expect(result).toEqual(data);
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'limit' requires a valid non-negative integer, got: -1")
      );
    });

    it('throws for a negative limit (strict mode)', () => {
      facade.strictFilters = true;
      expect(() => resolver._applyFilters([1, 2, 3], [{ name: 'limit', args: ['-1'] }])).toThrow(
        "Error applying filter 'limit': Filter 'limit' requires a valid non-negative integer, got: -1"
      );
    });

    it('warns and ignores the filter for a non-numeric limit (non-strict)', () => {
      const data = [1, 2, 3];
      const result = resolver._applyFilters(data, [{ name: 'limit', args: ['abc'] }]);
      expect(result).toEqual(data);
      expect(facade.logger.warn).toHaveBeenCalledWith(expect.stringContaining('got: abc'));
    });
  });

  // ===================================================================
  // filter filter
  // ===================================================================
  describe("_applyFilters() - 'filter' filter", () => {
    it('filters by property/value equality', () => {
      const data = [{ status: 'active' }, { status: 'inactive' }, { status: 'active' }];
      const result = resolver._applyFilters(data, [{ name: 'filter', args: ['status', 'active'] }]);
      expect(result).toEqual([{ status: 'active' }, { status: 'active' }]);
    });

    it('warns and ignores the filter with fewer than two arguments (non-strict)', () => {
      const data = [{ status: 'active' }];
      const result = resolver._applyFilters(data, [{ name: 'filter', args: ['status'] }]);
      expect(result).toEqual(data);
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'filter' requires two arguments")
      );
    });

    it('throws with fewer than two arguments (strict mode)', () => {
      facade.strictFilters = true;
      expect(() =>
        resolver._applyFilters([{ status: 'active' }], [{ name: 'filter', args: ['status'] }])
      ).toThrow(/Filter 'filter' requires two arguments/);
    });
  });

  // ===================================================================
  // unknown filter
  // ===================================================================
  describe('_applyFilters() - unknown filter name', () => {
    it('warns and ignores unknown filters (non-strict)', () => {
      const data = [1, 2, 3];
      const result = resolver._applyFilters(data, [{ name: 'unknownFilter', args: [] }]);
      expect(result).toEqual(data);
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'unknownFilter' not supported")
      );
    });

    it('throws for unknown filters (strict mode)', () => {
      facade.strictFilters = true;
      expect(() =>
        resolver._applyFilters([1, 2, 3], [{ name: 'unknownFilter', args: [] }])
      ).toThrow("Filter 'unknownFilter' not supported");
    });
  });

  // ===================================================================
  // filter throwing internally / chained filters
  // ===================================================================
  describe('_applyFilters() - error handling and chaining', () => {
    it('wraps and rethrows an internally-thrown error for a filter body (strict mode)', () => {
      // sortBy triggers _sortByProperty -> facade.mustache.getValue; force it to throw
      facade.mustache.getValue = jest.fn(() => {
        throw new Error('lookup exploded');
      });
      facade.strictFilters = true;
      const data = [{ a: 1 }, { a: 2 }];
      expect(() => resolver._applyFilters(data, [{ name: 'sortBy', args: ['a'] }])).toThrow(
        "Error applying filter 'sortBy': lookup exploded"
      );
    });

    it('logs a warning and ignores the filter when it throws internally (non-strict)', () => {
      facade.mustache.getValue = jest.fn(() => {
        throw new Error('lookup exploded');
      });
      const data = [{ a: 1 }, { a: 2 }];
      const result = resolver._applyFilters(data, [{ name: 'sortBy', args: ['a'] }]);
      expect(result).toEqual(data); // filter ignored, chain continues with prior result
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Error applying filter 'sortBy': lookup exploded")
      );
    });

    it('applies multiple chained filters in sequence', () => {
      const data = [
        { status: 'active', n: 3 },
        { status: 'active', n: 1 },
        { status: 'inactive', n: 2 }
      ];
      const result = resolver._applyFilters(data, [
        { name: 'filter', args: ['status', 'active'] },
        { name: 'sortBy', args: ['n'] },
        { name: 'reverse', args: [] },
        { name: 'limit', args: ['1'] }
      ]);
      expect(result).toEqual([{ status: 'active', n: 3 }]);
    });

    it('continues applying subsequent filters after one is ignored (non-strict)', () => {
      const data = [3, 1, 2];
      const result = resolver._applyFilters(data, [
        { name: 'unknownFilter', args: [] }, // ignored, warns
        { name: 'reverse', args: [] } // still applied
      ]);
      expect(result).toEqual([2, 1, 3]);
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Filter 'unknownFilter' not supported")
      );
    });

    it('stops the chain immediately when a filter throws in strict mode', () => {
      facade.strictFilters = true;
      const data = [3, 1, 2];
      expect(() =>
        resolver._applyFilters(data, [
          { name: 'unknownFilter', args: [] },
          { name: 'reverse', args: [] }
        ])
      ).toThrow("Filter 'unknownFilter' not supported");
    });
  });

  // ===================================================================
  // _sortByProperty
  // ===================================================================
  describe('_sortByProperty()', () => {
    it('delegates property lookup to facade.mustache.getValue via _getNestedProperty', () => {
      const data = [{ a: 2 }, { a: 1 }];
      const result = resolver._sortByProperty(data, 'a');
      expect(result.map((x) => x.a)).toEqual([1, 2]);
      expect(facade.mustache.getValue).toHaveBeenCalledWith('a', { a: 2 });
    });

    it('does not mutate the original array', () => {
      const data = [{ a: 2 }, { a: 1 }];
      resolver._sortByProperty(data, 'a');
      expect(data.map((x) => x.a)).toEqual([2, 1]);
    });
  });

  // ===================================================================
  // _getNestedProperty
  // ===================================================================
  describe('_getNestedProperty()', () => {
    it('delegates to facade.mustache.getValue', () => {
      const obj = { nested: { value: 42 } };
      facade.mustache.getValue = jest.fn(() => 42);
      const result = resolver._getNestedProperty(obj, 'nested.value');
      expect(facade.mustache.getValue).toHaveBeenCalledWith('nested.value', obj);
      expect(result).toBe(42);
    });
  });
});
