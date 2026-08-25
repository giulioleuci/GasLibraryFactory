import { SystemUtils } from '../utils/SystemUtils.js';

const PUBLIC_METHODS = [
  'sleep',
  'delay',
  'isValidEmail',
  'isValidUrl',
  'isEqual',
  'isNil',
  'isNumber',
  'isString',
  'isEmptyValue',
  'debounce',
  'once',
  'noop',
  'chunk',
  'unique',
  'flatten',
  'flattenShallow',
  'flattenDeep',
  'compact',
  'difference',
  'differenceBy',
  'groupBy',
  'intersection',
  'keyBy',
  'orderBy',
  'uniq',
  'uniqBy',
  'randomInt',
  'round',
  'clamp',
  'maxBy',
  'minBy',
  'sumBy',
  'meanBy',
  'every',
  'filter',
  'find',
  'forEach',
  'map',
  'reduce',
  'size',
  'some',
  'deepClone',
  'deepMerge',
  'getNestedProperty',
  'setNestedProperty',
  'has',
  'pick',
  'omit',
  'mapKeys',
  'mapValues'
];

test('exposes all 50 public methods statically on the prototype', () => {
  const actualMethods = Object.getOwnPropertyNames(SystemUtils.prototype)
    .filter((name) => name !== 'constructor')
    .sort();

  expect(actualMethods).toEqual([...PUBLIC_METHODS].sort());
});
