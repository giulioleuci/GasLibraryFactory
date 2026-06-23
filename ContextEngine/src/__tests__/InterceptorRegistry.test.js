/**
 * @file ContextEngine/src/__tests__/InterceptorRegistry.test.js
 * @description Unit tests for InterceptorRegistry.
 */

import { InterceptorRegistry } from '../interceptors/InterceptorRegistry';
import { ContextInterceptor } from '../interceptors/ContextInterceptor';
import { MockFactory } from '../../../test/fakes';

describe('InterceptorRegistry', () => {
  let mocks;
  let registry;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    registry = new InterceptorRegistry(mocks.logger);
  });

  describe('constructor', () => {
    it('should create instance with valid logger', () => {
      expect(registry).toBeInstanceOf(InterceptorRegistry);
      expect(registry.logger).toBe(mocks.logger);
    });

    it('should throw error if logger is null', () => {
      expect(() => new InterceptorRegistry(null)).toThrow(
        'InterceptorRegistry: logger is required and must be an object'
      );
    });

    it('should throw error if logger is not an object', () => {
      expect(() => new InterceptorRegistry('not an object')).toThrow(
        'InterceptorRegistry: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing required methods', () => {
      const invalidLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
        // missing error
      };
      expect(() => new InterceptorRegistry(invalidLogger)).toThrow(
        'InterceptorRegistry: logger must have debug, info, warn, and error methods'
      );
    });
  });

  describe('registerSingleton', () => {
    let mockInterceptor;

    beforeEach(() => {
      mockInterceptor = {
        intercept: jest.fn((name, data) => ({ ...data, intercepted: true }))
      };
    });

    it('should register singleton interceptor', () => {
      const result = registry.registerSingleton('TestInterceptor', mockInterceptor);

      expect(result).toBe(registry); // fluent API
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        'Registered singleton interceptor: TestInterceptor'
      );
    });

    it('should throw error if type is not a string', () => {
      expect(() => registry.registerSingleton(null, mockInterceptor)).toThrow(
        'InterceptorRegistry.registerSingleton: type is required and must be a non-empty string'
      );
      expect(() => registry.registerSingleton('', mockInterceptor)).toThrow(
        'InterceptorRegistry.registerSingleton: type is required and must be a non-empty string'
      );
      expect(() => registry.registerSingleton(123, mockInterceptor)).toThrow(
        'InterceptorRegistry.registerSingleton: type is required and must be a non-empty string'
      );
    });

    it('should throw error if instance is not an object', () => {
      expect(() => registry.registerSingleton('Test', null)).toThrow(
        'InterceptorRegistry.registerSingleton: instance is required and must be an object'
      );
      expect(() => registry.registerSingleton('Test', 'not an object')).toThrow(
        'InterceptorRegistry.registerSingleton: instance is required and must be an object'
      );
    });

    it('should throw error if instance does not have intercept method', () => {
      const invalidInterceptor = { provide: jest.fn() };
      expect(() => registry.registerSingleton('Test', invalidInterceptor)).toThrow(
        'InterceptorRegistry.registerSingleton: instance must have an intercept method'
      );
    });

    it('should allow method chaining', () => {
      const interceptor1 = { intercept: jest.fn() };
      const interceptor2 = { intercept: jest.fn() };

      const result = registry
        .registerSingleton('Interceptor1', interceptor1)
        .registerSingleton('Interceptor2', interceptor2);

      expect(result).toBe(registry);
      expect(registry.has('Interceptor1')).toBe(true);
      expect(registry.has('Interceptor2')).toBe(true);
    });

    it('should replace existing singleton registration', () => {
      const interceptor1 = { intercept: jest.fn() };
      const interceptor2 = { intercept: jest.fn() };

      registry.registerSingleton('Test', interceptor1);
      registry.registerSingleton('Test', interceptor2);

      const retrieved = registry.get('Test');
      expect(retrieved).toBe(interceptor2);
    });
  });

  describe('registerFactory', () => {
    let mockFactory;

    beforeEach(() => {
      mockFactory = jest.fn(() => ({
        intercept: jest.fn((name, data) => ({ ...data, intercepted: true }))
      }));
    });

    it('should register factory interceptor', () => {
      const result = registry.registerFactory('TestInterceptor', mockFactory);

      expect(result).toBe(registry); // fluent API
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        'Registered factory interceptor: TestInterceptor'
      );
    });

    it('should throw error if type is not a string', () => {
      expect(() => registry.registerFactory(null, mockFactory)).toThrow(
        'InterceptorRegistry.registerFactory: type is required and must be a non-empty string'
      );
      expect(() => registry.registerFactory('', mockFactory)).toThrow(
        'InterceptorRegistry.registerFactory: type is required and must be a non-empty string'
      );
    });

    it('should throw error if factory is not a function', () => {
      expect(() => registry.registerFactory('Test', null)).toThrow(
        'InterceptorRegistry.registerFactory: factory is required and must be a function'
      );
      expect(() => registry.registerFactory('Test', 'not a function')).toThrow(
        'InterceptorRegistry.registerFactory: factory is required and must be a function'
      );
    });

    it('should allow method chaining', () => {
      const factory1 = jest.fn(() => ({ intercept: jest.fn() }));
      const factory2 = jest.fn(() => ({ intercept: jest.fn() }));

      const result = registry
        .registerFactory('Factory1', factory1)
        .registerFactory('Factory2', factory2);

      expect(result).toBe(registry);
      expect(registry.has('Factory1')).toBe(true);
      expect(registry.has('Factory2')).toBe(true);
    });

    it('should replace existing factory registration', () => {
      const factory1 = jest.fn(() => ({ intercept: jest.fn(), id: 1 }));
      const factory2 = jest.fn(() => ({ intercept: jest.fn(), id: 2 }));

      registry.registerFactory('Test', factory1);
      registry.registerFactory('Test', factory2);

      const retrieved = registry.get('Test');
      expect(factory2).toHaveBeenCalled();
      expect(factory1).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should retrieve singleton interceptor', () => {
      const mockInterceptor = { intercept: jest.fn() };
      registry.registerSingleton('Test', mockInterceptor);

      const retrieved = registry.get('Test');

      expect(retrieved).toBe(mockInterceptor);
      expect(mocks.logger.debug).toHaveBeenCalledWith('Retrieved singleton interceptor: Test');
    });

    it('should retrieve factory interceptor', () => {
      const mockInstance = { intercept: jest.fn() };
      const mockFactory = jest.fn(() => mockInstance);
      registry.registerFactory('Test', mockFactory);

      const retrieved = registry.get('Test');

      expect(retrieved).toBe(mockInstance);
      expect(mockFactory).toHaveBeenCalled();
      expect(mocks.logger.debug).toHaveBeenCalledWith(
        'Created interceptor instance from factory: Test'
      );
    });

    it('should create new instance on each get() for factory', () => {
      const mockFactory = jest.fn(() => ({ intercept: jest.fn() }));
      registry.registerFactory('Test', mockFactory);

      const instance1 = registry.get('Test');
      const instance2 = registry.get('Test');

      expect(instance1).not.toBe(instance2);
      expect(mockFactory).toHaveBeenCalledTimes(2);
    });

    it('should return same instance on each get() for singleton', () => {
      const mockInterceptor = { intercept: jest.fn() };
      registry.registerSingleton('Test', mockInterceptor);

      const instance1 = registry.get('Test');
      const instance2 = registry.get('Test');

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(mockInterceptor);
    });

    it('should prioritize singleton over factory', () => {
      const mockSingleton = { intercept: jest.fn(), type: 'singleton' };
      const mockFactory = jest.fn(() => ({ intercept: jest.fn(), type: 'factory' }));

      registry.registerSingleton('Test', mockSingleton);
      registry.registerFactory('Test', mockFactory);

      const retrieved = registry.get('Test');

      expect(retrieved).toBe(mockSingleton);
      expect(mockFactory).not.toHaveBeenCalled();
    });

    it('should throw error if type is not a string', () => {
      expect(() => registry.get(null)).toThrow(
        'InterceptorRegistry.get: type is required and must be a non-empty string'
      );
      expect(() => registry.get('')).toThrow(
        'InterceptorRegistry.get: type is required and must be a non-empty string'
      );
    });

    it('should throw error if interceptor not found', () => {
      expect(() => registry.get('NonExistent')).toThrow(
        "InterceptorRegistry.get: Interceptor type 'NonExistent' not found"
      );
    });

    it('should throw error if factory returns invalid object', () => {
      const invalidFactory = jest.fn(() => null);
      registry.registerFactory('Test', invalidFactory);

      expect(() => registry.get('Test')).toThrow(
        "InterceptorRegistry.get: Factory for 'Test' did not return a valid object"
      );
    });

    it('should throw error if factory returns object without intercept method', () => {
      const invalidFactory = jest.fn(() => ({ provide: jest.fn() }));
      registry.registerFactory('Test', invalidFactory);

      expect(() => registry.get('Test')).toThrow(
        "InterceptorRegistry.get: Factory for 'Test' returned an object without an intercept method"
      );
    });
  });

  describe('getAll', () => {
    it('should return empty array when no interceptors registered', () => {
      const result = registry.getAll();
      expect(result).toEqual([]);
    });

    it('should return all singleton interceptors', () => {
      const interceptor1 = { intercept: jest.fn() };
      const interceptor2 = { intercept: jest.fn() };

      registry.registerSingleton('Interceptor1', interceptor1);
      registry.registerSingleton('Interceptor2', interceptor2);

      const result = registry.getAll();

      expect(result).toHaveLength(2);
      expect(result).toContain(interceptor1);
      expect(result).toContain(interceptor2);
    });

    it('should create instances for all factory interceptors', () => {
      const factory1 = jest.fn(() => ({ intercept: jest.fn(), id: 1 }));
      const factory2 = jest.fn(() => ({ intercept: jest.fn(), id: 2 }));

      registry.registerFactory('Factory1', factory1);
      registry.registerFactory('Factory2', factory2);

      const result = registry.getAll();

      expect(result).toHaveLength(2);
      expect(factory1).toHaveBeenCalled();
      expect(factory2).toHaveBeenCalled();
    });

    it('should return both singletons and factory instances', () => {
      const singleton = { intercept: jest.fn(), type: 'singleton' };
      const factory = jest.fn(() => ({ intercept: jest.fn(), type: 'factory' }));

      registry.registerSingleton('Singleton', singleton);
      registry.registerFactory('Factory', factory);

      const result = registry.getAll();

      expect(result).toHaveLength(2);
      const types = result.map((i) => i.type);
      expect(types).toContain('singleton');
      expect(types).toContain('factory');
    });

    it('should skip factory instances that return invalid objects', () => {
      const validInterceptor = { intercept: jest.fn() };
      const invalidFactory = jest.fn(() => null);

      registry.registerSingleton('Valid', validInterceptor);
      registry.registerFactory('Invalid', invalidFactory);

      const result = registry.getAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(validInterceptor);
    });
  });

  describe('has', () => {
    it('should return true for registered singleton', () => {
      registry.registerSingleton('Test', { intercept: jest.fn() });
      expect(registry.has('Test')).toBe(true);
    });

    it('should return true for registered factory', () => {
      registry.registerFactory('Test', () => ({ intercept: jest.fn() }));
      expect(registry.has('Test')).toBe(true);
    });

    it('should return false for unregistered interceptor', () => {
      expect(registry.has('NonExistent')).toBe(false);
    });

    it('should return false for invalid type', () => {
      expect(registry.has(null)).toBe(false);
      expect(registry.has('')).toBe(false);
      expect(registry.has(123)).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should unregister singleton interceptor', () => {
      registry.registerSingleton('Test', { intercept: jest.fn() });

      const result = registry.unregister('Test');

      expect(result).toBe(true);
      expect(registry.has('Test')).toBe(false);
      expect(mocks.logger.debug).toHaveBeenCalledWith('Unregistered interceptor: Test');
    });

    it('should unregister factory interceptor', () => {
      registry.registerFactory('Test', () => ({ intercept: jest.fn() }));

      const result = registry.unregister('Test');

      expect(result).toBe(true);
      expect(registry.has('Test')).toBe(false);
    });

    it('should return false if interceptor not found', () => {
      const result = registry.unregister('NonExistent');
      expect(result).toBe(false);
    });

    it('should throw error if type is not a string', () => {
      expect(() => registry.unregister(null)).toThrow(
        'InterceptorRegistry.unregister: type is required and must be a non-empty string'
      );
    });
  });

  describe('clear', () => {
    it('should clear all interceptors', () => {
      registry.registerSingleton('Singleton', { intercept: jest.fn() });
      registry.registerFactory('Factory', () => ({ intercept: jest.fn() }));

      const result = registry.clear();

      expect(result).toBe(registry); // fluent API
      expect(registry.has('Singleton')).toBe(false);
      expect(registry.has('Factory')).toBe(false);
      expect(mocks.logger.debug).toHaveBeenCalledWith('Cleared all registered interceptors');
    });

    it('should work when no interceptors registered', () => {
      expect(() => registry.clear()).not.toThrow();
    });
  });

  describe('getRegisteredTypes', () => {
    it('should return empty array when no interceptors registered', () => {
      const types = registry.getRegisteredTypes();
      expect(types).toEqual([]);
    });

    it('should return all singleton types', () => {
      registry.registerSingleton('Singleton1', { intercept: jest.fn() });
      registry.registerSingleton('Singleton2', { intercept: jest.fn() });

      const types = registry.getRegisteredTypes();

      expect(types).toHaveLength(2);
      expect(types).toContain('Singleton1');
      expect(types).toContain('Singleton2');
    });

    it('should return all factory types', () => {
      registry.registerFactory('Factory1', () => ({ intercept: jest.fn() }));
      registry.registerFactory('Factory2', () => ({ intercept: jest.fn() }));

      const types = registry.getRegisteredTypes();

      expect(types).toHaveLength(2);
      expect(types).toContain('Factory1');
      expect(types).toContain('Factory2');
    });

    it('should return both singleton and factory types', () => {
      registry.registerSingleton('Singleton', { intercept: jest.fn() });
      registry.registerFactory('Factory', () => ({ intercept: jest.fn() }));

      const types = registry.getRegisteredTypes();

      expect(types).toHaveLength(2);
      expect(types).toContain('Singleton');
      expect(types).toContain('Factory');
    });
  });

  describe('getSummary', () => {
    it('should return summary with all counts', () => {
      registry.registerSingleton('Singleton1', { intercept: jest.fn() });
      registry.registerSingleton('Singleton2', { intercept: jest.fn() });
      registry.registerFactory('Factory1', () => ({ intercept: jest.fn() }));

      const summary = registry.getSummary();

      expect(summary).toEqual({
        singletonCount: 2,
        factoryCount: 1,
        totalInterceptors: 3,
        singletonTypes: ['Singleton1', 'Singleton2'],
        factoryTypes: ['Factory1']
      });
    });

    it('should return empty summary when no interceptors registered', () => {
      const summary = registry.getSummary();

      expect(summary).toEqual({
        singletonCount: 0,
        factoryCount: 0,
        totalInterceptors: 0,
        singletonTypes: [],
        factoryTypes: []
      });
    });
  });

  describe('logger getter', () => {
    it('should return logger instance', () => {
      expect(registry.logger).toBe(mocks.logger);
    });
  });
});
