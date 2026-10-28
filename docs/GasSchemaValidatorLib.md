# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [GasSchemaValidatorLib](#gasschemavalidatorlib)

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

