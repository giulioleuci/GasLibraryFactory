import { Specification } from './Specification.js';
import './CompositeSpecification.js'; // Ensures CompositeSpecification is registered
import { SpecificationException } from '../internal/errors/SpecificationException.js';

/**
 * Specification implementation using arbitrary JavaScript predicates for in-memory entity evaluation.
 * @class
 * @extends Specification
 */
export class FunctionSpecification extends Specification {
  /**
   * Initializes specification with a custom predicate logic and optional metadata.
   * @param {Function} predicateFunction Boolean transformation taking a domain entity.
   * @param {string|null} [description=null] Semantic description of the logic.
   * @throws {SpecificationException} If predicateFunction is not a function.
   */
  constructor(predicateFunction, description = null) {
    super();
    if (typeof predicateFunction !== 'function') {
      throw new SpecificationException(
        'predicateFunction must be a function',
        'FunctionSpecification'
      );
    }
    this.predicateFunction = predicateFunction;
    this.description = description;
  }

  /**
   * Evaluates the custom predicate against a target entity instance.
   * @param {Object} entity Domain entity to test.
   * @returns {boolean} Outcome of the predicate function.
   * @throws {SpecificationException} If the predicate function execution fails.
   */
  isSatisfiedBy(entity) {
    try {
      return Boolean(this.predicateFunction(entity));
    } catch (error) {
      throw new SpecificationException(
        `Failed to evaluate function specification: ${error.message}`,
        'FunctionSpecification',
        { error: error.message }
      );
    }
  }

  /**
   * Prevents translation to database queries as arbitrary functions lack persistence mapping.
   * @throws {SpecificationException} Always, as translation is unsupported.
   */
  toQuery(_queryBuilder) {
    throw new SpecificationException(
      'Function specifications cannot be translated to database queries',
      'FunctionSpecification'
    );
  }

  /**
   * Indicates that function specifications are restricted to in-memory evaluation.
   * @returns {false} Always false.
   */
  canBeTranslatedToQuery() {
    return false;
  }

  /**
   * Returns a semantic summary of the function-based specification.
   * @returns {string} Function description or generic label.
   */
  toString() {
    return this.description ? `Function(${this.description})` : 'Function(custom predicate)';
  }
}
