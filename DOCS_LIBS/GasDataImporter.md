# API Reference: GasDataImporter

## CLASS: ImportEngine
**File Path:** `GasDataImporter/src/ImportEngine.ts`
**Constructor Usage:** `const instance = new ImportEngine(logger, driveService, spreadsheetService, databaseService, expressionEngine, exceptionService, monitor);`
**Description:** Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.

### Raw JSDoc Context:
```javascript
/**
 * Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.
 * @class
 */
```

### Methods and properties of ImportEngine

#### METHOD: ImportEngine.registerCustomSource
- **Scope:** instance
- **LLM Call Syntax:** `importEngine.registerCustomSource(name, strategyClass);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a custom source-extraction strategy and whitelists its type for recipe validation.
   * @param {string} name Source type identifier.
   * @param {Function} strategyClass Strategy class implementing the source-extraction contract.
   */
```
---
#### METHOD: ImportEngine.getAvailableSourceTypes
- **Scope:** instance
- **LLM Call Syntax:** `const result = importEngine.getAvailableSourceTypes();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {Array<string>} Registered source-strategy type identifiers.
   */
```
---
#### METHOD: ImportEngine.getConfigSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = importEngine.getConfigSummary();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {Object} Summary of the engine's configured capabilities.
   */
```
---
#### METHOD: ImportEngine.validateRecipe
- **Scope:** instance
- **LLM Call Syntax:** `const result = importEngine.validateRecipe(recipe);`
- **Pure JSDoc:**
```javascript
/**
   * Validates an import recipe without executing it.
   * @param {Object} recipe Import configuration (see ImportConfiguration).
   * @returns {{valid: boolean, summary: Object, message: string}|{valid: boolean, error: string, code: string}}
   */
```
---
<br>

## CLASS: ImportConfiguration
**File Path:** `GasDataImporter/src/ImportConfiguration.ts`
**Constructor Usage:** `const instance = new ImportConfiguration(recipe, recipe.name, recipe.source, recipe.transform, recipe.load, logger);`
**Description:** Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.

### Raw JSDoc Context:
```javascript
/**
 * Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.
 * @class
 */
```

### Methods and properties of ImportConfiguration

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

## CLASS: ImportCheckpoint
**File Path:** `GasDataImporter/src/ImportCheckpoint.ts`
**Constructor Usage:** `const instance = new ImportCheckpoint(recipeName, stage, sourceCursor, rowOffset, loadOffset, counters, buffer, done);`
**Description:** Plain, JSON-serializable checkpoint describing progress through a single
recipe's ETL pipeline (EXTRACT -> LOAD -> DONE, transform runs inline
during EXTRACT on each bounded chunk). Designed to
be persisted via `PropertiesService`/`JobRunnerLib` between GAS execution
windows and resumed with `ImportEngine.runImportChunk`.

### Raw JSDoc Context:
```javascript
/**
 * Plain, JSON-serializable checkpoint describing progress through a single
 * recipe's ETL pipeline (EXTRACT -> LOAD -> DONE, transform runs inline
 * during EXTRACT on each bounded chunk). Designed to
 * be persisted via `PropertiesService`/`JobRunnerLib` between GAS execution
 * windows and resumed with `ImportEngine.runImportChunk`.
 * @class
 */
```

### Methods and properties of ImportCheckpoint

#### METHOD: ImportCheckpoint.initial
- **Scope:** static
- **LLM Call Syntax:** `const result = ImportCheckpoint.initial(recipeName);`
- **Pure JSDoc:**
```javascript
/**
   * Builds a fresh checkpoint at the EXTRACT stage with zeroed counters.
   * @param {string} recipeName Name of the recipe to import.
   * @returns {ImportCheckpoint} Initial checkpoint.
   */
