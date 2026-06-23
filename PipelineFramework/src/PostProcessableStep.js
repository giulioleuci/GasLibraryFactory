/**
 * @file PipelineFramework/src/PostProcessableStep.js
 * @description Step subclass with integrated post-processor support.
 * @version 1.0.0
 */

import { Step } from './Step';
import { PostProcessorChain } from './postprocessor/PostProcessorChain';
import { PostProcessorContext } from './postprocessor/PostProcessorContext';
import { PostProcessorRegistry } from './postprocessor/PostProcessorRegistry';

/**
 * Step extension with automated post-processor lifecycle integration.
 * 
 * @description
 * Enhances base Step logic with an optional PostProcessorChain. Automatically instantiates 
 * and executes processors based on step outcome (success/failure) using injected services 
 * (SheetDB, ExpressionEngine).
 *
 * @class
 * @extends Step
 */
export class PostProcessableStep extends Step {
  /**
   * @param {string} name Unique step identifier.
   * @param {Object} logger Logger instance.
   * @param {Object} [options={}] Step configuration.
   * @param {Object} [services={}] Injected dependencies for processors.
   * @param {Object} [services.database] SheetDB provider.
   * @param {Object} [services.expressionEngine] Formula evaluator.
   * @param {PostProcessorRegistry} [services.processorRegistry] Processor factory.
   */
  constructor(name, logger, options = {}, services = {}) {
    super(name, logger, options);
    this._services = services || {};
    this._processorChain = null;
    this._lastPostProcessorResults = null;
  }

  /**
   * Template method for declaring post-execution automation.
   * @returns {Array<{processorType: string, instanceId: string, when: string, config: Object}>}
   * @example
   * getPostProcessors() {
   *   return [{ processorType: 'CellUpdate', when: 'ON_SUCCESS', config: { table: 'LOGS' } }];
   * }
   */
  getPostProcessors() {
    return [];
  }

  /**
   * Translates configurations into executable instances via registry.
   * @protected
   * @returns {PostProcessorChain|null}
   */
  _buildPostProcessorChain() {
    const configs = this.getPostProcessors();
    if (!Array.isArray(configs) || configs.length === 0) {
      return null;
    }

    const registry = this._services.processorRegistry;
    if (!registry || typeof registry.create !== 'function') {
      return null;
    }

    const chain = new PostProcessorChain({
      logger: this._logger,
      expressionEngine: this._services.expressionEngine
    });

    for (const config of configs) {
      try {
        const processor = registry.create(config, this._services);
        chain.add(processor, { when: config.when });
      } catch (e) {
        this._logger.error(`[${this._name}] Failed to build post-processor: ${e.message}`);
      }
    }

    return chain;
  }

  /**
   * Retrieves or initializes the memoized processor sequence.
   * @protected
   * @returns {PostProcessorChain|null}
   */
  _getPostProcessorChain() {
    if (this._processorChain === null) {
      this._processorChain = this._buildPostProcessorChain();
    }
    return this._processorChain;
  }

  /**
   * Orchestrates post-processor execution context and results capture.
   * @protected
   * @param {Object} stepResult Primary execution outcome.
   * @param {PipelineContext} pipelineContext Current shared state.
   * @returns {Object|null} Chain execution telemetry.
   */
  _executePostProcessors(stepResult, pipelineContext) {
    const chain = this._getPostProcessorChain();
    if (!chain) return null;

    const ppContext = new PostProcessorContext({
      stepName: this._name,
      stepResult,
      pipelineContext,
      services: this._services
    });

    try {
      this._lastPostProcessorResults = chain.execute(ppContext);
    } catch (e) {
      this._logger.error(`[${this._name}] Post-processor chain threw: ${e.message}`);
      this._lastPostProcessorResults = { success: false, chainStopped: true, error: e.message };
    }
    return this._lastPostProcessorResults;
  }

  /** @returns {Object|null} Telemetry from the most recent run. */
  getLastPostProcessorResults() {
    return this._lastPostProcessorResults;
  }

  /**
   * Overrides base execution to include post-processor lifecycle.
   * @param {PipelineContext} context Shared state payload.
   * @returns {Object} Augmented result containing .postProcessors telemetry.
   */
  execute(context) {
    // Execute the base step logic
    const stepResult = super.execute(context);

    // Run post-processors (regardless of step success/failure)
    // Post-processors decide via their "when" condition if they should run
    const postProcessorResults = this._executePostProcessors(stepResult, context);

    // Augment step result with post-processor results
    if (postProcessorResults) {
      stepResult.postProcessors = postProcessorResults;

      // If post-processors had critical failures (chain stopped), log it
      if (postProcessorResults.chainStopped) {
        this._logger.error(`[${this._name}] Post-processor chain was stopped due to failure`);
      }
    }

    return stepResult;
  }
}
