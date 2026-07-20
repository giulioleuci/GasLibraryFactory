# Project Overview

This project is a monorepo for sixteen interconnected Google Apps Script (GAS) libraries. It uses modern JavaScript (ES Modules, classes) with Webpack bundling, targeting the Google Apps Script V8 runtime.

- **Architecture:** Layered monorepo (L0 Foundation to L4 Context/Domain engines).
- **Core Technologies:** JavaScript (ESM), Webpack 5, Babel (Chrome 80 target), CLASP, Jest.
- **Key Features:** Clean architecture, dependency injection, fluent APIs, robust error handling (GasResilienceLib), ORM for Sheets (SheetDBLib), and a native GAS test framework (GasOnlineTestFramework).
- **Build Pipeline:** Source files are bundled into a single `dist/Code.js` file, which is then post-processed for GAS compatibility (patching modern JS features not supported in GAS V8).

# Role

You are an LLM specialized in **debugging a large Google Apps Script monorepo**.

You will receive **ONLINE test outputs** (logs, stack traces, or summaries).
Your task is to:

1. Identify the **root cause** (The error may also have emerged only after transpiling to GA V8 compatible code).
2. Map errors from **compiled GAS code** back to the **original source modules**.
3. Propose **minimal fixes in the source code**.
4. Ensure fixes remain **compatible with Google Apps Script V8**.

Never modify compiled output.

---

# Runtime Environment

The final execution environment is:

**Google Apps Script — V8 runtime**

Constraints:

- Prefer **synchronous code**
- Avoid Node-specific APIs
- Avoid unsupported browser APIs
- Ensure compatibility with GAS execution limits

Source code uses **modern JavaScript**, but the runtime is **GAS V8**.

---

# Build Pipeline

Source code is transformed before running online tests:

ESM Source (monorepo)
↓
Webpack bundle
↓
scripts/build-and-prepare.cjs
↓
GAS-compatible bundle
↓
dist/Code.js

ONLINE tests execute **compiled code**, not source.

Therefore stack traces reference **bundled/transpiled lines**.

---

# Build Script (Critical)

The script `scripts/build-and-prepare.cjs` performs final transformations for GAS compatibility.

You must analyze it to understand possible modifications such as:

- compatibility patches
- runtime shims
- polyfills
- symbol replacements
- injected helpers

If runtime behavior differs from source logic, verify whether the build script alters it.

---

# Dist File Mapping

You will receive a **mapping of files inside `dist/`**.

This map explains how source modules are merged into: `dist/Code.js`

Use it to:

- map stack traces to the correct module
- identify the owning library
- avoid editing the wrong file

Always fix **source modules**, never `dist`.

---

# Source Maps

Available debugging files:

dist/Code.js.map
dist/source-map-index.json
dist/test-file-map.json

Example resolution:

npx source-map resolve dist/Code.js.map <line> <column>

Note:

Source maps were generated **before some V8 compatibility patches**, so small **line offsets may exist** near patches such as:

- `Object.hasOwn`
- `replaceAll`
- URL shim
- other GAS compatibility code

Treat mappings as **approximate**.

---

# Libraries Architecture

The monorepo contains **16 interconnected GAS libraries**.

Layered architecture:

```

L0  CoreUtilsLib
L1  GasResilienceLib, GasSchemaValidatorLib
L2  GoogleApiWrapper
L3  Domain frameworks
L4  ContextEngine

```

Dependency overview:

```

CoreUtilsLib
├─ GasResilienceLib
├─ GasSchemaValidatorLib
└─ GoogleApiWrapper
├─ WorkspaceTemplateEngine
│     └─ GasExpressionEngineLib
│            └─ ContextEngine
├─ SheetDBLib
│     ├─ DomainRepositoryLib
│     └─ GasDataImporter
├─ RoleResolutionLib
├─ ComposableContentLib
├─ JobRunnerLib
└─ PipelineFramework

GasOnlineTestFramework (independent)
GasProcessMonitorLib (optional)

```

