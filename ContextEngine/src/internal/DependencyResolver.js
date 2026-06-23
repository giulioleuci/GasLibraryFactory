/**
 * @file ContextEngine/src/DependencyResolver.js
 * @description Resolves dependencies in recipe configurations.
 * @version 1.0.0
 */

import { DependencyResolutionError } from './errors/DependencyResolutionError';

/**
 * Dependency resolution engine for @param (initial) and $provider (runtime) references in recipes.
 * Supports dot-notation for nested properties and bracket-notation for array indices.
 * @class
 */
export class DependencyResolver {
  /**
   * Pattern for @param references (e.g., '@userId').
   * @type {RegExp}
   * @static
   * @private
   */
  static get PARAM_PATTERN() {
    return /^@([a-zA-Z_][a-zA-Z0-9_]*)$/;
  }

  /**
   * Pattern for $provider references (e.g., '$user.profile.name', '$items[0].id').
   * @type {RegExp}
   * @static
   * @private
   */
  static get PROVIDER_PATTERN() {
    return /^\$([a-zA-Z_][a-zA-Z0-9_]*)(\.[\w[\].]+)?$/;
  }

  /**
   * Initializes the resolver with a required logger service.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger) {
    // Validate inputs
    if (!logger || typeof logger !== 'object') {
      throw new Error('DependencyResolver: logger is required and must be an object');
    }

    if (
      typeof logger.debug !== 'function' ||
      typeof logger.info !== 'function' ||
      typeof logger.warn !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error('DependencyResolver: logger must have debug, info, warn, and error methods');
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
   * Validates if a string value matches @param or $provider syntax.
   * @param {*} value Target value to inspect.
   * @returns {boolean} True if string matches dependency patterns.
   */
  isDependency(value) {
    if (typeof value !== 'string') {
      return false;
    }

    return (
      DependencyResolver.PARAM_PATTERN.test(value) ||
      DependencyResolver.PROVIDER_PATTERN.test(value)
    );
  }

  /**
   * Traverses a nested object/array structure based on dot-separated path.
   * @param {Object|Array} obj Source container.
   * @param {string} path Property path (e.g., 'items[0].id').
   * @returns {*} Resolved value or undefined if path is unreachable.
   * @private
   */
  _getNestedProperty(obj, path) {
    if (!path) {
      return obj;
    }

    // Split path by dots, handling array indices
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }

