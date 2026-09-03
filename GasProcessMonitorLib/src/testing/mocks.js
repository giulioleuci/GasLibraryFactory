/**
 * @file GasProcessMonitorLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for GasProcessMonitorLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity mock for ProcessMonitorService, providing jest.fn() instrumentation for job lifecycles, progress tracking, and auditing.
 * @class
 */
export class ProcessMonitorServiceMock {
  constructor() {
    this.registerJob = jest.fn().mockReturnThis();
    this.logStepStart = jest.fn().mockReturnThis();
    this.logStepComplete = jest.fn().mockReturnThis();
    this.logStepSkipped = jest.fn().mockReturnThis();
    this.updateProgress = jest.fn().mockReturnThis();
    this.completeJob = jest.fn().mockReturnThis();
  }
}
