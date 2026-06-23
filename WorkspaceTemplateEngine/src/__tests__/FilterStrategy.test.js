// ===================================================================
// FILE: WorkspaceTemplateEngine/src/__tests__/FilterStrategy.test.js
// ===================================================================
// Comprehensive test suite for FilterStrategy and FilterRegistry
// Coverage: Abstract filter class, registry operations, error handling
// ===================================================================

import { FilterStrategy, FilterRegistry } from '../FilterStrategy';

describe('FilterStrategy and FilterRegistry - Comprehensive Test Suite', () => {
  // ===================================================================
  // FILTER STRATEGY - ABSTRACT CLASS
  // ===================================================================

  describe('FilterStrategy - Abstract Class', () => {
    class TestFilter extends FilterStrategy {
      getName() {
        return 'test';
      }

      getDescription() {
        return 'Test filter';
      }

      execute(value) {
        return `test-${value}`;
      }
    }

    it('should throw error if getName() is not implemented', () => {
      class IncompleteFilter extends FilterStrategy {}
      const filter = new IncompleteFilter();

      expect(() => filter.getName()).toThrow('getName() must be implemented');
    });

    it('should throw error if getDescription() is not implemented', () => {
      class IncompleteFilter extends FilterStrategy {}
      const filter = new IncompleteFilter();

      expect(() => filter.getDescription()).toThrow('getDescription() must be implemented');
    });

    it('should throw error if execute() is not implemented', () => {
      class IncompleteFilter extends FilterStrategy {}
      const filter = new IncompleteFilter();

      expect(() => filter.execute('value')).toThrow('execute() must be implemented');
    });

    it('should allow creating concrete filter implementation', () => {
      const filter = new TestFilter();

      expect(filter.getName()).toBe('test');
      expect(filter.getDescription()).toBe('Test filter');
      expect(filter.execute('hello')).toBe('test-hello');
    });

    it('should allow validate() to be overridden', () => {
      class ValidatingFilter extends FilterStrategy {
        getName() {
          return 'validating';
        }

        getDescription() {
          return 'Validates input';
        }

        execute(value) {
          return value;
        }

        validate(value, args) {
          if (typeof value !== 'string') {
            throw new Error('Value must be a string');
          }
        }
      }

      const filter = new ValidatingFilter();

      expect(() => filter.validate('test', [])).not.toThrow();
      expect(() => filter.validate(123, [])).toThrow('Value must be a string');
    });

    it('should have default validate() that does nothing', () => {
      const filter = new TestFilter();

      expect(() => filter.validate('any', [])).not.toThrow();
      expect(() => filter.validate(123, [])).not.toThrow();
      expect(() => filter.validate(null, [])).not.toThrow();
    });

    it('should support filters with multiple arguments', () => {
      class MultiArgFilter extends FilterStrategy {
        getName() {
          return 'multiarg';
        }

        getDescription() {
          return 'Filter with multiple args';
        }

        execute(value, separator, prefix) {
          return `${prefix || ''}${value}${separator || ''}`;
        }
      }

      const filter = new MultiArgFilter();

      expect(filter.execute('test', '-', '>')).toBe('>test-');
      expect(filter.execute('test', '-')).toBe('test-');
      expect(filter.execute('test')).toBe('test');
    });
  });

  // ===================================================================
  // FILTER REGISTRY - CONSTRUCTION
  // ===================================================================

  describe('FilterRegistry - Construction', () => {
    it('should create empty registry', () => {
      const registry = new FilterRegistry();

      expect(registry.count()).toBe(0);
      expect(registry.getAllNames()).toEqual([]);
    });

    it('should create registry with logger', () => {
      const logger = {
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      const registry = new FilterRegistry(logger);

      expect(registry).toBeDefined();
    });

    it('should use console as default logger', () => {
      const registry = new FilterRegistry();

      expect(registry._logger).toBe(console);
    });
  });

  // ===================================================================
  // FILTER REGISTRY - REGISTRATION
  // ===================================================================

  describe('FilterRegistry - Registration', () => {
    let registry;
    let logger;

    class TestFilter extends FilterStrategy {
      getName() {
        return 'test';
      }

      getDescription() {
        return 'Test filter';
      }

      execute(value) {
        return `test-${value}`;
      }
    }

    beforeEach(() => {
      logger = {
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      registry = new FilterRegistry(logger);
    });

    it('should register a filter', () => {
      const filter = new TestFilter();

      registry.register(filter);

      expect(registry.has('test')).toBe(true);
      expect(registry.count()).toBe(1);
      expect(logger.debug).toHaveBeenCalledWith("FilterRegistry: Registered filter 'test'");
    });

    it('should throw error when registering non-FilterStrategy', () => {
      expect(() => {
        registry.register({ name: 'invalid' });
      }).toThrow('must be a FilterStrategy instance');
    });

    it('should throw error when registering null', () => {
      expect(() => {
        registry.register(null);
      }).toThrow('must be a FilterStrategy instance');
    });

    it('should warn when overwriting existing filter', () => {
      const filter1 = new TestFilter();
      const filter2 = new TestFilter();

      registry.register(filter1);
      registry.register(filter2);

      expect(registry.count()).toBe(1); // Still only one
      expect(logger.warn).toHaveBeenCalledWith(
        "FilterRegistry: Overwriting existing filter 'test'"
      );
    });

    it('should register multiple filters at once', () => {
      class Filter1 extends FilterStrategy {
        getName() {
          return 'filter1';
        }

        getDescription() {
          return 'Filter 1';
        }

        execute(value) {
          return value;
        }
      }

      class Filter2 extends FilterStrategy {
        getName() {
          return 'filter2';
        }

        getDescription() {
          return 'Filter 2';
        }

        execute(value) {
          return value;
        }
      }

      registry.registerAll([new Filter1(), new Filter2()]);

      expect(registry.count()).toBe(2);
      expect(registry.has('filter1')).toBe(true);
      expect(registry.has('filter2')).toBe(true);
    });

    it('should throw error when registerAll receives non-array', () => {
      expect(() => {
        registry.registerAll('not-an-array');
      }).toThrow('must be an array');
    });

    it('should handle empty array in registerAll', () => {
      registry.registerAll([]);

      expect(registry.count()).toBe(0);
    });
  });

  // ===================================================================
  // FILTER REGISTRY - RETRIEVAL
  // ===================================================================

  describe('FilterRegistry - Retrieval', () => {
    let registry;

    class UppercaseFilter extends FilterStrategy {
      getName() {
        return 'uppercase';
      }

      getDescription() {
        return 'Uppercase filter';
      }

      execute(value) {
        return String(value).toUpperCase();
      }
    }

    class LowercaseFilter extends FilterStrategy {
      getName() {
        return 'lowercase';
      }

      getDescription() {
        return 'Lowercase filter';
      }

      execute(value) {
        return String(value).toLowerCase();
      }
    }

    beforeEach(() => {
      registry = new FilterRegistry();
      registry.register(new UppercaseFilter());
      registry.register(new LowercaseFilter());
    });

    it('should get filter by name', () => {
      const filter = registry.get('uppercase');

      expect(filter).toBeInstanceOf(FilterStrategy);
      expect(filter.getName()).toBe('uppercase');
    });

    it('should return null for non-existent filter', () => {
      const filter = registry.get('nonexistent');

      expect(filter).toBeNull();
    });

    it('should check if filter exists', () => {
      expect(registry.has('uppercase')).toBe(true);
      expect(registry.has('lowercase')).toBe(true);
      expect(registry.has('nonexistent')).toBe(false);
    });

    it('should get all filter names', () => {
      const names = registry.getAllNames();

      expect(names).toHaveLength(2);
      expect(names).toContain('uppercase');
      expect(names).toContain('lowercase');
    });

    it('should get all filters', () => {
      const filters = registry.getAll();

      expect(filters).toHaveLength(2);
      expect(filters.every((f) => f instanceof FilterStrategy)).toBe(true);
    });

    it('should get count of registered filters', () => {
      expect(registry.count()).toBe(2);
    });

    it('should execute retrieved filter', () => {
      const filter = registry.get('uppercase');
      const result = filter.execute('hello');

      expect(result).toBe('HELLO');
    });
  });

  // ===================================================================
  // FILTER REGISTRY - UNREGISTRATION
  // ===================================================================

  describe('FilterRegistry - Unregistration', () => {
    let registry;
    let logger;

    class TestFilter extends FilterStrategy {
      getName() {
        return 'test';
      }

      getDescription() {
        return 'Test';
      }

      execute(value) {
        return value;
      }
    }

    beforeEach(() => {
      logger = {
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      registry = new FilterRegistry(logger);
      registry.register(new TestFilter());
    });

    it('should unregister filter by name', () => {
      const removed = registry.unregister('test');

      expect(removed).toBe(true);
      expect(registry.has('test')).toBe(false);
      expect(registry.count()).toBe(0);
      expect(logger.debug).toHaveBeenCalledWith("FilterRegistry: Unregistered filter 'test'");
    });

    it('should return false when unregistering non-existent filter', () => {
      const removed = registry.unregister('nonexistent');

      expect(removed).toBe(false);
    });

    it('should clear all filters', () => {
      registry.clear();

      expect(registry.count()).toBe(0);
      expect(registry.getAllNames()).toEqual([]);
      expect(logger.debug).toHaveBeenCalledWith('FilterRegistry: Cleared all filters');
    });

    it('should handle clearing empty registry', () => {
      registry.clear();
      registry.clear(); // Clear again

      expect(registry.count()).toBe(0);
    });
  });

  // ===================================================================
  // FILTER REGISTRY - EDGE CASES
  // ===================================================================

  describe('FilterRegistry - Edge Cases', () => {
    let registry;

    beforeEach(() => {
      registry = new FilterRegistry();
    });

    it('should handle filter with special characters in name', () => {
      class SpecialFilter extends FilterStrategy {
        getName() {
          return 'special-filter_123';
        }

        getDescription() {
          return 'Special';
        }

        execute(value) {
          return value;
        }
      }

      registry.register(new SpecialFilter());

      expect(registry.has('special-filter_123')).toBe(true);
    });

    it('should handle filter with unicode name', () => {
      class UnicodeFilter extends FilterStrategy {
        getName() {
          return 'filtre-français-中文';
        }

        getDescription() {
          return 'Unicode';
        }

        execute(value) {
          return value;
        }
      }

      registry.register(new UnicodeFilter());

      expect(registry.has('filtre-français-中文')).toBe(true);
    });

    it('should handle many filters efficiently', () => {
      const filters = [];

      for (let i = 0; i < 100; i++) {
        class DynamicFilter extends FilterStrategy {
          constructor(id) {
            super();
            this.id = id;
          }

          getName() {
            return `filter${this.id}`;
          }

          getDescription() {
            return `Filter ${this.id}`;
          }

          execute(value) {
            return value;
          }
        }

        filters.push(new DynamicFilter(i));
      }

      registry.registerAll(filters);

      expect(registry.count()).toBe(100);
      expect(registry.has('filter0')).toBe(true);
      expect(registry.has('filter99')).toBe(true);
    });

    it('should maintain insertion order in getAllNames()', () => {
      class Filter1 extends FilterStrategy {
        getName() {
          return 'aaa';
        }

        getDescription() {
          return 'AAA';
        }

        execute(v) {
          return v;
        }
      }

      class Filter2 extends FilterStrategy {
        getName() {
          return 'zzz';
        }

        getDescription() {
          return 'ZZZ';
        }

        execute(v) {
          return v;
        }
      }

      class Filter3 extends FilterStrategy {
        getName() {
          return 'mmm';
        }

        getDescription() {
          return 'MMM';
        }

        execute(v) {
          return v;
        }
      }

      registry.register(new Filter1());
      registry.register(new Filter2());
      registry.register(new Filter3());

      const names = registry.getAllNames();

      expect(names).toEqual(['aaa', 'zzz', 'mmm']); // Insertion order preserved
    });
  });

  // ===================================================================
  // INTEGRATION - FILTER STRATEGY + REGISTRY
  // ===================================================================

  describe('Integration - FilterStrategy + Registry', () => {
    it('should register and execute filter end-to-end', () => {
      class DoubleFilter extends FilterStrategy {
        getName() {
          return 'double';
        }

        getDescription() {
          return 'Doubles a number';
        }

        execute(value) {
          return value * 2;
        }
      }

      const registry = new FilterRegistry();
      registry.register(new DoubleFilter());

      const filter = registry.get('double');
      const result = filter.execute(5);

      expect(result).toBe(10);
    });

    it('should support filter chaining via registry', () => {
      class AddFilter extends FilterStrategy {
        getName() {
          return 'add';
        }

        getDescription() {
          return 'Adds 10';
        }

        execute(value) {
          return value + 10;
        }
      }

      class MultiplyFilter extends FilterStrategy {
        getName() {
          return 'multiply';
        }

        getDescription() {
          return 'Multiplies by 2';
        }

        execute(value) {
          return value * 2;
        }
      }

      const registry = new FilterRegistry();
      registry.register(new AddFilter());
      registry.register(new MultiplyFilter());

      // Simulate filter chaining: (5 + 10) * 2 = 30
      let value = 5;
      value = registry.get('add').execute(value);
      value = registry.get('multiply').execute(value);

      expect(value).toBe(30);
    });

    it('should handle filter validation in workflow', () => {
      class StrictFilter extends FilterStrategy {
        getName() {
          return 'strict';
        }

        getDescription() {
          return 'Only accepts positive numbers';
        }

        execute(value) {
          return value;
        }

        validate(value) {
          if (typeof value !== 'number' || value < 0) {
            throw new Error('Value must be a positive number');
          }
        }
      }

      const registry = new FilterRegistry();
      registry.register(new StrictFilter());

      const filter = registry.get('strict');

      expect(() => filter.validate(10)).not.toThrow();
      expect(() => filter.validate(-5)).toThrow('positive number');
      expect(() => filter.validate('text')).toThrow('positive number');
    });
  });
});
