# GasOnlineTestFramework

A lightweight, Google Apps Script-native testing framework for running online tests against real Google Workspace APIs (no mocks). Used by every library's `__testOnline__/*.gs` suite in this monorepo.

**Layer:** Infrastructure (Layer 0)
**Dependencies:** None (Google Apps Script runtime)

## File and Folder Structure

```text
GasOnlineTestFramework/
├── src/
│   ├── EnhancedTestRunner.js       # Test registry + run() orchestration
│   ├── SmartAssert.js              # Static assertion library
│   ├── TestContext.js              # Reusable persistent Drive/Sheets/Docs test artifacts
│   └── SampleSpreadsheetBuilder.js # Fluent sheet/row builder for sample data
└── __tests__/                      # Offline Jest tests for the framework itself
```

## Quick Start

```javascript
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
