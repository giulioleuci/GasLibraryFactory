/**
 * 🧪 Integration Test Runner (Modernized)
 */

function initIntegrationTests() {
  // Call individual integration test initializers
  if (typeof initIntegrationTests_SheetDB === 'function') initIntegrationTests_SheetDB();
  if (typeof initIntegrationTests_Workflows === 'function') initIntegrationTests_Workflows();
  if (typeof initIntegrationTests_Utils === 'function') initIntegrationTests_Utils();
  if (typeof initIntegrationTests_Lifecycle === 'function') initIntegrationTests_Lifecycle();
  if (typeof initIntegrationTests_DriveWrapper === 'function') initIntegrationTests_DriveWrapper();

  // Register generic integration tests if any
  const NS = 'Integration';

  runner.register(`${NS}/Master/HealthCheck`, () => {
    SmartAssert.notNull(testContext, 'TestContext should be available');
    SmartAssert.notNull(testContext.getRootFolder(), 'Root folder should be accessible');
  });
}

/**
 * Legacy entry point for backward compatibility in the GAS editor
 */
function runAllIntegrationTests() {
  return runTests('Integration');
}
