import type { fn as jestFn, spyOn as jestSpyOn, Mock, MockedFunction } from 'jest-mock';
import type {
  RowRecord,
  RowIndices,
  TableLogger,
  QueryCacheService,
  GoogleRetryExecutor
} from '../types.js';
declare const jest: { fn: typeof jestFn; spyOn: typeof jestSpyOn };
/**
 * @file SheetDBLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for SheetDBLib services.
 * @version 1.0.0
 */

import { TableService } from '../TableService.js';
import { AdvancedQueryBuilder } from '../query/AdvancedQueryBuilder.js';

/**
 * @class TableServiceMock
 * @description Mock implementation of TableService for unit testing CRUD logic.
 * Manages an internal array of records and simulates primary key generation and indexing.
 */
export class TableServiceMock<Row extends object = RowRecord> {
  declare name: string;
  declare _data: Row[];
  declare fuzzySearchRows: TableService['fuzzySearchRows'];
  declare insertRow: Mock<(row: Row) => Row>;
  declare insertRows: Mock<(rows: Row[]) => Row[]>;
  declare updateRow: Mock<(id: unknown, row: Partial<Row>) => Partial<Row>>;
  declare updateRowById: TableServiceMock<Row>['updateRow'];
  declare patchRow: Mock<(id: unknown, partial: Partial<Row>) => Partial<Row>>;
  declare deleteRow: Mock<(id: unknown) => Row | null>;
  declare deleteRowById: TableServiceMock<Row>['deleteRow'];
  declare findById: Mock<(id: unknown) => Row | null>;
  declare getRowById: TableServiceMock<Row>['findById'];
  declare _rowsCache: Row[];
  declare _ensureDataLoaded: () => void;
  declare getByPK: TableServiceMock<Row>['findById'];
  declare findAll: Mock<() => Row[]>;
  declare getAllRows: TableServiceMock<Row>['findAll'];
  declare getRow: Mock<(index: number) => Row | null>;
  declare getRows: Mock<(start?: number, limit?: number) => Row[]>;
  declare getRowsWhere: Mock<(predicate: (row: Row) => boolean) => Row[]>;
  declare upsertRow: Mock<(row: Row) => Partial<Row>>;
  declare clear: Mock<() => this>;
  declare deleteAllRows: Mock<() => boolean>;
  declare getName: Mock<() => string>;
  declare getSchema: Mock<() => { fields: unknown[] }>;
  declare count: Mock<() => number>;
  declare _indices: RowIndices;

  /**
   * @param {string} [name='TestTable'] - Logical table name.
   */
  constructor(name = 'TestTable') {
    this.name = name;
    this._data = [];
    // fuzzySearchRows is a pure function of its (rows, query, fields, threshold, options)
    // arguments — it doesn't touch table internals — so the real TableService
    // implementation can be reused directly here for high-fidelity fuzzy-search mocking.
    this.fuzzySearchRows = TableService.prototype.fuzzySearchRows;

    this.insertRow = jest.fn((row: Row) => {
      const newRow = {
        ...row,
        id: (row as RowRecord).id || `mock-id-${Math.random().toString(36).substr(2, 9)}`
      };
      this._data.push(newRow);
      return newRow;
    });
    this.insertRows = jest.fn((rows) => rows.map((r) => this.insertRow(r)));

    this.updateRow = jest.fn((id, row) => {
      const index = this._data.findIndex((r) => (r as RowRecord).id === id);
      if (index !== -1) {
        this._data[index] = { ...this._data[index], ...row };
        return this._data[index];
      }
      return { ...row, id };
    });
    this.updateRowById = this.updateRow;

    this.patchRow = jest.fn((id, partial) => {
      const index = this._data.findIndex((r) => (r as RowRecord).id === id);
      if (index !== -1) {
        this._data[index] = { ...this._data[index], ...partial };
        return this._data[index];
      }
      return { ...partial, id };
    });

    this.deleteRow = jest.fn((id) => {
      const index = this._data.findIndex((r) => (r as RowRecord).id === id);
      const deleted = index !== -1 ? this._data.splice(index, 1)[0] : null;
      return deleted;
    });
    this.deleteRowById = this.deleteRow;

    this.findById = jest.fn((id) => this._data.find((r) => (r as RowRecord).id === id) || null);
    this.getByPK = this.findById;
    this.getRowById = this.findById;
    this._ensureDataLoaded = () => {
      this._rowsCache = this._data;
    };

    this.findAll = jest.fn(() => [...this._data]);
    this.getAllRows = this.findAll;

    this.getRow = jest.fn((index) => this._data[index] || null);
    this.getRows = jest.fn((start, limit) => {
      if (start === undefined) {
        return [...this._data];
      }
      return this._data.slice(start, start + limit!);
    });
    this.getRowsWhere = jest.fn((predicate) => this._data.filter(predicate));
    this.upsertRow = jest.fn((row) =>
      (row as RowRecord).id ? this.updateRow((row as RowRecord).id, row) : this.insertRow(row)
    );
    this.clear = jest.fn(() => {
      this._data = [];
      return this;
    });
    this.deleteAllRows = jest.fn(() => {
      this._data = [];
      return true;
    });

    this.getName = jest.fn(() => this.name);
    this.getSchema = jest.fn(() => ({ fields: [] as unknown[] }));
    this.count = jest.fn(() => this._data.length);

    // Internal state for optimization
    this._indices = {};
  }

