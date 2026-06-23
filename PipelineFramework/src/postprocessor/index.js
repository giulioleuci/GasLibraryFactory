/**
 * @file PipelineFramework/src/postprocessor/index.js
 * @description PostProcessor module exports.
 * @version 1.0.0
 */

// Core types and enums
export { WhenCondition, isValidWhenCondition } from './WhenCondition';
export { ValueSource, ValueSourceType, isValidValueSourceType } from './ValueSource';

// Core classes
export { PostProcessorContext } from './PostProcessorContext';
export { PostProcessorResult } from './PostProcessorResult';
export { PostProcessor } from './PostProcessor';
export { PostProcessorChain } from './PostProcessorChain';
export { PostProcessorRegistry } from './PostProcessorRegistry';
export { ValueResolver } from './ValueResolver';

// Built-in processors
export {
  BaseUpdatePostProcessor,
  RecordIdentifierStrategy
} from './builtin/BaseUpdatePostProcessor';
export { CellUpdatePostProcessor } from './builtin/CellUpdatePostProcessor';
export { LogAuditPostProcessor } from './builtin/LogAuditPostProcessor';
export { CounterUpdatePostProcessor, CounterOperation } from './builtin/CounterUpdatePostProcessor';
export { FieldUpdatePostProcessor } from './builtin/FieldUpdatePostProcessor';

// Local imports for createDefaultRegistry
import { PostProcessorRegistry as _PostProcessorRegistry } from './PostProcessorRegistry';
import { CellUpdatePostProcessor as _CellUpdatePostProcessor } from './builtin/CellUpdatePostProcessor';
import { LogAuditPostProcessor as _LogAuditPostProcessor } from './builtin/LogAuditPostProcessor';
import { CounterUpdatePostProcessor as _CounterUpdatePostProcessor } from './builtin/CounterUpdatePostProcessor';
import { FieldUpdatePostProcessor as _FieldUpdatePostProcessor } from './builtin/FieldUpdatePostProcessor';

// Errors
export {
  PostProcessorError,
  ConfigurationError,
  ExecutionError,
  RecordNotFoundError,
  ValueResolutionError,
  ProcessorNotFoundError
} from '../internal/postprocessor-errors/PostProcessorError';

/**
 * @function createDefaultRegistry
 * @description Factory for PostProcessorRegistry pre-loaded with 'CellUpdate', 'LogAudit', 'CounterUpdate', and 'FieldUpdate'.
 * @param {Object} [options={}] - Registry initialization options.
 * @returns {PostProcessorRegistry} Registry with built-in processors mapped.
 */
export function createDefaultRegistry(options = {}) {
  const registry = new _PostProcessorRegistry(options);

  registry
    .register('CellUpdate', _CellUpdatePostProcessor)
    .register('LogAudit', _LogAuditPostProcessor)
    .register('CounterUpdate', _CounterUpdatePostProcessor)
    .register('FieldUpdate', _FieldUpdatePostProcessor);

  return registry;
}
