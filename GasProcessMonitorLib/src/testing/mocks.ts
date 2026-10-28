import type { Mock } from 'jest-mock';
declare const jest: Pick<typeof import('jest-mock'), 'fn'>;
type FluentMock<T> = Mock<(...args: unknown[]) => T>;

/**
 * @file GasProcessMonitorLib/src/testing/mocks.ts
 * @description Centralized high-fidelity mocks for GasProcessMonitorLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity mock for ProcessMonitorService, providing jest.fn() instrumentation for job lifecycles, progress tracking, and auditing.
 * @class
 */
export class ProcessMonitorServiceMock {
  declare registerJob: FluentMock<this>;
  declare logStepStart: FluentMock<this>;
  declare logStepComplete: FluentMock<this>;
  declare logStepSkipped: FluentMock<this>;
  declare updateProgress: FluentMock<this>;
  declare completeJob: FluentMock<this>;

  constructor() {
    this.registerJob = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logStepStart = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logStepComplete = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.logStepSkipped = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.updateProgress = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
    this.completeJob = jest.fn<(...args: unknown[]) => this>().mockReturnThis();
  }
}
