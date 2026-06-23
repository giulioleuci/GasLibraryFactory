/**
 * @file GasResilienceLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for GasResilienceLib services.
 * @version 1.0.0
 */

/**
 * High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.
 * @class
 */
export class ExceptionServiceMock {
  constructor() {
    /**
     * Executes the provided function immediately (Happy Path).
     * @type {jest.Mock}
     */
    this.executeWithRetry = jest.fn().mockImplementation((fn) => fn());

    /**
     * Executes the provided function, returning fallback on failure.
     * @type {jest.Mock}
     */
    this.executeWithBypass = jest.fn().mockImplementation((fn, context, fallback) => {
      try {
        return fn();
      } catch (e) {
        return fallback;
      }
    });

    /**
     * Executes the provided function and returns a detailed result object.
     * @type {jest.Mock}
     */
    this.executeWithAdvancedHandling = jest.fn().mockImplementation((fn) => ({
      success: true,
      result: fn(),
      attempts: 1,
      errors: [],
      durationMs: 10,
      operationId: 'mock-op-123'
    }));

    /**
     * Mock for error classification.
     * @type {jest.Mock}
     */
    this.classify = jest.fn((error) => ({
      category: 'GENERIC',
      recoverable: true,
      message: error.message || 'Mock Error'
    }));

    /**
     * Mock for error reporting.
     * @type {jest.Mock}
     */
    this.report = jest.fn();

    /**
     * Mock for retrieving error statistics.
     * @type {jest.Mock}
     */
    this.getErrorSummary = jest.fn(() => ({
      totalOperations: 1,
      successfulOperations: 1,
      failedOperations: 0,
      recoveryRate: 1.0
    }));
  }

  /**
   * Configures the mock to simulate transient failures for a specified number of attempts before successful execution.
   * @param {number} failAttempts Count of sequential failures to simulate.
   * @param {Error} [error] logic exception to throw during failure phase.
   * @returns {this} Scoped mock instance.
   */
  setupRetrySuccess(failAttempts, error = new Error('Transient Failure')) {
    let calls = 0;
    this.executeWithRetry.mockImplementation((fn) => {
      calls++;
      if (calls <= failAttempts) {
        throw error;
      }
      return fn();
    });
    return this;
  }
}
