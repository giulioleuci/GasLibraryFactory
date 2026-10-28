import type { DomainQuery, DomainRecord } from '../internal/contracts.js';
let _CompositeSpecificationClass: {
  new <E>(operator: string, specifications: Specification<E>[]): Specification<E>;
} | null = null;

/**
 * Internal registry hook to inject CompositeSpecification and resolve circular dependencies.
 * @private
 * @param {Function} cls CompositeSpecification constructor.
 */
export function _registerCompositeSpecification(
  cls: NonNullable<typeof _CompositeSpecificationClass>
) {
  _CompositeSpecificationClass = cls;
}

/**
 * Abstract base class for the Specification pattern, enabling encapsulated business rules with in-memory evaluation and database query translation.
 * @abstract
 * @class
 */
export class Specification<E = unknown> {
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
  isSatisfiedBy(_entity: E): boolean {
    throw new Error(`${this.constructor.name} must implement isSatisfiedBy() method`);
  }

  /**
   * Chains the current specification with another using logical AND.
   * @param {Specification} other Follow-on specification.
   * @returns {Specification} Combined composite specification.
   */
  and(other: Specification<E>): Specification<E> {
    return new _CompositeSpecificationClass!('AND', [this, other]);
  }

  /**
   * Chains the current specification with another using logical OR.
   * @param {Specification} other Alternative specification.
   * @returns {Specification} Combined composite specification.
   */
  or(other: Specification<E>): Specification<E> {
    return new _CompositeSpecificationClass!('OR', [this, other]);
  }

  /**
   * Negates the current specification using logical NOT.
   * @returns {Specification} Negated composite specification.
   */
  not(): Specification<E> {
    return new _CompositeSpecificationClass!('NOT', [this]);
  }

  /**
   * Translates the domain rule into SheetDBLib query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {Error} If the specification does not support database translation.
   */
  toQuery<Q extends DomainQuery>(_queryBuilder: Q): Q {
    throw new Error(`${this.constructor.name} cannot be translated to a database query`);
  }

  /**
   * Percorso rapido di pushdown per specification domain-pure.
   *
   * Restituisce un oggetto di uguaglianze `{colonna: valore}` quando la regola è
   * interamente esprimibile come uguaglianze, `null` quando serve la valutazione
   * in memoria. Alternativa a `toQuery(queryBuilder)`: permette al layer di
   * dominio di restare libero da qualsiasi import di query builder.
   *
   * INVARIANTE — quando restituisce un oggetto non-null, il filtro deve essere
   * ESATTAMENTE equivalente a isSatisfiedBy(). Repository.find() applica UNO SOLO
   * dei due: se divergono, il risultato è silenziosamente sbagliato, senza errori.
   * Nel dubbio, restituire null.
   *
   * @returns {Record<string, unknown>|null}
   */
  toQueryObject(): DomainRecord | null {
    return null;
  }

  /**
   * Uses the static query-object path first, then probes genuine toQuery overrides.
   * @returns {boolean} True if the specification can be expressed as a database query.
   */
  canBeTranslatedToQuery(
    queryObjectCriteria: DomainRecord | null | undefined = this.toQueryObject()
  ) {
    if (queryObjectCriteria !== null && queryObjectCriteria !== undefined) {
      return true;
    }
    if (this.toQuery === Specification.prototype.toQuery) {
      return false;
    }

    try {
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
