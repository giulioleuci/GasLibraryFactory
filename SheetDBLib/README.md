# SheetDBLib

**Version:** 1.0.0  
**Layer:** Data Persistence (Layer 1)  
**Language:** TypeScript (strict, ES modules; Babel emits GAS V8 JavaScript)
**Dependencies:** CoreUtilsLib, GoogleApiWrapper

## 🗄️ Overview

**SheetDBLib** is a powerful ORM-lite (Object-Relational Mapping) library that transforms Google Sheets into a queryable, relational database. It abstracts away the complexity of row/column manipulation, providing a clean, object-oriented interface for data management.

## 🏗️ File and Folder Structure

The library is organized into core services and specialized extensions for complex data needs:

```text
SheetDBLib/
├── src/
│   ├── DatabaseService.ts      # Main entry point: manages tables and transactions
│   ├── TableService.ts         # Logic for individual sheet manipulation (CRUD)
│   ├── query/                  # SQL-like query engine
│   │   └── AdvancedQueryBuilder.ts # Fluent API for complex selects and joins
│   └── __tests__/              # Unit and integration tests (with GAS mocks)
```

## 🧩 Programming Patterns

1.  **Table Data Gateway**: `TableService` acts as a gateway to a single sheet, encapsulating all the logic required to read and write rows while maintaining a consistent object-oriented interface.
2.  **Query Object Pattern**: `AdvancedQueryBuilder` encapsulates the parameters of a database query (filters, joins, sorts) into an object that can be executed later.
3.  **Unit of Work (Partial)**: `DatabaseService` tracks pending changes across multiple tables and flushes them in a single batch via the `.save()` method.
4.  **Proxy / Lazy Loading**: Row data and table instances are often initialized only when first accessed to minimize memory overhead and API calls.

## ✨ Key Features

Unlike simple wrapper scripts, SheetDBLib implements advanced database concepts such as **ACID-like transactions**, **SQL-like querying**, **indexing**, **schema validation**, and **virtual columns**, all while optimizing performance through lazy loading and batch operations via `GoogleApiWrapper`.

## ✨ Key Features

- **SQL-Like Query Builder**: Fluent API for `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, and `LIMIT`.
- **Advanced Joins**: Supports `INNER`, `LEFT`, `RIGHT`, and `FULL OUTER` joins using optimized in-memory Hash Join algorithms (O(n+m) complexity).
- **CRUD & Patching**: Full Create, Read, Update, Delete support, plus efficient `patchRow` for sparse updates.
- **Transactions**: `beginTransaction()`, `commit()`, and `rollback()` support to ensure data integrity across multiple table operations.
- **Schema Validation**: Define strict schemas with types, required fields, and custom validators.
- **Performance**:
  - **Lazy Loading**: Data is fetched from Sheets only when accessed.
  - **Indexing**: O(1) lookups via `createIndex()`.
  - **Caching**: Query results are cached to minimize API calls.
- **Virtual Columns**: Define computed fields that exist in the object model but are not stored in the sheet.
- **Dry-Run Mode**: Test database operations without persisting changes.

## 🧪 Dry-Run Mode

DatabaseService supports dry-run mode for testing workflows without actually persisting changes to the spreadsheet.

### Enabling Dry-Run Mode

**Constructor-Level:**

```typescript
// Initialize database in dry-run mode
const db = new DatabaseService('SPREADSHEET_ID', logger, utils, cache, exceptionService, {
  dryRun: true
});

// All operations will be simulated
db.tables['Users'].insertRow({ name: 'Test', email: 'test@example.com' });
db.save(); // No actual changes are persisted
```

**Per-Operation Override:**

```typescript
// Standard database instance
const db = new DatabaseService('SPREADSHEET_ID', logger, utils, cache);

// Perform operations
db.tables['Users'].insertRow({ name: 'Test', email: 'test@example.com' });

// Save with dry-run (simulates save without persisting)
const result = db.save({ dryRun: true });
// Result: { success: true, pendingChanges: [...], dryRun: true }

// Force real save later
db.save(); // Actually persists changes
```

### Dry-Run Response

```typescript
const result = db.save({ dryRun: true });
// {
//   success: true,
//   pendingChanges: [
//     { table: 'Users', inserts: 1, updates: 0, deletes: 0 }
//   ],
//   dryRun: true
// }
```

## 📦 Installation

```typescript
import { DatabaseService } from '@SheetDBLib';
import { LoggerService, UtilsService, CacheService } from '@GoogleApiWrapper';
```

## 🚀 Quick Start

```typescript
// 1. Initialize dependencies
const logger = new LoggerService();
const utils = new UtilsService(logger);
const cache = new CacheService(logger).getScriptCache();

