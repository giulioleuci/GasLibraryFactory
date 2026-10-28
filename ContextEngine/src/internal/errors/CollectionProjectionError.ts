import { ContextEngineError } from './ContextEngineError.js';

/**
 * Signals invalid declarative collection-projection configuration or execution.
 */
export class CollectionProjectionError extends ContextEngineError {
  constructor(
    message: string,
    context: Record<string, unknown> & {
      operationIndex?: number | null;
      targetPath?: string | null;
    } = {}
  ) {
    super(message, {
      operationIndex: context.operationIndex == null ? null : context.operationIndex,
      targetPath: context.targetPath == null ? null : context.targetPath,
      ...context
    });
    this.name = 'CollectionProjectionError';
  }
}
