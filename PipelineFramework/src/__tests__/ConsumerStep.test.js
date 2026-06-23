// ===================================================================
// FILE: PipelineFramework/src/__tests__/ConsumerStep.test.js
// ===================================================================
// Comprehensive test suite for ConsumerStep
// Coverage: Constructor, validation, execution, error handling
// ===================================================================

import { ConsumerStep } from '../ConsumerStep';
import { PipelineContext } from '../PipelineContext';
import { GenerateDocumentStep } from '../examples/GenerateDocumentStep';
import { MockFactory } from '../../../test/fakes/MockFactory';

// Create a concrete implementation for testing
class TestConsumerStep extends ConsumerStep {
  constructor(name, logger, options = {}) {
    super(name, logger, options);
    this.actionCount = 0;
    this.lastInputValue = null;
  }

  performAction(inputValue, context) {
    this.actionCount++;
    this.lastInputValue = inputValue;

    // Simple action: append '_PROCESSED' to the input
    return `${inputValue}_PROCESSED`;
  }
}

describe('ConsumerStep - Comprehensive Test Suite', () => {
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
      const step = new TestConsumerStep('testConsumer', mocks.logger, {
        inputKey: 'inputData'
      });

      expect(step).toBeDefined();
      expect(step.getName()).toBe('testConsumer');
      expect(step.inputKey).toBe('inputData');
      expect(step.outputKey).toBe(null);
    });

    it('should create instance with custom options', () => {
      const step = new TestConsumerStep('testConsumer', mocks.logger, {
        inputKey: 'inputData',
        outputKey: 'outputData',
        requiredKeys: ['inputData', 'userId'],
        continueOnError: true
      });

      expect(step.getName()).toBe('testConsumer');
      expect(step.inputKey).toBe('inputData');
      expect(step.outputKey).toBe('outputData');
      expect(step._requiredKeys).toEqual(['inputData', 'userId']);
      expect(step._continueOnError).toBe(true);
    });

    it('should throw error if inputKey is not provided', () => {
      expect(() => new TestConsumerStep('test', mocks.logger, {})).toThrow(
        'ConsumerStep: options.inputKey is required and must be a non-empty string'
      );

      expect(() => new TestConsumerStep('test', mocks.logger, { inputKey: '' })).toThrow(
        'ConsumerStep: options.inputKey is required and must be a non-empty string'
      );

      expect(() => new TestConsumerStep('test', mocks.logger, { inputKey: 123 })).toThrow(
        'ConsumerStep: options.inputKey is required and must be a non-empty string'
      );
    });
  });

  // ===================================================================
  // GETTER METHODS
  // ===================================================================

  describe('Getter Methods', () => {
    it('should return input key', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'myInputKey'
      });

      expect(step.inputKey).toBe('myInputKey');
    });

    it('should return output key when provided', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input',
        outputKey: 'myOutputKey'
      });

      expect(step.outputKey).toBe('myOutputKey');
    });

    it('should return null for output key when not provided', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      expect(step.outputKey).toBe(null);
    });
  });

  // ===================================================================
  // PERFORM ACTION (ABSTRACT METHOD)
  // ===================================================================

  describe('performAction Method', () => {
    it('should throw error if not implemented by subclass', () => {
      // Create instance using ConsumerStep directly (not TestConsumerStep)
      class AbstractConsumer extends ConsumerStep {}
      const step = new AbstractConsumer('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({ input: 'test' });

      expect(() => step.performAction('test', context)).toThrow(
        'ConsumerStep.performAction must be implemented by subclass: test'
      );
    });

    it('should be called by _executeLogic with input value', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'data'
      });

      const context = new PipelineContext({ data: 'VALUE123' });
      step.execute(context);

      expect(step.actionCount).toBe(1);
      expect(step.lastInputValue).toBe('VALUE123');
    });
  });

  // ===================================================================
  // EXECUTION LOGIC
  // ===================================================================

  describe('Execution Logic', () => {
    it('should read input value from context and perform action', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'templateId'
      });

      const context = new PipelineContext({ templateId: 'TEMPLATE_PASS' });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(step.lastInputValue).toBe('TEMPLATE_PASS');
    });

    it('should write result to output key when provided', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input',
        outputKey: 'output'
      });

      const context = new PipelineContext({ input: 'DATA' });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(context.get('output')).toBe('DATA_PROCESSED');
    });

    it('should not write to context when output key is not provided', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({ input: 'DATA' });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      // Only input key should exist
      expect(Object.keys(context.getData())).toEqual(['input']);
    });

    it('should log execution details', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input',
        outputKey: 'output'
      });

      const context = new PipelineContext({ input: 'DATA' });
      step.execute(context);

      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Reading input from 'input': DATA")
      );
      expect(mocks.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Performing action with input: DATA')
      );
      expect(mocks.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Action completed: output = "DATA_PROCESSED"')
      );
    });

    it('should handle string input values', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({ input: 'string_value' });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(step.lastInputValue).toBe('string_value');
    });

    it('should handle number input values', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({ input: 42 });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(step.lastInputValue).toBe(42);
    });

    it('should handle boolean input values', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({ input: true });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(step.lastInputValue).toBe(true);
    });
  });

  // ===================================================================
  // INPUT VALIDATION
  // ===================================================================

  describe('Input Validation', () => {
    it('should throw error if input value is null', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({ input: null });

      expect(() => step.execute(context)).toThrow(
        "ConsumerStep (test): Input value 'input' is null or undefined"
      );
    });

    it('should throw error if input value is undefined', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({});

      expect(() => step.execute(context)).toThrow(
        "ConsumerStep (test): Input value 'input' is null or undefined"
      );
    });

    it('should provide helpful error message for missing input', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'selectedTemplate'
      });

      const context = new PipelineContext({ otherData: 'value' });

      // Error will be wrapped in StepExecutionError
      expect(() => step.execute(context)).toThrow(/selectedTemplate.*null or undefined/);
    });

    it('should validate required keys before execution', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input',
        requiredKeys: ['input', 'userId']
      });

      const context = new PipelineContext({ input: 'DATA' });

      expect(() => step.execute(context)).toThrow();
    });
  });

  // ===================================================================
  // EXAMPLE IMPLEMENTATION: GenerateDocumentStep
  // ===================================================================

  describe('GenerateDocumentStep Example', () => {
    beforeEach(() => {
      // DriveService mock is already available in mocks.driveService
    });

    it('should generate document from TEMPLATE_PASS', () => {
      const step = new GenerateDocumentStep(mocks.logger, mocks.driveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document',
        requiredKeys: ['selected_template_id']
      });

      const context = new PipelineContext({
        selected_template_id: 'TEMPLATE_PASS',
        student_name: 'John Doe'
      });

      const result = step.execute(context);

      expect(result.success).toBe(true);

      const document = context.get('generated_document');
      expect(document).toBeDefined();
      expect(document.name).toBe('John Doe - PASS Report');
      expect(document.templateId).toBe('TEMPLATE_PASS');
      expect(document.id).toBeDefined();
      expect(document.url).toBeDefined();
    });

    it('should generate document from TEMPLATE_FAIL', () => {
      const step = new GenerateDocumentStep(mocks.logger, mocks.driveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document'
      });

      const context = new PipelineContext({
        selected_template_id: 'TEMPLATE_FAIL',
        student_name: 'Jane Smith'
      });

      const result = step.execute(context);

      expect(result.success).toBe(true);

      const document = context.get('generated_document');
      expect(document.name).toBe('Jane Smith - FAIL Report');
      expect(document.templateId).toBe('TEMPLATE_FAIL');
    });

    it('should use default student name when not provided', () => {
      const step = new GenerateDocumentStep(mocks.logger, mocks.driveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document'
      });

      const context = new PipelineContext({
        selected_template_id: 'TEMPLATE_PASS'
      });

      const result = step.execute(context);

      expect(result.success).toBe(true);

      const document = context.get('generated_document');
      expect(document.name).toBe('Unknown Student - PASS Report');
    });

    it('should throw error for unknown template ID', () => {
      const step = new GenerateDocumentStep(mocks.logger, mocks.driveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document'
      });

      const context = new PipelineContext({
        selected_template_id: 'UNKNOWN_TEMPLATE'
      });

      expect(() => step.execute(context)).toThrow(
        "GenerateDocumentStep: Unknown template ID 'UNKNOWN_TEMPLATE'"
      );
    });

    it('should include all metadata in result', () => {
      const step = new GenerateDocumentStep(mocks.logger, mocks.driveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document'
      });

      const context = new PipelineContext({
        selected_template_id: 'TEMPLATE_PASS',
        student_name: 'John Doe'
      });

      step.execute(context);

      const document = context.get('generated_document');
      expect(document).toHaveProperty('id');
      expect(document).toHaveProperty('url');
      expect(document).toHaveProperty('name');
      expect(document).toHaveProperty('templateId');
      expect(document).toHaveProperty('templateFileId');
      expect(document).toHaveProperty('createdAt');
    });

    it('should handle custom template mapping', () => {
      const customMapping = {
        CUSTOM_TEMPLATE: 'custom_file_id_123'
      };

      const step = new GenerateDocumentStep(mocks.logger, mocks.driveService, {
        inputKey: 'selected_template_id',
        outputKey: 'generated_document',
        templateMapping: customMapping
      });

      const context = new PipelineContext({
        selected_template_id: 'CUSTOM_TEMPLATE',
        student_name: 'Test User'
      });

      const result = step.execute(context);

      expect(result.success).toBe(true);

      const document = context.get('generated_document');
      expect(document.templateFileId).toBe('custom_file_id_123');
    });
  });

  // ===================================================================
  // ERROR HANDLING
  // ===================================================================

  describe('Error Handling', () => {
    it('should propagate errors from performAction', () => {
      class ErrorConsumer extends ConsumerStep {
        performAction() {
          throw new Error('Action failed');
        }
      }

      const step = new ErrorConsumer('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({ input: 'DATA' });

      expect(() => step.execute(context)).toThrow('Action failed');
    });

    it('should handle errors when output key write fails', () => {
      class BadResultConsumer extends ConsumerStep {
        performAction() {
          // Return a circular reference that can't be JSON.stringified
          const obj = {};
          obj.circular = obj;
          return obj;
        }
      }

      const step = new BadResultConsumer('test', mocks.logger, {
        inputKey: 'input',
        outputKey: 'output'
      });

      const context = new PipelineContext({ input: 'DATA' });

      // Circular references may cause JSON.stringify errors in logging
      // But the data itself can be stored in context
      expect(() => step.execute(context)).toThrow(/circular/i);
    });
  });

  // ===================================================================
  // INTEGRATION WITH STEP BASE CLASS
  // ===================================================================

  describe('Integration with Step Base Class', () => {
    it('should respect shouldExecute condition', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input',
        shouldExecuteCondition: (context) => context.get('enabled') === true
      });

      const context = new PipelineContext({ enabled: false, input: 'DATA' });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
      expect(step.actionCount).toBe(0);
    });

    it('should return execution timing', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      const context = new PipelineContext({ input: 'DATA' });
      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should work with context that has additional data', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'selectedValue',
        outputKey: 'result'
      });

      const context = new PipelineContext({
        userId: 123,
        userName: 'John Doe',
        selectedValue: 'CHOICE_A',
        otherData: { key: 'value' }
      });

      const result = step.execute(context);

      expect(result.success).toBe(true);
      expect(step.lastInputValue).toBe('CHOICE_A');
      expect(context.get('result')).toBe('CHOICE_A_PROCESSED');

      // Other context data should remain unchanged
      expect(context.get('userId')).toBe(123);
      expect(context.get('userName')).toBe('John Doe');
    });
  });

  // ===================================================================
  // ZERO DEPENDENCIES
  // ===================================================================

  describe('Zero Dependencies on Expression Engine', () => {
    it('should not require expression engine in constructor', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input'
      });

      // Should create successfully without expression engine
      expect(step).toBeDefined();
      expect(step._expressionEngine).toBeUndefined();
    });

    it('should work without any expression evaluation', () => {
      const step = new TestConsumerStep('test', mocks.logger, {
        inputKey: 'input',
        outputKey: 'output'
      });

      const context = new PipelineContext({ input: 'SIMPLE_VALUE' });
      const result = step.execute(context);

      // Should work purely based on configuration
      expect(result.success).toBe(true);
      expect(context.get('output')).toBe('SIMPLE_VALUE_PROCESSED');
    });
  });
});
