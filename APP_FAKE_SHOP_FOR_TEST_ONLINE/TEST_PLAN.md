# FakeShop Test Plan

## Overview

This document outlines all local offline tests (Jest) and online tests (GasOnlineTestFramework) for the FakeShop demonstration application.

---

## Local Offline Tests (Jest)

### 1. Domain Layer Tests

#### 1.1 Entity Tests

##### Employee.test.js

```javascript
describe('Employee Entity', () => {
  describe('creation', () => {
    it('should create employee with valid data');
    it('should generate UUID if not provided');
    it('should validate required fields');
    it('should reject invalid email format');
    it('should reject invalid role');
    it('should set default status to ACTIVE');
  });

  describe('status transitions', () => {
    it('should transition from ACTIVE to ON_LEAVE');
    it('should transition from ON_LEAVE to ACTIVE');
    it('should transition from ACTIVE to TERMINATED');
    it('should not allow transition from TERMINATED');
  });

  describe('delegation', () => {
    it('should set delegate when going on leave');
    it('should clear delegate when returning');
    it('should validate delegation dates');
    it('should not allow self-delegation');
  });

  describe('dirty tracking', () => {
    it('should mark as dirty when properties change');
    it('should track which properties changed');
    it('should clear dirty flag after save');
  });
});
```

##### Customer.test.js

```javascript
describe('Customer Entity', () => {
  describe('creation', () => {
    it('should create customer with valid data');
    it('should validate email value object');
    it('should validate address value object');
    it('should set default type to REGULAR');
    it('should initialize counters to zero');
  });

  describe('customer types', () => {
    it('should allow promotion to VIP');
    it('should allow promotion to WHOLESALE');
    it('should track total orders');
    it('should track total spent');
  });

  describe('value objects', () => {
    it('should use Email value object');
    it('should use Address value object');
    it('should use PhoneNumber value object');
  });
});
```

##### Product.test.js

```javascript
describe('Product Entity', () => {
  describe('creation', () => {
    it('should create product with valid data');
    it('should validate SKU format');
    it('should require positive price');
    it('should require non-negative stock');
    it('should validate category');
  });

  describe('dynamic attributes', () => {
    it('should accept ELECTRONICS attributes');
    it('should accept CLOTHING attributes');
    it('should accept HOME attributes');
    it('should accept FOOD attributes');
    it('should reject attributes for wrong category');
  });

  describe('stock management', () => {
    it('should reserve stock');
    it('should release reserved stock');
    it('should not allow negative stock');
    it('should calculate available quantity');
    it('should identify low stock condition');
  });

  describe('status', () => {
    it('should mark as OUT_OF_STOCK when stock is zero');
    it('should mark as DISCONTINUED');
    it('should not allow orders for DISCONTINUED products');
  });
});
```

##### Order.test.js

```javascript
describe('Order Aggregate', () => {
  describe('creation', () => {
    it('should create order with valid data');
    it('should generate order number');
    it('should set status to PENDING');
    it('should require customer');
    it('should require at least one item');
  });

  describe('order items', () => {
    it('should add items to order');
    it('should calculate line totals');
    it('should validate item quantities');
    it('should not allow duplicate products');
    it('should update totals when items change');
  });

  describe('pricing calculations', () => {
    it('should calculate subtotal');
    it('should calculate tax based on category');
    it('should calculate shipping');
    it('should calculate total');
    it('should apply VIP discount');
    it('should apply wholesale discount');
    it('should apply first-time customer discount');
  });

  describe('status transitions', () => {
    it('should transition PENDING -> CONFIRMED');
    it('should transition CONFIRMED -> PROCESSING');
    it('should transition PROCESSING -> SHIPPED');
    it('should transition SHIPPED -> DELIVERED');
    it('should allow PENDING -> CANCELLED');
    it('should allow CONFIRMED -> CANCELLED');
    it('should not allow SHIPPED -> CANCELLED');
    it('should not allow DELIVERED -> CANCELLED');
  });

  describe('domain events', () => {
    it('should emit OrderCreatedEvent');
    it('should emit OrderShippedEvent');
    it('should collect events for dispatch');
  });
});
```

