import type { DomainQuery } from '../internal/contracts.js';
import { Specification } from './Specification.js';
import './CompositeSpecification.js'; // Ensures CompositeSpecification is registered
import { SpecificationException } from '../internal/errors/SpecificationException.js';

/**
 * Specification implementation using arbitrary JavaScript predicates for in-memory entity evaluation.
 * @class
 * @extends Specification
 */
export class FunctionSpecification<E = unknown> extends Specification<E> {
  declare predicateFunction: (entity: E) => unknown;
  declare description: string | null;
  /**
   * Initializes specification with a custom predicate logic and optional metadata.
   * @param {Function} predicateFunction Boolean transformation taking a domain entity.
   * @param {string|null} [description=null] Semantic description of the logic.
   * @throws {SpecificationException} If predicateFunction is not a function.
   */
  constructor(predicateFunction: (entity: E) => unknown, description: string | null = null) {
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
  isSatisfiedBy(entity: E) {
    try {
      return Boolean(this.predicateFunction(entity));
    } catch (error) {
      throw new SpecificationException(
        `Failed to evaluate function specification: ${(error as Error).message}`,
        'FunctionSpecification',
        { error: (error as Error).message }
      );
    }
  }

  /**
   * Prevents translation to database queries as arbitrary functions lack persistence mapping.
   * @throws {SpecificationException} Always, as translation is unsupported.
   */
  toQuery<Q extends DomainQuery>(_queryBuilder: Q): Q {
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
