# API Reference: PipelineFramework

## Pipeline observability contracts

```ts
type LogDetailScalar = string | number | boolean | null | undefined;
type LogDetails =
  | string
  | LogDetailScalar[]
  | Record<string, LogDetailScalar | LogDetailScalar[]>;

type PipelineStepDetails = {
  content?: LogDetails;
  durationMs?: number;
  reason?: string;
};
```

Successful step execution may expose content-first details through
`Step._getLogDetails(context)` and `StepExecutionResult.logDetails`. The pipeline
passes those details to the logger as `PipelineStepDetails.content`, alongside
timing or failure/skip reasons when applicable.

## CLASS: for
**File Path:** `PipelineFramework/index.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: LoadDataStep
**File Path:** `PipelineFramework/index.js`
**Constructor Usage:** `const instance = new LoadDataStep();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: Step
**File Path:** `PipelineFramework/src/Step.js`
**Constructor Usage:** `const instance = new Step();`
**Description:** Abstract base class for pipeline steps.

/

import { ContextValidationError } from './internal/errors/ContextValidationError';
import { StepExecutionError } from './internal/errors/StepExecutionError';

/**
Abstract foundation for all pipeline steps.
Manages context validation, conditional execution, error handling, and performance tracking.

@class Step
@abstract
@typedef {Object} StepOptions
@property {string[]} [requiredKeys=[]] - Mandatory context keys for pre-execution validation.
@property {boolean} [continueOnError=false] - Whether to proceed with the pipeline if this step fails.
@property {Function} [shouldExecuteCondition=null] - Predicate function (context => boolean) for conditional logic.

@typedef {Object} StepExecutionResult
@property {boolean} success - True if step completed or continueOnError was active.
@property {boolean} skipped - True if shouldExecute() returned false.
@property {string} [skipReason] - Stable reason when skipped is true.
@property {number} durationMs - Total execution time in milliseconds.
@property {*} [logDetails] - Optional success details for pipeline observability.
@property {Error} [error] - Captured error if continueOnError is true.

@example
class DataFetchStep extends Step {
  _executeLogic(context) {
    const data = fetch(context.get('id'));
    this.setResult(context, 'result', data);
  }
}

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/Step.js
 * @description Abstract base class for pipeline steps.
 * @version 1.0.0
 */

import { ContextValidationError } from './internal/errors/ContextValidationError';
import { StepExecutionError } from './internal/errors/StepExecutionError';

/**
 * Abstract foundation for all pipeline steps.
 * Manages context validation, conditional execution, error handling, and performance tracking.
 *
 * @class Step
 * @abstract
 * @typedef {Object} StepOptions
 * @property {string[]} [requiredKeys=[]] - Mandatory context keys for pre-execution validation.
 * @property {boolean} [continueOnError=false] - Whether to proceed with the pipeline if this step fails.
 * @property {Function} [shouldExecuteCondition=null] - Predicate function (context => boolean) for conditional logic.
 *
 * @typedef {Object} StepExecutionResult
 * @property {boolean} success - True if step completed or continueOnError was active.
 * @property {boolean} skipped - True if shouldExecute() returned false.
 * @property {string} [skipReason] - Stable reason when skipped is true.
 * @property {number} durationMs - Total execution time in milliseconds.
 * @property {*} [logDetails] - Optional success details for pipeline observability.
 * @property {Error} [error] - Captured error if continueOnError is true.
 *
 * @example
 * class DataFetchStep extends Step {
 *   _executeLogic(context) {
 *     const data = fetch(context.get('id'));
 *     this.setResult(context, 'result', data);
 *   }
 * }
 */
```

<br>

## CLASS: ProducerStep
**File Path:** `PipelineFramework/src/ProducerStep.js`
**Constructor Usage:** `const instance = new ProducerStep();`
**Description:** Producer Step - Evaluates business logic and writes scalar results to context

/

import { Step } from './Step';

/**
Abstract base class for the "Decision" phase of the Producer-Consumer pattern.
Evaluates business logic/rules using GasExpressionEngineLib and writes scalar results to PipelineContext.

@class ProducerStep
@extends Step
@abstract
@typedef {Object} ProducerOptions
@property {string} outputKey - Required context key for writing the scalar result.
@property {string[]} [requiredKeys=[]] - Mandatory context keys for pre-execution validation.
@property {boolean} [continueOnError=false] - Whether to proceed if rule evaluation fails.
@property {Function} [shouldExecuteCondition=null] - Predicate function for conditional execution.

@example
class GradeSelectorStep extends ProducerStep {
  evaluateRules(context) {
    const { grade } = context.getData();
    return grade >= 6 ? 'PASS' : 'FAIL';
  }
}

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/ProducerStep.js
 * @description Producer Step - Evaluates business logic and writes scalar results to context
 * @version 1.0.0
 */

import { Step } from './Step';

/**
 * Abstract base class for the "Decision" phase of the Producer-Consumer pattern.
 * Evaluates business logic/rules using GasExpressionEngineLib and writes scalar results to PipelineContext.
 *
 * @class ProducerStep
 * @extends Step
 * @abstract
 * @typedef {Object} ProducerOptions
 * @property {string} outputKey - Required context key for writing the scalar result.
 * @property {string[]} [requiredKeys=[]] - Mandatory context keys for pre-execution validation.
 * @property {boolean} [continueOnError=false] - Whether to proceed if rule evaluation fails.
 * @property {Function} [shouldExecuteCondition=null] - Predicate function for conditional execution.
 *
 * @example
 * class GradeSelectorStep extends ProducerStep {
 *   evaluateRules(context) {
 *     const { grade } = context.getData();
 *     return grade >= 6 ? 'PASS' : 'FAIL';
 *   }
 * }
 */
```

<br>

## CLASS: PostProcessableStep
**File Path:** `PipelineFramework/src/PostProcessableStep.js`
**Constructor Usage:** `const instance = new PostProcessableStep();`
**Description:** Step subclass with integrated post-processor support.

/

import { Step } from './Step';
import { PostProcessorChain } from './postprocessor/PostProcessorChain';
import { PostProcessorContext } from './postprocessor/PostProcessorContext';
import { PostProcessorRegistry } from './postprocessor/PostProcessorRegistry';

/**
Step extension with automated post-processor lifecycle integration.

Enhances base Step logic with an optional PostProcessorChain. Automatically instantiates
and executes processors based on step outcome (success/failure) using injected services
(SheetDB, ExpressionEngine).

@class
@extends Step

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/PostProcessableStep.js
 * @description Step subclass with integrated post-processor support.
 * @version 1.0.0
 */

