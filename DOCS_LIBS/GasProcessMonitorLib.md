# API Reference: GasProcessMonitorLib

## CLASS: ProcessMonitorService
**File Path:** `GasProcessMonitorLib/src/ProcessMonitorService.js`
**Constructor Usage:** `const instance = new ProcessMonitorService();`
**Description:** Service for managing process state with Cache and Properties persistence

/

/**
Enum for process/job states
@enum {string}
/
export const ProcessState = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
Enum for step states
@enum {string}
/
export const StepState = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

/**
Orchestrator for tracking long-running process lifecycles, managing job states, progress metrics, and task-level auditing via tiered Cache and Properties storage.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file GasProcessMonitorLib/src/ProcessMonitorService.js
 * @description Service for managing process state with Cache and Properties persistence
 * @version 1.0.0
 */

/**
 * Enum for process/job states
 * @enum {string}
 */
export const ProcessState = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Enum for step states
 * @enum {string}
 */
export const StepState = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

/**
 * Orchestrator for tracking long-running process lifecycles, managing job states, progress metrics, and task-level auditing via tiered Cache and Properties storage.
 * @class
 */
```

<br>

## CLASS: DashboardUi
**File Path:** `GasProcessMonitorLib/src/DashboardUi.js`
**Constructor Usage:** `const instance = new DashboardUi();`
**Description:** UI service for generating process monitoring dashboard sidebars

/

/**
UI generation service for process monitoring, creating interactive Google Apps Script sidebars with real-time status polling and progress visualization.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file GasProcessMonitorLib/src/DashboardUi.js
 * @description UI service for generating process monitoring dashboard sidebars
 * @version 1.0.0
 */

/**
 * UI generation service for process monitoring, creating interactive Google Apps Script sidebars with real-time status polling and progress visualization.
 * @class
 */
```

### Methods of DashboardUi

#### METHOD: DashboardUi.if
- **Scope:** instance
- **LLM Call Syntax:** `dashboardUi.if(!uiService || typeof uiService !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DashboardUi.if
- **Scope:** instance
- **LLM Call Syntax:** `dashboardUi.if(!logger || typeof logger !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DashboardUi.createSidebar
- **Scope:** instance
- **LLM Call Syntax:** `const result = dashboardUi.createSidebar(jobId, title, options, options.pollingInterval, options.width);`
- **Pure JSDoc:**
```javascript
/**
     * UiService instance
     * @private
     * @type {Object}
     */
    this._uiService = uiService;

    /**
     * Logger service
     * @private
     * @type {Object}
     */
    this._logger = logger;

    this._logger.debug('[DashboardUi] Instance created');
  }

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
#### METHOD: DashboardUi.if
- **Scope:** instance
- **LLM Call Syntax:** `dashboardUi.if(!jobId || typeof jobId !);`
- **Pure JSDoc:**
```javascript
/** Method if */
```
---
#### METHOD: DashboardUi.function
- **Scope:** instance
- **LLM Call Syntax:** `dashboardUi.function();`
- **Pure JSDoc:**
```javascript
/** Method function */
```
---
#### METHOD: DashboardUi.getConfigSummary
- **Scope:** instance
- **LLM Call Syntax:** `const result = dashboardUi.getConfigSummary();`
- **Pure JSDoc:**
```javascript
/**
       * Formats milliseconds to a readable duration string
       */
      function formatDuration(ms) {
        if (!ms || ms < 0) return '--';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
          return minutes + 'm ' + remainingSeconds + 's';
        }
        return seconds + 's';
      }

      /**
       * Capitalizes the first letter of a string
       */
      function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
      }

      /**
       * Updates the DOM with new state
       */
      function updateUI(state) {
        if (!state) {
          document.getElementById('status-text').textContent = 'Job not found';
          return;
        }

        // Track start time for elapsed calculation
        if (!startTime && state.startTime) {
          startTime = state.startTime;
        }

        // Update status badge
        const statusBadge = document.getElementById('status-badge');
        const statusText = document.getElementById('status-text');
        statusBadge.className = 'status-badge status-' + state.status;
        statusText.textContent = capitalize(state.status);

        // Update progress
        const percentage = state.percentage || 0;
        document.getElementById('percentage').textContent = percentage + '%';
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = percentage + '%';
        progressFill.className = 'progress-fill' +
          (state.status === 'completed' ? ' completed' : '') +
          (state.status === 'failed' ? ' failed' : '');

        // Update message
        document.getElementById('message').textContent = state.message || '';

        // Update steps
        const stepsList = document.getElementById('steps-list');
        if (state.steps && state.steps.length > 0) {
          stepsList.innerHTML = state.steps.map(function(step) {
            const duration = step.endTime && step.startTime
              ? formatDuration(step.endTime - step.startTime)
              : (step.status === 'running' ? '...' : '');
            return '<li class="step-item step-' + step.status + '">' +
              '<span class="step-icon"></span>' +
              '<span class="step-name">' + escapeHtml(step.name) + '</span>' +
              (duration ? '<span class="step-duration">' + duration + '</span>' : '') +
              '</li>';
          }).join('');
        }

        // Update error if present
        const errorContainer = document.getElementById('error-container');
        if (state.error) {
          errorContainer.classList.remove('hidden');
          document.getElementById('error-message').textContent = state.error;
        } else {
          errorContainer.classList.add('hidden');
        }

        // Update elapsed time
        if (startTime) {
          const elapsed = (state.endTime || Date.now()) - startTime;
          document.getElementById('elapsed-time').textContent = 'Elapsed: ' + formatDuration(elapsed);
        }

        // Stop polling if job is complete
        if (state.status === 'completed' || state.status === 'failed') {
          stopPolling();
        }
      }

      /**
       * Escapes HTML to prevent XXSS
       */
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      /**
       * Fetches state from server and updates UI
       */
      function fetchState() {
        google.script.run
          .withSuccessHandler(updateUI)
          .withFailureHandler(function(error) {
            console.error('Failed to fetch state:', error);
          })
          .getMonitorState(JOB_ID);
      }

      /**
       * Starts polling for state updates
       */
      function startPolling() {
        if (pollingTimer) return;
        fetchState(); // Immediate first fetch
        pollingTimer = setInterval(fetchState, POLLING_INTERVAL);
      }

      /**
       * Stops polling
       */
      function stopPolling() {
        if (pollingTimer) {
          clearInterval(pollingTimer);
          pollingTimer = null;
        }
      }

      // Start polling when page loads
      startPolling();

      // Clean up on page unload
      window.addEventListener('beforeunload', stopPolling);
    })();
  </script>`;
  }

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
**Description:** Centralized high-fidelity mocks for GasProcessMonitorLib services.

/

/**
High-fidelity mock for ProcessMonitorService, providing jest.fn() instrumentation for job lifecycles, progress tracking, and auditing.
@class

### Raw JSDoc Context:
```javascript
/**
 * @file GasProcessMonitorLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for GasProcessMonitorLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity mock for ProcessMonitorService, providing jest.fn() instrumentation for job lifecycles, progress tracking, and auditing.
 * @class
 */
```

<br>

