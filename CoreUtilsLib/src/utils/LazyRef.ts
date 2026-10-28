/**
 * @fileoverview Generic single-value lazy loader — defers an expensive
 * computation until first access, then caches it for the lifetime of the instance.
 * @author GasLibraryFactory
 */

/**
 * @class LazyRef
 * @template T
 * @description Wraps a zero-argument loader function, invoking it at most once.
 */
class LazyRef<T = unknown> {
  declare _resolved: boolean;
  declare _value: T | undefined;
  declare _loader: () => T;
  /**
   * @param {() => T} loader Zero-argument factory invoked at most once, on first get().
   */
  constructor(loader: () => T) {
    this._resolved = false;
    this._value = undefined;
    this._loader = loader;
  }

  /**
   * @returns {T} The loader's result, computed on first call and cached thereafter.
   */
  get(): T {
    if (!this._resolved) {
      this._value = this._loader();
      this._resolved = true;
    }
    return this._value as T;
  }

  /**
   * @returns {boolean} True once get() has been called at least once.
   */
  isResolved() {
    return this._resolved;
  }
}

export { LazyRef };
