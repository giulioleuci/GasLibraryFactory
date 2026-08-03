# API Reference: GasExpressionEngineLib

## CLASS: ExpressionParserService
**File Path:** `GasExpressionEngineLib/src/ExpressionParserService.js`
**Constructor Usage:** `const instance = new ExpressionParserService(logger);`
**Description:** Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.

### Raw JSDoc Context:
```javascript
/**
 * Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.
 * @class
 */
```

### Methods of ExpressionParserService

#### METHOD: ExpressionParserService.parse
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionParserService.parse(expressionString);`
- **Pure JSDoc:**
```javascript
/**
   * Transforms an expression string into a structured JSEP AST, including placeholder preprocessing and security limit enforcement.
   * @param {string} expressionString raw logic template.
   * @returns {Object} Structured AST representation.
   * @throws {Error} If expression is empty, exceeds 10,000 characters, or contains syntax errors.
   */
```
---
#### METHOD: ExpressionParserService._configureJSEP
- **Scope:** instance
- **LLM Call Syntax:** `expressionParserService._configureJSEP();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
#### METHOD: ExpressionParserService._convertNumericPathSegments
- **Scope:** instance
- **LLM Call Syntax:** `expressionParserService._convertNumericPathSegments();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
#### METHOD: ExpressionParserService._convertPlaceholders
- **Scope:** instance
- **LLM Call Syntax:** `expressionParserService._convertPlaceholders();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
#### METHOD: ExpressionParserService._convertBetweenOperator
- **Scope:** instance
- **LLM Call Syntax:** `expressionParserService._convertBetweenOperator();`
- **Pure JSDoc:**
```javascript
/**
   * @private
   */
```
---
<br>

## CLASS: ExpressionEvaluatorService
**File Path:** `GasExpressionEngineLib/src/ExpressionEvaluatorService.js`
**Constructor Usage:** `const instance = new ExpressionEvaluatorService(logger, parserService, placeholderService);`
**Description:** Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.

### Raw JSDoc Context:
```javascript
/**
 * Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.
 * @class
 */
```

### Methods of ExpressionEvaluatorService

#### METHOD: ExpressionEvaluatorService._evaluateNode
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateNode();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._evaluateIdentifier
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateIdentifier();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._evaluateMemberExpression
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateMemberExpression();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._buildPathFromMemberExpression
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._buildPathFromMemberExpression();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._evaluateLiteral
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateLiteral();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._evaluateArrayExpression
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateArrayExpression();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._evaluateCallExpression
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateCallExpression();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._areBothNullOrUndefined
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._areBothNullOrUndefined();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._hasCircularReference
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._hasCircularReference();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService.evaluate
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService.evaluate();`
- **Pure JSDoc:**
```javascript
/** @description Evaluates an expression string against a context. */
```
---
#### METHOD: ExpressionEvaluatorService.evaluateAst
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService.evaluateAst();`
- **Pure JSDoc:**
```javascript
/** @description Evaluates a pre-parsed AST against a context. */
```
---
#### METHOD: ExpressionEvaluatorService._parseValue
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._parseValue();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._evaluateLogicalExpression
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateLogicalExpression();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._evaluateBinaryExpression
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateBinaryExpression();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._evaluateUnaryExpression
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._evaluateUnaryExpression();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._compare
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._compare();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### METHOD: ExpressionEvaluatorService._equals
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._equals();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
<br>

## CLASS: ExpressionEngineService
**File Path:** `GasExpressionEngineLib/src/ExpressionEngineService.js`
**Constructor Usage:** `const instance = new ExpressionEngineService(options, options.logger, options.utils, options.cache);`
**Description:** Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.

### Raw JSDoc Context:
```javascript
/**
 * Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.
 * @class
 */
```

### Methods of ExpressionEngineService

