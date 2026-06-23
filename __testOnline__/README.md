# GasLibraryFactory - Online Test Suite

## Overview

This directory contains **online tests** for all GasLibraryFactory libraries. Unlike unit tests that run in isolation, online tests execute in the **real Google Apps Script environment** and test actual interactions with Google Workspace APIs (Drive, Sheets, Docs, etc.).

## Purpose

Online tests verify that:

- The bundled libraries work correctly in the GAS runtime
- All Google API integrations function as expected
- Real-world scenarios execute successfully
- Resource creation and cleanup work properly
- Performance is acceptable under actual GAS constraints

## Test Structure

```
__testOnline__/
├── README.md                          # This file
├── shared/                            # Shared test utilities
│   ├── TestFramework.gs               # Core test framework
│   └── GasTestUtilities.gs            # GAS-specific test helpers
├── MasterTestRunner.gs                # Master test runner for all libraries
│
GasResilienceLib/__testOnline__/
├── OnlineTests.gs                     # GasResilienceLib online tests
│
GoogleApiWrapper/__testOnline__/
├── OnlineTests.gs                     # GoogleApiWrapper online tests
│
WorkspaceTemplateEngine/__testOnline__/
├── OnlineTests.gs                     # WorkspaceTemplateEngine online tests
│
GasExpressionEngineLib/__testOnline__/
├── OnlineTests.gs                     # GasExpressionEngineLib online tests
│
SheetDBLib/__testOnline__/
├── OnlineTests.gs                     # SheetDBLib online tests
│
JobRunnerLib/__testOnline__/
├── OnlineTests.gs                     # JobRunnerLib online tests
│
PipelineFramework/__testOnline__/
├── OnlineTests.gs                     # PipelineFramework online tests
│
ContextEngine/__testOnline__/
├── OnlineTests.gs                     # ContextEngine online tests
│
GasDataImporter/__testOnline__/
└── OnlineTests.gs                     # GasDataImporter online tests
```

## Prerequisites

Before running online tests, you must:

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Deploy to Google Apps Script**:

   ```bash
   npm run push
   ```

3. **Open the Apps Script editor**:

   ```bash
   clasp open
   ```

4. **Copy the test files** to your Apps Script project:
   - Copy all files from `__testOnline__/shared/` to your project
   - Copy all files from each library's `__testOnline__/` folder
   - Copy `__testOnline__/MasterTestRunner.gs`

## Running Tests

### Quick Start

Open the Apps Script editor and run:

```javascript
runAllQuickTests();
```

This runs a fast subset of tests to verify everything is working.

### Full Test Suite

To run all tests for all libraries:

```javascript
runAllOnlineTests();
```

**Warning**: This may take several minutes and will create temporary Drive resources.

### Test a Specific Library

To run tests for just one library:

```javascript
runTestsForLibrary('GoogleApiWrapper');
```

Available library names:

- `GasResilienceLib`
- `GoogleApiWrapper`
- `WorkspaceTemplateEngine`
- `GasExpressionEngineLib`
- `SheetDBLib`
- `JobRunnerLib`
- `PipelineFramework`
- `ContextEngine`
- `GasDataImporter`

### Individual Library Tests

Each library has its own test runner:

```javascript
// Full test suite
runGasResilienceLibOnlineTests();
runGoogleApiWrapperOnlineTests();
runWorkspaceTemplateEngineOnlineTests();
runGasExpressionEngineLibOnlineTests();
runSheetDBLibOnlineTests();
runJobRunnerLibOnlineTests();
runPipelineFrameworkOnlineTests();
runContextEngineOnlineTests();
runGasDataImporterOnlineTests();

// Quick tests (faster subset)
runQuickGasResilienceLibTests();
runQuickGoogleApiWrapperTests();
runQuickWorkspaceTemplateEngineTests();
runQuickGasExpressionEngineLibTests();
runQuickSheetDBLibTests();
runQuickJobRunnerLibTests();
runQuickPipelineFrameworkTests();
runQuickContextEngineTests();
runQuickGasDataImporterTests();
```

## Test Framework

### Core Components

#### 1. TestFramework

The main test orchestration class:

```javascript
const framework = new TestFramework('My Test Suite');

framework
  .setup(() => {
    // Setup code
  })
  .test('Test name', () => {
    // Test code
    Assert.equals(actual, expected);
  })
  .teardown(() => {
    // Cleanup code
  });

framework.run();
```

#### 2. Assert

Assertion utilities for test validation:

```javascript
Assert.equals(actual, expected, 'Message');
Assert.notNull(value, 'Message');
Assert.isTrue(value, 'Message');
Assert.isFalse(value, 'Message');
Assert.greaterThan(actual, expected, 'Message');
Assert.lessThan(actual, expected, 'Message');
Assert.contains(array, value, 'Message');
Assert.arrayLength(array, expectedLength, 'Message');
Assert.matches(value, regex, 'Message');
Assert.throws(fn, expectedMessage, 'Message');
Assert.deepEquals(actual, expected, 'Message');
```

#### 3. TestResourceManager

Automatic cleanup of test resources:

```javascript
const resources = new TestResourceManager();

// Track resources for cleanup
resources.trackFile(fileId);
resources.trackFolder(folderId);
resources.trackSpreadsheet(spreadsheetId);
resources.trackDocument(documentId);
resources.trackTrigger(triggerId);

// Cleanup all tracked resources
resources.cleanup();
```

### GAS Test Utilities

#### DriveTestUtils

```javascript
DriveTestUtils.createTestFolder('TestFolder');
DriveTestUtils.createTestFile('TestFile.txt', 'content');
DriveTestUtils.deleteFolder(folderId);
DriveTestUtils.deleteFile(fileId);
```

