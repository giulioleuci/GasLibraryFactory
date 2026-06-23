/**
 * @fileoverview Tests for GasDataImporter error classes
 * @author GasLibraryFactory
 */

import { ImportError } from '../ImportError.js';
import { LoadError } from '../LoadError.js';
import { SourceError } from '../SourceError.js';
import { TransformError } from '../TransformError.js';
import { ConfigurationError } from '../ConfigurationError.js';

describe('GasDataImporter Error Classes - Comprehensive Test Suite', () => {
  // ===================================================================
  // ImportError - Base Error Class
  // ===================================================================
  describe('ImportError - Base Class', () => {
    describe('Constructor', () => {
      it('should create instance with message only', () => {
        const error = new ImportError('Test error');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ImportError);
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('ImportError');
        expect(error.code).toBe('IMPORT_ERROR'); // default
        expect(error.context).toEqual({});
        expect(error.timestamp).toBeDefined();
      });

      it('should create instance with custom code', () => {
        const error = new ImportError('Test error', 'CUSTOM_CODE');
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('CUSTOM_CODE');
        expect(error.context).toEqual({});
      });

      it('should create instance with custom context', () => {
        const context = { operation: 'import', table: 'Users' };
        const error = new ImportError('Test error', 'CUSTOM_CODE', context);
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('CUSTOM_CODE');
        expect(error.context).toEqual(context);
      });

      it('should have timestamp in ISO format', () => {
        const error = new ImportError('Test');
        const timestamp = new Date(error.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.toISOString()).toBe(error.timestamp);
      });

      it('should have stack trace', () => {
        const error = new ImportError('Test');
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('ImportError');
      });
    });

    describe('Prototype Chain', () => {
      it('should be catchable as Error', () => {
        expect(() => {
          throw new ImportError('Test');
        }).toThrow(Error);
      });

      it('should be catchable as ImportError', () => {
        expect(() => {
          throw new ImportError('Test');
        }).toThrow(ImportError);
      });

      it('should be distinguishable from generic Error', () => {
        const importError = new ImportError('Import failed');
        const genericError = new Error('Generic failed');
        expect(importError instanceof ImportError).toBe(true);
        expect(genericError instanceof ImportError).toBe(false);
      });
    });

    describe('toJSON() Method', () => {
      it('should return complete JSON representation', () => {
        const context = { table: 'Users', record: { id: 123 } };
        const error = new ImportError('Failed to import', 'IMPORT_FAILED', context);
        const json = error.toJSON();

        expect(json).toHaveProperty('name', 'ImportError');
        expect(json).toHaveProperty('message', 'Failed to import');
        expect(json).toHaveProperty('code', 'IMPORT_FAILED');
        expect(json).toHaveProperty('context', context);
        expect(json).toHaveProperty('timestamp');
        expect(json).toHaveProperty('stack');
      });

      it('should return valid JSON that can be serialized', () => {
        const error = new ImportError('Test', 'CODE', { key: 'value' });
        const json = error.toJSON();
        const serialized = JSON.stringify(json);
        const deserialized = JSON.parse(serialized);

        expect(deserialized.name).toBe('ImportError');
        expect(deserialized.message).toBe('Test');
        expect(deserialized.code).toBe('CODE');
        expect(deserialized.context).toEqual({ key: 'value' });
      });
    });

    describe('toString() Method', () => {
      it('should return formatted string', () => {
        const error = new ImportError('Failed to import', 'IMPORT_FAILED');
        expect(error.toString()).toBe('[ImportError] IMPORT_FAILED: Failed to import');
      });

      it('should include default code in string', () => {
        const error = new ImportError('Test error');
        expect(error.toString()).toBe('[ImportError] IMPORT_ERROR: Test error');
      });

      it('should handle special characters in message', () => {
        const error = new ImportError('Error: "Test" <failed>', 'CODE');
        expect(error.toString()).toBe('[ImportError] CODE: Error: "Test" <failed>');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string message', () => {
        const error = new ImportError('');
        expect(error.message).toBe('');
        expect(error.toString()).toBe('[ImportError] IMPORT_ERROR: ');
      });

      it('should handle very long message', () => {
        const longMessage = 'A'.repeat(10000);
        const error = new ImportError(longMessage);
        expect(error.message).toBe(longMessage);
        expect(error.message.length).toBe(10000);
      });

      it('should handle null context gracefully', () => {
        const error = new ImportError('Test', 'CODE', null);
        expect(error.context).toBeNull();
      });

      it('should handle undefined context (uses default empty object)', () => {
        const error = new ImportError('Test', 'CODE', undefined);
        expect(error.context).toEqual({}); // Default value from constructor
      });

      it('should handle complex nested context', () => {
        const context = {
          operation: 'import',
          nested: {
            deep: {
              value: 123,
              array: [1, 2, 3]
            }
          }
        };
        const error = new ImportError('Test', 'CODE', context);
        expect(error.context).toEqual(context);
      });
    });
  });

  // ===================================================================
  // LoadError - Load Phase Errors
  // ===================================================================
  describe('LoadError - Load Phase Errors', () => {
    describe('Constructor', () => {
      it('should create instance with message only', () => {
        const error = new LoadError('Load failed');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ImportError);
        expect(error).toBeInstanceOf(LoadError);
        expect(error.message).toBe('Load failed');
        expect(error.name).toBe('LoadError');
        expect(error.code).toBe('LOAD_ERROR'); // default
      });

      it('should create instance with custom code', () => {
        const error = new LoadError('Conflict detected', 'CONFLICT_ERROR');
        expect(error.code).toBe('CONFLICT_ERROR');
        expect(error.name).toBe('LoadError');
      });

      it('should accept context with load-specific fields', () => {
        const context = {
          targetTable: 'Users',
          conflictKey: 'email',
          record: { email: 'test@example.com' }
        };
        const error = new LoadError('Duplicate record', 'DUPLICATE', context);
        expect(error.context).toEqual(context);
      });
    });

    describe('Inheritance', () => {
      it('should inherit from ImportError', () => {
        const error = new LoadError('Test');
        expect(error instanceof ImportError).toBe(true);
        expect(error instanceof Error).toBe(true);
      });

      it('should have toJSON method from ImportError', () => {
        const error = new LoadError('Test', 'CODE', { table: 'Users' });
        const json = error.toJSON();
        expect(json.name).toBe('LoadError');
        expect(json.code).toBe('CODE');
        expect(json.context).toEqual({ table: 'Users' });
      });

      it('should have toString method from ImportError', () => {
        const error = new LoadError('Failed to load', 'LOAD_FAILED');
        expect(error.toString()).toBe('[LoadError] LOAD_FAILED: Failed to load');
      });
    });

    describe('Error Scenarios', () => {
      it('should be catchable in try-catch', () => {
        try {
          throw new LoadError('Database error');
        } catch (e) {
          expect(e).toBeInstanceOf(LoadError);
          expect(e.message).toBe('Database error');
        }
      });

      it('should distinguish from other error types', () => {
        const loadError = new LoadError('Load failed');
        const sourceError = new SourceError('Source failed');
        expect(loadError instanceof LoadError).toBe(true);
        expect(sourceError instanceof LoadError).toBe(false);
      });
    });
  });

  // ===================================================================
  // SourceError - Extract Phase Errors
  // ===================================================================
  describe('SourceError - Extract Phase Errors', () => {
    describe('Constructor', () => {
      it('should create instance with message only', () => {
        const error = new SourceError('Source extraction failed');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ImportError);
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toBe('Source extraction failed');
        expect(error.name).toBe('SourceError');
        expect(error.code).toBe('SOURCE_ERROR'); // default
      });

      it('should create instance with custom code', () => {
        const error = new SourceError('Sheet not found', 'SHEET_NOT_FOUND');
        expect(error.code).toBe('SHEET_NOT_FOUND');
        expect(error.name).toBe('SourceError');
      });

      it('should accept context with source-specific fields', () => {
        const context = {
          sourceType: 'SheetById',
          sourceConfig: { sheetId: 'abc123', range: 'A1:Z' }
        };
        const error = new SourceError('Invalid range', 'INVALID_RANGE', context);
        expect(error.context).toEqual(context);
      });
    });

    describe('Inheritance', () => {
      it('should inherit from ImportError', () => {
        const error = new SourceError('Test');
        expect(error instanceof ImportError).toBe(true);
        expect(error instanceof Error).toBe(true);
      });

      it('should have toJSON method from ImportError', () => {
        const error = new SourceError('Test', 'CODE', { sourceType: 'Folder' });
        const json = error.toJSON();
        expect(json.name).toBe('SourceError');
        expect(json.code).toBe('CODE');
        expect(json.context).toEqual({ sourceType: 'Folder' });
      });

      it('should have toString method from ImportError', () => {
        const error = new SourceError('Failed to extract', 'EXTRACT_FAILED');
        expect(error.toString()).toBe('[SourceError] EXTRACT_FAILED: Failed to extract');
      });
    });

    describe('Error Scenarios', () => {
      it('should be catchable in try-catch', () => {
        try {
          throw new SourceError('File not found');
        } catch (e) {
          expect(e).toBeInstanceOf(SourceError);
          expect(e.message).toBe('File not found');
        }
      });

      it('should distinguish from other error types', () => {
        const sourceError = new SourceError('Source failed');
        const loadError = new LoadError('Load failed');
        expect(sourceError instanceof SourceError).toBe(true);
        expect(loadError instanceof SourceError).toBe(false);
      });
    });
  });

  // ===================================================================
  // TransformError - Transform Phase Errors
  // ===================================================================
  describe('TransformError - Transform Phase Errors', () => {
    describe('Constructor', () => {
      it('should create instance with message only', () => {
        const error = new TransformError('Transform failed');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ImportError);
        expect(error).toBeInstanceOf(TransformError);
        expect(error.message).toBe('Transform failed');
        expect(error.name).toBe('TransformError');
        expect(error.code).toBe('TRANSFORM_ERROR'); // default
      });

      it('should create instance with custom code', () => {
        const error = new TransformError('Mapping error', 'MAPPING_ERROR');
        expect(error.code).toBe('MAPPING_ERROR');
        expect(error.name).toBe('TransformError');
      });

      it('should accept context with transform-specific fields', () => {
        const context = {
          sourceColumn: 'first_name',
          targetColumn: 'FIRST_NAME',
          value: 'John',
          row: 5
        };
        const error = new TransformError('Invalid value', 'INVALID_VALUE', context);
        expect(error.context).toEqual(context);
      });
    });

    describe('Inheritance', () => {
      it('should inherit from ImportError', () => {
        const error = new TransformError('Test');
        expect(error instanceof ImportError).toBe(true);
        expect(error instanceof Error).toBe(true);
      });

      it('should have toJSON method from ImportError', () => {
        const error = new TransformError('Test', 'CODE', { column: 'email' });
        const json = error.toJSON();
        expect(json.name).toBe('TransformError');
        expect(json.code).toBe('CODE');
        expect(json.context).toEqual({ column: 'email' });
      });

      it('should have toString method from ImportError', () => {
        const error = new TransformError('Failed to transform', 'TRANSFORM_FAILED');
        expect(error.toString()).toBe('[TransformError] TRANSFORM_FAILED: Failed to transform');
      });
    });
  });

  // ===================================================================
  // ConfigurationError - Configuration Errors
  // ===================================================================
  describe('ConfigurationError - Configuration Errors', () => {
    describe('Constructor', () => {
      it('should create instance with message only', () => {
        const error = new ConfigurationError('Invalid configuration');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ImportError);
        expect(error).toBeInstanceOf(ConfigurationError);
        expect(error.message).toBe('Invalid configuration');
        expect(error.name).toBe('ConfigurationError');
        expect(error.code).toBe('CONFIGURATION_ERROR'); // default
      });

      it('should create instance with custom code', () => {
        const error = new ConfigurationError('Missing field', 'MISSING_FIELD');
        expect(error.code).toBe('MISSING_FIELD');
        expect(error.name).toBe('ConfigurationError');
      });

      it('should accept context with config-specific fields', () => {
        const context = {
          field: 'source.type',
          expected: 'string',
          received: 'undefined'
        };
        const error = new ConfigurationError('Invalid type', 'INVALID_TYPE', context);
        expect(error.context).toEqual(context);
      });
    });

    describe('Inheritance', () => {
      it('should inherit from ImportError', () => {
        const error = new ConfigurationError('Test');
        expect(error instanceof ImportError).toBe(true);
        expect(error instanceof Error).toBe(true);
      });

      it('should have toJSON method from ImportError', () => {
        const error = new ConfigurationError('Test', 'CODE', { field: 'targetTable' });
        const json = error.toJSON();
        expect(json.name).toBe('ConfigurationError');
        expect(json.code).toBe('CODE');
        expect(json.context).toEqual({ field: 'targetTable' });
      });

      it('should have toString method from ImportError', () => {
        const error = new ConfigurationError('Invalid config', 'CONFIG_INVALID');
        expect(error.toString()).toBe('[ConfigurationError] CONFIG_INVALID: Invalid config');
      });
    });
  });

  // ===================================================================
  // Cross-Error Tests
  // ===================================================================
  describe('Cross-Error Behavior', () => {
    it('should differentiate between all error types', () => {
      const importError = new ImportError('Import');
      const loadError = new LoadError('Load');
      const sourceError = new SourceError('Source');
      const transformError = new TransformError('Transform');
      const configError = new ConfigurationError('Config');

      // All are ImportErrors
      expect(importError instanceof ImportError).toBe(true);
      expect(loadError instanceof ImportError).toBe(true);
      expect(sourceError instanceof ImportError).toBe(true);
      expect(transformError instanceof ImportError).toBe(true);
      expect(configError instanceof ImportError).toBe(true);

      // But each has unique type
      expect(loadError instanceof LoadError).toBe(true);
      expect(loadError instanceof SourceError).toBe(false);
      expect(sourceError instanceof SourceError).toBe(true);
      expect(sourceError instanceof TransformError).toBe(false);
      expect(transformError instanceof TransformError).toBe(true);
      expect(transformError instanceof ConfigurationError).toBe(false);
    });

    it('should have different names for each error type', () => {
      const errors = [
        new ImportError('Test'),
        new LoadError('Test'),
        new SourceError('Test'),
        new TransformError('Test'),
        new ConfigurationError('Test')
      ];

      const names = errors.map((e) => e.name);
      expect(names).toEqual([
        'ImportError',
        'LoadError',
        'SourceError',
        'TransformError',
        'ConfigurationError'
      ]);
    });

    it('should all serialize to JSON correctly', () => {
      const errors = [
        new LoadError('Load', 'L1', { table: 'T1' }),
        new SourceError('Source', 'S1', { type: 'T2' }),
        new TransformError('Transform', 'T1', { col: 'C1' }),
        new ConfigurationError('Config', 'C1', { field: 'F1' })
      ];

      errors.forEach((error) => {
        const json = error.toJSON();
        expect(json).toHaveProperty('name');
        expect(json).toHaveProperty('message');
        expect(json).toHaveProperty('code');
        expect(json).toHaveProperty('context');
        expect(json).toHaveProperty('timestamp');
        expect(json).toHaveProperty('stack');
      });
    });
  });
});