import { Step } from './Step';
import { PostProcessorChain } from './postprocessor/PostProcessorChain';
import { PostProcessorContext } from './postprocessor/PostProcessorContext';
import { PostProcessorRegistry } from './postprocessor/PostProcessorRegistry';

/**
 * Step extension with automated post-processor lifecycle integration.
 *
 * @description
 * Enhances base Step logic with an optional PostProcessorChain. Automatically instantiates
 * and executes processors based on step outcome (success/failure) using injected services
 * (SheetDB, ExpressionEngine).
 *
 * @class
 * @extends Step
 */
```

<br>

## CLASS: PipelineContext
**File Path:** `PipelineFramework/src/PipelineContext.js`
**Constructor Usage:** `const instance = new PipelineContext();`
**Description:** Wrapper for shared context state with metadata tracking.

/

/**
Shared state container and telemetry tracker for pipeline executions.

Wraps a mutable data payload and maintains execution metadata, including step history,
timing, flags, and graceful termination signals.

@class

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/PipelineContext.js
 * @description Wrapper for shared context state with metadata tracking.
 * @version 1.0.0
 */

/**
 * Shared state container and telemetry tracker for pipeline executions.
 *
 * @description
 * Wraps a mutable data payload and maintains execution metadata, including step history,
 * timing, flags, and graceful termination signals.
 *
 * @class
 */
```

### Methods of PipelineContext

