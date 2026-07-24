/**
 * @file WorkspaceTemplateEngine/src/processors/managers/DocumentProcessorInjector.js
 * @description Manager for executing structural modifications and building batch requests.
 */

export class DocumentProcessorInjector {
  constructor(facade) {
    this.facade = facade;
  }

  /**
   * @description Renders a cell/paragraph template into styled segments, using
   * MyMustache.renderSegments() to map each rendered span back to the original
   * template offset, then looking up which captured source run (if any)
   * overlapped that offset to carry its style forward. Shared by row-loop,
   * column-loop, and list-loop retext paths (Tasks 5/6/8); text substitution
   * (Task 7) uses the same _styleAt lookup directly against Advanced-API
   * updateTextStyle requests instead of native setAttributes.
   * @param {string} template Cell/paragraph template string (may contain no `{{`).
   * @param {Object} data Data item to render against.
   * @param {Array<{start:number, end:number, style:Object}>} [sourceRuns=[]] Captured source runs, template-relative offsets.
   * @returns {Array<{rendered: string, style: Object}>}
   * @private
   */
  _buildStyledSegments(template, data, sourceRuns = []) {
    if (!template || !template.includes('{{')) {
      return [{ rendered: template || '', style: this._styleAt(0, sourceRuns) }];
    }
    const segments = this.facade.mustache.renderSegments(template, data);
    return segments.map((seg) => ({
      rendered: seg.rendered != null ? String(seg.rendered) : '',
      style: this._styleAt(seg.rawStart, sourceRuns)
    }));
  }

  /**
   * @description Finds the captured source run whose [start,end) span contains
   * `offset` and returns its style, or {} if none overlaps.
   * @param {number} offset Template-relative character offset.
   * @param {Array<{start:number, end:number, style:Object}>} sourceRuns Captured source runs.
   * @returns {Object} Advanced-API TextStyle POJO (possibly empty).
   * @private
   */
  _styleAt(offset, sourceRuns) {
    const run = sourceRuns.find((r) => offset >= r.start && offset < r.end);
    return run ? run.style : {};
  }

