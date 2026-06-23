/**
 * @file ComposableContentLib/src/errors/ComposableContentError.js
 * @description Error classes for ComposableContentLib.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * @description Base class for domain-specific exceptions within the composition engine.
 * Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.
 * @class
 * @extends BaseError
 */
export class ComposableContentError extends BaseError {
  /**
   * @description Initializes a generic composition error with structured metadata.
   * @param {string} message Primary error description.
   * @param {Object} [details={}] Diagnostic payload.
   */
  constructor(message, details = {}) {
    super(message, details);
    // Explicit name preserves identity through minified/bundled output.
    this.name = 'ComposableContentError';
    this.details = details;
  }
}

/**
 * @description Exception thrown when a requested block type is not registered.
 * @class
 * @extends ComposableContentError
 */
export class BlockNotFoundError extends ComposableContentError {
  /**
   * @description Initializes a block resolution error.
   * @param {string} blockType Unresolved block identifier.
   */
  constructor(blockType) {
    super(`Block type not found: ${blockType}`, { blockType });
    this.name = 'BlockNotFoundError';
    this.blockType = blockType;
  }
}

/**
 * @description Exception thrown when template rendering fails during block execution.
 * @class
 * @extends ComposableContentError
 */
export class RenderingError extends ComposableContentError {
  /**
   * @description Initializes a rendering error with format context.
   * @param {string} message Specific failure reason.
   * @param {string} blockType Target block identifier.
   * @param {string} format Attempted output format.
   * @param {Error} [cause] Original caught exception.
   */
  constructor(message, blockType, format, cause = null) {
    super(message, {
      blockType,
      format,
      cause: cause?.message || null
    });
    this.name = 'RenderingError';
    this.blockType = blockType;
    this.format = format;
    this.cause = cause;
  }
}

/**
 * @description Exception thrown during top-level recipe composition orchestration.
 * @class
 * @extends ComposableContentError
 */
export class CompositionError extends ComposableContentError {
  /**
   * @description Initializes an orchestration error.
   * @param {string} message Specific failure reason.
   * @param {string} recipeId Target recipe identifier.
   * @param {Error} [cause] Original caught exception.
   */
  constructor(message, recipeId, cause = null) {
    super(message, {
      recipeId,
      cause: cause?.message || null
    });
    this.name = 'CompositionError';
    this.recipeId = recipeId;
    this.cause = cause;
  }
}

/**
 * @description Exception thrown when a Recipe definition manifest fails structural validation.
 * @class
 * @extends ComposableContentError
 */
export class RecipeValidationError extends ComposableContentError {
  /**
   * @description Initializes a recipe validation error.
   * @param {string} message Summary of validation failures.
   * @param {string} recipeId Target recipe identifier.
   * @param {string[]} [validationErrors=[]] Collection of specific violation messages.
   */
  constructor(message, recipeId, validationErrors = []) {
    super(message, { recipeId, validationErrors });
    this.name = 'RecipeValidationError';
    this.recipeId = recipeId;
    this.validationErrors = validationErrors;
  }
}

/**
 * @description Exception thrown when no renderer is registered for a requested output format.
 * @class
 * @extends ComposableContentError
 */
export class RendererNotFoundError extends ComposableContentError {
  /**
   * @description Initializes a renderer resolution error.
   * @param {string} format Unresolved format string.
   */
  constructor(format) {
    super(`Renderer not found for format: ${format}`, { format });
    this.name = 'RendererNotFoundError';
    this.format = format;
  }
}

/**
 * @description Exception thrown when a block's required template ID cannot be resolved.
 * @class
 * @extends ComposableContentError
 */
export class TemplateNotFoundError extends ComposableContentError {
  /**
   * @description Initializes a template resolution error.
   * @param {string} templateId Unresolved template identifier.
   */
  constructor(templateId) {
    super(`Template not found: ${templateId}`, { templateId });
    this.name = 'TemplateNotFoundError';
    this.templateId = templateId;
  }
}

/**
 * @description Exception thrown when a block's defined context data dependencies are unfulfilled.
 * @class
 * @extends ComposableContentError
 */
export class DataRequirementError extends ComposableContentError {
  /**
   * @description Initializes a data dependency error.
   * @param {string} blockType Target block identifier.
   * @param {string[]} missingKeys Collection of missing required keys.
   */
  constructor(blockType, missingKeys) {
    super(`Missing required data for block ${blockType}: ${missingKeys.join(', ')}`, {
      blockType,
      missingKeys
    });
    this.name = 'DataRequirementError';
    this.blockType = blockType;
    this.missingKeys = missingKeys;
  }
}
