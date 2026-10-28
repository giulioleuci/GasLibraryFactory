# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [SheetDBLib](#sheetdblib)

---

## SheetDBLib

**Version:** 1.0.0   **Layer:** Data Persistence (Layer 1)   **Dependencies:** CoreUtilsLib, GoogleApiWrapper

### DatabaseService

**Source:** `SheetDBLib/src/DatabaseService.ts`

**Initialization:**
```javascript
new DatabaseService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `save` | `save(): void` |
| `beginTransaction` | `beginTransaction(): void` |
| `commit` | `commit(): void` |
| `rollback` | `rollback(): void` |
| `_performRollback` | `_performRollback(): void` |
| `inTransaction` | `inTransaction(): void` |
| `_readVerifiedSheetInfo` | `_readVerifiedSheetInfo(): void` |
| `_allTablesVisible` | `_allTablesVisible(): void` |
| `_initialize` | `_initialize(): void` |
| `getTable` | `getTable(): void` |
| `hasTable` | `hasTable(): void` |
| `listTables` | `listTables(): void` |
| `_isDryRun` | `_isDryRun(): void` |
| `getMetadata` | `getMetadata(): void` |
| `select` | `select(): void` |


### TableService

**Source:** `SheetDBLib/src/TableService.ts`

ORM-lite facade for a single Google Sheet. Orchestrates CRUD, validation, computed virtual columns, and write-through caching.

**Initialization:**
```javascript
new TableService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `ALPHABET_SIZE` | `ALPHABET_SIZE: unknown` |
| `ASCII_CODE_A` | `ASCII_CODE_A: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `insertRow` | `insertRow(): void` |
| `insertRows` | `insertRows(): void` |
| `updateRowById` | `updateRowById(): void` |
| `patchRow` | `patchRow(): void` |
| `deleteRowById` | `deleteRowById(): void` |
| `updateRowsByIds` | `updateRowsByIds(): void` |
| `deleteRowsByIds` | `deleteRowsByIds(): void` |
| `setSchema` | `setSchema(): void` |
| `disableSchemaValidation` | `disableSchemaValidation(): void` |
| `enableSchemaValidation` | `enableSchemaValidation(): void` |
| `_validateRow` | `_validateRow(): void` |
| `fuzzySearch` | `fuzzySearch(): void` |
| `fuzzySearchRows` | `fuzzySearchRows(rows: Object[], query: string, fields: string[], threshold=0.3: number, options={}: Object): Object[]` |
| `createIndex` | `createIndex(): void` |
| `_indexedLookup` | `_indexedLookup(): void` |
| `invalidateIndex` | `invalidateIndex(): void` |
| `getRows` | `getRows(): void` |
| `flush` | `flush(): void` |
| `setPrimaryKey` | `setPrimaryKey(): void` |
| `getKeyField` | `getKeyField(): void` |
| `getRowById` | `getRowById(): void` |
| `defineVirtualColumn` | `defineVirtualColumn(): void` |
| `getByPK` | `getByPK(): void` |
| `getAllRows` | `getAllRows(): void` |
| `_invalidateInternalCache` | `_invalidateInternalCache(): void` |
| `_ensureDataLoaded` | `_ensureDataLoaded(): void` |
| `_processRawData` | `_processRawData(): void` |
| `_coerceValue` | `_coerceValue(): void` |
| `_storeOriginalRowData` | `_storeOriginalRowData(): void` |
| `_findRowIndexById` | `_findRowIndexById(): void` |
| `_loadHeader` | `_loadHeader(): void` |
| `_determinePrimaryKey` | `_determinePrimaryKey(): void` |
| `_applyVirtualColumns` | `_applyVirtualColumns(): void` |
| `_convertIndexToColumn` | `_convertIndexToColumn(): void` |
| `_getPkColumnLetter` | `_getPkColumnLetter(): void` |


### QueryAggregation

**Source:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.ts`

Operational model for computing scalar aggregations over record collections.
Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.

**Initialization:**
```javascript
new QueryAggregation()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_getFieldValue` | `_getFieldValue(row: Object, field: string): *` |
| `calculate` | `calculate(rows: Object[]): number|null` |


### AdvancedQueryValidator

**Source:** `SheetDBLib/src/internal/query-builders/AdvancedQueryValidator.ts`

Static structural validation for Query Builder operations.
Verifies table existence, relational integrity for JOINs, and type correctness for query operands.

