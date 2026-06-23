/**
 * @file ContextEngine/src/errors/__tests__/Errors.test.js
 * @description Comprehensive tests for all ContextEngine error classes
 * @version 1.0.0
 */

import { describe, it, expect } from '@jest/globals';
import { ProviderExecutionError } from '../ProviderExecutionError';
import { ContextEngineError } from '../ContextEngineError';
import { RecipeValidationError } from '../RecipeValidationError';
import { ProviderNotFoundError } from '../ProviderNotFoundError';

describe('ContextEngine Error Classes', () => {
  describe('ContextEngineError', () => {
    describe('Constructor', () => {
      it('should create error with message only', () => {
        const error = new ContextEngineError('Test error message');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ContextEngineError);
        expect(error.message).toBe('Test error message');
        expect(error.name).toBe('ContextEngineError');
        expect(error.context).toEqual({});
      });

      it('should create error with message and context', () => {
        const context = {
          recipeName: 'UserDataRecipe',
          currentProvider: 'UserDataProvider'
        };
        const error = new ContextEngineError('Test error', context);

        expect(error.message).toBe('Test error');
        expect(error.context).toEqual(context);
        expect(error.context.recipeName).toBe('UserDataRecipe');
        expect(error.context.currentProvider).toBe('UserDataProvider');
      });

      it('should create error with empty context when not provided', () => {
        const error = new ContextEngineError('Test error');

        expect(error.context).toEqual({});
      });

      it('should preserve original error in context', () => {
        const originalError = new Error('Original error');
        const context = { originalError };
        const error = new ContextEngineError('Wrapped error', context);

        expect(error.context.originalError).toBe(originalError);
        expect(error.context.originalError.message).toBe('Original error');
      });

      it('should handle complex context objects', () => {
        const context = {
          recipeName: 'ComplexRecipe',
          providers: ['Provider1', 'Provider2'],
          metadata: { timestamp: Date.now(), user: 'test' }
        };
        const error = new ContextEngineError('Complex error', context);

        expect(error.context).toEqual(context);
        expect(error.context.providers).toEqual(['Provider1', 'Provider2']);
        expect(error.context.metadata.user).toBe('test');
      });

      it('should maintain stack trace', () => {
        const error = new ContextEngineError('Test error');

        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('ContextEngineError');
      });
    });

    describe('toString()', () => {
      it('should format error without context', () => {
        const error = new ContextEngineError('Test error message');
        const result = error.toString();

        expect(result).toBe('ContextEngineError: Test error message');
      });

      it('should format error with context', () => {
        const context = {
          recipeName: 'UserDataRecipe',
          currentProvider: 'UserDataProvider'
        };
        const error = new ContextEngineError('Test error', context);
        const result = error.toString();

        expect(result).toContain('ContextEngineError: Test error');
        expect(result).toContain('Context:');
        expect(result).toContain('"recipeName": "UserDataRecipe"');
        expect(result).toContain('"currentProvider": "UserDataProvider"');
      });

      it('should handle empty context object', () => {
        const error = new ContextEngineError('Test error', {});
        const result = error.toString();

        expect(result).toBe('ContextEngineError: Test error');
        expect(result).not.toContain('Context:');
      });

      it('should format context as JSON', () => {
        const context = {
          array: [1, 2, 3],
          nested: { key: 'value' }
        };
        const error = new ContextEngineError('Test error', context);
        const result = error.toString();

        expect(result).toContain('"array": [\n    1,\n    2,\n    3\n  ]');
        expect(result).toContain('"nested": {\n    "key": "value"\n  }');
      });

      it('should handle null context values', () => {
        const context = { nullValue: null, undefinedValue: undefined };
        const error = new ContextEngineError('Test error', context);
        const result = error.toString();

        expect(result).toContain('Context:');
        expect(result).toContain('"nullValue": null');
      });
    });

    describe('Inheritance', () => {
      it('should be instanceof Error', () => {
        const error = new ContextEngineError('Test');
        expect(error instanceof Error).toBe(true);
      });

      it('should be instanceof ContextEngineError', () => {
        const error = new ContextEngineError('Test');
        expect(error instanceof ContextEngineError).toBe(true);
      });

      it('should work with try-catch', () => {
        try {
          throw new ContextEngineError('Test error');
        } catch (e) {
          expect(e).toBeInstanceOf(ContextEngineError);
          expect(e.message).toBe('Test error');
        }
      });
    });
  });

  describe('ProviderNotFoundError', () => {
    describe('Constructor', () => {
      it('should create error with providerType only', () => {
        const error = new ProviderNotFoundError('UserDataProvider');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ContextEngineError);
        expect(error).toBeInstanceOf(ProviderNotFoundError);
        expect(error.name).toBe('ProviderNotFoundError');
        expect(error.message).toBe("Provider 'UserDataProvider' not found in registry");
      });

      it('should create error with providerType and context', () => {
        const context = {
          registeredProviders: ['OrderProvider', 'ProductProvider']
        };
        const error = new ProviderNotFoundError('UserDataProvider', context);

        expect(error.message).toBe("Provider 'UserDataProvider' not found in registry");
        expect(error.context.registeredProviders).toEqual(['OrderProvider', 'ProductProvider']);
      });

      it('should set providerType property', () => {
        const error = new ProviderNotFoundError('TestProvider');

        expect(error.providerType).toBe('TestProvider');
      });

      it('should store providerType in context', () => {
        const error = new ProviderNotFoundError('TestProvider');

        expect(error.context.providerType).toBe('TestProvider');
      });

      it('should handle empty context', () => {
        const error = new ProviderNotFoundError('TestProvider', {});

        expect(error.providerType).toBe('TestProvider');
        expect(error.context.providerType).toBe('TestProvider');
      });

      it('should merge context with providerType', () => {
        const context = {
          registeredProviders: ['Provider1', 'Provider2'],
          attemptedAt: Date.now()
        };
        const error = new ProviderNotFoundError('MissingProvider', context);

        expect(error.context.providerType).toBe('MissingProvider');
        expect(error.context.registeredProviders).toEqual(['Provider1', 'Provider2']);
        expect(error.context.attemptedAt).toBeDefined();
      });

      it('should handle context with registeredProviders', () => {
        const context = {
          registeredProviders: ['A', 'B', 'C']
        };
        const error = new ProviderNotFoundError('D', context);

        expect(error.context.registeredProviders).toEqual(['A', 'B', 'C']);
        expect(error.context.registeredProviders).not.toContain('D');
      });

      it('should format error message correctly', () => {
        const error = new ProviderNotFoundError('CustomProvider');

        expect(error.message).toBe("Provider 'CustomProvider' not found in registry");
      });

      it('should handle special characters in provider name', () => {
        const error = new ProviderNotFoundError('Provider@123-Test');

        expect(error.message).toBe("Provider 'Provider@123-Test' not found in registry");
        expect(error.providerType).toBe('Provider@123-Test');
      });

      it('should preserve all context properties', () => {
        const context = {
          registeredProviders: ['P1', 'P2'],
          recipeName: 'TestRecipe',
          suggestion: 'Did you mean P1?'
        };
        const error = new ProviderNotFoundError('P3', context);

        expect(error.context.recipeName).toBe('TestRecipe');
        expect(error.context.suggestion).toBe('Did you mean P1?');
        expect(error.context.providerType).toBe('P3');
      });
    });

    describe('Inheritance', () => {
      it('should inherit from ContextEngineError', () => {
        const error = new ProviderNotFoundError('Test');
        expect(error instanceof ContextEngineError).toBe(true);
      });

      it('should have correct error name', () => {
        const error = new ProviderNotFoundError('Test');
        expect(error.name).toBe('ProviderNotFoundError');
      });

      it('should use toString() from parent', () => {
        const context = {
          registeredProviders: ['Provider1', 'Provider2']
        };
        const error = new ProviderNotFoundError('MissingProvider', context);
        const result = error.toString();

        expect(result).toContain('ProviderNotFoundError');
        expect(result).toContain('MissingProvider');
        expect(result).toContain('not found in registry');
        expect(result).toContain('"providerType": "MissingProvider"');
        expect(result).toContain('"registeredProviders"');
      });
    });
  });

  describe('Error Integration and Usage', () => {
    it('should differentiate between error types using instanceof', () => {
      const errors = [
        new ContextEngineError('Base error'),
        new ProviderExecutionError('Provider', new Error('Test'), {}),
        new RecipeValidationError('Validation error', {}),
        new ProviderNotFoundError('NotFound')
      ];

      expect(errors[0] instanceof ContextEngineError).toBe(true);
      expect(errors[0] instanceof ProviderExecutionError).toBe(false);

      expect(errors[1] instanceof ProviderExecutionError).toBe(true);
      expect(errors[1] instanceof RecipeValidationError).toBe(false);

      expect(errors[2] instanceof RecipeValidationError).toBe(true);
      expect(errors[2] instanceof ProviderNotFoundError).toBe(false);

      expect(errors[3] instanceof ProviderNotFoundError).toBe(true);
      expect(errors[3] instanceof ProviderExecutionError).toBe(false);
    });

    it('should handle error catching with different types', () => {
      const testCases = [
        () => {
          throw new ProviderExecutionError('Provider', new Error('Test'), {});
        },
        () => {
          throw new RecipeValidationError('Validation error', {});
        },
        () => {
          throw new ProviderNotFoundError('NotFound');
        }
      ];

      testCases.forEach((testCase) => {
        try {
          testCase();
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(ContextEngineError);
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    it('should preserve stack traces across error types', () => {
      const errors = [
        new ContextEngineError('Error 1'),
        new ProviderExecutionError('Provider', new Error('Error 3'), {}),
        new RecipeValidationError('Error 4', {}),
        new ProviderNotFoundError('NotFound')
      ];

      errors.forEach((error) => {
        expect(error.stack).toBeDefined();
        expect(typeof error.stack).toBe('string');
        expect(error.stack.length).toBeGreaterThan(0);
      });
    });

    it('should allow error chaining through context', () => {
      const level1 = new Error('Database connection failed');
      const level2 = new ProviderExecutionError('DataProvider', level1, { id: 123 });
      const level3 = new ContextEngineError('Recipe assembly failed', {
        originalError: level2,
        recipeName: 'UserRecipe'
      });

      expect(level3.context.originalError).toBe(level2);
      expect(level3.context.originalError.originalError).toBe(level1);
      expect(level3.context.originalError.originalError.message).toBe('Database connection failed');
    });
  });
});
