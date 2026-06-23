import { DomainException } from './DomainException.js';

/**
 * Exception class for failed entity resolution by identifier or search specification.
 * @class
 * @extends DomainException
 */
export class EntityNotFoundException extends DomainException {
  /**
   * Initializes exception with target entity classification and failed resolution criteria.
   * @param {string} entityType Domain entity classification.
   * @param {string|Object} criteria Identifier or specification used for the failed search.
   * @param {Object} [details={}] Auxiliary diagnostic metadata.
   */
  constructor(entityType, criteria, details = {}) {
    const criteriaStr = typeof criteria === 'object' ? JSON.stringify(criteria) : criteria;
    const message = `${entityType} not found with criteria: ${criteriaStr}`;
    super(message, 'Repository', { ...details, entityType, criteria });
    this.name = 'EntityNotFoundException';
    this.entityType = entityType;
    this.criteria = criteria;
    this.entityId = typeof criteria === 'string' ? criteria : undefined; // Alias for when criteria is an ID
  }

  /**
   * Returns the domain classification of the entity that failed resolution.
   * @returns {string} Entity type name.
   */
  getEntityType() {
    return this.entityType;
  }

  /**
   * Retrieves the failed resolution parameters (ID or search object).
   * @returns {string|Object} Resolution criteria.
   */
  getCriteria() {
    return this.criteria;
  }
}
