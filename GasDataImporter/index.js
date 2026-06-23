/**
 * @fileoverview GasDataImporter - Recipe-Based ETL Engine for Google Apps Script
 * @author GasLibraryFactory
 * @version 1.0.0
 *
 * ## Overview
 *
 * GasDataImporter is a data-driven ETL (Extract-Transform-Load) library for importing data from
 * external Google Sheets into SheetDBLib-managed databases using declarative JSON recipes.
 *
 * ## Architecture
 *
 * The library follows a three-phase ETL pipeline architecture:
 *
 * ```
 * JSON Recipe → ImportEngine
 *                 ↓
 *         ┌───────┴───────┐
 *         │  EXTRACT      │ ← SourceStrategy (SheetById, Folder, Custom)
 *         │  (Phase 1)    │   └→ SpreadsheetService, DriveService
 *         └───────┬───────┘
 *                 ↓
 *         ┌───────┴───────┐
 *         │  TRANSFORM    │ ← Transformer
 *         │  (Phase 2)    │   ├→ Column Mapping (rename)
 *         └───────┬───────┘   ├→ Calculated Fields (expressions)
 *                 ↓           └→ Normalization (trim, dates)
 *         ┌───────┴───────┐
 *         │  LOAD         │ ← Loader
 *         │  (Phase 3)    │   ├→ Conflict Resolution (INSERT_ONLY, UPSERT, OVERWRITE)
 *         └───────┬───────┘   └→ SheetDBLib DatabaseService
 *                 ↓
 *           Import Result
 * ```
 *
 * ## Key Features
 *
 * ### 1. Recipe-Based Configuration
 * - Declarative JSON recipes define entire ETL process
 * - No code changes needed for new import types
 * - Version control friendly (recipes are just JSON)
 * - Validation on recipe construction
 *
 * ### 2. Multiple Source Strategies
 * - **SheetById**: Import from a specific Google Sheet by ID
 * - **Folder**: Scan all sheets in a Google Drive folder
 * - **Custom**: Register your own source strategies (APIs, databases, etc.)
 * - Strategy pattern allows easy extension
 *
 * ### 3. Expression-Based Transformations
 * - **Column Mapping**: Rename source columns to target schema
 * - **Calculated Fields**: Create new columns using GasExpressionEngineLib expressions
 * - **Normalization**: Trim whitespace, parse dates, normalize casing
 * - Template syntax: `{{COLUMN_NAME}}` for dynamic values
 *
 * ### 4. Conflict Resolution Modes
 * - **INSERT_ONLY**: Only insert new records, skip existing
 * - **UPDATE_ONLY**: Only update existing records, skip new
 * - **UPSERT**: Insert new, update existing (default)
 * - **OVERWRITE**: Delete all existing, insert fresh data
 * - Update-if-newer: Only update if timestamp is newer
 *
 * ### 5. Resilience & Error Handling
 * - Integration with GasResilienceLib for automatic retry
 * - Detailed error types (SourceError, TransformError, LoadError, ConfigurationError)
 * - Dry-run mode for testing without persisting
 * - Comprehensive logging throughout pipeline
 *
 * ### 6. Performance Optimizations
 * - Batch operations via SheetDBLib
 * - Lazy loading of source data
 * - Expression caching via GasExpressionEngineLib
 * - Minimal API calls via GoogleApiWrapper
 *
 * ## Dependencies
 *
 * - **GoogleApiWrapper** (v3.0.0+) - DriveService, SpreadsheetService for Google APIs
 * - **SheetDBLib** (v1.0.0+) - DatabaseService for target database operations
 * - **GasExpressionEngineLib** (v1.0.0+) - ExpressionEngineService for calculated fields (optional)
 * - **GasResilienceLib** (v2.0.0+) - ExceptionService for retry logic (optional)
 * - **CoreUtilsLib** (v1.0.0+) - LoggerService for logging
 *
 * ## Exported Components
 *
 * ### Core Engine
 * - **ImportEngine** - Main ETL orchestrator
 *
 * ### Configuration
 * - **ImportConfiguration** - Recipe validator and value object
 *
 * ### Extract Phase (4 components)
 * - **SourceStrategy** - Abstract base class for source strategies
 * - **SheetByIdStrategy** - Import from specific sheet by ID
 * - **FolderStrategy** - Import from all sheets in a folder
 * - **SourceStrategyFactory** - Creates strategy instances
 *
 * ### Transform Phase
 * - **Transformer** - Handles mapping, calculations, and normalization
 *
 * ### Load Phase
 * - **Loader** - Handles conflict resolution and database persistence
 *
 * ### Error Classes (5 types)
 * - **ImportError** - Base error class for all import errors
 * - **SourceError** - Errors during extraction (file not found, invalid sheet, etc.)
 * - **TransformError** - Errors during transformation (invalid mapping, expression errors, etc.)
 * - **LoadError** - Errors during loading (database errors, constraint violations, etc.)
 * - **ConfigurationError** - Errors in recipe validation (invalid structure, missing fields, etc.)
 *
 * ## Usage Examples
 *
 * @example
 * // 1. Basic Import - SheetById with column mapping and UPSERT
 * import { ImportEngine } from '@GasDataImporter';
 * import { LoggerService } from '@CoreUtilsLib';
 * import { ServiceFactory } from '@GoogleApiWrapper';
 * import { DatabaseService } from '@SheetDBLib';
 *
 * const logger = new LoggerService();
 * const factory = ServiceFactory.configure({ logger });
 * const db = new DatabaseService('TARGET_SHEET_ID', logger);
 *
 * const engine = new ImportEngine(
 *   logger,
 *   factory.getDriveService(),
 *   factory.getSpreadsheetService(),
 *   db
 * );
 *
 * const recipe = {
 *   name: 'Import Users from External Sheet',
 *   source: {
 *     type: 'SheetById',
 *     config: {
 *       sheetId: 'SOURCE_SHEET_ID',
 *       range: 'A1:Z',
 *       hasHeaders: true
 *     }
 *   },
 *   transform: {
 *     mapping: {
 *       'First Name': 'FIRST_NAME',
 *       'Last Name': 'LAST_NAME',
 *       'Email Address': 'EMAIL'
 *     }
 *   },
 *   load: {
 *     targetTable: 'Users',
 *     conflictResolution: 'UPSERT',
 *     conflictKey: 'EMAIL'
 *   }
 * };
 *
 * const result = engine.runImport(recipe);
 * // Result: { success: true, extract: { rowsExtracted: 100 }, transform: { rowsTransformed: 100 }, load: { inserted: 20, updated: 80 } }
 *
 * @example
 * // 2. Advanced Import - Calculated fields with expressions
 * import { ImportEngine } from '@GasDataImporter';
 * import { ExpressionEngineService } from '@GasExpressionEngineLib';
 * import { ExceptionService } from '@GasResilienceLib';
 *
 * const expressionEngine = new ExpressionEngineService({ logger });
 * const exceptionService = new ExceptionService(logger, utils);
 *
 * const engine = new ImportEngine(
 *   logger,
 *   driveService,
 *   spreadsheetService,
 *   db,
 *   expressionEngine,
 *   exceptionService
 * );
 *
 * const recipe = {
 *   name: 'Import Products with Calculations',
 *   source: {
 *     type: 'SheetById',
 *     config: { sheetId: 'PRODUCTS_SHEET_ID', hasHeaders: true }
 *   },
 *   transform: {
 *     mapping: {
 *       'Product Name': 'NAME',
 *       'Price': 'PRICE',
 *       'Quantity': 'QTY'
 *     },
 *     calculated: {
 *       'TOTAL_VALUE': '{{PRICE}} * {{QTY}}',
 *       'FULL_NAME': '{{NAME}} ({{QTY}} units)',
 *       'IS_IN_STOCK': '{{QTY}} > 0'
 *     },
 *     normalization: {
 *       trim: true,
 *       dateColumns: ['CREATED_AT']
 *     }
 *   },
 *   load: {
 *     targetTable: 'Products',
 *     conflictResolution: 'UPSERT',
 *     conflictKey: 'NAME'
 *   }
 * };
 *
 * const result = engine.runImport(recipe, { maxRetries: 5 });
 *
 * @example
 * // 3. Folder Import - Process all sheets in a folder
 * const recipe = {
 *   name: 'Import All Sales Reports',
 *   source: {
 *     type: 'Folder',
 *     config: {
 *       folderId: 'SALES_FOLDER_ID',
 *       fileNamePattern: '^Sales_.*\\.xlsx$',
 *       hasHeaders: true
 *     }
 *   },
 *   transform: {
 *     mapping: {
 *       'Sale Date': 'SALE_DATE',
 *       'Amount': 'AMOUNT',
 *       'Customer': 'CUSTOMER_NAME'
 *     }
 *   },
 *   load: {
 *     targetTable: 'Sales',
 *     conflictResolution: 'INSERT_ONLY' // Never update existing sales
 *   }
 * };
 *
 * const result = engine.runImport(recipe);
 *
 * @example
 * // 4. Dry Run - Test recipe without persisting data
 * const validation = engine.validateRecipe(recipe);
 * if (!validation.valid) {
 *   console.error('Recipe validation failed:', validation.error);
 * }
 *
 * // Run without persisting to database
 * const dryResult = engine.runImport(recipe, { dryRun: true });
 * console.log(`Would import ${dryResult.transform.rowsTransformed} rows`);
 *
 * @example
 * // 5. Custom Source Strategy - Import from external API
 * import { SourceStrategy } from '@GasDataImporter';
 *
 * class ApiSourceStrategy extends SourceStrategy {
 *   constructor(logger) {
 *     super(logger);
 *   }
 *
 *   _extractData(config) {
 *     const response = UrlFetchApp.fetch(config.url, {
 *       headers: { 'Authorization': `Bearer ${config.apiKey}` }
 *     });
 *     return JSON.parse(response.getContentText());
 *   }
 * }
 *
 * engine.registerCustomSource('ApiSource', ApiSourceStrategy);
 *
 * const apiRecipe = {
 *   name: 'Import from REST API',
 *   source: {
 *     type: 'ApiSource',
 *     config: {
 *       url: 'https://api.example.com/users',
 *       apiKey: 'YOUR_API_KEY'
 *     }
 *   },
 *   load: {
 *     targetTable: 'Users',
 *     conflictResolution: 'UPSERT',
 *     conflictKey: 'ID'
 *   }
 * };
 *
 * const result = engine.runImport(apiRecipe);
 *
 * @example
 * // 6. Conflict Resolution - OVERWRITE mode
 * const recipe = {
 *   name: 'Daily Price Update - Full Refresh',
 *   source: {
 *     type: 'SheetById',
 *     config: { sheetId: 'PRICE_MASTER_SHEET', hasHeaders: true }
 *   },
 *   transform: {
 *     mapping: { 'SKU': 'SKU', 'Price': 'PRICE' }
 *   },
 *   load: {
 *     targetTable: 'Prices',
 *     conflictResolution: 'OVERWRITE' // Delete all existing, insert fresh
 *   }
 * };
 *
 * const result = engine.runImport(recipe);
 * // All old prices deleted, new prices inserted
 *
 * @example
 * // 7. Update-If-Newer - Conditional updates based on timestamp
 * const recipe = {
 *   name: 'Import Inventory - Update If Newer',
 *   source: {
 *     type: 'SheetById',
 *     config: { sheetId: 'INVENTORY_SHEET', hasHeaders: true }
 *   },
 *   transform: {
 *     mapping: {
 *       'SKU': 'SKU',
 *       'Stock': 'STOCK_QTY',
 *       'Updated': 'LAST_UPDATED'
 *     }
 *   },
 *   load: {
 *     targetTable: 'Inventory',
 *     conflictResolution: 'UPSERT',
 *     conflictKey: 'SKU',
 *     updateIfNewer: {
 *       enabled: true,
 *       timestampColumn: 'LAST_UPDATED'
 *     }
 *   }
 * };
 *
 * const result = engine.runImport(recipe);
 * // Only updates records where source timestamp > target timestamp
 *
 * @example
 * // 8. Error Handling - Catching specific error types
 * import { ImportError, SourceError, TransformError, LoadError } from '@GasDataImporter';
 *
 * try {
 *   const result = engine.runImport(recipe);
 * } catch (error) {
 *   if (error instanceof SourceError) {
 *     console.error('Failed to extract data:', error.code, error.context);
 *   } else if (error instanceof TransformError) {
 *     console.error('Failed to transform data:', error.code, error.context);
 *   } else if (error instanceof LoadError) {
 *     console.error('Failed to load data:', error.code, error.context);
 *   } else if (error instanceof ImportError) {
 *     console.error('Import failed:', error.toJSON());
 *   }
 * }
 *
 * ## Integration Patterns
 *
 * ### With SheetDBLib
 * GasDataImporter loads data into SheetDBLib databases, enabling:
 * - SQL-like queries on imported data
 * - JOINs across imported datasets
 * - Virtual columns and indexes
 * - Transaction support
 *
 * ### With ContextEngine
 * Use ImportEngine within ContextEngine data providers:
 * ```javascript
 * class ImportDataProvider extends DataProvider {
 *   _fetchData(params) {
 *     const engine = new ImportEngine(logger, drive, sheets, db);
 *     const result = engine.runImport(params.recipe);
 *     return result;
 *   }
 * }
 * ```
 *
 * ### With PipelineFramework
 * Create import steps in pipelines:
 * ```javascript
 * class ImportStep extends Step {
 *   execute(context) {
 *     const engine = new ImportEngine(logger, drive, sheets, db);
 *     const result = engine.runImport(context.get('recipe'));
 *     context.set('importResult', result);
 *   }
 * }
 * ```
 *
 * ### With JobRunnerLib
 * Schedule imports as long-running jobs:
 * ```javascript
 * function* importJob(config) {
 *   const engine = new ImportEngine(logger, drive, sheets, db);
 *   yield 'Starting import...';
 *   const result = engine.runImport(config.recipe);
 *   yield `Imported ${result.load.inserted + result.load.updated} rows`;
 *   return result;
 * }
 * ```
 *
 * ## Recipe Format Reference
 *
 * Complete recipe structure:
 * ```javascript
 * {
 *   name: string,                    // Required: Import name for identification
 *   source: {
 *     type: 'SheetById' | 'Folder',  // Required: Source type
 *     config: {                      // Required: Type-specific config
 *       // For SheetById:
 *       sheetId: string,             // Required: Google Sheet ID
 *       range?: string,              // Optional: Range (default: all)
 *       hasHeaders?: boolean,        // Optional: First row is headers (default: true)
 *
 *       // For Folder:
 *       folderId: string,            // Required: Google Drive Folder ID
 *       fileNamePattern?: string,    // Optional: Regex pattern for file names
 *       hasHeaders?: boolean         // Optional: First row is headers (default: true)
 *     }
 *   },
 *   transform?: {                    // Optional: Transformation config
 *     mapping?: {                    // Optional: Column renaming
 *       'Source Column': 'TARGET_COLUMN'
 *     },
 *     calculated?: {                 // Optional: Calculated fields
 *       'NEW_COLUMN': '{{EXPR}}'     // Expression using GasExpressionEngineLib
 *     },
 *     normalization?: {              // Optional: Data normalization
 *       trim?: boolean,              // Trim whitespace
 *       dateColumns?: string[]       // Parse as dates
 *     }
 *   },
 *   load: {
 *     targetTable: string,           // Required: Target table in SheetDBLib
 *     conflictResolution: 'INSERT_ONLY' | 'UPDATE_ONLY' | 'UPSERT' | 'OVERWRITE',
 *     conflictKey?: string,          // Required for UPDATE_ONLY, UPSERT, OVERWRITE
 *     updateIfNewer?: {              // Optional: Conditional updates
 *       enabled: boolean,
 *       timestampColumn: string      // Column to compare timestamps
 *     }
 *   }
 * }
 * ```
 *
 * ## Performance Characteristics
 *
 * - **Extract**: O(n) where n = rows in source
 * - **Transform**: O(n * m) where m = calculated fields
 * - **Load**: O(n) with batch operations via SheetDBLib
 * - **Memory**: Entire dataset loaded into memory (GAS 6-minute limit applies)
 * - **API Calls**: Minimized via GoogleApiWrapper batch operations
 *
 * ## Security Considerations
 *
 * - Recipe validation prevents injection attacks
 * - Expression evaluation sandboxed via GasExpressionEngineLib
 * - No direct eval() or Function() calls
 * - File access controlled via Drive permissions
 * - Target database isolated via SheetDBLib
 *
 * ## Best Practices
 *
 * 1. **Always validate recipes** before production use with `validateRecipe()`
 * 2. **Use dry-run mode** to test transformations without persisting
 * 3. **Enable retry logic** by injecting ExceptionService for resilience
 * 4. **Monitor import duration** to stay within GAS 6-minute execution limit
 * 5. **Use UPSERT** for most cases; OVERWRITE only when needed
 * 6. **Test expressions** in GasExpressionEngineLib before using in recipes
 * 7. **Version control recipes** as JSON files for change tracking
 *
 * ## Limitations
 *
 * - **Google Apps Script**: 6-minute execution limit for large imports
 * - **Memory**: Entire dataset loaded into memory (limited by GAS quotas)
 * - **No streaming**: Cannot process files larger than memory limits
 * - **Synchronous only**: No async/await (GAS V8 limitation)
 * - **Expression complexity**: Calculated fields limited by GasExpressionEngineLib capabilities
 *
 * @module GasDataImporter
 */

// Main engine
export { ImportEngine } from './src/ImportEngine.js';

// Configuration
export { ImportConfiguration } from './src/ImportConfiguration.js';

// Extract phase
export { SourceStrategy } from './src/internal/extract-strategies/SourceStrategy.js';
export { SheetByIdStrategy } from './src/internal/extract-strategies/SheetByIdStrategy.js';
export { FolderStrategy } from './src/internal/extract-strategies/FolderStrategy.js';
export { SourceStrategyFactory } from './src/internal/extract-strategies/SourceStrategyFactory.js';

// Transform phase
export { Transformer } from './src/pipeline/Transformer.js';

// Load phase
export { Loader } from './src/internal/load/Loader.js';

// Errors
export { ImportError } from './src/internal/errors/ImportError.js';
export { SourceError } from './src/internal/errors/SourceError.js';
export { TransformError } from './src/internal/errors/TransformError.js';
export { LoadError } from './src/internal/errors/LoadError.js';
export { ConfigurationError } from './src/internal/errors/ConfigurationError.js';
