type MappingRow = Record<string, string | null | undefined>;

// ===================================================================
// FILE: DomainRepositoryLib/src/mapping/__tests__/MappingConfiguration.test.js
// ===================================================================

import { MappingConfiguration } from '../MappingConfiguration.js';
import { DynamicFieldMapping } from '../DynamicFieldMapping.js';
import { JsonExpansionMapping } from '../JsonExpansionMapping.js';

describe('MappingConfiguration - Comprehensive Test Suite', () => {
  describe('Constructor', () => {
    it('should create an empty configuration', () => {
      const config = new MappingConfiguration();

      expect(config.hasDynamicFieldMappings()).toBe(false);
      expect(config.hasJsonExpansionMappings()).toBe(false);
      expect(config.getAllDynamicFieldMappings()).toEqual([]);
      expect(config.getAllJsonExpansionMappings()).toEqual([]);
    });
  });

  describe('Dynamic Field Mappings', () => {
    it('should add dynamic field mapping from config object', () => {
      const config = new MappingConfiguration();

      const mappingConfig = {
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (row: MappingRow, key: string, columns: Record<string, string>) => ({
          main: row[columns.main]
        }),
        expand: (value: MappingRow, key: string, columns: Record<string, string>) => ({
          [columns.main]: value.main
        })
      };

      config.addDynamicFieldMapping(mappingConfig);

      expect(config.hasDynamicFieldMappings()).toBe(true);
      expect(config.getAllDynamicFieldMappings().length).toBe(1);

      const mapping = config.getDynamicFieldMapping('chairs');
      expect(mapping).toBeInstanceOf(DynamicFieldMapping);
      expect(mapping!.propertyName).toBe('chairs');
    });

    it('should add dynamic field mapping from DynamicFieldMapping instance', () => {
      const config = new MappingConfiguration();

      const mapping = new DynamicFieldMapping({
        propertyName: 'chairs',
        schemaProvider: () => ['MATH'],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (_row: MappingRow, _key: string, _columns: Record<string, string>) => ({}),
        expand: (_value: MappingRow, _key: string, _columns: Record<string, string>) => ({})
      });

      config.addDynamicFieldMapping(mapping);

      expect(config.hasDynamicFieldMappings()).toBe(true);
      expect(config.getDynamicFieldMapping('chairs')).toBe(mapping);
    });

    it('should support method chaining', () => {
      const config = new MappingConfiguration();

      const result = config.addDynamicFieldMapping({
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (_row: MappingRow, _key: string, _columns: Record<string, string>) => ({}),
        expand: (_value: MappingRow, _key: string, _columns: Record<string, string>) => ({})
      });

      expect(result).toBe(config);
    });

    it('should get dynamic field mapping by property name', () => {
      const config = new MappingConfiguration();

      config.addDynamicFieldMapping({
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (_row: MappingRow, _key: string, _columns: Record<string, string>) => ({}),
        expand: (_value: MappingRow, _key: string, _columns: Record<string, string>) => ({})
      });

      const mapping = config.getDynamicFieldMapping('chairs');
      expect(mapping).toBeInstanceOf(DynamicFieldMapping);
      expect(mapping!.propertyName).toBe('chairs');
    });

    it('should return null for non-existent dynamic field mapping', () => {
      const config = new MappingConfiguration();

      const mapping = config.getDynamicFieldMapping('nonExistent');
      expect(mapping).toBeNull();
    });

    it('should get all dynamic field mappings', () => {
      const config = new MappingConfiguration();

      config.addDynamicFieldMapping({
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (_row: MappingRow, _key: string, _columns: Record<string, string>) => ({}),
        expand: (_value: MappingRow, _key: string, _columns: Record<string, string>) => ({})
      });

      config.addDynamicFieldMapping({
        propertyName: 'labs',
        schemaProvider: () => [],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (_row: MappingRow, _key: string, _columns: Record<string, string>) => ({}),
        expand: (_value: MappingRow, _key: string, _columns: Record<string, string>) => ({})
      });

      const mappings = config.getAllDynamicFieldMappings();
      expect(mappings.length).toBe(2);
      expect(mappings[0].propertyName).toBe('chairs');
      expect(mappings[1].propertyName).toBe('labs');
    });
  });

  describe('JSON Expansion Mappings', () => {
    it('should add JSON expansion mapping from config object', () => {
      const config = new MappingConfiguration();

      const mappingConfig = {
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      };

      config.addJsonExpansionMapping(mappingConfig);

      expect(config.hasJsonExpansionMappings()).toBe(true);
      expect(config.getAllJsonExpansionMappings().length).toBe(1);

      const mapping = config.getJsonExpansionMapping('ROLES');
      expect(mapping).toBeInstanceOf(JsonExpansionMapping);
      expect(mapping!.column).toBe('ROLES');
    });

    it('should add JSON expansion mapping from JsonExpansionMapping instance', () => {
      const config = new MappingConfiguration();

      const mapping = new JsonExpansionMapping({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      config.addJsonExpansionMapping(mapping);

      expect(config.hasJsonExpansionMappings()).toBe(true);
      expect(config.getJsonExpansionMapping('ROLES')).toBe(mapping);
    });

    it('should support method chaining', () => {
      const config = new MappingConfiguration();

      const result = config.addJsonExpansionMapping({
        column: 'ROLES',
        properties: ['tutor']
      });

      expect(result).toBe(config);
    });

    it('should get JSON expansion mapping by column name', () => {
      const config = new MappingConfiguration();

      config.addJsonExpansionMapping({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      const mapping = config.getJsonExpansionMapping('ROLES');
      expect(mapping).toBeInstanceOf(JsonExpansionMapping);
      expect(mapping!.column).toBe('ROLES');
    });

    it('should return null for non-existent JSON expansion mapping', () => {
      const config = new MappingConfiguration();

      const mapping = config.getJsonExpansionMapping('nonExistent');
      expect(mapping).toBeNull();
    });

    it('should get all JSON expansion mappings', () => {
      const config = new MappingConfiguration();

      config.addJsonExpansionMapping({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      config.addJsonExpansionMapping({
        column: 'METADATA',
        properties: ['created_by', 'updated_by']
      });

      const mappings = config.getAllJsonExpansionMappings();
      expect(mappings.length).toBe(2);
      expect(mappings[0].column).toBe('ROLES');
      expect(mappings[1].column).toBe('METADATA');
    });
  });

  describe('Find JSON Expansion Mapping for Property', () => {
    it('should find mapping that manages a given property', () => {
      const config = new MappingConfiguration();

      config.addJsonExpansionMapping({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      config.addJsonExpansionMapping({
        column: 'METADATA',
        properties: ['created_by', 'updated_by']
      });

      const tutorMapping = config.findJsonExpansionMappingForProperty('tutor');
      expect(tutorMapping).toBeInstanceOf(JsonExpansionMapping);
      expect(tutorMapping!.column).toBe('ROLES');

      const createdByMapping = config.findJsonExpansionMappingForProperty('created_by');
      expect(createdByMapping).toBeInstanceOf(JsonExpansionMapping);
      expect(createdByMapping!.column).toBe('METADATA');
    });

    it('should return null for property not managed by any mapping', () => {
      const config = new MappingConfiguration();

      config.addJsonExpansionMapping({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      const mapping = config.findJsonExpansionMappingForProperty('unknownProperty');
      expect(mapping).toBeNull();
    });
  });

  describe('Clear Mappings', () => {
    it('should clear all mappings', () => {
      const config = new MappingConfiguration();

      config.addDynamicFieldMapping({
        propertyName: 'chairs',
        schemaProvider: () => [],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (_row: MappingRow, _key: string, _columns: Record<string, string>) => ({}),
        expand: (_value: MappingRow, _key: string, _columns: Record<string, string>) => ({})
      });

      config.addJsonExpansionMapping({
        column: 'ROLES',
        properties: ['tutor']
      });

      expect(config.hasDynamicFieldMappings()).toBe(true);
      expect(config.hasJsonExpansionMappings()).toBe(true);

      config.clear();

      expect(config.hasDynamicFieldMappings()).toBe(false);
      expect(config.hasJsonExpansionMappings()).toBe(false);
      expect(config.getAllDynamicFieldMappings()).toEqual([]);
      expect(config.getAllJsonExpansionMappings()).toEqual([]);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple dynamic and JSON mappings together', () => {
      const config = new MappingConfiguration();

      // Add multiple dynamic field mappings
      config.addDynamicFieldMapping({
        propertyName: 'chairs',
        schemaProvider: () => ['MATH', 'HIST'],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (_row: MappingRow, _key: string, _columns: Record<string, string>) => ({}),
        expand: (_value: MappingRow, _key: string, _columns: Record<string, string>) => ({})
      });

      config.addDynamicFieldMapping({
        propertyName: 'labs',
        schemaProvider: () => ['SCI', 'CHEM'],
        columnPattern: (key: string) => ({ main: key }),
        aggregate: (_row: MappingRow, _key: string, _columns: Record<string, string>) => ({}),
        expand: (_value: MappingRow, _key: string, _columns: Record<string, string>) => ({})
      });

      // Add multiple JSON expansion mappings
      config.addJsonExpansionMapping({
        column: 'ROLES',
        properties: ['tutor', 'secretary']
      });

      config.addJsonExpansionMapping({
        column: 'METADATA',
        properties: ['created_by', 'updated_by']
      });

      expect(config.hasDynamicFieldMappings()).toBe(true);
      expect(config.hasJsonExpansionMappings()).toBe(true);
      expect(config.getAllDynamicFieldMappings().length).toBe(2);
      expect(config.getAllJsonExpansionMappings().length).toBe(2);

      // Verify individual lookups
      expect(config.getDynamicFieldMapping('chairs')).toBeTruthy();
      expect(config.getDynamicFieldMapping('labs')).toBeTruthy();
      expect(config.getJsonExpansionMapping('ROLES')).toBeTruthy();
      expect(config.getJsonExpansionMapping('METADATA')).toBeTruthy();
    });
  });
});
