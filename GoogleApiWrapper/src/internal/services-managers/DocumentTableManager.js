/**
 * @file GoogleApiWrapper/src/services/managers/DocumentTableManager.js
 * @description Specialized manager for Google Documents table operations.
 * Handles both Advanced API and Standard DocumentApp API operations.
 */

export class DocumentTableManager {
  /**
   * Creates a new DocumentTableManager instance.
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
   * @description Retrieves metadata for all tables in a document via Advanced Docs API.
   * @param {string} documentId Target document identifier.
   * @returns {Object[]} Collection of table summaries {startIndex, endIndex, tableIndex, rows, columns}.
   */
  getDocumentTables(documentId) {
    try {
      const doc = this.facade._executeWithRetry(
        () => Docs.Documents.get(documentId),
        { documentId },
        3
      );

      const tables = [];
      let tableIndex = 0;

      // Parse body content to find tables
      if (doc.body && doc.body.content) {
        doc.body.content.forEach((element) => {
          if (element.table) {
            tables.push({
              startIndex: element.startIndex,
              endIndex: element.endIndex,
              tableIndex: tableIndex++,
              rows: element.table.tableRows ? element.table.tableRows.length : 0,
              columns: element.table.columns || 0
            });
          }
        });
      }

      this._logger.debug(`Found ${tables.length} tables in document ${documentId}`);
      return tables;
    } catch (error) {
      this._logger.error(`Failed to get document tables: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Retrieves detailed structural metadata for a specific table via Advanced Docs API.
   * @param {string} documentId Target document identifier.
   * @param {number} tableIndex Zero-based sequence index.
   * @returns {Object} Table structure {startIndex, endIndex, rows: Array<{startIndex, endIndex, rowIndex, cells: Array<{startIndex, endIndex, cellIndex}>}>}.
   * @throws {Error} If index is out of bounds.
   */
  getTableStructure(documentId, tableIndex) {
    try {
      const tables = this.facade.getDocumentTables(documentId);

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds (found ${tables.length} tables)`);
      }

      const doc = this.facade._executeWithRetry(
        () => Docs.Documents.get(documentId),
        { documentId },
        3
      );

      // Find the table element in the document structure
      let currentTableIndex = 0;
      for (const element of doc.body.content) {
        if (element.table && currentTableIndex === tableIndex) {
          return {
            startIndex: element.startIndex,
            endIndex: element.endIndex,
            rows: element.table.tableRows.map((row, rowIndex) => ({
              startIndex: row.startIndex,
              endIndex: row.endIndex,
              rowIndex: rowIndex,
              cells: row.tableCells.map((cell, cellIndex) => ({
                startIndex: cell.startIndex,
                endIndex: cell.endIndex,
                cellIndex: cellIndex
              }))
            }))
          };
        }
        if (element.table) {
          currentTableIndex++;
        }
      }

      throw new Error(`Table ${tableIndex} not found in document structure`);
    } catch (error) {
      this._logger.error(`Failed to get table structure: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Retrieves all cell text from a table via standard DocumentApp API.
   * @param {string} documentId Target document identifier.
   * @param {number} [tableIndex=0] Zero-based sequence index.
   * @returns {Object} Table data {tableIndex, numRows, numColumns, data: string[][]}.
   */
  getTableData(documentId, tableIndex = 0) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds (found ${tables.length} tables)`);
      }

      const table = tables[tableIndex];
      const numRows = table.getNumRows();
      const data = [];

      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        const numCells = row.getNumCells();
        const rowData = [];

