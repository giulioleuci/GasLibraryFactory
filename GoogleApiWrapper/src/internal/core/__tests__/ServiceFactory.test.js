/**
 * @file GoogleApiWrapper/src/core/__tests__/ServiceFactory.test.js
 * @description Test suite for ServiceFactory dependency injection container
 */

import { ServiceFactory } from '../ServiceFactory';

describe('ServiceFactory', () => {
  beforeEach(() => {
    // Reset all mocks and factory state
    jest.clearAllMocks();
    ServiceFactory.reset();

    // Setup basic mocks for Google Apps Script globals
    global.CacheService = {
      getScriptCache: jest.fn(() => ({
        get: jest.fn(),
        put: jest.fn(),
        remove: jest.fn()
      }))
    };

    global.Utilities = {
      sleep: jest.fn()
    };
  });

  afterEach(() => {
    ServiceFactory.reset();
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      expect(ServiceFactory._config).toBeDefined();
      expect(ServiceFactory._config.logLevel).toBe('INFO');
      expect(ServiceFactory._config.cacheExpiration).toBe(300);
      expect(ServiceFactory._config.mailRateLimitMs).toBe(100);
    });

    it('should allow custom configuration', () => {
      ServiceFactory.configure({
        logLevel: 'DEBUG',
        cacheExpiration: 600,
        mailRateLimitMs: 200
      });

      expect(ServiceFactory._config.logLevel).toBe('DEBUG');
      expect(ServiceFactory._config.cacheExpiration).toBe(600);
      expect(ServiceFactory._config.mailRateLimitMs).toBe(200);
    });

    it('should reset instances when reconfigured', () => {
      // Get a logger to initialize it
      const logger1 = ServiceFactory.getLogger();
      expect(ServiceFactory._logger).not.toBeNull();

      // Reconfigure
      ServiceFactory.configure({ logLevel: 'DEBUG' });

      // Logger should be reset
      expect(ServiceFactory._logger).toBeNull();
    });
  });

  describe('Shared Instances', () => {
    it('should create logger instance lazily', () => {
      expect(ServiceFactory._logger).toBeNull();

      const logger = ServiceFactory.getLogger();

      expect(ServiceFactory._logger).not.toBeNull();
      expect(logger).toBeDefined();
      expect(logger.constructor.name).toBe('LoggerService');
    });

    it('should return same logger instance on multiple calls', () => {
      const logger1 = ServiceFactory.getLogger();
      const logger2 = ServiceFactory.getLogger();

      expect(logger1).toBe(logger2);
    });

    it('should create utils instance with sleep function', () => {
      const utils = ServiceFactory.getUtils();

      expect(ServiceFactory._utils).not.toBeNull();
      expect(utils).toBeDefined();
      // UtilsService is exported as alias of MyUtilsService
      expect(utils.constructor.name).toBe('MyUtilsService');
    });

    it('should create cache instance lazily', () => {
      const cache = ServiceFactory.getCache();

      expect(ServiceFactory._cache).not.toBeNull();
      expect(cache).toBeDefined();
    });

    it('should create exception service with dependencies', () => {
      const exceptionService = ServiceFactory.getExceptionService();

      expect(ServiceFactory._exceptionService).not.toBeNull();
      expect(exceptionService).toBeDefined();
      expect(exceptionService.constructor.name).toBe('ExceptionService');
    });
  });

  describe('Service Creation', () => {
    it('should create DriveService', () => {
      const service = ServiceFactory.getDriveService();
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('DriveService');
    });

    it('should create DocumentService', () => {
      const service = ServiceFactory.getDocumentService();
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('DocumentService');
    });

    it('should create SpreadsheetService', () => {
      const service = ServiceFactory.getSpreadsheetService();
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('SpreadsheetService');
    });

    it('should create MailService with default options', () => {
      // Reset to ensure fresh state
      ServiceFactory.reset();
      const service = ServiceFactory.getMailService();
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('MailService');
      expect(service._rateLimitMs).toBe(100);
    });

    it('should create MailService with custom options', () => {
      // Reset to ensure fresh state
      ServiceFactory.reset();
      const service = ServiceFactory.getMailService({ rateLimitMs: 200 });
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('MailService');
      expect(service._rateLimitMs).toBe(200);
    });

    it('should create PermissionService', () => {
      const service = ServiceFactory.getPermissionService();
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('PermissionService');
    });

    it('should create PropertiesService', () => {
      const service = ServiceFactory.getPropertiesService();
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('PropertiesService');
    });

    it('should create TriggerService', () => {
      const service = ServiceFactory.getTriggerService();
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('TriggerService');
    });
  });

  describe('Custom Dependency Injection', () => {
    it('should allow overriding logger', () => {
      const customLogger = { info: jest.fn(), error: jest.fn() };

      ServiceFactory.setLogger(customLogger);

      expect(ServiceFactory.getLogger()).toBe(customLogger);
    });

    it('should allow overriding utils', () => {
      const customUtils = { sleep: jest.fn() };

      ServiceFactory.setUtils(customUtils);

      expect(ServiceFactory.getUtils()).toBe(customUtils);
    });

    it('should allow overriding cache', () => {
      const customCache = { get: jest.fn(), put: jest.fn() };

      ServiceFactory.setCache(customCache);

      expect(ServiceFactory.getCache()).toBe(customCache);
    });

    it('should allow overriding exception service', () => {
      const customExceptionService = { executeWithRetry: jest.fn() };

      ServiceFactory.setExceptionService(customExceptionService);

      expect(ServiceFactory.getExceptionService()).toBe(customExceptionService);
    });
  });

  describe('Reset', () => {
    it('should reset all shared instances', () => {
      // Initialize all instances
      ServiceFactory.getLogger();
      ServiceFactory.getUtils();
      ServiceFactory.getCache();
      ServiceFactory.getExceptionService();

      expect(ServiceFactory._logger).not.toBeNull();
      expect(ServiceFactory._utils).not.toBeNull();
      expect(ServiceFactory._cache).not.toBeNull();
      expect(ServiceFactory._exceptionService).not.toBeNull();

      // Reset
      ServiceFactory.reset();

      expect(ServiceFactory._logger).toBeNull();
      expect(ServiceFactory._utils).toBeNull();
      expect(ServiceFactory._cache).toBeNull();
      expect(ServiceFactory._exceptionService).toBeNull();
    });
  });

  describe('Integration', () => {
    it('should reuse shared dependencies across services', () => {
      // Reset to ensure fresh state
      ServiceFactory.reset();

      // Create multiple services
      const drive = ServiceFactory.getDriveService();
      const docs = ServiceFactory.getDocumentService();
      const sheets = ServiceFactory.getSpreadsheetService();

      // All services should be created
      expect(drive).toBeDefined();
      expect(docs).toBeDefined();
      expect(sheets).toBeDefined();

      // Shared dependencies should be the same instance
      const logger = ServiceFactory.getLogger();
      const utils = ServiceFactory.getUtils();
      const exceptionService = ServiceFactory.getExceptionService();

      expect(logger).toBe(ServiceFactory._logger);
      expect(utils).toBe(ServiceFactory._utils);
      expect(exceptionService).toBe(ServiceFactory._exceptionService);
    });

    it('should handle dependency chain correctly', () => {
      // Reset to ensure fresh state
      ServiceFactory.reset();

      // Utils depends on UtilitiesService
      // ExceptionService depends on logger and utils
      // All services depend on these base services

      const service = ServiceFactory.getSpreadsheetService();

      // Verify the dependency chain was initialized
      expect(ServiceFactory._logger).not.toBeNull();
      expect(ServiceFactory._utils).not.toBeNull();
      expect(ServiceFactory._exceptionService).not.toBeNull();
      expect(ServiceFactory._utilitiesService).not.toBeNull();
    });
  });
});
