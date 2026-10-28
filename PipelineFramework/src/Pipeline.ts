/**
 * @file PipelineFramework/src/Pipeline.js
 * @description Main pipeline orchestrator for sequential step execution.
 * @version 1.0.0
 */

import { PipelineContext } from './PipelineContext.js';

/**
 * Orchestrator for sequential step execution with shared context and lifecycle hooks.
 *
 * @class
 */
import type {
  PipelineLogger,
  PipelineOptions,
  RetryService,
  PipelineStep,
  StepResult,
  PipelineHooks,
  LogPosition,
  LogEnvelope
} from './internal/contracts.js';

export class Pipeline<Data extends object = Record<string, unknown>> {
  declare _logger: PipelineLogger;
  declare _exceptionService: RetryService | null;
  declare _name: string;
  declare _stopOnError: boolean;
  declare _maxRetries: number;
  declare _logPosition: LogPosition;
  declare _collapseSkippedSteps: boolean;
  declare _steps: PipelineStep<Data>[];
  declare _hooks: PipelineHooks<Data>;
  /**
   * @param {Object} logger Logger instance (info, debug, warn, error).
   * @param {Object} [exceptionService=null] Resilience provider for step-level retries.
   * @param {Object} [options={}] Pipeline configuration.
   * @param {boolean} [options.collapseSkippedSteps=false] Log consecutive skipped steps with the same reason as one line.
   * @throws {Error} If logger is invalid or dependencies are unmet.
   */
  constructor(
    logger: PipelineLogger,
    exceptionService: RetryService | null = null,
    options: PipelineOptions = {}
  ) {
    if (!logger || typeof logger !== 'object') {
      throw new Error('Pipeline: logger is required and must be an object');
    }

    for (const method of ['debug', 'info', 'warn', 'error']) {
      if (
        typeof logger[method as keyof Pick<PipelineLogger, 'debug' | 'info' | 'warn' | 'error'>] !==
        'function'
      ) {
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
    this._logPosition = this._normalizeLogPosition(options.logPosition);
    /** When true, consecutive skipped steps sharing a reason are logged as one line. */
    this._collapseSkippedSteps = options.collapseSkippedSteps === true;
    this._steps = [];
    this._hooks = {
      beforeStep: [],
      afterStep: [],
      onError: [],
      onComplete: []
    };
  }

  _normalizeLogPosition(position?: Partial<LogPosition> | null) {
    const value = position && typeof position === 'object' ? position : {};
    return {
      depth: Math.max(0, Number.isFinite(value.depth) ? value.depth! : 0),
      isLast: Boolean(value.isLast),
      ancestorHasNext: Array.isArray(value.ancestorHasNext) ? value.ancestorHasNext.slice() : []
    };
  }

  _stepLogPosition(index: number) {
    return {
      depth: this._logPosition.depth + 1,
      isLast: index === this._steps.length - 1,
      ancestorHasNext: [...this._logPosition.ancestorHasNext, true]
    };
  }

  _summaryLogPosition() {
    return { ...this._logPosition, isLast: true };
  }

  _executionLogPosition(index: number) {
    const stepPosition = this._stepLogPosition(index);
    return {
      depth: stepPosition.depth + 1,
      isLast: false,
      ancestorHasNext: [...stepPosition.ancestorHasNext, !stepPosition.isLast]
    };
  }

  _logPipelineStart() {
    if (typeof this._logger.logPipelineStart === 'function') {
      this._logger.logPipelineStart(this._name, this._steps.length, this._logPosition);
    } else {
      this._logger.info(`[${this._name}] Starting pipeline (${this._steps.length} steps)`);
    }
  }

  _logPipelineStep(stepName: string, status: string, details: unknown, position: LogPosition) {
    if (typeof this._logger.logPipelineStep === 'function') {
      this._logger.logPipelineStep(stepName, status, details, position);
      return;
    }
    const isEnvelope = Boolean(
      details &&
      typeof details === 'object' &&
      !Array.isArray(details) &&
      (Object.prototype.hasOwnProperty.call(details, 'content') ||
        Object.prototype.hasOwnProperty.call(details, 'durationMs') ||
        Object.prototype.hasOwnProperty.call(details, 'reason'))
    );
    const envelope = (isEnvelope ? details : {}) as LogEnvelope;
    const content = isEnvelope ? envelope.content : details;
    const reason =
      envelope.reason !== undefined
        ? envelope.reason
        : status === 'SKIPPED'
          ? 'condition not met'
          : 'step failed';
    const duration =
      Number.isFinite(envelope.durationMs) && envelope.durationMs! >= 0
        ? envelope.durationMs
        : null;
    const fallbackDetails = this._fallbackDetailText(status === 'EXECUTED' ? content : reason);
    const displayStatus = status === 'ERROR' ? 'FAILED' : status;
    const timedStatus =
      status !== 'SKIPPED' && duration !== null
        ? `${displayStatus} in ${duration}ms`
        : displayStatus;
    const body = fallbackDetails ? `${fallbackDetails} (${timedStatus})` : timedStatus;
    const message = `[${this._name}] [${stepName}] ${body}`;
    if (status === 'ERROR') {
      this._logger.error(message);
    } else if (status === 'SKIPPED') {
      this._logger.warn(message);
    } else {
      this._logger.info(message);
    }
  }

  _fallbackDetailText(details: unknown) {
    if (details === undefined || details === null || details === '') {
      return '';
    }
    if (Array.isArray(details)) {
      return details.join('\n');
    }
    if (typeof details === 'object') {
      try {
        return JSON.stringify(details);
      } catch (_error) {
        return '[Unrenderable details]';
      }
    }
    return String(details);
  }

  _logPipelineSummary(context: PipelineContext<Data>, prefix = '') {
    const summary = context.getSummary();
    let details =
      `${summary.completedSteps} executed, ${summary.skippedSteps} skipped, ` +
      `${summary.failedSteps} failed`;
    if (prefix) {
      details = `${prefix}; ${details}`;
    }
    if (summary.stopRequested) {
      details += `; stopped: ${summary.stopReason}`;
    }
    const icon = summary.failedSteps > 0 ? '❌' : '✅';
    if (typeof this._logger.logSummary === 'function') {
      this._logger.logSummary(
        `${icon} Pipeline completed`,
        context.getTotalDuration(),
        details,
        this._summaryLogPosition()
      );
    } else {
      this._logger.info(
        `${icon} [${this._name}] Pipeline completed in ${context.getTotalDuration()}ms (${details})`
      );
    }
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
  addStep(step: PipelineStep<Data>) {
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
  beforeStep(callback: PipelineHooks<Data>['beforeStep'][number]) {
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
  afterStep(callback: PipelineHooks<Data>['afterStep'][number]) {
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
  onError(callback: PipelineHooks<Data>['onError'][number]) {
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
  onComplete(callback: PipelineHooks<Data>['onComplete'][number]) {
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
  _invokeHooks<Args extends unknown[]>(hookList: ((...args: Args) => unknown)[], ...args: Args) {
    for (const cb of hookList) {
      try {
        cb(...args);
      } catch (e) {
        this._logger.warn(`[${this._name}] Hook threw: ${(e as Error).message}`);
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
  _executeStep(step: PipelineStep<Data>, context: PipelineContext<Data>) {
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
   * @returns {PipelineContext}
   */
  execute(initialData: Partial<Data> | null = {}) {
    if (initialData !== null && (typeof initialData !== 'object' || Array.isArray(initialData))) {
      throw new Error('Pipeline.execute: initialData must be an object or null');
    }

    const context = new PipelineContext<Data>(initialData);
    let pipelineSuccess = true;
    this._logPipelineStart();
    const skippedRun: { name: string; reason: unknown; index: number }[] = [];
    const flushSkipped = () => {
      if (skippedRun.length === 0) {
        return;
      }
      const last = skippedRun[skippedRun.length - 1];
      this._logPipelineStep(
        skippedRun.map((s) => s.name).join(', '),
        'SKIPPED',
        { reason: last.reason },
        this._stepLogPosition(last.index)
      );
      skippedRun.length = 0;
    };

    for (let stepIndex = 0; stepIndex < this._steps.length; stepIndex++) {
      const step = this._steps[stepIndex];
      if (context.shouldStop()) {
        flushSkipped();
        if (typeof this._logger.logStep === 'function') {
          this._logger.logStep(
            `⏹️ Stop requested: ${context.getStopReason()}`,
            this._stepLogPosition(stepIndex)
          );
        } else {
          this._logger.info(`[${this._name}] Stop requested: ${context.getStopReason()}`);
        }
        break;
      }

      const stepName = step.getName();
      this._invokeHooks(this._hooks.beforeStep, step, context);

      let result: StepResult;
      try {
        const executeStep = () => this._executeStep(step, context);
        result =
          typeof this._logger.withPosition === 'function'
            ? this._logger.withPosition(this._executionLogPosition(stepIndex), executeStep)
            : executeStep();
      } catch (error) {
        pipelineSuccess = false;
        this._invokeHooks(this._hooks.onError, step, context, error);
        context.recordStepExecution(stepName, 'failed', 0, { error: (error as Error).message });
        flushSkipped();
        this._logPipelineStep(
          stepName,
          'ERROR',
          { reason: (error as Error).message || 'step failed', durationMs: 0 },
          this._stepLogPosition(stepIndex)
        );

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
        result.error ? { error: (result.error as Error).message } : {}
      );

      const semanticStatus =
        status === 'completed' ? 'EXECUTED' : status === 'skipped' ? 'SKIPPED' : 'ERROR';
      const details =
        status === 'skipped'
          ? { reason: result.skipReason || 'condition not met' }
          : status === 'failed'
            ? {
                reason: (result.error as Error | undefined)?.message || 'step failed',
                durationMs: result.durationMs || 0
              }
            : { content: result.logDetails, durationMs: result.durationMs || 0 };
      if (status === 'skipped' && this._collapseSkippedSteps) {
        if (skippedRun.length > 0 && skippedRun[0].reason !== details.reason) {
          flushSkipped();
        }
        skippedRun.push({ name: stepName, reason: details.reason, index: stepIndex });
      } else {
        flushSkipped();
        this._logPipelineStep(stepName, semanticStatus, details, this._stepLogPosition(stepIndex));
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
    flushSkipped();

    context.markCompleted();
    this._invokeHooks(this._hooks.onComplete, context, pipelineSuccess);

    this._logPipelineSummary(context);

    return context;
  }

  /**
   * @returns {Pipeline}
   */
  clearSteps() {
    this._steps = [];
    return this;
  }
}
