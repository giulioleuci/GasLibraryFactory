/**
 * @file PipelineFramework/src/postprocessor/builtin/CounterUpdatePostProcessor.js
 * @description Post-processor for incrementing/decrementing counter fields.
 * @version 1.0.0
 */

import { BaseUpdatePostProcessor } from './BaseUpdatePostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ConfigurationError } from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @enum {string}
 * @readonly
 * @description Atomic mathematical operations for counter fields.
 */
export const CounterOperation = Object.freeze({
  /** Increment by specified amount. */
  INCREMENT: 'INCREMENT',
  /** Decrement by specified amount. */
  DECREMENT: 'DECREMENT',
  /** Explicitly set to specified value. */
  SET: 'SET'
});

/**
 * @class CounterUpdatePostProcessor
 * @extends BaseUpdatePostProcessor
 * @description Post-processor for atomic-like increments/decrements (e.g., retry counts, attempts).
 *
 * @example
 * {
 *   table: 'DOCUMENTS',
 *   recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'pipeline.docId' },
 *   counter: { column: 'processCount', operation: 'INCREMENT', amount: 1 }
 * }
 */
export class CounterUpdatePostProcessor extends BaseUpdatePostProcessor {
  /**
   * @constructor
   * @param {string} id - Unique processor ID.
   * @param {Object} config - Configuration.
   * @param {string} config.table - Target table.
   * @param {Object} config.recordIdentifier - Identifier strategy.
   * @param {Object} config.counter - Counter logic.
   * @param {string} config.counter.column - Target numeric column.
   * @param {string} config.counter.operation - CounterOperation value.
   * @param {number|Object} [config.counter.amount=1] - Numeric step or ValueSource.
   * @param {Object} [services={}] - Injected dependencies.
   */
  constructor(id, config = {}, services = {}) {
    super(id, 'CounterUpdatePostProcessor', config, services);
  }

  /**
   * @function _validateConfig
   * @description Validates 'counter' presence and strategy fields.
   * @throws {ConfigurationError} If 'counter', 'column', or 'operation' is invalid.
   * @protected
   */
  _validateConfig() {
    // Validate base configuration
    super._validateConfig();

    const { counter } = this._config;

    if (!counter || typeof counter !== 'object') {
      throw new ConfigurationError('counter is required and must be an object', {
        processorId: this.id,
        field: 'counter'
      });
    }

    if (!counter.column || typeof counter.column !== 'string') {
      throw new ConfigurationError('counter.column is required and must be a string', {
        processorId: this.id,
        field: 'counter.column'
      });
    }

    if (!counter.operation || !Object.values(CounterOperation).includes(counter.operation)) {
      throw new ConfigurationError(
        `counter.operation must be one of: ${Object.values(CounterOperation).join(', ')}`,
        {
          processorId: this.id,
          field: 'counter.operation',
          actual: counter.operation
        }
      );
    }
  }

  /**
   * @function _resolveAmount
   * @description Resolves numeric amount from static value or ValueSource.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {number} Defaulting to 1 if unresolved.
   * @private
   */
  _resolveAmount(context) {
    const { counter } = this._config;
    const amount = counter.amount;

    // Default to 1
    if (amount === undefined || amount === null) {
      return 1;
    }

    // If it's a number, use it directly
    if (typeof amount === 'number') {
      return amount;
    }

    // If it's an object (ValueSource), resolve it
    if (typeof amount === 'object') {
      const resolved = this._valueResolver.resolve(amount, context);
      return Number(resolved) || 0;
    }

    return 1;
  }

  /**
   * @function _performUpdate
   * @description Applies mathematical operation to record field and persists.
   * @param {Object} record - Target record POJO.
   * @param {Object} tableService - SheetDB table service.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {PostProcessorResult} Success result with delta metadata.
   * @protected
   */
  _performUpdate(record, tableService, context) {
    const { counter, table } = this._config;
    const { column, operation } = counter;
    const result = PostProcessorResult.success(this.id);
    const primaryKey = this._getPrimaryKeyValue(record, tableService);

    // Get current value (default to 0 if not set)
    const currentValue = Number(record[column]) || 0;
    const amount = this._resolveAmount(context);

    // Calculate new value based on operation
    let newValue;
    switch (operation) {
      case CounterOperation.INCREMENT:
        newValue = currentValue + amount;
        break;

      case CounterOperation.DECREMENT:
        newValue = currentValue - amount;
        break;

      case CounterOperation.SET:
        newValue = amount;
        break;

      default:
        newValue = currentValue;
    }

    this._logger.debug(
      `[${this.id}] Counter ${operation}: ${column} ${currentValue} -> ${newValue} (amount: ${amount})`
    );

    // Update the record
    record[column] = newValue;

    // Track the change
    result.addChange(`COUNTER_${operation}`, `${table}.${column}`, newValue, currentValue);

    // Persist changes
    if (tableService.updateRowById && primaryKey !== null) {
      tableService.updateRowById(primaryKey, record);
    } else if (tableService.updateRow && primaryKey !== null) {
      tableService.updateRow(primaryKey, record);
    } else if (this._database?.save) {
      this._database.save();
    }

    result.metadata.table = table;
    result.metadata.column = column;
    result.metadata.operation = operation;
    result.metadata.previousValue = currentValue;
    result.metadata.newValue = newValue;
    result.metadata.amount = amount;

    return result;
  }
}
