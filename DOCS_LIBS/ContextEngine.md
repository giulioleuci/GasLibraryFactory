# API Reference: ContextEngine

## CLASS: for
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: for
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: name
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new name();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: UserDataProvider
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new UserDataProvider();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: CacheProvider
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new CacheProvider();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: StatefulProvider
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new StatefulProvider();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: UppercaseFieldsProcessor
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new UppercaseFieldsProcessor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of UppercaseFieldsProcessor

#### METHOD: UppercaseFieldsProcessor.process
- **Scope:** instance
- **LLM Call Syntax:** `uppercaseFieldsProcessor.process(data, config);`
- **Pure JSDoc:**
```javascript
/** Method process */
```
---
#### METHOD: UppercaseFieldsProcessor.forEach
- **Scope:** instance
- **LLM Call Syntax:** `uppercaseFieldsProcessor.forEach(field);`
- **Pure JSDoc:**
```javascript
/** Method forEach */
```
---
<br>

## CLASS: UnreliableApiProvider
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new UnreliableApiProvider();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: DataAssemblyStep
**File Path:** `ContextEngine/index.js`
**Constructor Usage:** `const instance = new DataAssemblyStep();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of DataAssemblyStep

#### METHOD: DataAssemblyStep.execute
- **Scope:** instance
- **LLM Call Syntax:** `dataAssemblyStep.execute(context);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: ProviderRegistry
**File Path:** `ContextEngine/src/ProviderRegistry.js`
**Constructor Usage:** `const instance = new ProviderRegistry();`
**Description:** Manages registration and retrieval of data providers.

/

import { TypeGuards, ValidationUtils } from '@CoreUtilsLib';
import { ProviderNotFoundError } from './internal/errors/ProviderNotFoundError';

/**
Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/ProviderRegistry.js
 * @description Manages registration and retrieval of data providers.
 * @version 1.0.0
 */

import { TypeGuards, ValidationUtils } from '@CoreUtilsLib';
import { ProviderNotFoundError } from './internal/errors/ProviderNotFoundError';

/**
 * Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
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
#### METHOD: ContextStepExecutor.assembleAsync
- **Scope:** instance
- **LLM Call Syntax:** `contextStepExecutor.assembleAsync(recipe, initialParams, options);`
- **Pure JSDoc:**
```javascript
/** Method assembleAsync */
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

/**
Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file ContextEngine/src/InterceptorRegistry.js
 * @description Manages registration and retrieval of context interceptors.
 * @version 1.0.0
 */

/**
 * Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 */
```

### Methods of InterceptorRegistry

#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(typeof logger.debug !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.registerSingleton
- **Scope:** instance
- **LLM Call Syntax:** `const result = interceptorRegistry.registerSingleton(type, instance);`
- **Pure JSDoc:**
```javascript
/**
     * Logger service.
     * @private
     * @type {Object}
     */
    this._logger = logger;

    /**
     * Internal map of singleton interceptor instances.
     * @private
     * @type {Map<string, Object>}
     */
    this._singletons = new Map();

    /**
     * Internal map of interceptor factory functions.
     * @private
     * @type {Map<string, Function>}
     */
    this._factories = new Map();
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
   * Registers a pre-instantiated stateless interceptor.
   * @param {string} type Unique interceptor type identifier.
   * @param {Object} instance Interceptor instance implementing the intercept() method.
   * @returns {InterceptorRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty, instance is null, or intercept() method is missing.
   */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(!type || typeof type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(!instance || typeof instance !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(typeof instance.intercept !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(!type || typeof type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(typeof factory !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(!type || typeof type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(!instance || typeof instance !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(typeof instance.intercept !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(instance && typeof instance.intercept);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(!type || typeof type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(!type || typeof type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: InterceptorRegistry.if
- **Scope:** instance
- **LLM Call Syntax:** `interceptorRegistry.if(hadSingleton || hadFactory);`
- **Pure JSDoc:**
```javascript
/** Method if */
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

