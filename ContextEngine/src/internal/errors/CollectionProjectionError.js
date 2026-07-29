import { ContextEngineError } from './ContextEngineError';

/**
 * Signals invalid declarative collection-projection configuration or execution.
 */
export class CollectionProjectionError extends ContextEngineError {
  constructor(message, context = {}) {
    super(message, {
      operationIndex: context.operationIndex == null ? null : context.operationIndex,
      targetPath: context.targetPath == null ? null : context.targetPath,
      ...context
    });
    this.name = 'CollectionProjectionError';
  }
}
