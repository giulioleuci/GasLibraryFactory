/**
 * @file ComposableContentLib/src/composition/__tests__/VisibilityEvaluator.test.js
 * @description Unit tests for VisibilityEvaluator class.
 */

import { VisibilityEvaluator } from '../../internal/VisibilityEvaluator.js';
import { MockFactory } from '../../../../test/fakes';

describe('VisibilityEvaluator', () => {
  let mocks;

  beforeEach(() => {
    global.resetGasMocks();
    mocks = MockFactory.createAllJest();
  });

  describe('constructor', () => {
    it('should create an instance without an expression engine', () => {
      const evaluator = new VisibilityEvaluator();
      expect(evaluator.hasExpressionEngine()).toBe(false);
    });

    it('should create an instance with an expression engine', () => {
      const evaluator = new VisibilityEvaluator(mocks.expressionEngine);
      expect(evaluator.hasExpressionEngine()).toBe(true);
    });
  });

  describe('isVisible', () => {
    let evaluator;
    let context;

    beforeEach(() => {
      evaluator = new VisibilityEvaluator();
      context = MockFactory.createJestPipelineContext();
      // Add toObject to pipeline context mock for these tests
      context.toObject = jest.fn(() => context.getData());
    });

    it('should return true if visibility is null or undefined', () => {
      expect(evaluator.isVisible(null, context)).toBe(true);
      expect(evaluator.isVisible(undefined, context)).toBe(true);
    });

    it('should handle simple conditions for truthiness', () => {
      expect(evaluator.isVisible('', context)).toBe(true);
      expect(evaluator.isVisible('always', context)).toBe(true);
      expect(evaluator.isVisible('true', context)).toBe(true);
      // Case insensitivity
      expect(evaluator.isVisible(' AlWaYs ', context)).toBe(true);
    });

    it('should handle simple conditions for falsiness', () => {
      expect(evaluator.isVisible('never', context)).toBe(false);
      expect(evaluator.isVisible('false', context)).toBe(false);
      // Case insensitivity
      expect(evaluator.isVisible(' NeVeR ', context)).toBe(false);
    });

    it('should fall back to context-based path evaluation if no engine is present', () => {
      context.get.mockReturnValue(true);
      expect(evaluator.isVisible('user.isActive', context)).toBe(true);
      expect(context.get).toHaveBeenCalledWith('user.isActive');
    });

    it('should delegate to expression engine if present', () => {
      const evaluatorWithEngine = new VisibilityEvaluator(mocks.expressionEngine);
      mocks.expressionEngine.evaluate.mockReturnValue(true);
      context.toObject.mockReturnValue({ user: { isPremium: true } });

      expect(evaluatorWithEngine.isVisible('{{user.isPremium}} == true', context)).toBe(true);
      expect(mocks.expressionEngine.evaluate).toHaveBeenCalledWith('{{user.isPremium}} == true', {
        user: { isPremium: true }
      });
    });
  });

  describe('_evaluateExpression', () => {
    it('should evaluate expression using engine and return boolean', () => {
      const evaluator = new VisibilityEvaluator(mocks.expressionEngine);
      mocks.expressionEngine.evaluate.mockReturnValue('truthy string');
      const testContext = { toObject: () => ({ a: 1 }) };

      const result = evaluator._evaluateExpression('expr', testContext);
      expect(result).toBe(true);
      expect(mocks.expressionEngine.evaluate).toHaveBeenCalledWith('expr', { a: 1 });
    });

    it('should handle context that does not have toObject', () => {
      const evaluator = new VisibilityEvaluator(mocks.expressionEngine);
      mocks.expressionEngine.evaluate.mockReturnValue(true);
      const plainContext = { a: 1 };

      const result = evaluator._evaluateExpression('expr', plainContext);
      expect(result).toBe(true);
      expect(mocks.expressionEngine.evaluate).toHaveBeenCalledWith('expr', { a: 1 });
    });

    it('should return false if expression engine throws an error', () => {
      mocks.expressionEngine.evaluate.mockImplementation(() => {
        throw new Error('Eval error');
      });
      const evaluator = new VisibilityEvaluator(mocks.expressionEngine);

      const result = evaluator._evaluateExpression('bad expr', {});
      expect(result).toBe(false);
    });
  });

  describe('_evaluateSimpleCondition', () => {
    let evaluator;

    beforeEach(() => {
      evaluator = new VisibilityEvaluator();
    });

    it('should support non-negated path checks using context.get', () => {
      const context = { get: jest.fn().mockReturnValue('value') };
      expect(evaluator._evaluateSimpleCondition('user.name', context)).toBe(true);
      expect(context.get).toHaveBeenCalledWith('user.name');
    });

    it('should support negated path checks using context.get', () => {
      const context = { get: jest.fn().mockReturnValue(true) };
      expect(evaluator._evaluateSimpleCondition('!user.isGuest', context)).toBe(false);
      expect(context.get).toHaveBeenCalledWith('user.isGuest');
    });

    it('should fall back to _getByPath if context has no get method', () => {
      const context = { user: { name: 'Alice' } };
      expect(evaluator._evaluateSimpleCondition('user.name', context)).toBe(true);
    });

    it('should properly negate when falling back to _getByPath', () => {
      const context = { user: { isGuest: true } };
      expect(evaluator._evaluateSimpleCondition('!user.isGuest', context)).toBe(false);
    });
  });

  describe('_getByPath', () => {
    let evaluator;

    beforeEach(() => {
      evaluator = new VisibilityEvaluator();
    });

    it('should get nested value by path', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(evaluator._getByPath(obj, 'a.b.c')).toBe(42);
    });

    it('should return undefined if path is missing', () => {
      const obj = { a: { b: {} } };
      expect(evaluator._getByPath(obj, 'a.b.c')).toBeUndefined();
    });

    it('should return undefined if intermediate path is null or undefined', () => {
      const obj = { a: null };
      expect(evaluator._getByPath(obj, 'a.b.c')).toBeUndefined();
    });
  });

  describe('_isTruthy', () => {
    let evaluator;

    beforeEach(() => {
      evaluator = new VisibilityEvaluator();
    });

    it('should evaluate null/undefined as falsy', () => {
      expect(evaluator._isTruthy(null)).toBe(false);
      expect(evaluator._isTruthy(undefined)).toBe(false);
    });

    it('should evaluate booleans correctly', () => {
      expect(evaluator._isTruthy(true)).toBe(true);
      expect(evaluator._isTruthy(false)).toBe(false);
    });

    it('should evaluate numbers correctly', () => {
      expect(evaluator._isTruthy(1)).toBe(true);
      expect(evaluator._isTruthy(-1)).toBe(true);
      expect(evaluator._isTruthy(0)).toBe(false);
      expect(evaluator._isTruthy(NaN)).toBe(false);
    });

    it('should evaluate strings correctly', () => {
      expect(evaluator._isTruthy('hello')).toBe(true);
      expect(evaluator._isTruthy('')).toBe(false);
    });

    it('should evaluate arrays correctly', () => {
      expect(evaluator._isTruthy([1, 2, 3])).toBe(true);
      expect(evaluator._isTruthy([])).toBe(false);
    });

    it('should evaluate objects correctly', () => {
      expect(evaluator._isTruthy({ a: 1 })).toBe(true);
      expect(evaluator._isTruthy({})).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation without engine', () => {
      const evaluator = new VisibilityEvaluator();
      expect(evaluator.toString()).toBe('VisibilityEvaluator[simple]');
    });

    it('should return string representation with engine', () => {
      const engine = {};
      const evaluator = new VisibilityEvaluator(engine);
      expect(evaluator.toString()).toBe('VisibilityEvaluator[expression]');
    });
  });
});
