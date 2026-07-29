# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [SheetDBLib](#sheetdblib)

---

## SheetDBLib

**Version:** 1.0.0   **Layer:** Data Persistence (Layer 1)   **Dependencies:** CoreUtilsLib, GoogleApiWrapper

### TableDataModifier

@class TableDataModifier
Internal logic engine for mutating SheetDB table data. Handles validation, UUID generation, and write-through cache management.

**Initialization:**
```javascript
new TableDataModifier(facade: TableService)
```

**Methods:**

- `insertRow(rowObj: Object): Object|null`

- `insertRows(rowsArray: Object[]): Object[]`

- `updateRowById(id: string|number, rowObj: Object): Object`

- `patchRow(id: string|number, partialObj: Object): Object`

- `deleteRowById(id: string|number): Object|null`

- `updateRowsByIds(updatesObj: Object.<string, Object>): Object[]`

- `deleteRowsByIds(ids: (string|number)[]): Object[]`


### TableSearchEngine

@class TableSearchEngine
Internal engine for O(1) indexed lookups and Fuse.js fuzzy matching on TableService data.

**Initialization:**
```javascript
new TableSearchEngine(facade: TableService)
```

**Methods:**

- `fuzzySearch(query: string, fields: string[], threshold=0.3: number, options={}: Object): Object[]`

- `fuzzySearchRows(rows: Object[], query: string, fields: string[], threshold=0.3: number, options={}: Object): Object[]`
  > This keeps all Fuse configuration within the table search boundary for callers such as AdvancedQueryCompiler that have already narrowed their candidates.

- `createIndex(columnName: string): TableService`

- `indexedLookup(columnName: string, value: *): Object[]|null`

- `invalidateIndex(columnName=null: string|null): void`


### TableService

Service for representing and managing a single table (sheet) in a Google Spreadsheet.

**Initialization:**
```javascript
new TableService()
```

**Methods:**

- `insertRow(): *`

- `insertRows(): *`

- `updateRowById(): *`

- `patchRow(): *`

- `deleteRowById(): *`

- `updateRowsByIds(): *`

- `deleteRowsByIds(): *`

- `setSchema(): *`

- `disableSchemaValidation(): *`

- `enableSchemaValidation(): *`

- `fuzzySearch(): *`

- `createIndex(): *`

- `getRows(): Object[]`

- `flush(id: string|number, options={}: Object, options.dryRun=false: boolean): boolean`
  > Deletes a row from the spreadsheet identified by its primary key.

- `setPrimaryKey(columnName: string): TableService`

- `getRowById(id: string|number): Object|null`

- `defineVirtualColumn(columnName: string, computeFunction: Function): TableService`

- `getByPK(pkValue: *): Object|null`

- `getAllRows(): Object[]`


### DatabaseMetaDataHandler

Manager for database metadata, configuration flags, and dry-run logic.

**Initialization:**
```javascript
new DatabaseMetaDataHandler()
```


### DatabaseTableRegistry

Manager for table registration and lifecycle within the database.

**Initialization:**
```javascript
new DatabaseTableRegistry()
```


### ColumnFamily

ColumnFamily representing a group of dynamically generated columns.

**Initialization:**
```javascript
new ColumnFamily()
```

**Static Methods:**

- `fromJSON(obj: Object): ColumnFamily`

**Methods:**

