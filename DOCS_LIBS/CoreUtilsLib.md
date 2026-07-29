# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [CoreUtilsLib](#coreutilslib)

---

## CoreUtilsLib

Core Utilities Library - Layer 0 foundation providing essential utilities for all GasLibraryFactory libraries.

### LoggerService

Advanced logging service with configurable log levels.
Provides structured logging with level-based filtering.

**Initialization:**
```javascript
new LoggerService(options={}: Object, options.level='INFO': string)
```

**Methods:**

- `setLevel(level: string): LoggerService`
  > Current log level.

- `getLevel(): string`
  > Retrieve the current logging threshold.

- `debug(message: string|Object|Function, context=null: Object|Function): LoggerService`
  > Log a DEBUG message with optional context and lazy evaluation.

- `info(message: string|Object|Function, context=null: Object|Function): LoggerService`
  > Log an INFO message with optional context and lazy evaluation.

- `warn(message: string|Object|Function, context=null: Object|Function): LoggerService`
  > Log a WARN message with optional context and lazy evaluation.

- `error(message: string|Object|Function, context=null: Object|Function): LoggerService`
  > Log an ERROR message with optional context and lazy evaluation.

- `clear(): LoggerService`
  > Purge all buffered messages from the global GAS Logger.

- `log(level: string, message: string|Object|Function): LoggerService`
  > Log a message at a dynamic threshold level.

- `child(prefix: string): Object`
  > Spawn a namespaced logger with a message prefix.


### Result

Shared immutable-friendly outcome wrapper base class.

**Initialization:**
```javascript
new Result(options={}: Object, options.value=null: *, options.error=null: Error|null)
```

**Static Methods:**

- `ok(value=null: *): Result`

- `fail(error: Error): Result`

- `empty(): Result`

**Methods:**

- `isSuccess(): boolean`
  > Generic success payload.

- `isError(): boolean`

- `toJSON(): Object`

- `toString(): string`


### ServiceValidator

Service-specific validation utilities for constructor dependency validation.
Centralizes the common validation patterns used across all GasLibraryFactory services.

**Static Methods:**

- `validateLogger(logger: Object, context='ServiceValidator': string): boolean`
  > Required methods for UtilsService interface.

- `validateUtils(utils: Object, context='ServiceValidator': string, additionalMethods=[: string[], required=true: boolean): boolean`
  > Validates a utils service dependency. A valid utils service must have at least the sleep method. Additional method requirements can be specified.

- `validateCache(cache: Object, context='ServiceValidator': string, required=false: boolean): boolean`
  > Validates a cache service dependency. Cache is optional by default since many services can function without caching.

- `validateExceptionService(exceptionService: Object, context='ServiceValidator': string, required=false: boolean): boolean`
  > Validates an exception service dependency.

- `validateSpreadsheetService(spreadsheetService: Object, context='ServiceValidator': string, required=true: boolean): boolean`
  > Validates a spreadsheet service dependency.

- `validateServiceDependencies(deps: Object, deps.logger: Object, deps.utils: Object, deps.cache: Object, deps.exceptionService: Object, context='ServiceValidator': string, options={}: Object, options.requireCache=false: boolean, options.requireExceptionService=false: boolean): boolean`
  > Validates all common service dependencies at once. This is a convenience method for services that use the standard dependency pattern (logger, utils, cache, exceptionService).

- `validateService(service: Object, name: string, requiredMethods: string[], context='ServiceValidator': string, required=true: boolean): boolean`
  > Validates a generic service interface with custom method requirements.

- `createValidator(name: string, requiredMethods: string[]): Function`
  > Creates a reusable validator function for a specific service type. This is useful when you need to validate the same service type in multiple places with the same requirements.

- `validateConstructorOptions(options: Object, requirements: Object, context='ServiceValidator': string): boolean`
  > Validates constructor options object. This is a convenience method for validating an options object that contains multiple service dependencies.


### TypeGuards

Type guard utilities for consistent type checking across all libraries.
Provides both functional and object-based type checking patterns.