#### METHOD: PipelineContext.getData
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.getData();`
- **Pure JSDoc:**
```javascript
/** @returns {Object} Raw underlying data reference. */
```
---
#### METHOD: PipelineContext.if
- **Scope:** instance
- **LLM Call Syntax:** `pipelineContext.if(typeof key !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PipelineContext.set
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.set(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * persists a value in context.
   * @param {string} key Target key.
   * @param {*} value Data to store.
   * @returns {PipelineContext} Current instance for chaining.
   * @throws {Error} If key is not a string.
   */
```
---
#### METHOD: PipelineContext.if
- **Scope:** instance
- **LLM Call Syntax:** `pipelineContext.if(typeof key !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PipelineContext.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.has(key);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies key existence.
   * @param {string} key Target key.
   * @returns {boolean}
   * @throws {Error} If key is not a string.
   */
```
---
#### METHOD: PipelineContext.if
- **Scope:** instance
- **LLM Call Syntax:** `pipelineContext.if(typeof key !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PipelineContext.requestStop
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.requestStop(reason);`
- **Pure JSDoc:**
```javascript
/**
   * Triggers graceful pipeline termination.
   * @param {string} [reason=''] Diagnostic explanation for the stop.
   * @returns {PipelineContext} Current instance.
   */
```
---
#### METHOD: PipelineContext.shouldStop
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.shouldStop();`
- **Pure JSDoc:**
```javascript
/** @returns {boolean} True if requestStop() was invoked. */
```
---
#### METHOD: PipelineContext.getStopReason
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.getStopReason();`
- **Pure JSDoc:**
```javascript
/** @returns {string|null} */
```
---
#### METHOD: PipelineContext.recordStepExecution
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.recordStepExecution(stepName, status, durationMs, details);`
- **Pure JSDoc:**
```javascript
/**
   * Records step telemetry.
   * @private
   * @param {string} stepName Source step.
   * @param {string} status (completed|skipped|failed).
   * @param {number} durationMs Execution time.
   * @param {Object} [details={}] Supplemental metadata.
   * @returns {PipelineContext} Current instance.
   */
```
---
#### METHOD: PipelineContext.getExecutionHistory
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.getExecutionHistory();`
- **Pure JSDoc:**
```javascript
/** @returns {Array<Object>} Chronological step execution logs. */
```
---
#### METHOD: PipelineContext.setFlag
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.setFlag(name, value);`
- **Pure JSDoc:**
```javascript
/**
   * Persists a metadata flag.
   * @param {string} name Flag identifier.
   * @param {*} value
   * @returns {PipelineContext} Current instance.
   * @throws {Error} If name is not a string.
   */
```
---
#### METHOD: PipelineContext.if
- **Scope:** instance
- **LLM Call Syntax:** `pipelineContext.if(typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PipelineContext.getFlag
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.getFlag(name, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a metadata flag.
   * @param {string} name Flag identifier.
   * @param {*} [defaultValue=null]
   * @returns {*}
   * @throws {Error} If name is not a string.
   */
```
---
#### METHOD: PipelineContext.if
- **Scope:** instance
- **LLM Call Syntax:** `pipelineContext.if(typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PipelineContext.getMetadata
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.getMetadata();`
- **Pure JSDoc:**
```javascript
/** @returns {Object} Raw metadata snapshot (startTime, stopRequested, etc.). */
```
---
#### METHOD: PipelineContext.markCompleted
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.markCompleted();`
- **Pure JSDoc:**
```javascript
/**
   * Finalizes execution timer.
   * @private
   * @returns {PipelineContext} Current instance.
   */
```
---
#### METHOD: PipelineContext.getTotalDuration
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.getTotalDuration();`
- **Pure JSDoc:**
```javascript
/** @returns {number} Wall-clock duration in milliseconds. */
```
---
#### METHOD: PipelineContext.if
- **Scope:** instance
- **LLM Call Syntax:** `pipelineContext.if(this._metadata.endTime);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PipelineContext.getSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.getSummary();`
- **Pure JSDoc:**
```javascript
/**
   * Aggregates execution statistics and history.
   * @returns {{startTime: number, endTime: number, totalDuration: number, totalSteps: number, completedSteps: number, skippedSteps: number, failedSteps: number, stopRequested: boolean, stopReason: string|null, history: Array}}
   */
```
---
<br>

## CLASS: Pipeline
**File Path:** `PipelineFramework/src/Pipeline.js`
**Constructor Usage:** `const instance = new Pipeline();`
**Description:** Main pipeline orchestrator for sequential step execution.

/

import { PipelineContext } from './PipelineContext';

/**
Orchestrator for sequential step execution with shared context and lifecycle hooks.

@class

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/Pipeline.js
 * @description Main pipeline orchestrator for sequential step execution.
 * @version 1.0.0
 */

import { PipelineContext } from './PipelineContext';

/**
 * Orchestrator for sequential step execution with shared context and lifecycle hooks.
 *
 * @class
 */
```

<br>

## CLASS: ConsumerStep
**File Path:** `PipelineFramework/src/ConsumerStep.js`
**Constructor Usage:** `const instance = new ConsumerStep();`
**Description:** Consumer Step - Reads context values and performs technical operations

/

import { Step } from './Step';

/**
Abstract base for "Action" steps in the Producer-Consumer pipeline pattern.

Decouples business logic from technical execution. Reads a specific inputKey set by
a ProducerStep and executes infrastructure operations (API calls, I/O) without
knowledge of decision rules.

@class
@extends Step
@abstract

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/ConsumerStep.js
 * @description Consumer Step - Reads context values and performs technical operations
 * @version 1.0.0
 */

import { Step } from './Step';

/**
 * Abstract base for "Action" steps in the Producer-Consumer pipeline pattern.
 *
 * @description
 * Decouples business logic from technical execution. Reads a specific inputKey set by
 * a ProducerStep and executes infrastructure operations (API calls, I/O) without
 * knowledge of decision rules.
 *
 * @class
 * @extends Step
 * @abstract
 */
```

<br>

## CLASS: StepMock
**File Path:** `PipelineFramework/src/testing/mocks.js`
**Constructor Usage:** `const instance = new StepMock();`
**Description:** Centralized high-fidelity mocks for PipelineFramework services.

/

/**
@class StepMock
Jest-based high-fidelity mock for Pipeline Step implementation.

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for PipelineFramework services.
 * @version 1.0.0
 */

/**
 * @class StepMock
 * @description Jest-based high-fidelity mock for Pipeline Step implementation.
 */
```

### Methods of StepMock

#### METHOD: StepMock.setupExecution
- **Scope:** instance
- **LLM Call Syntax:** `const result = stepMock.setupExecution(success, data, error);`
- **Pure JSDoc:**
```javascript
/**
   * @function setupExecution
   * @description Configures the 'execute' jest.fn return value.
   * @param {boolean} success - Target success status.
   * @param {*} [data={}] - Result data payload.
   * @param {Error} [error] - Error object (if success is false).
   * @returns {StepMock} Fluent interface.
   */
```
---
<br>

## CLASS: PipelineContextMock
**File Path:** `PipelineFramework/src/testing/mocks.js`
**Constructor Usage:** `const instance = new PipelineContextMock();`
**Description:** @constructor
@param {string} [name='TestStep'] - Step name.
/
  constructor(name = 'TestStep') {
    this.name = name;
    this.getName = jest.fn(() => this.name);
    this.getDescription = jest.fn(() => `Description for ${this.name}`);
    this.execute = jest.fn((context) => ({ success: true, data: {} }));
    this.shouldExecute = jest.fn(() => true);
    this.beforeStep = jest.fn();
    this.afterStep = jest.fn();
    this.onError = jest.fn();
  }

  /**
@function setupExecution
Configures the 'execute' jest.fn return value.
@param {boolean} success - Target success status.
@param {*} [data={}] - Result data payload.
@param {Error} [error] - Error object (if success is false).
@returns {StepMock} Fluent interface.
/
  setupExecution(success, data = {}, error = null) {
    this.execute.mockReturnValue({ success, data, error });
    return this;
  }
}

/**
@class PipelineContextMock
Jest-based high-fidelity mock for PipelineContext.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} [name='TestStep'] - Step name.
   */
  constructor(name = 'TestStep') {
    this.name = name;
    this.getName = jest.fn(() => this.name);
    this.getDescription = jest.fn(() => `Description for ${this.name}`);
    this.execute = jest.fn((context) => ({ success: true, data: {} }));
    this.shouldExecute = jest.fn(() => true);
    this.beforeStep = jest.fn();
    this.afterStep = jest.fn();
    this.onError = jest.fn();
  }

  /**
   * @function setupExecution
   * @description Configures the 'execute' jest.fn return value.
   * @param {boolean} success - Target success status.
   * @param {*} [data={}] - Result data payload.
   * @param {Error} [error] - Error object (if success is false).
   * @returns {StepMock} Fluent interface.
   */
  setupExecution(success, data = {}, error = null) {
    this.execute.mockReturnValue({ success, data, error });
    return this;
  }
}

/**
 * @class PipelineContextMock
 * @description Jest-based high-fidelity mock for PipelineContext.
 */
```

<br>

## CLASS: ValueSource
**File Path:** `PipelineFramework/src/postprocessor/ValueSource.js`
**Constructor Usage:** `const instance = new ValueSource();`
**Description:** Value source types and utilities for post-processor configurations.

/

/**
@enum {string}
@readonly
Supported value resolution strategies for post-processor updates.
/
export const ValueSourceType = Object.freeze({
  /** Static value literal. */
  LITERAL: 'LITERAL',
  /** Pipeline context path (e.g., 'pipeline.userId'). */
  CONTEXT: 'CONTEXT',
  /** Step execution output key. */
  STEP_OUTPUT: 'STEP_OUTPUT',
  /** JSEP expression string. */
  EXPRESSION: 'EXPRESSION',
  /** Current system timestamp. */
  TIMESTAMP: 'TIMESTAMP'
});

/**
@function isValidValueSourceType
Validates if a string is a recognized ValueSourceType.
@param {string} value - String to validate.
@returns {boolean} True if value exists in ValueSourceType.
/
export function isValidValueSourceType(value) {
  return Object.values(ValueSourceType).includes(value);
}

/**
@class ValueSource
Configuration for post-processor value resolution.
@property {string} type - Strategy from ValueSourceType.
@property {*} [literal] - Static value (for LITERAL).
@property {string} [contextPath] - Pipeline path (for CONTEXT).
@property {string} [outputKey] - Result key (for STEP_OUTPUT).
@property {string} [expression] - Evaluate expression (for EXPRESSION).
@property {string|null} [format] - Date format (for TIMESTAMP).

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/ValueSource.js
 * @description Value source types and utilities for post-processor configurations.
 * @version 1.0.0
 */

/**
 * @enum {string}
 * @readonly
 * @description Supported value resolution strategies for post-processor updates.
 */
export const ValueSourceType = Object.freeze({
  /** Static value literal. */
  LITERAL: 'LITERAL',
  /** Pipeline context path (e.g., 'pipeline.userId'). */
  CONTEXT: 'CONTEXT',
  /** Step execution output key. */
  STEP_OUTPUT: 'STEP_OUTPUT',
  /** JSEP expression string. */
  EXPRESSION: 'EXPRESSION',
  /** Current system timestamp. */
  TIMESTAMP: 'TIMESTAMP'
});

/**
 * @function isValidValueSourceType
 * @description Validates if a string is a recognized ValueSourceType.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in ValueSourceType.
 */
export function isValidValueSourceType(value) {
  return Object.values(ValueSourceType).includes(value);
}

/**
 * @class ValueSource
 * @description Configuration for post-processor value resolution.
 * @property {string} type - Strategy from ValueSourceType.
 * @property {*} [literal] - Static value (for LITERAL).
 * @property {string} [contextPath] - Pipeline path (for CONTEXT).
 * @property {string} [outputKey] - Result key (for STEP_OUTPUT).
 * @property {string} [expression] - Evaluate expression (for EXPRESSION).
 * @property {string|null} [format] - Date format (for TIMESTAMP).
 */
```

<br>

## CLASS: ValueResolver
**File Path:** `PipelineFramework/src/postprocessor/ValueResolver.js`
**Constructor Usage:** `const instance = new ValueResolver();`
**Description:** Resolves values from various sources for post-processor updates.

/

import { ValueSource, ValueSourceType } from './ValueSource';
import { ValueResolutionError } from '../internal/postprocessor-errors/PostProcessorError';

/**
Unified resolver for extracting data from disparate sources (Literals, Context, Outputs, Expressions).
Used by post-processors to map dynamic data into side-effect operations.

@class ValueResolver

@example
const val = resolver.resolve(ValueSource.context('user.id'), context);

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/ValueResolver.js
 * @description Resolves values from various sources for post-processor updates.
 * @version 1.0.0
 */

import { ValueSource, ValueSourceType } from './ValueSource';
import { ValueResolutionError } from '../internal/postprocessor-errors/PostProcessorError';

/**
 * Unified resolver for extracting data from disparate sources (Literals, Context, Outputs, Expressions).
 * Used by post-processors to map dynamic data into side-effect operations.
 *
 * @class ValueResolver
 *
 * @example
 * const val = resolver.resolve(ValueSource.context('user.id'), context);
 */
```

<br>

## CLASS: PostProcessorResult
**File Path:** `PipelineFramework/src/postprocessor/PostProcessorResult.js`
**Constructor Usage:** `const instance = new PostProcessorResult();`
**Description:** Result object returned by post-processor execution.

/

import { Result } from '@CoreUtilsLib';

/**
Detailed record of a single state modification performed by a post-processor.

@typedef {Object} ChangeRecord
@property {string} type - Identifier for the change category (e.g., 'CELL_UPDATE', 'LOG_INSERT').
@property {string} target - Identifier of the resource modified (e.g., 'SheetName!A1').
@property {*} [oldValue] - State prior to modification.
@property {*} newValue - State after modification.
/

/**
Standardized outcome container for post-processor execution.
Encapsulates success status, execution telemetry, and a chronological audit of state changes.

@class PostProcessorResult
@extends Result

@example
return PostProcessorResult.success('p1').addChange('UPDATE', 'cell', 'val');

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/PostProcessorResult.js
 * @description Result object returned by post-processor execution.
 * @version 1.0.0
 */

import { Result } from '@CoreUtilsLib';

/**
 * Detailed record of a single state modification performed by a post-processor.
 *
 * @typedef {Object} ChangeRecord
 * @property {string} type - Identifier for the change category (e.g., 'CELL_UPDATE', 'LOG_INSERT').
 * @property {string} target - Identifier of the resource modified (e.g., 'SheetName!A1').
 * @property {*} [oldValue] - State prior to modification.
 * @property {*} newValue - State after modification.
 */

/**
 * Standardized outcome container for post-processor execution.
 * Encapsulates success status, execution telemetry, and a chronological audit of state changes.
 *
 * @class PostProcessorResult
 * @extends Result
 *
 * @example
 * return PostProcessorResult.success('p1').addChange('UPDATE', 'cell', 'val');
 */
```

<br>

## CLASS: PostProcessorRegistry
**File Path:** `PipelineFramework/src/postprocessor/PostProcessorRegistry.js`
**Constructor Usage:** `const instance = new PostProcessorRegistry();`
**Description:** Registry for post-processor types.

/

import { ProcessorNotFoundError } from '../internal/postprocessor-errors/PostProcessorError';
import { Registry } from '@CoreUtilsLib';

/**
Central registry and factory for post-processor types.
Manages mapping between processor type identifiers and their concrete implementation classes.

@class PostProcessorRegistry

@example
registry.register('Audit', AuditProcessor);
const instance = registry.create({ processorType: 'Audit', instanceId: 'a1' }, services);

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/PostProcessorRegistry.js
 * @description Registry for post-processor types.
 * @version 1.0.0
 */

import { ProcessorNotFoundError } from '../internal/postprocessor-errors/PostProcessorError';
import { Registry } from '@CoreUtilsLib';

/**
 * Central registry and factory for post-processor types.
 * Manages mapping between processor type identifiers and their concrete implementation classes.
 *
 * @class PostProcessorRegistry
 *
 * @example
 * registry.register('Audit', AuditProcessor);
 * const instance = registry.create({ processorType: 'Audit', instanceId: 'a1' }, services);
 */
```

<br>

## CLASS: constructor
**File Path:** `PipelineFramework/src/postprocessor/PostProcessorRegistry.js`
**Constructor Usage:** `const instance = new constructor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: PostProcessorContext
**File Path:** `PipelineFramework/src/postprocessor/PostProcessorContext.js`
**Constructor Usage:** `const instance = new PostProcessorContext();`
**Description:** Context object passed to post-processors during execution.

/

/**
Read-only container for step execution data passed to post-processors.
Provides access to step results, pipeline state, and performance metrics.

@class PostProcessorContext

@example
const userId = context.getPipelineData('userId');
if (context.wasSuccessful()) { ... }

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/PostProcessorContext.js
 * @description Context object passed to post-processors during execution.
 * @version 1.0.0
 */

/**
 * Read-only container for step execution data passed to post-processors.
 * Provides access to step results, pipeline state, and performance metrics.
 *
 * @class PostProcessorContext
 *
 * @example
 * const userId = context.getPipelineData('userId');
 * if (context.wasSuccessful()) { ... }
 */
```

<br>

## CLASS: PostProcessorChain
**File Path:** `PipelineFramework/src/postprocessor/PostProcessorChain.js`
**Constructor Usage:** `const instance = new PostProcessorChain();`
**Description:** Orchestrates execution of post-processor chains.
Facade class that delegates execution logic to internal ChainExecutor.

/

import { PostProcessorContext } from './PostProcessorContext';
import { PostProcessorResult } from './PostProcessorResult';
import { WhenCondition, isValidWhenCondition } from './WhenCondition';
import { ChainExecutor } from '../internal/postprocessor-chain/ChainExecutor';

/**
Result of executing a chain of post-processors.

@typedef {Object} ChainResult
@property {boolean} success - True if all processors succeeded or continueOnError was respected.
@property {PostProcessorResult[]} results - Individual processor results.
@property {number} totalDuration - Total execution duration in milliseconds.
@property {number} executed - Number of processors executed.
@property {number} skipped - Number of processors skipped.
@property {number} failed - Number of processors that failed.
@property {boolean} chainStopped - True if chain was stopped due to error.
/

/**
Orchestrates sequential execution of post-processors after step completion.
Manages "when" conditions, error handling strategies, and execution statistics.

@class PostProcessorChain

@example
const chain = new PostProcessorChain({ logger });
chain.add(processor, { when: 'ON_SUCCESS' });
const result = chain.execute(context);

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/PostProcessorChain.js
 * @description Orchestrates execution of post-processor chains.
 * Facade class that delegates execution logic to internal ChainExecutor.
 * @version 1.1.0 - Refactored with Facade/Delegation pattern
 */

import { PostProcessorContext } from './PostProcessorContext';
import { PostProcessorResult } from './PostProcessorResult';
import { WhenCondition, isValidWhenCondition } from './WhenCondition';
import { ChainExecutor } from '../internal/postprocessor-chain/ChainExecutor';

/**
 * Result of executing a chain of post-processors.
 *
 * @typedef {Object} ChainResult
 * @property {boolean} success - True if all processors succeeded or continueOnError was respected.
 * @property {PostProcessorResult[]} results - Individual processor results.
 * @property {number} totalDuration - Total execution duration in milliseconds.
 * @property {number} executed - Number of processors executed.
 * @property {number} skipped - Number of processors skipped.
 * @property {number} failed - Number of processors that failed.
 * @property {boolean} chainStopped - True if chain was stopped due to error.
 */

/**
 * Orchestrates sequential execution of post-processors after step completion.
 * Manages "when" conditions, error handling strategies, and execution statistics.
 *
 * @class PostProcessorChain
 *
 * @example
 * const chain = new PostProcessorChain({ logger });
 * chain.add(processor, { when: 'ON_SUCCESS' });
 * const result = chain.execute(context);
 */
```

<br>

## CLASS: PostProcessor
**File Path:** `PipelineFramework/src/postprocessor/PostProcessor.js`
**Constructor Usage:** `const instance = new PostProcessor();`
**Description:** Abstract base class for post-processors.

/

import { PostProcessorResult } from './PostProcessorResult';

/**
Abstract foundation for all pipeline post-processors.
Post-processors execute after step completion to perform side effects (logging, audits, notifications).

@class PostProcessor
@abstract

@example
class AuditLogger extends PostProcessor {
  _executeImpl(context) {
    const data = context.getStepResult();
    return PostProcessorResult.success(this.id).addChange('LOG', 'audit', data);
  }
}

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/PostProcessor.js
 * @description Abstract base class for post-processors.
 * @version 1.0.0
 */

import { PostProcessorResult } from './PostProcessorResult';

/**
 * Abstract foundation for all pipeline post-processors.
 * Post-processors execute after step completion to perform side effects (logging, audits, notifications).
 *
 * @class PostProcessor
 * @abstract
 *
 * @example
 * class AuditLogger extends PostProcessor {
 *   _executeImpl(context) {
 *     const data = context.getStepResult();
 *     return PostProcessorResult.success(this.id).addChange('LOG', 'audit', data);
 *   }
 * }
 */
```

<br>

## CLASS: LogAuditPostProcessor
**File Path:** `PipelineFramework/src/postprocessor/builtin/LogAuditPostProcessor.js`
**Constructor Usage:** `const instance = new LogAuditPostProcessor();`
**Description:** Post-processor for inserting audit log records.

/

import { PostProcessor } from '../PostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ValueResolver } from '../ValueResolver';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
@class LogAuditPostProcessor
@extends PostProcessor
Inserts audit trail records (who/what/when) into a database table post-step.

@example
{
  table: 'AUDIT_LOG',
  fields: [
    { column: 'timestamp', value: { type: 'TIMESTAMP' } },
    { column: 'action', value: { type: 'LITERAL', literal: 'DOC_GEN' } },
    { column: 'userId', value: { type: 'CONTEXT', contextPath: 'pipeline.user.id' } }
  ]
}

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/builtin/LogAuditPostProcessor.js
 * @description Post-processor for inserting audit log records.
 * @version 1.0.0
 */

import { PostProcessor } from '../PostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ValueResolver } from '../ValueResolver';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @class LogAuditPostProcessor
 * @extends PostProcessor
 * @description Inserts audit trail records (who/what/when) into a database table post-step.
 *
 * @example
 * {
 *   table: 'AUDIT_LOG',
 *   fields: [
 *     { column: 'timestamp', value: { type: 'TIMESTAMP' } },
 *     { column: 'action', value: { type: 'LITERAL', literal: 'DOC_GEN' } },
 *     { column: 'userId', value: { type: 'CONTEXT', contextPath: 'pipeline.user.id' } }
 *   ]
 * }
 */
```

<br>

## CLASS: FieldUpdatePostProcessor
**File Path:** `PipelineFramework/src/postprocessor/builtin/FieldUpdatePostProcessor.js`
**Constructor Usage:** `const instance = new FieldUpdatePostProcessor();`
**Description:** Simplified post-processor for updating fields with shorthand syntax.

/

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ValueSource } from '../ValueSource';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
@class FieldUpdatePostProcessor
@extends BaseUpdatePostProcessor
Simplified update processor using string shorthands for common value sources.

@example
{
  table: 'DOCS',
  recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.id' },
  fields: {
    status: 'DONE',
    at: '$timestamp',
    url: '$step.output.url',
    user: '$context.email'
  }
}

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/builtin/FieldUpdatePostProcessor.js
 * @description Simplified post-processor for updating fields with shorthand syntax.
 * @version 1.0.0
 */

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ValueSource } from '../ValueSource';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @class FieldUpdatePostProcessor
 * @extends BaseUpdatePostProcessor
 * @description Simplified update processor using string shorthands for common value sources.
 *
 * @example
 * {
 *   table: 'DOCS',
 *   recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.id' },
 *   fields: {
 *     status: 'DONE',
 *     at: '$timestamp',
 *     url: '$step.output.url',
 *     user: '$context.email'
 *   }
 * }
 */
```

<br>

## CLASS: CounterUpdatePostProcessor
**File Path:** `PipelineFramework/src/postprocessor/builtin/CounterUpdatePostProcessor.js`
**Constructor Usage:** `const instance = new CounterUpdatePostProcessor();`
**Description:** Post-processor for incrementing/decrementing counter fields.

/

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
@enum {string}
@readonly
Atomic mathematical operations for counter fields.
/
export const CounterOperation = Object.freeze({
  /** Increment by specified amount. */
  INCREMENT: 'INCREMENT',
  /** Decrement by specified amount. */
  DECREMENT: 'DECREMENT',
  /** Explicitly set to specified value. */
  SET: 'SET'
});

/**
@class CounterUpdatePostProcessor
@extends BaseUpdatePostProcessor
Post-processor for atomic-like increments/decrements (e.g., retry counts, attempts).

@example
{
  table: 'DOCUMENTS',
  recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.docId' },
  counter: { column: 'processCount', operation: 'INCREMENT', amount: 1 }
}

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/builtin/CounterUpdatePostProcessor.js
 * @description Post-processor for incrementing/decrementing counter fields.
 * @version 1.0.0
 */

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @enum {string}
 * @readonly
 * @description Atomic mathematical operations for counter fields.
 */
export const CounterOperation = Object.freeze({
  /** Increment by specified amount. */
  INCREMENT: 'INCREMENT',
  /** Decrement by specified amount. */
  DECREMENT: 'DECREMENT',
  /** Explicitly set to specified value. */
  SET: 'SET'
});

/**
 * @class CounterUpdatePostProcessor
 * @extends BaseUpdatePostProcessor
 * @description Post-processor for atomic-like increments/decrements (e.g., retry counts, attempts).
 *
 * @example
 * {
 *   table: 'DOCUMENTS',
 *   recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.docId' },
 *   counter: { column: 'processCount', operation: 'INCREMENT', amount: 1 }
 * }
 */
```

<br>

## CLASS: CellUpdatePostProcessor
**File Path:** `PipelineFramework/src/postprocessor/builtin/CellUpdatePostProcessor.js`
**Constructor Usage:** `const instance = new CellUpdatePostProcessor();`
**Description:** Post-processor for updating database cells after step execution.

/

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
@class CellUpdatePostProcessor
@extends BaseUpdatePostProcessor
Updates specific database cells (status, timestamps, refs) post-step execution.

@example
{
  table: 'DOCUMENTS',
  recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.docId' },
  updates: [
    { column: 'status', value: { type: 'LITERAL', literal: 'GENERATED' } },
    { column: 'url', value: { type: 'STEP_OUTPUT', outputKey: 'docUrl' } },
    { column: 'date', value: { type: 'TIMESTAMP' } }
  ]
}

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/builtin/CellUpdatePostProcessor.js
 * @description Post-processor for updating database cells after step execution.
 * @version 1.0.0
 */

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @class CellUpdatePostProcessor
 * @extends BaseUpdatePostProcessor
 * @description Updates specific database cells (status, timestamps, refs) post-step execution.
 *
 * @example
 * {
 *   table: 'DOCUMENTS',
 *   recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.docId' },
 *   updates: [
 *     { column: 'status', value: { type: 'LITERAL', literal: 'GENERATED' } },
 *     { column: 'url', value: { type: 'STEP_OUTPUT', outputKey: 'docUrl' } },
 *     { column: 'date', value: { type: 'TIMESTAMP' } }
 *   ]
 * }
 */
```

<br>

## CLASS: BaseUpdatePostProcessor
**File Path:** `PipelineFramework/src/postprocessor/builtin/BaseUpdatePostProcessor.js`
**Constructor Usage:** `const instance = new BaseUpdatePostProcessor();`
**Description:** Base class for database update post-processors.

/

import { PostProcessor } from '../PostProcessor';
import { ValueResolver } from '../ValueResolver';
import {
  ConfigurationError,
  RecordNotFoundError
} from '../../internal/postprocessor-errors/PostProcessorError';

/**
@enum {string}
@readonly
Strategies for identifying database records for updates.
/
export const RecordIdentifierStrategy = Object.freeze({
  /** Identify by unique primary key. */
  PRIMARY_KEY: 'PRIMARY_KEY',
  /** Identify by filtering table columns. */
  FILTER: 'FILTER',
  /** Identify by existing object in context. */
  CONTEXT_REF: 'CONTEXT_REF'
});

