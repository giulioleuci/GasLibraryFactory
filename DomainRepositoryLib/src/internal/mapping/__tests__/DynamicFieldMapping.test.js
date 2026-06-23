// ===================================================================
// FILE: DomainRepositoryLib/src/mapping/__tests__/DynamicFieldMapping.test.js
// ===================================================================

import { DynamicFieldMapping } from '../DynamicFieldMapping';

describe('DynamicFieldMapping - Comprehensive Test Suite', () => {
  describe('Constructor and Validation', () => {
    it('should create a valid mapping with all required config', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main],
          assistant: row[columns.assistant]
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      };

      const mapping = new DynamicFieldMapping(config);

      expect(mapping.propertyName).toBe('chairs');
      expect(mapping.schemaProvider).toBe(config.schemaProvider);
      expect(mapping.columnPattern).toBe(config.columnPattern);
      expect(mapping.aggregate).toBe(config.aggregate);
      expect(mapping.expand).toBe(config.expand);
    });

    it('should throw error if propertyName is missing', () => {
      const config = {
        schemaProvider: () => [],
        columnPattern: () => ({}),
        aggregate: () => ({}),
        expand: () => ({})
      };

      expect(() => new DynamicFieldMapping(config)).toThrow(
        'DynamicFieldMapping: propertyName must be a non-empty string'
      );
    });

    it('should throw error if schemaProvider is not a function', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: ['MATH', 'HIST'], // Should be a function
        columnPattern: () => ({}),
        aggregate: () => ({}),
        expand: () => ({})
      };

      expect(() => new DynamicFieldMapping(config)).toThrow(
        'DynamicFieldMapping: schemaProvider must be a function'
      );
    });

    it('should throw error if columnPattern is not a function', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: null, // Should be a function
        aggregate: () => ({}),
        expand: () => ({})
      };

      expect(() => new DynamicFieldMapping(config)).toThrow(
        'DynamicFieldMapping: columnPattern must be a function'
      );
    });

    it('should throw error if aggregate is not a function', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: () => ({}),
        aggregate: null, // Should be a function
        expand: () => ({})
      };

      expect(() => new DynamicFieldMapping(config)).toThrow(
        'DynamicFieldMapping: aggregate must be a function'
      );
    });

    it('should throw error if expand is not a function', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: () => ({}),
        aggregate: () => ({}),
        expand: null // Should be a function
      };

      expect(() => new DynamicFieldMapping(config)).toThrow(
        'DynamicFieldMapping: expand must be a function'
      );
    });
  });

  describe('hydrate - Data to Entity', () => {
    it('should aggregate multiple columns into a Map (school subject example)', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST', 'SCI'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main] || null,
          assistant: row[columns.assistant] || null
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      };

      const mapping = new DynamicFieldMapping(config);

      // Simulated database row with dynamic columns
      const row = {
        id: 'CLASS_1',
        name: '10th Grade A',
        MATH: 'teacher_john@school.com',
        'MATH.assistant': 'assistant_mary@school.com',
        HIST: 'teacher_alice@school.com',
        'HIST.assistant': 'assistant_bob@school.com',
        SCI: 'teacher_eve@school.com',
        'SCI.assistant': null
      };

      const result = mapping.hydrate(row);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
      expect(result.get('MATH')).toEqual({
        main: 'teacher_john@school.com',
        assistant: 'assistant_mary@school.com'
      });
      expect(result.get('HIST')).toEqual({
        main: 'teacher_alice@school.com',
        assistant: 'assistant_bob@school.com'
      });
      expect(result.get('SCI')).toEqual({
        main: 'teacher_eve@school.com',
        assistant: null
      });
    });

    it('should return empty Map when schema is empty', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => [], // No subjects
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main],
          assistant: row[columns.assistant]
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      };

      const mapping = new DynamicFieldMapping(config);
      const row = { id: 'CLASS_1' };
      const result = mapping.hydrate(row);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should handle missing columns gracefully', () => {
      const config = {
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
      };

      const mapping = new DynamicFieldMapping(config);

      // Row with only MATH columns, HIST columns are missing
      const row = {
        id: 'CLASS_1',
        MATH: 'teacher_john@school.com',
        'MATH.assistant': 'assistant_mary@school.com'
      };

      const result = mapping.hydrate(row);

      expect(result.size).toBe(2);
      expect(result.get('MATH')).toEqual({
        main: 'teacher_john@school.com',
        assistant: 'assistant_mary@school.com'
      });
      expect(result.get('HIST')).toEqual({
        main: null,
        assistant: null
      });
    });

    it('should warn and return empty Map if schemaProvider returns non-array', () => {
      const mockLogger = { warn: jest.fn(), error: jest.fn(), log: jest.fn() };

      const config = {
        propertyName: 'chairs',
        schemaProvider: () => 'NOT_AN_ARRAY', // Invalid
        columnPattern: (key) => ({ main: key }),
        aggregate: (row, key, columns) => ({ main: row[columns.main] }),
        expand: (value, key, columns) => ({ [columns.main]: value.main }),
        logger: mockLogger
      };

      const mapping = new DynamicFieldMapping(config);
      const row = { id: 'CLASS_1' };
      const result = mapping.hydrate(row);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('did not return an array')
      );
    });

    it('should skip null/undefined aggregated values', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST', 'SCI'],
        columnPattern: (key) => ({ main: key }),
        aggregate: (row, key, columns) => {
          // Return null for HIST to test skipping
          if (key === 'HIST') {
            return null;
          }
          return { main: row[columns.main] };
        },
        expand: (value, key, columns) => ({ [columns.main]: value.main })
      };

      const mapping = new DynamicFieldMapping(config);
      const row = { MATH: 'teacher1', HIST: 'teacher2', SCI: 'teacher3' };
      const result = mapping.hydrate(row);

      // HIST should be skipped because aggregate returned null
      expect(result.size).toBe(2);
      expect(result.has('MATH')).toBe(true);
      expect(result.has('HIST')).toBe(false);
      expect(result.has('SCI')).toBe(true);
    });
  });

  describe('dehydrate - Entity to Data', () => {
    it('should expand Map back to multiple columns (school subject example)', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({
          main: row[columns.main],
          assistant: row[columns.assistant]
        }),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      };

      const mapping = new DynamicFieldMapping(config);

      // Entity with Map property
      const chairsMap = new Map();
      chairsMap.set('MATH', {
        main: 'teacher_john@school.com',
        assistant: 'assistant_mary@school.com'
      });
      chairsMap.set('HIST', {
        main: 'teacher_alice@school.com',
        assistant: 'assistant_bob@school.com'
      });

      const result = mapping.dehydrate(chairsMap);

      expect(result).toEqual({
        MATH: 'teacher_john@school.com',
        'MATH.assistant': 'assistant_mary@school.com',
        HIST: 'teacher_alice@school.com',
        'HIST.assistant': 'assistant_bob@school.com'
      });
    });

    it('should return empty object when Map is empty', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({}),
        expand: (value, key, columns) => ({
          [columns.main]: value.main,
          [columns.assistant]: value.assistant
        })
      };

      const mapping = new DynamicFieldMapping(config);
      const emptyMap = new Map();
      const result = mapping.dehydrate(emptyMap);

      expect(result).toEqual({});
    });

    it('should warn and return empty object if value is not a Map', () => {
      const mockLogger = { warn: jest.fn(), error: jest.fn(), log: jest.fn() };

      const config = {
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: (key) => ({ main: key }),
        aggregate: (row, key, columns) => ({}),
        expand: (value, key, columns) => ({}),
        logger: mockLogger
      };

      const mapping = new DynamicFieldMapping(config);
      const result = mapping.dehydrate('NOT_A_MAP'); // Invalid

      expect(result).toEqual({});
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Expected Map'));
    });

    it('should handle null/undefined value gracefully', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: (key) => ({ main: key }),
        aggregate: (row, key, columns) => ({}),
        expand: (value, key, columns) => ({})
      };

      const mapping = new DynamicFieldMapping(config);
      const result = mapping.dehydrate(null);

      expect(result).toEqual({});
    });
  });

  describe('getColumnNames', () => {
    it('should return all column names used by the mapping', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key) => ({ main: key, assistant: `${key}.assistant` }),
        aggregate: (row, key, columns) => ({}),
        expand: (value, key, columns) => ({})
      };

      const mapping = new DynamicFieldMapping(config);
      const columnNames = mapping.getColumnNames();

      expect(columnNames).toEqual(['MATH', 'MATH.assistant', 'HIST', 'HIST.assistant']);
    });

    it('should return empty array if schema is empty', () => {
      const config = {
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: (key) => ({ main: key }),
        aggregate: (row, key, columns) => ({}),
        expand: (value, key, columns) => ({})
      };

      const mapping = new DynamicFieldMapping(config);
      const columnNames = mapping.getColumnNames();

      expect(columnNames).toEqual([]);
    });

    it('should return empty array and log error if schemaProvider throws', () => {
      const mockLogger = { warn: jest.fn(), error: jest.fn(), log: jest.fn() };

      const config = {
        propertyName: 'chairs',
        schemaProvider: () => {
          throw new Error('Schema error');
        },
        columnPattern: (key) => ({ main: key }),
        aggregate: (row, key, columns) => ({}),
        expand: (value, key, columns) => ({}),
        logger: mockLogger
      };

      const mapping = new DynamicFieldMapping(config);
      const columnNames = mapping.getColumnNames();

      expect(columnNames).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting column names')
      );
    });
  });

  describe('Round-trip (Hydrate + Dehydrate)', () => {
    it('should preserve data through hydrate-dehydrate cycle', () => {
      const config = {
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
      };

      const mapping = new DynamicFieldMapping(config);

      const originalRow = {
        MATH: 'teacher_john@school.com',
        'MATH.assistant': 'assistant_mary@school.com',
        HIST: 'teacher_alice@school.com',
        'HIST.assistant': 'assistant_bob@school.com'
      };

      // Hydrate
      const mapValue = mapping.hydrate(originalRow);

      // Dehydrate
      const reconstructedRow = mapping.dehydrate(mapValue);

      expect(reconstructedRow).toEqual(originalRow);
    });
  });
});
