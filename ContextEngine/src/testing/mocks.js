/**
 * @file ContextEngine/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for ContextEngine services.
 * @version 1.0.0
 */

/**
 * High-fidelity mock for DataProvider implementation in unit tests.
 * Simulates provider lifecycle, data retrieval, and parameter validation.
 * 
 * @class DataProviderMock
 */
export class DataProviderMock {
  constructor(name = 'MockProvider') {
    this.name = name;
    this.getName = jest.fn(() => this.name);
    this.provide = jest.fn((providerName, params) => ({}));
    this._fetchData = jest.fn((params) => ({}));
    this._validateParameters = jest.fn();
    this.initialize = jest.fn().mockReturnThis();
    this.dispose = jest.fn().mockReturnThis();
  }

  /**
   * Fluent helper to configure static mock data return values.
   * 
   * @param {*} data - Payload to return from provide and _fetchData.
   * @returns {DataProviderMock} Current instance for chaining.
   */
  setupData(data) {
    this.provide.mockReturnValue(data);
    this._fetchData.mockReturnValue(data);
    return this;
  }
}

/**
 * High-fidelity mock for ContextInterceptor implementation.
 * Simulates context transformation and conditional filtering logic.
 * 
 * @class InterceptorMock
 */
export class InterceptorMock {
  constructor(name = 'MockInterceptor') {
    this.name = name;
    this.getName = jest.fn(() => this.name);
    this.intercept = jest.fn((context) => context);
    this.shouldIntercept = jest.fn(() => true);
  }

  /**
   * Fluent helper to inject custom interception implementation.
   * 
   * @param {Function} interceptFn - Logic mapping PipelineContext to transformed PipelineContext.
   * @returns {InterceptorMock} Current instance for chaining.
   */
  setupIntercept(interceptFn) {
    this.intercept.mockImplementation(interceptFn);
    return this;
  }
}

/**
 * In-memory registry mock for provider lifecycle and dependency resolution testing.
 * 
 * @class ProviderRegistryMock
 */
export class ProviderRegistryMock {
  constructor() {
    this._providers = new Map();
    this.register = jest.fn((name, provider) => {
      this._providers.set(name, provider);
      return this;
    });
    this.get = jest.fn((name) => this._providers.get(name) || null);
    this.has = jest.fn((name) => this._providers.has(name));
    this.getRegisteredTypes = jest.fn(() => Array.from(this._providers.keys()));
  }
}
