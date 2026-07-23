# API Reference: WorkspaceTemplateEngine

## CLASS: MyPlaceholderService
**File Path:** `WorkspaceTemplateEngine/src/PlaceholderService.js`
**Constructor Usage:** `const instance = new MyPlaceholderService(options, options.logger, options.mustache, options.utils, options.cache, options.strictFilters);`
**Description:** Initializes the service with required rendering and logging dependencies.

### Raw JSDoc Context:
```javascript
/**
   * @description Initializes the service with required rendering and logging dependencies.
   * @param {Object} options Configuration options.
   * @param {LoggerService} options.logger Diagnostic logger instance.
   * @param {Mustache} options.mustache Initialized Mustache engine.
   * @param {UtilsService} [options.utils] Optional utility service for formatting.
   * @param {Cache} [options.cache] Optional cache service for template storage.
   * @param {boolean} [options.strictFilters=false] If true, filter errors throw exceptions.
   * @throws {Error} If required mustache dependency is missing.
   */
```

### Methods of MyPlaceholderService

#### METHOD: MyPlaceholderService.processString
- **Scope:** instance
- **LLM Call Syntax:** `const result = myPlaceholderService.processString(template, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Processes a string template using Mustache placeholders and filter pipes.
   * Supports standard Mustache syntax plus `{{value | filter:args}}` extensions.
   * @param {string} template Raw template string.
   * @param {Object} [context={}] Data context for resolution.
   * @returns {string} Processed string or original template on failure.
   * @throws {TypeError} If inputs are invalid types.
   */
```
---
#### METHOD: MyPlaceholderService.resolve
- **Scope:** instance
- **LLM Call Syntax:** `const result = myPlaceholderService.resolve(template, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Alias for processString() to maintain compatibility with GasExpressionEngineLib.
   * @param {string} template Raw template string.
   * @param {Object} [context={}] Data context.
   * @returns {string} Substituted string.
   */
```
---
#### METHOD: MyPlaceholderService.processDocument
- **Scope:** instance
- **LLM Call Syntax:** `const result = myPlaceholderService.processDocument(documentId, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Performs in-place processing of a Google Document with structural expansion.
   * Executes reverse-order operations for tables, lists, and placeholders to maintain index integrity.
   * @param {string} documentId Unique Google Document identifier.
   * @param {Object} [context={}] Data context containing arrays for structural loops.
   * @returns {boolean} True if processing completed without errors.
   * @throws {TypeError} If parameters are invalid.
   */
```
---
#### METHOD: MyPlaceholderService.processSheet
- **Scope:** instance
- **LLM Call Syntax:** `const result = myPlaceholderService.processSheet(sheetId, context, sheetName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes batch updates on a Google Spreadsheet with matrix expansion and placeholder substitution.
   *
   * Return shape changed (additively, in intent): callers that previously treated
   * the return value as a plain boolean must now read `.success` — the resolved
   * `dynamic_columns` column layouts (see `SheetProcessor._prepareDynamicColumnRequests`)
   * are surfaced via `.layouts` so a caller can know which spreadsheet column each
   * templated item landed in (e.g. to apply ACLs the directive's own static `acl=`
   * expression can't express).
   *
   * @param {string} sheetId Unique Google Spreadsheet identifier.
   * @param {Object} [context={}] Data context for substitutions and matrix generation.
   * @param {string|null} [sheetName=null] Target sheet name or null to process all sheets.
   * @returns {{success: boolean, layouts: Array<{sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean}>}>}} `success` is false (and `layouts` empty) on any processing error, matching the pre-existing swallow-and-log behavior.
   * @throws {TypeError} If parameters are invalid.
   */
```
---
<br>

## CLASS: FilterStrategy
**File Path:** `WorkspaceTemplateEngine/src/FilterStrategy.js`
**Constructor Usage:** `const instance = new FilterStrategy();`
**Description:** Abstract base for Mustache template filters using the Strategy pattern.
Enables value transformations via pipe syntax: `{{value | filterName:args}}`.

### Raw JSDoc Context:
```javascript
/**
 * @description Abstract base for Mustache template filters using the Strategy pattern.
 * Enables value transformations via pipe syntax: `{{value | filterName:args}}`.
 * @abstract
 * @class
 * @example
 * class UppercaseFilter extends FilterStrategy {
 *   getName() { return 'uppercase'; }
 *   execute(v) { return String(v).toUpperCase(); }
 * }
 */
```

### Methods of FilterStrategy

#### METHOD: FilterStrategy.getName
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterStrategy.getName();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the unique identifier for the filter used in template expressions.
   * @returns {string} Unique filter name (e.g., 'uppercase').
   * @abstract
   */
