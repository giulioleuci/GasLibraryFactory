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

const { loadBundle } = require('./helpers/load-bundle');

describe('Exports Validation', () => {
  beforeAll(() => {
    loadBundle();
    if (!global.__bundleLoaded) {
      throw new Error(`Bundle not loaded: ${global.__bundleError}`);
    }
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
      'ConfigurationBuilder',
      'ServiceValidator',
      'PlaceholderUtils',
      'CacheUtils',
      'PiiRedactor',
      // Data structures
      'BoundedMap',
      // Error classes
      'BaseError',
      // Constants
      'TimeConstants',
      // Type Guards
      'TypeGuards',
      // Interface definitions
      'InterfaceRegistry',
      'validateInterface',
      'implementsInterface',
      // LodashFacade
      'LodashFacade'
    ];

    it.each(coreExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
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
      expect(typeof global[name]).toBe('function');
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
      expect(typeof global[name]).toBe('function');
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
      expect(global[name]).toBeDefined();
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
      'RateLimiter',
      // UI Builders
      'MenuBuilder',
      'SidebarBuilder',
      'DialogBuilder',
      // Error handling
      'ErrorHandler',
      'ServiceError',
      'QuotaExceededError',
      'PermissionDeniedError',
      'ResourceNotFoundError',
      'ServiceUnavailableError'
    ];

    it.each(wrapperExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
    });
  });

  // ─── SheetDBLib (Layer 2) ───────────────────────────────────────────

  describe('SheetDBLib exports', () => {
    const sheetExports = [
      'DatabaseService',
      'TableService',
      'AdvancedQueryBuilder',
      // Dynamic schema
      'ColumnType',
      'SchemaResolver',
      'DynamicColumnAccessor',
      // Multi-database
      'RoutingStrategy',
      'MultiDatabaseManager',
      'CrossPartitionQuery'
    ];

    it.each(sheetExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
    });
  });

  // ─── GasExpressionEngineLib (Layer 3) ───────────────────────────────

  describe('GasExpressionEngineLib exports', () => {
    const expressionExports = [
      'ExpressionEngineService',
      'ExpressionParserService',
      'ExpressionEvaluatorService',
      'ErrorHelper'
    ];

    it.each(expressionExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
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
      expect(global[name]).toBeDefined();
    });
  });

  // ─── JobRunnerLib (Layer 2) ─────────────────────────────────────────

  describe('JobRunnerLib exports', () => {
    const jobExports = ['JobRunnerService', 'JobDefinitionRegistry', 'JobQueue'];

    it.each(jobExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
    });
  });

  // ─── PipelineFramework (Layer 3) ────────────────────────────────────

  describe('PipelineFramework exports', () => {
    const pipelineExports = [
      'Pipeline',
      'Step',
      'PostProcessableStep',
      'PipelineContext',
      'PipelineError',
      'StepExecutionError',
      'ContextValidationError',
      // PostProcessor
      'WhenCondition',
      'PostProcessor',
      'PostProcessorChain',
      'PostProcessorRegistry',
      'ValueResolver',
      // Built-in processors
      'CellUpdatePostProcessor',
      'LogAuditPostProcessor',
      'CounterUpdatePostProcessor',
      'FieldUpdatePostProcessor',
      'createDefaultRegistry'
    ];

    it.each(pipelineExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
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
      'SwapAndEnrichInterceptor'
    ];

    it.each(contextExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
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
      expect(global[name]).toBeDefined();
    });
  });

  // ─── DomainRepositoryLib (Layer 4) ──────────────────────────────────

  describe('DomainRepositoryLib exports', () => {
    const domainExports = [
      'Entity',
      'ValueObject',
      'Repository',
      'Aggregate',
      // Specifications
      'Specification',
      'SpecificationBuilder',
      // Mapping
      'EntityMapper',
      'HydrationService',
      'MappingConfiguration',
      // Validation
      'ZodValidator',
      'z',
      // Events
      'DomainEvent',
      'EventDispatcher'
    ];

    it.each(domainExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
    });
  });

  // ─── GasSchemaValidatorLib ──────────────────────────────────────────

  describe('GasSchemaValidatorLib exports', () => {
    const gasValidatorExports = ['SchemaValidator', 'ValidationException', 'GasValidators'];

    it.each(gasValidatorExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
    });
  });

  // ─── GasOnlineTestFramework (Layer 0) ───────────────────────────────

  describe('GasOnlineTestFramework exports', () => {
    const testFrameworkExports = ['EnhancedTestRunner', 'SmartAssert', 'TestContext'];

    it.each(testFrameworkExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
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
      'ResolutionStrategy'
    ];

    it.each(roleExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
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
      expect(global[name]).toBeDefined();
    });
  });

  // ─── GasProcessMonitorLib (Optional Add-on) ────────────────────────

  describe('GasProcessMonitorLib exports', () => {
    const monitorExports = ['ProcessMonitorService', 'ProcessState', 'StepState', 'DashboardUi'];

    it.each(monitorExports)('should export %s', (name) => {
      expect(global[name]).toBeDefined();
    });
  });

  // ─── Interface definitions ──────────────────────────────────────────

  describe('Interface definitions', () => {
    const interfaces = [
      'LoggerInterface',
      'CacheInterface',
      'UtilsServiceInterface',
      'ExceptionServiceInterface',
      'MonitorInterface',
      'DataProviderInterface',
      'StepInterface',
      'ExpressionEngineInterface',
      'ProviderRegistryInterface',
      'SpreadsheetServiceInterface'
    ];

    it.each(interfaces)('should export interface %s', (name) => {
      expect(global[name]).toBeDefined();
    });
  });
});
