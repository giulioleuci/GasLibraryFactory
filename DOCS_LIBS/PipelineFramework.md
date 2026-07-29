# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [PipelineFramework](#pipelineframework)

---

## PipelineFramework

**Version:** 1.0.0   **Layer:** Application Orchestration (Layer 3)   **Dependencies:** CoreUtilsLib, GasResilienceLib (Optional)

### ConsumerStep

Consumer Step - Reads context values and performs technical operations

**Initialization:**
```javascript
new ConsumerStep()
```

**Methods:**

- `performAction(inputValue: *, context: PipelineContext): string`
  > / this._inputKey = options.inputKey; /** / this._outputKey = options.outputKey || null; } /** get inputKey() { return this._inputKey; } /** get outputKey() { return this._outputKey; } /** Template method for implementing technical operations.


### Pipeline

Main pipeline orchestrator for sequential step execution.

**Initialization:**
```javascript
new Pipeline()
```

**Methods:**

- `getName(): string`

- `getSteps(): Object`
  > get logger() { return this._logger; } /**

- `addStep(step: Step): Pipeline`
  > appends a step to the active sequence.

- `beforeStep(callback: Function): Pipeline`
  > Registers a pre-step callback.

- `afterStep(callback: Function): Pipeline`
  > Registers a post-step callback.

- `onError(callback: Function): Pipeline`
  > Registers a step-level failure listener.

- `onComplete(callback: Function): Pipeline`
  > Registers a pipeline completion listener.

- `execute(initialData={}: Object): PipelineContext`
  > Sequentially executes all steps.

- `clearSteps(): Pipeline`

- `getConfigSummary(): Object`


### PipelineContext

Wrapper for shared context state with metadata tracking.

**Initialization:**
```javascript
new PipelineContext(initialData={}: Object)
```

**Methods:**

- `getData(): Object`

- `set(key: string, value: *): PipelineContext`
  > persists a value in context.

- `has(key: string): boolean`
  > Verifies key existence.

- `requestStop(reason='': string): PipelineContext`
  > Triggers graceful pipeline termination.

- `shouldStop(): boolean`

- `getStopReason(): string|null`

- `recordStepExecution(stepName: string, status: string, durationMs: number, details={}: Object): PipelineContext`
  > Records step telemetry.

- `getExecutionHistory(): Array<Object>`

- `setFlag(name: string, value: *): PipelineContext`
  > Persists a metadata flag.

- `getFlag(name: string, defaultValue=null: *): *`
  > Retrieves a metadata flag.

- `getMetadata(): Object`

- `markCompleted(): PipelineContext`
  > Finalizes execution timer.

- `getTotalDuration(): number`

- `getSummary(): {startTime: number, endTime: number, totalDuration: number, totalSteps: number, completedSteps: number, skippedSteps: number, failedSteps: number, stopRequested: boolean, stopReason: string|null, history: Array`
  > Aggregates execution statistics and history.


### PostProcessableStep

Step subclass with integrated post-processor support.

**Initialization:**
```javascript
new PostProcessableStep()
```

**Methods:**

- `getPostProcessors(): Array<{processorType: string, instanceId: string, when: string, config: Object`
  > Template method for declaring post-execution automation.

- `getLastPostProcessorResults(): Object|null`

- `execute(context: PipelineContext): Object`
  > Overrides base execution to include post-processor lifecycle.


### ProducerStep

Producer Step - Evaluates business logic and writes scalar results to context

**Initialization:**
```javascript
new ProducerStep()
```

**Methods:**

- `evaluateRules(context: PipelineContext): ExpressionEngineService`
  > Expression engine for evaluating rules.


### Step

Abstract base class for pipeline steps.

**Initialization:**
```javascript
new Step()
```

**Methods:**

- `getName(): string`
  > Step name.

- `shouldExecute(context: PipelineContext): LoggerService`
  > / get logger() { return this._logger; } /** Evaluates if the step should execute based on current context. Prioritizes 'shouldExecuteCondition' from options if present.

- `verifyContext(context: PipelineContext, requiredKeys: string[]): void`
  > Asserts presence of required keys in the context.

- `setResult(context: PipelineContext, key: string, value: *): Step`
  > Writes a value to the pipeline context.

- `getContextValue(context: PipelineContext, key: string, defaultValue=null: *): *`
  > Retrieves a value from the context with an optional fallback.

- `execute(context: PipelineContext): StepExecutionResult`
  > Orchestrates the step lifecycle: condition check, validation, logic execution, and error handling.


### GenerateDocumentStep

Example ConsumerStep implementation - Generates document from template ID

**Initialization:**
```javascript
new GenerateDocumentStep()
```

**Methods:**

- `performAction(templateId: string, context: PipelineContext): Object`
  > Drive service for creating documents.


### TemplateSelectorStep

Example ProducerStep implementation - Selects template based on business rules

**Initialization:**
```javascript
new TemplateSelectorStep()
```

**Methods:**

- `evaluateRules(context: PipelineContext): string`
  > Business rules for template selection. Each rule has a condition (expression) and a value (template ID).


### ContextValidationError

Error thrown when context validation fails.

**Initialization:**
```javascript
new ContextValidationError()
```


### PipelineError

Base error class for pipeline-related errors.

**Initialization:**
```javascript
new PipelineError()
```

**Methods:**

- `toString(): string`


### StepExecutionError

Error thrown when a step execution fails.

**Initialization:**
```javascript
new StepExecutionError()
```


### ChainExecutor

Handles sequential execution of post-processor chains,
including when-condition evaluation and error handling.

**Initialization:**
```javascript
new ChainExecutor()
```

**Methods:**

- `shouldExecute(config: Object, context: PostProcessorContext): Object`
  > / get _logger() { return this._facade._logger; } /** / get _expressionEngine() { return this._facade._expressionEngine; } /**

- `evaluateCustomCondition(condition: string, context: PostProcessorContext): boolean`

- `executeChain(context: PostProcessorContext): Object`


### PostProcessorError

Error classes for post-processor operations.

**Initialization:**
```javascript
new PostProcessorError()
```


### ConfigurationError

@constructor
@param {string} message - Error details.
@param {Object} [context={}] - Metadata (processorId, processorType).
@param {Error} [cause] - Root cause exception.
/
  constructor(message, context = {}, cause = null) {
    super(message, 'POST_PROCESSOR_ERROR', context, cause);
    this.name = 'PostProcessorError';
  }
}

**Initialization:**
```javascript
new ConfigurationError()
```


### ExecutionError

@constructor
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

**Initialization:**
```javascript
new ExecutionError()
```


### RecordNotFoundError

@constructor
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

**Initialization:**
```javascript
new RecordNotFoundError()
```


### ValueResolutionError

@constructor
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

**Initialization:**
```javascript
new ValueResolutionError()
```


### ProcessorNotFoundError

@constructor
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

**Initialization:**
```javascript
new ProcessorNotFoundError()
```


### PostProcessor

Abstract base class for post-processors.

**Initialization:**
```javascript
new PostProcessor()
```

**Methods:**

- `getId(): string`
  > Unique identifier for this processor instance.

- `getName(): string`

- `getConfig(): Object`

- `shouldRun(context: PostProcessorContext): boolean`
  > Evaluates if the processor should execute based on current context.

- `execute(context: PostProcessorContext): PostProcessorResult`
  > Orchestrates the post-processor lifecycle: validation, condition check, and execution.

- `getConfigSummary(): Object`


### PostProcessorChain

Orchestrates execution of post-processor chains.
Facade class that delegates execution logic to internal ChainExecutor.

**Initialization:**
```javascript
new PostProcessorChain()
```

**Static Methods:**

- `createContext(step: Step, stepResult: StepExecutionResult, pipelineContext: PipelineContext, metadata={}: Object): PostProcessorContext`
  > Factory method for creating PostProcessorContext from step data.

**Methods:**

- `add(processor: PostProcessor, config={}: Object, config.when='ALWAYS': string, config.customCondition: string, config.continueOnError=true: boolean): PostProcessorChain`
  > Logger service.

- `remove(processorId: string): boolean`
  > Removes a processor by its unique identifier.

- `isEmpty(): number`
  > Gets the number of processors in the chain.

- `clear(): PostProcessorChain`
  > Removes all processors from the chain.

- `execute(context: PostProcessorContext): ChainResult`
  > Triggers sequential execution of all processors in the chain.

- `getSummary(): Object[]`


### PostProcessorContext

Context object passed to post-processors during execution.

**Initialization:**
```javascript
new PostProcessorContext(options: Object, options.step: Step, options.stepResult: StepExecutionResult, options.pipelineContext: PipelineContext, options.metadata={}: Object)
```

**Methods:**

- `getStepOutput(key: string, defaultValue=null: *): *`
  > The step that was just executed.

- `getPipelineData(path: string, defaultValue=null: *): *`
  > Retrieves data from the pipeline context using dot notation (e.g., 'user.profile.id').

- `wasSuccessful(): boolean`

- `wasSkipped(): boolean`

- `getError(): Error|null`

- `getStepName(): string`

- `getDurationMs(): number`

- `getMetadata(key: string, defaultValue=null: *): *`

- `toExpressionContext(): Object`
  > Flattens context into a unified object for rule/expression evaluation.


### PostProcessorRegistry

Registry for post-processor types.

**Initialization:**
```javascript
new PostProcessorRegistry()
```

**Methods:**

- `register(type: string, constructor: Function): PostProcessorRegistry`
  > Map of processor type to constructor.

- `unregister(type: string): boolean`
  > Removes a processor type from the registry.

- `has(type: string): boolean`

- `create(config: Object, config.processorType: string, config.instanceId: string, config.config={}: Object, services={}: Object): PostProcessor`
  > Instantiates a post-processor from configuration data and injected services.

- `createAll(configs: Object[], services={}: Object): PostProcessor[]`
  > Batch-instantiates multiple post-processors from an array of configurations.

- `getRegisteredTypes(): string[]`

- `clear(): number`
  > Gets the count of registered processor types.


### PostProcessorResult

Result object returned by post-processor execution.

**Initialization:**
```javascript
new PostProcessorResult()
```

**Static Methods:**

- `success(processorId: string, changes=[: ChangeRecord[], duration=0: number, metadata={}: Object): PostProcessorResult`
  > Whether execution succeeded.

- `failure(processorId: string, error: Error, duration=0: number, metadata={}: Object): PostProcessorResult`
  > Factory for error outcomes.

- `skipped(processorId: string, reason='Condition not met': string): PostProcessorResult`
  > Factory for bypassed executions.

**Methods:**

- `wasSkipped(): boolean`

- `addChange(type: string, target: string, newValue: *, oldValue: *): PostProcessorResult`
  > Appends a modification record to the results audit trail.

- `getSummary(): Object`

- `toObject(): Object`


### ValueResolver

Resolves values from various sources for post-processor updates.

**Initialization:**
```javascript
new ValueResolver()
```

**Methods:**

- `resolve(source: ValueSource|Object, context: PostProcessorContext): *`
  > Logger service.

- `resolveAll(sources: Object.<string, ValueSource|Object>, context: PostProcessorContext): Object.<string, *>`
  > Resolves an object map of ValueSources into an object map of concrete values.


### ValueSource

Value source types and utilities for post-processor configurations.

**Initialization:**
```javascript
new ValueSource()
```

**Static Methods:**

- `literal(value: *): ValueSource`
  > this.type = type; /** this.literal = config.literal; /** this.contextPath = config.contextPath; /** this.outputKey = config.outputKey; /** this.expression = config.expression; /** this.format = config.format || null; } /**

- `context(path: string): ValueSource`

- `stepOutput(key: string): ValueSource`

- `expression(expr: string): ValueSource`

- `timestamp(format=null: string|null): ValueSource`

- `fromConfig(config: Object, config.type: string): ValueSource`

**Methods:**

- `toObject(): Object`


### BaseUpdatePostProcessor

Base class for database update post-processors.

**Initialization:**
```javascript
new BaseUpdatePostProcessor()
```


### CellUpdatePostProcessor

Post-processor for updating database cells after step execution.

**Initialization:**
```javascript
new CellUpdatePostProcessor()
```


### CounterUpdatePostProcessor

Post-processor for incrementing/decrementing counter fields.

**Initialization:**
```javascript
new CounterUpdatePostProcessor()
```


### FieldUpdatePostProcessor

Simplified post-processor for updating fields with shorthand syntax.

**Initialization:**
```javascript
new FieldUpdatePostProcessor()
```


### LogAuditPostProcessor

Post-processor for inserting audit log records.

**Initialization:**
```javascript
new LogAuditPostProcessor()
```


### StepMock

Centralized high-fidelity mocks for PipelineFramework services.

**Initialization:**
```javascript
new StepMock(name='TestStep': string)
```

**Methods:**

- `setupExecution(success: boolean, data={}: *, error: Error): StepMock`


### PipelineContextMock

@constructor
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

**Initialization:**
```javascript
new PipelineContextMock(success: boolean, data={}: *, error: Error)
```


---

