import type { ExpressionLogger } from './types.js';
/**
 * @file GasExpressionEngineLib/src/ExpressionParserService.js
 * @description Service for parsing dynamic logical expressions using JSEP.
 *              Transforms expression strings into Abstract Syntax Trees (AST)
 *              for data-driven evaluation of complex conditions.
 * @version 2.1.0 - Refactored with Facade/Delegation pattern
 */

import jsep from 'jsep';
import { assertAllowedExpressionAst, defaultPolicy } from './internal/ExpressionPolicy.js';

/**
 * Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.
 * @class
 */
export class ExpressionParserService {
  declare logger: Pick<ExpressionLogger, 'debug' | 'error'>;
  declare MAX_INPUT_LENGTH: number;

  /**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
  static get di() {
    return {
      name: 'expressionParserService',
      dependencies: ['logger'],
      isSingleton: true,
      factory: (logger: ExpressionLogger) => new ExpressionParserService(logger)
    };
  }

  /**
   * Initializes the parser with diagnostic logging and internal tokenization components.
   * @param {Object} logger Diagnostic output interface.
   * @throws {Error} If mandatory logger dependency is missing or malformed.
   */
  constructor(logger: Pick<ExpressionLogger, 'debug' | 'error'>) {
    if (!logger || typeof logger !== 'object') {
      throw new Error('ExpressionParserService: logger is required and must be an object');
    }
    if (typeof logger.debug !== 'function') {
      throw new Error('ExpressionParserService: logger.debug must be a function');
    }
    if (typeof logger.error !== 'function') {
      throw new Error('ExpressionParserService: logger.error must be a function');
    }

    this.logger = logger;
    // SEC-004: Maximum input length to prevent resource exhaustion
    this.MAX_INPUT_LENGTH = 10000;

    this._configureJSEP();
  }

  /**
   * Transforms an expression string into a structured JSEP AST, including placeholder preprocessing and security limit enforcement.
   * @param {string} expressionString raw logic template.
   * @returns {Object} Structured AST representation.
   * @throws {Error} If expression is empty, exceeds 10,000 characters, or contains syntax errors.
   */
  parse(expressionString: string): jsep.Expression {
    if (!expressionString || typeof expressionString !== 'string') {
      throw new Error('Invalid expression: must be a non-empty string');
    }

    // Validate input length to prevent resource exhaustion
    if (expressionString.length > this.MAX_INPUT_LENGTH) {
      throw new Error(
        `Expression too long (max ${this.MAX_INPUT_LENGTH} characters): ${expressionString.length} characters`
      );
    }

    this.logger.debug(`Parsing expression: "${expressionString}"`);

    // Phase 1: Preprocess the expression
    const preprocessed = this._preprocess(expressionString);
    this.logger.debug(`Preprocessed expression: "${preprocessed}"`);

    // Phase 2: Parse using JSEP and accept only the AST shape the evaluator
    // supports. This is validation only; nothing is evaluated.
    const ast = this._buildAst(preprocessed);
    assertAllowedExpressionAst(ast, defaultPolicy);
    return ast;
  }

  // =============================================================================
  // TOKEN PREPROCESSING (formerly TokenScanner)
  // =============================================================================

  /**
   * Orchestrates the normalization of expression syntax, converting {{placeholders}}, numeric paths, and special operators into JSEP-compatible tokens.
   * @param {string} expressionString raw logic template.
   * @returns {string} preprocessed expression string.
   * @private
   */
  _preprocess(expressionString: string) {
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
  _convertNumericPathSegments(expression: string) {
    return expression.replace(/(?<=[a-zA-Z_\]])\.\s*(\d+)/g, '[$1]');
  }

  /**
   * Strips Mustache-style {{ }} delimiters from identifiers, iteratively resolving nested occurrences.
   * @private
   * @param {string} expression Logic template fragment.
   * @returns {string} Delimiter-free identifiers.
   */
  _convertPlaceholders(expression: string) {
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
  _convertBetweenOperator(expression: string) {
    const betweenPattern =
      /\b(\S+(?:\s*\([^)]*\))?)\s+between\s+(\S+(?:\s*\([^)]*\))?)\s*,\s*(\S+(?:\s*\([^)]*\))?)\b/gi;

    return expression.replace(betweenPattern, (match, value, min, max) => {
      return `between(${value}, ${min}, ${max})`;
    });
  }

  // =============================================================================
  // AST BUILDING (formerly AstBuilder)
  // =============================================================================

  /**
   * Extends JSEP grammar with domain-specific binary operators (in, match).
   * @private
   */
  _configureJSEP() {
    // Add 'in' operator
    jsep.addBinaryOp('in', 6);

    // Add 'match' operator
    jsep.addBinaryOp('match', 6);

    this.logger.debug('JSEP configured with custom operators: in, match');
  }

  /**
   * Generates a structured Abstract Syntax Tree from a normalized expression string using JSEP.
   * @param {string} preprocessedExpression Normalized logic template.
   * @returns {Object} Structured JSEP AST.
   * @throws {Error} If the expression violates JSEP grammar rules.
   * @private
   */
  _buildAst(preprocessedExpression: string): jsep.Expression {
    try {
      const ast = jsep(preprocessedExpression);
      this.logger.debug(`AST generated successfully`);
      return ast;
    } catch (error) {
      throw new Error(`Failed to parse expression: ${(error as Error).message}`);
    }
  }
}
