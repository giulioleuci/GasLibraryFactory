/**
 * @file GoogleApiWrapper/src/services/DocumentBuilder.js
 * @description Builder class for fluent Google Docs document operations with atomic batch execution.
 */

/**
 * @class DocumentBuilder
 * @description Fluent builder for Google Docs. Accumulates mutation operations for atomic execution via batchUpdate.
 * 
 * @property {string} documentId Target document identifier.
 * @property {GoogleService} service Reference to the Google Docs service.
 * @property {Array<Object>} operations Queue of pending document mutations.
 */
export class DocumentBuilder {
  constructor(documentId, service) {
    this.documentId = documentId;
    this.service = service;
    this.operations = [];
  }

  /**
   * @description Queues a paragraph append operation.
   * @param {string} text Paragraph content.
   * @param {Object} [options={}] Formatting metadata (heading, alignment).
   * @returns {DocumentBuilder} Current instance for chaining.
   */
  appendParagraph(text, options = {}) {
    this.operations.push({ type: 'appendParagraph', text, options });
    return this;
  }

  /**
   * @description Queues a full body content override operation.
   * @param {string} text Document text content.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
  setText(text) {
    this.operations.push({ type: 'setText', text });
    return this;
  }

  /**
   * @description Queues a table insertion operation.
   * @param {Array<Array>} data 2D array representing table rows and cells.
   * @param {Object} [options={}] Table configuration (headerRow, widths).
   * @returns {DocumentBuilder} Current instance for chaining.
   */
  createTable(data, options = {}) {
    this.operations.push({ type: 'createTable', data, options });
    return this;
  }

  /**
   * @description Queues a header content operation.
   * @param {string} text Header content.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
  addHeader(text) {
    this.operations.push({ type: 'addHeader', text });
    return this;
  }

  /**
   * @description Queues a footer content operation.
   * @param {string} text Footer content.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
  addFooter(text) {
    this.operations.push({ type: 'addFooter', text });
    return this;
  }

  /**
   * @description Queues a global text replacement operation.
   * @param {string} searchPattern Text pattern to replace.
   * @param {string} replacement New text content.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
  replaceText(searchPattern, replacement) {
    this.operations.push({ type: 'replaceText', searchPattern, replacement });
    return this;
  }

  /**
   * @description Queues a PDF generation operation.
   * @param {string} fileName Destination file name.
   * @param {string} [destinationFolderId=null] Target folder ID.
   * @returns {DocumentBuilder} Current instance for chaining.
   */
  exportPDF(fileName, destinationFolderId = null) {
    this.operations.push({ type: 'exportPDF', fileName, destinationFolderId });
    return this;
  }

  /**
   * @description Executes all queued operations. Combines Batch Update requests with standard API calls for tables and exports.
   * @returns {Object} Execution summary {success, batchResult, standardResults, tableResults, nonBatchResults}.
   */
  execute() {
    try {
      const requests = [];
      const nonBatchOps = [];
      const standardApiOps = [];

      for (const op of this.operations) {
        if (op.type === 'exportPDF') {
          nonBatchOps.push(op);
        } else if (
          (op.type === 'createTable' && op.data && Array.isArray(op.data) && op.data.length > 0) ||
          (op.type === 'addHeader' && op.text) ||
          (op.type === 'addFooter' && op.text)
        ) {
          standardApiOps.push(op);
        } else {
          const docRequests = this._convertOperationToDocsRequests(op);
          requests.push(...docRequests);
        }
      }

      let batchResult = null;
      if (requests.length > 0) {
        batchResult = this.service._executeBatchUpdate(this.documentId, requests);

        // DocumentApp has no flush(); changes are persisted automatically
        // and saveAndClose() is performed by the higher-level injector when needed.
      }

      const standardResults = [];
      for (const op of standardApiOps) {
        let result;
        if (op.type === 'createTable') {
          result = this.service._createTableWithStandardAPI(this.documentId, op);
        } else if (op.type === 'addHeader') {
          result = this.service._addHeaderWithStandardAPI(this.documentId, op);
        } else if (op.type === 'addFooter') {
          result = this.service._addFooterWithStandardAPI(this.documentId, op);
        }
        standardResults.push({ operation: op.type, result: result });
      }

      const nonBatchResults = [];
      for (const op of nonBatchOps) {
        if (op.type === 'exportPDF') {
          const pdfResult = this.service._executeExportPDF(this.documentId, op);
          nonBatchResults.push({ operation: 'exportPDF', result: pdfResult });
        }
      }

      this.operations = [];
      return {
        success: true,
        batchResult: batchResult,
        standardResults: standardResults,
        tableResults: standardResults.filter((r) => r.operation === 'createTable'),
        nonBatchResults: nonBatchResults
      };
    } catch (error) {
      this.service._logger.error(`DocumentBuilder.execute failed: ${error.message}`);
      return { success: false, error };
    }
  }

