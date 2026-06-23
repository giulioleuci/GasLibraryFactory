// ===================================================================
// FILE: JobRunnerLib/src/__tests__/JobQueue.test.js
// ===================================================================
// Test Suite for JobQueue.js (All Classes)
//
// Tests Coverage:
// - JobStateManager: State persistence, locking, versioning, retry management
// - JobTriggerManager: Trigger creation and deletion
// - JobExecutor: Generator execution, timeout handling, progress tracking
// - JobQueue: Main facade, configuration, execution, retries
// ===================================================================

import { JobStateManager, JobTriggerManager, JobExecutor, JobQueue } from '../JobQueue';
import { TimeoutException } from '../../../GasResilienceLib/src/internal/exceptions/TimeoutException';
import { MockFactory } from '../../../test/fakes/MockFactory';

// Mock DriveApp for tiered storage tests
global.DriveApp = {
  getFileById: jest.fn(),
  getFoldersByName: jest.fn(),
  createFolder: jest.fn()
};

describe('JobStateManager', () => {
  let mocks;
  let logger;
  let propertiesService;
  let utils;
  let lockService;
  let stateManager;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    logger = mocks.logger;
    propertiesService = mocks.propertiesService;
    utils = mocks.utils;
    lockService = mocks.lockService;
    stateManager = new JobStateManager('test-job', propertiesService, utils, lockService);
  });

  describe('Constructor and Validation', () => {
    it('should create instance with valid parameters', () => {
      expect(stateManager).toBeDefined();
      expect(stateManager.jobName).toBe('test-job');
    });

    it('should throw error if jobName is missing', () => {
      expect(() => {
        new JobStateManager('', propertiesService, utils, lockService);
      }).toThrow('jobName is required and must be a non-empty string');
    });

    it('should throw error if jobName is not a string', () => {
      expect(() => {
        new JobStateManager(123, propertiesService, utils, lockService);
      }).toThrow('jobName is required and must be a non-empty string');
    });

    it('should throw error if propertiesService is missing', () => {
      expect(() => {
        new JobStateManager('test', null, utils, lockService);
      }).toThrow('propertiesService is required and must be an object');
    });

    it('should throw error if propertiesService lacks required methods', () => {
      expect(() => {
        new JobStateManager('test', {}, utils, lockService);
      }).toThrow('propertiesService must have getProperty and setProperty methods');
    });

    it('should throw error if utils is missing', () => {
      expect(() => {
        new JobStateManager('test', propertiesService, null, lockService);
      }).toThrow('utils is required and must be an object');
    });

    it('should throw error if utils lacks sleep method', () => {
      expect(() => {
        new JobStateManager('test', propertiesService, {}, lockService);
      }).toThrow('utils must have a sleep method');
    });

    it('should throw error if lockService is missing', () => {
      expect(() => {
        new JobStateManager('test', propertiesService, utils, null);
      }).toThrow('lockService is required and must be an object');
    });

    it('should throw error if lockService lacks getScriptLock method', () => {
      expect(() => {
        new JobStateManager('test', propertiesService, utils, {});
      }).toThrow('lockService must have a getScriptLock method');
    });
  });

  describe('State Management', () => {
    it('should set and get state', () => {
      stateManager.setState('running');
      expect(stateManager.getState()).toBe('running');
    });

    it('should return null for initial state', () => {
      expect(stateManager.getState()).toBeNull();
    });

    it('should set state to completed', () => {
      stateManager.setState(JobStateManager.STATE_COMPLETED);
      expect(stateManager.getState()).toBe('completed');
    });

    it('should set state to failed', () => {
      stateManager.setState(JobStateManager.STATE_FAILED);
      expect(stateManager.getState()).toBe('failed');
    });

    it('should set state to cancelled', () => {
      stateManager.setState(JobStateManager.STATE_CANCELLED);
      expect(stateManager.getState()).toBe('cancelled');
    });

    it('should set state to pending', () => {
      stateManager.setState(JobStateManager.STATE_PENDING);
      expect(stateManager.getState()).toBe('pending');
    });
  });

  describe('State Versioning', () => {
    it('should initialize version to 0', () => {
      expect(stateManager.getStateVersion()).toBe(0);
    });

    it('should increment version when state is set', () => {
      stateManager.setState('running');
      expect(stateManager.getStateVersion()).toBe(1);

      stateManager.setState('completed');
      expect(stateManager.getStateVersion()).toBe(2);
    });

    it('should get state with version', () => {
      stateManager.setState('running');
      const stateWithVersion = stateManager.getStateWithVersion();

      expect(stateWithVersion.state).toBe('running');
      expect(stateWithVersion.version).toBe(1);
    });

    it('should reject state update with wrong expected version', () => {
      stateManager.setState('running');
      const result = stateManager.setState('completed', 5); // Wrong version

      expect(result).toBe(false);
      expect(stateManager.getState()).toBe('running'); // State unchanged
    });

    it('should accept state update with correct expected version', () => {
      stateManager.setState('running');
      const currentVersion = stateManager.getStateVersion();
      const result = stateManager.setState('completed', currentVersion);

      expect(result).toBe(true);
      expect(stateManager.getState()).toBe('completed');
    });
  });

  describe('Lock Management', () => {
    it('should acquire running lock on first attempt', () => {
      const result = stateManager.tryAcquireRunning();

      expect(result).toBe(true);
      expect(stateManager.getState()).toBe('running');
    });

    it('should fail to acquire lock if already running', () => {
      stateManager.tryAcquireRunning();
      const result = stateManager.tryAcquireRunning();

      expect(result).toBe(false);
    });

    it('should release lock', () => {
      stateManager.tryAcquireRunning();
      stateManager.releaseLock();

      // After releasing lock AND resetting state, should be able to acquire again
      stateManager.setState('completed'); // Clear running state
      const result = stateManager.tryAcquireRunning();
      expect(result).toBe(true);
    });

    it('should acquire lock if previous lock is stale (older than 1 hour)', () => {
      // OPTIMIZATION: With LockService, set a stale timestamp
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

      propertiesService.setScriptProperty('lock_timestamp_test-job', String(twoHoursAgo));
      propertiesService.setScriptProperty('job_test-job', 'running');

      const result = stateManager.tryAcquireRunning();
      expect(result).toBe(true);
    });

    it('should use LockService for atomic locking', () => {
      // OPTIMIZATION: Verify that LockService is used instead of PropertiesService token-based locking
      stateManager.tryAcquireRunning();

      // LockService should be called via the injected lockService
      expect(lockService.getScriptLock).toHaveBeenCalled();
      expect(lockService._lock.tryLock).toHaveBeenCalledWith(30000);

      // Old sleep-based verification is no longer needed
      expect(utils.sleep).not.toHaveBeenCalled();
    });
  });

  describe('Batch Save Operations', () => {
    it('should batch save multiple state properties', () => {
      stateManager.batchSave({
        state: 'running',
        resumeState: { position: 10 },
        progress: { percentage: 50 },
        config: { maxRetries: 3 },
        type: 'importJob'
      });

      expect(stateManager.getState()).toBe('running');
      expect(stateManager.loadResumeState()).toEqual({ position: 10 });
      expect(stateManager.loadType()).toBe('importJob');
    });

    it('should increment version on batch save with state', () => {
      const initialVersion = stateManager.getStateVersion();

      stateManager.batchSave({ state: 'running' });

      expect(stateManager.getStateVersion()).toBe(initialVersion + 1);
    });

    it('should not increment version on batch save without state', () => {
      const initialVersion = stateManager.getStateVersion();

      stateManager.batchSave({ progress: { percentage: 50 } });

      expect(stateManager.getStateVersion()).toBe(initialVersion);
    });

    it('should handle empty batch save', () => {
      expect(() => {
        stateManager.batchSave({});
      }).not.toThrow();
    });
  });

  describe('Tiered State Storage Optimization', () => {
    beforeEach(() => {
      // Reset DriveApp mocks
      jest.clearAllMocks();

      // Mock DriveApp methods for tiered storage
      const mockFile = {
        getId: jest.fn(() => 'mock-file-id'),
        setContent: jest.fn(),
        getBlob: jest.fn(() => ({
          getDataAsString: jest.fn(() => JSON.stringify({ large: 'state' }))
        })),
        setTrashed: jest.fn()
      };

      const mockFolder = {
        createFile: jest.fn(() => mockFile)
      };

      const mockIterator = {
        hasNext: jest.fn(() => true),
        next: jest.fn(() => mockFolder)
      };

      DriveApp.getFileById = jest.fn(() => mockFile);
      DriveApp.getFoldersByName = jest.fn(() => mockIterator);
      DriveApp.createFolder = jest.fn(() => mockFolder);
    });

    it('should store small state directly in PropertiesService', () => {
      const smallState = { position: 10 };

      stateManager.saveResumeState(smallState);

      // Should be stored directly, not in Drive
      const loaded = stateManager.loadResumeState();
      expect(loaded).toEqual(smallState);

      // Should not create Drive file
      expect(DriveApp.getFoldersByName).not.toHaveBeenCalled();
    });

    it('should store large state in Drive and save file ID', () => {
      // Create a state larger than 8KB
      const largeState = { data: 'x'.repeat(9000) };

      stateManager.saveResumeState(largeState);

      // Should create folder and file in Drive
      expect(DriveApp.getFoldersByName).toHaveBeenCalledWith('JobRunnerStates');

      // Should store Drive reference in Properties
      const stateValue = propertiesService.getProperty('state_test-job');
      expect(stateValue).toMatch(/^__DRIVE__:/);
    });

    it('should load large state from Drive', () => {
      // Simulate large state stored in Drive
      propertiesService.setScriptProperty('state_test-job', '__DRIVE__:mock-file-id');

      const loaded = stateManager.loadResumeState();

      // Should load from Drive
      expect(DriveApp.getFileById).toHaveBeenCalledWith('mock-file-id');
      expect(loaded).toEqual({ large: 'state' });
    });

    it('should clean up Drive file on reset', () => {
      // Set up a state file reference
      propertiesService.setScriptProperty('state_file_id_test-job', 'mock-file-id');

      stateManager.reset();

      // Should trash the Drive file
      expect(DriveApp.getFileById).toHaveBeenCalledWith('mock-file-id');
    });
  });

  describe('Resume State Management', () => {
    it('should save and load resume state', () => {
      const resumeState = { position: 42, lastId: 'abc123' };
      stateManager.saveResumeState(resumeState);

      expect(stateManager.loadResumeState()).toEqual(resumeState);
    });

    it('should return null for non-existent resume state', () => {
      expect(stateManager.loadResumeState()).toBeNull();
    });
  });

  describe('Progress Management', () => {
    it('should save progress', () => {
      const progress = { percentage: 75, message: 'Almost done' };
      stateManager.saveProgress(progress);

      const key = stateManager._key('progress');
      const saved = propertiesService.getObjectProperty(key);
      expect(saved).toEqual(progress);
    });
  });

  describe('Configuration Management', () => {
    it('should save and load configuration', () => {
      const config = { maxRetries: 5, timeout: 30000 };
      stateManager.saveConfiguration(config);

      expect(stateManager.loadConfiguration()).toEqual(config);
    });

    it('should return empty object for missing configuration', () => {
      expect(stateManager.loadConfiguration()).toEqual({});
    });
  });

  describe('Type Management', () => {
    it('should save and load job type', () => {
      stateManager.saveType('dataImport');
      expect(stateManager.loadType()).toBe('dataImport');
    });

    it('should return null for missing type', () => {
      expect(stateManager.loadType()).toBeNull();
    });
  });

  describe('Retry Count Management', () => {
    it('should return 0 for initial retry count', () => {
      expect(stateManager.getRetryCount()).toBe(0);
    });

    it('should increment retry count', () => {
      const newCount = stateManager.incrementRetryCount();
      expect(newCount).toBe(1);
      expect(stateManager.getRetryCount()).toBe(1);
    });

    it('should increment retry count multiple times', () => {
      stateManager.incrementRetryCount(); // 1
      stateManager.incrementRetryCount(); // 2
      const count = stateManager.incrementRetryCount(); // 3

      expect(count).toBe(3);
      expect(stateManager.getRetryCount()).toBe(3);
    });

    it('should reset retry count', () => {
      stateManager.incrementRetryCount();
      stateManager.incrementRetryCount();

      stateManager.resetRetryCount();
      expect(stateManager.getRetryCount()).toBe(0);
    });
  });

  describe('Failure Info Management', () => {
    it('should save and get failure info', () => {
      const failureInfo = {
        reason: 'TIMEOUT',
        timestamp: Date.now(),
        message: 'Job timed out'
      };

      stateManager.saveFailureInfo(failureInfo);
      expect(stateManager.getFailureInfo()).toEqual(failureInfo);
    });

    it('should return null for missing failure info', () => {
      expect(stateManager.getFailureInfo()).toBeNull();
    });
  });

  describe('Cancellation', () => {
    it('should detect cancelled state', () => {
      stateManager.setState(JobStateManager.STATE_CANCELLED);
      expect(stateManager.isCancelled()).toBe(true);
    });

    it('should return false for non-cancelled states', () => {
      stateManager.setState('running');
      expect(stateManager.isCancelled()).toBe(false);
    });

    it('should return false when no state is set', () => {
      expect(stateManager.isCancelled()).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset all state properties', () => {
      stateManager.setState('running');
      stateManager.saveResumeState({ pos: 10 });
      stateManager.saveProgress({ percentage: 50 });
      stateManager.saveType('test');
      stateManager.saveConfiguration({ timeout: 5000 });
      stateManager.incrementRetryCount();
      stateManager.saveFailureInfo({ error: 'test' });

      stateManager.reset();

      expect(stateManager.getState()).toBeNull();
      expect(stateManager.loadResumeState()).toBeNull();
      expect(stateManager.loadType()).toBeNull();
      expect(stateManager.getRetryCount()).toBe(0);
      expect(stateManager.getFailureInfo()).toBeNull();
    });
  });

  describe('State Constants', () => {
    it('should expose state constants', () => {
      expect(JobStateManager.STATE_RUNNING).toBe('running');
      expect(JobStateManager.STATE_COMPLETED).toBe('completed');
      expect(JobStateManager.STATE_CANCELLED).toBe('cancelled');
      expect(JobStateManager.STATE_FAILED).toBe('failed');
      expect(JobStateManager.STATE_PENDING).toBe('pending');
    });
  });
});

