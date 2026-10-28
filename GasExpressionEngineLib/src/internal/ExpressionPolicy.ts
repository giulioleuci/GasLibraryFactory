import type jsep from 'jsep';
type ExpressionPolicy = typeof defaultPolicy;
/**
 * @file AST allow-list for expressions handled by ExpressionEvaluatorService.
 *
 * This module validates parser output only. It never evaluates an expression,
 * resolves a property, or dynamically walks arbitrary object keys.
 */

const unsafeMemberNames = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * The exact node types and operators implemented by ExpressionEvaluatorService's
 * node-evaluation and operator methods. Call expressions are deliberately
 * limited to registered built-ins, whose callee must be a plain identifier.
 */
export const defaultPolicy = Object.freeze({
  allowedNodeTypes: new Set([
    'Literal',
    'Identifier',
    'MemberExpression',
    'BinaryExpression',
    'UnaryExpression',
    'CallExpression',
    'ArrayExpression'
  ]),
  binaryOperators: new Set([
    '==',
    '!=',
    '>',
    '<',
    '>=',
    '<=',
    'in',
    'match',
    '+',
    '-',
    '*',
    '/',
    '%',
    '&&',
    '||'
  ]),
  unaryOperators: new Set(['!']),
  callNames: new Set([
    'len',
    'upper',
    'lower',
    'trim',
    'substring',
    'replace',
    'split',
    'abs',
    'round',
    'ceil',
    'floor',
    'min',
    'max',
    'sqrt',
    'pow',
    'between',
    'length',
    'contains',
    'indexOf',
    'first',
    'last'
  ])
});

/**
 * Ensures an AST can be evaluated by ExpressionEvaluatorService without
 * granting JavaScript object traversal or arbitrary function invocation.
 *
 * @param {Object} ast JSEP AST returned by ExpressionParserService.
 * @param {Object} [policy=defaultPolicy] Explicit AST allow-list.
 * @throws {Error} When a node, operator, member, or call is not allowed.
 */
export function assertAllowedExpressionAst(
  ast: jsep.Expression,
  policy: ExpressionPolicy = defaultPolicy
) {
  assertNode(ast as jsep.CoreExpression, policy);
}

function assertNode(node: jsep.CoreExpression | null | undefined, policy: ExpressionPolicy) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') {
    throw new Error('Expression AST node is not allowed');
  }
  if (!policy.allowedNodeTypes.has(node.type)) {
    throw new Error(`Expression AST node type '${node.type}' is not allowed`);
  }

  switch (node.type) {
    case 'Literal':
    case 'Identifier':
      return;
    case 'ArrayExpression':
      for (const element of node.elements) {
        assertNode(element as jsep.CoreExpression, policy);
      }
      return;
    case 'MemberExpression':
      assertMemberExpression(node as jsep.MemberExpression, policy);
      return;
    case 'BinaryExpression':
      assertOperator(node, policy, policy.binaryOperators, 'binary');
      return;
    case 'UnaryExpression':
      if (!policy.unaryOperators.has(node.operator)) {
        throw new Error(`Expression unary operator '${node.operator}' is not allowed`);
      }
      assertNode(node.argument as jsep.CoreExpression, policy);
      return;
    case 'CallExpression':
      assertCallExpression(node, policy);
      return;
    default:
      throw new Error(`Expression AST node type '${node.type}' is not allowed`);
  }
}

function assertOperator(
  node: jsep.BinaryExpression,
  policy: ExpressionPolicy,
  allowedOperators: ReadonlySet<string>,
  kind: string
) {
  if (!allowedOperators.has(node.operator)) {
    throw new Error(`Expression ${kind} operator '${node.operator}' is not allowed`);
  }
  assertNode(node.left as jsep.CoreExpression, policy);
  assertNode(node.right as jsep.CoreExpression, policy);
}

function assertMemberExpression(node: jsep.MemberExpression, policy: ExpressionPolicy) {
  assertMemberObject(node.object, policy);

  if (node.computed) {
    // Numeric indexing (e.g. items[0]) is the only computed member form the
    // evaluator needs. It cannot name or dynamically resolve a property.
    if (
      node.property?.type !== 'Literal' ||
      !Number.isInteger((node.property as jsep.Literal).value)
    ) {
      throw new Error('Computed expression members are not allowed');
    }
    return;
  }

  if (
    node.property?.type !== 'Identifier' ||
    unsafeMemberNames.has((node.property as jsep.Identifier).name)
  ) {
    throw new Error('Expression member is not allowed');
  }
}

function assertMemberObject(node: jsep.Expression | null | undefined, policy: ExpressionPolicy) {
  if (node?.type === 'Identifier') {
    return;
  }
  if (node?.type === 'MemberExpression') {
    assertMemberExpression(node as jsep.MemberExpression, policy);
    return;
  }
  throw new Error('Expression member object is not allowed');
}

function assertCallExpression(node: jsep.CallExpression, policy: ExpressionPolicy) {
  if (node.callee?.type !== 'Identifier') {
    throw new Error('Expression call is not allowed');
  }
  if (!policy.callNames.has((node.callee as jsep.Identifier).name)) {
    throw new Error(`Unknown function: ${node.callee.name}`);
  }
  for (const argument of node.arguments) {
    assertNode(argument as jsep.CoreExpression, policy);
  }
}
