import type { ContextLogger } from './contracts.js';
/**
 * @file ContextEngine/src/internal/TypedRegistry.js
 * @description Generic Singleton/Factory registry shared by ProviderRegistry and
 * InterceptorRegistry — both registered a required-method-typed instance under a
 * string key, supporting singleton and factory instantiation strategies. This
 * class holds that shared logic; subclasses fix the logger validation label,
 * the required instance method, and how a not-found lookup is reported.
 * @version 1.0.0
 */

import { TypeGuards, ValidationUtils } from '@CoreUtilsLib';

export class TypedRegistry<Entry extends object> {
  declare _logger: ContextLogger;
  declare _label: string;
  declare _requiredMethod: keyof Entry & string;
  declare _noun: string;
  declare _article: string;
  declare _notFoundError: (type: string, types: string[]) => Error;
  declare _singletons: Map<string, Entry>;
  declare _factories: Map<string, () => Entry>;
  /**
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @param {Object} config
   * @param {string} config.label Class-style label used to prefix error/log messages (e.g. 'ProviderRegistry').
   * @param {string} config.requiredMethod Instance method every registered entry must implement (e.g. 'provide').
   * @param {string} config.noun Singular entity noun used in log messages (e.g. 'provider').
   * @param {string} [config.article='a'] Indefinite article for `noun` in error messages ('a'/'an').
   * @param {(type: string, registeredTypes: string[]) => Error} config.notFoundError Builds the error thrown
   *   by {@link TypedRegistry#get} when `type` isn't registered.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(
    logger: ContextLogger,
    {
      label,
      requiredMethod,
      noun,
      article = 'a',
      notFoundError
    }: {
      label: string;
      requiredMethod: keyof Entry & string;
      noun: string;
      article?: string;
      notFoundError: (type: string, registeredTypes: string[]) => Error;
    }
  ) {
    if (!TypeGuards.isObject(logger)) {
      throw new Error(`${label}: logger is required and must be an object`);
    }
    if (
      ValidationUtils.LOGGER_METHODS.some(
        (method) =>
          !TypeGuards.isFunction(
            logger[method as keyof Pick<ContextLogger, 'debug' | 'info' | 'warn' | 'error'>]
          )
      )
    ) {
      throw new Error(`${label}: logger must have debug, info, warn, and error methods`);
    }

    this._logger = logger;
    this._label = label;
    this._requiredMethod = requiredMethod;
    this._noun = noun;
    this._article = article;
    this._notFoundError = notFoundError;
    this._singletons = new Map();
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
   * Registers a pre-instantiated stateless entry.
   * @param {string} type Unique type identifier.
   * @param {Object} instance Entry instance implementing the required method.
   * @returns {TypedRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty, instance is null, or the required method is missing.
   */
  registerSingleton(type: string, instance: Entry) {
    if (!TypeGuards.isNonEmptyString(type)) {
      throw new Error(
        `${this._label}.registerSingleton: type is required and must be a non-empty string`
      );
    }
    if (!TypeGuards.isObject(instance)) {
      throw new Error(
        `${this._label}.registerSingleton: instance is required and must be an object`
      );
    }
    if (!TypeGuards.isFunction(instance[this._requiredMethod])) {
      throw new Error(
        `${this._label}.registerSingleton: instance must have ${this._article} ${this._requiredMethod} method`
      );
    }

    this._singletons.set(type, instance);
    this._logger.debug(`Registered singleton ${this._noun}: ${type}`);

    return this;
  }

  /**
   * Registers a factory function for stateful instantiation.
   * @param {string} type Unique type identifier.
   * @param {Function} factory Function returning a new entry instance on each call.
   * @returns {TypedRegistry} Fluent interface for chaining.
   * @throws {Error} If type is empty or factory is not a function.
   */
  registerFactory(type: string, factory: () => Entry) {
    if (!TypeGuards.isNonEmptyString(type)) {
      throw new Error(
        `${this._label}.registerFactory: type is required and must be a non-empty string`
      );
    }
    if (!TypeGuards.isFunction(factory)) {
      throw new Error(`${this._label}.registerFactory: factory is required and must be a function`);
    }

    this._factories.set(type, factory);
    this._logger.debug(`Registered factory ${this._noun}: ${type}`);

    return this;
  }

  /**
   * Resolves an entry instance by type identifier, prioritizing singletons over factories.
   * @param {string} type Type identifier.
   * @returns {Object} Entry instance implementing the required method.
   * @throws {Error} If type is not a string, or a factory returns an invalid object.
   */
  get(type: string): Entry {
    if (!TypeGuards.isNonEmptyString(type)) {
      throw new Error(`${this._label}.get: type is required and must be a non-empty string`);
    }

    if (this._singletons.has(type)) {
      this._logger.debug(`Retrieved singleton ${this._noun}: ${type}`);
      return this._singletons.get(type)!;
    }

    if (this._factories.has(type)) {
      const factory = this._factories.get(type)!;
      const instance = factory();

      if (!TypeGuards.isObject(instance)) {
        throw new Error(`${this._label}.get: Factory for '${type}' did not return a valid object`);
      }
      if (!TypeGuards.isFunction(instance[this._requiredMethod])) {
        throw new Error(
          `${this._label}.get: Factory for '${type}' returned an object without ${this._article} ${this._requiredMethod} method`
        );
      }

      this._logger.debug(`Created ${this._noun} instance from factory: ${type}`);
      return instance;
    }

    throw this._notFoundError(type, this.getRegisteredTypes());
  }

  /**
   * Aggregates all registered singleton and factory-instantiated entries.
   * @returns {Object[]} Collection of active entry instances.
   */
  getAll() {
    const instances: Entry[] = [];

    for (const instance of this._singletons.values()) {
      instances.push(instance);
    }

    for (const factory of this._factories.values()) {
      const instance = factory();
      if (instance && typeof instance[this._requiredMethod] === 'function') {
        instances.push(instance);
      }
    }

    return instances;
  }

  /**
   * Retrieves all registered type identifiers.
   * @returns {string[]} Collection of registered type names.
   */
  getRegisteredTypes() {
    return [...this._singletons.keys(), ...this._factories.keys()];
  }
}
