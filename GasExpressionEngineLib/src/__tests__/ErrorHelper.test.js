/**
 * @fileoverview Tests for ErrorHelper class
 * @author GasLibraryFactory
 */

import { ErrorHelper } from '../handlers/ErrorHelper.js';

describe('ErrorHelper - Comprehensive Test Suite', () => {
  // ===================================================================
  // create() Method Tests
  // ===================================================================
  describe('create() Method', () => {
    it('should create error with component and errorType only', () => {
      const error = ErrorHelper.create('TestComponent', 'TestError');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('[TestComponent] TestError');
    });

    it('should create error with component, errorType, and details', () => {
      const error = ErrorHelper.create('Parser', 'Invalid input', 'expected string');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('[Parser] Invalid input: expected string');
    });

    it('should handle empty details gracefully', () => {
      const error = ErrorHelper.create('Component', 'Error type', '');

      expect(error.message).toBe('[Component] Error type');
    });

    it('should handle null details as missing', () => {
      const error = ErrorHelper.create('Component', 'Error type', null);

      expect(error.message).toBe('[Component] Error type');
    });

    it('should handle undefined details as missing', () => {
      const error = ErrorHelper.create('Component', 'Error type', undefined);

      expect(error.message).toBe('[Component] Error type');
    });

    it('should preserve special characters in messages', () => {
      const error = ErrorHelper.create('Parser', 'Invalid token', 'found "{}" expected "[]"');

      expect(error.message).toBe('[Parser] Invalid token: found "{}" expected "[]"');
    });
  });

  // ===================================================================
  // createWithPosition() Method Tests
  // ===================================================================
  describe('createWithPosition() Method', () => {
    it('should create error with string value and position', () => {
      const error = ErrorHelper.createWithPosition('Parser', 'Unexpected character', '&', 15);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('[Parser] Unexpected character: "&" at position 15');
    });

    it('should create error with numeric value and position', () => {
      const error = ErrorHelper.createWithPosition('Evaluator', 'Invalid number', 123, 42);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('[Evaluator] Invalid number: 123 at position 42');
    });

    it('should quote string values', () => {
      const error = ErrorHelper.createWithPosition('Parser', 'Unexpected token', '}', 10);

      expect(error.message).toContain('"}"');
    });

    it('should not quote numeric values', () => {
      const error = ErrorHelper.createWithPosition('Parser', 'Invalid value', 999, 5);

      expect(error.message).toBe('[Parser] Invalid value: 999 at position 5');
      expect(error.message).not.toContain('"999"');
    });

    it('should handle position 0', () => {
      const error = ErrorHelper.createWithPosition('Parser', 'Error at start', 'x', 0);

      expect(error.message).toBe('[Parser] Error at start: "x" at position 0');
    });

    it('should handle special characters in value', () => {
      const error = ErrorHelper.createWithPosition('Parser', 'Unexpected', '\\n', 20);

      expect(error.message).toBe('[Parser] Unexpected: "\\n" at position 20');
    });
  });

  // ===================================================================
  // createValidation() Method Tests
  // ===================================================================
  describe('createValidation() Method', () => {
    it('should create parameter validation error', () => {
      const error = ErrorHelper.createValidation('Parser', 'logger', 'object with debug method');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        "[Parser] Invalid parameter 'logger': must be object with debug method"
      );
    });

    it('should quote parameter name', () => {
      const error = ErrorHelper.createValidation('Service', 'config', 'non-null object');

      expect(error.message).toContain("'config'");
    });

    it('should include expected type in message', () => {
      const error = ErrorHelper.createValidation('Component', 'value', 'string or number');

      expect(error.message).toBe("[Component] Invalid parameter 'value': must be string or number");
    });

    it('should handle complex parameter names', () => {
      const error = ErrorHelper.createValidation('Parser', 'options.maxDepth', 'positive integer');

      expect(error.message).toBe(
        "[Parser] Invalid parameter 'options.maxDepth': must be positive integer"
      );
    });
  });

  // ===================================================================
  // createUnsupported() Method Tests
  // ===================================================================
  describe('createUnsupported() Method', () => {
    it('should create unsupported operation error with string value', () => {
      const error = ErrorHelper.createUnsupported('Evaluator', 'operator', '**');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('[Evaluator] Unsupported operator: "**"');
    });

    it('should create unsupported operation error with numeric value', () => {
      const error = ErrorHelper.createUnsupported('Parser', 'token type', 42);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('[Parser] Unsupported token type: 42');
    });

    it('should quote string values', () => {
      const error = ErrorHelper.createUnsupported('Component', 'function', 'async');

      expect(error.message).toContain('"async"');
    });

    it('should not quote numeric values', () => {
      const error = ErrorHelper.createUnsupported('Component', 'version', 3);

      expect(error.message).toBe('[Component] Unsupported version: 3');
      expect(error.message).not.toContain('"3"');
    });

    it('should handle complex operation types', () => {
      const error = ErrorHelper.createUnsupported('Engine', 'comparison operator', '!==');

      expect(error.message).toBe('[Engine] Unsupported comparison operator: "!=="');
    });
  });

  // ===================================================================
  // createLimitExceeded() Method Tests
  // ===================================================================
  describe('createLimitExceeded() Method', () => {
    it('should create limit exceeded error', () => {
      const error = ErrorHelper.createLimitExceeded('Parser', 'recursion depth', 150, 100);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('[Parser] Limit exceeded: recursion depth is 150 (maximum: 100)');
    });

    it('should handle different limit types', () => {
      const error = ErrorHelper.createLimitExceeded('Validator', 'string length', 5000, 1000);

      expect(error.message).toBe(
        '[Validator] Limit exceeded: string length is 5000 (maximum: 1000)'
      );
    });

    it('should format numbers correctly', () => {
      const error = ErrorHelper.createLimitExceeded('Component', 'array size', 1000000, 500000);

      expect(error.message).toContain('is 1000000');
      expect(error.message).toContain('maximum: 500000');
    });

    it('should handle limit type with special characters', () => {
      const error = ErrorHelper.createLimitExceeded('Parser', 'expression depth (nested)', 25, 20);

      expect(error.message).toBe(
        '[Parser] Limit exceeded: expression depth (nested) is 25 (maximum: 20)'
      );
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should throw errors that can be caught and rethrown', () => {
      try {
        throw ErrorHelper.create('TestComponent', 'Test error', 'test details');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('[TestComponent] Test error: test details');
      }
    });

    it('should create consistent error format across all methods', () => {
      const errors = [
        ErrorHelper.create('Component', 'Error 1'),
        ErrorHelper.createWithPosition('Component', 'Error 2', 'x', 5),
        ErrorHelper.createValidation('Component', 'param', 'type'),
        ErrorHelper.createUnsupported('Component', 'feature', 'value'),
        ErrorHelper.createLimitExceeded('Component', 'limit', 10, 5)
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toMatch(/^\[Component\]/);
      });
    });

    it('should preserve stack traces', () => {
      const error = ErrorHelper.create('Component', 'Test error');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('Component');
    });

    it('should be usable in try-catch blocks', () => {
      expect(() => {
        try {
          throw ErrorHelper.createValidation('Service', 'config', 'object');
        } catch (e) {
          if (e.message.includes('Invalid parameter')) {
            throw ErrorHelper.create('Wrapper', 'Validation failed', e.message);
          }
          throw e;
        }
      }).toThrow('[Wrapper] Validation failed');
    });

    it('should handle all methods with consistent component names', () => {
      const componentName = 'TestComponent';

      const errors = [
        ErrorHelper.create(componentName, 'Error'),
        ErrorHelper.createWithPosition(componentName, 'Error', 'x', 0),
        ErrorHelper.createValidation(componentName, 'param', 'type'),
        ErrorHelper.createUnsupported(componentName, 'op', 'val'),
        ErrorHelper.createLimitExceeded(componentName, 'limit', 10, 5)
      ];

      errors.forEach((error) => {
        expect(error.message.startsWith(`[${componentName}]`)).toBe(true);
      });
    });
  });
});
