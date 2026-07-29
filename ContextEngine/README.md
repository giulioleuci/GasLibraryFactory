# ContextEngine

**Version:** 1.0.0  
**Layer:** Application Orchestration (Layer 3)  
**Dependencies:** CoreUtilsLib, GasExpressionEngineLib (Optional), GasResilienceLib (Optional)

## 🏗️ File and Folder Structure

A highly decoupled architecture for dynamic context building:

```text
ContextEngine/
├── src/
│   ├── ContextAssembler.js     # The main orchestrator (Engine)
│   ├── DataProvider.js         # Abstract base for all data fetching logic
│   ├── ProviderRegistry.js     # Decoupled registry for provider instances
│   ├── DependencyResolver.js   # Logic for DAG-based execution ordering
│   ├── RecipeParser.js         # Validation and normalization of JSON recipes
│   ├── ContextInterceptor.js   # Middleware base for data transformation
│   ├── InterceptorRegistry.js  # Registry for context-building middleware
│   ├── projection/             # Declarative collection projection strategies
│   ├── interceptors/           # Context and collection-projection interceptors
│   ├── PostProcessor.js        # Logic for field-level transformations
│   ├── errors/                 # Framework-specific exceptions (Recipe, Dependency)
│   └── __tests__/              # Unit and integration tests
```

## 🧩 Programming Patterns

1.  **Dependency Injection (DI)**: The engine uses `ProviderRegistry` to inject required data sources into the `ContextAssembler` at runtime, ensuring loose coupling.
2.  **Interceptor Pattern (Middleware)**: Interceptors apply cross-cutting collection projections without modifying the original provider implementation.
3.  **Strategy Pattern**: `DataProvider` and its subclasses define interchangeable strategies for fetching data from different sources (APIs, Sheets, Databases).
4.  **DAG (Directed Acyclic Graph)**: `DependencyResolver` uses graph-based algorithms to determine the optimal, non-circular execution order of providers based on their parameter dependencies.
5.  **Builder Pattern / Assembler**: `ContextAssembler` orchestrates the construction of a complex result object (the Context) through a series of discrete, configurable steps.
6.  **Registry Pattern**: `ProviderRegistry` and `InterceptorRegistry` serve as central catalogs for the engine's extensible components.

## 🧩 Overview

**ContextEngine** is a powerful data orchestration framework that solves the "Data Fetching Spaghetti" problem in complex applications. Instead of hard-coding imperative data fetching logic (e.g., "fetch user, then fetch orders, then fetch products"), ContextEngine allows you to define **Declarative Recipes**.

A Recipe is a JSON configuration that describes _what_ data is needed, _where_ it comes from, and _how_ it relates to other data. The engine analyzes dependencies, determines the optimal execution order, resolves placeholders, and assembles a unified data object (the Context).

## ✨ Key Features

- **Declarative Recipes**: Define data requirements in JSON, not code.
- **Dependency Resolution**: Automatically resolves dependencies between data providers (e.g., Provider B needs output from Provider A).
  - Syntax: `@paramName` (External input)
  - Syntax: `$providerName.property` (Inter-provider dependency)
- **Context Interceptors**: Middleware pattern for declarative collection projections after selected providers.
- **Conditional Execution**: Providers can execute conditionally based on dynamic expressions (requires `GasExpressionEngineLib`).
- **Post-Processing**: Built-in pipeline for filtering, mapping, and renaming data after fetching.
- **Resilience**: Integrates with `GasResilienceLib` to automatically retry failed data providers.
- **Provider Registry**: Decoupled architecture using a registry pattern for data providers.

## 📦 Installation

```javascript
import { ContextAssembler, ProviderRegistry, DataProvider } from '@ContextEngine';
import { LoggerService } from '@CoreUtilsLib';
```

## 🚀 Quick Start

### 1. Define a Data Provider

Extend `DataProvider` and implement `_fetchData`.

```javascript
class UserProvider extends DataProvider {
  _fetchData(params) {
    // params.userId is automatically resolved before this method is called
    const user = fetchUserFromApi(params.userId);
    return user;
  }
}
```

### 2. Register & Assemble

```javascript
// Initialize services
const logger = new LoggerService();
const registry = new ProviderRegistry(logger);
const assembler = new ContextAssembler(logger, registry);

// Register the provider
registry.registerSingleton('USER_DATA', new UserProvider(logger));

// Define the Recipe
const recipe = {
  providers: [
    {
      name: 'currentUser', // Key in the final context
      type: 'USER_DATA', // Registered provider type
      parameters: {
        userId: '@inputUserId' // Dependency on initial input
      }
    },
    {
      name: 'userOrders',
      type: 'ORDER_DATA',
      condition: '$currentUser.isActive == true', // Conditional execution
      parameters: {
        customerId: '$currentUser.id' // Dependency on previous provider
      }
    }
  ]
};

// Execute
const context = assembler.assemble(recipe, { inputUserId: 123 });

console.log(context.currentUser); // { id: 123, name: 'Alice', ... }
console.log(context.userOrders); // [ ...orders... ]
```

