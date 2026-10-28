# API Reference: CoreUtilsLib

## CLASS: ValidationUtils
**File Path:** `CoreUtilsLib/src/ValidationUtils.ts`
**Constructor Usage:** `const instance = new ValidationUtils();`
**Description:** Centralized utilities for static dependency and parameter validation across libraries.

### Raw JSDoc Context:
```javascript
/**
 * Centralized utilities for static dependency and parameter validation across libraries.
 * @class
 */
```

### Methods and properties of ValidationUtils

#### PROPERTY: ValidationUtils.LOGGER_METHODS
- **Scope:** static
- **LLM Call Syntax:** `const result = ValidationUtils.LOGGER_METHODS;`
- **Pure JSDoc:**
```javascript
/**
   * Required methods for a valid logger interface.
   * @static
   * @type {string[]}
   */
```
---
#### METHOD: ValidationUtils.validateLogger
- **Scope:** static
- **LLM Call Syntax:** `const result = ValidationUtils.validateLogger(logger, context);`
- **Pure JSDoc:**
```javascript
/**
   * Validates that a logger object has all required logging methods.
   *
   * A valid logger must be a non-null object with debug, info, warn, and error
   * methods that are all functions.
   *
   * @param {Object} logger - The logger object to validate
   * @param {string} [context='ValidationUtils'] - Context for error messages (class/function name)
   * @returns {boolean} True if validation passes
   * @throws {Error} If logger is missing or invalid
   *
   * @example
   * // In a constructor
   * constructor(logger) {
   *   ValidationUtils.validateLogger(logger, 'MyService');
   *   this._logger = logger;
   * }
   *
   * @example
   * // Throws descriptive error
   * ValidationUtils.validateLogger(null, 'MyService');
   * // Error: 'MyService: logger is required and must be an object'
   *
   * ValidationUtils.validateLogger({ debug: 'not a function' }, 'MyService');
   * // Error: 'MyService: logger.debug must be a function'
   */
```
---
#### METHOD: ValidationUtils.validateDependency
- **Scope:** static
- **LLM Call Syntax:** `const result = ValidationUtils.validateDependency(dependency, name, context, requiredMethods, required);`
- **Pure JSDoc:**
```javascript
/**
   * Validates a dependency object, optionally checking for required methods.
   *
   * Validates that a dependency is a non-null object and optionally verifies
   * that it has specific methods that are functions.
   *
   * @param {Object} dependency - The dependency object to validate
   * @param {string} name - The name of the dependency (for error messages)
   * @param {string} [context='ValidationUtils'] - Context for error messages
   * @param {string[]} [requiredMethods=[]] - Array of method names that must exist
   * @param {boolean} [required=true] - If false, allows null/undefined (optional dependency)
   * @returns {boolean} True if validation passes
   * @throws {Error} If validation fails for a required dependency
   *
   * @example
   * // Required dependency with method validation
   * ValidationUtils.validateDependency(utils, 'utils', 'MyService', ['sleep', 'delay']);
   *
   * @example
   * // Optional dependency (won't throw if null)
   * ValidationUtils.validateDependency(cache, 'cache', 'MyService', ['get', 'put'], false);
   *
   * @example
   * // Simple object validation without method checking
   * ValidationUtils.validateDependency(config, 'config', 'MyService');
   */
```
---
<br>

## CLASS: MyUtilsService
**File Path:** `CoreUtilsLib/src/UtilsService.ts`
**Constructor Usage:** `const instance = new MyUtilsService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

<br>

## CLASS: TypeGuards
**File Path:** `CoreUtilsLib/src/TypeGuards.ts`
**Constructor Usage:** `const instance = new TypeGuards();`
**Description:** Static type guard utilities for consistent runtime value validation.

### Raw JSDoc Context:
```javascript
/**
 * Static type guard utilities for consistent runtime value validation.
 * @class
 */
