# Architecture Refactoring Plan — Remaining Work

**Repository:** `gas-enhancer-main` (GasLibraryFactory monorepo, v3.0.0)
**Scope:** 16 interconnected Google Apps Script libraries, webpack-bundled to `dist/Code.js`.
**Status:** Phases 0–2 and the lighter Phase 3/4 items are **done**. This document now contains
**only the work that remains** — the four large "god-class" decompositions (WP-09, WP-10, WP-11,
WP-13). Each is self-contained and directly-implementable, and can be picked up cold in a new session.

> The original audit found 14 work packages. WP-01…08, WP-12 and WP-14 have already landed (see
> "Already completed" below). The remaining four were deferred **because each relocates 550–1,200 lines
> of behavior-sensitive, GAS-API-heavy code that must stay byte-for-byte identical behind an unchanged
> public façade.** Done carelessly they break the green test suite; the prime directive is that they
> must not.

---

## 0. How to use this document

- The remaining work packages are **WP-09, WP-10, WP-11, WP-13**. They are independent of each other and
  can be done in any order / one PR each (WP-09 and WP-10 may each warrant 2 PRs).
- **Hard rules for any implementer (from `CLAUDE.md`):**
  - Never edit `dist/*`. Only edit source modules. Rebuild via `npm run build:production`.
  - Target runtime is **GAS V8** — prefer synchronous code, no Node APIs, no unsupported browser APIs.
  - Cross-library imports must use webpack aliases (`@CoreUtilsLib`, `@GoogleApiWrapper`, …), never
    relative paths into another library, never deep paths into another library's `src/internal`.
  - **Native GAS globals** (`DriveApp`, `SpreadsheetApp`, `DocumentApp`, `Utilities`, `PropertiesService`,
    `CacheService`, …) may only be touched inside `GoogleApiWrapper`. This is now **enforced by ESLint**
    (`no-restricted-globals` in `eslint.config.js`); a new leak fails `npm run lint`. Inside
    GoogleApiWrapper the rule is off, so WP-09/WP-11 (both in GoogleApiWrapper) are unaffected.
  - After every WP: `npm test` must stay green and `npm run build:production` must succeed.

### Definition of done (every WP)

`npm test` green (no reduction in the passing count, currently **7,611 passing / 1 pre-existing
UUID-mock failure unrelated to this work / 9 skipped**) · `npm run build:production` succeeds · no edits
under `dist/` · **public APIs unchanged** (these are pure internal decompositions behind existing façades).

### Build / test / lint commands

```
npm ci                      # install (jest/webpack are devDependencies)
npm test                    # full Jest suite (run on SOURCE)
npx jest <path>             # targeted suite while iterating
npm run build:production    # webpack + GAS V8 post-processing -> dist/ (REQUIRED before the offline
                            #   bundle tests in test/offline/* will pass)
npm run lint                # includes the native-GAS guard
```

> Note: the bare `npm run build` (webpack only) does **not** apply the V8 patches, so the
> `test/offline/gas-compatibility.test.js` and `bundle-load` suites need `build:production` first.

### Reusable building blocks already available (use these — do not re-invent)

These were added in the completed phases and are exported from `@CoreUtilsLib`:

- **`BaseError`** (`CoreUtilsLib/src/errors/BaseError.js`) — standardized error base (name, context,
  timestamp, `Error.captureStackTrace`, `toJSON`, chaining). All library base errors already extend it.
- **`Registry`** (`CoreUtilsLib/src/internal/Registry.js`) — Map-backed `register/set/get/has/
unregister/clear/keys/values/entries/size` with optional logger, `entityName`, and a `validateValue`
  hook. Compose it for any new Map-backed store.
- **`Result`** (`CoreUtilsLib/src/Result.js`) — frozen-friendly success/error value object
  (`value`, `error`, `isSuccess()`, `isError()`, `toJSON()`, `ok()/fail()/empty()`). **Relevant to WP-13.**
- **`ServiceFactory`** (`GoogleApiWrapper/src/internal/core/ServiceFactory.js`) — the DI container
  (`getLogger/getUtils/getUtilitiesService/getCache/getCacheService/getExceptionService/
getDriveService/getDocumentService/getSpreadsheetService/getPermissionService/getPropertiesService/…`).
- **Mock pattern:** `test/fakes/MockFactory.js` + per-lib `src/testing/mocks.js`. **Preserve this when
  adding/refactoring classes** — add mocks for any new collaborator that a test needs to inject.

