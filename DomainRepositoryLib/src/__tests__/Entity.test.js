// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/Entity.test.js
// ===================================================================
// Comprehensive test suite for Entity base class
// Coverage: All methods and features
// ===================================================================

import { faker } from '@faker-js/faker';
import { Entity } from '../Entity';
import { ValidationException } from '@GasSchemaValidatorLib';
import { MockFactory } from '../../../test/fakes';

// Create a concrete entity implementation for testing
class TestEntity extends Entity {
  constructor(data) {
    super(data);
    this.name = data.name;
    this.value = data.value;
    this.status = data.status || 'active';
  }

  validate() {
    super.validate();

    if (!this.name || this.name.trim() === '') {
      this.addValidationError('name', 'Name is required');
    }

    if (this.value != null && this.value < 0) {
      this.addValidationError('value', 'Value must be non-negative');
    }

    return this.getValidationErrors().length === 0;
  }

  toData() {
    return {
      id: this.id,
      name: this.name,
      value: this.value,
      status: this.status
    };
  }

  static fromData(data) {
    return new TestEntity(data);
  }
}

describe('Entity - Comprehensive Test Suite', () => {
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create entity with provided data', () => {
      const name = faker.person.firstName();
      const value = faker.number.int({ min: 1, max: 1000 });
      const status = faker.helpers.arrayElement(['active', 'inactive', 'pending']);
      const data = { name, value, status };
      const entity = new TestEntity(data);

      expect(entity.name).toBe(name);
      expect(entity.value).toBe(value);
      expect(entity.status).toBe(status);
    });

    it('should create entity with null ID if not provided', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity.id).toBeNull();
    });

    it('should use provided ID if given', () => {
      const customId = faker.string.alphanumeric(10);
      const entity = new TestEntity({
        id: customId,
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity.id).toBe(customId);
    });

    it('should initialize without dirty fields', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity.hasDirtyFields()).toBe(false);
      expect(entity.getDirtyFields()).toEqual([]);
    });

    it('should initialize without validation errors', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity.getValidationErrors()).toEqual([]);
    });

    it('should handle default values in constructor', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity.status).toBe('active'); // default value
    });
  });

  // ===================================================================
  // IDENTITY MANAGEMENT
  // ===================================================================

  describe('Identity Management', () => {
    it('should compare entities by ID using equals', () => {
      const sharedId = faker.string.uuid();
      const entity1 = new TestEntity({
        id: sharedId,
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });
      const entity2 = new TestEntity({
        id: sharedId,
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });
      const entity3 = new TestEntity({
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity1.equals(entity2)).toBe(true); // same ID
      expect(entity1.equals(entity3)).toBe(false); // different ID
    });

    it('should return false when comparing to non-entity', () => {
      const entityId = faker.string.uuid();
      const entity = new TestEntity({
        id: entityId,
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity.equals(null)).toBe(false);
      expect(entity.equals(undefined)).toBe(false);
      expect(entity.equals({ id: entityId })).toBe(false);
    });

    it('should allow setting IDs on entities', () => {
      const id1 = faker.string.uuid();
      const id2 = faker.string.uuid();
      const entity1 = new TestEntity({
        id: id1,
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });
      const entity2 = new TestEntity({
        id: id2,
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity1.id).toBe(id1);
      expect(entity2.id).toBe(id2);
      expect(entity1.id).not.toBe(entity2.id);
    });
  });

  // ===================================================================
  // DIRTY TRACKING
  // ===================================================================

  describe('Dirty Tracking', () => {
    it('should mark field as dirty', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      const modifiedName = faker.person.firstName();
      entity.name = modifiedName;
      entity.markDirty('name');

      expect(entity.isDirty('name')).toBe(true);
      expect(entity.hasDirtyFields()).toBe(true);
    });

    it('should track multiple dirty fields', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      const modifiedName = faker.person.firstName();
      const modifiedValue = faker.number.int({ min: 1000, max: 2000 });
      entity.name = modifiedName;
      entity.markDirty('name');
      entity.value = modifiedValue;
      entity.markDirty('value');

      expect(entity.isDirty('name')).toBe(true);
      expect(entity.isDirty('value')).toBe(true);
      expect(entity.hasDirtyFields()).toBe(true);
      expect(entity.getDirtyFields()).toEqual(['name', 'value']);
    });

    it('should not mark same field as dirty twice', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      entity.markDirty('name');
      entity.markDirty('name');

      expect(entity.getDirtyFields()).toEqual(['name']);
    });

    it('should clear all dirty fields', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      entity.markDirty('name');
      entity.markDirty('value');
      entity.clearDirtyFields();

      expect(entity.hasDirtyFields()).toBe(false);
      expect(entity.getDirtyFields()).toEqual([]);
    });

    it('should return false for isDirty on clean field', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity.isDirty('name')).toBe(false);
      expect(entity.isDirty('nonexistent')).toBe(false);
    });

    it('should track changes with getChanges', () => {
      const entity = new TestEntity({
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      const modifiedName = faker.person.firstName();
      entity.name = modifiedName;
      entity.markDirty('name');

      const changes = entity.getChanges();
      expect(changes).toEqual({ name: modifiedName });
      expect(changes.name).toBe(modifiedName);
    });
  });

  // ===================================================================
  // VALIDATION
  // ===================================================================

  describe('Validation', () => {
    it('should validate valid entity', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(entity.validate()).toBe(true);
      expect(entity.isValid()).toBe(true);
      expect(entity.getValidationErrors()).toEqual([]);
    });

    it('should fail validation for invalid data', () => {
      const entity = new TestEntity({ name: '', value: -10 });

      expect(entity.validate()).toBe(false);
      expect(entity.isValid()).toBe(false);
    });

    it('should collect validation errors', () => {
      const entity = new TestEntity({ name: '', value: -10 });

      entity.validate();
      const errors = entity.getValidationErrors();

      expect(errors.length).toBe(2);
      expect(errors.some((e) => e.field === 'name')).toBe(true);
      expect(errors.some((e) => e.field === 'value')).toBe(true);
    });

    it('should add validation error correctly', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      const customField = faker.word.noun();
      const customMessage = faker.lorem.sentence();
      entity.addValidationError(customField, customMessage);
      const errors = entity.getValidationErrors();

      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe(customField);
      expect(errors[0].message).toBe(customMessage);
    });

    it('should clear validation errors on re-validation', () => {
      const entity = new TestEntity({ name: '', value: -10 });

      entity.validate();
      expect(entity.getValidationErrors().length).toBeGreaterThan(0);

      // Update the entity with valid data and validate again - this clears errors
      entity.name = faker.person.firstName();
      entity.value = faker.number.int({ min: 1, max: 1000 });
      entity.validate();
      expect(entity.getValidationErrors()).toEqual([]);
    });

    it('should throw ValidationException with validateOrThrow', () => {
      const entity = new TestEntity({ name: '', value: -10 });

      expect(() => entity.validateOrThrow()).toThrow(ValidationException);
    });

    it('should throw ValidationException with correct entityType and errors', () => {
      const entity = new TestEntity({ name: '', value: -1 });
      entity.validate();
      try {
        entity.validateOrThrow();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationException);
        expect(e.entityType).toBe('TestEntity');
        expect(e.errors.length).toBeGreaterThan(0);
      }
    });

    it('should not throw with validateOrThrow on valid entity', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      expect(() => entity.validateOrThrow()).not.toThrow();
    });

    it('should re-validate and clear previous errors', () => {
      const entity = new TestEntity({
        name: '',
        value: faker.number.int({ min: 1, max: 1000 })
      });

      entity.validate();
      expect(entity.getValidationErrors().length).toBeGreaterThan(0);

      entity.name = faker.person.firstName();
      entity.validate();
      expect(entity.getValidationErrors()).toEqual([]);
    });
  });

  // ===================================================================
  // SERIALIZATION
  // ===================================================================

  describe('Serialization', () => {
    it('should serialize to plain data object with toData', () => {
      const id = faker.string.uuid();
      const name = faker.person.firstName();
      const value = faker.number.int({ min: 1, max: 1000 });
      const status = faker.helpers.arrayElement(['active', 'inactive', 'pending']);
      const entity = new TestEntity({ id, name, value, status });

      const data = entity.toData();

      expect(data).toEqual({ id, name, value, status });
    });

    it('should restore from data with fromData', () => {
      const data = {
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 }),
        status: faker.helpers.arrayElement(['active', 'inactive', 'pending'])
      };

      const entity = TestEntity.fromData(data);

      expect(entity).toBeInstanceOf(TestEntity);
      expect(entity.id).toBe(data.id);
      expect(entity.name).toBe(data.name);
      expect(entity.value).toBe(data.value);
      expect(entity.status).toBe(data.status);
    });

    it('should round-trip serialize and deserialize', () => {
      const original = new TestEntity({
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 }),
        status: faker.helpers.arrayElement(['active', 'inactive', 'pending'])
      });

      const data = original.toData();
      const restored = TestEntity.fromData(data);

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.value).toBe(original.value);
      expect(restored.status).toBe(original.status);
    });
  });

  // ===================================================================
  // ABSTRACT METHOD ENFORCEMENT
  // ===================================================================

  describe('Abstract Method Enforcement', () => {
    it('should throw error if toData not implemented', () => {
      class IncompleteEntity extends Entity {
        constructor(data) {
          super(data);
        }
      }

      const entity = new IncompleteEntity({});
      expect(() => entity.toData()).toThrow();
    });

    it('should throw error if fromData not implemented', () => {
      class IncompleteEntity extends Entity {
        constructor(data) {
          super(data);
        }
      }

      expect(() => IncompleteEntity.fromData({})).toThrow();
    });
  });

  // ===================================================================
  // EDGE CASES AND ERROR HANDLING
  // ===================================================================

  describe('Edge Cases and Error Handling', () => {
    it('should handle entity with null values', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: null
      });

      expect(entity.value).toBeNull();
      expect(() => entity.validate()).not.toThrow();
    });

    it('should handle entity with undefined values', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: undefined
      });

      expect(entity.value).toBeUndefined();
    });

    it('should handle empty data object', () => {
      const entity = new TestEntity({});

      expect(entity.id).toBeDefined();
      expect(entity.name).toBeUndefined();
    });

    it('should handle marking non-existent field as dirty', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      entity.markDirty('nonExistentField');

      expect(entity.isDirty('nonExistentField')).toBe(true);
      expect(entity.getDirtyFields()).toContain('nonExistentField');
    });

    it('should handle multiple validations without side effects', () => {
      const entity = new TestEntity({
        name: faker.person.firstName(),
        value: faker.number.int({ min: 1, max: 1000 })
      });

      entity.validate();
      entity.validate();
      entity.validate();

      expect(entity.getValidationErrors()).toEqual([]);
    });
  });

  // ===================================================================
  // INHERITANCE AND POLYMORPHISM
  // ===================================================================

  describe('Inheritance and Polymorphism', () => {
    it('should support entity inheritance', () => {
      class ExtendedEntity extends TestEntity {
        constructor(data) {
          super(data);
          this.extraField = data.extraField;
        }

        toData() {
          return {
            ...super.toData(),
            extraField: this.extraField
          };
        }

        static fromData(data) {
          return new ExtendedEntity(data);
        }
      }

      const name = faker.person.firstName();
      const value = faker.number.int({ min: 1, max: 1000 });
      const extraField = faker.lorem.word();
      const entity = new ExtendedEntity({ name, value, extraField });

      expect(entity).toBeInstanceOf(TestEntity);
      expect(entity).toBeInstanceOf(Entity);
      expect(entity.extraField).toBe(extraField);
    });

    it('should allow overriding validation in subclass', () => {
      class StrictEntity extends TestEntity {
        validate() {
          super.validate();

          if (this.value != null && this.value < 50) {
            this.addValidationError('value', 'Value must be at least 50');
          }

          return this.getValidationErrors().length === 0;
        }
      }

      const name = faker.person.firstName();
      const entity1 = new StrictEntity({ name, value: 30 });
      const entity2 = new StrictEntity({ name, value: 60 });

      expect(entity1.validate()).toBe(false);
      expect(entity2.validate()).toBe(true);
    });
  });

  describe('Dynamic column passthrough (opt-in via getKnownColumns)', () => {
    // Mirrors ALDO's CLASSI cattedra matrix: fixed columns are typed properties,
    // the rest of the row (per-subject columns generated at runtime) is unknown
    // at compile time (REPORT_GLF.md B2).
    class MatrixEntity extends Entity {
      constructor(data = {}) {
        super(data);
        this.name = data.name;
      }
      toData() {
        return { id: this.id, name: this.name };
      }
      static fromData(data) {
        return new MatrixEntity(data);
      }
      static getKnownColumns() {
        return ['id', 'name'];
      }
    }

    it('does nothing when the entity class has no getKnownColumns', () => {
      const entity = new TestEntity({ name: 'x', value: 1 });

      entity.captureDynamicColumns({ id: '1', name: 'x', value: 1, EXTRA: 'z' });

      expect(entity.getDynamicColumns()).toEqual({});
    });

    it('captures columns absent from getKnownColumns at hydration time', () => {
      const entity = new MatrixEntity({ id: '5A', name: 'Quinta A' });

      entity.captureDynamicColumns({ id: '5A', name: 'Quinta A', MATE: 'a@x.it', FISI: 'b@x.it' });

      expect(entity.getDynamicColumns()).toEqual({ MATE: 'a@x.it', FISI: 'b@x.it' });
    });

    it('setDynamicColumn adds/overwrites a captured column and marks it dirty', () => {
      const entity = new MatrixEntity({ id: '5A', name: 'Quinta A' });
      entity.captureDynamicColumns({ id: '5A', name: 'Quinta A', MATE: 'a@x.it' });

      entity.setDynamicColumn('MATE', 'c@x.it');

      expect(entity.getDynamicColumns()).toEqual({ MATE: 'c@x.it' });
      expect(entity.isDirty('MATE')).toBe(true);
    });

    it('getDynamicColumns returns a shallow copy, not a live reference', () => {
      const entity = new MatrixEntity({ id: '5A', name: 'Quinta A' });
      entity.captureDynamicColumns({ id: '5A', name: 'Quinta A', MATE: 'a@x.it' });

      const snapshot = entity.getDynamicColumns();
      snapshot.MATE = 'mutated';

      expect(entity.getDynamicColumns().MATE).toBe('a@x.it');
    });
  });
});
