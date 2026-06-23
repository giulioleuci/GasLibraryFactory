# GasOnlineTestFramework

A lightweight, Google Apps Script-native testing framework for running online tests in the GAS environment. Provides structured test execution, comprehensive assertions, and detailed reporting.

**Layer:** Infrastructure (Layer 0)  
**Dependencies:** None (Google Apps Script runtime)

## 🏗️ File and Folder Structure

A lean framework designed for minimal footprint in GAS projects:

```text
GasOnlineTestFramework/
├── src/
│   ├── TestFramework.js  # Main engine: test registration, hooks, and runner logic
│   └── Assert.js         # Static assertion library with comprehensive matchers
└── __tests__/            # Offline Jest tests for the framework itself
```

## 🧩 Programming Patterns

1.  **Fluent Interface (Method Chaining)**: `TestFramework` allows chaining methods like `.setup()`, `.teardown()`, and `.test()` for a more readable, declarative test configuration.
2.  **Static Assertion Pattern**: `Assert` is implemented as a class with static methods (singleton-like behavior), similar to standard testing frameworks like JUnit or NUnit.
3.  **Command Pattern (Implicit)**: Tests are registered as function "commands" that are queued and executed later by the `.run()` method.
4.  **Observer Pattern (Simple)**: The framework "observes" the execution of tests and reports results to the console/log.

## 🚀 Overview

GasOnlineTestFramework enables developers to write and run tests directly in Google Apps Script that interact with real Google Workspace APIs. Unlike Jest unit tests that use mocks, these tests validate actual behavior in the GAS runtime.

### Key Features

- ✅ **GAS-Native**: Written specifically for Google Apps Script environment
- ✅ **Zero Dependencies**: No external dependencies, uses only GAS built-in APIs
- ✅ **Fluent API**: Chainable test registration and configuration
- ✅ **Comprehensive Assertions**: 15+ assertion methods for all testing needs
- ✅ **Detailed Reporting**: Pass/fail/skip counts with error details
- ✅ **Resource Management**: Built-in cleanup hooks for test resources
- ✅ **Test Isolation**: Setup/teardown hooks for each test suite
- ✅ **Skip & Timeout**: Support for skipping tests and custom timeouts

## Installation

### In Monorepo (Webpack)

```javascript
// Import in your test files
import { TestFramework, Assert } from '@GasOnlineTestFramework';
```

### Standalone (Copy to GAS Project)

Copy `TestFramework.js` and `Assert.js` to your Google Apps Script project.

## Quick Start

### Basic Test Suite

```javascript
import { TestFramework, Assert } from '@GasOnlineTestFramework';

function runMyTests() {
  const framework = new TestFramework('My Test Suite');

  framework.test('should add numbers correctly', () => {
    const result = 1 + 1;
    Assert.equals(result, 2, 'Addition should work');
  });

  framework.test('should create spreadsheet', () => {
    const sheet = SpreadsheetApp.create('Test Sheet');
    Assert.notNull(sheet, 'Sheet should be created');

    // Cleanup
    DriveApp.getFileById(sheet.getId()).setTrashed(true);
  });

  const results = framework.run();
  return results;
}
```

### With Setup and Teardown

```javascript
function runTestsWithHooks() {
  const framework = new TestFramework('Suite with Hooks');
  let testSpreadsheet;

  framework
    .setup(() => {
      // Runs before all tests
      Logger.log('Creating test spreadsheet...');
      testSpreadsheet = SpreadsheetApp.create('Test Data');
    })
    .teardown(() => {
      // Runs after all tests
      Logger.log('Cleaning up...');
      if (testSpreadsheet) {
        DriveApp.getFileById(testSpreadsheet.getId()).setTrashed(true);
      }
    });

  framework.test('should write to spreadsheet', () => {
    const sheet = testSpreadsheet.getActiveSheet();
    sheet.getRange('A1').setValue('Test Value');

    const value = sheet.getRange('A1').getValue();
    Assert.equals(value, 'Test Value');
  });

  return framework.run();
}
```

### Skipping Tests

```javascript
framework.test(
  'work in progress test',
  () => {
    // Not yet implemented
  },
  { skip: true }
); // Will be reported as ⊘ SKIP
```

### Custom Timeout

```javascript
framework.test(
  'long running operation',
  () => {
    // Long operation...
    Utilities.sleep(5000);
    Assert.isTrue(true);
  },
  { timeout: 10000 }
); // 10 seconds timeout
```

