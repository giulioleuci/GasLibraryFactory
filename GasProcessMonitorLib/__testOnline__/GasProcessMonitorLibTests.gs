/**
 * 🧪 GasProcessMonitorLib Online Tests
 */

function initGasProcessMonitorLibTests() {
  const NS = 'GasProcessMonitorLib';

  runner.register(`${NS}/DashboardUi/CreateSidebar`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const mockUi = { showSidebar: () => {}, createMenu: () => {} };
    const uiService = new UiService(logger, cache, utils, exceptionService, mockUi);

    const dashboardUi = new DashboardUi(uiService, logger);
    const builder = dashboardUi.createSidebar('test-job-001', 'Test Progress');

    SmartAssert.notNull(builder, 'Should return SidebarBuilder');
    // We don't call show() in automated tests to avoid UI interruption
  });

  runner.register(`${NS}/ProcessMonitor/GetState`, () => {
    const logger = new LoggerService();
    const exceptionService = new ExceptionService(logger, new UtilsService());
    const cacheService = new CacheService(logger, exceptionService);
    const propertiesService = new PropertiesService(logger);
    const monitor = new ProcessMonitorService(logger, cacheService, propertiesService);

    const jobId = 'monitor-test-' + new Date().getTime();
    monitor.registerJob(jobId, 'Test Job');
    monitor.updateProgress(jobId, 50, 'Processing...');

    const state = monitor.getJobState(jobId);
    SmartAssert.equals(state.status, 'running', 'Should retrieve correct status');
    SmartAssert.equals(state.percentage, 50, 'Should retrieve correct percentage');
  });
}
