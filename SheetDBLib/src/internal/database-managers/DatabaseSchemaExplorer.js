/**
 * @file SheetDBLib/src/managers/DatabaseSchemaExplorer.js
 * @description Manager for database schema discovery and table initialization.
 */

import { TableService } from '../../TableService.js';

export class DatabaseSchemaExplorer {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._spreadsheetService = facade._spreadsheetService;
    this._spreadsheetId = facade._spreadsheetId;
    this._utils = facade._utils;
  }

  /**
   * Reads sheet metadata via the Advanced Sheets API, retrying (bounded, with a short
   * pause between attempts) when `facade._verifyTables` names aren't all present yet.
   * `SpreadsheetApp.flush()` only guarantees `SpreadsheetApp`-view consistency — the
   * Advanced Sheets API (`Sheets.Spreadsheets.get`, what `getSheetInfo` calls) is a
   * separate REST-backed read path that can briefly lag a structural write (new/renamed
   * sheet) even after flush(). Costs nothing extra when the caller doesn't opt in, or
   * when the first read already satisfies it.
   */
  _readVerifiedSheetInfo() {
    const expected = this.facade._verifyTables;
    let sheets = this._spreadsheetService.getSheetInfo(this._spreadsheetId, {
      includeHidden: false
    });
    if (!expected || expected.length === 0) {
      return sheets;
    }

    const maxAttempts = 3;
    const delayMs = 300;
    let attempt = 1;
    while (attempt < maxAttempts && !this._allTablesVisible(sheets, expected)) {
      this._logger.debug(
        `Expected table(s) [${expected.join(', ')}] not yet visible via Advanced Sheets API for ${this._spreadsheetId} (attempt ${attempt}/${maxAttempts}); retrying in ${delayMs}ms.`
      );
      this._utils.sleep(delayMs);
      sheets = this._spreadsheetService.getSheetInfo(this._spreadsheetId, {
        includeHidden: false
      });
      attempt++;
    }
    if (!this._allTablesVisible(sheets, expected)) {
      const missing = expected.filter((name) => !sheets.some((sheet) => sheet.name === name));
      this._logger.warn(
        `Expected table(s) [${missing.join(', ')}] still not visible via Advanced Sheets API for ${this._spreadsheetId} after ${maxAttempts} attempts; proceeding with what was returned.`
      );
    }
    return sheets;
  }

  _allTablesVisible(sheets, expectedNames) {
    const present = new Set(sheets.map((sheet) => sheet.name));
    return expectedNames.every((name) => present.has(name));
  }

  _initialize() {
    try {
      const sheets = this._readVerifiedSheetInfo();
      if (sheets.length === 0) {
        this._logger.warn(
          `No visible sheets (tables) found in database ID ${this._spreadsheetId}.`
        );
        this.facade._loaded = true;
        return;
      }

      const ranges = sheets.map((sheet) => {
        const escapedName = sheet.name.replace(/'/g, "''");
        return `'${escapedName}'!A:ZZ`;
      });

      this._logger.debug(`Preparing for batch loading of ${sheets.length} tables.`);
      const rangeDataMap = this._spreadsheetService.getRanges(this._spreadsheetId, ranges, {
        valueRenderOption: 'UNFORMATTED_VALUE',
        majorDimension: 'ROWS'
      });

      const dataBySheetName = new Map();
      sheets.forEach((sheet, index) => {
        const rangeName = ranges[index];
        const data = rangeDataMap[rangeName] || [];
        dataBySheetName.set(sheet.name, data);
        this._logger.debug(`Mapped sheet "${sheet.name}" with ${data.length} rows`);
      });

      sheets.forEach((sheet) => {
        const tableData = dataBySheetName.get(sheet.name) || [];
        const table = new TableService(
          sheet.name,
          this._spreadsheetId,
          this._spreadsheetService,
          this._logger,
          this._utils,
          tableData,
          this.facade._schemaValidator
        );
        this.facade.tables[sheet.name] = table;
      });

      this.facade._loaded = true;
      this._logger.debug(
        `Database initialized with ${Object.keys(this.facade.tables).length} tables loaded in batch.`
      );
    } catch (e) {
      this._logger.error(`Error initializing database: ${e.message}`);
      throw e;
    }
  }
}
