# API Reference: GasResilienceLib

## CLASS: ExceptionService
**File Path:** `GasResilienceLib/src/ExceptionService.ts`
**Constructor Usage:** `const instance = new ExceptionService();`
**Description:** Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.

### Raw JSDoc Context:
```javascript
/**
 * Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.
 * @class
 */
```

### Methods and properties of ExceptionService

#### PROPERTY: ExceptionService.ABSOLUTE_MAX_ATTEMPTS
- **Scope:** static
- **LLM Call Syntax:** `const result = ExceptionService.ABSOLUTE_MAX_ATTEMPTS;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: ExceptionService.MAX_JITTER_MS
- **Scope:** static
- **LLM Call Syntax:** `const result = ExceptionService.MAX_JITTER_MS;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: ExceptionService.MAX_WAIT_TIME_MS
- **Scope:** static
- **LLM Call Syntax:** `const result = ExceptionService.MAX_WAIT_TIME_MS;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ExceptionService._generateCorrelationId
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService._generateCorrelationId();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a collision-resistant correlation id for tracing a single execution attempt chain.
   * @returns {string} 21-character compact random id.
   */
```
---
#### METHOD: ExceptionService.executeWithAdvancedHandling
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.executeWithAdvancedHandling(func, parameters, options, options.operationName, options.mode, options.maxAttempts, options.correlationId, options.useCircuitBreaker);`
- **Pure JSDoc:**
```javascript
/**
   * Executes a function with classification, retry/backoff, and optional circuit-breaker protection,
   * returning a detailed result object rather than throwing.
   * @param {Function} func Operation to execute; receives `parameters`.
   * @param {Object} [parameters={}] Arguments passed to `func`.
   * @param {Object} [options={}] Execution behavior overrides.
   * @param {string} [options.operationName] Label used in logs/circuit-breaker keys.
   * @param {string} [options.mode] STRICT|LENIENT|RECOVERY.
   * @param {number} [options.maxAttempts] Override for the strategy's max attempts.
   * @param {string} [options.correlationId] Caller-supplied trace id.
   * @param {boolean} [options.useCircuitBreaker] Defaults to true.
   * @returns {Object} Detailed execution result (success, result, attempts, correlationId, error).
   * @throws {Error} If func/parameters/options are invalid.
   */
