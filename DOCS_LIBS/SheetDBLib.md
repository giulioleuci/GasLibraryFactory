# API Reference: SheetDBLib

## Transaction persistence contract

A successful `commit()` drains every registered table's pending insert, update,
and delete queues by calling each table's `flush()` before the spreadsheet batch
is flushed. The transaction is marked complete only after those queued writes
have reached the batch flush seam.

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

import { isEqual, OperationError, isPlainObject, CellValueCoercion } from '@CoreUtilsLib';
import { TableDataModifier } from './TableDataModifier.js';
import { TableSchemaValidator } from './TableSchemaValidator.js';
import { TableSearchEngine } from './TableSearchEngine.js';

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

import { isEqual, OperationError, isPlainObject, CellValueCoercion } from '@CoreUtilsLib';
import { TableDataModifier } from './TableDataModifier.js';
import { TableSchemaValidator } from './TableSchemaValidator.js';
import { TableSearchEngine } from './TableSearchEngine.js';

/**
 * @class TableService
 * @description ORM-lite facade for a single Google Sheet. Orchestrates CRUD, validation, computed virtual columns, and write-through caching.
 */
```

<br>

## CLASS: TableSearchEngine
**File Path:** `SheetDBLib/src/TableSearchEngine.js`
**Constructor Usage:** `const instance = new TableSearchEngine();`
**Description:** @class TableSearchEngine
Internal engine for O(1) indexed lookups and Fuse.js fuzzy matching on TableService data.

### Raw JSDoc Context:
```javascript
/**
 * @class TableSearchEngine
 * @description Internal engine for O(1) indexed lookups and Fuse.js fuzzy matching on TableService data.
 */
