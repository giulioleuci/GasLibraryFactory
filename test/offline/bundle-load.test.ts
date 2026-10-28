declare const global: typeof globalThis &
  Pick<typeof import('@CoreUtilsLib'), 'LoggerService' | 'UtilsService'> &
  Pick<typeof import('@GasResilienceLib'), 'ExceptionService'>;
export {};
/**
 * Bundle Load Test
 *
 * Verifies that the compiled dist/Code.js bundle loads without errors.
 * This catches parse-time issues like invalid regex syntax, syntax errors
 * from incompatible ES features, and module resolution failures in the bundle.
 *
 * IMPORTANT: These tests run against the COMPILED bundle, not source code.
 */

const {
  loadBundle
}: typeof import('./helpers/load-bundle.cjs') = require('./helpers/load-bundle.cjs');

describe('Bundle Load', () => {
  beforeAll(() => {
    loadBundle();
  });

  it('should load dist/Code.js without errors', () => {
    expect(global.__bundleLoaded).toBe(true);
    expect(global.__bundleError).toBeNull();
  });

  it('should have bundle source available for analysis', () => {
    expect(typeof global.__bundleSource).toBe('string');
    expect(global.__bundleSource!.length).toBeGreaterThan(0);
  });

  it('should populate global with library exports', () => {
    // After loading, Object.assign(global, ...) should have added exports.
    // Check a few foundational exports that must always exist.
    expect(global.LoggerService).toBeDefined();
    expect(global.UtilsService).toBeDefined();
    expect(global.ExceptionService).toBeDefined();
  });

  it('should expose initializeServices function', () => {
    expect(typeof global.initializeServices).toBe('function');
  });
});
