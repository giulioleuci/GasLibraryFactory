# GasLibraryFactory: dependency and test report

Date: 2026-07-19
Scope: `GasLibraryFactory/` only. This is a separate package from parent
`ALDO implementing/` project. Direct dependencies only; transitive packages
are locked by `GasLibraryFactory/package-lock.json` and are not individually
assessed.

## Evidence and method

- Graph: `home-giulio-Desktop-ALDO-implementing-GasLibraryFactory`, already
  indexed: 606 files, 6,617 nodes, 15,605 edges. Graph import/call edges were
  used to trace local test targets and library facades.
- Declared ranges: `GasLibraryFactory/package.json`; installed versions:
  `npm ls --depth=0 --json`.
- Latest versions: live `npm outdated --json`, queried 2026-07-19. `npm` exits
  1 when stale packages exist; that is expected, not a failed check. A direct
  package absent from that output is at its latest version.

## Dependency topology

Production runtime dependencies form five repository-owned boundaries:

- `es-toolkit/compat`: `CoreUtilsLib/src/facades/LodashFacade.js` imports and
  re-exports complex utility operations, while several simpler operations and
  the string-case helpers are local implementations.
- `fuse.js`: `SheetDBLib/src/TableSearchEngine.js` constructs Fuse instances
  after local argument validation and option assembly.
- `jsep`: `GasExpressionEngineLib/src/internal/parser/AstBuilder.js` configures
  local `in` and `match` grammar operators before parsing.
- `zod`: `GasSchemaValidatorLib` exports/uses `z`; `SheetDBLib` accepts Zod
  schemas through local validation and error translation.
- `he`: declared for WorkspaceTemplateEngine HTML escaping, but no direct
  repository import/use was found. Treat it as a candidate unused dependency,
  subject to a clean-install/build check before removal.

Build/test toolchain is Webpack 5 + Babel targeting Chrome 80/GAS V8,
`gas-webpack-plugin`, Jest/Babel-Jest, ESLint flat config, Prettier, and JSDoc.
The package requires Node >=18 and npm >=9. That Node floor is material for
the newest major lint/CLI releases.

## Direct package status

`Installed` is lockfile/node_modules state, not lower bound written in the
caret range. “No source change” still requires lockfile refresh plus relevant
build/test validation.

