# API Reference: ContextEngine

## CLASS: ProviderRegistry
**File Path:** `ContextEngine/src/ProviderRegistry.ts`
**Constructor Usage:** `const instance = new ProviderRegistry();`
**Description:** Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.

### Raw JSDoc Context:
```javascript
/**
 * Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 * @extends TypedRegistry
 */
```

<br>

## CLASS: PostProcessor
**File Path:** `ContextEngine/src/PostProcessor.ts`
**Constructor Usage:** `const instance = new PostProcessor();`
**Description:** Registry and execution engine for sequential provider data transformation pipelines.

### Raw JSDoc Context:
```javascript
/**
 * Registry and execution engine for sequential provider data transformation pipelines.
 * @class
 */
```

### Methods and properties of PostProcessor

#### PROPERTY: PostProcessor.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = postProcessor.logger;`
- **Pure JSDoc:**
```javascript
/**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
```
---
#### METHOD: PostProcessor._registerBuiltInProcessors
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor._registerBuiltInProcessors();`
- **Pure JSDoc:**
```javascript
/**
   * Instantiates and registers the default transformation library.
   * @private
   */
```
---
#### METHOD: PostProcessor.register
- **Scope:** instance
- **LLM Call Syntax:** `const result = postProcessor.register(type, processorFunc);`
- **Pure JSDoc:**
```javascript
/**
   * Adds a custom transformation function to the registry.
   * @param {string} type Transformation identifier (referenced in recipes).
   * @param {Function} processorFunc Signature: (data, config) => transformedData.
   * @returns {PostProcessor} Fluent interface for chaining.
   * @throws {Error} If type is empty or processorFunc is not a function.
   */
```
---
#### METHOD: PostProcessor.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = postProcessor.has(type);`
- **Pure JSDoc:**
```javascript
/**
   * Validates presence of a transformation identifier in the registry.
   * @param {string} type Transformation identifier.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: PostProcessor.process
- **Scope:** instance
- **LLM Call Syntax:** `const result = postProcessor.process(processorConfigs, data, providerName);`
- **Pure JSDoc:**
```javascript
/**
   * Executes a pipeline of transformations sequentially on a data payload.
   * @param {Object[]} processorConfigs Collection of transformation configurations ({type, ...}).
   * @param {*} data Input payload (object, array, or literal).
   * @param {string} [providerName=''] Contextual provider name for diagnostic logging.
   * @returns {*} Transformed payload.
   * @throws {Error} If processor type is unregistered or a transformation logic fails.
   * @example
   * const result = processor.process([
   *   { type: 'filterFields', fields: ['id', 'email'] },
   *   { type: 'renameFields', mapping: { email: 'user_email' } }
   * ], rawData);
   */
```
---
#### METHOD: PostProcessor.getRegisteredTypes
- **Scope:** instance
- **LLM Call Syntax:** `const result = postProcessor.getRegisteredTypes();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all registered transformation identifiers.
   * @returns {string[]} Collection of registered type names.
   */
```
---
<br>

## CLASS: DataProvider
**File Path:** `ContextEngine/src/DataProvider.ts`
**Constructor Usage:** `const instance = new DataProvider();`
**Description:** Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.
 * @class
 * @abstract
 */
```

### Methods and properties of DataProvider

#### PROPERTY: DataProvider.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = dataProvider.logger;`
- **Pure JSDoc:**
```javascript
/**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
```
---
#### METHOD: DataProvider._fetchData
- **Scope:** instance
- **LLM Call Syntax:** `const result = dataProvider._fetchData(parameters);`
- **Pure JSDoc:**
```javascript
/**
   * Core data fetching logic. Must be implemented by subclasses.
   * @param {Object} parameters Validated parameters for the fetch operation.
   * @returns {*} Fetched data payload.
   * @throws {Error} If not implemented by subclass or fetch fails.
   * @protected
   * @abstract
   */
```
---
#### METHOD: DataProvider._generateCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = dataProvider._generateCacheKey(parameters);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a unique, stable cache key from input parameters.
   * @param {Object} parameters Input parameters.
   * @returns {string} Pipe-delimited key string.
   * @private
   */
```
---
#### METHOD: DataProvider._getFromCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = dataProvider._getFromCache(cacheKey);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves non-expired data from the internal cache.
   * @param {string} cacheKey Target cache key.
   * @returns {*|null} Cached data or null if missing/expired.
   * @private
   */
```
---
#### METHOD: DataProvider._storeInCache
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider._storeInCache(cacheKey, data);`
- **Pure JSDoc:**
```javascript
/**
   * Stores data in the internal cache with current timestamp.
   * @param {string} cacheKey Target cache key.
   * @param {*} data Data payload to cache.
   * @private
   */
