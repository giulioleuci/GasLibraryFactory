/**
 * 🧪 GasResilienceLib Online Tests
 */

function initGasResilienceLibTests() {
  const NS = 'GasResilienceLib';

  runner.register(`${NS}/Spreadsheet/Retry_Operation`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const exceptionService = new ExceptionService(logger, utils);

    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.getRange('A1').setValue('Resilience Test');
    SpreadsheetApp.flush();

    // Use ExceptionService to read the value
    const value = exceptionService.executeWithRetry(
      () => {
        return sheet.getRange('A1').getValue();
      },
      {},
      3
    );

    SmartAssert.equals(value, 'Resilience Test', 'Should read spreadsheet value successfully');
  });

  runner.register(`${NS}/Drive/File_Creation_Retry`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const exceptionService = new ExceptionService(logger, utils);

    const root = testContext.getRootFolder();
    const fileName = 'Resilience_File_' + new Date().getTime();

    const file = exceptionService.executeWithRetry(
      () => {
        return root.createFile(fileName, 'Test content');
      },
      {},
      3
    );

    SmartAssert.notNull(file, 'Should create file successfully');
    SmartAssert.equals(file.getName(), fileName, 'File name should match');
    
    // Cleanup
    file.setTrashed(true);
  });

  runner.register(`${NS}/Error_Classification/GAS_Patterns`, () => {
    const logger = new LoggerService();
    const classifier = new ErrorClassifier(logger);

    // Test real GAS error patterns
    const patterns = [
      { msg: 'Service invoked too many times', category: 'QUOTA' },
      { msg: 'Rate limit exceeded', category: 'QUOTA' },
      { msg: 'Permission denied', category: 'PERMISSIONS' },
      { msg: 'File not found', category: 'NOT_FOUND' }
    ];

    patterns.forEach(p => {
      const classification = classifier.classify(new Error(p.msg));
      SmartAssert.equals(classification.category, p.category, `Should classify "${p.msg}" correctly`);
    });
  });

  runner.register(`${NS}/Document/Manipulation_Retry`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const exceptionService = new ExceptionService(logger, utils);

    const doc = testContext.getDocument();
    testContext.resetDocument(doc);

    exceptionService.executeWithRetry(
      () => {
        const body = doc.getBody();
        body.appendParagraph('Resilience Test').setHeading(DocumentApp.ParagraphHeading.HEADING1);
        return true;
      },
      {},
      3
    );

    const text = doc.getBody().getText();
    SmartAssert.isTrue(text.includes('Resilience Test'), 'Should have content in document');
  });
}
