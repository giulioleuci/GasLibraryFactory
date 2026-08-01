import { LazyRef } from '../LazyRef.js';

test('defers loader until first get()', () => {
  let calls = 0;
  const ref = new LazyRef(() => {
    calls++;
    return 'value';
  });
  expect(ref.isResolved()).toBe(false);
  expect(calls).toBe(0);
  expect(ref.get()).toBe('value');
  expect(calls).toBe(1);
  expect(ref.isResolved()).toBe(true);
});

test('caches the value across repeated get() calls', () => {
  let calls = 0;
  const ref = new LazyRef(() => ++calls);
  ref.get();
  ref.get();
  expect(ref.get()).toBe(1);
  expect(calls).toBe(1);
});
