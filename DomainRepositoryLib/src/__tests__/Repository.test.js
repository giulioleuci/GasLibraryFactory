// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/Repository.test.js
// ===================================================================
// Comprehensive test suite for Repository base class
// Coverage: All methods and features (with mocked dependencies)
// ===================================================================

import { Repository } from '../Repository';
import { Entity } from '../Entity';
import { FieldSpecification } from '../specifications/FieldSpecification';
import { FunctionSpecification } from '../specifications/FunctionSpecification';
import { EntityNotFoundException } from '../internal/errors/EntityNotFoundException';
import { MockFactory } from '../../../test/fakes/MockFactory';

// Test entity
class TestEntity extends Entity {
  constructor(data) {
    super(data);
    this.name = data.name;
    this.status = data.status || 'active';
    this.value = data.value || 0;
  }

  validate() {
    super.validate();
    if (!this.name) {
      this.addValidationError('name', 'Name is required');
    }
    return this.getValidationErrors().length === 0;
  }

  toData() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      value: this.value
    };
  }

  static fromData(data) {
    return new TestEntity(data);
  }
}

// Test repository
class TestRepository extends Repository {
  constructor(database, logger, cache, exceptionService) {
    super(database, 'TestEntities', TestEntity, logger, cache, exceptionService);
  }
}

