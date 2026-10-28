# GLF TypeScript Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Convert all maintained GLF executable sources to strict TypeScript, reuse the available Google API declarations, and preserve the deployed GAS API and behavior.

**Architecture:** Migrate in dependency order, keeping Webpack/Babel responsible for the GAS bundle and adding a separate TypeScript check. Compile Node tools with `tsc`, generate online `.gs` scripts from typed sources, and emit public declarations from the same library barrels. Six tasks cover the entire repository; tests and mechanical edits travel with the code they support.

**Tech Stack:** TypeScript 5.9.3, `@types/google-apps-script` 2.0.13, Babel 7, Webpack 5, Jest 30, ESLint 9, Node 18-compatible tooling, CLASP and GAS V8.

**Spec:** [GLF TypeScript Migration Design](../specs/2026-10-25-glf-typescript-design.md). Scope decisions are proposals for review; implementation has not started.

## Global Constraints

- Preserve public runtime names, constructor behavior, sync return values, export ordering, serialized data, validation, retries, quotas and cleanup behavior.
- Keep Webpack/Babel, the Chrome 80 build target, `gas-webpack-plugin`, CLASP deployment modes and the V8 post-processing pipeline.
- Never hand-edit `dist/*`; change maintained sources and regenerate artifacts only.
- Native GAS operations stay inside `GoogleApiWrapper`, `GasOnlineTestFramework`, the sanctioned guarded `HashUtils`/`IdGenerator` boundary, and tests. Type-only references do not authorize new runtime dependencies.
- Import `LoggerService` and `UtilsService` from `@CoreUtilsLib`; preserve deprecated runtime re-exports for consumers.
- Reuse upstream API declarations; write local types only for GLF contracts or a documented upstream gap.
- No new runtime dependencies, generated service wrappers, async rewrites, persistence migrations, or unrelated refactors.
- Preserve all pre-existing user changes; never stage or commit unrelated files.

## Review Focus

1. Native globals overwritten by GLF constructors: saved Cache/Properties references and service initialization must still reach the native implementations. Pin this in Task 3.
2. Existing sheet rows and persisted jobs/checkpoints: blank cells, dates, nulls, optional fields and unknown external payloads must retain their current representation. Pin this in Task 4.
3. Dynamic delegation and extension points: structurally valid injected services, subclasses, DSL nodes and callbacks must retain useful types and their existing synchronous behavior. Pin this in Tasks 2 and 5.
4. Source code versus patched output: type-only fields/imports must disappear without changing object shape, bundler side effects or source-map ownership. Pin this in Tasks 1, 3 and 6.
5. Discovery and global online entry points: renamed tests, mock replacement and independently emitted online files must not silently lose coverage, registration functions or API documentation. Pin this in Tasks 1 and 6.

## File ownership and task boundaries

| Task | Maintained files and resulting responsibility |
| --- | --- |
| 1 | `package.json`, lockfile, `babel.config.cjs`, both `webpack*.config.cjs`, all three `jest*.config.cjs`, `eslint.config.js`, TS configs, `scripts/generate-offline-test-entry.cjs`, extension discovery in both doc generators, CI, migration inventory. One grouped setup/mechanical task. |
| 2 | Everything in `CoreUtilsLib/`, `GasResilienceLib/`, `GasSchemaValidatorLib/`: implementations, barrels, mocks and their tests. |
| 3 | Everything in `GoogleApiWrapper/` except online sources, everything in `GasOnlineTestFramework/`, `src/index.js`, GAS ambient declarations and wrapper/global bundle tests. |
| 4 | Everything in `SheetDBLib/`, `DomainRepositoryLib/`, `GasDataImporter/`, `JobRunnerLib/`, including associated mocks and tests. |
| 5 | Everything in `WorkspaceTemplateEngine/`, `GasExpressionEngineLib/`, `PipelineFramework/`, `ContextEngine/`, `ComposableContentLib/`, `RoleResolutionLib/`, including associated mocks and tests. |
| 6 | Remaining shared `test/` files, all maintained online sources, handwritten Node tools/plugin, declaration delivery, docs, CI enforcement, final acceptance. |

Directory ownership means **all existing files in that group**, discovered from the current working tree, not only the representative paths below. Each migrated `.js` becomes `.ts`; CJS tool implementations become `.cts`. Retain `.js` import specifiers. Keep JSON, shell scripts, Markdown and native configuration entry files in their existing formats. Do not restore `GasProcessMonitorLib` or already deleted files.

Keep one checklist and one review gate per task. Group renames, import/path updates, barrel changes, globs, fixtures, coverage patterns, documentation links and formatting inside these tasks; they do not need individual tasks or independent reviews. Contract-heavy files still require reading and verification.

### Task 1: Enable TypeScript and group the mechanical integration work

