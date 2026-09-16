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
  }

  /**
   * Applies domain specification filters to a database query builder.
   * @param {Object} specification domain filter criteria.
   * @param {Object} queryBuilder database query constructor.
   * @param {{valid:boolean, reason:string|null, queryObjectCriteria:Record<string, unknown>|null}|null} [validation=null] Optional analysis already produced for this operation.
   * @returns {Object} The configured query builder.
   * @throws {SpecificationException} If specification is null, queryBuilder is missing, or translation is unsupported.
   */
  translate(specification, queryBuilder, validation = null) {
    if (!specification) {
      throw new SpecificationException('Specification is required', 'QueryTranslator');
    }

    if (!queryBuilder) {
      throw new SpecificationException('Query builder is required', 'QueryTranslator');
    }

    const analysis = validation || this.validate(specification);

    if (!analysis.valid) {
      throw new SpecificationException(
        `Specification ${specification.constructor.name} cannot be translated to a database query`,
        'QueryTranslator',
        { specification: specification.toString() }
      );
    }

    if (analysis.queryObjectCriteria !== null) {
      try {
        this.logger.debug(
          `Translating specification via toQueryObject(): ${specification.constructor.name}`
        );
        return this._applyQueryObject(analysis.queryObjectCriteria, queryBuilder);
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
   * Reads the equality-criteria fast path once for the current operation.
   * @private
   * @param {Object} specification Candidate specification.
   * @returns {Record<string, unknown>|null} Equality criteria or null.
   */
  _queryObjectCriteria(specification) {
    const criteria =
      typeof specification.toQueryObject === 'function' ? specification.toQueryObject() : null;
    return criteria === null || criteria === undefined ? null : criteria;
  }

  /**
   * Applies a plain equality-criteria object (`{column: value}`) to a query builder.
   * @private
   * @param {Record<string, unknown>} criteria Equality criteria.
   * @param {Object} queryBuilder database query constructor.
   * @returns {Object} The configured query builder.
   */
  _applyQueryObject(criteria, queryBuilder) {
    for (const [column, value] of Object.entries(criteria)) {
      queryBuilder.where(column, '=', value);
    }
    return queryBuilder;
  }

  /**
   * Evaluates if a given specification possesses a supported mapping to database query structures.
   * @param {Object} specification Criteria to validate.
   * @returns {{valid:boolean, reason:string|null, queryObjectCriteria:Record<string, unknown>|null}} Validation outcome and the criterion evaluation for this operation.
   */
  validate(specification) {
    if (!specification) {
      return {
        valid: false,
        reason: 'Specification is null or undefined',
        queryObjectCriteria: null
      };
    }

    const queryObjectCriteria = this._queryObjectCriteria(specification);
    if (queryObjectCriteria !== null) {
      return { valid: true, reason: null, queryObjectCriteria };
    }

    if (
      typeof specification.canBeTranslatedToQuery !== 'function' ||
      !specification.canBeTranslatedToQuery(queryObjectCriteria)
    ) {
      return {
        valid: false,
        reason: `${specification.constructor.name} cannot be translated to a database query`,
        queryObjectCriteria
      };
    }

    return { valid: true, reason: null, queryObjectCriteria };
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