/**
@class BaseUpdatePostProcessor
@extends PostProcessor
@abstract
Base orchestrator for post-processors performing database updates.

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/builtin/BaseUpdatePostProcessor.js
 * @description Base class for database update post-processors.
 * @version 1.0.0
 */

import { PostProcessor } from '../PostProcessor';
import { ValueResolver } from '../ValueResolver';
import {
  ConfigurationError,
  RecordNotFoundError
} from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @enum {string}
 * @readonly
 * @description Strategies for identifying database records for updates.
 */
export const RecordIdentifierStrategy = Object.freeze({
  /** Identify by unique primary key. */
  PRIMARY_KEY: 'PRIMARY_KEY',
  /** Identify by filtering table columns. */
  FILTER: 'FILTER',
  /** Identify by existing object in context. */
  CONTEXT_REF: 'CONTEXT_REF'
});

/**
 * @class BaseUpdatePostProcessor
 * @extends PostProcessor
 * @abstract
 * @description Base orchestrator for post-processors performing database updates.
 */
```

<br>

## CLASS: override
**File Path:** `PipelineFramework/src/postprocessor/builtin/BaseUpdatePostProcessor.js`
**Constructor Usage:** `const instance = new override();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: PostProcessorError
**File Path:** `PipelineFramework/src/internal/postprocessor-errors/PostProcessorError.js`
**Constructor Usage:** `const instance = new PostProcessorError();`
**Description:** Error classes for post-processor operations.

