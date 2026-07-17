# Mock Centralization Guide (Testing SDK)

## Overview

All mocks in this project are centralized in `/test/fakes/` and within each library's `src/testing/mocks.js` file. This architecture ensures high-fidelity testing, zero duplication, and consistent behavior across the entire monorepo.

## Architecture

```
/test/fakes/
├── index.js                    # Single import point
├── MockFactory.js              # Centralized orchestrator (Standardized Testing SDK)
└── empty-mocks.js             # Utility for providing empty mocks

/{Library}/src/testing/
└── mocks.js                    # High-fidelity Jest-based mocks for each library
```

## Standardized Jest Mocks

All mocks in the project are now high-fidelity Jest mocks. They use Jest's spy system but include "Happy Path" logic (e.g., in-memory storage, immediate retry) to provide realistic behavior without the overhead of full fake classes.

**Benefits:**

- Assertion capabilities (e.g., `logger.hasLog('pattern')`)
- Stateful behavior (e.g., `cache` store, `properties` store)
- Lightweight and spy-capable
- Standardized across all libraries

**Example:**

```javascript
import { MockFactory } from '../../test/fakes';

const mocks = MockFactory.createAllJest();
// Use mocks.logger, mocks.cache, etc.

// Assertions
expect(mocks.logger.hasLog('INFO', 'Started')).toBe(true);
expect(mocks.cache.get('key')).toBe('value');
```

---

## Usage Patterns

### Pattern 1: All Standardized Mocks

For most integration and unit tests:

```javascript
import { MockFactory } from '../../test/fakes';

describe('My Service', () => {
  let mocks;

  beforeEach(() => {
    // Standardized Testing SDK - High fidelity
    mocks = MockFactory.createAllJest();
  });

  it('should work', () => {
    service.doSomething(mocks.logger, mocks.cache);
    expect(mocks.logger.hasLog('INFO', /success/)).toBe(true);
  });
});
```

### Pattern 2: Individual Mocks

When you only need specific mocks:

```javascript
import { MockFactory } from '../../test/fakes';

const logger = MockFactory.createJestLogger();
const cache = MockFactory.createJestCache();
const database = MockFactory.createJestDatabase({
  tables: { Users: MockFactory.createJestTable('Users') }
});
```

---

## Complete MockFactory API Reference

### Orchestration

| Method            | Returns                   | Use Case                       |
| ----------------- | ------------------------- | ------------------------------ |
| `createAllJest()` | Object with all SDK mocks | Standard high-fidelity testing |

### Library Mocks (Jest-based)

| Method                           | Returns                   | Library                 |
| -------------------------------- | ------------------------- | ----------------------- |
| `createJestLogger()`             | LoggerServiceMock         | CoreUtilsLib            |
| `createJestCache()`              | CacheInterfaceMock        | CoreUtilsLib            |
| `createJestUtils()`              | UtilsServiceMock          | CoreUtilsLib            |
| `createJestExceptionService()`   | ExceptionServiceMock      | GasResilienceLib        |
| `createJestDatabase()`           | DatabaseServiceMock       | SheetDBLib              |
| `createJestStep(name)`           | StepMock                  | PipelineFramework       |
| `createJestMonitor()`            | ProcessMonitorServiceMock | GasProcessMonitorLib    |
| `createJestSpreadsheetService()` | SpreadsheetServiceMock    | GoogleApiWrapper        |
| `createPropertiesService()`      | PropertiesServiceMock     | GoogleApiWrapper        |
| `createTriggerService()`         | TriggerServiceMock        | GoogleApiWrapper        |
| `createMustache()`               | MustacheMock              | WorkspaceTemplateEngine |

---

## Migration Best Practices

### ✅ DO

- Use `MockFactory.createAllJest()` for new tests.
- Leverage the helper methods on mocks (e.g., `logger.hasLog()`, `cache._store`).
- Replace inline `jest.fn()` blocks with standardized factory calls.
- Import exclusively from `/test/fakes` to ensure consistency.

### ❌ DON'T

- Don't import deleted `FakeLogger.js` or `FakeCacheService.js` files.
- Don't use legacy `createAll()` if you expect class instances (it now returns Jest mocks).
- Don't manually clear mocks in `afterEach` if using `createAllJest()` (it's handled automatically by the factory helpers if needed).

---

## Summary

The **Testing SDK** migration has unified the project under a single, high-fidelity mocking strategy. By combining the assertion power of "Smart Fakes" with the flexibility of "Jest Mocks," we have reduced boilerplate, increased test fidelity, and ensured that changes to service interfaces only need to be updated in one place (`mocks.js`).

**Result:**

- **Zero Duplication**: One mock implementation per service.
- **High Fidelity**: Mocks behave like real services (in-memory).
- **Fluent Assertions**: Use `hasLog`, `getLogsByLevel`, etc.
- **Standardized Contract**: All 4,300+ tests now speak the same language.

---

**Last Updated:** 2026-03-12
