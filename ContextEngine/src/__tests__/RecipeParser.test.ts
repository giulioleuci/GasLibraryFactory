import { jest } from '@jest/globals';
// ===================================================================
// FILE: ContextEngine/src/__tests__/RecipeParser.test.js
// ===================================================================
// Test Suite for RecipeParser
//
// Pattern: Logic Library Testing
// - Unit testing with FakeLogger injection
// - Tests recipe validation logic
// - Tests error detection and reporting
// ===================================================================

import { RecipeParser } from '../internal/RecipeParser.js';
import { RecipeValidationError } from '../internal/errors/RecipeValidationError.js';
import { MockFactory } from '../../../test/fakes/MockFactory.js';

describe('RecipeParser', () => {
  let logger: ReturnType<typeof MockFactory.createJestLogger>;
  let parser: RecipeParser;

  beforeEach(() => {
    logger = MockFactory.createJestLogger();
    parser = new RecipeParser(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR VALIDATION TESTS
  // ===================================================================

  describe('Constructor', () => {
    it('should create an instance with valid logger', () => {
      expect(parser).toBeInstanceOf(RecipeParser);
      expect(parser.logger).toBe(logger);
    });

    it('should throw error if logger is not provided', () => {
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => new RecipeParser()).toThrow(
        'RecipeParser: logger is required and must be an object'
      );
    });

    it('should throw error if logger is not an object', () => {
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => new RecipeParser('not an object')).toThrow(
        'RecipeParser: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing debug method', () => {
      const badLogger = { info: () => {}, warn: () => {}, error: () => {} };
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => new RecipeParser(badLogger)).toThrow(
        'RecipeParser: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if logger is missing info method', () => {
      const badLogger = { debug: () => {}, warn: () => {}, error: () => {} };
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => new RecipeParser(badLogger)).toThrow(
        'RecipeParser: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if logger is missing warn method', () => {
      const badLogger = { debug: () => {}, info: () => {}, error: () => {} };
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => new RecipeParser(badLogger)).toThrow(
        'RecipeParser: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if logger is missing error method', () => {
      const badLogger = { debug: () => {}, info: () => {}, warn: () => {} };
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => new RecipeParser(badLogger)).toThrow(
        'RecipeParser: logger must have debug, info, warn, and error methods'
      );
    });
  });

  // ===================================================================
  // PARSE METHOD - VALID RECIPES
  // ===================================================================

  describe('parse() Method - Valid Recipes', () => {
    it('should parse a valid minimal recipe', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider'
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result).toEqual({
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: {},
            condition: null,
            postProcess: []
          }
        ]
      });
      expect(result.providers).toHaveLength(1);
      expect(result.providers[0].name).toBe('userData');
      expect(result.providers[0].type).toBe('UserDataProvider');
      expect(result.providers[0].parameters).toEqual({});
      expect(result.providers[0].condition).toBe(null);
      expect(result.providers[0].postProcess).toEqual([]);
    });

    it('should parse recipe with parameters', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: {
              userId: '@userId',
              includeDetails: true
            }
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers[0].parameters).toEqual({
        userId: '@userId',
        includeDetails: true
      });
    });

    it('should parse recipe with condition', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            condition: '{{isActive}} == true'
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers[0].condition).toBe('{{isActive}} == true');
    });

    it('should parse recipe with postProcess', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            postProcess: [
              { type: 'filterFields', fields: ['name', 'email'] },
              { type: 'defaultValues', defaults: { status: 'active' } }
            ]
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers[0].postProcess).toHaveLength(2);
      expect(result.providers[0].postProcess[0].type).toBe('filterFields');
      expect(result.providers[0].postProcess[1].type).toBe('defaultValues');
    });

    it('should parse recipe with multiple providers', () => {
      const recipe = {
        providers: [
          { name: 'userData', type: 'UserDataProvider' },
          { name: 'orderData', type: 'OrderDataProvider' },
          { name: 'addressData', type: 'AddressDataProvider' }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers).toHaveLength(3);
      expect(result.providers[0].name).toBe('userData');
      expect(result.providers[1].name).toBe('orderData');
      expect(result.providers[2].name).toBe('addressData');
    });

    it('should normalize recipe by adding defaults', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider'
            // No parameters, condition, or postProcess
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers[0]).toHaveProperty('parameters');
      expect(result.providers[0]).toHaveProperty('condition');
      expect(result.providers[0]).toHaveProperty('postProcess');
      expect(result.providers[0].parameters).toEqual({});
      expect(result.providers[0].condition).toBe(null);
      expect(result.providers[0].postProcess).toEqual([]);
    });

    it('should log success message', () => {
      const recipe = {
        providers: [{ name: 'userData', type: 'UserDataProvider' }]
      };

      parser.parse(recipe);

      expect(logger.getLogsByLevel('DEBUG')).toEqual([
        {
          level: 'DEBUG',
          message: 'Recipe validated successfully with 1 provider(s)',
          context: null
        }
      ]);
    });
  });

  // ===================================================================
  // PARSE METHOD - INVALID RECIPES
  // ===================================================================

  describe('parse() Method - Invalid Recipes', () => {
    it('should throw error if recipe is not an object', () => {
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => parser.parse(null)).toThrow(RecipeValidationError);
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => parser.parse(undefined)).toThrow(RecipeValidationError);
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => parser.parse('not an object')).toThrow(RecipeValidationError);
      // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
      expect(() => parser.parse(123)).toThrow(RecipeValidationError);
    });

    it('should throw error if recipe has no providers', () => {
      try {
        // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
        parser.parse({});
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes('must have a "providers" array')
          )
        ).toBe(true);
      }
    });

    it('should throw error if providers is not an array', () => {
      try {
        // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
        parser.parse({ providers: 'not an array' });
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes('"providers" must be an array')
          )
        ).toBe(true);
      }
    });

    it('should throw error if providers array is empty', () => {
      try {
        parser.parse({ providers: [] });
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes('must contain at least one provider')
          )
        ).toBe(true);
      }
    });

    it('should throw error if provider is not an object', () => {
      expect(() =>
        parser.parse({
          // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
          providers: ['not an object']
        })
      ).toThrow(RecipeValidationError);
    });

    it('should throw error if provider has no name', () => {
      try {
        parser.parse({
          // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
          providers: [{ type: 'UserDataProvider' }]
        });
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes("'name' is required and must be a string")
          )
        ).toBe(true);
      }
    });

    it('should throw error if provider name is not a string', () => {
      expect(() =>
        parser.parse({
          // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
          providers: [{ name: 123, type: 'UserDataProvider' }]
        })
      ).toThrow(RecipeValidationError);
    });

    it('should throw error if provider has no type', () => {
      try {
        parser.parse({
          // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
          providers: [{ name: 'userData' }]
        });
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes("'type' is required and must be a string")
          )
        ).toBe(true);
      }
    });

    it('should throw error if provider type is not a string', () => {
      expect(() =>
        parser.parse({
          // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
          providers: [{ name: 'userData', type: 123 }]
        })
      ).toThrow(RecipeValidationError);
    });

    it('should throw error if parameters is not an object', () => {
      try {
        parser.parse({
          providers: [
            {
              name: 'userData',
              type: 'UserDataProvider',
              // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
              parameters: 'not an object'
            }
          ]
        });
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes("'parameters' must be an object if provided")
          )
        ).toBe(true);
      }
    });

    it('should throw error if parameters is null', () => {
      expect(() =>
        parser.parse({
          providers: [
            {
              name: 'userData',
              type: 'UserDataProvider',
              // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
              parameters: null
            }
          ]
        })
      ).toThrow(RecipeValidationError);
    });

    it('should throw error if condition is not a string', () => {
      try {
        parser.parse({
          providers: [
            {
              name: 'userData',
              type: 'UserDataProvider',
              // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
              condition: 123
            }
          ]
        });
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes("'condition' must be a string if provided")
          )
        ).toBe(true);
      }
    });

    it('should throw error if postProcess is not an array', () => {
      try {
        parser.parse({
          providers: [
            {
              name: 'userData',
              type: 'UserDataProvider',
              // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
              postProcess: 'not an array'
            }
          ]
        });
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes("'postProcess' must be an array if provided")
          )
        ).toBe(true);
      }
    });

    it('should throw error if postProcess item is not an object', () => {
      expect(() =>
        parser.parse({
          providers: [
            {
              name: 'userData',
              type: 'UserDataProvider',
              // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
              postProcess: ['not an object']
            }
          ]
        })
      ).toThrow(RecipeValidationError);
    });

    it('should throw error if postProcess item has no type', () => {
      expect(() =>
        parser.parse({
          providers: [
            {
              name: 'userData',
              type: 'UserDataProvider',
              // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
              postProcess: [{}]
            }
          ]
        })
      ).toThrow(RecipeValidationError);
    });

    it('should throw error if postProcess item type is not a string', () => {
      expect(() =>
        parser.parse({
          providers: [
            {
              name: 'userData',
              type: 'UserDataProvider',
              // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
              postProcess: [{ type: 123 }]
            }
          ]
        })
      ).toThrow(RecipeValidationError);
    });

    it('should throw error for duplicate provider names', () => {
      try {
        parser.parse({
          providers: [
            { name: 'userData', type: 'Provider1' },
            { name: 'userData', type: 'Provider2' }
          ]
        });
        fail('Should have thrown RecipeValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect(
          (error as RecipeValidationError).validationErrors.some((e) =>
            e.includes('Duplicate provider names found: userData')
          )
        ).toBe(true);
      }
    });

    it('should throw RecipeValidationError with details', () => {
      try {
        parser.parse({
          providers: [
            // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
            { type: 'UserDataProvider' } // Missing name
          ]
        });
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(RecipeValidationError);
        expect((error as RecipeValidationError).validationErrors).toEqual([
          "Provider at index 0: 'name' is required and must be a string"
        ]);
      }
    });

    it('should log error message when validation fails', () => {
      try {
        parser.parse({ providers: [] });
      } catch (_error) {
        // Expected error
      }

      expect(logger.getLogsByLevel('ERROR')).toEqual([
        {
          level: 'ERROR',
          message: 'Recipe validation failed with 1 error(s)',
          context: null
        }
      ]);
    });

    it('should collect multiple validation errors', () => {
      try {
        parser.parse({
          providers: [
            // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
            {/* Missing name and type */},
            // @ts-expect-error Exercise runtime validation with an intentionally invalid input.
            { name: 123, type: 456 } // Wrong types
          ]
        });
        fail('Should have thrown error');
      } catch (error) {
        expect((error as RecipeValidationError).validationErrors.length).toBeGreaterThan(2);
      }
    });
  });

  // ===================================================================
  // VALIDATE METHOD TESTS
  // ===================================================================

  describe('validate() Method', () => {
    it('should return isValid true for valid recipe', () => {
      const recipe = {
        providers: [{ name: 'userData', type: 'UserDataProvider' }]
      };

      const result = parser.validate(recipe);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return isValid false for invalid recipe', () => {
      const recipe = {
        providers: []
      };

      const result = parser.validate(recipe);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['"providers" array must contain at least one provider']);
    });

    it('should not throw errors for invalid recipe', () => {
      const recipe = {
        providers: [{/* Missing name and type */}]
      };

      expect(parser.validate(recipe)).toEqual({
        isValid: false,
        errors: [
          "Provider at index 0: 'name' is required and must be a string",
          "Provider at index 0: 'type' is required and must be a string"
        ]
      });
    });

    it('should return validation errors in result', () => {
      const recipe = {
        providers: [
          { type: 'UserDataProvider' } // Missing name
        ]
      };

      const result = parser.validate(recipe);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Provider at index 0: 'name' is required and must be a string"
      );
    });

    it('should return all validation errors for invalid recipe', () => {
      const recipe = {
        providers: [{/* Missing name and type */}]
      };

      const result = parser.validate(recipe);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should handle non-RecipeValidationError exceptions', () => {
      // Create a parser with a logger that throws
      const throwingLogger = MockFactory.createJestLogger();
      (throwingLogger as { debug: () => unknown }).debug = () => {
        throw new Error('Unexpected error');
      };
      const throwingParser = new RecipeParser(throwingLogger);

      const recipe = {
        providers: [{ name: 'userData', type: 'UserDataProvider' }]
      };

      const result = throwingParser.validate(recipe);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unexpected error');
    });
  });

  // ===================================================================
  // EDGE CASES AND INTEGRATION TESTS
  // ===================================================================

  describe('Edge Cases and Integration', () => {
    it('should handle empty parameters object', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: {}
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers[0].parameters).toEqual({});
    });

    it('should handle empty condition string', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            condition: ''
          }
        ]
      };

      const result = parser.parse(recipe);

      // Empty strings are normalized to null by the parser
      expect(result.providers[0].condition).toBe(null);
    });

    it('should handle empty postProcess array', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            postProcess: []
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers[0].postProcess).toEqual([]);
    });

    it('should handle complex real-world recipe', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            parameters: {
              userId: '@userId'
            }
          },
          {
            name: 'orderData',
            type: 'OrderDataProvider',
            condition: '$userData.isActive == true',
            parameters: {
              userId: '$userData.id',
              startDate: '@startDate',
              endDate: '@endDate'
            },
            postProcess: [
              { type: 'filterFields', fields: ['id', 'date', 'total'] },
              { type: 'defaultValues', defaults: { status: 'pending' } }
            ]
          },
          {
            name: 'addressData',
            type: 'AddressDataProvider',
            parameters: {
              userId: '$userData.id'
            }
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers).toHaveLength(3);
      expect(result.providers[0].name).toBe('userData');
      expect(result.providers[1].name).toBe('orderData');
      expect(result.providers[1].condition).toBe('$userData.isActive == true');
      expect(result.providers[1].postProcess).toHaveLength(2);
      expect(result.providers[2].name).toBe('addressData');
    });

    it('should preserve extra properties in postProcess config', () => {
      const recipe = {
        providers: [
          {
            name: 'userData',
            type: 'UserDataProvider',
            postProcess: [
              {
                type: 'filterFields',
                fields: ['name', 'email'],
                extraProp: 'should be preserved'
              }
            ]
          }
        ]
      };

      const result = parser.parse(recipe);

      expect(result.providers[0].postProcess[0].extraProp).toBe('should be preserved');
    });
  });
});
