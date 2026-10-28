import type { DocumentBatchFacade, DocumentOperation } from './DocumentContracts.js';
/**
 * @file GoogleApiWrapper/src/services/managers/DocumentBatchUpdateHandler.js
 * @description Specialized manager for Google Documents batch operations and core mutations.
 * Handles Docs API batchUpdate, PDF export, and bulk document operations.
 */

export class DocumentBatchUpdateHandler {
  declare facade: DocumentBatchFacade;
  declare _logger: DocumentBatchFacade['_logger'];
  declare _cache: unknown;
  declare _utils: unknown;
  declare _exceptionService: DocumentBatchFacade['_exceptionService'];

  /**
   * Creates a new DocumentBatchUpdateHandler instance.
   * @param {DocumentService} facade - The DocumentService facade
   */
  constructor(facade: DocumentBatchFacade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._cache = facade._cache;
    this._utils = facade._utils;
    this._exceptionService = facade._exceptionService;
  }

  /**
   * @description Retrieves the document header. Provisions a new header if missing.
   * @param {string} documentId Target document identifier.
   * @returns {GoogleAppsScript.Document.HeaderSection}
   */
  getOrCreateHeader(documentId: string) {
    const doc = this.facade.openStandard(documentId);
    let header = doc.getHeader();
    if (!header) {
      header = doc.addHeader();
    }
    return header;
  }

  /**
   * @description Retrieves the document footer. Provisions a new footer if missing.
   * @param {string} documentId Target document identifier.
   * @returns {GoogleAppsScript.Document.FooterSection}
   */
  getOrCreateFooter(documentId: string) {
    const doc = this.facade.openStandard(documentId);
    let footer = doc.getFooter();
    if (!footer) {
      footer = doc.addFooter();
    }
    return footer;
  }

  /**
   * @description Replaces header content with specified text.
   * @param {string} documentId Target document identifier.
   * @param {string} text New header content.
   * @returns {DocumentService} Facade instance for chaining.
   */
  setHeaderText(documentId: string, text: string) {
    const header = this.getOrCreateHeader(documentId);
    header.clear();
    header.appendParagraph(text);
    return this.facade; // Return facade for chaining
  }

