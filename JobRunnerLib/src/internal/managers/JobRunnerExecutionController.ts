import type { MyJobRunnerService } from '../../JobRunnerService.js';
import type {
  JobLogger,
  JobUtilities,
  RunnerServices,
  JobParameters,
  JobStatus,
  LoggingConfig,
  LogLevel,
  SemanticMethod
} from '../../types.js';
/**
 * @file JobRunnerLib/src/managers/JobRunnerExecutionController.js
 * @description Manager for job execution lifecycle (start, resume, orchestration).
 */

import { CapturingLogger } from '../CapturingLogger.js';
import { JobStateManager } from './JobRunnerStateManager.js';
import { LockService } from '@GoogleApiWrapper';

export class JobRunnerExecutionController {
  declare facade: MyJobRunnerService;
  declare _logger: JobLogger;
  declare _utils: JobUtilities;
  declare _jobDefinitionRegistry: MyJobRunnerService['_jobDefinitionRegistry'];
  declare _propertiesService: MyJobRunnerService['_propertiesService'];
  declare _triggerService: MyJobRunnerService['_triggerService'];

  constructor(facade: MyJobRunnerService) {
    this.facade = facade;
    this._logger = facade._logger;
    this._utils = facade._utils;
    this._jobDefinitionRegistry = facade._jobDefinitionRegistry;
    this._propertiesService = facade._propertiesService;
    this._triggerService = facade._triggerService;
  }

  _semantic(
    logger: JobLogger,
    method: SemanticMethod,
    args: unknown[],
    level: LogLevel,
    fallbackMessage: string
  ) {
    if (typeof logger[method] === 'function') {
      (logger[method] as (...args: unknown[]) => unknown)(...args);
    } else if (typeof logger[level] === 'function') {
      logger[level](fallbackMessage);
    } else {
      logger.info(fallbackMessage);
    }
  }

  _logJobStart(logger: JobLogger, jobName: string, jobType: string) {
    this._semantic(
      logger,
      'logJobStart',
      [jobName, jobType],
      'info',
      `Starting job ${jobName} (type: ${jobType})`
    );
  }

  _logJobResume(logger: JobLogger, jobName: string, jobType: string, details?: unknown) {
    this._semantic(
      logger,
      'logJobResume',
      details === undefined ? [jobName, jobType] : [jobName, jobType, details],
      'info',
      `Resuming job ${jobName} (type: ${jobType})`
    );
  }

  _logTerminal(
    logger: JobLogger,
    jobName: string,
    result: unknown,
    status: Pick<JobStatus, 'state' | 'percentage'> | null,
    durationMs: number
  ) {
    const state = status && status.state;
    if (state === 'cancelled') {
      this._semantic(
        logger,
        'logJobEnd',
        [jobName, false, { reason: 'cancelled', durationMs }],
        'error',
        `Job ${jobName} cancelled after ${durationMs}ms`
      );
    } else if (state === 'failed' || state === 'error') {
      this._semantic(
        logger,
        'logJobEnd',
        [jobName, false, { reason: state, durationMs }],
        'error',
        `Job ${jobName} failed (${state}) after ${durationMs}ms`
      );
    } else if (result === null) {
      this._semantic(
        logger,
        'logJobSuspended',
        [jobName, { reason: 'state saved; automatic resume scheduled', durationMs }],
        'warn',
        `Job ${jobName} suspended; automatic resume scheduled after ${durationMs}ms`
      );
    } else {
      this._semantic(
        logger,
        'logJobEnd',
        [jobName, true, { durationMs }],
        'info',
        `Job ${jobName} completed successfully in ${durationMs}ms`
      );
    }
  }

  _status(
    queue: Pick<import('../../JobQueue.js').JobQueue, 'getStatus'>,
    jobName: string,
    result: unknown
  ): Pick<JobStatus, 'state' | 'percentage'> {
    if (typeof queue.getStatus === 'function') {
      return queue.getStatus(jobName);
    }
    return { state: result === null ? 'to_resume' : 'completed' };
  }

