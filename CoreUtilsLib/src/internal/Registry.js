/**
 * @file CoreUtilsLib/src/internal/Registry.js
 * @description Generic Map-backed registry primitive shared across libraries.
 *
 * Centralizes the `register/get/has/unregister/clear/keys/size` storage plumbing
 * that was previously re-implemented in every per-library registry (F-1.5).
 * Libraries with bespoke validation, error types, or dual-store (singleton +
 * factory) semantics compose an instance of this class for storage while keeping
 * their own public API, messages, and behavior.
 * @version 1.0.0
 */

/**
 * Generic key/value registry backed by a Map.
 *
 * @class Registry
 * @template T
 */
export class Registry {
  /**
   * @param {Object} [options={}] Registry configuration.
   * @param {Object|null} [options.logger=null] Optional logger (debug used for registration traces).
   * @param {string} [options.entityName='entry'] Noun used in default error/log messages.
   * @param {Function|null} [options.validateValue=null] Optional `(value, key) => void` hook that
   *   throws when a value is invalid.
   */
  constructor({ logger = null, entityName = 'entry', validateValue = null } = {}) {
    this._store = new Map();
    this._logger = logger;
    this._entityName = entityName;
    this._validateValue = validateValue;
  }

  /**
   * Registers a value under a key, running the optional value validator.
   * @param {string} key Non-empty string key.
   * @param {T} value Value to store.
   * @param {Object} [options={}] Registration options.
   * @param {boolean} [options.overwrite=true] When false, throws if the key already exists.
   * @returns {boolean} True if an existing entry was overwritten.
   * @throws {Error} If key is not a non-empty string, value is invalid, or a
   *   non-overwriting collision occurs.
   */
  register(key, value, { overwrite = true } = {}) {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new Error(`Registry: ${this._entityName} key must be a non-empty string`);
    }
    if (this._validateValue) {
      this._validateValue(value, key);
    }
    const existed = this._store.has(key);
    if (existed && !overwrite) {
      throw new Error(`Registry: ${this._entityName} '${key}' is already registered`);
    }
    this._store.set(key, value);
    if (this._logger && typeof this._logger.debug === 'function') {
      this._logger.debug(`Registry: registered ${this._entityName} '${key}'`);
    }
    return existed;
  }

  /**
   * Stores a value without validation or logging (low-level storage primitive).
   * @param {string} key Key.
   * @param {T} value Value.
   * @returns {boolean} True if an existing entry was overwritten.
   */
  set(key, value) {
    const existed = this._store.has(key);
    this._store.set(key, value);
    return existed;
  }

  /**
   * @param {string} key Key.
   * @returns {T|undefined} Stored value, or undefined if absent.
   */
  get(key) {
    return this._store.get(key);
  }

  /**
   * @param {string} key Key.
   * @returns {boolean} True if a value is registered for the key.
   */
  has(key) {
    return this._store.has(key);
  }

  /**
   * Removes the value for a key.
   * @param {string} key Key.
   * @returns {boolean} True if an entry existed and was removed.
   */
  unregister(key) {
    return this._store.delete(key);
  }

  /**
   * Removes all entries.
   * @returns {void}
   */
  clear() {
    this._store.clear();
  }

  /**
   * @returns {string[]} Snapshot array of all registered keys.
   */
  keys() {
    return Array.from(this._store.keys());
  }

  /**
   * @returns {T[]} Snapshot array of all registered values.
   */
  values() {
    return Array.from(this._store.values());
  }

  /**
   * @returns {Array<[string, T]>} Snapshot array of [key, value] entries.
   */
  entries() {
    return Array.from(this._store.entries());
  }

  /**
   * @returns {number} Number of registered entries.
   */
  get size() {
    return this._store.size;
  }
}
