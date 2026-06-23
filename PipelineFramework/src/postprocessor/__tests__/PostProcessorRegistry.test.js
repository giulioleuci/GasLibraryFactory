/**
 * @file PipelineFramework/src/postprocessor/__tests__/PostProcessorRegistry.test.js
 * @description Unit tests for PostProcessorRegistry class
 */

import { PostProcessorRegistry } from '../PostProcessorRegistry';
import { PostProcessor } from '../PostProcessor';
import { PostProcessorResult } from '../PostProcessorResult';
import { ProcessorNotFoundError } from '../../internal/postprocessor-errors/PostProcessorError';
import { MockFactory } from '../../../../test/fakes';

// Test processor class
class TestProcessor extends PostProcessor {
  constructor(id, config, services) {
    super(id, 'TestProcessor', config, services);
  }

  _executeImpl(_context) {
    return PostProcessorResult.success(this.id);
  }
}

class AnotherProcessor extends PostProcessor {
  constructor(id, config, services) {
    super(id, 'AnotherProcessor', config, services);
  }

  _executeImpl(_context) {
    return PostProcessorResult.success(this.id);
  }
}

describe('PostProcessorRegistry', () => {
  let registry;
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    registry = new PostProcessorRegistry({ logger: mocks.logger });
  });

  describe('register', () => {
    it('should register a processor type', () => {
      registry.register('Test', TestProcessor);

      expect(registry.has('Test')).toBe(true);
      expect(registry.size).toBe(1);
    });

    it('should support method chaining', () => {
      const result = registry.register('Test', TestProcessor).register('Another', AnotherProcessor);

      expect(result).toBe(registry);
      expect(registry.size).toBe(2);
    });

    it('should throw for invalid type', () => {
      expect(() => registry.register('', TestProcessor)).toThrow();
      expect(() => registry.register(null, TestProcessor)).toThrow();
    });

    it('should throw for invalid constructor', () => {
      expect(() => registry.register('Test', 'not-a-function')).toThrow();
      expect(() => registry.register('Test', null)).toThrow();
    });

    it('should overwrite existing registration', () => {
      registry.register('Test', TestProcessor);
      registry.register('Test', AnotherProcessor);

      expect(registry.size).toBe(1);
      expect(registry.get('Test')).toBe(AnotherProcessor);
    });
  });

  describe('unregister', () => {
    it('should remove registered type', () => {
      registry.register('Test', TestProcessor);
      const removed = registry.unregister('Test');

      expect(removed).toBe(true);
      expect(registry.has('Test')).toBe(false);
    });

    it('should return false for non-existent type', () => {
      const removed = registry.unregister('NonExistent');

      expect(removed).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true for registered type', () => {
      registry.register('Test', TestProcessor);

      expect(registry.has('Test')).toBe(true);
    });

    it('should return false for unregistered type', () => {
      expect(registry.has('NonExistent')).toBe(false);
    });
  });

  describe('get', () => {
    it('should return constructor for registered type', () => {
      registry.register('Test', TestProcessor);

      expect(registry.get('Test')).toBe(TestProcessor);
    });

    it('should return undefined for unregistered type', () => {
      expect(registry.get('NonExistent')).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create processor instance', () => {
      registry.register('Test', TestProcessor);

      const processor = registry.create({
        processorType: 'Test',
        instanceId: 'test-1',
        config: { setting: 'value' }
      });

      expect(processor).toBeInstanceOf(TestProcessor);
      expect(processor.getId()).toBe('test-1');
    });

    it('should generate id if not provided', () => {
      registry.register('Test', TestProcessor);

      const processor = registry.create({
        processorType: 'Test',
        config: {}
      });

      expect(processor.getId()).toMatch(/^Test-\d+$/);
    });

    it('should pass services to constructor', () => {
      registry.register('Test', TestProcessor);

      const services = { logger: mocks.logger, database: {} };
      const processor = registry.create({ processorType: 'Test', instanceId: 'test-1' }, services);

      expect(processor._logger).toBe(mocks.logger);
    });

    it('should throw for unregistered type', () => {
      expect(() => registry.create({ processorType: 'Unknown' })).toThrow(ProcessorNotFoundError);
    });

    it('should throw if config is invalid', () => {
      expect(() => registry.create(null)).toThrow();
      expect(() => registry.create('string')).toThrow();
    });

    it('should throw if processorType is missing', () => {
      expect(() => registry.create({ instanceId: 'test' })).toThrow();
    });
  });

  describe('createAll', () => {
    it('should create multiple processor instances', () => {
      registry.register('Test', TestProcessor);
      registry.register('Another', AnotherProcessor);

      const processors = registry.createAll([
        { processorType: 'Test', instanceId: 'test-1' },
        { processorType: 'Another', instanceId: 'another-1' }
      ]);

      expect(processors).toHaveLength(2);
      expect(processors[0]).toBeInstanceOf(TestProcessor);
      expect(processors[1]).toBeInstanceOf(AnotherProcessor);
    });

    it('should throw for non-array input', () => {
      expect(() => registry.createAll('not-array')).toThrow();
    });

    it('should pass services to all processors', () => {
      registry.register('Test', TestProcessor);

      const services = { logger: mocks.logger };
      const processors = registry.createAll(
        [
          { processorType: 'Test', instanceId: 'test-1' },
          { processorType: 'Test', instanceId: 'test-2' }
        ],
        services
      );

      expect(processors[0]._logger).toBe(mocks.logger);
      expect(processors[1]._logger).toBe(mocks.logger);
    });
  });

  describe('getRegisteredTypes', () => {
    it('should return empty array when no types registered', () => {
      expect(registry.getRegisteredTypes()).toEqual([]);
    });

    it('should return all registered type names', () => {
      registry.register('Test', TestProcessor);
      registry.register('Another', AnotherProcessor);

      const types = registry.getRegisteredTypes();

      expect(types).toContain('Test');
      expect(types).toContain('Another');
      expect(types).toHaveLength(2);
    });
  });

  describe('clear', () => {
    it('should remove all registered types', () => {
      registry.register('Test', TestProcessor);
      registry.register('Another', AnotherProcessor);

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.has('Test')).toBe(false);
      expect(registry.has('Another')).toBe(false);
    });

    it('should support method chaining', () => {
      const result = registry.clear();

      expect(result).toBe(registry);
    });
  });
});
