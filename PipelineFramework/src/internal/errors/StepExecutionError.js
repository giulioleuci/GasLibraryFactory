/**
 * @file PipelineFramework/src/errors/StepExecutionError.js
 * @description Error thrown when a step execution fails.
 * @version 1.0.0
 */

import { PipelineError } from './PipelineError';

/**
 * Error signaling a failure within a step's execution logic.
 *
 * @class StepExecutionError
 * @extends PipelineError
 *
 * @example
 * throw new StepExecutionError('StepName', originalError, contextData);
 */
export class StepExecutionError extends PipelineError {
  /**
   * @param {string} stepName - Identifier of the step where execution failed.
   * @param {Error} originalError - The root cause exception.
   * @param {Object} context - Raw context data for diagnostic state capture.
   */
  constructor(stepName, originalError, context) {
    super(`Step '${stepName}' failed: ${originalError.message}`, {
      stepName,
      originalError,
      contextState: context ? Object.keys(context) : []
    });
    this.name = 'StepExecutionError';
    this.stepName = stepName;
    this.originalError = originalError;
  }
}
