/**
 * DomainRepositoryLib Test Suite - Reorganized
 *
 * ⚠️ IMPORTANT: This file has been reorganized!
 *
 * Tests are now organized into two categories:
 *
 * 1. LOCAL UNIT TESTS (Jest):
 *    Location: src/**/ __tests__; /*.test.js
 *    - These test individual components with mocked dependencies
 *    - Run with: npm test
 *    - Coverage: All classes and methods
 *    - Files:
 *      • src/__tests__/Entity.test.js
 *      • src/__tests__/ValueObject.test.js
 *      • src/__tests__/Aggregate.test.js
 *      • src/__tests__/Repository.test.js
 *      • src/specifications/__tests__/FieldSpecification.test.js
 *      • src/specifications/__tests__/CompositeSpecification.test.js
 *      • src/specifications/__tests__/SpecificationBuilder.test.js
 *      • src/specifications/__tests__/FunctionSpecification.test.js
 *      • src/specifications/__tests__/ExpressionSpecification.test.js
 *      • src/mapping/__tests__/EntityMapper.test.js
 *      • src/mapping/__tests__/HydrationService.test.js
 *      • src/query/__tests__/QueryTranslator.test.js
 *      • src/validation/__tests__/EntityValidator.test.js
 *      • src/events/__tests__/DomainEvent.test.js
 *      • src/events/__tests__/EventDispatcher.test.js
 *      • src/errors/__tests__/Errors.test.js
 *
 * 2. ONLINE INTEGRATION TESTS (Google Apps Script):
 *    Location: __testOnline__/OnlineTests.gs
 *    - These test integration with real Google Sheets via SheetDBLib
 *    - Run from Google Apps Script editor
 *    - Requires: TEST_SPREADSHEET_ID configuration
 *    - Tests:
 *      • Repository integration with SheetDBLib
 *      • Entity persistence lifecycle
 *      • Specification-based querying
 *      • Aggregate operations
 *      • Domain events integration
 *
 * To run online tests:
 * 1. Open __testOnline__/OnlineTests.gs
 * 2. Configure TEST_SPREADSHEET_ID
 * 3. Run: runDomainRepositoryLibOnlineTests()
 *
 * Test Structure follows the pattern from:
 * - ContextEngine (local Jest tests)
 * - GasDataImporter (online integration tests)
 */

// Placeholder function to avoid empty .gs file errors
function README_TESTS() {
  Logger.log('Tests have been reorganized!');
  Logger.log('Local unit tests: src/**/__tests__/*.test.js (run with npm test)');
  Logger.log('Online tests: __testOnline__/OnlineTests.gs (configure TEST_SPREADSHEET_ID)');
}
