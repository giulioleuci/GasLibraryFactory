/**
 * @file PipelineFramework/src/postprocessor/builtin/FieldUpdatePostProcessor.js
 * @description Simplified post-processor for updating fields with shorthand syntax.
 * @version 1.0.0
 */

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ValueSource } from '../ValueSource';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @class FieldUpdatePostProcessor
 * @extends BaseUpdatePostProcessor
 * @description Simplified update processor using string shorthands for common value sources.
 *
 * @example
 * {
 *   table: 'DOCS',
 *   recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.id' },
 *   fields: {
 *     status: 'DONE',
 *     at: '$timestamp',
 *     url: '$step.output.url',
 *     user: '$context.email'
 *   }
 * }
 */
export class FieldUpdatePostProcessor extends BaseUpdatePostProcessor {
  /**
   * @constructor
   * @param {string} id - Unique processor ID.
   * @param {Object} config - Configuration.
   * @param {string} config.table - Target table.
   * @param {Object} config.recordIdentifier - Identifier strategy.
   * @param {Object.<string, string|number|Object>} config.fields - Shorthand-to-field map.
   * @param {Object} [services={}] - Injected dependencies.
   */
  constructor(id, config = {}, services = {}) {
    super(id, 'FieldUpdatePostProcessor', config, services);
  }

  /**
   * @function _validateConfig
   * @description Validates 'fields' presence and non-empty status.
   * @throws {ConfigurationError} If 'fields' is missing, non-object, or empty.
   * @protected
   */
  _validateConfig() {
    // Validate base configuration
    super._validateConfig();

    const { fields } = this._config;

    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
      throw new ConfigurationError('fields is required and must be an object', {
        processorId: this.id,
        field: 'fields'
      });
    }

    if (Object.keys(fields).length === 0) {
      throw new ConfigurationError('fields must contain at least one field', {
        processorId: this.id,
        field: 'fields'
      });
    }
  }

  /**
   * @function _parseShorthand
   * @description Maps shorthand strings (e.g., '$timestamp', '$step.output.key') to ValueSource instances.
   * @param {*} value - Shorthand string, literal, or ValueSource object.
   * @returns {ValueSource} Defaulting to LITERAL if no prefix matches.
   * @private
   */
  _parseShorthand(value) {
    // If already a ValueSource or object with type, return as-is
    if (value instanceof ValueSource) {
      return value;
    }

    if (value && typeof value === 'object' && value.type) {
      return ValueSource.fromConfig(value);
    }

    // Non-string values are literals
    if (typeof value !== 'string') {
      return ValueSource.literal(value);
    }

    // Parse string shorthands
    const trimmed = value.trim();

    // $timestamp or $timestamp:format
    if (trimmed.startsWith('$timestamp')) {
      const parts = trimmed.split(':');
      const format = parts.length > 1 ? parts.slice(1).join(':') : null;
      return ValueSource.timestamp(format);
    }

    // $step.output.key
    if (trimmed.startsWith('$step.output.')) {
      const key = trimmed.substring('$step.output.'.length);
      return ValueSource.stepOutput(key);
    }

    // $step.key (alias for $step.output.key)
    if (trimmed.startsWith('$step.')) {
      const key = trimmed.substring('$step.'.length);
      return ValueSource.stepOutput(key);
    }

    // $context.path
    if (trimmed.startsWith('$context.')) {
      const path = trimmed.substring('$context.'.length);
      return ValueSource.context(path);
    }

    // $pipeline.path (alias for $context.)
    if (trimmed.startsWith('$pipeline.')) {
      const path = trimmed.substring('$pipeline.'.length);
      return ValueSource.context(path);
    }

    // $expr:expression
    if (trimmed.startsWith('$expr:')) {
      const expr = trimmed.substring('$expr:'.length);
      return ValueSource.expression(expr);
    }

    // Default: treat as literal
    return ValueSource.literal(value);
  }

  /**
   * @function _performUpdate
   * @description Parses shorthands, resolves values, and applies changes to the record.
   * @param {Object} record - Target record POJO.
   * @param {Object} tableService - SheetDB table service.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {PostProcessorResult} Success result with change log.
   * @protected
   */
  _performUpdate(record, tableService, context) {
    const { fields, table } = this._config;
    const result = PostProcessorResult.success(this.id);
    const primaryKey = this._getPrimaryKeyValue(record, tableService);

    const fieldEntries = Object.entries(fields);
    this._logger.debug(`[${this.id}] Updating ${fieldEntries.length} fields in ${table}`);

    // Process each field
    for (const [column, rawValue] of fieldEntries) {
      const oldValue = record[column];

      // Parse shorthand and resolve value
      const valueSource = this._parseShorthand(rawValue);
      const newValue = this._valueResolver.resolve(valueSource, context);

      // Update the record
      record[column] = newValue;

      // Track the change
      result.addChange('FIELD_UPDATE', `${table}.${column}`, newValue, oldValue);

      this._logger.debug(
        `[${this.id}] Updated ${table}.${column}: ${JSON.stringify(oldValue)} -> ${JSON.stringify(newValue)}`
      );
    }

    // Persist changes
    if (tableService.updateRowById && primaryKey !== null) {
      tableService.updateRowById(primaryKey, record);
    } else if (tableService.updateRow && primaryKey !== null) {
      tableService.updateRow(primaryKey, record);
    } else if (this._database?.save) {
      this._database.save();
    }

    result.metadata.table = table;
    result.metadata.primaryKey = primaryKey;
    result.metadata.fieldCount = fieldEntries.length;

    return result;
  }
}
