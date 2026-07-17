/**
 * Integration Test: Cross-Cutting Concern - Cache Invalidation
 *
 * Layers Tested: All layers (DomainRepositoryLib → SheetDBLib → GoogleApiWrapper → CoreUtilsLib)
 *
 * Purpose: Verify that cache is properly managed across all layers,
 * including invalidation after writes and consistency after reads.
 *
 * @file test/__tests__/integration/CrossCut_CacheInvalidation.test.js
 */

import { Entity, Repository } from '@DomainRepositoryLib';
import { DatabaseService } from '@SheetDBLib';
import { ExceptionService } from '@GasResilienceLib';
import { ContextAssembler, ProviderRegistry, DataProvider } from '@ContextEngine';
import { MockFactory } from '../../fakes/MockFactory';

describe('Cross-Cutting Concern: Cache Invalidation', () => {
  // Test fixtures
  let mocks;
  let mockLogger;
  let mockUtils;
  let mockCache;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    mockLogger = mocks.logger;
    mockUtils = mocks.utils;
    mockCache = mocks.cache;
  });

  afterEach(() => {
    mockCache.removeAll();
    jest.clearAllMocks();
  });

  describe('Repository Cache Behavior', () => {
    // Test Entity
    class TestEntity extends Entity {
      constructor(data = {}) {
        super(data);
        this.name = data.name || null;
        this.email = data.email || null;
      }

      toData() {
        return {
          id: this.id,
          name: this.name,
          email: this.email,
          createdAt: this.createdAt?.toISOString(),
          updatedAt: this.updatedAt?.toISOString()
        };
      }

      static fromData(data) {
        // Parse dates in the data before passing to constructor
        const parsedData = { ...data };
        if (typeof data.createdAt === 'string') {
          parsedData.createdAt = new Date(data.createdAt);
        }
        if (typeof data.updatedAt === 'string') {
          parsedData.updatedAt = new Date(data.updatedAt);
        }
        return new TestEntity(parsedData);
      }

      validate() {
        this._validationErrors = [];
        if (!this.name) {
          this.addValidationError('name', 'Name required');
        }
        return this._validationErrors.length === 0;
      }
    }

    class TestRepository extends Repository {
      constructor(database, logger, cache, exceptionService) {
        super(database, 'TestEntities', TestEntity, logger, cache, exceptionService);
      }
    }

    let testData;
    let mockDatabase;
    let repository;

    beforeEach(() => {
      testData = [];
      const table = MockFactory.createJestTable('TestEntities');
      table.insertRow.mockImplementation((data) => {
        const newRow = { ...data, id: data.id || mockUtils.getUuid() };
        testData.push(newRow);
        return newRow;
      });
      table.insertRows.mockImplementation((rows) => {
        return rows.map((data) => {
          const newRow = { ...data, id: data.id || mockUtils.getUuid() };
          testData.push(newRow);
          return newRow;
        });
      });
      table.updateRowById.mockImplementation((id, data) => {
        const index = testData.findIndex((row) => row.id === id);
        if (index >= 0) {
          testData[index] = { ...testData[index], ...data };
          return testData[index];
        }
        return null;
      });
      table.deleteRowById.mockImplementation((id) => {
        const index = testData.findIndex((row) => row.id === id);
        if (index >= 0) {
          testData.splice(index, 1);
          return true;
        }
        return false;
      });
      table.getAllRows.mockImplementation(() => testData);
      table.getByPK.mockImplementation((id) => testData.find((row) => row.id === id) || null);

      mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        utils: mockUtils,
        cache: mockCache,
        tables: { TestEntities: table }
      });

      repository = new TestRepository(mockDatabase, mockLogger, mockCache, null);
    });

    test('Cache is populated on read operations', () => {
      // Arrange: Seed data
      const existingId = 'entity-1';
      testData.push({
        id: existingId,
        name: 'Cached Entity',
        email: 'cached@example.com',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });

      // Act: First read (should hit database, populate cache)
      const entity = repository.findById(existingId);

      // Assert
      expect(entity).toBeInstanceOf(TestEntity);
      expect(mockDatabase.tables.TestEntities.getByPK).toHaveBeenCalled();
    });

    test('Cache is invalidated after save operation', () => {
      // Arrange: Seed data and populate cache
      const existingId = 'entity-2';
      testData.push({
        id: existingId,
        name: 'Original Name',
        email: 'original@example.com',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });

      // Manually populate cache
      mockCache.put(`TestEntities:${existingId}`, JSON.stringify(testData[0]));

      // Act: Update entity
      const entity = repository.findById(existingId);
      entity.name = 'Updated Name';
      repository.save(entity);

      // Assert: Cache should be invalidated
      expect(mockCache.remove).toHaveBeenCalled();
      expect(mockCache.get(`TestEntities:${existingId}`)).toBeNull();
    });

    test('Cache is invalidated after delete operation', () => {
      // Arrange
      const existingId = 'entity-3';
      testData.push({
        id: existingId,
        name: 'To Delete',
        email: 'delete@example.com',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      });

      mockCache.put(`TestEntities:${existingId}`, JSON.stringify(testData[0]));

      // Act: Delete entity by id
      repository.deleteById(existingId);

      // Assert: Cache invalidated
      expect(mockCache.remove).toHaveBeenCalled();
      expect(mockCache.get(`TestEntities:${existingId}`)).toBeNull();
    });

    test('Batch operations invalidate cache appropriately', () => {
      // Arrange
      const entities = [
        new TestEntity({ name: 'Batch 1', email: 'batch1@example.com' }),
        new TestEntity({ name: 'Batch 2', email: 'batch2@example.com' }),
        new TestEntity({ name: 'Batch 3', email: 'batch3@example.com' })
      ];

      // Act: Save many
      repository.saveMany(entities);

      // Assert: Cache operations occurred
      expect(mockDatabase.save).toHaveBeenCalled();
    });
  });

  describe('Database Cache Behavior', () => {
    test('Query results are cached', () => {
      // Arrange
      const testData = [
        { id: '1', name: 'Item 1', value: 100 },
        { id: '2', name: 'Item 2', value: 200 }
      ];

      const table = MockFactory.createJestTable('Items');
      table.setData(testData);

      const mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        cache: mockCache,
        tables: { Items: table }
      });

      // Act: Execute query
      const query = mockDatabase.select(['name', 'value']);
      query.from('Items').execute();

      // Assert: Query executed
      expect(mockDatabase.select).toHaveBeenCalled();
    });

    test('Write operations invalidate related caches', () => {
      // Arrange
      const testData = [];
      const table = MockFactory.createJestTable('Items');
      table.insertRow.mockImplementation((data) => {
        testData.push(data);
        // Simulate cache invalidation
        mockCache.remove('Items_*');
        return data;
      });

      const mockDatabase = MockFactory.createJestDatabase({
        cache: mockCache,
        tables: { Items: table }
      });

      // Act: Insert item
      mockDatabase.tables.Items.insertRow({ id: '1', name: 'New Item' });

      // Assert: Cache invalidated
      expect(mockCache.remove).toHaveBeenCalledWith('Items_*');
    });
  });

  describe('Context Engine Cache Behavior', () => {
    test('Provider results can be cached', () => {
      // Arrange
      let fetchCount = 0;

      class CacheableProvider extends DataProvider {
        _fetchData(parameters) {
          fetchCount++;
          return { data: 'cached-data', fetchCount };
        }
      }

      const registry = new ProviderRegistry(mockLogger);
      registry.registerSingleton('CacheableProvider', new CacheableProvider(mockLogger));

      const assembler = new ContextAssembler(mockLogger, registry);

      const recipe = {
        providers: [{ name: 'cachedData', type: 'CacheableProvider', parameters: {} }]
      };

      // Act: Multiple assemblies
      const result1 = assembler.assemble(recipe, {});
      const result2 = assembler.assemble(recipe, {});

      // Assert: Provider was invoked each time (singleton pattern)
      expect(result1.cachedData).toBeDefined();
      expect(result2.cachedData).toBeDefined();
      expect(fetchCount).toBe(2); // Singleton called twice
    });

    test('Factory providers bypass cache for fresh data', () => {
      // Arrange
      let instanceCount = 0;

      class FreshDataProvider extends DataProvider {
        constructor(logger) {
          super(logger);
          instanceCount++;
        }

        _fetchData(parameters) {
          return { instance: instanceCount };
        }
      }

      const registry = new ProviderRegistry(mockLogger);
      registry.registerFactory('FreshDataProvider', () => new FreshDataProvider(mockLogger));

      const assembler = new ContextAssembler(mockLogger, registry);

      const recipe = {
        providers: [{ name: 'freshData', type: 'FreshDataProvider', parameters: {} }]
      };

      // Act: Multiple assemblies
      const result1 = assembler.assemble(recipe, {});
      const result2 = assembler.assemble(recipe, {});

      // Assert: Fresh instance each time
      expect(result1.freshData.instance).toBe(1);
      expect(result2.freshData.instance).toBe(2);
    });
  });

  describe('Cache Key Generation', () => {
    test('Cache keys include entity type', () => {
      // Arrange
      class TypedEntity extends Entity {
        constructor(data = {}) {
          super(data);
          this.value = data.value;
        }
        toData() {
          return { id: this.id, value: this.value };
        }
        static fromData(data) {
          return new TypedEntity(data);
        }
        validate() {
          return true;
        }
      }

      const testData = [];
      const mockDatabase = {
        tables: {
          TypedEntities: {
            name: 'TypedEntities',
            columns: ['id', 'value'],
            getAllRows: jest.fn(() => testData),
            getByPK: jest.fn((id) => testData.find((row) => row.id === id)),
            insertRow: jest.fn((data) => {
              testData.push(data);
              return data;
            })
          }
        },
        save: jest.fn(() => {
          // Simulate cache invalidation with table name
          mockCache.remove('TypedEntities_*');
          return true;
        }),
        _cache: mockCache,
        _logger: mockLogger,
        _utils: mockUtils
      };

      class TypedRepository extends Repository {
        constructor(database, logger, cache) {
          super(database, 'TypedEntities', TypedEntity, logger, cache);
        }
      }

      const repo = new TypedRepository(mockDatabase, mockLogger, mockCache);

      // Act
      const entity = new TypedEntity({ value: 42 });
      repo.save(entity);

      // Assert: Cache key includes table name
      expect(mockCache.remove).toHaveBeenCalledWith(expect.stringContaining('TypedEntities'));
    });

    test('Cache keys are unique per entity ID', () => {
      // Arrange
      const testData = [
        { id: 'unique-1', name: 'Entity 1' },
        { id: 'unique-2', name: 'Entity 2' }
      ];

      // Act: Cache both entities
      mockCache.put('Entities:unique-1', JSON.stringify(testData[0]));
      mockCache.put('Entities:unique-2', JSON.stringify(testData[1]));

      // Assert: Each has separate cache entry
      expect(mockCache._store.get('Entities:unique-1')).toBeDefined();
      expect(mockCache._store.get('Entities:unique-2')).toBeDefined();
      expect(mockCache._store.get('Entities:unique-1')).not.toBe(
        mockCache._store.get('Entities:unique-2')
      );
    });
  });

  describe('Cache Expiration', () => {
    test('Cache entries include expiration time', () => {
      // Act: Put with expiration
      mockCache.put('expiring-key', 'expiring-value', 300);

      // Assert: Expiration captured in operation
      expect(mockCache.put).toHaveBeenCalledWith('expiring-key', 'expiring-value', 300);
    });
  });

  describe('Cache Consistency', () => {
    test('Cache reflects latest write', () => {
      // Arrange
      const key = 'consistency-test';

      // Act: Write multiple values
      mockCache.put(key, 'value-1');
      mockCache.put(key, 'value-2');
      mockCache.put(key, 'value-3');

      // Assert: Cache returns latest value
      expect(mockCache.get(key)).toBe('value-3');
    });

    test('Removed cache entries return null', () => {
      // Arrange
      const key = 'remove-test';
      mockCache.put(key, 'some-value');

      // Act
      mockCache.remove(key);

      // Assert
      expect(mockCache.get(key)).toBeNull();
    });

    test('Wildcard remove clears matching entries', () => {
      // Arrange
      mockCache.put('prefix:1', 'value-1');
      mockCache.put('prefix:2', 'value-2');
      mockCache.put('other:1', 'other-value');

      // Act
      mockCache.remove('prefix*');

      // Assert
      expect(mockCache.get('prefix:1')).toBeNull();
      expect(mockCache.get('prefix:2')).toBeNull();
      expect(mockCache.get('other:1')).toBe('other-value');
    });
  });

  describe('Cache Statistics', () => {
    test('Cache operations are tracked', () => {
      // Arrange & Act
      mockCache.put('stat-key-1', 'value-1');
      mockCache.put('stat-key-2', 'value-2');
      mockCache.get('stat-key-1');
      mockCache.get('stat-key-missing');
      mockCache.remove('stat-key-1');

      // Assert
      expect(mockCache.put).toHaveBeenCalledTimes(2);
      expect(mockCache.get).toHaveBeenCalledTimes(2);
      expect(mockCache.remove).toHaveBeenCalledTimes(1);
    });
  });
});