### Already completed (context only — do not redo)

WP-01 error hierarchy → `BaseError`; WP-02 centralized validation/type-guards; WP-03 `interfaces.js`
contracts vs. validation split; WP-04 repo tooling cleanup; WP-05 closed the JobRunnerLib→Drive leak;
WP-06 native-GAS lint guard + boundary docs; WP-07 shared `Registry` (composed into 4 registries);
WP-08 shared `Result` (BlockResult, PostProcessorResult); WP-12 bind-facade → explicit delegation in
TableService & ExpressionEvaluatorService; WP-14 DI unified on `ServiceFactory` + wiring docs. An online
test (`__testOnline__/integration/IntegrationTests_DriveWrapper.gs`) covers the WP-05 routing path.

---

# REMAINING WORK PACKAGES

> General approach that keeps all four green and low-risk: **extract collaborators additively first**
> (new files under the lib's existing `internal/` convention — nothing references them yet, suite stays
> green), build & test, **then** flip the original class into a thin façade that constructs and delegates
> to them. The codebase already uses the façade-delegation idiom (`DriveService`, `JobStateManager`,
> and — after WP-12 — `TableService`/`ExpressionEvaluatorService`), so match that style. **No public
> method signatures may change**; the existing tests for the façade are the regression guard.

---

## WP-09 — Split `DocumentTableManager` (1,219 LOC)

**Fixes:** F-2.1 (god class). **File:** `GoogleApiWrapper/src/internal/services-managers/DocumentTableManager.js`.
**Risk:** High (large, GAS Docs-API heavy). **Layer:** L2 (inside GoogleApiWrapper — native Docs/Drive
access is allowed here).

### Why it is complex

- It is a **1,219-line class with ~32 methods** spanning four unrelated concerns intermixed: table
  **data retrieval** (getters), **structural** ops (insert/append/delete rows & columns), **cell
  formatting** (background/padding/vertical-alignment), and **row styling** (bold/alignment/min-height/
  background) — plus a `_createTableWithStandardAPI` initializer.
- Every method drives the **Advanced Docs API / native DocumentApp** with intricate index math
  (`startIndex`/`endIndex`, batchUpdate requests). Behavior must be reproduced exactly; there is no
  partial-credit — an off-by-one in an index range corrupts the document.
- It is reached only through `DocumentService` (`DocumentService.js:36` does
  `new DocumentTableManager(this)`), so the public surface is the **instance method set**; the split must
  keep every method callable with identical name/signature/return.

### What makes it tractable (verified)

- The methods are **independent**: they reference only `this.facade`, `this._logger`, `this._cache`,
  `this._utils`, `this._exceptionService` — **no method calls a sibling method on `this`**. So each can
  be moved verbatim into a collaborator that exposes the same five fields, with zero cross-wiring.
- The constructor today is just `constructor(facade){ this.facade=facade; this._logger=facade._logger;
this._cache=facade._cache; this._utils=facade._utils; this._exceptionService=facade._exceptionService; }`.

### Steps

1. Create `GoogleApiWrapper/src/internal/services-managers/document-table/` with four collaborators,
   each taking `facade` and setting the same five fields:
   - `TableReader.js` — getters: `getDocumentTables`, `getTableStructure`, `getTableData`, `getTableRow`,
     `getTableColumn`, `getTableMetadata`, `getCellDetails`, `getColumnWidth`, `getRowMinimumHeight`,
     `getCellBackgroundColor`, `getCellPadding`, `getCellVerticalAlignment`.
   - `TableStructureEditor.js` — `insertTableRow`, `appendTableRow`, `deleteTableRow`, `copyTableRow`,
     `insertTableColumn`, `appendTableColumn`, `deleteTableColumn`, `updateTableCell`, `updateTableRow`,
     `updateTableColumn`, `clearTableRow`, `setColumnWidth`, and `_createTableWithStandardAPI`.
   - `TableCellFormatter.js` — `setCellBackgroundColor`, `setCellPadding`, `setCellVerticalAlignment`.
   - `TableRowFormatter.js` — `setRowBackgroundColor`, `setRowMinimumHeight`, `setRowTextAlignment`,
     `setRowBold`.
     (Move each method **verbatim**, with its JSDoc. Keep getters next to their writers if that reduces
     churn — the exact grouping is flexible as long as no file exceeds ~400 LOC.)
