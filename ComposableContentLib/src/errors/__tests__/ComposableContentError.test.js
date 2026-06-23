/**
 * @file ComposableContentLib/src/errors/__tests__/ComposableContentError.test.js
 * @description Unit tests for ComposableContentError and its subclasses.
 */

import {
  ComposableContentError,
  BlockNotFoundError,
  RenderingError,
  CompositionError,
  RecipeValidationError,
  RendererNotFoundError,
  TemplateNotFoundError,
  DataRequirementError
} from '../ComposableContentError.js';

describe('ComposableContentError classes', () => {
  describe('ComposableContentError', () => {
    it('should create an instance with message and details', () => {
      const message = 'Test error message';
      const details = { foo: 'bar' };
      const error = new ComposableContentError(message, details);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ComposableContentError);
      expect(error.message).toBe(message);
      expect(error.name).toBe('ComposableContentError');
      expect(error.details).toEqual(details);
      expect(error.timestamp).toBeDefined();
      expect(new Date(error.timestamp).getTime()).not.toBeNaN();
    });

    it('should use default details if not provided', () => {
      const error = new ComposableContentError('test');
      expect(error.details).toEqual({});
    });

    it('should capture stack trace', () => {
      const error = new ComposableContentError('test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('BlockNotFoundError', () => {
    it('should create an instance with blockType', () => {
      const blockType = 'hero';
      const error = new BlockNotFoundError(blockType);

      expect(error).toBeInstanceOf(ComposableContentError);
      expect(error.name).toBe('BlockNotFoundError');
      expect(error.message).toBe(`Block type not found: ${blockType}`);
      expect(error.blockType).toBe(blockType);
      expect(error.details).toEqual({ blockType });
    });
  });

  describe('RenderingError', () => {
    it('should create an instance with message, blockType, format and cause', () => {
      const message = 'Failed to render';
      const blockType = 'hero';
      const format = 'html';
      const cause = new Error('Original error');
      const error = new RenderingError(message, blockType, format, cause);

      expect(error).toBeInstanceOf(ComposableContentError);
      expect(error.name).toBe('RenderingError');
      expect(error.message).toBe(message);
      expect(error.blockType).toBe(blockType);
      expect(error.format).toBe(format);
      expect(error.cause).toBe(cause);
      expect(error.details).toEqual({
        blockType,
        format,
        cause: cause.message
      });
    });

    it('should handle null cause', () => {
      const error = new RenderingError('msg', 'type', 'fmt');
      expect(error.cause).toBeNull();
      expect(error.details.cause).toBeNull();
    });
  });

  describe('CompositionError', () => {
    it('should create an instance with message, recipeId and cause', () => {
      const message = 'Composition failed';
      const recipeId = 'recipe-123';
      const cause = new Error('Original error');
      const error = new CompositionError(message, recipeId, cause);

      expect(error).toBeInstanceOf(ComposableContentError);
      expect(error.name).toBe('CompositionError');
      expect(error.message).toBe(message);
      expect(error.recipeId).toBe(recipeId);
      expect(error.cause).toBe(cause);
      expect(error.details).toEqual({
        recipeId,
        cause: cause.message
      });
    });

    it('should handle null cause', () => {
      const error = new CompositionError('msg', 'id');
      expect(error.cause).toBeNull();
      expect(error.details.cause).toBeNull();
    });
  });

  describe('RecipeValidationError', () => {
    it('should create an instance with message, recipeId and validationErrors', () => {
      const message = 'Invalid recipe';
      const recipeId = 'recipe-123';
      const validationErrors = ['Missing title', 'Invalid block'];
      const error = new RecipeValidationError(message, recipeId, validationErrors);

      expect(error).toBeInstanceOf(ComposableContentError);
      expect(error.name).toBe('RecipeValidationError');
      expect(error.message).toBe(message);
      expect(error.recipeId).toBe(recipeId);
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.details).toEqual({
        recipeId,
        validationErrors
      });
    });

    it('should use default empty array for validationErrors', () => {
      const error = new RecipeValidationError('msg', 'id');
      expect(error.validationErrors).toEqual([]);
      expect(error.details.validationErrors).toEqual([]);
    });
  });

  describe('RendererNotFoundError', () => {
    it('should create an instance with format', () => {
      const format = 'pdf';
      const error = new RendererNotFoundError(format);

      expect(error).toBeInstanceOf(ComposableContentError);
      expect(error.name).toBe('RendererNotFoundError');
      expect(error.message).toBe(`Renderer not found for format: ${format}`);
      expect(error.format).toBe(format);
      expect(error.details).toEqual({ format });
    });
  });

  describe('TemplateNotFoundError', () => {
    it('should create an instance with templateId', () => {
      const templateId = 'template-456';
      const error = new TemplateNotFoundError(templateId);

      expect(error).toBeInstanceOf(ComposableContentError);
      expect(error.name).toBe('TemplateNotFoundError');
      expect(error.message).toBe(`Template not found: ${templateId}`);
      expect(error.templateId).toBe(templateId);
      expect(error.details).toEqual({ templateId });
    });
  });

  describe('DataRequirementError', () => {
    it('should create an instance with blockType and missingKeys', () => {
      const blockType = 'hero';
      const missingKeys = ['title', 'image'];
      const error = new DataRequirementError(blockType, missingKeys);

      expect(error).toBeInstanceOf(ComposableContentError);
      expect(error.name).toBe('DataRequirementError');
      expect(error.message).toBe(`Missing required data for block hero: title, image`);
      expect(error.blockType).toBe(blockType);
      expect(error.missingKeys).toEqual(missingKeys);
      expect(error.details).toEqual({
        blockType,
        missingKeys
      });
    });
  });
});
