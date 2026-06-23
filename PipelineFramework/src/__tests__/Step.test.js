// ===================================================================
// FILE: PipelineFramework/src/__tests__/Step.test.js
// ===================================================================
// Comprehensive test suite for Step
// Coverage: All methods and features
// ===================================================================

import { Step } from '../Step';
import { PipelineContext } from '../PipelineContext';
import { ContextValidationError } from '../internal/errors/ContextValidationError';
import { StepExecutionError } from '../internal/errors/StepExecutionError';
import { MockFactory } from '../../../test/fakes/MockFactory';

// Create a concrete step implementation for testing
class TestStep extends Step {
  constructor(name, logger, options = {}) {
    super(name, logger, options);
    this.executionCount = 0;
  }

  _executeLogic(context) {
    this.executionCount++;
    const input = context.get('input', 0);
    this.setResult(context, 'output', input + 1);
  }
}

describe('Step - Comprehensive Test Suite', () => {
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
    it('should create instance with required parameters', () => {
      const step = new TestStep('testStep', mocks.logger);

      expect(step).toBeDefined();
      expect(step.getName()).toBe('testStep');
    });

    it('should create instance with custom options', () => {
      const step = new TestStep('testStep', mocks.logger, {
        requiredKeys: ['userId', 'startDate'],
        continueOnError: true,
        shouldExecuteCondition: (context) => context.get('enabled') === true
      });

      expect(step.getName()).toBe('testStep');
      expect(step._requiredKeys).toEqual(['userId', 'startDate']);
      expect(step._continueOnError).toBe(true);
      expect(step._shouldExecuteCondition).toBeInstanceOf(Function);
    });

    it('should throw error if name is invalid', () => {
      expect(() => new TestStep('', mocks.logger)).toThrow(
        'Step: name is required and must be a non-empty string'
      );
      expect(() => new TestStep(null, mocks.logger)).toThrow(
        'Step: name is required and must be a non-empty string'
      );
      expect(() => new TestStep(123, mocks.logger)).toThrow(
        'Step: name is required and must be a non-empty string'
      );
    });

    it('should throw error if logger is invalid', () => {
      expect(() => new TestStep('test', null)).toThrow(
        'Step: logger is required and must be an object'
      );
      expect(() => new TestStep('test', 'not an object')).toThrow(
        'Step: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing required methods', () => {
      const invalidLogger = { debug: jest.fn() };
      expect(() => new TestStep('test', invalidLogger)).toThrow(
        'Step: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if options is invalid', () => {
      expect(() => new TestStep('test', mocks.logger, 'not an object')).toThrow(
        'Step: options must be an object or null'
      );
    });
  });

  // ===================================================================
  // GETTER METHODS
  // ===================================================================

  describe('Getter Methods', () => {
    it('should return step name', () => {
      const step = new TestStep('testStep', mocks.logger);

      expect(step.getName()).toBe('testStep');
    });

    it('should return logger instance', () => {
      const step = new TestStep('testStep', mocks.logger);

      expect(step.logger).toBe(mocks.logger);
    });
  });

  // ===================================================================
  // CONDITIONAL EXECUTION
  // ===================================================================

  describe('Conditional Execution', () => {
    it('should execute by default', () => {
      const step = new TestStep('testStep', mocks.logger);
      const context = new PipelineContext();

      expect(step.shouldExecute(context)).toBe(true);
    });

    it('should use custom shouldExecute condition from options', () => {
      const step = new TestStep('testStep', mocks.logger, {
        shouldExecuteCondition: (context) => context.get('enabled') === true
      });

      const context1 = new PipelineContext({ enabled: true });
      const context2 = new PipelineContext({ enabled: false });

      expect(step.shouldExecute(context1)).toBe(true);
      expect(step.shouldExecute(context2)).toBe(false);
    });

    it('should allow overriding shouldExecute in subclass', () => {
      class ConditionalStep extends Step {
        _executeLogic(context) {
          // Do nothing
        }

        shouldExecute(context) {
          return context.get('customFlag') === true;
        }
      }

      const step = new ConditionalStep('conditional', mocks.logger);
      const context1 = new PipelineContext({ customFlag: true });
      const context2 = new PipelineContext({ customFlag: false });

      expect(step.shouldExecute(context1)).toBe(true);
      expect(step.shouldExecute(context2)).toBe(false);
    });
  });

  // ===================================================================
  // CONTEXT VALIDATION
  // ===================================================================

  describe('Context Validation', () => {
    it('should validate required keys from options', () => {
      const step = new TestStep('testStep', mocks.logger, {
        requiredKeys: ['userId', 'startDate']
      });

      const context = new PipelineContext({ userId: 123, startDate: '2024-01-01' });

      expect(() => step.verifyContext(context)).not.toThrow();
    });

    it('should throw error if required keys are missing', () => {
      const step = new TestStep('testStep', mocks.logger, {
        requiredKeys: ['userId', 'startDate']
      });

      const context = new PipelineContext({ userId: 123 });

      expect(() => step.verifyContext(context)).toThrow(ContextValidationError);
    });

    it('should accept custom required keys parameter', () => {
      const step = new TestStep('testStep', mocks.logger);
      const context = new PipelineContext({ customKey: 'value' });

      expect(() => step.verifyContext(context, ['customKey'])).not.toThrow();
      expect(() => step.verifyContext(context, ['missingKey'])).toThrow(ContextValidationError);
    });

    it('should skip validation if no required keys', () => {
      const step = new TestStep('testStep', mocks.logger);
      const context = new PipelineContext();

      expect(() => step.verifyContext(context)).not.toThrow();
    });
  });

  // ===================================================================
  // CONTEXT INTERACTION
  // ===================================================================

  describe('Context Interaction', () => {
    let step;
    let context;

    beforeEach(() => {
      step = new TestStep('testStep', mocks.logger);
      context = new PipelineContext();
    });

    it('should set result in context', () => {
      step.setResult(context, 'testKey', 'testValue');

      expect(context.get('testKey')).toBe('testValue');
    });

    it('should support method chaining for setResult', () => {
      const result = step.setResult(context, 'key1', 'value1');

      expect(result).toBe(step);
    });

    it('should throw error if key is not a string', () => {
      expect(() => step.setResult(context, 123, 'value')).toThrow(
        'Step.setResult (testStep): key must be a string'
      );
    });

    it('should get value from context', () => {
      context.set('testKey', 'testValue');

      const value = step.getContextValue(context, 'testKey');

      expect(value).toBe('testValue');
    });

    it('should return default value if key does not exist', () => {
      const value = step.getContextValue(context, 'missingKey', 'defaultValue');

      expect(value).toBe('defaultValue');
    });

    it('should return null as default if not specified', () => {
      const value = step.getContextValue(context, 'missingKey');

      expect(value).toBe(null);
    });
  });

  // ===================================================================
  // STEP EXECUTION
  // ===================================================================

  describe('Step Execution', () => {
    let step;
    let context;

    beforeEach(() => {
      step = new TestStep('testStep', mocks.logger);
      context = new PipelineContext({ input: 5 });
    });

    it('should execute step successfully', () => {
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(false);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(context.get('output')).toBe(6);
    });

    it('should skip execution if shouldExecute returns false', () => {
      step = new TestStep('testStep', mocks.logger, {
        shouldExecuteCondition: () => false
      });

      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(step.executionCount).toBe(0);
    });

    it('should validate context before execution', () => {
      step = new TestStep('testStep', mocks.logger, {
        requiredKeys: ['missingKey']
      });

      expect(() => step.execute(context)).toThrow(StepExecutionError);
    });

    it('should wrap errors in StepExecutionError', () => {
      class FailingStep extends Step {
        _executeLogic() {
          throw new Error('Test error');
        }
      }

      const failingStep = new FailingStep('failing', mocks.logger);

      expect(() => failingStep.execute(context)).toThrow(StepExecutionError);
    });

    it('should continue on error if continueOnError is true', () => {
      class FailingStep extends Step {
        _executeLogic() {
          throw new Error('Test error');
        }
      }

      const failingStep = new FailingStep('failing', mocks.logger, {
        continueOnError: true
      });

      const result = failingStep.execute(context);

      expect(result.success).toBe(true);
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Test error');
    });

    it('should measure execution duration', () => {
      const result = step.execute(context);

      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.durationMs).toBe('number');
    });

    it('should log execution details', () => {
      step.execute(context);

      expect(mocks.logger.debug).toHaveBeenCalled();
    });

    it('should not throw error if step is already StepExecutionError', () => {
      class FailingStep extends Step {
        _executeLogic() {
          throw new StepExecutionError('failing', new Error('Original error'), {});
        }
      }

      const failingStep = new FailingStep('failing', mocks.logger);

      expect(() => failingStep.execute(context)).toThrow(StepExecutionError);
    });
  });

  // ===================================================================
  // ABSTRACT METHOD
  // ===================================================================

  describe('Abstract Method', () => {
    it('should throw error if _executeLogic is not implemented', () => {
      const step = new Step('test', mocks.logger);
      const context = new PipelineContext();

      expect(() => step.execute(context)).toThrow(
        'Step._executeLogic must be implemented by subclass: test'
      );
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    it('should handle complex step with all features', () => {
      class ComplexStep extends Step {
        constructor(name, logger) {
          super(name, logger, {
            requiredKeys: ['input'],
            continueOnError: false,
            shouldExecuteCondition: (context) => context.get('enabled') === true
          });
        }

        _executeLogic(context) {
          const input = this.getContextValue(context, 'input');
          this.setResult(context, 'output', input * 2);
          this.setResult(context, 'stepCompleted', true);
        }
      }

      const step = new ComplexStep('complex', mocks.logger);
      const context = new PipelineContext({ input: 10, enabled: true });

      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('output')).toBe(20);
      expect(context.get('stepCompleted')).toBe(true);
    });

    it('should handle step that modifies context multiple times', () => {
      class MultiModifyStep extends Step {
        _executeLogic(context) {
          this.setResult(context, 'value1', 'a');
          this.setResult(context, 'value2', 'b');
          this.setResult(context, 'value3', 'c');
        }
      }

      const step = new MultiModifyStep('multi', mocks.logger);
      const context = new PipelineContext();

      step.execute(context);

      expect(context.get('value1')).toBe('a');
      expect(context.get('value2')).toBe('b');
      expect(context.get('value3')).toBe('c');
    });
  });
});
