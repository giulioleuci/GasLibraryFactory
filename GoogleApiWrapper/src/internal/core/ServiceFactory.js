/**
 * @file GoogleApiWrapper/src/core/ServiceFactory.js
 * @description Centralized service container for dependency injection.
 * Provides factory methods to create fully-wired service instances.
 * @version 1.0 - Initial implementation
 */

import { LoggerService, UtilsService } from '@CoreUtilsLib';
import { ExceptionService } from '@GasResilienceLib';
import { CacheService } from '../../services/CacheService.js';
import { UtilitiesService } from '../../services/UtilitiesService.js';
import { DriveService } from '../../services/DriveService.js';
import { DocumentService } from '../../services/DocumentService.js';
import { SpreadsheetService } from '../../services/SpreadsheetService.js';
import { MailService } from '../../services/MailService.js';
import { PermissionService } from '../../services/PermissionService.js';
import { PropertiesService } from '../../services/PropertiesService.js';
import { TriggerService } from '../../services/TriggerService.js';
import { UiService } from '../../services/UiService.js';
import { UserService } from '../../services/UserService.js';

/**
 * @class ServiceFactory
 * @description Centralized Dependency Injection (DI) and Singleton container for GoogleApiWrapper services. Manages lazy initialization of shared infrastructure (logging, caching, resiliency) and provides consistent factory methods for all service wrappers.
 * 
 * @static
 * @property {LoggerService} _logger Shared diagnostic logger.
 * @property {UtilsService} _utils Shared foundational utilities.
 * @property {Cache} _cache Shared persistence provider.
 * @property {ExceptionService} _exceptionService Shared resiliency handler.
 * @property {Object} _config Global service configuration.
 */
export class ServiceFactory {
  // Shared instances (lazy-initialized)
  static _logger = null;
  static _utils = null;
  static _cache = null;
  static _exceptionService = null;
  static _utilitiesService = null;

  // Configuration
  static _config = {
    logLevel: 'INFO',
    cacheExpiration: 300, // seconds
    mailRateLimitMs: 100
  };

  /**
   * @static
   * @description Updates global service configuration via shallow merge. Resets shared instances to apply new settings to subsequent service requests. Must be called before service instantiation to ensure consistent dependency states.
   * @param {Object} config Partial configuration object.
   * @param {string} [config.logLevel='INFO'] Logging verbosity ('OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG').
   * @param {number} [config.cacheExpiration=300] Default cache TTL in seconds.
   * @param {number} [config.mailRateLimitMs=100] Minimum delay (ms) between mail operations.
   */
  static configure(config = {}) {
    ServiceFactory._config = { ...ServiceFactory._config, ...config };

    // Reset shared instances to pick up new config (but keep the config)
    ServiceFactory.reset(false);
  }

  /**
   * @static
   * @description Resets shared service instances. Optionally restores configuration to defaults. Primarily for test state isolation.
   * @param {boolean} [resetConfig=true] If true, restores default values to _config.
   */
  static reset(resetConfig = true) {
    ServiceFactory._logger = null;
    ServiceFactory._utils = null;
    ServiceFactory._cache = null;
    ServiceFactory._cacheService = null;
    ServiceFactory._exceptionService = null;
    ServiceFactory._utilitiesService = null;

    if (resetConfig) {
      ServiceFactory._config = {
        logLevel: 'INFO',
        cacheExpiration: 300,
        mailRateLimitMs: 100
      };
    }
  }

  /**
   * @static
   * @description Returns singleton LoggerService instance, lazy-initialized with current _config.logLevel.
   * @returns {LoggerService} Shared diagnostic logger.
   */
  static getLogger() {
    if (!ServiceFactory._logger) {
      ServiceFactory._logger = new LoggerService({
        level: ServiceFactory._config.logLevel
      });
    }
    return ServiceFactory._logger;
  }

  /**
   * @static
   * @description Returns singleton UtilitiesService instance (GAS native API wrapper).
   * @returns {UtilitiesService} Shared GAS utility wrapper.
   */
  static getUtilitiesService() {
    if (!ServiceFactory._utilitiesService) {
      const logger = ServiceFactory.getLogger();
      ServiceFactory._utilitiesService = new UtilitiesService(logger);
    }
    return ServiceFactory._utilitiesService;
  }

  /**
   * @static
   * @description Returns singleton UtilsService instance (CoreUtilsLib). Injects sleepFn from UtilitiesService.
   * @returns {UtilsService} Shared foundational utility provider.
   */
  static getUtils() {
    if (!ServiceFactory._utils) {
      const utilitiesService = ServiceFactory.getUtilitiesService();
      // Inject sleep function from UtilitiesService
      ServiceFactory._utils = new UtilsService((ms) => utilitiesService.sleep(ms));
    }
    return ServiceFactory._utils;
  }

  /**
   * @static
   * @description Returns singleton Script Cache instance (GAS CacheService.getScriptCache()).
   * @returns {Cache} Shared script-level persistence provider.
   */
  static getCache() {
    if (!ServiceFactory._cache) {
      ServiceFactory._cache = ServiceFactory.getCacheService().getScriptCache();
    }
    return ServiceFactory._cache;
  }

