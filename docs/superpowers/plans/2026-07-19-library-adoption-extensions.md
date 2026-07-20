# Library Adoption Extensions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend internal adoption of `es-toolkit`, `fuse.js`, `jsep`, `zod`, and `he` while preserving the behavior and signatures of every existing public method.

**Architecture:** Each library is introduced behind an existing ownership boundary: CoreUtils for utility/HTML helpers, SheetDB for searching and schema validation, and GasExpressionEngineLib for expression parsing. New behavior is additive and opt-in; existing APIs delegate only when parity tests prove their observable output is unchanged.

**Tech Stack:** JavaScript ES modules, Jest, `es-toolkit@1.43.0`, Fuse.js 7.5, JSEP 1.4, Zod 4.4, he 1.2, Webpack, Google Apps Script V8.

## Global Constraints

- Do not change the name, parameter list, return type, error type, ordering, or default behavior of an existing public method.
- New public methods are permitted only when explicitly additive, documented, exported through the existing package entry point, and covered by tests.
- Keep all native GAS service access inside `GoogleApiWrapper`; no extension may introduce direct native-global usage elsewhere.
- Do not edit `dist/`; validate generated output with `npm run build:testoffline` and `npx jest --config jest.offline.config.cjs`.
- Keep `es-toolkit` pinned at `1.43.0`; version 1.49 emits unsupported `structuredClone()` in the GAS bundle.
- Preserve the dependency DAG. Before reusing GasExpressionEngineLib from another library, verify no circular import is created with the graph.

## File Structure

- `CoreUtilsLib/src/internal/HtmlEntityCodec.js` — internal adapter around `he`; owns null-safe HTML text encoding and decoding.
- `CoreUtilsLib/src/utils/HtmlSanitizer.js` — keeps existing public static methods; delegates only escaping to the internal adapter.
- `JobRunnerLib/src/internal/CapturingLogger.js` and `WorkspaceTemplateEngine/src/facades/Mustache.js` — keep their public contracts while consuming the CoreUtils escaping boundary.
- `SheetDBLib/src/internal/query-builders/FuzzyCondition.js` — internal representation and validation of an additive fuzzy condition.
- `SheetDBLib/src/query/AdvancedQueryBuilder.js` and `SheetDBLib/src/internal/query-builders/AdvancedQueryCompiler.js` — add opt-in fuzzy querying without changing `where`, `whereLike`, or `execute` semantics.
- `GasExpressionEngineLib/src/internal/ExpressionPolicy.js` — reusable AST allowlist for callers that need parsing-only validation.
- Existing expression-owning services — adapt internally only after dependency-graph validation.
- `GasSchemaValidatorLib/src/SchemaValidator.js` and the selected configuration boundaries — retain error translation while adopting Zod schemas for pure input shape validation.

---

### Task 1: Establish `he` as the single internal HTML entity codec

**Files:**
- Create: `CoreUtilsLib/src/internal/HtmlEntityCodec.js`
- Modify: `CoreUtilsLib/src/utils/HtmlSanitizer.js`
- Modify: `JobRunnerLib/src/internal/CapturingLogger.js`
- Modify: `WorkspaceTemplateEngine/src/facades/Mustache.js`
- Test: `CoreUtilsLib/src/__tests__/HtmlSanitizer.test.js`
- Test: `JobRunnerLib/src/__tests__/CapturingLogger.test.js`
- Test: `WorkspaceTemplateEngine/src/**/__tests__/*Mustache*.test.js`

**Interfaces:**
- Consumes: `he.escape(value, options)` and `he.decode(value)`.
- Produces: private `escapeHtmlText(value)` and `decodeHtmlEntities(value)` helpers. `HtmlSanitizer.escapeHtml(value)` retains its current public signature and output contract.

- [ ] **Step 1: Write failing parity and Unicode tests**

Add tests proving the existing public method still returns the same five-character mapping and that the new internal codec handles named and non-ASCII entities:

```js
expect(HtmlSanitizer.escapeHtml(null)).toBe('');
expect(HtmlSanitizer.escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
expect(escapeHtmlText('© café')).toContain('&copy;');
expect(decodeHtmlEntities('&copy; café')).toBe('© café');
```

- [ ] **Step 2: Run the focused tests and confirm the new helper is missing**

Run: `npm test -- CoreUtilsLib/src/__tests__/HtmlSanitizer.test.js`

