import { ContextInterceptor } from './ContextInterceptor';
import { CollectionProjectionError } from '../internal/errors/CollectionProjectionError';

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

/** Applies a CollectionProjector to configured collection paths after selected providers. */
export class CollectionProjectionInterceptor extends ContextInterceptor {
  constructor(logger, projector, config = {}) {
    super(logger);
    if (!projector || typeof projector.project !== 'function') {
      throw new Error('CollectionProjectionInterceptor: projector must provide project()');
    }
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('CollectionProjectionInterceptor: config must be an object');
    }
    ['targetProviders', 'targetPaths', 'operations'].forEach((key) => {
      if (!Array.isArray(config[key])) {
        throw new Error(`CollectionProjectionInterceptor: config.${key} must be an array`);
      }
    });
    if (
      config.targetProviders.some((name) => !name || typeof name !== 'string') ||
      config.targetPaths.some((path) => !path || typeof path !== 'string')
    ) {
      throw new Error(
        'CollectionProjectionInterceptor: target providers and paths must be non-empty strings'
      );
    }
    if (
      config.optionFlag !== undefined &&
      config.optionFlag !== null &&
      typeof config.optionFlag !== 'string'
    ) {
      throw new Error('CollectionProjectionInterceptor: optionFlag must be a string or null');
    }
    this._projector = projector;
    this._targetProviders = config.targetProviders.slice();
    this._targetPaths = config.targetPaths.slice();
    this._operations = config.operations.slice();
    this._optionFlag = config.optionFlag || null;
  }

  _shouldIntercept(name, _data, _context, options) {
    const normalizedOptions = options || {};
    return (
      this._targetProviders.includes(name) &&
      (this._optionFlag === null || normalizedOptions[this._optionFlag] === true)
    );
  }

  _performIntercept(name, data, context, options) {
    this._targetPaths.forEach((targetPath) => {
      const target = this._readTarget(data, targetPath);
      const result = this._projector.project(target, this._operations, {
        ...(options || {}),
        providerName: name,
        context,
        data,
        targetPath
      });
      this._writeTarget(data, targetPath, result.value);
      if (this._logger && typeof this._logger.debug === 'function') {
        this._logger.debug(`[${name}] Collection projection applied to '${targetPath}'`);
      }
    });
    return data;
  }

  _readTarget(data, path) {
    let current = data;
    path.split('.').forEach((part) => {
      if (
        current === null ||
        current === undefined ||
        typeof current !== 'object' ||
        !hasOwn(current, part)
      ) {
        throw new CollectionProjectionError(`Target path '${path}' does not exist`, {
          operationIndex: -1,
          targetPath: path
        });
      }
      current = current[part];
    });
    return current;
  }

  _writeTarget(data, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let current = data;
    parts.forEach((part) => {
      current = current[part];
    });
    current[last] = value;
  }
}