  run(
    jobName: string,
    jobType: string,
    parameters: JobParameters,
    jobHandlerRegistryCallback: (
      queue: import('../../JobQueue.js').JobQueue,
      services: RunnerServices
    ) => unknown,
    forceRestart = false,
    maxDurationMs: number = 25 * 60 * 1000,
    loggingConfig: LoggingConfig | null = null
  ) {
    if (!jobName || typeof jobName !== 'string') {
      throw new Error('MyJobRunnerService.run: jobName is required and must be a non-empty string');
    }
    if (!jobType || typeof jobType !== 'string') {
      throw new Error('MyJobRunnerService.run: jobType is required and must be a non-empty string');
    }
    if (!parameters || typeof parameters !== 'object') {
      throw new Error('MyJobRunnerService.run: parameters is required and must be an object');
    }
    if (typeof jobHandlerRegistryCallback !== 'function') {
      throw new Error('MyJobRunnerService.run: jobHandlerRegistryCallback must be a function');
    }
    if (typeof forceRestart !== 'boolean') {
      throw new Error('MyJobRunnerService.run: forceRestart must be a boolean');
    }
    if (typeof maxDurationMs !== 'number' || maxDurationMs <= 0) {
      throw new Error('MyJobRunnerService.run: maxDurationMs must be a positive number');
    }

    if (loggingConfig) {
      this.facade._validateLoggingConfig(loggingConfig);
    }

    let capturingLogger = null;
    let effectiveLogger = this._logger;
    if (loggingConfig) {
      capturingLogger = new CapturingLogger(this._logger);
      effectiveLogger = capturingLogger;
      this._logger.debug('MyJobRunnerService.run: Capturing logger enabled');
    }
    const startedAt = Date.now();
    this._logJobStart(effectiveLogger, jobName, jobType);

    const queue = this.facade._createQueue();
    queue.setMaxDuration(maxDurationMs);

    const services = {
      logger: effectiveLogger,
      utils: this._utils,
      properties: this._propertiesService,
      triggers: this._triggerService
    };
    jobHandlerRegistryCallback(queue, services);

    const jobDefinition = this._jobDefinitionRegistry.jobExists(jobName)
      ? this._jobDefinitionRegistry.getDefinition(jobName)
      : null;
    if (jobDefinition) {
      parameters.jobDefinition = jobDefinition;
      effectiveLogger.debug(`MyJobRunnerService.run: Job definition found for '${jobName}'`);
    }
    parameters.services = services;

    let result = null,
      error = null,
      jobCompleted = false;
    try {
      // blockIfSuspended=true: this is a fresh/manual launch, not the trigger-driven
      // resume path (that's .resume() below) — refuse to start if a prior run of this
      // jobName is suspended awaiting its own automatic resume trigger.
      result = queue.execute(jobName, jobType, parameters, forceRestart, true);
      const status = this._status(queue, jobName, result);
      this._logTerminal(effectiveLogger, jobName, result, status, Date.now() - startedAt);
      jobCompleted =
        result !== null ||
        status.state === 'cancelled' ||
        status.state === 'failed' ||
        status.state === 'error';
    } catch (err) {
      error = err;
      this._semantic(
        effectiveLogger,
        'logJobEnd',
        [jobName, false, { reason: (err as Error).message, durationMs: Date.now() - startedAt }],
        'error',
        `Job ${jobName} failed: ${(err as Error).message}`
      );
    } finally {
      if (capturingLogger && (jobCompleted || error)) {
        try {
          this.facade._displayLogs(capturingLogger, loggingConfig!, jobName, error);
        } catch (logError) {
          this._logger.error(
            `MyJobRunnerService.run: Error displaying logs: ${(logError as Error).message}`
          );
        }
      }
    }
    if (error) {
      throw error;
    }
    return result;
  }

  resume(
    jobName: string | null | undefined,
    jobHandlerRegistryCallback: (
      queue: import('../../JobQueue.js').JobQueue,
      services: RunnerServices
    ) => unknown,
    maxDurationMs: number = 25 * 60 * 1000
  ) {
    const startedAt = Date.now();
    if (!jobName) {
      const triggerId = this.facade._getCurrentTriggerId();
      if (triggerId) {
        jobName = this._propertiesService.getProperty(`job_for_trigger_${triggerId}`);
        this._logger.debug(
          `MyJobRunnerService.resume: Determined job name '${jobName}' from trigger ID '${triggerId}'`
        );
      }
    }
    if (!jobName) {
      throw new Error(
        'MyJobRunnerService.resume: Unable to determine job name. Provide jobName or ensure trigger context is available.'
      );
    }

    const queue = this.facade._createQueue();
    const lockService = new LockService(this._logger);
    const stateManager = new JobStateManager(
      jobName,
      this._propertiesService,
      this._utils,
      lockService
    );
    const savedConfig = stateManager.loadConfiguration();
    queue.applyConfiguration(savedConfig);
    if (maxDurationMs) {
      queue.setMaxDuration(maxDurationMs);
    }

    const jobType = stateManager.loadType();
    if (!jobType) {
      throw new Error(`MyJobRunnerService.resume: Unable to determine job type for '${jobName}'`);
    }

    const resumeState = stateManager.loadResumeState() as Record<string, unknown> | null;
    const currentStatus = this._status(queue, jobName, null);
    const details: { checkpoint?: string; percentage?: number } = {};
    if (resumeState && resumeState.nextIndex !== undefined) {
      details.checkpoint = `nextIndex: ${resumeState.nextIndex}`;
    } else if (resumeState && resumeState.position !== undefined) {
      details.checkpoint = String(resumeState.position);
    }
    if (Number.isFinite(currentStatus.percentage)) {
      details.percentage = currentStatus.percentage;
    }
    this._logJobResume(
      this._logger,
      jobName,
      jobType,
      Object.keys(details).length > 0 ? details : undefined
    );

    const services = {
      logger: this._logger,
      utils: this._utils,
      properties: this._propertiesService,
      triggers: this._triggerService
    };
    jobHandlerRegistryCallback(queue, services);

    const jobDefinition = this._jobDefinitionRegistry.jobExists(jobName)
      ? this._jobDefinitionRegistry.getDefinition(jobName)
      : null;
    const parameters: JobParameters = { services: services };
    if (jobDefinition) {
      parameters.jobDefinition = jobDefinition;
    }

    try {
      const result = queue.execute(jobName, jobType, parameters, false);
      const status = this._status(queue, jobName, result);
      this._logTerminal(this._logger, jobName, result, status, Date.now() - startedAt);
      return result;
    } catch (error) {
      this._semantic(
        this._logger,
        'logJobEnd',
        [jobName, false, { reason: (error as Error).message, durationMs: Date.now() - startedAt }],
        'error',
        `Job ${jobName} failed while resuming: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