```
---
#### METHOD: DataProvider.clearCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = dataProvider.clearCache();`
- **Pure JSDoc:**
```javascript
/**
   * Purges all entries from the internal in-memory cache.
   * @returns {DataProvider} Fluent interface for chaining.
   */
```
---
#### METHOD: DataProvider.provide
- **Scope:** instance
- **LLM Call Syntax:** `const result = dataProvider.provide(providerName, parameters);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates the data providing process including validation, caching, performance tracking, and error wrapping.
   * @param {string} providerName Identifier for the provider (used in logging/errors).
   * @param {Object} parameters Parameters for the data fetch.
   * @returns {*} Fetched or cached data payload.
   * @throws {Error} If providerName or parameters are invalid.
   * @throws {ProviderExecutionError} If underlying fetch or validation fails.
   */
```
---
#### METHOD: DataProvider._validateParameters
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider._validateParameters(parameters);`
- **Pure JSDoc:**
```javascript
/**
   * Hooks for subclass-specific parameter validation. Executed before _fetchData().
   * @param {Object} parameters Parameters to validate.
   * @throws {Error} If validation constraints are violated.
   * @protected
   */
```
---
<br>

## CLASS: ContextAssembler
**File Path:** `ContextEngine/src/ContextAssembler.ts`
**Constructor Usage:** `const instance = new ContextAssembler();`
**Description:** Orchestrator facade for assembling complex data contexts from declarative JSON recipes.
Coordinates validation, dependency resolution, conditional execution, provider invocation, and post-processing.

### Raw JSDoc Context:
```javascript
/**
 * Orchestrator facade for assembling complex data contexts from declarative JSON recipes.
 * Coordinates validation, dependency resolution, conditional execution, provider invocation, and post-processing.
 * @class
 * @example
 * const recipe = {
 *   providers: [
 *     {
 *       name: 'user',
 *       type: 'UserDataProvider',
 *       condition: '{{userId}} != null',
 *       parameters: { userId: '@userId' }
 *     },
 *     {
 *       name: 'analytics',
 *       type: 'AnalyticsProvider',
 *       condition: 'len($user.orders) > 0',
 *       parameters: { orders: '$user.orders' },
 *       postProcess: [{ type: 'round', decimals: 2 }]
 *     }
 *   ]
 * };
 * const context = assembler.assemble(recipe, { userId: 123 });
 * @example
 * // Mutation mode: every provider mutates the SAME shared target object in
 * // place instead of producing a value merged into a flat, provider-keyed
 * // map. Useful for consumers whose "context" is one deeply nested object
 * // multiple providers read from and write into at the same paths (e.g. a
 * // recipe where a later provider must overwrite a field an earlier
 * // provider already set). Provider return values are ignored in this mode.
 * const sharedTarget = { meta: {}, focus: {} };
 * assembler.assembleInto(sharedTarget, recipe, { userId: 123 });
 * // sharedTarget now holds everything every provider wrote, in recipe order.
 */
```

### Methods and properties of ContextAssembler

#### PROPERTY: ContextAssembler.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = contextAssembler.logger;`
- **Pure JSDoc:**
```javascript
/**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
```
---
#### PROPERTY: ContextAssembler.providerRegistry
- **Scope:** instance
- **LLM Call Syntax:** `const result = contextAssembler.providerRegistry;`
- **Pure JSDoc:**
```javascript
/**
   * Provider registry for type lookup.
   * @type {Object}
   * @readonly
   */
```
---
<br>

## CLASS: DataProviderMock
**File Path:** `ContextEngine/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new DataProviderMock();`
**Description:** High-fidelity mock for DataProvider implementation in unit tests.
Simulates provider lifecycle, data retrieval, and parameter validation.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity mock for DataProvider implementation in unit tests.
 * Simulates provider lifecycle, data retrieval, and parameter validation.
 *
 * @class DataProviderMock
 */
```

### Methods and properties of DataProviderMock

#### METHOD: DataProviderMock.setupData
- **Scope:** instance
- **LLM Call Syntax:** `const result = dataProviderMock.setupData(data);`
- **Pure JSDoc:**
```javascript
/**
   * Fluent helper to configure static mock data return values.
   *
   * @param {*} data - Payload to return from provide and _fetchData.
   * @returns {DataProviderMock} Current instance for chaining.
   */
