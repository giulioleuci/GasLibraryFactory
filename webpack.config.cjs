const path = require('path');
const GasPlugin = require('gas-webpack-plugin');
const fs = require('fs');
const glob = require('glob');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const readable = !!(env && env.readable);

  const config = {
    mode: 'production',

    entry: './src/index.js',

    output: {
      filename: 'Code.js',
      path: path.resolve(__dirname, 'dist'),
      library: { type: 'this' },
      clean: false
    },

    resolve: {
      extensions: ['.js', '.json'],
      alias: {
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
        '@ComposableContentLib': path.resolve(__dirname, 'ComposableContentLib'),
        '@GasSchemaValidatorLib': path.resolve(__dirname, 'GasSchemaValidatorLib')
      }
    },

    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: { fullySpecified: false }
        },
        {
          test: /\.js$/,
          exclude: [/node_modules/, /__tests__/, /\.test\.js$/, /\.spec\.js$/],
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
      new webpack.NormalModuleReplacementPlugin(
        /src\/testing\/mocks\.js$/,
        path.resolve(__dirname, 'test/fakes/empty-mocks.js')
      ),
      new GasPlugin({
        autoGlobalExportsFiles: [],
        comments: false
      }),

      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tapAsync('CopyOnlineTestsPlugin', (compilation, callback) => {
            const distDir = path.resolve(__dirname, 'dist');

            if (!fs.existsSync(distDir)) {
              fs.mkdirSync(distDir, { recursive: true });
            }

            const testFileMap = {};
            const testFiles = glob.sync('**/__testOnline__/**/*.gs', {
              cwd: __dirname,
              ignore: ['node_modules/**', 'dist/**']
            });

            let copiedCount = 0;

            testFiles.forEach((testFile) => {
              const sourcePath = path.join(__dirname, testFile);
              const parts = testFile.split(path.sep);
              const libraryName = parts[0];
              const fileName = path.basename(testFile, '.gs');

              // Simplify naming: if fileName already starts with libraryName, don't repeat it
              let outputFileName;
              if (fileName.startsWith(libraryName)) {
                outputFileName = `TEST_${fileName}.gs`;
              } else {
                outputFileName = `TEST_${libraryName}_${fileName}.gs`;
              }

              const destPath = path.join(distDir, outputFileName);
              fs.copyFileSync(sourcePath, destPath);
              testFileMap[outputFileName] = testFile;
              copiedCount++;
            });

            const sharedTestFiles = glob.sync('__testOnline__/shared/**/*.gs', {
              cwd: __dirname
            });

            sharedTestFiles.forEach((testFile) => {
              const sourcePath = path.join(__dirname, testFile);
              const fileName = path.basename(testFile);
              const outputFileName = `TEST_SHARED_${fileName}`;
              const destPath = path.join(distDir, outputFileName);
              fs.copyFileSync(sourcePath, destPath);
              testFileMap[outputFileName] = testFile;
              copiedCount++;
            });

            const integrationTestFiles = glob.sync('__testOnline__/integration/**/*.gs', {
              cwd: __dirname
            });

            integrationTestFiles.forEach((testFile) => {
              const sourcePath = path.join(__dirname, testFile);
              const fileName = path.basename(testFile, '.gs');
              const outputFileName = `TEST_INTEGRATION_${fileName}.gs`;
              const destPath = path.join(distDir, outputFileName);
              fs.copyFileSync(sourcePath, destPath);
              testFileMap[outputFileName] = testFile;
              copiedCount++;
            });

            const masterRunner = path.join(__dirname, '__testOnline__/MasterTestRunner.gs');
            if (fs.existsSync(masterRunner)) {
              const destPath = path.join(distDir, 'TEST_MASTER_Runner.gs');
              fs.copyFileSync(masterRunner, destPath);
              testFileMap['TEST_MASTER_Runner.gs'] = '__testOnline__/MasterTestRunner.gs';
              copiedCount++;
            }

            const humanTests = path.join(__dirname, '__testOnline__/HumanInspectionTests.gs');
            if (fs.existsSync(humanTests)) {
              const destPath = path.join(distDir, 'TEST_HUMAN_InspectionTests.gs');
              fs.copyFileSync(humanTests, destPath);
              testFileMap['TEST_HUMAN_InspectionTests.gs'] =
                '__testOnline__/HumanInspectionTests.gs';
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
            new (require('terser-webpack-plugin'))({
              terserOptions: {
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
    const StripCommentsPlugin = require('./webpack-plugins/StripCommentsPlugin.cjs');
    config.plugins.push(new StripCommentsPlugin());
  }

  return config;
};
