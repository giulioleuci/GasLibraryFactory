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
          '_convertOperationToRequests',
          '_createTextSubstitutionRequests',
          '_createDeleteRowRequests',
          '_createListLoopRequests',
          '_executeTableInsertOperation',
          '_flushDocumentChanges'
        ]
      }
    ]);
  }

  process(documentId, context) {
    this.logger.info(
      `Starting document processing with Reverse-Order Strategy for document: ${documentId}`
    );
    let structure = this.documentService.scanDocumentStructure(documentId, ['{{']);
    const structuralOps = [];

    for (const table of structure.tables) {
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
    // trigger a rescan for them.
    const tableInsertOps = this._analyzeTableInsertions(structure.textMatches, context);
    if (tableInsertOps.length > 0) {
      for (const op of tableInsertOps) {
        this._executeTableInsertOperation(documentId, op);
      }
      structure = this.documentService.scanDocumentStructure(documentId, ['{{']);
    }

    const batchOps = [];
    for (const table of structure.tables) {
      const rowOps = this._analyzeRowLoops(table, context);
      for (const op of rowOps) {
        if (op.type === 'deleteRow') {
          batchOps.push(op);
        }
      }
    }
    const remainingTextMatches = structure.textMatches.filter(
      (tm) => tm.type !== 'TABLE_TEXT' || !processedTableIndices.has(tm.tableIndex)
    );
    batchOps.push(...this._analyzeListLoops(remainingTextMatches, context));
    batchOps.push(...this._analyzeTextSubstitutions(remainingTextMatches, context));
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
