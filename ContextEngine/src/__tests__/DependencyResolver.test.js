// ===================================================================
// FILE: ContextEngine/src/__tests__/DependencyResolver.test.js
// ===================================================================
// Comprehensive test suite for DependencyResolver
// Coverage: All methods and features
// ===================================================================

import { DependencyResolver } from '../internal/DependencyResolver';
import { DependencyResolutionError } from '../internal/errors/DependencyResolutionError';
import { MockFactory } from '../../../test/fakes';

describe('DependencyResolver - Comprehensive Test Suite', () => {
  let mocks;
  let resolver;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    resolver = new DependencyResolver(mocks.logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with logger', () => {
      expect(resolver).toBeDefined();
      expect(resolver.logger).toBe(mocks.logger);
    });

    it('should throw error if logger is invalid', () => {
      expect(() => new DependencyResolver(null)).toThrow(
        'DependencyResolver: logger is required and must be an object'
      );
      expect(() => new DependencyResolver('not an object')).toThrow(
        'DependencyResolver: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing required methods', () => {
      const invalidLogger = { debug: jest.fn() };
      expect(() => new DependencyResolver(invalidLogger)).toThrow(
        'DependencyResolver: logger must have debug, info, warn, and error methods'
      );
    });
  });

  // ===================================================================
  // DEPENDENCY DETECTION
  // ===================================================================

  describe('Dependency Detection', () => {
    it('should detect @param dependencies', () => {
      expect(resolver.isDependency('@userId')).toBe(true);
      expect(resolver.isDependency('@startDate')).toBe(true);
      expect(resolver.isDependency('@my_param')).toBe(true);
    });

    it('should detect $provider dependencies', () => {
      expect(resolver.isDependency('$userData')).toBe(true);
      expect(resolver.isDependency('$userData.name')).toBe(true);
      expect(resolver.isDependency('$userData.address.city')).toBe(true);
      expect(resolver.isDependency('$data.orders[0].id')).toBe(true);
    });

    it('should not detect literal values as dependencies', () => {
      expect(resolver.isDependency('literal value')).toBe(false);
      expect(resolver.isDependency('123')).toBe(false);
      expect(resolver.isDependency('')).toBe(false);
    });

    it('should not detect non-string values as dependencies', () => {
      expect(resolver.isDependency(123)).toBe(false);
      expect(resolver.isDependency(null)).toBe(false);
      expect(resolver.isDependency(undefined)).toBe(false);
      expect(resolver.isDependency({})).toBe(false);
    });
  });

  // ===================================================================
  // @PARAM RESOLUTION
  // ===================================================================

  describe('@param Resolution', () => {
    const initialParams = {
      userId: 123,
      startDate: '2024-01-01',
      filters: {
        status: 'active',
        type: 'user'
      }
    };

    const providerResults = {};

    it('should resolve simple @param dependency', () => {
      const result = resolver.resolve('@userId', initialParams, providerResults);

      expect(result).toBe(123);
    });

    it('should resolve @param with string value', () => {
      const result = resolver.resolve('@startDate', initialParams, providerResults);

      expect(result).toBe('2024-01-01');
    });

    it('should resolve @param with object value', () => {
      const result = resolver.resolve('@filters', initialParams, providerResults);

      expect(result).toEqual({ status: 'active', type: 'user' });
    });

    it('should throw error if @param not found', () => {
      expect(() => resolver.resolve('@missingParam', initialParams, providerResults)).toThrow(
        DependencyResolutionError
      );
    });

    it('should throw error with available params in context', () => {
      try {
        resolver.resolve('@missingParam', initialParams, providerResults);
      } catch (error) {
        expect(error).toBeInstanceOf(DependencyResolutionError);
        expect(error.context.availableParams).toContain('userId');
        expect(error.context.availableParams).toContain('startDate');
      }
    });

    it('should throw error if dependency is not a string', () => {
      expect(() => resolver.resolve(123, initialParams, providerResults)).toThrow(
        'DependencyResolver.resolve: dependency must be a string'
      );
    });

    it('should throw error if initialParams is invalid', () => {
      expect(() => resolver.resolve('@userId', null, providerResults)).toThrow(
        'DependencyResolver.resolve: initialParams is required and must be an object'
      );
    });

    it('should throw error if providerResults is invalid', () => {
      expect(() => resolver.resolve('@userId', initialParams, null)).toThrow(
        'DependencyResolver.resolve: providerResults is required and must be an object'
      );
    });
  });

  // ===================================================================
  // $PROVIDER RESOLUTION
  // ===================================================================

  describe('$provider Resolution', () => {
    const initialParams = {};
    const providerResults = {
      userData: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          city: 'New York',
          country: 'USA'
        }
      },
      orders: [
        { id: 1, total: 50, status: 'completed' },
        { id: 2, total: 75, status: 'pending' }
      ]
    };

    it('should resolve entire provider result', () => {
      const result = resolver.resolve('$userData', initialParams, providerResults);

      expect(result).toEqual(providerResults.userData);
    });

    it('should resolve simple property', () => {
      const result = resolver.resolve('$userData.name', initialParams, providerResults);

      expect(result).toBe('John Doe');
    });

    it('should resolve nested property', () => {
      const result = resolver.resolve('$userData.address.city', initialParams, providerResults);

      expect(result).toBe('New York');
    });

    it('should resolve array element in nested property', () => {
      const results = {
        data: {
          orders: [
            { id: 1, total: 50 },
            { id: 2, total: 75 }
          ]
        }
      };

      const result = resolver.resolve('$data.orders[0].id', initialParams, results);

      expect(result).toBe(1);
    });

    it('should resolve array element property in nested structure', () => {
      const results = {
        data: {
          orders: [
            { id: 1, status: 'completed' },
            { id: 2, status: 'pending' }
          ]
        }
      };

      const result = resolver.resolve('$data.orders[1].status', initialParams, results);

      expect(result).toBe('pending');
    });

    it('should throw error if provider not found', () => {
      expect(() => resolver.resolve('$missingProvider', initialParams, providerResults)).toThrow(
        DependencyResolutionError
      );
    });

    it('should throw error with available providers in context', () => {
      try {
        resolver.resolve('$missingProvider', initialParams, providerResults);
      } catch (error) {
        expect(error).toBeInstanceOf(DependencyResolutionError);
        expect(error.context.availableProviders).toContain('userData');
        expect(error.context.availableProviders).toContain('orders');
      }
    });

    it('should throw error if property not found', () => {
      expect(() =>
        resolver.resolve('$userData.missingProperty', initialParams, providerResults)
      ).toThrow(DependencyResolutionError);
    });

    it('should return undefined for nested property in null', () => {
      const results = { nullData: null };

      expect(() => resolver.resolve('$nullData.property', initialParams, results)).toThrow(
        DependencyResolutionError
      );
    });

    it('should handle array index out of bounds', () => {
      const results = {
        data: {
          orders: [{ id: 1 }]
        }
      };

      expect(() => resolver.resolve('$data.orders[999].id', initialParams, results)).toThrow(
        DependencyResolutionError
      );
    });
  });

  // ===================================================================
  // RESOLVE ALL
  // ===================================================================

  describe('resolveAll', () => {
    const initialParams = {
      userId: 123,
      startDate: '2024-01-01'
    };

    const providerResults = {
      userData: {
        id: 123,
        name: 'John Doe',
        isActive: true
      }
    };

    it('should resolve all dependencies in simple object', () => {
      const parameters = {
        userId: '@userId',
        userName: '$userData.name',
        status: '$userData.isActive'
      };

      const resolved = resolver.resolveAll(parameters, initialParams, providerResults);

      expect(resolved).toEqual({
        userId: 123,
        userName: 'John Doe',
        status: true
      });
    });

    it('should preserve literal values', () => {
      const parameters = {
        userId: '@userId',
        staticValue: 'literal',
        staticNumber: 42,
        staticBool: true
      };

      const resolved = resolver.resolveAll(parameters, initialParams, providerResults);

      expect(resolved).toEqual({
        userId: 123,
        staticValue: 'literal',
        staticNumber: 42,
        staticBool: true
      });
    });

    it('should resolve nested objects', () => {
      const parameters = {
        user: {
          id: '@userId',
          name: '$userData.name'
        },
        dates: {
          start: '@startDate'
        }
      };

      const resolved = resolver.resolveAll(parameters, initialParams, providerResults);

      expect(resolved).toEqual({
        user: {
          id: 123,
          name: 'John Doe'
        },
        dates: {
          start: '2024-01-01'
        }
      });
    });

    it('should resolve arrays', () => {
      const parameters = {
        values: ['@userId', '$userData.name', 'literal']
      };

      const resolved = resolver.resolveAll(parameters, initialParams, providerResults);

      expect(resolved).toEqual({
        values: [123, 'John Doe', 'literal']
      });
    });

    it('should resolve arrays with objects', () => {
      const parameters = {
        items: [
          { id: '@userId', name: '$userData.name' },
          { id: 456, name: 'Static' }
        ]
      };

      const resolved = resolver.resolveAll(parameters, initialParams, providerResults);

      expect(resolved).toEqual({
        items: [
          { id: 123, name: 'John Doe' },
          { id: 456, name: 'Static' }
        ]
      });
    });

    it('should throw error if parameters is invalid', () => {
      expect(() => resolver.resolveAll(null, initialParams, providerResults)).toThrow(
        'DependencyResolver.resolveAll: parameters is required and must be an object'
      );
    });

    it('should throw error if dependency cannot be resolved', () => {
      const parameters = { userId: '@missingParam' };

      expect(() => resolver.resolveAll(parameters, initialParams, providerResults)).toThrow(
        DependencyResolutionError
      );
    });

    it('should handle empty parameters object', () => {
      const resolved = resolver.resolveAll({}, initialParams, providerResults);

      expect(resolved).toEqual({});
    });

    it('should handle complex nested structure', () => {
      const parameters = {
        user: {
          id: '@userId',
          profile: {
            name: '$userData.name',
            status: {
              active: '$userData.isActive'
            }
          }
        },
        metadata: {
          dates: ['@startDate'],
          flags: {
            processed: true
          }
        }
      };

      const resolved = resolver.resolveAll(parameters, initialParams, providerResults);

      expect(resolved.user.id).toBe(123);
      expect(resolved.user.profile.name).toBe('John Doe');
      expect(resolved.user.profile.status.active).toBe(true);
      expect(resolved.metadata.dates).toEqual(['2024-01-01']);
      expect(resolved.metadata.flags.processed).toBe(true);
    });
  });

  // ===================================================================
  // ANALYZE DEPENDENCIES
  // ===================================================================

  describe('analyzeDependencies', () => {
    it('should analyze @param dependencies', () => {
      const parameters = {
        userId: '@userId',
        startDate: '@startDate'
      };

      const analysis = resolver.analyzeDependencies(parameters);

      expect(analysis.paramDependencies).toContain('userId');
      expect(analysis.paramDependencies).toContain('startDate');
      expect(analysis.providerDependencies).toEqual([]);
      expect(analysis.totalDependencies).toBe(2);
    });

    it('should analyze $provider dependencies', () => {
      const parameters = {
        userName: '$userData.name',
        userEmail: '$userData.email',
        orderId: '$orders.id'
      };

      const analysis = resolver.analyzeDependencies(parameters);

      expect(analysis.paramDependencies).toEqual([]);
      expect(analysis.providerDependencies).toContain('userData');
      expect(analysis.providerDependencies).toContain('orders');
      expect(analysis.totalDependencies).toBe(2);
    });

    it('should analyze mixed dependencies', () => {
      const parameters = {
        userId: '@userId',
        userName: '$userData.name',
        startDate: '@startDate',
        orderId: '$orders.id'
      };

      const analysis = resolver.analyzeDependencies(parameters);

      expect(analysis.paramDependencies).toContain('userId');
      expect(analysis.paramDependencies).toContain('startDate');
      expect(analysis.providerDependencies).toContain('userData');
      expect(analysis.providerDependencies).toContain('orders');
      expect(analysis.totalDependencies).toBe(4);
    });

    it('should analyze nested dependencies', () => {
      const parameters = {
        user: {
          id: '@userId',
          name: '$userData.name'
        },
        filters: {
          startDate: '@startDate'
        }
      };

      const analysis = resolver.analyzeDependencies(parameters);

      expect(analysis.paramDependencies).toContain('userId');
      expect(analysis.paramDependencies).toContain('startDate');
      expect(analysis.providerDependencies).toContain('userData');
      expect(analysis.totalDependencies).toBe(3);
    });

    it('should return empty analysis for no dependencies', () => {
      const parameters = {
        literal: 'value',
        number: 123
      };

      const analysis = resolver.analyzeDependencies(parameters);

      expect(analysis.paramDependencies).toEqual([]);
      expect(analysis.providerDependencies).toEqual([]);
      expect(analysis.totalDependencies).toBe(0);
    });

    it('should deduplicate dependencies', () => {
      const parameters = {
        userId1: '@userId',
        userId2: '@userId',
        userName1: '$userData.name',
        userName2: '$userData.email'
      };

      const analysis = resolver.analyzeDependencies(parameters);

      expect(analysis.paramDependencies).toEqual(['userId']);
      expect(analysis.providerDependencies).toEqual(['userData']);
      expect(analysis.totalDependencies).toBe(2);
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    it('should handle complex dependency resolution workflow', () => {
      const initialParams = {
        userId: 123,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const providerResults = {
        userData: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
          organizationId: 456,
          isActive: true
        },
        organizationData: {
          id: 456,
          name: 'Acme Corp',
          country: 'USA'
        }
      };

      const parameters = {
        userId: '@userId',
        userName: '$userData.name',
        userEmail: '$userData.email',
        orgId: '$userData.organizationId',
        orgName: '$organizationData.name',
        dateRange: {
          start: '@startDate',
          end: '@endDate'
        },
        metadata: {
          isActive: '$userData.isActive',
          country: '$organizationData.country'
        }
      };

      const resolved = resolver.resolveAll(parameters, initialParams, providerResults);

      expect(resolved).toEqual({
        userId: 123,
        userName: 'John Doe',
        userEmail: 'john@example.com',
        orgId: 456,
        orgName: 'Acme Corp',
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        metadata: {
          isActive: true,
          country: 'USA'
        }
      });
    });

    it('should provide helpful error messages', () => {
      const initialParams = { userId: 123 };
      const providerResults = { userData: { id: 123 } };

      try {
        resolver.resolve('@missingParam', initialParams, providerResults, 'TestProvider');
      } catch (error) {
        expect(error.message).toContain('missingParam');
        expect(error.context.providerName).toBe('TestProvider');
      }
    });
  });
});