```
---
#### METHOD: ImportCheckpoint.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = ImportCheckpoint.fromJSON(obj);`
- **Pure JSDoc:**
```javascript
/**
   * Rehydrates a checkpoint from its plain-object JSON form (e.g. after
   * round-tripping through `PropertiesService`).
   * @param {Object} obj Plain object matching the `ImportCheckpoint` shape.
   * @returns {ImportCheckpoint} Rehydrated checkpoint instance.
   */
```
---
#### METHOD: ImportCheckpoint.assertMatches
- **Scope:** static
- **LLM Call Syntax:** `ImportCheckpoint.assertMatches(checkpoint, recipeName);`
- **Pure JSDoc:**
```javascript
/**
   * Guards against resuming a checkpoint with the wrong recipe.
   * @param {ImportCheckpoint} checkpoint Checkpoint being resumed.
   * @param {string} recipeName Name of the recipe the caller intends to resume.
   * @throws {Error} If the checkpoint's recipeName does not match.
   */
```
---
<br>

## CLASS: Transformer
**File Path:** `GasDataImporter/src/pipeline/Transformer.ts`
**Constructor Usage:** `const instance = new Transformer(logger, expressionEngine, utils);`
**Description:** Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.

### Raw JSDoc Context:
```javascript
/**
 * Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.
 * @class
 */
```

### Methods and properties of Transformer

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
#### METHOD: Transformer._applyMapping
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformer._applyMapping(sourceRow, mapping);`
- **Pure JSDoc:**
```javascript
/**
   * Transforms row attributes according to the provided mapping schema, renaming source columns to target identifiers.
   * @private
   * @param {Object} sourceRow raw input record.
   * @param {Object} mapping field renaming rules.
   * @returns {Object} mapped record state.
   */
```
---
#### METHOD: Transformer._applyCalculated
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformer._applyCalculated(row, calculated);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates computed field expressions, managing dependency resolution and topological execution order.
   * @private
   * @param {Object} row current record state.
   * @param {Object} calculated map of field names to logic expressions.
   * @returns {Object} record state updated with computed values.
   * @throws {TransformError} If a circular dependency is detected or evaluation fails.
   */
```
---
#### METHOD: Transformer._buildDependencyGraph
- **Scope:** instance
- **LLM Call Syntax:** `transformer._buildDependencyGraph();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
#### METHOD: Transformer._extractPlaceholders
- **Scope:** instance
- **LLM Call Syntax:** `transformer._extractPlaceholders();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
#### METHOD: Transformer._topologicalSort
- **Scope:** instance
- **LLM Call Syntax:** `transformer._topologicalSort();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
#### METHOD: Transformer._evaluateExpression
- **Scope:** instance
- **LLM Call Syntax:** `transformer._evaluateExpression();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
#### METHOD: Transformer._simpleTemplateSubstitution
- **Scope:** instance
- **LLM Call Syntax:** `transformer._simpleTemplateSubstitution();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
#### METHOD: Transformer._formatDate
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformer._formatDate(value, format);`
- **Pure JSDoc:**
```javascript
/**
   * Normalizes a raw input value into a formatted date string using CoreUtilsLib parsing and formatting.
   * @private
   * @param {*} value Raw temporal input.
   * @param {string} format target date pattern (e.g., 'YYYY-MM-DD').
   * @returns {string|*} Formatted date string or original value if parsing fails.
   */
```
---
#### METHOD: Transformer._applyNormalization
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformer._applyNormalization(row, normalization);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates data cleaning tasks including whitespace trimming, case normalization, and date reformatting.
   * @private
   * @param {Object} row raw record state.
   * @param {Object} normalization set of cleaning rules (trim, dateColumns, uppercaseColumns, lowercaseColumns).
   * @returns {Object} normalized record state.
   */
```
---
#### METHOD: Transformer._applyValidation
- **Scope:** instance
- **LLM Call Syntax:** `const result = transformer._applyValidation(row, validation, rowIndex);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates record-level integrity rules against a transformed row, rejecting records that fail any predicate.
   * @private
   * @param {Object} row transformed record attributes.
   * @param {string|Array<string>} validation Logic expression or collection of rules.
   * @param {number} rowIndex record position for diagnostic logging.
   * @returns {boolean} True if all validation predicates are satisfied.
   */
