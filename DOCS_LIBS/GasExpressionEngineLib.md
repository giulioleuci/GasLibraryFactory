# API Reference: GasExpressionEngineLib

## CLASS: ExpressionParserService
**File Path:** `GasExpressionEngineLib/src/ExpressionParserService.ts`
**Constructor Usage:** `const instance = new ExpressionParserService();`
**Description:** Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.

### Raw JSDoc Context:
```javascript
/**
 * Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.
 * @class
 */
```

### Methods and properties of ExpressionParserService

#### PROPERTY: ExpressionParserService.di
- **Scope:** static
- **LLM Call Syntax:** `const result = ExpressionParserService.di;`
- **Pure JSDoc:**
```javascript
/**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
```
---
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
#### METHOD: ExpressionParserService._preprocess
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionParserService._preprocess(expressionString);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates the normalization of expression syntax, converting {{placeholders}}, numeric paths, and special operators into JSEP-compatible tokens.
   * @param {string} expressionString raw logic template.
   * @returns {string} preprocessed expression string.
   * @private
   */
```
---
#### METHOD: ExpressionParserService._convertNumericPathSegments
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionParserService._convertNumericPathSegments(expression);`
- **Pure JSDoc:**
```javascript
/**
   * Transforms dot-notation numeric segments into bracketed array accessors (e.g., 'items.0' -> 'items[0]').
   * @private
   * @param {string} expression Logic template fragment.
   * @returns {string} Normalized fragment.
   */
```
---
#### METHOD: ExpressionParserService._convertPlaceholders
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionParserService._convertPlaceholders(expression);`
- **Pure JSDoc:**
```javascript
/**
   * Strips Mustache-style {{ }} delimiters from identifiers, iteratively resolving nested occurrences.
   * @private
   * @param {string} expression Logic template fragment.
   * @returns {string} Delimiter-free identifiers.
   */
```
---
#### METHOD: ExpressionParserService._convertBetweenOperator
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionParserService._convertBetweenOperator(expression);`
- **Pure JSDoc:**
```javascript
/**
   * Rewrites 'between' keyword syntax into functional call notation (e.g., 'x between y, z' -> 'between(x, y, z)').
   * @private
   * @param {string} expression Logic template fragment.
   * @returns {string} Normalized functional logic.
   */
```
---
#### METHOD: ExpressionParserService._configureJSEP
- **Scope:** instance
- **LLM Call Syntax:** `expressionParserService._configureJSEP();`
- **Pure JSDoc:**
```javascript
/**
   * Extends JSEP grammar with domain-specific binary operators (in, match).
   * @private
   */
```
---
#### METHOD: ExpressionParserService._buildAst
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionParserService._buildAst(preprocessedExpression);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a structured Abstract Syntax Tree from a normalized expression string using JSEP.
   * @param {string} preprocessedExpression Normalized logic template.
   * @returns {Object} Structured JSEP AST.
   * @throws {Error} If the expression violates JSEP grammar rules.
   * @private
   */
```
---
<br>

## CLASS: ExpressionEvaluatorService
**File Path:** `GasExpressionEngineLib/src/ExpressionEvaluatorService.ts`
**Constructor Usage:** `const instance = new ExpressionEvaluatorService();`
**Description:** Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.

### Raw JSDoc Context:
```javascript
/**
 * Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.
 * @class
 */
```

### Methods and properties of ExpressionEvaluatorService

#### PROPERTY: ExpressionEvaluatorService.di
- **Scope:** static
- **LLM Call Syntax:** `const result = ExpressionEvaluatorService.di;`
- **Pure JSDoc:**
```javascript
/**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
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
- **LLM Call Syntax:** `const result = expressionEvaluatorService._areBothNullOrUndefined(a, b);`
- **Pure JSDoc:**
```javascript
/**
   * Checks if both values are null or undefined.
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} True if both values are null or undefined
   * @private
   */
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
#### METHOD: ExpressionEvaluatorService._parseValue
- **Scope:** instance
- **LLM Call Syntax:** `expressionEvaluatorService._parseValue();`
- **Pure JSDoc:**
```javascript
/** @private */
```
---
#### PROPERTY: ExpressionEvaluatorService._builtInFunctions
- **Scope:** instance
- **LLM Call Syntax:** `const result = expressionEvaluatorService._builtInFunctions;`
- **Pure JSDoc:**
```javascript
/**
   * Built-in expression functions (string, numeric, array), assembled from
   * per-family modules under ./internal/builtins/ (GEL-HIGH-001).
   * @returns {Object<string, Function>} Map of function name to implementation.
   * @private
   */
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
- **LLM Call Syntax:** `const result = expressionEvaluatorService._compare(a, b);`
- **Pure JSDoc:**
```javascript
/**
   * Compares two values with STRICT type checking.
   *
   * Returns: -1 if a < b, 0 if a == b, 1 if a > b
   *
   * STRICT MODE BEHAVIOR (enforced for reliability):
   * - Requires both operands to be of the same type
   * - Throws an error if types don't match (except null/undefined)
   * - No implicit type coercion or string conversion
   *
   * The comparison logic handles:
   * - null/undefined values
   * - Numeric comparisons (numbers only)
   * - String comparisons (strings only, case-sensitive)
   * - Boolean comparisons (booleans only)
   * - Date comparisons (dates only)
   *
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {number} Comparison result
   * @throws {Error} If operand types don't match
   * @private
   */
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
**File Path:** `GasExpressionEngineLib/src/ExpressionEngineService.ts`
**Constructor Usage:** `const instance = new ExpressionEngineService();`
**Description:** Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.

### Raw JSDoc Context:
```javascript
/**
 * Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.
 * @class
 */
```

### Methods and properties of ExpressionEngineService

#### PROPERTY: ExpressionEngineService.di
- **Scope:** static
- **LLM Call Syntax:** `const result = ExpressionEngineService.di;`
- **Pure JSDoc:**
```javascript
/**
   * Dependency injection configuration (for DI containers)
   * @returns {Object} DI configuration
   */
```
---
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
<br>

## GLOBAL FUNCTIONS

### FUNCTION: assertAllowedExpressionAst
- **Source:** `GasExpressionEngineLib/src/internal/ExpressionPolicy.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/StringFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/NumericFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/BuiltInFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.ts`
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
- **Source:** `GasExpressionEngineLib/src/internal/builtins/ArrayFunctions.ts`
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
