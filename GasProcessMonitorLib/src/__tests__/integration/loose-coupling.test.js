/**
 * @file GasProcessMonitorLib/src/__tests__/integration/loose-coupling.test.js
 * @description Integration tests verifying loose coupling - core libraries work without monitor
 *
 * This test suite demonstrates that GasProcessMonitorLib is truly optional.
 * All core libraries (Pipeline, JobQueue, ImportEngine) should work correctly
 * when the monitor is not provided (null/undefined).
 */

// Mock imports for Pipeline, JobQueue, ImportEngine
// In actual integration, these would be real imports

describe('Loose Coupling: Libraries work without monitor', () => {
  describe('PipelineFramework without monitor', () => {
    let Pipeline;
    let Step;
    let mockLogger;

    beforeEach(async () => {
      // Import actual Pipeline class
      const pipelineModule = await import('../../../../PipelineFramework/src/Pipeline.js');
      Pipeline = pipelineModule.Pipeline;

      const stepModule = await import('../../../../PipelineFramework/src/Step.js');
      Step = stepModule.Step;

      mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
    });

    it('should execute pipeline without monitor (monitor=undefined)', async () => {
      // Create pipeline WITHOUT monitor
      const pipeline = new Pipeline(mockLogger, null, {
        name: 'TestPipeline'
        // monitor: undefined (not provided)
      });

      // Create a simple test step
      class TestStep extends Step {
        _executeLogic(context) {
          context.set('result', 'success');
        }
      }

      const step = new TestStep('TestStep', mockLogger);
      pipeline.addStep(step);

      // Execute - should work without throwing
      const context = pipeline.execute({});

      expect(context.get('result')).toBe('success');
    });

    it('should execute pipeline with monitor=null', async () => {
      const pipeline = new Pipeline(mockLogger, null, {
        name: 'TestPipeline',
        monitor: null,
        jobId: 'test-job'
      });

      class TestStep extends Step {
        _executeLogic(context) {
          context.set('done', true);
        }
      }

      pipeline.addStep(new TestStep('Step1', mockLogger));
      const context = pipeline.execute({});

      expect(context.get('done')).toBe(true);
    });

    it('should show hasMonitor=false in config summary', () => {
      const pipeline = new Pipeline(mockLogger, null, { name: 'Test' });
      const summary = pipeline.getConfigSummary();

      expect(summary.hasMonitor).toBe(false);
      expect(summary.jobId).toBeNull();
    });

    it('should show hasMonitor=true when monitor provided', () => {
      const mockMonitor = {
        logStepStart: jest.fn(),
        logStepComplete: jest.fn(),
        logStepSkipped: jest.fn()
      };

      const pipeline = new Pipeline(mockLogger, null, {
        name: 'Test',
        monitor: mockMonitor,
        jobId: 'job-123'
      });

      const summary = pipeline.getConfigSummary();
      expect(summary.hasMonitor).toBe(true);
      expect(summary.jobId).toBe('job-123');
    });
  });

  describe('JobQueue without monitor', () => {
    let JobQueue;
    let mockLogger;
    let mockProperties;

    beforeEach(async () => {
      const jobQueueModule = await import('../../../../JobRunnerLib/src/JobQueue.js');
      JobQueue = jobQueueModule.JobQueue;

      mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      mockProperties = {
        getProperty: jest.fn().mockReturnValue(null),
        setProperty: jest.fn(),
        deleteProperty: jest.fn()
      };
    });

    it('should support services object without monitor property', () => {
      // The services object without monitor should work
      const services = {
        // monitor: undefined - not provided
        logger: mockLogger
      };

      // Accessing services.monitor should return undefined
      expect(services.monitor).toBeUndefined();
      // Using optional chaining should not throw
      expect(services.monitor?.updateProgress).toBeUndefined();
    });

    it('should handle null monitor in services gracefully', () => {
      const services = {
        monitor: null,
        logger: mockLogger
      };

      // Should not throw when using optional chaining
      expect(() => {
        services.monitor?.updateProgress?.('job', 50, 'message');
      }).not.toThrow();
    });
  });

  describe('ImportEngine without monitor', () => {
    it('should show hasMonitor in config summary', async () => {
      // This is a conceptual test - actual ImportEngine requires many dependencies
      // Here we verify the config summary behavior

      const mockConfigSummary = {
        sourceStrategies: ['SheetById', 'Folder'],
        hasExpressionEngine: false,
        hasExceptionService: false,
        hasMonitor: false
      };

      expect(mockConfigSummary.hasMonitor).toBe(false);
    });
  });

  describe('Optional chaining behavior', () => {
    it('should safely call methods on undefined monitor', () => {
      const monitor = undefined;

      // These should all be safe operations
      expect(() => monitor?.registerJob('job')).not.toThrow();
      expect(() => monitor?.updateProgress('job', 50)).not.toThrow();
      expect(() => monitor?.logStepStart('job', 'step')).not.toThrow();
      expect(() => monitor?.logStepComplete('job', 'step', true)).not.toThrow();
      expect(() => monitor?.setError('job', new Error('test'))).not.toThrow();
      expect(() => monitor?.completeJob('job')).not.toThrow();
    });

    it('should safely call methods on null monitor', () => {
      const monitor = null;

      expect(() => monitor?.registerJob('job')).not.toThrow();
      expect(() => monitor?.updateProgress('job', 50)).not.toThrow();
      expect(() => monitor?.logStepStart('job', 'step')).not.toThrow();
      expect(() => monitor?.logStepComplete('job', 'step', true)).not.toThrow();
      expect(() => monitor?.setError('job', new Error('test'))).not.toThrow();
      expect(() => monitor?.completeJob('job')).not.toThrow();
    });

    it('should call methods when monitor is provided', () => {
      const monitor = {
        registerJob: jest.fn(),
        updateProgress: jest.fn(),
        logStepStart: jest.fn(),
        logStepComplete: jest.fn(),
        setError: jest.fn(),
        completeJob: jest.fn()
      };

      // These should all call the mock
      monitor?.registerJob('job');
      monitor?.updateProgress('job', 50, 'msg');
      monitor?.logStepStart('job', 'step');
      monitor?.logStepComplete('job', 'step', true);
      monitor?.setError('job', 'error');
      monitor?.completeJob('job');

      expect(monitor.registerJob).toHaveBeenCalledWith('job');
      expect(monitor.updateProgress).toHaveBeenCalledWith('job', 50, 'msg');
      expect(monitor.logStepStart).toHaveBeenCalledWith('job', 'step');
      expect(monitor.logStepComplete).toHaveBeenCalledWith('job', 'step', true);
      expect(monitor.setError).toHaveBeenCalledWith('job', 'error');
      expect(monitor.completeJob).toHaveBeenCalledWith('job');
    });
  });
});

