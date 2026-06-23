// ===================================================================
// FILE: ContextEngine/src/__tests__/ContextAssembler.test.js
// ===================================================================
// Comprehensive test suite for ContextAssembler
// Coverage: All methods and features
// ===================================================================

import { ContextAssembler } from '../ContextAssembler';
import { ProviderRegistry } from '../ProviderRegistry';
import { DataProvider } from '../DataProvider';
import { ContextEngineError } from '../internal/errors/ContextEngineError';
import { MockFactory } from '../../../test/fakes';

// Create test providers
class UserDataProvider extends DataProvider {
  _fetchData(parameters) {
    return {
      id: parameters.userId,
      name: `User ${parameters.userId}`,
      email: `user${parameters.userId}@example.com`,
      isActive: true
    };
  }
}

class OrderDataProvider extends DataProvider {
  _fetchData(parameters) {
    return [
      { id: 1, userId: parameters.userId, total: 50, status: 'completed' },
      { id: 2, userId: parameters.userId, total: 75, status: 'pending' }
    ];
  }
}

describe('ContextAssembler - Comprehensive Test Suite', () => {
  let mocks;
  let mockRegistry;
  let mockExpressionEngine;
  let assembler;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();

    mockRegistry = new ProviderRegistry(mocks.logger);

    mockExpressionEngine = {
      evaluate: jest.fn((expr, context) => {
        // Simple mock evaluation
        if (expr.includes('isActive == true')) {
          return context.userData?.isActive === true;
        }
        return true;
      })
    };

    // Register standardized providers
    const userProvider = MockFactory.createJestDataProvider('UserDataProvider');
    userProvider.provide.mockImplementation((name, parameters) => ({
      id: parameters.userId,
      name: `User ${parameters.userId}`,
      email: `user${parameters.userId}@example.com`,
      isActive: true
    }));

    const orderProvider = MockFactory.createJestDataProvider('OrderDataProvider');
    orderProvider.provide.mockImplementation((name, parameters) => ([
      { id: 1, userId: parameters.userId, total: 50, status: 'completed' },
      { id: 2, userId: parameters.userId, total: 75, status: 'pending' }
    ]));

    mockRegistry.registerSingleton('UserDataProvider', userProvider);
    mockRegistry.registerSingleton('OrderDataProvider', orderProvider);

    assembler = new ContextAssembler(
      mocks.logger,
      mockRegistry,
      mockExpressionEngine,
      mocks.exceptionService,
      null, // interceptorRegistry - not used in these tests
      { maxRetries: 3 }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create instance with required parameters', () => {
      const assembler = new ContextAssembler(mocks.logger, mockRegistry);

      expect(assembler).toBeDefined();
      expect(assembler.logger).toBe(mocks.logger);
      expect(assembler.providerRegistry).toBe(mockRegistry);
    });

    it('should create instance with optional services', () => {
      const assembler = new ContextAssembler(
        mocks.logger,
        mockRegistry,
        mockExpressionEngine,
        mocks.exceptionService
      );

      const config = assembler.getConfigSummary();
      expect(config.hasExpressionEngine).toBe(true);
      expect(config.hasExceptionService).toBe(true);
    });

    it('should create instance with custom options', () => {
      const assembler = new ContextAssembler(
        mocks.logger,
        mockRegistry,
        null,
        null,
        null, // interceptorRegistry
        { maxRetries: 5 }
      );

      const config = assembler.getConfigSummary();
      expect(config.maxRetries).toBe(5);
    });

    it('should throw error if logger is invalid', () => {
      expect(() => new ContextAssembler(null, mockRegistry)).toThrow(
        'logger is required and cannot be null or undefined'
      );
    });

    it('should throw error if providerRegistry is invalid', () => {
      expect(() => new ContextAssembler(mocks.logger, null)).toThrow(
        'providerRegistry is required and cannot be null or undefined'
      );
    });

    it('should throw error if providerRegistry is missing get method', () => {
      const invalidRegistry = {};
      expect(() => new ContextAssembler(mocks.logger, invalidRegistry)).toThrow(
        'providerRegistry must have method: get'
      );
    });

    it('should throw error if expressionEngine is invalid', () => {
      expect(() => new ContextAssembler(mocks.logger, mockRegistry, 'invalid')).toThrow(
        'expressionEngine must be of type object'
      );
    });

    it('should throw error if exceptionService is invalid', () => {
      expect(() => new ContextAssembler(mocks.logger, mockRegistry, null, 'invalid')).toThrow(
        'exceptionService must be of type object'
      );
    });

    it('should throw error if interceptorRegistry is invalid', () => {
      expect(() => new ContextAssembler(mocks.logger, mockRegistry, null, null, 'invalid')).toThrow(
        'interceptorRegistry must be of type object'
      );
    });

    it('should throw error if options is invalid', () => {
      expect(
        () => new ContextAssembler(mocks.logger, mockRegistry, null, null, null, 'invalid')
      ).toThrow('options must be of type object');
    });
  });

  // ===================================================================
  // GETTER METHODS
  // ===================================================================

  describe('Getter Methods', () => {
    it('should return logger instance', () => {
      expect(assembler.logger).toBe(mocks.logger);
    });

    it('should return provider registry', () => {
      expect(assembler.providerRegistry).toBe(mockRegistry);
    });

    it('should return dependency resolver', () => {
      expect(assembler.dependencyResolver).toBeDefined();
    });

    it('should return recipe parser', () => {
      expect(assembler.recipeParser).toBeDefined();
    });

    it('should return post processor', () => {
      expect(assembler.postProcessor).toBeDefined();
    });
  });

  // ===================================================================
  // SIMPLE CONTEXT ASSEMBLY
  // ===================================================================

  describe('Simple Context Assembly', () => {
    it('should assemble context with single provider', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.userData).toBeDefined();
      expect(context.userData.id).toBe(123);
      expect(context.userData.name).toBe('User 123');
    });

    it('should assemble context with multiple providers', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'userOrders',
            type: 'OrderDataProvider',
            parameters: { userId: '@userId' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.userData).toBeDefined();
      expect(context.userOrders).toBeDefined();
      expect(context.userOrders).toHaveLength(2);
    });

    it('should throw error if recipe is invalid', () => {
      expect(() => assembler.assemble(null, {})).toThrow(
        'ContextAssembler.assemble: recipe is required and must be an object'
      );
    });

    it('should throw error if initialParams is invalid', () => {
      const recipe = { providers: [] };
      expect(() => assembler.assemble(recipe, 'invalid')).toThrow(
        'ContextAssembler.assemble: initialParams must be an object or null'
      );
    });
  });

  // ===================================================================
  // DEPENDENCY RESOLUTION
  // ===================================================================

  describe('Dependency Resolution', () => {
    it('should resolve @param dependencies', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 456 });

      expect(context.userData.id).toBe(456);
    });

    it('should resolve $provider dependencies', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'userOrders',
            type: 'OrderDataProvider',
            parameters: { userId: '$userData.id' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.userData.id).toBe(123);
      expect(context.userOrders[0].userId).toBe(123);
    });

    it('should resolve chained dependencies', () => {
      // Add a third provider that depends on the second
      class SummaryProvider extends DataProvider {
        _fetchData(parameters) {
          return {
            userId: parameters.userId,
            userName: parameters.userName,
            orderCount: parameters.orders.length
          };
        }
      }

      mockRegistry.registerSingleton('SummaryProvider', new SummaryProvider(mocks.logger));

      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'userOrders',
            type: 'OrderDataProvider',
            parameters: { userId: '$userData.id' }
          },
          {
            name: 'summary',
            type: 'SummaryProvider',
            parameters: {
              userId: '$userData.id',
              userName: '$userData.name',
              orders: '$userOrders'
            }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.summary.userId).toBe(123);
      expect(context.summary.userName).toBe('User 123');
      expect(context.summary.orderCount).toBe(2);
    });
  });

  // ===================================================================
  // CONDITIONAL EXECUTION
  // ===================================================================

  describe('Conditional Execution', () => {
    it('should execute provider when condition is true', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'userOrders',
            type: 'OrderDataProvider',
            condition: '$userData.isActive == true',
            parameters: { userId: '$userData.id' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.userData).toBeDefined();
      expect(context.userOrders).toBeDefined();
      expect(mockExpressionEngine.evaluate).toHaveBeenCalled();
    });

    it('should skip provider when condition is false', () => {
      mockExpressionEngine.evaluate.mockReturnValue(false);

      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'userOrders',
            type: 'OrderDataProvider',
            condition: '$userData.isActive == true',
            parameters: { userId: '$userData.id' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.userData).toBeDefined();
      expect(context.userOrders).toBeUndefined();
    });

    it('should default to true when no expression engine provided', () => {
      assembler = new ContextAssembler(mocks.logger, mockRegistry);

      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            condition: '$userData.isActive == true',
            parameters: { userId: '@userId' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.userData).toBeDefined();
      expect(mocks.logger.warn).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // POST-PROCESSING
  // ===================================================================

  describe('Post-Processing', () => {
    it('should apply post-processors to provider results', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' },
            postProcess: [
              {
                type: 'filterFields',
                fields: ['id', 'name']
              }
            ]
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.userData.id).toBeDefined();
      expect(context.userData.name).toBeDefined();
      expect(context.userData.email).toBeUndefined();
      expect(context.userData.isActive).toBeUndefined();
    });

    it('should apply multiple post-processors in sequence', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' },
            postProcess: [
              {
                type: 'filterFields',
                fields: ['id', 'name', 'email']
              },
              {
                type: 'renameFields',
                mapping: { name: 'userName' }
              }
            ]
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.userData.id).toBeDefined();
      expect(context.userData.userName).toBe('User 123');
      expect(context.userData.name).toBeUndefined();
    });
  });

  // ===================================================================
  // ERROR HANDLING
  // ===================================================================

  describe('Error Handling', () => {
    it('should wrap provider errors in ContextEngineError', () => {
      class FailingProvider extends DataProvider {
        _fetchData() {
          throw new Error('Provider failed');
        }
      }

      mockRegistry.registerSingleton('FailingProvider', new FailingProvider(mocks.logger));

      const recipe = {
        providers: [
          {
            name: 'failingData',
            type: 'FailingProvider',
            parameters: {}
          }
        ]
      };

      expect(() => assembler.assemble(recipe, {})).toThrow(ContextEngineError);
    });

    it('should include provider information in error', () => {
      class FailingProvider extends DataProvider {
        _fetchData() {
          throw new Error('Provider failed');
        }
      }

      mockRegistry.registerSingleton('FailingProvider', new FailingProvider(mocks.logger));

      const recipe = {
        providers: [
          {
            name: 'failingData',
            type: 'FailingProvider',
            parameters: {}
          }
        ]
      };

      try {
        assembler.assemble(recipe, {});
      } catch (error) {
        expect(error).toBeInstanceOf(ContextEngineError);
        expect(error.context.providerName).toBe('failingData');
        expect(error.context.providerType).toBe('FailingProvider');
      }
    });

    it('should use exception service for retry when provided', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          }
        ]
      };

      assembler.assemble(recipe, { userId: 123 });

      expect(mocks.exceptionService.executeWithRetry).toHaveBeenCalled();
    });
  });

  // ===================================================================
  // RECIPE VALIDATION
  // ===================================================================

  describe('Recipe Validation', () => {
    it('should validate valid recipe', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          }
        ]
      };

      const validation = assembler.validateRecipe(recipe);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid recipe', () => {
      const recipe = {
        providers: [
          {
            // Missing name
            type: 'UserDataProvider',
            parameters: {}
          }
        ]
      };

      const validation = assembler.validateRecipe(recipe);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // DEPENDENCY ANALYSIS
  // ===================================================================

  describe('Dependency Analysis', () => {
    it('should analyze recipe dependencies', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'userOrders',
            type: 'OrderDataProvider',
            condition: '$userData.isActive == true',
            parameters: { userId: '$userData.id' }
          }
        ]
      };

      const analysis = assembler.analyzeRecipeDependencies(recipe);

      expect(analysis.userData).toBeDefined();
      expect(analysis.userData.type).toBe('UserDataProvider');
      expect(analysis.userData.dependencies.paramDependencies).toContain('userId');

      expect(analysis.userOrders).toBeDefined();
      expect(analysis.userOrders.type).toBe('OrderDataProvider');
      expect(analysis.userOrders.hasCondition).toBe(true);
      expect(analysis.userOrders.dependencies.providerDependencies).toContain('userData');
    });
  });

  // ===================================================================
  // CONFIGURATION SUMMARY
  // ===================================================================

  describe('Configuration Summary', () => {
    it('should return correct config summary', () => {
      const config = assembler.getConfigSummary();

      expect(config.hasExpressionEngine).toBe(true);
      expect(config.hasExceptionService).toBe(true);
      expect(config.maxRetries).toBe(3);
      expect(config.registeredProviders).toContain('UserDataProvider');
      expect(config.registeredProviders).toContain('OrderDataProvider');
    });
  });

  // ===================================================================
  // ASSEMBLE ASYNC
  // ===================================================================

  describe('assembleAsync', () => {
    it('should call assemble (placeholder for future async support)', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          }
        ]
      };

      const context = assembler.assembleAsync(recipe, { userId: 123 });

      expect(context.userData).toBeDefined();
      expect(context.userData.id).toBe(123);
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    it('should handle complex real-world scenario', () => {
      // Create additional providers
      class OrganizationProvider extends DataProvider {
        _fetchData(parameters) {
          return {
            id: parameters.orgId,
            name: `Organization ${parameters.orgId}`,
            country: 'USA'
          };
        }
      }

      class PermissionsProvider extends DataProvider {
        _fetchData(parameters) {
          return {
            canRead: true,
            canWrite: parameters.isActive,
            canDelete: false
          };
        }
      }

      mockRegistry.registerSingleton('OrganizationProvider', new OrganizationProvider(mocks.logger));
      mockRegistry.registerSingleton('PermissionsProvider', new PermissionsProvider(mocks.logger));

      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' },
            postProcess: [{ type: 'filterFields', fields: ['id', 'name', 'isActive'] }]
          },
          {
            name: 'userOrders',
            type: 'OrderDataProvider',
            condition: '$userData.isActive == true',
            parameters: { userId: '$userData.id' }
          },
          {
            name: 'organization',
            type: 'OrganizationProvider',
            parameters: { orgId: '@orgId' }
          },
          {
            name: 'permissions',
            type: 'PermissionsProvider',
            condition: '$userData.isActive == true',
            parameters: { isActive: '$userData.isActive' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123, orgId: 456 });

      expect(context.userData).toBeDefined();
      expect(context.userData.id).toBe(123);
      expect(context.userData.email).toBeUndefined(); // Filtered out

      expect(context.userOrders).toBeDefined();
      expect(context.userOrders).toHaveLength(2);

      expect(context.organization).toBeDefined();
      expect(context.organization.id).toBe(456);

      expect(context.permissions).toBeDefined();
      expect(context.permissions.canWrite).toBe(true);
    });

    it('should reject empty recipe', () => {
      const recipe = { providers: [] };

      expect(() => assembler.assemble(recipe, { userId: 123 })).toThrow();
    });

    it('should log assembly progress', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          }
        ]
      };

      assembler.assemble(recipe, { userId: 123 });

      expect(mocks.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Starting context assembly')
      );
      expect(mocks.logger.info).toHaveBeenCalledWith(expect.stringContaining('completed'));
    });
  });
});
