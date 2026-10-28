import type { PipelineContext, PipelineLogger } from '@PipelineFramework';
interface Item {
  id: number;
  name: string;
  value: number;
  active: boolean;
}
interface SaveResult {
  success: boolean;
  savedCount: number;
}
interface PipelineState {
  loadedData: Item[];
  transformedData: Item[];
  filteredData: Item[];
  itemCount: number;
  saveResult: SaveResult;
  conditionalExecuted: boolean;
}
type TestPipelineContext = PipelineContext<PipelineState> & {
  getAll?: () => Partial<PipelineState>;
};
import { jest } from '@jest/globals';
/**
 * Integration Test: Full Stack - Pipeline Execution
 *
 * Layers Tested: PipelineFramework → Steps → GoogleApiWrapper Services → GasResilienceLib → CoreUtilsLib
 *
 * Purpose: Verify complete pipeline execution flow from orchestration
 * through step execution, service calls, and error recovery.
 *
 * @file test/__tests__/integration/FullStack_PipelineExecution.test.js
 */

import { Pipeline, Step } from '@PipelineFramework';
import { ExpressionEngineService } from '@GasExpressionEngineLib';
import { ExceptionService } from '@GasResilienceLib';
import { LoggerService, UtilsService } from '@CoreUtilsLib';
import { MockFactory } from '../../fakes/MockFactory.js';

