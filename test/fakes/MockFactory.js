// FILE: test/fakes/MockFactory.js
// ===================================================================
// Centralized Mock Factory for all test mocks
// Provides consistent mock creation across all tests
// ===================================================================

// Standardized Mocks from Library Source Files (Avoiding index mocks)
import * as CoreUtilsTesting from '../../CoreUtilsLib/src/testing/mocks.js';
import * as GoogleApiTesting from '../../GoogleApiWrapper/src/testing/mocks.js';
import * as GasResilienceTesting from '../../GasResilienceLib/src/testing/mocks.js';
import * as SheetDBTesting from '../../SheetDBLib/src/testing/mocks.js';
import * as PipelineTesting from '../../PipelineFramework/src/testing/mocks.js';
import * as ContextEngineTesting from '../../ContextEngine/src/testing/mocks.js';
import * as GasProcessMonitorTesting from '../../GasProcessMonitorLib/src/testing/mocks.js';
import * as ComposableContentTesting from '../../ComposableContentLib/src/testing/mocks.js';
import * as TemplateTesting from '../../WorkspaceTemplateEngine/src/testing/mocks.js';

/**
 * MockFactory - Centralized factory for creating test mocks
 *
 * This factory provides a consistent way to create all mocks needed for tests.
 * It ensures mocks are properly configured and connected.
 *
 * Usage:
 * ```javascript
 * import { MockFactory } from '../../test/fakes';
 *
 * describe('My Test', () => {
 *   let mocks;
 *
 *   beforeEach(() => {
 *     mocks = MockFactory.createAllJest();
 *   });
 *
 *   it('should work', () => {
 *     const service = new MyService(mocks.logger, mocks.utils);
 *     // ... test logic ...
 *   });
 * });
 * ```
 */
export class MockFactory {
  /**
   * Create Mustache mock
   * @param {Object} options - Options
   * @returns {TemplateTesting.MustacheMock}
   */
  static createMustache(options = {}) {
    return new TemplateTesting.MustacheMock(options);
  }

  /**
   * Create spreadsheet service mock
   * @returns {GoogleApiTesting.SpreadsheetServiceMock}
   */
  static createSpreadsheetService() {
    return MockFactory.createJestSpreadsheetService();
  }

  /**
   * Create properties service mock
   * @returns {GoogleApiTesting.PropertiesServiceMock}
   */
  static createPropertiesService() {
    return new GoogleApiTesting.PropertiesServiceMock();
  }

  /**
   * Create trigger service mock
   * @param {Object} logger - Logger instance
   * @returns {GoogleApiTesting.TriggerServiceMock}
   */
  static createTriggerService(logger) {
    return new GoogleApiTesting.TriggerServiceMock(logger);
  }

  /**
   * Create a basic Jest mock with common methods
   * @param {Array} methods - Method names to mock
   * @returns {Object} Jest mock object
   */
  static createJestMock(methods = []) {
    const mock = {};
    methods.forEach((method) => {
      mock[method] = jest.fn();
    });
    return mock;
  }

  /**
   * Create a logger Jest mock
   * @returns {CoreUtilsTesting.LoggerServiceMock}
   */
  static createJestLogger() {
    return new CoreUtilsTesting.LoggerServiceMock();
  }

  /**
   * Create a utils Jest mock
   * @returns {CoreUtilsTesting.UtilsServiceMock}
   */
  static createJestUtils() {
    return new CoreUtilsTesting.UtilsServiceMock();
  }

  /**
   * Create a cache Jest mock
   * @returns {CoreUtilsTesting.CacheInterfaceMock}
   */
  static createJestCache() {
    return new CoreUtilsTesting.CacheInterfaceMock();
  }

  /**
   * Create an exception service Jest mock
   * @returns {GasResilienceTesting.ExceptionServiceMock}
   */
  static createJestExceptionService() {
    return new GasResilienceTesting.ExceptionServiceMock();
  }

  /**
   * Create a database service Jest mock
   * @param {Object} options - Mock options (e.g., { tables: { Users: tableMock } })
   * @returns {SheetDBTesting.DatabaseServiceMock}
   */
  static createJestDatabase(options = {}) {
    const logger = options.logger || MockFactory.createJestLogger();
    const utils = options.utils || MockFactory.createJestUtils();
    const cache = options.cache || MockFactory.createJestCache();
    const exceptionService = options.exceptionService || MockFactory.createJestExceptionService();
    
    const db = new SheetDBTesting.DatabaseServiceMock(logger, utils, cache, exceptionService);
    if (options.tables) {
      Object.entries(options.tables).forEach(([name, table]) => {
        db.registerTable(name, table);
      });
    }
    return db;
  }

  /**
   * Create a table service Jest mock
   * @param {string} name - Table name
   * @returns {SheetDBTesting.TableServiceMock}
   */
  static createJestTable(name = 'TestTable') {
    return new SheetDBTesting.TableServiceMock(name);
  }