## 📚 Recipe Syntax Guide

A recipe is a JSON object containing an array of provider configurations.

```json
{
  "providers": [
    {
      "name": "uniqueKeyInContext",
      "type": "REGISTERED_PROVIDER_TYPE",
      "condition": "{{@enableFeature}} == true",
      "parameters": {
        "staticVal": "hardcoded",
        "inputVal": "@paramName",
        "dynamicVal": "$otherProvider.nested.field"
      },
      "postProcess": [
        { "type": "filterFields", "fields": ["id", "name"] },
        { "type": "renameFields", "mapping": { "name": "fullName" } }
      ]
    }
  ]
}
```

### Dependency Syntax

- **`@key`**: Refers to a value passed to `assembler.assemble(recipe, initialParams)`.
- **`$provider.path`**: Refers to the result of a previously executed provider in the same recipe.

### Post-Processors

Transform data immediately after fetching.

- `filterFields`: Whitelist specific keys.
- `renameFields`: Rename object keys.
- `mapValues`: Transform values based on a map.
- `defaultValues`: Fill missing fields.

## ⚙️ Architecture

1.  **Recipe Parsing**: The `RecipeParser` validates the JSON structure.
2.  **Dependency Analysis**: The `DependencyResolver` builds a graph to determine execution order.
3.  **Execution Loop**:
    - Evaluates `condition` (if `GasExpressionEngineLib` is present).
    - Resolves `parameters`.
    - Calls `provider.provide()`.
    - Runs `PostProcessor` chain.
    - Stores result in the Context.
4.  **Error Handling**: If `GasResilienceLib` is provided, failed providers are retried automatically.

## 🎯 Context Interceptors (Middleware)

ContextEngine supports interceptors for transparent, declarative collection projection.

### Overview

Interceptors sit between selected DataProviders and final context assembly. Use
`CollectionProjectionInterceptor` with `CollectionProjector` to apply an ordered
pipeline to one or more collection paths. Operations include filtering, mapping,
grouping, distinctness, and `flatMap`; therefore a projection deliberately supports
zero-to-many transformations without mutating the source collection.

`groupBy` aggregates may use `$item` to collect each complete source item. Nested
grouping keys retain a copied top-level source subtree, allowing later operations
such as `sortBy` to read sibling metadata without application-side normalization.

`SwapAndEnrichInterceptor` has been removed from the public API. Model substitutions
as an application-supplied projection strategy when they operate on collections.

### Quick Example: Project a collection

```javascript
import {
  CollectionProjector,
  CollectionProjectionInterceptor,
  InterceptorRegistry
} from '@ContextEngine';

const projector = new CollectionProjector({ logger });
const interceptor = new CollectionProjectionInterceptor(logger, projector, {
  targetProviders: ['assignments'],
  targetPaths: ['focus.items'],
  operations: [
    { type: 'filter', expression: 'item.active === true' },
    { type: 'flatMap', path: 'assignees', mergeParent: true },
    { type: 'distinctBy', keys: ['id'] }
  ]
});

const interceptors = new InterceptorRegistry(logger);
interceptors.registerSingleton('ProjectAssignments', interceptor);
```

### Creating Custom Interceptors

Extend `ContextInterceptor` base class:

```javascript
import { ContextInterceptor } from '@ContextEngine';

class TimestampInterceptor extends ContextInterceptor {
  _shouldIntercept(name, data, context, options) {
    // Return true to intercept, false to skip
    return options.addTimestamps === true;
  }

  _performIntercept(name, data, context, options) {
    // Transform data and return modified version
    return {
      ...data,
      _fetchedAt: new Date().toISOString(),
      _source: name
    };
  }
}

// Register and use
interceptorRegistry.registerSingleton('Timestamp', new TimestampInterceptor(logger));
```

### Interceptor Execution Order

1. Provider executes → Raw data
2. Post-processors apply → Processed data
3. **Interceptors apply** (sequentially) → Final data
4. Result stored in context

Multiple interceptors are applied in registration order.

### Conditional Activation

Interceptors can be conditionally activated via runtime options:

```javascript
const context = assembler.assemble(recipe, params, {
  projectAssignments: true, // Enable configured collection projection
  environment: 'test', // Environment-specific overrides
  enableCaching: false // Runtime flags
});
```

Each interceptor checks `_shouldIntercept()` to decide whether to activate.

### Benefits

**Declarative Collection Projection**

- Recipes keep provider data collection-oriented and composable
- Pipelines can filter, reshape, aggregate, or expand items from zero to many
- The projector returns defensive copies, preserving provider-owned source data

## 🧪 Testing

The library is designed for testability. You can register mock providers in the registry to test complex assembly logic without making real API calls.

```bash
npm test ContextEngine
```
