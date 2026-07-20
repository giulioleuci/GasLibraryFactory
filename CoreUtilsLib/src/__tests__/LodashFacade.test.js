/**
 * @file CoreUtilsLib/src/__tests__/LodashFacade.test.js
 * @description Test suite for LodashFacade - es-toolkit/compat integration
 */

import {
  // Array utilities
  chunk,
  compact,
  difference,
  differenceBy,
  flatten,
  flattenDeep,
  groupBy,
  intersection,
  keyBy,
  orderBy,
  uniq,
  uniqBy,

  // Object utilities
  cloneDeep,
  get,
  has,
  mapKeys,
  mapValues,
  merge,
  omit,
  pick,
  set,

  // Collection utilities
  every,
  filter,
  find,
  forEach,
  map,
  reduce,
  size,
  some,

  // String utilities
  camelCase,
  kebabCase,
  snakeCase,
  startCase,
  truncate,
  pascalCase,
  constantCase,
  dotCase,
  pathCase,
  stringToArray,
  humanisePath,

  // Type checking utilities
  isEmpty,
  isEqual,
  isNil,
  isNumber,
  isString,

  // Math utilities
  maxBy,
  meanBy,
  minBy,
  sumBy,

  // Function utilities
  debounce,
  once,
  noop,

  // Full facade object
  LodashFacade
} from '../facades/LodashFacade.js';
import { StringUtils } from '../utils/StringUtils.js';

