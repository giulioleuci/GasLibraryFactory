# API Reference: GasExpressionEngineLib

## CLASS: ExpressionParserService
**File Path:** `GasExpressionEngineLib/src/ExpressionParserService.js`
**Constructor Usage:** `const instance = new ExpressionParserService();`
**Description:** Service for parsing dynamic logical expressions using JSEP.
             Transforms expression strings into Abstract Syntax Trees (AST)
             for data-driven evaluation of complex conditions.

/

import { TokenScanner } from './internal/parser/TokenScanner.js';
import { AstBuilder } from './internal/parser/AstBuilder.js';
import { assertAllowedExpressionAst, defaultPolicy } from './internal/ExpressionPolicy.js';

/**
Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file GasExpressionEngineLib/src/ExpressionParserService.js
 * @description Service for parsing dynamic logical expressions using JSEP.
 *              Transforms expression strings into Abstract Syntax Trees (AST)
 *              for data-driven evaluation of complex conditions.
 * @version 2.1.0 - Refactored with Facade/Delegation pattern
 */

import { TokenScanner } from './internal/parser/TokenScanner.js';
import { AstBuilder } from './internal/parser/AstBuilder.js';
import { assertAllowedExpressionAst, defaultPolicy } from './internal/ExpressionPolicy.js';

/**
 * Syntactic analyzer for logical expressions, transforming string templates into structured Abstract Syntax Trees (AST) using JSEP.
 * @class
 */
```

<br>

## CLASS: ExpressionEvaluatorService
**File Path:** `GasExpressionEngineLib/src/ExpressionEvaluatorService.js`
**Constructor Usage:** `const instance = new ExpressionEvaluatorService();`
**Description:** Service for evaluating dynamic logical expressions.
             Evaluates Abstract Syntax Trees (AST) against a Unified Data Context (UDC)
             by delegating placeholder resolution to PlaceholderService.

/

import { RegexUtils, ValidationUtils } from '@CoreUtilsLib';
import { AstNodeEvaluator } from './internal/AstNodeEvaluator.js';
import { EvaluationContextHandler } from './handlers/EvaluationContextHandler.js';
import { OperatorHandler } from './internal/OperatorHandler.js';
import { createBuiltInFunctions } from './internal/builtins/BuiltInFunctions.js';

/**
Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file GasExpressionEngineLib/src/ExpressionEvaluatorService.js
 * @description Service for evaluating dynamic logical expressions.
 *              Evaluates Abstract Syntax Trees (AST) against a Unified Data Context (UDC)
 *              by delegating placeholder resolution to PlaceholderService.
 * @version 1.0.0
 */

import { RegexUtils, ValidationUtils } from '@CoreUtilsLib';
import { AstNodeEvaluator } from './internal/AstNodeEvaluator.js';
import { EvaluationContextHandler } from './handlers/EvaluationContextHandler.js';
import { OperatorHandler } from './internal/OperatorHandler.js';
import { createBuiltInFunctions } from './internal/builtins/BuiltInFunctions.js';

/**
 * Core engine for computing logical outcomes from expression ASTs, providing extensive built-in functions and strict relational comparisons.
 * @class
 */
```

<br>

## CLASS: ExpressionEngineService
**File Path:** `GasExpressionEngineLib/src/ExpressionEngineService.js`
**Constructor Usage:** `const instance = new ExpressionEngineService();`
**Description:** High-level facade for the Expression Engine library.
             Provides a simple, unified API for parsing and evaluating
             dynamic logical expressions with placeholder resolution.

/

import { ExpressionParserService } from './ExpressionParserService.js';
import { ExpressionEvaluatorService } from './ExpressionEvaluatorService.js';
import { Mustache, PlaceholderService } from '@WorkspaceTemplateEngine';

/**
Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file GasExpressionEngineLib/src/ExpressionEngineService.js
 * @description High-level facade for the Expression Engine library.
 *              Provides a simple, unified API for parsing and evaluating
 *              dynamic logical expressions with placeholder resolution.
 * @version 1.0.0
 */

import { ExpressionParserService } from './ExpressionParserService.js';
import { ExpressionEvaluatorService } from './ExpressionEvaluatorService.js';
import { Mustache, PlaceholderService } from '@WorkspaceTemplateEngine';

/**
 * Unified facade for dynamic business logic evaluation, orchestrating parsing, placeholder resolution, and AST computation.
 * @class
 */
```

<br>

## CLASS: OperatorHandler
**File Path:** `GasExpressionEngineLib/src/internal/OperatorHandler.js`
**Constructor Usage:** `const instance = new OperatorHandler();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of OperatorHandler