```
---
<br>

## CLASS: ImportPipelineExecutor
**File Path:** `GasDataImporter/src/pipeline/ImportPipelineExecutor.ts`
**Constructor Usage:** `const instance = new ImportPipelineExecutor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of ImportPipelineExecutor

#### METHOD: ImportPipelineExecutor.startImport
- **Scope:** instance
- **LLM Call Syntax:** `const result = importPipelineExecutor.startImport(recipe, _options);`
- **Pure JSDoc:**
```javascript
/**
   * Creates the initial checkpoint for a resumable/checkpointed import run,
   * without executing any pipeline phase yet. Pair with `runImportChunk` in
   * a loop (persisting the checkpoint to `PropertiesService` between GAS
   * execution windows via `JobRunnerLib`) to drive the recipe to completion
   * across multiple bounded chunks instead of one synchronous `runImport`.
   * @param {Object} recipe Import configuration (see ImportConfiguration).
   * @param {Object} [_options={}] Reserved for future use.
   * @returns {ImportCheckpoint} Initial checkpoint at the EXTRACT stage.
   * @throws {ConfigurationError} If the recipe fails validation.
   */
```
---
#### METHOD: ImportPipelineExecutor.runImportChunk
- **Scope:** instance
- **LLM Call Syntax:** `const result = importPipelineExecutor.runImportChunk(recipe, checkpoint, budget, budget.maxRows);`
- **Pure JSDoc:**
```javascript
/**
   * Advances a checkpoint by one bounded unit of work. The recipe must be
   * re-passed on every call — it is intentionally not part of the
   * serializable checkpoint, to keep checkpoints small (`PropertiesService`
   * has per-key size limits) and because the recipe is normally already
   * available to the caller (e.g. `JobHandlerParams` in ALDO's `JobRunnerLib`
   * integration).
   *
   * Unlike the original design (extract everything into the buffer, then
   * transform the whole buffer, then load the whole buffer), each call now
   * does bounded work and `checkpoint.buffer` never holds more than roughly
   * one `maxRows`-sized batch at rest between calls (for the cursor-aware
   * case) — otherwise `checkpoint.buffer` could grow to the size of the
   * entire dataset, which won't fit in `PropertiesService` (~9KB per key,
   * ~500KB total), and TRANSFORM/LOAD would each still run unbounded in one
   * call, defeating the point of chunking:
   *
   * - **`EXTRACT`** (entered when `checkpoint.buffer` is empty and
   *   extraction isn't exhausted): pulls one bounded window of rows (see
   *   "Cursor-aware extraction" below), immediately transforms *that chunk*
   *   (`Transformer.transform` is a pure per-row mapping, so transforming a
   *   bounded slice is safe), and stores the transformed, load-ready rows as
   *   `checkpoint.buffer`. Moves to `LOAD`. Whether the source is now fully
   *   consumed is remembered in `checkpoint.rowOffset` (repurposed as a 0/1
   *   "extraction exhausted" flag — the field was previously reserved and
   *   unused) so the `LOAD` branch below can decide, without re-extracting,
   *   whether there is more to pull after this buffer is loaded.
   * - **`LOAD`** (entered when `checkpoint.buffer` has pending rows): loads
   *   the buffer via `Loader.loadChunk` (already handles arbitrary-size
   *   input, since it's already one bounded chunk) and clears the buffer.
   *   `isFirstChunk` is true only on the very first `LOAD` call of the
   *   entire run that actually carries a non-empty buffer
   *   (`checkpoint.loadOffset === 0`); `loadOffset` only increments when the
   *   chunk being loaded is non-empty — an empty chunk (e.g. a leading block
   *   of rows that were all rejected by transform validation, or a genuinely
   *   empty extracted window) does NOT consume the "first chunk" slot,
   *   because `Loader.loadChunk` short-circuits on `data.length === 0`
   *   before OVERWRITE's purge-then-insert logic ever runs — if `loadOffset`
   *   advanced anyway, the table would never get purged for a run whose
   *   first real data happened to arrive after an empty chunk. If
   *   extraction was already exhausted, moves to `DONE`; otherwise moves
   *   back to `EXTRACT` to pull the next bounded chunk.
   *
   * There is no standalone `TRANSFORM` stage: an earlier design produced one
   * (transforming the whole accumulated buffer in its own step), but that
   * design was replaced before ever shipping — transform now happens inline
   * during `EXTRACT`, on the bounded chunk — so no checkpoint constructed by
   * this pipeline (`startImport`, or any transition below) ever carries
   * `stage: 'TRANSFORM'`. A checkpoint whose `stage` isn't `EXTRACT`, `LOAD`,
   * or `DONE` is therefore foreign/corrupt and `runImportChunk` throws
   * rather than silently treating it as complete.
   *
   * Extract-phase behavior depends on `SourceStrategy.supportsCursor()`:
   * cursor-aware strategies (currently only `SheetByIdStrategy`) extract one
   * bounded window per call via `extractChunk`, so the streaming/
   * bounded-buffer guarantee above holds for them. Strategies that don't
   * support cursors fall back to a compatibility path: the entire source is
   * extracted (and, in this call, transformed) in a single call, reported as
   * immediately exhausted — so the bounded-buffer guarantee does NOT hold
   * for non-cursor sources; only `SheetById` truly streams.
   * @param {Object} recipe Import configuration — must match `checkpoint.recipeName`.
   * @param {ImportCheckpoint} checkpoint Checkpoint to resume from.
   * @param {Object} [budget={}] Per-call work limits.
   * @param {number} [budget.maxRows=500] Maximum rows to extract in this call.
   * @returns {{checkpoint: ImportCheckpoint, done: boolean}} Advanced checkpoint and completion flag.
   * @throws {ConfigurationError} If the recipe fails validation.
   * @throws {Error} If `checkpoint.recipeName` doesn't match the recipe being resumed.
   * @throws {ImportError} `UNRECOGNIZED_CHECKPOINT_STAGE` if `checkpoint.stage` isn't
   *   one of `EXTRACT`, `LOAD`, or `DONE` (a foreign/corrupt checkpoint).
   */
```
---
#### METHOD: ImportPipelineExecutor.runImport
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor.runImport();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ImportPipelineExecutor._executePipeline
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor._executePipeline();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ImportPipelineExecutor._executeExtract
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor._executeExtract();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ImportPipelineExecutor._executeTransform
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor._executeTransform();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ImportPipelineExecutor._executeLoad
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor._executeLoad();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ImportPipelineExecutor._generateDryRunLoadResult
- **Scope:** instance
- **LLM Call Syntax:** `importPipelineExecutor._generateDryRunLoadResult();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: Loader
**File Path:** `GasDataImporter/src/internal/load/Loader.ts`
**Constructor Usage:** `const instance = new Loader(logger, databaseService);`
**Description:** Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.

### Raw JSDoc Context:
```javascript
/**
 * Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.
 * @class
 */
