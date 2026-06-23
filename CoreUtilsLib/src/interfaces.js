/**
 * @file CoreUtilsLib/src/interfaces.js
 * @description JSDoc interface definitions for dependency injection across GasLibraryFactory.
 *
 * This file defines formal interface contracts for injectable dependencies used throughout
 * the GasLibraryFactory libraries. These interfaces document the expected methods and
 * properties that implementations must provide to satisfy dependency injection requirements.
 *
 * **Purpose:**
 * - Document expected contracts for injectable dependencies
 * - Enable IDE autocompletion and type hints
 * - Provide implementation guidance for custom services
 * - Support interface-based validation patterns
 *
 * **Usage:**
 * Import interfaces to document expected dependencies or create custom implementations:
 *
 * ```javascript
 * import { LoggerInterface, CacheInterface } from '@CoreUtilsLib';
 *
 * // Use for JSDoc type hints
 * class MyService {
 *   constructor(logger) {
 *     this._logger = logger; // IDE knows logger implements LoggerInterface
 *   }
 * }
 * ```
 *
 * @module interfaces
 * @version 1.0.0
 */

// ============================================================================
// Shared interface-shape validator
// ============================================================================

/**
 * Single, shared validation algorithm for all interface descriptors.
 *
 * Interface descriptors are pure data (`{ name, requiredMethods, optionalMethods }`);
 * this helper provides the one runtime validation routine they all delegate to,
 * eliminating the previously copy-pasted `validate()` bodies (F-1.3 / F-2.3).
 *
 * @param {Object} obj - The candidate implementation to validate.
 * @param {Object} iface - Interface descriptor (`{ name, requiredMethods }`).
 * @returns {boolean} True if the object satisfies the interface contract.
 * @throws {Error} If the object is null/non-object or is missing required methods.
 */
export function validateInterfaceShape(obj, iface) {
  if (!obj || typeof obj !== 'object') {
    throw new Error(`${iface.name}: implementation must be a non-null object`);
  }
  const missing = iface.requiredMethods.filter((m) => typeof obj[m] !== 'function');
  if (missing.length > 0) {
    throw new Error(`${iface.name}: missing required methods: ${missing.join(', ')}`);
  }
  return true;
}

// ============================================================================
// LoggerInterface
// ============================================================================

/**
 * Interface for logger services with level-based logging capabilities.
 *
 * A valid logger must provide debug, info, warn, and error methods. All logging
 * methods accept a message string and optional context object for structured logging.
 *
 * **Required by:**
 * - All GasLibraryFactory services (GoogleService, ExceptionService, Pipeline, etc.)
 *
 * **Validation:**
 * Use `ValidationUtils.validateLogger(logger, context)` to verify compliance.
 *
 * @interface LoggerInterface
 *
 * @property {Function} debug - Log debug-level messages (verbose, development info)
 * @property {Function} info - Log info-level messages (normal operation events)
 * @property {Function} warn - Log warning-level messages (potential issues)
 * @property {Function} error - Log error-level messages (errors and failures)
 *
 * @example
 * // Minimal implementation
 * const logger = {
 *   debug: (message, context) => console.debug(message, context),
 *   info: (message, context) => console.log(message, context),
 *   warn: (message, context) => console.warn(message, context),
 *   error: (message, context) => console.error(message, context)
 * };
 *
 * @example
 * // Using LoggerService (full implementation)
 * import { LoggerService } from '@CoreUtilsLib';
 * const logger = new LoggerService({ level: 'INFO' });
 *
 * @example
 * // Using console as logger (development)
 * const logger = console; // console implements LoggerInterface
 *
 * @example
 * // Custom implementation with structured logging
 * class MyLogger {
 *   debug(message, context) {
 *     Logger.log(`[DEBUG] ${message} ${JSON.stringify(context || {})}`);
 *   }
 *   info(message, context) {
 *     Logger.log(`[INFO] ${message} ${JSON.stringify(context || {})}`);
 *   }
 *   warn(message, context) {
 *     Logger.log(`[WARN] ${message} ${JSON.stringify(context || {})}`);
 *   }
 *   error(message, context) {
 *     Logger.log(`[ERROR] ${message} ${JSON.stringify(context || {})}`);
 *   }
 * }
 */

