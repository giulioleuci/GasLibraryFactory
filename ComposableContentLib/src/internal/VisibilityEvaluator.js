/**
 * @file ComposableContentLib/src/composition/VisibilityEvaluator.js
 * @description Evaluates visibility conditions for content blocks.
 * @version 1.0.0
 */

/**
 * @description Engine for resolving block visibility conditions against a data context.
 * Supports static rules ('always', 'never'), simple path truthiness, and complex expression evaluation.
 * @class
 * @example
 * const evaluator = new VisibilityEvaluator(expressionEngine);
 * const visible = evaluator.isVisible('{{user.isPremium}} == true', context);
 */
export class VisibilityEvaluator {
  /**
   * @description Initializes the evaluator with an optional expression engine for complex logic.
   * @param {Object|null} [expressionEngine=null] External engine for parsing complex condition strings.
   */
  constructor(expressionEngine = null) {
    /**
     * Expression engine for complex conditions.
     * @type {Object|null}
     * @private
     */
    this._expressionEngine = expressionEngine;
  }

  /**
   * @description Determines block visibility based on a condition string and the current context.
   * Resolves static values first, then delegates to the expression engine or falls back to simple path evaluation.
   * @param {string} visibility Raw condition expression or keyword.
   * @param {BlockDataContext} context Data payload for evaluation.
   * @returns {boolean} True if the block should be rendered.
   */
  isVisible(visibility, context) {
    // Handle null/undefined
    if (visibility == null) {
      return true;
    }

    // Normalize
    const condition = String(visibility).trim().toLowerCase();

    // Simple conditions
    if (condition === '' || condition === 'always' || condition === 'true') {
      return true;
    }

    if (condition === 'never' || condition === 'false') {
      return false;
    }

    // Context-based conditions (requires expression engine)
    if (this._expressionEngine) {
      return this._evaluateExpression(visibility, context);
    }

    // Try to evaluate as simple path check
    return this._evaluateSimpleCondition(visibility, context);
  }

  /**
   * @description Delegates condition evaluation to the injected expression engine.
   * @param {string} expression Complex logic string.
   * @param {BlockDataContext} context Target data context.
   * @returns {boolean} Evaluated result, defaulting to false on error.
   * @private
   */
  _evaluateExpression(expression, context) {
    try {
      const contextData = context.toObject ? context.toObject() : context;
      const result = this._expressionEngine.evaluate(expression, contextData);
      return Boolean(result);
    } catch (_error) {
      // Expression evaluation errors default to hidden
      return false;
    }
  }

  /**
   * @description Evaluates simple property paths or negations (e.g., 'user.name', '!user.isGuest') using strict truthiness.
   * @param {string} condition Simple path condition.
   * @param {BlockDataContext} context Target data context.
   * @returns {boolean} Evaluated result.
   * @private
   */
  _evaluateSimpleCondition(condition, context) {
    const trimmed = condition.trim();

    // Check for negation
    const isNegated = trimmed.startsWith('!');
    const path = isNegated ? trimmed.slice(1).trim() : trimmed;

    // Get value from context
    const value = context.get ? context.get(path) : this._getByPath(context, path);

    // Apply truthiness
    const isTruthy = this._isTruthy(value);

    return isNegated ? !isTruthy : isTruthy;
  }

  /**
   * @description Recursively resolves a dot-notation path against an object structure.
   * @param {Object} obj Source object.
   * @param {string} path Dot-separated property path.
   * @returns {*} Resolved value or undefined.
   * @private
   */
  _getByPath(obj, path) {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current == null) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * @description Applies strict business-logic truthiness to a value.
   * Evaluates empty strings, arrays, and objects as falsy.
   * @param {*} value Value to evaluate.
   * @returns {boolean} Truthy state.
   * @private
   */
  _isTruthy(value) {
    if (value == null) {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0 && !isNaN(value);
    }

    if (typeof value === 'string') {
      return value.length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }

    return Boolean(value);
  }

  /**
   * @description Verifies if an external expression engine is bound to this evaluator.
   * @returns {boolean} True if available.
   */
  hasExpressionEngine() {
    return this._expressionEngine !== null;
  }

  /**
   * @description Returns a diagnostic summary including the active evaluation mode.
   * @returns {string} Debug string representation.
   */
  toString() {
    const mode = this._expressionEngine ? 'expression' : 'simple';
    return `VisibilityEvaluator[${mode}]`;
  }
}
