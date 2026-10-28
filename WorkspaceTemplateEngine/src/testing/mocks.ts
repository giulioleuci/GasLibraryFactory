/// <reference types="jest" />
import type { TemplateLogger } from '../types.js';
type MockFilter = (value: unknown, ...args: unknown[]) => unknown;
/**
 * @file WorkspaceTemplateEngine/src/testing/mocks.js
 * @description Centralized high-fidelity mocks for WorkspaceTemplateEngine services.
 * @version 1.0.0
 */

/**
 * @description High-fidelity mock for the Mustache engine.
 * Simulates core rendering logic, variable substitution, and basic filter execution for unit testing.
 * @class
 */
export class MustacheMock {
  declare _logger: TemplateLogger | null;
  declare _filters: Map<string, MockFilter>;
  declare registerFilter: jest.Mock<void, [name: string, fn: MockFilter]>;
  declare render: jest.Mock<
    string,
    [template: string, data?: object | null, partials?: Record<string, unknown>]
  >;

  constructor(options: { logger?: TemplateLogger } = {}) {
    this._logger = options.logger || null;
    this._filters = new Map();

    // Bind and mock the registerFilter method first!
    this.registerFilter = jest.fn((name: string, fn: MockFilter) => {
      this._filters.set(name, fn);
    });

    // Now it is safe to call
    this.registerFilter('uppercase', (value) => String(value).toUpperCase());
    this.registerFilter('lowercase', (value) => String(value).toLowerCase());
    this.registerFilter('capitalize', (value) => {
      const str = String(value);
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    this.render = jest.fn(
      (template: string, data: object | null = {}, partials: Record<string, unknown> = {}) => {
        if (typeof template !== 'string') {
          return '';
        }

        let result = template;

        // Simple variable substitution: {{variable}}
        result = result.replace(/\{\{([^}|]+)\}\}/g, (match, key) => {
          const trimmedKey = key.trim();
          const value = this._getValue(data, trimmedKey);
          return value !== undefined && value !== null ? String(value) : '';
        });

        // Variable with filter: {{variable | filter}}
        result = result.replace(/\{\{([^}|]+)\|([^}]+)\}\}/g, (match, key, filterName) => {
          const trimmedKey = key.trim();
          const trimmedFilter = filterName.trim();
          let value = this._getValue(data, trimmedKey);

          if (this._filters.has(trimmedFilter)) {
            try {
              value = this._filters.get(trimmedFilter)!(value);
            } catch (error) {
              // Log if logger available
            }
          }

          return value !== undefined && value !== null ? String(value) : '';
        });

        return result;
      }
    );
  }

  /**
   * @description Utility for dot-notation property resolution within mock data.
   * @param {Object} obj Source object.
   * @param {string} path Property path.
   * @returns {*} Resolved value or undefined.
   * @private
   */
  _getValue(obj: unknown, path: string): unknown {
    if (path === '.') {
      return obj;
    }
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    const keys = path.split('.');
    let value: unknown = obj;

    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = (value as Record<string, unknown>)[key];
    }

    return value;
  }
}
