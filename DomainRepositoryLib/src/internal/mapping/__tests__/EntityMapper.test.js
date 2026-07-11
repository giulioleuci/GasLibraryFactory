// ===================================================================
// FILE: DomainRepositoryLib/src/mapping/__tests__/EntityMapper.test.js
// ===================================================================

import { EntityMapper } from '../EntityMapper';
import { Entity } from '../../../Entity';

class TestEntity extends Entity {
  constructor(data) {
    super(data);
    this.name = data.name;
    this.value = data.value;
  }

  toData() {
    return { id: this.id, name: this.name, value: this.value };
  }

  static fromData(data) {
    return new TestEntity(data);
  }
}

describe('EntityMapper - Comprehensive Test Suite', () => {
  let mapper;

  beforeEach(() => {
    mapper = new EntityMapper();
  });

  describe('toData', () => {
    it('should convert entity to plain object', () => {
      const entity = new TestEntity({ id: 'ID1', name: 'Test', value: 100 });
      const data = mapper.toData(entity);

      expect(data).toEqual({ id: 'ID1', name: 'Test', value: 100 });
    });

    it('should handle null entity', () => {
      const result = mapper.toData(null);
      expect(result).toBeNull();
    });
  });

  describe('fromData', () => {
    it('should convert plain object to entity', () => {
      const data = { id: 'ID1', name: 'Test', value: 100 };
      const entity = mapper.fromData(data, TestEntity);

      expect(entity).toBeInstanceOf(TestEntity);
      expect(entity.id).toBe('ID1');
      expect(entity.name).toBe('Test');
    });

    it('should handle null data', () => {
      const result = mapper.fromData(null, TestEntity);
      expect(result).toBeNull();
    });
  });

  describe('toDataArray', () => {
    it('should convert array of entities', () => {
      const entities = [
        new TestEntity({ id: 'ID1', name: 'Test1', value: 100 }),
        new TestEntity({ id: 'ID2', name: 'Test2', value: 200 })
      ];

      const dataArray = mapper.toDataArray(entities);

      expect(dataArray.length).toBe(2);
      expect(dataArray[0].id).toBe('ID1');
    });

    it('should handle empty array', () => {
      const result = mapper.toDataArray([]);

      expect(result).toEqual([]);
    });
  });

  describe('fromDataArray', () => {
    it('should convert array of plain objects', () => {
      const dataArray = [
        { id: 'ID1', name: 'Test1', value: 100 },
        { id: 'ID2', name: 'Test2', value: 200 }
      ];

      const entities = mapper.fromDataArray(dataArray, TestEntity);

      expect(entities.length).toBe(2);
      expect(entities[0]).toBeInstanceOf(TestEntity);
    });

    it('should handle empty array', () => {
      const result = mapper.fromDataArray([], TestEntity);

      expect(result).toEqual([]);
    });
  });

  describe('Dynamic Field Mapping Integration', () => {
    // Test entity with dynamic Map property
    class ClassEntity extends Entity {
      constructor(data) {
        super(data);
        this.name = data.name || null;
        this.chairs = data.chairs || new Map(); // Dynamic Map property
      }

      toData() {
        return {
          id: this.id,
          name: this.name,
          chairs: this.chairs
        };
      }

      static fromData(data) {
        return new ClassEntity(data);
      }
    }

    it('should hydrate dynamic fields from multiple columns to Map', () => {
      mapper.configureDynamicField({
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main] || null,
          assistant: row[columns.assistant] || null
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      });

      const row = {
        id: 'CLASS_1',
        name: '10th Grade A',
        MATH: 'teacher_john@school.com',
        'MATH.assistant': 'assistant_mary@school.com',
        HIST: 'teacher_alice@school.com',
        'HIST.assistant': 'assistant_bob@school.com'
      };

      const entity = mapper.fromData(row, ClassEntity);

      expect(entity).toBeInstanceOf(ClassEntity);
      expect(entity.name).toBe('10th Grade A');
      expect(entity.chairs).toBeInstanceOf(Map);
      expect(entity.chairs.size).toBe(2);
      expect(entity.chairs.get('MATH')).toEqual({
        main: 'teacher_john@school.com',
        assistant: 'assistant_mary@school.com'
      });
      expect(entity.chairs.get('HIST')).toEqual({
        main: 'teacher_alice@school.com',
        assistant: 'assistant_bob@school.com'
      });
    });

    it('should dehydrate dynamic Map property to multiple columns', () => {
      mapper.configureDynamicField({
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main] || null,
          assistant: row[columns.assistant] || null
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      });

      const chairsMap = new Map();
      chairsMap.set('MATH', {
        main: 'teacher_john@school.com',
        assistant: 'assistant_mary@school.com'
      });
      chairsMap.set('HIST', {
        main: 'teacher_alice@school.com',
        assistant: 'assistant_bob@school.com'
      });

      const entity = new ClassEntity({
        id: 'CLASS_1',
        name: '10th Grade A',
        chairs: chairsMap
      });

      const data = mapper.toData(entity);

      expect(data.id).toBe('CLASS_1');
      expect(data.name).toBe('10th Grade A');
      expect(data.chairs).toBeUndefined(); // Map is dehydrated to columns
      expect(data.MATH).toBe('teacher_john@school.com');
      expect(data['MATH.assistant']).toBe('assistant_mary@school.com');
      expect(data.HIST).toBe('teacher_alice@school.com');
      expect(data['HIST.assistant']).toBe('assistant_bob@school.com');
    });

    it('should support round-trip with dynamic fields', () => {
      mapper.configureDynamicField({
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main] || null,
          assistant: row[columns.assistant] || null
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      });

      const originalRow = {
        id: 'CLASS_1',
        name: '10th Grade A',
        MATH: 'teacher_john@school.com',
        'MATH.assistant': 'assistant_mary@school.com',
        HIST: 'teacher_alice@school.com',
        'HIST.assistant': 'assistant_bob@school.com'
      };

      // Hydrate
      const entity = mapper.fromData(originalRow, ClassEntity);

      // Dehydrate
      const reconstructedRow = mapper.toData(entity);

      expect(reconstructedRow.MATH).toBe(originalRow.MATH);
      expect(reconstructedRow['MATH.assistant']).toBe(originalRow['MATH.assistant']);
      expect(reconstructedRow.HIST).toBe(originalRow.HIST);
      expect(reconstructedRow['HIST.assistant']).toBe(originalRow['HIST.assistant']);
    });
  });

  describe('JSON Expansion Mapping Integration', () => {
    // Test entity with JSON-backed properties
    class ClassEntityWithRoles extends Entity {
      constructor(data) {
        super(data);
        this.name = data.name || null;
        this.tutor = data.tutor || null;
        this.secretary = data.secretary || null;
      }

      toData() {
        return {
          id: this.id,
          name: this.name,
          tutor: this.tutor,
          secretary: this.secretary
        };
      }

      static fromData(data) {
        return new ClassEntityWithRoles(data);
      }
    }

    it('should hydrate JSON column to individual properties', () => {
      mapper.configureJsonExpansion({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      const row = {
        id: 'CLASS_1',
        name: '10th Grade A',
        ROLES: '{"tutor":"email@test.com","secretary":"email2@test.com"}'
      };

      const entity = mapper.fromData(row, ClassEntityWithRoles);

      expect(entity).toBeInstanceOf(ClassEntityWithRoles);
      expect(entity.name).toBe('10th Grade A');
      expect(entity.tutor).toBe('email@test.com');
      expect(entity.secretary).toBe('email2@test.com');
    });

    it('should dehydrate individual properties to JSON column', () => {
      mapper.configureJsonExpansion({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      const entity = new ClassEntityWithRoles({
        id: 'CLASS_1',
        name: '10th Grade A',
        tutor: 'email@test.com',
        secretary: 'email2@test.com'
      });

      const data = mapper.toData(entity);

      expect(data.id).toBe('CLASS_1');
      expect(data.name).toBe('10th Grade A');
      expect(data.tutor).toBeUndefined(); // Collapsed into JSON
      expect(data.secretary).toBeUndefined(); // Collapsed into JSON
      expect(data.ROLES).toBe('{"tutor":"email@test.com","secretary":"email2@test.com"}');
    });

    it('should support round-trip with JSON expansion', () => {
      mapper.configureJsonExpansion({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      const originalRow = {
        id: 'CLASS_1',
        name: '10th Grade A',
        ROLES: '{"tutor":"email@test.com","secretary":"email2@test.com"}'
      };

      // Hydrate
      const entity = mapper.fromData(originalRow, ClassEntityWithRoles);

      // Dehydrate
      const reconstructedRow = mapper.toData(entity);

      expect(JSON.parse(reconstructedRow.ROLES)).toEqual(JSON.parse(originalRow.ROLES));
    });
  });

  describe('Combined Dynamic and JSON Expansion Mapping', () => {
    // Test entity with both dynamic and JSON-backed properties
    class ComplexClassEntity extends Entity {
      constructor(data) {
        super(data);
        this.name = data.name || null;
        this.chairs = data.chairs || new Map(); // Dynamic
        this.tutor = data.tutor || null; // JSON-backed
        this.secretary = data.secretary || null; // JSON-backed
      }

      toData() {
        return {
          id: this.id,
          name: this.name,
          chairs: this.chairs,
          tutor: this.tutor,
          secretary: this.secretary
        };
      }

      static fromData(data) {
        return new ComplexClassEntity(data);
      }
    }

    it('should apply both dynamic and JSON mappings during hydration', () => {
      mapper.configureDynamicField({
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main] || null,
          assistant: row[columns.assistant] || null
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      });

      mapper.configureJsonExpansion({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      const row = {
        id: 'CLASS_1',
        name: '10th Grade A',
        MATH: 'teacher_john@school.com',
        'MATH.assistant': 'assistant_mary@school.com',
        HIST: 'teacher_alice@school.com',
        'HIST.assistant': 'assistant_bob@school.com',
        ROLES: '{"tutor":"email@test.com","secretary":"email2@test.com"}'
      };

      const entity = mapper.fromData(row, ComplexClassEntity);

      expect(entity.name).toBe('10th Grade A');
      expect(entity.chairs.size).toBe(2);
      expect(entity.chairs.get('MATH').main).toBe('teacher_john@school.com');
      expect(entity.tutor).toBe('email@test.com');
      expect(entity.secretary).toBe('email2@test.com');
    });

    it('should apply both dynamic and JSON mappings during dehydration', () => {
      mapper.configureDynamicField({
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main] || null,
          assistant: row[columns.assistant] || null
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      });

      mapper.configureJsonExpansion({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      const chairsMap = new Map();
      chairsMap.set('MATH', {
        main: 'teacher_john@school.com',
        assistant: 'assistant_mary@school.com'
      });
      chairsMap.set('HIST', {
        main: 'teacher_alice@school.com',
        assistant: 'assistant_bob@school.com'
      });

      const entity = new ComplexClassEntity({
        id: 'CLASS_1',
        name: '10th Grade A',
        chairs: chairsMap,
        tutor: 'email@test.com',
        secretary: 'email2@test.com'
      });

      const data = mapper.toData(entity);

      expect(data.name).toBe('10th Grade A');
      expect(data.MATH).toBe('teacher_john@school.com');
      expect(data['MATH.assistant']).toBe('assistant_mary@school.com');
      expect(data.HIST).toBe('teacher_alice@school.com');
      expect(data['HIST.assistant']).toBe('assistant_bob@school.com');
      expect(JSON.parse(data.ROLES)).toEqual({
        tutor: 'email@test.com',
        secretary: 'email2@test.com'
      });
    });
  });

  describe('Dynamic column passthrough (REPORT_GLF.md B2)', () => {
    // Mirrors ALDO's CLASSI: fixed columns (id, name) are typed properties;
    // getKnownColumns() opts the entity into capturing/round-tripping the rest.
    class ClasseLikeEntity extends Entity {
      constructor(data = {}) {
        super(data);
        this.name = data.name;
      }
      toData() {
        return { id: this.id, name: this.name };
      }
      static fromData(data) {
        return new ClasseLikeEntity(data);
      }
      static getKnownColumns() {
        return ['id', 'name'];
      }
    }

    it('fromData() captures columns outside getKnownColumns on the hydrated entity', () => {
      const entity = mapper.fromData(
        { id: '5A', name: 'Quinta A', MATE: 'a@x.it', FISI: 'b@x.it' },
        ClasseLikeEntity
      );

      expect(entity.getDynamicColumns()).toEqual({ MATE: 'a@x.it', FISI: 'b@x.it' });
    });

    it('toData() merges captured dynamic columns back into the persisted row', () => {
      const entity = mapper.fromData(
        { id: '5A', name: 'Quinta A', MATE: 'a@x.it', FISI: 'b@x.it' },
        ClasseLikeEntity
      );

      const data = mapper.toData(entity);

      expect(data).toEqual({ id: '5A', name: 'Quinta A', MATE: 'a@x.it', FISI: 'b@x.it' });
    });

    it('a single-column edit via setDynamicColumn round-trips without touching other dynamic columns', () => {
      const entity = mapper.fromData(
        { id: '5A', name: 'Quinta A', MATE: 'a@x.it', FISI: 'b@x.it' },
        ClasseLikeEntity
      );

      entity.setDynamicColumn('MATE', 'c@x.it');
      const data = mapper.toData(entity);

      expect(data).toEqual({ id: '5A', name: 'Quinta A', MATE: 'c@x.it', FISI: 'b@x.it' });
    });

    it('entity toData() values for known columns take precedence over any captured value', () => {
      const entity = mapper.fromData(
        { id: '5A', name: 'Quinta A', MATE: 'a@x.it' },
        ClasseLikeEntity
      );
      entity.name = 'Renamed';

      const data = mapper.toData(entity);

      expect(data.name).toBe('Renamed');
      expect(data.MATE).toBe('a@x.it');
    });

    it('entities without getKnownColumns are unaffected (no dynamic columns captured)', () => {
      const entity = mapper.fromData(
        { id: 'ID1', name: 'Test', value: 100, EXTRA: 'z' },
        TestEntity
      );

      const data = mapper.toData(entity);

      expect(data).toEqual({ id: 'ID1', name: 'Test', value: 100 });
    });
  });
});
