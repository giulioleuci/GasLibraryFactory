# API Reference: GasDataImporter

## CLASS: ImportEngine
**File Path:** `GasDataImporter/src/ImportEngine.js`
**Constructor Usage:** `const instance = new ImportEngine(logger, driveService, spreadsheetService, databaseService, expressionEngine, exceptionService, monitor);`
**Description:** Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.

### Raw JSDoc Context:
```javascript
/**
 * Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.
 * @class
 */
```

<br>

## CLASS: ImportConfiguration
**File Path:** `GasDataImporter/src/ImportConfiguration.js`
**Constructor Usage:** `const instance = new ImportConfiguration(recipe, recipe.name, recipe.source, recipe.transform, recipe.load, logger);`
**Description:** Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.

### Raw JSDoc Context:
```javascript
/**
 * Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.
 * @class
 */
```

### Methods of ImportConfiguration

#### METHOD: ImportConfiguration.registerSourceType
- **Scope:** static
- **LLM Call Syntax:** `ImportConfiguration.registerSourceType(type);`
- **Pure JSDoc:**
```javascript
/**
   * Registers an additional source type as valid for recipe validation. Consumers
   * that add a custom `SourceStrategy` via `ImportEngine.registerCustomSource()`
   * must also call this (or use `registerCustomSource`, which does it for them)
   * so recipes using the new type pass `_validateSource` instead of being
   * rejected as unknown before the custom strategy is ever reached. No-op if the
   * type is already valid.
   *
   * @static
   * @param {string} type Source strategy type name (matches the key passed to
   *   `SourceStrategyFactory.registerStrategy`).
   */
```
---
#### METHOD: ImportConfiguration._validate
- **Scope:** instance
- **LLM Call Syntax:** `importConfiguration._validate(recipe);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates full recipe validation across root, source, transform, and load segments.
   * @private
   * @param {Object} recipe target configuration to validate.
   * @throws {ConfigurationError} On first detected structural violation.
   */
```
---
#### METHOD: ImportConfiguration._validateSource
- **Scope:** instance
- **LLM Call Syntax:** `importConfiguration._validateSource(source);`
- **Pure JSDoc:**
```javascript
/**
   * Enforces extraction source requirements based on strategy type (e.g., SheetById, Folder).
   * @private
   * @param {Object} source Source configuration segment.
   * @throws {ConfigurationError} If type is unknown or type-specific identifiers are missing.
   */
```
---
#### METHOD: ImportConfiguration._validateTransform
- **Scope:** instance
- **LLM Call Syntax:** `importConfiguration._validateTransform(transform);`
- **Pure JSDoc:**
```javascript
/**
   * Validates optional transformation blocks including field mappings, calculations, and normalization rules.
   * @private
   * @param {Object} transform Transform configuration segment.
   * @throws {ConfigurationError} If sub-blocks are not objects or validation rules are malformed.
   */
```
---
#### METHOD: ImportConfiguration._validateLoad
- **Scope:** instance
- **LLM Call Syntax:** `importConfiguration._validateLoad(load);`
- **Pure JSDoc:**
```javascript
/**
   * Validates persistence parameters, conflict resolution strategies, and conditional update rules.
   * @private
   * @param {Object} load Load configuration segment.
   * @throws {ConfigurationError} If target table is missing or conflict resolution logic is incomplete.
   */
```
---
#### METHOD: ImportConfiguration.getName
- **Scope:** instance
- **LLM Call Syntax:** `const result = importConfiguration.getName();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the identification name of the import process.
   * @returns {string} Import name.
   */
```
---
#### METHOD: ImportConfiguration.getSource
- **Scope:** instance
- **LLM Call Syntax:** `const result = importConfiguration.getSource();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the extraction source configuration.
   * @returns {Object} Source parameters.
   */
```
---
#### METHOD: ImportConfiguration.getTransform
- **Scope:** instance
- **LLM Call Syntax:** `const result = importConfiguration.getTransform();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves data transformation rules or an empty object if none are defined.
   * @returns {Object} Transform parameters.
   */
```
---
#### METHOD: ImportConfiguration.getLoad
- **Scope:** instance
- **LLM Call Syntax:** `const result = importConfiguration.getLoad();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves persistence and conflict resolution configuration.
   * @returns {Object} Load parameters.
   */
```
---
#### METHOD: ImportConfiguration.getRecipe
- **Scope:** instance
- **LLM Call Syntax:** `const result = importConfiguration.getRecipe();`
- **Pure JSDoc:**
```javascript
/**
   * Returns the full original recipe configuration.
   * @returns {Object} Complete recipe object.
   */
```
---
#### METHOD: ImportConfiguration.getSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = importConfiguration.getSummary();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a high-level overview of the configuration for diagnostic and logging purposes.
   * @returns {Object} Logic summary.
   */