describe('JobTriggerManager', () => {
  let mocks;
  let logger;
  let propertiesService;
  let triggerService;
  let triggerManager;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    logger = mocks.logger;
    propertiesService = mocks.propertiesService;
    triggerService = mocks.triggerService;
    triggerManager = new JobTriggerManager('test-job', propertiesService, triggerService);
  });

  describe('Constructor', () => {
    it('should create instance with valid parameters', () => {
      expect(triggerManager).toBeDefined();
      expect(triggerManager.jobName).toBe('test-job');
    });

    it('should use default trigger delay if not provided', () => {
      expect(triggerManager._triggerDelayMs).toBe(60 * 1000);
    });

    it('should use custom trigger delay if provided', () => {
      const customManager = new JobTriggerManager(
        'test-job',
        propertiesService,
        triggerService,
        120000
      );

      expect(customManager._triggerDelayMs).toBe(120000);
    });
  });

  describe('Trigger Creation', () => {
    it('should create resume trigger', () => {
      triggerManager.createResumeTrigger();

      expect(triggerService.getTriggerCount()).toBe(1);
      const triggers = triggerService.getAllTriggers();
      expect(triggers[0].functionName).toBe('resumeJob');
    });

    it('should store trigger ID in properties', () => {
      triggerManager.createResumeTrigger();

      const triggerId = propertiesService.getScriptProperty('trigger_test-job');
      expect(triggerId).toBeDefined();
    });

    it('should store job-to-trigger mapping', () => {
      triggerManager.createResumeTrigger();

      const triggerId = propertiesService.getScriptProperty('trigger_test-job');
      const jobName = propertiesService.getScriptProperty(`job_for_trigger_${triggerId}`);

      expect(jobName).toBe('test-job');
    });

    it('should delete existing triggers before creating new one', () => {
      triggerManager.createResumeTrigger();
      triggerManager.createResumeTrigger();

      // Should only have 1 trigger (old one deleted)
      expect(triggerService.getTriggerCount()).toBe(1);
    });

    it('should use configurable delay when creating trigger', () => {
      const customManager = new JobTriggerManager(
        'test-job',
        propertiesService,
        triggerService,
        300000 // 5 minutes
      );

      customManager.createResumeTrigger();

      const triggers = triggerService.getAllTriggers();
      expect(triggers[0].delayMs).toBe(300000);
    });
  });

  describe('Trigger Deletion', () => {
    it('should delete existing trigger', () => {
      triggerManager.createResumeTrigger();
      expect(triggerService.getTriggerCount()).toBe(1);

      triggerManager.deleteExistingTriggers();
      expect(triggerService.getTriggerCount()).toBe(0);
    });

    it('should clean up trigger properties', () => {
      triggerManager.createResumeTrigger();
      const triggerId = propertiesService.getScriptProperty('trigger_test-job');

      triggerManager.deleteExistingTriggers();

      expect(propertiesService.getScriptProperty('trigger_test-job')).toBeNull();
      expect(propertiesService.getScriptProperty(`job_for_trigger_${triggerId}`)).toBeNull();
    });

    it('should handle deletion when no trigger exists', () => {
      expect(() => {
        triggerManager.deleteExistingTriggers();
      }).not.toThrow();

      expect(triggerService.getTriggerCount()).toBe(0);
    });
  });
});

