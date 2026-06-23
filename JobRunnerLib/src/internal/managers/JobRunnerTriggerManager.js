/**
 * @file JobRunnerLib/src/managers/JobRunnerTriggerManager.js
 * @description Manager for automatic resume triggers and trigger context discovery.
 */

export class JobTriggerManager {
  constructor(jobName, propertiesService, triggerService, triggerDelayMs = 60 * 1000) {
    this.jobName = jobName;
    this._propertiesService = propertiesService;
    this._triggerService = triggerService;
    this._triggerDelayMs = triggerDelayMs;
  }

  createResumeTrigger() {
    this.deleteExistingTriggers();
    const triggerId = this._triggerService.createTimedTrigger('resumeJob', this._triggerDelayMs);
    this._propertiesService.setProperty(`trigger_${this.jobName}`, triggerId);
    this._propertiesService.setProperty(`job_for_trigger_${triggerId}`, this.jobName);
  }

  deleteExistingTriggers() {
    const triggerId = this._propertiesService.getProperty(`trigger_${this.jobName}`);
    if (triggerId) {
      this._triggerService.deleteTriggerById(triggerId);
      this._propertiesService.deleteProperty(`trigger_${this.jobName}`);
      this._propertiesService.deleteProperty(`job_for_trigger_${triggerId}`);
    }
  }
}

export class JobRunnerTriggerManager {
  constructor(facade) {
    this._logger = facade._logger;
    this._triggerService = facade._triggerService;
  }

  /**
   * Discovers the unique identifier of the trigger that initiated current execution.
   * @private
   * @returns {string|null} Trigger ID if context is matched; null if direct execution or discovery fails.
   */
  _getCurrentTriggerId() {
    try {
      const triggers = this._triggerService.getAllTriggers();
      const trigger = triggers.find((t) => t.id);
      return trigger ? trigger.id : null;
    } catch (_error) {
      this._logger.warn('JobRunnerService._getCurrentTriggerId: Unable to determine trigger ID');
      return null;
    }
  }
}