**Files:**
- Create: `tsconfig.base.json`, `tsconfig.json`, `tsconfig.test.json`, `tsconfig.tools.json`, `tsconfig.online.json`, `tsconfig.declarations.json`, `test/types/toolchain.ts`.
- Modify: the configuration and discovery files listed in ownership Task 1, `.github/workflows/ci.yml`, `README.md`, `BUILD_AND_DEPLOY.md`, `scripts/README.md`.
- Record inventory and baseline results in this plan's execution notes; keep detailed machine outputs under ignored `.cache/typescript-migration/`.

**Interfaces:**
- Consumes: the fifteen aliases in `webpack.config.cjs` and the existing npm build/test commands.
- Produces: `npm run typecheck` for GAS/runtime plus Jest sources; `npm run typecheck:tools`; `npm run build:tools`; `npm run build:types`; `.js`-specifier resolution to migrated `.ts` files in both Webpack configs and Jest.

- [x] **Step 1: Capture the working-tree baseline.** Record `git status --short`, existing maintained file paths, public barrel exports, test runner names, and all fifteen library roots. Use the MCP graph for code relationships and filesystem inventory for excluded tests/tools. Run `npx jest --listTests --json`, `npm run lint`, and `npm run build:testoffline`; the last command already runs source, integration and bundle checks. Record actual failures instead of assuming the overview's historical test count. Before migration, also run testing/production builds to distinguish existing build failures. Do not run push commands.
- [x] **Step 2: Add the smallest compiler probe.** `test/types/toolchain.ts` must accept `GoogleAppsScript.Spreadsheet.Spreadsheet`, `GoogleAppsScript.Drive.File` and `GoogleAppsScript.Sheets.Schema.Request`, and use a described `@ts-expect-error` for assigning a string to `Drive.File`. Run the new checks before setup: missing compiler/config/typings is the expected failure. The fixture is compile-only, outside Jest discovery.
- [x] **Step 3: Add development-only tooling and compiler projects.** Pin `typescript@5.9.3` and `@types/google-apps-script@2.0.13`; add compatible Babel 7 TypeScript erasure, TypeScript ESLint support, and Node/Jest declarations matching Node 18/Jest 30. Reuse dependency-bundled declarations; add `@types/he` for the existing untyped dependency. Check selected packages against the repository's engines. Runtime defaults: `target: ES2020`, `lib: [ES2020]`, `module: ESNext`, `moduleResolution: Bundler`, `strict: true`, `isolatedModules: true`, `noEmit: true`, explicit GAS types and all fifteen alias/subpath mappings. During migration only, use `allowJs: true`, `checkJs: false`. Jest adds its own Node/Jest environment; tooling uses NodeNext and emits under `.cache/ts-tools/`; online checking has its own ambient script environment; declarations emit under `.cache/types/`. Imported files are not excluded just because an `exclude` glob names them: account for public testing re-exports explicitly.
- [x] **Step 4: Update all mechanical discovery together.** Add Babel's TypeScript preset with `onlyRemoveTypeImports: true`, `allowDeclareFields: true`; preserve the separate Node test and Chrome 80 bundle targets. In both Webpack configs use `.ts`/`.js` resolution and `extensionAlias: { '.js': ['.ts', '.js'] }`, recognize TS loader inputs, preserve source maps, and retain the test/mock exclusions. Match `src/testing/mocks` with either source extension in `NormalModuleReplacementPlugin`. In all Jest configs support JS/TS transforms, test/coverage/setup paths and extensionless alias targets; map relative `.js` specifiers to the corresponding source. Extend ESLint parsing, native-service restrictions and sanctioned exceptions to `.ts`/`.cts`, retaining JS config checks. Update offline discovery/generated imports and both doc scanners for mixed extensions, covering all fifteen libraries, including `GasSchemaValidatorLib`. Adapt fixtures and docs alongside these patterns, without changing algorithms.
- [x] **Step 5: Verify and checkpoint.** Run `npm run typecheck`, `npx jest --listTests --json`, `npm run lint`, and `npm run build:testoffline`. The probe must pass, the rejected assignment must remain rejected, and discovered suites must match the baseline plus intentional additions. Add one small discovery regression assertion covering a TS test and `GasSchemaValidatorLib`, rather than a test for every glob. Build maps must still identify original source files. Checkpoint only this task's changes with `chore: enable staged TypeScript migration`.

### Task 2: Type the L0/L1 contracts before their consumers

**Files:**
- Migrate all source, barrel, mock and test files in `CoreUtilsLib/`, `GasResilienceLib/`, `GasSchemaValidatorLib/`.
- Key source contracts: `CoreUtilsLib/src/Result.ts`, `TypeGuards.ts`, `UtilsService.ts`, `internal/Registry.ts`, `internal/LazyServiceContainer.ts`, `utils/LazyRef.ts`, `utils/Delegation.ts`, `GasResilienceLib/src/ExceptionService.ts`, `GasSchemaValidatorLib/src/{SchemaValidator,DatasetValidator}.ts`.
- Create: `test/types/foundation.ts`; colocate shared GLF-only type definitions in their owning library only when multiple consumers need them.