#### METHOD: ExpressionEngineService._initializeServices
- **Scope:** instance
- **LLM Call Syntax:** `expressionEngineService._initializeServices();`
- **Pure JSDoc:**
```javascript
/**
   * Configures internal dependency chain including parser, template engine, and evaluator.
   * @private
   */
```
---
#### METHOD: ExpressionEngineService.evaluate
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionEngineService.evaluate(expressionString, context);`
- **Pure JSDoc:**
```javascript
/**
   * Executes a string-based logical expression against a data context, returning a boolean outcome.
   * @param {string} expressionString Logic template with optional {{placeholders}}.
   * @param {Object} [context={}] Data context for attribute resolution.
   * @returns {boolean} Outcome of the logical evaluation.
   * @throws {Error} If expression syntax is invalid or evaluation fails.
   */
```
---
#### METHOD: ExpressionEngineService.parse
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionEngineService.parse(expressionString);`
- **Pure JSDoc:**
```javascript
/**
   * Transforms an expression string into a structured Abstract Syntax Tree (AST) for deferred evaluation.
   * @param {string} expressionString Logic template.
   * @returns {Object} Structured AST representation.
   * @throws {Error} On syntax or tokenization failures.
   */
```
---
#### METHOD: ExpressionEngineService.getInfo
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionEngineService.getInfo();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves library classification and version metadata.
   * @returns {Object} Library identity.
   */
```
---
#### METHOD: ExpressionEngineService.getCacheStats
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionEngineService.getCacheStats();`
- **Pure JSDoc:**
```javascript
/**
   * Gets AST cache statistics for monitoring and debugging.
   *
   * @returns {Object} Cache statistics containing:
   *   - size {number} - Current number of cached ASTs
   *   - enabled {boolean} - Whether caching is enabled
   *   - maxSize {number} - Maximum cache size (1000 entries)
   */
```
---
#### METHOD: ExpressionEngineService.clearCache
- **Scope:** instance
- **LLM Call Syntax:** `expressionEngineService.clearCache();`
- **Pure JSDoc:**
```javascript
/**
   * Clears the AST cache.
   */
```
---
#### METHOD: ExpressionEngineService.setCacheEnabled
- **Scope:** instance
- **LLM Call Syntax:** `expressionEngineService.setCacheEnabled(enabled);`
- **Pure JSDoc:**
```javascript
/**
   * Enables or disables AST caching.
   *
   * @param {boolean} enabled - Whether to enable caching
   * @throws {Error} If enabled is not a boolean
   */
```
---
<br>

## CLASS: AstBuilder
**File Path:** `GasExpressionEngineLib/src/internal/parser/AstBuilder.js`
**Constructor Usage:** `const instance = new AstBuilder(logger);`
**Description:** Initializes the builder and applies JSEP custom operator configurations.

### Raw JSDoc Context:
```javascript
/**
   * Initializes the builder and applies JSEP custom operator configurations.
   * @param {Object} logger Diagnostic output interface.
   */
```

### Methods of AstBuilder

#### METHOD: AstBuilder._configureJSEP
- **Scope:** instance
- **LLM Call Syntax:** `astBuilder._configureJSEP();`
- **Pure JSDoc:**
```javascript
/**
   * Extends JSEP grammar with domain-specific binary operators (in, match).
   * @private
   */
```
---
#### METHOD: AstBuilder.buildAst
- **Scope:** instance
- **LLM Call Syntax:** `const result = astBuilder.buildAst(preprocessedExpression);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a structured Abstract Syntax Tree from a normalized expression string using JSEP.
   * @param {string} preprocessedExpression Normalized logic template.
   * @returns {Object} Structured JSEP AST.
   * @throws {Error} If the expression violates JSEP grammar rules.
   */
```
---
<br>

## CLASS: ErrorHelper
**File Path:** `GasExpressionEngineLib/src/handlers/ErrorHelper.js`
**Constructor Usage:** `const instance = new ErrorHelper();`
**Description:** Static factory for standardized error object generation, enforcing consistent diagnostic message patterns across the expression engine.

### Raw JSDoc Context:
```javascript
/**
 * Static factory for standardized error object generation, enforcing consistent diagnostic message patterns across the expression engine.
 * @class
 */
```

### Methods of ErrorHelper

