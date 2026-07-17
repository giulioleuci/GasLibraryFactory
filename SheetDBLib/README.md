# SheetDBLib

**Version:** 1.0.0  
**Layer:** Data Persistence (Layer 1)  
**Dependencies:** CoreUtilsLib, GoogleApiWrapper

## 🗄️ Overview

**SheetDBLib** is a powerful ORM-lite (Object-Relational Mapping) library that transforms Google Sheets into a queryable, relational database. It abstracts away the complexity of row/column manipulation, providing a clean, object-oriented interface for data management.

## 🏗️ File and Folder Structure

The library is organized into core services and specialized extensions for complex data needs:

```text
SheetDBLib/
├── src/
│   ├── DatabaseService.js      # Main entry point: manages tables and transactions
│   ├── TableService.js         # Logic for individual sheet manipulation (CRUD)
│   ├── dynamic/                # Extension for pattern-based column families
│   │   ├── ColumnFamily.js     # Logic for grouped columns (e.g., score_*)
│   │   ├── SchemaResolver.js   # Expands templates into concrete schemas
│   │   └── FamilyAggregator.js # Row-level and cross-row aggregations
│   ├── multi/                  # Extension for multi-spreadsheet partitioning
│   │   ├── MultiDatabaseManager.js # Orchestrates multiple sheet files
│   │   ├── PartitionRouter.js  # Determines which file holds specific data
│   │   └── RoutingStrategy.js  # Logic for data distribution (e.g., by Year)
│   ├── query/                  # SQL-like query engine
│   │   └── AdvancedQueryBuilder.js # Fluent API for complex selects and joins
│   └── __tests__/              # Unit and integration tests (with GAS mocks)
```

## 🧩 Programming Patterns

1.  **Table Data Gateway**: `TableService` acts as a gateway to a single sheet, encapsulating all the logic required to read and write rows while maintaining a consistent object-oriented interface.
2.  **Query Object Pattern**: `AdvancedQueryBuilder` encapsulates the parameters of a database query (filters, joins, sorts) into an object that can be executed later.
3.  **Strategy Pattern**: The `multi/` folder uses different `RoutingStrategy` implementations to decide how data is partitioned across multiple spreadsheets.
4.  **Unit of Work (Partial)**: `DatabaseService` tracks pending changes across multiple tables and flushes them in a single batch via the `.save()` method.
5.  **Proxy / Lazy Loading**: Row data and table instances are often initialized only when first accessed to minimize memory overhead and API calls.

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

```javascript
// Initialize database in dry-run mode
const db = new DatabaseService('SPREADSHEET_ID', logger, utils, cache, exceptionService, {
  dryRun: true
});

// All operations will be simulated
db.tables['Users'].insertRow({ name: 'Test', email: 'test@example.com' });
db.save(); // No actual changes are persisted
```

**Per-Operation Override:**

```javascript
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

```javascript
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

```javascript
import { DatabaseService } from '@SheetDBLib';
import { LoggerService, UtilsService, CacheService } from '@GoogleApiWrapper';
```

## 🚀 Quick Start

```javascript
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

```javascript
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

```javascript
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
- **`join(table, localField, op, foreignField)`**: Joins another table.
- **`groupBy(fields)`**: Groups results.
- **`sum(field)`, `count(field)`**: Aggregations.
- **`orderBy(field, dir)`**: Sorting.
- **`limit(n)`, `offset(n)`**: Pagination.

**Complex Query Example:**

```javascript
const report = db
  .select(['Users.name', 'Orders.total'])
  .from('Users')
  .join('Orders', 'Users.id', '=', 'Orders.user_id')
  .where('Orders.status', '=', 'completed')
  .where('Orders.total', '>', 100)
  .orderBy('Orders.total', 'DESC')
  .execute();
```

## ⚡ Performance & Optimization

- **Hash Joins**: The library automatically uses Hash Joins for equality comparisons (`=`), reducing complexity from O(N\*M) to O(N+M).
- **Batch Writes**: `db.save()` uses `GoogleApiWrapper`'s batch capabilities to write all changes in a single API call.
- **Query Caching**: Query results are cached based on a hash of the query parameters.
- **Partial Sort**: `orderBy` combined with `limit` uses a partial sort algorithm (QuickSelect) for large datasets.

## 🔄 Dynamic Schema Extension

SheetDBLib includes a **Dynamic Schema** extension for working with schemas that have dynamically generated columns. This is useful when column names follow patterns (e.g., `score_math`, `score_science`, `score_english`) or when columns are created based on configuration.

### Key Concepts

#### ColumnFamily

A ColumnFamily defines a group of columns that share a naming pattern:

```javascript
import { ColumnFamily, ColumnType } from '@SheetDBLib';

