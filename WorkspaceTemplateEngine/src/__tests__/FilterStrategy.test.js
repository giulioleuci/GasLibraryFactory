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

      filter.validate('test', []);
      expect(() => filter.validate(123, [])).toThrow('Value must be a string');
    });

    it('should have default validate() that does nothing', () => {
      const filter = new TestFilter();

      // FilterStrategy.validate() is a true no-op by design (see source): it never
      // throws for any input, so there is no corresponding negative case to add here.
      filter.validate('any', []);
      filter.validate(123, []);
      filter.validate(null, []);
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

      expect(registry.get('anything')).toBeNull();
    });

    it('should create registry with logger', () => {
      const logger = {
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      const registry = new FilterRegistry(logger);

      expect(registry).toBeInstanceOf(FilterRegistry);
      expect(registry._logger).toBe(logger);
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

      expect(registry.get('test')).toBe(filter);
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

      expect(registry.get('test')).toBe(filter2); // Overwritten
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

      expect(registry.get('filter1')).not.toBeNull();
      expect(registry.get('filter2')).not.toBeNull();
    });

    it('should throw error when registerAll receives non-array', () => {
      expect(() => {
        registry.registerAll('not-an-array');
      }).toThrow('must be an array');
    });

    it('should handle empty array in registerAll', () => {
      registry.registerAll([]);

      expect(registry.get('anything')).toBeNull();
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

    it('should execute retrieved filter', () => {
      const filter = registry.get('uppercase');
      const result = filter.execute('hello');

      expect(result).toBe('HELLO');
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

      expect(registry.get('special-filter_123')).not.toBeNull();
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

      expect(registry.get('filtre-français-中文')).not.toBeNull();
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

      expect(registry.get('filter0')).not.toBeNull();
      expect(registry.get('filter99')).not.toBeNull();
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

      filter.validate(10);
      expect(() => filter.validate(-5)).toThrow('positive number');
      expect(() => filter.validate('text')).toThrow('positive number');
    });
  });
});
