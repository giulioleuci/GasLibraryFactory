/**
 * Integration Test: Full Stack - Context Assembly
 *
 * Layers Tested: ContextEngine → ProviderRegistry → DataProviders → SheetDBLib → GoogleApiWrapper → GasExpressionEngineLib → GasResilienceLib → CoreUtilsLib
 *
 * Purpose: Verify complete context assembly flow from declarative recipes
 * through provider execution, dependency resolution, and data transformation.
 *
 * @file test/__tests__/integration/FullStack_ContextAssembly.test.js
 */

import {
  ContextAssembler,
  ProviderRegistry,
  DataProvider,
  DependencyResolver,
  RecipeParser
} from '@ContextEngine';
import { DatabaseService } from '@SheetDBLib';
import { ExpressionEngineService } from '@GasExpressionEngineLib';
import { ExceptionService } from '@GasResilienceLib';
import { LoggerService, UtilsService } from '@CoreUtilsLib';

describe('Full Stack Integration: Context Assembly', () => {
  // Custom DataProvider implementations for testing
  class UserDataProvider extends DataProvider {
    _fetchData(parameters) {
      // Simulates fetching user data from a database
      const users = {
        1: {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          tier: 'premium',
          organizationId: 100
        },
        2: { id: 2, name: 'Bob', email: 'bob@example.com', tier: 'standard', organizationId: 100 },
        3: {
          id: 3,
          name: 'Charlie',
          email: 'charlie@example.com',
          tier: 'free',
          organizationId: null
        }
      };
      return users[parameters.userId] || null;
    }
  }

  class OrderDataProvider extends DataProvider {
    _fetchData(parameters) {
      // Simulates fetching orders based on user ID
      const orders = {
        1: [
          { id: 101, userId: 1, amount: 150, status: 'completed' },
          { id: 102, userId: 1, amount: 200, status: 'completed' },
          { id: 103, userId: 1, amount: 75, status: 'pending' }
        ],
        2: [{ id: 201, userId: 2, amount: 50, status: 'completed' }],
        3: []
      };
      return orders[parameters.userId] || [];
    }
  }

  class OrganizationDataProvider extends DataProvider {
    _fetchData(parameters) {
      // Simulates fetching organization data
      const organizations = {
        100: { id: 100, name: 'Acme Corp', type: 'enterprise', memberCount: 50 }
      };
      return organizations[parameters.orgId] || null;
    }
  }

  class OrderAnalyticsProvider extends DataProvider {
    _fetchData(parameters) {
      const orders = parameters.orders || [];
      if (orders.length === 0) {
        return { totalOrders: 0, totalAmount: 0, avgAmount: 0 };
      }
      const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
      return {
        totalOrders: orders.length,
        totalAmount: totalAmount,
        avgAmount: totalAmount / orders.length
      };
    }
  }

  class DatabaseDataProvider extends DataProvider {
    constructor(logger, database) {
      super(logger);
      this._database = database;
    }

    _fetchData(parameters) {
      const table = this._database.tables[parameters.tableName];
      if (!table) {
        return [];
      }

      if (parameters.id) {
        return table.getByPK(parameters.id);
      }
      return table.getAllRows();
    }
  }

  // Test fixtures
  let mockLogger;
  let mockUtils;
  let mockCache;
  let mockDatabase;
  let exceptionService;
  let expressionEngine;
  let registry;
  let assembler;
  let testData;

  beforeEach(() => {
    // Layer 0: CoreUtilsLib - LoggerService and UtilsService
    mockLogger = global.mockLoggerService();
    mockUtils = {
      sleep: jest.fn((ms) => {}),
      getUuid: jest.fn(() => `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    };

    // Layer 0: CoreUtilsLib - CacheService mock
    mockCache = global.mockCacheService();

    // Track test data for database simulation
    testData = {
      Products: [
        { id: 'prod-1', name: 'Widget A', price: 100, category: 'Widgets' },
        { id: 'prod-2', name: 'Gadget B', price: 200, category: 'Gadgets' }
      ],
      Customers: [
        { id: 'cust-1', name: 'John Doe', email: 'john@example.com' },
        { id: 'cust-2', name: 'Jane Smith', email: 'jane@example.com' }
      ]
    };

    // Layer 2: SheetDBLib - DatabaseService mock
    mockDatabase = {
      tables: {
        Products: {
          name: 'Products',
          getAllRows: jest.fn(() => testData.Products),
          getByPK: jest.fn((id) => testData.Products.find((row) => row.id === id) || null)
        },
        Customers: {
          name: 'Customers',
          getAllRows: jest.fn(() => testData.Customers),
          getByPK: jest.fn((id) => testData.Customers.find((row) => row.id === id) || null)
        }
      },
      _cache: mockCache,
      _logger: mockLogger,
      _utils: mockUtils
    };

    // Layer 1: GasResilienceLib - ExceptionService
    exceptionService = new ExceptionService(mockLogger, mockUtils);

    // Layer 3: GasExpressionEngineLib - ExpressionEngineService
    expressionEngine = new ExpressionEngineService({ logger: mockLogger });

    // Layer 4: ContextEngine - ProviderRegistry
    registry = new ProviderRegistry(mockLogger);

    // Register providers
    registry.registerSingleton('UserDataProvider', new UserDataProvider(mockLogger));
    registry.registerSingleton('OrderDataProvider', new OrderDataProvider(mockLogger));
    registry.registerSingleton(
      'OrganizationDataProvider',
      new OrganizationDataProvider(mockLogger)
    );
    registry.registerSingleton('OrderAnalyticsProvider', new OrderAnalyticsProvider(mockLogger));
    registry.registerFactory(
      'DatabaseDataProvider',
      () => new DatabaseDataProvider(mockLogger, mockDatabase)
    );

    // Layer 4: ContextEngine - ContextAssembler
    assembler = new ContextAssembler(mockLogger, registry, expressionEngine, exceptionService);
  });

  afterEach(() => {
    mockCache._clear();
    jest.clearAllMocks();
  });

  describe('Complete Assembly Flow', () => {
    test('Basic recipe executes through all layers', () => {
      // Arrange: Simple recipe with single provider
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          }
        ]
      };

      // Act: Execute recipe
      const context = assembler.assemble(recipe, { userId: 1 });

      // Assert: Context assembled correctly
      expect(context.userData).toBeDefined();
      expect(context.userData.id).toBe(1);
      expect(context.userData.name).toBe('Alice');
      expect(context.userData.email).toBe('alice@example.com');
    });

    test('Dependency chain executes through all layers', () => {
      // Arrange: Recipe with provider dependencies
      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'orders',
            type: 'OrderDataProvider',
            parameters: { userId: '$user.id' }
          },
          {
            name: 'analytics',
            type: 'OrderAnalyticsProvider',
            parameters: { orders: '$orders' }
          }
        ]
      };

      // Act
      const context = assembler.assemble(recipe, { userId: 1 });

      // Assert: Full dependency chain resolved
      expect(context.user).toBeDefined();
      expect(context.user.id).toBe(1);

      expect(context.orders).toBeDefined();
      expect(context.orders).toHaveLength(3);

      expect(context.analytics).toBeDefined();
      expect(context.analytics.totalOrders).toBe(3);
      expect(context.analytics.totalAmount).toBe(425); // 150 + 200 + 75
      expect(context.analytics.avgAmount).toBeCloseTo(141.67, 1);
    });

    test('Multiple providers with cross-references', () => {
      // Arrange: Complex recipe with multiple providers and cross-references
      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'organization',
            type: 'OrganizationDataProvider',
            parameters: { orgId: '$user.organizationId' }
          },
          {
            name: 'orders',
            type: 'OrderDataProvider',
            parameters: { userId: '$user.id' }
          }
        ]
      };

      // Act
      const context = assembler.assemble(recipe, { userId: 1 });

      // Assert: All providers executed correctly
      expect(context.user.id).toBe(1);
      expect(context.organization.id).toBe(100);
      expect(context.organization.name).toBe('Acme Corp');
      expect(context.orders).toHaveLength(3);
    });
  });

  describe('Expression Engine Integration', () => {
    test('Conditional execution based on expression evaluation', () => {
      // Arrange: Recipe with conditional providers
      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'premiumOrders',
            type: 'OrderDataProvider',
            condition: '{{user.tier}} == "premium"',
            parameters: { userId: '$user.id' }
          }
        ]
      };

      // Act: Execute with premium user
      const premiumContext = assembler.assemble(recipe, { userId: 1 });

      // Assert: Premium orders fetched for premium user
      expect(premiumContext.user.tier).toBe('premium');
      expect(premiumContext.premiumOrders).toBeDefined();
      expect(premiumContext.premiumOrders).toHaveLength(3);

      // Act: Execute with standard user
      const standardContext = assembler.assemble(recipe, { userId: 2 });

      // Assert: Premium orders skipped for standard user
      expect(standardContext.user.tier).toBe('standard');
      expect(standardContext.premiumOrders).toBeUndefined();
    });

    test('Complex expression conditions', () => {
      // Arrange: Recipe with complex conditions
      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'orders',
            type: 'OrderDataProvider',
            parameters: { userId: '$user.id' }
          },
          {
            name: 'analytics',
            type: 'OrderAnalyticsProvider',
            condition: '{{user.tier}} == "premium" && len({{orders}}) > 0',
            parameters: { orders: '$orders' }
          }
        ]
      };

      // Act: Premium user with orders
      const context = assembler.assemble(recipe, { userId: 1 });

      // Assert: Analytics computed for premium user with orders
      expect(context.analytics).toBeDefined();
      expect(context.analytics.totalOrders).toBe(3);

      // Act: Free user (no orders)
      const freeContext = assembler.assemble(recipe, { userId: 3 });

      // Assert: Analytics skipped for free user
      expect(freeContext.analytics).toBeUndefined();
    });

    test('Null-checking conditions', () => {
      // Arrange: Recipe with null checking
      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'organization',
            type: 'OrganizationDataProvider',
            condition: '{{user.organizationId}} != null',
            parameters: { orgId: '$user.organizationId' }
          }
        ]
      };

      // Act: User with organization
      const withOrgContext = assembler.assemble(recipe, { userId: 1 });
      expect(withOrgContext.organization).toBeDefined();

      // Act: User without organization (userId 3 has organizationId: null)
      const noOrgContext = assembler.assemble(recipe, { userId: 3 });
      // When condition is false, provider is not executed - context may have undefined or null
      expect(noOrgContext.organization == null).toBe(true);
    });
  });

  describe('Database Provider Integration', () => {
    test('DatabaseDataProvider fetches from SheetDBLib', () => {
      // Arrange: Recipe using database provider
      const recipe = {
        providers: [
          {
            name: 'products',
            type: 'DatabaseDataProvider',
            parameters: { tableName: 'Products' }
          }
        ]
      };

      // Act
      const context = assembler.assemble(recipe, {});

      // Assert: Products fetched from database
      expect(context.products).toBeDefined();
      expect(context.products).toHaveLength(2);
      expect(context.products[0].name).toBe('Widget A');
      expect(mockDatabase.tables.Products.getAllRows).toHaveBeenCalled();
    });

    test('DatabaseDataProvider fetches single record by ID', () => {
      // Arrange: Recipe to fetch single product
      const recipe = {
        providers: [
          {
            name: 'product',
            type: 'DatabaseDataProvider',
            parameters: { tableName: 'Products', id: '@productId' }
          }
        ]
      };

      // Act
      const context = assembler.assemble(recipe, { productId: 'prod-1' });

      // Assert: Single product fetched
      expect(context.product).toBeDefined();
      expect(context.product.name).toBe('Widget A');
      expect(mockDatabase.tables.Products.getByPK).toHaveBeenCalledWith('prod-1');
    });

    test('Combined user data and database queries', () => {
      // Arrange: Complex recipe combining user data and database
      const recipe = {
        providers: [
          {
            name: 'customer',
            type: 'DatabaseDataProvider',
            parameters: { tableName: 'Customers', id: '@customerId' }
          },
          {
            name: 'products',
            type: 'DatabaseDataProvider',
            parameters: { tableName: 'Products' }
          }
        ]
      };

      // Act
      const context = assembler.assemble(recipe, { customerId: 'cust-1' });

      // Assert: Both queries executed
      expect(context.customer.name).toBe('John Doe');
      expect(context.products).toHaveLength(2);
    });
  });

  describe('Resilience Integration', () => {
    test('ExceptionService retries failed providers', () => {
      let attempts = 0;

      // Arrange: Provider that fails twice then succeeds
      class FlakeyProvider extends DataProvider {
        _fetchData(parameters) {
          attempts++;
          if (attempts < 3) {
            const error = new Error('Service unavailable');
            error.code = 503;
            throw error;
          }
          return { data: 'success', attempts: attempts };
        }
      }

      registry.registerFactory('FlakeyProvider', () => new FlakeyProvider(mockLogger));

      const recipe = {
        providers: [
          {
            name: 'flakeyData',
            type: 'FlakeyProvider',
            parameters: {}
          }
        ]
      };

      // Act: Assemble with retry
      const assemblerWithRetry = new ContextAssembler(
        mockLogger,
        registry,
        expressionEngine,
        exceptionService,
        null,
        {
          maxRetries: 5
        }
      );
      const context = assemblerWithRetry.assemble(recipe, {});

      // Assert: Provider eventually succeeded
      expect(context.flakeyData).toBeDefined();
      expect(context.flakeyData.data).toBe('success');
      expect(attempts).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Provider Registry Patterns', () => {
    test('Singleton providers share state', () => {
      let invocationCount = 0;

      class CountingProvider extends DataProvider {
        _fetchData(parameters) {
          invocationCount++;
          return { count: invocationCount };
        }
      }

      registry.registerSingleton('CountingProvider', new CountingProvider(mockLogger));

      const recipe = {
        providers: [{ name: 'count', type: 'CountingProvider', parameters: {} }]
      };

      // Act: Execute twice
      const context1 = assembler.assemble(recipe, {});
      const context2 = assembler.assemble(recipe, {});

      // Assert: Same instance used, count increments
      expect(context1.count.count).toBe(1);
      expect(context2.count.count).toBe(2);
      expect(invocationCount).toBe(2);
    });

    test('Factory providers create fresh instances', () => {
      class StatefulProvider extends DataProvider {
        constructor(logger) {
          super(logger);
          this.internalState = 0;
        }

        _fetchData(parameters) {
          this.internalState++;
          return { state: this.internalState };
        }
      }

      registry.registerFactory('StatefulProvider', () => new StatefulProvider(mockLogger));

      const recipe = {
        providers: [{ name: 'state', type: 'StatefulProvider', parameters: {} }]
      };

      // Act: Execute twice
      const context1 = assembler.assemble(recipe, {});
      const context2 = assembler.assemble(recipe, {});

      // Assert: Fresh instance each time, state always 1
      expect(context1.state.state).toBe(1);
      expect(context2.state.state).toBe(1);
    });
  });

  describe('Dependency Resolution', () => {
    test('@param references resolve from initial parameters', () => {
      // Arrange
      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'UserDataProvider',
            parameters: {
              userId: '@userId'
            }
          }
        ]
      };

      // Act
      const context = assembler.assemble(recipe, { userId: 2 });

      // Assert: @userId resolved to parameter value
      expect(context.user.id).toBe(2);
      expect(context.user.name).toBe('Bob');
    });

    test('$provider references resolve to provider outputs', () => {
      // Arrange
      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'orders',
            type: 'OrderDataProvider',
            parameters: { userId: '$user.id' }
          }
        ]
      };

      // Act
      const context = assembler.assemble(recipe, { userId: 1 });

      // Assert: $user.id resolved to user provider output
      expect(context.orders).toBeDefined();
      expect(context.orders.every((order) => order.userId === 1)).toBe(true);
    });

    test('Nested property access in $provider references', () => {
      // Arrange: Provider with nested properties
      class NestedProvider extends DataProvider {
        _fetchData(parameters) {
          return {
            level1: {
              level2: {
                value: 'nested-value'
              }
            }
          };
        }
      }

      class ConsumerProvider extends DataProvider {
        _fetchData(parameters) {
          return { receivedValue: parameters.nestedValue };
        }
      }

      registry.registerSingleton('NestedProvider', new NestedProvider(mockLogger));
      registry.registerSingleton('ConsumerProvider', new ConsumerProvider(mockLogger));

      const recipe = {
        providers: [
          {
            name: 'nested',
            type: 'NestedProvider',
            parameters: {}
          },
          {
            name: 'consumer',
            type: 'ConsumerProvider',
            parameters: { nestedValue: '$nested.level1.level2.value' }
          }
        ]
      };

      // Act
      const context = assembler.assemble(recipe, {});

      // Assert: Nested value resolved correctly
      expect(context.consumer.receivedValue).toBe('nested-value');
    });
  });

  describe('Error Handling', () => {
    test('Provider errors include context information', () => {
      // Arrange: Provider that throws
      class ErrorProvider extends DataProvider {
        _fetchData(parameters) {
          throw new Error('Test error');
        }
      }

      registry.registerSingleton('ErrorProvider', new ErrorProvider(mockLogger));

      const recipe = {
        providers: [{ name: 'errorData', type: 'ErrorProvider', parameters: {} }]
      };

      // Act & Assert: Error includes provider context
      expect(() => {
        assembler.assemble(recipe, {});
      }).toThrow();

      // Verify logger captured error
      expect(mockLogger.error).toHaveBeenCalled();
    });

    test('Missing provider throws descriptive error', () => {
      // Arrange: Recipe with unregistered provider
      const recipe = {
        providers: [{ name: 'missing', type: 'NonExistentProvider', parameters: {} }]
      };

      // Act & Assert
      expect(() => {
        assembler.assemble(recipe, {});
      }).toThrow(/NonExistentProvider/);
    });
  });

  describe('Logger Propagation', () => {
    test('Logger captures execution flow', () => {
      // Arrange
      const recipe = {
        providers: [
          { name: 'user', type: 'UserDataProvider', parameters: { userId: '@userId' } },
          { name: 'orders', type: 'OrderDataProvider', parameters: { userId: '$user.id' } }
        ]
      };

      // Act
      assembler.assemble(recipe, { userId: 1 });

      // Assert: Logger was called during execution
      const allCalls = [...mockLogger.debug.mock.calls, ...mockLogger.info.mock.calls];
      expect(allCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Summary', () => {
    test('getConfigSummary returns assembly configuration', () => {
      // Act
      const summary = assembler.getConfigSummary();

      // Assert
      expect(summary).toBeDefined();
      expect(typeof summary.maxRetries).toBe('number');
      expect(typeof summary.hasExceptionService).toBe('boolean');
    });
  });
});
