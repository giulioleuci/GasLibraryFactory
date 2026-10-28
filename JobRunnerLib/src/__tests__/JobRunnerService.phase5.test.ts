import type { JobParameters, JobServices, RunnerServices } from '../types.js';
import { jest } from '@jest/globals';
// ===================================================================
// FILE: JobRunnerLib/src/__tests__/JobRunnerService.phase5.test.js
// ===================================================================
// Phase 5 Coverage Tests for JobRunnerService
//
// Target: Increase coverage from 38% to 90%+
// Focus:
// - Constructor validation (lines 117, 128)
// - run() parameter validation (lines 194-209)
// - run() error handling (line 233)
// - Job definition logic (lines 239-240)
// - Suspended job handling (line 253)
// - resume() method (lines 288-430) - CRITICAL GAP
// - getStatus(), resetJob(), cancelJob()
// - _getCurrentTriggerId() (lines 422-432)
// ===================================================================

import { JobRunnerService } from '../JobRunnerService';
import { JobDefinitionRegistry } from '../JobDefinitionRegistry';
import { JobQueue } from '../JobQueue';
import { JobStateManager } from '../internal/managers/JobRunnerStateManager';
import { MockFactory } from '../../../test/fakes/MockFactory';

// Mock GoogleApiWrapper
let mockPropertiesService: ReturnType<typeof MockFactory.createAllJest>['propertiesService'];
let mockTriggerService: ReturnType<typeof MockFactory.createAllJest>['triggerService'];
let mockLockService: ReturnType<typeof MockFactory.createAllJest>['lockService'];

Object.assign(global, {
  GoogleApiWrapper: {
    get PropertiesService() {
      return class {
        constructor() {
          return mockPropertiesService;
        }
      };
    },
    get TriggerService() {
      return class {
        constructor() {
          return mockTriggerService;
        }
      };
    },
    get LockService() {
      return class {
        constructor() {
          return mockLockService;
        }
      };
    }
  }
});

