/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetGridManager.js
 * @description Manager for structural and formatting changes (sheets, widths, formats, protections).
 */

export class SpreadsheetGridManager {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
  }

  formatRanges(spreadsheetId, formatRequests, options = {}) {
    const requestsArray = Array.isArray(formatRequests) ? formatRequests : [formatRequests];
    if (this.facade._isDryRun(options)) {
      this._logger.info(`[DRY-RUN] Would format ${requestsArray.length} range(s) in spreadsheet ${spreadsheetId}`);
      return { updatedSpreadsheet: spreadsheetId, replies: requestsArray.map(() => ({})), dryRun: true };
    }
    const sheets = this.facade._getCachedSheetMetadata(spreadsheetId);
    const requests = requestsArray.map((req) => ({
      repeatCell: { range: this.facade._parseRangeToGridRange(req.range, sheets), cell: { userEnteredFormat: req.format }, fields: 'userEnteredFormat' }
    }));
    const result = this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId, requestCount: requests.length }, 3);
    return { updatedSpreadsheet: result.spreadsheetId, replies: result.replies };
  }

  setColumnWidths(spreadsheetId, widthRequests, _options = {}) {
    const requestsArray = Array.isArray(widthRequests) ? widthRequests : [widthRequests];
    const sheets = this.facade._getCachedSheetMetadata(spreadsheetId);
    const sheetMap = {};
    sheets.forEach((sheet) => { sheetMap[sheet.properties.title] = sheet.properties.sheetId; });
    const requests = requestsArray.map((req) => ({
      updateDimensionProperties: { range: { sheetId: sheetMap[req.sheetName], dimension: 'COLUMNS', startIndex: req.startColumn, endIndex: req.endColumn }, properties: { pixelSize: req.width }, fields: 'pixelSize' }
    }));
    return this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId }, 3);
  }

  createSheets(spreadsheetId, sheetRequests, options = {}) {
    const requestsArray = Array.isArray(sheetRequests) ? sheetRequests : [sheetRequests];
    if (this.facade._isDryRun(options)) {
      this._logger.info(`[DRY-RUN] Would create ${requestsArray.length} sheet(s) in spreadsheet ${spreadsheetId}`);
      return { spreadsheetId, replies: requestsArray.map((req, i) => ({ addSheet: { properties: { sheetId: `dry-run-sheet-${i}`, title: req.title, index: req.index || i } } })), dryRun: true };
    }
    const requests = requestsArray.map((req) => ({ addSheet: { properties: { title: req.title, index: req.index } } }));
    const result = this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId }, 3);
    this.facade._clearSheetMetadataCache(spreadsheetId);
    return result;
  }

  deleteSheets(spreadsheetId, sheetIds, options = {}) {
    const idsArray = Array.isArray(sheetIds) ? sheetIds : [sheetIds];
    if (this.facade._isDryRun(options)) {
      this._logger.info(`[DRY-RUN] Would delete ${idsArray.length} sheet(s) from spreadsheet ${spreadsheetId}`);
      return { spreadsheetId, replies: idsArray.map(() => ({})), dryRun: true };
    }
    const sheets = this.facade._getCachedSheetMetadata(spreadsheetId);
    const sheetMap = {};
    sheets.forEach((sheet) => { sheetMap[sheet.properties.title] = sheet.properties.sheetId; sheetMap[sheet.properties.sheetId] = sheet.properties.sheetId; });
    const requests = idsArray.map((id) => ({ deleteSheet: { sheetId: typeof id === 'string' ? sheetMap[id] : id } }));
    const result = this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId }, 3);
    this.facade._clearSheetMetadataCache(spreadsheetId);
    return result;
  }

  deleteRow(spreadsheetId, sheetName, rowIndex) {
    const sheets = this.facade._getCachedSheetMetadata(spreadsheetId);
    const sheetMeta = sheets.find((s) => s.properties.title === sheetName);
    if (!sheetMeta) throw new Error(`Sheet '${sheetName}' not found in spreadsheet ${spreadsheetId}`);
    const requests = [{ deleteDimension: { range: { sheetId: sheetMeta.properties.sheetId, dimension: 'ROWS', startIndex: rowIndex - 1, endIndex: rowIndex } } }];
    const result = this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId }, 3);
    this.facade._clearSheetMetadataCache(spreadsheetId);
    return result;
  }

  deleteRows(spreadsheetId, sheetName, rowIndices) {
    if (!rowIndices || rowIndices.length === 0) return null;
    const sheets = this.facade._getCachedSheetMetadata(spreadsheetId);
    const sheetMeta = sheets.find((s) => s.properties.title === sheetName);
    if (!sheetMeta) throw new Error(`Sheet '${sheetName}' not found in spreadsheet ${spreadsheetId}`);
    const sortedIndices = [...rowIndices].sort((a, b) => b - a);
    const requests = sortedIndices.map(rowIndex => ({ deleteDimension: { range: { sheetId: sheetMeta.properties.sheetId, dimension: 'ROWS', startIndex: rowIndex - 1, endIndex: rowIndex } } }));
    const result = this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId }, 3);
    this.facade._clearSheetMetadataCache(spreadsheetId);
    return result;
  }

  expandSheetGrid(spreadsheetId, sheetId, rowCount, columnCount) {
    const requests = [{ updateSheetProperties: { properties: { sheetId, gridProperties: { rowCount, columnCount } }, fields: 'gridProperties(rowCount,columnCount)' } }];
    const result = this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId }, 3);
    this.facade._clearSheetMetadataCache(spreadsheetId);
    this._logger.info(`Expanded sheet grid (sheetId: ${sheetId}) to ${rowCount} rows × ${columnCount} columns`);
    return result;
  }

  getProtectedRanges(spreadsheetId, sheetName = null) {
    this._logger.debug(`Retrieving protected ranges for spreadsheet: ${spreadsheetId}`);
    const metadata = this.facade._executeWithRetry(() => Sheets.Spreadsheets.get(spreadsheetId, { fields: 'sheets(properties(sheetId,title),protectedRanges)' }), { spreadsheetId }, 3);
    const protectedRanges = [];
    (metadata.sheets || []).forEach((sheet) => {
      if (sheetName && sheet.properties.title !== sheetName) return;
      (sheet.protectedRanges || []).forEach((pr) => {
        protectedRanges.push({ id: pr.protectedRangeId, range: pr.range, description: pr.description || '', editors: pr.editors || {}, sheetId: sheet.properties.sheetId, sheetName: sheet.properties.title, warningOnly: pr.warningOnly || false });
      });
    });
    this._logger.info(`Found ${protectedRanges.length} protected range(s)`);
    return protectedRanges;
  }

  deleteProtectedRanges(spreadsheetId, protectedRangeIds) {
    const idsArray = Array.isArray(protectedRangeIds) ? protectedRangeIds : [protectedRangeIds];
    this._logger.debug(`Deleting ${idsArray.length} protected range(s)`);
    const requests = idsArray.map((id) => ({ deleteProtectedRange: { protectedRangeId: id } }));
    const result = this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId, requestCount: requests.length }, 3);
    this._logger.info(`Deleted ${idsArray.length} protected range(s)`);
    return { spreadsheetId: result.spreadsheetId, deletedCount: idsArray.length, replies: result.replies };
  }

  protectRanges(spreadsheetId, protectionRequests, options = {}) {
    const requestsArray = Array.isArray(protectionRequests) ? protectionRequests : [protectionRequests];
    const globalEditors = options.globalEditors || {};
    const sheets = this.facade._getCachedSheetMetadata(spreadsheetId);
    this._logger.debug(`Protecting ${requestsArray.length} range(s) in spreadsheet: ${spreadsheetId}`);

    const requests = requestsArray.map((req) => {
      const gridRange = this.facade._parseRangeToGridRange(req.range, sheets);
      
      const editors = {
        users: [...(req.editors?.users || []), ...(globalEditors.users || [])],
        groups: [...(req.editors?.groups || []), ...(globalEditors.groups || [])],
        domainUsersCanEdit: req.editors?.domainUsersCanEdit !== undefined 
          ? req.editors.domainUsersCanEdit 
          : globalEditors.domainUsersCanEdit
      };

      if (editors.users.length === 0) delete editors.users;
      if (editors.groups.length === 0) delete editors.groups;
      if (editors.domainUsersCanEdit === undefined) delete editors.domainUsersCanEdit;

      const protection = {
        range: gridRange,
        description: req.description || '',
        warningOnly: req.warningOnly || false,
        requestingUserCanEdit: true
      };

      if (Object.keys(editors).length > 0) {
        protection.editors = editors;
      }

      return {
        addProtectedRange: {
          protectedRange: protection
        }
      };
    });

    const result = this.facade._executeWithRetry(() => Sheets.Spreadsheets.batchUpdate({ requests }, spreadsheetId), { spreadsheetId, requestCount: requests.length }, 3);
    const protectedRangeIds = result.replies.map(r => r.addProtectedRange.protectedRange.protectedRangeId);
    this._logger.info(`Successfully created ${protectedRangeIds.length} protected range(s)`);
    return { spreadsheetId: result.spreadsheetId, protectedCount: protectedRangeIds.length, protectedRangeIds, replies: result.replies };
  }
}
