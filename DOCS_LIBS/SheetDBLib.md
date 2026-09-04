# API Reference: SheetDBLib

## CLASS: TableService
**File Path:** `SheetDBLib/src/TableService.js`
**Constructor Usage:** `const instance = new TableService();`
**Description:** Service for representing and managing a single table (sheet) in a Google Spreadsheet.

Provides ORM-lite operations for individual sheets with advanced features:
- Full CRUD operations with batch optimization
- Schema validation with type checking and custom validators
- Virtual computed columns for dynamic fields
- Fuzzy search using Fuse.js
- Indexing for O(1) lookups
- Dirty checking to skip unnecessary writes
- Lazy or eager loading modes


@requires GoogleApiWrapper - SpreadsheetService for Google Sheets API access
@requires CoreUtilsLib - isEqual for efficient dirty checking and deep equality
@requires fuse.js (npm) - For fuzzy search with configurable scoring
/

import {
  isEqual,
  OperationError,
  isPlainObject,
  CellValueCoercion,
  ConfigurationError
} from '@CoreUtilsLib';
import { ValidationException, z } from '@GasSchemaValidatorLib';
import Fuse from 'fuse.js';

const zodSchemaProtocol = z.object({
  safeParse: z.function()
});

/**
@class TableService
ORM-lite facade for a single Google Sheet. Orchestrates CRUD, validation, computed virtual columns, and write-through caching.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/TableService.js
 * @description Service for representing and managing a single table (sheet) in a Google Spreadsheet.
 *
 * Provides ORM-lite operations for individual sheets with advanced features:
 * - Full CRUD operations with batch optimization
 * - Schema validation with type checking and custom validators
 * - Virtual computed columns for dynamic fields
 * - Fuzzy search using Fuse.js
 * - Indexing for O(1) lookups
 * - Dirty checking to skip unnecessary writes
 * - Lazy or eager loading modes
 *
 * @version 1.0
 * @requires GoogleApiWrapper - SpreadsheetService for Google Sheets API access
 * @requires CoreUtilsLib - isEqual for efficient dirty checking and deep equality
 * @requires fuse.js (npm) - For fuzzy search with configurable scoring
 */

import {
  isEqual,
  OperationError,
  isPlainObject,
  CellValueCoercion,
  ConfigurationError
} from '@CoreUtilsLib';
import { ValidationException, z } from '@GasSchemaValidatorLib';
import Fuse from 'fuse.js';

const zodSchemaProtocol = z.object({
  safeParse: z.function()
});

/**
 * @class TableService
 * @description ORM-lite facade for a single Google Sheet. Orchestrates CRUD, validation, computed virtual columns, and write-through caching.
 */
```

<br>

## CLASS: DatabaseService
**File Path:** `SheetDBLib/src/DatabaseService.js`
**Constructor Usage:** `const instance = new DatabaseService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of DatabaseService

