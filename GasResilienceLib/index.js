// ===================================================================
// FILE: GasResilienceLib/index.js
// ===================================================================
// Main entry point for GasResilienceLib ES Module exports
// See README.md for usage, configuration, and error-category reference.
// ===================================================================

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
