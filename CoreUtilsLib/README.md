# CoreUtilsLib

**Version:** 1.1.0
**Layer:** Foundation (Layer 0)
**Dependencies:** None (Zero internal dependencies)
**External Libraries:** es-toolkit (Hybrid Strategic Retention)

## 📖 Overview

**CoreUtilsLib** is the foundational library of the GasLibraryFactory ecosystem. It provides essential, stateless utility services that are used across all upper layers of the architecture.

By following a **Strategic Hybrid Approach**, we minimize external dependencies by using native JS for trivial tasks while retaining robust libraries for complex data transformations. This ensures optimal performance and maintainability within the Google Apps Script (GAS) V8 runtime.

## 🏗️ File and Folder Structure

The library follows a modular design where each file focuses on a specific utility domain:

```text
CoreUtilsLib/
├── src/
│   ├── BaseError.js            # Standardized error class with context support
│   ├── BoundedMap.js           # Memory-safe Map implementation with size limits
│   ├── CacheUtils.js           # Logic for TTL and cache key generation
│   ├── ConfigurationBuilder.js  # Fluent API for building complex config objects
│   ├── HashUtils.js            # SHA-256 hashing for strings and objects
│   ├── interfaces.js           # TypeScript-like JSDoc interface definitions
│   ├── LodashFacade.js         # Hybrid utility facade (Native + es-toolkit)
│   ├── LoggerService.js        # Structured logging with levels and child loggers
│   ├── PiiRedactor.js          # Utility to scrub sensitive data from strings/objects
│   ├── PlaceholderUtils.js     # String interpolation and template handling
│   ├── RegexUtils.js           # Security-focused regex creation and validation
│   ├── ServiceValidator.js     # Orchestrates validation across services
│   ├── TypeGuards.js           # Runtime type checking and validation helpers
│   ├── UtilsService.js         # Main facade for general utilities (Date, UUID, etc.)
│   ├── ValidationUtils.js      # Low-level validation logic
│   └── __tests__/              # Comprehensive Jest unit tests
```

## 🧩 Programming Patterns

This library utilizes several key design patterns to ensure flexibility and testability:

1.  **Facade Pattern**: `UtilsService` acts as a simplified interface to a large body of logic (dates, IDs, objects), hiding the complexity of the underlying implementation.
2.  **Builder Pattern**: `ConfigurationBuilder` provides a fluent interface to construct complex configuration objects step-by-step, improving readability.
3.  **Dependency Injection**: Crucial for testability, `UtilsService` requires the injection of the `sleep` function (e.g., `Utilities.sleep` in GAS) during instantiation.
4.  **Static Utility Pattern**: `HashUtils`, `RegexUtils`, and `TypeGuards` use static methods for stateless, functional-style operations.
5.  **PII Redaction (Interception)**: `PiiRedactor` implements a form of data interception to sanitize logs before they are persisted.

## ✨ Key Features

- **Structured Logging**: A configurable `LoggerService` with support for log levels (DEBUG, INFO, WARN, ERROR) and object serialization.
- **Cryptographic Hashing**: `HashUtils` provides consistent SHA-256 hashing for strings and objects, utilizing native GAS utilities for performance.
- **Regex Safety**: `RegexUtils` includes ReDoS (Regular Expression Denial of Service) protection, validation, and safe escaping.
- **Comprehensive Utilities**: `UtilsService` offers a vast array of helpers for:
  - **Date & Time**: Parsing (ISO, Google Serial), formatting, and manipulation (Native JS implementation; **date-fns removed**).
  - **Identity**: Generation of v4 UUIDs and collision-resistant compact IDs (Native JS implementation; **nanoid removed**).
  - **Objects**: Deep cloning, merging, and safe nested property access (Strategic use of **es-toolkit/compat** for complex operations).
  - **Strings**: Case conversion, truncation, and validation (Hybrid Native/es-toolkit).
  - **Flow Control**: Sleep and delay mechanisms (via dependency injection).

## 🔧 External Dependencies

This library uses a **Hybrid Retention Strategy** to balance performance and robustness:

| Library        | Usage | Strategy                                                                    |
| :------------- | :---- | :-------------------------------------------------------------------------- |
| **date-fns**   | Dates | **REPLACED** with native `Date` implementations.                            |
| **nanoid**     | IDs   | **REPLACED** with native secure string generation.                          |
| **es-toolkit** | Utils | **HYBRID**. Native for simple utils; `es-toolkit/compat` for complex logic. |

