# Build and Deploy Guide

The build pipeline has three stages:

1. **Webpack bundling** — ES Modules are bundled into a single `dist/Code.js`
2. **GAS V8 post-processing** — The bundled output is patched and validated for GAS compatibility
3. **CLASP deployment** — The `dist/` directory is pushed to Google Apps Script

The script `scripts/build-and-prepare.cjs` orchestrates the first two stages.

## Build Modes

### Production (`--mode=production`)

**Use for**: Deploying to production GAS projects or publishing libraries.

| Aspect       | Detail                                   |
| ------------ | ---------------------------------------- |
| Code.js      | Minified via Terser, no comments         |
| GAS patches  | Applied automatically                    |
| Online tests | Excluded                                 |
| Output       | `Code.js` + `appsscript.json` (~815 KB)  |
| Command      | `npm run build:production`               |

### Testing (`--mode=testing`)

**Use for**: Development, debugging, and running online tests in GAS.

| Aspect       | Detail                                                         |
| ------------ | -------------------------------------------------------------- |
| Code.js      | Non-minified, readable, comments stripped                      |
| GAS patches  | Applied automatically                                          |
| Online tests | Included by default (disable with `--online-tests=false`)      |
| Output       | `Code.js` + `appsscript.json` + `TEST_*.gs` (~2,500 KB total) |
| Command      | `npm run build:testing`                                        |

### Testoffline (`--mode=testoffline`)

**Use for**: Build validation — confirms the bundle is correct before deployment.

| Aspect          | Detail                                                   |
| --------------- | -------------------------------------------------------- |
| Code.js         | Non-minified, readable, comments stripped                |
| GAS patches     | Applied automatically                                    |
| Online tests    | Excluded                                                 |
| Offline tests   | Runs unit tests, integration tests, and bundle validation |
| Output          | `Code.js` + `appsscript.json` (not for deployment)      |
| Command         | `npm run build:testoffline`                              |

## Unified Webpack Configuration

A single `webpack.config.cjs` supports both minified and readable builds:

| Flag              | Effect                          |
| ----------------- | ------------------------------- |
| (default)         | Minified via Terser             |
| `--env readable`  | Non-minified, comments stripped |

The build orchestrator (`build-and-prepare.cjs`) automatically selects the correct flags:
- **Production** → `npx webpack --mode production`
- **Testing / Testoffline** → `npx webpack --mode production --env readable`

### GAS-Specific Plugin Configuration

**gas-webpack-plugin** is configured with `autoGlobalExportsFiles: []`. This means:

- Only functions explicitly assigned to `global` in `src/index.js` (via `global.functionName = ...`) get top-level function stubs visible in the GAS editor dropdown
- Library classes and exports are available globally through `Object.assign(global, LibraryName)` but do NOT produce unnecessary function stubs
- Result: clean function picker with only callable entry points (`initializeServices`, `exampleUsage`)

### Babel Configuration

Webpack uses `@babel/preset-env` targeting Chrome 80 (GAS V8 runtime). This target preserves:
- ES6 classes (native `class` syntax)
- Arrow functions, template literals, destructuring
- `const`/`let`, spread/rest operators
- Optional chaining `?.`, nullish coalescing `??`
- All Chrome 80-compatible features

Deprecated Babel plugins (`@babel/plugin-proposal-class-properties`, `@babel/plugin-proposal-object-rest-spread`) have been removed from the webpack babel-loader since Chrome 80 natively supports both features.

