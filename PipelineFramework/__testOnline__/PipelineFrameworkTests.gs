/**
 * 🧪 PipelineFramework Online Tests
 */

function initPipelineFrameworkTests() {
  const NS = 'PipelineFramework';

  runner.register(`${NS}/RealScenario/CustomerOnboarding`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const exceptionService = new ExceptionService(logger, utils);

    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Onboarding');
    sheet.appendRow(['Step', 'Status']);

    const pipeline = new Pipeline(logger, exceptionService);

    class LogStep extends Step {
      constructor(name) {
        super(name, logger);
      }
      _executeLogic(context) {
        sheet.appendRow([this.getName(), 'Completed']);
      }
    }

    pipeline.addStep(new LogStep('LoadData')).addStep(new LogStep('SetupWorkspace'));
    pipeline.execute({});

    const data = sheet.getDataRange().getValues();
    SmartAssert.equals(data.length, 3, 'Should have header + 2 steps');
  });

  runner.register(`${NS}/RealScenario/DataQuality`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const exceptionService = new ExceptionService(logger, utils);

    const pipeline = new Pipeline(logger, exceptionService);

    let docUrl = null;

    class ReportStep extends Step {
      constructor() {
        super('Report', logger);
      }
      _executeLogic(context) {
        const doc = DocumentApp.create('QualityReport_' + new Date().getTime());
        doc.getBody().appendParagraph('Data Quality: 100%');
        docUrl = doc.getUrl();
        doc.saveAndClose();

        // Cleanup
        DriveApp.getFileById(doc.getId()).setTrashed(true);
      }
    }

    pipeline.addStep(new ReportStep());
    pipeline.execute({});

    SmartAssert.notNull(docUrl, 'Should generate report document');
    SmartAssert.isTrue(docUrl.includes('docs.google.com'), 'Should be a valid Doc URL');
  });
}
