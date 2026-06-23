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
 *   1. Run `node scripts/generate-offline-test-entry.cjs` first
 *   2. Main Code.js must already be built (provides library code)
 */

const path = require('path');
const GasPlugin = require('gas-webpack-plugin');
const fs = require('fs');

module.exports = (env, argv) => {
  const entryFile = path.resolve(__dirname, 'dist/.offline-test-entries/_AllOfflineTests.entry.js');

  if (!fs.existsSync(entryFile)) {
    console.error('ERROR: Offline test entries not generated yet.');
    console.error('Run: node scripts/generate-offline-test-entry.cjs');
    process.exit(1);
  }

  // Library directories that Code.js already provides on global
  // Use externals to avoid re-bundling them in the test bundle
  const libraryDirs = [
    'CoreUtilsLib', 'GasResilienceLib', 'GoogleApiWrapper',
    'WorkspaceTemplateEngine', 'GasExpressionEngineLib', 'SheetDBLib',
    'JobRunnerLib', 'PipelineFramework', 'ContextEngine',
    'GasDataImporter', 'DomainRepositoryLib', 'RoleResolutionLib',
    'ComposableContentLib', 'GasProcessMonitorLib'
  ];

  return {
    mode: 'production',

    entry: entryFile,

    output: {
      filename: 'TEST_OFFLINE_Bundle.gs',
      path: path.resolve(__dirname, 'dist'),
      library: { type: 'this' },
      clean: false // Don't clean dist/ - Code.js is already there
    },

    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        // Library aliases (same as main webpack config)
        '@CoreUtilsLib': path.resolve(__dirname, 'CoreUtilsLib'),
        '@GasResilienceLib': path.resolve(__dirname, 'GasResilienceLib'),
        '@GoogleApiWrapper': path.resolve(__dirname, 'GoogleApiWrapper'),
        '@WorkspaceTemplateEngine': path.resolve(__dirname, 'WorkspaceTemplateEngine'),
        '@GasExpressionEngineLib': path.resolve(__dirname, 'GasExpressionEngineLib'),
        '@SheetDBLib': path.resolve(__dirname, 'SheetDBLib'),
        '@JobRunnerLib': path.resolve(__dirname, 'JobRunnerLib'),
        '@PipelineFramework': path.resolve(__dirname, 'PipelineFramework'),
        '@ContextEngine': path.resolve(__dirname, 'ContextEngine'),
        '@GasDataImporter': path.resolve(__dirname, 'GasDataImporter'),
        '@DomainRepositoryLib': path.resolve(__dirname, 'DomainRepositoryLib'),
        '@GasOnlineTestFramework': path.resolve(__dirname, 'GasOnlineTestFramework'),
        '@GasProcessMonitorLib': path.resolve(__dirname, 'GasProcessMonitorLib'),
        '@RoleResolutionLib': path.resolve(__dirname, 'RoleResolutionLib'),
        '@ComposableContentLib': path.resolve(__dirname, 'ComposableContentLib')
      }
    },

    // Externalize library aliases - Code.js already provides them on global (this)
    // Tests import from @LibName aliases; webpack resolves to global properties.
    // GasOnlineTestFramework is NOT externalized because the test bundle needs it.
    externals: [
      function({ request }, callback) {
        // Match @LibraryName alias imports (but keep @GasOnlineTestFramework internal)
        for (const lib of libraryDirs) {
          if (request === `@${lib}` || request.startsWith(`@${lib}/`)) {
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
          test: /\.m?js$/,
          resolve: { fullySpecified: false }
        },
        {
          test: /\.js$/,
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

    plugins: [
      new GasPlugin({
        autoGlobalExportsFiles: [],
        comments: false
      })
    ],

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
      warningsFilter: [
        /Critical dependency/,
        /the request of a dependency is an expression/
      ]
    }
  };
};
