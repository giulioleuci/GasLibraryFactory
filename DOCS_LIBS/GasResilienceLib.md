# API Reference: GasResilienceLib

## CLASS: ExceptionService
**File Path:** `GasResilienceLib/src/ExceptionService.js`
**Constructor Usage:** `const instance = new ExceptionService(logger, utils, dependencies, dependencies.classifier, dependencies.recoveryManager, dependencies.reporter, dependencies.circuitBreaker, dependencies.config);`
**Description:** Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.

### Raw JSDoc Context:
```javascript
/**
 * Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.
 * @class
 */
```

<br>

## CLASS: ResilienceConfiguration
**File Path:** `GasResilienceLib/src/Configuration.js`
**Constructor Usage:** `const instance = new ResilienceConfiguration(overrides, overrides.errorPatterns, overrides.recoveryStrategies, overrides.limits);`
**Description:** Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.

### Raw JSDoc Context:
```javascript
/**
 * Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.
 * @class
 */
```

### Methods of ResilienceConfiguration

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
**File Path:** `GasResilienceLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new ExceptionServiceMock();`
**Description:** High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.
 * @class
 */
```

### Methods of ExceptionServiceMock

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
**File Path:** `GasResilienceLib/src/internal/exceptions/TimeoutException.js`
**Constructor Usage:** `const instance = new TimeoutException(message);`
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
**File Path:** `GasResilienceLib/src/internal/exceptions/RateLimitExceededException.js`
**Constructor Usage:** `const instance = new RateLimitExceededException(operationName, requiredWaitMs, message);`
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
**File Path:** `GasResilienceLib/src/handlers/RecoveryManager.js`
**Constructor Usage:** `const instance = new RecoveryManager(utils, utils.sleep, config);`
**Description:** Decision engine for error recovery, implementing exponential backoff with jitter and category-specific retry strategies to maintain system stability.

### Raw JSDoc Context:
```javascript
/**
 * Decision engine for error recovery, implementing exponential backoff with jitter and category-specific retry strategies to maintain system stability.
 * @class
 * @private
 */
```

### Methods of RecoveryManager

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

## CLASS: ErrorClassifier
**File Path:** `GasResilienceLib/src/handlers/ErrorClassifier.js`
**Constructor Usage:** `const instance = new ErrorClassifier(config);`
**Description:** Diagnostic engine for categorizing errors using regex-based pattern matching against messages and stack traces, driving intelligent recovery decisions.

### Raw JSDoc Context:
```javascript
/**
 * Diagnostic engine for categorizing errors using regex-based pattern matching against messages and stack traces, driving intelligent recovery decisions.
 * @class
 * @private
 */
```

### Methods of ErrorClassifier

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
#### METHOD: ErrorClassifier._hashString
- **Scope:** instance
- **LLM Call Syntax:** `const result = errorClassifier._hashString(str);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a deterministic SHA-256 identifier for an error context.
   * @private
   * @param {string} str diagnostic context string.
   * @returns {string} 64-character hex hash.
   */
```
---
<br>

## CLASS: CircuitBreaker
**File Path:** `GasResilienceLib/src/handlers/CircuitBreaker.js`
**Constructor Usage:** `const instance = new CircuitBreaker(config, logger, cache);`
**Description:** Implementation of the Circuit Breaker pattern, preventing cascading failures by monitoring failure rates and gating requests through CLOSED, OPEN, and HALF_OPEN states.

### Raw JSDoc Context:
```javascript
/**
 * Implementation of the Circuit Breaker pattern, preventing cascading failures by monitoring failure rates and gating requests through CLOSED, OPEN, and HALF_OPEN states.
 * @class
 * @private
 */
```

### Methods of CircuitBreaker

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
<br>

