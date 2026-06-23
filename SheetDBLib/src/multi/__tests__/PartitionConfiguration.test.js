/**
 * @file SheetDBLib/src/multi/__tests__/PartitionConfiguration.test.js
 * @description Unit tests for PartitionConfiguration class.
 */

import { PartitionConfiguration } from '../PartitionConfiguration.js';
import { DatabasePartition } from '../DatabasePartition.js';
import { RoutingStrategy } from '../RoutingStrategy.js';

describe('PartitionConfiguration', () => {
  const samplePartitions = [
    { id: 'warehouse_milan', spreadsheetId: 'sheet-1', tags: ['europe', 'active'], priority: 10 },
    { id: 'warehouse_rome', spreadsheetId: 'sheet-2', tags: ['europe', 'active'], priority: 5 },
    {
      id: 'warehouse_london',
      spreadsheetId: 'sheet-3',
      tags: ['europe', 'active'],
      priority: 8
    },
    { id: 'archive_2024', spreadsheetId: 'sheet-4', tags: ['archive'], isReadOnly: true }
  ];

  describe('constructor', () => {
    it('should create configuration with minimal options', () => {
      const config = new PartitionConfiguration({
        partitions: [{ id: 'test', spreadsheetId: 'sheet-1' }]
      });

      expect(config.size()).toBe(1);
      expect(config.defaultPartition).toBe('test');
      expect(config.routingStrategy).toBe(RoutingStrategy.EXPLICIT);
      expect(config.crossPartitionEnabled).toBe(true);
    });

    it('should create configuration with all options', () => {
      const config = new PartitionConfiguration({
        partitions: samplePartitions,
        defaultPartition: 'warehouse_rome',
        routingStrategy: RoutingStrategy.TAG_BASED,
        aliases: { current: 'warehouse_milan' },
        crossPartitionEnabled: false,
        globalConnectionOptions: { cacheEnabled: true }
      });

      expect(config.size()).toBe(4);
      expect(config.defaultPartition).toBe('warehouse_rome');
      expect(config.routingStrategy).toBe('TAG_BASED');
      expect(config.aliases).toEqual({ current: 'warehouse_milan' });
      expect(config.crossPartitionEnabled).toBe(false);
    });

    it('should accept DatabasePartition instances', () => {
      const partition = new DatabasePartition({ id: 'test', spreadsheetId: 'sheet-1' });
      const config = new PartitionConfiguration({
        partitions: [partition]
      });

      expect(config.getPartition('test')).toBe(partition);
    });

    it('should throw if no partitions provided', () => {
      expect(
        () =>
          new PartitionConfiguration({
            partitions: []
          })
      ).toThrow('At least one partition must be provided');
    });

    it('should throw if partitions is not an array', () => {
      expect(
        () =>
          new PartitionConfiguration({
            partitions: 'not-an-array'
          })
      ).toThrow('At least one partition must be provided');
    });

    it('should throw on duplicate partition IDs', () => {
      expect(
        () =>
          new PartitionConfiguration({
            partitions: [
              { id: 'test', spreadsheetId: 'sheet-1' },
              { id: 'test', spreadsheetId: 'sheet-2' }
            ]
          })
      ).toThrow('Duplicate partition ID: test');
    });

    it('should throw if default partition not found', () => {
      expect(
        () =>
          new PartitionConfiguration({
            partitions: [{ id: 'test', spreadsheetId: 'sheet-1' }],
            defaultPartition: 'nonexistent'
          })
      ).toThrow('Default partition not found');
    });

    it('should throw on invalid routing strategy', () => {
      expect(
        () =>
          new PartitionConfiguration({
            partitions: [{ id: 'test', spreadsheetId: 'sheet-1' }],
            routingStrategy: 'INVALID'
          })
      ).toThrow('Invalid routing strategy');
    });

    it('should throw if alias references unknown partition', () => {
      expect(
        () =>
          new PartitionConfiguration({
            partitions: [{ id: 'test', spreadsheetId: 'sheet-1' }],
            aliases: { current: 'nonexistent' }
          })
      ).toThrow('Alias "current" references unknown partition');
    });
  });

  describe('partition retrieval', () => {
    let config;

    beforeEach(() => {
      config = new PartitionConfiguration({
        partitions: samplePartitions,
        defaultPartition: 'warehouse_milan',
        aliases: { current: 'warehouse_milan', backup: 'warehouse_rome' }
      });
    });

    it('should get partition by ID', () => {
      const partition = config.getPartition('warehouse_milan');
      expect(partition).not.toBeNull();
      expect(partition.id).toBe('warehouse_milan');
    });

    it('should get partition by alias', () => {
      const partition = config.getPartition('current');
      expect(partition).not.toBeNull();
      expect(partition.id).toBe('warehouse_milan');
    });

    it('should return null for unknown partition', () => {
      expect(config.getPartition('nonexistent')).toBeNull();
    });

    it('should get default partition', () => {
      const partition = config.getDefaultPartition();
      expect(partition.id).toBe('warehouse_milan');
    });

    it('should get all partitions', () => {
      const partitions = config.getAllPartitions();
      expect(partitions).toHaveLength(4);
    });

    it('should get all partition IDs', () => {
      const ids = config.getPartitionIds();
      expect(ids).toContain('warehouse_milan');
      expect(ids).toContain('warehouse_rome');
      expect(ids).toContain('warehouse_london');
      expect(ids).toContain('archive_2024');
    });
  });

  describe('tag-based filtering', () => {
    let config;

    beforeEach(() => {
      config = new PartitionConfiguration({
        partitions: samplePartitions
      });
    });

    it('should get partitions by single tag', () => {
      const partitions = config.getPartitionsByTag('europe');
      expect(partitions).toHaveLength(3);

      const archivePartitions = config.getPartitionsByTag('archive');
      expect(archivePartitions).toHaveLength(1);
      expect(archivePartitions[0].id).toBe('archive_2024');
    });

    it('should get partitions by tags with ALL mode', () => {
      const partitions = config.getPartitionsByTags(['europe', 'active'], 'ALL');
      expect(partitions).toHaveLength(3);

      const none = config.getPartitionsByTags(['europe', 'archive'], 'ALL');
      expect(none).toHaveLength(0);
    });

    it('should get partitions by tags with ANY mode', () => {
      const partitions = config.getPartitionsByTags(['europe', 'archive'], 'ANY');
      expect(partitions).toHaveLength(4);

      const some = config.getPartitionsByTags(['archive'], 'ANY');
      expect(some).toHaveLength(1);
    });

    it('should get all unique tags', () => {
      const tags = config.getAllTags();
      expect(tags).toContain('europe');
      expect(tags).toContain('active');
      expect(tags).toContain('archive');
    });
  });

  describe('priority and read-only filtering', () => {
    let config;

    beforeEach(() => {
      config = new PartitionConfiguration({
        partitions: samplePartitions
      });
    });

    it('should get partitions sorted by priority', () => {
      const partitions = config.getPartitionsByPriority();
      expect(partitions[0].id).toBe('warehouse_milan'); // priority 10
      expect(partitions[1].id).toBe('warehouse_london'); // priority 8
      expect(partitions[2].id).toBe('warehouse_rome'); // priority 5
    });

    it('should get read-only partitions', () => {
      const partitions = config.getReadOnlyPartitions();
      expect(partitions).toHaveLength(1);
      expect(partitions[0].id).toBe('archive_2024');
    });

    it('should get writable partitions', () => {
      const partitions = config.getWritablePartitions();
      expect(partitions).toHaveLength(3);
      expect(partitions.every((p) => !p.isReadOnly)).toBe(true);
    });
  });

  describe('utility methods', () => {
    let config;

    beforeEach(() => {
      config = new PartitionConfiguration({
        partitions: samplePartitions,
        aliases: { current: 'warehouse_milan' }
      });
    });

    it('should check if partition exists', () => {
      expect(config.hasPartition('warehouse_milan')).toBe(true);
      expect(config.hasPartition('current')).toBe(true); // alias
      expect(config.hasPartition('nonexistent')).toBe(false);
    });

    it('should resolve alias', () => {
      expect(config.resolveAlias('current')).toBe('warehouse_milan');
      expect(config.resolveAlias('nonexistent')).toBeNull();
    });

    it('should return correct size', () => {
      expect(config.size()).toBe(4);
    });
  });

  describe('serialization', () => {
    it('should convert to JSON', () => {
      const config = new PartitionConfiguration({
        partitions: [{ id: 'test', spreadsheetId: 'sheet-1', tags: ['tag1'] }],
        defaultPartition: 'test',
        aliases: { current: 'test' }
      });

      const json = config.toJSON();

      expect(json.partitions).toHaveLength(1);
      expect(json.partitions[0].id).toBe('test');
      expect(json.defaultPartition).toBe('test');
      expect(json.aliases).toEqual({ current: 'test' });
    });

    it('should create from JSON', () => {
      const json = {
        partitions: [{ id: 'test', spreadsheetId: 'sheet-1' }],
        defaultPartition: 'test'
      };

      const config = PartitionConfiguration.fromJSON(json);

      expect(config.size()).toBe(1);
      expect(config.defaultPartition).toBe('test');
    });

    it('should throw when creating from invalid JSON', () => {
      expect(() => PartitionConfiguration.fromJSON(null)).toThrow('Invalid configuration object');
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const config = new PartitionConfiguration({
        partitions: samplePartitions,
        defaultPartition: 'warehouse_milan'
      });

      const str = config.toString();
      expect(str).toContain('4 partitions');
      expect(str).toContain('warehouse_milan');
    });
  });
});
