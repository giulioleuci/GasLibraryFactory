import type { ImmutableValue } from '../types.js';
import { cloneDeep } from '@CoreUtilsLib';

function freezeDeep(value: unknown, seen = new WeakSet<object>()): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  Object.keys(value).forEach((key) => {
    (value as Record<string, unknown>)[key] = freezeDeep(
      (value as Record<string, unknown>)[key],
      seen
    );
  });
  return Object.freeze(value);
}

/** Creates a defensive deep clone with immutable, serialization-safe metadata values. */
export function cloneAndFreeze<T>(value: T): ImmutableValue<T> {
  return freezeDeep(cloneDeep(value)) as ImmutableValue<T>;
}