  /**
   * @description Pre-populates the mock table with a collection of records.
   * @param {Object[]} data - Records to load into memory.
   * @returns {TableServiceMock} Current instance for chaining.
   */
  setData(data: Row[]) {
    this._data = [...data];
    return this;
  }
}

/**
 * @class DatabaseServiceMock
 * @description High-fidelity mock for DatabaseService.
 * Orchestrates TableServiceMock instances and provides a unified interface for mocking database-wide operations.
 */
export class DatabaseServiceMock<Row extends object = RowRecord> {
  declare _logger: TableLogger | null;
  declare _utils: object | null;
  declare _cache: QueryCacheService | null;
  declare _exceptionService: GoogleRetryExecutor | null;
  declare _builder: AdvancedQueryBuilder<Row>;
  declare tables: Record<string, TableServiceMock<Row>>;
  declare select: Mock<(fields?: string | string[]) => AdvancedQueryBuilder<Row>>;
  declare getTable: Mock<(name: string) => TableServiceMock<Row>>;
  declare createTable: Mock<(name: string) => TableServiceMock<Row>>;
  declare deleteTable: Mock<(...args: unknown[]) => this>;
  declare listTables: Mock<() => string[]>;
  declare transaction: MockedFunction<<T>(fn: () => T) => T>;
  declare flush: Mock<() => this>;
  declare save: Mock<() => this>;
  declare getSpreadsheetId: Mock<() => string>;

  /**
   * @param {Object} [logger=null] - Mock logger.
   * @param {Object} [utils=null] - Mock CoreUtilsLib.
   * @param {Object} [cache=null] - Mock CacheService.
   * @param {Object} [exceptionService=null] - Mock GasResilienceLib.
   */
  constructor(
    logger: TableLogger | null = null,
    utils: object | null = null,
    cache: QueryCacheService | null = null,
    exceptionService: GoogleRetryExecutor | null = null
  ) {
    this._logger = logger;
    this._utils = utils;
    this._cache = cache;
    this._exceptionService = exceptionService;

    this._builder = new AdvancedQueryBuilder<Row>(this);
    this._builder._validator.validateTable = jest.fn();
    this._builder._validator.validateJoin = jest.fn();
    jest.spyOn(this._builder, 'from');
    jest.spyOn(this._builder, 'where');
    this.select = jest.fn(() => this._builder);
    this.getTable = jest.fn((name) => this.tables[name] || new TableServiceMock<Row>(name));
    this.createTable = jest.fn((name) => this.tables[name] || new TableServiceMock<Row>(name));
    this.deleteTable = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.listTables = jest.fn(() => Object.keys(this.tables));
    this.transaction = jest.fn(<T>(fn: () => T) => fn()) as MockedFunction<<T>(fn: () => T) => T>;
    this.flush = jest.fn<() => this>().mockReturnThis();
    this.save = jest.fn<() => this>().mockReturnThis();
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
  registerTable(name: string, mock?: TableServiceMock<Row>) {
    const tableMock = mock || new TableServiceMock<Row>(name);
    this.tables[name] = tableMock;
    return tableMock;
  }
}
