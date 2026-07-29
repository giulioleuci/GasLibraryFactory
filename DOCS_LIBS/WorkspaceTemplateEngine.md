# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [WorkspaceTemplateEngine](#workspacetemplateengine)

---

## WorkspaceTemplateEngine

**Version:** 1.0.0   **Layer:** Domain Logic (Layer 2)   **Dependencies:** CoreUtilsLib, GoogleApiWrapper

### FilterStrategy

Base class and registry for template filters using Strategy pattern.
             WTE-HIGH-001: Refactored from inline filter implementations for better
             extensibility, testability, and maintainability.

**Initialization:**
```javascript
new FilterStrategy()
```

**Methods:**

- `getName(): string`

- `getDescription(): string`

- `execute(value: *, args: ...*): *`

- `validate(value: *, args: Array<*>): void`


### FilterRegistry

Returns the unique identifier for the filter used in template expressions.
@returns {string} Unique filter name (e.g., 'uppercase').
@abstract
/
  getName() {
    throw new Error('FilterStrategy.getName() must be implemented by subclass');
  }

**Initialization:**
```javascript
new FilterRegistry()
```

**Methods:**

- `register(filterStrategy: FilterStrategy): void`

- `registerAll(filterStrategies: FilterStrategy[]): void`

- `has(name: string): boolean`

- `unregister(name: string): boolean`

- `getAllNames(): string[]`

- `getAll(): FilterStrategy[]`

- `clear(): void`

- `count(): number`


### MustacheRenderError

@class MustacheRenderError
@extends BaseError
Thrown when template rendering exceeds the maximum nesting depth or
detects a self-referencing partial cycle — surfaces a catchable, diagnosable error
instead of an opaque call-stack overflow when a data-driven CONF_DOC/CONF_MAIL
template is malformed (ref analysis_3_structural_errors.md Finding 3).

**Initialization:**
```javascript
new MustacheRenderError()
```


### MyMustache

Advanced Mustache engine with Handlebars meta-variables (@index, @first) and Liquid-style filters.
Implements template caching, prototype pollution protection, and Strategy-based filter registry.
@class

**Initialization:**
```javascript
new MyMustache()
```


### DefaultFilter

Advanced filter implementations inspired by Handlebars and Liquid.
             Extends the Mustache template engine with "logic-light" features.


### YesNoFilter

Boolean-to-string transformer. Format: "YesString,NoString".
@class


### FallbackFilter

Simple fallback mechanism. Returns fallbackValue if value is missing.
@class


### TruncateFilter

String truncator with optional suffix. Defaults to 50 chars and "...".
@class


### SplitFilter

String-to-array splitter using a specified separator (default: ",").
@class


### ReplaceFilter

Global string replacer. Replaces all occurrences of searchValue with replaceValue.
@class


### UrlEncodeFilter

URI component encoder for URL-safe string generation.
@class


### MapFilter

Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.
@class


### LimitFilter

Array slicer. Returns the first N items (default: 10).
@class


### SkipFilter

Array offsetter. Skips the first N items.
@class


### SortFilter

Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.
@class


### ReverseFilter

Array order reverser. Creates a shallow copy before reversing.
@class


### PlusFilter

Numeric addition filter. Adds addend to the value.
@class


### MinusFilter

Numeric subtraction filter. Subtracts subtrahend from the value.
@class


### JsonFilter

JSON serializer with optional indentation support.
@class


### UppercaseFilter

Built-in filter implementations using Strategy pattern.
             WTE-HIGH-001: Refactored from inline implementations in MyMustache.

**Initialization:**
```javascript
new UppercaseFilter()
```


### LowercaseFilter

String transformer. Converts all characters to lowercase.
@class

**Initialization:**
```javascript
new LowercaseFilter()
```


### CapitalizeFilter

String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.
@class

**Initialization:**
```javascript
new CapitalizeFilter()
```


### DateFilter

Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.
@class

**Initialization:**
```javascript
new DateFilter()
```


### NumberFilter

Formats a Date as dd/MM/yyyy using only arithmetic (no locale).
@param {Date} date Valid Date instance.
@returns {string} Zero-padded dd/MM/yyyy string.
@private
/
  static _formatDDMMYYYY(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }
}


### JoinFilter

Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.
@class


### PluralizeFilter

Security guard against prototype pollution.
@param {string} key Property key.
@returns {boolean} True if restricted.
@private
/
  _isDangerousKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }


### SortByFilter

Array sorter. Performs in-place sorting based on a specific property key. Includes prototype pollution protection.
@class


### WhereFilter

Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.
@class


### ExcludeFilter

Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.
@class


### DocumentProcessorValueResolver

Manager for resolving values, applying filters, and sorting data.

**Initialization:**
```javascript
new DocumentProcessorValueResolver()
```


### MustacheMock

Centralized high-fidelity mocks for WorkspaceTemplateEngine services.

**Initialization:**
```javascript
new MustacheMock()
```


---

