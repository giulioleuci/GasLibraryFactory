# API Reference: CoreUtilsLib

## CLASS: MyService
**File Path:** `CoreUtilsLib/src/interfaces.js`
**Constructor Usage:** `const instance = new MyService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: MyLogger
**File Path:** `CoreUtilsLib/src/interfaces.js`
**Constructor Usage:** `const instance = new MyLogger();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of MyLogger

#### METHOD: MyLogger.debug
- **Scope:** instance
- **LLM Call Syntax:** `myLogger.debug(message, context);`
- **Pure JSDoc:**
```javascript
/** Method debug */
```
---
#### METHOD: MyLogger.info
- **Scope:** instance
- **LLM Call Syntax:** `myLogger.info(message, context);`
- **Pure JSDoc:**
```javascript
/** Method info */
```
---
#### METHOD: MyLogger.warn
- **Scope:** instance
- **LLM Call Syntax:** `myLogger.warn(message, context);`
- **Pure JSDoc:**
```javascript
/** Method warn */
```
---
#### METHOD: MyLogger.error
- **Scope:** instance
- **LLM Call Syntax:** `myLogger.error(message, context);`
- **Pure JSDoc:**
```javascript
/** Method error */
```
---
<br>

## CLASS: for
**File Path:** `CoreUtilsLib/src/interfaces.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: UserDataProvider
**File Path:** `CoreUtilsLib/src/interfaces.js`
**Constructor Usage:** `const instance = new UserDataProvider();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of UserDataProvider

#### METHOD: UserDataProvider.provide
- **Scope:** instance
- **LLM Call Syntax:** `userDataProvider.provide(name, params);`
- **Pure JSDoc:**
```javascript
/** Method provide */
```
---
<br>

## CLASS: ValidateInputStep
**File Path:** `CoreUtilsLib/src/interfaces.js`
**Constructor Usage:** `const instance = new ValidateInputStep();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ValidateInputStep

#### METHOD: ValidateInputStep.execute
- **Scope:** instance
- **LLM Call Syntax:** `validateInputStep.execute(context);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: ValidateInputStep.if
- **Scope:** instance
- **LLM Call Syntax:** `validateInputStep.if(!data);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ValidationUtils
**File Path:** `CoreUtilsLib/src/ValidationUtils.js`
**Constructor Usage:** `const instance = new ValidationUtils();`
**Description:** Centralized validation utilities for dependency and parameter validation.
Eliminates duplicate validation code across all GasLibraryFactory libraries.

/

import { InterfaceRegistry } from './interfaces.js';

/**
Centralized utilities for static dependency and parameter validation across libraries.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/ValidationUtils.js
 * @description Centralized validation utilities for dependency and parameter validation.
 * Eliminates duplicate validation code across all GasLibraryFactory libraries.
 * @version 1.1.0 - Added interface-based validation support
 */

import { InterfaceRegistry } from './interfaces.js';

/**
 * Centralized utilities for static dependency and parameter validation across libraries.
 * @class
 */
```

<br>

## CLASS: MyUtilsService
**File Path:** `CoreUtilsLib/src/UtilsService.js`
**Constructor Usage:** `const instance = new MyUtilsService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of MyUtilsService

#### METHOD: MyUtilsService.MILLIS_PER_DAY
- **Scope:** instance
- **LLM Call Syntax:** `myUtilsService.MILLIS_PER_DAY();`
- **Pure JSDoc:**
```javascript
/** Method MILLIS_PER_DAY */
```
---
#### METHOD: MyUtilsService.MILLIS_PER_HOUR
- **Scope:** instance
- **LLM Call Syntax:** `myUtilsService.MILLIS_PER_HOUR();`
- **Pure JSDoc:**
```javascript
/** Method MILLIS_PER_HOUR */
```
---
#### METHOD: MyUtilsService.MILLIS_PER_MINUTE
- **Scope:** instance
- **LLM Call Syntax:** `myUtilsService.MILLIS_PER_MINUTE();`
- **Pure JSDoc:**
```javascript
/** Method MILLIS_PER_MINUTE */
```
---
#### METHOD: MyUtilsService.MILLIS_PER_SECOND
- **Scope:** instance
- **LLM Call Syntax:** `myUtilsService.MILLIS_PER_SECOND();`
- **Pure JSDoc:**
```javascript
/** Method MILLIS_PER_SECOND */
```
---
<br>

## CLASS: TypeGuards
**File Path:** `CoreUtilsLib/src/TypeGuards.js`
**Constructor Usage:** `const instance = new TypeGuards();`
**Description:** Type guard utilities for consistent type checking across all libraries.
Provides both functional and object-based type checking patterns.

/

/**
Static type guard utilities for consistent runtime value validation.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/TypeGuards.js
 * @description Type guard utilities for consistent type checking across all libraries.
 * Provides both functional and object-based type checking patterns.
 * @version 1.0.0
 */

/**
 * Static type guard utilities for consistent runtime value validation.
 * @class
 */
```

### Methods of TypeGuards

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
#### METHOD: TypeGuards.if
- **Scope:** instance
- **LLM Call Syntax:** `typeGuards.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: TypeGuards.isValidObject
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isValidObject(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is a non-null object (shorthand for common pattern).
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is an object and not null
   *
   * @example
   * TypeGuards.isValidObject({});    // true
   * TypeGuards.isValidObject([]);    // true
   * TypeGuards.isValidObject(null);  // false
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
#### METHOD: TypeGuards.if
- **Scope:** instance
- **LLM Call Syntax:** `typeGuards.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TypeGuards.if
- **Scope:** instance
- **LLM Call Syntax:** `typeGuards.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TypeGuards.if
- **Scope:** instance
- **LLM Call Syntax:** `typeGuards.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TypeGuards.isTruthy
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isTruthy(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is truthy.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is truthy
   */
```
---
#### METHOD: TypeGuards.isFalsy
- **Scope:** static
- **LLM Call Syntax:** `const result = TypeGuards.isFalsy(value);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if value is falsy.
   *
   * @param {*} value - The value to check
   * @returns {boolean} True if value is falsy
   */
```
---
<br>

## CLASS: ServiceValidator
**File Path:** `CoreUtilsLib/src/ServiceValidator.js`
**Constructor Usage:** `const instance = new ServiceValidator();`
**Description:** Service-specific validation utilities for constructor dependency validation.
Centralizes the common validation patterns used across all GasLibraryFactory services.

/

import { ValidationUtils } from './ValidationUtils.js';

/**
Validates common service dependencies (logger, utils, cache, exceptions) to standardize constructor boilerplate.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/ServiceValidator.js
 * @description Service-specific validation utilities for constructor dependency validation.
 * Centralizes the common validation patterns used across all GasLibraryFactory services.
 * @version 1.0.0
 */

import { ValidationUtils } from './ValidationUtils.js';

/**
 * Validates common service dependencies (logger, utils, cache, exceptions) to standardize constructor boilerplate.
 * @class
 */
```

<br>

## CLASS: Result
**File Path:** `CoreUtilsLib/src/Result.js`
**Constructor Usage:** `const instance = new Result();`
**Description:** Shared immutable-friendly outcome wrapper base class.

Provides the common success/error value-object shape reused by domain result
types across libraries (e.g. ComposableContentLib BlockResult, PipelineFramework
PostProcessorResult), eliminating the duplicated `error`/predicate/serialization
boilerplate (F-1.4). Subclasses keep their own domain fields and factory names
and decide whether to `Object.freeze(this)` after construction.

/

/**
Base outcome wrapper. An outcome is considered successful when it carries no
error. Subclasses may layer additional semantics (explicit success flags,
frozen immutability, richer payloads) on top of this contract.

@class Result

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/Result.js
 * @description Shared immutable-friendly outcome wrapper base class.
 *
 * Provides the common success/error value-object shape reused by domain result
 * types across libraries (e.g. ComposableContentLib BlockResult, PipelineFramework
 * PostProcessorResult), eliminating the duplicated `error`/predicate/serialization
 * boilerplate (F-1.4). Subclasses keep their own domain fields and factory names
 * and decide whether to `Object.freeze(this)` after construction.
 * @version 1.0.0
 */

/**
 * Base outcome wrapper. An outcome is considered successful when it carries no
 * error. Subclasses may layer additional semantics (explicit success flags,
 * frozen immutability, richer payloads) on top of this contract.
 *
 * @class Result
 */
```

### Methods of Result

#### METHOD: Result.isSuccess
- **Scope:** instance
- **LLM Call Syntax:** `const result = result.isSuccess();`
- **Pure JSDoc:**
```javascript
/**
     * Generic success payload.
     * @type {*}
     */
    this.value = value;

    /**
     * Failure cause, or null on success.
     * @type {Error|null}
     */
    this.error = error;
  }

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
**File Path:** `CoreUtilsLib/src/LoggerService.js`
**Constructor Usage:** `const instance = new LoggerService();`
**Description:** Advanced logging service with configurable log levels.
Provides structured logging with level-based filtering.

