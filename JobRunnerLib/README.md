# JobRunnerLib

**Version:** 2.0.0  
**Layer:** Application Orchestration (Layer 3)  
**Dependencies:** GoogleApiWrapper, GasResilienceLib

## 🏗️ File and Folder Structure

A focused architecture for managing stateful, long-running processes:

```text
JobRunnerLib/
├── src/
│   ├── JobRunnerService.js     # Main facade: starts, resumes, and cancels jobs
│   ├── JobQueue.js             # Core engine: manages the generator execution loop
│   ├── JobDefinitionRegistry.js # Registry for job types and handler functions
│   ├── CapturingLogger.js      # Utility to capture logs during job execution
│   └── __tests__/              # Unit and state-serialization tests
```

## 🧩 Programming Patterns

1.  **Recursive Trigger Pattern**: The foundational pattern for bypassing GAS execution limits. The library schedules a "future self" to continue work before the current instance times out.
2.  **Command Pattern**: Job handlers are implemented as generator functions that act as commands, encapsulating the logic to be executed and resumed.
3.  **State Pattern**: The library manages job states (PENDING, RUNNING, COMPLETED, FAILED) and ensures valid transitions between them.
4.  **Iterator / Generator Pattern**: Uses JavaScript `yield` to create natural suspension points where the engine can safely pause and save state.
5.  **Facade Pattern**: `JobRunnerService` simplifies the complex orchestration of triggers, properties, and execution into a few high-level methods.
6.  **Registry Pattern**: `JobDefinitionRegistry` decouples the execution engine from the specific business logic of different job types.

## ⏱️ Overview

**JobRunnerLib** is a specialized framework designed to overcome the strict execution time limits of Google Apps Script (6 minutes for consumer accounts, 30 minutes for Workspace).

It implements the **Recursive Trigger Pattern** but abstracts all the complexity away from the developer. Instead of writing complex state management and trigger logic manually, developers simply write **Generator Functions** (`function*`). The library handles execution, monitors the clock, automatically suspends the job before a timeout occurs, saves the state to `PropertiesService`, and schedules a trigger to resume execution in a fresh instance.

## ✨ Key Features

- **Infinite Execution**: Run jobs that take hours to complete by breaking them into small, resumable chunks.
- **Generator-Based API**: Uses JavaScript Generators (`yield`) to report progress and create natural suspension points.
- **Automatic State Persistence**: Automatically saves the job's cursor/index and custom state to `ScriptProperties`.
- **Resilience**: Integrated with `GasResilienceLib` to handle timeouts gracefully.
- **Open/Closed Principle**: Uses a `JobDefinitionRegistry` so new job types can be added without modifying the core library code.
- **Concurrency Management**: Uses atomic locking to prevent race conditions if triggers fire overlapping executions.

## 📦 Installation

```javascript
import { JobRunnerService, JobDefinitionRegistry } from '@JobRunnerLib';
import { LoggerService, UtilsService } from '@GoogleApiWrapper';
```

## 🚀 Quick Start

### 1. Define a Job Handler

A job handler is a generator function. It yields progress updates. When it yields, the library checks the time; if time is running out, it pauses here.

```javascript
/**
 * @param {Object} params - { resumeState, ...args }
 */
function* importDataHandler(params) {
  const { resumeState, sourceId } = params;

  // Resume from last saved index or start at 0
  let currentIndex = resumeState?.currentIndex || 0;
  const totalItems = 10000; // Example total

  for (let i = currentIndex; i < totalItems; i++) {
    // Perform one unit of work
    processItem(i, sourceId);

    // Yield progress every N items (or every item)
    // This is where the library checks for timeout
    if (i % 10 === 0) {
      yield {
        percentage: (i / totalItems) * 100,
        currentIndex: i + 1 // Save state for next run
      };
    }
  }

  return { success: true, processed: totalItems };
}
```

### 2. Register and Run

```javascript
// Initialize services
const logger = new LoggerService();
const utils = new UtilsService(logger);
const registry = new JobDefinitionRegistry(logger);
const runner = new JobRunnerService(logger, utils, registry);

// Define the registration callback
const registerHandlers = (queue, services) => {
  queue.registerJobHandler('IMPORT_DATA', importDataHandler);
};

// Start the job
runner.run(
  'job-import-001', // Unique Job ID
  'IMPORT_DATA', // Job Type
  { sourceId: '123' }, // Parameters
  registerHandlers // Registry Callback
);
```

## 📚 API Reference

### 1. JobRunnerService (Facade)

The main entry point for controlling jobs.

- **`run(jobName, jobType, params, registryCallback, [forceRestart])`**: Starts a new job. If `forceRestart` is true, it clears any existing state for that job name.
- **`resume(jobName, registryCallback)`**: Manually resumes a suspended job (usually called by the trigger handler).
- **`getStatus(jobName)`**: Returns `{ state: 'running'|'completed', percentage: 50 }`.
- **`cancelJob(jobName)`**: Flags a job for cancellation. It will stop at the next `yield`.

### 2. JobDefinitionRegistry

Allows decoupling of job definitions from execution logic.

- **`register(name, definition)`**: Registers metadata about a job (name, description).
- **`getDefinition(name)`**: Retrieves job metadata.

### 3. JobQueue (Internal Core)

Manages the execution loop.

- **`setMaxDuration(ms)`**: Sets the safety margin (default: 25 mins). The library stops execution this many milliseconds after start.
- **`setTriggerDelay(ms)`**: Sets how long to wait before the resume trigger fires (default: 1 min).

## 💾 Storage & Limits

Job state is stored in `PropertiesService`.

- **Limit**: 500KB total per script.
- **Per Job**: Uses ~1-2KB.
- **Constraint**: Do not pass massive objects in `parameters` or `yield` states. Store large data in Drive/Sheets and pass IDs/Keys instead.

## ⚙️ Architecture: The Resume Cycle

1.  **Start**: `run()` initializes state in `PropertiesService` and calls `JobExecutor`.
2.  **Execute**: The Generator runs. `yield` updates the in-memory progress.
3.  **Monitor**: `JobExecutor` checks `Date.now() - startTime`.
4.  **Suspend**: If `elapsed > maxDuration`, the loop breaks.
5.  **Persist**: Current `yield` value is saved to `PropertiesService` as `resumeState`.
6.  **Schedule**: A one-time trigger is created via `TriggerService` (GoogleApiWrapper).
7.  **Resume**: Trigger fires `resume()`, which reloads state and calls the generator again.
8.  **Restore**: The generator logic uses `params.resumeState` to fast-forward to the correct index.

## 🧪 Testing

Unit tests mock the `PropertiesService` and `TriggerService` to verify state transitions without actually waiting for triggers.

```bash
npm test JobRunnerLib
```
