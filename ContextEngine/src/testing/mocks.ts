import type { Mock } from 'jest-mock';
import type { AssemblyOptions } from '../internal/contracts.js';
declare const jest: Pick<typeof import('jest-mock'), 'fn'>;

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
export class DataProviderMock<
  Parameters extends object = Record<string, unknown>,
  Result = unknown
> {
  declare name: string;
  declare getName: Mock<() => string>;
  declare provide: Mock<(providerName?: string, params?: Parameters) => Result>;
  declare _fetchData: Mock<(params?: Parameters) => Result>;
  declare _validateParameters: Mock;
  declare initialize: Mock;
  declare dispose: Mock;
  constructor(name = 'MockProvider') {
    this.name = name;
    this.getName = jest.fn(() => this.name);
    this.provide = jest.fn<(providerName?: string, params?: Parameters) => Result>(
      (providerName, params) => ({}) as Result
    );
    this._fetchData = jest.fn<(params?: Parameters) => Result>((params) => ({}) as Result);
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
  setupData(data: Result) {
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
export class InterceptorMock<Data extends object = Record<string, unknown>> {
  declare name: string;
  declare getName: Mock<() => string>;
  declare intercept: Mock<
    (name: string, data: Data, context: object, options: AssemblyOptions) => unknown
  >;
  declare shouldIntercept: Mock<() => boolean>;
  constructor(name = 'MockInterceptor') {
    this.name = name;
    this.getName = jest.fn(() => this.name);
    this.intercept = jest.fn<
      (name: string, data: Data, context: object, options: AssemblyOptions) => unknown
    >((context) => context);
    this.shouldIntercept = jest.fn(() => true);
  }

  /**
   * Fluent helper to inject custom interception implementation.
   *
   * @param {Function} interceptFn - Logic mapping PipelineContext to transformed PipelineContext.
   * @returns {InterceptorMock} Current instance for chaining.
   */
  setupIntercept(
    interceptFn: (name: string, data: Data, context: object, options: AssemblyOptions) => unknown
  ) {
    this.intercept.mockImplementation(interceptFn);
    return this;
  }
}

/**
 * In-memory registry mock for provider lifecycle and dependency resolution testing.
 *
 * @class ProviderRegistryMock
 */
export class ProviderRegistryMock<Provider = DataProviderMock> {
  declare _providers: Map<string, Provider>;
  declare register: Mock<(name: string, provider: Provider) => this>;
  declare get: Mock<(name: string) => Provider | null>;
  declare has: Mock<(name: string) => boolean>;
  declare getRegisteredTypes: Mock<() => string[]>;
  constructor() {
    this._providers = new Map();
    this.register = jest.fn<(name: string, provider: Provider) => this>((name, provider) => {
      this._providers.set(name, provider);
      return this;
    });
    this.get = jest.fn((name: string) => this._providers.get(name) || null);
    this.has = jest.fn((name: string) => this._providers.has(name));
    this.getRegisteredTypes = jest.fn(() => Array.from(this._providers.keys()));
  }
}