describe('LodashFacade - es-toolkit/compat Integration', () => {
  // ===========================================================================
  // Array Utilities
  // ===========================================================================

  describe('Array Utilities', () => {
    describe('chunk()', () => {
      it('should split array into chunks of specified size', () => {
        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      });

      it('should handle empty array', () => {
        expect(chunk([], 2)).toEqual([]);
      });

      it('should handle chunk size larger than array', () => {
        expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
      });
    });

    describe('compact()', () => {
      it('should remove falsy values', () => {
        expect(compact([0, 1, false, 2, '', 3, null, undefined, NaN])).toEqual([1, 2, 3]);
      });
    });

    describe('difference()', () => {
      it('should return values not in other arrays', () => {
        expect(difference([2, 1], [2, 3])).toEqual([1]);
      });

      it('should handle multiple arrays', () => {
        expect(difference([1, 2, 3, 4], [2], [4])).toEqual([1, 3]);
      });
    });

    describe('differenceBy()', () => {
      it('should use iteratee for comparison', () => {
        expect(differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor)).toEqual([1.2]);
      });
    });

    describe('flatten() and flattenDeep()', () => {
      it('should flatten one level by default', () => {
        expect(
          flatten([
            [1, 2],
            [3, 4]
          ])
        ).toEqual([1, 2, 3, 4]);
      });

      it('should deeply flatten nested arrays', () => {
        expect(flattenDeep([[1, [2, [3, [4]]]]])).toEqual([1, 2, 3, 4]);
      });
    });

    describe('groupBy()', () => {
      it('should group by iteratee result', () => {
        expect(groupBy([6.1, 4.2, 6.3], Math.floor)).toEqual({
          4: [4.2],
          6: [6.1, 6.3]
        });
      });
    });

    describe('intersection()', () => {
      it('should return common values', () => {
        expect(intersection([2, 1], [2, 3])).toEqual([2]);
      });
    });

    describe('keyBy()', () => {
      it('should create object keyed by iteratee', () => {
        const result = keyBy([{ id: 'a' }, { id: 'b' }], 'id');
        expect(result.a).toEqual({ id: 'a' });
        expect(result.b).toEqual({ id: 'b' });
      });
    });

    describe('orderBy()', () => {
      it('should sort by multiple criteria', () => {
        const users = [
          { name: 'fred', age: 48 },
          { name: 'barney', age: 36 },
          { name: 'fred', age: 40 }
        ];
        const result = orderBy(users, ['name', 'age'], ['asc', 'desc']);
        expect(result[0]).toEqual({ name: 'barney', age: 36 });
        expect(result[1]).toEqual({ name: 'fred', age: 48 });
      });
    });

    describe('uniq() and uniqBy()', () => {
      it('should remove duplicates', () => {
        expect(uniq([2, 1, 2])).toEqual([2, 1]);
      });

      it('should use iteratee for comparison', () => {
        expect(uniqBy([2.1, 1.2, 2.3], Math.floor)).toEqual([2.1, 1.2]);
      });
    });
  });

  // ===========================================================================
  // Object Utilities
  // ===========================================================================

  describe('Object Utilities', () => {
    describe('cloneDeep()', () => {
      it('should preserve nested arrays and objects without retaining input references', () => {
        const original = { nested: { values: [1, 2] } };
        const cloned = cloneDeep(original);

        expect(cloned).toEqual(original);
        expect(cloned).not.toBe(original);
        expect(cloned.nested).not.toBe(original.nested);
        expect(cloned.nested.values).not.toBe(original.nested.values);
      });

      it('should create deep clone', () => {
        const original = { a: { b: 2 } };
        const clone = cloneDeep(original);
        clone.a.b = 3;
        expect(original.a.b).toBe(2);
      });

      it('should handle arrays', () => {
        const original = [
          [1, 2],
          [3, 4]
        ];
        const clone = cloneDeep(original);
        clone[0][0] = 99;
        expect(original[0][0]).toBe(1);
      });
    });

    describe('get() and set()', () => {
      it('should get nested property', () => {
        const obj = { a: { b: { c: 3 } } };
        expect(get(obj, 'a.b.c')).toBe(3);
      });

      it('should return default for missing path', () => {
        const obj = { a: 1 };
        expect(get(obj, 'a.b.c', 'default')).toBe('default');
      });

      it('should set nested property', () => {
        const obj = {};
        set(obj, 'a.b.c', 3);
        expect(obj.a.b.c).toBe(3);
      });
    });

    describe('has()', () => {
      it('should check if path exists', () => {
        const obj = { a: { b: 2 } };
        expect(has(obj, 'a.b')).toBe(true);
        expect(has(obj, 'a.c')).toBe(false);
      });
    });

    describe('pick() and omit()', () => {
      it('should pick specified properties', () => {
        expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
      });

      it('should omit specified properties', () => {
        expect(omit({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ b: 2 });
      });
    });

    describe('mapKeys() and mapValues()', () => {
      it('should transform keys', () => {
        expect(mapKeys({ a: 1, b: 2 }, (val, key) => key + val)).toEqual({ a1: 1, b2: 2 });
      });

      it('should transform values', () => {
        expect(mapValues({ a: 1, b: 2 }, (val) => val * 2)).toEqual({ a: 2, b: 4 });
      });
    });

    describe('merge()', () => {
      it('should deeply merge objects', () => {
        const result = merge({ a: { b: 1 } }, { a: { c: 2 } });
        expect(result).toEqual({ a: { b: 1, c: 2 } });
      });

      it('should merge nested objects and arrays without mutating source inputs', () => {
        const defaults = { nested: { values: [1, 2], enabled: true } };
        const provided = { nested: { values: [3], label: 'custom' } };

        const result = merge({}, defaults, provided);

        expect(result).toEqual({ nested: { values: [3, 2], enabled: true, label: 'custom' } });
        expect(defaults).toEqual({ nested: { values: [1, 2], enabled: true } });
        expect(provided).toEqual({ nested: { values: [3], label: 'custom' } });
      });
    });
  });

  describe('String case-conversion facade parity', () => {
    const stringUtils = new StringUtils();

    it('should match the facade for every facade-backed case-conversion input', () => {
      const input = 'user profile settings';

      expect(stringUtils.camelCase(input)).toBe(camelCase(input));
      expect(stringUtils.kebabCase(input)).toBe(kebabCase(input));
      expect(stringUtils.snakeCase(input)).toBe(snakeCase(input));
      expect(stringUtils.startCase(input)).toBe(startCase(input));
      expect(stringUtils.pascalCase(input)).toBe(pascalCase(input));
      expect(stringUtils.constantCase(input)).toBe(constantCase(input));
      expect(stringUtils.dotCase(input)).toBe(dotCase(input));
      expect(stringUtils.pathCase(input)).toBe(pathCase(input));
    });
  });

  // ===========================================================================
  // Collection Utilities
  // ===========================================================================

  describe('Collection Utilities', () => {
    describe('every() and some()', () => {
      it('should check if all elements pass predicate', () => {
        expect(every([1, 2, 3], (n) => n > 0)).toBe(true);
        expect(every([1, -1, 3], (n) => n > 0)).toBe(false);
      });

      it('should check if any element passes predicate', () => {
        expect(some([1, 2, 3], (n) => n > 2)).toBe(true);
        expect(some([1, 2, 3], (n) => n > 5)).toBe(false);
      });
    });

    describe('filter() and find()', () => {
      it('should filter elements', () => {
        expect(filter([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([2, 4]);
      });

      it('should find first matching element', () => {
        expect(find([1, 2, 3], (n) => n > 1)).toBe(2);
      });
    });

    describe('map() and reduce()', () => {
      it('should map values', () => {
        expect(map([1, 2, 3], (n) => n * 2)).toEqual([2, 4, 6]);
      });

      it('should reduce values', () => {
        expect(reduce([1, 2, 3], (sum, n) => sum + n, 0)).toBe(6);
      });
    });

    describe('forEach()', () => {
      it('should iterate over collection', () => {
        const results = [];
        forEach([1, 2, 3], (n) => results.push(n * 2));
        expect(results).toEqual([2, 4, 6]);
      });
    });

    describe('size()', () => {
      it('should return array length', () => {
        expect(size([1, 2, 3])).toBe(3);
      });

      it('should return object property count', () => {
        expect(size({ a: 1, b: 2 })).toBe(2);
      });
    });
  });

  // ===========================================================================
  // String Utilities
  // ===========================================================================

  describe('String Utilities', () => {
    describe('camelCase()', () => {
      it('should convert to camelCase', () => {
        expect(camelCase('Foo Bar')).toBe('fooBar');
        expect(camelCase('--foo-bar--')).toBe('fooBar');
        expect(camelCase('__FOO_BAR__')).toBe('fooBar');
      });
    });

    describe('kebabCase()', () => {
      it('should convert to kebab-case', () => {
        expect(kebabCase('Foo Bar')).toBe('foo-bar');
        expect(kebabCase('fooBar')).toBe('foo-bar');
      });
    });

    describe('snakeCase()', () => {
      it('should convert to snake_case', () => {
        expect(snakeCase('Foo Bar')).toBe('foo_bar');
        expect(snakeCase('fooBar')).toBe('foo_bar');
      });
    });

    describe('startCase()', () => {
      it('should convert to Start Case', () => {
        expect(startCase('fooBar')).toBe('Foo Bar');
        expect(startCase('--foo-bar--')).toBe('Foo Bar');
      });
    });

    describe('truncate()', () => {
      it('should truncate long strings', () => {
        expect(truncate('Hello World', 8)).toBe('Hello...');
      });

      it('should not truncate short strings', () => {
        expect(truncate('Hi', 10)).toBe('Hi');
      });

      it('should use custom suffix', () => {
        const result = truncate('Hello World', 8, '…');
        expect(result.endsWith('…')).toBe(true);
      });
    });
  });

  // ===========================================================================
  // Custom String Utilities (pascalCase, constantCase, dotCase, pathCase)
  // ===========================================================================

  describe('Custom String Utilities', () => {
    describe('pascalCase()', () => {
      it('should convert to PascalCase', () => {
        expect(pascalCase('hello world')).toBe('HelloWorld');
        expect(pascalCase('hello-world')).toBe('HelloWorld');
        expect(pascalCase('hello_world')).toBe('HelloWorld');
        expect(pascalCase('helloWorld')).toBe('HelloWorld');
        expect(pascalCase('HELLO_WORLD')).toBe('HelloWorld');
      });

      it('should handle empty string', () => {
        expect(pascalCase('')).toBe('');
      });

      it('should handle null/undefined', () => {
        expect(pascalCase(null)).toBe('');
        expect(pascalCase(undefined)).toBe('');
      });
    });

    describe('constantCase()', () => {
      it('should convert to CONSTANT_CASE', () => {
        expect(constantCase('hello world')).toBe('HELLO_WORLD');
        expect(constantCase('helloWorld')).toBe('HELLO_WORLD');
        expect(constantCase('hello-world')).toBe('HELLO_WORLD');
        expect(constantCase('HelloWorld')).toBe('HELLO_WORLD');
      });

      it('should handle empty string', () => {
        expect(constantCase('')).toBe('');
      });
    });

    describe('dotCase()', () => {
      it('should convert to dot.case', () => {
        expect(dotCase('hello world')).toBe('hello.world');
        expect(dotCase('helloWorld')).toBe('hello.world');
        expect(dotCase('hello-world')).toBe('hello.world');
        expect(dotCase('HelloWorld')).toBe('hello.world');
      });

      it('should handle empty string', () => {
        expect(dotCase('')).toBe('');
      });
    });

    describe('pathCase()', () => {
      it('should convert to path/case', () => {
        expect(pathCase('hello world')).toBe('hello/world');
        expect(pathCase('helloWorld')).toBe('hello/world');
        expect(pathCase('hello-world')).toBe('hello/world');
        expect(pathCase('HelloWorld')).toBe('hello/world');
      });

      it('should handle empty string', () => {
        expect(pathCase('')).toBe('');
      });
    });

    describe('stringToArray()', () => {
      it('should decompose camelCase', () => {
        expect(stringToArray('myVariableName')).toEqual(['my', 'variable', 'name']);
      });

      it('should decompose PascalCase', () => {
        expect(stringToArray('MyVariableName')).toEqual(['my', 'variable', 'name']);
      });

      it('should decompose snake_case', () => {
        expect(stringToArray('my_variable_name')).toEqual(['my', 'variable', 'name']);
      });

      it('should decompose kebab-case', () => {
        expect(stringToArray('my-variable-name')).toEqual(['my', 'variable', 'name']);
      });

      it('should decompose CONSTANT_CASE', () => {
        expect(stringToArray('MY_CONSTANT_VALUE')).toEqual(['my', 'constant', 'value']);
      });

      it('should handle mixed formats', () => {
        const result = stringToArray('myVariable_name-test');
        expect(result).toContain('my');
        expect(result).toContain('variable');
        expect(result).toContain('name');
        expect(result).toContain('test');
      });

      it('should handle empty string', () => {
        expect(stringToArray('')).toEqual([]);
      });
    });

    describe('humanisePath()', () => {
      it('should humanize file paths', () => {
        expect(humanisePath('documents/invoices_2024/January')).toBe(
          'Documents > Invoices 2024 > January'
        );
      });

      it('should humanize dot notation', () => {
        expect(humanisePath('user.settings.notifications')).toBe('User > Settings > Notifications');
      });

      it('should humanize camelCase segments', () => {
        expect(humanisePath('api/getUserProfile/byId')).toBe('Api > Get User Profile > By Id');
      });

      it('should handle mixed formats', () => {
        expect(humanisePath('MY_FOLDER/subFolder/file_name')).toBe(
          'My Folder > Sub Folder > File Name'
        );
      });

      it('should use custom separator', () => {
        expect(humanisePath('a/b/c', ' / ')).toBe('A / B / C');
      });

      it('should handle empty string', () => {
        expect(humanisePath('')).toBe('');
      });
    });
  });

  // ===========================================================================
  // Type Checking Utilities
  // ===========================================================================

  describe('Type Checking Utilities', () => {
    describe('isEmpty()', () => {
      it('should return true for empty values', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({})).toBe(true);
        expect(isEmpty('')).toBe(true);
      });

      it('should return false for non-empty values', () => {
        expect(isEmpty([1])).toBe(false);
        expect(isEmpty({ a: 1 })).toBe(false);
        expect(isEmpty('hello')).toBe(false);
      });
    });

    describe('isEqual()', () => {
      it('should compare primitives', () => {
        expect(isEqual(1, 1)).toBe(true);
        expect(isEqual('a', 'a')).toBe(true);
        expect(isEqual(1, 2)).toBe(false);
      });

      it('should deep compare objects', () => {
        expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
        expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
      });

      it('should deep compare arrays', () => {
        expect(isEqual([1, 2], [1, 2])).toBe(true);
        expect(isEqual([1, 2], [1, 3])).toBe(false);
      });
    });

    describe('isNil()', () => {
      it('should return true for null and undefined', () => {
        expect(isNil(null)).toBe(true);
        expect(isNil(undefined)).toBe(true);
      });

      it('should return false for other falsy values', () => {
        expect(isNil(0)).toBe(false);
        expect(isNil('')).toBe(false);
        expect(isNil(false)).toBe(false);
      });
    });

    describe('isNumber()', () => {
      it('should identify numbers', () => {
        expect(isNumber(3)).toBe(true);
        expect(isNumber(NaN)).toBe(true);
        expect(isNumber(Infinity)).toBe(true);
      });

      it('should reject non-numbers', () => {
        expect(isNumber('3')).toBe(false);
        expect(isNumber(null)).toBe(false);
      });
    });

    describe('isString()', () => {
      it('should identify strings', () => {
        expect(isString('abc')).toBe(true);
        expect(isString('')).toBe(true);
      });

      it('should reject non-strings', () => {
        expect(isString(1)).toBe(false);
        expect(isString(null)).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Math Utilities
  // ===========================================================================

  describe('Math Utilities', () => {
    const data = [{ n: 1 }, { n: 2 }, { n: 3 }];

    describe('maxBy()', () => {
      it('should find max by iteratee', () => {
        expect(maxBy(data, 'n')).toEqual({ n: 3 });
      });
    });

    describe('minBy()', () => {
      it('should find min by iteratee', () => {
        expect(minBy(data, 'n')).toEqual({ n: 1 });
      });
    });

    describe('sumBy()', () => {
      it('should sum by iteratee', () => {
        expect(sumBy(data, 'n')).toBe(6);
      });
    });

    describe('meanBy()', () => {
      it('should calculate mean by iteratee', () => {
        expect(meanBy(data, 'n')).toBe(2);
      });
    });
  });

  // ===========================================================================
  // Function Utilities
  // ===========================================================================

  describe('Function Utilities', () => {
    describe('debounce()', () => {
      it('should return a function', () => {
        const debounced = debounce(() => {}, 100);
        expect(typeof debounced).toBe('function');
      });
    });

    describe('once()', () => {
      it('should only call function once', () => {
        let count = 0;
        const increment = once(() => ++count);

        increment();
        increment();
        increment();

        expect(count).toBe(1);
      });
    });

    describe('noop()', () => {
      it('should return undefined', () => {
        expect(noop()).toBeUndefined();
      });
    });
  });

  // ===========================================================================
  // Default Export (LodashFacade object)
  // ===========================================================================

  describe('LodashFacade default export', () => {
    it('should contain all utility functions', () => {
      // Array utilities
      expect(typeof LodashFacade.chunk).toBe('function');
      expect(typeof LodashFacade.groupBy).toBe('function');

      // Object utilities
      expect(typeof LodashFacade.cloneDeep).toBe('function');
      expect(typeof LodashFacade.merge).toBe('function');

      // String utilities
      expect(typeof LodashFacade.camelCase).toBe('function');
      expect(typeof LodashFacade.pascalCase).toBe('function');
      expect(typeof LodashFacade.humanisePath).toBe('function');

      // Type checking
      expect(typeof LodashFacade.isEqual).toBe('function');

      // Function utilities
      expect(typeof LodashFacade.debounce).toBe('function');
      expect(typeof LodashFacade.once).toBe('function');
    });
  });
});
