// ===================================================================
// FILE: GoogleApiWrapper/index.js
// ===================================================================
// Main entry point for GoogleApiWrapper ES Module exports
// ===================================================================

/**
 * GoogleApiWrapper - Comprehensive wrapper for Google Workspace APIs
 *
 * @module GoogleApiWrapper
 *
 * @description
 * GoogleApiWrapper is a comprehensive library for working with Google Apps Script services.
 * It provides a clean, consistent API for interacting with Google Drive, Documents, Spreadsheets,
 * and other Google Workspace services with built-in error handling and resilience.
 *
 * ## Architecture
 *
 * GoogleApiWrapper follows a **layered architecture** with service-oriented design:
 *
 * 1. **Base Layer**: GoogleService abstract base class provides common functionality
 * 2. **Service Layer**: Specialized services (DriveService, SpreadsheetService, etc.)
 * 3. **Utility Layer**: Batch operations, rate limiting, error handling
 * 4. **Factory Layer**: ServiceFactory for centralized dependency injection
 *
 * ### Design Patterns
 *
 * - **Service Factory Pattern**: Centralized DI container for managing service instances
 * - **Advanced Service Integration**: Native use of Drive, Sheets, Docs, and Gmail advanced services
 * - **Fluent API**: Method chaining for readable, composable code
 * - **Error Recovery**: Automatic retry with exponential backoff via GasResilienceLib integration
 *
 * ## Key Features
 *
 * - **Resilient Error Handling**: Integrates with GasResilienceLib for automatic retry and error recovery
 * - **Fluent API**: Method chaining for cleaner, more readable code
 * - **Comprehensive Services**: Full coverage of Google Workspace APIs (10 services)
 * - **Native Batching**: Uses built-in batch capabilities of Advanced Services (where available)
 * - **Rate Limiting**: Token bucket algorithm to prevent quota exhaustion
 * - **Service Factory**: Centralized DI for consistent service instantiation
 * - **Error Classes**: Specialized exceptions (QuotaExceeded, PermissionDenied, etc.)
 * - **Well-Documented**: Extensive JSDoc comments and examples
 *
 * ## Dependencies
 *
 * - **CoreUtilsLib** (Layer 0): LoggerService, UtilsService, HashUtils
 * - **GasResilienceLib** (Layer 1): ExceptionService for error recovery
 * - **External**: None (pure Google Apps Script APIs)
 *
 * ## Exported Components
 *
 * ### Core Services (Re-exported from CoreUtilsLib)
 * - `LoggerService` - Structured logging with log levels (from @CoreUtilsLib)
 * - `UtilsService` - 60+ utility methods (from @CoreUtilsLib)
 *
 * ### Google Workspace Services
 * - `DriveService` - Google Drive file/folder operations
 * - `SpreadsheetService` - Google Sheets operations
 * - `DocumentService` - Google Docs operations
 * - `MailService` - Gmail sending with attachments
 * - `PermissionService` - File sharing and permissions
 * - `CacheService` - Script/User/Document cache operations
 * - `PropertiesService` - Script/User/Document properties storage
 * - `TriggerService` - Time-based and event-based triggers
 * - `LockService` - Script/User/Document locks for concurrency
 * - `UtilitiesService` - Utilities wrapper (sleep, formatDate, etc.)
 *
 * ### Utilities
 * - `RateLimiter` - Token bucket rate limiting
 * - `MenuBuilder` - Fluent API for Google Workspace menus
 * - `SidebarBuilder` - Fluent API for sidebars
 * - `DialogBuilder` - Fluent API for dialogs
 *
 * ### Core Classes
 * - `GoogleService` - Abstract base class for all services
 * - `ServiceFactory` - Dependency injection container
 *
 * ### Error Handling
 * - `ErrorHandler` - Centralized error handling
 * - `ServiceError` - Base error class
 * - `QuotaExceededError` - Quota/rate limit errors
 * - `PermissionDeniedError` - Permission errors
 * - `ResourceNotFoundError` - Not found errors
 * - `ServiceUnavailableError` - Service unavailable errors
 * - `ValidationError` - Input validation errors
 *
 * ## Quick Start
 *
 * ### Basic Usage with Manual DI
 *
 * ```javascript
 * import { LoggerService, UtilsService, DriveService, CacheService } from '@GoogleApiWrapper';
 * import { ExceptionService } from '@GasResilienceLib';
 *
 * // Initialize dependencies
 * const logger = new LoggerService();
 * const utils = new UtilsService();
 * const cacheService = new CacheService(logger);
 * const cache = cacheService.getScriptCache();
 * const exceptionService = new ExceptionService(logger, utils);
 *
 * // Create a Drive service
 * const driveService = new DriveService(logger, cache, utils, exceptionService);
 *
 * // Create a folder with automatic retry
 * const folder = driveService.createFolder('My Reports', null, true, true).getResult();
 * console.log('Folder created:', folder.getName());
 * ```
 *
 * ### Using ServiceFactory (Recommended)
 *
 * ```javascript
 * import { ServiceFactory } from '@GoogleApiWrapper';
 *
 * // Get pre-configured services from factory
 * const driveService = ServiceFactory.getDriveService();
 * const spreadsheetService = ServiceFactory.getSpreadsheetService();
 *
 * // Services are ready to use with all dependencies injected
 * const folder = driveService.createFolder('Reports').getResult();
 * const sheet = spreadsheetService.createSpreadsheet('Data').getResult();
 * ```
 *
 * ### Batch Operations
 *
 * ```javascript
 * import { DriveService } from '@GoogleApiWrapper';
 *
 * const driveService = ServiceFactory.getDriveService();
 *
 * // Operations on multiple items are performed individually with retry
 * const result = driveService.deleteFiles(['id1', 'id2', 'id3']);
 * console.log(`Deleted: ${result.successful.length}`);
 * ```
 *
 * ### Rate Limiting
 *
 * ```javascript
 * import { RateLimiter } from '@GoogleApiWrapper';
 *
 * // Create rate limiter: 100 operations per minute
 * const limiter = new RateLimiter(100, 60000);
 *
 * function processItems(items) {
 *   items.forEach(item => {
 *     limiter.acquire(1); // Wait if necessary
 *     // Process item
 *   });
 * }
 * ```
 *
 * ### Error Handling
 *
 * ```javascript
 * import { DriveService, QuotaExceededError, PermissionDeniedError } from '@GoogleApiWrapper';
 *
 * const driveService = ServiceFactory.getDriveService();
 *
 * try {
 *   const folder = driveService.createFolder('Reports').getResult();
 * } catch (error) {
 *   if (error instanceof QuotaExceededError) {
 *     console.error('Quota exceeded, retry later');
 *   } else if (error instanceof PermissionDeniedError) {
 *     console.error('Permission denied');
 *   } else {
 *     throw error;
 *   }
 * }
 * ```
 *
 * ## Integration with Other Libraries
 *
 * GoogleApiWrapper is used by higher-level libraries:
 *
 * - **WorkspaceTemplateEngine**: Uses DocumentService, SpreadsheetService for template processing
 * - **SheetDBLib**: Uses SpreadsheetService for database operations
 * - **JobRunnerLib**: Uses PropertiesService, TriggerService for job persistence
 * - **ContextEngine**: Uses DriveService, SpreadsheetService for data providers
 * - **GasDataImporter**: Uses SpreadsheetService for ETL operations
 * - **DomainRepositoryLib**: Uses SheetDBLib (which uses GoogleApiWrapper)
 *
 * ## Backward Compatibility
 *
 * GoogleApiWrapper re-exports LoggerService and UtilsService from CoreUtilsLib for backward
 * compatibility. **New code should import directly from @CoreUtilsLib:**
 *
 * ```javascript
 * // ✅ Recommended (new code)
 * import { LoggerService, UtilsService } from '@CoreUtilsLib';
 *
 * // ⚠️ Deprecated (backward compatibility only)
 * import { LoggerService, UtilsService } from '@GoogleApiWrapper';
 * ```
 *
 * @version 3.0.0
 * @author GasLibraryFactory
 * @license MIT
 *
 * @see {@link module:CoreUtilsLib} for LoggerService and UtilsService documentation
 * @see {@link module:GasResilienceLib} for error recovery and retry logic
 */

