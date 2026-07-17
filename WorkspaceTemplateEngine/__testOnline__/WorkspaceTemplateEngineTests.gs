/**
 * 🧪 WorkspaceTemplateEngine Online Tests
 */

function initWorkspaceTemplateEngineTests() {
  const NS = 'WorkspaceTemplateEngine';

  runner.register(`${NS}/Document/Substitution`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    body.appendParagraph('Hello {{name}}! Welcome to {{place}}.');
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    docProcessor.process(doc.getId(), { name: 'Alice', place: 'Wonderland' });

    const updatedDoc = DocumentApp.openById(doc.getId());
    const text = updatedDoc.getBody().getText();
    SmartAssert.isTrue(text.includes('Hello Alice'), 'Should substitute name');
    SmartAssert.isTrue(text.includes('Welcome to Wonderland'), 'Should substitute place');
  });

  runner.register(`${NS}/Document/Table_Iteration`, () => {
    testContext.resetDocument();
    const doc = testContext.getDocument();

    const body = doc.getBody();
    body.appendTable([
      ['Name', 'Age'],
      ['{{#tablerow_loop:students}}{{name}}', '{{age}}']
    ]);
    doc.saveAndClose();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const docProcessor = new DocumentProcessor(placeholderService);

    const data = {
      students: [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 }
      ]
    };

    docProcessor.process(doc.getId(), data);

    const updatedDoc = DocumentApp.openById(doc.getId());
    const table = updatedDoc.getBody().getTables()[0];
    SmartAssert.equals(table.getNumRows(), 3, 'Table should have 3 rows');
    SmartAssert.equals(table.getRow(1).getCell(0).getText(), 'Alice');
    SmartAssert.equals(table.getRow(2).getCell(0).getText(), 'Bob');
  });

  runner.register(`${NS}/Sheet/Matrix_Expansion`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];

    sheet
      .getRange('A1')
      .setValue('{{matrice_dati[sorgente=users, colonne=name;email, intestazioni=Name;Email]}}');
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const mustache = new Mustache({ logger });
    const placeholderService = new PlaceholderService({ logger, mustache });
    const sheetProcessor = new SheetProcessor(placeholderService);

    const data = {
      users: [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
      ]
    };

    sheetProcessor.process(ss.getId(), data);
    SpreadsheetApp.flush();

    const values = sheet.getDataRange().getValues();
    SmartAssert.equals(values[0][0], 'Name', 'Header Name should be present');
    SmartAssert.equals(values[1][0], 'Alice', 'First data row should be Alice');
    SmartAssert.equals(values[2][0], 'Bob', 'Second data row should be Bob');
  });
}