**Interfaces:**
- Consumes: Task 1's compiler/resolution setup and the current runtime API of these three barrels.
- Produces: typed existing services/guards plus `Result<T = unknown>`, `Registry<K = string, V = unknown>`, and `LazyRef<T = unknown>`. Retain their current runtime method names and serialized shape. Consumers import these from existing public barrels, with `import type` for type-only symbols.

- [x] **Step 1: Establish contract checks.** Extend the existing Registry, LazyRef, Delegation, error and validator tests only where needed to pin current behavior. In `foundation.ts`, assert that a `Registry<string, number>` returns its stored value with its existing missing-value possibility, `LazyRef<number>` retains `number`, `Result.ok(123)` retains a numeric success payload with existing nullability, guards narrow `unknown`, and synchronous resilience callbacks preserve their return type. Include rejected wrong-type inserts and invalid known options using described `@ts-expect-error`. Before annotations, required generics/contract checks should fail; record that failure.
- [x] **Step 2: Migrate these libraries and their immediate tests.** Use existing validation and Zod inference, real nullability, typed options and the smallest generics needed by current callers. Preserve `Result.ok/fail/empty`, `toJSON`, cache protocols, lazy factories and callbacks. Type caught values as `unknown` and narrow them using existing guards. Added type-only properties use `declare`; do not initialize missing properties or introduce nominal/private restrictions that reject existing structural mocks. Preserve runtime constants instead of converting them into emitted TS enums.
- [x] **Step 3: Carry contracts through the SDK and callers.** Type each library's existing `testing` exports and fix directly affected consumers without renaming all downstream implementations early. Reuse the existing minimal service contracts or derive consumed methods with `Pick`; do not force every fake to implement a complete GAS service or a concrete class's internal state. Keep `HashUtils`/`IdGenerator` guarded GAS fallbacks and L0 dependency direction.
- [x] **Step 4: Verify and checkpoint.** Run `npm run typecheck`, `npx jest CoreUtilsLib GasResilienceLib GasSchemaValidatorLib --runInBand`, `npm run lint`, `npm run build:testing`, then `npx jest --config jest.offline.config.cjs --runInBand`. Existing assertions and compile-time fixtures must pass; no new native-global leaks or changed error serialization. Commit this group as `refactor: migrate foundation libraries to TypeScript`.

### Task 3: Type the Google API boundary and GAS global bridge

**Files:**
- Migrate all source, barrel, mock and unit test files in `GoogleApiWrapper/` and `GasOnlineTestFramework/`; online test sources remain for Task 6.
- Migrate: `src/index.js` to `src/index.ts`; update the Webpack entry.
- Create: `types/gas-runtime.d.ts`, `test/types/google-api.ts`.
- Migrate/extend: `test/offline/exports-validation.test.ts`, `gas-compatibility.test.ts`, `testing-mocks-dispatch.test.ts`; keep shared loaders working until Task 6.

**Interfaces:**
- Consumes: Task 2's logger, utility, error and structural dependency contracts; pinned native/Advanced Service declarations.
- Produces: typed existing `ServiceFactory` methods, `DriveService.getStandardApp(): GoogleAppsScript.Drive.DriveApp`, wrapper request/response contracts, and `initializeServices()` returning exactly `{ exceptionService, logger, utils, spreadsheetService, cacheService }` with the current concrete service types. Its `utils` property remains the current `UtilitiesService` instance.

- [x] **Step 1: Pin the dangerous boundary cases first.** Extend `GoogleApiWrapper/src/internal/core/__tests__/ServiceFactory.test.ts` and the existing compiled export/mock tests to assert singleton/reset behavior, saved native Cache/Properties references after flattening, wrapper constructor identity, exact initialization keys and current export-collision winners. Pin one class with an added type-only declaration: `Object.keys(instance)` must not gain a key. In `google-api.ts`, accept native File/Spreadsheet/Range/Document/Cache/Properties/Lock/Trigger types and Advanced Service payloads; reject a known wrongly typed native argument. Run the focused checks before implementation and record the new failure.
- [x] **Step 2: Reuse the upstream types at the real boundary.** Annotate service managers/builders and options using `GoogleAppsScript.*` and the actual Sheets/Docs/Drive Advanced Service namespaces in the pinned package. Read `appsscript.json` before choosing version-specific schemas, particularly Drive v2 versus v3. Prefer upstream types, `Parameters`, `ReturnType` and `Pick` over copied API DTOs. Preserve nullability and paginated/optional responses. If an actual API gap exists, add one narrow, documented local augmentation or adapter type; no wildcard shims or Node `googleapis` dependency.
- [x] **Step 3: Type globals without changing registration.** Keep native preservation before `Object.assign`, the current fifteen-library assignment order, and explicit `global.initializeServices = initializeServices` for GAS stubs. Declare the bundler's `global` bridge and the preserved native slots without loading Node's `global` types or redeclaring Google's native global names as GLF classes. Keep `ServiceFactory` as the only DI container. Public `testing` exports remain typed; preserve production mock replacement and ensure it matches renamed files.
- [x] **Step 4: Migrate the GAS testing framework and compatible mocks.** Preserve runner registration, test context, cleanup and spreadsheet-builder behavior. Mocks should satisfy only the consumed part of native/service interfaces; avoid `as unknown as FullService` across the SDK. Any scoped Jest declarations needed by publicly re-exported mocks remain development typing, with no runtime Jest/Faker imports in `Code.js`.
- [x] **Step 5: Verify and checkpoint.** Run `npm run typecheck`, `npx jest GoogleApiWrapper GasOnlineTestFramework --runInBand`, `npm run lint`, `npm run build:testing`, and `npx jest --config jest.offline.config.cjs --runInBand`. Require correct global identities, missing type-only fields, unchanged callable names, and source maps referencing `.ts`. Commit as `refactor: type GAS services and global exports`.

