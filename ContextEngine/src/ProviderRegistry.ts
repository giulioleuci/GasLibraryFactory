import type { ContextLogger, Provider, MutatingProvider } from './internal/contracts.js';
/**
 * @file ContextEngine/src/ProviderRegistry.js
 * @description Manages registration and retrieval of data providers.
 * @version 1.0.0
 */

import { TypedRegistry } from './internal/TypedRegistry.js';
import { ProviderNotFoundError } from './internal/errors/ProviderNotFoundError.js';

/**
 * Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 * @extends TypedRegistry
 */
export class ProviderRegistry<
  Entry extends Provider<object> | MutatingProvider = Provider<object> | MutatingProvider
> extends TypedRegistry<Entry> {
  /**
   * Initializes the registry with a required logger service.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger: ContextLogger) {
    super(logger, {
      label: 'ProviderRegistry',
      requiredMethod: 'provide',
      noun: 'provider',
      notFoundError: (type, registeredTypes) =>
        new ProviderNotFoundError(type, { registeredProviders: registeredTypes })
    });
  }
}
