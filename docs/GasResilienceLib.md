# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [GasResilienceLib](#gasresiliencelib)

---

## GasResilienceLib

**Version:** 2.0.0   **Layer:** Infrastructure (Layer 0)   **Dependencies:** CoreUtilsLib

### ResilienceConfiguration

**Source:** `GasResilienceLib/src/Configuration.ts`

Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.

**Initialization:**
```javascript
new ResilienceConfiguration()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `createDefault` | `createDefault(): ResilienceConfiguration` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getErrorPatterns` | `getErrorPatterns(): Object` |
| `getRecoveryStrategies` | `getRecoveryStrategies(): Object` |
| `getLimits` | `getLimits(): Object` |
| `getErrorPattern` | `getErrorPattern(type: string): Object|undefined` |
| `getRecoveryStrategy` | `getRecoveryStrategy(category: string): Object` |
| `getLimit` | `getLimit(limitName: string): number|undefined` |


### ExceptionService

**Source:** `GasResilienceLib/src/ExceptionService.ts`

Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.

**Initialization:**
```javascript
new ExceptionService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `ABSOLUTE_MAX_ATTEMPTS` | `ABSOLUTE_MAX_ATTEMPTS: unknown` |
| `MAX_JITTER_MS` | `MAX_JITTER_MS: unknown` |
| `MAX_WAIT_TIME_MS` | `MAX_WAIT_TIME_MS: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_generateCorrelationId` | `_generateCorrelationId(): string` |
| `executeWithAdvancedHandling` | `executeWithAdvancedHandling(func: Function, parameters={}: Object, options={}: Object, options.operationName: string, options.mode: string, options.maxAttempts: number, options.correlationId: string, options.useCircuitBreaker: boolean): Object` |
| `executeWithRetry` | `executeWithRetry(func: Function, parameters={}: Object, maxAttempts=3: number): *` |
| `executeWithBypass` | `executeWithBypass(func: Function, parameters={}: Object, defaultValue=null: *): *` |
| `classifyError` | `classifyError(error: Error|*): Object` |
| `resetStatistics` | `resetStatistics(): void` |
| `getErrorSummary` | `getErrorSummary(): Object` |
| `printErrorAnalysis` | `printErrorAnalysis(): void` |
| `getStatistics` | `getStatistics(): Object` |
| `getCircuitBreaker` | `getCircuitBreaker(): Object|null` |
| `getCircuitBreakerStatistics` | `getCircuitBreakerStatistics(): Object` |
| `resetCircuit` | `resetCircuit(operationName: string): boolean` |
| `logger` | `logger: Object` |
| `utils` | `utils: Object` |
| `errorClassifier` | `errorClassifier: Object` |
| `errorReporter` | `errorReporter: Object` |
| `recoveryManager` | `recoveryManager: Object` |
| `circuitBreaker` | `circuitBreaker: Object|null` |


### CircuitBreaker

**Source:** `GasResilienceLib/src/handlers/CircuitBreaker.ts`

Implementation of the Circuit Breaker pattern, preventing cascading failures by monitoring failure rates and gating requests through CLOSED, OPEN, and HALF_OPEN states.

**Initialization:**
```javascript
new CircuitBreaker()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `STATE` | `STATE: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_getCacheKey` | `_getCacheKey(operationName: string): string` |
| `_loadState` | `_loadState(operationName: string): Object` |
| `_saveState` | `_saveState(operationName: string, state: Object): void` |
| `_cleanOldFailures` | `_cleanOldFailures(circuit: Object): void` |
| `allowRequest` | `allowRequest(operationName: string): boolean` |
| `recordSuccess` | `recordSuccess(operationName: string): void` |
| `recordFailure` | `recordFailure(operationName: string): void` |
| `getState` | `getState(operationName: string): Object` |
| `reset` | `reset(operationName: string): void` |
| `getStatistics` | `getStatistics(): Object` |
| `_log` | `_log(message: string): void` |


### ErrorClassifier

**Source:** `GasResilienceLib/src/handlers/ErrorClassifier.ts`

Diagnostic engine for categorizing errors using regex-based pattern matching against messages and stack traces, driving intelligent recovery decisions.

**Initialization:**
```javascript
new ErrorClassifier()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `classify` | `classify(error: Error|Object): Object` |
| `clearCache` | `clearCache(): void` |


### ErrorReporter

**Source:** `GasResilienceLib/src/handlers/ErrorReporter.ts`

**Initialization:**
```javascript
new ErrorReporter()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `_sanitizeMessage` | `_sanitizeMessage(): void` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `reset` | `reset(): void` |
| `record` | `record(details: Object, details.type: string, details.operation: string, details.classification: Object, details.attempt: number): void` |
| `getSummary` | `getSummary(): Object` |


### RecoveryManager

**Source:** `GasResilienceLib/src/handlers/RecoveryManager.ts`

Decision engine for error recovery, implementing exponential backoff with jitter and category-specific retry strategies to maintain system stability.

**Initialization:**
```javascript
new RecoveryManager()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `MAX_JITTER_MS` | `MAX_JITTER_MS: unknown` |
| `MAX_WAIT_TIME_MS` | `MAX_WAIT_TIME_MS: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `applyStrategy` | `applyStrategy(classification: Object, attempt: number, mode: string, customMaxAttempts: number): boolean` |


### RateLimitExceededException

**Source:** `GasResilienceLib/src/internal/exceptions/RateLimitExceededException.ts`

Exception class for rate limit violations, signaling that an operation must be suspended and rescheduled due to excessive wait times.

**Initialization:**
```javascript
new RateLimitExceededException()
```


### TimeoutException

**Source:** `GasResilienceLib/src/internal/exceptions/TimeoutException.ts`

Exception class for execution time violations, categorized as non-recoverable within the current runtime context.

**Initialization:**
```javascript
new TimeoutException()
```


### ExceptionServiceMock

**Source:** `GasResilienceLib/src/testing/mocks.ts`

High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.

**Initialization:**
```javascript
new ExceptionServiceMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setupRetrySuccess` | `setupRetrySuccess(failAttempts: number, error: Error): this` |


---

