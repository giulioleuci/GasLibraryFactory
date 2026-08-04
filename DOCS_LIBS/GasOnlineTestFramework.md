# API Reference: GasOnlineTestFramework

## CLASS: TestContext
**File Path:** `GasOnlineTestFramework/src/TestContext.js`
**Constructor Usage:** `const instance = new TestContext();`
**Description:** Resource manager for online test execution, maintaining persistent Google Drive artifacts to optimize quota usage and execution speed.

### Raw JSDoc Context:
```javascript
/**
 * Resource manager for online test execution, maintaining persistent Google Drive artifacts to optimize quota usage and execution speed.
 * @class
 */
```

### Methods of TestContext

#### METHOD: TestContext.getRootFolder
- **Scope:** instance
- **LLM Call Syntax:** `const result = testContext.getRootFolder();`
- **Pure JSDoc:**
```javascript
/**
   * Resolves or creates the dedicated Drive folder for test artifact storage.
   * @returns {GoogleAppsScript.Drive.Folder} Persistent test root.
   */
```
---
#### METHOD: TestContext.if
- **Scope:** instance
- **LLM Call Syntax:** `testContext.if(this._rootFolder);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TestContext.getOrCreateNamedFolder
- **Scope:** instance
- **LLM Call Syntax:** `const result = testContext.getOrCreateNamedFolder(name, parentFolder);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves or creates a Drive folder by name, so repeated online-test runs reuse the same
   * artifact instead of minting a new one every run (ref ALDO_GLF_AUDIT_RESULTS.md K-1).
   * @param {string} name Folder name to look up or create.
   * @param {GoogleAppsScript.Drive.Folder|null} [parentFolder=null] Scope the lookup/creation to
   *   this folder; defaults to Drive root when omitted.
   * @returns {GoogleAppsScript.Drive.Folder} The existing or newly-created folder.
   */
```
---
#### METHOD: TestContext.getSpreadsheet
- **Scope:** instance
- **LLM Call Syntax:** `const result = testContext.getSpreadsheet();`
- **Pure JSDoc:**
```javascript
/**
   * Resolves or creates the primary Spreadsheet artifact for persistence testing.
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Persistent test spreadsheet.
   */
```
---
#### METHOD: TestContext.if
- **Scope:** instance
- **LLM Call Syntax:** `testContext.if(this._spreadsheet);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TestContext.getOrCreateNamedSpreadsheet
- **Scope:** instance
- **LLM Call Syntax:** `const result = testContext.getOrCreateNamedSpreadsheet(name, parentFolder);`
- **Pure JSDoc:**
```javascript
/**
   * Resolves or creates a Spreadsheet by name, so repeated online-test runs reuse the same
   * artifact instead of minting (and never cleaning up) a new one every run — the capability
   * `SpreadsheetApp.create` alone doesn't provide (ref ALDO_GLF_AUDIT_RESULTS.md K-1).
   * @param {string} name Spreadsheet file name to look up or create.
   * @param {GoogleAppsScript.Drive.Folder|null} [parentFolder=null] Scope the lookup to this
   *   folder, and move a newly-created spreadsheet into it; when omitted the lookup scans all of
   *   Drive by name and a new spreadsheet is left wherever `SpreadsheetApp.create` places it.
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} The existing or newly-created spreadsheet.
   */
```
---
#### METHOD: TestContext.if
- **Scope:** instance
- **LLM Call Syntax:** `testContext.if(parentFolder);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TestContext.getDocument
- **Scope:** instance
- **LLM Call Syntax:** `const result = testContext.getDocument();`
- **Pure JSDoc:**
```javascript
/**
   * Resolves or creates the primary Google Doc artifact for template testing.
   * @returns {GoogleAppsScript.Document.Document} Persistent test document.
   */
```
---
#### METHOD: TestContext.if
- **Scope:** instance
- **LLM Call Syntax:** `testContext.if(this._document);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TestContext.catch
- **Scope:** instance
- **LLM Call Syntax:** `testContext.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TestContext.resetSpreadsheet
- **Scope:** instance
- **LLM Call Syntax:** `testContext.resetSpreadsheet(ss);`
- **Pure JSDoc:**
```javascript
/**
   * Restores a spreadsheet to a baseline state by purging protections, named ranges, and additional tabs.
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} [ss] target spreadsheet (defaults to persistent instance).
   */
