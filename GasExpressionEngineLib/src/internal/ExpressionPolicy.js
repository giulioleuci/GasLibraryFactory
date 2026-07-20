/**
 * @file AST allow-list for expressions handled by ExpressionEvaluatorService.
 *
 * This module validates parser output only. It never evaluates an expression,
 * resolves a property, or dynamically walks arbitrary object keys.
 */

const unsafeMemberNames = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * The exact node types and operators implemented by AstNodeEvaluator and
 * OperatorHandler. Call expressions are deliberately limited to registered
 * built-ins, whose callee must be a plain identifier.
 */
export const defaultPolicy = Object.freeze({
  allowedNodeTypes: new Set([
    'Literal',
    'Identifier',
    'MemberExpression',
    'BinaryExpression',
    'LogicalExpression',
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
  logicalOperators: new Set(['&&', '||']),
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
export function assertAllowedExpressionAst(ast, policy = defaultPolicy) {
  assertNode(ast, policy);
}

function assertNode(node, policy) {
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
        assertNode(element, policy);
      }
      return;
    case 'MemberExpression':
      assertMemberExpression(node, policy);
      return;
    case 'BinaryExpression':
      assertOperator(node, policy, policy.binaryOperators, 'binary');
      return;
    case 'LogicalExpression':
      assertOperator(node, policy, policy.logicalOperators, 'logical');
      return;
    case 'UnaryExpression':
      if (!policy.unaryOperators.has(node.operator)) {
        throw new Error(`Expression unary operator '${node.operator}' is not allowed`);
      }
      assertNode(node.argument, policy);
      return;
    case 'CallExpression':
      assertCallExpression(node, policy);
      return;
    default:
      throw new Error(`Expression AST node type '${node.type}' is not allowed`);
  }
}

function assertOperator(node, policy, allowedOperators, kind) {
  if (!allowedOperators.has(node.operator)) {
    throw new Error(`Expression ${kind} operator '${node.operator}' is not allowed`);
  }
  assertNode(node.left, policy);
  assertNode(node.right, policy);
}

function assertMemberExpression(node, policy) {
  assertMemberObject(node.object, policy);

  if (node.computed) {
    // Numeric indexing (e.g. items[0]) is the only computed member form the
    // evaluator needs. It cannot name or dynamically resolve a property.
    if (node.property?.type !== 'Literal' || !Number.isInteger(node.property.value)) {
      throw new Error('Computed expression members are not allowed');
    }
    return;
  }

  if (node.property?.type !== 'Identifier' || unsafeMemberNames.has(node.property.name)) {
    throw new Error('Expression member is not allowed');
  }
}

function assertMemberObject(node, policy) {
  if (node?.type === 'Identifier') {
    return;
  }
  if (node?.type === 'MemberExpression') {
    assertMemberExpression(node, policy);
    return;
  }
  throw new Error('Expression member object is not allowed');
}

function assertCallExpression(node, policy) {
  if (node.callee?.type !== 'Identifier') {
    throw new Error('Expression call is not allowed');
  }
  if (!policy.callNames.has(node.callee.name)) {
    throw new Error(`Unknown function: ${node.callee.name}`);
  }
  for (const argument of node.arguments) {
    assertNode(argument, policy);
  }
}