```
---
<br>

## CLASS: InterceptorMock
**File Path:** `ContextEngine/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new InterceptorMock();`
**Description:** High-fidelity mock for ContextInterceptor implementation.
Simulates context transformation and conditional filtering logic.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity mock for ContextInterceptor implementation.
 * Simulates context transformation and conditional filtering logic.
 *
 * @class InterceptorMock
 */
```

### Methods and properties of InterceptorMock

#### METHOD: InterceptorMock.setupIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorMock.setupIntercept(interceptFn);`
- **Pure JSDoc:**
```javascript
/**
   * Fluent helper to inject custom interception implementation.
   *
   * @param {Function} interceptFn - Logic mapping PipelineContext to transformed PipelineContext.
   * @returns {InterceptorMock} Current instance for chaining.
   */
```
---
<br>

## CLASS: ProviderRegistryMock
**File Path:** `ContextEngine/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new ProviderRegistryMock();`
**Description:** In-memory registry mock for provider lifecycle and dependency resolution testing.

### Raw JSDoc Context:
```javascript
/**
 * In-memory registry mock for provider lifecycle and dependency resolution testing.
 *
 * @class ProviderRegistryMock
 */
```

<br>

## CLASS: ProjectionRegistry
**File Path:** `ContextEngine/src/projection/ProjectionRegistry.ts`
**Constructor Usage:** `const instance = new ProjectionRegistry();`
**Description:** Registry for application-supplied, synchronous collection projection strategies.

### Raw JSDoc Context:
```javascript
/**
 * Registry for application-supplied, synchronous collection projection strategies.
 */
```

### Methods and properties of ProjectionRegistry

#### METHOD: ProjectionRegistry.register
- **Scope:** instance
- **LLM Call Syntax:** `projectionRegistry.register();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ProjectionRegistry.get
- **Scope:** instance
- **LLM Call Syntax:** `projectionRegistry.get();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ProjectionRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `projectionRegistry.has();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: CollectionProjector
**File Path:** `ContextEngine/src/projection/CollectionProjector.ts`
**Constructor Usage:** `const instance = new CollectionProjector();`
**Description:** Runs declarative, synchronous projections without mutating the source collection.

### Raw JSDoc Context:
```javascript
/**
 * Runs declarative, synchronous projections without mutating the source collection.
 */
```

### Methods and properties of CollectionProjector

#### METHOD: CollectionProjector.project
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.project();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._apply
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._apply();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._filter
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._filter();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._map
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._map();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._flatMap
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._flatMap();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._groupBy
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._groupBy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._aggregate
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._aggregate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._distinctBy
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._distinctBy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._sortBy
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._sortBy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._insert
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._insert();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._strategy
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._strategy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._runStrategy
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._runStrategy();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._evaluate
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._evaluate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._itemRuntime
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._itemRuntime();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._keys
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._keys();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._read
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._read();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjector._error
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector._error();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: TypedRegistry
**File Path:** `ContextEngine/src/internal/TypedRegistry.ts`
**Constructor Usage:** `const instance = new TypedRegistry(logger, config, config.label, config.requiredMethod, config.noun, config.article, config.notFoundError);`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/**
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @param {Object} config
   * @param {string} config.label Class-style label used to prefix error/log messages (e.g. 'ProviderRegistry').
   * @param {string} config.requiredMethod Instance method every registered entry must implement (e.g. 'provide').
   * @param {string} config.noun Singular entity noun used in log messages (e.g. 'provider').
   * @param {string} [config.article='a'] Indefinite article for `noun` in error messages ('a'/'an').
   * @param {(type: string, registeredTypes: string[]) => Error} config.notFoundError Builds the error thrown
   *   by {@link TypedRegistry#get} when `type` isn't registered.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
```

### Methods and properties of TypedRegistry

