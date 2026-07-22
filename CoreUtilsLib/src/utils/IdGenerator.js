/**
 * @file CoreUtilsLib/src/utils/IdGenerator.js
 * @description Secure IdGenerator utility module with environment-aware entropy sources.
 * @version 3.1 - Implemented cryptographically secure randomness and rejection sampling.
 */

export class IdGenerator {
  /**
   * Generates a standard UUID v4 (randomly-generated) string.
   * Uses native GAS Utilities if available for security.
   * @returns {string} UUID v4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx).
   */
  generateUuid() {
    // 1. Google Apps Script Native
    if (typeof Utilities !== 'undefined' && Utilities.getUuid) {
      return Utilities.getUuid();
    }

    // 2. Web Crypto API
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // 3. Secure fallback for Node/Legacy Browser
    const bytes = IdGenerator._getSecureRandomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-');
  }

  /**
   * Returns cryptographically secure random bytes (Web-Crypto-style `getRandomValues`),
   * for callers needing raw entropy rather than a formatted ID (tokens, salts, nonces).
   * Uses the same environment-aware chain as {@link IdGenerator._getSecureRandomBytes}:
   * `Utilities.getUuid()` + SHA-256 in GAS, `crypto.getRandomValues` outside it.
   * @param {number} size Number of random bytes to generate.
   * @returns {number[]|Uint8Array} Array of bytes (0-255).
   */
  getRandomValues(size) {
    return IdGenerator._getSecureRandomBytes(size);
  }

  /**
   * Generates a short 8-character alphanumeric random identifier.
   * @returns {string} Random 8-char base-36 string.
   */
  generateShortId() {
    return IdGenerator.generateCustomId(8, 'abcdefghijklmnopqrstuvwxyz0123456789');
  }

  /**
   * Generates a compact, collision-resistant random ID with specified length.
   * @param {number} [size=21] Output string length.
   * @returns {string} Random alphanumeric ID string.
   */
  generateCompactId(size = 21) {
    const alphabet = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
    return IdGenerator.generateCustomId(size, alphabet);
  }

  /**
   * Generates a custom random ID using a secure source if available.
   * Uses rejection sampling to eliminate modulo bias.
   * @param {number} [length=12] Output string length.
   * @param {string} [alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] Character set.
   * @returns {string} Random ID string.
   */
  generateCustomId(
    length = 12,
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ) {
    return IdGenerator.generateCustomId(length, alphabet);
  }

  /**
   * Static version of custom ID generation for direct access.
   * @param {number} [length=12] Output string length.
   * @param {string} [alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] Character set.
   * @returns {string} Random ID string.
   */
  static generateCustomId(
    length = 12,
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ) {
    const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
    const step = Math.ceil((1.6 * mask * length) / alphabet.length);
    let id = '';

    while (true) {
      const bytes = this._getSecureRandomBytes(step);
      for (let i = 0; i < step; i++) {
        const byte = bytes[i] & mask;
        if (alphabet[byte]) {
          id += alphabet[byte];
          if (id.length === length) return id;
        }
      }
    }
  }

  /**
   * Internal secure random byte generator with environment fallbacks.
   * In GAS, it leverages Utilities.getUuid() + SHA-256 for high-entropy seed.
   * @param {number} size Number of bytes to generate.
   * @returns {number[]|Uint8Array} Byte array.
   * @private
   */
  static _getSecureRandomBytes(size) {
    // 1. Google Apps Script Environment
    if (typeof Utilities !== 'undefined' && Utilities.getUuid && Utilities.computeDigest) {
      const bytes = [];
      while (bytes.length < size) {
        const uuid = Utilities.getUuid();
        const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, uuid);
        // Convert signed bytes to unsigned 0-255
        for (let i = 0; i < hash.length && bytes.length < size; i++) {
          const unsigned = hash[i] < 0 ? hash[i] + 256 : hash[i];
          bytes.push(unsigned);
        }
      }
      return bytes;
    }

    // 2. Browser/Node with Web Crypto API
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return crypto.getRandomValues(new Uint8Array(size));
    }

    // 3. Insecure Fallback (with warning) - Should only hit in outdated/restricted environments
    /* istanbul ignore next */
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(
        '[Security Warning] Cryptographically secure random source not found. Falling back to Math.random().'
      );
    }
    const insecureBytes = [];
    for (let i = 0; i < size; i++) {
      insecureBytes.push((Math.random() * 256) | 0);
    }
    return insecureBytes;
  }
}