| Package | Installed | Latest | Latest now? | Latest adoption: code change and principal risk |
|---|---:|---:|---|---|
| `@babel/core` | 7.28.5 | 8.0.1 | No | No: latest major requires Node `^22.18.0 || >=24.11.0` and conflicts with retained Babel 7 proposal plugins. Retain the Babel 7 line; do not treat a non-latest 7.x patch as the requested latest update. |
| `@babel/plugin-proposal-class-properties` | 7.18.6 | 7.18.6 | Yes | Already latest. It is unused: webpack configuration relies on `preset-env`; build documentation says these deprecated plugins were removed. Prefer separate dependency-removal change, not an upgrade. |
| `@babel/plugin-proposal-object-rest-spread` | 7.20.7 | 7.20.7 | Yes | Same: latest but unused/deprecated. Candidate removal after build check. |
| `@babel/preset-env` | 7.29.2 | 8.0.2 | No | No: latest major has the same Node 22+ floor and Babel 7 plugin conflict as `@babel/core`. Retain the Babel 7 line. |
| `@eslint/js` | 9.39.2 | 10.0.1 | No | Possible, coupled with `eslint` 10. Current flat config should be close, but major upgrade may require Node >=20 and rule/config adjustments. Run `npm run lint`; do not upgrade it alone. |
| `@faker-js/faker` | 10.1.0 | 10.5.0 | No | Yes; no expected source change. Used only as data generator in `DomainRepositoryLib/src/__tests__/Entity.test.js`; risk is generated-data/API drift. |
| `@google/clasp` | 2.5.0 | 3.3.0 | No | Possible; no application source change expected, but major CLI/auth/project-file behaviour can change. Validate `clasp status`, a non-production push, and each project setup script. |
| `babel-jest` | 30.2.0 | 30.4.1 | No | Yes; update in lockstep with Jest. Run normal, integration, and offline Jest suites. |
| `babel-loader` | 9.2.1 | 10.1.1 | No | Possible with Webpack 5. Major loader/Node support change may require Node runtime upgrade; rebuild production and offline-test bundles. |
| `eslint` | 9.39.2 | 10.7.0 | No | Possible, coupled with `@eslint/js` 10. Same Node-major and flat-config/rule compatibility risk. |
| `eslint-config-prettier` | 10.1.8 | 10.1.8 | Yes | Already latest. |
| `eslint-plugin-jest` | 29.12.1 | 29.15.4 | No | Yes; no expected config change. Validate local Jest rule names against installed Jest 30. |
| `eslint-plugin-prettier` | 5.5.5 | 5.5.6 | No | Yes; no source change expected. `npm run lint` may expose formatting-rule changes. |
| `es-toolkit` | 1.43.0 | 1.49.0 | No | No: `compat`'s latest `cloneDeep` Error-object path emits `structuredClone()`, which fails the repository's GAS V8 bundle compatibility test. Retain 1.43.0 until upstream removes that runtime requirement or the project supplies a verified source-level compatibility path. |
| `fuse.js` | 7.1.0 | 7.5.0 | No | Yes; no expected source change. Re-run `TableService` fuzzy-search tests because returned score/match details are exposed by local API. |
| `gas-webpack-plugin` | 2.6.0 | 2.6.0 | Yes | Already latest. It controls GAS global export generation; retain offline bundle tests. |
| `glob` | 13.0.6 | 13.0.6 | Yes | Already latest. Used by webpack plugin code to discover/copy online `.gs` tests. |
| `he` | 1.2.0 | 1.2.0 | Yes | Already latest, but no direct import/use was found (only documentation describes it). Prefer separate removal investigation; clean-install/build must prove no indirect requirement. |
| `jest` | 30.2.0 | 30.4.2 | No | Yes, paired with `babel-jest`. No expected code change; run all Jest configurations. |
| `jsdoc` | 4.0.5 | 4.0.5 | Yes | Already latest. |
| `jsdoc-api` | 9.3.5 | 9.3.6 | No | Yes; `scripts/generate-docs.js` imports it. No expected API change, but regenerate/diff documentation. |
| `jsdoc-to-markdown` | 8.0.3 | 9.1.3 | No | Possible, but major update needs docs-script/CLI validation. No direct repository import was found; first confirm whether it is intentionally retained. If used externally, v9 templates/Node support may be breaking. |
| `jsep` | 1.4.0 | 1.4.0 | Yes | Already latest. Local `AstBuilder` extends its grammar, so changes would require parser regression tests. |
| `prettier` | 3.7.4 | 3.9.5 | No | Yes; no code change. Run formatting check; output-only diff risk. |
| `webpack` | 5.104.1 | 5.108.4 | No | Yes; no expected source change. Build both `Code.js` and `TEST_OFFLINE_Bundle.gs`. |
| `webpack-cli` | 5.1.4 | 7.2.1 | No | Possible. Major CLI/Node compatibility risk; scripts use `webpack`, `webpack --watch`, and `--env readable`. Validate all script invocations and possibly raise Node floor. |
| `zod` | 4.2.1 | 4.4.3 | No | Yes; no expected source change within v4. Re-run SchemaValidator and SheetDB schema tests; `z` is part of package export surface. |

### Upgrade order

1. Safe latest batch: Faker, Babel-Jest/Jest together, lint plugins,
   Fuse, JSDoc API, Prettier, Webpack, and Zod.
2. Independently validate major candidates: ESLint + `@eslint/js` 10,
   clasp 3, babel-loader 10, jsdoc-to-markdown 9, webpack-cli 7. Confirm their
   Node engine requirements before changing `engines.node`; current package
   promises Node 18 support.
3. Remove, rather than upgrade, unused Babel proposal plugins; investigate
   unused `jsdoc-to-markdown` before retaining a major-version dependency.

## Recommended validation for future dependency changes

```bash
cd GasLibraryFactory
npm run lint
npm test
npm run test:integration
npm run build:testoffline
npx jest --config jest.offline.config.cjs
npm run build:production
```

## Where `es-toolkit/compat` can be used more consistently

`CoreUtilsLib/src/facades/LodashFacade.js` is the intended single import
boundary for the complex `es-toolkit/compat` operations already shipped in the
bundle (`cloneDeep`, `merge`, `groupBy`, `isEqual`, case conversion, and more).
The graph also finds parallel local implementations in
`CoreUtilsLib/src/utils/StringUtils.js`,
`CoreUtilsLib/src/utils/SystemScriptSettings.js`, and
`CoreUtilsLib/src/builders/ConfigMergeStrategy.js`. New callers should use the
facade for complex collection/object operations instead of adding another
ad-hoc implementation or a direct `es-toolkit/compat` import. In particular,
centralising deep clone/equality/merge avoids divergence around Dates, arrays,
and nested objects; centralising case conversion keeps identifiers consistent.

