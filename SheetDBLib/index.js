// ===================================================================
// FILE: SheetDBLib/index.js
// ===================================================================
// Main entry point for SheetDBLib ES Module exports.
// See README.md for architecture, usage examples, and integration patterns.
// ===================================================================

// Core services
export { TableService } from './src/TableService';
export { DatabaseService } from './src/DatabaseService';

// Query builder
export { AdvancedQueryBuilder } from './src/query/AdvancedQueryBuilder';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
