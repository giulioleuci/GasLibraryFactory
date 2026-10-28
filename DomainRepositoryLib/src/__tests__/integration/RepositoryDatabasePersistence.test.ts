import type { DatabaseFixture, QueryFixture } from '../../testing/fixtureTypes.js';
import { jest } from '@jest/globals';
import type {
  EntityData,
  DomainRecord,
  DomainLogger,
  RepositoryDatabase,
  RepositoryCache
} from '../../internal/contracts.js';
import type { CacheInterfaceMock } from '@CoreUtilsLib/src/testing/mocks.js';
// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/integration/RepositoryDatabasePersistence.test.js
// ===================================================================
// Integration Test 2: Repository-Database Persistence
// Verifies that repository.save(entity) correctly calls db.insertRow or db.updateRow
// ===================================================================

import { Repository } from '../../Repository.js';
import { Entity } from '../../Entity.js';
import { ValueObject } from '../../ValueObject.js';

/**
 * Test Scenario: Repository-Database Persistence
 *
 * Layers Involved:
 * - Application: DomainRepositoryLib (Repository, EntityMapper)
 * - Persistence: SheetDBLib (DatabaseService)
 * - Infrastructure: GoogleApiWrapper (mocked SpreadsheetService)
 *
 * Objective:
 * Verify that when saving an Entity through the Repository, the correct
 * SheetDBLib methods (insertRow or updateRow) are called with properly
 * serialized data, including flattened ValueObjects and converted dates.
 */

