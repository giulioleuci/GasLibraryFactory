/**
 * @fileoverview Serializable checkpoint contract for resumable imports.
 * @author GasLibraryFactory
 */

/** @typedef {'EXTRACT'|'TRANSFORM'|'LOAD'|'DONE'} ImportStage */

/**
 * Plain, JSON-serializable checkpoint describing progress through a single
 * recipe's ETL pipeline (EXTRACT -> TRANSFORM -> LOAD -> DONE). Designed to
 * be persisted via `PropertiesService`/`JobRunnerLib` between GAS execution
 * windows and resumed with `ImportEngine.runImportChunk`.
 * @class
 */
class ImportCheckpoint {
  /**
   * @param {string} recipeName Name of the recipe this checkpoint belongs to.
   * @param {ImportStage} stage Current pipeline stage.
   * @param {*} sourceCursor Opaque cursor understood by the extract strategy
   *   (e.g. `{ rowOffset, headers }` for `SheetByIdStrategy`).
   * @param {number} rowOffset 0/1 flag set by `ImportPipelineExecutor.runImportChunk`'s
   *   `EXTRACT` stage: 1 once the source has reported itself exhausted (no more
   *   rows to pull), 0 while more remains. Consulted by the `LOAD` stage to
   *   decide whether the next call goes back to `EXTRACT` or on to `DONE`,
   *   without re-extracting to find out.
   * @param {number} loadOffset Number of load chunks already committed.
   * @param {Object} counters Running totals across all pipeline phases.
   * @param {Array<Object>|null} buffer Rows carried between stages (extracted
   *   rows awaiting transform, or transformed rows awaiting load).
   * @param {boolean} done True once the pipeline has reached the DONE stage.
   */
  constructor(recipeName, stage, sourceCursor, rowOffset, loadOffset, counters, buffer, done) {
    this.recipeName = recipeName;
    this.stage = stage;
    this.sourceCursor = sourceCursor;
    this.rowOffset = rowOffset;
    this.loadOffset = loadOffset;
    this.counters = counters;
    this.buffer = buffer;
    this.done = done;
  }

  /**
   * Builds a fresh checkpoint at the EXTRACT stage with zeroed counters.
   * @param {string} recipeName Name of the recipe to import.
   * @returns {ImportCheckpoint} Initial checkpoint.
   */
  static initial(recipeName) {
    return new ImportCheckpoint(
      recipeName,
      'EXTRACT',
      null,
      0,
      0,
      { extracted: 0, transformed: 0, inserted: 0, updated: 0, skipped: 0, deleted: 0 },
      null,
      false
    );
  }

  /**
   * Rehydrates a checkpoint from its plain-object JSON form (e.g. after
   * round-tripping through `PropertiesService`).
   * @param {Object} obj Plain object matching the `ImportCheckpoint` shape.
   * @returns {ImportCheckpoint} Rehydrated checkpoint instance.
   */
  static fromJSON(obj) {
    return new ImportCheckpoint(
      obj.recipeName,
      obj.stage,
      obj.sourceCursor,
      obj.rowOffset,
      obj.loadOffset,
      obj.counters,
      obj.buffer,
      obj.done
    );
  }

  /**
   * Guards against resuming a checkpoint with the wrong recipe.
   * @param {ImportCheckpoint} checkpoint Checkpoint being resumed.
   * @param {string} recipeName Name of the recipe the caller intends to resume.
   * @throws {Error} If the checkpoint's recipeName does not match.
   */
  static assertMatches(checkpoint, recipeName) {
    if (checkpoint.recipeName !== recipeName) {
      throw new Error(
        `Checkpoint recipeName mismatch: checkpoint is for "${checkpoint.recipeName}", resuming "${recipeName}"`
      );
    }
  }
}

export { ImportCheckpoint };
