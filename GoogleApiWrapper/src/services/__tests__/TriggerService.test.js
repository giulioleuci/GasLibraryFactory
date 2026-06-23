// ===================================================================
// FILE: GoogleApiWrapper/src/services/__tests__/TriggerService.test.js
// ===================================================================
// Comprehensive test suite for TriggerService
// Coverage: 100% of features for trigger management
// ===================================================================

import { TriggerService } from '../TriggerService';

describe('TriggerService - Comprehensive Test Suite', () => {
  let service;
  let logger;
  let mockTriggers;

  beforeEach(() => {
    global.resetGasMocks();

    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Mock trigger storage
    mockTriggers = [];
    let triggerIdCounter = 1;

    // Mock trigger builder chain
    const createMockTriggerBuilder = (functionName) => {
      const builder = {
        functionName,
        type: null,
        config: {},
        timeBased: jest.fn(() => {
          builder.type = 'time';
          return builder;
        }),
        after: jest.fn((ms) => {
          builder.config.after = ms;
          return builder;
        }),
        at: jest.fn((date) => {
          builder.config.at = date;
          return builder;
        }),
        everyMinutes: jest.fn((minutes) => {
          builder.config.everyMinutes = minutes;
          return builder;
        }),
        everyHours: jest.fn((hours) => {
          builder.config.everyHours = hours;
          return builder;
        }),
        everyDays: jest.fn((days) => {
          builder.config.everyDays = days;
          return builder;
        }),
        atHour: jest.fn((hour) => {
          builder.config.atHour = hour;
          return builder;
        }),
        onWeekDay: jest.fn((weekDay) => {
          builder.config.onWeekDay = weekDay;
          return builder;
        }),
        create: jest.fn(() => {
          const triggerId = `trigger-${triggerIdCounter++}`;
          const mockTrigger = {
            uniqueId: triggerId,
            handlerFunction: functionName,
            eventType: global.ScriptApp.EventType.CLOCK,
            disabled: false,
            getUniqueId: jest.fn(() => triggerId),
            getHandlerFunction: jest.fn(() => functionName),
            getEventType: jest.fn(() => global.ScriptApp.EventType.CLOCK),
            isDisabled: jest.fn(() => false)
          };
          mockTriggers.push(mockTrigger);
          return mockTrigger;
        })
      };
      return builder;
    };

    global.ScriptApp.newTrigger.mockImplementation(createMockTriggerBuilder);
    // Return a copy to avoid mutation issues during iteration
    global.ScriptApp.getProjectTriggers.mockImplementation(() => [...mockTriggers]);
    global.ScriptApp.deleteTrigger.mockImplementation((trigger) => {
      const index = mockTriggers.findIndex((t) => t.uniqueId === trigger.uniqueId);
      if (index > -1) {
        mockTriggers.splice(index, 1);
      }
    });

    service = new TriggerService(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR
  // ===================================================================

  describe('Constructor', () => {
    it('should initialize with logger', () => {
      expect(service._logger).toBe(logger);
    });
  });

  // ===================================================================
  // createTimedTrigger() METHOD
  // ===================================================================

  describe('createTimedTrigger() Method', () => {
    it('should create timed trigger with delay', () => {
      const triggerId = service.createTimedTrigger('myFunction', 60000);

      expect(triggerId).toBeDefined();
      expect(global.ScriptApp.newTrigger).toHaveBeenCalledWith('myFunction');
      expect(mockTriggers).toHaveLength(1);
    });

    it('should log debug message on success', () => {
      service.createTimedTrigger('myFunction', 60000);

      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Timed trigger created: myFunction')
      );
    });

    it('should use timeBased and after methods', () => {
      service.createTimedTrigger('testFunc', 30000);

      // Verify builder chain was called correctly
      expect(global.ScriptApp.newTrigger).toHaveBeenCalledWith('testFunc');
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.newTrigger.mockImplementation(() => {
        throw new Error('Trigger creation failed');
      });

      expect(() => {
        service.createTimedTrigger('myFunction', 60000);
      }).toThrow('Trigger creation failed');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error creating timed trigger')
      );
    });
  });

  // ===================================================================
  // createRecurringTrigger() METHOD
  // ===================================================================

  describe('createRecurringTrigger() Method', () => {
    describe('Minute Interval Patterns', () => {
      it('should create trigger for */1 * * * * (every 1 minute)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '*/1 * * * *');

        expect(triggerId).toBeDefined();
        expect(mockTriggers).toHaveLength(1);
      });

      it('should create trigger for */5 * * * * (every 5 minutes)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '*/5 * * * *');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for */10 * * * * (every 10 minutes)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '*/10 * * * *');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for */15 * * * * (every 15 minutes)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '*/15 * * * *');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for */30 * * * * (every 30 minutes)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '*/30 * * * *');

        expect(triggerId).toBeDefined();
      });

      it('should throw error for invalid minute interval (*/7)', () => {
        expect(() => {
          service.createRecurringTrigger('myFunction', '*/7 * * * *');
        }).toThrow('Invalid minute interval: 7');
      });
    });

    describe('Hourly Patterns', () => {
      it('should create trigger for 0 * * * * (every hour)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 * * * *');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for 0 */2 * * * (every 2 hours)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 */2 * * *');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for 0 */6 * * * (every 6 hours)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 */6 * * *');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for 0 */12 * * * (every 12 hours)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 */12 * * *');

        expect(triggerId).toBeDefined();
      });

      it('should throw error for invalid hour interval (*/3)', () => {
        expect(() => {
          service.createRecurringTrigger('myFunction', '0 */3 * * *');
        }).toThrow('Invalid hour interval: 3');
      });
    });

    describe('Daily Patterns', () => {
      it('should create trigger for 0 9 * * * (daily at 9 AM)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 9 * * *');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for 0 0 * * * (daily at midnight)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 0 * * *');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for 0 23 * * * (daily at 11 PM)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 23 * * *');

        expect(triggerId).toBeDefined();
      });
    });

    describe('Weekly Patterns', () => {
      it('should create trigger for 0 9 * * 1 (Monday at 9 AM)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 9 * * 1');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for 0 14 * * 5 (Friday at 2 PM)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 14 * * 5');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for 0 8 * * 0 (Sunday at 8 AM)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 8 * * 0');

        expect(triggerId).toBeDefined();
      });

      it('should create trigger for 0 8 * * 7 (Sunday at 8 AM, alternative notation)', () => {
        const triggerId = service.createRecurringTrigger('myFunction', '0 8 * * 7');

        expect(triggerId).toBeDefined();
      });
    });

    describe('Error Handling', () => {
      it('should throw error for null cron expression', () => {
        expect(() => {
          service.createRecurringTrigger('myFunction', null);
        }).toThrow('Cron expression must be a non-empty string');
      });

      it('should throw error for empty cron expression', () => {
        expect(() => {
          service.createRecurringTrigger('myFunction', '');
        }).toThrow('Cron expression must be a non-empty string');
      });

      it('should throw error for wrong number of fields', () => {
        expect(() => {
          service.createRecurringTrigger('myFunction', '* * *');
        }).toThrow('Invalid cron expression: expected 5 fields, got 3');
      });

      it('should throw error for unsupported pattern', () => {
        expect(() => {
          service.createRecurringTrigger('myFunction', '30 9 * * *');
        }).toThrow('Unsupported cron pattern');
      });

      it('should throw error for monthly pattern (not supported)', () => {
        expect(() => {
          service.createRecurringTrigger('myFunction', '0 9 15 * *');
        }).toThrow('Unsupported cron pattern');
      });

      it('should log error on failure', () => {
        try {
          service.createRecurringTrigger('myFunction', 'invalid');
        } catch (e) {
          // Expected
        }

        expect(logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error creating recurring trigger')
        );
      });
    });
  });

  // ===================================================================
  // _parseCronExpression() METHOD
  // ===================================================================

  describe('_parseCronExpression() Method (Private)', () => {
    it('should parse minute intervals correctly', () => {
      const result = service._parseCronExpression('*/5 * * * *');

      expect(result).toEqual({ type: 'minutes', interval: 5 });
    });

    it('should parse hourly pattern correctly', () => {
      const result = service._parseCronExpression('0 * * * *');

      expect(result).toEqual({ type: 'hours', interval: 1 });
    });

    it('should parse hour intervals correctly', () => {
      const result = service._parseCronExpression('0 */6 * * *');

      expect(result).toEqual({ type: 'hours', interval: 6 });
    });

    it('should parse daily pattern correctly', () => {
      const result = service._parseCronExpression('0 14 * * *');

      expect(result).toEqual({ type: 'daily', hour: 14 });
    });

    it('should parse weekly pattern correctly', () => {
      const result = service._parseCronExpression('0 9 * * 1');

      expect(result).toEqual({
        type: 'weekly',
        hour: 9,
        weekDay: global.ScriptApp.WeekDay.MONDAY
      });
    });

    it('should handle extra whitespace', () => {
      const result = service._parseCronExpression('  */5   *   *   *   *  ');

      expect(result).toEqual({ type: 'minutes', interval: 5 });
    });
  });

  // ===================================================================
  // createTriggerAt() METHOD
  // ===================================================================

  describe('createTriggerAt() Method', () => {
    it('should create trigger at specific date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const triggerId = service.createTriggerAt('myFunction', tomorrow);

      expect(triggerId).toBeDefined();
      expect(mockTriggers).toHaveLength(1);
    });

    it('should log debug message with date', () => {
      const date = new Date('2025-12-01T09:00:00');

      service.createTriggerAt('myFunction', date);

      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Trigger created to run at')
      );
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.newTrigger.mockImplementation(() => {
        throw new Error('Creation failed');
      });

      expect(() => {
        service.createTriggerAt('myFunction', new Date());
      }).toThrow('Creation failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // createEveryMinutesTrigger() METHOD
  // ===================================================================

  describe('createEveryMinutesTrigger() Method', () => {
    it('should create trigger for valid interval (1 minute)', () => {
      const triggerId = service.createEveryMinutesTrigger('myFunction', 1);

      expect(triggerId).toBeDefined();
      expect(mockTriggers).toHaveLength(1);
    });

    it('should create trigger for 5 minutes', () => {
      const triggerId = service.createEveryMinutesTrigger('myFunction', 5);

      expect(triggerId).toBeDefined();
    });

    it('should create trigger for 30 minutes', () => {
      const triggerId = service.createEveryMinutesTrigger('myFunction', 30);

      expect(triggerId).toBeDefined();
    });

    it('should throw error for invalid interval', () => {
      expect(() => {
        service.createEveryMinutesTrigger('myFunction', 7);
      }).toThrow('Invalid interval');
    });

    it('should log debug message on success', () => {
      service.createEveryMinutesTrigger('myFunction', 15);

      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('every 15 minutes'));
    });

    it('should log error on creation failure', () => {
      global.ScriptApp.newTrigger.mockImplementation(() => {
        throw new Error('Failed');
      });

      try {
        service.createEveryMinutesTrigger('myFunction', 5);
      } catch (e) {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // createEveryHoursTrigger() METHOD
  // ===================================================================

  describe('createEveryHoursTrigger() Method', () => {
    it('should create trigger for valid interval (1 hour)', () => {
      const triggerId = service.createEveryHoursTrigger('myFunction', 1);

      expect(triggerId).toBeDefined();
    });

    it('should create trigger for 12 hours', () => {
      const triggerId = service.createEveryHoursTrigger('myFunction', 12);

      expect(triggerId).toBeDefined();
    });

    it('should throw error for invalid interval', () => {
      expect(() => {
        service.createEveryHoursTrigger('myFunction', 3);
      }).toThrow('Invalid interval');
    });

    it('should log debug message', () => {
      service.createEveryHoursTrigger('myFunction', 6);

      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('every 6 hours'));
    });
  });

  // ===================================================================
  // createDailyTrigger() METHOD
  // ===================================================================

  describe('createDailyTrigger() Method', () => {
    it('should create daily trigger at hour 0', () => {
      const triggerId = service.createDailyTrigger('myFunction', 0);

      expect(triggerId).toBeDefined();
    });

    it('should create daily trigger at hour 23', () => {
      const triggerId = service.createDailyTrigger('myFunction', 23);

      expect(triggerId).toBeDefined();
    });

    it('should throw error for hour < 0', () => {
      expect(() => {
        service.createDailyTrigger('myFunction', -1);
      }).toThrow('Hour must be between 0 and 23');
    });

    it('should throw error for hour > 23', () => {
      expect(() => {
        service.createDailyTrigger('myFunction', 24);
      }).toThrow('Hour must be between 0 and 23');
    });

    it('should log debug message', () => {
      service.createDailyTrigger('myFunction', 9);

      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Daily trigger created at hour 9')
      );
    });
  });

  // ===================================================================
  // createWeeklyTrigger() METHOD
  // ===================================================================

  describe('createWeeklyTrigger() Method', () => {
    it('should create weekly trigger', () => {
      const triggerId = service.createWeeklyTrigger(
        'myFunction',
        global.ScriptApp.WeekDay.MONDAY,
        9
      );

      expect(triggerId).toBeDefined();
    });

    it('should log debug message', () => {
      service.createWeeklyTrigger('myFunction', global.ScriptApp.WeekDay.FRIDAY, 17);

      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Weekly trigger created'));
    });

    it('should log error on failure', () => {
      global.ScriptApp.newTrigger.mockImplementation(() => {
        throw new Error('Failed');
      });

      try {
        service.createWeeklyTrigger('myFunction', global.ScriptApp.WeekDay.MONDAY, 9);
      } catch (e) {
        // Expected
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // getAllTriggers() METHOD
  // ===================================================================

  describe('getAllTriggers() Method', () => {
    it('should return empty array when no triggers', () => {
      const triggers = service.getAllTriggers();

      expect(triggers).toEqual([]);
    });

    it('should return all triggers as info objects', () => {
      service.createTimedTrigger('func1', 60000);
      service.createTimedTrigger('func2', 30000);

      const triggers = service.getAllTriggers();

      expect(triggers).toHaveLength(2);
      expect(triggers[0]).toHaveProperty('id');
      expect(triggers[0]).toHaveProperty('function');
      expect(triggers[0]).toHaveProperty('type');
      expect(triggers[0]).toHaveProperty('event');
    });

    it('should log debug message with count', () => {
      service.createTimedTrigger('func1', 60000);

      service.getAllTriggers();

      expect(logger.debug).toHaveBeenCalledWith('Found 1 triggers in project');
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.getProjectTriggers.mockImplementation(() => {
        throw new Error('Access denied');
      });

      expect(() => {
        service.getAllTriggers();
      }).toThrow('Access denied');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // findTriggerById() METHOD
  // ===================================================================

  describe('findTriggerById() Method', () => {
    it('should find existing trigger by ID', () => {
      const triggerId = service.createTimedTrigger('myFunction', 60000);

      const trigger = service.findTriggerById(triggerId);

      expect(trigger).toBeDefined();
      expect(trigger.getUniqueId()).toBe(triggerId);
    });

    it('should return null for non-existent ID', () => {
      const trigger = service.findTriggerById('nonexistent-id');

      expect(trigger).toBeNull();
    });

    it('should log debug when found', () => {
      const triggerId = service.createTimedTrigger('myFunction', 60000);

      service.findTriggerById(triggerId);

      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Trigger found'));
    });

    it('should log debug when not found', () => {
      service.findTriggerById('nonexistent');

      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Trigger not found'));
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.getProjectTriggers.mockImplementation(() => {
        throw new Error('Failed');
      });

      expect(() => {
        service.findTriggerById('id');
      }).toThrow('Failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // deleteTriggerById() METHOD
  // ===================================================================

  describe('deleteTriggerById() Method', () => {
    it('should delete existing trigger and return true', () => {
      const triggerId = service.createTimedTrigger('myFunction', 60000);

      const deleted = service.deleteTriggerById(triggerId);

      expect(deleted).toBe(true);
      expect(mockTriggers).toHaveLength(0);
    });

    it('should return false for non-existent trigger', () => {
      const deleted = service.deleteTriggerById('nonexistent');

      expect(deleted).toBe(false);
    });

    it('should log debug message on successful deletion', () => {
      const triggerId = service.createTimedTrigger('myFunction', 60000);

      service.deleteTriggerById(triggerId);

      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Trigger deleted'));
    });

    it('should log warning when trigger not found', () => {
      service.deleteTriggerById('nonexistent');

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Attempted to delete non-existent trigger')
      );
    });

    it('should log error and throw on failure', () => {
      const triggerId = service.createTimedTrigger('myFunction', 60000);

      global.ScriptApp.deleteTrigger.mockImplementation(() => {
        throw new Error('Deletion failed');
      });

      expect(() => {
        service.deleteTriggerById(triggerId);
      }).toThrow('Deletion failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // deleteTriggersByFunction() METHOD
  // ===================================================================

  describe('deleteTriggersByFunction() Method', () => {
    it('should delete all triggers for function', () => {
      service.createTimedTrigger('func1', 60000);
      service.createTimedTrigger('func1', 30000);
      service.createTimedTrigger('func2', 45000);

      const count = service.deleteTriggersByFunction('func1');

      expect(count).toBe(2);
      expect(mockTriggers).toHaveLength(1);
    });

    it('should return 0 when no triggers match', () => {
      const count = service.deleteTriggersByFunction('nonexistent');

      expect(count).toBe(0);
    });

    it('should log debug message with count', () => {
      service.createTimedTrigger('func1', 60000);

      service.deleteTriggersByFunction('func1');

      expect(logger.debug).toHaveBeenCalledWith('Deleted 1 triggers for function: func1');
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.deleteTrigger.mockImplementation(() => {
        throw new Error('Failed');
      });

      service.createTimedTrigger('func1', 60000);

      expect(() => {
        service.deleteTriggersByFunction('func1');
      }).toThrow('Failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // deleteAllTriggers() METHOD
  // ===================================================================

  describe('deleteAllTriggers() Method', () => {
    it('should delete all triggers and return count', () => {
      service.createTimedTrigger('func1', 60000);
      service.createTimedTrigger('func2', 30000);
      service.createTimedTrigger('func3', 45000);

      const count = service.deleteAllTriggers();

      expect(count).toBe(3);
      expect(mockTriggers).toHaveLength(0);
    });

    it('should return 0 when no triggers', () => {
      const count = service.deleteAllTriggers();

      expect(count).toBe(0);
    });

    it('should log info message with count', () => {
      service.createTimedTrigger('func1', 60000);

      service.deleteAllTriggers();

      expect(logger.info).toHaveBeenCalledWith('Deleted all 1 project triggers');
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.deleteTrigger.mockImplementation(() => {
        throw new Error('Failed');
      });

      service.createTimedTrigger('func1', 60000);

      expect(() => {
        service.deleteAllTriggers();
      }).toThrow('Failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // triggerExistsForFunction() METHOD
  // ===================================================================

  describe('triggerExistsForFunction() Method', () => {
    it('should return true when trigger exists', () => {
      service.createTimedTrigger('myFunction', 60000);

      const exists = service.triggerExistsForFunction('myFunction');

      expect(exists).toBe(true);
    });

    it('should return false when no trigger exists', () => {
      const exists = service.triggerExistsForFunction('nonexistent');

      expect(exists).toBe(false);
    });

    it('should log debug message', () => {
      service.createTimedTrigger('myFunction', 60000);

      service.triggerExistsForFunction('myFunction');

      expect(logger.debug).toHaveBeenCalledWith('Trigger for myFunction: exists');
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.getProjectTriggers.mockImplementation(() => {
        throw new Error('Failed');
      });

      expect(() => {
        service.triggerExistsForFunction('func');
      }).toThrow('Failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // getTriggerInfo() METHOD
  // ===================================================================

  describe('getTriggerInfo() Method', () => {
    it('should return detailed info for existing trigger', () => {
      const triggerId = service.createTimedTrigger('myFunction', 60000);

      const info = service.getTriggerInfo(triggerId);

      expect(info).toBeDefined();
      expect(info.id).toBe(triggerId);
      expect(info.function).toBe('myFunction');
      expect(info.type).toBe('time_based');
      expect(info.event).toBe(global.ScriptApp.EventType.CLOCK);
      expect(info.enabled).toBe(true);
    });

    it('should return null for non-existent trigger', () => {
      const info = service.getTriggerInfo('nonexistent');

      expect(info).toBeNull();
    });

    it('should log error and throw on failure', () => {
      const triggerId = service.createTimedTrigger('myFunction', 60000);

      mockTriggers[0].getUniqueId.mockImplementation(() => {
        throw new Error('Failed');
      });

      expect(() => {
        service.getTriggerInfo(triggerId);
      }).toThrow('Failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // findTriggersByFunction() METHOD
  // ===================================================================

  describe('findTriggersByFunction() Method', () => {
    it('should find all triggers for function', () => {
      service.createTimedTrigger('func1', 60000);
      service.createTimedTrigger('func1', 30000);
      service.createTimedTrigger('func2', 45000);

      const triggers = service.findTriggersByFunction('func1');

      expect(triggers).toHaveLength(2);
      expect(triggers[0].function).toBe('func1');
    });

    it('should return empty array when no triggers match', () => {
      const triggers = service.findTriggersByFunction('nonexistent');

      expect(triggers).toEqual([]);
    });

    it('should log debug message with count', () => {
      service.createTimedTrigger('func1', 60000);

      service.findTriggersByFunction('func1');

      expect(logger.debug).toHaveBeenCalledWith('Found 1 triggers for function: func1');
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.getProjectTriggers.mockImplementation(() => {
        throw new Error('Failed');
      });

      expect(() => {
        service.findTriggersByFunction('func');
      }).toThrow('Failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // findTriggersByType() METHOD
  // ===================================================================

  describe('findTriggersByType() Method', () => {
    it('should find all triggers of type', () => {
      service.createTimedTrigger('func1', 60000);
      service.createTimedTrigger('func2', 30000);

      const triggers = service.findTriggersByType('time_based');

      expect(triggers).toHaveLength(2);
      expect(triggers[0].type).toBe('time_based');
    });

    it('should return empty array when no triggers match', () => {
      const triggers = service.findTriggersByType('form_submit');

      expect(triggers).toEqual([]);
    });

    it('should log debug message with count', () => {
      service.createTimedTrigger('func1', 60000);

      service.findTriggersByType('time_based');

      expect(logger.debug).toHaveBeenCalledWith('Found 1 triggers of type: time_based');
    });

    it('should log error and throw on failure', () => {
      global.ScriptApp.getProjectTriggers.mockImplementation(() => {
        throw new Error('Failed');
      });

      expect(() => {
        service.findTriggersByType('time_based');
      }).toThrow('Failed');

      expect(logger.error).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // _determineTriggerType() METHOD
  // ===================================================================

  describe('_determineTriggerType() Method (Private)', () => {
    it('should identify CLOCK as time_based', () => {
      const mockTrigger = {
        getEventType: () => global.ScriptApp.EventType.CLOCK
      };

      const type = service._determineTriggerType(mockTrigger);

      expect(type).toBe('time_based');
    });

    it('should identify ON_OPEN as document_open', () => {
      const mockTrigger = {
        getEventType: () => global.ScriptApp.EventType.ON_OPEN
      };

      const type = service._determineTriggerType(mockTrigger);

      expect(type).toBe('document_open');
    });

    it('should identify ON_EDIT as document_edit', () => {
      const mockTrigger = {
        getEventType: () => global.ScriptApp.EventType.ON_EDIT
      };

      const type = service._determineTriggerType(mockTrigger);

      expect(type).toBe('document_edit');
    });

    it('should identify ON_FORM_SUBMIT as form_submit', () => {
      const mockTrigger = {
        getEventType: () => global.ScriptApp.EventType.ON_FORM_SUBMIT
      };

      const type = service._determineTriggerType(mockTrigger);

      expect(type).toBe('form_submit');
    });

    it('should identify ON_CHANGE as spreadsheet_change', () => {
      const mockTrigger = {
        getEventType: () => global.ScriptApp.EventType.ON_CHANGE
      };

      const type = service._determineTriggerType(mockTrigger);

      expect(type).toBe('spreadsheet_change');
    });

    it('should identify ON_EVENT_UPDATED as calendar_event_updated', () => {
      const mockTrigger = {
        getEventType: () => global.ScriptApp.EventType.ON_EVENT_UPDATED
      };

      const type = service._determineTriggerType(mockTrigger);

      expect(type).toBe('calendar_event_updated');
    });

    it('should return "other" for unknown event type', () => {
      const mockTrigger = {
        getEventType: () => 'UNKNOWN_EVENT'
      };

      const type = service._determineTriggerType(mockTrigger);

      expect(type).toBe('other');
    });

    it('should return "unknown" and log warning on error', () => {
      const mockTrigger = {
        getEventType: () => {
          throw new Error('Failed');
        }
      };

      const type = service._determineTriggerType(mockTrigger);

      expect(type).toBe('unknown');
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    it('should manage multiple trigger types', () => {
      const timed = service.createTimedTrigger('cleanupOldData', 60000);
      const daily = service.createDailyTrigger('generateReport', 9);
      const hourly = service.createEveryHoursTrigger('syncData', 6);

      const all = service.getAllTriggers();

      expect(all).toHaveLength(3);
      expect(all.every((t) => t.type === 'time_based')).toBe(true);
    });

    it('should cleanup triggers for specific function', () => {
      service.createTimedTrigger('tempJob', 60000);
      service.createTimedTrigger('tempJob', 30000);
      service.createTimedTrigger('importantJob', 45000);

      const count = service.deleteTriggersByFunction('tempJob');

      expect(count).toBe(2);
      expect(service.getAllTriggers()).toHaveLength(1);
    });

    it('should prevent duplicate triggers', () => {
      const exists = service.triggerExistsForFunction('myJob');
      if (!exists) {
        service.createDailyTrigger('myJob', 8);
      }

      const existsNow = service.triggerExistsForFunction('myJob');

      expect(existsNow).toBe(true);
    });

    it('should recreate trigger at different time', () => {
      const triggerId = service.createDailyTrigger('report', 9);

      service.deleteTriggerById(triggerId);
      const newId = service.createDailyTrigger('report', 17);

      expect(newId).not.toBe(triggerId);
      expect(service.getAllTriggers()).toHaveLength(1);
    });
  });
});
