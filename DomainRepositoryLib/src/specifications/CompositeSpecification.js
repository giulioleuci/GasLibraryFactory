import { Specification, _registerCompositeSpecification } from './Specification.js';
import { SpecificationException } from '../internal/errors/SpecificationException.js';

/**
 * Logic-based specification container combining multiple child specifications using AND, OR, or NOT operators.
 * @class
 * @extends Specification
 */
export class CompositeSpecification extends Specification {
  /**
   * Initializes composite structure with logical operator and constituent specifications.
   * @param {string} operator Logic gate ('AND'|'OR'|'NOT').
   * @param {Array<Object>} specifications Collection of specifications to evaluate.
   * @throws {SpecificationException} If operator is invalid or specifications collection is empty/malformed.
   */
  constructor(operator, specifications) {
    super();
    this.operator = operator.toUpperCase();
    this.specifications = specifications;
    this._validateOperator();
    this._validateSpecifications();
  }

  /**
   * Enforces usage of supported logical operators.
   * @private
   * @throws {SpecificationException} If operator is not AND, OR, or NOT.
   */
  _validateOperator() {
    const validOperators = ['AND', 'OR', 'NOT'];
    if (!validOperators.includes(this.operator)) {
      throw new SpecificationException(
        `Invalid operator: ${this.operator}. Valid operators: ${validOperators.join(', ')}`,
        'CompositeSpecification'
      );
    }
  }

  /**
   * Verifies that the constituent collection contains valid Specification instances.
   * @private
   * @throws {SpecificationException} If the collection is empty or contains non-Specification types.
   */
  _validateSpecifications() {
    if (!Array.isArray(this.specifications) || this.specifications.length === 0) {
      throw new SpecificationException(
        'specifications must be a non-empty array',
        'CompositeSpecification'
      );
    }

    for (const spec of this.specifications) {
      if (!(spec instanceof Specification)) {
        throw new SpecificationException(
          'All items must be Specification instances',
          'CompositeSpecification'
        );
      }
    }
  }

  /**
   * Evaluates the combined logical state against a target entity instance.
   * @param {Object} entity Domain entity to test.
   * @returns {boolean} True if the entity satisfies the composite logic.
   * @throws {SpecificationException} If NOT operator is used with multiple children.
   */
  isSatisfiedBy(entity) {
    switch (this.operator) {
      case 'AND':
        return this.specifications.every((spec) => spec.isSatisfiedBy(entity));

      case 'OR':
        return this.specifications.some((spec) => spec.isSatisfiedBy(entity));

      case 'NOT':
        if (this.specifications.length !== 1) {
          throw new SpecificationException(
            'NOT operator requires exactly one specification',
            'CompositeSpecification'
          );
        }
        return !this.specifications[0].isSatisfiedBy(entity);

      default:
        return false;
    }
  }

  /**
   * Translates the composite logic into SheetDBLib query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If using NOT operator (unsupported) or if children are non-translatable.
   */
  toQuery(queryBuilder) {
    if (this.operator === 'NOT') {
      throw new SpecificationException(
        'NOT operator cannot be translated to SheetDBLib queries',
        'CompositeSpecification'
      );
    }

    // Check if all specifications can be translated
    for (const spec of this.specifications) {
      if (!spec.canBeTranslatedToQuery()) {
        throw new SpecificationException(
          'Cannot translate composite specification - one or more child specifications cannot be translated',
          'CompositeSpecification'
        );
      }
    }

    // Apply first specification with where()
    let builder = this.specifications[0].toQuery(queryBuilder);

    // Apply remaining specifications with andWhere() or orWhere()
    for (let i = 1; i < this.specifications.length; i++) {
      const spec = this.specifications[i];

      // Create a temporary builder to get the where clause
      const tempBuilder = {
        _whereClauses: [],
        where(field, operator, value) {
          this._whereClauses.push({ field, operator, value });
          return this;
        },
        andWhere(field, operator, value) {
          this._whereClauses.push({ field, operator, value });
          return this;
        },
        orWhere(field, operator, value) {
          this._whereClauses.push({ field, operator, value });
          return this;
        },
        whereLike(field, pattern) {
          this._whereClauses.push({ field, operator: 'LIKE', value: pattern });
          return this;
        },
        whereIn(field, values) {
          this._whereClauses.push({ field, operator: 'IN', value: values });
          return this;
        }
      };

      spec.toQuery(tempBuilder);

      // Apply the clauses to the real builder
      for (const clause of tempBuilder._whereClauses) {
        if (clause.operator === 'IN') {
          if (this.operator === 'AND') {
            // SheetDBLib doesn't have andWhereIn, use custom logic
            builder = builder.andWhere(clause.field, 'IN', clause.value);
          } else {
            builder = builder.orWhere(clause.field, 'IN', clause.value);
          }
        } else if (clause.operator === 'LIKE') {
          // Apply with AND/OR based on composite operator
          if (this.operator === 'AND') {
            builder = builder.andWhere(clause.field, 'LIKE', clause.value);
          } else {
            builder = builder.orWhere(clause.field, 'LIKE', clause.value);
          }
        } else {
          if (this.operator === 'AND') {
            builder = builder.andWhere(clause.field, clause.operator, clause.value);
          } else {
            builder = builder.orWhere(clause.field, clause.operator, clause.value);
          }
        }
      }
    }

    return builder;
  }

  /**
   * Determines if the entire composite tree possesses a supported database mapping.
   * @returns {boolean} True if all branches are translatable and no unsupported operators are present.
   */
  canBeTranslatedToQuery() {
    if (this.operator === 'NOT') {
      return false;
    }
    return this.specifications.every((spec) => spec.canBeTranslatedToQuery());
  }

  /**
   * Returns a recursive string representation of the logical tree.
   * @returns {string} Logical expression string.
   */
  toString() {
    if (this.operator === 'NOT') {
      return `NOT (${this.specifications[0].toString()})`;
    }
    return `(${this.specifications.map((s) => s.toString()).join(` ${this.operator} `)})`;
  }
}

// Self-register to break the circular dependency with Specification
_registerCompositeSpecification(CompositeSpecification);
