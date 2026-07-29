# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [ContextEngine](#contextengine)

---

## ContextEngine

**Version:** 1.0.0 **Layer:** Application Orchestration (Layer 3) **Dependencies:** CoreUtilsLib, GasExpressionEngineLib (Optional), GasResilienceLib (Optional)

### ContextAssembler

Main facade for assembling data contexts from recipes.

**Initialization:**

```javascript
new ContextAssembler();
```

### DataProvider

Abstract base class for data providers.

**Initialization:**

```javascript
new DataProvider();
```

**Methods:**

- `clearCache(): DataProvider`

  > Purges all entries from the internal in-memory cache.

- `provide(providerName: string, parameters: Object): *`
  > Orchestrates the data providing process including validation, caching, performance tracking, and error wrapping.

### PostProcessor

Post-processing utilities for transforming provider data.

**Initialization:**

```javascript
new PostProcessor();
```

**Methods:**

- `register(type: string, processorFunc: Function): PostProcessor`

  > Adds a custom transformation function to the registry.

- `has(type: string): boolean`

  > Validates presence of a transformation identifier in the registry.

- `process(processorConfigs: Object[], data: *, providerName='': string): *`

  > Executes a pipeline of transformations sequentially on a data payload.

- `getRegisteredTypes(): string[]`
  > Retrieves all registered transformation identifiers.

### ProviderRegistry

Manages registration and retrieval of data providers.

**Initialization:**

```javascript
new ProviderRegistry();
```

**Methods:**

- `registerSingleton(type: string, instance: Object): ProviderRegistry`

  > Logger service.

- `registerFactory(type: string, factory: Function): ProviderRegistry`

  > Registers a factory function for stateful provider instantiation.

- `has(type: string): boolean`

  > Validates presence of a provider type in either registry.

- `unregister(type: string): boolean`

  > Removes a provider from both singleton and factory registries.

- `clear(): ProviderRegistry`

  > Purges all singleton and factory registrations.

- `getRegisteredTypes(): string[]`

  > Retrieves all registered provider type identifiers.

- `getSummary(): Object`
  > Generates a technical summary of the registry state.

### ContextInterceptor

Abstract base class for context interceptors.

**Initialization:**

```javascript
new ContextInterceptor();
```

**Methods:**

- `intercept(name: string, data: *, context: Object, options={}: Object): *`
  > Primary entry point for provider result interception. Orchestrates conditional checks and error wrapping.

### InterceptorRegistry

Manages registration and retrieval of context interceptors.

**Initialization:**

```javascript
new InterceptorRegistry(logger: Object)
```

**Methods:**

- `registerSingleton(type: string, instance: Object): InterceptorRegistry`

  > Logger service.

- `registerFactory(type: string, factory: Function): InterceptorRegistry`

  > Registers a factory function for stateful interceptor instantiation.

- `getAll(): Object[]`

  > Aggregates all registered singleton and factory-instantiated interceptors.

- `has(type: string): boolean`

  > Checks for presence of an interceptor type in either registry.

- `unregister(type: string): boolean`

  > Removes an interceptor from both singleton and factory registries.

- `clear(): InterceptorRegistry`

  > Purges all singleton and factory registrations.

- `getRegisteredTypes(): string[]`

  > Retrieves all registered interceptor type identifiers.

- `getSummary(): Object`
  > Generates a technical summary of the registry state.

### Collection projection

`CollectionProjector` runs synchronous, declarative operations on defensive copies
of arrays. Its `flatMap` and strategy operations deliberately support zero-to-many
transforms, while its trace reports the input and output count of each operation.
In `groupBy` aggregates, the special path `$item` collects the complete current
item. Grouping by a nested path (for example `actor.identity.id`) preserves a
defensive copy of that path's top-level source subtree (`actor`), so following
operations can read sibling metadata from the grouped result.

**Initialization:**

```javascript
new CollectionProjector({ registry, expressionEngine = null, logger = null })
```

**Methods:**

- `project(inputArray: unknown[], operations: ProjectionOperation[], runtimeContext: Record<string, unknown>): { value: unknown[], trace: ProjectionTraceEntry[] }`

`ProjectionRegistry` registers application-provided synchronous strategy functions:
`register(name, (value, operation, runtime) => nextValue)`.

`CollectionProjectionInterceptor` applies a projector to configured collection paths
after selected providers: `new CollectionProjectionInterceptor(logger, projector,
{ targetProviders, targetPaths, operations, optionFlag = null })`.

`SwapAndEnrichInterceptor` has been removed from the public API.

### DependencyResolver

Resolves dependencies in recipe configurations.

**Initialization:**

```javascript
new DependencyResolver();
```

**Methods:**

- `isDependency(value: *): boolean`

  > Logger service.

- `resolve(dependency: string, initialParams: Object, providerResults: Object, providerName='': string): *`

  > Resolves a single dependency reference against initial parameters and runtime provider results.

- `resolveAll(parameters: Object|Array, initialParams: Object, providerResults: Object, providerName='': string): Object|Array`

  > Recursively resolves all dependency references within a complex object or array.

- `analyzeDependencies(parameters: Object|Array): Object`
  > Analyzes a parameters structure to extract unique dependency identifiers.

### RecipeParser

Validates and parses recipe configurations.

**Initialization:**

```javascript
new RecipeParser();
```

**Methods:**

- `parse(recipe: Object, recipe.providers: Object[]): Object`

  > Executes full recipe validation and normalization. Collects structural, type, and uniqueness errors.

- `validate(recipe: Object): {isValid: boolean, errors: string[]`
  > Non-throwing wrapper for parse(). Returns a validation status object.

### ContextEngineError

Base error class for context engine-related errors.

**Initialization:**

```javascript
new ContextEngineError();
```

**Methods:**

- `toString(): string`
  > Serializes the error and its associated context into a human-readable diagnostic string.

### DependencyResolutionError

Error thrown when dependency resolution fails.

**Initialization:**

```javascript
new DependencyResolutionError();
```

### ProviderExecutionError

Error thrown when a provider execution fails.

**Initialization:**

```javascript
new ProviderExecutionError();
```

### ProviderNotFoundError

Error thrown when a provider is not found in the registry.

**Initialization:**

```javascript
new ProviderNotFoundError();
```

### RecipeValidationError

Error thrown when recipe validation fails.

**Initialization:**

```javascript
new RecipeValidationError();
```

### DataProviderMock

Centralized high-fidelity mocks for ContextEngine services.

**Initialization:**

```javascript
new DataProviderMock();
```

**Methods:**

- `setupData(data: *): DataProviderMock`
  > Fluent helper to configure static mock data return values.

### InterceptorMock

Fluent helper to configure static mock data return values.

**Initialization:**

```javascript
new InterceptorMock();
```

**Methods:**

- `setupIntercept(interceptFn: Function): InterceptorMock`
  > Fluent helper to inject custom interception implementation.

### ProviderRegistryMock

Fluent helper to inject custom interception implementation.

**Initialization:**

```javascript
new ProviderRegistryMock();
```

---
