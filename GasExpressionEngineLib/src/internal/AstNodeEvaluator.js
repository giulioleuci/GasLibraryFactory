export class AstNodeEvaluator {
  constructor(facade) {
    this.facade = facade;
  }

  _evaluateNode(node, context) {
    if (!node || typeof node !== 'object' || !node.type) {
      throw new Error('Invalid AST node');
    }

    switch (node.type) {
      case 'Identifier':
        return this._evaluateIdentifier(node, context);
      case 'MemberExpression':
        return this._evaluateMemberExpression(node, context);
      case 'Literal':
        return this._evaluateLiteral(node, context);
      case 'BinaryExpression':
        return this.facade._evaluateBinaryExpression(node, context);
      case 'LogicalExpression':
        return this.facade._evaluateLogicalExpression(node, context);
      case 'UnaryExpression':
        return this.facade._evaluateUnaryExpression(node, context);
      case 'CallExpression':
        return this._evaluateCallExpression(node, context);
      case 'ArrayExpression':
        return this._evaluateArrayExpression(node, context);
      default:
        throw new Error(`Unsupported AST node type: ${node.type}`);
    }
  }

  _evaluateIdentifier(node, context) {
    const identifierName = node.name;
    const placeholderString = `{{${identifierName}}}`;

    try {
      const result = this.facade.placeholderService.processString(placeholderString, context);
      if (result === placeholderString) {
        this.facade.logger.warn(`Unresolved identifier: ${identifierName}`);
        return undefined;
      }
      return this.facade._parseValue(result);
    } catch (error) {
      this.facade.logger.error(`Error resolving identifier ${identifierName}: ${error.message}`);
      throw new Error(`Failed to resolve identifier ${identifierName}: ${error.message}`);
    }
  }

  _evaluateMemberExpression(node, context) {
    const path = this._buildPathFromMemberExpression(node);
    const placeholderString = `{{${path}}}`;

    try {
      const result = this.facade.placeholderService.processString(placeholderString, context);
      if (result === placeholderString) {
        this.facade.logger.warn(`Unresolved member expression: ${path}`);
        return undefined;
      }
      return this.facade._parseValue(result);
    } catch (error) {
      this.facade.logger.error(`Error resolving member expression ${path}: ${error.message}`);
      throw new Error(`Failed to resolve member expression ${path}: ${error.message}`);
    }
  }

  _buildPathFromMemberExpression(node) {
    if (node.type === 'Identifier') {
      return node.name;
    }
    if (node.type === 'MemberExpression') {
      const objectPath = this._buildPathFromMemberExpression(node.object);
      const propertyName = node.computed
        ? this.facade._evaluateNode(node.property, {})
        : node.property.name;
      return `${objectPath}.${propertyName}`;
    }
    throw new Error(`Unexpected node type in member expression: ${node.type}`);
  }

  _evaluateLiteral(node, _context) {
    return node.value;
  }

  _evaluateArrayExpression(node, context) {
    return node.elements.map((elem) => this.facade._evaluateNode(elem, context));
  }

  _evaluateCallExpression(node, context) {
    const funcName = node.callee.name || node.callee.value;
    const args = node.arguments.map((arg) => this.facade._evaluateNode(arg, context));

    const func = this.facade._builtInFunctions[funcName];
    if (!func) {
      throw new Error(`Unknown function: ${funcName}`);
    }

    try {
      return func.apply(this.facade, args);
    } catch (error) {
      throw new Error(`Error in function ${funcName}(): ${error.message}`);
    }
  }
}
