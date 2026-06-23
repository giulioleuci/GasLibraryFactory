/**
 * @file SheetDBLib/src/multi/__tests__/MultiDatabaseError.test.js
 * @description Unit tests for MultiDatabase error classes.
 */

import {
  MultiDatabaseError,
  PartitionNotFoundError,
  PartitionConnectionError,
  ReadOnlyPartitionError,
  CrossPartitionQueryError,
  CrossPartitionDisabledError
} from '../MultiDatabaseError.js';

describe('MultiDatabaseError', () => {
  describe('base error', () => {
    it('should create error with message', () => {
      const error = new MultiDatabaseError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('MultiDatabaseError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should include details', () => {
      const error = new MultiDatabaseError('Test error', { key: 'value' });
      expect(error.details).toEqual({ key: 'value' });
    });

    it('should include timestamp', () => {
      const error = new MultiDatabaseError('Test error');
      expect(error.timestamp).toBeDefined();
      expect(typeof error.timestamp).toBe('string');
    });
  });

  describe('PartitionNotFoundError', () => {
    it('should create error with partition ID', () => {
      const error = new PartitionNotFoundError('warehouse_milan');
      expect(error.message).toContain('warehouse_milan');
      expect(error.name).toBe('PartitionNotFoundError');
      expect(error.partitionId).toBe('warehouse_milan');
    });

    it('should be instance of MultiDatabaseError', () => {
      const error = new PartitionNotFoundError('warehouse_milan');
      expect(error).toBeInstanceOf(MultiDatabaseError);
    });
  });

  describe('PartitionConnectionError', () => {
    it('should create error with partition ID and cause', () => {
      const cause = new Error('Connection refused');
      const error = new PartitionConnectionError('warehouse_milan', cause);

      expect(error.message).toContain('warehouse_milan');
      expect(error.name).toBe('PartitionConnectionError');
      expect(error.partitionId).toBe('warehouse_milan');
      expect(error.cause).toBe(cause);
    });

    it('should handle string cause', () => {
      const error = new PartitionConnectionError('warehouse_milan', 'Connection refused');
      expect(error.details.cause).toBe('Connection refused');
    });
  });

  describe('ReadOnlyPartitionError', () => {
    it('should create error with partition ID and operation', () => {
      const error = new ReadOnlyPartitionError('archive_2024', 'insert');

      expect(error.message).toContain('archive_2024');
      expect(error.message).toContain('insert');
      expect(error.message).toContain('read-only');
      expect(error.name).toBe('ReadOnlyPartitionError');
      expect(error.partitionId).toBe('archive_2024');
      expect(error.operation).toBe('insert');
    });
  });

  describe('CrossPartitionQueryError', () => {
    it('should create error with partition errors', () => {
      const partitionErrors = new Map([
        ['warehouse_milan', new Error('Query failed')],
        ['warehouse_rome', new Error('Timeout')]
      ]);

      const error = new CrossPartitionQueryError('Multiple partitions failed', partitionErrors);

      expect(error.message).toContain('Multiple partitions failed');
      expect(error.name).toBe('CrossPartitionQueryError');
      expect(error.partitionErrors).toBe(partitionErrors);
      expect(error.details.partitionErrors).toBeDefined();
    });

    it('should handle empty partition errors', () => {
      const error = new CrossPartitionQueryError('Query failed');
      expect(error.partitionErrors.size).toBe(0);
    });
  });

  describe('CrossPartitionDisabledError', () => {
    it('should create error with standard message', () => {
      const error = new CrossPartitionDisabledError();

      expect(error.message).toContain('disabled');
      expect(error.name).toBe('CrossPartitionDisabledError');
    });
  });
});
