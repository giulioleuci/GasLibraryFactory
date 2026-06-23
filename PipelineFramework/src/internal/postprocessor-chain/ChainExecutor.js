/**
 * @file PipelineFramework/src/postprocessor/internal/ChainExecutor.js
 * @description Handles sequential execution of post-processor chains,
 * including when-condition evaluation and error handling.
 * @version 1.0.0
 */

import { PostProcessorResult } from '../../postprocessor/PostProcessorResult';
import { WhenCondition } from '../../postprocessor/WhenCondition';

/**
 * @class ChainExecutor
 * @description Internal engine for sequential, synchronous execution of PostProcessorChain entries.
 */
export class ChainExecutor {
  /**
   * @constructor
   * @param {PostProcessorChain} facade - Parent chain instance.
   */
  constructor(facade) {
    this._facade = facade;
  }

  /**
   * @returns {Object} Logger from facade
   * @private
   */
  get _logger() {
    return this._facade._logger;
  }

  /**
   * @returns {Object|null} Expression engine from facade
   * @private
   */
  get _expressionEngine() {
    return this._facade._expressionEngine;
  }

  /**
   * @function shouldExecute
   * @description Evaluates 'when' conditions (ALWAYS, SUCCESS, ERROR, CUSTOM).
   * @param {Object} config - Entry config.
   * @param {PostProcessorContext} context - Step context.
   * @returns {boolean} True if execution should proceed.
   */
  shouldExecute(config, context) {
    switch (config.when) {
      case WhenCondition.ALWAYS:
        return true;

      case WhenCondition.ON_SUCCESS:
        return context.wasSuccessful();

      case WhenCondition.ON_ERROR:
        return !context.wasSuccessful() && !context.wasSkipped();

      case WhenCondition.CUSTOM:
        return this.evaluateCustomCondition(config.customCondition, context);

      default:
        this._logger.warn(
          `[PostProcessorChain] Unknown when condition: ${config.when}, defaulting to ALWAYS`
        );
        return true;
    }
  }

  /**
   * @function evaluateCustomCondition
   * @description Resolves JSEP expression against context data.
   * @param {string} condition - Expression string.
   * @param {PostProcessorContext} context - Step context.
   * @returns {boolean} False on evaluation failure or missing engine.
   */
  evaluateCustomCondition(condition, context) {
    if (!condition) {
      this._logger.warn(
        '[PostProcessorChain] CUSTOM condition specified but no expression provided'
      );
      return false;
    }

    if (!this._expressionEngine) {
      this._logger.warn(
        '[PostProcessorChain] CUSTOM condition requires expressionEngine but none provided'
      );
      return false;
    }

    try {
      const expressionContext = context.toExpressionContext();
      const result = this._expressionEngine.evaluate(condition, expressionContext);
      return Boolean(result);
    } catch (error) {
      this._logger.error(
        `[PostProcessorChain] Failed to evaluate custom condition: ${error.message}`
      );
      return false;
    }
  }

  /**
   * @function executeChain
   * @description Iterates and triggers processors with fail-fast or continue-on-error logic.
   * @param {Array<{processor: PostProcessor, config: Object}>} entries - Ordered list of processors.
   * @param {PostProcessorContext} context - Step context.
   * @returns {Object} Statistics (success, results, duration, executed, skipped, failed).
   */
  executeChain(entries, context) {
    const startTime = Date.now();
    const results = [];
    let chainStopped = false;
    let executed = 0;
    let skipped = 0;
    let failed = 0;

    this._logger.debug(`[PostProcessorChain] Executing ${entries.length} processors`);

    for (const entry of entries) {
      const { processor, config } = entry;
      const processorId = processor.getId();

      // Check chain stop condition
      if (chainStopped) {
        this._logger.debug(`[PostProcessorChain] Chain stopped, skipping: ${processorId}`);
        results.push(PostProcessorResult.skipped(processorId, 'Chain stopped'));
        skipped++;
        continue;
      }

      // Check when condition
      if (!this.shouldExecute(config, context)) {
        this._logger.debug(
          `[PostProcessorChain] Condition not met (${config.when}), skipping: ${processorId}`
        );
        results.push(PostProcessorResult.skipped(processorId, `Condition ${config.when} not met`));
        skipped++;
        continue;
      }

      // Execute processor
      const result = processor.execute(context);
      results.push(result);

      if (result.wasSkipped()) {
        skipped++;
      } else if (result.success) {
        executed++;
      } else {
        executed++;
        failed++;

        // Handle failure
        if (!config.continueOnError) {
          this._logger.error(`[PostProcessorChain] Stopping chain due to failure: ${processorId}`);
          chainStopped = true;
        } else {
          this._logger.warn(
            `[PostProcessorChain] Continuing despite failure (continueOnError=true): ${processorId}`
          );
        }
      }
    }

    const totalDuration = Date.now() - startTime;

    this._logger.debug(
      `[PostProcessorChain] Completed: executed=${executed}, skipped=${skipped}, failed=${failed}, duration=${totalDuration}ms`
    );

    return {
      success: failed === 0 || !chainStopped,
      results,
      totalDuration,
      executed,
      skipped,
      failed,
      chainStopped
    };
  }
}
