// ===================================================================
// FILE: SheetDBLib/index.js
// ===================================================================
// Main entry point for SheetDBLib ES Module exports
// ===================================================================

/**
 * SheetDBLib - ORM-lite interface for Google Sheets as databases
 *
 * @module SheetDBLib
 *
 * @description
 * SheetDBLib provides an ORM-lite interface for treating Google Sheets as queryable databases
 * with full CRUD operations, SQL-like queries, JOINs, transactions, and advanced features like
 * fuzzy search, schema validation, and performance optimizations.
 *
 * ## Architecture
 *
 * SheetDBLib implements a three-layer architecture:
 *
 * 1. **DatabaseService** - Main entry point managing multiple tables and transactions
 * 2. **TableService** - Individual table operations with CRUD, virtual columns, and schema validation
 * 3. **AdvancedQueryBuilder** - Fluent SQL-like API for complex queries with JOINs and aggregations
 *
 * The library treats each Google Sheets sheet as a database table, with the first row as column headers
 * and subsequent rows as data records. Primary keys are automatically managed with UUID generation.
 *
 * ## Key Features
 *
 * **Query Capabilities:**
 * - SQL-like query builder with fluent API (SELECT, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT)
 * - JOIN support (INNER, LEFT, RIGHT, FULL OUTER) with hash join optimization
 * - Aggregation functions (COUNT, SUM, AVG, MIN, MAX)
 * - Fuzzy search using Fuse.js for approximate matching
 * - Query caching with automatic invalidation
 *
 * **Data Operations:**
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Batch insert/update for performance
 * - Sparse updates (patch) for efficient single-field changes
 * - Transaction support with rollback capability
 * - Primary key management with auto-UUID generation
 *
 * **Performance Optimizations:**
 * - Lazy loading - data loaded only when needed
 * - Batch operations via GoogleApiWrapper for reduced API calls
 * - Dirty checking to skip unnecessary writes
 * - Index support for O(1) lookups on indexed fields
 * - Partial sort for LIMIT queries (QuickSelect algorithm)
 * - Write-through caching to avoid full table reloads
 *
 * **Advanced Features:**
 * - Virtual computed columns (dynamically calculated fields)
 * - Schema validation with type checking and custom validators
 * - Fuzzy search with configurable thresholds
 * - LIKE pattern matching with wildcards
 * - IN/NOT IN operators for set-based filtering
 * - Pagination with offset/limit
 *
 * ## Dependencies
 *
 * - **GoogleApiWrapper** - SpreadsheetService for Google Sheets API access with batch operations
 * - **CoreUtilsLib** - LoggerService for logging, UtilsService for utilities (UUID generation, date parsing), HashUtils for query cache keys, isEqual for dirty checking
 * - **fuse.js** (npm) - Fuzzy search library for approximate string matching
 *
 * ## Exported Components
 *
 * **Core Services:**
 * - **DatabaseService** - Main database interface managing tables and transactions. Provides batch loading,
 *   transaction support (begin/commit/rollback), and query builder entry point.
 * - **TableService** - Individual table operations with CRUD methods, virtual columns, schema validation,
 *   fuzzy search, indexing, and dirty checking optimization.
 *
 * **Query Builder:**
 * - **AdvancedQueryBuilder** - Fluent SQL-like query API with support for SELECT, WHERE, JOIN,
 *   GROUP BY, ORDER BY, LIMIT, aggregations, and query optimization.
 *
 * ## Usage Examples
 *
 * ### Basic CRUD Operations
 *
 * ```javascript
 * import { DatabaseService } from '@SheetDBLib';
 * import { LoggerService, UtilsService } from '@CoreUtilsLib';
 *
 * const logger = new LoggerService();
 * const utils = new UtilsService();
 * const cache = CacheService.getScriptCache();
 *
 * const db = new DatabaseService('SPREADSHEET_ID', logger, utils, cache);
 *
 * // CREATE - Insert new row
 * const newUser = db.tables['Users'].insertRow({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   age: 30
 * });
 * db.save(); // Flush changes to spreadsheet
 *
 * // READ - Get all rows
 * const allUsers = db.tables['Users'].getRows();
 *
 * // READ - Get by primary key
 * const user = db.tables['Users'].getRowById('USER_123');
 *
 * // UPDATE - Update entire row
 * db.tables['Users'].updateRowById('USER_123', {
 *   email: 'newemail@example.com',
 *   age: 31
 * });
 * db.save();
 *
 * // UPDATE - Sparse update (patch single field)
 * db.tables['Users'].patchRow('USER_123', { age: 32 });
 * db.save();
 *
 * // DELETE
 * db.tables['Users'].deleteRowById('USER_123');
 * db.save();
 * ```
 *
 * ### SQL-like Queries
 *
 * ```javascript
 * // Simple SELECT with WHERE
 * const activeUsers = db.select(['name', 'email'])
 *   .from('Users')
 *   .where('status', '=', 'active')
 *   .where('age', '>', 18)
 *   .orderBy('name', 'ASC')
 *   .execute();
 *
 * // LIKE pattern matching
 * const gmailUsers = db.select()
 *   .from('Users')
 *   .whereLike('email', '@gmail.com')
 *   .execute();
 *
 * // IN operator
 * const specificUsers = db.select()
 *   .from('Users')
 *   .whereIn('department', ['Engineering', 'Product', 'Design'])
 *   .execute();
 *
 * // Pagination
 * const page2 = db.select()
 *   .from('Users')
 *   .orderBy('created_at', 'DESC')
 *   .paginate(2, 20)  // page 2, 20 items per page
 *   .execute();
 *
 * // OR conditions
 * const results = db.select()
 *   .from('Users')
 *   .where('status', '=', 'active')
 *   .orWhere('role', '=', 'admin')
 *   .execute();
 * ```
 *
 * ### JOINs and Aggregations
 *
 * ```javascript
 * // INNER JOIN
 * const authorsWithBooks = db.select(['Authors.name', 'Books.title'])
 *   .from('Authors')
 *   .join('Books', 'Authors.id', '=', 'Books.author_id')
 *   .execute();
 *
 * // LEFT JOIN
 * const allAuthors = db.select()
 *   .from('Authors')
 *   .leftJoin('Books', 'Authors.id', '=', 'Books.author_id')
 *   .execute();
 *
 * // GROUP BY with aggregations
 * const salesByDepartment = db.select(['department'])
 *   .from('Sales')
 *   .groupBy('department')
 *   .sum('amount', 'total_sales')
 *   .avg('amount', 'avg_sale')
 *   .count('id', 'num_sales')
 *   .execute();
 *
 * // Multiple aggregations
 * const productStats = db.select(['category'])
 *   .from('Products')
 *   .groupBy('category')
 *   .min('price', 'min_price')
 *   .max('price', 'max_price')
 *   .avg('price', 'avg_price')
 *   .execute();
 * ```
 *
 * ### Transactions
 *
 * ```javascript
 * // Transaction with commit
 * db.beginTransaction();
 * try {
 *   db.tables['Users'].insertRow({ name: 'Alice', email: 'alice@example.com' });
 *   db.tables['Logs'].insertRow({ action: 'user_created', user: 'Alice' });
 *   db.commit();  // Both operations succeed together
 * } catch (error) {
 *   db.rollback();  // Both operations are cancelled
 * }
 * ```
 *
 * ### Virtual Columns
 *
 * ```javascript
 * // Define computed columns
 * db.tables['Users'].defineVirtualColumn('fullName', row =>
 *   `${row.firstName} ${row.lastName}`
 * );
 *
 * db.tables['Users'].defineVirtualColumn('isActive', row =>
 *   row.status === 'active'
 * );
 *
 * // Virtual columns are automatically included in all queries
 * const users = db.tables['Users'].getRows();
 * users.forEach(user => {
 *   console.log(user.fullName);  // Computed value
 *   console.log(user.isActive);  // Computed value
 * });
 * ```
 *
 * ### Schema Validation
 *
 * ```javascript
 * // Define table schema
 * db.tables['Users'].setSchema({
 *   fields: {
 *     name: { type: 'string', required: true },
 *     email: { type: 'email', required: true },
 *     age: {
 *       type: 'number',
 *       validate: (val) => val >= 0 && val <= 150
 *     },
 *     status: { type: 'string', default: 'active' },
 *     verified: { type: 'boolean', default: false }
 *   }
 * });
 *
 * // Schema is enforced on insert/update
 * db.tables['Users'].insertRow({
 *   name: 'Bob',
 *   email: 'bob@example.com',
 *   age: 25
 *   // status and verified get default values automatically
 * });
 * ```
 *
 * ### Fuzzy Search
 *
 * ```javascript
 * // Find names similar to "Giusepe" (will match "Giuseppe")
 * const results = db.tables['Users'].fuzzySearch('Giusepe', ['name'], 0.3);
 * results.forEach(result => {
 *   console.log(`${result.item.name} (score: ${result.score})`);
 * });
 *
 * // Search across multiple fields
 * const multiFieldResults = db.tables['Users'].fuzzySearch(
 *   'john@exampl',
 *   ['name', 'email'],
 *   0.4
 * );
 * ```
 *
 * ### Indexing for Performance
 *
 * ```javascript
 * // Create index on frequently queried fields
 * db.tables['Users'].createIndex('email');
 * db.tables['Users'].createIndex('department');
 *
 * // Queries on indexed fields use O(1) lookups
 * const user = db.select()
 *   .from('Users')
 *   .where('email', '=', 'john@example.com')  // Uses index
 *   .first();
 * ```
 *
 * ### Batch Operations
 *
 * ```javascript
 * // Batch insert (single API call)
 * const newUsers = db.tables['Users'].insertRows([
 *   { name: 'Alice', email: 'alice@example.com' },
 *   { name: 'Bob', email: 'bob@example.com' },
 *   { name: 'Charlie', email: 'charlie@example.com' }
 * ]);
 * db.save();
 * ```
 *
 * ## Integration Patterns
 *
 * **With DomainRepositoryLib:**
 * SheetDBLib serves as the persistence layer for DomainRepositoryLib's Repository pattern.
 * TableService provides the low-level CRUD operations that repositories use to persist domain entities.
 *
 * **With GasDataImporter:**
 * DatabaseService can be used as the target for ETL operations. GasDataImporter transforms and loads
 * data into SheetDBLib tables, which then handle persistence to Google Sheets.
 *
 * **With ContextEngine:**
 * TableService queries can serve as data providers for ContextEngine recipes, supplying structured
 * data for template rendering or business logic evaluation.
 *
 * ## Performance Considerations
 *
 * **Lazy Loading:**
 * Table data is loaded only when first accessed, not during database initialization. This significantly
 * reduces startup time for databases with many tables.
 *
 * **Batch Operations:**
 * All sheet modifications are batched via GoogleApiWrapper's batch API, reducing API calls from O(N)
 * to O(1) for most operations.
 *
 * **Dirty Checking:**
 * Updates use CoreUtilsLib's isEqual to compare new data with original values. If no changes detected, the
 * API call is skipped entirely, saving quota.
 *
 * **Write-Through Caching:**
 * Modifications update the in-memory cache instead of invalidating it, avoiding full table reloads
 * after inserts/updates/deletes.
 *
 * **Query Optimization:**
 * - Indexed fields enable O(1) lookups vs O(N) table scans
 * - LIMIT queries use partial sort (QuickSelect) for O(N) vs O(N log N) performance
 * - JOINs use hash join for equality operators (O(N+M) vs O(N*M) nested loop)
 * - Query results are cached for 5 minutes to avoid repeated execution
 *
 * ## Security Considerations
 *
 * **Schema Validation:**
 * Type checking and custom validators prevent invalid data from being written to sheets.
 * Email validation prevents malformed email addresses.
 *
 * **SQL Injection Prevention:**
 * Query builder uses parameterized conditions, not string concatenation. All operators are validated
 * against a whitelist, preventing injection attacks through operator manipulation.
 *
 * **Transaction Isolation:**
 * Transactions use snapshot isolation - they see a consistent view of data from transaction start,
 * preventing dirty reads and non-repeatable reads.
 *
 * @version 1.0.0
 * @author GasLibraryFactory
 * @license MIT
 */

