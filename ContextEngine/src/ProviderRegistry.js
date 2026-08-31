/**
 * @file ContextEngine/src/ProviderRegistry.js
 * @description Manages registration and retrieval of data providers.
 * @version 1.0.0
 */

import { TypedRegistry } from './internal/TypedRegistry';
import { ProviderNotFoundError } from './internal/errors/ProviderNotFoundError';

/**
 * Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 * @extends TypedRegistry
 */
export class ProviderRegistry extends TypedRegistry {
  /**
   * Initializes the registry with a required logger service.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger) {
    super(logger, {
      label: 'ProviderRegistry',
      requiredMethod: 'provide',
      noun: 'provider',
      notFoundError: (type, registeredTypes) =>
        new ProviderNotFoundError(type, { registeredProviders: registeredTypes })
    });
  }
}