describe('Integration Test 2: Repository-Database Persistence', () => {
  let _mockSpreadsheetService: object;
  let mockCacheService: CacheInterfaceMock<string>;
  let mockLogger: ReturnType<typeof global.mockLoggerService>;
  let mockUtils: {
    sleep: jest.Mock<(...args: [ms: unknown]) => void>;
    getUuid: jest.Mock<(...args: []) => string>;
    parseDate: jest.Mock<(...args: [value: unknown]) => Date | null>;
  };
  let databaseService: DatabaseFixture<DomainRecord & TestData, 'Users'>;
  let repository: UserRepository;

  type TestData = EntityData & {
    address?: Address | null;
    address_city?: string | null;
    address_street?: string | null;
    address_zip?: string | null;
    age?: number | null;
    email?: string | null;
    name?: string | null;
  };

  // Test Entity classes (same as Test 1)
  class Address extends ValueObject {
    declare street: string | null | undefined;
    declare city: string | null | undefined;
    declare zip: string | null | undefined;
    constructor(
      street: string | null | undefined,
      city: string | null | undefined,
      zip: string | null | undefined
    ) {
      super();
      this.street = street;
      this.city = city;
      this.zip = zip;
      this._freeze();
    }

    equals(other: Address) {
      return this.street === other.street && this.city === other.city && this.zip === other.zip;
    }

    getValue() {
      return { street: this.street, city: this.city, zip: this.zip };
    }
  }

  class User extends Entity {
    declare name: string | null;
    declare email: string | null;
    declare age: number | null;
    declare address: Address | null;
    constructor(data: TestData = {}) {
      super(data);
      this.name = data.name || null;
      this.email = data.email || null;
      this.age = data.age || null;
      this.address = data.address || null;
    }

    toData() {
      const data: DomainRecord & TestData = {
        id: this.id,
        name: this.name,
        email: this.email,
        age: this.age,
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString()
      };

      // Flatten Address ValueObject
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

    static fromData(data: TestData) {
      const userData = { ...data };

      // Reconstruct Address ValueObject from flat columns
      if (data.address_street || data.address_city || data.address_zip) {
        userData.address = new Address(data.address_street, data.address_city, data.address_zip);
      }

      return new User(userData);
    }

    validate() {
      this._validationErrors = [];

      if (!this.name || this.name.trim() === '') {
        this.addValidationError('name', 'Name is required');
      }

      if (!this.email || this.email.trim() === '') {
        this.addValidationError('email', 'Email is required');
      }

      return this._validationErrors.length === 0;
    }
  }

  class UserRepository extends Repository<User> {
    constructor(
      database: RepositoryDatabase,
      logger?: DomainLogger | null,
      cache?: RepositoryCache | null
    ) {
      super(database, 'Users', User, logger, cache, null);
    }
  }

  beforeEach(() => {
    _mockSpreadsheetService = (
      global as typeof globalThis & { mockSpreadsheetService(): object }
    ).mockSpreadsheetService();
    mockCacheService = (
      global as typeof globalThis & { mockCacheService(): CacheInterfaceMock<string> }
    ).mockCacheService();
    mockLogger = global.mockLoggerService();
    mockUtils = {
      sleep: jest.fn((_ms) => {}),
      getUuid: jest.fn(() => `test-uuid-${Date.now()}`),
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

    // Create mock database service with in-memory data storage
    const testData: Array<DomainRecord & TestData> = [];

    databaseService = {
      tables: {
        Users: {
          name: 'Users',
          columns: [
            'id',
            'name',
            'email',
            'age',
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
          _testData: testData // For test access
        }
      },
      select: jest.fn((_columns) => {
        const mockQueryBuilder: QueryFixture<DomainRecord & TestData> = {
          from: jest.fn<(table: string) => QueryFixture<DomainRecord & TestData>>(
            () => mockQueryBuilder
          ),
          where: jest.fn<
            (
              field: string,
              operator: string,
              value: unknown
            ) => QueryFixture<DomainRecord & TestData>
          >(() => mockQueryBuilder),
          execute: jest.fn(() => testData)
        };
        return mockQueryBuilder;
      }),
      save: jest.fn(() => true), // Database save method
      _cache: mockCacheService,
      _logger: mockLogger,
      _utils: mockUtils
    };

    repository = new UserRepository(databaseService, mockLogger, mockCacheService);
  });

  afterEach(() => {
    // Clear test data
    if (databaseService && databaseService.tables['Users']._testData) {
      databaseService.tables['Users']._testData.length = 0;
    }
    mockCacheService._clear();
  });

  describe('Insert Operations', () => {
    test('should insert new Entity when saving without ID', () => {
      // Arrange: Create new Entity
      mockUtils.getUuid.mockReturnValue('test-uuid-alice');
      const user = new User({
        name: 'Alice Johnson',
        email: 'alice@test.com',
        age: 28
      });

      // Act: Save Entity
      const savedUser = repository.save(user!) as User;

      // Assert: Verify Entity has ID assigned
      expect(savedUser.id).toBe('test-uuid-alice');
      expect(savedUser.id).not.toBeNull();
      expect(savedUser.name).toBe('Alice Johnson');
      expect(savedUser.email).toBe('alice@test.com');
      expect(savedUser.age).toBe(28);

      // Verify database save was called
      expect(databaseService.save).toHaveBeenCalled();

      // Verify insertRow was called
      expect(databaseService.tables['Users'].insertRow).toHaveBeenCalled();
    });

    test('should serialize ValueObjects to flat primitives on insert', () => {
      // Arrange: Create Entity with nested ValueObject
      const address = new Address('789 Pine St', 'Lakewood', '11111');
      const user = new User({
        name: 'Bob Smith',
        email: 'bob@test.com',
        age: 35,
        address: address
      });

      // Act: Save Entity
      const _savedUser = repository.save(user!) as User;

      // Assert: Verify flattened data in database
      const allUsers = repository.findAll();
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0].address).toBeInstanceOf(Address);
      expect(allUsers[0].address!.street).toBe('789 Pine St');
      expect(allUsers[0].address!.city).toBe('Lakewood');
      expect(allUsers[0].address!.zip).toBe('11111');
    });

    test('should convert Date objects to ISO strings on insert', () => {
      // Arrange: Create Entity with Date field
      const user = new User({
        name: 'Charlie Brown',
        email: 'charlie@test.com',
        age: 42,
        createdAt: new Date('2025-01-20T10:00:00Z')
      });

      // Act: Save Entity
      const savedUser = repository.save(user!) as User;

      // Assert: Verify dates are preserved
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);

      // Retrieve and verify date conversion
      const retrieved = repository.findById(savedUser.id);
      expect(retrieved!.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Update Operations', () => {
    test('should update existing Entity when saving with ID', () => {
      // Arrange: Seed existing Entity in database
      // Arrange: Add existing data to mock database
      databaseService.tables['Users']._testData.push({
        id: 'user_update_test',
        name: 'Original Name',
        email: 'original@test.com',
        age: 25,
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z'
      });

      // Act: Modify Entity fields
      const user = repository.findById('user_update_test');
      user!.name = 'Updated Name';
      user!.email = 'updated@test.com';

      const savedUser = repository.save(user!) as User;

      // Assert: Verify update was performed
      expect(savedUser.name).toBe('Updated Name');
      expect(savedUser.email).toBe('updated@test.com');
      expect(savedUser.age).toBe(25); // Unchanged

      // Verify by re-fetching
      const refetched = repository.findById('user_update_test');
      expect(refetched!.name).toBe('Updated Name');
      expect(refetched!.email).toBe('updated@test.com');
    });

    test('should update ValueObject fields correctly', () => {
      // Arrange: Add existing entity with address to mock database
      databaseService.tables['Users']._testData.push({
        id: 'user_address_update',
        name: 'David Lee',
        email: 'david@test.com',
        age: 30,
        address_street: 'Old Street',
        address_city: 'Old City',
        address_zip: '11111',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z'
      });

      // Act: Update address
      const user = repository.findById('user_address_update');
      user!.address = new Address('New Street', 'New City', '22222');
      const savedUser = repository.save(user!) as User;

      // Assert: Verify address was updated
      expect(savedUser.address!.street).toBe('New Street');
      expect(savedUser.address!.city).toBe('New City');
      expect(savedUser.address!.zip).toBe('22222');

      // Verify by re-fetching
      const refetched = repository.findById('user_address_update');
      expect(refetched!.address!.street).toBe('New Street');
    });
  });

  describe('Batch Operations', () => {
    test('should save multiple entities in batch', () => {
      // Arrange: Create multiple entities
      const expectedIds = ['test-uuid-user-1', 'test-uuid-user-2', 'test-uuid-user-3'];
      mockUtils.getUuid
        .mockReturnValueOnce('test-uuid-user-1')
        .mockReturnValueOnce('test-uuid-user-2')
        .mockReturnValueOnce('test-uuid-user-3');
      const users = [
        new User({ name: 'User 1', email: 'user1@test.com', age: 20 }),
        new User({ name: 'User 2', email: 'user2@test.com', age: 30 }),
        new User({ name: 'User 3', email: 'user3@test.com', age: 40 })
      ];

      // Act: Save many
      const savedUsers = repository.saveMany(users);

      // Assert: Verify all saved
      expect(savedUsers).toHaveLength(3);
      expect(savedUsers.map((user) => user.id)).toEqual(expectedIds);
      expect(databaseService.tables['Users']._testData.map((row) => row.id)).toEqual(expectedIds);

      // Verify in database
      const allUsers = repository.findAll();
      expect(allUsers.map((user) => user.id)).toEqual(expectedIds);
      expect(databaseService.tables['Users'].insertRows).toHaveBeenCalledTimes(1);
    });

    test('should return empty array when saving empty array', () => {
      // Act
      const result = repository.saveMany([]);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Persistence Validation', () => {
    test('should throw error when saving invalid entity', () => {
      // Arrange: Create Entity missing required fields
      const invalidUser = new User({ age: 30 }); // Missing name and email

      // Act & Assert: Expect save to throw validation error
      expect(() => {
        repository.save(invalidUser);
      }).toThrow();
    });

    test('should successfully save valid entity', () => {
      // Arrange: Create valid Entity
      mockUtils.getUuid.mockReturnValue('test-uuid-valid');
      const validUser = new User({
        name: 'Valid User',
        email: 'valid@test.com',
        age: 25
      });

      // Act: Save should succeed
      const saved = repository.save(validUser);

      // Assert: Verify saved successfully
      expect(saved.id).toBe('test-uuid-valid');
      expect(saved.name).toBe('Valid User');
    });
  });

  describe('Dirty Field Tracking', () => {
    test('should clear dirty fields after save', () => {
      // Arrange: Add existing entity to mock database
      databaseService.tables['Users']._testData.push({
        id: 'user_dirty_test',
        name: 'Original',
        email: 'original@test.com',
        age: 25,
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z'
      });

      // Act: Load, modify, and save
      const user = repository.findById('user_dirty_test');
      user!.name = 'Modified';
      user!.markDirty('name');

      expect(user!.hasDirtyFields()).toBe(true);

      repository.save(user!);

      // Assert: Dirty fields should be cleared after save
      expect(user!.hasDirtyFields()).toBe(false);
      expect(user!.getDirtyFields()).toHaveLength(0);
    });
  });

  describe('Cache Invalidation', () => {
    test('should clear cache after save', () => {
      // Arrange: Add existing entity to mock database
      databaseService.tables['Users']._testData.push({
        id: 'user_cache_clear',
        name: 'Cached User',
        email: 'cached@test.com',
        age: 25,
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z'
      });

      // Act: Load (caches), modify, and save
      const user = repository.findById('user_cache_clear');
      user!.name = 'Modified Cached User';
      repository.save(user!);

      // Assert: Verify cache.remove was called
      expect(mockCacheService.remove).toHaveBeenCalled();
    });
  });
});
