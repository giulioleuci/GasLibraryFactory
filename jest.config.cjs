// ===================================================================
// FILE: jest.config.js
// ===================================================================
// Jest configuration for GasLibraryFactory monorepo testing
// Maps Webpack aliases to Jest moduleNameMapper for imports to work
// ===================================================================

module.exports = {
  // Use jsdom environment for DOM-like testing (can switch to 'node' if needed)
  testEnvironment: 'node',

  // Setup files to run after the test framework is installed
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Transform files with babel-jest
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Transform ES modules in node_modules (es-toolkit, nanoid, date-fns, ms, @faker-js/faker)
  transformIgnorePatterns: ['node_modules/(?!(es-toolkit|nanoid|date-fns|ms|@faker-js)/)'],

  // Module name mapper - maps Webpack aliases to actual paths
  // This allows imports like "import { X } from '@GasResilienceLib'" to work in tests
  moduleNameMapper: {
    '^@CoreUtilsLib$': '<rootDir>/CoreUtilsLib/index.js',
    '^@CoreUtilsLib/(.*)$': '<rootDir>/CoreUtilsLib/$1',

    '^@GasResilienceLib$': '<rootDir>/GasResilienceLib/index.js',
    '^@GasResilienceLib/(.*)$': '<rootDir>/GasResilienceLib/$1',

    '^@GoogleApiWrapper$': '<rootDir>/GoogleApiWrapper/index.js',
    '^@GoogleApiWrapper/(.*)$': '<rootDir>/GoogleApiWrapper/$1',

    '^@WorkspaceTemplateEngine$': '<rootDir>/WorkspaceTemplateEngine/index.js',
    '^@WorkspaceTemplateEngine/(.*)$': '<rootDir>/WorkspaceTemplateEngine/$1',

    '^@GasExpressionEngineLib$': '<rootDir>/GasExpressionEngineLib/index.js',
    '^@GasExpressionEngineLib/(.*)$': '<rootDir>/GasExpressionEngineLib/$1',

    '^@SheetDBLib$': '<rootDir>/SheetDBLib/index.js',
    '^@SheetDBLib/(.*)$': '<rootDir>/SheetDBLib/$1',

    '^@JobRunnerLib$': '<rootDir>/JobRunnerLib/index.js',
    '^@JobRunnerLib/(.*)$': '<rootDir>/JobRunnerLib/$1',

    '^@PipelineFramework$': '<rootDir>/PipelineFramework/index.js',
    '^@PipelineFramework/(.*)$': '<rootDir>/PipelineFramework/$1',

    '^@ContextEngine$': '<rootDir>/ContextEngine/index.js',
    '^@ContextEngine/(.*)$': '<rootDir>/ContextEngine/$1',

    '^@GasDataImporter$': '<rootDir>/GasDataImporter/index.js',
    '^@GasDataImporter/(.*)$': '<rootDir>/GasDataImporter/$1',

    '^@DomainRepositoryLib$': '<rootDir>/DomainRepositoryLib/index.js',
    '^@DomainRepositoryLib/(.*)$': '<rootDir>/DomainRepositoryLib/$1',

    '^@RoleResolutionLib$': '<rootDir>/RoleResolutionLib/index.js',
    '^@RoleResolutionLib/(.*)$': '<rootDir>/RoleResolutionLib/$1',

    '^@ComposableContentLib$': '<rootDir>/ComposableContentLib/index.js',
    '^@ComposableContentLib/(.*)$': '<rootDir>/ComposableContentLib/$1',

    '^@GasProcessMonitorLib$': '<rootDir>/GasProcessMonitorLib/index.js',
    '^@GasProcessMonitorLib/(.*)$': '<rootDir>/GasProcessMonitorLib/$1',

    '^@GasSchemaValidatorLib$': '<rootDir>/GasSchemaValidatorLib/index.js',
    '^@GasSchemaValidatorLib/(.*)$': '<rootDir>/GasSchemaValidatorLib/$1'
  },

  // Test match patterns - where to find test files
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],

  // Coverage configuration
  collectCoverage: false, // Set to true to collect coverage by default
  collectCoverageFrom: [
    // Include all source files
    'CoreUtilsLib/src/**/*.js',
    'GasResilienceLib/src/**/*.js',
    'GoogleApiWrapper/src/**/*.js',
    'WorkspaceTemplateEngine/src/**/*.js',
    'GasExpressionEngineLib/src/**/*.js',
    'SheetDBLib/src/**/*.js',
    'JobRunnerLib/src/**/*.js',
    'PipelineFramework/src/**/*.js',
    'ContextEngine/src/**/*.js',
    'GasDataImporter/src/**/*.js',
    'DomainRepositoryLib/src/**/*.js',
    'RoleResolutionLib/src/**/*.js',
    'ComposableContentLib/src/**/*.js',
    'CoreUtilsLib/index.js',
    'GasResilienceLib/index.js',
    'GoogleApiWrapper/index.js',
    'WorkspaceTemplateEngine/index.js',
    'GasExpressionEngineLib/index.js',
    'SheetDBLib/index.js',
    'JobRunnerLib/index.js',
    'PipelineFramework/index.js',
    'ContextEngine/index.js',
    'GasDataImporter/index.js',
    'DomainRepositoryLib/index.js',
    'RoleResolutionLib/index.js',
    'ComposableContentLib/index.js',

    // Exclude test files
    '!**/__tests__/**',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],

  // Coverage thresholds (optional - uncomment to enforce)
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80
  //   }
  // },

  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.gs$' // Ignore .gs test files (these are for GAS environment only)
  ],

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: false,

  // Max workers for parallel test execution
  maxWorkers: '50%',

  // Timeout for tests (30 seconds)
  testTimeout: 30000
};
