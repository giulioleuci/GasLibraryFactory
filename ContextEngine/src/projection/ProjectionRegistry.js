import { CollectionProjectionError } from '../internal/errors/CollectionProjectionError';

/**
 * Registry for application-supplied, synchronous collection projection strategies.
 */
export class ProjectionRegistry {
  constructor() {
    this._strategies = new Map();
  }

  register(name, strategy) {
    if (!name || typeof name !== 'string') {
      throw new CollectionProjectionError('Projection strategy name must be a non-empty string');
    }
    if (typeof strategy !== 'function') {
      throw new CollectionProjectionError(`Projection strategy '${name}' must be a function`);
    }
    if (this._strategies.has(name)) {
      throw new CollectionProjectionError(`Projection strategy '${name}' is already registered`);
    }
    this._strategies.set(name, strategy);
    return this;
  }

  get(name) {
    return this._strategies.get(name) || null;
  }

  has(name) {
    return this._strategies.has(name);
  }
}