2. Reduce `DocumentTableManager` to a thin façade: construct the four collaborators in the constructor and
   expose their methods. Use the idiomatic explicit-delegation style (preferred, post-WP-12) **or** the
   existing bind-loop style used by `DriveService` — but explicit delegating methods are now the house
   style. **No public method signature changes.**
3. Keep error handling consistent via GoogleApiWrapper's `ErrorHandler` (already used inside the methods).

### Acceptance

All existing `DocumentTableManager` tests pass via the façade (`GoogleApiWrapper/src/internal/
services-managers/__tests__/`); no file in `document-table/` exceeds ~400 LOC; public API identical;
`npm run build:production` green.

---

## WP-10 — Decompose the `Mustache` engine (1,057 LOC)

**Fixes:** F-2.2 (monolithic engine). **File:** `WorkspaceTemplateEngine/src/facades/Mustache.js`.
**Risk:** High (rendering correctness).

### Why it is complex

- It is a **1,057-line monolith** combining: scanning/lexing (`_MustacheScanner`, ~line 10), context
  resolution (`_MustacheContext`, ~line 72), a filter registry + application (`registerFilter`, ~line 439),
  template parsing (`_parseTemplate`/`_squashTokens`/`_nestTokens`), the rendering pipeline
  (`_renderTokens`/`_renderSection`/`_renderPartial`, ~lines 579–591), and a bespoke HTML escaper
  (`_escapeHtml`, ~line 517).
- Unlike WP-09, the parts are **tightly coupled**: the parser and renderer **share a template cache**,
  the scanner feeds the parser's token stream, the renderer recurses through sections while resolving
  against the context stack, and filters are applied mid-render. Extraction means cutting these seams
  cleanly **without changing tokenization or output by a single byte**.
- Mustache output is **whitespace- and escaping-sensitive**; the end-to-end template tests assert exact
  rendered strings, so any drift in section/partial/whitespace handling fails loudly.

### Steps

1. Extract into `WorkspaceTemplateEngine/src/internal/mustache/`:
   - `Scanner.js` (lexing — from `_MustacheScanner`),
   - `Parser.js` (tokens → AST + `_squashTokens`/`_nestTokens`),
   - `ContextStack.js` (hierarchical lookup + per-context cache — from `_MustacheContext`),
   - `Renderer.js` (AST → output: `_renderTokens`/`_renderSection`/`_renderPartial`),
   - `FilterPipeline.js` (filter registration + application — `registerFilter` + the apply path),
   - `HtmlEscaper.js` (`_escapeHtml`).
2. Keep `facades/Mustache.js` as the public façade orchestrating these. **Own the template cache in the
   façade** and pass it explicitly to `Parser`/`Renderer` (do not let collaborators hold hidden shared
   state). Preserve the `render` and `registerFilter` signatures exactly.
3. Add focused unit tests per collaborator (scanner/parser/renderer) reusing existing fixtures; keep the
   existing end-to-end Mustache tests as the byte-for-byte regression guard.

### Acceptance

Existing template-rendering tests pass byte-for-byte; collaborators are independently unit-testable;
façade API (`render`, `registerFilter`) unchanged; `npm run build:production` green.

---

## WP-11 — Refactor `PermissionService` & `PropertiesService`

**Fixes:** F-2.4, F-2.5. **Files:** `GoogleApiWrapper/src/services/PermissionService.js` (890 LOC),
`GoogleApiWrapper/src/services/PropertiesService.js` (758 LOC). **Risk:** Medium. **Layer:** L2.

### Why it is complex

- **PermissionService:** the cache-key generation + `cache.remove(...)` dance and the try/catch+log
  boilerplate are **smeared across every method** (cache invalidation at several call sites), and
  email→permissionId resolution is inlined in `removeAccess`/`changeRoles`. The behavior to preserve
  includes **exact cache-invalidation timing** (which keys get removed, and when) — easy to get subtly
  wrong, and the service tests assert on the cache mock interactions.
- **PropertiesService:** the same get/set/delete triple is repeated for **three scopes** (script / user /
  document) with inline JSON (de)serialization. Collapsing them under one `PropertyStore` abstraction must
  keep the per-scope public methods (`setProperty`/`getUserProperty`/…) behaving identically, including
  JSON round-tripping of objects and null/undefined handling.

### Steps

