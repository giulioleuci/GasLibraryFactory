/**
 * 🧪 SheetDBLib Online Tests (Modernized)
 */

/**
 * Initialize SheetDBLib tests.
 */
function initSheetDBLibTests() {
  const NS = 'SheetDBLib';

  runner.register(`${NS}/DatabaseService/Initialization`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    
    SmartAssert.notNull(db, 'DatabaseService should initialize with a spreadsheet');
  });

  runner.register(`${NS}/TableService/CRUD`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    
    const tableName = 'Users';
    const sheet = ss.insertSheet(tableName);
    sheet.appendRow(['ID', 'Name', 'Email']);
    
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const spreadsheetService = new SpreadsheetService(logger, cache, utils, exceptionService);
    const table = new TableService(tableName, ss.getId(), spreadsheetService, logger, utils);
    
    // Create
    const newId = 'user_123';
    table.insertRow({ ID: newId, Name: 'Test User', Email: 'test@example.com' });
    
    // Read
    const record = table.getRowById(newId);
    SmartAssert.notNull(record, 'Should find the inserted record');
    SmartAssert.equals(record.Name, 'Test User', 'Name should match');
    
    // Update
    table.updateRowById(newId, { Name: 'Updated Name' });
    const updated = table.getRowById(newId);
    SmartAssert.equals(updated.Name, 'Updated Name', 'Name should be updated');
    
    // Delete
    table.deleteRowById(newId);
    const deleted = table.deleteRowById(newId);
    SmartAssert.isNull(deleted, 'Record should be deleted');
    });

    runner.register(`${NS}/TableService/DataTypes`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);

    const tableName = 'DataTypes';
    const sheet = ss.insertSheet(tableName);
    sheet.appendRow(['ID', 'DateVal', 'NumberVal', 'BooleanVal']);

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const spreadsheetService = new SpreadsheetService(logger, cache, utils, exceptionService);
    const table = new TableService(tableName, ss.getId(), spreadsheetService, logger, utils);

    const id = 'row_1';
    const testDate = new Date(2026, 2, 17); // 17 March 2026

    table.insertRow({
      ID: id,
      DateVal: testDate,
      NumberVal: 123.45,
      BooleanVal: true
    });

    const record = table.getRowById(id);
    SmartAssert.notNull(record, 'Record should be found');

    // Check types
    SmartAssert.isTrue(record.DateVal instanceof Date, 'DateVal should be a Date object');
    SmartAssert.equals(record.DateVal.getTime(), testDate.getTime(), 'Date should match');
    SmartAssert.equals(record.NumberVal, 123.45, 'Number should match');
    SmartAssert.isTrue(record.BooleanVal, 'Boolean should match');
    });

    runner.register(`${NS}/TableService/BulkOperations`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);

    const tableName = 'Bulk';
    const sheet = ss.insertSheet(tableName);
    sheet.appendRow(['ID', 'Status']);

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const spreadsheetService = new SpreadsheetService(logger, cache, utils, exceptionService);
    const table = new TableService(tableName, ss.getId(), spreadsheetService, logger, utils);

    // 1. Insert multiple
    table.insertRow({ ID: '1', Status: 'New' });
    table.insertRow({ ID: '2', Status: 'New' });

    // 2. Bulk update
    const updates = {
      '1': { Status: 'Processed' },
      '2': { Status: 'Processed' }
    };
    table.updateRowsByIds(updates);

    SmartAssert.equals(table.getRowById('1').Status, 'Processed', 'Row 1 should be updated');
    SmartAssert.equals(table.getRowById('2').Status, 'Processed', 'Row 2 should be updated');

    // 3. Bulk delete
    table.deleteRowsByIds(['1', '2']);
    SmartAssert.isNull(table.getRowById('1'), 'Row 1 should be deleted');
    SmartAssert.isNull(table.getRowById('2'), 'Row 2 should be deleted');
    });

    runner.register(`${NS}/Join/InnerJoin`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    
    const authors = ss.insertSheet('Authors');
    authors.appendRow(['id', 'name']);
    authors.appendRow(['1', 'John']);
    
    const books = ss.insertSheet('Books');
    books.appendRow(['id', 'title', 'author_id']);
    books.appendRow(['b1', 'Book 1', '1']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    
    const results = db.select(['Authors.name', 'Books.title'])
      .from('Authors')
      .join('Books', 'Authors.id', '==', 'Books.author_id')
      .execute();

    SmartAssert.equals(results.length, 1, 'Should return 1 joined row');
    SmartAssert.equals(results[0]['Authors.name'], 'John');
  });

  runner.register(`${NS}/MultiDatabase/PartitionRouting`, () => {
    const partition = new DatabasePartition({
      id: 'p1',
      spreadsheetId: 'dummy-id',
      tags: ['europe']
    });
    
    SmartAssert.equals(partition.id, 'p1', 'Partition ID should match');
    SmartAssert.isTrue(partition.hasTag('europe'), 'Should have tag');
  });
}
