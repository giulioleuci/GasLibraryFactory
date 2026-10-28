import type { Mock } from 'jest-mock';
import type { StepResult } from '../internal/contracts.js';
declare const jest: Pick<typeof import('jest-mock'), 'fn'>;

type MockHistory = { stepName: string; status: string; duration: number; timestamp: number };
type MockMetadata = {
  startTime: number;
  stopRequested: boolean;
  stopReason?: unknown;
  executionHistory: MockHistory[];
};

/**
 * @file PipelineFramework/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for PipelineFramework services.
 * @version 1.0.0
 */

/**
 * @class StepMock
 * @description Jest-based high-fidelity mock for Pipeline Step implementation.
 */
export class StepMock<Context extends object = object> {
  declare name: string;
  declare getName: Mock<() => string>;
  declare getDescription: Mock<() => string>;
  declare execute: Mock<(context: Context) => StepResult>;
  declare shouldExecute: Mock<() => boolean>;
  declare beforeStep: Mock;
  declare afterStep: Mock;
  declare onError: Mock;
  /**
   * @constructor
   * @param {string} [name='TestStep'] - Step name.
   */
  constructor(name = 'TestStep') {
    this.name = name;
    this.getName = jest.fn(() => this.name);
    this.getDescription = jest.fn(() => `Description for ${this.name}`);
    this.execute = jest.fn<(context: Context) => StepResult>((context) => ({
      success: true,
      data: {}
    }));
    this.shouldExecute = jest.fn(() => true);
    this.beforeStep = jest.fn();
    this.afterStep = jest.fn();
    this.onError = jest.fn();
  }

  /**
   * @function setupExecution
   * @description Configures the 'execute' jest.fn return value.
   * @param {boolean} success - Target success status.
   * @param {*} [data={}] - Result data payload.
   * @param {Error} [error] - Error object (if success is false).
   * @returns {StepMock} Fluent interface.
   */
  setupExecution(success: boolean, data: unknown = {}, error: Error | null = null) {
    this.execute.mockReturnValue({ success, data, error });
    return this;
  }
}

/**
 * @class PipelineContextMock
 * @description Jest-based high-fidelity mock for PipelineContext.
 */
export class PipelineContextMock {
  declare _data: Record<string, unknown>;
  declare _metadata: MockMetadata;
  declare get: Mock<(key: string, defaultValue?: unknown) => unknown>;
  declare set: Mock<(key: string, value: unknown) => this>;
  declare has: Mock<(key: string) => boolean>;
  declare getData: Mock<() => Record<string, unknown>>;
  declare getAll: Mock<() => Record<string, unknown>>;
  declare getSummary: Mock<() => { success: boolean; totalSteps: number; history: MockHistory[] }>;
  declare getMetadata: Mock<() => MockMetadata>;
  declare setMetadata: Mock;
  declare requestStop: Mock<(reason?: unknown) => this>;
  declare shouldStop: Mock<() => boolean>;
  declare recordStepExecution: Mock<(stepName: string, status: string, duration: number) => this>;
  /**
   * @constructor
   * @param {Object} [initialData={}] - Initial state for context data.
   */
  constructor(initialData: Record<string, unknown> = {}) {
    this._data = { ...initialData };
    this._metadata = {
      startTime: Date.now(),
      stopRequested: false,
      executionHistory: []
    };

    this.get = jest.fn<(key: string, defaultValue?: unknown) => unknown>(
      (key, defaultValue = null) =>
        Object.prototype.hasOwnProperty.call(this._data, key) ? this._data[key] : defaultValue
    );
    this.set = jest.fn<(key: string, value: unknown) => this>((key, value) => {
      this._data[key] = value;
      return this;
    });
    this.has = jest.fn((key: string) => Object.prototype.hasOwnProperty.call(this._data, key));
    this.getData = jest.fn(() => this._data);
    this.getAll = jest.fn(() => this._data);
    this.getSummary = jest.fn(() => ({
      success: this._metadata.executionHistory.every((r) => r.status === 'success'),
      totalSteps: this._metadata.executionHistory.length,
      history: this._metadata.executionHistory
    }));
    this.getMetadata = jest.fn(() => this._metadata);
    this.setMetadata = jest.fn().mockReturnThis();

    this.requestStop = jest.fn<(reason?: unknown) => this>((reason) => {
      this._metadata.stopRequested = true;
      this._metadata.stopReason = reason;
      return this;
    });
    this.shouldStop = jest.fn(() => this._metadata.stopRequested);

    this.recordStepExecution = jest.fn<
      (stepName: string, status: string, duration: number) => this
    >((stepName, status, duration) => {
      this._metadata.executionHistory.push({ stepName, status, duration, timestamp: Date.now() });
      return this;
    });
  }
}
