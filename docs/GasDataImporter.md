# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [GasDataImporter](#gasdataimporter)

---

## GasDataImporter

@fileoverview GasDataImporter - Recipe-Based ETL Engine for Google Apps Script. See README.md for the full module manual.

### ImportCheckpoint

**Source:** `GasDataImporter/src/ImportCheckpoint.ts`

Plain, JSON-serializable checkpoint describing progress through a single
recipe's ETL pipeline (EXTRACT -> LOAD -> DONE, transform runs inline
during EXTRACT on each bounded chunk). Designed to
be persisted via `PropertiesService`/`JobRunnerLib` between GAS execution
windows and resumed with `ImportEngine.runImportChunk`.

**Initialization:**
```javascript
new ImportCheckpoint()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `initial` | `initial(recipeName: string): ImportCheckpoint` |
| `fromJSON` | `fromJSON(obj: Object): ImportCheckpoint` |
| `assertMatches` | `assertMatches(checkpoint: ImportCheckpoint, recipeName: string): void` |


### ImportConfiguration

**Source:** `GasDataImporter/src/ImportConfiguration.ts`

Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.

**Initialization:**
```javascript
new ImportConfiguration()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `registerSourceType` | `registerSourceType(type: string): void` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validate` | `_validate(recipe: Object): void` |
| `_validateSource` | `_validateSource(source: Object): void` |
| `_validateTransform` | `_validateTransform(transform: Object): void` |
| `_validateLoad` | `_validateLoad(load: Object): void` |
| `getName` | `getName(): string` |
| `getSource` | `getSource(): Object` |
| `getTransform` | `getTransform(): Object` |
| `getLoad` | `getLoad(): Object` |
| `getRecipe` | `getRecipe(): Object` |
| `getSummary` | `getSummary(): Object` |


### ImportEngine

**Source:** `GasDataImporter/src/ImportEngine.ts`

Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.

**Initialization:**
```javascript
new ImportEngine()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `registerCustomSource` | `registerCustomSource(name: string, strategyClass: Function): void` |
| `getAvailableSourceTypes` | `getAvailableSourceTypes(): Array<string>` |
| `getConfigSummary` | `getConfigSummary(): Object` |
| `validateRecipe` | `validateRecipe(recipe: Object): {valid: boolean, summary: Object, message: string` |


### ConfigurationError

**Source:** `GasDataImporter/src/internal/errors/ConfigurationError.ts`

Exception class for ETL recipe validation failures, capturing structural violations, missing mandatory fields, or invalid strategy identifiers.

**Initialization:**
```javascript
new ConfigurationError()
```


### ImportError

**Source:** `GasDataImporter/src/internal/errors/ImportError.ts`

Foundational error class for the ETL pipeline, providing structured diagnostic state including classification codes, contextual metadata, and occurrence timestamps.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