#### METHOD: ErrorHelper.create
- **Scope:** static
- **LLM Call Syntax:** `const result = ErrorHelper.create(component, errorType, details);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a basic structured error with component and type classification.
   * @param {string} component Name of the failing module.
   * @param {string} errorType Classification of the failure.
   * @param {string} [details] Optional explanatory metadata.
   * @returns {Error} Formatted Error instance.
   */
```
---
#### METHOD: ErrorHelper.createWithPosition
- **Scope:** static
- **LLM Call Syntax:** `const result = ErrorHelper.createWithPosition(component, errorType, value, position);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a parsing error including the problematic value and its source offset.
   * @param {string} component Name of the failing module.
   * @param {string} errorType Classification of the failure.
   * @param {string|number} value The literal token that triggered the error.
   * @param {number} position Zero-based source character offset.
   * @returns {Error} Formatted Error instance.
   */
```
---
#### METHOD: ErrorHelper.createValidation
- **Scope:** static
- **LLM Call Syntax:** `const result = ErrorHelper.createValidation(component, paramName, expectedType);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a parameter validation error specifying the expected contract.
   * @param {string} component Name of the failing module.
   * @param {string} paramName Identifier of the malformed argument.
   * @param {string} expectedType Description of the required type or interface.
   * @returns {Error} Formatted Error instance.
   */
```
---
#### METHOD: ErrorHelper.createUnsupported
- **Scope:** static
- **LLM Call Syntax:** `const result = ErrorHelper.createUnsupported(component, operation, value);`
- **Pure JSDoc:**
```javascript
/**
   * Generates an error for operations or tokens that lack a corresponding engine implementation.
   * @param {string} component Name of the failing module.
   * @param {string} operation Identifier of the requested logic.
   * @param {string} value The specific value that is unsupported.
   * @returns {Error} Formatted Error instance.
   */
```
---
#### METHOD: ErrorHelper.createLimitExceeded
- **Scope:** static
- **LLM Call Syntax:** `const result = ErrorHelper.createLimitExceeded(component, limitType, actual, max);`
- **Pure JSDoc:**
```javascript
/**
   * Generates an error when a numeric threshold (e.g., recursion depth, string length) is violated.
   * @param {string} component Name of the failing module.
   * @param {string} limitType Description of the threshold category.
   * @param {number} actual The observed runtime value.
   * @param {number} max The strictly enforced maximum limit.
   * @returns {Error} Formatted Error instance.
   */
```
---
<br>

## GLOBAL FUNCTIONS

### FUNCTION: assertAllowedExpressionAst
- **Source:** `GasExpressionEngineLib/src/internal/ExpressionPolicy.js`
- **LLM Call Syntax:** `assertAllowedExpressionAst(ast, policy);`
- **Pure JSDoc:**
```javascript
/**
 * Ensures an AST can be evaluated by ExpressionEvaluatorService without
 * granting JavaScript object traversal or arbitrary function invocation.
 *
 * @param {Object} ast JSEP AST returned by ExpressionParserService.
 * @param {Object} [policy=defaultPolicy] Explicit AST allow-list.
 * @throws {Error} When a node, operator, member, or call is not allowed.
 */
```

---
### FUNCTION: createStringFunctions
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.js`
- **LLM Call Syntax:** `const result = createStringFunctions();`
- **Pure JSDoc:**
```javascript
/**
 * Builds the string built-in functions map.
 * @returns {Object<string, Function>} Map of string function name to implementation.
 */
```

---
### FUNCTION: len
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.js`
- **LLM Call Syntax:** `const result = len(str);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the length of a string.
     *
     * @param {*} str - The string to measure (converted to string if not already)
     * @returns {number} The length of the string, or 0 if null/undefined
     *
     * @example
     * len('hello') // Returns: 5
     * len({{name}}) // Returns length of name value
     * len(null) // Returns: 0
     */
```

---
### FUNCTION: upper
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.js`
- **LLM Call Syntax:** `const result = upper(str);`
- **Pure JSDoc:**
```javascript
/**
     * Converts a string to uppercase.
     *
     * @param {*} str - The string to convert (converted to string if not already)
     * @returns {string} The uppercase string, or empty string if null/undefined
     *
     * @example
     * upper('hello') // Returns: 'HELLO'
     * upper({{status}}) // Returns uppercase status value
     * upper(null) // Returns: ''
     */
