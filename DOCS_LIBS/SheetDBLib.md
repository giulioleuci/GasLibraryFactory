# API Reference: SheetDBLib

## CLASS: TableService
**File Path:** `SheetDBLib/src/TableService.ts`
**Constructor Usage:** `const instance = new TableService();`
**Description:** ORM-lite facade for a single Google Sheet. Orchestrates CRUD, validation, computed virtual columns, and write-through caching.

### Raw JSDoc Context:
```javascript
/**
 * @class TableService
 * @description ORM-lite facade for a single Google Sheet. Orchestrates CRUD, validation, computed virtual columns, and write-through caching.
 */
```

### Methods and properties of TableService

#### PROPERTY: TableService.ALPHABET_SIZE
- **Scope:** static
- **LLM Call Syntax:** `const result = TableService.ALPHABET_SIZE;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: TableService.ASCII_CODE_A
- **Scope:** static
- **LLM Call Syntax:** `const result = TableService.ASCII_CODE_A;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.insertRow
- **Scope:** instance
- **LLM Call Syntax:** `tableService.insertRow();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.insertRows
- **Scope:** instance
- **LLM Call Syntax:** `tableService.insertRows();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.updateRowById
- **Scope:** instance
- **LLM Call Syntax:** `tableService.updateRowById();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.patchRow
- **Scope:** instance
- **LLM Call Syntax:** `tableService.patchRow();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.deleteRowById
- **Scope:** instance
- **LLM Call Syntax:** `tableService.deleteRowById();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.updateRowsByIds
- **Scope:** instance
- **LLM Call Syntax:** `tableService.updateRowsByIds();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.deleteRowsByIds
- **Scope:** instance
- **LLM Call Syntax:** `tableService.deleteRowsByIds();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.setSchema
- **Scope:** instance
- **LLM Call Syntax:** `tableService.setSchema();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.disableSchemaValidation
- **Scope:** instance
- **LLM Call Syntax:** `tableService.disableSchemaValidation();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.enableSchemaValidation
- **Scope:** instance
- **LLM Call Syntax:** `tableService.enableSchemaValidation();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._validateRow
- **Scope:** instance
- **LLM Call Syntax:** `tableService._validateRow();`
- **Pure JSDoc:**
```javascript
/** @private @description Validates a row against the schema. */
```
---
#### METHOD: TableService.fuzzySearch
- **Scope:** instance
- **LLM Call Syntax:** `tableService.fuzzySearch();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
#### METHOD: TableService.createIndex
- **Scope:** instance
- **LLM Call Syntax:** `tableService.createIndex();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._indexedLookup
- **Scope:** instance
- **LLM Call Syntax:** `tableService._indexedLookup();`
- **Pure JSDoc:**
```javascript
/** @private @description Performs an indexed lookup. */
```
---
#### METHOD: TableService.invalidateIndex
- **Scope:** instance
- **LLM Call Syntax:** `tableService.invalidateIndex();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.getRows
- **Scope:** instance
- **LLM Call Syntax:** `tableService.getRows();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.flush
- **Scope:** instance
- **LLM Call Syntax:** `tableService.flush();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.setPrimaryKey
- **Scope:** instance
- **LLM Call Syntax:** `tableService.setPrimaryKey();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.getKeyField
- **Scope:** instance
- **LLM Call Syntax:** `tableService.getKeyField();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.getRowById
- **Scope:** instance
- **LLM Call Syntax:** `tableService.getRowById();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.defineVirtualColumn
- **Scope:** instance
- **LLM Call Syntax:** `tableService.defineVirtualColumn();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.getByPK
- **Scope:** instance
- **LLM Call Syntax:** `tableService.getByPK();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService.getAllRows
- **Scope:** instance
- **LLM Call Syntax:** `tableService.getAllRows();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._invalidateInternalCache
- **Scope:** instance
- **LLM Call Syntax:** `tableService._invalidateInternalCache();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._ensureDataLoaded
- **Scope:** instance
- **LLM Call Syntax:** `tableService._ensureDataLoaded();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._processRawData
- **Scope:** instance
- **LLM Call Syntax:** `tableService._processRawData();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._coerceValue
- **Scope:** instance
- **LLM Call Syntax:** `tableService._coerceValue();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._storeOriginalRowData
- **Scope:** instance
- **LLM Call Syntax:** `tableService._storeOriginalRowData();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._findRowIndexById
- **Scope:** instance
- **LLM Call Syntax:** `tableService._findRowIndexById();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._loadHeader
- **Scope:** instance
- **LLM Call Syntax:** `tableService._loadHeader();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._determinePrimaryKey
- **Scope:** instance
- **LLM Call Syntax:** `tableService._determinePrimaryKey();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._applyVirtualColumns
- **Scope:** instance
- **LLM Call Syntax:** `tableService._applyVirtualColumns();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._convertIndexToColumn
- **Scope:** instance
- **LLM Call Syntax:** `tableService._convertIndexToColumn();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TableService._getPkColumnLetter
- **Scope:** instance
- **LLM Call Syntax:** `tableService._getPkColumnLetter();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DatabaseService
**File Path:** `SheetDBLib/src/DatabaseService.ts`
**Constructor Usage:** `const instance = new DatabaseService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DatabaseService

#### METHOD: DatabaseService.save
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.save();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.beginTransaction
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.beginTransaction();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.commit
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.commit();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.rollback
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.rollback();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService._performRollback
- **Scope:** instance
- **LLM Call Syntax:** `databaseService._performRollback();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.inTransaction
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.inTransaction();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService._readVerifiedSheetInfo
- **Scope:** instance
- **LLM Call Syntax:** `databaseService._readVerifiedSheetInfo();`
- **Pure JSDoc:**
```javascript
/**
   * Reads sheet metadata via the Advanced Sheets API, retrying (bounded, with a short
   * pause between attempts) when `this._verifyTables` names aren't all present yet.
   * `SpreadsheetApp.flush()` only guarantees `SpreadsheetApp`-view consistency — the
   * Advanced Sheets API (`Sheets.Spreadsheets.get`, what `getSheetInfo` calls) is a
   * separate REST-backed read path that can briefly lag a structural write (new/renamed
   * sheet) even after flush(). Costs nothing extra when the caller doesn't opt in, or
   * when the first read already satisfies it.
   */
```
---
#### METHOD: DatabaseService._allTablesVisible
- **Scope:** instance
- **LLM Call Syntax:** `databaseService._allTablesVisible();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService._initialize
- **Scope:** instance
- **LLM Call Syntax:** `databaseService._initialize();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.getTable
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.getTable();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.hasTable
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.hasTable();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.listTables
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.listTables();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService._isDryRun
- **Scope:** instance
- **LLM Call Syntax:** `databaseService._isDryRun();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.getMetadata();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatabaseService.select
- **Scope:** instance
- **LLM Call Syntax:** `databaseService.select();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: TableServiceMock
**File Path:** `SheetDBLib/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new TableServiceMock();`
**Description:** Mock implementation of TableService for unit testing CRUD logic.
Manages an internal array of records and simulates primary key generation and indexing.

