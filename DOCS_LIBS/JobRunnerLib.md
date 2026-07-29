# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [JobRunnerLib](#jobrunnerlib)

---

## JobRunnerLib

**Version:** 2.0.0   **Layer:** Application Orchestration (Layer 3)   **Dependencies:** GoogleApiWrapper, GasResilienceLib

### JobDefinitionRegistry

Service for dynamic management of job definition registry.

**Initialization:**
```javascript
new JobDefinitionRegistry()
```

**Methods:**

- `register(): void`
  > Registers a job definition.

- `getDefinition(): void`
  > Retrieves a registered definition.

- `listRegisteredJobs(): void`
  > Lists all registered job identifiers.

- `listAll(): void`
  > Alias for listRegisteredJobs.

- `jobExists(): void`
  > Verifies job existence.

- `removeJob(): void`
  > Removes a job definition.

- `getStatistics(): void`
  > Registry telemetry.


### JobExecutor

Core job queue service for managing long-running tasks with automatic
             state persistence and resumption via triggers.

**Initialization:**
```javascript
new JobExecutor(generator: Generator, maxDuration: number, startTime: number)
```

**Methods:**

- `execute(handler: Function, parameters: Object, startTime: number, maxDuration: number): {done: boolean, value?: *, cancelled?: boolean`
  > Executes job logic with interruption and persistence support.


### JobQueue

@param {Object} logger Logger instance.
@param {JobStateManager} stateManager Persistence and lock manager.
@param {JobTriggerManager} triggerManager Resume trigger controller.
/
  constructor(logger, stateManager, triggerManager) {
    this._logger = logger;
    this._stateManager = stateManager;
    this._triggerManager = triggerManager;
    this.progressTracker = new QueueProgressTracker(
      this._stateManager.jobName,
      this._stateManager._propertiesService
    );
    this._calculateExactTotal = this.progressTracker._calculateExactTotal.bind(
      this.progressTracker
    );
  }

**Initialization:**
```javascript
new JobQueue(handler: Function, parameters: Object, startTime: number, maxDuration: number)
```

**Methods:**

- `setMaxDuration(durationMs: number): JobQueue`
  > Configures global execution timeout.

- `setTriggerDelay(delayMs: number): JobQueue`
  > Configures base delay for resume triggers.

- `setMaxRetries(maxRetries: number|null): JobQueue`
  > Configures retry limit for failed/timed-out jobs.

- `setOnFailure(callback: Function|null): JobQueue`
  > Registers a terminal failure listener.

- `applyConfiguration(savedConfig: Object): JobQueue`
  > Restores queue configuration from a persistence object.

- `registerJobHandler(jobType: string, handler: Function): JobQueue`
  > Maps a job type to a generator function.

- `execute(jobName: string, jobType: string, parameters={}: Object, forceRestart=false: boolean): *`
  > Orchestrates job execution, state loading, and retry/timeout logic.

- `resetJobState(jobName: string): boolean`
  > Purges all state and triggers associated with a job instance.

- `cancelJob(jobName: string): boolean`
  > Signals a job for termination. State is checked at next progress pulse.

- `getStatus(jobName: string): {name: string, type: string, state: string, completed: boolean, percentage: number`
  > Retrieves live job telemetry.


### QueueStateManager

Manages atomic lock acquisition, versioning, state tracking, and retries.
Extracted from JobStateManager for improved separation of concerns.

**Initialization:**
```javascript
new QueueStateManager()
```


### CapturingLogger

Proxy logger that captures all log messages while forwarding to a real logger

**Initialization:**
```javascript
new CapturingLogger(realLogger: Object, maxBufferSize=1000: number)
```

**Methods:**

- `debug(message: string|Object|Function, context: Object|Function): CapturingLogger`
  > Proxies and captures DEBUG message.

- `info(message: string|Object|Function, context: Object|Function): CapturingLogger`
  > Proxies and captures INFO message.

- `warn(message: string|Object|Function, context: Object|Function): CapturingLogger`
  > Proxies and captures WARN message.

- `error(message: string|Object|Function, context: Object|Function): CapturingLogger`
  > Proxies and captures ERROR message.

- `log(level: string, message: string|Object|Function): CapturingLogger`
  > Programmatic log entry capture and proxying.

- `getCapturedLogs(): Array<{level: string, timestamp: Date, message: string, context: Object|null`
  > Retrieves raw capture buffer.

- `getLogsAsText(separator='\n': string): string`
  > Formats captured logs as plain text.

- `getLogsAsHtml(): string`
  > Formats captured logs as a styled HTML block.

- `clearCapturedLogs(): void`
  > Clears internal memory buffer. Does not affect realLogger.

- `getLogCount(): number`

- `setLevel(level: string): CapturingLogger`
  > Delegates log level configuration to realLogger.

- `getLevel(): string`
  > Retrieves current level from realLogger.


### QueueProgressTracker

Tracks job progress and calculates exact total actions from iteration levels.
Extracted from JobStateManager and JobExecutor for improved separation of concerns.

**Initialization:**
```javascript
new QueueProgressTracker()
```


### JobTriggerManager

Manager for automatic resume triggers and trigger context discovery.

**Initialization:**
```javascript
new JobTriggerManager()
```


---

