/**
 * @file CoreUtilsLib/src/__tests__/Delegation.test.js
 * @description Unit tests for the shared Facade/Delegation-pattern helper.
 */

import { Delegation } from '../utils/Delegation.js';

describe('Delegation.delegateMethods', () => {
  it('binds manager methods onto the target with manager as this', () => {
    const target = {};
    const manager = {
      value: 42,
      getValue() {
        return this.value;
      }
    };

    Delegation.delegateMethods(target, [{ manager, methods: ['getValue'] }]);

    expect(typeof target.getValue).toBe('function');
    expect(target.getValue()).toBe(42);
  });

  it('wires up methods from multiple managers', () => {
    const target = {};
    const managerA = { foo: () => 'foo-result' };
    const managerB = { bar: () => 'bar-result' };

    Delegation.delegateMethods(target, [
      { manager: managerA, methods: ['foo'] },
      { manager: managerB, methods: ['bar'] }
    ]);

    expect(target.foo()).toBe('foo-result');
    expect(target.bar()).toBe('bar-result');
  });

  it('silently skips methods that are missing or not functions on the manager', () => {
    const target = {};
    const manager = { notAFunction: 'nope' };

    Delegation.delegateMethods(target, [{ manager, methods: ['missingMethod', 'notAFunction'] }]);

    expect(target.missingMethod).toBeUndefined();
    expect(target.notAFunction).toBeUndefined();
  });

  it('returns the target for convenience chaining', () => {
    const target = {};
    const result = Delegation.delegateMethods(target, []);
    expect(result).toBe(target);
  });

  it('preserves manager internal state across rebinding (closures over manager fields)', () => {
    const target = {};
    class Counter {
      constructor() {
        this.count = 0;
      }
      increment() {
        this.count += 1;
        return this.count;
      }
    }
    const manager = new Counter();

    Delegation.delegateMethods(target, [{ manager, methods: ['increment'] }]);

    expect(target.increment()).toBe(1);
    expect(target.increment()).toBe(2);
    expect(manager.count).toBe(2);
  });
});