### Raw JSDoc Context:
```javascript
/**
 * @class TableServiceMock
 * @description Mock implementation of TableService for unit testing CRUD logic.
 * Manages an internal array of records and simulates primary key generation and indexing.
 */
```

### Methods and properties of TableServiceMock

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
**File Path:** `SheetDBLib/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new DatabaseServiceMock();`
**Description:** High-fidelity mock for DatabaseService.
Orchestrates TableServiceMock instances and provides a unified interface for mocking database-wide operations.

### Raw JSDoc Context:
```javascript
/**
 * @class DatabaseServiceMock
 * @description High-fidelity mock for DatabaseService.
 * Orchestrates TableServiceMock instances and provides a unified interface for mocking database-wide operations.
 */
```

### Methods and properties of DatabaseServiceMock

#### METHOD: DatabaseServiceMock.registerTable
- **Scope:** instance
- **LLM Call Syntax:** `const result = databaseServiceMock.registerTable(name, mock);`
- **Pure JSDoc:**
```javascript
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
**File Path:** `SheetDBLib/src/query/AdvancedQueryBuilder.ts`
**Constructor Usage:** `const instance = new QueryCache();`
**Description:** Internal TTL-based cache manager for advanced query results.
Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.

### Raw JSDoc Context:
```javascript
/**
 * @class QueryCache
 * @description Internal TTL-based cache manager for advanced query results.
 * Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.
 */
