/**
 * @file GasExpressionEngineLib/src/internal/builtins/BuiltInFunctions.js
 * @description Assembles the full built-in function registry consumed by
 *              ExpressionEvaluatorService from the per-family function modules
 *              (GEL-HIGH-001). Mirrors WorkspaceTemplateEngine's
 *              createBuiltInFilters() module-per-family + assembler pattern.
 * @version 1.0.0
 */

import { createStringFunctions } from './StringFunctions.js';
import { createNumericFunctions } from './NumericFunctions.js';
import { createArrayFunctions } from './ArrayFunctions.js';

/**
 * Builds the complete map of built-in expression functions (string, numeric,
 * array) exposed to expression call-expressions (e.g. `len(x)`, `between(...)`).
 *
 * @param {ExpressionEvaluatorService} evaluator - The evaluator instance, forwarded
 *   to families (e.g. array functions) that need access to sibling methods like `_equals`.
 * @returns {Object<string, Function>} Map of function name to implementation.
 */
export function createBuiltInFunctions(evaluator) {
  return {
    ...createStringFunctions(),
    ...createNumericFunctions(),
    ...createArrayFunctions(evaluator)
  };
}
