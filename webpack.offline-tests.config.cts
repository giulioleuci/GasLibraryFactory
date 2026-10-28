/**
 * Webpack Configuration for Offline Test Bundle
 *
 * Compiles all Jest test files into a single webpack bundle
 * (TEST_OFFLINE_Bundle.gs) that verifies code compiles correctly
 * through the same webpack/babel pipeline used for production.
 *
 * This bundle is for OFFLINE verification only — it is NOT deployed to GAS.
 * It validates that all test code and its dependencies survive webpack
 * compilation and babel transpilation (Chrome 80 target).
 *
 * This config:
 * - Uses the auto-generated master entry point
 * - Resolves all library aliases (same as main build)
 * - Includes test/fakes/ as resolvable modules
 * - Bundles the JestCompat layer for Jest API emulation
 * - Produces readable (non-minified) output
 * - Uses gas-webpack-plugin for GAS-callable global functions
 *
 * Prerequisites:
 *   1. Run `npm run build:tools && node .cache/ts-tools/scripts/generate-offline-test-entry.cjs` first
 *   2. Main Code.js must already be built (provides library code)
 */

import path = require('node:path');
import GasPlugin from 'gas-webpack-plugin';
import type { Configuration } from 'webpack';
import fs = require('node:fs');

const rootDir = path.resolve(__dirname, '../..');

export = (env: { readable?: boolean } = {}, _argv: object = {}): Configuration => {
  const entryFile = path.resolve(rootDir, 'dist/.offline-test-entries/_AllOfflineTests.entry.js');

  if (!fs.existsSync(entryFile)) {
    console.error('ERROR: Offline test entries not generated yet.');
    console.error(
      'Run: npm run build:tools && node .cache/ts-tools/scripts/generate-offline-test-entry.cjs'
    );
    process.exit(1);
  }

  // Library directories that Code.js already provides on global
  // Use externals to avoid re-bundling them in the test bundle
  const libraryDirs = [
    'CoreUtilsLib',
    'GasResilienceLib',
    'GoogleApiWrapper',
    'WorkspaceTemplateEngine',
    'GasExpressionEngineLib',
    'SheetDBLib',
    'JobRunnerLib',
    'PipelineFramework',
    'ContextEngine',
    'GasDataImporter',
    'DomainRepositoryLib',
    'RoleResolutionLib',
    'ComposableContentLib',
    'GasProcessMonitorLib',
    'GasSchemaValidatorLib'
  ];

  return {
    mode: 'production',
    context: rootDir,

    entry: entryFile,

    output: {
      filename: 'TEST_OFFLINE_Bundle.gs',
      path: path.resolve(rootDir, 'dist'),
      library: { type: 'this' },
      clean: false // Don't clean dist/ - Code.js is already there
    },

    resolve: {
      extensions: ['.ts', '.cts', '.js', '.cjs', '.json'],
      extensionAlias: { '.js': ['.ts', '.js'], '.cjs': ['.cts', '.cjs'] },
      alias: {
        // Library aliases (same as main webpack config)
        '@CoreUtilsLib': path.resolve(rootDir, 'CoreUtilsLib'),
        '@GasResilienceLib': path.resolve(rootDir, 'GasResilienceLib'),
        '@GoogleApiWrapper': path.resolve(rootDir, 'GoogleApiWrapper'),
        '@WorkspaceTemplateEngine': path.resolve(rootDir, 'WorkspaceTemplateEngine'),
        '@GasExpressionEngineLib': path.resolve(rootDir, 'GasExpressionEngineLib'),
        '@SheetDBLib': path.resolve(rootDir, 'SheetDBLib'),
        '@JobRunnerLib': path.resolve(rootDir, 'JobRunnerLib'),
        '@PipelineFramework': path.resolve(rootDir, 'PipelineFramework'),
        '@ContextEngine': path.resolve(rootDir, 'ContextEngine'),
        '@GasDataImporter': path.resolve(rootDir, 'GasDataImporter'),
        '@DomainRepositoryLib': path.resolve(rootDir, 'DomainRepositoryLib'),
        '@GasOnlineTestFramework': path.resolve(rootDir, 'GasOnlineTestFramework'),
        '@RoleResolutionLib': path.resolve(rootDir, 'RoleResolutionLib'),
        '@ComposableContentLib': path.resolve(rootDir, 'ComposableContentLib'),
        '@GasProcessMonitorLib': path.resolve(rootDir, 'GasProcessMonitorLib'),
        '@GasSchemaValidatorLib': path.resolve(rootDir, 'GasSchemaValidatorLib')
      }
    },

    // Externalize library aliases - Code.js already provides them on global (this)
    // Tests import from @LibName aliases; webpack resolves to global properties.
    // GasOnlineTestFramework is NOT externalized because the test bundle needs it.
    externals: [
      function ({ request }, callback) {
        // Match @LibraryName alias imports (but keep @GasOnlineTestFramework internal)
        for (const lib of libraryDirs) {
          if (request === `@${lib}` || request?.startsWith(`@${lib}/`)) {
            // Return 'this' so destructured imports resolve from the global scope
            // e.g., import { LoggerService } from '@CoreUtilsLib' -> this.LoggerService
            return callback(null, 'this');
          }
        }
        // Keep @jest/globals external too (it's a stub)
        if (request === '@jest/globals') {
          return callback(null, 'this');
        }
        callback();
      }
    ],

    module: {
      rules: [
        {
          test: /\.[cm]?[jt]s$/,
          resolve: { fullySpecified: false }
        },
        {
          test: /\.[cm]?[jt]s$/,
          exclude: [/node_modules/],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: { chrome: '80' },
                    modules: false,
                    include: ['transform-class-properties'],
                    exclude: ['transform-async-to-generator', 'transform-regenerator']
                  }
                ]
              ]
            }
          }
        }
      ]
    },

    plugins: [new GasPlugin({ autoGlobalExportsFiles: [], ...{ comments: false } })],

    optimization: {
      minimize: false, // Keep readable — bundle runs offline only, no GAS size limit
      splitChunks: false,
      runtimeChunk: false
    },

    // No source maps for test bundle (they'd be huge)
    devtool: false,

    performance: {
      maxAssetSize: 10 * 1024 * 1024, // 10 MB - test bundles can be large
      maxEntrypointSize: 10 * 1024 * 1024,
      hints: 'warning'
    },

    // Suppress some noisy warnings from test files
    stats: {
      warningsFilter: [/Critical dependency/, /the request of a dependency is an expression/]
    }
  };
};
