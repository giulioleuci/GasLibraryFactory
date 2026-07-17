/**
 * @file PipelineFramework/src/Pipeline.js
 * @description Main pipeline orchestrator for sequential step execution.
 * @version 1.0.0
 */

import { PipelineContext } from './PipelineContext';
import { PipelineError } from './internal/errors/PipelineError';

/**
 * Orchestrator for sequential step execution with shared context and lifecycle hooks.
 *
 * @class
 */
export class Pipeline {
  /**
   * @param {Object} logger Logger instance (info, debug, warn, error).
   * @param {Object} [exceptionService=null] Resilience provider for step-level retries.
   * @param {Object} [options={}] Pipeline configuration.
   * @throws {Error} If logger is invalid or dependencies are unmet.
   */
  constructor(logger, exceptionService = null, options = {}) {
    if (!logger || typeof logger !== 'object') {
      throw new Error('Pipeline: logger is required and must be an object');
    }

    for (const method of ['debug', 'info', 'warn', 'error']) {
      if (typeof logger[method] !== 'function') {
        throw new Error(`Pipeline: logger.${method} must be a function`);
      }
    }

    if (
      exceptionService !== null &&
      (typeof exceptionService !== 'object' || Array.isArray(exceptionService))
    ) {
      throw new Error('Pipeline: exceptionService is required and must be an object');
    }

    if (options === null || typeof options !== 'object' || Array.isArray(options)) {
      throw new Error('Pipeline: options must be a plain object');
    }

    this._logger = logger;
    this._exceptionService = exceptionService;
    this._name = options.name || 'Pipeline';
    this._stopOnError = options.stopOnError !== undefined ? options.stopOnError : true;
    this._maxRetries = options.maxRetries !== undefined ? options.maxRetries : 3;
    this._monitor = options.monitor || null;
    this._jobId = options.jobId || null;
    this._dryRun = options.dryRun || false;
    this._steps = [];
    this._hooks = {
      beforeStep: [],
      afterStep: [],
      onError: [],
      onComplete: []
    };
  }

  /**
   * @private
   * @param {Object} [options={}]
   * @returns {boolean}
   */
  _isDryRun(options = {}) {
    return options.dryRun !== undefined ? Boolean(options.dryRun) : Boolean(this._dryRun);
  }

  /** @returns {string} */
  getName() {
    return this._name;
  }

  /** @returns {Object} Logger instance. */
  get logger() {
    return this._logger;
  }

  /** @returns {Step[]} Active sequence. */
  getSteps() {
    return this._steps;
  }

  /**
   * appends a step to the active sequence.
   * @param {Step} step Valid Step instance.
   * @returns {Pipeline} Current instance for chaining.
   */
  addStep(step) {
    if (!step || typeof step !== 'object') {
      throw new Error('Pipeline.addStep: step is required and must be an object');
    }
    if (typeof step.execute !== 'function') {
      throw new Error('Pipeline.addStep: step must have an execute method');
    }
    if (typeof step.getName !== 'function') {
      throw new Error('Pipeline.addStep: step must have a getName method');
    }
    this._steps.push(step);
    return this;
  }

