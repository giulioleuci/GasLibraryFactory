import { Specification } from './Specification.js';
import './CompositeSpecification.js'; // Ensures CompositeSpecification is registered
import { SpecificationException } from '../internal/errors/SpecificationException.js';
import { RegexUtils } from '@CoreUtilsLib';

/**
 * Atomic specification for comparing entity field values against specific criteria using common relational operators.
 * @class
 * @extends Specification
 */
export class FieldSpecification extends Specification {
  /**
   * Initializes comparison criteria with target field, operator, and comparison values.
   * @param {string} field Dot-notation property path within the entity.
   * @param {string} operator Relational operator (equals|notEquals|greaterThan|lessThan|greaterThanOrEqual|lessThanOrEqual|in|notIn|between|like|notLike).
   * @param {*} value Primary comparison value or [min, max] array for 'between'.
   * @param {*} [secondValue=null] Boundary value for 'between' if not provided in array.
   * @throws {SpecificationException} If the operator is unsupported.
   */
  constructor(field, operator, value, secondValue = null) {
    super();
    this._field = field;
    this._operator = operator;

    // Handle 'between' operator with array notation
    if (operator === 'between' && Array.isArray(value) && value.length === 2) {
      this._value = value[0];
      this._secondValue = value[1];
    } else {
      this._value = value;
      this._secondValue = secondValue;
    }

    this._validateOperator();
  }

  /**
   * Enforces usage of supported relational comparison operators.
   * @private
   * @throws {SpecificationException} If operator classification is unknown.
   */
  _validateOperator() {
    const validOperators = [
      'equals',
      'notEquals',
      'greaterThan',
      'lessThan',
      'greaterThanOrEqual',
      'lessThanOrEqual',
      'in',
      'notIn',
      'between',
      'like',
      'notLike'
    ];
    if (!validOperators.includes(this._operator)) {
      throw new SpecificationException(
        `Invalid operator: ${this._operator}. Valid operators: ${validOperators.join(', ')}`,
        'FieldSpecification'
      );
    }
    // Note: between operator validation is deferred to isSatisfiedBy()
    // to allow construction and throw at evaluation time
  }

  /**
   * Safely resolves the value of the target field from an entity instance, supporting nested path navigation.
   * @private
   * @param {Object} entity Target domain entity.
   * @returns {*} Resolved field value or undefined if path resolution fails.
   */
  _getFieldValue(entity) {
    if (!entity) {
      return undefined;
    }

    // Support nested field access (e.g., 'address.city')
    const parts = this._field.split('.');
    let value = entity;
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    return value;
  }

  // Regex escaping removed - now using CoreUtilsLib RegexUtils.escape