```

### Methods and properties of Loader

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
#### METHOD: Loader.loadChunk
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader.loadChunk(data, loadConfig, state, state.isFirstChunk);`
- **Pure JSDoc:**
```javascript
/**
   * Executes a single load chunk for a resumable/checkpointed import run.
   * Reuses the exact same conflict-resolution strategies as {@link Loader#load}
   * (INSERT_ONLY/UPDATE_ONLY/UPSERT are naturally idempotent if the same chunk
   * is re-applied after a resume), except OVERWRITE, whose destructive purge
   * only runs on `isFirstChunk` — subsequent chunks within the same run append
   * **unconditionally** (no conflict-key dedupe), matching {@link
   * Loader#_overwrite}'s single-shot semantics exactly: `load()` with
   * OVERWRITE inserts every row unconditionally in one call, so a chunked
   * OVERWRITE run must insert every row across all its chunks unconditionally
   * too, not silently drop rows that share (or omit) a conflict-key value
   * with a row from an earlier chunk. Always commits via `this._db.save()`
   * at the end, which is the durable checkpoint boundary a resumed run picks
   * up from.
   * @param {Array<Object>} data Transformed row collection for this chunk only.
   * @param {Object} loadConfig persistence parameters (see {@link Loader#load}).
   * @param {Object} state Chunk-position metadata.
   * @param {boolean} state.isFirstChunk True for the first LOAD chunk of a run.
   * @returns {Object} Operational statistics for this chunk.
   * @throws {LoadError} If database is inaccessible or strategy execution fails.
   */
```
---
#### METHOD: Loader._executeStrategy
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader._executeStrategy(table, data, strategy, conflictKey, updateIfNewer, overwriteHandler);`
- **Pure JSDoc:**
```javascript
/**
   * Dispatches the conflict-resolution strategy, returning zeroed statistics
   * for empty data. Shared by {@link Loader#load} and {@link Loader#loadChunk}.
   * @private
   * @param {Object} table Target persistence table.
   * @param {Array<Object>} data Records to process (may be empty).
   * @param {string} strategy Resolution strategy (INSERT_ONLY|UPDATE_ONLY|UPSERT|OVERWRITE).
   * @param {string} conflictKey Attribute used for collision detection.
   * @param {Object} updateIfNewer Optional timestamp comparison rules.
   * @param {Function} overwriteHandler OVERWRITE implementation: `_overwrite`
   *   for a single-shot load or the first chunk of a chunked run, `_appendAll`
   *   for later chunks (see {@link Loader#_appendAll}).
   * @returns {Object} Operational statistics.
   * @throws {LoadError} If the strategy is unknown.
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
#### METHOD: Loader._appendAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = loader._appendAll(table, data);`
- **Pure JSDoc:**
```javascript
/**
   * Unconditional bulk-insert with no conflict-key dedupe and no purge —
   * used exclusively for chunks 2+ of a chunked OVERWRITE run (see
   * {@link Loader#loadChunk}). Chunk 1 already purged the table via
   * {@link Loader#_overwrite}; later chunks must simply append every row
   * they carry, the same way `_overwrite` itself inserts everything
   * unconditionally in a single-shot `load()` call. Unlike
   * {@link Loader#_insertOnly}, this never skips a row because its
   * conflict-key value collides with (or is blank/missing like) another
   * row already in the table — that dedupe behavior is correct for
   * INSERT_ONLY's own semantics but wrong here, since it would silently
   * drop legitimate OVERWRITE rows that a single-shot `load()` call would
   * have inserted without question.
   * @private
   * @param {Object} table target persistence table.
   * @param {Array<Object>} data Records to insert unconditionally.
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
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategyFactory.ts`
**Constructor Usage:** `const instance = new SourceStrategyFactory(logger, driveService, spreadsheetService);`
**Description:** Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.

### Raw JSDoc Context:
```javascript
/**
 * Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.
 * @class
 */
