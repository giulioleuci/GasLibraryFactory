import type { SpreadsheetService } from '../../services/SpreadsheetService.js';
/**
 * @file GoogleApiWrapper/src/services/managers/SpreadsheetHybridManager.js
 * @description Manager for hybrid operations and "escape hatch" methods (Standard API).
 */

export class SpreadsheetHybridManager {
  declare facade: SpreadsheetService;
  declare _logger: SpreadsheetService['_logger'];

  constructor(facade: SpreadsheetService) {
    this.facade = facade;
    this._logger = facade._logger;
  }

  /**
   * @description Creates a new blank spreadsheet via Advanced Sheets API (no template copy required).
   * @param {string} title Spreadsheet title.
   * @param {Object} [options={}] Creation options.
   * @param {string} [options.destinationFolder] Target folder ID; moved there via Advanced Drive API after creation (Sheets API always creates in Drive root).
   * @returns {Object} Advanced Sheets API spreadsheet resource.
   */
  createSpreadsheet(
    title: string,
    options: Pick<
      GoogleAppsScript.Sheets.Schema.SpreadsheetProperties,
      'locale' | 'timeZone' | 'autoRecalc'
    > & {
      destinationFolder?: string;
      sheets?: GoogleAppsScript.Sheets.Schema.SheetProperties[];
    } = {}
  ) {
    const request: GoogleAppsScript.Sheets.Schema.Spreadsheet = { properties: { title: title } };
    if (options.locale) {
      request.properties!.locale = options.locale;
    }
    if (options.timeZone) {
      request.properties!.timeZone = options.timeZone;
    }
    if (options.autoRecalc) {
      request.properties!.autoRecalc = options.autoRecalc;
    }
    if (options.sheets) {
      request.sheets = options.sheets.map((sheet) => ({ properties: sheet }));
    }
    const spreadsheet = this.facade._executeWithRetry(
      () => Sheets!.Spreadsheets!.create(request),
      { title },
      3
    );

    if (options.destinationFolder) {
      (
        Drive!.Files!.update as (
          resource: GoogleAppsScript.Drive_v3.Drive.V3.Schema.File,
          id: string,
          media: GoogleAppsScript.Base.Blob | null,
          options: object
        ) => GoogleAppsScript.Drive_v3.Drive.V3.Schema.File
      )({}, spreadsheet.spreadsheetId!, null, {
        addParents: options.destinationFolder
      });
    }

    return spreadsheet;
  }

  openStandard(spreadsheetId: string) {
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
      throw new Error(
        'Advanced Sheets Service is not enabled. Please enable it in appsscript.json.'
      );
    }
  }
}
