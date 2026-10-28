# API Reference: PipelineFramework

## CLASS: Step
**File Path:** `PipelineFramework/src/Step.ts`
**Constructor Usage:** `const instance = new Step();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of Step

#### METHOD: Step.getName
- **Scope:** instance
- **LLM Call Syntax:** `const result = step.getName();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {string} Unique step identifier.
   */
```
---
#### PROPERTY: Step.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = step.logger;`
- **Pure JSDoc:**
```javascript
/**
   * @returns {LoggerService} Active logging instance.
   */
```
---
#### METHOD: Step.shouldExecute
- **Scope:** instance
- **LLM Call Syntax:** `const result = step.shouldExecute(context);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates if the step should execute based on current context.
   * Prioritizes 'shouldExecuteCondition' from options if present.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {boolean} True if step execution should proceed.
   */
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
#### METHOD: Step._executeLogic
- **Scope:** instance
- **LLM Call Syntax:** `const result = step._executeLogic(context);`
- **Pure JSDoc:**
```javascript
/**
   * Core business logic implementation. Must be implemented by subclasses.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {void}
   * @throws {Error} If not implemented by subclass.
   * @protected
   * @abstract
   */
```
---
#### METHOD: Step._getLogDetails
- **Scope:** instance
- **LLM Call Syntax:** `const result = step._getLogDetails(_context);`
- **Pure JSDoc:**
```javascript
/**
   * Returns optional success details for pipeline observability.
   * @param {PipelineContext} _context - Completed execution context.
   * @returns {*|null} Scalar, short scalar array, or null when no detail is available.
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
<br>

## CLASS: PipelineContext
**File Path:** `PipelineFramework/src/PipelineContext.ts`
**Constructor Usage:** `const instance = new PipelineContext();`
**Description:** Shared state container and telemetry tracker for pipeline executions.

### Raw JSDoc Context:
```javascript
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

### Methods and properties of PipelineContext

#### METHOD: PipelineContext.getData
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.getData();`
- **Pure JSDoc:**
```javascript
/** @returns {Object} Raw underlying data reference. */
```
---
#### METHOD: PipelineContext.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipelineContext.get(key, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a value from context.
   * @param {string} key Target key.
   * @param {*} [defaultValue=null] Value returned if key is missing.
   * @returns {*}
   * @throws {Error} If key is not a string.
   */
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
**File Path:** `PipelineFramework/src/Pipeline.ts`
**Constructor Usage:** `const instance = new Pipeline();`
**Description:** Orchestrator for sequential step execution with shared context and lifecycle hooks.

### Raw JSDoc Context:
```javascript
/**
 * Orchestrator for sequential step execution with shared context and lifecycle hooks.
 *
 * @class
 */
```

### Methods and properties of Pipeline

#### METHOD: Pipeline._normalizeLogPosition
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._normalizeLogPosition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Pipeline._stepLogPosition
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._stepLogPosition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Pipeline._summaryLogPosition
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._summaryLogPosition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Pipeline._executionLogPosition
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._executionLogPosition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Pipeline._logPipelineStart
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._logPipelineStart();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Pipeline._logPipelineStep
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._logPipelineStep();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Pipeline._fallbackDetailText
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._fallbackDetailText();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: Pipeline._logPipelineSummary
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._logPipelineSummary();`
- **Pure JSDoc:**
```javascript
/** No comment available */
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
#### PROPERTY: Pipeline.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.logger;`
- **Pure JSDoc:**
```javascript
/** @returns {Object} Logger instance. */
```
---
#### METHOD: Pipeline.getSteps
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline.getSteps();`
- **Pure JSDoc:**
```javascript
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
#### METHOD: Pipeline._invokeHooks
- **Scope:** instance
- **LLM Call Syntax:** `pipeline._invokeHooks();`
- **Pure JSDoc:**
```javascript
/**
   * Safely invoke a list of hook callbacks, swallowing and logging errors.
   * @private
   */
```
---
#### METHOD: Pipeline._executeStep
- **Scope:** instance
- **LLM Call Syntax:** `const result = pipeline._executeStep(step, context);`
- **Pure JSDoc:**
```javascript
/**
   * Internal step execution wrapper with hook and retry orchestration.
   * @private
   * @param {Step} step
   * @param {PipelineContext} context
   * @returns {{success: boolean, skipped: boolean, durationMs: number, error?: Error}}
   */
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
**File Path:** `PipelineFramework/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new StepMock();`
**Description:** Jest-based high-fidelity mock for Pipeline Step implementation.

### Raw JSDoc Context:
```javascript
/**
 * @class StepMock
 * @description Jest-based high-fidelity mock for Pipeline Step implementation.
 */
```

### Methods and properties of StepMock

#### METHOD: StepMock.setupExecution
- **Scope:** instance
- **LLM Call Syntax:** `stepMock.setupExecution();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: PipelineContextMock
**File Path:** `PipelineFramework/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new PipelineContextMock();`
**Description:** Jest-based high-fidelity mock for PipelineContext.

### Raw JSDoc Context:
```javascript
/**
 * @class PipelineContextMock
 * @description Jest-based high-fidelity mock for PipelineContext.
 */
```

<br>

## CLASS: StepExecutionError
**File Path:** `PipelineFramework/src/internal/errors/StepExecutionError.ts`
**Constructor Usage:** `const instance = new StepExecutionError();`
**Description:** Error signaling a failure within a step's execution logic.

### Raw JSDoc Context:
```javascript
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
**File Path:** `PipelineFramework/src/internal/errors/PipelineError.ts`
**Constructor Usage:** `const instance = new PipelineError(message, context, context.pipelineName, context.currentStep, context.stepIndex, context.originalError);`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/**
   * @param {string} message - Descriptive error text.
   * @param {Object} [context={}] - Diagnostic metadata.
   * @param {string} [context.pipelineName] - Identifier of the active pipeline.
   * @param {string} [context.currentStep] - Identifier of the failed step.
   * @param {number} [context.stepIndex] - 0-based index of the failed step.
   * @param {Error} [context.originalError] - Root cause exception.
   */
```

<br>

## CLASS: ContextValidationError
**File Path:** `PipelineFramework/src/internal/errors/ContextValidationError.ts`
**Constructor Usage:** `const instance = new ContextValidationError();`
**Description:** Error signaling a failure in context key validation before step execution.

### Raw JSDoc Context:
```javascript
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

## GLOBAL FUNCTIONS

### FUNCTION: setupExecution
- **Source:** `PipelineFramework/src/testing/mocks.ts`
- **LLM Call Syntax:** `const result = setupExecution(success, data, error);`
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