```

### Methods and properties of SourceStrategyFactory

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
**File Path:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.ts`
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

### Methods and properties of SourceStrategy

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
#### METHOD: SourceStrategy.supportsCursor
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategy.supportsCursor();`
- **Pure JSDoc:**
```javascript
/**
   * Indicates whether this strategy can extract data incrementally via
   * `extractChunk` instead of loading the entire source in one `extract()`
   * call. Strategies that don't override this fall back to the
   * "compatibility path" in `ImportPipelineExecutor.runImportChunk`: the
   * first (and only) extraction chunk pulls everything at once.
   * @returns {boolean} True if `extractChunk` is implemented.
   */
```
---
#### METHOD: SourceStrategy.extractChunk
- **Scope:** instance
- **LLM Call Syntax:** `const result = sourceStrategy.extractChunk(_config, _cursor, _maxRows);`
- **Pure JSDoc:**
```javascript
/**
   * Extracts a single bounded chunk of rows starting from `cursor`, for
   * strategies that support incremental extraction (see `supportsCursor`).
   * @param {Object} _config Source-specific parameters.
   * @param {*} _cursor Opaque cursor produced by a previous `extractChunk` call.
   * @param {number} _maxRows Maximum number of rows to extract in this chunk.
   * @returns {{rows: Array<Object>, nextCursor: *, exhausted: boolean}} Chunk result.
   * @throws {Error} Always, unless overridden by a cursor-aware subclass.
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
**File Path:** `GasDataImporter/src/internal/extract-strategies/SheetByIdStrategy.ts`
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

### Methods and properties of SheetByIdStrategy

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
#### METHOD: SheetByIdStrategy.supportsCursor
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy.supportsCursor();`
- **Pure JSDoc:**
```javascript
/**
   * Indicates that this strategy can paginate extraction via `extractChunk`.
   * @returns {boolean} Always true for `SheetByIdStrategy`.
   */
