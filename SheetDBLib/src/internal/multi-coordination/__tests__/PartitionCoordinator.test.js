/**
 * @file SheetDBLib/src/internal/multi-coordination/__tests__/PartitionCoordinator.test.js
 * @description Direct unit tests for PartitionCoordinator - connection pooling, lazy
 * DatabaseService instantiation, and cross-partition usage telemetry. This is the
 * coordination layer MultiDatabaseManager delegates to for write-conflict-avoiding
 * per-partition connection lifecycle management; MultiDatabaseManager's own tests
 * exercise it only indirectly through the facade, so these tests isolate the
 * coordinator's own connection-pool and statistics logic directly.
 */

import { PartitionCoordinator } from '../PartitionCoordinator.js';
import { PartitionConfiguration } from '../../../multi/PartitionConfiguration.js';
import {
  PartitionNotFoundError,
  PartitionConnectionError
} from '../../../multi/MultiDatabaseError.js';
import { DatabaseService } from '../../../DatabaseService.js';

jest.mock('../../../DatabaseService.js', () => {
  return {
    DatabaseService: jest
      .fn()
      .mockImplementation((spreadsheetId, logger, utils, cache, ss, opts) => {
        return { spreadsheetId, opts, select: jest.fn(), from: jest.fn() };
      })
  };
});

const samplePartitions = [
  { id: 'p_a', spreadsheetId: 'sheet-a', tags: ['east'], connectionOptions: { readonly: false } },
  { id: 'p_b', spreadsheetId: 'sheet-b', tags: ['west'] },
  { id: 'p_c', spreadsheetId: 'sheet-c', tags: ['east', 'archive'] }
];

function createConfig(overrides = {}) {
  return new PartitionConfiguration({
    partitions: samplePartitions,
    defaultPartition: 'p_a',
    aliases: { primary: 'p_a' },
    ...overrides
  });
}