```
---
#### METHOD: FilterStrategy.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterStrategy.getDescription();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns a technical description of the filter transformation logic.
   * @returns {string} Human-readable functional summary.
   * @abstract
   */
```
---
#### METHOD: FilterStrategy.execute
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterStrategy.execute(value, args);`
- **Pure JSDoc:**
```javascript
/**
   * @description Performs the core value transformation.
   * @param {*} value Input value to be transformed.
   * @param {...*} args Optional arguments passed from the template expression.
   * @returns {*} The transformed value.
   * @abstract
   */
```
---
#### METHOD: FilterStrategy.validate
- **Scope:** instance
- **LLM Call Syntax:** `filterStrategy.validate(value, args);`
- **Pure JSDoc:**
```javascript
/**
   * @description Validates filter arguments before execution.
   * @param {*} value The input value.
   * @param {Array<*>} args Array of arguments passed to the filter.
   * @throws {Error} If argument validation fails.
   */
```
---
<br>

## CLASS: FilterRegistry
**File Path:** `WorkspaceTemplateEngine/src/FilterStrategy.js`
**Constructor Usage:** `const instance = new FilterRegistry(logger);`
**Description:** Centralized registry for managing and resolving FilterStrategy instances.

### Raw JSDoc Context:
```javascript
/**
 * @description Centralized registry for managing and resolving FilterStrategy instances.
 * @class
 */
```

### Methods of FilterRegistry

#### METHOD: FilterRegistry.register
- **Scope:** instance
- **LLM Call Syntax:** `filterRegistry.register(filterStrategy);`
- **Pure JSDoc:**
```javascript
/**
   * @description Registers a new filter strategy.
   * @param {FilterStrategy} filterStrategy Instance of a FilterStrategy subclass.
   * @throws {Error} If filterStrategy is invalid or name collisions occur.
   */
```
---
#### METHOD: FilterRegistry.registerAll
- **Scope:** instance
- **LLM Call Syntax:** `filterRegistry.registerAll(filterStrategies);`
- **Pure JSDoc:**
```javascript
/**
   * @description Batch registers multiple filter strategies.
   * @param {FilterStrategy[]} filterStrategies Array of filter instances.
   * @throws {Error} If input is not an array.
   */
```
---
#### METHOD: FilterRegistry.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterRegistry.get(name);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves a filter strategy by its unique name.
   * @param {string} name Unique identifier of the filter.
   * @returns {FilterStrategy|null} Filter instance or null if not registered.
   */
```
---
#### METHOD: FilterRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterRegistry.has(name);`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if a filter name is currently registered.
   * @param {string} name Filter identifier.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: FilterRegistry.unregister
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterRegistry.unregister(name);`
- **Pure JSDoc:**
```javascript
/**
   * @description Removes a filter registration by name.
   * @param {string} name Filter identifier.
   * @returns {boolean} True if the filter was successfully removed.
   */
```
---
#### METHOD: FilterRegistry.getAllNames
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterRegistry.getAllNames();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns all registered filter identifiers.
   * @returns {string[]} Collection of registered filter names.
   */
```
---
#### METHOD: FilterRegistry.getAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterRegistry.getAll();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns all registered filter instances.
   * @returns {FilterStrategy[]} Collection of filter strategies.
   */
```
---
#### METHOD: FilterRegistry.clear
- **Scope:** instance
- **LLM Call Syntax:** `filterRegistry.clear();`
- **Pure JSDoc:**
```javascript
/**
   * @description Purges all filter registrations from the registry.
   */
```
---
#### METHOD: FilterRegistry.count
- **Scope:** instance
- **LLM Call Syntax:** `const result = filterRegistry.count();`
- **Pure JSDoc:**
```javascript
/**
   * @description Returns the current registration count.
   * @returns {number} Total number of active filters.
   */
```
---
<br>

## CLASS: MustacheMock
**File Path:** `WorkspaceTemplateEngine/src/testing/mocks.js`
**Constructor Usage:** `const instance = new MustacheMock();`
**Description:** High-fidelity mock for the Mustache engine.
Simulates core rendering logic, variable substitution, and basic filter execution for unit testing.

### Raw JSDoc Context:
```javascript
/**
 * @description High-fidelity mock for the Mustache engine.
 * Simulates core rendering logic, variable substitution, and basic filter execution for unit testing.
 * @class
 */
```

### Methods of MustacheMock

#### METHOD: MustacheMock._getValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = mustacheMock._getValue(obj, path);`
- **Pure JSDoc:**
```javascript
/**
   * @description Utility for dot-notation property resolution within mock data.
   * @param {Object} obj Source object.
   * @param {string} path Property path.
   * @returns {*} Resolved value or undefined.
   * @private
   */
```
---
<br>

## CLASS: _SheetProcessor
**File Path:** `WorkspaceTemplateEngine/src/processors/SheetProcessor.js`
**Constructor Usage:** `const instance = new _SheetProcessor(placeholderService);`
**Description:** Specialized engine for Google Sheets template expansion using batch-first strategy.
Implements cell-level substitutions and structural expansions (matrices, dynamic columns) in atomic updates.

