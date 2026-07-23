# API Reference: ContextEngine

## CLASS: ProviderRegistry
**File Path:** `ContextEngine/src/ProviderRegistry.js`
**Constructor Usage:** `const instance = new ProviderRegistry(logger);`
**Description:** Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.

### Raw JSDoc Context:
```javascript
/**
 * Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 */
```

### Methods of ProviderRegistry

#### METHOD: ProviderRegistry.registerSingleton
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerRegistry.registerSingleton(type, instance);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a pre-instantiated stateless provider.
   * @param {string} type Unique provider type identifier (referenced in recipes).
   * @param {Object} instance Provider instance implementing the provide() method.
   * @returns {ProviderRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty, instance is null, or provide() method is missing.
   */
```
---
#### METHOD: ProviderRegistry.registerFactory
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerRegistry.registerFactory(type, factory);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a factory function for stateful provider instantiation.
   * @param {string} type Unique provider type identifier (referenced in recipes).
   * @param {Function} factory Function returning a new provider instance on each call.
   * @returns {ProviderRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty or factory is not a function.
   */
```
---
#### METHOD: ProviderRegistry.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerRegistry.get(type);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a provider instance by type identifier, prioritizing singletons over factories.
   * @param {string} type Provider type identifier.
   * @returns {Object} Provider instance implementing provide().
   * @throws {Error} If type is not a string.
   * @throws {ProviderNotFoundError} If type is not registered.
   * @throws {Error} If factory returns an invalid object.
   */
```
---
#### METHOD: ProviderRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerRegistry.has(type);`
- **Pure JSDoc:**
```javascript
/**
   * Validates presence of a provider type in either registry.
   * @param {string} type Provider type identifier.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: ProviderRegistry.unregister
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerRegistry.unregister(type);`
- **Pure JSDoc:**
```javascript
/**
   * Removes a provider from both singleton and factory registries.
   * @param {string} type Provider type identifier.
   * @returns {boolean} True if the provider existed and was removed.
   */
```
---
#### METHOD: ProviderRegistry.clear
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerRegistry.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Purges all singleton and factory registrations.
   * @returns {ProviderRegistry} Fluent interface for chaining.
   */
```
---
#### METHOD: ProviderRegistry.getRegisteredTypes
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerRegistry.getRegisteredTypes();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all registered provider type identifiers.
   * @returns {string[]} Collection of registered type names.
   */
```
---
#### METHOD: ProviderRegistry.getSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerRegistry.getSummary();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a technical summary of the registry state.
   * @returns {Object} Metadata including singletonCount, factoryCount, totalProviders, and type lists.
   */
```
---
<br>

## CLASS: PostProcessor
**File Path:** `ContextEngine/src/PostProcessor.js`
**Constructor Usage:** `const instance = new PostProcessor(logger);`
**Description:** Registry and execution engine for sequential provider data transformation pipelines.

### Raw JSDoc Context:
```javascript
/**
 * Registry and execution engine for sequential provider data transformation pipelines.
 * @class
 */
```

### Methods of PostProcessor

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
**File Path:** `ContextEngine/src/DataProvider.js`
**Constructor Usage:** `const instance = new DataProvider(logger, options, options.cacheable, options.cacheDurationMs);`
**Description:** Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.

### Raw JSDoc Context:
```javascript
/**
 * Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.
 * @class
 * @abstract
 */
```

### Methods of DataProvider

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
**File Path:** `ContextEngine/src/ContextAssembler.js`
**Constructor Usage:** `const instance = new ContextAssembler(logger, providerRegistry, expressionEngine, exceptionService, interceptorRegistry, options, options.maxRetries);`
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

<br>

## CLASS: DataProviderMock
**File Path:** `ContextEngine/src/testing/mocks.js`
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

### Methods of DataProviderMock

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
**File Path:** `ContextEngine/src/testing/mocks.js`
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

### Methods of InterceptorMock

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
**File Path:** `ContextEngine/src/testing/mocks.js`
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

## CLASS: RecipeParser
**File Path:** `ContextEngine/src/internal/RecipeParser.js`
**Constructor Usage:** `const instance = new RecipeParser(logger);`
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

### Methods of RecipeParser

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
**File Path:** `ContextEngine/src/internal/DependencyResolver.js`
**Constructor Usage:** `const instance = new DependencyResolver(logger);`
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

### Methods of DependencyResolver

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

## CLASS: RecipeValidationError
**File Path:** `ContextEngine/src/internal/errors/RecipeValidationError.js`
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

### Methods of RecipeValidationError

#### METHOD: RecipeValidationError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = recipeValidationError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
```
---
<br>

## CLASS: RecipeValidationError
**File Path:** `ContextEngine/src/internal/errors/RecipeValidationError.js`
**Constructor Usage:** `const instance = new RecipeValidationError(message, context, context.validationErrors, context.recipe, context.recipeName);`
**Description:** Initialize a RecipeValidationError with validation metadata.

### Raw JSDoc Context:
```javascript
/**
   * Initialize a RecipeValidationError with validation metadata.
   *
   * @param {string} message - High-level summary of the validation failure.
   * @param {Object} [context={}] - Diagnostic context.
   * @param {string[]} [context.validationErrors] - Collection of specific structural violations.
   * @param {Object} [context.recipe] - The raw recipe object that failed validation.
   * @param {string} [context.recipeName] - Identifier of the failing recipe.
   */
```

### Methods of RecipeValidationError

#### METHOD: RecipeValidationError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = recipeValidationError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
```
---
<br>

## CLASS: ProviderNotFoundError
**File Path:** `ContextEngine/src/internal/errors/ProviderNotFoundError.js`
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

### Methods of ProviderNotFoundError

#### METHOD: ProviderNotFoundError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerNotFoundError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
```
---
<br>

## CLASS: ProviderNotFoundError
**File Path:** `ContextEngine/src/internal/errors/ProviderNotFoundError.js`
**Constructor Usage:** `const instance = new ProviderNotFoundError(providerType, context, context.registeredProviders, context.recipeName, context.currentProvider);`
**Description:** Initialize a ProviderNotFoundError with registry context.

### Raw JSDoc Context:
```javascript
/**
   * Initialize a ProviderNotFoundError with registry context.
   *
   * @param {string} providerType - Unregistered identifier requested by the recipe.
   * @param {Object} [context={}] - Diagnostic metadata.
   * @param {string[]} [context.registeredProviders] - List of currently available provider types.
   * @param {string} [context.recipeName] - Identifier of the active assembly recipe.
   * @param {string} [context.currentProvider] - Contextual provider undergoing configuration.
   */
```

### Methods of ProviderNotFoundError

#### METHOD: ProviderNotFoundError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerNotFoundError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
```
---
<br>

## CLASS: ProviderExecutionError
**File Path:** `ContextEngine/src/internal/errors/ProviderExecutionError.js`
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

### Methods of ProviderExecutionError

#### METHOD: ProviderExecutionError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerExecutionError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
```
---
<br>

## CLASS: ProviderExecutionError
**File Path:** `ContextEngine/src/internal/errors/ProviderExecutionError.js`
**Constructor Usage:** `const instance = new ProviderExecutionError(providerName, originalError, parameters);`
**Description:** Initialize a ProviderExecutionError with execution context.

### Raw JSDoc Context:
```javascript
/**
   * Initialize a ProviderExecutionError with execution context.
   *
   * @param {string} providerName - Unique identifier of the failing provider.
   * @param {Error} originalError - Caught exception to wrap.
   * @param {Object<string, *>} parameters - Input parameters passed to provide().
   */
```

### Methods of ProviderExecutionError

#### METHOD: ProviderExecutionError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = providerExecutionError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
```
---
<br>

## CLASS: DependencyResolutionError
**File Path:** `ContextEngine/src/internal/errors/DependencyResolutionError.js`
**Constructor Usage:** `const instance = new DependencyResolutionError(message, context, context.dependency, context.providerName, context.availableParams, context.availableProviders, context.propertyPath, context.actualStructure);`
**Description:** Error indicating failure to resolve @param or $provider references due to missing data, incorrect paths, or invalid execution order.

### Raw JSDoc Context:
```javascript
/**
 * Error indicating failure to resolve @param or $provider references due to missing data, incorrect paths, or invalid execution order.
 * @class
 * @extends ContextEngineError
 */
```

### Methods of DependencyResolutionError

#### METHOD: DependencyResolutionError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolutionError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Serializes the error and its associated context into a human-readable diagnostic string.
   * @returns {string} Formatted error name, message, and JSON-serialized context.
   */
```
---
<br>

## CLASS: ContextEngineError
**File Path:** `ContextEngine/src/internal/errors/ContextEngineError.js`
**Constructor Usage:** `const instance = new ContextEngineError(message, context, context.recipeName, context.currentProvider, context.originalError, context.parameters, context.step);`
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

### Methods of ContextEngineError

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

## CLASS: SwapAndEnrichInterceptor
**File Path:** `ContextEngine/src/interceptors/SwapAndEnrichInterceptor.js`
**Constructor Usage:** `const instance = new SwapAndEnrichInterceptor(logger, substitutionLookup, config, config.originalPropertyName, config.metadataFlags, config.targetProviders, config.optionFlag, config.targetPaths);`
**Description:** Interceptor implementing transparent entity substitution (Swap) while preserving original data and adding metadata (Enrich).

### Raw JSDoc Context:
```javascript
/**
 * Interceptor implementing transparent entity substitution (Swap) while preserving original data and adding metadata (Enrich).
 * @class
 * @extends ContextInterceptor
 */
```

### Methods of SwapAndEnrichInterceptor

#### METHOD: SwapAndEnrichInterceptor._shouldIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = swapAndEnrichInterceptor._shouldIntercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Activates interception based on config.targetProviders and, in atomic
   * mode only, config.optionFlag.
   * @param {string} name Provider name.
   * @param {*} data Provider data.
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {boolean} True if criteria are met.
   * @protected
   * @override
   */
```
---
#### METHOD: SwapAndEnrichInterceptor._performIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = swapAndEnrichInterceptor._performIntercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Executes entity substitution. In `targetPaths` mode, walks each configured
   * path (via the base class's `_forEachAt`) and applies `substitutionLookup`'s
   * per-item outcome; in the default atomic mode, moves the whole `data`
   * payload to a nested property and merges the substitute with metadata (the
   * original, unchanged single-swap behavior).
   * @param {string} name Provider name.
   * @param {*} data Original entity data (atomic mode) or the shared object
   *   containing the arrays at `config.targetPaths` (targetPaths mode).
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {*} `data` in both modes: in atomic mode it is either replaced by
   *   the swapped/enriched object or returned unchanged; in targetPaths mode
   *   `data` itself is mutated in place (matching `_forEachAt`'s contract) and
   *   returned as-is.
   * @throws {Error} If substitutionLookup logic fails.
   * @protected
   * @override
   */
```
---
#### METHOD: SwapAndEnrichInterceptor._performIntercept_targetPaths
- **Scope:** instance
- **LLM Call Syntax:** `const result = swapAndEnrichInterceptor._performIntercept_targetPaths(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * `targetPaths` mode implementation of `_performIntercept`: walks every
   * configured path via the base class's `_forEachAt` and applies
   * `substitutionLookup`'s per-item outcome. Unlike atomic mode,
   * `substitutionLookup` here returns the 3-way outcome descriptor directly
   * (or `null` for "no swap") — `_forEachAt` applies it; this method does not
   * additionally wrap it in `metadataFlags`/`originalPropertyName`, since
   * those are specific to the atomic mode's "one payload, one substitute"
   * shape and don't generalize to arbitrary per-item outcomes.
   * @param {string} name Provider name.
   * @param {*} data The shared object containing the arrays at `this._targetPaths`.
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {*} `data`, mutated in place.
   * @private
   */
```
---
#### METHOD: SwapAndEnrichInterceptor._shouldIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = swapAndEnrichInterceptor._shouldIntercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Activates interception based on config.targetProviders and, in atomic
   * mode only, config.optionFlag.
   * @param {string} name Provider name.
   * @param {*} data Provider data.
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {boolean} True if criteria are met.
   * @protected
   * @override
   */
```
---
#### METHOD: SwapAndEnrichInterceptor._performIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = swapAndEnrichInterceptor._performIntercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Executes entity substitution. In `targetPaths` mode, walks each configured
   * path (via the base class's `_forEachAt`) and applies `substitutionLookup`'s
   * per-item outcome; in the default atomic mode, moves the whole `data`
   * payload to a nested property and merges the substitute with metadata (the
   * original, unchanged single-swap behavior).
   * @param {string} name Provider name.
   * @param {*} data Original entity data (atomic mode) or the shared object
   *   containing the arrays at `config.targetPaths` (targetPaths mode).
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {*} `data` in both modes: in atomic mode it is either replaced by
   *   the swapped/enriched object or returned unchanged; in targetPaths mode
   *   `data` itself is mutated in place (matching `_forEachAt`'s contract) and
   *   returned as-is.
   * @throws {Error} If substitutionLookup logic fails.
   * @protected
   * @override
   */
```
---
#### METHOD: SwapAndEnrichInterceptor.intercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = swapAndEnrichInterceptor.intercept(name, data, context, options);`
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
#### METHOD: SwapAndEnrichInterceptor._forEachAt
- **Scope:** instance
- **LLM Call Syntax:** `swapAndEnrichInterceptor._forEachAt(data, path, itemFn);`
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
#### METHOD: SwapAndEnrichInterceptor._shouldIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = swapAndEnrichInterceptor._shouldIntercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Activates interception based on config.targetProviders and, in atomic
   * mode only, config.optionFlag.
   * @param {string} name Provider name.
   * @param {*} data Provider data.
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {boolean} True if criteria are met.
   * @protected
   * @override
   */
```
---
#### METHOD: SwapAndEnrichInterceptor._performIntercept
- **Scope:** instance
- **LLM Call Syntax:** `const result = swapAndEnrichInterceptor._performIntercept(name, data, context, options);`
- **Pure JSDoc:**
```javascript
/**
   * Executes entity substitution. In `targetPaths` mode, walks each configured
   * path (via the base class's `_forEachAt`) and applies `substitutionLookup`'s
   * per-item outcome; in the default atomic mode, moves the whole `data`
   * payload to a nested property and merges the substitute with metadata (the
   * original, unchanged single-swap behavior).
   * @param {string} name Provider name.
   * @param {*} data Original entity data (atomic mode) or the shared object
   *   containing the arrays at `config.targetPaths` (targetPaths mode).
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {*} `data` in both modes: in atomic mode it is either replaced by
   *   the swapped/enriched object or returned unchanged; in targetPaths mode
   *   `data` itself is mutated in place (matching `_forEachAt`'s contract) and
   *   returned as-is.
   * @throws {Error} If substitutionLookup logic fails.
   * @protected
   * @override
   */
```
---
<br>

## CLASS: InterceptorRegistry
**File Path:** `ContextEngine/src/interceptors/InterceptorRegistry.js`
**Constructor Usage:** `const instance = new InterceptorRegistry(logger);`
**Description:** Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.

### Raw JSDoc Context:
```javascript
/**
 * Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 */
```

### Methods of InterceptorRegistry

#### METHOD: InterceptorRegistry.registerSingleton
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.registerSingleton(type, instance);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a pre-instantiated stateless interceptor.
   * @param {string} type Unique interceptor type identifier.
   * @param {Object} instance Interceptor instance implementing the intercept() method.
   * @returns {InterceptorRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty, instance is null, or intercept() method is missing.
   */
```
---
#### METHOD: InterceptorRegistry.registerFactory
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.registerFactory(type, factory);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a factory function for stateful interceptor instantiation.
   * @param {string} type Unique interceptor type identifier.
   * @param {Function} factory Function returning a new interceptor instance on each call.
   * @returns {InterceptorRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty or factory is not a function.
   */
```
---
#### METHOD: InterceptorRegistry.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.get(type);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves an interceptor instance by type, prioritizing singletons over factories.
   * @param {string} type Interceptor type identifier.
   * @returns {Object} Interceptor instance implementing intercept().
   * @throws {Error} If type is not registered or factory returns an invalid object.
   */
```
---
#### METHOD: InterceptorRegistry.getAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.getAll();`
- **Pure JSDoc:**
```javascript
/**
   * Aggregates all registered singleton and factory-instantiated interceptors.
   * @returns {Object[]} Collection of active interceptor instances.
   */
```
---
#### METHOD: InterceptorRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.has(type);`
- **Pure JSDoc:**
```javascript
/**
   * Checks for presence of an interceptor type in either registry.
   * @param {string} type Interceptor type identifier.
   * @returns {boolean} True if registered.
   */
```
---
#### METHOD: InterceptorRegistry.unregister
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.unregister(type);`
- **Pure JSDoc:**
```javascript
/**
   * Removes an interceptor from both singleton and factory registries.
   * @param {string} type Interceptor type identifier.
   * @returns {boolean} True if the interceptor existed and was removed.
   */
```
---
#### METHOD: InterceptorRegistry.clear
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Purges all singleton and factory registrations.
   * @returns {InterceptorRegistry} Fluent interface for chaining.
   */
```
---
#### METHOD: InterceptorRegistry.getRegisteredTypes
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.getRegisteredTypes();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves all registered interceptor type identifiers.
   * @returns {string[]} Collection of registered type names.
   */
```
---
#### METHOD: InterceptorRegistry.getSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.getSummary();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a technical summary of the registry state.
   * @returns {Object} Metadata including singletonCount, factoryCount, totalInterceptors, and type lists.
   */
```
---
<br>

## CLASS: ContextInterceptor
**File Path:** `ContextEngine/src/interceptors/ContextInterceptor.js`
**Constructor Usage:** `const instance = new ContextInterceptor(logger);`
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

### Methods of ContextInterceptor

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

