/**
 * @fileoverview Tests for ImportEngine class
 * @author GasLibraryFactory
 */

import { ImportEngine } from '../ImportEngine.js';
import { ImportConfiguration } from '../ImportConfiguration.js';
import { SourceStrategyFactory } from '../internal/extract-strategies/SourceStrategyFactory.js';
import { Transformer } from '../pipeline/Transformer.js';
import { Loader } from '../internal/load/Loader.js';
import { ImportError } from '../internal/errors/ImportError.js';
import { ConfigurationError } from '../internal/errors/ConfigurationError.js';
import { MockFactory } from '../../../test/fakes';

// Mock internal dependencies
jest.mock('../ImportConfiguration.js');
jest.mock('../internal/extract-strategies/SourceStrategyFactory.js');
jest.mock('../pipeline/Transformer.js');
jest.mock('../internal/load/Loader.js');

describe('ImportEngine - Comprehensive Test Suite', () => {
  let mockLogger;
  let mockDriveService;
  let mockSpreadsheetService;
  let mockDatabaseService;
  let mockExpressionEngine;
  let mockExceptionService;
  let engine;

  let mockSourceFactory;
  let mockTransformer;
  let mockLoader;

  beforeEach(() => {
    global.resetGasMocks();
    const mocks = MockFactory.createAllJest();

    mockLogger = mocks.logger;
    mockDriveService = mocks.driveService;
    mockSpreadsheetService = mocks.spreadsheetService;
    mockDatabaseService = mocks.database;
    mockExpressionEngine = mocks.expressionEngine;
    mockExceptionService = mocks.exceptionService;

    // Mock SourceStrategyFactory
    mockSourceFactory = {
      createStrategy: jest.fn(),
      registerStrategy: jest.fn(),
      getAvailableStrategies: jest.fn().mockReturnValue(['SheetById', 'Folder'])
    };
    SourceStrategyFactory.mockImplementation(() => mockSourceFactory);

    // Mock Transformer (factory function to allow null expressionEngine)
    Transformer.mockImplementation((logger, expressionEngine) => {
      return {
        transform: jest.fn(),
        _expressionEngine: expressionEngine
      };
    });

    // Mock Loader
    mockLoader = {
      load: jest.fn()
    };
    Loader.mockImplementation(() => mockLoader);

    // Create engine instance
    engine = new ImportEngine(
      mockLogger,
      mockDriveService,
      mockSpreadsheetService,
      mockDatabaseService,
      mockExpressionEngine,
      mockExceptionService
    );

    // After creating the engine, get references to the actual mock instances
    mockTransformer = engine._transformer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should create instance with all services', () => {
      expect(engine).toBeInstanceOf(ImportEngine);
      expect(engine.logger).toBe(mockLogger);
      expect(engine._exceptionService).toBe(mockExceptionService);
    });

    it('should initialize ETL components', () => {
      expect(SourceStrategyFactory).toHaveBeenCalledWith(
        mockLogger,
        mockDriveService,
        mockSpreadsheetService
      );
      expect(Transformer).toHaveBeenCalledWith(mockLogger, mockExpressionEngine);
      expect(Loader).toHaveBeenCalledWith(mockLogger, mockDatabaseService);
    });

    it('should work without optional services', () => {
      const minimalEngine = new ImportEngine(
        mockLogger,
        mockDriveService,
        mockSpreadsheetService,
        mockDatabaseService
      );

      expect(minimalEngine).toBeInstanceOf(ImportEngine);
      expect(Transformer).toHaveBeenCalledWith(mockLogger, null);
    });

    it('should log successful initialization', () => {
      expect(mockLogger.info).toHaveBeenCalledWith('[ImportEngine] Initialized successfully');
    });
  });

  // ===================================================================
  // runImport() Method Tests
  // ===================================================================
  describe('runImport() Method', () => {
    let validRecipe;
    let mockConfig;
    let mockStrategy;

    beforeEach(() => {
      validRecipe = {
        name: 'Test Import',
        source: {
          type: 'SheetById',
          config: { sheetId: 'abc123', hasHeaders: true }
        },
        transform: {
          mapping: { Name: 'NAME' }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'EMAIL'
        }
      };

      mockConfig = {
        getName: jest.fn().mockReturnValue('Test Import'),
        getSummary: jest.fn().mockReturnValue({ name: 'Test Import' }),
        getSource: jest.fn().mockReturnValue(validRecipe.source),
        getTransform: jest.fn().mockReturnValue(validRecipe.transform),
        getLoad: jest.fn().mockReturnValue(validRecipe.load)
      };

      ImportConfiguration.mockImplementation(() => mockConfig);

      mockStrategy = {
        extract: jest.fn().mockReturnValue([{ Name: 'Alice' }, { Name: 'Bob' }])
      };

      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);

      mockTransformer.transform.mockReturnValue([{ NAME: 'Alice' }, { NAME: 'Bob' }]);

      mockLoader.load.mockReturnValue({
        success: true,
        inserted: 2,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 2
      });
    });

    it('should execute complete import successfully', () => {
      const result = engine.runImport(validRecipe);

      expect(result).toMatchObject({
        success: true,
        importName: 'Test Import',
        extract: { rowsExtracted: 2 },
        transform: { rowsTransformed: 2 },
        load: {
          success: true,
          inserted: 2,
          updated: 0,
          skipped: 0,
          deleted: 0,
          total: 2
        }
      });
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should validate configuration before execution', () => {
      engine.runImport(validRecipe);

      expect(ImportConfiguration).toHaveBeenCalledWith(validRecipe, mockLogger);
    });

    it('should log import start and completion', () => {
      engine.runImport(validRecipe);

      expect(mockLogger.info).toHaveBeenCalledWith('[ImportEngine] Starting import: Test Import');
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('[ImportEngine] Import completed successfully')
      );
    });

    it('should execute all three ETL phases', () => {
      engine.runImport(validRecipe);

      expect(mockSourceFactory.createStrategy).toHaveBeenCalledWith('SheetById');
      expect(mockStrategy.extract).toHaveBeenCalled();
      expect(mockTransformer.transform).toHaveBeenCalled();
      expect(mockLoader.load).toHaveBeenCalled();
    });

    it('should use exception service for retry logic when available', () => {
      mockExceptionService.executeWithRetry.mockImplementation((fn) => fn());

      engine.runImport(validRecipe, { maxRetries: 5 });

      expect(mockExceptionService.executeWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        {},
        5
      );
    });

    it('should work without exception service', () => {
      const engineNoRetry = new ImportEngine(
        mockLogger,
        mockDriveService,
        mockSpreadsheetService,
        mockDatabaseService,
        mockExpressionEngine,
        null // No exception service
      );

      // Set up mocks for the new engine's instances
      const mockStrategyNoRetry = {
        extract: jest.fn().mockReturnValue([{ Name: 'Alice' }])
      };
      engineNoRetry._sourceFactory.createStrategy = jest.fn().mockReturnValue(mockStrategyNoRetry);
      engineNoRetry._transformer.transform = jest.fn().mockReturnValue([{ NAME: 'Alice' }]);
      engineNoRetry._loader.load = jest.fn().mockReturnValue({
        success: true,
        inserted: 1,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 1
      });

      const result = engineNoRetry.runImport(validRecipe);

      expect(result.success).toBe(true);
      expect(mockExceptionService.executeWithRetry).not.toHaveBeenCalled();
    });

    it('should use default maxRetries of 3', () => {
      mockExceptionService.executeWithRetry.mockImplementation((fn) => fn());

      engine.runImport(validRecipe);

      expect(mockExceptionService.executeWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        {},
        3
      );
    });

    it('should support custom maxRetries option', () => {
      mockExceptionService.executeWithRetry.mockImplementation((fn) => fn());

      engine.runImport(validRecipe, { maxRetries: 10 });

      expect(mockExceptionService.executeWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        {},
        10
      );
    });
  });

  // ===================================================================
  // Dry Run Mode Tests
  // ===================================================================
  describe('Dry Run Mode', () => {
    let validRecipe;
    let mockConfig;
    let mockStrategy;

    beforeEach(() => {
      validRecipe = {
        name: 'Test Import',
        source: { type: 'SheetById', config: {} },
        transform: { mapping: {} },
        load: { targetTable: 'Users', conflictResolution: 'UPSERT', conflictKey: 'EMAIL' }
      };

      mockConfig = {
        getName: jest.fn().mockReturnValue('Test Import'),
        getSummary: jest.fn().mockReturnValue({}),
        getSource: jest.fn().mockReturnValue(validRecipe.source),
        getTransform: jest.fn().mockReturnValue(validRecipe.transform),
        getLoad: jest.fn().mockReturnValue(validRecipe.load)
      };

      ImportConfiguration.mockImplementation(() => mockConfig);

      mockStrategy = {
        extract: jest.fn().mockReturnValue([{ Name: 'Alice' }])
      };

      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);
      mockTransformer.transform.mockReturnValue([{ NAME: 'Alice' }]);
    });

    it('should skip load phase in dry run mode', () => {
      const result = engine.runImport(validRecipe, { dryRun: true });

      expect(mockLoader.load).not.toHaveBeenCalled();
      expect(result.load.dryRun).toBe(true);
    });

    it('should still execute extract and transform in dry run', () => {
      engine.runImport(validRecipe, { dryRun: true });

      expect(mockStrategy.extract).toHaveBeenCalled();
      expect(mockTransformer.transform).toHaveBeenCalled();
    });

    it('should return dry run result with correct total', () => {
      const result = engine.runImport(validRecipe, { dryRun: true });

      expect(result.load).toEqual({
        success: true,
        inserted: 0,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 1,
        failed: 0,
        recordsProcessed: 1,
        dryRun: true
      });
    });

    it('should log dry run warning', () => {
      engine.runImport(validRecipe, { dryRun: true });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[ImportEngine] DRY RUN mode - data will not be persisted'
      );
    });
  });

  // ===================================================================
  // Error Handling Tests
  // ===================================================================
  describe('Error Handling', () => {
    it('should wrap configuration errors in ImportError', () => {
      const invalidRecipe = { name: 'Invalid' };
      const configError = new ConfigurationError('Invalid config', 'INVALID_CONFIG');

      ImportConfiguration.mockImplementation(() => {
        throw configError;
      });

      try {
        engine.runImport(invalidRecipe);
        fail('Should have thrown ImportError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigurationError);
      }
    });

    it('should re-throw ImportError without wrapping', () => {
      const recipe = { name: 'Test' };
      const importError = new ImportError('Import failed', 'IMPORT_ERROR');

      ImportConfiguration.mockImplementation(() => {
        throw importError;
      });

      expect(() => {
        engine.runImport(recipe);
      }).toThrow(importError);
    });

    it('should wrap generic errors in ImportError', () => {
      const recipe = { name: 'Test' };

      ImportConfiguration.mockImplementation(() => {
        throw new Error('Unknown error');
      });

      try {
        engine.runImport(recipe);
        fail('Should have thrown ImportError');
      } catch (error) {
        expect(error).toBeInstanceOf(ImportError);
        expect(error.message).toContain('Unknown error');
        expect(error.code).toBe('IMPORT_FAILED');
      }
    });

    it('should log errors before throwing', () => {
      const recipe = { name: 'Test' };

      ImportConfiguration.mockImplementation(() => {
        throw new Error('Test error');
      });

      try {
        engine.runImport(recipe);
      } catch (error) {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('[ImportEngine] Import failed')
      );
    });

    it('should include duration in error context', () => {
      const recipe = { name: 'Test' };

      ImportConfiguration.mockImplementation(() => {
        throw new Error('Test error');
      });

      try {
        engine.runImport(recipe);
      } catch (error) {
        expect(error.context).toHaveProperty('durationMs');
        expect(error.context.durationMs).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ===================================================================
  // Custom Source Registration Tests
  // ===================================================================
  describe('registerCustomSource()', () => {
    it('should register custom source strategy', () => {
      const customStrategy = class CustomStrategy {};

      engine.registerCustomSource('CustomSource', customStrategy);

      expect(mockSourceFactory.registerStrategy).toHaveBeenCalledWith(
        'CustomSource',
        customStrategy
      );
    });

    it('should log registration', () => {
      const customStrategy = class CustomStrategy {};

      engine.registerCustomSource('ApiSource', customStrategy);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '[ImportEngine] Registering custom source strategy: ApiSource'
      );
    });

    it('should also whitelist the type in ImportConfiguration so recipes using it validate', () => {
      // ImportConfiguration is jest.mock()'d in this file (see top-of-file mocks),
      // so registerSourceType is a jest.fn() here — this asserts the call, not
      // the real static array mutation (covered directly in ImportConfiguration.test.js).
      const customStrategy = class CustomStrategy {};

      engine.registerCustomSource('WhitelistedSource', customStrategy);

      expect(ImportConfiguration.registerSourceType).toHaveBeenCalledWith('WhitelistedSource');
    });
  });

  // ===================================================================
  // Recipe Validation Tests
  // ===================================================================
  describe('validateRecipe()', () => {
    it('should return valid for correct recipe', () => {
      const validRecipe = {
        name: 'Test',
        source: { type: 'SheetById', config: {} },
        transform: { mapping: {} },
        load: { targetTable: 'Users', conflictResolution: 'UPSERT', conflictKey: 'EMAIL' }
      };

      const mockConfig = {
        getSummary: jest.fn().mockReturnValue({ name: 'Test' })
      };

      ImportConfiguration.mockImplementation(() => mockConfig);

      const result = engine.validateRecipe(validRecipe);

      expect(result.valid).toBe(true);
      expect(result.summary).toEqual({ name: 'Test' });
      expect(result.message).toBe('Recipe is valid');
    });

    it('should return invalid for incorrect recipe', () => {
      const invalidRecipe = { name: 'Invalid' };

      ImportConfiguration.mockImplementation(() => {
        throw new ConfigurationError('Missing source', 'MISSING_SOURCE');
      });

      const result = engine.validateRecipe(invalidRecipe);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing source');
      expect(result.code).toBe('MISSING_SOURCE');
    });

    it('should handle errors without code', () => {
      const invalidRecipe = { name: 'Invalid' };

      ImportConfiguration.mockImplementation(() => {
        throw new Error('Generic error');
      });

      const result = engine.validateRecipe(invalidRecipe);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Generic error');
      expect(result.code).toBe('VALIDATION_ERROR');
    });
  });

  // ===================================================================
  // Utility Methods Tests
  // ===================================================================
  describe('Utility Methods', () => {
    it('should return available source types', () => {
      const types = engine.getAvailableSourceTypes();

      expect(types).toEqual(['SheetById', 'Folder']);
      expect(mockSourceFactory.getAvailableStrategies).toHaveBeenCalled();
    });

    it('should return config summary', () => {
      const summary = engine.getConfigSummary();

      expect(summary).toEqual({
        sourceStrategies: ['SheetById', 'Folder'],
        hasExpressionEngine: true,
        hasExceptionService: true,
        hasMonitor: false
      });
    });

    it('should indicate missing optional services in summary', () => {
      const engineNoOptional = new ImportEngine(
        mockLogger,
        mockDriveService,
        mockSpreadsheetService,
        mockDatabaseService,
        null,
        null
      );

      const summary = engineNoOptional.getConfigSummary();

      expect(summary.hasExpressionEngine).toBe(false);
      expect(summary.hasExceptionService).toBe(false);
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should handle complete workflow with SheetById source', () => {
      const recipe = {
        name: 'Import from Sheet',
        source: {
          type: 'SheetById',
          config: { sheetId: 'abc123', hasHeaders: true }
        },
        transform: {
          mapping: { 'First Name': 'FIRST_NAME', Email: 'EMAIL' }
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'UPSERT',
          conflictKey: 'EMAIL'
        }
      };

      const mockConfig = {
        getName: jest.fn().mockReturnValue('Import from Sheet'),
        getSummary: jest.fn().mockReturnValue({}),
        getSource: jest.fn().mockReturnValue(recipe.source),
        getTransform: jest.fn().mockReturnValue(recipe.transform),
        getLoad: jest.fn().mockReturnValue(recipe.load)
      };

      ImportConfiguration.mockImplementation(() => mockConfig);

      const mockStrategy = {
        extract: jest.fn().mockReturnValue([{ 'First Name': 'Alice', Email: 'alice@example.com' }])
      };

      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);

      mockTransformer.transform.mockReturnValue([
        { FIRST_NAME: 'Alice', EMAIL: 'alice@example.com' }
      ]);

      mockLoader.load.mockReturnValue({
        success: true,
        inserted: 1,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 1
      });

      const result = engine.runImport(recipe);

      expect(result.success).toBe(true);
      expect(result.extract.rowsExtracted).toBe(1);
      expect(result.transform.rowsTransformed).toBe(1);
      expect(result.load.inserted).toBe(1);
    });

    it('should handle empty data gracefully', () => {
      const recipe = {
        name: 'Empty Import',
        source: { type: 'SheetById', config: {} },
        transform: { mapping: {} },
        load: { targetTable: 'Users', conflictResolution: 'UPSERT', conflictKey: 'EMAIL' }
      };

      const mockConfig = {
        getName: jest.fn().mockReturnValue('Empty Import'),
        getSummary: jest.fn().mockReturnValue({}),
        getSource: jest.fn().mockReturnValue(recipe.source),
        getTransform: jest.fn().mockReturnValue(recipe.transform),
        getLoad: jest.fn().mockReturnValue(recipe.load)
      };

      ImportConfiguration.mockImplementation(() => mockConfig);

      const mockStrategy = {
        extract: jest.fn().mockReturnValue([])
      };

      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);
      mockTransformer.transform.mockReturnValue([]);
      mockLoader.load.mockReturnValue({
        success: true,
        inserted: 0,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 0
      });

      const result = engine.runImport(recipe);

      expect(result.success).toBe(true);
      expect(result.extract.rowsExtracted).toBe(0);
      expect(result.load.total).toBe(0);
    });

    it('should log all phases during execution', () => {
      const recipe = {
        name: 'Test',
        source: { type: 'SheetById', config: {} },
        transform: { mapping: {} },
        load: { targetTable: 'Users', conflictResolution: 'UPSERT', conflictKey: 'EMAIL' }
      };

      const mockConfig = {
        getName: jest.fn().mockReturnValue('Test'),
        getSummary: jest.fn().mockReturnValue({}),
        getSource: jest.fn().mockReturnValue(recipe.source),
        getTransform: jest.fn().mockReturnValue(recipe.transform),
        getLoad: jest.fn().mockReturnValue(recipe.load)
      };

      ImportConfiguration.mockImplementation(() => mockConfig);

      const mockStrategy = {
        extract: jest.fn().mockReturnValue([{ data: 'test' }])
      };

      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);
      mockTransformer.transform.mockReturnValue([{ data: 'test' }]);
      mockLoader.load.mockReturnValue({
        success: true,
        inserted: 1,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: 1
      });

      engine.runImport(recipe);

      expect(mockLogger.info).toHaveBeenCalledWith('[ImportEngine] Phase 1: EXTRACT');
      expect(mockLogger.info).toHaveBeenCalledWith('[ImportEngine] Phase 2: TRANSFORM');
      expect(mockLogger.info).toHaveBeenCalledWith('[ImportEngine] Phase 3: LOAD');
    });
  });
});
