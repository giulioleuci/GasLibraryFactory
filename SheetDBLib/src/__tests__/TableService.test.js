/**
 * @file SheetDBLib/src/__tests__/TableService.test.js
 * @description Comprehensive test suite for TableService (ORM for Google Sheets)
 * Tests cover CRUD operations, lazy loading, schema validation, virtual columns, and indexing
 */

import { TableService } from '../TableService.js';
import { MockFactory } from '../../../test/fakes/MockFactory';
import { z } from 'zod';
import { SchemaValidator, ValidationException } from '@GasSchemaValidatorLib';

describe('TableService - Comprehensive Test Suite', () => {
  let mocks;
  let table;

  // Sample test data
  const sampleHeader = ['ID', 'name', 'email', 'age', 'status'];
  const sampleRawData = [
    sampleHeader,
    ['USER_001', 'Alice Johnson', 'alice@example.com', 30, 'active'],
    ['USER_002', 'Bob Smith', 'bob@example.com', 25, 'inactive'],
    ['USER_003', 'Charlie Brown', 'charlie@example.com', 35, 'active']
  ];

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    // Extend mocks.spreadsheetService with TableService-specific behavior
    mocks.spreadsheetService.getRanges.mockReturnValue(sampleRawData);
    mocks.spreadsheetService.updateRanges = jest.fn();
    mocks.spreadsheetService.insertRow = jest.fn();
    mocks.spreadsheetService.appendRows = jest.fn();
    mocks.spreadsheetService.deleteRow = jest.fn();
    mocks.spreadsheetService.deleteRows = jest.fn();
    mocks.spreadsheetService.getLastError = jest.fn(() => null);
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with lazy loading by default', () => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils
      );

      expect(table.sheetName).toBe('Users');
      expect(table.spreadsheetId).toBe('SPREADSHEET_ID_123');
      expect(table._dataLoaded).toBe(false);
      expect(table._rowsCache).toBeNull();
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('LAZY initialization')
      );
    });

    it('should initialize with eager loading when preloadedData is provided', () => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );

      expect(table._dataLoaded).toBe(true);
      expect(table._rowsCache).toHaveLength(3);
      expect(table.columns).toEqual(sampleHeader);
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('EAGER initialization')
      );
    });

    it('should determine primary key as "ID" when present', () => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );

      expect(table._keyField).toBe('ID');
    });

    it('should determine primary key as column ending with "_ID" when no "ID" column', () => {
      const customData = [
        ['user_id', 'name', 'email'],
        ['001', 'Alice', 'alice@example.com']
      ];
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        customData
      );

      expect(table._keyField).toBe('user_id');
    });

    it('should fallback to first column as primary key when no standard PK found', () => {
      const customData = [
        ['username', 'email'],
        ['alice', 'alice@example.com']
      ];
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        customData
      );

      expect(table._keyField).toBe('username');
    });

    it('should handle empty data gracefully', () => {
      const emptyData = [];
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        emptyData
      );

      expect(table.columns).toEqual([]);
      expect(table._rowsCache).toEqual([]);
      expect(mocks.logger.warn).toHaveBeenCalledWith(expect.stringContaining('No data'));
    });
  });

  describe('Lazy Loading Behavior', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils
      );
    });

    it('should load data on first getRows() call', () => {
      const rows = table.getRows();

      expect(table._dataLoaded).toBe(true);
      expect(rows).toHaveLength(3);
      expect(mocks.spreadsheetService.getRanges).toHaveBeenCalledWith(
        'SPREADSHEET_ID_123',
        "'Users'!A:ZZ"
      );
      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.stringContaining('Lazy loading data'));
    });

    it('should not reload data on subsequent getRows() calls', () => {
      table.getRows();
      mocks.spreadsheetService.getRanges.mockClear();

      table.getRows();

      expect(mocks.spreadsheetService.getRanges).not.toHaveBeenCalled();
    });

    it('should maintain cache validity after write operations (write-through)', () => {
      // Initial load
      table.getRows();
      mocks.spreadsheetService.getRanges.mockClear();

      // After insert, cache should still be valid (write-through)
      table.insertRow({ name: 'NewUser', email: 'new@example.com' });
      const rowsAfterInsert = table.getRows();

      // Should not reload from spreadsheet
      expect(mocks.spreadsheetService.getRanges).not.toHaveBeenCalled();
      // But should include the new row
      expect(rowsAfterInsert.length).toBe(4); // Original 3 + 1 new
    });
  });

  describe('getRows()', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should return all rows as objects', () => {
      const rows = table.getRows();

      expect(rows).toHaveLength(3);
      expect(rows[0]).toEqual({
        ID: 'USER_001',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        age: 30,
        status: 'active'
      });
    });

    it('should return a copy of rows (not original cache)', () => {
      const rows1 = table.getRows();
      const rows2 = table.getRows();

      expect(rows1).not.toBe(rows2);
      expect(rows1[0]).not.toBe(rows2[0]);
    });

    it('should include virtual columns in returned rows', () => {
      table.defineVirtualColumn('displayName', (row) => `${row.name} (${row.email})`);

      const rows = table.getRows();

      expect(rows[0].displayName).toBe('Alice Johnson (alice@example.com)');
    });
  });

  describe('insertRow()', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should insert a new row with auto-generated UUID for primary key', () => {
      const newRow = {
        name: 'David Lee',
        email: 'david@example.com',
        age: 28,
        status: 'active'
      };

      const result = table.insertRow(newRow);
      table.flush();

      expect(result.ID).toBe('GENERATED_UUID_123');
      expect(result.name).toBe('David Lee');
      expect(mocks.utils.generateUuid).toHaveBeenCalled();
      expect(mocks.spreadsheetService.appendRows).toHaveBeenCalledWith('SPREADSHEET_ID_123', {
        range: "'Users'!A1",
        values: [['GENERATED_UUID_123', 'David Lee', 'david@example.com', 28, 'active']]
      });
    });

    it('should use provided primary key if present', () => {
      const newRow = {
        ID: 'CUSTOM_ID_999',
        name: 'Eva Green',
        email: 'eva@example.com'
      };

      const result = table.insertRow(newRow);

      expect(result.ID).toBe('CUSTOM_ID_999');
      expect(mocks.utils.generateUuid).not.toHaveBeenCalled();
    });

    it('should handle missing optional fields', () => {
      const newRow = {
        name: 'Frank Miller'
      };

      table.insertRow(newRow);
      table.flush();

      expect(mocks.spreadsheetService.appendRows).toHaveBeenCalledWith('SPREADSHEET_ID_123', {
        range: "'Users'!A1",
        values: [['GENERATED_UUID_123', 'Frank Miller', '', '', '']]
      });
    });

    it('should update cache in-place after insertion (write-through)', () => {
      const newRow = { name: 'Grace Hopper' };

      expect(table._dataLoaded).toBe(true);
      const initialLength = table._rowsCache.length;
      table.insertRow(newRow);

      // OPTIMIZATION: Cache should be updated, not invalidated
      expect(table._dataLoaded).toBe(true);
      expect(table._rowsCache).not.toBeNull();
      expect(table._rowsCache.length).toBe(initialLength + 1);
    });

    it('should include virtual columns in returned object', () => {
      table.defineVirtualColumn('fullInfo', (row) => `${row.name} - ${row.email}`);

      const result = table.insertRow({ name: 'Henry Ford', email: 'henry@example.com' });

      expect(result.fullInfo).toBe('Henry Ford - henry@example.com');
    });

    it('should throw error if spreadsheet service reports an error', () => {
      mocks.spreadsheetService.appendRows.mockImplementation(() => {
        throw new Error('Insert failed');
      });

      table.insertRow({ name: 'Test' });
      expect(() => {
        table.flush();
      }).toThrow('Insert failed');
    });

    it('should log error and re-throw on service exception', () => {
      mocks.spreadsheetService.appendRows.mockImplementation(() => {
        throw new Error('Network error');
      });

      table.insertRow({ name: 'Test' });
      expect(() => {
        table.flush();
      }).toThrow('Network error');
    });
  });

  describe('insertRows()', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
      // Reset generateUuid mock to return unique values instead of always same
      mocks.utils.generateUuid.mockImplementation(() => `UUID_${Math.random()}`);
    });

    it('should insert multiple rows efficiently', () => {
      const newRows = [
        { name: 'David Lee', email: 'david@example.com', age: 28, status: 'active' },
        { name: 'Diana Prince', email: 'diana@example.com', age: 32, status: 'active' }
      ];

      const results = table.insertRows(newRows);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('David Lee');
      expect(results[1].name).toBe('Diana Prince');
      expect(results[0].ID).toBeDefined();
      expect(results[1].ID).toBeDefined();
      expect(table._insertQueue).toHaveLength(2);
      expect(table._rowsCache).toHaveLength(5); // 3 original + 2 new
    });

    it('should return empty array if empty array provided', () => {
      expect(table.insertRows([])).toEqual([]);
      expect(table.insertRows(null)).toEqual([]);
    });

    it('should throw error if validation fails for any row without altering queue', () => {
      const schemaValidator = new SchemaValidator(mocks.logger);
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData,
        schemaValidator
      );
      table.setSchema(z.object({ name: z.string() }));

      const newRows = [
        { name: 'Valid User' },
        { age: 99 } // Missing required name
      ];

      expect(() => {
        table.insertRows(newRows);
      }).toThrow();

      // Cache should remain unchanged if validation fails before queueing
      expect(table._insertQueue).toHaveLength(0);
      expect(table._rowsCache).toHaveLength(3);
    });
  });

  describe('updateRowById()', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should update an existing row by ID', () => {
      const updates = {
        email: 'alice.new@example.com',
        status: 'inactive'
      };

      const result = table.updateRowById('USER_001', updates);
      table.flush();

      expect(result.email).toBe('alice.new@example.com');
      expect(result.status).toBe('inactive');
      expect(result.name).toBe('Alice Johnson'); // unchanged fields preserved

      expect(mocks.spreadsheetService.updateRanges).toHaveBeenCalledWith('SPREADSHEET_ID_123', [
        {
          range: 'Users!A2:E2',
          values: [['USER_001', 'Alice Johnson', 'alice.new@example.com', 30, 'inactive']]
        }
      ]);
    });

    it('should throw error if row not found', () => {
      expect(() => {
        table.updateRowById('NONEXISTENT_ID', { name: 'Test' });
      }).toThrow('No row found with ID=NONEXISTENT_ID');

      expect(mocks.logger.error).toHaveBeenCalledWith(expect.stringContaining('No row found'));
    });

    it('should handle partial updates', () => {
      const result = table.updateRowById('USER_002', { age: 26 });

      expect(result.age).toBe(26);
      expect(result.name).toBe('Bob Smith');
      expect(result.email).toBe('bob@example.com');
    });

    it('should update cache in-place after update (write-through)', () => {
      table.updateRowById('USER_001', { name: 'Updated Name' });

      // OPTIMIZATION: Cache should be updated, not invalidated
      expect(table._dataLoaded).toBe(true);
      expect(table._rowsCache).not.toBeNull();
      expect(table._rowsCache[0].name).toBe('Updated Name');
    });

    it('should include virtual columns in returned object', () => {
      table.defineVirtualColumn('isAdult', (row) => row.age >= 18);

      const result = table.updateRowById('USER_001', { age: 40 });

      expect(result.isAdult).toBe(true);
    });

    it('should throw error and re-throw on service exception', () => {
      mocks.spreadsheetService.updateRanges.mockImplementation(() => {
        throw new Error('Update failed');
      });

      table.updateRowById('USER_001', { name: 'Test' });
      expect(() => {
        table.flush();
      }).toThrow('Update failed');
    });
  });

  describe('deleteRowById()', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should delete a row by ID and return the deleted row', () => {
      const result = table.deleteRowById('USER_002');
      table.flush();

      expect(result).toEqual({
        ID: 'USER_002',
        name: 'Bob Smith',
        email: 'bob@example.com',
        age: 25,
        status: 'inactive'
      });

      expect(mocks.spreadsheetService.deleteRows).toHaveBeenCalledWith(
        'SPREADSHEET_ID_123',
        'Users',
        [3] // row 2 in pk mapping = row 3 in sheet
      );
    });

    it('should return null if row not found', () => {
      const result = table.deleteRowById('NONEXISTENT_ID');

      expect(result).toBeNull();
      expect(mocks.logger.warn).toHaveBeenCalledWith(expect.stringContaining('No row found'));
      expect(mocks.spreadsheetService.deleteRow).not.toHaveBeenCalled();
    });

    it('should update cache in-place after deletion (write-through)', () => {
      const initialLength = table._rowsCache.length;
      table.deleteRowById('USER_001');

      // OPTIMIZATION: Cache should be updated, not invalidated
      expect(table._dataLoaded).toBe(true);
      expect(table._rowsCache).not.toBeNull();
      expect(table._rowsCache.length).toBe(initialLength - 1);
    });

    it('should throw error if service reports an error', () => {
      mocks.spreadsheetService.deleteRows.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      table.deleteRowById('USER_001');
      expect(() => {
        table.flush();
      }).toThrow('Delete failed');
    });

    it('should throw error and re-throw on service exception', () => {
      mocks.spreadsheetService.deleteRows.mockImplementation(() => {
        throw new Error('Network error');
      });

      table.deleteRowById('USER_001');
      expect(() => {
        table.flush();
      }).toThrow('Network error');
    });
  });

  describe('updateRowsByIds()', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should update multiple rows efficiently', () => {
      const updates = {
        USER_001: { age: 31 },
        USER_002: { status: 'active' }
      };
      const results = table.updateRowsByIds(updates);

      expect(results).toHaveLength(2);
      expect(results[0].age).toBe(31);
      expect(results[1].status).toBe('active');
      expect(table._updateQueue.has('USER_001')).toBe(true);
      expect(table._updateQueue.has('USER_002')).toBe(true);

      // Verify cache
      expect(table._rowsCache[0].age).toBe(31);
      expect(table._rowsCache[1].status).toBe('active');
    });

    it('should return empty array if no updates provided', () => {
      expect(table.updateRowsByIds(null)).toEqual([]);
      expect(table.updateRowsByIds({})).toEqual([]);
    });

    it('should gracefully handle errors for individual IDs', () => {
      const updates = {
        USER_001: { age: 31 },
        NONEXISTENT_ID: { age: 99 }
      };

      const results = table.updateRowsByIds(updates);

      expect(results).toHaveLength(1);
      expect(results[0].ID).toBe('USER_001');
      expect(mocks.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No row found with ID=NONEXISTENT_ID')
      );
    });
  });

  describe('deleteRowsByIds()', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should delete multiple rows efficiently', () => {
      const ids = ['USER_001', 'USER_002'];
      const results = table.deleteRowsByIds(ids);

      expect(results).toHaveLength(2);
      expect(results[0].ID).toBe('USER_001');
      expect(results[1].ID).toBe('USER_002');
      expect(table._deleteQueue.has('USER_001')).toBe(true);
      expect(table._deleteQueue.has('USER_002')).toBe(true);

      // Verify cache (2 rows deleted, 1 remaining)
      expect(table._rowsCache).toHaveLength(1);
      expect(table._rowsCache[0].ID).toBe('USER_003');
    });

    it('should return empty array if no ids provided', () => {
      expect(table.deleteRowsByIds(null)).toEqual([]);
      expect(table.deleteRowsByIds([])).toEqual([]);
    });

    it('should gracefully handle errors for individual IDs', () => {
      const ids = ['USER_001', 'NONEXISTENT_ID'];

      const results = table.deleteRowsByIds(ids);

      expect(results).toHaveLength(1);
      expect(results[0].ID).toBe('USER_001');
      // No row found logs as warn in deleteRowById, throwing no error to catch in deleteRowsByIds
    });
  });

  describe('Primary Key Management', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should allow manual setting of primary key', () => {
      expect(table._keyField).toBe('ID');

      table.setPrimaryKey('email');

      expect(table._keyField).toBe('email');
    });

    it('should return this for method chaining', () => {
      const result = table.setPrimaryKey('email');

      expect(result).toBe(table);
    });

    it('should use new primary key for lookups after setPrimaryKey', () => {
      table.setPrimaryKey('email');

      const row = table.getByPK('alice@example.com');

      expect(row).not.toBeNull();
      expect(row.name).toBe('Alice Johnson');
    });
  });

  describe('getRowById() and getByPK()', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should retrieve a row by primary key', () => {
      const row = table.getRowById('USER_002');

      expect(row).toEqual({
        ID: 'USER_002',
        name: 'Bob Smith',
        email: 'bob@example.com',
        age: 25,
        status: 'inactive'
      });
    });

    it('should return null if row not found', () => {
      const row = table.getRowById('NONEXISTENT_ID');

      expect(row).toBeNull();
    });

    it('should include virtual columns in returned row', () => {
      table.defineVirtualColumn('shortName', (row) => row.name.split(' ')[0]);

      const row = table.getRowById('USER_001');

      expect(row.shortName).toBe('Alice');
    });

    it('should work with getByPK() alias', () => {
      const row1 = table.getRowById('USER_003');
      const row2 = table.getByPK('USER_003');

      expect(row1).toEqual(row2);
    });

    it('should return a copy of the row (not original cache)', () => {
      const row1 = table.getRowById('USER_001');
      const row2 = table.getRowById('USER_001');

      expect(row1).not.toBe(row2);
      expect(row1).toEqual(row2);
    });
  });

  describe('Schema Validation (Zod)', () => {
    let schemaValidator;

    beforeEach(() => {
      schemaValidator = new SchemaValidator(mocks.logger);
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData,
        schemaValidator
      );
    });

    it('should accept a Zod schema via setSchema()', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      table.setSchema(schema);
      expect(table._schema).toBe(schema);
      expect(table._schemaValidationEnabled).toBe(true);
    });

    it('should throw ConfigurationError if setSchema receives non-Zod object', () => {
      expect(() => table.setSchema({ fields: {} })).toThrow();
    });

    it('should validate and coerce data via SchemaValidator', () => {
      const schema = z.object({ name: z.string(), age: z.coerce.number() });
      table.setSchema(schema);
      const result = table._validateRow({ name: 'Alice', age: '30' });
      expect(result.age).toBe(30);
    });

    it('should throw ValidationException on invalid row', () => {
      const schema = z.object({ name: z.string() });
      table.setSchema(schema);
      expect(() => table._validateRow({ name: 123 })).toThrow(ValidationException);
    });

    it('should use .partial() schema for updates', () => {
      const schema = z.object({ name: z.string(), email: z.string().email() });
      table.setSchema(schema);
      const result = table._validateRow({ name: 'Bob' }, true);
      expect(result.name).toBe('Bob');
    });

    it('should throw ConfigurationError when no SchemaValidator provided but schema is set', () => {
      const tableWithoutValidator = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData,
        null
      );
      const schema = z.object({ name: z.string() });
      tableWithoutValidator.setSchema(schema);
      expect(() => tableWithoutValidator._validateRow({ name: 'Alice' })).toThrow(
        'Schema validation requires a SchemaValidator instance'
      );
    });

    it('should skip validation when schema not set', () => {
      const row = { name: 'Alice', age: 30 };
      expect(table._validateRow(row)).toEqual(row);
    });

    it('should enable and disable schema validation', () => {
      const schema = z.object({ name: z.string() });
      table.setSchema(schema);
      expect(table._schemaValidationEnabled).toBe(true);

      table.disableSchemaValidation();
      expect(table._schemaValidationEnabled).toBe(false);

      table.enableSchemaValidation();
      expect(table._schemaValidationEnabled).toBe(true);
    });

    it('should throw error when enabling validation without schema', () => {
      expect(() => {
        table.enableSchemaValidation();
      }).toThrow('Cannot enable schema validation: no schema has been set');
    });
  });

  describe('Virtual Columns', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should define a virtual column', () => {
      const result = table.defineVirtualColumn('fullName', (row) => `${row.name} (${row.email})`);

      expect(table._virtualColumns.fullName).toBeInstanceOf(Function);
      expect(table.columns).toContain('fullName');
      expect(result).toBe(table);
    });

    it('should throw error if compute function is not a function', () => {
      expect(() => {
        table.defineVirtualColumn('invalid', 'not a function');
      }).toThrow('The compute function for virtual column "invalid" must be a function');
    });

    it('should compute virtual column values in getRows()', () => {
      table.defineVirtualColumn('displayName', (row) => `${row.name} - ${row.status}`);

      const rows = table.getRows();

      expect(rows[0].displayName).toBe('Alice Johnson - active');
      expect(rows[1].displayName).toBe('Bob Smith - inactive');
    });

    it('should compute multiple virtual columns', () => {
      table.defineVirtualColumn('firstName', (row) => row.name.split(' ')[0]);
      table.defineVirtualColumn('isActive', (row) => row.status === 'active');
      table.defineVirtualColumn(
        'summary',
        (row) => `${row.firstName} (${row.isActive ? 'Active' : 'Inactive'})`
      );

      const rows = table.getRows();

      expect(rows[0].firstName).toBe('Alice');
      expect(rows[0].isActive).toBe(true);
      expect(rows[0].summary).toBe('Alice (Active)');
    });

    it('should handle errors in virtual column computation gracefully', () => {
      table.defineVirtualColumn('errorColumn', (row) => {
        throw new Error('Computation error');
      });

      const rows = table.getRows();

      expect(rows[0].errorColumn).toBeNull();
      expect(mocks.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Error computing virtual column')
      );
    });

    it('should include virtual columns in getRowById()', () => {
      table.defineVirtualColumn('shortName', (row) => row.name.split(' ')[0]);

      const row = table.getRowById('USER_001');

      expect(row.shortName).toBe('Alice');
    });

    it('should not include virtual columns in physical column data on insert', () => {
      table.defineVirtualColumn('computed', (row) => 'virtual-value');

      table.insertRow({ name: 'Test User', email: 'test@example.com' });
      table.flush();

      // Virtual column should not be in the appendRows call
      expect(mocks.spreadsheetService.appendRows).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          values: expect.not.arrayContaining([expect.arrayContaining(['virtual-value'])])
        })
      );
    });
  });

  describe('Indexing for Performance', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should create an index on a column', () => {
      const result = table.createIndex('status');

      expect(table._indices.status).toBeInstanceOf(Map);
      expect(result).toBe(table);
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Index created on column "status"')
      );
    });

    it('should throw error when creating index on non-existent column', () => {
      expect(() => {
        table.createIndex('nonExistentColumn');
      }).toThrow('Cannot create index on non-existent column');
    });

    it('should build index with correct values', () => {
      table.createIndex('status');

      const index = table._indices.status;
      expect(index.get('active')).toHaveLength(2); // Alice and Charlie
      expect(index.get('inactive')).toHaveLength(1); // Bob
    });

    it('should handle null and undefined values in index', () => {
      const dataWithNulls = [
        ['ID', 'name', 'category'],
        ['1', 'Item 1', 'A'],
        ['2', 'Item 2', null],
        ['3', 'Item 3', undefined]
      ];
      table = new TableService(
        'Items',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        dataWithNulls
      );

      table.createIndex('category');

      const index = table._indices.category;
      expect(index.get('A')).toHaveLength(1);
      expect(index.has(null)).toBe(false);
      expect(index.has(undefined)).toBe(false);
    });

    it('should invalidate index when data changes', () => {
      table.createIndex('email');
      expect(table._indices.email).toBeDefined();

      table.insertRow({ name: 'New User', email: 'new@example.com' });

      expect(table._indices).toEqual({});
    });

    it('should use index for fast lookups when available', () => {
      table.createIndex('email');

      const results = table._indexedLookup('email', 'alice@example.com');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice Johnson');
    });

    it('should return null if no index available for column', () => {
      const results = table._indexedLookup('email', 'alice@example.com');

      expect(results).toBeNull();
    });

    it('should return empty array if no matches in index', () => {
      table.createIndex('email');

      const results = table._indexedLookup('email', 'nonexistent@example.com');

      expect(results).toEqual([]);
    });
  });

  describe('Column Index Conversion (_convertIndexToColumn)', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should convert single-letter column indices correctly', () => {
      expect(table._convertIndexToColumn(1)).toBe('A');
      expect(table._convertIndexToColumn(5)).toBe('E');
      expect(table._convertIndexToColumn(26)).toBe('Z');
    });

    it('should convert double-letter column indices correctly', () => {
      expect(table._convertIndexToColumn(27)).toBe('AA');
      expect(table._convertIndexToColumn(52)).toBe('AZ');
      expect(table._convertIndexToColumn(53)).toBe('BA');
    });

    it('should convert triple-letter column indices correctly', () => {
      expect(table._convertIndexToColumn(702)).toBe('ZZ');
      expect(table._convertIndexToColumn(703)).toBe('AAA');
    });
  });

  describe('Write-Through Cache Optimization', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should update cache in-place on insertRow', () => {
      const initialRows = table.getRows();
      const initialLength = initialRows.length;

      table.insertRow({ name: 'Dave', email: 'dave@example.com' });

      // Cache should be updated without reloading
      expect(table._rowsCache.length).toBe(initialLength + 1);
      expect(table._dataLoaded).toBe(true);

      const newRows = table.getRows();
      expect(newRows.length).toBe(initialLength + 1);
      expect(newRows[newRows.length - 1].name).toBe('Dave');
    });

    it('should update cache in-place on insertRows', () => {
      const initialRows = table.getRows();
      const initialLength = initialRows.length;

      table.insertRows([
        { name: 'Dave', email: 'dave@example.com' },
        { name: 'Eve', email: 'eve@example.com' }
      ]);

      // Cache should be updated without reloading
      expect(table._rowsCache.length).toBe(initialLength + 2);
      expect(table._dataLoaded).toBe(true);

      const newRows = table.getRows();
      expect(newRows.length).toBe(initialLength + 2);
    });

    it('should update cache in-place on updateRowById', () => {
      table.getRows();
      const firstRow = table._rowsCache[0];
      const originalId = firstRow.ID;

      table.updateRowById(originalId, { email: 'updated@example.com' });

      // Cache should be updated without reloading
      expect(table._dataLoaded).toBe(true);
      expect(table._rowsCache[0].email).toBe('updated@example.com');
    });

    it('should update cache in-place on patchRow', () => {
      table.getRows();
      const firstRow = table._rowsCache[0];
      const originalId = firstRow.ID;
      const originalName = firstRow.name;

      table.patchRow(originalId, { email: 'patched@example.com' });

      // Cache should be updated without reloading
      expect(table._dataLoaded).toBe(true);
      expect(table._rowsCache[0].email).toBe('patched@example.com');
      expect(table._rowsCache[0].name).toBe(originalName); // Other fields unchanged
    });

    it('should update cache in-place on deleteRowById', () => {
      const initialRows = table.getRows();
      const initialLength = initialRows.length;
      const firstRowId = initialRows[0].ID;

      table.deleteRowById(firstRowId);

      // Cache should be updated without reloading
      expect(table._dataLoaded).toBe(true);
      expect(table._rowsCache.length).toBe(initialLength - 1);

      const newRows = table.getRows();
      expect(newRows.length).toBe(initialLength - 1);
      expect(newRows.find((r) => r.ID === firstRowId)).toBeUndefined();
    });

    it('should invalidate processed cache but keep data cache', () => {
      table.getRows();
      const originalCache = table._rowsCache;

      table.insertRow({ name: 'Dave', email: 'dave@example.com' });

      // Data cache should be the same object (mutated, not replaced)
      expect(table._rowsCache).toBe(originalCache);
      // Processed cache should be invalidated
      expect(table._processedRowsCache).toBeNull();
    });
  });

  describe('Cache Invalidation', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
      table.createIndex('email');
    });

    it('should invalidate data cache only when specified', () => {
      table._invalidateInternalCache({ data: true, indices: false });

      expect(table._dataLoaded).toBe(false);
      expect(table._rowsCache).toBeNull();
      expect(table._indices.email).toBeDefined();
    });

    it('should invalidate indices only when specified', () => {
      table._invalidateInternalCache({ data: false, indices: true });

      expect(table._dataLoaded).toBe(true);
      expect(table._rowsCache).not.toBeNull();
      expect(table._indices).toEqual({});
    });

    it('should invalidate both by default', () => {
      table._invalidateInternalCache();

      expect(table._dataLoaded).toBe(false);
      expect(table._rowsCache).toBeNull();
      expect(table._indices).toEqual({});
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle rows with missing cells gracefully', () => {
      const sparseData = [
        ['ID', 'name', 'email', 'age'],
        ['1', 'Alice'], // missing email and age
        ['2', 'Bob', 'bob@example.com'] // missing age
      ];
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sparseData
      );

      const rows = table.getRows();

      expect(rows[0]).toEqual({ ID: 1, name: 'Alice', email: null, age: null });
      expect(rows[1]).toEqual({ ID: 2, name: 'Bob', email: 'bob@example.com', age: null });
    });

    it('should skip completely empty rows in data', () => {
      const dataWithEmptyRows = [
        ['ID', 'name'],
        ['1', 'Alice'],
        ['', ''], // empty row
        [null, null], // null row
        ['2', 'Bob']
      ];
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        dataWithEmptyRows
      );

      const rows = table.getRows();

      expect(rows).toHaveLength(2);
      expect(rows[0].name).toBe('Alice');
      expect(rows[1].name).toBe('Bob');
    });

    it('should filter out empty column headers', () => {
      const dataWithEmptyHeaders = [
        ['ID', '', 'name', null, 'email', '   '],
        ['1', 'ignored1', 'Alice', 'ignored2', 'alice@example.com', 'ignored3']
      ];
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        dataWithEmptyHeaders
      );

      expect(table.columns).toEqual(['ID', 'name', 'email']);
    });

    it('should handle lazy loading when no header is found', () => {
      mocks.spreadsheetService.getRanges.mockReturnValueOnce([]);

      expect(() => {
        table = new TableService(
          'Users',
          'SPREADSHEET_ID_123',
          mocks.spreadsheetService,
          mocks.logger,
          mocks.utils
        );
      }).toThrow('No header found in sheet Users');
    });

    it('should handle update with invalid row index gracefully', () => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );

      expect(() => {
        table.updateRowById('INVALID_ID', { name: 'Test' });
      }).toThrow('No row found');
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
    });

    it('should handle complete CRUD workflow', () => {
      // Read
      const rows = table.getRows();
      expect(rows).toHaveLength(3);

      // Create
      const newUser = table.insertRow({ name: 'Diana Prince', email: 'diana@example.com' });
      expect(newUser.ID).toBe('GENERATED_UUID_123');

      // Update (need to mock the reload after insert)
      const updatedData = [
        sampleHeader,
        ...sampleRawData.slice(1),
        ['GENERATED_UUID_123', 'Diana Prince', 'diana@example.com', '', '']
      ];

      // Mock getRanges to return the updated data after insertion
      mocks.spreadsheetService.getRanges.mockReturnValue(updatedData);

      const updated = table.updateRowById('GENERATED_UUID_123', { status: 'active' });
      expect(updated.status).toBe('active');

      // Update the mocked data to reflect the update
      updatedData[4] = ['GENERATED_UUID_123', 'Diana Prince', 'diana@example.com', '', 'active'];

      // Delete
      const deleted = table.deleteRowById('GENERATED_UUID_123');
      expect(deleted.name).toBe('Diana Prince');
    });

    it('should work with custom primary key and virtual columns', () => {
      table.setPrimaryKey('email');
      table.defineVirtualColumn('displayName', (row) => `${row.name} <${row.email}>`);

      const user = table.getByPK('alice@example.com');

      expect(user.displayName).toBe('Alice Johnson <alice@example.com>');
    });

    it('should work with schema validation and virtual columns together', () => {
      const schemaValidator = new SchemaValidator(mocks.logger);
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData,
        schemaValidator
      );
      table.setSchema(
        z.object({
          name: z.string(),
          age: z.number().min(0)
        })
      );

      table.defineVirtualColumn('ageGroup', (row) => {
        if (row.age < 18) {
          return 'minor';
        }
        if (row.age < 65) {
          return 'adult';
        }
        return 'senior';
      });

      const newUser = table.insertRow({ name: 'Test User', age: 30 });

      expect(newUser.ageGroup).toBe('adult');
    });

    it('should work with indexing for fast lookups', () => {
      table.createIndex('status');

      const activeUsers = table._indexedLookup('status', 'active');

      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.map((u) => u.name)).toContain('Alice Johnson');
      expect(activeUsers.map((u) => u.name)).toContain('Charlie Brown');
    });
  });

  describe('Dirty Checking Optimization', () => {
    beforeEach(() => {
      // Initialize table with sample data
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        sampleRawData
      );
      mocks.spreadsheetService.updateRanges.mockClear();
    });

    it('should skip API call when updating row with unchanged data', () => {
      // Get the original row data
      const originalRow = table.getRowById('USER_001');

      // Try to update with the same data
      const result = table.updateRowById('USER_001', {
        name: originalRow.name,
        email: originalRow.email,
        status: originalRow.status,
        age: originalRow.age
      });
      table.flush();

      // Verify that updateRanges was NOT called (dirty checking prevented the API call)
      expect(mocks.spreadsheetService.updateRanges).not.toHaveBeenCalled();

      // Verify that the row data is still correct
      expect(result.name).toBe(originalRow.name);
      expect(result.email).toBe(originalRow.email);
    });

    it('should make API call when updating row with changed data', () => {
      mocks.spreadsheetService.updateRanges.mockClear();

      // Update with different data
      table.updateRowById('USER_001', {
        email: 'newemail@example.com'
      });
      table.flush();

      // Verify that updateRanges WAS called (data changed)
      expect(mocks.spreadsheetService.updateRanges).toHaveBeenCalled();
    });

    it('should detect changes in nested updates', () => {
      mocks.spreadsheetService.updateRanges.mockClear();

      // First update
      table.updateRowById('USER_001', {
        email: 'updated@example.com'
      });
      table.flush();

      expect(mocks.spreadsheetService.updateRanges).toHaveBeenCalledTimes(1);

      mocks.spreadsheetService.updateRanges.mockClear();

      // Try to update with the same data
      table.updateRowById('USER_001', {
        email: 'updated@example.com'
      });
      table.flush();

      // Should not call API again
      expect(mocks.spreadsheetService.updateRanges).not.toHaveBeenCalled();
    });

    it('should store original data for newly inserted rows', () => {
      mocks.spreadsheetService.updateRanges.mockClear();

      // Insert a new row with all fields
      const newUser = table.insertRow({
        name: 'New User',
        email: 'new@example.com',
        status: 'active',
        age: 28
      });

      // Verify original data is stored
      expect(table._originalRowData.has(newUser.ID)).toBe(true);

      mocks.spreadsheetService.updateRanges.mockClear();

      // Try to update with the exact same data (all fields)
      table.updateRowById(newUser.ID, {
        name: 'New User',
        email: 'new@example.com',
        status: 'active',
        age: 28
      });

      // Should not call API since data hasn't changed
      expect(mocks.spreadsheetService.updateRanges).not.toHaveBeenCalled();
    });

    it('should remove original data when row is deleted', () => {
      // Verify original data exists
      expect(table._originalRowData.has('USER_001')).toBe(true);

      // Delete the row
      table.deleteRowById('USER_001');

      // Verify original data is removed
      expect(table._originalRowData.has('USER_001')).toBe(false);
    });

    it('should clear original data when cache is invalidated', () => {
      // Verify original data exists
      expect(table._originalRowData.size).toBeGreaterThan(0);

      // Invalidate cache
      table._invalidateInternalCache({ data: true });

      // Verify original data is cleared
      expect(table._originalRowData.size).toBe(0);
    });
  });

  describe('Fuzzy Search (Fuse.js Integration)', () => {
    beforeEach(() => {
      // Create sample data with names that can be fuzzy-matched
      const fuzzyTestData = [
        ['ID', 'name', 'email', 'city'],
        ['USER_001', 'Giuseppe', 'giuseppe@example.com', 'Rome'],
        ['USER_002', 'Giovanni', 'giovanni@example.com', 'Milan'],
        ['USER_003', 'Alessandro', 'alessandro@example.com', 'Florence'],
        ['USER_004', 'Francesco', 'francesco@example.com', 'Venice']
      ];
      table = new TableService(
        'Users',
        'SPREADSHEET_ID_123',
        mocks.spreadsheetService,
        mocks.logger,
        mocks.utils,
        fuzzyTestData
      );
    });

    it('should find exact matches', () => {
      const results = table.fuzzySearch('Giuseppe', ['name']);

      expect(results).toHaveLength(1);
      expect(results[0].item.name).toBe('Giuseppe');
      expect(results[0].score).toBeLessThan(0.1); // Very close to 0 for exact match
    });

    it('should find approximate matches with typos', () => {
      // Searching for 'Giusepe' should match 'Giuseppe'
      const results = table.fuzzySearch('Giusepe', ['name'], 0.3);

      expect(results.length).toBeGreaterThan(0);
      const names = results.map((r) => r.item.name);
      expect(names).toContain('Giuseppe');
    });

    it('should search across multiple fields', () => {
      const results = table.fuzzySearch('rome', ['name', 'city'], 0.3);

      expect(results.length).toBeGreaterThan(0);
      const cities = results.map((r) => r.item.city);
      expect(cities).toContain('Rome');
    });

    it('should respect threshold parameter', () => {
      // With strict threshold, typo should not match
      const strictResults = table.fuzzySearch('Giusepe', ['name'], 0.1);
      expect(strictResults).toHaveLength(0);

      // With lenient threshold, typo should match
      const lenientResults = table.fuzzySearch('Giusepe', ['name'], 0.5);
      expect(lenientResults.length).toBeGreaterThan(0);
    });

    it('should return results with scores', () => {
      const results = table.fuzzySearch('Giovani', ['name'], 0.3);

      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result).toHaveProperty('item');
        expect(result).toHaveProperty('score');
        expect(typeof result.score).toBe('number');
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
      });
    });

    it('should throw error for invalid query', () => {
      expect(() => table.fuzzySearch('', ['name'])).toThrow('Query must be a non-empty string');
      expect(() => table.fuzzySearch(null, ['name'])).toThrow('Query must be a non-empty string');
      expect(() => table.fuzzySearch(123, ['name'])).toThrow('Query must be a non-empty string');
    });

    it('should throw error for invalid fields', () => {
      expect(() => table.fuzzySearch('test', [])).toThrow('Fields must be a non-empty array');
      expect(() => table.fuzzySearch('test', null)).toThrow('Fields must be a non-empty array');
      expect(() => table.fuzzySearch('test', 'name')).toThrow('Fields must be a non-empty array');
    });

    it('should throw error for invalid threshold', () => {
      expect(() => table.fuzzySearch('test', ['name'], -0.1)).toThrow(
        'Threshold must be a number between 0 and 1'
      );
      expect(() => table.fuzzySearch('test', ['name'], 1.5)).toThrow(
        'Threshold must be a number between 0 and 1'
      );
      expect(() => table.fuzzySearch('test', ['name'], 'invalid')).toThrow(
        'Threshold must be a number between 0 and 1'
      );
    });

    it('should work with virtual columns', () => {
      // Define a virtual column
      table.defineVirtualColumn('fullInfo', (row) => `${row.name} from ${row.city}`);

      // Search in virtual column
      const results = table.fuzzySearch('Giuseppe from Rome', ['fullInfo'], 0.3);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Giuseppe');
      expect(results[0].item.city).toBe('Rome');
    });

    it('should return empty array when no matches found', () => {
      const results = table.fuzzySearch('zzzzzzz', ['name'], 0.3);

      expect(results).toEqual([]);
    });

    it('should support custom Fuse.js options', () => {
      const results = table.fuzzySearch('Francesco', ['name'], 0.3, {
        includeMatches: true
      });

      expect(results.length).toBeGreaterThan(0);
      // When includeMatches is true, Fuse.js includes match details
      expect(results[0]).toHaveProperty('matches');
    });
  });
});
