# FakeShop Online Store - Complete Design Document

## Executive Summary

FakeShop is a comprehensive Google Apps Script demonstration application showcasing all features of the GasLibraryFactory monorepo. The application simulates an online store with employee management, order processing, inventory tracking, and multi-year analytics.

---

## Table of Contents

1. [Business Domain Overview](#1-business-domain-overview)
2. [Library Feature Mapping](#2-library-feature-mapping)
3. [Data Architecture](#3-data-architecture)
4. [Module Design](#4-module-design)
5. [Workflow Pipelines](#5-workflow-pipelines)
6. [Template System](#6-template-system)
7. [Multi-Database Strategy](#7-multi-database-strategy)
8. [Role & Delegation System](#8-role--delegation-system)
9. [API Endpoints](#9-api-endpoints)
10. [Test Strategy](#10-test-strategy)
11. [Implementation Phases](#11-implementation-phases)
12. [File Structure](#12-file-structure)

---

## 1. Business Domain Overview

### 1.1 Core Business Entities

| Entity       | Description                                                      |
| ------------ | ---------------------------------------------------------------- |
| **Employee** | Store staff with roles, departments, and delegation capabilities |
| **Customer** | Registered customers with purchase history                       |
| **Product**  | Inventory items with stock levels and pricing                    |
| **Order**    | Customer purchases with line items and status tracking           |
| **Supplier** | Inventory suppliers for restocking                               |
| **Report**   | Generated analytics documents                                    |

### 1.2 Business Processes

1. **Employee Management**
   - Hiring, role assignment, department allocation
   - Long-term illness handling with automatic delegation
   - Replacement chain resolution
   - Access permission management

2. **Order Processing**
   - Order creation and validation
   - Inventory reservation
   - Payment processing (simulated)
   - Fulfillment and shipping
   - Order confirmation emails (dry-run)

3. **Inventory Management**
   - Stock level tracking
   - Low stock alerts
   - Supplier order generation
   - Inventory reports

4. **Reporting & Analytics**
   - Daily/weekly/monthly sales reports
   - Multi-year trend analysis (cross-partition queries)
   - Employee performance reports
   - Inventory turnover analysis

---

## 2. Library Feature Mapping

### 2.1 Complete Library Usage Matrix

| Library                     | Feature Used               | Application Component                             |
| --------------------------- | -------------------------- | ------------------------------------------------- |
| **CoreUtilsLib**            | LoggerService              | All modules (centralized logging)                 |
|                             | UtilsService               | Date formatting, UUID generation, data transforms |
|                             | TypeGuards                 | Input validation across all services              |
|                             | ValidationUtils            | Interface validation for DI                       |
|                             | PiiRedactor                | Customer data protection in logs                  |
|                             | HashUtils                  | Order reference generation                        |
|                             | BoundedMap                 | In-memory caching for active sessions             |
| **GasResilienceLib**        | ExceptionService           | All Google API calls                              |
|                             | CircuitBreaker             | External service protection                       |
|                             | ErrorClassifier            | Automatic error categorization                    |
| **GoogleApiWrapper**        | DriveService               | Template storage, report generation               |
|                             | DocumentService            | Invoice/report document creation                  |
|                             | SpreadsheetService         | Database operations                               |
|                             | MailService (dry-run)      | Order confirmations, alerts                       |
|                             | PermissionService          | Employee file access control                      |
|                             | MenuBuilder                | Admin UI menu                                     |
|                             | SidebarBuilder             | Dashboard sidebar                                 |
|                             | DialogBuilder              | Confirmation dialogs                              |
|                             | CacheService               | Performance optimization                          |
|                             | PropertiesService          | Configuration storage                             |
|                             | LockService                | Concurrent order processing                       |
|                             | TriggerService             | Scheduled report generation                       |
| **WorkspaceTemplateEngine** | PlaceholderService         | Invoice generation                                |
|                             | Mustache                   | Email templates                                   |
|                             | DocumentProcessor          | Google Docs templates                             |
|                             | SheetProcessor             | Report sheet templates                            |
| **GasExpressionEngineLib**  | ExpressionEngineService    | Business rule evaluation                          |
|                             |                            | Discount eligibility                              |
|                             |                            | Stock alert conditions                            |
| **SheetDBLib**              | DatabaseService            | All data persistence                              |
|                             | TableService               | CRUD operations                                   |
|                             | AdvancedQueryBuilder       | Complex order queries                             |
|                             | ColumnFamily               | Dynamic product attributes                        |
|                             | SchemaResolver             | Multi-category product schemas                    |
|                             | MultiDatabaseManager       | Multi-year order archives                         |
|                             | CrossPartitionQuery        | Historical analytics                              |
|                             | PartitionRouter            | Year-based routing                                |
| **RoleResolutionLib**       | RoleResolver               | Employee role resolution                          |
|                             | Delegation                 | Illness replacement handling                      |
|                             | DelegationChain            | Multi-level delegation                            |
|                             | RoutingPolicy              | Notification routing                              |
|                             | RoleRegistry               | Role definitions                                  |
| **ComposableContentLib**    | ContentComposer            | Report content assembly                           |
|                             | BlockRegistry              | Reusable report sections                          |
|                             | HtmlRenderer               | Email body generation                             |
|                             | MarkdownRenderer           | Internal documentation                            |
| **JobRunnerLib**            | JobRunnerService           | Bulk order processing                             |
|                             | JobDefinitionRegistry      | Job type registration                             |
|                             | JobQueue                   | Background task management                        |
| **PipelineFramework**       | Pipeline                   | Order processing workflow                         |
|                             | Step                       | Individual processing steps                       |
|                             | PostProcessableStep        | Auto-updates after steps                          |
|                             | CellUpdatePostProcessor    | Status updates                                    |
|                             | LogAuditPostProcessor      | Audit trail                                       |
|                             | CounterUpdatePostProcessor | Statistics counters                               |
| **ContextEngine**           | ContextAssembler           | Data gathering for reports                        |
|                             | ProviderRegistry           | Data provider management                          |
|                             | SwapAndEnrichInterceptor   | Testing/staging swaps                             |
|                             | DependencyResolver         | Provider dependencies                             |
| **GasDataImporter**         | ImportEngine               | Supplier catalog imports                          |
|                             | SourceStrategy             | Multiple import sources                           |
|                             | Transformer                | Data normalization                                |
| **DomainRepositoryLib**     | Entity                     | Domain object base                                |
|                             | Repository                 | Data access patterns                              |
|                             | Specification              | Query specifications                              |
|                             | EntityMapper               | Sheet-to-entity mapping                           |
|                             | ZodValidator               | Schema validation                                 |
|                             | DomainEvent                | Event dispatching                                 |
| **GasOnlineTestFramework**  | TestFramework              | Online integration tests                          |
|                             | Assert                     | Test assertions                                   |
| **GasProcessMonitorLib**    | ProcessMonitorService      | Pipeline monitoring                               |
|                             | DashboardUi                | Real-time progress display                        |

---

## 3. Data Architecture

### 3.1 Google Drive Structure

```
📁 FakeShop_Root/
├── 📁 Databases/
│   ├── 📊 FakeShop_Master.gsheet       (Employees, Customers, Products, Suppliers)
│   ├── 📊 FakeShop_Orders_2024.gsheet  (Orders partition)
│   ├── 📊 FakeShop_Orders_2025.gsheet  (Orders partition)
│   └── 📊 FakeShop_Orders_2026.gsheet  (Orders partition - current)
├── 📁 Templates/
│   ├── 📄 Invoice_Template.gdoc
│   ├── 📄 Order_Confirmation_Email.gdoc
│   ├── 📄 Low_Stock_Alert_Email.gdoc
│   ├── 📄 Employee_Welcome_Letter.gdoc
│   ├── 📄 Delegation_Notice.gdoc
│   └── 📊 Monthly_Report_Template.gsheet
├── 📁 Generated_Documents/
│   ├── 📁 Invoices/
│   ├── 📁 Reports/
│   └── 📁 Letters/
├── 📁 Imports/
│   └── 📁 Supplier_Catalogs/
└── 📁 Config/
    └── 📊 App_Configuration.gsheet
```

### 3.2 Database Schemas

#### 3.2.1 Master Database Tables

**EMPLOYEES Table**
| Column | Type | Description |
|--------|------|-------------|
| employee_id | UUID | Primary key |
| email | STRING | Unique identifier |
| first_name | STRING | |
| last_name | STRING | |
| role | STRING | ADMIN, MANAGER, SALES, WAREHOUSE, SUPPORT |
| department | STRING | SALES, OPERATIONS, CUSTOMER_SERVICE |
| hire_date | DATE | |
| status | STRING | ACTIVE, ON_LEAVE, TERMINATED |
| manager_id | UUID | FK to EMPLOYEES |
| delegate_to | UUID | FK to EMPLOYEES (illness replacement) |
| delegation_start | DATE | |
| delegation_end | DATE | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**CUSTOMERS Table**
| Column | Type | Description |
|--------|------|-------------|
| customer_id | UUID | Primary key |
| email | STRING | Unique |
| first_name | STRING | |
| last_name | STRING | |
| phone | STRING | |
| address_line1 | STRING | |
| address_line2 | STRING | |
| city | STRING | |
| postal_code | STRING | |
| country | STRING | |
| customer_type | STRING | REGULAR, VIP, WHOLESALE |
| total_orders | INTEGER | Denormalized counter |
| total_spent | DECIMAL | Denormalized sum |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**PRODUCTS Table (with Dynamic Schema)**
| Column | Type | Description |
|--------|------|-------------|
| product*id | UUID | Primary key |
| sku | STRING | Unique |
| name | STRING | |
| description | TEXT | |
| category | STRING | ELECTRONICS, CLOTHING, HOME, FOOD |
| price | DECIMAL | |
| cost | DECIMAL | |
| stock_quantity | INTEGER | |
| reorder_level | INTEGER | |
| supplier_id | UUID | FK to SUPPLIERS |
| status | STRING | ACTIVE, DISCONTINUED, OUT_OF_STOCK |
| attr*\* | DYNAMIC | Category-specific attributes (ColumnFamily) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Dynamic Column Families for Products:**

- `ELECTRONICS`: attr_brand, attr_warranty_months, attr_voltage
- `CLOTHING`: attr_size, attr_color, attr_material
- `HOME`: attr_dimensions, attr_weight, attr_assembly_required
- `FOOD`: attr_expiry_date, attr_allergens, attr_organic

**SUPPLIERS Table**
| Column | Type | Description |
|--------|------|-------------|
| supplier_id | UUID | Primary key |
| name | STRING | |
| contact_email | STRING | |
| contact_phone | STRING | |
| address | STRING | |
| payment_terms | STRING | NET30, NET60, PREPAID |
| status | STRING | ACTIVE, INACTIVE |
| created_at | TIMESTAMP | |

**ROLES Table (for RoleResolutionLib)**
| Column | Type | Description |
|--------|------|-------------|
| role_id | UUID | Primary key |
| role_name | STRING | |
| scope_type | STRING | GLOBAL, DEPARTMENT, PROJECT |
| scope_value | STRING | |
| permissions | JSON | Array of permission strings |

**DELEGATIONS Table**
| Column | Type | Description |
|--------|------|-------------|
| delegation_id | UUID | Primary key |
| delegator_id | UUID | FK to EMPLOYEES |
| delegate_id | UUID | FK to EMPLOYEES |
| role_id | UUID | FK to ROLES |
| reason | STRING | ILLNESS, VACATION, TRAINING |
| start_date | DATE | |
| end_date | DATE | |
| status | STRING | ACTIVE, EXPIRED, REVOKED |

**AUDIT_LOG Table**
| Column | Type | Description |
|--------|------|-------------|
| log_id | UUID | Primary key |
| timestamp | TIMESTAMP | |
| user_id | UUID | |
| action | STRING | |
| entity_type | STRING | |
| entity_id | UUID | |
| old_values | JSON | |
| new_values | JSON | |
| ip_address | STRING | |

#### 3.2.2 Order Partition Tables (per year)

**ORDERS Table**
| Column | Type | Description |
|--------|------|-------------|
| order_id | UUID | Primary key |
| order_number | STRING | Human-readable (ORD-2026-00001) |
| customer_id | UUID | FK to CUSTOMERS |
| employee_id | UUID | FK to EMPLOYEES (sales rep) |
| order_date | TIMESTAMP | |
| status | STRING | PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED |
| subtotal | DECIMAL | |
| tax | DECIMAL | |
| shipping | DECIMAL | |
| total | DECIMAL | |
| shipping_address | JSON | |
| notes | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**ORDER_ITEMS Table**
| Column | Type | Description |
|--------|------|-------------|
| item_id | UUID | Primary key |
| order_id | UUID | FK to ORDERS |
| product_id | UUID | FK to PRODUCTS |
| quantity | INTEGER | |
| unit_price | DECIMAL | Price at time of order |
| discount | DECIMAL | |
| line_total | DECIMAL | |

**ORDER_STATUS_HISTORY Table**
| Column | Type | Description |
|--------|------|-------------|
| history_id | UUID | Primary key |
| order_id | UUID | FK to ORDERS |
| status | STRING | |
| changed_by | UUID | FK to EMPLOYEES |
| changed_at | TIMESTAMP | |
| notes | TEXT | |

---

## 4. Module Design

### 4.1 Domain Layer (DomainRepositoryLib)

```
📁 src/domain/
├── entities/
│   ├── Employee.js          # Entity with dirty tracking
│   ├── Customer.js          # Entity with value objects
│   ├── Product.js           # Entity with dynamic attributes
│   ├── Order.js             # Aggregate root
│   ├── OrderItem.js         # Entity within Order aggregate
│   └── Supplier.js          # Entity
├── value-objects/
│   ├── Email.js             # Validated email
│   ├── Money.js             # Currency handling
│   ├── Address.js           # Shipping address
│   ├── OrderNumber.js       # Generated order reference
│   └── PhoneNumber.js       # Validated phone
├── repositories/
│   ├── EmployeeRepository.js
│   ├── CustomerRepository.js
│   ├── ProductRepository.js
│   ├── OrderRepository.js   # Multi-partition aware
│   └── SupplierRepository.js
├── specifications/
│   ├── ActiveEmployeeSpec.js
│   ├── VipCustomerSpec.js
│   ├── LowStockProductSpec.js
│   ├── PendingOrderSpec.js
│   └── HighValueOrderSpec.js
└── events/
    ├── OrderCreatedEvent.js
    ├── OrderShippedEvent.js
    ├── StockLevelChangedEvent.js
    └── EmployeeDelegatedEvent.js
```

### 4.2 Service Layer

```
📁 src/services/
├── EmployeeService.js       # Employee CRUD + delegation
├── CustomerService.js       # Customer management
├── ProductService.js        # Inventory management
├── OrderService.js          # Order processing
├── ReportService.js         # Report generation
├── NotificationService.js   # Email sending (dry-run)
├── ImportService.js         # Supplier catalog import
└── AnalyticsService.js      # Multi-year analysis
```

### 4.3 Infrastructure Layer

```
📁 src/infrastructure/
├── database/
│   ├── DatabaseFactory.js        # Creates DatabaseService instances
│   ├── PartitionManager.js       # Manages order partitions
│   └── SchemaDefinitions.js      # All table schemas
├── templates/
│   ├── TemplateManager.js        # Template file access
│   └── TemplateRegistry.js       # Template ID registry
├── permissions/
│   └── PermissionManager.js      # File permission handling
└── config/
    └── ConfigurationService.js   # App configuration
```

### 4.4 Application Layer

```
📁 src/application/
├── pipelines/
│   ├── OrderProcessingPipeline.js
│   ├── InventoryAlertPipeline.js
│   ├── ReportGenerationPipeline.js
│   └── EmployeeOnboardingPipeline.js
├── jobs/
│   ├── BulkOrderImportJob.js
│   ├── MonthlyReportJob.js
│   └── InventoryReconciliationJob.js
├── providers/
│   ├── EmployeeDataProvider.js
│   ├── OrderDataProvider.js
│   ├── ProductDataProvider.js
│   └── AnalyticsDataProvider.js
├── composers/
│   ├── InvoiceComposer.js
│   ├── ReportComposer.js
│   └── EmailComposer.js
└── roles/
    ├── RoleDefinitions.js
    ├── DelegationManager.js
    └── RoutingPolicies.js
```

---

## 5. Workflow Pipelines

### 5.1 Order Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORDER PROCESSING PIPELINE                             │
│                        (PipelineFramework)                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: ValidateOrderStep
├── Input: Raw order data
├── Actions:
│   ├── Validate customer exists (CustomerRepository)
│   ├── Validate products exist and in stock (ProductRepository)
│   ├── Validate quantities available
│   └── Apply business rules (GasExpressionEngineLib)
├── PostProcessors:
│   └── LogAuditPostProcessor → AUDIT_LOG
└── Output: Validated order data

Step 2: CalculatePricingStep
├── Input: Validated order
├── Actions:
│   ├── Calculate line totals
│   ├── Apply customer discounts (ExpressionEngine: customer.type == 'VIP')
│   ├── Calculate tax
│   └── Calculate shipping
├── PostProcessors:
│   └── None
└── Output: Priced order

Step 3: ReserveInventoryStep
├── Input: Priced order
├── Actions:
│   ├── Acquire lock (LockService)
│   ├── Decrement stock levels
│   └── Release lock
├── PostProcessors:
│   ├── CellUpdatePostProcessor → PRODUCTS.stock_quantity
│   └── CounterUpdatePostProcessor → Statistics
└── Output: Order with reserved inventory

Step 4: CreateOrderRecordStep (PostProcessableStep)
├── Input: Order with inventory
├── Actions:
│   ├── Generate order number (HashUtils)
│   ├── Insert ORDER record
│   └── Insert ORDER_ITEMS records
├── PostProcessors:
│   ├── CellUpdatePostProcessor → ORDER.status = 'CONFIRMED'
│   └── LogAuditPostProcessor → AUDIT_LOG
└── Output: Persisted order

Step 5: GenerateInvoiceStep
├── Input: Persisted order
├── Actions:
│   ├── Assemble context (ContextEngine)
│   ├── Load invoice template (DriveService)
│   ├── Process placeholders (WorkspaceTemplateEngine)
│   ├── Save document (DocumentService)
│   └── Set permissions (PermissionService)
├── PostProcessors:
│   ├── CellUpdatePostProcessor → ORDER.invoice_url
│   └── FieldUpdatePostProcessor → ORDER.invoice_generated_at
└── Output: Order with invoice URL

Step 6: SendConfirmationStep
├── Input: Order with invoice
├── Actions:
│   ├── Compose email content (ComposableContentLib)
│   ├── Resolve notification recipient (RoleResolutionLib with delegation)
│   └── Send email (MailService - DRY RUN)
├── PostProcessors:
│   └── LogAuditPostProcessor → AUDIT_LOG (email sent)
└── Output: Completed order

Monitor: GasProcessMonitorLib tracks all steps in sidebar
```

### 5.2 Employee Delegation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EMPLOYEE DELEGATION PIPELINE                             │
│                     (Long-term illness handling)                             │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: ValidateDelegationStep
├── Actions:
│   ├── Validate delegator exists and is active
│   ├── Validate delegate exists and is active
│   ├── Check for circular delegation (DelegationValidator)
│   └── Validate delegation period
└── PostProcessors: LogAuditPostProcessor

Step 2: CreateDelegationRecordStep
├── Actions:
│   ├── Insert DELEGATIONS record
│   ├── Update EMPLOYEES.delegate_to
│   └── Update EMPLOYEES.status = 'ON_LEAVE'
└── PostProcessors: CellUpdatePostProcessor × 3

Step 3: TransferPermissionsStep
├── Actions:
│   ├── Query delegator's file permissions
│   ├── Grant same permissions to delegate (PermissionService)
│   └── Log permission changes
└── PostProcessors: LogAuditPostProcessor

Step 4: NotifyStakeholdersStep
├── Actions:
│   ├── Generate delegation notice (WorkspaceTemplateEngine)
│   ├── Resolve notification recipients (RoutingPolicy: BROADCAST_TEAM)
│   └── Send notifications (MailService - DRY RUN)
└── PostProcessors: None

Step 5: UpdateRoleResolutionStep
├── Actions:
│   ├── Register delegation in RoleRegistry
│   └── Test role resolution with delegation
└── PostProcessors: LogAuditPostProcessor
```

### 5.3 Report Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MONTHLY REPORT GENERATION PIPELINE                       │
│                     (JobRunnerLib for long-running)                          │
└─────────────────────────────────────────────────────────────────────────────┘

Job: MonthlyReportJob (Generator-based for auto-resume)

yield Step 1: GatherCurrentYearData
├── Actions:
│   ├── Query current year orders (DatabaseService)
│   ├── Aggregate by product category
│   └── Calculate totals
└── Checkpoint: Save state to Properties

yield Step 2: GatherHistoricalData
├── Actions:
│   ├── CrossPartitionQuery across all year databases
│   ├── Compare with previous years
│   └── Calculate trends
└── Checkpoint: Save state

yield Step 3: AssembleReportContext
├── Actions:
│   ├── Use ContextAssembler with recipe
│   ├── Execute OrderDataProvider
│   ├── Execute AnalyticsDataProvider
│   └── Execute EmployeeDataProvider
└── Checkpoint: Save state

yield Step 4: ComposeReportContent
├── Actions:
│   ├── Use ContentComposer with blocks:
│   │   ├── ExecutiveSummaryBlock
│   │   ├── SalesChartBlock
│   │   ├── TopProductsBlock
│   │   ├── EmployeePerformanceBlock
│   │   └── YearOverYearComparisonBlock
│   └── Render to HTML and Markdown
└── Checkpoint: Save state

yield Step 5: GenerateReportDocument
├── Actions:
│   ├── Load report template
│   ├── Process placeholders
│   └── Save to Generated_Documents/Reports/
└── Final state persistence
```

---

## 6. Template System

### 6.1 Invoice Template (Google Doc)

```
═══════════════════════════════════════════════════════════════
                         FAKESHOP INVOICE
═══════════════════════════════════════════════════════════════

Invoice #: {{order.orderNumber}}
Date: {{order.orderDate | formatDate}}
Due Date: {{order.dueDate | formatDate}}

───────────────────────────────────────────────────────────────
BILL TO:                          SHIP TO:
{{customer.firstName}} {{customer.lastName}}
{{customer.address.line1}}        {{shipping.line1}}
{{customer.address.city}}         {{shipping.city}}
{{customer.address.postalCode}}   {{shipping.postalCode}}
───────────────────────────────────────────────────────────────

ITEMS:
{{#items}}
  {{product.name}}
  SKU: {{product.sku}}
  Qty: {{quantity}} × {{unitPrice | currency}} = {{lineTotal | currency}}
{{/items}}

───────────────────────────────────────────────────────────────
                              Subtotal: {{order.subtotal | currency}}
                              Tax ({{taxRate}}%): {{order.tax | currency}}
                              Shipping: {{order.shipping | currency}}
                              ═════════════════════════════════
                              TOTAL: {{order.total | currency}}
───────────────────────────────────────────────────────────────

Thank you for your business!

Sales Representative: {{employee.firstName}} {{employee.lastName}}
{{#employee.isDelegated}}
  (Acting for: {{employee.delegator.firstName}} {{employee.delegator.lastName}})
{{/employee.isDelegated}}
```

### 6.2 Order Confirmation Email Template

```
Subject: Your FakeShop Order #{{order.orderNumber}} is Confirmed!

Dear {{customer.firstName}},

Thank you for your order! We're excited to let you know that your order has been confirmed.

ORDER DETAILS
─────────────
Order Number: {{order.orderNumber}}
Order Date: {{order.orderDate | formatDate}}
Total: {{order.total | currency}}

{{#items}}
• {{product.name}} (×{{quantity}}) - {{lineTotal | currency}}
{{/items}}

{{#order.estimatedDelivery}}
Estimated Delivery: {{order.estimatedDelivery | formatDate}}
{{/order.estimatedDelivery}}

Your invoice is attached to this email.

If you have any questions, please contact your account manager:
{{employee.firstName}} {{employee.lastName}} ({{employee.email}})

Best regards,
The FakeShop Team

───────────────────────────────────────────────────────────────
This is a {{#dryRun}}[DRY-RUN TEST]{{/dryRun}} automated message.
```

### 6.3 Low Stock Alert Email Template

```
Subject: ⚠️ Low Stock Alert: {{product.name}}

INVENTORY ALERT
───────────────

Product: {{product.name}}
SKU: {{product.sku}}
Category: {{product.category}}

Current Stock: {{product.stockQuantity}} units
Reorder Level: {{product.reorderLevel}} units
Supplier: {{supplier.name}}

RECOMMENDED ACTION:
{{#belowCritical}}
🔴 CRITICAL: Stock is critically low. Immediate reorder required.
{{/belowCritical}}
{{^belowCritical}}
🟡 WARNING: Stock is below reorder level. Consider placing order.
{{/belowCritical}}

Supplier Contact: {{supplier.contactEmail}}
Payment Terms: {{supplier.paymentTerms}}

──────────────────────────────────────────
Generated: {{timestamp | formatDateTime}}
Alert sent to: {{#recipients}}{{email}}, {{/recipients}}
```

### 6.4 Delegation Notice Template

```
DELEGATION NOTICE
═════════════════

Effective: {{delegation.startDate | formatDate}} to {{delegation.endDate | formatDate}}

This notice confirms that the responsibilities of:

  {{delegator.firstName}} {{delegator.lastName}}
  Role: {{delegator.role}}
  Department: {{delegator.department}}

Have been temporarily delegated to:

  {{delegate.firstName}} {{delegate.lastName}}
  Role: {{delegate.role}}
  Department: {{delegate.department}}

Reason: {{delegation.reason}}

DELEGATION SCOPE:
{{#roles}}
• {{roleName}} ({{scopeType}}: {{scopeValue}})
{{/roles}}

During this period, {{delegate.firstName}} will have access to:
{{#permissions}}
• {{description}}
{{/permissions}}

For questions, contact HR at hr@fakeshop.example.com

──────────────────────────────────────────
Document ID: {{delegation.delegationId}}
Generated: {{timestamp | formatDateTime}}
```

---

## 7. Multi-Database Strategy

### 7.1 Partition Configuration

```javascript
// Partition configuration for MultiDatabaseManager
const partitionConfig = {
  partitions: [
    {
      id: 'orders_2024',
      spreadsheetId: 'SPREADSHEET_ID_2024',
      tags: ['orders', '2024', 'archive'],
      priority: 1,
      readOnly: true,
      metadata: { year: 2024, archived: true }
    },
    {
      id: 'orders_2025',
      spreadsheetId: 'SPREADSHEET_ID_2025',
      tags: ['orders', '2025', 'archive'],
      priority: 2,
      readOnly: true,
      metadata: { year: 2025, archived: true }
    },
    {
      id: 'orders_2026',
      spreadsheetId: 'SPREADSHEET_ID_2026',
      tags: ['orders', '2026', 'current'],
      priority: 3,
      readOnly: false,
      metadata: { year: 2026, archived: false }
    }
  ],
  defaultPartition: 'orders_2026',
  routingStrategy: 'TAG_BASED',
  aliases: {
    current: 'orders_2026',
    previous: 'orders_2025'
  }
};
```

### 7.2 Routing Strategies Used

| Strategy      | Use Case                                   |
| ------------- | ------------------------------------------ |
| **TAG_BASED** | Route orders to partition by year tag      |
| **EXPLICIT**  | Direct partition specification for queries |
| **PRIORITY**  | Fallback routing for reads                 |

### 7.3 Cross-Partition Query Examples

```javascript
// Example: Year-over-year sales comparison
const yearlyTotals = crossPartitionQuery
  .select(['YEAR(order_date) as year', 'SUM(total) as total_sales'])
  .from('ORDERS')
  .across(['orders_2024', 'orders_2025', 'orders_2026'])
  .where('status', '=', 'DELIVERED')
  .groupBy('year')
  .execute();

// Example: Customer lifetime value across all years
const customerLTV = crossPartitionQuery
  .select(['customer_id', 'SUM(total) as lifetime_value'])
  .from('ORDERS')
  .across('*') // All partitions
  .groupBy('customer_id')
  .having('lifetime_value', '>', 1000)
  .execute();

// Example: Top products across all time
const topProducts = crossPartitionQuery
  .select(['product_id', 'SUM(quantity) as total_sold'])
  .from('ORDER_ITEMS')
  .join('ORDERS', 'order_id')
  .across('*')
  .groupBy('product_id')
  .orderBy('total_sold', 'DESC')
  .limit(10)
  .execute();
```

---

## 8. Role & Delegation System

### 8.1 Role Definitions

```javascript
const roleDefinitions = {
  ADMIN: {
    permissions: ['*'],
    scope: { type: 'GLOBAL' }
  },
  MANAGER: {
    permissions: [
      'orders:read',
      'orders:write',
      'orders:approve',
      'employees:read',
      'employees:write',
      'reports:read',
      'reports:generate',
      'inventory:read',
      'inventory:write'
    ],
    scope: { type: 'DEPARTMENT' }
  },
  SALES: {
    permissions: [
      'orders:read',
      'orders:write',
      'customers:read',
      'customers:write',
      'products:read',
      'reports:read'
    ],
    scope: { type: 'DEPARTMENT', value: 'SALES' }
  },
  WAREHOUSE: {
    permissions: [
      'inventory:read',
      'inventory:write',
      'orders:read',
      'orders:fulfill',
      'products:read'
    ],
    scope: { type: 'DEPARTMENT', value: 'OPERATIONS' }
  },
  SUPPORT: {
    permissions: ['orders:read', 'customers:read', 'customers:write', 'products:read'],
    scope: { type: 'DEPARTMENT', value: 'CUSTOMER_SERVICE' }
  }
};
```

### 8.2 Delegation Chain Example

```
Scenario: Sales Manager Alice is on long-term illness leave

Alice (Sales Manager)
  └── Delegates to → Bob (Senior Sales)
                       └── Bob also on vacation
                             └── Delegates to → Carol (Sales)

Resolution: When resolving "Sales Manager" role:
1. Check Alice → ON_LEAVE, has delegation
2. Follow delegation to Bob → ON_LEAVE, has delegation
3. Follow delegation to Carol → ACTIVE
4. Return Carol as resolved actor

DelegationChain validates:
- No circular references (Alice → Bob → Alice)
- Maximum depth not exceeded (default: 5)
- All delegates are valid employees
```

### 8.3 Routing Policies

| Policy          | Description                  | Use Case                 |
| --------------- | ---------------------------- | ------------------------ |
| FIRST_AVAILABLE | Return first resolved actor  | Default assignment       |
| ALL_MATCHING    | Return all actors with role  | Team notifications       |
| BROADCAST_TEAM  | All team members             | Department announcements |
| ESCALATION      | Try each level until success | Support tickets          |
| ROUND_ROBIN     | Distribute evenly            | Workload balancing       |
| CUSTOM          | User-defined logic           | Special routing needs    |

---

## 9. API Endpoints

### 9.1 Global Functions (exposed to GAS)

```javascript
// ═══════════════════════════════════════════════════════════════
// MENU AND UI ENTRY POINTS
// ═══════════════════════════════════════════════════════════════

function onOpen() {
  /* Create menu */
}
function showDashboard() {
  /* Show sidebar */
}
function showOrderDialog() {
  /* Show order creation dialog */
}

// ═══════════════════════════════════════════════════════════════
// EMPLOYEE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function createEmployee(employeeData) {
  /* ... */
}
function updateEmployee(employeeId, updates) {
  /* ... */
}
function deactivateEmployee(employeeId) {
  /* ... */
}
function createDelegation(delegatorId, delegateId, reason, startDate, endDate) {
  /* ... */
}
function revokeDelegation(delegationId) {
  /* ... */
}
function resolveRoleActor(roleName, scope) {
  /* ... */
}

// ═══════════════════════════════════════════════════════════════
// CUSTOMER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function createCustomer(customerData) {
  /* ... */
}
function updateCustomer(customerId, updates) {
  /* ... */
}
function getCustomerHistory(customerId) {
  /* Cross-partition query */
}
function promoteToVip(customerId) {
  /* ... */
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT & INVENTORY
// ═══════════════════════════════════════════════════════════════

function createProduct(productData) {
  /* With dynamic attributes */
}
function updateStock(productId, quantity, reason) {
  /* ... */
}
function getLowStockProducts() {
  /* ... */
}
function importSupplierCatalog(folderId) {
  /* GasDataImporter */
}

// ═══════════════════════════════════════════════════════════════
// ORDER PROCESSING
// ═══════════════════════════════════════════════════════════════

function createOrder(orderData) {
  /* Full pipeline */
}
function processOrder(orderId) {
  /* Pipeline execution */
}
function cancelOrder(orderId, reason) {
  /* ... */
}
function getOrderStatus(orderId) {
  /* ... */
}
function bulkImportOrders(ordersData) {
  /* JobRunner */
}

// ═══════════════════════════════════════════════════════════════
// REPORTING & ANALYTICS
// ═══════════════════════════════════════════════════════════════

function generateMonthlyReport(year, month) {
  /* ... */
}
function generateYearOverYearAnalysis() {
  /* Cross-partition */
}
function getTopCustomers(limit, years) {
  /* Cross-partition */
}
function getTopProducts(limit, years) {
  /* Cross-partition */
}
function getSalesbyEmployee(employeeId, year) {
  /* ... */
}

// ═══════════════════════════════════════════════════════════════
// PROCESS MONITORING
// ═══════════════════════════════════════════════════════════════

function getMonitorState(jobId) {
  /* For GasProcessMonitorLib */
}
function getActiveJobs() {
  /* ... */
}

// ═══════════════════════════════════════════════════════════════
// TESTING HOOKS (for online tests)
// ═══════════════════════════════════════════════════════════════

function runAllOnlineTests() {
  /* ... */
}
function runEmployeeTests() {
  /* ... */
}
function runOrderTests() {
  /* ... */
}
function runMultiDatabaseTests() {
  /* ... */
}
```

---

## 10. Test Strategy

### 10.1 Local Offline Tests (Jest)

```
📁 APP_FAKE_SHOP_FOR_TEST_ONLINE/__tests__/
├── unit/
│   ├── domain/
│   │   ├── Employee.test.js           # Entity behavior
│   │   ├── Customer.test.js           # Entity + value objects
│   │   ├── Product.test.js            # Dynamic attributes
│   │   ├── Order.test.js              # Aggregate behavior
│   │   └── value-objects/
│   │       ├── Email.test.js
│   │       ├── Money.test.js
│   │       └── Address.test.js
│   ├── services/
│   │   ├── EmployeeService.test.js    # Mock repositories
│   │   ├── CustomerService.test.js
│   │   ├── ProductService.test.js
│   │   ├── OrderService.test.js
│   │   └── AnalyticsService.test.js
│   ├── pipelines/
│   │   ├── OrderProcessingPipeline.test.js
│   │   ├── EmployeeDelegationPipeline.test.js
│   │   └── ReportGenerationPipeline.test.js
│   ├── specifications/
│   │   ├── ActiveEmployeeSpec.test.js
│   │   ├── VipCustomerSpec.test.js
│   │   └── LowStockProductSpec.test.js
│   ├── providers/
│   │   ├── EmployeeDataProvider.test.js
│   │   ├── OrderDataProvider.test.js
│   │   └── AnalyticsDataProvider.test.js
│   ├── composers/
│   │   ├── InvoiceComposer.test.js
│   │   └── ReportComposer.test.js
│   └── roles/
│       ├── DelegationManager.test.js
│       └── RoutingPolicies.test.js
├── integration/
│   ├── OrderWorkflow.integration.test.js
│   ├── DelegationWorkflow.integration.test.js
│   ├── MultiDatabaseQueries.integration.test.js
│   ├── ReportGeneration.integration.test.js
│   └── ImportWorkflow.integration.test.js
└── mocks/
    ├── GoogleServiceMocks.js         # All Google API mocks
    ├── DatabaseMocks.js              # SheetDBLib mocks
    ├── TemplateMocks.js              # Template service mocks
    └── fixtures/
        ├── employees.json
        ├── customers.json
        ├── products.json
        ├── orders.json
        └── templates.json
```

### 10.2 Test Coverage Targets

| Module          | Target Coverage | Key Test Scenarios                        |
| --------------- | --------------- | ----------------------------------------- |
| Domain Entities | 95%+            | Validation, state transitions, invariants |
| Value Objects   | 100%            | Immutability, equality, validation        |
| Services        | 90%+            | Happy path, error handling, edge cases    |
| Pipelines       | 85%+            | Step execution, post-processors, rollback |
| Specifications  | 100%            | All business rules                        |
| Providers       | 90%+            | Data retrieval, transformation            |
| Composers       | 90%+            | Block composition, rendering              |
| Role Resolution | 95%+            | Delegation chains, routing policies       |

### 10.3 Critical Test Scenarios

#### 10.3.1 Order Processing Tests

```javascript
describe('OrderProcessingPipeline', () => {
  // Happy path
  it('should process order through all steps successfully');
  it('should generate invoice with correct placeholders');
  it('should send confirmation email in dry-run mode');
  it('should update audit log after each step');

  // Inventory
  it('should reserve inventory atomically');
  it('should rollback inventory on payment failure');
  it('should handle concurrent orders with locking');

  // Pricing
  it('should apply VIP customer discount');
  it('should calculate tax correctly');
  it('should handle wholesale pricing');

  // Error handling
  it('should fail gracefully on invalid product');
  it('should fail gracefully on insufficient stock');
  it('should recover from template processing error');
});
```

#### 10.3.2 Delegation Tests

```javascript
describe('DelegationManager', () => {
  // Basic delegation
  it('should create delegation successfully');
  it('should resolve to delegate when delegator on leave');
  it('should resolve to delegator when delegation expired');

  // Chain resolution
  it('should follow delegation chain up to 3 levels');
  it('should detect circular delegation');
  it('should respect maximum chain depth');

  // Permissions
  it('should transfer file permissions to delegate');
  it('should revoke permissions when delegation ends');

  // Notifications
  it('should notify team of delegation');
  it('should notify relevant parties on revocation');
});
```

#### 10.3.3 Multi-Database Tests

```javascript
describe('MultiDatabaseQueries', () => {
  // Cross-partition queries
  it('should aggregate data across all year partitions');
  it('should calculate year-over-year trends');
  it('should find top customers across all time');

  // Routing
  it('should route new orders to current year partition');
  it('should treat archive partitions as read-only');
  it('should use correct partition by order date');

  // Performance
  it('should use lazy loading for partition connections');
  it('should cache frequently accessed partitions');
});
```

### 10.4 Online Tests (GasOnlineTestFramework)

```
📁 APP_FAKE_SHOP_FOR_TEST_ONLINE/__testOnline__/
├── setup/
│   └── TestEnvironmentSetup.js       # Create test data in real sheets
├── suites/
│   ├── EmployeeManagement.online.js
│   ├── OrderProcessing.online.js
│   ├── InventoryManagement.online.js
│   ├── DelegationSystem.online.js
│   ├── MultiDatabaseQueries.online.js
│   ├── TemplateProcessing.online.js
│   ├── ReportGeneration.online.js
│   └── EmailDryRun.online.js
├── teardown/
│   └── TestDataCleanup.js            # Remove test data
└── runner.js                          # Main test runner
```

---

## 11. Implementation Phases

### Phase 1: Foundation (Week 1)

**Objective:** Set up infrastructure and base domain

**Tasks:**

1. Create Google Drive folder structure
2. Create all spreadsheet databases with schemas
3. Create template documents
4. Implement configuration service
5. Implement database factory and partition manager
6. Create base domain entities (Employee, Customer, Product)
7. Create value objects (Email, Money, Address)
8. Create repositories with basic CRUD
9. Write unit tests for all domain objects

**Libraries Used:**

- CoreUtilsLib (logging, validation, utilities)
- GoogleApiWrapper (DriveService, SpreadsheetService)
- SheetDBLib (DatabaseService, TableService)
- DomainRepositoryLib (Entity, Repository, ZodValidator)

**Deliverables:**

- [ ] Folder structure created on Drive
- [ ] All database spreadsheets with headers
- [ ] All template documents created
- [ ] 50+ unit tests passing

---

### Phase 2: Order Domain (Week 2)

**Objective:** Implement complete order processing

**Tasks:**

1. Create Order aggregate and OrderItem entity
2. Create OrderRepository (multi-partition aware)
3. Implement OrderService
4. Create order processing pipeline steps
5. Implement post-processors for audit and status updates
6. Create invoice template processor
7. Implement order confirmation email composer
8. Write pipeline unit tests
9. Write integration tests

**Libraries Used:**

- PipelineFramework (Pipeline, Step, PostProcessors)
- WorkspaceTemplateEngine (PlaceholderService)
- ComposableContentLib (ContentComposer)
- GasExpressionEngineLib (business rules)
- GoogleApiWrapper (DocumentService, MailService dry-run)

**Deliverables:**

- [ ] Order processing pipeline complete
- [ ] Invoice generation working
- [ ] Email sending in dry-run mode
- [ ] 80+ unit tests passing
- [ ] 10+ integration tests passing

---

### Phase 3: Employee & Delegation (Week 3)

**Objective:** Implement role resolution and delegation system

**Tasks:**

1. Create role definitions and registry
2. Implement assignment and delegation sources
3. Create delegation manager
4. Implement delegation pipeline
5. Create routing policies
6. Implement permission transfer logic
7. Create delegation notice template processor
8. Write comprehensive delegation tests

**Libraries Used:**

- RoleResolutionLib (RoleResolver, Delegation, RoutingPolicy)
- PipelineFramework (delegation pipeline)
- WorkspaceTemplateEngine (delegation notice)
- GoogleApiWrapper (PermissionService)

**Deliverables:**

- [ ] Role resolution working with delegation
- [ ] Delegation chain following (up to 3 levels)
- [ ] Permission transfer implemented
- [ ] Delegation notifications working
- [ ] 60+ unit tests passing

---

### Phase 4: Multi-Database Analytics (Week 4)

**Objective:** Implement historical data analysis

**Tasks:**

1. Configure multi-database partitions
2. Implement partition router
3. Create cross-partition query builders
4. Create analytics data providers
5. Implement ContextEngine recipes for reports
6. Create report content blocks
7. Implement report generation pipeline
8. Create JobRunner job for monthly reports
9. Write multi-database tests

**Libraries Used:**

- SheetDBLib (MultiDatabaseManager, CrossPartitionQuery)
- ContextEngine (ContextAssembler, DataProvider)
- ComposableContentLib (report blocks)
- JobRunnerLib (MonthlyReportJob)
- GasProcessMonitorLib (progress tracking)

**Deliverables:**

- [ ] Cross-partition queries working
- [ ] Year-over-year analysis implemented
- [ ] Report generation pipeline complete
- [ ] Long-running job support working
- [ ] 40+ unit tests passing
- [ ] 15+ integration tests passing

---

### Phase 5: Import & Inventory (Week 5)

**Objective:** Implement data import and inventory management

**Tasks:**

1. Create supplier catalog import configuration
2. Implement import transformers
3. Create inventory alert specifications
4. Implement low stock alert pipeline
5. Create product dynamic schema (ColumnFamily)
6. Write import integration tests

**Libraries Used:**

- GasDataImporter (ImportEngine)
- SheetDBLib (ColumnFamily, SchemaResolver)
- GasExpressionEngineLib (alert conditions)
- GoogleApiWrapper (MailService for alerts)

**Deliverables:**

- [ ] Supplier catalog import working
- [ ] Dynamic product attributes working
- [ ] Low stock alerts implemented
- [ ] 30+ unit tests passing

---

### Phase 6: UI & Polish (Week 6)

**Objective:** Create user interface and finalize

**Tasks:**

1. Create admin menu with MenuBuilder
2. Create dashboard sidebar with SidebarBuilder
3. Create order entry dialog with DialogBuilder
4. Implement process monitor integration
5. Create online test suites
6. Write documentation
7. Performance optimization
8. Final integration testing

**Libraries Used:**

- GoogleApiWrapper (MenuBuilder, SidebarBuilder, DialogBuilder)
- GasProcessMonitorLib (DashboardUi)
- GasOnlineTestFramework (online tests)

**Deliverables:**

- [ ] Full UI implemented
- [ ] Process monitoring working
- [ ] All online tests passing
- [ ] Documentation complete
- [ ] Total 300+ unit tests
- [ ] Total 50+ integration tests

---

## 12. File Structure

### 12.1 Complete Project Structure

```
📁 APP_FAKE_SHOP_FOR_TEST_ONLINE/
├── 📄 DESIGN_DOCUMENT.md              # This document
├── 📄 README.md                        # Project overview
├── 📄 IMPLEMENTATION_STATUS.md         # Progress tracking
│
├── 📁 src/
│   ├── 📄 index.js                     # Main entry point, global functions
│   │
│   ├── 📁 config/
│   │   ├── 📄 constants.js             # App constants
│   │   ├── 📄 schemas.js               # Database schemas
│   │   ├── 📄 partitions.js            # Multi-database config
│   │   └── 📄 templates.js             # Template IDs
│   │
│   ├── 📁 domain/
│   │   ├── 📁 entities/
│   │   │   ├── 📄 Employee.js
│   │   │   ├── 📄 Customer.js
│   │   │   ├── 📄 Product.js
│   │   │   ├── 📄 Order.js
│   │   │   ├── 📄 OrderItem.js
│   │   │   └── 📄 Supplier.js
│   │   ├── 📁 value-objects/
│   │   │   ├── 📄 Email.js
│   │   │   ├── 📄 Money.js
│   │   │   ├── 📄 Address.js
│   │   │   ├── 📄 OrderNumber.js
│   │   │   └── 📄 PhoneNumber.js
│   │   ├── 📁 repositories/
│   │   │   ├── 📄 EmployeeRepository.js
│   │   │   ├── 📄 CustomerRepository.js
│   │   │   ├── 📄 ProductRepository.js
│   │   │   ├── 📄 OrderRepository.js
│   │   │   └── 📄 SupplierRepository.js
│   │   ├── 📁 specifications/
│   │   │   ├── 📄 ActiveEmployeeSpec.js
│   │   │   ├── 📄 VipCustomerSpec.js
│   │   │   ├── 📄 LowStockProductSpec.js
│   │   │   ├── 📄 PendingOrderSpec.js
│   │   │   └── 📄 HighValueOrderSpec.js
│   │   └── 📁 events/
│   │       ├── 📄 OrderCreatedEvent.js
│   │       ├── 📄 OrderShippedEvent.js
│   │       ├── 📄 StockLevelChangedEvent.js
│   │       └── 📄 EmployeeDelegatedEvent.js
│   │
│   ├── 📁 services/
│   │   ├── 📄 EmployeeService.js
│   │   ├── 📄 CustomerService.js
│   │   ├── 📄 ProductService.js
│   │   ├── 📄 OrderService.js
│   │   ├── 📄 ReportService.js
│   │   ├── 📄 NotificationService.js
│   │   ├── 📄 ImportService.js
│   │   └── 📄 AnalyticsService.js
│   │
│   ├── 📁 infrastructure/
│   │   ├── 📁 database/
│   │   │   ├── 📄 DatabaseFactory.js
│   │   │   ├── 📄 PartitionManager.js
│   │   │   └── 📄 SchemaDefinitions.js
│   │   ├── 📁 templates/
│   │   │   ├── 📄 TemplateManager.js
│   │   │   └── 📄 TemplateRegistry.js
│   │   ├── 📁 permissions/
│   │   │   └── 📄 PermissionManager.js
│   │   └── 📁 config/
│   │       └── 📄 ConfigurationService.js
│   │
│   ├── 📁 application/
│   │   ├── 📁 pipelines/
│   │   │   ├── 📄 OrderProcessingPipeline.js
│   │   │   ├── 📁 steps/
│   │   │   │   ├── 📄 ValidateOrderStep.js
│   │   │   │   ├── 📄 CalculatePricingStep.js
│   │   │   │   ├── 📄 ReserveInventoryStep.js
│   │   │   │   ├── 📄 CreateOrderRecordStep.js
│   │   │   │   ├── 📄 GenerateInvoiceStep.js
│   │   │   │   └── 📄 SendConfirmationStep.js
│   │   │   ├── 📄 EmployeeDelegationPipeline.js
│   │   │   ├── 📄 InventoryAlertPipeline.js
│   │   │   └── 📄 ReportGenerationPipeline.js
│   │   ├── 📁 jobs/
│   │   │   ├── 📄 BulkOrderImportJob.js
│   │   │   ├── 📄 MonthlyReportJob.js
│   │   │   └── 📄 InventoryReconciliationJob.js
│   │   ├── 📁 providers/
│   │   │   ├── 📄 EmployeeDataProvider.js
│   │   │   ├── 📄 OrderDataProvider.js
│   │   │   ├── 📄 ProductDataProvider.js
│   │   │   └── 📄 AnalyticsDataProvider.js
│   │   ├── 📁 composers/
│   │   │   ├── 📄 InvoiceComposer.js
│   │   │   ├── 📄 ReportComposer.js
│   │   │   └── 📄 EmailComposer.js
│   │   ├── 📁 blocks/
│   │   │   ├── 📄 ExecutiveSummaryBlock.js
│   │   │   ├── 📄 SalesChartBlock.js
│   │   │   ├── 📄 TopProductsBlock.js
│   │   │   ├── 📄 EmployeePerformanceBlock.js
│   │   │   └── 📄 YearOverYearBlock.js
│   │   └── 📁 roles/
│   │       ├── 📄 RoleDefinitions.js
│   │       ├── 📄 DelegationManager.js
│   │       └── 📄 RoutingPolicies.js
│   │
│   └── 📁 ui/
│       ├── 📄 MenuSetup.js
│       ├── 📄 DashboardSidebar.js
│       ├── 📄 OrderDialog.js
│       └── 📁 html/
│           ├── 📄 dashboard.html
│           └── 📄 order-form.html
│
├── 📁 __tests__/
│   ├── 📁 unit/
│   │   ├── 📁 domain/
│   │   │   ├── 📄 Employee.test.js
│   │   │   ├── 📄 Customer.test.js
│   │   │   ├── 📄 Product.test.js
│   │   │   ├── 📄 Order.test.js
│   │   │   └── 📁 value-objects/
│   │   │       ├── 📄 Email.test.js
│   │   │       ├── 📄 Money.test.js
│   │   │       └── 📄 Address.test.js
│   │   ├── 📁 services/
│   │   │   ├── 📄 EmployeeService.test.js
│   │   │   ├── 📄 CustomerService.test.js
│   │   │   ├── 📄 ProductService.test.js
│   │   │   ├── 📄 OrderService.test.js
│   │   │   └── 📄 AnalyticsService.test.js
│   │   ├── 📁 pipelines/
│   │   │   ├── 📄 OrderProcessingPipeline.test.js
│   │   │   ├── 📄 EmployeeDelegationPipeline.test.js
│   │   │   └── 📄 ReportGenerationPipeline.test.js
│   │   ├── 📁 specifications/
│   │   │   ├── 📄 ActiveEmployeeSpec.test.js
│   │   │   ├── 📄 VipCustomerSpec.test.js
│   │   │   └── 📄 LowStockProductSpec.test.js
│   │   ├── 📁 providers/
│   │   │   ├── 📄 EmployeeDataProvider.test.js
│   │   │   ├── 📄 OrderDataProvider.test.js
│   │   │   └── 📄 AnalyticsDataProvider.test.js
│   │   ├── 📁 composers/
│   │   │   ├── 📄 InvoiceComposer.test.js
│   │   │   └── 📄 ReportComposer.test.js
│   │   └── 📁 roles/
│   │       ├── 📄 DelegationManager.test.js
│   │       └── 📄 RoutingPolicies.test.js
│   ├── 📁 integration/
│   │   ├── 📄 OrderWorkflow.integration.test.js
│   │   ├── 📄 DelegationWorkflow.integration.test.js
│   │   ├── 📄 MultiDatabaseQueries.integration.test.js
│   │   ├── 📄 ReportGeneration.integration.test.js
│   │   └── 📄 ImportWorkflow.integration.test.js
│   └── 📁 mocks/
│       ├── 📄 GoogleServiceMocks.js
│       ├── 📄 DatabaseMocks.js
│       ├── 📄 TemplateMocks.js
│       └── 📁 fixtures/
│           ├── 📄 employees.json
│           ├── 📄 customers.json
│           ├── 📄 products.json
│           ├── 📄 orders.json
│           └── 📄 templates.json
│
├── 📁 __testOnline__/
│   ├── 📁 setup/
│   │   └── 📄 TestEnvironmentSetup.js
│   ├── 📁 suites/
│   │   ├── 📄 EmployeeManagement.online.js
│   │   ├── 📄 OrderProcessing.online.js
│   │   ├── 📄 InventoryManagement.online.js
│   │   ├── 📄 DelegationSystem.online.js
│   │   ├── 📄 MultiDatabaseQueries.online.js
│   │   ├── 📄 TemplateProcessing.online.js
│   │   ├── 📄 ReportGeneration.online.js
│   │   └── 📄 EmailDryRun.online.js
│   ├── 📁 teardown/
│   │   └── 📄 TestDataCleanup.js
│   └── 📄 runner.js
│
└── 📁 templates/
    └── 📁 content/                     # Template content for reference
        ├── 📄 Invoice_Template.txt
        ├── 📄 Order_Confirmation_Email.txt
        ├── 📄 Low_Stock_Alert_Email.txt
        ├── 📄 Employee_Welcome_Letter.txt
        └── 📄 Delegation_Notice.txt
```

---

## Appendix A: Context Engine Recipes

### A.1 Order Context Recipe

```json
{
  "id": "order-context",
  "description": "Assembles context for order processing",
  "providers": [
    {
      "id": "order",
      "type": "OrderDataProvider",
      "params": {
        "orderId": "@param.orderId"
      }
    },
    {
      "id": "customer",
      "type": "CustomerDataProvider",
      "params": {
        "customerId": "$order.customerId"
      }
    },
    {
      "id": "employee",
      "type": "EmployeeDataProvider",
      "params": {
        "employeeId": "$order.employeeId",
        "resolveDelegation": true
      }
    },
    {
      "id": "items",
      "type": "OrderItemsDataProvider",
      "params": {
        "orderId": "@param.orderId"
      }
    }
  ],
  "postProcessors": [
    {
      "type": "transform",
      "target": "order.orderDate",
      "expression": "formatDate(order.orderDate, 'YYYY-MM-DD')"
    }
  ]
}
```

### A.2 Report Context Recipe

```json
{
  "id": "monthly-report-context",
  "description": "Assembles context for monthly report",
  "providers": [
    {
      "id": "currentMonth",
      "type": "AnalyticsDataProvider",
      "params": {
        "year": "@param.year",
        "month": "@param.month",
        "metrics": ["totalSales", "orderCount", "averageOrderValue"]
      }
    },
    {
      "id": "previousMonth",
      "type": "AnalyticsDataProvider",
      "params": {
        "year": "@param.year",
        "month": "@param.previousMonth",
        "metrics": ["totalSales", "orderCount", "averageOrderValue"]
      }
    },
    {
      "id": "yearOverYear",
      "type": "CrossPartitionAnalyticsProvider",
      "params": {
        "years": [2024, 2025, 2026],
        "month": "@param.month",
        "metrics": ["totalSales"]
      }
    },
    {
      "id": "topProducts",
      "type": "TopProductsProvider",
      "params": {
        "year": "@param.year",
        "month": "@param.month",
        "limit": 10
      }
    },
    {
      "id": "employeePerformance",
      "type": "EmployeePerformanceProvider",
      "params": {
        "year": "@param.year",
        "month": "@param.month"
      }
    }
  ]
}
```

---

## Appendix B: Business Rules (Expressions)

### B.1 Discount Eligibility

```javascript
// VIP Discount (10%)
"customer.type == 'VIP' && order.total >= 100";

// Volume Discount (5%)
'order.itemCount >= 10';

// First-Time Customer Discount (15%)
'customer.totalOrders == 0';

// Wholesale Pricing
"customer.type == 'WHOLESALE' && order.total >= 500";
```

### B.2 Stock Alert Conditions

```javascript
// Low Stock Warning
'product.stockQuantity <= product.reorderLevel';

// Critical Stock Alert
'product.stockQuantity <= (product.reorderLevel * 0.5)';

// Out of Stock
'product.stockQuantity == 0';
```

### B.3 Order Validation

```javascript
// Valid Order Total
'order.total > 0 && order.total <= 50000';

// Valid Quantity
'item.quantity > 0 && item.quantity <= 1000';

// Delivery Date Validation
'order.requestedDeliveryDate >= today() + 2';
```

---

## Appendix C: Composable Content Blocks

### C.1 Report Blocks Configuration

```javascript
const reportBlocks = {
  executiveSummary: {
    id: 'executive-summary',
    name: 'Executive Summary',
    template: `
      ## Executive Summary

      **Period:** {{period.start}} - {{period.end}}

      | Metric | Value | Change |
      |--------|-------|--------|
      | Total Sales | {{metrics.totalSales | currency}} | {{metrics.salesChange | percentage}} |
      | Order Count | {{metrics.orderCount}} | {{metrics.orderCountChange | percentage}} |
      | Average Order | {{metrics.avgOrderValue | currency}} | {{metrics.avgOrderChange | percentage}} |
    `,
    visibility: { condition: 'always' }
  },

  salesChart: {
    id: 'sales-chart',
    name: 'Sales Trend',
    template: `
      ## Monthly Sales Trend

      {{#chartData}}
      {{month}}: {{'█'.repeat(Math.round(sales/1000))}} {{sales | currency}}
      {{/chartData}}
    `,
    visibility: { condition: 'chartData.length > 0' }
  },

  topProducts: {
    id: 'top-products',
    name: 'Top Products',
    template: `
      ## Top 10 Products

      | Rank | Product | Units Sold | Revenue |
      |------|---------|------------|---------|
      {{#products}}
      | {{rank}} | {{name}} | {{unitsSold}} | {{revenue | currency}} |
      {{/products}}
    `,
    visibility: { condition: 'products.length > 0' }
  },

  yearOverYear: {
    id: 'year-over-year',
    name: 'Year-Over-Year Comparison',
    template: `
      ## Year-Over-Year Analysis

      {{#years}}
      **{{year}}:** {{sales | currency}} ({{change | percentage}} vs previous)
      {{/years}}
    `,
    visibility: { condition: 'years.length > 1' }
  }
};
```

---

## Document History

| Version | Date       | Author | Changes                 |
| ------- | ---------- | ------ | ----------------------- |
| 1.0     | 2026-02-03 | Claude | Initial design document |

---

**End of Design Document**
