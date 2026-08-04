# API Reference: GasSchemaValidatorLib

## CLASS: SchemaValidator
**File Path:** `GasSchemaValidatorLib/src/SchemaValidator.js`
**Constructor Usage:** `const instance = new SchemaValidator();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of SchemaValidator

#### METHOD: SchemaValidator.validate
- **Scope:** instance
- **LLM Call Syntax:** `schemaValidator.validate(schema, data, entityType);`
- **Pure JSDoc:**
```javascript
/** Method validate */
```
---
#### METHOD: SchemaValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `schemaValidator.if(!result.success);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SchemaValidator.safeValidate
- **Scope:** instance
- **LLM Call Syntax:** `schemaValidator.safeValidate(schema, data, _entityType);`
- **Pure JSDoc:**
```javascript
/** Method safeValidate */
```
---
#### METHOD: SchemaValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `schemaValidator.if(result.success);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SchemaValidator.formatZodError
- **Scope:** static
- **LLM Call Syntax:** `SchemaValidator.formatZodError(zodError);`
- **Pure JSDoc:**
```javascript
/** Method formatZodError */
```
---
#### METHOD: SchemaValidator.toValidationException
- **Scope:** static
- **LLM Call Syntax:** `SchemaValidator.toValidationException(zodError, entityType);`
- **Pure JSDoc:**
```javascript
/** Method toValidationException */
```
---
#### METHOD: SchemaValidator.if
- **Scope:** instance
- **LLM Call Syntax:** `schemaValidator.if(!parse);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: MockSchemaValidator
**File Path:** `GasSchemaValidatorLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new MockSchemaValidator();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: GasValidators
**File Path:** `GasSchemaValidatorLib/src/internal/validators/GasValidators.js`
**Constructor Usage:** `const instance = new GasValidators();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of GasValidators

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
<br>

## CLASS: ValidationException
**File Path:** `GasSchemaValidatorLib/src/internal/errors/ValidationException.js`
**Constructor Usage:** `const instance = new ValidationException();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of ValidationException

#### METHOD: ValidationException.getErrors
- **Scope:** instance
- **LLM Call Syntax:** `validationException.getErrors();`
- **Pure JSDoc:**
```javascript
/** Method getErrors */
```
---
#### METHOD: ValidationException.hasErrors
- **Scope:** instance
- **LLM Call Syntax:** `validationException.hasErrors();`
- **Pure JSDoc:**
```javascript
/** Method hasErrors */
```
---
#### METHOD: ValidationException.getErrorsForField
- **Scope:** instance
- **LLM Call Syntax:** `validationException.getErrorsForField(fieldName);`
- **Pure JSDoc:**
```javascript
/** Method getErrorsForField */
```
---
#### METHOD: ValidationException.toObject
- **Scope:** instance
- **LLM Call Syntax:** `validationException.toObject();`
- **Pure JSDoc:**
```javascript
/** Method toObject */
```
---
#### METHOD: ValidationException.withContext
- **Scope:** instance
- **LLM Call Syntax:** `validationException.withContext(additionalContext);`
- **Pure JSDoc:**
```javascript
/** Method withContext */
```
---
<br>

