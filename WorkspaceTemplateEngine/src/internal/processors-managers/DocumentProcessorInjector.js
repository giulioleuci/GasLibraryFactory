/**
 * @file WorkspaceTemplateEngine/src/processors/managers/DocumentProcessorInjector.js
 * @description Manager for executing structural modifications and building batch requests.
 */

export class DocumentProcessorInjector {
  constructor(facade) {
    this.facade = facade;
  }

  _executeRowLoopOperation(documentId, op) {
    try {
      this.facade.logger.info(
        `Executing row loop: ${op.dataArray.length} items at table ${op.tableIndex}, row ${op.rowIndex}`
      );
      const templateRow = this.facade.documentService.getTableRow(
        documentId,
        op.tableIndex,
        op.rowIndex
      );
      if (!templateRow || !templateRow.cells) {
        this.facade.logger.warn(
          `Could not get template row data for table ${op.tableIndex}, row ${op.rowIndex}`
        );
        return;
      }

      const cellTemplates = templateRow.cells.map((cellText, index) => {
        if (index === 0) {
          const markerMatch = cellText.match(/^{{#tablerow_loop:[^}]+}}/);
          return markerMatch ? cellText.substring(markerMatch[0].length) : cellText;
        }
        return cellText;
      });

      for (let i = op.dataArray.length - 1; i >= 0; i--) {
        const dataItem = op.dataArray[i];
        const renderedCells = cellTemplates.map((template) => {
          if (template && template.includes('{{')) {
            return this.facade.mustache.render(template, dataItem);
          }
          return template || '';
        });
        this.facade.documentService.insertTableRow(
          documentId,
          op.tableIndex,
          op.rowIndex + 1,
          renderedCells
        );
      }
      this.facade.documentService.deleteTableRow(documentId, op.tableIndex, op.rowIndex);
      this.facade.logger.debug(`Row loop completed: inserted ${op.dataArray.length} rows`);
    } catch (error) {
      this.facade.logger.error(`Failed to execute row loop: ${error.message}`);
      throw error;
    }
  }

  _executeColumnLoopOperation(documentId, op) {
    try {
      this.facade.logger.info(
        `Executing column loop: ${op.dataArray.length} items at table ${op.tableIndex}, column ${op.cellIndex}`
      );
      const tableData = this.facade.documentService.getTableData(documentId, op.tableIndex);
      if (!tableData || tableData.numRows === 0) {
        this.facade.logger.warn(`Could not get table data for table ${op.tableIndex}`);
        return;
      }

      const trimmedContent = (op.templateContent || '').replace(/\s+$/, '');
      const templateMatch = trimmedContent.match(/^(.*?){{\/tablecol_loop}}$/s);
      const template = templateMatch ? templateMatch[1].trim() : trimmedContent;

      if (op.dataArray.length === 0) {
        this.facade.documentService.updateTableCell(documentId, op.tableIndex, 0, op.cellIndex, '');
        return;
      }

      // The whole column is the loop unit: row 0 carries the loop marker's inner
      // template ({{label}}); every other row keeps its own cell template
      // ({{value}}). Each data item must render the full column, not just the header.
      const cellTemplates = [];
      for (let rowIdx = 0; rowIdx < tableData.numRows; rowIdx++) {
        if (rowIdx === 0) {
          cellTemplates.push(template);
        } else {
          const rowData = tableData.data[rowIdx] || [];
          const cellText = rowData[op.cellIndex];
          cellTemplates.push(cellText == null ? '' : cellText);
        }
      }

      const renderCell = (tpl, item) =>
        tpl && tpl.includes('{{') ? this.facade.mustache.render(tpl, item) : tpl || '';

      // First data item populates the original column in place, row by row.
      for (let rowIdx = 0; rowIdx < tableData.numRows; rowIdx++) {
        this.facade.documentService.updateTableCell(
          documentId,
          op.tableIndex,
          rowIdx,
          op.cellIndex,
          renderCell(cellTemplates[rowIdx], op.dataArray[0])
        );
      }

      if (op.dataArray.length > 1) {
        for (let i = 1; i < op.dataArray.length; i++) {
          const cellValues = cellTemplates.map((tpl) => renderCell(tpl, op.dataArray[i]));
          this.facade.documentService.insertTableColumn(
            documentId,
            op.tableIndex,
            op.cellIndex + i,
            cellValues
          );
        }
        this.facade.logger.debug(`Inserted ${op.dataArray.length - 1} additional columns`);
      }
      this.facade.logger.debug(
        `Column loop completed for column ${op.cellIndex}: ${op.dataArray.length} columns total`
      );
    } catch (error) {
      this.facade.logger.error(`Failed to execute column loop: ${error.message}`);
      throw error;
    }
  }

  _convertOperationToRequests(op) {
    switch (op.type) {
      case 'textSubstitution':
        return this.facade._createTextSubstitutionRequests(op);
      case 'rowLoop':
        return []; // Handled via Standard API
      case 'deleteRow':
        return this.facade._createDeleteRowRequests(op);
      case 'listLoop':
        return this.facade._createListLoopRequests(op);
      case 'columnLoop':
        return []; // Handled via Standard API
      default:
        this.facade.logger.warn(`Unknown operation type: ${op.type}`);
        return [];
    }
  }

  _createTextSubstitutionRequests(op) {
    let originalText = op.originalText,
      newText = op.newText;
    if (originalText.endsWith('\n')) {
      originalText = originalText.slice(0, -1);
      if (newText.endsWith('\n')) {
        newText = newText.slice(0, -1);
      }
    }
    if (newText === '') {
      newText = '\u200B';
    }
    return [
      {
        deleteContentRange: {
          range: { startIndex: op.index, endIndex: op.index + originalText.length }
        }
      },
      { insertText: { location: { index: op.index }, text: newText } }
    ];
  }

  _createDeleteRowRequests(op) {
    return [
      {
        deleteTableRow: {
          tableCellLocation: {
            tableStartLocation: { index: op.tableIndex },
            rowIndex: op.rowIndex,
            columnIndex: 0
          }
        }
      }
    ];
  }

  _createListLoopRequests(op) {
    const requests = [];
    requests.push({
      deleteContentRange: {
        range: { startIndex: op.index, endIndex: op.index + op.fullMatch.length }
      }
    });
    for (let i = op.dataArray.length - 1; i >= 0; i--) {
      const item = op.dataArray[i];
      const itemText = this.facade.mustache.render(op.itemTemplate, item);
      const isLastItem = i === op.dataArray.length - 1;
      requests.push({
        insertText: { location: { index: op.index }, text: isLastItem ? itemText : itemText + '\n' }
      });
      if (op.listType === 'bullet') {
        requests.push({
          createParagraphBullets: {
            range: { startIndex: op.index, endIndex: op.index + itemText.length + 1 },
            bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE'
          }
        });
      }
    }
    return requests;
  }

  /**
   * @description Executes a `{{table[source=...]}}` directive (ref REPORT_GLF.md
   * B7): inserts the resolved 2D array as a table immediately after the
   * marker's containing element (native DocumentApp API, via
   * `DocumentTableManager.insertTableAtMarker`), then removes the marker text
   * itself via the Advanced Docs API (`batchReplaceText`) — mirroring the
   * find-placeholder/remove-text split ALDO's own `DocumentTableFacade`
   * workaround used, now inside the library.
   * @param {string} documentId Target document identifier.
   * @param {{placeholder: string, data: Array<Array<*>>, options: Object}} op Table-insert operation.
   */
  _executeTableInsertOperation(documentId, op) {
    try {
      this.facade.logger.info(
        `Executing table insert: ${op.data.length} rows at marker "${op.placeholder}"`
      );
      this.facade.documentService.insertTableAtMarker(
        documentId,
        op.placeholder,
        op.data,
        op.options
      );
      // insertTableAtMarker uses the native DocumentApp API; flush before the
      // Advanced-API batchReplaceText call below so it sees the inserted table
      // (same native-then-Advanced-API ordering _flushDocumentChanges exists
      // for elsewhere in this processor).
      this._flushDocumentChanges(documentId);
      this.facade.documentService.batchReplaceText(documentId, op.placeholder, '');
      this.facade.logger.debug(`Table insert completed for marker "${op.placeholder}"`);
    } catch (error) {
      this.facade.logger.error(`Failed to execute table insert: ${error.message}`);
      throw error;
    }
  }

  _flushDocumentChanges(documentId) {
    try {
      const doc = this.facade.documentService.openStandard(documentId);
      if (doc && typeof doc.saveAndClose === 'function') {
        doc.saveAndClose();
        this.facade.logger.debug('Flushed DocumentApp changes via saveAndClose');
        return true;
      }
    } catch (e) {
      this.facade.logger.debug(`DocumentApp flush skipped: ${e.message}`);
    }
    return false;
  }
}