Expected: the existing assertions pass and the new adapter-import test fails because `HtmlEntityCodec.js` does not exist.

- [ ] **Step 3: Implement the internal adapter**

Create the adapter with no GAS globals and with the exact null-safe contract required by `HtmlSanitizer`:

```js
import he from 'he';

export function escapeHtmlText(value) {
  return he.escape(String(value ?? ''), { useNamedReferences: true, decimal: false });
}

export function decodeHtmlEntities(value) {
  return he.decode(String(value ?? ''));
}
```

If `he.escape` produces a different representation for one of the five legacy characters, configure or normalize the adapter so `HtmlSanitizer.escapeHtml` retains the exact current output.

- [ ] **Step 4: Delegate without changing public methods**

Replace the repeated replacement chain in `HtmlSanitizer.escapeHtml` with the adapter. Make `CapturingLogger._escapeHtml` and `MyMustache._escapeHtml` delegate to the already-public `HtmlSanitizer.escapeHtml` method, rather than exporting the new internal adapter. Do not change method names, parameters, rendering mode, URL validation, CSS validation, or raw-markup behavior.

- [ ] **Step 5: Run focused regression tests**

Run: `npm test -- CoreUtilsLib/src/__tests__/HtmlSanitizer.test.js JobRunnerLib/src/__tests__/CapturingLogger.test.js`

Expected: all legacy output assertions and the new entity cases pass.

### Task 2: Consolidate complex internal utilities behind `LodashFacade`

**Files:**
- Modify: `CoreUtilsLib/src/utils/SystemScriptSettings.js`
- Modify: `CoreUtilsLib/src/builders/ConfigMergeStrategy.js`
- Modify: `CoreUtilsLib/src/utils/StringUtils.js`
- Test: `CoreUtilsLib/src/__tests__/LodashFacade.test.js`
- Test: `CoreUtilsLib/src/**/__tests__/*SystemScriptSettings*.test.js`
- Test: `CoreUtilsLib/src/**/__tests__/*ConfigMergeStrategy*.test.js`

**Interfaces:**
- Consumes: existing named exports from `CoreUtilsLib/src/facades/LodashFacade.js` (`cloneDeep`, `merge`, `isEqual`, and case conversion helpers).
- Produces: unchanged existing methods implemented through the single facade; no new direct `es-toolkit/compat` imports outside the facade.

- [ ] **Step 1: Write failing behavior-characterization tests**

Capture current behavior before replacement, including nested arrays/objects and non-mutating inputs:

```js
const original = { nested: { values: [1, 2] } };
const cloned = settings.deepClone(original);
expect(cloned).toEqual(original);
expect(cloned).not.toBe(original);
expect(cloned.nested).not.toBe(original.nested);
```

Add equivalent merge/case-conversion assertions only where the local method is semantically identical to the facade utility; do not replace intentionally domain-specific behavior.

- [ ] **Step 2: Run characterization tests**

Run: `npm test -- CoreUtilsLib/src/__tests__/LodashFacade.test.js`

Expected: the new tests initially pass against the existing behavior, providing a regression baseline rather than a feature failure.

- [ ] **Step 3: Replace only parity-proven internal implementations**

Import named helpers from the facade, not from `es-toolkit/compat`:

```js
import { cloneDeep, merge } from '../facades/LodashFacade.js';
```

Use the helper only if its behavior matches the characterization tests. Leave native trivial helpers and domain-specific normalisation untouched.

- [ ] **Step 4: Enforce the single-boundary rule**

Run: `rg -n "from ['\"]es-toolkit/compat['\"]" --glob '*.js'`

Expected: `CoreUtilsLib/src/facades/LodashFacade.js` remains the only production import location.

- [ ] **Step 5: Run CoreUtils tests**

Run: `npm test -- CoreUtilsLib/src`

Expected: all CoreUtils tests pass with no changed public results.

### Task 3: Add opt-in fuzzy predicates to SheetDB queries

**Files:**
- Create: `SheetDBLib/src/internal/query-builders/FuzzyCondition.js`
- Modify: `SheetDBLib/src/query/AdvancedQueryBuilder.js`
- Modify: `SheetDBLib/src/internal/query-builders/AdvancedQueryCompiler.js`
- Modify: `SheetDBLib/src/internal/query-builders/AdvancedQueryValidator.js`
- Test: `SheetDBLib/src/internal/query-builders/__tests__/FuzzyCondition.test.js`
- Test: `SheetDBLib/src/query/__tests__/AdvancedQueryBuilder.test.js`