### Raw JSDoc Context:
```javascript
/**
 * @description Specialized engine for Google Sheets template expansion using batch-first strategy.
 * Implements cell-level substitutions and structural expansions (matrices, dynamic columns) in atomic updates.
 * @class
 * @private
 */
```

### Methods of _SheetProcessor

#### METHOD: _SheetProcessor.process
- **Scope:** instance
- **LLM Call Syntax:** `const result = _SheetProcessor.process(sheetId, context, sheetName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Orchestrates the scan-and-batch processing workflow for a spreadsheet.
   * Scans sheets for `{{...}}` tokens, resolves operations (matrix vs. substitution), and executes a single batch update.
   * @param {string} sheetId Target spreadsheet identifier.
   * @param {Object} context Data context for substitution.
   * @param {string|null} sheetName Specific sheet name or null for all.
   * @returns {{layouts: Array<{sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean, item: *}>}>}} The resolved `dynamic_columns` layouts found while scanning, in encounter order.
   */
```
---
#### METHOD: _SheetProcessor._parseDynamicColumnParams
- **Scope:** instance
- **LLM Call Syntax:** `const result = _SheetProcessor._parseDynamicColumnParams(paramsStr);`
- **Pure JSDoc:**
```javascript
/**
   * @description Parses the flat `key=value,key=value` param body of a
   * `{{dynamic_columns[...]}}` placeholder into a plain object.
   * @param {string} paramsStr Raw content between the placeholder's brackets.
   * @returns {Object<string,string>} Parsed key/value map (values are trimmed strings).
   * @private
   */
```
---
#### METHOD: _SheetProcessor._bucketDynamicColumnGroups
- **Scope:** instance
- **LLM Call Syntax:** `const result = _SheetProcessor._bucketDynamicColumnGroups(params);`
- **Pure JSDoc:**
```javascript
/**
   * @description Buckets a flat dynamic_columns param map into an ordered list of
   * column groups. Group 1 (the original single-group syntax) uses unsuffixed keys
   * (`source`, `value`, `acl`, `scope`). Each subsequent group N (N >= 2) uses the
   * numbered-suffix keys `sourceN`, `valueN`, `aclN`, `scopeN`, and optionally `labelN`
   * — a context-path resolved ONCE per group (not per item) and rendered as a single
   * non-data, no-ACL separator column immediately before that group's items. This is
   * additive/backward-compatible: when no numbered keys are present, the result is a
   * single-element array equivalent to the pre-existing flat parse, so the rendering
   * loop degenerates to exactly today's single-group behavior.
   * @param {Object<string,string>} params Flat parsed params (see `_parseDynamicColumnParams`).
   * @returns {Array<{source: string|undefined, value: string|undefined, acl: string|undefined, scope: string, label: string|undefined}>} Ordered groups; empty array if no `source` key exists at all.
   * @private
   */
```
---
#### METHOD: _SheetProcessor._prepareDynamicColumnRequests
- **Scope:** instance
- **LLM Call Syntax:** `const result = _SheetProcessor._prepareDynamicColumnRequests(sheetName, startRow, startColumn, placeholder, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates batch update and protection requests for dynamic column expansion.
   * Parses `{{dynamic_columns[...]}}` syntax to expand array data horizontally with ACL protections.
   *
   * Supports N sequential column groups from a single placeholder cell, placed as
   * contiguous blocks in declared order starting at the placeholder's own position.
   * Group 1 uses the original flat keys (`source=`, `value=`, `acl=`, `scope=`).
   * Group 2+ use numbered-suffix keys (`source2=`, `value2=`, `acl2=`, `scope2=`,
   * `label2=`, `source3=`, ... ). If a group (from the 2nd onward) declares a `labelN=`
   * param, one non-data, non-ACL separator column is inserted immediately before that
   * group's items, with its text resolved ONCE against the whole context (not per item).
   * Single-group placeholders (no numbered keys) render byte-identically to the
   * pre-multi-group implementation, plus the additive `layout` field below.
   *
   * @param {string} sheetName Target sheet name.
   * @param {number} startRow Starting row index (1-based).
   * @param {number} startColumn Starting column index (1-based).
   * @param {string} placeholder Raw placeholder string.
   * @param {Object} context Data context.
   * @returns {{valueRequests: Object[], protectionRequests: Object[], layout: ({sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean, item: *}>}|null)}} Batch requests plus the resolved column layout (null when nothing was rendered).
   * @private
   */
```
---
#### METHOD: _SheetProcessor._prepareDynamicRowRequests
- **Scope:** instance
- **LLM Call Syntax:** `const result = _SheetProcessor._prepareDynamicRowRequests(sheetName, startRow, startColumn, placeholder, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates batch update requests for vertical (row-wise) array expansion.
   * Parses `{{dynamic_rows[source=...,value=...]}}` syntax — the vertical mirror of
   * `{{dynamic_columns[...]}}`: one row per source-array item, downward from the placeholder
   * cell. Single-group only (no multi-group, no acl/scope) — deliberately smaller than
   * dynamic_columns since no caller needs per-row protection or multiple sequential groups.
   * @param {string} sheetName Target sheet name.
   * @param {number} startRow Starting row index (1-based).
   * @param {number} startColumn Starting column index (1-based).
   * @param {string} placeholder Raw placeholder string.
   * @param {Object} context Data context.
   * @returns {{valueRequests: Object[]}} Batch value-update requests.
   * @private
   */
```
---
#### METHOD: _SheetProcessor._applyProtections
- **Scope:** instance
- **LLM Call Syntax:** `_SheetProcessor._applyProtections(spreadsheetId, protectionRequests);`
- **Pure JSDoc:**
```javascript
/**
   * @description Batch applies range protections after clearing existing ones with matching descriptions.
   * Ensures idempotency by deleting prior dynamic protections before applying the new set.
   * @param {string} spreadsheetId target spreadsheet.
   * @param {Object[]} protectionRequests Array of protection configurations.
   * @private
   */
```
---
#### METHOD: _SheetProcessor._prepareMatrixRequests
- **Scope:** instance
- **LLM Call Syntax:** `const result = _SheetProcessor._prepareMatrixRequests(sheetName, startRow, startColumn, placeholder, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Generates batch requests for expanding an array of objects into a table grid.
   * Parses `{{matrice_dati[...]}}` syntax to render headers and data rows.
   * @param {string} sheetName Target sheet name.
   * @param {number} startRow Top-left row index.
   * @param {number} startColumn Top-left column index.
   * @param {string} placeholder Raw placeholder.
   * @param {Object} context Data context.
   * @returns {Object[]} Collection of update requests.
   * @private
   */
```
---
#### METHOD: _SheetProcessor._expandGridIfNeeded
- **Scope:** instance
- **LLM Call Syntax:** `_SheetProcessor._expandGridIfNeeded(spreadsheetId, sheets, batchRequests);`
- **Pure JSDoc:**
```javascript
/**
   * @description Proactively expands sheet dimensions if batch requests exceed current grid limits.
   * Analyzes A1 ranges in requests to calculate the required row/column count and triggers expansion via API.
   * @param {string} spreadsheetId target spreadsheet.
   * @param {Object[]} sheets Array of sheet metadata.
   * @param {Object[]} batchRequests Collection of planned updates.
   * @private
   */
```
---
#### METHOD: _SheetProcessor._columnToLetter
- **Scope:** instance
- **LLM Call Syntax:** `const result = _SheetProcessor._columnToLetter(column);`
- **Pure JSDoc:**
```javascript
/**
   * @description Converts a 1-based column number to its alphabetical A1 notation (e.g., 27 -> "AA").
   * @param {number} column Column index.
   * @returns {string} Alphabetical column label.
   * @private
   */
```
---
#### METHOD: _SheetProcessor._rangeToA1
- **Scope:** instance
- **LLM Call Syntax:** `const result = _SheetProcessor._rangeToA1(startRow, startColumn, endRow, endColumn);`
- **Pure JSDoc:**
```javascript
/**
   * @description Formats row/column coordinates into standard A1 or range notation.
   * @param {number} startRow Starting row.
   * @param {number} startColumn Starting column.
   * @param {number} endRow Ending row.
   * @param {number} endColumn Ending column.
   * @returns {string} Range string (e.g., "A1" or "A1:B10").
   * @private
   */
```
---
<br>

