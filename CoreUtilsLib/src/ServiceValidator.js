/**
 * @file CoreUtilsLib/src/ServiceValidator.js
 * @description Service-specific validation utilities for constructor dependency validation.
 * Centralizes the common validation patterns used across all GasLibraryFactory services.
 * @version 1.0.0
 */

import { ValidationUtils } from './ValidationUtils.js';

/**
 * Validates common service dependencies (logger, utils, cache, exceptions) to standardize constructor boilerplate.
 * @class
 */
export class ServiceValidator {
  /**
   * Required methods for UtilsService interface.
   * @static
   * @type {string[]}
   */
  static get UTILS_METHODS() {
    return ['sleep'];
  }

  /**
   * Required methods for Cache service interface.
   * @static
   * @type {string[]}
   */
  static get CACHE_METHODS() {
    return ['get', 'put', 'remove'];
  }

  /**
   * Required methods for ExceptionService interface.
   * @static
   * @type {string[]}
   */
  static get EXCEPTION_SERVICE_METHODS() {
    return ['executeWithRetry', 'classifyException'];
  }

  /**
   * Required methods for Spreadsheet service interface.
   * @static
   * @type {string[]}
   */
  static get SPREADSHEET_METHODS() {
    return ['getSpreadsheet', 'getSheet', 'getRange'];
  }

  /**
   * Validates a logger dependency.
   *
   * Delegates to ValidationUtils.validateLogger for consistency.
   *
   * @param {Object} logger - The logger to validate
   * @param {string} [context='ServiceValidator'] - Context for error messages
   * @returns {boolean} True if validation passes
   * @throws {Error} If logger is invalid
   *
   * @example
   * ServiceValidator.validateLogger(logger, 'MyService');
   */
  static validateLogger(logger, context = 'ServiceValidator') {
    return ValidationUtils.validateLogger(logger, context);
  }

  /**
   * Validates a utils service dependency.
   *
   * A valid utils service must have at least the sleep method.
   * Additional method requirements can be specified.
   *
   * @param {Object} utils - The utils service to validate
   * @param {string} [context='ServiceValidator'] - Context for error messages
   * @param {string[]} [additionalMethods=[]] - Additional required methods
   * @param {boolean} [required=true] - If false, allows null/undefined
   * @returns {boolean} True if validation passes
   * @throws {Error} If utils is invalid (when required)
   *
   * @example
   * ServiceValidator.validateUtils(utils, 'MyService');
   *
   * @example
   * // With additional method requirements
   * ServiceValidator.validateUtils(utils, 'MyService', ['formatDate', 'parseDate']);
   */
  static validateUtils(
    utils,
    context = 'ServiceValidator',
    additionalMethods = [],
    required = true
  ) {
    const methods = [...ServiceValidator.UTILS_METHODS, ...additionalMethods];
    return ValidationUtils.validateDependency(utils, 'utils', context, methods, required);
  }

  /**
   * Validates a cache service dependency.
   *
   * Cache is optional by default since many services can function without caching.
   *
   * @param {Object} cache - The cache service to validate
   * @param {string} [context='ServiceValidator'] - Context for error messages
   * @param {boolean} [required=false] - If true, cache is required
   * @returns {boolean} True if validation passes
   * @throws {Error} If cache is invalid (when required)
   *
   * @example
   * ServiceValidator.validateCache(cache, 'MyService'); // Optional
   *
   * @example
   * ServiceValidator.validateCache(cache, 'MyService', true); // Required
   */
  static validateCache(cache, context = 'ServiceValidator', required = false) {
    return ValidationUtils.validateDependency(
      cache,
      'cache',
      context,
      ServiceValidator.CACHE_METHODS,
      required
    );
  }

  /**
   * Validates an exception service dependency.
   *
   * @param {Object} exceptionService - The exception service to validate
   * @param {string} [context='ServiceValidator'] - Context for error messages
   * @param {boolean} [required=false] - If true, exception service is required
   * @returns {boolean} True if validation passes
   * @throws {Error} If exception service is invalid (when required)
   *
   * @example
   * ServiceValidator.validateExceptionService(exceptionService, 'MyService');
   */
  static validateExceptionService(
    exceptionService,
    context = 'ServiceValidator',
    required = false
  ) {
    return ValidationUtils.validateDependency(
      exceptionService,
      'exceptionService',
      context,
      ServiceValidator.EXCEPTION_SERVICE_METHODS,
      required
    );
  }

