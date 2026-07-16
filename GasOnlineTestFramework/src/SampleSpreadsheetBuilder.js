/**
 * @file GasOnlineTestFramework/src/SampleSpreadsheetBuilder.js
 * @description Generic add-sheet/append-row/reset helper for building throwaway
 * sample spreadsheets inside online tests, on top of a live Spreadsheet handle
 * (typically obtained via TestContext.buildSampleSpreadsheet).
 */

/**
 * @class SampleSpreadsheetBuilder
 * @description Wraps a live Spreadsheet handle with add-sheet/append-row
 * operations, so library consumers building sample test data never call
 * `SpreadsheetApp`/`Sheet` natives directly.
 */
export class SampleSpreadsheetBuilder {
  /**
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet Live spreadsheet handle.
   */
  constructor(spreadsheet) {
    this.spreadsheet = spreadsheet;
    this.id = spreadsheet.getId();
    this.defaultSheet = spreadsheet.getSheets()[0] || null;
    /** @private Header rows keyed by sheet name, as declared via {@link addSheet}. */
    this._headersBySheet = new Map();
  }

  /**
   * @description Creates a new sheet with the given header row, dropping the
   * spreadsheet's auto-created placeholder sheet the first time this is called.
   * @param {string} name Sheet name.
   * @param {string[]} headerRow Header cell values.
   */
  addSheet(name, headerRow) {
    const sheet = this.spreadsheet.insertSheet(name);
    if (headerRow.length > 0) {
      sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    }
    this._headersBySheet.set(name, headerRow);
    if (this.defaultSheet !== null) {
      this.spreadsheet.deleteSheet(this.defaultSheet);
      this.defaultSheet = null;
    }
  }

  /**
   * @description Appends a row to a named sheet, matching values to that sheet's header order
   * (as declared via {@link addSheet} — tracked locally rather than re-read from the live sheet,
   * to avoid an extra round-trip per row).
   * @param {string} sheetName Target sheet name.
   * @param {Object<string, *>} row Values keyed by header name.
   * @throws {Error} If the named sheet does not exist.
   */
  appendRow(sheetName, row) {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (sheet === null) {
      throw new Error(
        `Sheet "${sheetName}" not found in spreadsheet "${this.spreadsheet.getName()}".`
      );
    }
    const headerRow = this._headersBySheet.get(sheetName) || [];
    const values = headerRow.map((header) =>
      row[String(header)] !== undefined ? row[String(header)] : ''
    );
    sheet.appendRow(values);
  }

  /**
   * @description Public URL of the underlying spreadsheet.
   * @returns {string}
   */
  getUrl() {
    return this.spreadsheet.getUrl();
  }
}
