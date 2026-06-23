/**
 * Integration Test: ContextAssembler + GasExpressionEngineLib
 *
 * Layers Tested: ContextEngine → GasExpressionEngineLib
 *
 * Purpose: Verifies that ContextAssembler correctly integrates with
 * ExpressionEngineService for conditional provider execution.
 *
 * @file ContextEngine/src/__tests__/integration/ContextAssemblerExpression.test.js
 */

import { ContextAssembler } from '../../ContextAssembler';
import { ProviderRegistry } from '../../ProviderRegistry';
import { DataProvider } from '../../DataProvider';
import { ExpressionEngineService } from '@GasExpressionEngineLib';

describe('ContextAssembler + ExpressionEngine Integration', () => {
  let logger;
  let registry;
  let expressionEngine;
  let assembler;

  // Mock providers for testing
  class UserDataProvider extends DataProvider {
    _fetchData(parameters) {
      return {
        id: parameters.userId,
        name: 'John Doe',
        isPremium: parameters.userId > 100,
        status: 'active',
        tier: parameters.userId > 200 ? 'gold' : 'silver'
      };
    }
  }

  class PremiumDataProvider extends DataProvider {
    _fetchData(parameters) {
      return {
        features: ['analytics', 'priority-support', 'api-access'],
        discount: 20
      };
    }
  }

  class OrderDataProvider extends DataProvider {
    _fetchData(parameters) {
      return [
        { id: 1, userId: parameters.userId, total: 100 },
        { id: 2, userId: parameters.userId, total: 250 }
      ];
    }
  }

  class AnalyticsProvider extends DataProvider {
    _fetchData(parameters) {
      const orders = parameters.orders || [];
      const total = orders.reduce((sum, o) => sum + o.total, 0);
      return {
        orderCount: orders.length,
        totalSpent: total,
        avgOrderValue: orders.length > 0 ? total / orders.length : 0
      };
    }
  }

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Create real ExpressionEngineService
    expressionEngine = new ExpressionEngineService({ logger });

    // Create registry and register providers
    registry = new ProviderRegistry(logger);
    registry.registerSingleton('UserDataProvider', new UserDataProvider(logger));
    registry.registerSingleton('PremiumDataProvider', new PremiumDataProvider(logger));
    registry.registerSingleton('OrderDataProvider', new OrderDataProvider(logger));
    registry.registerSingleton('AnalyticsProvider', new AnalyticsProvider(logger));

    // Create assembler with expression engine
    assembler = new ContextAssembler(logger, registry, expressionEngine);
  });

  describe('conditional provider execution', () => {
    it('should execute provider when condition evaluates to true', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'premiumData',
            type: 'PremiumDataProvider',
            // Use {{}} syntax for provider result references
            condition: '{{userData.isPremium}} == true',
            parameters: {}
          }
        ]
      };

      // User ID > 100 makes isPremium = true
      const context = assembler.assemble(recipe, { userId: 150 });

      expect(context.userData).toBeDefined();
      expect(context.userData.isPremium).toBe(true);
      expect(context.premiumData).toBeDefined();
      expect(context.premiumData.features).toContain('analytics');
    });

    it('should skip provider when condition evaluates to false', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'premiumData',
            type: 'PremiumDataProvider',
            // Use {{}} syntax for provider result references
            condition: '{{userData.isPremium}} == true',
            parameters: {}
          }
        ]
      };

      // User ID <= 100 makes isPremium = false
      const context = assembler.assemble(recipe, { userId: 50 });

      expect(context.userData).toBeDefined();
      expect(context.userData.isPremium).toBe(false);
      expect(context.premiumData).toBeUndefined();
    });

    it('should evaluate complex conditions with logical operators', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'premiumData',
            type: 'PremiumDataProvider',
            // Use {{}} syntax for provider result references
            condition: '{{userData.isPremium}} == true && {{userData.status}} == "active"',
            parameters: {}
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 150 });

      expect(context.premiumData).toBeDefined();
    });

    it('should evaluate conditions with initialParams using {{}} syntax', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            condition: '{{userId}} > 0',
            parameters: { userId: '@userId' }
          }
        ]
      };

      // Should execute - userId > 0
      const context1 = assembler.assemble(recipe, { userId: 100 });
      expect(context1.userData).toBeDefined();
    });

    it('should evaluate string comparison conditions', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'premiumData',
            type: 'PremiumDataProvider',
            // Use {{}} syntax for provider result references
            condition: '{{userData.tier}} == "gold"',
            parameters: {}
          }
        ]
      };

      // User ID > 200 makes tier = 'gold'
      const context = assembler.assemble(recipe, { userId: 250 });

      expect(context.userData.tier).toBe('gold');
      expect(context.premiumData).toBeDefined();
    });
  });

  describe('chained provider dependencies with conditions', () => {
    it('should execute chain of providers with dependent conditions', () => {
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
            // Use {{}} syntax for provider result references
            condition: '{{user.status}} == "active"',
            parameters: { userId: '$user.id' }
          },
          {
            name: 'analytics',
            type: 'AnalyticsProvider',
            // Use {{}} syntax - check if orders exists (not null)
            condition: '{{orders}} != null',
            parameters: { orders: '$orders' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.user).toBeDefined();
      expect(context.orders).toBeDefined();
      expect(context.orders.length).toBe(2);
      expect(context.analytics).toBeDefined();
      expect(context.analytics.orderCount).toBe(2);
      expect(context.analytics.totalSpent).toBe(350);
    });

    it('should stop chain when intermediate condition fails', () => {
      // Create a provider that returns inactive status
      class InactiveUserProvider extends DataProvider {
        _fetchData(parameters) {
          return {
            id: parameters.userId,
            name: 'Inactive User',
            status: 'inactive'
          };
        }
      }

      registry.registerSingleton('InactiveUserProvider', new InactiveUserProvider(logger));

      const recipe = {
        providers: [
          {
            name: 'user',
            type: 'InactiveUserProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'orders',
            type: 'OrderDataProvider',
            // Use {{}} syntax for provider result references
            condition: '{{user.status}} == "active"',
            parameters: { userId: '$user.id' }
          }
          // Note: Analytics provider removed because it cannot reference skipped providers
          // The pattern demonstrates that downstream providers should check their dependencies
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.user).toBeDefined();
      expect(context.user.status).toBe('inactive');
      expect(context.orders).toBeUndefined(); // Skipped - status != active
    });
  });

  describe('expression evaluation edge cases', () => {
    it('should handle boolean flag conditions', () => {
      class FlagDataProvider extends DataProvider {
        _fetchData(parameters) {
          return {
            hasValue: parameters.includeValue === true,
            value: parameters.includeValue ? 'some-value' : null
          };
        }
      }

      registry.registerSingleton('FlagDataProvider', new FlagDataProvider(logger));

      const recipe = {
        providers: [
          {
            name: 'flagData',
            type: 'FlagDataProvider',
            parameters: { includeValue: '@includeValue' }
          },
          {
            name: 'dependentData',
            type: 'UserDataProvider',
            // Use boolean flag for reliable conditional execution
            condition: '{{flagData.hasValue}} == true',
            parameters: { userId: 1 }
          }
        ]
      };

      // With value flag true
      const context1 = assembler.assemble(recipe, { includeValue: true });
      expect(context1.flagData.hasValue).toBe(true);
      expect(context1.dependentData).toBeDefined();

      // With value flag false
      const context2 = assembler.assemble(recipe, { includeValue: false });
      expect(context2.flagData.hasValue).toBe(false);
      expect(context2.dependentData).toBeUndefined();
    });

    it('should handle numeric comparisons in conditions', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'premiumData',
            type: 'PremiumDataProvider',
            // Use {{}} syntax for provider result references
            condition: '{{userData.id}} >= 100',
            parameters: {}
          }
        ]
      };

      // userId >= 100
      const context1 = assembler.assemble(recipe, { userId: 100 });
      expect(context1.premiumData).toBeDefined();

      // userId < 100
      const context2 = assembler.assemble(recipe, { userId: 99 });
      expect(context2.premiumData).toBeUndefined();
    });

    it('should handle boolean expressions with negation', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'nonPremiumData',
            type: 'OrderDataProvider',
            // Use {{}} syntax with negation
            condition: '!({{userData.isPremium}} == true)',
            parameters: { userId: '$userData.id' }
          }
        ]
      };

      // Non-premium user (userId <= 100)
      const context1 = assembler.assemble(recipe, { userId: 50 });
      expect(context1.nonPremiumData).toBeDefined();

      // Premium user (userId > 100)
      const context2 = assembler.assemble(recipe, { userId: 150 });
      expect(context2.nonPremiumData).toBeUndefined();
    });
  });

  describe('error handling in condition evaluation', () => {
    it('should throw error for invalid expression syntax', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            // Triple equals (===) is not supported by the expression engine
            condition: '{{userData.status}} === "active"',
            parameters: { userId: '@userId' }
          }
        ]
      };

      // Expression engine throws for unsupported === syntax
      expect(() => {
        assembler.assemble(recipe, { userId: 123 });
      }).toThrow();
    });

    it('should handle missing provider reference in condition gracefully', () => {
      const recipe = {
        providers: [
          {
            name: 'premiumData',
            type: 'PremiumDataProvider',
            // Reference to non-existent provider - will evaluate to undefined
            condition: '{{nonExistentProvider.value}} == true',
            parameters: {}
          }
        ]
      };

      // When the reference doesn't exist, the expression evaluates to false
      // and the provider is skipped (not an error condition)
      const context = assembler.assemble(recipe, {});
      expect(context.premiumData).toBeUndefined(); // Skipped due to condition evaluating to false
    });
  });

  describe('provider result usage in expressions', () => {
    it('should access nested properties in conditions', () => {
      class NestedDataProvider extends DataProvider {
        _fetchData() {
          return {
            user: {
              profile: {
                settings: {
                  notifications: true
                }
              }
            }
          };
        }
      }

      registry.registerSingleton('NestedDataProvider', new NestedDataProvider(logger));

      const recipe = {
        providers: [
          {
            name: 'nestedData',
            type: 'NestedDataProvider',
            parameters: {}
          },
          {
            name: 'notificationData',
            type: 'OrderDataProvider',
            // Use {{}} syntax for deeply nested property access
            condition: '{{nestedData.user.profile.settings.notifications}} == true',
            parameters: { userId: 1 }
          }
        ]
      };

      const context = assembler.assemble(recipe, {});

      expect(context.nestedData).toBeDefined();
      expect(context.notificationData).toBeDefined();
    });

    it('should check array existence in conditions', () => {
      const recipe = {
        providers: [
          {
            name: 'orders',
            type: 'OrderDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'analytics',
            type: 'AnalyticsProvider',
            // Check that orders array exists (is not null/undefined)
            // Note: len() function may not be supported, use != null instead
            condition: '{{orders}} != null',
            parameters: { orders: '$orders' }
          }
        ]
      };

      const context = assembler.assemble(recipe, { userId: 123 });

      expect(context.orders.length).toBe(2);
      expect(context.analytics).toBeDefined();
    });
  });

  describe('without expression engine', () => {
    it('should execute all providers when no expression engine is provided', () => {
      const assemblerNoExpr = new ContextAssembler(logger, registry);

      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: { userId: '@userId' }
          },
          {
            name: 'premiumData',
            type: 'PremiumDataProvider',
            // Using {{}} syntax, but will be ignored without expression engine
            condition: '{{userData.isPremium}} == true',
            parameters: {}
          }
        ]
      };

      // Even though isPremium is false, the provider should execute
      // because there's no expression engine to evaluate the condition
      const context = assemblerNoExpr.assemble(recipe, { userId: 50 });

      expect(context.userData).toBeDefined();
      expect(context.userData.isPremium).toBe(false);
      expect(context.premiumData).toBeDefined(); // Executed despite condition
      expect(logger.warn).toHaveBeenCalled(); // Should warn about missing expression engine
    });
  });
});
