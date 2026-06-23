// ===================================================================
// FILE: DomainRepositoryLib/src/mapping/__tests__/HydrationService.test.js
// ===================================================================

import { HydrationService } from '../HydrationService';
import { Entity } from '../../../Entity';
import { MockFactory } from '../../../../../test/fakes/MockFactory';

// Test entity
class TestEntity extends Entity {
  constructor(data) {
    super(data);
    this.name = data.name;
    this.value = data.value || 0;
  }

  toData() {
    return {
      id: this.id,
      name: this.name,
      value: this.value
    };
  }

  static fromData(data) {
    return new TestEntity(data);
  }
}

describe('HydrationService - Comprehensive Test Suite', () => {
  let service;
  let mockEntityMapper;
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    // Extend logger mock with log method for HydrationService
    mocks.logger.log = jest.fn();

    mockEntityMapper = {
      fromData: jest.fn((data, EntityClass) => {
        if (!data) {
          return null;
        }
        return EntityClass.fromData(data);
      }),
      fromDataArray: jest.fn((dataArray, EntityClass) => {
        return dataArray.map((d) => EntityClass.fromData(d));
      }),
      toData: jest.fn((entity) => {
        if (!entity) {
          return null;
        }
        return entity.toData();
      }),
      toDataArray: jest.fn((entities) => {
        return entities.map((e) => e.toData());
      })
    };

    service = new HydrationService(mockEntityMapper, mocks.logger);
  });

  describe('Hydration', () => {
    it('should hydrate simple objects', () => {
      const data = { id: '1', name: 'Test', value: 100 };
      const hydrated = service.hydrate(data, TestEntity);

      expect(hydrated.name).toBe('Test');
      expect(hydrated.value).toBe(100);
      expect(mockEntityMapper.fromData).toHaveBeenCalledWith(data, TestEntity);
    });

    it('should hydrate many objects', () => {
      const dataArray = [
        { id: '1', name: 'Test1', value: 100 },
        { id: '2', name: 'Test2', value: 200 }
      ];
      const hydrated = service.hydrateMany(dataArray, TestEntity);

      expect(hydrated.length).toBe(2);
      expect(hydrated[0].name).toBe('Test1');
      expect(hydrated[1].name).toBe('Test2');
      expect(mockEntityMapper.fromDataArray).toHaveBeenCalledWith(dataArray, TestEntity);
    });
  });

  describe('Dehydration', () => {
    it('should dehydrate entities', () => {
      const entity = new TestEntity({ id: '1', name: 'Test', value: 100 });
      const dehydrated = service.dehydrate(entity);

      expect(dehydrated).toEqual({ id: '1', name: 'Test', value: 100 });
      expect(mockEntityMapper.toData).toHaveBeenCalledWith(entity);
    });

    it('should dehydrate many entities', () => {
      const entities = [
        new TestEntity({ id: '1', name: 'Test1', value: 100 }),
        new TestEntity({ id: '2', name: 'Test2', value: 200 })
      ];
      const dehydrated = service.dehydrateMany(entities);

      expect(dehydrated.length).toBe(2);
      expect(dehydrated[0].name).toBe('Test1');
      expect(dehydrated[1].name).toBe('Test2');
      expect(mockEntityMapper.toDataArray).toHaveBeenCalledWith(entities);
    });
  });

  describe('Utility Methods', () => {
    it('should store original data on entity', () => {
      const entity = new TestEntity({ id: '1', name: 'Test', value: 100 });
      entity.storeOriginalData = jest.fn();
      const data = { id: '1', name: 'Test', value: 100 };

      service.storeOriginalData(entity, data);

      expect(entity.storeOriginalData).toHaveBeenCalledWith(data);
    });

    it('should clear dirty fields on entity', () => {
      const entity = new TestEntity({ id: '1', name: 'Test', value: 100 });
      entity.clearDirtyFields = jest.fn();

      service.clearDirtyFields(entity);

      expect(entity.clearDirtyFields).toHaveBeenCalled();
    });

    it('should refresh entity from data', () => {
      const entity = new TestEntity({ id: '1', name: 'Old', value: 100 });
      entity.storeOriginalData = jest.fn();
      entity.clearDirtyFields = jest.fn();
      const newData = { id: '1', name: 'New', value: 200 };

      service.refresh(entity, newData);

      expect(entity.name).toBe('New');
      expect(entity.value).toBe(200);
      expect(entity.storeOriginalData).toHaveBeenCalledWith(newData);
      expect(entity.clearDirtyFields).toHaveBeenCalled();
    });
  });
});
