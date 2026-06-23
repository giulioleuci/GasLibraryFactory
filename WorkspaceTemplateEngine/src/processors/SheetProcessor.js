import { SpreadsheetService, UtilitiesService } from '@GoogleApiWrapper';

/**
 * @description Specialized engine for Google Sheets template expansion using batch-first strategy.
 * Implements cell-level substitutions and structural expansions (matrices, dynamic columns) in atomic updates.
 * @class
 * @private
 */
class _SheetProcessor {
  /**
   * @description Initializes the processor with stubs for SpreadsheetService dependencies.
   * @param {PlaceholderService} placeholderService Facade providing rendering and logging.
   */
  constructor(placeholderService) {
    this.mustache = placeholderService.mustache;
    this.logger = placeholderService.logger;

    // Instantiate GoogleApiWrapper services with minimal dependencies
    const simpleCache = {
      get: () => null,
      put: () => {},
      remove: () => {}
    };
    // Use UtilitiesService from GoogleApiWrapper instead of direct Utilities API
    const utilitiesService = new UtilitiesService(this.logger);
    const simpleUtils = {
      sleep: (ms) => utilitiesService.sleep(ms)
    };
    const simpleExceptionService = {
      executeWithRetry: (fn) => fn()
    };
    this.spreadsheetService = new SpreadsheetService(
      this.logger,
      simpleCache,
      simpleUtils,
      simpleExceptionService
    );
  }

