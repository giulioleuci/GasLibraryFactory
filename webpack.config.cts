import path = require('node:path');
import GasPlugin from 'gas-webpack-plugin';
import type { Configuration } from 'webpack';
import fs = require('node:fs');
import * as glob from 'glob';
import webpack = require('webpack');
import MinimizerPlugin = require('minimizer-webpack-plugin');
import StripCommentsPlugin = require('./webpack-plugins/StripCommentsPlugin.cjs');
import { transformFileSync } from '@babel/core';

const rootDir = path.resolve(__dirname, '../..');

function emitOnlineTest(source: string, destination: string) {
  const result = transformFileSync(source, {
    configFile: path.join(rootDir, 'babel.config.cjs'),
    sourceType: 'script',
    comments: false,
    presets: [['@babel/preset-env', { targets: { chrome: '80' }, modules: false }]]
  });
  if (!result?.code) {
    throw new Error(`No GAS JavaScript emitted for ${source}`);
  }
  fs.writeFileSync(destination, result.code);
}

export = (env: { readable?: boolean } = {}, _argv: object = {}): Configuration => {
  const readable = !!(env && env.readable);

  const config: Configuration = {
    mode: 'production',

    context: rootDir,

    entry: path.join(rootDir, 'src/index.ts'),

    output: {
      filename: 'Code.js',
      path: path.resolve(rootDir, 'dist'),
      library: { type: 'this' },
      clean: false
    },

    resolve: {
      extensions: ['.ts', '.cts', '.js', '.cjs', '.json'],
      extensionAlias: { '.js': ['.ts', '.js'], '.cjs': ['.cts', '.cjs'] },
      alias: {
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
        '@GasSchemaValidatorLib': path.resolve(rootDir, 'GasSchemaValidatorLib')
      }
    },

    module: {
      rules: [
        {
          test: /\.[cm]?[jt]s$/,
          resolve: { fullySpecified: false }
        },
        {
          test: /\.[cm]?[jt]s$/,
          exclude: [/node_modules/, /__tests__/, /\.test\.[jt]s$/, /\.spec\.[jt]s$/],
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
      // GAS uses Utilities for entropy; remove guarded browser/Node crypto fallbacks.
      new webpack.DefinePlugin({ 'typeof crypto': JSON.stringify('undefined') }),
      new webpack.NormalModuleReplacementPlugin(
        /src\/testing\/mocks\.[jt]s$/,
        path.resolve(rootDir, 'test/fakes/empty-mocks.ts')
      ),
      new GasPlugin({ autoGlobalExportsFiles: [], ...{ comments: false } }),

      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tapAsync('CopyOnlineTestsPlugin', (compilation, callback) => {
            const distDir = path.resolve(rootDir, 'dist');

            if (!fs.existsSync(distDir)) {
              fs.mkdirSync(distDir, { recursive: true });
            }

            const testFileMap: Record<string, string> = {};
            const testFiles = glob.sync('**/__testOnline__/**/*.ts', {
              cwd: rootDir,
              ignore: ['node_modules/**', 'dist/**']
            });

            let copiedCount = 0;

            testFiles.forEach((testFile) => {
              const sourcePath = path.join(rootDir, testFile);
              const parts = testFile.split(path.sep);
              const libraryName = parts[0];
              const fileName = path.basename(testFile, '.ts');

              // Simplify naming: if fileName already starts with libraryName, don't repeat it
              let outputFileName;
              if (fileName.startsWith(libraryName)) {
                outputFileName = `TEST_${fileName}.gs`;
              } else {
                outputFileName = `TEST_${libraryName}_${fileName}.gs`;
              }

              const destPath = path.join(distDir, outputFileName);
              emitOnlineTest(sourcePath, destPath);
              testFileMap[outputFileName] = testFile;
              copiedCount++;
            });

            const sharedTestFiles = glob.sync('__testOnline__/shared/**/*.ts', {
              cwd: rootDir
            });

            sharedTestFiles.forEach((testFile) => {
              const sourcePath = path.join(rootDir, testFile);
              const fileName = path.basename(testFile, '.ts') + '.gs';
              const outputFileName = `TEST_SHARED_${fileName}`;
              const destPath = path.join(distDir, outputFileName);
              emitOnlineTest(sourcePath, destPath);
              testFileMap[outputFileName] = testFile;
              copiedCount++;
            });

            const integrationTestFiles = glob.sync('__testOnline__/integration/**/*.ts', {
              cwd: rootDir
            });

            integrationTestFiles.forEach((testFile) => {
              const sourcePath = path.join(rootDir, testFile);
              const fileName = path.basename(testFile, '.ts');
              const outputFileName = `TEST_INTEGRATION_${fileName}.gs`;
              const destPath = path.join(distDir, outputFileName);
              emitOnlineTest(sourcePath, destPath);
              testFileMap[outputFileName] = testFile;
              copiedCount++;
            });

            const masterRunner = path.join(rootDir, '__testOnline__/MasterTestRunner.ts');
            if (fs.existsSync(masterRunner)) {
              const destPath = path.join(distDir, 'TEST_MASTER_Runner.gs');
              emitOnlineTest(masterRunner, destPath);
              testFileMap['TEST_MASTER_Runner.gs'] = '__testOnline__/MasterTestRunner.ts';
              copiedCount++;
            }

            const humanTests = path.join(rootDir, '__testOnline__/HumanInspectionTests.ts');
            if (fs.existsSync(humanTests)) {
              const destPath = path.join(distDir, 'TEST_HUMAN_InspectionTests.gs');
              emitOnlineTest(humanTests, destPath);
              testFileMap['TEST_HUMAN_InspectionTests.gs'] =
                '__testOnline__/HumanInspectionTests.ts';
              copiedCount++;
            }

            // Write test file mapping
            const testMapPath = path.join(distDir, 'test-file-map.json');
            fs.writeFileSync(testMapPath, JSON.stringify(testFileMap, null, 2));

            console.log(`CopyOnlineTestsPlugin: ${copiedCount} test file(s) copied to dist/`);
            console.log(
              `CopyOnlineTestsPlugin: test-file-map.json written with ${Object.keys(testFileMap).length} mapping(s)`
            );
            callback();
          });
        }
      }
    ],

    optimization: {
      minimize: !readable,
      minimizer: readable
        ? []
        : [
            new MinimizerPlugin({
              minimizerOptions: {
                ecma: 2015,
                parse: { ecma: 2020 },
                compress: { defaults: true, drop_console: false },
                format: { comments: false, ecma: 2015 }
              },
              extractComments: false
            })
          ],
      splitChunks: false,
      runtimeChunk: false
    },

    devtool: 'hidden-source-map',

    performance: {
      maxAssetSize: 500000,
      maxEntrypointSize: 500000,
      hints: 'warning'
    },

    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000
    }
  };

  if (readable) {
    config.plugins!.push(new StripCommentsPlugin());
  }

  return config;
};
