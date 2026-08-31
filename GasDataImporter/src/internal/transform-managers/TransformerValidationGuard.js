/**
 * @file GasDataImporter/src/transform/managers/TransformerValidationGuard.js
 * @description Manager for transformation configuration and row-level validation.
 */

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
    if (!validation) {
      return true;
    }
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
}
