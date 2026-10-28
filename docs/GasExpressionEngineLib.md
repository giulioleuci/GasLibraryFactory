# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [GasExpressionEngineLib](#gasexpressionenginelib)

---

## GasExpressionEngineLib

**Version:** 1.0.0 **Layer:** Domain Logic (Layer 2)   **Dependencies:** CoreUtilsLib   **External Libraries:** jsep (JavaScript Expression Parser)

### ExpressionEngineService

**Source:** `GasExpressionEngineLib/src/ExpressionEngineService.ts`

Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.

**Initialization:**
```javascript
new ExpressionEngineService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `_initializeServices` | `_initializeServices(): void` |
| `evaluate` | `evaluate(expressionString: string, context={}: Object): boolean` |
| `parse` | `parse(expressionString: string): Object` |
| `clearCache` | `clearCache(): void` |


### ExpressionEvaluatorService

**Source:** `GasExpressionEngineLib/src/ExpressionEvaluatorService.ts`

Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.

**Initialization:**
```javascript
new ExpressionEvaluatorService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `evaluate` | `evaluate(): void` |
| `evaluateAst` | `evaluateAst(): void` |
| `_evaluateNode` | `_evaluateNode(): void` |
| `_evaluateIdentifier` | `_evaluateIdentifier(): void` |
| `_evaluateMemberExpression` | `_evaluateMemberExpression(): void` |
| `_buildPathFromMemberExpression` | `_buildPathFromMemberExpression(): void` |
| `_evaluateLiteral` | `_evaluateLiteral(): void` |
| `_evaluateArrayExpression` | `_evaluateArrayExpression(): void` |
| `_evaluateCallExpression` | `_evaluateCallExpression(): void` |
| `_areBothNullOrUndefined` | `_areBothNullOrUndefined(a: *, b: *): boolean` |
| `_hasCircularReference` | `_hasCircularReference(): void` |
| `_parseValue` | `_parseValue(): void` |
| `_builtInFunctions` | `_builtInFunctions: Object<string, Function>` |
| `_evaluateBinaryExpression` | `_evaluateBinaryExpression(): void` |
| `_evaluateUnaryExpression` | `_evaluateUnaryExpression(): void` |
| `_compare` | `_compare(a: *, b: *): number` |
| `_equals` | `_equals(): void` |


### ExpressionParserService

**Source:** `GasExpressionEngineLib/src/ExpressionParserService.ts`

Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.

**Initialization:**
```javascript
new ExpressionParserService()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `di` | `di: Object` |

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `parse` | `parse(expressionString: string): Object` |
| `_preprocess` | `_preprocess(expressionString: string): string` |
| `_convertNumericPathSegments` | `_convertNumericPathSegments(expression: string): string` |
| `_convertPlaceholders` | `_convertPlaceholders(expression: string): string` |
| `_convertBetweenOperator` | `_convertBetweenOperator(expression: string): string` |
| `_configureJSEP` | `_configureJSEP(): void` |
| `_buildAst` | `_buildAst(preprocessedExpression: string): Object` |


---