  /**
   * Create a step Jest mock
   * @param {string} name - Step name
   * @param {Function} [executeFn] - Optional custom execute implementation
   * @returns {PipelineTesting.StepMock}
   */
  static createJestStep(name = 'TestStep', executeFn = null) {
    const step = new PipelineTesting.StepMock(name);
    if (executeFn) {
      step.execute.mockImplementation(executeFn);
    }
    return step;
  }

  /**
   * Create a pipeline context Jest mock
   * @param {Object} initialData - Initial context data
   * @returns {PipelineTesting.PipelineContextMock}
   */
  static createJestPipelineContext(initialData = {}) {
    return new PipelineTesting.PipelineContextMock(initialData);
  }

  /**
   * Create a data provider Jest mock
   * @param {Object} resultData - Data to return
   * @param {string} name - Provider name
   * @returns {ContextEngineTesting.DataProviderMock}
   */
  static createJestDataProvider(resultData = null, name = 'MockProvider') {
    const provider = new ContextEngineTesting.DataProviderMock(name);
    if (resultData !== null) {
      provider.setupData(resultData);
    }
    return provider;
  }

  /**
   * Create a provider registry Jest mock
   * @param {Object} providers - Providers to seed (name -> instance)
   * @returns {ContextEngineTesting.ProviderRegistryMock}
   */
  static createJestProviderRegistry(providers = {}) {
    const registry = new ContextEngineTesting.ProviderRegistryMock();
    Object.entries(providers).forEach(([name, provider]) => {
      registry.register(name, provider);
    });
    return registry;
  }

  /**
   * Create a monitor service Jest mock
   * @returns {GasProcessMonitorTesting.ProcessMonitorServiceMock}
   */
  static createJestMonitor() {
    return new GasProcessMonitorTesting.ProcessMonitorServiceMock();
  }

  /**
   * Create a content block Jest mock
   * @param {string} typeId - Block type ID
   * @returns {ComposableContentTesting.ContentBlockMock}
   */
  static createJestContentBlock(typeId = 'mock_block') {
    return new ComposableContentTesting.ContentBlockMock(typeId);
  }

  /**
   * Create a block registry Jest mock
   * @returns {ComposableContentTesting.BlockRegistryMock}
   */
  static createJestBlockRegistry() {
    return new ComposableContentTesting.BlockRegistryMock();
  }

  /**
   * Create a spreadsheet service Jest mock
   * @returns {GoogleApiTesting.SpreadsheetServiceMock}
   */
  static createJestSpreadsheetService() {
    return new GoogleApiTesting.SpreadsheetServiceMock();
  }

  /**
   * Create a document service Jest mock
   * @returns {GoogleApiTesting.DocumentServiceMock}
   */
  static createJestDocumentService() {
    return new GoogleApiTesting.DocumentServiceMock();
  }

  /**
   * Create a drive service Jest mock
   * @returns {GoogleApiTesting.DriveServiceMock}
   */
  static createJestDriveService() {
    return new GoogleApiTesting.DriveServiceMock();
  }

  /**
   * Create a mail service Jest mock
   * @returns {GoogleApiTesting.MailServiceMock}
   */
  static createJestMailService() {
    return new GoogleApiTesting.MailServiceMock();
  }

  /**
   * Create an expression engine Jest mock
   * @returns {Object} Jest mock expression engine
   */
  static createJestExpressionEngine() {
    return {
      evaluate: jest.fn((expr, context) => {
        if (expr.includes('>')) {
          const [left, right] = expr.split('>').map((s) => s.trim());
          const leftVal = left.replace(/[{}]/g, '');
          const rightVal = parseInt(right, 10);
          return context[leftVal] > rightVal;
        }
        return true;
      }),
      parse: jest.fn(() => ({})),
      compile: jest.fn(() => ({}))
    };
  }

  /**
   * Create a lock service Jest mock
   * @returns {GoogleApiTesting.LockServiceMock}
   */
  static createJestLockService() {
    return new GoogleApiTesting.LockServiceMock();
  }

  /**
   * Create all common Jest mocks (Standardized Testing SDK)
   * @returns {Object} Object containing all Jest mocks
   */
  static createAllJest() {
    return {
      logger: MockFactory.createJestLogger(),
      cache: MockFactory.createJestCache(),
      utils: MockFactory.createJestUtils(),
      exceptionService: MockFactory.createJestExceptionService(),
      expressionEngine: MockFactory.createJestExpressionEngine(),
      database: MockFactory.createJestDatabase(),
      spreadsheetService: MockFactory.createJestSpreadsheetService(),
      propertiesService: MockFactory.createPropertiesService(),
      documentService: MockFactory.createJestDocumentService(),
      driveService: MockFactory.createJestDriveService(),
      mailService: MockFactory.createJestMailService(),
      monitor: MockFactory.createJestMonitor(),
      lockService: MockFactory.createJestLockService(),
      triggerService: MockFactory.createTriggerService(),
      mustache: MockFactory.createMustache()
    };
  }
}