describe('JobExecutor', () => {
  let mocks;
  let logger;
  let stateManager;
  let triggerManager;
  let executor;
  let propertiesService;
  let triggerService;
  let lockService;
  let utils;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    logger = mocks.logger;
    propertiesService = mocks.propertiesService;
    triggerService = mocks.triggerService;
    lockService = mocks.lockService;
    utils = mocks.utils;

    stateManager = new JobStateManager('test-job', propertiesService, utils, lockService);
    triggerManager = new JobTriggerManager('test-job', propertiesService, triggerService);
    executor = new JobExecutor(logger, stateManager, triggerManager);
  });

  describe('Basic Execution', () => {
    it('should execute simple generator job', () => {
      function* simpleJob(params) {
        yield { percentage: 50 };
        yield { percentage: 100 };
        return { success: true };
      }

      const result = executor.execute(
        simpleJob,
        {},
        Date.now(),
        10000 // 10 seconds
      );

      expect(result.done).toBe(true);
      expect(result.value).toEqual({ success: true });
    });

    it('should throw error if handler is not a generator', () => {
      function notAGenerator() {
        return { success: true };
      }

      expect(() => {
        executor.execute(notAGenerator, {}, Date.now(), 10000);
      }).toThrow('is not a valid generator');
    });

    it('should track progress through yields', () => {
      const progressUpdates = [];

      function* jobWithProgress(params) {
        yield { percentage: 25 };
        yield { percentage: 50 };
        yield { percentage: 75 };
        yield { percentage: 100 };
        return { done: true };
      }

      // Mock saveProgress to capture updates
      const originalSaveProgress = stateManager.saveProgress.bind(stateManager);
      stateManager.saveProgress = jest.fn((progress) => {
        progressUpdates.push(progress);
        originalSaveProgress(progress);
      });

      executor.execute(jobWithProgress, {}, Date.now(), 10000);

      expect(progressUpdates).toHaveLength(4);
      expect(progressUpdates[0].percentage).toBe(25);
      expect(progressUpdates[3].percentage).toBe(100);
    });

    it('should set completed state after successful execution', () => {
      function* simpleJob() {
        yield { percentage: 100 };
        return { done: true };
      }

      executor.execute(simpleJob, {}, Date.now(), 10000);

      expect(stateManager.getState()).toBe('completed');
    });

    it('should release lock on completion', () => {
      function* simpleJob() {
        yield { percentage: 100 };
        return { done: true };
      }

      stateManager.tryAcquireRunning();
      executor.execute(simpleJob, {}, Date.now(), 10000);

      // After completion, should be able to acquire lock again
      expect(stateManager.tryAcquireRunning()).toBe(true);
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout exception', () => {
      function* timeoutJob() {
        yield { percentage: 50 };
        throw new TimeoutException('Timeout exceeded');
      }

      const result = executor.execute(timeoutJob, {}, Date.now(), 10000);

      expect(result.done).toBe(false);
      expect(stateManager.getState()).toBe('to_resume');
    });

    it('should create resume trigger on timeout', () => {
      function* timeoutJob() {
        yield { percentage: 50 };
        throw new TimeoutException('Timeout exceeded');
      }

      executor.execute(timeoutJob, {}, Date.now(), 10000);

      expect(triggerService.getTriggerCount()).toBe(1);
    });

    it('should save resume state on timeout', () => {
      function* timeoutJob() {
        yield { percentage: 50, position: 100 };
        throw new TimeoutException('Timeout exceeded');
      }

      executor.execute(timeoutJob, {}, Date.now(), 10000);

      const resumeState = stateManager.loadResumeState();
      expect(resumeState).toEqual({ percentage: 50, position: 100 });
    });

    it('should release lock on timeout', () => {
      function* timeoutJob() {
        throw new TimeoutException('Timeout exceeded');
      }

      stateManager.tryAcquireRunning();
      executor.execute(timeoutJob, {}, Date.now(), 10000);

      // Should be able to acquire lock after timeout
      expect(stateManager.tryAcquireRunning()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-timeout errors', () => {
      function* errorJob() {
        yield { percentage: 30 };
        throw new Error('Job failed');
      }

      expect(() => {
        executor.execute(errorJob, {}, Date.now(), 10000);
      }).toThrow('Job failed');
    });

    it('should set error state on failure', () => {
      function* errorJob() {
        throw new Error('Job failed');
      }

      try {
        executor.execute(errorJob, {}, Date.now(), 10000);
      } catch (e) {
        // Expected
      }

      expect(stateManager.getState()).toBe('error');
    });

    it('should save error message in progress', () => {
      function* errorJob() {
        throw new Error('Something went wrong');
      }

      try {
        executor.execute(errorJob, {}, Date.now(), 10000);
      } catch (e) {
        // Expected
      }

      const progress = propertiesService.getObjectProperty('progress_test-job');
      expect(progress.error).toBe('Something went wrong');
    });

    it('should release lock on error', () => {
      function* errorJob() {
        throw new Error('Job failed');
      }

      stateManager.tryAcquireRunning();

      try {
        executor.execute(errorJob, {}, Date.now(), 10000);
      } catch (e) {
        // Expected
      }

      // Should be able to acquire lock after error
      expect(stateManager.tryAcquireRunning()).toBe(true);
    });
  });

  describe('Cancellation', () => {
    it('should abort execution if job is cancelled before start', () => {
      stateManager.setState(JobStateManager.STATE_CANCELLED);

      function* job() {
        yield { percentage: 100 };
        return { done: true };
      }

      const result = executor.execute(job, {}, Date.now(), 10000);

      expect(result.done).toBe(true);
      expect(result.cancelled).toBe(true);
    });

    it('should check for cancellation during execution', () => {
      let checkCount = 0;

      function* job() {
        yield { percentage: 25 };
        checkCount++;

        // Cancel the job after first yield
        stateManager.setState(JobStateManager.STATE_CANCELLED);

        yield { percentage: 50 };
        checkCount++;

        yield { percentage: 75 };
        checkCount++;

        return { done: true };
      }

      const result = executor.execute(job, {}, Date.now(), 10000);

      expect(result.cancelled).toBe(true);
      expect(checkCount).toBe(1); // Should stop after cancellation
    });

    it('should delete triggers on cancellation', () => {
      triggerManager.createResumeTrigger();
      expect(triggerService.getTriggerCount()).toBe(1);

      function* job() {
        yield { percentage: 25 };

        // Cancel during execution
        stateManager.setState(JobStateManager.STATE_CANCELLED);

        yield { percentage: 50 };
        return { done: true };
      }

      executor.execute(job, {}, Date.now(), 10000);

      // Trigger should be deleted when cancelled during execution
      expect(triggerService.getTriggerCount()).toBe(0);
    });
  });

  describe('Resume State Calculation', () => {
    it('should calculate total for iteration levels', () => {
      const parameters = {
        jobDefinition: {
          iterationLevels: [
            {
              name: 'students',
              elementsGenerator: () => [{ id: 1 }, { id: 2 }, { id: 3 }],
              filter: null
            },
            {
              name: 'assignments',
              countGenerator: () => 5
            }
          ]
        },
        services: {}
      };

      function* job(params) {
        expect(params.resumeState.total).toBe(15); // 3 students * 5 assignments
        yield { percentage: 100 };
        return { done: true };
      }

      executor.execute(job, parameters, Date.now(), 10000);
    });

    it('should skip total calculation if already present', () => {
      const parameters = {
        jobDefinition: {
          iterationLevels: []
        },
        resumeState: {
          total: 100 // Already calculated
        },
        services: {}
      };

      function* job(params) {
        expect(params.resumeState.total).toBe(100);
        yield { percentage: 100 };
        return { done: true };
      }

      executor.execute(job, parameters, Date.now(), 10000);
    });
  });
});

