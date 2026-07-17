/**
 * @file ContextEngine/src/InterceptorRegistry.js
 * @description Manages registration and retrieval of context interceptors.
 * @version 1.0.0
 */

/**
 * Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 */
export class InterceptorRegistry {
  /**
   * Initializes the registry with a required logger service.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger) {
    // Validate inputs
    if (!logger || typeof logger !== 'object') {
      throw new Error('InterceptorRegistry: logger is required and must be an object');
    }

    if (
      typeof logger.debug !== 'function' ||
      typeof logger.info !== 'function' ||
      typeof logger.warn !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error('InterceptorRegistry: logger must have debug, info, warn, and error methods');
    }

    /**
     * Logger service.
     * @private
     * @type {Object}
     */
    this._logger = logger;

    /**
     * Internal map of singleton interceptor instances.
     * @private
     * @type {Map<string, Object>}
     */
    this._singletons = new Map();

    /**
     * Internal map of interceptor factory functions.
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
   * Registers a pre-instantiated stateless interceptor.
   * @param {string} type Unique interceptor type identifier.
   * @param {Object} instance Interceptor instance implementing the intercept() method.
   * @returns {InterceptorRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty, instance is null, or intercept() method is missing.
   */
  registerSingleton(type, instance) {
    // Validate inputs
    if (!type || typeof type !== 'string') {
      throw new Error(
        'InterceptorRegistry.registerSingleton: type is required and must be a non-empty string'
      );
    }

    if (!instance || typeof instance !== 'object') {
      throw new Error(
        'InterceptorRegistry.registerSingleton: instance is required and must be an object'
      );
    }

    if (typeof instance.intercept !== 'function') {
      throw new Error(
        'InterceptorRegistry.registerSingleton: instance must have an intercept method'
      );
    }

    this._singletons.set(type, instance);
    this._logger.debug(`Registered singleton interceptor: ${type}`);

    return this;
  }

  /**
   * Registers a factory function for stateful interceptor instantiation.
   * @param {string} type Unique interceptor type identifier.
   * @param {Function} factory Function returning a new interceptor instance on each call.
   * @returns {InterceptorRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty or factory is not a function.
   */
  registerFactory(type, factory) {
    // Validate inputs
    if (!type || typeof type !== 'string') {
      throw new Error(
        'InterceptorRegistry.registerFactory: type is required and must be a non-empty string'
      );
    }

    if (typeof factory !== 'function') {
      throw new Error(
        'InterceptorRegistry.registerFactory: factory is required and must be a function'
      );
    }

    this._factories.set(type, factory);
    this._logger.debug(`Registered factory interceptor: ${type}`);

    return this;
  }

  /**
   * Resolves an interceptor instance by type, prioritizing singletons over factories.
   * @param {string} type Interceptor type identifier.
   * @returns {Object} Interceptor instance implementing intercept().
   * @throws {Error} If type is not registered or factory returns an invalid object.
   */
  get(type) {
    // Validate input
    if (!type || typeof type !== 'string') {
      throw new Error('InterceptorRegistry.get: type is required and must be a non-empty string');
    }

    // Check singleton registry first
    if (this._singletons.has(type)) {
      this._logger.debug(`Retrieved singleton interceptor: ${type}`);
      return this._singletons.get(type);
    }

    // Check factory registry
    if (this._factories.has(type)) {
      const factory = this._factories.get(type);
      const instance = factory();

      // Validate factory output
      if (!instance || typeof instance !== 'object') {
        throw new Error(
          `InterceptorRegistry.get: Factory for '${type}' did not return a valid object`
        );
      }

      if (typeof instance.intercept !== 'function') {
        throw new Error(
          `InterceptorRegistry.get: Factory for '${type}' returned an object without an intercept method`
        );
      }

      this._logger.debug(`Created interceptor instance from factory: ${type}`);
      return instance;
    }

    // Interceptor not found
    throw new Error(
      `InterceptorRegistry.get: Interceptor type '${type}' not found. ` +
        `Registered types: ${this.getRegisteredTypes().join(', ') || 'none'}`
    );
  }

  /**
   * Aggregates all registered singleton and factory-instantiated interceptors.
   * @returns {Object[]} Collection of active interceptor instances.
   */
  getAll() {
    const instances = [];

    // Add all singleton instances
    for (const instance of this._singletons.values()) {
      instances.push(instance);
    }

    // Create instances from all factories
    for (const factory of this._factories.values()) {
      const instance = factory();
      if (instance && typeof instance.intercept === 'function') {
        instances.push(instance);
      }
    }

    return instances;
  }

  /**
   * Checks for presence of an interceptor type in either registry.
   * @param {string} type Interceptor type identifier.
   * @returns {boolean} True if registered.
   */
  has(type) {
    if (!type || typeof type !== 'string') {
      return false;
    }

    return this._singletons.has(type) || this._factories.has(type);
  }

  /**
   * Removes an interceptor from both singleton and factory registries.
   * @param {string} type Interceptor type identifier.
   * @returns {boolean} True if the interceptor existed and was removed.
   */
  unregister(type) {
    if (!type || typeof type !== 'string') {
      throw new Error(
        'InterceptorRegistry.unregister: type is required and must be a non-empty string'
      );
    }

    const hadSingleton = this._singletons.delete(type);
    const hadFactory = this._factories.delete(type);

    if (hadSingleton || hadFactory) {
      this._logger.debug(`Unregistered interceptor: ${type}`);
      return true;
    }

    return false;
  }

  /**
   * Purges all singleton and factory registrations.
   * @returns {InterceptorRegistry} Fluent interface for chaining.
   */
  clear() {
    this._singletons.clear();
    this._factories.clear();
    this._logger.debug('Cleared all registered interceptors');
    return this;
  }

  /**
   * Retrieves all registered interceptor type identifiers.
   * @returns {string[]} Collection of registered type names.
   */
  getRegisteredTypes() {
    const singletonTypes = Array.from(this._singletons.keys());
    const factoryTypes = Array.from(this._factories.keys());
    return [...singletonTypes, ...factoryTypes];
  }

  /**
   * Generates a technical summary of the registry state.
   * @returns {Object} Metadata including singletonCount, factoryCount, totalInterceptors, and type lists.
   */
  getSummary() {
    return {
      singletonCount: this._singletons.size,
      factoryCount: this._factories.size,
      totalInterceptors: this._singletons.size + this._factories.size,
      singletonTypes: Array.from(this._singletons.keys()),
      factoryTypes: Array.from(this._factories.keys())
    };
  }
}