**Initialization:**
```javascript
new ImportError()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### LoadError

**Source:** `GasDataImporter/src/internal/errors/LoadError.ts`

Exception class for failures during the persistence phase, capturing table access errors, conflict resolution violations, and database-level exceptions.

**Initialization:**
```javascript
new LoadError()
```


### SourceError

**Source:** `GasDataImporter/src/internal/errors/SourceError.ts`

Exception class for failures during the extraction phase, capturing file resolution errors, permission denials, and malformed source configurations.

**Initialization:**
```javascript
new SourceError()
```


### TransformError

**Source:** `GasDataImporter/src/internal/errors/TransformError.ts`

Exception class for failures during the data transformation phase, capturing mapping errors, normalization failures, and expression evaluation exceptions.

**Initialization:**
```javascript
new TransformError()
```


### FolderStrategy

**Source:** `GasDataImporter/src/internal/extract-strategies/FolderStrategy.ts`

Extraction strategy for bulk-processing all Google Sheets within a target Drive folder, supporting regex filtering and metadata tracking.

**Initialization:**
```javascript
new FolderStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_extractData` | `_extractData(config: Object, config.folderId: string, config.fileNamePattern: string, config.mergeData=true: boolean): Array<Object>|Array<{fileName:string, fileId:string, data:Object[]` |
| `_extractFromFile` | `_extractFromFile(fileId: string, fileName: string, range: string, tabName: string, hasHeaders: boolean, includeSourceFile: boolean): Array<Object>` |


### SheetByIdStrategy

**Source:** `GasDataImporter/src/internal/extract-strategies/SheetByIdStrategy.ts`

Extraction strategy for retrieving data from a specific Google Sheets document using its ID, supporting targeted tab and range selection.

**Initialization:**
```javascript
new SheetByIdStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_extractData` | `_extractData(config: Object, config.sheetId: string, config.tabName: string, config.range='': string, config.hasHeaders=true: boolean): Array<Object>` |
| `extractRaw` | `extractRaw(config: Object): Array<Array<*>>` |
| `supportsCursor` | `supportsCursor(): boolean` |
| `extractChunk` | `extractChunk(config: Object, cursor: Object, cursor.rowOffset: number, cursor.headers: Array<string>|null, maxRows: number): {rows: Array<Object>, nextCursor: Object, exhausted: boolean` |
| `_parseRangeBounds` | `_parseRangeBounds(range: string): {startCol: number, startRow: number, endCol: number, endRow: number` |
| `_letterToColumn` | `_letterToColumn(letters: string): number` |
| `_resolveValues` | `_resolveValues(config: Object): Array<Array<*>>` |


### SourceStrategy

**Source:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.ts`

Abstract base class defining the contract for data extraction strategies, providing common lifecycle hooks and data normalization utilities.

**Initialization:**
```javascript
new SourceStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `extract` | `extract(config: Object): Array<Object>` |
| `_extractData` | `_extractData(config: Object): Array<Object>` |
| `supportsCursor` | `supportsCursor(): boolean` |
| `extractChunk` | `extractChunk(_config: Object, _cursor: *, _maxRows: number): {rows: Array<Object>, nextCursor: *, exhausted: boolean` |
| `_arrayToObjects` | `_arrayToObjects(data: Array<Array>, hasHeaders=true: boolean): Array<Object>` |
| `_coerceValue` | `_coerceValue(value: *): *` |
| `_columnToLetter` | `_columnToLetter(column: number): string` |
| `_validateConfig` | `_validateConfig(config: Object, requiredFields: string[]): void` |


### SourceStrategyFactory

**Source:** `GasDataImporter/src/internal/extract-strategies/SourceStrategyFactory.ts`

Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.

**Initialization:**
```javascript
new SourceStrategyFactory()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_registerBuiltInStrategies` | `_registerBuiltInStrategies(): void` |
| `registerStrategy` | `registerStrategy(name: string, strategyClass: Function): void` |
| `createStrategy` | `createStrategy(type: string, dependencies={}: Object): Object` |
| `hasStrategy` | `hasStrategy(type: string): boolean` |
| `getAvailableStrategies` | `getAvailableStrategies(): Array<string>` |


### Loader

**Source:** `GasDataImporter/src/internal/load/Loader.ts`

Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.

**Initialization:**
```javascript
new Loader()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `load` | `load(data: Array<Object>, loadConfig: Object, loadConfig.targetTable: string, loadConfig.conflictResolution: string, loadConfig.conflictKey: string, loadConfig.updateIfNewer: Object): Object` |
| `loadChunk` | `loadChunk(data: Array<Object>, loadConfig: Object, state: Object, state.isFirstChunk: boolean): Object` |
| `_executeStrategy` | `_executeStrategy(table: Object, data: Array<Object>, strategy: string, conflictKey: string, updateIfNewer: Object, overwriteHandler: Function): Object` |
| `_insertOnly` | `_insertOnly(table: Object, data: Array<Object>, conflictKey: string): Object` |
| `_updateOnly` | `_updateOnly(table: Object, data: Array<Object>, conflictKey: string, updateIfNewer: Object): Object` |
| `_upsert` | `_upsert(table: Object, data: Array<Object>, conflictKey: string, updateIfNewer: Object): Object` |
| `_overwrite` | `_overwrite(table: Object, data: Array<Object>, conflictKey: string): Object` |
| `_appendAll` | `_appendAll(table: Object, data: Array<Object>): Object` |
| `_shouldUpdate` | `_shouldUpdate(existing: Object, incoming: Object, timestampColumn: string): boolean` |
| `_validateLoadConfig` | `_validateLoadConfig(config: Object): void` |


### ImportPipelineExecutor

**Source:** `GasDataImporter/src/pipeline/ImportPipelineExecutor.ts`

**Initialization:**
```javascript
new ImportPipelineExecutor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `startImport` | `startImport(recipe: Object, _options={}: Object): ImportCheckpoint` |
| `runImportChunk` | `runImportChunk(recipe: Object, checkpoint: ImportCheckpoint, budget={}: Object, budget.maxRows=500: number): {checkpoint: ImportCheckpoint, done: boolean` |
| `runImport` | `runImport(): void` |
| `_executePipeline` | `_executePipeline(): void` |
| `_executeExtract` | `_executeExtract(): void` |
| `_executeTransform` | `_executeTransform(): void` |
| `_executeLoad` | `_executeLoad(): void` |
| `_generateDryRunLoadResult` | `_generateDryRunLoadResult(): void` |


### Transformer

**Source:** `GasDataImporter/src/pipeline/Transformer.ts`

Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.

**Initialization:**
```javascript
new Transformer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `transform` | `transform(sourceData: Array<Object>, transformConfig: Object): Array<Object>` |
| `_transformRow` | `_transformRow(sourceRow: Object, rowIndex: number, mapping: Object, calculated: Object, normalization: Object, validation: Object): Object|null` |
| `_applyMapping` | `_applyMapping(sourceRow: Object, mapping: Object): Object` |
| `_applyCalculated` | `_applyCalculated(row: Object, calculated: Object): Object` |
| `_buildDependencyGraph` | `_buildDependencyGraph(): void` |
| `_extractPlaceholders` | `_extractPlaceholders(): void` |
| `_topologicalSort` | `_topologicalSort(): void` |
| `_evaluateExpression` | `_evaluateExpression(): void` |
| `_simpleTemplateSubstitution` | `_simpleTemplateSubstitution(): void` |
| `_formatDate` | `_formatDate(value: *, format: string): string|*` |
| `_applyNormalization` | `_applyNormalization(row: Object, normalization: Object): Object` |
| `_applyValidation` | `_applyValidation(row: Object, validation: string|Array<string>, rowIndex: number): boolean` |


---

