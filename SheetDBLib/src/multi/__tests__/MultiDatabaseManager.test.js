/**
 * @file SheetDBLib/src/multi/__tests__/MultiDatabaseManager.test.js
 * @description Unit tests for MultiDatabaseManager class.
 */

import { MultiDatabaseManager } from '../MultiDatabaseManager.js';
import { PartitionConfiguration } from '../PartitionConfiguration.js';
import { DatabasePartition } from '../DatabasePartition.js';
import { PartitionNotFoundError, CrossPartitionDisabledError } from '../MultiDatabaseError.js';
import { DatabaseService } from '../../DatabaseService.js';
import { MockFactory } from '../../../../test/fakes';

// Mock DatabaseService
jest.mock('../../DatabaseService.js', () => {
  return {
    DatabaseService: jest.fn().mockImplementation((spreadsheetId) => {
      return {
        spreadsheetId,
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockReturnValue([]),
        save: jest.fn()
      };
    })
  };
});

describe('MultiDatabaseManager', () => {
  const samplePartitions = [
    { id: 'warehouse_milan', spreadsheetId: 'sheet-1', tags: ['europe', 'active'], priority: 10 },
    { id: 'warehouse_rome', spreadsheetId: 'sheet-2', tags: ['europe', 'active'], priority: 5 },
    { id: 'warehouse_london', spreadsheetId: 'sheet-3', tags: ['europe'], priority: 8 },
    { id: 'archive_2024', spreadsheetId: 'sheet-4', tags: ['archive'], isReadOnly: true }
  ];

  let manager;
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    jest.clearAllMocks();
    manager = new MultiDatabaseManager(
      {
        partitions: samplePartitions,
        defaultPartition: 'warehouse_milan',
        aliases: { current: 'warehouse_milan' }
      },
      { logger: mocks.logger }
    );
  });

  describe('constructor', () => {
    it('should create manager with configuration object', () => {
      expect(manager).toBeInstanceOf(MultiDatabaseManager);
    });

    it('should create manager with PartitionConfiguration instance', () => {
      const config = new PartitionConfiguration({
        partitions: samplePartitions
      });
      const mgr = new MultiDatabaseManager(config, { logger: mocks.logger });
      expect(mgr).toBeInstanceOf(MultiDatabaseManager);
    });

    it('should initialize statistics for all partitions', () => {
      const stats = manager.getStatistics();
      expect(Object.keys(stats)).toHaveLength(4);
      expect(stats['warehouse_milan'].queries).toBe(0);
      expect(stats['warehouse_milan'].isConnected).toBe(false);
    });
  });

  describe('getPartition', () => {
    it('should get partition by ID with lazy loading', () => {
      const db = manager.getPartition('warehouse_milan');
      expect(db).toBeDefined();
      // Verify DatabaseService was called with the correct spreadsheet ID
      expect(DatabaseService).toHaveBeenCalledTimes(1);
      expect(DatabaseService.mock.calls[0][0]).toBe('sheet-1');
    });

    it('should get partition by alias', () => {
      const db = manager.getPartition('current');
      expect(db).toBeDefined();
    });

    it('should return cached connection on second access', () => {
      const db1 = manager.getPartition('warehouse_milan');
      const db2 = manager.getPartition('warehouse_milan');
      expect(db1).toBe(db2);
      expect(DatabaseService).toHaveBeenCalledTimes(1);
    });

    it('should throw PartitionNotFoundError for unknown partition', () => {
      expect(() => manager.getPartition('nonexistent')).toThrow(PartitionNotFoundError);
    });

    it('should update statistics on access', () => {
      manager.getPartition('warehouse_milan');
      const stats = manager.getPartistics('warehouse_milan');
      expect(stats.queries).toBe(0); // Initial connect doesn't count as query
      expect(stats.isConnected).toBe(true);
      expect(stats.lastAccess).not.toBeNull();
    });
  });

  describe('getDefault', () => {
    it('should get default partition', () => {
      const db = manager.getDefault();
      expect(db).toBeDefined();
    });
  });

  describe('getByTag', () => {
    it('should get all partitions with tag', () => {
      const dbs = manager.getByTag('europe');
      expect(dbs).toHaveLength(3);
    });

    it('should return empty array for unknown tag', () => {
      const dbs = manager.getByTag('unknown');
      expect(dbs).toHaveLength(0);
    });
  });

  describe('getByTags', () => {
    it('should get partitions matching all tags', () => {
      const dbs = manager.getByTags(['europe', 'active'], 'ALL');
      expect(dbs).toHaveLength(2);
    });

    it('should get partitions matching any tag', () => {
      const dbs = manager.getByTags(['europe', 'archive'], 'ANY');
      expect(dbs).toHaveLength(4);
    });
  });

  describe('isConnected', () => {
    it('should return false before connection', () => {
      expect(manager.isConnected('warehouse_milan')).toBe(false);
    });

    it('should return true after connection', () => {
      manager.getPartition('warehouse_milan');
      expect(manager.isConnected('warehouse_milan')).toBe(true);
    });

    it('should return false for unknown partition', () => {
      expect(manager.isConnected('nonexistent')).toBe(false);
    });
  });

  describe('getConnectedPartitions', () => {
    it('should return empty array initially', () => {
      expect(manager.getConnectedPartitions()).toHaveLength(0);
    });

    it('should return connected partition IDs', () => {
      manager.getPartition('warehouse_milan');
      manager.getPartition('warehouse_rome');
      const connected = manager.getConnectedPartitions();
      expect(connected).toContain('warehouse_milan');
      expect(connected).toContain('warehouse_rome');
      expect(connected).toHaveLength(2);
    });
  });

  describe('saveAll', () => {
    it('should save all connected partitions', () => {
      const db1 = manager.getPartition('warehouse_milan');
      const db2 = manager.getPartition('warehouse_rome');

      const results = manager.saveAll();

      expect(results['warehouse_milan'].success).toBe(true);
      expect(results['warehouse_rome'].success).toBe(true);
      expect(db1.save).toHaveBeenCalled();
      expect(db2.save).toHaveBeenCalled();
    });

    it('should skip read-only partitions', () => {
      manager.getPartition('warehouse_milan');
      manager.getPartition('archive_2024');

      const results = manager.saveAll();

      expect(results['warehouse_milan'].success).toBe(true);
      expect(results['archive_2024'].skipped).toBe(true);
      expect(results['archive_2024'].error).toBe('Partition is read-only');
    });

    it('should handle errors gracefully', () => {
      const db = manager.getPartition('warehouse_milan');
      db.save.mockImplementation(() => {
        throw new Error('Save failed');
      });

      const results = manager.saveAll();

      expect(results['warehouse_milan'].success).toBe(false);
      expect(results['warehouse_milan'].error).toBe('Save failed');
    });
  });

  describe('closePartition', () => {
    it('should close existing connection', () => {
      manager.getPartition('warehouse_milan');
      expect(manager.isConnected('warehouse_milan')).toBe(true);

      const closed = manager.closePartition('warehouse_milan');

      expect(closed).toBe(true);
      expect(manager.isConnected('warehouse_milan')).toBe(false);
    });

    it('should return false for non-connected partition', () => {
      const closed = manager.closePartition('warehouse_milan');
      expect(closed).toBe(false);
    });

    it('should return false for unknown partition', () => {
      const closed = manager.closePartition('nonexistent');
      expect(closed).toBe(false);
    });
  });

  describe('closeAll', () => {
    it('should close all connections', () => {
      manager.getPartition('warehouse_milan');
      manager.getPartition('warehouse_rome');
      expect(manager.getConnectedPartitions()).toHaveLength(2);

      const count = manager.closeAll();

      expect(count).toBe(2);
      expect(manager.getConnectedPartitions()).toHaveLength(0);
    });

    it('should return 0 if no connections', () => {
      const count = manager.closeAll();
      expect(count).toBe(0);
    });
  });

  describe('query', () => {
    it('should return CrossPartitionQuery builder', () => {
      const query = manager.query('INVENTORY');
      expect(query).toBeDefined();
      expect(query.toString()).toContain('INVENTORY');
    });

    it('should throw if cross-partition queries are disabled', () => {
      const restrictedManager = new MultiDatabaseManager(
        {
          partitions: samplePartitions,
          crossPartitionEnabled: false
        },
        { logger: mocks.logger }
      );

      expect(() => restrictedManager.query('INVENTORY')).toThrow(CrossPartitionDisabledError);
    });
  });

  describe('getConfiguration', () => {
    it('should return configuration', () => {
      const config = manager.getConfiguration();
      expect(config).toBeInstanceOf(PartitionConfiguration);
      expect(config.size()).toBe(4);
    });
  });

  describe('getRouter', () => {
    it('should return router', () => {
      const router = manager.getRouter();
      expect(router).toBeDefined();
    });
  });

  describe('statistics', () => {
    it('should track partition statistics', () => {
      manager.getPartition('warehouse_milan');
      manager.getPartition('warehouse_milan'); // Second access

      const stats = manager.getPartitionStatistics('warehouse_milan');
      expect(stats.queries).toBe(1); // Second access increments
      expect(stats.isConnected).toBe(true);
    });

    it('should return null for unknown partition', () => {
      const stats = manager.getPartitionStatistics('nonexistent');
      expect(stats).toBeNull();
    });

    it('should reset statistics', () => {
      manager.getPartition('warehouse_milan');
      manager.getPartition('warehouse_milan');
      manager.resetStatistics();

      const stats = manager.getPartitionStatistics('warehouse_milan');
      expect(stats.queries).toBe(0);
      expect(stats.isConnected).toBe(true); // Connection preserved
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      manager.getPartition('warehouse_milan');
      const str = manager.toString();
      expect(str).toContain('1/4');
      expect(str).toContain('connected');
    });
  });
});

// Helper to get statistics by partition ID (fixing the typo in the test)
MultiDatabaseManager.prototype.getPartistics = function (partitionIdOrAlias) {
  return this.getPartitionStatistics(partitionIdOrAlias);
};
