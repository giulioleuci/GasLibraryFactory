import { LoggerService } from '@CoreUtilsLib';
import { SpecificationException } from '../errors/SpecificationException.js';

/**
 * Bridge for converting domain Specifications into SheetDBLib AdvancedQueryBuilder instructions.
 * @class
 */
export class QueryTranslator {
  /**
   * Initializes translator with optional diagnostic logging.
   * @param {Object|null} [logger=null] Optional diagnostic logger.
   */
  constructor(logger = null) {
    this.logger = logger || new LoggerService();
    this._queryObjectCriteriaCache = new WeakMap();
  }

  /**
   * Applies domain specification filters to a database query builder.
   * @param {Object} specification domain filter criteria.
   * @param {Object} queryBuilder database query constructor.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If specification is null, queryBuilder is missing, or translation is unsupported.
   */
  translate(specification, queryBuilder) {
    if (!specification) {
      throw new SpecificationException('Specification is required', 'QueryTranslator');
    }

    if (!queryBuilder) {
      throw new SpecificationException('Query builder is required', 'QueryTranslator');
    }

    if (this._queryObjectCriteria(specification) !== null) {
      try {
        this.logger.debug(
          `Translating specification via toQueryObject(): ${specification.constructor.name}`
        );
        return this._applyQueryObject(specification, queryBuilder);
      } catch (error) {
        if (error instanceof SpecificationException) {
          throw error;
        }
        throw new SpecificationException(
          `Failed to translate specification: ${error.message}`,
          'QueryTranslator',
          { specification: specification.toString(), error: error.message }
        );
      }
    }

    this._queryObjectCriteriaCache.delete(specification);

    // Check if the specification can be translated
    if (
      typeof specification.canBeTranslatedToQuery !== 'function' ||
      !specification.canBeTranslatedToQuery()
    ) {
      throw new SpecificationException(
        `Specification ${specification.constructor.name} cannot be translated to a database query`,
        'QueryTranslator',
        { specification: specification.toString() }
      );
    }

    try {
      this.logger.debug(`Translating specification: ${specification.toString()}`);
      return specification.toQuery(queryBuilder);
    } catch (error) {
      if (error instanceof SpecificationException) {
        throw error;
      }
      throw new SpecificationException(
        `Failed to translate specification: ${error.message}`,
        'QueryTranslator',
        { specification: specification.toString(), error: error.message }
      );
    }
  }

  /**
   * Reads and caches the equality-criteria fast path until translation.
   * @private
   * @param {Object} specification Candidate specification.
   * @returns {Record<string, unknown>|null} Equality criteria or null.
   */
  _queryObjectCriteria(specification) {
    if (this._queryObjectCriteriaCache.has(specification)) {
      return this._queryObjectCriteriaCache.get(specification);
    }

    const criteria =
      typeof specification.toQueryObject === 'function'
        ? specification.toQueryObject()
        : null;
    const normalized = criteria === null || criteria === undefined ? null : criteria;
    this._queryObjectCriteriaCache.set(specification, normalized);
    return normalized;
  }

  /**
   * Applies a plain equality-criteria object (`{column: value}`) to a query builder.
   * @private
   * @param {Object} specification Candidate specification.
   * @param {Object} queryBuilder database query constructor.
   * @returns {Object} The configured query builder.
   */
  _applyQueryObject(specification, queryBuilder) {
    const criteria = this._queryObjectCriteria(specification);
    this._queryObjectCriteriaCache.delete(specification);
    for (const [column, value] of Object.entries(criteria)) {
      queryBuilder.where(column, '=', value);
    }
    return queryBuilder;
  }

  /**
   * Evaluates if a given specification possesses a supported mapping to database query structures.
   * @param {Object} specification Criteria to validate.
   * @returns {{valid:boolean, reason:string|null}} Validation outcome and failure explanation.
   */
  validate(specification) {
    if (!specification) {
      return { valid: false, reason: 'Specification is null or undefined' };
    }

    if (this._queryObjectCriteria(specification) !== null) {
      return { valid: true, reason: null };
    }

    if (
      typeof specification.canBeTranslatedToQuery !== 'function' ||
      !specification.canBeTranslatedToQuery()
    ) {
      this._queryObjectCriteriaCache.delete(specification);
      return {
        valid: false,
        reason: `${specification.constructor.name} cannot be translated to a database query`
      };
    }

    return { valid: true, reason: null };
  }

  /**
   * Safely attempts specification translation, encapsulating potential failures in a result object.
   * @param {Object} specification domain filter criteria.
   * @param {Object} queryBuilder database query constructor.
   * @returns {{success:boolean, queryBuilder:Object|null, error:string|null}} Operation result metadata.
   */
  tryTranslate(specification, queryBuilder) {
    try {
      const result = this.translate(specification, queryBuilder);
      return { success: true, queryBuilder: result, error: null };
    } catch (error) {
      return {
        success: false,
        queryBuilder: null,
        error: error.message
      };
    }
  }
}
