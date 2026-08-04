# API Reference: GasResilienceLib

## CLASS: ExceptionService
**File Path:** `GasResilienceLib/src/ExceptionService.js`
**Constructor Usage:** `const instance = new ExceptionService();`
**Description:** Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.

### Raw JSDoc Context:
```javascript
/**
 * Primary facade for automated error handling, coordinating classification, intelligent retries with backoff, and circuit breaker protection.
 * @class
 */
```

### Methods of ExceptionService

#### METHOD: ExceptionService.ABSOLUTE_MAX_ATTEMPTS
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.ABSOLUTE_MAX_ATTEMPTS();`
- **Pure JSDoc:**
```javascript
/** Method ABSOLUTE_MAX_ATTEMPTS */
```
---
#### METHOD: ExceptionService.MAX_JITTER_MS
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.MAX_JITTER_MS();`
- **Pure JSDoc:**
```javascript
/** Method MAX_JITTER_MS */
```
---
#### METHOD: ExceptionService.MAX_WAIT_TIME_MS
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.MAX_WAIT_TIME_MS();`
- **Pure JSDoc:**
```javascript
/** Method MAX_WAIT_TIME_MS */
```
---
#### METHOD: ExceptionService.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExceptionService.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.if(typeof logger.error !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExceptionService.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.if(typeof logger.warn !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExceptionService.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.if(!utils || typeof utils !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExceptionService.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.if(typeof utils.sleep !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExceptionService.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.if(dependencies !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExceptionService.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.if(dependencies.circuitBreaker);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExceptionService.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.if(dependencies.circuitBreakerConfig);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ExceptionService.logger
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.logger();`
- **Pure JSDoc:**
```javascript
/** Method logger */
```
---
#### METHOD: ExceptionService.utils
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.utils();`
- **Pure JSDoc:**
```javascript
/** Method utils */
```
---
#### METHOD: ExceptionService.errorClassifier
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.errorClassifier();`
- **Pure JSDoc:**
```javascript
/** Method errorClassifier */
```
---
#### METHOD: ExceptionService.errorReporter
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.errorReporter();`
- **Pure JSDoc:**
```javascript
/** Method errorReporter */
```
---
#### METHOD: ExceptionService.recoveryManager
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.recoveryManager();`
- **Pure JSDoc:**
```javascript
/** Method recoveryManager */
```
---
#### METHOD: ExceptionService.circuitBreaker
- **Scope:** instance
- **LLM Call Syntax:** `exceptionService.circuitBreaker();`
- **Pure JSDoc:**
```javascript
/** Method circuitBreaker */
```
---
<br>

## CLASS: ResilienceConfiguration
**File Path:** `GasResilienceLib/src/Configuration.js`
**Constructor Usage:** `const instance = new ResilienceConfiguration();`
**Description:** Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.

### Raw JSDoc Context:
```javascript
/**
 * Immutable configuration container for error handling behavior, managing regex patterns, recovery strategies, and safety limits.
 * @class
 */
```

### Methods of ResilienceConfiguration

#### METHOD: ResilienceConfiguration.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceConfiguration.if(overrides !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
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
**Description:** Centralized high-fidelity mocks for GasResilienceLib services.

/

/**
High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file GasResilienceLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for GasResilienceLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.
 * @class
 */
```

### Methods of ExceptionServiceMock

#### METHOD: ExceptionServiceMock.catch
- **Scope:** instance
- **LLM Call Syntax:** `exceptionServiceMock.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ExceptionServiceMock.if
- **Scope:** instance
- **LLM Call Syntax:** `exceptionServiceMock.if(calls <);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: TimeoutException
**File Path:** `GasResilienceLib/src/internal/exceptions/TimeoutException.js`
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
**File Path:** `GasResilienceLib/src/internal/exceptions/RateLimitExceededException.js`
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

## CLASS: ResilienceStatsTracker
**File Path:** `GasResilienceLib/src/handlers/ResilienceStatsTracker.js`
**Constructor Usage:** `const instance = new ResilienceStatsTracker();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ResilienceStatsTracker

