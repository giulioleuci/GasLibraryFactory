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
export class JobExecutor {
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
export class JobQueue {
  /** @returns {number} 60000ms default delay between timeout and resume. */
  static get DEFAULT_TRIGGER_DELAY_MS() {
    return 60 * 1000;
  }

  /**
   * @param {Object} logger Logger instance (info, debug, error).
   * @param {Object} utils UtilitiesService (sleep).
   * @param {Object} propertiesService PropertiesService for state persistence.
   * @param {Object} triggerService TriggerService for resume scheduling.
   * @param {Object} lockService LockService for concurrency control.
   * @throws {Error} If any dependency is null or lacks required methods.
   */
  constructor(logger, utils, propertiesService, triggerService, lockService) {
    // JRL-H003: Add parameter validation
    if (!logger || typeof logger !== 'object') {
      throw new Error('MyJobQueue: logger is required and must be an object');
    }
    if (
      typeof logger.info !== 'function' ||
      typeof logger.debug !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error('MyJobQueue: logger must have info, debug, and error methods');
    }

    if (!utils || typeof utils !== 'object') {
      throw new Error('MyJobQueue: utils is required and must be an object');
    }

    if (!propertiesService || typeof propertiesService !== 'object') {
      throw new Error('MyJobQueue: propertiesService is required and must be an object');
    }

    if (!triggerService || typeof triggerService !== 'object') {
      throw new Error('MyJobQueue: triggerService is required and must be an object');
    }

    if (!lockService || typeof lockService !== 'object') {
      throw new Error('MyJobQueue: lockService is required and must be an object');
    }

    this._logger = logger;
    this._utils = utils;
    this._propertiesService = propertiesService;
    this._triggerService = triggerService;
    this._lockService = lockService;
    this._maxExecutionDuration = 25 * 60 * 1000; // 25 minutes default
    this._triggerDelayMs = JobQueue.DEFAULT_TRIGGER_DELAY_MS; // JRL-M009: Configurable trigger delay
    this._maxRetries = null; // JRL-HIGH-001: null = infinite retries (default behavior)
    this._onFailureCallback = null; // JRL-HIGH-001: Callback for job failure
    this._jobHandlers = {};
    this._config = {};
  }

  /**
   * Configures global execution timeout.
   * @param {number} durationMs Max execution time.
   * @returns {JobQueue} Current instance.
   * @throws {Error} If durationMs is not positive.
   */
  setMaxDuration(durationMs) {
    // JRL-H003: Add parameter validation
    if (typeof durationMs !== 'number' || durationMs <= 0) {
      throw new Error('JobQueue.setMaxDuration: durationMs must be a positive number');
    }

    this._maxExecutionDuration = durationMs;
    this._config.maxExecutionDuration = durationMs;
    return this;
  }

  /**
   * Configures base delay for resume triggers.
   * @param {number} delayMs Delay in milliseconds.
   * @returns {JobQueue} Current instance.
   * @throws {Error} If delayMs is not positive.
   */
  setTriggerDelay(delayMs) {
    if (typeof delayMs !== 'number' || delayMs <= 0) {
      throw new Error('JobQueue.setTriggerDelay: delayMs must be a positive number');
    }

    this._triggerDelayMs = delayMs;
    this._config.triggerDelayMs = delayMs;
    return this;
  }

  /**
   * Configures retry limit for failed/timed-out jobs.
   * @param {number|null} maxRetries Integer limit or null for infinite.
   * @returns {JobQueue} Current instance.
   * @throws {Error} If maxRetries is invalid.
   */
  setMaxRetries(maxRetries) {
    if (
      maxRetries !== null &&
      (typeof maxRetries !== 'number' || maxRetries < 0 || !Number.isInteger(maxRetries))
    ) {
      throw new Error('JobQueue.setMaxRetries: maxRetries must be a non-negative integer or null');
    }

    this._maxRetries = maxRetries;
    this._config.maxRetries = maxRetries;
    return this;
  }

  /**
   * Registers a terminal failure listener.
   * @param {Function|null} callback Function(error, jobState).
   * @returns {JobQueue} Current instance.
   */
  setOnFailure(callback) {
    if (callback !== null && typeof callback !== 'function') {
      throw new Error('JobQueue.setOnFailure: callback must be a function or null');
    }

    this._onFailureCallback = callback;
    return this;
  }

