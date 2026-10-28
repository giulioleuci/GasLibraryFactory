# API Reference: JobRunnerLib

## CLASS: QueueStateManager
**File Path:** `JobRunnerLib/src/QueueStateManager.ts`
**Constructor Usage:** `const instance = new QueueStateManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of QueueStateManager

#### PROPERTY: QueueStateManager.STATE_RUNNING
- **Scope:** static
- **LLM Call Syntax:** `const result = QueueStateManager.STATE_RUNNING;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: QueueStateManager.STATE_COMPLETED
- **Scope:** static
- **LLM Call Syntax:** `const result = QueueStateManager.STATE_COMPLETED;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: QueueStateManager.STATE_CANCELLED
- **Scope:** static
- **LLM Call Syntax:** `const result = QueueStateManager.STATE_CANCELLED;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: QueueStateManager.STATE_FAILED
- **Scope:** static
- **LLM Call Syntax:** `const result = QueueStateManager.STATE_FAILED;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: QueueStateManager.STATE_PENDING
- **Scope:** static
- **LLM Call Syntax:** `const result = QueueStateManager.STATE_PENDING;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager._key
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager._key();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.getStateVersion
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getStateVersion();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager._incrementVersion
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager._incrementVersion();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.setState
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.setState();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.getState
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getState();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.isCancelled
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.isCancelled();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.getStateWithVersion
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getStateWithVersion();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.tryAcquireRunning
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.tryAcquireRunning(blockIfSuspended);`
- **Pure JSDoc:**
```javascript
/**
   * @param {boolean} [blockIfSuspended=false] Refuse acquisition when the job is
   *   currently `'to_resume'` (interrupted by a timeout, awaiting its automatic
   *   resume trigger). Only a fresh/manual launch should pass `true` — the resume
   *   path itself (the trigger firing) must always be allowed through regardless
   *   of this state, since resuming a suspended job is exactly what it's for.
   *   Without this guard a fresh launch of the same jobName silently resumes the
   *   stale checkpoint instead of being refused, and can race the real trigger
   *   into a second concurrent execution.
   */
```
---
#### METHOD: QueueStateManager.releaseLock
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.releaseLock();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.getRetryCount
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getRetryCount();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.incrementRetryCount
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.incrementRetryCount();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.resetRetryCount
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.resetRetryCount();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.saveFailureInfo
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.saveFailureInfo();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.getFailureInfo
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getFailureInfo();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueStateManager.reset
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.reset();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: MyJobRunnerService
**File Path:** `JobRunnerLib/src/JobRunnerService.ts`
**Constructor Usage:** `const instance = new MyJobRunnerService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of MyJobRunnerService

#### METHOD: MyJobRunnerService._createQueue
- **Scope:** instance
- **LLM Call Syntax:** `const result = myJobRunnerService._createQueue();`
- **Pure JSDoc:**
```javascript
/**
   * Factory for JobQueue instances with injected platform services.
   * @private
   * @returns {JobQueue} Initialized queue with native GAS lock/trigger support.
   */
```
---
<br>

## CLASS: JobExecutor
**File Path:** `JobRunnerLib/src/JobQueue.ts`
**Constructor Usage:** `const instance = new JobExecutor();`
**Description:** Handles the low-level execution and monitoring of job generators.

### Raw JSDoc Context:
```javascript
/**
 * Handles the low-level execution and monitoring of job generators.
 * @private
 * @class
 */
```

### Methods and properties of JobExecutor

#### METHOD: JobExecutor.execute
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobExecutor.execute(handler, parameters, startTime, maxDuration);`
- **Pure JSDoc:**
```javascript
/**
   * Executes job logic with interruption and persistence support.
   * @param {Function} handler Generator-based job function.
   * @param {Object} parameters Job context and resume state.
   * @param {number} startTime Execution start timestamp.
   * @param {number} maxDuration Timeout threshold.
   * @returns {{done: boolean, value?: *, cancelled?: boolean}} Execution outcome.
   * @throws {Error} If handler is not a generator.
   * @throws {TimeoutException} Captured internally to trigger state save and resume.
   */