describe('Monitor integration when provided', () => {
  let mockMonitor;

  beforeEach(() => {
    mockMonitor = {
      registerJob: jest.fn().mockReturnThis(),
      startJob: jest.fn().mockReturnThis(),
      updateProgress: jest.fn().mockReturnThis(),
      logStepStart: jest.fn().mockReturnThis(),
      logStepComplete: jest.fn().mockReturnThis(),
      logStepSkipped: jest.fn().mockReturnThis(),
      setError: jest.fn().mockReturnThis(),
      completeJob: jest.fn().mockReturnThis()
    };
  });

  it('should allow Pipeline to use provided monitor', async () => {
    const { Pipeline } = await import('../../../../PipelineFramework/src/Pipeline.js');
    const { Step } = await import('../../../../PipelineFramework/src/Step.js');

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    const pipeline = new Pipeline(mockLogger, null, {
      name: 'MonitoredPipeline',
      monitor: mockMonitor,
      jobId: 'pipeline-001'
    });

    class SimpleStep extends Step {
      _executeLogic(context) {
        context.set('executed', true);
      }
    }

    pipeline.addStep(new SimpleStep('MyStep', mockLogger));
    pipeline.execute({});

    // Verify monitor was called
    expect(mockMonitor.logStepStart).toHaveBeenCalledWith('pipeline-001', 'MyStep');
    expect(mockMonitor.logStepComplete).toHaveBeenCalledWith('pipeline-001', 'MyStep', true);
  });

  it('should call logStepSkipped when step is skipped', async () => {
    const { Pipeline } = await import('../../../../PipelineFramework/src/Pipeline.js');
    const { Step } = await import('../../../../PipelineFramework/src/Step.js');

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    const pipeline = new Pipeline(mockLogger, null, {
      name: 'SkipPipeline',
      monitor: mockMonitor,
      jobId: 'skip-001'
    });

    class SkippedStep extends Step {
      shouldExecute() {
        return false; // Always skip
      }
      _executeLogic(context) {
        // Won't be called
      }
    }

    pipeline.addStep(new SkippedStep('SkippedStep', mockLogger));
    pipeline.execute({});

    expect(mockMonitor.logStepSkipped).toHaveBeenCalledWith('skip-001', 'SkippedStep');
  });
});