#### PROPERTY: TypedRegistry.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = typedRegistry.logger;`
- **Pure JSDoc:**
```javascript
/**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
```
---
#### METHOD: TypedRegistry.registerSingleton
- **Scope:** instance
- **LLM Call Syntax:** `const result = typedRegistry.registerSingleton(type, instance);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a pre-instantiated stateless entry.
   * @param {string} type Unique type identifier.
   * @param {Object} instance Entry instance implementing the required method.
   * @returns {TypedRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty, instance is null, or the required method is missing.
   */
```
---
#### METHOD: TypedRegistry.registerFactory
- **Scope:** instance
- **LLM Call Syntax:** `const result = typedRegistry.registerFactory(type, factory);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a factory function for stateful instantiation.
   * @param {string} type Unique type identifier.
   * @param {Function} factory Function returning a new entry instance on each call.
   * @returns {TypedRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty or factory is not a function.
   */
```
---
#### METHOD: TypedRegistry.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = typedRegistry.get(type);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves an entry instance by type identifier, prioritizing singletons over factories.
   * @param {string} type Type identifier.
   * @returns {Object} Entry instance implementing the required method.
   * @throws {Error} If type is not a string, or a factory returns an invalid object.
   */
```
---
#### METHOD: TypedRegistry.getAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = typedRegistry.getAll();`
- **Pure JSDoc:**
```javascript
/**
   * Aggregates all registered singleton and factory-instantiated entries.
   * @returns {Object[]} Collection of active entry instances.
   */
```
---
#### METHOD: TypedRegistry.getRegisteredTypes
- **Scope:** instance
- **LLM Call Syntax:** `const result = typedRegistry.getRegisteredTypes();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all registered type identifiers.
   * @returns {string[]} Collection of registered type names.
   */
```
---
<br>

## CLASS: RecipeParser
**File Path:** `ContextEngine/src/internal/RecipeParser.ts`
**Constructor Usage:** `const instance = new RecipeParser();`
**Description:** Engine for structural validation, type checking, and normalization of JSON recipes.

### Raw JSDoc Context:
```javascript
/**
 * Engine for structural validation, type checking, and normalization of JSON recipes.
 * @class
 * @example
 * const recipe = {
 *   providers: [
 *     {
 *       name: 'user',
 *       type: 'UserDataProvider',
 *       parameters: { id: '@userId' },
 *       condition: 'is_admin == true',
 *       postProcess: [{ type: 'filter', fields: ['id'] }]
 *     }
 *   ]
 * };
 */
```

### Methods and properties of RecipeParser

#### PROPERTY: RecipeParser.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = recipeParser.logger;`
- **Pure JSDoc:**
```javascript
/**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
```
---
#### METHOD: RecipeParser._validateProvider
- **Scope:** instance
- **LLM Call Syntax:** `const result = recipeParser._validateProvider(provider, index);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates a provider configuration against structural and type constraints.
   * @param {Object} provider Provider configuration object.
   * @param {number} index Array index for error context.
   * @returns {string[]} Collection of validation error messages.
   * @private
   */
```
---
#### METHOD: RecipeParser.parse
- **Scope:** instance
- **LLM Call Syntax:** `const result = recipeParser.parse(recipe, recipe.providers);`
- **Pure JSDoc:**
```javascript
/**
   * Executes full recipe validation and normalization. Collects structural, type, and uniqueness errors.
   * @param {Object} recipe Raw JSON recipe.
   * @param {Object[]} recipe.providers Collection of provider configurations.
   * @returns {Object} Normalized recipe with default values for optional fields.
   * @throws {RecipeValidationError} If any validation constraints are violated.
   */
```
---
#### METHOD: RecipeParser.validate
- **Scope:** instance
- **LLM Call Syntax:** `const result = recipeParser.validate(recipe);`
- **Pure JSDoc:**
```javascript
/**
   * Non-throwing wrapper for parse(). Returns a validation status object.
   * @param {Object} recipe Raw JSON recipe.
   * @returns {{isValid: boolean, errors: string[]}} Validation metadata.
   */
```
---
<br>

## CLASS: DependencyResolver
**File Path:** `ContextEngine/src/internal/DependencyResolver.ts`
**Constructor Usage:** `const instance = new DependencyResolver();`
**Description:** Dependency resolution engine for @param (initial) and $provider (runtime) references in recipes.
Supports dot-notation for nested properties and bracket-notation for array indices.

### Raw JSDoc Context:
```javascript
/**
 * Dependency resolution engine for @param (initial) and $provider (runtime) references in recipes.
 * Supports dot-notation for nested properties and bracket-notation for array indices.
 * @class
 */
```

### Methods and properties of DependencyResolver