/

import { BaseError } from '@CoreUtilsLib';

/**
@class PostProcessorError
@extends BaseError
Base exception for all post-processor operations.

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/errors/PostProcessorError.js
 * @description Error classes for post-processor operations.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * @class PostProcessorError
 * @extends BaseError
 * @description Base exception for all post-processor operations.
 */
```

<br>

## CLASS: ConfigurationError
**File Path:** `PipelineFramework/src/internal/postprocessor-errors/PostProcessorError.js`
**Constructor Usage:** `const instance = new ConfigurationError();`
**Description:** @constructor
@param {string} message - Error details.
@param {Object} [context={}] - Metadata (processorId, processorType).
@param {Error} [cause] - Root cause exception.
/
  constructor(message, context = {}, cause = null) {
    super(message, 'POST_PROCESSOR_ERROR', context, cause);
    this.name = 'PostProcessorError';
  }
}

/**
@class ConfigurationError
@extends PostProcessorError
Thrown when processor configuration fails validation.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} message - Error details.
   * @param {Object} [context={}] - Metadata (processorId, processorType).
   * @param {Error} [cause] - Root cause exception.
   */
  constructor(message, context = {}, cause = null) {
    super(message, 'POST_PROCESSOR_ERROR', context, cause);
    this.name = 'PostProcessorError';
  }
}

/**
 * @class ConfigurationError
 * @extends PostProcessorError
 * @description Thrown when processor configuration fails validation.
 */
```

