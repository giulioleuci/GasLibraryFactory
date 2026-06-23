/**
 * @fileoverview Tests for JobDefinitionRegistry class
 * @author GasLibraryFactory
 */

import { JobDefinitionRegistry } from '../JobDefinitionRegistry.js';
import { MockFactory } from '../../../test/fakes/MockFactory';

describe('JobDefinitionRegistry - Comprehensive Test Suite', () => {
  let registry;
  let mockLogger;
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    mockLogger = mocks.logger;
    registry = new JobDefinitionRegistry(mockLogger);
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should create instance with valid logger', () => {
      const instance = new JobDefinitionRegistry(mockLogger);
      expect(instance).toBeDefined();
      expect(instance.logger).toBe(mockLogger);
      expect(instance.definitions).toBeDefined();
    });

    it('should log initialization', () => {
      expect(mockLogger.hasLog('DEBUG', /Instance created with empty registry/i)).toBe(true);
    });

    it('should throw error if logger is null', () => {
      expect(() => {
        new JobDefinitionRegistry(null);
      }).toThrow('JobDefinitionRegistry: logger is required and cannot be null or undefined');
    });

    it('should throw error if logger is undefined', () => {
      expect(() => {
        new JobDefinitionRegistry(undefined);
      }).toThrow('JobDefinitionRegistry: logger is required and cannot be null or undefined');
    });

    it('should throw error if logger is not an object', () => {
      expect(() => {
        new JobDefinitionRegistry('not an object');
      }).toThrow('JobDefinitionRegistry: logger must be of type object');
    });

    it('should throw error if logger is missing debug method', () => {
      const invalidLogger = {
        error: jest.fn(),
        warn: jest.fn()
      };
      expect(() => {
        new JobDefinitionRegistry(invalidLogger);
      }).toThrow('JobDefinitionRegistry: logger must have method: debug');
    });

    it('should throw error if logger is missing error method', () => {
      const invalidLogger = {
        debug: jest.fn(),
        warn: jest.fn()
      };
      expect(() => {
        new JobDefinitionRegistry(invalidLogger);
      }).toThrow('JobDefinitionRegistry: logger must have method: error');
    });

    it('should throw error if logger is missing warn method', () => {
      const invalidLogger = {
        debug: jest.fn(),
        error: jest.fn()
      };
      expect(() => {
        new JobDefinitionRegistry(invalidLogger);
      }).toThrow('JobDefinitionRegistry: logger must have method: warn');
    });
  });

  // ===================================================================
  // register() Method Tests
  // ===================================================================
  describe('register() Method', () => {
    const validJobDefinition = {
      name: 'Test Job',
      description: 'A test job',
      action: function* () {
        yield { percentuale: 100 };
      }
    };

    it('should register a valid job definition', () => {
      registry.register('testJob', validJobDefinition);

      expect(registry.definitions.has('testJob')).toBe(true);
      expect(mockLogger.hasLog('DEBUG', /registered successfully/i)).toBe(true);
    });

    it('should throw error if job name is empty', () => {
      expect(() => {
        registry.register('', validJobDefinition);
      }).toThrow('JobDefinitionRegistry.register: Job name must be a non-empty string');
    });

    it('should throw error if job name is null', () => {
      expect(() => {
        registry.register(null, validJobDefinition);
      }).toThrow('JobDefinitionRegistry.register: Job name must be a non-empty string');
    });

    it('should throw error if job name is not a string', () => {
      expect(() => {
        registry.register(123, validJobDefinition);
      }).toThrow('JobDefinitionRegistry.register: Job name must be a non-empty string');
    });

    it('should throw error if job definition is null', () => {
      expect(() => {
        registry.register('testJob', null);
      }).toThrow('JobDefinitionRegistry.register: Job definition must be a valid object');
    });

    it('should throw error if job definition is not an object', () => {
      expect(() => {
        registry.register('testJob', 'not an object');
      }).toThrow('JobDefinitionRegistry.register: Job definition must be a valid object');
    });

    it('should throw error if name field is missing', () => {
      const invalidDef = {
        description: 'Test',
        action: function* () {}
      };
      expect(() => {
        registry.register('testJob', invalidDef);
      }).toThrow("JobDefinitionRegistry.register: Required field 'name' missing for job 'testJob'");
    });

    it('should default description to empty string if missing', () => {
      const def = {
        name: 'Test Job',
        action: function* () {}
      };
      registry.register('testJob', def);
      const retrieved = registry.getDefinition('testJob');
      expect(retrieved.description).toBe('');
    });

    it('should throw error if action field is missing', () => {
      const invalidDef = {
        name: 'Test Job',
        description: 'Test'
      };
      expect(() => {
        registry.register('testJob', invalidDef);
      }).toThrow(
        "JobDefinitionRegistry.register: Required field 'action' missing for job 'testJob'"
      );
    });

    it('should throw error if action is not a function', () => {
      const invalidDef = {
        name: 'Test Job',
        description: 'Test',
        action: 'not a function'
      };
      expect(() => {
        registry.register('testJob', invalidDef);
      }).toThrow(
        "JobDefinitionRegistry.register: Field 'action' must be a function for job 'testJob'"
      );
    });

    it('should throw error if requiredParameters is not an array', () => {
      const invalidDef = {
        name: 'Test Job',
        description: 'Test',
        action: function* () {},
        requiredParameters: 'not an array'
      };
      expect(() => {
        registry.register('testJob', invalidDef);
      }).toThrow(
        "JobDefinitionRegistry.register: Field 'requiredParameters' must be an array for job 'testJob'"
      );
    });

    it('should throw error if iterationLevels is not an array', () => {
      const invalidDef = {
        name: 'Test Job',
        description: 'Test',
        action: function* () {},
        iterationLevels: 'not an array'
      };
      expect(() => {
        registry.register('testJob', invalidDef);
      }).toThrow(
        "JobDefinitionRegistry.register: Field 'iterationLevels' must be an array for job 'testJob'"
      );
    });

    it('should throw error if finalAction is not a function', () => {
      const invalidDef = {
        name: 'Test Job',
        description: 'Test',
        action: function* () {},
        finalAction: 'not a function'
      };
      expect(() => {
        registry.register('testJob', invalidDef);
      }).toThrow(
        "JobDefinitionRegistry.register: Field 'finalAction' must be a function for job 'testJob'"
      );
    });

    it('should accept valid job with requiredParameters', () => {
      const jobDef = {
        ...validJobDefinition,
        requiredParameters: ['param1', 'param2']
      };

      registry.register('testJob', jobDef);
      expect(registry.definitions.has('testJob')).toBe(true);
    });

    it('should accept valid job with iterationLevels', () => {
      const jobDef = {
        ...validJobDefinition,
        iterationLevels: ['level1', 'level2']
      };

      registry.register('testJob', jobDef);
      expect(registry.definitions.has('testJob')).toBe(true);
    });

    it('should accept valid job with finalAction', () => {
      const jobDef = {
        ...validJobDefinition,
        finalAction: () => {
          console.log('done');
        }
      };

      registry.register('testJob', jobDef);
      expect(registry.definitions.has('testJob')).toBe(true);
    });

    it('should warn when overwriting existing job', () => {
      registry.register('testJob', validJobDefinition);
      mockLogger.clear();

      registry.register('testJob', validJobDefinition);

      expect(mockLogger.hasLog('WARN', /Overwriting existing definition/i)).toBe(true);
    });
  });

  // ===================================================================
  // getDefinition() Method Tests
  // ===================================================================
  describe('getDefinition() Method', () => {
    const validJobDefinition = {
      name: 'Test Job',
      description: 'A test job',
      action: function* () {
        yield { percentuale: 100 };
      }
    };

    beforeEach(() => {
      registry.register('testJob', validJobDefinition);
    });

    it('should retrieve existing job definition', () => {
      const definition = registry.getDefinition('testJob');

      expect(definition).toBe(validJobDefinition);
      expect(mockLogger.hasLog('DEBUG', /retrieved successfully/i)).toBe(true);
    });

    it('should return null for non-existing job', () => {
      const definition = registry.getDefinition('nonExistentJob');

      expect(definition).toBeNull();
      expect(mockLogger.hasLog('ERROR', /not found in registry/i)).toBe(true);
    });

    it('should return null if job name is empty', () => {
      const definition = registry.getDefinition('');

      expect(definition).toBeNull();
      expect(mockLogger.hasLog('ERROR', /Job name must be a non-empty string/i)).toBe(true);
    });

    it('should return null if job name is null', () => {
      const definition = registry.getDefinition(null);

      expect(definition).toBeNull();
    });

    it('should return null if job name is not a string', () => {
      const definition = registry.getDefinition(123);

      expect(definition).toBeNull();
    });
  });

  // ===================================================================
  // listRegisteredJobs() Method Tests
  // ===================================================================
  describe('listRegisteredJobs() Method', () => {
    it('should return empty array when no jobs registered', () => {
      const jobs = registry.listRegisteredJobs();

      expect(jobs).toEqual([]);
      expect(mockLogger.hasLog('DEBUG', /0 jobs registered/i)).toBe(true);
    });

    it('should return array of registered job names', () => {
      const jobDef = {
        name: 'Test Job',
        description: 'Test',
        action: function* () {}
      };

      registry.register('job1', jobDef);
      registry.register('job2', jobDef);
      registry.register('job3', jobDef);

      const jobs = registry.listRegisteredJobs();

      expect(jobs).toHaveLength(3);
      expect(jobs).toContain('job1');
      expect(jobs).toContain('job2');
      expect(jobs).toContain('job3');
    });

    it('should log the number of registered jobs', () => {
      const jobDef = {
        name: 'Test Job',
        description: 'Test',
        action: function* () {}
      };

      registry.register('job1', jobDef);
      registry.register('job2', jobDef);

      registry.listRegisteredJobs();

      expect(mockLogger.hasLog('DEBUG', /2 jobs registered/i)).toBe(true);
    });
  });

  // ===================================================================
  // jobExists() Method Tests
  // ===================================================================
  describe('jobExists() Method', () => {
    beforeEach(() => {
      const jobDef = {
        name: 'Test Job',
        description: 'Test',
        action: function* () {}
      };
      registry.register('existingJob', jobDef);
    });

    it('should return true for existing job', () => {
      expect(registry.jobExists('existingJob')).toBe(true);
    });

    it('should return false for non-existing job', () => {
      expect(registry.jobExists('nonExistentJob')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(registry.jobExists('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(registry.jobExists(null)).toBe(false);
    });

    it('should return false for non-string value', () => {
      expect(registry.jobExists(123)).toBe(false);
    });
  });

  // ===================================================================
  // removeJob() Method Tests
  // ===================================================================
  describe('removeJob() Method', () => {
    beforeEach(() => {
      const jobDef = {
        name: 'Test Job',
        description: 'Test',
        action: function* () {}
      };
      registry.register('testJob', jobDef);
    });

    it('should remove existing job', () => {
      const removed = registry.removeJob('testJob');

      expect(removed).toBe(true);
      expect(registry.definitions.has('testJob')).toBe(false);
      expect(mockLogger.hasLog('DEBUG', /removed from registry/i)).toBe(true);
    });

    it('should return false for non-existing job', () => {
      const removed = registry.removeJob('nonExistentJob');

      expect(removed).toBe(false);
      expect(mockLogger.hasLog('WARN', /did not exist in registry/i)).toBe(true);
    });

    it('should return false if job name is empty', () => {
      const removed = registry.removeJob('');

      expect(removed).toBe(false);
      expect(mockLogger.hasLog('ERROR', /Job name must be a non-empty string/i)).toBe(true);
    });

    it('should return false if job name is null', () => {
      const removed = registry.removeJob(null);

      expect(removed).toBe(false);
    });

    it('should return false if job name is not a string', () => {
      const removed = registry.removeJob(123);

      expect(removed).toBe(false);
    });
  });

  // ===================================================================
  // getStatistics() Method Tests
  // ===================================================================
  describe('getStatistics() Method', () => {
    it('should return statistics for empty registry', () => {
      const stats = registry.getStatistics();

      expect(stats.totalJobs).toBe(0);
      expect(stats.jobsByCategory).toEqual({});
      expect(stats.jobsWithParameters).toBe(0);
    });

    it('should count total jobs correctly', () => {
      const jobDef = {
        name: 'Test Job',
        description: 'Test',
        action: function* () {}
      };

      registry.register('job1', jobDef);
      registry.register('job2', jobDef);

      const stats = registry.getStatistics();
      expect(stats.totalJobs).toBe(2);
    });

    it('should categorize Generation jobs', () => {
      const jobDef = {
        name: 'Generate Report',
        description: 'Generates monthly report',
        action: function* () {}
      };

      registry.register('job1', jobDef);

      const stats = registry.getStatistics();
      expect(stats.jobsByCategory.Generation).toBe(1);
    });

    it('should categorize Email jobs', () => {
      const emailJobDef = {
        name: 'Send Email',
        description: 'Send email to users',
        action: function* () {}
      };

      registry.register('emailJob', emailJobDef);

      const stats = registry.getStatistics();
      expect(stats.jobsByCategory.Email).toBe(1);
    });

    it('should categorize Import jobs', () => {
      const importJobDef = {
        name: 'Import Data',
        description: 'Import data from source',
        action: function* () {}
      };

      registry.register('importJob', importJobDef);

      const stats = registry.getStatistics();
      expect(stats.jobsByCategory.Import).toBe(1);
    });

    it('should categorize Infrastructure jobs', () => {
      const infraJobDef = {
        name: 'Create Structure',
        description: 'Create folder structure',
        action: function* () {}
      };

      registry.register('infraJob', infraJobDef);

      const stats = registry.getStatistics();
      expect(stats.jobsByCategory.Infrastructure).toBe(1);
    });

    it('should categorize uncategorized jobs as Other', () => {
      const otherJobDef = {
        name: 'Other Job',
        description: 'Does something else',
        action: function* () {}
      };

      registry.register('otherJob', otherJobDef);

      const stats = registry.getStatistics();
      expect(stats.jobsByCategory.Other).toBe(1);
    });

    it('should count jobs with parameters', () => {
      const jobWithParams = {
        name: 'Job With Params',
        description: 'Test',
        action: function* () {},
        requiredParameters: ['param1', 'param2']
      };

      const jobWithoutParams = {
        name: 'Job Without Params',
        description: 'Test',
        action: function* () {}
      };

      registry.register('job1', jobWithParams);
      registry.register('job2', jobWithoutParams);

      const stats = registry.getStatistics();
      expect(stats.jobsWithParameters).toBe(1);
    });

    it('should not count jobs with empty parameter array', () => {
      const jobWithEmptyParams = {
        name: 'Job',
        description: 'Test',
        action: function* () {},
        requiredParameters: []
      };

      registry.register('job1', jobWithEmptyParams);

      const stats = registry.getStatistics();
      expect(stats.jobsWithParameters).toBe(0);
    });

    it('should log statistics retrieval', () => {
      const jobDef = {
        name: 'Test',
        description: 'Test',
        action: function* () {}
      };

      registry.register('job1', jobDef);
      registry.register('job2', jobDef);

      registry.getStatistics();

      expect(mockLogger.hasLog('DEBUG', /total jobs in registry/i)).toBe(true);
    });

    it('should handle multiple categories correctly', () => {
      const jobs = [
        { name: 'Gen', description: 'Generate report', action: function* () {} },
        { name: 'Email', description: 'Send email', action: function* () {} },
        { name: 'Import', description: 'Import data', action: function* () {} },
        { name: 'Other', description: 'Other task', action: function* () {} }
      ];

      jobs.forEach((job, idx) => registry.register(`job${idx}`, job));

      const stats = registry.getStatistics();
      expect(stats.jobsByCategory.Generation).toBe(1);
      expect(stats.jobsByCategory.Email).toBe(1);
      expect(stats.jobsByCategory.Import).toBe(1);
      expect(stats.jobsByCategory.Other).toBe(1);
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should support full lifecycle: register, retrieve, remove', () => {
      const jobDef = {
        name: 'Test Job',
        description: 'A comprehensive test',
        action: function* () {
          yield { percentuale: 100 };
        },
        requiredParameters: ['param1']
      };

      // Register
      registry.register('lifecycleJob', jobDef);
      expect(registry.jobExists('lifecycleJob')).toBe(true);

      // Retrieve
      const retrieved = registry.getDefinition('lifecycleJob');
      expect(retrieved).toBe(jobDef);

      // List
      const jobs = registry.listRegisteredJobs();
      expect(jobs).toContain('lifecycleJob');

      // Statistics
      const stats = registry.getStatistics();
      expect(stats.totalJobs).toBe(1);
      expect(stats.jobsWithParameters).toBe(1);

      // Remove
      const removed = registry.removeJob('lifecycleJob');
      expect(removed).toBe(true);
      expect(registry.jobExists('lifecycleJob')).toBe(false);
    });

    it('should handle multiple jobs with different configurations', () => {
      const jobs = [
        {
          name: 'Import Job',
          description: 'Import data from external source',
          action: function* () {},
          requiredParameters: ['sourceId']
        },
        {
          name: 'Email Job',
          description: 'Send email notifications',
          action: function* () {},
          finalAction: () => {}
        },
        {
          name: 'Generation Job',
          description: 'Generate reports',
          action: function* () {},
          iterationLevels: ['monthly', 'weekly']
        }
      ];

      jobs.forEach((job, idx) => registry.register(`job${idx}`, job));

      expect(registry.listRegisteredJobs()).toHaveLength(3);

      const stats = registry.getStatistics();
      expect(stats.totalJobs).toBe(3);
      expect(stats.jobsWithParameters).toBe(1);
      expect(stats.jobsByCategory.Import).toBe(1);
      expect(stats.jobsByCategory.Email).toBe(1);
      expect(stats.jobsByCategory.Generation).toBe(1);
    });
  });
});
