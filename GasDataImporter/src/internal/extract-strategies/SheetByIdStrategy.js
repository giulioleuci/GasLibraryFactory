/**
 * @fileoverview Source strategy for extracting data from a Google Sheet by ID
 * @author GasLibraryFactory
 */

import { SourceStrategy } from './SourceStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
 * Extraction strategy for retrieving data from a specific Google Sheets document using its ID, supporting targeted tab and range selection.
 * @class
 * @extends SourceStrategy
 */
class SheetByIdStrategy extends SourceStrategy {
  /**
   * Initializes sheet extraction strategy with Spreadsheet service facade.
   * @param {Object} logger Diagnostic output interface.
   * @param {Object} spreadsheetService GoogleApiWrapper SpreadsheetService for data access.
   */
  constructor(logger, spreadsheetService) {
    super(logger);
    this._spreadsheetService = spreadsheetService;
  }

  /**
   * Implements single-document extraction logic, resolving metadata and fetching cell values via SpreadsheetService.
   * @protected
   * @param {Object} config Extraction parameters.
   * @param {string} config.sheetId physical spreadsheet identifier.
   * @param {string} [config.tabName] Target tab identifier (defaults to first).
   * @param {string} [config.range=''] A1 notation or empty for full sheet.
   * @param {boolean} [config.hasHeaders=true] If true, treats first row as property keys.
   * @returns {Array<Object>} Hydrated row objects from the sheet.
   * @throws {SourceError} If document is inaccessible, has no sheets, or target tab is missing.
   */
  _extractData(config) {
    const hasHeaders = config.hasHeaders !== false; // default true
    const values = this._resolveValues(config);
    const data = this._arrayToObjects(values, hasHeaders);
    this.logger.info(`[SheetByIdStrategy] Extracted ${data.length} rows from sheet`);
    return data;
  }

  /**
   * Extracts the raw grid (no header-object mapping) for callers that need
   * `string[][]`-shaped data rather than import-recipe row objects — e.g.
   * inserting a data-driven table into a Google Doc (ref REPORT_GLF.md B6).
   * Shares the same sheet/tab/range resolution as `extract()`, so both use
   * cases stay in sync with a single implementation.
   * @param {Object} config Extraction parameters (see `_extractData`).
   * @returns {Array<Array<*>>} Raw grid values, header row included if present.
   * @throws {SourceError} If document is inaccessible, has no sheets, or target tab is missing.
   */
  extractRaw(config) {
    this.logger.info(
      `[SheetByIdStrategy] Extracting raw grid with config:`,
      JSON.stringify(config)
    );
    return this._resolveValues(config);
  }

  /**
   * Indicates that this strategy can paginate extraction via `extractChunk`.
   * @returns {boolean} Always true for `SheetByIdStrategy`.
   */
  supportsCursor() {
    return true;
  }

