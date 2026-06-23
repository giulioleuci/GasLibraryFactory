/**
 * @file SheetDBLib/src/managers/DatabaseTableRegistry.js
 * @description Manager for table registration and lifecycle within the database.
 */

export class DatabaseTableRegistry {
  constructor(facade) {
    this.facade = facade;
  }

  getTable(tableName) {
    return this.facade.tables[tableName] || null;
  }

  hasTable(tableName) {
    return !!this.facade.tables[tableName];
  }

  listTables() {
    return Object.keys(this.facade.tables);
  }
}
