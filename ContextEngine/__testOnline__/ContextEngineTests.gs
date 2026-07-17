/**
 * 🧪 ContextEngine Online Tests
 */

function initContextEngineTests() {
  const NS = 'ContextEngine';

  runner.register(`${NS}/RealScenario/UserDashboard`, () => {
    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const exceptionService = new ExceptionService(logger, utils);
    const registry = new ProviderRegistry(logger);

    class ProfileProvider extends DataProvider {
      _fetchData(params) {
        return { name: 'Sarah', role: 'PM' };
      }
    }
    registry.registerSingleton('Profile', new ProfileProvider(logger));

    const assembler = new ContextAssembler(logger, registry, null, exceptionService);
    const recipe = { providers: [{ name: 'user', type: 'Profile', parameters: {} }] };

    const context = assembler.assemble(recipe, {});
    SmartAssert.equals(context.user.name, 'Sarah', 'Should assemble name');

    // GAS Interaction
    const doc = testContext.getDocument();
    testContext.resetDocument(); // resetDocument handles reopening if closed
    const openDoc = testContext.getDocument(); // Ensure we have an open reference
    openDoc.getBody().appendParagraph('Dashboard for ' + context.user.name);
    openDoc.saveAndClose();

    const text = DocumentApp.openById(openDoc.getId()).getBody().getText();
    SmartAssert.isTrue(text.includes('Sarah'), 'Document should contain assembled name');
  });
}
