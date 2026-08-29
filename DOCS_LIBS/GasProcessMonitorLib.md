# API Reference: GasProcessMonitorLib

## CLASS: ProcessMonitorService
**File Path:** `GasProcessMonitorLib/src/ProcessMonitorService.js`
**Constructor Usage:** `const instance = new ProcessMonitorService(logger, cacheService, propertiesService);`
**Description:** Orchestrator for tracking long-running process lifecycles, managing job states, progress metrics, and task-level auditing via tiered Cache and Properties storage.

### Raw JSDoc Context:
```javascript
/**
 * Orchestrator for tracking long-running process lifecycles, managing job states, progress metrics, and task-level auditing via tiered Cache and Properties storage.
 * @class
 */
```

### Methods of ProcessMonitorService

#### METHOD: ProcessMonitorService._getCache
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService._getCache();`
- **Pure JSDoc:**
```javascript
/**
   * Resolves the active script-level cache instance.
   * @private
   * @returns {Object} Active cache wrapper.
   */
```
---
#### METHOD: ProcessMonitorService._getCacheKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService._getCacheKey(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a prefixed unique identifier for cache-based job state.
   * @private
   * @param {string} jobId Unique process identifier.
   * @returns {string} Fully qualified cache key.
   */
```
---
#### METHOD: ProcessMonitorService._getPropsKey
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService._getPropsKey(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Generates a prefixed unique identifier for persistent property-based job state.
   * @private
   * @param {string} jobId Unique process identifier.
   * @returns {string} Fully qualified properties key.
   */
```
---
#### METHOD: ProcessMonitorService._writeState
- **Scope:** instance
- **LLM Call Syntax:** `processMonitorService._writeState(jobId, state, persistToProps);`
- **Pure JSDoc:**
```javascript
/**
   * Synchronizes process state to tiered storage, enforcing Properties persistence only for lifecycle transitions.
   * @private
   * @param {string} jobId target process identifier.
   * @param {Object} state Serialized process metadata.
   * @param {boolean} [persistToProps=false] If true, commits state to long-term storage.
   */
```
---
#### METHOD: ProcessMonitorService._readState
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService._readState(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves process state using a cache-first strategy with automated Properties fallback.
   * @private
   * @param {string} jobId Unique process identifier.
   * @returns {Object|null} current process state or null if not found.
   */
```
---
#### METHOD: ProcessMonitorService._createInitialState
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService._createInitialState(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Synthesizes a baseline state structure for a new monitoring context.
   * @private
   * @param {string} jobId Unique process identifier.
   * @returns {Object} Default state record.
   */
```
---
#### METHOD: ProcessMonitorService.registerJob
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.registerJob(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Initializes monitoring for a new process, setting status to PENDING and committing to all storage tiers.
   * @param {string} jobId Unique process identifier.
   * @returns {this} Chainable monitor instance.
   * @throws {Error} If jobId is invalid.
   */
```
---
#### METHOD: ProcessMonitorService.startJob
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.startJob(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Transitions a process status to RUNNING and records the start timestamp.
   * @param {string} jobId Unique process identifier.
   * @returns {this} Chainable monitor instance.
   */
```
---
#### METHOD: ProcessMonitorService.completeJob
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.completeJob(jobId, message);`
- **Pure JSDoc:**
```javascript
/**
   * Finalizes a successful process, setting status to COMPLETED and recording the end timestamp.
   * @param {string} jobId Unique process identifier.
   * @param {string} [message='Completed successfully'] final outcome summary.
   * @returns {this} Chainable monitor instance.
   */
```
---
#### METHOD: ProcessMonitorService.updateProgress
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.updateProgress(jobId, percentage, message);`
- **Pure JSDoc:**
```javascript
/**
   * Updates completion metrics and status message via high-frequency cache writes.
   * @param {string} jobId Unique process identifier.
   * @param {number} percentage progress value (0-100).
   * @param {string} [message=''] Contextual progress update.
   * @returns {this} Chainable monitor instance.
   * @throws {Error} If percentage is out of range.
   */
```
---
#### METHOD: ProcessMonitorService.logStepStart
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.logStepStart(jobId, stepName);`
- **Pure JSDoc:**
```javascript
/**
   * Appends or updates a named sub-task within the job lifecycle and marks it as RUNNING.
   * @param {string} jobId Unique process identifier.
   * @param {string} stepName Semantic sub-task identifier.
   * @returns {this} Chainable monitor instance.
   * @throws {Error} If stepName is invalid.
   */
```
---
#### METHOD: ProcessMonitorService.logStepComplete
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.logStepComplete(jobId, stepName, success);`
- **Pure JSDoc:**
```javascript
/**
   * Marks a sub-task as COMPLETED or FAILED and records its duration.
   * @param {string} jobId Unique process identifier.
   * @param {string} stepName Semantic sub-task identifier.
   * @param {boolean} success Outcome of the sub-task.
   * @returns {this} Chainable monitor instance.
   */
```
---
#### METHOD: ProcessMonitorService.logStepSkipped
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.logStepSkipped(jobId, stepName);`
- **Pure JSDoc:**
```javascript
/**
   * Registers a sub-task as SKIPPED within the job metadata.
   * @param {string} jobId Unique process identifier.
   * @param {string} stepName Semantic sub-task identifier.
   * @returns {this} Chainable monitor instance.
   */
```
---
#### METHOD: ProcessMonitorService.setError
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.setError(jobId, error);`
- **Pure JSDoc:**
```javascript
/**
   * Terminates process tracking with FAILED status and records diagnostic error metadata.
   * @param {string} jobId Unique process identifier.
   * @param {Error|string} error Descriptive failure details.
   * @returns {this} Chainable monitor instance.
   */
```
---
#### METHOD: ProcessMonitorService.getJobState
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.getJobState(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves the comprehensive state record for a process from tiered storage.
   * @param {string} jobId Unique process identifier.
   * @returns {Object|null} Process state or null if unregistered.
   */
```
---
#### METHOD: ProcessMonitorService.hasJob
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.hasJob(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Verifies the existence of a monitoring record for the specified process.
   * @param {string} jobId Unique process identifier.
   * @returns {boolean} True if a record is found.
   */
```
---
#### METHOD: ProcessMonitorService.clearJob
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.clearJob(jobId);`
- **Pure JSDoc:**
```javascript
/**
   * Purges all state records for a process from both Cache and Properties tiers.
   * @param {string} jobId Unique process identifier.
   * @returns {this} Chainable monitor instance.
   */
```
---
#### METHOD: ProcessMonitorService.getConfigSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = processMonitorService.getConfigSummary();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves high-level configuration parameters for the monitoring service.
   * @returns {Object} Service metadata.
   */
```
---
<br>

## CLASS: DashboardUi
**File Path:** `GasProcessMonitorLib/src/DashboardUi.js`
**Constructor Usage:** `const instance = new DashboardUi(uiService, logger);`
**Description:** UI generation service for process monitoring, creating interactive Google Apps Script sidebars with real-time status polling and progress visualization.

### Raw JSDoc Context:
```javascript
/**
 * UI generation service for process monitoring, creating interactive Google Apps Script sidebars with real-time status polling and progress visualization.
 * @class
 */
```

### Methods of DashboardUi

#### METHOD: DashboardUi.createSidebar
- **Scope:** instance
- **LLM Call Syntax:** `const result = dashboardUi.createSidebar(jobId, title, options, options.pollingInterval, options.width);`
- **Pure JSDoc:**
```javascript
/**
   * Orchestrates the creation of a pre-configured sidebar builder for a specific job tracking context.
   * @param {string} jobId Unique identifier of the process to monitor.
   * @param {string} [title='Process Monitor'] User-facing sidebar heading.
   * @param {Object} [options={}] UI behavior overrides.
   * @param {number} [options.pollingInterval=1500] Client-side refresh rate in milliseconds.
   * @param {number} [options.width=300] Sidebar pixel width.
   * @returns {Object} Prepared sidebar orchestrator.
   * @throws {Error} If jobId is invalid.
   */
```
---
#### METHOD: DashboardUi._generateHtml
- **Scope:** instance
- **LLM Call Syntax:** `const result = dashboardUi._generateHtml(jobId, pollingInterval);`
- **Pure JSDoc:**
```javascript
/**
   * Synthesizes the complete HTML document including styles and client-side polling logic.
   * @private
   * @param {string} jobId target process identifier.
   * @param {number} pollingInterval client refresh rate.
   * @returns {string} Standalone HTML/CSS/JS payload.
   */
```
---
#### METHOD: DashboardUi._generateStyles
- **Scope:** instance
- **LLM Call Syntax:** `const result = dashboardUi._generateStyles();`
- **Pure JSDoc:**
```javascript
/**
   * Generates the CSS component of the dashboard, implementing Material-inspired aesthetics.
   * @private
   * @returns {string} Inline style block.
   */
```
---
#### METHOD: DashboardUi._generateScript
- **Scope:** instance
- **LLM Call Syntax:** `const result = dashboardUi._generateScript(jobId, pollingInterval);`
- **Pure JSDoc:**
```javascript
/**
   * Generates the client-side JavaScript orchestrating asynchronous polling via google.script.run.
   * @private
   * @param {string} jobId target process identifier.
   * @param {number} pollingInterval local polling frequency.
   * @returns {string} Inline script block.
   */
```
---
#### METHOD: DashboardUi.getConfigSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = dashboardUi.getConfigSummary();`
- **Pure JSDoc:**
```javascript
/**
   * Retrieves library classification and version metadata.
   * @returns {Object} Library identity.
   */
```
---
<br>

## CLASS: ProcessMonitorServiceMock
**File Path:** `GasProcessMonitorLib/src/testing/mocks.js`
**Constructor Usage:** `const instance = new ProcessMonitorServiceMock();`
**Description:** High-fidelity mock for ProcessMonitorService, providing jest.fn() instrumentation for job lifecycles, progress tracking, and auditing.

### Raw JSDoc Context:
```javascript
/**
 * High-fidelity mock for ProcessMonitorService, providing jest.fn() instrumentation for job lifecycles, progress tracking, and auditing.
 * @class
 */
```

<br>

