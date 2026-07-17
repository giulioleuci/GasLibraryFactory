/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetRangeManager.js
 * @description Manager for spreadsheet value and range operations.
 */

export class SpreadsheetRangeManager {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._lastError = null;
  }

  updateRanges(spreadsheetId, updates, options = {}) {
    const updatesArray = Array.isArray(updates) ? updates : [updates];
    const valueInputOption = options.valueInputOption || 'USER_ENTERED';

    if (this.facade._isDryRun(options)) {
      let totalCells = 0,
        totalRows = 0,
        totalColumns = 0;
      const sheetsAffected = new Set();
      updatesArray.forEach((update) => {
        const values = update.values || [];
        const rows = values.length,
          cols = values[0] ? values[0].length : 0;
        totalCells += rows * cols;
        totalRows += rows;
        totalColumns = Math.max(totalColumns, cols);
        const sheetMatch = update.range.match(/^([^!]+)!/);
        if (sheetMatch) sheetsAffected.add(sheetMatch[1]);
      });
      this._logger.info(
        `[DRY-RUN] Would update ${updatesArray.length} range(s) in spreadsheet ${spreadsheetId}`
      );
      return {
        totalUpdatedCells: totalCells,
        totalUpdatedRows: totalRows,
        totalUpdatedColumns: totalColumns,
        totalUpdatedSheets: sheetsAffected.size,
        responses: updatesArray.map((u) => ({ spreadsheetId, updatedRange: u.range })),
        dryRun: true
      };
    }

    const data = updatesArray.map((update) => ({ range: update.range, values: update.values }));
    const result = this.facade._executeWithRetry(
      () => Sheets.Spreadsheets.Values.batchUpdate({ valueInputOption, data }, spreadsheetId),
      { spreadsheetId, rangeCount: data.length },
      3
    );
    this._logger.info(
      `Updated ${result.totalUpdatedCells} cells across ${result.totalUpdatedRows} rows`
    );
    return {
      totalUpdatedCells: result.totalUpdatedCells,
      totalUpdatedRows: result.totalUpdatedRows,
      totalUpdatedColumns: result.totalUpdatedColumns,
      totalUpdatedSheets: result.totalUpdatedSheets,
      responses: result.responses
    };
  }

  getRanges(spreadsheetId, ranges, options = {}) {
    const isSingleRange = !Array.isArray(ranges);
    const rangesArray = isSingleRange ? [ranges] : ranges;
    const result = this.facade._executeWithRetry(
      () =>
        Sheets.Spreadsheets.Values.batchGet(spreadsheetId, {
          ranges: rangesArray,
          majorDimension: options.majorDimension || 'ROWS'
        }),
      { spreadsheetId, rangeCount: rangesArray.length },
      3
    );
    if (isSingleRange) return result.valueRanges[0].values || [];
    const dataMap = {};
    result.valueRanges.forEach((vr, index) => {
      dataMap[rangesArray[index]] = vr.values || [];
    });
    return dataMap;
  }

  appendRows(spreadsheetId, appends, options = {}) {
    const appendsArray = Array.isArray(appends) ? appends : [appends];
    if (appendsArray.length === 0)
      return { totalUpdatedCells: 0, totalUpdatedRows: 0, successful: [], failed: [] };
    const valueInputOption = options.valueInputOption || 'USER_ENTERED';
    const sheets = this.facade._getCachedSheetMetadata(spreadsheetId);
    const sheetMap = {};
    sheets.forEach((sheet) => {
      sheetMap[sheet.properties.title] = sheet.properties.sheetId;
    });

    if (this.facade._isDryRun(options)) {
      let totalCells = 0,
        totalRows = 0;
      appendsArray.forEach((append) => {
        const values = append.values || [];
        totalCells += values.length * (values[0]?.length || 0);
        totalRows += values.length;
      });
      return {
        totalUpdatedCells: totalCells,
        totalUpdatedRows: totalRows,
        successful: appendsArray.map((a, i) => ({
          id: `append-${i}`,
          status: 200,
          data: {
            updates: {
              updatedCells: (a.values || []).length * ((a.values || [])[0] || []).length,
              updatedRows: (a.values || []).length
            }
          }
        })),
        failed: [],
        dryRun: true
      };
    }

    const requests = appendsArray.map((append) => {
      const sheetName = append.range.includes('!')
        ? append.range.split('!')[0].replace(/'/g, '')
        : append.range;
      const sheetId = sheetMap[sheetName];
      if (sheetId === undefined)
        throw new Error(`Sheet '${sheetName}' not found in spreadsheet ${spreadsheetId}`);
      const rows = (append.values || []).map((row) => ({
        values: row.map((cellValue) => {
          const cellData = {};
          if (cellValue == null || cellValue === '')
            cellData.userEnteredValue = { stringValue: '' };
          else if (typeof cellValue === 'number')
            cellData.userEnteredValue = { numberValue: cellValue };
          else if (typeof cellValue === 'boolean')
            cellData.userEnteredValue = { boolValue: cellValue };
          else {
            const stringVal = String(cellValue);
            if (stringVal.startsWith('=') && valueInputOption === 'USER_ENTERED')
              cellData.userEnteredValue = { formulaValue: stringVal };
            else cellData.userEnteredValue = { stringValue: stringVal };
          }
          return cellData;
        })
      }));
      return { appendCells: { sheetId, rows, fields: 'userEnteredValue' } };
    });

    this.facade._executeWithRetry(
      () => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId),
      { spreadsheetId },
      3
    );
    let totalUpdatedCells = 0,
      totalUpdatedRows = 0;
    const successful = appendsArray.map((append, i) => {
      const rows = (append.values || []).length,
        cols = (append.values || [])[0]?.length || 0,
        cells = rows * cols;
      totalUpdatedRows += rows;
      totalUpdatedCells += cells;
      return {
        id: `append-${i}`,
        status: 200,
        data: { updates: { updatedCells: cells, updatedRows: rows, range: append.range } }
      };
    });
    return { totalUpdatedCells, totalUpdatedRows, successful, failed: [] };
  }

  insertRow(spreadsheetId, sheetName, rowData, options = {}) {
    this._lastError = null;
    try {
      return this.appendRows(
        spreadsheetId,
        { range: `${sheetName}!A1`, values: [rowData] },
        options
      );
    } catch (e) {
      this._lastError = e;
      throw e;
    }
  }

  getLastError() {
    return this._lastError || null;
  }

  clearRanges(spreadsheetId, ranges, options = {}) {
    const rangesArray = Array.isArray(ranges) ? ranges : [ranges];
    if (this.facade._isDryRun(options)) {
      this._logger.info(
        `[DRY-RUN] Would clear ${rangesArray.length} range(s) in spreadsheet ${spreadsheetId}`
      );
      return { clearedRanges: rangesArray, dryRun: true };
    }
    const result = this.facade._executeWithRetry(
      () => Sheets.Spreadsheets.Values.batchClear({ ranges: rangesArray }, spreadsheetId),
      { spreadsheetId, rangeCount: rangesArray.length },
      3
    );
    return { clearedRanges: result.clearedRanges || rangesArray };
  }
}