// Core services - Re-exported from CoreUtilsLib for backward compatibility.
// @deprecated Import LoggerService/UtilsService directly from `@CoreUtilsLib`.
// The canonical home for these L0 classes is CoreUtilsLib; this re-export exists
// only so older `@GoogleApiWrapper` imports keep working and may be removed in a
// future major version. (WP-06 / F-3.3)
export { LoggerService, UtilsService } from '@CoreUtilsLib';

// Google-specific utilities (remain in GoogleApiWrapper)
export { RateLimiter } from './src/internal/RateLimiter';
export { MenuBuilder } from './src/builders/MenuBuilder';
export { SidebarBuilder } from './src/builders/SidebarBuilder';
export { DialogBuilder } from './src/builders/DialogBuilder';

// Core base classes
export { GoogleService } from './src/internal/core/GoogleService';

// Service Factory - Centralized dependency injection
export { ServiceFactory } from './src/internal/core/ServiceFactory';

// Error handling
export {
  ErrorHandler,
  ServiceError,
  QuotaExceededError,
  PermissionDeniedError,
  ResourceNotFoundError,
  ServiceUnavailableError,
  ValidationError
} from './src/internal/core/ErrorHandler';

// Google Workspace services
export { CacheService, Cache } from './src/services/CacheService';
export { DocumentService } from './src/services/DocumentService';
export { DriveService } from './src/services/DriveService';
export { LockService } from './src/services/LockService';
export { MailService } from './src/services/MailService';
export { PermissionService } from './src/services/PermissionService';
export { PropertiesService } from './src/services/PropertiesService';
export { SpreadsheetService } from './src/services/SpreadsheetService';
export { TriggerService } from './src/services/TriggerService';
export { UiService } from './src/services/UiService';
export { UserService } from './src/services/UserService';
export { UtilitiesService } from './src/services/UtilitiesService';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
