# GasSchemaValidatorLib

[![Layer: L1 Infrastructure](https://img.shields.io/badge/Layer-L1%20Infrastructure-blue.svg)](#architecture)
[![Dependency: Zod](https://img.shields.io/badge/Dependency-Zod-green.svg)](https://zod.dev)

A high-performance, **Zod-powered validation engine** for Google Apps Script. Part of the `GasLibraryFactory` monorepo, this library provides robust runtime type-checking and schema enforcement for data ingestion, API responses, and internal state management.

---

## 🏗️ Architecture

`GasSchemaValidatorLib` resides in **Layer 1 (Infrastructure)**. It depends on `CoreUtilsLib` for foundational error handling and utilizes `zod` as its core validation engine.

### Key Components

- **SchemaValidator**: The central engine for executing schema validations.
- **ValidationException**: A specialized error class for handling validation failures with detailed field-level metadata.

---

## 🚀 Key Features

- **Zod Integration**: Full support for the `zod` ecosystem, allowing for complex, nested schemas and custom transformations.
- **Efficient Caching**: Uses a `WeakMap` to cache `safeParse` functions, minimizing overhead during repeated validations of the same schema.
- **Detailed Error Reporting**: Automatically formats Zod errors into a clean, field-based structure (`{ field: string, message: string }`).
- **Flexible Validation Modes**:
  - `validate()`: Throws a `ValidationException` on failure (ideal for fail-fast logic).
  - `safeValidate()`: Returns a `{ success, data, errors }` object (ideal for form handling or non-blocking checks).

---

## 💻 Usage Example

```javascript
import { SchemaValidator } from '@GasSchemaValidatorLib';
import { z } from 'zod';

const logger = console; // Any logger implementing .debug()
const validator = new SchemaValidator(logger);

// Define a Zod schema
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  roles: z.array(z.string()).min(1)
});

const userData = {
  id: 123,
  email: 'invalid-email',
  roles: []
};

// 1. Throwing validation
try {
  validator.validate(UserSchema, userData, 'UserAccount');
} catch (error) {
  if (error.name === 'ValidationException') {
    console.log(error.message); // "Validation failed for UserAccount"
    console.log(error.errors); // [{ field: "email", message: "Invalid email" }, ...]
  }
}

// 2. Safe validation
const result = validator.safeValidate(UserSchema, userData);
if (!result.success) {
  console.log(result.errors);
} else {
  console.log(result.data);
}
```

---

## 🛠️ API Reference

### `SchemaValidator`

| Method                                                | Description                                                                                    |
| :---------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `validate(schema, data, entityType?)`                 | Validates data against a schema. Throws `ValidationException` if invalid.                      |
| `safeValidate(schema, data, entityType?)`             | Validates data and returns a result object `{ success: boolean, data?: any, errors?: Array }`. |
| `static formatZodError(zodError)`                     | Static utility to convert a `ZodError` into a flat array of field errors.                      |
| `static toValidationException(zodError, entityType?)` | Static utility to wrap a `ZodError` into a `ValidationException`.                              |

### `ValidationException`

Extends `BaseError` (from `CoreUtilsLib`).

- **Properties**:
  - `entityType`: The name of the object being validated (e.g., 'User', 'Config').
  - `errors`: Array of `{ field: string, message: string }`.
- **Methods**:
  - `getErrors()`: Returns all validation errors.
  - `getErrorsForField(fieldName)`: Filters errors by field name.
  - `hasErrors()`: Returns true if any errors exist.

---

## 📄 License

This library is part of the `GasLibraryFactory` monorepo and is licensed under the **GNU General Public License v3**.
