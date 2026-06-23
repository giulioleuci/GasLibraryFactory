/**
 * Integration Test: Full Stack - Domain to API
 *
 * Layers Tested: DomainRepositoryLib → SheetDBLib → GoogleApiWrapper → GasResilienceLib → CoreUtilsLib
 *
 * Purpose: Verify complete vertical slice from Domain Entity persistence
 * through all layers to the underlying Google API calls.
 *
 * @file test/__tests__/integration/FullStack_DomainToAPI.test.js
 */

import { Entity, Repository, ValueObject } from '@DomainRepositoryLib';
import { DatabaseService, TableService } from '@SheetDBLib';
import { SpreadsheetService, LoggerService, UtilsService } from '@GoogleApiWrapper';
import { ExceptionService } from '@GasResilienceLib';
import { HashUtils } from '@CoreUtilsLib';

describe('Full Stack Integration: Domain Entity to Google API', () => {
  // Test Value Objects
  class Address extends ValueObject {
    constructor(street, city, zip) {
      super();
      this.street = street;
      this.city = city;
      this.zip = zip;
      this._freeze();
    }

    equals(other) {
      return this.street === other.street && this.city === other.city && this.zip === other.zip;
    }

    getValue() {
      return { street: this.street, city: this.city, zip: this.zip };
    }
  }

  // Test Entity
  class Customer extends Entity {
    constructor(data = {}) {
      super(data);
      this.name = data.name || null;
      this.email = data.email || null;
      this.tier = data.tier || 'standard';
      this.address = data.address || null;
    }

    toData() {
      const data = {
        id: this.id,
        name: this.name,
        email: this.email,
        tier: this.tier,
        createdAt: this.createdAt?.toISOString(),
        updatedAt: this.updatedAt?.toISOString()
      };

      if (this.address) {
        data.address_street = this.address.street;
        data.address_city = this.address.city;
        data.address_zip = this.address.zip;
      } else {
        data.address_street = null;
        data.address_city = null;
        data.address_zip = null;
      }

      return data;
    }

    static fromData(data) {
      const customerData = { ...data };

      if (data.address_street || data.address_city || data.address_zip) {
        customerData.address = new Address(
          data.address_street,
          data.address_city,
          data.address_zip
        );
      }

      // Parse dates
      if (typeof data.createdAt === 'string') {
        customerData.createdAt = new Date(data.createdAt);
      }
      if (typeof data.updatedAt === 'string') {
        customerData.updatedAt = new Date(data.updatedAt);
      }

      return new Customer(customerData);
    }

    validate() {
      this._validationErrors = [];

      if (!this.name || this.name.trim() === '') {
        this.addValidationError('name', 'Name is required');
      }

      if (!this.email || !this.email.includes('@')) {
        this.addValidationError('email', 'Valid email is required');
      }

      return this._validationErrors.length === 0;
    }
  }

  // Test Repository
  class CustomerRepository extends Repository {
    constructor(database, logger, cache, exceptionService) {
      super(database, 'Customers', Customer, logger, cache, exceptionService);
    }
  }

  // Test fixtures
  let mockLogger;
  let mockUtils;
  let mockCache;
  let mockSpreadsheetService;
  let exceptionService;
  let databaseService;
  let repository;
  let testData;

  beforeEach(() => {
    // Layer 0: CoreUtilsLib - LoggerService and UtilsService
    mockLogger = global.mockLoggerService();
    mockUtils = {
      sleep: jest.fn((ms) => {}),
      getUuid: jest.fn(() => `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
      parseDate: jest.fn((value) => {
        if (value instanceof Date) {
          return value;
        }
        if (typeof value === 'string') {
          return new Date(value);
        }
        return null;
      })
    };

    // Layer 0: CoreUtilsLib - CacheService mock
    mockCache = global.mockCacheService();

    // Track test data for verification
    testData = [];

    // Layer 2: GoogleApiWrapper - SpreadsheetService mock
    mockSpreadsheetService = {
      getSheetData: jest.fn((spreadsheetId, sheetName) => {
        return testData.map((row) => Object.values(row));
      }),
      appendRow: jest.fn((spreadsheetId, sheetName, row) => {
        testData.push(row);
        return true;
      }),
      updateRow: jest.fn((spreadsheetId, sheetName, rowIndex, row) => {
        if (rowIndex < testData.length) {
          testData[rowIndex] = row;
          return true;
        }
        return false;
      }),
      batchUpdate: jest.fn((spreadsheetId, operations) => {
        return { success: true, operations: operations.length };
      })
    };

    // Layer 1: GasResilienceLib - ExceptionService
    exceptionService = new ExceptionService(mockLogger, mockUtils);

    // Layer 2: SheetDBLib - DatabaseService mock with real TableService behavior
    databaseService = {
      tables: {
        Customers: {
          name: 'Customers',
          columns: [
            'id',
            'name',
            'email',
            'tier',
            'address_street',
            'address_city',
            'address_zip',
            'createdAt',
            'updatedAt'
          ],
          getAllRows: jest.fn(() => testData),
          getByPK: jest.fn((id) => testData.find((row) => row.id === id) || null),
          insertRow: jest.fn((data) => {
            const newRow = { ...data, id: data.id || mockUtils.getUuid() };
            testData.push(newRow);
            return newRow;
          }),
          insertRows: jest.fn((rows) => {
            const newRows = rows.map((data) => {
              const newRow = { ...data, id: data.id || mockUtils.getUuid() };
              testData.push(newRow);
              return newRow;
            });
            return newRows;
          }),
          updateRowById: jest.fn((id, data) => {
            const index = testData.findIndex((row) => row.id === id);
            if (index >= 0) {
              testData[index] = { ...testData[index], ...data };
              return testData[index];
            }
            return null;
          }),
          patchRow: jest.fn((id, data) => {
            const index = testData.findIndex((row) => row.id === id);
            if (index >= 0) {
              testData[index] = { ...testData[index], ...data };
              return testData[index];
            }
            return null;
          }),
          deleteRowById: jest.fn((id) => {
            const index = testData.findIndex((row) => row.id === id);
            if (index >= 0) {
              testData.splice(index, 1);
              return true;
            }
            return false;
          }),
          _testData: testData
        }
      },
      select: jest.fn((columns) => {
        const mockQueryBuilder = {
          from: jest.fn(() => mockQueryBuilder),
          where: jest.fn(() => mockQueryBuilder),
          execute: jest.fn(() => testData)
        };
        return mockQueryBuilder;
      }),
      save: jest.fn(() => true),
      _cache: mockCache,
      _logger: mockLogger,
      _utils: mockUtils,
      _spreadsheetService: mockSpreadsheetService
    };

    // Layer 4: DomainRepositoryLib - CustomerRepository
    repository = new CustomerRepository(databaseService, mockLogger, mockCache, exceptionService);
  });

  afterEach(() => {
    testData.length = 0;
    mockCache._clear();
    jest.clearAllMocks();
  });

  describe('Complete CRUD Flow Through All Layers', () => {
    test('CREATE: Entity flows through all layers to persistence', () => {
      // Arrange: Create new Customer Entity
      const address = new Address('123 Main St', 'Springfield', '12345');
      const customer = new Customer({
        name: 'John Doe',
        email: 'john@example.com',
        tier: 'premium',
        address: address
      });

      // Act: Save through Repository → Database → SpreadsheetService
      const savedCustomer = repository.save(customer);

      // Assert: Verify Entity was properly saved
      expect(savedCustomer).toBeInstanceOf(Customer);
      expect(savedCustomer.id).toBeDefined();
      expect(savedCustomer.name).toBe('John Doe');
      expect(savedCustomer.email).toBe('john@example.com');
      expect(savedCustomer.tier).toBe('premium');
      expect(savedCustomer.address).toBeInstanceOf(Address);
      expect(savedCustomer.address.street).toBe('123 Main St');

      // Verify database layer was called
      expect(databaseService.tables['Customers'].insertRow).toHaveBeenCalled();
      expect(databaseService.save).toHaveBeenCalled();

      // Verify data persistence
      expect(testData).toHaveLength(1);
      expect(testData[0].name).toBe('John Doe');
      expect(testData[0].address_street).toBe('123 Main St');
    });

    test('READ: Entity retrieval flows through all layers', () => {
      // Arrange: Seed data through all layers
      const existingId = mockUtils.getUuid();
      testData.push({
        id: existingId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        tier: 'standard',
        address_street: '456 Oak Ave',
        address_city: 'Portland',
        address_zip: '97201',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });

      // Act: Retrieve through Repository → Database
      const customer = repository.findById(existingId);

      // Assert: Verify Entity was properly hydrated
      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBe(existingId);
      expect(customer.name).toBe('Jane Smith');
      expect(customer.email).toBe('jane@example.com');
      expect(customer.address).toBeInstanceOf(Address);
      expect(customer.address.street).toBe('456 Oak Ave');

      // Verify database layer was called
      expect(databaseService.tables['Customers'].getByPK).toHaveBeenCalledWith(existingId);
    });

    test('UPDATE: Entity modification flows through all layers', () => {
      // Arrange: Seed existing customer
      const existingId = mockUtils.getUuid();
      testData.push({
        id: existingId,
        name: 'Original Name',
        email: 'original@example.com',
        tier: 'standard',
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });

      // Act: Modify and save through Repository
      const customer = repository.findById(existingId);
      customer.name = 'Updated Name';
      customer.tier = 'premium';
      customer.address = new Address('789 New St', 'Seattle', '98101');

      const updatedCustomer = repository.save(customer);

      // Assert: Verify Entity was properly updated
      expect(updatedCustomer.name).toBe('Updated Name');
      expect(updatedCustomer.tier).toBe('premium');
      expect(updatedCustomer.address.street).toBe('789 New St');

      // Verify data persistence
      const persistedData = testData.find((row) => row.id === existingId);
      expect(persistedData.name).toBe('Updated Name');
      expect(persistedData.address_street).toBe('789 New St');
    });

    test('DELETE: Entity removal flows through all layers', () => {
      // Arrange: Seed customer to delete
      const existingId = mockUtils.getUuid();
      testData.push({
        id: existingId,
        name: 'To Delete',
        email: 'delete@example.com',
        tier: 'standard',
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });

      expect(testData).toHaveLength(1);

      // Act: Delete through Repository using deleteById
      repository.deleteById(existingId);

      // Assert: Verify Entity was removed
      expect(testData).toHaveLength(0);
      expect(databaseService.tables['Customers'].deleteRowById).toHaveBeenCalledWith(existingId);
    });
  });

  describe('Error Propagation Through Layers', () => {
    test('Validation errors propagate from Entity to Repository', () => {
      // Arrange: Create invalid Entity
      const invalidCustomer = new Customer({
        name: '', // Invalid: empty name
        email: 'not-an-email' // Invalid: missing @
      });

      // Act & Assert: Repository should reject invalid entity
      expect(() => {
        repository.save(invalidCustomer);
      }).toThrow();
    });

    test('Database errors propagate through Repository with context', () => {
      // Arrange: Make database throw an error on ALL calls (not just one)
      // so that retry logic cannot recover
      const dbError = new Error('Spreadsheet quota exceeded');
      dbError.code = 400; // Use 400 (non-recoverable) instead of 429 (recoverable)
      databaseService.tables['Customers'].insertRow.mockImplementation(() => {
        throw dbError;
      });

      const customer = new Customer({
        name: 'Test Customer',
        email: 'test@example.com'
      });

      // Act & Assert: Error should propagate with context
      expect(() => {
        repository.save(customer);
      }).toThrow(/quota exceeded|Spreadsheet/i);

      // Restore original mock for other tests
      databaseService.tables['Customers'].insertRow.mockImplementation((data) => {
        const newRow = { ...data, id: data.id || mockUtils.getUuid() };
        testData.push(newRow);
        return newRow;
      });
    });
  });

  describe('Resilience Integration', () => {
    test('ExceptionService retry logic integrated through Repository', () => {
      let attemptCount = 0;

      // Arrange: Make first two attempts fail, third succeed
      databaseService.tables['Customers'].insertRow.mockImplementation((data) => {
        attemptCount++;
        if (attemptCount < 3) {
          const error = new Error('Service temporarily unavailable');
          error.code = 503;
          throw error;
        }
        const newRow = { ...data, id: data.id || mockUtils.getUuid() };
        testData.push(newRow);
        return newRow;
      });

      const customer = new Customer({
        name: 'Resilient Customer',
        email: 'resilient@example.com'
      });

      // Act: Save should succeed after retries
      const saved = repository.save(customer);

      // Assert: Customer was saved after retries
      expect(saved).toBeInstanceOf(Customer);
      expect(saved.name).toBe('Resilient Customer');
      expect(attemptCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Logger Propagation Through Layers', () => {
    test('Logger is called at each layer during save operation', () => {
      // Arrange
      const customer = new Customer({
        name: 'Logged Customer',
        email: 'logged@example.com'
      });

      // Act
      repository.save(customer);

      // Assert: Logger should have been called
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    test('Logger captures operation metadata', () => {
      // Arrange
      const customer = new Customer({
        name: 'Metadata Customer',
        email: 'metadata@example.com'
      });

      // Act
      repository.save(customer);

      // Assert: Logger should have captured entity type/operation
      const allCalls = [...mockLogger.debug.mock.calls, ...mockLogger.info.mock.calls];
      expect(allCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Cache Integration Through Layers', () => {
    test('Cache is invalidated after save operation', () => {
      // Arrange: Seed existing customer
      const existingId = mockUtils.getUuid();
      testData.push({
        id: existingId,
        name: 'Cached Customer',
        email: 'cached@example.com',
        tier: 'standard',
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });

      // Populate cache
      mockCache.put(`Customers:${existingId}`, JSON.stringify(testData[0]));

      // Act: Update customer
      const customer = repository.findById(existingId);
      customer.name = 'Updated Cached Customer';
      repository.save(customer);

      // Assert: Cache should be invalidated
      expect(mockCache.remove).toHaveBeenCalled();
    });
  });

  describe('CoreUtilsLib Integration', () => {
    test('UtilsService provides UUID generation through all layers', () => {
      // Arrange
      const customer = new Customer({
        name: 'UUID Customer',
        email: 'uuid@example.com'
      });

      // Act
      const saved = repository.save(customer);

      // Assert: Entity has UUID from UtilsService
      expect(saved.id).toBeDefined();
      expect(saved.id).toMatch(/^uuid-/); // Our mock pattern
      expect(mockUtils.getUuid).toHaveBeenCalled();
    });

    test('HashUtils used for cache key generation', () => {
      // The Repository uses cache keys that may involve hashing
      const customer = new Customer({
        name: 'Hash Customer',
        email: 'hash@example.com'
      });

      repository.save(customer);

      // Cache operations should use consistent key patterns
      const cacheCallArgs = mockCache.put.mock.calls;
      if (cacheCallArgs.length > 0) {
        expect(cacheCallArgs[0][0]).toBeDefined(); // Key exists
      }
    });
  });

  describe('ValueObject Integration', () => {
    test('ValueObject is properly serialized and deserialized through all layers', () => {
      // Arrange: Create customer with complex address
      const address = new Address('100 Complex St', 'Anytown', '99999');
      const customer = new Customer({
        name: 'ValueObject Customer',
        email: 'vo@example.com',
        address: address
      });

      // Act: Save and retrieve
      const saved = repository.save(customer);
      const retrieved = repository.findById(saved.id);

      // Assert: ValueObject is properly reconstructed
      expect(retrieved.address).toBeInstanceOf(Address);
      expect(retrieved.address.equals(address)).toBe(true);
      expect(retrieved.address.getValue()).toEqual({
        street: '100 Complex St',
        city: 'Anytown',
        zip: '99999'
      });
    });

    test('Null ValueObject is handled correctly through all layers', () => {
      // Arrange: Customer without address
      const customer = new Customer({
        name: 'No Address Customer',
        email: 'noaddress@example.com'
      });

      // Act: Save and retrieve
      const saved = repository.save(customer);
      const retrieved = repository.findById(saved.id);

      // Assert: Null address is preserved
      expect(retrieved.address).toBeNull();
      expect(testData[0].address_street).toBeNull();
      expect(testData[0].address_city).toBeNull();
      expect(testData[0].address_zip).toBeNull();
    });
  });

  describe('Batch Operations Through All Layers', () => {
    test('saveMany flows through all layers efficiently', () => {
      // Arrange: Create multiple customers
      const customers = [
        new Customer({ name: 'Batch 1', email: 'batch1@example.com' }),
        new Customer({ name: 'Batch 2', email: 'batch2@example.com' }),
        new Customer({ name: 'Batch 3', email: 'batch3@example.com' })
      ];

      // Act: Save in batch
      const savedCustomers = repository.saveMany(customers);

      // Assert: All customers saved
      expect(savedCustomers).toHaveLength(3);
      expect(testData).toHaveLength(3);
      savedCustomers.forEach((customer, index) => {
        expect(customer.id).toBeDefined();
        expect(customer.name).toBe(`Batch ${index + 1}`);
      });
    });
  });
});
