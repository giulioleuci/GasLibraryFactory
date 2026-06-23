/**
 * @file CoreUtilsLib/src/BoundedMap.js
 * @description A Map with automatic size limiting and FIFO eviction.
 * Useful for in-memory caches that need to prevent unbounded growth.
 * @version 1.0.0
 */

/**
 * Map implementation with automatic size limiting and FIFO eviction.
 * @class BoundedMap
 * @extends Map
 */
export class BoundedMap extends Map {
  /**
   * Default maximum size if not specified.
   * @static
   * @type {number}
   */
  static get DEFAULT_MAX_SIZE() {
    return 1000;
  }

  /**
   * Initialize BoundedMap with capacity limit and optional eviction callback.
   * @param {number} [maxSize=1000] - Capacity limit before FIFO eviction.
   * @param {Function} [onEvict=null] - Lifecycle hook for evicted entries: (key, value) => void.
   */
  constructor(maxSize = BoundedMap.DEFAULT_MAX_SIZE, onEvict = null) {
    super();

    if (typeof maxSize !== 'number' || maxSize < 1 || !Number.isInteger(maxSize)) {
      throw new Error('BoundedMap: maxSize must be a positive integer');
    }

    if (onEvict !== null && typeof onEvict !== 'function') {
      throw new Error('BoundedMap: onEvict must be a function or null');
    }

    /**
     * Maximum number of entries.
     * @private
     * @type {number}
     */
    this._maxSize = maxSize;

    /**
     * Callback function called when an entry is evicted.
     * @private
     * @type {Function|null}
     */
    this._onEvict = onEvict;

    /**
     * Count of evictions since creation or last reset.
     * @private
     * @type {number}
     */
    this._evictionCount = 0;
  }

  /**
   * Gets the maximum size of the map.
   *
   * @returns {number} The maximum number of entries allowed
   */
  get maxSize() {
    return this._maxSize;
  }

  /**
   * Gets the number of evictions that have occurred.
   *
   * @returns {number} Total eviction count
   */
  get evictionCount() {
    return this._evictionCount;
  }

  /**
   * Checks if the map is at capacity.
   *
   * @returns {boolean} True if size equals maxSize
   */
  get isFull() {
    return this.size >= this._maxSize;
  }

  /**
   * Gets the number of available slots.
   *
   * @returns {number} Number of entries that can be added before eviction
   */
  get available() {
    return Math.max(0, this._maxSize - this.size);
  }

  /**
   * Add or update a key-value pair, triggering FIFO eviction if at capacity.
   * @param {*} key - Lookup identifier.
   * @param {*} value - Associated data payload.
   * @returns {BoundedMap} Fluent instance for chaining.
   */
  set(key, value) {
    // If key already exists, just update (no eviction needed)
    if (this.has(key)) {
      super.set(key, value);
      return this;
    }

    // Evict oldest if at capacity
    if (this.size >= this._maxSize) {
      this._evictOldest();
    }

    super.set(key, value);
    return this;
  }

  /**
   * Internal FIFO eviction logic for the oldest inserted entry.
   * @private
   */
  _evictOldest() {
    const firstKey = this.keys().next().value;
    if (firstKey !== undefined) {
      const value = this.get(firstKey);
      this.delete(firstKey);
      this._evictionCount++;

      if (this._onEvict) {
        try {
          this._onEvict(firstKey, value);
        } catch {
          // Silently ignore eviction callback errors
        }
      }
    }
  }

  /**
   * Batch insert multiple key-value pairs with automatic bound enforcement.
   * @param {Iterable<[*, *]>} entries - Collection of [key, value] tuples.
   * @returns {BoundedMap} Fluent instance for chaining.
   */
  setAll(entries) {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
    return this;
  }

  /**
   * Retrieve a value or compute and store it using a factory if absent.
   * @param {*} key - Lookup identifier.
   * @param {Function} [factory=null] - Value generator: (key) => *.
   * @returns {*} Retrieved or computed value.
   */
  getOrCompute(key, factory) {
    if (this.has(key)) {
      return this.get(key);
    }

    if (factory) {
      const value = factory(key);
      this.set(key, value);
      return value;
    }

    return undefined;
  }

  /**
   * Clear all entries and reset the internal eviction counter.
   */
  clear() {
    super.clear();
    this._evictionCount = 0;
  }

  /**
   * Reset the internal eviction counter without clearing data.
   */
  resetEvictionCount() {
    this._evictionCount = 0;
  }

  /**
   * Retrieve operational metrics including size, capacity, and eviction counts.
   * @returns {Object} Metric summary with utilization and performance data.
   */
  getStats() {
    return {
      size: this.size,
      maxSize: this._maxSize,
      available: this.available,
      isFull: this.isFull,
      evictionCount: this._evictionCount,
      utilizationPercent: Math.round((this.size / this._maxSize) * 100)
    };
  }

  /**
   * Create an empty BoundedMap instance with identical capacity settings.
   * @returns {BoundedMap} New empty instance.
   */
  clone() {
    return new BoundedMap(this._maxSize, this._onEvict);
  }

  /**
   * Create a new BoundedMap instance with a shallow copy of all current entries.
   * @returns {BoundedMap} New populated instance.
   */
  copy() {
    const copy = new BoundedMap(this._maxSize, this._onEvict);
    for (const [key, value] of this) {
      copy.set(key, value);
    }
    return copy;
  }

  /**
   * Dynamically update capacity limit, potentially triggering immediate FIFO evictions.
   * @param {number} newMaxSize - Updated capacity limit.
   * @returns {number} Count of entries evicted during the resize operation.
   */
  resize(newMaxSize) {
    if (typeof newMaxSize !== 'number' || newMaxSize < 1 || !Number.isInteger(newMaxSize)) {
      throw new Error('BoundedMap: newMaxSize must be a positive integer');
    }

    const evictedCount = Math.max(0, this.size - newMaxSize);

    // Evict oldest entries if needed
    while (this.size > newMaxSize) {
      this._evictOldest();
    }

    this._maxSize = newMaxSize;
    return evictedCount;
  }

  /**
   * Serialize map entries and metadata to a plain object.
   * @returns {Object} JSON-compatible representation with entries and stats.
   */
  toJSON() {
    return {
      entries: Array.from(this.entries()),
      maxSize: this._maxSize,
      evictionCount: this._evictionCount
    };
  }

  /**
   * Reconstruct a BoundedMap from a serialized JSON object.
   * @param {Object} json - Serialized state containing entries and maxSize.
   * @param {Function} [onEvict=null] - Lifecycle hook for evicted entries.
   * @returns {BoundedMap} Hydrated BoundedMap instance.
   */
  static fromJSON(json, onEvict = null) {
    const map = new BoundedMap(json.maxSize || BoundedMap.DEFAULT_MAX_SIZE, onEvict);
    if (json.entries) {
      map.setAll(json.entries);
    }
    return map;
  }
}