```
---
<br>

## CLASS: JobQueue
**File Path:** `JobRunnerLib/src/JobQueue.ts`
**Constructor Usage:** `const instance = new JobQueue();`
**Description:** High-level API for job registration, execution, and lifecycle management.

### Raw JSDoc Context:
```javascript
/**
 * High-level API for job registration, execution, and lifecycle management.
 * @class
 */
```

### Methods and properties of JobQueue

#### PROPERTY: JobQueue.DEFAULT_TRIGGER_DELAY_MS
- **Scope:** static
- **LLM Call Syntax:** `const result = JobQueue.DEFAULT_TRIGGER_DELAY_MS;`
- **Pure JSDoc:**
```javascript
/** @returns {number} 60000ms default delay between timeout and resume. */
```
---
#### METHOD: JobQueue.setMaxDuration
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.setMaxDuration(durationMs);`
- **Pure JSDoc:**
```javascript
/**
   * Configures global execution timeout.
   * @param {number} durationMs Max execution time.
   * @returns {JobQueue} Current instance.
   * @throws {Error} If durationMs is not positive.
   */
```
---
#### METHOD: JobQueue.setTriggerDelay
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.setTriggerDelay(delayMs);`
- **Pure JSDoc:**
```javascript
/**
   * Configures base delay for resume triggers.
   * @param {number} delayMs Delay in milliseconds.
   * @returns {JobQueue} Current instance.
   * @throws {Error} If delayMs is not positive.
   */
```
---
#### METHOD: JobQueue.setMaxRetries
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.setMaxRetries(maxRetries);`
- **Pure JSDoc:**
```javascript
/**
   * Configures retry limit for failed/timed-out jobs.
   * @param {number|null} maxRetries Integer limit or null for infinite.
   * @returns {JobQueue} Current instance.
   * @throws {Error} If maxRetries is invalid.
   */
```
---
#### METHOD: JobQueue.setPurgeOnComplete
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.setPurgeOnComplete(purge);`
- **Pure JSDoc:**
```javascript
/**
   * Purges all job ScriptProperties on successful completion (default: keep the COMPLETED
   * tombstone). Persisted in the job config, so it also applies to trigger-driven resumes.
   * After a purge `getStatus(jobName)` reports `not_started`.
   * @param {boolean} purge
   * @returns {JobQueue} Current instance.
   */
```
---
#### METHOD: JobQueue.setOnFailure
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.setOnFailure(callback);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a terminal failure listener.
   * @param {Function|null} callback Function(error, jobState).
   * @returns {JobQueue} Current instance.
   */
```
---
#### METHOD: JobQueue.applyConfiguration
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.applyConfiguration(savedConfig);`
- **Pure JSDoc:**
```javascript
/**
   * Restores queue configuration from a persistence object.
   * @param {Object} savedConfig Configuration snapshot.
   * @returns {JobQueue} Current instance.
   */
```
---
#### METHOD: JobQueue.registerJobHandler
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.registerJobHandler(jobType, handler);`
- **Pure JSDoc:**
```javascript
/**
   * Maps a job type to a generator function.
   * @param {string} jobType Unique identifier.
   * @param {Function} handler Generator function: `function*(params)`.
   * @returns {JobQueue} Current instance.
   * @throws {Error} If handler is not a function.
   */
```
---
#### METHOD: JobQueue.execute
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.execute(jobName, jobType, parameters, forceRestart, blockIfSuspended);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates job execution, state loading, and retry/timeout logic.
   *
   * @param {string} jobName Unique instance identifier (used for state key).
   * @param {string} jobType Registered handler type.
   * @param {Object} [parameters={}] Input data and context.
   * @param {boolean} [forceRestart=false] If true, purges existing state/locks before start.
   * @param {boolean} [blockIfSuspended=false] Refuse to start if the job is currently
   *   `'to_resume'` (interrupted by a timeout, awaiting its automatic resume trigger).
   *   Pass `true` for fresh/manual launches; leave `false` for the resume path itself,
   *   which must always be allowed to proceed regardless of this state.
   * @returns {*} Generator return value if complete; null if suspended or failed.
   * @throws {Error} If handler missing, fatal error occurs, or parameters are invalid.
   *
   * @example
   * queue.registerJobHandler('sync', function*(params) {
   *   yield { percentage: 50 };
   *   return { status: 'ok' };
   * });
   * const result = queue.execute('sync-1', 'sync', { id: 123 });
   */
