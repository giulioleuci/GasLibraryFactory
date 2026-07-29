# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [GasResilienceLib](#gasresiliencelib)

---

## GasResilienceLib

**Version:** 2.0.0   **Layer:** Infrastructure (Layer 0)   **Dependencies:** CoreUtilsLib

### ResilienceConfiguration

Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.

**Initialization:**
```javascript
new ResilienceConfiguration(overrides={}: Object, overrides.errorPatterns: Object, overrides.recoveryStrategies: Object, overrides.limits: Object)
```

**Static Methods:**

- `createDefault(): ResilienceConfiguration`
  > Static factory for instantiating a configuration with baseline system settings.

**Methods:**

- `getErrorPatterns(): Object`
  > Retrieves the comprehensive registry of regex patterns used for diagnostic classification.

- `getRecoveryStrategies(): Object`
  > Retrieves the comprehensive map of automated recovery actions keyed by error category.

- `getLimits(): Object`
  > Retrieves the set of architectural safety constraints and timeouts.

- `getErrorPattern(type: string): Object|undefined`
  > Resolves a specific error pattern definition by its unique identifier.

- `getRecoveryStrategy(category: string): Object`
  > Resolves the recovery logic for a given category, falling back to the DEFAULT strategy if unmapped.

- `getLimit(limitName: string): number|undefined`
  > Resolves a specific numeric safety threshold by name.


### ExceptionService

Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.

**Initialization:**
```javascript
new ExceptionService(logger: Object, utils: Object, dependencies={}: Object, dependencies.classifier: Object, dependencies.recoveryManager: Object, dependencies.reporter: Object, dependencies.circuitBreaker: Object, dependencies.config: Object)
```


### CircuitBreaker

Circuit breaker implementation for preventing cascading failures

**Initialization:**
```javascript
new CircuitBreaker(config={}: Object, logger: Object|null, cache: Object|null)
```

**Methods:**

- `allowRequest(operationName: string): boolean`
  > Checks if a request should be allowed through the circuit breaker.

- `recordSuccess(operationName: string): void`
  > Records a successful operation execution.

- `recordFailure(operationName: string): void`
  > Records a failed operation execution.

- `getState(operationName: string): Object`
  > Gets the current state of a circuit.

- `reset(operationName: string): void`
  > Manually resets a circuit to CLOSED state.

- `getStatistics(): Object`
  > Gets statistics for all circuits.


### ErrorClassifier

Diagnostic engine for categorizing errors using regex-based pattern matching against messages and stack traces, driving intelligent recovery decisions.

**Initialization:**
```javascript
new ErrorClassifier(config: Object)
```

**Methods:**

- `classify(error: Error|Object): Object`
  > Error classification patterns and configurations. Each classifier defines a regex pattern, category name, and recoverability.

- `clearCache(): void`
  > Purges all cached classification results to force re-evaluation of subsequent errors.


### RecoveryManager

Decision engine for error recovery, implementing exponential backoff with jitter and category-specific retry strategies to maintain system stability.

**Initialization:**
```javascript
new RecoveryManager(utils: Object, utils.sleep: Function, config: Object)
```

**Methods:**

- `applyStrategy(classification: Object, attempt: number, mode: string, customMaxAttempts: number): boolean`
  > Recovery strategies mapped by error category. Each strategy defines the retry action, maximum attempts, and base interval.


### ErrorReporterRecorder

Manager for recording error events and managing session history.

**Initialization:**
```javascript
new ErrorReporterRecorder()
```


### ErrorReporterStatistics

Manager for aggregating error statistics and calculating recovery rates.

**Initialization:**
```javascript
new ErrorReporterStatistics()
```


### RateLimitExceededException

Exception class for rate limit violations, signaling that an operation must be suspended and rescheduled due to excessive wait times.

**Initialization:**
```javascript
new RateLimitExceededException(operationName: string, requiredWaitMs: number, message: string)
```


### TimeoutException

Exception class for execution time violations, categorized as non-recoverable within the current runtime context.

**Initialization:**
```javascript
new TimeoutException(message='Timeout exceeded': string)
```


### ExceptionServiceMock

Centralized high-fidelity mocks for GasResilienceLib services.

**Initialization:**
```javascript
new ExceptionServiceMock()
```


---

