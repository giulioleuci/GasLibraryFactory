/**
 * @fileoverview Abstract base class for data source extraction strategies
 * @author GasLibraryFactory
 */

import { CellValueCoercion } from '@CoreUtilsLib';
import { SourceError } from '../errors/SourceError.js';

/**
 * Abstract base class defining the contract for data extraction strategies, providing common lifecycle hooks and data normalization utilities.
 * @abstract
 * @class
 */
class SourceStrategy {
  /**
   * Initializes abstract strategy with diagnostic logging capabilities.
   * @param {Object} [logger=console] Diagnostic output interface.
   * @throws {TypeError} If attempting to instantiate this abstract class directly.
   */
  constructor(logger = console) {
    if (this.constructor === SourceStrategy) {
      throw new TypeError('Cannot instantiate abstract class SourceStrategy directly');
    }

    this.logger = logger;
  }

  /**
   * Public interface method orchestrating the extraction lifecycle, including logging, subclass execution, and result validation.
   * @param {Object} config Source-specific parameters.
   * @returns {Array<Object>} Extracted and normalized data rows.
   * @throws {SourceError} If extraction fails or result is not an array.
   */
  extract(config) {
    this.logger.info(`[SourceStrategy] Extracting data with config:`, JSON.stringify(config));

    try {
      const data = this._extractData(config);

      if (!Array.isArray(data)) {
        throw new SourceError(
          'Extract method must return an array of objects',
          'INVALID_EXTRACT_RESULT',
          { resultType: typeof data }
        );
      }

      this.logger.info(`[SourceStrategy] Successfully extracted ${data.length} rows`);
      return data;
    } catch (error) {
      if (error instanceof SourceError) {
        throw error;
      }

      this.logger.error(`[SourceStrategy] Extraction failed: ${error.message}`);
      throw new SourceError(`Data extraction failed: ${error.message}`, 'EXTRACTION_FAILED', {
        originalError: error.message,
        config
      });
    }
  }

  /**
   * Abstract hook for implementing source-specific data retrieval logic.
   * @abstract
   * @protected
   * @param {Object} config Source-specific parameters.
   * @returns {Array<Object>} Collection of raw data rows.
   * @throws {Error} If subclass fails to implement.
   * @throws {SourceError} If retrieval fails.
   */
  _extractData(_config) {
    throw new Error('Subclasses must implement _extractData method');
  }

  /**
   * Normalizes 2D grid data into an array of objects, optionally using the first row as property keys.
   * @protected
   * @param {Array<Array>} data 2D data grid.
   * @param {boolean} [hasHeaders=true] If true, uses first row for attribute keys.
   * @returns {Array<Object>} Collection of row objects.
   */
  _arrayToObjects(data, hasHeaders = true) {
    if (!data || data.length === 0) {
      return [];
    }

    let headers;
    let dataRows;

    if (hasHeaders) {
      headers = data[0];
      dataRows = data.slice(1);
    } else {
      // Generate generic column names: Col_0, Col_1, etc.
      headers = data[0].map((_, index) => `Col_${index}`);
      dataRows = data;
    }

    return dataRows.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        const raw = row[index] !== undefined ? row[index] : null;
        obj[header] = this._coerceValue(raw);
      });
      return obj;
    });
  }

  /**
   * Casts raw string values into their appropriate JavaScript types (Number, Boolean) for domain consistency.
   * Delegates to CoreUtilsLib's shared CellValueCoercion (dedupe of the
   * duplicate previously kept in sync manually with SheetDBLib).
   * @protected
   * @param {*} value Raw cell value.
   * @returns {*} Coerced primitive value.
   */
  _coerceValue(value) {
    return CellValueCoercion.coerceValue(value);
  }

  /**
   * Converts a 1-based column index into its A1-notation letter (1 -> 'A', 27 -> 'AA').
   * Shared by strategies that build explicit A1 ranges (FolderStrategy, SheetByIdStrategy).
   * @protected
   * @param {number} column 1-based column index.
   * @returns {string} A1-notation column letter(s).
   */
  _columnToLetter(column) {
    let letter = '';
    while (column > 0) {
      const remainder = (column - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      column = Math.floor((column - 1) / 26);
    }
    return letter;
  }

  /**
   * Enforces existence of mandatory configuration parameters.
   * @protected
   * @param {Object} config extraction parameters.
   * @param {string[]} requiredFields Collection of mandatory attribute keys.
   * @throws {SourceError} If any mandatory fields are missing.
   */
  _validateConfig(config, requiredFields) {
    const missing = requiredFields.filter((field) => !config[field]);

    if (missing.length > 0) {
      throw new SourceError(
        `Missing required configuration fields: ${missing.join(', ')}`,
        'MISSING_CONFIG_FIELDS',
        { missingFields: missing, providedConfig: config }
      );
    }
  }
}

export { SourceStrategy };
