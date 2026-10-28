# Tooling Inventory

This directory holds the repository's build, deploy, and documentation tooling.
The monorepo is an ES Module project (`"type": "module"` in `package.json`), so
maintained Node tools use `.cts` for CommonJS or `.ts` for ESM. Run
`npm run build:tools` first: TypeScript emits `.cjs`/`.js` under
`.cache/ts-tools/`, preserving the source-relative directory layout.

## Build & bundle

| Script                            | Wired via                                                          | Purpose                                                                               |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `build-and-prepare.cts`           | `npm run build:production` / `build:testing` / `build:testoffline` | Webpack build + GAS V8 compatibility post-processing (the canonical deploy pipeline). |
| `generate-offline-test-entry.cts` | `webpack.offline-tests.config.cjs`                                 | Generates the offline-test entry bundle.                                              |

## Documentation

| Script                         | Wired via                     | Purpose                                                                                                 |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `generate-docs.ts` (ESM)       | `npm run docs` / `docs:watch` | Generates per-library raw JSDoc context in `DOCS_LIBS/` using real `jsdoc-api`.                         |
| `generate-simplified-docs.cts` | manual                        | Writes `docs/API_REFERENCE.md` and fifteen per-library condensed API files using the same JSDoc loader. |

## CLASP / project setup (shell)

| Script                           | Purpose                                        |
| -------------------------------- | ---------------------------------------------- |
| `create-appsscript-configs.sh`   | Creates per-library `appsscript.json` configs. |
| `create-claspignore-files.sh`    | Creates per-library `.claspignore` files.      |
| `setup-all-clasp-projects.sh`    | Bootstraps CLASP projects for every library.   |
| `update-library-dependencies.sh` | Updates library dependency manifests.          |
| `fix-clasp-conflict.sh`          | Resolves CLASP push conflicts.                 |

## Configuration files (repo root)

- `webpack.config.cts` / `webpack.offline-tests.config.cts` — typed bundling implementations.
- `webpack.config.cjs` / `webpack.offline-tests.config.cjs` — thin native entry loaders for the compiled implementations.
- `jest.config.cjs` / `jest.offline.config.cjs` / `jest.integration.config.cjs` — test runners.
- `babel.config.cjs`, `eslint.config.js`, `.prettierrc` — language tooling.

## Removed scaffolding

The following one-off migration/analysis scripts were removed during the WP-04
cleanup (they were unreferenced by `package.json` and any tooling):
`refactor.js`, `refactor.cjs`, `refactor_assembler.cjs`, `refactor_importer.cjs`,
`extract_evaluator.cjs`, `fix-db.js`, `analyze-gas.mjs`, and the duplicate
`jest.integration.config.js` (the `.cjs` variant is canonical).

## Running compiled tools

```bash
npm run build:tools
npm run docs
node .cache/ts-tools/scripts/generate-simplified-docs.cjs
node .cache/ts-tools/scripts/generate-simplified-docs.cjs --verbose
```

The generators resolve the repository from their compiled location, so an absolute emitted-tool path also works from a different working directory. The full generator writes `DOCS_LIBS/<Library>.md`; the condensed generator writes `docs/API_REFERENCE.md` and `docs/<Library>.md` for all fifteen maintained libraries.

`scripts/documentation-source.cts` erases annotations and `declare` fields into `.cache/jsdoc/`, preserving comments and lines for installed JSDoc. Both generators use its real doclets; class/method discovery never falls back to regex. Original comments are restored by source file and nearest source line, so equal sanitized comments with different types remain distinct. Output paths refer to `.ts` sources. Generation fails if JSDoc omits a real class or direct method from the emitted source AST.

Use `npm run typecheck:tools` for a non-emitting check. Do not execute source `.ts`/`.cts` directly with Node. Native config loaders and generated `.cache/`/`dist/` JavaScript are format exceptions, not maintained application sources.

The root `fix-db.cts` maintenance tool compiles to `.cache/ts-tools/fix-db.cjs`; it changes persisted data and is not a documentation or build smoke test.
