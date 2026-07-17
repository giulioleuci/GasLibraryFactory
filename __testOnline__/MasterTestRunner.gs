/**
 * Master Test Runner for GasLibraryFactory
 * Runs all online tests for all libraries using the EnhancedTestRunner
 *
 * IMPORTANT: These tests require the bundled library to be deployed
 * Run these tests from the Google Apps Script editor
 */

/**
 * Run tests matching a specific path or regex.
 * This is the main entry point for granular test execution.
 *
 * @param {string|RegExp} filter Optional filter for test paths (e.g. 'CoreUtilsLib', 'SheetDBLib/CRUD').
 */
function runTests(filter = null) {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('         GasLibraryFactory - Enhanced Test Runner          ');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log(`Filter: ${filter || 'ALL'}`);
  Logger.log('');

  // Initialize all tests by calling registration functions
  // This ensures the global runner registry is populated
  initializeAllTests();

  // Run the tests via the global runner instance from the bundle
  const results = runner.run(filter);

  return results;
}

/**
 * Run all online tests for all libraries.
 */
function runAllOnlineTests() {
  return runTests();
}

/**
 * Initialize the test registry by calling all library test registration functions.
 * In the new pattern, each library should expose an init function.
 */
function initializeAllTests() {
  // Each library now exposes an init[LibraryName]Tests() function.
  // We only include libraries that have real Google Apps Script interaction tests.
  // Pure JavaScript logic is tested via Jest offline.
  const initFunctions = [
    typeof initGasResilienceLibTests === 'function' ? initGasResilienceLibTests : null,
    typeof initGoogleApiWrapperTests === 'function' ? initGoogleApiWrapperTests : null,
    typeof initWorkspaceTemplateEngineTests === 'function'
      ? initWorkspaceTemplateEngineTests
      : null,
    typeof initGasExpressionEngineLibTests === 'function' ? initGasExpressionEngineLibTests : null,
    typeof initSheetDBLibTests === 'function' ? initSheetDBLibTests : null,
    typeof initJobRunnerLibTests === 'function' ? initJobRunnerLibTests : null,
    typeof initPipelineFrameworkTests === 'function' ? initPipelineFrameworkTests : null,
    typeof initContextEngineTests === 'function' ? initContextEngineTests : null,
    typeof initGasDataImporterTests === 'function' ? initGasDataImporterTests : null,
    typeof initDomainRepositoryLibTests === 'function' ? initDomainRepositoryLibTests : null,
    typeof initGasProcessMonitorLibTests === 'function' ? initGasProcessMonitorLibTests : null,
    typeof initRoleResolutionLibTests === 'function' ? initRoleResolutionLibTests : null,
    typeof initIntegrationTests === 'function' ? initIntegrationTests : null,
    typeof initHumanInspectionTests === 'function' ? initHumanInspectionTests : null
  ];

  initFunctions.forEach((fn) => {
    if (fn) fn();
  });
}

/**
 * Helper function to list all available test runners
 */
function listAvailableTestRunners() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('               Available Test Runners                      ');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('Master Test Runners:');
  Logger.log('  - runTests(filter)              Run tests matching filter (string or regex)');
  Logger.log('  - runAllOnlineTests()           Run all tests for all libraries');
  Logger.log('');
  Logger.log('Examples:');
  Logger.log('  - runTests("CoreUtilsLib")      Run all tests for CoreUtilsLib');
  Logger.log('  - runTests("SheetDBLib/CRUD")   Run only CRUD tests in SheetDBLib');
  Logger.log('═══════════════════════════════════════════════════════════');
}
