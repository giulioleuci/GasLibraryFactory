/**
 * Integration Test: ProviderRegistry + DependencyResolver
 *
 * Layers Tested: ContextEngine (ProviderRegistry, DependencyResolver, ContextAssembler)
 *
 * Purpose: Verifies that ProviderRegistry correctly manages provider instances
 * and DependencyResolver correctly resolves @param and $provider references.
 *
 * @file ContextEngine/src/__tests__/integration/ProviderRegistryResolution.test.js
 */

import { ContextAssembler } from '../../ContextAssembler';
import { ProviderRegistry } from '../../ProviderRegistry';
import { DependencyResolver } from '../../internal/DependencyResolver';
import { DataProvider } from '../../DataProvider';

describe('ProviderRegistry + DependencyResolver Integration', () => {
  let logger;
  let registry;
  let resolver;
  let assembler;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    registry = new ProviderRegistry(logger);
    resolver = new DependencyResolver(logger);
  });

  describe('singleton provider management', () => {
    it('should return same instance for singleton providers', () => {
      class CounterProvider extends DataProvider {
        constructor(logger) {
          super(logger);
          this.instanceId = Math.random();
          this.callCount = 0;
        }

        _fetchData() {
          this.callCount++;
          return { instanceId: this.instanceId, callCount: this.callCount };
        }
      }

      const provider = new CounterProvider(logger);
      registry.registerSingleton('CounterProvider', provider);

      // Get provider multiple times
      const instance1 = registry.get('CounterProvider');
      const instance2 = registry.get('CounterProvider');

      expect(instance1).toBe(instance2);
      expect(instance1.instanceId).toBe(instance2.instanceId);
    });

    it('should maintain state across singleton provider calls', () => {
      class StatefulProvider extends DataProvider {
        constructor(logger) {
          super(logger);
          this.callCount = 0;
        }

        _fetchData() {
          this.callCount++;
          return { count: this.callCount };
        }
      }

      registry.registerSingleton('StatefulProvider', new StatefulProvider(logger));
      assembler = new ContextAssembler(logger, registry);

      // First assembly
      const recipe = {
        providers: [{ name: 'data1', type: 'StatefulProvider', parameters: {} }]
      };

      const context1 = assembler.assemble(recipe, {});
      expect(context1.data1.count).toBe(1);

      // Second assembly - same singleton, count should increment
      const context2 = assembler.assemble(recipe, {});
      expect(context2.data1.count).toBe(2);
    });
  });

  describe('factory provider management', () => {
    it('should create new instance for each factory provider request', () => {
      class InstanceIdProvider extends DataProvider {
        constructor(logger) {
          super(logger);
          this.instanceId = Math.random();
        }

        _fetchData() {
          return { instanceId: this.instanceId };
        }
      }

      registry.registerFactory('InstanceIdProvider', () => new InstanceIdProvider(logger));

      const instance1 = registry.get('InstanceIdProvider');
      const instance2 = registry.get('InstanceIdProvider');

      expect(instance1).not.toBe(instance2);
      expect(instance1.instanceId).not.toBe(instance2.instanceId);
    });

    it('should reset state for each factory provider execution', () => {
      class ResetableProvider extends DataProvider {
        constructor(logger) {
          super(logger);
          this.callCount = 0;
        }

        _fetchData() {
          this.callCount++;
          return { count: this.callCount };
        }
      }

      registry.registerFactory('ResetableProvider', () => new ResetableProvider(logger));
      assembler = new ContextAssembler(logger, registry);

      const recipe = {
        providers: [{ name: 'data', type: 'ResetableProvider', parameters: {} }]
      };

      // Each assembly gets a fresh instance
      const context1 = assembler.assemble(recipe, {});
      expect(context1.data.count).toBe(1);

      const context2 = assembler.assemble(recipe, {});
      expect(context2.data.count).toBe(1); // Reset, not 2
    });
  });

  describe('@param dependency resolution', () => {
    it('should resolve @param references to initial parameters', () => {
      const parameters = {
        userId: '@userId',
        limit: '@maxItems',
        offset: '@pageOffset'
      };

      const initialParams = {
        userId: 123,
        maxItems: 50,
        pageOffset: 0
      };

      const resolved = resolver.resolveAll(parameters, initialParams, {}, 'testProvider');

      expect(resolved.userId).toBe(123);
      expect(resolved.limit).toBe(50);
      expect(resolved.offset).toBe(0);
    });

    it('should handle nested @param references', () => {
      const parameters = {
        config: {
          id: '@configId',
          settings: {
            enabled: '@isEnabled'
          }
        }
      };

      const initialParams = {
        configId: 'config-123',
        isEnabled: true
      };

      const resolved = resolver.resolveAll(parameters, initialParams, {}, 'testProvider');

      expect(resolved.config.id).toBe('config-123');
      expect(resolved.config.settings.enabled).toBe(true);
    });

    it('should throw error for missing @param reference', () => {
      const parameters = {
        userId: '@nonExistentParam'
      };

      expect(() => {
        resolver.resolveAll(parameters, {}, {}, 'testProvider');
      }).toThrow();
    });
  });

  describe('$provider dependency resolution', () => {
    it('should resolve $provider references to previous provider outputs', () => {
      const parameters = {
        userId: '$userData.id',
        email: '$userData.email'
      };

      const providerResults = {
        userData: {
          id: 456,
          email: 'test@example.com',
          name: 'Test User'
        }
      };

      const resolved = resolver.resolveAll(parameters, {}, providerResults, 'testProvider');

      expect(resolved.userId).toBe(456);
      expect(resolved.email).toBe('test@example.com');
    });

    it('should resolve entire provider result without property', () => {
      const parameters = {
        allUserData: '$userData'
      };

      const providerResults = {
        userData: {
          id: 789,
          name: 'Full Object Test'
        }
      };

      const resolved = resolver.resolveAll(parameters, {}, providerResults, 'testProvider');

      expect(resolved.allUserData).toEqual(providerResults.userData);
    });

    it('should resolve deeply nested $provider references', () => {
      const parameters = {
        city: '$userData.address.city',
        zip: '$userData.address.postal.zip'
      };

      const providerResults = {
        userData: {
          address: {
            city: 'New York',
            postal: {
              zip: '10001'
            }
          }
        }
      };

      const resolved = resolver.resolveAll(parameters, {}, providerResults, 'testProvider');

      expect(resolved.city).toBe('New York');
      expect(resolved.zip).toBe('10001');
    });

    it('should throw error for missing $provider reference', () => {
      const parameters = {
        data: '$nonExistentProvider.value'
      };

      expect(() => {
        resolver.resolveAll(parameters, {}, {}, 'testProvider');
      }).toThrow();
    });
  });

  describe('mixed @param and $provider resolution', () => {
    it('should resolve both @param and $provider in same parameters object', () => {
      const parameters = {
        userId: '@requestUserId',
        orderLimit: '@limit',
        lastOrderId: '$userData.lastOrderId'
      };

      const initialParams = {
        requestUserId: 100,
        limit: 25
      };

      const providerResults = {
        userData: {
          lastOrderId: 'order-999'
        }
      };

      const resolved = resolver.resolveAll(
        parameters,
        initialParams,
        providerResults,
        'testProvider'
      );

      expect(resolved.userId).toBe(100);
      expect(resolved.orderLimit).toBe(25);
      expect(resolved.lastOrderId).toBe('order-999');
    });
  });

  describe('full assembly with dependency resolution', () => {
    class UserProvider extends DataProvider {
      _fetchData(parameters) {
        return {
          id: parameters.userId,
          name: 'Test User',
          settings: {
            theme: 'dark',
            notifications: true
          }
        };
      }
    }

    class PreferencesProvider extends DataProvider {
      _fetchData(parameters) {
        return {
          userId: parameters.userId,
          theme: parameters.theme,
          notificationsEnabled: parameters.notifications
        };
      }
    }

    class SummaryProvider extends DataProvider {
      _fetchData(parameters) {
        return {
          userName: parameters.userName,
          userTheme: parameters.userTheme,
          totalItems: parameters.items?.length || 0
        };
      }
    }

    beforeEach(() => {
      registry.registerSingleton('UserProvider', new UserProvider(logger));
      registry.registerSingleton('PreferencesProvider', new PreferencesProvider(logger));
      registry.registerSingleton('SummaryProvider', new SummaryProvider(logger));
      assembler = new ContextAssembler(logger, registry);
    });

    it('should resolve dependencies in correct order through assembly', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'preferences',
            type: 'PreferencesProvider',
            parameters: {
              userId: '$userData.id',
              theme: '$userData.settings.theme',
              notifications: '$userData.settings.notifications'
            }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 42 });

      expect(context.userData.id).toBe(42);
      expect(context.preferences.userId).toBe(42);
      expect(context.preferences.theme).toBe('dark');
      expect(context.preferences.notificationsEnabled).toBe(true);
    });

    it('should resolve multiple levels of provider dependencies', () => {
      class ItemsProvider extends DataProvider {
        _fetchData(parameters) {
          return [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' }
          ];
        }
      }

      registry.registerSingleton('ItemsProvider', new ItemsProvider(logger));

      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'UserProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'preferences',
            type: 'PreferencesProvider',
            parameters: {
              userId: '$user.id',
              theme: '$user.settings.theme',
              notifications: '$user.settings.notifications'
            }
          },
          {
            name: 'items',
            type: 'ItemsProvider',
            parameters: {}
          },
          {
            name: 'summary',
            type: 'SummaryProvider',
            parameters: {
              userName: '$user.name',
              userTheme: '$preferences.theme',
              items: '$items'
            }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 99 });

      expect(context.user.id).toBe(99);
      expect(context.preferences.userId).toBe(99);
      expect(context.items.length).toBe(3);
      expect(context.summary.userName).toBe('Test User');
      expect(context.summary.userTheme).toBe('dark');
      expect(context.summary.totalItems).toBe(3);
    });
  });

  describe('dependency analysis', () => {
    it('should correctly analyze @param dependencies', () => {
      const parameters = {
        userId: '@userId',
        limit: '@maxLimit'
      };

      const analysis = resolver.analyzeDependencies(parameters);

      expect(analysis.paramDependencies).toContain('userId');
      expect(analysis.paramDependencies).toContain('maxLimit');
      expect(analysis.providerDependencies).toHaveLength(0);
    });

    it('should correctly analyze $provider dependencies', () => {
      const parameters = {
        id: '$userData.id',
        orders: '$orderData'
      };

      const analysis = resolver.analyzeDependencies(parameters);

      // providerDependencies contains just the provider name (before the dot)
      expect(analysis.providerDependencies).toContain('userData');
      expect(analysis.providerDependencies).toContain('orderData');
      expect(analysis.paramDependencies).toHaveLength(0);
    });

    it('should analyze mixed dependencies', () => {
      const parameters = {
        userId: '@userId',
        userName: '$user.name',
        limit: '@maxItems',
        lastOrder: '$orders.latest'
      };

      const analysis = resolver.analyzeDependencies(parameters);

      expect(analysis.paramDependencies).toContain('userId');
      expect(analysis.paramDependencies).toContain('maxItems');
      // providerDependencies contains just the provider name (before the dot)
      expect(analysis.providerDependencies).toContain('user');
      expect(analysis.providerDependencies).toContain('orders');
    });
  });

  describe('registered provider types', () => {
    it('should return list of registered provider types', () => {
      class ProviderA extends DataProvider {
        _fetchData() {
          return {};
        }
      }
      class ProviderB extends DataProvider {
        _fetchData() {
          return {};
        }
      }

      registry.registerSingleton('ProviderA', new ProviderA(logger));
      registry.registerFactory('ProviderB', () => new ProviderB(logger));

      const types = registry.getRegisteredTypes();

      expect(types).toContain('ProviderA');
      expect(types).toContain('ProviderB');
    });

    it('should throw error for unregistered provider type', () => {
      expect(() => {
        registry.get('UnregisteredProvider');
      }).toThrow();
    });
  });
});
