/**
 * @fileoverview Unit tests for ExpressionParserService (JSEP-based)
 * Tests the JSEP integration, preprocessing, and custom operator support.
 */

import { LoggerService } from '@CoreUtilsLib';
import { ExpressionParserService } from '../ExpressionParserService';

describe('ExpressionParserService - JSEP Integration', () => {
  let logger;
  let parser;

  beforeEach(() => {
    logger = new LoggerService();
    parser = new ExpressionParserService(logger);
  });

  describe('Constructor Validation', () => {
    it('should throw error if logger is null', () => {
      expect(() => new ExpressionParserService(null)).toThrow('logger is required');
    });

    it('should throw error if logger is undefined', () => {
      expect(() => new ExpressionParserService(undefined)).toThrow('logger is required');
    });

    it('should throw error if logger is not an object', () => {
      expect(() => new ExpressionParserService('not an object')).toThrow('logger is required');
    });

    it('should throw error if logger.debug is not a function', () => {
      const invalidLogger = { error: () => {} };
      expect(() => new ExpressionParserService(invalidLogger)).toThrow(
        'logger.debug must be a function'
      );
    });

    it('should throw error if logger.error is not a function', () => {
      const invalidLogger = { debug: () => {} };
      expect(() => new ExpressionParserService(invalidLogger)).toThrow(
        'logger.error must be a function'
      );
    });

    it('should create instance with valid logger', () => {
      expect(parser).toBeDefined();
      expect(parser.logger).toBe(logger);
      expect(parser.MAX_INPUT_LENGTH).toBe(10000);
    });
  });

  describe('Placeholder Preprocessing', () => {
    it('should convert {{placeholder}} to identifier', () => {
      const ast = parser.parse('{{age}} > 18');
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.left.type).toBe('Identifier');
      expect(ast.left.name).toBe('age');
    });

    it('should convert {{nested.property}} to member expression', () => {
      const ast = parser.parse('{{user.age}} > 18');
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.left.type).toBe('MemberExpression');
    });

    it('should handle nested placeholders', () => {
      const ast = parser.parse('{{outer.{{inner}}}} == 5');
      // After preprocessing, this becomes "outer.inner == 5"
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.left.type).toBe('MemberExpression');
    });

    it('should handle multiple placeholders in one expression', () => {
      const ast = parser.parse('{{age}} >= 18 && {{status}} == "active"');
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.operator).toBe('&&');
    });
  });

  describe('Between Operator Preprocessing', () => {
    it('should convert between operator to function call', () => {
      const ast = parser.parse('{{grade}} between 60, 100');
      expect(ast.type).toBe('CallExpression');
      expect(ast.callee.name).toBe('between');
      expect(ast.arguments).toHaveLength(3);
    });

    it('should handle between with literals', () => {
      const ast = parser.parse('age between 18, 65');
      expect(ast.type).toBe('CallExpression');
      expect(ast.callee.name).toBe('between');
    });
  });

  describe('Custom Operators', () => {
    it('should parse IN operator', () => {
      const ast = parser.parse('{{status}} in ["active", "pending"]');
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.operator).toBe('in');
    });

    it('should parse MATCH operator', () => {
      const ast = parser.parse('{{email}} match "^[a-z]+@"');
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.operator).toBe('match');
    });
  });

  describe('Standard Operators', () => {
    it('should parse comparison operators', () => {
      const operators = ['==', '!=', '>', '<', '>=', '<='];
      operators.forEach((op) => {
        const ast = parser.parse(`{{val}} ${op} 5`);
        expect(ast.type).toBe('BinaryExpression');
        expect(ast.operator).toBe(op);
      });
    });

    it('should parse logical operators', () => {
      const ast1 = parser.parse('{{a}} && {{b}}');
      expect(ast1.type).toBe('BinaryExpression');
      expect(ast1.operator).toBe('&&');

      const ast2 = parser.parse('{{a}} || {{b}}');
      expect(ast2.type).toBe('BinaryExpression');
      expect(ast2.operator).toBe('||');
    });

    it('should parse NOT operator', () => {
      const ast = parser.parse('!{{active}}');
      expect(ast.type).toBe('UnaryExpression');
      expect(ast.operator).toBe('!');
      expect(ast.prefix).toBe(true);
    });

    it('should parse arithmetic operators', () => {
      const operators = ['+', '-', '*', '/', '%'];
      operators.forEach((op) => {
        const ast = parser.parse(`{{a}} ${op} {{b}}`);
        expect(ast.type).toBe('BinaryExpression');
        expect(ast.operator).toBe(op);
      });
    });
  });

  describe('Literals', () => {
    it('should parse string literals', () => {
      const ast = parser.parse('"hello"');
      expect(ast.type).toBe('Literal');
      expect(ast.value).toBe('hello');
    });

    it('should parse number literals', () => {
      const ast = parser.parse('42');
      expect(ast.type).toBe('Literal');
      expect(ast.value).toBe(42);
    });

    it('should parse boolean literals', () => {
      const ast1 = parser.parse('true');
      expect(ast1.type).toBe('Literal');
      expect(ast1.value).toBe(true);

      const ast2 = parser.parse('false');
      expect(ast2.type).toBe('Literal');
      expect(ast2.value).toBe(false);
    });

    it('should parse null literal', () => {
      const ast = parser.parse('null');
      expect(ast.type).toBe('Literal');
      expect(ast.value).toBe(null);
    });
  });

  describe('Arrays', () => {
    it('should parse array literals', () => {
      const ast = parser.parse('[1, 2, 3]');
      expect(ast.type).toBe('ArrayExpression');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0].value).toBe(1);
    });

    it('should parse empty arrays', () => {
      const ast = parser.parse('[]');
      expect(ast.type).toBe('ArrayExpression');
      expect(ast.elements).toHaveLength(0);
    });

    it('should parse arrays with strings', () => {
      const ast = parser.parse('["a", "b", "c"]');
      expect(ast.type).toBe('ArrayExpression');
      expect(ast.elements[0].value).toBe('a');
    });
  });

  describe('Function Calls', () => {
    it('should parse function with no arguments', () => {
      const ast = parser.parse('len()');
      expect(ast.type).toBe('CallExpression');
      expect(ast.callee.name).toBe('len');
      expect(ast.arguments).toHaveLength(0);
    });

    it('should parse function with single argument', () => {
      const ast = parser.parse('abs({{val}})');
      expect(ast.type).toBe('CallExpression');
      expect(ast.callee.name).toBe('abs');
      expect(ast.arguments).toHaveLength(1);
    });

    it('should parse function with multiple arguments', () => {
      const ast = parser.parse('substring({{text}}, 0, 5)');
      expect(ast.type).toBe('CallExpression');
      expect(ast.callee.name).toBe('substring');
      expect(ast.arguments).toHaveLength(3);
    });

    it('should parse nested function calls', () => {
      const ast = parser.parse('abs(round({{val}}))');
      expect(ast.type).toBe('CallExpression');
      expect(ast.callee.name).toBe('abs');
      expect(ast.arguments[0].type).toBe('CallExpression');
      expect(ast.arguments[0].callee.name).toBe('round');
    });
  });

  describe('Parentheses and Grouping', () => {
    it('should handle parentheses for grouping', () => {
      const ast = parser.parse('({{a}} + {{b}}) * {{c}}');
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.operator).toBe('*');
      expect(ast.left.type).toBe('BinaryExpression');
      expect(ast.left.operator).toBe('+');
    });

    it('should handle nested parentheses', () => {
      const ast = parser.parse('(({{a}}))');
      expect(ast.type).toBe('Identifier');
      expect(ast.name).toBe('a');
    });
  });

  describe('Complex Expressions', () => {
    it('should parse complex real-world expression', () => {
      const expr = '!({{student.recentAbsences}} > 0 && {{class.year}} == 5)';
      const ast = parser.parse(expr);
      expect(ast.type).toBe('UnaryExpression');
      expect(ast.operator).toBe('!');
      expect(ast.argument.type).toBe('BinaryExpression');
    });

    it('should handle operator precedence', () => {
      const ast = parser.parse('{{a}} || {{b}} && {{c}}');
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.operator).toBe('||');
      expect(ast.right.type).toBe('BinaryExpression');
      expect(ast.right.operator).toBe('&&');
    });

    it('should parse mixed operators', () => {
      const expr = '{{grade}} >= 60 && {{status}} in ["active", "pending"]';
      const ast = parser.parse(expr);
      expect(ast.type).toBe('BinaryExpression');
      expect(ast.operator).toBe('&&');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty expression string', () => {
      expect(() => parser.parse('')).toThrow('Invalid expression');
    });

    it('should handle null expression', () => {
      expect(() => parser.parse(null)).toThrow('Invalid expression');
    });

    it('should handle undefined expression', () => {
      expect(() => parser.parse(undefined)).toThrow('Invalid expression');
    });

    it('should handle expression exceeding max length', () => {
      const longExpr = '{{a}} == 1 && '.repeat(1000) + '{{b}} == 2';
      expect(() => parser.parse(longExpr)).toThrow('Expression too long');
    });

    it('should handle syntax errors', () => {
      expect(() => parser.parse('{{a}} ==')).toThrow('Failed to parse expression');
    });

    it('should handle unmatched quotes', () => {
      expect(() => parser.parse('"unclosed string')).toThrow('Failed to parse expression');
    });
  });

  describe('DI Configuration', () => {
    it('should have DI configuration', () => {
      const di = ExpressionParserService.di;
      expect(di).toBeDefined();
      expect(di.name).toBe('expressionParserService');
      expect(di.dependencies).toEqual(['logger']);
      expect(di.isSingleton).toBe(true);
    });

    it('should create instance via DI factory', () => {
      const di = ExpressionParserService.di;
      const instance = di.factory(logger);
      expect(instance).toBeInstanceOf(ExpressionParserService);
    });
  });
});