  /**
   * Restores queue configuration from a persistence object.
   * @param {Object} savedConfig Configuration snapshot.
   * @returns {JobQueue} Current instance.
   */
  applyConfiguration(savedConfig) {
    if (savedConfig) {
      this._config = { ...this._config, ...savedConfig };
      if (savedConfig.maxExecutionDuration) {
        this._maxExecutionDuration = savedConfig.maxExecutionDuration;
      }
      if (savedConfig.triggerDelayMs) {
        this._triggerDelayMs = savedConfig.triggerDelayMs;
      }
      // JRL-HIGH-001: Restore maxRetries configuration
      if (savedConfig.maxRetries !== undefined) {
        this._maxRetries = savedConfig.maxRetries;
      }
    }
    return this;
  }

  /**
   * Maps a job type to a generator function.
   * @param {string} jobType Unique identifier.
   * @param {Function} handler Generator function: `function*(params)`.
   * @returns {JobQueue} Current instance.
   * @throws {Error} If handler is not a function.
   */
  registerJobHandler(jobType, handler) {
    if (typeof handler !== 'function') {
      throw new Error(`Handler for ${jobType} must be a function`);
    }
    this._jobHandlers[jobType] = handler;
    return this;
  }

  /**
   * Orchestrates job execution, state loading, and retry/timeout logic.
   *
   * @param {string} jobName Unique instance identifier (used for state key).
   * @param {string} jobType Registered handler type.
   * @param {Object} [parameters={}] Input data and context.
   * @param {boolean} [forceRestart=false] If true, purges existing state/locks before start.
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
  execute(jobName, jobType, parameters = {}, forceRestart = false) {
    const stateManager = new JobStateManager(
      jobName,
      this._propertiesService,
      this._utils,
      this._lockService
    );
    // JRL-M009: Pass configurable trigger delay to JobTriggerManager
    const triggerManager = new JobTriggerManager(
      jobName,
      this._propertiesService,
      this._triggerService,
      this._triggerDelayMs
    );
    const executor = new JobExecutor(this._logger, stateManager, triggerManager);

    try {
      // JRL-C001: Handle forceRestart before acquiring lock
      if (forceRestart) {
        this._logger.debug(`Forcing restart for ${jobName}.`);
        this.resetJobState(jobName);
        stateManager.releaseLock(); // Ensure lock is cleared
      }

      // JRL-C001: Use atomic lock acquisition to prevent race conditions
      if (!stateManager.tryAcquireRunning()) {
        this._logger.warn(`Job ${jobName} already running or lock acquisition failed.`);
        return null;
      }

      // Save job metadata if this is first run
      const jobState = stateManager.getState();
      if (!jobState || forceRestart) {
        stateManager.saveType(jobType);
        stateManager.saveConfiguration(this._config);
      }

      this._logger.info(`Starting job ${jobName} (type: ${jobType})`);

      const savedState = stateManager.loadResumeState();
      if (savedState && !forceRestart) {
        parameters.resumeState = savedState;
        this._logger.info(`Resuming job ${jobName} from saved state.`);
      }

      const handler = this._jobHandlers[jobType];
      if (!handler) {
        throw new Error(`No handler registered for ${jobType}`);
      }

      const executionResult = executor.execute(
        handler,
        parameters,
        new Date().getTime(),
        this._maxExecutionDuration
      );

      // JRL-HIGH-001: Handle job completion or timeout with retry logic
      if (executionResult.done) {
        // Job completed successfully
        this._logger.info(`Job ${jobName} completed successfully`);

        // Reset retry count on successful completion
        stateManager.resetRetryCount();

        // Return the job result
        return executionResult.value;
      } else {
        // Job timed out - check if we should retry
        const retryCount = stateManager.getRetryCount();

        // Check if we've exceeded max retries
        if (this._maxRetries !== null && retryCount >= this._maxRetries) {
          this._logger.error(
            `Job ${jobName} exceeded max retries (${this._maxRetries}). Marking as failed.`
          );

          // Save failure information
          stateManager.saveFailureInfo({
            reason: 'MAX_RETRIES_EXCEEDED',
            retryCount: retryCount,
            timestamp: new Date().getTime()
          });

          // Set state to failed
          stateManager.setState(JobStateManager.STATE_FAILED);

          // Delete any pending triggers
          triggerManager.deleteExistingTriggers();

          // Release the lock
          stateManager.releaseLock();

          // Call failure callback if configured
          if (this._onFailureCallback) {
            try {
              this._onFailureCallback(new Error('Max retries exceeded'), {
                name: jobName,
                type: jobType,
                retryCount: retryCount,
                state: stateManager.getState()
              });
            } catch (callbackError) {
              this._logger.error(`Error in onFailure callback: ${callbackError.message}`);
            }
          }

          return null;
        }

        // Increment retry count
        const newRetryCount = stateManager.incrementRetryCount();
        this._logger.info(
          `Job ${jobName} timed out. Retry ${newRetryCount}${this._maxRetries !== null ? ' of ' + this._maxRetries : ''}`
        );

        // Calculate exponential backoff delay
        // Base delay is the configured trigger delay, multiplied by 2^retryCount
        // With a cap at 30 minutes to avoid very long delays
        const baseDelay = this._triggerDelayMs || JobQueue.DEFAULT_TRIGGER_DELAY_MS;
        const exponentialDelay = Math.min(
          baseDelay * Math.pow(2, newRetryCount - 1),
          30 * 60 * 1000
        );

        this._logger.debug(`Scheduling retry in ${exponentialDelay}ms (exponential backoff)`);

        // Create resume trigger with exponential backoff delay
        const triggerManagerWithBackoff = new JobTriggerManager(
          jobName,
          this._propertiesService,
          this._triggerService,
          exponentialDelay
        );
        triggerManagerWithBackoff.createResumeTrigger();

        return null;
      }
    } catch (error) {
      this._logger.error(`Fatal error in job ${jobName}: ${error.stack}`);

      // JRL-HIGH-001: On fatal error, increment retry count
      const retryCount = stateManager.incrementRetryCount();

      // Save failure information
      stateManager.saveFailureInfo({
        reason: 'FATAL_ERROR',
        error: error.message,
        stack: error.stack,
        retryCount: retryCount,
        timestamp: new Date().getTime()
      });

      stateManager.setState(JobStateManager.STATE_FAILED);
      stateManager.releaseLock(); // JRL-C001: Release lock on error

      // Call failure callback if this was the final retry
      if (this._maxRetries !== null && retryCount >= this._maxRetries && this._onFailureCallback) {
        try {
          this._onFailureCallback(error, {
            name: jobName,
            type: jobType,
            retryCount: retryCount,
            state: stateManager.getState()
          });
        } catch (callbackError) {
          this._logger.error(`Error in onFailure callback: ${callbackError.message}`);
        }
      }

      throw error;
    }
  }

  /**
   * Purges all state and triggers associated with a job instance.
   * @param {string} jobName Unique instance identifier.
   * @returns {boolean} True if successful.
   */
  resetJobState(jobName) {
    const stateManager = new JobStateManager(
      jobName,
      this._propertiesService,
      this._utils,
      this._lockService
    );
    // JRL-M009: Pass configurable trigger delay to JobTriggerManager
    const triggerManager = new JobTriggerManager(
      jobName,
      this._propertiesService,
      this._triggerService,
      this._triggerDelayMs
    );
    triggerManager.deleteExistingTriggers();
    stateManager.reset();
    this._logger.info(`State of job ${jobName} reset.`);
    return true;
  }