<br>

## CLASS: ExecutionError
**File Path:** `PipelineFramework/src/internal/postprocessor-errors/PostProcessorError.js`
**Constructor Usage:** `const instance = new ExecutionError();`
**Description:** @constructor
@param {string} message - Validation failure message.
@param {Object} [context={}] - Details (field, expected, actual).
@param {Error} [cause] - Original error.
/
  constructor(message, context = {}, cause = null) {
    super(message, context, cause);
    this.name = 'ConfigurationError';
    this.code = 'PP_CONFIGURATION_ERROR';
  }
}

/**
@class ExecutionError
@extends PostProcessorError
Thrown when runtime execution of a post-processor fails.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} message - Validation failure message.
   * @param {Object} [context={}] - Details (field, expected, actual).
   * @param {Error} [cause] - Original error.
   */
  constructor(message, context = {}, cause = null) {
    super(message, context, cause);
    this.name = 'ConfigurationError';
    this.code = 'PP_CONFIGURATION_ERROR';
  }
}

/**
 * @class ExecutionError
 * @extends PostProcessorError
 * @description Thrown when runtime execution of a post-processor fails.
 */
```

<br>

## CLASS: RecordNotFoundError
**File Path:** `PipelineFramework/src/internal/postprocessor-errors/PostProcessorError.js`
**Constructor Usage:** `const instance = new RecordNotFoundError();`
**Description:** @constructor
@param {string} message - Runtime failure details.
@param {Object} [context={}] - Context (operation, table, column).
@param {Error} [cause] - Wrapped exception.
/
  constructor(message, context = {}, cause = null) {
    super(message, context, cause);
    this.name = 'ExecutionError';
    this.code = 'PP_EXECUTION_ERROR';
  }
}

/**
@class RecordNotFoundError
@extends PostProcessorError
Thrown when the target database record cannot be identified.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} message - Runtime failure details.
   * @param {Object} [context={}] - Context (operation, table, column).
   * @param {Error} [cause] - Wrapped exception.
   */
  constructor(message, context = {}, cause = null) {
    super(message, context, cause);
    this.name = 'ExecutionError';
    this.code = 'PP_EXECUTION_ERROR';
  }
}

/**
 * @class RecordNotFoundError
 * @extends PostProcessorError
 * @description Thrown when the target database record cannot be identified.
 */
```

