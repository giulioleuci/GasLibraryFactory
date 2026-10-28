# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [CoreUtilsLib](#coreutilslib)
- [GasResilienceLib](#gasresiliencelib)
- [GoogleApiWrapper](#googleapiwrapper)
- [WorkspaceTemplateEngine](#workspacetemplateengine)
- [GasExpressionEngineLib](#gasexpressionenginelib)
- [SheetDBLib](#sheetdblib)
- [RoleResolutionLib](#roleresolutionlib)
- [ComposableContentLib](#composablecontentlib)
- [JobRunnerLib](#jobrunnerlib)
- [PipelineFramework](#pipelineframework)
- [ContextEngine](#contextengine)
- [GasDataImporter](#gasdataimporter)
- [DomainRepositoryLib](#domainrepositorylib)
- [GasOnlineTestFramework](#gasonlinetestframework)
- [GasSchemaValidatorLib](#gasschemavalidatorlib)

---

## CoreUtilsLib

Core Utilities Library - Layer 0 foundation providing essential utilities for all GasLibraryFactory libraries.

### LoggerService

**Source:** `CoreUtilsLib/src/LoggerService.ts`

Hierarchical logging service with structured output and lazy evaluation.

**Initialization:**
```javascript
new LoggerService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setLevel` | `setLevel(level: string): LoggerService` |
| `getLevel` | `getLevel(): string` |
| `_isLevelActive` | `_isLevelActive(level: string): boolean` |
| `_safeStringify` | `_safeStringify(obj: *, maxDepth=5: number, maxLength=5000: number): string` |
| `_evaluateMessage` | `_evaluateMessage(messageOrCallback: string|Object|Function): string|Object` |
| `_formatMessage` | `_formatMessage(level: string, message: string|Object, context=null: Object): string` |
| `_currentPosition` | `_currentPosition(): void` |
| `_resolvePosition` | `_resolvePosition(): void` |
| `_emit` | `_emit(): void` |
| `withPosition` | `withPosition(): void` |
| `debug` | `debug(message: string|Object|Function, context=null: Object|Function): LoggerService` |
| `info` | `info(message: string|Object|Function, context=null: Object|Function): LoggerService` |
| `warn` | `warn(message: string|Object|Function, context=null: Object|Function): LoggerService` |
| `error` | `error(message: string|Object|Function, context=null: Object|Function): LoggerService` |
| `get` | `get(): string[]` |
| `clear` | `clear(): LoggerService` |
| `log` | `log(level: string, message: string|Object|Function): LoggerService` |
| `_writeStructured` | `_writeStructured(): void` |
| `logJobStart` | `logJobStart(): LoggerService` |
| `logJobResume` | `logJobResume(): LoggerService` |
| `logJobEnd` | `logJobEnd(): LoggerService` |
| `logJobSuspended` | `logJobSuspended(): LoggerService` |
| `logBatchStart` | `logBatchStart(): LoggerService` |
| `logItemStart` | `logItemStart(): LoggerService` |
| `logStep` | `logStep(): LoggerService` |
| `logPipelineStart` | `logPipelineStart(): LoggerService` |
| `logPipelineStep` | `logPipelineStep(): LoggerService` |
| `logSummary` | `logSummary(): LoggerService` |
| `logJobReport` | `logJobReport(): LoggerService` |
| `child` | `child(prefix: string): Object` |


### Result

**Source:** `CoreUtilsLib/src/Result.ts`

Base outcome wrapper. An outcome is considered successful when it carries no
error. Subclasses may layer additional semantics (explicit success flags,
frozen immutability, richer payloads) on top of this contract.

**Initialization:**
```javascript
new Result()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `ok` | `ok(value=null: *): Result` |
| `fail` | `fail(error: Error): Result` |
| `empty` | `empty(): Result` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSuccess` | `isSuccess(): boolean` |
| `isError` | `isError(): boolean` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### TypeGuards

**Source:** `CoreUtilsLib/src/TypeGuards.ts`

Static type guard utilities for consistent runtime value validation.

**Initialization:**
```javascript
new TypeGuards()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `isString` | `isString(value: *): boolean` |
| `isNonEmptyString` | `isNonEmptyString(value: *): boolean` |
| `isNumber` | `isNumber(value: *): boolean` |
| `isFiniteNumber` | `isFiniteNumber(value: *): boolean` |
| `isInteger` | `isInteger(value: *): boolean` |
| `isPositiveInteger` | `isPositiveInteger(value: *): boolean` |
| `isNonNegativeInteger` | `isNonNegativeInteger(value: *): boolean` |
| `isBoolean` | `isBoolean(value: *): boolean` |
| `isPlainObject` | `isPlainObject(value: *): boolean` |
| `isObject` | `isObject(value: *): boolean` |
| `isNonEmptyObject` | `isNonEmptyObject(value: *): boolean` |
| `isArray` | `isArray(value: *): boolean` |
| `isNonEmptyArray` | `isNonEmptyArray(value: *): boolean` |
| `isArrayOf` | `isArrayOf(value: *, typeCheck: Function): boolean` |
| `isFunction` | `isFunction(value: *): boolean` |
| `isNil` | `isNil(value: *): boolean` |
| `isNull` | `isNull(value: *): boolean` |
| `isUndefined` | `isUndefined(value: *): boolean` |
| `isDefined` | `isDefined(value: *): boolean` |
| `isValidDate` | `isValidDate(value: *): boolean` |
| `isRegExp` | `isRegExp(value: *): boolean` |
| `isPromise` | `isPromise(value: *): boolean` |
| `isError` | `isError(value: *): boolean` |
| `isEmpty` | `isEmpty(value: *): boolean` |


### MyUtilsService

**Source:** `CoreUtilsLib/src/UtilsService.ts`

**Initialization:**
```javascript
new MyUtilsService()
```


### ValidationUtils

**Source:** `CoreUtilsLib/src/ValidationUtils.ts`

Centralized utilities for static dependency and parameter validation across libraries.

**Initialization:**
```javascript
new ValidationUtils()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `LOGGER_METHODS` | `LOGGER_METHODS: unknown` |
| `validateLogger` | `validateLogger(logger: Object, context='ValidationUtils': string): boolean` |
| `validateDependency` | `validateDependency(dependency: Object, name: string, context='ValidationUtils': string, requiredMethods=[: string[], required=true: boolean): boolean` |


### BaseError

**Source:** `CoreUtilsLib/src/errors/BaseError.ts`

Initialize BaseError with message, metadata context, and optional cause chaining.

**Initialization:**
```javascript
new BaseError(message: string, context={}: Object, originalError=null: Error)
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `wrap` | `wrap(error: Error|*, context={}: Object): BaseError` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `originalMessage` | `originalMessage: string|null` |
| `hasOriginalError` | `hasOriginalError: boolean` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |
| `withContext` | `withContext(additionalContext: Object): BaseError` |


### ValidationError

**Source:** `CoreUtilsLib/src/errors/BaseError.ts`

Exception for parameter or schema validation failures.

**Initialization:**
```javascript
new ValidationError()
```


### ConfigurationError

**Source:** `CoreUtilsLib/src/errors/BaseError.ts`

Exception for missing or malformed library/service configuration.

**Initialization:**
```javascript
new ConfigurationError()
```


### OperationError

**Source:** `CoreUtilsLib/src/errors/BaseError.ts`

Exception for failed functional operations with recovery indicators.

**Initialization:**
```javascript
new OperationError()
```


### HashUtils

**Source:** `CoreUtilsLib/src/internal/HashUtils.ts`

Cryptographic utility for deterministic SHA-256 hashing of strings and objects.

**Initialization:**
```javascript
new HashUtils()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `generateHash` | `generateHash(str: string): string` |
| `hashObject` | `hashObject(obj: Object): string` |
| `isValidHash` | `isValidHash(str: *): boolean` |


### LazyServiceContainer

**Source:** `CoreUtilsLib/src/internal/LazyServiceContainer.ts`

Lazy-singleton service container: register a factory under a name, resolve
it (and cache the result) on first `get()`, share the cached instance on
every subsequent `get()` until `reset()`.

**Initialization:**
```javascript
new LazyServiceContainer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(name: string, factory: Function): void` |
| `has` | `has(name: string): boolean` |
| `get` | `get(name: string): T` |
| `reset` | `reset(): void` |
| `clear` | `clear(): void` |


### PiiRedactor

**Source:** `CoreUtilsLib/src/internal/PiiRedactor.ts`

Static utility for detecting and masking Personally Identifiable Information (PII) using regex patterns.

**Initialization:**
```javascript
new PiiRedactor()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `REDACTION_LABELS` | `REDACTION_LABELS: unknown` |
| `PATTERNS` | `PATTERNS: unknown` |
| `redact` | `redact(message: string): string` |


### RegexUtils

**Source:** `CoreUtilsLib/src/internal/RegexUtils.ts`

Static security utility for safe regular expression handling and ReDoS prevention.

**Initialization:**
```javascript
new RegexUtils()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `escape` | `escape(str: string): string` |
| `validateSafety` | `validateSafety(pattern: string, logger=null: Object): void` |
| `createSafeRegex` | `createSafeRegex(pattern: string, flags='': string, logger=null: Object): RegExp` |


### Registry

**Source:** `CoreUtilsLib/src/internal/Registry.ts`

Generic key/value registry backed by a Map.

**Initialization:**
```javascript
new Registry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(key: string, value: T, options={}: Object, options.overwrite=true: boolean): boolean` |
| `set` | `set(key: string, value: T): boolean` |
| `get` | `get(key: string): T|undefined` |
| `has` | `has(key: string): boolean` |
| `unregister` | `unregister(key: string): boolean` |
| `clear` | `clear(): void` |
| `keys` | `keys(): string[]` |
| `values` | `values(): T[]` |
| `entries` | `entries(): Array<[string, T]>` |
| `size` | `size: number` |


### StructuredLogFormatter

**Source:** `CoreUtilsLib/src/internal/StructuredLogFormatter.ts`

Pure formatter for deterministic hierarchical console lines.

**Initialization:**
```javascript
new StructuredLogFormatter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `treePrefix` | `treePrefix(position: TreePosition): string` |
| `jobStart` | `jobStart(): string[]` |
| `jobResume` | `jobResume(): string[]` |
| `jobEnd` | `jobEnd(): string[]` |
| `jobSuspended` | `jobSuspended(): string[]` |
| `batchStart` | `batchStart(): string[]` |
| `itemStart` | `itemStart(): string[]` |
| `step` | `step(): string[]` |
| `pipelineStart` | `pipelineStart(): string[]` |
| `pipelineStep` | `pipelineStep(): string[]` |
| `summary` | `summary(): string[]` |
| `jobReport` | `jobReport(): string[]` |
| `_isDetailEnvelope` | `_isDetailEnvelope(): void` |
| `_duration` | `_duration(): void` |
| `_resumeDetails` | `_resumeDetails(): void` |
| `_contentText` | `_contentText(): void` |
| `_detailsText` | `_detailsText(): void` |
| `_text` | `_text(): void` |
| `_count` | `_count(): void` |
| `_splitPlain` | `_splitPlain(): void` |
| `_treeLines` | `_treeLines(): void` |


### LoggerServiceMock

**Source:** `CoreUtilsLib/src/testing/mocks.ts`

High-fidelity mock for LoggerService with jest.fn() instrumentation and method chaining.

**Initialization:**
```javascript
new LoggerServiceMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getLogs` | `getLogs(): Array<Object>` |
| `getLogsByLevel` | `getLogsByLevel(level: string): Array<{level:string, message:string, context:Object|null` |
| `getLogsMatching` | `getLogsMatching(pattern: string|RegExp): Array<{level:string, message:string, context:Object|null` |
| `hasLog` | `hasLog(level: string, pattern: string|RegExp): boolean` |
| `printLogs` | `printLogs(): void` |
| `reset` | `reset(): this` |


### UtilsServiceMock

**Source:** `CoreUtilsLib/src/testing/mocks.ts`

Mock for UtilsService providing common utility behaviors with jest.fn() instrumentation.

**Initialization:**
```javascript
new UtilsServiceMock()
```


### CacheInterfaceMock

**Source:** `CoreUtilsLib/src/testing/mocks.ts`

Mock for CacheInterface implementing a simple in-memory store for testing.

**Initialization:**
```javascript
new CacheInterfaceMock()
```


### CellValueCoercion

**Source:** `CoreUtilsLib/src/utils/CellValueCoercion.ts`

Static utilities for normalizing raw Sheets API cell values into JS
primitives. Stateless, so all methods are static (matches the
`HtmlSanitizer`/`ValidationUtils` convention used elsewhere in this library).

**Initialization:**
```javascript
new CellValueCoercion()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `coerceValue` | `coerceValue(value: *): *` |


### DateRange

**Source:** `CoreUtilsLib/src/utils/DateRange.ts`

**Initialization:**
```javascript
new DateRange()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isOpenEnded` | `isOpenEnded(): void` |
| `contains` | `contains(): void` |
| `durationInDays` | `durationInDays(): void` |
| `overlaps` | `overlaps(): void` |


### DateUtils

**Source:** `CoreUtilsLib/src/utils/DateUtils.ts`

**Initialization:**
```javascript
new DateUtils()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `MILLIS_PER_DAY` | `MILLIS_PER_DAY: number` |
| `MILLIS_PER_HOUR` | `MILLIS_PER_HOUR: number` |
| `MILLIS_PER_MINUTE` | `MILLIS_PER_MINUTE: number` |
| `MILLIS_PER_SECOND` | `MILLIS_PER_SECOND: number` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `parseDate` | `parseDate(input: Date|string|number|null|undefined): Date|null` |
| `parseGoogleSheetsDate` | `parseGoogleSheetsDate(serialNumber: number): Date` |
| `parseISODate` | `parseISODate(isoString: string): Date|null` |
| `parseDateWithFormat` | `parseDateWithFormat(dateString: string, format: string): Date|null` |
| `formatISODate` | `formatISODate(date: Date): string|null` |
| `formatDate` | `formatDate(date: Date, format='YYYY-MM-DD': string, options={}: Object, options.utc=false: boolean): string|null` |
| `toGoogleSheetsDate` | `toGoogleSheetsDate(date: Date): number|null` |
| `_cloneDate` | `_cloneDate(date: Date): Date` |
| `_diffMs` | `_diffMs(date1: Date): number|null` |
| `addDays` | `addDays(): void` |
| `addHours` | `addHours(date: Date, hours: number): Date|null` |
| `addMinutes` | `addMinutes(date: Date, minutes: number): Date|null` |
| `addMonths` | `addMonths(date: Date, months: number): Date|null` |
| `addYears` | `addYears(date: Date, years: number): Date|null` |
| `daysBetween` | `daysBetween(date1: Date, date2: Date): number|null` |
| `hoursBetween` | `hoursBetween(date1: Date, date2: Date): number|null` |
| `minutesBetween` | `minutesBetween(date1: Date, date2: Date): number|null` |
| `isBefore` | `isBefore(date1: Date, date2: Date): boolean|null` |
| `isAfter` | `isAfter(date1: Date, date2: Date): boolean|null` |
| `isSameDay` | `isSameDay(date1: Date, date2: Date): boolean|null` |
| `startOfDay` | `startOfDay(date: Date): Date|null` |
| `endOfDay` | `endOfDay(date: Date): Date|null` |
| `isValidDate` | `isValidDate(value: *): boolean` |
| `formatDuration` | `formatDuration(ms: number): string` |


### Delegation

**Source:** `CoreUtilsLib/src/utils/Delegation.ts`

Static utility for wiring facade methods onto a target instance by delegating
to internal collaborator (manager) objects.

**Initialization:**
```javascript
new Delegation()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `delegateMethods` | `delegateMethods(target: Object): Object` |


### HtmlSanitizer

**Source:** `CoreUtilsLib/src/utils/HtmlSanitizer.ts`

Static utilities for escaping/validating sheet-sourced values before HTML
interpolation. Stateless, so all methods are static (matches the
`ValidationUtils` convention used elsewhere in this library).

**Initialization:**
```javascript
new HtmlSanitizer()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `escapeHtml` | `escapeHtml(value: *): string` |
| `safeColor` | `safeColor(value: string, fallback: string): string` |
| `safeUrl` | `safeUrl(value: string): string` |
| `escapeContextDeep` | `escapeContextDeep(value: *): *` |
| `stripToPlainText` | `stripToPlainText(value: *): string` |


### IdGenerator

**Source:** `CoreUtilsLib/src/utils/IdGenerator.ts`

**Initialization:**
```javascript
new IdGenerator()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `generateCustomId` | `generateCustomId(length=12: number, alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789': string): string` |
| `_getSecureRandomBytes` | `_getSecureRandomBytes(size: number): number[]|Uint8Array` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `generateUuid` | `generateUuid(): string` |
| `getRandomValues` | `getRandomValues(size: number): number[]|Uint8Array` |
| `generateShortId` | `generateShortId(): string` |
| `generateCompactId` | `generateCompactId(size=21: number): string` |
| `generateCustomId` | `generateCustomId(length=12: number, alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789': string): string` |


### LazyRef

**Source:** `CoreUtilsLib/src/utils/LazyRef.ts`

**Initialization:**
```javascript
new LazyRef(loader: () => T)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `get` | `get(): T` |
| `isResolved` | `isResolved(): boolean` |


### StringUtils

**Source:** `CoreUtilsLib/src/utils/StringUtils.ts`

**Initialization:**
```javascript
new StringUtils()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `truncate` | `truncate(str: string, maxLength: number, suffix='...': string): string` |
| `capitalize` | `capitalize(str: string): string` |
| `toCamelCase` | `toCamelCase(str: string): string` |
| `toSnakeCase` | `toSnakeCase(str: string): string` |
| `camelCase` | `camelCase(str: string): string` |
| `kebabCase` | `kebabCase(str: string): string` |
| `snakeCase` | `snakeCase(str: string): string` |
| `startCase` | `startCase(str: string): string` |
| `pascalCase` | `pascalCase(str: string): string` |
| `constantCase` | `constantCase(str: string): string` |
| `dotCase` | `dotCase(str: string): string` |
| `pathCase` | `pathCase(str: string): string` |
| `stringToArray` | `stringToArray(str: string): string[]` |
| `humanisePath` | `humanisePath(path: string, separator=' > ': string): string` |


### SystemEnvironmentUtils

**Source:** `CoreUtilsLib/src/utils/SystemEnvironmentUtils.ts`

**Initialization:**
```javascript
new SystemEnvironmentUtils()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `sleep` | `sleep(milliseconds: number): void` |
| `delay` | `delay(fn: Function, milliseconds: number): *` |
| `isValidEmail` | `isValidEmail(email: string): boolean` |
| `isValidUrl` | `isValidUrl(url: string): boolean` |
| `isEqual` | `isEqual(value: *, other: *): boolean` |
| `isNil` | `isNil(value: *): boolean` |
| `isNumber` | `isNumber(value: *): boolean` |
| `isString` | `isString(value: *): boolean` |
| `isEmptyValue` | `isEmptyValue(value: *): boolean` |
| `debounce` | `debounce(func: Function, wait: number, options: Object): Function` |
| `once` | `once(func: Function): Function` |
| `noop` | `noop(): void` |


### SystemScriptSettings

**Source:** `CoreUtilsLib/src/utils/SystemScriptSettings.ts`

**Initialization:**
```javascript
new SystemScriptSettings()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `deepClone` | `deepClone(obj: *): *` |
| `deepMerge` | `deepMerge(objects: ...Object): Object` |
| `getNestedProperty` | `getNestedProperty(obj: Object, path: string, defaultValue=null: *): *` |
| `setNestedProperty` | `setNestedProperty(obj: Object, path: string, value: *): Object` |
| `has` | `has(obj: Object, path: string|Array): boolean` |
| `pick` | `pick(obj: Object, paths: ...(string|string[])): Object` |
| `omit` | `omit(obj: Object, paths: ...(string|string[])): Object` |
| `mapKeys` | `mapKeys(obj: Object, iteratee: Function): Object` |
| `mapValues` | `mapValues(obj: Object, iteratee: Function): Object` |


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

## GoogleApiWrapper

**Version:** 3.0.0   **Layer:** Infrastructure (Layer 1)   **Dependencies:** CoreUtilsLib, GasResilienceLib

### DialogBuilder

**Source:** `GoogleApiWrapper/src/builders/DialogBuilder.ts`

Fluent builder for GAS modal HTML dialogs. Wraps HtmlService to provision content, dimensions, and titles with chainable operations. Handles automatic conversion from strings or templates to HtmlOutput.

**Initialization:**
```javascript
new DialogBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setTitle` | `setTitle(title: string): DialogBuilder` |
| `setContent` | `setContent(html: string): DialogBuilder` |
| `setContentFromTemplate` | `setContentFromTemplate(template: GoogleAppsScript.HTML.HtmlTemplate): DialogBuilder` |
| `setWidth` | `setWidth(pixels: number): DialogBuilder` |
| `setHeight` | `setHeight(pixels: number): DialogBuilder` |
| `show` | `show(): void` |
| `getHtmlOutput` | `getHtmlOutput(): GoogleAppsScript.HTML.HtmlOutput|null` |


### MenuBuilder

**Source:** `GoogleApiWrapper/src/builders/MenuBuilder.ts`

Fluent builder for GAS UI menus. Wraps native Menu API to provide chainable addition of items, separators, and nested submenus. Decouples menu structure definition from native UI commitment.

**Initialization:**
```javascript
new MenuBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addItem` | `addItem(caption: string, functionName: string): MenuBuilder` |
| `addSeparator` | `addSeparator(): MenuBuilder` |
| `addSubMenu` | `addSubMenu(subMenuBuilder: MenuBuilder): MenuBuilder` |
| `addToUi` | `addToUi(): void` |
| `getNativeMenu` | `getNativeMenu(): GoogleAppsScript.Base.Menu` |


### SidebarBuilder

**Source:** `GoogleApiWrapper/src/builders/SidebarBuilder.ts`

**Initialization:**
```javascript
new SidebarBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setTitle` | `setTitle(): void` |
| `setContent` | `setContent(): void` |
| `setContentFromTemplate` | `setContentFromTemplate(): void` |
| `setWidth` | `setWidth(): void` |
| `show` | `show(): void` |
| `getHtmlOutput` | `getHtmlOutput(): void` |


### GoogleService

**Source:** `GoogleApiWrapper/src/internal/core/GoogleService.ts`

Initializes service with validated dependencies. Enforces abstract class restriction.

**Initialization:**
```javascript
new GoogleService(logger: LoggerService, cache: Cache, utils: UtilsService, exceptionService: ExceptionService)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_verifyAdvancedService` | `_verifyAdvancedService(serviceName: string): boolean` |
| `_generateCacheKey` | `_generateCacheKey(prefix: string, id: string, method: string): string` |
| `_getOrExecute` | `_getOrExecute(key: string, func: Function, expirationSeconds=600: number, useCache=true: boolean): *` |
| `_invalidateCache` | `_invalidateCache(key: string): void` |
| `_executeWithRetry` | `_executeWithRetry(func: Function, context={}: Object, maxAttempts=3: number): *` |


### ServiceFactory

**Source:** `GoogleApiWrapper/src/internal/core/ServiceFactory.ts`

Centralized Dependency Injection (DI) and Singleton container for GoogleApiWrapper services. Manages lazy initialization of shared infrastructure (logging, caching, resiliency) and provides consistent factory methods for all service wrappers.

**Initialization:**
```javascript
new ServiceFactory()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `configure` | `configure(config: Object, config.logLevel='INFO': string, config.cacheExpiration=300: number, config.mailRateLimitMs=100: number): void` |
| `reset` | `reset(resetConfig=true: boolean): void` |
| `getLogger` | `getLogger(): LoggerService` |
| `getUtilitiesService` | `getUtilitiesService(): UtilitiesService` |
| `getUtils` | `getUtils(): UtilsService` |
| `getCache` | `getCache(): Cache` |
| `getCacheService` | `getCacheService(): CacheService` |
| `getExceptionService` | `getExceptionService(): ExceptionService` |
| `getDriveService` | `getDriveService(): DriveService` |
| `getDocumentService` | `getDocumentService(): DocumentService` |
| `getSpreadsheetService` | `getSpreadsheetService(): SpreadsheetService` |
| `getMailService` | `getMailService(options={}: Object): MailService` |
| `getPermissionService` | `getPermissionService(): PermissionService` |
| `getPropertiesService` | `getPropertiesService(): PropertiesService` |
| `getTriggerService` | `getTriggerService(): TriggerService` |
| `getUiService` | `getUiService(): UiService` |
| `getUserService` | `getUserService(): UserService` |
| `setLogger` | `setLogger(logger: Object): void` |
| `setUtils` | `setUtils(utils: Object): void` |
| `setCache` | `setCache(cache: Object): void` |
| `setExceptionService` | `setExceptionService(exceptionService: Object): void` |


### DocumentBatchUpdateHandler

**Source:** `GoogleApiWrapper/src/internal/services-managers/DocumentBatchUpdateHandler.ts`

**Initialization:**
```javascript
new DocumentBatchUpdateHandler()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getOrCreateHeader` | `getOrCreateHeader(documentId: string): GoogleAppsScript.Document.HeaderSection` |
| `getOrCreateFooter` | `getOrCreateFooter(documentId: string): GoogleAppsScript.Document.FooterSection` |
| `setHeaderText` | `setHeaderText(documentId: string, text: string): DocumentService` |
| `createDocument` | `createDocument(name: string, options={}: Object, options.destinationFolder: string): Object` |
| `getDocument` | `getDocument(documentIds: string|string[]): Object|Object[]|null` |
| `_executeBatchUpdate` | `_executeBatchUpdate(documentId: string, requests: Object[]): Object` |
| `_executeExportPDF` | `_executeExportPDF(documentId: string, op: Object): Object` |
| `batchReplaceText` | `batchReplaceText(documentIds: string|string[], searchPattern: string, replacement: string): Object` |
| `deleteDocuments` | `deleteDocuments(documentIds: string|string[]): Object` |
| `_addHeaderWithStandardAPI` | `_addHeaderWithStandardAPI(documentId: string, op: Object): Object` |
| `_addFooterWithStandardAPI` | `_addFooterWithStandardAPI(documentId: string, op: Object): Object` |


### DocumentContentExtractor

**Source:** `GoogleApiWrapper/src/internal/services-managers/DocumentContentExtractor.ts`

**Initialization:**
```javascript
new DocumentContentExtractor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getRawDocumentStructure` | `getRawDocumentStructure(documentId: string): Object` |
| `_convertContentToPOJO` | `_convertContentToPOJO(content: Object[]): Object[]` |
| `_extractParagraphText` | `_extractParagraphText(paragraph: Object): string` |
| `_extractParagraphRuns` | `_extractParagraphRuns(paragraph: Object): Array<{text: string, start: number, end: number, style: Object` |
| `_extractTableData` | `_extractTableData(table: Object): Object[]` |
| `_extractCellText` | `_extractCellText(cell: Object): string` |
| `_extractCellRuns` | `_extractCellRuns(cell: Object): Array<{text: string, start: number, end: number, style: Object` |
| `getDocumentBody` | `getDocumentBody(documentId: string): Object` |
| `scanDocumentStructure` | `scanDocumentStructure(documentId: string, textPatterns=['{{': string[]): Object` |


### DocumentTableManager

**Source:** `GoogleApiWrapper/src/internal/services-managers/DocumentTableManager.ts`

**Initialization:**
```javascript
new DocumentTableManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getDocumentTables` | `getDocumentTables(documentId: string): Object[]` |
| `getTableStructure` | `getTableStructure(documentId: string, tableIndex: number): Object` |
| `getTableData` | `getTableData(documentId: string, tableIndex=0: number): Object` |
| `getTableRow` | `getTableRow(): void` |
| `getTableColumn` | `getTableColumn(): void` |
| `insertTableRow` | `insertTableRow(): void` |
| `appendTableRow` | `appendTableRow(): void` |
| `deleteTableRow` | `deleteTableRow(): void` |
| `updateTableCell` | `updateTableCell(): void` |
| `updateTableRow` | `updateTableRow(): void` |
| `updateTableColumn` | `updateTableColumn(): void` |
| `copyTableRow` | `copyTableRow(): void` |
| `copyTableColumn` | `copyTableColumn(documentId: string, tableIndex: number, sourceColumnIndex: number, targetColumnIndex: number): Object` |
| `setCellRunStyles` | `setCellRunStyles(documentId: string, tableIndex: number, rowIndex: number, columnIndex: number): Object` |
| `deleteTableColumn` | `deleteTableColumn(): void` |
| `insertTableColumn` | `insertTableColumn(): void` |
| `appendTableColumn` | `appendTableColumn(): void` |
| `setColumnWidth` | `setColumnWidth(): void` |
| `getColumnWidth` | `getColumnWidth(): void` |
| `setRowBackgroundColor` | `setRowBackgroundColor(): void` |
| `setRowMinimumHeight` | `setRowMinimumHeight(): void` |
| `getRowMinimumHeight` | `getRowMinimumHeight(): void` |
| `clearTableRow` | `clearTableRow(): void` |
| `setCellBackgroundColor` | `setCellBackgroundColor(): void` |
| `getCellBackgroundColor` | `getCellBackgroundColor(): void` |
| `setCellPadding` | `setCellPadding(): void` |
| `getCellPadding` | `getCellPadding(): void` |
| `setCellVerticalAlignment` | `setCellVerticalAlignment(): void` |
| `getCellVerticalAlignment` | `getCellVerticalAlignment(): void` |
| `getCellDetails` | `getCellDetails(): void` |
| `getTableMetadata` | `getTableMetadata(): void` |
| `setRowTextAlignment` | `setRowTextAlignment(): void` |
| `setRowBold` | `setRowBold(): void` |
| `_applyTableStyling` | `_applyTableStyling(table: GoogleAppsScript.Document.Table, data: Array<Array<string>>, options: Object): void` |
| `_createTableWithStandardAPI` | `_createTableWithStandardAPI(documentId: string, op: Object): Object` |
| `insertTableAtMarker` | `insertTableAtMarker(documentId: string, markerText: string, data: Array<Array<string>>, options={}: Object): Object` |


### SpreadsheetGridManager

**Source:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetGridManager.ts`

Manages structural and formatting changes for Google Sheets grids.

**Initialization:**
```javascript
new SpreadsheetGridManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `formatRanges` | `formatRanges(): void` |
| `setColumnWidths` | `setColumnWidths(): void` |
| `createSheets` | `createSheets(): void` |
| `deleteSheets` | `deleteSheets(): void` |
| `deleteRow` | `deleteRow(): void` |
| `deleteColumn` | `deleteColumn(spreadsheetId: string, sheetName: string, columnIndex: number): *` |
| `deleteRows` | `deleteRows(): void` |
| `expandSheetGrid` | `expandSheetGrid(): void` |
| `getProtectedRanges` | `getProtectedRanges(): void` |
| `deleteProtectedRanges` | `deleteProtectedRanges(): void` |
| `protectRanges` | `protectRanges(): void` |


### SpreadsheetHybridManager

**Source:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetHybridManager.ts`

**Initialization:**
```javascript
new SpreadsheetHybridManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createSpreadsheet` | `createSpreadsheet(title: string, options={}: Object, options.destinationFolder: string): Object` |
| `openStandard` | `openStandard(): void` |
| `getActiveStandard` | `getActiveStandard(): void` |
| `getStandardApp` | `getStandardApp(): void` |
| `flushBatch` | `flushBatch(): void` |
| `_verifyAdvancedSheets` | `_verifyAdvancedSheets(): void` |


### SpreadsheetMetadataCache

**Source:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetMetadataCache.ts`

**Initialization:**
```javascript
new SpreadsheetMetadataCache()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getSpreadsheetMetadata` | `getSpreadsheetMetadata(): void` |
| `getSheetInfo` | `getSheetInfo(): void` |
| `_getCachedSheetMetadata` | `_getCachedSheetMetadata(): void` |
| `_clearSheetMetadataCache` | `_clearSheetMetadataCache(): void` |
| `_parseRangeToGridRange` | `_parseRangeToGridRange(): void` |
| `_parseCell` | `_parseCell(): void` |
| `_columnToIndex` | `_columnToIndex(): void` |


### SpreadsheetRangeManager

**Source:** `GoogleApiWrapper/src/internal/services-managers/SpreadsheetRangeManager.ts`

**Initialization:**
```javascript
new SpreadsheetRangeManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `updateRanges` | `updateRanges(): void` |
| `getRanges` | `getRanges(): void` |
| `appendRows` | `appendRows(): void` |
| `insertRow` | `insertRow(): void` |
| `getLastError` | `getLastError(): void` |
| `clearRanges` | `clearRanges(): void` |


### TextStyleMapper

**Source:** `GoogleApiWrapper/src/internal/services-managers/TextStyleMapper.ts`

**Initialization:**
```javascript
new TextStyleMapper()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `toNativeAttributes` | `toNativeAttributes(textStyle: Object): Object` |
| `_rgbColorToHex` | `_rgbColorToHex(rgbColor: Object): string` |


### CacheService

**Source:** `GoogleApiWrapper/src/services/CacheService.ts`

Facade for Google Apps Script native CacheService. Provides unified access to Script, User, and Document cache scopes with consistent error handling, automatic serialization, and TTL enforcement.

**Initialization:**
```javascript
new CacheService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `getScriptCache` | `getScriptCache(): Object` |
| `getUserCache` | `getUserCache(): Object` |
| `getDocumentCache` | `getDocumentCache(): Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getScriptCache` | `getScriptCache(): Cache` |
| `getUserCache` | `getUserCache(): Cache` |
| `getDocumentCache` | `getDocumentCache(): Cache` |


### Cache

**Source:** `GoogleApiWrapper/src/services/CacheService.ts`

Wrapper for Google Apps Script Cache instances. Extends native functionality with automatic string conversion, TTL enforcement (max 6h), and diagnostic logging.

**Initialization:**
```javascript
new Cache()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `get` | `get(key: string): string|null` |
| `getAll` | `getAll(keys: string[]): Object<string, string|null>` |
| `put` | `put(key: string, value: *, expirationInSeconds=600: number): void` |
| `putAll` | `putAll(values: Object<string, *>, expirationInSeconds=600: number): void` |
| `remove` | `remove(key: string): void` |
| `removeAll` | `removeAll(keys: string[]): void` |
| `unwrap` | `unwrap(): GoogleAppsScript.Cache.Cache` |


### DocumentBuilder

**Source:** `GoogleApiWrapper/src/services/DocumentBuilder.ts`

Fluent builder for Google Docs. Accumulates mutation operations for atomic execution via batchUpdate.

**Initialization:**
```javascript
new DocumentBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `appendParagraph` | `appendParagraph(text: string, options={}: Object): DocumentBuilder` |
| `appendListItem` | `appendListItem(text: string, options={}: Object): DocumentBuilder` |
| `setText` | `setText(text: string): DocumentBuilder` |
| `createTable` | `createTable(data: Array<Array>, options={}: Object): DocumentBuilder` |
| `addHeader` | `addHeader(text: string): DocumentBuilder` |
| `addFooter` | `addFooter(text: string): DocumentBuilder` |
| `replaceText` | `replaceText(searchPattern: string, replacement: string): DocumentBuilder` |
| `exportPDF` | `exportPDF(fileName: string, destinationFolderId=null: string): DocumentBuilder` |
| `execute` | `execute(): Object` |
| `_convertOperationToDocsRequests` | `_convertOperationToDocsRequests(op: Object): Object[]` |
| `_createAppendParagraphRequests` | `_createAppendParagraphRequests(): void` |
| `_createAppendListItemRequests` | `_createAppendListItemRequests(): void` |
| `_getBodyEndIndex` | `_getBodyEndIndex(): number` |
| `_createSetTextRequests` | `_createSetTextRequests(): void` |
| `_createTableRequests` | `_createTableRequests(): void` |
| `_createHeaderRequests` | `_createHeaderRequests(): void` |
| `_createFooterRequests` | `_createFooterRequests(): void` |
| `_createReplaceTextRequests` | `_createReplaceTextRequests(): void` |


### DocumentService

**Source:** `GoogleApiWrapper/src/services/DocumentService.ts`

Stateless facade for Google Docs manipulation. Utilizes Advanced Docs API v1 for batch operations and DocumentApp for standard API access. Delegates specialized logic to Table, Content, and Batch managers.

**Initialization:**
```javascript
new DocumentService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `document` | `document(documentId: string): DocumentBuilder` |
| `openStandard` | `openStandard(documentId: string): GoogleAppsScript.Document.Document` |
| `getStandardApp` | `getStandardApp(): GoogleAppsScript.Document.DocumentApp` |


### DriveService

**Source:** `GoogleApiWrapper/src/services/DriveService.ts`

Batch-first Google Drive facade. Orchestrates file, folder, shortcut, and metadata operations using Advanced Drive API v2. Supports dry-run simulations and automated retry logic.

**Initialization:**
```javascript
new DriveService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `DRY_RUN_ID_PREFIX` | `DRY_RUN_ID_PREFIX: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_isDryRun` | `_isDryRun(options={}: Object): boolean` |
| `_generateDryRunId` | `_generateDryRunId(): string` |
| `getStandardApp` | `getStandardApp(): GoogleAppsScript.Drive.DriveApp` |


### LockService

**Source:** `GoogleApiWrapper/src/services/LockService.ts`

Facade for Google Apps Script native LockService. Manages concurrent access via Script, User, and Document scopes. Provides a testable abstraction with support for mock environments.

**Initialization:**
```javascript
new LockService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getScriptLock` | `getScriptLock(): Lock|MockLock` |
| `getUserLock` | `getUserLock(): Lock|MockLock` |
| `getDocumentLock` | `getDocumentLock(documentId: string): Lock|MockLock` |


### Lock

**Source:** `GoogleApiWrapper/src/services/LockService.ts`

**Initialization:**
```javascript
new Lock(nativeLock: GoogleAppsScript.Lock.Lock, logger: LoggerService)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `tryLock` | `tryLock(timeoutInMillis: number): boolean` |
| `waitLock` | `waitLock(timeoutInMillis: number): void` |
| `releaseLock` | `releaseLock(): void` |
| `hasLock` | `hasLock(): boolean` |


### MockLock

**Source:** `GoogleApiWrapper/src/services/LockService.ts`

**Initialization:**
```javascript
new MockLock(logger: LoggerService)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `tryLock` | `tryLock(timeoutInMillis: number): boolean` |
| `waitLock` | `waitLock(timeoutInMillis: number): void` |
| `releaseLock` | `releaseLock(): void` |
| `hasLock` | `hasLock(): boolean` |


### MailService

**Source:** `GoogleApiWrapper/src/services/MailService.ts`

Stateless service for email management via GmailApp/MailApp. Implements quota awareness, sequential rate limiting, and resilient delivery via exceptionService.

**Initialization:**
```javascript
new MailService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getQuotaUsage` | `getQuotaUsage(): number` |
| `searchMessages` | `searchMessages(query: string, maxResults=50: number): Array<{id: string, threadId: string, subject: string, from: string, date: Date, plainBody: string` |
| `send` | `send(emailOptions: Object, emailOptions.to: string|string[], emailOptions.subject: string, emailOptions.body: string, emailOptions.htmlBody: string, emailOptions.attachments: BlobSource[]): Object` |
| `sendBatch` | `sendBatch(emails: Object[]): Object` |
| `createDraft` | `createDraft(emailOptions: Object): Object` |
| `sendBulk` | `sendBulk(recipientData: Object[], bodyGenerator: Function, subject: string, isHtml=true: boolean): Object` |
| `sendNotification` | `sendNotification(emails: string|string[], title: string, message: string): Object` |


### PermissionService

**Source:** `GoogleApiWrapper/src/services/PermissionService.ts`

Batch-first Google Drive permission manager. Utilizes Advanced Drive API v3 for role assignment, revocation, and ownership transfer. Implements silent sharing by default (notifications disabled) and 5-minute permission caching.

**Initialization:**
```javascript
new PermissionService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `shareWithUsers` | `shareWithUsers(fileIds: string|string[], permissions: Object|Object[], options={}: Object, options.sendNotificationEmail=false: boolean): Object` |
| `removeAccess` | `removeAccess(fileIds: string|string[], emailsOrPermissionIds: string|string[]): Object` |
| `changeRoles` | `changeRoles(fileIds: string|string[], roleChanges: Object|Object[], options={}: Object, fileIds: string|string[], roleChanges: Object|Object[]): Object` |
| `changeRolesByPermissionId` | `changeRolesByPermissionId(fileIds: string|string[], _options: Object): {successful: Array<Object>, failed: Array<Object>` |
| `transferOwnership` | `transferOwnership(fileIds: string|string[], newOwnerEmails: string|string[], options={}: Object, options.sendNotificationEmail=false: boolean, fileIds: string|string[], newOwnerEmails: string|string[], options={}: Object): Object` |
| `getPermissions` | `getPermissions(fileIds: string|string[], options={}: Object, fileIds: string|string[]): Array<Object>|Object<string, Array<Object>>` |
| `getSharingLink` | `getSharingLink(fileIds: string|string[], accessType='view': string, options={}: Object, fileIds: string|string[], accessType='view': string): string|Object<string, string>` |


### PropertiesService

**Source:** `GoogleApiWrapper/src/services/PropertiesService.ts`

Facade for Google Apps Script native PropertiesService. Implements type-safe key-value storage with automatic JSON serialization, ISO date revival, and batch I/O optimization. Supports Script, User, and Document scopes.

**Initialization:**
```javascript
new PropertiesService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `getScriptProperties` | `getScriptProperties(): Object` |
| `getUserProperties` | `getUserProperties(): Object` |
| `getDocumentProperties` | `getDocumentProperties(): Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setUserProperty` | `setUserProperty(key: string, value: string|number|boolean): string|null` |
| `getUserProperty` | `getUserProperty(): void` |
| `deleteUserProperty` | `deleteUserProperty(): void` |
| `setDocumentProperty` | `setDocumentProperty(key: string, value: string|number|boolean): string|null` |
| `getDocumentProperty` | `getDocumentProperty(): void` |
| `deleteDocumentProperty` | `deleteDocumentProperty(): void` |
| `setProperty` | `setProperty(key: string, value: string|number|boolean): string|null` |
| `getProperty` | `getProperty(): void` |
| `setProperties` | `setProperties(properties: Object<string, string|number|boolean>): void` |
| `deleteProperty` | `deleteProperty(key: string): void` |
| `deleteAllProperties` | `deleteAllProperties(): number` |
| `getKeys` | `getKeys(): string[]` |
| `getProperties` | `getProperties(): Object<string, string>` |
| `setObjectProperty` | `setObjectProperty(key: string, object: Object): void` |
| `getObjectProperty` | `getObjectProperty(key: string): Object|null` |
| `_dateReviver` | `_dateReviver(key: string, value: *): Date|*` |
| `hasProperty` | `hasProperty(key: string): boolean` |
| `getPropertyOrDefault` | `getPropertyOrDefault(key: string, defaultValue: string): string` |
| `updatePropertyIfExists` | `updatePropertyIfExists(key: string, value: string|number|boolean): boolean` |
| `setPropertyIfNotExists` | `setPropertyIfNotExists(key: string, value: string|number|boolean): boolean` |
| `getNumericProperty` | `getNumericProperty(key: string, defaultValue=0: number): number` |
| `getBooleanProperty` | `getBooleanProperty(key: string, defaultValue=false: boolean): boolean` |


### SpreadsheetService

**Source:** `GoogleApiWrapper/src/services/SpreadsheetService.ts`

Orchestrator for Google Sheets operations. Implements Facade/Delegation pattern across Range, Grid, Metadata, and Hybrid managers. Optimizes performance via Advanced Sheets API batching and intelligent metadata caching.

**Initialization:**
```javascript
new SpreadsheetService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_isDryRun` | `_isDryRun(options={}: Object): boolean` |


### TriggerService

**Source:** `GoogleApiWrapper/src/services/TriggerService.ts`

Facade for Google Apps Script ScriptApp trigger management. Specializes in time-based scheduling for JobRunnerLib resumption and recurring maintenance tasks. Provides programmatic discovery, audit, and cleanup of script triggers.

**Initialization:**
```javascript
new TriggerService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createTimedTrigger` | `createTimedTrigger(functionName: string, milliseconds: number): string` |
| `createRecurringTrigger` | `createRecurringTrigger(functionName: string, cronExpression: string): string` |
| `_parseCronExpression` | `_parseCronExpression(cronExpression: string): Object` |
| `getAllTriggers` | `getAllTriggers(): Object[]` |
| `findTriggerById` | `findTriggerById(triggerId: string): GoogleAppsScript.Script.Trigger|null` |
| `deleteTriggerById` | `deleteTriggerById(triggerId: string): boolean` |
| `deleteTriggersByFunction` | `deleteTriggersByFunction(functionName: string): number` |
| `deleteAllTriggers` | `deleteAllTriggers(): number` |
| `triggerExistsForFunction` | `triggerExistsForFunction(functionName: string): boolean` |
| `getTriggerInfo` | `getTriggerInfo(triggerId: string): Object|null` |
| `findTriggersByFunction` | `findTriggersByFunction(functionName: string): Object[]` |
| `findTriggersByType` | `findTriggersByType(triggerType: string): Object[]` |
| `_determineTriggerType` | `_determineTriggerType(trigger: GoogleAppsScript.Script.Trigger): string` |
| `createTriggerAt` | `createTriggerAt(functionName: string, date: Date): string` |
| `createEveryMinutesTrigger` | `createEveryMinutesTrigger(functionName: string, minutes: number): string` |
| `createEveryHoursTrigger` | `createEveryHoursTrigger(functionName: string, hours: number): string` |
| `createDailyTrigger` | `createDailyTrigger(functionName: string, hour: number): string` |
| `createWeeklyTrigger` | `createWeeklyTrigger(functionName: string, weekDay: GoogleAppsScript.Base.Weekday, hour: number): string` |


### UiService

**Source:** `GoogleApiWrapper/src/services/UiService.ts`

Unified facade for Google Apps Script UI operations. Abstracts host-specific getUi() calls (Sheets, Docs, Forms, Slides) and provides fluent builders for menus, sidebars, and modal dialogs.

**Initialization:**
```javascript
new UiService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_detectUiObject` | `_detectUiObject(): UiBackend|null` |
| `createMenu` | `createMenu(caption: string): MenuBuilder` |
| `alert` | `alert(title: string, message: string, buttonSet: GoogleAppsScript.Base.ButtonSet): GoogleAppsScript.Base.Button` |
| `prompt` | `prompt(title: string, message: string, buttonSet: GoogleAppsScript.Base.ButtonSet): GoogleAppsScript.Base.PromptResponse` |
| `createSidebar` | `createSidebar(): SidebarBuilder` |
| `createDialog` | `createDialog(): DialogBuilder` |
| `getNativeUi` | `getNativeUi(): UiBackend` |
| `Button` | `Button: GoogleAppsScript.Base.Button` |
| `ButtonSet` | `ButtonSet: GoogleAppsScript.Base.ButtonSet` |


### UserService

**Source:** `GoogleApiWrapper/src/services/UserService.ts`

Lightweight facade for the native GAS `Session` global — the L2
boundary for running-user identity lookups, so no other library or consumer
needs to touch `Session` directly.

**Initialization:**
```javascript
new UserService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getActiveUserEmail` | `getActiveUserEmail(): string` |


### UtilitiesService

**Source:** `GoogleApiWrapper/src/services/UtilitiesService.ts`

Lightweight facade for Google Apps Script native Utilities. Provides stateless infrastructure for encoding, timing, formatting, compression, and cryptography with consistent error handling.

**Initialization:**
```javascript
new UtilitiesService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `sleep` | `sleep(milliseconds: number): void` |
| `getUuid` | `getUuid(): string` |
| `base64Encode` | `base64Encode(data: string|Blob, charset: string): string` |
| `base64Decode` | `base64Decode(encoded: string): Blob` |
| `base64EncodeWebSafe` | `base64EncodeWebSafe(data: string|Blob, charset: string): string` |
| `base64DecodeWebSafe` | `base64DecodeWebSafe(encoded: string): Blob` |
| `formatString` | `formatString(template: string, args: ...*): string` |
| `formatDateNative` | `formatDateNative(date: Date, timeZone: string, format: string): string` |
| `parseCsv` | `parseCsv(csv: string, delimiter=',': string): string[][]` |
| `newBlob` | `newBlob(data: string|number[], contentType='text/plain': string, name='blob': string): Blob` |
| `gzip` | `gzip(blob: Blob): Blob` |
| `ungzip` | `ungzip(blob: Blob): Blob` |
| `zip` | `zip(blobs: Blob[], name='archive.zip': string): Blob` |
| `unzip` | `unzip(blob: Blob): Blob[]` |
| `computeDigest` | `computeDigest(algorithm: string, value: string|Blob, charset='UTF_8': string): number[]` |
| `computeHmacSignature` | `computeHmacSignature(algorithm: string, value: string|Blob, key: string|Blob, charset='UTF_8': string): number[]` |
| `jsonStringify` | `jsonStringify(obj: *, prettyPrint=false: boolean): string` |
| `jsonParse` | `jsonParse(json: string): *` |


### DriveFileManager

**Source:** `GoogleApiWrapper/src/services/drive/DriveFileManager.ts`

**Initialization:**
```javascript
new DriveFileManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `deleteFiles` | `deleteFiles(fileIds: string|string[], options={}: Object, options.permanently=false: boolean): Object` |
| `restoreFiles` | `restoreFiles(fileIds: string|string[], options={}: Object): Object` |
| `copyFiles` | `copyFiles(copyRequests: Object|Object[], options={}: Object): Object` |
| `moveFiles` | `moveFiles(moveRequests: Object|Object[], options={}: Object): Object` |
| `renameFiles` | `renameFiles(renameRequests: Object|Object[], options={}: Object): Object` |
| `getFileByIdStandard` | `getFileByIdStandard(fileId: string): GoogleAppsScript.Drive.File|GoogleAppsScript.Drive.Folder` |


### DriveFolderManager

**Source:** `GoogleApiWrapper/src/services/drive/DriveFolderManager.ts`

**Initialization:**
```javascript
new DriveFolderManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createFolder` | `createFolder(folderName: string, parentFolderId=null: string, options={}: Object, options.returnExistingIfFound=false: boolean): Object` |
| `getFolderByIdStandard` | `getFolderByIdStandard(folderId: string): GoogleAppsScript.Drive.Folder` |


### DriveMetadataService

**Source:** `GoogleApiWrapper/src/services/drive/DriveMetadataService.ts`

**Initialization:**
```javascript
new DriveMetadataService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `updateMetadata` | `updateMetadata(updateRequests: Object|Object[], options={}: Object): Object` |
| `getFiles` | `getFiles(fileIds: string|string[], options={}: Object, options.fields: string, options.strict=false: boolean): Object|Object<string, Object>` |
| `getPermissions` | `getPermissions(fileIds: string|string[]): Object[]|Object<string, Object[]>` |
| `getFileOwnerEmail` | `getFileOwnerEmail(fileId: string): string|null` |
| `searchFiles` | `searchFiles(query: string, options={}: Object, options.maxResults=Infinity: number, options.orderBy: string): Object[]` |


### DriveShortcutHandler

**Source:** `GoogleApiWrapper/src/services/drive/DriveShortcutHandler.ts`

**Initialization:**
```javascript
new DriveShortcutHandler()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createShortcut` | `createShortcut(targetId: string, name: string, parentId=null: string): Object` |
| `getTargetId` | `getTargetId(shortcutId: string): string|null` |
| `isShortcut` | `isShortcut(fileId: string): boolean` |


### SpreadsheetServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for SpreadsheetService. Implements structural sheet analysis and Jest tracking.

**Initialization:**
```javascript
new SpreadsheetServiceMock()
```


### PropertiesServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for PropertiesService. Implements in-memory Map-based persistence and automatic JSON serialization.

**Initialization:**
```javascript
new PropertiesServiceMock()
```


### DocumentServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for DocumentService. Supports builder pattern and structural document analysis.

**Initialization:**
```javascript
new DocumentServiceMock()
```


### TriggerServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for TriggerService. Implements in-memory trigger registry and lifecycle tracking.

**Initialization:**
```javascript
new TriggerServiceMock()
```


### MailServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for MailService.

**Initialization:**
```javascript
new MailServiceMock()
```


### LockServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for LockService.

**Initialization:**
```javascript
new LockServiceMock()
```


### DriveServiceMock

**Source:** `GoogleApiWrapper/src/testing/mocks.ts`

High-fidelity mock for DriveService.

**Initialization:**
```javascript
new DriveServiceMock()
```


---

## WorkspaceTemplateEngine

**Version:** 1.0.0   **Layer:** Domain Logic (Layer 2)   **Dependencies:** CoreUtilsLib, GoogleApiWrapper

### FilterStrategy

**Source:** `WorkspaceTemplateEngine/src/FilterStrategy.ts`

Abstract base for Mustache template filters using the Strategy pattern.
Enables value transformations via pipe syntax: `{{value | filterName:args}}`.

**Initialization:**
```javascript
new FilterStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): string` |
| `execute` | `execute(value: *, args: ...*): *` |
| `validate` | `validate(value: *, args: Array<*>): void` |


### FilterRegistry

**Source:** `WorkspaceTemplateEngine/src/FilterStrategy.ts`

Centralized registry for managing and resolving FilterStrategy instances.

**Initialization:**
```javascript
new FilterRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(filterStrategy: FilterStrategy): void` |
| `registerAll` | `registerAll(filterStrategies: FilterStrategy[]): void` |
| `get` | `get(name: string): FilterStrategy|null` |


### PlaceholderService

**Source:** `WorkspaceTemplateEngine/src/PlaceholderService.ts`

**Initialization:**
```javascript
new PlaceholderService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `processString` | `processString(template: string, context={}: Object): string` |
| `resolve` | `resolve(template: string, context={}: Object): string` |
| `processDocument` | `processDocument(documentId: string, context={}: Object): boolean` |
| `processSheet` | `processSheet(sheetId: string, context={}: Object, sheetName=null: string|null): {success: boolean, layouts: Array<{sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean` |


### MustacheRenderError

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

Thrown when template rendering exceeds the maximum nesting depth or
detects a self-referencing partial cycle — surfaces a catchable, diagnosable error
instead of an opaque call-stack overflow when a data-driven CONF_DOC/CONF_MAIL
template is malformed (ref analysis_3_structural_errors.md Finding 3).

**Initialization:**
```javascript
new MustacheRenderError()
```


### _MustacheScanner

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

State-tracking scanner for incremental Mustache template parsing.

**Initialization:**
```javascript
new _MustacheScanner()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `eos` | `eos(): boolean` |
| `scan` | `scan(re: RegExp): string` |
| `scanUntil` | `scanUntil(re: RegExp): string` |


### _MustacheContext

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

Hierarchical context stack for Mustache variable resolution.
Supports parent context navigation ('../') and dot-notation property access.

**Initialization:**
```javascript
new _MustacheContext()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `push` | `push(view: *): _MustacheContext` |
| `lookup` | `lookup(name: string): *` |
| `_isDangerousKey` | `_isDangerousKey(key: string): boolean` |


### _FunctionFilterStrategy

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

Adapter for converting standard functions into FilterStrategy instances.
Enables backward compatibility with functional filter registrations.

**Initialization:**
```javascript
new _FunctionFilterStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### MyMustache

**Source:** `WorkspaceTemplateEngine/src/facades/Mustache.ts`

Advanced Mustache engine with Handlebars meta-variables (@index, @number, @first, @last, @odd, @even, @total, @key) and Liquid-style filters.
Implements template caching, prototype pollution protection, and Strategy-based filter registry.

**Initialization:**
```javascript
new MyMustache()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |
| `isNullOrUndefined` | `isNullOrUndefined(value: *): boolean` |
| `TOKEN_TYPE` | `TOKEN_TYPE: unknown` |
| `TOKEN_VALUE` | `TOKEN_VALUE: unknown` |
| `TOKEN_START` | `TOKEN_START: unknown` |
| `TOKEN_END` | `TOKEN_END: unknown` |
| `TOKEN_CHILDREN` | `TOKEN_CHILDREN: unknown` |
| `TOKEN_INDEX` | `TOKEN_INDEX: unknown` |
| `TAG_SECTION` | `TAG_SECTION: unknown` |
| `TAG_INVERTED` | `TAG_INVERTED: unknown` |
| `TAG_SECTION_END` | `TAG_SECTION_END: unknown` |
| `TAG_COMMENT` | `TAG_COMMENT: unknown` |
| `TAG_PARTIAL` | `TAG_PARTIAL: unknown` |
| `TAG_UNESCAPED` | `TAG_UNESCAPED: unknown` |
| `TAG_UNESCAPED_ALT` | `TAG_UNESCAPED_ALT: unknown` |
| `TAG_VARIABLE` | `TAG_VARIABLE: unknown` |
| `TAG_TEXT` | `TAG_TEXT: unknown` |
| `MAX_RENDER_DEPTH` | `MAX_RENDER_DEPTH: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_isDangerousKey` | `_isDangerousKey(key: string): boolean` |
| `getValue` | `getValue(key: string, data: Object): *` |
| `_initBuiltInFilters` | `_initBuiltInFilters(): void` |
| `registerFilter` | `registerFilter(filterStrategyOrName: FilterStrategy|string, fn: Function): void` |
| `render` | `render(template: string, data={}: Object, additionalPartials={}: Object): string` |
| `renderSegments` | `renderSegments(template: string, data={}: Object, additionalPartials={}: Object): Array<{type: 'text'|'value', raw: string, rendered: string, rawStart: number, rawEnd: number` |
| `_escapeRegExp` | `_escapeRegExp(string: string): string` |
| `_escapeHtml` | `_escapeHtml(string: string): string` |
| `_parse` | `_parse(template: string, tags: string[]): Array[]` |
| `_renderTokens` | `_renderTokens(tokens: Array[], context: MustacheContext, partials: Object, originalTemplate: string, state: Object): string` |
| `_lookupValue` | `_lookupValue(token: Array, context: MustacheContext): *` |
| `_escapedValue` | `_escapedValue(token: Array, context: MustacheContext): string|undefined` |
| `_unescapedValue` | `_unescapedValue(token: Array, context: MustacheContext): string|undefined` |
| `_createLoopContext` | `_createLoopContext(item: *, index: number, total: number, key: string): Object|*` |
| `_renderSection` | `_renderSection(token: Array, context: MustacheContext, partials: Object, originalTemplate: string, state: Object): string|undefined` |
| `_renderInverted` | `_renderInverted(token: Array, context: MustacheContext, partials: Object, originalTemplate: string, state: Object): string|undefined` |
| `_renderPartial` | `_renderPartial(token: Array, context: MustacheContext, partials: Object|function, state: Object): string|undefined` |
| `_squashTokens` | `_squashTokens(tokens: Array[]): Array[]` |
| `_nestTokens` | `_nestTokens(tokens: Array[]): Array[]` |
| `_parseTemplate` | `_parseTemplate(template: string, tags: string[]): Array[]` |


### DefaultFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.

**Initialization:**
```javascript
new DefaultFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### YesNoFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Boolean-to-string transformer. Format: "YesString,NoString".

**Initialization:**
```javascript
new YesNoFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### TruncateFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

String truncator with optional suffix. Defaults to 50 chars and "...".

**Initialization:**
```javascript
new TruncateFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### SplitFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

String-to-array splitter using a specified separator (default: ",").

**Initialization:**
```javascript
new SplitFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### ReplaceFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Global string replacer. Replaces all occurrences of searchValue with replaceValue.

**Initialization:**
```javascript
new ReplaceFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### UrlEncodeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

URI component encoder for URL-safe string generation.

**Initialization:**
```javascript
new UrlEncodeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### MapFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.

**Initialization:**
```javascript
new MapFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(): void` |
| `execute` | `execute(): void` |


### LimitFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Array slicer. Returns the first N items (default: 10).

**Initialization:**
```javascript
new LimitFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### SkipFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Array offsetter. Skips the first N items.

**Initialization:**
```javascript
new SkipFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### SortFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.

**Initialization:**
```javascript
new SortFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(): void` |
| `execute` | `execute(): void` |


### ReverseFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Array order reverser. Creates a shallow copy before reversing.

**Initialization:**
```javascript
new ReverseFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### PlusFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Numeric addition filter. Adds addend to the value.

**Initialization:**
```javascript
new PlusFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### MinusFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

Numeric subtraction filter. Subtracts subtrahend from the value.

**Initialization:**
```javascript
new MinusFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### JsonFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.ts`

JSON serializer with optional indentation support.

**Initialization:**
```javascript
new JsonFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### UppercaseFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

String transformer. Converts all characters to uppercase.

**Initialization:**
```javascript
new UppercaseFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### LowercaseFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

String transformer. Converts all characters to lowercase.

**Initialization:**
```javascript
new LowercaseFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### UncapitalizeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

String transformer. Converts only the first character to lowercase. Unicode-safe.

**Initialization:**
```javascript
new UncapitalizeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### CapitalizeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.

**Initialization:**
```javascript
new CapitalizeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### DateFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.

**Initialization:**
```javascript
new DateFilter()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `_formatDDMMYYYY` | `_formatDDMMYYYY(date: Date): string` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### NumberFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Number formatter. Applies locale-specific formatting with optional fixed decimals.

**Initialization:**
```javascript
new NumberFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### JoinFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.

**Initialization:**
```javascript
new JoinFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(key: string): boolean` |
| `execute` | `execute(): void` |


### PluralizeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Conditional string selector. Returns singular or plural form based on a numeric count.

**Initialization:**
```javascript
new PluralizeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `execute` | `execute(): void` |


### WhereFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.

**Initialization:**
```javascript
new WhereFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(): void` |
| `execute` | `execute(): void` |


### ExcludeFilter

**Source:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.ts`

Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.

**Initialization:**
```javascript
new ExcludeFilter()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): void` |
| `getDescription` | `getDescription(): void` |
| `_isDangerousKey` | `_isDangerousKey(): void` |
| `execute` | `execute(): void` |


### DocumentProcessorInjector

**Source:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorInjector.ts`

**Initialization:**
```javascript
new DocumentProcessorInjector()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_buildStyledSegments` | `_buildStyledSegments(template: string, data: Object): Array<{rendered: string, style: Object` |
| `_styleAt` | `_styleAt(offset: number): Object` |
| `_rebaseSourceRuns` | `_rebaseSourceRuns(shift: number): Array<{start:number, end:number, style:Object` |
| `_executeRowLoopOperation` | `_executeRowLoopOperation(): void` |
| `_executeColumnLoopOperation` | `_executeColumnLoopOperation(): void` |
| `_convertOperationToRequests` | `_convertOperationToRequests(): void` |
| `_createTextSubstitutionRequests` | `_createTextSubstitutionRequests(): void` |
| `_createDeleteRangeRequests` | `_createDeleteRangeRequests(): Array<Object>` |
| `_createDeleteRowRequests` | `_createDeleteRowRequests(): void` |
| `_executeListLoopOperation` | `_executeListLoopOperation(documentId: string, op: Object): void` |
| `_escapeForFindText` | `_escapeForFindText(text: string): string` |
| `_retextParagraph` | `_retextParagraph(paragraph: Paragraph): void` |
| `_executeTableInsertOperation` | `_executeTableInsertOperation(documentId: string): void` |
| `_flushDocumentChanges` | `_flushDocumentChanges(): void` |


### DocumentProcessorTagScanner

**Source:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorTagScanner.ts`

**Initialization:**
```javascript
new DocumentProcessorTagScanner()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_analyzeColumnLoops` | `_analyzeColumnLoops(): void` |
| `_analyzeRowLoops` | `_analyzeRowLoops(): void` |
| `_analyzeListLoops` | `_analyzeListLoops(): void` |
| `_analyzeConditionalSections` | `_analyzeConditionalSections(textMatches: Array<Object>, context: Object): Array<{type: 'conditionalDelete', index: number, length: number, kind: 'section'|'marker'` |
| `_resolveConditionalSectionNode` | `_resolveConditionalSectionNode(context: Object): Array<{type: 'conditionalDelete', index: number, length: number, kind: 'section'|'marker'` |
| `_analyzeTextSubstitutions` | `_analyzeTextSubstitutions(): void` |
| `_analyzeTableInsertions` | `_analyzeTableInsertions(textMatches: Array<Object>, context: Object): Array<{type: 'tableInsert', placeholder: string, data: Array<Array<*>>, options: Object` |
| `_parseTableParams` | `_parseTableParams(paramsStr: string): Object<string,string>` |
| `_parseExpression` | `_parseExpression(): void` |
| `_parseFilterArgs` | `_parseFilterArgs(): void` |
| `_parseArgValue` | `_parseArgValue(): void` |


### DocumentProcessorValueResolver

**Source:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorValueResolver.ts`

**Initialization:**
```javascript
new DocumentProcessorValueResolver()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_applyFilters` | `_applyFilters(): void` |
| `_sortByProperty` | `_sortByProperty(): void` |
| `_getNestedProperty` | `_getNestedProperty(): void` |


### _DocumentProcessor

**Source:** `WorkspaceTemplateEngine/src/processors/DocumentProcessor.ts`

**Initialization:**
```javascript
new _DocumentProcessor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_computeFalsyConditionalRanges` | `_computeFalsyConditionalRanges(currentStructure: Object, context: Object): Array<[number, number]>` |
| `_isInsideAnyRange` | `_isInsideAnyRange(ranges: Array<[number, number]>, index: number): boolean` |
| `process` | `process(): void` |


### _SheetProcessor

**Source:** `WorkspaceTemplateEngine/src/processors/SheetProcessor.ts`

Specialized engine for Google Sheets template expansion using batch-first strategy.
Implements cell-level substitutions and structural expansions (matrices, dynamic columns) in atomic updates.

**Initialization:**
```javascript
new _SheetProcessor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `process` | `process(sheetId: string, context: Object, sheetName: string|null): {layouts: Array<{sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean, item: *` |
| `_parseDynamicColumnParams` | `_parseDynamicColumnParams(paramsStr: string): Object<string,string>` |
| `_bucketDynamicColumnGroups` | `_bucketDynamicColumnGroups(params: Object<string,string>): Array<{source: string|undefined, value: string|undefined, acl: string|undefined, scope: string, label: string|undefined` |
| `_prepareDynamicColumnRequests` | `_prepareDynamicColumnRequests(sheetName: string, startRow: number, startColumn: number, placeholder: string, context: Object): {valueRequests: Object[], protectionRequests: Object[], layout: ({sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean, item: *` |
| `_prepareDynamicRowRequests` | `_prepareDynamicRowRequests(sheetName: string, startRow: number, startColumn: number, placeholder: string, context: Object): {valueRequests: Object[]` |
| `_applyProtections` | `_applyProtections(spreadsheetId: string, protectionRequests: Object[]): void` |
| `_prepareMatrixRequests` | `_prepareMatrixRequests(sheetName: string, startRow: number, startColumn: number, placeholder: string, context: Object): Object[]` |
| `_expandGridIfNeeded` | `_expandGridIfNeeded(spreadsheetId: string, sheets: Object[], batchRequests: Object[]): void` |
| `_columnToLetter` | `_columnToLetter(column: number): string` |
| `_rangeToA1` | `_rangeToA1(startRow: number, startColumn: number, endRow: number, endColumn: number): string` |


### MustacheMock

**Source:** `WorkspaceTemplateEngine/src/testing/mocks.ts`

High-fidelity mock for the Mustache engine.
Simulates core rendering logic, variable substitution, and basic filter execution for unit testing.

**Initialization:**
```javascript
new MustacheMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_getValue` | `_getValue(obj: Object, path: string): *` |


---

## GasExpressionEngineLib

**Version:** 1.0.0 **Layer:** Domain Logic (Layer 2)   **Dependencies:** CoreUtilsLib   **External Libraries:** jsep (JavaScript Expression Parser)

### ExpressionEngineService

**Source:** `GasExpressionEngineLib/src/ExpressionEngineService.ts`

Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.

**Initialization:**
```javascript
new ExpressionEngineService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_initializeServices` | `_initializeServices(): void` |
| `evaluate` | `evaluate(expressionString: string, context={}: Object): boolean` |
| `parse` | `parse(expressionString: string): Object` |
| `clearCache` | `clearCache(): void` |


### ExpressionEvaluatorService

**Source:** `GasExpressionEngineLib/src/ExpressionEvaluatorService.ts`

Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.

**Initialization:**
```javascript
new ExpressionEvaluatorService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `evaluate` | `evaluate(): void` |
| `evaluateAst` | `evaluateAst(): void` |
| `_evaluateNode` | `_evaluateNode(): void` |
| `_evaluateIdentifier` | `_evaluateIdentifier(): void` |
| `_evaluateMemberExpression` | `_evaluateMemberExpression(): void` |
| `_buildPathFromMemberExpression` | `_buildPathFromMemberExpression(): void` |
| `_evaluateLiteral` | `_evaluateLiteral(): void` |
| `_evaluateArrayExpression` | `_evaluateArrayExpression(): void` |
| `_evaluateCallExpression` | `_evaluateCallExpression(): void` |
| `_areBothNullOrUndefined` | `_areBothNullOrUndefined(a: *, b: *): boolean` |
| `_hasCircularReference` | `_hasCircularReference(): void` |
| `_parseValue` | `_parseValue(): void` |
| `_builtInFunctions` | `_builtInFunctions: Object<string, Function>` |
| `_evaluateBinaryExpression` | `_evaluateBinaryExpression(): void` |
| `_evaluateUnaryExpression` | `_evaluateUnaryExpression(): void` |
| `_compare` | `_compare(a: *, b: *): number` |
| `_equals` | `_equals(): void` |


### ExpressionParserService

**Source:** `GasExpressionEngineLib/src/ExpressionParserService.ts`

Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.

**Initialization:**
```javascript
new ExpressionParserService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `parse` | `parse(expressionString: string): Object` |
| `_preprocess` | `_preprocess(expressionString: string): string` |
| `_convertNumericPathSegments` | `_convertNumericPathSegments(expression: string): string` |
| `_convertPlaceholders` | `_convertPlaceholders(expression: string): string` |
| `_convertBetweenOperator` | `_convertBetweenOperator(expression: string): string` |
| `_configureJSEP` | `_configureJSEP(): void` |
| `_buildAst` | `_buildAst(preprocessedExpression: string): Object` |


---

## SheetDBLib

**Version:** 1.0.0   **Layer:** Data Persistence (Layer 1)   **Dependencies:** CoreUtilsLib, GoogleApiWrapper

### DatabaseService

**Source:** `SheetDBLib/src/DatabaseService.ts`

**Initialization:**
```javascript
new DatabaseService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `save` | `save(): void` |
| `beginTransaction` | `beginTransaction(): void` |
| `commit` | `commit(): void` |
| `rollback` | `rollback(): void` |
| `_performRollback` | `_performRollback(): void` |
| `inTransaction` | `inTransaction(): void` |
| `_readVerifiedSheetInfo` | `_readVerifiedSheetInfo(): void` |
| `_allTablesVisible` | `_allTablesVisible(): void` |
| `_initialize` | `_initialize(): void` |
| `getTable` | `getTable(): void` |
| `hasTable` | `hasTable(): void` |
| `listTables` | `listTables(): void` |
| `_isDryRun` | `_isDryRun(): void` |
| `getMetadata` | `getMetadata(): void` |
| `select` | `select(): void` |


### TableService

**Source:** `SheetDBLib/src/TableService.ts`

ORM-lite facade for a single Google Sheet. Orchestrates CRUD, validation, computed virtual columns, and write-through caching.

**Initialization:**
```javascript
new TableService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `ALPHABET_SIZE` | `ALPHABET_SIZE: unknown` |
| `ASCII_CODE_A` | `ASCII_CODE_A: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `insertRow` | `insertRow(): void` |
| `insertRows` | `insertRows(): void` |
| `updateRowById` | `updateRowById(): void` |
| `patchRow` | `patchRow(): void` |
| `deleteRowById` | `deleteRowById(): void` |
| `updateRowsByIds` | `updateRowsByIds(): void` |
| `deleteRowsByIds` | `deleteRowsByIds(): void` |
| `setSchema` | `setSchema(): void` |
| `disableSchemaValidation` | `disableSchemaValidation(): void` |
| `enableSchemaValidation` | `enableSchemaValidation(): void` |
| `_validateRow` | `_validateRow(): void` |
| `fuzzySearch` | `fuzzySearch(): void` |
| `fuzzySearchRows` | `fuzzySearchRows(rows: Object[], query: string, fields: string[], threshold=0.3: number, options={}: Object): Object[]` |
| `createIndex` | `createIndex(): void` |
| `_indexedLookup` | `_indexedLookup(): void` |
| `invalidateIndex` | `invalidateIndex(): void` |
| `getRows` | `getRows(): void` |
| `flush` | `flush(): void` |
| `setPrimaryKey` | `setPrimaryKey(): void` |
| `getKeyField` | `getKeyField(): void` |
| `getRowById` | `getRowById(): void` |
| `defineVirtualColumn` | `defineVirtualColumn(): void` |
| `getByPK` | `getByPK(): void` |
| `getAllRows` | `getAllRows(): void` |
| `_invalidateInternalCache` | `_invalidateInternalCache(): void` |
| `_ensureDataLoaded` | `_ensureDataLoaded(): void` |
| `_processRawData` | `_processRawData(): void` |
| `_coerceValue` | `_coerceValue(): void` |
| `_storeOriginalRowData` | `_storeOriginalRowData(): void` |
| `_findRowIndexById` | `_findRowIndexById(): void` |
| `_loadHeader` | `_loadHeader(): void` |
| `_determinePrimaryKey` | `_determinePrimaryKey(): void` |
| `_applyVirtualColumns` | `_applyVirtualColumns(): void` |
| `_convertIndexToColumn` | `_convertIndexToColumn(): void` |
| `_getPkColumnLetter` | `_getPkColumnLetter(): void` |


### QueryAggregation

**Source:** `SheetDBLib/src/internal/query-builders/AdvancedQueryParser.ts`

Operational model for computing scalar aggregations over record collections.
Supports COUNT, SUM, AVG, MIN, and MAX operations with automatic float coercion.

**Initialization:**
```javascript
new QueryAggregation()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_getFieldValue` | `_getFieldValue(row: Object, field: string): *` |
| `calculate` | `calculate(rows: Object[]): number|null` |


### AdvancedQueryValidator

**Source:** `SheetDBLib/src/internal/query-builders/AdvancedQueryValidator.ts`

Static structural validation for Query Builder operations.
Verifies table existence, relational integrity for JOINs, and type correctness for query operands.

**Initialization:**
```javascript
new AdvancedQueryValidator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `validateTable` | `validateTable(dbService: DatabaseService, tableName: string): void` |
| `validateJoin` | `validateJoin(dbService: DatabaseService, table: string, type='JOIN': string): void` |
| `validateWhereIn` | `validateWhereIn(field: string, values: *): void` |
| `validateFuzzyCondition` | `validateFuzzyCondition(field: *, query: *, options: *): void` |
| `validateOrderDirection` | `validateOrderDirection(direction: string): void` |


### QueryCache

**Source:** `SheetDBLib/src/query/AdvancedQueryBuilder.ts`

Internal TTL-based cache manager for advanced query results.
Uses deterministic hashing of query configuration (filters, joins, aggregations) to manage result persistence.

**Initialization:**
```javascript
new QueryCache()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_generateKey` | `_generateKey(query: Object): string` |
| `get` | `get(query: Object): Object[]|null` |
| `store` | `store(query: Object, result: Object[]): boolean` |
| `invalidateTable` | `invalidateTable(): boolean` |


### AdvancedQueryBuilder

**Source:** `SheetDBLib/src/query/AdvancedQueryBuilder.ts`

**Initialization:**
```javascript
new AdvancedQueryBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `select` | `select(): void` |
| `from` | `from(): void` |
| `join` | `join(): void` |
| `leftJoin` | `leftJoin(): void` |
| `rightJoin` | `rightJoin(): void` |
| `fullOuterJoin` | `fullOuterJoin(): void` |
| `where` | `where(): void` |
| `orWhere` | `orWhere(): void` |
| `or` | `or(): void` |
| `andWhere` | `andWhere(): void` |
| `and` | `and(): void` |
| `whereLike` | `whereLike(): void` |
| `whereFuzzy` | `whereFuzzy(): void` |
| `orWhereFuzzy` | `orWhereFuzzy(): void` |
| `whereIn` | `whereIn(): void` |
| `groupBy` | `groupBy(): void` |
| `sum` | `sum(): void` |
| `avg` | `avg(): void` |
| `count` | `count(): void` |
| `min` | `min(): void` |
| `max` | `max(): void` |
| `orderBy` | `orderBy(): void` |
| `orderByDesc` | `orderByDesc(): void` |
| `limit` | `limit(): void` |
| `offset` | `offset(): void` |
| `paginate` | `paginate(): void` |
| `_extractFieldValue` | `_extractFieldValue(row: Object, fieldSpec: string): *` |
| `_performJoin` | `_performJoin(leftRows: Object[], joinConfig: Object): Object[]` |
| `_tryIndexOptimization` | `_tryIndexOptimization(table: Object): Object[]|null` |
| `_getRemainingConditions` | `_getRemainingConditions(): Object[]` |
| `_getFieldValue` | `_getFieldValue(row: Object, field: string): *` |
| `_applyConditionsFiltered` | `_applyConditionsFiltered(rows: Object[], conditions: Object[]): Object[]` |
| `_compileFuzzyMatches` | `_compileFuzzyMatches(rows: Object[], conditions: Object[]): Map<number, Set<Object>>` |
| `_applyConditions` | `_applyConditions(rows: Object[]): Object[]` |
| `_applyGroupBy` | `_applyGroupBy(rows: Object[]): Object[]` |
| `_partialSort` | `_partialSort(): void` |
| `_createComparator` | `_createComparator(): void` |
| `_quickSelect` | `_quickSelect(): void` |
| `_medianOfThree` | `_medianOfThree(): void` |
| `_partition` | `_partition(): void` |
| `execute` | `execute(): void` |
| `get` | `get(): void` |
| `first` | `first(): void` |
| `exists` | `exists(): void` |


### TableServiceMock

**Source:** `SheetDBLib/src/testing/mocks.ts`

Mock implementation of TableService for unit testing CRUD logic.
Manages an internal array of records and simulates primary key generation and indexing.

**Initialization:**
```javascript
new TableServiceMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setData` | `setData(data: Object[]): TableServiceMock` |


### DatabaseServiceMock

**Source:** `SheetDBLib/src/testing/mocks.ts`

High-fidelity mock for DatabaseService.
Orchestrates TableServiceMock instances and provides a unified interface for mocking database-wide operations.

**Initialization:**
```javascript
new DatabaseServiceMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `registerTable` | `registerTable(name: string, mock: TableServiceMock): TableServiceMock` |


---

## RoleResolutionLib

Role Resolution Library - Layer 2 service for resolving abstract roles to concrete actors.

### Actor

**Source:** `RoleResolutionLib/src/core/Actor.ts`

Immutable Value Object representing a role-bearing entity (PERSON, SYSTEM, or GROUP).

**Initialization:**
```javascript
new Actor()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `person` | `person(id: string, email: string, displayName: string, metadata={}: Object): Actor` |
| `system` | `system(id: string, serviceId: string, displayName: string, metadata={}: Object): Actor` |
| `group` | `group(id: string, groupId: string, displayName: string, metadata={}: Object): Actor` |
| `fromJSON` | `fromJSON(obj: Object): Actor` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isPerson` | `isPerson(): void` |
| `isSystem` | `isSystem(): void` |
| `isGroup` | `isGroup(): void` |
| `equals` | `equals(): void` |
| `getMetadata` | `getMetadata(): void` |
| `withMetadata` | `withMetadata(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### Assignment

**Source:** `RoleResolutionLib/src/core/Assignment.ts`

Immutable Value Object binding an Actor to a Role within a Scope (with temporal validity).

**Initialization:**
```javascript
new Assignment()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): Assignment` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_parseDate` | `_parseDate(): void` |
| `isValidAt` | `isValidAt(): void` |
| `matches` | `matches(): void` |
| `equals` | `equals(): void` |
| `getMetadata` | `getMetadata(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### AssignmentCandidate

**Source:** `RoleResolutionLib/src/core/AssignmentCandidate.ts`

Immutable candidate assignment that can become effective at a point in time.

**Initialization:**
```javascript
new AssignmentCandidate()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isValidAt` | `isValidAt(): void` |
| `toJSON` | `toJSON(): void` |


### AssignmentOverride

**Source:** `RoleResolutionLib/src/core/AssignmentOverride.ts`

Immutable, dated actor replacement scoped by opaque assignment dimensions.

**Initialization:**
```javascript
new AssignmentOverride()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `appliesAtDate` | `appliesAtDate(): void` |
| `matchesActor` | `matchesActor(): void` |
| `matchesSlot` | `matchesSlot(): void` |
| `matches` | `matches(): void` |
| `toJSON` | `toJSON(): void` |


### AssignmentSlot

**Source:** `RoleResolutionLib/src/core/AssignmentSlot.ts`

Immutable, opaque set of dimensions identifying an assignment slot.

**Initialization:**
```javascript
new AssignmentSlot()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `get` | `get(): void` |
| `matches` | `matches(): void` |
| `toJSON` | `toJSON(): void` |


### EffectiveAssignmentResult

**Source:** `RoleResolutionLib/src/core/EffectiveAssignmentResult.ts`

Immutable outcome of resolving a base assignment through overrides and delegation.

**Initialization:**
```javascript
new EffectiveAssignmentResult()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `toJSON` | `toJSON(): void` |


### ResolutionResult

**Source:** `RoleResolutionLib/src/core/ResolutionResult.ts`

Immutable Value Object encapsulating role resolution output (actors, delegation chain, routing).

**Initialization:**
```javascript
new ResolutionResult()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `empty` | `empty(requestedRole: Object, scope: Object, metadata={}: Object): ResolutionResult` |
| `simple` | `simple(requestedRole: Object, scope: Object, actor: Object): ResolutionResult` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isResolved` | `isResolved(): void` |
| `isDelegated` | `isDelegated(): void` |
| `getDelegationDepth` | `getDelegationDepth(): void` |
| `hasEffectiveActorChange` | `hasEffectiveActorChange(): void` |
| `getAllRoutingRecipients` | `getAllRoutingRecipients(): void` |
| `getAllActorIds` | `getAllActorIds(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### Role

**Source:** `RoleResolutionLib/src/core/Role.ts`

Immutable Value Object defining a responsibility, its scope requirements, and resolution logic.

**Initialization:**
```javascript
new Role()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): Role` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isGlobal` | `isGlobal(): void` |
| `resolvesToAll` | `resolvesToAll(): void` |
| `usesPriority` | `usesPriority(): void` |
| `hasFallbacks` | `hasFallbacks(): void` |
| `getMetadata` | `getMetadata(): void` |
| `equals` | `equals(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### Scope

**Source:** `RoleResolutionLib/src/core/Scope.ts`

Immutable Value Object defining the context (GLOBAL, ORG_UNIT, PROJECT, etc.) for role assignments.

**Initialization:**
```javascript
new Scope()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `global` | `global(): Scope` |
| `orgUnit` | `orgUnit(value: string, hierarchy=[: string[]): Scope` |
| `project` | `project(value: string|Object): Scope` |
| `resource` | `resource(value: string|Object): Scope` |
| `custom` | `custom(value: string|Object, hierarchy=[: string[]): Scope` |
| `fromJSON` | `fromJSON(obj: Object): Scope` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isGlobal` | `isGlobal(): void` |
| `contains` | `contains(): void` |
| `matches` | `matches(): void` |
| `getValueString` | `getValueString(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |
| `_valuesEqual` | `_valuesEqual(): void` |
| `_hierarchiesEqual` | `_hierarchiesEqual(): void` |


### Delegation

**Source:** `RoleResolutionLib/src/internal/delegation/Delegation.ts`

Immutable Value Object representing the transfer of role responsibilities from a Principal to a Delegate.

**Initialization:**
```javascript
new Delegation()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): Delegation` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `equals` | `equals(): void` |
| `toString` | `toString(): void` |


### DelegationChain

**Source:** `RoleResolutionLib/src/internal/delegation/DelegationChain.ts`

Immutable Collection representing a transitive series of Delegations (A -> B -> C).

**Initialization:**
```javascript
new DelegationChain()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `empty` | `empty(): DelegationChain` |
| `single` | `single(delegation: Delegation): DelegationChain` |
| `fromJSON` | `fromJSON(obj: Object): DelegationChain` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isEmpty` | `isEmpty(): void` |
| `getDepth` | `getDepth(): void` |
| `getOriginalPrincipalId` | `getOriginalPrincipalId(): void` |
| `getFinalDelegateId` | `getFinalDelegateId(): void` |
| `getAllActorIds` | `getAllActorIds(): void` |
| `getFirst` | `getFirst(): void` |
| `getLast` | `getLast(): void` |
| `getAt` | `getAt(): void` |
| `containsActor` | `containsActor(): void` |
| `wouldCreateCycle` | `wouldCreateCycle(): void` |
| `extend` | `extend(): void` |
| `forEach` | `forEach(): void` |
| `map` | `map(): void` |
| `isValidAt` | `isValidAt(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### DelegationRules

**Source:** `RoleResolutionLib/src/internal/delegation/DelegationRules.ts`

**Initialization:**
```javascript
new DelegationRules()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isValidAt` | `isValidAt(): void` |
| `appliesToRole` | `appliesToRole(): void` |
| `appliesToScope` | `appliesToScope(): void` |
| `appliesTo` | `appliesTo(): void` |
| `isFullDelegation` | `isFullDelegation(): void` |
| `isIndefinite` | `isIndefinite(): void` |
| `getRemainingDays` | `getRemainingDays(): void` |


### DelegationState

**Source:** `RoleResolutionLib/src/internal/delegation/DelegationState.ts`

**Initialization:**
```javascript
new DelegationState()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_parseDate` | `_parseDate(): void` |
| `getMetadata` | `getMetadata(): void` |
| `toJSON` | `toJSON(): void` |


### DelegationValidator

**Source:** `RoleResolutionLib/src/internal/delegation/DelegationValidator.ts`

Logic engine for enforcing constraints (cycles, depth, temporal, scope) on delegations and chains.

**Initialization:**
```javascript
new DelegationValidator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `validate` | `validate(): void` |
| `validateChain` | `validateChain(): void` |
| `_detectCycle` | `_detectCycle(): void` |
| `_checkScopeCoherence` | `_checkScopeCoherence(): void` |
| `validateExtension` | `validateExtension(): void` |
| `getMaxDelegationDepth` | `getMaxDelegationDepth(): void` |


### RoleResolutionError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

**Initialization:**
```javascript
new RoleResolutionError(message: string, context={}: Object, originalError=null: Error)
```


### RoleNotFoundError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a role ID is missing from the registry.

**Initialization:**
```javascript
new RoleNotFoundError()
```


### NoActorFoundError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when resolution logic yields an empty set for a role/scope.

**Initialization:**
```javascript
new NoActorFoundError()
```


### CircularDelegationError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a loop is detected in the delegation graph.

**Initialization:**
```javascript
new CircularDelegationError()
```


### InvalidScopeError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a provided scope type is incompatible with role requirements.

**Initialization:**
```javascript
new InvalidScopeError()
```


### DelegationDepthExceededError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a chain exceeds safety limits (default 10).

**Initialization:**
```javascript
new DelegationDepthExceededError()
```


### RoleValidationError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when role or actor definition schemas are violated.

**Initialization:**
```javascript
new RoleValidationError()
```


### MalformedAssignmentSlotError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

MalformedAssignmentSlotError @extends RoleResolutionError

**Initialization:**
```javascript
new MalformedAssignmentSlotError()
```


### DuplicateAssignmentSlotError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

DuplicateAssignmentSlotError @extends RoleResolutionError

**Initialization:**
```javascript
new DuplicateAssignmentSlotError()
```


### InconsistentAssignmentOverrideError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

InconsistentAssignmentOverrideError @extends RoleResolutionError

**Initialization:**
```javascript
new InconsistentAssignmentOverrideError()
```


### AmbiguousAssignmentOverrideError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

AmbiguousAssignmentOverrideError @extends RoleResolutionError

**Initialization:**
```javascript
new AmbiguousAssignmentOverrideError()
```


### AssignmentActorNotFoundError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

AssignmentActorNotFoundError @extends RoleResolutionError

**Initialization:**
```javascript
new AssignmentActorNotFoundError()
```


### OverlappingDelegationError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

OverlappingDelegationError @extends RoleResolutionError

**Initialization:**
```javascript
new OverlappingDelegationError()
```


### CircularAssignmentOverrideError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when a loop is detected while walking an override chain.

**Initialization:**
```javascript
new CircularAssignmentOverrideError()
```


### OverrideChainDepthExceededError

**Source:** `RoleResolutionLib/src/internal/errors/RoleResolutionError.ts`

Thrown when an override chain exceeds the configured maximum depth.

**Initialization:**
```javascript
new OverrideChainDepthExceededError()
```


### EffectiveAssignmentResolver

**Source:** `RoleResolutionLib/src/internal/resolution/EffectiveAssignmentResolver.ts`

Resolves generic candidates through temporal overrides, delegation, and routing.

**Initialization:**
```javascript
new EffectiveAssignmentResolver()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `resolve` | `resolve(): void` |
| `_resolveCandidate` | `_resolveCandidate(): void` |
| `_validateOverrides` | `_validateOverrides(): void` |
| `_selectOverrideChain` | `_selectOverrideChain(): void` |
| `_selectOverrideForActor` | `_selectOverrideForActor(): void` |
| `_resolveDelegations` | `_resolveDelegations(): void` |
| `_getOutgoingDelegations` | `_getOutgoingDelegations(): void` |
| `_getActor` | `_getActor(): void` |


### ResolutionPolicy

**Source:** `RoleResolutionLib/src/internal/resolution/ResolutionPolicy.ts`

Immutable policy options for effective-assignment resolution.

**Initialization:**
```javascript
new ResolutionPolicy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `toJSON` | `toJSON(): void` |


### ResolutionTrace

**Source:** `RoleResolutionLib/src/internal/resolution/ResolutionTrace.ts`

Immutable sequence of explainable effective-assignment decisions.

**Initialization:**
```javascript
new ResolutionTrace()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `append` | `append(): void` |
| `toJSON` | `toJSON(): void` |


### RoleResolver

**Source:** `RoleResolutionLib/src/internal/resolution/RoleResolver.ts`

Central orchestration engine for mapping roles to actors via assignments, fallbacks, and transitive delegations.

**Initialization:**
```javascript
new RoleResolver()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `resolve` | `resolve(): void` |
| `resolveMultiple` | `resolveMultiple(): void` |
| `resolveForActor` | `resolveForActor(): void` |
| `getRoutingFor` | `getRoutingFor(): void` |
| `_validateScope` | `_validateScope(): void` |
| `_applyResolutionStrategy` | `_applyResolutionStrategy(): void` |
| `_resolveDelegationChain` | `_resolveDelegationChain(): void` |
| `_getEffectiveRoutingPolicy` | `_getEffectiveRoutingPolicy(): void` |
| `_getActorsFromChain` | `_getActorsFromChain(): void` |


### RoutingResolver

**Source:** `RoleResolutionLib/src/internal/routing/RoutingResolver.ts`

Decision engine for mapping delegation chains and policies to communication buckets (primary, cc, bcc).

**Initialization:**
```javascript
new RoutingResolver()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `resolve` | `resolve(): void` |
| `_determinePolicy` | `_determinePolicy(): void` |
| `_resolveByPolicy` | `_resolveByPolicy(): void` |
| `_resolveDelegateOnly` | `_resolveDelegateOnly(): void` |
| `_resolvePrincipalOnly` | `_resolvePrincipalOnly(): void` |
| `_resolveBothEqual` | `_resolveBothEqual(): void` |
| `_resolveDelegatePrimaryPrincipalCC` | `_resolveDelegatePrimaryPrincipalCC(): void` |
| `_resolvePrincipalPrimaryDelegateCC` | `_resolvePrincipalPrimaryDelegateCC(): void` |
| `_resolveChainAll` | `_resolveChainAll(): void` |
| `_resolveDelegateOrPrincipal` | `_resolveDelegateOrPrincipal(): void` |
| `resolveChainAllWithActors` | `resolveChainAllWithActors(): void` |
| `getDefaultPolicy` | `getDefaultPolicy(): void` |


### RoutingResult

**Source:** `RoleResolutionLib/src/internal/routing/RoutingResult.ts`

Immutable Value Object categorizing actors into communication channels (primary, cc, bcc).

**Initialization:**
```javascript
new RoutingResult()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `empty` | `empty(): RoutingResult` |
| `singlePrimary` | `singlePrimary(actor: Actor): RoutingResult` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isEmpty` | `isEmpty(): void` |
| `toJSON` | `toJSON(): void` |
| `toString` | `toString(): void` |


### AssignmentSource

**Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`

**Initialization:**
```javascript
new AssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAssignmentsForRole` | `getAssignmentsForRole(): void` |
| `getAssignmentsForActor` | `getAssignmentsForActor(): void` |
| `getActorById` | `getActorById(): void` |


### InMemoryAssignmentSource

**Source:** `RoleResolutionLib/src/registry/AssignmentSource.ts`

Non-persistent implementation using arrays/maps for assignment storage.

**Initialization:**
```javascript
new InMemoryAssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addAssignment` | `addAssignment(): void` |
| `addActor` | `addActor(): void` |
| `getAssignmentsForRole` | `getAssignmentsForRole(): void` |
| `getAssignmentsForActor` | `getAssignmentsForActor(): void` |
| `getActorById` | `getActorById(): void` |
| `getAllAssignments` | `getAllAssignments(): void` |
| `getAllActors` | `getAllActors(): void` |
| `clear` | `clear(): void` |


### DelegationSource

**Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`

**Initialization:**
```javascript
new DelegationSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getActiveDelegationsForPrincipal` | `getActiveDelegationsForPrincipal(): void` |
| `getActiveDelegationsForDelegate` | `getActiveDelegationsForDelegate(): void` |
| `getDelegationChain` | `getDelegationChain(): void` |


### InMemoryDelegationSource

**Source:** `RoleResolutionLib/src/registry/DelegationSource.ts`

Non-persistent implementation using arrays for delegation storage.

**Initialization:**
```javascript
new InMemoryDelegationSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addDelegation` | `addDelegation(): void` |
| `getActiveDelegationsForPrincipal` | `getActiveDelegationsForPrincipal(): void` |
| `getActiveDelegationsForDelegate` | `getActiveDelegationsForDelegate(): void` |
| `getDelegationChain` | `getDelegationChain(): void` |
| `getAllDelegations` | `getAllDelegations(): void` |
| `clear` | `clear(): void` |


### EffectiveAssignmentSource

**Source:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`

Generic persistence contracts for effective-assignment resolution.

**Initialization:**
```javascript
new EffectiveAssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAssignments` | `getAssignments(): void` |


### OverrideSource

**Source:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`

**Initialization:**
```javascript
new OverrideSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getOverrides` | `getOverrides(): void` |


### ActorSource

**Source:** `RoleResolutionLib/src/registry/EffectiveAssignmentSource.ts`

**Initialization:**
```javascript
new ActorSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getActor` | `getActor(): void` |


### WideRowAssignmentSource

**Source:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`

Maps wide, tabular rows to opaque assignment candidates.

**Initialization:**
```javascript
new WideRowAssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAssignments` | `getAssignments(): void` |


### MappedOverrideSource

**Source:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`

Maps generic rows to dated, opaque assignment overrides.

**Initialization:**
```javascript
new MappedOverrideSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getOverrides` | `getOverrides(): void` |


### MappedDelegationSource

**Source:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`

Maps generic rows to context-scoped delegation values.

**Initialization:**
```javascript
new MappedDelegationSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getDelegations` | `getDelegations(): void` |


### CompositeAssignmentSource

**Source:** `RoleResolutionLib/src/registry/MappedAssignmentSources.ts`

Combines independent candidate sources with a deterministic identity.

**Initialization:**
```javascript
new CompositeAssignmentSource()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAssignments` | `getAssignments(): void` |


### RoleRegistry

**Source:** `RoleResolutionLib/src/registry/RoleRegistry.ts`

Centralized CRUD store for Role definitions. Handles validation and indexing.

**Initialization:**
```javascript
new RoleRegistry()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object, options={}: Object): RoleRegistry` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(): void` |
| `registerAll` | `registerAll(): void` |
| `get` | `get(): void` |
| `getOrNull` | `getOrNull(): void` |
| `has` | `has(): void` |
| `unregister` | `unregister(): void` |
| `getAll` | `getAll(): void` |
| `getAllIds` | `getAllIds(): void` |
| `size` | `size(): void` |
| `clear` | `clear(): void` |
| `find` | `find(): void` |
| `findByScopeType` | `findByScopeType(): void` |
| `findDelegatable` | `findDelegatable(): void` |
| `toJSON` | `toJSON(): void` |


---

## ComposableContentLib

ComposableContentLib - Layer 3 library for composing dynamic content from modular blocks.

### CompositionRecipe

**Source:** `ComposableContentLib/src/composition/CompositionRecipe.ts`

Immutable model for multi-block content composition.
Defines block selection, execution order, visibility logic, and serialization metadata.

**Initialization:**
```javascript
new CompositionRecipe()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): CompositionRecipe` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getOrderedBlocks` | `getOrderedBlocks(): BlockInstance[]` |
| `getBlock` | `getBlock(instanceId: string): BlockInstance|null` |
| `getBlocksByType` | `getBlocksByType(blockType: string): BlockInstance[]` |
| `getUsedBlockTypes` | `getUsedBlockTypes(): string[]` |
| `getBlockCount` | `getBlockCount(): number` |
| `usesBlockType` | `usesBlockType(blockType: string): boolean` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### ContentComposer

**Source:** `ComposableContentLib/src/composition/ContentComposer.ts`

Central orchestration engine for content block resolution and rendering.
Coordinates block registry lookups, visibility evaluation, and sequential block execution to generate aggregate content.

**Initialization:**
```javascript
new ContentComposer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `compose` | `compose(recipe: CompositionRecipe|Object, context: Object|BlockDataContext, options={}: Object, options.format: string, options.continueOnError=true: boolean): CompositionResult` |
| `composeToString` | `composeToString(recipe: CompositionRecipe|Object, context: Object|BlockDataContext, options={}: Object): string` |
| `_evaluateBlock` | `_evaluateBlock(blockInstance: Object, context: BlockDataContext, format: string, renderer: BlockRenderer): BlockResult` |
| `validateRecipe` | `validateRecipe(recipe: CompositionRecipe|Object): Object` |
| `getBlockRegistry` | `getBlockRegistry(): BlockRegistry` |
| `getRendererRegistry` | `getRendererRegistry(): RendererRegistry` |
| `toString` | `toString(): string` |


### BlockDefinition

**Source:** `ComposableContentLib/src/core/BlockDefinition.ts`

Immutable blueprint for a reusable content block type.
Specifies rendering capabilities, structural containment, and fallback behaviors.

**Initialization:**
```javascript
new BlockDefinition()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): BlockDefinition` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `supportsFormat` | `supportsFormat(format: string): boolean` |
| `hidesWhenEmpty` | `hidesWhenEmpty(): boolean` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### BlockResult

**Source:** `ComposableContentLib/src/core/BlockResult.ts`

Immutable data transfer object representing the outcome of a block rendering execution.
Extends the shared {@link Result} base for the success/error contract.
Encapsulates generated content, visibility state, errors, and profiling metrics.

**Initialization:**
```javascript
new BlockResult()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `hidden` | `hidden(instanceId: string, blockType: string, reason='hidden': string): BlockResult` |
| `error` | `error(instanceId: string, blockType: string, error: Error): BlockResult` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `hasDisplayableContent` | `hasDisplayableContent(): boolean` |
| `getMetadata` | `getMetadata(key: string, defaultValue=null: *): *` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### CompositionResult

**Source:** `ComposableContentLib/src/core/CompositionResult.ts`

Immutable DTO for final content composition output, aggregating block results, rendered content, and orchestration metrics.

**Initialization:**
```javascript
new CompositionResult()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `empty` | `empty(recipeId: string, outputFormat: string, reason='empty': string): CompositionResult` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSuccess` | `isSuccess(): boolean` |
| `getVisibleBlocks` | `getVisibleBlocks(): BlockResult[]` |
| `getHiddenBlocks` | `getHiddenBlocks(): BlockResult[]` |
| `getErrorBlocks` | `getErrorBlocks(): BlockResult[]` |
| `hasErrors` | `hasErrors(): boolean` |
| `getBlockById` | `getBlockById(instanceId: string): BlockResult|null` |
| `getBlocksByType` | `getBlocksByType(blockType: string): BlockResult[]` |
| `getContentLength` | `getContentLength(): number` |
| `getAverageBlockTime` | `getAverageBlockTime(): number` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### ContentBlock

**Source:** `ComposableContentLib/src/core/ContentBlock.ts`

Abstract base class defining the execution contract for content blocks.
Subclasses implement data extraction and template resolution and may customize empty-state
evaluation.

**Initialization:**
```javascript
new ContentBlock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getTypeId` | `getTypeId(): string` |
| `getName` | `getName(): string` |
| `getData` | `getData(context: BlockDataContext): Object` |
| `isEmpty` | `isEmpty(data: *): boolean` |
| `getTemplateId` | `getTemplateId(format: string): string` |
| `evaluate` | `evaluate(instanceId: string, context: BlockDataContext, format: string, renderer: BlockRenderer): BlockResult` |
| `render` | `render(data: Object, format: string, renderer: BlockRenderer, templateId: string): string` |
| `_getMetadata` | `_getMetadata(data: Object): Object` |
| `supportsFormat` | `supportsFormat(format: string): boolean` |
| `toString` | `toString(): string` |


### SimpleContentBlock

**Source:** `ComposableContentLib/src/core/ContentBlock.ts`

Concrete implementation of ContentBlock using injected extractor functions instead of subclassing.

**Initialization:**
```javascript
new SimpleContentBlock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getData` | `getData(context: BlockDataContext): Object` |
| `isEmpty` | `isEmpty(data: *): boolean` |
| `getTemplateId` | `getTemplateId(format: string): string` |


### BlockDataContext

**Source:** `ComposableContentLib/src/data/BlockDataContext.ts`

Encapsulated state container for rendering context.
Supports dot-notation resolution, merging global vs. block-local data, and immutable scoping.

**Initialization:**
```javascript
new BlockDataContext()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromJSON` | `fromJSON(obj: Object): BlockDataContext` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `get` | `get(path: string, defaultValue=null: *): *` |
| `has` | `has(path: string): boolean` |
| `getAll` | `getAll(): Object` |
| `set` | `set(path: string, value: *): void` |
| `merge` | `merge(additionalData: Object): void` |
| `isEmpty` | `isEmpty(): boolean` |
| `keys` | `keys(): string[]` |
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### ComposableContentError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Base class for domain-specific exceptions within the composition engine.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

**Initialization:**
```javascript
new ComposableContentError()
```


### BlockNotFoundError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when a requested block type is not registered.

**Initialization:**
```javascript
new BlockNotFoundError()
```


### RenderingError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when template rendering fails during block execution.

**Initialization:**
```javascript
new RenderingError()
```


### RecipeValidationError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when a Recipe definition manifest fails structural validation.

**Initialization:**
```javascript
new RecipeValidationError()
```


### RendererNotFoundError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when no renderer is registered for a requested output format.

**Initialization:**
```javascript
new RendererNotFoundError()
```


### TemplateNotFoundError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when a block's required template ID cannot be resolved.

**Initialization:**
```javascript
new TemplateNotFoundError()
```


### DataRequirementError

**Source:** `ComposableContentLib/src/errors/ComposableContentError.ts`

Exception thrown when a block's defined context data dependencies are unfulfilled.

**Initialization:**
```javascript
new DataRequirementError()
```


### BlockRenderer

**Source:** `ComposableContentLib/src/internal/BlockRenderer.ts`

Abstract base class for block rendering engines. Subclasses must implement format-specific logic.

**Initialization:**
```javascript
new BlockRenderer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getFormat` | `getFormat(): string` |
| `render` | `render(templateId: string, data: Object, options={}: Object, options.containerType: string, options.blockType: string): string` |
| `_processTemplate` | `_processTemplate(template: string, data: Object): string` |
| `_getValueByPath` | `_getValueByPath(obj: Object, path: string): *` |
| `_wrapInContainer` | `_wrapInContainer(content: string, containerType: string, options: Object): string` |
| `registerTemplate` | `registerTemplate(templateId: string, template: string|Function): BlockRenderer` |
| `registerTemplates` | `registerTemplates(templates: Object<string, string|Function>): BlockRenderer` |
| `hasTemplate` | `hasTemplate(templateId: string): boolean` |
| `templateCount` | `templateCount(): number` |
| `toString` | `toString(): string` |


### MarkdownRenderer

**Source:** `ComposableContentLib/src/internal/BlockRenderer.ts`

Markdown-specialized renderer implementation.

**Initialization:**
```javascript
new MarkdownRenderer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getFormat` | `getFormat(): string` |
| `_wrapInContainer` | `_wrapInContainer(content: string, containerType: string, options: Object): string` |


### PlainTextRenderer

**Source:** `ComposableContentLib/src/internal/BlockRenderer.ts`

Plain text specialized renderer implementation.

**Initialization:**
```javascript
new PlainTextRenderer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getFormat` | `getFormat(): string` |
| `_wrapInContainer` | `_wrapInContainer(content: string, containerType: string, options: Object): string` |


### HtmlRenderer

**Source:** `ComposableContentLib/src/internal/BlockRenderer.ts`

HTML-specialized renderer implementation.

**Initialization:**
```javascript
new HtmlRenderer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getFormat` | `getFormat(): string` |
| `_wrapInContainer` | `_wrapInContainer(content: string, containerType: string, options: Object): string` |


### VisibilityEvaluator

**Source:** `ComposableContentLib/src/internal/VisibilityEvaluator.ts`

Engine for resolving block visibility conditions against a data context.
Supports static rules ('always', 'never'), simple path truthiness, and complex expression evaluation.

**Initialization:**
```javascript
new VisibilityEvaluator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isVisible` | `isVisible(visibility: string, context: BlockDataContext): boolean` |
| `_evaluateExpression` | `_evaluateExpression(expression: string, context: BlockDataContext): boolean` |
| `_evaluateSimpleCondition` | `_evaluateSimpleCondition(condition: string, context: BlockDataContext): boolean` |
| `_getByPath` | `_getByPath(obj: Object, path: string): *` |
| `_isTruthy` | `_isTruthy(value: *): boolean` |
| `hasExpressionEngine` | `hasExpressionEngine(): boolean` |
| `toString` | `toString(): string` |


### BlockRegistry

**Source:** `ComposableContentLib/src/registry/BlockRegistry.ts`

Centralized registry for block type definitions and factory mappings for ContentBlock instantiation.

**Initialization:**
```javascript
new BlockRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(registration: Object, registration.definition: Object|BlockDefinition, registration.factory: Function): BlockDefinition` |
| `unregister` | `unregister(blockType: string): boolean` |
| `getDefinition` | `getDefinition(blockType: string): BlockDefinition` |
| `getDefinitionOrNull` | `getDefinitionOrNull(blockType: string): BlockDefinition|null` |
| `createBlock` | `createBlock(blockType: string, config={}: Object): ContentBlock` |
| `has` | `has(blockType: string): boolean` |
| `getBlockTypes` | `getBlockTypes(): string[]` |
| `getAllDefinitions` | `getAllDefinitions(): BlockDefinition[]` |
| `size` | `size(): number` |
| `clear` | `clear(): void` |
| `getBlocksForFormat` | `getBlocksForFormat(format: string): BlockDefinition[]` |
| `toString` | `toString(): string` |


### RendererRegistry

**Source:** `ComposableContentLib/src/registry/RendererRegistry.ts`

Centralized registry for BlockRenderer instances mapped by output format (e.g., 'html', 'markdown').

**Initialization:**
```javascript
new RendererRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_registerDefaults` | `_registerDefaults(): void` |
| `register` | `register(renderer: BlockRenderer): RendererRegistry` |
| `unregister` | `unregister(format: string): boolean` |
| `get` | `get(format: string): BlockRenderer` |
| `getOrNull` | `getOrNull(format: string): BlockRenderer|null` |
| `has` | `has(format: string): boolean` |
| `getFormats` | `getFormats(): string[]` |
| `getAllRenderers` | `getAllRenderers(): BlockRenderer[]` |
| `size` | `size(): number` |
| `clear` | `clear(): void` |
| `toString` | `toString(): string` |


### ContentBlockMock

**Source:** `ComposableContentLib/src/testing/mocks.ts`

High-fidelity Jest mock for ContentBlock implementations.

**Initialization:**
```javascript
new ContentBlockMock()
```


### BlockRegistryMock

**Source:** `ComposableContentLib/src/testing/mocks.ts`

High-fidelity Jest mock for BlockRegistry.

**Initialization:**
```javascript
new BlockRegistryMock()
```


---

## JobRunnerLib

**Version:** 2.0.0   **Layer:** Application Orchestration (Layer 3)   **Dependencies:** GoogleApiWrapper, GasResilienceLib

### JobDefinitionRegistry

**Source:** `JobRunnerLib/src/JobDefinitionRegistry.ts`

Centralized registry for dynamic job definition management.
Uses the shared {@link Registry} primitive (CoreUtilsLib) for Map-backed storage;
all job-specific validation, logging, and messages remain here.

**Initialization:**
```javascript
new JobDefinitionRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(): void` |
| `getDefinition` | `getDefinition(): void` |
| `listRegisteredJobs` | `listRegisteredJobs(): void` |
| `jobExists` | `jobExists(): void` |
| `_validateJobDefinition` | `_validateJobDefinition(): void` |


### JobExecutor

**Source:** `JobRunnerLib/src/JobQueue.ts`

Handles the low-level execution and monitoring of job generators.

**Initialization:**
```javascript
new JobExecutor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `execute` | `execute(handler: Function, parameters: Object, startTime: number, maxDuration: number): {done: boolean, value?: *, cancelled?: boolean` |


### JobQueue

**Source:** `JobRunnerLib/src/JobQueue.ts`

High-level API for job registration, execution, and lifecycle management.

**Initialization:**
```javascript
new JobQueue()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `DEFAULT_TRIGGER_DELAY_MS` | `DEFAULT_TRIGGER_DELAY_MS: number` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setMaxDuration` | `setMaxDuration(durationMs: number): JobQueue` |
| `setTriggerDelay` | `setTriggerDelay(delayMs: number): JobQueue` |
| `setMaxRetries` | `setMaxRetries(maxRetries: number|null): JobQueue` |
| `setOnFailure` | `setOnFailure(callback: Function|null): JobQueue` |
| `applyConfiguration` | `applyConfiguration(savedConfig: Object): JobQueue` |
| `registerJobHandler` | `registerJobHandler(jobType: string, handler: Function): JobQueue` |
| `execute` | `execute(jobName: string, jobType: string, parameters={}: Object, forceRestart=false: boolean, blockIfSuspended=false: boolean): *` |
| `resetJobState` | `resetJobState(jobName: string): boolean` |
| `cancelJob` | `cancelJob(jobName: string): boolean` |
| `getStatus` | `getStatus(jobName: string): {name: string, type: string, state: string, completed: boolean, percentage: number` |


### MyJobRunnerService

**Source:** `JobRunnerLib/src/JobRunnerService.ts`

**Initialization:**
```javascript
new MyJobRunnerService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_createQueue` | `_createQueue(): JobQueue` |


### QueueStateManager

**Source:** `JobRunnerLib/src/QueueStateManager.ts`

**Initialization:**
```javascript
new QueueStateManager()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `STATE_RUNNING` | `STATE_RUNNING: unknown` |
| `STATE_COMPLETED` | `STATE_COMPLETED: unknown` |
| `STATE_CANCELLED` | `STATE_CANCELLED: unknown` |
| `STATE_FAILED` | `STATE_FAILED: unknown` |
| `STATE_PENDING` | `STATE_PENDING: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_key` | `_key(): void` |
| `getStateVersion` | `getStateVersion(): void` |
| `_incrementVersion` | `_incrementVersion(): void` |
| `setState` | `setState(): void` |
| `getState` | `getState(): void` |
| `isCancelled` | `isCancelled(): void` |
| `getStateWithVersion` | `getStateWithVersion(): void` |
| `tryAcquireRunning` | `tryAcquireRunning(blockIfSuspended=false: boolean): void` |
| `releaseLock` | `releaseLock(): void` |
| `getRetryCount` | `getRetryCount(): void` |
| `incrementRetryCount` | `incrementRetryCount(): void` |
| `resetRetryCount` | `resetRetryCount(): void` |
| `saveFailureInfo` | `saveFailureInfo(): void` |
| `getFailureInfo` | `getFailureInfo(): void` |
| `reset` | `reset(): void` |


### CapturingLogger

**Source:** `JobRunnerLib/src/internal/CapturingLogger.ts`

Transparent proxy logger that captures and buffers log messages for post-execution analysis.

**Initialization:**
```javascript
new CapturingLogger()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_capture` | `_capture(level: string, message: string, context=null: Object): void` |
| `_proxy` | `_proxy(level: string, message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `debug` | `debug(message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `info` | `info(message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `warn` | `warn(message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `error` | `error(message: string|Object|Function, context: Object|Function): CapturingLogger` |
| `log` | `log(level: string, message: string|Object|Function): CapturingLogger` |
| `withPosition` | `withPosition(): void` |
| `_semantic` | `_semantic(): void` |
| `_withoutTrailingUndefined` | `_withoutTrailingUndefined(): void` |
| `logJobStart` | `logJobStart(): void` |
| `logJobResume` | `logJobResume(): void` |
| `logJobEnd` | `logJobEnd(): void` |
| `logJobSuspended` | `logJobSuspended(): void` |
| `logBatchStart` | `logBatchStart(): void` |
| `logItemStart` | `logItemStart(): void` |
| `logStep` | `logStep(): void` |
| `logPipelineStart` | `logPipelineStart(): void` |
| `logPipelineStep` | `logPipelineStep(): void` |
| `logSummary` | `logSummary(): void` |
| `getLogsAsText` | `getLogsAsText(separator='\n': string): string` |
| `getLogsAsHtml` | `getLogsAsHtml(): string` |
| `_escapeHtml` | `_escapeHtml(text: string): string` |
| `getLogCount` | `getLogCount(): number` |
| `setLevel` | `setLevel(level: string): CapturingLogger` |
| `getLevel` | `getLevel(): string` |


### QueuePersistenceHandler

**Source:** `JobRunnerLib/src/internal/QueuePersistenceHandler.ts`

**Initialization:**
```javascript
new QueuePersistenceHandler()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `LARGE_STATE_THRESHOLD` | `LARGE_STATE_THRESHOLD: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_driveApp` | `_driveApp(): GoogleAppsScript.Drive.DriveApp|undefined` |
| `_key` | `_key(): void` |
| `_resolveResumeStatePatch` | `_resolveResumeStatePatch(state: *): {properties: Object<string,string>, propertiesToDelete: string[]` |
| `_resolveResumeStatePatchForBatch` | `_resolveResumeStatePatchForBatch(state: *): {properties: Object<string,string>, propertiesToDelete: string[]` |
| `batchSave` | `batchSave(): void` |
| `saveResumeState` | `saveResumeState(): void` |
| `loadResumeState` | `loadResumeState(): void` |
| `_saveLargeStateToDrive` | `_saveLargeStateToDrive(): void` |
| `_loadLargeStateFromDrive` | `_loadLargeStateFromDrive(): void` |
| `_getOrCreateJobStateFolder` | `_getOrCreateJobStateFolder(): void` |
| `saveConfiguration` | `saveConfiguration(): void` |
| `loadConfiguration` | `loadConfiguration(): void` |
| `saveType` | `saveType(): void` |
| `loadType` | `loadType(): void` |
| `clearResumeState` | `clearResumeState(): void` |
| `reset` | `reset(): void` |


### QueueProgressTracker

**Source:** `JobRunnerLib/src/internal/QueueProgressTracker.ts`

**Initialization:**
```javascript
new QueueProgressTracker()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_key` | `_key(): void` |
| `saveProgress` | `saveProgress(): void` |
| `reset` | `reset(): void` |
| `_calculateExactTotal` | `_calculateExactTotal(): void` |


### JobRunnerExecutionController

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerExecutionController.ts`

**Initialization:**
```javascript
new JobRunnerExecutionController()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_semantic` | `_semantic(): void` |
| `_logJobStart` | `_logJobStart(): void` |
| `_logJobResume` | `_logJobResume(): void` |
| `_logTerminal` | `_logTerminal(): void` |
| `_status` | `_status(): void` |
| `run` | `run(): void` |
| `resume` | `resume(): void` |


### JobRunnerLogCapturer

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerLogCapturer.ts`

**Initialization:**
```javascript
new JobRunnerLogCapturer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validateLoggingConfig` | `_validateLoggingConfig(): void` |
| `_displayLogs` | `_displayLogs(): void` |
| `_displayLogsInSidebar` | `_displayLogsInSidebar(): void` |
| `_displayLogsInDriveFile` | `_displayLogsInDriveFile(): void` |


### JobStateManager

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerStateManager.ts`

**Initialization:**
```javascript
new JobStateManager()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `STATE_RUNNING` | `STATE_RUNNING: unknown` |
| `STATE_COMPLETED` | `STATE_COMPLETED: unknown` |
| `STATE_CANCELLED` | `STATE_CANCELLED: unknown` |
| `STATE_FAILED` | `STATE_FAILED: unknown` |
| `STATE_PENDING` | `STATE_PENDING: unknown` |
| `LARGE_STATE_THRESHOLD` | `LARGE_STATE_THRESHOLD: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `reset` | `reset(): void` |


### JobRunnerStateManager

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerStateManager.ts`

**Initialization:**
```javascript
new JobRunnerStateManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getStatus` | `getStatus(): void` |
| `resetJob` | `resetJob(): void` |
| `cancelJob` | `cancelJob(): void` |


### JobTriggerManager

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerTriggerManager.ts`

**Initialization:**
```javascript
new JobTriggerManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `createResumeTrigger` | `createResumeTrigger(): void` |
| `deleteExistingTriggers` | `deleteExistingTriggers(): void` |


### JobRunnerTriggerManager

**Source:** `JobRunnerLib/src/internal/managers/JobRunnerTriggerManager.ts`

**Initialization:**
```javascript
new JobRunnerTriggerManager()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_getCurrentTriggerId` | `_getCurrentTriggerId(): string|null` |


---

## PipelineFramework

**Version:** 1.0.0   **Layer:** Application Orchestration (Layer 3)   **Dependencies:** CoreUtilsLib, GasResilienceLib (Optional)

### Pipeline

**Source:** `PipelineFramework/src/Pipeline.ts`

Orchestrator for sequential step execution with shared context and lifecycle hooks.

**Initialization:**
```javascript
new Pipeline()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_normalizeLogPosition` | `_normalizeLogPosition(): void` |
| `_stepLogPosition` | `_stepLogPosition(): void` |
| `_summaryLogPosition` | `_summaryLogPosition(): void` |
| `_executionLogPosition` | `_executionLogPosition(): void` |
| `_logPipelineStart` | `_logPipelineStart(): void` |
| `_logPipelineStep` | `_logPipelineStep(): void` |
| `_fallbackDetailText` | `_fallbackDetailText(): void` |
| `_logPipelineSummary` | `_logPipelineSummary(): void` |
| `getName` | `getName(): string` |
| `logger` | `logger: Object` |
| `getSteps` | `getSteps(): Step[]` |
| `addStep` | `addStep(step: Step): Pipeline` |
| `beforeStep` | `beforeStep(callback: Function): Pipeline` |
| `afterStep` | `afterStep(callback: Function): Pipeline` |
| `onError` | `onError(callback: Function): Pipeline` |
| `onComplete` | `onComplete(callback: Function): Pipeline` |
| `_invokeHooks` | `_invokeHooks(): void` |
| `_executeStep` | `_executeStep(step: Step): {success: boolean, skipped: boolean, durationMs: number, error?: Error` |
| `execute` | `execute(initialData={}: Object): PipelineContext` |
| `clearSteps` | `clearSteps(): Pipeline` |


### PipelineContext

**Source:** `PipelineFramework/src/PipelineContext.ts`

Shared state container and telemetry tracker for pipeline executions.

**Initialization:**
```javascript
new PipelineContext()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getData` | `getData(): Object` |
| `get` | `get(key: string, defaultValue=null: *): *` |
| `set` | `set(key: string, value: *): PipelineContext` |
| `has` | `has(key: string): boolean` |
| `requestStop` | `requestStop(reason='': string): PipelineContext` |
| `shouldStop` | `shouldStop(): boolean` |
| `getStopReason` | `getStopReason(): string|null` |
| `recordStepExecution` | `recordStepExecution(stepName: string, status: string, durationMs: number, details={}: Object): PipelineContext` |
| `getExecutionHistory` | `getExecutionHistory(): Array<Object>` |
| `getMetadata` | `getMetadata(): Object` |
| `markCompleted` | `markCompleted(): PipelineContext` |
| `getTotalDuration` | `getTotalDuration(): number` |
| `getSummary` | `getSummary(): {startTime: number, endTime: number, totalDuration: number, totalSteps: number, completedSteps: number, skippedSteps: number, failedSteps: number, stopRequested: boolean, stopReason: string|null, history: Array` |


### Step

**Source:** `PipelineFramework/src/Step.ts`

**Initialization:**
```javascript
new Step()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getName` | `getName(): string` |
| `logger` | `logger: LoggerService` |
| `shouldExecute` | `shouldExecute(context: PipelineContext): boolean` |
| `verifyContext` | `verifyContext(context: PipelineContext, requiredKeys: string[]): void` |
| `setResult` | `setResult(context: PipelineContext, key: string, value: *): Step` |
| `getContextValue` | `getContextValue(context: PipelineContext, key: string, defaultValue=null: *): *` |
| `_executeLogic` | `_executeLogic(context: PipelineContext): void` |
| `_getLogDetails` | `_getLogDetails(_context: PipelineContext): *|null` |
| `execute` | `execute(context: PipelineContext): StepExecutionResult` |


### ContextValidationError

**Source:** `PipelineFramework/src/internal/errors/ContextValidationError.ts`

Error signaling a failure in context key validation before step execution.

**Initialization:**
```javascript
new ContextValidationError()
```


### PipelineError

**Source:** `PipelineFramework/src/internal/errors/PipelineError.ts`

**Initialization:**
```javascript
new PipelineError(message: string, context={}: Object, context.pipelineName: string, context.currentStep: string, context.stepIndex: number, context.originalError: Error)
```


### StepExecutionError

**Source:** `PipelineFramework/src/internal/errors/StepExecutionError.ts`

Error signaling a failure within a step's execution logic.

**Initialization:**
```javascript
new StepExecutionError()
```


### StepMock

**Source:** `PipelineFramework/src/testing/mocks.ts`

Jest-based high-fidelity mock for Pipeline Step implementation.

**Initialization:**
```javascript
new StepMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setupExecution` | `setupExecution(): void` |


### PipelineContextMock

**Source:** `PipelineFramework/src/testing/mocks.ts`

Jest-based high-fidelity mock for PipelineContext.

**Initialization:**
```javascript
new PipelineContextMock()
```


---

## ContextEngine

**Version:** 1.0.0   **Layer:** Application Orchestration (Layer 3)   **Dependencies:** CoreUtilsLib, GasExpressionEngineLib (Optional), GasResilienceLib (Optional)

### ContextAssembler

**Source:** `ContextEngine/src/ContextAssembler.ts`

Orchestrator facade for assembling complex data contexts from declarative JSON recipes.
Coordinates validation, dependency resolution, conditional execution, provider invocation, and post-processing.

**Initialization:**
```javascript
new ContextAssembler()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `providerRegistry` | `providerRegistry: unknown` |


### DataProvider

**Source:** `ContextEngine/src/DataProvider.ts`

Abstract base class for data providers, providing standardized interfaces for fetching, caching, and performance tracking.

**Initialization:**
```javascript
new DataProvider()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `_fetchData` | `_fetchData(parameters: Object): *` |
| `_generateCacheKey` | `_generateCacheKey(parameters: Object): string` |
| `_getFromCache` | `_getFromCache(cacheKey: string): *|null` |
| `_storeInCache` | `_storeInCache(cacheKey: string, data: *): void` |
| `clearCache` | `clearCache(): DataProvider` |
| `provide` | `provide(providerName: string, parameters: Object): *` |
| `_validateParameters` | `_validateParameters(parameters: Object): void` |


### PostProcessor

**Source:** `ContextEngine/src/PostProcessor.ts`

Registry and execution engine for sequential provider data transformation pipelines.

**Initialization:**
```javascript
new PostProcessor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `_registerBuiltInProcessors` | `_registerBuiltInProcessors(): void` |
| `register` | `register(type: string, processorFunc: Function): PostProcessor` |
| `has` | `has(type: string): boolean` |
| `process` | `process(processorConfigs: Object[], data: *, providerName='': string): *` |
| `getRegisteredTypes` | `getRegisteredTypes(): string[]` |


### ProviderRegistry

**Source:** `ContextEngine/src/ProviderRegistry.ts`

Registry for managing data provider lifecycles, supporting Singleton (stateless) and Factory (stateful) instantiation strategies.

**Initialization:**
```javascript
new ProviderRegistry()
```


### CollectionProjectionInterceptor

**Source:** `ContextEngine/src/interceptors/CollectionProjectionInterceptor.ts`

Applies a CollectionProjector to configured collection paths after selected providers.

**Initialization:**
```javascript
new CollectionProjectionInterceptor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_shouldIntercept` | `_shouldIntercept(): void` |
| `_performIntercept` | `_performIntercept(): void` |
| `_readTarget` | `_readTarget(): void` |
| `_writeTarget` | `_writeTarget(): void` |


### ContextInterceptor

**Source:** `ContextEngine/src/interceptors/ContextInterceptor.ts`

Abstract base class for context middleware/interceptor patterns.
Enables transparent transformation, enrichment, or substitution of provider results before UDC integration.

**Initialization:**
```javascript
new ContextInterceptor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `_shouldIntercept` | `_shouldIntercept(name: string, data: *, context: Object, options: Object): boolean` |
| `_performIntercept` | `_performIntercept(name: string, data: *, context: Object, options: Object): *` |
| `intercept` | `intercept(name: string, data: *, context: Object, options={}: Object): *` |
| `_forEachAt` | `_forEachAt(data: Object, path: string, itemFn: Function): void` |


### InterceptorRegistry

**Source:** `ContextEngine/src/interceptors/InterceptorRegistry.ts`

Registry for managing context interceptor lifecycles, supporting both Singleton (stateless) and Factory (stateful) instantiation strategies.

**Initialization:**
```javascript
new InterceptorRegistry()
```


### ContextDependencyAnalyzer

**Source:** `ContextEngine/src/internal/ContextDependencyAnalyzer.ts`

**Initialization:**
```javascript
new ContextDependencyAnalyzer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `validateRecipe` | `validateRecipe(): void` |
| `analyzeRecipeDependencies` | `analyzeRecipeDependencies(): void` |
| `getConfigSummary` | `getConfigSummary(): void` |


### ContextStepExecutor

**Source:** `ContextEngine/src/internal/ContextStepExecutor.ts`

**Initialization:**
```javascript
new ContextStepExecutor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_evaluateCondition` | `_evaluateCondition(): void` |
| `_executeProvider` | `_executeProvider(): void` |
| `assemble` | `assemble(): void` |
| `_executeMutatingProvider` | `_executeMutatingProvider(providerConfig: Object, sharedTarget: Object, initialParams: Object, options={}: Object): void` |
| `_logAssemblySummary` | `_logAssemblySummary(): void` |
| `assembleInto` | `assembleInto(sharedTarget: Object, recipe: Object, initialParams={}: Object, options={}: Object): Object` |


### DependencyResolver

**Source:** `ContextEngine/src/internal/DependencyResolver.ts`

Dependency resolution engine for @param (initial) and $provider (runtime) references in recipes.
Supports dot-notation for nested properties and bracket-notation for array indices.

**Initialization:**
```javascript
new DependencyResolver()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `PARAM_PATTERN` | `PARAM_PATTERN: unknown` |
| `PROVIDER_PATTERN` | `PROVIDER_PATTERN: unknown` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `isDependency` | `isDependency(value: *): boolean` |
| `_getNestedProperty` | `_getNestedProperty(obj: Object|Array, path: string): *` |
| `resolve` | `resolve(dependency: string, initialParams: Object, providerResults: Object, providerName='': string): *` |
| `resolveAll` | `resolveAll(parameters: Object|Array, initialParams: Object, providerResults: Object, providerName='': string): Object|Array` |
| `analyzeDependencies` | `analyzeDependencies(parameters: Object|Array): Object` |


### RecipeParser

**Source:** `ContextEngine/src/internal/RecipeParser.ts`

Engine for structural validation, type checking, and normalization of JSON recipes.

**Initialization:**
```javascript
new RecipeParser()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `_validateProvider` | `_validateProvider(provider: Object, index: number): string[]` |
| `parse` | `parse(recipe: Object, recipe.providers: Object[]): Object` |
| `validate` | `validate(recipe: Object): {isValid: boolean, errors: string[]` |


### TypedRegistry

**Source:** `ContextEngine/src/internal/TypedRegistry.ts`

**Initialization:**
```javascript
new TypedRegistry(logger: Object, config: Object, config.requiredMethod: string, config.noun: string, config.article='a': string, config.notFoundError: (type: string, registeredTypes: string[]) => Error)
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `logger` | `logger: unknown` |
| `registerSingleton` | `registerSingleton(type: string, instance: Object): TypedRegistry` |
| `registerFactory` | `registerFactory(type: string, factory: Function): TypedRegistry` |
| `get` | `get(type: string): Object` |
| `getAll` | `getAll(): Object[]` |
| `getRegisteredTypes` | `getRegisteredTypes(): string[]` |


### CollectionProjectionError

**Source:** `ContextEngine/src/internal/errors/CollectionProjectionError.ts`

Signals invalid declarative collection-projection configuration or execution.

**Initialization:**
```javascript
new CollectionProjectionError()
```


### ContextEngineError

**Source:** `ContextEngine/src/internal/errors/ContextEngineError.ts`

Foundation error class for the ContextEngine hierarchy, providing structured metadata and error chaining.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

**Initialization:**
```javascript
new ContextEngineError()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `toString` | `toString(): string` |


### DependencyResolutionError

**Source:** `ContextEngine/src/internal/errors/DependencyResolutionError.ts`

Error indicating failure to resolve @param or $provider references due to missing data, incorrect paths, or invalid execution order.

**Initialization:**
```javascript
new DependencyResolutionError()
```


### ProviderExecutionError

**Source:** `ContextEngine/src/internal/errors/ProviderExecutionError.ts`

Wraps original exceptions caught during provider data retrieval. Provides technical context
for debugging and retry classification by GasResilienceLib, distinguishing between
transient (e.g., timeouts, 429) and permanent (e.g., 401, 403, 404) failures.

**Initialization:**
```javascript
new ProviderExecutionError()
```


### ProviderNotFoundError

**Source:** `ContextEngine/src/internal/errors/ProviderNotFoundError.ts`

Thrown during ContextAssembler.assemble() or ProviderRegistry.get() when a recipe
references an unregistered provider. Includes technical context for typo detection
(registeredProviders) and dependency mapping (recipeName, currentProvider).

**Initialization:**
```javascript
new ProviderNotFoundError()
```


### RecipeValidationError

**Source:** `ContextEngine/src/internal/errors/RecipeValidationError.ts`

Thrown by RecipeParser.validate() or parse() during pre-execution checks. Aggregates
multiple validation failures (missing fields, duplicate names, invalid types) into
the validationErrors property to enable comprehensive error reporting.

**Initialization:**
```javascript
new RecipeValidationError()
```


### CollectionProjector

**Source:** `ContextEngine/src/projection/CollectionProjector.ts`

Runs declarative, synchronous projections without mutating the source collection.

**Initialization:**
```javascript
new CollectionProjector()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `project` | `project(): void` |
| `_apply` | `_apply(): void` |
| `_filter` | `_filter(): void` |
| `_map` | `_map(): void` |
| `_flatMap` | `_flatMap(): void` |
| `_groupBy` | `_groupBy(): void` |
| `_aggregate` | `_aggregate(): void` |
| `_distinctBy` | `_distinctBy(): void` |
| `_sortBy` | `_sortBy(): void` |
| `_insert` | `_insert(): void` |
| `_strategy` | `_strategy(): void` |
| `_runStrategy` | `_runStrategy(): void` |
| `_evaluate` | `_evaluate(): void` |
| `_itemRuntime` | `_itemRuntime(): void` |
| `_keys` | `_keys(): void` |
| `_read` | `_read(): void` |
| `_error` | `_error(): void` |


### ProjectionRegistry

**Source:** `ContextEngine/src/projection/ProjectionRegistry.ts`

Registry for application-supplied, synchronous collection projection strategies.

**Initialization:**
```javascript
new ProjectionRegistry()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(): void` |
| `get` | `get(): void` |
| `has` | `has(): void` |


### DataProviderMock

**Source:** `ContextEngine/src/testing/mocks.ts`

High-fidelity mock for DataProvider implementation in unit tests.
Simulates provider lifecycle, data retrieval, and parameter validation.

**Initialization:**
```javascript
new DataProviderMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setupData` | `setupData(data: *): DataProviderMock` |


### InterceptorMock

**Source:** `ContextEngine/src/testing/mocks.ts`

High-fidelity mock for ContextInterceptor implementation.
Simulates context transformation and conditional filtering logic.

**Initialization:**
```javascript
new InterceptorMock()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `setupIntercept` | `setupIntercept(interceptFn: Function): InterceptorMock` |


### ProviderRegistryMock

**Source:** `ContextEngine/src/testing/mocks.ts`

In-memory registry mock for provider lifecycle and dependency resolution testing.

**Initialization:**
```javascript
new ProviderRegistryMock()
```


---

## GasDataImporter

@fileoverview GasDataImporter - Recipe-Based ETL Engine for Google Apps Script. See README.md for the full module manual.

### ImportCheckpoint

**Source:** `GasDataImporter/src/ImportCheckpoint.ts`

Plain, JSON-serializable checkpoint describing progress through a single
recipe's ETL pipeline (EXTRACT -> LOAD -> DONE, transform runs inline
during EXTRACT on each bounded chunk). Designed to
be persisted via `PropertiesService`/`JobRunnerLib` between GAS execution
windows and resumed with `ImportEngine.runImportChunk`.

**Initialization:**
```javascript
new ImportCheckpoint()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `initial` | `initial(recipeName: string): ImportCheckpoint` |
| `fromJSON` | `fromJSON(obj: Object): ImportCheckpoint` |
| `assertMatches` | `assertMatches(checkpoint: ImportCheckpoint, recipeName: string): void` |


### ImportConfiguration

**Source:** `GasDataImporter/src/ImportConfiguration.ts`

Validator and value object for ETL import recipes, ensuring structural integrity and providing normalized access to source, transform, and load configurations.

**Initialization:**
```javascript
new ImportConfiguration()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `registerSourceType` | `registerSourceType(type: string): void` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validate` | `_validate(recipe: Object): void` |
| `_validateSource` | `_validateSource(source: Object): void` |
| `_validateTransform` | `_validateTransform(transform: Object): void` |
| `_validateLoad` | `_validateLoad(load: Object): void` |
| `getName` | `getName(): string` |
| `getSource` | `getSource(): Object` |
| `getTransform` | `getTransform(): Object` |
| `getLoad` | `getLoad(): Object` |
| `getRecipe` | `getRecipe(): Object` |
| `getSummary` | `getSummary(): Object` |


### ImportEngine

**Source:** `GasDataImporter/src/ImportEngine.ts`

Primary facade for the ETL pipeline, orchestrating extraction, transformation, and database persistence with built-in resilience and dry-run support.

**Initialization:**
```javascript
new ImportEngine()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `registerCustomSource` | `registerCustomSource(name: string, strategyClass: Function): void` |
| `getAvailableSourceTypes` | `getAvailableSourceTypes(): Array<string>` |
| `getConfigSummary` | `getConfigSummary(): Object` |
| `validateRecipe` | `validateRecipe(recipe: Object): {valid: boolean, summary: Object, message: string` |


### ConfigurationError

**Source:** `GasDataImporter/src/internal/errors/ConfigurationError.ts`

Exception class for ETL recipe validation failures, capturing structural violations, missing mandatory fields, or invalid strategy identifiers.

**Initialization:**
```javascript
new ConfigurationError()
```


### ImportError

**Source:** `GasDataImporter/src/internal/errors/ImportError.ts`

Foundational error class for the ETL pipeline, providing structured diagnostic state including classification codes, contextual metadata, and occurrence timestamps.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

**Initialization:**
```javascript
new ImportError()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `toJSON` | `toJSON(): Object` |
| `toString` | `toString(): string` |


### LoadError

**Source:** `GasDataImporter/src/internal/errors/LoadError.ts`

Exception class for failures during the persistence phase, capturing table access errors, conflict resolution violations, and database-level exceptions.

**Initialization:**
```javascript
new LoadError()
```


### SourceError

**Source:** `GasDataImporter/src/internal/errors/SourceError.ts`

Exception class for failures during the extraction phase, capturing file resolution errors, permission denials, and malformed source configurations.

**Initialization:**
```javascript
new SourceError()
```


### TransformError

**Source:** `GasDataImporter/src/internal/errors/TransformError.ts`

Exception class for failures during the data transformation phase, capturing mapping errors, normalization failures, and expression evaluation exceptions.

**Initialization:**
```javascript
new TransformError()
```


### FolderStrategy

**Source:** `GasDataImporter/src/internal/extract-strategies/FolderStrategy.ts`

Extraction strategy for bulk-processing all Google Sheets within a target Drive folder, supporting regex filtering and metadata tracking.

**Initialization:**
```javascript
new FolderStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_extractData` | `_extractData(config: Object, config.folderId: string, config.fileNamePattern: string, config.mergeData=true: boolean): Array<Object>|Array<{fileName:string, fileId:string, data:Object[]` |
| `_extractFromFile` | `_extractFromFile(fileId: string, fileName: string, range: string, tabName: string, hasHeaders: boolean, includeSourceFile: boolean): Array<Object>` |


### SheetByIdStrategy

**Source:** `GasDataImporter/src/internal/extract-strategies/SheetByIdStrategy.ts`

Extraction strategy for retrieving data from a specific Google Sheets document using its ID, supporting targeted tab and range selection.

**Initialization:**
```javascript
new SheetByIdStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_extractData` | `_extractData(config: Object, config.sheetId: string, config.tabName: string, config.range='': string, config.hasHeaders=true: boolean): Array<Object>` |
| `extractRaw` | `extractRaw(config: Object): Array<Array<*>>` |
| `supportsCursor` | `supportsCursor(): boolean` |
| `extractChunk` | `extractChunk(config: Object, cursor: Object, cursor.rowOffset: number, cursor.headers: Array<string>|null, maxRows: number): {rows: Array<Object>, nextCursor: Object, exhausted: boolean` |
| `_parseRangeBounds` | `_parseRangeBounds(range: string): {startCol: number, startRow: number, endCol: number, endRow: number` |
| `_letterToColumn` | `_letterToColumn(letters: string): number` |
| `_resolveValues` | `_resolveValues(config: Object): Array<Array<*>>` |


### SourceStrategy

**Source:** `GasDataImporter/src/internal/extract-strategies/SourceStrategy.ts`

Abstract base class defining the contract for data extraction strategies, providing common lifecycle hooks and data normalization utilities.

**Initialization:**
```javascript
new SourceStrategy()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `extract` | `extract(config: Object): Array<Object>` |
| `_extractData` | `_extractData(config: Object): Array<Object>` |
| `supportsCursor` | `supportsCursor(): boolean` |
| `extractChunk` | `extractChunk(_config: Object, _cursor: *, _maxRows: number): {rows: Array<Object>, nextCursor: *, exhausted: boolean` |
| `_arrayToObjects` | `_arrayToObjects(data: Array<Array>, hasHeaders=true: boolean): Array<Object>` |
| `_coerceValue` | `_coerceValue(value: *): *` |
| `_columnToLetter` | `_columnToLetter(column: number): string` |
| `_validateConfig` | `_validateConfig(config: Object, requiredFields: string[]): void` |


### SourceStrategyFactory

**Source:** `GasDataImporter/src/internal/extract-strategies/SourceStrategyFactory.ts`

Factory and registry for data extraction strategies, managing built-in Google services and runtime registration of custom source adapters.

**Initialization:**
```javascript
new SourceStrategyFactory()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_registerBuiltInStrategies` | `_registerBuiltInStrategies(): void` |
| `registerStrategy` | `registerStrategy(name: string, strategyClass: Function): void` |
| `createStrategy` | `createStrategy(type: string, dependencies={}: Object): Object` |
| `hasStrategy` | `hasStrategy(type: string): boolean` |
| `getAvailableStrategies` | `getAvailableStrategies(): Array<string>` |


### Loader

**Source:** `GasDataImporter/src/internal/load/Loader.ts`

Persistence engine for the ETL pipeline, managing data insertion and updates with configurable conflict resolution strategies and performance optimizations.

**Initialization:**
```javascript
new Loader()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `load` | `load(data: Array<Object>, loadConfig: Object, loadConfig.targetTable: string, loadConfig.conflictResolution: string, loadConfig.conflictKey: string, loadConfig.updateIfNewer: Object): Object` |
| `loadChunk` | `loadChunk(data: Array<Object>, loadConfig: Object, state: Object, state.isFirstChunk: boolean): Object` |
| `_executeStrategy` | `_executeStrategy(table: Object, data: Array<Object>, strategy: string, conflictKey: string, updateIfNewer: Object, overwriteHandler: Function): Object` |
| `_insertOnly` | `_insertOnly(table: Object, data: Array<Object>, conflictKey: string): Object` |
| `_updateOnly` | `_updateOnly(table: Object, data: Array<Object>, conflictKey: string, updateIfNewer: Object): Object` |
| `_upsert` | `_upsert(table: Object, data: Array<Object>, conflictKey: string, updateIfNewer: Object): Object` |
| `_overwrite` | `_overwrite(table: Object, data: Array<Object>, conflictKey: string): Object` |
| `_appendAll` | `_appendAll(table: Object, data: Array<Object>): Object` |
| `_shouldUpdate` | `_shouldUpdate(existing: Object, incoming: Object, timestampColumn: string): boolean` |
| `_validateLoadConfig` | `_validateLoadConfig(config: Object): void` |


### ImportPipelineExecutor

**Source:** `GasDataImporter/src/pipeline/ImportPipelineExecutor.ts`

**Initialization:**
```javascript
new ImportPipelineExecutor()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `startImport` | `startImport(recipe: Object, _options={}: Object): ImportCheckpoint` |
| `runImportChunk` | `runImportChunk(recipe: Object, checkpoint: ImportCheckpoint, budget={}: Object, budget.maxRows=500: number): {checkpoint: ImportCheckpoint, done: boolean` |
| `runImport` | `runImport(): void` |
| `_executePipeline` | `_executePipeline(): void` |
| `_executeExtract` | `_executeExtract(): void` |
| `_executeTransform` | `_executeTransform(): void` |
| `_executeLoad` | `_executeLoad(): void` |
| `_generateDryRunLoadResult` | `_generateDryRunLoadResult(): void` |


### Transformer

**Source:** `GasDataImporter/src/pipeline/Transformer.ts`

Orchestrator for the data transformation phase, managing column mapping, calculated field evaluation, data normalization, and record validation.

**Initialization:**
```javascript
new Transformer()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `transform` | `transform(sourceData: Array<Object>, transformConfig: Object): Array<Object>` |
| `_transformRow` | `_transformRow(sourceRow: Object, rowIndex: number, mapping: Object, calculated: Object, normalization: Object, validation: Object): Object|null` |
| `_applyMapping` | `_applyMapping(sourceRow: Object, mapping: Object): Object` |
| `_applyCalculated` | `_applyCalculated(row: Object, calculated: Object): Object` |
| `_buildDependencyGraph` | `_buildDependencyGraph(): void` |
| `_extractPlaceholders` | `_extractPlaceholders(): void` |
| `_topologicalSort` | `_topologicalSort(): void` |
| `_evaluateExpression` | `_evaluateExpression(): void` |
| `_simpleTemplateSubstitution` | `_simpleTemplateSubstitution(): void` |
| `_formatDate` | `_formatDate(value: *, format: string): string|*` |
| `_applyNormalization` | `_applyNormalization(row: Object, normalization: Object): Object` |
| `_applyValidation` | `_applyValidation(row: Object, validation: string|Array<string>, rowIndex: number): boolean` |


---

## DomainRepositoryLib

DomainRepositoryLib - Domain-Driven Design patterns for Google Apps Script

### Entity

**Source:** `DomainRepositoryLib/src/Entity.ts`

Abstract base class for domain entities providing identity management, lifecycle tracking, and validation.

**Initialization:**
```javascript
new Entity()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `fromData` | `fromData(data: Object): Entity` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `id` | `id: unknown` |
| `createdAt` | `createdAt: Date` |
| `updatedAt` | `updatedAt: Date` |
| `_parseDate` | `_parseDate(value: Date|string|number): Date|null` |
| `markDirty` | `markDirty(fieldName: string): void` |
| `isDirty` | `isDirty(fieldName: string): boolean` |
| `getDirtyFields` | `getDirtyFields(): string[]` |
| `hasDirtyFields` | `hasDirtyFields(): boolean` |
| `clearDirtyFields` | `clearDirtyFields(): void` |
| `getChanges` | `getChanges(): Object` |
| `storeOriginalData` | `storeOriginalData(data: Object): void` |
| `getOriginalValue` | `getOriginalValue(fieldName: string): *` |
| `captureDynamicColumns` | `captureDynamicColumns(data: Object): void` |
| `getDynamicColumns` | `getDynamicColumns(): Object` |
| `setDynamicColumn` | `setDynamicColumn(column: string, value: *): void` |
| `validate` | `validate(): boolean` |
| `isValid` | `isValid(): boolean` |
| `getValidationErrors` | `getValidationErrors(): Array<Object>` |
| `addValidationError` | `addValidationError(field: string, message: string): void` |
| `validateOrThrow` | `validateOrThrow(): void` |
| `equals` | `equals(other: Entity): boolean` |
| `toData` | `toData(): Object` |
| `toString` | `toString(): string` |


### Repository

**Source:** `DomainRepositoryLib/src/Repository.ts`

Abstract base class for domain repositories, coordinating CRUD operations, specification-based querying, and entity mapping.

**Initialization:**
```javascript
new Repository()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_isDryRun` | `_isDryRun(options={}: Object): boolean` |
| `_getTable` | `_getTable(): Object` |
| `_executeWithRetry` | `_executeWithRetry(operation: Function, maxRetries=3: number): *` |
| `_withKey` | `_withKey(rows: Array<Object>): Array<Object>` |
| `find` | `find(specification: Object): Array<Object>` |
| `findOne` | `findOne(specification: Object): Object|null` |
| `findById` | `findById(id: string): Object|null` |
| `findByIdOrFail` | `findByIdOrFail(id: string): Object` |
| `findAll` | `findAll(): Array<Object>` |
| `exists` | `exists(specification: Object): boolean` |
| `count` | `count(specification: Object): number` |
| `save` | `save(entity: Object, options={}: Object): Object` |
| `saveMany` | `saveMany(entities: Array<Object>): Array<Object>` |
| `patch` | `patch(entity: Object, changes: Object): Object` |
| `patchById` | `patchById(id: string, changes: Object): Object` |
| `delete` | `delete(entity: Object): void` |
| `deleteById` | `deleteById(id: string): void` |
| `deleteMany` | `deleteMany(entities: Array<Object>): void` |
| `refresh` | `refresh(entity: Object): Object` |
| `_clearCache` | `_clearCache(): void` |
| `getTable` | `getTable(): Object` |
| `getEntityClass` | `getEntityClass(): Function` |
| `getTableName` | `getTableName(): string` |


### ValueObject

**Source:** `DomainRepositoryLib/src/ValueObject.ts`

Abstract base class for domain value objects, enforcing immutability and value-based equality.

**Initialization:**
```javascript
new ValueObject()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_freeze` | `_freeze(): void` |
| `equals` | `equals(other: ValueObject): boolean` |
| `_deepEquals` | `_deepEquals(a: *, b: *): boolean` |
| `toString` | `toString(): string` |
| `getValue` | `getValue(): *` |


### DomainException

**Source:** `DomainRepositoryLib/src/internal/errors/DomainException.ts`

Foundational exception class for domain-layer errors, providing contextual metadata and serialization support.
Extends the shared {@link BaseError} to inherit standardized stack-trace capture and timestamping.

Note: this class uses `context` as a short architectural label (a string) rather than the
structured-metadata object used by {@link BaseError}; it is reassigned explicitly below to
preserve that public contract.

**Initialization:**
```javascript
new DomainException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getDetails` | `getDetails(): Object` |
| `toObject` | `toObject(): {name:string, message:string, context:string, details:Object, stack:string` |


### EntityNotFoundException

**Source:** `DomainRepositoryLib/src/internal/errors/EntityNotFoundException.ts`

Exception class for failed entity resolution by identifier or search specification.

**Initialization:**
```javascript
new EntityNotFoundException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getEntityType` | `getEntityType(): string` |
| `getCriteria` | `getCriteria(): string|Object` |


### InvariantViolationException

**Source:** `DomainRepositoryLib/src/internal/errors/InvariantViolationException.ts`

Exception class for business rule violations that compromise aggregate integrity.

**Initialization:**
```javascript
new InvariantViolationException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getAggregateType` | `getAggregateType(): string` |
| `getViolations` | `getViolations(): string[]` |
| `hasViolations` | `hasViolations(): boolean` |


### SpecificationException

**Source:** `DomainRepositoryLib/src/internal/errors/SpecificationException.ts`

Exception class for failures during specification evaluation or translation to persistent queries.

**Initialization:**
```javascript
new SpecificationException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getSpecificationType` | `getSpecificationType(): string|undefined` |


### DynamicFieldMapping

**Source:** `DomainRepositoryLib/src/internal/mapping/DynamicFieldMapping.ts`

Configuration for schema-driven dynamic field mapping, aggregating multiple database columns into entity Map properties.

**Initialization:**
```javascript
new DynamicFieldMapping()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validate` | `_validate(): void` |
| `hydrate` | `hydrate(row: Object): Map<string, *>` |
| `dehydrate` | `dehydrate(mapValue: Map<string, *>): Object.<string, *>` |
| `getColumnNames` | `getColumnNames(): string[]` |


### EntityMapper

**Source:** `DomainRepositoryLib/src/internal/mapping/EntityMapper.ts`

Bidirectional transformer between domain Entity instances and persistent data structures, managing complex mapping strategies.

**Initialization:**
```javascript
new EntityMapper()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `registerTransformer` | `registerTransformer(fieldName: string, toData: Function, fromData: Function): void` |
| `configureDynamicField` | `configureDynamicField(config: Object): this` |
| `configureJsonExpansion` | `configureJsonExpansion(config: Object): this` |
| `toData` | `toData(entity: Object): Object|null` |
| `_serializeEntityFields` | `_serializeEntityFields(entity: Object): Object` |
| `_applyDynamicColumnPassthrough` | `_applyDynamicColumnPassthrough(data: Object, entity: Object): void` |
| `_serializeValue` | `_serializeValue(value: *): *` |
| `fromData` | `fromData(data: Object, EntityClass: Function): Object|null` |
| `fromDataArray` | `fromDataArray(dataArray: Object[], EntityClass: Function): Object[]` |
| `toDataArray` | `toDataArray(entities: Object[]): Object[]` |
| `cloneData` | `cloneData(data: Object): Object` |
| `_applyJsonExpansionHydration` | `_applyJsonExpansionHydration(data: Object): void` |
| `_applyJsonExpansionDehydration` | `_applyJsonExpansionDehydration(data: Object): void` |
| `_applyDynamicFieldHydration` | `_applyDynamicFieldHydration(data: Object): void` |
| `_applyDynamicFieldDehydration` | `_applyDynamicFieldDehydration(data: Object, entity: Object): void` |


### HydrationService

**Source:** `DomainRepositoryLib/src/internal/mapping/HydrationService.ts`

Orchestrator for transforming persistence data records into domain Entity instances and vice versa.

**Initialization:**
```javascript
new HydrationService()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `hydrate` | `hydrate(data: Object, EntityClass: Function): Object` |
| `hydrateMany` | `hydrateMany(dataArray: Array<Object>, EntityClass: Function): Array<Object>` |
| `dehydrate` | `dehydrate(entity: Object): Object` |
| `dehydrateMany` | `dehydrateMany(entities: Array<Object>): Array<Object>` |
| `storeOriginalData` | `storeOriginalData(entity: Object, data: Object): void` |
| `clearDirtyFields` | `clearDirtyFields(entity: Object): void` |
| `refresh` | `refresh(entity: Object, data: Object): void` |


### JsonExpansionMapping

**Source:** `DomainRepositoryLib/src/internal/mapping/JsonExpansionMapping.ts`

Configuration for JSON-expanded property mapping.
Enables expanding a single JSON column into multiple first-class entity properties.

**Initialization:**
```javascript
new JsonExpansionMapping()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validate` | `_validate(): void` |
| `hydrate` | `hydrate(row: Object): Object` |
| `dehydrate` | `dehydrate(entityData: Object): Object` |
| `getColumnName` | `getColumnName(): string` |
| `getProperties` | `getProperties(): Array<string>` |
| `managesProperty` | `managesProperty(propertyName: string): boolean` |


### MappingConfiguration

**Source:** `DomainRepositoryLib/src/internal/mapping/MappingConfiguration.ts`

Registry for entity mapping strategies, coordinating dynamic field aggregations and JSON property expansions.

**Initialization:**
```javascript
new MappingConfiguration()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addDynamicFieldMapping` | `addDynamicFieldMapping(config: Object|DynamicFieldMapping): this` |
| `addJsonExpansionMapping` | `addJsonExpansionMapping(config: Object|JsonExpansionMapping): this` |
| `getDynamicFieldMapping` | `getDynamicFieldMapping(propertyName: string): Object|null` |
| `getJsonExpansionMapping` | `getJsonExpansionMapping(columnName: string): Object|null` |
| `getAllDynamicFieldMappings` | `getAllDynamicFieldMappings(): Array<Object>` |
| `getAllJsonExpansionMappings` | `getAllJsonExpansionMappings(): Array<Object>` |
| `hasDynamicFieldMappings` | `hasDynamicFieldMappings(): boolean` |
| `hasJsonExpansionMappings` | `hasJsonExpansionMappings(): boolean` |
| `clear` | `clear(): void` |
| `findJsonExpansionMappingForProperty` | `findJsonExpansionMappingForProperty(propertyName: string): Object|null` |


### QueryTranslator

**Source:** `DomainRepositoryLib/src/internal/query/QueryTranslator.ts`

Bridge for converting domain Specifications into SheetDBLib AdvancedQueryBuilder instructions.

**Initialization:**
```javascript
new QueryTranslator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `translate` | `translate(specification: Object, queryBuilder: Object): Object` |
| `_queryObjectCriteria` | `_queryObjectCriteria(specification: Object): Record<string, unknown>|null` |
| `_applyQueryObject` | `_applyQueryObject(criteria: Record<string, unknown>, queryBuilder: Object): Object` |
| `validate` | `validate(specification: Object): {valid:boolean, reason:string|null, queryObjectCriteria:Record<string, unknown>|null` |
| `tryTranslate` | `tryTranslate(specification: Object, queryBuilder: Object): {success:boolean, queryBuilder:Object|null, error:string|null` |


### CompositeSpecification

**Source:** `DomainRepositoryLib/src/specifications/CompositeSpecification.ts`

Logic-based specification container combining multiple child specifications using AND, OR, or NOT operators.

**Initialization:**
```javascript
new CompositeSpecification()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validateOperator` | `_validateOperator(): void` |
| `_validateSpecifications` | `_validateSpecifications(): void` |
| `isSatisfiedBy` | `isSatisfiedBy(entity: Object): boolean` |
| `toQuery` | `toQuery(queryBuilder: Object): Object` |
| `canBeTranslatedToQuery` | `canBeTranslatedToQuery(): boolean` |
| `toString` | `toString(): string` |


### EqualityFieldSpec

**Source:** `DomainRepositoryLib/src/specifications/EqualityFieldSpec.ts`

Specification di uguaglianza in cui isSatisfiedBy e toQueryObject sono
coerenti per costruzione: il valore letto dall'entità e quello confrontato
nella query sono lo stesso.

**Initialization:**
```javascript
new EqualityFieldSpec()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSatisfiedBy` | `isSatisfiedBy(): void` |
| `toQueryObject` | `toQueryObject(): void` |
| `toString` | `toString(): void` |


### FieldSpecification

**Source:** `DomainRepositoryLib/src/specifications/FieldSpecification.ts`

Atomic specification for comparing entity field values against specific criteria using common relational operators.

**Initialization:**
```javascript
new FieldSpecification()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_validateOperator` | `_validateOperator(): void` |
| `_getFieldValue` | `_getFieldValue(entity: Object): *` |
| `isSatisfiedBy` | `isSatisfiedBy(entity: Object): boolean` |
| `toQueryObject` | `toQueryObject(): Record<string, unknown>|null` |
| `toQuery` | `toQuery(queryBuilder: Object): Object` |
| `toString` | `toString(): string` |


### FunctionSpecification

**Source:** `DomainRepositoryLib/src/specifications/FunctionSpecification.ts`

Specification implementation using arbitrary JavaScript predicates for in-memory entity evaluation.

**Initialization:**
```javascript
new FunctionSpecification()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSatisfiedBy` | `isSatisfiedBy(entity: Object): boolean` |
| `toQuery` | `toQuery(): void` |
| `canBeTranslatedToQuery` | `canBeTranslatedToQuery(): false` |
| `toString` | `toString(): string` |


### Specification

**Source:** `DomainRepositoryLib/src/specifications/Specification.ts`

Abstract base class for the Specification pattern, enabling encapsulated business rules with in-memory evaluation and database query translation.

**Initialization:**
```javascript
new Specification()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `isSatisfiedBy` | `isSatisfiedBy(entity: Object): boolean` |
| `and` | `and(other: Specification): Specification` |
| `or` | `or(other: Specification): Specification` |
| `not` | `not(): Specification` |
| `toQuery` | `toQuery(queryBuilder: Object): Object` |
| `toQueryObject` | `toQueryObject(): Record<string, unknown>|null` |
| `canBeTranslatedToQuery` | `canBeTranslatedToQuery(): boolean` |
| `toString` | `toString(): string` |


---

## GasOnlineTestFramework

GasOnlineTestFramework - Testing framework for Google Apps Script online tests

### EnhancedTestRunner

**Source:** `GasOnlineTestFramework/src/EnhancedTestRunner.ts`

Registry-based test orchestrator for Google Apps Script, supporting namespaced test discovery and structured diagnostic logging.

**Initialization:**
```javascript
new EnhancedTestRunner()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(path: string, fn: Function, options={}: Object, options.skip=false: boolean): this` |
| `run` | `run(filter=null: string|RegExp|null): Object` |
| `_runTest` | `_runTest(test: Object): void` |
| `_log` | `_log(message: string): void` |
| `_printSummary` | `_printSummary(): void` |


### SampleSpreadsheetBuilder

**Source:** `GasOnlineTestFramework/src/SampleSpreadsheetBuilder.ts`

Wraps a live Spreadsheet handle with add-sheet/append-row
operations, so library consumers building sample test data never call
`SpreadsheetApp`/`Sheet` natives directly.

**Initialization:**
```javascript
new SampleSpreadsheetBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addSheet` | `addSheet(name: string, headerRow: string[]): void` |
| `appendRow` | `appendRow(sheetName: string, row: Object<string, *>): void` |
| `appendRows` | `appendRows(sheetName: string): void` |
| `getUrl` | `getUrl(): string` |


### SmartAssert

**Source:** `GasOnlineTestFramework/src/SmartAssert.ts`

Verbose assertion engine providing machine-readable diagnostic logs for every verification, optimized for LLM-driven test analysis.

**Initialization:**
```javascript
new SmartAssert()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `_safeStringify` | `_safeStringify(passed: boolean, expected: *, actual: *, message: string): void` |
| `_log` | `_log(): void` |
| `equals` | `equals(actual: *, expected: *, message='Values should be equal': string): void` |
| `greaterThan` | `greaterThan(actual: number|Date, expected: number|Date, message='Actual should be greater than expected': string): void` |
| `lessThan` | `lessThan(actual: number|Date, expected: number|Date, message='Actual should be less than expected': string): void` |
| `notEquals` | `notEquals(actual: *, expected: *, message='Values should not be equal': string): void` |
| `isTrue` | `isTrue(actual: *, message='Value should be true': string): void` |
| `isFalse` | `isFalse(actual: *, message='Value should be false': string): void` |
| `isNull` | `isNull(actual: *, message='Value should be null or undefined': string): void` |
| `notNull` | `notNull(actual: *, message='Value should not be null or undefined': string): void` |
| `deepEquals` | `deepEquals(actual: *, expected: *, message='Objects should be deeply equal': string): void` |
| `isType` | `isType(actual: *, expectedType: string, message: string): void` |
| `isNumber` | `isNumber(actual: *, message='Value should be a number': string): void` |
| `isString` | `isString(actual: *, message='Value should be a string': string): void` |
| `contains` | `contains(array: Array, value: *, message='Array should contain value': string): void` |
| `fail` | `fail(message='Intentional failure': string): void` |
| `throws` | `throws(fn: Function, message='Function should throw an error': string): void` |


### TestContext

**Source:** `GasOnlineTestFramework/src/TestContext.ts`

Resource manager for online test execution, maintaining persistent Google Drive artifacts to optimize quota usage and execution speed.

**Initialization:**
```javascript
new TestContext()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getRootFolder` | `getRootFolder(): GoogleAppsScript.Drive.Folder` |
| `getOrCreateNamedFolder` | `getOrCreateNamedFolder(name: string, parentFolder=null: GoogleAppsScript.Drive.Folder|null): GoogleAppsScript.Drive.Folder` |
| `getSpreadsheet` | `getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet` |
| `getOrCreateNamedSpreadsheet` | `getOrCreateNamedSpreadsheet(name: string, parentFolder=null: GoogleAppsScript.Drive.Folder|null): GoogleAppsScript.Spreadsheet.Spreadsheet` |
| `getDocument` | `getDocument(): GoogleAppsScript.Document.Document` |
| `resetSpreadsheet` | `resetSpreadsheet(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): void` |
| `buildSampleSpreadsheet` | `buildSampleSpreadsheet(name: string, parentFolder=null: GoogleAppsScript.Drive.Folder|null): SampleSpreadsheetBuilder` |
| `buildSampleSpreadsheetById` | `buildSampleSpreadsheetById(spreadsheetId: string): SampleSpreadsheetBuilder` |
| `resetDocument` | `resetDocument(): void` |
| `_clearBodySafely` | `_clearBodySafely(body: GoogleAppsScript.Document.Body): void` |
| `resetAll` | `resetAll(): void` |
| `_log` | `_log(message: string): void` |


---

## GasSchemaValidatorLib

[![Layer: L1 Infrastructure](https://img.shields.io/badge/Layer-L1%20Infrastructure-blue.svg)](#architecture) [![Dependency: Zod](https://img.shields.io/badge/Dependency-Zod-green.svg)](https://zod.dev)

### DatasetValidator

**Source:** `GasSchemaValidatorLib/src/DatasetValidator.ts`

**Initialization:**
```javascript
new DatasetValidator()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `validate` | `validate(datasets: Record<string, Array<Record<string, unknown>>>): {violations: Array<object>` |
| `_applyRule` | `_applyRule(): void` |
| `_violation` | `_violation(): void` |
| `_index` | `_index(): void` |
| `_required` | `_required(): void` |
| `_enum` | `_enum(): void` |
| `_json` | `_json(): void` |
| `_foreignKey` | `_foreignKey(): void` |
| `_columnName` | `_columnName(): void` |
| `_rowPredicate` | `_rowPredicate(): void` |


### SchemaValidator

**Source:** `GasSchemaValidatorLib/src/SchemaValidator.ts`

**Initialization:**
```javascript
new SchemaValidator()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `formatZodError` | `formatZodError(): void` |
| `toValidationException` | `toValidationException(): void` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `validate` | `validate(): void` |
| `safeValidate` | `safeValidate(): void` |


### ValidationException

**Source:** `GasSchemaValidatorLib/src/internal/errors/ValidationException.ts`

**Initialization:**
```javascript
new ValidationException()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getErrors` | `getErrors(): void` |
| `hasErrors` | `hasErrors(): void` |
| `getErrorsForField` | `getErrorsForField(): void` |
| `toObject` | `toObject(): void` |
| `withContext` | `withContext(): void` |


### GasValidators

**Source:** `GasSchemaValidatorLib/src/internal/validators/GasValidators.ts`

**Initialization:**
```javascript
new GasValidators()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `a1Notation` | `a1Notation(): void` |
| `spreadsheetId` | `spreadsheetId(): void` |
| `hexColor` | `hexColor(): void` |
| `jsonString` | `jsonString(): void` |


---