#### PROPERTY: DependencyResolver.PARAM_PATTERN
- **Scope:** static
- **LLM Call Syntax:** `const result = DependencyResolver.PARAM_PATTERN;`
- **Pure JSDoc:**
```javascript
/**
   * Pattern for @param references (e.g., '@userId').
   * @type {RegExp}
   * @static
   * @private
   */
```
---
#### PROPERTY: DependencyResolver.PROVIDER_PATTERN
- **Scope:** static
- **LLM Call Syntax:** `const result = DependencyResolver.PROVIDER_PATTERN;`
- **Pure JSDoc:**
```javascript
/**
   * Pattern for $provider references (e.g., '$user.profile.name', '$items[0].id').
   * @type {RegExp}
   * @static
   * @private
   */
```
---
#### PROPERTY: DependencyResolver.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver.logger;`
- **Pure JSDoc:**
```javascript
/**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
```
---
#### METHOD: DependencyResolver.isDependency
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver.isDependency(value);`
- **Pure JSDoc:**
```javascript
/**
   * Validates if a string value matches @param or $provider syntax.
   * @param {*} value Target value to inspect.
   * @returns {boolean} True if string matches dependency patterns.
   */
```
---
#### METHOD: DependencyResolver._getNestedProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver._getNestedProperty(obj, path);`
- **Pure JSDoc:**
```javascript
/**
   * Traverses a nested object/array structure based on dot-separated path.
   * @param {Object|Array} obj Source container.
   * @param {string} path Property path (e.g., 'items[0].id').
   * @returns {*} Resolved value or undefined if path is unreachable.
   * @private
   */
```
---
#### METHOD: DependencyResolver.resolve
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver.resolve(dependency, initialParams, providerResults, providerName);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a single dependency reference against initial parameters and runtime provider results.
   * @param {string} dependency Dependency reference string.
   * @param {Object} initialParams Map of @param identifiers to values.
   * @param {Object} providerResults Map of $provider identifiers to output payloads.
   * @param {string} [providerName=''] Contextual name of the dependent provider for error reporting.
   * @returns {*} Resolved payload.
   * @throws {Error} If inputs are invalid.
   * @throws {DependencyResolutionError} If reference cannot be satisfied or path is invalid.
   */
```
---
#### METHOD: DependencyResolver.resolveAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver.resolveAll(parameters, initialParams, providerResults, providerName);`
- **Pure JSDoc:**
```javascript
/**
   * Recursively resolves all dependency references within a complex object or array.
   * @param {Object|Array} parameters Source structure containing potential references.
   * @param {Object} initialParams Map of @param identifiers.
   * @param {Object} providerResults Map of $provider identifiers.
   * @param {string} [providerName=''] Contextual name for error reporting.
   * @returns {Object|Array} Cloned structure with all satisfied dependencies.
   * @throws {Error} If inputs are invalid.
   * @throws {DependencyResolutionError} If any reference resolution fails.
   */
```
---
#### METHOD: DependencyResolver.analyzeDependencies
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver.analyzeDependencies(parameters);`
- **Pure JSDoc:**
```javascript
/**
   * Analyzes a parameters structure to extract unique dependency identifiers.
   * @param {Object|Array} parameters Structure to analyze.
   * @returns {Object} Metadata including paramDependencies (names), providerDependencies (names), and total count.
   */
```
---
<br>

## CLASS: ContextStepExecutor
**File Path:** `ContextEngine/src/internal/ContextStepExecutor.ts`
**Constructor Usage:** `const instance = new ContextStepExecutor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of ContextStepExecutor

#### METHOD: ContextStepExecutor._evaluateCondition
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor._evaluateCondition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ContextStepExecutor._executeProvider
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor._executeProvider();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ContextStepExecutor.assemble
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.assemble();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ContextStepExecutor._executeMutatingProvider
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor._executeMutatingProvider(providerConfig, sharedTarget, initialParams, options);`
- **Pure JSDoc:**
```javascript
/**
   * Invokes a single provider in "mutate" mode: the provider receives the
   * shared target object directly (instead of resolved `@`/`$` parameters)
   * and is expected to mutate it in place. This is a real behavioral fork
   * from `_executeProvider`/flat mode, not an overload of it:
   *  - No `DependencyResolver.resolveAll` parameter resolution — mutation-mode
   *    providers read/write the shared target directly, they don't declare
   *    `parameters` maps of `@param`/`$provider` references.
   *  - No `postProcessor` pass — there is no return value to post-process.
   *  - No return-value merge — the provider's return value is IGNORED.
   *  - Registered interceptors ARE still invoked after the provider step
   *    (mirrors flat mode), but they receive `(name, sharedTarget,
   *    sharedTarget, options)` since there is no separate "this provider's
   *    slice of data" — the whole shared target is the only payload.
   * Provider lookup (`ProviderRegistry`) and retry (`exceptionService`) are
   * reused unchanged from flat mode.
   * @param {Object} providerConfig Normalized provider config (name, type).
   * @param {Object} sharedTarget The shared object every provider mutates.
   * @param {Object} initialParams Initial parameters passed to `assembleInto`.
   * @param {Object} [options={}] Runtime options forwarded to providers/interceptors.
   * @private
   */