## CLASS: UppercaseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new UppercaseFilter();`
**Description:** String transformer. Converts all characters to uppercase.

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Converts all characters to uppercase.
 * @class
 */
```

<br>

## CLASS: LowercaseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new LowercaseFilter();`
**Description:** String transformer. Converts all characters to lowercase.

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Converts all characters to lowercase.
 * @class
 */
```

<br>

## CLASS: CapitalizeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new CapitalizeFilter();`
**Description:** String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.
 * @class
 */
```

<br>

## CLASS: DateFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new DateFilter();`
**Description:** Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.

### Raw JSDoc Context:
```javascript
/**
 * @description Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.
 * @class
 */
```

### Methods of DateFilter

#### METHOD: DateFilter._formatDDMMYYYY
- **Scope:** static
- **LLM Call Syntax:** `const result = DateFilter._formatDDMMYYYY(date);`
- **Pure JSDoc:**
```javascript
/**
   * @description Formats a Date as dd/MM/yyyy using only arithmetic (no locale).
   * @param {Date} date Valid Date instance.
   * @returns {string} Zero-padded dd/MM/yyyy string.
   * @private
   */
```
---
<br>

## CLASS: NumberFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new NumberFilter();`
**Description:** Number formatter. Applies locale-specific formatting with optional fixed decimals.