  /**
   * @static
   * @description Returns the singleton CacheService instance (GAS CacheService wrapper).
   * Prefer {@link ServiceFactory.getCache} for the script cache itself; this exposes the
   * service object for callers that need user/document caches or the service directly.
   * @returns {CacheService} Shared cache service wrapper.
   */
  static getCacheService() {
    if (!ServiceFactory._cacheService) {
      ServiceFactory._cacheService = new CacheService(ServiceFactory.getLogger());
    }
    return ServiceFactory._cacheService;
  }

  /**
   * @static
   * @description Returns singleton ExceptionService instance (GasResilienceLib) for resilient execution.
   * @returns {ExceptionService} Shared resiliency and retry handler.
   */
  static getExceptionService() {
    if (!ServiceFactory._exceptionService) {
      const logger = ServiceFactory.getLogger();
      const utils = ServiceFactory.getUtils();
      ServiceFactory._exceptionService = new ExceptionService(logger, utils);
    }
    return ServiceFactory._exceptionService;
  }

  // ===================================================================
  // SERVICE FACTORY METHODS
  // ===================================================================

  /**
   * @static
   * @description Creates a new DriveService instance with injected shared dependencies.
   * @returns {DriveService}
   */
  static getDriveService() {
    return new DriveService(
      ServiceFactory.getLogger(),
      ServiceFactory.getCache(),
      ServiceFactory.getUtils(),
      ServiceFactory.getExceptionService()
    );
  }

  /**
   * @static
   * @description Creates a new DocumentService instance with injected shared dependencies.
   * @returns {DocumentService}
   */
  static getDocumentService() {
    return new DocumentService(
      ServiceFactory.getLogger(),
      ServiceFactory.getCache(),
      ServiceFactory.getUtils(),
      ServiceFactory.getExceptionService()
    );
  }

  /**
   * @static
   * @description Creates a new SpreadsheetService instance with injected shared dependencies.
   * @returns {SpreadsheetService}
   */
  static getSpreadsheetService() {
    return new SpreadsheetService(
      ServiceFactory.getLogger(),
      ServiceFactory.getCache(),
      ServiceFactory.getUtils(),
      ServiceFactory.getExceptionService()
    );
  }

  /**
   * @static
   * @description Creates a new MailService instance with injected shared dependencies and optional configuration.
   * @param {Object} [options={}] Rate limiting overrides.
   * @returns {MailService}
   */
  static getMailService(options = {}) {
    const mailOptions = {
      rateLimitMs: options.rateLimitMs || ServiceFactory._config.mailRateLimitMs
    };

    return new MailService(
      ServiceFactory.getLogger(),
      ServiceFactory.getUtils(),
      ServiceFactory.getExceptionService(),
      mailOptions
    );
  }

  /**
   * @static
   * @description Creates a new PermissionService instance with injected shared dependencies.
   * @returns {PermissionService}
   */
  static getPermissionService() {
    return new PermissionService(
      ServiceFactory.getLogger(),
      ServiceFactory.getCache(),
      ServiceFactory.getUtils(),
      ServiceFactory.getExceptionService()
    );
  }

  /**
   * @static
   * @description Creates a new PropertiesService instance with injected shared dependencies.
   * @returns {PropertiesService}
   */
  static getPropertiesService() {
    return new PropertiesService(
      ServiceFactory.getLogger(),
      ServiceFactory.getUtils(),
      ServiceFactory.getExceptionService()
    );
  }

  /**
   * @static
   * @description Creates a new TriggerService instance with injected shared dependencies.
   * @returns {TriggerService}
   */
  static getTriggerService() {
    return new TriggerService(
      ServiceFactory.getLogger(),
      ServiceFactory.getUtils(),
      ServiceFactory.getExceptionService()
    );
  }

  /**
   * @static
   * @description Creates a new UiService instance with injected shared dependencies and auto-detected host UI.
   * @returns {UiService}
   */
  static getUiService() {
    return new UiService(
      ServiceFactory.getLogger(),
      ServiceFactory.getCache(),
      ServiceFactory.getUtils(),
      ServiceFactory.getExceptionService()
    );
  }

  /**
   * @static
   * @description Creates a new UserService instance with injected shared dependencies.
   * @returns {UserService}
   */
  static getUserService() {
    return new UserService(ServiceFactory.getLogger());
  }

  // ===================================================================
  // ADVANCED: CUSTOM DEPENDENCY INJECTION
  // ===================================================================

  /**
   * @static
   * @description Overrides the shared logger instance.
   * @param {Object} logger Custom logger instance.
   */
  static setLogger(logger) {
    ServiceFactory._logger = logger;
  }

  /**
   * @static
   * @description Overrides the shared utils instance.
   * @param {Object} utils Custom utils instance.
   */
  static setUtils(utils) {
    ServiceFactory._utils = utils;
  }

  /**
   * @static
   * @description Overrides the shared cache instance.
   * @param {Object} cache Custom cache instance.
   */
  static setCache(cache) {
    ServiceFactory._cache = cache;
  }

  /**
   * @static
   * @description Overrides the shared exception service instance.
   * @param {Object} exceptionService Custom exception service instance.
   */
  static setExceptionService(exceptionService) {
    ServiceFactory._exceptionService = exceptionService;
  }
}
