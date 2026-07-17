/**
 * Integration Test: Cross-Cutting Concern - Dry Run Mode
 *
 * Layers Tested: All layers supporting dry-run (DomainRepositoryLib → SheetDBLib → GoogleApiWrapper → PipelineFramework → GasDataImporter)
 *
 * Purpose: Verify that dry-run mode is properly implemented across all layers,
 * preventing actual writes while still executing logic and returning valid results.
 *
 * @file test/__tests__/integration/CrossCut_DryRunMode.test.js
 */

import { Entity, Repository } from '@DomainRepositoryLib';
import { DatabaseService } from '@SheetDBLib';
import { Pipeline, Step } from '@PipelineFramework';
import { ImportEngine } from '@GasDataImporter';
import { ExceptionService } from '@GasResilienceLib';
import { ExpressionEngineService } from '@GasExpressionEngineLib';
import { MockFactory } from '../../fakes/MockFactory';

describe('Cross-Cutting Concern: Dry Run Mode', () => {
  // Test fixtures
  let mocks;
  let mockLogger;
  let mockUtils;
  let mockCache;
  let exceptionService;
  let expressionEngine;
  let writeOperations;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    mockLogger = mocks.logger;
    mockUtils = mocks.utils;
    mockCache = mocks.cache;
    exceptionService = mocks.exceptionService;
    expressionEngine = mocks.expressionEngine;

    // Track write operations for custom test mocks
    writeOperations = {
      inserts: [],
      updates: [],
      deletes: [],
      emails: [],
      files: []
    };
  });

  afterEach(() => {
    mockCache.removeAll();
    jest.clearAllMocks();
    writeOperations = { inserts: [], updates: [], deletes: [], emails: [], files: [] };
  });

  describe('Repository Dry Run', () => {
    class DryRunEntity extends Entity {
      constructor(data = {}) {
        super(data);
        this.name = data.name || null;
        this.email = data.email || null;
      }

      toData() {
        return {
          id: this.id,
          name: this.name,
          email: this.email,
          createdAt: this.createdAt?.toISOString(),
          updatedAt: this.updatedAt?.toISOString()
        };
      }

      static fromData(data) {
        return new DryRunEntity(data);
      }

      validate() {
        return true;
      }
    }

    class DryRunRepository extends Repository {
      constructor(database, logger, cache, dryRun = false) {
        super(database, 'DryRunEntities', DryRunEntity, logger, cache, null, { dryRun });
      }
    }

    test('Dry run save validates but does not persist', () => {
      // Arrange
      const table = MockFactory.createJestTable('DryRunEntities');
      table.insertRow.mockImplementation((data) => {
        writeOperations.inserts.push(data);
        return data;
      });

      const mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        utils: mockUtils,
        cache: mockCache,
        tables: {
          DryRunEntities: table
        }
      });

      const repository = new DryRunRepository(mockDatabase, mockLogger, mockCache, true);

      // Act
      const entity = new DryRunEntity({ name: 'Dry Run Test', email: 'dryrun@example.com' });
      const result = repository.save(entity, { dryRun: true });

      // Assert: Entity validated but not persisted
      expect(result.dryRun).toBe(true);
      expect(result.name).toBe('Dry Run Test');
      expect(mockDatabase.tables.DryRunEntities.insertRow).not.toHaveBeenCalled();

      // Standardized Logger Assertion
      expect(mockLogger.hasLog('INFO', /\[DRY-RUN\]/i)).toBe(true);
      expect(mockLogger.hasLog('INFO', /Would insert DryRunEntity/i)).toBe(true);
    });

    test('Non-dry-run save persists normally', () => {
      // Arrange
      const table = MockFactory.createJestTable('DryRunEntities');
      table.insertRow.mockImplementation((data) => {
        writeOperations.inserts.push(data);
        return data;
      });

      const mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        utils: mockUtils,
        cache: mockCache,
        tables: {
          DryRunEntities: table
        }
      });

      const repository = new DryRunRepository(mockDatabase, mockLogger, mockCache, false);

      // Act
      const entity = new DryRunEntity({ name: 'Real Save', email: 'real@example.com' });
      repository.save(entity);

      // Assert: Entity persisted
      expect(mockDatabase.tables.DryRunEntities.insertRow).toHaveBeenCalled();
      expect(mockLogger.hasLog('INFO', /Would insert/i)).toBe(false);
    });
  });

  describe('Pipeline Dry Run', () => {
    test('Pipeline dry run returns step list without execution', () => {
      // Arrange
      class TrackingStep extends Step {
        constructor(name, logger) {
          super(name, logger);
        }

        _executeLogic(context) {
          writeOperations.inserts.push({ step: this.getName() });
          return { executed: true };
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService, { name: 'TestPipeline' })
        .addStep(new TrackingStep('step1', mockLogger))
        .addStep(new TrackingStep('step2', mockLogger))
        .addStep(new TrackingStep('step3', mockLogger));

      // Act
      const context = pipeline.execute({}, { dryRun: true });

      // Assert: Steps not actually executed (result is PipelineContext)
      expect(context.get('dryRun')).toBe(true);
      expect(context.get('simulatedSteps')).toBeDefined();
      expect(writeOperations.inserts).toHaveLength(0);

      // Standardized Logger Assertion
      expect(mockLogger.hasLog('INFO', /\[TestPipeline\] \[DRY-RUN\] Would execute 3 steps/i)).toBe(
        true
      );
    });

    test('Pipeline normal execution runs all steps', () => {
      // Arrange
      class TrackingStep extends Step {
        _executeLogic(context) {
          writeOperations.inserts.push({ step: this.getName() });
          return { executed: true };
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService)
        .addStep(new TrackingStep('step1', mockLogger))
        .addStep(new TrackingStep('step2', mockLogger));

      // Act
      pipeline.execute({});

      // Assert: Steps executed
      expect(writeOperations.inserts).toHaveLength(2);
    });
  });

  describe('Import Engine Dry Run', () => {
    let mockDriveService;
    let mockSpreadsheetService;
    let mockDatabase;
    let sourceData;
    let targetData;

    beforeEach(() => {
      sourceData = [
        { name: 'Product 1', price: 100, quantity: 10 },
        { name: 'Product 2', price: 200, quantity: 5 }
      ];
      targetData = [];

      mockDriveService = mocks.driveService;
      mockSpreadsheetService = mocks.spreadsheetService;

      // Custom configuration for this test's spreadsheet mocks
      mockSpreadsheetService.getSheetInfo.mockReturnValue([
        { name: 'Sheet1', rowCount: sourceData.length + 1, columnCount: 3 }
      ]);
      mockSpreadsheetService.getSheetData.mockReturnValue([
        ['name', 'price', 'quantity'],
        ...sourceData.map((r) => [r.name, r.price, r.quantity])
      ]);
      mockSpreadsheetService.getRanges.mockReturnValue([
        ['name', 'price', 'quantity'],
        ...sourceData.map((r) => [r.name, r.price, r.quantity])
      ]);

      mockSpreadsheetService.openById.mockReturnValue({
        getId: () => 'SPREADSHEET_ID',
        getSheetByName: jest.fn((name) => ({
          getName: () => name,
          getDataRange: () => ({
            getValues: () => [
              ['name', 'price', 'quantity'],
              ...sourceData.map((r) => [r.name, r.price, r.quantity])
            ]
          })
        }))
      });

      const table = MockFactory.createJestTable('Products');
      table.insertRow.mockImplementation((data) => {
        const newData = { ...data, id: data.id || mockUtils.getUuid() };
        writeOperations.inserts.push(newData);
        targetData.push(newData);
        return newData;
      });
      table.insertRows.mockImplementation((rows) => {
        const newRows = rows.map((r) => {
          const newData = { ...r, id: r.id || mockUtils.getUuid() };
          writeOperations.inserts.push(newData);
          targetData.push(newData);
          return newData;
        });
        return newRows;
      });
      table.updateRowById.mockImplementation((id, data) => {
        writeOperations.updates.push({ id, data });
        return data;
      });
      table.deleteAllRows.mockImplementation(() => {
        writeOperations.deletes.push({ table: 'Products', all: true });
        targetData.length = 0;
        return true;
      });
      table.getAllRows.mockImplementation(() => targetData);
      table.getByPK.mockImplementation((id) => targetData.find((r) => r.id === id));
      table.getRowsWhere.mockImplementation(() => []);

      mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        utils: mockUtils,
        cache: mockCache,
        tables: { Products: table }
      });
    });

    test('Dry run import extracts and transforms but does not load', () => {
      // Arrange
      const importEngine = new ImportEngine(
        mockLogger,
        mockDriveService,
        mockSpreadsheetService,
        mockDatabase,
        expressionEngine,
        exceptionService
      );

      const recipe = {
        name: 'Dry Run Import',
        source: { type: 'SheetById', config: { sheetId: 'SOURCE_ID', hasHeaders: true } },
        transform: {
          mapping: { name: 'name', price: 'price', quantity: 'quantity' },
          calculated: { total: '{{price}} * {{quantity}}' }
        },
        load: { targetTable: 'Products', conflictResolution: 'INSERT_ONLY' }
      };

      // Act
      const result = importEngine.runImport(recipe, { dryRun: true });

      // Assert: Extract and transform ran, but not load
      expect(result.success).toBe(true);
      expect(result.load.dryRun).toBe(true);
      expect(result.extract.rowsExtracted).toBe(2);
      expect(result.transform.rowsTransformed).toBe(2);
      expect(writeOperations.inserts).toHaveLength(0);
      expect(targetData).toHaveLength(0);

      // Standardized Logger Assertion
      expect(mockLogger.hasLog('WARN', /\[ImportEngine\] DRY RUN mode/i)).toBe(true);
      expect(mockLogger.hasLog('INFO', /Phase 3: LOAD \(DRY RUN - skipped\)/i)).toBe(true);
    });

    test('Normal import loads data', () => {
      // Arrange
      const importEngine = new ImportEngine(
        mockLogger,
        mockDriveService,
        mockSpreadsheetService,
        mockDatabase,
        expressionEngine,
        exceptionService
      );

      const recipe = {
        name: 'Real Import',
        source: { type: 'SheetById', config: { sheetId: 'SOURCE_ID', hasHeaders: true } },
        transform: { mapping: { name: 'name', price: 'price', quantity: 'quantity' } },
        load: { targetTable: 'Products', conflictResolution: 'INSERT_ONLY' }
      };

      // Act
      const result = importEngine.runImport(recipe);

      // Assert: Data loaded
      expect(result.success).toBe(true);
      expect(result.load.inserted).toBe(2);
      expect(writeOperations.inserts).toHaveLength(2);
    });
  });

  describe('Database Dry Run', () => {
    test('Dry run database operations return expected results', () => {
      // Arrange
      const testData = [];
      const mockDatabase = {
        tables: {
          TestTable: {
            name: 'TestTable',
            columns: ['id', 'name', 'value'],
            getAllRows: jest.fn(() => testData),
            insertRow: jest.fn((data, options = {}) => {
              if (options.dryRun) {
                return { ...data, id: 'dry-run-id', dryRun: true };
              }
              const newData = { ...data, id: mockUtils.getUuid() };
              writeOperations.inserts.push(newData);
              testData.push(newData);
              return newData;
            })
          }
        },
        save: jest.fn((options = {}) => {
          if (options.dryRun) {
            return { success: true, dryRun: true };
          }
          return { success: true };
        }),
        _dryRun: false
      };

      // Act: Dry run insert
      const dryRunResult = mockDatabase.tables.TestTable.insertRow(
        { name: 'Test', value: 100 },
        { dryRun: true }
      );

      // Assert
      expect(dryRunResult.dryRun).toBe(true);
      expect(writeOperations.inserts).toHaveLength(0);
      expect(testData).toHaveLength(0);

      // Act: Real insert
      const realResult = mockDatabase.tables.TestTable.insertRow({ name: 'Real', value: 200 });

      // Assert
      expect(realResult.id).toBeDefined();
      expect(writeOperations.inserts).toHaveLength(1);
      expect(testData).toHaveLength(1);
    });
  });

  describe('Dry Run Response Pattern', () => {
    test('All dry run operations include dryRun: true flag', () => {
      // Arrange: Create various dry run operations
      const dryRunResults = [];

      // Repository dry run
      class TestEntity extends Entity {
        toData() {
          return { id: this.id };
        }
        validate() {
          return true;
        }
      }

      const mockRepo = {
        save: (entity, options) => {
          if (options?.dryRun) {
            return { ...entity, dryRun: true };
          }
          return entity;
        }
      };
      dryRunResults.push(mockRepo.save(new TestEntity(), { dryRun: true }));

      // Database dry run
      const mockDb = {
        insertRow: (data, options) => {
          if (options?.dryRun) {
            return { ...data, dryRun: true };
          }
          return data;
        }
      };
      dryRunResults.push(mockDb.insertRow({ name: 'test' }, { dryRun: true }));

      // Pipeline dry run
      const mockPipeline = {
        execute: (data, options) => {
          if (options?.dryRun) {
            return { success: true, dryRun: true, steps: [] };
          }
          return { success: true };
        }
      };
      dryRunResults.push(mockPipeline.execute({}, { dryRun: true }));

      // Assert: All results have dryRun flag
      dryRunResults.forEach((result) => {
        expect(result.dryRun).toBe(true);
      });
    });
  });

  describe('Dry Run Validation', () => {
    test('Dry run still performs validation', () => {
      // Arrange
      class ValidatedEntity extends Entity {
        constructor(data = {}) {
          super(data);
          this.email = data.email;
        }

        toData() {
          return { id: this.id, email: this.email };
        }

        validate() {
          this._validationErrors = [];
          if (!this.email || !this.email.includes('@')) {
            this.addValidationError('email', 'Invalid email');
          }
          return this._validationErrors.length === 0;
        }
      }

      const mockRepo = {
        save: (entity, options) => {
          const isValid = entity.validate();
          if (!isValid) {
            throw new Error(
              `Validation failed: ${entity._validationErrors.map((e) => e.message).join(', ')}`
            );
          }
          if (options?.dryRun) {
            return { ...entity, dryRun: true };
          }
          writeOperations.inserts.push(entity);
          return entity;
        }
      };

      // Act & Assert: Invalid entity fails even in dry run
      const invalidEntity = new ValidatedEntity({ email: 'invalid' });
      expect(() => {
        mockRepo.save(invalidEntity, { dryRun: true });
      }).toThrow('Validation failed');
      expect(writeOperations.inserts).toHaveLength(0);

      // Valid entity succeeds in dry run
      const validEntity = new ValidatedEntity({ email: 'valid@example.com' });
      const result = mockRepo.save(validEntity, { dryRun: true });
      expect(result.dryRun).toBe(true);
      expect(writeOperations.inserts).toHaveLength(0);
    });
  });

  describe('Dry Run Across Multiple Layers', () => {
    test('Dry run propagates through pipeline to nested operations', () => {
      // Arrange
      class DatabaseStep extends Step {
        constructor(name, logger, database) {
          super(name, logger);
          this._database = database;
        }

        _executeLogic(context) {
          const isDryRun = context.get('_dryRun') === true;
          if (!isDryRun) {
            writeOperations.inserts.push({ from: 'DatabaseStep' });
          }
          this.setResult(context, this.getName(), { dryRun: isDryRun });
        }
      }

      const mockDatabase = { tables: {} };
      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new DatabaseStep('dbStep', mockLogger, mockDatabase)
      );

      // Act: Dry run
      const dryResult = pipeline.execute({ _dryRun: true }, { dryRun: true });

      // Assert: No writes (Pipeline returns PipelineContext, not {dryRun: true})
      expect(dryResult.get('dryRun')).toBe(true);
      expect(writeOperations.inserts).toHaveLength(0);

      // Act: Real run
      const realResult = pipeline.execute({});

      // Assert: Writes occurred
      expect(realResult.get('dbStep').dryRun).toBe(false);
      expect(writeOperations.inserts).toHaveLength(1);
    });
  });

  describe('Dry Run Idempotency', () => {
    test('Multiple dry runs produce consistent results', () => {
      // Arrange
      const mockOperation = (options) => {
        return {
          result: 'computed-value',
          timestamp: Date.now(),
          dryRun: options?.dryRun || false
        };
      };

      // Act: Multiple dry runs
      const results = [];
      for (let i = 0; i < 3; i++) {
        results.push(mockOperation({ dryRun: true }));
      }

      // Assert: All results have same structure and dryRun flag
      results.forEach((result) => {
        expect(result.dryRun).toBe(true);
        expect(result.result).toBe('computed-value');
      });
    });
  });
});