/

/**
Hierarchical logging service with structured output and lazy evaluation.
@class LoggerService

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/LoggerService.js
 * @description Advanced logging service with configurable log levels.
 * Provides structured logging with level-based filtering.
 * @version 2.0 - Moved to CoreUtilsLib (foundation layer).
 */

/**
 * Hierarchical logging service with structured output and lazy evaluation.
 * @class LoggerService
 */
```

### Methods of LoggerService

#### METHOD: LoggerService.setLevel
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerService.setLevel(level);`
- **Pure JSDoc:**
```javascript
/**
     * Current log level.
     * @private
     * @type {string}
     */
    this._level = options.level || 'INFO';

    /**
     * Log level hierarchy mapping.
     * Lower numbers mean higher priority (less verbose).
     * @private
     * @type {Object.<string, number>}
     */
    this._logLevels = {
      OFF: 0,
      ERROR: 1,
      WARN: 2,
      INFO: 3,
      DEBUG: 4
    };
  }

  /**
   * Update the active logging threshold.
   * @param {string} level - New filter threshold identifier.
   * @returns {LoggerService} Fluent instance for chaining.
   */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(this._logLevels[level] !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(depth > maxDepth);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(value.length > 100);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(keys.length > 50);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.for
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.for(const k of keys);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: LoggerService.catch
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(result.length > maxLength);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.catch
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(typeof messageOrCallback);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(typeof message);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(context && typeof context);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(typeof msg);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(typeof msg);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(typeof msg);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(typeof msg);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: LoggerService.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerService.if(typeof msg);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SystemUtils
**File Path:** `CoreUtilsLib/src/utils/SystemUtils.js`
**Constructor Usage:** `const instance = new SystemUtils();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of SystemUtils