```

### Methods and properties of QueryCache

#### METHOD: QueryCache._generateKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryCache._generateKey(query);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates a deterministic hash key for a query configuration.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @returns {string} Hashed cache key.
   * @private
   */
```
---
#### METHOD: QueryCache.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryCache.get(query);`
- **Pure JSDoc:**
```javascript
/**
   * @description Retrieves cached results for a specific query.
   * @param {Object} query - AdvancedQueryBuilder instance.
   * @returns {Object[]|null} Cached records or null on miss/error.
   */
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
<br>

## CLASS: AdvancedQueryBuilder
**File Path:** `SheetDBLib/src/query/AdvancedQueryBuilder.ts`
**Constructor Usage:** `const instance = new AdvancedQueryBuilder();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of AdvancedQueryBuilder

#### METHOD: AdvancedQueryBuilder.select
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.select();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.from
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.from();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.join
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.join();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.leftJoin
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.leftJoin();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.rightJoin
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.rightJoin();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.fullOuterJoin
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.fullOuterJoin();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.where
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.where();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.orWhere
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.orWhere();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.or
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.or();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.andWhere
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.andWhere();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.and
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.and();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.whereLike
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.whereLike();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.whereFuzzy
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.whereFuzzy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.orWhereFuzzy
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.orWhereFuzzy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.whereIn
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.whereIn();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.groupBy
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.groupBy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.sum
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.sum();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.avg
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.avg();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.count
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.count();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.min
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.min();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.max
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.max();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.orderBy
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.orderBy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.orderByDesc
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.orderByDesc();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.limit
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.limit();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.offset
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.offset();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.paginate
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.paginate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder._extractFieldValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._extractFieldValue(row, fieldSpec);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves a field value from a row, supporting dotted-path prefixes (e.g., 'Table.Field').
   * @param {Object} row - Data record.
   * @param {string} fieldSpec - Target field identifier or path.
   * @returns {*} Value from the row or undefined.
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._performJoin
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._performJoin(leftRows, joinConfig);`
- **Pure JSDoc:**
```javascript
/**
   * @description Internal JOIN dispatcher. Supports LEFT, RIGHT, INNER, and FULL joins.
   * Uses hash-join optimization for equality operators.
   * @param {Object[]} leftRows - Pre-filtered records from the primary table.
   * @param {Object} joinConfig - Join specification (table, type, keys, operator).
   * @returns {Object[]} Merged result set with prefixed keys.
   * @throws {Error} If the target join table is not registered in the DatabaseService.
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._tryIndexOptimization
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._tryIndexOptimization(table);`
- **Pure JSDoc:**
```javascript
/**
   * @description Attempts to bypass full table scans by probing Primary Keys or secondary indices.
   * Selects the index with the lowest cardinality for optimized filtering.
   * @param {Object} table - TableService instance to probe.
   * @returns {Object[]|null} Filtered records from index or null if no optimization is viable.
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._getRemainingConditions
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._getRemainingConditions();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the subset of query conditions that were not satisfied by index optimization.
   * @returns {Object[]} Collection of pending conditions for full-scan filtering.
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._getFieldValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._getFieldValue(row, field);`
- **Pure JSDoc:**
```javascript
/**
   * @description Low-level field resolution supporting direct keys, table-prefixed keys, and cross-join suffixes.
   * @param {Object} row - Target record.
   * @param {string} field - Field identifier.
   * @returns {*} Resolved value or undefined.
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._applyConditionsFiltered
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._applyConditionsFiltered(rows, conditions);`
- **Pure JSDoc:**
```javascript
/**
   * @description Applies a collection of conditions to a result set using AND/OR logic.
   * @param {Object[]} rows - Collection of records to filter.
   * @param {Object[]} conditions - The conditions to evaluate.
   * @returns {Object[]} Filtered result set.
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._compileFuzzyMatches
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._compileFuzzyMatches(rows, conditions);`
- **Pure JSDoc:**
```javascript
/**
   * Builds one Fuse index per fuzzy condition for the current materialized row set.
   * Results are consumed as membership sets, so filtering retains the source-row
   * ordering already established by the query pipeline (including equal scores).
   *
   * @param {Object[]} rows Materialized candidate rows.
   * @param {Object[]} conditions Conditions to inspect.
   * @returns {Map<number, Set<Object>>} Matches indexed by condition position.
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._applyConditions
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._applyConditions(rows);`
- **Pure JSDoc:**
```javascript
/**
   * @description Applies all query conditions to the provided dataset.
   * @param {Object[]} rows - Raw or partially filtered records.
   * @returns {Object[]} Fully filtered result set.
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._applyGroupBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = advancedQueryBuilder._applyGroupBy(rows);`
- **Pure JSDoc:**
```javascript
/**
   * @description Partitions the result set into groups and computes configured aggregations.
   * @param {Object[]} rows - Filtered records to be grouped.
   * @returns {Object[]} Aggregated result set (one record per group).
   * @private
   */