#### METHOD: ResilienceStatsTracker.classifyError
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.classifyError(error);`
- **Pure JSDoc:**
```javascript
/** Method classifyError */
```
---
#### METHOD: ResilienceStatsTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.if(error);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceStatsTracker.resetStatistics
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.resetStatistics();`
- **Pure JSDoc:**
```javascript
/** Method resetStatistics */
```
---
#### METHOD: ResilienceStatsTracker.getErrorSummary
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.getErrorSummary();`
- **Pure JSDoc:**
```javascript
/** Method getErrorSummary */
```
---
#### METHOD: ResilienceStatsTracker.printErrorAnalysis
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.printErrorAnalysis();`
- **Pure JSDoc:**
```javascript
/** Method printErrorAnalysis */
```
---
#### METHOD: ResilienceStatsTracker.getStatistics
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.getStatistics();`
- **Pure JSDoc:**
```javascript
/** Method getStatistics */
```
---
#### METHOD: ResilienceStatsTracker.getCircuitBreaker
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.getCircuitBreaker();`
- **Pure JSDoc:**
```javascript
/** Method getCircuitBreaker */
```
---
#### METHOD: ResilienceStatsTracker.getCircuitBreakerStatistics
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.getCircuitBreakerStatistics();`
- **Pure JSDoc:**
```javascript
/** Method getCircuitBreakerStatistics */
```
---
#### METHOD: ResilienceStatsTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.if(!this.facade._circuitBreaker);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceStatsTracker.resetCircuit
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.resetCircuit(operationName);`
- **Pure JSDoc:**
```javascript
/** Method resetCircuit */
```
---
#### METHOD: ResilienceStatsTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.if(!operationName || typeof operationName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceStatsTracker.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceStatsTracker.if(!this.facade._circuitBreaker);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ResilienceExecutionHandler
**File Path:** `GasResilienceLib/src/handlers/ResilienceExecutionHandler.js`
**Constructor Usage:** `const instance = new ResilienceExecutionHandler();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ResilienceExecutionHandler

#### METHOD: ResilienceExecutionHandler.executeWithAdvancedHandling
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.executeWithAdvancedHandling(func, parameters, options);`
- **Pure JSDoc:**
```javascript
/** Method executeWithAdvancedHandling */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(typeof func !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(parameters !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(typeof options !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(options.maxAttempts !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(options.correlationId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.while
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.while(attempt < absoluteMaxAttempts);`
- **Pure JSDoc:**
```javascript
/** Method while */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(useCircuitBreaker && this.facade._circuitBreaker);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(recovered);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(useCircuitBreaker && this.facade._circuitBreaker);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.executeWithRetry
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.executeWithRetry(func, parameters, maxAttempts);`
- **Pure JSDoc:**
```javascript
/** Method executeWithRetry */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(typeof func !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(parameters !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(result.success);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.executeWithBypass
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.executeWithBypass(func, parameters, defaultValue);`
- **Pure JSDoc:**
```javascript
/** Method executeWithBypass */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(parameters);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(arguments.length < 3);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(typeof func !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(parameters !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ResilienceExecutionHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `resilienceExecutionHandler.if(result.success);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: RecoveryManager
**File Path:** `GasResilienceLib/src/handlers/RecoveryManager.js`
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

### Methods of RecoveryManager