## API Reference

### TestFramework

#### Constructor

```javascript
new TestFramework(suiteName: string)
```

Creates a new test framework instance.

**Parameters:**

- `suiteName` - Name of the test suite

#### Methods

##### setup(fn)

Register a setup function to run before all tests.

```javascript
framework.setup(() => {
  // Setup code
});
```

**Parameters:**

- `fn` - Setup function

**Returns:** `TestFramework` (for chaining)

##### teardown(fn)

Register a teardown function to run after all tests.

```javascript
framework.teardown(() => {
  // Cleanup code
});
```

**Parameters:**

- `fn` - Teardown function

**Returns:** `TestFramework` (for chaining)

##### test(name, fn, options)

Register a test.

```javascript
framework.test(
  'test name',
  () => {
    // Test code
  },
  { skip: false, timeout: 30000 }
);
```

**Parameters:**

- `name` - Test name
- `fn` - Test function
- `options` - Optional configuration
  - `skip` - Skip this test (default: false)
  - `timeout` - Timeout in milliseconds (default: 30000)

**Returns:** `TestFramework` (for chaining)

##### registerResource(type, id, cleanupFn)

Register a resource for cleanup.

```javascript
framework.registerResource('spreadsheet', sheetId, () => {
  DriveApp.getFileById(sheetId).setTrashed(true);
});
```

**Parameters:**

- `type` - Resource type (for logging)
- `id` - Resource identifier
- `cleanupFn` - Function to cleanup the resource

##### run()

Run all registered tests.

```javascript
const results = framework.run();
```

**Returns:** Object with test results

```javascript
{
  passed: number,
  failed: number,
  skipped: number,
  errors: Array<{
    test: string,
    error: string,
    stack: string
  }>
}
```

### Assert

Static class with assertion methods. All methods throw an `Error` if the assertion fails.

#### Value Assertions

##### isTrue(value, message)

Assert that value is truthy.

```javascript
Assert.isTrue(result, 'Should be true');
```

##### isFalse(value, message)

Assert that value is falsy.

```javascript
Assert.isFalse(result, 'Should be false');
```

##### notNull(value, message)

Assert that value is not null or undefined.

```javascript
Assert.notNull(result, 'Should not be null');
```

##### isNull(value, message)

Assert that value is null or undefined.

```javascript
Assert.isNull(result, 'Should be null');
```

#### Equality Assertions

##### equals(actual, expected, message)

Assert strict equality (===).

```javascript
Assert.equals(actual, 42, 'Should equal 42');
```

##### deepEquals(actual, expected, message)

Assert deep equality for objects (JSON comparison).

```javascript
Assert.deepEquals(obj1, obj2, 'Objects should match');
```

#### Type Assertions

##### isType(value, type, message)

Assert that value is of specified type (typeof).

```javascript
Assert.isType(value, 'string', 'Should be string');
```

##### isInstanceOf(value, className, message)

Assert that value is instance of class.

```javascript
Assert.isInstanceOf(obj, MyClass, 'Should be MyClass instance');
```

#### Array Assertions

##### contains(array, value, message)

Assert that array contains value.

```javascript
Assert.contains([1, 2, 3], 2, 'Array should contain 2');
```

##### arrayLength(array, expectedLength, message)

Assert array length.

```javascript
Assert.arrayLength(arr, 5, 'Should have 5 elements');
```

#### String Assertions

##### matches(value, regex, message)

Assert that value matches regex pattern.

```javascript
Assert.matches(uuid, /^[a-f0-9-]{36}$/, 'Should be valid UUID');
```

#### Numeric Assertions

##### greaterThan(actual, expected, message)

Assert that number is greater than expected.

```javascript
Assert.greaterThan(value, 10, 'Should be > 10');
```

##### lessThan(actual, expected, message)

Assert that number is less than expected.

```javascript
Assert.lessThan(value, 100, 'Should be < 100');
```

##### greaterThanOrEqual(actual, expected, message)

Assert that number is >= expected.

```javascript
Assert.greaterThanOrEqual(value, 10, 'Should be >= 10');
```

##### lessThanOrEqual(actual, expected, message)

Assert that number is <= expected.

```javascript
Assert.lessThanOrEqual(value, 100, 'Should be <= 100');
```

#### Exception Assertions

##### throws(fn, expectedMessage, message)

Assert that function throws an error.

```javascript
Assert.throws(
  () => {
    throw new Error('Oops');
  },
  'Oops',
  'Should throw error'
);
```