  /**
   * @description Orchestrates the scan-and-batch processing workflow for a spreadsheet.
   * Scans sheets for `{{...}}` tokens, resolves operations (matrix vs. substitution), and executes a single batch update.
   * @param {string} sheetId Target spreadsheet identifier.
   * @param {Object} context Data context for substitution.
   * @param {string|null} sheetName Specific sheet name or null for all.
   */
  process(sheetId, context, sheetName) {
    // Get sheet information using GoogleApiWrapper
    const sheetInfo = this.spreadsheetService.getSheetInfo(sheetId);

    // Filter to specific sheet if requested
    const sheetsToProcess = sheetName ? sheetInfo.filter((s) => s.name === sheetName) : sheetInfo;

    if (sheetsToProcess.length === 0) {
      this.logger.warn(`No sheets found to process. Sheet name: ${sheetName || 'all'}`);
      return;
    }

    const batchRequests = [];
    const allProtectionRequests = [];

    for (const sheet of sheetsToProcess) {
      this.logger.debug(`--- Analyzing sheet for batch update: ${sheet.name} ---`);

      // Read all data from the sheet using GoogleApiWrapper
      const range = `'${sheet.name}'!A:ZZ`;
      const values = this.spreadsheetService.getRanges(sheetId, range);

      if (!values || values.length === 0) {
        this.logger.debug(`Sheet ${sheet.name} is empty, skipping.`);
        continue;
      }

      for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < values[i].length; j++) {
          const originalValue = values[i][j];
          if (typeof originalValue !== 'string' || !originalValue.includes('{{')) {
            continue;
          }

          const row = i + 1;
          const column = j + 1;
          const cellA1 = this._columnToLetter(column) + row;
          const fullSheetName = `'${sheet.name}'!${cellA1}`;

          if (originalValue.includes('{{matrice_dati')) {
            this.logger.debug(`Found data matrix in ${cellA1}: ${originalValue}`);
            const matrixRequests = this._prepareMatrixRequests(
              sheet.name,
              row,
              column,
              originalValue,
              context
            );
            batchRequests.push(...matrixRequests);
          } else if (originalValue.includes('{{dynamic_columns')) {
            this.logger.debug(`Found dynamic columns in ${cellA1}: ${originalValue}`);
            const { valueRequests, protectionRequests } = this._prepareDynamicColumnRequests(
              sheet.name,
              row,
              column,
              originalValue,
              context
            );
            batchRequests.push(...valueRequests);
            allProtectionRequests.push(...protectionRequests);
          } else {
            const substitutedValue = this.mustache.render(originalValue, context);
            if (substitutedValue !== originalValue) {
              this.logger.debug(`Cell ${cellA1}: '${originalValue}' -> '${substitutedValue}'`);
              batchRequests.push({ range: fullSheetName, values: [[substitutedValue]] });
            }
          }
        }
      }
    }

    if (batchRequests.length > 0) {
      // Ensure the sheet grid is large enough for all batch requests
      this._expandGridIfNeeded(sheetId, sheetsToProcess, batchRequests);

      this.logger.debug(`Sending ${batchRequests.length} updates in a single batch call.`);
      this.spreadsheetService.updateRanges(sheetId, batchRequests);

      // Apply protections after values are updated
      if (allProtectionRequests.length > 0) {
        this._applyProtections(sheetId, allProtectionRequests);
      }
    } else {
      this.logger.debug('No substitutions to perform in the sheet.');
    }
  }

  /**
   * @description Generates batch update and protection requests for dynamic column expansion.
   * Parses `{{dynamic_columns[...]}}` syntax to expand array data horizontally with ACL protections.
   * @param {string} sheetName Target sheet name.
   * @param {number} startRow Starting row index (1-based).
   * @param {number} startColumn Starting column index (1-based).
   * @param {string} placeholder Raw placeholder string.
   * @param {Object} context Data context.
   * @returns {Object} Object containing `valueRequests` and `protectionRequests`.
   * @private
   */
  _prepareDynamicColumnRequests(sheetName, startRow, startColumn, placeholder, context) {
    try {
      const match = placeholder.match(/{{dynamic_columns\[(.*?)\]}}/);
      if (!match) {
        this.logger.warn(`Invalid dynamic_columns placeholder: ${placeholder}`);
        return { valueRequests: [], protectionRequests: [] };
      }

      const paramsStr = match[1];
      const params = {};
      paramsStr.split(',').forEach((p) => {
        const parts = p.split('=');
        if (parts.length === 2) {
          params[parts[0].trim()] = parts[1].trim();
        }
      });

      const { source, value: valueProp, acl: aclProp, scope = 'column' } = params;

      if (!source) {
        this.logger.warn(`Missing 'source' parameter in dynamic_columns: ${placeholder}`);
        return { valueRequests: [], protectionRequests: [] };
      }

      const sourceData = this.mustache.getValue(source, context);

      if (!Array.isArray(sourceData)) {
        this.logger.warn(`Data source '${source}' for dynamic_columns is not an array.`);
        return { valueRequests: [], protectionRequests: [] };
      }

      const valueRequests = [];
      const protectionRequests = [];
      const quotedSheetName = `'${sheetName}'`;

      // Clear placeholder cell
      const rangePlaceholder = this._rangeToA1(startRow, startColumn, startRow, startColumn);
      valueRequests.push({ range: `${quotedSheetName}!${rangePlaceholder}`, values: [['']] });

      for (let i = 0; i < sourceData.length; i++) {
        const item = sourceData[i];
        const colNum = startColumn + i;
        const colLetter = this._columnToLetter(colNum);
        const cellA1 = colLetter + startRow;

        // 1. Value Update (Header)
        const headerValue = valueProp ? this.mustache.getValue(valueProp, item) : '';
        valueRequests.push({
          range: `${quotedSheetName}!${cellA1}`,
          values: [[headerValue ?? '']]
        });

        // 2. Protection Request
        if (aclProp) {
          const acl = this.mustache.getValue(aclProp, item);
          if (acl) {
            const protectionRange = scope === 'range' ? cellA1 : `${colLetter}:${colLetter}`;
            protectionRequests.push({
              range: `${quotedSheetName}!${protectionRange}`,
              description: `[WTE] Dynamic Column: ${source}`,
              editors: {
                users: Array.isArray(acl) ? acl : [acl]
              }
            });
          }
        }
      }

      this.logger.debug(
        `Prepared ${valueRequests.length} value updates and ${protectionRequests.length} protections for dynamic columns.`
      );
      return { valueRequests, protectionRequests };
    } catch (e) {
      this.logger.error(`Error preparing dynamic columns: ${e.message}`);
      const errorCellA1 = this._rangeToA1(startRow, startColumn, startRow, startColumn);
      return {
        valueRequests: [
          {
            range: `'${sheetName}'!${errorCellA1}`,
            values: [[`ERROR: ${e.message}`]]
          }
        ],
        protectionRequests: []
      };
    }
  }

  /**
   * @description Batch applies range protections after clearing existing ones with matching descriptions.
   * Ensures idempotency by deleting prior dynamic protections before applying the new set.
   * @param {string} spreadsheetId target spreadsheet.
   * @param {Object[]} protectionRequests Array of protection configurations.
   * @private
   */
  _applyProtections(spreadsheetId, protectionRequests) {
    try {
      // 1. Identify unique descriptions to clean up
      const descriptionsToCleanup = [...new Set(protectionRequests.map((r) => r.description))];

      // 2. Get all existing protections
      const existingProtections = this.spreadsheetService.getProtectedRanges(spreadsheetId);

      // 3. Find protections to delete
      const idsToDelete = existingProtections
        .filter((p) => descriptionsToCleanup.includes(p.description))
        .map((p) => p.id);

      // 4. Delete existing protections in batch
      if (idsToDelete.length > 0) {
        this.logger.debug(`Cleaning up ${idsToDelete.length} existing dynamic protections.`);
        this.spreadsheetService.deleteProtectedRanges(spreadsheetId, idsToDelete);
      }

      // 5. Apply new protections in batch
      this.logger.debug(`Applying ${protectionRequests.length} new dynamic protections.`);
      this.spreadsheetService.protectRanges(spreadsheetId, protectionRequests);
    } catch (e) {
      this.logger.error(`Error applying protections: ${e.message}`);
    }
  }

  /**
   * @description Generates batch requests for expanding an array of objects into a table grid.
   * Parses `{{matrice_dati[...]}}` syntax to render headers and data rows.
   * @param {string} sheetName Target sheet name.
   * @param {number} startRow Top-left row index.
   * @param {number} startColumn Top-left column index.
   * @param {string} placeholder Raw placeholder.
   * @param {Object} context Data context.
   * @returns {Object[]} Collection of update requests.
   * @private
   */
  _prepareMatrixRequests(sheetName, startRow, startColumn, placeholder, context) {
    try {
      const match = placeholder.match(/sorgente=([^,]+), colonne=([^,]+), intestazioni=([^\]]+)/);
      if (!match) {
        this.logger.warn(`Invalid matrix placeholder: ${placeholder}`);
        return [];
      }

      const [, source, columnsStr, headersStr] = match;
      const sourceData = this.mustache.getValue(source.trim(), context);

      if (!Array.isArray(sourceData)) {
        this.logger.warn(`Data source '${source}' for matrix is not an array.`);
        return [];
      }

      const columns = columnsStr.split(';').map((c) => c.trim());
      const headers = headersStr.split(';').map((i) => i.trim());

      const matrix = sourceData.map((row) =>
        columns.map((col) => this.mustache.getValue(col, row) ?? '')
      );

      const requests = [];
      const quotedSheetName = `'${sheetName}'`;

      // Clear placeholder cell
      const rangePlaceholder = this._rangeToA1(startRow, startColumn, startRow, startColumn);
      requests.push({ range: `${quotedSheetName}!${rangePlaceholder}`, values: [['']] });

      // Set headers
      const rangeHeaders = this._rangeToA1(
        startRow,
        startColumn,
        startRow,
        startColumn + headers.length - 1
      );
      requests.push({ range: `${quotedSheetName}!${rangeHeaders}`, values: [headers] });

      // Set data matrix
      if (matrix.length > 0) {
        const rangeData = this._rangeToA1(
          startRow + 1,
          startColumn,
          startRow + matrix.length,
          startColumn + matrix[0].length - 1
        );
        requests.push({ range: `${quotedSheetName}!${rangeData}`, values: matrix });
      }

      this.logger.debug(`Prepared ${requests.length} batch requests for data matrix '${source}'.`);
      return requests;
    } catch (e) {
      this.logger.error(`Error preparing data matrix: ${e.message}`);
      const errorCellA1 = this._rangeToA1(startRow, startColumn, startRow, startColumn);
      return [
        {
          range: `'${sheetName}'!${errorCellA1}`,
          values: [[`ERROR: ${e.message}`]]
        }
      ];
    }
  }

  /**
   * @description Proactively expands sheet dimensions if batch requests exceed current grid limits.
   * Analyzes A1 ranges in requests to calculate the required row/column count and triggers expansion via API.
   * @param {string} spreadsheetId target spreadsheet.
   * @param {Object[]} sheets Array of sheet metadata.
   * @param {Object[]} batchRequests Collection of planned updates.
   * @private
   */
  _expandGridIfNeeded(spreadsheetId, sheets, batchRequests) {
    // Build a map of sheet name -> { sheetId, currentRows, currentCols }
    // Only include sheets that have gridProperties available
    const sheetMap = {};
    for (const sheet of sheets) {
      if (sheet.gridProperties && sheet.gridProperties.rowCount) {
        sheetMap[sheet.name] = {
          sheetId: sheet.sheetId,
          rowCount: sheet.gridProperties.rowCount,
          columnCount: sheet.gridProperties.columnCount || 26
        };
      }
    }

    // Track max row/col needed per sheet
    const maxNeeded = {};

    for (const req of batchRequests) {
      // Parse range like "'SheetName'!A1:B12" or "'SheetName'!A1"
      const rangeMatch = req.range.match(/^'([^']+)'!([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
      if (!rangeMatch) continue;

      const [, name, , startRowStr, endColStr, endRowStr] = rangeMatch;
      const endRow = endRowStr ? parseInt(endRowStr, 10) : parseInt(startRowStr, 10);
      const endCol = endColStr || rangeMatch[2];

      // Convert column letter to number
      let colNum = 0;
      for (let i = 0; i < endCol.length; i++) {
        colNum = colNum * 26 + (endCol.charCodeAt(i) - 64);
      }

      if (!maxNeeded[name]) {
        maxNeeded[name] = { maxRow: 0, maxCol: 0 };
      }
      maxNeeded[name].maxRow = Math.max(maxNeeded[name].maxRow, endRow);
      maxNeeded[name].maxCol = Math.max(maxNeeded[name].maxCol, colNum);
    }

    // Expand sheets that need more rows or columns
    for (const [name, needed] of Object.entries(maxNeeded)) {
      const info = sheetMap[name];
      if (!info) continue;

      const newRowCount = Math.max(needed.maxRow, info.rowCount);
      const newColCount = Math.max(needed.maxCol, info.columnCount);

      if (newRowCount > info.rowCount || newColCount > info.columnCount) {
        this.logger.debug(
          `Expanding sheet '${name}' grid from ${info.rowCount}x${info.columnCount} to ${newRowCount}x${newColCount}`
        );
        this.spreadsheetService.expandSheetGrid(spreadsheetId, info.sheetId, newRowCount, newColCount);
      }
    }
  }

  /**
   * @description Converts a 1-based column number to its alphabetical A1 notation (e.g., 27 -> "AA").
   * @param {number} column Column index.
   * @returns {string} Alphabetical column label.
   * @private
   */
  _columnToLetter(column) {
    let temp;
    let letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }

  /**
   * @description Formats row/column coordinates into standard A1 or range notation.
   * @param {number} startRow Starting row.
   * @param {number} startColumn Starting column.
   * @param {number} endRow Ending row.
   * @param {number} endColumn Ending column.
   * @returns {string} Range string (e.g., "A1" or "A1:B10").
   * @private
   */
  _rangeToA1(startRow, startColumn, endRow, endColumn) {
    const startCell = this._columnToLetter(startColumn) + startRow;
    if (startRow === endRow && startColumn === endColumn) {
      return startCell;
    }
    const endCell = this._columnToLetter(endColumn) + endRow;
    return `${startCell}:${endCell}`;
  }
}

// Export for use by PlaceholderService
export { _SheetProcessor as SheetProcessor };
