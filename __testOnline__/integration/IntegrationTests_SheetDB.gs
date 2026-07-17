/**
 * Integration Tests for SheetDBLib and related libraries.
 *
 * Consolidates:
 * - Database CRUD Cycle
 * - Data Persistence (Batch, Dates, Large Text, Transactions)
 * - Advanced Queries
 * - Repository Specification & Aggregates
 * - Expression Engine on Real Data
 * - Role Resolution (SheetDB-backed)
 */

function initIntegrationTests_SheetDB() {
  const NS = 'Integration/SheetDB';

  // --- CRUD Lifecycle ---
  runner.register(`${NS}/CRUD_Lifecycle`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);

    const sheet = ss.getSheets()[0];
    sheet.setName('Users');
    sheet.appendRow(['id', 'name', 'email', 'age', 'status']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const table = db.tables['Users'];

    // CREATE
    const inserted = table.insertRow({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      status: 'active'
    });
    db.save();

    SmartAssert.notNull(inserted.id, 'Should have generated ID');
    SmartAssert.equals(inserted.name, 'John Doe', 'Name should match');

    // READ
    const found = db.select(['name']).from('Users').where('id', '==', inserted.id).execute()[0];
    SmartAssert.equals(found.name, 'John Doe', 'Query should return correct name');

    // UPDATE
    table.updateRowById(inserted.id, { age: 31 });
    db.save();
    const updated = table.getByPK(inserted.id);
    SmartAssert.equals(updated.age, 31, 'Age should be updated');

    // DELETE
    table.deleteRowById(inserted.id);
    db.save();
    const deleted = table.getByPK(inserted.id);
    SmartAssert.isNull(deleted, 'Row should be deleted');
  });

  // --- Batch Persistence & Performance ---
  runner.register(`${NS}/Batch_Performance`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Data');
    sheet.appendRow(['id', 'name', 'value', 'timestamp']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const table = db.tables['Data'];

    const totalRows = 50; // Reduced for faster online testing
    for (let i = 1; i <= totalRows; i++) {
      table.insertRow({
        name: `Item ${i}`,
        value: i * 10,
        timestamp: new Date().toISOString()
      });
      if (i % 25 === 0) db.save();
    }
    db.save();

    const count = table.getRows().length;
    SmartAssert.equals(count, totalRows, `Should have ${totalRows} rows`);

    const sample = db.select(['value']).from('Data').where('value', '>', 400).execute();
    SmartAssert.greaterThan(sample.length, 0, 'Should find rows with value > 400');
  });

  // --- Date Handling ---
  runner.register(`${NS}/Date_Handling`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Events');
    sheet.appendRow(['id', 'name', 'created_at']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const isoDate = new Date().toISOString();

    db.tables['Events'].insertRow({
      name: 'Date Test',
      created_at: isoDate
    });
    db.save();

    const result = db.tables['Events'].getRows()[0];
    SmartAssert.equals(result.created_at, isoDate, 'ISO date string should be preserved');
  });

  // --- Large Text Handling ---
  runner.register(`${NS}/Large_Text`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Docs');
    sheet.appendRow(['id', 'content']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const largeText = 'A'.repeat(5000);

    db.tables['Docs'].insertRow({ content: largeText });
    db.save();

    const result = db.tables['Docs'].getRows()[0];
    SmartAssert.equals(result.content.length, 5000, 'Large text should not be truncated');
  });

  // --- Transaction Simulation ---
  runner.register(`${NS}/Transactions`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Accounts');
    sheet.appendRow(['id', 'account', 'balance']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const rowA = db.tables['Accounts'].insertRow({ account: 'A', balance: 1000 });
    const rowB = db.tables['Accounts'].insertRow({ account: 'B', balance: 500 });
    db.save();

    // Successful Transfer
    db.tables['Accounts'].updateRowById(rowA.id, { balance: 800 });
    db.tables['Accounts'].updateRowById(rowB.id, { balance: 700 });
    db.save();

    SmartAssert.equals(db.tables['Accounts'].getByPK(rowA.id).balance, 800);
    SmartAssert.equals(db.tables['Accounts'].getByPK(rowB.id).balance, 700);
  });

  // --- Advanced Queries & Joins ---
  runner.register(`${NS}/Advanced_Queries`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);

    const usersSheet = ss.getSheets()[0];
    usersSheet.setName('Users');
    usersSheet.appendRow(['id', 'name', 'deptId']);
    usersSheet.appendRow(['U1', 'Alice', 'D1']);

    const deptsSheet = ss.insertSheet('Depts');
    deptsSheet.appendRow(['id', 'name']);
    deptsSheet.appendRow(['D1', 'Engineering']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);

    const result = db
      .select(['Users.name', 'Depts.name as deptName'])
      .from('Users')
      .join('Depts', 'Users.deptId', '==', 'Depts.id')
      .execute();

    SmartAssert.equals(result.length, 1, 'Join should return 1 row');
    SmartAssert.equals(result[0].deptName, 'Engineering', 'Join should resolve dept name');
  });
}
