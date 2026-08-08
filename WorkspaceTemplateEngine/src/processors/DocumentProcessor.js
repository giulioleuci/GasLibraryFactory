/**
 * @file WorkspaceTemplateEngine/src/processors/DocumentProcessor.js
 * @description Google Docs template processor with reverse-order batch operations.
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { Delegation } from '@CoreUtilsLib';
import { DocumentService, UtilitiesService } from '@GoogleApiWrapper';
import { DocumentProcessorTagScanner } from '../internal/processors-managers/DocumentProcessorTagScanner.js';
import { DocumentProcessorValueResolver } from '../internal/processors-managers/DocumentProcessorValueResolver.js';
import { DocumentProcessorInjector } from '../internal/processors-managers/DocumentProcessorInjector.js';

class _DocumentProcessor {
  constructor(placeholderService, options = {}) {
    this.mustache = placeholderService.mustache;
    this.logger = placeholderService.logger;

    const simpleCache = { get: () => null, put: () => {}, remove: () => {} };
    const utilitiesService = new UtilitiesService(this.logger);
    const simpleUtils = { sleep: (ms) => utilitiesService.sleep(ms) };
    const simpleExceptionService = { executeWithRetry: (fn) => fn() };
    this.documentService = new DocumentService(
      this.logger,
      simpleCache,
      simpleUtils,
      simpleExceptionService
    );

    this.MAX_TEMPLATE_SIZE = 1000000;
    this.MAX_NESTING_DEPTH = 100;
    this.MAX_ITERATIONS = 10000;
    this.MAX_TEMPLATE_MATCH_SIZE = 100000;
    this.strictFilters = options.strictFilters || false;
    this._currentDepth = 0;

    // Initialize managers
    this._tagScanner = new DocumentProcessorTagScanner(this);
    this._valueResolver = new DocumentProcessorValueResolver(this);
    this._injector = new DocumentProcessorInjector(this);

    // Delegate methods
    Delegation.delegateMethods(this, [
      {
        manager: this._tagScanner,
        methods: [
          '_analyzeColumnLoops',
          '_analyzeRowLoops',
          '_analyzeListLoops',
          '_analyzeTextSubstitutions',
          '_analyzeTableInsertions',
          '_analyzeConditionalSections',
          '_parseTableParams',
          '_parseExpression',
          '_parseFilterArgs',
          '_parseArgValue'
        ]
      },
      {
        manager: this._valueResolver,
        methods: ['_applyFilters', '_sortByProperty', '_getNestedProperty']
      },
      {
        manager: this._injector,
        methods: [
          '_executeRowLoopOperation',
          '_executeColumnLoopOperation',
          '_executeListLoopOperation',
          '_retextParagraph',
          '_convertOperationToRequests',
          '_createTextSubstitutionRequests',
          '_createDeleteRowRequests',
          '_createDeleteRangeRequests',
          '_executeTableInsertOperation',
          '_flushDocumentChanges'
        ]
      }
    ]);
  }

  /**
   * @description Computes the `[index, index+length)` ranges of every
   * `{{#expr}}`/`{{^expr}}` conditional section that will be discarded
   * WHOLESALE (`kind: 'section'` ops only — never `kind: 'marker'`, which
   * only removes the two marker paragraphs and keeps its content live). Any
   * of the other 4 structural directives (`tablerow_loop`/`tablecol_loop`/
   * `bullet_list`/`number_list`/`{{table[...]}}`) whose marker falls inside
   * one of these ranges must never be analyzed or natively executed — the
   * whole span, including that directive's own data resolution, is about to
   * be deleted anyway, so running it first would be wasted work at best (a
   * spurious "not a valid array" warning at worst) for a data source the
   * template author expects to be legitimately absent while the guard is
   * false. Deliberately recomputed against whatever `structure` is CURRENT
   * at each call site (mirroring the existing deleteRow
   * "recompute against latest structure" pattern below) since an earlier
   * native mutation elsewhere in the document shifts character offsets that
   * a stale computation would get wrong.
   * @param {Object} currentStructure `{tables, textMatches}` snapshot to scan.
   * @param {Object} context Data context.
   * @returns {Array<[number, number]>} Half-open `[start, end)` ranges.
   * @private
   */
  _computeFalsyConditionalRanges(currentStructure, context) {
    return this._analyzeConditionalSections(currentStructure.textMatches, context)
      .filter((op) => op.kind === 'section')
      .map((op) => [op.index, op.index + op.length]);
  }

  /**
   * @description True if `index` falls inside any of `ranges`.
   * @param {Array<[number, number]>} ranges Half-open `[start, end)` ranges.
   * @param {number} index Character offset to test.
   * @returns {boolean}
   * @private
   */
  _isInsideAnyRange(ranges, index) {
    return ranges.some(([start, end]) => index >= start && index < end);
  }

  process(documentId, context) {
    this.logger.info(
      `Starting document processing with Reverse-Order Strategy for document: ${documentId}`
    );
    let structure = this.documentService.scanDocumentStructure(documentId, ['{{']);
    const structuralOps = [];

    // Tables whose own `.index` falls inside a conditional section that will
    // be discarded wholesale are skipped entirely — see
    // `_computeFalsyConditionalRanges` for why this must happen before ANY
    // of the other 4 directives' analyze/execute passes, not just before the
    // final text-substitution pass.
    let falsyRanges = this._computeFalsyConditionalRanges(structure, context);
    for (const table of structure.tables) {
      if (this._isInsideAnyRange(falsyRanges, table.index)) {
        continue;
      }
      structuralOps.push(...this._analyzeColumnLoops(table, context));
      structuralOps.push(...this._analyzeRowLoops(table, context));
    }

    const executedStandardOps = structuralOps.filter(
      (op) => op.type === 'rowLoop' || op.type === 'columnLoop'
    );
    // Tables a row/column loop already fully rendered (every cell template was
    // run through mustache.render against its own data item). The rescan below
    // reads the table back through the Advanced Docs API, which is not
    // guaranteed to observe the native DocumentApp mutations that just ran
    // (insertTableRow/deleteTableRow/updateTableCell) — if it doesn't, any
    // still-`{{...}}`-looking cell text it (stale-)reports would otherwise be
    // treated as an ordinary unresolved placeholder by the generic
    // substitution pass below and blanked out (zero-width space), corrupting
    // real, already-rendered content at whatever position those stale indices
    // now land on. These tables are excluded from that pass entirely — there
    // is nothing left in them for it to legitimately do.
    const processedTableIndices = new Set(executedStandardOps.map((op) => op.tableIndex));
    if (executedStandardOps.length > 0) {
      executedStandardOps.sort((a, b) => b.index - a.index);
      for (const op of executedStandardOps) {
        if (op.type === 'rowLoop') {
          this._executeRowLoopOperation(documentId, op);
        } else if (op.type === 'columnLoop') {
          this._executeColumnLoopOperation(documentId, op);
        }
      }
      if (this._flushDocumentChanges(documentId)) {
        structure = this.documentService.scanDocumentStructure(documentId, ['{{']);
      }
    }

    // `{{table[source=...]}}` directives (ref REPORT_GLF.md B7): each
    // insertion changes element indices, so these run before the remaining
    // batch ops (which were index-computed against the structure above) and
    // trigger a rescan for them. Recompute the falsy-conditional exclusion
    // against the CURRENT (possibly just-rescanned) structure — see
    // `_computeFalsyConditionalRanges` — and skip any `{{table[...]}}`
    // marker inside one, same reasoning as the table-loop gate above.
    falsyRanges = this._computeFalsyConditionalRanges(structure, context);
    const tableInsertCandidates = structure.textMatches.filter(
      (tm) => !this._isInsideAnyRange(falsyRanges, tm.elementIndex)
    );
    const tableInsertOps = this._analyzeTableInsertions(tableInsertCandidates, context);
    if (tableInsertOps.length > 0) {
      for (const op of tableInsertOps) {
        this._executeTableInsertOperation(documentId, op);
      }
      structure = this.documentService.scanDocumentStructure(documentId, ['{{']);
    }

    // Recomputed again for the same reason before the list-loop pass — a
    // just-executed table insertion may have rescanned `structure`.
    falsyRanges = this._computeFalsyConditionalRanges(structure, context);
    const remainingTextMatches = structure.textMatches.filter(
      (tm) =>
        (tm.type !== 'TABLE_TEXT' || !processedTableIndices.has(tm.tableIndex)) &&
        !this._isInsideAnyRange(falsyRanges, tm.elementIndex)
    );
    const listLoopOps = this._analyzeListLoops(remainingTextMatches, context);
    // Paragraphs a list loop already natively rendered (Paragraph.copy() per
    // data item + removeChild of the template paragraph). Mirrors
    // `processedTableIndices` above for the same reason: the post-flush
    // rescan reads back through the Advanced Docs API, which is not
    // guaranteed to observe the native DocumentApp mutations that just ran —
    // if it doesn't, a stale/leftover read at this same elementIndex would
    // otherwise be treated as an ordinary unresolved placeholder by the
    // generic substitution pass below and corrupted. Excluded from the final
    // text-substitution pass the same way already-rendered table indices are.
    const renderedElementIndices = new Set();
    if (listLoopOps.length > 0) {
      listLoopOps.sort((a, b) => b.index - a.index);
      for (const op of listLoopOps) {
        this._executeListLoopOperation(documentId, op);
        renderedElementIndices.add(op.paragraphIndex);
      }
      if (this._flushDocumentChanges(documentId)) {
        structure = this.documentService.scanDocumentStructure(documentId, ['{{']);
      }
    }

    // `{{#expr}}...{{/expr}}` / `{{^expr}}...{{/expr}}` conditional sections
    // (ref generic 5th structural directive, alongside tablerow_loop/
    // tablecol_loop/bullet_list/number_list): resolved against the same
    // post-rescan `structure` the deleteRow ops below also use, for the same
    // reason — any earlier native mutation's effect on real character
    // offsets must be reflected here. Each op's own [index, index+length)
    // span is exactly what gets removed, so it doubles as the exclusion
    // range for the generic substitution pass below (a marker paragraph, or
    // a whole discarded block, must never also be handed to
    // _analyzeTextSubstitutions). Computed BEFORE the deleteRow loop so its
    // `kind: 'section'` (whole-block-discarded) ranges can gate that loop
    // too — a table entirely inside an already-falsy conditional must not
    // have its own row-loop analyzed here either, same reasoning as the two
    // earlier table-loop/table-insert/list-loop gates above.
    const conditionalOps = this._analyzeConditionalSections(structure.textMatches, context);
    falsyRanges = conditionalOps
      .filter((op) => op.kind === 'section')
      .map((op) => [op.index, op.index + op.length]);

    // `deleteRow` ops (built by _analyzeRowLoops for a table whose row-loop
    // data source isn't an array) are keyed by the table's character-offset
    // tableIndex, and only converted to Advanced-API deleteContentRange
    // requests later, in the final _executeBatchUpdate call below. They are
    // deliberately (re)computed HERE — from `structure` as it stands AFTER
    // the list-loop native-mutation-then-rescan block above, not from the
    // structure snapshotted before it — so that if a bullet_list/number_list
    // paragraph sits earlier in the document than this table, the native
    // list-loop mutation's effect on the document's real character layout is
    // reflected in this deleteRow op's offset rather than executing against
    // a stale pre-mutation snapshot. When no list-loop ops ran, `structure`
    // here is the same reference as before this block, so this is not an
    // extra rescan and behavior for that case is unchanged.
    const batchOps = [...conditionalOps];
    for (const table of structure.tables) {
      if (this._isInsideAnyRange(falsyRanges, table.index)) {
        continue;
      }
      const rowOps = this._analyzeRowLoops(table, context);
      for (const op of rowOps) {
        if (op.type === 'deleteRow') {
          batchOps.push(op);
        }
      }
    }
    const conditionalRanges = conditionalOps.map((op) => [op.index, op.index + op.length]);

    const finalTextMatches = structure.textMatches.filter(
      (tm) =>
        (tm.type !== 'TABLE_TEXT' || !processedTableIndices.has(tm.tableIndex)) &&
        !renderedElementIndices.has(tm.elementIndex) &&
        !conditionalRanges.some(([start, end]) => tm.elementIndex >= start && tm.elementIndex < end)
    );
    batchOps.push(...this._analyzeTextSubstitutions(finalTextMatches, context));
    batchOps.sort((a, b) => b.index - a.index);

    const batchRequests = [];
    for (const op of batchOps) {
      batchRequests.push(...this._convertOperationToRequests(op));
    }

    if (batchRequests.length > 0) {
      this.logger.info(`Executing batch update with ${batchRequests.length} requests`);
      this.documentService._executeBatchUpdate(documentId, batchRequests);
      this.logger.info(`Batch update completed successfully`);
    } else {
      this.logger.info(`No batch operations to execute`);
    }
  }
}

export { _DocumentProcessor as DocumentProcessor };
