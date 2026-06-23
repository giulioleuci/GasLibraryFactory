/**
 * @file CoreUtilsLib/src/ConfigurationBuilder.js
 * @description Utilities for building and validating configuration objects with defaults.
 * Centralizes configuration pattern across all GasLibraryFactory libraries.
 * @version 1.1.0 - Refactored to Facade/Delegation pattern
 */

import { cloneDeep, merge } from '../facades/LodashFacade.js';
import { ConfigMergeStrategy } from './ConfigMergeStrategy.js';
import { ConfigValidator } from './ConfigValidator.js';

/**
 * Singletons for internal strategies
 */
const mergeStrategy = new ConfigMergeStrategy();
const validator = new ConfigValidator();

/**
 * Static facade and fluent builder for deep configuration merging and schema validation.
 * @class ConfigurationBuilder
 */
export class ConfigurationBuilder {
  /**
   * Deep merge provided configuration with default values, returning a new object.
   * @param {Object} provided - Input configuration overrides.
   * @param {Object} defaults - Base configuration defaults.
   * @returns {Object} Merged configuration object.
   */
  static mergeWithDefaults(provided, defaults) {
    return mergeStrategy.mergeWithDefaults(provided, defaults);
  }

  /**
   * Apply defaults and type coercion to normalize options against a schema.
   * @param {Object} options - Raw input options.
   * @param {Object} schema - Definition of expected types and defaults.
   * @param {string} [context='ConfigurationBuilder'] - Diagnostic context.
   * @returns {Object} Normalized options object.
   */
  static normalizeOptions(options, schema, context = 'ConfigurationBuilder') {
    return mergeStrategy.normalizeOptions(options, schema, context, validator);
  }

  /**
   * Validate a configuration object against schema rules without throwing.
   * @param {Object} config - Configuration object to test.
   * @param {Object} rules - Validation schema.
   * @param {string} [context='ConfigurationBuilder'] - Diagnostic context.
   * @returns {{valid: boolean, errors: string[]}} Validation result.
   */
  static validateConfiguration(config, rules, context = 'ConfigurationBuilder') {
    return validator.validateConfiguration(config, rules, context);
  }

  /**
   * Enforce configuration validity, throwing if the schema is violated.
   * @param {Object} config - Configuration object to test.
   * @param {Object} rules - Validation schema.
   * @param {string} [context='ConfigurationBuilder'] - Diagnostic context.
   * @throws {Error} If validation fails.
   */
  static assertValid(config, rules, context = 'ConfigurationBuilder') {
    validator.assertValid(config, rules, context);
  }

  /**
   * Create a fluent builder initialized with optional defaults.
   * @param {Object} [defaults={}] - Initial configuration state.
   * @returns {Object} Fluent builder instance.
   */
  static create(defaults = {}) {
    let config = cloneDeep(defaults);

    const builder = {
      /**
       * Set a configuration property key to a specific value.
       * @param {string} key - Property identifier.
       * @param {*} value - Property payload.
       * @returns {Object} Chained builder instance.
       */
      set(key, value) {
        config[key] = value;
        return builder;
      },

      /**
       * Set a configuration property key only if the provided value is not undefined.
       * @param {string} key - Property identifier.
       * @param {*} value - Potential property payload.
       * @returns {Object} Chained builder instance.
       */
      setIfDefined(key, value) {
        if (value !== undefined) {
          config[key] = value;
        }
        return builder;
      },

      /**
       * Set a configuration property key only if it does not already exist.
       * @param {string} key - Property identifier.
       * @param {*} value - Default property payload.
       * @returns {Object} Chained builder instance.
       */
      setDefault(key, value) {
        if (!(key in config)) {
          config[key] = value;
        }
        return builder;
      },

      /**
       * Deep merge an additional configuration object into the current state.
       * @param {Object} additional - Object containing new properties.
       * @returns {Object} Chained builder instance.
       */
      merge(additional) {
        config = merge(config, cloneDeep(additional));
        return builder;
      },

      /**
       * Enforce schema-based validation rules on the current configuration state.
       * @param {Object} rules - Validation schema.
       * @param {string} [context] - Diagnostic context.
       * @returns {Object} Chained builder instance.
       * @throws {Error} If validation fails.
       */
      validate(rules, context) {
        ConfigurationBuilder.assertValid(config, rules, context);
        return builder;
      },

      /**
       * Finalize and return a deep clone of the current configuration state.
       * @returns {Object} Decoupled configuration object.
       */
      build() {
        return cloneDeep(config);
      },

      /**
       * Finalize and return an immutable, deep-cloned configuration object.
       * @returns {Object} Frozen configuration object.
       */
      freeze() {
        return Object.freeze(cloneDeep(config));
      }
    };

    return builder;
  }


  // ===================================================================
  // LEGACY PRIVATE METHODS (Delegated for backward compatibility)
  // ===================================================================

  /**
   * @private
   */
  static _coerceType(value, type, key, context) {
    return validator.coerceType(value, type, key, context);
  }

  /**
   * @private
   */
  static _validateField(key, value, rule, context) {
    return validator.validateField(key, value, rule, context);
  }

  /**
   * @private
   */
  static _checkType(value, type) {
    return validator.checkType(value, type);
  }
}