#### METHOD: SystemUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `systemUtils.if(typeof manager[method]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SystemScriptSettings
**File Path:** `CoreUtilsLib/src/utils/SystemScriptSettings.js`
**Constructor Usage:** `const instance = new SystemScriptSettings();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of SystemScriptSettings

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
#### METHOD: SystemScriptSettings.if
- **Scope:** instance
- **LLM Call Syntax:** `systemScriptSettings.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: SystemScriptSettings.if
- **Scope:** instance
- **LLM Call Syntax:** `systemScriptSettings.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: SystemScriptSettings.if
- **Scope:** instance
- **LLM Call Syntax:** `systemScriptSettings.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: SystemScriptSettings.if
- **Scope:** instance
- **LLM Call Syntax:** `systemScriptSettings.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: SystemScriptSettings.if
- **Scope:** instance
- **LLM Call Syntax:** `systemScriptSettings.if(!obj || typeof obj !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SystemQuotaManager
**File Path:** `CoreUtilsLib/src/utils/SystemQuotaManager.js`
**Constructor Usage:** `const instance = new SystemQuotaManager();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of SystemQuotaManager

#### METHOD: SystemQuotaManager.chunk
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.chunk(array, size);`
- **Pure JSDoc:**
```javascript
/**
   * Splits array into multiple smaller arrays of specified maximum size.
   * @param {Array} array Input collection to chunk.
   * @param {number} size Maximum length of each chunk.
   * @returns {Array[]} Collection of array segments.
   */
```
---
#### METHOD: SystemQuotaManager.unique
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.unique(array);`
- **Pure JSDoc:**
```javascript
/**
   * Deduplicates array values using a Set-based implementation for uniqueness.
   * @param {Array} array Input collection.
   * @returns {Array} Array containing only unique elements.
   */
```
---
#### METHOD: SystemQuotaManager.flatten
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.flatten(array, depth);`
- **Pure JSDoc:**
```javascript
/**
   * Flattens a nested array structure to the specified recursion depth.
   * @param {Array} array Nested input collection.
   * @param {number} [depth=1] Recursion limit (Infinity for deep flattening).
   * @returns {Array} Flattened collection.
   */
```
---
#### METHOD: SystemQuotaManager.if
- **Scope:** instance
- **LLM Call Syntax:** `systemQuotaManager.if(depth);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SystemQuotaManager.for
- **Scope:** instance
- **LLM Call Syntax:** `systemQuotaManager.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: SystemQuotaManager.flattenShallow
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.flattenShallow(array);`
- **Pure JSDoc:**
```javascript
/**
   * Flattens array structure by exactly one level.
   * @param {Array} array Nested input collection.
   * @returns {Array} Shallowly flattened array.
   */
```
---
#### METHOD: SystemQuotaManager.flattenDeep
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.flattenDeep(array);`
- **Pure JSDoc:**
```javascript
/**
   * Recursively flattens all nested array levels into a single-dimensional array.
   * @param {Array} array Nested input collection.
   * @returns {Array} Fully flattened array.
   */
```
---
#### METHOD: SystemQuotaManager.compact
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.compact(array);`
- **Pure JSDoc:**
```javascript
/**
   * Removes all falsy values (false, null, 0, "", undefined, NaN) from the array.
   * @param {Array} array Input collection.
   * @returns {Array} Filtered collection with truthy values only.
   */
```
---
#### METHOD: SystemQuotaManager.difference
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.difference(array, values);`
- **Pure JSDoc:**
```javascript
/**
   * Returns values from first array that are not present in subsequent arrays.
   * @param {Array} array Source collection to inspect.
   * @param {...Array} values Collections of values to exclude.
   * @returns {Array} Filtered collection of unique differences.
   */
```
---
#### METHOD: SystemQuotaManager.differenceBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.differenceBy(array, values, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Returns differences between arrays using an iteratee for value comparison.
   * @param {Array} array Source collection.
   * @param {Array} values Exclusion collection.
   * @param {Function|string} iteratee Criteria for element comparison.
   * @returns {Array} Filtered collection.
   */
```
---
#### METHOD: SystemQuotaManager.groupBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.groupBy(array, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Organizes array elements into an object keyed by the result of an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Logic to determine group keys.
   * @returns {Object.<string, Array>} Grouped elements object.
   */
```
---
#### METHOD: SystemQuotaManager.intersection
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.intersection(arrays);`
- **Pure JSDoc:**
```javascript
/**
   * Returns unique values present in all provided arrays.
   * @param {...Array} arrays Collections to intersect.
   * @returns {Array} Collection of common elements.
   */
```
---
#### METHOD: SystemQuotaManager.keyBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.keyBy(array, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Creates an object composed of keys generated from array elements using an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Logic to determine unique object keys.
   * @returns {Object} Object indexed by generated keys.
   */
```
---
#### METHOD: SystemQuotaManager.orderBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.orderBy(array, iteratees, orders);`
- **Pure JSDoc:**
```javascript
/**
   * Sorts array elements by specified iteratees and sort orders.
   * @param {Array} array Input collection.
   * @param {Array|string} iteratees Sort criteria.
   * @param {Array|string} orders Sort directions ('asc' or 'desc').
   * @returns {Array} Ordered collection.
   */
```
---
#### METHOD: SystemQuotaManager.uniq
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.uniq(array);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a duplicate-free version of the array using strict equality.
   * @param {Array} array Input collection.
   * @returns {Array} Unique value collection.
   */
```
---
#### METHOD: SystemQuotaManager.uniqBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.uniqBy(array, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a duplicate-free array based on an iteratee comparison.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Uniqueness criteria.
   * @returns {Array} Unique value collection.
   */
```
---
#### METHOD: SystemQuotaManager.randomInt
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.randomInt(min, max);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a pseudo-random integer within the specified inclusive range.
   * @param {number} min Minimum possible value.
   * @param {number} max Maximum possible value.
   * @returns {number} Random integer.
   */
```
---
#### METHOD: SystemQuotaManager.round
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.round(number, decimals);`
- **Pure JSDoc:**
```javascript
/**
   * Rounds a number to a specified number of decimal places.
   * @param {number} number Value to round.
   * @param {number} [decimals=0] Precision limit.
   * @returns {number} Rounded value.
   */
```
---
#### METHOD: SystemQuotaManager.clamp
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.clamp(number, min, max);`
- **Pure JSDoc:**
```javascript
/**
   * Constrains a number to stay within a defined minimum and maximum boundary.
   * @param {number} number Value to clamp.
   * @param {number} min Lower bound.
   * @param {number} max Upper bound.
   * @returns {number} Boundary-constrained value.
   */
```
---
#### METHOD: SystemQuotaManager.maxBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.maxBy(array, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Identifies the collection element with the highest value according to an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Criteria for comparison.
   * @returns {*} Element with the maximum resolved value.
   */
```
---
#### METHOD: SystemQuotaManager.minBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.minBy(array, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Identifies the collection element with the lowest value according to an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Criteria for comparison.
   * @returns {*} Element with the minimum resolved value.
   */
```
---
#### METHOD: SystemQuotaManager.sumBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.sumBy(array, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Calculates the arithmetic sum of values resolved via an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Logic to extract numeric values.
   * @returns {number} Calculated sum.
   */
```
---
#### METHOD: SystemQuotaManager.meanBy
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.meanBy(array, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Calculates the arithmetic mean (average) of values resolved via an iteratee.
   * @param {Array} array Input collection.
   * @param {Function|string} iteratee Logic to extract numeric values.
   * @returns {number} Calculated mean.
   */
```
---
#### METHOD: SystemQuotaManager.every
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.every(collection, predicate);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if all elements in the collection satisfy the provided predicate.
   * @param {Array|Object} collection Input collection.
   * @param {Function} predicate Validation logic.
   * @returns {boolean} True if every element passes.
   */
```
---
#### METHOD: SystemQuotaManager.filter
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.filter(collection, predicate);`
- **Pure JSDoc:**
```javascript
/**
   * Returns a subset of the collection containing only elements passing the predicate.
   * @param {Array|Object} collection Input collection.
   * @param {Function} predicate Filtering logic.
   * @returns {Array} Filtered subset.
   */
```
---
#### METHOD: SystemQuotaManager.find
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.find(collection, predicate, fromIndex);`
- **Pure JSDoc:**
```javascript
/**
   * Locates the first element in the collection that satisfies the predicate.
   * @param {Array|Object} collection Input collection.
   * @param {Function} predicate Search logic.
   * @param {number} [fromIndex=0] Starting search index.
   * @returns {*} First matching element or undefined.
   */
```
---
#### METHOD: SystemQuotaManager.forEach
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.forEach(collection, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Executes the provided iteratee for each element in the collection.
   * @param {Array|Object} collection Input collection.
   * @param {Function} iteratee Operation to perform.
   * @returns {Array|Object} Original collection (chainable).
   */
```
---
#### METHOD: SystemQuotaManager.map
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.map(collection, iteratee);`
- **Pure JSDoc:**
```javascript
/**
   * Creates a new array by transforming each collection element through an iteratee.
   * @param {Array|Object} collection Input collection.
   * @param {Function} iteratee Transformation logic.
   * @returns {Array} Transformed collection.
   */
```
---
#### METHOD: SystemQuotaManager.reduce
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.reduce(collection, iteratee, accumulator);`
- **Pure JSDoc:**
```javascript
/**
   * Accumulates collection elements into a single value using a reducer function.
   * @param {Array|Object} collection Input collection.
   * @param {Function} iteratee Accumulator logic.
   * @param {*} [accumulator] Initial state.
   * @returns {*} Final accumulated value.
   */
```
---
#### METHOD: SystemQuotaManager.size
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.size(collection);`
- **Pure JSDoc:**
```javascript
/**
   * Returns the count of elements in a collection, object properties, or string length.
   * @param {Array|Object|string} collection Input to measure.
   * @returns {number} Element count.
   */
```
---
#### METHOD: SystemQuotaManager.some
- **Scope:** instance
- **LLM Call Syntax:** `const result = systemQuotaManager.some(collection, predicate);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if at least one element in the collection satisfies the provided predicate.
   * @param {Array|Object} collection Input collection.
   * @param {Function} predicate Validation logic.
   * @returns {boolean} True if any element passes.
   */
```
---
<br>

## CLASS: SystemEnvironmentUtils
**File Path:** `CoreUtilsLib/src/utils/SystemEnvironmentUtils.js`
**Constructor Usage:** `const instance = new SystemEnvironmentUtils();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of SystemEnvironmentUtils

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
#### METHOD: SystemEnvironmentUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `systemEnvironmentUtils.if(!this._sleepFn);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: SystemEnvironmentUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `systemEnvironmentUtils.if(!email || typeof email !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: SystemEnvironmentUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `systemEnvironmentUtils.if(!url || typeof url !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
**File Path:** `CoreUtilsLib/src/utils/StringUtils.js`
**Constructor Usage:** `const instance = new StringUtils();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of StringUtils

#### METHOD: StringUtils.isEmpty
- **Scope:** instance
- **LLM Call Syntax:** `const result = stringUtils.isEmpty(str);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if a string is null, undefined, empty, or consists only of whitespace.
   * @param {string} str String to evaluate.
   * @returns {boolean} True if string lacks non-whitespace content.
   */
```
---
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || str.length <);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!str || typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: StringUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `stringUtils.if(!path || typeof path !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: LazyRef
**File Path:** `CoreUtilsLib/src/utils/LazyRef.js`
**Constructor Usage:** `const instance = new LazyRef();`
**Description:** @fileoverview Generic single-value lazy loader — defers an expensive
computation until first access, then caches it for the lifetime of the instance.
@author GasLibraryFactory
/

/**
@class LazyRef
@template T
Wraps a zero-argument loader function, invoking it at most once.

### Raw JSDoc Context:
```javascript
/**
 * @fileoverview Generic single-value lazy loader — defers an expensive
 * computation until first access, then caches it for the lifetime of the instance.
 * @author GasLibraryFactory
 */

/**
 * @class LazyRef
 * @template T
 * @description Wraps a zero-argument loader function, invoking it at most once.
 */
```

### Methods of LazyRef

#### METHOD: LazyRef.if
- **Scope:** instance
- **LLM Call Syntax:** `lazyRef.if(!this._resolved);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
**File Path:** `CoreUtilsLib/src/utils/IdGenerator.js`
**Constructor Usage:** `const instance = new IdGenerator();`
**Description:** Secure IdGenerator utility module with environment-aware entropy sources.

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/utils/IdGenerator.js
 * @description Secure IdGenerator utility module with environment-aware entropy sources.
 * @version 3.1 - Implemented cryptographically secure randomness and rejection sampling.
 */
```

### Methods of IdGenerator

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
#### METHOD: IdGenerator.if
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.if(typeof Utilities !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: IdGenerator.if
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.if(typeof crypto !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: IdGenerator.while
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.while(true);`
- **Pure JSDoc:**
```javascript
/** Method while */
```
---
#### METHOD: IdGenerator.for
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: IdGenerator.if
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.if(alphabet[byte]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: IdGenerator.if
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.if(typeof Utilities !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: IdGenerator.while
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.while(bytes.length < size);`
- **Pure JSDoc:**
```javascript
/** Method while */
```
---
#### METHOD: IdGenerator.for
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: IdGenerator.if
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.if(typeof crypto !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: IdGenerator.if
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.if(typeof console !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: IdGenerator.for
- **Scope:** instance
- **LLM Call Syntax:** `idGenerator.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
<br>

## CLASS: HtmlSanitizer
**File Path:** `CoreUtilsLib/src/utils/HtmlSanitizer.js`
**Constructor Usage:** `const instance = new HtmlSanitizer();`
**Description:** Centralized HTML-context escaping utilities (XSS prevention) for
rendering sheet-sourced free text/colours/URLs into generated HTML (e.g. ALDO
email boxes). Ported 1:1 from ALDO's `src/application/email/boxes.ts`.
/

/**
Static utilities for escaping/validating sheet-sourced values before HTML
interpolation. Stateless, so all methods are static (matches the
`ValidationUtils` convention used elsewhere in this library).
@class

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/utils/HtmlSanitizer.js
 * @description Centralized HTML-context escaping utilities (XSS prevention) for
 * rendering sheet-sourced free text/colours/URLs into generated HTML (e.g. ALDO
 * email boxes). Ported 1:1 from ALDO's `src/application/email/boxes.ts`.
 */

/**
 * Static utilities for escaping/validating sheet-sourced values before HTML
 * interpolation. Stateless, so all methods are static (matches the
 * `ValidationUtils` convention used elsewhere in this library).
 * @class
 */
```

### Methods of HtmlSanitizer

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
#### METHOD: HtmlSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `htmlSanitizer.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: HtmlSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `htmlSanitizer.if(value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: HtmlSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `htmlSanitizer.if(!isPlainObject);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: HtmlSanitizer.stripToPlainText
- **Scope:** static
- **LLM Call Syntax:** `const result = HtmlSanitizer.stripToPlainText(value, {{maxLength?:);`
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
#### METHOD: HtmlSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `htmlSanitizer.if(truncationMode);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: HtmlSanitizer.if
- **Scope:** instance
- **LLM Call Syntax:** `htmlSanitizer.if(truncationMode);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: instances
**File Path:** `CoreUtilsLib/src/utils/HtmlSanitizer.js`
**Constructor Usage:** `const instance = new instances();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: Delegation
**File Path:** `CoreUtilsLib/src/utils/Delegation.js`
**Constructor Usage:** `const instance = new Delegation();`
**Description:** Generic dynamic-delegation helper for Facade/Delegation-pattern classes.
Centralizes the "bind manager methods onto a facade instance" logic that was
previously copy-pasted as a private `_delegate` method across multiple libraries
(Code Reuse Initiative).

/

/**
Static utility for wiring facade methods onto a target instance by delegating
to internal collaborator (manager) objects.
@class Delegation

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/utils/Delegation.js
 * @description Generic dynamic-delegation helper for Facade/Delegation-pattern classes.
 * Centralizes the "bind manager methods onto a facade instance" logic that was
 * previously copy-pasted as a private `_delegate` method across multiple libraries
 * (Code Reuse Initiative).
 * @version 1.0.0
 */

/**
 * Static utility for wiring facade methods onto a target instance by delegating
 * to internal collaborator (manager) objects.
 * @class Delegation
 */
```

### Methods of Delegation

#### METHOD: Delegation.delegateMethods
- **Scope:** static
- **LLM Call Syntax:** `const result = Delegation.delegateMethods(target, {Array<{manager:, {{warn:);`
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
#### METHOD: Delegation.if
- **Scope:** instance
- **LLM Call Syntax:** `delegation.if(typeof manager[method]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Delegation.if
- **Scope:** instance
- **LLM Call Syntax:** `delegation.if(logger);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SpreadsheetService
**File Path:** `CoreUtilsLib/src/utils/Delegation.js`
**Constructor Usage:** `const instance = new SpreadsheetService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: DateUtils
**File Path:** `CoreUtilsLib/src/utils/DateUtils.js`
**Constructor Usage:** `const instance = new DateUtils();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of DateUtils

#### METHOD: DateUtils.parseDate
- **Scope:** instance
- **LLM Call Syntax:** `const result = dateUtils.parseDate(input);`
- **Pure JSDoc:**
```javascript
/**
   * Milliseconds in one day (86,400,000).
   * @returns {number} 86400000
   * @example
   * const daysInMs = DateUtils.MILLIS_PER_DAY * 7; // 1 week in milliseconds
   */
  static get MILLIS_PER_DAY() {
    return 24 * 60 * 60 * 1000;
  }

  /**
   * Milliseconds in one hour (3,600,000).
   * @returns {number} 3600000
   * @example
   * const timeout = DateUtils.MILLIS_PER_HOUR * 2; // 2 hours
   */
  static get MILLIS_PER_HOUR() {
    return 60 * 60 * 1000;
  }

  /**
   * Milliseconds in one minute (60,000).
   * @returns {number} 60000
   * @example
   * const delay = DateUtils.MILLIS_PER_MINUTE * 5; // 5 minutes
   */
  static get MILLIS_PER_MINUTE() {
    return 60 * 1000;
  }

  /**
   * Milliseconds in one second (1,000).
   * @returns {number} 1000
   * @example
   * const timeout = DateUtils.MILLIS_PER_SECOND * 30; // 30 seconds
   */
  static get MILLIS_PER_SECOND() {
    return 1000;
  }

  /**
   * Universal date parser for Date objects, ISO strings, Unix timestamps (>=100k), and Sheets serials (<100k).
   * @param {Date|string|number|null|undefined} input Multi-format date input.
   * @returns {Date|null} Parsed Date object or null for invalid inputs.
   */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(!input && input !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(input instanceof Date);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(typeof input);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(typeof input);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(input > 0 && input < 100000);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(typeof isoString !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(!dateString || !format);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(formatUpper);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(parts.length !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(formatUpper);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(parts.length !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(formatUpper);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(parts.length !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: DateUtils.addDays
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.addDays(date, days);`
- **Pure JSDoc:**
```javascript
/** Method addDays */
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
- **LLM Call Syntax:** `const result = dateUtils.formatDuration(ms, {{short?:boolean,);`
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
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(ms);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(ms < 1000);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(days > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(hours > 0 || days > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(hours > 0 || !short);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(minutes > 0 || hours > 0 || days > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(minutes > 0 || !short);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(seconds > 0 || parts.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(short);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(showMs);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `dateUtils.if(milliseconds > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: DateRange
**File Path:** `CoreUtilsLib/src/utils/DateRange.js`
**Constructor Usage:** `const instance = new DateRange();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of DateRange

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
- **LLM Call Syntax:** `dateRange.contains(date);`
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
- **LLM Call Syntax:** `dateRange.overlaps(other);`
- **Pure JSDoc:**
```javascript
/** True if this range and `other` share at least one instant. */
```
---
<br>

## CLASS: CellValueCoercion
**File Path:** `CoreUtilsLib/src/utils/CellValueCoercion.js`
**Constructor Usage:** `const instance = new CellValueCoercion();`
**Description:** Centralized Sheets-cell-value coercion (string -> number/boolean)
shared by libraries that read raw Sheets API values and need consistent
primitive normalization (e.g. SheetDBLib's TableService, GasDataImporter's
SourceStrategy). Ported 1:1 from the duplicated `_coerceValue` implementations.
/

/**
Static utilities for normalizing raw Sheets API cell values into JS
primitives. Stateless, so all methods are static (matches the
`HtmlSanitizer`/`ValidationUtils` convention used elsewhere in this library).
@class

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/utils/CellValueCoercion.js
 * @description Centralized Sheets-cell-value coercion (string -> number/boolean)
 * shared by libraries that read raw Sheets API values and need consistent
 * primitive normalization (e.g. SheetDBLib's TableService, GasDataImporter's
 * SourceStrategy). Ported 1:1 from the duplicated `_coerceValue` implementations.
 */

/**
 * Static utilities for normalizing raw Sheets API cell values into JS
 * primitives. Stateless, so all methods are static (matches the
 * `HtmlSanitizer`/`ValidationUtils` convention used elsewhere in this library).
 * @class
 */
```

### Methods of CellValueCoercion

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
#### METHOD: CellValueCoercion.if
- **Scope:** instance
- **LLM Call Syntax:** `cellValueCoercion.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CellValueCoercion.if
- **Scope:** instance
- **LLM Call Syntax:** `cellValueCoercion.if(typeof value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CellValueCoercion.if
- **Scope:** instance
- **LLM Call Syntax:** `cellValueCoercion.if(lower);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: CellValueCoercion.if
- **Scope:** instance
- **LLM Call Syntax:** `cellValueCoercion.if(lower);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: LoggerServiceMock
**File Path:** `CoreUtilsLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new LoggerServiceMock();`
**Description:** Centralized high-fidelity mocks for CoreUtilsLib services.

/

/**
High-fidelity mock for LoggerService with jest.fn() instrumentation and method chaining.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for CoreUtilsLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity mock for LoggerService with jest.fn() instrumentation and method chaining.
 * @class
 */
```

### Methods of LoggerServiceMock

#### METHOD: LoggerServiceMock.hasLog
- **Scope:** instance
- **LLM Call Syntax:** `const result = loggerServiceMock.hasLog(level, pattern);`
- **Pure JSDoc:**
```javascript
/**
   * Checks for log messages matching level and pattern in jest.fn() calls.
   * @param {string} level Log level.
   * @param {string|RegExp} pattern Pattern to match.
   * @returns {boolean} True if match exists.
   */
```
---
#### METHOD: LoggerServiceMock.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerServiceMock.if(pattern instanceof RegExp);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
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
#### METHOD: LoggerServiceMock.if
- **Scope:** instance
- **LLM Call Syntax:** `loggerServiceMock.if(mock && mock.mock);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
**File Path:** `CoreUtilsLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new UtilsServiceMock();`
**Description:** Checks for log messages matching level and pattern in jest.fn() calls.

### Raw JSDoc Context:
```javascript
/**
   * Checks for log messages matching level and pattern in jest.fn() calls.
   * @param {string} level Log level.
   * @param {string|RegExp} pattern Pattern to match.
   * @returns {boolean} True if match exists.
   */
  hasLog(level, pattern) {
    const methodName = level.toLowerCase();
    const mock = this[methodName];
    if (!mock || !mock.mock) return false;

    return mock.mock.calls.some((call) => {
      const msg = typeof call[0] === 'function' ? call[0]() : call[0];
      if (pattern instanceof RegExp) {
        return pattern.test(msg);
      }
      return String(msg).includes(pattern);
    });
  }

  /**
   * Reconstructs all recorded log entries from individual level mock calls.
   * @returns {Array<Object>} Recorded log entries.
   */
  getLogs() {
    const logs = [];
    ['debug', 'info', 'warn', 'error', 'fatal', 'log'].forEach((level) => {
      const mock = this[level];
      if (mock && mock.mock) {
        mock.mock.calls.forEach((call) => {
          logs.push({
            level: level.toUpperCase(),
            message: typeof call[0] === 'function' ? call[0]() : call[0],
            context: call[1] || null
          });
        });
      }
    });
    return logs;
  }

  /**
   * Filters captured logs by case-insensitive level identifier.
   * @param {string} level Log level (DEBUG|INFO|WARN|ERROR|FATAL|LOG).
   * @returns {Array<{level:string, message:string, context:Object|null}>}
   */
  getLogsByLevel(level) {
    return this.getLogs().filter((log) => log.level === level.toUpperCase());
  }

  /**
   * Filters captured logs by message content using string or regular expression.
   * @param {string|RegExp} pattern Search pattern for log message matching.
   * @returns {Array<{level:string, message:string, context:Object|null}>}
   */
  getLogsMatching(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return this.getLogs().filter((log) => regex.test(log.message));
  }

  /**
   * Checks if any captured log entry matches specified level and message pattern.
   * @param {string} level Case-insensitive log level identifier.
   * @param {string|RegExp} pattern Message content or pattern to match.
   * @returns {boolean} True if matching log entry is found.
   */
  hasLog(level, pattern) {
    const logs = this.getLogsByLevel(level);
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    return logs.some((log) => regex.test(log.message));
  }

  /**
   * Outputs all recorded log entries to the system console.
   */
  printLogs() {
    this.getLogs().forEach((log) => {
      console.log(`[${log.level}] ${log.message}`, log.context || '');
    });
  }

  /**
   * Resets all internal Jest mock functions and call history.
   * @returns {this} Chainable mock instance for fluent API usage.
   */
  reset() {
    this.debug.mockClear();
    this.info.mockClear();
    this.warn.mockClear();
    this.error.mockClear();
    this.fatal.mockClear();
    this.setLevel.mockClear();
    this.getLevel.mockClear();
    this.child.mockClear();
    this.clear.mockClear();
    return this;
  }
}

/**
 * Mock for UtilsService providing common utility behaviors with jest.fn() instrumentation.
 * @class
 */
```

<br>

## CLASS: CacheInterfaceMock
**File Path:** `CoreUtilsLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new CacheInterfaceMock();`
**Description:** Mock for CacheInterface implementing a simple in-memory store for testing.

### Raw JSDoc Context:
```javascript
/**
 * Mock for CacheInterface implementing a simple in-memory store for testing.
 * @class
 */
```

### Methods of CacheInterfaceMock

#### METHOD: CacheInterfaceMock.for
- **Scope:** instance
- **LLM Call Syntax:** `cacheInterfaceMock.for(const [cacheKey] of this._store);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
<br>

## CLASS: Registry
**File Path:** `CoreUtilsLib/src/internal/Registry.js`
**Constructor Usage:** `const instance = new Registry();`
**Description:** Generic Map-backed registry primitive shared across libraries.

Centralizes the `register/get/has/unregister/clear/keys/size` storage plumbing
that was previously re-implemented in every per-library registry (F-1.5).
Libraries with bespoke validation, error types, or dual-store (singleton +
factory) semantics compose an instance of this class for storage while keeping
their own public API, messages, and behavior.

/

/**
Generic key/value registry backed by a Map.

@class Registry
@template T

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/internal/Registry.js
 * @description Generic Map-backed registry primitive shared across libraries.
 *
 * Centralizes the `register/get/has/unregister/clear/keys/size` storage plumbing
 * that was previously re-implemented in every per-library registry (F-1.5).
 * Libraries with bespoke validation, error types, or dual-store (singleton +
 * factory) semantics compose an instance of this class for storage while keeping
 * their own public API, messages, and behavior.
 * @version 1.0.0
 */

/**
 * Generic key/value registry backed by a Map.
 *
 * @class Registry
 * @template T
 */
```

### Methods of Registry

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
#### METHOD: Registry.if
- **Scope:** instance
- **LLM Call Syntax:** `registry.if(this._validateValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Registry.if
- **Scope:** instance
- **LLM Call Syntax:** `registry.if(existed && !overwrite);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: Registry.if
- **Scope:** instance
- **LLM Call Syntax:** `registry.if(this._logger && typeof this._logger.debug);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: Registry.size
- **Scope:** instance
- **LLM Call Syntax:** `registry.size();`
- **Pure JSDoc:**
```javascript
/** Method size */
```
---
<br>

## CLASS: RegexUtils
**File Path:** `CoreUtilsLib/src/internal/RegexUtils.js`
**Constructor Usage:** `const instance = new RegexUtils();`
**Description:** Regular expression utilities for safe regex handling and escaping.
Provides ReDoS (Regular Expression Denial of Service) protection and regex escaping.

/

/**
Static security utility for safe regular expression handling and ReDoS prevention.
@class RegexUtils

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/RegexUtils.js
 * @description Regular expression utilities for safe regex handling and escaping.
 * Provides ReDoS (Regular Expression Denial of Service) protection and regex escaping.
 * @version 1.0
 */

/**
 * Static security utility for safe regular expression handling and ReDoS prevention.
 * @class RegexUtils
 */
```

<br>

## CLASS: PlaceholderUtils
**File Path:** `CoreUtilsLib/src/internal/PlaceholderUtils.js`
**Constructor Usage:** `const instance = new PlaceholderUtils();`
**Description:** Utilities for working with placeholder patterns like {{fieldName}}.
Centralizes placeholder extraction and manipulation across all GasLibraryFactory libraries.

/

/**
Static utility for mustache-style placeholder extraction, detection, and basic replacement.
@class PlaceholderUtils

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/PlaceholderUtils.js
 * @description Utilities for working with placeholder patterns like {{fieldName}}.
 * Centralizes placeholder extraction and manipulation across all GasLibraryFactory libraries.
 * @version 1.0.0
 */

/**
 * Static utility for mustache-style placeholder extraction, detection, and basic replacement.
 * @class PlaceholderUtils
 */
```

<br>

## CLASS: PiiRedactor
**File Path:** `CoreUtilsLib/src/internal/PiiRedactor.js`
**Constructor Usage:** `const instance = new PiiRedactor();`
**Description:** Utility for redacting Personally Identifiable Information (PII) from strings.
Provides comprehensive redaction for common PII patterns in error messages and logs.

/

/**
Static utility for detecting and masking Personally Identifiable Information (PII) using regex patterns.
@class PiiRedactor

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/PiiRedactor.js
 * @description Utility for redacting Personally Identifiable Information (PII) from strings.
 * Provides comprehensive redaction for common PII patterns in error messages and logs.
 * @version 1.0.0
 */

/**
 * Static utility for detecting and masking Personally Identifiable Information (PII) using regex patterns.
 * @class PiiRedactor
 */
```

### Methods of PiiRedactor

#### METHOD: PiiRedactor.redact
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redact(message);`
- **Pure JSDoc:**
```javascript
/**
   * Default masking labels for recognized PII categories.
   * @static
   * @type {Object<string, string>}
   */
  static get REDACTION_LABELS() {
    return {
      EMAIL: '[EMAIL_REDACTED]',
      TOKEN: '[TOKEN_REDACTED]',
      API_KEY: '[KEY_REDACTED]',
      URL_PARAMS: '[PARAMS_REDACTED]',
      JWT: '[JWT_REDACTED]',
      CREDIT_CARD: '[CC_REDACTED]',
      PHONE: '[PHONE_REDACTED]',
      SESSION_ID: '[ID_REDACTED]'
    };
  }

  /**
   * Collection of regular expressions for PII detection.
   * @static
   * @type {Object<string, RegExp>}
   */
  static get PATTERNS() {
    return {
      EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      TOKEN: /\b(bearer|token|oauth)\s+[\w\-._~+/]+=*/gi,
      API_KEY: /\b(api[_-]?key|apikey|key)[=:]\s*['"]?[\w-]{20,}['"]?/gi,
      URL_PARAMS: /(https?:\/\/[^\s?]+)\?[^\s]*/gi,
      JWT: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
      CREDIT_CARD: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      PHONE: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      SESSION_ID: /\b[A-Fa-f0-9]{32,}\b/g
    };
  }

  /**
   * Mask all recognized PII patterns within a text string.
   * @param {string} message - Input text to sanitize.
   * @returns {string} Sanitized string with masked placeholders.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.redactEmails
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redactEmails(message, label);`
- **Pure JSDoc:**
```javascript
/**
   * Mask email addresses using a specific or default placeholder.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.redactTokens
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redactTokens(message, label);`
- **Pure JSDoc:**
```javascript
/**
   * Mask OAuth and Bearer tokens while preserving the prefix.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.redactApiKeys
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redactApiKeys(message, label);`
- **Pure JSDoc:**
```javascript
/**
   * Mask API keys identified by common key-value delimiters.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.redactUrlParams
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redactUrlParams(message, label);`
- **Pure JSDoc:**
```javascript
/**
   * Mask URL query parameters to prevent exposure of sensitive GET data.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.redactJwt
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redactJwt(message, label);`
- **Pure JSDoc:**
```javascript
/**
   * Mask JSON Web Tokens (JWT) based on base64 segment patterns.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.redactCreditCards
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redactCreditCards(message, label);`
- **Pure JSDoc:**
```javascript
/**
   * Mask credit card numbers matching 16-digit patterns.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.redactPhones
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redactPhones(message, label);`
- **Pure JSDoc:**
```javascript
/**
   * Mask phone numbers matching common US and international formats.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.redactSessionIds
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.redactSessionIds(message, label);`
- **Pure JSDoc:**
```javascript
/**
   * Mask long hexadecimal strings often used as session identifiers.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.containsPii
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.containsPii(message);`
- **Pure JSDoc:**
```javascript
/**
   * Validate if a string contains any detectable PII patterns.
   * @param {string} message - Text to inspect.
   * @returns {boolean} True if any pattern matches.
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: PiiRedactor.detectPiiTypes
- **Scope:** static
- **LLM Call Syntax:** `const result = PiiRedactor.detectPiiTypes(message);`
- **Pure JSDoc:**
```javascript
/**
   * Isolate which PII categories are present in a message.
   * @param {string} message - Text to inspect.
   * @returns {string[]} List of detected category identifiers (e.g., ['EMAIL', 'PHONE']).
   */
```
---
#### METHOD: PiiRedactor.if
- **Scope:** instance
- **LLM Call Syntax:** `piiRedactor.if(typeof message !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: LazyServiceContainer
**File Path:** `CoreUtilsLib/src/internal/LazyServiceContainer.js`
**Constructor Usage:** `const instance = new LazyServiceContainer();`
**Description:** Generic lazy-singleton dependency-injection container.

Extracted from the register/lazy-resolve/reset idiom `GoogleApiWrapper`'s
`ServiceFactory` establishes for native-Google-service singletons, but
generalized for any consumer app's own domain/application-service wiring
(ref REPORT_GLF.md B8) — `ServiceFactory` itself stays scoped to
Drive/Sheets/Docs/Gmail/Logger/Utilities/Cache/Exception; this is the
shared, app-agnostic machinery underneath that idiom.

/

import { Registry } from './Registry.js';

/**
Lazy-singleton service container: register a factory under a name, resolve
it (and cache the result) on first `get()`, share the cached instance on
every subsequent `get()` until `reset()`.

@class LazyServiceContainer
@template T

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/internal/LazyServiceContainer.js
 * @description Generic lazy-singleton dependency-injection container.
 *
 * Extracted from the register/lazy-resolve/reset idiom `GoogleApiWrapper`'s
 * `ServiceFactory` establishes for native-Google-service singletons, but
 * generalized for any consumer app's own domain/application-service wiring
 * (ref REPORT_GLF.md B8) — `ServiceFactory` itself stays scoped to
 * Drive/Sheets/Docs/Gmail/Logger/Utilities/Cache/Exception; this is the
 * shared, app-agnostic machinery underneath that idiom.
 * @version 1.0.0
 */

import { Registry } from './Registry.js';

/**
 * Lazy-singleton service container: register a factory under a name, resolve
 * it (and cache the result) on first `get()`, share the cached instance on
 * every subsequent `get()` until `reset()`.
 *
 * @class LazyServiceContainer
 * @template T
 */
```

<br>

## CLASS: HashUtils
**File Path:** `CoreUtilsLib/src/internal/HashUtils.js`
**Constructor Usage:** `const instance = new HashUtils();`
**Description:** Hash utility functions for generating consistent string hashes.
Provides cryptographic SHA-256 hashing using Google Apps Script's native Utilities.

/

/**
Cryptographic utility for deterministic SHA-256 hashing of strings and objects.
@class HashUtils

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/HashUtils.js
 * @description Hash utility functions for generating consistent string hashes.
 * Provides cryptographic SHA-256 hashing using Google Apps Script's native Utilities.
 * @version 3.0 - Upgraded to SHA-256 for better security and collision resistance
 */

/**
 * Cryptographic utility for deterministic SHA-256 hashing of strings and objects.
 * @class HashUtils
 */
```

### Methods of HashUtils

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
#### METHOD: HashUtils.if
- **Scope:** instance
- **LLM Call Syntax:** `hashUtils.if(typeof str !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: CacheUtils
**File Path:** `CoreUtilsLib/src/internal/CacheUtils.js`
**Constructor Usage:** `const instance = new CacheUtils();`
**Description:** Utilities for cache key generation and cache-related operations.
Provides consistent cache key patterns across all libraries.

/

import { HashUtils } from './HashUtils.js';

/**
Static utility provider for standardized cache key generation and TTL management.
@class CacheUtils

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/CacheUtils.js
 * @description Utilities for cache key generation and cache-related operations.
 * Provides consistent cache key patterns across all libraries.
 * @version 1.0.0
 */

import { HashUtils } from './HashUtils.js';

/**
 * Static utility provider for standardized cache key generation and TTL management.
 * @class CacheUtils
 */
```

<br>

## CLASS: BoundedMap
**File Path:** `CoreUtilsLib/src/internal/BoundedMap.js`
**Constructor Usage:** `const instance = new BoundedMap();`
**Description:** A Map with automatic size limiting and FIFO eviction.
Useful for in-memory caches that need to prevent unbounded growth.

/

/**
Map implementation with automatic size limiting and FIFO eviction.
@class BoundedMap
@extends Map

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/BoundedMap.js
 * @description A Map with automatic size limiting and FIFO eviction.
 * Useful for in-memory caches that need to prevent unbounded growth.
 * @version 1.0.0
 */

/**
 * Map implementation with automatic size limiting and FIFO eviction.
 * @class BoundedMap
 * @extends Map
 */
```

### Methods of BoundedMap

#### METHOD: BoundedMap.if
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.if(onEvict !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: BoundedMap.set
- **Scope:** instance
- **LLM Call Syntax:** `const result = boundedMap.set(key, value);`
- **Pure JSDoc:**
```javascript
/**
     * Maximum number of entries.
     * @private
     * @type {number}
     */
    this._maxSize = maxSize;

    /**
     * Callback function called when an entry is evicted.
     * @private
     * @type {Function|null}
     */
    this._onEvict = onEvict;

    /**
     * Count of evictions since creation or last reset.
     * @private
     * @type {number}
     */
    this._evictionCount = 0;
  }

  /**
   * Gets the maximum size of the map.
   *
   * @returns {number} The maximum number of entries allowed
   */
  get maxSize() {
    return this._maxSize;
  }

  /**
   * Gets the number of evictions that have occurred.
   *
   * @returns {number} Total eviction count
   */
  get evictionCount() {
    return this._evictionCount;
  }

  /**
   * Checks if the map is at capacity.
   *
   * @returns {boolean} True if size equals maxSize
   */
  get isFull() {
    return this.size >= this._maxSize;
  }

  /**
   * Gets the number of available slots.
   *
   * @returns {number} Number of entries that can be added before eviction
   */
  get available() {
    return Math.max(0, this._maxSize - this.size);
  }

  /**
   * Add or update a key-value pair, triggering FIFO eviction if at capacity.
   * @param {*} key - Lookup identifier.
   * @param {*} value - Associated data payload.
   * @returns {BoundedMap} Fluent instance for chaining.
   */
```
---
#### METHOD: BoundedMap.if
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.if(this.size >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: BoundedMap.if
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.if(firstKey !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: BoundedMap.if
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.if(this._onEvict);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: BoundedMap.setAll
- **Scope:** instance
- **LLM Call Syntax:** `const result = boundedMap.setAll(entries);`
- **Pure JSDoc:**
```javascript
/**
   * Batch insert multiple key-value pairs with automatic bound enforcement.
   * @param {Iterable<[*, *]>} entries - Collection of [key, value] tuples.
   * @returns {BoundedMap} Fluent instance for chaining.
   */
```
---
#### METHOD: BoundedMap.for
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.for(const [key, value] of entries);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: BoundedMap.getOrCompute
- **Scope:** instance
- **LLM Call Syntax:** `const result = boundedMap.getOrCompute(key, factory);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieve a value or compute and store it using a factory if absent.
   * @param {*} key - Lookup identifier.
   * @param {Function} [factory=null] - Value generator: (key) => *.
   * @returns {*} Retrieved or computed value.
   */
```
---
#### METHOD: BoundedMap.if
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.if(factory);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: BoundedMap.clear
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.clear();`
- **Pure JSDoc:**
```javascript
/**
   * Clear all entries and reset the internal eviction counter.
   */
```
---
#### METHOD: BoundedMap.resetEvictionCount
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.resetEvictionCount();`
- **Pure JSDoc:**
```javascript
/**
   * Reset the internal eviction counter without clearing data.
   */
```
---
#### METHOD: BoundedMap.getStats
- **Scope:** instance
- **LLM Call Syntax:** `const result = boundedMap.getStats();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieve operational metrics including size, capacity, and eviction counts.
   * @returns {Object} Metric summary with utilization and performance data.
   */
```
---
#### METHOD: BoundedMap.clone
- **Scope:** instance
- **LLM Call Syntax:** `const result = boundedMap.clone();`
- **Pure JSDoc:**
```javascript
/**
   * Create an empty BoundedMap instance with identical capacity settings.
   * @returns {BoundedMap} New empty instance.
   */
```
---
#### METHOD: BoundedMap.copy
- **Scope:** instance
- **LLM Call Syntax:** `const result = boundedMap.copy();`
- **Pure JSDoc:**
```javascript
/**
   * Create a new BoundedMap instance with a shallow copy of all current entries.
   * @returns {BoundedMap} New populated instance.
   */
```
---
#### METHOD: BoundedMap.for
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.for(const [key, value] of this);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: BoundedMap.resize
- **Scope:** instance
- **LLM Call Syntax:** `const result = boundedMap.resize(newMaxSize);`
- **Pure JSDoc:**
```javascript
/**
   * Dynamically update capacity limit, potentially triggering immediate FIFO evictions.
   * @param {number} newMaxSize - Updated capacity limit.
   * @returns {number} Count of entries evicted during the resize operation.
   */
```
---
#### METHOD: BoundedMap.while
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.while(this.size > newMaxSize);`
- **Pure JSDoc:**
```javascript
/** Method while */
```
---
#### METHOD: BoundedMap.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = boundedMap.toJSON();`
- **Pure JSDoc:**
```javascript
/**
   * Serialize map entries and metadata to a plain object.
   * @returns {Object} JSON-compatible representation with entries and stats.
   */
```
---
#### METHOD: BoundedMap.fromJSON
- **Scope:** static
- **LLM Call Syntax:** `const result = BoundedMap.fromJSON(json, onEvict);`
- **Pure JSDoc:**
```javascript
/**
   * Reconstruct a BoundedMap from a serialized JSON object.
   * @param {Object} json - Serialized state containing entries and maxSize.
   * @param {Function} [onEvict=null] - Lifecycle hook for evicted entries.
   * @returns {BoundedMap} Hydrated BoundedMap instance.
   */
```
---
#### METHOD: BoundedMap.if
- **Scope:** instance
- **LLM Call Syntax:** `boundedMap.if(json.entries);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: BaseError
**File Path:** `CoreUtilsLib/src/errors/BaseError.js`
**Constructor Usage:** `const instance = new BaseError();`
**Description:** Base error class providing standardized error handling across all libraries.
Eliminates duplicate stack trace capture and serialization code.

/

/**
Base standardized error class for all GasLibraryFactory custom exceptions.
@class BaseError
@extends Error

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/BaseError.js
 * @description Base error class providing standardized error handling across all libraries.
 * Eliminates duplicate stack trace capture and serialization code.
 * @version 1.0.0
 */

/**
 * Base standardized error class for all GasLibraryFactory custom exceptions.
 * @class BaseError
 * @extends Error
 */
```

### Methods of BaseError

#### METHOD: BaseError.toJSON
- **Scope:** instance
- **LLM Call Syntax:** `const result = baseError.toJSON();`
- **Pure JSDoc:**
```javascript
/**
     * The name of the error class.
     * @type {string}
     */
    this.name = this.constructor.name;

    /**
     * Additional context/metadata for the error.
     * @type {Object}
     */
    this.context = context;

    /**
     * ISO timestamp when the error occurred.
     * @type {string}
     */
    this.timestamp = new Date().toISOString();

    /**
     * The original error that was caught (for error chaining).
     * @type {Error|null}
     */
    this.originalError = originalError;

    // Capture stack trace, excluding the constructor from the trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Gets the original error message if one exists.
   *
   * @returns {string|null} The original error message or null
   */
  get originalMessage() {
    return this.originalError ? this.originalError.message : null;
  }

  /**
   * Checks if this error wraps another error.
   *
   * @returns {boolean} True if an original error exists
   */
  get hasOriginalError() {
    return this.originalError !== null;
  }

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
#### METHOD: BaseError.if
- **Scope:** instance
- **LLM Call Syntax:** `baseError.if(this.originalError);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: BaseError.if
- **Scope:** instance
- **LLM Call Syntax:** `baseError.if(error instanceof BaseError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ValidationError
**File Path:** `CoreUtilsLib/src/errors/BaseError.js`
**Constructor Usage:** `const instance = new ValidationError();`
**Description:** Initialize BaseError with message, metadata context, and optional cause chaining.

### Raw JSDoc Context:
```javascript
/**
   * Initialize BaseError with message, metadata context, and optional cause chaining.
   * @param {string} message - Error description.
   * @param {Object} [context={}] - Metadata for diagnostic tracking.
   * @param {Error} [originalError=null] - Upstream exception being wrapped.
   */
  constructor(message, context = {}, originalError = null) {
    super(message);

    /**
     * The name of the error class.
     * @type {string}
     */
    this.name = this.constructor.name;

    /**
     * Additional context/metadata for the error.
     * @type {Object}
     */
    this.context = context;

    /**
     * ISO timestamp when the error occurred.
     * @type {string}
     */
    this.timestamp = new Date().toISOString();

    /**
     * The original error that was caught (for error chaining).
     * @type {Error|null}
     */
    this.originalError = originalError;

    // Capture stack trace, excluding the constructor from the trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Gets the original error message if one exists.
   *
   * @returns {string|null} The original error message or null
   */
  get originalMessage() {
    return this.originalError ? this.originalError.message : null;
  }

  /**
   * Checks if this error wraps another error.
   *
   * @returns {boolean} True if an original error exists
   */
  get hasOriginalError() {
    return this.originalError !== null;
  }

  /**
   * Serialize error state to a plain object for logging or transport.
   * @returns {Object} JSON-compatible representation including name, message, context, and stack.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack
          }
        : null,
      stack: this.stack
    };
  }

  /**
   * Generate a formatted string including error type, message, and serialized context.
   * @returns {string} Human-readable error summary.
   */
  toString() {
    let result = `${this.name}: ${this.message}`;

    if (this.context && Object.keys(this.context).length > 0) {
      result += '\nContext: ' + JSON.stringify(this.context, null, 2);
    }

    if (this.originalError) {
      result += `\nCaused by: ${this.originalError.name}: ${this.originalError.message}`;
    }

    return result;
  }

  /**
   * Create a shallow clone of the error with additional merged metadata.
   * @param {Object} additionalContext - New metadata to append to existing context.
   * @returns {BaseError} New instance with updated context and preserved stack trace.
   */
  withContext(additionalContext) {
    const mergedContext = { ...this.context, ...additionalContext };
    const newError = new this.constructor(this.message, mergedContext, this.originalError);
    newError.stack = this.stack; // Preserve original stack
    return newError;
  }

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
  static wrap(error, context = {}) {
    if (error instanceof BaseError) {
      return Object.keys(context).length > 0 ? error.withContext(context) : error;
    }

    // Handle non-Error throws
    if (!(error instanceof Error)) {
      return new BaseError(String(error), context);
    }

    return new BaseError(error.message, context, error);
  }
}

/**
 * Exception for parameter or schema validation failures.
 * @class ValidationError
 * @extends BaseError
 */
```

<br>

## CLASS: ConfigurationError
**File Path:** `CoreUtilsLib/src/errors/BaseError.js`
**Constructor Usage:** `const instance = new ConfigurationError();`
**Description:** Initialize ValidationError with specific field and value identifiers.

### Raw JSDoc Context:
```javascript
/**
   * Initialize ValidationError with specific field and value identifiers.
   * @param {string} message - Validation failure reason.
   * @param {string} [field=null] - Identifier of the invalid property.
   * @param {*} [value=undefined] - The value that failed validation.
   * @param {Object} [context={}] - Additional diagnostic metadata.
   */
  constructor(message, field = null, value = undefined, context = {}) {
    super(message, { ...context, field, value });
    this.field = field;
    this.value = value;
  }
}

/**
 * Exception for missing or malformed library/service configuration.
 * @class ConfigurationError
 * @extends BaseError
 */
```

<br>

## CLASS: OperationError
**File Path:** `CoreUtilsLib/src/errors/BaseError.js`
**Constructor Usage:** `const instance = new OperationError();`
**Description:** Initialize ConfigurationError with the problematic configuration key.

### Raw JSDoc Context:
```javascript
/**
   * Initialize ConfigurationError with the problematic configuration key.
   * @param {string} message - Configuration failure reason.
   * @param {string} [configKey=null] - Identifier of the missing/invalid setting.
   * @param {Object} [context={}] - Additional diagnostic metadata.
   */
  constructor(message, configKey = null, context = {}) {
    super(message, { ...context, configKey });
    this.configKey = configKey;
  }
}

/**
 * Exception for failed functional operations with recovery indicators.
 * @class OperationError
 * @extends BaseError
 */
```

<br>

## CLASS: ConfigurationBuilder
**File Path:** `CoreUtilsLib/src/builders/ConfigurationBuilder.js`
**Constructor Usage:** `const instance = new ConfigurationBuilder();`
**Description:** Utilities for building and validating configuration objects with defaults.
Centralizes configuration pattern across all GasLibraryFactory libraries.

/

import { cloneDeep, merge } from '../facades/LodashFacade.js';
import { ConfigMergeStrategy } from './ConfigMergeStrategy.js';
import { ConfigValidator } from './ConfigValidator.js';

/**
Singletons for internal strategies
/
const mergeStrategy = new ConfigMergeStrategy();
const validator = new ConfigValidator();

/**
Static facade and fluent builder for deep configuration merging and schema validation.
@class ConfigurationBuilder

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/ConfigurationBuilder.js
 * @description Utilities for building and validating configuration objects with defaults.
 * Centralizes configuration pattern across all GasLibraryFactory libraries.
 * @version 1.1.0 - Refactored to Facade/Delegation pattern
 */

import { cloneDeep, merge } from '../facades/LodashFacade.js';
import { ConfigMergeStrategy } from './ConfigMergeStrategy.js';
import { ConfigValidator } from './ConfigValidator.js';

/**
 * Singletons for internal strategies
 */
const mergeStrategy = new ConfigMergeStrategy();
const validator = new ConfigValidator();

/**
 * Static facade and fluent builder for deep configuration merging and schema validation.
 * @class ConfigurationBuilder
 */
```

<br>

## CLASS: ConfigValidator
**File Path:** `CoreUtilsLib/src/builders/ConfigValidator.js`
**Constructor Usage:** `const instance = new ConfigValidator();`
**Description:** Provides validation and type coercion for configurations.

### Raw JSDoc Context:
```javascript
/**
 * @file CoreUtilsLib/src/config/ConfigValidator.js
 * @description Provides validation and type coercion for configurations.
 * @version 1.0.0
 */
```

### Methods of ConfigValidator

#### METHOD: ConfigValidator.validateConfiguration
- **Scope:** instance
- **LLM Call Syntax:** `const result = configValidator.validateConfiguration(config, rules, context);`
- **Pure JSDoc:**
```javascript
/**
   * Validates configuration object against provided rules.
   * @param {Object} config Configuration to validate.
   * @param {Object} rules Validation rules.
   * @param {string} context Context for error messages.
   * @returns {{valid: boolean, errors: string[]}} Validation result.
   */
```
---
#### METHOD: ConfigValidator.assertValid
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.assertValid(config, rules, context);`
- **Pure JSDoc:**
```javascript
/**
   * Asserts configuration validity against rules, throwing on failure.
   * @param {Object} config Configuration to validate.
   * @param {Object} rules Validation rules.
   * @param {string} context Context for error messages.
   * @throws {Error} If validation fails.
   */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(!result.valid);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.coerceType
- **Scope:** instance
- **LLM Call Syntax:** `const result = configValidator.coerceType(value, type, key, context);`
- **Pure JSDoc:**
```javascript
/**
   * Coerces value to specified target type for configuration normalization.
   * @param {*} value Value to coerce.
   * @param {string} type Target type ('string', 'number', 'boolean', etc.).
   * @param {string} key Configuration key for context.
   * @param {string} context Error context.
   * @returns {*} Coerced value.
   */
```
---
#### METHOD: ConfigValidator.switch
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.switch(type);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(lower);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(lower);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.validateField
- **Scope:** instance
- **LLM Call Syntax:** `const result = configValidator.validateField(key, value, rule, _context);`
- **Pure JSDoc:**
```javascript
/**
   * Validates single field against rule, returning list of error messages.
   * @param {string} key Field key.
   * @param {*} value Field value.
   * @param {Object} rule Validation rule.
   * @param {string} _context Error context.
   * @returns {string[]} Validation errors.
   */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(!typeValid);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.min !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.max !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.minLength !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.maxLength !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.pattern && typeof value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(rule.validator && typeof rule.validator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.if(customError);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigValidator.checkType
- **Scope:** instance
- **LLM Call Syntax:** `const result = configValidator.checkType(value, type);`
- **Pure JSDoc:**
```javascript
/**
   * Checks value type against expectation for configuration validation.
   * @param {*} value Value to check.
   * @param {string} type Expected type ('string', 'number', 'boolean', etc.).
   * @returns {boolean} True if type matches.
   */
```
---
#### METHOD: ConfigValidator.switch
- **Scope:** instance
- **LLM Call Syntax:** `configValidator.switch(type);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
<br>

## CLASS: ConfigMergeStrategy
**File Path:** `CoreUtilsLib/src/builders/ConfigMergeStrategy.js`
**Constructor Usage:** `const instance = new ConfigMergeStrategy();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ConfigMergeStrategy

#### METHOD: ConfigMergeStrategy.mergeWithDefaults
- **Scope:** instance
- **LLM Call Syntax:** `const result = configMergeStrategy.mergeWithDefaults(provided, defaults);`
- **Pure JSDoc:**
```javascript
/**
   * Performs deep merge of provided config with defaults, cloning both to prevent mutation.
   * @param {Object} provided Provided configuration (nullable).
   * @param {Object} defaults Default configuration values.
   * @returns {Object} Deep-merged configuration.
   */
```
---
#### METHOD: ConfigMergeStrategy.if
- **Scope:** instance
- **LLM Call Syntax:** `configMergeStrategy.if(!provided);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigMergeStrategy.normalizeOptions
- **Scope:** instance
- **LLM Call Syntax:** `const result = configMergeStrategy.normalizeOptions(options, schema, context, validator);`
- **Pure JSDoc:**
```javascript
/**
   * Normalizes options by applying defaults and validator-driven type coercion.
   * @param {Object} options Options to normalize.
   * @param {Object} schema Schema defining defaults and types.
   * @param {string} context Context for error messages.
   * @param {Object} validator ConfigValidator instance for type coercion.
   * @returns {Object} Normalized options.
   */
```
---
#### METHOD: ConfigMergeStrategy.if
- **Scope:** instance
- **LLM Call Syntax:** `configMergeStrategy.if(value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: ConfigMergeStrategy.if
- **Scope:** instance
- **LLM Call Syntax:** `configMergeStrategy.if(spec.transform && typeof spec.transform);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

