/**
 * @file ContextEngine/src/SwapAndEnrichInterceptor.js
 * @description Interceptor implementing Swap & Enrich strategy for entity substitution.
 * @version 1.0.0
 */

import { ContextInterceptor } from './ContextInterceptor';

/**
 * Interceptor implementing transparent entity substitution (Swap) while preserving original data and adding metadata (Enrich).
 * @class
 * @extends ContextInterceptor
 */
export class SwapAndEnrichInterceptor extends ContextInterceptor {
  /**
   * Initializes the interceptor with substitution logic and configuration.
   * @param {Object} logger Logger service.
   * @param {Function} substitutionLookup Signature: (originalData, context, options) => substituteData|null.
   * @param {Object} [config={}] Strategy configuration.
   * @param {string} [config.originalPropertyName='original'] Key for nesting the original entity.
   * @param {Object} [config.metadataFlags={isSubstitute:true}] Flags to merge into the substituted entity.
   * @param {string[]|null} [config.targetProviders=null] Specific provider IDs to intercept (null for all).
   * @param {string} [config.optionFlag='applyOverrides'] Option key to check for strategy activation.
   * @throws {Error} If substitutionLookup is not a function or config is invalid.
   */
  constructor(logger, substitutionLookup, config = {}) {
    super(logger);

    // Validate substitutionLookup
    if (typeof substitutionLookup !== 'function') {
      throw new Error(
        'SwapAndEnrichInterceptor: substitutionLookup is required and must be a function'
      );
    }

    if (config !== null && typeof config !== 'object') {
      throw new Error('SwapAndEnrichInterceptor: config must be an object or null');
    }

    /**
     * Function to lookup substitution data.
     * @private
     * @type {Function}
     */
    this._substitutionLookup = substitutionLookup;

    /**
     * Property name for storing original entity.
     * @private
     * @type {string}
     */
    this._originalPropertyName = config.originalPropertyName || 'original';

    /**
     * Metadata flags to add to substituted entity.
     * @private
     * @type {Object}
     */
    this._metadataFlags = config.metadataFlags || { isSubstitute: true };

    /**
     * Target provider names to intercept (null = all).
     * @private
     * @type {string[]|null}
     */
    this._targetProviders = config.targetProviders || null;

    /**
     * Option flag name for conditional activation.
     * @private
     * @type {string}
     */
    this._optionFlag = config.optionFlag || 'applyOverrides';
  }

  /**
   * Activates interception based on config.optionFlag and config.targetProviders.
   * @param {string} name Provider name.
   * @param {*} data Provider data.
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {boolean} True if criteria are met.
   * @protected
   * @override
   */
  _shouldIntercept(name, data, context, options) {
    // Check if option flag is enabled
    if (options[this._optionFlag] !== true) {
      this._logger.debug(
        `[${name}] SwapAndEnrichInterceptor: Option flag '${this._optionFlag}' not enabled`
      );
      return false;
    }

    // Check if provider is in target list (if configured)
    if (this._targetProviders !== null && !this._targetProviders.includes(name)) {
      this._logger.debug(
        `[${name}] SwapAndEnrichInterceptor: Provider not in target list: ${this._targetProviders.join(', ')}`
      );
      return false;
    }

    return true;
  }

  /**
   * Executes entity substitution. Moves original data to nested property and merges substitute with metadata.
   * @param {string} name Provider name.
   * @param {*} data Original entity data.
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {*} Swapped and enriched object if lookup returns data, otherwise original data.
   * @throws {Error} If substitutionLookup logic fails.
   * @protected
   * @override
   */
  _performIntercept(name, data, context, options) {
    try {
      // Query for substitution
      this._logger.debug(`[${name}] SwapAndEnrichInterceptor: Checking for substitution...`);

      const substituteData = this._substitutionLookup(data, context, options);

      // No substitution found - return original data
      if (substituteData == null) {
        this._logger.debug(`[${name}] SwapAndEnrichInterceptor: No substitution found`);
        return data;
      }

      // Substitution found - perform swap & enrich
      this._logger.info(
        `[${name}] SwapAndEnrichInterceptor: Substitution found, performing swap & enrich`
      );

      // Create swapped and enriched entity
      const swappedData = {
        ...substituteData, // Substitute becomes primary
        ...this._metadataFlags, // Add metadata flags
        [this._originalPropertyName]: data // Preserve original
      };

      this._logger.debug(
        `[${name}] SwapAndEnrichInterceptor: Swapped with original stored in '${this._originalPropertyName}'`
      );

      return swappedData;
    } catch (error) {
      this._logger.error(
        `[${name}] SwapAndEnrichInterceptor: Substitution lookup failed: ${error.message}`
      );
      throw new Error(`Substitution lookup failed: ${error.message}`);
    }
  }
}