describe('PartitionCoordinator', () => {
  let logger;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  });

  describe('constructor / statistics initialization', () => {
    it('initializes zeroed statistics for every configured partition', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      const stats = coordinator.getStatistics();

      expect(Object.keys(stats)).toEqual(['p_a', 'p_b', 'p_c']);
      for (const s of Object.values(stats)) {
        expect(s).toEqual({ queries: 0, hits: 0, misses: 0, lastAccess: null, isConnected: false });
      }
    });

    it('falls back to console when no logger is provided', () => {
      expect(() => new PartitionCoordinator(createConfig(), {})).not.toThrow();
    });
  });

  describe('getPartition (lazy connection pooling)', () => {
    it('creates a new DatabaseService connection on first access', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      const db = coordinator.getPartition('p_a');

      expect(db).toBeDefined();
      expect(DatabaseService).toHaveBeenCalledTimes(1);
      expect(DatabaseService.mock.calls[0][0]).toBe('sheet-a');
    });

    it('resolves a partition by alias to the same underlying connection as its physical id', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      const byAlias = coordinator.getPartition('primary');
      const byId = coordinator.getPartition('p_a');

      expect(byAlias).toBe(byId);
      expect(DatabaseService).toHaveBeenCalledTimes(1);
    });

    it('reuses the pooled connection on subsequent access instead of reconnecting', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      const first = coordinator.getPartition('p_a');
      const second = coordinator.getPartition('p_a');

      expect(first).toBe(second);
      expect(DatabaseService).toHaveBeenCalledTimes(1);
    });

    it('throws PartitionNotFoundError for an unregistered id/alias', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      expect(() => coordinator.getPartition('does-not-exist')).toThrow(PartitionNotFoundError);
    });

    it('wraps a DatabaseService construction failure in PartitionConnectionError', () => {
      DatabaseService.mockImplementationOnce(() => {
        throw new Error('spreadsheet unreachable');
      });
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      expect(() => coordinator.getPartition('p_a')).toThrow(PartitionConnectionError);
    });

    it('does not pool a connection that failed to establish (retry on next call succeeds)', () => {
      DatabaseService.mockImplementationOnce(() => {
        throw new Error('spreadsheet unreachable');
      });
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      expect(() => coordinator.getPartition('p_a')).toThrow(PartitionConnectionError);
      expect(coordinator.isConnected('p_a')).toBe(false);

      const db = coordinator.getPartition('p_a'); // retry, mock now succeeds
      expect(db).toBeDefined();
      expect(coordinator.isConnected('p_a')).toBe(true);
    });

    it('merges global, partition-specific, and coordinator-default connection options with correct precedence', () => {
      const coordinator = new PartitionCoordinator(
        createConfig({ globalConnectionOptions: { timeout: 100, readonly: true } }),
        { logger, defaultConnectionOptions: { timeout: 500 } }
      );
      coordinator.getPartition('p_a');

      const passedOpts = DatabaseService.mock.calls[0][5];
      // partition.connectionOptions.readonly (false) overrides global (true);
      // defaultConnectionOptions.timeout (500) overrides global (100) as the final override layer.
      expect(passedOpts).toEqual({ timeout: 500, readonly: false });
    });
  });

  describe('cross-partition isolation (write-conflict avoidance across independent connections)', () => {
    it('keeps distinct partitions on distinct pooled connections', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      const dbA = coordinator.getPartition('p_a');
      const dbB = coordinator.getPartition('p_b');

      expect(dbA).not.toBe(dbB);
      expect(dbA.spreadsheetId).toBe('sheet-a');
      expect(dbB.spreadsheetId).toBe('sheet-b');
      expect(coordinator.getConnectedPartitions().sort()).toEqual(['p_a', 'p_b']);
    });

    it('closing one partition connection does not disturb another', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      coordinator.getPartition('p_a');
      coordinator.getPartition('p_b');

      coordinator.closePartition('p_a');

      expect(coordinator.isConnected('p_a')).toBe(false);
      expect(coordinator.isConnected('p_b')).toBe(true);
    });

    it('reconnecting after close creates a fresh DatabaseService instance', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      const first = coordinator.getPartition('p_a');
      coordinator.closePartition('p_a');
      const second = coordinator.getPartition('p_a');

      expect(second).not.toBe(first);
      expect(DatabaseService).toHaveBeenCalledTimes(2);
    });
  });

  describe('closePartition / closeAll', () => {
    it('closePartition returns false for an id with no active connection', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      expect(coordinator.closePartition('p_a')).toBe(false);
    });

    it('closePartition returns true and drops the connection when one exists', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      coordinator.getPartition('p_a');
      expect(coordinator.closePartition('p_a')).toBe(true);
      expect(coordinator.getConnectedPartitions()).toEqual([]);
    });

    it('closeAll tears down every pooled connection and reports the count', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      coordinator.getPartition('p_a');
      coordinator.getPartition('p_b');
      coordinator.getPartition('p_c');

      const closed = coordinator.closeAll();

      expect(closed).toBe(3);
      expect(coordinator.getConnectedPartitions()).toEqual([]);
      expect(coordinator.activeConnectionsCount).toBe(0);
    });

    it('closeAll on an empty pool returns 0 without error', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      expect(coordinator.closeAll()).toBe(0);
    });
  });

  describe('telemetry / statistics', () => {
    it('marks a partition connected and stamps lastAccess on first connect', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      coordinator.getPartition('p_a');

      const stats = coordinator.getPartitionStatistics('p_a');
      expect(stats.isConnected).toBe(true);
      expect(stats.lastAccess).toBeInstanceOf(Date);
      expect(stats.queries).toBe(0); // connect itself is not counted as a query
    });

    it('increments the query counter only on repeated (pooled) access, not the initial connect', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      coordinator.getPartition('p_a'); // connect
      coordinator.getPartition('p_a'); // access
      coordinator.getPartition('p_a'); // access

      expect(coordinator.getPartitionStatistics('p_a').queries).toBe(2);
    });

    it('getPartitionStatistics returns null for an unregistered partition', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      expect(coordinator.getPartitionStatistics('nope')).toBeNull();
    });

    it('updateStatistics with an unknown event or partition id is a safe no-op', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      expect(() => coordinator.updateStatistics('p_a', 'unknown-event')).not.toThrow();
      expect(() => coordinator.updateStatistics('does-not-exist', 'query')).not.toThrow();
    });

    it('disconnect telemetry flips isConnected to false but preserves the query count', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      coordinator.getPartition('p_a');
      coordinator.getPartition('p_a'); // 1 query
      coordinator.closePartition('p_a');

      const stats = coordinator.getPartitionStatistics('p_a');
      expect(stats.isConnected).toBe(false);
      expect(stats.queries).toBe(1);
    });

    it('resetStatistics zeroes counters for all partitions but keeps live connections marked connected', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      coordinator.getPartition('p_a');
      coordinator.getPartition('p_a');

      coordinator.resetStatistics();

      const statsA = coordinator.getPartitionStatistics('p_a');
      const statsB = coordinator.getPartitionStatistics('p_b');
      expect(statsA.queries).toBe(0);
      expect(statsA.isConnected).toBe(true);
      expect(statsA.lastAccess).toBeInstanceOf(Date);
      expect(statsB.isConnected).toBe(false);
      expect(statsB.lastAccess).toBeNull();
    });

    it('getStatistics returns defensive copies, not live references', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      const stats = coordinator.getStatistics();
      stats.p_a.queries = 999;

      expect(coordinator.getPartitionStatistics('p_a').queries).toBe(0);
    });
  });

  describe('getConnectionsEntries', () => {
    it('exposes an iterator over [id, connection] pairs for connected partitions only', () => {
      const coordinator = new PartitionCoordinator(createConfig(), { logger });
      coordinator.getPartition('p_a');
      coordinator.getPartition('p_b');

      const entries = Array.from(coordinator.getConnectionsEntries());
      expect(entries).toHaveLength(2);
      expect(entries.map(([id]) => id).sort()).toEqual(['p_a', 'p_b']);
    });
  });
});
