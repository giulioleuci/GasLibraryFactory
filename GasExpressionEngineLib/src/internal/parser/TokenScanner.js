/**
 * @file GasExpressionEngineLib/src/parser/internal/TokenScanner.js
 * @description Internal module for preprocessing and tokenizing expression strings
 * before parsing by JSEP.
 * @version 1.0.0
 */

export class TokenScanner {
  /**
   * Orchestrates the normalization of expression syntax, converting {{placeholders}}, numeric paths, and special operators into JSEP-compatible tokens.
   * @param {string} expressionString raw logic template.
   * @returns {string} preprocessed expression string.
   */
  preprocess(expressionString) {
    let result = expressionString;

    // Step 1: Convert placeholders {{...}} to plain identifiers
    result = this._convertPlaceholders(result);

    // Step 2: Convert numeric path segments (e.g. items.0.value → items[0].value)
    result = this._convertNumericPathSegments(result);

    // Step 3: Convert 'between' operator to function call
    result = this._convertBetweenOperator(result);

    return result;
  }

  /**
   * Transforms dot-notation numeric segments into bracketed array accessors (e.g., 'items.0' -> 'items[0]').
   * @private
   * @param {string} expression Logic template fragment.
   * @returns {string} Normalized fragment.
   */
  _convertNumericPathSegments(expression) {
    return expression.replace(/(?<=[a-zA-Z_\]])\.\s*(\d+)/g, '[$1]');
  }

  /**
   * Strips Mustache-style {{ }} delimiters from identifiers, iteratively resolving nested occurrences.
   * @private
   * @param {string} expression Logic template fragment.
   * @returns {string} Delimiter-free identifiers.
   */
  _convertPlaceholders(expression) {
    let result = expression;
    let hasChanges = true;

    while (hasChanges) {
      const before = result;

      // Match {{...}} where ... doesn't contain {{ or }}
      result = result.replace(/\{\{([^{}]+)\}\}/g, (match, content) => {
        return content.trim();
      });

      hasChanges = result !== before;
    }

    return result;
  }

  /**
   * Rewrites 'between' keyword syntax into functional call notation (e.g., 'x between y, z' -> 'between(x, y, z)').
   * @private
   * @param {string} expression Logic template fragment.
   * @returns {string} Normalized functional logic.
   */
  _convertBetweenOperator(expression) {
    const betweenPattern =
      /\b(\S+(?:\s*\([^)]*\))?)\s+between\s+(\S+(?:\s*\([^)]*\))?)\s*,\s*(\S+(?:\s*\([^)]*\))?)\b/gi;

    return expression.replace(betweenPattern, (match, value, min, max) => {
      return `between(${value}, ${min}, ${max})`;
    });
  }
}
