import { CollectionProjectionError } from '../internal/errors/CollectionProjectionError';
import { ProjectionRegistry } from './ProjectionRegistry';

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function copy(value) {
  if (Array.isArray(value)) {
    return value.map(copy);
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (value && typeof value === 'object') {
    const clone = {};
    Object.keys(value).forEach((key) => {
      clone[key] = copy(value[key]);
    });
    return clone;
  }
  return value;
}

function keyFor(values) {
  return JSON.stringify(values.map((value) => [typeof value, value]));
}

/**
 * Runs declarative, synchronous projections without mutating the source collection.
 */
export class CollectionProjector {
  constructor({
    registry = new ProjectionRegistry(),
    expressionEngine = null,
    logger = null
  } = {}) {
    if (!registry || typeof registry.get !== 'function') {
      throw new Error('CollectionProjector: registry must provide get(name)');
    }
    if (expressionEngine !== null && typeof expressionEngine.evaluate !== 'function') {
      throw new Error(
        'CollectionProjector: expressionEngine must provide evaluate(expression, context)'
      );
    }
    this._registry = registry;
    this._expressionEngine = expressionEngine;
    this._logger = logger;
  }

  project(inputArray, operations, runtimeContext = {}) {
    const targetPath =
      runtimeContext && runtimeContext.targetPath ? runtimeContext.targetPath : null;
    if (!Array.isArray(inputArray)) {
      throw this._error('Projection input must be an array', -1, targetPath);
    }
    if (!Array.isArray(operations)) {
      throw this._error('Projection operations must be an array', -1, targetPath);
    }

    let value = copy(inputArray);
    const trace = [];
    operations.forEach((operation, index) => {
      const inputCount = value.length;
      try {
        value = this._apply(value, operation, runtimeContext || {}, index, targetPath);
      } catch (error) {
        if (error instanceof CollectionProjectionError) {
          throw error;
        }
        throw this._error(error.message, index, targetPath, error);
      }
      trace.push({
        index,
        type: operation && operation.type,
        inputCount,
        outputCount: value.length
      });
    });

    return { value: copy(value), trace };
  }

  _apply(value, operation, runtime, index, targetPath) {
    if (!operation || typeof operation !== 'object' || Array.isArray(operation)) {
      throw this._error('Projection operation must be an object', index, targetPath);
    }
    switch (operation.type) {
      case 'filter':
        return this._filter(value, operation, runtime, index, targetPath);
      case 'map':
        return this._map(value, operation, index, targetPath);
      case 'flatMap':
        return this._flatMap(value, operation, runtime, index, targetPath);
      case 'groupBy':
        return this._groupBy(value, operation, index, targetPath);
      case 'distinctBy':
        return this._distinctBy(value, operation, index, targetPath);
      case 'sortBy':
        return this._sortBy(value, operation, index, targetPath);
      case 'prepend':
      case 'append':
        return this._insert(value, operation, runtime, index, targetPath);
      case 'strategy':
        return this._strategy(value, operation, runtime, index, targetPath);
      default:
        throw this._error(`Unknown projection operation '${operation.type}'`, index, targetPath);
    }
  }

  _filter(value, operation, runtime, index, targetPath) {
    if (!operation.expression || typeof operation.expression !== 'string') {
      throw this._error('filter.expression must be a non-empty string', index, targetPath);
    }
    return value.filter((item, itemIndex) =>
      this._evaluate(
        operation.expression,
        this._itemRuntime(runtime, item, itemIndex),
        index,
        targetPath
      )
    );
  }

  _map(value, operation, index, targetPath) {
    if (
      !operation.fields ||
      typeof operation.fields !== 'object' ||
      Array.isArray(operation.fields)
    ) {
      throw this._error('map.fields must be an object', index, targetPath);
    }
    return value.map((item) => {
      const mapped = {};
      Object.keys(operation.fields).forEach((field) => {
        const config = operation.fields[field];
        if (!config || typeof config !== 'object' || Array.isArray(config)) {
          throw this._error(`map.fields.${field} must be an object`, index, targetPath);
        }
        if (typeof config.from === 'string') {
          mapped[field] = copy(this._read(item, config.from, index, targetPath));
        } else if (hasOwn(config, 'value')) {
          mapped[field] = copy(config.value);
        } else {
          throw this._error(`map.fields.${field} requires 'from' or 'value'`, index, targetPath);
        }
      });
      return mapped;
    });
  }

  _flatMap(value, operation, runtime, index, targetPath) {
    if (!operation.path && !operation.strategy) {
      throw this._error('flatMap requires a path or strategy', index, targetPath);
    }
    const projected = [];
    value.forEach((parent, itemIndex) => {
      const source = operation.path
        ? this._read(parent, operation.path, index, targetPath)
        : copy(parent);
      const nested = operation.strategy
        ? this._runStrategy(
            operation.strategy,
            source,
            operation,
            this._itemRuntime(runtime, parent, itemIndex),
            index,
            targetPath
          )
        : source;
      if (!Array.isArray(nested)) {
        throw this._error('flatMap source must resolve to an array', index, targetPath);
      }
      nested.forEach((child) => {
        if (operation.mergeParent) {
          if (
            !parent ||
            typeof parent !== 'object' ||
            Array.isArray(parent) ||
            !child ||
            typeof child !== 'object' ||
            Array.isArray(child)
          ) {
            throw this._error(
              'flatMap.mergeParent requires object parent and child values',
              index,
              targetPath
            );
          }
          projected.push({ ...copy(parent), ...copy(child) });
        } else {
          projected.push(copy(child));
        }
      });
    });
    return projected;
  }

  _groupBy(value, operation, index, targetPath) {
    const keys = this._keys(operation.keys, 'groupBy.keys', index, targetPath);
    if (
      !operation.aggregates ||
      typeof operation.aggregates !== 'object' ||
      Array.isArray(operation.aggregates)
    ) {
      throw this._error('groupBy.aggregates must be an object', index, targetPath);
    }
    const groups = new Map();
    value.forEach((item) => {
      const keyValues = keys.map((path) => this._read(item, path, index, targetPath));
      const groupKey = keyFor(keyValues);
      if (!groups.has(groupKey)) {
        groups.set(groupKey, { keyValues, items: [] });
      }
      groups.get(groupKey).items.push(item);
    });
    return Array.from(groups.values()).map((group) => {
      const result = {};
      keys.forEach((path, keyIndex) => {
        result[path] = copy(group.keyValues[keyIndex]);
      });
      Object.keys(operation.aggregates).forEach((name) => {
        result[name] = this._aggregate(group.items, operation.aggregates[name], index, targetPath);
      });
      return result;
    });
  }

  _aggregate(items, config, index, targetPath) {
    if (
      !config ||
      typeof config !== 'object' ||
      Array.isArray(config) ||
      typeof config.type !== 'string'
    ) {
      throw this._error('Invalid aggregate configuration', index, targetPath);
    }
    const needsPath = ['collect', 'collectDistinct', 'first', 'last', 'sum'].includes(config.type);
    if (needsPath && (!config.path || typeof config.path !== 'string')) {
      throw this._error(`Aggregate '${config.type}' requires a path`, index, targetPath);
    }
    const values = needsPath
      ? items.map((item) => this._read(item, config.path, index, targetPath))
      : [];
    switch (config.type) {
      case 'count':
        return items.length;
      case 'collect':
        return values.map(copy);
      case 'collectDistinct': {
        const seen = new Set();
        return values
          .filter((item) => {
            const key = keyFor([item]);
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
            return true;
          })
          .map(copy);
      }
      case 'first':
        return values.length ? copy(values[0]) : null;
      case 'last':
        return values.length ? copy(values[values.length - 1]) : null;
      case 'sum':
        if (values.some((item) => typeof item !== 'number')) {
          throw this._error('sum aggregate requires numeric values', index, targetPath);
        }
        return values.reduce((total, item) => total + item, 0);
      default:
        throw this._error(`Unsupported aggregate type '${config.type}'`, index, targetPath);
    }
  }

  _distinctBy(value, operation, index, targetPath) {
    const keys = this._keys(operation.keys, 'distinctBy.keys', index, targetPath);
    const seen = new Set();
    return value
      .filter((item) => {
        const key = keyFor(keys.map((path) => this._read(item, path, index, targetPath)));
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .map(copy);
  }

  _sortBy(value, operation, index, targetPath) {
    if (!Array.isArray(operation.keys) || operation.keys.length === 0) {
      throw this._error('sortBy.keys must be a non-empty array', index, targetPath);
    }
    const keys = operation.keys.map((config) => {
      if (
        !config ||
        typeof config.path !== 'string' ||
        !['ASC', 'DESC'].includes(config.direction)
      ) {
        throw this._error('sortBy keys require path and ASC or DESC direction', index, targetPath);
      }
      return config;
    });
    return value
      .map((item, itemIndex) => ({ item, itemIndex }))
      .sort((left, right) => {
        for (const key of keys) {
          const leftValue = this._read(left.item, key.path, index, targetPath);
          const rightValue = this._read(right.item, key.path, index, targetPath);
          if (leftValue === rightValue) {
            continue;
          }
          const comparison = leftValue < rightValue ? -1 : 1;
          return key.direction === 'ASC' ? comparison : -comparison;
        }
        return left.itemIndex - right.itemIndex;
      })
      .map(({ item }) => copy(item));
  }

  _insert(value, operation, runtime, index, targetPath) {
    if (!hasOwn(operation, 'value')) {
      throw this._error(`${operation.type}.value is required`, index, targetPath);
    }
    if (hasOwn(operation, 'when')) {
      if (typeof operation.when !== 'string' || operation.when.trim() === '') {
        throw this._error(`${operation.type}.when must be a non-empty string`, index, targetPath);
      }
      if (!this._evaluate(operation.when, runtime, index, targetPath)) {
        return value.map(copy);
      }
    }
    const inserted = copy(operation.value);
    return operation.type === 'prepend'
      ? [inserted, ...value.map(copy)]
      : [...value.map(copy), inserted];
  }

  _strategy(value, operation, runtime, index, targetPath) {
    const result = this._runStrategy(operation.name, value, operation, runtime, index, targetPath);
    if (!Array.isArray(result)) {
      throw this._error(`Strategy '${operation.name}' must return an array`, index, targetPath);
    }
    return result.map(copy);
  }

  _runStrategy(name, value, operation, runtime, index, targetPath) {
    if (!name || typeof name !== 'string') {
      throw this._error('Strategy name must be a non-empty string', index, targetPath);
    }
    const strategy = this._registry.get(name);
    if (!strategy) {
      throw this._error(`Unknown projection strategy '${name}'`, index, targetPath);
    }
    const result = strategy(copy(value), copy(operation), runtime);
    return copy(result);
  }

  _evaluate(expression, context, index, targetPath) {
    if (!this._expressionEngine) {
      throw this._error('An expressionEngine is required for expressions', index, targetPath);
    }
    try {
      return this._expressionEngine.evaluate(expression, context) === true;
    } catch (error) {
      throw this._error(`Expression evaluation failed: ${error.message}`, index, targetPath, error);
    }
  }

  _itemRuntime(runtime, item, index) {
    return {
      ...(runtime && typeof runtime === 'object' ? runtime : {}),
      ...(item && typeof item === 'object' && !Array.isArray(item) ? item : {}),
      item: copy(item),
      value: copy(item),
      index
    };
  }

  _keys(keys, label, index, targetPath) {
    if (
      !Array.isArray(keys) ||
      keys.length === 0 ||
      keys.some((path) => !path || typeof path !== 'string')
    ) {
      throw this._error(`${label} must be a non-empty array of paths`, index, targetPath);
    }
    return keys;
  }

  _read(value, path, index, targetPath) {
    if (!path || typeof path !== 'string' || path.split('.').some((part) => !part)) {
      throw this._error(`Invalid path '${path}'`, index, targetPath);
    }
    let current = value;
    path.split('.').forEach((part) => {
      if (
        current === null ||
        current === undefined ||
        typeof current !== 'object' ||
        !hasOwn(current, part)
      ) {
        throw this._error(`Path '${path}' does not exist`, index, targetPath);
      }
      current = current[part];
    });
    return current;
  }

  _error(message, operationIndex, targetPath, originalError = null) {
    return new CollectionProjectionError(message, { operationIndex, targetPath, originalError });
  }
}