      // Handle array index access: items[0]
      const arrayMatch = part.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[(\d+)\]$/);
      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);

        if (!Array.isArray(current[arrayName])) {
          return undefined;
        }

        current = current[arrayName][index];
      } else {
        current = current[part];
      }
    }

    return current;
  }

  /**
   * Resolves a single dependency reference against initial parameters and runtime provider results.
   * @param {string} dependency Dependency reference string.
   * @param {Object} initialParams Map of @param identifiers to values.
   * @param {Object} providerResults Map of $provider identifiers to output payloads.
   * @param {string} [providerName=''] Contextual name of the dependent provider for error reporting.
   * @returns {*} Resolved payload.
   * @throws {Error} If inputs are invalid.
   * @throws {DependencyResolutionError} If reference cannot be satisfied or path is invalid.
   */
  resolve(dependency, initialParams, providerResults, providerName = '') {
    // Validate inputs
    if (typeof dependency !== 'string') {
      throw new Error('DependencyResolver.resolve: dependency must be a string');
    }

    if (!initialParams || typeof initialParams !== 'object') {
      throw new Error(
        'DependencyResolver.resolve: initialParams is required and must be an object'
      );
    }

    if (!providerResults || typeof providerResults !== 'object') {
      throw new Error(
        'DependencyResolver.resolve: providerResults is required and must be an object'
      );
    }

    // Check for @param reference
    const paramMatch = dependency.match(DependencyResolver.PARAM_PATTERN);
    if (paramMatch) {
      const paramName = paramMatch[1];

      if (!Object.prototype.hasOwnProperty.call(initialParams, paramName)) {
        throw new DependencyResolutionError(
          `Parameter '${paramName}' not found in initial parameters`,
          {
            dependency,
            providerName,
            availableParams: Object.keys(initialParams)
          }
        );
      }

      this._logger.debug(`Resolved ${dependency} -> ${JSON.stringify(initialParams[paramName])}`);
      return initialParams[paramName];
    }

    // Check for $provider.property reference
    const providerMatch = dependency.match(DependencyResolver.PROVIDER_PATTERN);
    if (providerMatch) {
      const targetProvider = providerMatch[1];
      const propertyPath = providerMatch[2] ? providerMatch[2].substring(1) : ''; // Remove leading dot

      if (!Object.prototype.hasOwnProperty.call(providerResults, targetProvider)) {
        throw new DependencyResolutionError(
          `Provider '${targetProvider}' has not been executed yet or does not exist`,
          {
            dependency,
            providerName,
            availableProviders: Object.keys(providerResults)
          }
        );
      }

      const providerData = providerResults[targetProvider];

      // If no property path, return entire provider result
      if (!propertyPath) {
        this._logger.debug(`Resolved ${dependency} -> [provider data]`);
        return providerData;
      }

      // Extract nested property
      const value = this._getNestedProperty(providerData, propertyPath);

      if (value === undefined) {
        throw new DependencyResolutionError(
          `Property '${propertyPath}' not found in provider '${targetProvider}' result`,
          {
            dependency,
            providerName,
            availableProperties: Object.keys(providerData || {})
          }
        );
      }

      this._logger.debug(`Resolved ${dependency} -> ${JSON.stringify(value)}`);
      return value;
    }

    // If we get here, the dependency format is invalid
    throw new DependencyResolutionError(
      `Invalid dependency format: '${dependency}'. Expected @paramName or $providerName.property`,
      {
        dependency,
        providerName
      }
    );
  }

  /**
   * Recursively resolves all dependency references within a complex object or array.
   * @param {Object|Array} parameters Source structure containing potential references.
   * @param {Object} initialParams Map of @param identifiers.
   * @param {Object} providerResults Map of $provider identifiers.
   * @param {string} [providerName=''] Contextual name for error reporting.
   * @returns {Object|Array} Cloned structure with all satisfied dependencies.
   * @throws {Error} If inputs are invalid.
   * @throws {DependencyResolutionError} If any reference resolution fails.
   */
  resolveAll(parameters, initialParams, providerResults, providerName = '') {
    // Validate inputs
    if (!parameters || typeof parameters !== 'object') {
      throw new Error(
        'DependencyResolver.resolveAll: parameters is required and must be an object'
      );
    }

    if (!initialParams || typeof initialParams !== 'object') {
      throw new Error(
        'DependencyResolver.resolveAll: initialParams is required and must be an object'
      );
    }

    if (!providerResults || typeof providerResults !== 'object') {
      throw new Error(
        'DependencyResolver.resolveAll: providerResults is required and must be an object'
      );
    }

    const resolved = {};

    for (const key in parameters) {
      if (!Object.prototype.hasOwnProperty.call(parameters, key)) {
        continue;
      }

      const value = parameters[key];

      // Check if value is a dependency
      if (this.isDependency(value)) {
        resolved[key] = this.resolve(value, initialParams, providerResults, providerName);
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively resolve nested objects
        resolved[key] = this.resolveAll(value, initialParams, providerResults, providerName);
      } else if (Array.isArray(value)) {
        // Recursively resolve arrays
        resolved[key] = value.map((item) => {
          if (this.isDependency(item)) {
            return this.resolve(item, initialParams, providerResults, providerName);
          } else if (item !== null && typeof item === 'object') {
            return this.resolveAll(item, initialParams, providerResults, providerName);
          } else {
            return item;
          }
        });
      } else {
        // Use literal value
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * Analyzes a parameters structure to extract unique dependency identifiers.
   * @param {Object|Array} parameters Structure to analyze.
   * @returns {Object} Metadata including paramDependencies (names), providerDependencies (names), and total count.
   */
  analyzeDependencies(parameters) {
    const paramDeps = new Set();
    const providerDeps = new Set();

    const analyze = (obj) => {
      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
          continue;
        }

        const value = obj[key];

        if (typeof value === 'string') {
          const paramMatch = value.match(DependencyResolver.PARAM_PATTERN);
          if (paramMatch) {
            paramDeps.add(paramMatch[1]);
          }

          const providerMatch = value.match(DependencyResolver.PROVIDER_PATTERN);
          if (providerMatch) {
            providerDeps.add(providerMatch[1]);
          }
        } else if (value !== null && typeof value === 'object') {
          analyze(value);
        }
      }
    };

    analyze(parameters);

    return {
      paramDependencies: Array.from(paramDeps),
      providerDependencies: Array.from(providerDeps),
      totalDependencies: paramDeps.size + providerDeps.size
    };
  }
}

