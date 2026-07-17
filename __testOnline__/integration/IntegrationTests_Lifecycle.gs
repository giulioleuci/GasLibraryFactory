/**
 * Integration Tests for Google Workspace Lifecycle.
 *
 * Scenarios:
 * 1. Google Doc Full Lifecycle: Copy, Rename, Process, Share, Persist.
 * 2. Google Sheet Full Lifecycle: Copy, Rename, Process (Matrix & Dynamic Columns), Share, Persist.
 */

function initIntegrationTests_Lifecycle() {
  const NS = 'Integration/Lifecycle';

  // --- Scenario 1: Google Doc Full Lifecycle ---
  runner.register(`${NS}/Doc_Lifecycle`, () => {
    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const permissionService = ServiceFactory.getPermissionService();

    // 1. Context Preparation
    const context = {
      title: 'Project Alpha',
      items: [{ name: 'Task 1' }, { name: 'Task 2' }],
      rows: [
        { col1: 'A1', col2: 'B1' },
        { col1: 'A2', col2: 'B2' }
      ]
    };

    // 2. Setup folders and template
    const root = TestFolderManager.getOrCreateTestFolder();
    const outputFolder = TestFolderManager.createTimestampedFolder('Lifecycle_Output');

    // Create Template Doc programmatically for the test
    const templateDoc = TestFolderManager.createTimestampedDocument('Template_Doc_Lifecycle');
    const body = templateDoc.getBody();
    body.appendParagraph('Header: {{title}}');
    body.appendParagraph('Bullet List:');
    body.appendListItem('{{#bullet_list:items}}{{name}}{{/bullet_list}}');
    body.appendParagraph('Table:');
    body.appendTable([
      ['Col 1', 'Col 2'],
      ['{{#tablerow_loop:rows}}{{col1}}', '{{col2}}']
    ]);
    templateDoc.saveAndClose();
    const templateDocFile = DriveApp.getFileById(templateDoc.getId());

    // 3. Dynamic Renaming
    const newName = placeholderService.processString('Contract - {{title}}', context);
    SmartAssert.equals(newName, 'Contract - Project Alpha', 'Name should be correctly processed');

    // 4. Copy Template
    const copiedFile = templateDocFile.makeCopy(newName, outputFolder);
    const newDocId = copiedFile.getId();
    SmartAssert.notNull(newDocId, 'File should be copied');

    // 5. Content Processing
    placeholderService.processDocument(newDocId, context);

    // 6. Permission Assignment
    const testEmail = Session.getActiveUser().getEmail(); // Use current user for testing
    permissionService.shareWithUsers(newDocId, { email: testEmail, role: 'reader' });

    // 7. Database Persistence
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('GeneratedFiles');
    sheet.clear();
    sheet.appendRow(['id', 'name', 'type', 'folderId', 'createdAt']);
    SpreadsheetApp.flush();

    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const table = db.tables['GeneratedFiles'];

    table.insertRow({
      id: newDocId,
      name: newName,
      type: 'DOCUMENT',
      folderId: outputFolder.getId(),
      createdAt: new Date().toISOString()
    });
    db.save();

    // 8. Verifications
    const updatedDoc = DocumentApp.openById(newDocId);
    const text = updatedDoc.getBody().getText();
    SmartAssert.isTrue(text.includes('Header: Project Alpha'), 'Title should be replaced');
    SmartAssert.isTrue(text.includes('Task 1'), 'Bullet list item 1 should be present');
    SmartAssert.isTrue(text.includes('Task 2'), 'Bullet list item 2 should be present');

    const docTable = updatedDoc.getBody().getTables()[0];
    SmartAssert.equals(docTable.getNumRows(), 3, 'Table should have 3 rows');
    SmartAssert.equals(docTable.getRow(1).getCell(0).getText(), 'A1');

    const dbRecord = table.getByPK(newDocId);
    SmartAssert.notNull(dbRecord, 'Database record should exist');
    SmartAssert.equals(dbRecord.name, newName, 'Database name should match');
  });

  // --- Scenario 2: Google Sheet Full Lifecycle ---
  runner.register(`${NS}/Sheet_Lifecycle`, () => {
    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const permissionService = ServiceFactory.getPermissionService();

    // 1. Context Preparation
    const context = {
      title: 'Q1 Budget',
      data: [
        { c1: 'Rent', c2: 1000 },
        { c1: 'Utilities', c2: 200 }
      ],
      cols: [
        { name: 'Owner', email: Session.getActiveUser().getEmail() },
        { name: 'Approver', email: Session.getActiveUser().getEmail() }
      ]
    };

    // 2. Setup folders and template
    const root = TestFolderManager.getOrCreateTestFolder();
    const outputFolder = TestFolderManager.createTimestampedFolder('Lifecycle_Output_Sheet');

    const templateSS = TestFolderManager.createTimestampedSpreadsheet('Template_Sheet_Lifecycle');
    const sheet = templateSS.getSheets()[0];
    sheet.setName('Template');
    sheet.getRange('A1').setValue('Budget for {{title}}');
    sheet
      .getRange('A3')
      .setValue('{{matrice_dati[sorgente=data, colonne=c1;c2, intestazioni=Item;Amount]}}');
    sheet.getRange('E1').setValue('{{dynamic_columns[source=cols, value=name, acl=email]}}');
    SpreadsheetApp.flush();
    const templateFile = DriveApp.getFileById(templateSS.getId());

    // 3. Dynamic Renaming
    const newName = placeholderService.processString('Budget - {{title}}', context);

    // 4. Copy Template
    const copiedFile = templateFile.makeCopy(newName, outputFolder);
    const newSSId = copiedFile.getId();

    // 5. Content & Permission Processing
    placeholderService.processSheet(newSSId, context, 'Template');
    SpreadsheetApp.flush();

    // 6. File-Level Permissions
    permissionService.shareWithUsers(newSSId, {
      email: Session.getActiveUser().getEmail(),
      role: 'writer'
    });

    // 7. Database Persistence
    const ssDB = testContext.getSpreadsheet(); // Reuse same for simplicity
    testContext.resetSpreadsheet(ssDB); // Ensure clean state
    const dbSheet = ssDB.getSheets()[0];
    dbSheet.setName('GeneratedFiles');
    dbSheet.clear();
    dbSheet.appendRow(['id', 'name', 'type', 'folderId', 'createdAt']);
    SpreadsheetApp.flush();

    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ssDB.getId(), logger, utils, cache, exceptionService);
    const table = db.tables['GeneratedFiles'];

    table.insertRow({
      id: newSSId,
      name: newName,
      type: 'SPREADSHEET',
      folderId: outputFolder.getId(),
      createdAt: new Date().toISOString()
    });
    db.save();

    // 8. Verifications
    const updatedSS = SpreadsheetApp.openById(newSSId);
    const updatedSheet = updatedSS.getSheetByName('Template');
    SmartAssert.equals(updatedSheet.getRange('A1').getValue(), 'Budget for Q1 Budget');
    SmartAssert.equals(updatedSheet.getRange('A3').getValue(), 'Item');
    SmartAssert.equals(updatedSheet.getRange('A4').getValue(), 'Rent');

    SmartAssert.equals(updatedSheet.getRange('E1').getValue(), 'Owner');
    SmartAssert.equals(updatedSheet.getRange('F1').getValue(), 'Approver');

    const dbRecord = table.getByPK(newSSId);
    SmartAssert.notNull(dbRecord);
    SmartAssert.equals(dbRecord.name, newName);
  });
}
