# Safe Dependency Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the conservative, latest-compatible dependency set and append graph-backed adoption recommendations to the dependency report.

**Architecture:** This is a package-manifest/lockfile and documentation change. Package installation updates the exact selected direct dependencies and their transitive lockfile graph; the report records usage opportunities without changing production behavior.

**Tech Stack:** npm 9+, Jest 30, Webpack 5, Google Apps Script V8-compatible build preparation.

## Global Constraints

- Keep the project Node floor at `>=18.0.0` and npm floor at `>=9.0.0`.
- Do not update latest-major candidates: `@eslint/js`, `eslint`, `@google/clasp`, `babel-loader`, `jsdoc-to-markdown`, or `webpack-cli`.
- Do not modify `dist/`; it is generated output.
- Preserve Google Apps Script V8 compatibility; the offline build executes `scripts/build-and-prepare.cjs` compatibility patches.

---

### Task 1: Upgrade approved direct dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: npm registry metadata for the approved direct dependencies.
- Produces: manifest and lockfile entries that resolve the selected packages to their actual latest compatible patch/minor releases.

- [ ] **Step 1: Capture the pre-install package status**

Run: `npm outdated --json`

Expected: JSON identifies the approved dependencies as stale and shows the deferred major-version candidates separately.

- [ ] **Step 2: Install the approved direct dependencies**

Run:

```bash
npm install --save-dev @babel/core@latest @babel/preset-env@latest @faker-js/faker@latest babel-jest@latest jest@latest eslint-plugin-jest@latest eslint-plugin-prettier@latest jsdoc-api@latest prettier@latest webpack@latest
npm install --save es-toolkit@latest fuse.js@latest zod@latest
```

Expected: `package.json` and `package-lock.json` contain latest direct versions without changing the deferred major-version packages.

- [ ] **Step 3: Inspect the dependency diff**

Run: `git diff -- package.json package-lock.json`

Expected: only approved package ranges and their lockfile resolution changes are present.

### Task 2: Append graph-backed adoption analysis

**Files:**
- Modify: `REPORT_DEPEND_GLF.md`

**Interfaces:**
- Consumes: graph findings for the existing facades, parsing, schema, search, and HTML-escaping boundaries.
- Produces: five bottom-of-file sections that name concrete source modules, adoption targets, and GAS V8/contract safeguards.

- [ ] **Step 1: Append the `es-toolkit/compat` section**

Document the existing `CoreUtilsLib/src/facades/LodashFacade.js` facade and local duplication in `StringUtils`, configuration merging, deep cloning, equality, and grouping. Require facade ownership so consumers do not import `es-toolkit/compat` ad hoc.

- [ ] **Step 2: Append the `fuse.js` and `jsep` sections**

Document `SheetDBLib/src/TableSearchEngine.js` as the established Fuse boundary and `GasExpressionEngineLib/src/internal/parser/AstBuilder.js` as the established JSEP boundary. Recommend optional, bounded fuzzy search and AST parsing/allowlist validation, respectively; prohibit dynamic expression evaluation.

- [ ] **Step 3: Append the `zod` and `he` sections**

Document Zod schema boundary candidates in `GasSchemaValidatorLib` and SheetDB public configuration. Document `CoreUtilsLib/src/utils/HtmlSanitizer.js`, `JobRunnerLib/src/internal/CapturingLogger.js`, and `WorkspaceTemplateEngine/src/facades/Mustache.js` as duplicated escaping sites that should use a CoreUtils adapter around `he`.

- [ ] **Step 4: Review the report tail**

Run: `tail -n 180 REPORT_DEPEND_GLF.md`

Expected: five distinct sections appear after the existing validation command block, with no claim that an opportunity is already implemented.

### Task 3: Validate source and generated-bundle compatibility

**Files:**
- Generated and intentionally untracked: `dist/`

**Interfaces:**
- Consumes: updated dependencies, existing Jest configs, and `scripts/build-and-prepare.cjs`.
- Produces: fresh verification evidence for source tests and the GAS-compatible offline output.

- [ ] **Step 1: Run the offline unit suite**

Run: `npm test`

Expected: Jest exits 0 with no failing test suites.

- [ ] **Step 2: Build the GAS-compatible offline bundle**

Run: `npm run build:testoffline`

Expected: the script exits 0 after Webpack and GAS V8 post-processing.

- [ ] **Step 3: Run offline bundle tests**

Run: `npx jest --config jest.offline.config.cjs`

Expected: Jest exits 0 with no failing test suites.

- [ ] **Step 4: Verify the final scope**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; the only new task changes are `package.json`, `package-lock.json`, `REPORT_DEPEND_GLF.md`, and the approved design/plan documents, alongside unrelated pre-existing worktree changes.