        for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
          rowData.push(row.getCell(cellIndex).getText());
        }
        data.push(rowData);
      }

      this._logger.debug(`Retrieved table ${tableIndex} with ${numRows} rows`);

      return {
        tableIndex,
        numRows,
        numColumns: data[0] ? data[0].length : 0,
        data
      };
    } catch (error) {
      this._logger.error(`Failed to get table data: ${error.message}`);
      throw error;
    }
  }

  getTableRow(documentId, tableIndex, rowIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      const numCells = row.getNumCells();
      const cells = [];

      for (let i = 0; i < numCells; i++) {
        cells.push(row.getCell(i).getText());
      }

      return { rowIndex, cells };
    } catch (error) {
      this._logger.error(`Failed to get table row: ${error.message}`);
      throw error;
    }
  }

  getTableColumn(documentId, tableIndex, columnIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      const numRows = table.getNumRows();
      const cells = [];

      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        if (columnIndex >= row.getNumCells()) {
          throw new Error(`Column index ${columnIndex} out of bounds at row ${rowIndex}`);
        }
        cells.push(row.getCell(columnIndex).getText());
      }

      return { columnIndex, cells };
    } catch (error) {
      this._logger.error(`Failed to get table column: ${error.message}`);
      throw error;
    }
  }

  insertTableRow(documentId, tableIndex, rowIndex, cellValues = []) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      const newRow = table.insertTableRow(rowIndex);

      const numCells =
        cellValues.length || (table.getNumRows() > 0 ? table.getRow(0).getNumCells() : 1);
      for (let i = 0; i < numCells; i++) {
        newRow.appendTableCell(cellValues[i] || '');
      }

      this._logger.debug(`Inserted row at index ${rowIndex} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        rowIndex,
        numCells
      };
    } catch (error) {
      this._logger.error(`Failed to insert table row: ${error.message}`);
      throw error;
    }
  }

  appendTableRow(documentId, tableIndex, cellValues = []) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      const newRow = table.appendTableRow();

      for (const value of cellValues) {
        newRow.appendTableCell(value || '');
      }

      const newRowIndex = table.getNumRows() - 1;
      this._logger.debug(`Appended row at index ${newRowIndex} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        rowIndex: newRowIndex,
        numCells: cellValues.length
      };
    } catch (error) {
      this._logger.error(`Failed to append table row: ${error.message}`);
      throw error;
    }
  }

  deleteTableRow(documentId, tableIndex, rowIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      table.removeRow(rowIndex);
      this._logger.debug(`Deleted row ${rowIndex} from table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        deletedRowIndex: rowIndex
      };
    } catch (error) {
      this._logger.error(`Failed to delete table row: ${error.message}`);
      throw error;
    }
  }

  updateTableCell(documentId, tableIndex, rowIndex, columnIndex, value) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      if (columnIndex >= row.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      const cell = row.getCell(columnIndex);
      cell.clear();
      cell.setText(value || '');

      this._logger.debug(`Updated cell [${rowIndex}, ${columnIndex}] in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        rowIndex,
        columnIndex,
        value
      };
    } catch (error) {
      this._logger.error(`Failed to update table cell: ${error.message}`);
      throw error;
    }
  }

  updateTableRow(documentId, tableIndex, rowIndex, cellValues) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      const numCells = Math.min(row.getNumCells(), cellValues.length);

      for (let i = 0; i < numCells; i++) {
        const cell = row.getCell(i);
        cell.clear();
        cell.setText(cellValues[i] || '');
      }

      this._logger.debug(`Updated row ${rowIndex} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        rowIndex,
        updatedCells: numCells
      };
    } catch (error) {
      this._logger.error(`Failed to update table row: ${error.message}`);
      throw error;
    }
  }

  updateTableColumn(documentId, tableIndex, columnIndex, cellValues) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      const numRows = Math.min(table.getNumRows(), cellValues.length);

      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        if (columnIndex >= row.getNumCells()) {
          throw new Error(`Column index ${columnIndex} out of bounds at row ${rowIndex}`);
        }
        const cell = row.getCell(columnIndex);
        cell.clear();
        cell.setText(cellValues[rowIndex] || '');
      }

      this._logger.debug(`Updated column ${columnIndex} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        columnIndex,
        updatedRows: numRows
      };
    } catch (error) {
      this._logger.error(`Failed to update table column: ${error.message}`);
      throw error;
    }
  }

  copyTableRow(documentId, tableIndex, sourceRowIndex, targetRowIndex = null) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (sourceRowIndex >= table.getNumRows()) {
        throw new Error(`Source row index ${sourceRowIndex} out of bounds`);
      }

      const sourceRow = table.getRow(sourceRowIndex);
      const copiedRow = sourceRow.copy();

      let insertedRowIndex;
      if (targetRowIndex === null) {
        table.appendTableRow(copiedRow);
        insertedRowIndex = table.getNumRows() - 1;
      } else {
        if (targetRowIndex > table.getNumRows()) {
          throw new Error(`Target row index ${targetRowIndex} out of bounds`);
        }
        table.insertTableRow(targetRowIndex, copiedRow);
        insertedRowIndex = targetRowIndex;
      }

      this._logger.debug(
        `Copied row ${sourceRowIndex} to position ${insertedRowIndex} in table ${tableIndex}`
      );

      return {
        success: true,
        tableIndex,
        sourceRowIndex,
        insertedRowIndex,
        numCells: sourceRow.getNumCells()
      };
    } catch (error) {
      this._logger.error(`Failed to copy table row: ${error.message}`);
      throw error;
    }
  }

  deleteTableColumn(documentId, tableIndex, columnIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      const numRows = table.getNumRows();
      if (numRows === 0) {
        throw new Error('Table has no rows');
      }

      const firstRow = table.getRow(0);
      if (columnIndex >= firstRow.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        if (columnIndex < row.getNumCells()) {
          row.removeCell(columnIndex);
        }
      }

      this._logger.debug(`Deleted column ${columnIndex} from table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        deletedColumnIndex: columnIndex,
        affectedRows: numRows
      };
    } catch (error) {
      this._logger.error(`Failed to delete table column: ${error.message}`);
      throw error;
    }
  }

  insertTableColumn(documentId, tableIndex, columnIndex, cellValues = []) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      const numRows = table.getNumRows();
      if (numRows === 0) {
        throw new Error('Table has no rows');
      }

      const firstRow = table.getRow(0);
      if (columnIndex > firstRow.getNumCells()) {
        throw new Error(
          `Column index ${columnIndex} out of bounds (max: ${firstRow.getNumCells()})`
        );
      }

      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        const value = cellValues[rowIndex] || '';
        row.insertTableCell(columnIndex, value);
      }

      this._logger.debug(`Inserted column at position ${columnIndex} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        insertedColumnIndex: columnIndex,
        affectedRows: numRows
      };
    } catch (error) {
      this._logger.error(`Failed to insert table column: ${error.message}`);
      throw error;
    }
  }

  appendTableColumn(documentId, tableIndex, cellValues = []) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      const numRows = table.getNumRows();
      if (numRows === 0) {
        throw new Error('Table has no rows');
      }

      let newColumnIndex = 0;
      for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        const value = cellValues[rowIndex] || '';
        row.appendTableCell(value);
        if (rowIndex === 0) {
          newColumnIndex = row.getNumCells() - 1;
        }
      }

      this._logger.debug(`Appended column at position ${newColumnIndex} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        appendedColumnIndex: newColumnIndex,
        affectedRows: numRows
      };
    } catch (error) {
      this._logger.error(`Failed to append table column: ${error.message}`);
      throw error;
    }
  }

  setColumnWidth(documentId, tableIndex, columnIndex, widthPoints) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (table.getNumRows() === 0) {
        throw new Error('Table has no rows');
      }

      const firstRow = table.getRow(0);
      if (columnIndex >= firstRow.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      firstRow.getCell(columnIndex).setWidth(widthPoints);
      this._logger.debug(
        `Set column ${columnIndex} width to ${widthPoints} points in table ${tableIndex}`
      );

      return {
        success: true,
        tableIndex,
        columnIndex,
        widthPoints
      };
    } catch (error) {
      this._logger.error(`Failed to set column width: ${error.message}`);
      throw error;
    }
  }

  getColumnWidth(documentId, tableIndex, columnIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (table.getNumRows() === 0) {
        throw new Error('Table has no rows');
      }

      const firstRow = table.getRow(0);
      if (columnIndex >= firstRow.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      const widthPoints = firstRow.getCell(columnIndex).getWidth();
      return { tableIndex, columnIndex, widthPoints };
    } catch (error) {
      this._logger.error(`Failed to get column width: ${error.message}`);
      throw error;
    }
  }

  setRowBackgroundColor(documentId, tableIndex, rowIndex, color) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      const numCells = row.getNumCells();
      for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
        row.getCell(cellIndex).setBackgroundColor(color);
      }

      this._logger.debug(`Set row ${rowIndex} background to ${color} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        rowIndex,
        color,
        affectedCells: numCells
      };
    } catch (error) {
      this._logger.error(`Failed to set row background color: ${error.message}`);
      throw error;
    }
  }

  setRowMinimumHeight(documentId, tableIndex, rowIndex, heightPoints) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      table.getRow(rowIndex).setMinimumHeight(heightPoints);
      this._logger.debug(
        `Set row ${rowIndex} minimum height to ${heightPoints} points in table ${tableIndex}`
      );

      return {
        success: true,
        tableIndex,
        rowIndex,
        heightPoints
      };
    } catch (error) {
      this._logger.error(`Failed to set row minimum height: ${error.message}`);
      throw error;
    }
  }

  getRowMinimumHeight(documentId, tableIndex, rowIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const heightPoints = table.getRow(rowIndex).getMinimumHeight();
      return { tableIndex, rowIndex, heightPoints };
    } catch (error) {
      this._logger.error(`Failed to get row minimum height: ${error.message}`);
      throw error;
    }
  }

  clearTableRow(documentId, tableIndex, rowIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      const numCells = row.getNumCells();
      for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
        row.getCell(cellIndex).clear();
      }

      this._logger.debug(`Cleared row ${rowIndex} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        rowIndex,
        clearedCells: numCells
      };
    } catch (error) {
      this._logger.error(`Failed to clear table row: ${error.message}`);
      throw error;
    }
  }

  setCellBackgroundColor(documentId, tableIndex, rowIndex, columnIndex, color) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      if (columnIndex >= row.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      row.getCell(columnIndex).setBackgroundColor(color);
      this._logger.debug(
        `Set cell [${rowIndex}, ${columnIndex}] background to ${color} in table ${tableIndex}`
      );

      return {
        success: true,
        tableIndex,
        rowIndex,
        columnIndex,
        color
      };
    } catch (error) {
      this._logger.error(`Failed to set cell background color: ${error.message}`);
      throw error;
    }
  }

  getCellBackgroundColor(documentId, tableIndex, rowIndex, columnIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      if (columnIndex >= row.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      const color = row.getCell(columnIndex).getBackgroundColor();
      return { tableIndex, rowIndex, columnIndex, color };
    } catch (error) {
      this._logger.error(`Failed to get cell background color: ${error.message}`);
      throw error;
    }
  }

  setCellPadding(documentId, tableIndex, rowIndex, columnIndex, padding) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      if (columnIndex >= row.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      const cell = row.getCell(columnIndex);
      if (padding.top !== undefined) {
        cell.setPaddingTop(padding.top);
      }
      if (padding.bottom !== undefined) {
        cell.setPaddingBottom(padding.bottom);
      }
      if (padding.left !== undefined) {
        cell.setPaddingLeft(padding.left);
      }
      if (padding.right !== undefined) {
        cell.setPaddingRight(padding.right);
      }

      this._logger.debug(`Set cell [${rowIndex}, ${columnIndex}] padding in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        rowIndex,
        columnIndex,
        padding
      };
    } catch (error) {
      this._logger.error(`Failed to set cell padding: ${error.message}`);
      throw error;
    }
  }

  getCellPadding(documentId, tableIndex, rowIndex, columnIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      if (columnIndex >= row.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      const cell = row.getCell(columnIndex);
      return {
        tableIndex,
        rowIndex,
        columnIndex,
        padding: {
          top: cell.getPaddingTop(),
          bottom: cell.getPaddingBottom(),
          left: cell.getPaddingLeft(),
          right: cell.getPaddingRight()
        }
      };
    } catch (error) {
      this._logger.error(`Failed to get cell padding: ${error.message}`);
      throw error;
    }
  }

  setCellVerticalAlignment(documentId, tableIndex, rowIndex, columnIndex, alignment) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      if (columnIndex >= row.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      const alignmentMap = {
        TOP: DocumentApp.VerticalAlignment.TOP,
        CENTER: DocumentApp.VerticalAlignment.CENTER,
        BOTTOM: DocumentApp.VerticalAlignment.BOTTOM
      };

      const verticalAlignment = alignmentMap[alignment.toUpperCase()];
      if (!verticalAlignment) {
        throw new Error(`Invalid alignment: ${alignment}. Valid values: TOP, CENTER, BOTTOM`);
      }

      row.getCell(columnIndex).setVerticalAlignment(verticalAlignment);
      this._logger.debug(
        `Set cell [${rowIndex}, ${columnIndex}] vertical alignment to ${alignment} in table ${tableIndex}`
      );

      return {
        success: true,
        tableIndex,
        rowIndex,
        columnIndex,
        alignment: alignment.toUpperCase()
      };
    } catch (error) {
      this._logger.error(`Failed to set cell vertical alignment: ${error.message}`);
      throw error;
    }
  }

  getCellVerticalAlignment(documentId, tableIndex, rowIndex, columnIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      if (columnIndex >= row.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      const alignment = row.getCell(columnIndex).getVerticalAlignment();
      return {
        tableIndex,
        rowIndex,
        columnIndex,
        alignment: alignment ? alignment.toString() : null
      };
    } catch (error) {
      this._logger.error(`Failed to get cell vertical alignment: ${error.message}`);
      throw error;
    }
  }

  getCellDetails(documentId, tableIndex, rowIndex, columnIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      if (columnIndex >= row.getNumCells()) {
        throw new Error(`Column index ${columnIndex} out of bounds`);
      }

      const cell = row.getCell(columnIndex);
      const verticalAlignment = cell.getVerticalAlignment();

      return {
        tableIndex,
        rowIndex,
        columnIndex,
        text: cell.getText(),
        backgroundColor: cell.getBackgroundColor(),
        width: cell.getWidth(),
        padding: {
          top: cell.getPaddingTop(),
          bottom: cell.getPaddingBottom(),
          left: cell.getPaddingLeft(),
          right: cell.getPaddingRight()
        },
        verticalAlignment: verticalAlignment ? verticalAlignment.toString() : null,
        colSpan: cell.getColSpan(),
        rowSpan: cell.getRowSpan()
      };
    } catch (error) {
      this._logger.error(`Failed to get cell details: ${error.message}`);
      throw error;
    }
  }

  getTableMetadata(documentId, tableIndex) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      const numRows = table.getNumRows();

      let numColumns = 0;
      const columnWidths = [];
      if (numRows > 0) {
        const firstRow = table.getRow(0);
        numColumns = firstRow.getNumCells();
        for (let i = 0; i < numColumns; i++) {
          columnWidths.push(firstRow.getCell(i).getWidth());
        }
      }

      const rowMinHeights = [];
      for (let i = 0; i < numRows; i++) {
        rowMinHeights.push(table.getRow(i).getMinimumHeight());
      }

      return {
        tableIndex,
        numRows,
        numColumns,
        columnWidths,
        rowMinHeights,
        totalTables: tables.length
      };
    } catch (error) {
      this._logger.error(`Failed to get table metadata: ${error.message}`);
      throw error;
    }
  }

  setRowTextAlignment(documentId, tableIndex, rowIndex, alignment) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const alignmentMap = {
        LEFT: DocumentApp.HorizontalAlignment.LEFT,
        CENTER: DocumentApp.HorizontalAlignment.CENTER,
        RIGHT: DocumentApp.HorizontalAlignment.RIGHT,
        JUSTIFY: DocumentApp.HorizontalAlignment.JUSTIFY
      };

      const horizontalAlignment = alignmentMap[alignment.toUpperCase()];
      if (!horizontalAlignment) {
        throw new Error(
          `Invalid alignment: ${alignment}. Valid values: LEFT, CENTER, RIGHT, JUSTIFY`
        );
      }

      const row = table.getRow(rowIndex);
      const numCells = row.getNumCells();
      for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
        const cell = row.getCell(cellIndex);
        const numChildren = cell.getNumChildren();
        for (let i = 0; i < numChildren; i++) {
          const child = cell.getChild(i);
          if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
            child.setAlignment(horizontalAlignment);
          }
        }
      }

      this._logger.debug(
        `Set row ${rowIndex} text alignment to ${alignment} in table ${tableIndex}`
      );

      return {
        success: true,
        tableIndex,
        rowIndex,
        alignment: alignment.toUpperCase(),
        affectedCells: numCells
      };
    } catch (error) {
      this._logger.error(`Failed to set row text alignment: ${error.message}`);
      throw error;
    }
  }

  setRowBold(documentId, tableIndex, rowIndex, bold = true) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const tables = body.getTables();

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} out of bounds`);
      }

      const table = tables[tableIndex];
      if (rowIndex >= table.getNumRows()) {
        throw new Error(`Row index ${rowIndex} out of bounds`);
      }

      const row = table.getRow(rowIndex);
      const numCells = row.getNumCells();
      for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
        row.getCell(cellIndex).editAsText().setBold(bold);
      }

      this._logger.debug(`Set row ${rowIndex} bold=${bold} in table ${tableIndex}`);

      return {
        success: true,
        tableIndex,
        rowIndex,
        bold,
        affectedCells: numCells
      };
    } catch (error) {
      this._logger.error(`Failed to set row bold: ${error.message}`);
      throw error;
    }
  }

  /**
   * @private
   * @description Applies header-row bold, alternating-row background and column-width
   * styling to a freshly created/inserted `Table`. Shared by `_createTableWithStandardAPI`
   * (append-at-end) and `insertTableAtMarker` (positional insertion) so the styling logic
   * lives in exactly one place regardless of how the table was placed.
   * @param {GoogleAppsScript.Document.Table} table Native table to style.
   * @param {Array<Array<string>>} data The data the table was created from (used for row/column counts).
   * @param {Object} options {headerRow, alternatingRows, columnWidths}.
   */
  _applyTableStyling(table, data, options = {}) {
    if (options.headerRow && data.length > 0) {
      const headerRow = table.getRow(0);
      const numCells = headerRow.getNumCells();
      for (let i = 0; i < numCells; i++) {
        headerRow.getCell(i).editAsText().setBold(true);
      }
    }

    if (options.alternatingRows && data.length > 1) {
      const lightGray = '#f3f3f3';
      for (let rowIndex = 1; rowIndex < table.getNumRows(); rowIndex++) {
        if (rowIndex % 2 === 1) {
          const row = table.getRow(rowIndex);
          const numCells = row.getNumCells();
          for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
            row.getCell(cellIndex).setBackgroundColor(lightGray);
          }
        }
      }
    }

    if (options.columnWidths && Array.isArray(options.columnWidths)) {
      for (let colIndex = 0; colIndex < options.columnWidths.length; colIndex++) {
        const width = options.columnWidths[colIndex];
        if (width && table.getNumRows() > 0) {
          table.getRow(0).getCell(colIndex).setWidth(width);
        }
      }
    }
  }

  /**
   * @private
   * @description Bridges DocumentBuilder to native DocumentApp for table creation. Supports header styling and alternating row backgrounds.
   * @param {string} documentId Target document identifier.
   * @param {Object} op Table parameters {data, options: {headerRow, alternatingRows, columnWidths}}.
   * @returns {Object} Result summary {success, rows, columns}.
   */
  _createTableWithStandardAPI(documentId, op) {
    const data = op.data;
    const options = op.options || {};

    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();
      const table = body.appendTable(data);

      this._applyTableStyling(table, data, options);

      this._logger.debug(`Created table with ${data.length} rows using standard API`);

      return {
        success: true,
        rows: data.length,
        columns: data[0] ? data[0].length : 0
      };
    } catch (error) {
      this._logger.error(`Failed to create table with standard API: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Inserts a table immediately after the paragraph/element containing
   * `markerText`, instead of appending it at the document's end. Locates the marker via
   * native `body.findText()`, walks up from the matched text run to the top-level child of
   * `body` (a Paragraph/ListItem/etc.), and inserts the table right after that child's index.
   *
   * The marker text itself is NOT removed by this call — the caller (e.g. a facade doing a
   * scan-then-remove flow) is expected to remove it separately using the returned
   * `foundElementIndex`/its own marker-search logic. This mirrors the existing
   * find-placeholder / remove-text split already used by callers of `appendTable`.
   *
   * @param {string} documentId Target document identifier.
   * @param {string} markerText Literal text to search for (e.g. `{{TABELLA:sheetId}}`).
   * @param {Array<Array<string>>} data Table cell data.
   * @param {Object} [options={}] {headerRow, alternatingRows, columnWidths} - same as `_createTableWithStandardAPI`.
   * @returns {Object} Result summary {success, rows, columns, foundElementIndex}.
   * @throws {Error} If `markerText` is not found in the document (no silent fallback to append).
   */
  insertTableAtMarker(documentId, markerText, data, options = {}) {
    try {
      const doc = this.facade.openStandard(documentId);
      const body = doc.getBody();

      const rangeElement = body.findText(markerText);
      if (!rangeElement) {
        throw new Error(`Marker text "${markerText}" not found in document ${documentId}`);
      }

      // Walk up from the matched text run to the top-level child of `body`
      // (native DocumentApp elements expose getParent(); a nested Text run's
      // ancestor chain typically resolves to its containing Paragraph/ListItem,
      // which IS the direct child of body).
      let element = rangeElement.getElement();
      while (typeof element.getParent === 'function' && element.getParent() !== body) {
        element = element.getParent();
      }

      const childIndex = body.getChildIndex(element);
      const table = body.insertTable(childIndex + 1, data);

      this._applyTableStyling(table, data, options);

      this._logger.debug(
        `Inserted table with ${data.length} rows at marker "${markerText}" in document ${documentId}`
      );

      return {
        success: true,
        rows: data.length,
        columns: data[0] ? data[0].length : 0,
        foundElementIndex: childIndex
      };
    } catch (error) {
      this._logger.error(`Failed to insert table at marker: ${error.message}`);
      throw error;
    }
  }
}