```
---
<br>

## CLASS: Transformer
**File Path:** `GasDataImporter/src/pipeline/Transformer.js`
**Constructor Usage:** `const instance = new Transformer(logger, expressionEngine, utils);`
**Description:** Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.

### Raw JSDoc Context:
```javascript
/**
 * Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.
 * @class
 */
```

### Methods of Transformer

#### METHOD: Transformer.transform
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformer.transform(sourceData, transformConfig);`
- **Pure JSDoc:**
```javascript
/**
   * Processes a collection of raw data rows according to the specified transformation recipe.
   * @param {Array<Object>} sourceData Collection of raw input rows.
   * @param {Object} transformConfig transformation rules (mapping, calculated, normalization, validation).
   * @returns {Array<Object>} Transformed and filtered row collection.
   * @throws {TransformError} If input is malformed or a fatal transformation failure occurs.
   */
```
---
#### METHOD: Transformer._transformRow
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformer._transformRow(sourceRow, rowIndex, mapping, calculated, normalization, validation);`
- **Pure JSDoc:**
```javascript
/**
   * Executes the sequential transformation pipeline for a single data record.
   * @private
   * @param {Object} sourceRow raw input attributes.
   * @param {number} rowIndex record position for diagnostic tracking.
   * @param {Object} mapping field renaming rules.
   * @param {Object} calculated computed field expressions.
   * @param {Object} normalization data cleaning rules.
   * @param {Object} validation record-level integrity checks.
   * @returns {Object|null} Transformed record or null if validation fails.
   * @throws {TransformError} On circular dependencies or unrecoverable row failures.
   */
```
---
<br>

## CLASS: Loader
**File Path:** `GasDataImporter/src/internal/load/Loader.js`
**Constructor Usage:** `const instance = new Loader(logger, databaseService);`
**Description:** Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.

### Raw JSDoc Context:
```javascript
/**
 * Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.
 * @class
 */
```

### Methods of Loader

#### METHOD: Loader.load
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader.load(data, loadConfig, loadConfig.targetTable, loadConfig.conflictResolution, loadConfig.conflictKey, loadConfig.updateIfNewer);`
- **Pure JSDoc:**
```javascript
/**
   * Executes the persistence phase, applying conflict resolution and timestamp-based update rules to the provided data collection.
   * @param {Array<Object>} data Transformed row collection.
   * @param {Object} loadConfig persistence parameters.
   * @param {string} loadConfig.targetTable Destination table identifier.
   * @param {string} loadConfig.conflictResolution resolution strategy (INSERT_ONLY|UPDATE_ONLY|UPSERT|OVERWRITE).
   * @param {string} [loadConfig.conflictKey] Attribute used for collision detection.
   * @param {Object} [loadConfig.updateIfNewer] Optional timestamp comparison rules.
   * @returns {Object} Operational statistics.
   * @throws {LoadError} If database is inaccessible or strategy execution fails.
   */
```
---
#### METHOD: Loader._insertOnly
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader._insertOnly(table, data, conflictKey);`
- **Pure JSDoc:**
```javascript
/**
   * Strategy to exclusively add new records while ignoring existing collisions.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to evaluate.
   * @param {string} conflictKey Attribute for collision detection.
   * @returns {Object} statistics.
   */
```
---
#### METHOD: Loader._updateOnly
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader._updateOnly(table, data, conflictKey, updateIfNewer);`
- **Pure JSDoc:**
```javascript
/**
   * Strategy to refresh existing records while ignoring new entries.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to evaluate.
   * @param {string} conflictKey Attribute for record matching.
   * @param {Object} updateIfNewer Timestamp comparison configuration.
   * @returns {Object} statistics.
   */
```
---
#### METHOD: Loader._upsert
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader._upsert(table, data, conflictKey, updateIfNewer);`
- **Pure JSDoc:**
```javascript
/**
   * Strategy to synchronize data by updating existing matches and inserting new entries.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to evaluate.
   * @param {string} conflictKey Attribute for matching and detection.
   * @param {Object} updateIfNewer Timestamp comparison configuration.
   * @returns {Object} statistics.
   */
