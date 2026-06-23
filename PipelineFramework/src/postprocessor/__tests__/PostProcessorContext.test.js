/**
 * @file PipelineFramework/src/postprocessor/__tests__/PostProcessorContext.test.js
 * @description Unit tests for PostProcessorContext class
 */

import { PostProcessorContext } from '../PostProcessorContext';

describe('PostProcessorContext', () => {
  let mockStep;
  let mockStepResult;
  let mockPipelineContext;

  beforeEach(() => {
    mockStep = {
      getName: jest.fn().mockReturnValue('TestStep')
    };

    mockStepResult = {
      success: true,
      skipped: false,
      durationMs: 100,
      output: {
        documentId: 'doc-123',
        documentUrl: 'https://example.com/doc'
      }
    };

    mockPipelineContext = {
      getData: jest.fn().mockReturnValue({
        userId: 'user-456',
        currentUser: {
          email: 'test@example.com',
          id: 'user-456'
        },
        config: {
          enabled: true
        }
      })
    };
  });

  describe('Constructor', () => {
    it('should create context with required options', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.step).toBe(mockStep);
      expect(context.stepResult).toBe(mockStepResult);
      expect(context.pipelineContext).toBe(mockPipelineContext);
      expect(context.metadata).toEqual({});
    });

    it('should create context with metadata', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext,
        metadata: { custom: 'data' }
      });

      expect(context.metadata).toEqual({ custom: 'data' });
    });

    it('should throw if step is missing', () => {
      expect(
        () =>
          new PostProcessorContext({
            stepResult: mockStepResult,
            pipelineContext: mockPipelineContext
          })
      ).toThrow('step is required');
    });

    it('should throw if stepResult is missing', () => {
      expect(
        () =>
          new PostProcessorContext({
            step: mockStep,
            pipelineContext: mockPipelineContext
          })
      ).toThrow('stepResult is required');
    });

    it('should throw if pipelineContext is missing', () => {
      expect(
        () =>
          new PostProcessorContext({
            step: mockStep,
            stepResult: mockStepResult
          })
      ).toThrow('pipelineContext is required');
    });
  });

  describe('getStepOutput', () => {
    it('should return value from step output', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getStepOutput('documentId')).toBe('doc-123');
      expect(context.getStepOutput('documentUrl')).toBe('https://example.com/doc');
    });

    it('should return default value if key not found', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getStepOutput('nonexistent')).toBeNull();
      expect(context.getStepOutput('nonexistent', 'default')).toBe('default');
    });

    it('should return default if no output', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: true, skipped: false, durationMs: 50 },
        pipelineContext: mockPipelineContext
      });

      expect(context.getStepOutput('documentId', 'default')).toBe('default');
    });
  });

  describe('getPipelineData', () => {
    it('should return value from simple path', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getPipelineData('userId')).toBe('user-456');
    });

    it('should return value from nested path', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getPipelineData('currentUser.email')).toBe('test@example.com');
      expect(context.getPipelineData('currentUser.id')).toBe('user-456');
      expect(context.getPipelineData('config.enabled')).toBe(true);
    });

    it('should return default for missing path', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getPipelineData('nonexistent')).toBeNull();
      expect(context.getPipelineData('nonexistent', 'default')).toBe('default');
      expect(context.getPipelineData('currentUser.missing', 'default')).toBe('default');
    });

    it('should return default for invalid path', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getPipelineData('')).toBeNull();
      expect(context.getPipelineData(null)).toBeNull();
    });
  });

  describe('wasSuccessful', () => {
    it('should return true for successful non-skipped step', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: mockPipelineContext
      });

      expect(context.wasSuccessful()).toBe(true);
    });

    it('should return false for failed step', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: false, skipped: false, durationMs: 100, error: new Error('test') },
        pipelineContext: mockPipelineContext
      });

      expect(context.wasSuccessful()).toBe(false);
    });

    it('should return false for skipped step', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: true, skipped: true, durationMs: 0 },
        pipelineContext: mockPipelineContext
      });

      expect(context.wasSuccessful()).toBe(false);
    });
  });

  describe('wasSkipped', () => {
    it('should return true for skipped step', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: true, skipped: true, durationMs: 0 },
        pipelineContext: mockPipelineContext
      });

      expect(context.wasSkipped()).toBe(true);
    });

    it('should return false for executed step', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: mockPipelineContext
      });

      expect(context.wasSkipped()).toBe(false);
    });
  });

  describe('getError', () => {
    it('should return error from failed step', () => {
      const error = new Error('Test error');
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: false, skipped: false, durationMs: 100, error },
        pipelineContext: mockPipelineContext
      });

      expect(context.getError()).toBe(error);
    });

    it('should return null for successful step', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getError()).toBeNull();
    });
  });

  describe('getStepName', () => {
    it('should return step name', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getStepName()).toBe('TestStep');
    });

    it('should return unknown if getName not available', () => {
      const context = new PostProcessorContext({
        step: {},
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getStepName()).toBe('unknown');
    });
  });

  describe('getDurationMs', () => {
    it('should return step duration', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getDurationMs()).toBe(100);
    });

    it('should return 0 if duration not set', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: true, skipped: false },
        pipelineContext: mockPipelineContext
      });

      expect(context.getDurationMs()).toBe(0);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata value', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext,
        metadata: { key: 'value' }
      });

      expect(context.getMetadata('key')).toBe('value');
    });

    it('should return default for missing metadata', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext
      });

      expect(context.getMetadata('missing')).toBeNull();
      expect(context.getMetadata('missing', 'default')).toBe('default');
    });
  });

  describe('toExpressionContext', () => {
    it('should create expression context', () => {
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: mockStepResult,
        pipelineContext: mockPipelineContext,
        metadata: { custom: 'data' }
      });

      const exprContext = context.toExpressionContext();

      expect(exprContext.step.name).toBe('TestStep');
      expect(exprContext.step.success).toBe(true);
      expect(exprContext.step.skipped).toBe(false);
      expect(exprContext.step.durationMs).toBe(100);
      expect(exprContext.step.error).toBeNull();
      expect(exprContext.stepResult).toBe(mockStepResult);
      expect(exprContext.stepOutput).toEqual(mockStepResult.output);
      expect(exprContext.pipeline).toEqual(mockPipelineContext.getData());
      expect(exprContext.metadata).toEqual({ custom: 'data' });
    });

    it('should include error message in expression context', () => {
      const error = new Error('Test error');
      const context = new PostProcessorContext({
        step: mockStep,
        stepResult: { success: false, skipped: false, durationMs: 100, error },
        pipelineContext: mockPipelineContext
      });

      const exprContext = context.toExpressionContext();
      expect(exprContext.step.error).toBe('Test error');
    });
  });
});
