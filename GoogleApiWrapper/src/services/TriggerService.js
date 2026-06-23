/**
 * @file GoogleApiWrapper/src/services/MyTriggerService.js
 * @description Facade for Google Apps Script's ScriptApp trigger management.
 * Provides a clean, testable interface for creating and managing triggers.
 * @version 1.0 - Translated from Italian and refactored for standalone use.
 */

/**
 * @class TriggerService
 * @description Facade for Google Apps Script ScriptApp trigger management. Specializes in time-based scheduling for JobRunnerLib resumption and recurring maintenance tasks. Provides programmatic discovery, audit, and cleanup of script triggers.
 * 
 * @property {LoggerService} _logger Diagnostic logger.
 */
export class TriggerService {
  /**
   * @description Initializes TriggerService with diagnostic logging.
   * @param {LoggerService} logger Diagnostic logger.
   */
  constructor(logger) {
    /**
     * Logger instance for operation logging.
     * @private
     * @type {MyLoggerService}
     */
    this._logger = logger;
  }

  /**
   * @description Schedules a one-time execution after a specific delay. Ideal for Approaching-Timeout resumption patterns.
   * @param {string} functionName Target function identifier.
   * @param {number} milliseconds Execution delay.
   * @returns {string} Unique trigger identifier.
   * @throws {Error} If delay is invalid or quota exceeded.
   */
  createTimedTrigger(functionName, milliseconds) {
    try {
      const trigger = ScriptApp.newTrigger(functionName).timeBased().after(milliseconds).create();

      const triggerId = trigger.getUniqueId();
      this._logger.debug(
        `Timed trigger created: ${functionName} -> ${triggerId} (after ${milliseconds}ms)`
      );
      return triggerId;
    } catch (error) {
      this._logger.error(`Error creating timed trigger for ${functionName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Schedules a recurring execution based on a simplified CRON-like expression.
   * @param {string} functionName Target function identifier.
   * @param {string} cronExpression Schedule definition (e.g., 'every 5 minutes').
   * @returns {string} Unique trigger identifier.
   * @throws {Error} On invalid schedule expression.
   */
  createRecurringTrigger(functionName, cronExpression) {
    try {
      const parsed = this._parseCronExpression(cronExpression);

      if (parsed.type === 'minutes') {
        return this.createEveryMinutesTrigger(functionName, parsed.interval);
      } else if (parsed.type === 'hours') {
        return this.createEveryHoursTrigger(functionName, parsed.interval);
      } else if (parsed.type === 'daily') {
        return this.createDailyTrigger(functionName, parsed.hour);
      } else if (parsed.type === 'weekly') {
        return this.createWeeklyTrigger(functionName, parsed.weekDay, parsed.hour);
      } else {
        throw new Error(`Unsupported cron pattern: ${cronExpression}`);
      }
    } catch (error) {
      this._logger.error(`Error creating recurring trigger for ${functionName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @private
   * @description Maps CRON-like strings to native ScriptApp trigger builders.
   * @param {string} cronExpression Schedule definition.
   * @returns {Object} Parsed schedule metadata.
   */
  _parseCronExpression(cronExpression) {
    if (!cronExpression || typeof cronExpression !== 'string') {
      throw new Error('Cron expression must be a non-empty string');
    }

    const parts = cronExpression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error(`Invalid cron expression: expected 5 fields, got ${parts.length}`);
    }

    const [minute, hour, day, month, weekday] = parts;

    // Check for minute intervals: */N * * * *
    const minuteIntervalMatch = minute.match(/^\*\/(\d+)$/);
    if (minuteIntervalMatch && hour === '*' && day === '*' && month === '*' && weekday === '*') {
      const interval = parseInt(minuteIntervalMatch[1], 10);
      const validMinuteIntervals = [1, 5, 10, 15, 30];
      if (!validMinuteIntervals.includes(interval)) {
        throw new Error(
          `Invalid minute interval: ${interval}. Must be one of: ${validMinuteIntervals.join(', ')}`
        );
      }
      return { type: 'minutes', interval };
    }

    // Check for hour intervals: 0 */N * * *
    const hourIntervalMatch = hour.match(/^\*\/(\d+)$/);
    if (minute === '0' && hourIntervalMatch && day === '*' && month === '*' && weekday === '*') {
      const interval = parseInt(hourIntervalMatch[1], 10);
      const validHourIntervals = [1, 2, 4, 6, 8, 12];
      if (!validHourIntervals.includes(interval)) {
        throw new Error(
          `Invalid hour interval: ${interval}. Must be one of: ${validHourIntervals.join(', ')}`
        );
      }
      return { type: 'hours', interval };
    }

    // Check for every hour: 0 * * * *
    if (minute === '0' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
      return { type: 'hours', interval: 1 };
    }

    // Check for weekly: 0 H * * D (where H is hour 0-23, D is weekday 0-7)
    const hourNum = parseInt(hour, 10);
    const weekdayNum = parseInt(weekday, 10);
    if (
      minute === '0' &&
      !isNaN(hourNum) &&
      hourNum >= 0 &&
      hourNum <= 23 &&
      day === '*' &&
      month === '*' &&
      !isNaN(weekdayNum) &&
      weekdayNum >= 0 &&
      weekdayNum <= 7
    ) {
      // Map numeric weekday to ScriptApp.WeekDay
      const weekDayMap = {
        0: ScriptApp.WeekDay.SUNDAY,
        1: ScriptApp.WeekDay.MONDAY,
        2: ScriptApp.WeekDay.TUESDAY,
        3: ScriptApp.WeekDay.WEDNESDAY,
        4: ScriptApp.WeekDay.THURSDAY,
        5: ScriptApp.WeekDay.FRIDAY,
        6: ScriptApp.WeekDay.SATURDAY,
        7: ScriptApp.WeekDay.SUNDAY // 7 is also Sunday in some cron implementations
      };
      return { type: 'weekly', hour: hourNum, weekDay: weekDayMap[weekdayNum] };
    }

    // Check for daily: 0 H * * * (where H is hour 0-23, weekday is *)
    if (
      minute === '0' &&
      !isNaN(hourNum) &&
      hourNum >= 0 &&
      hourNum <= 23 &&
      day === '*' &&
      month === '*' &&
      weekday === '*'
    ) {
      return { type: 'daily', hour: hourNum };
    }

    throw new Error(
      `Unsupported cron pattern: ${cronExpression}. See method documentation for supported patterns.`
    );
  }

  /**
   * @description Audits all triggers associated with the current script project.
   * @returns {Object[]} Collection of trigger metadata {id, function, type, event}.
   */
  getAllTriggers() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const triggerInfo = triggers.map((trigger) => ({
        id: trigger.getUniqueId(),
        function: trigger.getHandlerFunction(),
        type: this._determineTriggerType(trigger),
        event: trigger.getEventType()
      }));

      this._logger.debug(`Found ${triggerInfo.length} triggers in project`);
      return triggerInfo;
    } catch (error) {
      this._logger.error(`Error retrieving project triggers: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Retrieves a specific trigger by its ID.
   * @param {string} triggerId Unique ID of the trigger.
   * @returns {GoogleAppsScript.Script.Trigger|null} Trigger object or null if not found.
   */
  findTriggerById(triggerId) {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const trigger = triggers.find((t) => t.getUniqueId() === triggerId);

      if (trigger) {
        this._logger.debug(`Trigger found: ${triggerId} -> ${trigger.getHandlerFunction()}`);
        return trigger;
      } else {
        this._logger.debug(`Trigger not found: ${triggerId}`);
        return null;
      }
    } catch (error) {
      this._logger.error(`Error searching for trigger ${triggerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Destroys a specific trigger.
   * @param {string} triggerId Unique ID of the trigger to delete.
   * @returns {boolean} True if deleted successfully, false if not found.
   */
  deleteTriggerById(triggerId) {
    try {
      const trigger = this.findTriggerById(triggerId);
      if (trigger) {
        ScriptApp.deleteTrigger(trigger);
        this._logger.debug(`Trigger deleted: ${triggerId}`);
        return true;
      } else {
        this._logger.warn(`Attempted to delete non-existent trigger: ${triggerId}`);
        return false;
      }
    } catch (error) {
      this._logger.error(`Error deleting trigger ${triggerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Destroys all triggers targeting a specific global function.
   * @param {string} functionName Name of the function.
   * @returns {number} Number of triggers deleted.
   */
  deleteTriggersByFunction(functionName) {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const triggersToDelete = triggers.filter((t) => t.getHandlerFunction() === functionName);

      triggersToDelete.forEach((trigger) => {
        ScriptApp.deleteTrigger(trigger);
      });

      this._logger.debug(
        `Deleted ${triggersToDelete.length} triggers for function: ${functionName}`
      );
      return triggersToDelete.length;
    } catch (error) {
      this._logger.error(`Error deleting triggers for ${functionName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Destroys all project-associated triggers. WARNING: Destructive.
   * @returns {number} Number of triggers deleted.
   */
  deleteAllTriggers() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const numberOfTriggers = triggers.length;

      triggers.forEach((trigger) => {
        ScriptApp.deleteTrigger(trigger);
      });

      this._logger.info(`Deleted all ${numberOfTriggers} project triggers`);
      return numberOfTriggers;
    } catch (error) {
      this._logger.error(`Error deleting all triggers: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Validates presence of at least one trigger for a specific function.
   * @param {string} functionName Name of the function.
   * @returns {boolean}
   */
  triggerExistsForFunction(functionName) {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const trigger = triggers.find((t) => t.getHandlerFunction() === functionName);

      const exists = !!trigger;
      this._logger.debug(`Trigger for ${functionName}: ${exists ? 'exists' : 'does not exist'}`);
      return exists;
    } catch (error) {
      this._logger.error(`Error checking trigger for ${functionName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Retrieves detailed metadata for a trigger.
   * @param {string} triggerId Unique ID of the trigger.
   * @returns {Object|null} Metadata {id, function, type, event, enabled}.
   */
  getTriggerInfo(triggerId) {
    try {
      const trigger = this.findTriggerById(triggerId);
      if (!trigger) {
        return null;
      }

      return {
        id: trigger.getUniqueId(),
        function: trigger.getHandlerFunction(),
        type: this._determineTriggerType(trigger),
        event: trigger.getEventType(),
        enabled: trigger.isDisabled() === false
      };
    } catch (error) {
      this._logger.error(`Error retrieving trigger info for ${triggerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Finds all triggers for a specific function.
   * @param {string} functionName Name of the function.
   * @returns {Object[]} Collection of trigger metadata.
   */
  findTriggersByFunction(functionName) {
    try {
      const allTriggers = this.getAllTriggers();
      const functionTriggers = allTriggers.filter((t) => t.function === functionName);

      this._logger.debug(`Found ${functionTriggers.length} triggers for function: ${functionName}`);
      return functionTriggers;
    } catch (error) {
      this._logger.error(`Error finding triggers for ${functionName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Finds all triggers of a specific type.
   * @param {string} triggerType Type of trigger (e.g., 'time_based').
   * @returns {Object[]} Collection of trigger metadata.
   */
  findTriggersByType(triggerType) {
    try {
      const allTriggers = this.getAllTriggers();
      const typeTriggers = allTriggers.filter((t) => t.type === triggerType);

      this._logger.debug(`Found ${typeTriggers.length} triggers of type: ${triggerType}`);
      return typeTriggers;
    } catch (error) {
      this._logger.error(`Error finding triggers by type ${triggerType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @private
   * @description Determines the type of a trigger.
   * @param {GoogleAppsScript.Script.Trigger} trigger Native GAS trigger.
   * @returns {string} Category string.
   */
  _determineTriggerType(trigger) {
    try {
      // In Google Apps Script, triggers can be of different types
      const eventType = trigger.getEventType();

      if (eventType === ScriptApp.EventType.CLOCK) {
        return 'time_based';
      } else if (eventType === ScriptApp.EventType.ON_OPEN) {
        return 'document_open';
      } else if (eventType === ScriptApp.EventType.ON_EDIT) {
        return 'document_edit';
      } else if (eventType === ScriptApp.EventType.ON_FORM_SUBMIT) {
        return 'form_submit';
      } else if (eventType === ScriptApp.EventType.ON_CHANGE) {
        return 'spreadsheet_change';
      } else if (eventType === ScriptApp.EventType.ON_EVENT_UPDATED) {
        return 'calendar_event_updated';
      } else {
        return 'other';
      }
    } catch (error) {
      this._logger.warn(`Unable to determine trigger type: ${error.message}`);
      return 'unknown';
    }
  }

  /**
   * @description Schedules a one-time execution at an absolute Date/Time.
   * @param {string} functionName Target function identifier.
   * @param {Date} date Fire date.
   * @returns {string} Unique identifier.
   */
  createTriggerAt(functionName, date) {
    try {
      const trigger = ScriptApp.newTrigger(functionName).timeBased().at(date).create();

      const triggerId = trigger.getUniqueId();
      this._logger.debug(`Trigger created to run at ${date}: ${functionName} -> ${triggerId}`);
      return triggerId;
    } catch (error) {
      this._logger.error(
        `Error creating trigger at specific time for ${functionName}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * @description Schedules high-frequency recurring execution.
   * @param {string} functionName Target function identifier.
   * @param {number} minutes Interval in minutes (1, 5, 10, 15, or 30).
   * @returns {string} Unique identifier.
   */
  createEveryMinutesTrigger(functionName, minutes) {
    try {
      const validIntervals = [1, 5, 10, 15, 30];
      if (!validIntervals.includes(minutes)) {
        throw new Error(`Invalid interval. Must be one of: ${validIntervals.join(', ')}`);
      }

      const trigger = ScriptApp.newTrigger(functionName).timeBased().everyMinutes(minutes).create();

      const triggerId = trigger.getUniqueId();
      this._logger.debug(
        `Trigger created to run every ${minutes} minutes: ${functionName} -> ${triggerId}`
      );
      return triggerId;
    } catch (error) {
      this._logger.error(
        `Error creating every-minutes trigger for ${functionName}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * @description Schedules hourly recurring execution.
   * @param {string} functionName Target function identifier.
   * @param {number} hours Interval in hours (1, 2, 4, 6, 8, or 12).
   * @returns {string} Unique identifier.
   */
  createEveryHoursTrigger(functionName, hours) {
    try {
      const validIntervals = [1, 2, 4, 6, 8, 12];
      if (!validIntervals.includes(hours)) {
        throw new Error(`Invalid interval. Must be one of: ${validIntervals.join(', ')}`);
      }

      const trigger = ScriptApp.newTrigger(functionName).timeBased().everyHours(hours).create();

      const triggerId = trigger.getUniqueId();
      this._logger.debug(
        `Trigger created to run every ${hours} hours: ${functionName} -> ${triggerId}`
      );
      return triggerId;
    } catch (error) {
      this._logger.error(
        `Error creating every-hours trigger for ${functionName}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * @description Schedules daily recurring execution at a specific hour.
   * @param {string} functionName Target function identifier.
   * @param {number} hour Hour of day (0-23).
   * @returns {string} Unique identifier.
   */
  createDailyTrigger(functionName, hour) {
    try {
      if (hour < 0 || hour > 23) {
        throw new Error('Hour must be between 0 and 23');
      }

      const trigger = ScriptApp.newTrigger(functionName)
        .timeBased()
        .everyDays(1)
        .atHour(hour)
        .create();

      const triggerId = trigger.getUniqueId();
      this._logger.debug(`Daily trigger created at hour ${hour}: ${functionName} -> ${triggerId}`);
      return triggerId;
    } catch (error) {
      this._logger.error(`Error creating daily trigger for ${functionName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description Schedules weekly recurring execution on a specific day.
   * @param {string} functionName Target function identifier.
   * @param {GoogleAppsScript.Script.WeekDay} weekDay Day of week.
   * @param {number} hour Hour of day (0-23).
   * @returns {string} Unique identifier.
   */
  createWeeklyTrigger(functionName, weekDay, hour) {
    try {
      const trigger = ScriptApp.newTrigger(functionName)
        .timeBased()
        .onWeekDay(weekDay)
        .atHour(hour)
        .create();

      const triggerId = trigger.getUniqueId();
      this._logger.debug(`Weekly trigger created: ${functionName} -> ${triggerId}`);
      return triggerId;
    } catch (error) {
      this._logger.error(`Error creating weekly trigger for ${functionName}: ${error.message}`);
      throw error;
    }
  }
}

// Export alias for backwards compatibility