```
---
#### METHOD: Loader._overwrite
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader._overwrite(table, data, conflictKey);`
- **Pure JSDoc:**
```javascript
/**
   * Destructive strategy that purges existing table content before performing bulk insertion.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to insert.
   * @param {string} conflictKey Attribute for row identification.
   * @returns {Object} statistics.
   */
```
---
#### METHOD: Loader._shouldUpdate
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader._shouldUpdate(existing, incoming, timestampColumn);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates if an incoming record possesses a more recent timestamp than the existing persistence state.
   * @private
   * @param {Object} existing current database record.
   * @param {Object} incoming candidate update record.
   * @param {string} timestampColumn Name of the attribute containing temporal metadata.
   * @returns {boolean} True if the update should proceed.
   */
```
---
#### METHOD: Loader._validateLoadConfig
- **Scope:** instance
- **LLM Call Syntax:** `loader._validateLoadConfig(config);`
- **Pure JSDoc:**
```javascript
/**
   * Enforces structural requirements for the load configuration block.
   * @private
   * @param {Object} config target configuration segment.
   * @throws {LoadError} If mandatory fields (table, strategy, conflict key) are missing.
   */
```
---
<br>

## CLASS: SourceStrategyFactory
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategyFactory.js`
**Constructor Usage:** `const instance = new SourceStrategyFactory(logger, driveService, spreadsheetService);`
**Description:** Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.

### Raw JSDoc Context:
```javascript
/**
 * Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.
 * @class
 */
```

### Methods of SourceStrategyFactory

#### METHOD: SourceStrategyFactory._registerBuiltInStrategies
- **Scope:** instance
- **LLM Call Syntax:** `sourceStrategyFactory._registerBuiltInStrategies();`
- **Pure JSDoc:**
```javascript
/**
   * Populates the internal registry with SheetById and Folder extraction adapters.
   * @private
   */
```
---
#### METHOD: SourceStrategyFactory.registerStrategy
- **Scope:** instance
- **LLM Call Syntax:** `sourceStrategyFactory.registerStrategy(name, strategyClass);`
- **Pure JSDoc:**
```javascript
/**
   * Extends the factory with a custom extraction adapter at runtime.
   * @param {string} name Unique strategy identifier (used in recipe source.type).
   * @param {Function} strategyClass Constructor for the strategy class (must extend SourceStrategy).
   * @throws {SourceError} If name is invalid or class is not a constructor.
   */
```
---
#### METHOD: SourceStrategyFactory.createStrategy
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategyFactory.createStrategy(type, dependencies);`
- **Pure JSDoc:**
```javascript
/**
   * Instantiates the requested extraction strategy, automatically injecting required service facades.
   * @param {string} type Strategy identifier.
   * @param {Object} [dependencies={}] Optional dependencies for custom strategies.
   * @returns {Object} Initialized strategy instance.
   * @throws {SourceError} If type is unregistered or instantiation fails.
   */
```
---
#### METHOD: SourceStrategyFactory.hasStrategy
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategyFactory.hasStrategy(type);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies if a specific strategy identifier is present in the factory registry.
   * @param {string} type Strategy identifier to verify.
   * @returns {boolean} True if the strategy is registered.
   */
```
---
#### METHOD: SourceStrategyFactory.getAvailableStrategies
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategyFactory.getAvailableStrategies();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a list of all registered extraction strategy identifiers.
   * @returns {Array<string>} Collection of available strategy names.
   */
```
---
<br>

## CLASS: SourceStrategy
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.js`
**Constructor Usage:** `const instance = new SourceStrategy(logger);`
**Description:** Abstract base class defining the contract for data extraction strategies, providing common lifecycle hooks and data normalization utilities.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class defining the contract for data extraction strategies, providing common lifecycle hooks and data normalization utilities.
 * @abstract
 * @class
 */
