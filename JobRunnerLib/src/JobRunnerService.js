/**
 * @file JobRunnerLib/src/JobRunnerService.js
 * @description Main facade for the JobRunnerLib library. Provides high-level methods
 *              for running and resuming long-running jobs with automatic state management.
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { Delegation } from '@CoreUtilsLib';
import { PropertiesService, TriggerService, LockService } from '@GoogleApiWrapper';
import { JobQueue } from './JobQueue.js';
import { JobRunnerTriggerManager } from './internal/managers/JobRunnerTriggerManager.js';
import { JobRunnerStateManager } from './internal/managers/JobRunnerStateManager.js';
import { JobRunnerExecutionController } from './internal/managers/JobRunnerExecutionController.js';
import { JobRunnerLogCapturer } from './internal/managers/JobRunnerLogCapturer.js';

export class MyJobRunnerService {
  constructor(logger, utils, jobDefinitionRegistry) {
    // JRL-H003: Parameter validation
    if (logger == null) {
      throw new Error('MyJobRunnerService: logger is required and cannot be null or undefined');
    }
    if (typeof logger !== 'object') {
      throw new Error(
        `MyJobRunnerService: logger must be of type object, received: ${typeof logger}`
      );
    }
    ['info', 'debug', 'error'].forEach((method) => {
      if (typeof logger[method] !== 'function') {
        throw new Error(`MyJobRunnerService: logger must have method: ${method}`);
      }
    });

    if (utils == null) {
      throw new Error('MyJobRunnerService: utils is required and cannot be null or undefined');
    }
    if (typeof utils !== 'object') {
      throw new Error(
        `MyJobRunnerService: utils must be of type object, received: ${typeof utils}`
      );
    }

    if (jobDefinitionRegistry == null) {
      throw new Error(
        'MyJobRunnerService: jobDefinitionRegistry is required and cannot be null or undefined'
      );
    }
    if (typeof jobDefinitionRegistry !== 'object') {
      throw new Error(
        `MyJobRunnerService: jobDefinitionRegistry must be of type object, received: ${typeof jobDefinitionRegistry}`
      );
    }
    if (typeof jobDefinitionRegistry.getDefinition !== 'function') {
      throw new Error('MyJobRunnerService: jobDefinitionRegistry must have method: getDefinition');
    }

    this._logger = logger;
    this._utils = utils;
    this._jobDefinitionRegistry = jobDefinitionRegistry;

    // Instantiate GoogleApiWrapper services internally
    this._propertiesService = new PropertiesService(logger);
    this._triggerService = new TriggerService(logger, utils);

    // Initialize managers
    this._triggerManager = new JobRunnerTriggerManager(this);
    this._stateManager = new JobRunnerStateManager(this);
    this._executionController = new JobRunnerExecutionController(this);
    this._logCapturer = new JobRunnerLogCapturer(this);

    // Delegate methods
    Delegation.delegateMethods(this, [
      {
        manager: this._triggerManager,
        methods: ['_getCurrentTriggerId']
      },
      {
        manager: this._stateManager,
        methods: ['getStatus', 'resetJob', 'cancelJob']
      },
      {
        manager: this._executionController,
        methods: ['run', 'resume']
      },
      {
        manager: this._logCapturer,
        methods: [
          '_validateLoggingConfig',
          '_displayLogs',
          '_displayLogsInSidebar',
          '_displayLogsInDriveFile'
        ]
      }
    ]);

    this._logger.debug('MyJobRunnerService: Instance created');
  }

  /**
   * Factory for JobQueue instances with injected platform services.
   * @private
   * @returns {JobQueue} Initialized queue with native GAS lock/trigger support.
   */
  _createQueue() {
    const lockService = new LockService(this._logger);
    return new JobQueue(
      this._logger,
      this._utils,
      this._propertiesService,
      this._triggerService,
      lockService
    );
  }
}

export { MyJobRunnerService as JobRunnerService };
