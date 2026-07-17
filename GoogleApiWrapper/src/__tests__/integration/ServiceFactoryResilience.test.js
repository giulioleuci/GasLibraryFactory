/**
 * Integration Test: ServiceFactory + GasResilienceLib
 *
 * Layers Tested: GoogleApiWrapper → GasResilienceLib → CoreUtilsLib
 *
 * Purpose: Verifies that ServiceFactory correctly creates services with
 * proper dependency injection including resilience integration.
 *
 * @file GoogleApiWrapper/src/__tests__/integration/ServiceFactoryResilience.test.js
 */

import { GoogleService } from '../../internal/core/GoogleService';
import { ErrorHandler, ServiceError, QuotaExceededError } from '../../internal/core/ErrorHandler';
import { ExceptionService } from '@GasResilienceLib';
import { LoggerService, UtilsService } from '@CoreUtilsLib';

describe('ServiceFactory + GasResilienceLib Integration', () => {
  let logger;
  let utils;
  let cache;
  let exceptionService;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    utils = {
      sleep: jest.fn()
    };

    cache = {
      get: jest.fn(),
      put: jest.fn(),
      remove: jest.fn()
    };

    exceptionService = new ExceptionService(logger, utils);
  });

  describe('GoogleService with ExceptionService integration', () => {
    // Create a concrete implementation for testing
    class TestService extends GoogleService {
      constructor(logger, cache, utils, exceptionService) {
        super(logger, cache, utils, exceptionService);
        this.apiCallCount = 0;
      }

      callApi(shouldFail = false, failCount = 0) {
        return this._executeWithRetry(() => {
          this.apiCallCount++;
          if (shouldFail && this.apiCallCount <= failCount) {
            const error = new Error('Service temporarily unavailable');
            error.code = 503;
            throw error;
          }
          return { success: true, attempts: this.apiCallCount };
        });
      }

      callWithCache(key, useCache = true) {
        return this._getOrExecute(
          key,
          () => {
            return { data: 'fresh', timestamp: Date.now() };
          },
          600,
          useCache
        );
      }
    }

    it('should create service with all dependencies', () => {
      const service = new TestService(logger, cache, utils, exceptionService);

      expect(service).toBeInstanceOf(GoogleService);
      expect(service._logger).toBe(logger);
      expect(service._cache).toBe(cache);
      expect(service._utils).toBe(utils);
      expect(service._exceptionService).toBe(exceptionService);
    });

    it('should execute API call successfully without failures', () => {
      const service = new TestService(logger, cache, utils, exceptionService);

      const result = service.callApi(false);

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(service.apiCallCount).toBe(1);
    });

    it('should retry and succeed on transient failures', () => {
      const service = new TestService(logger, cache, utils, exceptionService);

      // Fail twice, then succeed
      const result = service.callApi(true, 2);

      expect(result.success).toBe(true);
      expect(service.apiCallCount).toBeGreaterThanOrEqual(3);
    });

    it('should use cache when enabled', () => {
      // _getOrExecute stores/retrieves objects directly, not JSON strings
      cache.get.mockReturnValue({ data: 'cached' });
      const service = new TestService(logger, cache, utils, exceptionService);

      const result = service.callWithCache('test-key', true);

      expect(cache.get).toHaveBeenCalledWith('test-key');
      expect(result.data).toBe('cached');
    });

    it('should bypass cache when disabled', () => {
      cache.get.mockReturnValue({ data: 'cached' });
      const service = new TestService(logger, cache, utils, exceptionService);

      const result = service.callWithCache('test-key', false);

      expect(result.data).toBe('fresh');
    });

    it('should cache result after execution', () => {
      cache.get.mockReturnValue(null);
      const service = new TestService(logger, cache, utils, exceptionService);

      const result = service.callWithCache('test-key', true);

      // _getOrExecute stores objects directly, not JSON strings
      expect(cache.put).toHaveBeenCalledWith('test-key', expect.any(Object), 600);
      expect(result.data).toBe('fresh');
    });
  });

  describe('cache key generation', () => {
    class KeyTestService extends GoogleService {
      constructor(logger, cache, utils, exceptionService) {
        super(logger, cache, utils, exceptionService);
      }

      generateKey(prefix, id, method) {
        return this._generateCacheKey(prefix, id, method);
      }
    }

    it('should generate consistent cache keys', () => {
      const service = new KeyTestService(logger, cache, utils, exceptionService);

      const key1 = service.generateKey('drive', '123', 'getFile');
      const key2 = service.generateKey('drive', '123', 'getFile');

      expect(key1).toBe(key2);
      expect(key1).toContain('drive');
      expect(key1).toContain('123');
    });

    it('should generate unique keys for different inputs', () => {
      const service = new KeyTestService(logger, cache, utils, exceptionService);

      const key1 = service.generateKey('drive', '123', 'getFile');
      const key2 = service.generateKey('drive', '456', 'getFile');
      const key3 = service.generateKey('sheets', '123', 'getData');

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
    });
  });

  describe('cache invalidation', () => {
    class CacheInvalidationService extends GoogleService {
      constructor(logger, cache, utils, exceptionService) {
        super(logger, cache, utils, exceptionService);
      }

      invalidate(key) {
        this._invalidateCache(key);
      }

      invalidateByPrefix(prefix) {
        this._invalidateCacheByPrefix(prefix);
      }
    }

    it('should invalidate single cache entry', () => {
      const service = new CacheInvalidationService(logger, cache, utils, exceptionService);

      service.invalidate('test-key');

      expect(cache.remove).toHaveBeenCalledWith('test-key');
    });
  });

  describe('error handling and retry logic', () => {
    class ErrorTestService extends GoogleService {
      constructor(logger, cache, utils, exceptionService) {
        super(logger, cache, utils, exceptionService);
      }

      causeError(errorType) {
        return this._executeWithRetry(() => {
          switch (errorType) {
            case 'quota':
              throw new Error('Rate limit exceeded');
            case 'service':
              throw new Error('Service error');
            default:
              throw new Error('Unknown error');
          }
        });
      }

      // Direct error throwing without retry wrapper for type testing
      throwDirectError(errorType) {
        switch (errorType) {
          case 'quota':
            throw new QuotaExceededError(
              'Rate limit exceeded',
              'ErrorTestService',
              'throwDirectError',
              null,
              {}
            );
          case 'service':
            throw new ServiceError(
              'Service error',
              'ErrorTestService',
              'throwDirectError',
              null,
              {}
            );
          default:
            throw new Error('Unknown error');
        }
      }
    }

    it('should propagate errors through executeWithRetry', () => {
      const service = new ErrorTestService(logger, cache, utils, exceptionService);

      // ExceptionService.executeWithRetry wraps errors in plain Error
      expect(() => service.causeError('quota')).toThrow(Error);
      expect(() => service.causeError('quota')).toThrow('Rate limit exceeded');
    });

    it('should preserve ServiceError type when thrown directly', () => {
      const service = new ErrorTestService(logger, cache, utils, exceptionService);

      expect(() => service.throwDirectError('quota')).toThrow(QuotaExceededError);
      expect(() => service.throwDirectError('service')).toThrow(ServiceError);
    });
  });

  describe('dry-run mode', () => {
    class DryRunTestService extends GoogleService {
      constructor(logger, cache, utils, exceptionService, options = {}) {
        super(logger, cache, utils, exceptionService, options);
        this._dryRun = options.dryRun || false;
      }

      performAction(data) {
        if (this._dryRun) {
          this._logger.info('[DRY-RUN] Would perform action with:', data);
          return { dryRun: true, data };
        }
        return this._executeWithRetry(() => {
          return { success: true, data };
        });
      }
    }

    it('should execute normally when dry-run is false', () => {
      const service = new DryRunTestService(logger, cache, utils, exceptionService, {
        dryRun: false
      });

      const result = service.performAction({ test: true });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBeUndefined();
    });

    it('should skip execution when dry-run is true', () => {
      const service = new DryRunTestService(logger, cache, utils, exceptionService, {
        dryRun: true
      });

      const result = service.performAction({ test: true });

      expect(result.dryRun).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[DRY-RUN]'),
        expect.any(Object)
      );
    });
  });
});