```
---
#### METHOD: AdvancedQueryBuilder._partialSort
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder._partialSort();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder._createComparator
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder._createComparator();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder._quickSelect
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder._quickSelect();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder._medianOfThree
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder._medianOfThree();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder._partition
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder._partition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.execute
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.get
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.get();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.first
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.first();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: AdvancedQueryBuilder.exists
- **Scope:** instance
- **LLM Call Syntax:** `advancedQueryBuilder.exists();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: AdvancedQueryValidator
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryValidator.ts`
**Constructor Usage:** `const instance = new AdvancedQueryValidator();`
**Description:** Static structural validation for Query Builder operations.
Verifies table existence, relational integrity for JOINs, and type correctness for query operands.

### Raw JSDoc Context:
```javascript
/**
 * @class AdvancedQueryValidator
 * @description Static structural validation for Query Builder operations.
 * Verifies table existence, relational integrity for JOINs, and type correctness for query operands.
 */
```

### Methods and properties of AdvancedQueryValidator

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
<br>

## CLASS: QueryAggregation
**File Path:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.ts`
**Constructor Usage:** `const instance = new QueryAggregation();`
**Description:** Operational model for computing scalar aggregations over record collections.
Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.

### Raw JSDoc Context:
```javascript
/**
 * @class QueryAggregation
 * @description Operational model for computing scalar aggregations over record collections.
 * Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.
 */
```

### Methods and properties of QueryAggregation

