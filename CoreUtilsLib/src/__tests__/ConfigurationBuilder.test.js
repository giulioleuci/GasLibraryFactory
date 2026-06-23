/**
 * @file CoreUtilsLib/src/__tests__/ConfigurationBuilder.test.js
 * @description Unit tests for ConfigurationBuilder utilities.
 */

import { ConfigurationBuilder } from '../builders/ConfigurationBuilder.js';

describe('ConfigurationBuilder', () => {
  describe('mergeWithDefaults', () => {
    it('should return cloned defaults when provided is null', () => {
      const defaults = { a: 1, b: { c: 2 } };
      const result = ConfigurationBuilder.mergeWithDefaults(null, defaults);

      expect(result).toEqual(defaults);
      expect(result).not.toBe(defaults);
      expect(result.b).not.toBe(defaults.b);
    });

    it('should return cloned defaults when provided is undefined', () => {
      const defaults = { a: 1, b: 2 };
      const result = ConfigurationBuilder.mergeWithDefaults(undefined, defaults);

      expect(result).toEqual(defaults);
      expect(result).not.toBe(defaults);
    });

    it('should merge provided values with defaults', () => {
      const defaults = { a: 1, b: 2, c: 3 };
      const provided = { b: 20 };
      const result = ConfigurationBuilder.mergeWithDefaults(provided, defaults);

      expect(result).toEqual({ a: 1, b: 20, c: 3 });
    });

    it('should deep merge nested objects', () => {
      const defaults = {
        retry: { maxAttempts: 3, delay: 1000 },
        logging: { level: 'INFO', enabled: true }
      };
      const provided = {
        retry: { maxAttempts: 5 }
      };

      const result = ConfigurationBuilder.mergeWithDefaults(provided, defaults);

      expect(result).toEqual({
        retry: { maxAttempts: 5, delay: 1000 },
        logging: { level: 'INFO', enabled: true }
      });
    });

    it('should not mutate original objects', () => {
      const defaults = { a: 1, nested: { b: 2 } };
      const provided = { nested: { c: 3 } };

      ConfigurationBuilder.mergeWithDefaults(provided, defaults);

      expect(defaults).toEqual({ a: 1, nested: { b: 2 } });
      expect(provided).toEqual({ nested: { c: 3 } });
    });

    it('should handle empty objects', () => {
      const defaults = { a: 1 };
      const result = ConfigurationBuilder.mergeWithDefaults({}, defaults);

      expect(result).toEqual({ a: 1 });
    });
  });

  describe('normalizeOptions', () => {
    it('should apply defaults from schema', () => {
      const schema = {
        name: { default: 'unnamed', type: 'string' },
        count: { default: 0, type: 'number' },
        enabled: { default: true, type: 'boolean' }
      };

      const result = ConfigurationBuilder.normalizeOptions({}, schema);

      expect(result).toEqual({ name: 'unnamed', count: 0, enabled: true });
    });

    it('should coerce string to number', () => {
      const schema = {
        count: { default: 0, type: 'number' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ count: '5' }, schema);

      expect(result.count).toBe(5);
    });

    it('should coerce string to integer', () => {
      const schema = {
        count: { default: 0, type: 'integer' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ count: '10.9' }, schema);

      expect(result.count).toBe(10);
    });

    it('should coerce string "true" to boolean true', () => {
      const schema = {
        enabled: { default: false, type: 'boolean' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ enabled: 'true' }, schema);

      expect(result.enabled).toBe(true);
    });

    it('should coerce string "false" to boolean false', () => {
      const schema = {
        enabled: { default: true, type: 'boolean' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ enabled: 'false' }, schema);

      expect(result.enabled).toBe(false);
    });

    it('should coerce string "1" to boolean true', () => {
      const schema = {
        enabled: { default: false, type: 'boolean' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ enabled: '1' }, schema);

      expect(result.enabled).toBe(true);
    });

    it('should coerce string "0" to boolean false', () => {
      const schema = {
        enabled: { default: true, type: 'boolean' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ enabled: '0' }, schema);

      expect(result.enabled).toBe(false);
    });

    it('should coerce string "yes" to boolean true', () => {
      const schema = {
        enabled: { default: false, type: 'boolean' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ enabled: 'yes' }, schema);

      expect(result.enabled).toBe(true);
    });

    it('should coerce string "no" to boolean false', () => {
      const schema = {
        enabled: { default: true, type: 'boolean' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ enabled: 'no' }, schema);

      expect(result.enabled).toBe(false);
    });

    it('should keep boolean values as-is', () => {
      const schema = {
        enabled: { default: false, type: 'boolean' }
      };

      expect(ConfigurationBuilder.normalizeOptions({ enabled: true }, schema).enabled).toBe(true);
      expect(ConfigurationBuilder.normalizeOptions({ enabled: false }, schema).enabled).toBe(false);
    });

    it('should coerce non-standard strings to boolean using Boolean()', () => {
      const schema = {
        enabled: { default: false, type: 'boolean' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ enabled: 'other' }, schema);

      expect(result.enabled).toBe(true); // Boolean('other') = true
    });

    it('should coerce value to string', () => {
      const schema = {
        name: { default: '', type: 'string' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ name: 123 }, schema);

      expect(result.name).toBe('123');
    });

    it('should wrap non-array into array', () => {
      const schema = {
        items: { default: [], type: 'array' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ items: 'single' }, schema);

      expect(result.items).toEqual(['single']);
    });

    it('should keep arrays as-is', () => {
      const schema = {
        items: { default: [], type: 'array' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ items: [1, 2, 3] }, schema);

      expect(result.items).toEqual([1, 2, 3]);
    });

    it('should keep objects as-is', () => {
      const schema = {
        config: { default: {}, type: 'object' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ config: { a: 1 } }, schema);

      expect(result.config).toEqual({ a: 1 });
    });

    it('should parse JSON string to object', () => {
      const schema = {
        config: { default: {}, type: 'object' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ config: '{"a":1}' }, schema);

      expect(result.config).toEqual({ a: 1 });
    });

    it('should throw for invalid JSON when type is object', () => {
      const schema = {
        config: { default: {}, type: 'object' }
      };

      expect(() => {
        ConfigurationBuilder.normalizeOptions({ config: 'invalid json' }, schema);
      }).toThrow('must be a valid JSON object');
    });

    it('should throw for non-object value when type is object', () => {
      const schema = {
        config: { default: {}, type: 'object' }
      };

      expect(() => {
        ConfigurationBuilder.normalizeOptions({ config: 123 }, schema);
      }).toThrow('must be an object');
    });

    it('should throw for invalid number', () => {
      const schema = {
        count: { default: 0, type: 'number' }
      };

      expect(() => {
        ConfigurationBuilder.normalizeOptions({ count: 'not-a-number' }, schema);
      }).toThrow('must be a valid number');
    });

    it('should throw for invalid integer', () => {
      const schema = {
        count: { default: 0, type: 'integer' }
      };

      expect(() => {
        ConfigurationBuilder.normalizeOptions({ count: 'not-an-int' }, schema);
      }).toThrow('must be a valid integer');
    });

    it('should apply transform function', () => {
      const schema = {
        name: { default: '', type: 'string', transform: (v) => v.toUpperCase() }
      };

      const result = ConfigurationBuilder.normalizeOptions({ name: 'hello' }, schema);

      expect(result.name).toBe('HELLO');
    });

    it('should handle null options', () => {
      const schema = {
        name: { default: 'default', type: 'string' }
      };

      const result = ConfigurationBuilder.normalizeOptions(null, schema);

      expect(result).toEqual({ name: 'default' });
    });

    it('should skip coercion for null values', () => {
      const schema = {
        name: { default: null, type: 'string' }
      };

      const result = ConfigurationBuilder.normalizeOptions({}, schema);

      expect(result.name).toBeNull();
    });

    it('should skip coercion for undefined values', () => {
      const schema = {
        name: { default: undefined, type: 'string' }
      };

      const result = ConfigurationBuilder.normalizeOptions({}, schema);

      expect(result.name).toBeUndefined();
    });

    it('should return value as-is for unknown type', () => {
      const schema = {
        data: { default: null, type: 'unknown_type' }
      };

      const result = ConfigurationBuilder.normalizeOptions({ data: 'test' }, schema);

      expect(result.data).toBe('test');
    });

    it('should use custom context in error messages', () => {
      const schema = {
        count: { default: 0, type: 'number' }
      };

      expect(() => {
        ConfigurationBuilder.normalizeOptions({ count: 'bad' }, schema, 'MyService');
      }).toThrow('MyService: count must be a valid number');
    });
  });

  describe('validateConfiguration', () => {
    it('should return valid for correct configuration', () => {
      const config = { name: 'server', port: 3000 };
      const rules = {
        name: { required: true, type: 'string' },
        port: { required: true, type: 'number' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing required fields', () => {
      const config = { name: 'server' };
      const rules = {
        name: { required: true },
        port: { required: true }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('port is required');
    });

    it('should detect null required fields', () => {
      const config = { name: null };
      const rules = {
        name: { required: true }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should skip validation for optional undefined fields', () => {
      const config = {};
      const rules = {
        name: { type: 'string' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(true);
    });

    it('should detect type mismatches - string', () => {
      const config = { name: 123 };
      const rules = {
        name: { type: 'string' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name must be of type string');
    });

    it('should detect type mismatches - number', () => {
      const config = { count: 'not a number' };
      const rules = {
        count: { type: 'number' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('count must be of type number');
    });

    it('should detect type mismatches - integer', () => {
      const config = { count: 3.14 };
      const rules = {
        count: { type: 'integer' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('count must be of type integer');
    });

    it('should detect type mismatches - boolean', () => {
      const config = { enabled: 'yes' };
      const rules = {
        enabled: { type: 'boolean' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('enabled must be of type boolean');
    });

    it('should detect type mismatches - array', () => {
      const config = { items: 'not an array' };
      const rules = {
        items: { type: 'array' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('items must be of type array');
    });

    it('should detect type mismatches - object', () => {
      const config = { data: [1, 2, 3] };
      const rules = {
        data: { type: 'object' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('data must be of type object');
    });

    it('should detect type mismatches - function', () => {
      const config = { handler: 'not a function' };
      const rules = {
        handler: { type: 'function' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('handler must be of type function');
    });

    it('should validate valid function type', () => {
      const config = { handler: () => {} };
      const rules = {
        handler: { type: 'function' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(true);
    });

    it('should detect invalid enum values', () => {
      const config = { mode: 'invalid' };
      const rules = {
        mode: { enum: ['development', 'production', 'test'] }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("must be one of: 'development', 'production', 'test'");
    });

    it('should accept valid enum values', () => {
      const config = { mode: 'production' };
      const rules = {
        mode: { enum: ['development', 'production', 'test'] }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(true);
    });

    it('should detect value below minimum', () => {
      const config = { port: 0 };
      const rules = {
        port: { type: 'number', min: 1 }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('port must be >= 1');
    });

    it('should detect value above maximum', () => {
      const config = { port: 70000 };
      const rules = {
        port: { type: 'number', max: 65535 }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('port must be <= 65535');
    });

    it('should check min/max for integers', () => {
      const config = { count: 5 };
      const rules = {
        count: { type: 'integer', min: 10, max: 20 }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('count must be >= 10');
    });

    it('should detect string below minLength', () => {
      const config = { name: 'ab' };
      const rules = {
        name: { type: 'string', minLength: 3 }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name must have at least 3 characters');
    });

    it('should detect string above maxLength', () => {
      const config = { name: 'abcdef' };
      const rules = {
        name: { type: 'string', maxLength: 5 }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name must have at most 5 characters');
    });

    it('should detect pattern mismatch with RegExp', () => {
      const config = { code: 'abc' };
      const rules = {
        code: { pattern: /^[A-Z]{3}$/ }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must match pattern');
    });

    it('should detect pattern mismatch with string pattern', () => {
      const config = { code: 'abc' };
      const rules = {
        code: { pattern: '^[A-Z]{3}$' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must match pattern');
    });

    it('should accept value matching pattern', () => {
      const config = { code: 'ABC' };
      const rules = {
        code: { pattern: /^[A-Z]{3}$/ }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(true);
    });

    it('should call custom validator', () => {
      const config = { value: 5 };
      const rules = {
        value: {
          validator: (v) => (v % 2 === 0 ? null : 'must be even')
        }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('must be even');
    });

    it('should accept value passing custom validator', () => {
      const config = { value: 4 };
      const rules = {
        value: {
          validator: (v) => (v % 2 === 0 ? null : 'must be even')
        }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(true);
    });

    it('should handle null config', () => {
      const rules = {
        name: { required: true }
      };

      const result = ConfigurationBuilder.validateConfiguration(null, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should collect multiple errors', () => {
      const config = { name: '', port: -1 };
      const rules = {
        name: { type: 'string', minLength: 1 },
        port: { type: 'number', min: 1, max: 65535 }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
    });

    it('should validate NaN as invalid number', () => {
      const config = { count: NaN };
      const rules = {
        count: { type: 'number' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(false);
    });

    it('should pass type check for unknown types', () => {
      const config = { data: 'anything' };
      const rules = {
        data: { type: 'unknown_type' }
      };

      const result = ConfigurationBuilder.validateConfiguration(config, rules);

      expect(result.valid).toBe(true);
    });
  });

  describe('assertValid', () => {
    it('should not throw for valid configuration', () => {
      const config = { name: 'test' };
      const rules = { name: { required: true, type: 'string' } };

      expect(() => {
        ConfigurationBuilder.assertValid(config, rules);
      }).not.toThrow();
    });

    it('should throw for invalid configuration', () => {
      const config = { name: '' };
      const rules = { name: { required: true, type: 'string', minLength: 1 } };

      expect(() => {
        ConfigurationBuilder.assertValid(config, rules);
      }).toThrow('Configuration validation failed');
    });

    it('should include all errors in thrown message', () => {
      const config = {};
      const rules = {
        name: { required: true },
        port: { required: true }
      };

      expect(() => {
        ConfigurationBuilder.assertValid(config, rules);
      }).toThrow(/name is required[\s\S]*port is required/);
    });

    it('should include context in error message', () => {
      const config = {};
      const rules = { name: { required: true } };

      expect(() => {
        ConfigurationBuilder.assertValid(config, rules, 'MyService');
      }).toThrow('MyService: Configuration validation failed');
    });
  });

  describe('create (Fluent Builder)', () => {
    it('should create builder with defaults', () => {
      const config = ConfigurationBuilder.create({ a: 1, b: 2 }).build();

      expect(config).toEqual({ a: 1, b: 2 });
    });

    it('should create builder with empty defaults', () => {
      const config = ConfigurationBuilder.create().build();

      expect(config).toEqual({});
    });

    describe('set()', () => {
      it('should set a value', () => {
        const config = ConfigurationBuilder.create().set('name', 'test').build();

        expect(config.name).toBe('test');
      });

      it('should override existing value', () => {
        const config = ConfigurationBuilder.create({ name: 'old' }).set('name', 'new').build();

        expect(config.name).toBe('new');
      });

      it('should allow chaining', () => {
        const config = ConfigurationBuilder.create().set('a', 1).set('b', 2).set('c', 3).build();

        expect(config).toEqual({ a: 1, b: 2, c: 3 });
      });
    });

    describe('setIfDefined()', () => {
      it('should set defined value', () => {
        const config = ConfigurationBuilder.create().setIfDefined('name', 'test').build();

        expect(config.name).toBe('test');
      });

      it('should not set undefined value', () => {
        const config = ConfigurationBuilder.create({ name: 'default' })
          .setIfDefined('name', undefined)
          .build();

        expect(config.name).toBe('default');
      });

      it('should set null value (null is defined)', () => {
        const config = ConfigurationBuilder.create().setIfDefined('name', null).build();

        expect(config.name).toBeNull();
      });

      it('should set falsy values that are defined', () => {
        const config = ConfigurationBuilder.create()
          .setIfDefined('count', 0)
          .setIfDefined('name', '')
          .setIfDefined('enabled', false)
          .build();

        expect(config.count).toBe(0);
        expect(config.name).toBe('');
        expect(config.enabled).toBe(false);
      });
    });

    describe('setDefault()', () => {
      it('should set value if key does not exist', () => {
        const config = ConfigurationBuilder.create().setDefault('name', 'default').build();

        expect(config.name).toBe('default');
      });

      it('should not override existing key', () => {
        const config = ConfigurationBuilder.create({ name: 'existing' })
          .setDefault('name', 'default')
          .build();

        expect(config.name).toBe('existing');
      });

      it('should not override falsy existing values', () => {
        const config = ConfigurationBuilder.create({ count: 0, name: '', enabled: false })
          .setDefault('count', 10)
          .setDefault('name', 'default')
          .setDefault('enabled', true)
          .build();

        expect(config.count).toBe(0);
        expect(config.name).toBe('');
        expect(config.enabled).toBe(false);
      });
    });

    describe('merge()', () => {
      it('should merge additional configuration', () => {
        const config = ConfigurationBuilder.create({ a: 1 }).merge({ b: 2 }).build();

        expect(config).toEqual({ a: 1, b: 2 });
      });

      it('should deep merge nested objects', () => {
        const config = ConfigurationBuilder.create({ nested: { a: 1 } })
          .merge({ nested: { b: 2 } })
          .build();

        expect(config).toEqual({ nested: { a: 1, b: 2 } });
      });

      it('should override existing values', () => {
        const config = ConfigurationBuilder.create({ a: 1 }).merge({ a: 2 }).build();

        expect(config.a).toBe(2);
      });
    });

    describe('validate()', () => {
      it('should pass validation for valid config', () => {
        const rules = { name: { required: true, type: 'string' } };

        expect(() => {
          ConfigurationBuilder.create({ name: 'test' }).validate(rules).build();
        }).not.toThrow();
      });

      it('should throw for invalid config', () => {
        const rules = { name: { required: true } };

        expect(() => {
          ConfigurationBuilder.create().validate(rules).build();
        }).toThrow('Configuration validation failed');
      });

      it('should allow chaining after validation', () => {
        const rules = { name: { required: true } };

        const config = ConfigurationBuilder.create({ name: 'test' })
          .validate(rules)
          .set('extra', 'value')
          .build();

        expect(config.extra).toBe('value');
      });
    });

    describe('build()', () => {
      it('should return cloned configuration', () => {
        const builder = ConfigurationBuilder.create({ nested: { a: 1 } });
        const config1 = builder.build();
        const config2 = builder.build();

        expect(config1).toEqual(config2);
        expect(config1).not.toBe(config2);
        expect(config1.nested).not.toBe(config2.nested);
      });
    });

    describe('freeze()', () => {
      it('should return frozen configuration', () => {
        const config = ConfigurationBuilder.create({ a: 1, b: 2 }).freeze();

        expect(Object.isFrozen(config)).toBe(true);
      });

      it('should prevent modifications', () => {
        const config = ConfigurationBuilder.create({ a: 1 }).freeze();

        expect(() => {
          config.a = 2;
        }).toThrow();
      });

      it('should return cloned configuration before freezing', () => {
        const builder = ConfigurationBuilder.create({ nested: { a: 1 } });
        const config = builder.freeze();

        // Original can still be modified via builder
        builder.set('nested', { a: 2 });

        // Frozen config is unchanged
        expect(config.nested.a).toBe(1);
      });
    });
  });

  describe('_checkType (via validateConfiguration)', () => {
    it('should validate string type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration({ v: 'text' }, { v: { type: 'string' } }).valid
      ).toBe(true);
    });

    it('should validate number type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration({ v: 42 }, { v: { type: 'number' } }).valid
      ).toBe(true);
    });

    it('should validate integer type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration({ v: 42 }, { v: { type: 'integer' } }).valid
      ).toBe(true);
    });

    it('should reject float for integer type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration({ v: 3.14 }, { v: { type: 'integer' } }).valid
      ).toBe(false);
    });

    it('should validate boolean type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration({ v: true }, { v: { type: 'boolean' } }).valid
      ).toBe(true);
    });

    it('should validate array type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration({ v: [1, 2, 3] }, { v: { type: 'array' } }).valid
      ).toBe(true);
    });

    it('should validate object type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration({ v: { a: 1 } }, { v: { type: 'object' } }).valid
      ).toBe(true);
    });

    it('should reject array for object type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration({ v: [1, 2] }, { v: { type: 'object' } }).valid
      ).toBe(false);
    });

    it('should reject null for object type', () => {
      expect(
        ConfigurationBuilder.validateConfiguration(
          { v: null },
          { v: { required: true, type: 'object' } }
        ).valid
      ).toBe(false);
    });
  });
});