describe('JobQueue', () => {
  let mocks;
  let logger;
  let utils;
  let propertiesService;
  let triggerService;
  let lockService;
  let queue;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    logger = mocks.logger;
    propertiesService = mocks.propertiesService;
    triggerService = mocks.triggerService;
    lockService = mocks.lockService;
    utils = mocks.utils;

    queue = new JobQueue(logger, utils, propertiesService, triggerService, lockService);
  });

  describe('Constructor and Validation', () => {
    it('should create instance with valid parameters', () => {
      expect(queue).toBeDefined();
    });

    it('should throw error if logger is missing', () => {
      expect(() => {
        new JobQueue(null, utils, propertiesService, triggerService, lockService);
      }).toThrow('logger is required and must be an object');
    });

    it('should throw error if logger lacks required methods', () => {
      expect(() => {
        new JobQueue({}, utils, propertiesService, triggerService, lockService);
      }).toThrow('logger must have info, debug, and error methods');
    });

    it('should throw error if utils is missing', () => {
      expect(() => {
        new JobQueue(logger, null, propertiesService, triggerService, lockService);
      }).toThrow('utils is required and must be an object');
    });

    it('should throw error if propertiesService is missing', () => {
      expect(() => {
        new JobQueue(logger, utils, null, triggerService, lockService);
      }).toThrow('propertiesService is required and must be an object');
    });

    it('should throw error if triggerService is missing', () => {
      expect(() => {
        new JobQueue(logger, utils, propertiesService, null, lockService);
      }).toThrow('triggerService is required and must be an object');
    });

    it('should throw error if lockService is missing', () => {
      expect(() => {
        new JobQueue(logger, utils, propertiesService, triggerService, null);
      }).toThrow('lockService is required and must be an object');
    });

    it('should initialize with default values', () => {
      expect(queue._maxExecutionDuration).toBe(25 * 60 * 1000);
      expect(queue._triggerDelayMs).toBe(60 * 1000);
      expect(queue._maxRetries).toBeNull();
      expect(queue._onFailureCallback).toBeNull();
    });
  });

  describe('Configuration Methods', () => {
    it('should set max duration', () => {
      const result = queue.setMaxDuration(30000);

      expect(queue._maxExecutionDuration).toBe(30000);
      expect(result).toBe(queue); // Fluent API
    });

    it('should throw error for invalid max duration', () => {
      expect(() => {
        queue.setMaxDuration(-100);
      }).toThrow('durationMs must be a positive number');
    });

    it('should throw error for non-numeric max duration', () => {
      expect(() => {
        queue.setMaxDuration('5000');
      }).toThrow('durationMs must be a positive number');
    });

    it('should set trigger delay', () => {
      const result = queue.setTriggerDelay(120000);

      expect(queue._triggerDelayMs).toBe(120000);
      expect(result).toBe(queue); // Fluent API
    });

    it('should throw error for invalid trigger delay', () => {
      expect(() => {
        queue.setTriggerDelay(0);
      }).toThrow('delayMs must be a positive number');
    });

    it('should set max retries', () => {
      const result = queue.setMaxRetries(5);

      expect(queue._maxRetries).toBe(5);
      expect(result).toBe(queue); // Fluent API
    });

    it('should accept null for unlimited retries', () => {
      queue.setMaxRetries(3);
      queue.setMaxRetries(null);

      expect(queue._maxRetries).toBeNull();
    });

    it('should throw error for non-integer max retries', () => {
      expect(() => {
        queue.setMaxRetries(2.5);
      }).toThrow('maxRetries must be a non-negative integer or null');
    });

    it('should throw error for negative max retries', () => {
      expect(() => {
        queue.setMaxRetries(-1);
      }).toThrow('maxRetries must be a non-negative integer or null');
    });

    it('should set failure callback', () => {
      const callback = jest.fn();
      const result = queue.setOnFailure(callback);

      expect(queue._onFailureCallback).toBe(callback);
      expect(result).toBe(queue); // Fluent API
    });

    it('should accept null for failure callback', () => {
      queue.setOnFailure(jest.fn());
      queue.setOnFailure(null);

      expect(queue._onFailureCallback).toBeNull();
    });

    it('should throw error for non-function failure callback', () => {
      expect(() => {
        queue.setOnFailure('not a function');
      }).toThrow('callback must be a function or null');
    });

    it('should apply saved configuration', () => {
      const config = {
        maxExecutionDuration: 60000,
        triggerDelayMs: 180000,
        maxRetries: 10
      };

      const result = queue.applyConfiguration(config);

      expect(queue._maxExecutionDuration).toBe(60000);
      expect(queue._triggerDelayMs).toBe(180000);
      expect(queue._maxRetries).toBe(10);
      expect(result).toBe(queue); // Fluent API
    });

    it('should handle null configuration gracefully', () => {
      expect(() => {
        queue.applyConfiguration(null);
      }).not.toThrow();
    });
  });

  describe('Job Handler Registration', () => {
    it('should register job handler', () => {
      function* testHandler() {
        yield { percentage: 100 };
      }

      const result = queue.registerJobHandler('test', testHandler);

      expect(queue._jobHandlers['test']).toBe(testHandler);
      expect(result).toBe(queue); // Fluent API
    });

    it('should throw error if handler is not a function', () => {
      expect(() => {
        queue.registerJobHandler('test', 'not a function');
      }).toThrow('Handler for test must be a function');
    });

    it('should allow registering multiple handlers', () => {
      function* handler1() {
        yield;
      }
      function* handler2() {
        yield;
      }

      queue.registerJobHandler('type1', handler1);
      queue.registerJobHandler('type2', handler2);

      expect(queue._jobHandlers['type1']).toBe(handler1);
      expect(queue._jobHandlers['type2']).toBe(handler2);
    });
  });

  describe('Job Execution', () => {
    it('should execute registered job successfully', () => {
      function* testJob(params) {
        yield { percentage: 50 };
        yield { percentage: 100 };
        return { success: true, data: params.testData };
      }

      queue.registerJobHandler('test', testJob);

      const result = queue.execute('job1', 'test', { testData: 'value' });

      expect(result).toEqual({ success: true, data: 'value' });
    });

    it('should throw error if no handler registered for job type', () => {
      expect(() => {
        queue.execute('job1', 'nonexistent');
      }).toThrow('No handler registered for nonexistent');
    });

    it('should save job metadata on first run with force restart', () => {
      function* testJob() {
        yield { percentage: 100 };
        return { done: true };
      }

      queue.registerJobHandler('test', testJob);
      // Force restart to ensure metadata is saved (forceRestart triggers saveType)
      queue.execute('job1', 'test', {}, true);

      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      expect(stateManager.loadType()).toBe('test');
    });

    it('should prevent concurrent execution with lock', () => {
      function* longJob() {
        // Simulate long-running job
        for (let i = 0; i < 10; i++) {
          yield { percentage: i * 10 };
        }
        return { done: true };
      }

      queue.registerJobHandler('long', longJob);

      // Manually acquire lock to simulate running job
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.tryAcquireRunning();

      // Try to execute - should fail to acquire lock
      const result = queue.execute('job1', 'long');

      expect(result).toBeNull();
      expect(logger.hasLog('WARN', /already running/)).toBe(true);
    });

    it('should resume job from saved state', () => {
      let executionCount = 0;

      function* resumableJob(params) {
        executionCount++;
        const startPos = params.resumeState?.position || 0;

        if (startPos < 1) {
          yield { percentage: 33, position: 1 };
        }
        if (startPos < 2) {
          yield { percentage: 66, position: 2 };
        }
        yield { percentage: 100, position: 3 };

        return { executions: executionCount };
      }

      queue.registerJobHandler('resumable', resumableJob);

      // First execution
      const result1 = queue.execute('job1', 'resumable');
      expect(result1.executions).toBe(1);

      // Save intermediate state manually
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.saveResumeState({ position: 1 });
      stateManager.setState('to_resume');
      stateManager.releaseLock();

      // Resume execution
      const result2 = queue.execute('job1', 'resumable');
      expect(result2.executions).toBe(2);
    });

    it('should reset retry count on successful completion', () => {
      function* job() {
        yield { percentage: 100 };
        return { done: true };
      }

      queue.registerJobHandler('test', job);

      // Manually set retry count
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.incrementRetryCount();
      stateManager.incrementRetryCount();

      // Execute job
      queue.execute('job1', 'test');

      // Retry count should be reset
      expect(stateManager.getRetryCount()).toBe(0);
    });
  });

  describe('Force Restart', () => {
    it('should reset state when force restart is true', () => {
      function* job(params) {
        yield { percentage: 100 };
        return { run: params.resumeState ? 'resumed' : 'fresh' };
      }

      queue.registerJobHandler('test', job);

      // First run
      queue.execute('job1', 'test', {}, false);

      // Save some state
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.saveResumeState({ position: 50 });

      // Force restart
      const result = queue.execute('job1', 'test', {}, true);

      expect(result.run).toBe('fresh'); // Should not have resume state
    });

    it('should clear lock on force restart', () => {
      function* job() {
        yield { percentage: 100 };
        return { done: true };
      }

      queue.registerJobHandler('test', job);

      // Manually acquire lock
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.tryAcquireRunning();

      // Force restart should clear lock and allow execution
      const result = queue.execute('job1', 'test', {}, true);

      expect(result).toEqual({ done: true });
    });
  });

  describe('Retry Logic and Exponential Backoff', () => {
    it('should increment retry count on timeout', () => {
      function* timeoutJob() {
        throw new TimeoutException('Timeout');
      }

      queue.registerJobHandler('timeout', timeoutJob);
      queue.setMaxDuration(1); // Very short timeout

      queue.execute('job1', 'timeout');

      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      expect(stateManager.getRetryCount()).toBe(1);
    });

    it('should respect max retries limit', () => {
      function* timeoutJob() {
        throw new TimeoutException('Timeout');
      }

      queue.registerJobHandler('timeout', timeoutJob);
      queue.setMaxRetries(2);
      queue.setMaxDuration(1);

      // First attempt (retry 0)
      queue.execute('job1', 'timeout');
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      expect(stateManager.getRetryCount()).toBe(1);

      // Second attempt (retry 1)
      stateManager.releaseLock();
      stateManager.setState('to_resume');
      queue.execute('job1', 'timeout');
      expect(stateManager.getRetryCount()).toBe(2);

      // Third attempt (retry 2) - should fail and mark as failed
      stateManager.releaseLock();
      stateManager.setState('to_resume');
      queue.execute('job1', 'timeout');

      expect(stateManager.getState()).toBe('failed');
    });

    it('should create trigger with exponential backoff delay', () => {
      function* timeoutJob() {
        throw new TimeoutException('Timeout');
      }

      queue.registerJobHandler('timeout', timeoutJob);
      queue.setMaxRetries(5);
      queue.setTriggerDelay(10000); // 10 seconds base
      queue.setMaxDuration(1);

      // First timeout - retry 1 - should use 10 seconds
      queue.execute('job1', 'timeout');

      // Trigger should be created
      expect(triggerService.getTriggerCount()).toBe(1);
    });

    it('should save failure info when max retries exceeded', () => {
      function* timeoutJob() {
        throw new TimeoutException('Timeout');
      }

      queue.registerJobHandler('timeout', timeoutJob);
      queue.setMaxRetries(1);
      queue.setMaxDuration(1);

      // Retry 1
      queue.execute('job1', 'timeout');

      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.releaseLock();
      stateManager.setState('to_resume');

      // Retry 2 - should exceed max
      queue.execute('job1', 'timeout');

      const failureInfo = stateManager.getFailureInfo();
      expect(failureInfo).toBeDefined();
      expect(failureInfo.reason).toBe('MAX_RETRIES_EXCEEDED');
    });

    it('should call failure callback when max retries exceeded', () => {
      const failureCallback = jest.fn();

      function* timeoutJob() {
        throw new TimeoutException('Timeout');
      }

      queue.registerJobHandler('timeout', timeoutJob);
      queue.setMaxRetries(1);
      queue.setOnFailure(failureCallback);
      queue.setMaxDuration(1);

      // Retry 1
      queue.execute('job1', 'timeout');

      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.releaseLock();
      stateManager.setState('to_resume');

      // Retry 2 - should trigger callback
      queue.execute('job1', 'timeout');

      expect(failureCallback).toHaveBeenCalled();
      const [error, jobState] = failureCallback.mock.calls[0];
      expect(error.message).toContain('Max retries exceeded');
      expect(jobState.name).toBe('job1');
      expect(jobState.type).toBe('timeout');
    });

    it('should handle error in failure callback gracefully', () => {
      const failureCallback = jest.fn(() => {
        throw new Error('Callback error');
      });

      function* timeoutJob() {
        throw new TimeoutException('Timeout');
      }

      queue.registerJobHandler('timeout', timeoutJob);
      queue.setMaxRetries(0);
      queue.setOnFailure(failureCallback);
      queue.setMaxDuration(1);

      // Should not throw despite callback error
      expect(() => {
        queue.execute('job1', 'timeout');
      }).not.toThrow();

      expect(logger.hasLog('ERROR', /Error in onFailure callback/)).toBe(true);
    });
  });

  describe('Fatal Error Handling', () => {
    it('should handle fatal errors and increment retry count', () => {
      function* errorJob() {
        throw new Error('Fatal error');
      }

      queue.registerJobHandler('error', errorJob);

      expect(() => {
        queue.execute('job1', 'error');
      }).toThrow('Fatal error');

      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      expect(stateManager.getRetryCount()).toBe(1);
    });

    it('should save failure info on fatal error', () => {
      function* errorJob() {
        throw new Error('Something went wrong');
      }

      queue.registerJobHandler('error', errorJob);

      try {
        queue.execute('job1', 'error');
      } catch (e) {
        // Expected
      }

      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      const failureInfo = stateManager.getFailureInfo();

      expect(failureInfo.reason).toBe('FATAL_ERROR');
      expect(failureInfo.error).toBe('Something went wrong');
    });

    it('should call failure callback on final fatal error', () => {
      const failureCallback = jest.fn();

      function* errorJob() {
        throw new Error('Fatal error');
      }

      queue.registerJobHandler('error', errorJob);
      queue.setMaxRetries(0);
      queue.setOnFailure(failureCallback);

      try {
        queue.execute('job1', 'error');
      } catch (e) {
        // Expected
      }

      expect(failureCallback).toHaveBeenCalled();
    });
  });

  describe('Job Cancellation', () => {
    it('should cancel pending job', () => {
      function* job() {
        yield { percentage: 100 };
        return { done: true };
      }

      queue.registerJobHandler('test', job);

      // Create job in pending state
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.setState('to_resume');

      const result = queue.cancelJob('job1');

      expect(result).toBe(true);
      expect(stateManager.getState()).toBe('cancelled');
    });

    it('should delete triggers when cancelling', () => {
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      const triggerManager = new JobTriggerManager('job1', propertiesService, triggerService);

      stateManager.setState('to_resume');
      triggerManager.createResumeTrigger();

      queue.cancelJob('job1');

      expect(triggerService.getTriggerCount()).toBe(0);
    });

    it('should not cancel completed job', () => {
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.setState('completed');

      const result = queue.cancelJob('job1');

      expect(result).toBe(false);
      expect(logger.hasLog('WARN', /Cannot cancel job/)).toBe(true);
    });

    it('should not cancel already cancelled job', () => {
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.setState('cancelled');

      const result = queue.cancelJob('job1');

      expect(result).toBe(false);
    });

    it('should release lock when cancelling', () => {
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.setState('running');
      stateManager.tryAcquireRunning();

      queue.cancelJob('job1');

      // Should be able to acquire lock after cancellation
      expect(stateManager.tryAcquireRunning()).toBe(true);
    });
  });

  describe('Job Status', () => {
    it('should return status for non-existent job', () => {
      const status = queue.getStatus('nonexistent');

      expect(status.name).toBe('nonexistent');
      expect(status.type).toBe('unknown');
      expect(status.state).toBe('not_started');
      expect(status.completed).toBe(false);
      expect(status.percentage).toBe(0);
    });

    it('should return status for running job', () => {
      function* job() {
        yield { percentage: 50 };
        return { done: true };
      }

      queue.registerJobHandler('test', job);

      // Start but don't complete
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.setState('running');
      stateManager.saveType('test');
      stateManager.saveProgress({ completed: false, percentage: 50 });

      const status = queue.getStatus('job1');

      expect(status.name).toBe('job1');
      expect(status.type).toBe('test');
      expect(status.state).toBe('running');
      expect(status.completed).toBe(false);
      expect(status.percentage).toBe(50);
    });
  });

  describe('Reset Job State', () => {
    it('should reset all job state', () => {
      const stateManager = new JobStateManager('job1', propertiesService, utils, lockService);
      stateManager.setState('running');
      stateManager.saveType('test');
      stateManager.saveResumeState({ pos: 10 });

      const result = queue.resetJobState('job1');

      expect(result).toBe(true);
      expect(stateManager.getState()).toBeNull();
      expect(stateManager.loadType()).toBeNull();
    });

    it('should delete triggers when resetting', () => {
      const triggerManager = new JobTriggerManager('job1', propertiesService, triggerService);
      triggerManager.createResumeTrigger();

      queue.resetJobState('job1');

      expect(triggerService.getTriggerCount()).toBe(0);
    });
  });

  describe('Static Constants', () => {
    it('should expose default trigger delay constant', () => {
      expect(JobQueue.DEFAULT_TRIGGER_DELAY_MS).toBe(60 * 1000);
    });
  });
});