#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(!left);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(left);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(!left);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(left);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.switch
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.switch(operator);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(right.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(typeof left !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(typeof right !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(typeof left);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(right);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(right);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(operator);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(a);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(b);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(isDateA && isDateB);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(isDateA || isDateB);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(typeA !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(typeof a);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(typeof a);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(a);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(a);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(typeA !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: OperatorHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `operatorHandler.if(typeof a);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: AstNodeEvaluator
**File Path:** `GasExpressionEngineLib/src/internal/AstNodeEvaluator.js`
**Constructor Usage:** `const instance = new AstNodeEvaluator();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of AstNodeEvaluator

#### METHOD: AstNodeEvaluator.if
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.if(!node || typeof node !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AstNodeEvaluator.switch
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.switch(node.type);`
- **Pure JSDoc:**
```javascript
/** Method switch */
```
---
#### METHOD: AstNodeEvaluator.if
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.if(result);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AstNodeEvaluator.catch
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: AstNodeEvaluator.if
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.if(result);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AstNodeEvaluator.catch
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: AstNodeEvaluator.if
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.if(node.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AstNodeEvaluator.if
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.if(node.type);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AstNodeEvaluator.if
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.if(!func);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: AstNodeEvaluator.catch
- **Scope:** instance
- **LLM Call Syntax:** `astNodeEvaluator.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: TokenScanner
**File Path:** `GasExpressionEngineLib/src/internal/parser/TokenScanner.js`
**Constructor Usage:** `const instance = new TokenScanner();`
**Description:** Internal module for preprocessing and tokenizing expression strings
before parsing by JSEP.

### Raw JSDoc Context:
```javascript
/**
 * @file GasExpressionEngineLib/src/parser/internal/TokenScanner.js
 * @description Internal module for preprocessing and tokenizing expression strings
 * before parsing by JSEP.
 * @version 1.0.0
 */
```

### Methods of TokenScanner

#### METHOD: TokenScanner.preprocess
- **Scope:** instance
- **LLM Call Syntax:** `const result = tokenScanner.preprocess(expressionString);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates the normalization of expression syntax, converting {{placeholders}}, numeric paths, and special operators into JSEP-compatible tokens.
   * @param {string} expressionString raw logic template.
   * @returns {string} preprocessed expression string.
   */
```
---
#### METHOD: TokenScanner.while
- **Scope:** instance
- **LLM Call Syntax:** `tokenScanner.while(hasChanges);`
- **Pure JSDoc:**
```javascript
/** Method while */
```
---
<br>

## CLASS: AstBuilder
**File Path:** `GasExpressionEngineLib/src/internal/parser/AstBuilder.js`
**Constructor Usage:** `const instance = new AstBuilder();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of AstBuilder

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
#### METHOD: AstBuilder.catch
- **Scope:** instance
- **LLM Call Syntax:** `astBuilder.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: EvaluationContextHandler
**File Path:** `GasExpressionEngineLib/src/handlers/EvaluationContextHandler.js`
**Constructor Usage:** `const instance = new EvaluationContextHandler();`
**Description:** N/A

### Raw JSDoc Context:
```javascript
/** Class definition */
```

### Methods of EvaluationContextHandler

#### METHOD: EvaluationContextHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.if(obj);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EvaluationContextHandler.for
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.for(const item of obj);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EvaluationContextHandler.for
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.for(const key in obj);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EvaluationContextHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: EvaluationContextHandler.evaluate
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.evaluate(expressionString, context);`
- **Pure JSDoc:**
```javascript
/** Method evaluate */
```
---
#### METHOD: EvaluationContextHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.if(!expressionString || typeof expressionString !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EvaluationContextHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: EvaluationContextHandler.evaluateAst
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.evaluateAst(ast, context);`
- **Pure JSDoc:**
```javascript
/** Method evaluateAst */
```
---
#### METHOD: EvaluationContextHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.if(!ast || typeof ast !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EvaluationContextHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.if(!ast.type || typeof ast.type !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EvaluationContextHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.if(context !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EvaluationContextHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.if(typeof result !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EvaluationContextHandler.catch
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: EvaluationContextHandler.if
- **Scope:** instance
- **LLM Call Syntax:** `evaluationContextHandler.if(typeof value !);`
- **Pure JSDoc:**
```javascript
/** Method if */
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
#### METHOD: ErrorHelper.if
- **Scope:** instance
- **LLM Call Syntax:** `errorHelper.if(details);`
- **Pure JSDoc:**
```javascript
/** Method if */
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

