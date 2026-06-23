/**
 * @file SheetDBLib/src/dynamic/__tests__/ColumnFamily.test.js
 * @description Unit tests for ColumnFamily class
 */

import { ColumnFamily, MemberSourceType } from '../ColumnFamily.js';
import { ColumnType } from '../ColumnType.js';

describe('ColumnFamily', () => {
  describe('constructor', () => {
    it('should create a ColumnFamily with required properties', () => {
      const family = new ColumnFamily({
        id: 'product_attrs',
        namePattern: 'attr_{{key}}'
      });

      expect(family.id).toBe('product_attrs');
      expect(family.namePattern).toBe('attr_{{key}}');
      expect(family.type).toBe(ColumnType.STRING);
      expect(family.nullable).toBe(true);
      expect(family.members).toEqual([]);
    });

    it('should create a ColumnFamily with all properties', () => {
      const family = new ColumnFamily({
        id: 'metrics',
        namePattern: 'metric_{{key}}',
        type: ColumnType.NUMBER,
        nullable: false,
        defaultValue: 0,
        members: ['count', 'total', 'average']
      });

      expect(family.id).toBe('metrics');
      expect(family.type).toBe(ColumnType.NUMBER);
      expect(family.nullable).toBe(false);
      expect(family.defaultValue).toBe(0);
      expect(family.members).toEqual(['count', 'total', 'average']);
    });

    it('should throw error if id is missing', () => {
      expect(
        () =>
          new ColumnFamily({
            namePattern: 'attr_{{key}}'
          })
      ).toThrow('ColumnFamily requires an id');
    });

    it('should throw error if namePattern is missing', () => {
      expect(
        () =>
          new ColumnFamily({
            id: 'test'
          })
      ).toThrow('ColumnFamily requires a namePattern');
    });

    it('should throw error if namePattern does not contain {{key}}', () => {
      expect(
        () =>
          new ColumnFamily({
            id: 'test',
            namePattern: 'attr_name'
          })
      ).toThrow('namePattern must contain {{key}} placeholder');
    });

    it('should freeze the instance', () => {
      const family = new ColumnFamily({
        id: 'test',
        namePattern: 'test_{{key}}'
      });

      expect(Object.isFrozen(family)).toBe(true);
    });
  });

  describe('generateColumnName', () => {
    it('should generate column name from member key', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });

      expect(family.generateColumnName('color')).toBe('attr_color');
      expect(family.generateColumnName('size')).toBe('attr_size');
    });

    it('should handle complex patterns', () => {
      const family = new ColumnFamily({
        id: 'scores',
        namePattern: 'student_{{key}}_score'
      });

      expect(family.generateColumnName('math')).toBe('student_math_score');
    });

    it('should handle pattern with only {{key}}', () => {
      const family = new ColumnFamily({
        id: 'simple',
        namePattern: '{{key}}'
      });

      expect(family.generateColumnName('column')).toBe('column');
    });
  });

  describe('parseMemberKey', () => {
    it('should extract member key from column name', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });

      expect(family.parseMemberKey('attr_color')).toBe('color');
      expect(family.parseMemberKey('attr_size')).toBe('size');
    });

    it('should return null for non-matching column names', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });

      expect(family.parseMemberKey('other_column')).toBeNull();
      expect(family.parseMemberKey('attribute_color')).toBeNull();
    });

    it('should handle complex patterns', () => {
      const family = new ColumnFamily({
        id: 'scores',
        namePattern: 'student_{{key}}_score'
      });

      expect(family.parseMemberKey('student_math_score')).toBe('math');
      expect(family.parseMemberKey('student_science_score')).toBe('science');
    });
  });

  describe('matchesColumn', () => {
    it('should return true for matching column names', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });

      expect(family.matchesColumn('attr_color')).toBe(true);
      expect(family.matchesColumn('attr_size')).toBe(true);
    });

    it('should return false for non-matching column names', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });

      expect(family.matchesColumn('other_column')).toBe(false);
      expect(family.matchesColumn('attribute_color')).toBe(false);
    });
  });

  describe('isStatic', () => {
    it('should return true for families with static members', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color', 'size']
      });

      expect(family.isStatic()).toBe(true);
    });

    it('should return false for families with memberSource', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        memberSource: { type: MemberSourceType.CONFIG, configPath: 'attrs' }
      });

      expect(family.isStatic()).toBe(false);
    });
  });

  describe('getColumnNames', () => {
    it('should return all column names for static members', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color', 'size', 'weight']
      });

      expect(family.getColumnNames()).toEqual(['attr_color', 'attr_size', 'attr_weight']);
    });

    it('should return empty array if no members', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });

      expect(family.getColumnNames()).toEqual([]);
    });
  });

  describe('hasMember', () => {
    it('should return true for existing members', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color', 'size']
      });

      expect(family.hasMember('color')).toBe(true);
      expect(family.hasMember('size')).toBe(true);
    });

    it('should return false for non-existing members', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color', 'size']
      });

      expect(family.hasMember('weight')).toBe(false);
    });
  });

  describe('withMembers', () => {
    it('should create a new ColumnFamily with updated members', () => {
      const original = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color']
      });

      const updated = original.withMembers(['color', 'size', 'weight']);

      expect(updated.members).toEqual(['color', 'size', 'weight']);
      expect(original.members).toEqual(['color']);
      expect(updated.id).toBe(original.id);
      expect(updated.namePattern).toBe(original.namePattern);
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        type: ColumnType.STRING,
        members: ['color', 'size']
      });

      const json = family.toJSON();

      expect(json).toEqual({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        type: 'STRING',
        nullable: true,
        defaultValue: null,
        members: ['color', 'size'],
        memberSource: null
      });
    });
  });

  describe('MemberSourceType', () => {
    it('should have all expected source types', () => {
      expect(MemberSourceType.STATIC).toBe('STATIC');
      expect(MemberSourceType.CONFIG).toBe('CONFIG');
      expect(MemberSourceType.QUERY).toBe('QUERY');
    });
  });
});
