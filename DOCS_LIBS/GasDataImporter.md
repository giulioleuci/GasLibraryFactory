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

- **`EXTRACT`**: pulls one bounded window of rows (see "Cursor-aware
  extraction" below) and appends them to the checkpoint's internal buffer.
  Stays at `EXTRACT` until the source reports itself exhausted, then moves to
  `TRANSFORM`.
- **`TRANSFORM`**: transforms the entire buffered row set in one call, then
  moves to `LOAD`.
- **`LOAD`**: loads the transformed buffer via `Loader.loadChunk` (always
  commits with `db.save()`), then moves to `DONE` and returns `done: true`.

### `ImportCheckpoint` shape

Plain, JSON-serializable object — safe to round-trip through
`PropertiesService`/`JobRunnerLib` via `JSON.stringify`/`JSON.parse` +
`ImportCheckpoint.fromJSON`:

```javascript
{
  stage: 'EXTRACT' | 'TRANSFORM' | 'LOAD' | 'DONE',
  recipeName: string,
  sourceCursor: unknown,   // opaque, owned by the extract strategy
  rowOffset: number,       // reserved for future row-level bookkeeping
  loadOffset: number,      // number of LOAD chunks already committed
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
one `extract()` call and reports itself immediately exhausted. This means
`startImport`/`runImportChunk` work for every recipe today — only
`SheetById` sources actually spread extraction across multiple chunks and
multiple GAS execution windows.

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
(`isFirstChunk: false`) fall back to an `INSERT_ONLY`-style append instead of
re-purging the table. `runImportChunk` derives `isFirstChunk` from
`checkpoint.loadOffset === 0`.

`loadChunk` always calls `db.save()` at the end of the chunk — this is the
durable commit boundary a resumed run picks up from after a GAS execution
window ends mid-recipe.
