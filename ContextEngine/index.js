// ===================================================================
// FILE: ContextEngine/index.js
// ===================================================================
// Main entry point for ContextEngine ES Module exports
// ===================================================================

/**
 * ContextEngine - Declarative Data Assembly from Recipes
 *
 * @module ContextEngine
 *
 * @description
 * ContextEngine provides a generic, declarative system for assembling complex data contexts
 * (Unified Data Contexts) from disparate sources based on JSON recipes. It enables automatic
 * dependency resolution, conditional execution, and transformation of data from multiple providers.
 *
 * ## Architecture
 *
 * The engine uses a **recipe-based execution model** with automatic dependency resolution:
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                      ContextAssembler (Facade)                  │
 * │  Main orchestrator - executes recipes, coordinates components   │
 * └────────────┬────────────────────────────────────────────────────┘
 *              │
 *    ┌─────────┴─────────────────────────────┐
 *    │                                       │
 * ┌──▼──────────────────┐        ┌──────────▼─────────────┐
 * │  ProviderRegistry   │        │  DependencyResolver    │
 * │  Manages provider   │        │  Resolves @param and   │
 * │  instances          │        │  $provider references  │
 * │  (Singleton/Factory)│        │                        │
 * └──┬──────────────────┘        └────────────────────────┘
 *    │
 *    │  ┌────────────────┐       ┌────────────────────────┐
 *    └─►│  DataProvider  │◄──────│  RecipeParser          │
 *       │  (Abstract)    │       │  Validates recipes     │
 *       └────────────────┘       └────────────────────────┘
 *              ▲
 *              │
 *       Custom Providers
 *       (UserDataProvider,
 *        OrderDataProvider, etc.)
 * ```
 *
 * **Execution Flow**:
 * 1. RecipeParser validates recipe structure
 * 2. DependencyResolver builds execution order based on dependencies
 * 3. For each provider in dependency order:
 *    a. Resolve parameters (@param, $provider.property)
 *    b. Evaluate condition using ExpressionEngineService
 *    c. If condition passes, execute provider via ProviderRegistry
 *    d. Apply post-processors to transform data
 *    e. Add result to context
 * 4. Return assembled context object
 *
 * ## Key Features
 *
 * ### 1. Recipe-Based Configuration
 * - JSON-based declarative recipes
 * - No code changes required for new data assembly patterns
 * - Version-controlled recipe definitions
 * - Recipe validation with detailed error messages
 *
 * ### 2. Automatic Dependency Resolution
 * - **@param references**: Resolve to initial parameters
 * - **$provider.property references**: Resolve to previous provider outputs
 * - Topological sorting ensures correct execution order
 * - Circular dependency detection
 * - Nested property access (e.g., `$userData.address.city`)
 *
 * ### 3. Provider Registry Patterns
 * - **Singleton**: Single instance shared across executions (stateless providers)
 * - **Factory**: New instance per execution (stateful providers)
 * - Dynamic provider discovery
 * - Provider validation and initialization
 *
 * ### 4. Conditional Execution
 * - Providers execute only when conditions are met
 * - Conditions evaluated using GasExpressionEngineLib
 * - Access to parameters and previous provider outputs
 * - Skip expensive operations when not needed
 *
 * ### 5. Post-Processing Transformations
 * - Transform data after retrieval
 * - Chained transformations (executed in order)
 * - Built-in transformations: filterFields, mapValues, etc.
 * - Custom post-processors via PostProcessor base class
 *
 * ### 6. Error Recovery & Resilience
 * - Integration with GasResilienceLib ExceptionService
 * - Automatic retry on transient failures
 * - Graceful degradation (continue on non-critical failures)
 * - Detailed error context for debugging
 *
 * ## Dependencies
 *
 * - **GoogleApiWrapper** (v3.0.0+) - Google API access, caching
 * - **GasExpressionEngineLib** (v1.0.0+) - Condition evaluation
 * - **GasResilienceLib** (v2.0.0+) - Error handling and retry logic
 * - **CoreUtilsLib** (v1.0.0+) - Logging and utilities
 *
 * ## Exported Components
 *
 * ### Core Classes
 * - **ContextAssembler**: Main facade for executing recipes and assembling contexts
 * - **ProviderRegistry**: Manages registration and retrieval of data provider instances
 * - **DependencyResolver**: Resolves @param and $provider dependencies, builds execution order
 * - **RecipeParser**: Validates and parses recipe JSON configurations
 * - **DataProvider**: Abstract base class for implementing custom data providers
 *
 * ### Utility Classes
 * - **PostProcessor**: Abstract base class for implementing data transformations
 *
 * ### Error Classes
 * - **ContextEngineError**: Base error for all ContextEngine errors
 * - **RecipeValidationError**: Invalid recipe structure or configuration
 * - **DependencyResolutionError**: Circular dependencies or missing providers
 * - **ProviderNotFoundError**: Referenced provider not registered
 * - **ProviderExecutionError**: Provider threw an error during execution
 *
 * ## Recipe Format
 *
 * ### Basic Recipe Structure
 *
 * ```json
 * {
 *   "providers": [
 *     {
 *       "name": "providerName",
 *       "type": "ProviderClassName",
 *       "condition": "{{expression}}",
 *       "parameters": {
 *         "param1": "@initialParam",
 *         "param2": "$previousProvider.property"
 *       },
 *       "postProcess": [
 *         { "type": "transformationType", "config": {} }
 *       ]
 *     }
 *   ]
 * }
 * ```
 *
 * ### Recipe Fields
 *
 * - **providers** (required): Array of provider configurations
 *   - **name** (required): Unique name for this provider's output
 *   - **type** (required): Provider class name (must be registered)
 *   - **condition** (optional): Expression to evaluate before execution (default: always execute)
 *   - **parameters** (optional): Object with parameters to pass to provider
 *   - **postProcess** (optional): Array of transformations to apply to provider output
 *
 * ## Usage Examples
 *
 * ### Example 1: Basic Recipe Execution
 *
 * ```javascript
 * import { ContextAssembler, ProviderRegistry, DataProvider } from '@ContextEngine';
 * import { LoggerService } from '@CoreUtilsLib';
 * import { ExceptionService } from '@GasResilienceLib';
 * import { ExpressionEngineService } from '@GasExpressionEngineLib';
 *
 * // Setup dependencies
 * const logger = new LoggerService();
 * const utils = { sleep: (ms) => Utilities.sleep(ms) };
 * const exceptionService = new ExceptionService(logger, utils);
 * const expressionEngine = new ExpressionEngineService({ logger });
 * const registry = new ProviderRegistry(logger);
 *
 * // Create custom provider
 * class UserDataProvider extends DataProvider {
 *   _fetchData(parameters) {
 *     return { id: parameters.userId, name: 'John', email: 'john@example.com' };
 *   }
 * }
 *
 * // Register provider
 * registry.registerSingleton('UserDataProvider', new UserDataProvider(logger));
 *
 * // Create assembler
 * const assembler = new ContextAssembler(logger, registry, expressionEngine, exceptionService);
 *
 * // Execute recipe
 * const recipe = {
 *   providers: [
 *     { name: 'userData', type: 'UserDataProvider', parameters: { userId: '@userId' } }
 *   ]
 * };
 *
 * const context = assembler.assemble(recipe, { userId: 123 });
 * // Result: { userData: { id: 123, name: 'John', email: 'john@example.com' } }
 * ```
 *
 * ### Example 2: Provider Dependencies
 *
 * ```javascript
 * // Recipe with provider dependencies using $provider.property
 * const recipe = {
 *   providers: [
 *     {
 *       name: 'userData',
 *       type: 'UserDataProvider',
 *       parameters: { userId: '@userId' }
 *     },
 *     {
 *       name: 'userOrders',
 *       type: 'OrderDataProvider',
 *       parameters: {
 *         userId: '$userData.id',        // Reference userData output
 *         email: '$userData.email'       // Reference nested property
 *       }
 *     },
 *     {
 *       name: 'orderSummary',
 *       type: 'SummaryProvider',
 *       parameters: {
 *         orders: '$userOrders',         // Reference entire provider output
 *         userName: '$userData.name'
 *       }
 *     }
 *   ]
 * };
 *
 * const context = assembler.assemble(recipe, { userId: 123 });
 * // Result: {
 * //   userData: { id: 123, name: 'John', email: 'john@example.com' },
 * //   userOrders: [...],
 * //   orderSummary: { totalOrders: 5, userName: 'John' }
 * // }
 * ```
 *
 * ### Example 3: Conditional Execution
 *
 * ```javascript
 * // Recipe with conditional provider execution
 * const recipe = {
 *   providers: [
 *     {
 *       name: 'userData',
 *       type: 'UserDataProvider',
 *       parameters: { userId: '@userId' }
 *     },
 *     {
 *       name: 'premiumFeatures',
 *       type: 'PremiumFeaturesProvider',
 *       condition: '$userData.isPremium == true',  // Only execute if user is premium
 *       parameters: { userId: '@userId' }
 *     },
 *     {
 *       name: 'freeFeatures',
 *       type: 'FreeFeaturesProvider',
 *       condition: '$userData.isPremium != true',  // Only execute if user is NOT premium
 *       parameters: { userId: '@userId' }
 *     }
 *   ]
 * };
 *
 * const context = assembler.assemble(recipe, { userId: 123 });
 * // If user is premium: { userData: {...}, premiumFeatures: {...} }
 * // If user is free: { userData: {...}, freeFeatures: {...} }
 * ```
 *
 * ### Example 4: Post-Processing Transformations
 *
 * ```javascript
 * // Recipe with post-processing transformations
 * const recipe = {
 *   providers: [
 *     {
 *       name: 'userData',
 *       type: 'UserDataProvider',
 *       parameters: { userId: '@userId' },
 *       postProcess: [
 *         {
 *           type: 'filterFields',
 *           fields: ['name', 'email']  // Only keep these fields
 *         },
 *         {
 *           type: 'mapValues',
 *           mapping: {
 *             name: 'fullName',         // Rename 'name' to 'fullName'
 *             email: 'emailAddress'
 *           }
 *         }
 *       ]
 *     }
 *   ]
 * };
 *
 * // Original provider output: { id: 123, name: 'John', email: 'john@example.com', phone: '555-0123' }
 * const context = assembler.assemble(recipe, { userId: 123 });
 * // Result: { userData: { fullName: 'John', emailAddress: 'john@example.com' } }
 * ```
 *
 * ### Example 5: Complex Multi-Source Assembly
 *
 * ```javascript
 * // Complex recipe assembling data from multiple sources
 * const recipe = {
 *   providers: [
 *     // 1. Fetch user data
 *     {
 *       name: 'user',
 *       type: 'UserDataProvider',
 *       condition: '{{userId}} != null',
 *       parameters: { userId: '@userId' }
 *     },
 *     // 2. Fetch user's organization (depends on user)
 *     {
 *       name: 'organization',
 *       type: 'OrganizationProvider',
 *       condition: '$user.organizationId != null',
 *       parameters: { orgId: '$user.organizationId' }
 *     },
 *     // 3. Fetch user's recent orders (depends on user)
 *     {
 *       name: 'orders',
 *       type: 'OrderDataProvider',
 *       condition: '$user.hasOrders == true',
 *       parameters: {
 *         userId: '$user.id',
 *         startDate: '@startDate',
 *         limit: 10
 *       }
 *     },
 *     // 4. Calculate order analytics (depends on orders)
 *     {
 *       name: 'orderAnalytics',
 *       type: 'AnalyticsProvider',
 *       condition: '$orders != null && len($orders) > 0',
 *       parameters: { orders: '$orders' },
 *       postProcess: [
 *         { type: 'roundNumbers', decimals: 2 }
 *       ]
 *     },
 *     // 5. Fetch organization members (depends on organization)
 *     {
 *       name: 'teamMembers',
 *       type: 'TeamMembersProvider',
 *       condition: '$organization.type == "enterprise"',
 *       parameters: { orgId: '$organization.id' }
 *     }
 *   ]
 * };
 *
 * const context = assembler.assemble(recipe, {
 *   userId: 123,
 *   startDate: '2025-01-01'
 * });
 * // Result: {
 * //   user: { id: 123, name: 'John', organizationId: 456, hasOrders: true },
 * //   organization: { id: 456, name: 'Acme Corp', type: 'enterprise' },
 * //   orders: [...],
 * //   orderAnalytics: { totalSpent: 1234.56, avgOrderValue: 123.46 },
 * //   teamMembers: [...]
 * // }
 * ```
 *
 * ### Example 6: Factory vs Singleton Providers
 *
 * ```javascript
 * // Singleton provider (shared instance, must be stateless)
 * class CacheProvider extends DataProvider {
 *   _fetchData(parameters) {
 *     return CacheService.getScriptCache().get(parameters.key);
 *   }
 * }
 *
 * // Factory provider (new instance per execution, can be stateful)
 * class StatefulProvider extends DataProvider {
 *   constructor(logger) {
 *     super(logger);
 *     this.executionCount = 0;  // State
 *   }
 *
 *   _fetchData(parameters) {
 *     this.executionCount++;
 *     return { count: this.executionCount, data: parameters.data };
 *   }
 * }
 *
 * // Register providers
 * registry.registerSingleton('CacheProvider', new CacheProvider(logger));
 * registry.registerFactory('StatefulProvider', () => new StatefulProvider(logger));
 *
 * // Singleton will reuse same instance, Factory creates new instance each time
 * ```
 *
 * ### Example 7: Custom Post-Processor
 *
 * ```javascript
 * import { PostProcessor } from '@ContextEngine';
 *
 * // Create custom post-processor
 * class UppercaseFieldsProcessor extends PostProcessor {
 *   process(data, config) {
 *     const result = { ...data };
 *     config.fields.forEach(field => {
 *       if (result[field] && typeof result[field] === 'string') {
 *         result[field] = result[field].toUpperCase();
 *       }
 *     });
 *     return result;
 *   }
 * }
 *
 * // Register post-processor
 * assembler.registerPostProcessor('uppercaseFields', new UppercaseFieldsProcessor());
 *
 * // Use in recipe
 * const recipe = {
 *   providers: [
 *     {
 *       name: 'userData',
 *       type: 'UserDataProvider',
 *       parameters: { userId: '@userId' },
 *       postProcess: [
 *         { type: 'uppercaseFields', fields: ['name', 'city'] }
 *       ]
 *     }
 *   ]
 * };
 * ```
 *
 * ### Example 8: Error Handling with Resilience
 *
 * ```javascript
 * // ContextAssembler integrates with GasResilienceLib for automatic retry
 * // Providers that throw transient errors (network, rate limits) will be retried
 *
 * class UnreliableApiProvider extends DataProvider {
 *   _fetchData(parameters) {
 *     // ExceptionService will automatically retry on transient failures
 *     const response = UrlFetchApp.fetch(parameters.url);
 *     return JSON.parse(response.getContentText());
 *   }
 * }
 *
 * // Recipe execution will automatically retry failed providers
 * const context = assembler.assemble(recipe, { url: 'https://api.example.com/data' });
 * // Transient failures are retried with exponential backoff
 * ```
 *
 * ### Example 9: Integration with WorkspaceTemplateEngine
 *
 * ```javascript
 * import { PlaceholderService } from '@WorkspaceTemplateEngine';
 *
 * // Use ContextEngine to assemble data, then use for template processing
 * const context = assembler.assemble(recipe, { userId: 123 });
 *
 * // Use assembled context in templates
 * const templateService = new PlaceholderService({ logger });
 * const processedDoc = templateService.processDocument(
 *   'TEMPLATE_DOC_ID',
 *   context  // Use assembled context as template data
 * );
 * ```
 *
 * ## Integration Patterns
 *
 * ### With GasDataImporter
 * Use ContextEngine to assemble data before importing to SheetDBLib:
 * ```javascript
 * const context = assembler.assemble(recipe, params);
 * const importEngine = new ImportEngine(...);
 * importEngine.import(context.userData, targetSheetId);
 * ```
 *
 * ### With DomainRepositoryLib
 * Use ContextEngine to fetch data, then hydrate into domain entities:
 * ```javascript
 * const context = assembler.assemble(recipe, { customerId: 123 });
 * const customer = customerRepository.hydrate(context.customerData);
 * ```
 *
 * ### With PipelineFramework
 * Use ContextEngine as a pipeline step to assemble data:
 * ```javascript
 * class DataAssemblyStep extends Step {
 *   execute(context) {
 *     const assembledData = assembler.assemble(this.recipe, context.data);
 *     context.set('assembledData', assembledData);
 *   }
 * }
 * ```
 *
 * ## Performance Considerations
 *
 * ### Execution Order Optimization
 * - DependencyResolver uses topological sorting to determine optimal execution order
 * - Providers execute in dependency order (dependencies first)
 * - Independent providers could be parallelized in future (GAS limitation: synchronous only)
 *
 * ### Conditional Execution
 * - Use conditions to skip expensive providers when not needed
 * - Condition evaluation is fast (GasExpressionEngineLib with caching)
 * - Avoid complex conditions with expensive function calls
 *
 * ### Provider Performance
 * - **Singleton providers**: Faster (no instantiation overhead), but must be stateless
 * - **Factory providers**: Slight overhead per execution, but can maintain state
 * - Cache expensive provider operations internally
 *
 * ### Recipe Complexity
 * - Linear execution time: O(n) where n = number of providers
 * - Dependency resolution: O(n²) worst case (with circular dependency detection)
 * - Keep recipes focused (10-20 providers max for maintainability)
 *
 * ## Security Considerations
 *
 * ### Recipe Validation
 * - All recipes validated before execution (RecipeParser)
 * - Invalid recipes throw RecipeValidationError
 * - Prevents injection attacks through recipe structure
 *
 * ### Provider Isolation
 * - Providers execute in isolation (no shared state between providers)
 * - Parameters validated before passing to providers
 * - Provider errors caught and wrapped in ProviderExecutionError
 *
 * ### Dependency Resolution
 * - Circular dependency detection prevents infinite loops
 * - Missing provider references caught early (fail-fast)
 * - Nested property access limited to prevent deep traversal attacks
 *
 * ## Design Patterns
 *
 * - **Facade Pattern**: ContextAssembler provides simple interface to complex subsystem
 * - **Strategy Pattern**: DataProvider and PostProcessor are strategy interfaces
 * - **Registry Pattern**: ProviderRegistry manages provider instances
 * - **Dependency Injection**: All components accept dependencies via constructor
 * - **Template Method**: DataProvider defines algorithm structure, subclasses implement _fetchData
 *
 * ## Design Principles
 *
 * - **Declarative over Imperative**: Recipes describe what to assemble, not how
 * - **Composable**: Providers compose via dependencies
 * - **Testable**: Clean abstractions and dependency injection
 * - **Extensible**: Easy to add providers and post-processors
 * - **Resilient**: Built-in error handling and retry logic
 * - **Domain-Agnostic**: No business logic in the engine
 *
 * ## Limitations & Constraints
 *
 * ### Google Apps Script Constraints
 * - **Synchronous only**: No async/await support (GAS V8 runtime limitation)
 * - **Execution time**: 6-minute script timeout (use JobRunnerLib for long recipes)
 * - **Memory**: Limited heap size (keep assembled contexts < 50MB)
 *
 * ### Recipe Constraints
 * - **Provider names**: Must be unique within a recipe
 * - **Circular dependencies**: Not allowed (detected and throw error)
 * - **Parameter references**: Can only reference previous providers (dependency order)
 *
 * ### Provider Constraints
 * - **Singleton providers**: Must be stateless (shared across executions)
 * - **Factory providers**: New instance per execution (can be stateful)
 * - **Return types**: Must return serializable objects (no functions, classes)
 *
 * ## Best Practices
 *
 * 1. **Keep recipes focused**: One recipe per use case (avoid mega-recipes)
 * 2. **Use conditions**: Skip expensive providers when not needed
 * 3. **Prefer singletons**: Use singleton providers when possible (better performance)
 * 4. **Cache aggressively**: Cache expensive operations in providers
 * 5. **Validate early**: Use RecipeParser to validate recipes before execution
 * 6. **Handle errors**: Implement proper error handling in custom providers
 * 7. **Document providers**: Add JSDoc to custom provider classes
 *
 * @version 1.0.0
 * @author GasLibraryFactory
 * @license MIT
 */

// Core classes
export { ContextAssembler } from './src/ContextAssembler';
export { ProviderRegistry } from './src/ProviderRegistry';
export { DependencyResolver } from './src/internal/DependencyResolver';
export { RecipeParser } from './src/internal/RecipeParser';
export { DataProvider } from './src/DataProvider';

// Interceptor classes
export { ContextInterceptor } from './src/interceptors/ContextInterceptor';
export { InterceptorRegistry } from './src/interceptors/InterceptorRegistry';
export { SwapAndEnrichInterceptor } from './src/interceptors/SwapAndEnrichInterceptor';

// Utility classes
export { PostProcessor as ContextPostProcessor } from './src/PostProcessor';

// Error classes
export { ContextEngineError } from './src/internal/errors/ContextEngineError';
export { RecipeValidationError } from './src/internal/errors/RecipeValidationError';
export { DependencyResolutionError } from './src/internal/errors/DependencyResolutionError';
export { ProviderNotFoundError } from './src/internal/errors/ProviderNotFoundError';
export { ProviderExecutionError } from './src/internal/errors/ProviderExecutionError';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
