# API Reference: GasDataImporter

## Resumable/chunked imports

`ImportEngine.runImport(recipe, options)` executes an entire recipe's
Extract -> Transform -> Load pipeline synchronously in one call. For recipes
whose source data is too large to extract, transform, and load inside a
single GAS execution window (6-minute script / 30-minute trigger limit), use
the checkpoint-based `startImport`/`runImportChunk` pair instead, together
with `JobRunnerLib` to persist and resume the checkpoint between execution
windows.

### `ImportEngine.startImport(recipe, options = {})`

Validates `recipe` (same validation as `runImport`) and returns a fresh
`ImportCheckpoint` at the `EXTRACT` stage. Does not extract, transform, or
load anything yet.

```javascript
import { ImportEngine } from '@GasDataImporter';

const engine = new ImportEngine(logger, driveService, spreadsheetService, db);
const checkpoint = engine.startImport(recipe);
// checkpoint.stage === 'EXTRACT'
```

### `ImportEngine.runImportChunk(recipe, checkpoint, budget = { maxRows: 500 })`

Advances a checkpoint by one bounded unit of work and returns
`{ checkpoint, done }`. Call it in a loop — persisting `checkpoint` to
`PropertiesService` between calls via `JobRunnerLib` — until `done` is
`true`:

```javascript
let checkpoint = engine.startImport(recipe);
let done = false;
while (!done) {
  const step = engine.runImportChunk(recipe, checkpoint, { maxRows: 500 });
  checkpoint = step.checkpoint;
  done = step.done;
  // Persist `checkpoint` (plain JSON via ImportCheckpoint.fromJSON on resume)
  // and yield/return from the JobRunnerLib generator step here if the GAS
  // execution budget is running low.
}
```

The `recipe` argument must be re-passed on every call — it is intentionally
**not** part of the serializable checkpoint (checkpoints must stay small
enough for `PropertiesService`, and the recipe is normally already available
to the caller, e.g. via `JobHandlerParams` in a `JobRunnerLib` job). Calling
`runImportChunk` with a `recipe` whose name doesn't match
`checkpoint.recipeName` throws.

Each call does **one** of:

- **`EXTRACT`** (entered whenever the checkpoint's internal buffer is empty
  and extraction isn't exhausted yet): pulls one bounded window of rows (see
  "Cursor-aware extraction" below) and **immediately transforms that one
  chunk** — `Transformer.transform` is a pure per-row mapping, not an
  aggregate, so transforming a bounded slice is safe. The transformed,
  load-ready rows become the checkpoint's buffer (never the whole dataset).
  Moves to `LOAD`.
- **`LOAD`** (entered whenever the buffer has pending load-ready rows): loads
  the buffer via `Loader.loadChunk` (always commits with `db.save()`) and
  clears it. If extraction is now exhausted, moves to `DONE` and returns
  `done: true`; otherwise moves back to `EXTRACT` to pull the next bounded
  chunk.
There is no standalone `TRANSFORM` stage: an earlier design produced one
(transforming the whole accumulated buffer as its own step), but it was
replaced before ever shipping — transform now happens inline during
`EXTRACT`, on the bounded chunk. No checkpoint this pipeline constructs ever
carries `stage: 'TRANSFORM'`; `runImportChunk` throws if it's ever handed a
checkpoint whose stage isn't `EXTRACT`, `LOAD`, or `DONE`.

**Bounded-buffer guarantee**: for the cursor-aware (`SheetById`) case, each
call does work bounded by `budget.maxRows` (default 500), and
`checkpoint.buffer` never holds more than roughly one `maxRows`-sized batch
at rest between calls — not the whole dataset. This is what makes the
checkpoint small enough to fit `PropertiesService` and keeps every stage
(not just `EXTRACT`) inside the GAS execution-time budget. **This guarantee
does NOT hold for non-cursor sources** — see "Cursor-aware extraction" below.

### `ImportCheckpoint` shape

Plain, JSON-serializable object — safe to round-trip through
`PropertiesService`/`JobRunnerLib` via `JSON.stringify`/`JSON.parse` +
`ImportCheckpoint.fromJSON`:

```javascript
{
  stage: 'EXTRACT' | 'LOAD' | 'DONE',
  recipeName: string,
  sourceCursor: unknown,   // opaque, owned by the extract strategy
  rowOffset: number,       // 0/1 flag: 1 once EXTRACT reports the source exhausted
  loadOffset: number,      // number of *non-empty* LOAD chunks already committed
                            // (an empty chunk does not increment this, so it can't
                            // consume the "first chunk" slot OVERWRITE relies on)
  counters: {
    extracted: number,
    transformed: number,
    inserted: number,
    updated: number,
    skipped: number,
    deleted: number
  },
  buffer: object[] | null, // rows in flight between stages
  done: boolean
}
```

- `ImportCheckpoint.initial(recipeName)` — builds a fresh checkpoint at
  `EXTRACT` with zeroed counters.
