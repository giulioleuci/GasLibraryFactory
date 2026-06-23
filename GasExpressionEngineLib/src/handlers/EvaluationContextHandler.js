export class EvaluationContextHandler {
  constructor(facade) {
    this.facade = facade;
  }

  _areBothNullOrUndefined(a, b) {
    return a == null && b == null;
  }

  _hasCircularReference(obj, seen = new Set()) {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }
    if (seen.has(obj)) {
      return true;
    }
    seen.add(obj);
    try {
      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (this._hasCircularReference(item, seen)) {
            return true;
          }
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (this._hasCircularReference(obj[key], seen)) {
              return true;
            }
          }
        }
      }
    } catch (e) {
      this.facade.logger.warn(`Error checking circular reference: ${e.message}`);
      return false;
    }
    seen.delete(obj);
    return false;
  }

  evaluate(expressionString, context = {}) {
    if (!expressionString || typeof expressionString !== 'string') {
      throw new Error('Invalid expression: must be a non-empty string');
    }
    if (this._hasCircularReference(context)) {
      throw new Error('Context contains circular references which cannot be safely evaluated');
    }

    this.facade.logger.debug(`Evaluating expression: "${expressionString}"`);

    try {
      const ast = this.facade.parser.parse(expressionString);
      return this.evaluateAst(ast, context);
    } catch (error) {
      this.facade.logger.error(`Error evaluating expression: ${error.message}`);
      throw error;
    }
  }

  evaluateAst(ast, context = {}) {
    if (!ast || typeof ast !== 'object') {
      throw new Error('Invalid AST: must be a non-null object');
    }
    if (!ast.type || typeof ast.type !== 'string') {
      throw new Error('Invalid AST: must have a type property');
    }
    if (context !== null && typeof context !== 'object') {
      throw new Error('Invalid context: must be an object or null');
    }

    try {
      const result = this.facade._evaluateNode(ast, context);
      if (typeof result !== 'boolean') {
        this.facade.logger.warn(`Expression does not return a boolean -> ${result}`);
        return Boolean(result);
      }
      this.facade.logger.debug(`Evaluation result: ${result}`);
      return result;
    } catch (error) {
      this.facade.logger.error(`Error evaluating AST: ${error.message}`);
      throw error;
    }
  }

  _parseValue(value) {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      if (!isNaN(num)) {
        return num;
      }
    }
    if (trimmed.toLowerCase() === 'true') {
      return true;
    }
    if (trimmed.toLowerCase() === 'false') {
      return false;
    }
    if (trimmed.toLowerCase() === 'null') {
      return null;
    }
    return value;
  }
}