<br>

## CLASS: ValueResolutionError
**File Path:** `PipelineFramework/src/internal/postprocessor-errors/PostProcessorError.js`
**Constructor Usage:** `const instance = new ValueResolutionError();`
**Description:** @constructor
@param {string} table - Target table name.
@param {Object} identifier - Strategy-specific record identifier.
@param {Object} [context={}] - Additional metadata.
/
  constructor(table, identifier, context = {}) {
    super(`Record not found in table '${table}'`, {
      ...context,
      table,
      identifier
    });
    this.name = 'RecordNotFoundError';
    this.code = 'PP_RECORD_NOT_FOUND';
    this.table = table;
    this.identifier = identifier;
  }
}

/**
@class ValueResolutionError
@extends PostProcessorError
Thrown when a ValueSource (context/step/expr) fails to resolve.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} table - Target table name.
   * @param {Object} identifier - Strategy-specific record identifier.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(table, identifier, context = {}) {
    super(`Record not found in table '${table}'`, {
      ...context,
      table,
      identifier
    });
    this.name = 'RecordNotFoundError';
    this.code = 'PP_RECORD_NOT_FOUND';
    this.table = table;
    this.identifier = identifier;
  }
}

/**
 * @class ValueResolutionError
 * @extends PostProcessorError
 * @description Thrown when a ValueSource (context/step/expr) fails to resolve.
 */
```

<br>

## CLASS: ProcessorNotFoundError
**File Path:** `PipelineFramework/src/internal/postprocessor-errors/PostProcessorError.js`
**Constructor Usage:** `const instance = new ProcessorNotFoundError();`
**Description:** @constructor
@param {string} sourceType - ValueSourceType string.
@param {string} source - Path, key, or expression string.
@param {Object} [context={}] - Resolution context details.
@param {Error} [cause] - Underlying evaluation error.
/
  constructor(sourceType, source, context = {}, cause = null) {
    super(
      `Failed to resolve value from ${sourceType}: '${source}'`,
      {
        ...context,
        sourceType,
        source
      },
      cause
    );
    this.name = 'ValueResolutionError';
    this.code = 'PP_VALUE_RESOLUTION_ERROR';
    this.sourceType = sourceType;
    this.source = source;
  }
}

/**
@class ProcessorNotFoundError
@extends PostProcessorError
Thrown when an unregistered processor type is requested.

### Raw JSDoc Context:
```javascript
/**
   * @constructor
   * @param {string} sourceType - ValueSourceType string.
   * @param {string} source - Path, key, or expression string.
   * @param {Object} [context={}] - Resolution context details.
   * @param {Error} [cause] - Underlying evaluation error.
   */
  constructor(sourceType, source, context = {}, cause = null) {
    super(
      `Failed to resolve value from ${sourceType}: '${source}'`,
      {
        ...context,
        sourceType,
        source
      },
      cause
    );
    this.name = 'ValueResolutionError';
    this.code = 'PP_VALUE_RESOLUTION_ERROR';
    this.sourceType = sourceType;
    this.source = source;
  }
}

/**
 * @class ProcessorNotFoundError
 * @extends PostProcessorError
 * @description Thrown when an unregistered processor type is requested.
 */
