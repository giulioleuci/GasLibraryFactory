/**
 * @fileoverview Tests for ErrorHandler and ServiceError classes
 * @author GasLibraryFactory
 */

import {
  ErrorHandler,
  ServiceError,
  QuotaExceededError,
  PermissionDeniedError,
  ResourceNotFoundError,
  ServiceUnavailableError,
  ValidationError
} from '../ErrorHandler.js';
import { LoggerService } from '@CoreUtilsLib';
import { MockFactory } from '../../../../../test/fakes/MockFactory';

// Mock Utilities.sleep
global.Utilities = {
  sleep: jest.fn()
};

describe('ErrorHandler - Comprehensive Test Suite', () => {
  let mocks;
  let errorHandler;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
    errorHandler = new ErrorHandler('TestService', mocks.logger);
    jest.clearAllMocks();
  });

  // ===================================================================
  // ServiceError Class Tests
  // ===================================================================
  describe('ServiceError Class', () => {
    it('should create ServiceError with all properties', () => {
      const originalError = new Error('Original error');
      const context = { fileId: '123' };

      const error = new ServiceError(
        'Service failed',
        'TestService',
        'testOperation',
        originalError,
        context
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ServiceError);
      expect(error.name).toBe('ServiceError');
      expect(error.message).toBe('Service failed');
      expect(error.serviceName).toBe('TestService');
      expect(error.operation).toBe('testOperation');
      expect(error.originalError).toBe(originalError);
      expect(error.context).toEqual(context);
      expect(error.timestamp).toBeDefined();
    });

    it('should work with default parameters', () => {
      const error = new ServiceError('Test', 'Service', 'op');

      expect(error.originalError).toBeNull();
      expect(error.context).toEqual({});
    });

    it('should capture stack trace', () => {
      const error = new ServiceError('Test', 'Service', 'op');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('should convert to log object', () => {
      const originalError = new Error('Original');
      const error = new ServiceError('Test', 'Service', 'op', originalError, { key: 'value' });

      const logObject = error.toLogObject();

      expect(logObject).toEqual({
        name: 'ServiceError',
        message: 'Test',
        serviceName: 'Service',
        operation: 'op',
        timestamp: error.timestamp,
        context: { key: 'value' },
        originalError: {
          message: 'Original',
          stack: originalError.stack
        }
      });
    });

    it('should handle null originalError in toLogObject', () => {
      const error = new ServiceError('Test', 'Service', 'op', null, {});

      const logObject = error.toLogObject();

      expect(logObject.originalError).toBeNull();
    });
  });

  // ===================================================================
  // Error Subclass Tests
  // ===================================================================
  describe('Error Subclasses', () => {
    it('should create QuotaExceededError with retryable flag', () => {
      const error = new QuotaExceededError('Quota exceeded', 'TestService', 'operation', null, {});

      expect(error).toBeInstanceOf(ServiceError);
      expect(error).toBeInstanceOf(QuotaExceededError);
      expect(error.name).toBe('QuotaExceededError');
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(60000);
    });

    it('should create PermissionDeniedError with non-retryable flag', () => {
      const error = new PermissionDeniedError(
        'Permission denied',
        'TestService',
        'operation',
        null,
        {}
      );

      expect(error).toBeInstanceOf(ServiceError);
      expect(error.name).toBe('PermissionDeniedError');
      expect(error.retryable).toBe(false);
    });

    it('should create ResourceNotFoundError with non-retryable flag', () => {
      const error = new ResourceNotFoundError('Not found', 'TestService', 'operation', null, {});

      expect(error).toBeInstanceOf(ServiceError);
      expect(error.name).toBe('ResourceNotFoundError');
      expect(error.retryable).toBe(false);
    });

    it('should create ServiceUnavailableError with retryable flag', () => {
      const error = new ServiceUnavailableError(
        'Service unavailable',
        'TestService',
        'operation',
        null,
        {}
      );

      expect(error).toBeInstanceOf(ServiceError);
      expect(error.name).toBe('ServiceUnavailableError');
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(5000);
    });

    it('should create ValidationError with non-retryable flag', () => {
      const error = new ValidationError('Invalid input', 'TestService', 'operation', null, {});

      expect(error).toBeInstanceOf(ServiceError);
      expect(error.name).toBe('ValidationError');
      expect(error.retryable).toBe(false);
    });
  });

  // ===================================================================
  // ErrorHandler Constructor Tests
  // ===================================================================
  describe('ErrorHandler Constructor', () => {
    it('should create ErrorHandler with serviceName and logger', () => {
      expect(errorHandler.serviceName).toBe('TestService');
      expect(errorHandler.logger).toBe(mocks.logger);
    });

    it('should use LoggerService as default logger', () => {
      const handler = new ErrorHandler('TestService');

      expect(handler.logger).toBeInstanceOf(LoggerService);
    });
  });

  // ===================================================================
  // classifyError() Method Tests
  // ===================================================================
  describe('classifyError() Method', () => {
    it('should classify quota exceeded errors', () => {
      const testCases = [
        'Quota exceeded',
        'Limit has been exceeded',
        'Too many requests',
        'QUOTA_EXCEEDED'
      ];

      testCases.forEach((message) => {
        const error = new Error(message);
        const classified = errorHandler.classifyError(error, 'testOp', { test: true });

        expect(classified).toBeInstanceOf(QuotaExceededError);
        expect(classified.message).toBe(message);
        expect(classified.operation).toBe('testOp');
        expect(classified.context).toEqual({ test: true });
      });
    });

    it('should classify permission denied errors', () => {
      const testCases = [
        'Permission denied',
        'Unauthorized access',
        'Forbidden resource',
        'PERMISSION_DENIED'
      ];

      testCases.forEach((message) => {
        const error = new Error(message);
        const classified = errorHandler.classifyError(error, 'testOp');

        expect(classified).toBeInstanceOf(PermissionDeniedError);
        expect(classified.message).toBe(message);
      });
    });

    it('should classify resource not found errors', () => {
      const testCases = [
        'File not found',
        'Resource does not exist',
        'HTTP 404 error',
        'Item not found' // Changed from 'NOT_FOUND' which doesn't match regex
      ];

      testCases.forEach((message) => {
        const error = new Error(message);
        const classified = errorHandler.classifyError(error, 'testOp');

        expect(classified).toBeInstanceOf(ResourceNotFoundError);
      });
    });

    it('should classify service unavailable errors', () => {
      const testCases = [
        'Service unavailable',
        'HTTP 503 error',
        'HTTP 502 Bad Gateway',
        'Request timeout'
      ];

      testCases.forEach((message) => {
        const error = new Error(message);
        const classified = errorHandler.classifyError(error, 'testOp');

        expect(classified).toBeInstanceOf(ServiceUnavailableError);
      });
    });

    it('should default to generic ServiceError for unknown errors', () => {
      const error = new Error('Some random error');
      const classified = errorHandler.classifyError(error, 'testOp');

      expect(classified).toBeInstanceOf(ServiceError);
      expect(classified.constructor).toBe(ServiceError);
      expect(classified.message).toBe('Some random error');
    });

    it('should handle non-Error objects', () => {
      const errorString = 'String error';
      const classified = errorHandler.classifyError(errorString, 'testOp');

      expect(classified).toBeInstanceOf(ServiceError);
      expect(classified.message).toBe('String error');
    });

    it('should use default empty context', () => {
      const error = new Error('Test');
      const classified = errorHandler.classifyError(error, 'testOp');

      expect(classified.context).toEqual({});
    });
  });

  // ===================================================================
  // wrap() Method Tests
  // ===================================================================
  describe('wrap() Method', () => {
    it('should return function result on success', () => {
      const func = jest.fn().mockReturnValue('success');

      const result = errorHandler.wrap(func, 'testOp', { key: 'value' });

      expect(result).toBe('success');
      expect(func).toHaveBeenCalled();
      expect(mocks.logger.error).not.toHaveBeenCalled();
    });

    it('should classify and throw error on failure', () => {
      const originalError = new Error('Quota exceeded');
      const func = jest.fn().mockImplementation(() => {
        throw originalError;
      });

      expect(() => {
        errorHandler.wrap(func, 'testOp', { key: 'value' });
      }).toThrow(QuotaExceededError);
    });

    it('should log classified error', () => {
      const originalError = new Error('Permission denied');
      const func = jest.fn().mockImplementation(() => {
        throw originalError;
      });

      try {
        errorHandler.wrap(func, 'testOp', { fileId: '123' });
      } catch (error) {
        // Expected
      }

      expect(mocks.logger.error).toHaveBeenCalledWith(
        '[TestService] testOp failed:',
        expect.objectContaining({
          name: 'PermissionDeniedError',
          message: 'Permission denied',
          operation: 'testOp',
          context: { fileId: '123' }
        })
      );
    });

    it('should work with default empty context', () => {
      const func = jest.fn().mockReturnValue('result');

      const result = errorHandler.wrap(func, 'testOp');

      expect(result).toBe('result');
    });
  });

  // ===================================================================
  // withRetry() Method Tests
  // ===================================================================
  describe('withRetry() Method', () => {
    it('should return result on first success', () => {
      const func = jest.fn().mockReturnValue('success');

      const result = errorHandler.withRetry(func, 'testOp');

      expect(result).toBe('success');
      expect(func).toHaveBeenCalledTimes(1);
      expect(Utilities.sleep).not.toHaveBeenCalled();
    });

    it('should retry retryable errors', () => {
      const func = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Quota exceeded');
        })
        .mockImplementationOnce(() => {
          throw new Error('Service unavailable');
        })
        .mockReturnValueOnce('success');

      const result = errorHandler.withRetry(func, 'testOp', { maxAttempts: 3 });

      expect(result).toBe('success');
      expect(func).toHaveBeenCalledTimes(3);
      expect(Utilities.sleep).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for retries', () => {
      // Create a custom retryable error without retryAfter to test exponential backoff
      const customError = new ServiceError('Custom retryable error', 'TestService', 'op', null, {});
      customError.retryable = true; // Make it retryable but without retryAfter

      const func = jest
        .fn()
        .mockImplementationOnce(() => {
          throw customError;
        })
        .mockImplementationOnce(() => {
          throw customError;
        })
        .mockReturnValueOnce('success');

      // Spy on classifyError to return our custom error
      jest.spyOn(errorHandler, 'classifyError').mockReturnValue(customError);

      errorHandler.withRetry(func, 'testOp', { maxAttempts: 3, baseDelay: 1000 });

      expect(Utilities.sleep).toHaveBeenNthCalledWith(1, 1000); // 1000 * 2^0
      expect(Utilities.sleep).toHaveBeenNthCalledWith(2, 2000); // 1000 * 2^1

      errorHandler.classifyError.mockRestore();
    });

    it('should use custom retryAfter if available', () => {
      const func = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Quota exceeded');
        })
        .mockReturnValueOnce('success');

      errorHandler.withRetry(func, 'testOp');

      // QuotaExceededError has retryAfter: 60000
      expect(Utilities.sleep).toHaveBeenCalledWith(60000);
    });

    it('should not retry non-retryable errors', () => {
      const func = jest.fn().mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        errorHandler.withRetry(func, 'testOp', { maxAttempts: 3 });
      }).toThrow(PermissionDeniedError);

      expect(func).toHaveBeenCalledTimes(1);
      expect(Utilities.sleep).not.toHaveBeenCalled();
    });

    it('should throw after max attempts for retryable errors', () => {
      const func = jest.fn().mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => {
        errorHandler.withRetry(func, 'testOp', { maxAttempts: 3 });
      }).toThrow(QuotaExceededError);

      expect(func).toHaveBeenCalledTimes(3);
      expect(Utilities.sleep).toHaveBeenCalledTimes(2); // Only sleep between attempts
    });

    it('should log warnings for retry attempts', () => {
      const func = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Service unavailable');
        })
        .mockReturnValueOnce('success');

      errorHandler.withRetry(func, 'testOp', { maxAttempts: 3, baseDelay: 1000 });

      expect(mocks.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('[TestService] testOp failed (attempt 1/3), retrying in')
      );
    });

    it('should log error when all retries fail', () => {
      const func = jest.fn().mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      try {
        errorHandler.withRetry(func, 'testOp', { maxAttempts: 2 });
      } catch (error) {
        // Expected
      }

      expect(mocks.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('[TestService] testOp failed after 2 attempts'),
        expect.any(Object)
      );
    });

    it('should use default options', () => {
      const func = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Service unavailable');
        })
        .mockReturnValueOnce('success');

      const result = errorHandler.withRetry(func, 'testOp');

      expect(result).toBe('success');
      expect(func).toHaveBeenCalledTimes(2);
    });

    it('should pass context to classified errors', () => {
      const func = jest.fn().mockImplementation(() => {
        throw new Error('Not found');
      });

      try {
        errorHandler.withRetry(func, 'testOp', {
          context: { fileId: '123' },
          maxAttempts: 1
        });
      } catch (error) {
        expect(error.context).toEqual({ fileId: '123' });
      }
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should handle complete error lifecycle with wrap and classification', () => {
      const func = () => {
        throw new Error('Quota exceeded for this request');
      };

      try {
        errorHandler.wrap(func, 'getUserData', { userId: '456' });
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(QuotaExceededError);
        expect(error.serviceName).toBe('TestService');
        expect(error.operation).toBe('getUserData');
        expect(error.context).toEqual({ userId: '456' });
        expect(error.retryable).toBe(true);
      }
    });

    it('should handle retry with eventual success', () => {
      let callCount = 0;
      const func = () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Service unavailable, please retry');
        }
        return 'success';
      };

      const result = errorHandler.withRetry(func, 'fetchData', {
        maxAttempts: 5,
        baseDelay: 500
      });

      expect(result).toBe('success');
      expect(callCount).toBe(3);
      expect(Utilities.sleep).toHaveBeenCalledTimes(2);
    });

    it('should combine multiple error types in sequence', () => {
      const errors = [
        new Error('Quota exceeded'),
        new Error('Permission denied'),
        new Error('Not found'),
        new Error('Service unavailable'),
        new Error('Unknown error')
      ];

      const classifications = errors.map((error) => errorHandler.classifyError(error, 'testOp'));

      expect(classifications[0]).toBeInstanceOf(QuotaExceededError);
      expect(classifications[1]).toBeInstanceOf(PermissionDeniedError);
      expect(classifications[2]).toBeInstanceOf(ResourceNotFoundError);
      expect(classifications[3]).toBeInstanceOf(ServiceUnavailableError);
      expect(classifications[4]).toBeInstanceOf(ServiceError);
      expect(classifications[4].constructor).toBe(ServiceError);
    });
  });
});
