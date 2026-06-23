/**
 * @file PipelineFramework/src/errors/__tests__/Errors.test.js
 * @description Comprehensive tests for all PipelineFramework error classes
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { PipelineError } from '../PipelineError';
import { StepExecutionError } from '../StepExecutionError';
import { ContextValidationError } from '../ContextValidationError';

describe('PipelineFramework Error Classes', () => {
  describe('PipelineError', () => {
    describe('Constructor', () => {
      it('should create error with message only', () => {
        const error = new PipelineError('Test error message');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(PipelineError);
        expect(error.message).toBe('Test error message');
        expect(error.name).toBe('PipelineError');
        expect(error.context).toEqual({});
      });

      it('should create error with message and context', () => {
        const context = {
          pipelineName: 'DataProcessing',
          currentStep: 'LoadData'
        };
        const error = new PipelineError('Test error', context);

        expect(error.message).toBe('Test error');
        expect(error.context).toEqual(context);
        expect(error.context.pipelineName).toBe('DataProcessing');
        expect(error.context.currentStep).toBe('LoadData');
      });

      it('should create error with empty context when not provided', () => {
        const error = new PipelineError('Test error');

        expect(error.context).toEqual({});
      });

      it('should preserve original error in context', () => {
        const originalError = new Error('Original error');
        const context = { originalError };
        const error = new PipelineError('Wrapped error', context);

        expect(error.context.originalError).toBe(originalError);
        expect(error.context.originalError.message).toBe('Original error');
      });

      it('should handle complex context objects', () => {
        const context = {
          pipelineName: 'ComplexPipeline',
          currentStep: 'ProcessData',
          stepIndex: 3,
          totalSteps: 10,
          metadata: { timestamp: Date.now(), user: 'test' }
        };
        const error = new PipelineError('Complex error', context);

        expect(error.context).toEqual(context);
        expect(error.context.stepIndex).toBe(3);
        expect(error.context.totalSteps).toBe(10);
        expect(error.context.metadata.user).toBe('test');
      });

      it('should maintain stack trace', () => {
        const error = new PipelineError('Test error');

        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('PipelineError');
      });

      it('should handle stepIndex in context', () => {
        const context = {
          pipelineName: 'TestPipeline',
          currentStep: 'Step2',
          stepIndex: 1
        };
        const error = new PipelineError('Test error', context);

        expect(error.context.stepIndex).toBe(1);
      });
    });

    describe('toString()', () => {
      it('should format error without context', () => {
        const error = new PipelineError('Test error message');
        const result = error.toString();

        expect(result).toBe('PipelineError: Test error message');
      });

      it('should format error with context', () => {
        const context = {
          pipelineName: 'DataProcessing',
          currentStep: 'LoadData'
        };
        const error = new PipelineError('Test error', context);
        const result = error.toString();

        expect(result).toContain('PipelineError: Test error');
        expect(result).toContain('Context:');
        expect(result).toContain('"pipelineName": "DataProcessing"');
        expect(result).toContain('"currentStep": "LoadData"');
      });

      it('should handle empty context object', () => {
        const error = new PipelineError('Test error', {});
        const result = error.toString();

        expect(result).toBe('PipelineError: Test error');
        expect(result).not.toContain('Context:');
      });

      it('should format context as JSON', () => {
        const context = {
          steps: ['step1', 'step2', 'step3'],
          nested: { key: 'value' }
        };
        const error = new PipelineError('Test error', context);
        const result = error.toString();

        expect(result).toContain('"steps": [\n    "step1",\n    "step2",\n    "step3"\n  ]');
        expect(result).toContain('"nested": {\n    "key": "value"\n  }');
      });

      it('should handle null context values', () => {
        const context = { nullValue: null, undefinedValue: undefined };
        const error = new PipelineError('Test error', context);
        const result = error.toString();

        expect(result).toContain('Context:');
        expect(result).toContain('"nullValue": null');
      });

      it('should format stepIndex in context', () => {
        const context = { stepIndex: 5 };
        const error = new PipelineError('Test error', context);
        const result = error.toString();

        expect(result).toContain('"stepIndex": 5');
      });
    });

    describe('Inheritance', () => {
      it('should be instanceof Error', () => {
        const error = new PipelineError('Test');
        expect(error instanceof Error).toBe(true);
      });

      it('should be instanceof PipelineError', () => {
        const error = new PipelineError('Test');
        expect(error instanceof PipelineError).toBe(true);
      });

      it('should work with try-catch', () => {
        try {
          throw new PipelineError('Test error');
        } catch (e) {
          expect(e).toBeInstanceOf(PipelineError);
          expect(e.message).toBe('Test error');
        }
      });
    });
  });

  describe('StepExecutionError', () => {
    describe('Constructor', () => {
      it('should create error with stepName, originalError, and context', () => {
        const originalError = new Error('Network timeout');
        const context = { userId: 123 };
        const error = new StepExecutionError('LoadData', originalError, context);

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(PipelineError);
        expect(error).toBeInstanceOf(StepExecutionError);
        expect(error.name).toBe('StepExecutionError');
        expect(error.message).toBe("Step 'LoadData' failed: Network timeout");
      });

      it('should set stepName property', () => {
        const originalError = new Error('Test error');
        const error = new StepExecutionError('TestStep', originalError, {});

        expect(error.stepName).toBe('TestStep');
      });

      it('should set originalError property', () => {
        const originalError = new Error('Original error');
        const error = new StepExecutionError('TestStep', originalError, {});

        expect(error.originalError).toBe(originalError);
        expect(error.originalError.message).toBe('Original error');
      });

      it('should store stepName in context', () => {
        const originalError = new Error('Test');
        const error = new StepExecutionError('TestStep', originalError, {});

        expect(error.context.stepName).toBe('TestStep');
      });

      it('should store originalError in context', () => {
        const originalError = new Error('Original');
        const error = new StepExecutionError('TestStep', originalError, {});

        expect(error.context.originalError).toBe(originalError);
      });

      it('should extract context keys when context provided', () => {
        const originalError = new Error('Test');
        const context = { userId: 123, startDate: '2024-01-01', data: [1, 2, 3] };
        const error = new StepExecutionError('TestStep', originalError, context);

        expect(error.context.contextState).toEqual(['userId', 'startDate', 'data']);
        expect(error.context.contextState).toHaveLength(3);
      });

      it('should handle null context', () => {
        const originalError = new Error('Test');
        const error = new StepExecutionError('TestStep', originalError, null);

        expect(error.context.contextState).toEqual([]);
      });

      it('should handle undefined context', () => {
        const originalError = new Error('Test');
        const error = new StepExecutionError('TestStep', originalError, undefined);

        expect(error.context.contextState).toEqual([]);
      });

      it('should handle empty context', () => {
        const originalError = new Error('Test');
        const error = new StepExecutionError('TestStep', originalError, {});

        expect(error.context.contextState).toEqual([]);
      });

      it('should format error message correctly', () => {
        const originalError = new Error('Connection refused');
        const error = new StepExecutionError('DatabaseStep', originalError, {});

        expect(error.message).toBe("Step 'DatabaseStep' failed: Connection refused");
      });

      it('should handle complex error messages', () => {
        const originalError = new Error('Multiple issues: timeout, retry failed, connection lost');
        const error = new StepExecutionError('ComplexStep', originalError, {});

        expect(error.message).toContain('ComplexStep');
        expect(error.message).toContain('Multiple issues');
      });

      it('should handle context with many keys', () => {
        const originalError = new Error('Test');
        const context = {
          key1: 1,
          key2: 2,
          key3: 3,
          key4: 4,
          key5: 5
        };
        const error = new StepExecutionError('TestStep', originalError, context);

        expect(error.context.contextState).toHaveLength(5);
        expect(error.context.contextState).toEqual(['key1', 'key2', 'key3', 'key4', 'key5']);
      });

      it('should handle context with nested objects', () => {
        const originalError = new Error('Test');
        const context = {
          user: { id: 1, name: 'John' },
          settings: { theme: 'dark' }
        };
        const error = new StepExecutionError('TestStep', originalError, context);

        expect(error.context.contextState).toEqual(['user', 'settings']);
      });
    });

    describe('Inheritance', () => {
      it('should inherit from PipelineError', () => {
        const originalError = new Error('Test');
        const error = new StepExecutionError('TestStep', originalError, {});
        expect(error instanceof PipelineError).toBe(true);
      });

      it('should have correct error name', () => {
        const originalError = new Error('Test');
        const error = new StepExecutionError('TestStep', originalError, {});
        expect(error.name).toBe('StepExecutionError');
      });

      it('should use toString() from parent', () => {
        const originalError = new Error('Network error');
        const context = { userId: 123 };
        const error = new StepExecutionError('LoadData', originalError, context);
        const result = error.toString();

        expect(result).toContain('StepExecutionError');
        expect(result).toContain('Network error');
        expect(result).toContain('"stepName": "LoadData"');
        expect(result).toContain('"userId"');
      });
    });
  });

  describe('ContextValidationError', () => {
    describe('Constructor', () => {
      it('should create error with stepName, missingKeys, and context', () => {
        const context = { existingKey: 'value' };
        const error = new ContextValidationError('LoadData', ['userId', 'startDate'], context);

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(PipelineError);
        expect(error).toBeInstanceOf(ContextValidationError);
        expect(error.name).toBe('ContextValidationError');
        expect(error.message).toBe(
          "Step 'LoadData' validation failed: missing required keys [userId, startDate]"
        );
      });

      it('should set stepName property', () => {
        const error = new ContextValidationError('TestStep', ['key1'], {});

        expect(error.stepName).toBe('TestStep');
      });

      it('should set missingKeys property', () => {
        const missingKeys = ['userId', 'startDate', 'endDate'];
        const error = new ContextValidationError('TestStep', missingKeys, {});

        expect(error.missingKeys).toEqual(missingKeys);
        expect(error.missingKeys).toHaveLength(3);
      });

      it('should store stepName in context', () => {
        const error = new ContextValidationError('TestStep', ['key1'], {});

        expect(error.context.stepName).toBe('TestStep');
      });

      it('should store missingKeys in context', () => {
        const missingKeys = ['key1', 'key2'];
        const error = new ContextValidationError('TestStep', missingKeys, {});

        expect(error.context.missingKeys).toEqual(missingKeys);
      });

      it('should extract available keys from context', () => {
        const context = { key1: 'value1', key2: 'value2', key3: 'value3' };
        const error = new ContextValidationError('TestStep', ['missingKey'], context);

        expect(error.context.availableKeys).toEqual(['key1', 'key2', 'key3']);
        expect(error.context.availableKeys).toHaveLength(3);
      });

      it('should handle null context', () => {
        const error = new ContextValidationError('TestStep', ['key1'], null);

        expect(error.context.availableKeys).toEqual([]);
      });

      it('should handle undefined context', () => {
        const error = new ContextValidationError('TestStep', ['key1'], undefined);

        expect(error.context.availableKeys).toEqual([]);
      });

      it('should handle empty context', () => {
        const error = new ContextValidationError('TestStep', ['key1'], {});

        expect(error.context.availableKeys).toEqual([]);
      });

      it('should format single missing key correctly', () => {
        const error = new ContextValidationError('TestStep', ['userId'], {});

        expect(error.message).toBe(
          "Step 'TestStep' validation failed: missing required keys [userId]"
        );
      });

      it('should format multiple missing keys correctly', () => {
        const error = new ContextValidationError(
          'TestStep',
          ['userId', 'startDate', 'endDate'],
          {}
        );

        expect(error.message).toBe(
          "Step 'TestStep' validation failed: missing required keys [userId, startDate, endDate]"
        );
        expect(error.message).toContain('userId, startDate, endDate');
      });

      it('should handle empty missingKeys array', () => {
        const error = new ContextValidationError('TestStep', [], {});

        expect(error.message).toBe("Step 'TestStep' validation failed: missing required keys []");
        expect(error.missingKeys).toEqual([]);
      });

      it('should handle context with nested objects', () => {
        const context = {
          user: { id: 1 },
          settings: { theme: 'dark' }
        };
        const error = new ContextValidationError('TestStep', ['data'], context);

        expect(error.context.availableKeys).toEqual(['user', 'settings']);
      });

      it('should show contrast between missing and available keys', () => {
        const context = { key1: 'value1', key2: 'value2' };
        const missingKeys = ['key3', 'key4'];
        const error = new ContextValidationError('TestStep', missingKeys, context);

        expect(error.context.availableKeys).toEqual(['key1', 'key2']);
        expect(error.context.missingKeys).toEqual(['key3', 'key4']);
        expect(error.context.availableKeys).not.toContain('key3');
        expect(error.context.missingKeys).not.toContain('key1');
      });

      it('should handle special characters in keys', () => {
        const context = { 'user-id': 123, start_date: '2024-01-01' };
        const missingKeys = ['end-date', 'report_type'];
        const error = new ContextValidationError('TestStep', missingKeys, context);

        expect(error.context.availableKeys).toEqual(['user-id', 'start_date']);
        expect(error.context.missingKeys).toEqual(['end-date', 'report_type']);
      });
    });

    describe('Inheritance', () => {
      it('should inherit from PipelineError', () => {
        const error = new ContextValidationError('TestStep', ['key1'], {});
        expect(error instanceof PipelineError).toBe(true);
      });

      it('should have correct error name', () => {
        const error = new ContextValidationError('TestStep', ['key1'], {});
        expect(error.name).toBe('ContextValidationError');
      });

      it('should use toString() from parent', () => {
        const context = { existingKey: 'value' };
        const error = new ContextValidationError('LoadData', ['userId', 'startDate'], context);
        const result = error.toString();

        expect(result).toContain('ContextValidationError');
        expect(result).toContain('LoadData');
        expect(result).toContain('"stepName": "LoadData"');
        expect(result).toContain('"missingKeys"');
        expect(result).toContain('"availableKeys"');
      });
    });
  });

  describe('Error Integration and Usage', () => {
    it('should differentiate between error types using instanceof', () => {
      const originalError = new Error('Test');
      const errors = [
        new PipelineError('Base error'),
        new StepExecutionError('Step1', originalError, {}),
        new ContextValidationError('Step2', ['key1'], {})
      ];

      expect(errors[0] instanceof PipelineError).toBe(true);
      expect(errors[0] instanceof StepExecutionError).toBe(false);

      expect(errors[1] instanceof StepExecutionError).toBe(true);
      expect(errors[1] instanceof PipelineError).toBe(true);

      expect(errors[2] instanceof ContextValidationError).toBe(true);
      expect(errors[2] instanceof StepExecutionError).toBe(false);
    });

    it('should handle error catching with different types', () => {
      const originalError = new Error('Test');
      const testCases = [
        () => {
          throw new StepExecutionError('Step1', originalError, {});
        },
        () => {
          throw new ContextValidationError('Step2', ['key1'], {});
        }
      ];

      testCases.forEach((testCase) => {
        try {
          testCase();
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(PipelineError);
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    it('should preserve stack traces across error types', () => {
      const originalError = new Error('Test');
      const errors = [
        new PipelineError('Error 1'),
        new StepExecutionError('Step1', originalError, {}),
        new ContextValidationError('Step2', ['key1'], {})
      ];

      errors.forEach((error) => {
        expect(error.stack).toBeDefined();
        expect(typeof error.stack).toBe('string');
        expect(error.stack.length).toBeGreaterThan(0);
      });
    });

    it('should allow error chaining through context', () => {
      const level1 = new Error('Database connection failed');
      const level2 = new StepExecutionError('LoadData', level1, { userId: 123 });
      const level3 = new PipelineError('Pipeline execution failed', {
        originalError: level2,
        pipelineName: 'DataProcessing'
      });

      expect(level3.context.originalError).toBe(level2);
      expect(level3.context.originalError.originalError).toBe(level1);
      expect(level3.context.originalError.originalError.message).toBe('Database connection failed');
    });

    it('should provide useful context for debugging', () => {
      const originalError = new Error('Validation failed');
      const context = { userId: 123, data: { items: [1, 2, 3] } };
      const error = new StepExecutionError('ValidateData', originalError, context);

      expect(error.stepName).toBe('ValidateData');
      expect(error.originalError.message).toBe('Validation failed');
      expect(error.context.contextState).toContain('userId');
      expect(error.context.contextState).toContain('data');
    });

    it('should provide detailed validation error information', () => {
      const context = { existingKey1: 'value1', existingKey2: 'value2' };
      const missingKeys = ['requiredKey1', 'requiredKey2'];
      const error = new ContextValidationError('ValidateInput', missingKeys, context);

      expect(error.stepName).toBe('ValidateInput');
      expect(error.missingKeys).toEqual(missingKeys);
      expect(error.context.availableKeys).toEqual(['existingKey1', 'existingKey2']);
      expect(error.message).toContain('requiredKey1, requiredKey2');
    });
  });
});