  /**
   * @private
   * @description Maps builder operations to Google Docs API Request objects.
   * @param {Object} op Builder operation metadata.
   * @returns {Object[]} Collection of API requests.
   */
  _convertOperationToDocsRequests(op) {
    switch (op.type) {
      case 'appendParagraph':
        return this._createAppendParagraphRequests(op);
      case 'setText':
        return this._createSetTextRequests(op);
      case 'createTable':
        return this._createTableRequests(op);
      case 'addHeader':
        return op.text ? [] : this._createHeaderRequests(op);
      case 'addFooter':
        return op.text ? [] : this._createFooterRequests(op);
      case 'replaceText':
        return this._createReplaceTextRequests(op);
      default:
        this.service._logger.warn(`Unknown operation type: ${op.type}`);
        return [];
    }
  }

  _createAppendParagraphRequests(op) {
    const requests = [];
    const text = (op.text || '') + '\n';

    requests.push({
      insertText: {
        location: { index: 1 },
        text: text
      }
    });

    if (op.options.heading || op.options.alignment) {
      const paragraphStyle = {};
      if (op.options.heading) {
        const headingMap = {
          1: 'HEADING_1',
          2: 'HEADING_2',
          3: 'HEADING_3',
          4: 'HEADING_4',
          5: 'HEADING_5',
          6: 'HEADING_6'
        };
        paragraphStyle.namedStyleType = headingMap[op.options.heading] || 'NORMAL_TEXT';
      }
      if (op.options.alignment) {
        const alignmentMap = {
          center: 'CENTER',
          right: 'END',
          justify: 'JUSTIFIED',
          left: 'START'
        };
        paragraphStyle.alignment = alignmentMap[op.options.alignment] || 'START';
      }

      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: 1,
            endIndex: 1 + text.length
          },
          paragraphStyle: paragraphStyle,
          fields: Object.keys(paragraphStyle).join(',')
        }
      });
    }

    return requests;
  }

  _createSetTextRequests(op) {
    const requests = [];
    const text = op.text || '';

    // Fetch document structure to find current body end index
    const doc = Docs.Documents.get(this.documentId);
    const bodyEndIndex = doc.body.content[doc.body.content.length - 1].endIndex - 1;

    if (bodyEndIndex > 1) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: 1,
            endIndex: bodyEndIndex
          }
        }
      });
    }

    requests.push({
      insertText: {
        location: { index: 1 },
        text: text + '\n'
      }
    });

    return requests;
  }

  _createTableRequests(op) {
    const data = op.data;

    if (!data || !Array.isArray(data) || data.length === 0) {
      this.service._logger.warn('Invalid table data, skipping');
      return [];
    }

    // Marker for createTable - actual creation handled in execute() via standard API
    return [];
  }

  _createHeaderRequests(_op) {
    return [{ createHeader: { type: 'DEFAULT' } }];
  }

  _createFooterRequests(_op) {
    return [{ createFooter: { type: 'DEFAULT' } }];
  }

  _createReplaceTextRequests(op) {
    return [
      {
        replaceAllText: {
          containsText: {
            text: op.searchPattern,
            matchCase: true
          },
          replaceText: op.replacement || ''
        }
      }
    ];
  }
}
