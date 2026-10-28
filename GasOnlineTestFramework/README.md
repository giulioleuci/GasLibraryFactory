# GasOnlineTestFramework

A lightweight, Google Apps Script-native testing framework for running online tests against real Google Workspace APIs (no mocks). Used by every library's `__testOnline__/*.gs` suite in this monorepo.

**Layer:** Infrastructure (Layer 0)
**Language:** TypeScript (strict, ES modules; Babel emits GAS V8 JavaScript)
**Dependencies:** None (Google Apps Script runtime)

## File and Folder Structure

```text
GasOnlineTestFramework/
├── src/
│   ├── EnhancedTestRunner.ts       # Test registry + run() orchestration
│   ├── SmartAssert.ts              # Static assertion library
│   ├── TestContext.ts              # Reusable persistent Drive/Sheets/Docs test artifacts
│   └── SampleSpreadsheetBuilder.ts # Fluent sheet/row builder for sample data
└── __tests__/                      # Offline Jest tests for the framework itself
```

## Quick Start

```typescript
import { runner, testContext, SmartAssert } from '@GasOnlineTestFramework';

function initMyLibraryOnlineTests() {
  const NS = 'MyLibrary';

  runner.register(`${NS}/Spreadsheet/Reads_Written_Value`, () => {
    const ss = testContext.getSpreadsheet();
    testContext.resetSpreadsheet(ss);
    const sheet = ss.getSheets()[0];
    sheet.getRange('A1').setValue('hello');

    SmartAssert.equals(sheet.getRange('A1').getValue(), 'hello');
  });
}

function runMyLibraryOnlineTests(filter) {
  initMyLibraryOnlineTests();
  return runner.run(filter);
}
```

`testContext` reuses persistent Drive/Sheets/Docs artifacts across runs instead of minting new ones every time, and `runner.run(filter)` accepts an optional string or `RegExp` to select a subset of registered tests by path.

## Full API Reference

Generated from JSDoc: [`DOCS_LIBS/GasOnlineTestFramework.md`](../DOCS_LIBS/GasOnlineTestFramework.md).

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Project architecture and guidelines