/**
 * LoggerInterface specification object.
 *
 * Contains metadata about the LoggerInterface including required methods,
 * optional methods, and validation helper.
 *
 * @type {Object}
 * @property {string} name - Interface name
 * @property {string} description - Interface description
 * @property {string[]} requiredMethods - Array of required method names
 * @property {string[]} optionalMethods - Array of optional method names
 * @property {Function} validate - Validation function
 */
export const LoggerInterface = {
  name: 'LoggerInterface',
  description: 'Interface for logger services with level-based logging',
  requiredMethods: ['debug', 'info', 'warn', 'error'],
  optionalMethods: ['getLevel', 'setLevel', 'createChild'],

  /**
   * Validates that an object implements LoggerInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// CacheInterface
// ============================================================================

/**
 * Interface for cache services providing key-value storage with TTL support.
 *
 * A valid cache must provide get, put, and remove methods. The cache is used
 * for storing temporary data with automatic expiration.
 *
 * **Required by:**
 * - GoogleService (base class for all Google API wrappers)
 * - DatabaseService (SheetDBLib)
 * - Repository (DomainRepositoryLib)
 *
 * **Validation:**
 * Use `ValidationUtils.validateDependency(cache, 'cache', context, ['get', 'put', 'remove'])`.
 *
 * @interface CacheInterface
 *
 * @property {Function} get - Retrieve value by key (returns null if not found)
 * @property {Function} put - Store value with key and TTL in seconds
 * @property {Function} remove - Remove value by key
 *
 * @example
 * // Minimal implementation
 * const cache = {
 *   _store: new Map(),
 *   get(key) {
 *     const item = this._store.get(key);
 *     if (!item) return null;
 *     if (item.expires && Date.now() > item.expires) {
 *       this._store.delete(key);
 *       return null;
 *     }
 *     return item.value;
 *   },
 *   put(key, value, expirationInSeconds) {
 *     const expires = expirationInSeconds ? Date.now() + (expirationInSeconds * 1000) : null;
 *     this._store.set(key, { value, expires });
 *   },
 *   remove(key) {
 *     this._store.delete(key);
 *   }
 * };
 *
 * @example
 * // Using CacheService from GoogleApiWrapper
 * import { CacheService } from '@GoogleApiWrapper';
 * const cache = CacheService.getScriptCache();
 *
 * @example
 * // Using Google Apps Script native cache
 * const cache = CacheService.getScriptCache();
 */

/**
 * CacheInterface specification object.
 *
 * @type {Object}
 */
export const CacheInterface = {
  name: 'CacheInterface',
  description: 'Interface for cache services with TTL support',
  requiredMethods: ['get', 'put', 'remove'],
  optionalMethods: ['removeByPrefix', 'getAll', 'putAll', 'removeAll'],

  /**
   * Validates that an object implements CacheInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// UtilsServiceInterface
// ============================================================================

/**
 * Interface for utility services providing common helper functions.
 *
 * At minimum, a valid utils service must provide a `sleep` method for pause/delay
 * operations. The full UtilsService provides 100+ methods for dates, strings,
 * objects, arrays, and more.
 *
 * **Required by:**
 * - ExceptionService (GasResilienceLib) - requires sleep for retry delays
 * - GoogleService (GoogleApiWrapper) - general utilities
 *
 * **Validation:**
 * Use `ValidationUtils.validateDependency(utils, 'utils', context, ['sleep'])`.
 *
 * @interface UtilsServiceInterface
 *
 * @property {Function} sleep - Pause execution for specified milliseconds
 *
 * @example
 * // Minimal implementation (sleep only)
 * const utils = {
 *   sleep(ms) {
 *     Utilities.sleep(ms); // Google Apps Script
 *   }
 * };
 *
 * @example
 * // Using UtilsService (full implementation)
 * import { UtilsService } from '@CoreUtilsLib';
 * const utils = new UtilsService(Utilities.sleep);
 *
 * @example
 * // Node.js compatible implementation
 * const utils = {
 *   sleep(ms) {
 *     const end = Date.now() + ms;
 *     while (Date.now() < end) { /* busy wait */ /* }
 *   }
 * };
 */

/**
 * UtilsServiceInterface specification object.
 *
 * @type {Object}
 */
export const UtilsServiceInterface = {
  name: 'UtilsServiceInterface',
  description: 'Interface for utility services (minimum: sleep method)',
  requiredMethods: ['sleep'],
  optionalMethods: [
    'deepClone',
    'deepMerge',
    'generateUuid',
    'formatDate',
    'parseDate',
    'isEmpty',
    'isEqual',
    'chunk',
    'groupBy',
    'keyBy'
  ],

  /**
   * Validates that an object implements UtilsServiceInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// ExceptionServiceInterface
// ============================================================================

/**
 * Interface for exception handling services with retry and resilience capabilities.
 *
 * A valid exception service must provide `executeWithRetry` for automatic retry
 * of transient failures. Additional methods provide advanced error handling,
 * bypass modes, and error statistics.
 *
 * **Required by:**
 * - GoogleService (GoogleApiWrapper)
 * - ContextAssembler (ContextEngine)
 * - Pipeline (PipelineFramework)
 * - ImportEngine (GasDataImporter)
 *
 * **Validation:**
 * Use `ValidationUtils.validateDependency(exceptionService, 'exceptionService', context, ['executeWithRetry'])`.
 *
 * @interface ExceptionServiceInterface
 *
 * @property {Function} executeWithRetry - Execute function with automatic retry on failure
 * @property {Function} executeWithBypass - Execute with graceful fallback on failure
 * @property {Function} executeWithAdvancedHandling - Execute with detailed error info
 *
 * @example
 * // Minimal implementation (no retry)
 * const exceptionService = {
 *   executeWithRetry(fn, context, maxAttempts) {
 *     return fn(); // No actual retry logic
 *   },
 *   executeWithBypass(fn, context, fallback) {
 *     try { return fn(); }
 *     catch { return fallback; }
 *   }
 * };
 *
 * @example
 * // Using ExceptionService (full implementation)
 * import { ExceptionService } from '@GasResilienceLib';
 * const exceptionService = new ExceptionService(logger, utils);
 *
 * @example
 * // Using ServiceFactory
 * import { ServiceFactory } from '@GoogleApiWrapper';
 * const exceptionService = ServiceFactory.getExceptionService();
 */

/**
 * ExceptionServiceInterface specification object.
 *
 * @type {Object}
 */
export const ExceptionServiceInterface = {
  name: 'ExceptionServiceInterface',
  description: 'Interface for exception handling with retry capabilities',
  requiredMethods: ['executeWithRetry'],
  optionalMethods: ['executeWithBypass', 'executeWithAdvancedHandling', 'getErrorSummary'],

  /**
   * Validates that an object implements ExceptionServiceInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// MonitorInterface
// ============================================================================

/**
 * Interface for process monitoring services (optional visualization layer).
 *
 * Monitor services track job and step execution for visualization. This is an
 * optional dependency - core libraries work without it via optional chaining.
 *
 * **Used by (optional):**
 * - Pipeline (PipelineFramework)
 * - JobRunnerService (JobRunnerLib)
 * - ImportEngine (GasDataImporter)
 *
 * **Integration:**
 * Pass monitor via constructor options: `new Pipeline(logger, null, { monitor })`
 *
 * @interface MonitorInterface
 *
 * @property {Function} logJobStart - Log job start with ID and name
 * @property {Function} logJobComplete - Log job completion with success status
 * @property {Function} logStepStart - Log step start within a job
 * @property {Function} logStepComplete - Log step completion with status
 *
 * @example
 * // Minimal implementation
 * const monitor = {
 *   logJobStart(jobId, jobName) {
 *     console.log(`Job started: ${jobName} (${jobId})`);
 *   },
 *   logJobComplete(jobId, success) {
 *     console.log(`Job ${success ? 'completed' : 'failed'}: ${jobId}`);
 *   },
 *   logStepStart(jobId, stepName) {
 *     console.log(`Step started: ${stepName}`);
 *   },
 *   logStepComplete(jobId, stepName, success) {
 *     console.log(`Step ${success ? 'completed' : 'failed'}: ${stepName}`);
 *   }
 * };
 *
 * @example
 * // Using ProcessMonitorService
 * import { ProcessMonitorService } from '@GasProcessMonitorLib';
 * const monitor = new ProcessMonitorService(cacheService, propertiesService);
 */

/**
 * MonitorInterface specification object.
 *
 * @type {Object}
 */
export const MonitorInterface = {
  name: 'MonitorInterface',
  description: 'Interface for process monitoring (optional visualization)',
  requiredMethods: ['logJobStart', 'logJobComplete', 'logStepStart', 'logStepComplete'],
  optionalMethods: ['logStepSkipped', 'updateProgress', 'logError'],

  /**
   * Validates that an object implements MonitorInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// DataProviderInterface
// ============================================================================

/**
 * Interface for data providers in the ContextEngine.
 *
 * Data providers fetch and return data based on a provider name and parameters.
 * They are registered with ProviderRegistry and invoked by ContextAssembler
 * during recipe execution.
 *
 * **Required by:**
 * - ProviderRegistry (ContextEngine)
 * - ContextAssembler (ContextEngine)
 *
 * @interface DataProviderInterface
 *
 * @property {Function} provide - Execute provider and return data
 *
 * @example
 * // Minimal implementation
 * const userProvider = {
 *   provide(name, params) {
 *     if (name === 'currentUser') {
 *       return { id: params.userId, name: 'John Doe' };
 *     }
 *     return null;
 *   }
 * };
 *
 * @example
 * // Extending DataProvider base class
 * import { DataProvider } from '@ContextEngine';
 *
 * class UserDataProvider extends DataProvider {
 *   provide(name, params) {
 *     // Fetch user data based on name and params
 *     return this._fetchUser(params.userId);
 *   }
 * }
 */

/**
 * DataProviderInterface specification object.
 *
 * @type {Object}
 */
export const DataProviderInterface = {
  name: 'DataProviderInterface',
  description: 'Interface for data providers in ContextEngine',
  requiredMethods: ['provide'],
  optionalMethods: ['initialize', 'dispose'],

  /**
   * Validates that an object implements DataProviderInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// StepInterface
// ============================================================================

/**
 * Interface for pipeline steps in PipelineFramework.
 *
 * Steps are the building blocks of pipelines. Each step has a name and an
 * execute method that receives context and returns a result object.
 *
 * **Required by:**
 * - Pipeline (PipelineFramework)
 *
 * @interface StepInterface
 *
 * @property {Function} getName - Return the step name
 * @property {Function} execute - Execute the step with context, return result object
 *
 * @example
 * // Minimal implementation
 * const validateStep = {
 *   getName() { return 'ValidateInput'; },
 *   execute(context) {
 *     const data = context.get('input');
 *     if (!data) {
 *       return { success: false, error: new Error('Missing input') };
 *     }
 *     return { success: true, data: { validated: true } };
 *   }
 * };
 *
 * @example
 * // Extending Step base class
 * import { Step } from '@PipelineFramework';
 *
 * class ValidateInputStep extends Step {
 *   constructor() {
 *     super('ValidateInput', 'Validates input data');
 *   }
 *
 *   execute(context) {
 *     const data = context.get('input');
 *     if (!data) {
 *       return { success: false, error: new Error('Missing input') };
 *     }
 *     context.set('validated', true);
 *     return { success: true };
 *   }
 * }
 */

/**
 * StepInterface specification object.
 *
 * @type {Object}
 */
export const StepInterface = {
  name: 'StepInterface',
  description: 'Interface for pipeline steps',
  requiredMethods: ['getName', 'execute'],
  optionalMethods: ['getDescription', 'shouldExecute', 'onError'],

  /**
   * Expected return object from execute method.
   * @type {Object}
   * @property {boolean} success - Whether step succeeded
   * @property {boolean} [skipped] - Whether step was skipped
   * @property {number} [durationMs] - Execution duration in milliseconds
   * @property {Error} [error] - Error if step failed
   * @property {*} [data] - Any data produced by the step
   */
  executeReturnSchema: {
    success: 'boolean (required)',
    skipped: 'boolean (optional)',
    durationMs: 'number (optional)',
    error: 'Error (optional, present when success=false)',
    data: 'any (optional, step output data)'
  },

  /**
   * Validates that an object implements StepInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// ExpressionEngineInterface
// ============================================================================

/**
 * Interface for expression evaluation engines.
 *
 * Expression engines parse and evaluate string expressions against a context
 * object. They support comparison, logical, and special operators.
 *
 * **Required by:**
 * - ContextAssembler (ContextEngine) - for conditional provider execution
 * - ImportEngine (GasDataImporter) - for calculated fields
 *
 * @interface ExpressionEngineInterface
 *
 * @property {Function} evaluate - Evaluate expression string with context, return boolean/value
 *
 * @example
 * // Minimal implementation
 * const expressionEngine = {
 *   evaluate(expression, context) {
 *     // Simple property access: {{fieldName}}
 *     const match = expression.match(/\{\{(\w+)\}\}/);
 *     if (match) {
 *       return context[match[1]];
 *     }
 *     return false;
 *   }
 * };
 *
 * @example
 * // Using ExpressionEngineService
 * import { ExpressionEngineService } from '@GasExpressionEngineLib';
 * const engine = new ExpressionEngineService({ logger });
 *
 * // Evaluate complex expressions
 * const result = engine.evaluate('{{age}} >= 18 && {{status}} == "active"', {
 *   age: 25,
 *   status: 'active'
 * }); // returns true
 */

/**
 * ExpressionEngineInterface specification object.
 *
 * @type {Object}
 */
export const ExpressionEngineInterface = {
  name: 'ExpressionEngineInterface',
  description: 'Interface for expression evaluation engines',
  requiredMethods: ['evaluate'],
  optionalMethods: ['parseExpression', 'validateExpression'],

  /**
   * Validates that an object implements ExpressionEngineInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// ProviderRegistryInterface
// ============================================================================

/**
 * Interface for provider registries in ContextEngine.
 *
 * Provider registries manage data provider instances, supporting both singleton
 * and factory patterns for provider instantiation.
 *
 * **Required by:**
 * - ContextAssembler (ContextEngine)
 *
 * @interface ProviderRegistryInterface
 *
 * @property {Function} get - Get provider instance by type name
 * @property {Function} getRegisteredTypes - Get array of registered provider type names
 *
 * @example
 * // Minimal implementation
 * const registry = {
 *   _providers: new Map(),
 *   get(type) {
 *     return this._providers.get(type) || null;
 *   },
 *   getRegisteredTypes() {
 *     return Array.from(this._providers.keys());
 *   },
 *   register(type, provider) {
 *     this._providers.set(type, provider);
 *     return this;
 *   }
 * };
 *
 * @example
 * // Using ProviderRegistry
 * import { ProviderRegistry } from '@ContextEngine';
 * const registry = new ProviderRegistry(logger)
 *   .registerSingleton('UserProvider', new UserProvider())
 *   .registerFactory('SessionProvider', () => new SessionProvider());
 */

/**
 * ProviderRegistryInterface specification object.
 *
 * @type {Object}
 */
export const ProviderRegistryInterface = {
  name: 'ProviderRegistryInterface',
  description: 'Interface for provider registries',
  requiredMethods: ['get', 'getRegisteredTypes'],
  optionalMethods: ['register', 'registerSingleton', 'registerFactory', 'has'],

  /**
   * Validates that an object implements ProviderRegistryInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// SpreadsheetServiceInterface
// ============================================================================

/**
 * Interface for spreadsheet services providing Google Sheets operations.
 *
 * Used for reading and writing data to Google Sheets with caching and
 * resilience support.
 *
 * **Required by:**
 * - DatabaseService (SheetDBLib)
 * - ImportEngine (GasDataImporter)
 *
 * @interface SpreadsheetServiceInterface
 *
 * @property {Function} getSheetData - Get all data from a sheet
 * @property {Function} appendRow - Append a row to a sheet
 * @property {Function} updateRange - Update a range of cells
 *
 * @example
 * // Using SpreadsheetService from GoogleApiWrapper
 * import { SpreadsheetService, ServiceFactory } from '@GoogleApiWrapper';
 * const spreadsheetService = ServiceFactory.getSpreadsheetService();
 */

/**
 * SpreadsheetServiceInterface specification object.
 *
 * @type {Object}
 */
export const SpreadsheetServiceInterface = {
  name: 'SpreadsheetServiceInterface',
  description: 'Interface for spreadsheet operations',
  requiredMethods: ['getSheetData'],
  optionalMethods: ['appendRow', 'updateRange', 'clearSheet', 'getSheetNames', 'createSheet'],

  /**
   * Validates that an object implements SpreadsheetServiceInterface.
   * @param {Object} obj Object to validate.
   * @returns {boolean} True if implementation is valid.
   * @throws {Error} If validation fails (missing methods).
   */
  validate(obj) {
    return validateInterfaceShape(obj, this);
  }
};

// ============================================================================
// Utility: Interface Registry
// ============================================================================

/**
 * Registry of all available interfaces for programmatic access.
 *
 * @type {Object.<string, Object>}
 *
 * @example
 * // Validate object against interface by name
 * import { InterfaceRegistry } from '@CoreUtilsLib';
 *
 * const interfaceDef = InterfaceRegistry['LoggerInterface'];
 * interfaceDef.validate(myLogger);
 *
 * @example
 * // List all available interfaces
 * console.log(Object.keys(InterfaceRegistry));
 * // ['LoggerInterface', 'CacheInterface', 'UtilsServiceInterface', ...]
 */
export const InterfaceRegistry = {
  LoggerInterface,
  CacheInterface,
  UtilsServiceInterface,
  ExceptionServiceInterface,
  MonitorInterface,
  DataProviderInterface,
  StepInterface,
  ExpressionEngineInterface,
  ProviderRegistryInterface,
  SpreadsheetServiceInterface
};

/**
 * Validates an object against a named interface from the InterfaceRegistry.
 * @param {Object} obj Object to validate.
 * @param {string} interfaceName Name of interface.
 * @returns {boolean} True if validation passes.
 * @throws {Error} If interface is unknown or validation fails.
 */
export function validateInterface(obj, interfaceName) {
  const interfaceDef = InterfaceRegistry[interfaceName];
  if (!interfaceDef) {
    throw new Error(`Unknown interface: ${interfaceName}`);
  }
  return interfaceDef.validate(obj);
}

/**
 * Checks if an object implements a named interface (non-throwing).
 * @param {Object} obj Object to check.
 * @param {string} interfaceName Name of interface.
 * @returns {boolean} True if implementation is valid, false otherwise.
 */
export function implementsInterface(obj, interfaceName) {
  try {
    return validateInterface(obj, interfaceName);
  } catch {
    return false;
  }
}
