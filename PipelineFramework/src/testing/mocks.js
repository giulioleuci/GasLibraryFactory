/**
 * @file PipelineFramework/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for PipelineFramework services.
 * @version 1.0.0
 */

/**
 * @class StepMock
 * @description Jest-based high-fidelity mock for Pipeline Step implementation.
 */
export class StepMock {
  /**
   * @constructor
   * @param {string} [name='TestStep'] - Step name.
   */
  constructor(name = 'TestStep') {
    this.name = name;
    this.getName = jest.fn(() => this.name);
    this.getDescription = jest.fn(() => `Description for ${this.name}`);
    this.execute = jest.fn((context) => ({ success: true, data: {} }));
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
  setupExecution(success, data = {}, error = null) {
    this.execute.mockReturnValue({ success, data, error });
    return this;
  }
}

/**
 * @class PipelineContextMock
 * @description Jest-based high-fidelity mock for PipelineContext.
 */
export class PipelineContextMock {
  /**
   * @constructor
   * @param {Object} [initialData={}] - Initial state for context data.
   */
  constructor(initialData = {}) {
    this._data = { ...initialData };
    this._metadata = {
      startTime: Date.now(),
      stopRequested: false,
      executionHistory: []
    };

    this.get = jest.fn((key, defaultValue = null) => 
      Object.prototype.hasOwnProperty.call(this._data, key) ? this._data[key] : defaultValue
    );
    this.set = jest.fn((key, value) => {
      this._data[key] = value;
      return this;
    });
    this.has = jest.fn((key) => Object.prototype.hasOwnProperty.call(this._data, key));
    this.getData = jest.fn(() => this._data);
    this.getAll = jest.fn(() => this._data);
    this.getSummary = jest.fn(() => ({
      success: this._metadata.executionHistory.every(r => r.status === 'success'),
      totalSteps: this._metadata.executionHistory.length,
      history: this._metadata.executionHistory
    }));
    this.getMetadata = jest.fn(() => this._metadata);
    this.setMetadata = jest.fn().mockReturnThis();
    
    this.requestStop = jest.fn((reason) => {
      this._metadata.stopRequested = true;
      this._metadata.stopReason = reason;
      return this;
    });
    this.shouldStop = jest.fn(() => this._metadata.stopRequested);
    
    this.recordStepExecution = jest.fn((stepName, status, duration) => {
      this._metadata.executionHistory.push({ stepName, status, duration, timestamp: Date.now() });
      return this;
    });
  }
}
