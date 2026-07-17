import { RegexUtils } from '@CoreUtilsLib';

export class OperatorHandler {
  constructor(facade) {
    this.facade = facade;
  }

  _evaluateLogicalExpression(node, context) {
    const operator = node.operator;

    if (operator === '&&') {
      const left = this.facade._evaluateNode(node.left, context);
      if (!left) {
        return false;
      }
      return Boolean(this.facade._evaluateNode(node.right, context));
    }

    if (operator === '||') {
      const left = this.facade._evaluateNode(node.left, context);
      if (left) {
        return true;
      }
      return Boolean(this.facade._evaluateNode(node.right, context));
    }

    throw new Error(`Unsupported logical operator: ${operator}`);
  }

  _evaluateBinaryExpression(node, context) {
    const operator = node.operator;

    if (operator === '&&') {
      const left = this.facade._evaluateNode(node.left, context);
      if (!left) {
        return false;
      }
      return Boolean(this.facade._evaluateNode(node.right, context));
    }

    if (operator === '||') {
      const left = this.facade._evaluateNode(node.left, context);
      if (left) {
        return true;
      }
      return Boolean(this.facade._evaluateNode(node.right, context));
    }

    const left = this.facade._evaluateNode(node.left, context);
    const right = this.facade._evaluateNode(node.right, context);

    switch (operator) {
      case '==':
        return this.facade._equals(left, right);
      case '!=':
        return !this.facade._equals(left, right);
      case '>':
        return this.facade._compare(left, right) > 0;
      case '<':
        return this.facade._compare(left, right) < 0;
      case '>=':
        return this.facade._compare(left, right) >= 0;
      case '<=':
        return this.facade._compare(left, right) <= 0;
      case 'in':
        if (!Array.isArray(right)) {
          throw new Error(
            `"in" operator requires an array on the right side, received: ${typeof right}`
          );
        }
        if (right.length === 0) {
          return false;
        }
        return right.some((elem) => this.facade._equals(left, elem));
      case 'match':
        if (typeof left !== 'string') {
          this.facade.logger.warn(`"match" operator applied to a non-string: ${typeof left}`);
          return false;
        }
        if (typeof right !== 'string') {
          throw new Error(
            `"match" operator requires a regex string on the right side, received: ${typeof right}`
          );
        }
        RegexUtils.validateSafety(right, this.facade.logger);
        try {
          const regex = new RegExp(right);
          return regex.test(left);
        } catch (error) {
          throw new Error(`Invalid regex for "match" operator: ${right} (${error.message})`);
        }
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        if (
          typeof left === 'number' &&
          !isNaN(left) &&
          typeof right === 'number' &&
          !isNaN(right)
        ) {
          return left + right;
        }
        throw new Error(`Invalid operands for + operator: ${typeof left} and ${typeof right}`);
      case '-':
        if (typeof left !== 'number' || isNaN(left) || typeof right !== 'number' || isNaN(right)) {
          throw new Error(
            `Subtraction operator requires numeric operands, received: ${typeof left} and ${typeof right}`
          );
        }
        return left - right;
      case '*':
        if (typeof left !== 'number' || isNaN(left) || typeof right !== 'number' || isNaN(right)) {
          throw new Error(
            `Multiplication operator requires numeric operands, received: ${typeof left} and ${typeof right}`
          );
        }
        return left * right;
      case '/':
        if (typeof left !== 'number' || isNaN(left) || typeof right !== 'number' || isNaN(right)) {
          throw new Error(
            `Division operator requires numeric operands, received: ${typeof left} and ${typeof right}`
          );
        }
        if (right === 0) {
          throw new Error('Division by zero');
        }
        return left / right;
      case '%':
        if (typeof left !== 'number' || isNaN(left) || typeof right !== 'number' || isNaN(right)) {
          throw new Error(
            `Modulo operator requires numeric operands, received: ${typeof left} and ${typeof right}`
          );
        }
        if (right === 0) {
          throw new Error('Modulo by zero');
        }
        return left % right;
      default:
        throw new Error(`Unsupported binary operator: ${operator}`);
    }
  }

  _evaluateUnaryExpression(node, context) {
    const operator = node.operator;

    if (operator === '!') {
      const argument = this.facade._evaluateNode(node.argument, context);
      return !argument;
    }

    throw new Error(`Unsupported unary operator: ${operator}`);
  }

  _compare(a, b) {
    if (this.facade._areBothNullOrUndefined(a, b)) {
      return 0;
    }
    if (a == null) {
      return -1;
    }
    if (b == null) {
      return 1;
    }

    if (typeof a === 'number' && isNaN(a)) {
      throw new Error('Cannot compare NaN values');
    }
    if (typeof b === 'number' && isNaN(b)) {
      throw new Error('Cannot compare NaN values');
    }

    const typeA = typeof a;
    const typeB = typeof b;

    const isDateA = a instanceof Date;
    const isDateB = b instanceof Date;

    if (isDateA && isDateB) {
      return a.getTime() - b.getTime();
    }

    if (isDateA || isDateB) {
      throw new Error(
        `[STRICT MODE] Cannot compare Date with ${isDateA ? typeB : typeA}. Both operands must be Dates.`
      );
    }

    if (typeA !== typeB) {
      throw new Error(
        `[STRICT MODE] Cannot compare different types: ${typeA} (${JSON.stringify(a)}) vs ${typeB} (${JSON.stringify(b)}). Both operands must be the same type.`
      );
    }

    if (typeof a === 'number' && !isNaN(a) && typeof b === 'number' && !isNaN(b)) {
      return a - b;
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }

    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b ? 0 : a ? 1 : -1;
    }

    throw new Error(
      `[STRICT MODE] Cannot compare values of type ${typeA}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`
    );
  }

  _equals(a, b) {
    if (a === b) {
      return true;
    }

    if (this.facade._areBothNullOrUndefined(a, b)) {
      return true;
    }
    if (a == null || b == null) {
      return false;
    }

    if (typeof a === 'number' && isNaN(a)) {
      return false;
    }
    if (typeof b === 'number' && isNaN(b)) {
      return false;
    }

    const typeA = typeof a;
    const typeB = typeof b;

    if (typeA !== typeB) {
      this.facade.logger.warn(
        `[STRICT MODE] Type mismatch in equality comparison: ${typeA} (${JSON.stringify(a)}) vs ${typeB} (${JSON.stringify(b)}). Returning false.`
      );
      return false;
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a === b;
    }

    return a === b;
  }
}
