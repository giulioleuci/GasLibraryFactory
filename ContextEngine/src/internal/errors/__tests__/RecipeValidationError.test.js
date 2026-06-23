/**
 * @file ContextEngine/src/internal/errors/__tests__/RecipeValidationError.test.js
 * @description Dedicated tests for RecipeValidationError
 */

import { describe, it, expect } from '@jest/globals';
import { RecipeValidationError } from '../RecipeValidationError';
import { ContextEngineError } from '../ContextEngineError';

describe('RecipeValidationError', () => {
  describe('Constructor', () => {
    it('should create error with message and context', () => {
      const context = {
        validationErrors: ['providers is required', 'provider.name must be a string']
      };
      const error = new RecipeValidationError('Invalid recipe format', context);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ContextEngineError);
      expect(error).toBeInstanceOf(RecipeValidationError);
      expect(error.message).toBe('Invalid recipe format');
      expect(error.name).toBe('RecipeValidationError');
      expect(error.context).toEqual(context);
    });

    it('should set validationErrors property from context', () => {
      const context = {
        validationErrors: ['error1', 'error2', 'error3']
      };
      const error = new RecipeValidationError('Validation failed', context);

      expect(error.validationErrors).toEqual(['error1', 'error2', 'error3']);
      expect(error.validationErrors).toHaveLength(3);
    });

    it('should default to empty array when validationErrors not provided', () => {
      const error = new RecipeValidationError('Validation failed', {});

      expect(error.validationErrors).toEqual([]);
      expect(Array.isArray(error.validationErrors)).toBe(true);
    });

    it('should handle empty context', () => {
      const error = new RecipeValidationError('Validation failed');

      expect(error.validationErrors).toEqual([]);
      expect(error.context).toEqual({});
    });

    it('should preserve recipe in context', () => {
      const recipe = {
        providers: [{ name: 'test', type: 'TestProvider' }]
      };
      const context = {
        validationErrors: ['Missing required field'],
        recipe
      };
      const error = new RecipeValidationError('Invalid recipe', context);

      expect(error.context.recipe).toEqual(recipe);
    });

    it('should handle single validation error', () => {
      const context = {
        validationErrors: ['providers array is required']
      };
      const error = new RecipeValidationError('Validation failed', context);

      expect(error.validationErrors).toEqual(['providers array is required']);
      expect(error.validationErrors).toHaveLength(1);
    });

    it('should handle multiple validation errors', () => {
      const errors = [
        'providers is required',
        'provider.name must be a string',
        'provider.type must be specified',
        'parameters must be an object'
      ];
      const context = { validationErrors: errors };
      const error = new RecipeValidationError('Multiple validation errors', context);

      expect(error.validationErrors).toEqual(errors);
      expect(error.validationErrors).toHaveLength(4);
    });

    it('should preserve additional context properties', () => {
      const context = {
        validationErrors: ['error1'],
        recipeName: 'TestRecipe',
        lineNumber: 42
      };
      const error = new RecipeValidationError('Validation failed', context);

      expect(error.context.recipeName).toBe('TestRecipe');
      expect(error.context.lineNumber).toBe(42);
    });
  });

  describe('Inheritance', () => {
    it('should inherit from ContextEngineError', () => {
      const error = new RecipeValidationError('Test');
      expect(error instanceof ContextEngineError).toBe(true);
    });

    it('should have correct error name', () => {
      const error = new RecipeValidationError('Test');
      expect(error.name).toBe('RecipeValidationError');
    });

    it('should use toString() from parent', () => {
      const context = {
        validationErrors: ['error1', 'error2']
      };
      const error = new RecipeValidationError('Invalid recipe', context);
      const result = error.toString();

      expect(result).toContain('RecipeValidationError: Invalid recipe');
      expect(result).toContain('"validationErrors"');
      expect(result).toContain('"error1"');
      expect(result).toContain('"error2"');
    });
  });
});
