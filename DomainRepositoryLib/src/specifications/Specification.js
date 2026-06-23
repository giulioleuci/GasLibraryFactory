let _CompositeSpecificationClass = null;

/**
 * Internal registry hook to inject CompositeSpecification and resolve circular dependencies.
 * @private
 * @param {Function} cls CompositeSpecification constructor.
 */
export function _registerCompositeSpecification(cls) {
  _CompositeSpecificationClass = cls;
}

/**
 * Abstract base class for the Specification pattern, enabling encapsulated business rules with in-memory evaluation and database query translation.
 * @abstract
 * @class
 */
export class Specification {
  /**
   * Prevents direct instantiation of the abstract Specification class.
   * @throws {TypeError} If attempting to construct this abstract class directly.
   */
  constructor() {
    if (new.target === Specification) {
      throw new TypeError(
        'Cannot construct Specification instances directly - must use a subclass'
      );
    }
  }

  /**
   * Evaluates the specification logic against a domain entity instance.
   * @abstract
   * @param {Object} entity Domain entity to test.
   * @returns {boolean} True if the entity satisfies the business rule.
   * @throws {Error} If the subclass fails to implement this method.
   */
  isSatisfiedBy(_entity) {
    throw new Error(`${this.constructor.name} must implement isSatisfiedBy() method`);
  }

  /**
   * Chains the current specification with another using logical AND.
   * @param {Specification} other Follow-on specification.
   * @returns {Specification} Combined composite specification.
   */
  and(other) {
    return new _CompositeSpecificationClass('AND', [this, other]);
  }

  /**
   * Chains the current specification with another using logical OR.
   * @param {Specification} other Alternative specification.
   * @returns {Specification} Combined composite specification.
   */
  or(other) {
    return new _CompositeSpecificationClass('OR', [this, other]);
  }

  /**
   * Negates the current specification using logical NOT.
   * @returns {Specification} Negated composite specification.
   */
  not() {
    return new _CompositeSpecificationClass('NOT', [this]);
  }

  /**
   * Translates the domain rule into SheetDBLib query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {Error} If the specification does not support database translation.
   */
  toQuery(_queryBuilder) {
    throw new Error(`${this.constructor.name} cannot be translated to a database query`);
  }

  /**
   * Heuristically determines if the specification possesses a supported database mapping.
   * @returns {boolean} True if the specification can be expressed as a database query.
   */
  canBeTranslatedToQuery() {
    try {
      // Try to call toQuery with a mock query builder
      const mockBuilder = {
        where: () => mockBuilder,
        andWhere: () => mockBuilder,
        orWhere: () => mockBuilder,
        whereLike: () => mockBuilder,
        whereIn: () => mockBuilder
      };
      this.toQuery(mockBuilder);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Returns a concise string representation of the specification type.
   * @returns {string} Formatted class name.
   */
  toString() {
    return `${this.constructor.name}()`;
  }
}