  /**
   * @description Rebases a set of captured source runs onto a new coordinate
   * origin, dropping/truncating any run that falls entirely before the shift
   * point. Used to correct `sourceRuns` (captured relative to a raw,
   * marker-included cell/paragraph text) so they line up with a
   * marker-stripped (and possibly further trimmed) template string before
   * being handed to `_buildStyledSegments`/`_styleAt` — otherwise offsets
   * captured against the raw text would be compared against the shorter
   * stripped template and misattribute styles. Same technique as the
   * list-loop `sourceRuns` rebase (filter overlap, subtract shift, clamp).
   * @param {Array<{start:number, end:number, style:Object}>} runs Source runs, relative to the pre-shift text.
   * @param {number} shift Number of leading characters removed between the pre-shift text and the target template.
   * @returns {Array<{start:number, end:number, style:Object}>} Runs re-based to the target template's own offsets.
   * @private
   */
  _rebaseSourceRuns(runs, shift) {
    if (!shift || shift <= 0) {
      return runs || [];
    }
    return (runs || [])
      .filter((r) => r.end > shift)
      .map((r) => ({
        text: r.text,
        start: Math.max(r.start, shift) - shift,
        end: r.end - shift,
        style: r.style
      }));
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

      let firstCellMarkerLength = 0;
      const cellTemplates = templateRow.cells.map((cellText, index) => {
        if (index === 0) {
          const markerMatch = cellText.match(/^{{#tablerow_loop:[^}]+}}/);
          if (markerMatch) {
            firstCellMarkerLength = markerMatch[0].length;
            return cellText.substring(markerMatch[0].length);
          }
          return cellText;
        }
        return cellText;
      });
      // op.sourceRuns[0] (if present) is captured relative to the RAW first
      // cell text, i.e. including the `{{#tablerow_loop:...}}` marker prefix
      // just stripped above — rebase it onto cellTemplates[0]'s own offsets
      // so _buildStyledSegments/_styleAt compare like-for-like.
      const sourceRuns = (op.sourceRuns || []).map((runs, index) =>
        index === 0 ? this._rebaseSourceRuns(runs, firstCellMarkerLength) : runs
      );

      for (let i = op.dataArray.length - 1; i >= 0; i--) {
        const dataItem = op.dataArray[i];
        const targetRowIndex = op.rowIndex + 1;
        this.facade.documentService.copyTableRow(
          documentId,
          op.tableIndex,
          op.rowIndex,
          targetRowIndex
        );
        cellTemplates.forEach((template, cellIndex) => {
          const segments = this._buildStyledSegments(
            template,
            dataItem,
            sourceRuns[cellIndex] || []
          );
          this.facade.documentService.setCellRunStyles(
            documentId,
            op.tableIndex,
            targetRowIndex,
            cellIndex,
            segments
          );
        });
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
      // op.sourceRuns is captured relative to op.templateContent (the
      // scanner already strips the `{{#tablecol_loop:...}}` marker prefix
      // before storing it — see _analyzeColumnLoops). `template` above may
      // be further offset from templateContent's start by leading
      // whitespace that `.trim()` removed (e.g. the marker and its
      // placeholder on separate lines) — rebase by that additional amount
      // so _buildStyledSegments/_styleAt compare like-for-like.
      const templateBase = templateMatch ? templateMatch[1] : trimmedContent;
      const trimShift = templateMatch ? templateBase.length - templateBase.trimStart().length : 0;
      const headerSourceRuns = this._rebaseSourceRuns(op.sourceRuns, trimShift);

      if (op.dataArray.length === 0) {
        this.facade.documentService.updateTableCell(documentId, op.tableIndex, 0, op.cellIndex, '');
        return;
      }

      // Row 0 uses the extracted header template (with its captured source
      // runs, if any); every other row keeps its own existing cell template,
      // with no source runs (disclosed scope boundary — see plan Task 6).
      const cellTemplates = [];
      const cellSourceRuns = [];
      for (let rowIdx = 0; rowIdx < tableData.numRows; rowIdx++) {
        if (rowIdx === 0) {
          cellTemplates.push(template);
          cellSourceRuns.push(headerSourceRuns);
        } else {
          const rowData = tableData.data[rowIdx] || [];
          const cellText = rowData[op.cellIndex];
          cellTemplates.push(cellText == null ? '' : cellText);
          cellSourceRuns.push([]);
        }
      }

      const buildSegments = (tpl, item, sourceRuns) =>
        this._buildStyledSegments(tpl, item, sourceRuns);

      // First data item populates the original column in place, row by row.
      for (let rowIdx = 0; rowIdx < tableData.numRows; rowIdx++) {
        const segments = buildSegments(
          cellTemplates[rowIdx],
          op.dataArray[0],
          cellSourceRuns[rowIdx]
        );
        this.facade.documentService.setCellRunStyles(
          documentId,
          op.tableIndex,
          rowIdx,
          op.cellIndex,
          segments
        );
      }

      if (op.dataArray.length > 1) {
        const originalWidth = this.facade.documentService.getColumnWidth(
          documentId,
          op.tableIndex,
          op.cellIndex
        ).widthPoints;

        for (let i = 1; i < op.dataArray.length; i++) {
          const targetColumnIndex = op.cellIndex + i;
          this.facade.documentService.copyTableColumn(
            documentId,
            op.tableIndex,
            op.cellIndex,
            targetColumnIndex
          );
          for (let rowIdx = 0; rowIdx < tableData.numRows; rowIdx++) {
            const segments = buildSegments(
              cellTemplates[rowIdx],
              op.dataArray[i],
              cellSourceRuns[rowIdx]
            );
            this.facade.documentService.setCellRunStyles(
              documentId,
              op.tableIndex,
              rowIdx,
              targetColumnIndex,
              segments
            );
          }
          this.facade.documentService.setColumnWidth(
            documentId,
            op.tableIndex,
            targetColumnIndex,
            originalWidth
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

    const requests = [
      {
        deleteContentRange: {
          range: { startIndex: op.index, endIndex: op.index + originalText.length }
        }
      },
      { insertText: { location: { index: op.index }, text: newText } }
    ];

    if (op.segments && op.segments.length > 0 && newText !== '\u200B') {
      let cursor = op.index;
      for (const segment of op.segments) {
        const rendered = segment.rendered != null ? String(segment.rendered) : '';
        if (rendered.length > 0) {
          const style = this._styleAt(segment.rawStart, op.sourceRuns || []);
          const fields = Object.keys(style);
          if (fields.length > 0) {
            requests.push({
              updateTextStyle: {
                range: { startIndex: cursor, endIndex: cursor + rendered.length },
                textStyle: style,
                fields: fields.join(',')
              }
            });
          }
        }
        cursor += rendered.length;
      }
    }
    return requests;
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