```
---
#### METHOD: ExceptionService.executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.executeWithRetry(func, parameters, maxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * Executes a function with automatic retry, throwing the underlying error on final failure.
   * @param {Function} func Operation to execute; receives `parameters`.
   * @param {Object} [parameters={}] Arguments passed to `func`.
   * @param {number} [maxAttempts=3] Maximum retry attempts.
   * @returns {*} The operation's return value on success.
   * @throws {Error} If func/parameters/maxAttempts are invalid, or on final failure.
   */
```
---
#### METHOD: ExceptionService.executeWithBypass
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.executeWithBypass(func, parameters, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * Executes a function leniently, returning a fallback value instead of throwing on failure.
   * @param {Function} func Operation to execute; receives `parameters`.
   * @param {Object} [parameters={}] Arguments passed to `func`.
   * @param {*} [defaultValue=null] Value returned when the operation fails.
   * @returns {*} The operation's return value on success, otherwise `defaultValue`.
   * @throws {Error} If func/parameters are invalid.
   */
```
---
#### METHOD: ExceptionService.classifyError
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.classifyError(error);`
- **Pure JSDoc:**
```javascript
/**
   * Classifies an error without executing retry logic.
   * @param {Error|*} error target failure (non-Error throws are wrapped).
   * @returns {Object} error classification state (type, category, recoverable, originalMessage).
   * @throws {Error} If error is null or undefined.
   */
```
---
#### METHOD: ExceptionService.resetStatistics
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.resetStatistics();`
- **Pure JSDoc:**
```javascript
/**
   * Resets accumulated error statistics.
   */
```
---
#### METHOD: ExceptionService.getErrorSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.getErrorSummary();`
- **Pure JSDoc:**
```javascript
/**
   * Gets the current error summary (counters and recovery rate).
   * @returns {Object} Error summary.
   */
```
---
#### METHOD: ExceptionService.printErrorAnalysis
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.printErrorAnalysis();`
- **Pure JSDoc:**
```javascript
/**
   * Logs a human-readable error analysis report.
   */
```
---
#### METHOD: ExceptionService.getStatistics
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.getStatistics();`
- **Pure JSDoc:**
```javascript
/**
   * Gets aggregate execution statistics.
   * @returns {Object} totalAttempts, recoveryRate, and counters.
   */
```
---
#### METHOD: ExceptionService.getCircuitBreaker
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.getCircuitBreaker();`
- **Pure JSDoc:**
```javascript
/**
   * Gets the circuit breaker instance if configured.
   * @returns {Object|null} Circuit breaker instance, or null if not configured.
   */
```
---
#### METHOD: ExceptionService.getCircuitBreakerStatistics
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.getCircuitBreakerStatistics();`
- **Pure JSDoc:**
```javascript
/**
   * Gets circuit breaker statistics.
   * @returns {Object} Statistics, or an empty object if no circuit breaker is configured.
   */
```
---
#### METHOD: ExceptionService.resetCircuit
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.resetCircuit(operationName);`
- **Pure JSDoc:**
```javascript
/**
   * Resets the circuit breaker state for a given operation.
   * @param {string} operationName Operation key to reset.
   * @returns {boolean} True if reset was applied, false if no circuit breaker is configured.
   * @throws {Error} If operationName is missing or not a string.
   */
```
---
#### PROPERTY: ExceptionService.logger
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.logger;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the logger instance used by this service.
   *
   * @returns {Object} Logger instance with error, warn, debug, and info methods
   */
```
---
#### PROPERTY: ExceptionService.utils
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.utils;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the utils instance used by this service.
   *
   * @returns {Object} Utils instance with sleep and other utility methods
   */
```
---
#### PROPERTY: ExceptionService.errorClassifier
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.errorClassifier;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the error classifier instance.
   *
   * @returns {Object} Error classifier instance for manual error classification
   */
```
---
#### PROPERTY: ExceptionService.errorReporter
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.errorReporter;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the error reporter instance.
   *
   * @returns {Object} Error reporter instance for statistics and reporting
   */
```
---
#### PROPERTY: ExceptionService.recoveryManager
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.recoveryManager;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the recovery manager instance.
   *
   * @returns {Object} Recovery manager instance for retry strategies
   */
```
---
#### PROPERTY: ExceptionService.circuitBreaker
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionService.circuitBreaker;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the circuit breaker instance if configured.
   *
   * @returns {Object|null} Circuit breaker instance, or null if not configured
   */
```
---
<br>

## CLASS: ResilienceConfiguration
**File Path:** `GasResilienceLib/src/Configuration.ts`
**Constructor Usage:** `const instance = new ResilienceConfiguration();`
**Description:** Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.

### Raw JSDoc Context:
```javascript
/**
 * Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.
 * @class
 */
```

### Methods and properties of ResilienceConfiguration

#### METHOD: ResilienceConfiguration.getErrorPatterns
- **Scope:** instance
- **LLM Call Syntax:** `const result = resilienceConfiguration.getErrorPatterns();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the comprehensive registry of regex patterns used for diagnostic classification.
   * @returns {Object} Pattern registry.
   */
```
---
#### METHOD: ResilienceConfiguration.getRecoveryStrategies
- **Scope:** instance
- **LLM Call Syntax:** `const result = resilienceConfiguration.getRecoveryStrategies();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the comprehensive map of automated recovery actions keyed by error category.
   * @returns {Object} strategy registry.
   */
```
---
#### METHOD: ResilienceConfiguration.getLimits
- **Scope:** instance
- **LLM Call Syntax:** `const result = resilienceConfiguration.getLimits();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the set of architectural safety constraints and timeouts.
   * @returns {Object} System limits.
   */
```
---
#### METHOD: ResilienceConfiguration.getErrorPattern
- **Scope:** instance
- **LLM Call Syntax:** `const result = resilienceConfiguration.getErrorPattern(type);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a specific error pattern definition by its unique identifier.
   * @param {string} type Pattern key.
   * @returns {Object|undefined} Resolved pattern or undefined.
   */
```
---
#### METHOD: ResilienceConfiguration.getRecoveryStrategy
- **Scope:** instance
- **LLM Call Syntax:** `const result = resilienceConfiguration.getRecoveryStrategy(category);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves the recovery logic for a given category, falling back to the DEFAULT strategy if unmapped.
   * @param {string} category error classification.
   * @returns {Object} execution strategy.
   */
```
---
#### METHOD: ResilienceConfiguration.getLimit
- **Scope:** instance
- **LLM Call Syntax:** `const result = resilienceConfiguration.getLimit(limitName);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves a specific numeric safety threshold by name.
   * @param {string} limitName constraint identifier.
   * @returns {number|undefined} threshold value or undefined.
   */
```
---
#### METHOD: ResilienceConfiguration.createDefault
- **Scope:** static
- **LLM Call Syntax:** `const result = ResilienceConfiguration.createDefault();`
- **Pure JSDoc:**
```javascript
/**
   * Static factory for instantiating a configuration with baseline system settings.
   * @static
   * @returns {ResilienceConfiguration} Default configuration instance.
   */
```
---
<br>

## CLASS: ExceptionServiceMock
**File Path:** `GasResilienceLib/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new ExceptionServiceMock();`
**Description:** High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.
 * @class
 */
```

### Methods and properties of ExceptionServiceMock

#### METHOD: ExceptionServiceMock.setupRetrySuccess
- **Scope:** instance
- **LLM Call Syntax:** `const result = exceptionServiceMock.setupRetrySuccess(failAttempts, error);`
- **Pure JSDoc:**
```javascript
/**
   * Configures the mock to simulate transient failures for a specified number of attempts before successful execution.
   * @param {number} failAttempts Count of sequential failures to simulate.
   * @param {Error} [error] logic exception to throw during failure phase.
   * @returns {this} Scoped mock instance.
   */
```
---
<br>

## CLASS: TimeoutException
**File Path:** `GasResilienceLib/src/internal/exceptions/TimeoutException.ts`
**Constructor Usage:** `const instance = new TimeoutException();`
**Description:** Exception class for execution time violations, categorized as non-recoverable within the current runtime context.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for execution time violations, categorized as non-recoverable within the current runtime context.
 * @class
 * @extends Error
 */
```

<br>

## CLASS: RateLimitExceededException
**File Path:** `GasResilienceLib/src/internal/exceptions/RateLimitExceededException.ts`
**Constructor Usage:** `const instance = new RateLimitExceededException();`
**Description:** Exception class for rate limit violations, signaling that an operation must be suspended and rescheduled due to excessive wait times.

### Raw JSDoc Context:
```javascript
/**
 * Exception class for rate limit violations, signaling that an operation must be suspended and rescheduled due to excessive wait times.
 * @class
 * @extends Error
 */
```

<br>

## CLASS: RecoveryManager
**File Path:** `GasResilienceLib/src/handlers/RecoveryManager.ts`
**Constructor Usage:** `const instance = new RecoveryManager();`
**Description:** Decision engine for error recovery, implementing exponential backoff with jitter and category-specific retry strategies to maintain system stability.

### Raw JSDoc Context:
```javascript
/**
 * Decision engine for error recovery, implementing exponential backoff with jitter and category-specific retry strategies to maintain system stability.
 * @class
 * @private
 */
```

### Methods and properties of RecoveryManager

#### PROPERTY: RecoveryManager.MAX_JITTER_MS
- **Scope:** static
- **LLM Call Syntax:** `const result = RecoveryManager.MAX_JITTER_MS;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### PROPERTY: RecoveryManager.MAX_WAIT_TIME_MS
- **Scope:** static
- **LLM Call Syntax:** `const result = RecoveryManager.MAX_WAIT_TIME_MS;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: RecoveryManager.applyStrategy
- **Scope:** instance
- **LLM Call Syntax:** `const result = recoveryManager.applyStrategy(classification, attempt, mode, customMaxAttempts);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates retry eligibility and executes calculated backoff delays based on error classification and attempt history.
   * @param {Object} classification error diagnostic state (category, recoverable).
   * @param {number} attempt 1-based current attempt count.
   * @param {string} mode execution behavior modifier (STRICT|LENIENT|RECOVERY).
   * @param {number} [customMaxAttempts] optional override for strategy-specific limits.
   * @returns {boolean} True if the operation should be retried after the applied delay.
   * @throws {Error} If classification or attempt parameters are invalid.
   */
```
---
<br>

## CLASS: ErrorReporter
**File Path:** `GasResilienceLib/src/handlers/ErrorReporter.ts`
**Constructor Usage:** `const instance = new ErrorReporter();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of ErrorReporter

#### METHOD: ErrorReporter._sanitizeMessage
- **Scope:** static
- **LLM Call Syntax:** `ErrorReporter._sanitizeMessage();`
- **Pure JSDoc:**
```javascript
/**
   * Sanitizes error messages to remove potential PII.
   */
```
---
#### METHOD: ErrorReporter.reset
- **Scope:** instance
- **LLM Call Syntax:** `errorReporter.reset();`
- **Pure JSDoc:**
```javascript
/**
   * Resets accumulated error statistics and session history.
   */
```
---
#### METHOD: ErrorReporter.record
- **Scope:** instance
- **LLM Call Syntax:** `errorReporter.record(details, details.type, details.operation, details.classification, details.attempt);`
- **Pure JSDoc:**
```javascript
/**
   * Records a FAILURE or RECOVERED event, updating counters and session history.
   * @param {Object} details Event details.
   * @param {string} details.type 'FAILURE' or 'RECOVERED'.
   * @param {string} details.operation Operation label.
   * @param {Object} [details.classification] Required for FAILURE type.
   * @param {number} [details.attempt] Required for RECOVERED type (>= 1).
   * @throws {Error} If details are missing/invalid for the given type.
   */
```
---
#### METHOD: ErrorReporter.getSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = errorReporter.getSummary();`
- **Pure JSDoc:**
```javascript
/**
   * Gets the current error summary (counters and recovery rate).
   * @returns {Object} counters and recoveryRate.
   */
```
---
<br>

## CLASS: ErrorClassifier
**File Path:** `GasResilienceLib/src/handlers/ErrorClassifier.ts`
**Constructor Usage:** `const instance = new ErrorClassifier();`
**Description:** Diagnostic engine for categorizing errors using regex-based pattern matching against messages and stack traces, driving intelligent recovery decisions.

### Raw JSDoc Context:
```javascript
/**
 * Diagnostic engine for categorizing errors using regex-based pattern matching against messages and stack traces, driving intelligent recovery decisions.
 * @class
 * @private
 */
```

### Methods and properties of ErrorClassifier

#### METHOD: ErrorClassifier.classify
- **Scope:** instance
- **LLM Call Syntax:** `const result = errorClassifier.classify(error);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates an error instance against the pattern registry to determine its category and recoverability.
   * @param {Error|Object} error target failure object.
   * @returns {Object} error classification state (type, category, recoverable, originalMessage).
   * @throws {Error} If error is not a valid object.
   */
```
---
#### METHOD: ErrorClassifier.clearCache
- **Scope:** instance
- **LLM Call Syntax:** `errorClassifier.clearCache();`
- **Pure JSDoc:**
```javascript
/**
   * Purges all cached classification results to force re-evaluation of subsequent errors.
   */
```
---
<br>

## CLASS: CircuitBreaker
**File Path:** `GasResilienceLib/src/handlers/CircuitBreaker.ts`
**Constructor Usage:** `const instance = new CircuitBreaker();`
**Description:** Implementation of the Circuit Breaker pattern, preventing cascading failures by monitoring failure rates and gating requests through CLOSED, OPEN, and HALF_OPEN states.

### Raw JSDoc Context:
```javascript
/**
 * Implementation of the Circuit Breaker pattern, preventing cascading failures by monitoring failure rates and gating requests through CLOSED, OPEN, and HALF_OPEN states.
 * @class
 * @private
 */
```

### Methods and properties of CircuitBreaker

#### METHOD: CircuitBreaker._getCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = circuitBreaker._getCacheKey(operationName);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a unique persistence identifier for an operation's state.
   * @private
   * @param {string} operationName target identifier.
   * @returns {string} Fully qualified cache key.
   */
```
---
#### METHOD: CircuitBreaker._loadState
- **Scope:** instance
- **LLM Call Syntax:** `const result = circuitBreaker._loadState(operationName);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the current circuit metadata from cache or synthesizes a baseline state.
   * @private
   * @param {string} operationName target identifier.
   * @returns {Object} circuit state metadata.
   */
```
---
#### METHOD: CircuitBreaker._saveState
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker._saveState(operationName, state);`
- **Pure JSDoc:**
```javascript
/**
   * Commits the current circuit state to the cache tier if available.
   * @private
   * @param {string} operationName target identifier.
   * @param {Object} state Serialized circuit metadata.
   */
```
---
#### METHOD: CircuitBreaker._cleanOldFailures
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker._cleanOldFailures(circuit);`
- **Pure JSDoc:**
```javascript
/**
   * Removes old failures outside the monitoring period.
   * @private
   * @param {Object} circuit - Circuit state object
   */
```
---
#### METHOD: CircuitBreaker.allowRequest
- **Scope:** instance
- **LLM Call Syntax:** `const result = circuitBreaker.allowRequest(operationName);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if a request should be allowed through the circuit breaker.
   *
   * @param {string} operationName - Name of the operation to check
   * @returns {boolean} True if request is allowed, false if circuit is open
   */
```
---
#### METHOD: CircuitBreaker.recordSuccess
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.recordSuccess(operationName);`
- **Pure JSDoc:**
```javascript
/**
   * Records a successful operation execution.
   *
   * @param {string} operationName - Name of the operation
   */
```
---
#### METHOD: CircuitBreaker.recordFailure
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.recordFailure(operationName);`
- **Pure JSDoc:**
```javascript
/**
   * Records a failed operation execution.
   *
   * @param {string} operationName - Name of the operation
   */
```
---
#### METHOD: CircuitBreaker.getState
- **Scope:** instance
- **LLM Call Syntax:** `const result = circuitBreaker.getState(operationName);`
- **Pure JSDoc:**
```javascript
/**
   * Gets the current state of a circuit.
   *
   * @param {string} operationName - Name of the operation
   * @returns {Object} Object containing state, failureCount, and other metrics
   */
```
---
#### METHOD: CircuitBreaker.reset
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.reset(operationName);`
- **Pure JSDoc:**
```javascript
/**
   * Manually resets a circuit to CLOSED state.
   *
   * @param {string} operationName - Name of the operation
   */
```
---
#### METHOD: CircuitBreaker.getStatistics
- **Scope:** instance
- **LLM Call Syntax:** `const result = circuitBreaker.getStatistics();`
- **Pure JSDoc:**
```javascript
/**
   * Gets statistics for all circuits.
   * @returns {Object} Statistics object with circuit states.
   */
```
---
#### METHOD: CircuitBreaker._log
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker._log(message);`
- **Pure JSDoc:**
```javascript
/**
   * Logs a message if logger is available.
   * @private
   * @param {string} message - Message to log
   */
```
---
#### PROPERTY: CircuitBreaker.STATE
- **Scope:** static
- **LLM Call Syntax:** `const result = CircuitBreaker.STATE;`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

