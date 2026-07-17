/**
 * @file ContextEngine/src/ProviderRegistry.js
 * @description Manages registration and retrieval of data providers.
 * @version 1.0.0
 */

import { TypeGuards, ValidationUtils } from '@CoreUtilsLib';
import { ProviderNotFoundError } from './internal/errors/ProviderNotFoundError';

/**
 * Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 */
export class ProviderRegistry {
  /**
   * Initializes the registry with a required logger service.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger) {
    // Validate inputs using centralized type guards (CoreUtilsLib).
    if (!TypeGuards.isObject(logger)) {
      throw new Error('ProviderRegistry: logger is required and must be an object');
    }

    if (ValidationUtils.LOGGER_METHODS.some((method) => !TypeGuards.isFunction(logger[method]))) {
      throw new Error('ProviderRegistry: logger must have debug, info, warn, and error methods');
    }

    /**
     * Logger service.
     * @private
     * @type {Object}
     */
    this._logger = logger;

    /**
     * Internal map of singleton provider instances.
     * @private
     * @type {Map<string, Object>}
     */
    this._singletons = new Map();

    /**
     * Internal map of provider factory functions.
     * @private
     * @type {Map<string, Function>}
     */
    this._factories = new Map();
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
   * Registers a pre-instantiated stateless provider.
   * @param {string} type Unique provider type identifier (referenced in recipes).
   * @param {Object} instance Provider instance implementing the provide() method.
   * @returns {ProviderRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty, instance is null, or provide() method is missing.
   */
  registerSingleton(type, instance) {
    // Validate inputs
    if (!TypeGuards.isNonEmptyString(type)) {
      throw new Error(
        'ProviderRegistry.registerSingleton: type is required and must be a non-empty string'
      );
    }

    if (!TypeGuards.isObject(instance)) {
      throw new Error(
        'ProviderRegistry.registerSingleton: instance is required and must be an object'
      );
    }

    if (!TypeGuards.isFunction(instance.provide)) {
      throw new Error('ProviderRegistry.registerSingleton: instance must have a provide method');
    }

    this._singletons.set(type, instance);
    this._logger.debug(`Registered singleton provider: ${type}`);

    return this;
  }

  /**
   * Registers a factory function for stateful provider instantiation.
   * @param {string} type Unique provider type identifier (referenced in recipes).
   * @param {Function} factory Function returning a new provider instance on each call.
   * @returns {ProviderRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty or factory is not a function.
   */
  registerFactory(type, factory) {
    // Validate inputs
    if (!TypeGuards.isNonEmptyString(type)) {
      throw new Error(
        'ProviderRegistry.registerFactory: type is required and must be a non-empty string'
      );
    }

    if (!TypeGuards.isFunction(factory)) {
      throw new Error(
        'ProviderRegistry.registerFactory: factory is required and must be a function'
      );
    }

    this._factories.set(type, factory);
    this._logger.debug(`Registered factory provider: ${type}`);

    return this;
  }

  /**
   * Resolves a provider instance by type identifier, prioritizing singletons over factories.
   * @param {string} type Provider type identifier.
   * @returns {Object} Provider instance implementing provide().
   * @throws {Error} If type is not a string.
   * @throws {ProviderNotFoundError} If type is not registered.
   * @throws {Error} If factory returns an invalid object.
   */
  get(type) {
    // Validate input
    if (!TypeGuards.isNonEmptyString(type)) {
      throw new Error('ProviderRegistry.get: type is required and must be a non-empty string');
    }

    // Check singleton registry first
    if (this._singletons.has(type)) {
      this._logger.debug(`Retrieved singleton provider: ${type}`);
      return this._singletons.get(type);
    }

    // Check factory registry
    if (this._factories.has(type)) {
      const factory = this._factories.get(type);
      const instance = factory();

      // Validate factory output
      if (!TypeGuards.isObject(instance)) {
        throw new Error(
          `ProviderRegistry.get: Factory for '${type}' did not return a valid object`
        );
      }

      if (!TypeGuards.isFunction(instance.provide)) {
        throw new Error(
          `ProviderRegistry.get: Factory for '${type}' returned an object without a provide method`
        );
      }

      this._logger.debug(`Created provider instance from factory: ${type}`);
      return instance;
    }

    // Provider not found
    throw new ProviderNotFoundError(type, {
      registeredProviders: this.getRegisteredTypes()
    });
  }

  /**
   * Validates presence of a provider type in either registry.
   * @param {string} type Provider type identifier.
   * @returns {boolean} True if registered.
   */
  has(type) {
    if (!TypeGuards.isNonEmptyString(type)) {
      return false;
    }

    return this._singletons.has(type) || this._factories.has(type);
  }

  /**
   * Removes a provider from both singleton and factory registries.
   * @param {string} type Provider type identifier.
   * @returns {boolean} True if the provider existed and was removed.
   */
  unregister(type) {
    if (!TypeGuards.isNonEmptyString(type)) {
      throw new Error(
        'ProviderRegistry.unregister: type is required and must be a non-empty string'
      );
    }

    const hadSingleton = this._singletons.delete(type);
    const hadFactory = this._factories.delete(type);

    if (hadSingleton || hadFactory) {
      this._logger.debug(`Unregistered provider: ${type}`);
      return true;
    }

    return false;
  }

  /**
   * Purges all singleton and factory registrations.
   * @returns {ProviderRegistry} Fluent interface for chaining.
   */
  clear() {
    this._singletons.clear();
    this._factories.clear();
    this._logger.debug('Cleared all registered providers');
    return this;
  }

  /**
   * Retrieves all registered provider type identifiers.
   * @returns {string[]} Collection of registered type names.
   */
  getRegisteredTypes() {
    const singletonTypes = Array.from(this._singletons.keys());
    const factoryTypes = Array.from(this._factories.keys());
    return [...singletonTypes, ...factoryTypes];
  }

  /**
   * Generates a technical summary of the registry state.
   * @returns {Object} Metadata including singletonCount, factoryCount, totalProviders, and type lists.
   */
  getSummary() {
    return {
      singletonCount: this._singletons.size,
      factoryCount: this._factories.size,
      totalProviders: this._singletons.size + this._factories.size,
      singletonTypes: Array.from(this._singletons.keys()),
      factoryTypes: Array.from(this._factories.keys())
    };
  }
}
