/**
 * @file PipelineFramework/src/postprocessor/PostProcessorContext.js
 * @description Context object passed to post-processors during execution.
 * @version 1.0.0
 */

/**
 * Read-only container for step execution data passed to post-processors.
 * Provides access to step results, pipeline state, and performance metrics.
 *
 * @class PostProcessorContext
 *
 * @example
 * const userId = context.getPipelineData('userId');
 * if (context.wasSuccessful()) { ... }
 */
export class PostProcessorContext {
  /**
   * @param {Object} options - Context initialization data.
   * @param {Step} options.step - The executed step instance.
   * @param {StepExecutionResult} options.stepResult - Outcome of the step execution.
   * @param {PipelineContext} options.pipelineContext - Active pipeline data context.
   * @param {Object} [options.metadata={}] - Diagnostic metadata.
   * @throws {Error} If required step, stepResult, or pipelineContext are missing.
   */
  constructor(options = {}) {
    if (!options.step) {
      throw new Error('PostProcessorContext: step is required');
    }
    if (!options.stepResult) {
      throw new Error('PostProcessorContext: stepResult is required');
    }
    if (!options.pipelineContext) {
      throw new Error('PostProcessorContext: pipelineContext is required');
    }

    /**
     * The step that was just executed.
     * @type {Step}
     */
    this.step = options.step;

    /**
     * The step's execution result.
     * @type {StepExecutionResult}
     */
    this.stepResult = options.stepResult;

    /**
     * The shared pipeline context.
     * @type {PipelineContext}
     */
    this.pipelineContext = options.pipelineContext;

    /**
     * Additional metadata.
     * @type {Object}
     */
    this.metadata = options.metadata || {};
  }

  /**
   * Retrieves a value from the step's recorded output.
   *
   * @param {string} key - Target key in the step result output.
   * @param {*} [defaultValue=null] - Fallback if key is absent.
   * @returns {*} Step output value or defaultValue.
   */
  getStepOutput(key, defaultValue = null) {
    if (!this.stepResult.output) {
      return defaultValue;
    }
    return Object.prototype.hasOwnProperty.call(this.stepResult.output, key)
      ? this.stepResult.output[key]
      : defaultValue;
  }

  /**
   * Retrieves data from the pipeline context using dot notation (e.g., 'user.profile.id').
   *
   * @param {string} path - Dot-separated path to the target data.
   * @param {*} [defaultValue=null] - Fallback if path is unreachable.
   * @returns {*} Resolved value or defaultValue.
   */
  getPipelineData(path, defaultValue = null) {
    if (!path || typeof path !== 'string') {
      return defaultValue;
    }

    const parts = path.split('.');
    let current = this.pipelineContext.getData();

    for (const part of parts) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      if (typeof current !== 'object') {
        return defaultValue;
      }
      current = current[part];
    }

    return current !== undefined ? current : defaultValue;
  }

  /**
   * @returns {boolean} True if the step completed without error and was not skipped.
   */
  wasSuccessful() {
    return this.stepResult.success === true && !this.stepResult.skipped;
  }

  /**
   * @returns {boolean} True if the step execution was bypassed due to conditions.
   */
  wasSkipped() {
    return this.stepResult.skipped === true;
  }

  /**
   * @returns {Error|null} Captured exception from step failure, if any.
   */
  getError() {
    return this.stepResult.error || null;
  }

  /**
   * @returns {string} Identifier of the executed step.
   */
  getStepName() {
    return this.step.getName ? this.step.getName() : 'unknown';
  }

  /**
   * @returns {number} Step execution time in milliseconds.
   */
  getDurationMs() {
    return this.stepResult.durationMs || 0;
  }

  /**
   * @param {string} key - Metadata key identifier.
   * @param {*} [defaultValue=null] - Fallback if key is absent.
   * @returns {*} Metadata value or defaultValue.
   */
  getMetadata(key, defaultValue = null) {
    return Object.prototype.hasOwnProperty.call(this.metadata, key)
      ? this.metadata[key]
      : defaultValue;
  }

  /**
   * Flattens context into a unified object for rule/expression evaluation.
   * @returns {Object} Composite context with 'step', 'stepResult', 'pipeline', and 'metadata'.
   */
  toExpressionContext() {
    return {
      step: {
        name: this.getStepName(),
        success: this.wasSuccessful(),
        skipped: this.wasSkipped(),
        durationMs: this.getDurationMs(),
        error: this.getError() ? this.getError().message : null
      },
      stepResult: this.stepResult,
      stepOutput: this.stepResult.output || {},
      pipeline: this.pipelineContext.getData(),
      metadata: this.metadata
    };
  }
}