## Build Pipeline Steps

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Step 1 — Clean dist/                                                        │
│  Step 2 — Webpack build (minified or readable)                               │
│           └─ CopyOnlineTestsPlugin copies __testOnline__/**/*.gs to dist/    │
│           └─ Duplicate TEST___testOnline___*.gs files are removed            │
│  Step 3 — Copy appsscript.json (validates runtimeVersion: V8)                │
│  Step 4 — GAS V8 compatibility post-processing                              │
│           ├─ Auto-fix Object.hasOwn() → hasOwnProperty.call()                │
│           ├─ Auto-fix .replaceAll() → .split().join()                        │
│           ├─ Auto-fix es-toolkit CASE_SPLIT_PATTERN (Unicode regex)          │
│           ├─ Auto-fix Zod emoji regex (Unicode property escapes)             │
│           ├─ Auto-inject URL constructor shim (if new URL() detected)        │
│           ├─ Scan for other GAS-incompatible patterns (warnings)             │
│           └─ Validate file size against GAS limits                           │
│  Step 5 — Configure deployment (remove/keep tests, generate .claspignore)    │
│  Step 6 — [testoffline only] Run unit + integration + bundle validation      │
│  Step 7 — Summary (file listing, sizes, patch count)                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Step 4 — GAS V8 Compatibility Post-Processing

The bundled `Code.js` may contain code from external npm dependencies (e.g. `es-toolkit`, `zod`) that was **not transpiled by Babel** — because `node_modules` is excluded from `babel-loader`. Some of these dependencies ship ES2021/ES2022+ syntax or Web API features unavailable in the GAS V8 runtime (Chrome ~80).

#### Automatic Fixes

| # | Pattern | Replacement | Source | Reason |
|---|---------|-------------|--------|--------|
| 1 | `Object.hasOwn(obj, key)` | `Object.prototype.hasOwnProperty.call(obj, key)` | es-toolkit | ES2022 (Chrome 93+), not in GAS V8 |
| 2 | `.replaceAll("str", repl)` | `.split("str").join(repl)` | (any) | ES2021 (Chrome 85+), not in GAS V8 |
| 3 | es-toolkit `CASE_SPLIT_PATTERN` | Try/catch IIFE with ASCII fallback | es-toolkit | Unicode emoji property escapes cause `SyntaxError` at parse time |
| 4 | Zod emoji validation regex | Unicode code-point ranges | zod | `\p{Extended_Pictographic}` may not be supported in GAS V8's ICU build |
| 5 | `new URL()` constructor | Minimal URL shim prepended to Code.js | CoreUtilsLib, zod | The `URL` Web API class does not exist in GAS V8 |

#### Warning-Only Scans

| Pattern | Reason |
|---------|--------|
| `crypto.getRandomValues()` | Not available in GAS (use `nanoid/non-secure`) |
| `structuredClone()` | ES2022 (Chrome 98+) |
| `.at(-1)` (Array/String `.at()`) | ES2022 (Chrome 92+) |
| `.findLast()` / `.findLastIndex()` | ES2023 (Chrome 97+) |
| `Promise.any()` | ES2021 (Chrome 85+) |
| Logical assignment (`??=`, `\|\|=`, `&&=`) | ES2021 (Chrome 85+) |

#### File Size Validation

| Threshold | Action  |
|-----------|---------|
| < 4 MB    | OK      |
| 4–6 MB    | Warning |
| > 6 MB    | Error   |

## Test File Handling

### Test Folder Types

| Folder Pattern | Purpose | Bundled into Code.js? | Production? | Testing? |
|---|---|---|---|---|
| `**/__tests__/` | Local unit tests (Jest) | Never | No | No |
| `**/test/` | Test utilities/fakes | Never | No | No |
| `**/__testOnline__/` | Online GAS tests | No (separate .gs) | No | Yes |

### Test File Naming

The Webpack `CopyOnlineTestsPlugin` copies online test files to `dist/` with these naming conventions:

| Source Location | Output Name |
|---|---|
| `LibraryName/__testOnline__/OnlineTests.gs` | `TEST_LibraryName_OnlineTests.gs` |
| `__testOnline__/shared/TestFramework.gs` | `TEST_SHARED_TestFramework.gs` |
| `__testOnline__/integration/Test16_*.gs` | `TEST_INTEGRATION_Test16_*.gs` |
| `__testOnline__/MasterTestRunner.gs` | `TEST_MASTER_Runner.gs` |

