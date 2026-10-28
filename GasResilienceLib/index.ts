// ===================================================================
// FILE: GasResilienceLib/index.js
// ===================================================================
// Main entry point for GasResilienceLib ES Module exports
// See README.md for usage, configuration, and error-category reference.
// ===================================================================

// Export main service
export { ExceptionService } from './src/ExceptionService.js';

// Export custom exceptions
export { TimeoutException } from './src/internal/exceptions/TimeoutException.js';
export { RateLimitExceededException } from './src/internal/exceptions/RateLimitExceededException.js';

// Export configuration
export { ResilienceConfiguration } from './src/Configuration.js';

// Export internal components for advanced use cases
export { ErrorClassifier } from './src/handlers/ErrorClassifier.js';
export { ErrorReporter } from './src/handlers/ErrorReporter.js';
export { RecoveryManager } from './src/handlers/RecoveryManager.js';
export { CircuitBreaker } from './src/handlers/CircuitBreaker.js';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';

export type * from './src/types.js';
export type { ExceptionDependencies } from './src/ExceptionService.js';