### Task 4: Migrate data access, repositories, import and job persistence

**Files:**
- Migrate all implementation, barrel, mock and test files in `SheetDBLib/`, `DomainRepositoryLib/`, `GasDataImporter/`, `JobRunnerLib/`.
- Key contracts: `SheetDBLib/src/{DatabaseService,TableService}.ts`, `DomainRepositoryLib/src/{Entity,Repository}.ts`, mapping/specifications, `GasDataImporter/src/{ImportEngine,ImportCheckpoint}.ts`, `JobRunnerLib/src/{JobRunnerService,JobQueue,QueueStateManager}.ts` and persistence managers.
- Create: `test/types/data.ts`; update affected integration tests under `test/__tests__/integration/` as part of this task.

**Interfaces:**
- Consumes: typed Google wrapper and foundational contracts from Tasks 2–3.
- Produces: typed current query/row, entity/mapping, import/checkpoint and queue/job APIs. Reuse one row/entity type through each existing read-transform-write path; keep open external records as `Record<string, unknown>` until existing validation narrows them. Do not invent a new repository API or schema format.

- [x] **Step 1: Pin existing data contracts.** Reuse the current TableService, EntityMapper, checkpoint and queue persistence tests. Add only missing assertions for empty string, `0`, `false`, Date values, null/absent fields and a save/load round trip of existing job/checkpoint fixtures. These are behavior baselines, so they should already pass. Add compile-only fixtures that preserve a caller's entity/row type and reject an incompatible known field or loader option; those checks must fail before the typed contract exists.
- [x] **Step 2: Migrate in data dependency order.** Type SheetDB first, DomainRepository next, then importer and job runner. Keep existing row formats, IDs, query operators, fluent returns, transaction/flush order, dry-run behavior and state transitions. Use generics only where the current API carries the same row/entity/payload type between calls. Derive schema types from Zod where it is already the schema owner; do not replace schemas or storage. Resolve JSON/external input through existing validation, not unchecked assertions.
- [x] **Step 3: Finish consumers and fixtures in the same group.** Migrate the four libraries' mocks/tests and their integration call sites; maintain logger/cache/exception injection and synchronous callbacks. Preserve serialized fixture values byte-for-byte where the existing serializer is deterministic. Treat newly exposed runtime bugs as separate documented changes unless they block safe typing; do not silently repair data behavior during annotation.
- [x] **Step 4: Verify and checkpoint.** Run `npm run typecheck`, `npx jest SheetDBLib DomainRepositoryLib GasDataImporter JobRunnerLib --runInBand`, `npm run test:integration -- --runInBand`, `npm run lint`, `npm run build:testing`, and `npx jest --config jest.offline.config.cjs --runInBand`. Require unchanged round trips and cross-layer behavior. Commit as `refactor: migrate data and persistence libraries to TypeScript`.

### Task 5: Migrate the expression, template and domain engines

**Files:**
- Migrate all implementation, barrel, mock and test files in `WorkspaceTemplateEngine/`, `GasExpressionEngineLib/`, `PipelineFramework/`, `ContextEngine/`, `ComposableContentLib/`, `RoleResolutionLib/`.
- Key contracts: template filters/processors; expression parser/evaluator/policy; `PipelineFramework/src/{Pipeline,PipelineContext,Step}.ts`; context providers/recipes/interceptors/projections; composition blocks/renderers/results; roles/scopes/assignments/delegation/resolution.
- Create: `test/types/engines.ts`; migrate affected integration fixtures/tests with these contracts.

**Interfaces:**
- Consumes: Tasks 2–4's service, result, registry and data contracts.
- Produces: typed existing fluent APIs and extension points. Carry context and payload types through providers, pipeline steps, renderers and assignment sources where current behavior preserves them. Preserve the existing public inheritance and structural injection contracts.