```

### Methods of SourceStrategy

#### METHOD: SourceStrategy.extract
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategy.extract(config);`
- **Pure JSDoc:**
```javascript
/**
   * Public interface method orchestrating the extraction lifecycle, including logging, subclass execution, and result validation.
   * @param {Object} config Source-specific parameters.
   * @returns {Array<Object>} Extracted and normalized data rows.
   * @throws {SourceError} If extraction fails or result is not an array.
   */
```
---
#### METHOD: SourceStrategy._extractData
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategy._extractData(config);`
- **Pure JSDoc:**
```javascript
/**
   * Abstract hook for implementing source-specific data retrieval logic.
   * @abstract
   * @protected
   * @param {Object} config Source-specific parameters.
   * @returns {Array<Object>} Collection of raw data rows.
   * @throws {Error} If subclass fails to implement.
   * @throws {SourceError} If retrieval fails.
   */
```
---
#### METHOD: SourceStrategy._arrayToObjects
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategy._arrayToObjects(data, hasHeaders);`
- **Pure JSDoc:**
```javascript
/**
   * Normalizes 2D grid data into an array of objects, optionally using the first row as property keys.
   * @protected
   * @param {Array<Array>} data 2D data grid.
   * @param {boolean} [hasHeaders=true] If true, uses first row for attribute keys.
   * @returns {Array<Object>} Collection of row objects.
   */
```
---
#### METHOD: SourceStrategy._coerceValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategy._coerceValue(value);`
- **Pure JSDoc:**
```javascript
/**
   * Casts raw string values into their appropriate JavaScript types (Number, Boolean) for domain consistency.
   * Delegates to CoreUtilsLib's shared CellValueCoercion (dedupe of the
   * duplicate previously kept in sync manually with SheetDBLib).
   * @protected
   * @param {*} value Raw cell value.
   * @returns {*} Coerced primitive value.
   */
```
---
#### METHOD: SourceStrategy._columnToLetter
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategy._columnToLetter(column);`
- **Pure JSDoc:**
```javascript
/**
   * Converts a 1-based column index into its A1-notation letter (1 -> 'A', 27 -> 'AA').
   * Shared by strategies that build explicit A1 ranges (FolderStrategy, SheetByIdStrategy).
   * @protected
   * @param {number} column 1-based column index.
   * @returns {string} A1-notation column letter(s).
   */
```
---
#### METHOD: SourceStrategy._validateConfig
- **Scope:** instance
- **LLM Call Syntax:** `sourceStrategy._validateConfig(config, requiredFields);`
- **Pure JSDoc:**
```javascript
/**
   * Enforces existence of mandatory configuration parameters.
   * @protected
   * @param {Object} config extraction parameters.
   * @param {string[]} requiredFields Collection of mandatory attribute keys.
   * @throws {SourceError} If any mandatory fields are missing.
   */
```
---
<br>

## CLASS: SheetByIdStrategy
**File Path:** `GasDataImporter/src/internal/extract-strategies/SheetByIdStrategy.js`
**Constructor Usage:** `const instance = new SheetByIdStrategy(logger, spreadsheetService);`
**Description:** Extraction strategy for retrieving data from a specific Google Sheets document using its ID, supporting targeted tab and range selection.

### Raw JSDoc Context:
```javascript
/**
 * Extraction strategy for retrieving data from a specific Google Sheets document using its ID, supporting targeted tab and range selection.
 * @class
 * @extends SourceStrategy
 */
```

### Methods of SheetByIdStrategy

#### METHOD: SheetByIdStrategy._extractData
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy._extractData(config, config.sheetId, config.tabName, config.range, config.hasHeaders);`
- **Pure JSDoc:**
```javascript
/**
   * Implements single-document extraction logic, resolving metadata and fetching cell values via SpreadsheetService.
   * @protected
   * @param {Object} config Extraction parameters.
   * @param {string} config.sheetId physical spreadsheet identifier.
   * @param {string} [config.tabName] Target tab identifier (defaults to first).
   * @param {string} [config.range=''] A1 notation or empty for full sheet.
   * @param {boolean} [config.hasHeaders=true] If true, treats first row as property keys.
   * @returns {Array<Object>} Hydrated row objects from the sheet.
   * @throws {SourceError} If document is inaccessible, has no sheets, or target tab is missing.
   */
```
---
#### METHOD: SheetByIdStrategy.extractRaw
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy.extractRaw(config);`
- **Pure JSDoc:**
```javascript
/**
   * Extracts the raw grid (no header-object mapping) for callers that need
   * `string[][]`-shaped data rather than import-recipe row objects — e.g.
   * inserting a data-driven table into a Google Doc (ref REPORT_GLF.md B6).
   * Shares the same sheet/tab/range resolution as `extract()`, so both use
   * cases stay in sync with a single implementation.
   * @param {Object} config Extraction parameters (see `_extractData`).
   * @returns {Array<Array<*>>} Raw grid values, header row included if present.
   * @throws {SourceError} If document is inaccessible, has no sheets, or target tab is missing.
   */
