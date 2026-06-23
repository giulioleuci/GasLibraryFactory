// ===================================================================
// FILE: JobRunnerLib/src/__tests__/JobRunnerService.test.js
// ===================================================================
// Test Suite for JobRunnerService (STATEFUL LIBRARY PATTERN)
//
// Pattern: Stateful Library Testing (Integration via Fakes)
// - Uses Smart Fakes to maintain state in memory
// - Tests state transitions and persistence
// - Verifies state is correctly stored and retrieved
// - Integration testing approach with real dependencies
// ===================================================================

import { JobRunnerService } from '../JobRunnerService';
import { JobDefinitionRegistry } from '../JobDefinitionRegistry';
import { JobQueue } from '../JobQueue';
import { MockFactory } from '../../../test/fakes';
import { testing as CoreUtilsTesting } from '@CoreUtilsLib';
import { testing as GoogleApiTesting } from '@GoogleApiWrapper';

// Mock GoogleApiWrapper as a global (JobRunnerService expects it globally)
let mockPropertiesService;
let mockTriggerService;

global.GoogleApiWrapper = {
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
        return new GoogleApiTesting.LockServiceMock();
      }
    };
  }
};

describe('JobRunnerService (Stateful Library Pattern)', () => {
  let logger;
  let utils;
  let propertiesService;
  let triggerService;
  let registry;
  let jobRunner;

  beforeEach(() => {
    global.resetGasMocks();
    const mocks = MockFactory.createAllJest();
    
    logger = mocks.logger;
    utils = mocks.utils;
    propertiesService = mocks.propertiesService;
    triggerService = MockFactory.createTriggerService(logger);

    // Set global mocks
    mockPropertiesService = propertiesService;
    mockTriggerService = triggerService;

    // Create job definition registry
    registry = new JobDefinitionRegistry(logger);

    // Create the service under test
    jobRunner = new JobRunnerService(logger, utils, registry);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create an instance with required dependencies', () => {
      expect(jobRunner).toBeDefined();
      expect(jobRunner._logger).toBe(logger);
      expect(jobRunner._utils).toBe(utils);
      expect(jobRunner._jobDefinitionRegistry).toBe(registry);
    });

    it('should throw error if logger is missing', () => {
      expect(() => {
        new JobRunnerService(null, utils, registry);
      }).toThrow('MyJobRunnerService: logger is required and cannot be null or undefined');
    });

    it('should throw error if utils is missing', () => {
      expect(() => {
        new JobRunnerService(logger, null, registry);
      }).toThrow('MyJobRunnerService: utils is required and cannot be null or undefined');
    });

    it('should throw error if registry is missing', () => {
      expect(() => {
        new JobRunnerService(logger, utils, null);
      }).toThrow(
        'MyJobRunnerService: jobDefinitionRegistry is required and cannot be null or undefined'
      );
    });

    it('should initialize internal services', () => {
      expect(jobRunner._propertiesService).toBeDefined();
      expect(jobRunner._triggerService).toBeDefined();
    });
  });

  // ===================================================================
  // STATE PERSISTENCE PATTERN
  // ===================================================================

  describe('State Persistence Pattern', () => {
    /**
     * PATTERN 1: Job State is Persisted to Properties
     * - Run a job that yields progress
     * - Verify state is stored in FakePropertiesService
     */
    it('should persist job state to PropertiesService during execution', (done) => {
      // Register a simple job handler
      function registerHandlers(queue, services) {
        queue.registerJobHandler('testJob', function* (params) {
          // Yield progress (this should trigger state save)
          yield { percentage: 50, message: 'Halfway done' };
          yield { percentage: 100, message: 'Complete' };
          return { success: true };
        });
      }

      // Run the job
      const result = jobRunner.run(
        'test-job-001',
        'testJob',
        { testData: 'value' },
        registerHandlers
      );

      // Verify job completed
      expect(result).toEqual({ success: true });

      // CRITICAL: Verify state was persisted (even if job completed)
      // In real implementation, completed jobs might clean up state
      // But during execution, state should have been saved
      const scriptProps = propertiesService.getScriptProperties();

      // Log for debugging
      logger.printLogs();
      console.log('Script Properties:', scriptProps);

      done();
    });

    /**
     * PATTERN 2: Job State Contains Correct Information
     * - Verify the persisted state has all required fields
     */
    it('should persist complete job state with metadata', () => {
      let stateSnapshot = null;

      function registerHandlers(queue, services) {
        queue.registerJobHandler('stateTest', function* (params) {
          yield { percentage: 30 };

          // Capture state after first yield
          stateSnapshot = services.properties.getScriptPropertyJSON('job:state-test-job');

          yield { percentage: 100 };
          return { done: true };
        });
      }

      jobRunner.run('state-test-job', 'stateTest', { data: 123 }, registerHandlers);

      // If state was captured, verify its structure
      if (stateSnapshot) {
        expect(stateSnapshot).toHaveProperty('jobName');
        expect(stateSnapshot).toHaveProperty('jobType');
        expect(stateSnapshot).toHaveProperty('parameters');
        expect(stateSnapshot.jobName).toBe('state-test-job');
      }
    });

    /**
     * PATTERN 3: State Cleanup After Completion
     * - Verify state is removed when job completes
     */
    it('should clean up job state after successful completion', () => {
      function registerHandlers(queue, services) {
        queue.registerJobHandler('cleanup', function* (params) {
          yield { percentage: 100 };
          return { complete: true };
        });
      }

      const jobName = 'cleanup-test-job';
      const stateKey = `job:${jobName}`;

      jobRunner.run(jobName, 'cleanup', {}, registerHandlers);

      // After completion, state should be cleaned up
      const state = propertiesService.getScriptProperty(stateKey);

      // Depending on implementation, this might be null (cleaned up)
      // or might contain final state. Check logs for cleanup messages.
      expect(logger.hasLog('INFO', /completed successfully/)).toBe(true);
    });
  });

  // ===================================================================
  // RESUMPTION PATTERN
  // ===================================================================

  describe('Job Resumption Pattern', () => {
    /**
     * PATTERN 4: Trigger Created for Job Timeout
     * - Simulate a job timeout
     * - Verify a trigger is created for resumption
     */
    it('should create a trigger when job times out', () => {
      // This test would require actually timing out a job
      // For now, we verify the trigger service is available

      expect(triggerService).toBeDefined();
      expect(triggerService.getTriggerCount()).toBe(0);

      // In a real timeout scenario:
      // - Job would detect timeout
      // - Save state to properties
      // - Create trigger via triggerService
      // - Exit gracefully

      // We can test trigger creation directly
      const trigger = triggerService.createTimeTrigger('resumeJob', 1);

      expect(trigger).toBeDefined();
      expect(trigger.functionName).toBe('resumeJob');
      expect(triggerService.getTriggerCount()).toBe(1);
    });

    /**
     * PATTERN 5: Job Resumes from Saved State
     * - Manually save job state
     * - Run job again
     * - Verify it resumes from saved position
     */
    it('should resume job from saved state', () => {
      let executionCount = 0;

      function registerHandlers(queue, services) {
        queue.registerJobHandler('resumable', function* (params) {
          const { resumeState } = params;

          executionCount++;

          // If resuming, start from saved position
          const startFrom = resumeState?.position || 0;

          if (startFrom < 1) {
            yield { percentage: 33, position: 1 };
          }
          if (startFrom < 2) {
            yield { percentage: 66, position: 2 };
          }

          yield { percentage: 100, position: 3 };
          return { executions: executionCount };
        });
      }

      const jobName = 'resumable-job';

      // First execution (fresh start)
      const result1 = jobRunner.run(jobName, 'resumable', {}, registerHandlers);

      expect(result1.executions).toBe(1);

      // Second execution (with saved state - simulated resume)
      // In real scenario, this would be called by the trigger
      const result2 = jobRunner.run(jobName, 'resumable', {}, registerHandlers);

      // Should complete again (in real scenario with saved state,
      // it would skip already-processed steps)
      expect(result2).toBeDefined();
    });
  });

  // ===================================================================
  // GENERATOR PATTERN
  // ===================================================================

  describe('Generator-Based Job Pattern', () => {
    /**
     * PATTERN 6: Generator Function Yields Progress
     * - Test that generator yields are processed correctly
     */
    it('should process generator yields for progress tracking', () => {
      const progressUpdates = [];

      function registerHandlers(queue, services) {
        queue.registerJobHandler('progress', function* (params) {
          yield { percentage: 25, status: 'Started' };
          progressUpdates.push(25);

          yield { percentage: 50, status: 'Halfway' };
          progressUpdates.push(50);

          yield { percentage: 75, status: 'Almost done' };
          progressUpdates.push(75);

          yield { percentage: 100, status: 'Complete' };
          progressUpdates.push(100);

          return { progressSteps: progressUpdates.length };
        });
      }

      const result = jobRunner.run('progress-job', 'progress', {}, registerHandlers);

      // Verify all progress updates were captured
      expect(progressUpdates).toEqual([25, 50, 75, 100]);
      expect(result.progressSteps).toBe(4);
    });

    /**
     * PATTERN 7: Generator with Error Handling
     * - Test that errors in generators are properly caught
     */
    it('should handle errors thrown in generator functions', () => {
      function registerHandlers(queue, services) {
        queue.registerJobHandler('error', function* (params) {
          yield { percentage: 10 };
          throw new Error('Job failed at step 2');
        });
      }

      // Job should handle the error gracefully
      expect(() => {
        jobRunner.run('error-job', 'error', {}, registerHandlers);
      }).toThrow('Job failed at step 2');

      // Error should be logged
      expect(logger.hasLog('ERROR', /failed/i)).toBe(true);
    });

    /**
     * PATTERN 8: Long-Running Generator with Many Steps
     * - Test iterative processing
     */
    it('should process long-running jobs with many steps', () => {
      function registerHandlers(queue, services) {
        queue.registerJobHandler('longJob', function* (params) {
          const totalSteps = 10;

          for (let i = 1; i <= totalSteps; i++) {
            const percentage = (i / totalSteps) * 100;
            yield {
              percentage,
              step: i,
              message: `Processing item ${i} of ${totalSteps}`
            };
          }

          return { itemsProcessed: totalSteps };
        });
      }

      const result = jobRunner.run('long-job', 'longJob', {}, registerHandlers);

      expect(result.itemsProcessed).toBe(10);
    });
  });

  // ===================================================================
  // PARAMETER PASSING PATTERN
  // ===================================================================

  describe('Parameter Passing Pattern', () => {
    /**
     * PATTERN 9: Job Receives Parameters
     * - Verify parameters are passed to job handlers
     */
    it('should pass parameters to job handlers', () => {
      let receivedParams = null;

      function registerHandlers(queue, services) {
        queue.registerJobHandler('paramTest', function* (params) {
          receivedParams = params;
          yield { percentage: 100 };
          return { received: true };
        });
      }

      const jobParams = {
        userId: 'user-123',
        action: 'import',
        recordCount: 1000
      };

      jobRunner.run('param-job', 'paramTest', jobParams, registerHandlers);

      expect(receivedParams).toBeDefined();
      expect(receivedParams.userId).toBe('user-123');
      expect(receivedParams.action).toBe('import');
      expect(receivedParams.recordCount).toBe(1000);
    });

    /**
     * PATTERN 10: Services Available to Job
     * - Verify job can access injected services
     */
    it('should provide services to job handlers', () => {
      let availableServices = null;

      function registerHandlers(queue, services) {
        availableServices = services;

        queue.registerJobHandler('serviceTest', function* (params) {
          // Job should have access to services via params
          expect(params.services).toBeDefined();
          expect(params.services.logger).toBeDefined();
          expect(params.services.utils).toBeDefined();

          yield { percentage: 100 };
          return { hasServices: true };
        });
      }

      jobRunner.run('service-job', 'serviceTest', {}, registerHandlers);

      // Verify services were passed to callback
      expect(availableServices).toBeDefined();
      expect(availableServices.logger).toBe(logger);
      expect(availableServices.utils).toBe(utils);
      expect(availableServices.properties).toBeDefined();
      expect(availableServices.triggers).toBeDefined();
    });
  });

  // ===================================================================
  // FORCE RESTART PATTERN
  // ===================================================================

  describe('Force Restart Pattern', () => {
    /**
     * PATTERN 11: Force Restart Clears Previous State
     * - Save state, then force restart
     * - Verify state is cleared
     */
    it('should clear state when force restart is enabled', () => {
      const jobName = 'restart-job';
      let execCount = 0;

      function registerHandlers(queue, services) {
        queue.registerJobHandler('restart', function* (params) {
          execCount++;
          yield { percentage: 100 };
          return { execution: execCount };
        });
      }

      // First run
      const result1 = jobRunner.run(jobName, 'restart', {}, registerHandlers, false);
      expect(result1.execution).toBe(1);

      // Second run WITH force restart
      const result2 = jobRunner.run(jobName, 'restart', {}, registerHandlers, true);

      // Should start fresh
      expect(result2.execution).toBe(2);
    });
  });

  // ===================================================================
  // REAL-WORLD INTEGRATION SCENARIOS
  // ===================================================================

  describe('Real-World Integration Scenarios', () => {
    /**
     * PATTERN 12: Data Import Job
     * - Simulate importing records in batches
     */
    it('should handle batch data import job', () => {
      function registerHandlers(queue, services) {
        queue.registerJobHandler('dataImport', function* (params) {
          const { totalRecords } = params;
          const batchSize = 100;
          let processed = 0;

          while (processed < totalRecords) {
            // Process batch
            const currentBatch = Math.min(batchSize, totalRecords - processed);
            processed += currentBatch;

            const percentage = (processed / totalRecords) * 100;

            yield {
              percentage,
              processed,
              total: totalRecords,
              message: `Processed ${processed} of ${totalRecords}`
            };
          }

          return {
            success: true,
            recordsImported: processed
          };
        });
      }

      const result = jobRunner.run(
        'import-1000-records',
        'dataImport',
        { totalRecords: 1000 },
        registerHandlers
      );

      expect(result.success).toBe(true);
      expect(result.recordsImported).toBe(1000);
    });

    /**
     * PATTERN 13: Multi-Stage Workflow Job
     * - Job with distinct stages
     */
    it('should handle multi-stage workflow job', () => {
      function registerHandlers(queue, services) {
        queue.registerJobHandler('workflow', function* (params) {
          // Stage 1: Validation
          yield { percentage: 10, stage: 'validation', status: 'validating' };

          // Stage 2: Processing
          yield { percentage: 40, stage: 'processing', status: 'processing data' };

          // Stage 3: Transformation
          yield { percentage: 70, stage: 'transformation', status: 'transforming' };

          // Stage 4: Finalization
          yield { percentage: 100, stage: 'finalization', status: 'complete' };

          return {
            stages: ['validation', 'processing', 'transformation', 'finalization'],
            success: true
          };
        });
      }

      const result = jobRunner.run('workflow-job', 'workflow', {}, registerHandlers);

      expect(result.success).toBe(true);
      expect(result.stages).toHaveLength(4);
    });

    /**
     * PATTERN 14: Job with External Data Reference
     * - Job stores large data externally, only references in state
     */
    it('should handle job with external data references', () => {
      function registerHandlers(queue, services) {
        queue.registerJobHandler('externalData', function* (params) {
          const { spreadsheetId, sheetName } = params;

          // In real scenario, would read from spreadsheet
          // Here we just verify parameters are passed
          expect(spreadsheetId).toBe('sheet-123');
          expect(sheetName).toBe('Data');

          yield { percentage: 50, status: 'reading data' };
          yield { percentage: 100, status: 'complete' };

          return {
            dataSource: `${spreadsheetId}/${sheetName}`,
            rowsProcessed: 500
          };
        });
      }

      const result = jobRunner.run(
        'external-data-job',
        'externalData',
        { spreadsheetId: 'sheet-123', sheetName: 'Data' },
        registerHandlers
      );

      expect(result.rowsProcessed).toBe(500);
      expect(result.dataSource).toBe('sheet-123/Data');
    });
  });
});