```

---
### FUNCTION: lower
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.js`
- **LLM Call Syntax:** `const result = lower(str);`
- **Pure JSDoc:**
```javascript
/**
     * Converts a string to lowercase.
     *
     * @param {*} str - The string to convert (converted to string if not already)
     * @returns {string} The lowercase string, or empty string if null/undefined
     *
     * @example
     * lower('HELLO') // Returns: 'hello'
     * lower({{name}}) // Returns lowercase name value
     * lower(null) // Returns: ''
     */
```

---
### FUNCTION: trim
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.js`
- **LLM Call Syntax:** `const result = trim(str);`
- **Pure JSDoc:**
```javascript
/**
     * Trims whitespace from both ends of a string.
     *
     * @param {*} str - The string to trim (converted to string if not already)
     * @returns {string} The trimmed string, or empty string if null/undefined
     *
     * @example
     * trim('  hello  ') // Returns: 'hello'
     * trim({{input}}) // Returns trimmed input value
     * trim(null) // Returns: ''
     */
```

---
### FUNCTION: substring
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.js`
- **LLM Call Syntax:** `const result = substring(str, start, end);`
- **Pure JSDoc:**
```javascript
/**
     * Extracts a substring from start index to end index (exclusive).
     *
     * @param {*} str - The source string (converted to string if not already)
     * @param {number} start - The starting index (0-based, inclusive)
     * @param {number} [end] - The ending index (0-based, exclusive). If omitted, extracts to end of string.
     * @returns {string} The extracted substring, or empty string if str is null/undefined
     *
     * @example
     * substring('hello', 0, 3) // Returns: 'hel'
     * substring('hello', 2) // Returns: 'llo'
     * substring({{name}}, 0, 5) // Returns first 5 characters of name
     */
```

---
### FUNCTION: replace
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.js`
- **LLM Call Syntax:** `const result = replace(str, search, replacement);`
- **Pure JSDoc:**
```javascript
/**
     * Replaces all occurrences of a substring with another string.
     *
     * Uses global regex replacement to replace all occurrences.
     *
     * @param {*} str - The source string (converted to string if not already)
     * @param {*} search - The substring to search for (converted to string, treated as literal)
     * @param {*} replacement - The replacement string (converted to string)
     * @returns {string} The string with all replacements made, or original string if search is null
     *
     * @example
     * replace('hello world', 'o', '0') // Returns: 'hell0 w0rld'
     * replace({{text}}, 'old', 'new') // Replaces all 'old' with 'new'
     * replace('test', null, 'x') // Returns: 'test' (no replacement)
     */
```

---
### FUNCTION: split
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.js`
- **LLM Call Syntax:** `const result = split(str, delimiter);`
- **Pure JSDoc:**
```javascript
/**
     * Splits a string by a delimiter into an array.
     *
     * @param {*} str - The source string (converted to string if not already)
     * @param {*} delimiter - The delimiter to split on (converted to string). If empty string, splits into individual characters.
     * @returns {Array<string>} Array of substrings, or empty array if str is null/undefined
     *
     * @example
     * split('a,b,c', ',') // Returns: ['a', 'b', 'c']
     * split('hello', '') // Returns: ['h', 'e', 'l', 'l', 'o']
     * split({{csv}}, ',') // Splits CSV value into array
     */
```

---
### FUNCTION: createNumericFunctions
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = createNumericFunctions();`
- **Pure JSDoc:**
```javascript
/**
 * Builds the numeric built-in functions map.
 * @returns {Object<string, Function>} Map of numeric function name to implementation.
 */
```

---
### FUNCTION: abs
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = abs(num);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the absolute value of a number.
     *
     * @param {number} num - The number to process
     * @returns {number} The absolute value of the number
     * @throws {Error} If num is not a valid number
     *
     * @example
     * abs(-5) // Returns: 5
     * abs(3.14) // Returns: 3.14
     * abs({{temperature}}) // Returns absolute value of temperature
     */
```