```
---
#### METHOD: SheetByIdStrategy._resolveValues
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy._resolveValues(config);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves the target tab/range and fetches the raw grid via
   * SpreadsheetService, shared by `_extractData` (import recipes) and
   * `extractRaw` (raw grid consumers).
   * @private
   * @param {Object} config Extraction parameters (see `_extractData`).
   * @returns {Array<Array<*>>} Raw grid values (possibly empty).
   * @throws {SourceError} If document is inaccessible, has no sheets, or target tab is missing.
   */
```
---
#### METHOD: SheetByIdStrategy.extract
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy.extract(config);`
- **Pure JSDoc:**
```javascript
/**
   * Public interface method orchestrating the extraction lifecycle, including logging, subclass execution, and result validation.
   * @param {Object} config Source-specific parameters.
   * @returns {Array<Object>} Extracted and normalized data rows.
   * @throws {SourceError} If extraction fails or result is not an array.
   */
```
---
#### METHOD: SheetByIdStrategy._arrayToObjects
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy._arrayToObjects(data, hasHeaders);`
- **Pure JSDoc:**
```javascript
/**
   * Normalizes 2D grid data into an array of objects, optionally using the first row as property keys.
   * @protected
   * @param {Array<Array>} data 2D data grid.
   * @param {boolean} [hasHeaders=true] If true, uses first row for attribute keys.
   * @returns {Array<Object>} Collection of row objects.
   */
```
---
#### METHOD: SheetByIdStrategy._coerceValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy._coerceValue(value);`
- **Pure JSDoc:**
```javascript
/**
   * Casts raw string values into their appropriate JavaScript types (Number, Boolean) for domain consistency.
   * Delegates to CoreUtilsLib's shared CellValueCoercion (dedupe of the
   * duplicate previously kept in sync manually with SheetDBLib).
   * @protected
   * @param {*} value Raw cell value.
   * @returns {*} Coerced primitive value.
   */
```
---
#### METHOD: SheetByIdStrategy._columnToLetter
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy._columnToLetter(column);`
- **Pure JSDoc:**
```javascript
/**
   * Converts a 1-based column index into its A1-notation letter (1 -> 'A', 27 -> 'AA').
   * Shared by strategies that build explicit A1 ranges (FolderStrategy, SheetByIdStrategy).
   * @protected
   * @param {number} column 1-based column index.
   * @returns {string} A1-notation column letter(s).
   */
```
---
#### METHOD: SheetByIdStrategy._validateConfig
- **Scope:** instance
- **LLM Call Syntax:** `sheetByIdStrategy._validateConfig(config, requiredFields);`
- **Pure JSDoc:**
```javascript
/**
   * Enforces existence of mandatory configuration parameters.
   * @protected
   * @param {Object} config extraction parameters.
   * @param {string[]} requiredFields Collection of mandatory attribute keys.
   * @throws {SourceError} If any mandatory fields are missing.
   */
```
---
<br>

## CLASS: FolderStrategy
**File Path:** `GasDataImporter/src/internal/extract-strategies/FolderStrategy.js`
**Constructor Usage:** `const instance = new FolderStrategy(logger, driveService, spreadsheetService);`
**Description:** Extraction strategy for bulk-processing all Google Sheets within a target Drive folder, supporting regex filtering and metadata tracking.

### Raw JSDoc Context:
```javascript
/**
 * Extraction strategy for bulk-processing all Google Sheets within a target Drive folder, supporting regex filtering and metadata tracking.
 * @class
 * @extends SourceStrategy
 */
