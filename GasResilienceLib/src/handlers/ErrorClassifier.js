// ===================================================================
// FILE: GasResilienceLib/src/handlers/ErrorClassifier.js
// ===================================================================

import { HashUtils } from '@CoreUtilsLib';

/**
 * Diagnostic engine for categorizing errors using regex-based pattern matching against messages and stack traces, driving intelligent recovery decisions.
 * @class
 * @private
 */
export class ErrorClassifier {
  /**
   * Initializes the classifier with matching rules from configuration.
   * @param {Object} config central settings (ResilienceConfiguration) providing getErrorPatterns().
   * @throws {Error} If config is missing or does not implement getErrorPatterns().
   */
  constructor(config) {
    // GRL-M002: ResilienceConfiguration is the sole source of classification patterns
    if (!config || typeof config.getErrorPatterns !== 'function') {
      throw new Error('ErrorClassifier: config is required and must implement getErrorPatterns()');
    }

    /**
     * Error classification patterns and configurations.
     * Each classifier defines a regex pattern, category name, and recoverability.
     * @private
     */
    this._classifiers = config.getErrorPatterns();

    // GRL-M004: Cache for classification results to avoid re-classifying the same errors
    this._classificationCache = new Map();
    this._cacheMaxSize = 100; // Limit cache size to prevent memory issues
  }

  /**
   * Evaluates an error instance against the pattern registry to determine its category and recoverability.
   * @param {Error|Object} error target failure object.
   * @returns {Object} error classification state (type, category, recoverable, originalMessage).
   * @throws {Error} If error is not a valid object.
   */
  classify(error) {
    // Validate input
    if (!error || typeof error !== 'object') {
      throw new Error('ErrorClassifier.classify: error must be an object');
    }

    // Ensure we have at least a message property
    const message = error.message !== undefined ? String(error.message) : '';
    const stack = error.stack !== undefined ? String(error.stack) : '';
    const fullText = `${message} ${stack}`;

    // GRL-M004: Check cache first to avoid re-classifying the same error messages
    // Use hash of full error text to avoid collisions from substring approach
    // Using CoreUtilsLib HashUtils for consistent hashing across the monorepo
    const cacheKey = HashUtils.generateHash(fullText);
    if (this._classificationCache.has(cacheKey)) {
      const cachedResult = this._classificationCache.get(cacheKey);
      // Return a copy with the current full message
      return {
        type: cachedResult.type,
        category: cachedResult.category,
        recoverable: cachedResult.recoverable,
        originalMessage: message
      };
    }

    let classification;
    for (const [type, config] of Object.entries(this._classifiers)) {
      if (config.pattern.test(fullText)) {
        classification = {
          type,
          category: config.category,
          recoverable: config.recoverable,
          originalMessage: message
        };
        break;
      }
    }

    // Default classification for unknown errors (GRL-H003)
    // Unknown errors are treated as recoverable by default.
    if (!classification) {
      classification = {
        type: 'UNKNOWN',
        category: 'GENERIC',
        recoverable: true,
        originalMessage: message
      };
    }

    // GRL-M004: Cache the result (store without the full message to save memory)
    if (this._classificationCache.size >= this._cacheMaxSize) {
      // Simple FIFO eviction: remove oldest entry
      const firstKey = this._classificationCache.keys().next().value;
      this._classificationCache.delete(firstKey);
    }
    this._classificationCache.set(cacheKey, {
      type: classification.type,
      category: classification.category,
      recoverable: classification.recoverable
    });

    return classification;
  }

  /**
   * Purges all cached classification results to force re-evaluation of subsequent errors.
   */
  clearCache() {
    this._classificationCache.clear();
  }
}
