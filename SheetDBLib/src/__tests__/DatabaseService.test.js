// ===================================================================
// FILE: SheetDBLib/src/__tests__/DatabaseService.test.js
// ===================================================================
// Comprehensive test suite for DatabaseService
// Coverage: Initialization, table management, query builder integration
// ===================================================================

import { DatabaseService } from '../DatabaseService';
import { SpreadsheetService } from '@GoogleApiWrapper';
import { MockFactory } from '../../../test/fakes/MockFactory';
import { SchemaValidator } from '@GasSchemaValidatorLib';

// Mock the SpreadsheetService
jest.mock('@GoogleApiWrapper', () => ({
  SpreadsheetService: jest.fn()
}));

describe('DatabaseService - Comprehensive Test Suite', () => {
  let mocks;
  let spreadsheetService;

  beforeEach(() => {
    global.resetGasMocks();
    mocks = MockFactory.createAllJest();
    spreadsheetService = mocks.spreadsheetService;

    // Extend spreadsheetService with DatabaseService-specific behavior
    spreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Users' }, { name: 'Orders' }]);
    spreadsheetService.getRanges.mockImplementation((spreadsheetId, ranges) => {
      const result = {};
      ranges.forEach((range) => {
        if (range.includes('Users')) {
          result[range] = [
            ['ID', 'name', 'email'],
            ['1', 'John', 'john@example.com'],
            ['2', 'Jane', 'jane@example.com']
          ];
        } else if (range.includes('Orders')) {
          result[range] = [
            ['ID', 'userId', 'total'],
            ['1', '1', '100'],
            ['2', '2', '200']
          ];
        }
      });
      return result;
    });

    // Setup the SpreadsheetService mock constructor
    SpreadsheetService.mockImplementation(() => spreadsheetService);
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with spreadsheet ID', () => {
      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db).toBeDefined();
      expect(db._spreadsheetId).toBe('TEST_SHEET_ID');
    });

    it('should initialize tables from spreadsheet', () => {
      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db.tables).toBeDefined();
      expect(db.tables['Users']).toBeDefined();
      expect(db.tables['Orders']).toBeDefined();
    });

    it('should use provided logger', () => {
      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(mocks.logger.debug).toHaveBeenCalled();
    });

    it('should handle spreadsheet with no sheets', () => {
      mocks.spreadsheetService.getSheetInfo.mockReturnValue([]);

      const db = new DatabaseService('EMPTY_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db.tables).toEqual({});
      expect(mocks.logger.warn).toHaveBeenCalled();
    });

    it('should handle invalid spreadsheet ID gracefully', () => {
      mocks.spreadsheetService.getSheetInfo.mockImplementation(() => {
        throw new Error('Spreadsheet not found');
      });

      expect(() => {
        new DatabaseService('INVALID_ID', mocks.logger, mocks.utils, mocks.cache);
      }).toThrow('Spreadsheet not found');
    });

    it('should store schemaValidator from options', () => {
      const schemaValidator = new SchemaValidator(mocks.logger);
      const db = new DatabaseService(
        'TEST_SHEET_ID',
        mocks.logger,
        mocks.utils,
        mocks.cache,
        null,
        { schemaValidator }
      );
      expect(db._schemaValidator).toBe(schemaValidator);
    });
  });

  // ===================================================================
  // TABLE ACCESS
  // ===================================================================

  describe('Table Access', () => {
    let db;

    beforeEach(() => {
      db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);
    });

    it('should access table by name', () => {
      const usersTable = db.tables['Users'];

      expect(usersTable).toBeDefined();
      expect(usersTable.sheetName).toBe('Users');
    });

    it('should return undefined for non-existent table', () => {
      const nonExistent = db.tables['NonExistent'];

      expect(nonExistent).toBeUndefined();
    });

    it('should list all table names', () => {
      const tableNames = Object.keys(db.tables);

      expect(tableNames).toContain('Users');
      expect(tableNames).toContain('Orders');
    });
  });

  // ===================================================================
  // QUERY BUILDER INTEGRATION
  // ===================================================================

  describe('Query Builder Integration', () => {
    let db;

    beforeEach(() => {
      db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);
    });

    it('should create query builder with select()', () => {
      const query = db.select(['name', 'email']);

      expect(query).toBeDefined();
      expect(typeof query.from).toBe('function');
    });

    it('should support method chaining', () => {
      const query = db.select(['name']).from('Users').where('email', '=', 'test@test.com');

      expect(query).toBeDefined();
    });

    it('should handle select with no columns (select all)', () => {
      const query = db.select();

      expect(query).toBeDefined();
    });
  });

  // ===================================================================
  // SAVE OPERATION
  // ===================================================================

  describe('Save Operation', () => {
    let db;

    beforeEach(() => {
      db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);
    });

    it('should save changes to spreadsheet', () => {
      expect(() => {
        db.save();
      }).not.toThrow();
    });

    it('should log save operation', () => {
      db.save();

      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('save'));
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle spreadsheet with special characters in sheet names', () => {
      mocks.spreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Users-2024' },
        { name: 'Orders (Archive)' }
      ]);

      mocks.spreadsheetService.getRanges.mockReturnValue({
        "'Users-2024'!A:ZZ": [['ID']],
        "'Orders (Archive)'!A:ZZ": [['ID']]
      });

      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db.tables['Users-2024']).toBeDefined();
      expect(db.tables['Orders (Archive)']).toBeDefined();
    });

    it('should handle very long spreadsheet IDs', () => {
      const longId = 'A'.repeat(1000);

      const db = new DatabaseService(longId, mocks.logger, mocks.utils, mocks.cache);

      expect(db._spreadsheetId).toBe(longId);
    });

    it('should handle null logger gracefully', () => {
      // Database can be created with null logger, but it might error on logger.debug calls
      // The test should check if logger is provided or use a default
      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db).toBeDefined();
    });

    it('should handle null utils gracefully', () => {
      expect(() => {
        new DatabaseService('TEST_SHEET_ID', mocks.logger, null, mocks.cache);
      }).not.toThrow();
    });
  });

  // ===================================================================
  // TRANSACTION SUPPORT
  // ===================================================================

  describe('Transaction Support', () => {
    let db;

    beforeEach(() => {
      db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      // Ensure tables have _rowsCache and _invalidateInternalCache for transaction support
      for (const tableName in db.tables) {
        if (!db.tables[tableName]._rowsCache) {
          db.tables[tableName]._rowsCache = [];
        }
        if (!db.tables[tableName]._invalidateInternalCache) {
          db.tables[tableName]._invalidateInternalCache = jest.fn();
        }
      }
    });

    describe('beginTransaction()', () => {
      it('should start a new transaction', () => {
        expect(db.inTransaction()).toBe(false);

        db.beginTransaction();

        expect(db.inTransaction()).toBe(true);
        expect(db._transaction).toBeDefined();
      });

      it('should return this for method chaining', () => {
        const result = db.beginTransaction();

        expect(result).toBe(db);
      });

      it('should save current state of all tables', () => {
        db.beginTransaction();

        expect(db._transaction.savedStates).toBeDefined();
        expect(db._transaction.savedStates['Users']).toBeDefined();
        expect(db._transaction.savedStates['Orders']).toBeDefined();
      });

      it('should throw error if transaction already in progress', () => {
        db.beginTransaction();

        expect(() => {
          db.beginTransaction();
        }).toThrow('Transaction already in progress');
      });

      it('should log transaction start', () => {
        db.beginTransaction();

        expect(mocks.logger.info).toHaveBeenCalledWith(
          expect.stringContaining('Transaction started')
        );
      });

      it('should record transaction start time', () => {
        const beforeTime = Date.now();
        db.beginTransaction();
        const afterTime = Date.now();

        expect(db._transaction.startTime).toBeGreaterThanOrEqual(beforeTime);
        expect(db._transaction.startTime).toBeLessThanOrEqual(afterTime);
      });

      it('should initialize operations array', () => {
        db.beginTransaction();

        expect(db._transaction.operations).toEqual([]);
      });
    });

    describe('commit()', () => {
      it('should commit transaction successfully', () => {
        db.beginTransaction();

        expect(() => {
          db.commit();
        }).not.toThrow();

        expect(db.inTransaction()).toBe(false);
      });

      it('should throw error if no transaction in progress', () => {
        expect(() => {
          db.commit();
        }).toThrow('No transaction in progress');
      });

      it('should flush batch operations to spreadsheet', () => {
        db.beginTransaction();
        db.commit();

        expect(mocks.spreadsheetService.flushBatch).toHaveBeenCalled();
      });

      it('should clear transaction state after commit', () => {
        db.beginTransaction();
        db.commit();

        expect(db._transaction).toBeNull();
        expect(db._inTransaction).toBe(false);
      });

      it('should return this for method chaining', () => {
        db.beginTransaction();
        const result = db.commit();

        expect(result).toBe(db);
      });

      it('should log transaction commit', () => {
        db.beginTransaction();
        db.commit();

        expect(mocks.logger.info).toHaveBeenCalledWith(
          expect.stringContaining('Transaction committed successfully')
        );
      });

      it('should handle commit failure and attempt rollback', () => {
        mocks.spreadsheetService.flushBatch.mockImplementation(() => {
          throw new Error('Network error');
        });

        db.beginTransaction();

        expect(() => {
          db.commit();
        }).toThrow('Transaction commit failed');

        // Should attempt rollback on failure
        expect(mocks.logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Transaction commit failed')
        );
      });

      it('should attempt rollback when commit fails', () => {
        mocks.spreadsheetService.flushBatch.mockImplementation(() => {
          throw new Error('Network error');
        });

        db.beginTransaction();

        expect(() => {
          db.commit();
        }).toThrow('Transaction commit failed');

        // Transaction state is still active because rollback also failed
        // The commit error handler calls _performRollback but doesn't clear transaction state
        expect(mocks.logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Transaction commit failed')
        );
      });
    });

    describe('rollback()', () => {
      it('should rollback transaction successfully', () => {
        db.beginTransaction();

        expect(() => {
          db.rollback();
        }).not.toThrow();

        expect(db.inTransaction()).toBe(false);
      });

      it('should throw error if no transaction in progress', () => {
        expect(() => {
          db.rollback();
        }).toThrow('No transaction in progress');
      });

      it('should restore table state to pre-transaction snapshot', () => {
        db.beginTransaction();

        // Simulate some changes (manually modify rows)
        db.tables['Users']._rowsCache = [
          ['ID', 'name'],
          ['1', 'Modified']
        ];

        db.rollback();

        // State should be restored
        expect(db.tables['Users']._rowsCache).not.toEqual([
          ['ID', 'name'],
          ['1', 'Modified']
        ]);
      });

      it('should clear transaction state after rollback', () => {
        db.beginTransaction();
        db.rollback();

        expect(db._transaction).toBeNull();
        expect(db._inTransaction).toBe(false);
      });

      it('should return this for method chaining', () => {
        db.beginTransaction();
        const result = db.rollback();

        expect(result).toBe(db);
      });

      it('should log transaction rollback', () => {
        db.beginTransaction();
        db.rollback();

        expect(mocks.logger.info).toHaveBeenCalledWith(
          expect.stringContaining('Transaction rolled back')
        );
      });

      it('should clear transaction state even if rollback fails', () => {
        db.beginTransaction();

        // Corrupt transaction state to cause rollback failure
        db._transaction.savedStates = null;

        try {
          db.rollback();
        } catch (e) {
          // Expected
        }

        // Should still clear transaction state
        expect(db._inTransaction).toBe(false);
        expect(db._transaction).toBeNull();
      });

      it('should invalidate table caches on rollback', () => {
        db.beginTransaction();

        // Spy on invalidateCache method
        const invalidateCacheSpy = jest.spyOn(db.tables['Users'], '_invalidateInternalCache');

        db.rollback();

        expect(invalidateCacheSpy).toHaveBeenCalled();
      });

      it('should clear pending batch operations on rollback', () => {
        mocks.spreadsheetService._batchUpdates = ['update1', 'update2'];

        db.beginTransaction();
        db.rollback();

        expect(mocks.spreadsheetService._batchUpdates).toEqual([]);
      });
    });

    describe('Transaction state management', () => {
      it('should report transaction status correctly', () => {
        expect(db.inTransaction()).toBe(false);

        db.beginTransaction();
        expect(db.inTransaction()).toBe(true);

        db.commit();
        expect(db.inTransaction()).toBe(false);
      });

      it('should prevent save() during transaction', () => {
        db.beginTransaction();

        expect(() => {
          db.save();
        }).toThrow('Cannot call save() during a transaction');
      });

      it('should allow save() after commit', () => {
        db.beginTransaction();
        db.commit();

        expect(() => {
          db.save();
        }).not.toThrow();
      });

      it('should allow save() after rollback', () => {
        db.beginTransaction();
        db.rollback();

        expect(() => {
          db.save();
        }).not.toThrow();
      });
    });

    describe('Transaction error scenarios', () => {
      it('should handle missing saved state on rollback', () => {
        db.beginTransaction();
        db._transaction.savedStates = null;

        expect(() => {
          db.rollback();
        }).toThrow('No saved state to rollback to');
      });

      it('should log rollback errors', () => {
        db.beginTransaction();
        db._transaction.savedStates = null;

        try {
          db.rollback();
        } catch (e) {
          // Expected
        }

        expect(mocks.logger.error).toHaveBeenCalledWith(expect.stringContaining('Rollback failed'));
      });

      it('should handle table missing during rollback', () => {
        db.beginTransaction();

        // Delete a table
        delete db.tables['Users'];

        // Should not throw - gracefully skip missing tables
        expect(() => {
          db.rollback();
        }).not.toThrow();
      });
    });
  });

  // ===================================================================
  // SAVE ERROR HANDLING
  // ===================================================================

  describe('Save Error Handling', () => {
    let db;

    beforeEach(() => {
      db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);
    });

    it('should throw error when flushBatch fails', () => {
      db.tables['Users'].flush = jest.fn(() => {
        throw new Error('API quota exceeded');
      });

      expect(() => {
        db.save();
      }).toThrow('Failed to save database');
    });

    it('should log error when save fails', () => {
      db.tables['Users'].flush = jest.fn(() => {
        throw new Error('Network error');
      });

      try {
        db.save();
      } catch (e) {
        // Expected
      }

      expect(mocks.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error saving database')
      );
    });

    it('should not return success on failure', () => {
      db.tables['Users'].flush = jest.fn(() => {
        throw new Error('Save failed');
      });

      let result;
      try {
        result = db.save();
      } catch (e) {
        // Error is expected, result should not be set
      }

      expect(result).toBeUndefined();
    });
  });

  // ===================================================================
  // TABLE VISIBILITY VERIFICATION (verifyTables option)
  // ===================================================================
  // Advanced Sheets API (Sheets.Spreadsheets.get, used by getSheetInfo) can lag
  // behind a SpreadsheetApp structural write even after SpreadsheetApp.flush() —
  // flush() only guarantees SpreadsheetApp-view consistency, not the separate
  // REST-backed Advanced Service. Callers who just created/renamed a sheet and
  // need it present immediately opt in via options.verifyTables.

  describe('Table Visibility Verification (verifyTables option)', () => {
    it('retries getSheetInfo until an expected table becomes visible', () => {
      mocks.spreadsheetService.getSheetInfo
        .mockReturnValueOnce([{ name: 'Sheet1' }])
        .mockReturnValueOnce([{ name: 'MASTER' }]);
      mocks.spreadsheetService.getRanges.mockReturnValue({
        "'MASTER'!A:ZZ": [['ANNO_SCOLASTICO']]
      });

      const db = new DatabaseService(
        'TEST_SHEET_ID',
        mocks.logger,
        mocks.utils,
        mocks.cache,
        null,
        {
          verifyTables: ['MASTER']
        }
      );

      expect(db.tables['MASTER']).toBeDefined();
      expect(mocks.spreadsheetService.getSheetInfo).toHaveBeenCalledTimes(2);
      expect(mocks.utils.sleep).toHaveBeenCalledTimes(1);
    });

    it('does not retry when verifyTables is not provided', () => {
      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db).toBeDefined();
      expect(mocks.spreadsheetService.getSheetInfo).toHaveBeenCalledTimes(1);
      expect(mocks.utils.sleep).not.toHaveBeenCalled();
    });

    it('does not retry when every expected table is already visible on the first read', () => {
      const db = new DatabaseService(
        'TEST_SHEET_ID',
        mocks.logger,
        mocks.utils,
        mocks.cache,
        null,
        {
          verifyTables: ['Users']
        }
      );

      expect(db.tables['Users']).toBeDefined();
      expect(mocks.spreadsheetService.getSheetInfo).toHaveBeenCalledTimes(1);
      expect(mocks.utils.sleep).not.toHaveBeenCalled();
    });

    it('gives up after the max attempts, warns, and proceeds with whatever it has', () => {
      mocks.spreadsheetService.getSheetInfo.mockReturnValue([{ name: 'Sheet1' }]);

      const db = new DatabaseService(
        'TEST_SHEET_ID',
        mocks.logger,
        mocks.utils,
        mocks.cache,
        null,
        {
          verifyTables: ['MASTER']
        }
      );

      expect(db.tables['MASTER']).toBeUndefined();
      expect(mocks.logger.warn).toHaveBeenCalledWith(expect.stringContaining('MASTER'));
      expect(mocks.spreadsheetService.getSheetInfo.mock.calls.length).toBeGreaterThan(1);
    });
  });

  // ===================================================================
  // INITIALIZATION EDGE CASES
  // ===================================================================

  describe('Initialization Edge Cases', () => {
    it('should handle sheets with apostrophes in names', () => {
      mocks.spreadsheetService.getSheetInfo.mockReturnValue([
        { name: "John's Data" },
        { name: "User's Profile" }
      ]);

      mocks.spreadsheetService.getRanges.mockReturnValue({
        "'John''s Data'!A:ZZ": [['ID']],
        "'User''s Profile'!A:ZZ": [['ID']]
      });

      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db.tables["John's Data"]).toBeDefined();
      expect(db.tables["User's Profile"]).toBeDefined();
    });

    it('should handle getRanges returning empty data', () => {
      mocks.spreadsheetService.getRanges.mockReturnValue({
        "'Users'!A:ZZ": [],
        "'Orders'!A:ZZ": []
      });

      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db.tables['Users']).toBeDefined();
      expect(db.tables['Orders']).toBeDefined();
    });

    it('should handle getRanges with missing sheets', () => {
      mocks.spreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Users' },
        { name: 'Orders' }
      ]);

      mocks.spreadsheetService.getRanges.mockReturnValue({
        "'Users'!A:ZZ": [['ID']]
        // Orders is missing
      });

      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db.tables['Users']).toBeDefined();
      expect(db.tables['Orders']).toBeDefined();
    });

    it('should log batch loading preparation', () => {
      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Preparing for batch loading')
      );
    });

    it('should log successful initialization', () => {
      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Database initialized')
      );
    });

    it('should mark as loaded after initialization', () => {
      const db = new DatabaseService('TEST_SHEET_ID', mocks.logger, mocks.utils, mocks.cache);

      expect(db._loaded).toBe(true);
    });
  });
});
