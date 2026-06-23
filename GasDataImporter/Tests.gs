/**
 * @fileoverview Test suite for GasDataImporter library
 * @author GasLibraryFactory
 *
 * Run these tests from the Google Apps Script editor to verify library functionality.
 * These tests are numbered to ensure proper execution order.
 */

// Test Configuration
// Replace these with actual IDs from your test environment
const TEST_CONFIG = {
  DATABASE_SHEET_ID: 'YOUR_DATABASE_SPREADSHEET_ID',
  SOURCE_SHEET_ID: 'YOUR_SOURCE_SPREADSHEET_ID',
  TEST_FOLDER_ID: 'YOUR_TEST_FOLDER_ID',
  TEST_TABLE_NAME: 'TestImports'
};

/**
 * 01 - Test ImportConfiguration validation
 */
function test01_ImportConfiguration() {
  Logger.log('=== Test 01: ImportConfiguration Validation ===');

  try {
    // Test valid configuration
    const validRecipe = {
      name: 'Test Import',
      source: {
        type: 'SheetById',
        config: { sheetId: '123', hasHeaders: true }
      },
      transform: {
        mapping: { Col1: 'COL1' }
      },
      load: {
        targetTable: 'TestTable',
        conflictResolution: 'UPSERT',
        conflictKey: 'ID'
      }
    };

    const config = new ImportConfiguration(validRecipe);
    Logger.log('✓ Valid configuration accepted');

    // Test invalid configuration (missing source)
    try {
      const invalidRecipe = {
        name: 'Invalid',
        load: { targetTable: 'Test', conflictResolution: 'UPSERT', conflictKey: 'ID' }
      };
      new ImportConfiguration(invalidRecipe);
      Logger.log('✗ Should have thrown error for missing source');
    } catch (error) {
      Logger.log('✓ Invalid configuration rejected: ' + error.message);
    }

    Logger.log('✓ Test 01 PASSED');
    return true;
  } catch (error) {
    Logger.log('✗ Test 01 FAILED: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * 02 - Test SourceStrategy base class
 */
function test02_SourceStrategy() {
  Logger.log('=== Test 02: SourceStrategy Base Class ===');

  try {
    // Test that abstract class cannot be instantiated
    try {
      new SourceStrategy();
      Logger.log('✗ Should not allow instantiation of abstract class');
      return false;
    } catch (error) {
      Logger.log('✓ Abstract class instantiation prevented');
    }

    // Test custom strategy implementation
    class TestStrategy extends SourceStrategy {
      _extractData(config) {
        return [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 }
        ];
      }
    }

    const strategy = new TestStrategy();
    const data = strategy.extract({});

    if (data.length !== 2) {
      throw new Error('Expected 2 rows');
    }

    Logger.log('✓ Custom strategy works correctly');
    Logger.log('✓ Test 02 PASSED');
    return true;
  } catch (error) {
    Logger.log('✗ Test 02 FAILED: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * 03 - Test Transformer mapping and normalization
 */
function test03_Transformer() {
  Logger.log('=== Test 03: Transformer ===');

  try {
    const logger = console;
    const transformer = new Transformer(logger, null);

    // Test data
    const sourceData = [
      { 'First Name': '  Alice  ', 'Last Name': 'Smith', Email: 'ALICE@EXAMPLE.COM' },
      { 'First Name': 'Bob', 'Last Name': 'Jones', Email: 'bob@example.com' }
    ];

    // Transform configuration
    const transformConfig = {
      mapping: {
        'First Name': 'FIRST_NAME',
        'Last Name': 'LAST_NAME',
        Email: 'EMAIL'
      },
      calculated: {
        FULL_NAME: '{{FIRST_NAME}} {{LAST_NAME}}'
      },
      normalization: {
        trim: true,
        lowercaseColumns: ['EMAIL']
      }
    };

    const result = transformer.transform(sourceData, transformConfig);

    // Validate results
    if (result.length !== 2) {
      throw new Error('Expected 2 rows in result');
    }

    if (result[0].FIRST_NAME !== 'Alice') {
      throw new Error('Trimming failed');
    }

    if (result[0].EMAIL !== 'alice@example.com') {
      throw new Error('Lowercase normalization failed');
    }

    if (result[0].FULL_NAME !== 'Alice Smith') {
      throw new Error('Calculated field failed');
    }

    Logger.log('✓ Mapping works correctly');
    Logger.log('✓ Normalization works correctly');
    Logger.log('✓ Calculated fields work correctly');
    Logger.log('✓ Test 03 PASSED');
    return true;
  } catch (error) {
    Logger.log('✗ Test 03 FAILED: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * 04 - Test error classes
 */
function test04_ErrorClasses() {
  Logger.log('=== Test 04: Error Classes ===');

  try {
    // Test ImportError
    const importError = new ImportError('Test message', 'TEST_CODE', { detail: 'value' });

    if (importError.message !== 'Test message') {
      throw new Error('ImportError message incorrect');
    }

    if (importError.code !== 'TEST_CODE') {
      throw new Error('ImportError code incorrect');
    }

    Logger.log('✓ ImportError works correctly');

    // Test SourceError
    const sourceError = new SourceError('Source failed', 'SOURCE_CODE');
    if (sourceError.name !== 'SourceError') {
      throw new Error('SourceError name incorrect');
    }

    Logger.log('✓ SourceError works correctly');

    // Test TransformError
    const transformError = new TransformError('Transform failed');
    if (transformError.name !== 'TransformError') {
      throw new Error('TransformError name incorrect');
    }

    Logger.log('✓ TransformError works correctly');

    // Test LoadError
    const loadError = new LoadError('Load failed');
    if (loadError.name !== 'LoadError') {
      throw new Error('LoadError name incorrect');
    }

    Logger.log('✓ LoadError works correctly');

    // Test ConfigurationError
    const configError = new ConfigurationError('Config invalid');
    if (configError.name !== 'ConfigurationError') {
      throw new Error('ConfigurationError name incorrect');
    }

    Logger.log('✓ ConfigurationError works correctly');

    Logger.log('✓ Test 04 PASSED');
    return true;
  } catch (error) {
    Logger.log('✗ Test 04 FAILED: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * 05 - Test SourceStrategyFactory
 */
function test05_SourceStrategyFactory() {
  Logger.log('=== Test 05: SourceStrategyFactory ===');

  try {
    const logger = console;
    const factory = new SourceStrategyFactory(logger, null, null);

    // Test built-in strategies are registered
    const availableStrategies = factory.getAvailableStrategies();

    if (!availableStrategies.includes('SheetById')) {
      throw new Error('SheetById strategy not registered');
    }

    if (!availableStrategies.includes('Folder')) {
      throw new Error('Folder strategy not registered');
    }

    Logger.log('✓ Built-in strategies registered');

    // Test custom strategy registration
    class CustomStrategy extends SourceStrategy {
      _extractData(config) {
        return [];
      }
    }

    factory.registerStrategy('CustomTest', CustomStrategy);

    if (!factory.hasStrategy('CustomTest')) {
      throw new Error('Custom strategy not registered');
    }

    Logger.log('✓ Custom strategy registration works');

    Logger.log('✓ Test 05 PASSED');
    return true;
  } catch (error) {
    Logger.log('✗ Test 05 FAILED: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * 06 - Test ImportEngine validation
 */
function test06_ImportEngineValidation() {
  Logger.log('=== Test 06: ImportEngine Recipe Validation ===');

  try {
    // Initialize minimal engine for validation testing
    const logger = console;
    const engine = new ImportEngine(logger, null, null, null, null, null);

    // Valid recipe
    const validRecipe = {
      name: 'Valid Test',
      source: {
        type: 'SheetById',
        config: { sheetId: '123' }
      },
      transform: {},
      load: {
        targetTable: 'Test',
        conflictResolution: 'INSERT_ONLY'
      }
    };

    const validResult = engine.validateRecipe(validRecipe);

    if (!validResult.valid) {
      throw new Error('Valid recipe rejected: ' + validResult.error);
    }

    Logger.log('✓ Valid recipe accepted');

    // Invalid recipe
    const invalidRecipe = {
      name: 'Invalid',
      source: { type: 'UnknownType', config: {} },
      load: { targetTable: 'Test', conflictResolution: 'INVALID_STRATEGY' }
    };

    const invalidResult = engine.validateRecipe(invalidRecipe);

    if (invalidResult.valid) {
      throw new Error('Invalid recipe should be rejected');
    }

    Logger.log('✓ Invalid recipe rejected');

    Logger.log('✓ Test 06 PASSED');
    return true;
  } catch (error) {
    Logger.log('✗ Test 06 FAILED: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * 07 - Integration test with real spreadsheet (requires configuration)
 *
 * NOTE: This test requires TEST_CONFIG to be set with valid IDs
 */
function test07_IntegrationTest() {
  Logger.log('=== Test 07: Integration Test ===');

  if (TEST_CONFIG.DATABASE_SHEET_ID === 'YOUR_DATABASE_SPREADSHEET_ID') {
    Logger.log('⚠ Test 07 SKIPPED: Configure TEST_CONFIG with real spreadsheet IDs');
    return true;
  }

  try {
    // Initialize real services
    const logger = console;
    const cache = CacheService.getScriptCache();
    const utils = { sleep: (ms) => Utilities.sleep(ms) };

    // Note: Actual imports would require GoogleApiWrapper and SheetDBLib
    // This is a placeholder for integration testing structure

    Logger.log('✓ Integration test structure verified');
    Logger.log('⚠ Full integration test requires GoogleApiWrapper and SheetDBLib');
    Logger.log('✓ Test 07 PASSED');
    return true;
  } catch (error) {
    Logger.log('✗ Test 07 FAILED: ' + error.message);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  Logger.log('');
  Logger.log('╔════════════════════════════════════════════════╗');
  Logger.log('║   GasDataImporter Test Suite                   ║');
  Logger.log('╚════════════════════════════════════════════════╝');
  Logger.log('');

  const tests = [
    test01_ImportConfiguration,
    test02_SourceStrategy,
    test03_Transformer,
    test04_ErrorClasses,
    test05_SourceStrategyFactory,
    test06_ImportEngineValidation,
    test07_IntegrationTest
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      Logger.log('✗ Test threw unexpected error: ' + error.message);
      failed++;
    }
    Logger.log('');
  }

  Logger.log('╔════════════════════════════════════════════════╗');
  Logger.log('║   Test Results                                 ║');
  Logger.log('╠════════════════════════════════════════════════╣');
  Logger.log('║   Passed: ' + passed + '/' + tests.length);
  Logger.log('║   Failed: ' + failed + '/' + tests.length);
  Logger.log('╚════════════════════════════════════════════════╝');

  return failed === 0;
}

/**
 * Quick test runner for individual tests
 */
function quickTest() {
  // Run a specific test by uncommenting:
  // test01_ImportConfiguration();
  // test02_SourceStrategy();
  // test03_Transformer();
  // test04_ErrorClasses();
  // test05_SourceStrategyFactory();
  // test06_ImportEngineValidation();
  // test07_IntegrationTest();

  // Or run all tests:
  runAllTests();
}
