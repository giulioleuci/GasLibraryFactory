/**
 * @file PipelineFramework/src/postprocessor/builtin/LogAuditPostProcessor.js
 * @description Post-processor for inserting audit log records.
 * @version 1.0.0
 */

import { PostProcessor } from '../PostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ValueResolver } from '../ValueResolver';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @class LogAuditPostProcessor
 * @extends PostProcessor
 * @description Inserts audit trail records (who/what/when) into a database table post-step.
 *
 * @example
 * {
 *   table: 'AUDIT_LOG',
 *   fields: [
 *     { column: 'timestamp', value: { type: 'TIMESTAMP' } },
 *     { column: 'action', value: { type: 'LITERAL', literal: 'DOC_GEN' } },
 *     { column: 'userId', value: { type: 'CONTEXT', contextPath: 'pipeline.user.id' } }
 *   ]
 * }
 */
export class LogAuditPostProcessor extends PostProcessor {
  /**
   * @constructor
   * @param {string} id - Unique processor ID.
   * @param {Object} config - Configuration.
   * @param {string} config.table - Target audit table.
   * @param {Array<{column: string, value: Object}>} config.fields - Fields to populate.
   * @param {Object} [services={}] - Injected dependencies.
   * @param {Object} [services.database] - SheetDB database instance.
   * @param {Object} [services.expressionEngine] - JSEP engine.
   * @param {Object} [services.logger] - Logger instance.
   */
  constructor(id, config = {}, services = {}) {
    super(id, 'LogAuditPostProcessor', config, services);

    /** @type {Object|null} @private */
    this._database = services.database || null;

    /** @type {ValueResolver} @private */
    this._valueResolver = new ValueResolver({
      logger: this._logger,
      expressionEngine: services.expressionEngine,
      utils: services.utils
    });
  }

  /**
   * @function _validateConfig
   * @description Validates 'table' and 'fields' non-empty array.
   * @throws {ConfigurationError} If 'table' or 'fields' is invalid or empty.
   * @protected
   */
  _validateConfig() {
    const { table, fields } = this._config;

    if (!table || typeof table !== 'string') {
      throw new ConfigurationError('table is required and must be a string', {
        processorId: this.id,
        field: 'table'
      });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      throw new ConfigurationError('fields is required and must be a non-empty array', {
        processorId: this.id,
        field: 'fields'
      });
    }

    // Validate each field
    fields.forEach((field, index) => {
      if (!field.column || typeof field.column !== 'string') {
        throw new ConfigurationError(`fields[${index}].column is required and must be a string`, {
          processorId: this.id,
          field: `fields[${index}].column`
        });
      }

      if (!field.value) {
        throw new ConfigurationError(`fields[${index}].value is required`, {
          processorId: this.id,
          field: `fields[${index}].value`
        });
      }
    });
  }

  /**
   * @function _executeImpl
   * @description Resolves all configured fields and inserts a new row into the audit table.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {PostProcessorResult} Success result with insertion metadata.
   * @protected
   */
  _executeImpl(context) {
    const { table, fields } = this._config;
    const result = PostProcessorResult.success(this.id);

    this._logger.debug(`[${this.id}] Inserting audit record into ${table}`);

    // Build the audit record
    const record = {};

    for (const field of fields) {
      const { column, value } = field;

      try {
        record[column] = this._valueResolver.resolve(value, context);
      } catch (error) {
        this._logger.warn(
          `[${this.id}] Failed to resolve value for column '${column}': ${error.message}`
        );
        record[column] = null;
      }
    }

    // Add standard audit fields if not provided
    if (!record.timestamp && !record.createdAt) {
      record.createdAt = new Date().toISOString();
    }

    // Insert the record
    let insertedId = null;

    if (this._database?.tables?.[table]) {
      const tableService = this._database.tables[table];

      if (tableService.insertRow) {
        const inserted = tableService.insertRow(record);
        insertedId = inserted?.id || inserted?._id || null;
      }
    } else if (this._database?.insert) {
      // Alternative API
      insertedId = this._database.insert(table, record);
    } else {
      this._logger.warn(`[${this.id}] No database service or table '${table}' not found`);
    }

    // Track the change
    result.addChange('LOG_INSERT', table, record);

    result.metadata.table = table;
    result.metadata.insertedId = insertedId;
    result.metadata.fieldCount = fields.length;

    this._logger.debug(`[${this.id}] Inserted audit record: ${JSON.stringify(record)}`);

    return result;
  }
}