describe('Repository - Comprehensive Test Suite', () => {
  let mocks;
  let mockDatabase;
  let mockTable;
  let mockQueryTranslator;
  let mockEntityMapper;
  let repository;

  beforeEach(() => {
    global.resetGasMocks();
    mocks = MockFactory.createAllJest();

    // Standardized database and table mocks
    const dbMock = MockFactory.createJestDatabase();
    mockTable = dbMock.registerTable('TestEntities');
    mockDatabase = dbMock;

    // Extend logger mock with log method for Repository
    mocks.logger.log = jest.fn();

    // Create repository
    repository = new TestRepository(mockDatabase, mocks.logger, mocks.cache, mocks.exceptionService);

    // Mock internal services
    mockQueryTranslator = {
      validate: jest.fn().mockReturnValue({ valid: true }),
      translate: jest.fn()
    };
    repository.queryTranslator = mockQueryTranslator;

    mockEntityMapper = {
      toData: jest.fn((entity) => entity.toData()),
      fromData: jest.fn((data) => TestEntity.fromData(data)),
      toDataArray: jest.fn((entities) => entities.map((e) => e.toData())),
      fromDataArray: jest.fn((dataArray) => dataArray.map((d) => TestEntity.fromData(d)))
    };
    repository.entityMapper = mockEntityMapper;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should initialize with required parameters', () => {
      expect(repository.database).toBe(mockDatabase);
      expect(repository.tableName).toBe('TestEntities');
      expect(repository.EntityClass).toBe(TestEntity);
      expect(repository.logger).toBe(mocks.logger);
    });

    it('should initialize with default logger if not provided', () => {
      const repo = new TestRepository(mockDatabase, null, mocks.cache);

      expect(repo.logger).toBeDefined();
      expect(typeof repo.logger.info).toBe('function');
    });

    it('should initialize mapper and translator', () => {
      expect(repository.entityMapper).toBeDefined();
      expect(repository.queryTranslator).toBeDefined();
    });
  });

  // ===================================================================
  // SAVE (INSERT)
  // ===================================================================

  describe('Save - Insert', () => {
    it('should insert new entity without ID', () => {
      const entity = new TestEntity({ name: 'Test', status: 'active' });
      entity.id = null; // Simulate new entity

      mockTable.insertRow.mockReturnValue({
        id: 'NEW_ID',
        name: 'Test',
        status: 'active',
        value: 0
      });

      const saved = repository.save(entity);

      expect(mockTable.insertRow).toHaveBeenCalledWith({
        id: null,
        name: 'Test',
        status: 'active',
        value: 0
      });
      expect(mockDatabase.save).toHaveBeenCalled();
      expect(saved.id).toBe('NEW_ID');
    });

    it('should validate entity before insert', () => {
      const entity = new TestEntity({ name: '', status: 'active' });
      entity.id = null;

      expect(() => repository.save(entity)).toThrow();
      expect(mockTable.insertRow).not.toHaveBeenCalled();
    });

    it('should handle insert with all fields', () => {
      const entity = new TestEntity({ name: 'Test', status: 'inactive', value: 100 });
      entity.id = null;

      mockTable.insertRow.mockReturnValue({
        id: 'NEW_ID',
        name: 'Test',
        status: 'inactive',
        value: 100
      });

      const saved = repository.save(entity);

      expect(saved.name).toBe('Test');
      expect(saved.status).toBe('inactive');
      expect(saved.value).toBe(100);
    });
  });

  // ===================================================================
  // SAVE (UPDATE)
  // ===================================================================

  describe('Save - Update', () => {
    it('should update existing entity', () => {
      const entity = new TestEntity({ id: 'EXISTING_ID', name: 'Updated', status: 'active' });
      entity.markDirty('name');

      mockTable.getByPK.mockReturnValue({
        id: 'EXISTING_ID',
        name: 'Old',
        status: 'active',
        value: 0
      });
      mockTable.updateRowById.mockReturnValue({
        id: 'EXISTING_ID',
        name: 'Updated',
        status: 'active',
        value: 0
      });

      const saved = repository.save(entity);

      expect(mockTable.updateRowById).toHaveBeenCalledWith('EXISTING_ID', entity.toData());
      expect(mockDatabase.save).toHaveBeenCalled();
    });

    it('should validate entity before update', () => {
      const entity = new TestEntity({ id: 'EXISTING_ID', name: '', status: 'active' });

      expect(() => repository.save(entity)).toThrow();
      expect(mockTable.updateRowById).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // SAVE MANY
  // ===================================================================

  describe('Save Many', () => {
    it('should save multiple entities', () => {
      const entities = [
        new TestEntity({ name: 'Entity1', status: 'active' }),
        new TestEntity({ name: 'Entity2', status: 'active' })
      ];
      entities[0].id = null;
      entities[1].id = null;

      // Mock insertRows for bulk insert optimization
      mockTable.insertRows.mockReturnValue([
        { id: 'ID1', name: 'Entity1', status: 'active', value: 0 },
        { id: 'ID2', name: 'Entity2', status: 'active', value: 0 }
      ]);

      const saved = repository.saveMany(entities);

      expect(saved.length).toBe(2);
      expect(mockTable.insertRows).toHaveBeenCalledTimes(1); // Bulk insert optimization
      expect(mockDatabase.save).toHaveBeenCalled();
    });

    it('should save empty array', () => {
      const saved = repository.saveMany([]);

      expect(saved).toEqual([]);
      expect(mockDatabase.save).not.toHaveBeenCalled();
    });

    it('should validate all entities before saving', () => {
      const entities = [
        new TestEntity({ name: 'Valid', status: 'active' }),
        new TestEntity({ name: '', status: 'active' }) // Invalid
      ];
      entities[0].id = null;
      entities[1].id = null;

      expect(() => repository.saveMany(entities)).toThrow();
      expect(mockTable.insertRows).not.toHaveBeenCalled();
      expect(mockTable.insertRow).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // FIND BY ID
  // ===================================================================

  describe('Find By ID', () => {
    it('should find entity by ID', () => {
      const data = { id: 'ID1', name: 'Test', status: 'active', value: 0 };
      mockTable.getByPK.mockReturnValue(data);

      const entity = repository.findById('ID1');

      expect(mockTable.getByPK).toHaveBeenCalledWith('ID1');
      expect(entity).toBeInstanceOf(TestEntity);
      expect(entity.id).toBe('ID1');
    });

    it('should return null for non-existent ID', () => {
      mockTable.getByPK.mockReturnValue(null);

      const entity = repository.findById('NON_EXISTENT');

      expect(entity).toBeNull();
    });

    it('should use cache if available', () => {
      const data = { id: 'ID1', name: 'Test', status: 'active', value: 0 };
      const cachedEntity = new TestEntity(data);

      mocks.cache.get.mockReturnValue(JSON.stringify(data));

      const entity = repository.findById('ID1');

      expect(mocks.cache.get).toHaveBeenCalled();
      expect(mockTable.getByPK).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // FIND BY ID OR FAIL
  // ===================================================================

  describe('Find By ID Or Fail', () => {
    it('should find entity by ID', () => {
      const data = { id: 'ID1', name: 'Test', status: 'active', value: 0 };
      mockTable.getByPK.mockReturnValue(data);

      const entity = repository.findByIdOrFail('ID1');

      expect(entity).toBeInstanceOf(TestEntity);
      expect(entity.id).toBe('ID1');
    });

    it('should throw EntityNotFoundException for non-existent ID', () => {
      mockTable.getByPK.mockReturnValue(null);

      expect(() => repository.findByIdOrFail('NON_EXISTENT')).toThrow(EntityNotFoundException);
    });
  });

  // ===================================================================
  // FIND WITH SPECIFICATION
  // ===================================================================

  describe('Find With Specification', () => {
    it('should find entities matching specification', () => {
      const spec = new FieldSpecification('status', 'equals', 'active');
      const data = [
        { id: 'ID1', name: 'Test1', status: 'active', value: 0 },
        { id: 'ID2', name: 'Test2', status: 'active', value: 0 }
      ];

      mockQueryTranslator.validate.mockReturnValue({ valid: true });

      const mockQuery = {
        execute: jest.fn().mockReturnValue(data)
      };
      const mockFrom = jest.fn().mockReturnValue(mockQuery);
      mockDatabase.select.mockReturnValue({ from: mockFrom });

      const entities = repository.find(spec);

      expect(entities.length).toBe(2);
      expect(entities[0]).toBeInstanceOf(TestEntity);
      expect(mockQueryTranslator.validate).toHaveBeenCalledWith(spec);
    });

    it('should use in-memory filtering for non-translatable specifications', () => {
      const spec = new FunctionSpecification((e) => e.value > 50);
      const data = [
        { id: 'ID1', name: 'Test1', status: 'active', value: 100 },
        { id: 'ID2', name: 'Test2', status: 'active', value: 30 }
      ];

      mockQueryTranslator.validate.mockReturnValue({ valid: false });
      mockTable.getAllRows.mockReturnValue(data);

      const entities = repository.find(spec);

      expect(entities.length).toBe(1);
      expect(entities[0].value).toBe(100);
      expect(mockTable.getAllRows).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // FIND ONE
  // ===================================================================

  describe('Find One', () => {
    it('should find first matching entity', () => {
      const spec = new FieldSpecification('status', 'equals', 'active');
      const data = [
        { id: 'ID1', name: 'Test1', status: 'active', value: 0 },
        { id: 'ID2', name: 'Test2', status: 'active', value: 0 }
      ];

      mockQueryTranslator.validate.mockReturnValue({ valid: true });

      const mockQuery = {
        execute: jest.fn().mockReturnValue(data)
      };
      const mockFrom = jest.fn().mockReturnValue(mockQuery);
      mockDatabase.select.mockReturnValue({ from: mockFrom });

      const entity = repository.findOne(spec);

      expect(entity).toBeInstanceOf(TestEntity);
      expect(entity.id).toBe('ID1');
    });

    it('should return null if no match found', () => {
      const spec = new FieldSpecification('status', 'equals', 'inactive');

      mockQueryTranslator.validate.mockReturnValue({ valid: true });

      const mockQuery = {
        execute: jest.fn().mockReturnValue([])
      };
      const mockFrom = jest.fn().mockReturnValue(mockQuery);
      mockDatabase.select.mockReturnValue({ from: mockFrom });

      const entity = repository.findOne(spec);

      expect(entity).toBeNull();
    });
  });

  // ===================================================================
  // FIND ALL
  // ===================================================================

  describe('Find All', () => {
    it('should find all entities', () => {
      const data = [
        { id: 'ID1', name: 'Test1', status: 'active', value: 0 },
        { id: 'ID2', name: 'Test2', status: 'inactive', value: 0 }
      ];

      mockTable.getAllRows.mockReturnValue(data);

      const entities = repository.findAll();

      expect(entities.length).toBe(2);
      expect(entities[0]).toBeInstanceOf(TestEntity);
      expect(mockTable.getAllRows).toHaveBeenCalled();
    });

    it('should return empty array if no entities', () => {
      mockTable.getAllRows.mockReturnValue([]);

      const entities = repository.findAll();

      expect(entities).toEqual([]);
    });
  });

  // ===================================================================
  // EXISTS
  // ===================================================================

  describe('Exists', () => {
    it('should return true if entity exists', () => {
      const spec = new FieldSpecification('status', 'equals', 'active');

      mockQueryTranslator.validate.mockReturnValue({ valid: true });

      const mockQuery = {
        execute: jest.fn().mockReturnValue([{ id: 'ID1' }])
      };
      const mockFrom = jest.fn().mockReturnValue(mockQuery);
      mockDatabase.select.mockReturnValue({ from: mockFrom });

      const exists = repository.exists(spec);

      expect(exists).toBe(true);
    });

    it('should return false if entity does not exist', () => {
      const spec = new FieldSpecification('status', 'equals', 'inactive');

      mockQueryTranslator.validate.mockReturnValue({ valid: true });

      const mockQuery = {
        execute: jest.fn().mockReturnValue([])
      };
      const mockFrom = jest.fn().mockReturnValue(mockQuery);
      mockDatabase.select.mockReturnValue({ from: mockFrom });

      const exists = repository.exists(spec);

      expect(exists).toBe(false);
    });
  });

  // ===================================================================
  // COUNT
  // ===================================================================

  describe('Count', () => {
    it('should count matching entities', () => {
      const spec = new FieldSpecification('status', 'equals', 'active');
      const data = [
        { id: 'ID1', name: 'Test1', status: 'active', value: 0 },
        { id: 'ID2', name: 'Test2', status: 'active', value: 0 }
      ];

      mockQueryTranslator.validate.mockReturnValue({ valid: true });

      const mockQuery = {
        execute: jest.fn().mockReturnValue(data)
      };
      const mockFrom = jest.fn().mockReturnValue(mockQuery);
      mockDatabase.select.mockReturnValue({ from: mockFrom });

      const count = repository.count(spec);

      expect(count).toBe(2);
    });

    it('should return 0 if no matches', () => {
      const spec = new FieldSpecification('status', 'equals', 'inactive');

      mockQueryTranslator.validate.mockReturnValue({ valid: true });

      const mockQuery = {
        execute: jest.fn().mockReturnValue([])
      };
      const mockFrom = jest.fn().mockReturnValue(mockQuery);
      mockDatabase.select.mockReturnValue({ from: mockFrom });

      const count = repository.count(spec);

      expect(count).toBe(0);
    });
  });

  // ===================================================================
  // DELETE
  // ===================================================================

  describe('Delete', () => {
    it('should delete entity', () => {
      const entity = new TestEntity({ id: 'ID1', name: 'Test', status: 'active' });

      repository.delete(entity);

      expect(mockTable.deleteRowById).toHaveBeenCalledWith('ID1');
      expect(mockDatabase.save).toHaveBeenCalled();
    });

    it('should clear cache after delete', () => {
      const entity = new TestEntity({ id: 'ID1', name: 'Test', status: 'active' });

      repository.delete(entity);

      expect(mocks.cache.remove).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // DELETE BY ID
  // ===================================================================

  describe('Delete By ID', () => {
    it('should delete entity by ID', () => {
      repository.deleteById('ID1');

      expect(mockTable.deleteRowById).toHaveBeenCalledWith('ID1');
      expect(mockDatabase.save).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // DELETE MANY
  // ===================================================================

  describe('Delete Many', () => {
    it('should delete multiple entities', () => {
      const entities = [
        new TestEntity({ id: 'ID1', name: 'Test1', status: 'active' }),
        new TestEntity({ id: 'ID2', name: 'Test2', status: 'active' })
      ];

      repository.deleteMany(entities);

      expect(mockTable.deleteRowById).toHaveBeenCalledTimes(2);
      expect(mockDatabase.save).toHaveBeenCalled();
    });

    it('should handle empty array', () => {
      repository.deleteMany([]);

      expect(mockTable.deleteRowById).not.toHaveBeenCalled();
      expect(mockDatabase.save).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // REFRESH
  // ===================================================================

  describe('Refresh', () => {
    it('should reload entity from database', () => {
      const entity = new TestEntity({ id: 'ID1', name: 'Old', status: 'active' });
      const freshData = { id: 'ID1', name: 'Updated', status: 'active', value: 100 };

      mockTable.getByPK.mockReturnValue(freshData);

      const refreshed = repository.refresh(entity);

      expect(refreshed.name).toBe('Updated');
      expect(refreshed.value).toBe(100);
    });

    it('should throw if entity no longer exists', () => {
      const entity = new TestEntity({ id: 'ID1', name: 'Test', status: 'active' });

      mockTable.getByPK.mockReturnValue(null);

      expect(() => repository.refresh(entity)).toThrow(EntityNotFoundException);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle null specification in find', () => {
      expect(() => repository.find(null)).toThrow();
    });

    it('should handle undefined entity in save', () => {
      expect(() => repository.save(undefined)).toThrow();
    });

    it('should handle null entity in delete', () => {
      expect(() => repository.delete(null)).toThrow();
    });

    it('should handle empty string as ID', () => {
      const entity = repository.findById('');

      expect(entity).toBeNull();
    });
  });
});
