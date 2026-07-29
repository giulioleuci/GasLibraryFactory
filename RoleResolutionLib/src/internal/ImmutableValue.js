import { cloneDeep } from '@CoreUtilsLib';

function freezeDeep(value, seen = new WeakSet()) {
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
    value[key] = freezeDeep(value[key], seen);
  });
  return Object.freeze(value);
}

/** Creates a defensive deep clone with immutable, serialization-safe metadata values. */
export function cloneAndFreeze(value) {
  return freezeDeep(cloneDeep(value));
}
