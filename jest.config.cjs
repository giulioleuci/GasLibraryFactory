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
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // Transform files with babel-jest
  transform: {
    '^.+\\.[cm]?[jt]s$': 'babel-jest'
  },

  // Transform ES modules in node_modules (es-toolkit, nanoid, date-fns, ms, @faker-js/faker)
  transformIgnorePatterns: ['node_modules/(?!(es-toolkit|nanoid|date-fns|ms|@faker-js)/)'],

  // Module name mapper - maps Webpack aliases to actual paths
  // This allows imports like "import { X } from '@GasResilienceLib'" to work in tests
  moduleNameMapper: {
    '^(\\.{1,2}/.*load-bundle)\\.cjs$': '$1.cts',
    '^@GasOnlineTestFramework$': '<rootDir>/GasOnlineTestFramework/index',
    '^@GasOnlineTestFramework/(.*?)(?:\\.js)?$': '<rootDir>/GasOnlineTestFramework/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@CoreUtilsLib$': '<rootDir>/CoreUtilsLib/index',
    '^@CoreUtilsLib/(.*?)(?:\\.js)?$': '<rootDir>/CoreUtilsLib/$1',

    '^@GasResilienceLib$': '<rootDir>/GasResilienceLib/index',
    '^@GasResilienceLib/(.*?)(?:\\.js)?$': '<rootDir>/GasResilienceLib/$1',

    '^@GoogleApiWrapper$': '<rootDir>/GoogleApiWrapper/index',
    '^@GoogleApiWrapper/(.*?)(?:\\.js)?$': '<rootDir>/GoogleApiWrapper/$1',

    '^@WorkspaceTemplateEngine$': '<rootDir>/WorkspaceTemplateEngine/index',
    '^@WorkspaceTemplateEngine/(.*?)(?:\\.js)?$': '<rootDir>/WorkspaceTemplateEngine/$1',

    '^@GasExpressionEngineLib$': '<rootDir>/GasExpressionEngineLib/index',
    '^@GasExpressionEngineLib/(.*?)(?:\\.js)?$': '<rootDir>/GasExpressionEngineLib/$1',

    '^@SheetDBLib$': '<rootDir>/SheetDBLib/index',
    '^@SheetDBLib/(.*?)(?:\\.js)?$': '<rootDir>/SheetDBLib/$1',

    '^@JobRunnerLib$': '<rootDir>/JobRunnerLib/index',
    '^@JobRunnerLib/(.*?)(?:\\.js)?$': '<rootDir>/JobRunnerLib/$1',

    '^@PipelineFramework$': '<rootDir>/PipelineFramework/index',
    '^@PipelineFramework/(.*?)(?:\\.js)?$': '<rootDir>/PipelineFramework/$1',

    '^@ContextEngine$': '<rootDir>/ContextEngine/index',
    '^@ContextEngine/(.*?)(?:\\.js)?$': '<rootDir>/ContextEngine/$1',

    '^@GasDataImporter$': '<rootDir>/GasDataImporter/index',
    '^@GasDataImporter/(.*?)(?:\\.js)?$': '<rootDir>/GasDataImporter/$1',

    '^@DomainRepositoryLib$': '<rootDir>/DomainRepositoryLib/index',
    '^@DomainRepositoryLib/(.*?)(?:\\.js)?$': '<rootDir>/DomainRepositoryLib/$1',

    '^@RoleResolutionLib$': '<rootDir>/RoleResolutionLib/index',
    '^@RoleResolutionLib/(.*?)(?:\\.js)?$': '<rootDir>/RoleResolutionLib/$1',

    '^@ComposableContentLib$': '<rootDir>/ComposableContentLib/index',
    '^@ComposableContentLib/(.*?)(?:\\.js)?$': '<rootDir>/ComposableContentLib/$1',

    '^@GasSchemaValidatorLib$': '<rootDir>/GasSchemaValidatorLib/index',
    '^@GasSchemaValidatorLib/(.*?)(?:\\.js)?$': '<rootDir>/GasSchemaValidatorLib/$1'
  },

  // Test match patterns - where to find test files
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],

  // Coverage configuration
  collectCoverage: false, // Set to true to collect coverage by default
  collectCoverageFrom: [
    // Include all source files
    'GasOnlineTestFramework/src/**/*.ts',
    'GasSchemaValidatorLib/src/**/*.ts',
    'GasOnlineTestFramework/index.ts',
    'GasSchemaValidatorLib/index.ts',
    'CoreUtilsLib/src/**/*.ts',
    'GasResilienceLib/src/**/*.ts',
    'GoogleApiWrapper/src/**/*.ts',
    'WorkspaceTemplateEngine/src/**/*.ts',
    'GasExpressionEngineLib/src/**/*.ts',
    'SheetDBLib/src/**/*.ts',
    'JobRunnerLib/src/**/*.ts',
    'PipelineFramework/src/**/*.ts',
    'ContextEngine/src/**/*.ts',
    'GasDataImporter/src/**/*.ts',
    'DomainRepositoryLib/src/**/*.ts',
    'RoleResolutionLib/src/**/*.ts',
    'ComposableContentLib/src/**/*.ts',
    'CoreUtilsLib/index.ts',
    'GasResilienceLib/index.ts',
    'GoogleApiWrapper/index.ts',
    'WorkspaceTemplateEngine/index.ts',
    'GasExpressionEngineLib/index.ts',
    'SheetDBLib/index.ts',
    'JobRunnerLib/index.ts',
    'PipelineFramework/index.ts',
    'ContextEngine/index.ts',
    'GasDataImporter/index.ts',
    'DomainRepositoryLib/index.ts',
    'RoleResolutionLib/index.ts',
    'ComposableContentLib/index.ts',

    // Exclude test files
    '!**/__tests__/**',
    '!**/*.test.ts',
    '!**/*.spec.ts',
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
  modulePathIgnorePatterns: ['<rootDir>/GLF_OLD/'],

  testPathIgnorePatterns: [
    '/GLF_OLD/',
    '/node_modules/',
    '/dist/',
    '/.cache/',
    '/.superpowers/',
    '\\.gs$' // Ignore .gs test files (these are for GAS environment only)
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'cts', 'js', 'cjs', 'json'],

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