---
### FUNCTION: round
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = round(num, decimals);`
- **Pure JSDoc:**
```javascript
/**
     * Rounds a number to the nearest integer or specified decimal places.
     *
     * @param {number} num - The number to round
     * @param {number} [decimals] - The number of decimal places (optional). If omitted, rounds to nearest integer.
     * @returns {number} The rounded number
     * @throws {Error} If num is not a valid number
     *
     * @example
     * round(3.7) // Returns: 4
     * round(3.14159, 2) // Returns: 3.14
     * round({{price}}, 2) // Rounds price to 2 decimal places
     */
```

---
### FUNCTION: ceil
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = ceil(num);`
- **Pure JSDoc:**
```javascript
/**
     * Rounds a number up to the nearest integer.
     *
     * @param {number} num - The number to round up
     * @returns {number} The smallest integer greater than or equal to num
     * @throws {Error} If num is not a valid number
     *
     * @example
     * ceil(3.1) // Returns: 4
     * ceil(-1.5) // Returns: -1
     * ceil({{value}}) // Rounds value up to nearest integer
     */
```

---
### FUNCTION: floor
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = floor(num);`
- **Pure JSDoc:**
```javascript
/**
     * Rounds a number down to the nearest integer.
     *
     * @param {number} num - The number to round down
     * @returns {number} The largest integer less than or equal to num
     * @throws {Error} If num is not a valid number
     *
     * @example
     * floor(3.9) // Returns: 3
     * floor(-1.5) // Returns: -2
     * floor({{value}}) // Rounds value down to nearest integer
     */
```

---
### FUNCTION: min
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = min(numbers);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the minimum of provided numbers.
     *
     * Non-number values are filtered out before comparison.
     *
     * @param {...number} numbers - Variable number of numeric arguments
     * @returns {number|null} The smallest number, or null if no arguments provided
     * @throws {Error} If no valid numbers are provided
     *
     * @example
     * min(5, 3, 8) // Returns: 3
     * min({{a}}, {{b}}, {{c}}) // Returns smallest of a, b, c
     * min() // Returns: null
     */
```

---
### FUNCTION: max
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = max(numbers);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the maximum of provided numbers.
     *
     * Non-number values are filtered out before comparison.
     *
     * @param {...number} numbers - Variable number of numeric arguments
     * @returns {number|null} The largest number, or null if no arguments provided
     * @throws {Error} If no valid numbers are provided
     *
     * @example
     * max(5, 3, 8) // Returns: 8
     * max({{a}}, {{b}}, {{c}}) // Returns largest of a, b, c
     * max() // Returns: null
     */
```

---
### FUNCTION: sqrt
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = sqrt(num);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the square root of a number.
     *
     * @param {number} num - The number (must be non-negative)
     * @returns {number} The square root of the number
     * @throws {Error} If num is not a valid non-negative number
     *
     * @example
     * sqrt(9) // Returns: 3
     * sqrt(2) // Returns: 1.4142135623730951
     * sqrt({{area}}) // Returns square root of area
     */
```

---
### FUNCTION: pow
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = pow(base, exponent);`
- **Pure JSDoc:**
```javascript
/**
     * Returns base raised to the power of exponent.
     *
     * @param {number} base - The base number
     * @param {number} exponent - The exponent
     * @returns {number} The result of base^exponent
     * @throws {Error} If base or exponent is not a valid number
     *
     * @example
     * pow(2, 3) // Returns: 8
     * pow(10, 2) // Returns: 100
     * pow({{base}}, {{exp}}) // Returns base to the power of exp
     */
```

---
### FUNCTION: between
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.js`
- **LLM Call Syntax:** `const result = between(value, min, max);`
- **Pure JSDoc:**
```javascript
/**
     * Checks if a value falls within a range (inclusive).
     *
     * This function is used internally for the 'between' operator.
     *
     * @param {number} value - The value to check
     * @param {number} min - The minimum value (inclusive)
     * @param {number} max - The maximum value (inclusive)
     * @returns {boolean} True if value is between min and max (inclusive)
     * @throws {Error} If any argument is not a valid number
     *
     * @example
     * between(5, 1, 10) // Returns: true
     * between(0, 1, 10) // Returns: false
     * between({{age}}, 18, 65) // Returns true if age is 18-65
     */
```

