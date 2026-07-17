/**
 * @file PipelineFramework/src/Step.js
 * @description Abstract base class for pipeline steps.
 * @version 1.0.0
 */

import { ContextValidationError } from './internal/errors/ContextValidationError';
import { StepExecutionError } from './internal/errors/StepExecutionError';

/**
 * Abstract foundation for all pipeline steps.
 * Manages context validation, conditional execution, error handling, and performance tracking.
 *
 * @class Step
 * @abstract
 * @typedef {Object} StepOptions
 * @property {string[]} [requiredKeys=[]] - Mandatory context keys for pre-execution validation.
 * @property {boolean} [continueOnError=false] - Whether to proceed with the pipeline if this step fails.
 * @property {Function} [shouldExecuteCondition=null] - Predicate function (context => boolean) for conditional logic.
 *
 * @typedef {Object} StepExecutionResult
 * @property {boolean} success - True if step completed or continueOnError was active.
 * @property {boolean} skipped - True if shouldExecute() returned false.
 * @property {number} durationMs - Total execution time in milliseconds.
 * @property {Error} [error] - Captured error if continueOnError is true.
 *
 * @example
 * class DataFetchStep extends Step {
 *   _executeLogic(context) {
 *     const data = fetch(context.get('id'));
 *     this.setResult(context, 'result', data);
 *   }
 * }
 */
export class Step {
  /**
   * @param {string} name - Unique step identifier.
   * @param {LoggerService} logger - Foundation logging service.
   * @param {StepOptions} [options={}] - Step configuration.
   * @throws {Error} If name is not a non-empty string or logger lacks required methods.
   */
  constructor(name, logger, options = {}) {
    // Validate inputs
    if (!name || typeof name !== 'string') {
      throw new Error('Step: name is required and must be a non-empty string');
    }

    if (!logger || typeof logger !== 'object') {
      throw new Error('Step: logger is required and must be an object');
    }

    if (
      typeof logger.debug !== 'function' ||
      typeof logger.info !== 'function' ||
      typeof logger.warn !== 'function' ||
      typeof logger.error !== 'function'
    ) {
      throw new Error('Step: logger must have debug, info, warn, and error methods');
    }

    if (options !== null && typeof options !== 'object') {
      throw new Error('Step: options must be an object or null');
    }

    /**
     * Step name.
     * @protected
     * @type {string}
     */
    this._name = name;

    /**
     * Logger service.
     * @protected
     * @type {LoggerService}
     */
    this._logger = logger;

    /**
     * Required context keys for validation.
     * @protected
     * @type {string[]}
     */
    this._requiredKeys = options.requiredKeys || [];

    /**
     * Whether to continue pipeline on error.
     * @protected
     * @type {boolean}
     */
    this._continueOnError = options.continueOnError || false;

    /**
     * Custom condition function for conditional execution.
     * @protected
     * @type {Function|null}
     */
    this._shouldExecuteCondition = options.shouldExecuteCondition || null;
  }

  /**
   * @returns {string} Unique step identifier.
   */
  getName() {
    return this._name;
  }

  /**
   * @returns {LoggerService} Active logging instance.
   */
  get logger() {
    return this._logger;
  }

  /**
   * Evaluates if the step should execute based on current context.
   * Prioritizes 'shouldExecuteCondition' from options if present.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {boolean} True if step execution should proceed.
   */
  shouldExecute(context) {
    // Check if custom condition was provided
    if (this._shouldExecuteCondition && typeof this._shouldExecuteCondition === 'function') {
      return this._shouldExecuteCondition(context);
    }

    // Default: always execute
    return true;
  }

  /**
   * Asserts presence of required keys in the context.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @param {string[]} [requiredKeys] - Keys to validate (overrides instance defaults).
   * @throws {ContextValidationError} If any required keys are missing from context.
   * @protected
   */
  verifyContext(context, requiredKeys) {
    const keys = requiredKeys || this._requiredKeys;

    if (!keys || keys.length === 0) {
      return; // No validation needed
    }

    const contextData = context.getData();
    const missingKeys = keys.filter(
      (key) => !Object.prototype.hasOwnProperty.call(contextData, key)
    );

    if (missingKeys.length > 0) {
      throw new ContextValidationError(this._name, missingKeys, contextData);
    }
  }

  /**
   * Writes a value to the pipeline context.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @param {string} key - Target context key.
   * @param {*} value - Data to persist.
   * @returns {Step} Current instance for chaining.
   * @throws {Error} If key is not a string.
   * @protected
   */
  setResult(context, key, value) {
    if (typeof key !== 'string') {
      throw new Error(`Step.setResult (${this._name}): key must be a string`);
    }

    context.set(key, value);
    this._logger.debug(`[${this._name}] Set result: ${key}`);
    return this;
  }

  /**
   * Retrieves a value from the context with an optional fallback.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @param {string} key - Context key to read.
   * @param {*} [defaultValue=null] - Fallback if key is absent.
   * @returns {*} Context value or defaultValue.
   * @protected
   */
  getContextValue(context, key, defaultValue = null) {
    return context.get(key, defaultValue);
  }

  /**
   * Core business logic implementation. Must be implemented by subclasses.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {void}
   * @throws {Error} If not implemented by subclass.
   * @protected
   * @abstract
   */
  _executeLogic(_context) {
    throw new Error(`Step._executeLogic must be implemented by subclass: ${this._name}`);
  }

  /**
   * Orchestrates the step lifecycle: condition check, validation, logic execution, and error handling.
   *
   * @param {PipelineContext} context - Active pipeline execution context.
   * @returns {StepExecutionResult} Performance data and execution status.
   * @throws {StepExecutionError} If logic fails and continueOnError is false.
   */
  execute(context) {
    const startTime = Date.now();

    try {
      // Check if step should execute
      if (!this.shouldExecute(context)) {
        this._logger.info(`[${this._name}] Skipped (condition not met)`);
        return {
          success: true,
          skipped: true,
          durationMs: Date.now() - startTime
        };
      }

      // Validate context before execution
      this.verifyContext(context);

      this._logger.debug(`[${this._name}] Executing...`);

      // Execute the step logic
      this._executeLogic(context);

      const durationMs = Date.now() - startTime;
      this._logger.debug(`[${this._name}] Completed in ${durationMs}ms`);

      return {
        success: true,
        skipped: false,
        durationMs
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;

      // Log the error
      this._logger.error(`[${this._name}] Failed after ${durationMs}ms: ${error.message}`);

      // If continueOnError is true, return success but log the error
      if (this._continueOnError) {
        this._logger.warn(`[${this._name}] Continuing despite error (continueOnError=true)`);
        return {
          success: true,
          skipped: false,
          durationMs,
          error: error
        };
      }

      // Wrap in StepExecutionError if not already
      const stepError =
        error instanceof StepExecutionError
          ? error
          : new StepExecutionError(this._name, error, context.getData());

      throw stepError;
    }
  }
}