```
---
#### METHOD: TestContext.if
- **Scope:** instance
- **LLM Call Syntax:** `testContext.if(sheets.length);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: TestContext.for
- **Scope:** instance
- **LLM Call Syntax:** `testContext.for(let i);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: TestContext.buildSampleSpreadsheet
- **Scope:** instance
- **LLM Call Syntax:** `const result = testContext.buildSampleSpreadsheet(name, parentFolder);`
- **Pure JSDoc:**
```javascript
/**
   * @description Gets-or-creates a named spreadsheet, resets it to a clean single-sheet
   * baseline, and wraps it in a {@link SampleSpreadsheetBuilder} for add-sheet/append-row
   * sample-data construction (ref ALDO_GLF_AUDIT_RESULTS.md K-1 reuse-by-name pattern).
   * @param {string} name Spreadsheet file name to look up or create.
   * @param {GoogleAppsScript.Drive.Folder|null} [parentFolder=null] Scope as in {@link getOrCreateNamedSpreadsheet}.
   * @returns {SampleSpreadsheetBuilder}
   */
```
---
#### METHOD: TestContext.buildSampleSpreadsheetById
- **Scope:** instance
- **LLM Call Syntax:** `const result = testContext.buildSampleSpreadsheetById(spreadsheetId);`
- **Pure JSDoc:**
```javascript
/**
   * Opens an existing spreadsheet by ID, resets it to a clean single-sheet baseline,
   * and wraps it in a {@link SampleSpreadsheetBuilder} for sample-data construction.
   * @param {string} spreadsheetId Existing spreadsheet ID.
   * @returns {SampleSpreadsheetBuilder}
   */
```
---
#### METHOD: TestContext.resetDocument
- **Scope:** instance
- **LLM Call Syntax:** `testContext.resetDocument();`
- **Pure JSDoc:**
```javascript
/**
   * Restores the test document to a baseline state by clearing all body content.
   */
```
---
#### METHOD: TestContext.catch
- **Scope:** instance
- **LLM Call Syntax:** `testContext.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TestContext.catch
- **Scope:** instance
- **LLM Call Syntax:** `testContext.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: TestContext.resetAll
- **Scope:** instance
- **LLM Call Syntax:** `testContext.resetAll();`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates a full state reset across all persistent test artifacts and resets the API counter.
   */
```
---
#### METHOD: TestContext.if
- **Scope:** instance
- **LLM Call Syntax:** `testContext.if(typeof Logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
<br>

## CLASS: SmartAssert
**File Path:** `GasOnlineTestFramework/src/SmartAssert.js`
**Constructor Usage:** `const instance = new SmartAssert();`
**Description:** Verbose assertion engine providing machine-readable diagnostic logs for every verification, optimized for LLM-driven test analysis.

### Raw JSDoc Context:
```javascript
/**
 * Verbose assertion engine providing machine-readable diagnostic logs for every verification, optimized for LLM-driven test analysis.
 * @class
 */
