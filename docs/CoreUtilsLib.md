# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [CoreUtilsLib](#coreutilslib)

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

