/**
 * 🧪 JobRunnerLib Online Tests
 */

function initJobRunnerLibTests() {
  const NS = 'JobRunnerLib';

  runner.register(`${NS}/Environment/Properties_Persistence`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const registry = new JobDefinitionRegistry(logger);
    const jobRunner = new JobRunnerService(logger, utils, registry);

    const scriptProps = PropertiesService.getScriptProperties();
    const testKey = 'job_test_' + new Date().getTime();

    scriptProps.setProperty(testKey, JSON.stringify({ status: 'OK' }));
    const val = scriptProps.getProperty(testKey);

    SmartAssert.notNull(val, 'PropertiesService should persist data');
    SmartAssert.isTrue(val.includes('OK'), 'Value should match');

    scriptProps.deleteProperty(testKey);
  });

  runner.register(`${NS}/RealScenario/ReportGeneration`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const registry = new JobDefinitionRegistry(logger);
    const jobRunner = new JobRunnerService(logger, utils, registry);

    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Reports');
    sheet.appendRow(['Dept', 'Status', 'URL']);

    function registerHandlers(queue) {
      queue.registerJobHandler('reportJob', function* (params) {
        const departments = params.depts || [];
        for (let i = 0; i < departments.length; i++) {
          const doc = DocumentApp.create('Report_' + departments[i]);
          const url = doc.getUrl();
          sheet.appendRow([departments[i], 'Generated', url]);

          // Cleanup doc
          DriveApp.getFileById(doc.getId()).setTrashed(true);

          yield { percentage: ((i + 1) / departments.length) * 100 };
        }
        return { success: true };
      });
    }

    const result = jobRunner.run(
      'report-job-' + new Date().getTime(),
      'reportJob',
      { depts: ['HR', 'IT'] },
      registerHandlers,
      true
    );

    SmartAssert.isTrue(result.success, 'Job should complete successfully');
    const data = sheet.getDataRange().getValues();
    SmartAssert.equals(data.length, 3, 'Should have header + 2 department rows');
  });
}
