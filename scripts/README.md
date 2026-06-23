# Tooling Inventory

This directory holds the repository's build, deploy, and documentation tooling.
The monorepo is an ES Module project (`"type": "module"` in `package.json`), so
Node-executed build tooling that needs CommonJS uses the `.cjs` extension, while
ESM scripts use `.js`.

## Build & bundle

| Script | Wired via | Purpose |
|---|---|---|
| `build-and-prepare.cjs` | `npm run build:production` / `build:testing` / `build:testoffline` | Webpack build + GAS V8 compatibility post-processing (the canonical deploy pipeline). |
| `generate-offline-test-entry.cjs` | `webpack.offline-tests.config.cjs` | Generates the offline-test entry bundle. |

## Documentation

| Script | Wired via | Purpose |
|---|---|---|
| `generate-docs.js` (ESM) | `npm run docs` / `docs:watch` | Generates per-library Markdown API docs into `docs/` using `jsdoc-api`. |
| `generate-simplified-docs.cjs` | manual | Produces condensed library docs. |

## CLASP / project setup (shell)

| Script | Purpose |
|---|---|
| `create-appsscript-configs.sh` | Creates per-library `appsscript.json` configs. |
| `create-claspignore-files.sh` | Creates per-library `.claspignore` files. |
| `setup-all-clasp-projects.sh` | Bootstraps CLASP projects for every library. |
| `update-library-dependencies.sh` | Updates library dependency manifests. |
| `fix-clasp-conflict.sh` | Resolves CLASP push conflicts. |

## Configuration files (repo root)

- `webpack.config.cjs` / `webpack.offline-tests.config.cjs` — bundling.
- `jest.config.cjs` / `jest.offline.config.cjs` / `jest.integration.config.cjs` — test runners.
- `babel.config.cjs`, `eslint.config.js`, `.prettierrc` — language tooling.

## Removed scaffolding

The following one-off migration/analysis scripts were removed during the WP-04
cleanup (they were unreferenced by `package.json` and any tooling):
`refactor.js`, `refactor.cjs`, `refactor_assembler.cjs`, `refactor_importer.cjs`,
`extract_evaluator.cjs`, `fix-db.js`, `analyze-gas.mjs`, and the duplicate
`jest.integration.config.js` (the `.cjs` variant is canonical).
