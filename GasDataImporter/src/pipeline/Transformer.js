/**
 * @fileoverview Data transformation engine for the ETL pipeline (Transform phase)
 * @version 2.0 - Refactored using Facade/Delegation pattern.
 */

import { TransformError } from '../internal/errors/TransformError.js';
import { UtilsService } from '@CoreUtilsLib';
import { TransformerMappingEngine } from '../internal/transform-managers/TransformerMappingEngine.js';
import { TransformerDateStyler } from '../internal/transform-managers/TransformerDateStyler.js';
import { TransformerNumberSanitizer } from '../internal/transform-managers/TransformerNumberSanitizer.js';
import { TransformerValidationGuard } from '../internal/transform-managers/TransformerValidationGuard.js';

/**
 * Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.
 * @class
 */
class Transformer {
  /**
   * Initializes the transformer with delegated managers for specialized transformation tasks.
   * @param {Object} [logger=console] Diagnostic output interface.
   * @param {Object|null} [expressionEngine=null] GasExpressionEngineLib service for computed fields.
   * @param {Object|null} [utils=null] CoreUtilsLib service for common utilities.
   */
  constructor(logger = console, expressionEngine = null, utils = null) {
    this._logger = logger;
    this._expressionEngine = expressionEngine;
    this._utils = utils || new UtilsService();

    // Initialize managers
    this._mappingEngine = new TransformerMappingEngine(this);
    this._dateStyler = new TransformerDateStyler(this);
    this._numberSanitizer = new TransformerNumberSanitizer(this);
    this._validationGuard = new TransformerValidationGuard(this);

    // Delegate methods
    this._delegate([
      {
        manager: this._mappingEngine,
        methods: [
          '_applyMapping', '_applyCalculated', '_buildDependencyGraph',
          '_extractPlaceholders', '_topologicalSort', '_evaluateExpression',
          '_simpleTemplateSubstitution'
        ]
      },
      {
        manager: this._dateStyler,
        methods: ['_formatDate']
      },
      {
        manager: this._numberSanitizer,
        methods: ['_applyNormalization']
      },
      {
        manager: this._validationGuard,
        methods: ['_applyValidation', 'validateConfig']
      }
    ]);
  }

  _delegate(delegations) {
    delegations.forEach(({ manager, methods }) => {
      methods.forEach(method => {
        if (typeof manager[method] === 'function') {
          this[method] = manager[method].bind(manager);
        }
      });
    });
  }

  /**
   * Processes a collection of raw data rows according to the specified transformation recipe.
   * @param {Array<Object>} sourceData Collection of raw input rows.
   * @param {Object} transformConfig transformation rules (mapping, calculated, normalization, validation).
   * @returns {Array<Object>} Transformed and filtered row collection.
   * @throws {TransformError} If input is malformed or a fatal transformation failure occurs.
   */
  transform(sourceData, transformConfig) {
    if (!Array.isArray(sourceData)) {
      throw new TransformError('Source data must be an array', 'INVALID_SOURCE_DATA', {
        dataType: typeof sourceData
      });
    }

    if (sourceData.length === 0) {
      this._logger.warn('[Transformer] Source data is empty, returning empty array');
      return [];
    }

    const config = transformConfig || {};
    const mapping = config.mapping || {};
    const calculated = config.calculated || {};
    const normalization = config.normalization || {};
    const validation = config.validation || null;

    this._logger.info(`[Transformer] Transforming ${sourceData.length} rows`);

    try {
      const transformedData = sourceData
        .map((row, index) => {
          return this._transformRow(row, index, mapping, calculated, normalization, validation);
        })
        .filter((row) => row !== null);

      const rejectedCount = sourceData.length - transformedData.length;
      if (rejectedCount > 0) {
        this._logger.warn(
          `[Transformer] ${rejectedCount} rows rejected due to validation failures`
        );
      }

      this._logger.info(`[Transformer] Successfully transformed ${transformedData.length} rows`);
      return transformedData;
    } catch (error) {
      if (error instanceof TransformError) {
        throw error;
      }

      this._logger.error(`[Transformer] Transformation failed: ${error.message}`);
      throw new TransformError(`Transformation failed: ${error.message}`, 'TRANSFORMATION_FAILED', {
        originalError: error.message
      });
    }
  }

  /**
   * Executes the sequential transformation pipeline for a single data record.
   * @private
   * @param {Object} sourceRow raw input attributes.
   * @param {number} rowIndex record position for diagnostic tracking.
   * @param {Object} mapping field renaming rules.
   * @param {Object} calculated computed field expressions.
   * @param {Object} normalization data cleaning rules.
   * @param {Object} validation record-level integrity checks.
   * @returns {Object|null} Transformed record or null if validation fails.
   * @throws {TransformError} On circular dependencies or unrecoverable row failures.
   */
  _transformRow(sourceRow, rowIndex, mapping, calculated, normalization, validation) {
    try {
      // Step 1: Apply column mapping
      let transformedRow = this._applyMapping(sourceRow, mapping);

      // Step 2: Apply normalization
      transformedRow = this._applyNormalization(transformedRow, normalization);

      // Step 3: Calculate computed fields
      transformedRow = this._applyCalculated(transformedRow, calculated);

      // Step 4: Apply validation
      const isValid = this._applyValidation(transformedRow, validation, rowIndex);
      if (!isValid) {
        return null;
      }

      return transformedRow;
    } catch (error) {
      if (error instanceof TransformError && error.code === 'CIRCULAR_DEPENDENCY') {
        throw error;
      }

      this._logger.error(`[Transformer] Failed to transform row ${rowIndex}: ${error.message}`);
      throw new TransformError(
        `Failed to transform row ${rowIndex}: ${error.message}`,
        'ROW_TRANSFORMATION_FAILED',
        { rowIndex, sourceRow, originalError: error.message }
      );
    }
  }
}

export { Transformer };
