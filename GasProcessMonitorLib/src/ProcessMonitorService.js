/**
 * @file GasProcessMonitorLib/src/ProcessMonitorService.js
 * @description Service for managing process state with Cache and Properties persistence
 * @version 1.0.0
 */

/**
 * Enum for process/job states
 * @enum {string}
 */
export const ProcessState = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Enum for step states
 * @enum {string}
 */
export const StepState = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

/**
 * Orchestrator for tracking long-running process lifecycles, managing job states, progress metrics, and task-level auditing via tiered Cache and Properties storage.
 * @class
 */
export class ProcessMonitorService {
  /**
   * Cache key prefix for process state
   * @static
   * @type {string}
   */
  static get CACHE_PREFIX() {
    return 'PROCESS_MONITOR_';
  }

  /**
   * Properties key prefix for process state
   * @static
   * @type {string}
   */
  static get PROPS_PREFIX() {
    return 'PM_';
  }

  /**
   * Default cache expiration (6 hours in seconds)
   * @static
   * @type {number}
   */
  static get CACHE_EXPIRATION() {
    return 6 * 60 * 60;
  }

  /**
   * Initializes the monitor with diagnostic logging and multi-layer persistence services.
   * @param {Object} logger Diagnostic output interface.
   * @param {Object} cacheService GoogleApiWrapper CacheService for high-frequency updates.
   * @param {Object} propertiesService GoogleApiWrapper PropertiesService for lifecycle persistence.
   * @throws {Error} If mandatory dependencies are missing or malformed.
   */
  constructor(logger, cacheService, propertiesService) {
    // Validate dependencies
    if (!logger || typeof logger !== 'object') {
      throw new Error('ProcessMonitorService: logger is required and must be an object');
    }
    if (
      typeof logger.debug !== 'function' ||
      typeof logger.info !== 'function' ||
      typeof logger.warn !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error(
        'ProcessMonitorService: logger must have debug, info, warn, and error methods'
      );
    }
    if (!cacheService || typeof cacheService !== 'object') {
      throw new Error('ProcessMonitorService: cacheService is required and must be an object');
    }
    if (!propertiesService || typeof propertiesService !== 'object') {
      throw new Error('ProcessMonitorService: propertiesService is required and must be an object');
    }

    /**
     * Logger service
     * @private
     * @type {Object}
     */
    this._logger = logger;

    /**
     * CacheService instance
     * @private
     * @type {Object}
     */
    this._cacheService = cacheService;

    /**
     * PropertiesService instance
     * @private
     * @type {Object}
     */
    this._propertiesService = propertiesService;

    /**
     * Script-level cache (lazy-loaded)
     * @private
     * @type {Object|null}
     */
    this._cache = null;

    this._logger.debug('[ProcessMonitorService] Instance created');
  }

  /**
   * Resolves the active script-level cache instance.
   * @private
   * @returns {Object} Active cache wrapper.
   */
  _getCache() {
    if (!this._cache) {
      this._cache = this._cacheService.getScriptCache();
    }
    return this._cache;
  }

  /**
   * Generates a prefixed unique identifier for cache-based job state.
   * @private
   * @param {string} jobId Unique process identifier.
   * @returns {string} Fully qualified cache key.
   */
  _getCacheKey(jobId) {
    return `${ProcessMonitorService.CACHE_PREFIX}${jobId}`;
  }

  /**
   * Generates a prefixed unique identifier for persistent property-based job state.
   * @private
   * @param {string} jobId Unique process identifier.
   * @returns {string} Fully qualified properties key.
   */
  _getPropsKey(jobId) {
    return `${ProcessMonitorService.PROPS_PREFIX}${jobId}`;
  }

