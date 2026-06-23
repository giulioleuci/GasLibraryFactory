/**
 * @file PipelineFramework/src/postprocessor/errors/PostProcessorError.js
 * @description Error classes for post-processor operations.
 * @version 1.0.0
 */

import { BaseError } from '@CoreUtilsLib';

/**
 * @class PostProcessorError
 * @extends BaseError
 * @description Base exception for all post-processor operations.
 */
export class PostProcessorError extends BaseError {
  /**
   * @constructor
   * @param {string} message - Error details.
   * @param {Object} [context={}] - Metadata (processorId, processorType).
   * @param {Error} [cause] - Root cause exception.
   */
  constructor(message, context = {}, cause = null) {
    super(message, 'POST_PROCESSOR_ERROR', context, cause);
    this.name = 'PostProcessorError';
  }
}

/**
 * @class ConfigurationError
 * @extends PostProcessorError
 * @description Thrown when processor configuration fails validation.
 */
export class ConfigurationError extends PostProcessorError {
  /**
   * @constructor
   * @param {string} message - Validation failure message.
   * @param {Object} [context={}] - Details (field, expected, actual).
   * @param {Error} [cause] - Original error.
   */
  constructor(message, context = {}, cause = null) {
    super(message, context, cause);
    this.name = 'ConfigurationError';
    this.code = 'PP_CONFIGURATION_ERROR';
  }
}

/**
 * @class ExecutionError
 * @extends PostProcessorError
 * @description Thrown when runtime execution of a post-processor fails.
 */
export class ExecutionError extends PostProcessorError {
  /**
   * @constructor
   * @param {string} message - Runtime failure details.
   * @param {Object} [context={}] - Context (operation, table, column).
   * @param {Error} [cause] - Wrapped exception.
   */
  constructor(message, context = {}, cause = null) {
    super(message, context, cause);
    this.name = 'ExecutionError';
    this.code = 'PP_EXECUTION_ERROR';
  }
}

/**
 * @class RecordNotFoundError
 * @extends PostProcessorError
 * @description Thrown when the target database record cannot be identified.
 */
export class RecordNotFoundError extends PostProcessorError {
  /**
   * @constructor
   * @param {string} table - Target table name.
   * @param {Object} identifier - Strategy-specific record identifier.
   * @param {Object} [context={}] - Additional metadata.
   */
  constructor(table, identifier, context = {}) {
    super(`Record not found in table '${table}'`, {
      ...context,
      table,
      identifier
    });
    this.name = 'RecordNotFoundError';
    this.code = 'PP_RECORD_NOT_FOUND';
    this.table = table;
    this.identifier = identifier;
  }
}

/**
 * @class ValueResolutionError
 * @extends PostProcessorError
 * @description Thrown when a ValueSource (context/step/expr) fails to resolve.
 */
export class ValueResolutionError extends PostProcessorError {
  /**
   * @constructor
   * @param {string} sourceType - ValueSourceType string.
   * @param {string} source - Path, key, or expression string.
   * @param {Object} [context={}] - Resolution context details.
   * @param {Error} [cause] - Underlying evaluation error.
   */
  constructor(sourceType, source, context = {}, cause = null) {
    super(
      `Failed to resolve value from ${sourceType}: '${source}'`,
      {
        ...context,
        sourceType,
        source
      },
      cause
    );
    this.name = 'ValueResolutionError';
    this.code = 'PP_VALUE_RESOLUTION_ERROR';
    this.sourceType = sourceType;
    this.source = source;
  }
}

/**
 * @class ProcessorNotFoundError
 * @extends PostProcessorError
 * @description Thrown when an unregistered processor type is requested.
 */
export class ProcessorNotFoundError extends PostProcessorError {
  /**
   * @constructor
   * @param {string} processorType - Requested type name.
   * @param {string[]} [availableTypes=[]] - List of registered types.
   */
  constructor(processorType, availableTypes = []) {
    super(`Post-processor type '${processorType}' not found`, {
      processorType,
      availableTypes
    });
    this.name = 'ProcessorNotFoundError';
    this.code = 'PP_PROCESSOR_NOT_FOUND';
    this.processorType = processorType;
    this.availableTypes = availableTypes;
  }
}