### Raw JSDoc Context:
```javascript
/**
 * @description Number formatter. Applies locale-specific formatting with optional fixed decimals.
 * @class
 */
```

<br>

## CLASS: JoinFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new JoinFilter();`
**Description:** Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.
 * @class
 */
```

### Methods of JoinFilter

#### METHOD: JoinFilter._isDangerousKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = joinFilter._isDangerousKey(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Security guard against prototype pollution.
   * @param {string} key Property key.
   * @returns {boolean} True if restricted.
   * @private
   */
```
---
<br>

## CLASS: PluralizeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new PluralizeFilter();`
**Description:** Conditional string selector. Returns singular or plural form based on a numeric count.

### Raw JSDoc Context:
```javascript
/**
 * @description Conditional string selector. Returns singular or plural form based on a numeric count.
 * @class
 */
```

<br>

## CLASS: SortByFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new SortByFilter();`
**Description:** Array sorter. Performs in-place sorting based on a specific property key. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array sorter. Performs in-place sorting based on a specific property key. Includes prototype pollution protection.
 * @class
 */
```

<br>

## CLASS: WhereFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new WhereFilter();`
**Description:** Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.
 * @class
 */
```

<br>

## CLASS: ExcludeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new ExcludeFilter();`
**Description:** Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.
 * @class
 */
```

<br>

## CLASS: DefaultFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new DefaultFilter();`
**Description:** Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.

### Raw JSDoc Context:
```javascript
/**
 * @description Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.
 * @class
 */
```

<br>

## CLASS: YesNoFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new YesNoFilter();`
**Description:** Boolean-to-string transformer. Format: "YesString,NoString".

### Raw JSDoc Context:
```javascript
/**
 * @description Boolean-to-string transformer. Format: "YesString,NoString".
 * @class
 */
```

<br>

## CLASS: FallbackFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new FallbackFilter();`
**Description:** Simple fallback mechanism. Returns fallbackValue if value is missing.

### Raw JSDoc Context:
```javascript
/**
 * @description Simple fallback mechanism. Returns fallbackValue if value is missing.
 * @class
 */
```

<br>

## CLASS: TruncateFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new TruncateFilter();`
**Description:** String truncator with optional suffix. Defaults to 50 chars and "...".

### Raw JSDoc Context:
```javascript
/**
 * @description String truncator with optional suffix. Defaults to 50 chars and "...".
 * @class
 */
```

<br>

## CLASS: SplitFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new SplitFilter();`
**Description:** String-to-array splitter using a specified separator (default: ",").

### Raw JSDoc Context:
```javascript
/**
 * @description String-to-array splitter using a specified separator (default: ",").
 * @class
 */
```

<br>

## CLASS: ReplaceFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new ReplaceFilter();`
**Description:** Global string replacer. Replaces all occurrences of searchValue with replaceValue.

### Raw JSDoc Context:
```javascript
/**
 * @description Global string replacer. Replaces all occurrences of searchValue with replaceValue.
 * @class
 */
```

<br>

## CLASS: UrlEncodeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new UrlEncodeFilter();`
**Description:** URI component encoder for URL-safe string generation.

### Raw JSDoc Context:
```javascript
/**
 * @description URI component encoder for URL-safe string generation.
 * @class
 */
```

<br>

## CLASS: MapFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new MapFilter();`
**Description:** Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.
 * @class
 */
```

<br>

## CLASS: LimitFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new LimitFilter();`
**Description:** Array slicer. Returns the first N items (default: 10).

### Raw JSDoc Context:
```javascript
/**
 * @description Array slicer. Returns the first N items (default: 10).
 * @class
 */
```

<br>

## CLASS: SkipFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new SkipFilter();`
**Description:** Array offsetter. Skips the first N items.

### Raw JSDoc Context:
```javascript
/**
 * @description Array offsetter. Skips the first N items.
 * @class
 */
```

<br>

## CLASS: SortFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new SortFilter();`
**Description:** Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.
 * @class
 */
```

<br>

## CLASS: ReverseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new ReverseFilter();`
**Description:** Array order reverser. Creates a shallow copy before reversing.

### Raw JSDoc Context:
```javascript
/**
 * @description Array order reverser. Creates a shallow copy before reversing.
 * @class
 */
```

<br>

## CLASS: PlusFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new PlusFilter();`
**Description:** Numeric addition filter. Adds addend to the value.

### Raw JSDoc Context:
```javascript
/**
 * @description Numeric addition filter. Adds addend to the value.
 * @class
 */
```

<br>

## CLASS: MinusFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new MinusFilter();`
**Description:** Numeric subtraction filter. Subtracts subtrahend from the value.

### Raw JSDoc Context:
```javascript
/**
 * @description Numeric subtraction filter. Subtracts subtrahend from the value.
 * @class
 */
```

<br>

## CLASS: JsonFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new JsonFilter();`
**Description:** JSON serializer with optional indentation support.

