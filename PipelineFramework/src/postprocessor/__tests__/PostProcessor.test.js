/**
 * @file PipelineFramework/src/postprocessor/__tests__/PostProcessor.test.js
 * @description Unit tests for PostProcessor base class
 */

import { PostProcessor } from '../PostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { PostProcessorContext } from '../PostProcessorContext';
import { MockFactory } from '../../../../test/fakes';

// Concrete implementation for testing
class TestPostProcessor extends PostProcessor {
  constructor(id, config = {}, services = {}) {
    super(id, 'TestPostProcessor', config, services);
    this.executeCount = 0;
  }

  _executeImpl(_context) {
    this.executeCount++;
    const result = PostProcessorResult.success(this.id, [], 0, { executed: true });
    result.addChange('TEST', 'target', 'newValue', 'oldValue');
    return result;
  }
}

class FailingPostProcessor extends PostProcessor {
  constructor(id, config = {}, services = {}) {
    super(id, 'FailingPostProcessor', config, services);
  }

  _executeImpl(_context) {
    throw new Error('Test failure');
  }
}

class ConditionalPostProcessor extends PostProcessor {
  constructor(id, config = {}, services = {}) {
    super(id, 'ConditionalPostProcessor', config, services);
  }

  shouldRun(context) {
    return context.wasSuccessful();
  }

  _executeImpl(_context) {
    return PostProcessorResult.success(this.id);
  }
}

describe('PostProcessor', () => {
  let mocks;
  let mockContext;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    mockContext = new PostProcessorContext({
      step: { getName: () => 'TestStep' },
      stepResult: { success: true, skipped: false, durationMs: 100 },
      pipelineContext: { getData: () => ({ userId: 'user-1' }) }
    });
  });

  describe('Constructor', () => {
    it('should create processor with valid parameters', () => {
      const processor = new TestPostProcessor('test-1', { key: 'value' }, { logger: mocks.logger });

      expect(processor.id).toBe('test-1');
      expect(processor.name).toBe('TestPostProcessor');
      expect(processor.getConfig()).toEqual({ key: 'value' });
    });

    it('should throw if id is missing', () => {
      expect(() => new TestPostProcessor('', {}, {})).toThrow('id is required');
      expect(() => new TestPostProcessor(null, {}, {})).toThrow('id is required');
    });

    it('should use console as default logger', () => {
      const processor = new TestPostProcessor('test-1');
      expect(processor._logger).toBe(console);
    });
  });

  describe('Getters', () => {
    it('should return id', () => {
      const processor = new TestPostProcessor('test-1');
      expect(processor.getId()).toBe('test-1');
    });

    it('should return name', () => {
      const processor = new TestPostProcessor('test-1');
      expect(processor.getName()).toBe('TestPostProcessor');
    });

    it('should return config', () => {
      const processor = new TestPostProcessor('test-1', { key: 'value' });
      expect(processor.getConfig()).toEqual({ key: 'value' });
    });
  });

  describe('shouldRun', () => {
    it('should return true by default', () => {
      const processor = new TestPostProcessor('test-1');
      expect(processor.shouldRun(mockContext)).toBe(true);
    });

    it('should be overridable in subclass', () => {
      const processor = new ConditionalPostProcessor('test-1');

      // Success context
      expect(processor.shouldRun(mockContext)).toBe(true);

      // Failure context
      const failContext = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: false, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });
      expect(processor.shouldRun(failContext)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should execute successfully', () => {
      const processor = new TestPostProcessor('test-1', {}, { logger: mocks.logger });
      const result = processor.execute(mockContext);

      expect(result.success).toBe(true);
      expect(result.processorId).toBe('test-1');
      expect(result.changes).toHaveLength(1);
      expect(processor.executeCount).toBe(1);
    });

    it('should skip if shouldRun returns false', () => {
      const processor = new ConditionalPostProcessor('test-1', {}, { logger: mocks.logger });

      const failContext = new PostProcessorContext({
        step: { getName: () => 'TestStep' },
        stepResult: { success: false, skipped: false, durationMs: 100 },
        pipelineContext: { getData: () => ({}) }
      });

      const result = processor.execute(failContext);

      expect(result.success).toBe(true);
      expect(result.wasSkipped()).toBe(true);
    });

    it('should catch errors and return failure result', () => {
      const processor = new FailingPostProcessor('test-1', {}, { logger: mocks.logger });
      const result = processor.execute(mockContext);

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Test failure');
      expect(mocks.logger.error).toHaveBeenCalled();
    });

    it('should measure duration', () => {
      const processor = new TestPostProcessor('test-1', {}, { logger: mocks.logger });
      const result = processor.execute(mockContext);

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('_validateConfig', () => {
    it('should be callable without error by default', () => {
      const processor = new TestPostProcessor('test-1');
      expect(() => processor._validateConfig()).not.toThrow();
    });
  });

  describe('_executeImpl', () => {
    it('should throw if not implemented', () => {
      const processor = new PostProcessor('test-1', 'AbstractProcessor', {}, {});
      expect(() => processor._executeImpl(mockContext)).toThrow('must be implemented by subclass');
    });
  });

  describe('getConfigSummary', () => {
    it('should return config summary', () => {
      const processor = new TestPostProcessor('test-1');
      const summary = processor.getConfigSummary();

      expect(summary).toEqual({
        id: 'test-1',
        name: 'TestPostProcessor',
        type: 'TestPostProcessor'
      });
    });
  });
});
