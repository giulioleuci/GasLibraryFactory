/**
 * Integration Tests for Core Utilities and Google API Wrappers.
 *
 * Consolidates:
 * - GoogleApiWrapper (Drive/Sheet)
 * - WorkspaceTemplateEngine (Doc/Sheet substitution)
 * - Trigger Management
 * - Resilience (Quota handling)
 */

function initIntegrationTests_Utils() {
  const NS = 'Integration/Utils';

  // --- Drive & Sheet Integration ---
  runner.register(`${NS}/Drive_Sheet_Integration`, () => {
    const driveService = ServiceFactory.getDriveService();
    const spreadsheetService = ServiceFactory.getSpreadsheetService();
    
    const root = testContext.getRootFolder();
    const folderName = 'IntegrationTest_' + new Date().getTime();
    const folder = driveService.createFolder(folderName, root.getId());

    SmartAssert.notNull(folder, 'Folder should be created');

    const ss = spreadsheetService.createSpreadsheet('TestSS', folder.id);
    SmartAssert.notNull(ss, 'Spreadsheet should be created in folder');

    driveService.deleteFiles([folder.id]);  });

  // --- Trigger Management ---
  runner.register(`${NS}/Trigger_Management`, () => {
    const triggerId = TriggerTestUtils.createTestTrigger('dummyFunction', 1);
    SmartAssert.notNull(triggerId, 'Trigger should be created');
    
    const triggers = TriggerTestUtils.getAllTriggers();
    const found = triggers.find(t => t.id === triggerId);
    SmartAssert.notNull(found, 'Trigger should be found in project triggers');
    
    const deleted = TriggerTestUtils.deleteTrigger(triggerId);
    SmartAssert.isTrue(deleted, 'Trigger should be deleted');
  });

  // --- WorkspaceTemplateEngine: Document Substitution ---
  runner.register(`${NS}/TemplateEngine_Doc`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();
    
    const body = doc.getBody();
    body.appendParagraph('Hello {{name}}!');
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);
    
    docProcessor.process(doc.getId(), { name: 'World' });
    
    const updatedDoc = DocumentApp.openById(doc.getId());
    const text = updatedDoc.getBody().getText();
    SmartAssert.isTrue(text.includes('Hello World!'), 'Placeholder should be replaced');
    SmartAssert.isFalse(text.includes('{{name}}'), 'Placeholder should not remain');
  });

  // --- WorkspaceTemplateEngine: Table Rendering ---
  runner.register(`${NS}/TemplateEngine_Table`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    body.appendTable([
      ['Name', 'Role'],
      ['{{#tablerow_loop:students}}{{name}}', '{{role}}']
    ]);
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    const data = {
      students: [
        { name: 'Alice', role: 'Admin' },
        { name: 'Bob', role: 'User' }
      ]
    };

    docProcessor.process(doc.getId(), data);

    const updatedDoc = DocumentApp.openById(doc.getId());
    const updatedTable = updatedDoc.getBody().getTables()[0];
    SmartAssert.equals(updatedTable.getNumRows(), 3, 'Table should have 3 rows (header + 2 data)');
    SmartAssert.equals(updatedTable.getRow(1).getCell(0).getText(), 'Alice');
    SmartAssert.equals(updatedTable.getRow(2).getCell(0).getText(), 'Bob');
  });

  // --- Dynamic Protected Columns ---
  runner.register(`${NS}/TemplateEngine_Dynamic_Protected_Columns`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Template');
    sheet.getRange('C1').setValue('{{dynamic_columns[source=students, value=name, acl=email, scope=column]}}');
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const placeholderService = new PlaceholderService({ logger, mustache: new Mustache({ logger }) });

    const currentUser = Session.getActiveUser().getEmail();
    const context = {
      students: [
        { name: 'Student A', email: currentUser },
        { name: 'Student B', email: currentUser } // Use current user to avoid invalid user error
      ]
    };

    placeholderService.processSheet(ss.getId(), context, 'Template');
    SpreadsheetApp.flush();

    const updatedSheet = SpreadsheetApp.openById(ss.getId()).getSheetByName('Template');
    SmartAssert.equals(updatedSheet.getRange('C1').getValue(), 'Student A', 'C1 should be Student A');
    SmartAssert.equals(updatedSheet.getRange('D1').getValue(), 'Student B', 'D1 should be Student B');

    const protections = updatedSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    const ourProtections = protections.filter(p => p.getDescription() === '[WTE] Dynamic Column: students');
    SmartAssert.equals(ourProtections.length, 2, 'Should have 2 dynamic column protected ranges');
  });

  // --- Sheet Placeholder with matrice_dati ---
  runner.register(`${NS}/TemplateEngine_Matrice_Dati`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Matrix');
    sheet.getRange('A1').setValue('{{matrice_dati[sorgente=items, colonne=id;name;price, intestazioni=ID;Name;Price]}}');
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const placeholderService = new PlaceholderService({ logger, mustache: new Mustache({ logger }) });

    const data = {
      items: [
        { id: 1, name: 'Item 1', price: 10 },
        { id: 2, name: 'Item 2', price: 20 }
      ]
    };

    placeholderService.processSheet(ss.getId(), data, 'Matrix');
    SpreadsheetApp.flush();

    const values = sheet.getDataRange().getValues();
    SmartAssert.equals(values[0][0], 'ID', 'Header ID should be present');
    SmartAssert.equals(values[1][1], 'Item 1', 'First item name should be present');
    SmartAssert.equals(values[2][2], 20, 'Second item price should be present');
  });
  }

function dummyFunction() {
  Logger.log('Dummy function executed');
}
