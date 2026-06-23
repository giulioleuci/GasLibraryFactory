/**
 * @file PipelineFramework/src/postprocessor/builtin/CellUpdatePostProcessor.js
 * @description Post-processor for updating database cells after step execution.
 * @version 1.0.0
 */

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @class CellUpdatePostProcessor
 * @extends BaseUpdatePostProcessor
 * @description Updates specific database cells (status, timestamps, refs) post-step execution.
 *
 * @example
 * {
 *   table: 'DOCUMENTS',
 *   recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.docId' },
 *   updates: [
 *     { column: 'status', value: { type: 'LITERAL', literal: 'GENERATED' } },
 *     { column: 'url', value: { type: 'STEP_OUTPUT', outputKey: 'docUrl' } },
 *     { column: 'date', value: { type: 'TIMESTAMP' } }
 *   ]
 * }
 */
export class CellUpdatePostProcessor extends BaseUpdatePostProcessor {
  /**
   * @constructor
   * @param {string} id - Unique processor ID.
   * @param {Object} config - Configuration.
   * @param {string} config.table - Target table.
   * @param {Object} config.recordIdentifier - Identifier strategy.
   * @param {Array<{column: string, value: Object}>} config.updates - Cells to update.
   * @param {Object} [services={}] - Injected dependencies.
   */
  constructor(id, config = {}, services = {}) {
    super(id, 'CellUpdatePostProcessor', config, services);
  }

  /**
   * @function _validateConfig
   * @description Validates 'updates' array and internal schema.
   * @throws {ConfigurationError} If 'updates' is missing, empty, or contains invalid entries.
   * @protected
   */
  _validateConfig() {
    // Validate base configuration
    super._validateConfig();

    const { updates } = this._config;

    // Validate updates array
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new ConfigurationError('updates is required and must be a non-empty array', {
        processorId: this.id,
        field: 'updates'
      });
    }

    // Validate each update
    updates.forEach((update, index) => {
      if (!update.column || typeof update.column !== 'string') {
        throw new ConfigurationError(`updates[${index}].column is required and must be a string`, {
          processorId: this.id,
          field: `updates[${index}].column`
        });
      }

      if (!update.value) {
        throw new ConfigurationError(`updates[${index}].value is required`, {
          processorId: this.id,
          field: `updates[${index}].value`
        });
      }
    });
  }

  /**
   * @function _performUpdate
   * @description Resolves values and applies changes to the record and database.
   * @param {Object} record - Target record POJO.
   * @param {Object} tableService - SheetDB table service.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {PostProcessorResult} Success result with change log and metadata.
   * @protected
   */
  _performUpdate(record, tableService, context) {
    const { updates, table } = this._config;
    const result = PostProcessorResult.success(this.id);
    const primaryKey = this._getPrimaryKeyValue(record, tableService);

    this._logger.debug(`[${this.id}] Updating ${updates.length} cells in ${table}`);

    // Resolve and apply each update
    for (const update of updates) {
      const { column } = update;
      const oldValue = record[column];

      // Resolve the new value
      const newValue = this._valueResolver.resolve(update.value, context);

      // Update the record
      record[column] = newValue;

      // Track the change
      result.addChange('CELL_UPDATE', `${table}.${column}`, newValue, oldValue);

      this._logger.debug(
        `[${this.id}] Updated ${table}.${column}: ${JSON.stringify(oldValue)} -> ${JSON.stringify(newValue)}`
      );
    }

    // Persist changes if table service supports it
    if (tableService.updateRow && primaryKey !== null) {
      tableService.updateRow(primaryKey, record);
      this._logger.debug(`[${this.id}] Persisted changes to database`);
    } else if (this._database?.save) {
      // Fallback: mark record dirty and save database
      this._database.save();
      this._logger.debug(`[${this.id}] Saved database changes`);
    }

    result.metadata.table = table;
    result.metadata.primaryKey = primaryKey;
    result.metadata.updateCount = updates.length;

    return result;
  }
}