**Initialization:**
```javascript
new AdvancedQueryValidator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `validateTable` | `validateTable(dbService: DatabaseService, tableName: string): void` |
| `validateJoin` | `validateJoin(dbService: DatabaseService, table: string, type='JOIN': string): void` |
| `validateWhereIn` | `validateWhereIn(field: string, values: *): void` |
| `validateFuzzyCondition` | `validateFuzzyCondition(field: *, query: *, options: *): void` |
| `validateOrderDirection` | `validateOrderDirection(direction: string): void` |


### QueryCache

**Source:** `SheetDBLib/src/query/AdvancedQueryBuilder.ts`

Internal TTL-based cache manager for advanced query results.
Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.

**Initialization:**
```javascript
new QueryCache()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_generateKey` | `_generateKey(query: Object): string` |
| `get` | `get(query: Object): Object[]|null` |
| `store` | `store(query: Object, result: Object[]): boolean` |
| `invalidateTable` | `invalidateTable(): boolean` |


### AdvancedQueryBuilder

**Source:** `SheetDBLib/src/query/AdvancedQueryBuilder.ts`

**Initialization:**
```javascript
new AdvancedQueryBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `select` | `select(): void` |
| `from` | `from(): void` |
| `join` | `join(): void` |
| `leftJoin` | `leftJoin(): void` |
| `rightJoin` | `rightJoin(): void` |
| `fullOuterJoin` | `fullOuterJoin(): void` |
| `where` | `where(): void` |
| `orWhere` | `orWhere(): void` |
| `or` | `or(): void` |
| `andWhere` | `andWhere(): void` |
| `and` | `and(): void` |
| `whereLike` | `whereLike(): void` |
| `whereFuzzy` | `whereFuzzy(): void` |
| `orWhereFuzzy` | `orWhereFuzzy(): void` |
| `whereIn` | `whereIn(): void` |
| `groupBy` | `groupBy(): void` |
| `sum` | `sum(): void` |
| `avg` | `avg(): void` |
| `count` | `count(): void` |
| `min` | `min(): void` |
| `max` | `max(): void` |
| `orderBy` | `orderBy(): void` |
| `orderByDesc` | `orderByDesc(): void` |
| `limit` | `limit(): void` |
| `offset` | `offset(): void` |
| `paginate` | `paginate(): void` |
| `_extractFieldValue` | `_extractFieldValue(row: Object, fieldSpec: string): *` |
| `_performJoin` | `_performJoin(leftRows: Object[], joinConfig: Object): Object[]` |
| `_tryIndexOptimization` | `_tryIndexOptimization(table: Object): Object[]|null` |
| `_getRemainingConditions` | `_getRemainingConditions(): Object[]` |
| `_getFieldValue` | `_getFieldValue(row: Object, field: string): *` |
| `_applyConditionsFiltered` | `_applyConditionsFiltered(rows: Object[], conditions: Object[]): Object[]` |
| `_compileFuzzyMatches` | `_compileFuzzyMatches(rows: Object[], conditions: Object[]): Map<number, Set<Object>>` |
| `_applyConditions` | `_applyConditions(rows: Object[]): Object[]` |
| `_applyGroupBy` | `_applyGroupBy(rows: Object[]): Object[]` |
| `_partialSort` | `_partialSort(): void` |
| `_createComparator` | `_createComparator(): void` |
| `_quickSelect` | `_quickSelect(): void` |
| `_medianOfThree` | `_medianOfThree(): void` |
| `_partition` | `_partition(): void` |
| `execute` | `execute(): void` |
| `get` | `get(): void` |
| `first` | `first(): void` |
| `exists` | `exists(): void` |


### TableServiceMock

**Source:** `SheetDBLib/src/testing/mocks.ts`

Mock implementation of TableService for unit testing CRUD logic.
Manages an internal array of records and simulates primary key generation and indexing.

**Initialization:**
```javascript
new TableServiceMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setData` | `setData(data: Object[]): TableServiceMock` |


### DatabaseServiceMock

**Source:** `SheetDBLib/src/testing/mocks.ts`

High-fidelity mock for DatabaseService.
Orchestrates TableServiceMock instances and provides a unified interface for mocking database-wide operations.

**Initialization:**
```javascript
new DatabaseServiceMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `registerTable` | `registerTable(name: string, mock: TableServiceMock): TableServiceMock` |


---

