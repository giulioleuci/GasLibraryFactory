/**
 * @file WorkspaceTemplateEngine/src/processors/managers/DocumentProcessorInjector.js
 * @description Manager for executing structural modifications and building batch requests.
 */

import { TextStyleMapper } from '@GoogleApiWrapper';

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
        return []; // Handled via Standard API
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
      // op.segments/op.sourceRuns were captured by the scanner against the
      // UNTRIMMED op.originalText/op.newText (renderSegments over the raw
      // template), so their rendered lengths can sum to one character more
      // than what actually gets inserted above whenever the trailing-\n trim
      // fired (originalText ended in \n and newText did too). Clamp the walk
      // to `newText.length` - the length of what insertText actually inserts
      // - so no updateTextStyle request's range extends past the real content
      // boundary onto the preserved paragraph-terminating \n. When no trim
      // happened (or newText didn't itself end in \n, so nothing was
      // trimmed), newText.length already equals the segments' total rendered
      // length and this clamp is a no-op.
      const insertedLength = newText.length;
      let cursor = op.index;
      let consumed = 0;
      for (const segment of op.segments) {
        if (consumed >= insertedLength) {
          break;
        }
        let rendered = segment.rendered != null ? String(segment.rendered) : '';
        const remaining = insertedLength - consumed;
        if (rendered.length > remaining) {
          rendered = rendered.slice(0, remaining);
        }
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
        consumed += rendered.length;
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

  /**
   * @description Executes a bullet_list/number_list expansion natively: locates
   * the template paragraph via body.findText() (same traversal technique
   * DocumentTableManager.insertTableAtMarker already uses), copies it once per
   * data item via native Paragraph.copy() — which preserves the original's
   * bullet/number-list membership and nesting level with no preset-guessing —
   * retexts each copy with the rendered item (preserving captured run styles),
   * then removes the template paragraph. Reverse iteration at the same fixed
   * insertion position mirrors the row-loop/column-loop "Reverse-Order
   * Strategy" already established for this pipeline.
   * @param {string} documentId Target document identifier.
   * @param {Object} op {paragraphIndex, listType, dataArray, itemTemplate, fullMatch, sourceRuns}.
   */
  _executeListLoopOperation(documentId, op) {
    try {
      this.facade.logger.info(
        `Executing list loop: ${op.dataArray.length} items at paragraph ${op.paragraphIndex}`
      );
      const doc = this.facade.documentService.openStandard(documentId);
      const body = doc.getBody();

      const rangeElement = body.findText(this._escapeForFindText(op.fullMatch));
      if (!rangeElement) {
        this.facade.logger.warn(`Could not find template paragraph for list loop marker`);
        return;
      }
      let templateParagraph = rangeElement.getElement();
      while (typeof templateParagraph.getParent === 'function') {
        const parent = templateParagraph.getParent();
        // Native DocumentApp elements obtained via separate calls (e.g. this
        // walked-up `parent` vs. the `body` captured above) are not
        // guaranteed to be reference-equal even when they represent the same
        // underlying Body — comparing via `!== body` can therefore fail to
        // ever match, walking one hop too far onto the Body's own
        // getParent() (which returns null) and crashing. Compare by type
        // instead (stringified, so this file never needs to touch the
        // `DocumentApp` global directly), which is reliable, and stop
        // climbing once `parent` is the Body itself.
        if (!parent || parent.getType().toString() === 'BODY_SECTION') {
          break;
        }
        templateParagraph = parent;
      }
      const templateChildIndex = body.getChildIndex(templateParagraph);
      const sourceRuns = op.sourceRuns || [];
      // Body.insertParagraph() only accepts an actual Paragraph — a real
      // bullet/number list marker (body.appendListItem()) copies as a
      // ListItem, and passing that to insertParagraph() throws "parameters
      // (number,DocumentApp.ListItem) don't match the method signature".
      // ListItem has its own insertListItem() for this.
      const isListItem =
        typeof templateParagraph.getType === 'function' &&
        templateParagraph.getType().toString() === 'LIST_ITEM';

      for (let i = op.dataArray.length - 1; i >= 0; i--) {
        const dataItem = op.dataArray[i];
        const copiedParagraph = templateParagraph.copy();
        if (isListItem) {
          body.insertListItem(templateChildIndex + 1, copiedParagraph);
        } else {
          body.insertParagraph(templateChildIndex + 1, copiedParagraph);
        }
        const insertedParagraph = body.getChild(templateChildIndex + 1);
        const segments = this._buildStyledSegments(op.itemTemplate, dataItem, sourceRuns);
        this._retextParagraph(insertedParagraph, segments);
      }
      body.removeChild(templateParagraph);
      this.facade.logger.debug(`List loop completed: inserted ${op.dataArray.length} items`);
    } catch (error) {
      this.facade.logger.error(`Failed to execute list loop: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Escapes JS regex metacharacters in `text` so it is safe to pass
   * to Google Docs' `Body.findText()`, which treats its argument as a regular
   * expression. `op.fullMatch` (the caller of this helper) is the entire raw
   * `{{#bullet_list:...}}...{{/bullet_list}}` block INCLUDING arbitrary
   * end-user-authored prose between the markers (and the markers' own `{`/`}`
   * are themselves regex metacharacters) — real template content can plausibly
   * contain parentheses, brackets, or `+`/`*`/`?` that would otherwise throw a
   * regex SyntaxError from findText and crash processing of an
   * otherwise-valid template.
   * @param {string} text Literal text to search for.
   * @returns {string} Regex-escaped text, safe to pass to `findText()`.
   * @private
   */
  _escapeForFindText(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * @description Clears a paragraph's content and appends a sequence of styled
   * segments, re-applying each segment's captured style natively. Shared retext
   * primitive for the list-loop path (table cells use
   * DocumentService.setCellRunStyles instead, since they're a different native
   * element type).
   * @param {Paragraph} paragraph Native DocumentApp Paragraph element.
   * @param {Array<{rendered: string, style: Object}>} segments Ordered text+style segments.
   * @private
   */
  _retextParagraph(paragraph, segments) {
    paragraph.clear();
    const textElement = paragraph.editAsText();
    let offset = 0;
    for (const segment of segments) {
      const rendered = segment.rendered || '';
      if (rendered.length === 0) {
        continue;
      }
      textElement.appendText(rendered);
      const attrs = TextStyleMapper.toNativeAttributes(segment.style);
      if (Object.keys(attrs).length > 0) {
        textElement.setAttributes(offset, offset + rendered.length - 1, attrs);
      }
      offset += rendered.length;
    }
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
