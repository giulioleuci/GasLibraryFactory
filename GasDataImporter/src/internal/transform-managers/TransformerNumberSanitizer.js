/**
 * @file GasDataImporter/src/transform/managers/TransformerNumberSanitizer.js
 * @description Manager for data normalization (trimming, case conversion, and sanitization).
 */

export class TransformerNumberSanitizer {
  constructor(facade) {
    this.facade = facade;
  }

  /**
   * Orchestrates data cleaning tasks including whitespace trimming, case normalization, and date reformatting.
   * @private
   * @param {Object} row raw record state.
   * @param {Object} normalization set of cleaning rules (trim, dateColumns, uppercaseColumns, lowercaseColumns).
   * @returns {Object} normalized record state.
   */
  _applyNormalization(row, normalization) {
    const normalized = { ...row };

    // Trim all string values
    if (normalization.trim === true) {
      for (const [key, value] of Object.entries(normalized)) {
        if (typeof value === 'string') {
          normalized[key] = value.trim();
        }
      }
    }

    // Format date columns (delegates back to facade which delegates to DateStyler)
    if (normalization.dateColumns && Array.isArray(normalization.dateColumns)) {
      const dateFormat = normalization.dateFormat || 'yyyy-MM-dd';
      for (const col of normalization.dateColumns) {
        if (normalized[col]) {
          normalized[col] = this.facade._formatDate(normalized[col], dateFormat);
        }
      }
    }

    // Uppercase columns
    if (normalization.uppercaseColumns && Array.isArray(normalization.uppercaseColumns)) {
      for (const col of normalization.uppercaseColumns) {
        if (normalized[col] && typeof normalized[col] === 'string') {
          normalized[col] = normalized[col].toUpperCase();
        }
      }
    }

    // Lowercase columns
    if (normalization.lowercaseColumns && Array.isArray(normalization.lowercaseColumns)) {
      for (const col of normalization.lowercaseColumns) {
        if (normalized[col] && typeof normalized[col] === 'string') {
          normalized[col] = normalized[col].toLowerCase();
        }
      }
    }

    // SDL-M005: Future number sanitization can be added here
    return normalized;
  }
}