```

### Methods of TableSearchEngine

#### METHOD: TableSearchEngine.fuzzySearch
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableSearchEngine.fuzzySearch(query, fields, threshold, options);`
- **Pure JSDoc:**
```javascript
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
```
---
#### METHOD: TableSearchEngine.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.if(!query || typeof query !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSearchEngine.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.if(typeof threshold !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSearchEngine.fuzzySearchRows
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableSearchEngine.fuzzySearchRows(rows, query, fields, threshold, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes fuzzy matching against an already materialized row set.
   * This keeps all Fuse configuration within the table search boundary for callers
   * such as AdvancedQueryCompiler that have already narrowed their candidates.
   * @param {Object[]} rows - Candidate records to search.
   * @param {string} query - Search term.
   * @param {string[]} fields - Candidate fields to inspect.
   * @param {number} [threshold=0.3] - Fuse.js sensitivity (0.0 to 1.0).
   * @param {Object} [options={}] - Fuse.js configuration overrides.
   * @returns {Object[]} Fuse.js result objects (item, refIndex, score).
   */
```
---
#### METHOD: TableSearchEngine.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.if(!query || typeof query !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSearchEngine.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.if(typeof threshold !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSearchEngine.createIndex
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableSearchEngine.createIndex(columnName);`
- **Pure JSDoc:**
```javascript
/**
   * @function createIndex
   * @description Builds a Map-based memory index for O(1) lookups on a specific column.
   * @param {string} columnName - Target physical column.
   * @returns {TableService} The facade for chaining.
   * @throws {Error} If columnName is missing from table schema.
   */
```
---
#### METHOD: TableSearchEngine.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.if(value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSearchEngine.indexedLookup
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableSearchEngine.indexedLookup(columnName, value);`
- **Pure JSDoc:**
```javascript
/**
   * @function indexedLookup
   * @description Performs exact value lookup using pre-built memory index.
   * @param {string} columnName - Target physical column.
   * @param {*} value - Value to find.
   * @returns {Object[]|null} Array of matching rows or null if no index exists.
   */
```
---
#### METHOD: TableSearchEngine.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.if(!this.facade._indices[columnName]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSearchEngine.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.if(!rowIndices);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSearchEngine.invalidateIndex
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.invalidateIndex(columnName);`
- **Pure JSDoc:**
```javascript
/**
   * @function invalidateIndex
   * @description Purges memory indices.
   * @param {string|null} [columnName=null] - Specific column ID or null for global purge.
   */
```
---
#### METHOD: TableSearchEngine.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSearchEngine.if(columnName);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: TableSchemaValidator
**File Path:** `SheetDBLib/src/TableSchemaValidator.js`
**Constructor Usage:** `const instance = new TableSchemaValidator();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of TableSchemaValidator

#### METHOD: TableSchemaValidator.setSchema
- **Scope:** instance
- **LLM Call Syntax:** `tableSchemaValidator.setSchema(zodSchema);`
- **Pure JSDoc:**
```javascript
/** Method setSchema */
```
---
#### METHOD: TableSchemaValidator.disableSchemaValidation
- **Scope:** instance
- **LLM Call Syntax:** `tableSchemaValidator.disableSchemaValidation();`
- **Pure JSDoc:**
```javascript
/** Method disableSchemaValidation */
```
---
#### METHOD: TableSchemaValidator.enableSchemaValidation
- **Scope:** instance
- **LLM Call Syntax:** `tableSchemaValidator.enableSchemaValidation();`
- **Pure JSDoc:**
```javascript
/** Method enableSchemaValidation */
```
---
#### METHOD: TableSchemaValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSchemaValidator.if(!this.facade._schema);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSchemaValidator.validateRow
- **Scope:** instance
- **LLM Call Syntax:** `tableSchemaValidator.validateRow(rowObj, isUpdate);`
- **Pure JSDoc:**
```javascript
/** Method validateRow */
```
---
#### METHOD: TableSchemaValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSchemaValidator.if(!this.facade._schemaValidationEnabled || !this.facade._schema);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSchemaValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSchemaValidator.if(!this.facade._schemaValidator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableSchemaValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `tableSchemaValidator.if(!result.success);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: TableDataModifier
**File Path:** `SheetDBLib/src/TableDataModifier.js`
**Constructor Usage:** `const instance = new TableDataModifier();`
**Description:** @class TableDataModifier
Internal logic engine for mutating SheetDB table data. Handles validation, UUID generation, and write-through cache management.

### Raw JSDoc Context:
```javascript
/**
 * @class TableDataModifier
 * @description Internal logic engine for mutating SheetDB table data. Handles validation, UUID generation, and write-through cache management.
 */
```

### Methods of TableDataModifier

#### METHOD: TableDataModifier.insertRow
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableDataModifier.insertRow(rowObj);`
- **Pure JSDoc:**
```javascript
/**
   * @function insertRow
   * @description Single row insertion with schema validation.
   * @param {Object} rowObj - Data to insert.
   * @returns {Object|null} The inserted row with generated ID and virtual columns.
   * @throws {Error} On schema violation.
   */
```
---
#### METHOD: TableDataModifier.insertRows
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableDataModifier.insertRows(rowsArray);`
- **Pure JSDoc:**
```javascript
/**
   * @function insertRows
   * @description Batch insertion with UUID generation and write-through cache update.
   * @param {Object[]} rowsArray - Multiple data objects.
   * @returns {Object[]} Processed rows added to the queue.
   * @throws {Error} If validation fails for any row.
   */
```
---
#### METHOD: TableDataModifier.for
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.for(const rowObj of rowsArray);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableDataModifier.if
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.if(this.facade._keyField && !completeRow[this.facade._keyField]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableDataModifier.for
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.for(const row of completeRows);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableDataModifier.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableDataModifier.updateRowById
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableDataModifier.updateRowById(id, rowObj);`
- **Pure JSDoc:**
```javascript
/**
   * @function updateRowById
   * @description Performs full row update with dirty checking. Skips if data is identical.
   * @param {string|number} id - PK of target row.
   * @param {Object} rowObj - New data state.
   * @returns {Object} The updated row.
   * @throws {OperationError} If ID not found.
   * @throws {Error} On schema violation.
   */
```
---
#### METHOD: TableDataModifier.if
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableDataModifier.for
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.for(const col of physicalColumns);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableDataModifier.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableDataModifier.patchRow
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableDataModifier.patchRow(id, partialObj);`
- **Pure JSDoc:**
```javascript
/**
   * @function patchRow
   * @description Partial update focusing only on changed physical columns.
   * @param {string|number} id - PK of target row.
   * @param {Object} partialObj - Subset of row data.
   * @returns {Object} The merged updated row.
   * @throws {OperationError} If ID not found.
   */
```
---
#### METHOD: TableDataModifier.if
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableDataModifier.if
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.if(this.facade._virtualColumns[key]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableDataModifier.if
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.if(oldValue !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableDataModifier.if
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.if(changedColumns.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableDataModifier.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableDataModifier.deleteRowById
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableDataModifier.deleteRowById(id);`
- **Pure JSDoc:**
```javascript
/**
   * @function deleteRowById
   * @description Queues row for deletion and purges it from local caches.
   * @param {string|number} id - PK of row to remove.
   * @returns {Object|null} The deleted row object or null if not found.
   * @throws {Error} If queueing fails.
   */
```
---
#### METHOD: TableDataModifier.if
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableDataModifier.if
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.if(insertIndex !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableDataModifier.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableDataModifier.updateRowsByIds
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableDataModifier.updateRowsByIds(updatesObj);`
- **Pure JSDoc:**
```javascript
/**
   * @function updateRowsByIds
   * @description Batch patch operation.
   * @param {Object.<string, Object>} updatesObj - ID-to-partial map.
   * @returns {Object[]} Successful updates.
   */
```
---
#### METHOD: TableDataModifier.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableDataModifier.deleteRowsByIds
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableDataModifier.deleteRowsByIds(ids);`
- **Pure JSDoc:**
```javascript
/**
   * @function deleteRowsByIds
   * @description Batch deletion.
   * @param {(string|number)[]} ids - Array of PKs.
   * @returns {Object[]} Successful deletions.
   */
```
---
#### METHOD: TableDataModifier.for
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.for(const id of ids);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableDataModifier.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableDataModifier.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: MyDatabaseService
**File Path:** `SheetDBLib/src/DatabaseService.js`
**Constructor Usage:** `const instance = new MyDatabaseService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of MyDatabaseService

#### METHOD: MyDatabaseService.if
- **Scope:** instance
- **LLM Call Syntax:** `myDatabaseService.if(this._dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyDatabaseService.select
- **Scope:** instance
- **LLM Call Syntax:** `myDatabaseService.select(fields);`
- **Pure JSDoc:**
```javascript
/** Method select */
```
---
<br>

## CLASS: AdvancedQueryBuilderMock
**File Path:** `SheetDBLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new AdvancedQueryBuilderMock();`
**Description:** Centralized high-fidelity mocks for SheetDBLib services.

/

import { TableSearchEngine } from '../TableSearchEngine.js';

/**
@class AdvancedQueryBuilderMock
High-fidelity Jest-based mock for AdvancedQueryBuilder.
Simulates fluent API chaining and provides methods to inject return data for distributed or local query tests.

@example
const mock = new AdvancedQueryBuilderMock().setReturnData([{ id: 1 }]);

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for SheetDBLib services.
 * @version 1.0.0
 */

import { TableSearchEngine } from '../TableSearchEngine.js';

/**
 * @class AdvancedQueryBuilderMock
 * @description High-fidelity Jest-based mock for AdvancedQueryBuilder.
 * Simulates fluent API chaining and provides methods to inject return data for distributed or local query tests.
 *
 * @example
 * const mock = new AdvancedQueryBuilderMock().setReturnData([{ id: 1 }]);
 */
```

<br>

## CLASS: TableServiceMock
**File Path:** `SheetDBLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new TableServiceMock();`
**Description:** Injects data into the execute() mock and updates count() based on array length.
@param {Object[]} data - Collection of records to return.
@returns {AdvancedQueryBuilderMock} Current instance for chaining.
/
  setReturnData(data) {
    this.execute.mockReturnValue(data);
    this.count.mockReturnValue(data.length);
    return this;
  }
}

/**
@class TableServiceMock
Mock implementation of TableService for unit testing CRUD logic.
Manages an internal array of records and simulates primary key generation and indexing.

### Raw JSDoc Context:
```javascript
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
    this.searchEngine = new TableSearchEngine(this);

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
    this.searchEngine = new TableSearchEngine(this);

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
- **LLM Call Syntax:** `advancedQueryBuilder.if(this.useCache && this._cache);`
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

## CLASS: PartitionRouter
**File Path:** `SheetDBLib/src/multi/PartitionRouter.js`
**Constructor Usage:** `const instance = new PartitionRouter();`
**Description:** Router for directing queries to appropriate partitions.

/

import { RoutingStrategy, isValidRoutingStrategy } from './RoutingStrategy.js';

/**
@class PartitionRouter
Decision engine for directing database operations to specific partitions based on configurable strategies.
Supports explicit ID mapping, tag filtering, round-robin load balancing, priority weighting, and custom resolution logic.

@example
const router = new PartitionRouter(config, { logger });
const targets = router.route({ tags: ['active'], strategy: 'TAG_BASED' });

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/multi/PartitionRouter.js
 * @description Router for directing queries to appropriate partitions.
 * @version 1.0.0
 */

import { RoutingStrategy, isValidRoutingStrategy } from './RoutingStrategy.js';

/**
 * @class PartitionRouter
 * @description Decision engine for directing database operations to specific partitions based on configurable strategies.
 * Supports explicit ID mapping, tag filtering, round-robin load balancing, priority weighting, and custom resolution logic.
 *
 * @example
 * const router = new PartitionRouter(config, { logger });
 * const targets = router.route({ tags: ['active'], strategy: 'TAG_BASED' });
 */
```

<br>

## CLASS: PartitionConfiguration
**File Path:** `SheetDBLib/src/multi/PartitionConfiguration.js`
**Constructor Usage:** `const instance = new PartitionConfiguration();`
**Description:** Configuration for multi-database partition setup.

/

import { cloneDeep } from '@CoreUtilsLib';
import { DatabasePartition } from './DatabasePartition.js';
import { RoutingStrategy, isValidRoutingStrategy } from './RoutingStrategy.js';

/**
@class PartitionConfiguration
Centralized registry for multi-database topology.
Manages partition definitions, routing strategies, aliases, and global connection settings for the MultiDatabaseManager.

@example
const config = new PartitionConfiguration({
  partitions: [{ id: 'main', spreadsheetId: '1abc...' }],
  aliases: { active: 'main' }
});

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/multi/PartitionConfiguration.js
 * @description Configuration for multi-database partition setup.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';
import { DatabasePartition } from './DatabasePartition.js';
import { RoutingStrategy, isValidRoutingStrategy } from './RoutingStrategy.js';

/**
 * @class PartitionConfiguration
 * @description Centralized registry for multi-database topology.
 * Manages partition definitions, routing strategies, aliases, and global connection settings for the MultiDatabaseManager.
 *
 * @example
 * const config = new PartitionConfiguration({
 *   partitions: [{ id: 'main', spreadsheetId: '1abc...' }],
 *   aliases: { active: 'main' }
 * });
 */
```

<br>

## CLASS: MultiDatabaseManager
**File Path:** `SheetDBLib/src/multi/MultiDatabaseManager.js`
**Constructor Usage:** `const instance = new MultiDatabaseManager();`
**Description:** Manager for multiple database partitions with connection pooling.

/

import { PartitionConfiguration } from './PartitionConfiguration.js';
import { PartitionRouter } from './PartitionRouter.js';
import { CrossPartitionQuery } from './CrossPartitionQuery.js';
import { CrossPartitionDisabledError } from './MultiDatabaseError.js';
import { PartitionCoordinator } from '../internal/multi-coordination/PartitionCoordinator.js';
import { CrossPartitionAggregator } from '../internal/multi-coordination/CrossPartitionAggregator.js';

/**
PartitionStatistics - Usage statistics for a partition.

@typedef {Object} PartitionStatistics
@property {number} queries - Total queries executed
@property {number} hits - Cache hits (if applicable)
@property {number} misses - Cache misses (if applicable)
@property {Date|null} lastAccess - Last access timestamp
@property {boolean} isConnected - Whether partition is currently connected
/

/**
@class MultiDatabaseManager
Orchestration facade for multi-partition database architectures.
Manages connection pooling, lazy-loading of DatabaseService instances, routing logic, and distributed queries across multiple Google Spreadsheets.

@example
const manager = new MultiDatabaseManager(config, { logger, cache });
const db = manager.getPartition('warehouse_milan');

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/multi/MultiDatabaseManager.js
 * @description Manager for multiple database partitions with connection pooling.
 * @version 1.1.0 - Refactored to Facade/Delegation pattern
 */

import { PartitionConfiguration } from './PartitionConfiguration.js';
import { PartitionRouter } from './PartitionRouter.js';
import { CrossPartitionQuery } from './CrossPartitionQuery.js';
import { CrossPartitionDisabledError } from './MultiDatabaseError.js';
import { PartitionCoordinator } from '../internal/multi-coordination/PartitionCoordinator.js';
import { CrossPartitionAggregator } from '../internal/multi-coordination/CrossPartitionAggregator.js';

/**
 * PartitionStatistics - Usage statistics for a partition.
 *
 * @typedef {Object} PartitionStatistics
 * @property {number} queries - Total queries executed
 * @property {number} hits - Cache hits (if applicable)
 * @property {number} misses - Cache misses (if applicable)
 * @property {Date|null} lastAccess - Last access timestamp
 * @property {boolean} isConnected - Whether partition is currently connected
 */

/**
 * @class MultiDatabaseManager
 * @description Orchestration facade for multi-partition database architectures.
 * Manages connection pooling, lazy-loading of DatabaseService instances, routing logic, and distributed queries across multiple Google Spreadsheets.
 *
 * @example
 * const manager = new MultiDatabaseManager(config, { logger, cache });
 * const db = manager.getPartition('warehouse_milan');
 */
```

<br>

## CLASS: MultiDatabaseError
**File Path:** `SheetDBLib/src/multi/MultiDatabaseError.js`
**Constructor Usage:** `const instance = new MultiDatabaseError();`
**Description:** Error classes for MultiDatabase extension.

/

import { BaseError } from '@CoreUtilsLib';

/**
@class MultiDatabaseError
@extends BaseError
Base error class for all multi-database operations.
Includes standardized details and timestamp for debugging across partition operations.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/multi/MultiDatabaseError.js
 * @description Error classes for MultiDatabase extension.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * @class MultiDatabaseError
 * @extends BaseError
 * @description Base error class for all multi-database operations.
 * Includes standardized details and timestamp for debugging across partition operations.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 */
```

<br>

## CLASS: PartitionNotFoundError
**File Path:** `SheetDBLib/src/multi/MultiDatabaseError.js`
**Constructor Usage:** `const instance = new PartitionNotFoundError();`
**Description:** @param {string} message - Descriptive error message.
@param {Object} [details={}] - Arbitrary metadata for error context.
/
  constructor(message, details = {}) {
    super(message, details);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'MultiDatabaseError';
    this.details = details;
  }
}

/**
@class PartitionNotFoundError
@extends MultiDatabaseError
Thrown when an operation targets a partition ID not present in the current configuration.

### Raw JSDoc Context:
```javascript
/**
   * @param {string} message - Descriptive error message.
   * @param {Object} [details={}] - Arbitrary metadata for error context.
   */
  constructor(message, details = {}) {
    super(message, details);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'MultiDatabaseError';
    this.details = details;
  }
}

/**
 * @class PartitionNotFoundError
 * @extends MultiDatabaseError
 * @description Thrown when an operation targets a partition ID not present in the current configuration.
 */
```

<br>

## CLASS: PartitionConnectionError
**File Path:** `SheetDBLib/src/multi/MultiDatabaseError.js`
**Constructor Usage:** `const instance = new PartitionConnectionError();`
**Description:** @param {string} partitionId - The identifier of the missing partition.
/
  constructor(partitionId) {
    super(`Partition not found: ${partitionId}`, { partitionId });
    this.name = 'PartitionNotFoundError';
    this.partitionId = partitionId;
  }
}

/**
@class PartitionConnectionError
@extends MultiDatabaseError
Thrown when the MultiDatabaseManager fails to establish a connection to a specific partition.

### Raw JSDoc Context:
```javascript
/**
   * @param {string} partitionId - The identifier of the missing partition.
   */
  constructor(partitionId) {
    super(`Partition not found: ${partitionId}`, { partitionId });
    this.name = 'PartitionNotFoundError';
    this.partitionId = partitionId;
  }
}

/**
 * @class PartitionConnectionError
 * @extends MultiDatabaseError
 * @description Thrown when the MultiDatabaseManager fails to establish a connection to a specific partition.
 */
```

<br>

## CLASS: ReadOnlyPartitionError
**File Path:** `SheetDBLib/src/multi/MultiDatabaseError.js`
**Constructor Usage:** `const instance = new ReadOnlyPartitionError();`
**Description:** @param {string} partitionId - The identifier of the partition that failed to connect.
@param {Error} cause - The underlying exception triggered during the connection attempt.
/
  constructor(partitionId, cause) {
    super(`Failed to connect to partition: ${partitionId}`, {
      partitionId,
      cause: cause?.message || String(cause)
    });
    this.name = 'PartitionConnectionError';
    this.partitionId = partitionId;
    this.cause = cause;
  }
}

/**
@class ReadOnlyPartitionError
@extends MultiDatabaseError
Thrown when a write operation is attempted on a partition explicitly marked as read-only.

### Raw JSDoc Context:
```javascript
/**
   * @param {string} partitionId - The identifier of the partition that failed to connect.
   * @param {Error} cause - The underlying exception triggered during the connection attempt.
   */
  constructor(partitionId, cause) {
    super(`Failed to connect to partition: ${partitionId}`, {
      partitionId,
      cause: cause?.message || String(cause)
    });
    this.name = 'PartitionConnectionError';
    this.partitionId = partitionId;
    this.cause = cause;
  }
}

