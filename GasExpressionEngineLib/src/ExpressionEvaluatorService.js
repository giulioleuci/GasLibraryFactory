/**
 * @file GasExpressionEngineLib/src/ExpressionEvaluatorService.js
 * @description Service for evaluating dynamic logical expressions.
 *              Evaluates Abstract Syntax Trees (AST) against a Unified Data Context (UDC)
 *              by delegating placeholder resolution to PlaceholderService.
 * @version 1.0.0
 */

import { RegexUtils, ValidationUtils } from '@CoreUtilsLib';
import { AstNodeEvaluator } from './internal/AstNodeEvaluator.js';
import { EvaluationContextHandler } from './handlers/EvaluationContextHandler.js';
import { OperatorHandler } from './internal/OperatorHandler.js';
import { createBuiltInFunctions } from './internal/builtins/BuiltInFunctions.js';

/**
 * Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.
 * @class
 */
export class ExpressionEvaluatorService {
  /**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
  static get di() {
    return {
      name: 'expressionEvaluatorService',
      dependencies: ['logger', 'expressionParserService', 'placeholderService'],
      isSingleton: true,
      factory: (logger, expressionParserService, placeholderService) =>
        new ExpressionEvaluatorService(logger, expressionParserService, placeholderService)
    };
  }

  /**
   * Initializes the evaluator with required parsing and placeholder resolution services.
   * @param {Object} logger Diagnostic output interface.
   * @param {ExpressionParserService} parserService Logic parser for AST generation.
   * @param {Object} placeholderService Template engine for {{placeholder}} resolution.
   * @throws {Error} If mandatory dependencies are missing or malformed.
   */
  constructor(logger, parserService, placeholderService) {
    // GEL-H004: Use ValidationUtils from CoreUtilsLib for input validation
    ValidationUtils.validateLogger(logger, 'ExpressionEvaluatorService');
    ValidationUtils.validateDependency(
      parserService,
      'parserService',
      'ExpressionEvaluatorService',
      ['parse']
    );

    ValidationUtils.validateDependency(
      placeholderService,
      'placeholderService',
      'ExpressionEvaluatorService',
      ['resolve']
    );

    this.logger = logger;
    this.parser = parserService;
    this.placeholderService = placeholderService;

    // Facade Delegation. Public/internal methods are exposed via explicit
    // delegating methods below rather than dynamic bind-loops, so the surface
    // is statically visible. Rest args preserve each sub-service signature.
    this._astEvaluator = new AstNodeEvaluator(this);
    this._contextHandler = new EvaluationContextHandler(this);
    this._operatorHandler = new OperatorHandler(this);
  }

  // --- Delegated AstNodeEvaluator methods ---

  /** @private */
  _evaluateNode(...args) {
    return this._astEvaluator._evaluateNode(...args);
  }

  /** @private */
  _evaluateIdentifier(...args) {
    return this._astEvaluator._evaluateIdentifier(...args);
  }

  /** @private */
  _evaluateMemberExpression(...args) {
    return this._astEvaluator._evaluateMemberExpression(...args);
  }

  /** @private */
  _buildPathFromMemberExpression(...args) {
    return this._astEvaluator._buildPathFromMemberExpression(...args);
  }

  /** @private */
  _evaluateLiteral(...args) {
    return this._astEvaluator._evaluateLiteral(...args);
  }

  /** @private */
  _evaluateArrayExpression(...args) {
    return this._astEvaluator._evaluateArrayExpression(...args);
  }

  /** @private */
  _evaluateCallExpression(...args) {
    return this._astEvaluator._evaluateCallExpression(...args);
  }

  // --- Delegated EvaluationContextHandler methods ---

  /** @private */
  _areBothNullOrUndefined(...args) {
    return this._contextHandler._areBothNullOrUndefined(...args);
  }

  /** @private */
  _hasCircularReference(...args) {
    return this._contextHandler._hasCircularReference(...args);
  }

  /** @description Evaluates an expression string against a context. */
  evaluate(...args) {
    return this._contextHandler.evaluate(...args);
  }

  /** @description Evaluates a pre-parsed AST against a context. */
  evaluateAst(...args) {
    return this._contextHandler.evaluateAst(...args);
  }

  /** @private */
  _parseValue(...args) {
    return this._contextHandler._parseValue(...args);
  }

  // --- Delegated OperatorHandler methods ---

  /** @private */
  _evaluateLogicalExpression(...args) {
    return this._operatorHandler._evaluateLogicalExpression(...args);
  }

  /** @private */
  _evaluateBinaryExpression(...args) {
    return this._operatorHandler._evaluateBinaryExpression(...args);
  }

  /** @private */
  _evaluateUnaryExpression(...args) {
    return this._operatorHandler._evaluateUnaryExpression(...args);
  }

  /** @private */
  _compare(...args) {
    return this._operatorHandler._compare(...args);
  }

  /** @private */
  _equals(...args) {
    return this._operatorHandler._equals(...args);
  }

  // =============================================================================
  // TYPE CHECKING UTILITIES (GEL-M003: Reduce code duplication)
  // =============================================================================

  // Type checking methods removed - now using CoreUtilsLib TypeUtils
  // _isString, _isNumber, _isBoolean, _isNullOrUndefined -> TypeUtils methods

  /**
   * Checks if both values are null or undefined.
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} True if both values are null or undefined
   * @private
   */
  // =============================================================================
  // BUILT-IN FUNCTIONS (GEL-HIGH-001)
  // =============================================================================

  /**
   * Built-in expression functions (string, numeric, array), assembled from
   * per-family modules under ./internal/builtins/ (GEL-HIGH-001).
   * @returns {Object<string, Function>} Map of function name to implementation.
   * @private
   */
  get _builtInFunctions() {
    return createBuiltInFunctions(this);
  }

  // =============================================================================
  // COMPARISON UTILITIES
  // =============================================================================

  /**
   * Compares two values with STRICT type checking.
   *
   * Returns: -1 if a < b, 0 if a == b, 1 if a > b
   *
   * STRICT MODE BEHAVIOR (enforced for reliability):
   * - Requires both operands to be of the same type
   * - Throws an error if types don't match (except null/undefined)
   * - No implicit type coercion or string conversion
   *
   * The comparison logic handles:
   * - null/undefined values
   * - Numeric comparisons (numbers only)
   * - String comparisons (strings only, case-sensitive)
   * - Boolean comparisons (booleans only)
   * - Date comparisons (dates only)
   *
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {number} Comparison result
   * @throws {Error} If operand types don't match
   * @private
   */
}
