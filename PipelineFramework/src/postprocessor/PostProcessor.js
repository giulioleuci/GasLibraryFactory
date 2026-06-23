/**
 * @file PipelineFramework/src/postprocessor/PostProcessor.js
 * @description Abstract base class for post-processors.
 * @version 1.0.0
 */

import { PostProcessorResult } from './PostProcessorResult';

/**
 * Abstract foundation for all pipeline post-processors.
 * Post-processors execute after step completion to perform side effects (logging, audits, notifications).
 *
 * @class PostProcessor
 * @abstract
 *
 * @example
 * class AuditLogger extends PostProcessor {
 *   _executeImpl(context) {
 *     const data = context.getStepResult();
 *     return PostProcessorResult.success(this.id).addChange('LOG', 'audit', data);
 *   }
 * }
 */
export class PostProcessor {
  /**
   * @param {string} id - Unique instance identifier.
   * @param {string} name - Human-readable processor name.
   * @param {Object} [config={}] - Processor-specific configuration.
   * @param {Object} [services={}] - Dependency injection container.
   * @param {LoggerService} [services.logger] - Foundation logging service.
   * @throws {Error} If id or name is not a non-empty string.
   */
  constructor(id, name, config = {}, services = {}) {
    if (!id || typeof id !== 'string') {
      throw new Error('PostProcessor: id is required and must be a non-empty string');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('PostProcessor: name is required and must be a non-empty string');
    }

    /**
     * Unique identifier for this processor instance.
     * @type {string}
     */
    this.id = id;

    /**
     * Human-readable name.
     * @type {string}
     */
    this.name = name;

    /**
     * Processor configuration.
     * @type {Object}
     * @protected
     */
    this._config = config;

    /**
     * Logger service.
     * @type {LoggerService}
     * @protected
     */
    this._logger = services.logger || console;

    /**
     * Injected services.
     * @type {Object}
     * @protected
     */
    this._services = services;
  }

  /**
   * @returns {string} Unique instance identifier.
   */
  getId() {
    return this.id;
  }

  /**
   * @returns {string} Human-readable name.
   */
  getName() {
    return this.name;
  }

  /**
   * @returns {Object} Active configuration object.
   */
  getConfig() {
    return this._config;
  }

  /**
   * Evaluates if the processor should execute based on current context.
   *
   * @param {PostProcessorContext} context - Active post-processing context.
   * @returns {boolean} True if execution should proceed.
   */
  shouldRun(_context) {
    return true;
  }

  /**
   * Asserts validity of current configuration. Must be overridden by subclasses.
   *
   * @throws {Error} If configuration is invalid.
   * @protected
   */
  _validateConfig() {
    // Default implementation does nothing
    // Subclasses should override to validate their specific configuration
  }

  /**
   * Core post-processing logic implementation. Must be implemented by subclasses.
   *
   * @param {PostProcessorContext} context - Active post-processing context.
   * @returns {PostProcessorResult} Outcome of the processing operation.
   * @throws {Error} If not implemented by subclass.
   * @protected
   * @abstract
   */
  _executeImpl(_context) {
    throw new Error(`PostProcessor._executeImpl must be implemented by subclass: ${this.name}`);
  }

  /**
   * Orchestrates the post-processor lifecycle: validation, condition check, and execution.
   *
   * @param {PostProcessorContext} context - Active post-processing context.
   * @returns {PostProcessorResult} Execution outcome (never throws).
   */
  execute(context) {
    const startTime = Date.now();

    try {
      // Validate configuration
      this._validateConfig();

      // Check if processor should run
      if (!this.shouldRun(context)) {
        this._logger.debug(`[${this.id}] Skipped (condition not met)`);
        return PostProcessorResult.skipped(this.id);
      }

      this._logger.debug(`[${this.id}] Executing...`);

      // Execute implementation
      const result = this._executeImpl(context);

      // Ensure result has correct duration
      if (result && typeof result.duration === 'number' && result.duration === 0) {
        result.duration = Date.now() - startTime;
      }

      this._logger.debug(`[${this.id}] Completed in ${result?.duration || 0}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this._logger.error(`[${this.id}] Failed after ${duration}ms: ${error.message}`);

      return PostProcessorResult.failure(this.id, error, duration, {
        stepName: context?.getStepName?.() || 'unknown'
      });
    }
  }

  /**
   * @returns {Object} Metadata summary including id, name, and type.
   */
  getConfigSummary() {
    return {
      id: this.id,
      name: this.name,
      type: this.constructor.name
    };
  }
}
