import { DomainException } from './DomainException.js';

/**
 * Exception class for business rule violations that compromise aggregate integrity.
 * @class
 * @extends DomainException
 */
export class InvariantViolationException extends DomainException {
  /**
   * Initializes exception with target aggregate type and a collection of violation descriptions.
   * @param {string} aggregateType Domain aggregate classification.
   * @param {string[]} [violations=[]] Detailed list of unsatisfied business rules.
   */
  constructor(aggregateType, violations = []) {
    const message =
      violations.length > 0
        ? `invariant violation in ${aggregateType}: ${violations.join(', ')}`
        : `invariant violation in ${aggregateType}`;
    super(message, 'Aggregate', { aggregateType, violations });
    this.name = 'InvariantViolationException';
    this.aggregateType = aggregateType;
    this.violations = violations;
  }

  /**
   * Returns the domain classification of the aggregate that failed invariant validation.
   * @returns {string} Aggregate type name.
   */
  getAggregateType() {
    return this.aggregateType;
  }

  /**
   * Retrieves the comprehensive list of business rule violations detected.
   * @returns {string[]} Collection of violation descriptions.
   */
  getViolations() {
    return this.violations;
  }

  /**
   * Verifies if the exception contains specific violation details.
   * @returns {boolean} True if the violations list is non-empty.
   */
  hasViolations() {
    return this.violations && this.violations.length > 0;
  }
}