### Raw JSDoc Context:
```javascript
/**
 * @description JSON serializer with optional indentation support.
 * @class
 */
```

<br>

## CLASS: MustacheRenderError
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new MustacheRenderError();`
**Description:** Thrown when template rendering exceeds the maximum nesting depth or
detects a self-referencing partial cycle — surfaces a catchable, diagnosable error
instead of an opaque call-stack overflow when a data-driven CONF_DOC/CONF_MAIL
template is malformed (ref analysis_3_structural_errors.md Finding 3).

### Raw JSDoc Context:
```javascript
/**
 * @class MustacheRenderError
 * @extends BaseError
 * @description Thrown when template rendering exceeds the maximum nesting depth or
 * detects a self-referencing partial cycle — surfaces a catchable, diagnosable error
 * instead of an opaque call-stack overflow when a data-driven CONF_DOC/CONF_MAIL
 * template is malformed (ref analysis_3_structural_errors.md Finding 3).
 */
```

<br>

## CLASS: _MustacheScanner
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new _MustacheScanner();`
**Description:** State-tracking scanner for incremental Mustache template parsing.

### Raw JSDoc Context:
```javascript
/**
 * @description State-tracking scanner for incremental Mustache template parsing.
 * @private
 * @class
 */
```

### Methods of _MustacheScanner

#### METHOD: _MustacheScanner.eos
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheScanner.eos();`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if the scanner has reached the end of the input string.
   * @returns {boolean} True if no characters remain in the tail.
   */
```
---
#### METHOD: _MustacheScanner.scan
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheScanner.scan(re);`
- **Pure JSDoc:**
```javascript
/**
   * @description Attempts to match a regular expression at the current position.
   * @param {RegExp} re Regular expression anchored to the start of the tail.
   * @returns {string} The matched string fragment or an empty string if no match.
   */
```
---
#### METHOD: _MustacheScanner.scanUntil
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheScanner.scanUntil(re);`
- **Pure JSDoc:**
```javascript
/**
   * @description Consumes characters from the tail until the specified pattern is encountered.
   * @param {RegExp} re Regular expression pattern to search for.
   * @returns {string} The captured string content preceding the match.
   */
```
---
<br>

## CLASS: _MustacheContext
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new _MustacheContext();`
**Description:** Hierarchical context stack for Mustache variable resolution.
Supports parent context navigation ('../') and dot-notation property access.

### Raw JSDoc Context:
```javascript
/**
 * @description Hierarchical context stack for Mustache variable resolution.
 * Supports parent context navigation ('../') and dot-notation property access.
 * @private
 * @class
 */
```

### Methods of _MustacheContext

#### METHOD: _MustacheContext.push
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheContext.push(view);`
- **Pure JSDoc:**
```javascript
/**
   * @description Creates a child context by pushing a new data view onto the stack.
   * @param {*} view The data object or primitive for the new context level.
   * @returns {_MustacheContext} A new context instance linked to the current one as parent.
   */
```
---
#### METHOD: _MustacheContext.lookup
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheContext.lookup(name);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves a value by key name across the current and parent contexts.
   * Supports Handlebars-style '../' navigation and deep property paths.
   * @param {string} name Identifier or path (e.g., 'user.name', '../title').
   * @returns {*} Resolved value or undefined.
   */
```
---
#### METHOD: _MustacheContext._isDangerousKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheContext._isDangerousKey(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Security guard against prototype pollution during context lookups.
   * @param {string} key Property key to validate.
   * @returns {boolean} True if the key is restricted ('__proto__', 'constructor', 'prototype').
   * @private
   */
```
---
<br>

## CLASS: _FunctionFilterStrategy
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new _FunctionFilterStrategy();`
**Description:** Adapter for converting standard functions into FilterStrategy instances.
Enables backward compatibility with functional filter registrations.

### Raw JSDoc Context:
```javascript
/**
 * @description Adapter for converting standard functions into FilterStrategy instances.
 * Enables backward compatibility with functional filter registrations.
 * @private
 * @class
 */
```

<br>

## CLASS: MyMustache
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new MyMustache(options, options.logger, options.utils, options.partials, options.tags);`
**Description:** Advanced Mustache engine with Handlebars meta-variables (@index, @first) and Liquid-style filters.
Implements template caching, prototype pollution protection, and Strategy-based filter registry.

### Raw JSDoc Context:
```javascript
/**
 * @description Advanced Mustache engine with Handlebars meta-variables (@index, @first) and Liquid-style filters.
 * Implements template caching, prototype pollution protection, and Strategy-based filter registry.
 * @class
 * @version 2.1.0
 * @example
 * const mustache = new MyMustache({ logger: console });
 * const result = mustache.render('{{items | join:", "}}', { items: [1, 2, 3] });
 */
```

### Methods of MyMustache

