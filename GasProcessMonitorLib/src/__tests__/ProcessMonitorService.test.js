/**
 * @file GasProcessMonitorLib/src/__tests__/ProcessMonitorService.test.js
 * @description Unit tests for ProcessMonitorService
 */

import { ProcessMonitorService, ProcessState, StepState } from '../ProcessMonitorService.js';

describe('ProcessMonitorService', () => {
  let service;
  let mockLogger;
  let mockCacheService;
  let mockPropertiesService;
  let mockCache;
  let cacheStore;
  let propsStore;

  beforeEach(() => {
    cacheStore = {};
    propsStore = {};

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mockCache = {
      get: jest.fn((key) => cacheStore[key] || null),
      put: jest.fn((key, value, exp) => {
        cacheStore[key] = value;
      }),
      remove: jest.fn((key) => {
        delete cacheStore[key];
      })
    };

    mockCacheService = {
      getScriptCache: jest.fn(() => mockCache)
    };

    mockPropertiesService = {
      getProperty: jest.fn((key) => propsStore[key] || null),
      setProperty: jest.fn((key, value) => {
        propsStore[key] = value;
      }),
      deleteProperty: jest.fn((key) => {
        delete propsStore[key];
      })
    };

    service = new ProcessMonitorService(mockLogger, mockCacheService, mockPropertiesService);
  });

  describe('constructor', () => {
    it('should create instance with valid dependencies', () => {
      expect(service).toBeInstanceOf(ProcessMonitorService);
    });

    it('should throw error if logger is missing', () => {
      expect(
        () => new ProcessMonitorService(null, mockCacheService, mockPropertiesService)
      ).toThrow('logger is required');
    });

    it('should throw error if logger is missing methods', () => {
      const badLogger = { debug: jest.fn() };
      expect(
        () => new ProcessMonitorService(badLogger, mockCacheService, mockPropertiesService)
      ).toThrow('logger must have debug, info, warn, and error methods');
    });

    it('should throw error if cacheService is missing', () => {
      expect(() => new ProcessMonitorService(mockLogger, null, mockPropertiesService)).toThrow(
        'cacheService is required'
      );
    });

    it('should throw error if propertiesService is missing', () => {
      expect(() => new ProcessMonitorService(mockLogger, mockCacheService, null)).toThrow(
        'propertiesService is required'
      );
    });
  });

  describe('registerJob', () => {
    it('should register a new job with PENDING status', () => {
      service.registerJob('test-job');

      const state = JSON.parse(cacheStore['PROCESS_MONITOR_test-job']);
      expect(state.jobId).toBe('test-job');
      expect(state.status).toBe(ProcessState.PENDING);
      expect(state.percentage).toBe(0);
      expect(state.startTime).toBeDefined();
    });

    it('should persist to properties on register', () => {
      service.registerJob('test-job');

      expect(propsStore['PM_test-job']).toBeDefined();
      const state = JSON.parse(propsStore['PM_test-job']);
      expect(state.status).toBe(ProcessState.PENDING);
    });

    it('should throw error if jobId is empty', () => {
      expect(() => service.registerJob('')).toThrow('jobId must be a non-empty string');
      expect(() => service.registerJob(null)).toThrow('jobId must be a non-empty string');
    });

    it('should return this for method chaining', () => {
      const result = service.registerJob('test-job');
      expect(result).toBe(service);
    });
  });

  describe('startJob', () => {
    it('should transition job to RUNNING status', () => {
      service.registerJob('test-job');
      service.startJob('test-job');

      const state = service.getJobState('test-job');
      expect(state.status).toBe(ProcessState.RUNNING);
    });

    it('should persist to properties on start', () => {
      service.registerJob('test-job');
      service.startJob('test-job');

      const state = JSON.parse(propsStore['PM_test-job']);
      expect(state.status).toBe(ProcessState.RUNNING);
    });
  });

  describe('updateProgress', () => {
    beforeEach(() => {
      service.registerJob('test-job');
    });

    it('should update percentage and message', () => {
      service.updateProgress('test-job', 50, 'Halfway done');

      const state = service.getJobState('test-job');
      expect(state.percentage).toBe(50);
      expect(state.message).toBe('Halfway done');
    });

    it('should round percentage to integer', () => {
      service.updateProgress('test-job', 33.7);

      const state = service.getJobState('test-job');
      expect(state.percentage).toBe(34);
    });

    it('should transition PENDING to RUNNING on progress update', () => {
      service.updateProgress('test-job', 25);

      const state = service.getJobState('test-job');
      expect(state.status).toBe(ProcessState.RUNNING);
    });

    it('should NOT persist to properties (cache only)', () => {
      const initialProps = propsStore['PM_test-job'];
      service.updateProgress('test-job', 50);

      // Props should still have the old PENDING state
      const propsState = JSON.parse(propsStore['PM_test-job']);
      expect(propsState.status).toBe(ProcessState.PENDING);
    });

    it('should throw error for invalid percentage', () => {
      expect(() => service.updateProgress('test-job', -1)).toThrow(
        'percentage must be a number between 0 and 100'
      );
      expect(() => service.updateProgress('test-job', 101)).toThrow(
        'percentage must be a number between 0 and 100'
      );
      expect(() => service.updateProgress('test-job', 'fifty')).toThrow(
        'percentage must be a number between 0 and 100'
      );
    });
  });

  describe('logStepStart', () => {
    beforeEach(() => {
      service.registerJob('test-job');
    });

    it('should add a new step with RUNNING status', () => {
      service.logStepStart('test-job', 'Extract');

      const state = service.getJobState('test-job');
      expect(state.steps).toHaveLength(1);
      expect(state.steps[0].name).toBe('Extract');
      expect(state.steps[0].status).toBe(StepState.RUNNING);
      expect(state.steps[0].startTime).toBeDefined();
    });

    it('should throw error for empty stepName', () => {
      expect(() => service.logStepStart('test-job', '')).toThrow(
        'stepName must be a non-empty string'
      );
    });
  });

  describe('logStepComplete', () => {
    beforeEach(() => {
      service.registerJob('test-job');
      service.logStepStart('test-job', 'Extract');
    });

    it('should mark step as COMPLETED when success=true', () => {
      service.logStepComplete('test-job', 'Extract', true);

      const state = service.getJobState('test-job');
      expect(state.steps[0].status).toBe(StepState.COMPLETED);
      expect(state.steps[0].endTime).toBeDefined();
    });

    it('should mark step as FAILED when success=false', () => {
      service.logStepComplete('test-job', 'Extract', false);

      const state = service.getJobState('test-job');
      expect(state.steps[0].status).toBe(StepState.FAILED);
    });
  });

  describe('logStepSkipped', () => {
    beforeEach(() => {
      service.registerJob('test-job');
    });

    it('should mark step as SKIPPED', () => {
      service.logStepSkipped('test-job', 'OptionalStep');

      const state = service.getJobState('test-job');
      const step = state.steps.find((s) => s.name === 'OptionalStep');
      expect(step.status).toBe(StepState.SKIPPED);
    });
  });

  describe('completeJob', () => {
    beforeEach(() => {
      service.registerJob('test-job');
      service.startJob('test-job');
    });

    it('should mark job as COMPLETED with 100%', () => {
      service.completeJob('test-job', 'Done!');

      const state = service.getJobState('test-job');
      expect(state.status).toBe(ProcessState.COMPLETED);
      expect(state.percentage).toBe(100);
      expect(state.message).toBe('Done!');
      expect(state.endTime).toBeDefined();
    });

    it('should persist to properties on complete', () => {
      service.completeJob('test-job');

      const state = JSON.parse(propsStore['PM_test-job']);
      expect(state.status).toBe(ProcessState.COMPLETED);
    });
  });

  describe('setError', () => {
    beforeEach(() => {
      service.registerJob('test-job');
    });

    it('should mark job as FAILED with error message from Error object', () => {
      service.setError('test-job', new Error('Connection failed'));

      const state = service.getJobState('test-job');
      expect(state.status).toBe(ProcessState.FAILED);
      expect(state.error).toBe('Connection failed');
      expect(state.endTime).toBeDefined();
    });

    it('should mark job as FAILED with string error', () => {
      service.setError('test-job', 'Something went wrong');

      const state = service.getJobState('test-job');
      expect(state.error).toBe('Something went wrong');
    });

    it('should persist to properties on error', () => {
      service.setError('test-job', 'Failed!');

      const state = JSON.parse(propsStore['PM_test-job']);
      expect(state.status).toBe(ProcessState.FAILED);
    });
  });

  describe('getJobState', () => {
    it('should return null for unknown job', () => {
      const state = service.getJobState('nonexistent');
      expect(state).toBeNull();
    });

    it('should return full state object', () => {
      service.registerJob('test-job');
      service.updateProgress('test-job', 25, 'Working...');
      service.logStepStart('test-job', 'Step1');

      const state = service.getJobState('test-job');
      expect(state.jobId).toBe('test-job');
      expect(state.percentage).toBe(25);
      expect(state.message).toBe('Working...');
      expect(state.steps).toHaveLength(1);
    });

    it('should fall back to properties if cache is empty', () => {
      service.registerJob('test-job');
      // Clear cache but keep properties
      delete cacheStore['PROCESS_MONITOR_test-job'];

      const state = service.getJobState('test-job');
      expect(state).not.toBeNull();
      expect(state.jobId).toBe('test-job');
    });
  });

  describe('hasJob', () => {
    it('should return false for unknown job', () => {
      expect(service.hasJob('nonexistent')).toBe(false);
    });

    it('should return true for registered job', () => {
      service.registerJob('test-job');
      expect(service.hasJob('test-job')).toBe(true);
    });
  });

  describe('clearJob', () => {
    it('should remove job from cache and properties', () => {
      service.registerJob('test-job');
      service.clearJob('test-job');

      expect(cacheStore['PROCESS_MONITOR_test-job']).toBeUndefined();
      expect(propsStore['PM_test-job']).toBeUndefined();
    });

    it('should return this for method chaining', () => {
      service.registerJob('test-job');
      const result = service.clearJob('test-job');
      expect(result).toBe(service);
    });
  });

  describe('getConfigSummary', () => {
    it('should return configuration summary', () => {
      const summary = service.getConfigSummary();
      expect(summary.cachePrefix).toBe('PROCESS_MONITOR_');
      expect(summary.propsPrefix).toBe('PM_');
      expect(summary.cacheExpirationSeconds).toBe(21600); // 6 hours
    });
  });

  describe('integration: full lifecycle', () => {
    it('should track complete job lifecycle', () => {
      // Register
      service.registerJob('import-job');
      expect(service.getJobState('import-job').status).toBe(ProcessState.PENDING);

      // Start
      service.startJob('import-job');
      expect(service.getJobState('import-job').status).toBe(ProcessState.RUNNING);

      // Step 1
      service.logStepStart('import-job', 'Extract');
      service.updateProgress('import-job', 33, 'Extracting...');
      service.logStepComplete('import-job', 'Extract', true);

      // Step 2
      service.logStepStart('import-job', 'Transform');
      service.updateProgress('import-job', 66, 'Transforming...');
      service.logStepComplete('import-job', 'Transform', true);

      // Step 3
      service.logStepStart('import-job', 'Load');
      service.updateProgress('import-job', 100, 'Loading...');
      service.logStepComplete('import-job', 'Load', true);

      // Complete
      service.completeJob('import-job', 'All done!');

      const finalState = service.getJobState('import-job');
      expect(finalState.status).toBe(ProcessState.COMPLETED);
      expect(finalState.percentage).toBe(100);
      expect(finalState.steps).toHaveLength(3);
      expect(finalState.steps.every((s) => s.status === StepState.COMPLETED)).toBe(true);
    });
  });
});

describe('ProcessState enum', () => {
  it('should have correct values', () => {
    expect(ProcessState.PENDING).toBe('pending');
    expect(ProcessState.RUNNING).toBe('running');
    expect(ProcessState.COMPLETED).toBe('completed');
    expect(ProcessState.FAILED).toBe('failed');
  });
});

describe('StepState enum', () => {
  it('should have correct values', () => {
    expect(StepState.PENDING).toBe('pending');
    expect(StepState.RUNNING).toBe('running');
    expect(StepState.COMPLETED).toBe('completed');
    expect(StepState.FAILED).toBe('failed');
    expect(StepState.SKIPPED).toBe('skipped');
  });
});
