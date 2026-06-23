// ===================================================================
// FILE: WorkspaceTemplateEngine/src/__tests__/AdvancedFilters.test.js
// ===================================================================
// Unit tests for individual advanced filter implementations
// Tests each filter in isolation for comprehensive coverage
// ===================================================================

import {
  DefaultFilter,
  YesNoFilter,
  FallbackFilter,
  TruncateFilter,
  SplitFilter,
  ReplaceFilter,
  UrlEncodeFilter,
  MapFilter,
  LimitFilter,
  SkipFilter,
  SortFilter,
  ReverseFilter,
  PlusFilter,
  MinusFilter,
  JsonFilter
} from '../internal/filters/AdvancedFilters';

describe('Advanced Filters - Unit Tests', () => {
  // ==================== LOGIC & DEFAULTS ====================

  describe('DefaultFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new DefaultFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('default');
    });

    it('should return default for null', () => {
      expect(filter.execute(null, 'N/A')).toBe('N/A');
    });

    it('should return default for undefined', () => {
      expect(filter.execute(undefined, 'N/A')).toBe('N/A');
    });

    it('should return default for empty string', () => {
      expect(filter.execute('', 'N/A')).toBe('N/A');
    });

    it('should return default for empty array', () => {
      expect(filter.execute([], 'N/A')).toBe('N/A');
    });

    it('should return original value if not empty', () => {
      expect(filter.execute('Hello', 'N/A')).toBe('Hello');
    });

    it('should return 0 as valid value', () => {
      expect(filter.execute(0, 'N/A')).toBe(0);
    });
  });

  describe('YesNoFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new YesNoFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('yesno');
    });

    it('should return "Yes" for true', () => {
      expect(filter.execute(true, 'Yes,No')).toBe('Yes');
    });

    it('should return "No" for false', () => {
      expect(filter.execute(false, 'Yes,No')).toBe('No');
    });

    it('should support custom strings', () => {
      expect(filter.execute(true, 'Active,Inactive')).toBe('Active');
      expect(filter.execute(false, 'Active,Inactive')).toBe('Inactive');
    });

    it('should use default "Yes,No" if no argument', () => {
      expect(filter.execute(true)).toBe('Yes');
      expect(filter.execute(false)).toBe('No');
    });
  });

  describe('FallbackFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new FallbackFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('fallback');
    });

    it('should return fallback for null', () => {
      expect(filter.execute(null, 'Fallback')).toBe('Fallback');
    });

    it('should return fallback for undefined', () => {
      expect(filter.execute(undefined, 'Fallback')).toBe('Fallback');
    });

    it('should return original value if present', () => {
      expect(filter.execute('Value', 'Fallback')).toBe('Value');
    });
  });

  // ==================== STRING MANIPULATION ====================

  describe('TruncateFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new TruncateFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('truncate');
    });

    it('should truncate string to specified length', () => {
      expect(filter.execute('This is a long text', 10)).toBe('This is a ...');
    });

    it('should use custom suffix', () => {
      expect(filter.execute('This is a long text', 10, '…')).toBe('This is a …');
    });

    it('should not truncate if text is shorter', () => {
      expect(filter.execute('Short', 50)).toBe('Short');
    });

    it('should use default length of 50', () => {
      const longText = 'a'.repeat(100);
      const result = filter.execute(longText);
      expect(result.length).toBe(53); // 50 chars + '...'
    });
  });

  describe('SplitFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new SplitFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('split');
    });

    it('should split string by separator', () => {
      expect(filter.execute('A,B,C', ',')).toEqual(['A', 'B', 'C']);
    });

    it('should use default comma separator', () => {
      expect(filter.execute('A,B,C')).toEqual(['A', 'B', 'C']);
    });

    it('should split by custom separator', () => {
      expect(filter.execute('A|B|C', '|')).toEqual(['A', 'B', 'C']);
    });
  });

  describe('ReplaceFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new ReplaceFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('replace');
    });

    it('should replace occurrences of a string', () => {
      expect(filter.execute('hello world', ' ', '_')).toBe('hello_world');
    });

    it('should replace all occurrences', () => {
      expect(filter.execute('hello world', 'o', '0')).toBe('hell0 w0rld');
    });

    it('should return original if no searchValue', () => {
      expect(filter.execute('hello', '', 'x')).toBe('hello');
    });
  });

  describe('UrlEncodeFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new UrlEncodeFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('url_encode');
    });

    it('should encode URI components', () => {
      expect(filter.execute('hello world')).toBe('hello%20world');
    });

    it('should encode special characters', () => {
      expect(filter.execute('hello@world.com')).toBe('hello%40world.com');
    });
  });

  // ==================== ARRAY MANIPULATION ====================

  describe('MapFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new MapFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('map');
    });

    it('should extract property from array of objects', () => {
      const array = [
        { name: 'A', id: 1 },
        { name: 'B', id: 2 }
      ];
      expect(filter.execute(array, 'name')).toEqual(['A', 'B']);
    });

    it('should return array unchanged if not an array', () => {
      expect(filter.execute('not an array', 'prop')).toBe('not an array');
    });

    it('should prevent prototype pollution', () => {
      const array = [{ name: 'A' }];
      expect(filter.execute(array, '__proto__')).toEqual(array);
    });
  });

  describe('LimitFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new LimitFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('limit');
    });

    it('should return first N items', () => {
      expect(filter.execute([1, 2, 3, 4, 5], 2)).toEqual([1, 2]);
    });

    it('should use default limit of 10', () => {
      const array = Array.from({ length: 20 }, (_, i) => i);
      expect(filter.execute(array).length).toBe(10);
    });

    it('should return array unchanged if not an array', () => {
      expect(filter.execute('not an array', 5)).toBe('not an array');
    });
  });

  describe('SkipFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new SkipFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('skip');
    });

    it('should skip first N items', () => {
      expect(filter.execute([1, 2, 3, 4, 5], 2)).toEqual([3, 4, 5]);
    });

    it('should return array unchanged if count is 0', () => {
      expect(filter.execute([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should return empty array if skip exceeds length', () => {
      expect(filter.execute([1, 2, 3], 10)).toEqual([]);
    });
  });

  describe('SortFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new SortFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('sort');
    });

    it('should sort primitive values ascending', () => {
      expect(filter.execute([3, 1, 2])).toEqual([1, 2, 3]);
    });

    it('should sort primitive values descending', () => {
      expect(filter.execute([1, 3, 2], 'desc')).toEqual([3, 2, 1]);
    });

    it('should sort by property ascending', () => {
      const array = [{ age: 30 }, { age: 20 }, { age: 25 }];
      const result = filter.execute(array, 'age');
      expect(result.map((x) => x.age)).toEqual([20, 25, 30]);
    });

    it('should sort by property descending', () => {
      const array = [{ age: 20 }, { age: 30 }, { age: 25 }];
      const result = filter.execute(array, 'age', 'desc');
      expect(result.map((x) => x.age)).toEqual([30, 25, 20]);
    });

    it('should not mutate original array', () => {
      const original = [3, 1, 2];
      filter.execute(original);
      expect(original).toEqual([3, 1, 2]);
    });
  });

  describe('ReverseFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new ReverseFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('reverse');
    });

    it('should reverse array order', () => {
      expect(filter.execute([1, 2, 3])).toEqual([3, 2, 1]);
    });

    it('should not mutate original array', () => {
      const original = [1, 2, 3];
      filter.execute(original);
      expect(original).toEqual([1, 2, 3]);
    });

    it('should return non-array unchanged', () => {
      expect(filter.execute('not an array')).toBe('not an array');
    });
  });

  // ==================== MATH & FORMATTING ====================

  describe('PlusFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new PlusFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('plus');
    });

    it('should add N to the value', () => {
      expect(filter.execute(10, 5)).toBe(15);
    });

    it('should handle negative numbers', () => {
      expect(filter.execute(10, -3)).toBe(7);
    });

    it('should use default addend of 0', () => {
      expect(filter.execute(10)).toBe(10);
    });

    it('should return original value if NaN', () => {
      expect(filter.execute('not a number', 5)).toBe('not a number');
    });
  });

  describe('MinusFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new MinusFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('minus');
    });

    it('should subtract N from the value', () => {
      expect(filter.execute(10, 3)).toBe(7);
    });

    it('should handle negative results', () => {
      expect(filter.execute(10, 15)).toBe(-5);
    });

    it('should use default subtrahend of 0', () => {
      expect(filter.execute(10)).toBe(10);
    });

    it('should return original value if NaN', () => {
      expect(filter.execute('not a number', 5)).toBe('not a number');
    });
  });

  describe('JsonFilter', () => {
    let filter;

    beforeEach(() => {
      filter = new JsonFilter();
    });

    it('should have correct name', () => {
      expect(filter.getName()).toBe('json');
    });

    it('should serialize object to JSON', () => {
      const obj = { name: 'Test', value: 123 };
      expect(filter.execute(obj)).toBe('{"name":"Test","value":123}');
    });

    it('should serialize with indentation', () => {
      const obj = { a: 1, b: 2 };
      const result = filter.execute(obj, 2);
      expect(result).toContain('{\n  "a": 1,\n  "b": 2\n}');
    });

    it('should handle arrays', () => {
      expect(filter.execute([1, 2, 3])).toBe('[1,2,3]');
    });

    it('should handle primitives', () => {
      expect(filter.execute('test')).toBe('"test"');
      expect(filter.execute(123)).toBe('123');
      expect(filter.execute(true)).toBe('true');
    });
  });
});