```
---
#### METHOD: SheetByIdStrategy.extractChunk
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy.extractChunk(config, cursor, cursor.rowOffset, cursor.headers, maxRows);`
- **Pure JSDoc:**
```javascript
/**
   * Extracts a single bounded window of rows from the sheet, starting at
   * `cursor.rowOffset` data rows past the header (if any), for incremental
   * import runs that must checkpoint mid-recipe. Shares tab/header
   * resolution semantics with `_resolveValues`/`_extractData`, but issues a
   * narrower `getRanges` call per chunk instead of reading the whole sheet.
   * @param {Object} config Extraction parameters (see `_extractData`).
   * @param {Object} cursor Opaque cursor from a previous `extractChunk` call,
   *   or `{ rowOffset: 0, headers: null }` to start from the beginning.
   * @param {number} cursor.rowOffset Number of data rows already consumed.
   * @param {Array<string>|null} cursor.headers Header row, cached after the
   *   first chunk so subsequent chunks don't re-fetch it.
   * @param {number} maxRows Maximum number of data rows to extract in this chunk.
   * @returns {{rows: Array<Object>, nextCursor: Object, exhausted: boolean}} Chunk result.
   * @throws {SourceError} If document is inaccessible, has no sheets, or target tab is missing.
   */
```
---
#### METHOD: SheetByIdStrategy._parseRangeBounds
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy._parseRangeBounds(range);`
- **Pure JSDoc:**
```javascript
/**
   * Parses an explicit A1-notation range's row/column bounds so
   * `extractChunk` can clamp its pagination window to the same rectangle
   * `_resolveValues` would fetch for the same `config.range`, instead of
   * always paginating the whole sheet grid.
   * @private
   * @param {string} range A1 notation, with or without a leading `Sheet!` prefix.
   * @returns {{startCol: number, startRow: number, endCol: number, endRow: number}|null}
   *   Parsed 1-based bounds, or `null` if the range isn't a full `A1:B2`-style
   *   rectangle (falls back to full-grid pagination in that case).
   */
```
---
#### METHOD: SheetByIdStrategy._letterToColumn
- **Scope:** instance
- **LLM Call Syntax:** `const result = sheetByIdStrategy._letterToColumn(letters);`
- **Pure JSDoc:**
```javascript
/**
   * Converts an A1-notation column letter (or letters) into its 1-based
   * column index ('A' -> 1, 'AA' -> 27). Inverse of `_columnToLetter`.
   * @private
   * @param {string} letters Column letter(s).
   * @returns {number} 1-based column index.
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
<br>

## CLASS: FolderStrategy
**File Path:** `GasDataImporter/src/internal/extract-strategies/FolderStrategy.ts`
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

### Methods and properties of FolderStrategy

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
<br>

## CLASS: TransformError
**File Path:** `GasDataImporter/src/internal/errors/TransformError.ts`
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

<br>

## CLASS: SourceError
**File Path:** `GasDataImporter/src/internal/errors/SourceError.ts`
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

<br>

## CLASS: LoadError
**File Path:** `GasDataImporter/src/internal/errors/LoadError.ts`
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

<br>

## CLASS: ImportError
**File Path:** `GasDataImporter/src/internal/errors/ImportError.ts`
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

### Methods and properties of ImportError

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
**File Path:** `GasDataImporter/src/internal/errors/ConfigurationError.ts`
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

<br>

