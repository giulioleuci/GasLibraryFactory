/**
 * 🧪 GasDataImporter Online Tests
 */

function initGasDataImporterTests() {
  const NS = 'GasDataImporter';

  runner.register(`${NS}/ImportEngine/Simple_Import`, () => {
    const ssSource = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ssSource);
    const sheetSource = ssSource.getSheets()[0];
    sheetSource.setName('Source');
    sheetSource.appendRow(['First Name', 'Last Name', 'Email']);
    sheetSource.appendRow(['John', 'Doe', 'john@example.com']);
    SpreadsheetApp.flush();

    const ssTarget = testContext.getSpreadsheet(); // Reuse same for simplicity in test
    const sheetTarget = ssTarget.insertSheet('Target_' + new Date().getTime());
    sheetTarget.appendRow(['ID', 'FIRST_NAME', 'LAST_NAME', 'EMAIL']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const driveService = new DriveService(logger, cache, utils, exceptionService);
    const spreadsheetService = new SpreadsheetService(logger, cache, utils, exceptionService);
    const db = new DatabaseService(ssTarget.getId(), logger, utils, cache, exceptionService);

    const engine = new ImportEngine(
      logger,
      driveService,
      spreadsheetService,
      db,
      null,
      exceptionService
    );

    const recipe = {
      name: 'Import Users',
      source: {
        type: 'SheetById',
        config: { sheetId: ssSource.getId(), range: 'Source!A1:C', hasHeaders: true }
      },
      transform: {
        mapping: { 'First Name': 'FIRST_NAME', 'Last Name': 'LAST_NAME', Email: 'EMAIL' }
      },
      load: {
        targetTable: sheetTarget.getName(),
        conflictResolution: 'INSERT_ONLY'
      }
    };

    const result = engine.runImport(recipe);
    SmartAssert.equals(result.load.inserted, 1, 'Should insert 1 record');

    const data = db.select().from(sheetTarget.getName()).execute();
    SmartAssert.equals(data.length, 1, 'Should have 1 record in target table');
    SmartAssert.equals(data[0].FIRST_NAME, 'John', 'Data should match');
  });

  runner.register(`${NS}/ImportEngine/Upsert_Conflict`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Inventory');
    sheet.appendRow(['SKU', 'Name', 'Qty']);
    sheet.appendRow(['SKU-001', 'Widget', 10]);
    SpreadsheetApp.flush();

    const ssSource = testContext.getSpreadsheet();
    const sheetSource = ssSource.insertSheet('Updates_' + new Date().getTime());
    sheetSource.appendRow(['SKU', 'Name', 'Qty']);
    sheetSource.appendRow(['SKU-001', 'Widget Updated', 15]); // UPSERT
    sheetSource.appendRow(['SKU-002', 'New Gadget', 5]); // INSERT
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const driveService = new DriveService(logger, cache, utils, exceptionService);
    const spreadsheetService = new SpreadsheetService(logger, cache, utils, exceptionService);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);

    const engine = new ImportEngine(
      logger,
      driveService,
      spreadsheetService,
      db,
      null,
      exceptionService
    );

    const recipe = {
      name: 'Upsert Inventory',
      source: {
        type: 'SheetById',
        config: {
          sheetId: ssSource.getId(),
          range: sheetSource.getName() + '!A1:C',
          hasHeaders: true
        }
      },
      transform: {
        mapping: { SKU: 'SKU', Name: 'Name', Qty: 'Qty' }
      },
      load: {
        targetTable: 'Inventory',
        conflictResolution: 'UPSERT',
        conflictKey: 'SKU'
      }
    };

    const result = engine.runImport(recipe);
    SmartAssert.equals(result.load.updated, 1, 'Should update 1 record');
    SmartAssert.equals(result.load.inserted, 1, 'Should insert 1 record');

    const data = db.select().from('Inventory').execute();
    SmartAssert.equals(data.length, 2, 'Should have 2 records total');
    const widget = data.find((r) => r.SKU === 'SKU-001');
    SmartAssert.equals(widget.Name, 'Widget Updated', 'Name should be updated');
    SmartAssert.equals(widget.Qty, 15, 'Qty should be updated');
  });
}