```

### Methods of FolderStrategy

#### METHOD: FolderStrategy._extractData
- **Scope:** instance
- **LLM Call Syntax:** `const result = folderStrategy._extractData(config, config.folderId, config.fileNamePattern, config.mergeData);`
- **Pure JSDoc:**
```javascript
/**
   * Implements multi-file extraction logic, traversing the folder and aggregating rows from matching spreadsheets.
   * @protected
   * @param {Object} config Extraction parameters.
   * @param {string} config.folderId physical Drive folder identifier.
   * @param {string} [config.fileNamePattern] Regex for filtering file names.
   * @param {boolean} [config.mergeData=true] If true, flattens all rows into a single array.
   * @returns {Array<Object>|Array<{fileName:string, fileId:string, data:Object[]}>} Aggregated data collection.
   * @throws {SourceError} If folder is inaccessible or regex is malformed.
   */
```
---
#### METHOD: FolderStrategy._extractFromFile
- **Scope:** instance
- **LLM Call Syntax:** `const result = folderStrategy._extractFromFile(fileId, fileName, range, tabName, hasHeaders, includeSourceFile);`
- **Pure JSDoc:**
```javascript
/**
   * Executes the extraction workflow for a single spreadsheet file within the folder.
   * @private
   * @param {string} fileId spreadsheet identifier.
   * @param {string} fileName Semantic file name for logging.
   * @param {string} range A1 notation or empty for full sheet.
   * @param {string} [tabName] Target tab identifier.
   * @param {boolean} hasHeaders If true, treats first row as property keys.
   * @param {boolean} includeSourceFile If true, injects file metadata into each row.
   * @returns {Array<Object>} Hydrated row objects from the file.
   * @throws {SourceError} If the file contains no sheets or target tab is missing.
   */
```
---
#### METHOD: FolderStrategy.extract
- **Scope:** instance
- **LLM Call Syntax:** `const result = folderStrategy.extract(config);`
- **Pure JSDoc:**
```javascript
/**
   * Public interface method orchestrating the extraction lifecycle, including logging, subclass execution, and result validation.
   * @param {Object} config Source-specific parameters.
   * @returns {Array<Object>} Extracted and normalized data rows.
   * @throws {SourceError} If extraction fails or result is not an array.
   */
```
---
#### METHOD: FolderStrategy._arrayToObjects
- **Scope:** instance
- **LLM Call Syntax:** `const result = folderStrategy._arrayToObjects(data, hasHeaders);`
- **Pure JSDoc:**
```javascript
/**
   * Normalizes 2D grid data into an array of objects, optionally using the first row as property keys.
   * @protected
   * @param {Array<Array>} data 2D data grid.
   * @param {boolean} [hasHeaders=true] If true, uses first row for attribute keys.
   * @returns {Array<Object>} Collection of row objects.
   */
```
---
#### METHOD: FolderStrategy._coerceValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = folderStrategy._coerceValue(value);`
- **Pure JSDoc:**
```javascript
/**
   * Casts raw string values into their appropriate JavaScript types (Number, Boolean) for domain consistency.
   * Delegates to CoreUtilsLib's shared CellValueCoercion (dedupe of the
   * duplicate previously kept in sync manually with SheetDBLib).
   * @protected
   * @param {*} value Raw cell value.
   * @returns {*} Coerced primitive value.
   */
```
---
#### METHOD: FolderStrategy._columnToLetter
- **Scope:** instance
- **LLM Call Syntax:** `const result = folderStrategy._columnToLetter(column);`
- **Pure JSDoc:**
```javascript
/**
   * Converts a 1-based column index into its A1-notation letter (1 -> 'A', 27 -> 'AA').
   * Shared by strategies that build explicit A1 ranges (FolderStrategy, SheetByIdStrategy).
   * @protected
   * @param {number} column 1-based column index.
   * @returns {string} A1-notation column letter(s).
   */
```
---
#### METHOD: FolderStrategy._validateConfig
- **Scope:** instance
- **LLM Call Syntax:** `folderStrategy._validateConfig(config, requiredFields);`
- **Pure JSDoc:**
```javascript
/**
   * Enforces existence of mandatory configuration parameters.
   * @protected
   * @param {Object} config extraction parameters.
   * @param {string[]} requiredFields Collection of mandatory attribute keys.
   * @throws {SourceError} If any mandatory fields are missing.
   */
```
---
<br>

