# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [JobRunnerLib](#jobrunnerlib)

---

## JobRunnerLib

**Version:** 2.0.0   **Layer:** Application Orchestration (Layer 3)   **Dependencies:** GoogleApiWrapper, GasResilienceLib

### JobDefinitionRegistry

**Source:** `JobRunnerLib/src/JobDefinitionRegistry.ts`

Centralized registry for dynamic job definition management.
Uses the shared {@link Registry} primitive (CoreUtilsLib) for Map-backed storage;
all job-specific validation, logging, and messages remain here.

**Initialization:**
```javascript
new JobDefinitionRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(): void` |
| `getDefinition` | `getDefinition(): void` |
| `listRegisteredJobs` | `listRegisteredJobs(): void` |
| `jobExists` | `jobExists(): void` |
| `_validateJobDefinition` | `_validateJobDefinition(): void` |


### JobExecutor

**Source:** `JobRunnerLib/src/JobQueue.ts`

Handles the low-level execution and monitoring of job generators.

**Initialization:**
```javascript
new JobExecutor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `execute` | `execute(handler: Function, parameters: Object, startTime: number, maxDuration: number): {done: boolean, value?: *, cancelled?: boolean` |


### JobQueue

**Source:** `JobRunnerLib/src/JobQueue.ts`

High-level API for job registration, execution, and lifecycle management.

**Initialization:**
```javascript
new JobQueue()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `DEFAULT_TRIGGER_DELAY_MS` | `DEFAULT_TRIGGER_DELAY_MS: number` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setMaxDuration` | `setMaxDuration(durationMs: number): JobQueue` |
| `setTriggerDelay` | `setTriggerDelay(delayMs: number): JobQueue` |
| `setMaxRetries` | `setMaxRetries(maxRetries: number|null): JobQueue` |
| `setOnFailure` | `setOnFailure(callback: Function|null): JobQueue` |
| `applyConfiguration` | `applyConfiguration(savedConfig: Object): JobQueue` |
| `registerJobHandler` | `registerJobHandler(jobType: string, handler: Function): JobQueue` |
| `execute` | `execute(jobName: string, jobType: string, parameters={}: Object, forceRestart=false: boolean, blockIfSuspended=false: boolean): *` |
| `resetJobState` | `resetJobState(jobName: string): boolean` |
| `cancelJob` | `cancelJob(jobName: string): boolean` |
| `getStatus` | `getStatus(jobName: string): {name: string, type: string, state: string, completed: boolean, percentage: number` |


### MyJobRunnerService

**Source:** `JobRunnerLib/src/JobRunnerService.ts`

**Initialization:**
```javascript
new MyJobRunnerService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_createQueue` | `_createQueue(): JobQueue` |


### QueueStateManager

**Source:** `JobRunnerLib/src/QueueStateManager.ts`

**Initialization:**
```javascript
new QueueStateManager()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `STATE_RUNNING` | `STATE_RUNNING: unknown` |
| `STATE_COMPLETED` | `STATE_COMPLETED: unknown` |
| `STATE_CANCELLED` | `STATE_CANCELLED: unknown` |
| `STATE_FAILED` | `STATE_FAILED: unknown` |
| `STATE_PENDING` | `STATE_PENDING: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_key` | `_key(): void` |
| `getStateVersion` | `getStateVersion(): void` |
| `_incrementVersion` | `_incrementVersion(): void` |
| `setState` | `setState(): void` |
| `getState` | `getState(): void` |
| `isCancelled` | `isCancelled(): void` |
| `getStateWithVersion` | `getStateWithVersion(): void` |
| `tryAcquireRunning` | `tryAcquireRunning(blockIfSuspended=false: boolean): void` |
| `releaseLock` | `releaseLock(): void` |
| `getRetryCount` | `getRetryCount(): void` |
| `incrementRetryCount` | `incrementRetryCount(): void` |
| `resetRetryCount` | `resetRetryCount(): void` |
| `saveFailureInfo` | `saveFailureInfo(): void` |
| `getFailureInfo` | `getFailureInfo(): void` |
| `reset` | `reset(): void` |


### CapturingLogger

**Source:** `JobRunnerLib/src/internal/CapturingLogger.ts`

Transparent proxy logger that captures and buffers log messages for post-execution analysis.

**Initialization:**
```javascript
new CapturingLogger()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_capture` | `_capture(level: string, message: string, context=null: Object): void` |
| `_proxy` | `_proxy(level: string, message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `debug` | `debug(message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `info` | `info(message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `warn` | `warn(message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `error` | `error(message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `log` | `log(level: string, message: string|Object|Function): CapturingLogger` |
| `withPosition` | `withPosition(): void` |
| `_semantic` | `_semantic(): void` |
| `_withoutTrailingUndefined` | `_withoutTrailingUndefined(): void` |
| `logJobStart` | `logJobStart(): void` |
| `logJobResume` | `logJobResume(): void` |
| `logJobEnd` | `logJobEnd(): void` |
| `logJobSuspended` | `logJobSuspended(): void` |
| `logBatchStart` | `logBatchStart(): void` |
| `logItemStart` | `logItemStart(): void` |
| `logStep` | `logStep(): void` |
| `logPipelineStart` | `logPipelineStart(): void` |
| `logPipelineStep` | `logPipelineStep(): void` |
| `logSummary` | `logSummary(): void` |
| `getLogsAsText` | `getLogsAsText(separator='\n': string): string` |
| `getLogsAsHtml` | `getLogsAsHtml(): string` |
| `_escapeHtml` | `_escapeHtml(text: string): string` |
| `getLogCount` | `getLogCount(): number` |
| `setLevel` | `setLevel(level: string): CapturingLogger` |
| `getLevel` | `getLevel(): string` |


### QueuePersistenceHandler

**Source:** `JobRunnerLib/src/internal/QueuePersistenceHandler.ts`

**Initialization:**
```javascript
new QueuePersistenceHandler()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `LARGE_STATE_THRESHOLD` | `LARGE_STATE_THRESHOLD: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_driveApp` | `_driveApp(): GoogleAppsScript.Drive.DriveApp|undefined` |
| `_key` | `_key(): void` |
| `_resolveResumeStatePatch` | `_resolveResumeStatePatch(state: *): {properties: Object<string,string>, propertiesToDelete: string[]` |
| `_resolveResumeStatePatchForBatch` | `_resolveResumeStatePatchForBatch(state: *): {properties: Object<string,string>, propertiesToDelete: string[]` |
| `batchSave` | `batchSave(): void` |
| `saveResumeState` | `saveResumeState(): void` |
| `loadResumeState` | `loadResumeState(): void` |
| `_saveLargeStateToDrive` | `_saveLargeStateToDrive(): void` |
| `_loadLargeStateFromDrive` | `_loadLargeStateFromDrive(): void` |
| `_getOrCreateJobStateFolder` | `_getOrCreateJobStateFolder(): void` |
| `saveConfiguration` | `saveConfiguration(): void` |
| `loadConfiguration` | `loadConfiguration(): void` |
| `saveType` | `saveType(): void` |
| `loadType` | `loadType(): void` |
| `clearResumeState` | `clearResumeState(): void` |
| `reset` | `reset(): void` |


### QueueProgressTracker

**Source:** `JobRunnerLib/src/internal/QueueProgressTracker.ts`

**Initialization:**
```javascript
new QueueProgressTracker()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_key` | `_key(): void` |
| `saveProgress` | `saveProgress(): void` |
| `reset` | `reset(): void` |
| `_calculateExactTotal` | `_calculateExactTotal(): void` |


### JobRunnerExecutionController

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerExecutionController.ts`

**Initialization:**
```javascript
new JobRunnerExecutionController()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_semantic` | `_semantic(): void` |
| `_logJobStart` | `_logJobStart(): void` |
| `_logJobResume` | `_logJobResume(): void` |
| `_logTerminal` | `_logTerminal(): void` |
| `_status` | `_status(): void` |
| `run` | `run(): void` |
| `resume` | `resume(): void` |


### JobRunnerLogCapturer

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerLogCapturer.ts`

**Initialization:**
```javascript
new JobRunnerLogCapturer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validateLoggingConfig` | `_validateLoggingConfig(): void` |
| `_displayLogs` | `_displayLogs(): void` |
| `_displayLogsInSidebar` | `_displayLogsInSidebar(): void` |
| `_displayLogsInDriveFile` | `_displayLogsInDriveFile(): void` |


### JobStateManager

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerStateManager.ts`

**Initialization:**
```javascript
new JobStateManager()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `STATE_RUNNING` | `STATE_RUNNING: unknown` |
| `STATE_COMPLETED` | `STATE_COMPLETED: unknown` |
| `STATE_CANCELLED` | `STATE_CANCELLED: unknown` |
| `STATE_FAILED` | `STATE_FAILED: unknown` |
| `STATE_PENDING` | `STATE_PENDING: unknown` |
| `LARGE_STATE_THRESHOLD` | `LARGE_STATE_THRESHOLD: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `reset` | `reset(): void` |


### JobRunnerStateManager

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerStateManager.ts`

**Initialization:**
```javascript
new JobRunnerStateManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getStatus` | `getStatus(): void` |
| `resetJob` | `resetJob(): void` |
| `cancelJob` | `cancelJob(): void` |


### JobTriggerManager

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerTriggerManager.ts`

**Initialization:**
```javascript
new JobTriggerManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createResumeTrigger` | `createResumeTrigger(): void` |
| `deleteExistingTriggers` | `deleteExistingTriggers(): void` |


### JobRunnerTriggerManager

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerTriggerManager.ts`

**Initialization:**
```javascript
new JobRunnerTriggerManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_getCurrentTriggerId` | `_getCurrentTriggerId(): string|null` |


---

