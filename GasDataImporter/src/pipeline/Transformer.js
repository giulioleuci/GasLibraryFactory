/**
 * @fileoverview Data transformation engine for the ETL pipeline (Transform phase)
 */

import { TransformError } from '../internal/errors/TransformError.js';
import { UtilsService } from '@CoreUtilsLib';

/**
 * Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.
 * @class
 */
class Transformer {
  /**
   * @param {Object} [logger=console] Diagnostic output interface.
   * @param {Object|null} [expressionEngine=null] GasExpressionEngineLib service for computed fields.
   * @param {Object|null} [utils=null] CoreUtilsLib service for common utilities.
   */
  constructor(logger = console, expressionEngine = null, utils = null) {
    this._logger = logger;
    this._expressionEngine = expressionEngine;
    this._utils = utils || new UtilsService();
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

    this._logger.debug(`[Transformer] Transforming ${sourceData.length} rows`);

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

      this._logger.debug(`[Transformer] Successfully transformed ${transformedData.length} rows`);
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

  /**
   * Transforms row attributes according to the provided mapping schema, renaming source columns to target identifiers.
   * @private
   * @param {Object} sourceRow raw input record.
   * @param {Object} mapping field renaming rules.
   * @returns {Object} mapped record state.
   */
  _applyMapping(sourceRow, mapping) {
    const mappedRow = {};
    if (!mapping || Object.keys(mapping).length === 0) {
      return { ...sourceRow };
    }

    for (const [sourceCol, destCol] of Object.entries(mapping)) {
      if (Object.prototype.hasOwnProperty.call(sourceRow, sourceCol)) {
        mappedRow[destCol] = sourceRow[sourceCol];
      } else {
        mappedRow[destCol] = null;
        this._logger.warn(
          `[Transformer] Source column "${sourceCol}" not found in row, setting "${destCol}" to null`
        );
      }
    }

    for (const [key, value] of Object.entries(sourceRow)) {
      if (
        !Object.prototype.hasOwnProperty.call(mapping, key) &&
        !Object.prototype.hasOwnProperty.call(mappedRow, key)
      ) {
        mappedRow[key] = value;
      }
    }
    return mappedRow;
  }

  /**
   * Evaluates computed field expressions, managing dependency resolution and topological execution order.
   * @private
   * @param {Object} row current record state.
   * @param {Object} calculated map of field names to logic expressions.
   * @returns {Object} record state updated with computed values.
   * @throws {TransformError} If a circular dependency is detected or evaluation fails.
   */
  _applyCalculated(row, calculated) {
    if (!calculated || Object.keys(calculated).length === 0) {
      return row;
    }

    const result = { ...row };
    const dependencies = this._buildDependencyGraph(calculated);
    const executionOrder = this._topologicalSort(dependencies);

    for (const fieldName of executionOrder) {
      const expression = calculated[fieldName];
      try {
        result[fieldName] = this._evaluateExpression(expression, result);
      } catch (error) {
        this._logger.error(
          `[Transformer] Failed to calculate field "${fieldName}": ${error.message}`
        );
        throw new TransformError(
          `Failed to calculate field "${fieldName}": ${error.message}`,
          'CALCULATED_FIELD_ERROR',
          { fieldName, expression, row, originalError: error.message }
        );
      }
    }
    return result;
  }

  /**
   * @private
   */
  _buildDependencyGraph(calculated) {
    const graph = new Map();
    for (const [fieldName, expression] of Object.entries(calculated)) {
      const dependencies = this._extractPlaceholders(expression);
      graph.set(fieldName, new Set(dependencies));
    }
    return graph;
  }

  /**
   * @private
   */
  _extractPlaceholders(expression) {
    if (!expression || typeof expression !== 'string') {
      return [];
    }
    const placeholders = [];
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = regex.exec(expression)) !== null) {
      const placeholder = match[1].trim();
      const fieldName = placeholder.split('.')[0].split('|')[0].trim();
      if (fieldName && !placeholders.includes(fieldName)) {
        placeholders.push(fieldName);
      }
    }
    return placeholders;
  }

  /**
   * @private
   */
  _topologicalSort(graph) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (node, path = []) => {
      if (visited.has(node)) {
        return;
      }
      if (visiting.has(node)) {
        const cycle = [...path, node].join(' -> ');
        throw new TransformError(
          `Circular dependency detected in calculated fields: ${cycle}`,
          'CIRCULAR_DEPENDENCY',
          { cycle, path: [...path, node] }
        );
      }
      visiting.add(node);
      const dependencies = graph.get(node) || new Set();
      for (const dep of dependencies) {
        if (graph.has(dep)) {
          visit(dep, [...path, node]);
        }
      }
      visiting.delete(node);
      visited.add(node);
      sorted.push(node);
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        visit(node, []);
      }
    }
    return sorted;
  }

  /**
   * @private
   */
  _evaluateExpression(expression, context) {
    if (!expression) {
      return null;
    }
    if (this._expressionEngine) {
      try {
        return this._expressionEngine.evaluate(expression, context);
      } catch (error) {
        this._logger.warn(
          `[Transformer] ExpressionEngine evaluation failed, falling back to template substitution: ${error.message}`
        );
      }
    }
    return this._simpleTemplateSubstitution(expression, context);
  }

  /**
   * @private
   */
  _simpleTemplateSubstitution(template, context) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      const value = context[trimmedKey];
      return value !== undefined && value !== null ? String(value) : '';
    });
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

    // Format date columns
    if (normalization.dateColumns && Array.isArray(normalization.dateColumns)) {
      const dateFormat = normalization.dateFormat || 'yyyy-MM-dd';
      for (const col of normalization.dateColumns) {
        if (normalized[col]) {
          normalized[col] = this._formatDate(normalized[col], dateFormat);
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
        const isValid = this._evaluateExpression(rule, row);
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

export { Transformer };
