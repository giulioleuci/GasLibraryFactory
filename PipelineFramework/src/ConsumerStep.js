/**
 * @file PipelineFramework/src/ConsumerStep.js
 * @description Consumer Step - Reads context values and performs technical operations
 * @version 1.0.0
 */

import { Step } from './Step';

/**
 * Abstract base for "Action" steps in the Producer-Consumer pipeline pattern.
 * 
 * @description
 * Decouples business logic from technical execution. Reads a specific inputKey set by 
 * a ProducerStep and executes infrastructure operations (API calls, I/O) without 
 * knowledge of decision rules.
 *
 * @class
 * @extends Step
 * @abstract
 */
export class ConsumerStep extends Step {
  /**
   * @param {string} name Unique step identifier.
   * @param {Object} logger Logger instance.
   * @param {Object} options Configuration.
   * @param {string} options.inputKey Required: Context key to read input from.
   * @param {string} [options.outputKey] Optional: Context key to write result to.
   * @param {string[]} [options.requiredKeys] Keys required for validation.
   * @param {boolean} [options.continueOnError=false] Resume pipeline on failure.
   * @throws {Error} If options.inputKey is missing or not a string.
   */
  constructor(name, logger, options = {}) {
    if (!options.inputKey || typeof options.inputKey !== 'string') {
      throw new Error('ConsumerStep: options.inputKey is required and must be a non-empty string');
    }

    super(name, logger, options);

    /**
     * @protected
     * @type {string}
     */
    this._inputKey = options.inputKey;

    /**
     * @protected
     * @type {string|null}
     */
    this._outputKey = options.outputKey || null;
  }

  /** @returns {string} Context key read during execution. */
  get inputKey() {
    return this._inputKey;
  }

  /** @returns {string|null} Context key written during execution. */
  get outputKey() {
    return this._outputKey;
  }

  /**
   * Template method for implementing technical operations.
   * @param {*} inputValue Value retrieved from context[inputKey].
   * @param {PipelineContext} context Full execution context for supplemental reads.
   * @returns {*} Optional result to be stored in context[outputKey].
   * @throws {Error} Must be implemented by subclass.
   * @example
   * performAction(docId, context) {
   *   return this.driveService.getFileById(docId).getName();
   * }
   */
  performAction(_inputValue, _context) {
    throw new Error(`ConsumerStep.performAction must be implemented by subclass: ${this._name}`);
  }

  /**
   * Internal execution orchestration.
   * @description
   * 1. Resolves input from context.
   * 2. Delegates to performAction.
   * 3. Persists result if outputKey is defined.
   * @param {PipelineContext} context Target context.
   * @throws {Error} If input value is null or undefined.
   * @final
   */
  _executeLogic(context) {
    // Read input value from context
    const inputValue = context.get(this._inputKey);

    this._logger.debug(
      `[${this._name}] Reading input from '${this._inputKey}': ${inputValue} (type: ${typeof inputValue})`
    );

    // Validate that input value exists
    if (inputValue === null || inputValue === undefined) {
      throw new Error(
        `ConsumerStep (${this._name}): Input value '${this._inputKey}' is null or undefined. ` +
          `Ensure a ProducerStep has written this value to the context.`
      );
    }

    this._logger.info(`[${this._name}] Performing action with input: ${inputValue}`);

    // Perform the action (implemented by subclass)
    const result = this.performAction(inputValue, context);

    // Optionally write result to context
    if (this._outputKey) {
      this.setResult(context, this._outputKey, result);
      this._logger.info(
        `[${this._name}] Action completed: ${this._outputKey} = ${JSON.stringify(result)}`
      );
    } else {
      this._logger.info(`[${this._name}] Action completed successfully`);
    }
  }
}