- `generateColumnName(memberKey: string): string`
  > this.id = id; /** this.namePattern = namePattern; /** this.type = type; /** this.nullable = nullable; /** this.defaultValue = cloneDeep(defaultValue); /** this.members = Array.isArray(members) ? [...members] : []; /** this.memberSource = memberSource ? cloneDeep(memberSource) : null; /** this.metadata = cloneDeep(metadata); Object.freeze(this); Object.freeze(this.members); Object.freeze(this.metadata); } /**

- `parseMemberKey(columnName: string): string|null`

- `matchesColumn(columnName: string): boolean`

- `generateAllColumnNames(): string[]`

- `getColumnNames(): string[]`

- `isStatic(): boolean`

- `isConfigBased(): boolean`

- `isQueryBased(): boolean`

- `getMemberCount(): number`

- `hasMember(key: string): boolean`

- `withMembers(newMembers: string[]): ColumnFamily`

- `toJSON(): Object`

- `toString(): string`


### DynamicColumnAccessor

DynamicColumnAccessor provides type-safe access to dynamic columns in rows.

**Initialization:**
```javascript
new DynamicColumnAccessor()
```

**Static Methods:**

- `forRow(row: Object, families: ColumnFamily[], options={}: Object): DynamicColumnAccessor`

- `forRows(rows: Object[], families: ColumnFamily[], options={}: Object): DynamicColumnAccessor[]`

**Methods:**

- `getRow(): Object`
  > this._row = row; /** this._familyMap = familyMap || new Map(families.map((f) => [f.id, f])); /** this._coerceTypes = coerceTypes; /** this._useDefaults = useDefaults; } /**

- `getAll(familyId: string): Object.<string, *>`

- `getAllAsArray(familyId: string): Array<{key: string, value: *`

- `getMembers(familyId: string, memberKeys: string[]): Object.<string, *>`

- `has(familyId: string, memberKey: string): boolean`

- `hasAny(familyId: string): boolean`

- `hasAll(familyId: string): boolean`

- `set(familyId: string, memberKey: string, value: *): DynamicColumnAccessor`

- `setAll(familyId: string, values: Object.<string, *>): DynamicColumnAccessor`

- `clear(familyId: string, memberKey: string): DynamicColumnAccessor`

- `clearAll(familyId: string): DynamicColumnAccessor`

- `count(): number`

- `getFilledMembers(): string[]`

- `getEmptyMembers(): string[]`


### FamilyAggregator

FamilyAggregator provides aggregation operations on column families.

**Initialization:**
```javascript
new FamilyAggregator()
```

**Static Methods:**

- `forFamilies(families: ColumnFamily[], options={}: Object): FamilyAggregator`

**Methods:**

- `registerFamily(family: ColumnFamily): FamilyAggregator`
  > Map of family IDs to families.

- `aggregateRow(row: Object, familyId: string, aggregationType: string, options={}: Object, options.memberKeys: string[], options.separator=', ': string): AggregationResult`

- `aggregateRows(rows: Object[], familyId: string, aggregationType: string, options={}: Object, options.memberKeys: string[]): Object<string, *>`

- `aggregateAll(rows: Object[], familyId: string, aggregationType: string, options={}: Object): AggregationResult`

- `multiAggregate(row: Object, familyId: string, aggregationTypes: string[]): Object<string, AggregationResult>`

- `groupAggregate(rows: Object[], familyId: string, groupByMember: string, aggregateMember: string, aggregationType: string): Object<string, *>`


### SchemaResolver

SchemaResolver resolves SchemaTemplates to concrete schemas with expanded columns.

**Initialization:**
```javascript
new SchemaResolver()
```

**Static Methods:**

- `getDynamicColumns(schema: ResolvedSchema): ResolvedColumn[]`

- `getFixedColumns(schema: ResolvedSchema): ResolvedColumn[]`

- `getColumnsByFamily(schema: ResolvedSchema, familyId: string): ResolvedColumn[]`

- `createColumnMap(schema: ResolvedSchema): Map<string, ResolvedColumn>`

**Methods:**

- `registerFamily(family: ColumnFamily): SchemaResolver`
  > Registry of column families.

- `registerFamilies(families: ColumnFamily[]): SchemaResolver`

- `getFamily(familyId: string): ColumnFamily|null`

- `getFamilyIds(): string[]`

- `setMemberLoader(loader: Object): SchemaResolver`

- `resolve(template: SchemaTemplate, options={}: Object, options.useCache=true: boolean, options.context={}: Object): ResolvedSchema`

- `clearCache(): SchemaResolver`


### SchemaTemplate

SchemaTemplate representing a schema with dynamic columns.

**Initialization:**
```javascript
new SchemaTemplate()
```

**Static Methods:**

- `fromJSON(obj: Object): SchemaTemplate`

**Methods:**

- `getPrimaryKeyColumn(): string|null`
  > Table identifier.

- `getFixedColumnNames(): string[]`

- `getDynamicFamilyIds(): string[]`

- `hasDynamicColumns(): boolean`

- `getFixedColumn(name: string): Object|null`

- `validate(): Object`
  > Checks for duplicate fixed columns, primary key existence, and valid family IDs.

- `toJSON(): Object`

- `toString(): string`


### CrossPartitionAggregator

Internal module managing query aggregation.

**Static Methods:**

- `saveAll(coordinator: PartitionCoordinator, options.dryRun=false: boolean): Object`
  > Saves all pending changes across all connected partitions.


### PartitionCoordinator

Internal module managing partition connections, pooling, and statistics.

**Initialization:**
```javascript
new PartitionCoordinator()
```

**Methods:**

- `getPartition(partitionIdOrAlias: string): DatabaseService`

- `isConnected(partitionIdOrAlias: string): boolean`

- `getConnectedPartitions(): string[]`

- `getConnectionsEntries(): IterableIterator<[string, DatabaseService]>`

- `closePartition(partitionIdOrAlias: string): boolean`

- `closeAll(): number`

- `getStatistics(): Object<string, PartitionStatistics>`

- `getPartitionStatistics(partitionIdOrAlias: string): PartitionStatistics|null`

- `resetStatistics(): void`

- `updateStatistics(partitionId: string, event: 'access'|'query'|'connect'|'disconnect'): void`


### QueryCache

Execution engine for AdvancedQueryBuilder, including JOIN, GROUP BY, and optimizations.
/

**Initialization:**
```javascript
new QueryCache()
```

**Methods:**

- `store(query: Object, result: Object[]): boolean`

- `invalidateTable(): boolean`

- `clear(): boolean`


### AdvancedQueryCompiler

@param {Object} service - Cache service implementation (e.g., Apps Script CacheService).
/
  constructor(service) {
    this.service = service;
    this.prefix = 'query_';
    this.expiration = 300;
  }

**Initialization:**
```javascript
new AdvancedQueryCompiler(query: Object)
```


### AdvancedQueryPagination

Sorting and pagination optimizations for AdvancedQueryBuilder.

**Initialization:**
```javascript
new AdvancedQueryPagination()
```


### QueryCondition

Internal classes and functions for parsing and representing query structures.
/

**Initialization:**
```javascript
new QueryCondition(value: *, defaultValue=0: number)
```

**Methods:**

- `compareValue(rowValue: *): boolean`

- `addSubCondition(condition: QueryCondition): QueryCondition`

- `evaluate(row: Object): boolean`
  > Resolves field path prefixes and applies AND/OR branch-cutting logic.


### QueryAggregation

@param {string} field - Target field path or identifier.
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

**Initialization:**
```javascript
new QueryAggregation(rowValue: *)
```

**Methods:**

- `calculate(rows: Object[]): number|null`


### QueryGroup

@param {string} functionName - Aggregation type (e.g., 'SUM', 'AVG').
@param {string} field - Target field path for computation.
@param {string} [alias=null] - Output field name for the aggregated value.
/
  constructor(functionName, field, alias = null) {
    this.function = functionName.toUpperCase();
    this.field = field;
    this.alias = alias || `${this.function}_${this.field}`;
  }

**Initialization:**
```javascript
new QueryGroup(row: Object, field: string)
```

**Methods:**

- `addAggregation(aggregation: QueryAggregation): void`

- `setCondition(condition: QueryCondition): void`

- `group(rows: Object[]): Object[]`


### AdvancedQueryValidator

Validation logic for query building operations.
/

**Methods:**

- `validateTable(dbService: DatabaseService, tableName: string): void`

- `validateJoin(dbService: DatabaseService, table: string, type='JOIN': string): void`

- `validateWhereIn(field: string, values: *): void`

- `validateFuzzyCondition(field: *, query: *, options: *): void`
  > Validates the opt-in fuzzy predicate API before Fuse receives configuration. Only threshold is exposed deliberately so query callers cannot override compiler-owned options such as keys, includeScore, or sorting.

- `validateOrderDirection(direction: string): void`


### CrossPartitionQuery

Query builder for executing queries across multiple partitions.

**Initialization:**
```javascript
new CrossPartitionQuery()
```

**Methods:**

- `fromPartitions(partitionIds: string[]): CrossPartitionQuery`
  > Multi-database manager.

- `fromTag(tag: string): CrossPartitionQuery`

- `fromTags(tags: string[], matchMode='ALL': 'ALL'|'ANY'): CrossPartitionQuery`

- `fromAll(): CrossPartitionQuery`

- `select(columns: string[]): CrossPartitionQuery`

- `where(column: string, operator: string, value: *): CrossPartitionQuery`

- `orderBy(column: string, direction='ASC': 'ASC'|'DESC'): CrossPartitionQuery`

- `limit(count: number): CrossPartitionQuery`

- `setContinueOnError(continueOnError: boolean): CrossPartitionQuery`

- `execute(): AggregatedResult`
  > Records are tagged with `_partitionId` to indicate their source.

- `executeParallel(): AggregatedResult`
  > const allRecords = []; /** const partitionResults = new Map(); /** const errors = new Map(); /** const partitionsQueried = []; // Execute query on each partition for (const partition of partitions) { try { const db = this._manager.getPartition(partition.id); const records = this._executeOnPartition(db, partition.id); partitionResults.set(partition.id, records); partitionsQueried.push(partition.id); // Add partition ID to each record for (const record of records) { record._partitionId = partition.id; allRecords.push(record); } } catch (error) { errors.set(partition.id, error); partitionsQueried.push(partition.id); if (!this._continueOnError) { throw new Error( `Cross-partition query failed on partition ${partition.id}: ${error.message}` ); } } } // Apply global ordering if specified if (this._orderBy) { const { column, direction } = this._orderBy; const multiplier = direction === 'DESC' ? -1 : 1; allRecords.sort((a, b) => { const aVal = a[column]; const bVal = b[column]; if (aVal === bVal) { return 0; } if (aVal === null || aVal === undefined) { return 1; } if (bVal === null || bVal === undefined) { return -1; } return (aVal < bVal ? -1 : 1) * multiplier; }); } return { records: allRecords, partitionResults, totalRecords: allRecords.length, partitionsQueried, errors, executionTime: Date.now() - startTime }; } /**

- `toString(): string`


### DatabasePartition

DatabasePartition representing a single partition (spreadsheet) in a multi-database setup.

**Initialization:**
```javascript
new DatabasePartition()
```

**Static Methods:**

- `fromJSON(obj: Object): DatabasePartition`

**Methods:**

- `hasTag(tag: string): boolean`
  > Unique logical identifier for the partition.

- `hasAllTags(requiredTags: string[]): boolean`

- `hasAnyTag(anyTags: string[]): boolean`

- `getMetadata(key: string, defaultValue=null: *): *`

- `withTags(newTags: string[]): DatabasePartition`

- `withPriority(newPriority: number): DatabasePartition`

- `toJSON(): Object`

- `toString(): string`


### MultiDatabaseError

Error classes for MultiDatabase extension.

**Initialization:**
```javascript
new MultiDatabaseError()
```


### PartitionNotFoundError

@param {string} message - Descriptive error message.
@param {Object} [details={}] - Arbitrary metadata for error context.
/
  constructor(message, details = {}) {
    super(message, details);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'MultiDatabaseError';
    this.details = details;
  }
}

**Initialization:**
```javascript
new PartitionNotFoundError()
```


### PartitionConnectionError

@param {string} partitionId - The identifier of the missing partition.
/
  constructor(partitionId) {
    super(`Partition not found: ${partitionId}`, { partitionId });
    this.name = 'PartitionNotFoundError';
    this.partitionId = partitionId;
  }
}

**Initialization:**
```javascript
new PartitionConnectionError()
```


### ReadOnlyPartitionError

@param {string} partitionId - The identifier of the partition that failed to connect.
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

**Initialization:**
```javascript
new ReadOnlyPartitionError()
```


### CrossPartitionQueryError

@param {string} partitionId - The identifier of the read-only partition.
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

**Initialization:**
```javascript
new CrossPartitionQueryError()
```


### CrossPartitionDisabledError

@param {string} message - Summary error message.
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

**Initialization:**
```javascript
new CrossPartitionDisabledError()
```


### MultiDatabaseManager

Manager for multiple database partitions with connection pooling.

**Initialization:**
```javascript
new MultiDatabaseManager()
```

**Methods:**

- `getPartition(partitionIdOrAlias: string): DatabaseService`
  > Partition configuration.

- `getDefault(): DatabaseService`

- `getByTag(tag: string): DatabaseService[]`

- `getByTags(tags: string[], matchMode='ALL': 'ALL'|'ANY'): DatabaseService[]`

- `route(routingContext: Object): DatabaseService|DatabaseService[]`

- `query(tableName: string): CrossPartitionQuery`

- `getConfiguration(): PartitionConfiguration`

- `getRouter(): PartitionRouter`

- `isConnected(partitionIdOrAlias: string): boolean`

- `getConnectedPartitions(): string[]`

- `saveAll(options={}: Object, options.dryRun=false: boolean): Object<string, *>`

- `closePartition(partitionIdOrAlias: string): boolean`

- `closeAll(): number`

- `getStatistics(): Object<string, PartitionStatistics>`

- `getPartitionStatistics(partitionIdOrAlias: string): PartitionStatistics|null`

- `resetStatistics(): void`

- `toString(): string`


### PartitionConfiguration

Configuration for multi-database partition setup.

**Initialization:**
```javascript
new PartitionConfiguration()
```

**Static Methods:**

- `fromJSON(obj: Object): PartitionConfiguration`

**Methods:**

- `getPartition(idOrAlias: string): DatabasePartition|null`
  > Map of partition ID to DatabasePartition.

- `getDefaultPartition(): DatabasePartition`

- `getAllPartitions(): DatabasePartition[]`

- `getPartitionIds(): string[]`

- `getPartitionsByTag(tag: string): DatabasePartition[]`

- `getPartitionsByTags(tags: string[], matchMode='ALL': 'ALL'|'ANY'): DatabasePartition[]`

- `getPartitionsByPriority(): DatabasePartition[]`

- `getReadOnlyPartitions(): DatabasePartition[]`

- `getWritablePartitions(): DatabasePartition[]`

- `hasPartition(idOrAlias: string): boolean`

- `resolveAlias(alias: string): string|null`

- `size(): number`

- `getAllTags(): string[]`

- `toJSON(): Object`

- `toString(): string`


### PartitionRouter

Router for directing queries to appropriate partitions.

**Initialization:**
```javascript
new PartitionRouter()
```

**Methods:**

- `route(context={}: Object, context.partitionId: string, context.strategy: string, context.tag: string, context.tags: string[], context.tagMatchMode='ALL': 'ALL'|'ANY'): DatabasePartition[]`
  > Partition configuration.

- `routeSingle(context={}: Object): DatabasePartition`

- `setCustomRouter(routerFn: Function): PartitionRouter`

- `resetRoundRobin(): PartitionRouter`

- `getRoundRobinCounter(): number`


### AdvancedQueryBuilderMock

Centralized high-fidelity mocks for SheetDBLib services.

**Initialization:**
```javascript
new AdvancedQueryBuilderMock()
```

**Methods:**

- `setReturnData(data: Object[]): AdvancedQueryBuilderMock`


### TableServiceMock

Injects data into the execute() mock and updates count() based on array length.
@param {Object[]} data - Collection of records to return.
@returns {AdvancedQueryBuilderMock} Current instance for chaining.
/
  setReturnData(data) {
    this.execute.mockReturnValue(data);
    this.count.mockReturnValue(data.length);
    return this;
  }
}

**Initialization:**
```javascript
new TableServiceMock()
```

**Methods:**

- `setData(data: Object[]): TableServiceMock`


### DatabaseServiceMock

@param {string} [name='TestTable'] - Logical table name.
/
  constructor(name = 'TestTable') {
    this.name = name;
    this._data = [];
    this.searchEngine = new TableSearchEngine(this);

**Initialization:**
```javascript
new DatabaseServiceMock(data: Object[])
```

**Methods:**

- `registerTable(name: string, mock: TableServiceMock): TableServiceMock`
  > Map of table name to TableServiceMock instances.


---

