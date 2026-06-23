/**
 * @file GasDataImporter/src/transform/managers/TransformerDateStyler.js
 * @description Manager for date parsing and formatting transformations.
 */

export class TransformerDateStyler {
  constructor(facade) {
    this._logger = facade._logger;
    this._utils = facade._utils;
  }

  /**
   * Normalizes a raw input value into a formatted date string using CoreUtilsLib parsing and formatting.
   * @private
   * @param {*} value Raw temporal input.
   * @param {string} format target date pattern (e.g., 'YYYY-MM-DD').
   * @returns {string|*} Formatted date string or original value if parsing fails.
   */
  _formatDate(value, format) {
    try {
      const date = this._utils.parseDate(value);
      if (!date) {
        this._logger.warn(`[Transformer] Invalid date value: ${value}`);
        return value;
      }
      return this._utils.formatDate(date, format);
    } catch (error) {
      this._logger.warn(
        `[Transformer] Date formatting failed for value "${value}": ${error.message}`
      );
      return value;
    }
  }
}
