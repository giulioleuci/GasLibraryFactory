import { Specification } from './Specification.js';
import './CompositeSpecification.js'; // Ensures CompositeSpecification is registered
import { SpecificationException } from '../internal/errors/SpecificationException.js';

/**
 * Dynamic specification leveraging GasExpressionEngineLib for complex string-based evaluation and basic persistence translation.
 * @class
 * @extends Specification
 */
export class ExpressionSpecification extends Specification {
  /**
   * Initializes specification with a template expression and its evaluation engine.
   * @param {string} expression Logic template (e.g., "{{age}} >= 18").
   * @param {Object} expressionEngine GasExpressionEngineLib service instance.
   * @throws {SpecificationException} If expression is empty or engine is missing.
   */
  constructor(expression, expressionEngine) {
    super();

    // Validate expression
    if (!expression || typeof expression !== 'string' || expression.trim() === '') {
      throw new SpecificationException(
        'Expression must be a non-empty string',
        'ExpressionSpecification'
      );
    }

    // Validate expression engine is provided
    if (!expressionEngine) {
      throw new SpecificationException('Expression engine is required', 'ExpressionSpecification');
    }

    this.expression = expression;
    this.expressionEngine = expressionEngine;
  }

  /**
   * Resolves the expression evaluation engine, attempting dynamic load if not explicitly provided.
   * @private
   * @returns {Object} Active expression engine instance.
   * @throws {SpecificationException} If engine dependency resolution fails.
   */
  _getExpressionEngine() {
    if (this.expressionEngine) {
      return this.expressionEngine;
    }

    // Try to import GasExpressionEngineLib
    try {
      const { ExpressionEngineService } = require('@GasExpressionEngineLib');
      this.expressionEngine = new ExpressionEngineService({ logger: console });
      return this.expressionEngine;
    } catch (error) {
      throw new SpecificationException(
        'GasExpressionEngineLib is required for ExpressionSpecification but could not be loaded',
        'ExpressionSpecification',
        { error: error.message }
      );
    }
  }

  /**
   * Evaluates the expression against a domain entity using the registered engine.
   * @param {Object} entity Domain entity providing evaluation context.
   * @returns {boolean} True if expression resolves to truthy.
   * @throws {SpecificationException} If evaluation fails due to syntax or engine errors.
   */
  isSatisfiedBy(entity) {
    try {
      const engine = this._getExpressionEngine();
      return engine.evaluate(this.expression, entity);
    } catch (error) {
      throw new SpecificationException(
        `Failed to evaluate expression: ${error.message}`,
        'ExpressionSpecification',
        { expression: this.expression, error: error.message }
      );
    }
  }

  /**
   * Attempts to parse and translate simple expressions into database query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If expression complexity exceeds translation capabilities.
   */
  toQuery(queryBuilder) {
    // Try to parse simple expressions
    const simplePattern = /\{\{(\w+)\}\}\s*(==|!=|>|<|>=|<=)\s*(.+)/;
    const match = this.expression.match(simplePattern);

    if (!match) {
      throw new SpecificationException(
        'Complex expressions cannot be translated to database queries',
        'ExpressionSpecification',
        { expression: this.expression }
      );
    }

    const [, field, operator, valueStr] = match;
    let value = valueStr.trim();

    // Parse value
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    } else if (!isNaN(value)) {
      value = Number(value);
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    // Map operators
    const operatorMap = {
      '==': '=',
      '!=': '!=',
      '>': '>',
      '<': '<',
      '>=': '>=',
      '<=': '<='
    };

    return queryBuilder.where(field, operatorMap[operator], value);
  }

  /**
   * Determines if the expression matches a supported simple pattern for database query translation.
   * @returns {boolean} True if expression follows simple field-operator-value structure.
   */
  canBeTranslatedToQuery() {
    const simplePattern = /\{\{(\w+)\}\}\s*(==|!=|>|<|>=|<=)\s*(.+)/;
    return simplePattern.test(this.expression);
  }

  /**
   * Returns a string representation of the underlying expression.
   * @returns {string} Formatted expression string.
   */
  toString() {
    return `Expression(${this.expression})`;
  }
}
