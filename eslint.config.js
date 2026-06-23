import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import jest from 'eslint-plugin-jest';

export default [
  // Base recommended config
  js.configs.recommended,

  // Global ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '**/*.min.js',
      '.clasp.json',
      'appsscript.json'
    ]
  },

  // Main configuration for all JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Google Apps Script globals
        SpreadsheetApp: 'readonly',
        DriveApp: 'readonly',
        DocumentApp: 'readonly',
        MailApp: 'readonly',
        GmailApp: 'readonly',
        CalendarApp: 'readonly',
        PropertiesService: 'readonly',
        CacheService: 'readonly',
        ScriptApp: 'readonly',
        UrlFetchApp: 'readonly',
        Utilities: 'readonly',
        Session: 'readonly',
        LockService: 'readonly',
        ContentService: 'readonly',
        HtmlService: 'readonly',
        Logger: 'readonly',
        Browser: 'readonly',
        FormApp: 'readonly',
        SlidesApp: 'readonly',
        GroupsApp: 'readonly',
        AdminDirectory: 'readonly',
        Charts: 'readonly',
        XmlService: 'readonly',
        Jdbc: 'readonly',
        LanguageApp: 'readonly',
        Maps: 'readonly',

        // Google Apps Script Advanced Services
        Docs: 'readonly',
        Drive: 'readonly',
        Gmail: 'readonly',
        Sheets: 'readonly',
        Calendar: 'readonly',
        People: 'readonly',

        // Node.js globals (for build scripts and tests)
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        global: 'readonly',

        // Browser/Node globals commonly needed
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        btoa: 'readonly',
        atob: 'readonly'
      }
    },
    plugins: {
      prettier
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Disable async/await - GAS V8 runtime doesn't support it
      'no-async-promise-executor': 'off',
      'require-await': 'off',

      // Best practices
      'no-console': 'off', // Allow console.log for GAS
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'no-throw-literal': 'error',
      'no-implicit-globals': 'error',

      // Code quality
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
      'comma-dangle': ['error', 'never'],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],

      // Prevent common errors
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-extra-semi': 'error',
      'valid-typeof': 'error',

      // GAS-specific
      'no-undef': 'error' // Catch undefined GAS APIs
    }
  },

  // Jest test files configuration
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js', 'test/**/*.js'],
    plugins: {
      jest
    },
    languageOptions: {
      globals: {
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        fail: 'readonly'
      }
    },
    rules: {
      // Use Jest recommended rules selectively
      'jest/expect-expect': 'warn',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/valid-expect': 'error',
      // Downgrade problematic rules to warnings
      'jest/no-conditional-expect': 'warn',
      'jest/no-jasmine-globals': 'warn',
      'jest/no-done-callback': 'warn'
    }
  },

  // Online test files configuration (GAS environment)
  {
    files: ['**/__testOnline__/**/*.js'],
    rules: {
      // Online tests may have different patterns
      'no-unused-vars': 'warn'
    }
  },

  // Webpack and config files
  {
    files: ['webpack.config.js', 'jest.config.js', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        __dirname: 'readonly',
        process: 'readonly',
        module: 'writable',
        require: 'readonly'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Layer-integrity guard (WP-06 / F-3.1, F-3.2):
  // Native Google Apps Script service globals must only be touched inside the
  // GoogleApiWrapper (L2) abstraction. Any other library that needs them must
  // route through a GoogleApiWrapper service. This makes future layer leaks
  // (like the JobRunnerLib -> DriveApp leak closed in WP-05) fail CI.
  // ---------------------------------------------------------------------------
  {
    files: ['**/src/**/*.js'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...[
          'DriveApp',
          'SpreadsheetApp',
          'DocumentApp',
          'PropertiesService',
          'CacheService',
          'UrlFetchApp',
          'Utilities',
          'Session',
          'ScriptApp',
          'LockService',
          'MailApp'
        ].map((name) => ({
          name,
          message: `Native GAS global "${name}" is banned outside GoogleApiWrapper. Route this through a GoogleApiWrapper service (L2) instead of touching the global directly.`
        }))
      ]
    }
  },

  // Sanctioned exceptions to the native-GAS guard above:
  // - GoogleApiWrapper: the L2 layer that *is* the abstraction.
  // - GasOnlineTestFramework: runs inside real GAS by design.
  // - CoreUtilsLib HashUtils/IdGenerator: the single sanctioned L0 native
  //   boundary (Utilities.computeDigest/getUuid), guarded with fallbacks since
  //   L0 sits below GoogleApiWrapper and cannot route through it.
  // - test/mocks/testing helpers: legitimately stub the globals.
  {
    files: [
      'GoogleApiWrapper/**/*.js',
      'GasOnlineTestFramework/**/*.js',
      'CoreUtilsLib/src/internal/HashUtils.js',
      'CoreUtilsLib/src/utils/IdGenerator.js',
      '**/__tests__/**/*.js',
      '**/*.test.js',
      '**/*.spec.js',
      'test/**/*.js',
      '**/testing/**/*.js',
      '**/__testOnline__/**/*.js'
    ],
    rules: {
      'no-restricted-globals': 'off'
    }
  }
];
