/**
 * @file PipelineFramework/src/postprocessor/builtin/BaseUpdatePostProcessor.js
 * @description Base class for database update post-processors.
 * @version 1.0.0
 */

import { PostProcessor } from '../PostProcessor';
import { ValueResolver } from '../ValueResolver';
import {
  ConfigurationError,
  RecordNotFoundError
} from '../../internal/postprocessor-errors/PostProcessorError';

/**
 * @enum {string}
 * @readonly
 * @description Strategies for identifying database records for updates.
 */
export const RecordIdentifierStrategy = Object.freeze({
  /** Identify by unique primary key. */
  PRIMARY_KEY: 'PRIMARY_KEY',
  /** Identify by filtering table columns. */
  FILTER: 'FILTER',
  /** Identify by existing object in context. */
  CONTEXT_REF: 'CONTEXT_REF'
});

/**
 * @class BaseUpdatePostProcessor
 * @extends PostProcessor
 * @abstract
 * @description Base orchestrator for post-processors performing database updates.
 */
export class BaseUpdatePostProcessor extends PostProcessor {
  /**
   * @constructor
   * @param {string} id - Unique processor ID.
   * @param {string} name - Display name.
   * @param {Object} config - Configuration.
   * @param {string} config.table - Target table name.
   * @param {Object} config.recordIdentifier - Identifier configuration.
   * @param {Object} [services={}] - Injected dependencies.
   * @param {Object} [services.database] - SheetDB database instance.
   * @param {Object} [services.expressionEngine] - JSEP engine.
   * @param {Object} [services.logger] - Logger instance.
   */
  constructor(id, name, config = {}, services = {}) {
    super(id, name, config, services);

    /** @type {Object|null} @protected */
    this._database = services.database || null;

    /** @type {ValueResolver} @protected */
    this._valueResolver = new ValueResolver({
      logger: this._logger,
      expressionEngine: services.expressionEngine,
      utils: services.utils
    });
  }

  /**
   * @function _validateConfig
   * @description Validates table and recordIdentifier presence/types.
   * @throws {ConfigurationError} If 'table' or 'recordIdentifier' is invalid.
   * @protected
   */
  _validateConfig() {
    const { table, recordIdentifier } = this._config;

    if (!table || typeof table !== 'string') {
      throw new ConfigurationError('table is required and must be a string', {
        processorId: this.id,
        field: 'table'
      });
    }

    if (!recordIdentifier || typeof recordIdentifier !== 'object') {
      throw new ConfigurationError('recordIdentifier is required and must be an object', {
        processorId: this.id,
        field: 'recordIdentifier'
      });
    }

    const { strategy } = recordIdentifier;
    if (!strategy || !Object.values(RecordIdentifierStrategy).includes(strategy)) {
      throw new ConfigurationError(
        `recordIdentifier.strategy must be one of: ${Object.values(RecordIdentifierStrategy).join(', ')}`,
        {
          processorId: this.id,
          field: 'recordIdentifier.strategy',
          actual: strategy
        }
      );
    }

    // Validate strategy-specific requirements
    this._validateRecordIdentifier(recordIdentifier);
  }

  /**
   * @function _validateRecordIdentifier
   * @description Validates specific identifier strategy parameters.
   * @param {Object} identifier - Strategy config.
   * @throws {ConfigurationError} If required strategy fields are missing.
   * @protected
   */
  _validateRecordIdentifier(identifier) {
    const { strategy } = identifier;

    switch (strategy) {
      case RecordIdentifierStrategy.PRIMARY_KEY:
        if (!identifier.primaryKeySource) {
          throw new ConfigurationError(
            'recordIdentifier.primaryKeySource is required for PRIMARY_KEY strategy',
            { processorId: this.id, field: 'recordIdentifier.primaryKeySource' }
          );
        }
        break;

      case RecordIdentifierStrategy.FILTER:
        if (!identifier.filter) {
          throw new ConfigurationError('recordIdentifier.filter is required for FILTER strategy', {
            processorId: this.id,
            field: 'recordIdentifier.filter'
          });
        }
        break;

      case RecordIdentifierStrategy.CONTEXT_REF:
        if (!identifier.contextPath) {
          throw new ConfigurationError(
            'recordIdentifier.contextPath is required for CONTEXT_REF strategy',
            { processorId: this.id, field: 'recordIdentifier.contextPath' }
          );
        }
        break;
    }
  }

