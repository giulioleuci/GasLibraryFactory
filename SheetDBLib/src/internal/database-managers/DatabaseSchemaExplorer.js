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

  _initialize() {
    try {
      const sheets = this._spreadsheetService.getSheetInfo(this._spreadsheetId, {
        includeHidden: false
      });
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