// Core services
export { TableService } from './src/TableService';
export { DatabaseService } from './src/DatabaseService';

// Query builder
export { AdvancedQueryBuilder } from './src/query/AdvancedQueryBuilder';

// Dynamic Schema - Column family pattern for dynamic columns
export { ColumnType, coerceToType } from './src/internal/dynamic-columns/ColumnType';
export { ColumnFamily, MemberSourceType } from './src/internal/dynamic-columns/ColumnFamily';
export { SchemaTemplate } from './src/internal/dynamic-columns/SchemaTemplate';
export { SchemaResolver } from './src/internal/dynamic-columns/SchemaResolver';
export { DynamicColumnAccessor } from './src/internal/dynamic-columns/DynamicColumnAccessor';
export { FamilyAggregator, AggregationType } from './src/internal/dynamic-columns/FamilyAggregator';

// MultiDatabase - Multi-partition database management
export {
  RoutingStrategy,
  isValidRoutingStrategy,
  getRoutingStrategies
} from './src/multi/RoutingStrategy';
export { DatabasePartition } from './src/multi/DatabasePartition';
export { PartitionConfiguration } from './src/multi/PartitionConfiguration';
export { PartitionRouter } from './src/multi/PartitionRouter';
export { CrossPartitionQuery } from './src/multi/CrossPartitionQuery';
export { MultiDatabaseManager } from './src/multi/MultiDatabaseManager';
export {
  MultiDatabaseError,
  PartitionNotFoundError,
  PartitionConnectionError,
  ReadOnlyPartitionError,
  CrossPartitionQueryError,
  CrossPartitionDisabledError
} from './src/multi/MultiDatabaseError';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