describe('Full Stack Integration: Pipeline Execution', () => {
  // Custom Step implementations for testing
  class LoadDataStep extends Step<PipelineState> {
    declare _dataSource: { getData(): Item[] };
    constructor(name: string, logger: PipelineLogger, dataSource: LoadDataStep['_dataSource']) {
      super(name, logger);
      this._dataSource = dataSource;
    }

    _executeLogic(context: TestPipelineContext) {
      const data = this._dataSource.getData();
      this.setResult(context, 'loadedData', data);
      this.setResult(context, 'itemCount', data.length);
      return { itemCount: data.length };
    }
  }

  class TransformDataStep extends Step<PipelineState> {
    declare _transformFn: (item: Item, index: number, array: Item[]) => Item;
    constructor(
      name: string,
      logger: PipelineLogger,
      transformFn: TransformDataStep['_transformFn']
    ) {
      super(name, logger);
      this._transformFn = transformFn;
    }

    _executeLogic(context: TestPipelineContext) {
      const data = context.get('loadedData') || [];
      const transformed = data.map(this._transformFn);
      this.setResult(context, 'transformedData', transformed);
      return { transformedCount: transformed.length };
    }
  }

  class FilterDataStep extends Step<PipelineState> {
    declare _filterFn: (item: Item) => unknown;
    constructor(name: string, logger: PipelineLogger, filterFn: FilterDataStep['_filterFn']) {
      super(name, logger);
      this._filterFn = filterFn;
    }

    _executeLogic(context: TestPipelineContext) {
      const data = context.get('transformedData') || context.get('loadedData') || [];
      const filtered = data.filter(this._filterFn);
      this.setResult(context, 'filteredData', filtered);
      return { filteredCount: filtered.length, removed: data.length - filtered.length };
    }
  }

  class SaveDataStep extends Step<PipelineState> {
    declare _dataTarget: { saveData(data: Item[]): SaveResult };
    constructor(name: string, logger: PipelineLogger, dataTarget: SaveDataStep['_dataTarget']) {
      super(name, logger);
      this._dataTarget = dataTarget;
    }

    _executeLogic(context: TestPipelineContext) {
      const data =
        context.get('filteredData') ||
        context.get('transformedData') ||
        context.get('loadedData') ||
        [];
      const result = this._dataTarget.saveData(data);
      this.setResult(context, 'saveResult', result);
      return { savedCount: data.length, success: result.success };
    }
  }

  class ConditionalStep extends Step<PipelineState> {
    declare _condition: string;
    declare _expressionEngine: Pick<ExpressionEngineService, 'evaluate'> | undefined;
    constructor(
      name: string,
      logger: PipelineLogger,
      condition: string,
      expressionEngine?: Pick<ExpressionEngineService, 'evaluate'>
    ) {
      super(name, logger);
      this._condition = condition;
      this._expressionEngine = expressionEngine;
    }

    _executeLogic(context: TestPipelineContext) {
      if (this._expressionEngine) {
        const contextData =
          typeof context.getAll === 'function' ? context.getAll() : context.getData();
        const shouldExecute = this._expressionEngine.evaluate(this._condition, contextData);
        if (!shouldExecute) {
          return { skipped: true, reason: 'Condition not met' };
        }
      }

      this.setResult(context, 'conditionalExecuted', true);
      return { executed: true };
    }

    shouldExecute(context: TestPipelineContext) {
      if (this._expressionEngine) {
        const contextData =
          typeof context.getAll === 'function' ? context.getAll() : context.getData();
        return this._expressionEngine.evaluate(this._condition, contextData);
      }
      return true;
    }
  }

  // Test fixtures
  let mocks: ReturnType<typeof MockFactory.createAllJest>;
  let mockLogger: ReturnType<typeof MockFactory.createAllJest>['logger'];
  let mockUtils: ReturnType<typeof MockFactory.createAllJest>['utils'];
  let mockCache: ReturnType<typeof MockFactory.createAllJest>['cache'];
  let mockDataSource: { getData: jest.Mock<() => Item[]> };
  let mockDataTarget: { saveData: jest.Mock<(data: Item[]) => SaveResult> };
  let exceptionService: ReturnType<typeof MockFactory.createAllJest>['exceptionService'];
  let expressionEngine: ExpressionEngineService;

  beforeEach(() => {
    global.resetGasMocks();
    mocks = MockFactory.createAllJest();

    // Layer 0: CoreUtilsLib
    mockLogger = mocks.logger;
    mockUtils = mocks.utils;
    mockCache = mocks.cache;

    // Mock data source
    mockDataSource = {
      getData: jest.fn(() => [
        { id: 1, name: 'Item A', value: 100, active: true },
        { id: 2, name: 'Item B', value: 200, active: false }
      ])
    };

    // Mock data target
    mockDataTarget = {
      saveData: jest.fn((data) => ({ success: true, savedCount: data.length }))
    };

    // Layer 1: GasResilienceLib
    exceptionService = mocks.exceptionService;

    // Layer 3: GasExpressionEngineLib
    expressionEngine = new ExpressionEngineService({ logger: mockLogger });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Pipeline Flow', () => {
    test('Pipeline executes steps in sequence through all layers', () => {
      const pipeline = new Pipeline<PipelineState>(mockLogger, exceptionService)
        .addStep(new LoadDataStep('load', mockLogger, mockDataSource))
        .addStep(new FilterDataStep('filter', mockLogger, (item) => item.active))
        .addStep(new SaveDataStep('save', mockLogger, mockDataTarget));

      const context = pipeline.execute({});

      expect(context.getSummary().totalSteps).toBe(3);
      expect(mockDataSource.getData).toHaveBeenCalled();
      expect(mockDataTarget.saveData).toHaveBeenCalled();

      const savedData = mockDataTarget.saveData.mock.calls[0][0];
      expect(savedData).toHaveLength(1);
      expect(savedData[0].name).toBe('Item A');
    });
  });

  describe('Conditional Execution', () => {
    test('Steps skip when conditions are not met', () => {
      const pipeline = new Pipeline<PipelineState>(mockLogger)
        .addStep(new LoadDataStep('load', mockLogger, mockDataSource))
        // This step should execute (itemCount > 0)
        .addStep(new ConditionalStep('step1', mockLogger, 'itemCount > 0', expressionEngine))
        // This step should be skipped (itemCount > 10)
        .addStep(new ConditionalStep('step2', mockLogger, 'itemCount > 10', expressionEngine));

      const context = pipeline.execute({});

      expect(context.getSummary().skippedSteps).toBe(1);
      const history = context.getSummary().history;
      expect(history[1].status).toBe('completed');
      expect(history[2].status).toBe('skipped');
    });
  });

  describe('Resilience Integration', () => {
    test('Pipeline retries failed steps using ExceptionService', () => {
      let attempts = 0;
      const failingStep = {
        getName: () => 'fail',
        execute: jest.fn(() => {
          attempts++;
          if (attempts < 2) {
            throw new Error('Transient');
          }
          return { success: true };
        }),
        shouldExecute: () => true
      };

      const pipeline = new Pipeline<PipelineState>(mockLogger, exceptionService).addStep(
        failingStep
      );

      // Configure exceptionService to actually retry for this test
      exceptionService.executeWithRetry.mockImplementation((fn) => {
        try {
          return fn();
        } catch (e) {
          return fn();
        }
      });

      pipeline.execute({});
      expect(attempts).toBe(2);
    });
  });

  describe('Complex Lifecycle Integration', () => {
    test('Lifecycle hooks are called in order', () => {
      const logs: string[] = [];
      const pipeline = new Pipeline<PipelineState>(mockLogger);

      pipeline.beforeStep((step) => logs.push(`before:${step.getName()}`));
      pipeline.afterStep((step) => logs.push(`after:${step.getName()}`));

      const step = {
        getName: () => 'test',
        execute: jest.fn(() => {
          logs.push('execute');
          return { success: true };
        }),
        shouldExecute: () => true
      };

      pipeline.addStep(step).execute({});

      expect(logs).toEqual(['before:test', 'execute', 'after:test']);
    });
  });
});
