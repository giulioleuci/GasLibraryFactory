// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/BoundedMap.test.js
// ===================================================================
// Comprehensive test suite for BoundedMap
// Coverage: 100% of all methods and properties
// ===================================================================

import { BoundedMap } from '../internal/BoundedMap';

describe('BoundedMap - Comprehensive Test Suite', () => {
  // ===================================================================
  // STATIC CONSTANTS
  // ===================================================================

  describe('Static Constants', () => {
    it('should have DEFAULT_MAX_SIZE of 1000', () => {
      expect(BoundedMap.DEFAULT_MAX_SIZE).toBe(1000);
    });
  });

  // ===================================================================
  // CONSTRUCTOR
  // ===================================================================

  describe('Constructor', () => {
    it('should create map with default max size', () => {
      const map = new BoundedMap();
      expect(map.maxSize).toBe(1000);
    });

    it('should create map with custom max size', () => {
      const map = new BoundedMap(500);
      expect(map.maxSize).toBe(500);
    });

    it('should create map with eviction callback', () => {
      const onEvict = jest.fn();
      const map = new BoundedMap(100, onEvict);
      expect(map.maxSize).toBe(100);
    });

    it('should throw for non-integer maxSize', () => {
      expect(() => new BoundedMap(3.14)).toThrow('maxSize must be a positive integer');
    });

    it('should throw for zero maxSize', () => {
      expect(() => new BoundedMap(0)).toThrow('maxSize must be a positive integer');
    });

    it('should throw for negative maxSize', () => {
      expect(() => new BoundedMap(-1)).toThrow('maxSize must be a positive integer');
    });

    it('should throw for non-number maxSize', () => {
      expect(() => new BoundedMap('100')).toThrow('maxSize must be a positive integer');
    });

    it('should throw for invalid onEvict (non-function)', () => {
      expect(() => new BoundedMap(100, 'not a function')).toThrow(
        'onEvict must be a function or null'
      );
    });

    it('should accept null onEvict', () => {
      expect(() => new BoundedMap(100, null)).not.toThrow();
    });

    it('should extend Map', () => {
      const map = new BoundedMap();
      expect(map).toBeInstanceOf(Map);
    });

    it('should initialize eviction count to 0', () => {
      const map = new BoundedMap();
      expect(map.evictionCount).toBe(0);
    });
  });

  // ===================================================================
  // GETTERS
  // ===================================================================

  describe('Getters', () => {
    describe('maxSize', () => {
      it('should return the maximum size', () => {
        const map = new BoundedMap(250);
        expect(map.maxSize).toBe(250);
      });
    });

    describe('evictionCount', () => {
      it('should track evictions', () => {
        const map = new BoundedMap(2);
        map.set('a', 1);
        map.set('b', 2);
        map.set('c', 3);

        expect(map.evictionCount).toBe(1);
      });
    });

    describe('isFull', () => {
      it('should return false when not full', () => {
        const map = new BoundedMap(5);
        map.set('a', 1);
        expect(map.isFull).toBe(false);
      });

      it('should return true when full', () => {
        const map = new BoundedMap(2);
        map.set('a', 1);
        map.set('b', 2);
        expect(map.isFull).toBe(true);
      });
    });

    describe('available', () => {
      it('should return available slots', () => {
        const map = new BoundedMap(5);
        map.set('a', 1);
        map.set('b', 2);
        expect(map.available).toBe(3);
      });

      it('should return 0 when full', () => {
        const map = new BoundedMap(2);
        map.set('a', 1);
        map.set('b', 2);
        expect(map.available).toBe(0);
      });
    });
  });

  // ===================================================================
  // set()
  // ===================================================================

  describe('set()', () => {
    it('should add entries', () => {
      const map = new BoundedMap(5);
      map.set('a', 1);
      expect(map.get('a')).toBe(1);
    });

    it('should update existing entries without eviction', () => {
      const onEvict = jest.fn();
      const map = new BoundedMap(2, onEvict);
      map.set('a', 1);
      map.set('a', 2);
      map.set('a', 3);

      expect(map.get('a')).toBe(3);
      expect(onEvict).not.toHaveBeenCalled();
    });

    it('should evict oldest entry when full', () => {
      const map = new BoundedMap(2);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      expect(map.has('a')).toBe(false);
      expect(map.has('b')).toBe(true);
      expect(map.has('c')).toBe(true);
    });

    it('should call onEvict callback', () => {
      const onEvict = jest.fn();
      const map = new BoundedMap(2, onEvict);
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      expect(onEvict).toHaveBeenCalledWith('a', 1);
    });

    it('should silently handle errors in onEvict callback', () => {
      const onEvict = jest.fn(() => {
        throw new Error('Callback error');
      });
      const map = new BoundedMap(2, onEvict);
      map.set('a', 1);
      map.set('b', 2);

      expect(() => map.set('c', 3)).not.toThrow();
      expect(map.has('c')).toBe(true);
    });

    it('should return this for chaining', () => {
      const map = new BoundedMap(5);
      const result = map.set('a', 1);
      expect(result).toBe(map);
    });

    it('should support chaining', () => {
      const map = new BoundedMap(5);
      map.set('a', 1).set('b', 2).set('c', 3);

      expect(map.size).toBe(3);
    });
  });

  // ===================================================================
  // setAll()
  // ===================================================================

  describe('setAll()', () => {
    it('should set multiple entries from array', () => {
      const map = new BoundedMap(5);
      map.setAll([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);

      expect(map.size).toBe(3);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBe(3);
    });

    it('should respect max size during setAll', () => {
      const map = new BoundedMap(2);
      map.setAll([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);

      expect(map.size).toBe(2);
      expect(map.has('a')).toBe(false);
    });

    it('should return this for chaining', () => {
      const map = new BoundedMap(5);
      const result = map.setAll([['a', 1]]);
      expect(result).toBe(map);
    });
  });

  // ===================================================================
  // getOrCompute()
  // ===================================================================

  describe('getOrCompute()', () => {
    it('should return existing value', () => {
      const map = new BoundedMap(5);
      map.set('a', 1);
      const value = map.getOrCompute('a', () => 2);
      expect(value).toBe(1);
    });

    it('should compute and store value if missing', () => {
      const map = new BoundedMap(5);
      const factory = jest.fn(() => 42);
      const value = map.getOrCompute('a', factory);

      expect(value).toBe(42);
      expect(map.get('a')).toBe(42);
      expect(factory).toHaveBeenCalledWith('a');
    });

    it('should return undefined if no factory and key missing', () => {
      const map = new BoundedMap(5);
      const value = map.getOrCompute('a');
      expect(value).toBeUndefined();
    });

    it('should not call factory for existing key', () => {
      const map = new BoundedMap(5);
      map.set('a', 1);
      const factory = jest.fn(() => 2);
      map.getOrCompute('a', factory);

      expect(factory).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // clear()
  // ===================================================================

  describe('clear()', () => {
    it('should clear all entries', () => {
      const map = new BoundedMap(5);
      map.set('a', 1).set('b', 2);
      map.clear();

      expect(map.size).toBe(0);
    });

    it('should reset eviction count', () => {
      const map = new BoundedMap(2);
      map.set('a', 1).set('b', 2).set('c', 3);
      expect(map.evictionCount).toBe(1);

      map.clear();
      expect(map.evictionCount).toBe(0);
    });
  });

  // ===================================================================
  // resetEvictionCount()
  // ===================================================================

  describe('resetEvictionCount()', () => {
    it('should reset eviction count without clearing entries', () => {
      const map = new BoundedMap(2);
      map.set('a', 1).set('b', 2).set('c', 3);

      expect(map.evictionCount).toBe(1);
      expect(map.size).toBe(2);

      map.resetEvictionCount();

      expect(map.evictionCount).toBe(0);
      expect(map.size).toBe(2);
    });
  });

  // ===================================================================
  // getStats()
  // ===================================================================

  describe('getStats()', () => {
    it('should return statistics object', () => {
      const map = new BoundedMap(10);
      map.set('a', 1).set('b', 2).set('c', 3);

      const stats = map.getStats();

      expect(stats).toEqual({
        size: 3,
        maxSize: 10,
        available: 7,
        isFull: false,
        evictionCount: 0,
        utilizationPercent: 30
      });
    });

    it('should show 100% utilization when full', () => {
      const map = new BoundedMap(2);
      map.set('a', 1).set('b', 2);

      const stats = map.getStats();
      expect(stats.utilizationPercent).toBe(100);
      expect(stats.isFull).toBe(true);
    });
  });

  // ===================================================================
  // clone()
  // ===================================================================

  describe('clone()', () => {
    it('should create new empty map with same settings', () => {
      const onEvict = jest.fn();
      const original = new BoundedMap(50, onEvict);
      original.set('a', 1);

      const cloned = original.clone();

      expect(cloned.maxSize).toBe(50);
      expect(cloned.size).toBe(0);
    });
  });

  // ===================================================================
  // copy()
  // ===================================================================

  describe('copy()', () => {
    it('should copy all entries', () => {
      const map = new BoundedMap(5);
      map.set('a', 1).set('b', 2);

      const copied = map.copy();

      expect(copied.size).toBe(2);
      expect(copied.get('a')).toBe(1);
      expect(copied.get('b')).toBe(2);
    });

    it('should copy settings', () => {
      const map = new BoundedMap(50);
      const copied = map.copy();
      expect(copied.maxSize).toBe(50);
    });

    it('should create independent copy', () => {
      const map = new BoundedMap(5);
      map.set('a', 1);

      const copied = map.copy();
      copied.set('a', 99);

      expect(map.get('a')).toBe(1);
      expect(copied.get('a')).toBe(99);
    });
  });

  // ===================================================================
  // resize()
  // ===================================================================

  describe('resize()', () => {
    it('should increase max size', () => {
      const map = new BoundedMap(5);
      map.resize(10);
      expect(map.maxSize).toBe(10);
    });

    it('should decrease max size and evict', () => {
      const map = new BoundedMap(5);
      map.set('a', 1).set('b', 2).set('c', 3);

      const evicted = map.resize(2);

      expect(evicted).toBe(1);
      expect(map.size).toBe(2);
      expect(map.maxSize).toBe(2);
    });

    it('should return number of evicted entries', () => {
      const map = new BoundedMap(10);
      for (let i = 0; i < 10; i++) {
        map.set(`key${i}`, i);
      }

      const evicted = map.resize(3);
      expect(evicted).toBe(7);
    });

    it('should throw for invalid new size', () => {
      const map = new BoundedMap(5);
      expect(() => map.resize(0)).toThrow('must be a positive integer');
      expect(() => map.resize(-1)).toThrow('must be a positive integer');
      expect(() => map.resize(3.14)).toThrow('must be a positive integer');
    });

    it('should return 0 if no eviction needed', () => {
      const map = new BoundedMap(5);
      map.set('a', 1);
      const evicted = map.resize(10);
      expect(evicted).toBe(0);
    });
  });

  // ===================================================================
  // toJSON() and fromJSON()
  // ===================================================================

  describe('Serialization', () => {
    describe('toJSON()', () => {
      it('should return serializable object', () => {
        const map = new BoundedMap(5);
        map.set('a', 1).set('b', 2);

        const json = map.toJSON();

        expect(json.entries).toEqual([
          ['a', 1],
          ['b', 2]
        ]);
        expect(json.maxSize).toBe(5);
        expect(json.evictionCount).toBe(0);
      });

      it('should be JSON serializable', () => {
        const map = new BoundedMap(3);
        map.set('test', { nested: true });

        const jsonString = JSON.stringify(map.toJSON());
        const parsed = JSON.parse(jsonString);

        expect(parsed.maxSize).toBe(3);
      });
    });

    describe('fromJSON()', () => {
      it('should create map from JSON', () => {
        const json = {
          entries: [
            ['a', 1],
            ['b', 2]
          ],
          maxSize: 5
        };

        const map = BoundedMap.fromJSON(json);

        expect(map.size).toBe(2);
        expect(map.maxSize).toBe(5);
        expect(map.get('a')).toBe(1);
      });

      it('should use default maxSize if not in JSON', () => {
        const json = { entries: [['a', 1]] };
        const map = BoundedMap.fromJSON(json);

        expect(map.maxSize).toBe(1000);
      });

      it('should accept onEvict callback', () => {
        const onEvict = jest.fn();
        const json = { entries: [], maxSize: 10 };
        const map = BoundedMap.fromJSON(json, onEvict);

        expect(map.maxSize).toBe(10);
      });

      it('should handle empty entries', () => {
        const json = { maxSize: 5 };
        const map = BoundedMap.fromJSON(json);

        expect(map.size).toBe(0);
      });
    });
  });

  // ===================================================================
  // FIFO EVICTION
  // ===================================================================

  describe('FIFO Eviction Order', () => {
    it('should evict entries in insertion order', () => {
      const evicted = [];
      const onEvict = (key) => evicted.push(key);
      const map = new BoundedMap(3, onEvict);

      map.set('first', 1);
      map.set('second', 2);
      map.set('third', 3);
      map.set('fourth', 4);
      map.set('fifth', 5);

      expect(evicted).toEqual(['first', 'second']);
    });

    it('should not evict on update of existing key', () => {
      const onEvict = jest.fn();
      const map = new BoundedMap(2, onEvict);

      map.set('a', 1);
      map.set('b', 2);
      map.set('a', 99); // Update, not insert

      expect(onEvict).not.toHaveBeenCalled();
      expect(map.size).toBe(2);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle maxSize of 1', () => {
      const map = new BoundedMap(1);
      map.set('a', 1);
      map.set('b', 2);

      expect(map.size).toBe(1);
      expect(map.has('b')).toBe(true);
      expect(map.has('a')).toBe(false);
    });

    it('should handle object keys', () => {
      const map = new BoundedMap(3);
      const key1 = { id: 1 };
      const key2 = { id: 2 };

      map.set(key1, 'value1');
      map.set(key2, 'value2');

      expect(map.get(key1)).toBe('value1');
      expect(map.get(key2)).toBe('value2');
    });

    it('should handle null and undefined values', () => {
      const map = new BoundedMap(5);
      map.set('null', null);
      map.set('undef', undefined);

      expect(map.get('null')).toBeNull();
      expect(map.get('undef')).toBeUndefined();
    });
  });
});