**Interfaces:**
- Consumes: `TableSearchEngine`/Fuse behavior and the existing `conditions` execution pipeline.
- Produces: additive fluent methods `whereFuzzy(field, query, options = {})` and `orWhereFuzzy(field, query, options = {})`. Existing `where`, `whereLike`, `orWhere`, `execute`, and result projection retain their signatures and behavior.

- [ ] **Step 1: Write the failing API tests**

```js
const rows = db.query().from('people')
  .whereFuzzy('name', 'alce', { threshold: 0.4 })
  .get();

expect(rows.map((row) => row.name)).toEqual(['Alice']);
expect(db.query().from('people').whereLike('name', 'Ali').get())
  .toEqual(existingLikeResult);
```

Also test invalid empty fields, non-string query values, threshold outside `[0, 1]`, and that `orWhereFuzzy` respects the existing OR grouping order.

- [ ] **Step 2: Verify the tests fail for the intended reason**

Run: `npm test -- SheetDBLib/src/query/__tests__/AdvancedQueryBuilder.test.js`

Expected: FAIL because `whereFuzzy` is not defined; legacy exact/LIKE tests still pass.

- [ ] **Step 3: Model and validate fuzzy conditions internally**

Create an immutable condition record such as:

```js
export function createFuzzyCondition(field, query, options, type) {
  return { kind: 'FUZZY', field, query, options: { threshold: 0.4, ...options }, type };
}
```

Validate that `field` and `query` are non-empty strings, that `threshold` is finite and within `[0, 1]`, and reject unknown options rather than passing them blindly into Fuse.

- [ ] **Step 4: Implement additive fluent methods and compiler support**

Append the new condition to `this.conditions`; never reinterpret an existing condition. In the compiler, evaluate fuzzy conditions only after rows are materialized and prior ordinary conditions/joins have reduced the candidate set. Reuse a single `TableSearchEngine`/Fuse configuration per execution and preserve source-row order for equal scores.

- [ ] **Step 5: Run focused SheetDB tests**

Run: `npm test -- SheetDBLib/src/internal/query-builders/__tests__/FuzzyCondition.test.js SheetDBLib/src/query/__tests__/AdvancedQueryBuilder.test.js`

Expected: new fuzzy tests pass and legacy query behavior remains unchanged.

### Task 4: Reuse JSEP parsing through an internal expression policy

**Files:**
- Create: `GasExpressionEngineLib/src/internal/ExpressionPolicy.js`
- Modify: `GasExpressionEngineLib/src/ExpressionParserService.js`
- Modify only after graph approval: `ContextEngine/src/internal/ContextStepExecutor.js`, `ComposableContentLib/src/internal/VisibilityEvaluator.js`, `GasDataImporter/src/internal/transform-managers/TransformerMappingEngine.js`, and `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorTagScanner.js`
- Test: `GasExpressionEngineLib/src/internal/__tests__/ExpressionPolicy.test.js`
- Test: the existing test file for each adopted expression consumer

**Interfaces:**
- Consumes: existing `ExpressionParserService.parse(expressionString)` and JSEP AST nodes.
- Produces: internal `assertAllowedExpressionAst(ast, policy)` validation. Existing parser and evaluator public methods retain their signatures; consumers keep their existing public method APIs.

- [ ] **Step 1: Verify dependency direction before any import**

Run graph inbound/outbound traces for `ExpressionParserService` and each candidate consumer.

Expected: no candidate has an inbound dependency from GasExpressionEngineLib that would become a cycle. If a cycle would be created, do not import the service; keep that consumer unchanged and record it as a separate architecture task.

- [ ] **Step 2: Write failing policy tests**

```js
expect(() => assertAllowedExpressionAst(parser.parse('user.age >= 18'), defaultPolicy))
  .not.toThrow();
expect(() => assertAllowedExpressionAst(parser.parse('constructor.constructor("x")()'), defaultPolicy))
  .toThrow('not allowed');
```

Cover literals, identifiers, member access, approved comparisons/logical operators, forbidden assignment, computed unsafe members, and unapproved calls.