#### SheetsTestUtils

```javascript
SheetsTestUtils.createTestSpreadsheet('TestSheet');
SheetsTestUtils.createSpreadsheetWithData('Sheet', data, headers);
SheetsTestUtils.getSheetData(spreadsheet);
SheetsTestUtils.getSheetDataAsObjects(spreadsheet);
SheetsTestUtils.generateStructuredData(rowCount);
```

#### DocsTestUtils

```javascript
DocsTestUtils.createTestDocument('TestDoc');
DocsTestUtils.createDocumentWithContent('Doc', sections);
DocsTestUtils.getDocumentText(doc);
```

#### PropertiesTestUtils

```javascript
PropertiesTestUtils.setTestProperties(properties, 'script');
PropertiesTestUtils.getTestProperties(keys, 'script');
PropertiesTestUtils.clearAllProperties('script');
```

#### CacheTestUtils

```javascript
CacheTestUtils.setTestCache(values, 'script');
CacheTestUtils.getTestCache(keys, 'script');
CacheTestUtils.clearTestCache(keys, 'script');
```

## Writing New Tests

### Basic Test Structure

```javascript
function runMyLibraryOnlineTests() {
  const framework = new TestFramework('MyLibrary Online Tests');
  const resources = new TestResourceManager();

  framework
    .setup(() => {
      Logger.log('Setting up tests...');
    })
    .teardown(() => {
      resources.cleanup();
    });

  framework.test('Test description', () => {
    // Arrange
    const spreadsheet = SheetsTestUtils.createTestSpreadsheet('Test');
    resources.trackSpreadsheet(spreadsheet.getId());

    // Act
    const result = myFunction(spreadsheet);

    // Assert
    Assert.notNull(result, 'Should return result');
    Assert.equals(result.status, 'success', 'Should succeed');
  });

  return framework.run();
}
```

### Best Practices

1. **Always cleanup resources**:

   ```javascript
   resources.trackSpreadsheet(spreadsheet.getId());
   resources.trackFolder(folder.getId());
   ```

2. **Use descriptive test names**:

   ```javascript
   framework.test('DatabaseService - Insert row with auto-generated ID', () => {
     // ...
   });
   ```

3. **Test one thing per test**:

   ```javascript
   // Good
   framework.test('Should insert row', () => {
     /* ... */
   });
   framework.test('Should update row', () => {
     /* ... */
   });

   // Bad
   framework.test('Should insert and update and delete', () => {
     /* ... */
   });
   ```

4. **Provide helpful assertion messages**:

   ```javascript
   Assert.equals(actual, expected, 'Should have correct email after update');
   ```

5. **Use unique names for test resources**:
   ```javascript
   const name = TestDataGenerator.uniqueName('TestFolder');
   ```

## Resource Cleanup

All tests automatically cleanup resources in the teardown phase. Resources tracked include:

- Files (Google Drive)
- Folders (Google Drive)
- Spreadsheets (Google Sheets)
- Documents (Google Docs)
- Triggers (Apps Script)
- Properties (Script/User/Document Properties)

If a test fails, cleanup still occurs in the finally block.

## Performance Considerations

- **Full test suite**: 5-15 minutes (creates many temporary resources)
- **Quick test suite**: 1-3 minutes (minimal resource creation)
- **Single library**: 30 seconds - 3 minutes (varies by library)

To minimize execution time:

1. Use `runAllQuickTests()` for routine validation
2. Run full tests before releases or after major changes
3. Test individual libraries during development

## Troubleshooting

### Tests Fail with "Service unavailable"

- **Cause**: GAS API rate limits
- **Solution**: Wait a few minutes and retry

### Tests Fail with "Permission denied"

- **Cause**: Script lacks necessary permissions
- **Solution**: Review and approve all requested permissions when running tests

### Resources Not Cleaned Up

- **Cause**: Test crashed before cleanup
- **Solution**: Manually delete test resources from Drive (search for "Test" in file names)

### Tests Timeout

- **Cause**: GAS execution time limit (6 minutes for scripts)
- **Solution**: Run smaller test suites or individual library tests

## Test Coverage

| Library                 | Online Tests | Quick Tests | Coverage |
| ----------------------- | ------------ | ----------- | -------- |
| GasResilienceLib        | ✓            | ✓           | Complete |
| GoogleApiWrapper        | ✓            | ✓           | Complete |
| WorkspaceTemplateEngine | ✓            | ✓           | Complete |
| GasExpressionEngineLib  | ✓            | ✓           | Complete |
| SheetDBLib              | ✓            | ✓           | Complete |
| JobRunnerLib            | ✓            | ✓           | Complete |
| PipelineFramework       | ✓            | ✓           | Complete |
| ContextEngine           | ✓            | ✓           | Complete |
| GasDataImporter         | ✓            | ✓           | Complete |

Run `showTestCoverage()` to see this report in the Apps Script console.

## Continuous Integration

These tests are designed for **manual execution** in the Google Apps Script environment. They cannot run in CI/CD pipelines due to GAS environment requirements.

For automated testing, use the unit tests in each library's `Tests.gs` file.

## Support

If you encounter issues with online tests:

1. Verify the library is properly deployed
2. Check Google Apps Script quotas and limits
3. Review execution logs for detailed error messages
4. Ensure all required permissions are granted

## Contributing

When adding new libraries:

1. Create `LibraryName/__testOnline__/OnlineTests.gs`
2. Implement both full and quick test runners
3. Add library to `MasterTestRunner.gs`
4. Update this README
5. Test locally before committing

## License

MIT License - Same as GasLibraryFactory project

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
