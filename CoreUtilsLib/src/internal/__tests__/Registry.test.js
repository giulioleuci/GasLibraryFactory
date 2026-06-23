/**
 * @file CoreUtilsLib/src/internal/__tests__/Registry.test.js
 * @description Unit tests for the generic Registry storage primitive.
 */

import { Registry } from '../Registry.js';

describe('Registry (generic storage primitive)', () => {
  let registry;

  beforeEach(() => {
    registry = new Registry({ entityName: 'widget' });
  });

  describe('register / get / has', () => {
    it('stores and retrieves a value', () => {
      registry.register('a', 1);
      expect(registry.get('a')).toBe(1);
      expect(registry.has('a')).toBe(true);
    });

    it('returns undefined for missing keys', () => {
      expect(registry.get('missing')).toBeUndefined();
      expect(registry.has('missing')).toBe(false);
    });

    it('reports whether an existing entry was overwritten', () => {
      expect(registry.register('a', 1)).toBe(false);
      expect(registry.register('a', 2)).toBe(true);
      expect(registry.get('a')).toBe(2);
    });

    it('throws on a non-string or empty key with the entity name', () => {
      expect(() => registry.register('', 1)).toThrow('widget key must be a non-empty string');
      expect(() => registry.register(null, 1)).toThrow('widget key must be a non-empty string');
      expect(() => registry.register(123, 1)).toThrow('widget key must be a non-empty string');
    });

    it('throws when overwrite is disabled and the key exists', () => {
      registry.register('a', 1);
      expect(() => registry.register('a', 2, { overwrite: false })).toThrow(
        "widget 'a' is already registered"
      );
    });
  });

  describe('validateValue hook', () => {
    it('runs the validator and propagates its error', () => {
      const r = new Registry({
        entityName: 'fn',
        validateValue: (value) => {
          if (typeof value !== 'function') {
            throw new Error('value must be a function');
          }
        }
      });
      expect(() => r.register('x', 5)).toThrow('value must be a function');
      const fn = () => {};
      expect(() => r.register('x', fn)).not.toThrow();
      expect(r.get('x')).toBe(fn);
    });
  });

  describe('logging', () => {
    it('logs a debug trace on registration when a logger is provided', () => {
      const logger = { debug: jest.fn() };
      const r = new Registry({ logger, entityName: 'thing' });
      r.register('k', 1);
      expect(logger.debug).toHaveBeenCalledWith("Registry: registered thing 'k'");
    });
  });

  describe('set (low-level)', () => {
    it('stores without validation or logging', () => {
      const logger = { debug: jest.fn() };
      const r = new Registry({ logger });
      expect(r.set('k', 1)).toBe(false);
      expect(r.set('k', 2)).toBe(true);
      expect(r.get('k')).toBe(2);
      expect(logger.debug).not.toHaveBeenCalled();
    });
  });

  describe('unregister / clear', () => {
    it('removes a single entry', () => {
      registry.register('a', 1);
      expect(registry.unregister('a')).toBe(true);
      expect(registry.unregister('a')).toBe(false);
      expect(registry.has('a')).toBe(false);
    });

    it('clears all entries', () => {
      registry.register('a', 1);
      registry.register('b', 2);
      registry.clear();
      expect(registry.size).toBe(0);
    });
  });

  describe('enumeration', () => {
    it('exposes keys, values, entries and size snapshots', () => {
      registry.register('a', 1);
      registry.register('b', 2);
      expect(registry.keys()).toEqual(['a', 'b']);
      expect(registry.values()).toEqual([1, 2]);
      expect(registry.entries()).toEqual([
        ['a', 1],
        ['b', 2]
      ]);
      expect(registry.size).toBe(2);
    });
  });
});