#### 1.2 Value Object Tests

##### Email.test.js

```javascript
describe('Email Value Object', () => {
  it('should create valid email');
  it('should reject invalid email format');
  it('should reject empty email');
  it('should be immutable');
  it('should implement equality correctly');
  it('should normalize to lowercase');
});
```

##### Money.test.js

```javascript
describe('Money Value Object', () => {
  it('should create with amount and currency');
  it('should default to USD');
  it('should reject negative amounts');
  it('should add two Money values');
  it('should subtract Money values');
  it('should multiply by scalar');
  it('should reject operations on different currencies');
  it('should format as currency string');
  it('should be immutable');
  it('should implement equality correctly');
});
```

##### Address.test.js

```javascript
describe('Address Value Object', () => {
  it('should create valid address');
  it('should require line1, city, postal_code, country');
  it('should allow optional line2');
  it('should be immutable');
  it('should implement equality correctly');
  it('should format as single line');
  it('should format as multi-line');
});
```

##### OrderNumber.test.js

```javascript
describe('OrderNumber Value Object', () => {
  it('should generate order number with year prefix');
  it('should increment sequence number');
  it('should format as ORD-YYYY-NNNNN');
  it('should parse existing order number');
  it('should extract year from order number');
  it('should be immutable');
});
```

#### 1.3 Repository Tests

##### EmployeeRepository.test.js

```javascript
describe('EmployeeRepository', () => {
  describe('CRUD operations', () => {
    it('should find employee by ID');
    it('should find employee by email');
    it('should find all active employees');
    it('should find employees by department');
    it('should save new employee');
    it('should update existing employee');
    it('should handle not found');
  });

  describe('delegation queries', () => {
    it('should find employees with active delegations');
    it('should find delegate for employee');
    it('should find employees delegating to specific person');
  });
});
```

##### OrderRepository.test.js

```javascript
describe('OrderRepository', () => {
  describe('single partition', () => {
    it('should find order by ID');
    it('should find orders by customer');
    it('should find orders by status');
    it('should save new order');
    it('should update existing order');
  });

  describe('multi-partition', () => {
    it('should route to correct partition by year');
    it('should query across partitions');
    it('should aggregate data across partitions');
    it('should respect read-only partitions');
  });
});
```

#### 1.4 Specification Tests

##### ActiveEmployeeSpec.test.js

```javascript
describe('ActiveEmployeeSpec', () => {
  it('should satisfy for ACTIVE employee');
  it('should not satisfy for ON_LEAVE employee');
  it('should not satisfy for TERMINATED employee');
  it('should compose with other specifications');
});
```

##### VipCustomerSpec.test.js

```javascript
describe('VipCustomerSpec', () => {
  it('should satisfy for VIP customer');
  it('should not satisfy for REGULAR customer');
  it('should not satisfy for WHOLESALE customer');
});
```

##### LowStockProductSpec.test.js

```javascript
describe('LowStockProductSpec', () => {
  it('should satisfy when stock <= reorder level');
  it('should not satisfy when stock > reorder level');
  it('should identify critical level (50% of reorder)');
});
```

##### HighValueOrderSpec.test.js

```javascript
describe('HighValueOrderSpec', () => {
  it('should satisfy for orders over threshold');
  it('should not satisfy for orders under threshold');
  it('should accept configurable threshold');
});
```

---

### 2. Service Layer Tests

##### EmployeeService.test.js

```javascript
describe('EmployeeService', () => {
  describe('createEmployee', () => {
    it('should create employee and emit event');
    it('should validate unique email');
    it('should assign to department');
  });

  describe('createDelegation', () => {
    it('should create delegation record');
    it('should update employee status to ON_LEAVE');
    it('should set delegate reference');
    it('should validate delegation period');
    it('should detect circular delegation');
  });

  describe('revokeDelegation', () => {
    it('should revoke active delegation');
    it('should update employee status to ACTIVE');
    it('should clear delegate reference');
  });
});
```

