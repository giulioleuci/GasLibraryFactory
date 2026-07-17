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

import { Pipeline, Step, PipelineContext, ProducerStep, ConsumerStep } from '@PipelineFramework';
import { ExpressionEngineService } from '@GasExpressionEngineLib';
import { ExceptionService } from '@GasResilienceLib';
import { LoggerService, UtilsService } from '@CoreUtilsLib';
import { MockFactory } from '../../fakes/MockFactory';

describe('Full Stack Integration: Pipeline Execution', () => {
  // Custom Step implementations for testing
  class LoadDataStep extends Step {
    constructor(name, logger, dataSource) {
      super(name, logger);
      this._dataSource = dataSource;
    }

    _executeLogic(context) {
      const data = this._dataSource.getData();
      this.setResult(context, 'loadedData', data);
      this.setResult(context, 'itemCount', data.length);
      return { itemCount: data.length };
    }
  }

  class TransformDataStep extends Step {
    constructor(name, logger, transformFn) {
      super(name, logger);
      this._transformFn = transformFn;
    }

    _executeLogic(context) {
      const data = context.get('loadedData') || [];
      const transformed = data.map(this._transformFn);
      this.setResult(context, 'transformedData', transformed);
      return { transformedCount: transformed.length };
    }
  }

  class FilterDataStep extends Step {
    constructor(name, logger, filterFn) {
      super(name, logger);
      this._filterFn = filterFn;
    }

    _executeLogic(context) {
      const data = context.get('transformedData') || context.get('loadedData') || [];
      const filtered = data.filter(this._filterFn);
      this.setResult(context, 'filteredData', filtered);
      return { filteredCount: filtered.length, removed: data.length - filtered.length };
    }
  }

  class SaveDataStep extends Step {
    constructor(name, logger, dataTarget) {
      super(name, logger);
      this._dataTarget = dataTarget;
    }

    _executeLogic(context) {
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

  class ConditionalStep extends Step {
    constructor(name, logger, condition, expressionEngine) {
      super(name, logger);
      this._condition = condition;
      this._expressionEngine = expressionEngine;
    }

    _executeLogic(context) {
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

    shouldExecute(context) {
      if (this._expressionEngine) {
        const contextData =
          typeof context.getAll === 'function' ? context.getAll() : context.getData();
        return this._expressionEngine.evaluate(this._condition, contextData);
      }
      return true;
    }
  }

  // Producer-Consumer implementations
  class DecisionStep extends ProducerStep {
    constructor(logger, expressionEngine) {
      super('Decision', logger, expressionEngine, {
        outputKey: 'action_type',
        requiredKeys: ['score']
      });
    }

    evaluateRules(context) {
      const score = context.get('score');
      if (this.expressionEngine.evaluate('{{score}} >= 80', { score })) {
        return 'APPROVE';
      }
      return 'REJECT';
    }
  }

  class ActionStep extends ConsumerStep {
    constructor(logger, mockApi) {
      super('Action', logger, {
        inputKey: 'action_type',
        outputKey: 'api_result'
      });
      this._api = mockApi;
    }

    performAction(actionType) {
      return this._api.call(actionType);
    }
  }

  // Test fixtures
  let mocks;
  let mockLogger;
  let mockUtils;
  let mockCache;
  let mockDataSource;
  let mockDataTarget;
  let exceptionService;
  let expressionEngine;

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
      const pipeline = new Pipeline(mockLogger, exceptionService)
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

  describe('Producer-Consumer Pattern', () => {
    test('Producer makes decision and Consumer executes it', () => {
      const mockApi = { call: jest.fn((type) => ({ status: 'ok', type })) };

      const pipeline = new Pipeline(mockLogger)
        .addStep(new DecisionStep(mockLogger, expressionEngine))
        .addStep(new ActionStep(mockLogger, mockApi));

      // Act: Run with high score (Approve)
      const context1 = pipeline.execute({ score: 90 });
      expect(context1.get('action_type')).toBe('APPROVE');
      expect(mockApi.call).toHaveBeenCalledWith('APPROVE');

      // Act: Run with low score (Reject)
      const context2 = pipeline.execute({ score: 50 });
      expect(context2.get('action_type')).toBe('REJECT');
      expect(mockApi.call).toHaveBeenCalledWith('REJECT');
    });
  });

  describe('Conditional Execution', () => {
    test('Steps skip when conditions are not met', () => {
      const pipeline = new Pipeline(mockLogger)
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

  describe('Process Monitor Integration', () => {
    test('Pipeline reports progress to monitor', () => {
      const monitor = mocks.monitor;
      const pipeline = new Pipeline(mockLogger, null, { monitor, jobId: 'job-123' })
        .addStep(new LoadDataStep('load', mockLogger, mockDataSource))
        .addStep(new SaveDataStep('save', mockLogger, mockDataTarget));

      pipeline.execute({});

      expect(monitor.logStepStart).toHaveBeenCalledWith('job-123', 'load');
      expect(monitor.logStepComplete).toHaveBeenCalledWith('job-123', 'load', true);
      expect(monitor.logStepStart).toHaveBeenCalledWith('job-123', 'save');
    });
  });

  describe('Resilience Integration', () => {
    test('Pipeline retries failed steps using ExceptionService', () => {
      let attempts = 0;
      const failingStep = {
        getName: () => 'fail',
        execute: jest.fn(() => {
          attempts++;
          if (attempts < 2) throw new Error('Transient');
          return { success: true };
        }),
        shouldExecute: () => true
      };

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(failingStep);

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
      const logs = [];
      const pipeline = new Pipeline(mockLogger);

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