**Static Methods:**

- `isString(value: *): boolean`
  > Checks if value is a string (primitive or String object).

- `isNonEmptyString(value: *): boolean`
  > Checks if value is a non-empty string (not just whitespace).

- `isNumber(value: *): boolean`
  > Checks if value is a number (excluding NaN).

- `isFiniteNumber(value: *): boolean`
  > Checks if value is a finite number (not Infinity, -Infinity, or NaN).

- `isInteger(value: *): boolean`
  > Checks if value is an integer.

- `isPositiveInteger(value: *): boolean`
  > Checks if value is a positive integer (> 0).

- `isNonNegativeInteger(value: *): boolean`
  > Checks if value is a non-negative integer (>= 0).

- `isBoolean(value: *): boolean`
  > Checks if value is a boolean.

- `isPlainObject(value: *): boolean`
  > Checks if value is a plain object (not null, array, Date, etc.).

- `isObject(value: *): boolean`
  > Checks if value is an object (not null, can be array or other object types).

- `isValidObject(value: *): boolean`
  > Checks if value is a non-null object (shorthand for common pattern).

- `isNonEmptyObject(value: *): boolean`
  > Checks if value is a non-empty plain object.

- `isArray(value: *): boolean`
  > Checks if value is an array.

- `isNonEmptyArray(value: *): boolean`
  > Checks if value is a non-empty array.

- `isArrayOf(value: *, typeCheck: Function): boolean`
  > Checks if value is an array of a specific type.

- `isFunction(value: *): boolean`
  > Checks if value is a function.

- `isNil(value: *): boolean`
  > Checks if value is null or undefined.

- `isNull(value: *): boolean`
  > Checks if value is null.

- `isUndefined(value: *): boolean`
  > Checks if value is undefined.

- `isDefined(value: *): boolean`
  > Checks if value is defined (not null and not undefined).

- `isValidDate(value: *): boolean`
  > Checks if value is a Date object and is valid (not Invalid Date).

- `isRegExp(value: *): boolean`
  > Checks if value is a RegExp.

- `isPromise(value: *): boolean`
  > Checks if value is a Promise (or thenable).

- `isError(value: *): boolean`
  > Checks if value is an Error or Error-like object.

- `isEmpty(value: *): boolean`
  > Checks if value is empty (empty string, empty array, empty object, null, undefined).

- `isTruthy(value: *): boolean`
  > Checks if value is truthy.

- `isFalsy(value: *): boolean`
  > Checks if value is falsy.


### ValidationUtils

Centralized validation utilities for dependency and parameter validation.
Eliminates duplicate validation code across all GasLibraryFactory libraries.

**Initialization:**
```javascript
new ValidationUtils()
```

**Static Methods:**

- `validateLogger(logger: Object, context='ValidationUtils': string): boolean`
  > Required methods for a valid logger interface.

- `validateDependency(dependency: Object, name: string, context='ValidationUtils': string, requiredMethods=[: string[], required=true: boolean): boolean`
  > Validates a dependency object, optionally checking for required methods. Validates that a dependency is a non-null object and optionally verifies that it has specific methods that are functions.

- `validateRequired(value: *, name: string, context='ValidationUtils': string): boolean`
  > Validates that a value is not null or undefined.

- `validateNonEmptyString(value: *, name: string, context='ValidationUtils': string): boolean`
  > Validates that a value is a non-empty string.

- `validatePositiveInteger(value: *, name: string, context='ValidationUtils': string): boolean`
  > Validates that a value is a positive integer.

- `validateFunction(value: *, name: string, context='ValidationUtils': string): boolean`
  > Validates that a value is a function.

- `validateArray(value: *, name: string, context='ValidationUtils': string, allowEmpty=true: boolean): boolean`
  > Validates that a value is an array.

- `validateObject(value: *, name: string, context='ValidationUtils': string): boolean`
  > Validates that a value is a plain object (not null, array, or other types).