---

- **es-toolkit** (^1.31.0) - High-performance utility library used for deep object operations and complex transformations.

These dependencies are bundled via Webpack and have minimal runtime overhead in Google Apps Script.

## 📦 Installation

This library is part of the GasLibraryFactory monorepo. It is typically bundled via Webpack.

```javascript
import { LoggerService, UtilsService, HashUtils, RegexUtils } from '@CoreUtilsLib';
```

## API Reference

### 1. LoggerService

A standardized logging wrapper that supports log levels to control verbosity.

**Configuration:**

```javascript
const logger = new LoggerService({ level: 'DEBUG' }); // Options: OFF, ERROR, WARN, INFO, DEBUG
```

**Usage:**

```javascript
logger.info('Process started');
logger.debug('Payload details', { id: 123, status: 'active' });
logger.error('Operation failed', new Error('Connection timeout'));
```

**Key Methods:**

- `setLevel(level)`: Dynamically change log level.
- `debug(message, context)`, `info(...)`, `warn(...)`, `error(...)`: Log messages with optional context objects.
- `child(prefix)`: Creates a namespaced logger instance (e.g., `[MyModule] Message`).

---

### 2. UtilsService

A stateless collection of helper functions. Note that for time-based operations like `sleep`, the implementation must be injected to maintain testability.

**Initialization:**

```javascript
// In GAS environment, inject the native sleep function
const utils = new UtilsService((ms) => Utilities.sleep(ms));
```

**Key Capabilities:**

- **Identity:**
  - `generateUuid()`: Generates a standard UUID v4.
  - `generateShortId()`: Generates an 8-character alphanumeric ID.

- **Date & Time:**
  - `parseDate(input)`: Robust parsing for ISO strings, timestamps, and Google Sheets serial numbers.
  - `formatDate(date, format, { utc })`: Formats dates (e.g., 'YYYY-MM-DD'); `utc: true` derives tokens from the UTC components (deterministic, host-timezone independent).
  - `addDays(date, amount)`, `addHours(...)`, etc.: Date arithmetic.
  - `daysBetween(date1, date2)`: Calculates duration between dates.

- **Object Manipulation:**
  - `deepClone(obj)`: Creates a deep copy of an object (handles circular references).
  - `deepMerge(...objects)`: Deeply merges multiple objects.
  - `getNestedProperty(obj, path)`: Safely retrieves values (e.g., `user.address.city`).
  - `setNestedProperty(obj, path, value)`: Safely sets nested values.

- **Validation:**
  - `isValidEmail(email)`: Validates email format.
  - `isValidUrl(url)`: Validates URL format.

---

### 3. HashUtils

Provides consistent hashing mechanisms, crucial for caching strategies and data integrity checks.

**Usage:**

```javascript
import { HashUtils } from '@CoreUtilsLib';

// Generate SHA-256 hash of a string
const hash = HashUtils.generateHash('my-cache-key');
// Output: "2e5917462088f1a1489e3a35b13689f2d5084992a7e755291f09e05f6390a36e"

// Generate consistent hash of an object (keys are sorted)
const objHash = HashUtils.hashObject({ b: 2, a: 1 });
```

**Features:**

- Uses `Utilities.computeDigest` (SHA-256) for performance and collision resistance.
- `hashObject` ensures deterministic output by normalizing object key order.

---

### 4. RegexUtils

Utilities for handling Regular Expressions safely, specifically designed to prevent ReDoS attacks in user-generated content processing.

**Usage:**

```javascript
import { RegexUtils } from '@CoreUtilsLib';

// Escape special characters for literal matching
const safePattern = RegexUtils.escape('file.name (1).txt');
// Output: "file\\.name \\(1\\)\\.txt"

// Validate a pattern before compiling
try {
  RegexUtils.validateSafety('(a+)+'); // Throws Error: Nested quantifiers detected
} catch (e) {
  console.error('Unsafe regex detected');
}

// Create a safe RegExp object
const regex = RegexUtils.createSafeRegex('^[a-z]+$', 'i');
```

**Security Checks:**

- Maximum pattern length (500 chars).
- Detection of nested quantifiers (e.g., `(a+)+`).
- Detection of excessive repetition (e.g., `a{1000}`).
- Detection of dangerous alternations with overlapping groups.

## 🧪 Testing

This library is fully unit-tested using Jest. Since it is the foundation layer, it mocks external dependencies to ensure pure logic validation.
