// ===================================================================
// FILE: GasExpressionEngineLib/src/__tests__/ExpressionEngineService.test.js
// ===================================================================
// Test Suite for ExpressionEngineService (LOGIC LIBRARY PATTERN)
//
// Pattern: Logic Library Testing
// - Unit testing with FakeLogger injection
// - Tests pure logic and evaluation
// - Asserts output matches expected input
// - Tests success paths, error handling, and edge cases
// ===================================================================

import { ExpressionEngineService } from '../ExpressionEngineService';
import { MockFactory } from '../../../test/fakes/MockFactory';

// Mock WorkspaceTemplateEngine as a global
// (In real GAS environment, this is available globally)
import { Mustache, PlaceholderService } from '../../../WorkspaceTemplateEngine/index.js';

global.WorkspaceTemplateEngine = {
  Mustache,
  PlaceholderService
};

describe('ExpressionEngineService (Logic Library Pattern)', () => {
  let logger;
  let engine;

  beforeEach(() => {
    // Create fresh standardized mock logger for each test
    logger = MockFactory.createJestLogger();

    // Create the service under test
    engine = new ExpressionEngineService({ logger });
  });

  afterEach(() => {
    // Clean up
    jest.clearAllMocks();
  });

  // ===================================================================
  // BASIC FUNCTIONALITY TESTS
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create an instance with required dependencies', () => {
      expect(engine).toBeDefined();
      expect(engine.logger).toBe(logger);
      expect(engine.parser).toBeDefined();
      expect(engine.evaluator).toBeDefined();
    });

    it('should throw error if logger is not provided', () => {
      expect(() => {
        new ExpressionEngineService({});
      }).toThrow('ExpressionEngineService requires a logger instance');
    });

    it('should initialize with AST caching enabled by default', () => {
      const stats = engine.getCacheStats();
      expect(stats.enabled).toBe(true);
      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(1000);
    });
  });

  // ===================================================================
  // COMPARISON OPERATORS TESTS
  // ===================================================================

  describe('Comparison Operators', () => {
    it('should evaluate equality (==) correctly', () => {
      expect(engine.evaluate('{{age}} == 18', { age: 18 })).toBe(true);
      expect(engine.evaluate('{{age}} == 18', { age: 19 })).toBe(false);
      expect(engine.evaluate("{{name}} == 'John'", { name: 'John' })).toBe(true);
    });

    it('should evaluate inequality (!=) correctly', () => {
      expect(engine.evaluate('{{age}} != 18', { age: 19 })).toBe(true);
      expect(engine.evaluate('{{age}} != 18', { age: 18 })).toBe(false);
    });

    it('should evaluate greater than (>) correctly', () => {
      expect(engine.evaluate('{{score}} > 50', { score: 75 })).toBe(true);
      expect(engine.evaluate('{{score}} > 50', { score: 25 })).toBe(false);
      expect(engine.evaluate('{{score}} > 50', { score: 50 })).toBe(false);
    });

    it('should evaluate less than (<) correctly', () => {
      expect(engine.evaluate('{{score}} < 50', { score: 25 })).toBe(true);
      expect(engine.evaluate('{{score}} < 50', { score: 75 })).toBe(false);
    });

    it('should evaluate greater than or equal (>=) correctly', () => {
      expect(engine.evaluate('{{score}} >= 50', { score: 50 })).toBe(true);
      expect(engine.evaluate('{{score}} >= 50', { score: 75 })).toBe(true);
      expect(engine.evaluate('{{score}} >= 50', { score: 25 })).toBe(false);
    });

    it('should evaluate less than or equal (<=) correctly', () => {
      expect(engine.evaluate('{{score}} <= 50', { score: 50 })).toBe(true);
      expect(engine.evaluate('{{score}} <= 50', { score: 25 })).toBe(true);
      expect(engine.evaluate('{{score}} <= 50', { score: 75 })).toBe(false);
    });
  });

  // ===================================================================
  // LOGICAL OPERATORS TESTS
  // ===================================================================

  describe('Logical Operators', () => {
    it('should evaluate AND (&&) correctly', () => {
      expect(engine.evaluate('{{a}} == true && {{b}} == true', { a: true, b: true })).toBe(true);
      expect(engine.evaluate('{{a}} == true && {{b}} == true', { a: true, b: false })).toBe(false);
      expect(engine.evaluate('{{a}} == true && {{b}} == true', { a: false, b: true })).toBe(false);
    });

    it('should evaluate OR (||) correctly', () => {
      expect(engine.evaluate('{{a}} == true || {{b}} == true', { a: true, b: false })).toBe(true);
      expect(engine.evaluate('{{a}} == true || {{b}} == true', { a: false, b: true })).toBe(true);
      expect(engine.evaluate('{{a}} == true || {{b}} == true', { a: false, b: false })).toBe(false);
    });

    it('should evaluate NOT (!) correctly', () => {
      expect(engine.evaluate('!({{active}} == true)', { active: false })).toBe(true);
      expect(engine.evaluate('!({{active}} == true)', { active: true })).toBe(false);
    });

    it('should handle complex logical combinations', () => {
      const context = {
        grade: 85,
        absences: 2,
        status: 'active'
      };

      const result = engine.evaluate(
        "{{grade}} >= 60 && {{absences}} < 5 && {{status}} == 'active'",
        context
      );

      expect(result).toBe(true);
    });
  });

  // ===================================================================
  // SPECIAL OPERATORS TESTS
  // ===================================================================

  describe('Special Operators', () => {
    it('should evaluate IN operator for array membership', () => {
      const context = { status: 'active' };

      expect(engine.evaluate("{{status}} in ['active', 'pending', 'approved']", context)).toBe(
        true
      );

      expect(engine.evaluate("{{status}} in ['inactive', 'deleted']", context)).toBe(false);
    });

    it('should evaluate BETWEEN operator for range checks', () => {
      expect(engine.evaluate('{{age}} between 18, 65', { age: 25 })).toBe(true);
      expect(engine.evaluate('{{age}} between 18, 65', { age: 18 })).toBe(true);
      expect(engine.evaluate('{{age}} between 18, 65', { age: 65 })).toBe(true);
      expect(engine.evaluate('{{age}} between 18, 65', { age: 17 })).toBe(false);
      expect(engine.evaluate('{{age}} between 18, 65', { age: 66 })).toBe(false);
    });

    it('should evaluate MATCH operator for regex patterns', () => {
      const emailContext = { email: 'test@example.com' };

      expect(
        engine.evaluate(
          "{{email}} match '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'",
          emailContext
        )
      ).toBe(true);

      expect(engine.evaluate("{{email}} match '^[0-9]+$'", emailContext)).toBe(false);
    });
  });

  // ===================================================================
  // NESTED PLACEHOLDER TESTS
  // ===================================================================

  describe('Nested Placeholders', () => {
    it('should resolve nested object paths', () => {
      const context = {
        user: {
          profile: {
            age: 25
          }
        }
      };

      expect(engine.evaluate('{{user.profile.age}} >= 18', context)).toBe(true);
    });

    // Note: JSEP does not support numeric indices in dot notation (e.g., users.0.age)
    // Users should use bracket notation or access arrays differently
    it.skip('should handle array indices in placeholders (JSEP limitation)', () => {
      const context = {
        users: [
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 30 }
        ]
      };

      // This syntax is not supported by JSEP (numeric property names)
      // Users should restructure their data or use alternative access patterns
      expect(engine.evaluate('{{users.0.age}} == 25', context)).toBe(true);
      expect(engine.evaluate("{{users.1.name}} == 'Bob'", context)).toBe(true);
    });
  });

  // ===================================================================
  // GROUPING AND PRECEDENCE TESTS
  // ===================================================================

  describe('Grouping and Operator Precedence', () => {
    it('should respect parentheses for grouping', () => {
      const context = { a: true, b: false, c: true };

      // Without grouping: (a && b) || c = true
      expect(engine.evaluate('{{a}} == true && {{b}} == true || {{c}} == true', context)).toBe(
        true
      );

      // With grouping: a && (b || c) = true
      expect(engine.evaluate('{{a}} == true && ({{b}} == true || {{c}} == true)', context)).toBe(
        true
      );
    });

    it('should handle nested grouping', () => {
      const context = { a: 10, b: 20, c: 30, d: 40 };

      expect(engine.evaluate('(({{a}} < {{b}}) && ({{c}} < {{d}})) || {{a}} > 100', context)).toBe(
        true
      );
    });
  });

  // ===================================================================
  // CACHING TESTS
  // ===================================================================

  describe('AST Caching', () => {
    it('should cache parsed AST for repeated expressions', () => {
      const expression = '{{age}} >= 18';

      // First evaluation - should parse and cache
      engine.evaluate(expression, { age: 20 });
      expect(engine.getCacheStats().size).toBe(1);

      // Second evaluation - should use cache
      engine.evaluate(expression, { age: 25 });
      expect(engine.getCacheStats().size).toBe(1);

      // Different expression - should create new cache entry
      engine.evaluate('{{age}} < 65', { age: 30 });
      expect(engine.getCacheStats().size).toBe(2);
    });

    it('should clear cache when requested', () => {
      engine.evaluate('{{age}} >= 18', { age: 20 });
      engine.evaluate('{{age}} < 65', { age: 30 });

      expect(engine.getCacheStats().size).toBe(2);

      engine.clearCache();

      expect(engine.getCacheStats().size).toBe(0);
    });

    it('should allow disabling cache', () => {
      engine.setCacheEnabled(false);
      expect(engine.getCacheStats().enabled).toBe(false);

      engine.evaluate('{{age}} >= 18', { age: 20 });
      expect(engine.getCacheStats().size).toBe(0); // Not cached

      engine.setCacheEnabled(true);
      expect(engine.getCacheStats().enabled).toBe(true);
    });

    it('should enforce cache size limit and evict oldest entries', () => {
      // Generate 1001 unique expressions to trigger cache limit
      for (let i = 0; i <= 1001; i++) {
        engine.evaluate(`{{value}} == ${i}`, { value: i });
      }

      // Cache should be limited to 1000 entries
      expect(engine.getCacheStats().size).toBe(1000);

      // Check that eviction was logged
      const debugLogs = logger.getLogsByLevel('DEBUG');
      const evictionLog = debugLogs.find((log) => log.message.includes('cache limit reached'));
      expect(evictionLog).toBeDefined();
    });

    it('should throw error when setCacheEnabled receives non-boolean', () => {
      expect(() => {
        engine.setCacheEnabled('true');
      }).toThrow('Invalid enabled value: must be a boolean');

      expect(() => {
        engine.setCacheEnabled(1);
      }).toThrow('Invalid enabled value: must be a boolean');

      expect(() => {
        engine.setCacheEnabled(null);
      }).toThrow('Invalid enabled value: must be a boolean');
    });

    it('should not cache when caching is disabled', () => {
      engine.setCacheEnabled(false);

      engine.evaluate('{{x}} == 1', { x: 1 });
      engine.evaluate('{{y}} == 2', { y: 2 });
      engine.evaluate('{{z}} == 3', { z: 3 });

      expect(engine.getCacheStats().size).toBe(0);
      expect(engine.getCacheStats().enabled).toBe(false);
    });
  });

  // ===================================================================
  // ERROR HANDLING TESTS
  // ===================================================================

  describe('Error Handling', () => {
    it('should throw error for invalid expression syntax', () => {
      expect(() => {
        engine.evaluate('{{age}} >=', { age: 20 });
      }).toThrow();
    });

    it('should throw error for empty expression', () => {
      expect(() => {
        engine.evaluate('', { age: 20 });
      }).toThrow('Invalid expression: must be a non-empty string');
    });

    it('should throw error for non-string expression', () => {
      expect(() => {
        engine.evaluate(null, { age: 20 });
      }).toThrow('Invalid expression: must be a non-empty string');
    });

    it('should throw error for invalid context', () => {
      expect(() => {
        engine.evaluate('{{age}} >= 18', 'invalid context');
      }).toThrow('Invalid context: must be an object or null');
    });

    it('should log errors to the logger', () => {
      try {
        engine.evaluate('{{age}} >=', { age: 20 });
      } catch (error) {
        // Expected
      }

      const errorLogs = logger.getLogsByLevel('ERROR');
      expect(errorLogs.length).toBeGreaterThan(0);
      expect(errorLogs[0].message).toContain('ExpressionEngineService.evaluate() failed');
    });

    describe('parse() method errors', () => {
      it('should throw error for empty expression in parse()', () => {
        expect(() => {
          engine.parse('');
        }).toThrow('Invalid expression: must be a non-empty string');
      });

      it('should throw error for non-string expression in parse()', () => {
        expect(() => {
          engine.parse(null);
        }).toThrow('Invalid expression: must be a non-empty string');

        expect(() => {
          engine.parse(undefined);
        }).toThrow('Invalid expression: must be a non-empty string');

        expect(() => {
          engine.parse(123);
        }).toThrow('Invalid expression: must be a non-empty string');
      });

      it('should throw error for invalid syntax in parse()', () => {
        expect(() => {
          engine.parse('{{age}} >= ');
        }).toThrow();
      });

      it('should log errors when parse() fails', () => {
        try {
          engine.parse('{{age}} &&');
        } catch (error) {
          // Expected
        }

        const errorLogs = logger.getLogsByLevel('ERROR');
        expect(errorLogs.length).toBeGreaterThan(0);
        expect(errorLogs[0].message).toContain('ExpressionEngineService.parse() failed');
      });
    });
  });

  // ===================================================================
  // UTILITY METHODS TESTS
  // ===================================================================

  describe('Utility Methods', () => {
    it('should return library info', () => {
      const info = engine.getInfo();

      expect(info.name).toBe('GasExpressionEngineLib');
      expect(info.version).toBe('1.0.0');
      expect(info.dependencies).toContain('WorkspaceTemplateEngine');
    });

    it('should parse expression to AST', () => {
      const ast = engine.parse('{{age}} >= 18');

      expect(ast).toBeDefined();
      expect(ast.type).toBeDefined();
    });

    it('should provide DI configuration via static getter', () => {
      const di = ExpressionEngineService.di;

      expect(di.name).toBe('expressionEngineService');
      expect(di.dependencies).toEqual(['logger', 'utils', 'cache']);
      expect(di.isSingleton).toBe(true);
      expect(typeof di.factory).toBe('function');
    });

    it('should create instance via DI factory', () => {
      const di = ExpressionEngineService.di;
      const mockLogger = MockFactory.createJestLogger();
      const mockUtils = {};
      const mockCache = {};

      const instance = di.factory(mockLogger, mockUtils, mockCache);

      expect(instance).toBeInstanceOf(ExpressionEngineService);
      expect(instance.logger).toBe(mockLogger);
    });
  });

  // ===================================================================
  // INTEGRATION TESTS (Complex Real-World Scenarios)
  // ===================================================================

  describe('Real-World Integration Scenarios', () => {
    it('should evaluate student eligibility rules', () => {
      const student = {
        grade: 85,
        absences: 2,
        status: 'active',
        year: 4
      };

      const eligible = engine.evaluate(
        "{{grade}} >= 60 && {{absences}} < 5 && {{status}} in ['active', 'pending'] && {{year}} >= 3",
        student
      );

      expect(eligible).toBe(true);
    });

    it('should evaluate employee bonus eligibility', () => {
      const employee = {
        performance: 4.5,
        tenure: 3,
        department: 'engineering',
        salary: 75000
      };

      const bonusEligible = engine.evaluate(
        '{{performance}} >= 4.0 && {{tenure}} >= 2 && {{salary}} between 50000, 100000',
        employee
      );

      expect(bonusEligible).toBe(true);
    });

    it('should evaluate multi-condition approval workflow', () => {
      const request = {
        amount: 5000,
        category: 'equipment',
        approver: { level: 'manager' },
        urgent: false
      };

      const approved = engine.evaluate(
        "({{amount}} < 10000 && {{approver.level}} == 'manager') || ({{urgent}} == true && {{category}} in ['critical', 'emergency'])",
        request
      );

      expect(approved).toBe(true);
    });
  });
});
