/**
 * @file CoreUtilsLib/src/ValidationUtils.js
 * @description Centralized validation utilities for dependency and parameter validation.
 * Eliminates duplicate validation code across all GasLibraryFactory libraries.
 * @version 1.1.0 - Added interface-based validation support
 */

import { InterfaceRegistry } from './interfaces.js';

/**
 * Centralized utilities for static dependency and parameter validation across libraries.
 * @class
 */
export class ValidationUtils {
  /**
   * Required methods for a valid logger interface.
   * @static
   * @type {string[]}
   */
  static get LOGGER_METHODS() {
    return ['debug', 'info', 'warn', 'error'];
  }

  /**
   * Validates that a logger object has all required logging methods.
   *
   * A valid logger must be a non-null object with debug, info, warn, and error
   * methods that are all functions.
   *
   * @param {Object} logger - The logger object to validate
   * @param {string} [context='ValidationUtils'] - Context for error messages (class/function name)
   * @returns {boolean} True if validation passes
   * @throws {Error} If logger is missing or invalid
   *
   * @example
   * // In a constructor
   * constructor(logger) {
   *   ValidationUtils.validateLogger(logger, 'MyService');
   *   this._logger = logger;
   * }
   *
   * @example
   * // Throws descriptive error
   * ValidationUtils.validateLogger(null, 'MyService');
   * // Error: 'MyService: logger is required and must be an object'
   *
   * ValidationUtils.validateLogger({ debug: 'not a function' }, 'MyService');
   * // Error: 'MyService: logger.debug must be a function'
   */
  static validateLogger(logger, context = 'ValidationUtils') {
    if (!logger || typeof logger !== 'object') {
      throw new Error(`${context}: logger is required and must be an object`);
    }

    for (const method of ValidationUtils.LOGGER_METHODS) {
      if (typeof logger[method] !== 'function') {
        throw new Error(`${context}: logger.${method} must be a function`);
      }
    }

    return true;
  }

  /**
   * Validates a dependency object, optionally checking for required methods.
   *
   * Validates that a dependency is a non-null object and optionally verifies
   * that it has specific methods that are functions.
   *
   * @param {Object} dependency - The dependency object to validate
   * @param {string} name - The name of the dependency (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @param {string[]} [requiredMethods=[]] - Array of method names that must exist
   * @param {boolean} [required=true] - If false, allows null/undefined (optional dependency)
   * @returns {boolean} True if validation passes
   * @throws {Error} If validation fails for a required dependency
   *
   * @example
   * // Required dependency with method validation
   * ValidationUtils.validateDependency(utils, 'utils', 'MyService', ['sleep', 'delay']);
   *
   * @example
   * // Optional dependency (won't throw if null)
   * ValidationUtils.validateDependency(cache, 'cache', 'MyService', ['get', 'put'], false);
   *
   * @example
   * // Simple object validation without method checking
   * ValidationUtils.validateDependency(config, 'config', 'MyService');
   */
  static validateDependency(
    dependency,
    name,
    context = 'ValidationUtils',
    requiredMethods = [],
    required = true
  ) {
    // Allow null/undefined for optional dependencies
    if (!required && (dependency === null || dependency === undefined)) {
      return true;
    }

    if (!dependency || typeof dependency !== 'object') {
      throw new Error(`${context}: ${name} is required and must be an object`);
    }

    for (const method of requiredMethods) {
      if (typeof dependency[method] !== 'function') {
        throw new Error(`${context}: ${name}.${method} must be a function`);
      }
    }

    return true;
  }

  /**
   * Validates that a value is not null or undefined.
   *
   * @param {*} value - The value to validate
   * @param {string} name - The name of the parameter (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @returns {boolean} True if validation passes
   * @throws {Error} If value is null or undefined
   *
   * @example
   * ValidationUtils.validateRequired(userId, 'userId', 'getUser');
   */
  static validateRequired(value, name, context = 'ValidationUtils') {
    if (value === null || value === undefined) {
      throw new Error(`${context}: ${name} is required`);
    }
    return true;
  }