- `ImportCheckpoint.fromJSON(obj)` — rehydrates a checkpoint after a
  `PropertiesService` round-trip.
- `ImportCheckpoint.assertMatches(checkpoint, recipeName)` — throws if
  `checkpoint.recipeName !== recipeName`; called internally by
  `runImportChunk` to guard against resuming the wrong recipe.

### Cursor-aware extraction — `SheetById` only

Real mid-extraction chunking (paginating by row offset instead of reading
the whole source in one call) is currently implemented only for
`SheetByIdStrategy` — the source type used by ALDO's `FILE_SINGOLO` import
recipes. A source strategy opts in by implementing:

- `supportsCursor(): boolean` — return `true` to enable chunked extraction.
- `extractChunk(config, cursor, maxRows): { rows, nextCursor, exhausted }` —
  extract at most `maxRows` starting from `cursor`.

Any other extract strategy (`FolderStrategy`, or a custom-registered
strategy via `registerCustomSource`) runs through a **compatibility path**:
`supportsCursor()` defaults to `false` on the `SourceStrategy` base class, so
`runImportChunk`'s first `EXTRACT`-stage call extracts the entire source in
one `extract()` call, transforms it as a single (unbounded) chunk, and
reports extraction itself immediately exhausted. This means
`startImport`/`runImportChunk` work for every recipe today — but the
bounded-buffer guarantee only holds for `SheetById`: a non-cursor source
still buffers its **whole** extract (and its whole transformed output) at
once in `checkpoint.buffer` between the `EXTRACT` and `LOAD` calls, so it
does not solve the `PropertiesService` size problem for large non-`SheetById`
sources. Only `SheetById` sources actually spread extraction — and now
transform and load — across multiple chunks and multiple GAS execution
windows.

`SheetByIdStrategy.extractChunk` also honors an explicit `config.range`: if
the recipe's source config sets `range` (e.g. `'A5:C200'`), chunked
pagination is clamped to that rectangle's row/column bounds instead of the
whole sheet grid, so `runImportChunk` and `runImport` import the same rows
for the same recipe. Only `A1:B2`-style full rectangles are parsed this way;
other range shapes fall back to full-grid pagination for `extractChunk`
(while `runImport`'s one-shot `extract()` path continues to honor them via
`_resolveValues`, unaffected by this parsing).

### `Loader.loadChunk(data, loadConfig, { isFirstChunk })`

Used internally by the `LOAD` stage of `runImportChunk`; also callable
directly for custom chunked-load orchestration. Behaves exactly like
`Loader.load` for `INSERT_ONLY`/`UPDATE_ONLY`/`UPSERT` — these are
naturally idempotent across a resume, because a previously-inserted row is
seen as "existing" on re-application and is skipped or updated, never
duplicated.

**`OVERWRITE` caveat**: `OVERWRITE`'s destructive purge-then-insert must run
**only once per run**, on the first chunk (`isFirstChunk: true`) — otherwise
every chunk would wipe out the rows inserted by prior chunks of the *same*
run. `loadChunk` gates this automatically: subsequent chunks
(`isFirstChunk: false`) append **unconditionally** — every row in the chunk is
inserted with no conflict-key dedupe — matching `load()`'s own single-shot
OVERWRITE semantics exactly (a one-shot `OVERWRITE` via `load()` also inserts
every row unconditionally). This is deliberately **not** routed through
`INSERT_ONLY`'s dedupe-by-conflict-key logic: doing so would silently drop
rows whose conflict-key value collides with (or is blank/missing like)
another row from an earlier chunk of the *same* run — a divergence from
`load()`'s behavior that a resumable OVERWRITE must not introduce.
`runImportChunk` derives `isFirstChunk` from `checkpoint.loadOffset === 0`,
where `loadOffset` only advances past a chunk that actually carried at least
one load-ready row (see `ImportCheckpoint` shape above) — a chunk with zero
rows (e.g. a leading block of rows that all failed transform validation)
never consumes the "first chunk" slot, so the table still gets purged exactly
once, on the first chunk that has real data.

`loadChunk` always calls `db.save()` at the end of the chunk — this is the
durable commit boundary a resumed run picks up from after a GAS execution
window ends mid-recipe.

**`OVERWRITE` is NOT idempotent if a non-first chunk is re-applied**: unlike
`INSERT_ONLY`/`UPDATE_ONLY`/`UPSERT` above, a non-first `OVERWRITE` chunk
(`isFirstChunk: false`) routes through the unconditional-append path — it
inserts every row with no conflict-key dedupe. If a crash or restart happens
after `loadChunk`'s internal `db.save()` commits but before the caller
persists the advanced `checkpoint` (so the same chunk is handed to
`runImportChunk`/`loadChunk` again on resume), that chunk's rows are
duplicated in the table rather than skipped or deduped. Callers must persist
`checkpoint` durably immediately after each `loadChunk`/`runImportChunk` call
returns, before doing any other work, to keep this window as small as
possible.
