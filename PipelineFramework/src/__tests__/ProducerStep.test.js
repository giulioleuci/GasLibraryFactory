// ===================================================================
// FILE: PipelineFramework/src/__tests__/ProducerStep.test.js
// ===================================================================
// Comprehensive test suite for ProducerStep
// Coverage: Constructor, validation, execution, error handling
// ===================================================================

import { ProducerStep } from '../ProducerStep';
import { PipelineContext } from '../PipelineContext';
import { TemplateSelectorStep } from '../examples/TemplateSelectorStep';
import { MockFactory } from '../../../test/fakes/MockFactory';

// Create a concrete implementation for testing
class TestProducerStep extends ProducerStep {
  constructor(name, logger, expressionEngine, options = {}) {
    super(name, logger, expressionEngine, options);
    this.evaluationCount = 0;
  }

  evaluateRules(context) {
    this.evaluationCount++;
    const value = context.get('testValue', 0);

    // Simple rule: if value > 5, return 'HIGH', else 'LOW'
    if (this.expressionEngine.evaluate('{{testValue}} > 5', context.getData())) {
      return 'HIGH';
    }
    return 'LOW';
  }
}

describe('ProducerStep - Comprehensive Test Suite', () => {
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
      const step = new TestProducerStep('testProducer', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      expect(step).toBeDefined();
      expect(step.getName()).toBe('testProducer');
      expect(step.outputKey).toBe('result');
      expect(step.expressionEngine).toBe(mocks.expressionEngine);
    });

    it('should create instance with custom options', () => {
      const step = new TestProducerStep('testProducer', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result',
        requiredKeys: ['testValue'],
        continueOnError: true
      });

      expect(step.getName()).toBe('testProducer');
      expect(step._requiredKeys).toEqual(['testValue']);
      expect(step._continueOnError).toBe(true);
    });

    it('should throw error if expressionEngine is invalid', () => {
      expect(
        () => new TestProducerStep('test', mocks.logger, null, { outputKey: 'result' })
      ).toThrow('ProducerStep: expressionEngine is required and must be an object');

      expect(
        () => new TestProducerStep('test', mocks.logger, 'not an object', { outputKey: 'result' })
      ).toThrow('ProducerStep: expressionEngine is required and must be an object');
    });

    it('should throw error if expressionEngine lacks evaluate method', () => {
      const invalidEngine = { parse: jest.fn() };

      expect(
        () => new TestProducerStep('test', mocks.logger, invalidEngine, { outputKey: 'result' })
      ).toThrow('ProducerStep: expressionEngine must have an evaluate method');
    });

    it('should throw error if outputKey is not provided', () => {
      expect(() => new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {})).toThrow(
        'ProducerStep: options.outputKey is required and must be a non-empty string'
      );

      expect(
        () => new TestProducerStep('test', mocks.logger, mocks.expressionEngine, { outputKey: '' })
      ).toThrow('ProducerStep: options.outputKey is required and must be a non-empty string');

      expect(
        () => new TestProducerStep('test', mocks.logger, mocks.expressionEngine, { outputKey: 123 })
      ).toThrow('ProducerStep: options.outputKey is required and must be a non-empty string');
    });
  });

  // ===================================================================
  // GETTER METHODS
  // ===================================================================

  describe('Getter Methods', () => {
    it('should return expression engine', () => {
      const step = new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      expect(step.expressionEngine).toBe(mocks.expressionEngine);
    });

    it('should return output key', () => {
      const step = new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'myOutputKey'
      });

      expect(step.outputKey).toBe('myOutputKey');
    });
  });

  // ===================================================================
  // EVALUATE RULES (ABSTRACT METHOD)
  // ===================================================================

  describe('evaluateRules Method', () => {
    it('should throw error if not implemented by subclass', () => {
      // Create instance using ProducerStep directly (not TestProducerStep)
      class AbstractProducer extends ProducerStep {}
      const step = new AbstractProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({ testValue: 10 });

      expect(() => step.evaluateRules(context)).toThrow(
        'ProducerStep.evaluateRules must be implemented by subclass: test'
      );
    });

    it('should be called by _executeLogic', () => {
      mocks.expressionEngine.evaluate.mockReturnValue(true);

      const step = new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({ testValue: 10 });
      step.execute(context);

      expect(step.evaluationCount).toBe(1);
    });
  });

  // ===================================================================
  // SCALAR RESULT VALIDATION
  // ===================================================================

  describe('Scalar Result Validation', () => {
    it('should accept string result', () => {
      class StringProducer extends ProducerStep {
        evaluateRules() {
          return 'TEMPLATE_PASS';
        }
      }

      const step = new StringProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({});
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('result')).toBe('TEMPLATE_PASS');
    });

    it('should accept number result', () => {
      class NumberProducer extends ProducerStep {
        evaluateRules() {
          return 42;
        }
      }

      const step = new NumberProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({});
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('result')).toBe(42);
    });

    it('should accept boolean result', () => {
      class BooleanProducer extends ProducerStep {
        evaluateRules() {
          return true;
        }
      }

      const step = new BooleanProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({});
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('result')).toBe(true);
    });

    it('should reject null result', () => {
      class NullProducer extends ProducerStep {
        evaluateRules() {
          return null;
        }
      }

      const step = new NullProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({});

      expect(() => step.execute(context)).toThrow(
        'ProducerStep (test): evaluateRules must not return null or undefined'
      );
    });

    it('should reject undefined result', () => {
      class UndefinedProducer extends ProducerStep {
        evaluateRules() {
          return undefined;
        }
      }

      const step = new UndefinedProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({});

      expect(() => step.execute(context)).toThrow(
        'ProducerStep (test): evaluateRules must not return null or undefined'
      );
    });

    it('should reject object result', () => {
      class ObjectProducer extends ProducerStep {
        evaluateRules() {
          return { value: 'test' };
        }
      }

      const step = new ObjectProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({});

      expect(() => step.execute(context)).toThrow(
        'ProducerStep (test): evaluateRules must return a scalar value (string/number/boolean), got object'
      );
    });

    it('should reject array result', () => {
      class ArrayProducer extends ProducerStep {
        evaluateRules() {
          return ['value1', 'value2'];
        }
      }

      const step = new ArrayProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({});

      expect(() => step.execute(context)).toThrow(
        'ProducerStep (test): evaluateRules must return a scalar value (string/number/boolean), got object'
      );
    });
  });

  // ===================================================================
  // EXECUTION LOGIC
  // ===================================================================

  describe('Execution Logic', () => {
    it('should evaluate rules and write result to context', () => {
      mocks.expressionEngine.evaluate.mockReturnValue(true);

      const step = new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'category'
      });

      const context = new PipelineContext({ testValue: 10 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('category')).toBe('HIGH');

      // Check that evaluate was called (context data may have been modified by now)
      expect(mocks.expressionEngine.evaluate).toHaveBeenCalled();
      expect(mocks.expressionEngine.evaluate.mock.calls[0][0]).toBe('{{testValue}} > 5');
      expect(mocks.expressionEngine.evaluate.mock.calls[0][1]).toMatchObject({ testValue: 10 });
    });

    it('should log evaluation details', () => {
      mocks.expressionEngine.evaluate.mockReturnValue(true);

      const step = new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({ testValue: 10 });
      step.execute(context);

      expect(mocks.logger.debug).toHaveBeenCalledWith('[test] Evaluating business rules...');
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        '[test] Evaluated result: HIGH (type: string)'
      );
      expect(mocks.logger.info).toHaveBeenCalledWith('[test] Decision made: result = HIGH');
    });

    it('should validate required keys before execution', () => {
      const step = new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result',
        requiredKeys: ['testValue', 'userId']
      });

      const context = new PipelineContext({ testValue: 10 });

      expect(() => step.execute(context)).toThrow();
    });
  });

  // ===================================================================
  // EXAMPLE IMPLEMENTATION: TemplateSelectorStep
  // ===================================================================

  describe('TemplateSelectorStep Example', () => {
    it('should select TEMPLATE_PASS for high grade and low absences', () => {
      mocks.expressionEngine.evaluate.mockReturnValueOnce(true); // First rule matches

      const step = new TemplateSelectorStep(mocks.logger, mocks.expressionEngine, {
        outputKey: 'selected_template_id'
      });

      const context = new PipelineContext({ grade: 8, absences: 2 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('selected_template_id')).toBe('TEMPLATE_PASS');
    });

    it('should select TEMPLATE_FAIL for low grade', () => {
      mocks.expressionEngine.evaluate
        .mockReturnValueOnce(false) // First rule doesn't match
        .mockReturnValueOnce(true); // Second rule matches

      const step = new TemplateSelectorStep(mocks.logger, mocks.expressionEngine, {
        outputKey: 'selected_template_id'
      });

      const context = new PipelineContext({ grade: 4, absences: 2 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('selected_template_id')).toBe('TEMPLATE_FAIL');
    });

    it('should select TEMPLATE_TOO_MANY_ABSENCES for high absences', () => {
      mocks.expressionEngine.evaluate
        .mockReturnValueOnce(false) // First rule doesn't match
        .mockReturnValueOnce(false) // Second rule doesn't match
        .mockReturnValueOnce(true); // Third rule matches

      const step = new TemplateSelectorStep(mocks.logger, mocks.expressionEngine, {
        outputKey: 'selected_template_id'
      });

      const context = new PipelineContext({ grade: 7, absences: 6 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('selected_template_id')).toBe('TEMPLATE_TOO_MANY_ABSENCES');
    });

    it('should select TEMPLATE_DEFAULT when no rules match', () => {
      mocks.expressionEngine.evaluate.mockReturnValue(false); // All rules fail

      const step = new TemplateSelectorStep(mocks.logger, mocks.expressionEngine, {
        outputKey: 'selected_template_id'
      });

      const context = new PipelineContext({ grade: 7, absences: 3 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('selected_template_id')).toBe('TEMPLATE_DEFAULT');
      expect(mocks.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No rules matched, using default template')
      );
    });

    it('should handle custom rules', () => {
      mocks.expressionEngine.evaluate.mockReturnValue(true);

      const customRules = [
        { condition: '{{score}} >= 90', value: 'EXCELLENT' },
        { condition: '{{score}} >= 70', value: 'GOOD' }
      ];

      const step = new TemplateSelectorStep(mocks.logger, mocks.expressionEngine, {
        outputKey: 'performance_category',
        requiredKeys: ['score'],
        rules: customRules
      });

      const context = new PipelineContext({ score: 95 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('performance_category')).toBe('EXCELLENT');
    });
  });

  // ===================================================================
  // ERROR HANDLING
  // ===================================================================

  describe('Error Handling', () => {
    it('should propagate errors from evaluateRules', () => {
      class ErrorProducer extends ProducerStep {
        evaluateRules() {
          throw new Error('Evaluation failed');
        }
      }

      const step = new ErrorProducer('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({});

      expect(() => step.execute(context)).toThrow('Evaluation failed');
    });

    it('should handle expression evaluation errors gracefully in TemplateSelectorStep', () => {
      mocks.expressionEngine.evaluate
        .mockImplementationOnce(() => {
          throw new Error('Invalid expression');
        })
        .mockReturnValueOnce(true); // Second rule works

      const step = new TemplateSelectorStep(mocks.logger, mocks.expressionEngine, {
        outputKey: 'selected_template_id'
      });

      const context = new PipelineContext({ grade: 4, absences: 2 });
      const result = step.execute(context);

      // Should continue to next rule and succeed
      expect(result.success).toBe(true);
      expect(mocks.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error evaluating rule')
      );
    });
  });

  // ===================================================================
  // INTEGRATION WITH STEP BASE CLASS
  // ===================================================================

  describe('Integration with Step Base Class', () => {
    it('should respect shouldExecute condition', () => {
      const step = new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result',
        shouldExecuteCondition: (context) => context.get('enabled') === true
      });

      const context = new PipelineContext({ enabled: false, testValue: 10 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(context.has('result')).toBe(false);
    });

    it('should return execution timing', () => {
      mocks.expressionEngine.evaluate.mockReturnValue(true);

      const step = new TestProducerStep('test', mocks.logger, mocks.expressionEngine, {
        outputKey: 'result'
      });

      const context = new PipelineContext({ testValue: 10 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });
  });
});
