/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetMetadataCache.js
 * @description Manager for spreadsheet metadata retrieval and in-memory caching.
 */

export class SpreadsheetMetadataCache {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._sheetIdCache = {};
  }

  getSpreadsheetMetadata(spreadsheetId, options = {}) {
    const fields = options.fields || 'sheets.properties,properties';
    const metadata = this.facade._executeWithRetry(
      () => Sheets.Spreadsheets.get(spreadsheetId, { fields }),
      { spreadsheetId },
      3
    );
    this._logger.debug(`Retrieved metadata for spreadsheet: ${spreadsheetId}`);
    return metadata;
  }

  getSheetInfo(spreadsheetId, options = {}) {
    const includeHidden = options.includeHidden || false;
    const metadata = this.getSpreadsheetMetadata(spreadsheetId, {
      fields: 'sheets.properties'
    });

    let sheets = (metadata.sheets || []).map((sheet) => ({
      name: sheet.properties.title,
      sheetId: sheet.properties.sheetId,
      index: sheet.properties.index,
      hidden: sheet.properties.hidden || false,
      gridProperties: sheet.properties.gridProperties || {}
    }));

    if (!includeHidden) {
      sheets = sheets.filter((sheet) => !sheet.hidden);
    }

    this._logger.debug(`Retrieved ${sheets.length} sheet(s) from spreadsheet: ${spreadsheetId}`);
    return sheets;
  }

  _getCachedSheetMetadata(spreadsheetId) {
    if (this._sheetIdCache[spreadsheetId]) {
      return this._sheetIdCache[spreadsheetId];
    }
    const metadata = this.getSpreadsheetMetadata(spreadsheetId, {
      fields: 'sheets.properties'
    });
    this._sheetIdCache[spreadsheetId] = metadata.sheets || [];
    return this._sheetIdCache[spreadsheetId];
  }

  _clearSheetMetadataCache(spreadsheetId) {
    if (spreadsheetId) {
      delete this._sheetIdCache[spreadsheetId];
    } else {
      this._sheetIdCache = {};
    }
  }

  _parseRangeToGridRange(rangeA1, sheets) {
    const parts = rangeA1.split('!');
    const sheetName = parts[0].replace(/'/g, '');
    const range = parts[1] || 'A1';

    const sheet = sheets.find((s) => s.properties.title === sheetName);
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);

    const gridRange = { sheetId: sheet.properties.sheetId };
    const rangeParts = range.split(':');
    const isColumnOnly =
      rangeParts.length === 2 && /^[A-Z]+$/.test(rangeParts[0]) && /^[A-Z]+$/.test(rangeParts[1]);
    const isRowOnly =
      rangeParts.length === 2 && /^\d+$/.test(rangeParts[0]) && /^\d+$/.test(rangeParts[1]);

    if (isColumnOnly) {
      gridRange.startColumnIndex = this._columnToIndex(rangeParts[0]);
      gridRange.endColumnIndex = this._columnToIndex(rangeParts[1]) + 1;
    } else if (isRowOnly) {
      gridRange.startRowIndex = parseInt(rangeParts[0], 10) - 1;
      gridRange.endRowIndex = parseInt(rangeParts[1], 10);
    } else {
      const startCell = this._parseCell(rangeParts[0]);
      const endCell = rangeParts[1] ? this._parseCell(rangeParts[1]) : startCell;
      gridRange.startRowIndex = startCell.row;
      gridRange.endRowIndex = endCell.row + 1;
      gridRange.startColumnIndex = startCell.col;
      gridRange.endColumnIndex = endCell.col + 1;
    }
    return gridRange;
  }

  _parseCell(cellRef) {
    const match = cellRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);
    const col = this._columnToIndex(match[1]);
    const row = parseInt(match[2], 10) - 1;
    return { row, col };
  }

  _columnToIndex(column) {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return index - 1;
  }
}
