# GasProcessMonitorLib

Process monitoring and visualization layer for Google Apps Script applications.

**Layer:** Presentation & Monitoring (Layer 4)  
**Dependencies:** SheetDBLib, GoogleApiWrapper, CoreUtilsLib

## 🏗️ File and Folder Structure

A lean architecture focused on state tracking and UI rendering:

```text
GasProcessMonitorLib/
├── src/
│   ├── ProcessMonitorService.js # Core service for state tracking and persistence
│   ├── DashboardUi.js           # UI logic for generating the monitoring sidebar
│   └── __tests__/               # Unit and integration (loose-coupling) tests
```

## 🧩 Programming Patterns

1.  **Observer Pattern (Conceptual)**: The monitor acts as a passive observer of jobs and pipelines, recording their progress and state transitions as they occur.
2.  **Model-View-Controller (MVC)**: `ProcessMonitorService` acts as the Model (managing the state data), while `DashboardUi` serves as the View (the HTML sidebar) and Controller (the polling logic that updates the view).
3.  **Tiered Storage Strategy**: Optimizes performance and quotas by using a high-speed cache for frequent progress updates and durable storage (`PropertiesService` or `SheetDBLib`) for final job outcomes.
4.  **Optional Integration (Loose Coupling)**: This library is designed to be injected into other frameworks (Pipeline, JobRunner) optionally. It uses optional chaining or simple existence checks to avoid hard-coding dependencies in the core engines.
5.  **Service Pattern**: `ProcessMonitorService` encapsulates all technical details of state persistence, providing a clean, domain-level API for other libraries to use.

## Overview

GasProcessMonitorLib provides real-time process monitoring and visualization capabilities as an **optional add-on layer**. It integrates with PipelineFramework, JobRunnerLib, and GasDataImporter without introducing hard dependencies.

## Features

- **Process State Management**: Track job lifecycle (pending, running, completed, failed)
- **Step Tracking**: Monitor individual steps within jobs
- **Progress Updates**: Real-time percentage and message updates
- **Auto-Refresh Dashboard**: HTML sidebar with polling-based updates
- **Quota Optimized**: Cache-first strategy minimizes Properties writes
- **Optional Integration**: Works alongside core libraries via optional chaining

## Installation

Import from the library:

```javascript
import { ProcessMonitorService, DashboardUi } from '@GasProcessMonitorLib';
```

## Dependencies

- **CoreUtilsLib**: LoggerService
- **GoogleApiWrapper**: CacheService, PropertiesService, UiService

## Quick Start

### 1. Initialize Services

```javascript
import { ProcessMonitorService, DashboardUi } from '@GasProcessMonitorLib';
import { LoggerService } from '@CoreUtilsLib';
import { CacheService, PropertiesService, UiService, ServiceFactory } from '@GoogleApiWrapper';

// Using ServiceFactory
const logger = new LoggerService();
const cacheService = new CacheService(logger);
const propertiesService = new PropertiesService(logger);
const uiService = ServiceFactory.getUiService();

// Create monitor and dashboard
const monitor = new ProcessMonitorService(logger, cacheService, propertiesService);
const dashboardUi = new DashboardUi(uiService, logger);
```

### 2. Track a Job

```javascript
function runImportWithMonitor() {
  const jobId = 'import-' + Date.now();

  // Register and start
  monitor.registerJob(jobId);
  monitor.startJob(jobId);

  // Show dashboard
  dashboardUi.createSidebar(jobId, 'Import Progress').show();

  try {
    // Update progress
    monitor.updateProgress(jobId, 25, 'Extracting data...');
    monitor.logStepStart(jobId, 'Extract');
    // ... extraction logic
    monitor.logStepComplete(jobId, 'Extract', true);

    monitor.updateProgress(jobId, 50, 'Transforming data...');
    monitor.logStepStart(jobId, 'Transform');
    // ... transformation logic
    monitor.logStepComplete(jobId, 'Transform', true);

    monitor.updateProgress(jobId, 75, 'Loading data...');
    monitor.logStepStart(jobId, 'Load');
    // ... load logic
    monitor.logStepComplete(jobId, 'Load', true);

    // Complete
    monitor.completeJob(jobId, 'Successfully imported 1000 records');
  } catch (error) {
    monitor.setError(jobId, error);
    throw error;
  }
}
```

### 3. Global Function for Dashboard

**Important**: Expose this global function for the dashboard polling to work:

```javascript
// In your main script (global scope)
function getMonitorState(jobId) {
  return monitor.getJobState(jobId);
}
```

