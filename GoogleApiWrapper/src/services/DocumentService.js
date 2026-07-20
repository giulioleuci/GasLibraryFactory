/**
 * @file GoogleApiWrapper/src/services/DocumentService.js
 * @description Stateless service for manipulating Google Documents using Advanced Docs API v1 with batch operations.
 * Provides a fluent API for creating, modifying, and formatting documents, tables, and document structure.
 * @version 4.0 - Refactored using Facade/Delegation pattern.
 */

import { Delegation } from '@CoreUtilsLib';
import { GoogleService } from '../internal/core/GoogleService.js';
import { DocumentBuilder } from './DocumentBuilder.js';
export { DocumentBuilder };
import { DocumentTableManager } from '../internal/services-managers/DocumentTableManager.js';
import { DocumentContentExtractor } from '../internal/services-managers/DocumentContentExtractor.js';
import { DocumentBatchUpdateHandler } from '../internal/services-managers/DocumentBatchUpdateHandler.js';

/**
 * @class DocumentService
 * @extends GoogleService
 * @description Stateless facade for Google Docs manipulation. Utilizes Advanced Docs API v1 for batch operations and DocumentApp for standard API access. Delegates specialized logic to Table, Content, and Batch managers.
 *
 * @property {DocumentTableManager} _tableManager Logic for table structure and data.
 * @property {DocumentContentExtractor} _contentExtractor Logic for document parsing.
 * @property {DocumentBatchUpdateHandler} _batchUpdateHandler Logic for atomic mutations.
 */
export class DocumentService extends GoogleService {
  /**
   * @description Initializes DocumentService and wires manager delegations.
   * @param {LoggerService} logger Diagnostic logger.
   * @param {Cache} cache Persistence provider.
   * @param {UtilsService} utils Foundational utilities.
   * @param {ExceptionService} [exceptionService=null] Resiliency provider.
   */
  constructor(logger, cache, utils, exceptionService = null) {
    super(logger, cache, utils, exceptionService);

    // Initialize specialized managers
    this._tableManager = new DocumentTableManager(this);
    this._contentExtractor = new DocumentContentExtractor(this);
    this._batchUpdateHandler = new DocumentBatchUpdateHandler(this);

    // Delegate methods to managers
    Delegation.delegateMethods(
      this,
      [
        {
          manager: this._tableManager,
          methods: [
            'getDocumentTables',
            'getTableStructure',
            'getTableData',
            'getTableRow',
            'getTableColumn',
            'insertTableRow',
            'appendTableRow',
            'deleteTableRow',
            'updateTableCell',
            'updateTableRow',
            'updateTableColumn',
            'copyTableRow',
            'deleteTableColumn',
            'insertTableColumn',
            'appendTableColumn',
            'setColumnWidth',
            'getColumnWidth',
            'setRowBackgroundColor',
            'setRowMinimumHeight',
            'getRowMinimumHeight',
            'clearTableRow',
            'setCellBackgroundColor',
            'getCellBackgroundColor',
            'setCellPadding',
            'getCellPadding',
            'setCellVerticalAlignment',
            'getCellVerticalAlignment',
            'getCellDetails',
            'getTableMetadata',
            'setRowTextAlignment',
            'setRowBold',
            '_createTableWithStandardAPI',
            'insertTableAtMarker'
          ]
        },
        {
          manager: this._contentExtractor,
          methods: ['getRawDocumentStructure', 'getDocumentBody', 'scanDocumentStructure']
        },
        {
          manager: this._batchUpdateHandler,
          methods: [
            'createDocument',
            'getDocument',
            '_executeBatchUpdate',
            '_executeExportPDF',
            'batchReplaceText',
            'deleteDocuments',
            '_addHeaderWithStandardAPI',
            '_addFooterWithStandardAPI',
            'getOrCreateHeader',
            'getOrCreateFooter',
            'setHeaderText'
          ]
        }
      ],
      this._logger
    );
  }

  // ===================================================================
  // FACTORY METHOD FOR BUILDER PATTERN
  // ===================================================================

  /**
   * @description Factory method for DocumentBuilder.
   * @param {string} documentId Target Google Doc ID.
   * @returns {DocumentBuilder} Builder instance for fluent mutations.
   * @throws {Error} If documentId is invalid.
   */
  document(documentId) {
    if (!documentId || typeof documentId !== 'string') {
      throw new Error('documentId must be a non-empty string');
    }
    return new DocumentBuilder(documentId, this);
  }

  // ===================================================================
  // HYBRID CAPABILITY - "ESCAPE HATCH" METHODS
  // ===================================================================

  /**
   * @description Accesses document via native DocumentApp (standard API).
   * @param {string} documentId Target document identifier.
   * @returns {GoogleAppsScript.Document.Document} Native GAS Document object.
   */
  openStandard(documentId) {
    return this._executeWithRetry(() => DocumentApp.openById(documentId), { documentId }, 3);
  }

  /**
   * @description Returns the global DocumentApp object for enum and static access.
   * @returns {GoogleAppsScript.Document.DocumentApp}
   */
  getStandardApp() {
    return DocumentApp;
  }
}

// Export for backwards compatibility if needed
export { DocumentService as MyDocumentService };
