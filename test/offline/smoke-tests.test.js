/**
 * Smoke Tests
 *
 * Verifies that key classes from the compiled bundle can be instantiated
 * and perform basic operations. These tests validate that the bundling,
 * transpilation, and GAS V8 post-processing did not break core functionality.
 *
 * IMPORTANT: These tests run against the COMPILED bundle, not source code.
 * All classes are accessed via `global.*` (populated by the bundle).
 */

const { loadBundle } = require('./helpers/load-bundle');

describe('Smoke Tests', () => {
  beforeAll(() => {
    loadBundle();
    if (!global.__bundleLoaded) {
      throw new Error(`Bundle not loaded: ${global.__bundleError}`);
    }
  });

  // ─── LoggerService ──────────────────────────────────────────────────

  describe('LoggerService', () => {
    it('should instantiate without errors', () => {
      expect(() => new global.LoggerService()).not.toThrow();
    });

    it('should have logging methods', () => {
      const logger = new global.LoggerService();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should log without throwing', () => {
      const logger = new global.LoggerService();
      expect(() => logger.info('test message')).not.toThrow();
      expect(() => logger.warn('test warning')).not.toThrow();
      expect(() => logger.error('test error')).not.toThrow();
      expect(() => logger.debug('test debug')).not.toThrow();
    });
  });

  // ─── TypeGuards ─────────────────────────────────────────────────────

  describe('TypeGuards', () => {
    it('should correctly identify strings', () => {
      expect(global.TypeGuards.isString('hello')).toBe(true);
      expect(global.TypeGuards.isString(123)).toBe(false);
      expect(global.TypeGuards.isString(null)).toBe(false);
    });

    it('should correctly identify non-empty strings', () => {
      expect(global.TypeGuards.isNonEmptyString('hello')).toBe(true);
      expect(global.TypeGuards.isNonEmptyString('')).toBe(false);
      expect(global.TypeGuards.isNonEmptyString(null)).toBe(false);
    });

    it('should correctly identify arrays', () => {
      expect(global.TypeGuards.isArray([1, 2, 3])).toBe(true);
      expect(global.TypeGuards.isArray([])).toBe(true);
      expect(global.TypeGuards.isArray('not array')).toBe(false);
    });

    it('should correctly identify plain objects', () => {
      expect(global.TypeGuards.isPlainObject({})).toBe(true);
      expect(global.TypeGuards.isPlainObject({ a: 1 })).toBe(true);
      expect(global.TypeGuards.isPlainObject(null)).toBe(false);
      expect(global.TypeGuards.isPlainObject([])).toBe(false);
    });

    it('should correctly identify numbers', () => {
      expect(global.TypeGuards.isFiniteNumber(42)).toBe(true);
      expect(global.TypeGuards.isFiniteNumber(NaN)).toBe(false);
      expect(global.TypeGuards.isPositiveInteger(5)).toBe(true);
      expect(global.TypeGuards.isPositiveInteger(-1)).toBe(false);
      expect(global.TypeGuards.isPositiveInteger(0)).toBe(false);
    });

    it('should correctly identify booleans', () => {
      expect(global.TypeGuards.isBoolean(true)).toBe(true);
      expect(global.TypeGuards.isBoolean(false)).toBe(true);
      expect(global.TypeGuards.isBoolean(0)).toBe(false);
    });

    it('should correctly identify functions', () => {
      expect(global.TypeGuards.isFunction(() => {})).toBe(true);
      expect(global.TypeGuards.isFunction('not a function')).toBe(false);
    });
  });

  // ─── Individual Type Guard functions ────────────────────────────────

  describe('Individual Type Guard functions', () => {
    it('isString should work as standalone function', () => {
      expect(global.isString('test')).toBe(true);
      expect(global.isString(42)).toBe(false);
    });

    it('isNonEmptyArray should work as standalone function', () => {
      expect(global.isNonEmptyArray([1])).toBe(true);
      expect(global.isNonEmptyArray([])).toBe(false);
    });

    it('isDefined should work as standalone function', () => {
      expect(global.isDefined('value')).toBe(true);
      expect(global.isDefined(null)).toBe(false);
      expect(global.isDefined(undefined)).toBe(false);
    });
  });

  // ─── HashUtils ──────────────────────────────────────────────────────

  describe('HashUtils', () => {
    it('should compute hash for string', () => {
      const hash = global.HashUtils.generateHash('hello');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce consistent hashes', () => {
      const hash1 = global.HashUtils.generateHash('test-input');
      const hash2 = global.HashUtils.generateHash('test-input');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = global.HashUtils.generateHash('input-a');
      const hash2 = global.HashUtils.generateHash('input-b');
      expect(hash1).not.toBe(hash2);
    });
  });

  // ─── TimeConstants ──────────────────────────────────────────────────

  describe('TimeConstants', () => {
    it('should have millisecond constants', () => {
      expect(global.TimeConstants.MILLIS_PER_SECOND).toBe(1000);
      expect(global.TimeConstants.MILLIS_PER_MINUTE).toBe(60000);
      expect(global.TimeConstants.MILLIS_PER_HOUR).toBe(3600000);
    });
  });

  // ─── BoundedMap ─────────────────────────────────────────────────────

  describe('BoundedMap', () => {
    it('should instantiate with a max size', () => {
      const map = new global.BoundedMap(3);
      expect(map).toBeDefined();
    });

    it('should store and retrieve values', () => {
      const map = new global.BoundedMap(10);
      map.set('key1', 'value1');
      expect(map.get('key1')).toBe('value1');
    });

    it('should respect size limit', () => {
      const map = new global.BoundedMap(2);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      expect(map.size).toBeLessThanOrEqual(2);
    });
  });

  // ─── Error classes ──────────────────────────────────────────────────

  describe('Error classes', () => {
    it('BaseError should be throwable', () => {
      expect(() => {
        throw new global.BaseError('test error');
      }).toThrow('test error');
    });

    it('BaseError should be an instance of Error', () => {
      const err = new global.BaseError('test');
      expect(err instanceof Error).toBe(true);
    });

    it('PipelineError should be throwable', () => {
      expect(() => {
        throw new global.PipelineError('pipeline failed');
      }).toThrow('pipeline failed');
    });
  });

  // ─── LodashFacade / es-toolkit utilities ────────────────────────────

  describe('es-toolkit utilities', () => {
    it('chunk should split arrays', () => {
      const result = global.chunk([1, 2, 3, 4, 5], 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('cloneDeep should deep clone objects', () => {
      const original = { a: { b: { c: 1 } } };
      const clone = global.cloneDeep(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.a).not.toBe(original.a);
    });

    it('merge should merge objects', () => {
      const result = global.merge({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('isEqual should compare values', () => {
      expect(global.isEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(global.isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('camelCase should convert strings', () => {
      expect(global.camelCase('hello world')).toBe('helloWorld');
    });

    it('kebabCase should convert strings', () => {
      expect(global.kebabCase('helloWorld')).toBe('hello-world');
    });

    it('groupBy should group array items', () => {
      const items = [
        { type: 'a', val: 1 },
        { type: 'b', val: 2 },
        { type: 'a', val: 3 }
      ];
      const result = global.groupBy(items, (item) => item.type);
      expect(Object.keys(result)).toContain('a');
      expect(Object.keys(result)).toContain('b');
      expect(result.a).toHaveLength(2);
    });

    it('uniq should remove duplicates', () => {
      expect(global.uniq([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });
  });

  // ─── RegexUtils ─────────────────────────────────────────────────────

  describe('RegexUtils', () => {
    it('should be available', () => {
      expect(global.RegexUtils).toBeDefined();
    });
  });

  // ─── PiiRedactor ────────────────────────────────────────────────────

  describe('PiiRedactor', () => {
    it('should instantiate', () => {
      expect(() => new global.PiiRedactor()).not.toThrow();
    });
  });

  // ─── GasOnlineTestFramework ─────────────────────────────────────────

  describe('GasOnlineTestFramework', () => {
    it('EnhancedTestRunner should instantiate', () => {
      const logger = new global.LoggerService();
      expect(() => new global.EnhancedTestRunner(logger)).not.toThrow();
    });

    it('SmartAssert should have assertion methods', () => {
      expect(typeof global.SmartAssert.equals).toBe('function');
      expect(typeof global.SmartAssert.isTrue).toBe('function');
      expect(typeof global.SmartAssert.isFalse).toBe('function');
    });

    it('SmartAssert.equals should work correctly', () => {
      expect(() => global.SmartAssert.equals(1, 1, 'should be equal')).not.toThrow();
      expect(() => global.SmartAssert.equals(1, 2, 'should fail')).toThrow();
    });

    it('SmartAssert.isTrue should work correctly', () => {
      expect(() => global.SmartAssert.isTrue(true, 'should be true')).not.toThrow();
      expect(() => global.SmartAssert.isTrue(false, 'should fail')).toThrow();
    });
  });

  // ─── ExpressionEngineService ────────────────────────────────────────

  describe('ExpressionEngineService', () => {
    it('should instantiate with logger', () => {
      const logger = new global.LoggerService();
      expect(() => new global.ExpressionEngineService({ logger })).not.toThrow();
    });
  });

  // ─── Enums and constants ────────────────────────────────────────────

  describe('Enums and constants', () => {
    it('WhenCondition should have expected values', () => {
      expect(global.WhenCondition).toBeDefined();
      expect(global.WhenCondition.ALWAYS).toBeDefined();
      expect(global.WhenCondition.ON_SUCCESS).toBeDefined();
      expect(global.WhenCondition.ON_ERROR).toBeDefined();
    });

    it('ProcessState should have expected values', () => {
      expect(global.ProcessState).toBeDefined();
    });

    it('StepState should have expected values', () => {
      expect(global.StepState).toBeDefined();
    });

    it('ScopeType should have expected values', () => {
      expect(global.ScopeType).toBeDefined();
    });

    it('ActorType should have expected values', () => {
      expect(global.ActorType).toBeDefined();
    });

    it('OutputFormat should have expected values', () => {
      expect(global.OutputFormat).toBeDefined();
    });
  });
});
