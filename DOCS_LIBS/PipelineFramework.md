# API Reference: PipelineFramework

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

### Methods of Step

#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(!name || typeof name !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(typeof logger.debug !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(options !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Step.getName
- **Scope:** instance
- **LLM Call Syntax:** `const result = step.getName();`
- **Pure JSDoc:**
```javascript
/**
     * Step name.
     * @protected
     * @type {string}
     */
    this._name = name;

    /**
     * Logger service.
     * @protected
     * @type {LoggerService}
     */
    this._logger = logger;

    /**
     * Required context keys for validation.
     * @protected
     * @type {string[]}
     */
    this._requiredKeys = options.requiredKeys || [];

    /**
     * Whether to continue pipeline on error.
     * @protected
     * @type {boolean}
     */
    this._continueOnError = options.continueOnError || false;

    /**
     * Custom condition function for conditional execution.
     * @protected
     * @type {Function|null}
     */
    this._shouldExecuteCondition = options.shouldExecuteCondition || null;
  }

  /**
   * @returns {string} Unique step identifier.
   */
```
---
#### METHOD: Step.shouldExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = step.shouldExecute(context);`
- **Pure JSDoc:**
```javascript
/**
   * @returns {LoggerService} Active logging instance.
   */
  get logger() {
    return this._logger;
  }

  /**
   * Evaluates if the step should execute based on current context.
   * Prioritizes 'shouldExecuteCondition' from options if present.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {boolean} True if step execution should proceed.
   */
```
---
#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(this._shouldExecuteCondition && typeof this._shouldExecuteCondition);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Step.verifyContext
- **Scope:** instance
- **LLM Call Syntax:** `step.verifyContext(context, requiredKeys);`
- **Pure JSDoc:**
```javascript
/**
   * Asserts presence of required keys in the context.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @param {string[]} [requiredKeys] - Keys to validate (overrides instance defaults).
   * @throws {ContextValidationError} If any required keys are missing from context.
   * @protected
   */
```
---
#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(!keys || keys.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(missingKeys.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Step.setResult
- **Scope:** instance
- **LLM Call Syntax:** `const result = step.setResult(context, key, value);`
- **Pure JSDoc:**
```javascript
/**
   * Writes a value to the pipeline context.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @param {string} key - Target context key.
   * @param {*} value - Data to persist.
   * @returns {Step} Current instance for chaining.
   * @throws {Error} If key is not a string.
   * @protected
   */
```
---
#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(typeof key !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Step.getContextValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = step.getContextValue(context, key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a value from the context with an optional fallback.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @param {string} key - Context key to read.
   * @param {*} [defaultValue=null] - Fallback if key is absent.
   * @returns {*} Context value or defaultValue.
   * @protected
   */
```
---
#### METHOD: Step.execute
- **Scope:** instance
- **LLM Call Syntax:** `const result = step.execute(context);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates the step lifecycle: condition check, validation, logic execution, and error handling.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {StepExecutionResult} Performance data and execution status.
   * @throws {StepExecutionError} If logic fails and continueOnError is false.
   */
```
---
#### METHOD: Step.catch
- **Scope:** instance
- **LLM Call Syntax:** `step.catch(detailError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: Step.catch
- **Scope:** instance
- **LLM Call Syntax:** `step.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: Step.if
- **Scope:** instance
- **LLM Call Syntax:** `step.if(this._continueOnError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: PipelineContext
**File Path:** `PipelineFramework/src/PipelineContext.js`
**Constructor Usage:** `const instance = new PipelineContext();`
**Description:** Wrapper for shared context state with metadata tracking.

/

/**
Shared state container and telemetry tracker for pipeline executions.

Wraps a mutable data payload and maintains execution metadata, including step history,
timing, and graceful termination signals.

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
 * timing, and graceful termination signals.
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

### Methods of Pipeline

#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.for
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.for(const method of ['debug', 'info', 'warn', 'error']);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof logger[method] !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof this._logger.logPipelineStart);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof this._logger.logPipelineStep);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(status);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(status);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(details);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof details);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.catch
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.catch(_error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(prefix);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(summary.stopRequested);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof this._logger.logSummary);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.getName
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.getName();`
- **Pure JSDoc:**
```javascript
/** @returns {string} */
```
---
#### METHOD: Pipeline.getSteps
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.getSteps();`
- **Pure JSDoc:**
```javascript
/** @returns {Object} Logger instance. */
  get logger() {
    return this._logger;
  }

  /** @returns {Step[]} Active sequence. */
```
---
#### METHOD: Pipeline.addStep
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.addStep(step);`
- **Pure JSDoc:**
```javascript
/**
   * appends a step to the active sequence.
   * @param {Step} step Valid Step instance.
   * @returns {Pipeline} Current instance for chaining.
   */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(!step || typeof step !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof step.execute !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof step.getName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.beforeStep
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.beforeStep(callback);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a pre-step callback.
   * @param {Function} callback
   * @returns {Pipeline}
   */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof callback !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.afterStep
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.afterStep(callback);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a post-step callback.
   * @param {Function} callback
   * @returns {Pipeline}
   */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof callback !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.onError
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.onError(callback);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a step-level failure listener.
   * @param {Function} callback
   * @returns {Pipeline}
   */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof callback !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.onComplete
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.onComplete(callback);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a pipeline completion listener.
   * @param {Function} callback
   * @returns {Pipeline}
   */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof callback !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.for
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.for(const cb of hookList);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Pipeline.catch
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(this._exceptionService && typeof this._exceptionService.executeWithRetry);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.execute
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.execute(initialData);`
- **Pure JSDoc:**
```javascript
/**
   * Sequentially executes all steps.
   * @param {Object} [initialData={}]
   * @returns {PipelineContext}
   */
```
---
#### METHOD: Pipeline.for
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.for(let stepIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(typeof this._logger.logStep);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.catch
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(this._stopOnError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(status);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.if
- **Scope:** instance
- **LLM Call Syntax:** `pipeline.if(this._stopOnError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Pipeline.clearSteps
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.clearSteps();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {Pipeline}
   */
```
---
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