// 2. Connect to Database (Spreadsheet)
const db = new DatabaseService('SPREADSHEET_ID', logger, utils, cache);

// 3. Insert Data
db.tables['Users'].insertRow({
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin'
});

// 4. Query Data
const admins = db
  .select(['name', 'email'])
  .from('Users')
  .where('role', '=', 'admin')
  .orderBy('name', 'ASC')
  .execute();

// 5. Persist Changes
db.save();
```

## 📚 API Reference

### 1. DatabaseService

The main entry point. Manages tables and transactions.

- **`tables`**: Access `TableService` instances by sheet name (e.g., `db.tables['Users']`).
- **`save()`**: Flushes all pending changes to the spreadsheet (via batch API).
- **`beginTransaction()`**: Starts a transaction block.
- **`commit()`**: Applies changes made during the transaction.
- **`rollback()`**: Reverts changes made during the transaction.

**Transaction Example:**

```typescript
try {
  db.beginTransaction();
  db.tables['Accounts'].updateRowById('ACC_1', { balance: 90 });
  db.tables['Logs'].insertRow({ action: 'debit', amount: 10 });
  db.commit();
} catch (e) {
  db.rollback(); // Reverts both operations
}
```

### 2. TableService

Manages a specific table (sheet).

- **`getRows()`**: Returns all rows as objects.
- **`insertRow(data)`**: Adds a new row (auto-generates UUID if ID is missing).
- **`updateRowById(id, data)`**: Updates a row by Primary Key.
- **`patchRow(id, partialData)`**: Updates only specific fields (efficient).
- **`deleteRowById(id)`**: Deletes a row.
- **`createIndex(column)`**: Creates an in-memory index for fast lookups.
- **`setSchema(schema)`**: Enforces data validation.
- **`defineVirtualColumn(name, fn)`**: Adds a computed field.

**Schema Example:**

```typescript
db.tables['Users'].setSchema({
  fields: {
    name: { type: 'string', required: true },
    age: { type: 'number', validate: (n) => n >= 18 },
    email: { type: 'email', required: true }
  }
});
```

### 3. AdvancedQueryBuilder

Constructs complex queries. Created via `db.select()`.

- **`select(columns)`**: Columns to retrieve.
- **`from(table)`**: Source table.
- **`where(field, op, value)`**: Filter conditions (`=`, `!=`, `>`, `<`, `LIKE`, `IN`).
- **`whereFuzzy(field, query, options = {})`** / **`orWhereFuzzy(field, query, options = {})`**: Opt-in fuzzy text filters. They are additive to existing `where`/`orWhere` conditions; use `threshold` from `0` (strictest) to `1` (loosest), with a default of `0.4`.
- **`join(table, localField, op, foreignField)`**: Joins another table.
- **`groupBy(fields)`**: Groups results.
- **`sum(field)`, `count(field)`**: Aggregations.
- **`orderBy(field, dir)`**: Sorting.
- **`limit(n)`, `offset(n)`**: Pagination.

**Complex Query Example:**

```typescript
const report = db
  .select(['Users.name', 'Orders.total'])
  .from('Users')
  .join('Orders', 'Users.id', '=', 'Orders.user_id')
  .where('Orders.status', '=', 'completed')
  .where('Orders.total', '>', 100)
  .orderBy('Orders.total', 'DESC')
  .execute();
```

**Opt-in Fuzzy Query Example:**

```typescript
const matchingUsers = db
  .select()
  .from('Users')
  .where('active', '=', true)
  .whereFuzzy('name', 'Alic', { threshold: 0.4 })
  .orWhereFuzzy('email', 'alice@example.com')
  .execute();
```

## ⚡ Performance & Optimization

- **Hash Joins**: The library automatically uses Hash Joins for equality comparisons (`=`), reducing complexity from O(N\*M) to O(N+M).
- **Batch Writes**: `db.save()` uses `GoogleApiWrapper`'s batch capabilities to write all changes in a single API call.
- **Query Caching**: Query results are cached based on a hash of the query parameters.
- **Partial Sort**: `orderBy` combined with `limit` uses a partial sort algorithm (QuickSelect) for large datasets.

## 🧪 Testing

Integration tests require a real Google Sheet ID.

```bash
npm test SheetDBLib
```
