/**
 * @file JobRunnerLib/src/managers/JobRunnerStateManager.js
 * @description Manager for job state persistence and status tracking.
 */

import { QueueStateManager } from '../../QueueStateManager';
import { QueuePersistenceHandler } from '../QueuePersistenceHandler';
import { QueueProgressTracker } from '../QueueProgressTracker';

export class JobStateManager {
  static get STATE_RUNNING() {
    return QueueStateManager.STATE_RUNNING;
  }
  static get STATE_COMPLETED() {
    return QueueStateManager.STATE_COMPLETED;
  }
  static get STATE_CANCELLED() {
    return QueueStateManager.STATE_CANCELLED;
  }
  static get STATE_FAILED() {
    return QueueStateManager.STATE_FAILED;
  }
  static get STATE_PENDING() {
    return QueueStateManager.STATE_PENDING;
  }
  static get LOCK_RETRY_DELAY_MS() {
    return QueueStateManager.LOCK_RETRY_DELAY_MS;
  }
  static get LARGE_STATE_THRESHOLD() {
    return QueuePersistenceHandler.LARGE_STATE_THRESHOLD;
  }

  constructor(jobName, propertiesService, utils, lockService, driveService = null) {
    this.jobName = jobName;
    this._propertiesService = propertiesService;
    this._utils = utils;
    this._lockService = lockService;
    this._driveService = driveService;

    this.stateManager = new QueueStateManager(jobName, propertiesService, utils, lockService);
    this.persistenceHandler = new QueuePersistenceHandler(
      jobName,
      propertiesService,
      this.stateManager,
      driveService
    );
    this.progressTracker = new QueueProgressTracker(jobName, propertiesService);

    const stateMethods = [
      '_key',
      'getStateVersion',
      '_incrementVersion',
      'setState',
      'getState',
      'isCancelled',
      'getStateWithVersion',
      'tryAcquireRunning',
      'releaseLock',
      'getRetryCount',
      'incrementRetryCount',
      'resetRetryCount',
      'saveFailureInfo',
      'getFailureInfo'
    ];
    stateMethods.forEach((m) => {
      this[m] = this.stateManager[m].bind(this.stateManager);
    });

    const persistenceMethods = [
      'batchSave',
      'saveResumeState',
      'loadResumeState',
      '_saveLargeStateToDrive',
      '_loadLargeStateFromDrive',
      '_getOrCreateJobStateFolder',
      'saveConfiguration',
      'loadConfiguration',
      'saveType',
      'loadType'
    ];
    persistenceMethods.forEach((m) => {
      this[m] = this.persistenceHandler[m].bind(this.persistenceHandler);
    });

    const progressMethods = ['saveProgress'];
    progressMethods.forEach((m) => {
      this[m] = this.progressTracker[m].bind(this.progressTracker);
    });
  }

  reset() {
    this.stateManager.reset();
    this.persistenceHandler.reset();
    this.progressTracker.reset();
  }
}

export class JobRunnerStateManager {
  constructor(facade) {
    this.facade = facade;
  }

  getStatus(jobName) {
    const queue = this.facade._createQueue();
    return queue.getStatus(jobName);
  }

  resetJob(jobName) {
    const queue = this.facade._createQueue();
    return queue.resetJobState(jobName);
  }

  cancelJob(jobName) {
    if (!jobName || typeof jobName !== 'string') {
      throw new Error(
        'JobRunnerService.cancelJob: jobName is required and must be a non-empty string'
      );
    }
    this.facade._logger.info(`JobRunnerService.cancelJob: Cancelling job '${jobName}'`);
    const queue = this.facade._createQueue();
    return queue.cancelJob(jobName);
  }
}
