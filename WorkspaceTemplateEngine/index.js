// ===================================================================
// FILE: WorkspaceTemplateEngine/index.js
// ===================================================================
// Main entry point for WorkspaceTemplateEngine ES Module exports
// ===================================================================

/**
 * WorkspaceTemplateEngine - Dynamic content generation for Google Workspace
 *
 * @module WorkspaceTemplateEngine
 *
 * @description
 * WorkspaceTemplateEngine provides dynamic content generation for Google Workspace applications
 * using Mustache templating with custom filters and Google-specific extensions. This library
 * enables sophisticated document and spreadsheet automation through declarative templates.
 *
 * ## Architecture
 *
 * The library follows a **layered processor architecture**:
 * - **Template Engine Layer**: Custom Mustache implementation with pipe filter syntax
 * - **Processor Layer**: Specialized processors for Google Docs and Sheets
 * - **Filter Layer**: Pluggable filter system using Strategy pattern
 * - **Service Layer**: High-level PlaceholderService facade
 *
 * Design Patterns:
 * - **Strategy Pattern**: Pluggable filter implementations
 * - **Template Method**: Document/Sheet processing workflows
 * - **Facade Pattern**: PlaceholderService simplifies API
 * - **Builder Pattern**: Reverse-order processing for document modifications
 *
 * ## Key Features
 *
 * 1. **Mustache Templating**: Full Mustache syntax (variables, sections, partials, comments)
 * 2. **Pipe Filters**: Custom `{{value | filter}}` syntax for data transformation
 * 3. **Google Docs Processing**: Table expansion, dynamic lists, placeholder replacement
 * 4. **Google Sheets Processing**: Cell substitution, data matrix expansion, range operations
 * 5. **Built-in Filters**: 10 filters (uppercase, lowercase, capitalize, date, number, join, pluralize, sortBy, where, exclude)
 * 6. **Custom Filters**: Extend FilterStrategy for domain-specific transformations
 * 7. **Template Caching**: Automatic caching for performance optimization
 * 8. **Reverse Processing**: Smart reverse-order processing prevents index shifts in Google Docs
 *
 * ## Dependencies
 *
 * - **GoogleApiWrapper**: DocumentService, SpreadsheetService for Google API operations
 * - **CoreUtilsLib**: LoggerService, UtilsService (date formatting, utilities)
 * - **he** (npm): HTML entity encoding/decoding for safe text processing
 *
 * ## Exported Components
 *
 * ### Core Template Engine (3 exports)
 * - **PlaceholderService**: Main facade for template processing operations
 * - **Mustache**: Custom Mustache engine with filter support and Google extensions
 * - **FilterStrategy**: Abstract base class for creating custom filters
 *
 * ### Processors (2 exports)
 * - **DocumentProcessor**: Google Docs template processor with table expansion and reverse-order processing
 * - **SheetProcessor**: Google Sheets template processor with cell and range operations
 *
 * ### Built-in Filters (10 filters, not exported - used internally)
 * - **String Filters**: uppercase, lowercase, capitalize
 * - **Formatting Filters**: date (dd/MM/yyyy), number (locale formatting)
 * - **Array Filters**: join, pluralize, sortBy, where, exclude
 *
 * ## Usage Examples
 *
 * ### Basic String Processing
 * ```javascript
 * import { PlaceholderService, Mustache } from '@WorkspaceTemplateEngine';
 *
 * const logger = new LoggerService();
 * const mustache = new Mustache({ logger });
 * const service = new PlaceholderService({ logger, mustache });
 *
 * const result = service.processString('Hello {{name | uppercase}}!', { name: 'world' });
 * // Returns: "Hello WORLD!"
 * ```
 *
 * ### Google Docs Processing with Table Expansion
 * ```javascript
 * // Template: Google Doc with table containing {{students}}
 * // Each row has: {{name}}, {{grade | number}}, {{status}}
 * service.processDocument('DOCUMENT_ID', {
 *   title: 'Q4 Report',
 *   students: [
 *     { name: 'Alice', grade: 95, status: 'Pass' },
 *     { name: 'Bob', grade: 87, status: 'Pass' }
 *   ]
 * });
 * // Result: Table expands to 2 rows with data substituted
 * ```
 *
 * ### Google Sheets Processing with Range Operations
 * ```javascript
 * import { SheetProcessor } from '@WorkspaceTemplateEngine';
 *
 * const processor = new SheetProcessor({ logger, utils, spreadsheetService });
 * processor.processSheet('SPREADSHEET_ID', 'Template', {
 *   companyName: 'Acme Corp',
 *   reportDate: new Date(),
 *   metrics: [
 *     { metric: 'Revenue', value: 150000 },
 *     { metric: 'Expenses', value: 75000 }
 *   ]
 * });
 * // Result: Placeholders replaced, data matrix expanded in sheet
 * ```
 *
 * ### Custom Filter Registration
 * ```javascript
 * import { FilterStrategy, Mustache } from '@WorkspaceTemplateEngine';
 *
 * // Create custom filter
 * class CurrencyFilter extends FilterStrategy {
 *   getName() { return 'currency'; }
 *   execute(value, symbol = '$') {
 *     return `${symbol}${Number(value).toFixed(2)}`;
 *   }
 * }
 *
 * const mustache = new Mustache({ logger });
 * mustache.registerFilter(new CurrencyFilter());
 *
 * const result = mustache.render('Price: {{amount | currency}}', { amount: 99.5 });
 * // Returns: "Price: $99.50"
 * ```
 *
 * ### Filter Chaining
 * ```javascript
 * const template = '{{items | sortBy:name | join:name:", "}}';
 * const result = service.processString(template, {
 *   items: [{ name: 'Zebra' }, { name: 'Apple' }, { name: 'Mango' }]
 * });
 * // Returns: "Apple, Mango, Zebra"
 * ```
 *
 * ### Array Filtering with where/exclude
 * ```javascript
 * const template = 'Active: {{users | where:status:active | join:name:", "}}';
 * const result = service.processString(template, {
 *   users: [
 *     { name: 'Alice', status: 'active' },
 *     { name: 'Bob', status: 'inactive' },
 *     { name: 'Carol', status: 'active' }
 *   ]
 * });
 * // Returns: "Active: Alice, Carol"
 * ```
 *
 * ## Integration Patterns
 *
 * ### With ContextEngine (Declarative Document Generation)
 * ```javascript
 * // ContextEngine assembles data, WorkspaceTemplateEngine renders it
 * const context = await contextAssembler.assemble(recipe);
 * const documentService = ServiceFactory.getDocumentService();
 * const service = new PlaceholderService({ logger, mustache, documentService });
 * service.processDocument(templateDocId, context);
 * ```
 *
 * ### With GasDataImporter (Data-Driven Reports)
 * ```javascript
 * // Import data, then generate formatted reports
 * const data = await importEngine.execute(importConfig);
 * service.processDocument(reportTemplateId, { records: data.imported });
 * ```
 *
 * ### With PipelineFramework (Multi-Step Document Generation)
 * ```javascript
 * // Pipeline step for document generation
 * class GenerateReportStep extends Step {
 *   execute(context) {
 *     const service = new PlaceholderService({ logger, mustache, documentService });
 *     const docId = service.processDocument(context.get('templateId'), context.get('data'));
 *     context.set('generatedDocId', docId);
 *   }
 * }
 * ```
 *
 * ## Performance Considerations
 *
 * - **Template Caching**: Mustache automatically caches parsed templates
 * - **Reverse Processing**: DocumentProcessor processes in reverse order to prevent index shifts (critical for table expansion)
 * - **Batch Operations**: Use GoogleApiWrapper's batch APIs for multi-document processing
 * - **Filter Performance**: Built-in filters are optimized; custom filters should avoid heavy computation
 *
 * ## Security Considerations
 *
 * - **Prototype Pollution**: All array filters (join, sortBy, where, exclude) prevent `__proto__`, `constructor`, `prototype` access
 * - **HTML Encoding**: Use `he` library for safe HTML entity encoding in templates
 * - **XSS Prevention**: Template data is not auto-escaped; sanitize user input before rendering
 *
 * ## Backward Compatibility
 *
 * - **BuiltInFilters**: Not exported; use Mustache's built-in filter registry (filters auto-registered)
 * - **Legacy MyMustache**: Refactored to Mustache class (WTE-HIGH-001)
 *
 * @version 1.0.0
 * @author GasLibraryFactory
 * @license MIT
 *
 * @see {@link PlaceholderService} Main service facade
 * @see {@link Mustache} Template engine with filter support
 * @see {@link FilterStrategy} Base class for custom filters
 * @see {@link DocumentProcessor} Google Docs processor
 * @see {@link SheetProcessor} Google Sheets processor
 */

// Core template engine
export { FilterStrategy } from './src/FilterStrategy';
export { Mustache, MustacheRenderError } from './src/facades/Mustache';
export { PlaceholderService } from './src/PlaceholderService';

// Processors
export { DocumentProcessor } from './src/processors/DocumentProcessor';
export { SheetProcessor } from './src/processors/SheetProcessor';