  /**
   * Extracts a single bounded window of rows from the sheet, starting at
   * `cursor.rowOffset` data rows past the header (if any), for incremental
   * import runs that must checkpoint mid-recipe. Shares tab/header
   * resolution semantics with `_resolveValues`/`_extractData`, but issues a
   * narrower `getRanges` call per chunk instead of reading the whole sheet.
   * @param {Object} config Extraction parameters (see `_extractData`).
   * @param {Object} cursor Opaque cursor from a previous `extractChunk` call,
   *   or `{ rowOffset: 0, headers: null }` to start from the beginning.
   * @param {number} cursor.rowOffset Number of data rows already consumed.
   * @param {Array<string>|null} cursor.headers Header row, cached after the
   *   first chunk so subsequent chunks don't re-fetch it.
   * @param {number} maxRows Maximum number of data rows to extract in this chunk.
   * @returns {{rows: Array<Object>, nextCursor: Object, exhausted: boolean}} Chunk result.
   * @throws {SourceError} If document is inaccessible, has no sheets, or target tab is missing.
   */
  extractChunk(config, cursor, maxRows) {
    this._validateConfig(config, ['sheetId']);
    const hasHeaders = config.hasHeaders !== false;
    const sheetId = config.sheetId;
    const sheets = this._spreadsheetService.getSheetInfo(sheetId);
    if (!sheets || sheets.length === 0) {
      throw new SourceError('Spreadsheet has no sheets', 'NO_SHEETS_FOUND', { sheetId });
    }
    const targetSheet = config.tabName
      ? sheets.find((s) => s.name === config.tabName)
      : sheets[0];
    if (!targetSheet) {
      throw new SourceError(`Sheet tab "${config.tabName}" not found in spreadsheet`, 'TAB_NOT_FOUND', {
        sheetId,
        tabName: config.tabName
      });
    }

    const lastRow = targetSheet.gridProperties?.rowCount ?? targetSheet.rowCount;
    const lastCol = targetSheet.gridProperties?.columnCount ?? targetSheet.columnCount;
    const headerOffset = hasHeaders ? 1 : 0;
    const startRow = headerOffset + cursor.rowOffset + 1;

    if (lastRow === 0 || startRow > lastRow) {
      return { rows: [], nextCursor: { ...cursor }, exhausted: true };
    }

    const endRow = Math.min(startRow + maxRows - 1, lastRow);
    const range = `${targetSheet.name}!A${startRow}:${this._columnToLetter(lastCol)}${endRow}`;
    const values = this._spreadsheetService.getRanges(sheetId, range) || [];

    let headers = cursor.headers;
    if (!headers) {
      if (hasHeaders) {
        const headerRange = `${targetSheet.name}!A1:${this._columnToLetter(lastCol)}1`;
        headers = (this._spreadsheetService.getRanges(sheetId, headerRange) || [[]])[0];
      } else {
        headers = Array.from({ length: lastCol }, (_, i) => `Col_${i}`);
      }
    }

    const rows = values.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = this._coerceValue(row[index] !== undefined ? row[index] : null);
      });
      return obj;
    });

    const consumedRows = endRow - startRow + 1;
    const newRowOffset = cursor.rowOffset + consumedRows;
    const exhausted = endRow >= lastRow;

    return { rows, nextCursor: { rowOffset: newRowOffset, headers }, exhausted };
  }

  /**
   * Resolves the target tab/range and fetches the raw grid via
   * SpreadsheetService, shared by `_extractData` (import recipes) and
   * `extractRaw` (raw grid consumers).
   * @private
   * @param {Object} config Extraction parameters (see `_extractData`).
   * @returns {Array<Array<*>>} Raw grid values (possibly empty).
   * @throws {SourceError} If document is inaccessible, has no sheets, or target tab is missing.
   */
  _resolveValues(config) {
    this._validateConfig(config, ['sheetId']);

    const sheetId = config.sheetId;
    const range = config.range || '';
    const tabName = config.tabName;

    try {
      // Get sheet information using SpreadsheetService
      this.logger.info(`[SheetByIdStrategy] Getting sheet info for spreadsheet: ${sheetId}`);
      const sheets = this._spreadsheetService.getSheetInfo(sheetId);

      if (!sheets || sheets.length === 0) {
        throw new SourceError('Spreadsheet has no sheets', 'NO_SHEETS_FOUND', { sheetId });
      }

      // Get the sheet/tab
      let targetSheet;
      if (tabName) {
        targetSheet = sheets.find((s) => s.name === tabName);
        if (!targetSheet) {
          throw new SourceError(
            `Sheet tab "${tabName}" not found in spreadsheet`,
            'TAB_NOT_FOUND',
            { sheetId, tabName }
          );
        }
      } else {
        targetSheet = sheets[0];
      }

      this.logger.info(`[SheetByIdStrategy] Reading from sheet: ${targetSheet.name}`);

      // Build the range to fetch
      let fullRange;
      if (range) {
        // Parse range to determine if it includes sheet name
        fullRange = range.includes('!') ? range : `${targetSheet.name}!${range}`;
      } else {
        // Get all data from the sheet
        const lastRow = targetSheet.gridProperties?.rowCount ?? targetSheet.rowCount;
        const lastCol = targetSheet.gridProperties?.columnCount ?? targetSheet.columnCount;

        if (lastRow === 0 || lastCol === 0) {
          this.logger.warn(`[SheetByIdStrategy] Sheet is empty`);
          return [];
        }

        fullRange = `${targetSheet.name}!A1:${this._columnToLetter(lastCol)}${lastRow}`;
      }

      // Get data using SpreadsheetService
      const values = this._spreadsheetService.getRanges(sheetId, fullRange);

      if (!values || values.length === 0) {
        this.logger.warn(`[SheetByIdStrategy] No data found in range ${fullRange}`);
        return [];
      }

      return values;
    } catch (error) {
      if (error instanceof SourceError) {
        throw error;
      }

      this.logger.error(`[SheetByIdStrategy] Failed to extract data: ${error.message}`);
      throw new SourceError(
        `Failed to extract data from sheet: ${error.message}`,
        'SHEET_EXTRACTION_FAILED',
        { sheetId, tabName, range, originalError: error.message }
      );
    }
  }
}

export { SheetByIdStrategy };
