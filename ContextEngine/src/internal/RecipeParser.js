/**
 * @file ContextEngine/src/RecipeParser.js
 * @description Validates and parses recipe configurations.
 * @version 1.0.0
 */

import { RecipeValidationError } from './errors/RecipeValidationError';

/**
 * Engine for structural validation, type checking, and normalization of JSON recipes.
 * @class
 * @example
 * const recipe = {
 *   providers: [
 *     {
 *       name: 'user',
 *       type: 'UserDataProvider',
 *       parameters: { id: '@userId' },
 *       condition: 'is_admin == true',
 *       postProcess: [{ type: 'filter', fields: ['id'] }]
 *     }
 *   ]
 * };
 */
export class RecipeParser {
  /**
   * Initializes the parser with a required logger service.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger) {
    // Validate inputs
    if (!logger || typeof logger !== 'object') {
      throw new Error('RecipeParser: logger is required and must be an object');
    }

    if (
      typeof logger.debug !== 'function' ||
      typeof logger.info !== 'function' ||
      typeof logger.warn !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error('RecipeParser: logger must have debug, info, warn, and error methods');
    }

    /**
     * Logger service.
     * @private
     * @type {Object}
     */
    this._logger = logger;
  }

  /**
   * Internal logger instance.
   * @type {Object}
   * @readonly
   */
  get logger() {
    return this._logger;
  }

  /**
   * Evaluates a provider configuration against structural and type constraints.
   * @param {Object} provider Provider configuration object.
   * @param {number} index Array index for error context.
   * @returns {string[]} Collection of validation error messages.
   * @private
   */
  _validateProvider(provider, index) {
    const errors = [];

    if (!provider || typeof provider !== 'object') {
      errors.push(`Provider at index ${index}: must be an object`);
      return errors;
    }

    // Validate name
    if (!provider.name || typeof provider.name !== 'string') {
      errors.push(`Provider at index ${index}: 'name' is required and must be a string`);
    }

    // Validate type
    if (!provider.type || typeof provider.type !== 'string') {
      errors.push(`Provider at index ${index}: 'type' is required and must be a string`);
    }

    // Validate parameters (optional, but must be object if present)
    if (provider.parameters !== undefined) {
      if (provider.parameters === null || typeof provider.parameters !== 'object') {
        errors.push(`Provider at index ${index}: 'parameters' must be an object if provided`);
      }
    }

    // Validate condition (optional, but must be string if present)
    if (provider.condition !== undefined) {
      if (typeof provider.condition !== 'string') {
        errors.push(`Provider at index ${index}: 'condition' must be a string if provided`);
      }
    }

    // Validate postProcess (optional, but must be array if present)
    if (provider.postProcess !== undefined) {
      if (!Array.isArray(provider.postProcess)) {
        errors.push(`Provider at index ${index}: 'postProcess' must be an array if provided`);
      } else {
        // Validate each post-processor
        provider.postProcess.forEach((pp, ppIndex) => {
          if (!pp || typeof pp !== 'object') {
            errors.push(
              `Provider at index ${index}, postProcess at index ${ppIndex}: must be an object`
            );
          } else if (!pp.type || typeof pp.type !== 'string') {
            errors.push(
              `Provider at index ${index}, postProcess at index ${ppIndex}: 'type' is required and must be a string`
            );
          }
        });
      }
    }

    return errors;
  }

  /**
   * Executes full recipe validation and normalization. Collects structural, type, and uniqueness errors.
   * @param {Object} recipe Raw JSON recipe.
   * @param {Object[]} recipe.providers Collection of provider configurations.
   * @returns {Object} Normalized recipe with default values for optional fields.
   * @throws {RecipeValidationError} If any validation constraints are violated.
   */
  parse(recipe) {
    // Validate input
    if (!recipe || typeof recipe !== 'object') {
      throw new RecipeValidationError('Recipe must be an object', {
        validationErrors: ['Recipe is required and must be an object']
      });
    }

    const errors = [];

    // Validate providers array
    if (!recipe.providers) {
      errors.push('Recipe must have a "providers" array');
    } else if (!Array.isArray(recipe.providers)) {
      errors.push('"providers" must be an array');
    } else if (recipe.providers.length === 0) {
      errors.push('"providers" array must contain at least one provider');
    } else {
      // Validate each provider
      recipe.providers.forEach((provider, index) => {
        const providerErrors = this._validateProvider(provider, index);
        errors.push(...providerErrors);
      });

      // Check for duplicate provider names
      const names = recipe.providers.map((p) => p.name).filter((n) => n);
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate provider names found: ${duplicates.join(', ')}`);
      }
    }

    // If there are validation errors, throw
    if (errors.length > 0) {
      this._logger.error(`Recipe validation failed with ${errors.length} error(s)`);
      throw new RecipeValidationError(`Recipe validation failed with ${errors.length} error(s)`, {
        validationErrors: errors,
        recipe
      });
    }

    this._logger.debug(`Recipe validated successfully with ${recipe.providers.length} provider(s)`);

    // Return normalized recipe
    return {
      providers: recipe.providers.map((provider) => ({
        name: provider.name,
        type: provider.type,
        parameters: provider.parameters || {},
        condition: provider.condition || null,
        postProcess: provider.postProcess || []
      }))
    };
  }

  /**
   * Non-throwing wrapper for parse(). Returns a validation status object.
   * @param {Object} recipe Raw JSON recipe.
   * @returns {{isValid: boolean, errors: string[]}} Validation metadata.
   */
  validate(recipe) {
    try {
      this.parse(recipe);
      return {
        isValid: true,
        errors: []
      };
    } catch (error) {
      if (error instanceof RecipeValidationError) {
        return {
          isValid: false,
          errors: error.validationErrors
        };
      }
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }
}