  /**
   * @description Initializes a new blank document via Advanced Docs API (no template copy required).
   * @param {string} name Document title.
   * @param {Object} [options={}] Creation options.
   * @param {string} [options.destinationFolder] Target folder ID; moved there via Advanced Drive API after creation (Docs API always creates in Drive root).
   * @returns {Object} Result {documentId, builder}.
   */
  createDocument(name: string, options: { destinationFolder?: string } = {}) {
    try {
      const doc = Docs!.Documents!.create({ title: name });
      const documentId = doc.documentId!;
      this._logger.debug(`Created document: ${documentId} (${name})`);

      if (options.destinationFolder) {
        (
          Drive!.Files!.update as (
            resource: GoogleAppsScript.Drive_v3.Drive.V3.Schema.File,
            id: string,
            media: GoogleAppsScript.Base.Blob | null,
            options: object
          ) => GoogleAppsScript.Drive_v3.Drive.V3.Schema.File
        )({}, documentId, null, { addParents: options.destinationFolder });
      }

      return {
        documentId,
        builder: this.facade.document(documentId)
      };
    } catch (error) {
      this._logger.error(`createDocument failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * @description Retrieves document metadata with intelligent caching.
   * @param {string|string[]} documentIds Target resource ID(s).
   * @returns {Object|Object[]|null} Metadata object (single) or collection (batch).
   */
  getDocument(documentIds: string): GoogleAppsScript.Docs.Schema.Document | null;
  getDocument(documentIds: string[]): (GoogleAppsScript.Docs.Schema.Document | null)[];
  getDocument(documentIds: string | string[]) {
    const isArray = Array.isArray(documentIds);
    const ids = isArray ? documentIds : [documentIds];

    if (ids.length === 0) {
      return isArray ? [] : null;
    }

    try {
      const results = ids.map((docId) => {
        try {
          const cacheKey = this.facade._generateCacheKey('doc', docId, 'get');
          return this.facade._getOrExecute(
            cacheKey,
            () => Docs!.Documents!.get(docId),
            300 // 5 minutes
          ) as GoogleAppsScript.Docs.Schema.Document;
        } catch (error) {
          this._logger.error(`Failed to get document ${docId}: ${(error as Error).message}`);
          return null;
        }
      });

      return isArray ? results : results[0];
    } catch (error) {
      this._logger.error(`getDocument failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * @private
   * @description Executes atomic mutations via Docs API batchUpdate. Invalidates metadata cache on success.
   * @param {string} documentId Target document identifier.
   * @param {Object[]} requests Collection of API request objects.
   * @returns {Object} API response.
   */
  _executeBatchUpdate(
    documentId: string,
    requests: GoogleAppsScript.Docs.Schema.Request[] | null | undefined
  ) {
    if (!requests || requests.length === 0) {
      return { replies: [] };
    }

    try {
      this._logger.debug(
        `Executing batch update with ${requests.length} requests on document ${documentId}`
      );

      const executeUpdate = () => {
        return Docs!.Documents!.batchUpdate({ requests: requests }, documentId);
      };

      const result = this._exceptionService
        ? this._exceptionService.executeWithRetry(executeUpdate, {}, 3)
        : executeUpdate();

      this.facade._invalidateCache(this.facade._generateCacheKey('doc', documentId, 'get'));
      return result;
    } catch (error) {
      this._logger.error(
        `Batch update failed for document ${documentId}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  /**
   * @private
   * @description Triggers server-side PDF conversion and saves to Drive.
   * @param {string} documentId Source document identifier.
   * @param {Object} op Export parameters {fileName, destinationFolderId}.
   * @returns {Object} Created Drive file metadata.
   */
  _executeExportPDF(
    documentId: string,
    op: Pick<Extract<DocumentOperation, { type: 'exportPDF' }>, 'fileName' | 'destinationFolderId'>
  ) {
    try {
      // Upstream Drive v3 declares export as void; GAS returns the exported Blob here.
      const blob = (
        Drive!.Files!.export as (id: string, mime: string) => GoogleAppsScript.Base.Blob
      )(documentId, 'application/pdf');
      const fileMetadata: GoogleAppsScript.Drive_v3.Drive.V3.Schema.File = {
        name: op.fileName,
        mimeType: 'application/pdf'
      };

      if (op.destinationFolderId) {
        fileMetadata.parents = [op.destinationFolderId];
      }

      const file = Drive!.Files!.create(fileMetadata, blob);
      this._logger.debug(`Exported document ${documentId} to PDF: ${file.id}`);
      return file;
    } catch (error) {
      this._logger.error(`PDF export failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * @description Executes case-sensitive global text replacement in batch across multiple documents.
   * @param {string|string[]} documentIds Target resource ID(s).
   * @param {string} searchPattern Text to find.
   * @param {string} replacement New text content.
   * @returns {Object} Result summary {successful, failed}.
   */
  batchReplaceText(
    documentIds: string | string[],
    searchPattern: string,
    replacement: string | null | undefined
  ) {
    const ids = Array.isArray(documentIds) ? documentIds : [documentIds];
    const successful: { documentId: string; result: unknown }[] = [];
    const failed: { documentId: string; error: string }[] = [];

    for (const docId of ids) {
      try {
        const requests = [
          {
            replaceAllText: {
              containsText: {
                text: searchPattern,
                matchCase: true
              },
              replaceText: replacement || ''
            }
          }
        ];

        const result = this.facade._executeBatchUpdate(docId, requests);
        successful.push({ documentId: docId, result });
      } catch (error) {
        failed.push({ documentId: docId, error: (error as Error).message });
      }
    }

    return { successful, failed };
  }

  /**
   * @description Trashes multiple documents in batch. Invalidates associated metadata caches.
   * @param {string|string[]} documentIds Target resource ID(s).
   * @returns {Object} Result summary {successful, failed}.
   */
  deleteDocuments(documentIds: string | string[]) {
    const ids = Array.isArray(documentIds) ? documentIds : [documentIds];
    const successful: { documentId: string; result: unknown }[] = [];
    const failed: { documentId: string; error: string }[] = [];

    if (ids.length === 0) {
      return { successful, failed };
    }

    for (const docId of ids) {
      try {
        const result = this.facade._executeWithRetry(
          () => Drive!.Files!.update({ trashed: true }, docId),
          { documentId: docId },
          3
        );

        successful.push({ documentId: docId, result: result || null });
        this.facade._invalidateCache(this.facade._generateCacheKey('doc', docId, 'get'));
      } catch (error) {
        failed.push({ documentId: docId, error: (error as Error).message });
        this._logger.warn(`Failed to delete document ${docId}: ${(error as Error).message}`);
      }
    }

    return { successful, failed };
  }

  /**
   * @private
   * @description Bridges DocumentBuilder to native DocumentApp for header mutations.
   * @param {string} documentId Target document identifier.
   * @param {Object} op Mutation parameters {text}.
   * @returns {Object} {success}.
   */
  _addHeaderWithStandardAPI(documentId: string, op: { text: string | null | undefined }) {
    try {
      const doc = this.facade.openStandard(documentId);
      let header = doc.getHeader();
      if (!header) {
        header = doc.addHeader();
      }
      if (op.text) {
        header.clear();
        header.appendParagraph(op.text);
      }
      return { success: true };
    } catch (error) {
      this._logger.error(`Failed to add header with standard API: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * @private
   * @description Bridges DocumentBuilder to native DocumentApp for footer mutations.
   * @param {string} documentId Target document identifier.
   * @param {Object} op Mutation parameters {text}.
   * @returns {Object} {success}.
   */
  _addFooterWithStandardAPI(documentId: string, op: { text: string | null | undefined }) {
    try {
      const doc = this.facade.openStandard(documentId);
      let footer = doc.getFooter();
      if (!footer) {
        footer = doc.addFooter();
      }
      if (op.text) {
        footer.clear();
        footer.appendParagraph(op.text);
      }
      return { success: true };
    } catch (error) {
      this._logger.error(`Failed to add footer with standard API: ${(error as Error).message}`);
      throw error;
    }
  }
}
