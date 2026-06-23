// ===================================================================
// FILE: GasExpressionEngineLib/src/__tests__/ExpressionEvaluatorService.test.js
// ===================================================================
// Test Suite for ExpressionEvaluatorService (LOGIC LIBRARY PATTERN)
//
// Pattern: Logic Library Testing
// - Unit testing with FakeLogger injection
// - Tests expression evaluation logic
// - Tests all operators, functions, and edge cases
// - Asserts output matches expected input
// ===================================================================

import { ExpressionEvaluatorService } from '../ExpressionEvaluatorService';
import { ExpressionParserService } from '../ExpressionParserService';
import { MockFactory } from '../../../test/fakes/MockFactory';

// Mock WorkspaceTemplateEngine as a global
import { Mustache, PlaceholderService } from '../../../WorkspaceTemplateEngine/index.js';

describe('ExpressionEvaluatorService (Logic Library Pattern)', () => {
  let logger;
  let parser;
  let placeholderService;
  let evaluator;

  beforeEach(() => {
    // Create fresh dependencies for each test
    logger = MockFactory.createJestLogger();
    const mustache = new Mustache({ logger });
    placeholderService = new PlaceholderService({ logger, mustache });
    parser = new ExpressionParserService(logger);
    evaluator = new ExpressionEvaluatorService(logger, parser, placeholderService);
  });

  afterEach(() => {
    // Clean up
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR VALIDATION TESTS
  // ===================================================================

  describe('Constructor Validation', () => {
    it('should create an instance with required dependencies', () => {
      expect(evaluator).toBeDefined();
      expect(evaluator.logger).toBe(logger);
      expect(evaluator.parser).toBe(parser);
      expect(evaluator.placeholderService).toBe(placeholderService);
    });

    it('should throw error if logger is not provided', () => {
      expect(() => {
        new ExpressionEvaluatorService(null, parser, placeholderService);
      }).toThrow('ExpressionEvaluatorService: logger is required and must be an object');
    });

    it('should throw error if logger is not an object', () => {
      expect(() => {
        new ExpressionEvaluatorService('not an object', parser, placeholderService);
      }).toThrow('ExpressionEvaluatorService: logger is required and must be an object');
    });

    it('should throw error if logger.debug is not a function', () => {
      expect(() => {
        new ExpressionEvaluatorService(
          { error: () => {}, warn: () => {} },
          parser,
          placeholderService
        );
      }).toThrow('ExpressionEvaluatorService: logger.debug must be a function');
    });

    it('should throw error if logger.error is not a function', () => {
      expect(() => {
        new ExpressionEvaluatorService(
          { debug: () => {}, warn: () => {} },
          parser,
          placeholderService
        );
      }).toThrow('ExpressionEvaluatorService: logger.info must be a function');
    });

    it('should throw error if logger.warn is not a function', () => {
      expect(() => {
        new ExpressionEvaluatorService(
          { debug: () => {}, error: () => {} },
          parser,
          placeholderService
        );
      }).toThrow('ExpressionEvaluatorService: logger.info must be a function');
    });

    it('should throw error if parserService is not provided', () => {
      expect(() => {
        new ExpressionEvaluatorService(logger, null, placeholderService);
      }).toThrow('ExpressionEvaluatorService: parserService is required and must be an object');
    });

    it('should throw error if parserService.parse is not a function', () => {
      expect(() => {
        new ExpressionEvaluatorService(logger, {}, placeholderService);
      }).toThrow('ExpressionEvaluatorService: parserService.parse must be a function');
    });

    it('should throw error if placeholderService is not provided', () => {
      expect(() => {
        new ExpressionEvaluatorService(logger, parser, null);
      }).toThrow(
        'ExpressionEvaluatorService: placeholderService is required and must be an object'
      );
    });

    it('should throw error if placeholderService.resolve is not a function', () => {
      expect(() => {
        new ExpressionEvaluatorService(logger, parser, {});
      }).toThrow('ExpressionEvaluatorService: placeholderService.resolve must be a function');
    });
  });

  // ===================================================================
  // TYPE CHECKING UTILITIES TESTS
  // ===================================================================

  describe('Type Checking Utilities', () => {
    it('should correctly check if both values are null/undefined with _areBothNullOrUndefined', () => {
      expect(evaluator._areBothNullOrUndefined(null, null)).toBe(true);
      expect(evaluator._areBothNullOrUndefined(undefined, undefined)).toBe(true);
      expect(evaluator._areBothNullOrUndefined(null, undefined)).toBe(true);
      expect(evaluator._areBothNullOrUndefined(undefined, null)).toBe(true);
      expect(evaluator._areBothNullOrUndefined(null, 0)).toBe(false);
      expect(evaluator._areBothNullOrUndefined(0, null)).toBe(false);
      expect(evaluator._areBothNullOrUndefined(0, 0)).toBe(false);
    });
  });

  // ===================================================================
  // CIRCULAR REFERENCE DETECTION TESTS
  // ===================================================================

  describe('Circular Reference Detection', () => {
    it('should return false for primitives', () => {
      expect(evaluator._hasCircularReference(null)).toBe(false);
      expect(evaluator._hasCircularReference(undefined)).toBe(false);
      expect(evaluator._hasCircularReference(123)).toBe(false);
      expect(evaluator._hasCircularReference('hello')).toBe(false);
      expect(evaluator._hasCircularReference(true)).toBe(false);
    });

    it('should return false for simple objects without circular references', () => {
      expect(evaluator._hasCircularReference({ a: 1, b: 2 })).toBe(false);
      expect(evaluator._hasCircularReference({ nested: { value: 1 } })).toBe(false);
      expect(evaluator._hasCircularReference([1, 2, 3])).toBe(false);
      expect(evaluator._hasCircularReference([{ a: 1 }, { b: 2 }])).toBe(false);
    });

    it('should detect circular reference in object', () => {
      const obj = { a: 1 };
      obj.self = obj;
      expect(evaluator._hasCircularReference(obj)).toBe(true);
    });

    it('should detect circular reference in array', () => {
      const arr = [1, 2];
      arr.push(arr);
      expect(evaluator._hasCircularReference(arr)).toBe(true);
    });

    it('should detect circular reference in nested structure', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: obj1 };
      obj1.ref = obj2;
      expect(evaluator._hasCircularReference(obj1)).toBe(true);
    });

    it('should handle errors during traversal gracefully', () => {
      // Create an object with a property getter that throws
      const obj = {};
      Object.defineProperty(obj, 'badProp', {
        get() {
          throw new Error('Access denied');
        },
        enumerable: true
      });

      // Should not throw, but log a warning
      expect(evaluator._hasCircularReference(obj)).toBe(false);
      expect(logger.getLogsByLevel('WARN').length).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // EVALUATE METHOD TESTS
  // ===================================================================

  describe('evaluate() Method', () => {
    it('should throw error if expression is not a string', () => {
      expect(() => evaluator.evaluate(null, {})).toThrow(
        'Invalid expression: must be a non-empty string'
      );
      expect(() => evaluator.evaluate(undefined, {})).toThrow(
        'Invalid expression: must be a non-empty string'
      );
      expect(() => evaluator.evaluate(123, {})).toThrow(
        'Invalid expression: must be a non-empty string'
      );
      expect(() => evaluator.evaluate('', {})).toThrow(
        'Invalid expression: must be a non-empty string'
      );
    });

    it('should throw error if context has circular references', () => {
      const context = { a: 1 };
      context.self = context;
      expect(() => evaluator.evaluate('{{a}} == 1', context)).toThrow(
        'Context contains circular references which cannot be safely evaluated'
      );
    });

    it('should evaluate a simple expression', () => {
      expect(evaluator.evaluate('{{age}} > 18', { age: 21 })).toBe(true);
      expect(evaluator.evaluate('{{age}} > 18', { age: 15 })).toBe(false);
    });

    it('should log debug messages', () => {
      evaluator.evaluate('{{age}} > 18', { age: 21 });
      expect(logger.getLogsByLevel('DEBUG').length).toBeGreaterThan(0);
    });

    it('should handle evaluation errors and re-throw', () => {
      // Invalid expression that will cause parsing error
      expect(() => evaluator.evaluate('{{age}} >> 18', { age: 21 })).toThrow();
      expect(logger.getLogsByLevel('ERROR').length).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // EVALUATE AST METHOD TESTS
  // ===================================================================

  describe('evaluateAst() Method', () => {
    it('should throw error if AST is not an object', () => {
      expect(() => evaluator.evaluateAst(null, {})).toThrow(
        'Invalid AST: must be a non-null object'
      );
      expect(() => evaluator.evaluateAst(undefined, {})).toThrow(
        'Invalid AST: must be a non-null object'
      );
      expect(() => evaluator.evaluateAst('not an object', {})).toThrow(
        'Invalid AST: must be a non-null object'
      );
    });

    it('should throw error if AST does not have a type property', () => {
      expect(() => evaluator.evaluateAst({}, {})).toThrow('Invalid AST: must have a type property');
      expect(() => evaluator.evaluateAst({ type: null }, {})).toThrow(
        'Invalid AST: must have a type property'
      );
      expect(() => evaluator.evaluateAst({ type: 123 }, {})).toThrow(
        'Invalid AST: must have a type property'
      );
    });

    it('should throw error if context is not an object', () => {
      const ast = { type: 'Literal', value: true };
      expect(() => evaluator.evaluateAst(ast, 'not an object')).toThrow(
        'Invalid context: must be an object or null'
      );
      expect(() => evaluator.evaluateAst(ast, 123)).toThrow(
        'Invalid context: must be an object or null'
      );
    });

    it('should allow null context', () => {
      const ast = { type: 'Literal', value: true };
      expect(evaluator.evaluateAst(ast, null)).toBe(true);
    });

    it('should evaluate a valid AST', () => {
      const ast = parser.parse('{{age}} > 18');
      expect(evaluator.evaluateAst(ast, { age: 21 })).toBe(true);
    });

    it('should convert non-boolean results to boolean with warning', () => {
      const ast = { type: 'Literal', value: 'not a boolean' };
      expect(evaluator.evaluateAst(ast, {})).toBe(true); // truthy string
      expect(logger.getLogsByLevel('WARN').length).toBeGreaterThan(0);
    });

    it('should handle evaluation errors', () => {
      const ast = { type: 'InvalidType' };
      expect(() => evaluator.evaluateAst(ast, {})).toThrow();
      expect(logger.getLogsByLevel('ERROR').length).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // BINARY EXPRESSION - LOGICAL OPERATORS TESTS
  // ===================================================================

  describe('Binary Expression - Logical Operators', () => {
    it('should evaluate AND (&&) operator with short-circuit', () => {
      const context = { a: true, b: true, c: false };
      expect(evaluator.evaluate('{{a}} && {{b}}', context)).toBe(true);
      expect(evaluator.evaluate('{{a}} && {{c}}', context)).toBe(false);
      expect(evaluator.evaluate('{{c}} && {{a}}', context)).toBe(false);
    });

    it('should short-circuit AND operator when left is false', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '&&',
        left: { type: 'Literal', value: false },
        right: { type: 'InvalidType' } // This should not be evaluated
      };
      expect(evaluator.evaluateAst(ast, {})).toBe(false);
    });

    it('should evaluate OR (||) operator with short-circuit', () => {
      const context = { a: true, b: false, c: false };
      expect(evaluator.evaluate('{{a}} || {{b}}', context)).toBe(true);
      expect(evaluator.evaluate('{{b}} || {{c}}', context)).toBe(false);
      expect(evaluator.evaluate('{{c}} || {{a}}', context)).toBe(true);
    });

    it('should short-circuit OR operator when left is true', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '||',
        left: { type: 'Literal', value: true },
        right: { type: 'InvalidType' } // This should not be evaluated
      };
      expect(evaluator.evaluateAst(ast, {})).toBe(true);
    });
  });

  // ===================================================================
  // BINARY EXPRESSION - COMPARISON OPERATORS TESTS
  // ===================================================================

  describe('Binary Expression - Comparison Operators', () => {
    it('should evaluate equality (==) operator', () => {
      expect(evaluator.evaluate('{{a}} == {{b}}', { a: 5, b: 5 })).toBe(true);
      expect(evaluator.evaluate('{{a}} == {{b}}', { a: 5, b: 6 })).toBe(false);
      expect(evaluator.evaluate('{{a}} == {{b}}', { a: 'hello', b: 'hello' })).toBe(true);
    });

    it('should evaluate inequality (!=) operator', () => {
      expect(evaluator.evaluate('{{a}} != {{b}}', { a: 5, b: 6 })).toBe(true);
      expect(evaluator.evaluate('{{a}} != {{b}}', { a: 5, b: 5 })).toBe(false);
    });

    it('should evaluate greater than (>) operator', () => {
      expect(evaluator.evaluate('{{a}} > {{b}}', { a: 10, b: 5 })).toBe(true);
      expect(evaluator.evaluate('{{a}} > {{b}}', { a: 5, b: 10 })).toBe(false);
      expect(evaluator.evaluate('{{a}} > {{b}}', { a: 5, b: 5 })).toBe(false);
    });

    it('should evaluate less than (<) operator', () => {
      expect(evaluator.evaluate('{{a}} < {{b}}', { a: 5, b: 10 })).toBe(true);
      expect(evaluator.evaluate('{{a}} < {{b}}', { a: 10, b: 5 })).toBe(false);
      expect(evaluator.evaluate('{{a}} < {{b}}', { a: 5, b: 5 })).toBe(false);
    });

    it('should evaluate greater than or equal (>=) operator', () => {
      expect(evaluator.evaluate('{{a}} >= {{b}}', { a: 10, b: 5 })).toBe(true);
      expect(evaluator.evaluate('{{a}} >= {{b}}', { a: 5, b: 5 })).toBe(true);
      expect(evaluator.evaluate('{{a}} >= {{b}}', { a: 5, b: 10 })).toBe(false);
    });

    it('should evaluate less than or equal (<=) operator', () => {
      expect(evaluator.evaluate('{{a}} <= {{b}}', { a: 5, b: 10 })).toBe(true);
      expect(evaluator.evaluate('{{a}} <= {{b}}', { a: 5, b: 5 })).toBe(true);
      expect(evaluator.evaluate('{{a}} <= {{b}}', { a: 10, b: 5 })).toBe(false);
    });
  });

  // ===================================================================
  // BINARY EXPRESSION - SPECIAL OPERATORS TESTS
  // ===================================================================

  describe('Binary Expression - Special Operators', () => {
    it('should evaluate IN operator with arrays', () => {
      expect(evaluator.evaluate("{{status}} in ['active', 'pending']", { status: 'active' })).toBe(
        true
      );
      expect(
        evaluator.evaluate("{{status}} in ['active', 'pending']", { status: 'inactive' })
      ).toBe(false);
    });

    it('should throw error for IN operator with non-array right side', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: 'in',
        left: { type: 'Literal', value: 'test' },
        right: { type: 'Literal', value: 'not an array' }
      };
      expect(() => evaluator.evaluateAst(ast, {})).toThrow(
        '"in" operator requires an array on the right side'
      );
    });

    it('should handle IN operator with empty array', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: 'in',
        left: { type: 'Literal', value: 'test' },
        right: { type: 'ArrayExpression', elements: [] }
      };
      expect(evaluator.evaluateAst(ast, {})).toBe(false);
    });

    it('should evaluate MATCH operator with regex', () => {
      expect(
        evaluator.evaluate("{{email}} match '^[a-z]+@test\\.com$'", { email: 'user@test.com' })
      ).toBe(true);
      expect(
        evaluator.evaluate("{{email}} match '^[a-z]+@test\\.com$'", { email: 'invalid' })
      ).toBe(false);
    });

    it('should handle MATCH operator with non-string left side', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: 'match',
        left: { type: 'Literal', value: 123 },
        right: { type: 'Literal', value: '\\d+' }
      };
      expect(evaluator.evaluateAst(ast, {})).toBe(false);
      expect(logger.getLogsByLevel('WARN').length).toBeGreaterThan(0);
    });

    it('should throw error for MATCH operator with non-string right side', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: 'match',
        left: { type: 'Literal', value: 'test' },
        right: { type: 'Literal', value: 123 }
      };
      expect(() => evaluator.evaluateAst(ast, {})).toThrow(
        '"match" operator requires a regex string on the right side'
      );
    });

    it('should throw error for MATCH operator with invalid regex', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: 'match',
        left: { type: 'Literal', value: 'test' },
        right: { type: 'Literal', value: '[invalid(regex' }
      };
      expect(() => evaluator.evaluateAst(ast, {})).toThrow('Invalid regex for "match" operator');
    });
  });

  // ===================================================================
  // BINARY EXPRESSION - ARITHMETIC OPERATORS TESTS
  // ===================================================================

  describe('Binary Expression - Arithmetic Operators', () => {
    it('should evaluate addition (+) with numbers', () => {
      // Test arithmetic within a comparison
      expect(evaluator.evaluate('({{a}} + {{b}}) == 8', { a: 5, b: 3 })).toBe(true);
      expect(evaluator.evaluate('({{a}} + {{b}}) > 7', { a: 5, b: 3 })).toBe(true);
    });

    it('should evaluate addition (+) with strings (concatenation)', () => {
      // Test string concatenation within a comparison
      expect(
        evaluator.evaluate("({{a}} + {{b}}) == 'hello world'", { a: 'hello', b: ' world' })
      ).toBe(true);
    });

    it('should evaluate addition (+) with mixed types (string concatenation)', () => {
      // Test mixed type addition within a comparison
      expect(evaluator.evaluate("({{a}} + {{b}}) == 'value: 123'", { a: 'value: ', b: 123 })).toBe(
        true
      );
    });

    it('should throw error for addition with invalid operands', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: null },
        right: { type: 'Literal', value: null }
      };
      expect(() => evaluator._evaluateBinaryExpression(ast, {})).toThrow(
        'Invalid operands for + operator'
      );
    });

    it('should evaluate subtraction (-) with numbers', () => {
      // Test subtraction within a comparison
      expect(evaluator.evaluate('({{a}} - {{b}}) == 7', { a: 10, b: 3 })).toBe(true);
      expect(evaluator.evaluate('({{a}} - {{b}}) < 10', { a: 10, b: 3 })).toBe(true);
    });

    it('should throw error for subtraction with non-numeric operands', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '-',
        left: { type: 'Literal', value: 'not a number' },
        right: { type: 'Literal', value: 3 }
      };
      expect(() => evaluator._evaluateBinaryExpression(ast, {})).toThrow(
        'Subtraction operator requires numeric operands'
      );
    });

    it('should evaluate multiplication (*) with numbers', () => {
      // Test multiplication within a comparison
      expect(evaluator.evaluate('({{a}} * {{b}}) == 15', { a: 5, b: 3 })).toBe(true);
      expect(evaluator.evaluate('({{a}} * {{b}}) >= 15', { a: 5, b: 3 })).toBe(true);
    });

    it('should throw error for multiplication with non-numeric operands', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '*',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 'not a number' }
      };
      expect(() => evaluator._evaluateBinaryExpression(ast, {})).toThrow(
        'Multiplication operator requires numeric operands'
      );
    });

    it('should evaluate division (/) with numbers', () => {
      // Test division within a comparison
      expect(evaluator.evaluate('({{a}} / {{b}}) == 5', { a: 10, b: 2 })).toBe(true);
      expect(evaluator.evaluate('({{a}} / {{b}}) <= 5', { a: 10, b: 2 })).toBe(true);
    });

    it('should throw error for division by zero', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Literal', value: 10 },
        right: { type: 'Literal', value: 0 }
      };
      expect(() => evaluator._evaluateBinaryExpression(ast, {})).toThrow('Division by zero');
    });

    it('should throw error for division with non-numeric operands', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Literal', value: 10 },
        right: { type: 'Literal', value: 'not a number' }
      };
      expect(() => evaluator._evaluateBinaryExpression(ast, {})).toThrow(
        'Division operator requires numeric operands'
      );
    });

    it('should evaluate modulo (%) with numbers', () => {
      // Test modulo within a comparison
      expect(evaluator.evaluate('({{a}} % {{b}}) == 1', { a: 10, b: 3 })).toBe(true);
      expect(evaluator.evaluate('({{a}} % {{b}}) < 2', { a: 10, b: 3 })).toBe(true);
    });

    it('should throw error for modulo by zero', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '%',
        left: { type: 'Literal', value: 10 },
        right: { type: 'Literal', value: 0 }
      };
      expect(() => evaluator._evaluateBinaryExpression(ast, {})).toThrow('Modulo by zero');
    });

    it('should throw error for modulo with non-numeric operands', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '%',
        left: { type: 'Literal', value: 'not a number' },
        right: { type: 'Literal', value: 3 }
      };
      expect(() => evaluator._evaluateBinaryExpression(ast, {})).toThrow(
        'Modulo operator requires numeric operands'
      );
    });

    it('should throw error for unsupported binary operator', () => {
      const ast = {
        type: 'BinaryExpression',
        operator: '**', // Unsupported operator
        left: { type: 'Literal', value: 2 },
        right: { type: 'Literal', value: 3 }
      };
      expect(() => evaluator._evaluateBinaryExpression(ast, {})).toThrow(
        'Unsupported binary operator: **'
      );
    });
  });

  // ===================================================================
  // UNARY EXPRESSION TESTS
  // ===================================================================

  describe('Unary Expression', () => {
    it('should evaluate NOT (!) operator', () => {
      expect(evaluator.evaluate('!{{flag}}', { flag: true })).toBe(false);
      expect(evaluator.evaluate('!{{flag}}', { flag: false })).toBe(true);
    });

    it('should evaluate NOT operator with truthy/falsy values', () => {
      const ast = {
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Literal', value: 1 }
      };
      expect(evaluator.evaluateAst(ast, {})).toBe(false);

      ast.argument.value = 0;
      expect(evaluator.evaluateAst(ast, {})).toBe(true);
    });

    it('should throw error for unsupported unary operator', () => {
      const ast = {
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Literal', value: 5 }
      };
      expect(() => evaluator.evaluateAst(ast, {})).toThrow('Unsupported unary operator: -');
    });
  });

  // ===================================================================
  // BETWEEN OPERATOR TESTS (now a function, not ternary operator)
  // ===================================================================

  describe('Between Operator (as function)', () => {
    it('should evaluate BETWEEN operator with valid range', () => {
      expect(evaluator.evaluate('{{score}} between 0, 100', { score: 50 })).toBe(true);
      expect(evaluator.evaluate('{{score}} between 0, 100', { score: 0 })).toBe(true);
      expect(evaluator.evaluate('{{score}} between 0, 100', { score: 100 })).toBe(true);
    });

    it('should evaluate BETWEEN operator outside range', () => {
      expect(evaluator.evaluate('{{score}} between 0, 100', { score: -1 })).toBe(false);
      expect(evaluator.evaluate('{{score}} between 0, 100', { score: 101 })).toBe(false);
    });

    it('should work as a built-in function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.between(50, 0, 100)).toBe(true);
      expect(funcs.between(0, 0, 100)).toBe(true);
      expect(funcs.between(100, 0, 100)).toBe(true);
      expect(funcs.between(-1, 0, 100)).toBe(false);
      expect(funcs.between(101, 0, 100)).toBe(false);
    });

    it('should throw error for non-numeric values', () => {
      const funcs = evaluator._builtInFunctions;
      expect(() => funcs.between('not a number', 0, 100)).toThrow(
        'between() requires three numeric values'
      );
    });
  });

  // ===================================================================
  // LITERAL EVALUATION TESTS
  // ===================================================================

  describe('Literal Evaluation', () => {
    it('should evaluate numeric literal', () => {
      const ast = { type: 'Literal', value: 42 };
      expect(evaluator._evaluateLiteral(ast, {})).toBe(42);
    });

    it('should evaluate string literal', () => {
      const ast = { type: 'Literal', value: 'hello' };
      expect(evaluator._evaluateLiteral(ast, {})).toBe('hello');
    });

    it('should evaluate boolean literal', () => {
      const ast = { type: 'Literal', value: true };
      expect(evaluator.evaluateAst(ast, {})).toBe(true);
    });

    it('should evaluate null literal', () => {
      const ast = { type: 'Literal', value: null };
      expect(evaluator._evaluateLiteral(ast, {})).toBe(null);
    });
  });

  // ===================================================================
  // ARRAY EVALUATION TESTS
  // ===================================================================

  describe('Array Evaluation (JSEP ArrayExpression)', () => {
    it('should evaluate array literals in expressions', () => {
      // Arrays are now parsed as ArrayExpression by JSEP
      expect(evaluator.evaluate('{{val}} in [1, 2, 3]', { val: 2 })).toBe(true);
      expect(evaluator.evaluate('{{val}} in [1, 2, 3]', { val: 4 })).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(evaluator.evaluate('{{val}} in []', { val: 1 })).toBe(false);
    });

    it('should handle string arrays', () => {
      expect(evaluator.evaluate('{{status}} in ["active", "pending"]', { status: 'active' })).toBe(
        true
      );
      expect(
        evaluator.evaluate('{{status}} in ["active", "pending"]', { status: 'inactive' })
      ).toBe(false);
    });
  });

  // ===================================================================
  // FUNCTION CALL EVALUATION TESTS
  // ===================================================================

  describe('Function Call Evaluation - String Functions', () => {
    it('should evaluate len() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.len('hello')).toBe(5);
      expect(funcs.len(null)).toBe(0);
      expect(funcs.len('')).toBe(0);
    });

    it('should evaluate upper() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.upper('hello')).toBe('HELLO');
      expect(funcs.upper(null)).toBe('');
    });

    it('should evaluate lower() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.lower('HELLO')).toBe('hello');
      expect(funcs.lower(null)).toBe('');
    });

    it('should evaluate trim() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.trim('  hello  ')).toBe('hello');
      expect(funcs.trim(null)).toBe('');
    });

    it('should evaluate substring() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.substring('hello world', 0, 5)).toBe('hello');
      expect(funcs.substring('hello world', 6)).toBe('world');
      expect(funcs.substring(null, 0, 5)).toBe('');
    });

    it('should evaluate replace() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.replace('hello world', 'world', 'there')).toBe('hello there');
      expect(funcs.replace(null, 'test', 'x')).toBe('');
    });

    it('should evaluate split() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.split('a,b,c', ',')).toEqual(['a', 'b', 'c']);
      expect(funcs.split(null, ',')).toEqual([]);
    });
  });

  describe('Function Call Evaluation - Numeric Functions', () => {
    it('should evaluate abs() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.abs(-5)).toBe(5);
      expect(funcs.abs(5)).toBe(5);
      expect(() => funcs.abs('not a number')).toThrow('abs() requires a number');
    });

    it('should evaluate round() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.round(3.7)).toBe(4);
      expect(funcs.round(3.14159, 2)).toBe(3.14);
      expect(funcs.round(3.4)).toBe(3);
      expect(() => funcs.round('not a number')).toThrow('round() requires a number');
    });

    it('should evaluate ceil() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.ceil(3.1)).toBe(4);
      expect(funcs.ceil(3.9)).toBe(4);
      expect(() => funcs.ceil('not a number')).toThrow('ceil() requires a number');
    });

    it('should evaluate floor() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.floor(3.9)).toBe(3);
      expect(funcs.floor(3.1)).toBe(3);
      expect(() => funcs.floor('not a number')).toThrow('floor() requires a number');
    });

    it('should evaluate min() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.min(5, 2, 8)).toBe(2);
      expect(funcs.min(10)).toBe(10);
      expect(funcs.min()).toBe(null);
      expect(() => funcs.min('not a number')).toThrow('min() requires at least one number');
    });

    it('should evaluate max() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.max(5, 2, 8)).toBe(8);
      expect(funcs.max(10)).toBe(10);
      expect(funcs.max()).toBe(null);
      expect(() => funcs.max('not a number')).toThrow('max() requires at least one number');
    });

    it('should evaluate sqrt() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.sqrt(16)).toBe(4);
      expect(funcs.sqrt(25)).toBe(5);
      expect(() => funcs.sqrt(-1)).toThrow('sqrt() requires a non-negative number');
      expect(() => funcs.sqrt('not a number')).toThrow('sqrt() requires a number');
    });

    it('should evaluate pow() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.pow(2, 3)).toBe(8);
      expect(funcs.pow(5, 2)).toBe(25);
      expect(() => funcs.pow('not a number', 2)).toThrow('pow() requires two numbers');
    });
  });

  describe('Function Call Evaluation - Array Functions', () => {
    it('should evaluate length() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.length([1, 2, 3])).toBe(3);
      expect(funcs.length('hello')).toBe(5);
      expect(funcs.length(null)).toBe(0);
      expect(funcs.length([])).toBe(0);
    });

    it('should evaluate contains() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.contains([1, 2, 3], 2)).toBe(true);
      expect(funcs.contains([1, 2, 3], 5)).toBe(false);
      expect(funcs.contains('not an array', 2)).toBe(false);
      expect(funcs.contains([], 1)).toBe(false);
    });

    it('should evaluate indexOf() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.indexOf(['a', 'b', 'c'], 'b')).toBe(1);
      expect(funcs.indexOf(['a', 'b', 'c'], 'x')).toBe(-1);
      expect(funcs.indexOf('not an array', 'b')).toBe(-1);
      expect(funcs.indexOf([], 'a')).toBe(-1);
    });

    it('should evaluate first() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.first([1, 2, 3])).toBe(1);
      expect(funcs.first([])).toBe(null);
      expect(funcs.first('not an array')).toBe(null);
    });

    it('should evaluate last() function', () => {
      const funcs = evaluator._builtInFunctions;
      expect(funcs.last([1, 2, 3])).toBe(3);
      expect(funcs.last([])).toBe(null);
      expect(funcs.last('not an array')).toBe(null);
    });

    it('should throw error for unknown function via evaluate()', () => {
      // Test through the public API, not internal methods
      expect(() => evaluator.evaluate('unknownFunction()', {})).toThrow('Unknown function');
    });

    it('should handle function errors via evaluate()', () => {
      // Test through the public API, not internal methods
      expect(() => evaluator.evaluate('abs("not a number")', {})).toThrow();
    });
  });

  // ===================================================================
  // COMPARE UTILITY TESTS
  // ===================================================================

  describe('_compare() Utility', () => {
    it('should compare null/undefined values', () => {
      expect(evaluator._compare(null, null)).toBe(0);
      expect(evaluator._compare(undefined, undefined)).toBe(0);
      expect(evaluator._compare(null, undefined)).toBe(0);
      expect(evaluator._compare(null, 5)).toBe(-1);
      expect(evaluator._compare(5, null)).toBe(1);
    });

    it('should handle NaN comparisons', () => {
      // STRICT MODE: NaN comparisons now throw errors
      expect(() => evaluator._compare(NaN, 5)).toThrow('Cannot compare NaN values');
      expect(() => evaluator._compare(5, NaN)).toThrow('Cannot compare NaN values');
    });

    it('should compare numbers', () => {
      expect(evaluator._compare(5, 10)).toBeLessThan(0);
      expect(evaluator._compare(10, 5)).toBeGreaterThan(0);
      expect(evaluator._compare(5, 5)).toBe(0);
    });

    it('should compare strings', () => {
      expect(evaluator._compare('apple', 'banana')).toBeLessThan(0);
      expect(evaluator._compare('banana', 'apple')).toBeGreaterThan(0);
      expect(evaluator._compare('apple', 'apple')).toBe(0);
      // STRICT MODE: String comparison is now case-sensitive
      // In locale-aware comparison, 'Apple' > 'apple' (uppercase comes after lowercase)
      expect(evaluator._compare('Apple', 'apple')).toBeGreaterThan(0);
      expect(evaluator._compare('apple', 'Apple')).toBeLessThan(0);
    });

    it('should compare booleans', () => {
      expect(evaluator._compare(false, false)).toBe(0);
      expect(evaluator._compare(true, true)).toBe(0);
      expect(evaluator._compare(false, true)).toBeLessThan(0);
      expect(evaluator._compare(true, false)).toBeGreaterThan(0);
    });

    it('should throw error for incompatible types in strict mode', () => {
      // STRICT MODE: Comparing incompatible types now throws errors
      expect(() => evaluator._compare({ a: 1 }, { b: 2 })).toThrow('[STRICT MODE]');
      expect(() => evaluator._compare(5, 'string')).toThrow('[STRICT MODE]');
      expect(() => evaluator._compare(true, 123)).toThrow('[STRICT MODE]');
    });
  });

  // ===================================================================
  // EQUALS UTILITY TESTS
  // ===================================================================

  describe('_equals() Utility', () => {
    it('should check strict equality for primitives', () => {
      expect(evaluator._equals(5, 5)).toBe(true);
      expect(evaluator._equals(5, 6)).toBe(false);
      expect(evaluator._equals('hello', 'hello')).toBe(true);
      expect(evaluator._equals(true, true)).toBe(true);
    });

    it('should handle null/undefined equality', () => {
      expect(evaluator._equals(null, null)).toBe(true);
      expect(evaluator._equals(undefined, undefined)).toBe(true);
      expect(evaluator._equals(null, undefined)).toBe(true);
      expect(evaluator._equals(null, 0)).toBe(false);
      expect(evaluator._equals(undefined, 0)).toBe(false);
    });

    it('should handle NaN comparisons', () => {
      expect(evaluator._equals(NaN, NaN)).toBe(false);
      expect(evaluator._equals(NaN, 5)).toBe(false);
    });

    it('should NOT coerce number and numeric string in strict mode', () => {
      // STRICT MODE: No type coercion between numbers and strings
      expect(evaluator._equals(5, '5')).toBe(false);
      expect(evaluator._equals('5', 5)).toBe(false);
      expect(evaluator._equals(5, 'not a number')).toBe(false);
      // Same types should still work
      expect(evaluator._equals(5, 5)).toBe(true);
      expect(evaluator._equals('5', '5')).toBe(true);
    });

    it('should NOT coerce boolean and boolean string in strict mode', () => {
      // STRICT MODE: No type coercion between booleans and strings
      expect(evaluator._equals(true, 'true')).toBe(false);
      expect(evaluator._equals('true', true)).toBe(false);
      expect(evaluator._equals(false, 'false')).toBe(false);
      expect(evaluator._equals('false', false)).toBe(false);
      expect(evaluator._equals(true, 'false')).toBe(false);
      // Same types should still work
      expect(evaluator._equals(true, true)).toBe(true);
      expect(evaluator._equals('true', 'true')).toBe(true);
    });

    it('should do case-SENSITIVE string comparison in strict mode', () => {
      // STRICT MODE: String comparison is case-sensitive
      expect(evaluator._equals('Hello', 'hello')).toBe(false);
      expect(evaluator._equals('WORLD', 'world')).toBe(false);
      // Exact matches still work
      expect(evaluator._equals('hello', 'hello')).toBe(true);
      expect(evaluator._equals('WORLD', 'WORLD')).toBe(true);
    });
  });

  // ===================================================================
  // PARSE VALUE UTILITY TESTS
  // ===================================================================

  describe('_parseValue() Utility', () => {
    it('should return non-string values as-is', () => {
      expect(evaluator._parseValue(123)).toBe(123);
      expect(evaluator._parseValue(true)).toBe(true);
      expect(evaluator._parseValue(null)).toBe(null);
      expect(evaluator._parseValue(undefined)).toBeUndefined();
    });

    it('should parse numeric strings', () => {
      expect(evaluator._parseValue('123')).toBe(123);
      expect(evaluator._parseValue('-456')).toBe(-456);
      expect(evaluator._parseValue('3.14')).toBe(3.14);
      expect(evaluator._parseValue('-2.5')).toBe(-2.5);
    });

    it('should parse boolean strings', () => {
      expect(evaluator._parseValue('true')).toBe(true);
      expect(evaluator._parseValue('True')).toBe(true);
      expect(evaluator._parseValue('TRUE')).toBe(true);
      expect(evaluator._parseValue('false')).toBe(false);
      expect(evaluator._parseValue('False')).toBe(false);
      expect(evaluator._parseValue('FALSE')).toBe(false);
    });

    it('should parse null string', () => {
      expect(evaluator._parseValue('null')).toBe(null);
      expect(evaluator._parseValue('Null')).toBe(null);
      expect(evaluator._parseValue('NULL')).toBe(null);
    });

    it('should return non-parseable strings as-is', () => {
      expect(evaluator._parseValue('hello')).toBe('hello');
      expect(evaluator._parseValue('not a number')).toBe('not a number');
    });
  });

  // ===================================================================
  // NODE DISPATCHER TESTS
  // ===================================================================

  describe('_evaluateNode() Dispatcher', () => {
    it('should throw error for invalid node', () => {
      expect(() => evaluator._evaluateNode(null, {})).toThrow('Invalid AST node');
      expect(() => evaluator._evaluateNode({}, {})).toThrow('Invalid AST node');
      expect(() => evaluator._evaluateNode({ type: null }, {})).toThrow('Invalid AST node');
    });

    it('should throw error for unsupported node type', () => {
      const ast = { type: 'UnsupportedType' };
      expect(() => evaluator._evaluateNode(ast, {})).toThrow(
        'Unsupported AST node type: UnsupportedType'
      );
    });

    it('should dispatch to correct handler for each node type', () => {
      expect(evaluator._evaluateNode({ type: 'Literal', value: 42 }, {})).toBe(42);
      expect(evaluator._evaluateNode({ type: 'ArrayExpression', elements: [] }, {})).toEqual([]);
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    it('should evaluate complex nested expressions', () => {
      const context = {
        age: 25,
        status: 'active',
        score: 85,
        grades: [80, 90, 85]
      };

      const result = evaluator.evaluate(
        "{{age}} > 18 && {{status}} in ['active', 'pending'] && {{score}} >= 60",
        context
      );
      expect(result).toBe(true);
    });

    it('should handle operator precedence correctly', () => {
      const context = { a: true, b: false, c: true };
      expect(evaluator.evaluate('{{a}} || {{b}} && {{c}}', context)).toBe(true);
      expect(evaluator.evaluate('{{b}} && {{c}} || {{a}}', context)).toBe(true);
    });

    it('should combine multiple operators in one expression', () => {
      const context = { score: 85, absences: 2, year: 5 };
      const result = evaluator.evaluate(
        '{{score}} >= 60 && {{absences}} < 5 && {{year}} between 1, 5',
        context
      );
      expect(result).toBe(true);
    });
  });
});
