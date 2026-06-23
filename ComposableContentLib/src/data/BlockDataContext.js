/**
 * @file ComposableContentLib/src/data/BlockDataContext.js
 * @description BlockDataContext for providing data to content blocks.
 * @version 1.0.0
 */

import { cloneDeep, get as lodashGet, set as lodashSet } from '@CoreUtilsLib';

/**
 * @description Encapsulated state container for rendering context. 
 * Supports dot-notation resolution, merging global vs. block-local data, and immutable scoping.
 * @class
 * @example
 * const context = new BlockDataContext({ user: { name: 'John' } });
 * const name = context.get('user.name'); // 'John'
 */
export class BlockDataContext {
  /**
   * @description Initializes context state with optional block-specific and global payloads.
   * @param {Object} [data={}] Block-specific runtime data.
   * @param {Object} [globalContext={}] Shared orchestration state across all blocks.
   */
  constructor(data = {}, globalContext = {}) {
    /**
     * Main data object.
     * @type {Object}
     * @private
     */
    this._data = cloneDeep(data);

    /**
     * Global context.
     * @type {Object}
     * @private
     */
    this._globalContext = cloneDeep(globalContext);

    /**
     * Merged data (data + global context).
     * @type {Object}
     * @private
     */
    this._merged = { ...this._globalContext, ...this._data };
  }

  /**
   * @description Safely resolves a nested property using dot notation from the unified state.
   * @param {string} path Target property path.
   * @param {*} [defaultValue=null] Fallback if path is unresolvable.
   * @returns {*} Resolved value or default.
   */
  get(path, defaultValue = null) {
    if (!path) {
      return defaultValue;
    }
    const value = lodashGet(this._merged, path);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * @description Validates the existence of a nested property path.
   * @param {string} path Target property path.
   * @returns {boolean} True if the path resolves to a defined value.
   */
  has(path) {
    return lodashGet(this._merged, path) !== undefined;
  }

  /**
   * @description Batch resolves multiple property paths into a single mapping object.
   * @param {string[]} paths Array of target paths.
   * @returns {Object} Key-value map of path to resolved value.
   */
  getMultiple(paths) {
    const result = {};
    for (const path of paths) {
      result[path] = this.get(path);
    }
    return result;
  }

  /**
   * @description Returns a deep clone of the fully unified context state (local + global).
   * @returns {Object} Unified data clone.
   */
  getAll() {
    return cloneDeep(this._merged);
  }

  /**
   * @description Returns a deep clone of the block-specific data payload, excluding global state.
   * @returns {Object} Local data clone.
   */
  getRawData() {
    return cloneDeep(this._data);
  }

  /**
   * @description Returns a deep clone of the shared global state payload.
   * @returns {Object} Global data clone.
   */
  getGlobalContext() {
    return cloneDeep(this._globalContext);
  }

  /**
   * @description Mutates the local block data payload and recalculates unified state.
   * @param {string} path Target dot-notation path.
   * @param {*} value Value to apply.
   */
  set(path, value) {
    lodashSet(this._data, path, value);
    this._merged = { ...this._globalContext, ...this._data };
  }

  /**
   * @description Deeply merges an external object into the local block data and recalculates state.
   * @param {Object} additionalData Payload to overlay.
   */
  merge(additionalData) {
    if (additionalData && typeof additionalData === 'object') {
      Object.assign(this._data, additionalData);
      this._merged = { ...this._globalContext, ...this._data };
    }
  }

  /**
   * @description Factory method generating a new context instance with augmented local data.
   * @param {Object} additionalData Payload to overlay on the clone.
   * @returns {BlockDataContext} New immutable context.
   */
  withData(additionalData) {
    return new BlockDataContext({ ...this._data, ...additionalData }, this._globalContext);
  }

  /**
   * @description Factory method generating a new context instance with augmented global data.
   * @param {Object} additionalGlobal Payload to overlay on the global clone.
   * @returns {BlockDataContext} New immutable context.
   */
  withGlobalContext(additionalGlobal) {
    return new BlockDataContext(this._data, { ...this._globalContext, ...additionalGlobal });
  }

  /**
   * @description Factory method generating a new context scoped to a specific property subtree.
   * Maintains the original global context unmodified.
   * @param {string} path Root path for the new scope.
   * @returns {BlockDataContext} Scoped context instance.
   */
  scope(path) {
    const scopedData = this.get(path, {});
    return new BlockDataContext(
      typeof scopedData === 'object' ? scopedData : { value: scopedData },
      this._globalContext
    );
  }

  /**
   * @description Evaluates if the unified context state contains zero enumerable keys.
   * @returns {boolean} True if entirely empty.
   */
  isEmpty() {
    return Object.keys(this._merged).length === 0;
  }

  /**
   * @description Extracts all top-level keys from the unified context state.
   * @returns {string[]} Collection of root keys.
   */
  keys() {
    return Object.keys(this._merged);
  }

  /**
   * @description Validates that the context satisfies an array of required keys.
   * @param {string[]} requiredKeys Expected top-level keys.
   * @returns {boolean} True if all exist.
   */
  hasAll(requiredKeys) {
    return requiredKeys.every((key) => this.has(key));
  }

  /**
   * @description Returns the subset of required keys that are missing from the context.
   * @param {string[]} requiredKeys Expected top-level keys.
   * @returns {string[]} Unfulfilled dependencies.
   */
  getMissingKeys(requiredKeys) {
    return requiredKeys.filter((key) => !this.has(key));
  }

  /**
   * @description Serializes both data and globalContext into a clean object representation.
   * @returns {Object} JSON-safe snapshot.
   */
  toJSON() {
    return {
      data: cloneDeep(this._data),
      globalContext: cloneDeep(this._globalContext)
    };
  }

  /**
   * @description Reconstitutes a BlockDataContext instance from a serialized snapshot.
   * @param {Object} obj Target JSON payload.
   * @returns {BlockDataContext} Restored instance.
   * @static
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      return new BlockDataContext();
    }
    return new BlockDataContext(obj.data || {}, obj.globalContext || {});
  }

  /**
   * @description Returns a diagnostic summary of the unified state footprint.
   * @returns {string} Summary string.
   */
  toString() {
    return `BlockDataContext[${Object.keys(this._merged).length} keys]`;
  }
}
