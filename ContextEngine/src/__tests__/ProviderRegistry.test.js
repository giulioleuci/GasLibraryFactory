// ===================================================================
// FILE: ContextEngine/src/__tests__/ProviderRegistry.test.js
// ===================================================================
// Test suite for ProviderRegistry.
// ProviderRegistry is a thin TypedRegistry subclass (see internal/TypedRegistry.js);
// the shared singleton/factory registration and retrieval mechanics it inherits are
// already exercised end-to-end by InterceptorRegistry.test.js (the other TypedRegistry
// subclass). This suite covers only what's specific to ProviderRegistry's own wiring:
// its 'ProviderRegistry' label, the 'provide' required method, and its use of
// ProviderNotFoundError (a distinct class from InterceptorRegistry's plain Error).
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
      expect(registry).toBeInstanceOf(ProviderRegistry);
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
  });

  // ===================================================================
  // SINGLETON REGISTRATION
  // ===================================================================

  describe('Singleton Registration', () => {
    it('should register singleton provider', () => {
      registry.registerSingleton('TestProvider', mockProvider);

      expect(registry.get('TestProvider')).toBe(mockProvider);
      expect(registry.getRegisteredTypes()).toContain('TestProvider');
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
  });

  // ===================================================================
  // FACTORY REGISTRATION
  // ===================================================================

  describe('Factory Registration', () => {
    it('should register factory provider', () => {
      const factory = jest.fn(() => mockProvider);

      registry.registerFactory('TestProvider', factory);

      expect(registry.get('TestProvider')).not.toBeNull();
      expect(registry.getRegisteredTypes()).toContain('TestProvider');
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
});
