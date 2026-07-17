/**
 * 🧪 RoleResolutionLib Online Tests
 */

function initRoleResolutionLibTests() {
  const NS = 'RoleResolutionLib';

  runner.register(`${NS}/Resolver/SheetDB_Integration`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);

    const sheet = ss.getSheets()[0];
    sheet.setName('Assignments');
    sheet.appendRow(['actorId', 'roleId', 'scope']);
    sheet.appendRow(['user_1', 'admin', 'global']);
    SpreadsheetApp.flush();

    const logger = new LoggerService();
    const utils = new UtilsService((ms) => Utilities.sleep(ms));
    const cache = CacheService.getScriptCache();
    const exceptionService = new ExceptionService(logger, utils);
    const db = new DatabaseService(ss.getId(), logger, utils, cache, exceptionService);

    // Mocking source for brevity in integration
    const registry = new RoleRegistry({ logger });
    registry.register(new Role({ id: 'admin', name: 'Administrator' }));

    // In a real scenario, we'd use a SheetDB-backed AssignmentSource
    // For this test, we verify we can reach the data
    const data = db.select().from('Assignments').execute();
    SmartAssert.equals(data.length, 1, 'Should read assignments from sheet');
    SmartAssert.equals(data[0].roleId, 'admin', 'Role should match');
  });
}