- [x] **Step 1: Add representative consumer checks.** In `engines.ts`, accept an existing custom `Step`/provider/filter/renderer implementation and a valid assignment source; preserve the current context/result types; reject a callback with an incompatible parameter or result. Reuse integration tests for full-stack context assembly, pipeline execution, composable content and effective assignment resolution. Keep assertions for a missing placeholder, allowed/rejected expressions, an empty recipe/block, and delegation cycles. Existing behavior checks pass first; new type assertions must expose the untyped contracts.
- [x] **Step 2: Migrate using actual imports.** Type WorkspaceTemplateEngine before GasExpressionEngineLib, PipelineFramework before dependent orchestration, and then ContextEngine/composition consumers; migrate RoleResolution using its actual graph dependencies. Model existing JSEP AST node kinds and recipe/step/assignment variants with upstream types or small discriminated unions. Preserve the expression security policy and current null/empty/error behavior. Do not make synchronous plugin returns promise-based or expose arbitrary dynamic keys as `any`.
- [x] **Step 3: Preserve delegation and extension points.** Add erased declarations for methods supplied dynamically by `Delegation` and existing facades, or use existing structural interfaces. Do not generate forwarding methods just to satisfy the compiler. Retain fluent `this` returns, constructor options, runtime constants, subclass overrides and test-double compatibility. Complete each group's mocks, tests and public barrel type exports with the implementation.
- [x] **Step 4: Verify and checkpoint.** Run `npm run typecheck`, `npx jest WorkspaceTemplateEngine GasExpressionEngineLib PipelineFramework ContextEngine ComposableContentLib RoleResolutionLib --runInBand`, `npm run test:integration -- --runInBand`, `npm run lint`, `npm run build:testing`, and `npx jest --config jest.offline.config.cjs --runInBand`. Require preserved custom extension points and security/error behavior. Commit as `refactor: migrate GLF engines to TypeScript`.

### Task 6: Finish tools/online sources and enforce complete migration

**Files:**
- Migrate remaining `test/**/*.js`, including setup, fake factories, offline bundle compatibility and VM loader helpers.
- Migrate `GoogleApiWrapper/__testOnline__/*.gs` and `__testOnline__/MasterTestRunner.gs` to `.ts`; create `types/gas-online.d.ts`.
- Migrate `scripts/build-and-prepare.cjs`, `generate-offline-test-entry.cjs`, `generate-simplified-docs.cjs`, `fix-db.cjs`, and `webpack-plugins/StripCommentsPlugin.cjs` to `.cts`; migrate `scripts/generate-docs.js` to `.ts`. Move both Webpack configs, including their inline copying/emission logic, into `webpack.config.cts` and `webpack.offline-tests.config.cts`; retain thin `.cjs` entry loaders at the current paths.
- Modify final compiler/config/npm/CI wiring, both build configs' online handling, doc generation, `README.md`, `BUILD_AND_DEPLOY.md`, `scripts/README.md`, `__testOnline__/README.md`, and relevant `DOCS_LIBS/*.md` outputs.
- Create: `tsconfig.consumer.json`, `test/types/published.ts`; use the existing test infrastructure for the few tooling regression checks.

**Interfaces:**
- Consumes: all fifteen typed barrels and Task 1's compiler projects.
- Produces: strict checks for runtime, tests, tools and online scripts; `npm run typecheck:online`; compiled tools under `.cache/ts-tools/`; declarations under `.cache/types/`; all existing build commands and GAS runner names preserved. Add `npm run verify:typescript` as the single local/CI acceptance command using existing commands, not a new orchestration framework.

