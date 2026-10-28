# API Reference: GasSchemaValidatorLib

## CLASS: SchemaValidator
**File Path:** `GasSchemaValidatorLib/src/SchemaValidator.ts`
**Constructor Usage:** `const instance = new SchemaValidator();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of SchemaValidator

#### METHOD: SchemaValidator.validate
- **Scope:** instance
- **LLM Call Syntax:** `schemaValidator.validate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SchemaValidator.safeValidate
- **Scope:** instance
- **LLM Call Syntax:** `schemaValidator.safeValidate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SchemaValidator.formatZodError
- **Scope:** static
- **LLM Call Syntax:** `SchemaValidator.formatZodError();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: SchemaValidator.toValidationException
- **Scope:** static
- **LLM Call Syntax:** `SchemaValidator.toValidationException();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: DatasetValidator
**File Path:** `GasSchemaValidatorLib/src/DatasetValidator.ts`
**Constructor Usage:** `const instance = new DatasetValidator();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of DatasetValidator

#### METHOD: DatasetValidator.validate
- **Scope:** instance
- **LLM Call Syntax:** `const result = datasetValidator.validate(datasets, rules);`
- **Pure JSDoc:**
```javascript
/**
   * @param {Record<string, Array<Record<string, unknown>>>} datasets
   * @param {Array<object>} rules
   * @returns {{violations: Array<object>}}
   */
```
---
#### METHOD: DatasetValidator._applyRule
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._applyRule();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatasetValidator._violation
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._violation();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatasetValidator._index
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._index();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatasetValidator._required
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._required();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatasetValidator._enum
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._enum();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatasetValidator._json
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._json();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatasetValidator._foreignKey
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._foreignKey();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatasetValidator._columnName
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._columnName();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: DatasetValidator._rowPredicate
- **Scope:** instance
- **LLM Call Syntax:** `datasetValidator._rowPredicate();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

## CLASS: GasValidators
**File Path:** `GasSchemaValidatorLib/src/internal/validators/GasValidators.ts`
**Constructor Usage:** `const instance = new GasValidators();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of GasValidators

#### METHOD: GasValidators.a1Notation
- **Scope:** static
- **LLM Call Syntax:** `GasValidators.a1Notation();`
- **Pure JSDoc:**
```javascript
/** Validates "A1", "A1:B10", "Sheet1!A1:B10", "'Sheet Name'!A1:B" */
```
---
#### METHOD: GasValidators.spreadsheetId
- **Scope:** static
- **LLM Call Syntax:** `GasValidators.spreadsheetId();`
- **Pure JSDoc:**
```javascript
/** Validates 30-60 char alphanumeric Google Spreadsheet IDs */
```
---
#### METHOD: GasValidators.hexColor
- **Scope:** static
- **LLM Call Syntax:** `GasValidators.hexColor();`
- **Pure JSDoc:**
```javascript
/** Validates "#FFF" or "#FFFFFF" */
```
---
#### METHOD: GasValidators.jsonString
- **Scope:** static
- **LLM Call Syntax:** `GasValidators.jsonString();`
- **Pure JSDoc:**
```javascript
/** Parses JSON string, optionally validates against inner schema */
```
---
<br>

## CLASS: ValidationException
**File Path:** `GasSchemaValidatorLib/src/internal/errors/ValidationException.ts`
**Constructor Usage:** `const instance = new ValidationException();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** No comment available */
```

### Methods and properties of ValidationException

#### METHOD: ValidationException.getErrors
- **Scope:** instance
- **LLM Call Syntax:** `validationException.getErrors();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ValidationException.hasErrors
- **Scope:** instance
- **LLM Call Syntax:** `validationException.hasErrors();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ValidationException.getErrorsForField
- **Scope:** instance
- **LLM Call Syntax:** `validationException.getErrorsForField();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ValidationException.toObject
- **Scope:** instance
- **LLM Call Syntax:** `validationException.toObject();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
#### METHOD: ValidationException.withContext
- **Scope:** instance
- **LLM Call Syntax:** `validationException.withContext();`
- **Pure JSDoc:**
```javascript
/** No comment available */
```
---
<br>