##### OrderService.test.js

```javascript
describe('OrderService', () => {
  describe('createOrder', () => {
    it('should validate customer exists');
    it('should validate products exist');
    it('should validate stock availability');
    it('should calculate pricing');
    it('should create order record');
  });

  describe('processOrder', () => {
    it('should execute full pipeline');
    it('should handle validation failures');
    it('should handle inventory failures');
    it('should rollback on error');
  });

  describe('cancelOrder', () => {
    it('should cancel pending order');
    it('should release reserved inventory');
    it('should not cancel shipped order');
  });
});
```

##### AnalyticsService.test.js

```javascript
describe('AnalyticsService', () => {
  describe('getYearlyTotals', () => {
    it('should aggregate orders by year');
    it('should query across partitions');
    it('should calculate totals correctly');
  });

  describe('getYearOverYearComparison', () => {
    it('should compare current year to previous');
    it('should calculate percentage changes');
    it('should handle missing previous year data');
  });

  describe('getCustomerLifetimeValue', () => {
    it('should sum all orders across years');
    it('should query all partitions');
  });

  describe('getTopProducts', () => {
    it('should rank products by quantity sold');
    it('should limit to specified count');
    it('should filter by date range');
  });
});
```

---

### 3. Pipeline Tests

##### OrderProcessingPipeline.test.js

```javascript
describe('OrderProcessingPipeline', () => {
  describe('full execution', () => {
    it('should execute all steps in order');
    it('should pass context between steps');
    it('should collect all results');
    it('should handle successful completion');
  });

  describe('ValidateOrderStep', () => {
    it('should validate customer exists');
    it('should validate products exist');
    it('should validate stock available');
    it('should fail for invalid customer');
    it('should fail for invalid product');
    it('should fail for insufficient stock');
  });

  describe('CalculatePricingStep', () => {
    it('should calculate line totals');
    it('should apply VIP discount');
    it('should apply wholesale discount');
    it('should apply first-time customer discount');
    it('should calculate tax by category');
    it('should calculate shipping');
  });

  describe('ReserveInventoryStep', () => {
    it('should decrement stock quantities');
    it('should use locking for concurrency');
    it('should rollback on failure');
    it('should handle partial reservation failure');
  });

  describe('CreateOrderRecordStep', () => {
    it('should generate order number');
    it('should insert order record');
    it('should insert order items');
    it('should execute post-processors');
  });

  describe('GenerateInvoiceStep', () => {
    it('should assemble context from providers');
    it('should process template placeholders');
    it('should create document in Drive');
    it('should set file permissions');
    it('should update order with invoice URL');
  });

  describe('SendConfirmationStep', () => {
    it('should compose email content');
    it('should resolve notification recipient');
    it('should follow delegation chain');
    it('should send email in dry-run mode');
    it('should log dry-run result');
  });

  describe('post-processors', () => {
    it('should execute CellUpdatePostProcessor');
    it('should execute LogAuditPostProcessor');
    it('should execute CounterUpdatePostProcessor');
    it('should respect WhenCondition');
  });

  describe('error handling', () => {
    it('should stop on step failure');
    it('should invoke error handler');
    it('should preserve context on failure');
    it('should support recovery');
  });
});
```

##### EmployeeDelegationPipeline.test.js

```javascript
describe('EmployeeDelegationPipeline', () => {
  describe('full execution', () => {
    it('should execute all delegation steps');
    it('should handle successful delegation');
  });

  describe('ValidateDelegationStep', () => {
    it('should validate delegator exists');
    it('should validate delegate exists');
    it('should detect circular delegation');
    it('should validate date range');
  });

  describe('CreateDelegationRecordStep', () => {
    it('should insert delegation record');
    it('should update employee records');
  });

  describe('TransferPermissionsStep', () => {
    it('should query delegator permissions');
    it('should grant permissions to delegate');
    it('should log permission changes');
  });

  describe('NotifyStakeholdersStep', () => {
    it('should generate delegation notice');
    it('should resolve notification recipients');
    it('should use BROADCAST_TEAM routing');
    it('should send notifications in dry-run');
  });
});
```

