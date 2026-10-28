# API Reference: WorkspaceTemplateEngine

## CLASS: PlaceholderService
**File Path:** `WorkspaceTemplateEngine/src/PlaceholderService.ts`
**Constructor Usage:** `const instance = new PlaceholderService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of PlaceholderService

#### PROPERTY: PlaceholderService.di
- **Scope:** static
- **LLM Call Syntax:** `const result = PlaceholderService.di;`
- **Pure JSDoc:**
```javascript
/**
   * @description Dependency injection manifest for PlaceholderService.
   * @returns {Object} DI configuration object.
   * @static
   */
```
---
#### METHOD: PlaceholderService.processString
- **Scope:** instance
- **LLM Call Syntax:** `const result = placeholderService.processString(template, context);`
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
#### METHOD: PlaceholderService.resolve
- **Scope:** instance
- **LLM Call Syntax:** `const result = placeholderService.resolve(template, context);`
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
#### METHOD: PlaceholderService.processDocument
- **Scope:** instance
- **LLM Call Syntax:** `const result = placeholderService.processDocument(documentId, context);`
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
#### METHOD: PlaceholderService.processSheet
- **Scope:** instance
- **LLM Call Syntax:** `const result = placeholderService.processSheet(sheetId, context, sheetName);`
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
**File Path:** `WorkspaceTemplateEngine/src/FilterStrategy.ts`
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

### Methods and properties of FilterStrategy

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
**File Path:** `WorkspaceTemplateEngine/src/FilterStrategy.ts`
**Constructor Usage:** `const instance = new FilterRegistry();`
**Description:** Centralized registry for managing and resolving FilterStrategy instances.

### Raw JSDoc Context:
```javascript
/**
 * @description Centralized registry for managing and resolving FilterStrategy instances.
 * @class
 */
```

### Methods and properties of FilterRegistry

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
<br>

## CLASS: MustacheMock
**File Path:** `WorkspaceTemplateEngine/src/testing/mocks.ts`
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

### Methods and properties of MustacheMock

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
**File Path:** `WorkspaceTemplateEngine/src/processors/SheetProcessor.ts`
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

### Methods and properties of _SheetProcessor

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

## CLASS: _DocumentProcessor
**File Path:** `WorkspaceTemplateEngine/src/processors/DocumentProcessor.ts`
**Constructor Usage:** `const instance = new _DocumentProcessor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of _DocumentProcessor

