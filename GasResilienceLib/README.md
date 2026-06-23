# GasResilienceLib

**Version:** 2.0.0  
**Layer:** Infrastructure (Layer 0)  
**Dependencies:** CoreUtilsLib

## 🛡️ Overview

**GasResilienceLib** is the stability backbone of the GasLibraryFactory ecosystem. It provides an enterprise-grade exception handling framework specifically engineered for the Google Apps Script environment.

Google Apps Script executions are prone to transient errors (quotas, network timeouts, service unavailability). This library wraps unstable operations with intelligent recovery logic, ensuring your applications remain robust and self-healing without polluting your business logic with `try-catch` blocks.

## 🏗️ File and Folder Structure

The library separates core resilience logic from custom exception types:

```text
GasResilienceLib/
├── src/
│   ├── ExceptionService.js     # Main facade for exception handling and retry logic
│   ├── Configuration.js        # Global configuration for retry policies and thresholds
│   ├── exceptions/             # Domain-specific exception classes
│   │   ├── RateLimitExceededException.js # Thrown when Google quotas are hit
│   │   └── TimeoutException.js           # Thrown when operations exceed time limits
│   ├── handlers/               # The "engine" room of resilience
│   │   ├── CircuitBreaker.js   # Implements stateful fail-fast logic
│   │   ├── ErrorClassifier.js  # Matches error messages to categories (QUOTA, SERVICE, etc.)
│   │   ├── ErrorReporter.js    # Sanitizes and logs failures (PII redaction)
│   │   └── RecoveryManager.js  # Orchestrates retry strategies based on classification
│   └── __tests__/              # Unit tests for the resilience engine
```

## 🧩 Programming Patterns

1.  **Facade Pattern**: `ExceptionService` provides a unified entry point to the entire resilience framework, hiding the complexity of classification, circuit breaking, and recovery.
2.  **Strategy Pattern**: `RecoveryManager` uses different strategies (e.g., `RETRY_BACKOFF_LONG`, `FAIL_FAST`) depending on the error category returned by the `ErrorClassifier`.
3.  **Decorator / Wrapper Pattern**: The `executeWithRetry` and `executeWithBypass` methods wrap arbitrary functions, adding resilience behavior without modifying the original code.
4.  **Circuit Breaker Pattern**: A stateful machine that tracks failures and "trips" the circuit to prevent cascading failures in external services.
5.  **Chain of Responsibility (Implicit)**: Errors flow through classification, then reporting, then recovery selection.

## ✨ Key Features

- **Intelligent Error Classification**: Automatically categorizes errors (e.g., `QUOTA_EXCEEDED`, `NETWORK_ERROR`, `PERMISSIONS`) using regex pattern matching.
- **Exponential Backoff & Jitter**: Implements sophisticated retry strategies to handle rate limits gracefully without thundering herd problems.
- **Circuit Breaker Pattern**: Prevents cascading failures by temporarily blocking requests to failing services (Open/Half-Open/Closed states).
- **Multiple Execution Modes**:
  - **Strict**: Retries automatically, throws on final failure.
  - **Lenient**: Retries automatically, returns a default value on final failure.
  - **Advanced**: Returns full metadata (attempts, correlation ID, error classification).
- **PII Redaction**: Automatically sanitizes error logs to remove emails, tokens, and keys.
- **Telemetry**: Tracks recovery rates and error statistics per session.

## 📦 Installation

```javascript
import {
  ExceptionService,
  ResilienceConfiguration,
  TimeoutException,
  RateLimitExceededException
} from '@GasResilienceLib';
import { LoggerService, UtilsService } from '@CoreUtilsLib';
```

## Exported Components

**Main Services:**

- `ExceptionService` - Main facade for exception handling and retry logic
- `ResilienceConfiguration` - Configuration for error patterns and recovery strategies

**Custom Exceptions:**

- `TimeoutException` - Thrown when operations exceed time limits
- `RateLimitExceededException` - Thrown when API rate limits are exceeded

**Advanced Components (for custom implementations):**

