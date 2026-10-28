export {};
/**
 * Exports Validation Test
 *
 * Verifies that all expected library exports are available on `global`
 * after loading the compiled bundle. This catches issues where:
 * - Webpack tree-shaking incorrectly removes exports
 * - Module resolution fails during bundling
 * - Export names change without updating the entry point
 *
 * NOTE: Some exports share names across libraries (e.g., ValidationError,
 * ConfigurationError). After Object.assign(global, ...) the last library
 * wins. We only check that the name exists, not which library it came from.
 */

const {
  loadBundle
}: typeof import('./helpers/load-bundle.cjs') = require('./helpers/load-bundle.cjs');
const nativeCacheBeforeBundle = global.CacheService;
const nativePropertiesBeforeBundle = global.PropertiesService;
const nativeLock = {
  tryLock: jest.fn(() => true),
  waitLock: jest.fn(),
  releaseLock: jest.fn(),
  hasLock: jest.fn(() => false)
};
const nativeLockBeforeBundle = {
  getScriptLock: jest.fn(() => nativeLock),
  getUserLock: jest.fn(() => nativeLock),
  getDocumentLock: jest.fn(() => nativeLock)
};
Object.assign(global, { LockService: nativeLockBeforeBundle });

describe('Exports Validation', () => {
  beforeAll(() => {
    loadBundle();
    if (!global.__bundleLoaded) {
      throw new Error(`Bundle not loaded: ${global.__bundleError}`);
    }
  });

  it('preserves native services and wrapper identities after flattening', () => {
    const wrapper: typeof import('@GoogleApiWrapper') = Reflect.get(global, 'GoogleApiWrapper');
    expect(global.__nativeCacheService__).toBe(nativeCacheBeforeBundle);
    expect(global.__nativePropertiesService__).toBe(nativePropertiesBeforeBundle);
    expect(Reflect.get(global, 'CacheService')).toBe(wrapper.CacheService);
    expect(Reflect.get(global, 'PropertiesService')).toBe(wrapper.PropertiesService);
    expect(Reflect.get(global, 'Delegation')).toBe(
      Reflect.get(global, 'RoleResolutionLib').Delegation
    );
  });

  it('initializes the same five concrete services without emitting type-only fields', () => {
    const wrapper: typeof import('@GoogleApiWrapper') = Reflect.get(global, 'GoogleApiWrapper');
    const services = global.initializeServices();
    expect(Object.keys(services)).toEqual([
      'exceptionService',
      'logger',
      'utils',
      'spreadsheetService',
      'cacheService'
    ]);
    expect(services.logger).toBeInstanceOf(Reflect.get(global, 'LoggerService'));
    expect(services.exceptionService).toBeInstanceOf(Reflect.get(global, 'ExceptionService'));
    expect(services.utils).toBeInstanceOf(wrapper.UtilitiesService);
    expect(services.spreadsheetService).toBeInstanceOf(wrapper.SpreadsheetService);
    expect(services.cacheService).toBeInstanceOf(wrapper.CacheService);
    expect(Object.keys(services.cacheService)).toEqual(['_logger', '_exceptionService']);
    expect(new wrapper.PropertiesService(services.logger).constructor.length).toBe(1);
    expect(wrapper.TriggerService.length).toBe(1);
  });

  it('uses the native lock service after the wrapper replaces the global name', () => {
    const wrapper: typeof import('@GoogleApiWrapper') = Reflect.get(global, 'GoogleApiWrapper');
    const logger = wrapper.ServiceFactory.getLogger();
    const locks = new wrapper.LockService(logger);
    expect(locks._nativeLockService).toBe(nativeLockBeforeBundle);
    const lock = locks.getScriptLock();
    expect(lock.tryLock(1)).toBe(true);
    expect(nativeLock.tryLock).toHaveBeenCalledWith(1);
    lock.releaseLock();
    expect(nativeLock.releaseLock).toHaveBeenCalledTimes(1);
  });

  // ─── CoreUtilsLib (Layer 0 - Foundation) ────────────────────────────

  describe('CoreUtilsLib exports', () => {
    const coreExports = [
      // Core services
      'LoggerService',
      'UtilsService',
      'MyUtilsService',
      // Utility classes
      'HashUtils',
      'RegexUtils',
      'ValidationUtils',
      'PiiRedactor',
      // Error classes
      'BaseError',
      // Constants
      'TimeConstants',
      // Type Guards
      'TypeGuards',
      // LodashFacade
      'LodashFacade'
    ];

    it.each(coreExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── CoreUtilsLib - Individual Type Guards ──────────────────────────

  describe('CoreUtilsLib Type Guard exports', () => {
    const typeGuards = [
      'isString',
      'isNonEmptyString',
      'isValidNumber',
      'isFiniteNumber',
      'isInteger',
      'isPositiveInteger',
      'isBoolean',
      'isPlainObject',
      'isArray',
      'isNonEmptyArray',
      'isFunction',
      'isNilValue',
      'isDefined',
      'isEmptyValue'
    ];

    it.each(typeGuards)('should export type guard %s as function', (name) => {
      expect(typeof Reflect.get(global, name)).toBe('function');
    });
  });

  // ─── CoreUtilsLib - Lodash utilities ────────────────────────────────

  describe('CoreUtilsLib Lodash/es-toolkit exports', () => {
    const lodashExports = [
      'chunk',
      'cloneDeep',
      'merge',
      'get',
      'set',
      'groupBy',
      'keyBy',
      'isEqual',
      'debounce',
      'once',
      'camelCase',
      'kebabCase',
      'snakeCase',
      'pascalCase',
      'isEmpty',
      'orderBy',
      'uniq',
      'omit',
      'pick'
    ];

    it.each(lodashExports)('should export %s as function', (name) => {
      expect(typeof Reflect.get(global, name)).toBe('function');
    });
  });

  // ─── GasResilienceLib (Layer 1) ─────────────────────────────────────

  describe('GasResilienceLib exports', () => {
    const resilienceExports = [
      'ExceptionService',
      'TimeoutException',
      'RateLimitExceededException',
      'ResilienceConfiguration',
      'ErrorClassifier',
      'ErrorReporter',
      'RecoveryManager',
      'CircuitBreaker'
    ];

    it.each(resilienceExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── GoogleApiWrapper (Layer 2) ─────────────────────────────────────

  describe('GoogleApiWrapper exports', () => {
    const wrapperExports = [
      'ServiceFactory',
      'GoogleService',
      'DriveService',
      'SpreadsheetService',
      'DocumentService',
      'MailService',
      'PermissionService',
      'TriggerService',
      'LockService',
      'UtilitiesService',
      'UiService',
      // UI Builders
      'MenuBuilder',
      'SidebarBuilder',
      'DialogBuilder'
    ];

    it.each(wrapperExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── SheetDBLib (Layer 2) ───────────────────────────────────────────

  describe('SheetDBLib exports', () => {
    const sheetExports = ['DatabaseService', 'TableService', 'AdvancedQueryBuilder'];

    it.each(sheetExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── GasExpressionEngineLib (Layer 3) ───────────────────────────────

  describe('GasExpressionEngineLib exports', () => {
    const expressionExports = [
      'ExpressionEngineService',
      'ExpressionParserService',
      'ExpressionEvaluatorService'
    ];

    it.each(expressionExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── WorkspaceTemplateEngine (Layer 2) ──────────────────────────────

  describe('WorkspaceTemplateEngine exports', () => {
    const templateExports = [
      'PlaceholderService',
      'Mustache',
      'FilterStrategy',
      'DocumentProcessor',
      'SheetProcessor'
    ];

    it.each(templateExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── JobRunnerLib (Layer 2) ─────────────────────────────────────────

  describe('JobRunnerLib exports', () => {
    const jobExports = ['JobRunnerService', 'JobDefinitionRegistry', 'JobQueue'];

    it.each(jobExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── PipelineFramework (Layer 3) ────────────────────────────────────

  describe('PipelineFramework exports', () => {
    const pipelineExports = [
      'Pipeline',
      'Step',
      'PipelineContext',
      'PipelineError',
      'StepExecutionError',
      'ContextValidationError'
    ];

    it.each(pipelineExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── ContextEngine (Layer 4) ────────────────────────────────────────

  describe('ContextEngine exports', () => {
    const contextExports = [
      'ContextAssembler',
      'ProviderRegistry',
      'DependencyResolver',
      'RecipeParser',
      'DataProvider',
      'ContextInterceptor',
      'InterceptorRegistry',
      'CollectionProjector',
      'CollectionProjectionInterceptor'
    ];

    it.each(contextExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });

    it('does not export the removed SwapAndEnrichInterceptor', () => {
      expect(Reflect.get(global, 'SwapAndEnrichInterceptor')).toBeUndefined();
    });
  });

  // ─── GasDataImporter (Layer 4) ──────────────────────────────────────

  describe('GasDataImporter exports', () => {
    const importerExports = [
      'ImportEngine',
      'ImportConfiguration',
      'Transformer',
      'Loader',
      'SourceStrategyFactory'
    ];

    it.each(importerExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── DomainRepositoryLib (Layer 4) ──────────────────────────────────

  describe('DomainRepositoryLib exports', () => {
    const domainExports = [
      'Entity',
      'ValueObject',
      'Repository',
      // Specifications
      'Specification',
      // Mapping
      'EntityMapper',
      'HydrationService',
      'MappingConfiguration',
      // Validation
      'ZodValidator',
      'z'
    ];

    it.each(domainExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── GasSchemaValidatorLib ──────────────────────────────────────────

  describe('GasSchemaValidatorLib exports', () => {
    const gasValidatorExports = ['SchemaValidator', 'ValidationException', 'GasValidators'];

    it.each(gasValidatorExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── GasOnlineTestFramework (Layer 0) ───────────────────────────────

  describe('GasOnlineTestFramework exports', () => {
    const testFrameworkExports = ['EnhancedTestRunner', 'SmartAssert', 'TestContext'];

    it.each(testFrameworkExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });

  // ─── RoleResolutionLib (Layer 2) ────────────────────────────────────

  describe('RoleResolutionLib exports', () => {
    const roleExports = [
      'RoleResolver',
      'RoleRegistry',
      'Delegation',
      'DelegationChain',
      'DelegationValidator',
      'RoutingResolver',
      'RoutingPolicy',
      'Scope',
      'Actor',
      'Role',
      'Assignment',
      'ScopeType',
      'ActorType',
      'ResolutionStrategy',
      'AssignmentSource',
      'InMemoryAssignmentSource',
      'EffectiveAssignmentSource',
      'EffectiveAssignmentResolver',
      'WideRowAssignmentSource'
    ];

    it.each(roleExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });

    it('does not export the removed PriorityChainResolver', () => {
      expect(Reflect.get(global, 'PriorityChainResolver')).toBeUndefined();
    });
  });

  // ─── ComposableContentLib (Layer 3) ─────────────────────────────────

  describe('ComposableContentLib exports', () => {
    const contentExports = [
      'ContentComposer',
      'BlockRegistry',
      'RendererRegistry',
      'CompositionRecipe',
      'BlockDefinition',
      'ContentBlock',
      'SimpleContentBlock',
      'BlockDataContext',
      'HtmlRenderer',
      'MarkdownRenderer',
      'PlainTextRenderer'
    ];

    it.each(contentExports)('should export %s', (name) => {
      expect(Reflect.get(global, name)).toBeDefined();
    });
  });
});