  /**
   * Registers a pre-step callback.
   * @param {Function} callback
   * @returns {Pipeline}
   */
  beforeStep(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Pipeline.beforeStep: callback must be a function');
    }
    this._hooks.beforeStep.push(callback);
    return this;
  }

  /**
   * Registers a post-step callback.
   * @param {Function} callback
   * @returns {Pipeline}
   */
  afterStep(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Pipeline.afterStep: callback must be a function');
    }
    this._hooks.afterStep.push(callback);
    return this;
  }

  /**
   * Registers a step-level failure listener.
   * @param {Function} callback
   * @returns {Pipeline}
   */
  onError(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Pipeline.onError: callback must be a function');
    }
    this._hooks.onError.push(callback);
    return this;
  }

  /**
   * Registers a pipeline completion listener.
   * @param {Function} callback
   * @returns {Pipeline}
   */
  onComplete(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Pipeline.onComplete: callback must be a function');
    }
    this._hooks.onComplete.push(callback);
    return this;
  }

  /**
   * Safely invoke a list of hook callbacks, swallowing and logging errors.
   * @private
   */
  _invokeHooks(hookList, ...args) {
    for (const cb of hookList) {
      try {
        cb(...args);
      } catch (e) {
        this._logger.warn(`[${this._name}] Hook threw: ${e.message}`);
      }
    }
  }

  /**
   * Internal step execution wrapper with hook and retry orchestration.
   * @private
   * @param {Step} step
   * @param {PipelineContext} context
   * @returns {{success: boolean, skipped: boolean, durationMs: number, error?: Error}}
   */
  _executeStep(step, context) {
    if (this._exceptionService && typeof this._exceptionService.executeWithRetry === 'function') {
      return this._exceptionService.executeWithRetry(
        () => step.execute(context),
        {},
        this._maxRetries
      );
    }
    return step.execute(context);
  }

  /**
   * Sequentially executes all steps.
   * @param {Object} [initialData={}]
   * @param {Object} [options={}]
   * @returns {PipelineContext}
   */
  execute(initialData = {}, options = {}) {
    if (initialData !== null && (typeof initialData !== 'object' || Array.isArray(initialData))) {
      throw new Error('Pipeline.execute: initialData must be an object or null');
    }

    const context = new PipelineContext(initialData);
    const dryRun = this._isDryRun(options);
    let pipelineSuccess = true;

    if (dryRun) {
      const stepNames = this._steps.map((s) => s.getName());
      context.set('dryRun', true);
      context.set('simulatedSteps', stepNames);
      this._logger.info(
        `[${this._name}] [DRY-RUN] Would execute ${this._steps.length} steps: ${stepNames.join(', ')}`
      );
      context.markCompleted();
      this._invokeHooks(this._hooks.onComplete, context, true);
      return context;
    }

    this._logger.info(`[${this._name}] Starting pipeline (${this._steps.length} steps)`);

    for (const step of this._steps) {
      if (context.shouldStop()) {
        this._logger.info(`[${this._name}] Stop requested: ${context.getStopReason()}`);
        break;
      }

      const stepName = step.getName();
      this._invokeHooks(this._hooks.beforeStep, step, context);

      if (this._monitor && this._jobId && typeof this._monitor.logStepStart === 'function') {
        try {
          this._monitor.logStepStart(this._jobId, stepName);
        } catch (_e) {}
      }

      let result;
      try {
        result = this._executeStep(step, context);
      } catch (error) {
        pipelineSuccess = false;
        this._invokeHooks(this._hooks.onError, step, context, error);
        context.recordStepExecution(stepName, 'failed', 0, { error: error.message });

        if (this._monitor && this._jobId && typeof this._monitor.logStepComplete === 'function') {
          try {
            this._monitor.logStepComplete(this._jobId, stepName, false);
          } catch (_e) {}
        }

        if (this._stopOnError) {
          break;
        }
        continue;
      }

      const status = result.skipped
        ? 'skipped'
        : result.success && !result.error
          ? 'completed'
          : 'failed';

      context.recordStepExecution(
        stepName,
        status,
        result.durationMs || 0,
        result.error ? { error: result.error.message } : {}
      );

      if (this._monitor && this._jobId) {
        try {
          if (status === 'skipped' && typeof this._monitor.logStepSkipped === 'function') {
            this._monitor.logStepSkipped(this._jobId, stepName);
          } else if (typeof this._monitor.logStepComplete === 'function') {
            this._monitor.logStepComplete(this._jobId, stepName, status === 'completed');
          }
        } catch (_e) {}
      }

      if (status === 'failed') {
        pipelineSuccess = false;
        this._invokeHooks(this._hooks.onError, step, context, result.error);
        if (this._stopOnError) {
          break;
        }
      }

      this._invokeHooks(this._hooks.afterStep, step, context, result);
    }

    context.markCompleted();
    this._invokeHooks(this._hooks.onComplete, context, pipelineSuccess);

    this._logger.info(`[${this._name}] Pipeline completed in ${context.getTotalDuration()}ms`);

    return context;
  }

  /**
   * @returns {Pipeline}
   */
  clearSteps() {
    this._steps = [];
    return this;
  }

  /**
   * @returns {Object}
   */
  getConfigSummary() {
    return {
      name: this._name,
      stepCount: this._steps.length,
      steps: this._steps.map((step) => step.getName()),
      stopOnError: this._stopOnError,
      maxRetries: this._maxRetries,
      hasExceptionService: this._exceptionService !== null,
      hasMonitor: this._monitor !== null,
      jobId: this._jobId,
      hooks: {
        beforeStep: this._hooks.beforeStep.length > 0,
        afterStep: this._hooks.afterStep.length > 0,
        onError: this._hooks.onError.length > 0,
        onComplete: this._hooks.onComplete.length > 0
      }
    };
  }
}
