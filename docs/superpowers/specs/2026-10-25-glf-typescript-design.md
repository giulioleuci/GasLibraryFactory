# GLF TypeScript Migration Design

Status: proposed implementation scope; this request authorizes planning only.

## Intent

Convert the whole maintained GLF codebase to TypeScript, reuse Google's API types wherever available, and preserve the existing synchronous Google Apps Script behavior. Deliver one English implementation plan with six substantial tasks. Group mechanical work; retain separate checks for changes that could affect native services or stored data.

## Current repository

- Fifteen active libraries, ESM source, Webpack 5, Babel 7, Jest 30, and CLASP. No existing TypeScript configuration or direct TypeScript dependency.
- The current working tree contains 456 tracked `.js`, 7 `.gs`, and 11 `.cjs` files that still exist on disk. These are inventory observations, not immutable acceptance counts; several tracked files are already deleted locally.
- Existing uncommitted work is the starting state. In particular, `GasProcessMonitorLib` is being removed; do not restore it or the deleted shared online-test utilities.
- `src/index.js` flattens the fifteen public barrels onto `global`, preserves native Cache/Properties services, and exposes `initializeServices()` through `ServiceFactory`.
- `scripts/build-and-prepare.cjs` patches the bundle after source maps are generated: `Object.hasOwn`, literal `replaceAll`, Unicode regexes, and a minimal URL shim. Keep this behavior and the existing source-map-offset warning.
- JavaScript-only discovery exists in both Webpack configs, three Jest configs, ESLint, offline-test entry generation, and documentation generation. The offline generator also has an explicit library list that must cover all fifteen libraries, including `GasSchemaValidatorLib`.

## Approaches considered

| Approach | Tradeoff |
| --- | --- |
| Rename everything at once and repair the errors afterward | Compact checklist, but leaves a large broken tree and conceals unsafe casts. |
| Migrate by dependency order while retaining Webpack/Babel | Recommended: reuses the current runtime pipeline and gives each contract change a useful verification gate. |
| Replace the bundler, test transformer, and deployment workflow during migration | Adds independent failure modes without being required for TypeScript. |

The second approach is the author's recommendation, not a claim of prior user approval. Do not split this single migration into fifteen separate plans or a task per file.

## Scope and completion

- Convert implementations, barrels, shared contracts, mocks, test fixtures, and unit/integration/offline tests across all fifteen libraries and `src/`/`test/` to `.ts`.
- Convert the seven maintained online test sources from `.gs` to `.ts`; produce separate plain `.gs` deployment artifacts with the same names and GAS-callable functions as today.
- Convert handwritten executable Node tools to `.ts` or `.cts`: the build preparer, both documentation generators, offline-test entry generator, `fix-db`, and the comment-stripping Webpack plugin.
- Keep native tool configuration entry files in their supported `.cjs`/`.js` formats, plus shell scripts, JSON manifests and Markdown. They are explicit format exceptions, not unconverted application modules. The two Webpack entry files become thin loaders of typed `.cts` implementations, including their inline test-copy/emission logic; the other native config files remain declarative configuration.
- At completion every maintained executable source is covered by a strict TypeScript project. There are no handwritten `.js`/`.gs` application modules or `.cjs` tool implementations left outside those exceptions.
- Generate public module declarations from the TypeScript barrels, without publishing a new npm package or inventing a new GAS global API.

## Global Constraints

- Preserve public runtime names, constructor behavior, sync return values, export ordering, serialized data, validation, retries, quotas and cleanup behavior.
- Keep Webpack/Babel, the Chrome 80 build target, `gas-webpack-plugin`, CLASP deployment modes and the V8 post-processing pipeline.
- Never hand-edit `dist/*`; change maintained sources and regenerate artifacts only.
- Native GAS operations stay inside `GoogleApiWrapper`, `GasOnlineTestFramework`, the sanctioned guarded `HashUtils`/`IdGenerator` boundary, and tests. Type-only references do not authorize new runtime dependencies.
- Import `LoggerService` and `UtilsService` from `@CoreUtilsLib`; preserve deprecated runtime re-exports for consumers.
- Reuse upstream API declarations; write local types only for GLF contracts or a documented upstream gap.
- No new runtime dependencies, generated service wrappers, async rewrites, persistence migrations, or unrelated refactors.
- Preserve all pre-existing user changes; never stage or commit unrelated files.