- [ ] **Step 3: Run the policy test to confirm the guard is absent**

Run: `npm test -- GasExpressionEngineLib/src/internal/__tests__/ExpressionPolicy.test.js`

Expected: FAIL because `ExpressionPolicy.js` does not exist.

- [ ] **Step 4: Implement AST validation without evaluation changes**

Walk only the parsed AST; never use `eval`, `Function`, or dynamic property traversal. Reuse the parser's 10,000-character input limit and accept only node types/operators already handled by the evaluator.

- [ ] **Step 5: Integrate one consumer at a time**

For each graph-approved consumer, replace its private string parsing with `ExpressionParserService.parse` plus the policy assertion. Preserve its public inputs, results, errors, and sync execution. Run that consumer's focused tests before moving to the next one.

- [ ] **Step 6: Run expression-engine and consumer regressions**

Run: `npm test -- GasExpressionEngineLib ContextEngine ComposableContentLib GasDataImporter WorkspaceTemplateEngine`

Expected: parsing is shared internally and no consumer's public behavior changes.

### Task 5: Introduce Zod only at pure input-shape boundaries

**Files:**
- Modify: `GasSchemaValidatorLib/src/SchemaValidator.js`
- Modify: `SheetDBLib/src/TableSchemaValidator.js`
- Modify: `SheetDBLib/src/internal/dynamic-columns/SchemaTemplate.js`
- Modify: `SheetDBLib/src/internal/dynamic-columns/SchemaResolver.js`
- Test: `GasSchemaValidatorLib/src/__tests__/SchemaValidator.test.js`
- Test: `SheetDBLib/src/**/__tests__/*Schema*.test.js`

**Interfaces:**
- Consumes: existing exported Zod instance, `SchemaValidator.toValidationException`, and the table-schema validation boundary.
- Produces: private/reusable Zod schemas for configuration shape. Existing `setSchema`, `enableSchemaValidation`, `disableSchemaValidation`, and domain-error contracts remain unchanged.

- [ ] **Step 1: Write failing boundary tests**

```js
expect(() => table.setSchema({ columns: 'not-an-array' }))
  .toThrow(ValidationException);
expect(() => table.setSchema(validSchema)).not.toThrow();
```

Assert that the observable error type/message path remains the existing library error, not a raw `ZodError`.

- [ ] **Step 2: Run the focused tests and confirm the shape gap**

Run: `npm test -- GasSchemaValidatorLib/src SheetDBLib/src`

Expected: the malformed-shape test either reaches a later generic failure or is accepted, demonstrating the missing boundary validation.

- [ ] **Step 3: Define private schemas and translate errors**

Use Zod for deterministic, data-only shape checks, then pass failures through the existing translator:

```js
const result = schema.safeParse(value);
if (!result.success) throw schemaValidator.toValidationException(result.error);
return result.data;
```

Do not move repository-state, service, or business-invariant checks into Zod.

- [ ] **Step 4: Run focused regressions**

Run: `npm test -- GasSchemaValidatorLib/src SheetDBLib/src`

Expected: valid existing schemas keep their behavior; malformed input now fails consistently with the pre-existing domain error type.

### Task 6: Full compatibility and contract verification

**Files:**
- Modify only if test evidence requires it: source tests and documentation for the new additive APIs.

**Interfaces:**
- Consumes: all completed extension tasks.
- Produces: verification evidence that no existing public interface changed and the generated bundle remains GAS V8 compatible.

- [ ] **Step 1: Run the public-contract regression tests**

Run: `npm test`

Expected: all existing source test suites pass, including public export and behavior tests.

- [ ] **Step 2: Build the GAS-compatible offline bundle**

Run: `npm run build:testoffline`

Expected: the build exits 0 and its compatibility scan reports no `structuredClone()`, raw `Object.hasOwn()`, or unsupported literal `.replaceAll()` in `dist/Code.js`.

- [ ] **Step 3: Run offline bundle validation**

Run: `npx jest --config jest.offline.config.cjs`

Expected: all offline bundle tests pass, including export validation and GAS compatibility checks.

- [ ] **Step 4: Audit the public surface**

Run: `git diff --check && git diff --stat && git diff -- '*index.js' '*interfaces.js'`

Expected: changed public exports are limited to the explicitly additive fuzzy-query capability, if it is approved; no pre-existing method signature or export is removed/renamed.
