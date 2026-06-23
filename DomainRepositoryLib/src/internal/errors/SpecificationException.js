import { DomainException } from './DomainException.js';

/**
 * Exception class for failures during specification evaluation or translation to persistent queries.
 * @class
 * @extends DomainException
 */
export class SpecificationException extends DomainException {
  /**
   * Initializes exception with failure details and the target specification classification.
   * @param {string} message Descriptive error message.
   * @param {string} [specificationType] Classification of the failed specification.
   * @param {Object} [details={}] Auxiliary diagnostic metadata.
   */
  constructor(message, specificationType, details = {}) {
    super(message, 'Specification', details);
    this.name = 'SpecificationException';
    this.specificationType = specificationType;
  }

  /**
   * Returns the classification of the specification that caused the evaluation failure.
   * @returns {string|undefined} Specification type identifier.
   */
  getSpecificationType() {
    return this.specificationType;
  }
}