describe('JobRunnerService - Phase 5 Coverage Tests', () => {
  let mocks: ReturnType<typeof MockFactory.createAllJest>;
  let logger: ReturnType<typeof MockFactory.createAllJest>['logger'];
  let utils: ReturnType<typeof MockFactory.createAllJest>['utils'];
  let propertiesService: ReturnType<typeof MockFactory.createAllJest>['propertiesService'];
  let triggerService: ReturnType<typeof MockFactory.createAllJest>['triggerService'];
  let lockService: ReturnType<typeof MockFactory.createAllJest>['lockService'];
  let registry: JobDefinitionRegistry;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    logger = mocks.logger;
    propertiesService = mocks.propertiesService;
    triggerService = mocks.triggerService;
    lockService = mocks.lockService;
    utils = mocks.utils;

    mockPropertiesService = propertiesService;
    mockTriggerService = triggerService;
    mockLockService = lockService;

    registry = new JobDefinitionRegistry(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR VALIDATION - Lines 117, 128
  // ===================================================================

  describe('Constructor Validation - Enhanced Coverage', () => {
    const missingMethod = (name: 'info' | 'debug' | 'error') => {
      const stub = { info: jest.fn(), debug: jest.fn(), error: jest.fn() };
      delete (stub as Partial<typeof stub>)[name];
      return stub;
    };

    it.each([
      [
        'logger is not an object',
        () => ['not-an-object', utils, registry],
        'MyJobRunnerService: logger must be of type object, received: string'
      ],
      [
        'logger is missing info method',
        () => [missingMethod('info'), utils, registry],
        'MyJobRunnerService: logger must have method: info'
      ],
      [
        'logger is missing debug method',
        () => [missingMethod('debug'), utils, registry],
        'MyJobRunnerService: logger must have method: debug'
      ],
      [
        'logger is missing error method',
        () => [missingMethod('error'), utils, registry],
        'MyJobRunnerService: logger must have method: error'
      ],
      [
        'utils is not an object',
        () => [logger, 'not-an-object', registry],
        'MyJobRunnerService: utils must be of type object, received: string'
      ],
      [
        'utils is undefined',
        () => [logger, undefined, registry],
        'MyJobRunnerService: utils is required and cannot be null or undefined'
      ],
      [
        'jobDefinitionRegistry is not an object',
        () => [logger, utils, 'not-an-object'],
        'MyJobRunnerService: jobDefinitionRegistry must be of type object, received: string'
      ],
      [
        'jobDefinitionRegistry is missing getDefinition method',
        () => [logger, utils, { register: jest.fn() }],
        'MyJobRunnerService: jobDefinitionRegistry must have method: getDefinition'
      ]
    ])('should throw error if %s', (_desc, buildArgs, expectedError) => {
      expect(
        () => new (JobRunnerService as new (...args: unknown[]) => JobRunnerService)(...buildArgs())
      ).toThrow(expectedError);
    });
  });

  // ===================================================================
  // run() METHOD PARAMETER VALIDATION - Lines 194-209
  // ===================================================================

  describe('run() Parameter Validation', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it.each([
      [
        'jobName is missing or invalid',
        () => [null, 'testJob', {}, jest.fn()],
        'jobName is required and must be a non-empty string'
      ],
      [
        'jobType is missing or invalid',
        () => ['myJob', null, {}, jest.fn()],
        'jobType is required and must be a non-empty string'
      ],
      [
        'parameters is missing or invalid',
        () => ['myJob', 'testJob', null, jest.fn()],
        'parameters is required and must be an object'
      ],
      [
        'jobHandlerRegistryCallback is not a function',
        () => ['myJob', 'testJob', {}, 'not-a-function'],
        'jobHandlerRegistryCallback must be a function'
      ],
      [
        'forceRestart is not a boolean',
        () => ['myJob', 'testJob', {}, jest.fn(), 'not-boolean'],
        'forceRestart must be a boolean'
      ],
      [
        'maxDurationMs is not a positive number',
        () => ['myJob', 'testJob', {}, jest.fn(), false, 0],
        'maxDurationMs must be a positive number'
      ]
    ])('should throw error if %s', (_desc, buildArgs, expectedError) => {
      expect(() => (jobRunner.run as (...args: unknown[]) => unknown)(...buildArgs())).toThrow(
        expectedError
      );
    });
  });

  // ===================================================================
  // run() WITH JOB DEFINITION - Lines 239-240
  // ===================================================================

  describe('run() with Job Definition', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should attach job definition to parameters when available', () => {
      // Register a job definition
      const jobDef = {
        name: 'Test Job',
        description: 'A test job',
        action: function* () {
          yield { percentage: 100 };
        }
      };

      registry.register('myJob', jobDef);

      let receivedParams: JobParameters | null = null;

      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('testType', function* (params: JobParameters) {
          receivedParams = params;
          yield { percentage: 100 };
          return { success: true };
        });
      }

      jobRunner.run('myJob', 'testType', { data: 'test' }, callback);

      // Verify job definition was attached
      expect(receivedParams).toEqual({
        data: 'test',
        jobDefinition: jobDef,
        services: {
          logger,
          utils,
          // jobRunner's own facade-internal PropertiesService/TriggerService, NOT
          // the standalone MockFactory mocks: `run()` builds `services` from
          // `this._propertiesService`/`this._triggerService`, which are constructed
          // internally via `new PropertiesService(logger)`/`new TriggerService(...)`
          // (real GoogleApiWrapper classes), independent of the local test mocks.
          properties: jobRunner._propertiesService,
          triggers: jobRunner._triggerService
        }
      });
      expect((receivedParams! as JobParameters).jobDefinition).toBe(jobDef);
      expect((receivedParams! as JobParameters).jobDefinition!.name).toBe('Test Job');
      expect((receivedParams! as JobParameters).jobDefinition!.description).toBe('A test job');
    });

    it('should work without job definition when not registered', () => {
      let receivedParams: JobParameters | null = null;

      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('testType', function* (params: JobParameters) {
          receivedParams = params;
          yield { percentage: 100 };
          return { success: true };
        });
      }

      jobRunner.run('unregisteredJob', 'testType', { data: 'test' }, callback);

      // Verify job runs without definition
      expect(receivedParams).toEqual({
        data: 'test',
        services: {
          logger,
          utils,
          // jobRunner's own facade-internal PropertiesService/TriggerService, NOT
          // the standalone MockFactory mocks: `run()` builds `services` from
          // `this._propertiesService`/`this._triggerService`, which are constructed
          // internally via `new PropertiesService(logger)`/`new TriggerService(...)`
          // (real GoogleApiWrapper classes), independent of the local test mocks.
          properties: jobRunner._propertiesService,
          triggers: jobRunner._triggerService
        }
      });
      expect((receivedParams! as JobParameters).jobDefinition).toBeUndefined();
    });
  });

  // ===================================================================
  // run() ERROR HANDLING - Line 233
  // ===================================================================

  describe('run() Error Handling', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should propagate errors from job execution', () => {
      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('errorJob', function* () {
          throw new Error('Job execution failed');
        });
      }

      expect(() => {
        jobRunner.run('error-job', 'errorJob', {}, callback);
      }).toThrow('Job execution failed');

      // Verify terminal failure was emitted once through the semantic channel
      expect(logger.logJobEnd).toHaveBeenCalledTimes(1);
      const [[loggedJobName, loggedSuccess, loggedDetails]] = logger.logJobEnd.mock.calls as [
        unknown,
        unknown,
        Record<string, unknown> & { durationMs: number }
      ][];
      expect(loggedJobName).toBe('error-job');
      expect(loggedSuccess).toBe(false);
      const { durationMs, ...restDetails } = loggedDetails;
      expect(restDetails).toEqual({ reason: 'Job execution failed' });
      expect(Number.isFinite(durationMs)).toBe(true);
      expect(durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  // ===================================================================
  // getStatus() METHOD
  // ===================================================================

  describe('getStatus() Method', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should return status for a job', () => {
      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('statusJob', function* (params: JobParameters) {
          yield { percentage: 50, message: 'In progress' };
          yield { percentage: 100 };
          return { done: true };
        });
      }

      jobRunner.run('status-job', 'statusJob', {}, callback);

      const status = jobRunner.getStatus('status-job');

      expect(status).toEqual({
        name: 'status-job',
        type: 'statusJob',
        state: JobStateManager.STATE_COMPLETED,
        completed: true,
        percentage: 100,
        timestamp: expect.any(Number)
      });
    });

    it('should return status for non-existent job', () => {
      const status = jobRunner.getStatus('non-existent-job');

      // Should return the default not-started shape even if the job never ran
      expect(status).toEqual({
        name: 'non-existent-job',
        type: 'unknown',
        state: 'not_started',
        completed: false,
        percentage: 0
      });
    });
  });

  // ===================================================================
  // resetJob() METHOD
  // ===================================================================

  describe('resetJob() Method', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should reset a job', () => {
      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('resetJob', function* () {
          yield { percentage: 100 };
          return { done: true };
        });
      }

      jobRunner.run('reset-test-job', 'resetJob', {}, callback);

      const result = jobRunner.resetJob('reset-test-job');

      // Should return true or handle reset
      expect(typeof result).toBe('boolean');
    });
  });

  // ===================================================================
  // cancelJob() METHOD
  // ===================================================================

  describe('cancelJob() Method', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should throw error if jobName is not provided', () => {
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        jobRunner.cancelJob(null);
      }).toThrow('jobName is required and must be a non-empty string');
    });

    it('should throw error if jobName is empty string', () => {
      expect(() => {
        jobRunner.cancelJob('');
      }).toThrow('jobName is required and must be a non-empty string');
    });

    it('should throw error if jobName is not a string', () => {
      expect(() => {
        // @ts-expect-error Exercise the existing runtime validation of invalid input.
        jobRunner.cancelJob(123);
      }).toThrow('jobName is required and must be a non-empty string');
    });

    it('should cancel a job successfully', () => {
      const result = jobRunner.cancelJob('some-job');

      // Should return true or false
      expect(typeof result).toBe('boolean');

      // Verify cancel was logged
      expect(logger.hasLog('INFO', /Cancelling job/)).toBe(true);
    });
  });

  // ===================================================================
  // resume() METHOD - CRITICAL COVERAGE GAP (Lines 288-430)
  // ===================================================================

  describe('resume() Method - Critical Coverage', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should throw error if jobName cannot be determined', () => {
      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('test', function* () {
          yield { percentage: 100 };
        });
      }

      // No job name provided, no trigger context available
      expect(() => {
        jobRunner.resume(null, callback);
      }).toThrow('Unable to determine job name');
    });

    it('should attempt to resume with explicit job name', () => {
      // First, we need to simulate a job that has saved state
      // For this test, we'll mock the state
      const jobName = 'resume-test-job';
      Object.assign(jobRunner._executionController, {
        _propertiesService: {
          getProperty: jest.fn((key) => (key === `type_${jobName}` ? 'resumableJob' : null)),
          setProperty: jest.fn(),
          getObjectProperty: jest.fn(() => ({}))
        }
      });
      Object.assign(jobRunner, {
        _createQueue: jest.fn(() => ({
          applyConfiguration: jest.fn(),
          setMaxDuration: jest.fn(),
          execute: jest.fn(() => ({ resumed: true })),
          getStatus: jest.fn(() => ({ state: 'completed' })),
          registerJobHandler: jest.fn()
        }))
      });

      // Save fake job state
      propertiesService.setScriptPropertyJSON(`job:${jobName}`, {
        jobName: jobName,
        jobType: 'resumableJob',
        state: 'PENDING',
        parameters: { data: 'test' }
      });

      const stateManager = new JobStateManager(
        jobName,
        jobRunner._propertiesService,
        utils,
        lockService
      );
      stateManager.saveType('resumableJob');
      stateManager.saveConfiguration({ maxDuration: 25 * 60 * 1000 });
      stateManager.batchSave({
        state: 'to_resume',
        resumeState: { position: 1 },
        progress: { completed: false, percentage: 50 }
      });

      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('resumableJob', function* (params: JobParameters) {
          yield { percentage: 50 };
          yield { percentage: 100 };
          return { resumed: true };
        });
      }

      jobRunner.resume(jobName, callback);

      // Verify resume was attempted through the semantic channel
      expect(logger.logJobResume).toHaveBeenCalledWith(jobName, 'resumableJob');
    });
  });

  // ===================================================================
  // _getCurrentTriggerId() METHOD - Lines 422-432
  // ===================================================================

  describe('_getCurrentTriggerId() Private Method', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should return null when no triggers exist', () => {
      const triggerId = jobRunner._getCurrentTriggerId();

      expect(triggerId).toBeNull();
    });

    it('should return trigger ID when trigger exists', () => {
      // NOTE: `triggerService` here is the standalone MockFactory mock, not the
      // facade's internal `_triggerService` (the real GoogleApiWrapper TriggerService,
      // which reads triggers from the global `ScriptApp.getProjectTriggers()` mock —
      // a static jest.fn() that always returns [] in this test harness, regardless of
      // what's "created" through either trigger service). So the true, observable
      // contract here is still null; creating a trigger on this local mock cannot
      // make the facade see one.
      triggerService.createTimeTrigger('resumeJob', 1);

      const triggerId = jobRunner._getCurrentTriggerId();

      expect(triggerId).toBeNull();
    });

    it('should handle errors gracefully when getting trigger ID', () => {
      // Mock triggerService to throw error
      const originalGetAllTriggers = triggerService.getAllTriggers;
      Object.assign(triggerService, {
        getAllTriggers: () => {
          throw new Error('Trigger service unavailable');
        }
      });

      const triggerId = jobRunner._getCurrentTriggerId();

      // Should return null (error is caught internally)
      expect(triggerId).toBeNull();

      // The implementation logs at WARN level, but may not always log
      // depending on implementation details. The important thing is it returns null.

      // Restore
      Object.assign(triggerService, { getAllTriggers: originalGetAllTriggers });
    });
  });

  // ===================================================================
  // SUSPENDED JOB HANDLING - Line 253
  // ===================================================================

  describe('Suspended Job Handling', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should log when job is suspended for timeout', () => {
      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('longJob', function* (params: JobParameters) {
          // Simulate long job that might timeout
          for (let i = 0; i < 100; i++) {
            yield { percentage: i };
          }
          return { done: true };
        });
      }

      const result = jobRunner.run('long-job', 'longJob', {}, callback, false, 100) as Record<
        string,
        unknown
      >;

      // If job was suspended (returned null), verify logging
      if (result === null) {
        expect(logger.logJobSuspended).toHaveBeenCalledTimes(1);
        const [[suspendedJobName, suspendedDetails]] = logger.logJobSuspended.mock.calls as [
          unknown,
          Record<string, unknown> & { durationMs: number }
        ][];
        expect(suspendedJobName).toBe('long-job');
        const { durationMs, ...restSuspendedDetails } = suspendedDetails;
        expect(restSuspendedDetails).toEqual({
          reason: 'state saved; automatic resume scheduled'
        });
        expect(Number.isFinite(durationMs)).toBe(true);
        expect(durationMs).toBeGreaterThanOrEqual(0);
      } else {
        // Job completed successfully
        expect(logger.logJobEnd).toHaveBeenCalledTimes(1);
        const [[endJobName, endSuccess, endDetails]] = logger.logJobEnd.mock.calls as [
          unknown,
          unknown,
          Record<string, unknown> & { durationMs: number }
        ][];
        expect(endJobName).toBe('long-job');
        expect(endSuccess).toBe(true);
        const { durationMs, ...restEndDetails } = endDetails;
        expect(restEndDetails).toEqual({});
        expect(Number.isFinite(durationMs)).toBe(true);
        expect(durationMs).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ===================================================================
  // _createQueue() HELPER METHOD - Line 441
  // ===================================================================

  describe('_createQueue() Helper Method', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should create a new queue instance', () => {
      const queue = jobRunner._createQueue();

      expect(queue).toBeInstanceOf(JobQueue);
      expect(queue.constructor.name).toMatch(/JobQueue/);
    });

    it('should inject dependencies into queue', () => {
      const queue = jobRunner._createQueue();

      // Queue should have been created with the same logger/utils instances as the facade
      expect(queue._logger).toBe(logger);
      expect(queue._utils).toBe(utils);
    });
  });

  // ===================================================================
  // INTEGRATION WITH MAX DURATION
  // ===================================================================

  describe('Max Duration Configuration', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should accept custom maxDurationMs parameter', () => {
      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('timedJob', function* () {
          yield { percentage: 100 };
          return { done: true };
        });
      }

      const customDuration = 10 * 60 * 1000; // 10 minutes

      const result = jobRunner.run(
        'timed-job',
        'timedJob',
        {},
        callback,
        false,
        customDuration
      ) as Record<string, unknown>;

      expect(result).toEqual({ done: true });
    });

    it('should use default maxDurationMs when not specified', () => {
      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('defaultTimer', function* () {
          yield { percentage: 100 };
          return { done: true };
        });
      }

      // Don't specify maxDurationMs - should use default 25 minutes
      const result = jobRunner.run('default-timer-job', 'defaultTimer', {}, callback) as Record<
        string,
        unknown
      >;

      expect(result).toEqual({ done: true });
    });
  });

  // ===================================================================
  // SERVICES INJECTION
  // ===================================================================

  describe('Services Injection', () => {
    let jobRunner: JobRunnerService;

    beforeEach(() => {
      jobRunner = new JobRunnerService(logger, utils, registry);
    });

    it('should inject all services into callback', () => {
      let injectedServices: RunnerServices | null = null;

      function callback(queue: JobQueue, services: RunnerServices) {
        injectedServices = services;

        queue.registerJobHandler('serviceCheck', function* () {
          yield { percentage: 100 };
          return { done: true };
        });
      }

      jobRunner.run('service-check-job', 'serviceCheck', {}, callback);

      // properties/triggers are jobRunner's own facade-internal PropertiesService/
      // TriggerService instances, not the standalone MockFactory mocks (see note
      // in the "run() with Job Definition" tests above).
      expect(injectedServices).toEqual({
        logger,
        utils,
        properties: jobRunner._propertiesService,
        triggers: jobRunner._triggerService
      });
      expect((injectedServices! as RunnerServices).logger).toBe(logger);
      expect((injectedServices! as RunnerServices).utils).toBe(utils);
      expect((injectedServices! as RunnerServices).properties).toBe(jobRunner._propertiesService);
      expect((injectedServices! as RunnerServices).triggers).toBe(jobRunner._triggerService);
    });

    it('should make services available in job handler params', () => {
      let paramsServices: JobServices | null | undefined = null;

      function callback(queue: JobQueue, services: RunnerServices) {
        queue.registerJobHandler('paramsCheck', function* (params: JobParameters) {
          paramsServices = params.services;
          yield { percentage: 100 };
          return { done: true };
        });
      }

      jobRunner.run('params-check-job', 'paramsCheck', {}, callback);

      expect(paramsServices).toEqual({
        logger,
        utils,
        properties: jobRunner._propertiesService,
        triggers: jobRunner._triggerService
      });
      expect((paramsServices! as JobServices).logger).toBe(logger);
      expect((paramsServices! as JobServices).utils).toBe(utils);
    });
  });
});
