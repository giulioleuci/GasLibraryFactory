# GasLibraryFactory API Reference

> Detailed API documentation with method descriptions. Auto-generated.

---

## Table of Contents

- [GasProcessMonitorLib](#gasprocessmonitorlib)

---

## GasProcessMonitorLib

Process monitoring and visualization layer for Google Apps Script applications. **Layer:** Presentation & Monitoring (Layer 4)   **Dependencies:** SheetDBLib, GoogleApiWrapper, CoreUtilsLib

### DashboardUi

UI service for generating process monitoring dashboard sidebars

**Initialization:**
```javascript
new DashboardUi()
```

**Methods:**

- `createSidebar(jobId: string, title='Process Monitor': string, options={}: Object, options.pollingInterval=1500: number, options.width=300: number): Object`
  > UiService instance

- `getConfigSummary(): Object`
  > Formats milliseconds to a readable duration string / function formatDuration(ms) { if (!ms || ms < 0) return '--'; const seconds = Math.floor(ms / 1000); const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; if (minutes > 0) { return minutes + 'm ' + remainingSeconds + 's'; } return seconds + 's'; } /** Capitalizes the first letter of a string / function capitalize(str) { if (!str) return ''; return str.charAt(0).toUpperCase() + str.slice(1); } /** Updates the DOM with new state / function updateUI(state) { if (!state) { document.getElementById('status-text').textContent = 'Job not found'; return; } // Track start time for elapsed calculation if (!startTime && state.startTime) { startTime = state.startTime; } // Update status badge const statusBadge = document.getElementById('status-badge'); const statusText = document.getElementById('status-text'); statusBadge.className = 'status-badge status-' + state.status; statusText.textContent = capitalize(state.status); // Update progress const percentage = state.percentage || 0; document.getElementById('percentage').textContent = percentage + '%'; const progressFill = document.getElementById('progress-fill'); progressFill.style.width = percentage + '%'; progressFill.className = 'progress-fill' + (state.status === 'completed' ? ' completed' : '') + (state.status === 'failed' ? ' failed' : ''); // Update message document.getElementById('message').textContent = state.message || ''; // Update steps const stepsList = document.getElementById('steps-list'); if (state.steps && state.steps.length > 0) { stepsList.innerHTML = state.steps.map(function(step) { const duration = step.endTime && step.startTime ? formatDuration(step.endTime - step.startTime) : (step.status === 'running' ? '...' : ''); return '<li class="step-item step-' + step.status + '">' + '<span class="step-icon"></span>' + '<span class="step-name">' + escapeHtml(step.name) + '</span>' + (duration ? '<span class="step-duration">' + duration + '</span>' : '') + '</li>'; }).join(''); } // Update error if present const errorContainer = document.getElementById('error-container'); if (state.error) { errorContainer.classList.remove('hidden'); document.getElementById('error-message').textContent = state.error; } else { errorContainer.classList.add('hidden'); } // Update elapsed time if (startTime) { const elapsed = (state.endTime || Date.now()) - startTime; document.getElementById('elapsed-time').textContent = 'Elapsed: ' + formatDuration(elapsed); } // Stop polling if job is complete if (state.status === 'completed' || state.status === 'failed') { stopPolling(); } } /** Escapes HTML to prevent XXSS / function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; } /** Fetches state from server and updates UI / function fetchState() { google.script.run .withSuccessHandler(updateUI) .withFailureHandler(function(error) { console.error('Failed to fetch state:', error); }) .getMonitorState(JOB_ID); } /** Starts polling for state updates / function startPolling() { if (pollingTimer) return; fetchState(); // Immediate first fetch pollingTimer = setInterval(fetchState, POLLING_INTERVAL); } /** Stops polling / function stopPolling() { if (pollingTimer) { clearInterval(pollingTimer); pollingTimer = null; } } // Start polling when page loads startPolling(); // Clean up on page unload window.addEventListener('beforeunload', stopPolling); })(); </script>`; } /** Retrieves library classification and version metadata.


### ProcessMonitorService

Service for managing process state with Cache and Properties persistence

**Initialization:**
```javascript
new ProcessMonitorService()
```

**Methods:**

- `registerJob(jobId: string): this`
  > Initializes monitoring for a new process, setting status to PENDING and committing to all storage tiers.

- `startJob(jobId: string): this`
  > Transitions a process status to RUNNING and records the start timestamp.

- `completeJob(jobId: string, message='Completed successfully': string): this`
  > Finalizes a successful process, setting status to COMPLETED and recording the end timestamp.

- `updateProgress(jobId: string, percentage: number, message='': string): this`
  > Updates completion metrics and status message via high-frequency cache writes.

- `logStepStart(jobId: string, stepName: string): this`
  > Appends or updates a named sub-task within the job lifecycle and marks it as RUNNING.

- `logStepComplete(jobId: string, stepName: string, success: boolean): this`
  > Marks a sub-task as COMPLETED or FAILED and records its duration.

- `logStepSkipped(jobId: string, stepName: string): this`
  > Registers a sub-task as SKIPPED within the job metadata.

- `setError(jobId: string, error: Error|string): this`
  > Terminates process tracking with FAILED status and records diagnostic error metadata.

- `getJobState(jobId: string): Object|null`
  > Retrieves the comprehensive state record for a process from tiered storage.

- `hasJob(jobId: string): boolean`
  > Verifies the existence of a monitoring record for the specified process.

- `clearJob(jobId: string): this`
  > Purges all state records for a process from both Cache and Properties tiers.

- `getConfigSummary(): Object`
  > Retrieves high-level configuration parameters for the monitoring service.


### ProcessMonitorServiceMock

Centralized high-fidelity mocks for GasProcessMonitorLib services.

**Initialization:**
```javascript
new ProcessMonitorServiceMock()
```


---