- `ErrorClassifier` - Classifies errors into categories
- `ErrorReporter` - Logs errors with PII redaction
- `RecoveryManager` - Manages retry strategies
- `CircuitBreaker` - Implements circuit breaker pattern

## 🚀 Quick Start

```javascript
// 1. Initialize dependencies
const logger = new LoggerService();
const utils = new UtilsService((ms) => Utilities.sleep(ms));

// 2. Create the service
const exceptionService = new ExceptionService(logger, utils);

// 3. Wrap a risky operation
const data = exceptionService.executeWithRetry(
  () => SpreadsheetApp.openById('...').getRange('A1').getValue(),
  { context: 'Reading Config' }, // Optional context
  3 // Max attempts
);
```

## 📚 API Reference

### 1. ExceptionService

The main facade for the library.

#### `executeWithRetry(func, parameters, maxAttempts)`

Executes a function with automatic retries. If all attempts fail, it throws the last error.

- **Use case**: Critical operations that must succeed for the script to continue.

#### `executeWithBypass(func, parameters, defaultValue)`

Executes a function with retries. If all attempts fail, it returns `defaultValue` and logs a warning.

- **Use case**: Non-critical data fetching (e.g., optional metadata).

#### `executeWithAdvancedHandling(func, parameters, options)`

The most powerful mode. Returns a result object containing success status, result, attempt count, correlation ID, and detailed error classification.

- **Use case**: Complex flows needing branching logic based on error type.

```javascript
const result = exceptionService.executeWithAdvancedHandling(
  (params) => DriveApp.getFileById(params.id),
  { id: '12345' },
  { operationName: 'GetFile', useCircuitBreaker: true }
);

if (result.success) {
  console.log(`Success after ${result.attempts} attempts`);
} else {
  console.log(`Failed. Error Category: ${result.error.category}`); // e.g., 'QUOTA'
}
```

---

### 2. ResilienceConfiguration

Centralizes configuration for error patterns and recovery strategies. You can inject a custom configuration into `ExceptionService`.

**Default Error Categories:**
| Category | Retry Strategy | Description |
| :--- | :--- | :--- |
| **QUOTA** | Long Backoff | API rate limits (e.g., "Too many requests"). Waits ~60s. |
| **SERVICE** | Standard Backoff | 500/503 errors. Waits ~5s. |
| **NETWORK** | Immediate Retry | Connection resets. Waits ~2s. |
| **FATAL** | No Retry | Syntax errors, Auth errors. Fails immediately. |
| **PERMISSIONS**| No Retry | 403/401 errors. Fails immediately. |

**Custom Configuration Example:**

```javascript
const config = new ResilienceConfiguration({
  recoveryStrategies: {
    QUOTA: { action: 'RETRY_BACKOFF_LONG', maxAttempts: 10, interval: 120000 }
  }
});
const service = new ExceptionService(logger, utils, { config });
```

---

### 3. Circuit Breaker

Implements the Circuit Breaker pattern to protect external systems and save execution time when a service is down.

- **Closed**: Normal operation.
- **Open**: Fails fast (throws immediately) after `failureThreshold` is reached.
- **Half-Open**: Allows a single test request after `resetTimeout`. If successful, closes circuit; otherwise, re-opens.

**Manual Control:**

```javascript
// Check state
const stats = exceptionService.getCircuitBreakerStatistics();

// Manually reset a circuit
exceptionService.resetCircuit('GetFile');
```

---

### 4. Error Reporting & PII Redaction

The `ErrorReporter` (internal) automatically sanitizes logs before writing them.

**Redacted Patterns:**

- Email addresses (`[EMAIL_REDACTED]`)
- Bearer tokens (`[TOKEN_REDACTED]`)
- API Keys (`[KEY_REDACTED]`)
- Credit Card numbers (`[CC_REDACTED]`)

**Statistics:**

```javascript
const stats = exceptionService.getStatistics();
console.log(`Recovery Rate: ${stats.recoveryRate}%`);
```

## 🧪 Testing

This library is designed for high testability. You can inject mock loggers and utilities to test retry logic without waiting for real timeouts.
npm test GasResilienceLib

```

```
