/**
 * @fileoverview Tests for Loader class
 * @author GasLibraryFactory
 */

import { Loader } from '../Loader.js';
import { LoadError } from '../../errors/LoadError.js';

describe('Loader - Comprehensive Test Suite', () => {
  let mockLogger;
  let mockDb;
  let mockTable;
  let loader;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    mockTable = {
      insertRow: jest.fn(),
      insertRows: jest.fn(),
      updateRowById: jest.fn(),
      deleteRowById: jest.fn(),
      getByPK: jest.fn(),
      getAllRows: jest.fn().mockReturnValue([]),
      _keyField: 'ID'
    };

    mockDb = {
      tables: {
        Users: mockTable
      },
      save: jest.fn()
    };

    loader = new Loader(mockLogger, mockDb);
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should create instance with logger and databaseService', () => {
      expect(loader).toBeInstanceOf(Loader);
      expect(loader.logger).toBe(mockLogger);
      expect(loader._db).toBe(mockDb);
    });

    it('should have static STRATEGIES array', () => {
      expect(Loader.STRATEGIES).toEqual(['INSERT_ONLY', 'UPDATE_ONLY', 'UPSERT', 'OVERWRITE']);
    });
  });

  // ===================================================================
  // load() Method - Basic Functionality
  // ===================================================================
  describe('load() Method - Basic Functionality', () => {
    it('should throw LoadError for non-array data', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      expect(() => {
        loader.load('not an array', config);
      }).toThrow(LoadError);

      expect(() => {
        loader.load('not an array', config);
      }).toThrow('Data must be an array');
    });

    it('should include data type in error context', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      try {
        loader.load({ data: 'object' }, config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.code).toBe('INVALID_DATA');
        expect(error.context).toEqual({ dataType: 'object' });
      }
    });

    it('should return empty result for empty array', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      const result = loader.load([], config);

      expect(result).toEqual({
        success: true,
        inserted: 0,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 0
      });
      expect(mockLogger.warn).toHaveBeenCalledWith('[Loader] Data is empty, nothing to load');
    });

    it('should throw LoadError for table not found', () => {
      const config = {
        targetTable: 'NonExistent',
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      try {
        loader.load([{ email: 'test@example.com' }], config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.message).toContain('Target table "NonExistent" not found');
        expect(error.code).toBe('TABLE_NOT_FOUND');
        expect(error.context).toHaveProperty('availableTables', ['Users']);
      }
    });

    it('should call save() after loading', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'INSERT_ONLY',
        conflictKey: 'email'
      };

      loader.load([{ email: 'new@example.com' }], config);

      expect(mockDb.save).toHaveBeenCalled();
    });

    it('should log load progress', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      loader.load([{ email: 'test@example.com' }], config);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '[Loader] Loading 1 rows into table "Users" using strategy "UPSERT"'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('[Loader] Saving changes to database...');
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('[Loader] Load complete:')
      );
    });
  });

  // ===================================================================
  // INSERT_ONLY Strategy Tests
  // ===================================================================
  describe('INSERT_ONLY Strategy', () => {
    const config = {
      targetTable: 'Users',
      conflictResolution: 'INSERT_ONLY',
      conflictKey: 'email'
    };

    it('should insert new records', () => {
      const data = [
        { email: 'new1@example.com', name: 'User1' },
        { email: 'new2@example.com', name: 'User2' }
      ];

      const result = loader.load(data, config);

      expect(result).toEqual({
        success: true,
        inserted: 2,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 2
      });
      // OPTIMIZATION: Should use bulk insertRows instead of multiple insertRow calls
      expect(mockTable.insertRows).toHaveBeenCalledTimes(1);
      expect(mockTable.insertRows).toHaveBeenCalledWith(data);
    });

    it('should skip existing records', () => {
      mockTable.getAllRows.mockReturnValue([{ email: 'existing@example.com', name: 'Existing' }]);

      const data = [
        { email: 'existing@example.com', name: 'Updated' },
        { email: 'new@example.com', name: 'New' }
      ];

      const result = loader.load(data, config);

      expect(result.inserted).toBe(1);
      expect(result.skipped).toBe(1);
      // OPTIMIZATION: Should use bulk insertRows with only new records
      expect(mockTable.insertRows).toHaveBeenCalledTimes(1);
      expect(mockTable.insertRows).toHaveBeenCalledWith([
        { email: 'new@example.com', name: 'New' }
      ]);
    });

    it('should log skipped records', () => {
      mockTable.getAllRows.mockReturnValue([{ email: 'existing@example.com' }]);

      loader.load([{ email: 'existing@example.com' }], config);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        '[Loader] Skipping existing record: email=existing@example.com'
      );
    });

    it('should throw LoadError on insert failure', () => {
      mockTable.insertRows.mockImplementation(() => {
        throw new Error('Insert failed');
      });

      try {
        loader.load([{ email: 'test@example.com' }], config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.message).toContain('Failed to insert row');
        expect(error.code).toBe('INSERT_FAILED');
      }
    });
  });

  // ===================================================================
  // UPDATE_ONLY Strategy Tests
  // ===================================================================
  describe('UPDATE_ONLY Strategy', () => {
    const config = {
      targetTable: 'Users',
      conflictResolution: 'UPDATE_ONLY',
      conflictKey: 'email'
    };

    it('should update existing records', () => {
      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'existing@example.com', name: 'Old Name' }
      ]);

      const data = [{ email: 'existing@example.com', name: 'New Name' }];

      const result = loader.load(data, config);

      expect(result.updated).toBe(1);
      expect(result.inserted).toBe(0);
      expect(mockTable.updateRowById).toHaveBeenCalledWith('1', {
        email: 'existing@example.com',
        name: 'New Name'
      });
    });

    it('should skip new records', () => {
      const data = [{ email: 'new@example.com', name: 'New User' }];

      const result = loader.load(data, config);

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
      expect(mockTable.updateRowById).not.toHaveBeenCalled();
    });

    it('should log skipped new records', () => {
      loader.load([{ email: 'new@example.com' }], config);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        '[Loader] Skipping new record (UPDATE_ONLY): email=new@example.com'
      );
    });
  });

  // ===================================================================
  // UPDATE_ONLY with updateIfNewer Tests
  // ===================================================================
  describe('UPDATE_ONLY with updateIfNewer', () => {
    const config = {
      targetTable: 'Users',
      conflictResolution: 'UPDATE_ONLY',
      conflictKey: 'email',
      updateIfNewer: {
        enabled: true,
        timestampColumn: 'updatedAt'
      }
    };

    it('should update when incoming data is newer', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-01-02');

      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'user@example.com', updatedAt: oldDate }
      ]);

      const data = [{ email: 'user@example.com', updatedAt: newDate }];

      const result = loader.load(data, config);

      expect(result.updated).toBe(1);
      expect(mockTable.updateRowById).toHaveBeenCalled();
    });

    it('should skip when incoming data is older', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-01-02');

      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'user@example.com', updatedAt: newDate }
      ]);

      const data = [{ email: 'user@example.com', updatedAt: oldDate }];

      const result = loader.load(data, config);

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
      expect(mockTable.updateRowById).not.toHaveBeenCalled();
    });

    it('should skip when timestamps are equal', () => {
      const sameDate = new Date('2024-01-01');

      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'user@example.com', updatedAt: sameDate }
      ]);

      const data = [{ email: 'user@example.com', updatedAt: sameDate }];

      const result = loader.load(data, config);

      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
    });
  });

  // ===================================================================
  // UPSERT Strategy Tests
  // ===================================================================
  describe('UPSERT Strategy', () => {
    const config = {
      targetTable: 'Users',
      conflictResolution: 'UPSERT',
      conflictKey: 'email'
    };

    it('should insert new records', () => {
      const data = [{ email: 'new@example.com', name: 'New User' }];

      const result = loader.load(data, config);

      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(0);
      expect(mockTable.insertRows).toHaveBeenCalled();
    });

    it('should update existing records', () => {
      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'existing@example.com', name: 'Old' }
      ]);

      const data = [{ email: 'existing@example.com', name: 'Updated' }];

      const result = loader.load(data, config);

      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(1);
      expect(mockTable.updateRowById).toHaveBeenCalled();
    });

    it('should handle mix of new and existing records', () => {
      mockTable.getAllRows.mockReturnValue([{ ID: '1', email: 'existing@example.com' }]);

      const data = [
        { email: 'existing@example.com', name: 'Updated' },
        { email: 'new@example.com', name: 'New' }
      ];

      const result = loader.load(data, config);

      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(1);
      expect(result.total).toBe(2);
    });
  });

  // ===================================================================
  // UPSERT with updateIfNewer Tests
  // ===================================================================
  describe('UPSERT with updateIfNewer', () => {
    const config = {
      targetTable: 'Users',
      conflictResolution: 'UPSERT',
      conflictKey: 'email',
      updateIfNewer: {
        enabled: true,
        timestampColumn: 'updatedAt'
      }
    };

    it('should update when newer, insert when new', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-01-02');

      mockTable.getAllRows.mockReturnValue([
        { id: '1', email: 'existing@example.com', updatedAt: oldDate }
      ]);

      const data = [
        { email: 'existing@example.com', updatedAt: newDate },
        { email: 'new@example.com', updatedAt: newDate }
      ];

      const result = loader.load(data, config);

      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(1);
      expect(result.skipped).toBe(0);
    });

    it('should skip updating when older but still insert new', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-01-02');

      mockTable.getAllRows.mockReturnValue([
        { id: '1', email: 'existing@example.com', updatedAt: newDate }
      ]);

      const data = [
        { email: 'existing@example.com', updatedAt: oldDate },
        { email: 'new@example.com', updatedAt: oldDate }
      ];

      const result = loader.load(data, config);

      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);
    });
  });

  // ===================================================================
  // OVERWRITE Strategy Tests
  // ===================================================================
  describe('OVERWRITE Strategy', () => {
    const config = {
      targetTable: 'Users',
      conflictResolution: 'OVERWRITE',
      conflictKey: 'email'
    };

    it('should delete existing and insert new', () => {
      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'existing@example.com', name: 'Old' }
      ]);

      const data = [{ email: 'existing@example.com', name: 'New' }];

      const result = loader.load(data, config);

      expect(result.deleted).toBe(1);
      expect(result.inserted).toBe(1);
      expect(result.updated).toBe(0);
      expect(mockTable.deleteRowById).toHaveBeenCalledWith('1');
      expect(mockTable.insertRows).toHaveBeenCalled();
    });

    it('should just insert when record is new', () => {
      const data = [{ email: 'new@example.com', name: 'New' }];

      const result = loader.load(data, config);

      expect(result.deleted).toBe(0);
      expect(result.inserted).toBe(1);
    });

    it('should handle multiple records', () => {
      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'existing1@example.com' },
        { id: '2', email: 'existing2@example.com' }
      ]);

      const data = [
        { email: 'existing1@example.com', name: 'Updated1' },
        { email: 'existing2@example.com', name: 'Updated2' },
        { email: 'new@example.com', name: 'New' }
      ];

      const result = loader.load(data, config);

      expect(result.deleted).toBe(2);
      expect(result.inserted).toBe(3);
      expect(result.total).toBe(3);
    });
  });

  // ===================================================================
  // Config Validation Tests
  // ===================================================================
  describe('Config Validation', () => {
    it('should throw LoadError for missing targetTable', () => {
      const config = {
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      try {
        loader.load([{ email: 'test@example.com' }], config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.message).toContain('targetTable');
        expect(error.code).toBe('MISSING_TARGET_TABLE');
      }
    });

    it('should throw LoadError for missing conflictResolution', () => {
      const config = {
        targetTable: 'Users',
        conflictKey: 'email'
        // conflictResolution is missing (undefined)
      };

      try {
        loader.load([{ email: 'test@example.com' }], config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.message).toBe(
          'Invalid conflict resolution strategy: undefined. Valid: INSERT_ONLY, UPDATE_ONLY, UPSERT, OVERWRITE'
        );
        expect(error.code).toBe('INVALID_STRATEGY');
      }
    });

    it('should throw LoadError for invalid strategy', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'INVALID_STRATEGY',
        conflictKey: 'email'
      };

      try {
        loader.load([{ email: 'test@example.com' }], config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.message).toBe(
          'Invalid conflict resolution strategy: INVALID_STRATEGY. Valid: INSERT_ONLY, UPDATE_ONLY, UPSERT, OVERWRITE'
        );
        expect(error.code).toBe('INVALID_STRATEGY');
      }
    });

    it('should throw LoadError for missing conflictKey', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT'
      };

      try {
        loader.load([{ email: 'test@example.com' }], config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.message).toContain('conflictKey');
      }
    });

    it('should always update when updateIfNewer enabled without timestampColumn', () => {
      // When timestampColumn is missing, _shouldUpdate returns true (always update)
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'email',
        updateIfNewer: {
          enabled: true
          // timestampColumn is missing
        }
      };

      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'existing@example.com', name: 'Old' }
      ]);

      const result = loader.load([{ email: 'existing@example.com', name: 'New' }], config);

      expect(result.updated).toBe(1);
      expect(result.skipped).toBe(0);
    });
  });

  // ===================================================================
  // Error Handling Tests
  // ===================================================================
  describe('Error Handling', () => {
    it('should wrap generic errors in LoadError with strategy-specific code', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      mockTable.insertRows.mockImplementation(() => {
        throw new Error('Database error');
      });

      try {
        loader.load([{ email: 'test@example.com' }], config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.message).toContain('Database error');
        expect(error.code).toBe('UPSERT_FAILED'); // Strategy-specific error code
      }
    });

    it('should wrap all errors (including LoadError) in strategy-specific LoadError', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'INSERT_ONLY',
        conflictKey: 'email'
      };

      const originalError = new LoadError('Custom error', 'CUSTOM_CODE');
      mockTable.insertRows.mockImplementation(() => {
        throw originalError;
      });

      try {
        loader.load([{ email: 'test@example.com' }], config);
        fail('Should have thrown LoadError');
      } catch (error) {
        expect(error).toBeInstanceOf(LoadError);
        expect(error.code).toBe('INSERT_FAILED'); // Wrapped with strategy code
        expect(error.message).toContain('Custom error');
      }
    });

    it('should log errors before throwing', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      mockDb.save.mockImplementation(() => {
        throw new Error('Save failed');
      });

      try {
        loader.load([{ email: 'test@example.com' }], config);
      } catch (error) {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('[Loader] Load failed')
      );
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should handle complete load workflow', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'email'
      };

      mockTable.getAllRows.mockReturnValue([
        { ID: '1', email: 'existing@example.com', name: 'Old' }
      ]);

      const data = [
        { email: 'existing@example.com', name: 'Updated' },
        { email: 'new1@example.com', name: 'New1' },
        { email: 'new2@example.com', name: 'New2' }
      ];

      const result = loader.load(data, config);

      expect(result.success).toBe(true);
      expect(result.inserted).toBe(2);
      expect(result.updated).toBe(1);
      expect(result.total).toBe(3);
      expect(mockDb.save).toHaveBeenCalled();
    });

    it('should handle large dataset efficiently', () => {
      const config = {
        targetTable: 'Users',
        conflictResolution: 'INSERT_ONLY',
        conflictKey: 'email'
      };

      const data = [];
      for (let i = 0; i < 100; i++) {
        data.push({ email: `user${i}@example.com`, name: `User${i}` });
      }

      const result = loader.load(data, config);

      expect(result.inserted).toBe(100);
      expect(result.total).toBe(100);
      // OPTIMIZATION: Should use single bulk insertRows call instead of 100 individual calls
      expect(mockTable.insertRows).toHaveBeenCalledTimes(1);
    });
  });
});