#### METHOD: QueryAggregation._getFieldValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = queryAggregation._getFieldValue(row, field);`
- **Pure JSDoc:**
```javascript
/**
   * @description Internal field resolution supporting path-prefix handling.
   * @param {Object} row - Data record.
   * @param {string} field - Target identifier.
   * @returns {*} Resolved value or undefined.
   * @private
   */
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
<br>

## GLOBAL FUNCTIONS

### FUNCTION: insertRow
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = insertRow(rowObj);`
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
### FUNCTION: insertRows
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = insertRows(rowsArray);`
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
### FUNCTION: updateRowById
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = updateRowById(id, rowObj);`
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
### FUNCTION: patchRow
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = patchRow(id, partialObj);`
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
### FUNCTION: deleteRowById
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = deleteRowById(id);`
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
### FUNCTION: updateRowsByIds
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = updateRowsByIds(updatesObj);`
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
### FUNCTION: deleteRowsByIds
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = deleteRowsByIds(ids);`
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
### FUNCTION: fuzzySearch
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = fuzzySearch(query, fields, threshold, options);`
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
### FUNCTION: createIndex
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = createIndex(columnName);`
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
### FUNCTION: invalidateIndex
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `invalidateIndex(columnName);`
- **Pure JSDoc:**
```javascript
/**
   * @function invalidateIndex
   * @description Purges memory indices.
   * @param {string|null} [columnName=null] - Specific column ID or null for global purge.
   */
```

---
### FUNCTION: getRows
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = getRows(options, options.preserveEmptyRows);`
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
### FUNCTION: flush
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = flush(options, options.dryRun);`
- **Pure JSDoc:**
```javascript
/**
   * @function flush
   * @description Synchronizes queued changes (deletes, updates, inserts) to Google Sheets via batch API calls.
   * @param {Object} [options={}] - Options.
   * @param {boolean} [options.dryRun=false] - If true, skips API execution.
   * @returns {number} Count of batch operations performed.
   */
```

---
### FUNCTION: setPrimaryKey
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = setPrimaryKey(columnName);`
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
### FUNCTION: getKeyField
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = getKeyField();`
- **Pure JSDoc:**
```javascript
/**
   * @function getKeyField
   * @description Effective primary-key column name (manual override or auto-detected).
   * @returns {string}
   */
```

---
### FUNCTION: getRowById
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = getRowById(id);`
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
### FUNCTION: defineVirtualColumn
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = defineVirtualColumn(columnName, computeFunction);`
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
### FUNCTION: getByPK
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = getByPK(pkValue);`
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
### FUNCTION: getAllRows
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = getAllRows(options);`
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
### FUNCTION: _invalidateInternalCache
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `_invalidateInternalCache(options);`
- **Pure JSDoc:**
```javascript
/**
   * @function _invalidateInternalCache
   * @description Selectively purges local data, indices, or original state.
   * @param {Object} [options={data: true, indices: true}] - Purge targets.
   * @private
   */
```

---
### FUNCTION: _ensureDataLoaded
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `_ensureDataLoaded();`
- **Pure JSDoc:**
```javascript
/**
   * @function _ensureDataLoaded
   * @description Lazy-load trigger. Fetches all rows from range A:ZZ and populates original data cache.
   * @private
   */
```

---
### FUNCTION: _processRawData
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = _processRawData(data, options);`
- **Pure JSDoc:**
```javascript
/**
   * @function _processRawData
   * @description Transformer: 2D API array -> physical columns + row objects with type coercion.
   * @param {any[][]} data - Matrix from Sheets API.
   * @param {Object} [options={}] Read options; preserveEmptyRows retains blank-row positions.
   * @returns {Object} {columns: string[], rows: Object[]}
   * @private
   */
```

---
### FUNCTION: _coerceValue
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = _coerceValue(value);`
- **Pure JSDoc:**
```javascript
/**
   * @function _coerceValue
   * @description Normalizes Sheets API strings into JS primitives (number, boolean).
   * Delegates to CoreUtilsLib's shared CellValueCoercion (dedupe of the
   * duplicate previously kept in sync manually with GasDataImporter).
   * @param {*} value - Raw cell data.
   * @returns {*} Primitive or original string.
   * @private
   */
```

---
### FUNCTION: _storeOriginalRowData
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `_storeOriginalRowData(row);`
- **Pure JSDoc:**
```javascript
/**
   * @function _storeOriginalRowData
   * @description Dirty checking snapshot. Excludes virtual columns to ensure physical integrity.
   * @param {Object} row - Object to clone into Map.
   * @private
   */
```

