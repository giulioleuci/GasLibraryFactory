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
    const targetSheet = config.tabName ? sheets.find((s) => s.name === config.tabName) : sheets[0];
    if (!targetSheet) {
      throw new SourceError(
        `Sheet tab "${config.tabName}" not found in spreadsheet`,
        'TAB_NOT_FOUND',
        {
          sheetId,
          tabName: config.tabName
        }
      );
    }

    const gridLastRow = targetSheet.gridProperties?.rowCount ?? targetSheet.rowCount;
    const gridLastCol = targetSheet.gridProperties?.columnCount ?? targetSheet.columnCount;

    // Honor an explicit config.range the same way _resolveValues does, instead
    // of always paginating the whole grid — otherwise a recipe with a range
    // would import different data via runImportChunk than via runImport.
    const rangeBounds = config.range ? this._parseRangeBounds(config.range) : null;
    const windowStartRow = rangeBounds ? rangeBounds.startRow : 1;
    const windowEndRow = rangeBounds ? Math.min(rangeBounds.endRow, gridLastRow) : gridLastRow;
    const startCol = rangeBounds ? rangeBounds.startCol : 1;
    const lastCol = rangeBounds ? rangeBounds.endCol : gridLastCol;

    const headerOffset = hasHeaders ? 1 : 0;
    const startRow = windowStartRow + headerOffset + cursor.rowOffset;

    if (windowEndRow === 0 || windowStartRow > windowEndRow || startRow > windowEndRow) {
      return { rows: [], nextCursor: { ...cursor }, exhausted: true };
    }

    const endRow = Math.min(startRow + maxRows - 1, windowEndRow);
    const range = `${targetSheet.name}!${this._columnToLetter(startCol)}${startRow}:${this._columnToLetter(lastCol)}${endRow}`;
    const values = this._spreadsheetService.getRanges(sheetId, range) || [];

    let headers = cursor.headers;
    if (!headers) {
      if (hasHeaders) {
        const headerRange = `${targetSheet.name}!${this._columnToLetter(startCol)}${windowStartRow}:${this._columnToLetter(lastCol)}${windowStartRow}`;
        headers = (this._spreadsheetService.getRanges(sheetId, headerRange) || [[]])[0];
      } else {
        headers = Array.from({ length: lastCol - startCol + 1 }, (_, i) => `Col_${i}`);
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
    const exhausted = endRow >= windowEndRow;

    return { rows, nextCursor: { rowOffset: newRowOffset, headers }, exhausted };
  }

  /**
   * Parses an explicit A1-notation range's row/column bounds so
   * `extractChunk` can clamp its pagination window to the same rectangle
   * `_resolveValues` would fetch for the same `config.range`, instead of
   * always paginating the whole sheet grid.
   * @private
   * @param {string} range A1 notation, with or without a leading `Sheet!` prefix.
   * @returns {{startCol: number, startRow: number, endCol: number, endRow: number}|null}
   *   Parsed 1-based bounds, or `null` if the range isn't a full `A1:B2`-style
   *   rectangle (falls back to full-grid pagination in that case).
   */
  _parseRangeBounds(range) {
    const bare = range.includes('!') ? range.slice(range.indexOf('!') + 1) : range;
    const match = /^([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)$/.exec(bare);
    if (!match) {
      return null;
    }
    return {
      startCol: this._letterToColumn(match[1]),
      startRow: parseInt(match[2], 10),
      endCol: this._letterToColumn(match[3]),
      endRow: parseInt(match[4], 10)
    };
  }

  /**
   * Converts an A1-notation column letter (or letters) into its 1-based
   * column index ('A' -> 1, 'AA' -> 27). Inverse of `_columnToLetter`.
   * @private
   * @param {string} letters Column letter(s).
   * @returns {number} 1-based column index.
   */
  _letterToColumn(letters) {
    let column = 0;
    const upper = letters.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
      column = column * 26 + (upper.charCodeAt(i) - 64);
    }
    return column;
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