#### METHOD: MyMustache.isNullOrUndefined
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.isNullOrUndefined(value);`
- **Pure JSDoc:**
```javascript
/**
   * @description Strict null/undefined check for template value resolution.
   * @param {*} value Value to evaluate.
   * @returns {boolean} True if value is null or undefined.
   * @static
   */
```
---
#### METHOD: MyMustache._isDangerousKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._isDangerousKey(key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Security guard against prototype pollution during context lookups.
   * @param {string} key Property key to validate.
   * @returns {boolean} True if the key is restricted ('__proto__', 'constructor', 'prototype').
   * @private
   */
```
---
#### METHOD: MyMustache.getValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache.getValue(key, data);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves a deep property value using dot-notation, with prototype pollution protection.
   * @param {string} key Dot-separated property path (e.g., 'user.profile.name').
   * @param {Object} data Source object for resolution.
   * @returns {*} Resolved value or undefined if path is invalid or blocked.
   */
```
---
#### METHOD: MyMustache._initBuiltInFilters
- **Scope:** instance
- **LLM Call Syntax:** `myMustache._initBuiltInFilters();`
- **Pure JSDoc:**
```javascript
/**
   * @description Internal bootstrap for loading built-in and advanced filter strategies.
   * @private
   */
```
---
#### METHOD: MyMustache.clearCache
- **Scope:** instance
- **LLM Call Syntax:** `myMustache.clearCache();`
- **Pure JSDoc:**
```javascript
/**
   * @description Purges the internal template cache to reclaim memory.
   */
```
---
#### METHOD: MyMustache.addPartial
- **Scope:** instance
- **LLM Call Syntax:** `myMustache.addPartial(name, template);`
- **Pure JSDoc:**
```javascript
/**
   * @description Registers a named partial template for global inclusion.
   * @param {string} name Unique partial identifier.
   * @param {string} template Partial template string.
   */
```
---
#### METHOD: MyMustache.addPartials
- **Scope:** instance
- **LLM Call Syntax:** `myMustache.addPartials(partialsObject);`
- **Pure JSDoc:**
```javascript
/**
   * @description Batch registers multiple partial templates.
   * @param {Object.<string, string>} partialsObject Map of names to template strings.
   */
```
---
#### METHOD: MyMustache.registerFilter
- **Scope:** instance
- **LLM Call Syntax:** `myMustache.registerFilter(filterStrategyOrName, fn);`
- **Pure JSDoc:**
```javascript
/**
   * @description Registers a custom filter strategy.
   * @param {FilterStrategy|string} filterStrategyOrName FilterStrategy instance or name for backward compatibility.
   * @param {Function} [fn] Filter function (v1.x compatibility).
   * @throws {Error} If registration fails or invalid types provided.
   */
```
---
#### METHOD: MyMustache.compile
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache.compile(template);`
- **Pure JSDoc:**
```javascript
/**
   * @description Compiles a template into a reusable execution function.
   * @param {string} template Mustache template string.
   * @returns {function(Object): string} Renderer function bound to this engine instance.
   */
```
---
#### METHOD: MyMustache.render
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache.render(template, data, additionalPartials);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes template rendering with data substitution and partial resolution.
   * @param {string} template Mustache template string.
   * @param {Object} [data={}] View model data.
   * @param {Object} [additionalPartials={}] Render-specific partial overrides.
   * @returns {string} Rendered output or error diagnostic string.
   * @throws {TypeError} If input arguments are invalid.
   */
```
---
#### METHOD: MyMustache._escapeRegExp
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._escapeRegExp(string);`
- **Pure JSDoc:**
```javascript
/**
   * @description Escapes characters for use in a literal regular expression.
   * @param {string} string Input string.
   * @returns {string} Regex-safe escaped string.
   * @private
   */
```
---
#### METHOD: MyMustache._escapeHtml
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._escapeHtml(string);`
- **Pure JSDoc:**
```javascript
/**
   * @description Robust HTML entity encoding for XSS prevention.
   * Encodes &, <, >, ", ', `, and = while preserving Unicode/international characters.
   * @param {string} string Raw input string.
   * @returns {string} HTML-encoded safe string.
   * @private
   */
```
---
#### METHOD: MyMustache._parse
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._parse(template, tags);`
- **Pure JSDoc:**
```javascript
/**
   * @description Orchestrates template parsing with delimiter-aware caching.
   * @param {string} template Raw template string.
   * @param {string[]} [tags] Custom delimiters.
   * @returns {Array[]} Parsed token hierarchy.
   * @private
   */
```
---
#### METHOD: MyMustache._renderTokens
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._renderTokens(tokens, context, partials, originalTemplate, state);`
- **Pure JSDoc:**
```javascript
/**
   * @description Recursively renders a token collection into a final string.
   * @param {Array[]} tokens Array of parsed tokens.
   * @param {MustacheContext} context Data resolution context.
   * @param {Object} partials Map of partial templates.
   * @param {string} originalTemplate Source template for section extraction.
   * @param {Object} state Internal recursion-tracking state ({depth, partialStack}).
   * @returns {string} Partial rendered output.
   * @private
   */
