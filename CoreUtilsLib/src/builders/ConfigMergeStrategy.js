/**
 * @file CoreUtilsLib/src/config/ConfigMergeStrategy.js
 * @description Provides merging and normalization strategies for configurations.
 * @version 1.0.0
 */

import { cloneDeep, merge } from '../facades/LodashFacade.js';

export class ConfigMergeStrategy {
  /**
   * Performs deep merge of provided config with defaults, cloning both to prevent mutation.
   * @param {Object} provided Provided configuration (nullable).
   * @param {Object} defaults Default configuration values.
   * @returns {Object} Deep-merged configuration.
   */
  mergeWithDefaults(provided, defaults) {
    if (!provided) {
      return cloneDeep(defaults);
    }

    return merge(cloneDeep(defaults), cloneDeep(provided));
  }

  /**
   * Normalizes options by applying defaults and validator-driven type coercion.
   * @param {Object} options Options to normalize.
   * @param {Object} schema Schema defining defaults and types.
   * @param {string} context Context for error messages.
   * @param {Object} validator ConfigValidator instance for type coercion.
   * @returns {Object} Normalized options.
   */
  normalizeOptions(options, schema, context, validator) {
    const normalized = {};
    const providedOptions = options || {};

    for (const [key, spec] of Object.entries(schema)) {
      let value = key in providedOptions ? providedOptions[key] : spec.default;

      // Apply type coercion if specified
      if (value !== undefined && value !== null && spec.type) {
        value = validator.coerceType(value, spec.type, key, context);
      }

      // Apply transform if specified
      if (spec.transform && typeof spec.transform === 'function') {
        value = spec.transform(value);
      }

      normalized[key] = value;
    }

    return normalized;
  }
}
