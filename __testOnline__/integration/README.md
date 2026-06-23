# Online Integration Tests

## Overview

This directory contains **online integration tests** that run in the Google Apps Script environment with real Google Workspace APIs. These tests validate end-to-end scenarios across all architectural layers.

## Test Structure

### Test Files

Each test is in a separate `.gs` file for modularity:

- **Test16_FullETLPipeline.gs** - Complete ETL pipeline validation
- **Test17_DatabaseCRUDCycle.gs** - CRUD operations with SheetDBLib
- **Test18_RepositorySpecificationQuery.gs** - Domain repository queries
- **Test19_JobRunnerLifecycle.gs** - Job execution and state persistence
- **Test20_ResilienceQuotaHandling.gs** - Rate limiting and backoff
- **Test21_DriveSheetIntegration.gs** - Drive and Sheets API integration
- **Test22_TemplateGeneration.gs** - Template processing with data
- **Test23_VirtualColumnIndexing.gs** - Virtual columns and joins
- **Test24_BatchImportPerformance.gs** - Large dataset import
- **Test25_ConcurrencyLocking.gs** - Job concurrency control
- **Test26_DateHandlingConsistency.gs** - Date serialization roundtrip
- **Test27_SchemaValidationEnforcement.gs** - Schema validation rules
- **Test28_CrossSpreadsheetJoin.gs** - Multi-spreadsheet queries
- **Test29_PermissionErrorHandling.gs** - Permission error classification
- **Test30_AggregateRootPersistence.gs** - Complex entity persistence
- **Test31_ExpressionEngineOnRealData.gs** - Dynamic expression evaluation
- **Test32_TriggerManagement.gs** - Trigger lifecycle management
- **Test33_LargeTextHandling.gs** - Large text field persistence
- **Test34_TransactionSimulation.gs** - Manual transaction rollback
- **Test35_ConfigLoading.gs** - Configuration from SheetDBLib

### Test Runner

`IntegrationTestRunner.gs` orchestrates all tests and provides:

- `runAllIntegrationTests()` - Execute complete test suite (~15-20 minutes)
- `runQuickIntegrationTests()` - Execute subset of tests (~3-5 minutes)
- `showIntegrationTestCoverage()` - Display test coverage matrix

## Running Tests

### Prerequisites

1. Build and deploy the project:

   ```bash
   npm run build
   npm run push
   ```

2. Open Apps Script editor:
   ```bash
   clasp open
   ```

### Execute Tests

In the Apps Script editor, run:

```javascript
// Run all integration tests
runAllIntegrationTests();

// Run quick subset
runQuickIntegrationTests();

// Run individual test
runTest17_DatabaseCRUDCycle();

// Show coverage
showIntegrationTestCoverage();
```

### View Results

Check the **Execution Log** for detailed test output including:

- Test name and description
- Pass/Fail status
- Assertion details
- Execution time
- Summary statistics

## Test Categories

### Data Integration (Tests 16, 22, 24, 31)

- ETL pipeline validation
- Template generation with data
- Batch import performance
- Expression evaluation on real data

### Persistence (Tests 17, 23, 26, 27, 28, 33)

- CRUD operations
- Virtual columns and indexing
- Date handling
- Schema validation
- Cross-spreadsheet queries
- Large text fields

### Domain Logic (Tests 18, 30, 34)

- Repository specifications
- Aggregate persistence
- Transaction simulation

### Application Services (Tests 19, 25, 32)

- Job lifecycle
- Concurrency locking
- Trigger management

### Infrastructure (Tests 20, 21, 29, 35)

- Resilience and retry logic
- Drive/Sheet integration
- Permission handling
- Config loading

## Resource Management

All tests use `TestResourceManager` for automatic cleanup:

```javascript
const resources = new TestResourceManager();

framework.setup(() => {
  const spreadsheet = SpreadsheetApp.create('Test');
  resources.trackSpreadsheet(spreadsheet.getId());
});

framework.teardown(() => {
  resources.cleanup(); // Automatically deletes all tracked resources
});
```

## Test Development Guidelines

### Template Structure

Each test file follows this pattern:

```javascript
function runTestXX_TestName() {
  const framework = new TestFramework('Test XX: Test Name');
  const resources = new TestResourceManager();

  framework.setup(() => {
    // Create resources
  });

  framework.teardown(() => {
    resources.cleanup();
  });

  framework.test('Test description', () => {
    // Arrange
    // Act
    // Assert
  });

  return framework.run();
}
```

### Assertions

Use the `Assert` class from `TestFramework.gs`:

```javascript
Assert.equals(actual, expected, 'Message');
Assert.notNull(value, 'Message');
Assert.isTrue(condition, 'Message');
Assert.greaterThan(actual, threshold, 'Message');
Assert.arrayLength(array, expectedLength, 'Message');
```

### Resource Tracking

Always track resources for cleanup:

```javascript
resources.trackSpreadsheet(spreadsheetId);
resources.trackFolder(folderId);
resources.trackTrigger(triggerId);
```

## Performance Expectations

| Test Category | Expected Duration | Resource Count           |
| ------------- | ----------------- | ------------------------ |
| CRUD Tests    | 1-2 minutes       | 1-2 spreadsheets         |
| ETL Tests     | 3-5 minutes       | 2-3 spreadsheets         |
| Job Tests     | 2-4 minutes       | 1 spreadsheet + triggers |
| Integration   | 10-20 minutes     | 5-10 spreadsheets        |

## Troubleshooting

### Tests Timeout

- **Cause**: GAS 6-minute execution limit
- **Solution**: Run tests individually or in smaller batches

### Permission Denied

- **Cause**: Missing OAuth scopes
- **Solution**: Authorize all requested permissions when running tests

### Rate Limit Errors

- **Cause**: Too many API calls in short time
- **Solution**: Add delays between test runs

### Resources Not Cleaned Up

- **Cause**: Test crashed before teardown
- **Solution**: Manually delete test resources from Drive (search for "Test\_")

## Implementation Status

| Test # | Status      | Notes                                 |
| ------ | ----------- | ------------------------------------- |
| 16     | 📝 Template | ETL pipeline ready for implementation |
| 17     | 📝 Template | CRUD cycle ready for implementation   |
| 18     | 📝 Template | Specification query ready             |
| 19-35  | 📝 Template | Stub files created                    |

**Legend**: ✅ Implemented | 📝 Template | ⏸ Stub

## Next Steps

1. Implement test logic in template files (marked with `// TODO:`)
2. Test each individually in GAS environment
3. Fix any issues with resource cleanup
4. Add to CI/CD pipeline (if applicable)
5. Document any special setup requirements

## Related Documentation

- [Integration Test Plan](../../INTEGRATION_TEST_PLAN.md)
- [Online Test Framework](../README.md)
- [Test Framework API](../shared/TestFramework.gs)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-28
**Status**: Templates Complete, Implementation Pending
