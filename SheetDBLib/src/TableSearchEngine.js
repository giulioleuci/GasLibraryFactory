import Fuse from 'fuse.js';

/**
 * @class TableSearchEngine
 * @description Internal engine for O(1) indexed lookups and Fuse.js fuzzy matching on TableService data.
 */
export class TableSearchEngine {
  /**
   * @constructor
   * @param {TableService} facade - Parent service instance.
   */
  constructor(facade) {
    this.facade = facade;
  }

  /**
   * @function fuzzySearch
   * @description Executes fuzzy match using Fuse.js across specified fields.
   * @param {string} query - Search term.
   * @param {string[]} fields - Columns to inspect.
   * @param {number} [threshold=0.3] - Fuse.js sensitivity (0.0 to 1.0).
   * @param {Object} [options={}] - Fuse.js configuration overrides.
   * @returns {Object[]} Fuse.js result objects (item, refIndex, score).
   * @throws {Error} If query is non-string or fields array is empty.
   */
  fuzzySearch(query, fields, threshold = 0.3, options = {}) {
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      throw new Error('Fields must be a non-empty array of field names');
    }

    // Validate threshold
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be a number between 0 and 1');
    }

    this.facade._ensureDataLoaded();

    // Get rows with virtual columns applied
    const rows = this.facade.getRows();

    // Configure Fuse.js
    const fuseOptions = {
      keys: fields,
      threshold: threshold,
      includeScore: true,
      ...options
    };

    // Create Fuse instance and search
    const fuse = new Fuse(rows, fuseOptions);
    const results = fuse.search(query);

    this.facade._logger.debug(
      `Fuzzy search for "${query}" in fields [${fields.join(', ')}] ` +
        `returned ${results.length} results (threshold: ${threshold})`
    );

    return results;
  }

  /**
   * @function createIndex
   * @description Builds a Map-based memory index for O(1) lookups on a specific column.
   * @param {string} columnName - Target physical column.
   * @returns {TableService} The facade for chaining.
   * @throws {Error} If columnName is missing from table schema.
   */
  createIndex(columnName) {
    if (!this.facade.columns.includes(columnName)) {
      throw new Error(`Cannot create index on non-existent column: ${columnName}`);
    }

    this.facade._ensureDataLoaded();

    // Build the index as a Map from column value -> array of row indices
    const index = new Map();
    this.facade._rowsCache.forEach((row, rowIndex) => {
      const value = row[columnName];
      if (value !== null && value !== undefined) {
        if (!index.has(value)) {
          index.set(value, []);
        }
        index.get(value).push(rowIndex);
      }
    });

    this.facade._indices[columnName] = index;
    this.facade._logger.debug(`Index created on column "${columnName}" with ${index.size} unique values`);
    return this.facade;
  }

  /**
   * @function indexedLookup
   * @description Performs exact value lookup using pre-built memory index.
   * @param {string} columnName - Target physical column.
   * @param {*} value - Value to find.
   * @returns {Object[]|null} Array of matching rows or null if no index exists.
   */
  indexedLookup(columnName, value) {
    if (!this.facade._indices[columnName]) {
      return null; // No index available
    }

    const index = this.facade._indices[columnName];
    const rowIndices = index.get(value);

    if (!rowIndices) {
      return []; // No matches
    }

    // Return copies of the matching rows with virtual columns applied
    return rowIndices.map((idx) => this.facade._applyVirtualColumns({ ...this.facade._rowsCache[idx] }));
  }

  /**
   * @function invalidateIndex
   * @description Purges memory indices.
   * @param {string|null} [columnName=null] - Specific column ID or null for global purge.
   */
  invalidateIndex(columnName = null) {
    if (columnName) {
      delete this.facade._indices[columnName];
    } else {
      this.facade._indices = {};
    }
  }
}
