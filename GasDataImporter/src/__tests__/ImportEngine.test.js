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

    it('should invoke options.postTransform with the transformed batch and config before Load', () => {
      const postTransform = jest.fn().mockReturnValue([{ NAME: 'Alice' }]);

      engine.runImport(validRecipe, { postTransform });

      expect(postTransform).toHaveBeenCalledWith([{ NAME: 'Alice' }, { NAME: 'Bob' }], mockConfig);
      expect(mockLoader.load).toHaveBeenCalledWith([{ NAME: 'Alice' }], validRecipe.load);
    });

    it('should not invoke postTransform when not provided', () => {
      engine.runImport(validRecipe);

      expect(mockLoader.load).toHaveBeenCalledWith(
        [{ NAME: 'Alice' }, { NAME: 'Bob' }],
        validRecipe.load
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
  // startImport() / runImportChunk() - Resumable/Chunked Imports
  // ===================================================================
  describe('startImport() / runImportChunk()', () => {
    it('startImport returns an initial checkpoint without touching extract/transform/load', () => {
      const recipe = { name: 'Test Import', source: {}, transform: {}, load: {} };
      const mockConfig = { getName: jest.fn().mockReturnValue('Test Import') };
      ImportConfiguration.mockImplementation(() => mockConfig);

      const checkpoint = engine.startImport(recipe);

      expect(checkpoint.stage).toBe('EXTRACT');
      expect(checkpoint.recipeName).toBe('Test Import');
      expect(checkpoint.done).toBe(false);
      expect(mockSourceFactory.createStrategy).not.toHaveBeenCalled();
      expect(mockLoader.load).not.toHaveBeenCalled();
    });

    it('drives a cursor-aware SheetById recipe to completion across multiple chunks', () => {
      const recipe = {
        name: 'Chunked Import',
        source: { type: 'SheetById', config: { sheetId: 'abc123' } },
        transform: { mapping: { Name: 'NAME' } },
        load: { targetTable: 'Users', conflictResolution: 'UPSERT', conflictKey: 'EMAIL' }
      };

      const mockConfig = {
        getName: jest.fn().mockReturnValue('Chunked Import'),
        getSource: jest.fn().mockReturnValue(recipe.source),
        getTransform: jest.fn().mockReturnValue(recipe.transform),
        getLoad: jest.fn().mockReturnValue(recipe.load)
      };
      ImportConfiguration.mockImplementation(() => mockConfig);

      // Three-row sheet, chunked one row at a time via extractChunk.
      const allRows = [{ NAME: 'Alice' }, { NAME: 'Bob' }, { NAME: 'Carol' }];
      let cursorPos = 0;
      const mockStrategy = {
        supportsCursor: jest.fn().mockReturnValue(true),
        extractChunk: jest.fn((_config, cursor, maxRows) => {
          const offset = cursor.rowOffset;
          const rows = allRows.slice(offset, offset + maxRows);
          cursorPos = offset + rows.length;
          return {
            rows,
            nextCursor: { rowOffset: cursorPos, headers: ['NAME'] },
            exhausted: cursorPos >= allRows.length
          };
        })
      };
      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);

      mockTransformer.transform.mockImplementation((rows) => rows);
      // Returns per-call counts (data.length) rather than a fixed total, since
      // LOAD is now chunked too: loadChunk is called once per bounded chunk,
      // not once with the whole dataset.
      mockLoader.loadChunk = jest.fn((data) => ({
        success: true,
        inserted: data.length,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: data.length
      }));

      let checkpoint = engine.startImport(recipe);
      expect(checkpoint.stage).toBe('EXTRACT');

      let done = false;
      let iterations = 0;
      while (!done && iterations < 10) {
        const step = engine.runImportChunk(recipe, checkpoint, { maxRows: 1 });
        checkpoint = step.checkpoint;
        done = step.done;
        iterations++;
      }

      expect(done).toBe(true);
      expect(checkpoint.stage).toBe('DONE');
      expect(checkpoint.counters.extracted).toBe(3);
      expect(checkpoint.counters.inserted).toBe(3);
      expect(iterations).toBeGreaterThan(1); // proves it actually chunked, not one shot
      expect(mockStrategy.extractChunk).toHaveBeenCalledTimes(3);
      // LOAD is now bounded/interleaved with EXTRACT too: one loadChunk call
      // per bounded chunk (1 row each here), not one call with all 3 rows.
      expect(mockLoader.loadChunk).toHaveBeenCalledTimes(3);
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(1, [{ NAME: 'Alice' }], recipe.load, {
        isFirstChunk: true
      });
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(2, [{ NAME: 'Bob' }], recipe.load, {
        isFirstChunk: false
      });
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(3, [{ NAME: 'Carol' }], recipe.load, {
        isFirstChunk: false
      });
    });

    it('never buffers more than budget.maxRows items at rest in checkpoint.buffer for a multi-row SheetById recipe', () => {
      const recipe = {
        name: 'Bounded Buffer Import',
        source: { type: 'SheetById', config: { sheetId: 'abc123' } },
        transform: { mapping: { Name: 'NAME' } },
        load: { targetTable: 'Users', conflictResolution: 'UPSERT', conflictKey: 'EMAIL' }
      };

      const mockConfig = {
        getName: jest.fn().mockReturnValue('Bounded Buffer Import'),
        getSource: jest.fn().mockReturnValue(recipe.source),
        getTransform: jest.fn().mockReturnValue(recipe.transform),
        getLoad: jest.fn().mockReturnValue(recipe.load)
      };
      ImportConfiguration.mockImplementation(() => mockConfig);

      // Six-row sheet, chunked two rows at a time via extractChunk.
      const allRows = [
        { NAME: 'R1' },
        { NAME: 'R2' },
        { NAME: 'R3' },
        { NAME: 'R4' },
        { NAME: 'R5' },
        { NAME: 'R6' }
      ];
      const mockStrategy = {
        supportsCursor: jest.fn().mockReturnValue(true),
        extractChunk: jest.fn((_config, cursor, maxRows) => {
          const offset = cursor.rowOffset;
          const rows = allRows.slice(offset, offset + maxRows);
          const newOffset = offset + rows.length;
          return {
            rows,
            nextCursor: { rowOffset: newOffset, headers: ['NAME'] },
            exhausted: newOffset >= allRows.length
          };
        })
      };
      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);

      mockTransformer.transform.mockImplementation((rows) => rows);
      mockLoader.loadChunk = jest.fn((data) => ({
        success: true,
        inserted: data.length,
        updated: 0,
        skipped: 0,
        deleted: 0,
        total: data.length
      }));

      let checkpoint = engine.startImport(recipe);
      let done = false;
      let iterations = 0;
      const observedBufferLengths = [];
      while (!done && iterations < 50) {
        const step = engine.runImportChunk(recipe, checkpoint, { maxRows: 2 });
        checkpoint = step.checkpoint;
        done = step.done;
        observedBufferLengths.push(checkpoint.buffer ? checkpoint.buffer.length : 0);
        iterations++;
      }

      expect(done).toBe(true);
      expect(checkpoint.counters.extracted).toBe(6);
      expect(checkpoint.counters.transformed).toBe(6);
      expect(checkpoint.counters.inserted).toBe(6);
      // The bounded-buffer guarantee: checkpoint.buffer never exceeds maxRows
      // items at any yielded/returned point, for the whole run.
      expect(observedBufferLengths.every((len) => len <= 2)).toBe(true);
      expect(Math.max(...observedBufferLengths)).toBeGreaterThan(0); // sanity: buffer was actually populated at some point
    });

    it('reaches isFirstChunk:false on a real second LOAD call end-to-end, without re-purging prior chunks (OVERWRITE)', () => {
      const recipe = {
        name: 'Overwrite Import',
        source: { type: 'SheetById', config: { sheetId: 'abc123' } },
        transform: { mapping: {} },
        load: { targetTable: 'Users', conflictResolution: 'OVERWRITE', conflictKey: 'EMAIL' }
      };

      const mockConfig = {
        getName: jest.fn().mockReturnValue('Overwrite Import'),
        getSource: jest.fn().mockReturnValue(recipe.source),
        getTransform: jest.fn().mockReturnValue(recipe.transform),
        getLoad: jest.fn().mockReturnValue(recipe.load)
      };
      ImportConfiguration.mockImplementation(() => mockConfig);

      const allRows = [{ NAME: 'Alice' }, { NAME: 'Bob' }, { NAME: 'Carol' }];
      const mockStrategy = {
        supportsCursor: jest.fn().mockReturnValue(true),
        extractChunk: jest.fn((_config, cursor, maxRows) => {
          const offset = cursor.rowOffset;
          const rows = allRows.slice(offset, offset + maxRows);
          const newOffset = offset + rows.length;
          return {
            rows,
            nextCursor: { rowOffset: newOffset, headers: ['NAME'] },
            exhausted: newOffset >= allRows.length
          };
        })
      };
      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);
      mockTransformer.transform.mockImplementation((rows) => rows);

      // Fake table mirroring Loader.loadChunk's real OVERWRITE semantics:
      // purge-then-insert only on isFirstChunk, append (never purge) after —
      // proves via the real orchestrator (not a direct Loader.loadChunk unit
      // test) that a second chunk doesn't wipe out the first (review finding #4).
      let fakeTable = [];
      mockLoader.loadChunk = jest.fn((data, _loadConfig, { isFirstChunk }) => {
        if (isFirstChunk) {
          fakeTable = [];
        }
        fakeTable.push(...data);
        return {
          success: true,
          inserted: data.length,
          updated: 0,
          skipped: 0,
          deleted: 0,
          total: data.length
        };
      });

      let checkpoint = engine.startImport(recipe);
      let done = false;
      let iterations = 0;
      while (!done && iterations < 20) {
        const step = engine.runImportChunk(recipe, checkpoint, { maxRows: 1 });
        checkpoint = step.checkpoint;
        done = step.done;
        iterations++;
      }

      expect(done).toBe(true);
      expect(mockLoader.loadChunk).toHaveBeenCalledTimes(3);
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(1, [{ NAME: 'Alice' }], recipe.load, {
        isFirstChunk: true
      });
      // The genuinely interesting assertion: a second (and third) LOAD call
      // really happens with isFirstChunk:false, driven through runImportChunk.
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(2, [{ NAME: 'Bob' }], recipe.load, {
        isFirstChunk: false
      });
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(3, [{ NAME: 'Carol' }], recipe.load, {
        isFirstChunk: false
      });
      // The table ends up with rows from ALL chunks, not just the last one —
      // proving the second/third chunk appended instead of re-purging.
      expect(fakeTable).toEqual([{ NAME: 'Alice' }, { NAME: 'Bob' }, { NAME: 'Carol' }]);
    });

    it('still purges exactly once, on the first chunk that actually has data, when a leading chunk yields zero load-ready rows (OVERWRITE)', () => {
      // Regression test for review round-2 finding "Bug A": if
      // ImportPipelineExecutor advanced checkpoint.loadOffset on every LOAD
      // call (even for an empty buffer), a leading chunk that transform
      // rejects down to zero rows (e.g. a block of blank/invalid rows before
      // real data in the sheet) would permanently consume the "first chunk"
      // slot — isFirstChunk would be false for every later chunk and
      // OVERWRITE's purge would never run at all this run, even though the
      // later chunk is genuinely the first one with real data.
      const recipe = {
        name: 'Overwrite With Leading Empty Chunk',
        source: { type: 'SheetById', config: { sheetId: 'abc123' } },
        transform: { mapping: {} },
        load: { targetTable: 'Users', conflictResolution: 'OVERWRITE', conflictKey: 'EMAIL' }
      };

      const mockConfig = {
        getName: jest.fn().mockReturnValue('Overwrite With Leading Empty Chunk'),
        getSource: jest.fn().mockReturnValue(recipe.source),
        getTransform: jest.fn().mockReturnValue(recipe.transform),
        getLoad: jest.fn().mockReturnValue(recipe.load)
      };
      ImportConfiguration.mockImplementation(() => mockConfig);

      // Three rows extracted one at a time; "Alice" simulates a row that
      // fails transform validation (transform yields nothing for it), so
      // the FIRST extract+transform chunk is genuinely empty even though
      // real data (Bob, Carol) follows.
      const allRows = [{ NAME: 'Alice' }, { NAME: 'Bob' }, { NAME: 'Carol' }];
      const mockStrategy = {
        supportsCursor: jest.fn().mockReturnValue(true),
        extractChunk: jest.fn((_config, cursor, maxRows) => {
          const offset = cursor.rowOffset;
          const rows = allRows.slice(offset, offset + maxRows);
          const newOffset = offset + rows.length;
          return {
            rows,
            nextCursor: { rowOffset: newOffset, headers: ['NAME'] },
            exhausted: newOffset >= allRows.length
          };
        })
      };
      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);
      mockTransformer.transform.mockImplementation((rows) =>
        rows.filter((r) => r.NAME !== 'Alice')
      );

      // Fake table seeded with a stale row from a PRIOR run, mirroring
      // Loader.loadChunk's real OVERWRITE semantics: purge-then-insert only
      // on isFirstChunk, append after. If the bug is present, isFirstChunk
      // never comes back true after the leading empty chunk, so the stale
      // row is never purged this run.
      let fakeTable = [{ NAME: 'OldStale' }];
      mockLoader.loadChunk = jest.fn((data, _loadConfig, { isFirstChunk }) => {
        if (isFirstChunk) {
          fakeTable = [];
        }
        fakeTable.push(...data);
        return {
          success: true,
          inserted: data.length,
          updated: 0,
          skipped: 0,
          deleted: 0,
          total: data.length
        };
      });

      let checkpoint = engine.startImport(recipe);
      let done = false;
      let iterations = 0;
      while (!done && iterations < 20) {
        const step = engine.runImportChunk(recipe, checkpoint, { maxRows: 1 });
        checkpoint = step.checkpoint;
        done = step.done;
        iterations++;
      }

      expect(done).toBe(true);
      // LOAD is called once per EXTRACT chunk, including the empty one:
      // (Alice -> []), (Bob -> [Bob]), (Carol -> [Carol]).
      expect(mockLoader.loadChunk).toHaveBeenCalledTimes(3);
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(1, [], recipe.load, {
        isFirstChunk: true
      });
      // The critical assertion: the chunk carrying the first REAL data
      // (Bob) must still be treated as isFirstChunk:true, because the
      // empty chunk before it must not have consumed the slot.
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(2, [{ NAME: 'Bob' }], recipe.load, {
        isFirstChunk: true
      });
      expect(mockLoader.loadChunk).toHaveBeenNthCalledWith(3, [{ NAME: 'Carol' }], recipe.load, {
        isFirstChunk: false
      });
      // The stale pre-existing row must be gone — proving the table was
      // actually purged once, on the first chunk with real data — and both
      // real rows survived.
      expect(fakeTable).toEqual([{ NAME: 'Bob' }, { NAME: 'Carol' }]);
    });

    it('runImportChunk on a non-cursor-aware source strategy completes extraction in one chunk (compatibility path)', () => {
      const recipe = {
        name: 'Custom Source Import',
        source: { type: 'CustomSource', config: {} },
        transform: { mapping: {} },
        load: { targetTable: 'Users', conflictResolution: 'UPSERT', conflictKey: 'EMAIL' }
      };

      const mockConfig = {
        getName: jest.fn().mockReturnValue('Custom Source Import'),
        getSource: jest.fn().mockReturnValue(recipe.source),
        getTransform: jest.fn().mockReturnValue(recipe.transform),
        getLoad: jest.fn().mockReturnValue(recipe.load)
      };
      ImportConfiguration.mockImplementation(() => mockConfig);

      const mockStrategy = {
        // No supportsCursor() override -> falls back to SourceStrategy's default false,
        // but this fake mimics that with an explicit jest.fn() for clarity.
        supportsCursor: jest.fn().mockReturnValue(false),
        extract: jest.fn().mockReturnValue([{ Name: 'Alice' }])
      };
      mockSourceFactory.createStrategy.mockReturnValue(mockStrategy);
      // Non-cursor compatibility path transforms its one-shot extract inline
      // (same as the cursor-aware EXTRACT stage), so the mock must return
      // something rather than undefined.
      mockTransformer.transform.mockImplementation((rows) => rows);

      const checkpoint = engine.startImport(recipe);
      const step = engine.runImportChunk(recipe, checkpoint, { maxRows: 1 });

      expect(step.done).toBe(false); // extract+transform done, but LOAD still remains
      expect(step.checkpoint.stage).toBe('LOAD');
      expect(mockStrategy.extract).toHaveBeenCalledTimes(1); // whole extract happened in this one chunk
      expect(step.checkpoint.counters.extracted).toBe(1);
      expect(step.checkpoint.counters.transformed).toBe(1);
      expect(step.checkpoint.buffer).toEqual([{ Name: 'Alice' }]);
    });

    it('rejects resuming a checkpoint with a mismatched recipe', () => {
      const recipe = {
        name: 'Import A',
        source: { type: 'SheetById', config: {} },
        transform: {},
        load: {}
      };
      const otherRecipe = { name: 'Import B', source: {}, transform: {}, load: {} };

      const mockConfig = { getName: jest.fn().mockReturnValue('Import A') };
      ImportConfiguration.mockImplementation(() => mockConfig);
      const checkpoint = engine.startImport(recipe);

      const mockConfigB = { getName: jest.fn().mockReturnValue('Import B') };
      ImportConfiguration.mockImplementation(() => mockConfigB);

      expect(() => {
        engine.runImportChunk(otherRecipe, checkpoint, { maxRows: 1 });
      }).toThrow(/recipeName/);
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
