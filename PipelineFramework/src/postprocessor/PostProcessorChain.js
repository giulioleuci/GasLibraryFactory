/**
 * @file PipelineFramework/src/postprocessor/PostProcessorChain.js
 * @description Orchestrates execution of post-processor chains.
 * Facade class that delegates execution logic to internal ChainExecutor.
 * @version 1.1.0 - Refactored with Facade/Delegation pattern
 */

import { PostProcessorContext } from './PostProcessorContext';
import { PostProcessorResult } from './PostProcessorResult';
import { WhenCondition, isValidWhenCondition } from './WhenCondition';
import { ChainExecutor } from '../internal/postprocessor-chain/ChainExecutor';

/**
 * Result of executing a chain of post-processors.
 *
 * @typedef {Object} ChainResult
 * @property {boolean} success - True if all processors succeeded or continueOnError was respected.
 * @property {PostProcessorResult[]} results - Individual processor results.
 * @property {number} totalDuration - Total execution duration in milliseconds.
 * @property {number} executed - Number of processors executed.
 * @property {number} skipped - Number of processors skipped.
 * @property {number} failed - Number of processors that failed.
 * @property {boolean} chainStopped - True if chain was stopped due to error.
 */

/**
 * Orchestrates sequential execution of post-processors after step completion.
 * Manages "when" conditions, error handling strategies, and execution statistics.
 *
 * @class PostProcessorChain
 *
 * @example
 * const chain = new PostProcessorChain({ logger });
 * chain.add(processor, { when: 'ON_SUCCESS' });
 * const result = chain.execute(context);
 */
export class PostProcessorChain {
  /**
   * @param {Object} [options={}] - Chain configuration.
   * @param {LoggerService} [options.logger] - Foundation logging service.
   * @param {ExpressionEngineService} [options.expressionEngine] - Service for CUSTOM condition evaluation.
   */
  constructor(options = {}) {
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

    /**
     * Expression engine for custom condition evaluation.
     * @type {ExpressionEngineService|null}
     * @private
     */
    this._expressionEngine = options.expressionEngine || null;

    /**
     * Chain entries (processor + config).
     * @type {Array<{processor: PostProcessor, config: Object}>}
     * @private
     */
    this._entries = [];

    /**
     * Internal chain executor (Facade/Delegation pattern).
     * @type {ChainExecutor}
     * @private
     */
    this._chainExecutor = new ChainExecutor(this);
  }

  // ===================================================================
  // CHAIN MANAGEMENT (Facade responsibility)
  // ===================================================================

  /**
   * Appends a processor to the execution chain.
   *
   * @param {PostProcessor} processor - Instance with an 'execute' method.
   * @param {Object} [config={}] - Execution behavior configuration.
   * @param {string} [config.when='ALWAYS'] - Execution trigger (ALWAYS, ON_SUCCESS, ON_ERROR, CUSTOM).
   * @param {string} [config.customCondition] - Expression for CUSTOM trigger evaluation.
   * @param {boolean} [config.continueOnError=true] - Whether to proceed if this processor fails.
   * @returns {PostProcessorChain} Current instance for chaining.
   * @throws {Error} If processor is invalid or 'when' condition is unknown.
   */
  add(processor, config = {}) {
    if (!processor || typeof processor.execute !== 'function') {
      throw new Error('PostProcessorChain.add: processor must have an execute method');
    }

    const entry = {
      processor,
      config: {
        when: config.when || WhenCondition.ALWAYS,
        customCondition: config.customCondition || null,
        continueOnError: config.continueOnError !== false
      }
    };

    // Validate when condition
    if (!isValidWhenCondition(entry.config.when)) {
      throw new Error(`PostProcessorChain.add: invalid when condition '${entry.config.when}'`);
    }

    this._entries.push(entry);
    this._logger.debug(
      `[PostProcessorChain] Added processor: ${processor.getId()} (when: ${entry.config.when})`
    );

    return this;
  }

  /**
   * Removes a processor by its unique identifier.
   *
   * @param {string} processorId - ID of the target processor.
   * @returns {boolean} True if a processor was found and removed.
   */
  remove(processorId) {
    const initialLength = this._entries.length;
    this._entries = this._entries.filter((entry) => entry.processor.getId() !== processorId);
    return this._entries.length < initialLength;
  }

  /**
   * Gets the number of processors in the chain.
   *
   * @returns {number} Number of processors
   */
  get length() {
    return this._entries.length;
  }

  /**
   * @returns {boolean} True if the chain contains no processors.
   */
  isEmpty() {
    return this._entries.length === 0;
  }

  /**
   * Removes all processors from the chain.
   * @returns {PostProcessorChain} Current instance for chaining.
   */
  clear() {
    this._entries = [];
    return this;
  }

  // ===================================================================
  // EXECUTION (Delegated to ChainExecutor)
  // ===================================================================

  /**
   * Evaluates if a processor should run based on its when condition.
   *
   * @param {Object} config - Entry configuration
   * @param {PostProcessorContext} context - Execution context
   * @returns {boolean} True if processor should run
   * @private
   */
  _shouldExecute(config, context) {
    return this._chainExecutor.shouldExecute(config, context);
  }

  /**
   * Evaluates a custom condition expression.
   *
   * @param {string} condition - Expression to evaluate
   * @param {PostProcessorContext} context - Execution context
   * @returns {boolean} Result of expression evaluation
   * @private
   */
  _evaluateCustomCondition(condition, context) {
    return this._chainExecutor.evaluateCustomCondition(condition, context);
  }

  /**
   * Triggers sequential execution of all processors in the chain.
   *
   * @param {PostProcessorContext} context - Active post-processing context.
   * @returns {ChainResult} Aggregated execution statistics and results.
   * @throws {Error} If context is not a PostProcessorContext instance.
   */
  execute(context) {
    if (!(context instanceof PostProcessorContext)) {
      throw new Error('PostProcessorChain.execute: context must be a PostProcessorContext');
    }

    return this._chainExecutor.executeChain(this._entries, context);
  }

  // ===================================================================
  // STATIC FACTORY & INTROSPECTION
  // ===================================================================

  /**
   * Factory method for creating PostProcessorContext from step data.
   *
   * @param {Step} step - The executed step instance.
   * @param {StepExecutionResult} stepResult - Outcome of the step execution.
   * @param {PipelineContext} pipelineContext - Active pipeline data context.
   * @param {Object} [metadata={}] - Diagnostic metadata.
   * @returns {PostProcessorContext} Initialized context for processor execution.
   */
  static createContext(step, stepResult, pipelineContext, metadata = {}) {
    return new PostProcessorContext({
      step,
      stepResult,
      pipelineContext,
      metadata
    });
  }

  /**
   * @returns {Object[]} Metadata summary of all configured processors in the chain.
   */
  getSummary() {
    return this._entries.map((entry) => ({
      id: entry.processor.getId(),
      name: entry.processor.getName(),
      when: entry.config.when,
      continueOnError: entry.config.continueOnError
    }));
  }
}