##### doesNotThrow(fn, message)

Assert that function does not throw.

```javascript
Assert.doesNotThrow(() => {
  return 42;
}, 'Should not throw');
```

##### fail(message)

Always fail with a message.

```javascript
Assert.fail('This should not be reached');
```

## Output Format

### Console Output

Tests produce formatted output using Google Apps Script's `Logger.log`:

```
═══════════════════════════════════════════════
Running Test Suite: My Test Suite
═══════════════════════════════════════════════

Running setup...

▶ Running: should add numbers correctly
  ✓ PASS (45ms)

▶ Running: should create spreadsheet
  ✓ PASS (1234ms)

⊘ SKIP: work in progress test

Running teardown...

Cleaning up test resources...

═══════════════════════════════════════════════
Test Summary
═══════════════════════════════════════════════
Total:   3
Passed:  2 ✓
Failed:  0 ✗
Skipped: 1 ⊘
═══════════════════════════════════════════════
```

### Unicode Symbols

| Symbol | Meaning             |
| ------ | ------------------- |
| ✓      | Test passed         |
| ✗      | Test failed         |
| ⊘      | Test skipped        |
| ▶      | Test running        |
| ═      | Primary separator   |
| ─      | Secondary separator |

### Failed Test Output

```
▶ Running: should fail
  ✗ FAIL: Values are not equal
  Stack: Error: Values are not equal
Expected: 42
Actual: 41
    at Assert.equals (Assert.js:25)
    at test function (MyTests.gs:15)
```

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on state from other tests:

```javascript
// ✅ GOOD - Creates own resources
framework.test('isolated test', () => {
  const sheet = SpreadsheetApp.create('Test');
  // ... test logic
  DriveApp.getFileById(sheet.getId()).setTrashed(true);
});

// ❌ BAD - Depends on shared state
let sharedSheet;
framework.test('test 1', () => {
  sharedSheet = SpreadsheetApp.create('Shared');
});
framework.test('test 2', () => {
  // Fails if test 1 is skipped
  sharedSheet.getActiveSheet().getRange('A1').setValue('test');
});
```

### 2. Descriptive Test Names

Use clear, descriptive names that explain what is being tested:

```javascript
// ✅ GOOD
framework.test('should return UUID with valid format', () => {});
framework.test('should throw error when input is null', () => {});

// ❌ BAD
framework.test('test 1', () => {});
framework.test('uuid test', () => {});
```

### 3. Meaningful Assertion Messages

Provide clear messages that help diagnose failures:

```javascript
// ✅ GOOD
Assert.equals(users.length, 5, 'Should return exactly 5 active users');

// ❌ BAD
Assert.equals(users.length, 5, 'Test failed');
```

### 4. Resource Cleanup

Always clean up resources created during tests:

```javascript
framework.teardown(() => {
  // Clean up ALL resources
  if (testSpreadsheet) {
    DriveApp.getFileById(testSpreadsheet.getId()).setTrashed(true);
  }
  if (testDocument) {
    DriveApp.getFileById(testDocument.getId()).setTrashed(true);
  }
});
```

### 5. Use Setup for Common Initialization

Extract common setup logic to the setup hook:

```javascript
let db, logger, utils;

framework.setup(() => {
  logger = new LoggerService();
  utils = new UtilsService();

  const sheet = SpreadsheetApp.create('Test DB');
  db = new DatabaseService(sheet.getId(), logger, utils);
});
```

## Advanced Usage

### Custom Resource Management

```javascript
class TestResourceManager {
  constructor() {
    this.resources = [];
  }

  track(resource) {
    this.resources.push(resource);
    return resource;
  }

  cleanup() {
    this.resources.forEach((resource) => {
      DriveApp.getFileById(resource.getId()).setTrashed(true);
    });
    this.resources = [];
  }
}

function runTestsWithResourceManager() {
  const framework = new TestFramework('Advanced Tests');
  const resources = new TestResourceManager();

  framework.teardown(() => {
    resources.cleanup();
  });

  framework.test('creates multiple resources', () => {
    const sheet1 = resources.track(SpreadsheetApp.create('Sheet 1'));
    const sheet2 = resources.track(SpreadsheetApp.create('Sheet 2'));

    Assert.notNull(sheet1);
    Assert.notNull(sheet2);
  });

  return framework.run();
}
```

### Test Suites Organization

