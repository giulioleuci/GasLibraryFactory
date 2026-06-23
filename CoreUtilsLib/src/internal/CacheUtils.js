/**
 * @file CoreUtilsLib/src/CacheUtils.js
 * @description Utilities for cache key generation and cache-related operations.
 * Provides consistent cache key patterns across all libraries.
 * @version 1.0.0
 */

import { HashUtils } from './HashUtils.js';

/**
 * Static utility provider for standardized cache key generation and TTL management.
 * @class CacheUtils
 */
export class CacheUtils {
  /**
   * Default separator for cache key parts.
   * @static
   * @type {string}
   */
  static get KEY_SEPARATOR() {
    return '_';
  }

  /**
   * Maximum cache TTL in seconds (6 hours - GAS limit).
   * @static
   * @type {number}
   */
  static get MAX_TTL_SECONDS() {
    return 21600; // 6 hours
  }

  /**
   * Compose a cache key from a prefix and variadic parts.
   * @param {string} prefix - Resource identifier prefix.
   * @param {...*} parts - Sub-identifiers to stringify and join.
   * @returns {string} Delimited cache key.
   */
  static generateKey(prefix, ...parts) {
    const allParts = [prefix, ...parts]
      .filter((part) => part !== null && part !== undefined)
      .map((part) => String(part));

    return allParts.join(CacheUtils.KEY_SEPARATOR);
  }

  /**
   * Compose a cache key using a hashed representation of a configuration object.
   * @param {string} prefix - Resource identifier prefix.
   * @param {Object} obj - Complex payload to hash.
   * @returns {string} Delimited cache key including hash.
   */
  static generateHashKey(prefix, obj) {
    const hash = HashUtils.hashObject(obj);
    return `${prefix}${CacheUtils.KEY_SEPARATOR}${hash}`;
  }

  /**
   * Compose a versioned cache key for schema invalidation.
   * @param {string} prefix - Resource identifier prefix.
   * @param {string|number} version - Schema version identifier.
   * @param {...*} parts - Additional sub-identifiers.
   * @returns {string} Delimited versioned cache key.
   */
  static generateVersionedKey(prefix, version, ...parts) {
    return CacheUtils.generateKey(prefix, version, ...parts);
  }

  /**
   * Validate if a key belongs to a specific prefix group.
   * @param {string} key - Cache key to test.
   * @param {string} prefix - Group identifier.
   * @returns {boolean} True if the key starts with the specified prefix group.
   */
  static hasPrefix(key, prefix) {
    return key.startsWith(prefix + CacheUtils.KEY_SEPARATOR);
  }

  /**
   * Isolate the prefix group from a delimited cache key.
   * @param {string} key - Delimited cache key.
   * @returns {string} Prefix identifier portion.
   */
  static getPrefix(key) {
    const separatorIndex = key.indexOf(CacheUtils.KEY_SEPARATOR);
    return separatorIndex > -1 ? key.substring(0, separatorIndex) : key;
  }

  /**
   * Normalize TTL value against maximum allowable GAS limits.
   * @param {number} requestedTtl - Desired lifetime in seconds.
   * @returns {number} Capped TTL value (max 21600s).
   */
  static calculateTtl(requestedTtl) {
    return Math.min(requestedTtl, CacheUtils.MAX_TTL_SECONDS);
  }

  /**
   * Floor convert milliseconds to second-based TTL.
   * @param {number} milliseconds - Duration in ms.
   * @returns {number} Duration in seconds.
   */
  static msToSeconds(milliseconds) {
    return Math.floor(milliseconds / 1000);
  }

  /**
   * Convert second-based TTL to milliseconds.
   * @param {number} seconds - Duration in seconds.
   * @returns {number} Duration in milliseconds.
   */
  static secondsToMs(seconds) {
    return seconds * 1000;
  }

  /**
   * Deconstruct a delimited cache key into its constituent identifiers.
   * @param {string} key - Delimited cache key.
   * @returns {string[]} Ordered collection of key segments.
   */
  static parseKey(key) {
    return key.split(CacheUtils.KEY_SEPARATOR);
  }

  /**
   * Compose a key pattern for wildcard matching.
   * @param {string} prefix - Resource identifier prefix.
   * @param {...*} parts - Pattern segments (including wildcards).
   * @returns {string} Generated search pattern.
   */
  static createPattern(prefix, ...parts) {
    return CacheUtils.generateKey(prefix, ...parts);
  }

  /**
   * Validate a cache key against a wildcard pattern.
   * @param {string} key - Cache key to test.
   * @param {string} pattern - Search pattern with '*' wildcards.
   * @returns {boolean} True if the key matches the pattern structure.
   */
  static matchesPattern(key, pattern) {
    // Convert pattern to regex
    const regexPattern = pattern
      .split('*')
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');

    return new RegExp(`^${regexPattern}$`).test(key);
  }
}
