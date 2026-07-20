/**
 * @fileoverview Source strategy for extracting data from all Google Sheets in a folder
 * @author GasLibraryFactory
 */

import { SourceStrategy } from './SourceStrategy.js';
import { SourceError } from '../errors/SourceError.js';

/**
 * Extraction strategy for bulk-processing all Google Sheets within a target Drive folder, supporting regex filtering and metadata tracking.
 * @class
 * @extends SourceStrategy
 */
class FolderStrategy extends SourceStrategy {
  /**
   * Initializes folder extraction strategy with Drive and Spreadsheet service facades.
   * @param {Object} logger Diagnostic output interface.
   * @param {Object} driveService GoogleApiWrapper DriveService for folder traversal.
   * @param {Object} spreadsheetService GoogleApiWrapper SpreadsheetService for data extraction.
   */
  constructor(logger, driveService, spreadsheetService) {
    super(logger);
    this._driveService = driveService;
    this._spreadsheetService = spreadsheetService;
  }

  /**
   * Implements multi-file extraction logic, traversing the folder and aggregating rows from matching spreadsheets.
   * @protected
   * @param {Object} config Extraction parameters.
   * @param {string} config.folderId physical Drive folder identifier.
   * @param {string} [config.fileNamePattern] Regex for filtering file names.
   * @param {boolean} [config.mergeData=true] If true, flattens all rows into a single array.
   * @returns {Array<Object>|Array<{fileName:string, fileId:string, data:Object[]}>} Aggregated data collection.
   * @throws {SourceError} If folder is inaccessible or regex is malformed.
   */
  _extractData(config) {
    this._validateConfig(config, ['folderId']);

    const folderId = config.folderId;
    const hasHeaders = config.hasHeaders !== false;
    const range = config.range || '';
    const tabName = config.tabName;
    const mergeData = config.mergeData !== false; // default true
    const includeSourceFile = config.includeSourceFile === true;
    const fileNamePattern = config.fileNamePattern;

    try {
      // Search for all spreadsheet files in the folder using DriveService
      this.logger.info(`[FolderStrategy] Searching for spreadsheets in folder: ${folderId}`);

      // Build search query for spreadsheets in the folder
      const query = `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
      const searchResults = this._driveService.searchFiles(query, { maxResults: 1000 });

      if (!searchResults || searchResults.length === 0) {
        this.logger.warn(`[FolderStrategy] No spreadsheet files found in folder`);
        return [];
      }

      const allData = [];
      let fileCount = 0;
      let regex;

      if (fileNamePattern) {
        try {
          regex = new RegExp(fileNamePattern);
        } catch (error) {
          throw new SourceError(
            `Invalid file name pattern regex: ${fileNamePattern}`,
            'INVALID_REGEX',
            { fileNamePattern, error: error.message }
          );
        }
      }

      // Process each file
      for (const file of searchResults) {
        const fileName = file.name;
        const fileId = file.id;

        // Skip if doesn't match pattern
        if (regex && !regex.test(fileName)) {
          this.logger.info(`[FolderStrategy] Skipping file (pattern mismatch): ${fileName}`);
          continue;
        }

        this.logger.info(`[FolderStrategy] Processing file: ${fileName}`);

        try {
          const fileData = this._extractFromFile(
            fileId,
            fileName,
            range,
            tabName,
            hasHeaders,
            includeSourceFile
          );

          if (mergeData) {
            allData.push(...fileData);
          } else {
            allData.push({
              fileName: fileName,
              fileId: fileId,
              data: fileData
            });
          }

          fileCount++;
        } catch (error) {
          this.logger.error(
            `[FolderStrategy] Failed to process file ${fileName}: ${error.message}`
          );
          // Continue processing other files
        }
      }

      this.logger.info(
        `[FolderStrategy] Processed ${fileCount} files, extracted ${allData.length} total rows`
      );

      if (fileCount === 0) {
        this.logger.warn(`[FolderStrategy] No spreadsheet files found in folder`);
      }

      return allData;
    } catch (error) {
      if (error instanceof SourceError) {
        throw error;
      }

      this.logger.error(`[FolderStrategy] Failed to extract data from folder: ${error.message}`);
      throw new SourceError(
        `Failed to extract data from folder: ${error.message}`,
        'FOLDER_EXTRACTION_FAILED',
        { folderId, originalError: error.message }
      );
    }
  }

  /**
   * Executes the extraction workflow for a single spreadsheet file within the folder.
   * @private
   * @param {string} fileId spreadsheet identifier.
   * @param {string} fileName Semantic file name for logging.
   * @param {string} range A1 notation or empty for full sheet.
   * @param {string} [tabName] Target tab identifier.
   * @param {boolean} hasHeaders If true, treats first row as property keys.
   * @param {boolean} includeSourceFile If true, injects file metadata into each row.
   * @returns {Array<Object>} Hydrated row objects from the file.
   * @throws {SourceError} If the file contains no sheets or target tab is missing.
   */
  _extractFromFile(fileId, fileName, range, tabName, hasHeaders, includeSourceFile) {
    // Get sheet information using SpreadsheetService
    const sheets = this._spreadsheetService.getSheetInfo(fileId);

    if (!sheets || sheets.length === 0) {
      throw new SourceError(`No sheets found in file: ${fileName}`, 'NO_SHEETS_FOUND', {
        fileId,
        fileName
      });
    }

    // Find the target sheet
    let targetSheet;
    if (tabName) {
      targetSheet = sheets.find((s) => s.name === tabName);
      if (!targetSheet) {
        throw new SourceError(`Tab "${tabName}" not found in file: ${fileName}`, 'TAB_NOT_FOUND', {
          fileId,
          fileName,
          tabName
        });
      }
    } else {
      targetSheet = sheets[0];
    }

    // Build the range to fetch
    let fullRange;
    if (range) {
      fullRange = range.includes('!') ? range : `${targetSheet.name}!${range}`;
    } else {
      // Get all data from the sheet
      const lastRow = targetSheet.rowCount;
      const lastCol = targetSheet.columnCount;

      if (lastRow === 0 || lastCol === 0) {
        this.logger.warn(`[FolderStrategy] Sheet is empty in file: ${fileName}`);
        return [];
      }

      fullRange = `${targetSheet.name}!A1:${this._columnToLetter(lastCol)}${lastRow}`;
    }

    // Get data using SpreadsheetService
    const values = this._spreadsheetService.getRanges(fileId, fullRange);

    if (!values || values.length === 0) {
      this.logger.warn(
        `[FolderStrategy] No data found in range ${fullRange} for file: ${fileName}`
      );
      return [];
    }

    // Convert to objects
    const data = this._arrayToObjects(values, hasHeaders);

    // Add source file metadata if requested
    if (includeSourceFile) {
      data.forEach((row) => {
        row._sourceFileName = fileName;
        row._sourceFileId = fileId;
      });
    }

    return data;
  }
}

export { FolderStrategy };