```
---
#### METHOD: ContextStepExecutor._logAssemblySummary
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor._logAssemblySummary();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ContextStepExecutor.assembleInto
- **Scope:** instance
- **LLM Call Syntax:** `const result = contextStepExecutor.assembleInto(sharedTarget, recipe, initialParams, options);`
- **Pure JSDoc:**
```javascript
/**
   * Mutation-mode counterpart to `assemble()`. Instead of collecting each
   * provider's return value into a fresh flat `{ providerName: output }` map,
   * every provider in the recipe receives the SAME `sharedTarget` object
   * across the whole run and is expected to mutate it in place (matching
   * ALDO's `ContextProvider.provide(cdu, params, options): void` contract).
   *
   * What is reused unchanged from flat mode: recipe parsing/normalization
   * (`RecipeParser.parse`), per-provider condition evaluation
   * (`_evaluateCondition`), provider lookup (`ProviderRegistry`), and retry
   * semantics (`exceptionService`). What is NOT reused: `_executeProvider`
   * itself — it pushes a provider's return value through
   * `DependencyResolver.resolveAll`/`postProcessor`, both of which assume a
   * return-value pipeline that doesn't apply to a void mutator, so this mode
   * has its own leaner step, `_executeMutatingProvider`.
   *
   * Return value handling is the precise behavioral fork versus `assemble()`:
   * a mutation-mode provider's return value is ALWAYS ignored — the contract
   * is "mutate `sharedTarget`; return nothing meaningful". Interceptors are
   * still invoked by the assembler after each provider step (this method owns
   * that loop directly, mirroring `_executeProvider`'s existing interceptor
   * loop, rather than pushing interceptor invocation onto the caller) — this
   * keeps the "assembler owns declared order + conditions + retries +
   * interceptor invocation" contract identical in both modes; only what
   * happens to a provider's output differs.
   *
   * @param {Object} sharedTarget The object every provider in the recipe mutates in place.
   * @param {Object} recipe Recipe (validated the same way as `assemble()`'s recipe).
   * @param {Object} [initialParams={}] Initial parameters forwarded to every provider.
   * @param {Object} [options={}] Runtime options forwarded to providers/interceptors.
   * @returns {Object} `sharedTarget`, for convenience (it was mutated in place).
   * @throws {Error} If `sharedTarget`/`recipe`/`initialParams`/`options` are invalid.
   * @throws {ContextEngineError} If recipe validation or a provider step fails.
   */
```
---
<br>

## CLASS: ContextDependencyAnalyzer
**File Path:** `ContextEngine/src/internal/ContextDependencyAnalyzer.ts`
**Constructor Usage:** `const instance = new ContextDependencyAnalyzer();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of ContextDependencyAnalyzer

#### METHOD: ContextDependencyAnalyzer.validateRecipe
- **Scope:** instance
- **LLM Call Syntax:** `contextDependencyAnalyzer.validateRecipe();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ContextDependencyAnalyzer.analyzeRecipeDependencies
- **Scope:** instance
- **LLM Call Syntax:** `contextDependencyAnalyzer.analyzeRecipeDependencies();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ContextDependencyAnalyzer.getConfigSummary
- **Scope:** instance
- **LLM Call Syntax:** `contextDependencyAnalyzer.getConfigSummary();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: RecipeValidationError
**File Path:** `ContextEngine/src/internal/errors/RecipeValidationError.ts`
**Constructor Usage:** `const instance = new RecipeValidationError();`
**Description:** Thrown by RecipeParser.validate() or parse() during pre-execution checks. Aggregates
multiple validation failures (missing fields, duplicate names, invalid types) into
the validationErrors property to enable comprehensive error reporting.

### Raw JSDoc Context:
```javascript
/**
 * Error signaling structural or configuration non-compliance in a Context Recipe.
 *
 * @class RecipeValidationError
 * @extends ContextEngineError
 *
 * @description
 * Thrown by RecipeParser.validate() or parse() during pre-execution checks. Aggregates
 * multiple validation failures (missing fields, duplicate names, invalid types) into
 * the validationErrors property to enable comprehensive error reporting.
 *
 * @example
 * throw new RecipeValidationError('Invalid Recipe', { validationErrors: ['providers is required'] });
 */