#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(this._dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.save
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.save(options);`
- **Pure JSDoc:**
```javascript
/** Method save */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(this._inTransaction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(dirtyRows > 0 || newRows > 0 || deletedRows > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(pendingChanges.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseService.beginTransaction
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.beginTransaction();`
- **Pure JSDoc:**
```javascript
/** Method beginTransaction */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(this._inTransaction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.for
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.for(const tableName in this.tables);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DatabaseService.commit
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.commit();`
- **Pure JSDoc:**
```javascript
/** Method commit */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(!this._inTransaction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseService.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.catch(rollbackError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseService.rollback
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.rollback();`
- **Pure JSDoc:**
```javascript
/** Method rollback */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(!this._inTransaction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(!this._transaction || !this._transaction.savedStates);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.for
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.for(const tableName in this._transaction.savedStates);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(this.tables[tableName]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(this._spreadsheetService._batchUpdates);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.inTransaction
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.inTransaction();`
- **Pure JSDoc:**
```javascript
/** Method inTransaction */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(!expected || expected.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(sheets.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseService.getTable
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.getTable(tableName);`
- **Pure JSDoc:**
```javascript
/** Method getTable */
```
---
#### METHOD: DatabaseService.hasTable
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.hasTable(tableName);`
- **Pure JSDoc:**
```javascript
/** Method hasTable */
```
---
#### METHOD: DatabaseService.listTables
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.listTables();`
- **Pure JSDoc:**
```javascript
/** Method listTables */
```
---
#### METHOD: DatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.if(typeof options.dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseService.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.getMetadata();`
- **Pure JSDoc:**
```javascript
/** Method getMetadata */
```
---
#### METHOD: DatabaseService.select
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.select(fields);`
- **Pure JSDoc:**
```javascript
/** Method select */
```
---
<br>

## CLASS: TableServiceMock
**File Path:** `SheetDBLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new TableServiceMock();`
**Description:** Centralized high-fidelity mocks for SheetDBLib services.

/

import { TableService } from '../TableService.js';
import { AdvancedQueryBuilder } from '../query/AdvancedQueryBuilder.js';

/**
@class TableServiceMock
Mock implementation of TableService for unit testing CRUD logic.
Manages an internal array of records and simulates primary key generation and indexing.

### Raw JSDoc Context:
```javascript
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
```

<br>

## CLASS: DatabaseServiceMock
**File Path:** `SheetDBLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new DatabaseServiceMock();`
**Description:** @param {string} [name='TestTable'] - Logical table name.
/
  constructor(name = 'TestTable') {
    this.name = name;
    this._data = [];
    // fuzzySearchRows is a pure function of its (rows, query, fields, threshold, options)
    // arguments — it doesn't touch table internals — so the real TableService
    // implementation can be reused directly here for high-fidelity fuzzy-search mocking.
    this.fuzzySearchRows = TableService.prototype.fuzzySearchRows;

    this.insertRow = jest.fn((row) => {
      const newRow = { ...row, id: row.id || `mock-id-${Math.random().toString(36).substr(2, 9)}` };
      this._data.push(newRow);
      return newRow;
    });
    this.insertRows = jest.fn((rows) => rows.map((r) => this.insertRow(r)));

    this.updateRow = jest.fn((id, row) => {
      const index = this._data.findIndex((r) => r.id === id);
      if (index !== -1) {
        this._data[index] = { ...this._data[index], ...row };
        return this._data[index];
      }
      return { ...row, id };
    });
    this.updateRowById = this.updateRow;

    this.patchRow = jest.fn((id, partial) => {
      const index = this._data.findIndex((r) => r.id === id);
      if (index !== -1) {
        this._data[index] = { ...this._data[index], ...partial };
        return this._data[index];
      }
      return { ...partial, id };
    });

    this.deleteRow = jest.fn((id) => {
      const index = this._data.findIndex((r) => r.id === id);
      const deleted = index !== -1 ? this._data.splice(index, 1)[0] : null;
      return deleted;
    });
    this.deleteRowById = this.deleteRow;

    this.findById = jest.fn((id) => this._data.find((r) => r.id === id) || null);
    this.getByPK = this.findById;

    this.findAll = jest.fn(() => [...this._data]);
    this.getAllRows = this.findAll;

    this.getRow = jest.fn((index) => this._data[index] || null);
    this.getRows = jest.fn((start, limit) => {
      if (start === undefined) {
        return [...this._data];
      }
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
Pre-populates the mock table with a collection of records.
@param {Object[]} data - Records to load into memory.
@returns {TableServiceMock} Current instance for chaining.
/
  setData(data) {
    this._data = [...data];
    return this;
  }
}

/**
@class DatabaseServiceMock
High-fidelity mock for DatabaseService.
Orchestrates TableServiceMock instances and provides a unified interface for mocking database-wide operations.

### Raw JSDoc Context:
```javascript
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

    this.insertRow = jest.fn((row) => {
      const newRow = { ...row, id: row.id || `mock-id-${Math.random().toString(36).substr(2, 9)}` };
      this._data.push(newRow);
      return newRow;
    });
    this.insertRows = jest.fn((rows) => rows.map((r) => this.insertRow(r)));

    this.updateRow = jest.fn((id, row) => {
      const index = this._data.findIndex((r) => r.id === id);
      if (index !== -1) {
        this._data[index] = { ...this._data[index], ...row };
        return this._data[index];
      }
      return { ...row, id };
    });
    this.updateRowById = this.updateRow;

    this.patchRow = jest.fn((id, partial) => {
      const index = this._data.findIndex((r) => r.id === id);
      if (index !== -1) {
        this._data[index] = { ...this._data[index], ...partial };
        return this._data[index];
      }
      return { ...partial, id };
    });

    this.deleteRow = jest.fn((id) => {
      const index = this._data.findIndex((r) => r.id === id);
      const deleted = index !== -1 ? this._data.splice(index, 1)[0] : null;
      return deleted;
    });
    this.deleteRowById = this.deleteRow;

    this.findById = jest.fn((id) => this._data.find((r) => r.id === id) || null);
    this.getByPK = this.findById;

    this.findAll = jest.fn(() => [...this._data]);
    this.getAllRows = this.findAll;

    this.getRow = jest.fn((index) => this._data[index] || null);
    this.getRows = jest.fn((start, limit) => {
      if (start === undefined) {
        return [...this._data];
      }
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
```

<br>

## CLASS: QueryCache
**File Path:** `SheetDBLib/src/query/AdvancedQueryBuilder.js`
**Constructor Usage:** `const instance = new QueryCache();`
**Description:** Advanced SQL-like query builder with JOIN support, aggregations, and query optimization.
/

import { HashUtils } from '@CoreUtilsLib';
import {
  QueryAggregation,
  AdvancedQueryParser
} from '../internal/query-builders/AdvancedQueryParser.js';
import { AdvancedQueryValidator } from '../internal/query-builders/AdvancedQueryValidator.js';

const { _isNullOrUndefined, _compareValues } = AdvancedQueryParser;

export { QueryAggregation };

/**
Creates a normalized, immutable fuzzy condition after its inputs have been validated.
Inlined here because AdvancedQueryBuilder.whereFuzzy()/orWhereFuzzy() are its only callers.

@param {string} field Target field.
@param {string} query Search text.
@param {Object} [options={}] Supported Fuse options.
@param {'AND'|'OR'} type Boolean connector.
@returns {Readonly<Object>} Immutable fuzzy condition.
/
function _createFuzzyCondition(field, query, options = {}, type) {
  return Object.freeze({
    kind: 'FUZZY',
    field,
    query,
    options: Object.freeze({ threshold: 0.4, ...options }),
    type
  });
}

/**
@class QueryCache
Internal TTL-based cache manager for advanced query results.
Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/query/AdvancedQueryBuilder.js
 * @description Advanced SQL-like query builder with JOIN support, aggregations, and query optimization.
 */

import { HashUtils } from '@CoreUtilsLib';
import {
  QueryAggregation,
  AdvancedQueryParser
} from '../internal/query-builders/AdvancedQueryParser.js';
import { AdvancedQueryValidator } from '../internal/query-builders/AdvancedQueryValidator.js';

const { _isNullOrUndefined, _compareValues } = AdvancedQueryParser;

export { QueryAggregation };

/**
 * Creates a normalized, immutable fuzzy condition after its inputs have been validated.
 * Inlined here because AdvancedQueryBuilder.whereFuzzy()/orWhereFuzzy() are its only callers.
 *
 * @param {string} field Target field.
 * @param {string} query Search text.
 * @param {Object} [options={}] Supported Fuse options.
 * @param {'AND'|'OR'} type Boolean connector.
 * @returns {Readonly<Object>} Immutable fuzzy condition.
 */
function _createFuzzyCondition(field, query, options = {}, type) {
  return Object.freeze({
    kind: 'FUZZY',
    field,
    query,
    options: Object.freeze({ threshold: 0.4, ...options }),
    type
  });
}

/**
 * @class QueryCache
 * @description Internal TTL-based cache manager for advanced query results.
 * Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.
 */
```

<br>

## CLASS: AdvancedQueryBuilder
**File Path:** `SheetDBLib/src/query/AdvancedQueryBuilder.js`
**Constructor Usage:** `const instance = new AdvancedQueryBuilder();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of AdvancedQueryBuilder

#### METHOD: AdvancedQueryBuilder.select
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.select(columns);`
- **Pure JSDoc:**
```javascript
/** Method select */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(typeof columns);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(columns);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.from
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.from(tableName);`
- **Pure JSDoc:**
```javascript
/** Method from */
```
---
#### METHOD: AdvancedQueryBuilder.join
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.join(table, localField, operator, foreignField);`
- **Pure JSDoc:**
```javascript
/** Method join */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(arguments.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.leftJoin
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.leftJoin(table, localField, operator, foreignField);`
- **Pure JSDoc:**
```javascript
/** Method leftJoin */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(arguments.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.rightJoin
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.rightJoin(table, localField, operator, foreignField);`
- **Pure JSDoc:**
```javascript
/** Method rightJoin */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(arguments.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.fullOuterJoin
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.fullOuterJoin(table, localField, operator, foreignField);`
- **Pure JSDoc:**
```javascript
/** Method fullOuterJoin */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(arguments.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.where
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.where(field, operator, value);`
- **Pure JSDoc:**
```javascript
/** Method where */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(typeof field);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in field);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.orWhere
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.orWhere(field, operator, value);`
- **Pure JSDoc:**
```javascript
/** Method orWhere */
```
---
#### METHOD: AdvancedQueryBuilder.or
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.or(field, operator, value);`
- **Pure JSDoc:**
```javascript
/** Method or */
```
---
#### METHOD: AdvancedQueryBuilder.andWhere
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.andWhere(field, operator, value);`
- **Pure JSDoc:**
```javascript
/** Method andWhere */
```
---
#### METHOD: AdvancedQueryBuilder.and
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.and(field, operator, value);`
- **Pure JSDoc:**
```javascript
/** Method and */
```
---
#### METHOD: AdvancedQueryBuilder.whereLike
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.whereLike(field, pattern);`
- **Pure JSDoc:**
```javascript
/** Method whereLike */
```
---
#### METHOD: AdvancedQueryBuilder.whereFuzzy
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.whereFuzzy(field, query, options);`
- **Pure JSDoc:**
```javascript
/** Method whereFuzzy */
```
---
#### METHOD: AdvancedQueryBuilder.orWhereFuzzy
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.orWhereFuzzy(field, query, options);`
- **Pure JSDoc:**
```javascript
/** Method orWhereFuzzy */
```
---
#### METHOD: AdvancedQueryBuilder.whereIn
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.whereIn(field, values);`
- **Pure JSDoc:**
```javascript
/** Method whereIn */
```
---
#### METHOD: AdvancedQueryBuilder.groupBy
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.groupBy(fields);`
- **Pure JSDoc:**
```javascript
/** Method groupBy */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const field of fieldsArray);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.sum
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.sum(field, alias);`
- **Pure JSDoc:**
```javascript
/** Method sum */
```
---
#### METHOD: AdvancedQueryBuilder.avg
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.avg(field, alias);`
- **Pure JSDoc:**
```javascript
/** Method avg */
```
---
#### METHOD: AdvancedQueryBuilder.count
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.count(field, alias);`
- **Pure JSDoc:**
```javascript
/** Method count */
```
---
#### METHOD: AdvancedQueryBuilder.min
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.min(field, alias);`
- **Pure JSDoc:**
```javascript
/** Method min */
```
---
#### METHOD: AdvancedQueryBuilder.max
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.max(field, alias);`
- **Pure JSDoc:**
```javascript
/** Method max */
```
---
#### METHOD: AdvancedQueryBuilder.orderBy
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.orderBy(fields, direction);`
- **Pure JSDoc:**
```javascript
/** Method orderBy */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const field of fieldsArray);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.orderByDesc
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.orderByDesc(fields);`
- **Pure JSDoc:**
```javascript
/** Method orderByDesc */
```
---
#### METHOD: AdvancedQueryBuilder.limit
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.limit(limitValue);`
- **Pure JSDoc:**
```javascript
/** Method limit */
```
---
#### METHOD: AdvancedQueryBuilder.offset
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.offset(offsetValue);`
- **Pure JSDoc:**
```javascript
/** Method offset */
```
---
#### METHOD: AdvancedQueryBuilder.paginate
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.paginate(page, pageSize);`
- **Pure JSDoc:**
```javascript
/** Method paginate */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in row);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(!rightTable);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in row);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(useHashJoin);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const leftRow of leftRows);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(useHashJoin);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const { row: rightRow, index: rightIndex } of matchingRightRows);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(rightRows.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in firstRightRow);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(leftRows.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in leftRows[0]);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(conditions.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(!allAndEquality);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(conditions.length !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const condition of conditions);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(condition.field);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(table._indices[condition.field]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(cardinality < smallestCardinality);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(bestCondition && bestIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(remainingConditions.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(!this._optimizedField);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in row);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(let conditionIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(cond.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(let index);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(condition.kind !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(!rows || rows.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const row of rows);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(!groups[key]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in groups);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const field of this.groupByFields);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const agg of this.aggregations);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(k >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const sorting of this.orderByFields);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(valueA);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(valueA);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(valueB);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(left >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(k - 1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(k - 1 < newPivotIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.execute
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.execute();`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(!this.tableName);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(this.useCache && this._cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(cachedResults !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(indexOptimization);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in row);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(this.joins.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const joinConfig of this.joins);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(this.conditions.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(hasOrCondition);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(remainingConditions.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(fuzzyConditions.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(this.groupByFields.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(this.orderByFields.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(shouldUsePartialSort);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(this._offset > 0 || this._limit !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const col of this.selectedColumns);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(!hasGroupByWithAggregations &&
      this.joins.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.for(const key in row);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.if(this.useCache && this._cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryBuilder.first
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.first();`
- **Pure JSDoc:**
```javascript
/** Method first */
```
---
#### METHOD: AdvancedQueryBuilder.exists
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.exists();`
- **Pure JSDoc:**
```javascript
/** Method exists */
```
---
<br>

## CLASS: AdvancedQueryValidator
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryValidator.js`
**Constructor Usage:** `const instance = new AdvancedQueryValidator();`
**Description:** Validation logic for query building operations.
/

/**
@class AdvancedQueryValidator
Static structural validation for Query Builder operations.
Verifies table existence, relational integrity for JOINs, and type correctness for query operands.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/query/managers/AdvancedQueryValidator.js
 * @description Validation logic for query building operations.
 */

/**
 * @class AdvancedQueryValidator
 * @description Static structural validation for Query Builder operations.
 * Verifies table existence, relational integrity for JOINs, and type correctness for query operands.
 */
```

### Methods of AdvancedQueryValidator

#### METHOD: AdvancedQueryValidator.validateTable
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.validateTable(dbService, tableName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Verifies that the target table identifier is registered in the database service.
   * @param {DatabaseService} dbService - Active database service.
   * @param {string} tableName - Target table identifier.
   * @throws {Error} If the table name is not found in the service registry.
   */
```
---
#### METHOD: AdvancedQueryValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.if(!dbService.tables[tableName]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryValidator.validateJoin
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.validateJoin(dbService, table, type);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates relational integrity for JOIN operations.
   * @param {DatabaseService} dbService - Active database service.
   * @param {string} table - Target foreign table identifier.
   * @param {string} [type='JOIN'] - Join operation type for error context.
   * @throws {Error} If the foreign table is not registered.
   */
```
---
#### METHOD: AdvancedQueryValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.if(!dbService.tables[table]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryValidator.validateWhereIn
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.validateWhereIn(field, values);`
- **Pure JSDoc:**
```javascript
/**
   * @description Ensures the operand for an 'IN' condition is a valid collection.
   * @param {string} field - Target column identifier.
   * @param {*} values - Operand to verify.
   * @throws {Error} If values is not an Array.
   */
```
---
#### METHOD: AdvancedQueryValidator.validateFuzzyCondition
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.validateFuzzyCondition(field, query, options);`
- **Pure JSDoc:**
```javascript
/**
   * Validates the opt-in fuzzy predicate API before Fuse receives configuration.
   * Only threshold is exposed deliberately so query callers cannot override
   * compiler-owned options such as keys, includeScore, or sorting.
   *
   * @param {*} field Target field identifier.
   * @param {*} query Fuzzy search text.
   * @param {*} options Fuzzy configuration.
   * @throws {Error} If the predicate cannot be evaluated safely.
   */
```
---
#### METHOD: AdvancedQueryValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.if(optionName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryValidator.validateOrderDirection
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.validateOrderDirection(direction);`
- **Pure JSDoc:**
```javascript
/**
   * @description Verifies sort direction identifiers.
   * @param {string} direction - The sort direction string.
   * @throws {Error} If direction is neither 'ASC' nor 'DESC' (case-insensitive).
   */
```
---
#### METHOD: AdvancedQueryValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryValidator.if(dir !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: QueryAggregation
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.js`
**Constructor Usage:** `const instance = new QueryAggregation();`
**Description:** Internal classes and functions for parsing and representing query structures.
/

/**
Verifies if a value is strictly null or undefined.
@param {*} value - The value to verify.
@returns {boolean} True if the value is null-ish.
@private
/
function _isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
Coerces a value to float, providing a fallback for NaN results.
@param {*} value - The input value to parse.
@param {number} [defaultValue=0] - Fallback if parsing fails.
@returns {number} The parsed float or default value.
@private
/
function _safeParseFloat(value, defaultValue = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
Executes relational comparison between two operands based on a string operator.
Supports standard equality, inequality, range checks, LIKE (regex-based), IN (collection), and CONTAINS.
@param {*} leftValue - Primary operand.
@param {string} operator - Relational operator (e.g., '=', '>=', 'LIKE', 'IN').
@param {*} rightValue - Secondary operand or collection.
@returns {boolean} Evaluation result.
@private
/
function _compareValues(leftValue, operator, rightValue) {
  // Handle null/undefined values for equality operators specifically to maintain loose equality behavior (null == undefined)
  if (
    leftValue == null &&
    (operator === '=' || operator === '==' || operator === '!=' || operator === '<>')
  ) {
    if (operator === '=' || operator === '==') {
      return rightValue == null;
    }
    return rightValue != null;
  }

  switch (operator) {
    case '=':
    case '==':
      return leftValue === rightValue;
    case '!=':
    case '<>':
      return leftValue !== rightValue;
    case '>':
      return leftValue > rightValue;
    case '>=':
      return leftValue >= rightValue;
    case '<':
      return leftValue < rightValue;
    case '<=':
      return leftValue <= rightValue;
    case 'LIKE': {
      if (typeof leftValue !== 'string') {
        return false;
      }
      const pattern = rightValue.toString().replace(/%/g, '.*');
      const regex = new RegExp(`^${pattern}$`, 'i');
      return regex.test(leftValue.toString());
    }
    case 'IN':
      return Array.isArray(rightValue) && rightValue.some((v) => v == leftValue);
    case 'NOT IN':
      return Array.isArray(rightValue) && !rightValue.some((v) => v == leftValue);
    case 'CONTAINS':
      return (
        typeof leftValue === 'string' &&
        typeof rightValue === 'string' &&
        leftValue.toLowerCase().includes(rightValue.toLowerCase())
      );
    default:
      return false;
  }
}

/**
@class QueryAggregation
Operational model for computing scalar aggregations over record collections.
Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/query/managers/AdvancedQueryParser.js
 * @description Internal classes and functions for parsing and representing query structures.
 */

/**
 * @description Verifies if a value is strictly null or undefined.
 * @param {*} value - The value to verify.
 * @returns {boolean} True if the value is null-ish.
 * @private
 */
function _isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * @description Coerces a value to float, providing a fallback for NaN results.
 * @param {*} value - The input value to parse.
 * @param {number} [defaultValue=0] - Fallback if parsing fails.
 * @returns {number} The parsed float or default value.
 * @private
 */
function _safeParseFloat(value, defaultValue = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * @description Executes relational comparison between two operands based on a string operator.
 * Supports standard equality, inequality, range checks, LIKE (regex-based), IN (collection), and CONTAINS.
 * @param {*} leftValue - Primary operand.
 * @param {string} operator - Relational operator (e.g., '=', '>=', 'LIKE', 'IN').
 * @param {*} rightValue - Secondary operand or collection.
 * @returns {boolean} Evaluation result.
 * @private
 */
function _compareValues(leftValue, operator, rightValue) {
  // Handle null/undefined values for equality operators specifically to maintain loose equality behavior (null == undefined)
  if (
    leftValue == null &&
    (operator === '=' || operator === '==' || operator === '!=' || operator === '<>')
  ) {
    if (operator === '=' || operator === '==') {
      return rightValue == null;
    }
    return rightValue != null;
  }

  switch (operator) {
    case '=':
    case '==':
      return leftValue === rightValue;
    case '!=':
    case '<>':
      return leftValue !== rightValue;
    case '>':
      return leftValue > rightValue;
    case '>=':
      return leftValue >= rightValue;
    case '<':
      return leftValue < rightValue;
    case '<=':
      return leftValue <= rightValue;
    case 'LIKE': {
      if (typeof leftValue !== 'string') {
        return false;
      }
      const pattern = rightValue.toString().replace(/%/g, '.*');
      const regex = new RegExp(`^${pattern}$`, 'i');
      return regex.test(leftValue.toString());
    }
    case 'IN':
      return Array.isArray(rightValue) && rightValue.some((v) => v == leftValue);
    case 'NOT IN':
      return Array.isArray(rightValue) && !rightValue.some((v) => v == leftValue);
    case 'CONTAINS':
      return (
        typeof leftValue === 'string' &&
        typeof rightValue === 'string' &&
        leftValue.toLowerCase().includes(rightValue.toLowerCase())
      );
    default:
      return false;
  }
}

/**
 * @class QueryAggregation
 * @description Operational model for computing scalar aggregations over record collections.
 * Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.
 */
```

<br>

