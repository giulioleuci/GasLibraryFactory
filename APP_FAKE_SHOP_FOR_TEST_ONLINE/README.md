# FakeShop - GasLibraryFactory Demonstration Application

A comprehensive Google Apps Script demonstration application showcasing all features of the GasLibraryFactory monorepo.

## Overview

FakeShop simulates an online store with:
- **Employee Management** - Roles, departments, and delegation for long-term illness
- **Customer Management** - Regular, VIP, and wholesale customers
- **Product Catalog** - Inventory with dynamic category-specific attributes
- **Order Processing** - Full pipeline with invoice generation and email notifications
- **Multi-Year Analytics** - Historical data analysis across multiple database partitions
- **Reporting** - Automated report generation with composable content blocks

## Libraries Demonstrated

| Library | Features Used |
|---------|---------------|
| CoreUtilsLib | Logging, validation, type guards, PII redaction, hashing |
| GasResilienceLib | Retry logic, circuit breaker, error classification |
| GoogleApiWrapper | Drive, Docs, Sheets, Mail (dry-run), Permissions, UI builders |
| WorkspaceTemplateEngine | Mustache templates, document/sheet processing |
| GasExpressionEngineLib | Business rule evaluation |
| SheetDBLib | Database operations, dynamic schemas, multi-partition queries |
| RoleResolutionLib | Role resolution, delegation chains, routing policies |
| ComposableContentLib | Report blocks, multiple renderers |
| JobRunnerLib | Long-running background jobs |
| PipelineFramework | Workflow orchestration, post-processors |
| ContextEngine | Data assembly from recipes |
| GasDataImporter | ETL pipeline for supplier catalogs |
| DomainRepositoryLib | Entities, repositories, specifications, validation |
| GasOnlineTestFramework | Integration testing in GAS environment |
| GasProcessMonitorLib | Real-time progress visualization |

## Project Structure

```
APP_FAKE_SHOP_FOR_TEST_ONLINE/
├── DESIGN_DOCUMENT.md          # Complete design specification
├── IMPLEMENTATION_STATUS.md    # Progress tracking
├── README.md                   # This file
├── src/                        # Source code
│   ├── config/                 # Configuration
│   ├── domain/                 # Domain layer (entities, repos, specs)
│   ├── services/               # Service layer
│   ├── infrastructure/         # Infrastructure layer
│   ├── application/            # Application layer (pipelines, jobs, providers)
│   └── ui/                     # User interface components
├── __tests__/                  # Local offline tests (Jest)
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── mocks/                  # Test mocks and fixtures
└── __testOnline__/             # Online tests (GasOnlineTestFramework)
```

## Key Features

### Multi-Database Architecture

Orders are partitioned by year across separate spreadsheets:
- `FakeShop_Orders_2024.gsheet` (archive, read-only)
- `FakeShop_Orders_2025.gsheet` (archive, read-only)
- `FakeShop_Orders_2026.gsheet` (current, read-write)

Cross-partition queries enable:
- Year-over-year sales comparison
- Customer lifetime value calculation
- Historical trend analysis

### Employee Delegation System

Handles long-term employee absence:
1. Manager creates delegation record
2. Permissions are transferred to delegate
3. Role resolution follows delegation chain
4. Notifications sent to stakeholders
5. Delegation expires automatically

### Order Processing Pipeline

Six-step workflow with post-processors:
1. **ValidateOrder** - Customer, product, inventory validation
2. **CalculatePricing** - Discounts, tax, shipping
3. **ReserveInventory** - Atomic stock reservation with locking
4. **CreateOrderRecord** - Persist order and line items
5. **GenerateInvoice** - Template processing, file creation
6. **SendConfirmation** - Email notification (dry-run mode)

### Template System

Document templates with Mustache placeholders:
- Invoice generation
- Order confirmation emails
- Low stock alerts
- Delegation notices
- Monthly reports

## Testing Strategy

### Local Offline Tests (Jest)

Run without Google Apps Script environment:

```bash
# From project root
npm test -- APP_FAKE_SHOP_FOR_TEST_ONLINE

# With coverage
npm run test:coverage -- APP_FAKE_SHOP_FOR_TEST_ONLINE
```

Test categories:
- Domain entities and value objects
- Service layer methods
- Pipeline step execution
- Specification evaluation
- Data providers
- Content composers

### Online Tests (GAS Environment)

Run in deployed Google Apps Script:

```javascript
// In Apps Script editor
runAllOnlineTests();

// Or specific suites
runOrderTests();
runDelegationTests();
runMultiDatabaseTests();
```

## Implementation Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Foundation - Infrastructure, base domain | Week 1 |
| 2 | Order Domain - Full order processing | Week 2 |
| 3 | Employee & Delegation - Role resolution | Week 3 |
| 4 | Multi-Database Analytics - Historical queries | Week 4 |
| 5 | Import & Inventory - ETL, stock alerts | Week 5 |
| 6 | UI & Polish - Menus, sidebars, online tests | Week 6 |

## Documentation

- **DESIGN_DOCUMENT.md** - Complete technical specification
- **IMPLEMENTATION_STATUS.md** - Task tracking checklist

## Prerequisites

- GasLibraryFactory monorepo properly configured
- Google Cloud project with Apps Script API enabled
- CLASP configured for deployment

## Getting Started

1. Review the design document
2. Create Google Drive folder structure
3. Create database spreadsheets with schemas
4. Create template documents
5. Implement Phase 1 foundation code
6. Write and run unit tests
7. Continue with subsequent phases

---

**Status:** Design Complete - Ready for Implementation
