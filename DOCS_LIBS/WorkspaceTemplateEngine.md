# API Reference: WorkspaceTemplateEngine

## CLASS: for
**File Path:** `WorkspaceTemplateEngine/index.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: CurrencyFilter
**File Path:** `WorkspaceTemplateEngine/index.js`
**Constructor Usage:** `const instance = new CurrencyFilter();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of CurrencyFilter

#### METHOD: CurrencyFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `currencyFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: CurrencyFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `currencyFilter.execute(value, symbol);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: GenerateReportStep
**File Path:** `WorkspaceTemplateEngine/index.js`
**Constructor Usage:** `const instance = new GenerateReportStep();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of GenerateReportStep

#### METHOD: GenerateReportStep.execute
- **Scope:** instance
- **LLM Call Syntax:** `generateReportStep.execute(context);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: for
**File Path:** `WorkspaceTemplateEngine/index.js`
**Constructor Usage:** `const instance = new for();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: MyPlaceholderService
**File Path:** `WorkspaceTemplateEngine/src/PlaceholderService.js`
**Constructor Usage:** `const instance = new MyPlaceholderService();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of MyPlaceholderService

#### METHOD: MyPlaceholderService.if
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.if(!this.mustache);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyPlaceholderService.processString
- **Scope:** instance
- **LLM Call Syntax:** `const result = myPlaceholderService.processString(template, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Processes a string template using Mustache placeholders and filter pipes.
   * Supports standard Mustache syntax plus `{{value | filter:args}}` extensions.
   * @param {string} template Raw template string.
   * @param {Object} [context={}] Data context for resolution.
   * @returns {string} Processed string or original template on failure.
   * @throws {TypeError} If inputs are invalid types.
   */
```
---
#### METHOD: MyPlaceholderService.if
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.if(typeof template !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyPlaceholderService.if
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.if(context !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyPlaceholderService.catch
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: MyPlaceholderService.resolve
- **Scope:** instance
- **LLM Call Syntax:** `const result = myPlaceholderService.resolve(template, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Alias for processString() to maintain compatibility with GasExpressionEngineLib.
   * @param {string} template Raw template string.
   * @param {Object} [context={}] Data context.
   * @returns {string} Substituted string.
   */
```
---
#### METHOD: MyPlaceholderService.processDocument
- **Scope:** instance
- **LLM Call Syntax:** `const result = myPlaceholderService.processDocument(documentId, context);`
- **Pure JSDoc:**
```javascript
/**
   * @description Performs in-place processing of a Google Document with structural expansion.
   * Executes reverse-order operations for tables, lists, and placeholders to maintain index integrity.
   * @param {string} documentId Unique Google Document identifier.
   * @param {Object} [context={}] Data context containing arrays for structural loops.
   * @returns {boolean} True if processing completed without errors.
   * @throws {TypeError} If parameters are invalid.
   */
```
---
#### METHOD: MyPlaceholderService.if
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.if(context !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyPlaceholderService.catch
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: MyPlaceholderService.processSheet
- **Scope:** instance
- **LLM Call Syntax:** `const result = myPlaceholderService.processSheet(sheetId, context, sheetName);`
- **Pure JSDoc:**
```javascript
/**
   * @description Executes batch updates on a Google Spreadsheet with matrix expansion and placeholder substitution.
   *
   * Return shape changed (additively, in intent): callers that previously treated
   * the return value as a plain boolean must now read `.success` — the resolved
   * `dynamic_columns` column layouts (see `SheetProcessor._prepareDynamicColumnRequests`)
   * are surfaced via `.layouts` so a caller can know which spreadsheet column each
   * templated item landed in (e.g. to apply ACLs the directive's own static `acl=`
   * expression can't express).
   *
   * @param {string} sheetId Unique Google Spreadsheet identifier.
   * @param {Object} [context={}] Data context for substitutions and matrix generation.
   * @param {string|null} [sheetName=null] Target sheet name or null to process all sheets.
   * @returns {{success: boolean, layouts: Array<{sheetName: string, headerRow: number, startColumn: number, columns: Array<{header: *, column: number, isLabel: boolean}>}>}} `success` is false (and `layouts` empty) on any processing error, matching the pre-existing swallow-and-log behavior.
   * @throws {TypeError} If parameters are invalid.
   */
```
---
#### METHOD: MyPlaceholderService.if
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.if(context !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyPlaceholderService.if
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.if(sheetName !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: MyPlaceholderService.catch
- **Scope:** instance
- **LLM Call Syntax:** `myPlaceholderService.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: FilterStrategy
**File Path:** `WorkspaceTemplateEngine/src/FilterStrategy.js`
**Constructor Usage:** `const instance = new FilterStrategy();`
**Description:** Base class and registry for template filters using Strategy pattern.
             WTE-HIGH-001: Refactored from inline filter implementations for better
             extensibility, testability, and maintainability.

/

/**
Abstract base for Mustache template filters using the Strategy pattern.
Enables value transformations via pipe syntax: `{{value | filterName:args}}`.
@abstract
@class
@example
class UppercaseFilter extends FilterStrategy {
  getName() { return 'uppercase'; }
  execute(v) { return String(v).toUpperCase(); }
}

### Raw JSDoc Context:
```javascript
/**
 * @file WorkspaceTemplateEngine/src/FilterStrategy.js
 * @description Base class and registry for template filters using Strategy pattern.
 *              WTE-HIGH-001: Refactored from inline filter implementations for better
 *              extensibility, testability, and maintainability.
 * @version 2.0.0
 */

/**
 * @description Abstract base for Mustache template filters using the Strategy pattern.
 * Enables value transformations via pipe syntax: `{{value | filterName:args}}`.
 * @abstract
 * @class
 * @example
 * class UppercaseFilter extends FilterStrategy {
 *   getName() { return 'uppercase'; }
 *   execute(v) { return String(v).toUpperCase(); }
 * }
 */
```

<br>

## CLASS: FilterRegistry
**File Path:** `WorkspaceTemplateEngine/src/FilterStrategy.js`
**Constructor Usage:** `const instance = new FilterRegistry();`
**Description:** Returns the unique identifier for the filter used in template expressions.
@returns {string} Unique filter name (e.g., 'uppercase').
@abstract
/
  getName() {
    throw new Error('FilterStrategy.getName() must be implemented by subclass');
  }

  /**
Returns a technical description of the filter transformation logic.
@returns {string} Human-readable functional summary.
@abstract
/
  getDescription() {
    throw new Error('FilterStrategy.getDescription() must be implemented by subclass');
  }

  /**
Performs the core value transformation.
@param {*} value Input value to be transformed.
@param {...*} args Optional arguments passed from the template expression.
@returns {*} The transformed value.
@abstract
/
  execute(_value, ..._args) {
    throw new Error('FilterStrategy.execute() must be implemented by subclass');
  }

  /**
Validates filter arguments before execution.
@param {*} value The input value.
@param {Array<*>} args Array of arguments passed to the filter.
@throws {Error} If argument validation fails.
/
  validate(_value, _args) {
    // Default: no validation
    // Subclasses can override to add specific validation
  }
}

/**
Centralized registry for managing and resolving FilterStrategy instances.
@class

### Raw JSDoc Context:
```javascript
/**
   * @description Returns the unique identifier for the filter used in template expressions.
   * @returns {string} Unique filter name (e.g., 'uppercase').
   * @abstract
   */
  getName() {
    throw new Error('FilterStrategy.getName() must be implemented by subclass');
  }

  /**
   * @description Returns a technical description of the filter transformation logic.
   * @returns {string} Human-readable functional summary.
   * @abstract
   */
  getDescription() {
    throw new Error('FilterStrategy.getDescription() must be implemented by subclass');
  }

  /**
   * @description Performs the core value transformation.
   * @param {*} value Input value to be transformed.
   * @param {...*} args Optional arguments passed from the template expression.
   * @returns {*} The transformed value.
   * @abstract
   */
  execute(_value, ..._args) {
    throw new Error('FilterStrategy.execute() must be implemented by subclass');
  }

  /**
   * @description Validates filter arguments before execution.
   * @param {*} value The input value.
   * @param {Array<*>} args Array of arguments passed to the filter.
   * @throws {Error} If argument validation fails.
   */
  validate(_value, _args) {
    // Default: no validation
    // Subclasses can override to add specific validation
  }
}

/**
 * @description Centralized registry for managing and resolving FilterStrategy instances.
 * @class
 */
```

<br>

## CLASS: MustacheMock
**File Path:** `WorkspaceTemplateEngine/src/testing/mocks.js`
**Constructor Usage:** `const instance = new MustacheMock();`
**Description:** Centralized high-fidelity mocks for WorkspaceTemplateEngine services.

/

/**
High-fidelity mock for the Mustache engine.
Simulates core rendering logic, variable substitution, and basic filter execution for unit testing.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file WorkspaceTemplateEngine/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for WorkspaceTemplateEngine services.
 * @version 1.0.0
 */

/**
 * @description High-fidelity mock for the Mustache engine.
 * Simulates core rendering logic, variable substitution, and basic filter execution for unit testing.
 * @class
 */
```

<br>

## CLASS: _SheetProcessor
**File Path:** `WorkspaceTemplateEngine/src/processors/SheetProcessor.js`
**Constructor Usage:** `const instance = new _SheetProcessor();`
**Description:** Specialized engine for Google Sheets template expansion using batch-first strategy.
Implements cell-level substitutions and structural expansions (matrices, dynamic columns) in atomic updates.
@class
@private

### Raw JSDoc Context:
```javascript
/**
 * @description Specialized engine for Google Sheets template expansion using batch-first strategy.
 * Implements cell-level substitutions and structural expansions (matrices, dynamic columns) in atomic updates.
 * @class
 * @private
 */
```

<br>

## CLASS: _DocumentProcessor
**File Path:** `WorkspaceTemplateEngine/src/processors/DocumentProcessor.js`
**Constructor Usage:** `const instance = new _DocumentProcessor();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: DocumentProcessorValueResolver
**File Path:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorValueResolver.js`
**Constructor Usage:** `const instance = new DocumentProcessorValueResolver();`
**Description:** Manager for resolving values, applying filters, and sorting data.

### Raw JSDoc Context:
```javascript
/**
 * @file WorkspaceTemplateEngine/src/processors/managers/DocumentProcessorValueResolver.js
 * @description Manager for resolving values, applying filters, and sorting data.
 */
```

### Methods of DocumentProcessorValueResolver

#### METHOD: DocumentProcessorValueResolver.for
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorValueResolver.for(const filter of filters);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentProcessorValueResolver.switch
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorValueResolver.switch(filter.name);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: DocumentProcessorValueResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorValueResolver.if(filter.args.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentProcessorValueResolver.if
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorValueResolver.if(filter.args.length >);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentProcessorValueResolver.catch
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorValueResolver.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: DocumentProcessorTagScanner
**File Path:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorTagScanner.js`
**Constructor Usage:** `const instance = new DocumentProcessorTagScanner();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of DocumentProcessorTagScanner

#### METHOD: DocumentProcessorTagScanner.if
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner.if(table.rows.length < 1);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DocumentProcessorTagScanner.for
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner.for(let cellIndex);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: DocumentProcessorTagScanner.if
- **Scope:** instance
- **LLM Call Syntax:** `documentProcessorTagScanner.if(match);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: DocumentProcessorInjector
**File Path:** `WorkspaceTemplateEngine/src/internal/processors-managers/DocumentProcessorInjector.js`
**Constructor Usage:** `const instance = new DocumentProcessorInjector();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

## CLASS: UppercaseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new UppercaseFilter();`
**Description:** Built-in filter implementations using Strategy pattern.
             WTE-HIGH-001: Refactored from inline implementations in MyMustache.

/

import { FilterStrategy } from '../../FilterStrategy.js';

// ==================== STRING FILTERS ====================

/**
String transformer. Converts all characters to uppercase.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file WorkspaceTemplateEngine/src/filters/BuiltInFilters.js
 * @description Built-in filter implementations using Strategy pattern.
 *              WTE-HIGH-001: Refactored from inline implementations in MyMustache.
 * @version 2.0.0
 */

import { FilterStrategy } from '../../FilterStrategy.js';

// ==================== STRING FILTERS ====================

/**
 * @description String transformer. Converts all characters to uppercase.
 * @class
 */
```

<br>

## CLASS: LowercaseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new LowercaseFilter();`
**Description:** String transformer. Converts all characters to lowercase.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Converts all characters to lowercase.
 * @class
 */
```

### Methods of LowercaseFilter

#### METHOD: LowercaseFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `lowercaseFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: LowercaseFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `lowercaseFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: LowercaseFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `lowercaseFilter.execute(value);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: CapitalizeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new CapitalizeFilter();`
**Description:** String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description String transformer. Capitalizes the first character and lowercases the rest. Unicode-safe.
 * @class
 */
```

### Methods of CapitalizeFilter

#### METHOD: CapitalizeFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `capitalizeFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: CapitalizeFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `capitalizeFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: CapitalizeFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `capitalizeFilter.execute(value);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: CapitalizeFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `capitalizeFilter.if(!value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: DateFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new DateFilter();`
**Description:** Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Date formatter. Returns "dd/MM/yyyy" via UtilsService or US-locale string.
 * @class
 */
```

### Methods of DateFilter

#### METHOD: DateFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: DateFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: DateFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.execute(value);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: DateFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.if(this.utils && typeof this.utils.formatDate);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.if(formatted);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DateFilter.catch
- **Scope:** instance
- **LLM Call Syntax:** `dateFilter.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: NumberFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new NumberFilter();`
**Description:** Formats a Date as dd/MM/yyyy using only arithmetic (no locale).
@param {Date} date Valid Date instance.
@returns {string} Zero-padded dd/MM/yyyy string.
@private
/
  static _formatDDMMYYYY(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }
}

/**
Number formatter. Applies locale-specific formatting with optional fixed decimals.
@class

### Raw JSDoc Context:
```javascript
/**
   * @description Formats a Date as dd/MM/yyyy using only arithmetic (no locale).
   * @param {Date} date Valid Date instance.
   * @returns {string} Zero-padded dd/MM/yyyy string.
   * @private
   */
  static _formatDDMMYYYY(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }
}

/**
 * @description Number formatter. Applies locale-specific formatting with optional fixed decimals.
 * @class
 */
```

<br>

## CLASS: JoinFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new JoinFilter();`
**Description:** Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Array aggregator. Joins elements with a separator, optionally extracting a specific key. Includes prototype pollution protection.
 * @class
 */
```

### Methods of JoinFilter

#### METHOD: JoinFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `joinFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: JoinFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `joinFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: JoinFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `joinFilter.execute(array, key, separator, ');`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: PluralizeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new PluralizeFilter();`
**Description:** Security guard against prototype pollution.
@param {string} key Property key.
@returns {boolean} True if restricted.
@private
/
  _isDangerousKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  execute(array, key, separator = ', ') {
    if (!Array.isArray(array)) {
      return '';
    }
    // GEL-C004: Prevent prototype pollution in filter
    if (this._isDangerousKey(key)) {
      return '';
    }
    return array
      .map((item) => {
        if (item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, key)) {
          return item[key];
        }
        return item;
      })
      .join(separator);
  }
}

/**
Conditional string selector. Returns singular or plural form based on a numeric count.
@class

### Raw JSDoc Context:
```javascript
/**
   * @description Security guard against prototype pollution.
   * @param {string} key Property key.
   * @returns {boolean} True if restricted.
   * @private
   */
  _isDangerousKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  execute(array, key, separator = ', ') {
    if (!Array.isArray(array)) {
      return '';
    }
    // GEL-C004: Prevent prototype pollution in filter
    if (this._isDangerousKey(key)) {
      return '';
    }
    return array
      .map((item) => {
        if (item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, key)) {
          return item[key];
        }
        return item;
      })
      .join(separator);
  }
}

/**
 * @description Conditional string selector. Returns singular or plural form based on a numeric count.
 * @class
 */
```

<br>

## CLASS: SortByFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new SortByFilter();`
**Description:** Array sorter. Performs in-place sorting based on a specific property key. Includes prototype pollution protection.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Array sorter. Performs in-place sorting based on a specific property key. Includes prototype pollution protection.
 * @class
 */
```

### Methods of SortByFilter

#### METHOD: SortByFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: SortByFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: SortByFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.execute(array, key);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: SortByFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.if(valA);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortByFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.if(valA !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortByFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.if(valA);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortByFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.if(typeof valA !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortByFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.if(valA < valB);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortByFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortByFilter.if(valA > valB);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: WhereFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new WhereFilter();`
**Description:** Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Array filter. Returns elements where the specified property matches a value. Includes prototype pollution protection.
 * @class
 */
```

### Methods of WhereFilter

#### METHOD: WhereFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `whereFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: WhereFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `whereFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: WhereFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `whereFilter.execute(array, key, value);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: ExcludeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/BuiltInFilters.js`
**Constructor Usage:** `const instance = new ExcludeFilter();`
**Description:** Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Array filter. Returns elements where the specified property does not match a value. Includes prototype pollution protection.
 * @class
 */
```

### Methods of ExcludeFilter

#### METHOD: ExcludeFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `excludeFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: ExcludeFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `excludeFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: ExcludeFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `excludeFilter.execute(array, key, value);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: DefaultFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new DefaultFilter();`
**Description:** Advanced filter implementations inspired by Handlebars and Liquid.
             Extends the Mustache template engine with "logic-light" features.

/

import { FilterStrategy } from '../../FilterStrategy.js';

// ==================== LOGIC & DEFAULTS ====================

/**
Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file WorkspaceTemplateEngine/src/filters/AdvancedFilters.js
 * @description Advanced filter implementations inspired by Handlebars and Liquid.
 *              Extends the Mustache template engine with "logic-light" features.
 * @version 2.1.0
 */

import { FilterStrategy } from '../../FilterStrategy.js';

// ==================== LOGIC & DEFAULTS ====================

/**
 * @description Liquid-style default filter. Returns defaultValue if value is null, undefined, or empty.
 * @class
 */
```

<br>

## CLASS: YesNoFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new YesNoFilter();`
**Description:** Boolean-to-string transformer. Format: "YesString,NoString".
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Boolean-to-string transformer. Format: "YesString,NoString".
 * @class
 */
```

### Methods of YesNoFilter

#### METHOD: YesNoFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `yesNoFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: YesNoFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `yesNoFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: YesNoFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `yesNoFilter.execute(value, yesNoString, No');`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: FallbackFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new FallbackFilter();`
**Description:** Simple fallback mechanism. Returns fallbackValue if value is missing.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Simple fallback mechanism. Returns fallbackValue if value is missing.
 * @class
 */
```

### Methods of FallbackFilter

#### METHOD: FallbackFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `fallbackFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: FallbackFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `fallbackFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: FallbackFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `fallbackFilter.execute(value, fallbackValue);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: FallbackFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `fallbackFilter.if(value);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: TruncateFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new TruncateFilter();`
**Description:** String truncator with optional suffix. Defaults to 50 chars and "...".
@class

### Raw JSDoc Context:
```javascript
/**
 * @description String truncator with optional suffix. Defaults to 50 chars and "...".
 * @class
 */
```

### Methods of TruncateFilter

#### METHOD: TruncateFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `truncateFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: TruncateFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `truncateFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: TruncateFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `truncateFilter.execute(value, length, suffix);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: TruncateFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `truncateFilter.if(str.length <);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SplitFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new SplitFilter();`
**Description:** String-to-array splitter using a specified separator (default: ",").
@class

### Raw JSDoc Context:
```javascript
/**
 * @description String-to-array splitter using a specified separator (default: ",").
 * @class
 */
```

### Methods of SplitFilter

#### METHOD: SplitFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `splitFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: SplitFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `splitFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: SplitFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `splitFilter.execute(value, separator, ');`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: ReplaceFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new ReplaceFilter();`
**Description:** Global string replacer. Replaces all occurrences of searchValue with replaceValue.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Global string replacer. Replaces all occurrences of searchValue with replaceValue.
 * @class
 */
```

### Methods of ReplaceFilter

#### METHOD: ReplaceFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `replaceFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: ReplaceFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `replaceFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: ReplaceFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `replaceFilter.execute(value, searchValue, replaceValue);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: ReplaceFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `replaceFilter.if(!searchValue);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: UrlEncodeFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new UrlEncodeFilter();`
**Description:** URI component encoder for URL-safe string generation.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description URI component encoder for URL-safe string generation.
 * @class
 */
```

### Methods of UrlEncodeFilter

#### METHOD: UrlEncodeFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `urlEncodeFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: UrlEncodeFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `urlEncodeFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: UrlEncodeFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `urlEncodeFilter.execute(value);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: UrlEncodeFilter.catch
- **Scope:** instance
- **LLM Call Syntax:** `urlEncodeFilter.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: MapFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new MapFilter();`
**Description:** Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Array property mapper. Extracts a specific key from each object in an array. Includes prototype pollution protection.
 * @class
 */
```

### Methods of MapFilter

#### METHOD: MapFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `mapFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: MapFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `mapFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: MapFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `mapFilter.execute(array, propertyName);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: LimitFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new LimitFilter();`
**Description:** Array slicer. Returns the first N items (default: 10).
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Array slicer. Returns the first N items (default: 10).
 * @class
 */
```

### Methods of LimitFilter

#### METHOD: LimitFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `limitFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: LimitFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `limitFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: LimitFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `limitFilter.execute(array, count);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: SkipFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new SkipFilter();`
**Description:** Array offsetter. Skips the first N items.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Array offsetter. Skips the first N items.
 * @class
 */
```

### Methods of SkipFilter

#### METHOD: SkipFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `skipFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: SkipFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `skipFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: SkipFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `skipFilter.execute(array, count);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: SortFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new SortFilter();`
**Description:** Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Advanced array sorter. Supports property-based sorting and descending order ("desc"). Includes prototype pollution protection.
 * @class
 */
```

### Methods of SortFilter

#### METHOD: SortFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: SortFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: SortFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.execute(array, propertyOrDirection, direction);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(array.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(propertyOrDirection);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(propertyOrDirection);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(valA);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(valA !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(valA);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(typeof valA);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(valA < valB);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SortFilter.if
- **Scope:** instance
- **LLM Call Syntax:** `sortFilter.if(valA > valB);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: ReverseFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new ReverseFilter();`
**Description:** Array order reverser. Creates a shallow copy before reversing.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Array order reverser. Creates a shallow copy before reversing.
 * @class
 */
```

### Methods of ReverseFilter

#### METHOD: ReverseFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `reverseFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: ReverseFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `reverseFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: ReverseFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `reverseFilter.execute(array);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: PlusFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new PlusFilter();`
**Description:** Numeric addition filter. Adds addend to the value.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Numeric addition filter. Adds addend to the value.
 * @class
 */
```

### Methods of PlusFilter

#### METHOD: PlusFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `plusFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: PlusFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `plusFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: PlusFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `plusFilter.execute(value, addend);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: MinusFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new MinusFilter();`
**Description:** Numeric subtraction filter. Subtracts subtrahend from the value.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description Numeric subtraction filter. Subtracts subtrahend from the value.
 * @class
 */
```

### Methods of MinusFilter

#### METHOD: MinusFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `minusFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: MinusFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `minusFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: MinusFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `minusFilter.execute(value, subtrahend);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
<br>

## CLASS: JsonFilter
**File Path:** `WorkspaceTemplateEngine/src/internal/filters/AdvancedFilters.js`
**Constructor Usage:** `const instance = new JsonFilter();`
**Description:** JSON serializer with optional indentation support.
@class

### Raw JSDoc Context:
```javascript
/**
 * @description JSON serializer with optional indentation support.
 * @class
 */
```

### Methods of JsonFilter

#### METHOD: JsonFilter.getName
- **Scope:** instance
- **LLM Call Syntax:** `jsonFilter.getName();`
- **Pure JSDoc:**
```javascript
/** Method getName */
```
---
#### METHOD: JsonFilter.getDescription
- **Scope:** instance
- **LLM Call Syntax:** `jsonFilter.getDescription();`
- **Pure JSDoc:**
```javascript
/** Method getDescription */
```
---
#### METHOD: JsonFilter.execute
- **Scope:** instance
- **LLM Call Syntax:** `jsonFilter.execute(value, indent);`
- **Pure JSDoc:**
```javascript
/** Method execute */
```
---
#### METHOD: JsonFilter.catch
- **Scope:** instance
- **LLM Call Syntax:** `jsonFilter.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: MustacheRenderError
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new MustacheRenderError();`
**Description:** @class MustacheRenderError
@extends BaseError
Thrown when template rendering exceeds the maximum nesting depth or
detects a self-referencing partial cycle — surfaces a catchable, diagnosable error
instead of an opaque call-stack overflow when a data-driven CONF_DOC/CONF_MAIL
template is malformed (ref analysis_3_structural_errors.md Finding 3).

### Raw JSDoc Context:
```javascript
/**
 * @class MustacheRenderError
 * @extends BaseError
 * @description Thrown when template rendering exceeds the maximum nesting depth or
 * detects a self-referencing partial cycle — surfaces a catchable, diagnosable error
 * instead of an opaque call-stack overflow when a data-driven CONF_DOC/CONF_MAIL
 * template is malformed (ref analysis_3_structural_errors.md Finding 3).
 */
```

<br>

## CLASS: _MustacheScanner
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new _MustacheScanner();`
**Description:** State-tracking scanner for incremental Mustache template parsing.
@private
@class

### Raw JSDoc Context:
```javascript
/**
 * @description State-tracking scanner for incremental Mustache template parsing.
 * @private
 * @class
 */
```

### Methods of _MustacheScanner

#### METHOD: _MustacheScanner.eos
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheScanner.eos();`
- **Pure JSDoc:**
```javascript
/**
   * @description Checks if the scanner has reached the end of the input string.
   * @returns {boolean} True if no characters remain in the tail.
   */
```
---
#### METHOD: _MustacheScanner.scan
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheScanner.scan(re);`
- **Pure JSDoc:**
```javascript
/**
   * @description Attempts to match a regular expression at the current position.
   * @param {RegExp} re Regular expression anchored to the start of the tail.
   * @returns {string} The matched string fragment or an empty string if no match.
   */
```
---
#### METHOD: _MustacheScanner.if
- **Scope:** instance
- **LLM Call Syntax:** `_MustacheScanner.if(!match || match.index !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: _MustacheScanner.scanUntil
- **Scope:** instance
- **LLM Call Syntax:** `const result = _MustacheScanner.scanUntil(re);`
- **Pure JSDoc:**
```javascript
/**
   * @description Consumes characters from the tail until the specified pattern is encountered.
   * @param {RegExp} re Regular expression pattern to search for.
   * @returns {string} The captured string content preceding the match.
   */
```
---
#### METHOD: _MustacheScanner.switch
- **Scope:** instance
- **LLM Call Syntax:** `_MustacheScanner.switch(index);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
<br>

## CLASS: _MustacheContext
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new _MustacheContext();`
**Description:** Checks if the scanner has reached the end of the input string.
@returns {boolean} True if no characters remain in the tail.
/
  eos() {
    return this.tail === '';
  }

  /**
Attempts to match a regular expression at the current position.
@param {RegExp} re Regular expression anchored to the start of the tail.
@returns {string} The matched string fragment or an empty string if no match.
/
  scan(re) {
    const match = this.tail.match(re);
    if (!match || match.index !== 0) {
      return '';
    }
    const string = match[0];
    this.tail = this.tail.substring(string.length);
    this.pos += string.length;
    return string;
  }

  /**
Consumes characters from the tail until the specified pattern is encountered.
@param {RegExp} re Regular expression pattern to search for.
@returns {string} The captured string content preceding the match.
/
  scanUntil(re) {
    const index = this.tail.search(re);
    let match;
    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }
    this.pos += match.length;
    return match;
  }
}

/**
Hierarchical context stack for Mustache variable resolution.
Supports parent context navigation ('../') and dot-notation property access.
@private
@class

### Raw JSDoc Context:
```javascript
/**
   * @description Checks if the scanner has reached the end of the input string.
   * @returns {boolean} True if no characters remain in the tail.
   */
  eos() {
    return this.tail === '';
  }

  /**
   * @description Attempts to match a regular expression at the current position.
   * @param {RegExp} re Regular expression anchored to the start of the tail.
   * @returns {string} The matched string fragment or an empty string if no match.
   */
  scan(re) {
    const match = this.tail.match(re);
    if (!match || match.index !== 0) {
      return '';
    }
    const string = match[0];
    this.tail = this.tail.substring(string.length);
    this.pos += string.length;
    return string;
  }

  /**
   * @description Consumes characters from the tail until the specified pattern is encountered.
   * @param {RegExp} re Regular expression pattern to search for.
   * @returns {string} The captured string content preceding the match.
   */
  scanUntil(re) {
    const index = this.tail.search(re);
    let match;
    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }
    this.pos += match.length;
    return match;
  }
}

/**
 * @description Hierarchical context stack for Mustache variable resolution.
 * Supports parent context navigation ('../') and dot-notation property access.
 * @private
 * @class
 */
```

<br>

## CLASS: _FunctionFilterStrategy
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new _FunctionFilterStrategy();`
**Description:** Creates a child context by pushing a new data view onto the stack.
@param {*} view The data object or primitive for the new context level.
@returns {_MustacheContext} A new context instance linked to the current one as parent.
/
  push(view) {
    return new _MustacheContext(view, this);
  }

  /**
Resolves a value by key name across the current and parent contexts.
Supports Handlebars-style '../' navigation and deep property paths.
@param {string} name Identifier or path (e.g., 'user.name', '../title').
@returns {*} Resolved value or undefined.
/
  lookup(name) {
    const cache = this.cache;
    let value;
    if (Object.prototype.hasOwnProperty.call(cache, name)) {
      value = cache[name];
    } else {
      let context = this,
        intermediateValue,
        names,
        index,
        lookupHit = false;

      // Handle parent context navigation (../)
      let parentLevels = 0;
      let remainingName = name;

      // Count how many '../' prefixes exist
      while (remainingName.startsWith('../')) {
        parentLevels++;
        remainingName = remainingName.substring(3); // Remove '../'
      }

      // Traverse up the context stack
      let targetContext = context;
      for (let i = 0; i < parentLevels && targetContext; i++) {
        targetContext = targetContext.parent;
      }

      // If we traversed too far up (no parent exists), return undefined
      if (parentLevels > 0 && !targetContext) {
        value = undefined;
      } else {
        // Start lookup from the target context (could be parent or current)
        context = targetContext || this;

        while (context) {
          if (remainingName.indexOf('.') > 0) {
            intermediateValue = context.view;
            names = remainingName.split('.');
            index = 0;
            while (intermediateValue != null && index < names.length) {
              if (index === names.length - 1) {
                // SEC-006: Use hasOwnProperty to prevent prototype pollution
                lookupHit =
                  intermediateValue != null &&
                  typeof intermediateValue === 'object' &&
                  Object.prototype.hasOwnProperty.call(intermediateValue, names[index]);
              }
              intermediateValue = intermediateValue[names[index++]];
            }
          } else {
            intermediateValue = context.view[remainingName];
            // SEC-006: Use hasOwnProperty to prevent prototype pollution
            lookupHit =
              context.view != null &&
              typeof context.view === 'object' &&
              Object.prototype.hasOwnProperty.call(context.view, remainingName);
          }
          if (lookupHit) {
            value = intermediateValue;
            break;
          }

          // If we explicitly navigated to parent, don't traverse further up
          if (parentLevels > 0) {
            break;
          }

          context = context.parent;
        }
      }

      // SEC-006: Prevent prototype pollution via cache assignment
      if (!this._isDangerousKey(name)) {
        cache[name] = value;
      }
    }
    if (typeof value === 'function') {
      value = value.call(this.view);
    }
    return value;
  }

  /**
Security guard against prototype pollution during context lookups.
@param {string} key Property key to validate.
@returns {boolean} True if the key is restricted ('__proto__', 'constructor', 'prototype').
@private
/
  _isDangerousKey(key) {
    // SEC-006: Prevent prototype pollution
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }
}

/**
Adapter for converting standard functions into FilterStrategy instances.
Enables backward compatibility with functional filter registrations.
@private
@class

### Raw JSDoc Context:
```javascript
/**
   * @description Creates a child context by pushing a new data view onto the stack.
   * @param {*} view The data object or primitive for the new context level.
   * @returns {_MustacheContext} A new context instance linked to the current one as parent.
   */
  push(view) {
    return new _MustacheContext(view, this);
  }

  /**
   * @description Resolves a value by key name across the current and parent contexts.
   * Supports Handlebars-style '../' navigation and deep property paths.
   * @param {string} name Identifier or path (e.g., 'user.name', '../title').
   * @returns {*} Resolved value or undefined.
   */
  lookup(name) {
    const cache = this.cache;
    let value;
    if (Object.prototype.hasOwnProperty.call(cache, name)) {
      value = cache[name];
    } else {
      let context = this,
        intermediateValue,
        names,
        index,
        lookupHit = false;

      // Handle parent context navigation (../)
      let parentLevels = 0;
      let remainingName = name;

      // Count how many '../' prefixes exist
      while (remainingName.startsWith('../')) {
        parentLevels++;
        remainingName = remainingName.substring(3); // Remove '../'
      }

      // Traverse up the context stack
      let targetContext = context;
      for (let i = 0; i < parentLevels && targetContext; i++) {
        targetContext = targetContext.parent;
      }

      // If we traversed too far up (no parent exists), return undefined
      if (parentLevels > 0 && !targetContext) {
        value = undefined;
      } else {
        // Start lookup from the target context (could be parent or current)
        context = targetContext || this;

        while (context) {
          if (remainingName.indexOf('.') > 0) {
            intermediateValue = context.view;
            names = remainingName.split('.');
            index = 0;
            while (intermediateValue != null && index < names.length) {
              if (index === names.length - 1) {
                // SEC-006: Use hasOwnProperty to prevent prototype pollution
                lookupHit =
                  intermediateValue != null &&
                  typeof intermediateValue === 'object' &&
                  Object.prototype.hasOwnProperty.call(intermediateValue, names[index]);
              }
              intermediateValue = intermediateValue[names[index++]];
            }
          } else {
            intermediateValue = context.view[remainingName];
            // SEC-006: Use hasOwnProperty to prevent prototype pollution
            lookupHit =
              context.view != null &&
              typeof context.view === 'object' &&
              Object.prototype.hasOwnProperty.call(context.view, remainingName);
          }
          if (lookupHit) {
            value = intermediateValue;
            break;
          }

          // If we explicitly navigated to parent, don't traverse further up
          if (parentLevels > 0) {
            break;
          }

          context = context.parent;
        }
      }

      // SEC-006: Prevent prototype pollution via cache assignment
      if (!this._isDangerousKey(name)) {
        cache[name] = value;
      }
    }
    if (typeof value === 'function') {
      value = value.call(this.view);
    }
    return value;
  }

  /**
   * @description Security guard against prototype pollution during context lookups.
   * @param {string} key Property key to validate.
   * @returns {boolean} True if the key is restricted ('__proto__', 'constructor', 'prototype').
   * @private
   */
  _isDangerousKey(key) {
    // SEC-006: Prevent prototype pollution
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }
}

/**
 * @description Adapter for converting standard functions into FilterStrategy instances.
 * Enables backward compatibility with functional filter registrations.
 * @private
 * @class
 */
```

<br>

## CLASS: MyMustache
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new MyMustache();`
**Description:** Advanced Mustache engine with Handlebars meta-variables (@index, @first) and Liquid-style filters.
Implements template caching, prototype pollution protection, and Strategy-based filter registry.
@class

@example
const mustache = new MyMustache({ logger: console });
const result = mustache.render('{{items | join:", "}}', { items: [1, 2, 3] });

### Raw JSDoc Context:
```javascript
/**
 * @description Advanced Mustache engine with Handlebars meta-variables (@index, @first) and Liquid-style filters.
 * Implements template caching, prototype pollution protection, and Strategy-based filter registry.
 * @class
 * @version 2.1.0
 * @example
 * const mustache = new MyMustache({ logger: console });
 * const result = mustache.render('{{items | join:", "}}', { items: [1, 2, 3] });
 */
```

<br>

## CLASS: extending
**File Path:** `WorkspaceTemplateEngine/src/facades/Mustache.js`
**Constructor Usage:** `const instance = new extending();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

<br>

