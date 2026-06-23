/**
 * @file SheetDBLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for SheetDBLib services.
 * @version 1.0.0
 */

/**
 * @class AdvancedQueryBuilderMock
 * @description High-fidelity Jest-based mock for AdvancedQueryBuilder.
 * Simulates fluent API chaining and provides methods to inject return data for distributed or local query tests.
 *
 * @example
 * const mock = new AdvancedQueryBuilderMock().setReturnData([{ id: 1 }]);
 */
export class AdvancedQueryBuilderMock {
  constructor() {
    this.select = jest.fn().mockReturnThis();
    this.from = jest.fn().mockReturnThis();
    this.where = jest.fn().mockReturnThis();
    this.andWhere = jest.fn().mockReturnThis();
    this.orWhere = jest.fn().mockReturnThis();
    this.orderBy = jest.fn().mockReturnThis();
    this.groupBy = jest.fn().mockReturnThis();
    this.limit = jest.fn().mockReturnThis();
    this.offset = jest.fn().mockReturnThis();
    
    // Joins
    this.innerJoin = jest.fn().mockReturnThis();
    this.leftJoin = jest.fn().mockReturnThis();
    this.rightJoin = jest.fn().mockReturnThis();
    this.fullOuterJoin = jest.fn().mockReturnThis();
    
    // Execution
    this.execute = jest.fn(() => []);
    this.count = jest.fn(() => 0);
    this.sum = jest.fn(() => 0);
    this.avg = jest.fn(() => 0);
    this.min = jest.fn(() => null);
    this.max = jest.fn(() => null);
  }

  /**
   * @description Injects data into the execute() mock and updates count() based on array length.
   * @param {Object[]} data - Collection of records to return.
   * @returns {AdvancedQueryBuilderMock} Current instance for chaining.
   */
  setReturnData(data) {
    this.execute.mockReturnValue(data);
    this.count.mockReturnValue(data.length);
    return this;
  }
}

/**
 * @class TableServiceMock
 * @description Mock implementation of TableService for unit testing CRUD logic.
 * Manages an internal array of records and simulates primary key generation and indexing.
 */
export class TableServiceMock {
  /**
   * @param {string} [name='TestTable'] - Logical table name.
   */
  constructor(name = 'TestTable') {
    this.name = name;
    this._data = [];
    
    this.insertRow = jest.fn((row) => {
      const newRow = { ...row, id: row.id || `mock-id-${Math.random().toString(36).substr(2, 9)}` };
      this._data.push(newRow);
      return newRow;
    });
    this.insertRows = jest.fn((rows) => rows.map((r) => this.insertRow(r)));
    
    this.updateRow = jest.fn((id, row) => {
      const index = this._data.findIndex(r => r.id === id);
      if (index !== -1) {
        this._data[index] = { ...this._data[index], ...row };
        return this._data[index];
      }
      return { ...row, id };
    });
    this.updateRowById = this.updateRow;
    
    this.patchRow = jest.fn((id, partial) => {
      const index = this._data.findIndex(r => r.id === id);
      if (index !== -1) {
        this._data[index] = { ...this._data[index], ...partial };
        return this._data[index];
      }
      return { ...partial, id };
    });
    
    this.deleteRow = jest.fn((id) => {
      const index = this._data.findIndex(r => r.id === id);
      const deleted = index !== -1 ? this._data.splice(index, 1)[0] : null;
      return deleted;
    });
    this.deleteRowById = this.deleteRow;
    
    this.findById = jest.fn((id) => this._data.find(r => r.id === id) || null);
    this.getByPK = this.findById;
    
    this.findAll = jest.fn(() => [...this._data]);
    this.getAllRows = this.findAll;
    
    this.getRow = jest.fn((index) => this._data[index] || null);
    this.getRows = jest.fn((start, limit) => {
      if (start === undefined) return [...this._data];
      return this._data.slice(start, start + limit);
    });
    this.getRowsWhere = jest.fn((predicate) => this._data.filter(predicate));
    this.upsertRow = jest.fn((row) => (row.id ? this.updateRow(row.id, row) : this.insertRow(row)));
    this.clear = jest.fn(() => {
      this._data = [];
      return this;
    });
    this.deleteAllRows = jest.fn(() => {
      this._data = [];
      return true;
    });
    
    this.getName = jest.fn(() => this.name);
    this.getSchema = jest.fn(() => ({ fields: [] }));
    this.count = jest.fn(() => this._data.length);
    
    // Internal state for optimization
    this._indices = {};
  }

  /**
   * @description Pre-populates the mock table with a collection of records.
   * @param {Object[]} data - Records to load into memory.
   * @returns {TableServiceMock} Current instance for chaining.
   */
  setData(data) {
    this._data = [...data];
    return this;
  }
}

/**
 * @class DatabaseServiceMock
 * @description High-fidelity mock for DatabaseService.
 * Orchestrates TableServiceMock instances and provides a unified interface for mocking database-wide operations.
 */
export class DatabaseServiceMock {
  /**
   * @param {Object} [logger=null] - Mock logger.
   * @param {Object} [utils=null] - Mock CoreUtilsLib.
   * @param {Object} [cache=null] - Mock CacheService.
   * @param {Object} [exceptionService=null] - Mock GasResilienceLib.
   */
  constructor(logger = null, utils = null, cache = null, exceptionService = null) {
    this._logger = logger;
    this._utils = utils;
    this._cache = cache;
    this._exceptionService = exceptionService;
    
    this._builder = new AdvancedQueryBuilderMock();
    this.select = jest.fn(() => this._builder);
    this.getTable = jest.fn((name) => this.tables[name] || new TableServiceMock(name));
    this.createTable = jest.fn((name) => this.tables[name] || new TableServiceMock(name));
    this.deleteTable = jest.fn().mockReturnThis();
    this.listTables = jest.fn(() => Object.keys(this.tables));
    this.transaction = jest.fn((fn) => fn());
    this.flush = jest.fn().mockReturnThis();
    this.save = jest.fn().mockReturnThis();
    this.getSpreadsheetId = jest.fn(() => 'mock-ss-id');
    
    /**
     * Map of table name to TableServiceMock instances.
     * @type {Object<string, TableServiceMock>}
     */
    this.tables = {};
  }

  /**
   * @description Manually registers a TableServiceMock for specific lookup tests.
   * @param {string} name - Logical table identifier.
   * @param {TableServiceMock} [mock] - Custom mock instance or auto-generated if omitted.
   * @returns {TableServiceMock} The registered table mock.
   */
  registerTable(name, mock) {
    const tableMock = mock || new TableServiceMock(name);
    this.tables[name] = tableMock;
    return tableMock;
  }
}