  /**
   * Evaluates the relational criteria against a target entity's resolved field value.
   * @param {Object} entity Domain entity to test.
   * @returns {boolean} True if the entity field satisfies the comparison.
   * @throws {SpecificationException} If entity is null/undefined or if operator-specific value constraints are violated.
   */
  isSatisfiedBy(entity) {
    // Validate entity is not null/undefined
    if (entity === null || entity === undefined) {
      throw new SpecificationException(
        'Cannot evaluate specification on null or undefined entity',
        'FieldSpecification'
      );
    }

    const fieldValue = this._getFieldValue(entity);

    switch (this._operator) {
      case 'equals':
        return fieldValue === this._value;

      case 'notEquals':
        return fieldValue !== this._value;

      case 'greaterThan':
        return fieldValue > this._value;

      case 'lessThan':
        return fieldValue < this._value;

      case 'greaterThanOrEqual':
        return fieldValue >= this._value;

      case 'lessThanOrEqual':
        return fieldValue <= this._value;

      case 'in':
        // Runtime validation: value must be an array
        if (!Array.isArray(this._value)) {
          throw new SpecificationException(
            'in operator requires value to be an array',
            'FieldSpecification'
          );
        }
        return this._value.includes(fieldValue);

      case 'notIn':
        // Runtime validation: value must be an array
        if (!Array.isArray(this._value)) {
          throw new SpecificationException(
            'notIn operator requires value to be an array',
            'FieldSpecification'
          );
        }
        return !this._value.includes(fieldValue);

      case 'between':
        // Runtime validation for between operator
        // Check if value is an array but wrong length
        if (Array.isArray(this._value) && this._value.length !== 2) {
          throw new SpecificationException(
            'between operator requires an array of exactly 2 values',
            'FieldSpecification'
          );
        }
        // Check if secondValue is missing (happens when non-array value passed)
        if (this._secondValue === null || this._secondValue === undefined) {
          throw new SpecificationException(
            'between operator requires a second value',
            'FieldSpecification'
          );
        }
        return fieldValue >= this._value && fieldValue <= this._secondValue;

      case 'like': {
        if (typeof fieldValue !== 'string' || typeof this._value !== 'string') {
          return false;
        }
        // SQL-like LIKE operator with % wildcards
        // Escape regex special chars, then replace % with .*
        let pattern = RegexUtils.escape(this._value).replace(/%/g, '.*');
        // Add anchors for exact match (unless wildcards present)
        pattern = '^' + pattern + '$';
        const regex = new RegExp(pattern, 'i');
        return regex.test(fieldValue);
      }

      case 'notLike': {
        if (typeof fieldValue !== 'string' || typeof this._value !== 'string') {
          return true; // notLike returns true for non-strings
        }
        // SQL-like NOT LIKE operator with % wildcards
        let notLikePattern = RegexUtils.escape(this._value).replace(/%/g, '.*');
        notLikePattern = '^' + notLikePattern + '$';
        const notLikeRegex = new RegExp(notLikePattern, 'i');
        return !notLikeRegex.test(fieldValue);
      }

      default:
        return false;
    }
  }

  /**
   * Maps the relational criteria to SheetDBLib query builder instructions.
   * @param {Object} queryBuilder Database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If the operator lacks a direct persistence mapping (e.g., notIn, notLike).
   */
  toQuery(queryBuilder) {
    switch (this._operator) {
      case 'equals':
        return queryBuilder.where(this._field, '=', this._value);

      case 'notEquals':
        return queryBuilder.where(this._field, '!=', this._value);

      case 'greaterThan':
        return queryBuilder.where(this._field, '>', this._value);

      case 'lessThan':
        return queryBuilder.where(this._field, '<', this._value);

      case 'greaterThanOrEqual':
        return queryBuilder.where(this._field, '>=', this._value);

      case 'lessThanOrEqual':
        return queryBuilder.where(this._field, '<=', this._value);

      case 'in':
        return queryBuilder.whereIn(this._field, this._value);

      case 'notIn':
        // SheetDBLib doesn't have native notIn, filter in-memory
        throw new SpecificationException(
          `Operator 'notIn' cannot be translated to database query - use in-memory filtering`,
          'FieldSpecification'
        );

      case 'between':
        // SheetDBLib doesn't have native between, use >= and <=
        return queryBuilder
          .where(this._field, '>=', this._value)
          .andWhere(this._field, '<=', this._secondValue);

      case 'like':
        return queryBuilder.whereLike(this._field, this._value);

      case 'notLike':
        // SheetDBLib doesn't have native notLike, filter in-memory
        throw new SpecificationException(
          `Operator 'notLike' cannot be translated to database query - use in-memory filtering`,
          'FieldSpecification'
        );

      default:
        throw new SpecificationException(
          `Cannot translate operator ${this._operator} to query`,
          'FieldSpecification'
        );
    }
  }

  /**
   * Returns a human-readable string representation of the comparison criteria.
   * @returns {string} Relational expression string.
   */
  toString() {
    if (this._operator === 'between') {
      return `${this._field} ${this._operator} ${this._value} and ${this._secondValue}`;
    }
    return `${this._field} ${this._operator} ${this._value}`;
  }
}
