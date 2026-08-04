// ===================================================================
// FILE: PipelineFramework/src/__tests__/Pipeline.test.js
// ===================================================================
// Comprehensive test suite for Pipeline
// Coverage: All methods and features
// ===================================================================

import { Pipeline } from '../Pipeline';
import { PipelineContext } from '../PipelineContext';
import { Step } from '../Step';
import { LoggerService } from '@CoreUtilsLib';
import { MockFactory } from '../../../test/fakes';

class DetailedStep extends Step {
  _executeLogic(context) {
    context.set('generatedName', 'PDP_DSA_Rossi_Mario_2026');
    this.logger.info('nested service detail');
  }

  _getLogDetails(context) {
    return context.get('generatedName');
  }
}

describe('Pipeline - Comprehensive Test Suite', () => {
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with default options', () => {
      const pipeline = new Pipeline(mocks.logger);

      expect(pipeline).toBeDefined();
      expect(pipeline.getName()).toBe('Pipeline');
      expect(pipeline.getSteps()).toEqual([]);
    });

    it('should create instance with custom name', () => {
      const pipeline = new Pipeline(mocks.logger, null, { name: 'MyPipeline' });

      expect(pipeline.getName()).toBe('MyPipeline');
    });

    it('should create instance with custom options', () => {
      const pipeline = new Pipeline(mocks.logger, mocks.exceptionService, {
        name: 'TestPipeline',
        stopOnError: false,
        maxRetries: 5
      });

      expect(pipeline.getName()).toBe('TestPipeline');

      const summary = pipeline.getConfigSummary();
      expect(summary.stopOnError).toBe(false);
      expect(summary.maxRetries).toBe(5);
      expect(summary.hasExceptionService).toBe(true);
    });

    it('should throw error if logger is invalid', () => {
      expect(() => new Pipeline(null)).toThrow(
        'Pipeline: logger is required and must be an object'
      );
      expect(() => new Pipeline('not an object')).toThrow(
        'Pipeline: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing required methods', () => {
      const invalidLogger = { debug: jest.fn() };
      expect(() => new Pipeline(invalidLogger)).toThrow('Pipeline: logger.info must be a function');
    });

    it('should throw error if exceptionService is invalid', () => {
      expect(() => new Pipeline(mocks.logger, 'not an object')).toThrow(
        'Pipeline: exceptionService is required and must be an object'
      );
    });

    it('should throw error if options is invalid', () => {
      expect(() => new Pipeline(mocks.logger, null, 'not an object')).toThrow(
        'Pipeline: options must be a plain object'
      );
    });
  });

  // ===================================================================
  // STEP MANAGEMENT
  // ===================================================================

  describe('Step Management', () => {
    let pipeline;
    let mockStep;

    beforeEach(() => {
      pipeline = new Pipeline(mocks.logger);
      mockStep = MockFactory.createJestStep('TestStep');
    });

    it('should add step to pipeline', () => {
      pipeline.addStep(mockStep);

      expect(pipeline.getSteps()).toHaveLength(1);
      expect(pipeline.getSteps()[0]).toBe(mockStep);
    });

    it('should support method chaining for addStep', () => {
      const result = pipeline.addStep(mockStep);

      expect(result).toBe(pipeline);
    });

    it('should add multiple steps', () => {
      const mockStep2 = { ...mockStep, getName: jest.fn(() => 'TestStep2') };

      pipeline.addStep(mockStep).addStep(mockStep2);

      expect(pipeline.getSteps()).toHaveLength(2);
    });

    it('should throw error if step is invalid', () => {
      expect(() => pipeline.addStep(null)).toThrow(
        'Pipeline.addStep: step is required and must be an object'
      );
      expect(() => pipeline.addStep('not an object')).toThrow(
        'Pipeline.addStep: step is required and must be an object'
      );
    });

    it('should throw error if step is missing execute method', () => {
      const invalidStep = { getName: jest.fn() };
      expect(() => pipeline.addStep(invalidStep)).toThrow(
        'Pipeline.addStep: step must have an execute method'
      );
    });

    it('should throw error if step is missing getName method', () => {
      const invalidStep = { execute: jest.fn() };
      expect(() => pipeline.addStep(invalidStep)).toThrow(
        'Pipeline.addStep: step must have a getName method'
      );
    });

    it('should clear all steps', () => {
      pipeline.addStep(mockStep).addStep(mockStep);

      expect(pipeline.getSteps()).toHaveLength(2);

      pipeline.clearSteps();

      expect(pipeline.getSteps()).toHaveLength(0);
    });

    it('should support method chaining for clearSteps', () => {
      const result = pipeline.clearSteps();

      expect(result).toBe(pipeline);
    });
  });

  // ===================================================================
  // LIFECYCLE HOOKS
  // ===================================================================

  describe('Lifecycle Hooks', () => {
    let pipeline;

    beforeEach(() => {
      pipeline = new Pipeline(mocks.logger);
    });

    it('should set beforeStep hook', () => {
      const callback = jest.fn();

      pipeline.beforeStep(callback);

      const summary = pipeline.getConfigSummary();
      expect(summary.hooks.beforeStep).toBe(true);
    });

    it('should support method chaining for beforeStep', () => {
      const result = pipeline.beforeStep(jest.fn());

      expect(result).toBe(pipeline);
    });

    it('should throw error if beforeStep callback is not a function', () => {
      expect(() => pipeline.beforeStep('not a function')).toThrow(
        'Pipeline.beforeStep: callback must be a function'
      );
    });

    it('should set afterStep hook', () => {
      const callback = jest.fn();

      pipeline.afterStep(callback);

      const summary = pipeline.getConfigSummary();
      expect(summary.hooks.afterStep).toBe(true);
    });

    it('should support method chaining for afterStep', () => {
      const result = pipeline.afterStep(jest.fn());

      expect(result).toBe(pipeline);
    });

    it('should throw error if afterStep callback is not a function', () => {
      expect(() => pipeline.afterStep('not a function')).toThrow(
        'Pipeline.afterStep: callback must be a function'
      );
    });

    it('should set onError hook', () => {
      const callback = jest.fn();

      pipeline.onError(callback);

      const summary = pipeline.getConfigSummary();
      expect(summary.hooks.onError).toBe(true);
    });

    it('should support method chaining for onError', () => {
      const result = pipeline.onError(jest.fn());

      expect(result).toBe(pipeline);
    });

    it('should throw error if onError callback is not a function', () => {
      expect(() => pipeline.onError('not a function')).toThrow(
        'Pipeline.onError: callback must be a function'
      );
    });

    it('should set onComplete hook', () => {
      const callback = jest.fn();

      pipeline.onComplete(callback);

      const summary = pipeline.getConfigSummary();
      expect(summary.hooks.onComplete).toBe(true);
    });

    it('should support method chaining for onComplete', () => {
      const result = pipeline.onComplete(jest.fn());

      expect(result).toBe(pipeline);
    });

    it('should throw error if onComplete callback is not a function', () => {
      expect(() => pipeline.onComplete('not a function')).toThrow(
        'Pipeline.onComplete: callback must be a function'
      );
    });
  });

  // ===================================================================
  // PIPELINE EXECUTION
  // ===================================================================

  describe('Pipeline Execution', () => {
    let pipeline;
    let mockStep;

    beforeEach(() => {
      pipeline = new Pipeline(mocks.logger);
      mockStep = {
        execute: jest.fn(() => ({ success: true, skipped: false, durationMs: 10 })),
        getName: jest.fn(() => 'TestStep')
      };
    });

    function semanticLogger() {
      return {
        ...mocks.logger,
        logPipelineStart: jest.fn(),
        logPipelineStep: jest.fn(),
        logSummary: jest.fn(),
        logStep: jest.fn()
      };
    }

    it('emits ordered semantic start, step, and summary events with tree positions', () => {
      const logger = semanticLogger();
      const logPosition = { depth: 1, isLast: false, ancestorHasNext: [] };
      pipeline = new Pipeline(logger, null, { name: 'NotificaPipeline', logPosition });
      pipeline
        .addStep({
          getName: () => 'ResolveContext',
          execute: () => ({ success: true, skipped: false, durationMs: 12 })
        })
        .addStep({
          getName: () => 'ComposeEmail',
          execute: () => ({
            success: true,
            skipped: true,
            skipReason: 'condition not met',
            durationMs: 0
          })
        })
        .addStep({
          getName: () => 'SendEmail',
          execute: () => ({ success: true, skipped: false, durationMs: 5 })
        });

      pipeline.execute();

      expect(logger.logPipelineStart).toHaveBeenCalledWith('NotificaPipeline', 3, logPosition);
      expect(logger.logPipelineStep).toHaveBeenNthCalledWith(
        2,
        'ComposeEmail',
        'SKIPPED',
        { reason: 'condition not met' },
        { depth: 2, isLast: false, ancestorHasNext: [true] }
      );
      expect(logger.logPipelineStep).toHaveBeenNthCalledWith(
        3,
        'SendEmail',
        'EXECUTED',
        { content: undefined, durationMs: 5 },
        { depth: 2, isLast: true, ancestorHasNext: [true] }
      );
      expect(logger.logSummary).toHaveBeenCalledWith(
        '⏹️ Pipeline completed',
        expect.any(Number),
        '2 executed, 1 skipped, 0 failed',
        { depth: 1, isLast: true, ancestorHasNext: [] }
      );
    });

    it('emits one ERROR step and failed summary when a step throws', () => {
      const logger = semanticLogger();
      pipeline = new Pipeline(logger, null, { name: 'Failing' });
      pipeline.addStep({
        getName: () => 'Explode',
        execute: () => {
          throw new Error('boom');
        }
      });

      const result = pipeline.execute();

      expect(result.getSummary().failedSteps).toBe(1);
      expect(logger.logPipelineStep).toHaveBeenCalledWith(
        'Explode',
        'ERROR',
        { reason: 'boom', durationMs: 0 },
        {
          depth: 1,
          isLast: true,
          ancestorHasNext: [true]
        }
      );
      expect(logger.logSummary).toHaveBeenCalledWith(
        '⏹️ Pipeline completed',
        expect.any(Number),
        '0 executed, 0 skipped, 1 failed',
        { depth: 0, isLast: true, ancestorHasNext: [] }
      );
    });

    it('emits start and summary for dry run and zero-step pipelines', () => {
      const dryLogger = semanticLogger();
      const dryPipeline = new Pipeline(dryLogger, null, { name: 'Dry', dryRun: true });
      dryPipeline.addStep(mockStep).execute();
      expect(dryLogger.logPipelineStart).toHaveBeenCalledWith('Dry', 1, {
        depth: 0,
        isLast: false,
        ancestorHasNext: []
      });
      expect(dryLogger.logSummary).toHaveBeenCalledWith(
        '⏹️ Pipeline completed',
        expect.any(Number),
        'dry run; 0 executed, 0 skipped, 0 failed',
        { depth: 0, isLast: true, ancestorHasNext: [] }
      );

      const emptyLogger = semanticLogger();
      new Pipeline(emptyLogger, null, { name: 'Empty' }).execute();
      expect(emptyLogger.logPipelineStart).toHaveBeenCalledWith('Empty', 0, {
        depth: 0,
        isLast: false,
        ancestorHasNext: []
      });
      expect(emptyLogger.logSummary).toHaveBeenCalledWith(
        '⏹️ Pipeline completed',
        expect.any(Number),
        '0 executed, 0 skipped, 0 failed',
        { depth: 0, isLast: true, ancestorHasNext: [] }
      );
    });

    it('renders content-first executed, skipped, and thrown failure fallbacks', () => {
      const basicLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
      pipeline = new Pipeline(basicLogger, null, { name: 'Basic' });
      pipeline
        .addStep({
          getName: () => 'Detailed',
          execute: () => ({
            success: true,
            skipped: false,
            durationMs: 10,
            logDetails: 'PDP_DSA_Rossi_Mario_2026'
          })
        })
        .addStep({
          getName: () => 'Skipped',
          execute: () => ({
            success: true,
            skipped: true,
            skipReason: 'condition not met',
            durationMs: 0
          })
        })
        .addStep({
          getName: () => 'NoDetails',
          execute: () => ({ success: true, skipped: false, durationMs: 3 })
        })
        .addStep({
          getName: () => 'Explode',
          execute: () => {
            throw new Error('boom');
          }
        })
        .execute();

      expect(basicLogger.info).toHaveBeenCalledWith('[Basic] Starting pipeline (4 steps)');
      expect(basicLogger.info).toHaveBeenCalledWith(
        '[Basic] [Detailed] PDP_DSA_Rossi_Mario_2026 (EXECUTED in 10ms)'
      );
      expect(basicLogger.warn).toHaveBeenCalledWith(
        '[Basic] [Skipped] condition not met (SKIPPED)'
      );
      expect(basicLogger.info).toHaveBeenCalledWith('[Basic] [NoDetails] EXECUTED in 3ms');
      expect(basicLogger.error).toHaveBeenCalledWith('[Basic] [Explode] boom (FAILED in 0ms)');
    });

    it('omits skipped timing through the real Pipeline and formatter path', () => {
      const realLogger = new LoggerService();
      const emitted = [];
      global.Logger = {
        log: jest.fn((line) => emitted.push(line)),
        getLog: jest.fn(() => emitted.join('\n')),
        clear: jest.fn()
      };
      pipeline = new Pipeline(realLogger, null, { name: 'SkipPipeline' });
      pipeline.addStep({
        getName: () => 'ComposeEmail',
        execute: () => ({
          success: true,
          skipped: true,
          skipReason: 'condition not met',
          durationMs: 0
        })
      });

      pipeline.execute();

      expect(emitted).toContain('  └─ ⚠️ [ComposeEmail] condition not met (SKIPPED)');
      expect(emitted.join('\n')).not.toContain('SKIPPED in');
    });

    it('passes successful details and scopes nested ordinary messages below the step', () => {
      const realLogger = new LoggerService();
      const emitted = [];
      global.Logger = {
        log: jest.fn((line) => emitted.push(line)),
        getLog: jest.fn(() => emitted.join('\n')),
        clear: jest.fn()
      };
      pipeline = new Pipeline(realLogger, null, { name: 'GenerateDocument' });
      pipeline.addStep(new DetailedStep('GenerateName', realLogger));
      const semanticSpy = jest.spyOn(realLogger, 'logPipelineStep');

      pipeline.execute();

      expect(semanticSpy).toHaveBeenCalledWith(
        'GenerateName',
        'EXECUTED',
        {
          content: 'PDP_DSA_Rossi_Mario_2026',
          durationMs: expect.any(Number)
        },
        { depth: 1, isLast: true, ancestorHasNext: [true] }
      );
      const nestedLine = emitted.find((line) => line.includes('nested service detail'));
      const stepLine = emitted.find((line) => line.includes('[GenerateName]'));
      expect(nestedLine).toMatch(/^  │    ├─ \[INFO\] nested service detail$/);
      expect(stepLine).toMatch(/^  └─ ✅ \[GenerateName\]/);
      expect(nestedLine.indexOf('[INFO]')).toBeGreaterThan(stepLine.indexOf('✅'));
      expect(emitted.filter((line) => line.includes('nested service detail'))).not.toContain(
        '[INFO] nested service detail'
      );
    });

    it('should execute pipeline with no steps', () => {
      const result = pipeline.execute({ test: 'data' });

      expect(result).toBeInstanceOf(PipelineContext);
      expect(result.get('test')).toBe('data');
    });

    it('should execute pipeline with single step', () => {
      pipeline.addStep(mockStep);

      const result = pipeline.execute({ test: 'data' });

      expect(mockStep.execute).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PipelineContext);
    });

    it('should execute pipeline with multiple steps', () => {
      const mockStep2 = {
        execute: jest.fn(() => ({ success: true, skipped: false, durationMs: 10 })),
        getName: jest.fn(() => 'TestStep2')
      };

      pipeline.addStep(mockStep).addStep(mockStep2);

      pipeline.execute({ test: 'data' });

      expect(mockStep.execute).toHaveBeenCalledTimes(1);
      expect(mockStep2.execute).toHaveBeenCalledTimes(1);
    });

    it('should pass context between steps', () => {
      const step1 = {
        execute: jest.fn((context) => {
          context.set('step1Data', 'value1');
          return { success: true, skipped: false, durationMs: 10 };
        }),
        getName: jest.fn(() => 'Step1')
      };

      const step2 = {
        execute: jest.fn((context) => {
          const step1Data = context.get('step1Data');
          context.set('step2Data', `${step1Data}_modified`);
          return { success: true, skipped: false, durationMs: 10 };
        }),
        getName: jest.fn(() => 'Step2')
      };

      pipeline.addStep(step1).addStep(step2);

      const result = pipeline.execute();

      expect(result.get('step1Data')).toBe('value1');
      expect(result.get('step2Data')).toBe('value1_modified');
    });

    it('should call lifecycle hooks in correct order', () => {
      const callOrder = [];

      pipeline
        .beforeStep(() => callOrder.push('beforeStep'))
        .afterStep(() => callOrder.push('afterStep'))
        .onComplete(() => callOrder.push('onComplete'))
        .addStep(mockStep);

      pipeline.execute();

      expect(callOrder).toEqual(['beforeStep', 'afterStep', 'onComplete']);
    });

    it('should call onError hook when step fails', () => {
      const failingStep = {
        execute: jest.fn(() => {
          throw new Error('Step failed');
        }),
        getName: jest.fn(() => 'FailingStep')
      };

      const onErrorCallback = jest.fn();

      pipeline.addStep(failingStep).onError(onErrorCallback);

      try {
        pipeline.execute();
      } catch (_error) {
        // Expected to throw
      }

      expect(onErrorCallback).toHaveBeenCalledTimes(1);
    });

    it('should stop on error when stopOnError is true', () => {
      const failingStep = {
        execute: jest.fn(() => ({
          success: false,
          skipped: false,
          durationMs: 10,
          error: new Error('Failed')
        })),
        getName: jest.fn(() => 'FailingStep')
      };

      const step2 = { ...mockStep, getName: jest.fn(() => 'Step2') };

      pipeline.addStep(failingStep).addStep(step2);

      const result = pipeline.execute();
      expect(step2.execute).not.toHaveBeenCalled();
      const summary = result.getSummary();
      expect(summary.failedSteps).toBe(1);
    });

    it('should continue on error when stopOnError is false', () => {
      const failingStep = {
        execute: jest.fn(() => ({
          success: false,
          skipped: false,
          durationMs: 10,
          error: new Error('Failed')
        })),
        getName: jest.fn(() => 'FailingStep')
      };

      const step2 = { ...mockStep, getName: jest.fn(() => 'Step2') };

      pipeline = new Pipeline(mocks.logger, null, { stopOnError: false });

      pipeline.addStep(failingStep).addStep(step2);

      const result = pipeline.execute();

      expect(step2.execute).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PipelineContext);
    });

    it('should stop execution when context requests stop', () => {
      const step1 = {
        execute: jest.fn((context) => {
          context.requestStop('Test stop');
          return { success: true, skipped: false, durationMs: 10 };
        }),
        getName: jest.fn(() => 'Step1')
      };

      const step2 = { ...mockStep, getName: jest.fn(() => 'Step2') };

      pipeline.addStep(step1).addStep(step2);

      const result = pipeline.execute();

      expect(step1.execute).toHaveBeenCalledTimes(1);
      expect(step2.execute).not.toHaveBeenCalled();
      expect(result.shouldStop()).toBe(true);
      expect(result.getStopReason()).toBe('Test stop');
    });

    it('should use exception service for retry when provided', () => {
      pipeline = new Pipeline(mocks.logger, mocks.exceptionService, { maxRetries: 3 });

      pipeline.addStep(mockStep);

      pipeline.execute();

      expect(mocks.exceptionService.executeWithRetry).toHaveBeenCalledTimes(1);
      expect(mocks.exceptionService.executeWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        {},
        3
      );
    });

    it('should throw error if initialData is invalid', () => {
      expect(() => pipeline.execute('not an object')).toThrow(
        'Pipeline.execute: initialData must be an object or null'
      );
    });

    it('should handle hooks that throw errors gracefully', () => {
      const throwingHook = jest.fn(() => {
        throw new Error('Hook error');
      });

      pipeline.beforeStep(throwingHook).addStep(mockStep);

      const result = pipeline.execute();

      expect(result).toBeInstanceOf(PipelineContext);
      expect(mocks.logger.warn).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // CONFIGURATION SUMMARY
  // ===================================================================

  describe('Configuration Summary', () => {
    it('should return correct config summary', () => {
      const pipeline = new Pipeline(mocks.logger, mocks.exceptionService, {
        name: 'TestPipeline',
        stopOnError: false,
        maxRetries: 5
      });

      const mockStep = {
        execute: jest.fn(),
        getName: jest.fn(() => 'TestStep')
      };

      pipeline
        .addStep(mockStep)
        .beforeStep(jest.fn())
        .afterStep(jest.fn())
        .onError(jest.fn())
        .onComplete(jest.fn());

      const summary = pipeline.getConfigSummary();

      expect(summary.name).toBe('TestPipeline');
      expect(summary.stepCount).toBe(1);
      expect(summary.steps).toEqual(['TestStep']);
      expect(summary.stopOnError).toBe(false);
      expect(summary.maxRetries).toBe(5);
      expect(summary.hasExceptionService).toBe(true);
      expect(summary.hooks.beforeStep).toBe(true);
      expect(summary.hooks.afterStep).toBe(true);
      expect(summary.hooks.onError).toBe(true);
      expect(summary.hooks.onComplete).toBe(true);
    });
  });

  // ===================================================================
  // GETTER METHODS
  // ===================================================================

  describe('Getter Methods', () => {
    it('should return logger instance', () => {
      const pipeline = new Pipeline(mocks.logger);

      expect(pipeline.logger).toBe(mocks.logger);
    });
  });
});