---
### FUNCTION: createBuiltInFunctions
- **Source:** `GasExpressionEngineLib/src/internal/builtins/BuiltInFunctions.js`
- **LLM Call Syntax:** `const result = createBuiltInFunctions(evaluator);`
- **Pure JSDoc:**
```javascript
/**
 * Builds the complete map of built-in expression functions (string, numeric,
 * array) exposed to expression call-expressions (e.g. `len(x)`, `between(...)`).
 *
 * @param {ExpressionEvaluatorService} evaluator - The evaluator instance, forwarded
 *   to families (e.g. array functions) that need access to sibling methods like `_equals`.
 * @returns {Object<string, Function>} Map of function name to implementation.
 */
```

---
### FUNCTION: createArrayFunctions
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.js`
- **LLM Call Syntax:** `const result = createArrayFunctions(evaluator);`
- **Pure JSDoc:**
```javascript
/**
 * Builds the array built-in functions map.
 *
 * `contains` and `indexOf` delegate equality checks to the owning
 * ExpressionEvaluatorService's `_equals` (strict, type-aware equality), so
 * this factory requires the evaluator instance rather than being a
 * standalone pure module like StringFunctions/NumericFunctions.
 *
 * @param {ExpressionEvaluatorService} evaluator - The evaluator instance providing `_equals`.
 * @returns {Object<string, Function>} Map of array function name to implementation.
 */
```

---
### FUNCTION: length
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.js`
- **LLM Call Syntax:** `const result = length(arr);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the length of an array or string.
     *
     * @param {Array|string|*} arr - The array or string to measure (non-arrays converted to string)
     * @returns {number} The length of the array/string, or 0 if null/undefined
     *
     * @example
     * length([1, 2, 3]) // Returns: 3
     * length('hello') // Returns: 5
     * length({{items}}) // Returns length of items array
     */
```

---
### FUNCTION: contains
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.js`
- **LLM Call Syntax:** `const result = contains(arr, value);`
- **Pure JSDoc:**
```javascript
/**
     * Checks if an array contains a value using strict equality.
     *
     * @param {Array} arr - The array to search
     * @param {*} value - The value to find
     * @returns {boolean} True if the array contains the value, false otherwise
     *
     * @example
     * contains([1, 2, 3], 2) // Returns: true
     * contains(['a', 'b'], 'c') // Returns: false
     * contains({{roles}}, 'admin') // Returns true if roles contains 'admin'
     */
```

---
### FUNCTION: indexOf
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.js`
- **LLM Call Syntax:** `const result = indexOf(arr, value);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the index of a value in an array, or -1 if not found.
     *
     * Uses strict equality for comparison.
     *
     * @param {Array} arr - The array to search
     * @param {*} value - The value to find
     * @returns {number} The index of the value (0-based), or -1 if not found
     *
     * @example
     * indexOf([1, 2, 3], 2) // Returns: 1
     * indexOf(['a', 'b'], 'c') // Returns: -1
     * indexOf({{items}}, {{target}}) // Returns index of target in items
     */
```

---
### FUNCTION: first
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.js`
- **LLM Call Syntax:** `const result = first(arr);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the first element of an array.
     *
     * @param {Array} arr - The array
     * @returns {*|null} The first element, or null if array is empty/null/not an array
     *
     * @example
     * first([1, 2, 3]) // Returns: 1
     * first([]) // Returns: null
     * first({{items}}) // Returns first item in items array
     */
```

---
### FUNCTION: last
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.js`
- **LLM Call Syntax:** `const result = last(arr);`
- **Pure JSDoc:**
```javascript
/**
     * Returns the last element of an array.
     *
     * @param {Array} arr - The array
     * @returns {*|null} The last element, or null if array is empty/null/not an array
     *
     * @example
     * last([1, 2, 3]) // Returns: 3
     * last([]) // Returns: null
     * last({{items}}) // Returns last item in items array
     */
```

---