```

<br>

## CLASS: ChainExecutor
**File Path:** `PipelineFramework/src/internal/postprocessor-chain/ChainExecutor.js`
**Constructor Usage:** `const instance = new ChainExecutor();`
**Description:** Handles sequential execution of post-processor chains,
including when-condition evaluation and error handling.

/

import { PostProcessorResult } from '../../postprocessor/PostProcessorResult';
import { WhenCondition } from '../../postprocessor/WhenCondition';

/**
@class ChainExecutor
Internal engine for sequential, synchronous execution of PostProcessorChain entries.

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/postprocessor/internal/ChainExecutor.js
 * @description Handles sequential execution of post-processor chains,
 * including when-condition evaluation and error handling.
 * @version 1.0.0
 */

import { PostProcessorResult } from '../../postprocessor/PostProcessorResult';
import { WhenCondition } from '../../postprocessor/WhenCondition';

/**
 * @class ChainExecutor
 * @description Internal engine for sequential, synchronous execution of PostProcessorChain entries.
 */
```

<br>

## CLASS: StepExecutionError
**File Path:** `PipelineFramework/src/internal/errors/StepExecutionError.js`
**Constructor Usage:** `const instance = new StepExecutionError();`
**Description:** Error thrown when a step execution fails.

/

import { PipelineError } from './PipelineError';

/**
Error signaling a failure within a step's execution logic.

@class StepExecutionError
@extends PipelineError

@example
throw new StepExecutionError('StepName', originalError, contextData);

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/errors/StepExecutionError.js
 * @description Error thrown when a step execution fails.
 * @version 1.0.0
 */

import { PipelineError } from './PipelineError';

/**
 * Error signaling a failure within a step's execution logic.
 *
 * @class StepExecutionError
 * @extends PipelineError
 *
 * @example
 * throw new StepExecutionError('StepName', originalError, contextData);
 */
```

<br>

## CLASS: PipelineError
**File Path:** `PipelineFramework/src/internal/errors/PipelineError.js`
**Constructor Usage:** `const instance = new PipelineError();`
**Description:** Base error class for pipeline-related errors.

/

import { BaseError } from '@CoreUtilsLib';

/**
Base class for all errors in the PipelineFramework.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

@class PipelineError
@extends BaseError

@example
throw new PipelineError('Failure message', { step: 'StepName' });

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/errors/PipelineError.js
 * @description Base error class for pipeline-related errors.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * Base class for all errors in the PipelineFramework.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 *
 * @class PipelineError
 * @extends BaseError
 *
 * @example
 * throw new PipelineError('Failure message', { step: 'StepName' });
 */
```

<br>

## CLASS: ContextValidationError
**File Path:** `PipelineFramework/src/internal/errors/ContextValidationError.js`
**Constructor Usage:** `const instance = new ContextValidationError();`
**Description:** Error thrown when context validation fails.

/

import { PipelineError } from './PipelineError';

/**
Error signaling a failure in context key validation before step execution.

@class ContextValidationError
@extends PipelineError

@example
throw new ContextValidationError('StepName', ['requiredKey'], contextData);

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/errors/ContextValidationError.js
 * @description Error thrown when context validation fails.
 * @version 1.0.0
 */

import { PipelineError } from './PipelineError';

/**
 * Error signaling a failure in context key validation before step execution.
 *
 * @class ContextValidationError
 * @extends PipelineError
 *
 * @example
 * throw new ContextValidationError('StepName', ['requiredKey'], contextData);
 */
```

<br>

## CLASS: TemplateSelectorStep
**File Path:** `PipelineFramework/src/examples/TemplateSelectorStep.js`
**Constructor Usage:** `const instance = new TemplateSelectorStep();`
**Description:** Example ProducerStep implementation - Selects template based on business rules

/

import { ProducerStep } from '../ProducerStep';

/**
Example ProducerStep implementation for template selection via business rules.
Demonstrates the Producer pattern by evaluating logical expressions to decide
which template ID should be used in subsequent pipeline steps.

@class TemplateSelectorStep
@extends ProducerStep

@example
const step = new TemplateSelectorStep(logger, expressionEngine, {
  outputKey: 'selected_template_id',
  rules: [ { condition: '{{grade}} >= 6', value: 'PASS' } ]
});

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/examples/TemplateSelectorStep.js
 * @description Example ProducerStep implementation - Selects template based on business rules
 * @version 1.0.0
 */

import { ProducerStep } from '../ProducerStep';

/**
 * Example ProducerStep implementation for template selection via business rules.
 * Demonstrates the Producer pattern by evaluating logical expressions to decide
 * which template ID should be used in subsequent pipeline steps.
 *
 * @class TemplateSelectorStep
 * @extends ProducerStep
 *
 * @example
 * const step = new TemplateSelectorStep(logger, expressionEngine, {
 *   outputKey: 'selected_template_id',
 *   rules: [ { condition: '{{grade}} >= 6', value: 'PASS' } ]
 * });
 */
```

<br>

## CLASS: GenerateDocumentStep
**File Path:** `PipelineFramework/src/examples/GenerateDocumentStep.js`
**Constructor Usage:** `const instance = new GenerateDocumentStep();`
**Description:** Example ConsumerStep implementation - Generates document from template ID

/

import { ConsumerStep } from '../ConsumerStep';

/**
Example ConsumerStep implementation that generates documents from templates.
Demonstrates the Consumer pattern by reading a decision (template ID) from context
and performing the technical operation (document creation) via DriveService.

@class GenerateDocumentStep
@extends ConsumerStep

@example
const step = new GenerateDocumentStep(logger, driveService, {
  inputKey: 'selected_template_id',
  outputKey: 'generated_document',
  templateMapping: { 'PASS': 'file_id_1' }
});

### Raw JSDoc Context:
```javascript
/**
 * @file PipelineFramework/src/examples/GenerateDocumentStep.js
 * @description Example ConsumerStep implementation - Generates document from template ID
 * @version 1.0.0
 */

import { ConsumerStep } from '../ConsumerStep';

/**
 * Example ConsumerStep implementation that generates documents from templates.
 * Demonstrates the Consumer pattern by reading a decision (template ID) from context
 * and performing the technical operation (document creation) via DriveService.
 *
 * @class GenerateDocumentStep
 * @extends ConsumerStep
 *
 * @example
 * const step = new GenerateDocumentStep(logger, driveService, {
 *   inputKey: 'selected_template_id',
 *   outputKey: 'generated_document',
 *   templateMapping: { 'PASS': 'file_id_1' }
 * });
 */
```

<br>
