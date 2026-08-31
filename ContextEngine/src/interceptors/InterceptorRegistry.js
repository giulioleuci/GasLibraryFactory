/**
 * @file ContextEngine/src/InterceptorRegistry.js
 * @description Manages registration and retrieval of context interceptors.
 * @version 1.0.0
 */

import { TypedRegistry } from '../internal/TypedRegistry';

/**
 * Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.
 * @class
 * @extends TypedRegistry
 */
export class InterceptorRegistry extends TypedRegistry {
  /**
   * Initializes the registry with a required logger service.
   * @param {Object} logger Logger service with debug, info, warn, error methods.
   * @throws {Error} If logger is missing or lacks required interface methods.
   */
  constructor(logger) {
    super(logger, {
      label: 'InterceptorRegistry',
      requiredMethod: 'intercept',
      noun: 'interceptor',
      article: 'an',
      notFoundError: (type, registeredTypes) =>
        new Error(
          `InterceptorRegistry.get: Interceptor type '${type}' not found. ` +
            `Registered types: ${registeredTypes.join(', ') || 'none'}`
        )
    });
  }
}
