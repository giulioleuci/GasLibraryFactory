/**
 * Jest Configuration for Offline Bundle Tests
 *
 * Tests the compiled dist/Code.js bundle to verify:
 * - Bundle loads without syntax errors
 * - All expected exports are available on global
 * - Key classes can be instantiated (smoke tests)
 * - GAS V8 compatibility patches were applied correctly
 *
 * IMPORTANT: Run a build first (build:testoffline, build:production, or build:testing)
 * before running these tests, as they require dist/Code.js to exist.
 */

const path = require('path');

module.exports = {
  displayName: 'Offline Bundle Tests',
  testEnvironment: 'node',

  // 1. Set up GAS global mocks (Utilities, CacheService, etc.)
  // 2. Load the compiled bundle into global scope
  setupFilesAfterEnv: ['<rootDir>/test/setup.js', '<rootDir>/test/offline-setup.js'],

  testMatch: ['<rootDir>/test/offline/**/*.test.js'],

  testTimeout: 30000,

  // Transform test files (ESM -> CJS for Jest)
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Allow transforming specific ESM dependencies used in test files
  transformIgnorePatterns: ['/node_modules/(?!(es-toolkit|nanoid|date-fns|ms|@faker-js))'],

  verbose: true
};