- `validateEnum(value: *, allowedValues: Array, name: string, context='ValidationUtils': string): boolean`
  > Validates that a value is one of the allowed values (enum-like validation).

- `validateAll(validations: Array<[boolean, string]>, context='ValidationUtils': string): boolean`
  > Validates multiple conditions at once, collecting all errors. Unlike other validation methods that throw on first error, this method collects all validation errors and throws a single error with all messages.

- `validateInterface(obj: Object, interfaceName: string, context='ValidationUtils': string, required=true: boolean): boolean`
  > Validates that an object implements a specific interface. Uses the interface definitions from CoreUtilsLib/src/interfaces.js to validate that an object has all required methods for a given interface. Available interfaces: - LoggerInterface (debug, info, warn, error) - CacheInterface (get, put, remove) - UtilsServiceInterface (sleep) - ExceptionServiceInterface (executeWithRetry) - MonitorInterface (logJobStart, logJobComplete, logStepStart, logStepComplete) - DataProviderInterface (provide) - StepInterface (getName, execute) - ExpressionEngineInterface (evaluate) - ProviderRegistryInterface (get, getRegisteredTypes) - SpreadsheetServiceInterface (getSheetData)

- `implementsInterface(obj: Object, interfaceName: string): boolean`
  > Checks if an object implements an interface (non-throwing).

- `getAvailableInterfaces(): string[]`
  > Gets the list of available interface names.


### ConfigValidator

Provides validation and type coercion for configurations.

**Methods:**

- `validateConfiguration(config: Object, rules: Object, context: string): {valid: boolean, errors: string[]`
  > Validates configuration object against provided rules.

- `assertValid(config: Object, rules: Object, context: string): void`
  > Asserts configuration validity against rules, throwing on failure.

- `coerceType(value: *, type: string, key: string, context: string): *`
  > Coerces value to specified target type for configuration normalization.

- `validateField(key: string, value: *, rule: Object, _context: string): string[]`
  > Validates single field against rule, returning list of error messages.

- `checkType(value: *, type: string): boolean`
  > Checks value type against expectation for configuration validation.


### ConfigurationBuilder

Utilities for building and validating configuration objects with defaults.
Centralizes configuration pattern across all GasLibraryFactory libraries.

**Static Methods:**

- `mergeWithDefaults(provided: Object, defaults: Object): Object`
  > Deep merge provided configuration with default values, returning a new object.

- `normalizeOptions(options: Object, schema: Object, context='ConfigurationBuilder': string): Object`
  > Apply defaults and type coercion to normalize options against a schema.

- `validateConfiguration(config: Object, rules: Object, context='ConfigurationBuilder': string): {valid: boolean, errors: string[]`
  > Validate a configuration object against schema rules without throwing.

- `assertValid(config: Object, rules: Object, context='ConfigurationBuilder': string): void`
  > Enforce configuration validity, throwing if the schema is violated.

- `create(defaults={}: Object): Object`
  > Create a fluent builder initialized with optional defaults.

**Methods:**

- `set(key: string, value: *): Object`
  > Set a configuration property key to a specific value.

- `setIfDefined(key: string, value: *): Object`
  > Set a configuration property key only if the provided value is not undefined.

- `setDefault(key: string, value: *): Object`
  > Set a configuration property key only if it does not already exist.

- `merge(additional: Object): Object`
  > Deep merge an additional configuration object into the current state.

- `validate(rules: Object, context: string): Object`
  > Enforce schema-based validation rules on the current configuration state.

- `build(): Object`
  > Finalize and return a deep clone of the current configuration state.

- `freeze(): Object`
  > Finalize and return an immutable, deep-cloned configuration object.


### BaseError

Base error class providing standardized error handling across all libraries.
Eliminates duplicate stack trace capture and serialization code.

**Initialization:**
```javascript
new BaseError(message: string, context={}: Object, originalError=null: Error)
```

**Static Methods:**

- `wrap(error: Error|*, context={}: Object): BaseError`
  > Static factory method to wrap any error as a BaseError. If the error is already a BaseError, returns it unchanged. Otherwise, wraps it in a new BaseError with the original as the cause.

