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
    this._validateConfig(config, ['sheetId']);

    const sheetId = config.sheetId;
    const hasHeaders = config.hasHeaders !== false; // default true
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

      // Convert to array of objects
      const data = this._arrayToObjects(values, hasHeaders);

      this.logger.info(`[SheetByIdStrategy] Extracted ${data.length} rows from sheet`);
      return data;
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

  /**
   * Converts a 1-based numeric column index into Excel-style A1 notation letters.
   * @private
   * @param {number} column numeric index (e.g., 1 -> 'A', 27 -> 'AA').
   * @returns {string} Column alphabetic identifier.
   */
  _columnToLetter(column) {
    let letter = '';
    while (column > 0) {
      const remainder = (column - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      column = Math.floor((column - 1) / 26);
    }
    return letter;
  }
}

export { SheetByIdStrategy };