```

### Methods and properties of TypeGuards

#### METHOD: TypeGuards.isString
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isString(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a string (primitive or String object).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a string
   *
   * @example
   * TypeGuards.isString('hello');  // true
   * TypeGuards.isString(123);      // false
   * TypeGuards.isString(null);     // false
   */
```
---
#### METHOD: TypeGuards.isNonEmptyString
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isNonEmptyString(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a non-empty string (not just whitespace).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a non-empty string
   *
   * @example
   * TypeGuards.isNonEmptyString('hello');  // true
   * TypeGuards.isNonEmptyString('  ');     // false
   * TypeGuards.isNonEmptyString('');       // false
   * TypeGuards.isNonEmptyString(null);     // false
   */
```
---
#### METHOD: TypeGuards.isNumber
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isNumber(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a number (excluding NaN).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a valid number
   *
   * @example
   * TypeGuards.isNumber(123);     // true
   * TypeGuards.isNumber(3.14);    // true
   * TypeGuards.isNumber(NaN);     // false
   * TypeGuards.isNumber('123');   // false
   */
```
---
#### METHOD: TypeGuards.isFiniteNumber
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isFiniteNumber(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a finite number (not Infinity, -Infinity, or NaN).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a finite number
   *
   * @example
   * TypeGuards.isFiniteNumber(123);        // true
   * TypeGuards.isFiniteNumber(Infinity);   // false
   * TypeGuards.isFiniteNumber(NaN);        // false
   */
```
---
#### METHOD: TypeGuards.isInteger
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isInteger(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is an integer.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is an integer
   *
   * @example
   * TypeGuards.isInteger(123);    // true
   * TypeGuards.isInteger(3.14);   // false
   * TypeGuards.isInteger('123');  // false
   */
```
---
#### METHOD: TypeGuards.isPositiveInteger
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isPositiveInteger(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a positive integer (> 0).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a positive integer
   *
   * @example
   * TypeGuards.isPositiveInteger(1);     // true
   * TypeGuards.isPositiveInteger(0);     // false
   * TypeGuards.isPositiveInteger(-1);    // false
   */
```
---
#### METHOD: TypeGuards.isNonNegativeInteger
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isNonNegativeInteger(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a non-negative integer (>= 0).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a non-negative integer
   *
   * @example
   * TypeGuards.isNonNegativeInteger(0);   // true
   * TypeGuards.isNonNegativeInteger(1);   // true
   * TypeGuards.isNonNegativeInteger(-1);  // false
   */
```
---
#### METHOD: TypeGuards.isBoolean
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isBoolean(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a boolean.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a boolean
   *
   * @example
   * TypeGuards.isBoolean(true);   // true
   * TypeGuards.isBoolean(false);  // true
   * TypeGuards.isBoolean(1);      // false
   * TypeGuards.isBoolean('true'); // false
   */
```
---
#### METHOD: TypeGuards.isPlainObject
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isPlainObject(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a plain object (not null, array, Date, etc.).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a plain object
   *
   * @example
   * TypeGuards.isPlainObject({});           // true
   * TypeGuards.isPlainObject({ a: 1 });     // true
   * TypeGuards.isPlainObject(null);         // false
   * TypeGuards.isPlainObject([]);           // false
   * TypeGuards.isPlainObject(new Date());   // false
   */
```
---
#### METHOD: TypeGuards.isObject
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isObject(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is an object (not null, can be array or other object types).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is an object
   *
   * @example
   * TypeGuards.isObject({});     // true
   * TypeGuards.isObject([]);     // true
   * TypeGuards.isObject(null);   // false
   */
```
---
#### METHOD: TypeGuards.isNonEmptyObject
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isNonEmptyObject(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a non-empty plain object.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a non-empty plain object
   *
   * @example
   * TypeGuards.isNonEmptyObject({ a: 1 });  // true
   * TypeGuards.isNonEmptyObject({});        // false
   * TypeGuards.isNonEmptyObject([1]);       // false
   */
```
---
#### METHOD: TypeGuards.isArray
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isArray(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is an array.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is an array
   *
   * @example
   * TypeGuards.isArray([]);          // true
   * TypeGuards.isArray([1, 2, 3]);   // true
   * TypeGuards.isArray('array');     // false
   */
```
---
#### METHOD: TypeGuards.isNonEmptyArray
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isNonEmptyArray(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a non-empty array.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a non-empty array
   *
   * @example
   * TypeGuards.isNonEmptyArray([1, 2]);  // true
   * TypeGuards.isNonEmptyArray([]);      // false
   * TypeGuards.isNonEmptyArray(null);    // false
   */
```
---
#### METHOD: TypeGuards.isArrayOf
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isArrayOf(value, typeCheck);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is an array of a specific type.
   *
   * @param {*} value - The value to check
   * @param {Function} typeCheck - Type checking function to apply to each element
   * @returns {boolean} True if value is an array and all elements pass typeCheck
   *
   * @example
   * TypeGuards.isArrayOf([1, 2, 3], TypeGuards.isNumber);      // true
   * TypeGuards.isArrayOf(['a', 'b'], TypeGuards.isString);     // true
   * TypeGuards.isArrayOf([1, 'a'], TypeGuards.isNumber);       // false
   * TypeGuards.isArrayOf([], TypeGuards.isNumber);             // true (empty array)
   */
```
---
#### METHOD: TypeGuards.isFunction
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isFunction(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a function.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a function
   *
   * @example
   * TypeGuards.isFunction(() => {});     // true
   * TypeGuards.isFunction(function() {}); // true
   * TypeGuards.isFunction(class {});     // true
   * TypeGuards.isFunction(null);         // false
   */
```
---
#### METHOD: TypeGuards.isNil
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isNil(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is null or undefined.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is null or undefined
   *
   * @example
   * TypeGuards.isNil(null);       // true
   * TypeGuards.isNil(undefined);  // true
   * TypeGuards.isNil(0);          // false
   * TypeGuards.isNil('');         // false
   */
```
---
#### METHOD: TypeGuards.isNull
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isNull(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is null.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is null
   */
```
---
#### METHOD: TypeGuards.isUndefined
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isUndefined(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is undefined.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is undefined
   */
```
---
#### METHOD: TypeGuards.isDefined
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isDefined(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is defined (not null and not undefined).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is defined
   *
   * @example
   * TypeGuards.isDefined(0);          // true
   * TypeGuards.isDefined('');         // true
   * TypeGuards.isDefined(null);       // false
   * TypeGuards.isDefined(undefined);  // false
   */
```
---
#### METHOD: TypeGuards.isValidDate
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isValidDate(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a Date object and is valid (not Invalid Date).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a valid Date
   *
   * @example
   * TypeGuards.isValidDate(new Date());              // true
   * TypeGuards.isValidDate(new Date('invalid'));     // false
   * TypeGuards.isValidDate('2025-01-15');            // false (string, not Date)
   */
```
---
#### METHOD: TypeGuards.isRegExp
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isRegExp(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a RegExp.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a RegExp
   */
```
---
#### METHOD: TypeGuards.isPromise
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isPromise(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a Promise (or thenable).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a Promise or thenable
   *
   * @example
   * TypeGuards.isPromise(Promise.resolve());         // true
   * TypeGuards.isPromise({ then: () => {} });        // true (thenable)
   * TypeGuards.isPromise({});                        // false
   */
```
---
#### METHOD: TypeGuards.isError
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isError(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is an Error or Error-like object.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is an Error
   *
   * @example
   * TypeGuards.isError(new Error('test'));           // true
   * TypeGuards.isError(new TypeError('test'));       // true
   * TypeGuards.isError({ message: 'test' });         // false
   */
```
---
#### METHOD: TypeGuards.isEmpty
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isEmpty(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is empty (empty string, empty array, empty object, null, undefined).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is empty
   *
   * @example
   * TypeGuards.isEmpty('');        // true
   * TypeGuards.isEmpty([]);        // true
   * TypeGuards.isEmpty({});        // true
   * TypeGuards.isEmpty(null);      // true
   * TypeGuards.isEmpty(0);         // false
   * TypeGuards.isEmpty([1]);       // false
   */
```
---
<br>

## CLASS: Result
**File Path:** `CoreUtilsLib/src/Result.ts`
**Constructor Usage:** `const instance = new Result();`
**Description:** Base outcome wrapper. An outcome is considered successful when it carries no
error. Subclasses may layer additional semantics (explicit success flags,
frozen immutability, richer payloads) on top of this contract.

### Raw JSDoc Context:
```javascript
/**
 * Base outcome wrapper. An outcome is considered successful when it carries no
 * error. Subclasses may layer additional semantics (explicit success flags,
 * frozen immutability, richer payloads) on top of this contract.
 *
 * @class Result
 */
```

### Methods and properties of Result

#### METHOD: Result.isSuccess
- **Scope:** instance
- **LLM Call Syntax:** `const result = result.isSuccess();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {boolean} True when no error is attached.
   */
```
---
#### METHOD: Result.isError
- **Scope:** instance
- **LLM Call Syntax:** `const result = result.isError();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {boolean} True when an error is attached.
   */
```
---
#### METHOD: Result.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = result.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {Object} JSON-safe representation (errors reduced to their message).
   */
```
---
#### METHOD: Result.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = result.toString();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {string} Brief diagnostic status string.
   */
```
---
#### METHOD: Result.ok
- **Scope:** static
- **LLM Call Syntax:** `const result = Result.ok(value);`
- **Pure JSDoc:**
```javascript
/**
   * @param {*} [value=null] Success payload.
   * @returns {Result} Success-state result.
   * @static
   */
```
---
#### METHOD: Result.fail
- **Scope:** static
- **LLM Call Syntax:** `const result = Result.fail(error);`
- **Pure JSDoc:**
```javascript
/**
   * @param {Error} error Failure cause.
   * @returns {Result} Failure-state result.
   * @static
   */
```
---
#### METHOD: Result.empty
- **Scope:** static
- **LLM Call Syntax:** `const result = Result.empty();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {Result} Empty success-state result.
   * @static
   */
```
---
<br>

## CLASS: LoggerService
**File Path:** `CoreUtilsLib/src/LoggerService.ts`
**Constructor Usage:** `const instance = new LoggerService();`
**Description:** Hierarchical logging service with structured output and lazy evaluation.

### Raw JSDoc Context:
```javascript
/**
 * Hierarchical logging service with structured output and lazy evaluation.
 * @class LoggerService
 */
```

### Methods and properties of LoggerService

#### METHOD: LoggerService.setLevel
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.setLevel(level);`
- **Pure JSDoc:**
```javascript
/**
   * Update the active logging threshold.
   * @param {string} level - New filter threshold identifier.
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService.getLevel
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.getLevel();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieve the current logging threshold.
   * @returns {string} Threshold identifier.
   */
```
---
#### METHOD: LoggerService._isLevelActive
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService._isLevelActive(level);`
- **Pure JSDoc:**
```javascript
/**
   * Validate if a specific threshold is eligible for logging.
   * @private
   * @param {string} level - Level to test.
   * @returns {boolean} True if the level meets the active threshold.
   */
```
---
#### METHOD: LoggerService._safeStringify
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService._safeStringify(obj, maxDepth, maxLength);`
- **Pure JSDoc:**
```javascript
/**
   * Safely serialize an object with circular reference and depth protection.
   * @private
   * @param {*} obj - Payload to stringify.
   * @param {number} [maxDepth=5] - Recursion limit.
   * @param {number} [maxLength=5000] - Output character limit.
   * @returns {string} JSON-formatted string with truncation markers.
   */
```
---
#### METHOD: LoggerService._evaluateMessage
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService._evaluateMessage(messageOrCallback);`
- **Pure JSDoc:**
```javascript
/**
   * Resolve a message or execute a lazy-evaluation callback.
   * @private
   * @param {string|Object|Function} messageOrCallback - Static payload or generator.
   * @returns {string|Object} Evaluated content.
   */
```
---
#### METHOD: LoggerService._formatMessage
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService._formatMessage(level, message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Compose a formatted log entry string.
   * @private
   * @param {string} level - Threshold identifier.
   * @param {string|Object} message - Evaluated content.
   * @param {Object} [context=null] - Optional diagnostic metadata.
   * @returns {string} Standardized log line.
   */
```
---
#### METHOD: LoggerService._currentPosition
- **Scope:** instance
- **LLM Call Syntax:** `loggerService._currentPosition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: LoggerService._resolvePosition
- **Scope:** instance
- **LLM Call Syntax:** `loggerService._resolvePosition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: LoggerService._emit
- **Scope:** instance
- **LLM Call Syntax:** `loggerService._emit();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: LoggerService.withPosition
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.withPosition();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: LoggerService.debug
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.debug(message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Log a DEBUG message with optional context and lazy evaluation.
   * @param {string|Object|Function} message - Content or callback.
   * @param {Object|Function} [context=null] - Metadata or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService.info
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.info(message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Log an INFO message with optional context and lazy evaluation.
   * @param {string|Object|Function} message - Content or callback.
   * @param {Object|Function} [context=null] - Metadata or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService.warn
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.warn(message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Log a WARN message with optional context and lazy evaluation.
   * @param {string|Object|Function} message - Content or callback.
   * @param {Object|Function} [context=null] - Metadata or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService.error
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.error(message, context);`
- **Pure JSDoc:**
```javascript
/**
   * Log an ERROR message with optional context and lazy evaluation.
   * @param {string|Object|Function} message - Content or callback.
   * @param {Object|Function} [context=null] - Metadata or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.get();`
- **Pure JSDoc:**
```javascript
/**
   * Extract all buffered messages from the global GAS Logger.
   * @returns {string[]} Ordered collection of log entries.
   */
```
---
#### METHOD: LoggerService.clear
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Purge all buffered messages from the global GAS Logger.
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService.log
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.log(level, message);`
- **Pure JSDoc:**
```javascript
/**
   * Log a message at a dynamic threshold level.
   * @param {string} level - Priority threshold for this entry.
   * @param {string|Object|Function} message - Content or callback.
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService._writeStructured
- **Scope:** instance
- **LLM Call Syntax:** `loggerService._writeStructured();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: LoggerService.logJobStart
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logJobStart();`
- **Pure JSDoc:**
```javascript
/** Start a job invocation. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logJobResume
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logJobResume();`
- **Pure JSDoc:**
```javascript
/** Resume a persisted job invocation. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logJobEnd
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logJobEnd();`
- **Pure JSDoc:**
```javascript
/** Finish a job invocation. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logJobSuspended
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logJobSuspended();`
- **Pure JSDoc:**
```javascript
/** Suspend a resumable job invocation. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logBatchStart
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logBatchStart();`
- **Pure JSDoc:**
```javascript
/** Start a batch. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logItemStart
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logItemStart();`
- **Pure JSDoc:**
```javascript
/** Start a batch item. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logStep
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logStep();`
- **Pure JSDoc:**
```javascript
/** Emit a generic tree step. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logPipelineStart
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logPipelineStart();`
- **Pure JSDoc:**
```javascript
/** Start a pipeline trace. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logPipelineStep
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logPipelineStep();`
- **Pure JSDoc:**
```javascript
/** Emit a pipeline step result. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logSummary
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.logSummary();`
- **Pure JSDoc:**
```javascript
/** Emit a duration summary. @returns {LoggerService} */
```
---
#### METHOD: LoggerService.logJobReport
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.logJobReport(details);`
- **Pure JSDoc:**
```javascript
/**
   * Emit a multi-line end-of-job report (job type, run count, cumulative real
   * duration across every timeout-resume, task totals, skip and failure detail).
   * `saltati` (skipped tasks) is excluded from "Eseguiti con successo"; its line
   * is printed only when the caller passes it.
   * @param {{jobType: string, runCount?: number, totalDurationMs?: number, totale?: number, falliti?: number, dettagliFalliti?: string[], saltati?: number, dettagliSaltati?: string[]}} details
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService.child
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.child(prefix);`
- **Pure JSDoc:**
```javascript
/**
   * Spawn a namespaced logger with a message prefix.
   * @param {string} prefix - Namespace identifier.
   * @returns {Object} Proxy object with level-specific logging methods.
   */
```
---
<br>

## CLASS: SystemScriptSettings
**File Path:** `CoreUtilsLib/src/utils/SystemScriptSettings.ts`
**Constructor Usage:** `const instance = new SystemScriptSettings();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of SystemScriptSettings

#### METHOD: SystemScriptSettings.deepClone
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.deepClone(obj);`
- **Pure JSDoc:**
```javascript
/**
   * Creates a full recursive copy of the provided value using deep cloning logic.
   * @param {*} obj Value to clone.
   * @returns {*} Deeply cloned instance.
   */
```
---
#### METHOD: SystemScriptSettings.deepMerge
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.deepMerge(objects);`
- **Pure JSDoc:**
```javascript
/**
   * Deeply merges multiple source objects into a new target object.
   * @param {...Object} objects Source objects for merging.
   * @returns {Object} New consolidated object.
   */
```
---
#### METHOD: SystemScriptSettings.getNestedProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.getNestedProperty(obj, path, defaultValue);`
- **Pure JSDoc:**
```javascript
/**
   * Safely retrieves a value from a nested object structure using a path string.
   * @param {Object} obj Target object to query.
   * @param {string} path Dot-notation or array path to property.
   * @param {*} [defaultValue=null] Value to return if path resolution fails.
   * @returns {*} Resolved property value or default.
   */
```
---
#### METHOD: SystemScriptSettings.setNestedProperty
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.setNestedProperty(obj, path, value);`
- **Pure JSDoc:**
```javascript
/**
   * Safely assigns a value to a nested object property, creating intermediate objects if necessary.
   * @param {Object} obj Target object to modify.
   * @param {string} path Dot-notation or array path to property.
   * @param {*} value Value to assign.
   * @returns {Object} The modified root object.
   */
```
---
#### METHOD: SystemScriptSettings.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.has(obj, path);`
- **Pure JSDoc:**
```javascript
/**
   * Checks for the existence of a specific property path within an object.
   * @param {Object} obj Object to query.
   * @param {string|Array} path Property path to verify.
   * @returns {boolean} True if the path exists.
   */
```
---
#### METHOD: SystemScriptSettings.pick
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.pick(obj, paths);`
- **Pure JSDoc:**
```javascript
/**
   * Creates a new object containing only the specified property paths from the source.
   * @param {Object} obj Source object.
   * @param {...(string|string[])} paths Property paths to include.
   * @returns {Object} New object with selected properties.
   */
```
---
#### METHOD: SystemScriptSettings.omit
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.omit(obj, paths);`
- **Pure JSDoc:**
```javascript
/**
   * Creates a new object by excluding specified property paths from the source.
   * @param {Object} obj Source object.
   * @param {...(string|string[])} paths Property paths to remove.
   * @returns {Object} New object without specified properties.
   */
```
---
#### METHOD: SystemScriptSettings.mapKeys
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.mapKeys(obj, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a new object with keys transformed by the provided iteratee function.
   * @param {Object} obj Source object.
   * @param {Function} iteratee Key transformation logic.
   * @returns {Object} Object with mapped keys.
   */
```
---
#### METHOD: SystemScriptSettings.mapValues
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemScriptSettings.mapValues(obj, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a new object with values transformed by the provided iteratee function.
   * @param {Object} obj Source object.
   * @param {Function} iteratee Value transformation logic.
   * @returns {Object} Object with mapped values.
   */
```
---
<br>

## CLASS: SystemEnvironmentUtils
**File Path:** `CoreUtilsLib/src/utils/SystemEnvironmentUtils.ts`
**Constructor Usage:** `const instance = new SystemEnvironmentUtils();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of SystemEnvironmentUtils

#### METHOD: SystemEnvironmentUtils.sleep
- **Scope:** instance
- **LLM Call Syntax:** `systemEnvironmentUtils.sleep(milliseconds);`
- **Pure JSDoc:**
```javascript
/**
   * Pauses execution for specified duration. Requires sleep function injection.
   * @param {number} milliseconds Duration to pause.
   * @throws {Error} If sleep function is not provided to constructor.
   */
```
---
#### METHOD: SystemEnvironmentUtils.delay
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.delay(fn, milliseconds);`
- **Pure JSDoc:**
```javascript
/**
   * Executes provided function after a specified millisecond delay.
   * @param {Function} fn Function to execute.
   * @param {number} milliseconds Delay duration.
   * @returns {*} Return value of the executed function.
   */
```
---
#### METHOD: SystemEnvironmentUtils.isValidEmail
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.isValidEmail(email);`
- **Pure JSDoc:**
```javascript
/**
   * Validates if a string matches basic email format (user@domain.tld).
   * @param {string} email String to validate.
   * @returns {boolean} True if format is valid.
   */
```
---
#### METHOD: SystemEnvironmentUtils.isValidUrl
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.isValidUrl(url);`
- **Pure JSDoc:**
```javascript
/**
   * Validates if a string matches basic URL format with protocol.
   * @param {string} url String to validate.
   * @returns {boolean} True if format is valid.
   */
```
---
#### METHOD: SystemEnvironmentUtils.isEqual
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.isEqual(value, other);`
- **Pure JSDoc:**
```javascript
/**
   * Performs deep comparison between two values to determine equality.
   * @param {*} value First value.
   * @param {*} other Second value.
   * @returns {boolean} True if values are deeply equivalent.
   */
```
---
#### METHOD: SystemEnvironmentUtils.isNil
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.isNil(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is strictly null or undefined.
   * @param {*} value Value to check.
   * @returns {boolean} True if null/undefined.
   */
```
---
#### METHOD: SystemEnvironmentUtils.isNumber
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.isNumber(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a Number primitive or object.
   * @param {*} value Value to check.
   * @returns {boolean} True if value is a number.
   */
```
---
#### METHOD: SystemEnvironmentUtils.isString
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.isString(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a String primitive or object.
   * @param {*} value Value to check.
   * @returns {boolean} True if value is a string.
   */
```
---
#### METHOD: SystemEnvironmentUtils.isEmptyValue
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.isEmptyValue(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is an empty object, collection, map, or set.
   * @param {*} value Value to check.
   * @returns {boolean} True if empty.
   */
```
---
#### METHOD: SystemEnvironmentUtils.debounce
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.debounce(func, wait, options);`
- **Pure JSDoc:**
```javascript
/**
   * Creates a debounced function that delays invocation until after wait milliseconds.
   * @param {Function} func Function to debounce.
   * @param {number} wait Milliseconds to delay.
   * @param {Object} [options] Debounce options.
   * @returns {Function} Debounced function.
   */
```
---
#### METHOD: SystemEnvironmentUtils.once
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemEnvironmentUtils.once(func);`
- **Pure JSDoc:**
```javascript
/**
   * Restricts function invocation to a single execution.
   * @param {Function} func Function to restrict.
   * @returns {Function} Restricted function.
   */
```
---
#### METHOD: SystemEnvironmentUtils.noop
- **Scope:** instance
- **LLM Call Syntax:** `systemEnvironmentUtils.noop();`
- **Pure JSDoc:**
```javascript
/**
   * Performs no operation and returns undefined.
   */
```
---
<br>

## CLASS: StringUtils
**File Path:** `CoreUtilsLib/src/utils/StringUtils.ts`
**Constructor Usage:** `const instance = new StringUtils();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of StringUtils

#### METHOD: StringUtils.truncate
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.truncate(str, maxLength, suffix);`
- **Pure JSDoc:**
```javascript
/**
   * Truncates string to maximum length, appending a suffix if content exceeds limit.
   * @param {string} str Input string.
   * @param {number} maxLength Total allowed length including suffix.
   * @param {string} [suffix='...'] Truncation indicator.
   * @returns {string} Truncated result.
   */
```
---
#### METHOD: StringUtils.capitalize
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.capitalize(str);`
- **Pure JSDoc:**
```javascript
/**
   * Converts the first character of the string to uppercase.
   * @param {string} str Input string.
   * @returns {string} String with capitalized first character.
   */
```
---
#### METHOD: StringUtils.toCamelCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.toCamelCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Native implementation to convert hyphenated, underscored, or spaced strings to camelCase.
   * @param {string} str Input string.
   * @returns {string} Lower camelCase string.
   */
```
---
#### METHOD: StringUtils.toSnakeCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.toSnakeCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Native implementation to convert camelCase or PascalCase strings to snake_case.
   * @param {string} str Input string.
   * @returns {string} Underscored lowercase string.
   */
```
---
#### METHOD: StringUtils.camelCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.camelCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Lodash-based conversion of string to lower camelCase.
   * @param {string} str Input string.
   * @returns {string} camelCase string.
   */
```
---
#### METHOD: StringUtils.kebabCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.kebabCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Lodash-based conversion of string to hyphenated kebab-case.
   * @param {string} str Input string.
   * @returns {string} kebab-case string.
   */
```
---
#### METHOD: StringUtils.snakeCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.snakeCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Lodash-based conversion of string to underscored snake_case.
   * @param {string} str Input string.
   * @returns {string} snake_case string.
   */
```
---
#### METHOD: StringUtils.startCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.startCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Lodash-based conversion of string to Start Case (space-separated, first letter of words capitalized).
   * @param {string} str Input string.
   * @returns {string} Start Case string.
   */
```
---
#### METHOD: StringUtils.pascalCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.pascalCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Lodash-based conversion of string to PascalCase (UpperCamelCase).
   * @param {string} str Input string.
   * @returns {string} PascalCase string.
   */
```
---
#### METHOD: StringUtils.constantCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.constantCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Lodash-based conversion of string to CONSTANT_CASE (SCREAMING_SNAKE_CASE).
   * @param {string} str Input string.
   * @returns {string} CONSTANT_CASE string.
   */
```
---
#### METHOD: StringUtils.dotCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.dotCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Lodash-based conversion of string to dot.case notation.
   * @param {string} str Input string.
   * @returns {string} dot.case string.
   */
```
---
#### METHOD: StringUtils.pathCase
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.pathCase(str);`
- **Pure JSDoc:**
```javascript
/**
   * Lodash-based conversion of string to path/case notation.
   * @param {string} str Input string.
   * @returns {string} path/case string.
   */
```
---
#### METHOD: StringUtils.stringToArray
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.stringToArray(str);`
- **Pure JSDoc:**
```javascript
/**
   * Decomposes any format string (camel, Pascal, snake, etc.) into an array of lowercase words.
   * @param {string} str Input string to decompose.
   * @returns {string[]} Ordered array of lowercase word components.
   */
```
---
#### METHOD: StringUtils.humanisePath
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.humanisePath(path, separator);`
- **Pure JSDoc:**
```javascript
/**
   * Transforms technical paths or identifiers into human-readable text using specified separators.
   * @param {string} path Technical identifier or file path.
   * @param {string} [separator=' > '] Segment separator for output.
   * @returns {string} Human-readable path representation.
   */
```
---
<br>

## CLASS: LazyRef
**File Path:** `CoreUtilsLib/src/utils/LazyRef.ts`
**Constructor Usage:** `const instance = new LazyRef(loader);`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/**
   * @param {() => T} loader Zero-argument factory invoked at most once, on first get().
   */
```

### Methods and properties of LazyRef

#### METHOD: LazyRef.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = lazyRef.get();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {T} The loader's result, computed on first call and cached thereafter.
   */
```
---
#### METHOD: LazyRef.isResolved
- **Scope:** instance
- **LLM Call Syntax:** `const result = lazyRef.isResolved();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {boolean} True once get() has been called at least once.
   */
```
---
<br>

## CLASS: IdGenerator
**File Path:** `CoreUtilsLib/src/utils/IdGenerator.ts`
**Constructor Usage:** `const instance = new IdGenerator();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of IdGenerator

#### METHOD: IdGenerator.generateUuid
- **Scope:** instance
- **LLM Call Syntax:** `const result = idGenerator.generateUuid();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a standard UUID v4 (randomly-generated) string.
   * Uses native GAS Utilities if available for security.
   * @returns {string} UUID v4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx).
   */
```
---
#### METHOD: IdGenerator.getRandomValues
- **Scope:** instance
- **LLM Call Syntax:** `const result = idGenerator.getRandomValues(size);`
- **Pure JSDoc:**
```javascript
/**
   * Returns cryptographically secure random bytes (Web-Crypto-style `getRandomValues`),
   * for callers needing raw entropy rather than a formatted ID (tokens, salts, nonces).
   * Uses the same environment-aware chain as {@link IdGenerator._getSecureRandomBytes}:
   * `Utilities.getUuid()` + SHA-256 in GAS, `crypto.getRandomValues` outside it.
   * @param {number} size Number of random bytes to generate.
   * @returns {number[]|Uint8Array} Array of bytes (0-255).
   */
```
---
#### METHOD: IdGenerator.generateShortId
- **Scope:** instance
- **LLM Call Syntax:** `const result = idGenerator.generateShortId();`
- **Pure JSDoc:**
```javascript
/**
   * Generates a short 8-character alphanumeric random identifier.
   * @returns {string} Random 8-char base-36 string.
   */
```
---
#### METHOD: IdGenerator.generateCompactId
- **Scope:** instance
- **LLM Call Syntax:** `const result = idGenerator.generateCompactId(size);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a compact, collision-resistant random ID with specified length.
   * @param {number} [size=21] Output string length.
   * @returns {string} Random alphanumeric ID string.
   */
```
---
#### METHOD: IdGenerator.generateCustomId
- **Scope:** instance
- **LLM Call Syntax:** `const result = idGenerator.generateCustomId(length, alphabet);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a custom random ID using a secure source if available.
   * Uses rejection sampling to eliminate modulo bias.
   * @param {number} [length=12] Output string length.
   * @param {string} [alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] Character set.
   * @returns {string} Random ID string.
   */
```
---
#### METHOD: IdGenerator.generateCustomId
- **Scope:** static
- **LLM Call Syntax:** `const result = IdGenerator.generateCustomId(length, alphabet);`
- **Pure JSDoc:**
```javascript
/**
   * Static version of custom ID generation for direct access.
   * @param {number} [length=12] Output string length.
   * @param {string} [alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] Character set.
   * @returns {string} Random ID string.
   */
```
---
#### METHOD: IdGenerator._getSecureRandomBytes
- **Scope:** static
- **LLM Call Syntax:** `const result = IdGenerator._getSecureRandomBytes(size);`
- **Pure JSDoc:**
```javascript
/**
   * Internal secure random byte generator with environment fallbacks.
   * In GAS, it leverages Utilities.getUuid() + SHA-256 for high-entropy seed.
   * @param {number} size Number of bytes to generate.
   * @returns {number[]|Uint8Array} Byte array.
   * @private
   */
```
---
<br>

## CLASS: HtmlSanitizer
**File Path:** `CoreUtilsLib/src/utils/HtmlSanitizer.ts`
**Constructor Usage:** `const instance = new HtmlSanitizer();`
**Description:** Static utilities for escaping/validating sheet-sourced values before HTML
interpolation. Stateless, so all methods are static (matches the
`ValidationUtils` convention used elsewhere in this library).

### Raw JSDoc Context:
```javascript
/**
 * Static utilities for escaping/validating sheet-sourced values before HTML
 * interpolation. Stateless, so all methods are static (matches the
 * `ValidationUtils` convention used elsewhere in this library).
 * @class
 */
```

### Methods and properties of HtmlSanitizer

#### METHOD: HtmlSanitizer.escapeHtml
- **Scope:** static
- **LLM Call Syntax:** `const result = HtmlSanitizer.escapeHtml(value);`
- **Pure JSDoc:**
```javascript
/**
   * Escapes `&`, `<`, `>`, `"`, `'` so free text is safe to interpolate into
   * HTML markup (e.g. names, notes, error strings sourced from sheets).
   * Null-safe: `null`/`undefined` are coerced to `''` (not the throw or the
   * literal string `"null"`).
   * @param {*} value Raw text (coerced to string; `null`/`undefined` become `''`).
   * @returns {string} HTML-escaped text.
   */
```
---
#### METHOD: HtmlSanitizer.safeColor
- **Scope:** static
- **LLM Call Syntax:** `const result = HtmlSanitizer.safeColor(value, fallback);`
- **Pure JSDoc:**
```javascript
/**
   * Validates a sheet-sourced colour value going into a style attribute: only
   * hex codes (`#` + 3-8 hex digits) or bare CSS colour keywords pass.
   * @param {string} value Raw colour value.
   * @param {string} fallback Value returned when `value` fails validation.
   * @returns {string} `value` if safe, otherwise `fallback`.
   */
```
---
#### METHOD: HtmlSanitizer.safeUrl
- **Scope:** static
- **LLM Call Syntax:** `const result = HtmlSanitizer.safeUrl(value);`
- **Pure JSDoc:**
```javascript
/**
   * Validates a sheet-sourced link target: only `http(s)` URLs pass (blocks
   * `javascript:`/`data:`/other schemes). Input is trimmed before testing and
   * before being returned.
   * @param {string} value Raw URL value.
   * @returns {string} The trimmed URL if safe, otherwise `'#'`.
   */
```
---
#### METHOD: HtmlSanitizer.escapeContextDeep
- **Scope:** static
- **LLM Call Syntax:** `const result = HtmlSanitizer.escapeContextDeep(value);`
- **Pure JSDoc:**
```javascript
/**
   * Recursively walks a plain object/array (e.g. a CDU context) and HTML-escapes
   * every string leaf via {@link HtmlSanitizer.escapeHtml}, returning a **new**
   * structure — the input is never mutated. Intended for callers who must render
   * an admin-authored Mustache template (`{{var}}`, which does not itself escape)
   * against untrusted data (e.g. student/parent names imported from spreadsheets)
   * into an HTML email body: escape the context once with this method, then pass
   * the result into the existing (non-escaping) `processString`/`render`.
   *
   * Non-string leaves (numbers, booleans, `null`, `undefined`) are returned
   * unchanged — they are not coerced to strings, so template logic that branches
   * on falsiness/type (e.g. `{{#count}}`) keeps working. Only plain objects
   * (object literals, or objects with `null` prototype) and arrays are recursed
   * into; other object types (`Date`, class instances, functions, etc.) are
   * returned as-is, unescaped and unrecursed, since walking their internals
   * could break them (e.g. a `Date`'s methods) or silently discard data.
   * @param {*} value Raw value — typically a context object, but any shape is
   *   accepted (arrays and primitives included) since the function recurses.
   * @returns {*} A deep copy with every string leaf HTML-escaped; non-plain
   *   objects/functions/primitives other than strings pass through unchanged.
   */
```
---
#### METHOD: HtmlSanitizer.stripToPlainText
- **Scope:** static
- **LLM Call Syntax:** `const result = HtmlSanitizer.stripToPlainText(value, options);`
- **Pure JSDoc:**
```javascript
/**
   * Strips HTML markup down to plain text: block-level boundaries (`<br>`,
   * `</p>`, `</div>`, `</li>`, `</tr>`) become line breaks BEFORE remaining
   * tags are stripped (so paragraph/list/row structure survives as line
   * breaks, not word-run-together text), HTML entities are decoded, blank-line
   * runs collapse, and the result is trimmed. Null-safe.
   * @param {*} value Raw HTML (coerced to string; `null`/`undefined` become `''`).
   * @param {{maxLength?: number, truncationMode?: 'marker'|'cut'|'none'}} [options]
   *   `maxLength` (default 2000) is the maximum returned length. `truncationMode`
   *   (default `'marker'`) cuts to `maxLength - 1` chars and appends `'…'` (total
   *   length ≤ `maxLength`); `'cut'` truncates to exactly `maxLength` with no
   *   marker; `'none'` never truncates.
   * @returns {string} Plain text, line-break-preserving, optionally truncated.
   */
```
---
<br>

## CLASS: Delegation
**File Path:** `CoreUtilsLib/src/utils/Delegation.ts`
**Constructor Usage:** `const instance = new Delegation();`
**Description:** Static utility for wiring facade methods onto a target instance by delegating
to internal collaborator (manager) objects.

### Raw JSDoc Context:
```javascript
/**
 * Static utility for wiring facade methods onto a target instance by delegating
 * to internal collaborator (manager) objects.
 * @class Delegation
 */
```

### Methods and properties of Delegation

#### METHOD: Delegation.delegateMethods
- **Scope:** static
- **LLM Call Syntax:** `const result = Delegation.delegateMethods(target, delegations, logger);`
- **Pure JSDoc:**
```javascript
/**
   * Binds each named method from each manager onto the target object, so calls
   * to `target[method](...)` are forwarded to `manager[method](...)` with the
   * manager's `this` preserved. Methods that don't exist (or aren't functions)
   * on a given manager are silently skipped, unless `logger` is provided, in
   * which case a warning is emitted for each missing method.
   *
   * @param {Object} target - Object onto which delegated methods are attached (typically a facade instance, e.g. `this` inside a constructor).
   * @param {Array<{manager: Object, methods: string[]}>} delegations - Collection of manager/method-name pairs to wire up.
   * @param {{warn: Function}} [logger] - Optional logger; when given, missing methods are reported via `logger.warn(...)` instead of skipped silently.
   * @returns {Object} The same `target`, for convenience chaining.
   *
   * @example
   * class SpreadsheetService {
   *   constructor() {
   *     this._rangeManager = new SpreadsheetRangeManager(this);
   *     Delegation.delegateMethods(this, [
   *       { manager: this._rangeManager, methods: ['updateRanges', 'getRanges'] }
   *     ]);
   *   }
   * }
   */
```
---
<br>

## CLASS: DateUtils
**File Path:** `CoreUtilsLib/src/utils/DateUtils.ts`
**Constructor Usage:** `const instance = new DateUtils();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DateUtils

#### PROPERTY: DateUtils.MILLIS_PER_DAY
- **Scope:** static
- **LLM Call Syntax:** `const result = DateUtils.MILLIS_PER_DAY;`
- **Pure JSDoc:**
```javascript
/**
   * Milliseconds in one day (86,400,000).
   * @returns {number} 86400000
   * @example
   * const daysInMs = DateUtils.MILLIS_PER_DAY * 7; // 1 week in milliseconds
   */
```
---
#### PROPERTY: DateUtils.MILLIS_PER_HOUR
- **Scope:** static
- **LLM Call Syntax:** `const result = DateUtils.MILLIS_PER_HOUR;`
- **Pure JSDoc:**
```javascript
/**
   * Milliseconds in one hour (3,600,000).
   * @returns {number} 3600000
   * @example
   * const timeout = DateUtils.MILLIS_PER_HOUR * 2; // 2 hours
   */
```
---
#### PROPERTY: DateUtils.MILLIS_PER_MINUTE
- **Scope:** static
- **LLM Call Syntax:** `const result = DateUtils.MILLIS_PER_MINUTE;`
- **Pure JSDoc:**
```javascript
/**
   * Milliseconds in one minute (60,000).
   * @returns {number} 60000
   * @example
   * const delay = DateUtils.MILLIS_PER_MINUTE * 5; // 5 minutes
   */
```
---
#### PROPERTY: DateUtils.MILLIS_PER_SECOND
- **Scope:** static
- **LLM Call Syntax:** `const result = DateUtils.MILLIS_PER_SECOND;`
- **Pure JSDoc:**
```javascript
/**
   * Milliseconds in one second (1,000).
   * @returns {number} 1000
   * @example
   * const timeout = DateUtils.MILLIS_PER_SECOND * 30; // 30 seconds
   */
```
---
#### METHOD: DateUtils.parseDate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.parseDate(input);`
- **Pure JSDoc:**
```javascript
/**
   * Universal date parser for Date objects, ISO strings, Unix timestamps (>=100k), and Sheets serials (<100k).
   * @param {Date|string|number|null|undefined} input Multi-format date input.
   * @returns {Date|null} Parsed Date object or null for invalid inputs.
   */
```
---
#### METHOD: DateUtils.parseGoogleSheetsDate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.parseGoogleSheetsDate(serialNumber);`
- **Pure JSDoc:**
```javascript
/**
   * Converts a Google Sheets serial number (days since Dec 30, 1899) to a Date object.
   * @param {number} serialNumber Sheets date serial number.
   * @returns {Date} Parsed Date object.
   */
```
---
#### METHOD: DateUtils.parseISODate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.parseISODate(isoString);`
- **Pure JSDoc:**
```javascript
/**
   * Strictly parses an ISO 8601 formatted date string.
   * @param {string} isoString ISO 8601 date string.
   * @returns {Date|null} Parsed Date object or null if invalid.
   */
```
---
#### METHOD: DateUtils.parseDateWithFormat
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.parseDateWithFormat(dateString, format);`
- **Pure JSDoc:**
```javascript
/**
   * Parses a date string using a specific pattern (DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD).
   * @param {string} dateString Formatted date string.
   * @param {string} format Expected format pattern.
   * @returns {Date|null} Parsed Date object or null if unparseable.
   */
```
---
#### METHOD: DateUtils.formatISODate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.formatISODate(date);`
- **Pure JSDoc:**
```javascript
/**
   * Formats a Date object as a standard ISO 8601 string.
   * @param {Date} date Date to format.
   * @returns {string|null} ISO 8601 string or null if date is invalid.
   */
```
---
#### METHOD: DateUtils.formatDate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.formatDate(date, format, options, options.utc);`
- **Pure JSDoc:**
```javascript
/**
   * Formats a Date object using custom tokens (YYYY, MM, DD, HH, mm, ss, SSS).
   * @param {Date} date Date to format.
   * @param {string} [format='YYYY-MM-DD'] Token-based format pattern.
   * @param {Object} [options={}] Formatting options.
   * @param {boolean} [options.utc=false] If true, tokens are derived from the UTC
   *   components of the date (deterministic, host-timezone independent) instead
   *   of the local ones.
   * @returns {string|null} Formatted string or null if date is invalid.
   */
```
---
#### METHOD: DateUtils.toGoogleSheetsDate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.toGoogleSheetsDate(date);`
- **Pure JSDoc:**
```javascript
/**
   * Converts a Date object to a Google Sheets serial number (decimal days since epoch).
   * @param {Date} date Date to convert.
   * @returns {number|null} Sheets serial number or null if invalid.
   */
```
---
#### METHOD: DateUtils._cloneDate
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils._cloneDate();`
- **Pure JSDoc:**
```javascript
/** @private Clones a Date instance. @param {Date} date Valid date object. @returns {Date} New instance. */
```
---
#### METHOD: DateUtils._diffMs
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils._diffMs();`
- **Pure JSDoc:**
```javascript
/**
   * @private Calculates millisecond difference (d2 - d1). @param {Date} date1 Start date. @param {Date} date2 End date. @returns {number|null} Diff or null if invalid.
   */
```
---
#### METHOD: DateUtils.addDays
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.addDays();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DateUtils.addHours
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.addHours(date, hours);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a new Date with specified hours added.
   * @param {Date} date Reference date.
   * @param {number} hours Hours to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
```
---
#### METHOD: DateUtils.addMinutes
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.addMinutes(date, minutes);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a new Date with specified minutes added.
   * @param {Date} date Reference date.
   * @param {number} minutes Minutes to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
```
---
#### METHOD: DateUtils.addMonths
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.addMonths(date, months);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a new Date with specified months added.
   * @param {Date} date Reference date.
   * @param {number} months Months to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
```
---
#### METHOD: DateUtils.addYears
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.addYears(date, years);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a new Date with specified years added.
   * @param {Date} date Reference date.
   * @param {number} years Years to add.
   * @returns {Date|null} Resulting date or null if invalid.
   */
```
---
#### METHOD: DateUtils.daysBetween
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.daysBetween(date1, date2);`
- **Pure JSDoc:**
```javascript
/**
   * Calculates truncated day difference between two dates (date2 - date1).
   * @param {Date} date1 Start date.
   * @param {Date} date2 End date.
   * @returns {number|null} Day count or null if invalid.
   */
```
---
#### METHOD: DateUtils.hoursBetween
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.hoursBetween(date1, date2);`
- **Pure JSDoc:**
```javascript
/**
   * Calculates truncated hour difference between two dates.
   * @param {Date} date1 Start date.
   * @param {Date} date2 End date.
   * @returns {number|null} Hour count or null if invalid.
   */
```
---
#### METHOD: DateUtils.minutesBetween
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.minutesBetween(date1, date2);`
- **Pure JSDoc:**
```javascript
/**
   * Calculates truncated minute difference between two dates.
   * @param {Date} date1 Start date.
   * @param {Date} date2 End date.
   * @returns {number|null} Minute count or null if invalid.
   */
```
---
#### METHOD: DateUtils.isBefore
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.isBefore(date1, date2);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if date1 is chronologically earlier than date2.
   * @param {Date} date1 Comparison date.
   * @param {Date} date2 Reference date.
   * @returns {boolean|null} Comparison result or null if invalid.
   */
```
---
#### METHOD: DateUtils.isAfter
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.isAfter(date1, date2);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if date1 is chronologically later than date2.
   * @param {Date} date1 Comparison date.
   * @param {Date} date2 Reference date.
   * @returns {boolean|null} Comparison result or null if invalid.
   */
```
---
#### METHOD: DateUtils.isSameDay
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.isSameDay(date1, date2);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if two dates fall on the same calendar day (ignores time).
   * @param {Date} date1 First date.
   * @param {Date} date2 Second date.
   * @returns {boolean|null} True if YYYY-MM-DD matches, null if invalid.
   */
```
---
#### METHOD: DateUtils.startOfDay
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.startOfDay(date);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a new Date set to 00:00:00.000 for the specified day.
   * @param {Date} date Reference date.
   * @returns {Date|null} Midnight Date instance or null if invalid.
   */
```
---
#### METHOD: DateUtils.endOfDay
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.endOfDay(date);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a new Date set to 23:59:59.999 for the specified day.
   * @param {Date} date Reference date.
   * @returns {Date|null} End-of-day Date instance or null if invalid.
   */
```
---
#### METHOD: DateUtils.isValidDate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.isValidDate(value);`
- **Pure JSDoc:**
```javascript
/**
   * Validates if a value is a Date object or unparseable date string/number.
   * @param {*} value Input to validate.
   * @returns {boolean} True if parseable as a valid date.
   */
```
---
#### METHOD: DateUtils.formatDuration
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.formatDuration(ms, options);`
- **Pure JSDoc:**
```javascript
/**
   * Formats millisecond duration into a human-readable string (e.g., '1d 2h 5m 30s').
   * @param {number} ms Duration in milliseconds.
   * @param {{short?:boolean, showMs?:boolean}} [options={}] Formatting behavior options.
   * @returns {string} Formatted duration string or '--' for invalid inputs.
   */
```
---
<br>

## CLASS: DateRange
**File Path:** `CoreUtilsLib/src/utils/DateRange.ts`
**Constructor Usage:** `const instance = new DateRange();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DateRange

#### METHOD: DateRange.isOpenEnded
- **Scope:** instance
- **LLM Call Syntax:** `dateRange.isOpenEnded();`
- **Pure JSDoc:**
```javascript
/** True if `end` is the open-ended sentinel (no upper bound was supplied). */
```
---
#### METHOD: DateRange.contains
- **Scope:** instance
- **LLM Call Syntax:** `dateRange.contains();`
- **Pure JSDoc:**
```javascript
/** True if `date` falls within `[start, end]` inclusive. */
```
---
#### METHOD: DateRange.durationInDays
- **Scope:** instance
- **LLM Call Syntax:** `dateRange.durationInDays();`
- **Pure JSDoc:**
```javascript
/** Whole-day span, truncated (uses `DateUtils.daysBetween`). */
```
---
#### METHOD: DateRange.overlaps
- **Scope:** instance
- **LLM Call Syntax:** `dateRange.overlaps();`
- **Pure JSDoc:**
```javascript
/** True if this range and `other` share at least one instant. */
```
---
<br>

## CLASS: CellValueCoercion
**File Path:** `CoreUtilsLib/src/utils/CellValueCoercion.ts`
**Constructor Usage:** `const instance = new CellValueCoercion();`
**Description:** Static utilities for normalizing raw Sheets API cell values into JS
primitives. Stateless, so all methods are static (matches the
`HtmlSanitizer`/`ValidationUtils` convention used elsewhere in this library).

### Raw JSDoc Context:
```javascript
/**
 * Static utilities for normalizing raw Sheets API cell values into JS
 * primitives. Stateless, so all methods are static (matches the
 * `HtmlSanitizer`/`ValidationUtils` convention used elsewhere in this library).
 * @class
 */
```

### Methods and properties of CellValueCoercion

#### METHOD: CellValueCoercion.coerceValue
- **Scope:** static
- **LLM Call Syntax:** `const result = CellValueCoercion.coerceValue(value);`
- **Pure JSDoc:**
```javascript
/**
   * Normalizes a raw Sheets API cell value into a JS primitive (number,
   * boolean) when possible, otherwise returns the original value unchanged.
   * @param {*} value Raw cell data.
   * @returns {*} Coerced primitive, or the original value if not coercible.
   */
```
---
<br>

## CLASS: LoggerServiceMock
**File Path:** `CoreUtilsLib/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new LoggerServiceMock();`
**Description:** High-fidelity mock for LoggerService with jest.fn() instrumentation and method chaining.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity mock for LoggerService with jest.fn() instrumentation and method chaining.
 * @class
 */
```

### Methods and properties of LoggerServiceMock

#### METHOD: LoggerServiceMock.getLogs
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerServiceMock.getLogs();`
- **Pure JSDoc:**
```javascript
/**
   * Reconstructs all recorded log entries from individual level mock calls.
   * @returns {Array<Object>} Recorded log entries.
   */
```
---
#### METHOD: LoggerServiceMock.getLogsByLevel
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerServiceMock.getLogsByLevel(level);`
- **Pure JSDoc:**
```javascript
/**
   * Filters captured logs by case-insensitive level identifier.
   * @param {string} level Log level (DEBUG|INFO|WARN|ERROR|FATAL|LOG).
   * @returns {Array<{level:string, message:string, context:Object|null}>}
   */
```
---
#### METHOD: LoggerServiceMock.getLogsMatching
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerServiceMock.getLogsMatching(pattern);`
- **Pure JSDoc:**
```javascript
/**
   * Filters captured logs by message content using string or regular expression.
   * @param {string|RegExp} pattern Search pattern for log message matching.
   * @returns {Array<{level:string, message:string, context:Object|null}>}
   */
```
---
#### METHOD: LoggerServiceMock.hasLog
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerServiceMock.hasLog(level, pattern);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if any captured log entry matches specified level and message pattern.
   * @param {string} level Case-insensitive log level identifier.
   * @param {string|RegExp} pattern Message content or pattern to match.
   * @returns {boolean} True if matching log entry is found.
   */
```
---
#### METHOD: LoggerServiceMock.printLogs
- **Scope:** instance
- **LLM Call Syntax:** `loggerServiceMock.printLogs();`
- **Pure JSDoc:**
```javascript
/**
   * Outputs all recorded log entries to the system console.
   */
```
---
#### METHOD: LoggerServiceMock.reset
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerServiceMock.reset();`
- **Pure JSDoc:**
```javascript
/**
   * Resets all internal Jest mock functions and call history.
   * @returns {this} Chainable mock instance for fluent API usage.
   */
```
---
<br>

## CLASS: UtilsServiceMock
**File Path:** `CoreUtilsLib/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new UtilsServiceMock();`
**Description:** Mock for UtilsService providing common utility behaviors with jest.fn() instrumentation.

### Raw JSDoc Context:
```javascript
/**
 * Mock for UtilsService providing common utility behaviors with jest.fn() instrumentation.
 * @class
 */
```

<br>

## CLASS: CacheInterfaceMock
**File Path:** `CoreUtilsLib/src/testing/mocks.ts`
**Constructor Usage:** `const instance = new CacheInterfaceMock();`
**Description:** Mock for CacheInterface implementing a simple in-memory store for testing.

### Raw JSDoc Context:
```javascript
/**
 * Mock for CacheInterface implementing a simple in-memory store for testing.
 * @class
 */
```

<br>

## CLASS: StructuredLogFormatter
**File Path:** `CoreUtilsLib/src/internal/StructuredLogFormatter.ts`
**Constructor Usage:** `const instance = new StructuredLogFormatter();`
**Description:** Pure formatter for deterministic hierarchical console lines.

### Raw JSDoc Context:
```javascript
/** Pure formatter for deterministic hierarchical console lines. */
```

### Methods and properties of StructuredLogFormatter

#### METHOD: StructuredLogFormatter.treePrefix
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.treePrefix(position);`
- **Pure JSDoc:**
```javascript
/**
   * @param {TreePosition} [position]
   * @returns {string}
   */
```
---
#### METHOD: StructuredLogFormatter.jobStart
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.jobStart();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.jobResume
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.jobResume();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.jobEnd
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.jobEnd();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.jobSuspended
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.jobSuspended();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.batchStart
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.batchStart();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.itemStart
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.itemStart();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.step
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.step();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.pipelineStart
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.pipelineStart();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.pipelineStep
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.pipelineStep();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.summary
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.summary();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} */
```
---
#### METHOD: StructuredLogFormatter.jobReport
- **Scope:** instance
- **LLM Call Syntax:** `const result = structuredLogFormatter.jobReport();`
- **Pure JSDoc:**
```javascript
/** @returns {string[]} Multi-line end-of-job report (job type, run count, cumulative real duration, task totals, skip and failure detail). */
```
---
#### METHOD: StructuredLogFormatter._isDetailEnvelope
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._isDetailEnvelope();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: StructuredLogFormatter._duration
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._duration();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: StructuredLogFormatter._resumeDetails
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._resumeDetails();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: StructuredLogFormatter._contentText
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._contentText();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: StructuredLogFormatter._detailsText
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._detailsText();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: StructuredLogFormatter._text
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._text();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: StructuredLogFormatter._count
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._count();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: StructuredLogFormatter._splitPlain
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._splitPlain();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: StructuredLogFormatter._treeLines
- **Scope:** instance
- **LLM Call Syntax:** `structuredLogFormatter._treeLines();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: Registry
**File Path:** `CoreUtilsLib/src/internal/Registry.ts`
**Constructor Usage:** `const instance = new Registry();`
**Description:** Generic key/value registry backed by a Map.

### Raw JSDoc Context:
```javascript
/**
 * Generic key/value registry backed by a Map.
 *
 * @class Registry
 * @template T
 */
```

### Methods and properties of Registry

#### METHOD: Registry.register
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.register(key, value, options, options.overwrite);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a value under a key, running the optional value validator.
   * @param {string} key Non-empty string key.
   * @param {T} value Value to store.
   * @param {Object} [options={}] Registration options.
   * @param {boolean} [options.overwrite=true] When false, throws if the key already exists.
   * @returns {boolean} True if an existing entry was overwritten.
   * @throws {Error} If key is not a non-empty string, value is invalid, or a
   *   non-overwriting collision occurs.
   */
```
---
#### METHOD: Registry.set
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.set(key, value);`
- **Pure JSDoc:**
```javascript
/**
   * Stores a value without validation or logging (low-level storage primitive).
   * @param {string} key Key.
   * @param {T} value Value.
   * @returns {boolean} True if an existing entry was overwritten.
   */
```
---
#### METHOD: Registry.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.get(key);`
- **Pure JSDoc:**
```javascript
/**
   * @param {string} key Key.
   * @returns {T|undefined} Stored value, or undefined if absent.
   */
```
---
#### METHOD: Registry.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.has(key);`
- **Pure JSDoc:**
```javascript
/**
   * @param {string} key Key.
   * @returns {boolean} True if a value is registered for the key.
   */
```
---
#### METHOD: Registry.unregister
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.unregister(key);`
- **Pure JSDoc:**
```javascript
/**
   * Removes the value for a key.
   * @param {string} key Key.
   * @returns {boolean} True if an entry existed and was removed.
   */
```
---
#### METHOD: Registry.clear
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Removes all entries.
   * @returns {void}
   */
```
---
#### METHOD: Registry.keys
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.keys();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {string[]} Snapshot array of all registered keys.
   */
```
---
#### METHOD: Registry.values
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.values();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {T[]} Snapshot array of all registered values.
   */
```
---
#### METHOD: Registry.entries
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.entries();`
- **Pure JSDoc:**
```javascript
/**
   * @returns {Array<[string, T]>} Snapshot array of [key, value] entries.
   */
```
---
#### PROPERTY: Registry.size
- **Scope:** instance
- **LLM Call Syntax:** `const result = registry.size;`
- **Pure JSDoc:**
```javascript
/**
   * @returns {number} Number of registered entries.
   */
```
---
<br>

## CLASS: RegexUtils
**File Path:** `CoreUtilsLib/src/internal/RegexUtils.ts`
**Constructor Usage:** `const instance = new RegexUtils();`
**Description:** Static security utility for safe regular expression handling and ReDoS prevention.

### Raw JSDoc Context:
```javascript
/**
 * Static security utility for safe regular expression handling and ReDoS prevention.
 * @class RegexUtils
 */
```

### Methods and properties of RegexUtils

#### METHOD: RegexUtils.escape
- **Scope:** static
- **LLM Call Syntax:** `const result = RegexUtils.escape(str);`
- **Pure JSDoc:**
```javascript
/**
   * Escape special characters in a string for literal matching within a regular expression.
   * @param {string} str - Text to escape.
   * @returns {string} Sanitized string safe for literal RegExp inclusion.
   */
```
---
#### METHOD: RegexUtils.validateSafety
- **Scope:** static
- **LLM Call Syntax:** `RegexUtils.validateSafety(pattern, logger);`
- **Pure JSDoc:**
```javascript
/**
   * Validate a regex pattern for potential catastrophic backtracking or ReDoS vulnerabilities.
   * @param {string} pattern - Regex structure to test.
   * @param {Object} [logger=null] - Optional diagnostic reporter.
   * @throws {Error} If the pattern violates complexity or safety constraints.
   */
```
---
#### METHOD: RegexUtils.createSafeRegex
- **Scope:** static
- **LLM Call Syntax:** `const result = RegexUtils.createSafeRegex(pattern, flags, logger);`
- **Pure JSDoc:**
```javascript
/**
   * Initialize a validated RegExp instance, enforcing ReDoS protection.
   * @param {string} pattern - Regex structure to test and instantiate.
   * @param {string} [flags=''] - Standard RegExp control flags.
   * @param {Object} [logger=null] - Optional diagnostic reporter.
   * @returns {RegExp} Validated regular expression object.
   * @throws {Error} If the pattern is unsafe or syntactically invalid.
   */
```
---
<br>

## CLASS: PiiRedactor
**File Path:** `CoreUtilsLib/src/internal/PiiRedactor.ts`
**Constructor Usage:** `const instance = new PiiRedactor();`
**Description:** Static utility for detecting and masking Personally Identifiable Information (PII) using regex patterns.

### Raw JSDoc Context:
```javascript
/**
 * Static utility for detecting and masking Personally Identifiable Information (PII) using regex patterns.
 * @class PiiRedactor
 */
```

### Methods and properties of PiiRedactor

#### PROPERTY: PiiRedactor.REDACTION_LABELS
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.REDACTION_LABELS;`
- **Pure JSDoc:**
```javascript
/**
   * Default masking labels for recognized PII categories.
   * @static
   * @type {Object<string, string>}
   */
```
---
#### PROPERTY: PiiRedactor.PATTERNS
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.PATTERNS;`
- **Pure JSDoc:**
```javascript
/**
   * Collection of regular expressions for PII detection.
   * @static
   * @type {Object<string, RegExp>}
   */
```
---
#### METHOD: PiiRedactor.redact
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redact(message);`
- **Pure JSDoc:**
```javascript
/**
   * Mask all recognized PII patterns within a text string.
   * @param {string} message - Input text to sanitize.
   * @returns {string} Sanitized string with masked placeholders.
   */
```
---
<br>

## CLASS: LazyServiceContainer
**File Path:** `CoreUtilsLib/src/internal/LazyServiceContainer.ts`
**Constructor Usage:** `const instance = new LazyServiceContainer();`
**Description:** Lazy-singleton service container: register a factory under a name, resolve
it (and cache the result) on first `get()`, share the cached instance on
every subsequent `get()` until `reset()`.

### Raw JSDoc Context:
```javascript
/**
 * Lazy-singleton service container: register a factory under a name, resolve
 * it (and cache the result) on first `get()`, share the cached instance on
 * every subsequent `get()` until `reset()`.
 *
 * @class LazyServiceContainer
 * @template T
 */
```

### Methods and properties of LazyServiceContainer

#### METHOD: LazyServiceContainer.register
- **Scope:** instance
- **LLM Call Syntax:** `lazyServiceContainer.register(name, factory);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a factory under `name`. Overwriting a name clears any cached
   * singleton for it, so the next `get()` re-resolves from the new factory.
   * @param {string} name Service identifier.
   * @param {Function} factory `(container) => T` — invoked at most once, lazily, on first `get(name)`.
   */
```
---
#### METHOD: LazyServiceContainer.has
- **Scope:** instance
- **LLM Call Syntax:** `const result = lazyServiceContainer.has(name);`
- **Pure JSDoc:**
```javascript
/**
   * @param {string} name Service identifier.
   * @returns {boolean} True if a factory is registered under `name`.
   */
```
---
#### METHOD: LazyServiceContainer.get
- **Scope:** instance
- **LLM Call Syntax:** `const result = lazyServiceContainer.get(name);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves the service registered under `name`: returns the cached
   * singleton if one exists, otherwise invokes the registered factory once
   * and caches the result.
   * @param {string} name Service identifier.
   * @returns {T} The resolved (and now cached) service instance.
   * @throws {Error} If no factory is registered under `name`.
   */
```
---
#### METHOD: LazyServiceContainer.reset
- **Scope:** instance
- **LLM Call Syntax:** `lazyServiceContainer.reset();`
- **Pure JSDoc:**
```javascript
/**
   * Clears cached singletons, without unregistering factories — the next
   * `get()` per name lazily re-resolves. Primarily for test state isolation.
   */
```
---
#### METHOD: LazyServiceContainer.clear
- **Scope:** instance
- **LLM Call Syntax:** `lazyServiceContainer.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Removes every registered factory and cached singleton.
   */
```
---
<br>

## CLASS: HashUtils
**File Path:** `CoreUtilsLib/src/internal/HashUtils.ts`
**Constructor Usage:** `const instance = new HashUtils();`
**Description:** Cryptographic utility for deterministic SHA-256 hashing of strings and objects.

### Raw JSDoc Context:
```javascript
/**
 * Cryptographic utility for deterministic SHA-256 hashing of strings and objects.
 * @class HashUtils
 */
```

### Methods and properties of HashUtils

#### METHOD: HashUtils.generateHash
- **Scope:** static
- **LLM Call Syntax:** `const result = HashUtils.generateHash(str);`
- **Pure JSDoc:**
```javascript
/**
   * Generate a 64-character hexadecimal SHA-256 hash for a UTF-8 string.
   * @param {string} str - Input payload to digest.
   * @returns {string} Lowercase 256-bit hash identifier.
   */
```
---
#### METHOD: HashUtils.hashObject
- **Scope:** static
- **LLM Call Syntax:** `const result = HashUtils.hashObject(obj);`
- **Pure JSDoc:**
```javascript
/**
   * Generate a SHA-256 hash for a JSON-serializable object via stringification.
   * @param {Object} obj - Complex payload to digest.
   * @returns {string} Lowercase 256-bit hash identifier.
   * @throws {TypeError} If the object contains circular references.
   */
```
---
#### METHOD: HashUtils.isValidHash
- **Scope:** static
- **LLM Call Syntax:** `const result = HashUtils.isValidHash(str);`
- **Pure JSDoc:**
```javascript
/**
   * Validate if a string consists exclusively of hexadecimal characters.
   * @param {*} str - Potential hash identifier to test.
   * @returns {boolean} True if the input is a non-empty hexadecimal string.
   */
```
---
<br>

## CLASS: BaseError
**File Path:** `CoreUtilsLib/src/errors/BaseError.ts`
**Constructor Usage:** `const instance = new BaseError(message, context, originalError);`
**Description:** Initialize BaseError with message, metadata context, and optional cause chaining.

### Raw JSDoc Context:
```javascript
/**
   * Initialize BaseError with message, metadata context, and optional cause chaining.
   * @param {string} message - Error description.
   * @param {Object} [context={}] - Metadata for diagnostic tracking.
   * @param {Error} [originalError=null] - Upstream exception being wrapped.
   */
```

### Methods and properties of BaseError

#### PROPERTY: BaseError.originalMessage
- **Scope:** instance
- **LLM Call Syntax:** `const result = baseError.originalMessage;`
- **Pure JSDoc:**
```javascript
/**
   * Gets the original error message if one exists.
   *
   * @returns {string|null} The original error message or null
   */
```
---
#### PROPERTY: BaseError.hasOriginalError
- **Scope:** instance
- **LLM Call Syntax:** `const result = baseError.hasOriginalError;`
- **Pure JSDoc:**
```javascript
/**
   * Checks if this error wraps another error.
   *
   * @returns {boolean} True if an original error exists
   */
```
---
#### METHOD: BaseError.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = baseError.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Serialize error state to a plain object for logging or transport.
   * @returns {Object} JSON-compatible representation including name, message, context, and stack.
   */
```
---
#### METHOD: BaseError.toString
- **Scope:** instance
- **LLM Call Syntax:** `const result = baseError.toString();`
- **Pure JSDoc:**
```javascript
/**
   * Generate a formatted string including error type, message, and serialized context.
   * @returns {string} Human-readable error summary.
   */
```
---
#### METHOD: BaseError.withContext
- **Scope:** instance
- **LLM Call Syntax:** `const result = baseError.withContext(additionalContext);`
- **Pure JSDoc:**
```javascript
/**
   * Create a shallow clone of the error with additional merged metadata.
   * @param {Object} additionalContext - New metadata to append to existing context.
   * @returns {BaseError} New instance with updated context and preserved stack trace.
   */
```
---
#### METHOD: BaseError.wrap
- **Scope:** static
- **LLM Call Syntax:** `const result = BaseError.wrap(error, context);`
- **Pure JSDoc:**
```javascript
/**
   * Static factory method to wrap any error as a BaseError.
   *
   * If the error is already a BaseError, returns it unchanged.
   * Otherwise, wraps it in a new BaseError with the original as the cause.
   *
   * @param {Error|*} error - The error to wrap
   * @param {Object} [context={}] - Additional context to add
   * @returns {BaseError} A BaseError instance
   *
   * @example
   * try {
   *   riskyOperation();
   * } catch (error) {
   *   const wrapped = BaseError.wrap(error, { operation: 'riskyOperation' });
   *   logger.error(wrapped.toJSON());
   * }
   */
```
---
<br>

## CLASS: ValidationError
**File Path:** `CoreUtilsLib/src/errors/BaseError.ts`
**Constructor Usage:** `const instance = new ValidationError();`
**Description:** Exception for parameter or schema validation failures.

### Raw JSDoc Context:
```javascript
/**
 * Exception for parameter or schema validation failures.
 * @class ValidationError
 * @extends BaseError
 */
```

<br>

## CLASS: ConfigurationError
**File Path:** `CoreUtilsLib/src/errors/BaseError.ts`
**Constructor Usage:** `const instance = new ConfigurationError();`
**Description:** Exception for missing or malformed library/service configuration.

### Raw JSDoc Context:
```javascript
/**
 * Exception for missing or malformed library/service configuration.
 * @class ConfigurationError
 * @extends BaseError
 */
```

<br>

## CLASS: OperationError
**File Path:** `CoreUtilsLib/src/errors/BaseError.ts`
**Constructor Usage:** `const instance = new OperationError();`
**Description:** Exception for failed functional operations with recovery indicators.

### Raw JSDoc Context:
```javascript
/**
 * Exception for failed functional operations with recovery indicators.
 * @class OperationError
 * @extends BaseError
 */
```

<br>

## GLOBAL FUNCTIONS

### FUNCTION: parseDate
- **Source:** `CoreUtilsLib/src/utils/DateUtils.ts`
- **LLM Call Syntax:** `const result = parseDate(input);`
- **Pure JSDoc:**
```javascript
/**
 * Universal date parser shared by CoreUtilsLib consumers.
 * Day-first strings (GG/MM/AA, GG/MM/AAAA) parse as UTC midnight.
 * @param {Date|string|number|null|undefined} input Multi-format date input.
 * @returns {Date|null} Parsed Date object or null for invalid inputs.
 */
```

---
### FUNCTION: escapeHtmlText
- **Source:** `CoreUtilsLib/src/internal/HtmlEntityCodec.ts`
- **LLM Call Syntax:** `const result = escapeHtmlText(value);`
- **Pure JSDoc:**
```javascript
/**
 * Escapes text for an HTML text node while preserving the legacy five-character
 * output used by HtmlSanitizer.
 * @param {*} value Raw value; nullish values become an empty string.
 * @returns {string} HTML-escaped text.
 */
```

---
### FUNCTION: decodeHtmlEntities
- **Source:** `CoreUtilsLib/src/internal/HtmlEntityCodec.ts`
- **LLM Call Syntax:** `const result = decodeHtmlEntities(value);`
- **Pure JSDoc:**
```javascript
/**
 * Decodes HTML entities in a null-safe input value.
 * @param {*} value Entity-encoded text; nullish values become an empty string.
 * @returns {string} Decoded text.
 */
```

---