/**
 * @class ReadOnlyPartitionError
 * @extends MultiDatabaseError
 * @description Thrown when a write operation is attempted on a partition explicitly marked as read-only.
 */
```

<br>

## CLASS: CrossPartitionQueryError
**File Path:** `SheetDBLib/src/multi/MultiDatabaseError.js`
**Constructor Usage:** `const instance = new CrossPartitionQueryError();`
**Description:** @param {string} partitionId - The identifier of the read-only partition.
@param {string} operation - The type of write operation attempted (e.g., insert, update, delete).
/
  constructor(partitionId, operation) {
    super(`Cannot perform ${operation} on read-only partition: ${partitionId}`, {
      partitionId,
      operation
    });
    this.name = 'ReadOnlyPartitionError';
    this.partitionId = partitionId;
    this.operation = operation;
  }
}

/**
@class CrossPartitionQueryError
@extends MultiDatabaseError
Thrown when a distributed query fails, aggregating individual errors from multiple partitions.

### Raw JSDoc Context:
```javascript
/**
   * @param {string} partitionId - The identifier of the read-only partition.
   * @param {string} operation - The type of write operation attempted (e.g., insert, update, delete).
   */
  constructor(partitionId, operation) {
    super(`Cannot perform ${operation} on read-only partition: ${partitionId}`, {
      partitionId,
      operation
    });
    this.name = 'ReadOnlyPartitionError';
    this.partitionId = partitionId;
    this.operation = operation;
  }
}

/**
 * @class CrossPartitionQueryError
 * @extends MultiDatabaseError
 * @description Thrown when a distributed query fails, aggregating individual errors from multiple partitions.
 */
```

<br>

## CLASS: CrossPartitionDisabledError
**File Path:** `SheetDBLib/src/multi/MultiDatabaseError.js`
**Constructor Usage:** `const instance = new CrossPartitionDisabledError();`
**Description:** @param {string} message - Summary error message.
@param {Map<string, Error>} [partitionErrors=new Map()] - Map of partition IDs to their specific query errors.
/
  constructor(message, partitionErrors = new Map()) {
    super(message, {
      partitionErrors: Object.fromEntries(
        Array.from(partitionErrors.entries()).map(([k, v]) => [k, v.message])
      )
    });
    this.name = 'CrossPartitionQueryError';
    this.partitionErrors = partitionErrors;
  }
}

/**
@class CrossPartitionDisabledError
@extends MultiDatabaseError
Thrown when a cross-partition query is initiated while the feature is disabled in the configuration.

### Raw JSDoc Context:
```javascript
/**
   * @param {string} message - Summary error message.
   * @param {Map<string, Error>} [partitionErrors=new Map()] - Map of partition IDs to their specific query errors.
   */
  constructor(message, partitionErrors = new Map()) {
    super(message, {
      partitionErrors: Object.fromEntries(
        Array.from(partitionErrors.entries()).map(([k, v]) => [k, v.message])
      )
    });
    this.name = 'CrossPartitionQueryError';
    this.partitionErrors = partitionErrors;
  }
}

