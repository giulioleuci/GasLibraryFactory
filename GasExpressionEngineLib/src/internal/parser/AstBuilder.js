/**
 * @file GasExpressionEngineLib/src/parser/internal/AstBuilder.js
 * @description Internal module for building Abstract Syntax Trees from
 * expression strings using JSEP.
 * @version 1.0.0
 */

import jsep from 'jsep';

export class AstBuilder {
  /**
   * Initializes the builder and applies JSEP custom operator configurations.
   * @param {Object} logger Diagnostic output interface.
   */
  constructor(logger) {
    this._logger = logger;
    this._configureJSEP();
  }

  /**
   * Extends JSEP grammar with domain-specific binary operators (in, match).
   * @private
   */
  _configureJSEP() {
    // Add 'in' operator
    jsep.addBinaryOp('in', 6);

    // Add 'match' operator
    jsep.addBinaryOp('match', 6);

    this._logger.debug('JSEP configured with custom operators: in, match');
  }

  /**
   * Generates a structured Abstract Syntax Tree from a normalized expression string using JSEP.
   * @param {string} preprocessedExpression Normalized logic template.
   * @returns {Object} Structured JSEP AST.
   * @throws {Error} If the expression violates JSEP grammar rules.
   */
  buildAst(preprocessedExpression) {
    try {
      const ast = jsep(preprocessedExpression);
      this._logger.debug(`AST generated successfully`);
      return ast;
    } catch (error) {
      throw new Error(`Failed to parse expression: ${error.message}`);
    }
  }
}