describe('ErrorHandler Integration', () => {
  let logger;

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  });

  describe('error classification', () => {
    it('should create QuotaExceededError with correct properties', () => {
      const error = new QuotaExceededError(
        'API quota exceeded',
        'TestService',
        'testOperation',
        null,
        {}
      );

      expect(error).toBeInstanceOf(QuotaExceededError);
      expect(error).toBeInstanceOf(ServiceError);
      expect(error.message).toBe('API quota exceeded');
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(60000);
    });

    it('should handle error from Google API response', () => {
      const googleError = new Error('User-rate limit exceeded. Retry after 2025-01-24T00:00:00');
      googleError.details = { quotaExceeded: true };

      const handler = new ErrorHandler('TestService', logger);
      const classifiedError = handler.classifyError(googleError, 'testOperation');

      expect(classifiedError).toBeInstanceOf(QuotaExceededError);
      expect(classifiedError.retryable).toBe(true);
    });
  });

  describe('error context enrichment', () => {
    it('should add context to errors', () => {
      const error = new ServiceError('Test error', 'DriveService', 'createFile', null, {
        fileId: '123'
      });

      expect(error.context).toBeDefined();
      expect(error.serviceName).toBe('DriveService');
      expect(error.operation).toBe('createFile');
      expect(error.context.fileId).toBe('123');
    });
  });
});

describe('Real LoggerService and UtilsService Integration', () => {
  let realLogger;
  let realUtils;

  beforeEach(() => {
    realLogger = new LoggerService();
    realUtils = new UtilsService();
  });

  it('should work with real CoreUtilsLib services', () => {
    const cache = {
      get: jest.fn().mockReturnValue(null),
      put: jest.fn(),
      remove: jest.fn()
    };

    const exceptionService = new ExceptionService(realLogger, realUtils);

    class RealIntegrationService extends GoogleService {
      constructor() {
        super(realLogger, cache, realUtils, exceptionService);
      }

      testOperation() {
        this._logger.info('Testing operation');
        return this._executeWithRetry(() => {
          return { result: 'success' };
        });
      }
    }

    const service = new RealIntegrationService();
    const result = service.testOperation();

    expect(result).toEqual({ result: 'success' });
  });

  it('should validate LoggerService implements LoggerInterface', () => {
    expect(typeof realLogger.debug).toBe('function');
    expect(typeof realLogger.info).toBe('function');
    expect(typeof realLogger.warn).toBe('function');
    expect(typeof realLogger.error).toBe('function');
  });

  it('should validate UtilsService provides sleep', () => {
    expect(typeof realUtils.sleep).toBe('function');
  });
});