- [x] **Step 1: Pin completion invariants before finishing conversion.** Add a small fixture/assertion that compares maintained sources to compiler inputs, test discovery to the saved baseline, and all fifteen library barrels to generated declaration roots. Add an online-output assertion: every maintained TS online source maps to its former `TEST_*.gs` name, top-level registration/runner functions survive, no module-loader syntax appears, and production excludes the online artifacts. Before conversion these completion checks must fail. Use existing bundle tests for the runtime assertions rather than building a parallel harness.
- [x] **Step 2: Finish shared harnesses and executable Node tools.** Convert the remaining files without changing the compatibility implementation. Compile tools and both Webpack config implementations with `tsc` to `.cache/ts-tools/`, retaining the source-relative directory layout and `.cts` → `.cjs` output. Point existing npm commands and nested child-process calls to emitted tools; ensure plain `build`, readable/watch modes and the typed comment-stripping plugin bootstrap correctly. The native Webpack `.cjs` files only load their compiled implementations; compile tooling before loading them. Fix emitted-path root resolution and every shell/documented caller. Preserve CLI flags and exit status. Check build/doc/entry-generator paths from the repository and a different CWD; inspect `fix-db` compilation but do not execute this data-mutating tool as a smoke test.
- [x] **Step 3: Emit and type-check the online scripts explicitly.** Use `tsconfig.online.json` for the shared GAS script declarations and Babel to erase each file separately at the existing GAS target. Preserve the seven maintained source-to-output mappings, duplicate-removal rules and `test-file-map.json`; do not bring back deleted utilities. Make top-level GLF declarations refer to actual barrel types through type-only `import()` queries. In wrapper tests, use function-local typed aliases to the runtime wrapper constructors where native names collide; do not redeclare Google's globals. Keep `runTests(filter: string | RegExp | null = null)`, `runAllOnlineTests()`, `initializeAllTests()` and all `initGoogleApiWrapperTests*` functions callable. Avoid an emitted `export {}` or CommonJS wrapper. Build testing artifacts and check function presence, registration parity and absence of module syntax.
- [x] **Step 4: Finish declaration and documentation delivery.** Emit `.cache/types/<Library>/index.d.ts` and dependencies from the real TS sources. In `tsconfig.consumer.json`, map aliases only to emitted declarations and compile `test/types/published.ts`, ensuring no source-path fallback; cover an exported native return, an injected-service consumer and one typed data/engine flow. Transpile documented TypeScript into comment-preserving JS in `.cache/` for the installed JSDoc parser, remap reported paths back to TS sources, and check all fifteen libraries retain their documented class/method inventory. Do not claim that adding `.ts` to a glob makes JSDoc parse TS. Update examples, commands and paths together.
- [x] **Step 5: Remove migration escape hatches and run the final gate.** Set `allowJs: false` in completed source projects; enable the final Node tools and online checks; remove mixed-extension fallbacks that only served the transition, while retaining `.js` specifier substitution. Require zero handwritten executable JS/GS/CJS outside the native config exceptions. Do not suppress new errors with blanket declarations, `any`, ignored files or weaker strictness. Implement `verify:typescript` to run the commands below, with testing/production bundle checks immediately after their corresponding builds. `build:testoffline` already runs the complete source/integration/offline suite, so do not duplicate those runs. Add the same acceptance command to `.github/workflows/ci.yml` within its existing branch policy.

```bash
npm run typecheck
npm run typecheck:tools
npm run typecheck:online
npm run build:types
npx tsc -p tsconfig.consumer.json --noEmit
npm run lint
npm run build:testoffline -- --include-offline-tests=true
npm run build:testing
npx jest --config jest.offline.config.cjs --runInBand
npm run build:production
npx jest --config jest.offline.config.cjs --runInBand
npm run docs
```

Pass conditions: no new baseline failures; no lost suites or library entries; all strict/consumer checks pass; all three build modes exit successfully; compiled tests pass; mock/Jest/Faker code stays out of production `Code.js`; test files stay out of production deployment; maps resolve representative `.ts` symbols. Preserve and test the existing pre-patch source-map-offset warning rather than requiring an unrelated map rewrite. Inspect the offline bundle manifest and generated-declaration/doc inventories: a command that succeeds after skipping sources is a failure of this gate.

- [ ] **Step 6: Validate on GAS and checkpoint the complete result.** After the offline gates, build testing artifacts for the configured test project and use its normal authorized deployment procedure. Run `runAllOnlineTests()` on real GAS; verify native wrapper services, runner registration, preserved global references and test cleanup. Record actual results and project/build identity; if access is unavailable, leave this runtime acceptance gate explicitly outstanding. Never push testing artifacts to production. Commit the completed source/tooling work as `refactor: complete strict TypeScript migration`; online validation status must remain explicit even if source changes are ready for review.

## Completion and execution notes

Success means all fifteen libraries, every maintained test source, shared harnesses and handwritten executable tools are typed; consumers can use the emitted declarations; source tests and patched GAS outputs preserve the baseline. JS/CJS configuration files, shell scripts, JSON and generated JavaScript are the documented format exceptions.

Recommended execution is sequential/native: each group changes contracts consumed by the next, and six checkpoints give useful review boundaries without a new agent context for every mechanical edit. This document requests no implementation, commit or deployment during the planning turn.

No baseline tests, builds or online tests were executed while writing this plan. Package/API assumptions were checked against the sources linked in the design. Refresh the baseline from the then-current working tree at Task 1; never substitute the historical overview counts for evidence.

### Execution checkpoint — 2026-10-25

- Tasks 1–2 implemented and verified in the working tree; Task 3 remains in progress. Tasks 4–6 have not started. Existing user changes and deleted libraries remain preserved. No commits or deployment were performed.
- TypeScript setup includes strict GAS/Jest projects, all fifteen aliases, TypeScript erasure/resolution/discovery, compiler fixtures and dependency pins. All foundation library implementations, barrels, SDK mocks and tests are TypeScript.
- Task 3 currently includes the global bridge, GoogleService/ServiceFactory, Cache/Properties/Trigger/User/Utilities/Mail/Lock services, all GasOnlineTestFramework sources/tests and the core/compiled test migrations. Other wrapper services, managers, builders, SDK and related tests remain.
- Fixed native LockService shadowing after a compiled regression demonstrated fallback to MockLock despite an available native service. Native lock identity and backend acquire/release are now tested.
- Latest checks: strict runtime/test checking and lint pass; 55 focused suites / 2,427 tests pass; testing build passes. Full offline command: 213 suites, 6,784 passing tests and the same two pre-existing ProcessState/StepState smoke failures; integration 399/399 pass; compiled tests 207/209 pass with those same failures. No lost baseline suites; one intentional discovery suite added.
- Parallel workers reached provider usage limits before Task 3; subsequent work continued inline. Detailed progress and decisions: `.superpowers/sdd/2026-10-25-glf-typescript-migration/progress.md`; machine logs: `.cache/typescript-migration/`.
- Online GAS validation, declaration consumers, final tool/online migration, documentation inventory and removal of transitional allowJs remain outstanding. Existing TriggerService legacy isDisabled call is documented locally because native GAS does not supply it.

