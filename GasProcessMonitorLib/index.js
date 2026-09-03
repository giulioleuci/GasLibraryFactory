// ===================================================================
// FILE: GasProcessMonitorLib/index.js
// ===================================================================
// Main entry point for GasProcessMonitorLib ES Module exports
// ===================================================================

/**
 * GasProcessMonitorLib - Process monitoring and visualization layer
 *
 * @module GasProcessMonitorLib
 *
 * See README.md for installation, usage, storage strategy, and integration docs.
 */

// Core services
export { ProcessMonitorService, ProcessState, StepState } from './src/ProcessMonitorService.js';
export { DashboardUi } from './src/DashboardUi.js';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
