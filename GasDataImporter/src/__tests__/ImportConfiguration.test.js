// ===================================================================
// FILE: GasDataImporter/src/__tests__/ImportConfiguration.test.js
// ===================================================================
// Comprehensive test suite for ImportConfiguration
// Using centralized MockFactory
// ===================================================================

import { ImportConfiguration } from '../ImportConfiguration';
import { MockFactory } from '../../../test/fakes';

describe('ImportConfiguration - Comprehensive Test Suite', () => {
  let mockLogger;

  beforeEach(() => {
    mockLogger = MockFactory.createJestLogger();
  });

  // ===================================================================
  // CONSTRUCTOR AND VALIDATION
  // ===================================================================

  describe('Constructor and Validation', () => {
    it('should create instance with valid recipe', () => {
      const recipe = {
        name: 'Test Import',
        source: {
          type: 'SheetById',
          config: { sheetId: 'ABC123' }
        },
        transform: {
          mapping: { Source: 'DEST' }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'ID'
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config).toBeDefined();
      expect(config.name).toBe('Test Import');
    });

    it('should throw error for missing name', () => {
      const recipe = {
        source: { type: 'SheetById', config: {} },
        transform: {},
        load: { targetTable: 'Users' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow();
    });

    it('should throw error for missing source', () => {
      const recipe = {
        name: 'Test',
        transform: {},
        load: { targetTable: 'Users' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow();
    });

    it('should throw error for missing load', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: {} },
        transform: {}
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow();
    });

    it('should throw error for invalid source type', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'Invalid', config: {} },
        transform: {},
        load: { targetTable: 'Users' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow();
    });

    it('should use console as default logger', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe);

      expect(config._logger).toBe(console);
    });
  });

  // ===================================================================
  // SOURCE CONFIGURATION
  // ===================================================================

  describe('Source Configuration', () => {
    it('should validate SheetById source type', () => {
      const recipe = {
        name: 'Test',
        source: {
          type: 'SheetById',
          config: {
            sheetId: 'ABC123',
            range: 'Sheet1!A1:Z',
            hasHeaders: true
          }
        },
        transform: {},
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.source.type).toBe('SheetById');
      expect(config.source.config.sheetId).toBe('ABC123');
    });

    it('should validate Folder source type', () => {
      const recipe = {
        name: 'Test',
        source: {
          type: 'Folder',
          config: {
            folderId: 'FOLDER123',
            range: 'Sheet1!A1:Z',
            hasHeaders: true
          }
        },
        transform: {},
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.source.type).toBe('Folder');
    });
  });

  // ===================================================================
  // TRANSFORM CONFIGURATION
  // ===================================================================

  describe('Transform Configuration', () => {
    it('should handle column mapping', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {
          mapping: {
            'First Name': 'FIRST_NAME',
            'Last Name': 'LAST_NAME',
            Email: 'EMAIL'
          }
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.transform.mapping).toBeDefined();
      expect(config.transform.mapping['First Name']).toBe('FIRST_NAME');
    });

    it('should handle calculated fields', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {
          mapping: {},
          calculated: {
            FULL_NAME: '{{FIRST_NAME}} {{LAST_NAME}}',
            UNIQUE_ID: '{{EMAIL}}-{{ID}}'
          }
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.transform.calculated).toBeDefined();
      expect(config.transform.calculated['FULL_NAME']).toBeDefined();
    });

    it('should handle normalization options', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {
          mapping: {},
          normalization: {
            trim: true,
            lowercaseColumns: ['email'],
            uppercaseColumns: ['code'],
            dateColumns: ['created_at'],
            dateFormat: 'yyyy-MM-dd'
          }
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.transform.normalization).toBeDefined();
      expect(config.transform.normalization.trim).toBe(true);
    });

    it('should handle empty transform configuration', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.transform).toBeDefined();
    });
  });

  // ===================================================================
  // LOAD CONFIGURATION
  // ===================================================================

  describe('Load Configuration', () => {
    it('should validate INSERT_ONLY conflict resolution', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.load.conflictResolution).toBe('INSERT_ONLY');
    });

    it('should validate UPDATE_ONLY conflict resolution', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPDATE_ONLY',
          conflictKey: 'ID'
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.load.conflictResolution).toBe('UPDATE_ONLY');
    });

    it('should validate UPSERT conflict resolution', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'EMAIL'
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.load.conflictResolution).toBe('UPSERT');
      expect(config.load.conflictKey).toBe('EMAIL');
    });

    it('should validate OVERWRITE conflict resolution', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: {
          targetTable: 'Users',
          conflictResolution: 'OVERWRITE',
          conflictKey: 'ID'
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.load.conflictResolution).toBe('OVERWRITE');
    });

    it('should throw error for invalid conflict resolution', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: {
          targetTable: 'Users',
          conflictResolution: 'INVALID'
        }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow();
    });

    it('should handle updateIfNewer configuration', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'ID',
          updateIfNewer: {
            enabled: true,
            timestampColumn: 'UPDATED_AT'
          }
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.load.updateIfNewer).toBeDefined();
      expect(config.load.updateIfNewer.enabled).toBe(true);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle recipe with all optional fields', () => {
      const recipe = {
        name: 'Comprehensive Test',
        source: {
          type: 'SheetById',
          config: {
            sheetId: 'ABC123',
            range: 'Sheet1!A1:Z1000',
            hasHeaders: true,
            tabName: 'Data'
          }
        },
        transform: {
          mapping: { Source: 'DEST' },
          calculated: { CALC: '{{A}} + {{B}}' },
          normalization: {
            trim: true,
            lowercaseColumns: ['email'],
            dateColumns: ['date'],
            dateFormat: 'yyyy-MM-dd'
          }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'ID',
          updateIfNewer: {
            enabled: true,
            timestampColumn: 'UPDATED_AT'
          }
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config).toBeDefined();
      expect(config.name).toBe('Comprehensive Test');
    });

    it('should handle null recipe', () => {
      expect(() => {
        new ImportConfiguration(null, mockLogger);
      }).toThrow();
    });

    it('should handle undefined recipe', () => {
      expect(() => {
        new ImportConfiguration(undefined, mockLogger);
      }).toThrow();
    });

    it('should handle empty object recipe', () => {
      expect(() => {
        new ImportConfiguration({}, mockLogger);
      }).toThrow();
    });

    it('should handle very long recipe name', () => {
      const longName = 'A'.repeat(10000);
      const recipe = {
        name: longName,
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {},
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.name).toBe(longName);
    });

    it('should handle special characters in field names', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {
          mapping: {
            'First Name (Legal)': 'FIRST_NAME',
            'Email [Primary]': 'EMAIL',
            'DOB - Date of Birth': 'DOB'
          }
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config.transform.mapping['First Name (Legal)']).toBe('FIRST_NAME');
    });
  });

  // ===================================================================
  // SOURCE VALIDATION - Missing Coverage Lines
  // ===================================================================

  describe('Source Validation - Missing Coverage', () => {
    it('should throw error when source.config is missing', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById' }, // Missing config
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Source must have a config object');
    });

    it('should throw error when source.config is not an object', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: 'not an object' },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Source must have a config object');
    });

    it('should throw error when Folder source is missing folderId', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'Folder', config: { range: 'A1:Z' } }, // Missing folderId
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Folder source requires config.folderId (string)');
    });

    it('should throw error when Folder source folderId is not a string', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'Folder', config: { folderId: 123 } },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Folder source requires config.folderId (string)');
    });
  });

  // ===================================================================
  // TRANSFORM VALIDATION - Missing Coverage Lines
  // ===================================================================

  describe('Transform Validation - Missing Coverage', () => {
    it('should throw error when transform is not an object', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: 'not an object', // Invalid type
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Transform configuration must be an object');
    });

    it('should throw error when transform.mapping is not an object', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: { mapping: 'not an object' }, // Invalid type
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Transform mapping must be an object');
    });

    it('should throw error when transform.calculated is not an object', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: { calculated: 'not an object' }, // Invalid type (string instead of object)
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Transform calculated must be an object');
    });

    it('should throw error when transform.normalization is not an object', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: { normalization: 'not an object' }, // Invalid type
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Transform normalization must be an object');
    });
  });

  // ===================================================================
  // LOAD VALIDATION - Missing Coverage Lines
  // ===================================================================

  describe('Load Validation - Missing Coverage', () => {
    it('should throw error when load is null', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: null
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Recipe must have a load configuration');
    });

    it('should throw error when load is not an object', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: 'not an object'
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Recipe must have a load configuration');
    });

    it('should throw error when load.targetTable is missing', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: { conflictResolution: 'INSERT_ONLY' } // Missing targetTable
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Load configuration must specify targetTable (string)');
    });

    it('should throw error when load.targetTable is not a string', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: { targetTable: 123, conflictResolution: 'INSERT_ONLY' }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Load configuration must specify targetTable (string)');
    });

    it('should throw error when UPDATE_ONLY is missing conflictKey', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPDATE_ONLY'
          // Missing conflictKey
        }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Conflict resolution strategy "UPDATE_ONLY" requires a conflictKey');
    });

    it('should throw error when OVERWRITE is missing conflictKey', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: {
          targetTable: 'Users',
          conflictResolution: 'OVERWRITE'
          // Missing conflictKey
        }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Conflict resolution strategy "OVERWRITE" requires a conflictKey');
    });

    it('should throw error when load.updateIfNewer is not an object', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY',
          updateIfNewer: 'not an object'
        }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('Load updateIfNewer must be an object');
    });

    it('should throw error when updateIfNewer.enabled but missing timestampColumn', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY',
          updateIfNewer: { enabled: true } // Missing timestampColumn
        }
      };

      expect(() => {
        new ImportConfiguration(recipe, mockLogger);
      }).toThrow('updateIfNewer requires timestampColumn when enabled');
    });

    it('should allow updateIfNewer when enabled with timestampColumn', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY',
          updateIfNewer: {
            enabled: true,
            timestampColumn: 'UPDATED_AT'
          }
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config).toBeDefined();
    });

    it('should allow updateIfNewer when disabled without timestampColumn', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY',
          updateIfNewer: { enabled: false }
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config).toBeDefined();
    });
  });

  // ===================================================================
  // GETTER METHODS - Missing Coverage Lines
  // ===================================================================

  describe('Getter Methods', () => {
    let config;
    let recipe;

    beforeEach(() => {
      recipe = {
        name: 'Test Import',
        source: {
          type: 'SheetById',
          config: { sheetId: 'ABC123', range: 'A1:Z' }
        },
        transform: {
          mapping: { 'Source Col': 'DEST_COL' },
          calculated: { FULL_NAME: '{{FIRST}} {{LAST}}' },
          normalization: { trim: true, dateColumns: ['DATE'] }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'ID'
        }
      };

      config = new ImportConfiguration(recipe, mockLogger);
    });

    it('should get name via getName() method', () => {
      expect(config.getName()).toBe('Test Import');
    });

    it('should get name via getter property', () => {
      expect(config.name).toBe('Test Import');
    });

    it('should get source via getSource() method', () => {
      const source = config.getSource();

      expect(source).toEqual({
        type: 'SheetById',
        config: { sheetId: 'ABC123', range: 'A1:Z' }
      });
    });

    it('should get source via getter property', () => {
      const source = config.source;

      expect(source).toEqual({
        type: 'SheetById',
        config: { sheetId: 'ABC123', range: 'A1:Z' }
      });
    });

    it('should get transform via getTransform() method', () => {
      const transform = config.getTransform();

      expect(transform).toEqual({
        mapping: { 'Source Col': 'DEST_COL' },
        calculated: { FULL_NAME: '{{FIRST}} {{LAST}}' },
        normalization: { trim: true, dateColumns: ['DATE'] }
      });
    });

    it('should get transform via getter property', () => {
      const transform = config.transform;

      expect(transform).toEqual({
        mapping: { 'Source Col': 'DEST_COL' },
        calculated: { FULL_NAME: '{{FIRST}} {{LAST}}' },
        normalization: { trim: true, dateColumns: ['DATE'] }
      });
    });

    it('should return empty object when transform is not provided', () => {
      const minimalRecipe = {
        name: 'Minimal',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const minimalConfig = new ImportConfiguration(minimalRecipe, mockLogger);

      expect(minimalConfig.getTransform()).toEqual({});
      expect(minimalConfig.transform).toEqual({});
    });

    it('should get load via getLoad() method', () => {
      const load = config.getLoad();

      expect(load).toEqual({
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'ID'
      });
    });

    it('should get load via getter property', () => {
      const load = config.load;

      expect(load).toEqual({
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        conflictKey: 'ID'
      });
    });

    it('should get complete recipe via getRecipe() method', () => {
      const retrievedRecipe = config.getRecipe();

      expect(retrievedRecipe).toEqual(recipe);
      expect(retrievedRecipe).toBe(config._recipe); // Same reference
    });

    it('should get configuration summary via getSummary() method', () => {
      const summary = config.getSummary();

      expect(summary).toEqual({
        name: 'Test Import',
        sourceType: 'SheetById',
        targetTable: 'Users',
        conflictResolution: 'UPSERT',
        hasMapping: true,
        hasCalculated: true,
        hasNormalization: true
      });
    });

    it('should get summary with false flags when transform parts are missing', () => {
      const minimalRecipe = {
        name: 'Minimal',
        source: { type: 'Folder', config: { folderId: 'XYZ' } },
        load: { targetTable: 'Orders', conflictResolution: 'INSERT_ONLY' }
      };

      const minimalConfig = new ImportConfiguration(minimalRecipe, mockLogger);
      const summary = minimalConfig.getSummary();

      expect(summary).toEqual({
        name: 'Minimal',
        sourceType: 'Folder',
        targetTable: 'Orders',
        conflictResolution: 'INSERT_ONLY',
        hasMapping: false,
        hasCalculated: false,
        hasNormalization: false
      });
    });

    it('should get summary with mixed transform flags', () => {
      const partialTransformRecipe = {
        name: 'Partial',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        transform: {
          mapping: { A: 'B' }
          // No calculated or normalization
        },
        load: { targetTable: 'Data', conflictResolution: 'INSERT_ONLY' }
      };

      const partialConfig = new ImportConfiguration(partialTransformRecipe, mockLogger);
      const summary = partialConfig.getSummary();

      expect(summary.hasMapping).toBe(true);
      expect(summary.hasCalculated).toBe(false);
      expect(summary.hasNormalization).toBe(false);
    });
  });

  // ===================================================================
  // EDGE CASES AND INTEGRATION
  // ===================================================================

  describe('Edge Cases and Integration', () => {
    it('should handle valid SheetById configuration with all fields', () => {
      const recipe = {
        name: 'Complete Import',
        source: {
          type: 'SheetById',
          config: {
            sheetId: 'ABC123',
            range: 'Sheet1!A1:Z1000',
            hasHeaders: true,
            tabName: 'Data'
          }
        },
        transform: {
          mapping: { 'First Name': 'FIRST_NAME', 'Last Name': 'LAST_NAME' },
          calculated: { FULL_NAME: '{{FIRST_NAME}} {{LAST_NAME}}' },
          normalization: {
            trim: true,
            dateColumns: ['CREATED_AT', 'UPDATED_AT'],
            dateFormat: 'yyyy-MM-dd',
            lowercaseColumns: ['EMAIL'],
            uppercaseColumns: ['CODE']
          }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'EMAIL',
          updateIfNewer: {
            enabled: true,
            timestampColumn: 'UPDATED_AT'
          }
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config).toBeDefined();
      expect(config.getName()).toBe('Complete Import');
      expect(config.getSource().type).toBe('SheetById');
      expect(config.getLoad().conflictResolution).toBe('UPSERT');
    });

    it('should handle valid Folder configuration', () => {
      const recipe = {
        name: 'Folder Import',
        source: {
          type: 'Folder',
          config: {
            folderId: 'FOLDER123',
            range: 'A1:Z',
            hasHeaders: true,
            mergeData: true,
            includeSourceFile: true
          }
        },
        load: {
          targetTable: 'Data',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config).toBeDefined();
      expect(config.getSource().type).toBe('Folder');
      expect(config.getSource().config.folderId).toBe('FOLDER123');
    });

    it('should handle INSERT_ONLY without conflictKey', () => {
      const recipe = {
        name: 'Insert Only',
        source: { type: 'SheetById', config: { sheetId: 'ABC' } },
        load: {
          targetTable: 'Logs',
          conflictResolution: 'INSERT_ONLY'
          // No conflictKey needed for INSERT_ONLY
        }
      };

      const config = new ImportConfiguration(recipe, mockLogger);

      expect(config).toBeDefined();
      expect(config.getLoad().conflictResolution).toBe('INSERT_ONLY');
    });

    it('should validate all conflict resolution strategies', () => {
      const strategies = ['INSERT_ONLY', 'UPDATE_ONLY', 'UPSERT', 'OVERWRITE'];

      strategies.forEach((strategy) => {
        const recipe = {
          name: `Test ${strategy}`,
          source: { type: 'SheetById', config: { sheetId: 'ABC' } },
          load: {
            targetTable: 'Users',
            conflictResolution: strategy,
            ...(strategy !== 'INSERT_ONLY' && { conflictKey: 'ID' })
          }
        };

        const config = new ImportConfiguration(recipe, mockLogger);
        expect(config.getLoad().conflictResolution).toBe(strategy);
      });
    });
  });
});
