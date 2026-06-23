/**
 * @file GasExpressionEngineLib/src/ExpressionParserService.js
 * @description Service for parsing dynamic logical expressions using JSEP.
 *              Transforms expression strings into Abstract Syntax Trees (AST)
 *              for data-driven evaluation of complex conditions.
 * @version 2.1.0 - Refactored with Facade/Delegation pattern
 */

import { TokenScanner } from './internal/parser/TokenScanner.js';
import { AstBuilder } from './internal/parser/AstBuilder.js';

/**
 * Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.
 * @class
 */
export class ExpressionParserService {
  /**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
  static get di() {
    return {
      name: 'expressionParserService',
      dependencies: ['logger'],
      isSingleton: true,
      factory: (logger) => new ExpressionParserService(logger)
    };
  }

  /**
   * Initializes the parser with diagnostic logging and internal tokenization components.
   * @param {Object} logger Diagnostic output interface.
   * @throws {Error} If mandatory logger dependency is missing or malformed.
   */
  constructor(logger) {
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

    /**
     * @type {TokenScanner}
     * @private
     */
    this._tokenScanner = new TokenScanner();

    /**
     * @type {AstBuilder}
     * @private
     */
    this._astBuilder = new AstBuilder(this.logger);
  }

  /**
   * Transforms an expression string into a structured JSEP AST, including placeholder preprocessing and security limit enforcement.
   * @param {string} expressionString raw logic template.
   * @returns {Object} Structured AST representation.
   * @throws {Error} If expression is empty, exceeds 10,000 characters, or contains syntax errors.
   */
  parse(expressionString) {
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
    const preprocessed = this._tokenScanner.preprocess(expressionString);
    this.logger.debug(`Preprocessed expression: "${preprocessed}"`);

    // Phase 2: Parse using JSEP via AstBuilder
    return this._astBuilder.buildAst(preprocessed);
  }

  // ===================================================================
  // LEGACY PRIVATE METHODS (Delegated for backward compatibility)
  // ===================================================================

  /**
   * @private
   */
  _configureJSEP() {
    this._astBuilder._configureJSEP();
  }

  /**
   * @private
   */
  _preprocess(expressionString) {
    return this._tokenScanner.preprocess(expressionString);
  }

  /**
   * @private
   */
  _convertNumericPathSegments(expression) {
    return this._tokenScanner._convertNumericPathSegments(expression);
  }

  /**
   * @private
   */
  _convertPlaceholders(expression) {
    return this._tokenScanner._convertPlaceholders(expression);
  }

  /**
   * @private
   */
  _convertBetweenOperator(expression) {
    return this._tokenScanner._convertBetweenOperator(expression);
  }
}
