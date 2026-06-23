/**
 * @file PipelineFramework/src/postprocessor/PostProcessorRegistry.js
 * @description Registry for post-processor types.
 * @version 1.0.0
 */

import { ProcessorNotFoundError } from '../internal/postprocessor-errors/PostProcessorError';
import { Registry } from '@CoreUtilsLib';

/**
 * Central registry and factory for post-processor types.
 * Manages mapping between processor type identifiers and their concrete implementation classes.
 *
 * @class PostProcessorRegistry
 *
 * @example
 * registry.register('Audit', AuditProcessor);
 * const instance = registry.create({ processorType: 'Audit', instanceId: 'a1' }, services);
 */
export class PostProcessorRegistry {
  /**
   * @param {Object} [options={}] - Registry configuration.
   * @param {LoggerService} [options.logger] - Foundation logging service.
   */
  constructor(options = {}) {
    /**
     * Map of processor type to constructor.
     * @type {Map<string, Function>}
     * @private
     */
    this._processors = new Registry({ entityName: 'post-processor' });

    /**
     * Logger service.
     * @type {LoggerService}
     * @private
     */
    const fallback = console;
    if (typeof fallback.debug !== 'function') {
      fallback.debug = fallback.log;
    }
    this._logger = options.logger || fallback;
  }

  /**
   * Maps a unique type identifier to a processor implementation.
   *
   * @param {string} type - Unique processor type identifier (e.g., 'CellUpdate').
   * @param {Function} constructor - Concrete PostProcessor subclass constructor.
   * @returns {PostProcessorRegistry} Current instance for chaining.
   * @throws {Error} If type is not a string or constructor is not a function.
   */
  register(type, constructor) {
    if (!type || typeof type !== 'string') {
      throw new Error('PostProcessorRegistry.register: type must be a non-empty string');
    }
    if (typeof constructor !== 'function') {
      throw new Error('PostProcessorRegistry.register: constructor must be a function');
    }

    this._processors.set(type, constructor);
    this._logger.debug(`[PostProcessorRegistry] Registered processor type: ${type}`);

    return this;
  }

  /**
   * Removes a processor type from the registry.
   *
   * @param {string} type - Type identifier to remove.
   * @returns {boolean} True if the type was found and successfully removed.
   */
  unregister(type) {
    const existed = this._processors.unregister(type);

    if (existed) {
      this._logger.debug(`[PostProcessorRegistry] Unregistered processor type: ${type}`);
    }

    return existed;
  }

  /**
   * @param {string} type - Type identifier to verify.
   * @returns {boolean} True if the processor type is registered.
   */
  has(type) {
    return this._processors.has(type);
  }

  /**
   * @param {string} type - Type identifier to retrieve.
   * @returns {Function|undefined} The registered constructor or undefined.
   */
  get(type) {
    return this._processors.get(type);
  }

  /**
   * Instantiates a post-processor from configuration data and injected services.
   *
   * @param {Object} config - Instance configuration.
   * @param {string} config.processorType - Registered type identifier to instantiate.
   * @param {string} [config.instanceId] - Unique ID for the new instance (generated if absent).
   * @param {Object} [config.config={}] - Processor-specific configuration parameters.
   * @param {Object} [services={}] - Dependency injection container.
   * @returns {PostProcessor} New instance of the requested processor type.
   * @throws {ProcessorNotFoundError} If the requested processorType is not registered.
   */
  create(config, services = {}) {
    if (!config || typeof config !== 'object') {
      throw new Error('PostProcessorRegistry.create: config must be an object');
    }

    const { processorType, instanceId, config: processorConfig = {} } = config;

    if (!processorType) {
      throw new Error('PostProcessorRegistry.create: config.processorType is required');
    }

    if (!this.has(processorType)) {
      throw new ProcessorNotFoundError(processorType, this.getRegisteredTypes());
    }

    const Constructor = this._processors.get(processorType);
    const id = instanceId || `${processorType}-${Date.now()}`;

    this._logger.debug(
      `[PostProcessorRegistry] Creating processor: ${id} (type: ${processorType})`
    );

    return new Constructor(id, processorConfig, services);
  }

  /**
   * Batch-instantiates multiple post-processors from an array of configurations.
   *
   * @param {Object[]} configs - List of processor configuration objects.
   * @param {Object} [services={}] - Dependency injection container for all instances.
   * @returns {PostProcessor[]} Array of initialized processor instances.
   * @throws {Error} If configs is not an array.
   */
  createAll(configs, services = {}) {
    if (!Array.isArray(configs)) {
      throw new Error('PostProcessorRegistry.createAll: configs must be an array');
    }

    return configs.map((config) => this.create(config, services));
  }

  /**
   * @returns {string[]} List of all unique processor type identifiers currently registered.
   */
  getRegisteredTypes() {
    return Array.from(this._processors.keys());
  }

  /**
   * Gets the count of registered processor types.
   *
   * @returns {number} Number of registered types
   */
  get size() {
    return this._processors.size;
  }

  /**
   * Removes all registered types from the registry.
   * @returns {PostProcessorRegistry} Current instance for chaining.
   */
  clear() {
    this._processors.clear();
    this._logger.debug('[PostProcessorRegistry] Cleared all registered types');
    return this;
  }
}