---

### 4. Provider Tests

##### OrderDataProvider.test.js

```javascript
describe('OrderDataProvider', () => {
  it('should implement DataProviderInterface');
  it('should fetch order by ID');
  it('should include order items');
  it('should resolve customer reference');
  it('should resolve employee reference');
  it('should handle not found');
});
```

##### AnalyticsDataProvider.test.js

```javascript
describe('AnalyticsDataProvider', () => {
  it('should implement DataProviderInterface');
  it('should calculate metrics for period');
  it('should support cross-partition queries');
  it('should cache results');
});
```

---

### 5. Composer Tests

##### InvoiceComposer.test.js

```javascript
describe('InvoiceComposer', () => {
  it('should compose invoice content');
  it('should render all placeholders');
  it('should format currency values');
  it('should format dates');
  it('should handle delegation information');
  it('should render item list');
});
```

##### ReportComposer.test.js

```javascript
describe('ReportComposer', () => {
  it('should compose report from blocks');
  it('should evaluate block visibility');
  it('should render to HTML');
  it('should render to Markdown');
  it('should handle empty blocks');
});
```

---

### 6. Role Tests

##### DelegationManager.test.js

```javascript
describe('DelegationManager', () => {
  describe('createDelegation', () => {
    it('should create delegation successfully');
    it('should validate delegator');
    it('should validate delegate');
    it('should detect circular references');
    it('should respect max chain depth');
  });

  describe('resolveDelegation', () => {
    it('should return delegator if active');
    it('should return delegate if on leave');
    it('should follow chain up to 3 levels');
    it('should stop at max depth');
    it('should handle expired delegations');
  });

  describe('revokeDelegation', () => {
    it('should mark delegation as revoked');
    it('should update employee records');
  });
});
```

##### RoutingPolicies.test.js

```javascript
describe('RoutingPolicies', () => {
  describe('FIRST_AVAILABLE', () => {
    it('should return first resolved actor');
    it('should follow delegation');
  });

  describe('ALL_MATCHING', () => {
    it('should return all actors with role');
    it('should follow all delegations');
  });

  describe('BROADCAST_TEAM', () => {
    it('should return all team members');
    it('should filter by department');
  });

  describe('ESCALATION', () => {
    it('should try each level');
    it('should stop on success');
  });

  describe('ROUND_ROBIN', () => {
    it('should distribute evenly');
    it('should track assignment count');
  });
});
```

---

### 7. Integration Tests

##### OrderWorkflow.integration.test.js

```javascript
describe('Order Workflow Integration', () => {
  it('should process order end-to-end');
  it('should create invoice document');
  it('should send confirmation email (dry-run)');
  it('should update all database records');
  it('should log to audit trail');
});
```

##### DelegationWorkflow.integration.test.js

```javascript
describe('Delegation Workflow Integration', () => {
  it('should create delegation end-to-end');
  it('should transfer permissions');
  it('should notify stakeholders');
  it('should resolve roles through delegation');
});
```

##### MultiDatabaseQueries.integration.test.js

```javascript
describe('Multi-Database Integration', () => {
  it('should query single partition');
  it('should query across all partitions');
  it('should aggregate data correctly');
  it('should respect read-only partitions');
  it('should route writes to current partition');
});
```

##### ReportGeneration.integration.test.js

```javascript
describe('Report Generation Integration', () => {
  it('should gather data from all sources');
  it('should compose report content');
  it('should generate document');
  it('should handle large datasets');
});
```

---

## Online Tests (GasOnlineTestFramework)

### Test Suite: EmployeeManagement.online.js

```javascript
// Tests that require real Google Apps Script environment
describe('Employee Management Online', () => {
  setup(() => {
    // Create test employees in real spreadsheet
  });

  teardown(() => {
    // Clean up test data
  });

  it('should create employee in spreadsheet');
  it('should update employee record');
  it('should query employees by department');
  it('should handle concurrent updates');
});
```