**Methods:**

- `toJSON(): string|null`
  > The name of the error class.

- `toString(): string`
  > Generate a formatted string including error type, message, and serialized context.

- `withContext(additionalContext: Object): BaseError`
  > Create a shallow clone of the error with additional merged metadata.


### ValidationError

Initialize BaseError with message, metadata context, and optional cause chaining.

**Initialization:**
```javascript
new ValidationError()
```


### ConfigurationError

Initialize ValidationError with specific field and value identifiers.

**Initialization:**
```javascript
new ConfigurationError()
```


### OperationError

Initialize ConfigurationError with the problematic configuration key.

**Initialization:**
```javascript
new OperationError()
```


### BoundedMap

A Map with automatic size limiting and FIFO eviction.
Useful for in-memory caches that need to prevent unbounded growth.

**Initialization:**
```javascript
new BoundedMap()
```

**Static Methods:**

- `fromJSON(json: Object, onEvict=null: Function): BoundedMap`
  > Reconstruct a BoundedMap from a serialized JSON object.

**Methods:**

- `set(key: *, value: *): number`
  > Maximum number of entries.

- `setAll(entries: Iterable<[*, *]>): BoundedMap`
  > Batch insert multiple key-value pairs with automatic bound enforcement.

- `getOrCompute(key: *, factory=null: Function): *`
  > Retrieve a value or compute and store it using a factory if absent.

- `clear(): void`
  > Clear all entries and reset the internal eviction counter.

- `resetEvictionCount(): void`
  > Reset the internal eviction counter without clearing data.

- `getStats(): Object`
  > Retrieve operational metrics including size, capacity, and eviction counts.

- `clone(): BoundedMap`
  > Create an empty BoundedMap instance with identical capacity settings.

- `copy(): BoundedMap`
  > Create a new BoundedMap instance with a shallow copy of all current entries.

- `resize(newMaxSize: number): number`
  > Dynamically update capacity limit, potentially triggering immediate FIFO evictions.

- `toJSON(): Object`
  > Serialize map entries and metadata to a plain object.


### CacheUtils

Utilities for cache key generation and cache-related operations.
Provides consistent cache key patterns across all libraries.

**Static Methods:**

- `generateKey(prefix: string, parts: ...*): string`
  > Default separator for cache key parts.

- `generateHashKey(prefix: string, obj: Object): string`
  > Compose a cache key using a hashed representation of a configuration object.

- `generateVersionedKey(prefix: string, version: string|number, parts: ...*): string`
  > Compose a versioned cache key for schema invalidation.

- `hasPrefix(key: string, prefix: string): boolean`
  > Validate if a key belongs to a specific prefix group.

- `getPrefix(key: string): string`
  > Isolate the prefix group from a delimited cache key.

- `calculateTtl(requestedTtl: number): number`
  > Normalize TTL value against maximum allowable GAS limits.

- `msToSeconds(milliseconds: number): number`
  > Floor convert milliseconds to second-based TTL.

- `secondsToMs(seconds: number): number`
  > Convert second-based TTL to milliseconds.

- `parseKey(key: string): string[]`
  > Deconstruct a delimited cache key into its constituent identifiers.

- `createPattern(prefix: string, parts: ...*): string`
  > Compose a key pattern for wildcard matching.

- `matchesPattern(key: string, pattern: string): boolean`
  > Validate a cache key against a wildcard pattern.


### HashUtils

Hash utility functions for generating consistent string hashes.
Provides cryptographic SHA-256 hashing using Google Apps Script's native Utilities.

**Static Methods:**

- `generateHash(str: string): string`
  > Generate a 64-character hexadecimal SHA-256 hash for a UTF-8 string.

- `hashObject(obj: Object): string`
  > Generate a SHA-256 hash for a JSON-serializable object via stringification.

- `isValidHash(str: *): boolean`
  > Validate if a string consists exclusively of hexadecimal characters.


