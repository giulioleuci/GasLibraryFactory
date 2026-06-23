/**
 * @file SheetDBLib/src/dynamic/__tests__/DynamicColumnAccessor.test.js
 * @description Unit tests for DynamicColumnAccessor class
 */

import { DynamicColumnAccessor } from '../DynamicColumnAccessor.js';
import { ColumnFamily } from '../ColumnFamily.js';
import { ColumnType } from '../ColumnType.js';

describe('DynamicColumnAccessor', () => {
  let attrFamily;
  let metricsFamily;

  beforeEach(() => {
    attrFamily = new ColumnFamily({
      id: 'attrs',
      namePattern: 'attr_{{key}}',
      type: ColumnType.STRING,
      members: ['color', 'size', 'weight'],
      defaultValue: 'N/A'
    });

    metricsFamily = new ColumnFamily({
      id: 'metrics',
      namePattern: 'metric_{{key}}',
      type: ColumnType.NUMBER,
      members: ['count', 'total'],
      defaultValue: 0
    });
  });

  describe('constructor', () => {
    it('should create accessor with families array', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.getRow()).toBe(row);
    });

    it('should create accessor with familyMap', () => {
      const row = { id: '1', attr_color: 'red' };
      const familyMap = new Map([['attrs', attrFamily]]);
      const accessor = new DynamicColumnAccessor(row, { familyMap });

      expect(accessor.get('attrs', 'color')).toBe('red');
    });
  });

  describe('get', () => {
    it('should get value by family and member key', () => {
      const row = {
        id: '1',
        attr_color: 'red',
        attr_size: 'large'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.get('attrs', 'color')).toBe('red');
      expect(accessor.get('attrs', 'size')).toBe('large');
    });

    it('should return default value for missing columns when useDefaults is true', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily],
        useDefaults: true
      });

      expect(accessor.get('attrs', 'weight')).toBe('N/A');
    });

    it('should return null for missing columns when useDefaults is false', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily],
        useDefaults: false
      });

      expect(accessor.get('attrs', 'weight')).toBeNull();
    });

    it('should coerce types when coerceTypes is true', () => {
      const row = { id: '1', metric_count: '42' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [metricsFamily],
        coerceTypes: true
      });

      expect(accessor.get('metrics', 'count')).toBe(42);
      expect(typeof accessor.get('metrics', 'count')).toBe('number');
    });

    it('should throw error for unknown family', () => {
      const row = { id: '1' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(() => accessor.get('unknown', 'key')).toThrow('Column family not found: unknown');
    });
  });

  describe('getAll', () => {
    it('should get all values for a family', () => {
      const row = {
        id: '1',
        attr_color: 'red',
        attr_size: 'large',
        attr_weight: '2.5kg'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily],
        useDefaults: false
      });

      expect(accessor.getAll('attrs')).toEqual({
        color: 'red',
        size: 'large',
        weight: '2.5kg'
      });
    });

    it('should include default values for missing columns', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily],
        useDefaults: true
      });

      const all = accessor.getAll('attrs');

      expect(all.color).toBe('red');
      expect(all.size).toBe('N/A');
      expect(all.weight).toBe('N/A');
    });
  });

  describe('getAllAsArray', () => {
    it('should get all values as array of key-value pairs', () => {
      const row = {
        id: '1',
        attr_color: 'red',
        attr_size: 'large'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily],
        useDefaults: false
      });

      const result = accessor.getAllAsArray('attrs');

      expect(result).toContainEqual({ key: 'color', value: 'red' });
      expect(result).toContainEqual({ key: 'size', value: 'large' });
    });
  });

  describe('getMembers', () => {
    it('should get values for specific members', () => {
      const row = {
        id: '1',
        attr_color: 'red',
        attr_size: 'large',
        attr_weight: '2.5kg'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.getMembers('attrs', ['color', 'size'])).toEqual({
        color: 'red',
        size: 'large'
      });
    });
  });

  describe('has', () => {
    it('should return true for existing values', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.has('attrs', 'color')).toBe(true);
    });

    it('should return false for missing values', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.has('attrs', 'size')).toBe(false);
    });

    it('should return false for null values', () => {
      const row = { id: '1', attr_color: null };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.has('attrs', 'color')).toBe(false);
    });
  });

  describe('hasAny', () => {
    it('should return true if any member has value', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.hasAny('attrs')).toBe(true);
    });

    it('should return false if no members have values', () => {
      const row = { id: '1' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.hasAny('attrs')).toBe(false);
    });
  });

  describe('hasAll', () => {
    it('should return true if all members have values', () => {
      const row = {
        id: '1',
        attr_color: 'red',
        attr_size: 'large',
        attr_weight: '2.5kg'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.hasAll('attrs')).toBe(true);
    });

    it('should return false if some members are missing', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.hasAll('attrs')).toBe(false);
    });
  });

  describe('set', () => {
    it('should set a value', () => {
      const row = { id: '1' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      accessor.set('attrs', 'color', 'blue');

      expect(row.attr_color).toBe('blue');
    });

    it('should return this for chaining', () => {
      const row = { id: '1' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      const result = accessor.set('attrs', 'color', 'blue');

      expect(result).toBe(accessor);
    });

    it('should coerce type when setting', () => {
      const row = { id: '1' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [metricsFamily],
        coerceTypes: true
      });

      accessor.set('metrics', 'count', '42');

      expect(row.metric_count).toBe(42);
    });
  });

  describe('setAll', () => {
    it('should set multiple values', () => {
      const row = { id: '1' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      accessor.setAll('attrs', {
        color: 'blue',
        size: 'medium'
      });

      expect(row.attr_color).toBe('blue');
      expect(row.attr_size).toBe('medium');
    });
  });

  describe('clear', () => {
    it('should clear a value to null', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      accessor.clear('attrs', 'color');

      expect(row.attr_color).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all values in a family', () => {
      const row = {
        id: '1',
        attr_color: 'red',
        attr_size: 'large',
        attr_weight: '2.5kg'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      accessor.clearAll('attrs');

      expect(row.attr_color).toBeNull();
      expect(row.attr_size).toBeNull();
      expect(row.attr_weight).toBeNull();
    });
  });

  describe('count', () => {
    it('should count non-null values', () => {
      const row = {
        id: '1',
        attr_color: 'red',
        attr_size: 'large'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.count('attrs')).toBe(2);
    });
  });

  describe('getFilledMembers', () => {
    it('should return member keys with values', () => {
      const row = {
        id: '1',
        attr_color: 'red',
        attr_size: 'large'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.getFilledMembers('attrs')).toEqual(['color', 'size']);
    });
  });

  describe('getEmptyMembers', () => {
    it('should return member keys without values', () => {
      const row = {
        id: '1',
        attr_color: 'red'
      };
      const accessor = new DynamicColumnAccessor(row, {
        families: [attrFamily]
      });

      expect(accessor.getEmptyMembers('attrs')).toEqual(['size', 'weight']);
    });
  });

  describe('static forRow', () => {
    it('should create accessor for a single row', () => {
      const row = { id: '1', attr_color: 'red' };
      const accessor = DynamicColumnAccessor.forRow(row, [attrFamily]);

      expect(accessor.get('attrs', 'color')).toBe('red');
    });
  });

  describe('static forRows', () => {
    it('should create accessors for multiple rows', () => {
      const rows = [
        { id: '1', attr_color: 'red' },
        { id: '2', attr_color: 'blue' }
      ];
      const accessors = DynamicColumnAccessor.forRows(rows, [attrFamily]);

      expect(accessors).toHaveLength(2);
      expect(accessors[0].get('attrs', 'color')).toBe('red');
      expect(accessors[1].get('attrs', 'color')).toBe('blue');
    });

    it('should share family map across accessors', () => {
      const rows = [
        { id: '1', attr_color: 'red' },
        { id: '2', attr_color: 'blue' }
      ];
      const accessors = DynamicColumnAccessor.forRows(rows, [attrFamily]);

      // Both accessors share the same family map
      expect(accessors[0]._familyMap).toBe(accessors[1]._familyMap);
    });
  });
});