## Available Build Commands

### Build + Deploy

```bash
npm run push:production    # Minified Code.js, no tests → clasp push
npm run push:testing       # Readable Code.js + online test files → clasp push
```

### Build Only (no push)

```bash
npm run build:production   # Production build (minified + GAS patches)
npm run build:testing      # Testing build (readable + GAS patches + online tests)
npm run build:testoffline  # Readable build + run all offline tests
```

### Webpack-Only (no post-processing)

These commands run Webpack directly, **without** the GAS post-processing step:

```bash
npm run build              # Minified (production)
npm run build:readable     # Readable (no minification, comments stripped)
```

### Other Commands

```bash
npm run clean              # Remove dist/
npm run rebuild            # Clean + minified build
npm run watch              # Watch mode (readable, auto-rebuild)
```

## Recommended Workflows

### Daily Development

```bash
# 1. Make changes to source files
# 2. Run local unit tests
npm test

# 3. Build and push to GAS (readable, with online tests)
npm run push:testing

# 4. Open GAS editor and run tests
clasp open
# In the Script Editor: run runAllTests() from TEST_MASTER_Runner.gs
```

### Production Release

```bash
# 1. Ensure all tests pass
npm test
npm run test:integration

# 2. Build for production
npm run build:production

# 3. Review the build output
ls -la dist/

# 4. Deploy
npm run push:production
```

### Pre-deployment Validation

```bash
# Builds readable code, then runs:
#   1. Unit tests (jest.config.cjs)
#   2. Integration tests (jest.integration.config.cjs)
#   3. Bundle validation (jest.offline.config.cjs)
npm run build:testoffline
```

## What Gets Pushed to GAS

### Production Mode

| File | Size | Purpose |
|---|---|---|
| `Code.js` | ~815 KB | Bundled + patched app code |
| `appsscript.json` | ~1.2 KB | GAS project manifest |

**Total: 2 files**

### Testing Mode

| File(s) | Count | Purpose |
|---|---|---|
| `Code.js` | 1 | Bundled + patched code |
| `appsscript.json` | 1 | GAS project manifest |
| `TEST_LibName_OnlineTests.gs` | ~18 | Library online tests |
| `TEST_SHARED_*.gs` | 2 | Shared test utilities |
| `TEST_INTEGRATION_*.gs` | ~11 | Integration tests |
| `TEST_MASTER_Runner.gs` | 1 | Master test runner |

**Total: ~35 files**

## Verification

### Verify Production Build

```bash
npm run build:production
ls dist/
# Expected: .claspignore  Code.js  appsscript.json

# Verify no test files
ls dist/TEST_*.gs 2>&1 | grep "No such file"

# Verify no Object.hasOwn() in output
grep -c 'Object\.hasOwn(' dist/Code.js
# Expected: 0

# Verify classes preserved (not converted to functions)
grep -c '^class ' dist/Code.js
# Expected: 0 (minified, all on one line)
```

### Verify Testing Build

```bash
npm run build:testing
ls dist/TEST_*.gs | wc -l
# Expected: ~32

# Verify classes preserved
grep -c '^\s*class ' dist/Code.js
# Expected: ~280+

# Verify only callable functions have stubs (not library namespaces)
head -5 dist/Code.js
# Expected: function initializeServices() {} function exampleUsage() {} ...
```

## Troubleshooting

### Build script fails

1. Check Node.js version: `node --version` (requires 18+)
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check syntax: `node -c scripts/build-and-prepare.cjs`

### Test files appear in production deployment

1. Verify you used `npm run push:production`
2. Check `dist/.claspignore` contains `TEST_*.gs`
3. Clean rebuild: `npm run clean && npm run build:production`

### GAS runtime errors after deployment

