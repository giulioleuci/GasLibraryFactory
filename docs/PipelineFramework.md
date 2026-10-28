# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [PipelineFramework](#pipelineframework)

---

## PipelineFramework

**Version:** 1.0.0   **Layer:** Application Orchestration (Layer 3)   **Dependencies:** CoreUtilsLib, GasResilienceLib (Optional)

### Pipeline

**Source:** `PipelineFramework/src/Pipeline.ts`

Orchestrator for sequential step execution with shared context and lifecycle hooks.

**Initialization:**
```javascript
new Pipeline()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_normalizeLogPosition` | `_normalizeLogPosition(): void` |
| `_stepLogPosition` | `_stepLogPosition(): void` |
| `_summaryLogPosition` | `_summaryLogPosition(): void` |
| `_executionLogPosition` | `_executionLogPosition(): void` |
| `_logPipelineStart` | `_logPipelineStart(): void` |
| `_logPipelineStep` | `_logPipelineStep(): void` |
| `_fallbackDetailText` | `_fallbackDetailText(): void` |
| `_logPipelineSummary` | `_logPipelineSummary(): void` |
| `getName` | `getName(): string` |
| `logger` | `logger: Object` |
| `getSteps` | `getSteps(): Step[]` |
| `addStep` | `addStep(step: Step): Pipeline` |
| `beforeStep` | `beforeStep(callback: Function): Pipeline` |
| `afterStep` | `afterStep(callback: Function): Pipeline` |
| `onError` | `onError(callback: Function): Pipeline` |
| `onComplete` | `onComplete(callback: Function): Pipeline` |
| `_invokeHooks` | `_invokeHooks(): void` |
| `_executeStep` | `_executeStep(step: Step): {success: boolean, skipped: boolean, durationMs: number, error?: Error` |
| `execute` | `execute(initialData={}: Object): PipelineContext` |
| `clearSteps` | `clearSteps(): Pipeline` |


### PipelineContext

**Source:** `PipelineFramework/src/PipelineContext.ts`

Shared state container and telemetry tracker for pipeline executions.

**Initialization:**
```javascript
new PipelineContext()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getData` | `getData(): Object` |
| `get` | `get(key: string, defaultValue=null: *): *` |
| `set` | `set(key: string, value: *): PipelineContext` |
| `has` | `has(key: string): boolean` |
| `requestStop` | `requestStop(reason='': string): PipelineContext` |
| `shouldStop` | `shouldStop(): boolean` |
| `getStopReason` | `getStopReason(): string|null` |
| `recordStepExecution` | `recordStepExecution(stepName: string, status: string, durationMs: number, details={}: Object): PipelineContext` |
| `getExecutionHistory` | `getExecutionHistory(): Array<Object>` |
| `getMetadata` | `getMetadata(): Object` |
| `markCompleted` | `markCompleted(): PipelineContext` |
| `getTotalDuration` | `getTotalDuration(): number` |
| `getSummary` | `getSummary(): {startTime: number, endTime: number, totalDuration: number, totalSteps: number, completedSteps: number, skippedSteps: number, failedSteps: number, stopRequested: boolean, stopReason: string|null, history: Array` |


### Step

**Source:** `PipelineFramework/src/Step.ts`

**Initialization:**
```javascript
new Step()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): string` |
| `logger` | `logger: LoggerService` |
| `shouldExecute` | `shouldExecute(context: PipelineContext): boolean` |
| `verifyContext` | `verifyContext(context: PipelineContext, requiredKeys: string[]): void` |
| `setResult` | `setResult(context: PipelineContext, key: string, value: *): Step` |
| `getContextValue` | `getContextValue(context: PipelineContext, key: string, defaultValue=null: *): *` |
| `_executeLogic` | `_executeLogic(context: PipelineContext): void` |
| `_getLogDetails` | `_getLogDetails(_context: PipelineContext): *|null` |
| `execute` | `execute(context: PipelineContext): StepExecutionResult` |


### ContextValidationError

**Source:** `PipelineFramework/src/internal/errors/ContextValidationError.ts`

Error signaling a failure in context key validation before step execution.

**Initialization:**
```javascript
new ContextValidationError()
```


### PipelineError

**Source:** `PipelineFramework/src/internal/errors/PipelineError.ts`

**Initialization:**
```javascript
new PipelineError(message: string, context={}: Object, context.pipelineName: string, context.currentStep: string, context.stepIndex: number, context.originalError: Error)
```


### StepExecutionError

**Source:** `PipelineFramework/src/internal/errors/StepExecutionError.ts`

Error signaling a failure within a step's execution logic.

**Initialization:**
```javascript
new StepExecutionError()
```


### StepMock

**Source:** `PipelineFramework/src/testing/mocks.ts`

Jest-based high-fidelity mock for Pipeline Step implementation.

**Initialization:**
```javascript
new StepMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setupExecution` | `setupExecution(): void` |


### PipelineContextMock

**Source:** `PipelineFramework/src/testing/mocks.ts`

Jest-based high-fidelity mock for PipelineContext.

**Initialization:**
```javascript
new PipelineContextMock()
```


---

