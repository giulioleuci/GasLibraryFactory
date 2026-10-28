# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [ContextEngine](#contextengine)

---

## ContextEngine

**Version:** 1.0.0   **Layer:** Application Orchestration (Layer 3)   **Dependencies:** CoreUtilsLib, GasExpressionEngineLib (Optional), GasResilienceLib (Optional)

### ContextAssembler

**Source:** `ContextEngine/src/ContextAssembler.ts`

Orchestrator facade for assembling complex data contexts from declarative JSON recipes.
Coordinates validation, dependency resolution, conditional execution, provider invocation, and post-processing.

**Initialization:**
```javascript
new ContextAssembler()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `providerRegistry` | `providerRegistry: unknown` |


### DataProvider

**Source:** `ContextEngine/src/DataProvider.ts`

Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.

**Initialization:**
```javascript
new DataProvider()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `_fetchData` | `_fetchData(parameters: Object): *` |
| `_generateCacheKey` | `_generateCacheKey(parameters: Object): string` |
| `_getFromCache` | `_getFromCache(cacheKey: string): *|null` |
| `_storeInCache` | `_storeInCache(cacheKey: string, data: *): void` |
| `clearCache` | `clearCache(): DataProvider` |
| `provide` | `provide(providerName: string, parameters: Object): *` |
| `_validateParameters` | `_validateParameters(parameters: Object): void` |


### PostProcessor

**Source:** `ContextEngine/src/PostProcessor.ts`

Registry and execution engine for sequential provider data transformation pipelines.

**Initialization:**
```javascript
new PostProcessor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `_registerBuiltInProcessors` | `_registerBuiltInProcessors(): void` |
| `register` | `register(type: string, processorFunc: Function): PostProcessor` |
| `has` | `has(type: string): boolean` |
| `process` | `process(processorConfigs: Object[], data: *, providerName='': string): *` |
| `getRegisteredTypes` | `getRegisteredTypes(): string[]` |


### ProviderRegistry

**Source:** `ContextEngine/src/ProviderRegistry.ts`

Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.

**Initialization:**
```javascript
new ProviderRegistry()
```


### CollectionProjectionInterceptor

**Source:** `ContextEngine/src/interceptors/CollectionProjectionInterceptor.ts`

Applies a CollectionProjector to configured collection paths after selected providers.

**Initialization:**
```javascript
new CollectionProjectionInterceptor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_shouldIntercept` | `_shouldIntercept(): void` |
| `_performIntercept` | `_performIntercept(): void` |
| `_readTarget` | `_readTarget(): void` |
| `_writeTarget` | `_writeTarget(): void` |


### ContextInterceptor

**Source:** `ContextEngine/src/interceptors/ContextInterceptor.ts`

Abstract base class for context middleware/interceptor patterns.
Enables transparent transformation, enrichment, or substitution of provider results before UDC integration.

**Initialization:**
```javascript
new ContextInterceptor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `_shouldIntercept` | `_shouldIntercept(name: string, data: *, context: Object, options: Object): boolean` |
| `_performIntercept` | `_performIntercept(name: string, data: *, context: Object, options: Object): *` |
| `intercept` | `intercept(name: string, data: *, context: Object, options={}: Object): *` |
| `_forEachAt` | `_forEachAt(data: Object, path: string, itemFn: Function): void` |


### InterceptorRegistry

**Source:** `ContextEngine/src/interceptors/InterceptorRegistry.ts`

Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.

**Initialization:**
```javascript
new InterceptorRegistry()
```


### ContextDependencyAnalyzer

**Source:** `ContextEngine/src/internal/ContextDependencyAnalyzer.ts`

**Initialization:**
```javascript
new ContextDependencyAnalyzer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `validateRecipe` | `validateRecipe(): void` |
| `analyzeRecipeDependencies` | `analyzeRecipeDependencies(): void` |
| `getConfigSummary` | `getConfigSummary(): void` |


### ContextStepExecutor

**Source:** `ContextEngine/src/internal/ContextStepExecutor.ts`

**Initialization:**
```javascript
new ContextStepExecutor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_evaluateCondition` | `_evaluateCondition(): void` |
| `_executeProvider` | `_executeProvider(): void` |
| `assemble` | `assemble(): void` |
| `_executeMutatingProvider` | `_executeMutatingProvider(providerConfig: Object, sharedTarget: Object, initialParams: Object, options={}: Object): void` |
| `_logAssemblySummary` | `_logAssemblySummary(): void` |
| `assembleInto` | `assembleInto(sharedTarget: Object, recipe: Object, initialParams={}: Object, options={}: Object): Object` |


### DependencyResolver

**Source:** `ContextEngine/src/internal/DependencyResolver.ts`

Dependency resolution engine for @param (initial) and $provider (runtime) references in recipes.
Supports dot-notation for nested properties and bracket-notation for array indices.

**Initialization:**
```javascript
new DependencyResolver()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `PARAM_PATTERN` | `PARAM_PATTERN: unknown` |
| `PROVIDER_PATTERN` | `PROVIDER_PATTERN: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `isDependency` | `isDependency(value: *): boolean` |
| `_getNestedProperty` | `_getNestedProperty(obj: Object|Array, path: string): *` |
| `resolve` | `resolve(dependency: string, initialParams: Object, providerResults: Object, providerName='': string): *` |
| `resolveAll` | `resolveAll(parameters: Object|Array, initialParams: Object, providerResults: Object, providerName='': string): Object|Array` |
| `analyzeDependencies` | `analyzeDependencies(parameters: Object|Array): Object` |


### RecipeParser

**Source:** `ContextEngine/src/internal/RecipeParser.ts`

Engine for structural validation, type checking, and normalization of JSON recipes.

**Initialization:**
```javascript
new RecipeParser()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `_validateProvider` | `_validateProvider(provider: Object, index: number): string[]` |
| `parse` | `parse(recipe: Object, recipe.providers: Object[]): Object` |
| `validate` | `validate(recipe: Object): {isValid: boolean, errors: string[]` |


