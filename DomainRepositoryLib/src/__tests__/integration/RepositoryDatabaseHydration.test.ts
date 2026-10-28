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
// FILE: DomainRepositoryLib/src/__tests__/integration/RepositoryDatabaseHydration.test.js
// ===================================================================
// Integration Test 1: Repository-Database Hydration
// Verifies that DomainRepositoryLib correctly hydrates an Entity when SheetDBLib returns raw JSON data
// ===================================================================

import { Repository } from '../../Repository.js';
import { Entity } from '../../Entity.js';
import { ValueObject } from '../../ValueObject.js';

/**
 * Test Scenario: Repository-Database Hydration
 *
 * Layers Involved:
 * - Application: DomainRepositoryLib (Repository, EntityMapper, HydrationService)
 * - Persistence: SheetDBLib (DatabaseService, AdvancedQueryBuilder)
 * - Infrastructure: GoogleApiWrapper (mocked SpreadsheetService)
 *
 * Objective:
 * Verify that when SheetDBLib returns raw row data from the database,
 * the Repository correctly transforms it into a fully hydrated Entity instance
 * with all properties, including nested ValueObjects, properly instantiated.
 */

describe('Integration Test 1: Repository-Database Hydration', () => {
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

  // Test Entity classes
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
      this.address = data.address || null; // Address ValueObject
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
    // Setup mocked infrastructure services
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
          insertRows: jest.fn(() => []),
          patchRow: jest.fn(() => null),
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
            const newRow = { ...data };
            testData.push(newRow);
            return newRow;
          }),
          updateRowById: jest.fn((id, data) => {
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

    // Initialize Repository with Entity class and DatabaseService
    repository = new UserRepository(databaseService, mockLogger, mockCacheService);
  });

  afterEach(() => {
    // Clear test data
    if (databaseService && databaseService.tables['Users']._testData) {
      databaseService.tables['Users']._testData.length = 0;
    }
    mockCacheService._clear();
  });

  describe('Basic Entity Hydration', () => {
    test('should hydrate Entity from raw database row with primitive fields', () => {
      // Arrange: Seed mock database with raw row data
      const testUserId = 'user_123';
      const rawRowData = {
        id: testUserId,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        address_street: '123 Main St',
        address_city: 'Springfield',
        address_zip: '12345',
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-01-15T10:30:00Z'
      };

      // Add data to mock database
      databaseService.tables['Users']._testData.push(rawRowData);

      // Act: Query repository by ID
      const user = repository.findById(testUserId);

      // Assert: Verify Entity is correctly hydrated
      expect(user).toBeInstanceOf(User);
      expect(user!.id).toBe(testUserId);
      expect(user!.name).toBe('John Doe');
      expect(user!.email).toBe('john@example.com');
      expect(user!.age).toBe(30);
      expect(user!.createdAt).toBeInstanceOf(Date);
      expect(user!.createdAt.toISOString()).toBe('2025-01-15T10:30:00.000Z');
    });

    test('should hydrate nested ValueObject from flattened database columns', () => {
      // Arrange: Raw data with flattened address fields
      const testUserId = 'user_456';
      const rawRowData = {
        id: testUserId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 28,
        address_street: '456 Oak Ave',
        address_city: 'Riverside',
        address_zip: '67890',
        createdAt: '2025-01-16T14:20:00Z',
        updatedAt: '2025-01-16T14:20:00Z'
      };

      databaseService.tables['Users']._testData.push(rawRowData);

      // Act: Query repository
      const user = repository.findById(testUserId);

      // Assert: Verify Address ValueObject is instantiated
      expect(user!.address).toBeInstanceOf(Address);
      expect(user!.address!.street).toBe('456 Oak Ave');
      expect(user!.address!.city).toBe('Riverside');
      expect(user!.address!.zip).toBe('67890');
    });

    test('should handle null and undefined values during hydration', () => {
      // Arrange: Raw data with null values
      const rawRowData = {
        id: 'user_789',
        name: 'Bob Johnson',
        email: null,
        age: 35,
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-17T09:15:00Z',
        updatedAt: '2025-01-17T09:15:00Z'
      };

      databaseService.tables['Users']._testData.push(rawRowData);

      // Act: Query repository
      const user = repository.findById('user_789');

      // Assert: Verify null handling
      expect(user!.email).toBeNull();
      expect(user!.address).toBeNull(); // No address fields present
    });
  });

  describe('Type Conversions', () => {
    test('should convert ISO date strings to Date objects', () => {
      // Arrange
      const rawRowData = {
        id: 'user_date_test',
        name: 'Date Test',
        email: 'date@test.com',
        age: 25,
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-18T12:00:00.000Z',
        updatedAt: '2025-01-18T15:30:45.123Z'
      };

      databaseService.tables['Users']._testData.push(rawRowData);

      // Act
      const user = repository.findById('user_date_test');

      // Assert
      expect(user!.createdAt).toBeInstanceOf(Date);
      expect(user!.updatedAt).toBeInstanceOf(Date);
      expect(user!.createdAt.toISOString()).toBe('2025-01-18T12:00:00.000Z');
      expect(user!.updatedAt.toISOString()).toBe('2025-01-18T15:30:45.123Z');
    });

    test('should handle numeric strings and numbers', () => {
      // Arrange
      const rawRowData = {
        id: 'user_number_test',
        name: 'Number Test',
        email: 'number@test.com',
        age: 42, // Number
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-18T12:00:00Z',
        updatedAt: '2025-01-18T12:00:00Z'
      };

      databaseService.tables['Users']._testData.push(rawRowData);

      // Act
      const user = repository.findById('user_number_test');

      // Assert
      expect(user!.age).toBe(42);
      expect(typeof user!.age).toBe('number');
    });
  });

  describe('Database Query Integration', () => {
    test('should execute correct query through SheetDBLib', () => {
      // Arrange
      const testUserId = 'user_999';
      const rawRowData = {
        id: testUserId,
        name: 'Query Test',
        email: 'query@test.com',
        age: 50,
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-18T12:00:00Z',
        updatedAt: '2025-01-18T12:00:00Z'
      };

      databaseService.tables['Users']._testData.push(rawRowData);

      // Act
      const user = repository.findById(testUserId);

      // Assert: Verify user was retrieved
      expect(user).not.toBeNull();
      expect(user!.id).toBe(testUserId);
      expect(user!.name).toBe('Query Test');
    });

    test('should return all entities with findAll', () => {
      // Arrange: Multiple users
      databaseService.tables['Users']._testData.push(
        {
          id: 'user_1',
          name: 'User One',
          email: 'one@test.com',
          age: 20,
          address_street: null,
          address_city: null,
          address_zip: null,
          createdAt: '2025-01-18T12:00:00Z',
          updatedAt: '2025-01-18T12:00:00Z'
        },
        {
          id: 'user_2',
          name: 'User Two',
          email: 'two@test.com',
          age: 30,
          address_street: null,
          address_city: null,
          address_zip: null,
          createdAt: '2025-01-18T12:00:00Z',
          updatedAt: '2025-01-18T12:00:00Z'
        },
        {
          id: 'user_3',
          name: 'User Three',
          email: 'three@test.com',
          age: 40,
          address_street: null,
          address_city: null,
          address_zip: null,
          createdAt: '2025-01-18T12:00:00Z',
          updatedAt: '2025-01-18T12:00:00Z'
        }
      );

      // Act
      const users = repository.findAll();

      // Assert
      expect(users).toHaveLength(3);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
      expect(users[2]).toBeInstanceOf(User);
      expect(users[0].name).toBe('User One');
      expect(users[1].name).toBe('User Two');
      expect(users[2].name).toBe('User Three');
    });
  });

  describe('Error Handling', () => {
    test('should return null when entity not found', () => {
      // Arrange: Empty database (testData already empty from beforeEach)

      // Act
      const user = repository.findById('nonexistent_id');

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('Cache Integration', () => {
    test('should cache entities after first retrieval', () => {
      // Arrange
      const testUserId = 'user_cache_test';
      const rawRowData = {
        id: testUserId,
        name: 'Cache Test',
        email: 'cache@test.com',
        age: 25,
        address_street: null,
        address_city: null,
        address_zip: null,
        createdAt: '2025-01-18T12:00:00Z',
        updatedAt: '2025-01-18T12:00:00Z'
      };

      databaseService.tables['Users']._testData.push(rawRowData);

      // Act: First retrieval
      const user1 = repository.findById(testUserId);

      // Act: Second retrieval (should hit cache)
      const user2 = repository.findById(testUserId);

      // Assert
      expect(user1).toBeInstanceOf(User);
      expect(user2).toBeInstanceOf(User);
      expect(user1!.id).toBe(user2!.id);
      expect(user1!.name).toBe(user2!.name);
      expect(mockCacheService.put).toHaveBeenCalled();
      expect(mockCacheService.get).toHaveBeenCalled();
    });
  });
});
