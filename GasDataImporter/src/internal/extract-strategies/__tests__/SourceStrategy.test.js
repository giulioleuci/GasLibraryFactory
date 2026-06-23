/**
 * @fileoverview Tests for SourceStrategy abstract base class
 * @author GasLibraryFactory
 */

import { SourceStrategy } from '../SourceStrategy.js';
import { SourceError } from '../../errors/SourceError.js';

/**
 * Concrete implementation for testing
 */
class TestSourceStrategy extends SourceStrategy {
  constructor(logger, extractDataImpl) {
    super(logger);
    this._extractDataImpl = extractDataImpl || (() => [{ test: 'data' }]);
  }

  _extractData(config) {
    return this._extractDataImpl(config);
  }
}

describe('SourceStrategy - Abstract Base Class Test Suite', () => {
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
  });

  // ===================================================================
  // Constructor Tests
  // ===================================================================
  describe('Constructor', () => {
    it('should prevent direct instantiation of abstract class', () => {
      expect(() => {
        new SourceStrategy();
      }).toThrow(TypeError);
      expect(() => {
        new SourceStrategy();
      }).toThrow('Cannot instantiate abstract class SourceStrategy directly');
    });

    it('should allow instantiation of subclass', () => {
      const strategy = new TestSourceStrategy(mockLogger);
      expect(strategy).toBeInstanceOf(SourceStrategy);
      expect(strategy).toBeInstanceOf(TestSourceStrategy);
    });

    it('should accept custom logger', () => {
      const strategy = new TestSourceStrategy(mockLogger);
      expect(strategy.logger).toBe(mockLogger);
    });

    it('should use console as default logger', () => {
      const strategy = new TestSourceStrategy();
      expect(strategy.logger).toBe(console);
    });
  });

  // ===================================================================
  // extract() Method Tests
  // ===================================================================
  describe('extract() Method', () => {
    it('should call _extractData and return result', () => {
      const expectedData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];
      const strategy = new TestSourceStrategy(mockLogger, () => expectedData);
      const config = { test: 'config' };

      const result = strategy.extract(config);

      expect(result).toEqual(expectedData);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[SourceStrategy] Extracting data with config:',
        JSON.stringify(config)
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[SourceStrategy] Successfully extracted 2 rows'
      );
    });

    it('should log extraction info', () => {
      const strategy = new TestSourceStrategy(mockLogger);
      const config = { sheetId: 'abc123' };

      strategy.extract(config);

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenNthCalledWith(
        1,
        '[SourceStrategy] Extracting data with config:',
        JSON.stringify(config)
      );
    });

    it('should handle empty array result', () => {
      const strategy = new TestSourceStrategy(mockLogger, () => []);
      const result = strategy.extract({});

      expect(result).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[SourceStrategy] Successfully extracted 0 rows'
      );
    });

    it('should throw SourceError if _extractData returns non-array', () => {
      const strategy = new TestSourceStrategy(mockLogger, () => 'not an array');

      expect(() => {
        strategy.extract({});
      }).toThrow(SourceError);

      expect(() => {
        strategy.extract({});
      }).toThrow('Extract method must return an array of objects');
    });

    it('should include result type in error context when non-array returned', () => {
      const strategy = new TestSourceStrategy(mockLogger, () => ({ data: 'object' }));

      try {
        strategy.extract({});
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.code).toBe('INVALID_EXTRACT_RESULT');
        expect(error.context).toEqual({ resultType: 'object' });
      }
    });

    it('should re-throw SourceError from _extractData', () => {
      const sourceError = new SourceError('Custom error', 'CUSTOM_CODE');
      const strategy = new TestSourceStrategy(mockLogger, () => {
        throw sourceError;
      });

      expect(() => {
        strategy.extract({});
      }).toThrow(sourceError);
      expect(mockLogger.error).not.toHaveBeenCalled(); // Should not log, just re-throw
    });

    it('should wrap generic errors in SourceError', () => {
      const genericError = new Error('Something went wrong');
      const strategy = new TestSourceStrategy(mockLogger, () => {
        throw genericError;
      });
      const config = { test: 'data' };

      try {
        strategy.extract(config);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toBe('Data extraction failed: Something went wrong');
        expect(error.code).toBe('EXTRACTION_FAILED');
        expect(error.context).toEqual({
          originalError: 'Something went wrong',
          config
        });
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        '[SourceStrategy] Extraction failed: Something went wrong'
      );
    });

    it('should handle TypeError from _extractData', () => {
      const strategy = new TestSourceStrategy(mockLogger, () => {
        throw new TypeError('Type error occurred');
      });

      try {
        strategy.extract({});
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('Type error occurred');
      }
    });
  });

  // ===================================================================
  // _extractData() Abstract Method Tests
  // ===================================================================
  describe('_extractData() Abstract Method', () => {
    it('should throw error when called on base class instance', () => {
      // We need to create a minimal subclass that doesn't implement _extractData
      class MinimalStrategy extends SourceStrategy {
        constructor(logger) {
          super(logger);
        }
      }

      const strategy = new MinimalStrategy(mockLogger);

      expect(() => {
        strategy._extractData({});
      }).toThrow('Subclasses must implement _extractData method');
    });

    it('should be overridable by subclass', () => {
      const customData = [{ custom: 'value' }];
      const strategy = new TestSourceStrategy(mockLogger, () => customData);

      const result = strategy._extractData({});
      expect(result).toEqual(customData);
    });
  });

  // ===================================================================
  // _arrayToObjects() Helper Method Tests
  // ===================================================================
  describe('_arrayToObjects() Helper Method', () => {
    let strategy;

    beforeEach(() => {
      strategy = new TestSourceStrategy(mockLogger);
    });

    it('should convert 2D array with headers to objects', () => {
      const data = [
        ['name', 'age', 'email'],
        ['John', 30, 'john@example.com'],
        ['Jane', 25, 'jane@example.com']
      ];

      const result = strategy._arrayToObjects(data, true);

      expect(result).toEqual([
        { name: 'John', age: 30, email: 'john@example.com' },
        { name: 'Jane', age: 25, email: 'jane@example.com' }
      ]);
    });

    it('should use first row as headers by default', () => {
      const data = [
        ['col1', 'col2'],
        ['val1', 'val2']
      ];

      const result = strategy._arrayToObjects(data);

      expect(result).toEqual([{ col1: 'val1', col2: 'val2' }]);
    });

    it('should generate generic column names when hasHeaders is false', () => {
      const data = [
        ['value1', 'value2', 'value3'],
        ['data1', 'data2', 'data3']
      ];

      const result = strategy._arrayToObjects(data, false);

      expect(result).toEqual([
        { Col_0: 'value1', Col_1: 'value2', Col_2: 'value3' },
        { Col_0: 'data1', Col_1: 'data2', Col_2: 'data3' }
      ]);
    });

    it('should handle empty array', () => {
      const result = strategy._arrayToObjects([]);
      expect(result).toEqual([]);
    });

    it('should handle null input', () => {
      const result = strategy._arrayToObjects(null);
      expect(result).toEqual([]);
    });

    it('should handle undefined input', () => {
      const result = strategy._arrayToObjects(undefined);
      expect(result).toEqual([]);
    });

    it('should handle missing values (undefined) as null', () => {
      const data = [
        ['col1', 'col2', 'col3'],
        ['val1'], // Missing col2 and col3
        ['val1', 'val2'] // Missing col3
      ];

      const result = strategy._arrayToObjects(data);

      expect(result).toEqual([
        { col1: 'val1', col2: null, col3: null },
        { col1: 'val1', col2: 'val2', col3: null }
      ]);
    });

    it('should handle single row with headers', () => {
      const data = [
        ['name', 'value'],
        ['test', 123]
      ];

      const result = strategy._arrayToObjects(data);

      expect(result).toEqual([{ name: 'test', value: 123 }]);
    });

    it('should handle empty rows', () => {
      const data = [
        ['col1', 'col2'],
        [], // Empty row
        ['val1', 'val2']
      ];

      const result = strategy._arrayToObjects(data);

      expect(result).toEqual([
        { col1: null, col2: null },
        { col1: 'val1', col2: 'val2' }
      ]);
    });

    it('should preserve data types', () => {
      const data = [
        ['string', 'number', 'boolean', 'null'],
        ['text', 42, true, null],
        ['', 0, false, null]
      ];

      const result = strategy._arrayToObjects(data);

      expect(result).toEqual([
        { string: 'text', number: 42, boolean: true, null: null },
        { string: '', number: 0, boolean: false, null: null }
      ]);
    });

    it('should handle special characters in header names', () => {
      const data = [
        ['First Name', 'Last-Name', 'Email_Address'],
        ['John', 'Doe', 'john@example.com']
      ];

      const result = strategy._arrayToObjects(data);

      expect(result).toEqual([
        { 'First Name': 'John', 'Last-Name': 'Doe', Email_Address: 'john@example.com' }
      ]);
    });

    it('should handle very large datasets efficiently', () => {
      const numRows = 1000;
      const headers = ['col1', 'col2', 'col3'];
      const data = [headers];

      for (let i = 0; i < numRows; i++) {
        data.push([`val${i}_1`, `val${i}_2`, `val${i}_3`]);
      }

      const result = strategy._arrayToObjects(data);

      expect(result.length).toBe(numRows);
      expect(result[0]).toEqual({ col1: 'val0_1', col2: 'val0_2', col3: 'val0_3' });
      expect(result[numRows - 1]).toEqual({
        col1: `val${numRows - 1}_1`,
        col2: `val${numRows - 1}_2`,
        col3: `val${numRows - 1}_3`
      });
    });
  });

  // ===================================================================
  // _validateConfig() Helper Method Tests
  // ===================================================================
  describe('_validateConfig() Helper Method', () => {
    let strategy;

    beforeEach(() => {
      strategy = new TestSourceStrategy(mockLogger);
    });

    it('should not throw when all required fields are present', () => {
      const config = {
        sheetId: 'abc123',
        range: 'A1:Z',
        tabName: 'Sheet1'
      };
      const requiredFields = ['sheetId', 'range', 'tabName'];

      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).not.toThrow();
    });

    it('should throw SourceError when required field is missing', () => {
      const config = {
        sheetId: 'abc123'
        // missing 'range'
      };
      const requiredFields = ['sheetId', 'range'];

      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).toThrow(SourceError);

      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).toThrow('Missing required configuration fields: range');
    });

    it('should throw SourceError with all missing fields listed', () => {
      const config = {
        sheetId: 'abc123'
      };
      const requiredFields = ['sheetId', 'range', 'tabName', 'hasHeaders'];

      try {
        strategy._validateConfig(config, requiredFields);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('range');
        expect(error.message).toContain('tabName');
        expect(error.message).toContain('hasHeaders');
        expect(error.code).toBe('MISSING_CONFIG_FIELDS');
      }
    });

    it('should include missing fields in error context', () => {
      const config = { field1: 'value' };
      const requiredFields = ['field1', 'field2', 'field3'];

      try {
        strategy._validateConfig(config, requiredFields);
        fail('Should have thrown SourceError');
      } catch (error) {
        expect(error.context).toHaveProperty('missingFields');
        expect(error.context.missingFields).toEqual(['field2', 'field3']);
        expect(error.context).toHaveProperty('providedConfig', config);
      }
    });

    it('should treat empty string as missing field', () => {
      const config = {
        sheetId: '',
        range: 'A1:Z'
      };
      const requiredFields = ['sheetId', 'range'];

      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).toThrow('Missing required configuration fields: sheetId');
    });

    it('should treat null as missing field', () => {
      const config = {
        sheetId: null,
        range: 'A1:Z'
      };
      const requiredFields = ['sheetId', 'range'];

      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).toThrow('Missing required configuration fields: sheetId');
    });

    it('should treat undefined as missing field', () => {
      const config = {
        sheetId: undefined,
        range: 'A1:Z'
      };
      const requiredFields = ['sheetId', 'range'];

      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).toThrow('Missing required configuration fields: sheetId');
    });

    it('should treat 0 as missing field (falsy value)', () => {
      const config = {
        index: 0,
        count: 10
      };
      const requiredFields = ['index', 'count'];

      // Note: Implementation uses !config[field], so 0 is treated as missing
      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).toThrow('Missing required configuration fields: index');
    });

    it('should treat false as missing field (falsy value)', () => {
      const config = {
        hasHeaders: false,
        mergeData: true
      };
      const requiredFields = ['hasHeaders', 'mergeData'];

      // Note: Implementation uses !config[field], so false is treated as missing
      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).toThrow('Missing required configuration fields: hasHeaders');
    });

    it('should accept truthy values', () => {
      const config = {
        count: 10,
        enabled: true,
        name: 'test',
        items: [1, 2, 3],
        settings: { key: 'value' }
      };
      const requiredFields = ['count', 'enabled', 'name', 'items', 'settings'];

      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).not.toThrow();
    });

    it('should handle empty required fields array', () => {
      const config = { anyField: 'value' };
      const requiredFields = [];

      expect(() => {
        strategy._validateConfig(config, requiredFields);
      }).not.toThrow();
    });
  });

  // ===================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('should work end-to-end with realistic data', () => {
      const strategy = new TestSourceStrategy(mockLogger, () => {
        // Simulates real extraction returning 2D array
        return [
          { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
        ];
      });

      const config = {
        sheetId: 'abc123',
        range: 'A1:C10'
      };

      const result = strategy.extract(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('firstName', 'John');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should support method chaining pattern', () => {
      const strategy = new TestSourceStrategy(mockLogger);

      // Validate config, then extract
      expect(() => {
        strategy._validateConfig({ sheetId: 'abc' }, ['sheetId']);
        const result = strategy.extract({});
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    it('should handle complex nested errors gracefully', () => {
      const strategy = new TestSourceStrategy(mockLogger, () => {
        throw new Error('Network timeout');
      });

      try {
        strategy.extract({ source: 'external' });
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError);
        expect(error.message).toContain('Network timeout');
        expect(error.context.config).toEqual({ source: 'external' });
      }
    });
  });
});
