/**
 * @file PipelineFramework/src/postprocessor/__tests__/ValueResolver.test.js
 * @description Unit tests for ValueResolver class
 */

import { ValueResolver } from '../ValueResolver';
import { ValueSource } from '../ValueSource';
import { PostProcessorContext } from '../PostProcessorContext';
import { MockFactory } from '../../../../test/fakes';

describe('ValueResolver', () => {
  let resolver;
  let mocks;
  let mockExpressionEngine;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    mockExpressionEngine = {
      evaluate: jest.fn()
    };

    resolver = new ValueResolver({
      logger: mocks.logger,
      expressionEngine: mockExpressionEngine
    });
  });

  function createContext(pipelineData = {}, stepOutput = {}) {
    return new PostProcessorContext({
      step: { getName: () => 'TestStep' },
      stepResult: {
        success: true,
        skipped: false,
        durationMs: 100,
        output: stepOutput
      },
      pipelineContext: {
        getData: () => pipelineData
      }
    });
  }

  describe('resolve LITERAL', () => {
    it('should return literal string value', () => {
      const source = ValueSource.literal('test-value');
      const context = createContext();

      const result = resolver.resolve(source, context);

      expect(result).toBe('test-value');
    });

    it('should return literal number value', () => {
      const source = ValueSource.literal(42);
      const context = createContext();

      const result = resolver.resolve(source, context);

      expect(result).toBe(42);
    });

    it('should return literal boolean value', () => {
      const source = ValueSource.literal(true);
      const context = createContext();

      const result = resolver.resolve(source, context);

      expect(result).toBe(true);
    });

    it('should return literal null value', () => {
      const source = ValueSource.literal(null);
      const context = createContext();

      const result = resolver.resolve(source, context);

      expect(result).toBeNull();
    });

    it('should return literal object value', () => {
      const obj = { key: 'value', nested: { a: 1 } };
      const source = ValueSource.literal(obj);
      const context = createContext();

      const result = resolver.resolve(source, context);

      expect(result).toEqual(obj);
    });
  });

  describe('resolve CONTEXT', () => {
    it('should resolve simple path', () => {
      const source = ValueSource.context('userId');
      const context = createContext({ userId: 'user-123' });

      const result = resolver.resolve(source, context);

      expect(result).toBe('user-123');
    });

    it('should resolve nested path', () => {
      const source = ValueSource.context('user.profile.email');
      const context = createContext({
        user: { profile: { email: 'test@example.com' } }
      });

      const result = resolver.resolve(source, context);

      expect(result).toBe('test@example.com');
    });

    it('should return null for missing path', () => {
      const source = ValueSource.context('nonexistent.path');
      const context = createContext({ userId: 'user-123' });

      const result = resolver.resolve(source, context);

      expect(result).toBeNull();
    });

    it('should handle array access', () => {
      const source = ValueSource.context('items.0.name');
      const context = createContext({
        items: [{ name: 'first' }, { name: 'second' }]
      });

      const result = resolver.resolve(source, context);

      expect(result).toBe('first');
    });
  });

  describe('resolve STEP_OUTPUT', () => {
    it('should resolve output key', () => {
      const source = ValueSource.stepOutput('documentUrl');
      const context = createContext({}, { documentUrl: 'http://example.com/doc' });

      const result = resolver.resolve(source, context);

      expect(result).toBe('http://example.com/doc');
    });

    it('should return null for missing output key', () => {
      const source = ValueSource.stepOutput('nonexistent');
      const context = createContext({}, { documentUrl: 'http://example.com/doc' });

      const result = resolver.resolve(source, context);

      expect(result).toBeNull();
    });
  });

  describe('resolve TIMESTAMP', () => {
    it('should return ISO timestamp by default', () => {
      const source = ValueSource.timestamp();
      const context = createContext();

      const result = resolver.resolve(source, context);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should use format when provided', () => {
      const source = ValueSource.timestamp('yyyy-MM-dd');
      const context = createContext();

      // Note: Actual formatting depends on utils implementation
      const result = resolver.resolve(source, context);

      expect(typeof result).toBe('string');
    });
  });

  describe('resolve EXPRESSION', () => {
    it('should evaluate expression with engine', () => {
      mockExpressionEngine.evaluate.mockReturnValue(42);

      const source = ValueSource.expression('{{count}} + 1');
      const context = createContext({ count: 41 });

      const result = resolver.resolve(source, context);

      expect(result).toBe(42);
      expect(mockExpressionEngine.evaluate).toHaveBeenCalledWith(
        '{{count}} + 1',
        expect.any(Object)
      );
    });

    it('should throw when no expression engine', () => {
      const resolverNoEngine = new ValueResolver({ logger: mocks.logger });
      const source = ValueSource.expression('{{count}} + 1');
      const context = createContext();

      expect(() => resolverNoEngine.resolve(source, context)).toThrow();
    });

    it('should pass expression context to engine', () => {
      mockExpressionEngine.evaluate.mockReturnValue('result');

      const source = ValueSource.expression('{{step.success}}');
      const context = createContext({ userId: 'user-123' });

      resolver.resolve(source, context);

      expect(mockExpressionEngine.evaluate).toHaveBeenCalledWith(
        '{{step.success}}',
        expect.objectContaining({
          step: expect.any(Object),
          pipeline: expect.any(Object)
        })
      );
    });
  });

  describe('resolve from config object', () => {
    it('should resolve from plain object config', () => {
      const config = { type: 'LITERAL', literal: 'from-config' };
      const context = createContext();

      const result = resolver.resolve(config, context);

      expect(result).toBe('from-config');
    });

    it('should resolve CONTEXT from config', () => {
      const config = { type: 'CONTEXT', contextPath: 'user.name' };
      const context = createContext({ user: { name: 'John' } });

      const result = resolver.resolve(config, context);

      expect(result).toBe('John');
    });
  });

  describe('error handling', () => {
    it('should throw for invalid value source type', () => {
      const invalidSource = { type: 'INVALID_TYPE' };
      const context = createContext();

      expect(() => resolver.resolve(invalidSource, context)).toThrow();
    });

    it('should throw when expression evaluation fails', () => {
      mockExpressionEngine.evaluate.mockImplementation(() => {
        throw new Error('Evaluation error');
      });

      const source = ValueSource.expression('{{invalid}}');
      const context = createContext();

      // The resolver wraps errors in ValueResolutionError
      expect(() => resolver.resolve(source, context)).toThrow('Failed to resolve value');
    });
  });

  describe('resolveAll', () => {
    it('should resolve multiple value sources', () => {
      const sources = {
        status: ValueSource.literal('COMPLETED'),
        userId: ValueSource.context('currentUser.id'),
        result: ValueSource.stepOutput('documentUrl')
      };

      const context = createContext(
        { currentUser: { id: 'user-123' } },
        { documentUrl: 'http://example.com' }
      );

      const results = resolver.resolveAll(sources, context);

      expect(results).toEqual({
        status: 'COMPLETED',
        userId: 'user-123',
        result: 'http://example.com'
      });
    });

    it('should handle empty sources object', () => {
      const context = createContext();

      const results = resolver.resolveAll({}, context);

      expect(results).toEqual({});
    });
  });
});