### Test Suite: OrderProcessing.online.js

```javascript
describe('Order Processing Online', () => {
  it('should execute full pipeline in GAS environment');
  it('should create invoice document in Drive');
  it('should send dry-run email');
  it('should update all records');
});
```

### Test Suite: DelegationSystem.online.js

```javascript
describe('Delegation System Online', () => {
  it('should create delegation record');
  it('should transfer file permissions');
  it('should resolve delegated role');
  it('should revoke delegation');
});
```

### Test Suite: MultiDatabaseQueries.online.js

```javascript
describe('Multi-Database Online', () => {
  it('should connect to multiple spreadsheets');
  it('should execute cross-partition query');
  it('should aggregate yearly data');
  it('should handle network errors with retry');
});
```

### Test Suite: TemplateProcessing.online.js

```javascript
describe('Template Processing Online', () => {
  it('should load template from Drive');
  it('should process placeholders');
  it('should save generated document');
  it('should set document permissions');
});
```

### Test Suite: ReportGeneration.online.js

```javascript
describe('Report Generation Online', () => {
  it('should assemble report context');
  it('should compose report blocks');
  it('should generate report document');
  it('should handle long-running job');
});
```

### Test Suite: EmailDryRun.online.js

```javascript
describe('Email Dry Run Online', () => {
  it('should compose email content');
  it('should log dry-run details');
  it('should not actually send email');
  it('should record in audit log');
});
```

---

## Test Data Management

### Fixtures Usage

| Fixture        | Used By                                     | Description                       |
| -------------- | ------------------------------------------- | --------------------------------- |
| employees.json | Employee tests, Delegation tests            | 6 employees with various statuses |
| customers.json | Customer tests, Order tests                 | 5 customers of different types    |
| products.json  | Product tests, Order tests, Inventory tests | 7 products across categories      |
| orders.json    | Order tests, Analytics tests                | 10 orders across 3 years          |
| templates.json | Template tests, Composer tests              | Template metadata                 |

### Mock Configuration

```javascript
// GoogleServiceMocks.js
const createMocks = () => ({
  SpreadsheetApp: createSpreadsheetAppMock(),
  DriveApp: createDriveAppMock(),
  DocumentApp: createDocumentAppMock(),
  GmailApp: createGmailAppMock(),
  CacheService: createCacheServiceMock(),
  PropertiesService: createPropertiesServiceMock(),
  LockService: createLockServiceMock(),
  Utilities: createUtilitiesMock()
});
```

---

## Coverage Targets

| Module          | Target | Notes                       |
| --------------- | ------ | --------------------------- |
| Domain Entities | 95%    | All business logic          |
| Value Objects   | 100%   | Immutable, must be complete |
| Repositories    | 90%    | CRUD + queries              |
| Services        | 90%    | Business operations         |
| Pipelines       | 85%    | Step execution              |
| Specifications  | 100%   | Business rules              |
| Providers       | 90%    | Data retrieval              |
| Composers       | 90%    | Content generation          |
| Role Resolution | 95%    | Delegation logic            |

---

## Running Tests

### Local Tests

```bash
# Run all FakeShop tests
npm test -- APP_FAKE_SHOP_FOR_TEST_ONLINE

# Run specific test file
npm test -- APP_FAKE_SHOP_FOR_TEST_ONLINE/__tests__/unit/domain/Order.test.js

# Run with coverage
npm run test:coverage -- --collectCoverageFrom="APP_FAKE_SHOP_FOR_TEST_ONLINE/**/*.js"

# Run integration tests only
npm run test:integration -- APP_FAKE_SHOP_FOR_TEST_ONLINE
```

### Online Tests

```javascript
// In Google Apps Script editor

// Run all online tests
function runAllOnlineTests() {
  const framework = new TestFramework();
  // Register all suites...
  return framework.run();
}

// Run specific suite
function runOrderTests() {
  const framework = new TestFramework();
  // Register order suite only...
  return framework.run();
}
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-03
