/**
 * @file SheetDBLib/src/managers/DatabaseMetaDataHandler.js
 * @description Manager for database metadata, configuration flags, and dry-run logic.
 */

export class DatabaseMetaDataHandler {
  constructor(facade) {
    this.facade = facade;
  }

  _isDryRun(options = {}) {
    if (typeof options.dryRun === 'boolean') {
      return options.dryRun;
    }
    return this.facade._dryRun;
  }

  getMetadata() {
    return {
      spreadsheetId: this.facade._spreadsheetId,
      loaded: this.facade._loaded,
      inTransaction: this.facade._inTransaction,
      dryRun: this.facade._dryRun,
      tableCount: Object.keys(this.facade.tables).length
    };
  }
}