## CLASS: TransformError
**File Path:** `GasDataImporter/src/internal/errors/TransformError.js`
**Constructor Usage:** `const instance = new TransformError(message, code, context);`
**Description:** Exception class for failures during the data transformation phase, capturing mapping errors, normalization failures, and expression evaluation exceptions.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for failures during the data transformation phase, capturing mapping errors, normalization failures, and expression evaluation exceptions.
 * @class
 * @extends ImportError
 */
```

### Methods of TransformError

#### METHOD: TransformError.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformError.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the structured error state into a plain object for logging or diagnostic transmission.
   * @returns {Object} Serialized error state.
   */
```
---
#### METHOD: TransformError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a readable summary of the error including classification and description.
   * @returns {string} Formatted error string ([name] CODE: message).
   */
```
---
<br>

## CLASS: SourceError
**File Path:** `GasDataImporter/src/internal/errors/SourceError.js`
**Constructor Usage:** `const instance = new SourceError(message, code, context);`
**Description:** Exception class for failures during the extraction phase, capturing file resolution errors, permission denials, and malformed source configurations.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for failures during the extraction phase, capturing file resolution errors, permission denials, and malformed source configurations.
 * @class
 * @extends ImportError
 */
```

### Methods of SourceError

#### METHOD: SourceError.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceError.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the structured error state into a plain object for logging or diagnostic transmission.
   * @returns {Object} Serialized error state.
   */
```
---
#### METHOD: SourceError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a readable summary of the error including classification and description.
   * @returns {string} Formatted error string ([name] CODE: message).
   */
```
---
<br>

## CLASS: LoadError
**File Path:** `GasDataImporter/src/internal/errors/LoadError.js`
**Constructor Usage:** `const instance = new LoadError(message, code, context);`
**Description:** Exception class for failures during the persistence phase, capturing table access errors, conflict resolution violations, and database-level exceptions.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for failures during the persistence phase, capturing table access errors, conflict resolution violations, and database-level exceptions.
 * @class
 * @extends ImportError
 */
```

### Methods of LoadError

#### METHOD: LoadError.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = loadError.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the structured error state into a plain object for logging or diagnostic transmission.
   * @returns {Object} Serialized error state.
   */
```
---
#### METHOD: LoadError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = loadError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a readable summary of the error including classification and description.
   * @returns {string} Formatted error string ([name] CODE: message).
   */
```
---
<br>

## CLASS: ImportError
**File Path:** `GasDataImporter/src/internal/errors/ImportError.js`
**Constructor Usage:** `const instance = new ImportError(message, code, context);`
**Description:** Foundational error class for the ETL pipeline, providing structured diagnostic state including classification codes, contextual metadata, and occurrence timestamps.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

### Raw JSDoc Context:
```javascript
/**
 * Foundational error class for the ETL pipeline, providing structured diagnostic state including classification codes, contextual metadata, and occurrence timestamps.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 * @class
 * @extends BaseError
 */
```

### Methods of ImportError

#### METHOD: ImportError.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = importError.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the structured error state into a plain object for logging or diagnostic transmission.
   * @returns {Object} Serialized error state.
   */
```
---
#### METHOD: ImportError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = importError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a readable summary of the error including classification and description.
   * @returns {string} Formatted error string ([name] CODE: message).
   */
```
---
<br>

## CLASS: ConfigurationError
**File Path:** `GasDataImporter/src/internal/errors/ConfigurationError.js`
**Constructor Usage:** `const instance = new ConfigurationError(message, code, context);`
**Description:** Exception class for ETL recipe validation failures, capturing structural violations, missing mandatory fields, or invalid strategy identifiers.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for ETL recipe validation failures, capturing structural violations, missing mandatory fields, or invalid strategy identifiers.
 * @class
 * @extends ImportError
 */
```

### Methods of ConfigurationError

#### METHOD: ConfigurationError.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = configurationError.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the structured error state into a plain object for logging or diagnostic transmission.
   * @returns {Object} Serialized error state.
   */
```
---
#### METHOD: ConfigurationError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = configurationError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a readable summary of the error including classification and description.
   * @returns {string} Formatted error string ([name] CODE: message).
   */
```
---
<br>