#### METHOD: _DocumentProcessor._computeFalsyConditionalRanges
- **Scope:** instance
- **LLM Call Syntax:** `const result = _DocumentProcessor._computeFalsyConditionalRanges(currentStructure, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Computes the `[index, index+length)` ranges of every
   * `{{#expr}}`/`{{^expr}}` conditional section that will be discarded
   * WHOLESALE (`kind: 'section'` ops only — never `kind: 'marker'`, which
   * only removes the two marker paragraphs and keeps its content live). Any
   * of the other 4 structural directives (`tablerow_loop`/`tablecol_loop`/
   * `bullet_list`/`number_list`/`{{table[...]}}`) whose marker falls inside
   * one of these ranges must never be analyzed or natively executed — the
   * whole span, including that directive's own data resolution, is about to
   * be deleted anyway, so running it first would be wasted work at best (a
   * spurious "not a valid array" warning at worst) for a data source the
   * template author expects to be legitimately absent while the guard is
   * false. Deliberately recomputed against whatever `structure` is CURRENT
   * at each call site (mirroring the existing deleteRow
   * "recompute against latest structure" pattern below) since an earlier
   * native mutation elsewhere in the document shifts character offsets that
   * a stale computation would get wrong.
   * @param {Object} currentStructure `{tables, textMatches}` snapshot to scan.
   * @param {Object} context Data context.
   * @returns {Array<[number, number]>} Half-open `[start, end)` ranges.
   * @private
   */
```
---
#### METHOD: _DocumentProcessor._isInsideAnyRange
- **Scope:** instance
- **LLM Call Syntax:** `const result = _DocumentProcessor._isInsideAnyRange(ranges, index);`
- **Pure JSDoc:**
```javascript
/**
   * @description True if `index` falls inside any of `ranges`.
   * @param {Array<[number, number]>} ranges Half-open `[start, end)` ranges.
   * @param {number} index Character offset to test.
   * @returns {boolean}
   * @private
   */
```
---
#### METHOD: _DocumentProcessor.process
- **Scope:** instance
- **LLM Call Syntax:** `_DocumentProcessor.process();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DocumentProcessorValueResolver
**File Path:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorValueResolver.ts`
**Constructor Usage:** `const instance = new DocumentProcessorValueResolver();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DocumentProcessorValueResolver

#### METHOD: DocumentProcessorValueResolver._applyFilters
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorValueResolver._applyFilters();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorValueResolver._sortByProperty
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorValueResolver._sortByProperty();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorValueResolver._getNestedProperty
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorValueResolver._getNestedProperty();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DocumentProcessorTagScanner
**File Path:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorTagScanner.ts`
**Constructor Usage:** `const instance = new DocumentProcessorTagScanner();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DocumentProcessorTagScanner

#### METHOD: DocumentProcessorTagScanner._analyzeColumnLoops
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner._analyzeColumnLoops();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorTagScanner._analyzeRowLoops
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner._analyzeRowLoops();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorTagScanner._analyzeListLoops
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner._analyzeListLoops();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorTagScanner._analyzeConditionalSections
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorTagScanner._analyzeConditionalSections(textMatches, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Scans paragraph-level text matches for the generic
   * `{{#expr}}...{{/expr}}` / `{{^expr}}...{{/expr}}` conditional-section
   * directive and builds a nesting-aware tree of matched open/close marker
   * pairs (a paragraph whose entire, whitespace-trimmed text is exactly an
   * opening marker is paired with the next matching `{{/expr}}` closing
   * marker at the SAME nesting depth; any pair fully between them becomes a
   * child of that pair, not a sibling). Reserved directive names
   * (`tablerow_loop:`/`tablecol_loop:`/`bullet_list:`/`number_list:`) are
   * left untouched here — they are handled by their own dedicated
   * `_analyze*` methods.
   * @param {Array<Object>} textMatches Scanned text runs (`scanDocumentStructure().textMatches`).
   * @param {Object} context Data context.
   * @returns {Array<{type: 'conditionalDelete', index: number, length: number, kind: 'section'|'marker'}>}
   *   One `deleteContentRange`-shaped op per removed span, in document order,
   *   produced by resolving the tree top-down via `_resolveConditionalSectionNode`
   *   (see there for the false-vs-true/overlap-avoidance rules).
   */
```
---
#### METHOD: DocumentProcessorTagScanner._resolveConditionalSectionNode
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorTagScanner._resolveConditionalSectionNode(node, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Resolves one matched `{{#expr}}`/`{{^expr}}` node (and,
   * recursively, its nested children) against `context` with standard
   * Mustache truthiness (falsy/`null`/empty array => section false), exactly
   * like `_renderSection`/`_renderInverted` in the Mustache facade.
   *
   * The false/discarded branch NEVER recurses into `node.children`: the one
   * `kind: 'section'` op it emits already spans
   * `[node.openIndex, node.closeIndex! + node.closeLength!)`, which fully
   * contains any nested conditional's own range — recursing would emit a
   * second, overlapping `deleteContentRange` request for a sub-span already
   * covered by this one, breaking the "Reverse-Order Strategy"'s
   * non-overlapping-ranges invariant (deleting the inner, higher-index range
   * first would shift/invalidate the outer op's stale `endIndex`). The
   * true/kept branch only removes its own two marker paragraphs
   * (`kind: 'marker'`, each a single disjoint paragraph span that can never
   * overlap a nested op), so it's safe — and necessary, since the reserved-4
   * directives gate in `DocumentProcessor.process()` only skip content inside
   * a `kind: 'section'` range — to resolve nested children independently.
   * @param {{symbol: '#'|'^', expr: string, openIndex: number, openLength: number, closeIndex: number, closeLength: number, children: Array<Object>}} node
   * @param {Object} context Data context.
   * @returns {Array<{type: 'conditionalDelete', index: number, length: number, kind: 'section'|'marker'}>}
   * @private
   */
```
---
#### METHOD: DocumentProcessorTagScanner._analyzeTextSubstitutions
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner._analyzeTextSubstitutions();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorTagScanner._analyzeTableInsertions
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorTagScanner._analyzeTableInsertions(textMatches, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Scans text runs for `{{table[source=<contextPath>, headerRow=<bool>]}}`
   * directives (ref REPORT_GLF.md B7) — the Docs-side analogue of the Sheets
   * `{{dynamic_columns[...]}}` directive: expands a data-driven table in place
   * at the marker's position. `source` must resolve to a non-empty 2D array
   * (`Array<Array<*>>`) already shaped as table rows/cells — unlike
   * `dynamic_columns`, which resolves a flat array item-by-item, a Docs table
   * has no per-cell Mustache expression of its own; the caller pre-shapes the
   * grid (e.g. via a Sheet read) before placing it on the context.
   * @param {Array<Object>} textMatches Scanned text runs (`scanDocumentStructure().textMatches`).
   * @param {Object} context Data context.
   * @returns {Array<{type: 'tableInsert', placeholder: string, data: Array<Array<*>>, options: Object}>} Resolved table-insert operations, in encounter order.
   */
```
---
#### METHOD: DocumentProcessorTagScanner._parseTableParams
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorTagScanner._parseTableParams(paramsStr);`
- **Pure JSDoc:**
```javascript
/**
   * @description Parses the flat `key=value,key=value` param body of a
   * `{{table[...]}}` directive into a plain object.
   * @param {string} paramsStr Raw content between the placeholder's brackets.
   * @returns {Object<string,string>} Parsed key/value map (values are trimmed strings).
   * @private
   */
```
---
#### METHOD: DocumentProcessorTagScanner._parseExpression
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner._parseExpression();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorTagScanner._parseFilterArgs
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner._parseFilterArgs();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorTagScanner._parseArgValue
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner._parseArgValue();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DocumentProcessorInjector
**File Path:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorInjector.ts`
**Constructor Usage:** `const instance = new DocumentProcessorInjector();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DocumentProcessorInjector

#### METHOD: DocumentProcessorInjector._buildStyledSegments
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorInjector._buildStyledSegments(template, data, sourceRuns);`
- **Pure JSDoc:**
```javascript
/**
   * @description Renders a cell/paragraph template into styled segments, using
   * MyMustache.renderSegments() to map each rendered span back to the original
   * template offset, then looking up which captured source run (if any)
   * overlapped that offset to carry its style forward. Shared by row-loop,
   * column-loop, and list-loop retext paths (Tasks 5/6/8); text substitution
   * (Task 7) uses the same _styleAt lookup directly against Advanced-API
   * updateTextStyle requests instead of native setAttributes.
   * @param {string} template Cell/paragraph template string (may contain no `{{`).
   * @param {Object} data Data item to render against.
   * @param {Array<{start:number, end:number, style:Object}>} [sourceRuns=[]] Captured source runs, template-relative offsets.
   * @returns {Array<{rendered: string, style: Object}>}
   * @private
   */
```
---
#### METHOD: DocumentProcessorInjector._styleAt
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorInjector._styleAt(offset, sourceRuns);`
- **Pure JSDoc:**
```javascript
/**
   * @description Finds the captured source run whose [start,end) span contains
   * `offset` and returns its style, or {} if none overlaps.
   * @param {number} offset Template-relative character offset.
   * @param {Array<{start:number, end:number, style:Object}>} sourceRuns Captured source runs.
   * @returns {Object} Advanced-API TextStyle POJO (possibly empty).
   * @private
   */
```
---
#### METHOD: DocumentProcessorInjector._rebaseSourceRuns
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorInjector._rebaseSourceRuns(runs, shift);`
- **Pure JSDoc:**
```javascript
/**
   * @description Rebases a set of captured source runs onto a new coordinate
   * origin, dropping/truncating any run that falls entirely before the shift
   * point. Used to correct `sourceRuns` (captured relative to a raw,
   * marker-included cell/paragraph text) so they line up with a
   * marker-stripped (and possibly further trimmed) template string before
   * being handed to `_buildStyledSegments`/`_styleAt` — otherwise offsets
   * captured against the raw text would be compared against the shorter
   * stripped template and misattribute styles. Same technique as the
   * list-loop `sourceRuns` rebase (filter overlap, subtract shift, clamp).
   * @param {Array<{start:number, end:number, style:Object}>} runs Source runs, relative to the pre-shift text.
   * @param {number} shift Number of leading characters removed between the pre-shift text and the target template.
   * @returns {Array<{start:number, end:number, style:Object}>} Runs re-based to the target template's own offsets.
   * @private
   */
```
---
#### METHOD: DocumentProcessorInjector._executeRowLoopOperation
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._executeRowLoopOperation();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorInjector._executeColumnLoopOperation
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._executeColumnLoopOperation();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorInjector._convertOperationToRequests
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._convertOperationToRequests();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorInjector._createTextSubstitutionRequests
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._createTextSubstitutionRequests();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorInjector._createDeleteRangeRequests
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorInjector._createDeleteRangeRequests(op);`
- **Pure JSDoc:**
```javascript
/**
   * @description Builds a single `deleteContentRange` request spanning
   * `[op.index, op.index + op.length)`, deleting that span in full — including
   * any paragraph-terminating `\n` characters inside it, which is what
   * physically removes paragraph structure rather than just clearing text.
   * Shared paragraph-splice primitive for the generic `{{#expr}}`/`{{^expr}}`
   * conditional-section directive (see `_analyzeConditionalSections`):
   * `op.length` is either the marker paragraph's own raw length (marker-only
   * removal, content kept) or the full open-marker-to-close-marker span
   * (whole-block removal, content discarded).
   * @param {{index: number, length: number}} op Conditional-delete operation.
   * @returns {Array<Object>} Single-element `deleteContentRange` request array.
   */
```
---
#### METHOD: DocumentProcessorInjector._createDeleteRowRequests
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._createDeleteRowRequests();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DocumentProcessorInjector._executeListLoopOperation
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._executeListLoopOperation(documentId, op);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes a bullet_list/number_list expansion natively: locates
   * the template paragraph via body.findText() (same traversal technique
   * DocumentTableManager.insertTableAtMarker already uses), copies it once per
   * data item via native Paragraph.copy() — which preserves the original's
   * bullet/number-list membership and nesting level with no preset-guessing —
   * retexts each copy with the rendered item (preserving captured run styles),
   * then removes the template paragraph. Reverse iteration at the same fixed
   * insertion position mirrors the row-loop/column-loop "Reverse-Order
   * Strategy" already established for this pipeline.
   * @param {string} documentId Target document identifier.
   * @param {Object} op {paragraphIndex, listType, dataArray, itemTemplate, fullMatch, sourceRuns}.
   */
```
---
#### METHOD: DocumentProcessorInjector._escapeForFindText
- **Scope:** instance
- **LLM Call Syntax:** `const result = documentProcessorInjector._escapeForFindText(text);`
- **Pure JSDoc:**
```javascript
/**
   * @description Escapes JS regex metacharacters in `text` so it is safe to pass
   * to Google Docs' `Body.findText()`, which treats its argument as a regular
   * expression. `op.fullMatch` (the caller of this helper) is the entire raw
   * `{{#bullet_list:...}}...{{/bullet_list}}` block INCLUDING arbitrary
   * end-user-authored prose between the markers (and the markers' own `{`/`}`
   * are themselves regex metacharacters) — real template content can plausibly
   * contain parentheses, brackets, or `+`/`*`/`?` that would otherwise throw a
   * regex SyntaxError from findText and crash processing of an
   * otherwise-valid template.
   * @param {string} text Literal text to search for.
   * @returns {string} Regex-escaped text, safe to pass to `findText()`.
   * @private
   */
```
---
#### METHOD: DocumentProcessorInjector._retextParagraph
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._retextParagraph(paragraph, segments);`
- **Pure JSDoc:**
```javascript
/**
   * @description Clears a paragraph's content and appends a sequence of styled
   * segments, re-applying each segment's captured style natively. Shared retext
   * primitive for the list-loop path (table cells use
   * DocumentService.setCellRunStyles instead, since they're a different native
   * element type).
   * @param {Paragraph} paragraph Native DocumentApp Paragraph element.
   * @param {Array<{rendered: string, style: Object}>} segments Ordered text+style segments.
   * @private
   */
```
---
#### METHOD: DocumentProcessorInjector._executeTableInsertOperation
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._executeTableInsertOperation(documentId, op);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes a `{{table[source=...]}}` directive (ref REPORT_GLF.md
   * B7): inserts the resolved 2D array as a table immediately after the
   * marker's containing element (native DocumentApp API, via
   * `DocumentTableManager.insertTableAtMarker`), then removes the marker text
   * itself via the Advanced Docs API (`batchReplaceText`) — mirroring the
   * find-placeholder/remove-text split ALDO's own `DocumentTableFacade`
   * workaround used, now inside the library.
   * @param {string} documentId Target document identifier.
   * @param {{placeholder: string, data: Array<Array<*>>, options: Object}} op Table-insert operation.
   */
```
---
#### METHOD: DocumentProcessorInjector._flushDocumentChanges
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorInjector._flushDocumentChanges();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: UppercaseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new UppercaseFilter();`
**Description:** String transformer. Converts all characters to uppercase.

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Converts all characters to uppercase.
 * @class
 */
```

### Methods and properties of UppercaseFilter

#### METHOD: UppercaseFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `uppercaseFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: UppercaseFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `uppercaseFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: UppercaseFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `uppercaseFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: LowercaseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new LowercaseFilter();`
**Description:** String transformer. Converts all characters to lowercase.

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Converts all characters to lowercase.
 * @class
 */
```

### Methods and properties of LowercaseFilter

#### METHOD: LowercaseFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `lowercaseFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: LowercaseFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `lowercaseFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: LowercaseFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `lowercaseFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: UncapitalizeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new UncapitalizeFilter();`
**Description:** String transformer. Converts only the first character to lowercase. Unicode-safe.

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Converts only the first character to lowercase. Unicode-safe.
 * @class
 */
```

### Methods and properties of UncapitalizeFilter

#### METHOD: UncapitalizeFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `uncapitalizeFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: UncapitalizeFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `uncapitalizeFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: UncapitalizeFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `uncapitalizeFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: CapitalizeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new CapitalizeFilter();`
**Description:** String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.
 * @class
 */
```

### Methods and properties of CapitalizeFilter

#### METHOD: CapitalizeFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `capitalizeFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapitalizeFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `capitalizeFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapitalizeFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `capitalizeFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DateFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new DateFilter();`
**Description:** Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.

### Raw JSDoc Context:
```javascript
/**
 * @description Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.
 * @class
 */
```

### Methods and properties of DateFilter

#### METHOD: DateFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DateFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DateFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
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
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new NumberFilter();`
**Description:** Number formatter. Applies locale-specific formatting with optional fixed decimals.

### Raw JSDoc Context:
```javascript
/**
 * @description Number formatter. Applies locale-specific formatting with optional fixed decimals.
 * @class
 */
```

### Methods and properties of NumberFilter

#### METHOD: NumberFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `numberFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: NumberFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `numberFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: NumberFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `numberFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: JoinFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new JoinFilter();`
**Description:** Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.
 * @class
 */
```

### Methods and properties of JoinFilter

#### METHOD: JoinFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `joinFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JoinFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `joinFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
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
#### METHOD: JoinFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `joinFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: PluralizeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new PluralizeFilter();`
**Description:** Conditional string selector. Returns singular or plural form based on a numeric count.

### Raw JSDoc Context:
```javascript
/**
 * @description Conditional string selector. Returns singular or plural form based on a numeric count.
 * @class
 */
```

### Methods and properties of PluralizeFilter

#### METHOD: PluralizeFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `pluralizeFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: PluralizeFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `pluralizeFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: PluralizeFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `pluralizeFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: WhereFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new WhereFilter();`
**Description:** Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.
 * @class
 */
```

### Methods and properties of WhereFilter

#### METHOD: WhereFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `whereFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: WhereFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `whereFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: WhereFilter._isDangerousKey
- **Scope:** instance
- **LLM Call Syntax:** `whereFilter._isDangerousKey();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: WhereFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `whereFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: ExcludeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
**Constructor Usage:** `const instance = new ExcludeFilter();`
**Description:** Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.
 * @class
 */
```

### Methods and properties of ExcludeFilter

#### METHOD: ExcludeFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `excludeFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ExcludeFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `excludeFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ExcludeFilter._isDangerousKey
- **Scope:** instance
- **LLM Call Syntax:** `excludeFilter._isDangerousKey();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ExcludeFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `excludeFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DefaultFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new DefaultFilter();`
**Description:** Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.

### Raw JSDoc Context:
```javascript
/**
 * @description Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.
 * @class
 */
```

### Methods and properties of DefaultFilter

#### METHOD: DefaultFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `defaultFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DefaultFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `defaultFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DefaultFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `defaultFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: YesNoFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new YesNoFilter();`
**Description:** Boolean-to-string transformer. Format: "YesString,NoString".

### Raw JSDoc Context:
```javascript
/**
 * @description Boolean-to-string transformer. Format: "YesString,NoString".
 * @class
 */
```

### Methods and properties of YesNoFilter

#### METHOD: YesNoFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `yesNoFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: YesNoFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `yesNoFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: YesNoFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `yesNoFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: TruncateFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new TruncateFilter();`
**Description:** String truncator with optional suffix. Defaults to 50 chars and "...".

### Raw JSDoc Context:
```javascript
/**
 * @description String truncator with optional suffix. Defaults to 50 chars and "...".
 * @class
 */
```

### Methods and properties of TruncateFilter

#### METHOD: TruncateFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `truncateFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TruncateFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `truncateFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: TruncateFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `truncateFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: SplitFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new SplitFilter();`
**Description:** String-to-array splitter using a specified separator (default: ",").

### Raw JSDoc Context:
```javascript
/**
 * @description String-to-array splitter using a specified separator (default: ",").
 * @class
 */
```

### Methods and properties of SplitFilter

#### METHOD: SplitFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `splitFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SplitFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `splitFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SplitFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `splitFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: ReplaceFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new ReplaceFilter();`
**Description:** Global string replacer. Replaces all occurrences of searchValue with replaceValue.

### Raw JSDoc Context:
```javascript
/**
 * @description Global string replacer. Replaces all occurrences of searchValue with replaceValue.
 * @class
 */
```

### Methods and properties of ReplaceFilter

#### METHOD: ReplaceFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `replaceFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ReplaceFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `replaceFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ReplaceFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `replaceFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: UrlEncodeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new UrlEncodeFilter();`
**Description:** URI component encoder for URL-safe string generation.

### Raw JSDoc Context:
```javascript
/**
 * @description URI component encoder for URL-safe string generation.
 * @class
 */
```

### Methods and properties of UrlEncodeFilter

#### METHOD: UrlEncodeFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `urlEncodeFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: UrlEncodeFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `urlEncodeFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: UrlEncodeFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `urlEncodeFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: MapFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new MapFilter();`
**Description:** Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.
 * @class
 */
```

### Methods and properties of MapFilter

#### METHOD: MapFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `mapFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: MapFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `mapFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: MapFilter._isDangerousKey
- **Scope:** instance
- **LLM Call Syntax:** `mapFilter._isDangerousKey();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: MapFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `mapFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: LimitFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new LimitFilter();`
**Description:** Array slicer. Returns the first N items (default: 10).

### Raw JSDoc Context:
```javascript
/**
 * @description Array slicer. Returns the first N items (default: 10).
 * @class
 */
```

### Methods and properties of LimitFilter

#### METHOD: LimitFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `limitFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: LimitFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `limitFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: LimitFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `limitFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: SkipFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new SkipFilter();`
**Description:** Array offsetter. Skips the first N items.

### Raw JSDoc Context:
```javascript
/**
 * @description Array offsetter. Skips the first N items.
 * @class
 */
```

### Methods and properties of SkipFilter

#### METHOD: SkipFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `skipFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SkipFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `skipFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SkipFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `skipFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: SortFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new SortFilter();`
**Description:** Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.

### Raw JSDoc Context:
```javascript
/**
 * @description Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.
 * @class
 */
```

### Methods and properties of SortFilter

#### METHOD: SortFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SortFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SortFilter._isDangerousKey
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter._isDangerousKey();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SortFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: ReverseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new ReverseFilter();`
**Description:** Array order reverser. Creates a shallow copy before reversing.

### Raw JSDoc Context:
```javascript
/**
 * @description Array order reverser. Creates a shallow copy before reversing.
 * @class
 */
```

### Methods and properties of ReverseFilter

#### METHOD: ReverseFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `reverseFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ReverseFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `reverseFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ReverseFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `reverseFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: PlusFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new PlusFilter();`
**Description:** Numeric addition filter. Adds addend to the value.

### Raw JSDoc Context:
```javascript
/**
 * @description Numeric addition filter. Adds addend to the value.
 * @class
 */
```

### Methods and properties of PlusFilter

#### METHOD: PlusFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `plusFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: PlusFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `plusFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: PlusFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `plusFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: MinusFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new MinusFilter();`
**Description:** Numeric subtraction filter. Subtracts subtrahend from the value.

### Raw JSDoc Context:
```javascript
/**
 * @description Numeric subtraction filter. Subtracts subtrahend from the value.
 * @class
 */
```

### Methods and properties of MinusFilter

#### METHOD: MinusFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `minusFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: MinusFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `minusFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: MinusFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `minusFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: JsonFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
**Constructor Usage:** `const instance = new JsonFilter();`
**Description:** JSON serializer with optional indentation support.

### Raw JSDoc Context:
```javascript
/**
 * @description JSON serializer with optional indentation support.
 * @class
 */
```

### Methods and properties of JsonFilter

#### METHOD: JsonFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `jsonFilter.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JsonFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `jsonFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JsonFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `jsonFilter.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: MustacheRenderError
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`
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
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`
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

### Methods and properties of _MustacheScanner

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
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`
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

### Methods and properties of _MustacheContext

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
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`
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

### Methods and properties of _FunctionFilterStrategy

#### METHOD: _FunctionFilterStrategy.getName
- **Scope:** instance
- **LLM Call Syntax:** `_FunctionFilterStrategy.getName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: _FunctionFilterStrategy.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `_FunctionFilterStrategy.getDescription();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: _FunctionFilterStrategy.execute
- **Scope:** instance
- **LLM Call Syntax:** `_FunctionFilterStrategy.execute();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: MyMustache
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`
**Constructor Usage:** `const instance = new MyMustache();`
**Description:** Advanced Mustache engine with Handlebars meta-variables (@index, @number, @first, @last, @odd, @even, @total, @key) and Liquid-style filters.
Implements template caching, prototype pollution protection, and Strategy-based filter registry.

### Raw JSDoc Context:
```javascript
/**
 * @description Advanced Mustache engine with Handlebars meta-variables (@index, @number, @first, @last, @odd, @even, @total, @key) and Liquid-style filters.
 * Implements template caching, prototype pollution protection, and Strategy-based filter registry.
 * @class
 * @version 2.1.0
 * @example
 * const mustache = new MyMustache({ logger: console });
 * const result = mustache.render('{{items | join:", "}}', { items: [1, 2, 3] });
 */
```

### Methods and properties of MyMustache

#### PROPERTY: MyMustache.di
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.di;`
- **Pure JSDoc:**
```javascript
/**
   * @description Dependency injection manifest for the Mustache service.
   * @returns {Object} DI configuration object.
   * @static
   */
```
---
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
#### PROPERTY: MyMustache.TOKEN_TYPE
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TOKEN_TYPE;`
- **Pure JSDoc:**
```javascript
/** @description Token array index for type identifier. @static */
```
---
#### PROPERTY: MyMustache.TOKEN_VALUE
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TOKEN_VALUE;`
- **Pure JSDoc:**
```javascript
/** @description Token array index for raw string value. @static */
```
---
#### PROPERTY: MyMustache.TOKEN_START
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TOKEN_START;`
- **Pure JSDoc:**
```javascript
/** @description Token array index for start character position. @static */
```
---
#### PROPERTY: MyMustache.TOKEN_END
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TOKEN_END;`
- **Pure JSDoc:**
```javascript
/** @description Token array index for end character position. @static */
```
---
#### PROPERTY: MyMustache.TOKEN_CHILDREN
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TOKEN_CHILDREN;`
- **Pure JSDoc:**
```javascript
/** @description Token array index for child token collection. @static */
```
---
#### PROPERTY: MyMustache.TOKEN_INDEX
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TOKEN_INDEX;`
- **Pure JSDoc:**
```javascript
/** @description Token array index for closing tag position. @static */
```
---
#### PROPERTY: MyMustache.TAG_SECTION
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_SECTION;`
- **Pure JSDoc:**
```javascript
/** @description Section start tag identifier (#). @static */
```
---
#### PROPERTY: MyMustache.TAG_INVERTED
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_INVERTED;`
- **Pure JSDoc:**
```javascript
/** @description Inverted section start tag identifier (^). @static */
```
---
#### PROPERTY: MyMustache.TAG_SECTION_END
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_SECTION_END;`
- **Pure JSDoc:**
```javascript
/** @description Section end tag identifier (/). @static */
```
---
#### PROPERTY: MyMustache.TAG_COMMENT
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_COMMENT;`
- **Pure JSDoc:**
```javascript
/** @description Comment tag identifier (!). @static */
```
---
#### PROPERTY: MyMustache.TAG_PARTIAL
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_PARTIAL;`
- **Pure JSDoc:**
```javascript
/** @description Partial inclusion tag identifier (>). @static */
```
---
#### PROPERTY: MyMustache.TAG_UNESCAPED
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_UNESCAPED;`
- **Pure JSDoc:**
```javascript
/** @description Unescaped variable tag identifier (&). @static */
```
---
#### PROPERTY: MyMustache.TAG_UNESCAPED_ALT
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_UNESCAPED_ALT;`
- **Pure JSDoc:**
```javascript
/** @description Alternative unescaped variable tag identifier ({). @static */
```
---
#### PROPERTY: MyMustache.TAG_VARIABLE
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_VARIABLE;`
- **Pure JSDoc:**
```javascript
/** @description Regular variable token type name. @static */
```
---
#### PROPERTY: MyMustache.TAG_TEXT
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.TAG_TEXT;`
- **Pure JSDoc:**
```javascript
/** @description Plain text token type name. @static */
```
---
#### PROPERTY: MyMustache.MAX_RENDER_DEPTH
- **Scope:** static
- **LLM Call Syntax:** `const result = MyMustache.MAX_RENDER_DEPTH;`
- **Pure JSDoc:**
```javascript
/** @description Maximum combined section/partial nesting depth before render() throws MustacheRenderError. @static */
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
#### METHOD: MyMustache.renderSegments
- **Scope:** instance
- **LLM Call Syntax:** `const result = myMustache.renderSegments(template, data, additionalPartials);`
- **Pure JSDoc:**
```javascript
/**
   * @description Renders a template into an ordered list of segments, each carrying
   * its resolved text plus its raw start/end offset in the original template string.
   * Unlike render(), this does not collapse the output into one string — it exposes
   * segment boundaries so a caller can map a rendered span back to the original
   * template offset it came from (e.g. to re-apply the original run's formatting).
   * Only supports top-level tokens; a section/inverted/partial token is rendered as
   * one opaque 'value' segment via the existing render machinery, not sub-divided.
   * Comment ('!') and set-delimiter ('=') tokens produce no segment, matching the
   * fact that render() also produces no output for them.
   * @param {string} template Mustache template string.
   * @param {Object} [data={}] View model data.
   * @param {Object} [additionalPartials={}] Render-specific partial overrides.
   * @returns {Array<{type: 'text'|'value', raw: string, rendered: string, rawStart: number, rawEnd: number}>}
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
- **Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`
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
- **Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`
- **LLM Call Syntax:** `const result = createAdvancedFilters();`
- **Pure JSDoc:**
```javascript
/**
 * @description Factory function that instantiates and returns all advanced filter strategies.
 * @returns {FilterStrategy[]} Collection of advanced filter instances.
 */
```

---