---
### FUNCTION: _findRowIndexById
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = _findRowIndexById(id);`
- **Pure JSDoc:**
```javascript
/**
   * @function _findRowIndexById
   * @description Memory-safe search for row index by PK. Uses Map index if available.
   * @param {string|number} id - Target PK.
   * @returns {number} 0-based index or -1.
   * @private
   */
```

---
### FUNCTION: _loadHeader
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = _loadHeader();`
- **Pure JSDoc:**
```javascript
/**
   * @function _loadHeader
   * @description On-demand fetch of range A1:ZZ1.
   * @returns {string[]} Sanitized header keys.
   * @throws {Error} If sheet is empty.
   * @private
   */
```

---
### FUNCTION: _determinePrimaryKey
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = _determinePrimaryKey();`
- **Pure JSDoc:**
```javascript
/**
   * @function _determinePrimaryKey
   * @description PK Discovery: manual -> 'ID' -> '*_ID' -> first column.
   * @returns {string} Effective key field name.
   * @private
   */
```

---
### FUNCTION: _applyVirtualColumns
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = _applyVirtualColumns(row);`
- **Pure JSDoc:**
```javascript
/**
   * @function _applyVirtualColumns
   * @description Enriches a row object with registered computed properties.
   * @param {Object} row - Object to mutate.
   * @returns {Object} Mutated object.
   * @private
   */
```

---
### FUNCTION: _convertIndexToColumn
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = _convertIndexToColumn(index);`
- **Pure JSDoc:**
```javascript
/**
   * @function _convertIndexToColumn
   * @description Utility: 1-based index -> A1 Notation (e.g., 27 -> 'AA').
   * @param {number} index - 1-based column position.
   * @returns {string} Letter code.
   * @private
   */
```

---
### FUNCTION: _getPkColumnLetter
- **Source:** `SheetDBLib/src/TableService.ts`
- **LLM Call Syntax:** `const result = _getPkColumnLetter();`
- **Pure JSDoc:**
```javascript
/**
   * @function _getPkColumnLetter
   * @description Resolves A1 letter for the mapped primary key.
   * @returns {string}
   * @throws {Error} If keyField is missing from columns.
   * @private
   */
```

---
### FUNCTION: _createFuzzyCondition
- **Source:** `SheetDBLib/src/query/AdvancedQueryBuilder.ts`
- **LLM Call Syntax:** `const result = _createFuzzyCondition(field, query, options, type);`
- **Pure JSDoc:**
```javascript
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
```

---
### FUNCTION: _isNullOrUndefined
- **Source:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.ts`
- **LLM Call Syntax:** `const result = _isNullOrUndefined(value);`
- **Pure JSDoc:**
```javascript
/**
 * @description Verifies if a value is strictly null or undefined.
 * @param {*} value - The value to verify.
 * @returns {boolean} True if the value is null-ish.
 * @private
 */
```

---
### FUNCTION: _safeParseFloat
- **Source:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.ts`
- **LLM Call Syntax:** `const result = _safeParseFloat(value, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
 * @description Coerces a value to float, providing a fallback for NaN results.
 * @param {*} value - The input value to parse.
 * @param {number} [defaultValue=0] - Fallback if parsing fails.
 * @returns {number} The parsed float or default value.
 * @private
 */
```

---
### FUNCTION: _compareValues
- **Source:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.ts`
- **LLM Call Syntax:** `const result = _compareValues(leftValue, operator, rightValue);`
- **Pure JSDoc:**
```javascript
/**
 * @description Executes relational comparison between two operands based on a string operator.
 * Supports standard equality, inequality, range checks, LIKE (regex-based), IN (collection), and CONTAINS.
 * @param {*} leftValue - Primary operand.
 * @param {string} operator - Relational operator (e.g., '=', '>=', 'LIKE', 'IN').
 * @param {*} rightValue - Secondary operand or collection.
 * @returns {boolean} Evaluation result.
 * @private
 */
```

---