```

### Methods of SmartAssert

#### METHOD: SmartAssert.catch
- **Scope:** instance
- **LLM Call Syntax:** `smartAssert.catch(_e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: SmartAssert.if
- **Scope:** instance
- **LLM Call Syntax:** `smartAssert.if(v && typeof v);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SmartAssert.catch
- **Scope:** instance
- **LLM Call Syntax:** `smartAssert.catch(_e2);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: SmartAssert.catch
- **Scope:** instance
- **LLM Call Syntax:** `smartAssert.catch(_e3);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: SmartAssert.if
- **Scope:** instance
- **LLM Call Syntax:** `smartAssert.if(typeof Logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SmartAssert.if
- **Scope:** instance
- **LLM Call Syntax:** `smartAssert.if(!passed);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SmartAssert.equals
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.equals(actual, expected, message);`
- **Pure JSDoc:**
```javascript
/**
   * Performs a strict equality check (===) between two values.
   * @param {*} actual observed value.
   * @param {*} expected baseline value.
   * @param {string} [message='Values should be equal'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.greaterThan
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.greaterThan(actual, expected, message);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies that the observed value is strictly greater than the threshold.
   * @param {number|Date} actual observed value.
   * @param {number|Date} expected threshold baseline.
   * @param {string} [message='Actual should be greater than expected'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.lessThan
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.lessThan(actual, expected, message);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies that the observed value is strictly less than the threshold.
   * @param {number|Date} actual observed value.
   * @param {number|Date} expected threshold baseline.
   * @param {string} [message='Actual should be less than expected'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.notEquals
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.notEquals(actual, expected, message);`
- **Pure JSDoc:**
```javascript
/**
   * Performs a strict inequality check (!==) between two values.
   * @param {*} actual observed value.
   * @param {*} expected baseline value.
   * @param {string} [message='Values should not be equal'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.isTrue
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.isTrue(actual, message);`
- **Pure JSDoc:**
```javascript
/**
   * Asserts that the provided value evaluates to a truthy state.
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be true'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.isFalse
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.isFalse(actual, message);`
- **Pure JSDoc:**
```javascript
/**
   * Asserts that the provided value evaluates to a falsy state.
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be false'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.isNull
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.isNull(actual, message);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies that the value is strictly null or undefined.
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be null or undefined'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.notNull
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.notNull(actual, message);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies that the value is neither null nor undefined.
   * @param {*} actual candidate value.
   * @param {string} [message='Value should not be null or undefined'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.deepEquals
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.deepEquals(actual, expected, message);`
- **Pure JSDoc:**
```javascript
/**
   * Evaluates structural equality of complex objects or arrays using JSON-based comparison.
   * @param {*} actual observed structure.
   * @param {*} expected baseline structure.
   * @param {string} [message='Objects should be deeply equal'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.isType
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.isType(actual, expectedType, message);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies that the candidate value matches the specified JavaScript primitive or object type.
   * @param {*} actual candidate value.
   * @param {string} expectedType target classification (string|number|boolean|object|function).
   * @param {string} [message] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.isNumber
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.isNumber(actual, message);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies that the candidate value is a finite number (typeof === 'number' and not NaN).
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be a number'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.isString
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.isString(actual, message);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies that the candidate value is a string (typeof === 'string').
   * @param {*} actual candidate value.
   * @param {string} [message='Value should be a string'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.contains
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.contains(array, value, message);`
- **Pure JSDoc:**
```javascript
/**
   * Asserts that the provided collection contains the target element.
   * @param {Array} array Search target collection.
   * @param {*} value Element to locate.
   * @param {string} [message='Array should contain value'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.fail
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.fail(message);`
- **Pure JSDoc:**
```javascript
/**
   * Unconditionally triggers an assertion failure.
   * @param {string} [message='Intentional failure'] failure explanation.
   */
```
---
#### METHOD: SmartAssert.throws
- **Scope:** static
- **LLM Call Syntax:** `SmartAssert.throws(fn, message);`
- **Pure JSDoc:**
```javascript
/**
   * Asserts that the provided logic block results in an exception.
   * @param {Function} fn Implementation logic to test.
   * @param {string} [message='Function should throw an error'] diagnostic context.
   */
```
---
#### METHOD: SmartAssert.catch
- **Scope:** instance
- **LLM Call Syntax:** `smartAssert.catch(e);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
<br>

## CLASS: SampleSpreadsheetBuilder
**File Path:** `GasOnlineTestFramework/src/SampleSpreadsheetBuilder.js`
**Constructor Usage:** `const instance = new SampleSpreadsheetBuilder();`
**Description:** Generic add-sheet/append-row/reset helper for building throwaway
sample spreadsheets inside online tests, on top of a live Spreadsheet handle
(typically obtained via TestContext.buildSampleSpreadsheet).
/

/**
@class SampleSpreadsheetBuilder
Wraps a live Spreadsheet handle with add-sheet/append-row
operations, so library consumers building sample test data never call
`SpreadsheetApp`/`Sheet` natives directly.

### Raw JSDoc Context:
```javascript
/**
 * @file GasOnlineTestFramework/src/SampleSpreadsheetBuilder.js
 * @description Generic add-sheet/append-row/reset helper for building throwaway
 * sample spreadsheets inside online tests, on top of a live Spreadsheet handle
 * (typically obtained via TestContext.buildSampleSpreadsheet).
 */

/**
 * @class SampleSpreadsheetBuilder
 * @description Wraps a live Spreadsheet handle with add-sheet/append-row
 * operations, so library consumers building sample test data never call
 * `SpreadsheetApp`/`Sheet` natives directly.
 */
```

### Methods of SampleSpreadsheetBuilder

#### METHOD: SampleSpreadsheetBuilder.addSheet
- **Scope:** instance
- **LLM Call Syntax:** `sampleSpreadsheetBuilder.addSheet(name, headerRow);`
- **Pure JSDoc:**
```javascript
/** @private Header rows keyed by sheet name, as declared via {@link addSheet}. */
    this._headersBySheet = new Map();
  }

  /**
   * @description Creates a new sheet with the given header row, dropping the
   * spreadsheet's auto-created placeholder sheet the first time this is called.
   * Flushes afterwards so the new tab is immediately visible to callers reading
   * the spreadsheet back through the Advanced Sheets Service (e.g. SheetDBLib's
   * schema explorer), which — unlike `SpreadsheetApp` — does not see pending,
   * unflushed `SpreadsheetApp` writes within the same execution.
   * @param {string} name Sheet name.
   * @param {string[]} headerRow Header cell values.
   */
```
---
#### METHOD: SampleSpreadsheetBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sampleSpreadsheetBuilder.if(headerRow.length > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SampleSpreadsheetBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sampleSpreadsheetBuilder.if(this.defaultSheet !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SampleSpreadsheetBuilder.appendRow
- **Scope:** instance
- **LLM Call Syntax:** `sampleSpreadsheetBuilder.appendRow(sheetName, row);`
- **Pure JSDoc:**
```javascript
/**
   * @description Appends a row to a named sheet, matching values to that sheet's header order
   * (as declared via {@link addSheet} — tracked locally rather than re-read from the live sheet,
   * to avoid an extra round-trip per row). Flushes afterwards for the same reason as
   * {@link addSheet} — row data written via `SpreadsheetApp` must be committed before any
   * Advanced-Sheets-Service-backed read (e.g. SheetDBLib) can see it.
   * @param {string} sheetName Target sheet name.
   * @param {Object<string, *>} row Values keyed by header name.
   * @throws {Error} If the named sheet does not exist.
   */
```
---
#### METHOD: SampleSpreadsheetBuilder.if
- **Scope:** instance
- **LLM Call Syntax:** `sampleSpreadsheetBuilder.if(sheet);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: SampleSpreadsheetBuilder.getUrl
- **Scope:** instance
- **LLM Call Syntax:** `const result = sampleSpreadsheetBuilder.getUrl();`
- **Pure JSDoc:**
```javascript
/**
   * @description Public URL of the underlying spreadsheet.
   * @returns {string}
   */
```
---
<br>

## CLASS: EnhancedTestRunner
**File Path:** `GasOnlineTestFramework/src/EnhancedTestRunner.js`
**Constructor Usage:** `const instance = new EnhancedTestRunner();`
**Description:** Registry-based test orchestrator for Google Apps Script, supporting namespaced test discovery, lifecycle hooks, and structured diagnostic logging.

### Raw JSDoc Context:
```javascript
/**
 * Registry-based test orchestrator for Google Apps Script, supporting namespaced test discovery, lifecycle hooks, and structured diagnostic logging.
 * @class
 */
```

### Methods of EnhancedTestRunner

#### METHOD: EnhancedTestRunner.register
- **Scope:** instance
- **LLM Call Syntax:** `const result = enhancedTestRunner.register(path, fn, options, options.skip, options.timeout);`
- **Pure JSDoc:**
```javascript
/**
   * Appends a test case to the internal registry with execution constraints and timeout metadata.
   * @param {string} path Hierarchical identifier (e.g., 'Library/Suite/Test').
   * @param {Function} fn Implementation logic for the test case.
   * @param {Object} [options={}] execution configuration.
   * @param {boolean} [options.skip=false] If true, bypasses test execution.
   * @param {number} [options.timeout=30000] Maximum allowed execution duration in milliseconds.
   * @returns {this} Chainable runner instance.
   */
```
---
#### METHOD: EnhancedTestRunner.addHook
- **Scope:** instance
- **LLM Call Syntax:** `const result = enhancedTestRunner.addHook(type, fn);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a global or per-test lifecycle callback.
   * @param {string} type Hook classification (beforeAll|afterAll|beforeEach|afterEach).
   * @param {Function} fn Callback logic to execute at the hook point.
   * @returns {this} Chainable runner instance.
   */
```
---
#### METHOD: EnhancedTestRunner.if
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.if(this.hooks[type]);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EnhancedTestRunner.run
- **Scope:** instance
- **LLM Call Syntax:** `const result = enhancedTestRunner.run(filter);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates the execution of registered tests filtered by path or regular expression.
   * @param {string|RegExp|null} [filter=null] Selection criteria for test subset.
   * @returns {Object} Execution statistics and failure records.
   */
```
---
#### METHOD: EnhancedTestRunner.for
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.for(const test of testsToRun);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EnhancedTestRunner.if
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.if(test.skip);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EnhancedTestRunner.catch
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.catch(error);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: EnhancedTestRunner.catch
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.catch(rawError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: EnhancedTestRunner.catch
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.catch(hookError);`
- **Pure JSDoc:**
```javascript
/** Method catch */
```
---
#### METHOD: EnhancedTestRunner.for
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.for(const hook of this.hooks[type]);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
#### METHOD: EnhancedTestRunner.if
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.if(typeof Logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EnhancedTestRunner.if
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.if(this.results.failed > 0);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: EnhancedTestRunner.for
- **Scope:** instance
- **LLM Call Syntax:** `enhancedTestRunner.for(const err of this.results.errors);`
- **Pure JSDoc:**
```javascript
/** Method for */
```
---
<br>