### LazyServiceContainer

Generic lazy-singleton dependency-injection container.

**Initialization:**
```javascript
new LazyServiceContainer()
```

**Methods:**

- `register(name: string, factory: Function): void`
  > Registers a factory under `name`. Overwriting a name clears any cached singleton for it, so the next `get()` re-resolves from the new factory.

- `has(name: string): boolean`

- `reset(): void`
  > Clears cached singletons, without unregistering factories — the next `get()` per name lazily re-resolves. Primarily for test state isolation.

- `clear(): void`
  > Removes every registered factory and cached singleton.


### PiiRedactor

Utility for redacting Personally Identifiable Information (PII) from strings.
Provides comprehensive redaction for common PII patterns in error messages and logs.

**Static Methods:**

- `redact(message: string): string`
  > Default masking labels for recognized PII categories.

- `redactEmails(message: string, label: string): string`
  > Mask email addresses using a specific or default placeholder.

- `redactTokens(message: string, label: string): string`
  > Mask OAuth and Bearer tokens while preserving the prefix.

- `redactApiKeys(message: string, label: string): string`
  > Mask API keys identified by common key-value delimiters.

- `redactUrlParams(message: string, label: string): string`
  > Mask URL query parameters to prevent exposure of sensitive GET data.

- `redactJwt(message: string, label: string): string`
  > Mask JSON Web Tokens (JWT) based on base64 segment patterns.

- `redactCreditCards(message: string, label: string): string`
  > Mask credit card numbers matching 16-digit patterns.

- `redactPhones(message: string, label: string): string`
  > Mask phone numbers matching common US and international formats.

- `redactSessionIds(message: string, label: string): string`
  > Mask long hexadecimal strings often used as session identifiers.

- `containsPii(message: string): boolean`
  > Validate if a string contains any detectable PII patterns.

- `detectPiiTypes(message: string): string[]`
  > Isolate which PII categories are present in a message.


### PlaceholderUtils

Utilities for working with placeholder patterns like {{fieldName}}.
Centralizes placeholder extraction and manipulation across all GasLibraryFactory libraries.


### RegexUtils

Regular expression utilities for safe regex handling and escaping.
Provides ReDoS (Regular Expression Denial of Service) protection and regex escaping.


### Registry

Generic Map-backed registry primitive shared across libraries.

**Initialization:**
```javascript
new Registry(options={}: Object, options.logger=null: Object|null, options.entityName='entry': string, options.validateValue=null: Function|null)
```

**Methods:**

- `register(key: string, value: T, options={}: Object, options.overwrite=true: boolean): boolean`
  > Registers a value under a key, running the optional value validator.

- `set(key: string, value: T): boolean`
  > Stores a value without validation or logging (low-level storage primitive).

- `has(key: string): boolean`

- `unregister(key: string): boolean`
  > Removes the value for a key.

- `clear(): void`
  > Removes all entries.

- `keys(): string[]`

- `values(): T[]`

- `entries(): Array<[string, T]>`


### LoggerServiceMock

Centralized high-fidelity mocks for CoreUtilsLib services.

**Initialization:**
```javascript
new LoggerServiceMock()
```

**Methods:**

- `hasLog(level: string, pattern: string|RegExp): boolean`
  > Checks for log messages matching level and pattern in jest.fn() calls.

- `getLogs(): Array<Object>`
  > Reconstructs all recorded log entries from individual level mock calls.

- `getLogsByLevel(level: string): Array<{level:string, message:string, context:Object|null`
  > Filters captured logs by case-insensitive level identifier.

- `getLogsMatching(pattern: string|RegExp): Array<{level:string, message:string, context:Object|null`
  > Filters captured logs by message content using string or regular expression.

- `hasLog(level: string, pattern: string|RegExp): boolean`
  > Checks if any captured log entry matches specified level and message pattern.

- `printLogs(): void`
  > Outputs all recorded log entries to the system console.

- `reset(): this`
  > Resets all internal Jest mock functions and call history.


### UtilsServiceMock