1. Check build output for compatibility warnings (step 4)
2. Verify `appsscript.json` has `"runtimeVersion": "V8"`
3. Search `dist/Code.js` for GAS-incompatible patterns:
   ```bash
   grep -c 'Object\.hasOwn(' dist/Code.js         # Should be 0
   grep -c '\.replaceAll(' dist/Code.js            # Should be 0
   grep -c 'structuredClone(' dist/Code.js         # Should be 0
   grep -c '\\p{Emoji_Presentation}' dist/Code.js  # Should be 0
   grep -c 'typeof URL==="undefined"' dist/Code.js # Should be 1 (shim present)
   ```
4. Run local tests to isolate source-level issues: `npm test`

### Adding new GAS entry points

To make a function callable from the GAS editor function picker, add it in `src/index.js`:

```javascript
global.myNewFunction = myNewFunction;
```

Only functions assigned to `global` this way get top-level function stubs. Classes and other exports are available globally (via `Object.assign`) but do not appear in the GAS function picker.

## GAS V8 Compatibility Reference

### Supported in GAS V8 (Chrome ~80)

- `const` / `let`, arrow functions, template literals
- Destructuring, spread/rest operators
- `class` declarations, class fields, static fields
- `Map` / `Set` / `WeakMap` / `WeakSet`
- `Symbol`, `Proxy` / `Reflect`
- Optional chaining `?.`, nullish coalescing `??`
- `Promise` (syntax only — no event loop for proper async resolution)
- `Object.fromEntries()`, `Array.flat()`, `Array.flatMap()`

### NOT Supported in GAS V8

| Feature | Available Since | Alternative |
|---|---|---|
| `Object.hasOwn()` | Chrome 93 | `Object.prototype.hasOwnProperty.call()` |
| `String.replaceAll()` | Chrome 85 | `.split().join()` or regex `.replace()` |
| `Array.at()` | Chrome 92 | Bracket notation |
| `Array.findLast()` | Chrome 97 | `.slice().reverse().find()` |
| `structuredClone()` | Chrome 98 | `JSON.parse(JSON.stringify())` or `cloneDeep()` |
| Logical assignment | Chrome 85 | Explicit assignment |
| `new URL()` | N/A | Regex-based validation or build-injected shim |
| `crypto.getRandomValues()` | N/A | `nanoid/non-secure` or `Utilities.getUuid()` |
| `setTimeout` / `setInterval` | N/A | `Utilities.sleep()` for delays |
| `fetch()` | N/A | `UrlFetchApp.fetch()` |
| `TextEncoder` / `TextDecoder` | N/A | `Utilities.newBlob().getDataAsString()` |
| `\p{Emoji_*}` in regex | Varies | Unicode code-point ranges or ASCII fallback |

## Related Files

| File | Purpose |
|---|---|
| `webpack.config.cjs` | Unified Webpack config (minified + readable via `--env readable`) |
| `webpack-plugins/StripCommentsPlugin.cjs` | Comment stripping for readable builds |
| `scripts/build-and-prepare.cjs` | Build orchestration + GAS compatibility |
| `babel.config.cjs` | Babel config for Jest (Node.js targeting) |
| `appsscript.json` | GAS project manifest (V8 runtime) |
| `package.json` | npm scripts and CLASP rootDir config |

## Quick Reference

| Use Case | Command | Output |
|---|---|---|
| Production deployment | `npm run push:production` | Code.js + appsscript.json (2 files, ~815 KB) |
| Development with tests | `npm run push:testing` | Code.js + appsscript.json + TEST\_\*.gs (~35 files) |
| Pre-deployment validation | `npm run build:testoffline` | Build + unit/integration/bundle tests |
| Build only (production) | `npm run build:production` | dist/ ready for `clasp push` |
| Build only (testing) | `npm run build:testing` | dist/ ready for `clasp push` |
| Clean build | `npm run clean && npm run build:production` | Fresh dist/ |
