/**
 * @file GoogleApiWrapper/src/services/managers/DocumentContentExtractor.js
 * @description Specialized manager for extracting and parsing Google Documents content.
 * Converts complex document structures into POJOs for decoupling from GAS APIs.
 */

export class DocumentContentExtractor {
  /**
   * Creates a new DocumentContentExtractor instance.
   * @param {DocumentService} facade - The DocumentService facade
   */
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._cache = facade._cache;
    this._utils = facade._utils;
    this._exceptionService = facade._exceptionService;
  }

  /**
   * @description Retrieves the full document hierarchy as a Plain Old JavaScript Object (POJO). Bypasses internal GAS types.
   * @param {string} documentId Target document identifier.
   * @returns {Object} POJO representation including body content collection.
   */
  getRawDocumentStructure(documentId) {
    return this.facade._executeWithRetry(() => {
      // Use Advanced Docs API to get document structure
      const doc = Docs.Documents.get(documentId);

      if (!doc || !doc.body || !doc.body.content) {
        throw new Error(`Invalid document structure for ${documentId}`);
      }

      // Convert document structure to POJOs
      const structure = {
        documentId: doc.documentId,
        title: doc.title,
        body: {
          content: this._convertContentToPOJO(doc.body.content)
        }
      };

      this._logger.debug(
        `Extracted document structure for ${documentId}: ${structure.body.content.length} elements`
      );
      return structure;
    });
  }

  /**
   * @private
   * @description Recursively maps native Docs API content elements to POJOs.
   * @param {Object[]} content Collection of native Docs API elements.
   * @returns {Object[]} Collection of mapped POJOs.
   */
  _convertContentToPOJO(content) {
    if (!Array.isArray(content)) {
      return [];
    }

    return content.map((element, index) => {
      const pojo = {
        index: index,
        startIndex: element.startIndex,
        endIndex: element.endIndex
      };

      // Determine element type and extract relevant data
      if (element.paragraph) {
        pojo.type = 'PARAGRAPH';
        pojo.text = this._extractParagraphText(element.paragraph);
        pojo.style = element.paragraph.paragraphStyle || {};
      } else if (element.table) {
        pojo.type = 'TABLE';
        pojo.rows = element.table.rows || 0;
        pojo.columns = element.table.columns || 0;
        pojo.tableRows = this._extractTableData(element.table);
      } else if (element.sectionBreak) {
        pojo.type = 'SECTION_BREAK';
      } else {
        pojo.type = 'UNKNOWN';
      }

      return pojo;
    });
  }

  /**
   * @private
   * @description Aggregates all text runs within a paragraph element.
   * @param {Object} paragraph Native Docs API paragraph object.
   * @returns {string} Concatenated plain text.
   */
  _extractParagraphText(paragraph) {
    if (!paragraph || !paragraph.elements) {
      return '';
    }

    return paragraph.elements
      .map((elem) => {
        if (elem.textRun && elem.textRun.content) {
          return elem.textRun.content;
        }
        return '';
      })
      .join('');
  }

  /**
   * @private
   * @description Maps native Docs API table rows and cells to a POJO collection.
   * @param {Object} table Native Docs API table object.
   * @returns {Object[]} Collection of row and cell POJOs.
   */
  _extractTableData(table) {
    if (!table || !table.tableRows) {
      return [];
    }

    return table.tableRows.map((row, rowIndex) => {
      const cells = (row.tableCells || []).map((cell, cellIndex) => {
        return {
          rowIndex: rowIndex,
          columnIndex: cellIndex,
          text: this._extractCellText(cell),
          content: cell.content ? this._convertContentToPOJO(cell.content) : []
        };
      });

      return {
        rowIndex: rowIndex,
        cells: cells
      };
    });
  }

  /**
   * @private
   * @description Resolves text content from a table cell by aggregating paragraph segments.
   * @param {Object} cell Native Docs API table cell object.
   * @returns {string} Concatenated plain text.
   */
  _extractCellText(cell) {
    if (!cell || !cell.content) {
      return '';
    }

    return cell.content
      .map((element) => {
        if (element.paragraph) {
          return this._extractParagraphText(element.paragraph);
        }
        return '';
      })
      .join('');
  }

  /**
   * @description Retrieves the document body metadata with index boundaries.
   * @param {string} documentId Target document identifier.
   * @returns {Object} Body structure {startIndex, endIndex, content}.
   * @throws {Error} If body is missing.
   */
  getDocumentBody(documentId) {
    try {
      const doc = this.facade._executeWithRetry(() => Docs.Documents.get(documentId), { documentId }, 3);

      if (!doc.body) {
        throw new Error('Document body not found');
      }

      return {
        startIndex: 1,
        endIndex: doc.body.content[doc.body.content.length - 1].endIndex - 1,
        content: doc.body.content
      };
    } catch (error) {
      this._logger.error(`Failed to get document body: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Probes document structure for tables and specific text patterns. Optimized for POJO-based scanning.
   * @param {string} documentId Target document identifier.
   * @param {string[]} [textPatterns=['{{']] Collection of search strings.
   * @returns {Object} Scan results {tables: Object[], textMatches: Object[]}.
   */
  scanDocumentStructure(documentId, textPatterns = ['{{']) {
    try {
      // Use Advanced Docs API via the method in this class
      const structure = this.facade.getRawDocumentStructure(documentId);

      const result = {
        tables: [],
        textMatches: []
      };

      const seenTextIndices = new Set();

      // PHASE 1: Extract tables from POJO structure
      for (const element of structure.body.content) {
        if (element.type === 'TABLE') {
          const tableData = {
            index: result.tables.length,
            startIndex: element.startIndex,
            rows: []
          };

          for (const tableRow of element.tableRows) {
            const rowData = {
              index: tableRow.rowIndex,
              cells: []
            };

            for (const cell of tableRow.cells) {
              rowData.cells.push({
                index: cell.rowIndex * 1000 + cell.columnIndex,
                text: cell.text
              });
            }

            tableData.rows.push(rowData);
          }

          result.tables.push(tableData);
        }
      }

      // PHASE 2: Scan text content for pattern matches
      for (const pattern of textPatterns) {
        let iterationCount = 0;
        const MAX_ITERATIONS = 10000;

        for (const element of structure.body.content) {
          if (++iterationCount > MAX_ITERATIONS) {
            this._logger.warn(`Reached maximum iteration limit (${MAX_ITERATIONS}) for pattern: ${pattern}`);
            break;
          }

          let textContent = '';
          let elementIndex = element.startIndex;

          if (element.type === 'PARAGRAPH') {
            textContent = element.text || '';
            if (textContent.includes(pattern) && !seenTextIndices.has(elementIndex)) {
              result.textMatches.push({
                elementIndex: elementIndex,
                text: textContent,
                type: 'TEXT'
              });
              seenTextIndices.add(elementIndex);
            }
          } else if (element.type === 'TABLE') {
            for (const tableRow of element.tableRows || []) {
              for (const cell of tableRow.cells) {
                if (cell.text && cell.text.includes(pattern)) {
                  textContent = cell.text;
                  elementIndex = (cell.content && cell.content.length > 0 && cell.content[0].startIndex != null)
                    ? cell.content[0].startIndex
                    : element.startIndex + tableRow.rowIndex * 1000 + cell.columnIndex;

                  if (!seenTextIndices.has(elementIndex)) {
                    result.textMatches.push({
                      elementIndex: elementIndex,
                      text: textContent,
                      type: 'TABLE_TEXT'
                    });
                    seenTextIndices.add(elementIndex);
                  }
                }
              }
            }
          }
        }
      }

      this._logger.debug(`Scanned document ${documentId}: ${result.tables.length} tables, ${result.textMatches.length} text matches`);
      return result;
    } catch (error) {
      this._logger.error(`Failed to scan document structure: ${error.message}`);
      throw error;
    }
  }
}
