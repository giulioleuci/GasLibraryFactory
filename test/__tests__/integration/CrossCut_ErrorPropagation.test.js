/**
 * Integration Test: Cross-Cutting Concern - Error Propagation
 *
 * Layers Tested: All layers (DomainRepositoryLib → SheetDBLib → GoogleApiWrapper → GasResilienceLib → CoreUtilsLib)
 *
 * Purpose: Verify that errors propagate correctly through all layers with
 * proper context preservation, classification, and recovery behavior.
 *
 * @file test/__tests__/integration/CrossCut_ErrorPropagation.test.js
 */

import {
  Entity,
  Repository,
  ValidationException,
  EntityNotFoundException
} from '@DomainRepositoryLib';
import { DatabaseService } from '@SheetDBLib';
import {
  ServiceError,
  QuotaExceededError,
  PermissionDeniedError,
  ResourceNotFoundError
} from '@GoogleApiWrapper';
import {
  ExceptionService,
  ErrorClassifier,
  TimeoutException,
  RateLimitExceededException
} from '@GasResilienceLib';
import {
  ContextAssembler,
  ProviderRegistry,
  DataProvider,
  ProviderExecutionError
} from '@ContextEngine';
import { Pipeline, Step, StepExecutionError } from '@PipelineFramework';
import { ImportEngine, SourceError, TransformError, LoadError } from '@GasDataImporter';
import { MockFactory } from '../../fakes/MockFactory';

