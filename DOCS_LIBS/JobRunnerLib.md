# API Reference: JobRunnerLib

## CLASS: QueueStateManager
**File Path:** `JobRunnerLib/src/QueueStateManager.js`
**Constructor Usage:** `const instance = new QueueStateManager();`
**Description:** Manages atomic lock acquisition, versioning, state tracking, and retries.
Extracted from JobStateManager for improved separation of concerns.

### Raw JSDoc Context:
```javascript
/**
 * @file JobRunnerLib/src/QueueStateManager.js
 * @description Manages atomic lock acquisition, versioning, state tracking, and retries.
 * Extracted from JobStateManager for improved separation of concerns.
 */
```

### Methods of QueueStateManager

#### METHOD: QueueStateManager.STATE_RUNNING
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.STATE_RUNNING();`
- **Pure JSDoc:**
```javascript
/** Method STATE_RUNNING */
```
---
#### METHOD: QueueStateManager.STATE_COMPLETED
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.STATE_COMPLETED();`
- **Pure JSDoc:**
```javascript
/** Method STATE_COMPLETED */
```
---
#### METHOD: QueueStateManager.STATE_CANCELLED
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.STATE_CANCELLED();`
- **Pure JSDoc:**
```javascript
/** Method STATE_CANCELLED */
```
---
#### METHOD: QueueStateManager.STATE_FAILED
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.STATE_FAILED();`
- **Pure JSDoc:**
```javascript
/** Method STATE_FAILED */
```
---
#### METHOD: QueueStateManager.STATE_PENDING
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.STATE_PENDING();`
- **Pure JSDoc:**
```javascript
/** Method STATE_PENDING */
```
---
#### METHOD: QueueStateManager.LOCK_RETRY_DELAY_MS
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.LOCK_RETRY_DELAY_MS();`
- **Pure JSDoc:**
```javascript
/** Method LOCK_RETRY_DELAY_MS */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(!jobName || typeof jobName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(!propertiesService || typeof propertiesService !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(typeof propertiesService.getProperty !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(!utils || typeof utils !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(typeof utils.sleep !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(!lockService || typeof lockService !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(typeof lockService.getScriptLock !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.getStateVersion
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getStateVersion();`
- **Pure JSDoc:**
```javascript
/** Method getStateVersion */
```
---
#### METHOD: QueueStateManager.setState
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.setState(state, expectedVersion);`
- **Pure JSDoc:**
```javascript
/** Method setState */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(expectedVersion !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(currentVersion !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.getState
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getState();`
- **Pure JSDoc:**
```javascript
/** Method getState */
```
---
#### METHOD: QueueStateManager.isCancelled
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.isCancelled();`
- **Pure JSDoc:**
```javascript
/** Method isCancelled */
```
---
#### METHOD: QueueStateManager.getStateWithVersion
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getStateWithVersion();`
- **Pure JSDoc:**
```javascript
/** Method getStateWithVersion */
```
---
#### METHOD: QueueStateManager.tryAcquireRunning
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.tryAcquireRunning();`
- **Pure JSDoc:**
```javascript
/** Method tryAcquireRunning */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(currentState);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.if(lockTimestamp);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueStateManager.releaseLock
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.releaseLock();`
- **Pure JSDoc:**
```javascript
/** Method releaseLock */
```
---
#### METHOD: QueueStateManager.getRetryCount
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getRetryCount();`
- **Pure JSDoc:**
```javascript
/** Method getRetryCount */
```
---
#### METHOD: QueueStateManager.incrementRetryCount
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.incrementRetryCount();`
- **Pure JSDoc:**
```javascript
/** Method incrementRetryCount */
```
---
#### METHOD: QueueStateManager.resetRetryCount
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.resetRetryCount();`
- **Pure JSDoc:**
```javascript
/** Method resetRetryCount */
```
---
#### METHOD: QueueStateManager.saveFailureInfo
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.saveFailureInfo(failureInfo);`
- **Pure JSDoc:**
```javascript
/** Method saveFailureInfo */
```
---
#### METHOD: QueueStateManager.getFailureInfo
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.getFailureInfo();`
- **Pure JSDoc:**
```javascript
/** Method getFailureInfo */
```
---
#### METHOD: QueueStateManager.reset
- **Scope:** instance
- **LLM Call Syntax:** `queueStateManager.reset();`
- **Pure JSDoc:**
```javascript
/** Method reset */
```
---
<br>

## CLASS: MyJobRunnerService
**File Path:** `JobRunnerLib/src/JobRunnerService.js`
**Constructor Usage:** `const instance = new MyJobRunnerService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of MyJobRunnerService

#### METHOD: MyJobRunnerService.if
- **Scope:** instance
- **LLM Call Syntax:** `myJobRunnerService.if(logger);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyJobRunnerService.if
- **Scope:** instance
- **LLM Call Syntax:** `myJobRunnerService.if(typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyJobRunnerService.if
- **Scope:** instance
- **LLM Call Syntax:** `myJobRunnerService.if(typeof logger[method] !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyJobRunnerService.if
- **Scope:** instance
- **LLM Call Syntax:** `myJobRunnerService.if(utils);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyJobRunnerService.if
- **Scope:** instance
- **LLM Call Syntax:** `myJobRunnerService.if(typeof utils !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyJobRunnerService.if
- **Scope:** instance
- **LLM Call Syntax:** `myJobRunnerService.if(jobDefinitionRegistry);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyJobRunnerService.if
- **Scope:** instance
- **LLM Call Syntax:** `myJobRunnerService.if(typeof jobDefinitionRegistry !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyJobRunnerService.if
- **Scope:** instance
- **LLM Call Syntax:** `myJobRunnerService.if(typeof jobDefinitionRegistry.getDefinition !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: JobExecutor
**File Path:** `JobRunnerLib/src/JobQueue.js`
**Constructor Usage:** `const instance = new JobExecutor();`
**Description:** Core job queue service for managing long-running tasks with automatic
             state persistence and resumption via triggers.


@requires GasResilienceLib - TimeoutException class
/

import { TimeoutException } from '@GasResilienceLib';
import { QueueStateManager } from './QueueStateManager';
import { QueuePersistenceHandler } from './internal/QueuePersistenceHandler';
import { QueueProgressTracker } from './internal/QueueProgressTracker';
import { JobTriggerManager } from './internal/managers/JobRunnerTriggerManager.js';
import { JobStateManager } from './internal/managers/JobRunnerStateManager.js';

export { JobTriggerManager, JobStateManager };

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
Decorates a generator with execution time limits.
@param {Generator} generator Target generator to monitor.
@param {number} maxDuration Maximum execution time in milliseconds.
@param {number} startTime Unix timestamp of execution start.
@yields {*} Values from the original generator.
@throws {TimeoutException} If `now() - startTime >= maxDuration`.
/
function* withTimeout(generator, maxDuration, startTime) {
  let next = generator.next();
  while (!next.done) {
    if (new Date().getTime() - startTime >= maxDuration) {
      throw new TimeoutException(`Timeout of ${maxDuration}ms exceeded`);
    }
    yield next.value;
    next = generator.next();
  }
  // Return the final return value from the generator
  return next.value;
}

// ===================================================================
// SPECIALIZED HANDLERS FOR MyJobQueue
// ===================================================================

/**
Handles the low-level execution and monitoring of job generators.
@private
@class

### Raw JSDoc Context:
```javascript
/**
 * @file JobRunnerLib/src/JobQueue.js
 * @description Core job queue service for managing long-running tasks with automatic
 *              state persistence and resumption via triggers.
 * @version 2.1 - Removed immer dependency (using native spread)
 *
 * @requires GasResilienceLib - TimeoutException class
 */

import { TimeoutException } from '@GasResilienceLib';
import { QueueStateManager } from './QueueStateManager';
import { QueuePersistenceHandler } from './internal/QueuePersistenceHandler';
import { QueueProgressTracker } from './internal/QueueProgressTracker';
import { JobTriggerManager } from './internal/managers/JobRunnerTriggerManager.js';
import { JobStateManager } from './internal/managers/JobRunnerStateManager.js';

export { JobTriggerManager, JobStateManager };

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Decorates a generator with execution time limits.
 * @param {Generator} generator Target generator to monitor.
 * @param {number} maxDuration Maximum execution time in milliseconds.
 * @param {number} startTime Unix timestamp of execution start.
 * @yields {*} Values from the original generator.
 * @throws {TimeoutException} If `now() - startTime >= maxDuration`.
 */
function* withTimeout(generator, maxDuration, startTime) {
  let next = generator.next();
  while (!next.done) {
    if (new Date().getTime() - startTime >= maxDuration) {
      throw new TimeoutException(`Timeout of ${maxDuration}ms exceeded`);
    }
    yield next.value;
    next = generator.next();
  }
  // Return the final return value from the generator
  return next.value;
}

// ===================================================================
// SPECIALIZED HANDLERS FOR MyJobQueue
// ===================================================================

/**
 * Handles the low-level execution and monitoring of job generators.
 * @private
 * @class
 */
```

<br>

## CLASS: JobQueue
**File Path:** `JobRunnerLib/src/JobQueue.js`
**Constructor Usage:** `const instance = new JobQueue();`
**Description:** @param {Object} logger Logger instance.
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

  /**
Executes job logic with interruption and persistence support.
@param {Function} handler Generator-based job function.
@param {Object} parameters Job context and resume state.
@param {number} startTime Execution start timestamp.
@param {number} maxDuration Timeout threshold.
@returns {{done: boolean, value?: *, cancelled?: boolean}} Execution outcome.
@throws {Error} If handler is not a generator.
@throws {TimeoutException} Captured internally to trigger state save and resume.
/
  execute(handler, parameters, startTime, maxDuration) {
    // JRL-H001: Check if job was cancelled before starting
    if (this._stateManager.isCancelled()) {
      this._logger.info(`Job ${this._stateManager.jobName} was cancelled, aborting execution`);
      this._stateManager.releaseLock();
      return { done: true, cancelled: true };
    }

    // Calculate total if not present in resume state
    // NOTE: This section references application-specific code that should be
    // injected by the consuming application through the jobHandlerRegistryCallback
    if (parameters.jobDefinition && parameters.jobDefinition.iterationLevels) {
      // Initialize resumeState immutably if not present
      if (!parameters.resumeState) {
        parameters.resumeState = {};
      }

      if (!parameters.resumeState.total || parameters.resumeState.total === 0) {
        this._logger.debug(`[JOB] Calculating total number of elements...`);

        // The services object should be provided by the consuming application
        // through the parameters
        if (parameters.services) {
          const total = this._calculateExactTotal(
            parameters.jobDefinition.iterationLevels,
            parameters.services
          );

          // OPTIMIZATION: Use native spread to update state immutably
          parameters.resumeState = {
            ...parameters.resumeState,
            total: total
          };

          this._logger.info(`[JOB] Exact total elements to process: ${total}`);
        }
      }
    }

    const generator = handler(parameters);
    if (!generator || typeof generator.next !== 'function') {
      throw new Error(`The handler for job ${this._stateManager.jobName} is not a valid generator`);
    }

    // Wrap the generator with timeout check
    const generatorWithTimeout = withTimeout(generator, maxDuration, startTime);

    let result = null,
      progress = null,
      _done = false;

    try {
      // Manually iterate to capture both yielded values and return value
      let next = generatorWithTimeout.next();

      while (!next.done) {
        // JRL-H001: Check for cancellation during execution
        if (this._stateManager.isCancelled()) {
          this._logger.info(`Job ${this._stateManager.jobName} cancelled during execution`);
          this._stateManager.releaseLock();
          this._triggerManager.deleteExistingTriggers();
          return { done: true, cancelled: true };
        }

        progress = next.value;
        if (progress) {
          this._stateManager.saveProgress({
            completed: false,
            percentage: progress.percentage || 0,
            timestamp: new Date().getTime()
          });

          // Notify monitor of progress update (optional - uses optional chaining)
          const monitor = parameters.services?.monitor;
          if (monitor && typeof monitor.updateProgress === 'function') {
            monitor.updateProgress(
              this._stateManager.jobName,
              progress.percentage || 0,
              progress.message || ''
            );
          }
        }

        next = generatorWithTimeout.next();
      }

      // Capture the final return value from the generator
      // Use next.value if it exists (even if falsy), otherwise fall back to progress
      result = next.value !== undefined ? next.value : progress;
      // JRL-H006, JRL-H007: Batch state updates into single operation
      this._stateManager.releaseLock(); // JRL-C001: Release lock on completion
      this._stateManager.batchSave({
        state: JobStateManager.STATE_COMPLETED,
        progress: {
          completed: true,
          percentage: 100,
          timestamp: new Date().getTime()
        }
      });
      this._logger.info(`Job ${this._stateManager.jobName} completed successfully`);
      return { done: true, value: result };
    } catch (error) {
      // Handle timeout separately from other errors
      if (error instanceof TimeoutException) {
        this._logger.info(
          `Interrupting job ${this._stateManager.jobName} due to timeout. State saved.`
        );
        // JRL-H006, JRL-H007: Batch state updates into single operation
        this._stateManager.releaseLock(); // JRL-C001: Release lock when suspending
        this._stateManager.batchSave({
          state: 'to_resume',
          resumeState: progress,
          progress: {
            completed: false,
            percentage: progress?.percentage || 0,
            timestamp: new Date().getTime()
          }
        });
        this._triggerManager.createResumeTrigger();
        return { done: false };
      }

      // JRL-C003: Complete error cleanup for non-timeout errors
      this._logger.error(`Error in job ${this._stateManager.jobName}: ${error.message}`);
      // JRL-H006, JRL-H007: Batch state updates into single operation
      this._stateManager.releaseLock();
      this._stateManager.batchSave({
        state: 'error',
        progress: {
          completed: false,
          percentage: progress?.percentage || 0,
          timestamp: new Date().getTime(),
          error: error.message
        }
      });
      // Re-throw the error after cleanup
      throw error;
    }
  }
}

// ===================================================================
// FACADE: MyJobQueue
// ===================================================================

/**
High-level API for job registration, execution, and lifecycle management.
@class

### Raw JSDoc Context:
```javascript
/**
   * @param {Object} logger Logger instance.
   * @param {JobStateManager} stateManager Persistence and lock manager.
   * @param {JobTriggerManager} triggerManager Resume trigger controller.
   */
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
  execute(handler, parameters, startTime, maxDuration) {
    // JRL-H001: Check if job was cancelled before starting
    if (this._stateManager.isCancelled()) {
      this._logger.info(`Job ${this._stateManager.jobName} was cancelled, aborting execution`);
      this._stateManager.releaseLock();
      return { done: true, cancelled: true };
    }

    // Calculate total if not present in resume state
    // NOTE: This section references application-specific code that should be
    // injected by the consuming application through the jobHandlerRegistryCallback
    if (parameters.jobDefinition && parameters.jobDefinition.iterationLevels) {
      // Initialize resumeState immutably if not present
      if (!parameters.resumeState) {
        parameters.resumeState = {};
      }

      if (!parameters.resumeState.total || parameters.resumeState.total === 0) {
        this._logger.debug(`[JOB] Calculating total number of elements...`);

        // The services object should be provided by the consuming application
        // through the parameters
        if (parameters.services) {
          const total = this._calculateExactTotal(
            parameters.jobDefinition.iterationLevels,
            parameters.services
          );

          // OPTIMIZATION: Use native spread to update state immutably
          parameters.resumeState = {
            ...parameters.resumeState,
            total: total
          };

          this._logger.info(`[JOB] Exact total elements to process: ${total}`);
        }
      }
    }

    const generator = handler(parameters);
    if (!generator || typeof generator.next !== 'function') {
      throw new Error(`The handler for job ${this._stateManager.jobName} is not a valid generator`);
    }

    // Wrap the generator with timeout check
    const generatorWithTimeout = withTimeout(generator, maxDuration, startTime);

    let result = null,
      progress = null,
      _done = false;

    try {
      // Manually iterate to capture both yielded values and return value
      let next = generatorWithTimeout.next();

      while (!next.done) {
        // JRL-H001: Check for cancellation during execution
        if (this._stateManager.isCancelled()) {
          this._logger.info(`Job ${this._stateManager.jobName} cancelled during execution`);
          this._stateManager.releaseLock();
          this._triggerManager.deleteExistingTriggers();
          return { done: true, cancelled: true };
        }

        progress = next.value;
        if (progress) {
          this._stateManager.saveProgress({
            completed: false,
            percentage: progress.percentage || 0,
            timestamp: new Date().getTime()
          });

          // Notify monitor of progress update (optional - uses optional chaining)
          const monitor = parameters.services?.monitor;
          if (monitor && typeof monitor.updateProgress === 'function') {
            monitor.updateProgress(
              this._stateManager.jobName,
              progress.percentage || 0,
              progress.message || ''
            );
          }
        }

        next = generatorWithTimeout.next();
      }

      // Capture the final return value from the generator
      // Use next.value if it exists (even if falsy), otherwise fall back to progress
      result = next.value !== undefined ? next.value : progress;
      // JRL-H006, JRL-H007: Batch state updates into single operation
      this._stateManager.releaseLock(); // JRL-C001: Release lock on completion
      this._stateManager.batchSave({
        state: JobStateManager.STATE_COMPLETED,
        progress: {
          completed: true,
          percentage: 100,
          timestamp: new Date().getTime()
        }
      });
      this._logger.info(`Job ${this._stateManager.jobName} completed successfully`);
      return { done: true, value: result };
    } catch (error) {
      // Handle timeout separately from other errors
      if (error instanceof TimeoutException) {
        this._logger.info(
          `Interrupting job ${this._stateManager.jobName} due to timeout. State saved.`
        );
        // JRL-H006, JRL-H007: Batch state updates into single operation
        this._stateManager.releaseLock(); // JRL-C001: Release lock when suspending
        this._stateManager.batchSave({
          state: 'to_resume',
          resumeState: progress,
          progress: {
            completed: false,
            percentage: progress?.percentage || 0,
            timestamp: new Date().getTime()
          }
        });
        this._triggerManager.createResumeTrigger();
        return { done: false };
      }

      // JRL-C003: Complete error cleanup for non-timeout errors
      this._logger.error(`Error in job ${this._stateManager.jobName}: ${error.message}`);
      // JRL-H006, JRL-H007: Batch state updates into single operation
      this._stateManager.releaseLock();
      this._stateManager.batchSave({
        state: 'error',
        progress: {
          completed: false,
          percentage: progress?.percentage || 0,
          timestamp: new Date().getTime(),
          error: error.message
        }
      });
      // Re-throw the error after cleanup
      throw error;
    }
  }
}

// ===================================================================
// FACADE: MyJobQueue
// ===================================================================

/**
 * High-level API for job registration, execution, and lifecycle management.
 * @class
 */
```

<br>

## CLASS: JobDefinitionRegistry
**File Path:** `JobRunnerLib/src/JobDefinitionRegistry.js`
**Constructor Usage:** `const instance = new JobDefinitionRegistry();`
**Description:** Service for dynamic management of job definition registry.

/

import { Registry } from '@CoreUtilsLib';

/**
Centralized registry for dynamic job definition management.
Uses the shared {@link Registry} primitive (CoreUtilsLib) for Map-backed storage;
all job-specific validation, logging, and messages remain here.

@class

### Raw JSDoc Context:
```javascript
/**
 * @file JobRunnerLib/src/JobDefinitionRegistry.js
 * @description Service for dynamic management of job definition registry.
 * @version 2.0
 */

import { Registry } from '@CoreUtilsLib';

/**
 * Centralized registry for dynamic job definition management.
 * Uses the shared {@link Registry} primitive (CoreUtilsLib) for Map-backed storage;
 * all job-specific validation, logging, and messages remain here.
 *
 * @class
 */
```

<br>

## CLASS: QueueProgressTracker
**File Path:** `JobRunnerLib/src/internal/QueueProgressTracker.js`
**Constructor Usage:** `const instance = new QueueProgressTracker();`
**Description:** Tracks job progress and calculates exact total actions from iteration levels.
Extracted from JobStateManager and JobExecutor for improved separation of concerns.

### Raw JSDoc Context:
```javascript
/**
 * @file JobRunnerLib/src/QueueProgressTracker.js
 * @description Tracks job progress and calculates exact total actions from iteration levels.
 * Extracted from JobStateManager and JobExecutor for improved separation of concerns.
 */
```

### Methods of QueueProgressTracker

#### METHOD: QueueProgressTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.if(!jobName || typeof jobName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueProgressTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.if(!propertiesService || typeof propertiesService !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueProgressTracker.saveProgress
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.saveProgress(progress);`
- **Pure JSDoc:**
```javascript
/** Method saveProgress */
```
---
#### METHOD: QueueProgressTracker.reset
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.reset();`
- **Pure JSDoc:**
```javascript
/** Method reset */
```
---
#### METHOD: QueueProgressTracker.calculateRecursively
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.calculateRecursively(levelIndex, currentContext);`
- **Pure JSDoc:**
```javascript
/** Method calculateRecursively */
```
---
#### METHOD: QueueProgressTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.if(levelIndex >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueProgressTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.if(levelIndex);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueProgressTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.if(typeof level.countGenerator !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueProgressTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.if(typeof level.elementsGenerator !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueueProgressTracker.for
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.for(const element of filteredElements);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: QueueProgressTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `queueProgressTracker.if(!levels || levels.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: QueuePersistenceHandler
**File Path:** `JobRunnerLib/src/internal/QueuePersistenceHandler.js`
**Constructor Usage:** `const instance = new QueuePersistenceHandler();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of QueuePersistenceHandler

#### METHOD: QueuePersistenceHandler.LARGE_STATE_THRESHOLD
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.LARGE_STATE_THRESHOLD();`
- **Pure JSDoc:**
```javascript
/** Method LARGE_STATE_THRESHOLD */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(!jobName || typeof jobName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(!propertiesService || typeof propertiesService !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(!this._driveService);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(stateSize > QueuePersistenceHandler.LARGE_STATE_THRESHOLD);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.catch(_driveError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: QueuePersistenceHandler.batchSave
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.batchSave(updates);`
- **Pure JSDoc:**
```javascript
/** Method batchSave */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(updates.resumeState !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(updates.progress !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(updates.config !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(updates.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(updates.state !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.saveResumeState
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.saveResumeState(state);`
- **Pure JSDoc:**
```javascript
/** Method saveResumeState */
```
---
#### METHOD: QueuePersistenceHandler.loadResumeState
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.loadResumeState();`
- **Pure JSDoc:**
```javascript
/** Method loadResumeState */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(!stateValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(!driveApp);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(existingFileId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(!driveApp);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(!driveApp);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.saveConfiguration
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.saveConfiguration(config);`
- **Pure JSDoc:**
```javascript
/** Method saveConfiguration */
```
---
#### METHOD: QueuePersistenceHandler.loadConfiguration
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.loadConfiguration();`
- **Pure JSDoc:**
```javascript
/** Method loadConfiguration */
```
---
#### METHOD: QueuePersistenceHandler.saveType
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.saveType(type);`
- **Pure JSDoc:**
```javascript
/** Method saveType */
```
---
#### METHOD: QueuePersistenceHandler.loadType
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.loadType();`
- **Pure JSDoc:**
```javascript
/** Method loadType */
```
---
#### METHOD: QueuePersistenceHandler.reset
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.reset();`
- **Pure JSDoc:**
```javascript
/** Method reset */
```
---
#### METHOD: QueuePersistenceHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.if(stateFileId && driveApp);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: QueuePersistenceHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: QueuePersistenceHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `queuePersistenceHandler.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: CapturingLogger
**File Path:** `JobRunnerLib/src/internal/CapturingLogger.js`
**Constructor Usage:** `const instance = new CapturingLogger();`
**Description:** Proxy logger that captures all log messages while forwarding to a real logger

/

/**
Transparent proxy logger that captures and buffers log messages for post-execution analysis.

Intercepts all log calls (debug, info, warn, error), stores them in a memory buffer with timestamps
and levels, and forwards them to an underlying LoggerService. Optimized for background job logging
and UI replay.

@class

### Raw JSDoc Context:
```javascript
/**
 * @file JobRunnerLib/src/CapturingLogger.js
 * @description Proxy logger that captures all log messages while forwarding to a real logger
 * @version 1.0 - Initial implementation
 */

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

### Methods of CapturingLogger

#### METHOD: CapturingLogger.if
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.if(!realLogger);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CapturingLogger.for
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.for(const method of requiredMethods);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: CapturingLogger.if
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.if(typeof realLogger[method] !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CapturingLogger.if
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.if(typeof maxBufferSize !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CapturingLogger.if
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.if(this._capturedLogs.length > this._maxBufferSize);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: CapturingLogger.getCapturedLogs
- **Scope:** instance
- **LLM Call Syntax:** `const result = capturingLogger.getCapturedLogs();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves raw capture buffer.
   * @returns {Array<{level: string, timestamp: Date, message: string, context: Object|null}>} Chronological logs.
   */
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
#### METHOD: CapturingLogger.if
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.if(entry.context);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: CapturingLogger.if
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.if(entry.context);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CapturingLogger.clearCapturedLogs
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.clearCapturedLogs();`
- **Pure JSDoc:**
```javascript
/**
   * Clears internal memory buffer. Does not affect realLogger.
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
#### METHOD: CapturingLogger.if
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.if(typeof this._realLogger.setLevel);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: CapturingLogger.if
- **Scope:** instance
- **LLM Call Syntax:** `capturingLogger.if(typeof this._realLogger.getLevel);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: JobTriggerManager
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerTriggerManager.js`
**Constructor Usage:** `const instance = new JobTriggerManager();`
**Description:** Manager for automatic resume triggers and trigger context discovery.

### Raw JSDoc Context:
```javascript
/**
 * @file JobRunnerLib/src/managers/JobRunnerTriggerManager.js
 * @description Manager for automatic resume triggers and trigger context discovery.
 */
```

### Methods of JobTriggerManager

#### METHOD: JobTriggerManager.createResumeTrigger
- **Scope:** instance
- **LLM Call Syntax:** `jobTriggerManager.createResumeTrigger();`
- **Pure JSDoc:**
```javascript
/** Method createResumeTrigger */
```
---
#### METHOD: JobTriggerManager.deleteExistingTriggers
- **Scope:** instance
- **LLM Call Syntax:** `jobTriggerManager.deleteExistingTriggers();`
- **Pure JSDoc:**
```javascript
/** Method deleteExistingTriggers */
```
---
#### METHOD: JobTriggerManager.if
- **Scope:** instance
- **LLM Call Syntax:** `jobTriggerManager.if(triggerId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: JobRunnerTriggerManager
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerTriggerManager.js`
**Constructor Usage:** `const instance = new JobRunnerTriggerManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of JobRunnerTriggerManager

#### METHOD: JobRunnerTriggerManager.catch
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerTriggerManager.catch(_error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: JobStateManager
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerStateManager.js`
**Constructor Usage:** `const instance = new JobStateManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of JobStateManager

#### METHOD: JobStateManager.STATE_RUNNING
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.STATE_RUNNING();`
- **Pure JSDoc:**
```javascript
/** Method STATE_RUNNING */
```
---
#### METHOD: JobStateManager.STATE_COMPLETED
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.STATE_COMPLETED();`
- **Pure JSDoc:**
```javascript
/** Method STATE_COMPLETED */
```
---
#### METHOD: JobStateManager.STATE_CANCELLED
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.STATE_CANCELLED();`
- **Pure JSDoc:**
```javascript
/** Method STATE_CANCELLED */
```
---
#### METHOD: JobStateManager.STATE_FAILED
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.STATE_FAILED();`
- **Pure JSDoc:**
```javascript
/** Method STATE_FAILED */
```
---
#### METHOD: JobStateManager.STATE_PENDING
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.STATE_PENDING();`
- **Pure JSDoc:**
```javascript
/** Method STATE_PENDING */
```
---
#### METHOD: JobStateManager.LOCK_RETRY_DELAY_MS
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.LOCK_RETRY_DELAY_MS();`
- **Pure JSDoc:**
```javascript
/** Method LOCK_RETRY_DELAY_MS */
```
---
#### METHOD: JobStateManager.LARGE_STATE_THRESHOLD
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.LARGE_STATE_THRESHOLD();`
- **Pure JSDoc:**
```javascript
/** Method LARGE_STATE_THRESHOLD */
```
---
#### METHOD: JobStateManager.reset
- **Scope:** instance
- **LLM Call Syntax:** `jobStateManager.reset();`
- **Pure JSDoc:**
```javascript
/** Method reset */
```
---
<br>

## CLASS: JobRunnerStateManager
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerStateManager.js`
**Constructor Usage:** `const instance = new JobRunnerStateManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of JobRunnerStateManager

#### METHOD: JobRunnerStateManager.getStatus
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerStateManager.getStatus(jobName);`
- **Pure JSDoc:**
```javascript
/** Method getStatus */
```
---
#### METHOD: JobRunnerStateManager.resetJob
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerStateManager.resetJob(jobName);`
- **Pure JSDoc:**
```javascript
/** Method resetJob */
```
---
#### METHOD: JobRunnerStateManager.cancelJob
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerStateManager.cancelJob(jobName);`
- **Pure JSDoc:**
```javascript
/** Method cancelJob */
```
---
#### METHOD: JobRunnerStateManager.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerStateManager.if(!jobName || typeof jobName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: JobRunnerLogCapturer
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerLogCapturer.js`
**Constructor Usage:** `const instance = new JobRunnerLogCapturer();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of JobRunnerLogCapturer

#### METHOD: JobRunnerLogCapturer.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer.if(!loggingConfig.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerLogCapturer.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer.if(loggingConfig.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerLogCapturer.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer.if(loggingConfig.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerLogCapturer.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer.if(logCount);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerLogCapturer.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer.if(loggingConfig.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerLogCapturer.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer.if(loggingConfig.target);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerLogCapturer.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer.if(folderId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerLogCapturer.catch
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerLogCapturer.catch(driveError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: JobRunnerExecutionController
**File Path:** `JobRunnerLib/src/internal/managers/JobRunnerExecutionController.js`
**Constructor Usage:** `const instance = new JobRunnerExecutionController();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of JobRunnerExecutionController

#### METHOD: JobRunnerExecutionController.run
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.run(jobName, jobType, parameters, jobHandlerRegistryCallback, forceRestart, maxDurationMs, loggingConfig);`
- **Pure JSDoc:**
```javascript
/** Method run */
```
---
#### METHOD: JobRunnerExecutionController.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.if(loggingConfig);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerExecutionController.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.if(jobDefinition);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerExecutionController.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.if(result !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerExecutionController.catch
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.catch(err);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: JobRunnerExecutionController.catch
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.catch(logError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: JobRunnerExecutionController.resume
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.resume(jobName, jobHandlerRegistryCallback, maxDurationMs);`
- **Pure JSDoc:**
```javascript
/** Method resume */
```
---
#### METHOD: JobRunnerExecutionController.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.if(!jobName);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerExecutionController.if
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.if(triggerId);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: JobRunnerExecutionController.catch
- **Scope:** instance
- **LLM Call Syntax:** `jobRunnerExecutionController.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

