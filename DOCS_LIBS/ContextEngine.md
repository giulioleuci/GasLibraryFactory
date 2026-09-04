# API Reference: ContextEngine

## CLASS: ProviderRegistry
**File Path:** `ContextEngine/src/ProviderRegistry.js`
**Constructor Usage:** `const instance = new ProviderRegistry();`
**Description:** Manages registration and retrieval of data providers.

/

import { TypedRegistry } from './internal/TypedRegistry';
import { ProviderNotFoundError } from './internal/errors/ProviderNotFoundError';

/**
Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
@class
@extends TypedRegistry

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/ProviderRegistry.js
 * @description Manages registration and retrieval of data providers.
 * @version 1.0.0
 */

import { TypedRegistry } from './internal/TypedRegistry';
import { ProviderNotFoundError } from './internal/errors/ProviderNotFoundError';

/**
 * Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 * @extends TypedRegistry
 */
```

<br>

## CLASS: PostProcessor
**File Path:** `ContextEngine/src/PostProcessor.js`
**Constructor Usage:** `const instance = new PostProcessor();`
**Description:** Post-processing utilities for transforming provider data.

/

import { isPlainObject, isArray } from '@CoreUtilsLib';

/**
Registry and execution engine for sequential provider data transformation pipelines.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/PostProcessor.js
 * @description Post-processing utilities for transforming provider data.
 * @version 1.0.0
 */

import { isPlainObject, isArray } from '@CoreUtilsLib';

/**
 * Registry and execution engine for sequential provider data transformation pipelines.
 * @class
 */
```

### Methods of PostProcessor

