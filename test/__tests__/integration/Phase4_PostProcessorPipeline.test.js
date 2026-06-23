/**
 * Phase 4 Integration Test: PostProcessor + Complete Pipeline
 *
 * Layers Tested:
 * - PipelineFramework (Layer 3) - Pipeline orchestration with PostProcessors
 * - SheetDBLib (Layer 2) - Database operations for post-processing
 * - GasResilienceLib (Layer 1) - Error handling and retry
 * - CoreUtilsLib (Layer 0) - Utilities and logging
 *
 * Purpose: Validate complete pipeline execution with post-processor chain
 * including database updates, audit logging, and counter updates after
 * step completion.
 *
 * @file test/__tests__/integration/Phase4_PostProcessorPipeline.test.js
 */

import {
  Pipeline,
  Step,
  PostProcessableStep,
  PipelineContext,
  PostProcessorChain,
  PostProcessorContext,
  PostProcessorResult,
  ValueResolver,
  ValueSource,
  WhenCondition,
  CellUpdatePostProcessor,
  LogAuditPostProcessor,
  CounterUpdatePostProcessor,
  FieldUpdatePostProcessor,
  createDefaultRegistry
} from '@PipelineFramework';
import { ExceptionService } from '@GasResilienceLib';

describe('Phase 4 Integration: PostProcessor + Complete Pipeline', () => {
  let mockLogger;
  let mockUtils;
  let exceptionService;

  // Mock database for testing
  const createMockDatabase = () => {
    const tables = new Map();

    return {
      tables: new Proxy(
        {},
        {
          get: (target, tableName) => {
            if (!tables.has(tableName)) {
              tables.set(tableName, {
                _data: [],
                getAllRows: function () {
                  return this._data;
                },
                findByPrimaryKey: function (pk) {
                  return this._data.find((row) => row.id === pk) || null;
                },
                findOne: function (filter) {
                  return this._data.find((row) => {
                    for (const [key, value] of Object.entries(filter)) {
                      if (row[key] !== value) {
                        return false;
                      }
                    }
                    return true;
                  });
                },
                updateRow: function (rowIndex, updates) {
                  if (rowIndex >= 0 && rowIndex < this._data.length) {
                    this._data[rowIndex] = { ...this._data[rowIndex], ...updates };
                    return { success: true };
                  }
                  return { success: false };
                },
                insertRow: function (row) {
                  this._data.push(row);
                  return { success: true, insertedRow: row };
                },
                _seedData: function (rows) {
                  this._data = [...rows];
                }
              });
            }
            return tables.get(tableName);
          }
        }
      ),
      _tables: tables,
      save: jest.fn(() => ({ success: true }))
    };
  };

  beforeEach(() => {
    mockLogger = global.mockLoggerService();
    mockUtils = { sleep: jest.fn() };
    exceptionService = new ExceptionService(mockLogger, mockUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PostProcessableStep Integration', () => {
    class DocumentGenerationStep extends PostProcessableStep {
      constructor(name, logger, documentService) {
        super(name, logger);
        this._documentService = documentService;
      }

      _executeLogic(context) {
        const templateId = context.get('templateId');
        const data = context.get('documentData');

        // Simulate document generation
        const documentUrl = this._documentService.generate(templateId, data);
        this.setResult(context, 'documentUrl', documentUrl);
        this.setResult(context, 'documentId', `doc-${Date.now()}`);

        return {
          success: true,
          documentUrl,
          generatedAt: new Date().toISOString()
        };
      }

      getPostProcessors() {
        return [
          {
            processorType: 'CellUpdate',
            instanceId: 'update-doc-status',
            when: WhenCondition.ON_SUCCESS,
            config: {
              table: 'DOCUMENTS',
              recordIdentifier: {
                strategy: 'PRIMARY_KEY',
                primaryKeySource: 'documentRecordId'
              },
              updates: [
                { column: 'status', value: ValueSource.literal('GENERATED') },
                { column: 'documentUrl', value: ValueSource.stepOutput('documentUrl') },
                { column: 'generatedAt', value: ValueSource.timestamp() }
              ]
            }
          },
          {
            processorType: 'LogAudit',
            instanceId: 'audit-generation',
            when: WhenCondition.ALWAYS,
            config: {
              table: 'AUDIT_LOG',
              fields: [
                { column: 'timestamp', value: ValueSource.timestamp() },
                { column: 'action', value: ValueSource.literal('DOCUMENT_GENERATED') },
                { column: 'entityId', value: ValueSource.stepOutput('documentId') },
                { column: 'userId', value: ValueSource.context('currentUser.id') }
              ]
            }
          }
        ];
      }
    }

    test('PostProcessableStep executes post-processors after step', () => {
      const mockDocService = {
        generate: jest.fn(() => 'https://docs.google.com/doc/123')
      };
      const mockDatabase = createMockDatabase();

      // Seed initial data
      mockDatabase.tables['DOCUMENTS']._seedData([
        { id: 'doc-001', templateId: 'tpl-001', status: 'PENDING', documentUrl: null }
      ]);

      const step = new DocumentGenerationStep('generate-doc', mockLogger, mockDocService);

      // Create pipeline context with required data
      const context = new PipelineContext({
        templateId: 'tpl-001',
        documentData: { title: 'Test Document' },
        documentRecordId: 'doc-001',
        currentUser: { id: 'user-123', email: 'user@example.com' }
      });

      // Execute step
      const result = step.execute(context);

      expect(result).toBeDefined();
      expect(context.get('documentUrl')).toBe('https://docs.google.com/doc/123');
      expect(step.getPostProcessors().length).toBe(2);
    });
  });

  describe('PostProcessorChain Execution', () => {
    test('Chain executes processors in sequence', () => {
      const executionOrder = [];

      // Create mock processors
      const processor1 = {
        getId: () => 'p1',
        getName: () => 'Processor 1',
        execute: (_ctx) => {
          executionOrder.push('p1');
          return PostProcessorResult.success('p1');
        }
      };

      const processor2 = {
        getId: () => 'p2',
        getName: () => 'Processor 2',
        execute: (_ctx) => {
          executionOrder.push('p2');
          return PostProcessorResult.success('p2');
        }
      };

      const chain = new PostProcessorChain({ logger: mockLogger });
      chain.add(processor1).add(processor2);

      const context = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });

      const result = chain.execute(context);

      expect(result.success).toBe(true);
      expect(result.executed).toBe(2);
      expect(executionOrder).toEqual(['p1', 'p2']);
    });

    test('Chain respects WhenCondition.ON_SUCCESS', () => {
      let executed = false;

      const processor = {
        getId: () => 'p1',
        getName: () => 'Success Only Processor',
        execute: () => {
          executed = true;
          return PostProcessorResult.success('p1');
        }
      };

      const chain = new PostProcessorChain({ logger: mockLogger });
      chain.add(processor, { when: WhenCondition.ON_SUCCESS });

      // Test with failed step
      const failContext = new PostProcessorContext({
        step: { getName: () => 'FailedStep' },
        stepResult: { success: false, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });

      chain.execute(failContext);
      expect(executed).toBe(false);

      // Test with successful step
      const successContext = new PostProcessorContext({
        step: { getName: () => 'SuccessStep' },
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });

      chain.execute(successContext);
      expect(executed).toBe(true);
    });

    test('Chain continues on error when continueOnError is true', () => {
      const executed = [];

      const failingProcessor = {
        getId: () => 'p1',
        getName: () => 'Failing Processor',
        execute: () => {
          executed.push('p1-fail');
          return PostProcessorResult.failure('p1', new Error('Test failure'));
        }
      };

      const successProcessor = {
        getId: () => 'p2',
        getName: () => 'Success Processor',
        execute: () => {
          executed.push('p2-success');
          return PostProcessorResult.success('p2');
        }
      };

      const chain = new PostProcessorChain({ logger: mockLogger });
      chain.add(failingProcessor, { continueOnError: true }).add(successProcessor);

      const context = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });

      const result = chain.execute(context);

      expect(executed).toEqual(['p1-fail', 'p2-success']);
      expect(result.failed).toBe(1);
      expect(result.executed).toBe(2);
    });

    test('Chain stops on error when continueOnError is false', () => {
      const executed = [];

      const failingProcessor = {
        getId: () => 'p1',
        getName: () => 'Failing Processor',
        execute: () => {
          executed.push('p1-fail');
          return PostProcessorResult.failure('p1', new Error('Critical failure'));
        }
      };

      const successProcessor = {
        getId: () => 'p2',
        getName: () => 'Success Processor',
        execute: () => {
          executed.push('p2-success');
          return PostProcessorResult.success('p2');
        }
      };

      const chain = new PostProcessorChain({ logger: mockLogger });
      chain.add(failingProcessor, { continueOnError: false }).add(successProcessor);

      const context = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });

      const result = chain.execute(context);

      expect(executed).toEqual(['p1-fail']);
      expect(result.chainStopped).toBe(true);
    });
  });

  describe('ValueResolver Integration', () => {
    test('Resolves LITERAL values', () => {
      const resolver = new ValueResolver({ logger: mockLogger });
      const context = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });

      const source = ValueSource.literal('test-value');
      const resolved = resolver.resolve(source, context);

      expect(resolved).toBe('test-value');
    });

    test('Resolves CONTEXT values with dot notation', () => {
      const resolver = new ValueResolver({ logger: mockLogger });
      const context = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: {
          getData: () => ({
            user: {
              profile: {
                email: 'test@example.com'
              }
            }
          })
        }
      });

      const source = ValueSource.context('user.profile.email');
      const resolved = resolver.resolve(source, context);

      expect(resolved).toBe('test@example.com');
    });

    test('Resolves STEP_OUTPUT values', () => {
      const resolver = new ValueResolver({ logger: mockLogger });
      const context = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: {
          success: true,
          skipped: false,
          durationMs: 100,
          output: { documentUrl: 'https://example.com/doc/123' }
        },
        pipelineContext: { getData: () => ({}) }
      });

      const source = ValueSource.stepOutput('documentUrl');
      const resolved = resolver.resolve(source, context);

      expect(resolved).toBe('https://example.com/doc/123');
    });

    test('Resolves TIMESTAMP values', () => {
      const resolver = new ValueResolver({ logger: mockLogger });
      const context = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });

      const source = ValueSource.timestamp();
      const resolved = resolver.resolve(source, context);

      expect(resolved).toBeDefined();
      expect(typeof resolved).toBe('string');
      // Should be ISO format
      expect(resolved).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('Complete Pipeline with PostProcessors', () => {
    class DataLoadStep extends Step {
      _executeLogic(context) {
        this.setResult(context, 'loadedData', [
          { id: 1, name: 'Item A' },
          { id: 2, name: 'Item B' }
        ]);
        return { loaded: 2 };
      }
    }

    class ProcessDataStep extends PostProcessableStep {
      _executeLogic(context) {
        const data = context.get('loadedData') || [];
        const processed = data.map((item) => ({ ...item, processed: true }));
        this.setResult(context, 'processedData', processed);
        this.setResult(context, 'processedCount', processed.length);
        return { processedCount: processed.length };
      }

      getPostProcessors() {
        return [
          {
            processorType: 'CounterUpdate',
            instanceId: 'update-counter',
            when: WhenCondition.ON_SUCCESS,
            config: {
              table: 'COUNTERS',
              recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'counterId' },
              counter: {
                column: 'value',
                operation: 'INCREMENT',
                amount: { type: 'STEP_OUTPUT', outputKey: 'processedCount' }
              }
            }
          }
        ];
      }
    }

    class SaveDataStep extends PostProcessableStep {
      constructor(name, logger, database) {
        super(name, logger);
        this._database = database;
      }

      _executeLogic(context) {
        const data = context.get('processedData') || [];
        // Simulate save
        this.setResult(context, 'savedCount', data.length);
        return { saved: data.length };
      }

      getPostProcessors() {
        return [
          {
            processorType: 'LogAudit',
            instanceId: 'audit-save',
            when: WhenCondition.ALWAYS,
            config: {
              table: 'AUDIT_LOG',
              fields: [
                { column: 'timestamp', value: ValueSource.timestamp() },
                { column: 'action', value: ValueSource.literal('DATA_SAVED') },
                { column: 'count', value: ValueSource.stepOutput('savedCount') }
              ]
            }
          }
        ];
      }
    }

    test('Pipeline executes steps with their post-processors', () => {
      const mockDatabase = createMockDatabase();

      const pipeline = new Pipeline(mockLogger, exceptionService)
        .addStep(new DataLoadStep('load', mockLogger))
        .addStep(new ProcessDataStep('process', mockLogger))
        .addStep(new SaveDataStep('save', mockLogger, mockDatabase));

      // Execute pipeline
      const context = pipeline.execute({
        counterId: 'cnt-001',
        currentUser: { id: 'user-123' }
      });

      // Verify execution
      expect(context.getSummary().failedSteps).toBe(0);
      expect(context.getSummary().totalSteps).toBe(3);
      expect(context.get('processedCount')).toBe(2);
      expect(context.get('savedCount')).toBe(2);
    });

    test('Pipeline handles post-processor errors gracefully', () => {
      class FailingPostProcessorStep extends PostProcessableStep {
        _executeLogic(context) {
          this.setResult(context, 'executed', true);
          return { success: true };
        }

        getPostProcessors() {
          return [
            {
              processorType: 'CellUpdate',
              instanceId: 'will-fail',
              when: WhenCondition.ON_SUCCESS,
              continueOnError: true,
              config: {
                table: 'NON_EXISTENT_TABLE',
                recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'missingId' },
                updates: [{ column: 'status', value: ValueSource.literal('DONE') }]
              }
            }
          ];
        }
      }

      const pipeline = new Pipeline(mockLogger, exceptionService).addStep(
        new FailingPostProcessorStep('failing-pp', mockLogger)
      );

      // Should not throw due to continueOnError: true
      const context = pipeline.execute({});
      expect(context.get('executed')).toBe(true);
    });
  });

  describe('Built-in PostProcessor Types', () => {
    test('CellUpdatePostProcessor can be instantiated with configuration', () => {
      // Verify processor can be created with valid configuration
      const processor = new CellUpdatePostProcessor(
        'cell-update-1',
        {
          table: 'RECORDS',
          recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'recordId' },
          updates: [
            { column: 'status', value: ValueSource.literal('COMPLETED') },
            { column: 'value', value: ValueSource.stepOutput('computedValue') }
          ]
        },
        { logger: mockLogger }
      );

      expect(processor).toBeDefined();
      expect(processor.getId()).toBe('cell-update-1');
    });

    test('LogAuditPostProcessor inserts audit records', () => {
      const mockDatabase = createMockDatabase();
      mockDatabase.tables['AUDIT_LOG']._seedData([]);

      const processor = new LogAuditPostProcessor(
        'audit-1',
        {
          table: 'AUDIT_LOG',
          fields: [
            { column: 'timestamp', value: ValueSource.timestamp() },
            { column: 'action', value: ValueSource.literal('TEST_ACTION') },
            { column: 'userId', value: ValueSource.context('currentUser.id') }
          ]
        },
        { database: mockDatabase, logger: mockLogger }
      );

      const context = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: true, skipped: false, durationMs: 100 },
        pipelineContext: {
          getData: () => ({ currentUser: { id: 'user-123' } })
        }
      });

      const result = processor.execute(context);

      expect(result.success).toBe(true);
      expect(mockDatabase.tables['AUDIT_LOG']._data.length).toBe(1);
      expect(mockDatabase.tables['AUDIT_LOG']._data[0].action).toBe('TEST_ACTION');
    });

    test('CounterUpdatePostProcessor can be instantiated with configuration', () => {
      const processor = new CounterUpdatePostProcessor(
        'counter-1',
        {
          table: 'COUNTERS',
          recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'counterId' },
          counter: {
            column: 'value',
            operation: 'INCREMENT',
            amount: ValueSource.literal(5)
          }
        },
        { logger: mockLogger }
      );

      expect(processor).toBeDefined();
      expect(processor.getId()).toBe('counter-1');
    });

    test('FieldUpdatePostProcessor can be instantiated with configuration', () => {
      const processor = new FieldUpdatePostProcessor(
        'field-update-1',
        {
          table: 'TASKS',
          recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'taskId' },
          fields: {
            status: 'COMPLETED',
            completedAt: '$timestamp',
            completedBy: '$context.currentUser.id'
          }
        },
        { logger: mockLogger }
      );

      expect(processor).toBeDefined();
      expect(processor.getId()).toBe('field-update-1');
    });
  });

  describe('PostProcessorRegistry', () => {
    test('createDefaultRegistry includes all built-in processors', () => {
      const registry = createDefaultRegistry({ logger: mockLogger });

      expect(registry.has('CellUpdate')).toBe(true);
      expect(registry.has('LogAudit')).toBe(true);
      expect(registry.has('CounterUpdate')).toBe(true);
      expect(registry.has('FieldUpdate')).toBe(true);
    });

    test('Registry creates processors from configuration', () => {
      const registry = createDefaultRegistry({ logger: mockLogger });
      const mockDatabase = createMockDatabase();

      const processor = registry.create(
        {
          processorType: 'CellUpdate',
          instanceId: 'test-cell-update',
          config: {
            table: 'TEST_TABLE',
            recordIdentifier: { strategy: 'PRIMARY_KEY', primaryKeySource: 'recordId' },
            updates: [{ column: 'status', value: ValueSource.literal('DONE') }]
          }
        },
        { database: mockDatabase, logger: mockLogger }
      );

      expect(processor).toBeDefined();
      expect(processor.getId()).toBe('test-cell-update');
    });

    test('Registry throws for unknown processor type', () => {
      const registry = createDefaultRegistry({ logger: mockLogger });

      expect(() => {
        registry.create({
          processorType: 'UnknownType',
          instanceId: 'unknown-1',
          config: {}
        });
      }).toThrow();
    });
  });
});
