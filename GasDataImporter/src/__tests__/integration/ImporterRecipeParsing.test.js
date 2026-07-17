// ===================================================================
// FILE: GasDataImporter/src/__tests__/integration/ImporterRecipeParsing.test.js
// ===================================================================
// Integration Test 13: Importer-Recipe Parsing
// Verifies that GasDataImporter correctly parses JSON recipes and initializes components
// ===================================================================

import { ImportEngine } from '../../ImportEngine.js';
import { ImportRecipeValidator } from '../../ImportRecipeValidator.js';
import { ImportConfiguration } from '../../ImportConfiguration.js';
import { MockFactory } from '../../../../test/fakes/MockFactory.js';

/**
 * Test Scenario: Importer-Recipe Parsing
 *
 * Layers Involved:
 * - Application: GasDataImporter (ImportEngine, ImportConfiguration)
 * - Extract: GasDataImporter (SourceStrategyFactory, SourceStrategy implementations)
 *
 * Objective:
 * Verify that when provided with a JSON import recipe, the ImportEngine
 * correctly parses it, validates the structure, and initializes the
 * appropriate SourceStrategy, Transformer, and Loader components.
 */

describe('Integration Test 13: Importer-Recipe Parsing', () => {
  let logger;
  let driveService;
  let spreadsheetService;
  let databaseService;
  let engine;
  let validator;

  beforeEach(() => {
    logger = MockFactory.createJestLogger();
    driveService = MockFactory.createJestDriveService();
    spreadsheetService = MockFactory.createJestSpreadsheetService();
    databaseService = MockFactory.createJestDatabase({ logger });

    engine = new ImportEngine(logger, driveService, spreadsheetService, databaseService);
    validator = new ImportRecipeValidator(engine);
  });

  describe('Recipe Structure Validation', () => {
    test('should parse valid JSON recipe', () => {
      const recipe = {
        name: 'Valid Recipe',
        source: {
          type: 'SheetById',
          config: { sheetId: 'abc123', hasHeaders: true }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const result = validator.validateRecipe(recipe);
      expect(result.valid).toBe(true);
      expect(result.summary.name).toBe('Valid Recipe');
    });

    test('should validate required recipe fields', () => {
      const recipeMissingSource = {
        name: 'Invalid Recipe',
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const result = validator.validateRecipe(recipeMissingSource);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('source');
    });

    test('should validate source type', () => {
      const recipeInvalidSource = {
        name: 'Invalid Source Recipe',
        source: {
          type: 'UnknownType',
          config: {}
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const result = validator.validateRecipe(recipeInvalidSource);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid source type');
    });
  });

  describe('SourceStrategy Initialization', () => {
    test('should create SheetByIdStrategy for SheetById source type', () => {
      const recipe = {
        name: 'Sheet Recipe',
        source: {
          type: 'SheetById',
          config: { sheetId: 'abc123', hasHeaders: true }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const config = new ImportConfiguration(recipe, logger);
      const strategy = engine._sourceFactory.createStrategy(config.getSource().type);

      expect(strategy.constructor.name).toBe('SheetByIdStrategy');
    });

    test('should create FolderStrategy for Folder source type', () => {
      const recipe = {
        name: 'Folder Recipe',
        source: {
          type: 'Folder',
          config: { folderId: 'folder123' }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const config = new ImportConfiguration(recipe, logger);
      const strategy = engine._sourceFactory.createStrategy(config.getSource().type);

      expect(strategy.constructor.name).toBe('FolderStrategy');
    });

    test('should configure strategy with correct parameters', () => {
      const recipe = {
        name: 'Param Recipe',
        source: {
          type: 'SheetById',
          config: { sheetId: 'abc123', hasHeaders: true, range: 'A1:B10' }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const config = new ImportConfiguration(recipe, logger);
      const sourceConfig = config.getSource().config;

      expect(sourceConfig.sheetId).toBe('abc123');
      expect(sourceConfig.range).toBe('A1:B10');
      expect(sourceConfig.hasHeaders).toBe(true);
    });
  });

  describe('Transformer Initialization', () => {
    test('should initialize transformer and be able to transform empty data', () => {
      const recipe = {
        name: 'Transform Recipe',
        source: {
          type: 'SheetById',
          config: { sheetId: 'abc123' }
        },
        transform: {
          mapping: { OldCol: 'NewCol' },
          calculated: { Full: '{{First}} {{Last}}' }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const config = new ImportConfiguration(recipe, logger);
      const transformer = engine._transformer;

      expect(transformer).toBeDefined();
      // Test that it can handle the config via transform call
      const result = transformer.transform(
        [{ OldCol: 'Val', First: 'A', Last: 'B' }],
        config.getTransform()
      );
      expect(result[0].NewCol).toBe('Val');
      expect(result[0].Full).toBe('A B');
    });
  });

  describe('Loader Initialization', () => {
    test('should initialize loader and expose it', () => {
      const recipe = {
        name: 'Load Recipe',
        source: {
          type: 'SheetById',
          config: { sheetId: 'abc123' }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'id'
        }
      };

      const config = new ImportConfiguration(recipe, logger);
      const loader = engine._loader;

      expect(loader).toBeDefined();
      // We don't call load() here as it requires more complex DB mocking,
      // but we verified the component exists in the engine.
    });
  });

  describe('Full Recipe Parsing', () => {
    test('should parse complete recipe and initialize all components', () => {
      const recipe = {
        name: 'Full Pipeline Recipe',
        source: {
          type: 'SheetById',
          config: { sheetId: 'abc123' }
        },
        transform: {
          mapping: { source_id: 'id' }
        },
        load: {
          targetTable: 'Entities',
          conflictResolution: 'INSERT_ONLY'
        }
      };

      const config = new ImportConfiguration(recipe, logger);

      const strategy = engine._sourceFactory.createStrategy(config.getSource().type);
      const transformer = engine._transformer;
      const loader = engine._loader;

      expect(strategy).toBeDefined();
      expect(transformer).toBeDefined();
      expect(loader).toBeDefined();

      expect(config.getName()).toBe('Full Pipeline Recipe');
    });
  });
});
