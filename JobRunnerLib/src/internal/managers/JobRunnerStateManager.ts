import type { JobProperties, JobUtilities, JobLocks, StateDriveService } from '../../types.js';
/**
 * @file JobRunnerLib/src/managers/JobRunnerStateManager.js
 * @description Manager for job state persistence and status tracking.
 */

import { QueueStateManager } from '../../QueueStateManager';
import { QueuePersistenceHandler } from '../QueuePersistenceHandler';
import { QueueProgressTracker } from '../QueueProgressTracker';

export interface JobStateManager
  extends
    Pick<
      QueueStateManager,
      | '_key'
      | 'getStateVersion'
      | '_incrementVersion'
      | 'setState'
      | 'getState'
      | 'isCancelled'
      | 'getStateWithVersion'
      | 'tryAcquireRunning'
      | 'releaseLock'
      | 'getRetryCount'
      | 'incrementRetryCount'
      | 'resetRetryCount'
      | 'saveFailureInfo'
      | 'getFailureInfo'
    >,
    Pick<
      QueuePersistenceHandler,
      | 'batchSave'
      | 'saveResumeState'
      | 'loadResumeState'
      | 'clearResumeState'
      | '_saveLargeStateToDrive'
      | '_loadLargeStateFromDrive'
      | '_getOrCreateJobStateFolder'
      | 'saveConfiguration'
      | 'loadConfiguration'
      | 'saveType'
      | 'loadType'
    >,
    Pick<QueueProgressTracker, 'saveProgress'> {}

export class JobStateManager {
  declare jobName: string;
  declare _propertiesService: JobProperties;
  declare _utils: JobUtilities;
  declare _lockService: JobLocks;
  declare _driveService: StateDriveService | null;
  declare stateManager: QueueStateManager;
  declare persistenceHandler: QueuePersistenceHandler;
  declare progressTracker: QueueProgressTracker;

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
  static get LARGE_STATE_THRESHOLD() {
    return QueuePersistenceHandler.LARGE_STATE_THRESHOLD;
  }

  constructor(
    jobName: string,
    propertiesService: JobProperties,
    utils: JobUtilities,
    lockService: JobLocks,
    driveService: StateDriveService | null = null
  ) {
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
    ] as const;
    stateMethods.forEach((m) => {
      (this as Record<(typeof stateMethods)[number], (...args: never[]) => unknown>)[m] =
        this.stateManager[m].bind(this.stateManager);
    });

    const persistenceMethods = [
      'batchSave',
      'saveResumeState',
      'loadResumeState',
      'clearResumeState',
      '_saveLargeStateToDrive',
      '_loadLargeStateFromDrive',
      '_getOrCreateJobStateFolder',
      'saveConfiguration',
      'loadConfiguration',
      'saveType',
      'loadType'
    ] as const;
    persistenceMethods.forEach((m) => {
      (this as Record<(typeof persistenceMethods)[number], (...args: never[]) => unknown>)[m] =
        this.persistenceHandler[m].bind(this.persistenceHandler);
    });

    const progressMethods = ['saveProgress'] as const;
    progressMethods.forEach((m) => {
      (this as Record<(typeof progressMethods)[number], (...args: never[]) => unknown>)[m] =
        this.progressTracker[m].bind(this.progressTracker);
    });
  }

  reset() {
    this.stateManager.reset();
    this.persistenceHandler.reset();
    this.progressTracker.reset();
  }
}

export class JobRunnerStateManager {
  declare facade: Pick<
    import('../../JobRunnerService.js').MyJobRunnerService,
    '_createQueue' | '_logger'
  >;

  constructor(
    facade: Pick<import('../../JobRunnerService.js').MyJobRunnerService, '_createQueue' | '_logger'>
  ) {
    this.facade = facade;
  }

  getStatus(jobName: string) {
    const queue = this.facade._createQueue();
    return queue.getStatus(jobName);
  }

  resetJob(jobName: string) {
    const queue = this.facade._createQueue();
    return queue.resetJobState(jobName);
  }

  cancelJob(jobName: string) {
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
