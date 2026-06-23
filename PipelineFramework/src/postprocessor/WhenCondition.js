/**
 * @file PipelineFramework/src/postprocessor/WhenCondition.js
 * @description Enumeration for post-processor execution conditions.
 * @version 1.0.0
 */

/**
 * @enum {string}
 * @readonly
 * @description Execution triggers for PostProcessors based on step result.
 */
export const WhenCondition = Object.freeze({
  /** Unconditional execution (success/failure). */
  ALWAYS: 'ALWAYS',
  /** Execution restricted to successful step completion. */
  ON_SUCCESS: 'ON_SUCCESS',
  /** Execution restricted to failed step completion. */
  ON_ERROR: 'ON_ERROR',
  /** Execution based on JSEP expression result. */
  CUSTOM: 'CUSTOM'
});

/**
 * @function isValidWhenCondition
 * @description Validates if a string is a recognized WhenCondition.
 * @param {string} value - String to validate.
 * @returns {boolean} True if value exists in WhenCondition.
 */
export function isValidWhenCondition(value) {
  return Object.values(WhenCondition).includes(value);
}
