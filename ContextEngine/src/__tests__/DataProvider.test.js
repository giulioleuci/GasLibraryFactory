// ===================================================================
// FILE: ContextEngine/src/__tests__/DataProvider.test.js
// ===================================================================
// Comprehensive test suite for DataProvider
// Coverage: All methods and features
// ===================================================================

import { DataProvider } from '../DataProvider';
import { ProviderExecutionError } from '../internal/errors/ProviderExecutionError';
import { MockFactory } from '../../../test/fakes';

// Create a concrete provider implementation for testing
class TestDataProvider extends DataProvider {
  constructor(logger, options = {}) {
    super(logger, options);
    this.fetchCount = 0;
  }

  _fetchData(parameters) {
    this.fetchCount++;
    return {
      id: parameters.id,
      name: `User ${parameters.id}`,
      fetchedAt: Date.now()
    };
  }
}

describe('DataProvider - Comprehensive Test Suite', () => {
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with default options', () => {
      const provider = new TestDataProvider(mocks.logger);

      expect(provider).toBeDefined();
      expect(provider.logger).toBe(mocks.logger);
      expect(provider._cacheable).toBe(false);
      expect(provider._cacheDurationMs).toBe(300000);
    });

    it('should create instance with custom options', () => {
      const provider = new TestDataProvider(mocks.logger, {
        cacheable: true,
        cacheDurationMs: 600000
      });

      expect(provider._cacheable).toBe(true);
      expect(provider._cacheDurationMs).toBe(600000);
    });

    it('should throw error if logger is invalid', () => {
      expect(() => new TestDataProvider(null)).toThrow(
        'DataProvider: logger is required and must be an object'
      );
      expect(() => new TestDataProvider('not an object')).toThrow(
        'DataProvider: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing required methods', () => {
      const invalidLogger = { debug: jest.fn() };
      expect(() => new TestDataProvider(invalidLogger)).toThrow(
        'DataProvider: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if options is invalid', () => {
      expect(() => new TestDataProvider(mocks.logger, 'not an object')).toThrow(
        'DataProvider: options must be an object or null'
      );
    });
  });

  // ===================================================================
  // GETTER METHODS
  // ===================================================================

  describe('Getter Methods', () => {
    it('should return logger instance', () => {
      const provider = new TestDataProvider(mocks.logger);

      expect(provider.logger).toBe(mocks.logger);
    });
  });

  // ===================================================================
  // DATA FETCHING
  // ===================================================================

  describe('Data Fetching', () => {
    let provider;

    beforeEach(() => {
      provider = new TestDataProvider(mocks.logger);
    });

    it('should fetch data successfully', () => {
      const result = provider.provide('TestProvider', { id: 123 });

      expect(result).toBeDefined();
      expect(result.id).toBe(123);
      expect(result.name).toBe('User 123');
      expect(provider.fetchCount).toBe(1);
    });

    it('should throw error if providerName is invalid', () => {
      expect(() => provider.provide('', { id: 123 })).toThrow(
        'DataProvider.provide: providerName is required and must be a string'
      );
      expect(() => provider.provide(null, { id: 123 })).toThrow(
        'DataProvider.provide: providerName is required and must be a string'
      );
    });

    it('should throw error if parameters is invalid', () => {
      expect(() => provider.provide('TestProvider', null)).toThrow(
        'DataProvider.provide: parameters is required and must be an object'
      );
      expect(() => provider.provide('TestProvider', 'not an object')).toThrow(
        'DataProvider.provide: parameters is required and must be an object'
      );
    });

    it('should wrap errors in ProviderExecutionError', () => {
      class FailingProvider extends DataProvider {
        _fetchData() {
          throw new Error('Fetch failed');
        }
      }

      const failingProvider = new FailingProvider(mocks.logger);

      expect(() => failingProvider.provide('FailingProvider', { id: 123 })).toThrow(
        ProviderExecutionError
      );
    });

    it('should include original error in ProviderExecutionError', () => {
      class FailingProvider extends DataProvider {
        _fetchData() {
          throw new Error('Original error');
        }
      }

      const failingProvider = new FailingProvider(mocks.logger);

      try {
        failingProvider.provide('FailingProvider', { id: 123 });
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderExecutionError);
        expect(error.originalError.message).toBe('Original error');
      }
    });

    it('should log fetch details', () => {
      provider.provide('TestProvider', { id: 123 });

      expect(mocks.logger.debug).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // CACHING
  // ===================================================================

  describe('Caching', () => {
    let provider;

    beforeEach(() => {
      provider = new TestDataProvider(mocks.logger, {
        cacheable: true,
        cacheDurationMs: 1000
      });
    });

    it('should cache results when cacheable is true', () => {
      const result1 = provider.provide('TestProvider', { id: 123 });
      const result2 = provider.provide('TestProvider', { id: 123 });

      expect(provider.fetchCount).toBe(1);
      expect(result1).toBe(result2);
    });

    it('should not cache when cacheable is false', () => {
      provider = new TestDataProvider(mocks.logger, { cacheable: false });

      const result1 = provider.provide('TestProvider', { id: 123 });
      const result2 = provider.provide('TestProvider', { id: 123 });

      expect(provider.fetchCount).toBe(2);
      expect(result1).not.toBe(result2);
    });

    it('should use different cache keys for different parameters', () => {
      provider.provide('TestProvider', { id: 123 });
      provider.provide('TestProvider', { id: 456 });

      expect(provider.fetchCount).toBe(2);
    });

    it('should use same cache key for same parameters', () => {
      provider.provide('TestProvider', { id: 123, name: 'test' });
      provider.provide('TestProvider', { name: 'test', id: 123 }); // Different order

      expect(provider.fetchCount).toBe(1);
    });

    it('should expire cache after duration', (done) => {
      provider = new TestDataProvider(mocks.logger, {
        cacheable: true,
        cacheDurationMs: 10 // 10ms
      });

      provider.provide('TestProvider', { id: 123 });

      setTimeout(() => {
        provider.provide('TestProvider', { id: 123 });
        expect(provider.fetchCount).toBe(2);
        done();
      }, 20);
    });

    it('should clear cache', () => {
      provider.provide('TestProvider', { id: 123 });
      expect(provider.fetchCount).toBe(1);

      provider.clearCache();

      provider.provide('TestProvider', { id: 123 });
      expect(provider.fetchCount).toBe(2);
    });

    it('should support method chaining for clearCache', () => {
      const result = provider.clearCache();

      expect(result).toBe(provider);
    });

    it('should handle complex parameters in cache key', () => {
      provider.provide('TestProvider', {
        id: 123,
        filters: { status: 'active', type: 'user' },
        options: ['a', 'b', 'c']
      });

      provider.provide('TestProvider', {
        id: 123,
        filters: { status: 'active', type: 'user' },
        options: ['a', 'b', 'c']
      });

      expect(provider.fetchCount).toBe(1);
    });
  });

  // ===================================================================
  // ABSTRACT METHOD
  // ===================================================================

  describe('Abstract Method', () => {
    it('should throw error if _fetchData is not implemented', () => {
      const provider = new DataProvider(mocks.logger);

      expect(() => provider.provide('Provider', { id: 123 })).toThrow(
        'DataProvider._fetchData must be implemented by subclass'
      );
    });
  });

  // ===================================================================
  // PARAMETER VALIDATION
  // ===================================================================

  describe('Parameter Validation', () => {
    it('should call _validateParameters by default (no-op)', () => {
      class ValidatingProvider extends DataProvider {
        _fetchData(parameters) {
          this._validateParameters(parameters);
          return { data: 'test' };
        }
      }

      const provider = new ValidatingProvider(mocks.logger);

      expect(() => provider.provide('Provider', { id: 123 })).not.toThrow();
    });

    it('should allow custom validation in subclass', () => {
      class ValidatingProvider extends DataProvider {
        _validateParameters(parameters) {
          if (!parameters.id) {
            throw new Error('id is required');
          }
        }

        _fetchData(parameters) {
          this._validateParameters(parameters);
          return { id: parameters.id };
        }
      }

      const provider = new ValidatingProvider(mocks.logger);

      expect(() => provider.provide('Provider', {})).toThrow(ProviderExecutionError);
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    it('should handle provider with all features', () => {
      class AdvancedProvider extends DataProvider {
        constructor(logger) {
          super(logger, {
            cacheable: true,
            cacheDurationMs: 1000
          });
          this.callCount = 0;
        }

        _validateParameters(parameters) {
          if (!parameters.userId) {
            throw new Error('userId is required');
          }
        }

        _fetchData(parameters) {
          this._validateParameters(parameters);
          this.callCount++;

          return {
            userId: parameters.userId,
            userData: { name: `User ${parameters.userId}` },
            timestamp: Date.now()
          };
        }
      }

      const provider = new AdvancedProvider(mocks.logger);

      // First call - fetch
      const result1 = provider.provide('Advanced', { userId: 123 });
      expect(result1.userId).toBe(123);
      expect(provider.callCount).toBe(1);

      // Second call - cached
      const result2 = provider.provide('Advanced', { userId: 123 });
      expect(result2).toBe(result1);
      expect(provider.callCount).toBe(1);

      // Different parameters - fetch
      const result3 = provider.provide('Advanced', { userId: 456 });
      expect(result3.userId).toBe(456);
      expect(provider.callCount).toBe(2);

      // Invalid parameters - error
      expect(() => provider.provide('Advanced', {})).toThrow(ProviderExecutionError);
    });

    it('should handle provider that returns various data types', () => {
      class MultiTypeProvider extends DataProvider {
        _fetchData(parameters) {
          switch (parameters.type) {
            case 'array':
              return [1, 2, 3];
            case 'object':
              return { data: 'test' };
            case 'string':
              return 'test string';
            case 'number':
              return 42;
            case 'boolean':
              return true;
            case 'null':
              return null;
            default:
              return undefined;
          }
        }
      }

      const provider = new MultiTypeProvider(mocks.logger, { cacheable: true });

      expect(provider.provide('Multi', { type: 'array' })).toEqual([1, 2, 3]);
      expect(provider.provide('Multi', { type: 'object' })).toEqual({ data: 'test' });
      expect(provider.provide('Multi', { type: 'string' })).toBe('test string');
      expect(provider.provide('Multi', { type: 'number' })).toBe(42);
      expect(provider.provide('Multi', { type: 'boolean' })).toBe(true);
      expect(provider.provide('Multi', { type: 'null' })).toBe(null);
    });
  });
});
