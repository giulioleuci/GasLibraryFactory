/**
 * @file SheetDBLib/src/multi/__tests__/DatabasePartition.test.js
 * @description Unit tests for DatabasePartition class.
 */

import { DatabasePartition } from '../DatabasePartition.js';

describe('DatabasePartition', () => {
  describe('constructor', () => {
    it('should create a partition with required fields', () => {
      const partition = new DatabasePartition({
        id: 'test-partition',
        spreadsheetId: 'spreadsheet-123'
      });

      expect(partition.id).toBe('test-partition');
      expect(partition.spreadsheetId).toBe('spreadsheet-123');
      expect(partition.label).toBe('test-partition'); // defaults to id
      expect(partition.tags).toEqual([]);
      expect(partition.metadata).toEqual({});
      expect(partition.connectionOptions).toEqual({});
      expect(partition.isReadOnly).toBe(false);
      expect(partition.priority).toBe(0);
    });

    it('should create a partition with all optional fields', () => {
      const partition = new DatabasePartition({
        id: 'warehouse-milan',
        spreadsheetId: 'spreadsheet-456',
        label: 'Milan Warehouse',
        tags: ['europe', 'active'],
        metadata: { region: 'Lombardy' },
        connectionOptions: { cacheEnabled: true },
        isReadOnly: true,
        priority: 10
      });

      expect(partition.id).toBe('warehouse-milan');
      expect(partition.label).toBe('Milan Warehouse');
      expect(partition.tags).toEqual(['europe', 'active']);
      expect(partition.metadata).toEqual({ region: 'Lombardy' });
      expect(partition.connectionOptions).toEqual({ cacheEnabled: true });
      expect(partition.isReadOnly).toBe(true);
      expect(partition.priority).toBe(10);
    });

    it('should throw if definition is missing', () => {
      expect(() => new DatabasePartition()).toThrow('definition is required');
      expect(() => new DatabasePartition(null)).toThrow('definition is required');
      expect(() => new DatabasePartition('string')).toThrow('definition is required');
    });

    it('should throw if id is missing', () => {
      expect(
        () =>
          new DatabasePartition({
            spreadsheetId: 'spreadsheet-123'
          })
      ).toThrow('id is required');
    });

    it('should throw if spreadsheetId is missing', () => {
      expect(
        () =>
          new DatabasePartition({
            id: 'test-partition'
          })
      ).toThrow('spreadsheetId is required');
    });

    it('should throw if tags is not an array', () => {
      expect(
        () =>
          new DatabasePartition({
            id: 'test',
            spreadsheetId: 'spreadsheet-123',
            tags: 'not-an-array'
          })
      ).toThrow('tags must be an array');
    });

    it('should throw if priority is not a valid number', () => {
      expect(
        () =>
          new DatabasePartition({
            id: 'test',
            spreadsheetId: 'spreadsheet-123',
            priority: 'not-a-number'
          })
      ).toThrow('priority must be a valid number');
    });

    it('should be immutable', () => {
      const partition = new DatabasePartition({
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        tags: ['tag1'],
        metadata: { key: 'value' }
      });

      expect(Object.isFrozen(partition)).toBe(true);
      expect(Object.isFrozen(partition.tags)).toBe(true);
      expect(Object.isFrozen(partition.metadata)).toBe(true);
    });
  });

  describe('tag methods', () => {
    let partition;

    beforeEach(() => {
      partition = new DatabasePartition({
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        tags: ['europe', 'active', 'warehouse']
      });
    });

    it('should check if partition has a tag', () => {
      expect(partition.hasTag('europe')).toBe(true);
      expect(partition.hasTag('asia')).toBe(false);
    });

    it('should check if partition has all tags', () => {
      expect(partition.hasAllTags(['europe', 'active'])).toBe(true);
      expect(partition.hasAllTags(['europe', 'asia'])).toBe(false);
      expect(partition.hasAllTags([])).toBe(true);
    });

    it('should check if partition has any tag', () => {
      expect(partition.hasAnyTag(['europe', 'asia'])).toBe(true);
      expect(partition.hasAnyTag(['asia', 'america'])).toBe(false);
      expect(partition.hasAnyTag([])).toBe(false);
    });
  });

  describe('metadata methods', () => {
    it('should get metadata values', () => {
      const partition = new DatabasePartition({
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        metadata: { region: 'Lombardy', population: 10000000 }
      });

      expect(partition.getMetadata('region')).toBe('Lombardy');
      expect(partition.getMetadata('population')).toBe(10000000);
      expect(partition.getMetadata('missing')).toBeNull();
      expect(partition.getMetadata('missing', 'default')).toBe('default');
    });
  });

  describe('immutable transformation methods', () => {
    it('should create a copy with additional tags', () => {
      const partition = new DatabasePartition({
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        tags: ['europe']
      });

      const updated = partition.withTags(['active', 'warehouse']);

      expect(updated).not.toBe(partition);
      expect(updated.tags).toContain('europe');
      expect(updated.tags).toContain('active');
      expect(updated.tags).toContain('warehouse');
      expect(partition.tags).toEqual(['europe']); // Original unchanged
    });

    it('should not duplicate tags when adding', () => {
      const partition = new DatabasePartition({
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        tags: ['europe', 'active']
      });

      const updated = partition.withTags(['active', 'new']);

      expect(updated.tags.filter((t) => t === 'active')).toHaveLength(1);
    });

    it('should create a copy with different priority', () => {
      const partition = new DatabasePartition({
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        priority: 5
      });

      const updated = partition.withPriority(10);

      expect(updated).not.toBe(partition);
      expect(updated.priority).toBe(10);
      expect(partition.priority).toBe(5); // Original unchanged
    });
  });

  describe('serialization', () => {
    it('should convert to JSON', () => {
      const partition = new DatabasePartition({
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        label: 'Test Partition',
        tags: ['tag1', 'tag2'],
        metadata: { key: 'value' },
        connectionOptions: { cache: true },
        isReadOnly: true,
        priority: 5
      });

      const json = partition.toJSON();

      expect(json).toEqual({
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        label: 'Test Partition',
        tags: ['tag1', 'tag2'],
        metadata: { key: 'value' },
        connectionOptions: { cache: true },
        isReadOnly: true,
        priority: 5
      });
    });

    it('should create from JSON', () => {
      const json = {
        id: 'test',
        spreadsheetId: 'spreadsheet-123',
        label: 'Test Partition',
        tags: ['tag1'],
        priority: 5
      };

      const partition = DatabasePartition.fromJSON(json);

      expect(partition.id).toBe('test');
      expect(partition.spreadsheetId).toBe('spreadsheet-123');
      expect(partition.label).toBe('Test Partition');
      expect(partition.tags).toEqual(['tag1']);
      expect(partition.priority).toBe(5);
    });

    it('should throw when creating from invalid JSON', () => {
      expect(() => DatabasePartition.fromJSON(null)).toThrow('Invalid partition object');
      expect(() => DatabasePartition.fromJSON('string')).toThrow('Invalid partition object');
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const partition = new DatabasePartition({
        id: 'warehouse-milan',
        spreadsheetId: 'spreadsheet-123',
        label: 'Milan Warehouse',
        tags: ['europe', 'active']
      });

      const str = partition.toString();
      expect(str).toContain('warehouse-milan');
      expect(str).toContain('Milan Warehouse');
      expect(str).toContain('europe');
      expect(str).toContain('active');
    });

    it('should indicate read-only partitions', () => {
      const partition = new DatabasePartition({
        id: 'archive',
        spreadsheetId: 'spreadsheet-123',
        isReadOnly: true
      });

      expect(partition.toString()).toContain('read-only');
    });
  });
});
