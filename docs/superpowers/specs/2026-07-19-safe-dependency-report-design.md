# Safe dependency update and library-usage report

## Scope

Update direct dependencies only when the actual latest version is a compatible
patch or minor release, and document concrete, graph-backed opportunities to
use the five existing runtime libraries more consistently. Do not modify
production source behavior in this change.

## Dependency policy

Update to the latest versions of `@babel/core`, `@babel/preset-env`,
`@faker-js/faker`, `babel-jest`, `jest`, `eslint-plugin-jest`,
`eslint-plugin-prettier`, `es-toolkit`, `fuse.js`, `jsdoc-api`, `prettier`,
`webpack`, and `zod`. `babel-jest` and `jest` are upgraded together.

Retain `@eslint/js` and `eslint` 9, `@google/clasp` 2, `babel-loader` 9,
`jsdoc-to-markdown` 8, and `webpack-cli` 5 because their latest releases are
major upgrades with plausible Node-engine, configuration, or command-line
compatibility impact. Packages already at their latest version remain unchanged.

## Report additions

Append one section for each library:

- `es-toolkit/compat`: use the CoreUtils facade to consolidate repeated local
  collection, deep-clone/equality, merge, and case-conversion implementations.
- `fuse.js`: offer ranked fuzzy matching where present query/search flows only
  perform exact or substring matching.
- `jsep`: parse and validate further user-configurable expression strings via
  the existing AST boundary, without dynamic evaluation.
- `zod`: define schemas at public configuration/data boundaries and preserve
  existing error translation for callers.
- `he`: place a CoreUtils-owned escaping adapter in front of the existing
  hand-written HTML escaping implementations used by HTML/log/template output.

Each recommendation must name the relevant source modules, describe the
benefit, and state any contract/GAS-V8 caveat.

## Verification

After dependency installation, run the normal offline unit suite, the
GAS-compatible offline build, and the offline Jest bundle suite. Also inspect
the dependency manifest/lockfile diff and report diff to confirm that the
change is limited to the approved packages and report/documentation files.