#### METHOD: RecoveryManager.MAX_JITTER_MS
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.MAX_JITTER_MS();`
- **Pure JSDoc:**
```javascript
/** Method MAX_JITTER_MS */
```
---
#### METHOD: RecoveryManager.MAX_WAIT_TIME_MS
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.MAX_WAIT_TIME_MS();`
- **Pure JSDoc:**
```javascript
/** Method MAX_WAIT_TIME_MS */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(!utils || typeof utils !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(typeof utils.sleep !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(config !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.applyStrategy
- **Scope:** instance
- **LLM Call Syntax:** `const result = recoveryManager.applyStrategy(classification, attempt, mode, customMaxAttempts);`
- **Pure JSDoc:**
```javascript
/**
     * Recovery strategies mapped by error category.
     * Each strategy defines the retry action, maximum attempts, and base interval.
     * @private
     */
    // GRL-M002: Use configuration object instead of hard-coded values
    if (config && typeof config.getRecoveryStrategies === 'function') {
      this._strategies = config.getRecoveryStrategies();
      this._config = config;
    } else {
      // Fallback to default strategies for backward compatibility
      this._strategies = {
        DEFAULT: {
          action: 'RETRY_BACKOFF',
          maxAttempts: 3,
          interval: 2000 // 2 seconds base interval
        },
        FATAL: {
          action: 'NOTIFY_ADMIN',
          maxAttempts: 1
        },
        QUOTA: {
          action: 'RETRY_BACKOFF_LONG',
          maxAttempts: 3,
          interval: 60000 // 1 minute base interval
        },
        SERVICE: {
          action: 'RETRY_BACKOFF',
          maxAttempts: 5,
          interval: 5000 // 5 seconds base interval
        },
        NETWORK: {
          action: 'RETRY_IMMEDIATE',
          maxAttempts: 3,
          interval: 2000 // 2 seconds base interval
        },
        PERMISSIONS: {
          action: 'NOTIFY_ADMIN',
          maxAttempts: 1
        }
      };
      this._config = null;
    }
  }

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
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(!classification || typeof classification !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(typeof classification.category !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(typeof classification.recoverable !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(customMaxAttempts !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(mode);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(attempt >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(mode !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: RecoveryManager.if
- **Scope:** instance
- **LLM Call Syntax:** `recoveryManager.if(effectiveStrategy.interval > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ErrorReporter
**File Path:** `GasResilienceLib/src/handlers/ErrorReporter.js`
**Constructor Usage:** `const instance = new ErrorReporter();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ErrorReporter

#### METHOD: ErrorReporter.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporter.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporter.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporter.if(typeof logger.error !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporter.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporter.if(typeof logger.warn !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ErrorClassifier
**File Path:** `GasResilienceLib/src/handlers/ErrorClassifier.js`
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

### Methods of ErrorClassifier

#### METHOD: ErrorClassifier.if
- **Scope:** instance
- **LLM Call Syntax:** `errorClassifier.if(config !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorClassifier.classify
- **Scope:** instance
- **LLM Call Syntax:** `const result = errorClassifier.classify(error);`
- **Pure JSDoc:**
```javascript
/**
     * Error classification patterns and configurations.
     * Each classifier defines a regex pattern, category name, and recoverability.
     * @private
     */
    // GRL-M002: Use configuration object instead of hard-coded values
    if (config && typeof config.getErrorPatterns === 'function') {
      this._classifiers = config.getErrorPatterns();
    } else {
      // Fallback to default patterns for backward compatibility
      // Note: Patterns are evaluated in order - more specific patterns should come first
      this._classifiers = {
        // Fatal errors that should never be retried (must come first)
        AUTH_REQUIRED: {
          pattern: /authorization is required|access_token/i,
          category: 'FATAL',
          recoverable: false
        },
        SCRIPT_ERROR: {
          pattern: /script error|syntax error|reference error|type error|is not a function/i,
          category: 'FATAL',
          recoverable: false
        },
        // Recoverable and non-recoverable errors
        // TIMEOUT must come before QUOTA to prevent `limit.*exceeded` from matching
        // across message+stack boundary of TimeoutException errors
        TIMEOUT: {
          pattern: /timeout|time.*limit|execution.*time.*exceeded|exceeded.*time/i,
          category: 'TIMEOUT',
          recoverable: false
        },
        QUOTA_EXCEEDED: {
          pattern: /quota|limit.*exceeded|too many (requests|times)|service invoked too many/i,
          category: 'QUOTA',
          recoverable: true
        },
        PERMISSION_DENIED: {
          pattern: /permission.*(denied|to access)|unauthorized|you do not have permission/i,
          category: 'PERMISSIONS',
          recoverable: false
        },
        SERVICE_UNAVAILABLE: {
          pattern: /service.*(unavailable|error|failed)|503/i,
          category: 'SERVICE',
          recoverable: true
        },
        NOT_FOUND: {
          pattern: /not found|(?:^|\s)404(?:\s|$)/i,
          category: 'NOT_FOUND',
          recoverable: false
        },
        NETWORK_ERROR: {
          pattern: /network.*error|connection.*(refused|failed)|failed to establish connection/i,
          category: 'NETWORK',
          recoverable: true
        }
      };
    }

    // GRL-M004: Cache for classification results to avoid re-classifying the same errors
    this._classificationCache = new Map();
    this._cacheMaxSize = 100; // Limit cache size to prevent memory issues
  }

  /**
   * Evaluates an error instance against the pattern registry to determine its category and recoverability.
   * @param {Error|Object} error target failure object.
   * @returns {Object} error classification state (type, category, recoverable, originalMessage).
   * @throws {Error} If error is not a valid object.
   */
```
---
#### METHOD: ErrorClassifier.if
- **Scope:** instance
- **LLM Call Syntax:** `errorClassifier.if(!error || typeof error !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorClassifier.if
- **Scope:** instance
- **LLM Call Syntax:** `errorClassifier.if(!classification);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorClassifier.if
- **Scope:** instance
- **LLM Call Syntax:** `errorClassifier.if(this._classificationCache.size >);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
**File Path:** `GasResilienceLib/src/handlers/CircuitBreaker.js`
**Constructor Usage:** `const instance = new CircuitBreaker();`
**Description:** Circuit breaker implementation for preventing cascading failures

/

/**
Implementation of the Circuit Breaker pattern, preventing cascading failures by monitoring failure rates and gating requests through CLOSED, OPEN, and HALF_OPEN states.
@class
@private

### Raw JSDoc Context:
```javascript
/**
 * @file GasResilienceLib/src/handlers/CircuitBreaker.js
 * @description Circuit breaker implementation for preventing cascading failures
 * @version 1.0 - GRL-H007
 */

/**
 * Implementation of the Circuit Breaker pattern, preventing cascading failures by monitoring failure rates and gating requests through CLOSED, OPEN, and HALF_OPEN states.
 * @class
 * @private
 */
```

### Methods of CircuitBreaker

#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(typeof config !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(this._failureThreshold < 1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(this._successThreshold < 1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(this._resetTimeout < 1000);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(this._monitoringPeriod < 1000);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(!this._cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(cached);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.catch
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(!this._cache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.catch
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
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
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(!operationName || typeof operationName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.switch
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.switch(circuit.state);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(circuit.nextAttemptTime && now >);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(!operationName || typeof operationName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(circuit.state);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(circuit.consecutiveSuccesses >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(circuit.state);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(stateChanged);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(!operationName || typeof operationName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(circuit.state);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(circuit.state);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(circuit.failures.length >);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(!operationName || typeof operationName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(!operationName || typeof operationName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: CircuitBreaker.if
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.if(this._logger && typeof this._logger.info);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CircuitBreaker.STATE
- **Scope:** instance
- **LLM Call Syntax:** `circuitBreaker.STATE();`
- **Pure JSDoc:**
```javascript
/** Method STATE */
```
---
<br>

## CLASS: ErrorReporterStatistics
**File Path:** `GasResilienceLib/src/handlers/internal/ErrorReporterStatistics.js`
**Constructor Usage:** `const instance = new ErrorReporterStatistics();`
**Description:** Manager for aggregating error statistics and calculating recovery rates.

### Raw JSDoc Context:
```javascript
/**
 * @file GasResilienceLib/src/handlers/managers/ErrorReporterStatistics.js
 * @description Manager for aggregating error statistics and calculating recovery rates.
 */
```

### Methods of ErrorReporterStatistics

#### METHOD: ErrorReporterStatistics.getSummary
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterStatistics.getSummary();`
- **Pure JSDoc:**
```javascript
/** Method getSummary */
```
---
<br>

## CLASS: ErrorReporterSanitizer
**File Path:** `GasResilienceLib/src/handlers/internal/ErrorReporterSanitizer.js`
**Constructor Usage:** `const instance = new ErrorReporterSanitizer();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: ErrorReporterRecorder
**File Path:** `GasResilienceLib/src/handlers/internal/ErrorReporterRecorder.js`
**Constructor Usage:** `const instance = new ErrorReporterRecorder();`
**Description:** Manager for recording error events and managing session history.

### Raw JSDoc Context:
```javascript
/**
 * @file GasResilienceLib/src/handlers/managers/ErrorReporterRecorder.js
 * @description Manager for recording error events and managing session history.
 */
```

### Methods of ErrorReporterRecorder

#### METHOD: ErrorReporterRecorder.reset
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.reset();`
- **Pure JSDoc:**
```javascript
/** Method reset */
```
---
#### METHOD: ErrorReporterRecorder.record
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.record(details);`
- **Pure JSDoc:**
```javascript
/** Method record */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(!details || typeof details !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(!details.type || typeof details.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(!details.operation || typeof details.operation !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(details.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(!details.classification || typeof details.classification !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(!details.classification.type || typeof details.classification.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(details.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(typeof details.attempt !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(this.facade._sessionErrors.length > MAX_SESSION_ERRORS);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(details.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ErrorReporterRecorder.if
- **Scope:** instance
- **LLM Call Syntax:** `errorReporterRecorder.if(details.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