  /**
   * Signals a job for termination. State is checked at next progress pulse.
   * @param {string} jobName Unique instance identifier.
   * @returns {boolean} True if cancellation signal was set.
   */
  cancelJob(jobName) {
    const stateManager = new JobStateManager(
      jobName,
      this._propertiesService,
      this._utils,
      this._lockService
    );
    // JRL-M009: Pass configurable trigger delay to JobTriggerManager
    const triggerManager = new JobTriggerManager(
      jobName,
      this._propertiesService,
      this._triggerService,
      this._triggerDelayMs
    );

    const currentState = stateManager.getState();

    // Can only cancel jobs that are running or waiting to resume
    if (
      !currentState ||
      currentState === JobStateManager.STATE_COMPLETED ||
      currentState === JobStateManager.STATE_CANCELLED
    ) {
      this._logger.warn(`Cannot cancel job ${jobName} in state: ${currentState || 'not_started'}`);
      return false;
    }

    // Set state to cancelled
    stateManager.batchSave({
      state: JobStateManager.STATE_CANCELLED,
      progress: {
        completed: false,
        cancelled: true,
        timestamp: new Date().getTime()
      }
    });

    // Delete any pending resume triggers
    triggerManager.deleteExistingTriggers();

    // Release the lock so the job can be cleaned up
    stateManager.releaseLock();

    this._logger.info(`Job ${jobName} has been cancelled.`);
    return true;
  }

  /**
   * Retrieves live job telemetry.
   * @param {string} jobName Unique instance identifier.
   * @returns {{name: string, type: string, state: string, completed: boolean, percentage: number}}
   */
  getStatus(jobName) {
    const stateManager = new JobStateManager(
      jobName,
      this._propertiesService,
      this._utils,
      this._lockService
    );
    const jobState = stateManager.getState() || 'not_started';
    const jobType = stateManager.loadType() || 'unknown';
    const progress = this._propertiesService.getObjectProperty(stateManager._key('progress')) || {
      completed: false,
      percentage: 0
    };
    return {
      name: jobName,
      type: jobType,
      state: jobState,
      ...progress
    };
  }
}
