import type {
  ProjectionStrategy,
  ProjectionOperation,
  ProjectionRuntime
} from '../internal/contracts.js';
import { CollectionProjectionError } from '../internal/errors/CollectionProjectionError.js';

/**
 * Registry for application-supplied, synchronous collection projection strategies.
 */
export class ProjectionRegistry {
  declare _strategies: Map<string, ProjectionStrategy>;
  constructor() {
    this._strategies = new Map();
  }

  register<Value = unknown>(
    name: string,
    strategy: (value: Value, operation: ProjectionOperation, runtime: ProjectionRuntime) => unknown
  ) {
    if (!name || typeof name !== 'string') {
      throw new CollectionProjectionError('Projection strategy name must be a non-empty string');
    }
    if (typeof strategy !== 'function') {
      throw new CollectionProjectionError(`Projection strategy '${name}' must be a function`);
    }
    if (this._strategies.has(name)) {
      throw new CollectionProjectionError(`Projection strategy '${name}' is already registered`);
    }
    this._strategies.set(name, strategy as ProjectionStrategy);
    return this;
  }

  get(name: string) {
    return this._strategies.get(name) || null;
  }

  has(name: string) {
    return this._strategies.has(name);
  }
}