### Execution checkpoint — 2026-10-26

Tasks 1–4 are complete in the working tree. All four data libraries and six integration suites are TypeScript; strict runtime/test checking, lint,1,846focused data tests,399integration tests and testing build pass. Compiled tests207/209 retain exactly the two pre-existing removed-library smoke failures. Task5 engines are starting; Task6 tools/docs are partially migrated, while shared harnesses, online sources, declaration consumers and final enforcement remain. No commits or deployment. See the execution ledger for precise decisions and logs.


## Implementation result — 2026-10-28

All fifteen libraries, maintained tests/harnesses, online sources and executable tools are TypeScript/CTS. Runtime, tests, tools, online and emitted-only consumer checks are strict with `allowJs: false`. Seven native JS/CJS configuration entry points remain. Existing `.js` import substitution, GAS globals, public exports and synchronous behavior are preserved. `verify:typescript` now drives the existing CI branch policy.

| Verification | Result |
| --- | --- |
| Runtime/test/tools/online and emitted-only consumer compilation | Pass; all 15 declaration roots, 240 emitted project declarations, no source fallback |
| ESLint | 0 errors, 614 retained warnings |
| Source Jest | 213 suites; 6,801 passing, 2 original failures (6,803 total) |
| Integration | 32 suites, 399 passing |
| Compiled tests after testing and production builds | 209 passing, the same 2 original failures (211 total) in each mode |
| Builds | Testing/production pass; testoffline produces both bundles and exits 1 because of the baseline assertions |
| Optional offline test bundle | 5,711,999 bytes; 207 TS test files across 15 libraries plus integration/fakes entries |
| Tool entry points | Plain/readable builds pass; watch first compile passes; emitted generator/build/docs work from another CWD; fix-db compiled only |
| Documentation | 15 full-library and 16 condensed outputs; 283 classes, 1,561 ordinary methods, 77 source accessor properties retained |
| Production artifacts | No online scripts, mock SDK modules, Jest or Faker; existing pure public specification-contract helper preserved |
| Source maps | Four representative TS classes resolve; the pre-patch offset warning is preserved and tested |

`npm run verify:typescript` retains exit 1 for the two pre-existing `ProcessState`/`StepState` assertions about the intentionally removed GasProcessMonitor library. The remaining build/bundle/docs commands were run separately after that known stop. No baseline assertion was deleted, skipped or made artificially green.

Real GAS acceptance remains outstanding: authenticated read-only access through `.clasp.json.test` returned **Requested entity was not found**. No push, deployment or real GAS test execution occurred, and the production project was not used as a fallback. No changes were staged or committed because original user edits overlap this migration.

A fresh read-only review found three Important groups: incomplete logger contracts, incomplete injected-service protocols, and omitted getter documentation. Required methods are now explicit at their consuming boundaries; narrow execution/validation protocols remain narrow. Getter/property documentation and regression fixtures were corrected. The optional bundle also now uses the maintained EnhancedTestRunner API, and the SheetDB testing SDK supplies the indexed-query methods it promises. All fixes were observed failing before implementation and verified by the full suite, retaining only the original two failures. No deferred minor findings.

The execution ledger and detailed logs remain under `.superpowers/sdd/2026-10-25-glf-typescript-migration/` and `.cache/typescript-migration/`.

### Recorded decisions and limits

- Ruling: Sandbox denied git branch creation; work in the existing checkout and preserve the baseline snapshot. Do not commit overlapping pre-existing user edits. Risk: review remains a working-tree diff.

- Task 1 Ruling: JSEP 1.4.0 ships CommonJS export= declarations under an ESM .d.ts file (TS1203). Reuse those declarations verbatim in types/vendor/jsep.d.cts via a TS-only path alias; do not weaken strictness or skip library checks. Risk: keep this copy aligned on JSEP upgrades.

- Task 1 Ruling: Preserve and report baseline failures for removed-library smoke assertions, rather than restoring removed code. Risk: aggregate test command retains its pre-existing exit 1 until stale expectations are addressed.

- Task 3 Ruling: legacy ServiceFactory setters accept partial injected replacements while getters retain default concrete service signatures, using isolated assertions in getter returns. Preserves existing setter identity/behavior; callers supplying partial overrides remain responsible for provided methods. Risk: typing cannot track mutable static replacement state.