  /**
   * Validates a spreadsheet service dependency.
   *
   * @param {Object} spreadsheetService - The spreadsheet service to validate
   * @param {string} [context='ServiceValidator'] - Context for error messages
   * @param {boolean} [required=true] - If false, allows null/undefined
   * @returns {boolean} True if validation passes
   * @throws {Error} If spreadsheet service is invalid (when required)
   *
   * @example
   * ServiceValidator.validateSpreadsheetService(spreadsheetService, 'MyService');
   */
  static validateSpreadsheetService(
    spreadsheetService,
    context = 'ServiceValidator',
    required = true
  ) {
    return ValidationUtils.validateDependency(
      spreadsheetService,
      'spreadsheetService',
      context,
      ServiceValidator.SPREADSHEET_METHODS,
      required
    );
  }

  /**
   * Validates all common service dependencies at once.
   *
   * This is a convenience method for services that use the standard
   * dependency pattern (logger, utils, cache, exceptionService).
   *
   * @param {Object} deps - Object containing dependencies
   * @param {Object} deps.logger - The logger (required)
   * @param {Object} deps.utils - The utils service (required)
   * @param {Object} [deps.cache] - The cache service (optional)
   * @param {Object} [deps.exceptionService] - The exception service (optional)
   * @param {string} [context='ServiceValidator'] - Context for error messages
   * @param {Object} [options={}] - Validation options
   * @param {boolean} [options.requireCache=false] - If true, cache is required
   * @param {boolean} [options.requireExceptionService=false] - If true, exception service is required
   * @returns {boolean} True if all validations pass
   * @throws {Error} If any required dependency is invalid
   *
   * @example
   * ServiceValidator.validateServiceDependencies(
   *   { logger, utils, cache, exceptionService },
   *   'MyService'
   * );
   *
   * @example
   * // With cache required
   * ServiceValidator.validateServiceDependencies(
   *   { logger, utils, cache },
   *   'MyService',
   *   { requireCache: true }
   * );
   */
  static validateServiceDependencies(deps, context = 'ServiceValidator', options = {}) {
    const { requireCache = false, requireExceptionService = false } = options;

    ServiceValidator.validateLogger(deps.logger, context);
    ServiceValidator.validateUtils(deps.utils, context);
    ServiceValidator.validateCache(deps.cache, context, requireCache);
    ServiceValidator.validateExceptionService(
      deps.exceptionService,
      context,
      requireExceptionService
    );

    return true;
  }

  /**
   * Validates a generic service interface with custom method requirements.
   *
   * @param {Object} service - The service to validate
   * @param {string} name - The name of the service (for error messages)
   * @param {string[]} requiredMethods - Array of required method names
   * @param {string} [context='ServiceValidator'] - Context for error messages
   * @param {boolean} [required=true] - If false, allows null/undefined
   * @returns {boolean} True if validation passes
   * @throws {Error} If service is invalid (when required)
   *
   * @example
   * ServiceValidator.validateService(
   *   documentService,
   *   'documentService',
   *   ['getDocument', 'updateDocument', 'createDocument'],
   *   'MyService'
   * );
   */
  static validateService(
    service,
    name,
    requiredMethods,
    context = 'ServiceValidator',
    required = true
  ) {
    return ValidationUtils.validateDependency(service, name, context, requiredMethods, required);
  }

  /**
   * Creates a reusable validator function for a specific service type.
   *
   * This is useful when you need to validate the same service type
   * in multiple places with the same requirements.
   *
   * @param {string} name - The name of the service type
   * @param {string[]} requiredMethods - Array of required method names
   * @returns {Function} A validator function that takes (service, context, required)
   *
   * @example
   * const validateDocService = ServiceValidator.createValidator(
   *   'documentService',
   *   ['getDocument', 'updateDocument']
   * );
   *
   * // Use the validator
   * validateDocService(docService, 'MyService');
   */
  static createValidator(name, requiredMethods) {
    return (service, context = 'ServiceValidator', required = true) => {
      return ServiceValidator.validateService(service, name, requiredMethods, context, required);
    };
  }

  /**
   * Validates constructor options object.
   *
   * This is a convenience method for validating an options object
   * that contains multiple service dependencies.
   *
   * @param {Object} options - The options object
   * @param {Object} requirements - Object mapping option keys to required methods
   * @param {string} [context='ServiceValidator'] - Context for error messages
   * @returns {boolean} True if validation passes
   * @throws {Error} If any required option is invalid
   *
   * @example
   * ServiceValidator.validateConstructorOptions(
   *   { logger, utils, driveService },
   *   {
   *     logger: { required: true, methods: ['debug', 'info', 'warn', 'error'] },
   *     utils: { required: true, methods: ['sleep'] },
   *     driveService: { required: false, methods: ['getFile', 'createFile'] }
   *   },
   *   'MyService'
   * );
   */
  static validateConstructorOptions(options, requirements, context = 'ServiceValidator') {
    const opts = options || {};

    for (const [key, spec] of Object.entries(requirements)) {
      const value = opts[key];
      const required = spec.required !== false; // Default to required
      const methods = spec.methods || [];

      ValidationUtils.validateDependency(value, key, context, methods, required);
    }

    return true;
  }
}
