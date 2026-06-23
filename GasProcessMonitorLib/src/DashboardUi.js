/**
 * @file GasProcessMonitorLib/src/DashboardUi.js
 * @description UI service for generating process monitoring dashboard sidebars
 * @version 1.0.0
 */

/**
 * UI generation service for process monitoring, creating interactive Google Apps Script sidebars with real-time status polling and progress visualization.
 * @class
 */
export class DashboardUi {
  /**
   * Default polling interval in milliseconds
   * @static
   * @type {number}
   */
  static get DEFAULT_POLLING_INTERVAL() {
    return 1500;
  }

  /**
   * Default sidebar width in pixels
   * @static
   * @type {number}
   */
  static get DEFAULT_WIDTH() {
    return 300;
  }

  /**
   * Initializes the UI service with required service facades.
   * @param {Object} uiService GoogleApiWrapper UiService for sidebar management.
   * @param {Object} logger Diagnostic output interface.
   * @throws {Error} If mandatory dependencies are missing.
   */
  constructor(uiService, logger) {
    if (!uiService || typeof uiService !== 'object') {
      throw new Error('DashboardUi: uiService is required and must be an object');
    }
    if (!logger || typeof logger !== 'object') {
      throw new Error('DashboardUi: logger is required and must be an object');
    }

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
  createSidebar(jobId, title = 'Process Monitor', options = {}) {
    if (!jobId || typeof jobId !== 'string') {
      throw new Error('DashboardUi.createSidebar: jobId must be a non-empty string');
    }

    const pollingInterval = options.pollingInterval || DashboardUi.DEFAULT_POLLING_INTERVAL;
    const width = options.width || DashboardUi.DEFAULT_WIDTH;

    const html = this._generateHtml(jobId, pollingInterval);

    this._logger.debug(`[DashboardUi] Creating sidebar for job ${jobId}`);

    return this._uiService.createSidebar().setTitle(title).setContent(html).setWidth(width);
  }

  /**
   * Synthesizes the complete HTML document including styles and client-side polling logic.
   * @private
   * @param {string} jobId target process identifier.
   * @param {number} pollingInterval client refresh rate.
   * @returns {string} Standalone HTML/CSS/JS payload.
   */
  _generateHtml(jobId, pollingInterval) {
    return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  ${this._generateStyles()}
</head>
<body>
  <div id="dashboard" class="dashboard">
    <div id="status-container" class="status-container">
      <div id="status-badge" class="status-badge status-pending">
        <span id="status-icon" class="status-icon"></span>
        <span id="status-text">Loading...</span>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-header">
        <span>Progress</span>
        <span id="percentage">0%</span>
      </div>
      <div class="progress-bar">
        <div id="progress-fill" class="progress-fill" style="width: 0%"></div>
      </div>
      <div id="message" class="message"></div>
    </div>

    <div id="steps-container" class="steps-container">
      <div class="steps-header">Steps</div>
      <ul id="steps-list" class="steps-list">
        <li class="step-item step-pending">
          <span class="step-icon"></span>
          <span class="step-name">No steps recorded</span>
        </li>
      </ul>
    </div>

    <div id="error-container" class="error-container hidden">
      <div class="error-header">Error</div>
      <div id="error-message" class="error-message"></div>
    </div>

    <div id="timing-container" class="timing-container">
      <div id="elapsed-time" class="timing-item">Elapsed: --</div>
    </div>
  </div>

  ${this._generateScript(jobId, pollingInterval)}
</body>
</html>`;
  }

  /**
   * Generates the CSS component of the dashboard, implementing Material-inspired aesthetics.
   * @private
   * @returns {string} Inline style block.
   */
  _generateStyles() {
    return `
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
      font-size: 14px;
      color: #202124;
      background: #f8f9fa;
      padding: 16px;
    }

    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Status Badge */
    .status-container {
      display: flex;
      justify-content: center;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 16px;
      font-weight: 500;
      font-size: 13px;
    }

    .status-pending {
      background: #e8eaed;
      color: #5f6368;
    }

    .status-running {
      background: #e8f0fe;
      color: #1967d2;
    }

    .status-completed {
      background: #e6f4ea;
      color: #137333;
    }

    .status-failed {
      background: #fce8e6;
      color: #c5221f;
    }

    .status-icon::before {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      content: '';
    }

    .status-pending .status-icon::before {
      background: #9aa0a6;
    }

    .status-running .status-icon::before {
      background: #1a73e8;
      animation: pulse 1.5s infinite;
    }

    .status-completed .status-icon::before {
      background: #34a853;
    }

    .status-failed .status-icon::before {
      background: #ea4335;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Progress Bar */
    .progress-container {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .progress-bar {
      height: 8px;
      background: #e8eaed;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #1a73e8, #4285f4);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-fill.completed {
      background: linear-gradient(90deg, #34a853, #5cb85c);
    }

    .progress-fill.failed {
      background: linear-gradient(90deg, #ea4335, #dc3545);
    }

    .message {
      margin-top: 8px;
      color: #5f6368;
      font-size: 12px;
      min-height: 16px;
    }

    /* Steps List */
    .steps-container {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .steps-header {
      font-weight: 500;
      margin-bottom: 12px;
    }

    .steps-list {
      list-style: none;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .step-item:last-child {
      border-bottom: none;
    }

    .step-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .step-pending .step-icon::before { content: '\\25CB'; color: #9aa0a6; }
    .step-running .step-icon::before { content: '\\25CF'; color: #1a73e8; animation: pulse 1.5s infinite; }
    .step-completed .step-icon::before { content: '\\2714'; color: #34a853; }
    .step-failed .step-icon::before { content: '\\2718'; color: #ea4335; }
    .step-skipped .step-icon::before { content: '\\2212'; color: #9aa0a6; }

    .step-name {
      flex: 1;
      font-size: 13px;
    }

    .step-duration {
      font-size: 11px;
      color: #5f6368;
    }

    /* Error Container */
    .error-container {
      background: #fce8e6;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #f5c6cb;
    }

    .error-container.hidden {
      display: none;
    }

    .error-header {
      font-weight: 500;
      color: #c5221f;
      margin-bottom: 8px;
    }

    .error-message {
      color: #5f6368;
      font-size: 12px;
      word-break: break-word;
    }

    /* Timing */
    .timing-container {
      text-align: center;
      color: #5f6368;
      font-size: 12px;
    }

    .timing-item {
      padding: 4px 0;
    }
  </style>`;
  }

  /**
   * Generates the client-side JavaScript orchestrating asynchronous polling via google.script.run.
   * @private
   * @param {string} jobId target process identifier.
   * @param {number} pollingInterval local polling frequency.
   * @returns {string} Inline script block.
   */
  _generateScript(jobId, pollingInterval) {
    return `
  <script>
    (function() {
      'use strict';

      const JOB_ID = '${jobId}';
      const POLLING_INTERVAL = ${pollingInterval};

      let pollingTimer = null;
      let startTime = null;

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
  getConfigSummary() {
    return {
      defaultPollingInterval: DashboardUi.DEFAULT_POLLING_INTERVAL,
      defaultWidth: DashboardUi.DEFAULT_WIDTH
    };
  }
}