## API Reference

### ProcessMonitorService

Main service for managing process state.

#### Constructor

```javascript
new ProcessMonitorService(logger, cacheService, propertiesService);
```

#### Job Lifecycle Methods

| Method                         | Description                        |
| ------------------------------ | ---------------------------------- |
| `registerJob(jobId)`           | Initialize job with PENDING status |
| `startJob(jobId)`              | Transition to RUNNING status       |
| `completeJob(jobId, message?)` | Mark as COMPLETED                  |
| `setError(jobId, error)`       | Mark as FAILED with error          |

#### Progress Methods

| Method                                        | Description             |
| --------------------------------------------- | ----------------------- |
| `updateProgress(jobId, percentage, message?)` | Update progress (0-100) |

#### Step Tracking Methods

| Method                                      | Description                   |
| ------------------------------------------- | ----------------------------- |
| `logStepStart(jobId, stepName)`             | Mark step as RUNNING          |
| `logStepComplete(jobId, stepName, success)` | Mark step as COMPLETED/FAILED |
| `logStepSkipped(jobId, stepName)`           | Mark step as SKIPPED          |

#### State Retrieval Methods

| Method               | Description           |
| -------------------- | --------------------- |
| `getJobState(jobId)` | Get full state object |
| `hasJob(jobId)`      | Check if job exists   |
| `clearJob(jobId)`    | Remove job state      |

### DashboardUi

Service for generating monitoring sidebars.

#### Constructor

```javascript
new DashboardUi(uiService, logger);
```

#### Methods

| Method                                   | Description            |
| ---------------------------------------- | ---------------------- |
| `createSidebar(jobId, title?, options?)` | Create sidebar builder |

#### Options

```javascript
{
  pollingInterval: 1500,  // ms between polls
  width: 300              // sidebar width in px
}
```

## State Structure

The `getJobState()` method returns:

```javascript
{
  jobId: 'import-123',
  status: 'running',        // pending | running | completed | failed
  percentage: 50,
  message: 'Processing...',
  startTime: 1705320000000,
  endTime: null,
  error: null,
  steps: [
    {
      name: 'Extract',
      status: 'completed',  // pending | running | completed | failed | skipped
      startTime: 1705320000000,
      endTime: 1705320010000
    },
    {
      name: 'Transform',
      status: 'running',
      startTime: 1705320010000,
      endTime: null
    }
  ]
}
```

## Integration with Other Libraries

### PipelineFramework Integration

```javascript
import { Pipeline } from '@PipelineFramework';

// Pass monitor in constructor options
const pipeline = new Pipeline(logger, exceptionService, {
  name: 'MyPipeline',
  monitor: processMonitor, // Optional
  jobId: 'pipeline-job-001'
});

// Pipeline automatically calls:
// - monitor?.logStepStart(jobId, stepName)
// - monitor?.logStepComplete(jobId, stepName, success)
```

### JobRunnerLib Integration

```javascript
import { JobQueue } from '@JobRunnerLib';

// Pass monitor in services object
const result = jobQueue.execute('my-job', 'myHandler', {
  services: {
    monitor: processMonitor // Optional
  }
});

// Generator can yield progress:
function* myHandler(params) {
  yield { percentage: 50, message: 'Halfway done' };
  // Monitor automatically updated if provided
}
```

### GasDataImporter Integration

```javascript
import { ImportEngine } from '@GasDataImporter';

// Pass monitor in constructor
const engine = new ImportEngine(
  logger,
  driveService,
  spreadsheetService,
  databaseService,
  expressionEngine,
  exceptionService,
  processMonitor // Optional - new parameter
);

// ImportEngine automatically:
// - Registers job at start
// - Updates progress for each phase
// - Logs step start/complete for Extract, Transform, Load
```

## Storage Strategy

GasProcessMonitorLib uses a tiered storage strategy optimized for GAS quotas:

| Event Type          | Cache | Properties |
| ------------------- | ----- | ---------- |
| Progress update     | ✓     | -          |
| Step start/complete | ✓     | -          |
| Job register        | ✓     | ✓          |
| Job complete        | ✓     | ✓          |
| Job error           | ✓     | ✓          |

**Cache**: Fast reads/writes, 6-hour TTL, may be evicted
**Properties**: Durable storage, quota-limited

## Dashboard Styling

The dashboard uses Google Material-like styling with:

- Status badges (color-coded by state)
- Animated progress bar
- Step list with status icons
- Error display section
- Elapsed time tracking

## Version

1.0.0

## License

MIT
