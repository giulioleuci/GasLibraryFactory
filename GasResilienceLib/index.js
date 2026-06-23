// ===================================================================
// FILE: GasResilienceLib/index.js
// ===================================================================
// Main entry point for GasResilienceLib ES Module exports
// ===================================================================

/**
 * GasResilienceLib - Advanced Exception Handling Library for Google Apps Script
 *
 * @module GasResilienceLib
 *
 * @description
 * GasResilienceLib provides a robust, production-ready exception handling system for
 * Google Apps Script applications. It features automatic error classification, intelligent
 * retry strategies with exponential backoff, circuit breaker patterns, and comprehensive
 * error statistics tracking.
 *
 * ## Key Features
 *
 * ### Core Capabilities
 * - **Automatic Error Classification**: Machine learning-inspired classifier identifies error types
 *   using hash-based pattern matching (quota, permissions, service, network, timeout, etc.)
 * - **Intelligent Retry Strategies**: Exponential backoff with jitter, customized per error category
 * - **Circuit Breaker Pattern**: Automatically prevents cascading failures by temporarily disabling
 *   failing operations after threshold is reached
 * - **Multiple Execution Modes**: Choose between strict (fail-fast), recovery (retry), or lenient
 *   (return null on failure) error handling
 * - **Error Statistics**: Track recovery rates, failure patterns, and error frequency across your application
 * - **Custom Exceptions**: Built-in specialized exception types (TimeoutException, RateLimitExceededException)
 * - **PII Redaction**: Automatically redacts sensitive data from error messages before logging
 * - **Comprehensive Logging**: Detailed logging of failures, recoveries, retry attempts, and circuit breaker state
 *
 * ### Architecture
 * - **Zero External Dependencies**: Uses only CoreUtilsLib for HashUtils (error classification)
 * - **Composable Design**: Internal handlers (Classifier, Reporter, RecoveryManager, CircuitBreaker)
 *   can be used independently or together
 * - **Synchronous-Only**: No async/await due to GAS V8 limitations
 * - **Production-Ready**: Extensively tested with 300+ unit tests
 *
 * ## Exported Services & Classes
 *
 * ### Main Service
 * - **ExceptionService**: Primary facade for exception handling with retry logic
 *
 * ### Custom Exceptions
 * - **TimeoutException**: Thrown when operations exceed configured time limits
 * - **RateLimitExceededException**: Thrown when API rate limits are exceeded
 *
 * ### Configuration
 * - **ResilienceConfiguration**: Immutable configuration for error patterns and recovery strategies
 *
 * ### Advanced Components (for custom implementations)
 * - **ErrorClassifier**: Classifies errors into categories using hash-based pattern matching
 * - **ErrorReporter**: Manages error statistics and reporting with PII redaction
 * - **RecoveryManager**: Implements retry strategies with exponential backoff and jitter
 * - **CircuitBreaker**: Implements circuit breaker pattern to prevent cascading failures
 *
 * ## Quick Start
 *
 * ### Basic Usage
 * ```javascript
 * import { ExceptionService } from '@GasResilienceLib';
 * import { LoggerService, UtilsService } from '@CoreUtilsLib';
 *
 * // 1. Create dependencies
 * const logger = new LoggerService();
 * const utils = new UtilsService();
 *
 * // 2. Create the exception service
 * const exceptionService = new ExceptionService(logger, utils);
 *
 * // 3. Wrap operations with automatic retry
 * const data = exceptionService.executeWithRetry(
 *   () => SpreadsheetApp.getActiveSpreadsheet().getRange('A1:B10').getValues(),
 *   {},
 *   3 // max attempts (default: 3)
 * );
 * ```
 *
 * ### With Custom Configuration
 * ```javascript
 * import { ExceptionService, ResilienceConfiguration } from '@GasResilienceLib';
 *
 * // Create custom configuration
 * const config = new ResilienceConfiguration({
 *   retryIntervals: {
 *     QUOTA: 120000,  // 2 minutes for quota errors
 *     SERVICE: 10000  // 10 seconds for service errors
 *   },
 *   maxAttempts: 5,
 *   executionMode: 'RECOVERY'
 * });
 *
 * const exceptionService = new ExceptionService(logger, utils, config);
 * ```
 *
 * ### Circuit Breaker Pattern
 * ```javascript
 * import { CircuitBreaker } from '@GasResilienceLib';
 *
 * const circuitBreaker = new CircuitBreaker(logger, {
 *   failureThreshold: 5,      // Open after 5 failures
 *   recoveryTimeout: 60000,   // Try again after 1 minute
 *   successThreshold: 2       // Close after 2 successes
 * });
 *
 * const result = circuitBreaker.execute(
 *   () => callUnreliableExternalAPI()
 * );
 * ```
 *
 * ## Error Categories & Retry Behavior
 *
 * The library classifies errors into these categories with specific retry strategies:
 *
 * | Category | Recoverable | Default Backoff | Common Causes |
 * |----------|-------------|-----------------|---------------|
 * | **QUOTA** | ✅ Yes | 60 seconds | API quota exceeded, rate limiting |
 * | **SERVICE** | ✅ Yes | 5 seconds | Service temporarily unavailable |
 * | **NETWORK** | ✅ Yes | 2 seconds | Network connectivity issues |
 * | **GENERIC** | ✅ Yes | 3 seconds | Unknown/unclassified errors |
 * | **PERMISSIONS** | ❌ No | N/A | Permission denied, authorization failures |
 * | **NOT_FOUND** | ❌ No | N/A | Resource not found (404) |
 * | **TIMEOUT** | ❌ No | N/A | Operation timeout exceeded |
 *
 * ## Execution Modes
 *
 * Configure error handling behavior with three execution modes:
 *
 * - **STRICT**: Fail immediately, throw all errors (default)
 * - **RECOVERY**: Attempt recovery with retry for recoverable errors
 * - **LENIENT**: Return null on failure, never throw (use with caution)
 *
 * ## Integration with Other Libraries
 *
 * GasResilienceLib is used throughout the GasLibraryFactory monorepo:
 *
 * - **GoogleApiWrapper**: Wraps all Google API calls with resilience
 * - **SheetDBLib**: Recovers from transient sheet access errors
 * - **ContextEngine**: Handles provider execution failures gracefully
 * - **GasDataImporter**: Retries failed ETL operations
 * - **PipelineFramework**: Integrates with step execution error handling
 *
 * @see ExceptionService for main API documentation
 * @see ResilienceConfiguration for configuration options
 * @see ErrorClassifier for error classification details
 *
 * @version 2.0.0
 * @author GasLibraryFactory
 * @license MIT
 */

// Export main service
export { ExceptionService } from './src/ExceptionService';

// Export custom exceptions
export { TimeoutException } from './src/internal/exceptions/TimeoutException';
export { RateLimitExceededException } from './src/internal/exceptions/RateLimitExceededException';

// Export configuration
export { ResilienceConfiguration } from './src/Configuration';

// Export internal components for advanced use cases
export { ErrorClassifier } from './src/handlers/ErrorClassifier';
export { ErrorReporter } from './src/handlers/ErrorReporter';
export { RecoveryManager } from './src/handlers/RecoveryManager';
export { CircuitBreaker } from './src/handlers/CircuitBreaker';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