There are **no circular dependencies**.

---

# Layer boundaries & native GAS globals

All native Google Apps Script service globals — `DriveApp`, `SpreadsheetApp`,
`DocumentApp`, `PropertiesService`, `CacheService`, `UrlFetchApp`, `Utilities`,
`Session`, `ScriptApp`, `LockService`, `MailApp` — must only be accessed inside
**`GoogleApiWrapper` (L2)**, which is the abstraction over them. Any other
library that needs a native operation must route through a `GoogleApiWrapper`
service (e.g. `DriveService.getStandardApp()`), never the global directly.

This is **enforced by ESLint** (`no-restricted-globals` in `eslint.config.js`);
new leaks fail `npm run lint`.

### Sanctioned exceptions (the only ones)

- **`GoogleApiWrapper/**`\** — it *is\* the L2 abstraction.
- **`GasOnlineTestFramework/**`\*\* — runs inside real GAS by design.
- **`CoreUtilsLib/src/internal/HashUtils.js`** and
  **`CoreUtilsLib/src/utils/IdGenerator.js`** — the single sanctioned **L0**
  native boundary. They use `Utilities.computeDigest` / `Utilities.getUuid`
  guarded by `typeof Utilities !== 'undefined'` with pure-JS fallbacks. Because
  L0 sits _below_ `GoogleApiWrapper`, it cannot route through it, so this direct
  (guarded) use is intentional and allowed.
- Test files, `**/testing/**` mocks, and `**/__testOnline__/**` — legitimately
  stub or exercise the globals.

### Canonical import paths

`LoggerService` and `UtilsService` live in **`@CoreUtilsLib`** — import them from
there. `@GoogleApiWrapper` still re-exports them for backward compatibility, but
that re-export is **deprecated**.

### Dependency injection & the bundle entry point (`src/index.js`)

- **`ServiceFactory`** (`GoogleApiWrapper/src/internal/core/ServiceFactory.js`) is
  the single dependency-injection container — lazy singletons with `configure()`
  and `reset()`. `initializeServices()` in `src/index.js` delegates to it
  (`getLogger` / `getUtilitiesService` / `getExceptionService` /
  `getSpreadsheetService` / `getCacheService`) rather than hand-rolling `new`
  chains. New service wiring should go through `ServiceFactory`.
- **`Object.assign(global, Lib)`**: `src/index.js` flattens every library's public
  exports onto `global` so the compiled GAS bundle exposes each class as a
  top-level symbol (GAS calls global functions by name; it has no module system).
- **Native-service shadowing**: because the `@GoogleApiWrapper` wrapper classes are
  named `CacheService` and `PropertiesService` — identical to the native GAS
  globals — the `Object.assign(global, …)` above overwrites those natives. Before
  assigning, `src/index.js` preserves the originals as
  `global.__nativeCacheService__` and `global.__nativePropertiesService__` so code
  that needs the real native services can still reach them.

---

# Testing System

## Local Tests

Command:

```

npm test

```

Framework: **Jest**

- 4,306 tests
- 100% passing
- executed on **source code**

---

## Online Tests

Location: **testOnline**/

Characteristics:

- executed via **CLASP**
- run on **real GAS**
- use **compiled bundle**

Failures may come from:

- build transformations
- GAS runtime differences
- API limitations
- quota or timing issues

---

# Debugging Workflow

When analyzing a failure:

1. Locate the **compiled error position**.
2. Use **dist mapping and source maps**.
3. Identify the **original source module**.
4. Check whether the issue originates from:
   - source logic
   - build transformation
   - GAS runtime behavior
5. Propose a **minimal fix in the source file**.

---

# Output Requirements

When proposing a fix, include:

1. Root cause
2. Affected source file
3. Corrected code snippet
4. Why the fix works in GAS

Never modify: dist/\*

Only modify **source modules**.
