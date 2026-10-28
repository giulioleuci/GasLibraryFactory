import { ExpressionParserService } from '../../ExpressionParserService.js';
import { assertAllowedExpressionAst, defaultPolicy } from '../ExpressionPolicy.js';

const logger = {
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

describe('ExpressionPolicy', () => {
  let parser: InstanceType<typeof ExpressionParserService>;

  beforeEach(() => {
    parser = new ExpressionParserService(logger);
  });

  test('allows evaluator-supported literals, identifiers, member access, comparisons, and logic', () => {
    const comparison = parser.parse('user.age >= 18 && user.active');
    assertAllowedExpressionAst(comparison, defaultPolicy);
    expect(() =>
      assertAllowedExpressionAst({ ...comparison, operator: '**' }, defaultPolicy)
    ).toThrow('not allowed');

    const literals = parser.parse('[1, "two", true]');
    assertAllowedExpressionAst(literals, defaultPolicy);
    expect(() =>
      assertAllowedExpressionAst(
        { ...literals, type: 'AssignmentExpression' as const },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects assignments', () => {
    expect(() =>
      assertAllowedExpressionAst(
        { type: 'AssignmentExpression' as const, operator: '=', left: {}, right: {} },
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
    expect(() =>
      assertAllowedExpressionAst(parser.parse('user.constructor'), defaultPolicy)
    ).toThrow('not allowed');
  });

  test('rejects dynamic computed member access', () => {
    expect(() =>
      assertAllowedExpressionAst(parser.parse('user[memberName]'), defaultPolicy)
    ).toThrow('not allowed');
  });

  test('rejects member expressions whose object cannot be evaluated as a path', () => {
    expect(() =>
      assertAllowedExpressionAst(
        {
          type: 'MemberExpression' as const,
          computed: false,
          object: { type: 'Literal' as const, value: 'user' },
          property: { type: 'Identifier' as const, name: 'name' }
        },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects unsupported binary operators', () => {
    expect(() =>
      assertAllowedExpressionAst(
        {
          type: 'BinaryExpression' as const,
          operator: '**',
          left: { type: 'Literal' as const, value: 2 },
          right: { type: 'Literal' as const, value: 3 }
        },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects unsupported logical operators', () => {
    expect(() =>
      assertAllowedExpressionAst(
        {
          type: 'LogicalExpression' as const,
          operator: '??',
          left: { type: 'Identifier' as const, name: 'left' },
          right: { type: 'Identifier' as const, name: 'right' }
        },
        defaultPolicy
      )
    ).toThrow('not allowed');
  });

  test('rejects unsupported unary operators', () => {
    expect(() =>
      assertAllowedExpressionAst(
        {
          type: 'UnaryExpression' as const,
          operator: '-',
          argument: { type: 'Literal' as const, value: 1 }
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
    expect(() =>
      assertAllowedExpressionAst(parser.parse('unknownFunction(user.name)'), defaultPolicy)
    ).toThrow('Unknown function: unknownFunction');
  });
});
