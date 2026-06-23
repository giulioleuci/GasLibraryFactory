/**
 * @file ContextEngine/src/PostProcessor.js
 * @description Post-processing utilities for transforming provider data.
 * @version 1.0.0
 */

import { isPlainObject, isArray } from '@CoreUtilsLib';

/**
 * Registry and execution engine for sequential provider data transformation pipelines.
 * @class
 */
export class PostProcessor {
  /**
   * Initializes the processor with required logger and auto-registers built-in transformations.
   * Built-ins: filterFields, mapValues, renameFields, defaultValues.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger) {
    // Validate inputs
    if (!logger || typeof logger !== 'object') {
      throw new Error('PostProcessor: logger is required and must be an object');
    }

    if (
      typeof logger.debug !== 'function' ||
      typeof logger.info !== 'function' ||
      typeof logger.warn !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error('PostProcessor: logger must have debug, info, warn, and error methods');
    }

    /**
     * Logger service.
     * @private
     * @type {Object}
     */
    this._logger = logger;

    /**
     * Registry of post-processor functions.
     * @private
     * @type {Map<string, Function>}
     */
    this._processors = new Map();

    // Register built-in processors
    this._registerBuiltInProcessors();
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
   * Instantiates and registers the default transformation library.
   * @private
   */
  _registerBuiltInProcessors() {
    // Filter fields
    this.register('filterFields', (data, config) => {
      if (!config.fields || !Array.isArray(config.fields)) {
        throw new Error('filterFields requires a "fields" array in config');
      }

      if (Array.isArray(data)) {
        return data.map((item) => {
          const filtered = {};
          config.fields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(item, field)) {
              filtered[field] = item[field];
            }
          });
          return filtered;
        });
      } else if (isPlainObject(data)) {
        const filtered = {};
        config.fields.forEach((field) => {
          if (Object.prototype.hasOwnProperty.call(data, field)) {
            filtered[field] = data[field];
          }
        });
        return filtered;
      }

      return data;
    });

    // Map values
    this.register('mapValues', (data, config) => {
      if (!isPlainObject(config.mapping)) {
        throw new Error('mapValues requires a "mapping" object in config');
      }

      const map = (value) => {
        return Object.prototype.hasOwnProperty.call(config.mapping, value) ? config.mapping[value] : value;
      };

      if (isArray(data)) {
        return data.map((item) => {
          if (isPlainObject(item)) {
            const mapped = {};
            for (const key in item) {
              mapped[key] = map(item[key]);
            }
            return mapped;
          }
          return map(item);
        });
      }

      return map(data);
    });

    // Rename fields
    this.register('renameFields', (data, config) => {
      if (!isPlainObject(config.mapping)) {
        throw new Error('renameFields requires a "mapping" object in config');
      }

      const rename = (obj) => {
        const renamed = {};
        for (const key in obj) {
          const newKey = config.mapping[key] || key;
          renamed[newKey] = obj[key];
        }
        return renamed;
      };

      if (isArray(data)) {
        return data.map((item) => {
          if (isPlainObject(item)) {
            return rename(item);
          }
          return item;
        });
      } else if (isPlainObject(data)) {
        return rename(data);
      }

      return data;
    });

    // Default values
    this.register('defaultValues', (data, config) => {
      if (!isPlainObject(config.defaults)) {
        throw new Error('defaultValues requires a "defaults" object in config');
      }

      const applyDefaults = (obj) => {
        const result = { ...obj };
        for (const key in config.defaults) {
          if (!Object.prototype.hasOwnProperty.call(result, key) || result[key] === null || result[key] === undefined) {
            result[key] = config.defaults[key];
          }
        }
        return result;
      };

      if (isArray(data)) {
        return data.map((item) => {
          if (isPlainObject(item)) {
            return applyDefaults(item);
          }
          return item;
        });
      } else if (isPlainObject(data)) {
        return applyDefaults(data);
      }

      return data;
    });
  }

  /**
   * Adds a custom transformation function to the registry.
   * @param {string} type Transformation identifier (referenced in recipes).
   * @param {Function} processorFunc Signature: (data, config) => transformedData.
   * @returns {PostProcessor} Fluent interface for chaining.
   * @throws {Error} If type is empty or processorFunc is not a function.
   */
  register(type, processorFunc) {
    // Validate inputs
    if (!type || typeof type !== 'string') {
      throw new Error('PostProcessor.register: type is required and must be a non-empty string');
    }

    if (typeof processorFunc !== 'function') {
      throw new Error('PostProcessor.register: processorFunc is required and must be a function');
    }

    this._processors.set(type, processorFunc);
    this._logger.debug(`Registered post-processor: ${type}`);

    return this;
  }

  /**
   * Validates presence of a transformation identifier in the registry.
   * @param {string} type Transformation identifier.
   * @returns {boolean} True if registered.
   */
  has(type) {
    if (!type || typeof type !== 'string') {
      return false;
    }

    return this._processors.has(type);
  }

  /**
   * Executes a pipeline of transformations sequentially on a data payload.
   * @param {Object[]} processorConfigs Collection of transformation configurations ({type, ...}).
   * @param {*} data Input payload (object, array, or literal).
   * @param {string} [providerName=''] Contextual provider name for diagnostic logging.
   * @returns {*} Transformed payload.
   * @throws {Error} If processor type is unregistered or a transformation logic fails.
   * @example
   * const result = processor.process([
   *   { type: 'filterFields', fields: ['id', 'email'] },
   *   { type: 'renameFields', mapping: { email: 'user_email' } }
   * ], rawData);
   */
  process(processorConfigs, data, providerName = '') {
    // Validate inputs
    if (!processorConfigs || !Array.isArray(processorConfigs)) {
      throw new Error('PostProcessor.process: processorConfigs is required and must be an array');
    }

    if (processorConfigs.length === 0) {
      return data; // No processing needed
    }

    let result = data;

    for (let i = 0; i < processorConfigs.length; i++) {
      const config = processorConfigs[i];

      if (!config || typeof config !== 'object') {
        throw new Error(`PostProcessor.process: Config at index ${i} must be an object`);
      }

      if (!config.type || typeof config.type !== 'string') {
        throw new Error(`PostProcessor.process: Config at index ${i} must have a 'type' string`);
      }

      const processorType = config.type;

      if (!this._processors.has(processorType)) {
        throw new Error(`PostProcessor.process: Unknown processor type '${processorType}'`);
      }

      try {
        const processorFunc = this._processors.get(processorType);
        const prefix = providerName ? `[${providerName}] ` : '';
        this._logger.debug(`${prefix}Applying post-processor: ${processorType}`);

        result = processorFunc(result, config);
      } catch (error) {
        this._logger.error(`Failed to apply post-processor '${processorType}': ${error.message}`);
        throw new Error(`PostProcessor '${processorType}' failed: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Retrieves all registered transformation identifiers.
   * @returns {string[]} Collection of registered type names.
   */
  getRegisteredTypes() {
    return Array.from(this._processors.keys());
  }
}