```
---
#### METHOD: JobQueue.resetJobState
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.resetJobState(jobName);`
- **Pure JSDoc:**
```javascript
/**
   * Purges all state and triggers associated with a job instance.
   * @param {string} jobName Unique instance identifier.
   * @returns {boolean} True if successful.
   */
```
---
#### METHOD: JobQueue.cancelJob
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.cancelJob(jobName);`
- **Pure JSDoc:**
```javascript
/**
   * Signals a job for termination. State is checked at next progress pulse.
   * @param {string} jobName Unique instance identifier.
   * @returns {boolean} True if cancellation signal was set.
   */
```
---
#### METHOD: JobQueue.getStatus
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobQueue.getStatus(jobName);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves live job telemetry.
   * @param {string} jobName Unique instance identifier.
   * @returns {{name: string, type: string, state: string, completed: boolean, percentage: number}}
   */
```
---
<br>

## CLASS: JobDefinitionRegistry
**File Path:** `JobRunnerLib/src/JobDefinitionRegistry.ts`
**Constructor Usage:** `const instance = new JobDefinitionRegistry();`
**Description:** Centralized registry for dynamic job definition management.
Uses the shared {@link Registry} primitive (CoreUtilsLib) for Map-backed storage;
all job-specific validation, logging, and messages remain here.

### Raw JSDoc Context:
```javascript
/**
 * Centralized registry for dynamic job definition management.
 * Uses the shared {@link Registry} primitive (CoreUtilsLib) for Map-backed storage;
 * all job-specific validation, logging, and messages remain here.
 *
 * @class
 */
```

### Methods and properties of JobDefinitionRegistry

#### METHOD: JobDefinitionRegistry.register
- **Scope:** instance
- **LLM Call Syntax:** `jobDefinitionRegistry.register();`
- **Pure JSDoc:**
```javascript
/**
   * Registers a job definition.
   */
```
---
#### METHOD: JobDefinitionRegistry.getDefinition
- **Scope:** instance
- **LLM Call Syntax:** `jobDefinitionRegistry.getDefinition();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves a registered definition.
   */
```
---
#### METHOD: JobDefinitionRegistry.listRegisteredJobs
- **Scope:** instance
- **LLM Call Syntax:** `jobDefinitionRegistry.listRegisteredJobs();`
- **Pure JSDoc:**
```javascript
/**
   * Lists all registered job identifiers.
   */
```
---
#### METHOD: JobDefinitionRegistry.jobExists
- **Scope:** instance
- **LLM Call Syntax:** `jobDefinitionRegistry.jobExists();`
- **Pure JSDoc:**
```javascript
/**
   * Verifies job existence.
   */
```
---
#### METHOD: JobDefinitionRegistry._validateJobDefinition
- **Scope:** instance
- **LLM Call Syntax:** `jobDefinitionRegistry._validateJobDefinition();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
<br>

## CLASS: QueueProgressTracker
**File Path:** `JobRunnerLib/src/internal/QueueProgressTracker.ts`
**Constructor Usage:** `const instance = new QueueProgressTracker();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of QueueProgressTracker