/**
 * @class CrossPartitionDisabledError
 * @extends MultiDatabaseError
 * @description Thrown when a cross-partition query is initiated while the feature is disabled in the configuration.
 */
```

<br>

## CLASS: DatabasePartition
**File Path:** `SheetDBLib/src/multi/DatabasePartition.js`
**Constructor Usage:** `const instance = new DatabasePartition();`
**Description:** DatabasePartition representing a single partition (spreadsheet) in a multi-database setup.

/

import { cloneDeep } from '@CoreUtilsLib';

/**
@class DatabasePartition
Configuration entity representing a logical database partition mapping to a unique Google Spreadsheet.
Supports metadata tagging, priority-based routing, and read-only flags for multi-database architectures.

@example
const partition = new DatabasePartition({
  id: 'warehouse_milan',
  spreadsheetId: '1abc...',
  tags: ['europe', 'active'],
  priority: 10
});

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/multi/DatabasePartition.js
 * @description DatabasePartition representing a single partition (spreadsheet) in a multi-database setup.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class DatabasePartition
 * @description Configuration entity representing a logical database partition mapping to a unique Google Spreadsheet.
 * Supports metadata tagging, priority-based routing, and read-only flags for multi-database architectures.
 *
 * @example
 * const partition = new DatabasePartition({
 *   id: 'warehouse_milan',
 *   spreadsheetId: '1abc...',
 *   tags: ['europe', 'active'],
 *   priority: 10
 * });
 */
```

<br>

## CLASS: CrossPartitionQuery
**File Path:** `SheetDBLib/src/multi/CrossPartitionQuery.js`
**Constructor Usage:** `const instance = new CrossPartitionQuery();`
**Description:** Query builder for executing queries across multiple partitions.

/

/**
AggregatedResult - Result of a cross-partition query.

@typedef {Object} AggregatedResult
@property {Object[]} records - All records from all partitions
@property {Map<string, Object[]>} partitionResults - Results by partition ID
@property {number} totalRecords - Total record count
@property {string[]} partitionsQueried - IDs of queried partitions
@property {Map<string, Error>} errors - Errors by partition ID (if any)
@property {number} executionTime - Total execution time in ms
/

/**
@class CrossPartitionQuery
Fluent query builder for distributed data retrieval across multiple DatabasePartition instances.
Aggregates records into a unified structure, injecting `_partitionId` for data provenance.

@example
const results = manager.query('INVENTORY')
  .fromTag('active')
  .select(['sku', 'quantity'])
  .where('quantity', '<', 10)
  .execute();

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/multi/CrossPartitionQuery.js
 * @description Query builder for executing queries across multiple partitions.
 * @version 1.0.0
 */

/**
 * AggregatedResult - Result of a cross-partition query.
 *
 * @typedef {Object} AggregatedResult
 * @property {Object[]} records - All records from all partitions
 * @property {Map<string, Object[]>} partitionResults - Results by partition ID
 * @property {number} totalRecords - Total record count
 * @property {string[]} partitionsQueried - IDs of queried partitions
 * @property {Map<string, Error>} errors - Errors by partition ID (if any)
 * @property {number} executionTime - Total execution time in ms
 */

/**
 * @class CrossPartitionQuery
 * @description Fluent query builder for distributed data retrieval across multiple DatabasePartition instances.
 * Aggregates records into a unified structure, injecting `_partitionId` for data provenance.
 *
 * @example
 * const results = manager.query('INVENTORY')
 *   .fromTag('active')
 *   .select(['sku', 'quantity'])
 *   .where('quantity', '<', 10)
 *   .execute();
 */
```

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

## CLASS: QueryCondition
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.js`
**Constructor Usage:** `const instance = new QueryCondition();`
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
@class QueryCondition
Hierarchical model for data filtering rules.
Supports leaf-node comparisons and recursive branch nodes for AND/OR logic.

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
 * @class QueryCondition
 * @description Hierarchical model for data filtering rules.
 * Supports leaf-node comparisons and recursive branch nodes for AND/OR logic.
 */
```

<br>

## CLASS: QueryAggregation
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.js`
**Constructor Usage:** `const instance = new QueryAggregation();`
**Description:** @param {string} field - Target field path or identifier.
@param {string} [operator='='] - Relational operator.
@param {*} value - Comparison target or collection.
@param {'AND'|'OR'} [type='AND'] - Boolean join logic for sibling/child conditions.
/
  constructor(field, operator, value, type = 'AND') {
    this.field = field;
    this.operator = operator || '=';
    this.value = value;
    this.type = type.toUpperCase();
    this.subConditions = [];
  }

  /**
Direct comparison of a raw value against this condition's configuration.
@param {*} rowValue - Value to evaluate.
@returns {boolean} Comparison result.
/
  compareValue(rowValue) {
    return _compareValues(rowValue, this.operator, this.value);
  }

  /**
Appends a nested condition for recursive evaluation.
@param {QueryCondition} condition - Child node.
@returns {QueryCondition} Current instance for method chaining.
/
  addSubCondition(condition) {
    this.subConditions.push(condition);
    return this;
  }

  /**
Evaluates this condition node (and its hierarchy) against a data record.
Resolves field path prefixes and applies AND/OR branch-cutting logic.
@param {Object} row - Data record to evaluate.
@returns {boolean} Node evaluation result.
/
  evaluate(row) {
    if (this.subConditions.length === 0) {
      if (!this.field || !this.operator) {
        return true;
      }

      let rowValue = row[this.field];
      if (rowValue === undefined) {
        const suffix = `.${this.field}`;
        for (const key in row) {
          if (key.endsWith(suffix)) {
            rowValue = row[key];
            break;
          }
        }
      }

      return this.compareValue(rowValue);
    }

    let result = true;
    if (this.field && this.operator) {
      const rowValue = row[this.field];
      result = this.compareValue(rowValue);
    }

    for (const subCondition of this.subConditions) {
      if (this.type === 'AND') {
        result = result && subCondition.evaluate(row);
        if (!result) break;
      } else {
        result = result || subCondition.evaluate(row);
        if (result) break;
      }
    }

    return result;
  }
}

/**
@class QueryAggregation
Operational model for computing scalar aggregations over record collections.
Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.

### Raw JSDoc Context:
```javascript
/**
   * @param {string} field - Target field path or identifier.
   * @param {string} [operator='='] - Relational operator.
   * @param {*} value - Comparison target or collection.
   * @param {'AND'|'OR'} [type='AND'] - Boolean join logic for sibling/child conditions.
   */
  constructor(field, operator, value, type = 'AND') {
    this.field = field;
    this.operator = operator || '=';
    this.value = value;
    this.type = type.toUpperCase();
    this.subConditions = [];
  }

  /**
   * @description Direct comparison of a raw value against this condition's configuration.
   * @param {*} rowValue - Value to evaluate.
   * @returns {boolean} Comparison result.
   */
  compareValue(rowValue) {
    return _compareValues(rowValue, this.operator, this.value);
  }

  /**
   * @description Appends a nested condition for recursive evaluation.
   * @param {QueryCondition} condition - Child node.
   * @returns {QueryCondition} Current instance for method chaining.
   */
  addSubCondition(condition) {
    this.subConditions.push(condition);
    return this;
  }

  /**
   * @description Evaluates this condition node (and its hierarchy) against a data record.
   * Resolves field path prefixes and applies AND/OR branch-cutting logic.
   * @param {Object} row - Data record to evaluate.
   * @returns {boolean} Node evaluation result.
   */
  evaluate(row) {
    if (this.subConditions.length === 0) {
      if (!this.field || !this.operator) {
        return true;
      }

      let rowValue = row[this.field];
      if (rowValue === undefined) {
        const suffix = `.${this.field}`;
        for (const key in row) {
          if (key.endsWith(suffix)) {
            rowValue = row[key];
            break;
          }
        }
      }

      return this.compareValue(rowValue);
    }

    let result = true;
    if (this.field && this.operator) {
      const rowValue = row[this.field];
      result = this.compareValue(rowValue);
    }

    for (const subCondition of this.subConditions) {
      if (this.type === 'AND') {
        result = result && subCondition.evaluate(row);
        if (!result) break;
      } else {
        result = result || subCondition.evaluate(row);
        if (result) break;
      }
    }

    return result;
  }
}