```

<br>

## CLASS: ProviderNotFoundError
**File Path:** `ContextEngine/src/internal/errors/ProviderNotFoundError.ts`
**Constructor Usage:** `const instance = new ProviderNotFoundError();`
**Description:** Thrown during ContextAssembler.assemble() or ProviderRegistry.get() when a recipe
references an unregistered provider. Includes technical context for typo detection
(registeredProviders) and dependency mapping (recipeName, currentProvider).

### Raw JSDoc Context:
```javascript
/**
 * Error signaling a missing registration for a requested DataProvider type.
 *
 * @class ProviderNotFoundError
 * @extends ContextEngineError
 *
 * @description
 * Thrown during ContextAssembler.assemble() or ProviderRegistry.get() when a recipe
 * references an unregistered provider. Includes technical context for typo detection
 * (registeredProviders) and dependency mapping (recipeName, currentProvider).
 *
 * @example
 * throw new ProviderNotFoundError('UserDataProvider', { registeredProviders: ['Auth', 'Config'] });
 */
```

<br>

## CLASS: ProviderExecutionError
**File Path:** `ContextEngine/src/internal/errors/ProviderExecutionError.ts`
**Constructor Usage:** `const instance = new ProviderExecutionError();`
**Description:** Wraps original exceptions caught during provider data retrieval. Provides technical context
for debugging and retry classification by GasResilienceLib, distinguishing between
transient (e.g., timeouts, 429) and permanent (e.g., 401, 403, 404) failures.

### Raw JSDoc Context:
```javascript
/**
 * Error signaling failure during DataProvider._fetchData() execution.
 *
 * @class ProviderExecutionError
 * @extends ContextEngineError
 *
 * @description
 * Wraps original exceptions caught during provider data retrieval. Provides technical context
 * for debugging and retry classification by GasResilienceLib, distinguishing between
 * transient (e.g., timeouts, 429) and permanent (e.g., 401, 403, 404) failures.
 *
 * @example
 * throw new ProviderExecutionError('UserDataProvider', new Error('Timeout'), { userId: 123 });
 */
```

<br>

## CLASS: DependencyResolutionError
**File Path:** `ContextEngine/src/internal/errors/DependencyResolutionError.ts`
**Constructor Usage:** `const instance = new DependencyResolutionError();`
**Description:** Error indicating failure to resolve @param or $provider references due to missing data, incorrect paths, or invalid execution order.

### Raw JSDoc Context:
```javascript
/**
 * Error indicating failure to resolve @param or $provider references due to missing data, incorrect paths, or invalid execution order.
 * @class
 * @extends ContextEngineError
 */
```

<br>

## CLASS: ContextEngineError
**File Path:** `ContextEngine/src/internal/errors/ContextEngineError.ts`
**Constructor Usage:** `const instance = new ContextEngineError();`
**Description:** Foundation error class for the ContextEngine hierarchy, providing structured metadata and error chaining.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

### Raw JSDoc Context:
```javascript
/**
 * Foundation error class for the ContextEngine hierarchy, providing structured metadata and error chaining.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 * @class
 * @extends BaseError
 */
```

### Methods and properties of ContextEngineError

#### METHOD: ContextEngineError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = contextEngineError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
```
---
<br>

## CLASS: CollectionProjectionError
**File Path:** `ContextEngine/src/internal/errors/CollectionProjectionError.ts`
**Constructor Usage:** `const instance = new CollectionProjectionError();`
**Description:** Signals invalid declarative collection-projection configuration or execution.

### Raw JSDoc Context:
```javascript
/**
 * Signals invalid declarative collection-projection configuration or execution.
 */
```

<br>

## CLASS: InterceptorRegistry
**File Path:** `ContextEngine/src/interceptors/InterceptorRegistry.ts`
**Constructor Usage:** `const instance = new InterceptorRegistry();`
**Description:** Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.

### Raw JSDoc Context:
```javascript
/**
 * Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 * @extends TypedRegistry
 */
```

<br>

