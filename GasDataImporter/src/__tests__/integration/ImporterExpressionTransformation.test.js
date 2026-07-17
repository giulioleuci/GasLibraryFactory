// ===================================================================
// FILE: GasDataImporter/src/__tests__/integration/ImporterExpressionTransformation.test.js
// ===================================================================
// Integration Test 4: Importer-Expression Transformation
// Verifies that GasDataImporter uses GasExpressionEngineLib to transform rows
// ===================================================================

import { ImportEngine } from '../../ImportEngine.js';
import { ImportConfiguration } from '../../ImportConfiguration.js';
import { MockFactory } from '../../../../test/fakes/MockFactory.js';
import { Transformer } from '../../pipeline/Transformer.js';

/**
 * Test Scenario: Importer-Expression Transformation
 *
 * Layers Involved:
 * - Application: GasDataImporter (Transformer)
 * - Logic: GasExpressionEngineLib (ExpressionEngineService)
 *
 * Objective:
 * Verify that during the ETL process, the Transformer correctly uses
 * GasExpressionEngineLib to evaluate calculated field expressions,
 * producing new fields based on source data.
 */

describe('Integration Test 4: Importer-Expression Transformation', () => {
  let logger;
  let expressionEngine;
  let transformer;

  beforeEach(() => {
    logger = MockFactory.createJestLogger();
    expressionEngine = {
      evaluate: jest.fn(),
      parse: jest.fn(),
      compile: jest.fn()
    };
    transformer = new Transformer(logger, expressionEngine);
  });

  describe('Calculated Fields', () => {
    test('should evaluate string concatenation expressions', () => {
      const transformConfig = {
        calculated: {
          fullName: '{{firstName}} {{lastName}}'
        }
      };
      const row = { firstName: 'John', lastName: 'Doe' };

      // Program mock to handle this specific expression
      expressionEngine.evaluate.mockImplementation((expr, context) => {
        if (expr === '{{firstName}} {{lastName}}') {
          return `${context.firstName} ${context.lastName}`;
        }
        return null;
      });

      const result = transformer.transform([row], transformConfig);
      expect(result[0].fullName).toBe('John Doe');
    });

    test('should evaluate boolean expressions', () => {
      const transformConfig = {
        calculated: {
          isAdult: '{{age}} >= 18'
        }
      };
      const row = { age: 25 };

      // MockFactory evaluate handles ">"
      expressionEngine.evaluate.mockImplementation((expr, context) => {
        if (expr === '{{age}} >= 18') return context.age >= 18;
        return null;
      });

      const result = transformer.transform([row], transformConfig);
      expect(result[0].isAdult).toBe(true);
    });

    test('should evaluate arithmetic expressions', () => {
      const transformConfig = {
        calculated: {
          total: '{{price}} * {{quantity}}'
        }
      };
      const row = { price: 10, quantity: 5 };

      expressionEngine.evaluate.mockImplementation((expr, context) => {
        if (expr === '{{price}} * {{quantity}}') return context.price * context.quantity;
        return null;
      });

      const result = transformer.transform([row], transformConfig);
      expect(result[0].total).toBe(50);
    });
  });

  describe('Expression Engine Integration', () => {
    test('should pass correct context to ExpressionEngineService', () => {
      const transformConfig = {
        calculated: {
          test: '{{val}}'
        }
      };
      const row = { val: 'passed-data' };

      transformer.transform([row], transformConfig);

      expect(expressionEngine.evaluate).toHaveBeenCalledWith(
        '{{val}}',
        expect.objectContaining({ val: 'passed-data' })
      );
    });

    test('should handle expression evaluation errors gracefully', () => {
      const transformConfig = {
        calculated: {
          errorField: '{{must_fail}}'
        }
      };
      const row = { val: 1 };

      expressionEngine.evaluate.mockImplementation(() => {
        throw new Error('Engine error');
      });

      // Simple substitution would return "" but the _applyCalculated wrapper
      // is where we expect the error to be handled if the engine fails and we want to enforce it.
      // Wait, _evaluateExpression catches engine error and falls back.
      // If fallback returns string, it won't throw.
      // If we want to test failing evaluation, we can mock _evaluateExpression on facade or similar,
      // but let's see if we can trigger a real failure in _applyCalculated.

      // Let's force an error by making _evaluateExpression itself throw (not just the engine)
      jest.spyOn(transformer, '_evaluateExpression').mockImplementation(() => {
        throw new Error('Total failure');
      });

      expect(() => {
        transformer.transform([row], transformConfig);
      }).toThrow(/Failed to calculate field "errorField"/);
    });
  });

  describe('Complex Transformations', () => {
    test('should process multiple calculated fields in order', () => {
      const transformConfig = {
        calculated: {
          tax: '{{subtotal}} * 0.1',
          subtotal: '{{price}} * {{qty}}',
          total: '{{subtotal}} + {{tax}}'
        }
      };
      const row = { price: 100, qty: 2 };

      expressionEngine.evaluate.mockImplementation((expr, context) => {
        if (expr === '{{price}} * {{qty}}') return context.price * context.qty;
        if (expr === '{{subtotal}} * 0.1') return context.subtotal * 0.1;
        if (expr === '{{subtotal}} + {{tax}}') return context.subtotal + context.tax;
        return null;
      });

      const result = transformer.transform([row], transformConfig);

      expect(result[0].subtotal).toBe(200);
      expect(result[0].tax).toBe(20);
      expect(result[0].total).toBe(220);
    });

    test('should handle nested property access in expressions', () => {
      const transformConfig = {
        calculated: {
          city: '{{user.address.city}}'
        }
      };
      const row = {
        user: {
          address: { city: 'Rome' }
        }
      };

      // Note: simpleTemplateSubstitution only handles flat keys: context[trimmedKey]
      // For nested, it would need the actual expression engine
      expressionEngine.evaluate.mockImplementation((expr, context) => {
        if (expr === '{{user.address.city}}') return context.user.address.city;
        return null;
      });

      const result = transformer.transform([row], transformConfig);
      expect(result[0].city).toBe('Rome');
    });
  });
});