## Type and build policy

Use `@types/google-apps-script@2.0.13`, the currently published stable v2 typings distributed through DefinitelyTyped, rather than describing them as a wholly Google-authored package. They include native service interfaces and Advanced Service schemas. Use the declaration namespace actually present in that pinned version, and the API version enabled in `appsscript.json`. Do not install the Node `googleapis` client in GAS. Do not adopt the announced breaking v3 namespace transition as part of this migration.

Use TypeScript 5.9.3, which supports the repository's Node 18 baseline. Keep Babel 7 and add its TypeScript preset for erasure; run `tsc` separately for checking. Keep existing `.js` relative module specifiers, resolving them to `.ts` using TypeScript's substitution, Webpack `extensionAlias`, and Jest's relative-extension mapper. Keep all fifteen aliases aligned, including subpaths.

Separate GAS runtime, Jest, Node tooling, online-script, and declaration projects. Use `strict: true` from the first converted module. Permit mixed JS/TS only during migration; remove `allowJs` at the final gate. Do not use blanket `any`, `@ts-ignore`, `@ts-nocheck`, wildcard module declarations, or weakened compiler flags as migration completion. Preserve upstream `any` where upstream signatures require it; narrow external data with existing validation and guards. Use `declare` for added type-only class fields so the emitted object shape does not change.

Account explicitly for public `testing` re-exports: production Webpack replaces their implementations with `test/fakes/empty-mocks`. Retain that replacement and typed SDK exports without bundling Jest or Faker into `Code.js`. Node and Jest types must not become the platform contract for GAS code; no DOM library to disguise the limited URL shim.

Type Node tools with a dedicated emitting configuration targeting `.cache/ts-tools/`, preserving their relative folder layout. Keep npm command names stable and point them to compiled tools. The emitted tools must locate the actual repository, Webpack configs and source directories independently of the caller's current directory. Native config entry points may load the compiled typed plugin. No additional TypeScript runtime loader is needed.

Compile online sources individually as scripts with Babel's existing GAS target. Keep global runner declarations and each callable function; do not bundle each online file as an isolated module or emit `import`, `export`, `require`, or CommonJS helpers. Type-only `import()` queries in ambient declarations can reference module exports. Use function-local typed aliases for wrapper constructors that shadow native Cache/Properties/Lock services, rather than redeclaring Google's native globals. Preserve the existing test-file naming and source mapping, now pointing to `.ts` sources.

Feed the documentation generator comment-preserving JavaScript transpiled from TypeScript with the installed Babel tooling. This lets the existing JSDoc parser keep working without relying on its regex fallback to parse TypeScript signatures. Retain source paths and verify each library's documented symbols do not disappear.

## Verification and release boundary

Capture current test discovery, failures, exports and online entry points before implementation. Every migration group must preserve that baseline, add small compile-time consumer fixtures for its public contracts, and pass its source tests plus a compiled-bundle smoke check. Runtime regression tests are needed for changed emission or behavior, not for each annotation.

Final acceptance includes strict checking, generated-declaration consumer checks, lint, source/integration tests, all three build modes, patched bundle tests, offline-test discovery parity, source-map checks, documentation parity and real GAS online tests in a test project. Local success cannot certify GAS behavior. Preserve production/test exclusions and never deploy test artifacts to production.

Planning does not install dependencies, execute migrations, commit, push, deploy, run `fix-db`, or execute online tests. Before any later deployment or online execution, use the project's configured test environment and its normal authorization; report unavailable credentials as an outstanding runtime validation gate.

## References checked on 2026-10-25

- [Published GAS typing versions](https://www.npmjs.com/package/%40types/google-apps-script?activeTab=versions) and [upstream declarations](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/google-apps-script).
- [GAS typing v3 transition proposal](https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/74297).
- [TypeScript 5.9.3 package and Node engine requirement](https://github.com/microsoft/TypeScript/blob/v5.9.3/package.json).
- [Babel TypeScript erasure and class-field behavior](https://babeljs.io/docs/babel-preset-typescript).
- [Webpack extension aliases](https://webpack.js.org/configuration/resolve/#resolveextensionalias), [Jest with TypeScript](https://jestjs.io/docs/getting-started#using-typescript), and [TypeScript compiler options](https://www.typescriptlang.org/tsconfig/).
