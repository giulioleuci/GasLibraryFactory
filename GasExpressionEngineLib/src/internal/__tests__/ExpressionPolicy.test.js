import { ExpressionParserService } from '../../ExpressionParserService.js';
import { assertAllowedExpressionAst, defaultPolicy } from '../ExpressionPolicy.js';

const logger = {
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

describe('ExpressionPolicy', () => {
  let parser;

  beforeEach(() => {
    parser = new ExpressionParserService(logger);
  });

  test('allows evaluator-supported literals, identifiers, member access, comparisons, and logic', () => {
    expect(() =>
      assertAllowedExpressionAst(parser.parse('user.age >= 18 && user.active'), defaultPolicy)
    ).not.toThrow();
    expect(() => assertAllowedExpressionAst(parser.parse('[1, "two", true]'), defaultPolicy)).not.toThrow();
  });

  test('rejects assignments', () => {
    expect(() =>
      assertAllowedExpressionAst(
        { type: 'AssignmentExpression', operator: '=', left: {}, right: {} },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects computed unsafe member access', () => {
    expect(() =>
      assertAllowedExpressionAst(parser.parse('user["constructor"]'), defaultPolicy)
    ).toThrow('not allowed');
  });

  test('rejects unsafe non-computed member access', () => {
    expect(() => assertAllowedExpressionAst(parser.parse('user.constructor'), defaultPolicy)).toThrow(
      'not allowed'
    );
  });

  test('rejects dynamic computed member access', () => {
    expect(() => assertAllowedExpressionAst(parser.parse('user[memberName]'), defaultPolicy)).toThrow(
      'not allowed'
    );
  });

  test('rejects member expressions whose object cannot be evaluated as a path', () => {
    expect(() =>
      assertAllowedExpressionAst(
        {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'user' },
          property: { type: 'Identifier', name: 'name' }
        },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects unsupported binary operators', () => {
    expect(() =>
      assertAllowedExpressionAst(
        {
          type: 'BinaryExpression',
          operator: '**',
          left: { type: 'Literal', value: 2 },
          right: { type: 'Literal', value: 3 }
        },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects unsupported logical operators', () => {
    expect(() =>
      assertAllowedExpressionAst(
        {
          type: 'LogicalExpression',
          operator: '??',
          left: { type: 'Identifier', name: 'left' },
          right: { type: 'Identifier', name: 'right' }
        },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects unsupported unary operators', () => {
    expect(() =>
      assertAllowedExpressionAst(
        {
          type: 'UnaryExpression',
          operator: '-',
          argument: { type: 'Literal', value: 1 }
        },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects constructor call chains', () => {
    expect(() =>
      assertAllowedExpressionAst(parser.parse('constructor.constructor("x")()'), defaultPolicy)
    ).toThrow('not allowed');
  });

  test('rejects calls that are not explicitly approved', () => {
    expect(() => assertAllowedExpressionAst(parser.parse('unknownFunction(user.name)'), defaultPolicy)).toThrow(
      'Unknown function: unknownFunction'
    );
  });
});
