import type jsep from 'jsep';
import type { ExpressionLogger, ExpressionParser, ExpressionPlaceholders } from './types.js';
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
  declare logger: ExpressionLogger;
  declare parser: ExpressionParser;
  declare placeholderService: ExpressionPlaceholders;

  /**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
  static get di() {
    return {
      name: 'expressionEvaluatorService',
      dependencies: ['logger', 'expressionParserService', 'placeholderService'],
      isSingleton: true,
      factory: (
        logger: ExpressionLogger,
        expressionParserService: ExpressionParser,
        placeholderService: ExpressionPlaceholders
      ) => new ExpressionEvaluatorService(logger, expressionParserService, placeholderService)
    };
  }

  /**
   * Initializes the evaluator with required parsing and placeholder resolution services.
   * @param {Object} logger Diagnostic output interface.
   * @param {ExpressionParserService} parserService Logic parser for AST generation.
   * @param {Object} placeholderService Template engine for {{placeholder}} resolution.
   * @throws {Error} If mandatory dependencies are missing or malformed.
   */
  constructor(
    logger: ExpressionLogger,
    parserService: ExpressionParser,
    placeholderService: ExpressionPlaceholders
  ) {
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
  evaluate(expressionString: string, context: object | null = {}): boolean {
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
      this.logger.error(`Error evaluating expression: ${(error as Error).message}`);
      throw error;
    }
  }

  /** @description Evaluates a pre-parsed AST against a context. */
  evaluateAst(ast: jsep.Expression, context: object | null = {}): boolean {
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
      this.logger.error(`Error evaluating AST: ${(error as Error).message}`);
      throw error;
    }
  }

  // =============================================================================
  // AST NODE EVALUATION
  // =============================================================================

  /** @private */
  _evaluateNode(node: jsep.Expression | null, context: object | null): unknown {
    if (!node || typeof node !== 'object' || !node.type) {
      throw new Error('Invalid AST node');
    }

    switch (node.type) {
      case 'Identifier':
        return this._evaluateIdentifier(node as jsep.Identifier, context);
      case 'MemberExpression':
        return this._evaluateMemberExpression(node as jsep.MemberExpression, context);
      case 'Literal':
        return this._evaluateLiteral(node as jsep.Literal, context);
      case 'BinaryExpression':
        return this._evaluateBinaryExpression(node as jsep.BinaryExpression, context);
      case 'UnaryExpression':
        return this._evaluateUnaryExpression(node as jsep.UnaryExpression, context);
      case 'CallExpression':
        return this._evaluateCallExpression(node as jsep.CallExpression, context);
      case 'ArrayExpression':
        return this._evaluateArrayExpression(node as jsep.ArrayExpression, context);
      default:
        throw new Error(`Unsupported AST node type: ${node.type}`);
    }
  }

  /** @private */
  _evaluateIdentifier(node: jsep.Identifier, context: object | null): unknown {
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
      this.logger.error(
        `Error resolving identifier ${identifierName}: ${(error as Error).message}`
      );
      throw new Error(
        `Failed to resolve identifier ${identifierName}: ${(error as Error).message}`
      );
    }
  }

  /** @private */
  _evaluateMemberExpression(node: jsep.MemberExpression, context: object | null): unknown {
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
      this.logger.error(`Error resolving member expression ${path}: ${(error as Error).message}`);
      throw new Error(`Failed to resolve member expression ${path}: ${(error as Error).message}`);
    }
  }

  /** @private */
  _buildPathFromMemberExpression(node: jsep.Expression): string {
    if (node.type === 'Identifier') {
      return (node as jsep.Identifier).name;
    }
    if (node.type === 'MemberExpression') {
      const objectPath = this._buildPathFromMemberExpression(
        (node as jsep.MemberExpression).object
      );
      const propertyName = node.computed
        ? this._evaluateNode((node as jsep.MemberExpression).property, {})
        : ((node as jsep.MemberExpression).property as jsep.Identifier).name;
      return `${objectPath}.${propertyName}`;
    }
    throw new Error(`Unexpected node type in member expression: ${node.type}`);
  }

  /** @private */
  _evaluateLiteral(
    node: Pick<jsep.Literal, 'value'> & Partial<Pick<jsep.Literal, 'type' | 'raw'>>,
    _context: object | null
  ): jsep.Literal['value'] {
    return node.value;
  }

  /** @private */
  _evaluateArrayExpression(node: jsep.ArrayExpression, context: object | null): unknown[] {
    return node.elements.map((elem) => this._evaluateNode(elem, context));
  }

  /** @private */
  _evaluateCallExpression(node: jsep.CallExpression, context: object | null): unknown {
    const funcName = node.callee.name || node.callee.value;
    const args = node.arguments.map((arg) => this._evaluateNode(arg, context));

    const func = this._builtInFunctions[funcName as keyof typeof this._builtInFunctions];
    if (!func) {
      throw new Error(`Unknown function: ${funcName}`);
    }

    try {
      return (func as (...args: unknown[]) => unknown).apply(this, args);
    } catch (error) {
      throw new Error(`Error in function ${funcName}(): ${(error as Error).message}`);
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
  _areBothNullOrUndefined(a: unknown, b: unknown) {
    return a == null && b == null;
  }

  /** @private */
  _hasCircularReference(obj: unknown, seen: Set<object> = new Set()): boolean {
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
            if (this._hasCircularReference((obj as Record<string, unknown>)[key], seen)) {
              return true;
            }
          }
        }
      }
    } catch (e) {
      this.logger.warn(`Error checking circular reference: ${(e as Error).message}`);
      return false;
    }
    seen.delete(obj);
    return false;
  }

  /** @private */
  _parseValue(value: unknown): unknown {
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
  _evaluateBinaryExpression(node: jsep.BinaryExpression, context: object | null): unknown {
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
          throw new Error(
            `Invalid regex for "match" operator: ${right} (${(error as Error).message})`
          );
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
  _evaluateUnaryExpression(node: jsep.UnaryExpression, context: object | null): boolean {
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
  _compare(a: unknown, b: unknown): number {
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
  _equals(a: unknown, b: unknown): boolean {
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