```
---
#### METHOD: MyMustache._lookupValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._lookupValue(token, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Parses filter pipe syntax and executes the transformation chain.
   * @param {Array} token Target token containing key and filter string.
   * @param {MustacheContext} context Current data context.
   * @returns {*} Final resolved and transformed value.
   * @private
   */
```
---
#### METHOD: MyMustache._escapedValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._escapedValue(token, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Renders a value with default string conversion.
   * @param {Array} token Value token.
   * @param {MustacheContext} context Data context.
   * @returns {string|undefined} Stringified value.
   * @private
   */
```
---
#### METHOD: MyMustache._unescapedValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._unescapedValue(token, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Renders a raw value without escaping.
   * @param {Array} token Value token.
   * @param {MustacheContext} context Data context.
   * @returns {string|undefined} Stringified raw value.
   * @private
   */
```
---
#### METHOD: MyMustache._createLoopContext
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._createLoopContext(item, index, total, key);`
- **Pure JSDoc:**
```javascript
/**
   * @description Decorates iteration items with Handlebars-style meta-variables (@index, @first, etc.).
   * @param {*} item Array element.
   * @param {number} index Current zero-based index.
   * @param {number} total Total element count.
   * @param {string} [key] Optional map key.
   * @returns {Object|*} Decorated item or original if primitive.
   * @private
   */
```
---
#### METHOD: MyMustache._renderSection
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._renderSection(token, context, partials, originalTemplate, state);`
- **Pure JSDoc:**
```javascript
/**
   * @description Renders a conditional or iterative section with meta-variable support.
   * @param {Array} token Section token hierarchy.
   * @param {MustacheContext} context Parent context.
   * @param {Object} partials Map of partial templates.
   * @param {string} originalTemplate Source template.
   * @param {Object} state Internal recursion-tracking state ({depth, partialStack}).
   * @returns {string|undefined} Rendered section content.
   * @private
   */
```
---
#### METHOD: MyMustache._renderInverted
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._renderInverted(token, context, partials, originalTemplate, state);`
- **Pure JSDoc:**
```javascript
/**
   * @description Renders content if a key is falsy or an empty array.
   * @param {Array} token Inverted section token.
   * @param {MustacheContext} context Current context.
   * @param {Object} partials Partial definitions.
   * @param {string} originalTemplate Source template.
   * @param {Object} state Internal recursion-tracking state ({depth, partialStack}).
   * @returns {string|undefined} Rendered content.
   * @private
   */
```
---
#### METHOD: MyMustache._renderPartial
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._renderPartial(token, context, partials, state);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves and renders a partial template inclusion.
   * @param {Array} token Partial token.
   * @param {MustacheContext} context Current context.
   * @param {Object|function} partials Partial source.
   * @param {Object} state Internal recursion-tracking state ({depth, partialStack}).
   * @returns {string|undefined} Rendered partial output.
   * @private
   */
```
---
#### METHOD: MyMustache._squashTokens
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._squashTokens(tokens);`
- **Pure JSDoc:**
```javascript
/**
   * @description Optimizes token stream by merging adjacent text fragments.
   * @param {Array[]} tokens Raw token sequence.
   * @returns {Array[]} Optimized token sequence.
   * @private
   */
```
---
#### METHOD: MyMustache._nestTokens
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._nestTokens(tokens);`
- **Pure JSDoc:**
```javascript
/**
   * @description Transforms flat token stream into a nested section hierarchy.
   * @param {Array[]} tokens Linear token sequence.
   * @returns {Array[]} Hierarchical token tree.
   * @private
   */
```
---
#### METHOD: MyMustache._parseTemplate
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache._parseTemplate(template, tags);`
- **Pure JSDoc:**
```javascript
/**
   * @description Lexical analyzer that converts a template string into tokens.
   * @param {string} template Raw template.
   * @param {string[]} tags Delimiters.
   * @returns {Array[]} Token tree.
   * @throws {Error} On unclosed tags or sections.
   * @private
   */
```
---
<br>

## GLOBAL FUNCTIONS

### FUNCTION: createBuiltInFilters
- **Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
- **LLM Call Syntax:** `const result = createBuiltInFilters(utils);`
- **Pure JSDoc:**
```javascript
/**
 * @description Factory function that instantiates and returns all core built-in filter strategies.
 * @param {UtilsService} [utils] Optional utility service for date formatting.
 * @returns {FilterStrategy[]} Collection of core filter instances.
 */
```

---
### FUNCTION: createAdvancedFilters
- **Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
- **LLM Call Syntax:** `const result = createAdvancedFilters();`
- **Pure JSDoc:**
```javascript
/**
 * @description Factory function that instantiates and returns all advanced filter strategies.
 * @returns {FilterStrategy[]} Collection of advanced filter instances.
 */
```

---