## CLASS: ContextInterceptor
**File Path:** `ContextEngine/src/interceptors/ContextInterceptor.ts`
**Constructor Usage:** `const instance = new ContextInterceptor();`
**Description:** Abstract base class for context middleware/interceptor patterns.
Enables transparent transformation, enrichment, or substitution of provider results before UDC integration.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for context middleware/interceptor patterns.
 * Enables transparent transformation, enrichment, or substitution of provider results before UDC integration.
 * @class
 * @abstract
 */
```

### Methods and properties of ContextInterceptor

#### PROPERTY: ContextInterceptor.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = contextInterceptor.logger;`
- **Pure JSDoc:**
```javascript
/**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
```
---
#### METHOD: ContextInterceptor._shouldIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = contextInterceptor._shouldIntercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates if interception should occur based on runtime state and provider metadata.
   * @param {string} name Provider name from recipe.
   * @param {*} data Provider result payload (after post-processing).
   * @param {Object} context Current partially assembled context.
   * @param {Object} options Runtime options passed to ContextAssembler.assemble().
   * @returns {boolean} True to activate interception, false to skip.
   * @protected
   */
```
---
#### METHOD: ContextInterceptor._performIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = contextInterceptor._performIntercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Executes core interception logic. Must be implemented by subclasses.
   * @param {string} name Provider name from recipe.
   * @param {*} data Provider result payload.
   * @param {Object} context Current partially assembled context.
   * @param {Object} options Runtime options.
   * @returns {*} Modified data payload (type must match input data).
   * @throws {Error} If not implemented by subclass or logic fails.
   * @protected
   * @abstract
   * @example
   * // Swap Pattern: return { ...substitute, titular: data }
   * // Enrich Pattern: return { ...data, timestamp: Date.now() }
   */
```
---
#### METHOD: ContextInterceptor.intercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = contextInterceptor.intercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Primary entry point for provider result interception. Orchestrates conditional checks and error wrapping.
   * @param {string} name Provider name from recipe.
   * @param {*} data Provider result payload.
   * @param {Object} context Current assembled context.
   * @param {Object} [options={}] Runtime options.
   * @returns {*} Modified data if intercepted, original data if skipped.
   * @throws {Error} If inputs are invalid or _performIntercept fails.
   */
```
---
#### METHOD: ContextInterceptor._forEachAt
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor._forEachAt(data, path, itemFn);`
- **Pure JSDoc:**
```javascript
/**
   * Walks an array nested inside `data` at `path` (a dot-path string resolved
   * via CoreUtilsLib's `get`, lodash-compatible) and applies a per-item
   * decision to each element. This generalizes the "one atomic swap" model
   * (a single `_performIntercept` deciding for the whole `data` payload) to
   * "independent per-item decisions inside a nested array" — needed by
   * consumers whose `data` is one shared, deeply nested object (e.g. a CDU)
   * containing arrays that must be walked and decided on item-by-item.
   *
   * `itemFn(item, index, array)` may either:
   *  - mutate `item` in place and return `undefined`/`null` (no further
   *    action taken by this helper — the mutation already happened); or
   *  - return a 3-way outcome descriptor the helper applies itself:
   *    - `{ action: 'replace', value }` → `array[index] = value`
   *    - `{ action: 'annotate', meta }` → `Object.assign(array[index], meta)`
   *    - `{ action: 'skip' }` → no-op (equivalent to returning `null`)
   *
   * No-op (with a debug log) if `path` does not resolve to an array on `data`.
   *
   * @param {Object} data The object to resolve `path` against.
   * @param {string} path Dot-path string (e.g. `'focus.classe.consiglioDiClasse'`).
   * @param {Function} itemFn `(item, index, array) => undefined|null|{action, value?, meta?}`.
   * @protected
   */
```
---
<br>

## CLASS: CollectionProjectionInterceptor
**File Path:** `ContextEngine/src/interceptors/CollectionProjectionInterceptor.ts`
**Constructor Usage:** `const instance = new CollectionProjectionInterceptor();`
**Description:** Applies a CollectionProjector to configured collection paths after selected providers.

### Raw JSDoc Context:
```javascript
/** Applies a CollectionProjector to configured collection paths after selected providers. */
```

### Methods and properties of CollectionProjectionInterceptor

#### METHOD: CollectionProjectionInterceptor._shouldIntercept
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjectionInterceptor._shouldIntercept();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjectionInterceptor._performIntercept
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjectionInterceptor._performIntercept();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjectionInterceptor._readTarget
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjectionInterceptor._readTarget();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CollectionProjectionInterceptor._writeTarget
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjectionInterceptor._writeTarget();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

