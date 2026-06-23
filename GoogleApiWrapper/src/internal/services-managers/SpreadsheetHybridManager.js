/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetHybridManager.js
 * @description Manager for hybrid operations and "escape hatch" methods (Standard API).
 */

export class SpreadsheetHybridManager {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
  }

  createSpreadsheet(title, options = {}) {
    const request = { properties: { title: title } };
    if (options.locale) request.properties.locale = options.locale;
    if (options.timeZone) request.properties.timeZone = options.timeZone;
    if (options.autoRecalc) request.properties.autoRecalc = options.autoRecalc;
    if (options.sheets) {
      request.sheets = options.sheets.map((sheet) => ({ properties: sheet }));
    }
    return this.facade._executeWithRetry(() => Sheets.Spreadsheets.create(request), { title }, 3);
  }

  openStandard(spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  getActiveStandard() {
    return SpreadsheetApp.getActiveSpreadsheet();
  }

  getStandardApp() {
    return SpreadsheetApp;
  }

  flushBatch() {
    SpreadsheetApp.flush();
  }

  _verifyAdvancedSheets() {
    if (typeof Sheets === 'undefined') {
      throw new Error('Advanced Sheets Service is not enabled. Please enable it in appsscript.json.');
    }
  }
}
