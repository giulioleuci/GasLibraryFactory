# Pre-Existing Test Failures Report

> Generated: 2026-04-27  
> Context: Discovered during the monorepo file reorganization (`docs/superpowers/plans/2026-04-26-monorepo-file-reorganization.md`).  
> All failures below existed **before** the reorganization. Zero import/module-resolution errors were introduced.

**Summary:** 26 failing suites / 616 failing tests out of 191 suites / 7,339 tests total.

---

## Category 1 — Missing Build Artifact (`dist/Code.js`)

These 4 suites require `npm run build` to generate the bundle before they can run. They will always fail in a clean checkout without building first.

| Suite | Error |
|---|---|
| `test/offline/bundle-load.test.js` | `Bundle not found at dist/Code.js. Run 'npm run build' first.` |
| `test/offline/exports-validation.test.js` | Same — bundle not found |
| `test/offline/gas-compatibility.test.js` | Same — bundle not found |
| `test/offline/smoke-tests.test.js` | Same — bundle not found |

**Fix:** Run `npm run build` before executing the offline test suite.

---

## Category 2 — SheetDBLib: `isEqual` Not Imported

**Suite:** `SheetDBLib/src/__tests__/TableService.test.js` — 14 failing tests

**Root cause:** `SheetDBLib/src/TableDataModifier.js` uses `isEqual` at line 136 (dirty-checking optimization) but never imports it. The function is `undefined` at runtime.

```
ReferenceError: isEqual is not defined
  at TableDataModifier.updateRowById (SheetDBLib/src/TableDataModifier.js:136:5)
```

**Affected tests:** All 14 tests in the `updateRowById()` and `Dirty Checking Optimization` suites.

**Fix:** Add `import { isEqual } from '@CoreUtilsLib';` (or from `./internal/...`) to `TableDataModifier.js`.

---

## Category 3 — PipelineFramework: Logic Failures (6 suites)

All 6 failing PipelineFramework suites contain logic bugs — no missing imports. PipelineContext, Step, Pipeline, ConsumerStep, ProducerStep, and the integration suite all fail.

### 3a. PipelineContext — all 46 tests fail

**Suite:** `PipelineFramework/src/__tests__/PipelineContext.test.js`

**Root cause:** `PipelineContext` class internals (`_metadata`, `executionHistory`, `getSummary`) are broken. Tests fail from the very first constructor test, suggesting the class itself has an uninitialized property issue.

```
TypeError: at PipelineContext.executionHistory [as getSummary] (PipelineContext.js:148)
```

### 3b. Step — partial failures

**Suite:** `PipelineFramework/src/__tests__/Step.test.js`

**Root cause:** Multiple Step operations fail (`setResult`, `get`, `verifyContext`). The `verifyContext` method throws a raw `TypeError` instead of `ContextValidationError`, indicating `ContextValidationError` may not resolve correctly in the Step module's execution context.

```
Expected constructor: ContextValidationError
Received constructor: TypeError
```

### 3c. Pipeline, ConsumerStep, ProducerStep, Integration

**Suites:**
- `PipelineFramework/src/__tests__/Pipeline.test.js`
- `PipelineFramework/src/__tests__/ConsumerStep.test.js`
- `PipelineFramework/src/__tests__/ProducerStep.test.js`
- `PipelineFramework/src/__tests__/integration/ProducerConsumerPipeline.test.js`

**Root cause:** Downstream of PipelineContext bugs. `pipeline.addStep()` is called on `undefined` because Pipeline construction fails.

```
TypeError: Cannot read properties of undefined (reading 'addStep')
```

---

## Category 4 — JobRunnerLib: Logic Failures (4 suites)

### 4a. CapturingLogger — 3 failing tests

**Suite:** `JobRunnerLib/src/__tests__/CapturingLogger.test.js`

**Root cause:** `setLevel()` method does not return `this` (fluent interface broken) and does not forward to the real logger.

```
Expected: "DEBUG"         // setLevel should forward to real logger
Received: undefined       // setLevel should return capturing logger for chaining
```

### 4b. JobDefinitionRegistry — failures

**Suite:** `JobRunnerLib/src/__tests__/JobDefinitionRegistry.test.js`

**Root cause:** Constructor validation and logging behavior does not match test expectations (`toBe` equality failures on logger validation messages).

### 4c. JobRunnerService — 2 suites

**Suites:**
- `JobRunnerLib/src/__tests__/JobRunnerService.coverage-gaps.test.js`
- `JobRunnerLib/src/__tests__/JobRunnerService.phase5.test.js`

**Root cause:** Downstream failures from the broken CapturingLogger and queue state management.

---

## Category 5 — GoogleApiWrapper: Logic Failures (4 suites)

### 5a. SidebarBuilder

**Suite:** `GoogleApiWrapper/src/builders/__tests__/SidebarBuilder.test.js`

**Root cause:** `toBe` equality failures starting from the constructor — the builder does not store/return values as the tests expect.

### 5b. UiService

**Suite:** `GoogleApiWrapper/src/services/__tests__/UiService.test.js`

**Root cause:** Logic failures in UI service behavior assertions.

### 5c. RateLimiter

**Suite:** `GoogleApiWrapper/src/builders/__tests__/RateLimiter.test.js`

**Root cause:** Logic failures in rate limiter behavior.

### 5d. BatchRateLimiterIntegration

**Suite:** `GoogleApiWrapper/src/__tests__/integration/BatchRateLimiterIntegration.test.js`

**Root cause:** Downstream of RateLimiter failures.

---

## Category 6 — GasProcessMonitorLib: Integration Failures

**Suite:** `GasProcessMonitorLib/src/__tests__/integration/loose-coupling.test.js`

**Root cause:** Integration test exercises `PipelineFramework` without a monitor. Fails because `PipelineContext` is broken (Category 3), so pipeline execution crashes.

```
TypeError: Cannot read properties of undefined (reading 'get')
```

---

## Category 7 — Cross-Library Integration: Pipeline-Dependent (6 suites)

**Suites:**
- `test/__tests__/integration/CrossCut_DryRunMode.test.js`
- `test/__tests__/integration/CrossCut_ErrorPropagation.test.js`
- `test/__tests__/integration/CrossCut_LoggerPropagation.test.js`
- `test/__tests__/integration/FullStack_PipelineExecution.test.js`
- `test/__tests__/integration/Phase4_EndToEnd_SGSA.test.js`
- `test/__tests__/integration/Phase4_PostProcessorPipeline.test.js`

**Root cause:** All depend on `PipelineFramework` working correctly. Since `PipelineContext` is broken (Category 3), any test that constructs a `Pipeline` fails with:

```
TypeError: Cannot read properties of undefined (reading 'addStep')
```

---

## Fix Priority

| Priority | Issue | Fix |
|---|---|---|
| 🔴 High | `PipelineContext` broken — cascades to 12+ suites | Fix `PipelineContext` constructor/metadata initialization |
| 🔴 High | `CapturingLogger.setLevel()` broken — cascades to JobRunnerLib suites | Fix `setLevel()` to return `this` and delegate to real logger |
| 🟡 Medium | `TableDataModifier` missing `isEqual` import | Add `import { isEqual }` to `TableDataModifier.js` |
| 🟡 Medium | `SidebarBuilder` / `UiService` / `RateLimiter` logic failures | Fix builder assertion mismatches |
| 🟢 Low | Offline bundle tests always fail without build | Add `npm run build` step before running offline tests in CI |
