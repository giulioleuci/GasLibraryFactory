/**
 * @file SheetDBLib/src/dynamic/__tests__/SchemaResolver.test.js
 * @description Unit tests for SchemaResolver class
 */

import { SchemaResolver } from '../SchemaResolver.js';
import { SchemaTemplate } from '../SchemaTemplate.js';
import { ColumnFamily, MemberSourceType } from '../ColumnFamily.js';
import { ColumnType } from '../ColumnType.js';
import { MockFactory } from '../../../../../test/fakes';

describe('SchemaResolver', () => {
  let resolver;
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    resolver = new SchemaResolver({ logger: mocks.logger });
  });

  describe('constructor', () => {
    it('should create resolver with default options', () => {
      const r = new SchemaResolver();
      expect(r.getFamilyIds()).toEqual([]);
    });

    it('should accept families as Map', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });
      const familyMap = new Map([['attrs', family]]);
      const r = new SchemaResolver({ familyRegistry: familyMap });

      expect(r.getFamily('attrs')).toBe(family);
    });

    it('should accept families as Object', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });
      const r = new SchemaResolver({ familyRegistry: { attrs: family } });

      expect(r.getFamily('attrs')).toBe(family);
    });
  });

  describe('registerFamily', () => {
    it('should register a column family', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });

      resolver.registerFamily(family);

      expect(resolver.getFamily('attrs')).toBe(family);
      expect(resolver.getFamilyIds()).toContain('attrs');
    });

    it('should return this for chaining', () => {
      const family = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });

      const result = resolver.registerFamily(family);

      expect(result).toBe(resolver);
    });

    it('should throw error for non-ColumnFamily', () => {
      expect(() => resolver.registerFamily({ id: 'test' })).toThrow(
        'Family must be a ColumnFamily instance'
      );
    });
  });

  describe('registerFamilies', () => {
    it('should register multiple families', () => {
      const family1 = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
      });
      const family2 = new ColumnFamily({
        id: 'metrics',
        namePattern: 'metric_{{key}}'
      });

      resolver.registerFamilies([family1, family2]);

      expect(resolver.getFamilyIds()).toEqual(['attrs', 'metrics']);
    });
  });

  describe('resolve', () => {
    it('should resolve a template with fixed columns only', () => {
      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [
          { name: 'id', type: 'STRING', primaryKey: true },
          { name: 'name', type: 'STRING' },
          { name: 'price', type: 'NUMBER' }
        ],
        dynamicColumns: []
      });

      const resolved = resolver.resolve(template);

      expect(resolved.tableId).toBe('products');
      expect(resolved.columns).toHaveLength(3);
      expect(resolved.primaryKeyColumn).toBe('id');
      expect(resolved.columns.every((c) => c.familyId === null)).toBe(true);
    });

    it('should resolve a template with static dynamic columns', () => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        type: ColumnType.STRING,
        members: ['color', 'size']
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [
          { name: 'id', type: 'STRING', primaryKey: true },
          { name: 'name', type: 'STRING' }
        ],
        dynamicColumns: [{ familyId: 'attrs' }]
      });

      const resolved = resolver.resolve(template);

      expect(resolved.columns).toHaveLength(4);
      expect(resolved.columns.map((c) => c.name)).toEqual([
        'id',
        'name',
        'attr_color',
        'attr_size'
      ]);
      expect(resolved.columns[2].familyId).toBe('attrs');
      expect(resolved.columns[2].memberKey).toBe('color');
    });

    it('should use dynamic config members when family has no static members', () => {
      // Family without static members - will use dynamic config members
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}'
        // No members specified - not static
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs', members: ['x', 'y'] }]
      });

      const resolved = resolver.resolve(template);

      expect(resolved.columns.map((c) => c.name)).toEqual(['id', 'attr_x', 'attr_y']);
    });

    it('should use family static members when both are specified', () => {
      // Family with static members takes precedence
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['a', 'b', 'c']
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs', members: ['x', 'y'] }]
      });

      const resolved = resolver.resolve(template);

      // Static family members take precedence over dynamic config members
      expect(resolved.columns.map((c) => c.name)).toEqual(['id', 'attr_a', 'attr_b', 'attr_c']);
    });

    it('should throw error for missing family', () => {
      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'nonexistent' }]
      });

      expect(() => resolver.resolve(template)).toThrow('Column family not found: nonexistent');
    });

    it('should throw error for non-SchemaTemplate', () => {
      expect(() => resolver.resolve({ tableId: 'test' })).toThrow(
        'Template must be a SchemaTemplate instance'
      );
    });

    it('should throw error for duplicate column names', () => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: '{{key}}', // Same as fixed column
        members: ['id']
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs' }]
      });

      expect(() => resolver.resolve(template)).toThrow('Duplicate column names');
    });

    it('should apply prefix from dynamic config', () => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: '{{key}}',
        members: ['color', 'size']
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs', prefix: 'product_' }]
      });

      const resolved = resolver.resolve(template);

      expect(resolved.columns.map((c) => c.name)).toEqual(['id', 'product_color', 'product_size']);
    });

    it('should use cache for repeated resolutions', () => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color']
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs' }]
      });

      const resolved1 = resolver.resolve(template);
      const resolved2 = resolver.resolve(template);

      expect(resolved1).toBe(resolved2);
    });

    it('should skip cache when useCache is false', () => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color']
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs' }]
      });

      const resolved1 = resolver.resolve(template, { useCache: false });
      const resolved2 = resolver.resolve(template, { useCache: false });

      expect(resolved1).not.toBe(resolved2);
    });
  });

  describe('clearCache', () => {
    it('should clear the schema cache', () => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color']
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs' }]
      });

      const resolved1 = resolver.resolve(template);
      resolver.clearCache();
      const resolved2 = resolver.resolve(template);

      expect(resolved1).not.toBe(resolved2);
    });
  });

  describe('static methods', () => {
    let resolved;

    beforeEach(() => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        members: ['color', 'size']
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [
          { name: 'id', type: 'STRING', primaryKey: true },
          { name: 'name', type: 'STRING' }
        ],
        dynamicColumns: [{ familyId: 'attrs' }]
      });

      resolved = resolver.resolve(template);
    });

    describe('getDynamicColumns', () => {
      it('should return only dynamic columns', () => {
        const dynamic = SchemaResolver.getDynamicColumns(resolved);

        expect(dynamic).toHaveLength(2);
        expect(dynamic.every((c) => c.familyId === 'attrs')).toBe(true);
      });
    });

    describe('getFixedColumns', () => {
      it('should return only fixed columns', () => {
        const fixed = SchemaResolver.getFixedColumns(resolved);

        expect(fixed).toHaveLength(2);
        expect(fixed.every((c) => c.familyId === null)).toBe(true);
      });
    });

    describe('getColumnsByFamily', () => {
      it('should return columns for a specific family', () => {
        const attrColumns = SchemaResolver.getColumnsByFamily(resolved, 'attrs');

        expect(attrColumns).toHaveLength(2);
        expect(attrColumns.map((c) => c.memberKey)).toEqual(['color', 'size']);
      });

      it('should return empty array for unknown family', () => {
        const unknown = SchemaResolver.getColumnsByFamily(resolved, 'unknown');

        expect(unknown).toEqual([]);
      });
    });

    describe('createColumnMap', () => {
      it('should create a map of column names to definitions', () => {
        const columnMap = SchemaResolver.createColumnMap(resolved);

        expect(columnMap.get('id').primaryKey).toBe(true);
        expect(columnMap.get('attr_color').familyId).toBe('attrs');
      });
    });
  });

  describe('external member loading', () => {
    it('should load members from config source', () => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        memberSource: { type: MemberSourceType.CONFIG, configPath: 'attrs.list' }
      });
      resolver.registerFamily(attrFamily);

      const mockLoader = {
        loadFromConfig: jest.fn().mockReturnValue(['x', 'y', 'z'])
      };
      resolver.setMemberLoader(mockLoader);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs' }]
      });

      const resolved = resolver.resolve(template);

      expect(mockLoader.loadFromConfig).toHaveBeenCalledWith('attrs.list', {});
      expect(resolved.columns.map((c) => c.name)).toEqual(['id', 'attr_x', 'attr_y', 'attr_z']);
    });

    it('should throw error if member loader not set', () => {
      const attrFamily = new ColumnFamily({
        id: 'attrs',
        namePattern: 'attr_{{key}}',
        memberSource: { type: MemberSourceType.CONFIG, configPath: 'attrs' }
      });
      resolver.registerFamily(attrFamily);

      const template = new SchemaTemplate({
        tableId: 'products',
        fixedColumns: [{ name: 'id', type: 'STRING', primaryKey: true }],
        dynamicColumns: [{ familyId: 'attrs' }]
      });

      expect(() => resolver.resolve(template)).toThrow(
        'Member loader required for external member sources'
      );
    });
  });
});
