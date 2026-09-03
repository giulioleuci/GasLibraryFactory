/**
 * @file GasExpressionEngineLib/src/ExpressionEvaluatorService.js
 * @description Service for evaluating dynamic logical expressions.
 *              Evaluates Abstract Syntax Trees (AST) against a Unified Data Context (UDC)
 *              by delegating placeholder resolution to PlaceholderService.
 * @version 1.0.0
 */

import { ValidationUtils, RegexUtils } from '@CoreUtilsLib';
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
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /** @description Evaluates an expression string against a context. */
  evaluate(expressionString, context = {}) {
    if (!expressionString || typeof expressionString !== 'string') {
      throw new Error('Invalid expression: must be a non-empty string');
    }
    if (this._hasCircularReference(context)) {
      throw new Error('Context contains circular references which cannot be safely evaluated');
    }

    this.logger.debug(`Evaluating expression: "${expressionString}"`);

    try {
      const ast = this.parser.parse(expressionString);
      return this.evaluateAst(ast, context);
    } catch (error) {
      this.logger.error(`Error evaluating expression: ${error.message}`);
      throw error;
    }
  }

  /** @description Evaluates a pre-parsed AST against a context. */
  evaluateAst(ast, context = {}) {
    if (!ast || typeof ast !== 'object') {
      throw new Error('Invalid AST: must be a non-null object');
    }
    if (!ast.type || typeof ast.type !== 'string') {
      throw new Error('Invalid AST: must have a type property');
    }
    if (context !== null && typeof context !== 'object') {
      throw new Error('Invalid context: must be an object or null');
    }

    try {
      const result = this._evaluateNode(ast, context);
      if (typeof result !== 'boolean') {
        this.logger.warn(`Expression does not return a boolean -> ${result}`);
        return Boolean(result);
      }
      this.logger.debug(`Evaluation result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Error evaluating AST: ${error.message}`);
      throw error;
    }
  }

  // =============================================================================
  // AST NODE EVALUATION
  // =============================================================================

  /** @private */
  _evaluateNode(node, context) {
    if (!node || typeof node !== 'object' || !node.type) {
      throw new Error('Invalid AST node');
    }

    switch (node.type) {
      case 'Identifier':
        return this._evaluateIdentifier(node, context);
      case 'MemberExpression':
        return this._evaluateMemberExpression(node, context);
      case 'Literal':
        return this._evaluateLiteral(node, context);
      case 'BinaryExpression':
        return this._evaluateBinaryExpression(node, context);
      case 'UnaryExpression':
        return this._evaluateUnaryExpression(node, context);
      case 'CallExpression':
        return this._evaluateCallExpression(node, context);
      case 'ArrayExpression':
        return this._evaluateArrayExpression(node, context);
      default:
        throw new Error(`Unsupported AST node type: ${node.type}`);
    }
  }

  /** @private */
  _evaluateIdentifier(node, context) {
    const identifierName = node.name;
    const placeholderString = `{{${identifierName}}}`;

    try {
      const result = this.placeholderService.processString(placeholderString, context);
      if (result === placeholderString) {
        this.logger.warn(`Unresolved identifier: ${identifierName}`);
        return undefined;
      }
      return this._parseValue(result);
    } catch (error) {
      this.logger.error(`Error resolving identifier ${identifierName}: ${error.message}`);
      throw new Error(`Failed to resolve identifier ${identifierName}: ${error.message}`);
    }
  }

  /** @private */
  _evaluateMemberExpression(node, context) {
    const path = this._buildPathFromMemberExpression(node);
    const placeholderString = `{{${path}}}`;

    try {
      const result = this.placeholderService.processString(placeholderString, context);
      if (result === placeholderString) {
        this.logger.warn(`Unresolved member expression: ${path}`);
        return undefined;
      }
      return this._parseValue(result);
    } catch (error) {
      this.logger.error(`Error resolving member expression ${path}: ${error.message}`);
      throw new Error(`Failed to resolve member expression ${path}: ${error.message}`);
    }
  }

  /** @private */
  _buildPathFromMemberExpression(node) {
    if (node.type === 'Identifier') {
      return node.name;
    }
    if (node.type === 'MemberExpression') {
      const objectPath = this._buildPathFromMemberExpression(node.object);
      const propertyName = node.computed
        ? this._evaluateNode(node.property, {})
        : node.property.name;
      return `${objectPath}.${propertyName}`;
    }
    throw new Error(`Unexpected node type in member expression: ${node.type}`);
  }

  /** @private */
  _evaluateLiteral(node, _context) {
    return node.value;
  }

  /** @private */
  _evaluateArrayExpression(node, context) {
    return node.elements.map((elem) => this._evaluateNode(elem, context));
  }

  /** @private */
  _evaluateCallExpression(node, context) {
    const funcName = node.callee.name || node.callee.value;
    const args = node.arguments.map((arg) => this._evaluateNode(arg, context));

    const func = this._builtInFunctions[funcName];
    if (!func) {
      throw new Error(`Unknown function: ${funcName}`);
    }

    try {
      return func.apply(this, args);
    } catch (error) {
      throw new Error(`Error in function ${funcName}(): ${error.message}`);
    }
  }

  // =============================================================================
  // EVALUATION CONTEXT UTILITIES
  // =============================================================================

  /**
   * Checks if both values are null or undefined.
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} True if both values are null or undefined
   * @private
   */
  _areBothNullOrUndefined(a, b) {
    return a == null && b == null;
  }

  /** @private */
  _hasCircularReference(obj, seen = new Set()) {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }
    if (seen.has(obj)) {
      return true;
    }
    seen.add(obj);
    try {
      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (this._hasCircularReference(item, seen)) {
            return true;
          }
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (this._hasCircularReference(obj[key], seen)) {
              return true;
            }
          }
        }
      }
    } catch (e) {
      this.logger.warn(`Error checking circular reference: ${e.message}`);
      return false;
    }
    seen.delete(obj);
    return false;
  }

  /** @private */
  _parseValue(value) {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      if (!isNaN(num)) {
        return num;
      }
    }
    if (trimmed.toLowerCase() === 'true') {
      return true;
    }
    if (trimmed.toLowerCase() === 'false') {
      return false;
    }
    if (trimmed.toLowerCase() === 'null') {
      return null;
    }
    return value;
  }

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
  // OPERATORS
  // =============================================================================

  /** @private */
  _evaluateBinaryExpression(node, context) {
    const operator = node.operator;

    if (operator === '&&') {
      const left = this._evaluateNode(node.left, context);
      if (!left) {
        return false;
      }
      return Boolean(this._evaluateNode(node.right, context));
    }

    if (operator === '||') {
      const left = this._evaluateNode(node.left, context);
      if (left) {
        return true;
      }
      return Boolean(this._evaluateNode(node.right, context));
    }

    const left = this._evaluateNode(node.left, context);
    const right = this._evaluateNode(node.right, context);

    switch (operator) {
      case '==':
        return this._equals(left, right);
      case '!=':
        return !this._equals(left, right);
      case '>':
        return this._compare(left, right) > 0;
      case '<':
        return this._compare(left, right) < 0;
      case '>=':
        return this._compare(left, right) >= 0;
      case '<=':
        return this._compare(left, right) <= 0;
      case 'in':
        if (!Array.isArray(right)) {
          throw new Error(
            `"in" operator requires an array on the right side, received: ${typeof right}`
          );
        }
        if (right.length === 0) {
          return false;
        }
        return right.some((elem) => this._equals(left, elem));
      case 'match':
        if (typeof left !== 'string') {
          this.logger.warn(`"match" operator applied to a non-string: ${typeof left}`);
          return false;
        }
        if (typeof right !== 'string') {
          throw new Error(
            `"match" operator requires a regex string on the right side, received: ${typeof right}`
          );
        }
        RegexUtils.validateSafety(right, this.logger);
        try {
          const regex = new RegExp(right);
          return regex.test(left);
        } catch (error) {
          throw new Error(`Invalid regex for "match" operator: ${right} (${error.message})`);
        }
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        if (
          typeof left === 'number' &&
          !isNaN(left) &&
          typeof right === 'number' &&
          !isNaN(right)
        ) {
          return left + right;
        }
        throw new Error(`Invalid operands for + operator: ${typeof left} and ${typeof right}`);
      case '-':
        if (typeof left !== 'number' || isNaN(left) || typeof right !== 'number' || isNaN(right)) {
          throw new Error(
            `Subtraction operator requires numeric operands, received: ${typeof left} and ${typeof right}`
          );
        }
        return left - right;
      case '*':
        if (typeof left !== 'number' || isNaN(left) || typeof right !== 'number' || isNaN(right)) {
          throw new Error(
            `Multiplication operator requires numeric operands, received: ${typeof left} and ${typeof right}`
          );
        }
        return left * right;
      case '/':
        if (typeof left !== 'number' || isNaN(left) || typeof right !== 'number' || isNaN(right)) {
          throw new Error(
            `Division operator requires numeric operands, received: ${typeof left} and ${typeof right}`
          );
        }
        if (right === 0) {
          throw new Error('Division by zero');
        }
        return left / right;
      case '%':
        if (typeof left !== 'number' || isNaN(left) || typeof right !== 'number' || isNaN(right)) {
          throw new Error(
            `Modulo operator requires numeric operands, received: ${typeof left} and ${typeof right}`
          );
        }
        if (right === 0) {
          throw new Error('Modulo by zero');
        }
        return left % right;
      default:
        throw new Error(`Unsupported binary operator: ${operator}`);
    }
  }

  /** @private */
  _evaluateUnaryExpression(node, context) {
    const operator = node.operator;

    if (operator === '!') {
      const argument = this._evaluateNode(node.argument, context);
      return !argument;
    }

    throw new Error(`Unsupported unary operator: ${operator}`);
  }

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
  _compare(a, b) {
    if (this._areBothNullOrUndefined(a, b)) {
      return 0;
    }
    if (a == null) {
      return -1;
    }
    if (b == null) {
      return 1;
    }

    if (typeof a === 'number' && isNaN(a)) {
      throw new Error('Cannot compare NaN values');
    }
    if (typeof b === 'number' && isNaN(b)) {
      throw new Error('Cannot compare NaN values');
    }

    const typeA = typeof a;
    const typeB = typeof b;

    const isDateA = a instanceof Date;
    const isDateB = b instanceof Date;

    if (isDateA && isDateB) {
      return a.getTime() - b.getTime();
    }

    if (isDateA || isDateB) {
      throw new Error(
        `[STRICT MODE] Cannot compare Date with ${isDateA ? typeB : typeA}. Both operands must be Dates.`
      );
    }

    if (typeA !== typeB) {
      throw new Error(
        `[STRICT MODE] Cannot compare different types: ${typeA} (${JSON.stringify(a)}) vs ${typeB} (${JSON.stringify(b)}). Both operands must be the same type.`
      );
    }

    if (typeof a === 'number' && !isNaN(a) && typeof b === 'number' && !isNaN(b)) {
      return a - b;
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }

    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b ? 0 : a ? 1 : -1;
    }

    throw new Error(
      `[STRICT MODE] Cannot compare values of type ${typeA}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`
    );
  }

  /** @private */
  _equals(a, b) {
    if (a === b) {
      return true;
    }

    if (this._areBothNullOrUndefined(a, b)) {
      return true;
    }
    if (a == null || b == null) {
      return false;
    }

    if (typeof a === 'number' && isNaN(a)) {
      return false;
    }
    if (typeof b === 'number' && isNaN(b)) {
      return false;
    }

    const typeA = typeof a;
    const typeB = typeof b;

    if (typeA !== typeB) {
      this.logger.warn(
        `[STRICT MODE] Type mismatch in equality comparison: ${typeA} (${JSON.stringify(a)}) vs ${typeB} (${JSON.stringify(b)}). Returning false.`
      );
      return false;
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a === b;
    }

    return a === b;
  }
}