1. **PermissionService** → keep `PermissionService` as the façade and extract internal collaborators
   (under `GoogleApiWrapper/src/internal/...`): a `PermissionCache` (owns `_generateCacheKey` + put/remove)
   and a `PermissionIdResolver` (email→permissionId). Route every method's cache invalidation and ID
   resolution through them, and collapse the repeated try/catch into a shared `_run(op, fn)` wrapper that
   logs and delegates to `ErrorHandler`.
2. **PropertiesService** → introduce an internal `PropertyStore` wrapping a single native scope
   (`set/get/delete/getKeys`), instantiate three (`_script`/`_user`/`_document`), plus a
   `JsonPropertySerializer` for object get/set. The public methods become thin delegations. Move the bulk
   JSDoc to module docs / `DOCS_LIBS`.

### Acceptance

Service tests pass unchanged; cache-invalidation and JSON round-trip behavior identical; each file
materially smaller with single-purpose helpers; `npm run build:production` green.

---

## WP-13 — Separate concerns in `Repository` and `JobQueue`

**Fixes:** F-2.7, F-2.8. **Files:** `DomainRepositoryLib/src/Repository.js` (549 LOC),
`JobRunnerLib/src/JobQueue.js` (678 LOC). **Risk:** Medium–High. **May reuse `Result` (WP-08, done).**

### Why it is complex

- **Repository:** cache lookups, hydration calls, and dry-run flag handling are **interleaved inside every
  query/persist method** (e.g. `findById`). Pulling identity/caching and hydration into separate layers
  without changing query results or cache semantics is delicate — the repository tests cover cache hits/
  misses, hydration of related entities, and dry-run no-op behavior, all of which must be preserved.
- **JobQueue:** `execute()` is a **single method that does everything** — loads/saves state from
  Properties, validates handlers, wraps generators, acquires locks, creates the executor, schedules resume
  triggers, and handles results. State and trigger concerns are entangled with orchestration, and the
  construction wiring around `JobStateManager`/`JobTriggerManager` is already non-trivial (multiple
  `new JobStateManager(...)` call sites; see `JobQueue.js` `execute()` and the resume paths). The job
  lifecycle tests assert state transitions (PENDING→RUNNING→COMPLETED/FAILED), lock release on completion/
  suspension, and resume-after-timeout — so the timeout/lock/persistence ordering must be reproduced exactly.

### Steps

1. **Repository** → extract an identity/cache layer (`RepositoryCache` wrapping findById cache
   get/put/invalidate), route hydration through the existing `hydrationService` from a single place, and
   isolate the dry-run flag into a small policy object. `Repository` keeps query/persist **orchestration
   only**. (Optionally express outcomes with the shared `Result`.)
2. **JobQueue** → move all Properties read/write into `JobStateManager` (so `execute()` calls
   `stateManager.load()/save()` rather than touching Properties directly), and move trigger create/delete
   into a `JobTriggerService`. `execute()` becomes orchestration-only: load state → resolve handler → run
   via `JobExecutor` → persist via `JobStateManager` → schedule via the trigger service.

### Acceptance

JobRunner/Repository tests pass unchanged; `execute()` no longer contains direct Properties or trigger API
calls; state/trigger ownership is single-sourced; `npm run build:production` green.

---

## Execution order & dependencies

```
WP-09   WP-10   WP-11   WP-13     (all independent; one PR each, WP-09/WP-10 may need 2)
```

WP-13 may optionally use the shared `Result` (already available). None of the four depend on each other.

## Verification checklist (run after every WP and before merge)

1. `npm test` → no reduction in the passing count (baseline **7,611 passing**; the lone `UtilsService`
   UUID-mock failure is pre-existing and unrelated — do not "fix" it by weakening other tests).
2. `npm run lint` → the native-GAS guard still passes (WP-09/WP-11 live inside GoogleApiWrapper, where the
   rule is intentionally off).
3. `npm run build:production` → `dist/Code.js` regenerates without error.
4. For WPs touching GAS I/O (WP-09, WP-11), spot-check the relevant `__testOnline__` suite — these
   exercise the compiled behavior on real GAS.
5. Confirm no edits under `dist/`.

## Expected impact

Four 550–1,200-line god classes are split into single-purpose collaborators behind **unchanged public
façades**, completing the "separation of responsibilities" goal begun in the earlier phases. Combined with
the already-landed work (shared `BaseError`/`Registry`/`Result`, the closed Drive leak + lint guard, and
the DI unification on `ServiceFactory`), this finishes the audit's reduce-duplication / separate-
responsibilities / separate-layers objectives.
