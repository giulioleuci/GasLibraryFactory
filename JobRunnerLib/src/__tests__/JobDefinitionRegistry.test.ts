import { jest } from '@jest/globals';
/**
 * @fileoverview Tests for JobDefinitionRegistry class
 * @author GasLibraryFactory
 */

import { JobDefinitionRegistry } from '../JobDefinitionRegistry.js';
import { MockFactory } from '../../../test/fakes/MockFactory';
import { Registry } from '@CoreUtilsLib';

describe('JobDefinitionRegistry - Comprehensive Test Suite', () => {
  let registry: JobDefinitionRegistry;
  let mockLogger: ReturnType<typeof MockFactory.createAllJest>['logger'];
  let mocks: ReturnType<typeof MockFactory.createAllJest>;

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
      expect(instance).toBeInstanceOf(JobDefinitionRegistry);
      expect(instance.logger).toBe(mockLogger);
      // `definitions` is a Map-backed CoreUtilsLib Registry, freshly
      // constructed empty (see JobDefinitionRegistry constructor).
      expect(instance.definitions).toBeInstanceOf(Registry);
      expect(instance.definitions.size).toBe(0);
    });

    it('should log initialization', () => {
      expect(mockLogger.hasLog('DEBUG', /Instance created with empty registry/i)).toBe(true);
    });

    it('should throw error if logger is null', () => {
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        new JobDefinitionRegistry(null);
      }).toThrow('JobDefinitionRegistry: logger is required and cannot be null or undefined');
    });

    it('should throw error if logger is undefined', () => {
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        new JobDefinitionRegistry(undefined);
      }).toThrow('JobDefinitionRegistry: logger is required and cannot be null or undefined');
    });

    it('should throw error if logger is not an object', () => {
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        new JobDefinitionRegistry('not an object');
      }).toThrow('JobDefinitionRegistry: logger must be of type object');
    });

    it('should throw error if logger is missing debug method', () => {
      const invalidLogger = {
        error: jest.fn(),
        warn: jest.fn()
      };
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        new JobDefinitionRegistry(invalidLogger);
      }).toThrow('JobDefinitionRegistry: logger must have method: debug');
    });

    it('should throw error if logger is missing error method', () => {
      const invalidLogger = {
        debug: jest.fn(),
        warn: jest.fn()
      };
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        new JobDefinitionRegistry(invalidLogger);
      }).toThrow('JobDefinitionRegistry: logger must have method: error');
    });

    it('should throw error if logger is missing warn method', () => {
      const invalidLogger = {
        debug: jest.fn(),
        error: jest.fn()
      };
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
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
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        registry.register(null, validJobDefinition);
      }).toThrow('JobDefinitionRegistry.register: Job name must be a non-empty string');
    });

    it('should throw error if job name is not a string', () => {
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        registry.register(123, validJobDefinition);
      }).toThrow('JobDefinitionRegistry.register: Job name must be a non-empty string');
    });

    it('should throw error if job definition is null', () => {
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        registry.register('testJob', null);
      }).toThrow('JobDefinitionRegistry.register: Job definition must be a valid object');
    });

    it('should throw error if job definition is not an object', () => {
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        registry.register('testJob', 'not an object');
      }).toThrow('JobDefinitionRegistry.register: Job definition must be a valid object');
    });

    it('should throw error if name field is missing', () => {
      const invalidDef = {
        description: 'Test',
        action: function* () {}
      };
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
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
      expect(retrieved!.description).toBe('');
    });

    it('should throw error if action field is missing', () => {
      const invalidDef = {
        name: 'Test Job',
        description: 'Test'
      };
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
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
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
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
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
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
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
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
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
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

      // @ts-expect-error Registry array validation accepts tokens without executing iteration levels.
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
      // @ts-expect-error Exercise the existing runtime validation of invalid input.
      const definition = registry.getDefinition(null);

      expect(definition).toBeNull();
    });

    it('should return null if job name is not a string', () => {
      // @ts-expect-error Exercise the existing runtime validation of invalid input.
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
      mockLogger.clear();
      expect(registry.jobExists('nonExistentJob')).toBe(false);
      expect(mockLogger.hasLog('ERROR', /not found in registry/i)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(registry.jobExists('')).toBe(false);
    });

    it('should return false for null', () => {
      // @ts-expect-error Exercise the existing runtime validation of invalid input.
      expect(registry.jobExists(null)).toBe(false);
    });

    it('should return false for non-string value', () => {
      // @ts-expect-error Exercise the existing runtime validation of invalid input.
      expect(registry.jobExists(123)).toBe(false);
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should support full lifecycle: register, retrieve, list', () => {
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

      // @ts-expect-error Registry-only fixtures store iteration tokens without executing them.
      jobs.forEach((job, idx) => registry.register(`job${idx}`, job));

      expect(registry.listRegisteredJobs()).toHaveLength(3);
    });
  });
});
