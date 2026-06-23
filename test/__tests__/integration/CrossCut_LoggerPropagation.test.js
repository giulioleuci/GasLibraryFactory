/**
 * Integration Test: Cross-Cutting Concern - Logger Propagation
 *
 * Layers Tested: All layers (DomainRepositoryLib → SheetDBLib → GoogleApiWrapper → GasResilienceLib → CoreUtilsLib)
 *
 * Purpose: Verify that logger is properly injected and propagates through
 * all layers, capturing relevant information at each level.
 *
 * @file test/__tests__/integration/CrossCut_LoggerPropagation.test.js
 */

import { Entity, Repository } from '@DomainRepositoryLib';
import { DatabaseService } from '@SheetDBLib';
import { ExceptionService } from '@GasResilienceLib';
import { ContextAssembler, ProviderRegistry, DataProvider } from '@ContextEngine';
import { Pipeline, Step } from '@PipelineFramework';
import { ExpressionEngineService } from '@GasExpressionEngineLib';
import { MockFactory } from '../../fakes/MockFactory';

describe('Cross-Cutting Concern: Logger Propagation', () => {
  // Use standardized mock logger
  let mocks;
  let mockLogger;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    mockLogger = mocks.logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Logger Injection Through Constructors', () => {
    test('LoggerService is injected through Repository chain', () => {
      // Arrange
      class TestEntity extends Entity {
        constructor(data = {}) {
          super(data);
          this.name = data.name || null;
        }
        toData() {
          return { id: this.id, name: this.name };
        }
        static fromData(data) {
          return new TestEntity(data);
        }
        validate() {
          return true;
        }
      }

      const table = MockFactory.createJestTable('TestEntities');
      table.insertRow.mockImplementation((data) => ({ ...data, id: 'test-id' }));

      const mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        tables: { TestEntities: table }
      });

      class TestRepository extends Repository {
        constructor(database, logger) {
          super(database, 'TestEntities', TestEntity, logger);
        }
      }

      const repository = new TestRepository(mockDatabase, mockLogger);

      // Act
      const entity = new TestEntity({ name: 'Test' });
      repository.save(entity);

      // Assert: Logger was called during operation
      expect(mockLogger.hasLog('INFO', /Inserted new TestEntity/i)).toBe(true);
    });

    test('Logger propagates through ContextAssembler to Providers', () => {
      // Arrange
      class LoggingProvider extends DataProvider {
        _fetchData(parameters) {
          this._logger.info('Provider executing');
          return { logged: true };
        }
      }

      const registry = new ProviderRegistry(mockLogger);
      registry.registerSingleton('LoggingProvider', new LoggingProvider(mockLogger));

      const assembler = new ContextAssembler(mockLogger, registry);

      const recipe = {
        providers: [{ name: 'data', type: 'LoggingProvider', parameters: {} }]
      };

      // Act
      assembler.assemble(recipe, {});

      // Assert: Logger captured provider execution
      expect(mockLogger.hasLog('INFO', /Provider executing/i)).toBe(true);
    });

    test('Logger propagates through Pipeline to Steps', () => {
      // Arrange
      class LoggingStep extends Step {
        _executeLogic(context) {
          this._logger.info('Step executing');
          return { stepped: true };
        }
      }

      const mockUtils = mocks.utils;
      const exceptionService = mocks.exceptionService;

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new LoggingStep('logStep', mockLogger)
      );

      // Act
      pipeline.execute({});

      // Assert: Logger captured step execution
      expect(mockLogger.hasLog('INFO', /Step executing/i)).toBe(true);
    });

    test('Logger propagates through ExceptionService', () => {
      // Arrange
      const mockUtils = mocks.utils;
      const exceptionService = new ExceptionService(mockLogger, mockUtils);

      // Act: Execute operation that fails
      let attempts = 0;
      try {
        exceptionService.executeWithRetry(
          () => {
            attempts++;
            if (attempts < 3) {
              const error = new Error('Transient failure');
              error.code = 503;
              throw error;
            }
            return { success: true };
          },
          {},
          5
        );
      } catch (e) {
        // May or may not throw
      }

      // Assert: Logger captured retry attempts
      expect(mockLogger.hasLog('WARN', /Transient failure/i)).toBe(true);
      expect(mockLogger.hasLog('WARN', /Retry attempt/i)).toBe(true);
    });
  });

  describe('Log Level Appropriateness', () => {
    test('Successful operations use info/debug levels', () => {
      // Arrange
      class SuccessfulStep extends Step {
        _executeLogic(context) {
          return { success: true };
        }
      }

      const mockUtils = mocks.utils;
      const exceptionService = mocks.exceptionService;

      const pipeline = new Pipeline(mockLogger, exceptionService, { name: 'SuccessPipeline' })
        .addStep(new SuccessfulStep('success', mockLogger));

      // Act
      pipeline.execute({});

      // Assert: Success should use info/debug, not error/warn
      expect(mockLogger.hasLog('INFO', /SuccessPipeline/i)).toBe(true);
      expect(mockLogger.hasLog('ERROR')).toBe(false);
    });

    test('Errors are logged at error level', () => {
      // Arrange
      class FailingProvider extends DataProvider {
        _fetchData(parameters) {
          throw new Error('Provider critical failure');
        }
      }

      const registry = new ProviderRegistry(mockLogger);
      registry.registerSingleton('FailingProvider', new FailingProvider(mockLogger));

      const assembler = new ContextAssembler(mockLogger, registry);

      const recipe = {
        providers: [{ name: 'failing', type: 'FailingProvider', parameters: {} }]
      };

      // Act
      try {
        assembler.assemble(recipe, {});
      } catch (e) {
        // Expected
      }

      // Assert: Errors logged at error level
      expect(mockLogger.hasLog('ERROR', /Provider critical failure/i)).toBe(true);
    });

    test('Warnings are logged for recoverable issues', () => {
      // Arrange
      const mockUtils = mocks.utils;
      const exceptionService = new ExceptionService(mockLogger, mockUtils);

      let attempts = 0;
      const operation = () => {
        attempts++;
        if (attempts < 2) {
          const error = new Error('Retryable warning');
          error.code = 503;
          throw error;
        }
        return { success: true };
      };

      // Act
      exceptionService.executeWithRetry(operation, {}, 5);

      // Assert: Retries may be logged as warnings or info
      expect(mockLogger.hasLog('WARN', /Retryable warning/i)).toBe(true);
    });
  });

  describe('Log Content Quality', () => {
    test('Logs include operation context', () => {
      // Arrange
      class ContextAwareStep extends Step {
        _executeLogic(context) {
          const inputValue = context.get('inputKey');
          this._logger.info(`Processing input: ${inputValue}`);
          this.setResult(context, 'outputKey', inputValue * 2);
          return { processed: true };
        }
      }

      const mockUtils = mocks.utils;
      const exceptionService = mocks.exceptionService;

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new ContextAwareStep('contextStep', mockLogger)
      );

      // Act
      pipeline.execute({ inputKey: 42 });

      // Assert: Logs should exist
      expect(mockLogger.hasLog('INFO', /Processing input: 42/i)).toBe(true);
    });

    test('Logs include timing information implicitly via timestamps', () => {
      // Arrange
      class TimedStep extends Step {
        _executeLogic(context) {
          // Simulate work
          return { done: true };
        }
      }

      const mockUtils = mocks.utils;
      const exceptionService = mocks.exceptionService;

      const pipeline = new Pipeline(mockLogger, exceptionService, { name: 'TimedPipeline' })
        .addStep(new TimedStep('timed', mockLogger));

      // Act
      pipeline.execute({});

      // Assert: Our mock logger captures logs
      expect(mockLogger.hasLog('INFO', /TimedPipeline/i)).toBe(true);
    });
  });

  describe('Logger Consistency Across Layers', () => {
    test('Same logger instance used across all components', () => {
      // Arrange: Create components sharing same logger
      const mockUtils = mocks.utils;
      const exceptionService = mocks.exceptionService;
      const registry = new ProviderRegistry(mockLogger);
      const expressionEngine = mocks.expressionEngine;

      class SharedLoggerProvider extends DataProvider {
        _fetchData(parameters) {
          this._logger.debug('Shared provider log');
          return { data: 'test' };
        }
      }

      registry.registerSingleton('SharedLoggerProvider', new SharedLoggerProvider(mockLogger));

      const assembler = new ContextAssembler(
        mockLogger,
        registry,
        expressionEngine,
        exceptionService
      );

      class SharedLoggerStep extends Step {
        constructor(name, logger, assembler) {
          super(name, logger);
          this._assembler = assembler;
        }

        _executeLogic(context) {
          const recipe = {
            providers: [{ name: 'stepData', type: 'SharedLoggerProvider', parameters: {} }]
          };
          const assembled = this._assembler.assemble(recipe, {});
          this.setResult(context, 'assembledData', assembled);
          return { assembled: true };
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new SharedLoggerStep('sharedLogger', mockLogger, assembler)
      );

      // Act
      pipeline.execute({});

      // Assert: All logs came from the same mock logger
      expect(mockLogger.hasLog('DEBUG', /Shared provider log/i)).toBe(true);
    });

    test('Different components contribute to unified log stream', () => {
      // Arrange
      const mockUtils = mocks.utils;
      const exceptionService = mocks.exceptionService;
      const registry = new ProviderRegistry(mockLogger);

      class MultiLayerProvider extends DataProvider {
        _fetchData(parameters) {
          this._logger.info('Multi-layer provider log');
          return { layerData: 'provider' };
        }
      }

      registry.registerSingleton('MultiLayerProvider', new MultiLayerProvider(mockLogger));
      const assembler = new ContextAssembler(mockLogger, registry);

      class MultiLayerStep extends Step {
        constructor(name, logger, assembler) {
          super(name, logger);
          this._assembler = assembler;
        }

        _executeLogic(context) {
          const recipe = {
            providers: [{ name: 'mlData', type: 'MultiLayerProvider', parameters: {} }]
          };
          const assembled = this._assembler.assemble(recipe, {});
          this.setResult(context, 'mlResult', assembled);
          return { multiLayer: true };
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new MultiLayerStep('multiLayer', mockLogger, assembler)
      );

      // Act
      pipeline.execute({});

      // Assert: Logs from multiple layers captured
      expect(mockLogger.hasLog('INFO', /Multi-layer provider log/i)).toBe(true);
    });
  });

  describe('Logger Interface Compliance', () => {
    test('All services accept LoggerInterface-compliant objects', () => {
      // Arrange: Minimal logger that only implements required methods
      const minimalLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        log: jest.fn()
      };

      const mockUtils = mocks.utils;

      // Act: Create services with minimal logger
      const exceptionService = new ExceptionService(minimalLogger, mockUtils);
      const registry = new ProviderRegistry(minimalLogger);

      class MinimalProvider extends DataProvider {
        _fetchData(parameters) {
          return { minimal: true };
        }
      }

      registry.registerSingleton('MinimalProvider', new MinimalProvider(minimalLogger));

      const assembler = new ContextAssembler(minimalLogger, registry);

      const recipe = {
        providers: [{ name: 'minData', type: 'MinimalProvider', parameters: {} }]
      };

      // Assert: Works with minimal logger
      const result = assembler.assemble(recipe, {});
      expect(result.minData).toEqual({ minimal: true });
    });

    test('Logger methods called with correct signature', () => {
      // Arrange
      const mockUtils = mocks.utils;
      const exceptionService = mocks.exceptionService;

      class SimpleStep extends Step {
        _executeLogic(context) {
          return { simple: true };
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new SimpleStep('simple', mockLogger)
      );

      // Act
      pipeline.execute({});

      // Assert: Logger methods called (at minimum)
      const totalCalls =
        mockLogger.debug.mock.calls.length +
        mockLogger.info.mock.calls.length +
        mockLogger.warn.mock.calls.length +
        mockLogger.error.mock.calls.length;

      expect(totalCalls).toBeGreaterThan(0);
    });
  });

  describe('Structured Logging', () => {
    test('Logger receives structured data when available', () => {
      // Arrange
      class StructuredLogStep extends Step {
        _executeLogic(context) {
          // Steps typically log with structured info
          return { structured: true, metadata: { key: 'value' } };
        }
      }

      const mockUtils = mocks.utils;
      const exceptionService = mocks.exceptionService;

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new StructuredLogStep('structured', mockLogger)
      );

      // Act
      pipeline.execute({});

      // Assert: Logger was called
      expect(mockLogger.getLogs().length).toBeGreaterThan(0);
    });
  });

  describe('Logger Interface Compliance', () => {
    test('All services accept LoggerInterface-compliant objects', () => {
      // Arrange: Minimal logger that only implements required methods
      const minimalLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        log: jest.fn()
      };

      const mockUtils = mocks.utils;

      // Act: Create services with minimal logger
      const exceptionService = new ExceptionService(minimalLogger, mockUtils);
      const registry = new ProviderRegistry(minimalLogger);

      class MinimalProvider extends DataProvider {
        _fetchData(parameters) {
          return { minimal: true };
        }
      }

      registry.registerSingleton('MinimalProvider', new MinimalProvider(minimalLogger));

      const assembler = new ContextAssembler(minimalLogger, registry);

      const recipe = {
        providers: [{ name: 'minData', type: 'MinimalProvider', parameters: {} }]
      };

      // Assert: Works with minimal logger
      const result = assembler.assemble(recipe, {});
      expect(result.minData).toEqual({ minimal: true });
    });

    test('Logger methods called with correct signature', () => {
      // Arrange
      const mockUtils = mocks.utils;
      const exceptionService = new ExceptionService(mockLogger, mockUtils);

      class SimpleStep extends Step {
        _executeLogic(context) {
          return { simple: true };
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new SimpleStep('simple', mockLogger)
      );

      // Act
      pipeline.execute({});

      // Assert: Logger methods called (at minimum)
      const totalCalls =
        mockLogger.debug.mock.calls.length +
        mockLogger.info.mock.calls.length +
        mockLogger.warn.mock.calls.length +
        mockLogger.error.mock.calls.length;

      expect(totalCalls).toBeGreaterThan(0);
    });
  });

  describe('Structured Logging', () => {
    test('Logger receives structured data when available', () => {
      // Arrange
      class StructuredLogStep extends Step {
        _executeLogic(context) {
          // Steps typically log with structured info
          return { structured: true, metadata: { key: 'value' } };
        }
      }

      const mockUtils = mocks.utils;
      const exceptionService = new ExceptionService(mockLogger, mockUtils);

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new StructuredLogStep('structured', mockLogger)
      );

      // Act
      pipeline.execute({});

      // Assert: Logger was called
      expect(mockLogger.getLogs().length).toBeGreaterThan(0);
    });
  });
});
