/**
 * @file SheetDBLib/src/multi/__tests__/CrossPartitionQuery.test.js
 * @description Unit tests for CrossPartitionQuery class.
 */

import { CrossPartitionQuery } from '../CrossPartitionQuery.js';
import { PartitionConfiguration } from '../PartitionConfiguration.js';

describe('CrossPartitionQuery', () => {
  const samplePartitions = [
    { id: 'warehouse_milan', spreadsheetId: 'sheet-1', tags: ['europe', 'active'], priority: 10 },
    { id: 'warehouse_rome', spreadsheetId: 'sheet-2', tags: ['europe', 'active'], priority: 5 },
    { id: 'warehouse_tokyo', spreadsheetId: 'sheet-3', tags: ['asia', 'active'], priority: 7 }
  ];

  // Mock manager
  const mockConfig = new PartitionConfiguration({
    partitions: samplePartitions
  });

  const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnValue([])
  };

  const mockManager = {
    getConfiguration: jest.fn().mockReturnValue(mockConfig),
    getPartition: jest.fn().mockReturnValue(mockDb)
  };

  let query;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.execute.mockReturnValue([]);
    query = new CrossPartitionQuery(mockManager, 'INVENTORY');
  });

  describe('constructor', () => {
    it('should create query with manager and table name', () => {
      expect(query).toBeInstanceOf(CrossPartitionQuery);
    });

    it('should throw if manager is missing', () => {
      expect(() => new CrossPartitionQuery(null, 'TABLE')).toThrow(
        'MultiDatabaseManager is required'
      );
    });

    it('should throw if table name is missing', () => {
      expect(() => new CrossPartitionQuery(mockManager, '')).toThrow('Table name is required');
      expect(() => new CrossPartitionQuery(mockManager, null)).toThrow('Table name is required');
    });
  });

  describe('partition selection', () => {
    it('should select specific partitions', () => {
      query.fromPartitions(['warehouse_milan', 'warehouse_rome']);
      const str = query.toString();
      expect(str).toContain('warehouse_milan');
      expect(str).toContain('warehouse_rome');
    });

    it('should throw if partitions array is empty', () => {
      expect(() => query.fromPartitions([])).toThrow('non-empty array');
    });

    it('should select by single tag', () => {
      query.fromTag('europe');
      const str = query.toString();
      expect(str).toContain('tag:europe');
    });

    it('should throw if tag is empty', () => {
      expect(() => query.fromTag('')).toThrow('non-empty string');
    });

    it('should select by multiple tags', () => {
      query.fromTags(['europe', 'active'], 'ALL');
      const str = query.toString();
      expect(str).toContain('tags:europe,active');
    });

    it('should throw if tags array is empty', () => {
      expect(() => query.fromTags([])).toThrow('non-empty array');
    });

    it('should select all partitions', () => {
      query.fromAll();
      const str = query.toString();
      expect(str).toContain('all');
    });
  });

  describe('query building', () => {
    it('should set columns to select', () => {
      const result = query.select(['sku', 'quantity']);
      expect(result).toBe(query); // Fluent
    });

    it('should add where conditions', () => {
      const result = query.where('quantity', '<', 10);
      expect(result).toBe(query); // Fluent
    });

    it('should set order by', () => {
      const result = query.orderBy('quantity', 'DESC');
      expect(result).toBe(query); // Fluent
    });

    it('should set limit', () => {
      const result = query.limit(100);
      expect(result).toBe(query); // Fluent
    });

    it('should set continue on error flag', () => {
      const result = query.setContinueOnError(false);
      expect(result).toBe(query); // Fluent
    });
  });

  describe('execute', () => {
    it('should execute query on selected partitions', () => {
      mockDb.execute.mockReturnValueOnce([{ sku: 'A1', quantity: 5 }]);
      mockDb.execute.mockReturnValueOnce([{ sku: 'B1', quantity: 3 }]);

      query.fromPartitions(['warehouse_milan', 'warehouse_rome']);
      const result = query.execute();

      expect(mockManager.getPartition).toHaveBeenCalledWith('warehouse_milan');
      expect(mockManager.getPartition).toHaveBeenCalledWith('warehouse_rome');
      expect(result.records).toHaveLength(2);
      expect(result.partitionsQueried).toContain('warehouse_milan');
      expect(result.partitionsQueried).toContain('warehouse_rome');
    });

    it('should add _partitionId to each record', () => {
      mockDb.execute.mockReturnValueOnce([{ sku: 'A1' }]);

      query.fromPartitions(['warehouse_milan']);
      const result = query.execute();

      expect(result.records[0]._partitionId).toBe('warehouse_milan');
    });

    it('should execute on all partitions by default', () => {
      query.execute();
      expect(mockManager.getPartition).toHaveBeenCalledTimes(3);
    });

    it('should apply where conditions', () => {
      query.fromPartitions(['warehouse_milan']).where('quantity', '<', 10);
      query.execute();

      expect(mockDb.where).toHaveBeenCalledWith('quantity', '<', 10);
    });

    it('should apply order by', () => {
      query.fromPartitions(['warehouse_milan']).orderBy('sku', 'ASC');
      query.execute();

      expect(mockDb.orderBy).toHaveBeenCalledWith('sku', 'ASC');
    });

    it('should apply limit', () => {
      query.fromPartitions(['warehouse_milan']).limit(50);
      query.execute();

      expect(mockDb.limit).toHaveBeenCalledWith(50);
    });

    it('should apply global ordering to aggregated results', () => {
      mockDb.execute.mockReturnValueOnce([{ sku: 'B1', quantity: 5 }]);
      mockDb.execute.mockReturnValueOnce([{ sku: 'A1', quantity: 3 }]);

      query.fromPartitions(['warehouse_milan', 'warehouse_rome']).orderBy('sku', 'ASC');
      const result = query.execute();

      expect(result.records[0].sku).toBe('A1');
      expect(result.records[1].sku).toBe('B1');
    });

    it('should continue on error when configured', () => {
      mockDb.execute.mockReturnValueOnce([{ sku: 'A1' }]);
      mockDb.execute.mockImplementationOnce(() => {
        throw new Error('Partition error');
      });

      query.fromPartitions(['warehouse_milan', 'warehouse_rome']).setContinueOnError(true);
      const result = query.execute();

      expect(result.records).toHaveLength(1);
      expect(result.errors.has('warehouse_rome')).toBe(true);
    });

    it('should throw on error when not configured to continue', () => {
      mockDb.execute.mockImplementationOnce(() => {
        throw new Error('Partition error');
      });

      query.fromPartitions(['warehouse_milan']).setContinueOnError(false);

      expect(() => query.execute()).toThrow('Cross-partition query failed');
    });

    it('should throw if no partitions selected', () => {
      // Clear the mock to return no partitions for the tag
      mockManager.getConfiguration.mockReturnValueOnce({
        ...mockConfig,
        getAllPartitions: () => [],
        getPartition: () => null,
        getPartitionsByTag: () => []
      });

      expect(() => query.fromTag('nonexistent').execute()).toThrow('No partitions selected');
    });

    it('should track execution time', () => {
      query.fromPartitions(['warehouse_milan']);
      const result = query.execute();
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should populate partitionResults map', () => {
      mockDb.execute.mockReturnValueOnce([{ sku: 'A1' }]);
      mockDb.execute.mockReturnValueOnce([{ sku: 'B1' }]);

      query.fromPartitions(['warehouse_milan', 'warehouse_rome']);
      const result = query.execute();

      expect(result.partitionResults.get('warehouse_milan')).toHaveLength(1);
      expect(result.partitionResults.get('warehouse_rome')).toHaveLength(1);
    });
  });

  describe('executeParallel', () => {
    it('should be an alias for execute in GAS (synchronous)', () => {
      query.fromPartitions(['warehouse_milan']);
      const result = query.executeParallel();
      expect(result).toBeDefined();
      expect(result.records).toBeDefined();
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const str = query.toString();
      expect(str).toContain('CrossPartitionQuery');
      expect(str).toContain('INVENTORY');
    });
  });
});
