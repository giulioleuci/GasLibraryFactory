/**
 * Integration Tests for Pipelines, Jobs, and Post-Processors.
 *
 * Consolidates:
 * - Full ETL Pipeline
 * - JobRunner Lifecycle & Concurrency
 * - PostProcessor Pipeline Integration
 */

function initIntegrationTests_Workflows() {
  const NS = 'Integration/Workflows';

  // --- JobRunner Lifecycle ---
  runner.register(`${NS}/JobRunner_Lifecycle`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const registry = new JobDefinitionRegistry(logger);
    const jobRunner = new JobRunnerService(logger, utils, registry);

    const jobId = 'test-job-' + new Date().getTime();
    
    function registerHandlers(queue) {
      queue.registerJobHandler('testJob', function* (params) {
        yield { percentage: 50 };
        return { result: 'ok' };
      });
    }

    const result = jobRunner.run(jobId, 'testJob', {}, registerHandlers, true);
    SmartAssert.equals(result.result, 'ok', 'Job should return correct result');

    const status = jobRunner.getStatus(jobId);
    SmartAssert.equals(status.state, 'completed', 'Status should be completed');
    SmartAssert.equals(status.percentage, 100, 'Percentage should be 100');
  });

  // --- PostProcessor & Pipeline ---
  runner.register(`${NS}/Pipeline_PostProcessor`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.setName('Audit');
    sheet.appendRow(['id', 'timestamp', 'action', 'details']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);
    const registry = createDefaultRegistry({ logger: logger });
    
    // Create a processor that logs to Audit table
    const auditProcessor = new LogAuditPostProcessor(
      'audit-p',
      {
        table: 'Audit',
        fields: [
          { column: 'action', value: ValueSource.literal('STEP_COMPLETED') },
          { column: 'details', value: ValueSource.context('stepName') }
        ]
      },
      { database: db, logger: logger }
    );

    const context = new PostProcessorContext({
      step: { getName: () => 'TestStep' },
      stepResult: { success: true, skipped: false },
      pipelineContext: { getData: () => ({ stepName: 'MyStep' }) }
    });

    auditProcessor.execute(context);
    db.save();

    const logs = db.tables['Audit'].getRows();
    SmartAssert.equals(logs.length, 1, 'Should have 1 audit log');
    SmartAssert.equals(logs[0].details, 'MyStep', 'Details should match context value');
  });
}
