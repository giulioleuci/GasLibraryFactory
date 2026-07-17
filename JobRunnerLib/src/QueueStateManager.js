/**
 * @file JobRunnerLib/src/QueueStateManager.js
 * @description Manages atomic lock acquisition, versioning, state tracking, and retries.
 * Extracted from JobStateManager for improved separation of concerns.
 */

export class QueueStateManager {
  static get STATE_RUNNING() {
    return 'running';
  }
  static get STATE_COMPLETED() {
    return 'completed';
  }
  static get STATE_CANCELLED() {
    return 'cancelled';
  }
  static get STATE_FAILED() {
    return 'failed';
  }
  static get STATE_PENDING() {
    return 'pending';
  }
  static get LOCK_RETRY_DELAY_MS() {
    return 100;
  }

  constructor(jobName, propertiesService, utils, lockService) {
    if (!jobName || typeof jobName !== 'string') {
      throw new Error('JobStateManager: jobName is required and must be a non-empty string');
    }
    if (!propertiesService || typeof propertiesService !== 'object') {
      throw new Error('JobStateManager: propertiesService is required and must be an object');
    }
    if (
      typeof propertiesService.getProperty !== 'function' ||
      typeof propertiesService.setProperty !== 'function'
    ) {
      throw new Error(
        'JobStateManager: propertiesService must have getProperty and setProperty methods'
      );
    }
    if (!utils || typeof utils !== 'object') {
      throw new Error('JobStateManager: utils is required and must be an object');
    }
    if (typeof utils.sleep !== 'function') {
      throw new Error('JobStateManager: utils must have a sleep method');
    }
    if (!lockService || typeof lockService !== 'object') {
      throw new Error('JobStateManager: lockService is required and must be an object');
    }
    if (typeof lockService.getScriptLock !== 'function') {
      throw new Error('JobStateManager: lockService must have a getScriptLock method');
    }

    this.jobName = jobName;
    this._propertiesService = propertiesService;
    this._utils = utils;
    this._lockService = lockService;
  }

  _key(suffix) {
    return `${suffix}_${this.jobName}`;
  }

  getStateVersion() {
    const version = this._propertiesService.getProperty(this._key('version'));
    return version ? parseInt(version, 10) : 0;
  }

  _incrementVersion() {
    const currentVersion = this.getStateVersion();
    this._propertiesService.setProperty(this._key('version'), String(currentVersion + 1));
    return currentVersion + 1;
  }

  setState(state, expectedVersion = null) {
    if (expectedVersion !== null) {
      const currentVersion = this.getStateVersion();
      if (currentVersion !== expectedVersion) {
        return false; // Version mismatch, state was modified by another process
      }
    }
    this._propertiesService.setProperty(this._key('job'), state);
    this._incrementVersion();
    return true;
  }

  getState() {
    return this._propertiesService.getProperty(this._key('job'));
  }

  isCancelled() {
    const state = this.getState();
    return state === QueueStateManager.STATE_CANCELLED;
  }

  getStateWithVersion() {
    return {
      state: this.getState(),
      version: this.getStateVersion()
    };
  }

  tryAcquireRunning() {
    const stateKey = this._key('job');

    const lock = this._lockService.getScriptLock();
    if (!lock.tryLock(30000)) {
      return false;
    }

    try {
      const currentState = this._propertiesService.getProperty(stateKey);

      if (currentState === QueueStateManager.STATE_RUNNING) {
        const lockTimestampKey = this._key('lock_timestamp');
        const lockTimestamp = this._propertiesService.getProperty(lockTimestampKey);

        if (lockTimestamp) {
          const lockTime = parseInt(lockTimestamp, 10);
          const ONE_HOUR = 60 * 60 * 1000;
          if (Date.now() - lockTime < ONE_HOUR) {
            return false;
          }
        }
      }

      this._propertiesService.setProperty(stateKey, QueueStateManager.STATE_RUNNING);
      this._propertiesService.setProperty(this._key('lock_timestamp'), String(Date.now()));
      return true;
    } finally {
      lock.releaseLock();
    }
  }

  releaseLock() {
    this._propertiesService.deleteProperty(this._key('lock_timestamp'));
  }

  getRetryCount() {
    const count = this._propertiesService.getProperty(this._key('retryCount'));
    return count ? parseInt(count, 10) : 0;
  }

  incrementRetryCount() {
    const current = this.getRetryCount();
    const newCount = current + 1;
    this._propertiesService.setProperty(this._key('retryCount'), String(newCount));
    return newCount;
  }

  resetRetryCount() {
    this._propertiesService.deleteProperty(this._key('retryCount'));
  }

  saveFailureInfo(failureInfo) {
    this._propertiesService.setObjectProperty(this._key('failureInfo'), failureInfo);
  }

  getFailureInfo() {
    return this._propertiesService.getObjectProperty(this._key('failureInfo'));
  }

  reset() {
    const keys = ['job', 'lock_timestamp', 'retryCount', 'failureInfo', 'version'];
    keys.forEach((suffix) => this._propertiesService.deleteProperty(this._key(suffix)));
  }
}