#### METHOD: PostProcessor.if
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PostProcessor.if
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.if(typeof logger.debug !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PostProcessor.for
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.for(const key in item);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: PostProcessor.for
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.for(const key in obj);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: PostProcessor.for
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.for(const key in config.defaults);`
- **Pure JSDoc:**
```javascript
/** Method for */
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
#### METHOD: PostProcessor.if
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.if(!type || typeof type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PostProcessor.if
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.if(typeof processorFunc !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: PostProcessor.if
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.if(!type || typeof type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: PostProcessor.if
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.if(processorConfigs.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PostProcessor.for
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: PostProcessor.if
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.if(!config || typeof config !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PostProcessor.if
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.if(!config.type || typeof config.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PostProcessor.catch
- **Scope:** instance
- **LLM Call Syntax:** `postProcessor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
**Constructor Usage:** `const instance = new DataProvider();`
**Description:** Abstract base class for data providers.

/

import { ProviderExecutionError } from './internal/errors/ProviderExecutionError';

/**
Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.
@class
@abstract

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/DataProvider.js
 * @description Abstract base class for data providers.
 * @version 1.0.0
 */

import { ProviderExecutionError } from './internal/errors/ProviderExecutionError';

/**
 * Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.
 * @class
 * @abstract
 */
```

### Methods of DataProvider

#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(typeof logger.debug !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(options !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(!this._cacheable);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(!cached);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(now - cached.timestamp > this._cacheDurationMs);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(!this._cacheable);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(!providerName || typeof providerName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(!parameters || typeof parameters !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.if
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.if(cachedData !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DataProvider.catch
- **Scope:** instance
- **LLM Call Syntax:** `dataProvider.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: or
**File Path:** `ContextEngine/src/DataProvider.js`
**Constructor Usage:** `const instance = new or();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: ContextAssembler
**File Path:** `ContextEngine/src/ContextAssembler.js`
**Constructor Usage:** `const instance = new ContextAssembler();`
**Description:** Main facade for assembling data contexts from recipes.

/

import { DependencyResolver } from './internal/DependencyResolver';
import { RecipeParser } from './internal/RecipeParser';
import { PostProcessor } from './PostProcessor';
import { ContextEngineError } from './internal/errors/ContextEngineError';
import { ContextStepExecutor } from './internal/ContextStepExecutor';
import { ContextDependencyAnalyzer } from './internal/ContextDependencyAnalyzer';

/**
Orchestrator facade for assembling complex data contexts from declarative JSON recipes.
Coordinates validation, dependency resolution, conditional execution, provider invocation, and post-processing.
@class
@example
const recipe = {
  providers: [
    {
      name: 'user',
      type: 'UserDataProvider',
      condition: '{{userId}} != null',
      parameters: { userId: '@userId' }
    },
    {
      name: 'analytics',
      type: 'AnalyticsProvider',
      condition: 'len($user.orders) > 0',
      parameters: { orders: '$user.orders' },
      postProcess: [{ type: 'round', decimals: 2 }]
    }
  ]
};
const context = assembler.assemble(recipe, { userId: 123 });
@example
// Mutation mode: every provider mutates the SAME shared target object in
// place instead of producing a value merged into a flat, provider-keyed
// map. Useful for consumers whose "context" is one deeply nested object
// multiple providers read from and write into at the same paths (e.g. a
// recipe where a later provider must overwrite a field an earlier
// provider already set). Provider return values are ignored in this mode.
const sharedTarget = { meta: {}, focus: {} };
assembler.assembleInto(sharedTarget, recipe, { userId: 123 });
// sharedTarget now holds everything every provider wrote, in recipe order.

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/ContextAssembler.js
 * @description Main facade for assembling data contexts from recipes.
 * @version 1.0.0
 */

import { DependencyResolver } from './internal/DependencyResolver';
import { RecipeParser } from './internal/RecipeParser';
import { PostProcessor } from './PostProcessor';
import { ContextEngineError } from './internal/errors/ContextEngineError';
import { ContextStepExecutor } from './internal/ContextStepExecutor';
import { ContextDependencyAnalyzer } from './internal/ContextDependencyAnalyzer';

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

### Methods of ContextAssembler

#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(logger);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.for
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.for(const method of requiredLoggerMethods);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(typeof logger[method] !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(providerRegistry);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(typeof providerRegistry !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(typeof providerRegistry.get !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(expressionEngine !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(exceptionService !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(interceptorRegistry !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.if
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.if(options !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextAssembler.logger
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.logger();`
- **Pure JSDoc:**
```javascript
/** Method logger */
```
---
#### METHOD: ContextAssembler.providerRegistry
- **Scope:** instance
- **LLM Call Syntax:** `contextAssembler.providerRegistry();`
- **Pure JSDoc:**
```javascript
/** Method providerRegistry */
```
---
<br>

## CLASS: DataProviderMock
**File Path:** `ContextEngine/src/testing/mocks.js`
**Constructor Usage:** `const instance = new DataProviderMock();`
**Description:** Centralized high-fidelity mocks for ContextEngine services.

/

/**
High-fidelity mock for DataProvider implementation in unit tests.
Simulates provider lifecycle, data retrieval, and parameter validation.

@class DataProviderMock

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for ContextEngine services.
 * @version 1.0.0
 */

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
**Description:** Fluent helper to configure static mock data return values.

### Raw JSDoc Context:
```javascript
/**
   * Fluent helper to configure static mock data return values.
   *
   * @param {*} data - Payload to return from provide and _fetchData.
   * @returns {DataProviderMock} Current instance for chaining.
   */
  setupData(data) {
    this.provide.mockReturnValue(data);
    this._fetchData.mockReturnValue(data);
    return this;
  }
}

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
**Description:** Fluent helper to inject custom interception implementation.

### Raw JSDoc Context:
```javascript
/**
   * Fluent helper to inject custom interception implementation.
   *
   * @param {Function} interceptFn - Logic mapping PipelineContext to transformed PipelineContext.
   * @returns {InterceptorMock} Current instance for chaining.
   */
  setupIntercept(interceptFn) {
    this.intercept.mockImplementation(interceptFn);
    return this;
  }
}

/**
 * In-memory registry mock for provider lifecycle and dependency resolution testing.
 *
 * @class ProviderRegistryMock
 */
```

<br>

## CLASS: ProjectionRegistry
**File Path:** `ContextEngine/src/projection/ProjectionRegistry.js`
**Constructor Usage:** `const instance = new ProjectionRegistry();`
**Description:** Registry for application-supplied, synchronous collection projection strategies.

### Raw JSDoc Context:
```javascript
/**
 * Registry for application-supplied, synchronous collection projection strategies.
 */
```

### Methods of ProjectionRegistry

#### METHOD: ProjectionRegistry.register
- **Scope:** instance
- **LLM Call Syntax:** `projectionRegistry.register(name, strategy);`
- **Pure JSDoc:**
```javascript
/** Method register */
```
---
#### METHOD: ProjectionRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `projectionRegistry.if(!name || typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ProjectionRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `projectionRegistry.if(typeof strategy !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ProjectionRegistry.has
- **Scope:** instance
- **LLM Call Syntax:** `projectionRegistry.has(name);`
- **Pure JSDoc:**
```javascript
/** Method has */
```
---
<br>

## CLASS: CollectionProjector
**File Path:** `ContextEngine/src/projection/CollectionProjector.js`
**Constructor Usage:** `const instance = new CollectionProjector();`
**Description:** Runs declarative, synchronous projections without mutating the source collection.

### Raw JSDoc Context:
```javascript
/**
 * Runs declarative, synchronous projections without mutating the source collection.
 */
```

### Methods of CollectionProjector

#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(!registry || typeof registry.get !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(expressionEngine !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.project
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.project(inputArray, operations, runtimeContext);`
- **Pure JSDoc:**
```javascript
/** Method project */
```
---
#### METHOD: CollectionProjector.catch
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(error instanceof CollectionProjectionError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.switch
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.switch(operation.type);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(!operation.expression || typeof operation.expression !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(typeof config.from);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(!operation.path && !operation.strategy);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(operation.mergeParent);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.switch
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.switch(config.type);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: CollectionProjector.for
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.for(const key of keys);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(leftValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(!name || typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(!strategy);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(!this._expressionEngine);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjector.catch
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: CollectionProjector.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjector.if(path);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: holds
**File Path:** `ContextEngine/src/internal/TypedRegistry.js`
**Constructor Usage:** `const instance = new holds();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: TypedRegistry
**File Path:** `ContextEngine/src/internal/TypedRegistry.js`
**Constructor Usage:** `const instance = new TypedRegistry();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of TypedRegistry

#### METHOD: TypedRegistry.registerSingleton
- **Scope:** instance
- **LLM Call Syntax:** `const result = typedRegistry.registerSingleton(type, instance);`
- **Pure JSDoc:**
```javascript
/**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
  get logger() {
    return this._logger;
  }

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
#### METHOD: TypedRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `typedRegistry.if(instance && typeof instance[this._requiredMethod]);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
**File Path:** `ContextEngine/src/internal/RecipeParser.js`
**Constructor Usage:** `const instance = new RecipeParser();`
**Description:** Validates and parses recipe configurations.

/

import { RecipeValidationError } from './errors/RecipeValidationError';

/**
Engine for structural validation, type checking, and normalization of JSON recipes.
@class
@example
const recipe = {
  providers: [
    {
      name: 'user',
      type: 'UserDataProvider',
      parameters: { id: '@userId' },
      condition: 'is_admin == true',
      postProcess: [{ type: 'filter', fields: ['id'] }]
    }
  ]
};

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/RecipeParser.js
 * @description Validates and parses recipe configurations.
 * @version 1.0.0
 */

import { RecipeValidationError } from './errors/RecipeValidationError';

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

#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(typeof logger.debug !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(!provider || typeof provider !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(!provider.name || typeof provider.name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(!provider.type || typeof provider.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(provider.parameters !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(provider.parameters);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(provider.condition !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(typeof provider.condition !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(provider.postProcess !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(!pp || typeof pp !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(!pp.type || typeof pp.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(!recipe || typeof recipe !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(!recipe.providers);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(recipe.providers.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(duplicates.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(errors.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: RecipeParser.catch
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: RecipeParser.if
- **Scope:** instance
- **LLM Call Syntax:** `recipeParser.if(error instanceof RecipeValidationError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: DependencyResolver
**File Path:** `ContextEngine/src/internal/DependencyResolver.js`
**Constructor Usage:** `const instance = new DependencyResolver();`
**Description:** Resolves dependencies in recipe configurations.

/

import { DependencyResolutionError } from './errors/DependencyResolutionError';

/**
Dependency resolution engine for @param (initial) and $provider (runtime) references in recipes.
Supports dot-notation for nested properties and bracket-notation for array indices.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/DependencyResolver.js
 * @description Resolves dependencies in recipe configurations.
 * @version 1.0.0
 */

import { DependencyResolutionError } from './errors/DependencyResolutionError';

/**
 * Dependency resolution engine for @param (initial) and $provider (runtime) references in recipes.
 * Supports dot-notation for nested properties and bracket-notation for array indices.
 * @class
 */
```

### Methods of DependencyResolver

#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(typeof logger.debug !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.isDependency
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver.isDependency(or, value);`
- **Pure JSDoc:**
```javascript
/**
     * Logger service.
     * @private
     * @type {Object}
     */
    this._logger = logger;
  }

  /**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
  get logger() {
    return this._logger;
  }

  /**
   * Validates if a string value matches @param or $provider syntax.
   * @param {*} value Target value to inspect.
   * @returns {boolean} True if string matches dependency patterns.
   */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(typeof value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(!path);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.for(const part of parts);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(current);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(arrayMatch);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.resolve
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver.resolve(dependency, initialParams, identifiers, providerResults, providerName);`
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
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(typeof dependency !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(!initialParams || typeof initialParams !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(!providerResults || typeof providerResults !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(paramMatch);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(providerMatch);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(!propertyPath);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.resolveAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = dependencyResolver.resolveAll(parameters, initialParams, identifiers., providerResults, providerName);`
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
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(!parameters || typeof parameters !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(!initialParams || typeof initialParams !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(!providerResults || typeof providerResults !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.for(const key in parameters);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(item !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: DependencyResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.for(const key in obj);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(paramMatch);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(providerMatch);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DependencyResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `dependencyResolver.if(value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ContextStepExecutor
**File Path:** `ContextEngine/src/internal/ContextStepExecutor.js`
**Constructor Usage:** `const instance = new ContextStepExecutor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ContextStepExecutor

#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(!condition);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(!this.facade._expressionEngine);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.catch
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(this.facade._exceptionService);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(providerConfig.postProcess && providerConfig.postProcess.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(this.facade._interceptorRegistry);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(interceptors.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.for
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.for(const interceptor of interceptors);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: ContextStepExecutor.assemble
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.assemble(recipe, initialParams, options);`
- **Pure JSDoc:**
```javascript
/** Method assemble */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(!recipe || typeof recipe !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(initialParams !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(options !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.for
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.for(const providerConfig of validatedRecipe.providers);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(!shouldExecute);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.catch
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ContextStepExecutor.catch
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(error instanceof ContextEngineError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(this.facade._exceptionService);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(this.facade._interceptorRegistry);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(interceptors.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.for
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.for(const interceptor of interceptors);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(typeof this.facade._logger.logSummary);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(sharedTarget);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(!recipe || typeof recipe !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(initialParams !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(options !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.for
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.for(const providerConfig of validatedRecipe.providers);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(!shouldExecute);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextStepExecutor.catch
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ContextStepExecutor.catch
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ContextStepExecutor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.if(error instanceof ContextEngineError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ContextDependencyAnalyzer
**File Path:** `ContextEngine/src/internal/ContextDependencyAnalyzer.js`
**Constructor Usage:** `const instance = new ContextDependencyAnalyzer();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ContextDependencyAnalyzer

#### METHOD: ContextDependencyAnalyzer.validateRecipe
- **Scope:** instance
- **LLM Call Syntax:** `contextDependencyAnalyzer.validateRecipe(recipe);`
- **Pure JSDoc:**
```javascript
/** Method validateRecipe */
```
---
#### METHOD: ContextDependencyAnalyzer.analyzeRecipeDependencies
- **Scope:** instance
- **LLM Call Syntax:** `contextDependencyAnalyzer.analyzeRecipeDependencies(recipe);`
- **Pure JSDoc:**
```javascript
/** Method analyzeRecipeDependencies */
```
---
#### METHOD: ContextDependencyAnalyzer.for
- **Scope:** instance
- **LLM Call Syntax:** `contextDependencyAnalyzer.for(const provider of validatedRecipe.providers);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: ContextDependencyAnalyzer.catch
- **Scope:** instance
- **LLM Call Syntax:** `contextDependencyAnalyzer.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ContextDependencyAnalyzer.getConfigSummary
- **Scope:** instance
- **LLM Call Syntax:** `contextDependencyAnalyzer.getConfigSummary();`
- **Pure JSDoc:**
```javascript
/** Method getConfigSummary */
```
---
<br>

## CLASS: RecipeValidationError
**File Path:** `ContextEngine/src/internal/errors/RecipeValidationError.js`
**Constructor Usage:** `const instance = new RecipeValidationError();`
**Description:** Error thrown when recipe validation fails.


@overview
Thrown by RecipeParser.validate() when a recipe fails structural validation.
This error indicates issues with recipe configuration before execution begins.

## When This Error Occurs
- **Missing Required Fields**: Recipe missing `providers` array
- **Invalid Provider Structure**: Provider missing `name` or `type`
- **Invalid Types**: Wrong data types (e.g., string instead of array)
- **Duplicate Provider Names**: Multiple providers with same name
- **Invalid Post-Processors**: Post-processor type not recognized
- **Invalid Conditions**: Malformed conditional expressions

## Common Validation Failures
1. Missing `providers` array in recipe
2. Provider missing required `name` field
3. Provider missing required `type` field
4. Provider `name` not a string
5. Provider `type` not a string
6. Provider `config` not an object
7. Duplicate provider names in recipe
8. Post-processor missing `type` field
9. Post-processor `config` not an object

## Error Handling
- **Not Retryable**: Validation errors require recipe correction, not retry
- **Fail Fast**: Thrown before any provider execution
- **Multiple Errors**: `validationErrors` array contains all issues found
- **UI/API Integration**: Use validation errors to show user-friendly messages

## Prevention
- Validate recipes before deployment
- Use RecipeParser.validate() in tests
- Check recipe structure in UI/API before submission
/

import { ContextEngineError } from './ContextEngineError';

/**
Error signaling structural or configuration non-compliance in a Context Recipe.

@class RecipeValidationError
@extends ContextEngineError

Thrown by RecipeParser.validate() or parse() during pre-execution checks. Aggregates
multiple validation failures (missing fields, duplicate names, invalid types) into
the validationErrors property to enable comprehensive error reporting.

@example
throw new RecipeValidationError('Invalid Recipe', { validationErrors: ['providers is required'] });

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/errors/RecipeValidationError.js
 * @description Error thrown when recipe validation fails.
 * @version 1.0.0
 *
 * @overview
 * Thrown by RecipeParser.validate() when a recipe fails structural validation.
 * This error indicates issues with recipe configuration before execution begins.
 *
 * ## When This Error Occurs
 * - **Missing Required Fields**: Recipe missing `providers` array
 * - **Invalid Provider Structure**: Provider missing `name` or `type`
 * - **Invalid Types**: Wrong data types (e.g., string instead of array)
 * - **Duplicate Provider Names**: Multiple providers with same name
 * - **Invalid Post-Processors**: Post-processor type not recognized
 * - **Invalid Conditions**: Malformed conditional expressions
 *
 * ## Common Validation Failures
 * 1. Missing `providers` array in recipe
 * 2. Provider missing required `name` field
 * 3. Provider missing required `type` field
 * 4. Provider `name` not a string
 * 5. Provider `type` not a string
 * 6. Provider `config` not an object
 * 7. Duplicate provider names in recipe
 * 8. Post-processor missing `type` field
 * 9. Post-processor `config` not an object
 *
 * ## Error Handling
 * - **Not Retryable**: Validation errors require recipe correction, not retry
 * - **Fail Fast**: Thrown before any provider execution
 * - **Multiple Errors**: `validationErrors` array contains all issues found
 * - **UI/API Integration**: Use validation errors to show user-friendly messages
 *
 * ## Prevention
 * - Validate recipes before deployment
 * - Use RecipeParser.validate() in tests
 * - Check recipe structure in UI/API before submission
 */

import { ContextEngineError } from './ContextEngineError';

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
**File Path:** `ContextEngine/src/internal/errors/ProviderNotFoundError.js`
**Constructor Usage:** `const instance = new ProviderNotFoundError();`
**Description:** Error thrown when a provider is not found in the registry.


@overview
Thrown by ProviderRegistry.get() when attempting to retrieve a provider that
has not been registered. This error indicates a configuration issue where a
recipe references a provider type that doesn't exist in the registry.

## When This Error Occurs
- **Provider Not Registered**: Recipe references provider type not registered
- **Typo in Type Name**: Provider type misspelled in recipe
- **Registration Missing**: Forgot to register provider before assembling recipe
- **Case Sensitivity**: Provider type case doesn't match registration
- **Wrong Environment**: Provider registered in different context/instance

## Common Causes
1. **Missing Registration**: Forgot `registry.registerSingleton('Type', instance)`
2. **Typo**: Recipe uses "UserProvider" but registered as "UserDataProvider"
3. **Case Mismatch**: Recipe uses "userProvider" but registered as "UserProvider"
4. **Order Issue**: Recipe executed before provider registration
5. **Wrong Registry**: Multiple ContextAssembler instances with separate registries
6. **Built-in Provider**: Assuming built-in provider exists without registration

## Troubleshooting
- Check error context for `registeredProviders` array
- Verify provider type spelling matches registration exactly
- Ensure provider is registered before recipe execution
- Use `getConfigSummary()` to list all registered providers
- Check for case sensitivity issues in provider type names

## Prevention
- Register all providers at application startup
- Use constants for provider type names
- Document required providers in recipe documentation
- Validate provider availability before recipe execution
- Use centralized registration module
/

import { ContextEngineError } from './ContextEngineError';

/**
Error signaling a missing registration for a requested DataProvider type.

@class ProviderNotFoundError
@extends ContextEngineError

Thrown during ContextAssembler.assemble() or ProviderRegistry.get() when a recipe
references an unregistered provider. Includes technical context for typo detection
(registeredProviders) and dependency mapping (recipeName, currentProvider).

@example
throw new ProviderNotFoundError('UserDataProvider', { registeredProviders: ['Auth', 'Config'] });

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/errors/ProviderNotFoundError.js
 * @description Error thrown when a provider is not found in the registry.
 * @version 1.0.0
 *
 * @overview
 * Thrown by ProviderRegistry.get() when attempting to retrieve a provider that
 * has not been registered. This error indicates a configuration issue where a
 * recipe references a provider type that doesn't exist in the registry.
 *
 * ## When This Error Occurs
 * - **Provider Not Registered**: Recipe references provider type not registered
 * - **Typo in Type Name**: Provider type misspelled in recipe
 * - **Registration Missing**: Forgot to register provider before assembling recipe
 * - **Case Sensitivity**: Provider type case doesn't match registration
 * - **Wrong Environment**: Provider registered in different context/instance
 *
 * ## Common Causes
 * 1. **Missing Registration**: Forgot `registry.registerSingleton('Type', instance)`
 * 2. **Typo**: Recipe uses "UserProvider" but registered as "UserDataProvider"
 * 3. **Case Mismatch**: Recipe uses "userProvider" but registered as "UserProvider"
 * 4. **Order Issue**: Recipe executed before provider registration
 * 5. **Wrong Registry**: Multiple ContextAssembler instances with separate registries
 * 6. **Built-in Provider**: Assuming built-in provider exists without registration
 *
 * ## Troubleshooting
 * - Check error context for `registeredProviders` array
 * - Verify provider type spelling matches registration exactly
 * - Ensure provider is registered before recipe execution
 * - Use `getConfigSummary()` to list all registered providers
 * - Check for case sensitivity issues in provider type names
 *
 * ## Prevention
 * - Register all providers at application startup
 * - Use constants for provider type names
 * - Document required providers in recipe documentation
 * - Validate provider availability before recipe execution
 * - Use centralized registration module
 */

import { ContextEngineError } from './ContextEngineError';

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
**File Path:** `ContextEngine/src/internal/errors/ProviderExecutionError.js`
**Constructor Usage:** `const instance = new ProviderExecutionError();`
**Description:** Error thrown when a provider execution fails.


@overview
Thrown by DataProvider.provide() when a provider's _fetchData() method fails
during execution. This error wraps the original error and provides context about
which provider failed and with what parameters.

## When This Error Occurs
- **Network Failures**: API calls timeout or return errors
- **Database Errors**: Query failures or connection issues
- **Authentication Errors**: API authentication failures
- **Invalid Data**: Data source returns unexpected format
- **Resource Not Found**: Requested resource doesn't exist
- **Rate Limiting**: API rate limits exceeded
- **Permission Errors**: Insufficient permissions to access resource
- **Implementation Errors**: Bugs in provider's _fetchData() method

## Common Failure Scenarios
1. **Google API Errors**: SpreadsheetApp/DriveApp failures
2. **External API Errors**: HTTP 500/503/504 responses
3. **Data Validation**: Invalid data format from source
4. **Timeout**: Operation exceeds time limit
5. **Memory Errors**: Dataset too large for GAS
6. **Logic Errors**: Null pointer, undefined property access

## Integration with GasResilienceLib
This error can be automatically retried if:
- Error is classified as transient (network, timeout, rate limit)
- ExceptionService is configured in ContextAssembler
- Maximum retry attempts not exceeded

Non-retryable errors (validation, permission) fail immediately.

## Error Recovery
- **Automatic Retry**: Transient errors retried with exponential backoff
- **Circuit Breaker**: Repeated failures trigger circuit breaker
- **Fallback**: Recipe can continue if provider is conditionally executed
- **Logging**: All failures logged with full context

## Prevention
- Implement robust error handling in _fetchData()
- Validate parameters before executing external operations
- Use GasResilienceLib for automatic retry of transient errors
- Add timeout handling for long-running operations
- Test providers with invalid/missing data scenarios
/

import { ContextEngineError } from './ContextEngineError';

/**
Error signaling failure during DataProvider._fetchData() execution.

@class ProviderExecutionError
@extends ContextEngineError

Wraps original exceptions caught during provider data retrieval. Provides technical context
for debugging and retry classification by GasResilienceLib, distinguishing between
transient (e.g., timeouts, 429) and permanent (e.g., 401, 403, 404) failures.

@example
throw new ProviderExecutionError('UserDataProvider', new Error('Timeout'), { userId: 123 });

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/errors/ProviderExecutionError.js
 * @description Error thrown when a provider execution fails.
 * @version 1.0.0
 *
 * @overview
 * Thrown by DataProvider.provide() when a provider's _fetchData() method fails
 * during execution. This error wraps the original error and provides context about
 * which provider failed and with what parameters.
 *
 * ## When This Error Occurs
 * - **Network Failures**: API calls timeout or return errors
 * - **Database Errors**: Query failures or connection issues
 * - **Authentication Errors**: API authentication failures
 * - **Invalid Data**: Data source returns unexpected format
 * - **Resource Not Found**: Requested resource doesn't exist
 * - **Rate Limiting**: API rate limits exceeded
 * - **Permission Errors**: Insufficient permissions to access resource
 * - **Implementation Errors**: Bugs in provider's _fetchData() method
 *
 * ## Common Failure Scenarios
 * 1. **Google API Errors**: SpreadsheetApp/DriveApp failures
 * 2. **External API Errors**: HTTP 500/503/504 responses
 * 3. **Data Validation**: Invalid data format from source
 * 4. **Timeout**: Operation exceeds time limit
 * 5. **Memory Errors**: Dataset too large for GAS
 * 6. **Logic Errors**: Null pointer, undefined property access
 *
 * ## Integration with GasResilienceLib
 * This error can be automatically retried if:
 * - Error is classified as transient (network, timeout, rate limit)
 * - ExceptionService is configured in ContextAssembler
 * - Maximum retry attempts not exceeded
 *
 * Non-retryable errors (validation, permission) fail immediately.
 *
 * ## Error Recovery
 * - **Automatic Retry**: Transient errors retried with exponential backoff
 * - **Circuit Breaker**: Repeated failures trigger circuit breaker
 * - **Fallback**: Recipe can continue if provider is conditionally executed
 * - **Logging**: All failures logged with full context
 *
 * ## Prevention
 * - Implement robust error handling in _fetchData()
 * - Validate parameters before executing external operations
 * - Use GasResilienceLib for automatic retry of transient errors
 * - Add timeout handling for long-running operations
 * - Test providers with invalid/missing data scenarios
 */

import { ContextEngineError } from './ContextEngineError';

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
**File Path:** `ContextEngine/src/internal/errors/DependencyResolutionError.js`
**Constructor Usage:** `const instance = new DependencyResolutionError();`
**Description:** Error thrown when dependency resolution fails.

/

import { ContextEngineError } from './ContextEngineError';

/**
Error indicating failure to resolve @param or $provider references due to missing data, incorrect paths, or invalid execution order.
@class
@extends ContextEngineError

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/errors/DependencyResolutionError.js
 * @description Error thrown when dependency resolution fails.
 * @version 1.0.0
 */

import { ContextEngineError } from './ContextEngineError';

/**
 * Error indicating failure to resolve @param or $provider references due to missing data, incorrect paths, or invalid execution order.
 * @class
 * @extends ContextEngineError
 */
```

<br>

## CLASS: ContextEngineError
**File Path:** `ContextEngine/src/internal/errors/ContextEngineError.js`
**Constructor Usage:** `const instance = new ContextEngineError();`
**Description:** Base error class for context engine-related errors.

/

import { BaseError } from '@CoreUtilsLib';

/**
Foundation error class for the ContextEngine hierarchy, providing structured metadata and error chaining.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
@class
@extends BaseError

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/errors/ContextEngineError.js
 * @description Base error class for context engine-related errors.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

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

## CLASS: CollectionProjectionError
**File Path:** `ContextEngine/src/internal/errors/CollectionProjectionError.js`
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
**File Path:** `ContextEngine/src/interceptors/InterceptorRegistry.js`
**Constructor Usage:** `const instance = new InterceptorRegistry();`
**Description:** Manages registration and retrieval of context interceptors.

/

import { TypedRegistry } from '../internal/TypedRegistry';

/**
Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.
@class
@extends TypedRegistry

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/InterceptorRegistry.js
 * @description Manages registration and retrieval of context interceptors.
 * @version 1.0.0
 */

import { TypedRegistry } from '../internal/TypedRegistry';

/**
 * Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 * @extends TypedRegistry
 */
```

<br>

## CLASS: ContextInterceptor
**File Path:** `ContextEngine/src/interceptors/ContextInterceptor.js`
**Constructor Usage:** `const instance = new ContextInterceptor();`
**Description:** Abstract base class for context interceptors.

/

import { get } from '@CoreUtilsLib';
import { CollectionProjectionError } from '../internal/errors/CollectionProjectionError';

/**
Abstract base class for context middleware/interceptor patterns.
Enables transparent transformation, enrichment, or substitution of provider results before UDC integration.
@class
@abstract

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/ContextInterceptor.js
 * @description Abstract base class for context interceptors.
 * @version 1.0.0
 */

import { get } from '@CoreUtilsLib';
import { CollectionProjectionError } from '../internal/errors/CollectionProjectionError';

/**
 * Abstract base class for context middleware/interceptor patterns.
 * Enables transparent transformation, enrichment, or substitution of provider results before UDC integration.
 * @class
 * @abstract
 */
```

### Methods of ContextInterceptor

#### METHOD: ContextInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.if(typeof logger.debug !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: ContextInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.if(!name || typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.if(context);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.if(options !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.if(!shouldIntercept);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextInterceptor.catch
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ContextInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.if(error instanceof CollectionProjectionError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.if(outcome);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ContextInterceptor.switch
- **Scope:** instance
- **LLM Call Syntax:** `contextInterceptor.switch(outcome.action);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
<br>

## CLASS: or
**File Path:** `ContextEngine/src/interceptors/ContextInterceptor.js`
**Constructor Usage:** `const instance = new or();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: CollectionProjectionInterceptor
**File Path:** `ContextEngine/src/interceptors/CollectionProjectionInterceptor.js`
**Constructor Usage:** `const instance = new CollectionProjectionInterceptor();`
**Description:** Applies a CollectionProjector to configured collection paths after selected providers.

### Raw JSDoc Context:
```javascript
/** Applies a CollectionProjector to configured collection paths after selected providers. */
```

### Methods of CollectionProjectionInterceptor

#### METHOD: CollectionProjectionInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjectionInterceptor.if(!projector || typeof projector.project !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjectionInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjectionInterceptor.if(config.optionFlag !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CollectionProjectionInterceptor.if
- **Scope:** instance
- **LLM Call Syntax:** `collectionProjectionInterceptor.if(this._logger && typeof this._logger.debug);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