  /**
   * Validates that a value is a non-empty string.
   *
   * @param {*} value - The value to validate
   * @param {string} name - The name of the parameter (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @returns {boolean} True if validation passes
   * @throws {Error} If value is not a non-empty string
   *
   * @example
   * ValidationUtils.validateNonEmptyString(tableName, 'tableName', 'DatabaseService.query');
   */
  static validateNonEmptyString(value, name, context = 'ValidationUtils') {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${context}: ${name} must be a non-empty string`);
    }
    return true;
  }

  /**
   * Validates that a value is a positive integer.
   *
   * @param {*} value - The value to validate
   * @param {string} name - The name of the parameter (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @returns {boolean} True if validation passes
   * @throws {Error} If value is not a positive integer
   *
   * @example
   * ValidationUtils.validatePositiveInteger(maxAttempts, 'maxAttempts', 'retry');
   */
  static validatePositiveInteger(value, name, context = 'ValidationUtils') {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
      throw new Error(`${context}: ${name} must be a positive integer`);
    }
    return true;
  }

  /**
   * Validates that a value is a function.
   *
   * @param {*} value - The value to validate
   * @param {string} name - The name of the parameter (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @returns {boolean} True if validation passes
   * @throws {Error} If value is not a function
   *
   * @example
   * ValidationUtils.validateFunction(callback, 'callback', 'processAsync');
   */
  static validateFunction(value, name, context = 'ValidationUtils') {
    if (typeof value !== 'function') {
      throw new Error(`${context}: ${name} must be a function`);
    }
    return true;
  }

  /**
   * Validates that a value is an array.
   *
   * @param {*} value - The value to validate
   * @param {string} name - The name of the parameter (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @param {boolean} [allowEmpty=true] - If false, requires non-empty array
   * @returns {boolean} True if validation passes
   * @throws {Error} If value is not an array (or empty when not allowed)
   *
   * @example
   * ValidationUtils.validateArray(items, 'items', 'processItems', false);
   */
  static validateArray(value, name, context = 'ValidationUtils', allowEmpty = true) {
    if (!Array.isArray(value)) {
      throw new Error(`${context}: ${name} must be an array`);
    }
    if (!allowEmpty && value.length === 0) {
      throw new Error(`${context}: ${name} must be a non-empty array`);
    }
    return true;
  }

  /**
   * Validates that a value is a plain object (not null, array, or other types).
   *
   * @param {*} value - The value to validate
   * @param {string} name - The name of the parameter (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @returns {boolean} True if validation passes
   * @throws {Error} If value is not a plain object
   *
   * @example
   * ValidationUtils.validateObject(options, 'options', 'configure');
   */
  static validateObject(value, name, context = 'ValidationUtils') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`${context}: ${name} must be a plain object`);
    }
    return true;
  }

  /**
   * Validates that a value is one of the allowed values (enum-like validation).
   *
   * @param {*} value - The value to validate
   * @param {Array} allowedValues - Array of allowed values
   * @param {string} name - The name of the parameter (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @returns {boolean} True if validation passes
   * @throws {Error} If value is not in the allowed values
   *
   * @example
   * ValidationUtils.validateEnum(status, ['pending', 'active', 'completed'], 'status', 'updateJob');
   */
  static validateEnum(value, allowedValues, name, context = 'ValidationUtils') {
    if (!allowedValues.includes(value)) {
      const allowed = allowedValues.map((v) => `'${v}'`).join(', ');
      throw new Error(`${context}: ${name} must be one of: ${allowed}`);
    }
    return true;
  }

  /**
   * Validates multiple conditions at once, collecting all errors.
   *
   * Unlike other validation methods that throw on first error, this method
   * collects all validation errors and throws a single error with all messages.
   *
   * @param {Array<[boolean, string]>} validations - Array of [condition, errorMessage] tuples
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @returns {boolean} True if all validations pass
   * @throws {Error} If any validation fails (includes all error messages)
   *
   * @example
   * ValidationUtils.validateAll([
   *   [typeof name === 'string', 'name must be a string'],
   *   [age > 0, 'age must be positive'],
   *   [email.includes('@'), 'email must be valid']
   * ], 'createUser');
   */
  static validateAll(validations, context = 'ValidationUtils') {
    const errors = [];

    for (const [condition, errorMessage] of validations) {
      if (!condition) {
        errors.push(errorMessage);
      }
    }

    if (errors.length > 0) {
      throw new Error(`${context}: Validation failed:\n- ${errors.join('\n- ')}`);
    }

    return true;
  }

  /**
   * Validates that an object implements a specific interface.
   *
   * Uses the interface definitions from CoreUtilsLib/src/interfaces.js to validate
   * that an object has all required methods for a given interface.
   *
   * Available interfaces:
   * - LoggerInterface (debug, info, warn, error)
   * - CacheInterface (get, put, remove)
   * - UtilsServiceInterface (sleep)
   * - ExceptionServiceInterface (executeWithRetry)
   * - MonitorInterface (logJobStart, logJobComplete, logStepStart, logStepComplete)
   * - DataProviderInterface (provide)
   * - StepInterface (getName, execute)
   * - ExpressionEngineInterface (evaluate)
   * - ProviderRegistryInterface (get, getRegisteredTypes)
   * - SpreadsheetServiceInterface (getSheetData)
   *
   * @param {Object} obj - The object to validate
   * @param {string} interfaceName - Name of the interface to validate against
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @param {boolean} [required=true] - If false, allows null/undefined
   * @returns {boolean} True if validation passes
   * @throws {Error} If object doesn't implement the interface
   *
   * @example
   * // Validate logger implements LoggerInterface
   * ValidationUtils.validateInterface(logger, 'LoggerInterface', 'MyService');
   *
   * @example
   * // Validate optional cache implements CacheInterface
   * ValidationUtils.validateInterface(cache, 'CacheInterface', 'MyService', false);
   */
  static validateInterface(obj, interfaceName, context = 'ValidationUtils', required = true) {
    // Allow null/undefined for optional dependencies
    if (!required && (obj === null || obj === undefined)) {
      return true;
    }

    const interfaceDef = InterfaceRegistry[interfaceName];
    if (!interfaceDef) {
      throw new Error(`${context}: Unknown interface: ${interfaceName}`);
    }

    if (!obj || typeof obj !== 'object') {
      throw new Error(
        `${context}: ${interfaceName} implementation is required and must be an object`
      );
    }

    const missing = interfaceDef.requiredMethods.filter((m) => typeof obj[m] !== 'function');
    if (missing.length > 0) {
      throw new Error(
        `${context}: Object does not implement ${interfaceName}. Missing methods: ${missing.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Checks if an object implements an interface (non-throwing).
   *
   * @param {Object} obj - The object to check
   * @param {string} interfaceName - Name of the interface to check
   * @returns {boolean} True if object implements the interface, false otherwise
   *
   * @example
   * if (ValidationUtils.implementsInterface(obj, 'LoggerInterface')) {
   *   // Safe to use as logger
   * }
   */
  static implementsInterface(obj, interfaceName) {
    try {
      return ValidationUtils.validateInterface(obj, interfaceName, 'check', true);
    } catch {
      return false;
    }
  }

  /**
   * Gets the list of available interface names.
   *
   * @returns {string[]} Array of available interface names
   *
   * @example
   * const interfaces = ValidationUtils.getAvailableInterfaces();
   * // ['LoggerInterface', 'CacheInterface', 'UtilsServiceInterface', ...]
   */
  static getAvailableInterfaces() {
    return Object.keys(InterfaceRegistry);
  }
}
