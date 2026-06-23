/**
 * @file PipelineFramework/src/postprocessor/__tests__/PostProcessorResult.test.js
 * @description Unit tests for PostProcessorResult class
 */

import { PostProcessorResult } from '../PostProcessorResult';

describe('PostProcessorResult', () => {
  describe('Constructor', () => {
    it('should create result with default values', () => {
      const result = new PostProcessorResult({});

      expect(result.success).toBe(false);
      expect(result.processorId).toBe('unknown');
      expect(result.duration).toBe(0);
      expect(result.changes).toEqual([]);
      expect(result.error).toBeNull();
      expect(result.metadata).toEqual({});
    });

    it('should create result with provided values', () => {
      const error = new Error('test');
      const result = new PostProcessorResult({
        success: true,
        processorId: 'test-processor',
        duration: 100,
        changes: [{ type: 'UPDATE', target: 'test', newValue: 'value' }],
        error,
        metadata: { key: 'value' }
      });

      expect(result.success).toBe(true);
      expect(result.processorId).toBe('test-processor');
      expect(result.duration).toBe(100);
      expect(result.changes).toHaveLength(1);
      expect(result.error).toBe(error);
      expect(result.metadata).toEqual({ key: 'value' });
    });
  });

  describe('Static Factory Methods', () => {
    describe('success', () => {
      it('should create success result', () => {
        const result = PostProcessorResult.success('processor-1');

        expect(result.success).toBe(true);
        expect(result.processorId).toBe('processor-1');
        expect(result.error).toBeNull();
      });

      it('should include changes', () => {
        const changes = [{ type: 'CELL_UPDATE', target: 'table.column', newValue: 'value' }];
        const result = PostProcessorResult.success('processor-1', changes);

        expect(result.changes).toEqual(changes);
      });

      it('should include duration and metadata', () => {
        const result = PostProcessorResult.success('processor-1', [], 150, { key: 'value' });

        expect(result.duration).toBe(150);
        expect(result.metadata).toEqual({ key: 'value' });
      });
    });

    describe('failure', () => {
      it('should create failure result', () => {
        const error = new Error('Test error');
        const result = PostProcessorResult.failure('processor-1', error);

        expect(result.success).toBe(false);
        expect(result.processorId).toBe('processor-1');
        expect(result.error).toBe(error);
      });

      it('should include duration and metadata', () => {
        const error = new Error('Test');
        const result = PostProcessorResult.failure('processor-1', error, 50, { key: 'value' });

        expect(result.duration).toBe(50);
        expect(result.metadata).toEqual({ key: 'value' });
      });
    });

    describe('skipped', () => {
      it('should create skipped result', () => {
        const result = PostProcessorResult.skipped('processor-1');

        expect(result.success).toBe(true);
        expect(result.processorId).toBe('processor-1');
        expect(result.wasSkipped()).toBe(true);
        expect(result.metadata.skipReason).toBe('Condition not met');
      });

      it('should include custom skip reason', () => {
        const result = PostProcessorResult.skipped('processor-1', 'Step was skipped');

        expect(result.metadata.skipReason).toBe('Step was skipped');
      });
    });
  });

  describe('wasSkipped', () => {
    it('should return true for skipped result', () => {
      const result = PostProcessorResult.skipped('processor-1');
      expect(result.wasSkipped()).toBe(true);
    });

    it('should return false for success result', () => {
      const result = PostProcessorResult.success('processor-1');
      expect(result.wasSkipped()).toBe(false);
    });

    it('should return false for failure result', () => {
      const result = PostProcessorResult.failure('processor-1', new Error('test'));
      expect(result.wasSkipped()).toBe(false);
    });
  });

  describe('addChange', () => {
    it('should add change record', () => {
      const result = PostProcessorResult.success('processor-1');
      result.addChange('CELL_UPDATE', 'table.column', 'newValue');

      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]).toEqual({
        type: 'CELL_UPDATE',
        target: 'table.column',
        newValue: 'newValue'
      });
    });

    it('should add change with old value', () => {
      const result = PostProcessorResult.success('processor-1');
      result.addChange('CELL_UPDATE', 'table.column', 'newValue', 'oldValue');

      expect(result.changes[0].oldValue).toBe('oldValue');
    });

    it('should support chaining', () => {
      const result = PostProcessorResult.success('processor-1');
      const returned = result
        .addChange('UPDATE', 'field1', 'value1')
        .addChange('UPDATE', 'field2', 'value2');

      expect(returned).toBe(result);
      expect(result.changes).toHaveLength(2);
    });
  });

  describe('getSummary', () => {
    it('should return summary for success', () => {
      const result = PostProcessorResult.success('processor-1');
      result.addChange('UPDATE', 'field', 'value');

      const summary = result.getSummary();

      expect(summary).toEqual({
        processorId: 'processor-1',
        success: true,
        skipped: false,
        duration: 0,
        changeCount: 1,
        error: null
      });
    });

    it('should return summary for failure', () => {
      const error = new Error('Test error');
      const result = PostProcessorResult.failure('processor-1', error, 50);

      const summary = result.getSummary();

      expect(summary.success).toBe(false);
      expect(summary.duration).toBe(50);
      expect(summary.error).toBe('Test error');
    });

    it('should return summary for skipped', () => {
      const result = PostProcessorResult.skipped('processor-1');

      const summary = result.getSummary();

      expect(summary.skipped).toBe(true);
    });
  });

  describe('toObject', () => {
    it('should convert to plain object', () => {
      const result = PostProcessorResult.success('processor-1', [], 100, { key: 'value' });
      result.addChange('UPDATE', 'field', 'new', 'old');

      const obj = result.toObject();

      expect(obj).toEqual({
        success: true,
        processorId: 'processor-1',
        duration: 100,
        changes: [{ type: 'UPDATE', target: 'field', newValue: 'new', oldValue: 'old' }],
        error: null,
        metadata: { key: 'value' }
      });
    });

    it('should include error details', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      const result = PostProcessorResult.failure('processor-1', error);

      const obj = result.toObject();

      expect(obj.error).toEqual({
        message: 'Test error',
        stack: 'Error: Test error\n    at test.js:1:1'
      });
    });

    it('should create copies of arrays and objects', () => {
      const result = PostProcessorResult.success('processor-1', [], 0, { key: 'value' });
      result.addChange('UPDATE', 'field', 'value');

      const obj = result.toObject();

      // Verify they are copies, not references
      expect(obj.changes).not.toBe(result.changes);
      expect(obj.metadata).not.toBe(result.metadata);
    });
  });
});
