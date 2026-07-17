/**
 * @file GasDataImporter/src/transform/managers/TransformerValidationGuard.js
 * @description Manager for transformation configuration and row-level validation.
 */

import { TransformError } from '../errors/TransformError.js';

export class TransformerValidationGuard {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
  }

  /**
   * Evaluates record-level integrity rules against a transformed row, rejecting records that fail any predicate.
   * @private
   * @param {Object} row transformed record attributes.
   * @param {string|Array<string>} validation Logic expression or collection of rules.
   * @param {number} rowIndex record position for diagnostic logging.
   * @returns {boolean} True if all validation predicates are satisfied.
   */
  _applyValidation(row, validation, rowIndex) {
    if (!validation) return true;
    const rules = Array.isArray(validation) ? validation : [validation];

    for (const rule of rules) {
      try {
        const isValid = this.facade._evaluateExpression(rule, row);
        if (isValid === false) {
          this._logger.warn(`[Transformer] Row ${rowIndex} rejected by validation rule: "${rule}"`);
          return false;
        }
      } catch (error) {
        this._logger.error(
          `[Transformer] Validation rule evaluation failed for row ${rowIndex}: ${error.message}`
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Enforces structural integrity of the transformation configuration segment.
   * @param {Object} config target transformation rules.
   * @returns {boolean} Always true if no errors are thrown.
   * @throws {TransformError} If mapping, calculated fields, or normalization blocks are malformed.
   */
  validateConfig(config) {
    if (config.mapping && typeof config.mapping !== 'object') {
      throw new TransformError('Transform mapping must be an object', 'INVALID_MAPPING_CONFIG');
    }
    if (config.calculated && typeof config.calculated !== 'object') {
      throw new TransformError(
        'Transform calculated must be an object',
        'INVALID_CALCULATED_CONFIG'
      );
    }
    if (config.normalization && typeof config.normalization !== 'object') {
      throw new TransformError(
        'Transform normalization must be an object',
        'INVALID_NORMALIZATION_CONFIG'
      );
    }
    if (config.validation) {
      if (typeof config.validation !== 'string' && !Array.isArray(config.validation)) {
        throw new TransformError(
          'Transform validation must be a string or an array of strings',
          'INVALID_VALIDATION_CONFIG'
        );
      }
    }
    return true;
  }
}
