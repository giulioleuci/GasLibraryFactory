/**
 * @file SheetDBLib/src/multi/__tests__/PartitionRouter.test.js
 * @description Unit tests for PartitionRouter class.
 */

import { PartitionRouter } from '../PartitionRouter.js';
import { PartitionConfiguration } from '../PartitionConfiguration.js';
import { RoutingStrategy } from '../RoutingStrategy.js';
import { MockFactory } from '../../../../test/fakes';

describe('PartitionRouter', () => {
  const samplePartitions = [
    { id: 'warehouse_milan', spreadsheetId: 'sheet-1', tags: ['europe', 'active'], priority: 10 },
    { id: 'warehouse_rome', spreadsheetId: 'sheet-2', tags: ['europe', 'active'], priority: 5 },
    {
      id: 'warehouse_london',
      spreadsheetId: 'sheet-3',
      tags: ['europe', 'active'],
      priority: 8
    },
    { id: 'warehouse_tokyo', spreadsheetId: 'sheet-4', tags: ['asia', 'active'], priority: 7 },
    { id: 'archive_2024', spreadsheetId: 'sheet-5', tags: ['archive'], isReadOnly: true }
  ];

  let config;
  let router;
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    config = new PartitionConfiguration({
      partitions: samplePartitions,
      defaultPartition: 'warehouse_milan',
      routingStrategy: RoutingStrategy.EXPLICIT
    });
    router = new PartitionRouter(config, { logger: mocks.logger });
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create router with configuration', () => {
      expect(router).toBeInstanceOf(PartitionRouter);
    });

    it('should throw if configuration is missing', () => {
      expect(() => new PartitionRouter()).toThrow('PartitionConfiguration is required');
      expect(() => new PartitionRouter(null)).toThrow('PartitionConfiguration is required');
    });
  });

  describe('EXPLICIT routing', () => {
    beforeEach(() => {
      config = new PartitionConfiguration({
        partitions: samplePartitions,
        defaultPartition: 'warehouse_milan',
        routingStrategy: RoutingStrategy.EXPLICIT
      });
      router = new PartitionRouter(config, { logger: mocks.logger });
    });

    it('should route to explicit partition ID', () => {
      const partitions = router.route({ partitionId: 'warehouse_rome' });
      expect(partitions).toHaveLength(1);
      expect(partitions[0].id).toBe('warehouse_rome');
    });

    it('should return default partition if no ID specified', () => {
      const partitions = router.route({});
      expect(partitions).toHaveLength(1);
      expect(partitions[0].id).toBe('warehouse_milan');
    });

    it('should throw if partition not found', () => {
      expect(() => router.route({ partitionId: 'nonexistent' })).toThrow('No partitions found');
    });
  });

  describe('TAG_BASED routing', () => {
    beforeEach(() => {
      config = new PartitionConfiguration({
        partitions: samplePartitions,
        routingStrategy: RoutingStrategy.TAG_BASED
      });
      router = new PartitionRouter(config, { logger: mocks.logger });
    });

    it('should route by single tag', () => {
      const partitions = router.route({ tag: 'europe', strategy: RoutingStrategy.TAG_BASED });
      expect(partitions).toHaveLength(3);
      expect(partitions.every((p) => p.hasTag('europe'))).toBe(true);
    });

    it('should route by multiple tags with ALL mode', () => {
      const partitions = router.route({
        tags: ['europe', 'active'],
        tagMatchMode: 'ALL',
        strategy: RoutingStrategy.TAG_BASED
      });
      expect(partitions).toHaveLength(3);
    });

    it('should route by multiple tags with ANY mode', () => {
      const partitions = router.route({
        tags: ['europe', 'asia'],
        tagMatchMode: 'ANY',
        strategy: RoutingStrategy.TAG_BASED
      });
      expect(partitions).toHaveLength(4);
    });

    it('should return all partitions if no tags specified', () => {
      const partitions = router.route({ strategy: RoutingStrategy.TAG_BASED });
      expect(partitions).toHaveLength(5);
    });
  });

  describe('ROUND_ROBIN routing', () => {
    beforeEach(() => {
      config = new PartitionConfiguration({
        partitions: samplePartitions,
        routingStrategy: RoutingStrategy.ROUND_ROBIN
      });
      router = new PartitionRouter(config, { logger: mocks.logger });
    });

    it('should cycle through partitions', () => {
      const ids = new Set();
      for (let i = 0; i < 5; i++) {
        const partitions = router.route({ strategy: RoutingStrategy.ROUND_ROBIN });
        expect(partitions).toHaveLength(1);
        ids.add(partitions[0].id);
      }
      expect(ids.size).toBe(5);
    });

    it('should wrap around after cycling all', () => {
      const first = router.route({ strategy: RoutingStrategy.ROUND_ROBIN });

      // Cycle through remaining partitions (4 more to complete the cycle)
      for (let i = 0; i < 4; i++) {
        router.route({ strategy: RoutingStrategy.ROUND_ROBIN });
      }

      // Next call should wrap around to the first partition
      const wrapped = router.route({ strategy: RoutingStrategy.ROUND_ROBIN });
      expect(wrapped[0].id).toBe(first[0].id);
    });

    it('should filter by tag in round-robin', () => {
      const partitions = router.route({ tag: 'europe', strategy: RoutingStrategy.ROUND_ROBIN });
      expect(partitions).toHaveLength(1);
      expect(partitions[0].hasTag('europe')).toBe(true);
    });

    it('should reset round-robin counter', () => {
      router.route({ strategy: RoutingStrategy.ROUND_ROBIN });
      router.route({ strategy: RoutingStrategy.ROUND_ROBIN });
      expect(router.getRoundRobinCounter()).toBe(2);

      router.resetRoundRobin();
      expect(router.getRoundRobinCounter()).toBe(0);
    });
  });

  describe('PRIORITY routing', () => {
    beforeEach(() => {
      config = new PartitionConfiguration({
        partitions: samplePartitions,
        routingStrategy: RoutingStrategy.PRIORITY
      });
      router = new PartitionRouter(config, { logger: mocks.logger });
    });

    it('should return highest priority partition', () => {
      const partitions = router.route({ strategy: RoutingStrategy.PRIORITY });
      expect(partitions).toHaveLength(1);
      expect(partitions[0].id).toBe('warehouse_milan'); // priority 10
    });

    it('should filter by tag and return highest priority', () => {
      const partitions = router.route({ tag: 'asia', strategy: RoutingStrategy.PRIORITY });
      expect(partitions).toHaveLength(1);
      expect(partitions[0].id).toBe('warehouse_tokyo');
    });

    it('should filter by tags and return highest priority', () => {
      const partitions = router.route({
        tags: ['europe', 'active'],
        strategy: RoutingStrategy.PRIORITY
      });
      expect(partitions).toHaveLength(1);
      expect(partitions[0].id).toBe('warehouse_milan');
    });
  });

  describe('CUSTOM routing', () => {
    it('should use custom routing function', () => {
      const customRouter = (context, config) => {
        if (context.region === 'europe') {
          return config.getPartitionsByTag('europe');
        }
        return [config.getDefaultPartition()];
      };

      router = new PartitionRouter(config, { logger: mocks.logger, customRouter });

      const partitions = router.route({
        strategy: RoutingStrategy.CUSTOM,
        region: 'europe'
      });
      expect(partitions).toHaveLength(3);
    });

    it('should throw if no custom router provided', () => {
      expect(() => router.route({ strategy: RoutingStrategy.CUSTOM })).toThrow(
        'Custom routing strategy requires a customRouter function'
      );
    });

    it('should allow setting custom router after creation', () => {
      const customRouter = (context, config) => [config.getDefaultPartition()];
      router.setCustomRouter(customRouter);

      const partitions = router.route({ strategy: RoutingStrategy.CUSTOM });
      expect(partitions).toHaveLength(1);
    });

    it('should throw when setting non-function as custom router', () => {
      expect(() => router.setCustomRouter('not a function')).toThrow(
        'Custom router must be a function'
      );
    });
  });

  describe('routeSingle', () => {
    it('should return single partition', () => {
      const partition = router.routeSingle({ partitionId: 'warehouse_rome' });
      expect(partition.id).toBe('warehouse_rome');
    });
  });

  describe('strategy override', () => {
    it('should allow overriding strategy per request', () => {
      // Default is EXPLICIT
      const explicit = router.route({ partitionId: 'warehouse_rome' });
      expect(explicit).toHaveLength(1);

      // Override to TAG_BASED
      const tagBased = router.route({ tag: 'europe', strategy: RoutingStrategy.TAG_BASED });
      expect(tagBased).toHaveLength(3);
    });
  });
});