- Task 3 Ruling: retained existing TriggerService.getTriggerInfo isDisabled call behind a local documented legacy status adapter; Google native Trigger lacks that method (https://developers.google.com/apps-script/reference/script/trigger). No runtime fix during type migration. Risk: this pre-existing path still throws on ordinary native triggers.

- Task 3 Ruling: preserve the native LockService alongside Cache/Properties, fixing compiled/native behavior to match the existing source service. Risk: production now obtains real locks instead of falsely succeeding with a mock; this is required for concurrency correctness.

- Task 3 Ruling: Google documents Utilities.jsonParse/jsonStringify as deprecated native methods, omitted from pinned upstream typings. Preserve calls with a narrow local LegacyJsonUtilities adapter, no runtime fallback/serialization change. Risk: deprecated service methods may be removed in a future GAS release.

- Task 6 independent tools started while Task 3 workers finish wrappers. Ruling: advance dependency-independent Node tools from Task 6, while group checkpoints stay sequential — avoids idle time and shares no runtime files. Risk: final tooling/online/docs acceptance still awaits all runtime groups.

- Task 6 tools progress: all executable Node tools/config implementations now CTS/TS; thin native webpack CJS loaders compile via npm build commands. Root resolution verified, tools strict compilation passes; comments compatibility transformations unchanged. Documentation erases TS in .cache/jsdoc, real JSDoc parses all15 libs, original raw comments and source paths restored. Ruling: normalize legacy JSDoc type expressions only in parser cache and restore originals in output because installed JSDoc grammar rejects existing TS-style tags; risk: parser type metadata is intentionally opaque, displayed raw signatures retain originals. Final inventory enforcement pending; replacing regex fallback removes false class/method matches from prose/control flow.

- Task 5 Ruling: begin dependency-independent Template/Expression source group while Task4 integration/final gates finish, because its actual dependencies are already-complete Core/Google wrappers, not pending test fixtures. Risk: whole-project acceptance still waits for every group; keep Task4 checkpoint unmarked until its gates finish.

- Task 4 Ruling: preserve registry-only string iteration tokens in existing runtime validation fixtures with narrowly described expected type errors; execution-facing iteration contracts require executable level methods. Risk: registry still validates only the array, so legacy JavaScript callers can store invalid executable levels, as before.

- Task 5 Ruling: split the planned engines.ts fixture among template-expression.ts,pipeline-context.ts,composition.ts,roles.ts — each owned contract remains independently checked by the same strict project. Risk: acceptance depends on the project including every fixture, now pinned by completion inventory.

- Task 5 Ruling: preserve ContentComposer.validateRecipe calling the absent legacy hasRenderer method via a narrow optional protocol assertion — annotation does not silently repair the pre-existing API mismatch. Risk: this existing validation path can still throw with the standard RendererRegistry.

- Task 6 Ruling: preserve original online UtilitiesService.formatDate call despite only formatDateNative existing, and legacy ignored deleteFiles trash option — no unrelated behavior repair. Risk: the original formatDate online case remains failing when real GAS can run; trash operation retains its existing default.

- Task 6 Ruling: public emitted-only fixture is excluded from source-alias runtime/test projects and compiled solely by tsconfig.consumer.json — source aliases would hide declaration-delivery failures. Risk: consumer compilation must remain in verify:typescript (it is).

- Task 6 GAS gate: read-only local clasp status confirms exactly Code.js,appsscript.json and7onlinefiles for .clasp.json.test. Authenticated remote deployments lookup returns 'Requested entity was not found' (gas-test-project-access.log). No push/deploy/run and no production fallback. Ruling: leave real GAS acceptance explicitly outstanding because the configured test project is unavailable; risk: native-runtime regressions cannot be ruled out offline.

- Final Ruling: QueryCacheService.removeAll remains an optional legacy capability — standard injected cache supports get/put, while existing invalidation calls native removeAll without required keys. Requiring that invalid native signature globally would reject valid ordinary caching. Isolated existing assertion and shortcut comment remain; risk: existing invalidateTable operation can still throw and needs a separate cache-invalidation repair.

- Final Ruling: injected loggers now require debug, while original console defaults use the established local Console intersection adapter — pinned GAS Console omits the legacy debug member. Risk: real GAS must validate this pre-existing console-default behavior; no runtime fallback silently introduced.

- Final Ruling: portable offline test runner adaptation and missing SheetSDK indexed-query helpers are necessary migration acceptance fixes — they change test-only runtime support, not production data behavior. Risk: portable GAS execution remains unverified until test-project access returns; hooks/skips and indexed-query regressions cover local behavior.

- Final compatibility limit: the pre-existing portable `describe.skip` only labels the suite; it does not set each collected test's skip flag. That unrelated behavior remains unchanged. The new runner regression covers the existing `it.skip(name)` flag and hook forwarding. Real execution of the optional GAS bundle remains unverified.
