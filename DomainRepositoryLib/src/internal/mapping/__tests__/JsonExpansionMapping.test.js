// ===================================================================
// FILE: DomainRepositoryLib/src/mapping/__tests__/JsonExpansionMapping.test.js
// ===================================================================

import { JsonExpansionMapping } from '../JsonExpansionMapping';

describe('JsonExpansionMapping - Comprehensive Test Suite', () => {
  describe('Constructor and Validation', () => {
    it('should create a valid mapping with required config', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      expect(mapping.column).toBe('ROLES');
      expect(mapping.properties).toEqual(['tutor', 'secretary']);
    });

    it('should throw error if column is missing', () => {
      const config = {
        properties: ['tutor', 'secretary']
      };

      expect(() => new JsonExpansionMapping(config)).toThrow(
        'JsonExpansionMapping: column must be a non-empty string'
      );
    });

    it('should throw error if column is not a string', () => {
      const config = {
        column: 123,
        properties: ['tutor']
      };

      expect(() => new JsonExpansionMapping(config)).toThrow(
        'JsonExpansionMapping: column must be a non-empty string'
      );
    });

    it('should throw error if properties is not an array', () => {
      const config = {
        column: 'ROLES',
        properties: 'tutor' // Should be array
      };

      expect(() => new JsonExpansionMapping(config)).toThrow(
        'JsonExpansionMapping: properties must be a non-empty array'
      );
    });

    it('should throw error if properties is empty array', () => {
      const config = {
        column: 'ROLES',
        properties: []
      };

      expect(() => new JsonExpansionMapping(config)).toThrow(
        'JsonExpansionMapping: properties must be a non-empty array'
      );
    });

    it('should throw error if properties contains non-string values', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 123, 'secretary']
      };

      expect(() => new JsonExpansionMapping(config)).toThrow(
        'JsonExpansionMapping: all properties must be strings'
      );
    });
  });

  describe('hydrate - JSON Column to Properties', () => {
    it('should expand JSON string to individual properties', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        id: 'CLASS_1',
        name: '10th Grade A',
        ROLES: '{"tutor": "email@test.com", "secretary": "email2@test.com"}'
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: 'email@test.com',
        secretary: 'email2@test.com'
      });
    });

    it('should handle JSON object (not string)', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        id: 'CLASS_1',
        ROLES: { tutor: 'email@test.com', secretary: 'email2@test.com' }
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: 'email@test.com',
        secretary: 'email2@test.com'
      });
    });

    it('should set properties to null when JSON column is empty', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        id: 'CLASS_1',
        ROLES: null
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: null,
        secretary: null
      });
    });

    it('should set properties to null when JSON column is undefined', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        id: 'CLASS_1'
        // ROLES is undefined
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: null,
        secretary: null
      });
    });

    it('should handle partial JSON data (missing properties)', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary', 'coordinator']
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        ROLES: '{"tutor": "email@test.com"}' // secretary and coordinator missing
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: 'email@test.com',
        secretary: null,
        coordinator: null
      });
    });

    it('should handle extra JSON properties not in config', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor']
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        ROLES: '{"tutor": "email@test.com", "secretary": "email2@test.com", "extra": "value"}'
      };

      const result = mapping.hydrate(row);

      // Only configured properties are extracted
      expect(result).toEqual({
        tutor: 'email@test.com'
      });
      expect(result.secretary).toBeUndefined();
      expect(result.extra).toBeUndefined();
    });

    it('should handle invalid JSON gracefully', () => {
      const mockLogger = { warn: jest.fn(), error: jest.fn(), log: jest.fn() };

      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary'],
        logger: mockLogger
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        ROLES: '{ invalid json }' // Invalid JSON
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: null,
        secretary: null
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to parse JSON'));
    });

    it('should warn on unexpected column type', () => {
      const mockLogger = { warn: jest.fn(), error: jest.fn(), log: jest.fn() };

      const config = {
        column: 'ROLES',
        properties: ['tutor'],
        logger: mockLogger
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        ROLES: 12345 // Number, not JSON string or object
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: null
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Unexpected type'));
    });

    it('should handle empty JSON string', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        ROLES: ''
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: null,
        secretary: null
      });
    });

    it('should handle empty JSON object', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const row = {
        ROLES: '{}'
      };

      const result = mapping.hydrate(row);

      expect(result).toEqual({
        tutor: null,
        secretary: null
      });
    });
  });

  describe('dehydrate - Properties to JSON Column', () => {
    it('should collapse individual properties into JSON string', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const entityData = {
        id: 'CLASS_1',
        name: '10th Grade A',
        tutor: 'email@test.com',
        secretary: 'email2@test.com'
      };

      const result = mapping.dehydrate(entityData);

      expect(result).toEqual({
        ROLES: '{"tutor":"email@test.com","secretary":"email2@test.com"}'
      });
    });

    it('should only include non-null values in JSON', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary', 'coordinator']
      };

      const mapping = new JsonExpansionMapping(config);

      const entityData = {
        tutor: 'email@test.com',
        secretary: null,
        coordinator: undefined
      };

      const result = mapping.dehydrate(entityData);

      // Only tutor should be in JSON
      expect(result).toEqual({
        ROLES: '{"tutor":"email@test.com"}'
      });
    });

    it('should create empty JSON object when all properties are null', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const entityData = {
        tutor: null,
        secretary: null
      };

      const result = mapping.dehydrate(entityData);

      expect(result).toEqual({
        ROLES: '{}'
      });
    });

    it('should create empty JSON object when properties are missing', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const entityData = {
        id: 'CLASS_1',
        name: '10th Grade A'
        // tutor and secretary are missing
      };

      const result = mapping.dehydrate(entityData);

      expect(result).toEqual({
        ROLES: '{}'
      });
    });

    it('should ignore properties not in the configuration', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const entityData = {
        tutor: 'email@test.com',
        secretary: 'email2@test.com',
        coordinator: 'email3@test.com', // Not in config
        extraField: 'value' // Not in config
      };

      const result = mapping.dehydrate(entityData);

      // Only configured properties
      expect(result).toEqual({
        ROLES: '{"tutor":"email@test.com","secretary":"email2@test.com"}'
      });
    });
  });

  describe('Utility Methods', () => {
    it('should return column name via getColumnName', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      expect(mapping.getColumnName()).toBe('ROLES');
    });

    it('should return properties via getProperties', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      expect(mapping.getProperties()).toEqual(['tutor', 'secretary']);
    });

    it('should check if property is managed via managesProperty', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      expect(mapping.managesProperty('tutor')).toBe(true);
      expect(mapping.managesProperty('secretary')).toBe(true);
      expect(mapping.managesProperty('coordinator')).toBe(false);
      expect(mapping.managesProperty('unknownField')).toBe(false);
    });
  });

  describe('Round-trip (Hydrate + Dehydrate)', () => {
    it('should preserve data through hydrate-dehydrate cycle', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary', 'coordinator']
      };

      const mapping = new JsonExpansionMapping(config);

      const originalRow = {
        ROLES:
          '{"tutor":"email@test.com","secretary":"email2@test.com","coordinator":"email3@test.com"}'
      };

      // Hydrate
      const expandedProperties = mapping.hydrate(originalRow);

      expect(expandedProperties).toEqual({
        tutor: 'email@test.com',
        secretary: 'email2@test.com',
        coordinator: 'email3@test.com'
      });

      // Dehydrate
      const reconstructedRow = mapping.dehydrate(expandedProperties);

      // JSON property order might differ, so parse and compare
      expect(JSON.parse(reconstructedRow.ROLES)).toEqual(JSON.parse(originalRow.ROLES));
    });

    it('should handle round-trip with null values', () => {
      const config = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      const mapping = new JsonExpansionMapping(config);

      const originalRow = {
        ROLES: '{"tutor":"email@test.com"}'
      };

      // Hydrate
      const expandedProperties = mapping.hydrate(originalRow);

      expect(expandedProperties).toEqual({
        tutor: 'email@test.com',
        secretary: null
      });

      // Dehydrate (secretary is null, so it won't be in JSON)
      const reconstructedRow = mapping.dehydrate(expandedProperties);

      expect(JSON.parse(reconstructedRow.ROLES)).toEqual({ tutor: 'email@test.com' });
    });
  });
});
