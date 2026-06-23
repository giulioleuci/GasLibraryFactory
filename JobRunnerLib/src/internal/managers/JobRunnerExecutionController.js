/**
 * @file JobRunnerLib/src/managers/JobRunnerExecutionController.js
 * @description Manager for job execution lifecycle (start, resume, orchestration).
 */

import { CapturingLogger } from '../CapturingLogger.js';
import { JobStateManager } from './JobRunnerStateManager.js';
import { LockService } from '@GoogleApiWrapper';

export class JobRunnerExecutionController {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._utils = facade._utils;
    this._jobDefinitionRegistry = facade._jobDefinitionRegistry;
    this._propertiesService = facade._propertiesService;
    this._triggerService = facade._triggerService;
  }

  run(jobName, jobType, parameters, jobHandlerRegistryCallback, forceRestart = false, maxDurationMs = 25 * 60 * 1000, loggingConfig = null) {
    if (!jobName || typeof jobName !== 'string') throw new Error('MyJobRunnerService.run: jobName is required and must be a non-empty string');
    if (!jobType || typeof jobType !== 'string') throw new Error('MyJobRunnerService.run: jobType is required and must be a non-empty string');
    if (!parameters || typeof parameters !== 'object') throw new Error('MyJobRunnerService.run: parameters is required and must be an object');
    if (typeof jobHandlerRegistryCallback !== 'function') throw new Error('MyJobRunnerService.run: jobHandlerRegistryCallback must be a function');
    if (typeof forceRestart !== 'boolean') throw new Error('MyJobRunnerService.run: forceRestart must be a boolean');
    if (typeof maxDurationMs !== 'number' || maxDurationMs <= 0) throw new Error('MyJobRunnerService.run: maxDurationMs must be a positive number');

    this._logger.info(`MyJobRunnerService.run: Starting job '${jobName}' of type '${jobType}'`);
    if (loggingConfig) this.facade._validateLoggingConfig(loggingConfig);

    let capturingLogger = null;
    let effectiveLogger = this._logger;
    if (loggingConfig) {
      capturingLogger = new CapturingLogger(this._logger);
      effectiveLogger = capturingLogger;
      this._logger.debug('MyJobRunnerService.run: Capturing logger enabled');
    }

    const queue = this.facade._createQueue();
    queue.setMaxDuration(maxDurationMs);

    const services = { logger: effectiveLogger, utils: this._utils, properties: this._propertiesService, triggers: this._triggerService };
    jobHandlerRegistryCallback(queue, services);

    const jobDefinition = this._jobDefinitionRegistry.getDefinition(jobName);
    if (jobDefinition) {
      parameters.jobDefinition = jobDefinition;
      effectiveLogger.debug(`MyJobRunnerService.run: Job definition found for '${jobName}'`);
    }
    parameters.services = services;

    let result = null, error = null, jobCompleted = false;
    try {
      result = queue.execute(jobName, jobType, parameters, forceRestart);
      if (result !== null) {
        effectiveLogger.info(`MyJobRunnerService.run: Job '${jobName}' completed successfully`);
        jobCompleted = true;
      } else {
        effectiveLogger.info(`MyJobRunnerService.run: Job '${jobName}' suspended due to timeout, will resume automatically`);
      }
    } catch (err) {
      error = err;
      effectiveLogger.error(`MyJobRunnerService.run: Error executing job '${jobName}': ${err.message}`);
    } finally {
      if (capturingLogger && (jobCompleted || error)) {
        try {
          this.facade._displayLogs(capturingLogger, loggingConfig, jobName, error);
        } catch (logError) {
          this._logger.error(`MyJobRunnerService.run: Error displaying logs: ${logError.message}`);
        }
      }
    }
    if (error) throw error;
    return result;
  }

  resume(jobName, jobHandlerRegistryCallback, maxDurationMs = 25 * 60 * 1000) {
    if (!jobName) {
      const triggerId = this.facade._getCurrentTriggerId();
      if (triggerId) {
        jobName = this._propertiesService.getProperty(`job_for_trigger_${triggerId}`);
        this._logger.debug(`MyJobRunnerService.resume: Determined job name '${jobName}' from trigger ID '${triggerId}'`);
      }
    }
    if (!jobName) throw new Error('MyJobRunnerService.resume: Unable to determine job name. Provide jobName or ensure trigger context is available.');

    this._logger.info(`MyJobRunnerService.resume: Resuming job '${jobName}'`);
    const queue = this.facade._createQueue();
    const lockService = new LockService(this._logger);
    const stateManager = new JobStateManager(jobName, this._propertiesService, this._utils, lockService);
    const savedConfig = stateManager.loadConfiguration();
    queue.applyConfiguration(savedConfig);
    if (maxDurationMs) queue.setMaxDuration(maxDurationMs);

    const jobType = stateManager.loadType();
    if (!jobType) throw new Error(`MyJobRunnerService.resume: Unable to determine job type for '${jobName}'`);

    const services = { logger: this._logger, utils: this._utils, properties: this._propertiesService, triggers: this._triggerService };
    jobHandlerRegistryCallback(queue, services);

    const jobDefinition = this._jobDefinitionRegistry.getDefinition(jobName);
    const parameters = { services: services };
    if (jobDefinition) parameters.jobDefinition = jobDefinition;

    try {
      const result = queue.execute(jobName, jobType, parameters, false);
      if (result !== null) this._logger.info(`MyJobRunnerService.resume: Job '${jobName}' completed successfully`);
      else this._logger.info(`MyJobRunnerService.resume: Job '${jobName}' suspended again, will resume automatically`);
      return result;
    } catch (error) {
      this._logger.error(`MyJobRunnerService.resume: Error resuming job '${jobName}': ${error.message}`);
      throw error;
    }
  }
}
