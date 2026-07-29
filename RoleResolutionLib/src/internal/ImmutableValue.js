import { cloneDeep } from '@CoreUtilsLib';

const DATE_MUTATORS = Object.freeze([
  'setDate',
  'setFullYear',
  'setHours',
  'setMilliseconds',
  'setMinutes',
  'setMonth',
  'setSeconds',
  'setTime',
  'setUTCDate',
  'setUTCFullYear',
  'setUTCHours',
  'setUTCMilliseconds',
  'setUTCMinutes',
  'setUTCMonth',
  'setUTCSeconds',
  'setYear'
]);

function freezeDate(value) {
  const copy = new Date(value.getTime());
  DATE_MUTATORS.forEach((method) => {
    Object.defineProperty(copy, method, {
      value() {
        throw new TypeError('Cannot mutate an immutable Date value');
      }
    });
  });
  return Object.freeze(copy);
}

function freezeDeep(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (value instanceof Date) {
    return freezeDate(value);
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

/** Creates a defensive deep clone while retaining metadata value types. */
export function cloneAndFreeze(value) {
  return freezeDeep(cloneDeep(value));
}
