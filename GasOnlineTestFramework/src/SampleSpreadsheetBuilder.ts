type SampleSheet = {
  getRange(
    row: number,
    column: number,
    rows: number,
    columns: number
  ): {
    setValues(values: Parameters<GoogleAppsScript.Spreadsheet.Range['setValues']>[0]): unknown;
  };
  appendRow(values: Parameters<GoogleAppsScript.Spreadsheet.Sheet['appendRow']>[0]): unknown;
  getLastRow(): number;
};
export interface SampleSpreadsheetHandle {
  getId(): string;
  getName(): string;
  getUrl(): string;
  getSheets(): object[];
  insertSheet(name: string): SampleSheet;
  deleteSheet(sheet: object): unknown;
  getSheetByName(name: string): SampleSheet | null;
}

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
export class SampleSpreadsheetBuilder<
  Spreadsheet extends SampleSpreadsheetHandle = GoogleAppsScript.Spreadsheet.Spreadsheet
> {
  declare spreadsheet: Spreadsheet;
  declare id: string;
  declare defaultSheet: object | null;
  declare _headersBySheet: Map<string, string[]>;
  /**
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet Live spreadsheet handle.
   */
  constructor(spreadsheet: Spreadsheet) {
    this.spreadsheet = spreadsheet;
    this.id = spreadsheet.getId();
    this.defaultSheet = spreadsheet.getSheets()[0] || null;
    /** @private Header rows keyed by sheet name, as declared via {@link addSheet}. */
    this._headersBySheet = new Map();
  }

  /**
   * @description Creates a new sheet with the given header row, dropping the
   * spreadsheet's auto-created placeholder sheet the first time this is called.
   * Flushes afterwards so the new tab is immediately visible to callers reading
   * the spreadsheet back through the Advanced Sheets Service (e.g. SheetDBLib's
   * schema explorer), which — unlike `SpreadsheetApp` — does not see pending,
   * unflushed `SpreadsheetApp` writes within the same execution.
   * @param {string} name Sheet name.
   * @param {string[]} headerRow Header cell values.
   */
  addSheet(name: string, headerRow: string[]) {
    const sheet = this.spreadsheet.insertSheet(name);
    if (headerRow.length > 0) {
      sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    }
    this._headersBySheet.set(name, headerRow);
    if (this.defaultSheet !== null) {
      this.spreadsheet.deleteSheet(this.defaultSheet);
      this.defaultSheet = null;
    }
    SpreadsheetApp.flush();
  }

  /**
   * @description Appends a row to a named sheet, matching values to that sheet's header order
   * (as declared via {@link addSheet} — tracked locally rather than re-read from the live sheet,
   * to avoid an extra round-trip per row). Flushes afterwards for the same reason as
   * {@link addSheet} — row data written via `SpreadsheetApp` must be committed before any
   * Advanced-Sheets-Service-backed read (e.g. SheetDBLib) can see it.
   * @param {string} sheetName Target sheet name.
   * @param {Object<string, *>} row Values keyed by header name.
   * @throws {Error} If the named sheet does not exist.
   */
  appendRow(sheetName: string, row: Record<string, unknown>) {
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
    SpreadsheetApp.flush();
  }

  /**
   * @description Appends many rows in one setValues call, with a single flush at
   * the end. Mirrors {@link appendRow}'s header-order matching, without paying a
   * getSheetByName + appendRow + flush round-trip per row.
   * @param {string} sheetName
   * @param {Array<Object<string,*>>} rows Values keyed by header name.
   * @throws {Error} If the named sheet does not exist.
   */
  appendRows(sheetName: string, rows: Array<Record<string, unknown>>) {
    if (rows.length === 0) {
      return;
    }
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (sheet === null) {
      throw new Error(
        `Sheet "${sheetName}" not found in spreadsheet "${this.spreadsheet.getName()}".`
      );
    }
    const headerRow = this._headersBySheet.get(sheetName) || [];
    const values = rows.map((row) =>
      headerRow.map((header) => (row[String(header)] !== undefined ? row[String(header)] : ''))
    );
    sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headerRow.length).setValues(values);
    SpreadsheetApp.flush();
  }

  /**
   * @description Public URL of the underlying spreadsheet.
   * @returns {string}
   */
  getUrl() {
    return this.spreadsheet.getUrl();
  }
}