/**
 * @class QueryAggregation
 * @description Operational model for computing scalar aggregations over record collections.
 * Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.
 */
```

<br>

## CLASS: QueryGroup
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.js`
**Constructor Usage:** `const instance = new QueryGroup();`
**Description:** @param {string} functionName - Aggregation type (e.g., 'SUM', 'AVG').
@param {string} field - Target field path for computation.
@param {string} [alias=null] - Output field name for the aggregated value.
/
  constructor(functionName, field, alias = null) {
    this.function = functionName.toUpperCase();
    this.field = field;
    this.alias = alias || `${this.function}_${this.field}`;
  }

  /**
Internal field resolution supporting path-prefix handling.
@param {Object} row - Data record.
@param {string} field - Target identifier.
@returns {*} Resolved value or undefined.
@private
/
  _getFieldValue(row, field) {
    if (Object.prototype.hasOwnProperty.call(row, field)) {
      return row[field];
    }
    for (const key in row) {
      if (key.endsWith(`.${field}`)) {
        return row[key];
      }
    }
    return undefined;
  }

  /**
Computes the configured aggregation over a collection of records.
@param {Object[]} rows - Data set to process.
@returns {number|null} Scalar result or null if input is empty/invalid.
/
  calculate(rows) {
    if (!rows || rows.length === 0) {
      return null;
    }

    const values = rows
      .map((r) => this._getFieldValue(r, this.field))
      .filter((v) => !_isNullOrUndefined(v));

    if (values.length === 0) {
      return null;
    }

    switch (this.function) {
      case 'COUNT':
        return values.length;
      case 'SUM':
        return values.reduce((acc, val) => acc + _safeParseFloat(val), 0);
      case 'AVG':
        return values.reduce((acc, val) => acc + _safeParseFloat(val), 0) / values.length;
      case 'MIN':
        return Math.min(...values.map((v) => _safeParseFloat(v)));
      case 'MAX':
        return Math.max(...values.map((v) => _safeParseFloat(v)));
      default:
        return null;
    }
  }
}

/**
@class QueryGroup
Logic for dataset partitioning and group-level aggregation.
Generates group keys from field value combinations and applies QueryAggregation rules per group.

### Raw JSDoc Context:
```javascript
/**
   * @param {string} functionName - Aggregation type (e.g., 'SUM', 'AVG').
   * @param {string} field - Target field path for computation.
   * @param {string} [alias=null] - Output field name for the aggregated value.
   */
  constructor(functionName, field, alias = null) {
    this.function = functionName.toUpperCase();
    this.field = field;
    this.alias = alias || `${this.function}_${this.field}`;
  }

  /**
   * @description Internal field resolution supporting path-prefix handling.
   * @param {Object} row - Data record.
   * @param {string} field - Target identifier.
   * @returns {*} Resolved value or undefined.
   * @private
   */
  _getFieldValue(row, field) {
    if (Object.prototype.hasOwnProperty.call(row, field)) {
      return row[field];
    }
    for (const key in row) {
      if (key.endsWith(`.${field}`)) {
        return row[key];
      }
    }
    return undefined;
  }

  /**
   * @description Computes the configured aggregation over a collection of records.
   * @param {Object[]} rows - Data set to process.
   * @returns {number|null} Scalar result or null if input is empty/invalid.
   */
  calculate(rows) {
    if (!rows || rows.length === 0) {
      return null;
    }

    const values = rows
      .map((r) => this._getFieldValue(r, this.field))
      .filter((v) => !_isNullOrUndefined(v));

    if (values.length === 0) {
      return null;
    }

    switch (this.function) {
      case 'COUNT':
        return values.length;
      case 'SUM':
        return values.reduce((acc, val) => acc + _safeParseFloat(val), 0);
      case 'AVG':
        return values.reduce((acc, val) => acc + _safeParseFloat(val), 0) / values.length;
      case 'MIN':
        return Math.min(...values.map((v) => _safeParseFloat(v)));
      case 'MAX':
        return Math.max(...values.map((v) => _safeParseFloat(v)));
      default:
        return null;
    }
  }
}

/**
 * @class QueryGroup
 * @description Logic for dataset partitioning and group-level aggregation.
 * Generates group keys from field value combinations and applies QueryAggregation rules per group.
 */
```

<br>

## CLASS: AdvancedQueryPagination
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryPagination.js`
**Constructor Usage:** `const instance = new AdvancedQueryPagination();`
**Description:** Sorting and pagination optimizations for AdvancedQueryBuilder.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/query/managers/AdvancedQueryPagination.js
 * @description Sorting and pagination optimizations for AdvancedQueryBuilder.
 */
```

### Methods of AdvancedQueryPagination

#### METHOD: AdvancedQueryPagination.if
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryPagination.if(k >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AdvancedQueryPagination.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryPagination.for(const sorting of this.facade.orderByFields);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: AdvancedQueryPagination.for
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryPagination.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
<br>

## CLASS: QueryCache
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryCompiler.js`
**Constructor Usage:** `const instance = new QueryCache();`
**Description:** Execution engine for AdvancedQueryBuilder, including JOIN, GROUP BY, and optimizations.
/

import { HashUtils } from '@CoreUtilsLib';
import { AdvancedQueryParser } from './AdvancedQueryParser.js';

const { _isNullOrUndefined, _safeParseFloat, _compareValues } = AdvancedQueryParser;

/**
@class QueryCache
Internal TTL-based cache manager for advanced query results.
Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/query/managers/AdvancedQueryCompiler.js
 * @description Execution engine for AdvancedQueryBuilder, including JOIN, GROUP BY, and optimizations.
 */

import { HashUtils } from '@CoreUtilsLib';
import { AdvancedQueryParser } from './AdvancedQueryParser.js';

const { _isNullOrUndefined, _safeParseFloat, _compareValues } = AdvancedQueryParser;

/**
 * @class QueryCache
 * @description Internal TTL-based cache manager for advanced query results.
 * Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.
 */
