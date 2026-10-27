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

### Methods of TableService

#### METHOD: TableService.ALPHABET_SIZE
- **Scope:** instance
- **LLM Call Syntax:** `tableService.ALPHABET_SIZE();`
- **Pure JSDoc:**
```javascript
/** Method ALPHABET_SIZE */
```
---
#### METHOD: TableService.ASCII_CODE_A
- **Scope:** instance
- **LLM Call Syntax:** `tableService.ASCII_CODE_A();`
- **Pure JSDoc:**
```javascript
/** Method ASCII_CODE_A */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(preloadedData);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(preloadedData && this._rowsCache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const row of this._rowsCache);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.insertRow
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.insertRow(rowObj);`
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
#### METHOD: TableService.insertRows
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.insertRows(rowsArray);`
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
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const rowObj of rowsArray);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._keyField && !completeRow[this._keyField]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const row of completeRows);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableService.updateRowById
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.updateRowById(id, rowObj);`
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
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const col of physicalColumns);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableService.patchRow
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.patchRow(id, partialObj);`
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
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._virtualColumns[key]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(oldValue !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(changedColumns.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableService.deleteRowById
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.deleteRowById(id);`
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
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(insertIndex !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableService.updateRowsByIds
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.updateRowsByIds(updatesObj);`
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
#### METHOD: TableService.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableService.deleteRowsByIds
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.deleteRowsByIds(ids);`
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
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!ids || ids.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const id of ids);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(result);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableService.setSchema
- **Scope:** instance
- **LLM Call Syntax:** `tableService.setSchema(zodSchema);`
- **Pure JSDoc:**
```javascript
/** Method setSchema */
```
---
#### METHOD: TableService.disableSchemaValidation
- **Scope:** instance
- **LLM Call Syntax:** `tableService.disableSchemaValidation();`
- **Pure JSDoc:**
```javascript
/** Method disableSchemaValidation */
```
---
#### METHOD: TableService.enableSchemaValidation
- **Scope:** instance
- **LLM Call Syntax:** `tableService.enableSchemaValidation();`
- **Pure JSDoc:**
```javascript
/** Method enableSchemaValidation */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!this._schema);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!this._schemaValidationEnabled || !this._schema);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!this._schemaValidator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!result.success);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.fuzzySearch
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.fuzzySearch(query, fields, threshold, options);`
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
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!query || typeof query !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(typeof threshold !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.fuzzySearchRows
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.fuzzySearchRows(rows, query, fields, threshold, options);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes fuzzy matching against an already materialized row set.
   * This keeps all Fuse configuration within the table search boundary for callers
   * such as AdvancedQueryBuilder that have already narrowed their candidates.
   * @param {Object[]} rows - Candidate records to search.
   * @param {string} query - Search term.
   * @param {string[]} fields - Candidate fields to inspect.
   * @param {number} [threshold=0.3] - Fuse.js sensitivity (0.0 to 1.0).
   * @param {Object} [options={}] - Fuse.js configuration overrides.
   * @returns {Object[]} Fuse.js result objects (item, refIndex, score).
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!query || typeof query !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(typeof threshold !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.createIndex
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.createIndex(columnName);`
- **Pure JSDoc:**
```javascript
/**
   * @function createIndex
   * @description Builds a Map-based memory index for O(1) lookups on a specific column.
   * @param {string} columnName - Target physical column.
   * @returns {TableService} The instance for chaining.
   * @throws {Error} If columnName is missing from table schema.
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!this._indices[columnName]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!rowIndices);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.invalidateIndex
- **Scope:** instance
- **LLM Call Syntax:** `tableService.invalidateIndex(columnName);`
- **Pure JSDoc:**
```javascript
/**
   * @function invalidateIndex
   * @description Purges memory indices.
   * @param {string|null} [columnName=null] - Specific column ID or null for global purge.
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(columnName);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.getRows
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.getRows(options, options.preserveEmptyRows);`
- **Pure JSDoc:**
```javascript
/**
   * @function getRows
   * @description Retrieves all records as plain objects. Lazy-loads data on first call. Virtual columns are recomputed only if version mismatches.
   * @param {Object} [options={}] Read options.
   * @param {boolean} [options.preserveEmptyRows=false] Read a fresh persisted-sheet snapshot,
   * retaining blank rows as empty objects so array index + 2 is the physical sheet row.
   * This mode excludes virtual columns and pending writes, and does not alter CRUD caches/queues.
   * @returns {Object[]} Cloned array of row objects.
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(options.preserveEmptyRows);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._processedRowsCache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.flush
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.flush(id, options, options.dryRun);`
- **Pure JSDoc:**
```javascript
/**
   * Deletes a row from the spreadsheet identified by its primary key.
   *
   * @param {string|number} id - The value of the primary key of the row to delete
   * @returns {boolean} `true` if deletion was successful, `false` otherwise
   *
   * @example
   * const deleted = table.deleteRowById('USER_123');
   * if (deleted) {
   *   console.log('User deleted successfully');
   * }
   */

  /**
   * @function flush
   * @description Synchronizes queued changes (deletes, updates, inserts) to Google Sheets via batch API calls.
   * @param {Object} [options={}] - Options.
   * @param {boolean} [options.dryRun=false] - If true, skips API execution.
   * @returns {number} Count of batch operations performed.
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._insertQueue.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const row of this._insertQueue);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!this._virtualColumns[key]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._deleteQueue.size > 0 && !options.dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const id of deleteIds);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(idx !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(realRowIndicesToDelete.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._updateQueue.size > 0 && !options.dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(idx !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const col of physicalColumns);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(updates.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._insertQueue.length > 0 && !options.dryRun);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(writeHeader);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const row of this._insertQueue);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.setPrimaryKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.setPrimaryKey(columnName);`
- **Pure JSDoc:**
```javascript
/**
   * @function setPrimaryKey
   * @description Overrides auto-detection of PK column. Re-triggers PK mapping.
   * @param {string} columnName - Target physical column name.
   * @returns {TableService} For chaining.
   */
```
---
#### METHOD: TableService.getKeyField
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.getKeyField();`
- **Pure JSDoc:**
```javascript
/**
   * @function getKeyField
   * @description Effective primary-key column name (manual override or auto-detected).
   * @returns {string}
   */
```
---
#### METHOD: TableService.getRowById
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.getRowById(id);`
- **Pure JSDoc:**
```javascript
/**
   * @function getRowById
   * @description O(1) lookup (if indexed) or O(N) scan for a specific record.
   * @param {string|number} id - PK value.
   * @returns {Object|null} Hydrated row object or null.
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.defineVirtualColumn
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.defineVirtualColumn(columnName, computeFunction);`
- **Pure JSDoc:**
```javascript
/**
   * @function defineVirtualColumn
   * @description Registers a computed property. Invalidates internal processed cache.
   * @param {string} columnName - Virtual property key.
   * @param {Function} computeFunction - Logic: (row) => any.
   * @returns {TableService} For chaining.
   * @throws {Error} If computeFunction is not a function.
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(typeof computeFunction !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.getByPK
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.getByPK(pkValue);`
- **Pure JSDoc:**
```javascript
/**
   * @function getByPK
   * @alias getRowById
   * @param {*} pkValue - PK value.
   * @returns {Object|null}
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(targetRowIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.getAllRows
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableService.getAllRows(options);`
- **Pure JSDoc:**
```javascript
/**
   * @function getAllRows
   * @alias getRows
   * @param {Object} [options={}] Same read options as getRows, including preserveEmptyRows.
   * @returns {Object[]}
   */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(options.data);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(options.indices);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._dataLoaded);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const row of this._rowsCache);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!data || data.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(options.preserveEmptyRows);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(let j);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(header[j]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!this._keyField || !row[this._keyField]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!this._virtualColumns[key]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._indices[this._keyField] && this._indices[this._keyField][id] !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(!headerData || headerData.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(this._manualPrimaryKey);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(idField);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableService.for
- **Scope:** instance
- **LLM Call Syntax:** `tableService.for(const columnName in this._virtualColumns);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TableService.catch
- **Scope:** instance
- **LLM Call Syntax:** `tableService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TableService.while
- **Scope:** instance
- **LLM Call Syntax:** `tableService.while(tempIndex > 0);`
- **Pure JSDoc:**
```javascript
/** Method while */
```
---
#### METHOD: TableService.if
- **Scope:** instance
- **LLM Call Syntax:** `tableService.if(pkIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
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

### Methods of TableServiceMock

#### METHOD: TableServiceMock.if
- **Scope:** instance
- **LLM Call Syntax:** `tableServiceMock.if(index !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableServiceMock.if
- **Scope:** instance
- **LLM Call Syntax:** `tableServiceMock.if(index !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableServiceMock.if
- **Scope:** instance
- **LLM Call Syntax:** `tableServiceMock.if(start);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TableServiceMock.setData
- **Scope:** instance
- **LLM Call Syntax:** `const result = tableServiceMock.setData(data);`
- **Pure JSDoc:**
```javascript
/**
   * @description Pre-populates the mock table with a collection of records.
   * @param {Object[]} data - Records to load into memory.
   * @returns {TableServiceMock} Current instance for chaining.
   */
```
---
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

### Methods of DatabaseServiceMock

#### METHOD: DatabaseServiceMock.registerTable
- **Scope:** instance
- **LLM Call Syntax:** `const result = databaseServiceMock.registerTable(name, mock);`
- **Pure JSDoc:**
```javascript
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
```
---
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

### Methods of QueryCache

#### METHOD: QueryCache.if
- **Scope:** instance
- **LLM Call Syntax:** `queryCache.if(!this.service);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryCache.if
- **Scope:** instance
- **LLM Call Syntax:** `queryCache.if(cached);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryCache.catch
- **Scope:** instance
- **LLM Call Syntax:** `queryCache.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: QueryCache.store
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryCache.store(query, result);`
- **Pure JSDoc:**
```javascript
/**
   * @description Persists query results to the cache with configured TTL.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @param {Object[]} result - Collection of records to cache.
   * @returns {boolean} True if successfully stored.
   */
```
---
#### METHOD: QueryCache.if
- **Scope:** instance
- **LLM Call Syntax:** `queryCache.if(!this.service);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryCache.invalidateTable
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryCache.invalidateTable();`
- **Pure JSDoc:**
```javascript
/**
   * @description Invalidates all cached entries (full flush).
   * @returns {boolean} True if flush was successful.
   */
```
---
#### METHOD: QueryCache.if
- **Scope:** instance
- **LLM Call Syntax:** `queryCache.if(!this.service);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
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

### Methods of QueryAggregation

#### METHOD: QueryAggregation.for
- **Scope:** instance
- **LLM Call Syntax:** `queryAggregation.for(const key in row);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: QueryAggregation.calculate
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryAggregation.calculate(rows);`
- **Pure JSDoc:**
```javascript
/**
   * @description Computes the configured aggregation over a collection of records.
   * @param {Object[]} rows - Data set to process.
   * @returns {number|null} Scalar result or null if input is empty/invalid.
   */
```
---
#### METHOD: QueryAggregation.if
- **Scope:** instance
- **LLM Call Syntax:** `queryAggregation.if(!rows || rows.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryAggregation.if
- **Scope:** instance
- **LLM Call Syntax:** `queryAggregation.if(values.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueryAggregation.switch
- **Scope:** instance
- **LLM Call Syntax:** `queryAggregation.switch(this.function);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
<br>