### TypedRegistry

**Source:** `ContextEngine/src/internal/TypedRegistry.ts`

**Initialization:**
```javascript
new TypedRegistry(logger: Object, config: Object, config.requiredMethod: string, config.noun: string, config.article='a': string, config.notFoundError: (type: string, registeredTypes: string[]) => Error)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `registerSingleton` | `registerSingleton(type: string, instance: Object): TypedRegistry` |
| `registerFactory` | `registerFactory(type: string, factory: Function): TypedRegistry` |
| `get` | `get(type: string): Object` |
| `getAll` | `getAll(): Object[]` |
| `getRegisteredTypes` | `getRegisteredTypes(): string[]` |


### CollectionProjectionError

**Source:** `ContextEngine/src/internal/errors/CollectionProjectionError.ts`

Signals invalid declarative collection-projection configuration or execution.

**Initialization:**
```javascript
new CollectionProjectionError()
```


### ContextEngineError

**Source:** `ContextEngine/src/internal/errors/ContextEngineError.ts`

Foundation error class for the ContextEngine hierarchy, providing structured metadata and error chaining.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

**Initialization:**
```javascript
new ContextEngineError()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `toString` | `toString(): string` |


### DependencyResolutionError

**Source:** `ContextEngine/src/internal/errors/DependencyResolutionError.ts`

Error indicating failure to resolve @param or $provider references due to missing data, incorrect paths, or invalid execution order.

**Initialization:**
```javascript
new DependencyResolutionError()
```


### ProviderExecutionError

**Source:** `ContextEngine/src/internal/errors/ProviderExecutionError.ts`

Wraps original exceptions caught during provider data retrieval. Provides technical context
for debugging and retry classification by GasResilienceLib, distinguishing between
transient (e.g., timeouts, 429) and permanent (e.g., 401, 403, 404) failures.

**Initialization:**
```javascript
new ProviderExecutionError()
```


### ProviderNotFoundError

**Source:** `ContextEngine/src/internal/errors/ProviderNotFoundError.ts`

Thrown during ContextAssembler.assemble() or ProviderRegistry.get() when a recipe
references an unregistered provider. Includes technical context for typo detection
(registeredProviders) and dependency mapping (recipeName, currentProvider).

**Initialization:**
```javascript
new ProviderNotFoundError()
```


### RecipeValidationError

**Source:** `ContextEngine/src/internal/errors/RecipeValidationError.ts`

Thrown by RecipeParser.validate() or parse() during pre-execution checks. Aggregates
multiple validation failures (missing fields, duplicate names, invalid types) into
the validationErrors property to enable comprehensive error reporting.

**Initialization:**
```javascript
new RecipeValidationError()
```


### CollectionProjector

**Source:** `ContextEngine/src/projection/CollectionProjector.ts`

Runs declarative, synchronous projections without mutating the source collection.

**Initialization:**
```javascript
new CollectionProjector()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `project` | `project(): void` |
| `_apply` | `_apply(): void` |
| `_filter` | `_filter(): void` |
| `_map` | `_map(): void` |
| `_flatMap` | `_flatMap(): void` |
| `_groupBy` | `_groupBy(): void` |
| `_aggregate` | `_aggregate(): void` |
| `_distinctBy` | `_distinctBy(): void` |
| `_sortBy` | `_sortBy(): void` |
| `_insert` | `_insert(): void` |
| `_strategy` | `_strategy(): void` |
| `_runStrategy` | `_runStrategy(): void` |
| `_evaluate` | `_evaluate(): void` |
| `_itemRuntime` | `_itemRuntime(): void` |
| `_keys` | `_keys(): void` |
| `_read` | `_read(): void` |
| `_error` | `_error(): void` |


### ProjectionRegistry

**Source:** `ContextEngine/src/projection/ProjectionRegistry.ts`

Registry for application-supplied, synchronous collection projection strategies.

**Initialization:**
```javascript
new ProjectionRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(): void` |
| `get` | `get(): void` |
| `has` | `has(): void` |


### DataProviderMock

**Source:** `ContextEngine/src/testing/mocks.ts`

High-fidelity mock for DataProvider implementation in unit tests.
Simulates provider lifecycle, data retrieval, and parameter validation.

**Initialization:**
```javascript
new DataProviderMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setupData` | `setupData(data: *): DataProviderMock` |


### InterceptorMock

**Source:** `ContextEngine/src/testing/mocks.ts`

High-fidelity mock for ContextInterceptor implementation.
Simulates context transformation and conditional filtering logic.

**Initialization:**
```javascript
new InterceptorMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setupIntercept` | `setupIntercept(interceptFn: Function): InterceptorMock` |


### ProviderRegistryMock

**Source:** `ContextEngine/src/testing/mocks.ts`

In-memory registry mock for provider lifecycle and dependency resolution testing.

**Initialization:**
```javascript
new ProviderRegistryMock()
```


---

