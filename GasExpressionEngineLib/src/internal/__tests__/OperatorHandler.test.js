// ===================================================================
// FILE: GasExpressionEngineLib/src/internal/__tests__/OperatorHandler.test.js
// ===================================================================
// Direct unit tests for OperatorHandler, exercised against a minimal fake
// facade rather than through ExpressionEvaluatorService. This isolates
// _evaluateBinaryExpression (the highest cognitive-complexity method in the
// class) and its siblings (_evaluateLogicalExpression, _evaluateUnaryExpression,
// _compare, _equals) from AST-dispatch/parsing concerns.
// ===================================================================

import { OperatorHandler } from '../OperatorHandler';

/**
 * Builds a fake facade exposing exactly what OperatorHandler depends on:
 * - _evaluateNode(node): a trivial AST walker that just returns node.value
 *   for Literal nodes (used to drive left/right operand evaluation).
 * - _equals / _compare: delegate back to the handler under test so the
 *   in/match/== etc. branches exercise the real implementation.
 * - logger: jest.fn() spies so warn() calls can be asserted.
 * - _areBothNullOrUndefined: simple helper mirroring EvaluationContextHandler.
 */
function createFacade(handlerRef) {
  const logger = {
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  };
  const facade = {
    logger,
    _areBothNullOrUndefined: (a, b) =>
      (a === null || a === undefined) && (b === null || b === undefined),
    _evaluateNode: (node) => node.value,
    _equals: (a, b) => handlerRef._equals(a, b),
    _compare: (a, b) => handlerRef._compare(a, b)
  };
  return facade;
}

function lit(value) {
  return { type: 'Literal', value };
}

function binNode(operator, left, right) {
  return { type: 'BinaryExpression', operator, left: lit(left), right: lit(right) };
}

