# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [WorkspaceTemplateEngine](#workspacetemplateengine)

---

## WorkspaceTemplateEngine

**Version:** 1.0.0   **Layer:** Domain Logic (Layer 2)   **Dependencies:** CoreUtilsLib, GoogleApiWrapper

### FilterStrategy

**Source:** `WorkspaceTemplateEngine/src/FilterStrategy.ts`

Abstract base for Mustache template filters using the Strategy pattern.
Enables value transformations via pipe syntax: `{{value | filterName:args}}`.

**Initialization:**
```javascript
new FilterStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): string` |
| `execute` | `execute(value: *, args: ...*): *` |
| `validate` | `validate(value: *, args: Array<*>): void` |


### FilterRegistry

**Source:** `WorkspaceTemplateEngine/src/FilterStrategy.ts`

Centralized registry for managing and resolving FilterStrategy instances.

**Initialization:**
```javascript
new FilterRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(filterStrategy: FilterStrategy): void` |
| `registerAll` | `registerAll(filterStrategies: FilterStrategy[]): void` |
| `get` | `get(name: string): FilterStrategy|null` |


### PlaceholderService

**Source:** `WorkspaceTemplateEngine/src/PlaceholderService.ts`

**Initialization:**
```javascript
new PlaceholderService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `processString` | `processString(template: string, context={}: Object): string` |
| `resolve` | `resolve(template: string, context={}: Object): string` |
| `processDocument` | `processDocument(documentId: string, context={}: Object): boolean` |
| `processSheet` | `processSheet(sheetId: string, context={}: Object, sheetName=null: string|null): {success: boolean, layouts: Array<{sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean` |


### MustacheRenderError

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

Thrown when template rendering exceeds the maximum nesting depth or
detects a self-referencing partial cycle — surfaces a catchable, diagnosable error
instead of an opaque call-stack overflow when a data-driven CONF_DOC/CONF_MAIL
template is malformed (ref analysis_3_structural_errors.md Finding 3).

**Initialization:**
```javascript
new MustacheRenderError()
```


### _MustacheScanner

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

State-tracking scanner for incremental Mustache template parsing.

**Initialization:**
```javascript
new _MustacheScanner()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `eos` | `eos(): boolean` |
| `scan` | `scan(re: RegExp): string` |
| `scanUntil` | `scanUntil(re: RegExp): string` |


### _MustacheContext

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

Hierarchical context stack for Mustache variable resolution.
Supports parent context navigation ('../') and dot-notation property access.

**Initialization:**
```javascript
new _MustacheContext()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `push` | `push(view: *): _MustacheContext` |
| `lookup` | `lookup(name: string): *` |
| `_isDangerousKey` | `_isDangerousKey(key: string): boolean` |


### _FunctionFilterStrategy

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

Adapter for converting standard functions into FilterStrategy instances.
Enables backward compatibility with functional filter registrations.

**Initialization:**
```javascript
new _FunctionFilterStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### MyMustache

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

Advanced Mustache engine with Handlebars meta-variables (@index, @number, @first, @last, @odd, @even, @total, @key) and Liquid-style filters.
Implements template caching, prototype pollution protection, and Strategy-based filter registry.

**Initialization:**
```javascript
new MyMustache()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |
| `isNullOrUndefined` | `isNullOrUndefined(value: *): boolean` |
| `TOKEN_TYPE` | `TOKEN_TYPE: unknown` |
| `TOKEN_VALUE` | `TOKEN_VALUE: unknown` |
| `TOKEN_START` | `TOKEN_START: unknown` |
| `TOKEN_END` | `TOKEN_END: unknown` |
| `TOKEN_CHILDREN` | `TOKEN_CHILDREN: unknown` |
| `TOKEN_INDEX` | `TOKEN_INDEX: unknown` |
| `TAG_SECTION` | `TAG_SECTION: unknown` |
| `TAG_INVERTED` | `TAG_INVERTED: unknown` |
| `TAG_SECTION_END` | `TAG_SECTION_END: unknown` |
| `TAG_COMMENT` | `TAG_COMMENT: unknown` |
| `TAG_PARTIAL` | `TAG_PARTIAL: unknown` |
| `TAG_UNESCAPED` | `TAG_UNESCAPED: unknown` |
| `TAG_UNESCAPED_ALT` | `TAG_UNESCAPED_ALT: unknown` |
| `TAG_VARIABLE` | `TAG_VARIABLE: unknown` |
| `TAG_TEXT` | `TAG_TEXT: unknown` |
| `MAX_RENDER_DEPTH` | `MAX_RENDER_DEPTH: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_isDangerousKey` | `_isDangerousKey(key: string): boolean` |
| `getValue` | `getValue(key: string, data: Object): *` |
| `_initBuiltInFilters` | `_initBuiltInFilters(): void` |
| `registerFilter` | `registerFilter(filterStrategyOrName: FilterStrategy|string, fn: Function): void` |
| `render` | `render(template: string, data={}: Object, additionalPartials={}: Object): string` |
| `renderSegments` | `renderSegments(template: string, data={}: Object, additionalPartials={}: Object): Array<{type: 'text'|'value', raw: string, rendered: string, rawStart: number, rawEnd: number` |
| `_escapeRegExp` | `_escapeRegExp(string: string): string` |
| `_escapeHtml` | `_escapeHtml(string: string): string` |
| `_parse` | `_parse(template: string, tags: string[]): Array[]` |
| `_renderTokens` | `_renderTokens(tokens: Array[], context: MustacheContext, partials: Object, originalTemplate: string, state: Object): string` |
| `_lookupValue` | `_lookupValue(token: Array, context: MustacheContext): *` |
| `_escapedValue` | `_escapedValue(token: Array, context: MustacheContext): string|undefined` |
| `_unescapedValue` | `_unescapedValue(token: Array, context: MustacheContext): string|undefined` |
| `_createLoopContext` | `_createLoopContext(item: *, index: number, total: number, key: string): Object|*` |
| `_renderSection` | `_renderSection(token: Array, context: MustacheContext, partials: Object, originalTemplate: string, state: Object): string|undefined` |
| `_renderInverted` | `_renderInverted(token: Array, context: MustacheContext, partials: Object, originalTemplate: string, state: Object): string|undefined` |
| `_renderPartial` | `_renderPartial(token: Array, context: MustacheContext, partials: Object|function, state: Object): string|undefined` |
| `_squashTokens` | `_squashTokens(tokens: Array[]): Array[]` |
| `_nestTokens` | `_nestTokens(tokens: Array[]): Array[]` |
| `_parseTemplate` | `_parseTemplate(template: string, tags: string[]): Array[]` |


### DefaultFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.

**Initialization:**
```javascript
new DefaultFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### YesNoFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Boolean-to-string transformer. Format: "YesString,NoString".

**Initialization:**
```javascript
new YesNoFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### TruncateFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

String truncator with optional suffix. Defaults to 50 chars and "...".

**Initialization:**
```javascript
new TruncateFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### SplitFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

String-to-array splitter using a specified separator (default: ",").

**Initialization:**
```javascript
new SplitFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### ReplaceFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Global string replacer. Replaces all occurrences of searchValue with replaceValue.

**Initialization:**
```javascript
new ReplaceFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### UrlEncodeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

URI component encoder for URL-safe string generation.

**Initialization:**
```javascript
new UrlEncodeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### MapFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.

**Initialization:**
```javascript
new MapFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(): void` |
| `execute` | `execute(): void` |


### LimitFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Array slicer. Returns the first N items (default: 10).

**Initialization:**
```javascript
new LimitFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### SkipFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Array offsetter. Skips the first N items.

**Initialization:**
```javascript
new SkipFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### SortFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.

**Initialization:**
```javascript
new SortFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(): void` |
| `execute` | `execute(): void` |


### ReverseFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Array order reverser. Creates a shallow copy before reversing.

**Initialization:**
```javascript
new ReverseFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### PlusFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Numeric addition filter. Adds addend to the value.

**Initialization:**
```javascript
new PlusFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### MinusFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Numeric subtraction filter. Subtracts subtrahend from the value.

**Initialization:**
```javascript
new MinusFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### JsonFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

JSON serializer with optional indentation support.

**Initialization:**
```javascript
new JsonFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### UppercaseFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

String transformer. Converts all characters to uppercase.

**Initialization:**
```javascript
new UppercaseFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### LowercaseFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

String transformer. Converts all characters to lowercase.

**Initialization:**
```javascript
new LowercaseFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### UncapitalizeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

String transformer. Converts only the first character to lowercase. Unicode-safe.

**Initialization:**
```javascript
new UncapitalizeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### CapitalizeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.

**Initialization:**
```javascript
new CapitalizeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### DateFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.

**Initialization:**
```javascript
new DateFilter()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `_formatDDMMYYYY` | `_formatDDMMYYYY(date: Date): string` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### NumberFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Number formatter. Applies locale-specific formatting with optional fixed decimals.

**Initialization:**
```javascript
new NumberFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### JoinFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.

**Initialization:**
```javascript
new JoinFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(key: string): boolean` |
| `execute` | `execute(): void` |


### PluralizeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Conditional string selector. Returns singular or plural form based on a numeric count.

**Initialization:**
```javascript
new PluralizeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### WhereFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.

**Initialization:**
```javascript
new WhereFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(): void` |
| `execute` | `execute(): void` |


### ExcludeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.

**Initialization:**
```javascript
new ExcludeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(): void` |
| `execute` | `execute(): void` |


### DocumentProcessorInjector

**Source:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorInjector.ts`

**Initialization:**
```javascript
new DocumentProcessorInjector()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_buildStyledSegments` | `_buildStyledSegments(template: string, data: Object): Array<{rendered: string, style: Object` |
| `_styleAt` | `_styleAt(offset: number): Object` |
| `_rebaseSourceRuns` | `_rebaseSourceRuns(shift: number): Array<{start:number, end:number, style:Object` |
| `_executeRowLoopOperation` | `_executeRowLoopOperation(): void` |
| `_executeColumnLoopOperation` | `_executeColumnLoopOperation(): void` |
| `_convertOperationToRequests` | `_convertOperationToRequests(): void` |
| `_createTextSubstitutionRequests` | `_createTextSubstitutionRequests(): void` |
| `_createDeleteRangeRequests` | `_createDeleteRangeRequests(): Array<Object>` |
| `_createDeleteRowRequests` | `_createDeleteRowRequests(): void` |
| `_executeListLoopOperation` | `_executeListLoopOperation(documentId: string, op: Object): void` |
| `_escapeForFindText` | `_escapeForFindText(text: string): string` |
| `_retextParagraph` | `_retextParagraph(paragraph: Paragraph): void` |
| `_executeTableInsertOperation` | `_executeTableInsertOperation(documentId: string): void` |
| `_flushDocumentChanges` | `_flushDocumentChanges(): void` |


### DocumentProcessorTagScanner

**Source:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorTagScanner.ts`

**Initialization:**
```javascript
new DocumentProcessorTagScanner()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_analyzeColumnLoops` | `_analyzeColumnLoops(): void` |
| `_analyzeRowLoops` | `_analyzeRowLoops(): void` |
| `_analyzeListLoops` | `_analyzeListLoops(): void` |
| `_analyzeConditionalSections` | `_analyzeConditionalSections(textMatches: Array<Object>, context: Object): Array<{type: 'conditionalDelete', index: number, length: number, kind: 'section'|'marker'` |
| `_resolveConditionalSectionNode` | `_resolveConditionalSectionNode(context: Object): Array<{type: 'conditionalDelete', index: number, length: number, kind: 'section'|'marker'` |
| `_analyzeTextSubstitutions` | `_analyzeTextSubstitutions(): void` |
| `_analyzeTableInsertions` | `_analyzeTableInsertions(textMatches: Array<Object>, context: Object): Array<{type: 'tableInsert', placeholder: string, data: Array<Array<*>>, options: Object` |
| `_parseTableParams` | `_parseTableParams(paramsStr: string): Object<string,string>` |
| `_parseExpression` | `_parseExpression(): void` |
| `_parseFilterArgs` | `_parseFilterArgs(): void` |
| `_parseArgValue` | `_parseArgValue(): void` |


### DocumentProcessorValueResolver

**Source:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorValueResolver.ts`

**Initialization:**
```javascript
new DocumentProcessorValueResolver()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_applyFilters` | `_applyFilters(): void` |
| `_sortByProperty` | `_sortByProperty(): void` |
| `_getNestedProperty` | `_getNestedProperty(): void` |


### _DocumentProcessor

**Source:** `WorkspaceTemplateEngine/src/processors/DocumentProcessor.ts`

**Initialization:**
```javascript
new _DocumentProcessor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_computeFalsyConditionalRanges` | `_computeFalsyConditionalRanges(currentStructure: Object, context: Object): Array<[number, number]>` |
| `_isInsideAnyRange` | `_isInsideAnyRange(ranges: Array<[number, number]>, index: number): boolean` |
| `process` | `process(): void` |


### _SheetProcessor

**Source:** `WorkspaceTemplateEngine/src/processors/SheetProcessor.ts`

Specialized engine for Google Sheets template expansion using batch-first strategy.
Implements cell-level substitutions and structural expansions (matrices, dynamic columns) in atomic updates.

**Initialization:**
```javascript
new _SheetProcessor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `process` | `process(sheetId: string, context: Object, sheetName: string|null): {layouts: Array<{sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean, item: *` |
| `_parseDynamicColumnParams` | `_parseDynamicColumnParams(paramsStr: string): Object<string,string>` |
| `_bucketDynamicColumnGroups` | `_bucketDynamicColumnGroups(params: Object<string,string>): Array<{source: string|undefined, value: string|undefined, acl: string|undefined, scope: string, label: string|undefined` |
| `_prepareDynamicColumnRequests` | `_prepareDynamicColumnRequests(sheetName: string, startRow: number, startColumn: number, placeholder: string, context: Object): {valueRequests: Object[], protectionRequests: Object[], layout: ({sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean, item: *` |
| `_prepareDynamicRowRequests` | `_prepareDynamicRowRequests(sheetName: string, startRow: number, startColumn: number, placeholder: string, context: Object): {valueRequests: Object[]` |
| `_applyProtections` | `_applyProtections(spreadsheetId: string, protectionRequests: Object[]): void` |
| `_prepareMatrixRequests` | `_prepareMatrixRequests(sheetName: string, startRow: number, startColumn: number, placeholder: string, context: Object): Object[]` |
| `_expandGridIfNeeded` | `_expandGridIfNeeded(spreadsheetId: string, sheets: Object[], batchRequests: Object[]): void` |
| `_columnToLetter` | `_columnToLetter(column: number): string` |
| `_rangeToA1` | `_rangeToA1(startRow: number, startColumn: number, endRow: number, endColumn: number): string` |


### MustacheMock

**Source:** `WorkspaceTemplateEngine/src/testing/mocks.ts`

High-fidelity mock for the Mustache engine.
Simulates core rendering logic, variable substitution, and basic filter execution for unit testing.

**Initialization:**
```javascript
new MustacheMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_getValue` | `_getValue(obj: Object, path: string): *` |


---