Checks for log messages matching level and pattern in jest.fn() calls.

**Initialization:**
```javascript
new UtilsServiceMock()
```


### CacheInterfaceMock

Mock for CacheInterface implementing a simple in-memory store for testing.

**Initialization:**
```javascript
new CacheInterfaceMock()
```


### CellValueCoercion

Centralized Sheets-cell-value coercion (string -> number/boolean)
shared by libraries that read raw Sheets API values and need consistent
primitive normalization (e.g. SheetDBLib's TableService, GasDataImporter's
SourceStrategy). Ported 1:1 from the duplicated `_coerceValue` implementations.
/

**Static Methods:**

- `coerceValue(value: *): *`
  > Normalizes a raw Sheets API cell value into a JS primitive (number, boolean) when possible, otherwise returns the original value unchanged.


### Delegation

Generic dynamic-delegation helper for Facade/Delegation-pattern classes.
Centralizes the "bind manager methods onto a facade instance" logic that was
previously copy-pasted as a private `_delegate` method across multiple libraries
(Code Reuse Initiative).

**Initialization:**
```javascript
new Delegation()
```

**Static Methods:**

- `delegateMethods(target: Object): Object`
  > Binds each named method from each manager onto the target object, so calls to `target[method](...)` are forwarded to `manager[method](...)` with the manager's `this` preserved. Methods that don't exist (or aren't functions) on a given manager are silently skipped, unless `logger` is provided, in which case a warning is emitted for each missing method.


### HtmlSanitizer

Centralized HTML-context escaping utilities (XSS prevention) for
rendering sheet-sourced free text/colours/URLs into generated HTML (e.g. ALDO
email boxes). Ported 1:1 from ALDO's `src/application/email/boxes.ts`.
/

**Static Methods:**

- `escapeHtml(value: *): string`
  > Escapes `&`, `<`, `>`, `"`, `'` so free text is safe to interpolate into HTML markup (e.g. names, notes, error strings sourced from sheets). Null-safe: `null`/`undefined` are coerced to `''` (not the throw or the literal string `"null"`).

- `safeColor(value: string, fallback: string): string`
  > Validates a sheet-sourced colour value going into a style attribute: only hex codes (`#` + 3-8 hex digits) or bare CSS colour keywords pass.

- `safeUrl(value: string): string`
  > Validates a sheet-sourced link target: only `http(s)` URLs pass (blocks `javascript:`/`data:`/other schemes). Input is trimmed before testing and before being returned.

- `escapeContextDeep(value: *): *`
  > Recursively walks a plain object/array (e.g. a CDU context) and HTML-escapes every string leaf via {

- `stripToPlainText(value: *): string`
  > Strips HTML markup down to plain text: block-level boundaries (`<br>`, `</p>`, `</div>`, `</li>`, `</tr>`) become line breaks BEFORE remaining tags are stripped (so paragraph/list/row structure survives as line breaks, not word-run-together text), HTML entities are decoded, blank-line runs collapse, and the result is trimmed. Null-safe.


### IdGenerator

Secure IdGenerator utility module with environment-aware entropy sources.

**Static Methods:**

- `generateCustomId(length=12: number, alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789': string): string`
  > Static version of custom ID generation for direct access.

**Methods:**

- `generateUuid(): string`
  > Generates a standard UUID v4 (randomly-generated) string. Uses native GAS Utilities if available for security.

- `getRandomValues(size: number): number[]|Uint8Array`
  > Returns cryptographically secure random bytes (Web-Crypto-style `getRandomValues`), for callers needing raw entropy rather than a formatted ID (tokens, salts, nonces). Uses the same environment-aware chain as {

- `generateShortId(): string`
  > Generates a short 8-character alphanumeric random identifier.

- `generateCompactId(size=21: number): string`
  > Generates a compact, collision-resistant random ID with specified length.

- `generateCustomId(length=12: number, alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789': string): string`
  > Generates a custom random ID using a secure source if available. Uses rejection sampling to eliminate modulo bias.


---