  /**
   * @function _findRecord
   * @description Locates record using configured strategy and database service.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {Object|null} Found record or null if not found/no DB.
   * @protected
   */
  _findRecord(context) {
    const { table, recordIdentifier } = this._config;

    if (!this._database) {
      this._logger.warn(`[${this.id}] No database service provided, cannot find record`);
      return null;
    }

    const tableService = this._database.tables?.[table];
    if (!tableService) {
      this._logger.warn(`[${this.id}] Table '${table}' not found in database`);
      return null;
    }

    switch (recordIdentifier.strategy) {
      case RecordIdentifierStrategy.PRIMARY_KEY:
        return this._findByPrimaryKey(tableService, recordIdentifier, context);

      case RecordIdentifierStrategy.FILTER:
        return this._findByFilter(tableService, recordIdentifier, context);

      case RecordIdentifierStrategy.CONTEXT_REF:
        return this._findByContextRef(recordIdentifier, context);

      default:
        return null;
    }
  }

  /**
   * @function _findByPrimaryKey
   * @description Resolves PK from context and fetches via table service.
   * @param {Object} tableService - SheetDB table service.
   * @param {Object} identifier - Strategy config.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {Object|null}
   * @private
   */
  _findByPrimaryKey(tableService, identifier, context) {
    const primaryKey = this._valueResolver.resolve(
      { type: 'CONTEXT', contextPath: identifier.primaryKeySource },
      context
    );

    if (!primaryKey) {
      this._logger.warn(
        `[${this.id}] Could not resolve primary key from: ${identifier.primaryKeySource}`
      );
      return null;
    }

    if (typeof tableService.getRowById === 'function') {
      return tableService.getRowById(primaryKey) || null;
    } else if (typeof tableService.getByPK === 'function') {
      return tableService.getByPK(primaryKey) || null;
    } else if (typeof tableService.getByPrimaryKey === 'function') {
      return tableService.getByPrimaryKey(primaryKey) || null;
    }

    return null;
  }

  /**
   * @function _findByFilter
   * @description Fetches record using column filters.
   * @param {Object} tableService - SheetDB table service.
   * @param {Object} identifier - Strategy config.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {Object|null}
   * @private
   */
  _findByFilter(tableService, identifier, context) {
    const { filter } = identifier;
    const value = filter.valueSource
      ? this._valueResolver.resolve(filter.valueSource, context)
      : filter.value;

    const results = tableService
      .select?.(['*'])
      .where(filter.column, filter.operator || '=', value)
      .execute?.();

    return results && results.length > 0 ? results[0] : null;
  }

  /**
   * @function _findByContextRef
   * @description Retrieves record object directly from pipeline data.
   * @param {Object} identifier - Strategy config.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {Object|null}
   * @private
   */
  _findByContextRef(identifier, context) {
    return context.getPipelineData(identifier.contextPath);
  }

  /**
   * @function _getPrimaryKeyValue
   * @description Extracts PK from record object using metadata or common field names.
   * @param {Object} record - Record POJO.
   * @param {Object} tableService - SheetDB table service.
   * @returns {*} PK value or null.
   * @protected
   */
  _getPrimaryKeyValue(record, tableService) {
    // Try common primary key names
    const pkFields = ['id', 'ID', '_id', 'pk', 'primaryKey'];

    // Check if table service has primary key info
    if (tableService.getPrimaryKeyColumn) {
      const pkColumn = tableService.getPrimaryKeyColumn();
      if (pkColumn && record[pkColumn] !== undefined) {
        return record[pkColumn];
      }
    }

    // Fallback to common names
    for (const field of pkFields) {
      if (record[field] !== undefined) {
        return record[field];
      }
    }

    return null;
  }

  /**
   * @function _performUpdate
   * @abstract
   * @description Implements specific update logic (subclass override).
   * @param {Object} record - Record to update.
   * @param {Object} tableService - SheetDB table service.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {PostProcessorResult}
   * @throws {Error} If not implemented.
   * @protected
   */
  _performUpdate(_record, _tableService, _context) {
    throw new Error(
      `BaseUpdatePostProcessor._performUpdate must be implemented by subclass: ${this.name}`
    );
  }

  /**
   * @function _executeImpl
   * @description Orchestrates find -> update flow.
   * @param {PostProcessorContext} context - Execution context.
   * @returns {PostProcessorResult}
   * @throws {RecordNotFoundError} If record cannot be found.
   * @throws {ConfigurationError} If table service is missing.
   * @protected
   */
  _executeImpl(context) {
    const { table } = this._config;

    // Find the record
    const record = this._findRecord(context);

    if (!record) {
      throw new RecordNotFoundError(table, this._config.recordIdentifier);
    }

    // Get table service
    const tableService = this._database?.tables?.[table];

    if (!tableService) {
      throw new ConfigurationError(`Table '${table}' not found in database`, {
        processorId: this.id,
        table
      });
    }

    // Perform the update
    return this._performUpdate(record, tableService, context);
  }
}