```javascript
// Main test runner
function runAllTests() {
  const suites = [runCoreUtilsTests, runDatabaseTests, runApiWrapperTests];

  const allResults = {
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped: 0
  };

  suites.forEach((suite) => {
    const results = suite();
    allResults.totalPassed += results.passed;
    allResults.totalFailed += results.failed;
    allResults.totalSkipped += results.skipped;
  });

  Logger.log('');
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('MASTER TEST SUMMARY');
  Logger.log('═══════════════════════════════════════════════');
  Logger.log(`Total Passed:  ${allResults.totalPassed} ✓`);
  Logger.log(`Total Failed:  ${allResults.totalFailed} ✗`);
  Logger.log(`Total Skipped: ${allResults.totalSkipped} ⊘`);
  Logger.log('═══════════════════════════════════════════════');

  return allResults;
}

function runCoreUtilsTests() {
  const framework = new TestFramework('CoreUtils Tests');
  // ... tests
  return framework.run();
}

function runDatabaseTests() {
  const framework = new TestFramework('Database Tests');
  // ... tests
  return framework.run();
}
```

## Comparison with Jest

| Feature     | GasOnlineTestFramework   | Jest          |
| ----------- | ------------------------ | ------------- |
| Environment | Google Apps Script       | Node.js       |
| API Testing | Real GAS APIs            | Mocked APIs   |
| Speed       | Slower (real operations) | Fast (mocked) |
| Setup       | None (GAS native)        | npm install   |
| Coverage    | Not supported            | Built-in      |
| Matchers    | 15+ assertions           | 50+ matchers  |
| Async       | Not needed (GAS is sync) | Full support  |
| Best For    | Integration tests        | Unit tests    |

## Integration with GasLibraryFactory

This framework is used throughout the GasLibraryFactory monorepo for online testing:

```
GasLibraryFactory/
├── CoreUtilsLib/__testOnline__/OnlineTests.gs
├── GasResilienceLib/__testOnline__/OnlineTests.gs
├── GoogleApiWrapper/__testOnline__/OnlineTests.gs
└── ... (all libraries)
```

Each library's online tests use this framework:

```javascript
import { TestFramework, Assert } from '@GasOnlineTestFramework';

function runCoreUtilsLibOnlineTests() {
  const framework = new TestFramework('CoreUtilsLib Online Tests');

  framework.test('UUID generation', () => {
    const utils = new UtilsService();
    const uuid = utils.generateUUID();

    Assert.notNull(uuid);
    Assert.matches(uuid, /^[a-zA-Z0-9_-]{21}$/);
  });

  return framework.run();
}
```

## Troubleshooting

### Tests Timeout

**Problem:** Tests exceed maximum execution time

**Solution:**

```javascript
// Increase timeout for specific tests
framework.test(
  'long operation',
  () => {
    // ...
  },
  { timeout: 60000 }
); // 1 minute

// Or reduce test data volume
const testData = generateData(10); // instead of 1000
```

### Quota Errors

**Problem:** "Service invoked too many times"

**Solution:**

```javascript
// Add delays between operations
Utilities.sleep(1000);

// Or batch operations
const batchSize = 10;
for (let i = 0; i < data.length; i += batchSize) {
  const batch = data.slice(i, i + batchSize);
  processBatch(batch);
  Utilities.sleep(1000);
}
```

### Resources Not Cleaned Up

**Problem:** Test resources accumulate in Drive

**Solution:**

```javascript
// Always use teardown hook
framework.teardown(() => {
  // Clean ALL resources
  createdResources.forEach((id) => {
    try {
      DriveApp.getFileById(id).setTrashed(true);
    } catch (e) {
      Logger.log(`Warning: Failed to delete ${id}`);
    }
  });
});
```

## Version History

### v1.0.0 (2025-12-10)

- Initial release
- TestFramework with setup/teardown
- 15+ assertion methods
- Resource management
- Skip and timeout support
- Detailed reporting

## License

Part of GasLibraryFactory monorepo.

## Contributing

This library is part of the GasLibraryFactory project. Please see the main project README for contribution guidelines.

## Related Documentation

- [ONLINE_TESTS.md](../ONLINE_TESTS.md) - Complete guide to online testing in GasLibraryFactory
- [INTEGRATION_TEST_EXECUTION_GUIDE.md](../INTEGRATION_TEST_EXECUTION_GUIDE.md) - Integration test guide
- [CLAUDE.md](../CLAUDE.md) - Project architecture and guidelines
