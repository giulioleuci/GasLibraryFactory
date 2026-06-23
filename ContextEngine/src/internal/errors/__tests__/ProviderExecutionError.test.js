/**
 * @file ContextEngine/src/internal/errors/__tests__/ProviderExecutionError.test.js
 * @description Dedicated tests for ProviderExecutionError
 */

import { describe, it, expect } from '@jest/globals';
import { ContextEngineError } from '../ContextEngineError';
import { ProviderExecutionError } from '../ProviderExecutionError';

describe('ProviderExecutionError', () => {
  describe('Constructor', () => {
    it('should create error with providerName, originalError, and parameters', () => {
      const originalError = new Error('Network timeout');
      const parameters = { userId: 123 };
      const error = new ProviderExecutionError('UserDataProvider', originalError, parameters);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ContextEngineError);
      expect(error).toBeInstanceOf(ProviderExecutionError);
      expect(error.name).toBe('ProviderExecutionError');
      expect(error.message).toBe("Provider 'UserDataProvider' execution failed: Network timeout");
    });

    it('should set providerName property', () => {
      const originalError = new Error('Test error');
      const error = new ProviderExecutionError('TestProvider', originalError, {});

      expect(error.providerName).toBe('TestProvider');
    });

    it('should set originalError property', () => {
      const originalError = new Error('Original error');
      const error = new ProviderExecutionError('TestProvider', originalError, {});

      expect(error.originalError).toBe(originalError);
      expect(error.originalError.message).toBe('Original error');
    });

    it('should store parameters in context', () => {
      const originalError = new Error('Test');
      const parameters = { userId: 123, startDate: '2024-01-01' };
      const error = new ProviderExecutionError('TestProvider', originalError, parameters);

      expect(error.context.parameters).toEqual(parameters);
      expect(error.context.parameters.userId).toBe(123);
    });

    it('should store providerName in context', () => {
      const originalError = new Error('Test');
      const error = new ProviderExecutionError('TestProvider', originalError, {});

      expect(error.context.providerName).toBe('TestProvider');
    });

    it('should store originalError in context', () => {
      const originalError = new Error('Original');
      const error = new ProviderExecutionError('TestProvider', originalError, {});

      expect(error.context.originalError).toBe(originalError);
    });

    it('should handle empty parameters', () => {
      const originalError = new Error('Test');
      const error = new ProviderExecutionError('TestProvider', originalError, {});

      expect(error.context.parameters).toEqual({});
    });

    it('should handle null parameters', () => {
      const originalError = new Error('Test');
      const error = new ProviderExecutionError('TestProvider', originalError, null);

      expect(error.context.parameters).toBeNull();
    });

    it('should format error message correctly', () => {
      const originalError = new Error('Connection refused');
      const error = new ProviderExecutionError('DatabaseProvider', originalError, {});

      expect(error.message).toBe(
        "Provider 'DatabaseProvider' execution failed: Connection refused"
      );
    });

    it('should handle complex error messages', () => {
      const originalError = new Error('Multiple issues: timeout, retry failed, connection lost');
      const error = new ProviderExecutionError('ComplexProvider', originalError, {});

      expect(error.message).toContain('ComplexProvider');
      expect(error.message).toContain('Multiple issues');
    });
  });

  describe('Inheritance', () => {
    it('should inherit from ContextEngineError', () => {
      const originalError = new Error('Test');
      const error = new ProviderExecutionError('TestProvider', originalError, {});
      expect(error instanceof ContextEngineError).toBe(true);
    });

    it('should have correct error name', () => {
      const originalError = new Error('Test');
      const error = new ProviderExecutionError('TestProvider', originalError, {});
      expect(error.name).toBe('ProviderExecutionError');
    });

    it('should use toString() from parent', () => {
      const originalError = new Error('Network error');
      const parameters = { userId: 123 };
      const error = new ProviderExecutionError('UserProvider', originalError, parameters);
      const result = error.toString();

      expect(result).toContain('ProviderExecutionError');
      expect(result).toContain('Network error');
      expect(result).toContain('"providerName": "UserProvider"');
      expect(result).toContain('"userId": 123');
    });
  });
});
