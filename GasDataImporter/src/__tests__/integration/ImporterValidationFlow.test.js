// ===================================================================
// FILE: GasDataImporter/src/__tests__/integration/ImporterValidationFlow.test.js
// ===================================================================
// Integration Test 5: Importer-Validation Flow
// Verifies that GasDataImporter validates rows using GasExpressionEngineLib
// ===================================================================

import { ImportEngine } from '../../ImportEngine.js';
import { ExpressionEngineService } from '@GasExpressionEngineLib';
import { MockFactory } from '../../../../test/fakes/MockFactory.js';

/**
 * Test Scenario: Importer-Validation Flow
 *
 * Layers Involved:
 * - Application: GasDataImporter (ImportEngine, Transformer)
 * - Logic: GasExpressionEngineLib (ExpressionEngineService)
 *
 * Objective:
 * Verify that validation rules defined in import recipes are evaluated
 * by GasExpressionEngineLib, and invalid rows are rejected or logged.
 */

describe('Integration Test 5: Importer-Validation Flow', () => {
  let mockLogger;
  let mockDriveService;
  let mockSpreadsheetService;
  let mockDatabaseService;
  let expressionEngine;
  let engine;
  let mockTable;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    mockDriveService = MockFactory.createJestDriveService();
    mockSpreadsheetService = MockFactory.createJestSpreadsheetService();

    mockTable = {
      insertRows: jest.fn(),
      updateRows: jest.fn(),
      upsertRows: jest.fn(),
      getAllRows: jest.fn().mockReturnValue([]),
      _keyField: 'ID'
    };

    mockDatabaseService = {
      getTable: jest.fn().mockReturnValue(mockTable),
      save: jest.fn(),
      tables: {
        Users: mockTable
      }
    };

    // We can use a mock expression engine to have full control over returns
    expressionEngine = {
      evaluate: jest.fn(),
      parse: jest.fn(),
      compile: jest.fn()
    };

    engine = new ImportEngine(
      mockLogger,
      mockDriveService,
      mockSpreadsheetService,
      mockDatabaseService,
      expressionEngine
    );
  });

  describe('Validation Rules', () => {
    test('should reject rows that fail validation expressions', () => {
      const recipe = {
        name: 'Validation Test',
        source: { type: 'SheetById', config: { sheetId: '123' } },
        transform: {
          validation: '{{age}} >= 0 && {{age}} <= 120'
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      // Mock strategy to return one valid and one invalid row
      const mockStrategy = {
        extract: jest.fn().mockReturnValue([
          { age: 25 }, // Valid
          { age: -5 } // Invalid
        ])
      };
      jest.spyOn(engine._sourceFactory, 'createStrategy').mockReturnValue(mockStrategy);

      // Mock expression engine
      expressionEngine.evaluate.mockImplementation((expr, row) => {
        if (expr === '{{age}} >= 0 && {{age}} <= 120') {
          return row.age >= 0 && row.age <= 120;
        }
        return true;
      });

      const result = engine.runImport(recipe);

      expect(result.transform.rowsTransformed).toBe(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('rejected by validation rule: "{{age}} >= 0 && {{age}} <= 120"')
      );
    });

    test('should collect validation error messages', () => {
      const recipe = {
        name: 'Validation Multiple Rows',
        source: { type: 'SheetById', config: { sheetId: '123' } },
        transform: {
          validation: '{{age}} > 0'
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const mockStrategy = {
        extract: jest.fn().mockReturnValue([{ age: -1 }, { age: -2 }, { age: 10 }])
      };
      jest.spyOn(engine._sourceFactory, 'createStrategy').mockReturnValue(mockStrategy);

      expressionEngine.evaluate.mockImplementation((expr, row) => row.age > 0);

      const result = engine.runImport(recipe);

      expect(result.transform.rowsTransformed).toBe(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('2 rows rejected due to validation failures')
      );
    });

    test('should log validation failures', () => {
      const recipe = {
        name: 'Log Validation Test',
        source: { type: 'SheetById', config: { sheetId: '123' } },
        transform: {
          validation: '{{status}} == "active"'
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const mockStrategy = {
        extract: jest.fn().mockReturnValue([{ status: 'inactive' }])
      };
      jest.spyOn(engine._sourceFactory, 'createStrategy').mockReturnValue(mockStrategy);
      expressionEngine.evaluate.mockReturnValue(false);

      engine.runImport(recipe);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('rejected by validation rule: "{{status}} == "active""')
      );
    });
  });

  describe('Validation Integration', () => {
    test('should evaluate multiple validation rules per row', () => {
      const recipe = {
        name: 'Multi-rule Validation',
        source: { type: 'SheetById', config: { sheetId: '123' } },
        transform: {
          validation: ['{{age}} >= 18', '{{status}} == "active"']
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const mockStrategy = {
        extract: jest.fn().mockReturnValue([
          { age: 20, status: 'active' }, // Passes both
          { age: 15, status: 'active' }, // Fails first
          { age: 20, status: 'inactive' } // Fails second
        ])
      };
      jest.spyOn(engine._sourceFactory, 'createStrategy').mockReturnValue(mockStrategy);

      expressionEngine.evaluate.mockImplementation((expr, row) => {
        if (expr === '{{age}} >= 18') return row.age >= 18;
        if (expr === '{{status}} == "active"') return row.status === 'active';
        return true;
      });

      const result = engine.runImport(recipe);

      expect(result.transform.rowsTransformed).toBe(1);
      expect(expressionEngine.evaluate).toHaveBeenCalledTimes(5); // 2 for Row 1 (Passes both), 1 for Row 2 (Fails fast), 2 for Row 3 (Passes first, Fails second)
      // Row 1: age: 20(T), status: "active"(T) -> 2 calls
      // Row 2: age: 15(F) -> 1 call
      // Row 3: age: 20(T), status: "inactive"(F) -> 2 calls
      // TOTAL: 2 + 1 + 2 = 5 calls
    });

    test('should stop processing row after first validation failure', () => {
      const recipe = {
        name: 'Short-circuit Validation',
        source: { type: 'SheetById', config: { sheetId: '123' } },
        transform: {
          validation: ['RULE1', 'RULE2']
        },
        load: { targetTable: 'Users', conflictResolution: 'INSERT_ONLY' }
      };

      const mockStrategy = {
        extract: jest.fn().mockReturnValue([{ val: 1 }])
      };
      jest.spyOn(engine._sourceFactory, 'createStrategy').mockReturnValue(mockStrategy);

      expressionEngine.evaluate.mockReturnValue(false); // Fails RULE1 immediately

      engine.runImport(recipe);

      expect(expressionEngine.evaluate).toHaveBeenCalledWith('RULE1', expect.anything());
      expect(expressionEngine.evaluate).not.toHaveBeenCalledWith('RULE2', expect.anything());
    });
  });

  describe('Valid Data Flow', () => {
    test('should allow valid rows to proceed to loading', () => {
      // 1. Create recipe with validation
      const recipe = {
        name: 'Process Valid Row',
        source: {
          type: 'SheetById',
          config: { sheetId: 'source-123', hasHeaders: true }
        },
        transform: {
          mapping: { Name: 'NAME', Age: 'AGE' },
          validation: '{{AGE}} >= 18'
        },
        load: {
          targetTable: 'Users',
          conflictResolution: 'INSERT_ONLY',
          conflictKey: 'ID'
        }
      };

      // 2. Mock source strategy to return data
      const mockStrategy = {
        extract: jest.fn().mockReturnValue([
          { Name: 'John Doe', Age: 25 }, // Valid
          { Name: 'Jane Doe', Age: 15 } // Invalid
        ])
      };
      jest.spyOn(engine._sourceFactory, 'createStrategy').mockReturnValue(mockStrategy);

      expressionEngine.evaluate.mockImplementation((expr, row) => row.AGE >= 18);

      // 3. Run import
      const result = engine.runImport(recipe);

      // 4. Verify result
      expect(result.success).toBe(true);
      expect(result.extract.rowsExtracted).toBe(2);
      expect(result.transform.rowsTransformed).toBe(1); // Only 1 row should pass validation

      // 5. Verify row reached loader/database
      // Result contains stats from loader, and mockDatabaseService was used.
      // But we need to verify if Loader correctly called insertRows.
      // Loader is internal to engine, it uses databaseService.
      expect(mockTable.insertRows).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ NAME: 'John Doe', AGE: 25 })])
      );
    });
  });
});