Keep the facade's deliberate hybrid split: its tiny null-safe primitives
(`compact`, `flatten`, `uniq`, type predicates) should remain native rather
than importing a library implementation solely for consistency. Any facade
expansion must retain its named-export design and pass the GAS build, because
the post-processor contains an explicit fallback for es-toolkit Unicode case
patterns that GAS V8 may not support.

The graph-backed consolidation recommendation does not imply upgrading to
`es-toolkit` 1.49.0 today. Offline bundle verification shows that version's
`cloneDeep` Error branch emits `structuredClone()`, so the dependency remains
pinned to the last GAS-compatible release (1.43.0) pending an upstream fix or
a separately tested source-level compatibility solution.

## Where `fuse.js` can be used but is not yet exposed

`SheetDBLib/src/TableSearchEngine.js` already owns `Fuse` construction and
`TableService.fuzzySearch()` delegates to it. The graph also shows the advanced
query path (`SheetDBLib/src/query/AdvancedQueryBuilder.js` and its internal
query builders) as a separate filter surface. Add an explicit opt-in fuzzy
text predicate there (for example, a `fuzzyWhere` operation) rather than
silently changing the exact-match semantics of `where`/`filter`. It can reuse
`TableSearchEngine` so threshold, keys, score ordering, and index invalidation
remain in one place.

Fuzzy matching should occur only after the table's bounded row set is loaded;
it must not replace server-side Drive or Sheets filtering with a full remote
scan. Preserve an exact-search option and document the returned ranking/score,
because Fuse result ordering is a public observable result and can increase GAS
execution time for large sheets.

## Where `jsep` can be used but is not yet the parsing boundary

`GasExpressionEngineLib/src/internal/parser/AstBuilder.js` already extends
JSEP grammar and `GasExpressionEngineLib` evaluates an allowlisted AST. The
graph identifies independent condition/expression parsers in
`ContextEngine/src/internal/ContextStepExecutor.js`,
`ComposableContentLib/src/internal/VisibilityEvaluator.js`,
`GasDataImporter/src/internal/transform-managers/TransformerMappingEngine.js`,
and `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorTagScanner.js`.
Where these accept a user-authored expression string, route parsing through the
expression engine/JSEP boundary instead of adding another string parser.

This is a parser and validation reuse, not permission to evaluate JavaScript:
accept only the AST node types, member paths, operators, and functions that the
existing evaluator explicitly allows. Reject unsupported syntax before
evaluation, cache only parsed ASTs with bounded keys, and retain synchronous
execution for GAS V8.

## Where `zod` can be used but manual shape checks remain

`GasSchemaValidatorLib/src/SchemaValidator.js` already provides Zod error
formatting and translation, while `SheetDBLib/src/TableSchemaValidator.js`
accepts schemas at a table boundary. Additional public configuration/data
boundaries still perform bespoke checks, notably
`CoreUtilsLib/src/ValidationUtils.js`, the SheetDB dynamic-column schema
resolver/template path, and recipe/configuration constructors across the
domain libraries. Define reusable Zod schemas at those external boundaries and
pass their failures through `SchemaValidator.toValidationException()` (or the
library's existing domain error type) rather than leaking raw Zod errors.

Do not replace invariant/domain validation that requires repository state,
native-service calls, or business policy; Zod should validate pure input shape
and coercion before those steps. Keep Zod imports behind library boundaries and
run the GAS build after changes: `build-and-prepare.cjs` already rewrites a Zod
Unicode emoji regular expression for GAS V8 compatibility.

## Where `he` can be used but HTML escaping is duplicated

`he` is declared but not imported by repository source. The graph finds three
separate manual escaping implementations: `HtmlSanitizer.escapeHtml()` in
`CoreUtilsLib/src/utils/HtmlSanitizer.js`,
`CapturingLogger._escapeHtml()` in
`JobRunnerLib/src/internal/CapturingLogger.js`, and
`MyMustache._escapeHtml()` in
`WorkspaceTemplateEngine/src/facades/Mustache.js`. Create a small
CoreUtils-owned adapter around `he.escape()` (and, when needed, `he.decode()`),
then make those rendering/logging paths delegate to it. This removes repeated
entity maps and gives consistent handling for quotes, apostrophes, named
entities, and non-ASCII code points.

Preserve the existing null-to-empty-string contract in `HtmlSanitizer`, escape
only HTML text/attribute values (not URLs, CSS, or raw trusted markup), and
keep `safeUrl`/`safeColor` validation separate. Test rendered output for all
five HTML-sensitive characters before replacement and validate the generated
bundle, since the implementation runs in GAS V8 rather than Node at runtime.