#### METHOD: QueueProgressTracker._key
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker._key();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueProgressTracker.saveProgress
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.saveProgress();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueProgressTracker.reset
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.reset();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueueProgressTracker._calculateExactTotal
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker._calculateExactTotal();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: QueuePersistenceHandler
**File Path:** `JobRunnerLib/src/internal/QueuePersistenceHandler.ts`
**Constructor Usage:** `const instance = new QueuePersistenceHandler();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of QueuePersistenceHandler

#### PROPERTY: QueuePersistenceHandler.LARGE_STATE_THRESHOLD
- **Scope:** static
- **LLM Call Syntax:** `const result = QueuePersistenceHandler.LARGE_STATE_THRESHOLD;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler._driveApp
- **Scope:** instance
- **LLM Call Syntax:** `const result = queuePersistenceHandler._driveApp();`
- **Pure JSDoc:**
```javascript
/**
   * Resolves the native Drive API surface via the wrapped DriveService (L2).
   * @private
   * @returns {GoogleAppsScript.Drive.DriveApp|undefined} Native DriveApp, or undefined outside GAS.
   */
```
---
#### METHOD: QueuePersistenceHandler._key
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler._key();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler._resolveResumeStatePatch
- **Scope:** instance
- **LLM Call Syntax:** `const result = queuePersistenceHandler._resolveResumeStatePatch(state);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves the ScriptProperties patch for a resume-state value, offloading
   * to Drive (and returning a `__DRIVE__:` pointer + recorded size instead
   * of the inline JSON) whenever the serialized state exceeds
   * `LARGE_STATE_THRESHOLD` — the same protection `saveResumeState` has
   * always provided against `PropertiesService`'s ~9KB per-value cap.
   * Shared by `saveResumeState` (applies the patch immediately) and
   * `batchSave` (merges the patch into its single `setProperties` call), so
   * both persistence paths get identical size-check-then-offload behavior;
   * previously only `saveResumeState` had it, and `batchSave` — used on the
   * timeout/suspension path — silently wrote oversized state inline instead.
   * @private
   * @param {*} state Resume-state value to persist.
   * @returns {{properties: Object<string,string>, propertiesToDelete: string[]}}
   *   `properties` to merge into a `setProperties` call (or apply
   *   individually); `propertiesToDelete` are keys that must be explicitly
   *   deleted afterward (`setProperties` can only set/overwrite, never
   *   delete, keys).
   */
```
---
#### METHOD: QueuePersistenceHandler._resolveResumeStatePatchForBatch
- **Scope:** instance
- **LLM Call Syntax:** `const result = queuePersistenceHandler._resolveResumeStatePatchForBatch(state);`
- **Pure JSDoc:**
```javascript
/**
   * `batchSave` is used on the timeout/suspension path (see JobQueue.js's
   * `TimeoutException` handler): it must persist `state: 'to_resume'`,
   * `progress`, and the version bump together so `createResumeTrigger()`
   * runs afterward. If the Drive offload of an oversized `resumeState`
   * fails (Drive unavailable/quota), `_resolveResumeStatePatch` throws —
   * and letting that propagate would make the whole `batchSave` call fail,
   * losing the suspend state and stranding the job with no resume trigger.
   * So here (unlike `saveResumeState`, which intentionally still hard-fails
   * on Drive errors since it isn't on the crash-recovery path) a Drive
   * failure falls back to the old pre-tiering inline-JSON write instead of
   * propagating: same risk of exceeding `PropertiesService`'s ~9KB cap that
   * applied unconditionally before large-state tiering existed, but the job
   * still gets flagged `to_resume` with a trigger created.
   * @private
   * @param {*} state Resume-state value to persist.
   * @returns {{properties: Object<string,string>, propertiesToDelete: string[]}}
   */
```
---
#### METHOD: QueuePersistenceHandler.batchSave
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.batchSave();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler.saveResumeState
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.saveResumeState();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler.loadResumeState
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.loadResumeState();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler._saveLargeStateToDrive
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler._saveLargeStateToDrive();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler._loadLargeStateFromDrive
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler._loadLargeStateFromDrive();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler._getOrCreateJobStateFolder
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler._getOrCreateJobStateFolder();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler.saveConfiguration
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.saveConfiguration();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler.loadConfiguration
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.loadConfiguration();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler.saveType
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.saveType();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler.loadType
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.loadType();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler.clearResumeState
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.clearResumeState();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: QueuePersistenceHandler.reset
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.reset();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: CapturingLogger
**File Path:** `JobRunnerLib/src/internal/CapturingLogger.ts`
**Constructor Usage:** `const instance = new CapturingLogger();`
**Description:** Transparent proxy logger that captures and buffers log messages for post-execution analysis.

### Raw JSDoc Context:
```javascript
/**
 * Transparent proxy logger that captures and buffers log messages for post-execution analysis.
 *
 * @description
 * Intercepts all log calls (debug, info, warn, error), stores them in a memory buffer with timestamps
 * and levels, and forwards them to an underlying LoggerService. Optimized for background job logging
 * and UI replay.
 *
 * @class
 */
```

### Methods and properties of CapturingLogger

