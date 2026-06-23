// ===================================================================
// FILE: ContextEngine/src/__tests__/ProviderRegistry.test.js
// ===================================================================
// Comprehensive test suite for ProviderRegistry
// Coverage: All methods and features
// ===================================================================

import { ProviderRegistry } from '../ProviderRegistry';
import { ProviderNotFoundError } from '../internal/errors/ProviderNotFoundError';
import { MockFactory } from '../../../test/fakes';

describe('ProviderRegistry - Comprehensive Test Suite', () => {
  let mocks;
  let registry;
  let mockProvider;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    mockProvider = {
      provide: jest.fn(() => ({ data: 'test' }))
    };

    registry = new ProviderRegistry(mocks.logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with logger', () => {
      expect(registry).toBeDefined();
      expect(registry.logger).toBe(mocks.logger);
    });

    it('should throw error if logger is invalid', () => {
      expect(() => new ProviderRegistry(null)).toThrow(
        'ProviderRegistry: logger is required and must be an object'
      );
      expect(() => new ProviderRegistry('not an object')).toThrow(
        'ProviderRegistry: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing required methods', () => {
      const invalidLogger = { debug: jest.fn() };
      expect(() => new ProviderRegistry(invalidLogger)).toThrow(
        'ProviderRegistry: logger must have debug, info, warn, and error methods'
      );
    });

    it('should start with no registered providers', () => {
      expect(registry.getRegisteredTypes()).toEqual([]);

      const summary = registry.getSummary();
      expect(summary.totalProviders).toBe(0);
    });
  });

  // ===================================================================
  // SINGLETON REGISTRATION
  // ===================================================================

  describe('Singleton Registration', () => {
    it('should register singleton provider', () => {
      registry.registerSingleton('TestProvider', mockProvider);

      expect(registry.has('TestProvider')).toBe(true);
      expect(registry.getRegisteredTypes()).toContain('TestProvider');
    });

    it('should support method chaining for registerSingleton', () => {
      const result = registry.registerSingleton('TestProvider', mockProvider);

      expect(result).toBe(registry);
    });

    it('should throw error if type is invalid', () => {
      expect(() => registry.registerSingleton('', mockProvider)).toThrow(
        'ProviderRegistry.registerSingleton: type is required and must be a non-empty string'
      );
      expect(() => registry.registerSingleton(null, mockProvider)).toThrow(
        'ProviderRegistry.registerSingleton: type is required and must be a non-empty string'
      );
      expect(() => registry.registerSingleton(123, mockProvider)).toThrow(
        'ProviderRegistry.registerSingleton: type is required and must be a non-empty string'
      );
    });

    it('should throw error if instance is invalid', () => {
      expect(() => registry.registerSingleton('Test', null)).toThrow(
        'ProviderRegistry.registerSingleton: instance is required and must be an object'
      );
      expect(() => registry.registerSingleton('Test', 'not an object')).toThrow(
        'ProviderRegistry.registerSingleton: instance is required and must be an object'
      );
    });

    it('should throw error if instance is missing provide method', () => {
      const invalidProvider = { getData: jest.fn() };
      expect(() => registry.registerSingleton('Test', invalidProvider)).toThrow(
        'ProviderRegistry.registerSingleton: instance must have a provide method'
      );
    });

    it('should allow overwriting existing singleton', () => {
      const newProvider = { provide: jest.fn(() => ({ data: 'new' })) };

      registry.registerSingleton('TestProvider', mockProvider);
      registry.registerSingleton('TestProvider', newProvider);

      const provider = registry.get('TestProvider');
      expect(provider).toBe(newProvider);
    });

    it('should return same instance on multiple gets', () => {
      registry.registerSingleton('TestProvider', mockProvider);

      const instance1 = registry.get('TestProvider');
      const instance2 = registry.get('TestProvider');

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(mockProvider);
    });
  });

  // ===================================================================
  // FACTORY REGISTRATION
  // ===================================================================

  describe('Factory Registration', () => {
    it('should register factory provider', () => {
      const factory = jest.fn(() => mockProvider);

      registry.registerFactory('TestProvider', factory);

      expect(registry.has('TestProvider')).toBe(true);
      expect(registry.getRegisteredTypes()).toContain('TestProvider');
    });

    it('should support method chaining for registerFactory', () => {
      const factory = jest.fn(() => mockProvider);
      const result = registry.registerFactory('TestProvider', factory);

      expect(result).toBe(registry);
    });

    it('should throw error if type is invalid', () => {
      const factory = jest.fn();

      expect(() => registry.registerFactory('', factory)).toThrow(
        'ProviderRegistry.registerFactory: type is required and must be a non-empty string'
      );
      expect(() => registry.registerFactory(null, factory)).toThrow(
        'ProviderRegistry.registerFactory: type is required and must be a non-empty string'
      );
    });

    it('should throw error if factory is not a function', () => {
      expect(() => registry.registerFactory('Test', 'not a function')).toThrow(
        'ProviderRegistry.registerFactory: factory is required and must be a function'
      );
      expect(() => registry.registerFactory('Test', null)).toThrow(
        'ProviderRegistry.registerFactory: factory is required and must be a function'
      );
    });

    it('should call factory on get', () => {
      const factory = jest.fn(() => mockProvider);

      registry.registerFactory('TestProvider', factory);
      registry.get('TestProvider');

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should create new instance on each get', () => {
      const factory = jest.fn(() => ({ provide: jest.fn() }));

      registry.registerFactory('TestProvider', factory);

      const instance1 = registry.get('TestProvider');
      const instance2 = registry.get('TestProvider');

      expect(factory).toHaveBeenCalledTimes(2);
      expect(instance1).not.toBe(instance2);
    });

    it('should throw error if factory returns invalid object', () => {
      const factory = jest.fn(() => null);

      registry.registerFactory('TestProvider', factory);

      expect(() => registry.get('TestProvider')).toThrow(
        "ProviderRegistry.get: Factory for 'TestProvider' did not return a valid object"
      );
    });

    it('should throw error if factory returns object without provide method', () => {
      const factory = jest.fn(() => ({ getData: jest.fn() }));

      registry.registerFactory('TestProvider', factory);

      expect(() => registry.get('TestProvider')).toThrow(
        "ProviderRegistry.get: Factory for 'TestProvider' returned an object without a provide method"
      );
    });
  });

  // ===================================================================
  // PROVIDER RETRIEVAL
  // ===================================================================

  describe('Provider Retrieval', () => {
    beforeEach(() => {
      registry.registerSingleton('SingletonProvider', mockProvider);
      registry.registerFactory('FactoryProvider', () => mockProvider);
    });

    it('should get singleton provider', () => {
      const provider = registry.get('SingletonProvider');

      expect(provider).toBe(mockProvider);
    });

    it('should get factory provider', () => {
      const provider = registry.get('FactoryProvider');

      expect(provider).toBeDefined();
      expect(typeof provider.provide).toBe('function');
    });

    it('should throw error if provider type is invalid', () => {
      expect(() => registry.get('')).toThrow(
        'ProviderRegistry.get: type is required and must be a non-empty string'
      );
      expect(() => registry.get(null)).toThrow(
        'ProviderRegistry.get: type is required and must be a non-empty string'
      );
    });

    it('should throw ProviderNotFoundError if provider not registered', () => {
      expect(() => registry.get('NonExistentProvider')).toThrow(ProviderNotFoundError);
    });

    it('should include registered providers in error', () => {
      try {
        registry.get('NonExistentProvider');
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderNotFoundError);
        expect(error.context.registeredProviders).toContain('SingletonProvider');
        expect(error.context.registeredProviders).toContain('FactoryProvider');
      }
    });
  });

  // ===================================================================
  // PROVIDER EXISTENCE CHECK
  // ===================================================================

  describe('Provider Existence Check', () => {
    beforeEach(() => {
      registry.registerSingleton('SingletonProvider', mockProvider);
      registry.registerFactory('FactoryProvider', () => mockProvider);
    });

    it('should return true for registered singleton', () => {
      expect(registry.has('SingletonProvider')).toBe(true);
    });

    it('should return true for registered factory', () => {
      expect(registry.has('FactoryProvider')).toBe(true);
    });

    it('should return false for unregistered provider', () => {
      expect(registry.has('NonExistentProvider')).toBe(false);
    });

    it('should return false if type is invalid', () => {
      expect(registry.has('')).toBe(false);
      expect(registry.has(null)).toBe(false);
    });
  });

  // ===================================================================
  // UNREGISTER
  // ===================================================================

  describe('Unregister', () => {
    beforeEach(() => {
      registry.registerSingleton('SingletonProvider', mockProvider);
      registry.registerFactory('FactoryProvider', () => mockProvider);
    });

    it('should unregister singleton provider', () => {
      const result = registry.unregister('SingletonProvider');

      expect(result).toBe(true);
      expect(registry.has('SingletonProvider')).toBe(false);
    });

    it('should unregister factory provider', () => {
      const result = registry.unregister('FactoryProvider');

      expect(result).toBe(true);
      expect(registry.has('FactoryProvider')).toBe(false);
    });

    it('should return false if provider not found', () => {
      const result = registry.unregister('NonExistentProvider');

      expect(result).toBe(false);
    });

    it('should throw error if type is invalid', () => {
      expect(() => registry.unregister('')).toThrow(
        'ProviderRegistry.unregister: type is required and must be a non-empty string'
      );
      expect(() => registry.unregister(null)).toThrow(
        'ProviderRegistry.unregister: type is required and must be a non-empty string'
      );
    });
  });

  // ===================================================================
  // CLEAR
  // ===================================================================

  describe('Clear', () => {
    beforeEach(() => {
      registry.registerSingleton('Singleton1', mockProvider);
      registry.registerSingleton('Singleton2', mockProvider);
      registry.registerFactory('Factory1', () => mockProvider);
    });

    it('should clear all providers', () => {
      registry.clear();

      expect(registry.getRegisteredTypes()).toEqual([]);
      expect(registry.has('Singleton1')).toBe(false);
      expect(registry.has('Singleton2')).toBe(false);
      expect(registry.has('Factory1')).toBe(false);
    });

    it('should support method chaining for clear', () => {
      const result = registry.clear();

      expect(result).toBe(registry);
    });
  });

  // ===================================================================
  // GET REGISTERED TYPES
  // ===================================================================

  describe('Get Registered Types', () => {
    it('should return empty array initially', () => {
      expect(registry.getRegisteredTypes()).toEqual([]);
    });

    it('should return registered singleton types', () => {
      registry.registerSingleton('Provider1', mockProvider);
      registry.registerSingleton('Provider2', mockProvider);

      const types = registry.getRegisteredTypes();

      expect(types).toHaveLength(2);
      expect(types).toContain('Provider1');
      expect(types).toContain('Provider2');
    });

    it('should return registered factory types', () => {
      registry.registerFactory('Provider1', () => mockProvider);
      registry.registerFactory('Provider2', () => mockProvider);

      const types = registry.getRegisteredTypes();

      expect(types).toHaveLength(2);
      expect(types).toContain('Provider1');
      expect(types).toContain('Provider2');
    });

    it('should return both singleton and factory types', () => {
      registry.registerSingleton('Singleton1', mockProvider);
      registry.registerFactory('Factory1', () => mockProvider);

      const types = registry.getRegisteredTypes();

      expect(types).toHaveLength(2);
      expect(types).toContain('Singleton1');
      expect(types).toContain('Factory1');
    });
  });

  // ===================================================================
  // GET SUMMARY
  // ===================================================================

  describe('Get Summary', () => {
    it('should return empty summary initially', () => {
      const summary = registry.getSummary();

      expect(summary.singletonCount).toBe(0);
      expect(summary.factoryCount).toBe(0);
      expect(summary.totalProviders).toBe(0);
      expect(summary.singletonTypes).toEqual([]);
      expect(summary.factoryTypes).toEqual([]);
    });

    it('should return correct counts', () => {
      registry.registerSingleton('Singleton1', mockProvider);
      registry.registerSingleton('Singleton2', mockProvider);
      registry.registerFactory('Factory1', () => mockProvider);

      const summary = registry.getSummary();

      expect(summary.singletonCount).toBe(2);
      expect(summary.factoryCount).toBe(1);
      expect(summary.totalProviders).toBe(3);
    });

    it('should return correct type arrays', () => {
      registry.registerSingleton('Singleton1', mockProvider);
      registry.registerFactory('Factory1', () => mockProvider);

      const summary = registry.getSummary();

      expect(summary.singletonTypes).toContain('Singleton1');
      expect(summary.factoryTypes).toContain('Factory1');
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    it('should handle mixed registration and retrieval', () => {
      const singleton = { provide: jest.fn(() => 'singleton') };
      const factory = jest.fn(() => ({ provide: jest.fn(() => 'factory') }));

      registry.registerSingleton('Singleton', singleton).registerFactory('Factory', factory);

      const s1 = registry.get('Singleton');
      const s2 = registry.get('Singleton');
      const f1 = registry.get('Factory');
      const f2 = registry.get('Factory');

      expect(s1).toBe(s2);
      expect(f1).not.toBe(f2);
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it('should handle provider replacement workflow', () => {
      const provider1 = { provide: jest.fn(() => 'v1') };
      const provider2 = { provide: jest.fn(() => 'v2') };

      registry.registerSingleton('Provider', provider1);
      expect(registry.get('Provider')).toBe(provider1);

      registry.registerSingleton('Provider', provider2);
      expect(registry.get('Provider')).toBe(provider2);
    });
  });
});
