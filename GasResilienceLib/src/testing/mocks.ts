/**
 * @file GasResilienceLib/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for GasResilienceLib services.
 * @version 1.0.0
 */

import type { fn as jestFn, Mock, MockInstance } from 'jest-mock';

declare const jest: { fn: typeof jestFn };

type RetryMock = MockInstance<
  (fn: () => unknown, parameters?: unknown, maxAttempts?: number) => unknown
> & {
  <T>(fn: () => T, parameters?: unknown, maxAttempts?: number): T;
};
type BypassMock = MockInstance<
  (fn: () => unknown, context?: unknown, fallback?: unknown) => unknown
> & {
  <T, F = undefined>(fn: () => T, context?: unknown, fallback?: F): T | F;
};
interface AdvancedMockResult<T> {
  success: boolean;
  result: T;
  attempts: number;
  errors: unknown[];
  durationMs: number;
  operationId: string;
}
type AdvancedMock = MockInstance<
  (fn: () => unknown, parameters?: unknown, options?: unknown) => AdvancedMockResult<unknown>
> & {
  <T>(fn: () => T, parameters?: unknown, options?: unknown): AdvancedMockResult<T>;
};

/**
 * High-fidelity mock for ExceptionService, providing jest.fn() instrumentation for resilience operations and configurable retry simulations.
 * @class
 */
export class ExceptionServiceMock {
  declare executeWithRetry: RetryMock;
  declare executeWithBypass: BypassMock;
  declare executeWithAdvancedHandling: AdvancedMock;
  declare classify: Mock<
    (error: { message?: unknown }) => { category: string; recoverable: boolean; message: unknown }
  >;
  declare report: Mock<(...args: unknown[]) => void>;
  declare getErrorSummary: Mock<
    () => {
      totalOperations: number;
      successfulOperations: number;
      failedOperations: number;
      recoveryRate: number;
    }
  >;
  constructor() {
    /**
     * Executes the provided function immediately (Happy Path).
     * @type {jest.Mock}
     */
    this.executeWithRetry = jest
      .fn<(fn: () => unknown) => unknown>()
      .mockImplementation((fn) => fn()) as RetryMock;

    /**
     * Executes the provided function, returning fallback on failure.
     * @type {jest.Mock}
     */
    this.executeWithBypass = jest
      .fn<(fn: () => unknown, context?: unknown, fallback?: unknown) => unknown>()
      .mockImplementation((fn, context, fallback) => {
        try {
          return fn();
        } catch (e) {
          return fallback;
        }
      }) as BypassMock;

    /**
     * Executes the provided function and returns a detailed result object.
     * @type {jest.Mock}
     */
    this.executeWithAdvancedHandling = jest
      .fn<(fn: () => unknown) => AdvancedMockResult<unknown>>()
      .mockImplementation((fn) => ({
        success: true,
        result: fn(),
        attempts: 1,
        errors: [],
        durationMs: 10,
        operationId: 'mock-op-123'
      })) as AdvancedMock;

    /**
     * Mock for error classification.
     * @type {jest.Mock}
     */
    this.classify = jest.fn((error: { message?: unknown }) => ({
      category: 'GENERIC',
      recoverable: true,
      message: error.message || 'Mock Error'
    }));

    /**
     * Mock for error reporting.
     * @type {jest.Mock}
     */
    this.report = jest.fn<(...args: unknown[]) => void>();

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
  setupRetrySuccess(failAttempts: number, error = new Error('Transient Failure')) {
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
