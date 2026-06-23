// ===================================================================
// FILE: ContextEngine/src/__tests__/PostProcessor.test.js
// ===================================================================
// Test Suite for PostProcessor
//
// Pattern: Logic Library Testing
// - Unit testing with FakeLogger injection
// - Tests post-processing transformations
// - Tests registration and pipeline execution
// ===================================================================

import { PostProcessor } from '../PostProcessor';
import { MockFactory } from '../../../test/fakes/MockFactory';

describe('PostProcessor', () => {
  let logger;
  let processor;

  beforeEach(() => {
    logger = MockFactory.createJestLogger();
    processor = new PostProcessor(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // CONSTRUCTOR VALIDATION TESTS
  // ===================================================================

  describe('Constructor', () => {
    it('should create an instance with valid logger', () => {
      expect(processor).toBeDefined();
      expect(processor.logger).toBe(logger);
    });

    it('should throw error if logger is not provided', () => {
      expect(() => new PostProcessor()).toThrow(
        'PostProcessor: logger is required and must be an object'
      );
    });

    it('should throw error if logger is not an object', () => {
      expect(() => new PostProcessor('not an object')).toThrow(
        'PostProcessor: logger is required and must be an object'
      );
    });

    it('should throw error if logger is missing debug method', () => {
      const badLogger = { info: () => {}, warn: () => {}, error: () => {} };
      expect(() => new PostProcessor(badLogger)).toThrow(
        'PostProcessor: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if logger is missing info method', () => {
      const badLogger = { debug: () => {}, warn: () => {}, error: () => {} };
      expect(() => new PostProcessor(badLogger)).toThrow(
        'PostProcessor: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if logger is missing warn method', () => {
      const badLogger = { debug: () => {}, info: () => {}, error: () => {} };
      expect(() => new PostProcessor(badLogger)).toThrow(
        'PostProcessor: logger must have debug, info, warn, and error methods'
      );
    });

    it('should throw error if logger is missing error method', () => {
      const badLogger = { debug: () => {}, info: () => {}, warn: () => {} };
      expect(() => new PostProcessor(badLogger)).toThrow(
        'PostProcessor: logger must have debug, info, warn, and error methods'
      );
    });

    it('should register built-in processors on construction', () => {
      expect(processor.has('filterFields')).toBe(true);
      expect(processor.has('mapValues')).toBe(true);
      expect(processor.has('renameFields')).toBe(true);
      expect(processor.has('defaultValues')).toBe(true);
    });
  });

  // ===================================================================
  // BUILT-IN PROCESSOR: filterFields
  // ===================================================================

  describe('Built-in Processor: filterFields', () => {
    it('should filter fields from array of objects', () => {
      const data = [
        { name: 'Alice', age: 30, email: 'alice@example.com', password: 'secret' },
        { name: 'Bob', age: 25, email: 'bob@example.com', password: 'secret' }
      ];

      const result = processor.process([{ type: 'filterFields', fields: ['name', 'email'] }], data);

      expect(result).toEqual([
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
      ]);
    });

    it('should filter fields from single object', () => {
      const data = { name: 'Alice', age: 30, email: 'alice@example.com', password: 'secret' };

      const result = processor.process([{ type: 'filterFields', fields: ['name', 'email'] }], data);

      expect(result).toEqual({ name: 'Alice', email: 'alice@example.com' });
    });

    it('should handle non-existent fields gracefully', () => {
      const data = { name: 'Alice', age: 30 };

      const result = processor.process(
        [{ type: 'filterFields', fields: ['name', 'nonexistent'] }],
        data
      );

      expect(result).toEqual({ name: 'Alice' });
    });

    it('should return non-object data unchanged', () => {
      const result = processor.process([{ type: 'filterFields', fields: ['name'] }], 'string data');

      expect(result).toBe('string data');
    });

    it('should throw error if fields config is missing', () => {
      const data = { name: 'Alice' };

      expect(() => processor.process([{ type: 'filterFields' }], data)).toThrow(
        'filterFields requires a "fields" array in config'
      );
    });

    it('should throw error if fields is not an array', () => {
      const data = { name: 'Alice' };

      expect(() =>
        processor.process([{ type: 'filterFields', fields: 'not an array' }], data)
      ).toThrow('filterFields requires a "fields" array in config');
    });

    it('should handle empty fields array', () => {
      const data = { name: 'Alice', age: 30 };

      const result = processor.process([{ type: 'filterFields', fields: [] }], data);

      expect(result).toEqual({});
    });
  });

  // ===================================================================
  // BUILT-IN PROCESSOR: mapValues
  // ===================================================================

  describe('Built-in Processor: mapValues', () => {
    it('should map values in array of objects', () => {
      const data = [
        { status: 'A', priority: 1 },
        { status: 'I', priority: 2 }
      ];

      const result = processor.process(
        [
          {
            type: 'mapValues',
            mapping: { A: 'Active', I: 'Inactive', 1: 'High', 2: 'Low' }
          }
        ],
        data
      );

      expect(result).toEqual([
        { status: 'Active', priority: 'High' },
        { status: 'Inactive', priority: 'Low' }
      ]);
    });

    it('should map values in single object wrapped in array', () => {
      // mapValues works on objects inside arrays, not single objects
      const data = [{ status: 'A', priority: 1 }];

      const result = processor.process(
        [
          {
            type: 'mapValues',
            mapping: { A: 'Active', 1: 'High' }
          }
        ],
        data
      );

      expect(result).toEqual([{ status: 'Active', priority: 'High' }]);
    });

    it('should map primitive values in array', () => {
      const data = ['A', 'B', 'C'];

      const result = processor.process(
        [
          {
            type: 'mapValues',
            mapping: { A: 'Alpha', B: 'Beta', C: 'Gamma' }
          }
        ],
        data
      );

      expect(result).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('should map single primitive value', () => {
      const result = processor.process(
        [
          {
            type: 'mapValues',
            mapping: { A: 'Alpha' }
          }
        ],
        'A'
      );

      expect(result).toBe('Alpha');
    });

    it('should leave unmapped values unchanged', () => {
      // mapValues works on objects inside arrays
      const data = [{ status: 'A', priority: 999 }];

      const result = processor.process(
        [
          {
            type: 'mapValues',
            mapping: { A: 'Active' }
          }
        ],
        data
      );

      expect(result).toEqual([{ status: 'Active', priority: 999 }]);
    });

    it('should throw error if mapping config is missing', () => {
      expect(() => processor.process([{ type: 'mapValues' }], { status: 'A' })).toThrow(
        'mapValues requires a "mapping" object in config'
      );
    });

    it('should throw error if mapping is not an object', () => {
      expect(() =>
        processor.process([{ type: 'mapValues', mapping: 'not an object' }], { status: 'A' })
      ).toThrow('mapValues requires a "mapping" object in config');
    });

    it('should handle null values in objects', () => {
      // mapValues works on objects inside arrays
      const data = [{ status: null, priority: 1 }];

      const result = processor.process(
        [
          {
            type: 'mapValues',
            mapping: { 1: 'High' }
          }
        ],
        data
      );

      expect(result).toEqual([{ status: null, priority: 'High' }]);
    });
  });

  // ===================================================================
  // BUILT-IN PROCESSOR: renameFields
  // ===================================================================

  describe('Built-in Processor: renameFields', () => {
    it('should rename fields in array of objects', () => {
      const data = [
        { old_name: 'Alice', old_email: 'alice@example.com' },
        { old_name: 'Bob', old_email: 'bob@example.com' }
      ];

      const result = processor.process(
        [
          {
            type: 'renameFields',
            mapping: { old_name: 'name', old_email: 'email' }
          }
        ],
        data
      );

      expect(result).toEqual([
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
      ]);
    });

    it('should rename fields in single object', () => {
      const data = { old_name: 'Alice', old_email: 'alice@example.com' };

      const result = processor.process(
        [
          {
            type: 'renameFields',
            mapping: { old_name: 'name', old_email: 'email' }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', email: 'alice@example.com' });
    });

    it('should keep fields with no mapping unchanged', () => {
      const data = { old_name: 'Alice', age: 30, email: 'alice@example.com' };

      const result = processor.process(
        [
          {
            type: 'renameFields',
            mapping: { old_name: 'name' }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', age: 30, email: 'alice@example.com' });
    });

    it('should return non-object data unchanged', () => {
      const result = processor.process(
        [
          {
            type: 'renameFields',
            mapping: { old: 'new' }
          }
        ],
        'string data'
      );

      expect(result).toBe('string data');
    });

    it('should return primitive array items unchanged', () => {
      const data = ['Alice', 'Bob'];

      const result = processor.process(
        [
          {
            type: 'renameFields',
            mapping: { old: 'new' }
          }
        ],
        data
      );

      expect(result).toEqual(['Alice', 'Bob']);
    });

    it('should throw error if mapping config is missing', () => {
      expect(() => processor.process([{ type: 'renameFields' }], { old_name: 'Alice' })).toThrow(
        'renameFields requires a "mapping" object in config'
      );
    });

    it('should throw error if mapping is not an object', () => {
      expect(() =>
        processor.process([{ type: 'renameFields', mapping: 'not an object' }], {
          old_name: 'Alice'
        })
      ).toThrow('renameFields requires a "mapping" object in config');
    });
  });

  // ===================================================================
  // BUILT-IN PROCESSOR: defaultValues
  // ===================================================================

  describe('Built-in Processor: defaultValues', () => {
    it('should apply default values to array of objects', () => {
      const data = [{ name: 'Alice' }, { name: 'Bob', email: 'bob@example.com' }];

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { email: 'unknown@example.com', status: 'active' }
          }
        ],
        data
      );

      expect(result).toEqual([
        { name: 'Alice', email: 'unknown@example.com', status: 'active' },
        { name: 'Bob', email: 'bob@example.com', status: 'active' }
      ]);
    });

    it('should apply default values to single object', () => {
      const data = { name: 'Alice' };

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { email: 'unknown@example.com', status: 'active' }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', email: 'unknown@example.com', status: 'active' });
    });

    it('should replace null values with defaults', () => {
      const data = { name: 'Alice', email: null };

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { email: 'unknown@example.com' }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', email: 'unknown@example.com' });
    });

    it('should replace undefined values with defaults', () => {
      const data = { name: 'Alice', email: undefined };

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { email: 'unknown@example.com' }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', email: 'unknown@example.com' });
    });

    it('should not replace existing values', () => {
      const data = { name: 'Alice', email: 'alice@example.com' };

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { email: 'unknown@example.com' }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', email: 'alice@example.com' });
    });

    it('should not replace empty strings', () => {
      const data = { name: 'Alice', email: '' };

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { email: 'unknown@example.com' }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', email: '' });
    });

    it('should not replace zero values', () => {
      const data = { name: 'Alice', age: 0 };

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { age: 30 }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', age: 0 });
    });

    it('should not replace false values', () => {
      const data = { name: 'Alice', active: false };

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { active: true }
          }
        ],
        data
      );

      expect(result).toEqual({ name: 'Alice', active: false });
    });

    it('should return non-object data unchanged', () => {
      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { email: 'default@example.com' }
          }
        ],
        'string data'
      );

      expect(result).toBe('string data');
    });

    it('should return primitive array items unchanged', () => {
      const data = ['Alice', 'Bob'];

      const result = processor.process(
        [
          {
            type: 'defaultValues',
            defaults: { email: 'default@example.com' }
          }
        ],
        data
      );

      expect(result).toEqual(['Alice', 'Bob']);
    });

    it('should throw error if defaults config is missing', () => {
      expect(() => processor.process([{ type: 'defaultValues' }], { name: 'Alice' })).toThrow(
        'defaultValues requires a "defaults" object in config'
      );
    });

    it('should throw error if defaults is not an object', () => {
      expect(() =>
        processor.process([{ type: 'defaultValues', defaults: 'not an object' }], { name: 'Alice' })
      ).toThrow('defaultValues requires a "defaults" object in config');
    });
  });

  // ===================================================================
  // REGISTER METHOD TESTS
  // ===================================================================

  describe('register() Method', () => {
    it('should register a custom processor', () => {
      const customProcessor = (data) => data.toUpperCase();

      const result = processor.register('uppercase', customProcessor);

      expect(result).toBe(processor); // Should return this for chaining
      expect(processor.has('uppercase')).toBe(true);
    });

    it('should allow method chaining', () => {
      const custom1 = (data) => data;
      const custom2 = (data) => data;

      processor.register('custom1', custom1).register('custom2', custom2);

      expect(processor.has('custom1')).toBe(true);
      expect(processor.has('custom2')).toBe(true);
    });

    it('should log registration', () => {
      const customProcessor = (data) => data;
      processor.register('custom', customProcessor);

      expect(logger.getLogsByLevel('DEBUG').length).toBeGreaterThan(0);
      expect(logger.getLogsMatching(/custom/).length).toBeGreaterThan(0);
    });

    it('should throw error if type is not a string', () => {
      expect(() => processor.register(123, () => {})).toThrow(
        'PostProcessor.register: type is required and must be a non-empty string'
      );
    });

    it('should throw error if type is empty', () => {
      expect(() => processor.register('', () => {})).toThrow(
        'PostProcessor.register: type is required and must be a non-empty string'
      );
    });

    it('should throw error if processorFunc is not a function', () => {
      expect(() => processor.register('custom', 'not a function')).toThrow(
        'PostProcessor.register: processorFunc is required and must be a function'
      );
    });

    it('should allow overriding existing processors', () => {
      const custom1 = (data) => 'first';
      const custom2 = (data) => 'second';

      processor.register('custom', custom1);
      processor.register('custom', custom2);

      const result = processor.process([{ type: 'custom' }], 'data');
      expect(result).toBe('second');
    });
  });

  // ===================================================================
  // HAS METHOD TESTS
  // ===================================================================

  describe('has() Method', () => {
    it('should return true for registered processors', () => {
      expect(processor.has('filterFields')).toBe(true);
      expect(processor.has('mapValues')).toBe(true);
      expect(processor.has('renameFields')).toBe(true);
      expect(processor.has('defaultValues')).toBe(true);
    });

    it('should return false for unregistered processors', () => {
      expect(processor.has('nonexistent')).toBe(false);
      expect(processor.has('unknown')).toBe(false);
    });

    it('should return false for invalid type (non-string)', () => {
      expect(processor.has(null)).toBe(false);
      expect(processor.has(undefined)).toBe(false);
      expect(processor.has(123)).toBe(false);
      expect(processor.has({})).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(processor.has('')).toBe(false);
    });

    it('should return true for custom registered processor', () => {
      processor.register('custom', (data) => data);
      expect(processor.has('custom')).toBe(true);
    });
  });

  // ===================================================================
  // PROCESS METHOD TESTS
  // ===================================================================

  describe('process() Method', () => {
    it('should process data through single processor', () => {
      const data = { name: 'Alice', age: 30, password: 'secret' };

      const result = processor.process([{ type: 'filterFields', fields: ['name', 'age'] }], data);

      expect(result).toEqual({ name: 'Alice', age: 30 });
    });

    it('should process data through pipeline of processors', () => {
      const data = [
        { old_name: 'Alice', age: null },
        { old_name: 'Bob', age: 25 }
      ];

      const result = processor.process(
        [
          { type: 'renameFields', mapping: { old_name: 'name' } },
          { type: 'defaultValues', defaults: { age: 0, status: 'active' } },
          { type: 'filterFields', fields: ['name', 'status'] }
        ],
        data
      );

      expect(result).toEqual([
        { name: 'Alice', status: 'active' },
        { name: 'Bob', status: 'active' }
      ]);
    });

    it('should return original data for empty processor configs', () => {
      const data = { name: 'Alice' };

      const result = processor.process([], data);

      expect(result).toEqual(data);
    });

    it('should log processor application', () => {
      const data = { name: 'Alice', age: 30 };

      processor.process([{ type: 'filterFields', fields: ['name'] }], data, 'TestProvider');

      expect(logger.getLogsByLevel('DEBUG').length).toBeGreaterThan(0);
      expect(logger.getLogsMatching(/TestProvider/).length).toBeGreaterThan(0);
    });

    it('should work without provider name', () => {
      const data = { name: 'Alice', age: 30 };

      const result = processor.process([{ type: 'filterFields', fields: ['name'] }], data);

      expect(result).toEqual({ name: 'Alice' });
    });

    it('should throw error if processorConfigs is not an array', () => {
      expect(() => processor.process(null, {})).toThrow(
        'PostProcessor.process: processorConfigs is required and must be an array'
      );
      expect(() => processor.process('not array', {})).toThrow(
        'PostProcessor.process: processorConfigs is required and must be an array'
      );
      expect(() => processor.process({}, {})).toThrow(
        'PostProcessor.process: processorConfigs is required and must be an array'
      );
    });

    it('should throw error if config is not an object', () => {
      expect(() => processor.process(['not an object'], {})).toThrow(
        'PostProcessor.process: Config at index 0 must be an object'
      );
      expect(() => processor.process([null], {})).toThrow(
        'PostProcessor.process: Config at index 0 must be an object'
      );
    });

    it('should throw error if config has no type', () => {
      expect(() => processor.process([{}], {})).toThrow(
        "PostProcessor.process: Config at index 0 must have a 'type' string"
      );
      expect(() => processor.process([{ type: null }], {})).toThrow(
        "PostProcessor.process: Config at index 0 must have a 'type' string"
      );
      expect(() => processor.process([{ type: 123 }], {})).toThrow(
        "PostProcessor.process: Config at index 0 must have a 'type' string"
      );
    });

    it('should throw error for unknown processor type', () => {
      expect(() => processor.process([{ type: 'unknownProcessor' }], {})).toThrow(
        "PostProcessor.process: Unknown processor type 'unknownProcessor'"
      );
    });

    it('should handle processor errors gracefully', () => {
      processor.register('throwing', () => {
        throw new Error('Test error');
      });

      expect(() => processor.process([{ type: 'throwing' }], {})).toThrow(
        "PostProcessor 'throwing' failed: Test error"
      );

      expect(logger.getLogsByLevel('ERROR').length).toBeGreaterThan(0);
    });

    it('should process with custom registered processor', () => {
      processor.register('double', (data) => data * 2);

      const result = processor.process([{ type: 'double' }], 5);

      expect(result).toBe(10);
    });
  });

  // ===================================================================
  // GETREGISTEREDTYPES METHOD TESTS
  // ===================================================================

  describe('getRegisteredTypes() Method', () => {
    it('should return array of built-in processor types', () => {
      const types = processor.getRegisteredTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('filterFields');
      expect(types).toContain('mapValues');
      expect(types).toContain('renameFields');
      expect(types).toContain('defaultValues');
    });

    it('should return all 4 built-in processors', () => {
      const types = processor.getRegisteredTypes();

      expect(types.length).toBe(4);
    });

    it('should include custom registered processors', () => {
      processor.register('custom1', (data) => data);
      processor.register('custom2', (data) => data);

      const types = processor.getRegisteredTypes();

      expect(types).toContain('custom1');
      expect(types).toContain('custom2');
      expect(types.length).toBe(6); // 4 built-in + 2 custom
    });

    it('should not include duplicates for overridden processors', () => {
      processor.register('filterFields', (data) => data); // Override built-in

      const types = processor.getRegisteredTypes();

      const filterFieldsCount = types.filter((t) => t === 'filterFields').length;
      expect(filterFieldsCount).toBe(1);
    });
  });

  // ===================================================================
  // INTEGRATION TESTS
  // ===================================================================

  describe('Integration Tests', () => {
    it('should handle complex transformation pipeline', () => {
      const data = [
        { user_id: 1, user_name: 'Alice', user_status: 'A', age: null, internal_id: 'x123' },
        { user_id: 2, user_name: 'Bob', user_status: 'I', age: 25, internal_id: 'y456' },
        { user_id: 3, user_name: 'Charlie', user_status: 'A', age: 35, internal_id: 'z789' }
      ];

      const result = processor.process(
        [
          // 1. Rename fields
          {
            type: 'renameFields',
            mapping: {
              user_id: 'id',
              user_name: 'name',
              user_status: 'status'
            }
          },
          // 2. Map status codes
          {
            type: 'mapValues',
            mapping: {
              A: 'Active',
              I: 'Inactive'
            }
          },
          // 3. Apply defaults
          {
            type: 'defaultValues',
            defaults: {
              age: 0,
              department: 'Unknown'
            }
          },
          // 4. Filter to only needed fields
          {
            type: 'filterFields',
            fields: ['id', 'name', 'status', 'department']
          }
        ],
        data
      );

      expect(result).toEqual([
        { id: 1, name: 'Alice', status: 'Active', department: 'Unknown' },
        { id: 2, name: 'Bob', status: 'Inactive', department: 'Unknown' },
        { id: 3, name: 'Charlie', status: 'Active', department: 'Unknown' }
      ]);
    });

    it('should handle empty data', () => {
      const result = processor.process([{ type: 'filterFields', fields: ['name'] }], []);

      expect(result).toEqual([]);
    });

    it('should handle null data', () => {
      const result = processor.process([{ type: 'filterFields', fields: ['name'] }], null);

      expect(result).toBe(null);
    });

    it('should preserve data types through pipeline', () => {
      const data = {
        name: 'Alice',
        age: 30,
        active: true,
        score: 95.5,
        tags: ['developer', 'manager']
      };

      const result = processor.process(
        [{ type: 'filterFields', fields: ['name', 'age', 'active', 'score', 'tags'] }],
        data
      );

      expect(typeof result.name).toBe('string');
      expect(typeof result.age).toBe('number');
      expect(typeof result.active).toBe('boolean');
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.tags)).toBe(true);
    });
  });
});
