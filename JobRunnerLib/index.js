// ===================================================================
// FILE: JobRunnerLib/index.js
// ===================================================================
// Main entry point for JobRunnerLib ES Module exports
// ===================================================================

/**
 * JobRunnerLib - Framework for managing long-running tasks in Google Apps Script
 *
 * @module JobRunnerLib
 *
 * @description
 * JobRunnerLib provides a robust framework for managing long-running tasks with automatic
 * state persistence, resumption via triggers, and comprehensive error handling in Google Apps Script.
 *
 * ## Architecture
 *
 * The library uses a **four-layer architecture**:
 *
 * 1. **JobRunnerService** - Main facade and entry point for job execution
 * 2. **JobQueue** - Execution orchestrator with timeout/retry/lock management
 * 3. **JobStateManager** - State persistence with tiered storage (Properties + Drive fallback)
 * 4. **JobTriggerManager** - Automatic trigger creation for job resumption
 *
 * Additional components:
 * - **JobDefinitionRegistry** - Centralized job type registry (optional, supports OCP pattern)
 * - **JobExecutor** - Generator execution engine with progress tracking
 * - **CapturingLogger** - Logger decorator that captures log entries for post-execution display
 *
 * ## Key Features
 *
 * ### State Management
 * - **Automatic state persistence** to Script Properties (with Drive fallback for large states)
 * - **Tiered storage**: Properties (9KB limit) → Drive file (unlimited)
 * - **Atomic locking** using LockService to prevent concurrent execution
 * - **Resume state preservation** with version tracking
 *
 * ### Execution Control
 * - **Timeout management** with configurable max duration (default: 25 minutes)
 * - **Automatic resumption** via time-based triggers
 * - **Retry logic** with exponential backoff on failure
 * - **Configurable trigger delay** (default: 1 minute)
 *
 * ### Progress Tracking
 * - **Generator-based handlers** for iterative work with yield points
 * - **Percentage completion** tracking (0-100%)
 * - **Custom resume state** preservation between executions
 * - **Exact total calculation** for nested generators
 *
 * ### Logging & UI
 * - **CapturingLogger** records all log entries during execution
 * - **Flexible log display**: sidebar, Drive file, or custom handler
 * - **Post-execution logging** preserves context after job completes
 *
 * ### Framework-Agnostic Design
 * - **No schema requirements** - works with any job structure
 * - **Callback-based registration** - job handlers defined in application code
 * - **Clean separation** - job definitions in app, execution in library
 *
 * ## Dependencies
 *
 * ### Required Dependencies
 * - **GoogleApiWrapper** - Drive, Lock, Properties, Trigger services
 * - **CoreUtilsLib** - LoggerService, UtilsService for utilities
 *
 * ### Optional Dependencies
 * - **GasResilienceLib** - Enhanced error handling and retry logic (recommended)
 *
 * ### External Dependencies (bundled)
 * - **immer** (npm) - Immutable state management for job state persistence
 *
 * ## Exported Components
 *
 * ### JobRunnerService
 * Main facade for job execution. Primary API:
 * - `run(jobId, jobType, params, registerCallback, forceRestart, maxDuration)` - Execute job
 * - `resume(jobId, registerCallback, maxDuration)` - Resume existing job
 * - `getStatus(jobId)` - Get current job status
 * - `resetJob(jobId)` - Clear all job state
 * - `cancelJob(jobId)` - Cancel running job
 *
 * ### JobQueue
 * Execution orchestrator with configuration methods:
 * - `setMaxDuration(ms)` - Configure timeout
 * - `setTriggerDelay(ms)` - Configure resume trigger delay
 * - `setMaxRetries(count)` - Configure retry attempts
 * - `execute(jobId, jobType, params, forceRestart)` - Execute job
 *
 * ### JobDefinitionRegistry
 * Optional centralized registry for job type definitions:
 * - `register(jobType, name, description, category, tags)` - Register job type
 * - `getDefinition(jobType)` - Get job metadata
 * - `listRegisteredJobs()` - List all registered jobs
 * - Supports Open-Closed Principle (OCP) for extensibility
 *
 * ### CapturingLogger
 * Logger decorator that captures log entries:
 * - Wraps any logger (LoggerService, console, etc.)
 * - Records all log calls during job execution
 * - Supports log display via sidebar, Drive file, or custom handler
 * - Full LoggerService API compatibility
 *
 * ## Usage Examples
 *
 * ### Example 1: Basic Job Execution
 * ```javascript
 * import { JobRunnerService, JobDefinitionRegistry } from '@JobRunnerLib';
 * import { LoggerService, UtilsService } from '@CoreUtilsLib';
 *
 * const logger = new LoggerService();
 * const utils = new UtilsService();
 * const registry = new JobDefinitionRegistry(logger);
 * const jobRunner = new JobRunnerService(logger, utils, registry);
 *
 * // Define job handler registration callback
 * function registerJobHandlers(queue, services) {
 *   queue.registerJobHandler('processData', function*(params) {
 *     const { resumeState } = params;
 *     let processed = resumeState?.processed || 0;
 *     const total = 1000;
 *
 *     for (let i = processed; i < total; i++) {
 *       processDataItem(i);
 *       // Yield progress and resume state
 *       yield { percentage: (i / total) * 100, processed: i };
 *     }
 *
 *     return { success: true, processed: total };
 *   });
 * }
 *
 * // Run job
 * const result = jobRunner.run(
 *   'data-processing-001',
 *   'processData',
 *   { sourceId: 'abc123' },
 *   registerJobHandlers,
 *   false,
 *   25 * 60 * 1000
 * );
 * ```
 *
 * ### Example 2: Job with Retry and Custom Trigger Delay
 * ```javascript
 * import { JobRunnerService } from '@JobRunnerLib';
 * import { ExceptionService } from '@GasResilienceLib';
 *
 * const exceptionService = new ExceptionService(logger, utils);
 * const jobRunner = new JobRunnerService(logger, utils, null, exceptionService);
 *
 * function registerJobHandlers(queue, services) {
 *   // Configure retry and trigger delay
 *   queue.setMaxRetries(5);
 *   queue.setTriggerDelay(2 * 60 * 1000); // 2 minutes
 *
 *   queue.registerJobHandler('importFromAPI', function*(params) {
 *     const { resumeState } = params;
 *     let page = resumeState?.page || 1;
 *     let hasMore = true;
 *
 *     while (hasMore) {
 *       const data = fetchApiData(page);
 *       importData(data);
 *       hasMore = data.hasNextPage;
 *       page++;
 *
 *       yield { percentage: (page / 10) * 100, page };
 *     }
 *
 *     return { success: true, pagesProcessed: page };
 *   });
 * }
 *
 * const result = jobRunner.run(
 *   'api-import-001',
 *   'importFromAPI',
 *   { apiKey: 'xyz789' },
 *   registerJobHandlers
 * );
 * ```
 *
 * ### Example 3: Job with Custom Logging Display
 * ```javascript
 * import { JobRunnerService, CapturingLogger } from '@JobRunnerLib';
 * import { LoggerService } from '@CoreUtilsLib';
 *
 * const baseLogger = new LoggerService();
 * const jobRunner = new JobRunnerService(baseLogger, utils);
 *
 * function registerJobHandlers(queue, services) {
 *   queue.registerJobHandler('generateReport', function*(params) {
 *     const { logger } = services; // CapturingLogger instance
 *     logger.info('Starting report generation...');
 *
 *     for (let section = 1; section <= 10; section++) {
 *       logger.debug(`Processing section ${section}...`);
 *       generateReportSection(section);
 *       yield { percentage: (section / 10) * 100 };
 *     }
 *
 *     logger.info('Report generation complete');
 *     return { success: true, sections: 10 };
 *   });
 * }
 *
 * // Run with custom logging display
 * const result = jobRunner.run(
 *   'report-001',
 *   'generateReport',
 *   {},
 *   registerJobHandlers,
 *   false,
 *   20 * 60 * 1000,
 *   {
 *     enabled: true,
 *     displayMode: 'drive', // 'sidebar' or 'drive' or 'custom'
 *     driveFolder: 'JobLogs',
 *     customHandler: (logs) => {
 *       // Custom log processing
 *       SpreadsheetApp.getActiveSpreadsheet()
 *         .getSheetByName('Logs')
 *         .appendRow([new Date(), logs]);
 *     }
 *   }
 * );
 * ```
 *
 * ### Example 4: Using JobDefinitionRegistry (OCP Pattern)
 * ```javascript
 * import { JobDefinitionRegistry, JobRunnerService } from '@JobRunnerLib';
 *
 * const registry = new JobDefinitionRegistry(logger);
 *
 * // Register job types with metadata
 * registry.register(
 *   'dataImport',
 *   'Data Import Job',
 *   'Imports data from external sources',
 *   'ETL',
 *   ['import', 'batch', 'etl']
 * );
 *
 * registry.register(
 *   'reportGeneration',
 *   'Report Generation',
 *   'Generates monthly reports',
 *   'Reports',
 *   ['reports', 'analytics']
 * );
 *
 * // List all registered jobs
 * const jobs = registry.listRegisteredJobs();
 * // [{jobType: 'dataImport', name: 'Data Import Job', ...}, ...]
 *
 * // Get statistics
 * const stats = registry.getStatistics();
 * // {totalJobs: 2, categories: {ETL: 1, Reports: 1}, ...}
 * ```
 *
 * ### Example 5: Manual Job Resumption
 * ```javascript
 * import { JobRunnerService } from '@JobRunnerLib';
 *
 * // Create trigger to call this function
 * function resumeJobFromTrigger(e) {
 *   const jobId = e.triggerUid; // Job ID passed via trigger
 *   const jobRunner = new JobRunnerService(logger, utils);
 *
 *   // Resume job with same handler registration
 *   const result = jobRunner.resume(
 *     jobId,
 *     registerJobHandlers,
 *     25 * 60 * 1000
 *   );
 *
 *   if (result.status === 'completed') {
 *     logger.info('Job completed successfully');
 *   }
 * }
 * ```
 *
 * ### Example 6: Checking Job Status
 * ```javascript
 * import { JobRunnerService } from '@JobRunnerLib';
 *
 * const jobRunner = new JobRunnerService(logger, utils);
 * const status = jobRunner.getStatus('data-processing-001');
 *
 * console.log(status);
 * // {
 * //   status: 'running',        // 'running' | 'completed' | 'failed' | 'cancelled' | 'not_found'
 * //   progress: {
 * //     percentage: 45.5,
 * //     processed: 455
 * //   },
 * //   retryCount: 1,
 * //   lastError: null,
 * //   lastUpdated: '2025-12-14T10:30:00.000Z'
 * // }
 * ```
 *
 * ## Integration Patterns
 *
 * ### With GasDataImporter
 * ```javascript
 * // Use JobRunnerLib to manage long-running imports
 * function registerJobHandlers(queue, services) {
 *   queue.registerJobHandler('largeImport', function*(params) {
 *     const { importConfig, resumeState } = params;
 *     const engine = new ImportEngine(services.logger);
 *
 *     let offset = resumeState?.offset || 0;
 *     const batchSize = 1000;
 *
 *     while (offset < importConfig.totalRows) {
 *       engine.import({ ...importConfig, offset, limit: batchSize });
 *       offset += batchSize;
 *       yield { percentage: (offset / importConfig.totalRows) * 100, offset };
 *     }
 *
 *     return { success: true, imported: offset };
 *   });
 * }
 * ```
 *
 * ### With PipelineFramework
 * ```javascript
 * // Execute pipeline as a job
 * function registerJobHandlers(queue, services) {
 *   queue.registerJobHandler('runPipeline', function*(params) {
 *     const { pipelineSteps, resumeState } = params;
 *     const pipeline = new Pipeline(services.logger);
 *
 *     let currentStep = resumeState?.currentStep || 0;
 *     pipelineSteps.forEach((step, i) => pipeline.addStep(step));
 *
 *     for (let i = currentStep; i < pipelineSteps.length; i++) {
 *       pipeline.executeStep(i);
 *       yield { percentage: ((i + 1) / pipelineSteps.length) * 100, currentStep: i + 1 };
 *     }
 *
 *     return { success: true, stepsCompleted: pipelineSteps.length };
 *   });
 * }
 * ```
 *
 * ### With ContextEngine
 * ```javascript
 * // Assemble context in stages using job
 * function registerJobHandlers(queue, services) {
 *   queue.registerJobHandler('assembleContext', function*(params) {
 *     const { recipes, resumeState } = params;
 *     const assembler = new ContextAssembler(services.logger);
 *
 *     let processed = resumeState?.processed || 0;
 *     const contexts = [];
 *
 *     for (let i = processed; i < recipes.length; i++) {
 *       contexts.push(assembler.assemble(recipes[i]));
 *       yield { percentage: ((i + 1) / recipes.length) * 100, processed: i + 1 };
 *     }
 *
 *     return { success: true, contexts };
 *   });
 * }
 * ```
 *
 * ## Performance Characteristics
 *
 * ### Storage
 * - **Properties Storage**: 9KB per job (Script Properties limit)
 * - **Drive Fallback**: Unlimited size for large resume states
 * - **Automatic Tiering**: Switches to Drive when state exceeds 9KB
 *
 * ### Execution
 * - **Timeout**: 6 minutes (GAS limit) - use maxDuration to stop earlier
 * - **Resume Latency**: 30s-1min (trigger timing variability)
 * - **Lock Acquisition**: 30s timeout (prevents concurrent execution)
 *
 * ### Scaling
 * - **Concurrent Jobs**: Unlimited (each job has unique ID)
 * - **Trigger Quota**: 20 triggers max (GAS limit)
 * - **Retry Backoff**: Exponential with max 5 minutes
 *
 * ## Error Handling
 *
 * - **Automatic Retry**: Configurable retry count with exponential backoff
 * - **Failure Callbacks**: Custom onFailure handlers for final failure
 * - **Error Persistence**: Last error stored in job state
 * - **Circuit Breaker**: Integration with GasResilienceLib for advanced patterns
 *
 * ## Best Practices
 *
 * 1. **Always preserve resume state** - Include all necessary data to resume from any yield point
 * 2. **Use small yield intervals** - Yield every 10-100 iterations for progress tracking
 * 3. **Configure appropriate timeout** - Set maxDuration < 6 minutes to avoid hard timeout
 * 4. **Clean up completed jobs** - Call resetJob() to remove state after completion
 * 5. **Use JobDefinitionRegistry** - For applications with multiple job types
 * 6. **Enable logging** - Use loggingConfig to preserve execution context
 * 7. **Test resumption** - Verify jobs can resume correctly from any yield point
 *
 * ## Migration Notes
 *
 * From v1.0 to v2.0:
 * - Added `loggingConfig` parameter to JobRunnerService.run()
 * - Added CapturingLogger for post-execution log display
 * - Added Drive fallback for large resume states (automatic, no migration needed)
 * - Added JobDefinitionRegistry for centralized job type management
 *
 * @version 1.0.0
 * @author GasLibraryFactory
 * @license MIT
 */

// Core services
export { JobDefinitionRegistry } from './src/JobDefinitionRegistry';
export { JobQueue } from './src/JobQueue';
export { JobRunnerService } from './src/JobRunnerService';
export { CapturingLogger } from './src/internal/CapturingLogger';
