# GasExpressionEngineLib

**Version:** 1.0.0
**Layer:** Domain Logic (Layer 2)  
**Dependencies:** CoreUtilsLib  
**External Libraries:** jsep (JavaScript Expression Parser)

## 🏗️ File and Folder Structure

The engine is split into three distinct phases to maximize performance and maintainability:

```text
GasExpressionEngineLib/
├── src/
│   ├── ExpressionEngineService.js    # Main facade: coordinates parsing and evaluation
│   ├── ExpressionParserService.js    # Pre-processes strings and generates JSEP AST
│   ├── ExpressionEvaluatorService.js # Recursively traverses and evaluates the AST
│   ├── ErrorHelper.js                # Standardized error reporting for syntax/runtime
│   └── __tests__/                    # Extensive unit and AST integration tests
```

## 🧩 Programming Patterns

1.  **Interpreter Pattern**: This is the core pattern. The library defines an Abstract Syntax Tree (AST) and includes an evaluator that traverses this tree to "interpret" the expression against a data context.
2.  **Parser Pattern**: Leverages `jsep` to implement a recursive descent parser that converts string literals into structured token trees.
3.  **Strategy Pattern**: Operators (`in`, `match`, `==`) and built-in functions (`len`, `max`, `abs`) are implemented as interchangeable strategies within the evaluator.
4.  **Flyweight / Caching Pattern**: To avoid the high cost of parsing, the engine caches compiled ASTs. If the same expression string is seen again, the cached AST is reused, sharing the "heavy" object across multiple evaluations.
5.  **Facade Pattern**: `ExpressionEngineService` provides a simple `.evaluate()` method, shielding the user from the complexities of AST nodes and context resolution.

## 🧠 Overview

**GasExpressionEngineLib** is a sophisticated engine for parsing and evaluating dynamic business logic expressions within Google Apps Script. It allows applications to evaluate complex conditions defined as strings (e.g., in configuration files or spreadsheets) against runtime data.

Unlike simple `eval()` (which is insecure and often blocked), this library uses a proper **Abstract Syntax Tree (AST)** parser based on **[jsep](https://github.com/EricSmekens/jsep)** - a lightweight JavaScript expression parser. It safely tokenizes expressions and evaluates them against a context, supporting variable substitution via `WorkspaceTemplateEngine`.

## 🔧 External Dependencies

This library uses **jsep** (^1.4.0) - A lightweight, standards-compliant JavaScript expression parser that safely converts expression strings into Abstract Syntax Trees (AST) without using `eval()`. This enables secure expression evaluation with custom operator support.

## ✨ Key Features

- **AST-Based Evaluation**: Parses expressions into a syntax tree for safe, side-effect-free evaluation (powered by **jsep**).
- **Advanced Operators**: Supports standard comparison (`==`, `!=`, `>`, `<`) plus domain-specific operators:
  - `in`: Array membership check (`{{role}} in ['admin', 'editor']`).
  - `between`: Range check (`{{age}} between 18, 65`).
  - `match`: Regex matching (`{{code}} match '^[A-Z]{3}$'`).
- **Built-in Functions**: Includes a standard library of functions like `len()`, `upper()`, `min()`, `max()`, `round()`, etc.
- **Performance Caching**: Parsed ASTs are cached in memory. Repeated evaluation of the same expression string (even with different data) incurs zero parsing overhead.
- **Security**:
  - No `eval()` usage.
  - ReDoS protection for regex operations via `CoreUtilsLib`.
  - Prototype pollution protection during context lookup.

## 📦 Installation

```javascript
import { ExpressionEngineService } from '@GasExpressionEngineLib';
import { LoggerService } from '@GoogleApiWrapper';
```

## 🚀 Quick Start

```javascript
// 1. Initialize
const logger = new LoggerService();
const engine = new ExpressionEngineService({ logger });

// 2. Define Context
const context = {
  user: {
    age: 25,
    role: 'editor',
    stats: { logins: 5 }
  },
  settings: {
    minAge: 18
  }
};

// 3. Evaluate Expressions
const isAdult = engine.evaluate('{{user.age}} >= {{settings.minAge}}', context);
// true

const isEligible = engine.evaluate(
  "{{user.role}} in ['admin', 'editor'] && {{user.stats.logins}} > 0",
  context
);
// true
```

## 📚 Syntax Guide

### 1. Variables & Placeholders

Variables are accessed using Mustache-style syntax `{{path.to.value}}`. These are resolved using `WorkspaceTemplateEngine` before evaluation.

### 2. Operators

| Operator             | Description         | Example                           |
| :------------------- | :------------------ | :-------------------------------- | -------------------- | ----------------- |
| `==`, `!=`           | Equality/Inequality | `{{status}} == 'active'`          |
| `>`, `<`, `>=`, `<=` | Comparison          | `{{count}} > 10`                  |
| `&&`, `              |                     | `, `!`                            | Logical AND, OR, NOT | `{{a}} && !{{b}}` |
| `in`                 | Array Membership    | `{{type}} in ['A', 'B']`          |
| `between`            | Inclusive Range     | `{{score}} between 0, 100`        |
| `match`              | Regex Match         | `{{email}} match '@gmail\\.com$'` |

### 3. Built-in Functions

The engine supports Excel-like functions within expressions:

**String Functions:**

- `len(str)`: Length of string.
- `upper(str)`, `lower(str)`: Case conversion.
- `trim(str)`: Removes whitespace.
- `substring(str, start, end)`: Extracts substring.
- `contains(arr, val)`: Checks if array/string contains value.

**Numeric Functions:**

- `abs(num)`: Absolute value.
- `round(num, decimals)`: Rounding.
- `ceil(num)`, `floor(num)`: Ceiling/Floor.
- `min(n1, n2, ...)`, `max(n1, n2, ...)`: Min/Max values.
- `sqrt(num)`, `pow(base, exp)`: Math operations.

**Example:**

```javascript
engine.evaluate('len({{username}}) > 5 && max({{score1}}, {{score2}}) >= 50', data);
```

## ⚙️ Architecture

1.  **Parsing Phase (`ExpressionParserService`)**:
    - The expression string is pre-processed to convert `{{placeholders}}` into valid identifiers.
    - Custom operators (`between`) are transformed into function calls.
    - JSEP parses the string into an AST.
2.  **Caching**:
    - The resulting AST is stored in `_astCache`. Subsequent calls skip Phase 1.
3.  **Evaluation Phase (`ExpressionEvaluatorService`)**:
    - The AST is traversed recursively.
    - When an Identifier node is encountered, `PlaceholderService` resolves the value from the context.
    - Operators and functions are executed against the resolved values.

## 🧪 Testing

Unit tests verify operator precedence, function logic, and error handling.

```bash
npm test GasExpressionEngineLib
```
