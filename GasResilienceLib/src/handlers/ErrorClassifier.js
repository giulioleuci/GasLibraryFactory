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
   * Initializes the classifier with matching rules from configuration or system defaults.
   * @param {Object} [config] optional central settings (ResilienceConfiguration).
   * @throws {Error} If config is provided but invalid.
   */
  constructor(config) {
    // Validate config if provided
    if (config !== undefined && config !== null && typeof config !== 'object') {
      throw new Error('ErrorClassifier: config must be an object or null');
    }

    /**
     * Error classification patterns and configurations.
     * Each classifier defines a regex pattern, category name, and recoverability.
     * @private
     */
    // GRL-M002: Use configuration object instead of hard-coded values
    if (config && typeof config.getErrorPatterns === 'function') {
      this._classifiers = config.getErrorPatterns();
    } else {
      // Fallback to default patterns for backward compatibility
      // Note: Patterns are evaluated in order - more specific patterns should come first
      this._classifiers = {
        // Fatal errors that should never be retried (must come first)
        AUTH_REQUIRED: {
          pattern: /authorization is required|access_token/i,
          category: 'FATAL',
          recoverable: false
        },
        SCRIPT_ERROR: {
          pattern: /script error|syntax error|reference error|type error|is not a function/i,
          category: 'FATAL',
          recoverable: false
        },
        // Recoverable and non-recoverable errors
        // TIMEOUT must come before QUOTA to prevent `limit.*exceeded` from matching
        // across message+stack boundary of TimeoutException errors
        TIMEOUT: {
          pattern: /timeout|time.*limit|execution.*time.*exceeded|exceeded.*time/i,
          category: 'TIMEOUT',
          recoverable: false
        },
        QUOTA_EXCEEDED: {
          pattern: /quota|limit.*exceeded|too many (requests|times)|service invoked too many/i,
          category: 'QUOTA',
          recoverable: true
        },
        PERMISSION_DENIED: {
          pattern: /permission.*(denied|to access)|unauthorized|you do not have permission/i,
          category: 'PERMISSIONS',
          recoverable: false
        },
        SERVICE_UNAVAILABLE: {
          pattern: /service.*(unavailable|error|failed)|503/i,
          category: 'SERVICE',
          recoverable: true
        },
        NOT_FOUND: {
          pattern: /not found|(?:^|\s)404(?:\s|$)/i,
          category: 'NOT_FOUND',
          recoverable: false
        },
        NETWORK_ERROR: {
          pattern: /network.*error|connection.*(refused|failed)|failed to establish connection/i,
          category: 'NETWORK',
          recoverable: true
        }
      };
    }

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

  /**
   * Generates a deterministic SHA-256 identifier for an error context.
   * @private
   * @param {string} str diagnostic context string.
   * @returns {string} 64-character hex hash.
   */
  _hashString(str) {
    return HashUtils.generateHash(str);
  }
}