  /**
   * Synchronizes process state to tiered storage, enforcing Properties persistence only for lifecycle transitions.
   * @private
   * @param {string} jobId target process identifier.
   * @param {Object} state Serialized process metadata.
   * @param {boolean} [persistToProps=false] If true, commits state to long-term storage.
   */
  _writeState(jobId, state, persistToProps = false) {
    const stateJson = JSON.stringify(state);

    // Always write to cache
    try {
      const cache = this._getCache();
      cache.put(this._getCacheKey(jobId), stateJson, ProcessMonitorService.CACHE_EXPIRATION);
      this._logger.debug(`[ProcessMonitorService] State written to cache for job ${jobId}`);
    } catch (error) {
      this._logger.warn(`[ProcessMonitorService] Failed to write to cache: ${error.message}`);
    }

    // Optionally write to properties (only on lifecycle events)
    if (persistToProps) {
      try {
        this._propertiesService.setProperty(this._getPropsKey(jobId), stateJson);
        this._logger.debug(`[ProcessMonitorService] State written to properties for job ${jobId}`);
      } catch (error) {
        this._logger.error(
          `[ProcessMonitorService] Failed to write to properties: ${error.message}`
        );
      }
    }
  }

  /**
   * Retrieves process state using a cache-first strategy with automated Properties fallback.
   * @private
   * @param {string} jobId Unique process identifier.
   * @returns {Object|null} current process state or null if not found.
   */
  _readState(jobId) {
    // Try cache first
    try {
      const cache = this._getCache();
      const cached = cache.get(this._getCacheKey(jobId));
      if (cached) {
        this._logger.debug(`[ProcessMonitorService] State read from cache for job ${jobId}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this._logger.warn(`[ProcessMonitorService] Cache read failed: ${error.message}`);
    }

    // Fall back to properties
    try {
      const stored = this._propertiesService.getProperty(this._getPropsKey(jobId));
      if (stored) {
        this._logger.debug(`[ProcessMonitorService] State read from properties for job ${jobId}`);
        const state = JSON.parse(stored);
        // Re-populate cache for faster subsequent reads
        this._writeState(jobId, state, false);
        return state;
      }
    } catch (error) {
      this._logger.error(`[ProcessMonitorService] Properties read failed: ${error.message}`);
    }

    return null;
  }

  /**
   * Synthesizes a baseline state structure for a new monitoring context.
   * @private
   * @param {string} jobId Unique process identifier.
   * @returns {Object} Default state record.
   */
  _createInitialState(jobId) {
    return {
      jobId,
      status: ProcessState.PENDING,
      percentage: 0,
      message: '',
      startTime: null,
      endTime: null,
      error: null,
      steps: []
    };
  }

  // ===================================================================
  // PUBLIC API: Job Lifecycle
  // ===================================================================

  /**
   * Initializes monitoring for a new process, setting status to PENDING and committing to all storage tiers.
   * @param {string} jobId Unique process identifier.
   * @returns {this} Chainable monitor instance.
   * @throws {Error} If jobId is invalid.
   */
  registerJob(jobId) {
    if (!jobId || typeof jobId !== 'string') {
      throw new Error('ProcessMonitorService.registerJob: jobId must be a non-empty string');
    }

    const state = this._createInitialState(jobId);
    state.status = ProcessState.PENDING;
    state.startTime = Date.now();

    // Lifecycle event - persist to properties
    this._writeState(jobId, state, true);
    this._logger.info(`[ProcessMonitorService] Job registered: ${jobId}`);

    return this;
  }

  /**
   * Transitions a process status to RUNNING and records the start timestamp.
   * @param {string} jobId Unique process identifier.
   * @returns {this} Chainable monitor instance.
   */
  startJob(jobId) {
    const state = this._readState(jobId) || this._createInitialState(jobId);
    state.status = ProcessState.RUNNING;
    state.startTime = state.startTime || Date.now();

    // Lifecycle event - persist to properties
    this._writeState(jobId, state, true);
    this._logger.info(`[ProcessMonitorService] Job started: ${jobId}`);

    return this;
  }

  /**
   * Finalizes a successful process, setting status to COMPLETED and recording the end timestamp.
   * @param {string} jobId Unique process identifier.
   * @param {string} [message='Completed successfully'] final outcome summary.
   * @returns {this} Chainable monitor instance.
   */
  completeJob(jobId, message = 'Completed successfully') {
    const state = this._readState(jobId);
    if (!state) {
      this._logger.warn(`[ProcessMonitorService] Cannot complete unknown job: ${jobId}`);
      return this;
    }

    state.status = ProcessState.COMPLETED;
    state.percentage = 100;
    state.message = message;
    state.endTime = Date.now();

    // Lifecycle event - persist to properties
    this._writeState(jobId, state, true);
    this._logger.info(`[ProcessMonitorService] Job completed: ${jobId}`);

    return this;
  }

  // ===================================================================
  // PUBLIC API: Progress Updates
  // ===================================================================

  /**
   * Updates completion metrics and status message via high-frequency cache writes.
   * @param {string} jobId Unique process identifier.
   * @param {number} percentage progress value (0-100).
   * @param {string} [message=''] Contextual progress update.
   * @returns {this} Chainable monitor instance.
   * @throws {Error} If percentage is out of range.
   */
  updateProgress(jobId, percentage, message = '') {
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      throw new Error(
        'ProcessMonitorService.updateProgress: percentage must be a number between 0 and 100'
      );
    }

    const state = this._readState(jobId);
    if (!state) {
      this._logger.warn(`[ProcessMonitorService] Cannot update progress for unknown job: ${jobId}`);
      return this;
    }

    state.percentage = Math.round(percentage);
    if (message) {
      state.message = message;
    }
    if (state.status === ProcessState.PENDING) {
      state.status = ProcessState.RUNNING;
    }

    // Progress update - cache only (save quota)
    this._writeState(jobId, state, false);
    this._logger.debug(`[ProcessMonitorService] Progress updated: ${jobId} - ${state.percentage}%`);

    return this;
  }

  // ===================================================================
  // PUBLIC API: Step Tracking
  // ===================================================================

  /**
   * Appends or updates a named sub-task within the job lifecycle and marks it as RUNNING.
   * @param {string} jobId Unique process identifier.
   * @param {string} stepName Semantic sub-task identifier.
   * @returns {this} Chainable monitor instance.
   * @throws {Error} If stepName is invalid.
   */
  logStepStart(jobId, stepName) {
    if (!stepName || typeof stepName !== 'string') {
      throw new Error('ProcessMonitorService.logStepStart: stepName must be a non-empty string');
    }

    const state = this._readState(jobId);
    if (!state) {
      this._logger.warn(`[ProcessMonitorService] Cannot log step for unknown job: ${jobId}`);
      return this;
    }

    // Find existing step or create new one
    let step = state.steps.find((s) => s.name === stepName);
    if (!step) {
      step = {
        name: stepName,
        status: StepState.PENDING,
        startTime: null,
        endTime: null
      };
      state.steps.push(step);
    }

    step.status = StepState.RUNNING;
    step.startTime = Date.now();
    step.endTime = null;

    // Step update - cache only
    this._writeState(jobId, state, false);
    this._logger.debug(`[ProcessMonitorService] Step started: ${jobId} - ${stepName}`);

    return this;
  }

  /**
   * Marks a sub-task as COMPLETED or FAILED and records its duration.
   * @param {string} jobId Unique process identifier.
   * @param {string} stepName Semantic sub-task identifier.
   * @param {boolean} success Outcome of the sub-task.
   * @returns {this} Chainable monitor instance.
   */
  logStepComplete(jobId, stepName, success) {
    const state = this._readState(jobId);
    if (!state) {
      this._logger.warn(`[ProcessMonitorService] Cannot complete step for unknown job: ${jobId}`);
      return this;
    }

    const step = state.steps.find((s) => s.name === stepName);
    if (!step) {
      this._logger.warn(`[ProcessMonitorService] Step not found: ${stepName} in job ${jobId}`);
      return this;
    }

    step.status = success ? StepState.COMPLETED : StepState.FAILED;
    step.endTime = Date.now();

    // Step update - cache only
    this._writeState(jobId, state, false);
    this._logger.debug(
      `[ProcessMonitorService] Step ${success ? 'completed' : 'failed'}: ${jobId} - ${stepName}`
    );

    return this;
  }

  /**
   * Registers a sub-task as SKIPPED within the job metadata.
   * @param {string} jobId Unique process identifier.
   * @param {string} stepName Semantic sub-task identifier.
   * @returns {this} Chainable monitor instance.
   */
  logStepSkipped(jobId, stepName) {
    const state = this._readState(jobId);
    if (!state) {
      return this;
    }

    let step = state.steps.find((s) => s.name === stepName);
    if (!step) {
      step = { name: stepName, status: StepState.PENDING, startTime: null, endTime: null };
      state.steps.push(step);
    }

    step.status = StepState.SKIPPED;
    step.endTime = Date.now();

    this._writeState(jobId, state, false);
    return this;
  }

  // ===================================================================
  // PUBLIC API: Error Handling
  // ===================================================================

  /**
   * Terminates process tracking with FAILED status and records diagnostic error metadata.
   * @param {string} jobId Unique process identifier.
   * @param {Error|string} error Descriptive failure details.
   * @returns {this} Chainable monitor instance.
   */
  setError(jobId, error) {
    const state = this._readState(jobId);
    if (!state) {
      this._logger.warn(`[ProcessMonitorService] Cannot set error for unknown job: ${jobId}`);
      return this;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    state.status = ProcessState.FAILED;
    state.error = errorMessage;
    state.endTime = Date.now();

    // Lifecycle event - persist to properties
    this._writeState(jobId, state, true);
    this._logger.error(`[ProcessMonitorService] Job failed: ${jobId} - ${errorMessage}`);

    return this;
  }

  // ===================================================================
  // PUBLIC API: State Retrieval
  // ===================================================================

  /**
   * Retrieves the comprehensive state record for a process from tiered storage.
   * @param {string} jobId Unique process identifier.
   * @returns {Object|null} Process state or null if unregistered.
   */
  getJobState(jobId) {
    return this._readState(jobId);
  }

  /**
   * Verifies the existence of a monitoring record for the specified process.
   * @param {string} jobId Unique process identifier.
   * @returns {boolean} True if a record is found.
   */
  hasJob(jobId) {
    return this._readState(jobId) !== null;
  }

  /**
   * Purges all state records for a process from both Cache and Properties tiers.
   * @param {string} jobId Unique process identifier.
   * @returns {this} Chainable monitor instance.
   */
  clearJob(jobId) {
    try {
      const cache = this._getCache();
      cache.remove(this._getCacheKey(jobId));
    } catch (error) {
      this._logger.warn(`[ProcessMonitorService] Failed to clear cache: ${error.message}`);
    }

    try {
      this._propertiesService.deleteProperty(this._getPropsKey(jobId));
    } catch (error) {
      this._logger.warn(`[ProcessMonitorService] Failed to clear properties: ${error.message}`);
    }

    this._logger.info(`[ProcessMonitorService] Job state cleared: ${jobId}`);
    return this;
  }

  // ===================================================================
  // PUBLIC API: Utility Methods
  // ===================================================================

  /**
   * Retrieves high-level configuration parameters for the monitoring service.
   * @returns {Object} Service metadata.
   */
  getConfigSummary() {
    return {
      cachePrefix: ProcessMonitorService.CACHE_PREFIX,
      propsPrefix: ProcessMonitorService.PROPS_PREFIX,
      cacheExpirationSeconds: ProcessMonitorService.CACHE_EXPIRATION
    };
  }
}