```

<br>

## CLASS: AdvancedQueryCompiler
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryCompiler.js`
**Constructor Usage:** `const instance = new AdvancedQueryCompiler();`
**Description:** @param {Object} service - Cache service implementation (e.g., Apps Script CacheService).
/
  constructor(service) {
    this.service = service;
    this.prefix = 'query_';
    this.expiration = 300;
  }

  /**
Generates a deterministic hash key for a query configuration.
@param {Object} query - AdvancedQueryBuilder instance.
@returns {string} Hashed cache key.
@private
/
  _generateKey(query) {
    const queryJSON = JSON.stringify({
      spreadsheetId: query.dbService ? query.dbService._spreadsheetId : null,
      selectedColumns: query.selectedColumns,
      tableName: query.tableName,
      conditions: query.conditions || null,
      groupBy: query.groupByFields && query.groupByFields.length > 0 ? query.groupByFields : null,
      orderBy: query.orderByFields && query.orderByFields.length > 0 ? query.orderByFields : null,
      limit: query._limit,
      offset: query._offset,
      joins: query.joins && query.joins.length > 0 ? query.joins : null,
      aggregations: query.aggregations && query.aggregations.length > 0 ? query.aggregations : null
    });
    return this.prefix + HashUtils.generateHash(queryJSON);
  }

  /**
Retrieves cached results for a specific query.
@param {Object} query - AdvancedQueryBuilder instance.
@returns {Object[]|null} Cached records or null on miss/error.
/
  get(query) {
    if (!this.service) return null;
    const key = this._generateKey(query);
    const cached = this.service.get(key);
    if (cached === null || cached === undefined) return null;
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }

  /**
Persists query results to the cache with configured TTL.
@param {Object} query - AdvancedQueryBuilder instance.
@param {Object[]} result - Collection of records to cache.
@returns {boolean} True if successfully stored.
/
  store(query, result) {
    if (!this.service) return false;
    const key = this._generateKey(query);
    return this.service.put(key, JSON.stringify(result), this.expiration);
  }

  /**
Invalidates all cached entries (full flush).
@returns {boolean} True if flush was successful.
/
  invalidateTable() {
    if (!this.service) return false;
    this.service.removeAll();
    return true;
  }

  /**
Alias for invalidateTable().
@returns {boolean} True if flush was successful.
/
  clear() {
    if (!this.service) return false;
    return this.service.removeAll();
  }
}

/**
@class AdvancedQueryCompiler
Core execution engine for AdvancedQueryBuilder.
Implements relational logic (JOINs), dataset partitioning (GROUP BY), and performance optimizations (Index probing).

### Raw JSDoc Context:
```javascript
/**
   * @param {Object} service - Cache service implementation (e.g., Apps Script CacheService).
   */
  constructor(service) {
    this.service = service;
    this.prefix = 'query_';
    this.expiration = 300;
  }

  /**
   * @description Generates a deterministic hash key for a query configuration.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @returns {string} Hashed cache key.
   * @private
   */
  _generateKey(query) {
    const queryJSON = JSON.stringify({
      spreadsheetId: query.dbService ? query.dbService._spreadsheetId : null,
      selectedColumns: query.selectedColumns,
      tableName: query.tableName,
      conditions: query.conditions || null,
      groupBy: query.groupByFields && query.groupByFields.length > 0 ? query.groupByFields : null,
      orderBy: query.orderByFields && query.orderByFields.length > 0 ? query.orderByFields : null,
      limit: query._limit,
      offset: query._offset,
      joins: query.joins && query.joins.length > 0 ? query.joins : null,
      aggregations: query.aggregations && query.aggregations.length > 0 ? query.aggregations : null
    });
    return this.prefix + HashUtils.generateHash(queryJSON);
  }

  /**
   * @description Retrieves cached results for a specific query.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @returns {Object[]|null} Cached records or null on miss/error.
   */
  get(query) {
    if (!this.service) return null;
    const key = this._generateKey(query);
    const cached = this.service.get(key);
    if (cached === null || cached === undefined) return null;
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }

  /**
   * @description Persists query results to the cache with configured TTL.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @param {Object[]} result - Collection of records to cache.
   * @returns {boolean} True if successfully stored.
   */
  store(query, result) {
    if (!this.service) return false;
    const key = this._generateKey(query);
    return this.service.put(key, JSON.stringify(result), this.expiration);
  }

  /**
   * @description Invalidates all cached entries (full flush).
   * @returns {boolean} True if flush was successful.
   */
  invalidateTable() {
    if (!this.service) return false;
    this.service.removeAll();
    return true;
  }

  /**
   * @description Alias for invalidateTable().
   * @returns {boolean} True if flush was successful.
   */
  clear() {
    if (!this.service) return false;
    return this.service.removeAll();
  }
}

/**
 * @class AdvancedQueryCompiler
 * @description Core execution engine for AdvancedQueryBuilder.
 * Implements relational logic (JOINs), dataset partitioning (GROUP BY), and performance optimizations (Index probing).
 */
```

<br>

## CLASS: PartitionCoordinator
**File Path:** `SheetDBLib/src/internal/multi-coordination/PartitionCoordinator.js`
**Constructor Usage:** `const instance = new PartitionCoordinator();`
**Description:** Internal module managing partition connections, pooling, and statistics.

/

import { DatabaseService } from '../../DatabaseService.js';
import {
  PartitionConnectionError,
  PartitionNotFoundError
} from '../../multi/MultiDatabaseError.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
@class PartitionCoordinator
Internal orchestration module for partition connection lifecycle management.
Handles lazy initialization of DatabaseService instances, connection pooling, and usage telemetry tracking.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/multi/internal/PartitionCoordinator.js
 * @description Internal module managing partition connections, pooling, and statistics.
 * @version 1.0.0
 */

import { DatabaseService } from '../../DatabaseService.js';
import {
  PartitionConnectionError,
  PartitionNotFoundError
} from '../../multi/MultiDatabaseError.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * @class PartitionCoordinator
 * @description Internal orchestration module for partition connection lifecycle management.
 * Handles lazy initialization of DatabaseService instances, connection pooling, and usage telemetry tracking.
 */
```

<br>

## CLASS: CrossPartitionAggregator
**File Path:** `SheetDBLib/src/internal/multi-coordination/CrossPartitionAggregator.js`
**Constructor Usage:** `const instance = new CrossPartitionAggregator();`
**Description:** Internal module managing query aggregation.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/multi/internal/CrossPartitionAggregator.js
 * @description Internal module managing query aggregation.
 * @version 1.0.0
 */
```

### Methods of CrossPartitionAggregator

#### METHOD: CrossPartitionAggregator.saveAll
- **Scope:** static
- **LLM Call Syntax:** `const result = CrossPartitionAggregator.saveAll(coordinator, options, options.dryRun);`
- **Pure JSDoc:**
```javascript
/**
   * Saves all pending changes across all connected partitions.
   *
   * @param {PartitionCoordinator} coordinator
   * @param {Object} [options={}] - Save options
   * @param {boolean} [options.dryRun=false] - If true, don't persist changes
   * @returns {Object} Save results by partition
   */
