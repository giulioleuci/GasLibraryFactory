/**
 * @file CoreUtilsLib/src/internal/__tests__/LazyServiceContainer.test.js
 * @description Unit tests for the generic lazy-singleton DI container (ref REPORT_GLF.md B8).
 */

import { LazyServiceContainer } from '../LazyServiceContainer.js';

describe('LazyServiceContainer', () => {
  let container;

  beforeEach(() => {
    container = new LazyServiceContainer({ entityName: 'service' });
  });

  describe('register / has', () => {
    it('has() is false before registration and true after', () => {
      expect(container.has('logger')).toBe(false);
      container.register('logger', () => ({}));
      expect(container.has('logger')).toBe(true);
    });
  });

  describe('get()', () => {
    it('throws when no factory is registered for the name', () => {
      expect(() => container.get('missing')).toThrow(/missing/);
    });

    it('invokes the factory and returns its result', () => {
      container.register('greeting', () => 'hello');
      expect(container.get('greeting')).toBe('hello');
    });

    it('caches the resolved instance: the factory runs at most once', () => {
      const factory = jest.fn(() => ({ id: Math.random() }));
      container.register('svc', factory);

      const first = container.get('svc');
      const second = container.get('svc');

      expect(factory).toHaveBeenCalledTimes(1);
      expect(second).toBe(first);
    });

    it('passes the container itself to the factory, for lazy cross-dependencies', () => {
      container.register('a', () => 'A-VALUE');
      container.register('b', (c) => `B depends on ${c.get('a')}`);

      expect(container.get('b')).toBe('B depends on A-VALUE');
    });

    it('resolves lazily: a factory for an unused service never runs', () => {
      const factory = jest.fn(() => 'never used');
      container.register('unused', factory);

      expect(factory).not.toHaveBeenCalled();
    });
  });

  describe('register() overwrite semantics', () => {
    it('re-registering a name invalidates its cached singleton', () => {
      container.register('svc', () => 'v1');
      expect(container.get('svc')).toBe('v1');

      container.register('svc', () => 'v2');
      expect(container.get('svc')).toBe('v2');
    });
  });

  describe('reset()', () => {
    it('clears cached singletons but keeps factories registered', () => {
      let calls = 0;
      container.register('svc', () => ({ n: ++calls }));

      const first = container.get('svc');
      container.reset();
      const second = container.get('svc');

      expect(first).not.toBe(second);
      expect(second.n).toBe(2);
      expect(container.has('svc')).toBe(true);
    });
  });

  describe('clear()', () => {
    it('removes both factories and cached singletons', () => {
      container.register('svc', () => 'v');
      container.get('svc');

      container.clear();

      expect(container.has('svc')).toBe(false);
      expect(() => container.get('svc')).toThrow();
    });
  });
});