describe('OperatorHandler - Direct Unit Tests', () => {
  let facade;
  let handler;

  beforeEach(() => {
    handler = new OperatorHandler({}); // facade patched below after self-reference is available
    facade = createFacade(handler);
    handler.facade = facade;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('stores the facade reference', () => {
      const f = {};
      const h = new OperatorHandler(f);
      expect(h.facade).toBe(f);
    });
  });

  // ===================================================================
  // _evaluateLogicalExpression
  // ===================================================================
  describe('_evaluateLogicalExpression()', () => {
    it('evaluates && short-circuiting on false left', () => {
      const node = {
        operator: '&&',
        left: lit(false),
        right: { type: 'Literal', value: undefined }
      };
      facade._evaluateNode = jest.fn((n) => n.value);
      expect(handler._evaluateLogicalExpression(node, {})).toBe(false);
      expect(facade._evaluateNode).toHaveBeenCalledTimes(1); // right never evaluated
    });

    it('evaluates && evaluating right when left is truthy', () => {
      const node = { operator: '&&', left: lit(1), right: lit('yes') };
      expect(handler._evaluateLogicalExpression(node, {})).toBe(true);
    });

    it('evaluates || short-circuiting on true left', () => {
      const node = {
        operator: '||',
        left: lit(true),
        right: { type: 'Literal', value: undefined }
      };
      facade._evaluateNode = jest.fn((n) => n.value);
      expect(handler._evaluateLogicalExpression(node, {})).toBe(true);
      expect(facade._evaluateNode).toHaveBeenCalledTimes(1);
    });

    it('evaluates || evaluating right when left is falsy', () => {
      const node = { operator: '||', left: lit(0), right: lit('present') };
      expect(handler._evaluateLogicalExpression(node, {})).toBe(true);
    });

    it('throws for unsupported logical operator', () => {
      const node = { operator: '^^', left: lit(true), right: lit(true) };
      expect(() => handler._evaluateLogicalExpression(node, {})).toThrow(
        'Unsupported logical operator: ^^'
      );
    });
  });

  // ===================================================================
  // _evaluateBinaryExpression - logical shortcuts routed through binary
  // ===================================================================
  describe('_evaluateBinaryExpression() - logical operators', () => {
    it('short-circuits && on false left', () => {
      const node = {
        operator: '&&',
        left: lit(false),
        right: { type: 'Literal', value: undefined }
      };
      facade._evaluateNode = jest.fn((n) => n.value);
      expect(handler._evaluateBinaryExpression(node, {})).toBe(false);
      expect(facade._evaluateNode).toHaveBeenCalledTimes(1);
    });

    it('evaluates && to Boolean(right) when left is truthy', () => {
      expect(handler._evaluateBinaryExpression(binNode('&&', 'x', 0), {})).toBe(false);
      expect(handler._evaluateBinaryExpression(binNode('&&', 'x', 'y'), {})).toBe(true);
    });

    it('short-circuits || on true left', () => {
      const node = {
        operator: '||',
        left: lit(true),
        right: { type: 'Literal', value: undefined }
      };
      facade._evaluateNode = jest.fn((n) => n.value);
      expect(handler._evaluateBinaryExpression(node, {})).toBe(true);
      expect(facade._evaluateNode).toHaveBeenCalledTimes(1);
    });

    it('evaluates || to Boolean(right) when left is falsy', () => {
      expect(handler._evaluateBinaryExpression(binNode('||', 0, ''), {})).toBe(false);
      expect(handler._evaluateBinaryExpression(binNode('||', '', 'z'), {})).toBe(true);
    });
  });

  // ===================================================================
  // Comparison operators
  // ===================================================================
  describe('_evaluateBinaryExpression() - comparison operators', () => {
    it('==', () => {
      expect(handler._evaluateBinaryExpression(binNode('==', 5, 5), {})).toBe(true);
      expect(handler._evaluateBinaryExpression(binNode('==', 5, 6), {})).toBe(false);
    });

    it('!=', () => {
      expect(handler._evaluateBinaryExpression(binNode('!=', 5, 6), {})).toBe(true);
      expect(handler._evaluateBinaryExpression(binNode('!=', 5, 5), {})).toBe(false);
    });

    it('>', () => {
      expect(handler._evaluateBinaryExpression(binNode('>', 10, 5), {})).toBe(true);
      expect(handler._evaluateBinaryExpression(binNode('>', 5, 10), {})).toBe(false);
    });

    it('<', () => {
      expect(handler._evaluateBinaryExpression(binNode('<', 5, 10), {})).toBe(true);
      expect(handler._evaluateBinaryExpression(binNode('<', 10, 5), {})).toBe(false);
    });

    it('>=', () => {
      expect(handler._evaluateBinaryExpression(binNode('>=', 5, 5), {})).toBe(true);
      expect(handler._evaluateBinaryExpression(binNode('>=', 4, 5), {})).toBe(false);
    });

    it('<=', () => {
      expect(handler._evaluateBinaryExpression(binNode('<=', 5, 5), {})).toBe(true);
      expect(handler._evaluateBinaryExpression(binNode('<=', 6, 5), {})).toBe(false);
    });
  });

  // ===================================================================
  // 'in' operator
  // ===================================================================
  describe("_evaluateBinaryExpression() - 'in' operator", () => {
    it('returns true when left is found in right array', () => {
      const node = {
        operator: 'in',
        left: lit('b'),
        right: { type: 'Literal', value: ['a', 'b', 'c'] }
      };
      expect(handler._evaluateBinaryExpression(node, {})).toBe(true);
    });

    it('returns false when left is not found', () => {
      const node = {
        operator: 'in',
        left: lit('z'),
        right: { type: 'Literal', value: ['a', 'b', 'c'] }
      };
      expect(handler._evaluateBinaryExpression(node, {})).toBe(false);
    });

    it('returns false for empty array', () => {
      const node = { operator: 'in', left: lit('a'), right: { type: 'Literal', value: [] } };
      expect(handler._evaluateBinaryExpression(node, {})).toBe(false);
    });

    it('throws when right side is not an array', () => {
      const node = { operator: 'in', left: lit('a'), right: lit('not-array') };
      expect(() => handler._evaluateBinaryExpression(node, {})).toThrow(
        '"in" operator requires an array on the right side, received: string'
      );
    });
  });

  // ===================================================================
  // 'match' operator
  // ===================================================================
  describe("_evaluateBinaryExpression() - 'match' operator", () => {
    it('returns true when the regex matches', () => {
      const node = { operator: 'match', left: lit('hello123'), right: lit('^hello\\d+$') };
      expect(handler._evaluateBinaryExpression(node, {})).toBe(true);
    });

    it('returns false when the regex does not match', () => {
      const node = { operator: 'match', left: lit('nope'), right: lit('^hello\\d+$') };
      expect(handler._evaluateBinaryExpression(node, {})).toBe(false);
    });

    it('warns and returns false for a non-string left side', () => {
      const node = { operator: 'match', left: lit(123), right: lit('\\d+') };
      expect(handler._evaluateBinaryExpression(node, {})).toBe(false);
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('"match" operator applied to a non-string')
      );
    });

    it('throws for a non-string right side', () => {
      const node = { operator: 'match', left: lit('abc'), right: lit(123) };
      expect(() => handler._evaluateBinaryExpression(node, {})).toThrow(
        '"match" operator requires a regex string on the right side, received: number'
      );
    });

    it('throws for an invalid regex', () => {
      const node = { operator: 'match', left: lit('abc'), right: lit('[unterminated') };
      expect(() => handler._evaluateBinaryExpression(node, {})).toThrow(
        /Invalid regex for "match" operator/
      );
    });
  });

  // ===================================================================
  // Arithmetic operators
  // ===================================================================
  describe("_evaluateBinaryExpression() - '+' operator", () => {
    it('adds two numbers', () => {
      expect(handler._evaluateBinaryExpression(binNode('+', 2, 3), {})).toBe(5);
    });

    it('concatenates when either operand is a string', () => {
      expect(handler._evaluateBinaryExpression(binNode('+', 'a', 'b'), {})).toBe('ab');
      expect(handler._evaluateBinaryExpression(binNode('+', 'val:', 5), {})).toBe('val:5');
      expect(handler._evaluateBinaryExpression(binNode('+', 5, 'x'), {})).toBe('5x');
    });

    it('throws for null/undefined operands', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('+', null, null), {})).toThrow(
        'Invalid operands for + operator: object and object'
      );
      expect(() => handler._evaluateBinaryExpression(binNode('+', undefined, 1), {})).toThrow(
        'Invalid operands for + operator'
      );
    });

    it('throws when either numeric operand is NaN', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('+', NaN, 1), {})).toThrow(
        'Invalid operands for + operator'
      );
    });
  });

  describe("_evaluateBinaryExpression() - '-' operator", () => {
    it('subtracts numbers', () => {
      expect(handler._evaluateBinaryExpression(binNode('-', 10, 4), {})).toBe(6);
    });

    it('throws for non-numeric operands', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('-', 'a', 1), {})).toThrow(
        'Subtraction operator requires numeric operands'
      );
      expect(() => handler._evaluateBinaryExpression(binNode('-', 1, NaN), {})).toThrow(
        'Subtraction operator requires numeric operands'
      );
    });
  });

  describe("_evaluateBinaryExpression() - '*' operator", () => {
    it('multiplies numbers', () => {
      expect(handler._evaluateBinaryExpression(binNode('*', 4, 5), {})).toBe(20);
    });

    it('throws for non-numeric operands', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('*', 4, 'x'), {})).toThrow(
        'Multiplication operator requires numeric operands'
      );
    });
  });

  describe("_evaluateBinaryExpression() - '/' operator", () => {
    it('divides numbers', () => {
      expect(handler._evaluateBinaryExpression(binNode('/', 10, 4), {})).toBe(2.5);
    });

    it('throws on division by zero', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('/', 10, 0), {})).toThrow(
        'Division by zero'
      );
    });

    it('throws for non-numeric operands', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('/', 'a', 2), {})).toThrow(
        'Division operator requires numeric operands'
      );
    });
  });

  describe("_evaluateBinaryExpression() - '%' operator", () => {
    it('computes modulo', () => {
      expect(handler._evaluateBinaryExpression(binNode('%', 10, 3), {})).toBe(1);
    });

    it('throws on modulo by zero', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('%', 10, 0), {})).toThrow(
        'Modulo by zero'
      );
    });

    it('throws for non-numeric operands', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('%', 'a', 2), {})).toThrow(
        'Modulo operator requires numeric operands'
      );
    });
  });

  describe('_evaluateBinaryExpression() - unsupported operator', () => {
    it('throws for an unknown operator', () => {
      expect(() => handler._evaluateBinaryExpression(binNode('**', 2, 3), {})).toThrow(
        'Unsupported binary operator: **'
      );
    });
  });

  // ===================================================================
  // _evaluateUnaryExpression
  // ===================================================================
  describe('_evaluateUnaryExpression()', () => {
    it('negates truthy/falsy values with !', () => {
      expect(handler._evaluateUnaryExpression({ operator: '!', argument: lit(true) }, {})).toBe(
        false
      );
      expect(handler._evaluateUnaryExpression({ operator: '!', argument: lit(0) }, {})).toBe(true);
    });

    it('throws for unsupported unary operator', () => {
      expect(() =>
        handler._evaluateUnaryExpression({ operator: '-', argument: lit(5) }, {})
      ).toThrow('Unsupported unary operator: -');
    });
  });

  // ===================================================================
  // _compare
  // ===================================================================
  describe('_compare()', () => {
    it('returns 0 when both are null/undefined', () => {
      expect(handler._compare(null, null)).toBe(0);
      expect(handler._compare(undefined, undefined)).toBe(0);
      expect(handler._compare(null, undefined)).toBe(0);
    });

    it('orders null/undefined as less than a real value', () => {
      expect(handler._compare(null, 5)).toBe(-1);
      expect(handler._compare(5, null)).toBe(1);
    });

    it('throws for NaN operands', () => {
      expect(() => handler._compare(NaN, 1)).toThrow('Cannot compare NaN values');
      expect(() => handler._compare(1, NaN)).toThrow('Cannot compare NaN values');
    });

    it('compares Dates by timestamp', () => {
      const a = new Date(2020, 0, 1);
      const b = new Date(2021, 0, 1);
      expect(handler._compare(a, b)).toBeLessThan(0);
      expect(handler._compare(b, a)).toBeGreaterThan(0);
      expect(handler._compare(a, new Date(2020, 0, 1))).toBe(0);
    });

    it('throws when comparing a Date against a non-Date', () => {
      expect(() => handler._compare(new Date(), 5)).toThrow(/Cannot compare Date with number/);
      expect(() => handler._compare('str', new Date())).toThrow(/Cannot compare Date with string/);
    });

    it('throws when comparing mismatched types', () => {
      expect(() => handler._compare(5, 'five')).toThrow('[STRICT MODE]');
      expect(() => handler._compare(true, 1)).toThrow('[STRICT MODE]');
    });

    it('compares numbers', () => {
      expect(handler._compare(1, 2)).toBeLessThan(0);
      expect(handler._compare(2, 1)).toBeGreaterThan(0);
      expect(handler._compare(2, 2)).toBe(0);
    });

    it('compares strings via localeCompare', () => {
      expect(handler._compare('a', 'b')).toBeLessThan(0);
      expect(handler._compare('b', 'a')).toBeGreaterThan(0);
      expect(handler._compare('a', 'a')).toBe(0);
    });

    it('compares booleans', () => {
      expect(handler._compare(false, true)).toBe(-1);
      expect(handler._compare(true, false)).toBe(1);
      expect(handler._compare(true, true)).toBe(0);
    });

    it('throws for other unsupported same-type comparisons (objects)', () => {
      expect(() => handler._compare({}, {})).toThrow('[STRICT MODE]');
    });
  });

  // ===================================================================
  // _equals
  // ===================================================================
  describe('_equals()', () => {
    it('returns true for strictly identical values', () => {
      expect(handler._equals(5, 5)).toBe(true);
      expect(handler._equals('a', 'a')).toBe(true);
      const obj = {};
      expect(handler._equals(obj, obj)).toBe(true);
    });

    it('treats null and undefined as equal to each other', () => {
      expect(handler._equals(null, undefined)).toBe(true);
      expect(handler._equals(undefined, null)).toBe(true);
      expect(handler._equals(null, null)).toBe(true);
    });

    it('returns false when only one side is null/undefined', () => {
      expect(handler._equals(null, 0)).toBe(false);
      expect(handler._equals(undefined, 0)).toBe(false);
    });

    it('returns false for NaN on either side', () => {
      expect(handler._equals(NaN, NaN)).toBe(false);
      expect(handler._equals(NaN, 5)).toBe(false);
      expect(handler._equals(5, NaN)).toBe(false);
    });

    it('warns and returns false for mismatched types', () => {
      expect(handler._equals(5, '5')).toBe(false);
      expect(facade.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('[STRICT MODE] Type mismatch in equality comparison')
      );
    });

    it('compares strings case-sensitively', () => {
      expect(handler._equals('Hello', 'hello')).toBe(false);
      expect(handler._equals('hello', 'hello')).toBe(true);
    });

    it('compares same-type non-string values with ===', () => {
      expect(handler._equals(5, 6)).toBe(false);
      expect(handler._equals(true, false)).toBe(false);
      expect(handler._equals(true, true)).toBe(true);
    });
  });
});
