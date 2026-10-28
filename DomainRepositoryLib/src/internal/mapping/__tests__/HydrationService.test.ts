import { jest } from '@jest/globals';
type TestData = EntityData & { name?: string | null; value?: number | null };
import type { EntityData, MapperProtocol } from '../../contracts.js';

// ===================================================================
// FILE: DomainRepositoryLib/src/mapping/__tests__/HydrationService.test.js
// ===================================================================

import { HydrationService } from '../HydrationService.js';
import { Entity } from '../../../Entity.js';
import { MockFactory } from '../../../../../test/fakes/MockFactory.js';

// Test entity
class TestEntity extends Entity {
  declare name: string | null | undefined;
  declare value: number;
  constructor(data: TestData) {
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

  static fromData(data: TestData) {
    return new TestEntity(data);
  }
}

describe('HydrationService - Comprehensive Test Suite', () => {
  let service: HydrationService;
  let mockEntityMapper: jest.Mocked<MapperProtocol>;
  let mocks: ReturnType<typeof MockFactory.createAllJest>;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    // Extend logger mock with log method for HydrationService
    mocks.logger.log = jest.fn();

    mockEntityMapper = {
      fromData: jest.fn((data: TestData | null, EntityClass: typeof TestEntity) => {
        if (!data) {
          return null;
        }
        return EntityClass.fromData(data);
      }) as typeof mockEntityMapper.fromData,
      fromDataArray: jest.fn((dataArray: TestData[], EntityClass: typeof TestEntity) => {
        return dataArray.map((d) => EntityClass.fromData(d));
      }) as typeof mockEntityMapper.fromDataArray,
      toData: jest.fn((entity: TestEntity | null) => {
        if (!entity) {
          return null;
        }
        return entity.toData();
      }) as typeof mockEntityMapper.toData,
      toDataArray: jest.fn((entities: TestEntity[]) => {
        return entities.map((e) => e.toData());
      }) as typeof mockEntityMapper.toDataArray
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
