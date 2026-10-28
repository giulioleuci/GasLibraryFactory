// ===================================================================
// FILE: jest.integration.config.cjs
// ===================================================================
// Jest configuration for GasLibraryFactory integration tests
// Runs tests that validate cross-layer interactions with mocked infrastructure
// ===================================================================

const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,

  // Display name for this project
  displayName: 'Integration Tests',

  // Only run integration tests
  testMatch: ['**/__tests__/integration/**/*.test.ts', '**/__tests__/integration/**/*.spec.ts'],

  // Longer timeout for integration tests (60 seconds)
  testTimeout: 60000,

  // Setup file specific to integration tests
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts', '<rootDir>/test/integration-setup.ts'],

  // Run tests serially for integration tests to avoid resource conflicts
  maxWorkers: 1
};
