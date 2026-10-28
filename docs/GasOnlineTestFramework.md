# GasLibraryFactory API Reference

> Simplified API documentation for all libraries. Auto-generated.

---

## Table of Contents

- [GasOnlineTestFramework](#gasonlinetestframework)

---

## GasOnlineTestFramework

GasOnlineTestFramework - Testing framework for Google Apps Script online tests

### EnhancedTestRunner

**Source:** `GasOnlineTestFramework/src/EnhancedTestRunner.ts`

Registry-based test orchestrator for Google Apps Script, supporting namespaced test discovery and structured diagnostic logging.

**Initialization:**
```javascript
new EnhancedTestRunner()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `register` | `register(path: string, fn: Function, options={}: Object, options.skip=false: boolean): this` |
| `run` | `run(filter=null: string|RegExp|null): Object` |
| `_runTest` | `_runTest(test: Object): void` |
| `_log` | `_log(message: string): void` |
| `_printSummary` | `_printSummary(): void` |


### SampleSpreadsheetBuilder

**Source:** `GasOnlineTestFramework/src/SampleSpreadsheetBuilder.ts`

Wraps a live Spreadsheet handle with add-sheet/append-row
operations, so library consumers building sample test data never call
`SpreadsheetApp`/`Sheet` natives directly.

**Initialization:**
```javascript
new SampleSpreadsheetBuilder()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `addSheet` | `addSheet(name: string, headerRow: string[]): void` |
| `appendRow` | `appendRow(sheetName: string, row: Object<string, *>): void` |
| `appendRows` | `appendRows(sheetName: string): void` |
| `getUrl` | `getUrl(): string` |


### SmartAssert

**Source:** `GasOnlineTestFramework/src/SmartAssert.ts`

Verbose assertion engine providing machine-readable diagnostic logs for every verification, optimized for LLM-driven test analysis.

**Initialization:**
```javascript
new SmartAssert()
```

**Static methods and properties:**

| Method | Signature |
|--------|----------|
| `_safeStringify` | `_safeStringify(passed: boolean, expected: *, actual: *, message: string): void` |
| `_log` | `_log(): void` |
| `equals` | `equals(actual: *, expected: *, message='Values should be equal': string): void` |
| `greaterThan` | `greaterThan(actual: number|Date, expected: number|Date, message='Actual should be greater than expected': string): void` |
| `lessThan` | `lessThan(actual: number|Date, expected: number|Date, message='Actual should be less than expected': string): void` |
| `notEquals` | `notEquals(actual: *, expected: *, message='Values should not be equal': string): void` |
| `isTrue` | `isTrue(actual: *, message='Value should be true': string): void` |
| `isFalse` | `isFalse(actual: *, message='Value should be false': string): void` |
| `isNull` | `isNull(actual: *, message='Value should be null or undefined': string): void` |
| `notNull` | `notNull(actual: *, message='Value should not be null or undefined': string): void` |
| `deepEquals` | `deepEquals(actual: *, expected: *, message='Objects should be deeply equal': string): void` |
| `isType` | `isType(actual: *, expectedType: string, message: string): void` |
| `isNumber` | `isNumber(actual: *, message='Value should be a number': string): void` |
| `isString` | `isString(actual: *, message='Value should be a string': string): void` |
| `contains` | `contains(array: Array, value: *, message='Array should contain value': string): void` |
| `fail` | `fail(message='Intentional failure': string): void` |
| `throws` | `throws(fn: Function, message='Function should throw an error': string): void` |


### TestContext

**Source:** `GasOnlineTestFramework/src/TestContext.ts`

Resource manager for online test execution, maintaining persistent Google Drive artifacts to optimize quota usage and execution speed.

**Initialization:**
```javascript
new TestContext()
```

**Methods and properties:**

| Method | Signature |
|--------|----------|
| `getRootFolder` | `getRootFolder(): GoogleAppsScript.Drive.Folder` |
| `getOrCreateNamedFolder` | `getOrCreateNamedFolder(name: string, parentFolder=null: GoogleAppsScript.Drive.Folder|null): GoogleAppsScript.Drive.Folder` |
| `getSpreadsheet` | `getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet` |
| `getOrCreateNamedSpreadsheet` | `getOrCreateNamedSpreadsheet(name: string, parentFolder=null: GoogleAppsScript.Drive.Folder|null): GoogleAppsScript.Spreadsheet.Spreadsheet` |
| `getDocument` | `getDocument(): GoogleAppsScript.Document.Document` |
| `resetSpreadsheet` | `resetSpreadsheet(ss: GoogleAppsScript.Spreadsheet.Spreadsheet): void` |
| `buildSampleSpreadsheet` | `buildSampleSpreadsheet(name: string, parentFolder=null: GoogleAppsScript.Drive.Folder|null): SampleSpreadsheetBuilder` |
| `buildSampleSpreadsheetById` | `buildSampleSpreadsheetById(spreadsheetId: string): SampleSpreadsheetBuilder` |
| `resetDocument` | `resetDocument(): void` |
| `_clearBodySafely` | `_clearBodySafely(body: GoogleAppsScript.Document.Body): void` |
| `resetAll` | `resetAll(): void` |
| `_log` | `_log(message: string): void` |


---