```
---
#### METHOD: CrossPartitionAggregator.if
- **Scope:** instance
- **LLM Call Syntax:** `crossPartitionAggregator.if(partition?.isReadOnly && !options.dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CrossPartitionAggregator.catch
- **Scope:** instance
- **LLM Call Syntax:** `crossPartitionAggregator.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: SchemaTemplate
**File Path:** `SheetDBLib/src/internal/dynamic-columns/SchemaTemplate.js`
**Constructor Usage:** `const instance = new SchemaTemplate();`
**Description:** SchemaTemplate representing a schema with dynamic columns.

/

import { cloneDeep } from '@CoreUtilsLib';
import { SchemaValidator, z } from '@GasSchemaValidatorLib';

const templateDefinitionSchema = z.object({
  tableId: z.string(),
  fixedColumns: z.array(z.object({}).passthrough()).optional(),
  dynamicColumns: z.array(z.object({}).passthrough()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

function parseTemplateDefinition(definition) {
  const result = templateDefinitionSchema.safeParse(definition);
  if (!result.success) {
    throw SchemaValidator.toValidationException(result.error, 'SchemaTemplate');
  }
  return result.data;
}

/**
@class SchemaTemplate
Immutable definition of a database table structure containing both static (fixed) and dynamic (family-based) column configurations.
Used as the primary input for SchemaResolver to generate concrete ResolvedSchema objects.

@example
const template = new SchemaTemplate({
  tableId: 'PRODUCTS',
  fixedColumns: [{ name: 'sku', type: 'STRING', primaryKey: true }],
  dynamicColumns: [{ familyId: 'attributes' }]
});

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/dynamic/SchemaTemplate.js
 * @description SchemaTemplate representing a schema with dynamic columns.
 * @version 1.0.0
 */

import { cloneDeep } from '@CoreUtilsLib';
import { SchemaValidator, z } from '@GasSchemaValidatorLib';

const templateDefinitionSchema = z.object({
  tableId: z.string(),
  fixedColumns: z.array(z.object({}).passthrough()).optional(),
  dynamicColumns: z.array(z.object({}).passthrough()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

function parseTemplateDefinition(definition) {
  const result = templateDefinitionSchema.safeParse(definition);
  if (!result.success) {
    throw SchemaValidator.toValidationException(result.error, 'SchemaTemplate');
  }
  return result.data;
}

/**
 * @class SchemaTemplate
 * @description Immutable definition of a database table structure containing both static (fixed) and dynamic (family-based) column configurations.
 * Used as the primary input for SchemaResolver to generate concrete ResolvedSchema objects.
 *
 * @example
 * const template = new SchemaTemplate({
 *   tableId: 'PRODUCTS',
 *   fixedColumns: [{ name: 'sku', type: 'STRING', primaryKey: true }],
 *   dynamicColumns: [{ familyId: 'attributes' }]
 * });
 */
```

<br>

## CLASS: SchemaResolver
**File Path:** `SheetDBLib/src/internal/dynamic-columns/SchemaResolver.js`
**Constructor Usage:** `const instance = new SchemaResolver();`
**Description:** SchemaResolver resolves SchemaTemplates to concrete schemas with expanded columns.

/

import { ColumnFamily, MemberSourceType } from './ColumnFamily.js';
import { SchemaTemplate } from './SchemaTemplate.js';
import { cloneDeep } from '@CoreUtilsLib';
import { SchemaValidator, z } from '@GasSchemaValidatorLib';

const resolverOptionsSchema = z.object({
  familyRegistry: z.union([z.instanceof(Map), z.record(z.string(), z.unknown())]).optional(),
  memberLoader: z.union([z.null(), z.object({}).passthrough()]).optional(),
  logger: z.object({}).passthrough().optional()
});

const resolveOptionsSchema = z.object({
  useCache: z.boolean().optional(),
  context: z.object({}).passthrough().optional()
});

function parseResolverOptions(options) {
  const result = resolverOptionsSchema.safeParse(options);
  if (!result.success) {
    throw SchemaValidator.toValidationException(result.error, 'SchemaResolver');
  }
  return result.data;
}

function parseResolveOptions(options) {
  const result = resolveOptionsSchema.safeParse(options);
  if (!result.success) {
    throw SchemaValidator.toValidationException(result.error, 'SchemaResolver');
  }
  return result.data;
}

/**
ResolvedColumn - Represents a fully resolved column definition.

@typedef {Object} ResolvedColumn
@property {string} name - Column name
@property {string} type - Column data type
@property {boolean} [primaryKey] - Whether this is the primary key
@property {boolean} [nullable] - Whether the column can be null
@property {*} [defaultValue] - Default value for the column
@property {string} [familyId] - ID of the column family (for dynamic columns)
@property {string} [memberKey] - Member key within the family (for dynamic columns)
/

/**
ResolvedSchema - Represents a fully resolved schema with all columns expanded.

@typedef {Object} ResolvedSchema
@property {string} tableId - Table identifier
@property {ResolvedColumn[]} columns - All resolved columns (fixed + dynamic)
@property {string} primaryKeyColumn - Name of the primary key column
@property {Object} metadata - Additional metadata
@property {Date} resolvedAt - When the schema was resolved
/

/**
MemberSourceLoader - Interface for loading column family members from external sources.

@interface MemberSourceLoader
/

/**
@class SchemaResolver
Processes SchemaTemplates to produce ResolvedSchema instances with fully expanded dynamic columns.
Manages ColumnFamily registration and coordinates external member loading for dynamic schemas.

@example
const resolver = new SchemaResolver({ familyRegistry: registry, memberLoader: loader });
const schema = resolver.resolve(template);

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/dynamic/SchemaResolver.js
 * @description SchemaResolver resolves SchemaTemplates to concrete schemas with expanded columns.
 * @version 1.0.0
 */

import { ColumnFamily, MemberSourceType } from './ColumnFamily.js';
import { SchemaTemplate } from './SchemaTemplate.js';
import { cloneDeep } from '@CoreUtilsLib';
import { SchemaValidator, z } from '@GasSchemaValidatorLib';

const resolverOptionsSchema = z.object({
  familyRegistry: z.union([z.instanceof(Map), z.record(z.string(), z.unknown())]).optional(),
  memberLoader: z.union([z.null(), z.object({}).passthrough()]).optional(),
  logger: z.object({}).passthrough().optional()
});

const resolveOptionsSchema = z.object({
  useCache: z.boolean().optional(),
  context: z.object({}).passthrough().optional()
});

function parseResolverOptions(options) {
  const result = resolverOptionsSchema.safeParse(options);
  if (!result.success) {
    throw SchemaValidator.toValidationException(result.error, 'SchemaResolver');
  }
  return result.data;
}

function parseResolveOptions(options) {
  const result = resolveOptionsSchema.safeParse(options);
  if (!result.success) {
    throw SchemaValidator.toValidationException(result.error, 'SchemaResolver');
  }
  return result.data;
}

/**
 * ResolvedColumn - Represents a fully resolved column definition.
 *
 * @typedef {Object} ResolvedColumn
 * @property {string} name - Column name
 * @property {string} type - Column data type
 * @property {boolean} [primaryKey] - Whether this is the primary key
 * @property {boolean} [nullable] - Whether the column can be null
 * @property {*} [defaultValue] - Default value for the column
 * @property {string} [familyId] - ID of the column family (for dynamic columns)
 * @property {string} [memberKey] - Member key within the family (for dynamic columns)
 */

/**
 * ResolvedSchema - Represents a fully resolved schema with all columns expanded.
 *
 * @typedef {Object} ResolvedSchema
 * @property {string} tableId - Table identifier
 * @property {ResolvedColumn[]} columns - All resolved columns (fixed + dynamic)
 * @property {string} primaryKeyColumn - Name of the primary key column
 * @property {Object} metadata - Additional metadata
 * @property {Date} resolvedAt - When the schema was resolved
 */

/**
 * MemberSourceLoader - Interface for loading column family members from external sources.
 *
 * @interface MemberSourceLoader
 */

/**
 * @class SchemaResolver
 * @description Processes SchemaTemplates to produce ResolvedSchema instances with fully expanded dynamic columns.
 * Manages ColumnFamily registration and coordinates external member loading for dynamic schemas.
 *
 * @example
 * const resolver = new SchemaResolver({ familyRegistry: registry, memberLoader: loader });
 * const schema = resolver.resolve(template);
 */
```

<br>

## CLASS: FamilyAggregator
**File Path:** `SheetDBLib/src/internal/dynamic-columns/FamilyAggregator.js`
**Constructor Usage:** `const instance = new FamilyAggregator();`
**Description:** FamilyAggregator provides aggregation operations on column families.

/

import { ColumnFamily } from './ColumnFamily.js';
import { ColumnType, coerceToType } from './ColumnType.js';
import { getFamilyOrThrow } from './FamilyMapUtils.js';

/**
AggregationType - Supported aggregation operations.

@enum {string}
@readonly
/
export const AggregationType = Object.freeze({
  /** Sum of all values */
  SUM: 'SUM',
  /** Average of all values */
  AVG: 'AVG',
  /** Minimum value */
  MIN: 'MIN',
  /** Maximum value */
  MAX: 'MAX',
  /** Count of non-null values */
  COUNT: 'COUNT',
  /** Count of distinct values */
  COUNT_DISTINCT: 'COUNT_DISTINCT',
  /** First non-null value */
  FIRST: 'FIRST',
  /** Last non-null value */
  LAST: 'LAST',
  /** Concatenate string values */
  CONCAT: 'CONCAT',
  /** Collect values into array */
  COLLECT: 'COLLECT'
});

/**
AggregationResult - Result of a family aggregation.

@typedef {Object} AggregationResult
@property {string} familyId - The family ID
@property {string} aggregationType - The aggregation type
@property {*} value - The aggregated value
@property {number} inputCount - Number of input values
@property {number} nullCount - Number of null values
/

/**
@class FamilyAggregator
Logic for cross-column and cross-row aggregations on ColumnFamily structures.
Supports SUM, AVG, MIN, MAX, COUNT, COUNT_DISTINCT, FIRST, LAST, CONCAT, and COLLECT operations.

@example
const agg = new FamilyAggregator({ families: [metricsFamily] });
const total = agg.aggregateRow(row, 'metrics', AggregationType.SUM);

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/dynamic/FamilyAggregator.js
 * @description FamilyAggregator provides aggregation operations on column families.
 * @version 1.0.0
 */

import { ColumnFamily } from './ColumnFamily.js';
import { ColumnType, coerceToType } from './ColumnType.js';
import { getFamilyOrThrow } from './FamilyMapUtils.js';

/**
 * AggregationType - Supported aggregation operations.
 *
 * @enum {string}
 * @readonly
 */
export const AggregationType = Object.freeze({
  /** Sum of all values */
  SUM: 'SUM',
  /** Average of all values */
  AVG: 'AVG',
  /** Minimum value */
  MIN: 'MIN',
  /** Maximum value */
  MAX: 'MAX',
  /** Count of non-null values */
  COUNT: 'COUNT',
  /** Count of distinct values */
  COUNT_DISTINCT: 'COUNT_DISTINCT',
  /** First non-null value */
  FIRST: 'FIRST',
  /** Last non-null value */
  LAST: 'LAST',
  /** Concatenate string values */
  CONCAT: 'CONCAT',
  /** Collect values into array */
  COLLECT: 'COLLECT'
});

/**
 * AggregationResult - Result of a family aggregation.
 *
 * @typedef {Object} AggregationResult
 * @property {string} familyId - The family ID
 * @property {string} aggregationType - The aggregation type
 * @property {*} value - The aggregated value
 * @property {number} inputCount - Number of input values
 * @property {number} nullCount - Number of null values
 */

/**
 * @class FamilyAggregator
 * @description Logic for cross-column and cross-row aggregations on ColumnFamily structures.
 * Supports SUM, AVG, MIN, MAX, COUNT, COUNT_DISTINCT, FIRST, LAST, CONCAT, and COLLECT operations.
 *
 * @example
 * const agg = new FamilyAggregator({ families: [metricsFamily] });
 * const total = agg.aggregateRow(row, 'metrics', AggregationType.SUM);
 */
```

<br>

## CLASS: DynamicColumnAccessor
**File Path:** `SheetDBLib/src/internal/dynamic-columns/DynamicColumnAccessor.js`
**Constructor Usage:** `const instance = new DynamicColumnAccessor();`
**Description:** DynamicColumnAccessor provides type-safe access to dynamic columns in rows.

/

import { ColumnFamily } from './ColumnFamily.js';
import { coerceToType } from './ColumnType.js';
import { getFamilyOrThrow } from './FamilyMapUtils.js';

/**
@class DynamicColumnAccessor
State-safe wrapper for row objects providing type-coerced access to ColumnFamily members.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/dynamic/DynamicColumnAccessor.js
 * @description DynamicColumnAccessor provides type-safe access to dynamic columns in rows.
 * @version 1.0.0
 */

import { ColumnFamily } from './ColumnFamily.js';
import { coerceToType } from './ColumnType.js';
import { getFamilyOrThrow } from './FamilyMapUtils.js';

/**
 * @class DynamicColumnAccessor
 * @description State-safe wrapper for row objects providing type-coerced access to ColumnFamily members.
 */
```

<br>

## CLASS: ColumnFamily
**File Path:** `SheetDBLib/src/internal/dynamic-columns/ColumnFamily.js`
**Constructor Usage:** `const instance = new ColumnFamily();`
**Description:** ColumnFamily representing a group of dynamically generated columns.

/

import { ColumnType, isValidColumnType } from './ColumnType.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
MemberSource types for determining where column family members come from.

@readonly
@enum {string}
/
export const MemberSourceType = Object.freeze({
  /** Members are defined inline in the configuration */
  STATIC: 'STATIC',

  /** Members come from external configuration */
  CONFIG: 'CONFIG',

  /** Members come from a query result */
  QUERY: 'QUERY'
});

/**
@class ColumnFamily
Immutable Value Object defining a template for generating multiple spreadsheet columns based on a key pattern (e.g., 'attr_{{key}}').

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/dynamic/ColumnFamily.js
 * @description ColumnFamily representing a group of dynamically generated columns.
 * @version 1.0.0
 */

import { ColumnType, isValidColumnType } from './ColumnType.js';
import { cloneDeep } from '@CoreUtilsLib';

/**
 * MemberSource types for determining where column family members come from.
 *
 * @readonly
 * @enum {string}
 */
export const MemberSourceType = Object.freeze({
  /** Members are defined inline in the configuration */
  STATIC: 'STATIC',

  /** Members come from external configuration */
  CONFIG: 'CONFIG',

  /** Members come from a query result */
  QUERY: 'QUERY'
});

/**
 * @class ColumnFamily
 * @description Immutable Value Object defining a template for generating multiple spreadsheet columns based on a key pattern (e.g., 'attr_{{key}}').
 */
```

<br>

## CLASS: DatabaseTableRegistry
**File Path:** `SheetDBLib/src/internal/database-managers/DatabaseTableRegistry.js`
**Constructor Usage:** `const instance = new DatabaseTableRegistry();`
**Description:** Manager for table registration and lifecycle within the database.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/managers/DatabaseTableRegistry.js
 * @description Manager for table registration and lifecycle within the database.
 */
```

### Methods of DatabaseTableRegistry

#### METHOD: DatabaseTableRegistry.getTable
- **Scope:** instance
- **LLM Call Syntax:** `databaseTableRegistry.getTable(tableName);`
- **Pure JSDoc:**
```javascript
/** Method getTable */
```
---
#### METHOD: DatabaseTableRegistry.hasTable
- **Scope:** instance
- **LLM Call Syntax:** `databaseTableRegistry.hasTable(tableName);`
- **Pure JSDoc:**
```javascript
/** Method hasTable */
```
---
#### METHOD: DatabaseTableRegistry.listTables
- **Scope:** instance
- **LLM Call Syntax:** `databaseTableRegistry.listTables();`
- **Pure JSDoc:**
```javascript
/** Method listTables */
```
---
<br>

## CLASS: DatabaseSchemaExplorer
**File Path:** `SheetDBLib/src/internal/database-managers/DatabaseSchemaExplorer.js`
**Constructor Usage:** `const instance = new DatabaseSchemaExplorer();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of DatabaseSchemaExplorer

#### METHOD: DatabaseSchemaExplorer.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseSchemaExplorer.if(!expected || expected.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseSchemaExplorer.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseSchemaExplorer.if(sheets.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseSchemaExplorer.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseSchemaExplorer.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: DatabaseMetaDataHandler
**File Path:** `SheetDBLib/src/internal/database-managers/DatabaseMetaDataHandler.js`
**Constructor Usage:** `const instance = new DatabaseMetaDataHandler();`
**Description:** Manager for database metadata, configuration flags, and dry-run logic.

### Raw JSDoc Context:
```javascript
/**
 * @file SheetDBLib/src/managers/DatabaseMetaDataHandler.js
 * @description Manager for database metadata, configuration flags, and dry-run logic.
 */
```

### Methods of DatabaseMetaDataHandler

#### METHOD: DatabaseMetaDataHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseMetaDataHandler.if(typeof options.dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseMetaDataHandler.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `databaseMetaDataHandler.getMetadata();`
- **Pure JSDoc:**
```javascript
/** Method getMetadata */
```
---
<br>

## CLASS: DatabaseConnectionManager
**File Path:** `SheetDBLib/src/internal/database-managers/DatabaseConnectionManager.js`
**Constructor Usage:** `const instance = new DatabaseConnectionManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of DatabaseConnectionManager

#### METHOD: DatabaseConnectionManager.save
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.save(options);`
- **Pure JSDoc:**
```javascript
/** Method save */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(this.facade._inTransaction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(dirtyRows > 0 || newRows > 0 || deletedRows > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(pendingChanges.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseConnectionManager.beginTransaction
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.beginTransaction();`
- **Pure JSDoc:**
```javascript
/** Method beginTransaction */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(this.facade._inTransaction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.for
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.for(const tableName in this.facade.tables);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DatabaseConnectionManager.commit
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.commit();`
- **Pure JSDoc:**
```javascript
/** Method commit */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(!this.facade._inTransaction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseConnectionManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.catch(rollbackError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseConnectionManager.rollback
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.rollback();`
- **Pure JSDoc:**
```javascript
/** Method rollback */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(!this.facade._inTransaction);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(!this.facade._transaction || !this.facade._transaction.savedStates);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.for
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.for(const tableName in this.facade._transaction.savedStates);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(this.facade.tables[tableName]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.if
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.if(this._spreadsheetService._batchUpdates);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DatabaseConnectionManager.inTransaction
- **Scope:** instance
- **LLM Call Syntax:** `databaseConnectionManager.inTransaction();`
- **Pure JSDoc:**
```javascript
/** Method inTransaction */
```
---
<br>
