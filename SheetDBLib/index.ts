// ===================================================================
// FILE: SheetDBLib/index.js
// ===================================================================
// Main entry point for SheetDBLib ES Module exports.
// See README.md for architecture, usage examples, and integration patterns.
// ===================================================================

// Core services
export { TableService } from './src/TableService.js';
export { DatabaseService } from './src/DatabaseService.js';

// Query builder
export { AdvancedQueryBuilder } from './src/query/AdvancedQueryBuilder.js';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';

export type * from './src/types.js';
