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
 * @description
 * GasProcessMonitorLib provides real-time process monitoring and visualization
 * capabilities for Google Apps Script applications. It is designed as an **optional
 * add-on layer** that integrates with PipelineFramework, JobRunnerLib, and GasDataImporter
 * without introducing hard dependencies.
 *
 * ## Architecture
 *
 * GasProcessMonitorLib follows an **optional injection** pattern:
 *
 * 1. **ProcessMonitorService**: Manages process state with tiered Cache/Properties storage
 * 2. **DashboardUi**: Generates auto-refreshing HTML sidebars for visualization
 *
 * ### Storage Strategy
 *
 * - **Cache (every update)**: Fast writes for progress updates
 * - **Properties (lifecycle events only)**: Durable storage for start/complete/error
 *
 * ## Design Principles
 *
 * - **Optional Integration**: Core libraries work without this module (use optional chaining)
 * - **Quota Optimized**: Minimizes Properties writes for quota-sensitive environments
 * - **Real-Time Updates**: Polling-based sidebar updates without WebSocket complexity
 * - **Material Design**: Google Material-like styling for consistency
 *
 * ## Dependencies
 *
 * - **CoreUtilsLib** (Layer 0): LoggerService for logging
 * - **GoogleApiWrapper** (Layer 2): CacheService, PropertiesService, UiService
 * - **External**: None (pure ES6)
 *
 * ## Integration with Other Libraries
 *
 * GasProcessMonitorLib can be optionally injected into:
 *
 * - **PipelineFramework**: Monitor step execution via optional `monitor` in constructor
 * - **JobRunnerLib**: Track job progress via optional `monitor` in services object
 * - **GasDataImporter**: Monitor ETL phases via optional `monitor` in constructor
 *
 * **Important**: All integrations use optional chaining (`?.`) to ensure core
 * functionality works when the monitor is not provided.
 *
 * ## Quick Start
 *
 * ```javascript
 * import { ProcessMonitorService, DashboardUi } from '@GasProcessMonitorLib';
 * import { LoggerService } from '@CoreUtilsLib';
 * import { CacheService, PropertiesService, UiService } from '@GoogleApiWrapper';
 *
 * // Initialize services
 * const logger = new LoggerService();
 * const cacheService = new CacheService(logger);
 * const propertiesService = new PropertiesService(logger);
 * const uiService = new UiService(logger, cache, utils, exceptionService);
 *
 * // Create monitor
 * const monitor = new ProcessMonitorService(logger, cacheService, propertiesService);
 *
 * // Create dashboard UI
 * const dashboardUi = new DashboardUi(uiService, logger);
 *
 * // Use in a job
 * function runImport() {
 *   const jobId = 'import-' + Date.now();
 *   monitor.registerJob(jobId);
 *   dashboardUi.createSidebar(jobId, 'Import Progress').show();
 *
 *   try {
 *     monitor.startJob(jobId);
 *     monitor.updateProgress(jobId, 50, 'Processing...');
 *     // ... job logic
 *     monitor.completeJob(jobId);
 *   } catch (error) {
 *     monitor.setError(jobId, error);
 *   }
 * }
 * ```
 *
 * ## Global Function Requirement
 *
 * For the dashboard sidebar to work, you must expose a global function:
 *
 * ```javascript
 * // In your main script
 * function getMonitorState(jobId) {
 *   return processMonitor.getJobState(jobId);
 * }
 * ```
 *
 * @version 1.0.0
 * @author GasLibraryFactory
 * @license MIT
 *
 * @see {@link module:CoreUtilsLib} for LoggerService
 * @see {@link module:GoogleApiWrapper} for CacheService, PropertiesService, UiService
 * @see {@link module:PipelineFramework} for Pipeline integration
 * @see {@link module:JobRunnerLib} for JobQueue integration
 * @see {@link module:GasDataImporter} for ImportEngine integration
 */

// Core services
export { ProcessMonitorService, ProcessState, StepState } from './src/ProcessMonitorService.js';
export { DashboardUi } from './src/DashboardUi.js';

// Testing Mocks (Standardized Testing SDK)
export * as testing from './src/testing/mocks.js';
