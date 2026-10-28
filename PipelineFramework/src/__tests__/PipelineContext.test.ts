// ===================================================================
// FILE: PipelineFramework/src/__tests__/PipelineContext.test.js
// ===================================================================
// Comprehensive test suite for PipelineContext
// Coverage: All methods and features
// ===================================================================

import { PipelineContext } from '../PipelineContext.js';

describe('PipelineContext - Comprehensive Test Suite', () => {
  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with empty data', () => {
      const context = new PipelineContext<Record<string, unknown>>();

      expect(context).toBeInstanceOf(PipelineContext);
      expect(context.getData()).toEqual({});
    });

    it('should create instance with initial data', () => {
      const initialData = { userId: 123, name: 'John' };
      const context = new PipelineContext<Record<string, unknown>>(initialData);

      expect(context.getData()).toEqual(initialData);
      expect(context.get('userId')).toBe(123);
      expect(context.get('name')).toBe('John');
    });

    it('should throw error if initialData is invalid', () => {
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => new PipelineContext<Record<string, unknown>>('not an object')).toThrow(
        'PipelineContext: initialData must be an object or null'
      );
    });

    it('should handle null initialData', () => {
      const context = new PipelineContext<Record<string, unknown>>(null);

      expect(context.getData()).toEqual({});
    });

    it('should initialize metadata correctly', () => {
      const context = new PipelineContext<Record<string, unknown>>();
      const metadata = context.getMetadata();

      expect(metadata.startTime).toBeLessThanOrEqual(Date.now());
      expect(metadata.endTime).toBe(null);
      expect(metadata.stopRequested).toBe(false);
      expect(metadata.stopReason).toBe(null);
      expect(metadata.executionHistory).toEqual([]);
    });
  });

  // ===================================================================
  // DATA ACCESS
  // ===================================================================

  describe('Data Access', () => {
    let context: PipelineContext<Record<string, unknown>>;

    beforeEach(() => {
      context = new PipelineContext<Record<string, unknown>>({ existingKey: 'existingValue' });
    });

    it('should get existing value', () => {
      expect(context.get('existingKey')).toBe('existingValue');
    });

    it('should return default value for missing key', () => {
      expect(context.get('missingKey', 'defaultValue')).toBe('defaultValue');
    });

    it('should return null if no default provided', () => {
      expect(context.get('missingKey')).toBe(null);
    });

    it('should throw error if key is not a string', () => {
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => context.get(123)).toThrow('PipelineContext.get: key must be a string');
    });

    it('should set value', () => {
      context.set('newKey', 'newValue');

      expect(context.get('newKey')).toBe('newValue');
    });

    it('should support method chaining for set', () => {
      const result = context.set('key1', 'value1');

      expect(result).toBe(context);
    });

    it('should chain multiple sets', () => {
      context.set('key1', 'value1').set('key2', 'value2').set('key3', 'value3');

      expect(context.get('key1')).toBe('value1');
      expect(context.get('key2')).toBe('value2');
      expect(context.get('key3')).toBe('value3');
    });

    it('should throw error if set key is not a string', () => {
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => context.set(123, 'value')).toThrow('PipelineContext.set: key must be a string');
    });

    it('should check if key exists', () => {
      expect(context.has('existingKey')).toBe(true);
      expect(context.has('missingKey')).toBe(false);
    });

    it('should throw error if has key is not a string', () => {
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => context.has(123)).toThrow('PipelineContext.has: key must be a string');
    });

    it('should return direct reference to data object', () => {
      const data = context.getData();

      expect(data).toBe(context.getData());
      expect(data.existingKey).toBe('existingValue');
    });

    it('should allow direct mutation of data object', () => {
      const data = context.getData();
      data.directlyAdded = 'directValue';

      expect(context.get('directlyAdded')).toBe('directValue');
    });
  });

  // ===================================================================
  // STOP MECHANISM
  // ===================================================================

  describe('Stop Mechanism', () => {
    let context: PipelineContext<Record<string, unknown>>;

    beforeEach(() => {
      context = new PipelineContext<Record<string, unknown>>();
    });

    it('should not be stopped initially', () => {
      expect(context.shouldStop()).toBe(false);
      expect(context.getStopReason()).toBe(null);
    });

    it('should request stop with reason', () => {
      context.requestStop('Test reason');

      expect(context.shouldStop()).toBe(true);
      expect(context.getStopReason()).toBe('Test reason');
    });

    it('should support method chaining for requestStop', () => {
      const result = context.requestStop('Test');

      expect(result).toBe(context);
    });

    it('should request stop without reason', () => {
      context.requestStop();

      expect(context.shouldStop()).toBe(true);
      expect(context.getStopReason()).toBe('');
    });

    it('should update stop reason if requested multiple times', () => {
      context.requestStop('Reason 1');
      context.requestStop('Reason 2');

      expect(context.shouldStop()).toBe(true);
      expect(context.getStopReason()).toBe('Reason 2');
    });
  });

  // ===================================================================
  // EXECUTION HISTORY
  // ===================================================================

  describe('Execution History', () => {
    let context: PipelineContext<Record<string, unknown>>;

    beforeEach(() => {
      context = new PipelineContext<Record<string, unknown>>();
    });

    it('should start with empty history', () => {
      expect(context.getExecutionHistory()).toEqual([]);
    });

    it('should record step execution', () => {
      context.recordStepExecution('Step1', 'completed', 100, { detail: 'test' });

      const history = context.getExecutionHistory();

      expect(history).toHaveLength(1);
      expect(history[0].stepName).toBe('Step1');
      expect(history[0].status).toBe('completed');
      expect(history[0].durationMs).toBe(100);
      expect(history[0].details).toEqual({ detail: 'test' });
      expect(history[0].timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should record multiple step executions', () => {
      context.recordStepExecution('Step1', 'completed', 100);
      context.recordStepExecution('Step2', 'skipped', 50);
      context.recordStepExecution('Step3', 'failed', 200, { error: 'Test error' });

      const history = context.getExecutionHistory();

      expect(history).toHaveLength(3);
      expect(history[0].stepName).toBe('Step1');
      expect(history[1].stepName).toBe('Step2');
      expect(history[2].stepName).toBe('Step3');
    });

    it('should support method chaining for recordStepExecution', () => {
      const result = context.recordStepExecution('Step1', 'completed', 100);

      expect(result).toBe(context);
    });
  });

  // ===================================================================
  // METADATA
  // ===================================================================

  describe('Metadata', () => {
    let context: PipelineContext<Record<string, unknown>>;

    beforeEach(() => {
      context = new PipelineContext<Record<string, unknown>>();
    });

    it('should return metadata object', () => {
      const metadata = context.getMetadata();
      const { startTime, ...state } = metadata;

      expect(Number.isFinite(startTime)).toBe(true);
      expect(startTime).toBeGreaterThanOrEqual(0);
      expect(startTime).toBeLessThanOrEqual(Date.now());
      expect(state).toEqual({
        endTime: null,
        stopRequested: false,
        stopReason: null,
        executionHistory: []
      });
    });

    it('should mark as completed', () => {
      const beforeEnd = Date.now();
      context.markCompleted();
      const afterEnd = Date.now();

      const metadata = context.getMetadata();

      expect(metadata.endTime).toBeGreaterThanOrEqual(beforeEnd);
      expect(metadata.endTime).toBeLessThanOrEqual(afterEnd);
    });

    it('should support method chaining for markCompleted', () => {
      const result = context.markCompleted();

      expect(result).toBe(context);
    });
  });

  // ===================================================================
  // DURATION
  // ===================================================================

  describe('Duration', () => {
    let context: PipelineContext<Record<string, unknown>>;

    beforeEach(() => {
      context = new PipelineContext<Record<string, unknown>>();
    });

    it('should return 0 duration before completion', () => {
      expect(context.getTotalDuration()).toBe(0);
    });

    it('should return duration after completion', () => {
      // Add a small delay
      const _start = Date.now();

      // Wait a bit
      let _counter = 0;
      for (let i = 0; i < 100000; i++) {
        _counter++;
      }

      context.markCompleted();

      const duration = context.getTotalDuration();

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe('number');
    });

    it('should calculate correct duration', () => {
      const metadata = context.getMetadata();
      const startTime = metadata.startTime;

      // Simulate some time passing
      context.markCompleted();

      const duration = context.getTotalDuration();
      const expectedDuration = metadata.endTime! - startTime;

      expect(duration).toBe(expectedDuration);
    });
  });

  // ===================================================================
  // SUMMARY
  // ===================================================================

  describe('Summary', () => {
    let context: PipelineContext<Record<string, unknown>>;

    beforeEach(() => {
      context = new PipelineContext<Record<string, unknown>>();
    });

    it('should return empty summary for new context', () => {
      const summary = context.getSummary();
      const { startTime, ...state } = summary;

      expect(Number.isFinite(startTime)).toBe(true);
      expect(startTime).toBeGreaterThanOrEqual(0);
      expect(startTime).toBeLessThanOrEqual(Date.now());
      expect(state).toEqual({
        endTime: null,
        totalDuration: 0,
        totalSteps: 0,
        completedSteps: 0,
        skippedSteps: 0,
        failedSteps: 0,
        stopRequested: false,
        stopReason: null,
        history: []
      });
    });

    it('should return summary with execution history', () => {
      context.recordStepExecution('Step1', 'completed', 100);
      context.recordStepExecution('Step2', 'skipped', 50);
      context.recordStepExecution('Step3', 'failed', 200);
      context.markCompleted();

      const summary = context.getSummary();

      expect(summary.totalSteps).toBe(3);
      expect(summary.completedSteps).toBe(1);
      expect(summary.skippedSteps).toBe(1);
      expect(summary.failedSteps).toBe(1);
      expect(summary.totalDuration).toBeGreaterThanOrEqual(0);
      expect(summary.history).toHaveLength(3);
    });

    it('should include stop information in summary', () => {
      context.requestStop('Test stop reason');
      const summary = context.getSummary();

      expect(summary.stopRequested).toBe(true);
      expect(summary.stopReason).toBe('Test stop reason');
    });

    it('should calculate correct step counts', () => {
      context.recordStepExecution('Step1', 'completed', 100);
      context.recordStepExecution('Step2', 'completed', 100);
      context.recordStepExecution('Step3', 'skipped', 100);
      context.recordStepExecution('Step4', 'failed', 100);
      context.recordStepExecution('Step5', 'failed', 100);

      const summary = context.getSummary();

      expect(summary.totalSteps).toBe(5);
      expect(summary.completedSteps).toBe(2);
      expect(summary.skippedSteps).toBe(1);
      expect(summary.failedSteps).toBe(2);
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    it('should handle complex workflow', () => {
      const context = new PipelineContext<Record<string, unknown>>({ initialData: 'test' });

      // Simulate pipeline execution
      context.set('step1Result', 'result1');
      context.recordStepExecution('Step1', 'completed', 100);

      context.set('step2Result', 'result2');
      context.recordStepExecution('Step2', 'completed', 150);

      context.set('dataProcessed', true);
      context.recordStepExecution('Step3', 'skipped', 0);

      context.markCompleted();

      // Verify final state
      expect(context.get('initialData')).toBe('test');
      expect(context.get('step1Result')).toBe('result1');
      expect(context.get('step2Result')).toBe('result2');
      expect(context.get('dataProcessed')).toBe(true);

      const summary = context.getSummary();
      expect(summary.totalSteps).toBe(3);
      expect(summary.completedSteps).toBe(2);
      expect(summary.skippedSteps).toBe(1);
      expect(summary.totalDuration).toBeGreaterThanOrEqual(0);
    });

    it('should handle context with stop signal', () => {
      const context = new PipelineContext<Record<string, unknown>>();

      context.set('data', 'value');
      context.recordStepExecution('Step1', 'completed', 100);

      context.requestStop('No more data to process');
      context.recordStepExecution('Step2', 'completed', 50);

      context.markCompleted();

      const summary = context.getSummary();

      expect(summary.stopRequested).toBe(true);
      expect(summary.stopReason).toBe('No more data to process');
      expect(summary.totalSteps).toBe(2);
    });
  });
});