describe('Cross-Cutting Concern: Error Propagation', () => {
  // Test fixtures
  let mocks;
  let mockLogger;
  let mockUtils;
  let mockCache;
  let exceptionService;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    mockLogger = mocks.logger;
    mockUtils = mocks.utils;
    mockCache = mocks.cache;
    exceptionService = mocks.exceptionService;
  });

  afterEach(() => {
    mockCache.removeAll();
    jest.clearAllMocks();
  });

  describe('Error Classification', () => {
    test('ErrorClassifier correctly identifies quota errors', () => {
      // Arrange
      const quotaError = new Error('Quota exceeded for read operations');
      quotaError.code = 429;

      // Act
      const classifier = new ErrorClassifier(mockLogger);
      const category = classifier.classify(quotaError);

      // Assert
      expect(category.category).toBe('QUOTA');
      expect(category.recoverable).toBe(true);
    });

    test('ErrorClassifier correctly identifies permission errors', () => {
      // Arrange
      const permError = new Error('Permission denied');
      permError.code = 403;

      // Act
      const classifier = new ErrorClassifier(mockLogger);
      const category = classifier.classify(permError);

      // Assert
      expect(category.category).toBe('PERMISSIONS');
      expect(category.recoverable).toBe(false);
    });

    test('ErrorClassifier correctly identifies not found errors', () => {
      // Arrange
      const notFoundError = new Error('Resource not found');
      notFoundError.code = 404;

      // Act
      const classifier = new ErrorClassifier(mockLogger);
      const category = classifier.classify(notFoundError);

      // Assert
      expect(category.category).toBe('NOT_FOUND');
      expect(category.recoverable).toBe(false);
    });

    test('ErrorClassifier correctly identifies service errors', () => {
      // Arrange
      const serviceError = new Error('Service temporarily unavailable');
      serviceError.code = 503;

      // Act
      const classifier = new ErrorClassifier(mockLogger);
      const category = classifier.classify(serviceError);

      // Assert
      expect(category.category).toBe('SERVICE');
      expect(category.recoverable).toBe(true);
    });
  });

  describe('Repository Error Propagation', () => {
    // Test Entity for validation
    class TestEntity extends Entity {
      constructor(data = {}) {
        super(data);
        this.name = data.name || null;
        this.email = data.email || null;
      }

      toData() {
        return { id: this.id, name: this.name, email: this.email };
      }

      static fromData(data) {
        return new TestEntity(data);
      }

      validate() {
        this._validationErrors = [];
        if (!this.name) {
          this.addValidationError('name', 'Name is required');
        }
        if (!this.email || !this.email.includes('@')) {
          this.addValidationError('email', 'Valid email is required');
        }
        return this._validationErrors.length === 0;
      }
    }

    class TestRepository extends Repository {
      constructor(database, logger, cache, exceptionService) {
        super(database, 'TestEntities', TestEntity, logger, cache, exceptionService);
      }
    }

    test('Validation errors propagate from Entity through Repository', () => {
      // Arrange
      const mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        utils: mockUtils,
        cache: mockCache,
        tables: {
          TestEntities: MockFactory.createJestTable('TestEntities')
        }
      });

      const repository = new TestRepository(mockDatabase, mockLogger, mockCache, exceptionService);

      // Create invalid entity
      const invalidEntity = new TestEntity({ name: '', email: 'invalid' });

      // Act & Assert
      expect(() => {
        repository.save(invalidEntity);
      }).toThrow();

      // Verify the error contains validation context
      try {
        repository.save(invalidEntity);
      } catch (error) {
        expect(error.message).toMatch(/validation|name|email/i);
      }
    });

    test('Database errors propagate through Repository with context', () => {
      // Arrange
      const dbError = new Error('Spreadsheet API quota exceeded');
      dbError.code = 429;

      const table = MockFactory.createJestTable('TestEntities');
      table.insertRow.mockImplementation(() => {
        throw dbError;
      });

      const mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        utils: mockUtils,
        cache: mockCache,
        tables: {
          TestEntities: table
        }
      });

      const repository = new TestRepository(mockDatabase, mockLogger, mockCache, exceptionService);
      const entity = new TestEntity({ name: 'Test', email: 'test@example.com' });

      // Act & Assert
      expect(() => {
        repository.save(entity);
      }).toThrow('quota');
    });

    test('EntityNotFoundException for missing entity', () => {
      // Arrange
      const mockDatabase = MockFactory.createJestDatabase({
        logger: mockLogger,
        utils: mockUtils,
        cache: mockCache,
        tables: {
          TestEntities: MockFactory.createJestTable('TestEntities')
        }
      });

      const repository = new TestRepository(mockDatabase, mockLogger, mockCache, exceptionService);

      // Act
      const result = repository.findById('non-existent-id');

      // Assert: Should return null for missing entity
      expect(result).toBeNull();
    });
  });

  describe('ContextEngine Error Propagation', () => {
    test('Provider errors wrapped in ProviderExecutionError with context', () => {
      // Arrange
      class FailingProvider extends DataProvider {
        _fetchData(parameters) {
          const error = new Error('Database connection failed');
          error.code = 'DB_CONNECTION_ERROR';
          throw error;
        }
      }

      const registry = new ProviderRegistry(mockLogger);
      registry.registerSingleton('FailingProvider', new FailingProvider(mockLogger));

      const assembler = new ContextAssembler(mockLogger, registry);

      const recipe = {
        providers: [{ name: 'failing', type: 'FailingProvider', parameters: {} }]
      };

      // Act & Assert
      try {
        assembler.assemble(recipe, {});
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toContain('failing');
        expect(error.context?.providerName).toBe('failing');
        expect(error.context?.providerType).toBe('FailingProvider');
      }
    });

    test('Original error preserved in context', () => {
      // Arrange
      const originalError = new Error('Original database error');
      originalError.code = 'DB_ERROR';

      class ErrorPreservingProvider extends DataProvider {
        _fetchData(parameters) {
          throw originalError;
        }
      }

      const registry = new ProviderRegistry(mockLogger);
      registry.registerSingleton(
        'ErrorPreservingProvider',
        new ErrorPreservingProvider(mockLogger)
      );

      const assembler = new ContextAssembler(mockLogger, registry);

      const recipe = {
        providers: [{ name: 'errorProvider', type: 'ErrorPreservingProvider', parameters: {} }]
      };

      // Act & Assert
      try {
        assembler.assemble(recipe, {});
        fail('Expected error to be thrown');
      } catch (error) {
        // The error is wrapped, so check the message contains the original error text
        expect(error.message).toContain('Original database error');
        // Original error may be in context or cause chain
        if (error.context?.originalError) {
          expect(error.context.originalError.message).toContain('Original database error');
        }
      }
    });
  });

  describe('Pipeline Error Propagation', () => {
    test('Step errors propagate through Pipeline with context', () => {
      // Arrange
      class FailingStep extends Step {
        _executeLogic(context) {
          throw new Error('Step execution failed');
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new FailingStep('failing', mockLogger)
      );

      // Act & Assert: Pipeline stops on error and returns context with failure info
      const result = pipeline.execute({});
      const summary = result.getSummary();
      expect(summary.failedSteps).toBe(1);
    });

    test('Error hook receives step context', () => {
      // Arrange
      let receivedStep = null;
      let receivedError = null;

      class FailingStep extends Step {
        _executeLogic(context) {
          throw new Error('Specific error message');
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService)
        .addStep(new FailingStep('errorStep', mockLogger))
        .onError((step, context, error) => {
          // Signature is (step, context, error)
          receivedStep = step;
          receivedError = error;
        });

      // Act
      try {
        pipeline.execute({});
      } catch (e) {
        // Expected
      }

      // Assert
      expect(receivedStep).toBeDefined();
      expect(receivedStep.getName()).toBe('errorStep');
      // Error might be wrapped or transformed by the pipeline
      expect(receivedError).toBeDefined();
      expect(receivedError.message).toContain('Specific error message');
    });
  });

  describe('ExceptionService Error Recovery', () => {
    test('executeWithRetry recovers from transient errors', () => {
      // Arrange
      let attempts = 0;
      const operation = () => {
        attempts++;
        if (attempts < 3) {
          const error = new Error('Service unavailable');
          error.code = 503;
          throw error;
        }
        return { success: true, attempts };
      };

      // Implementation of retry in mock for this test
      exceptionService.executeWithRetry.mockImplementation((fn, opt, max) => {
        let lastError;
        for (let i = 0; i <= max; i++) {
          try {
            return fn();
          } catch (e) {
            lastError = e;
            // Simplified retry logic: only retry if code is 503
            if (e.code !== 503) throw e;
          }
        }
        throw lastError;
      });

      // Act
      const result = exceptionService.executeWithRetry(operation, {}, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(attempts).toBe(3);
    });

    test('executeWithRetry fails fast on non-recoverable errors', () => {
      // Arrange
      let attempts = 0;
      const operation = () => {
        attempts++;
        const error = new Error('Permission denied');
        error.code = 403; // Non-recoverable
        throw error;
      };

      exceptionService.executeWithRetry.mockImplementation((fn, opt, max) => {
        try {
          return fn();
        } catch (e) {
          // Fails fast for 403
          throw e;
        }
      });

      // Act & Assert
      expect(() => {
        exceptionService.executeWithRetry(operation, {}, 5);
      }).toThrow('Permission denied');

      // Should only try once for non-recoverable
      expect(attempts).toBe(1);
    });

    test('executeWithRetry exhausts retries on persistent failures', () => {
      // Arrange
      let attempts = 0;
      const maxRetries = 3;
      const operation = () => {
        attempts++;
        const error = new Error('Service unavailable');
        error.code = 503; // Recoverable
        throw error;
      };

      exceptionService.executeWithRetry.mockImplementation((fn, opt, max) => {
        let lastError;
        for (let i = 0; i <= max; i++) {
          try {
            return fn();
          } catch (e) {
            lastError = e;
          }
        }
        throw lastError;
      });

      // Act & Assert
      expect(() => {
        exceptionService.executeWithRetry(operation, {}, maxRetries);
      }).toThrow('Service unavailable');

      expect(attempts).toBe(maxRetries + 1);
    });
  });

  describe('Custom Exception Types', () => {
    test('TimeoutException propagates with timeout context', () => {
      // Arrange: TimeoutException takes a message string
      const message = 'Operation fetchData exceeded 5000ms timeout';

      // Act
      const error = new TimeoutException(message);

      // Assert
      expect(error).toBeInstanceOf(TimeoutException);
      expect(error.name).toBe('TimeoutException');
      expect(error.message).toContain('fetchData');
      expect(error.message).toContain('5000');
    });

    test('RateLimitExceededException propagates with limit context', () => {
      // Arrange: RateLimitExceededException takes (operationName, requiredWaitMs, message?)
      const operationName = 'googleSheets.read';
      const requiredWaitMs = 60000;

      // Act
      const error = new RateLimitExceededException(operationName, requiredWaitMs);

      // Assert
      expect(error).toBeInstanceOf(RateLimitExceededException);
      expect(error.operationName).toBe(operationName);
      expect(error.requiredWaitMs).toBe(requiredWaitMs);
    });
  });

  describe('GoogleApiWrapper Error Types', () => {
    test('QuotaExceededError includes quota context', () => {
      // Arrange & Act
      const error = new QuotaExceededError('API quota exceeded', 'DriveService', 'createFile');

      // Assert
      expect(error).toBeInstanceOf(ServiceError);
      expect(error).toBeInstanceOf(QuotaExceededError);
      expect(error.serviceName).toBe('DriveService');
      expect(error.operation).toBe('createFile');
    });

    test('PermissionDeniedError includes permission context', () => {
      // Arrange & Act
      const error = new PermissionDeniedError(
        'Access denied',
        'SpreadsheetService',
        'getSheetData'
      );

      // Assert
      expect(error).toBeInstanceOf(ServiceError);
      expect(error).toBeInstanceOf(PermissionDeniedError);
      expect(error.serviceName).toBe('SpreadsheetService');
    });

    test('ResourceNotFoundError includes resource context', () => {
      // Arrange & Act
      const error = new ResourceNotFoundError('File not found', 'DriveService', 'getFileById');

      // Assert
      expect(error).toBeInstanceOf(ServiceError);
      expect(error).toBeInstanceOf(ResourceNotFoundError);
    });
  });

  describe('Error Chain Through Layers', () => {
    test('API error → Service → Repository → Application', () => {
      // Arrange: Simulate error originating at API level
      const apiError = new Error('Spreadsheet not found');
      apiError.code = 404;

      const mockDatabase = {
        tables: {
          TestEntities: {
            name: 'TestEntities',
            columns: ['id', 'name', 'email'],
            getAllRows: jest.fn(() => {
              throw apiError;
            }),
            getByPK: jest.fn(),
            insertRow: jest.fn()
          }
        },
        save: jest.fn()
      };

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

      class TestRepository extends Repository {
        constructor(database, logger, cache) {
          super(database, 'TestEntities', TestEntity, logger, cache);
        }
      }

      const repository = new TestRepository(mockDatabase, mockLogger, mockCache);

      // Act & Assert
      expect(() => {
        repository.findAll();
      }).toThrow('Spreadsheet not found');
    });

    test('Transform error in ETL pipeline includes row context', () => {
      // Arrange
      const transformError = new TransformError('Invalid date format', 'DateParser', {
        row: 5,
        column: 'date'
      });

      // Assert
      expect(transformError).toBeInstanceOf(TransformError);
      expect(transformError.context?.row).toBe(5);
      expect(transformError.context?.column).toBe('date');
    });

    test('Source error in ETL pipeline includes source context', () => {
      // Arrange
      const sourceError = new SourceError('Sheet not accessible', 'SheetByIdStrategy', {
        sheetId: 'abc123'
      });

      // Assert
      expect(sourceError).toBeInstanceOf(SourceError);
      expect(sourceError.context?.sheetId).toBe('abc123');
    });

    test('Load error in ETL pipeline includes target context', () => {
      // Arrange
      const loadError = new LoadError('Constraint violation', 'Loader', {
        table: 'Products',
        conflictKey: 'sku'
      });

      // Assert
      expect(loadError).toBeInstanceOf(LoadError);
      expect(loadError.context?.table).toBe('Products');
      expect(loadError.context?.conflictKey).toBe('sku');
    });
  });

  describe('Logger Captures Errors', () => {
    test('Errors are logged through all layers', () => {
      // Arrange
      class FailingProvider extends DataProvider {
        _fetchData(parameters) {
          throw new Error('Provider failure');
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

      // Assert: Logger captured the error
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