const scoresFamily = new ColumnFamily({
  id: 'scores',
  namePattern: 'score_{{key}}',
  type: ColumnType.NUMBER,
  members: ['math', 'science', 'english'],
  defaultValue: 0
});

// Generate column names
scoresFamily.generateColumnName('math'); // 'score_math'
scoresFamily.generateColumnName('science'); // 'score_science'

// Parse member key from column name
scoresFamily.parseMemberKey('score_math'); // 'math'
```

#### SchemaTemplate

A SchemaTemplate defines fixed columns plus dynamic column families:

```javascript
import { SchemaTemplate } from '@SheetDBLib';

const template = new SchemaTemplate({
  tableId: 'students',
  fixedColumns: [
    { name: 'id', type: 'STRING', primaryKey: true },
    { name: 'name', type: 'STRING' },
    { name: 'grade', type: 'NUMBER' }
  ],
  dynamicColumns: [{ familyId: 'scores' }]
});
```

#### SchemaResolver

The SchemaResolver expands templates into concrete schemas:

```javascript
import { SchemaResolver } from '@SheetDBLib';

const resolver = new SchemaResolver();
resolver.registerFamily(scoresFamily);

const resolved = resolver.resolve(template);
// resolved.columns: [id, name, grade, score_math, score_science, score_english]
```

#### DynamicColumnAccessor

Access dynamic columns in a type-safe way:

```javascript
import { DynamicColumnAccessor } from '@SheetDBLib';

const row = { id: '1', name: 'Alice', score_math: 95, score_science: 88 };
const accessor = new DynamicColumnAccessor(row, {
  families: [scoresFamily],
  coerceTypes: true,
  useDefaults: true
});

// Get single value
accessor.get('scores', 'math'); // 95
accessor.get('scores', 'english'); // 0 (default value)

// Get all values
accessor.getAll('scores'); // { math: 95, science: 88, english: 0 }

// Set value with type coercion
accessor.set('scores', 'english', '75');
row.score_english; // 75 (number)

// Check existence
accessor.has('scores', 'math'); // true
accessor.hasAll('scores'); // false (english was missing initially)
accessor.count('scores'); // 3
```

#### FamilyAggregator

Perform aggregations across column families:

```javascript
import { FamilyAggregator, AggregationType } from '@SheetDBLib';

const aggregator = new FamilyAggregator({ families: [scoresFamily] });

// Aggregate within a row
const row = { score_math: 95, score_science: 88, score_english: 75 };
const result = aggregator.aggregateRow(row, 'scores', AggregationType.AVG);
result.value; // 86 (average score)

// Multiple aggregations
const stats = aggregator.multiAggregate(row, 'scores', [
  AggregationType.SUM,
  AggregationType.AVG,
  AggregationType.MIN,
  AggregationType.MAX
]);
// stats.SUM.value: 258
// stats.AVG.value: 86
// stats.MIN.value: 75
// stats.MAX.value: 95

// Aggregate across rows
const rows = [
  { score_math: 95, score_science: 88, score_english: 75 },
  { score_math: 80, score_science: 92, score_english: 85 },
  { score_math: 90, score_science: 85, score_english: 80 }
];

const avgBySubject = aggregator.aggregateRows(rows, 'scores', AggregationType.AVG);
// { math: 88.33, science: 88.33, english: 80 }
```

### Dynamic Member Sources

Column family members can come from different sources:

```javascript
import { MemberSourceType } from '@SheetDBLib';

// Static members (defined in code)
const staticFamily = new ColumnFamily({
  id: 'attrs',
  namePattern: 'attr_{{key}}',
  members: ['color', 'size', 'weight']
});

// Members from configuration
const configFamily = new ColumnFamily({
  id: 'attrs',
  namePattern: 'attr_{{key}}',
  memberSource: {
    type: MemberSourceType.CONFIG,
    configPath: 'attributes.list'
  }
});

// Members from query
const queryFamily = new ColumnFamily({
  id: 'attrs',
  namePattern: 'attr_{{key}}',
  memberSource: {
    type: MemberSourceType.QUERY,
    query: { table: 'AttributeDefinitions', column: 'attribute_key' }
  }
});
```

### Aggregation Types

| Type             | Description               |
| ---------------- | ------------------------- |
| `SUM`            | Sum of all values         |
| `AVG`            | Average of all values     |
| `MIN`            | Minimum value             |
| `MAX`            | Maximum value             |
| `COUNT`          | Count of non-null values  |
| `COUNT_DISTINCT` | Count of distinct values  |
| `FIRST`          | First non-null value      |
| `LAST`           | Last non-null value       |
| `CONCAT`         | Concatenate string values |
| `COLLECT`        | Collect values into array |

## 🧪 Testing

Integration tests require a real Google Sheet ID.

```bash
npm test SheetDBLib
```