#### METHOD: CapturingLogger._capture
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger._capture(level, message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Internal buffer ingestion and eviction logic.
   * @private
   * @param {string} level Log level identifier (DEBUG|INFO|WARN|ERROR).
   * @param {string} message Formatted log message string.
   * @param {Object} [context=null] Metadata object associated with the log entry.
   */
```
---
#### METHOD: CapturingLogger._proxy
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger._proxy(level, message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Proxies and captures a log message at the given level.
   * @private
   * @param {string} level Log level name (debug|info|warn|error).
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
```
---
#### METHOD: CapturingLogger.debug
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.debug(message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Proxies and captures DEBUG message.
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
```
---
#### METHOD: CapturingLogger.info
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.info(message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Proxies and captures INFO message.
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
```
---
#### METHOD: CapturingLogger.warn
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.warn(message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Proxies and captures WARN message.
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
```
---
#### METHOD: CapturingLogger.error
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.error(message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Proxies and captures ERROR message.
   * @param {string|Object|Function} message Raw message, object to stringify, or lazy evaluation function.
   * @param {Object|Function} [context] Optional metadata or lazy evaluation context function.
   * @returns {CapturingLogger} Current instance for chaining.
   */
```
---
#### METHOD: CapturingLogger.log
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.log(level, message);`
- **Pure JSDoc:**
```javascript
/**
   * Programmatic log entry capture and proxying.
   * @param {string} level Log level identifier.
   * @param {string|Object|Function} message Log message or evaluator.
   * @returns {CapturingLogger} Current instance for chaining.
   */
```
---
#### METHOD: CapturingLogger.withPosition
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.withPosition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger._semantic
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger._semantic();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger._withoutTrailingUndefined
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger._withoutTrailingUndefined();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logJobStart
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logJobStart();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logJobResume
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logJobResume();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logJobEnd
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logJobEnd();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logJobSuspended
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logJobSuspended();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logBatchStart
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logBatchStart();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logItemStart
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logItemStart();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logStep
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logStep();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logPipelineStart
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logPipelineStart();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logPipelineStep
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logPipelineStep();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.logSummary
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.logSummary();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: CapturingLogger.getLogsAsText
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.getLogsAsText(separator);`
- **Pure JSDoc:**
```javascript
/**
   * Formats captured logs as plain text.
   * @param {string} [separator='\n'] Line delimiter.
   * @returns {string} Formatted string: `[LEVEL] ISO_TIMESTAMP - MESSAGE {JSON_CONTEXT}`.
   */
```
---
#### METHOD: CapturingLogger.getLogsAsHtml
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.getLogsAsHtml();`
- **Pure JSDoc:**
```javascript
/**
   * Formats captured logs as a styled HTML block.
   * @description
   * Returns a <div> containing color-coded log entries (DEBUG:gray, INFO:blue, WARN:orange, ERROR:red).
   * @returns {string} Sanitized HTML string for UI display.
   * @example
   * const html = capturingLogger.getLogsAsHtml();
   * uiService.createSidebar().setTitle('Job Logs').setContent(html).show();
   */
```
---
#### METHOD: CapturingLogger._escapeHtml
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger._escapeHtml(text);`
- **Pure JSDoc:**
```javascript
/**
   * XSS mitigation for HTML log output.
   * @private
   * @param {string} text Raw text to sanitize.
   * @returns {string} HTML-escaped string.
   */
```
---
#### METHOD: CapturingLogger.getLogCount
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.getLogCount();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {number} Current entry count in buffer.
   */
```
---
#### METHOD: CapturingLogger.setLevel
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.setLevel(level);`
- **Pure JSDoc:**
```javascript
/**
   * Delegates log level configuration to realLogger.
   * @param {string} level Target log level.
   * @returns {CapturingLogger} Current instance for chaining.
   */
```
---
#### METHOD: CapturingLogger.getLevel
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.getLevel();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves current level from realLogger.
   * @returns {string} Active log level or 'UNKNOWN' if realLogger is not configurable.
   */
```
---
<br>

## CLASS: JobTriggerManager
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerTriggerManager.ts`
**Constructor Usage:** `const instance = new JobTriggerManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of JobTriggerManager

#### METHOD: JobTriggerManager.createResumeTrigger
- **Scope:** instance
- **LLM Call Syntax:** `jobTriggerManager.createResumeTrigger();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobTriggerManager.deleteExistingTriggers
- **Scope:** instance
- **LLM Call Syntax:** `jobTriggerManager.deleteExistingTriggers();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: JobRunnerTriggerManager
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerTriggerManager.ts`
**Constructor Usage:** `const instance = new JobRunnerTriggerManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of JobRunnerTriggerManager

#### METHOD: JobRunnerTriggerManager._getCurrentTriggerId
- **Scope:** instance
- **LLM Call Syntax:** `const result = jobRunnerTriggerManager._getCurrentTriggerId();`
- **Pure JSDoc:**
```javascript
/**
   * Discovers the unique identifier of the trigger that initiated current execution.
   * @private
   * @returns {string|null} Trigger ID if context is matched; null if direct execution or discovery fails.
   */
```
---
<br>

## CLASS: JobStateManager
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerStateManager.ts`
**Constructor Usage:** `const instance = new JobStateManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of JobStateManager

#### PROPERTY: JobStateManager.STATE_RUNNING
- **Scope:** static
- **LLM Call Syntax:** `const result = JobStateManager.STATE_RUNNING;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: JobStateManager.STATE_COMPLETED
- **Scope:** static
- **LLM Call Syntax:** `const result = JobStateManager.STATE_COMPLETED;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: JobStateManager.STATE_CANCELLED
- **Scope:** static
- **LLM Call Syntax:** `const result = JobStateManager.STATE_CANCELLED;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: JobStateManager.STATE_FAILED
- **Scope:** static
- **LLM Call Syntax:** `const result = JobStateManager.STATE_FAILED;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: JobStateManager.STATE_PENDING
- **Scope:** static
- **LLM Call Syntax:** `const result = JobStateManager.STATE_PENDING;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: JobStateManager.LARGE_STATE_THRESHOLD
- **Scope:** static
- **LLM Call Syntax:** `const result = JobStateManager.LARGE_STATE_THRESHOLD;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobStateManager.reset
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.reset();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: JobRunnerStateManager
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerStateManager.ts`
**Constructor Usage:** `const instance = new JobRunnerStateManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of JobRunnerStateManager

#### METHOD: JobRunnerStateManager.getStatus
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerStateManager.getStatus();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerStateManager.resetJob
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerStateManager.resetJob();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerStateManager.cancelJob
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerStateManager.cancelJob();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: JobRunnerLogCapturer
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerLogCapturer.ts`
**Constructor Usage:** `const instance = new JobRunnerLogCapturer();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of JobRunnerLogCapturer

#### METHOD: JobRunnerLogCapturer._validateLoggingConfig
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer._validateLoggingConfig();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerLogCapturer._displayLogs
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer._displayLogs();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerLogCapturer._displayLogsInSidebar
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer._displayLogsInSidebar();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerLogCapturer._displayLogsInDriveFile
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer._displayLogsInDriveFile();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: JobRunnerExecutionController
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerExecutionController.ts`
**Constructor Usage:** `const instance = new JobRunnerExecutionController();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of JobRunnerExecutionController

#### METHOD: JobRunnerExecutionController._semantic
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController._semantic();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerExecutionController._logJobStart
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController._logJobStart();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerExecutionController._logJobResume
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController._logJobResume();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerExecutionController._logTerminal
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController._logTerminal();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerExecutionController._status
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController._status();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerExecutionController.run
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.run();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: JobRunnerExecutionController.resume
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.resume();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## GLOBAL FUNCTIONS

### FUNCTION: withTimeout
- **Source:** `JobRunnerLib/src/JobQueue.ts`
- **LLM Call Syntax:** `withTimeout(generator, maxDuration, startTime);`
- **Pure JSDoc:**
```javascript
/**
 * Decorates a generator with execution time limits.
 * @param {Generator} generator Target generator to monitor.
 * @param {number} maxDuration Maximum execution time in milliseconds.
 * @param {number} startTime Unix timestamp of execution start.
 * @yields {*} Values from the original generator.
 * @throws {TimeoutException} After exposing the latest checkpoint if
 *   `now() - startTime >= maxDuration`, before advancing the generator again.
 */
```

---
