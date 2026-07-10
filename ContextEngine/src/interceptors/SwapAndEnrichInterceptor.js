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
   * @param {Function} substitutionLookup Signature depends on mode:
   *   - Default (atomic) mode, `config.targetPaths` absent: `(originalData, context, options) => substituteData|null`.
   *   - `targetPaths` mode: `(item, context, options) => null|{action:'replace',value}|{action:'annotate',meta}|{action:'skip'}`,
   *     called once per array item (via `_forEachAt`) for every configured path. Returning
   *     `null` means "no swap for this item" — this is how a caller expresses a 3-way (or
   *     N-way) domain rule per item, since there is no longer a single whole-payload
   *     boolean decision to make.
   * @param {Object} [config={}] Strategy configuration.
   * @param {string} [config.originalPropertyName='original'] Key for nesting the original entity (atomic mode only).
   * @param {Object} [config.metadataFlags={isSubstitute:true}] Flags to merge into the substituted entity (atomic mode only).
   * @param {string[]|null} [config.targetProviders=null] Specific provider IDs to intercept (null for all).
   * @param {string} [config.optionFlag='applyOverrides'] Option key to check for strategy activation (atomic mode only — see targetPaths note below).
   * @param {string[]|null} [config.targetPaths=null] Dot-paths (resolved via the base class's
   *   `_forEachAt`) to nested arrays inside `data` that should be walked and decided on a
   *   per-item basis, INSTEAD OF the single atomic `data` swap. When absent (default), the
   *   original atomic single-swap behavior is unchanged — this is what keeps existing
   *   consumers backward compatible. When present, `_shouldIntercept`'s `optionFlag` gate is
   *   skipped (see `_shouldIntercept` for why): a single global boolean cannot express
   *   "should this item swap" once the model is N independent per-item decisions across one
   *   or more arrays: that decision now belongs entirely to `substitutionLookup` itself,
   *   which can inspect `options` (e.g. a caller's own enum-valued rule) and return `null`
   *   for "don't swap this one".
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

    /**
     * Target paths to nested arrays for per-item substitution (null = atomic
     * single-swap mode, the original/default behavior).
     * @private
     * @type {string[]|null}
     */
    if (config.targetPaths !== undefined && config.targetPaths !== null) {
      if (
        !Array.isArray(config.targetPaths) ||
        config.targetPaths.some((p) => typeof p !== 'string')
      ) {
        throw new Error(
          'SwapAndEnrichInterceptor: config.targetPaths must be an array of strings if provided'
        );
      }
    }
    this._targetPaths = config.targetPaths || null;
  }

  /**
   * Activates interception based on config.targetProviders and, in atomic
   * mode only, config.optionFlag.
   * @param {string} name Provider name.
   * @param {*} data Provider data.
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {boolean} True if criteria are met.
   * @protected
   * @override
   */
  _shouldIntercept(name, data, context, options) {
    // In targetPaths mode the per-item decision is entirely delegated to
    // substitutionLookup (which can express an N-way domain rule); a single
    // whole-payload boolean optionFlag gate doesn't fit that model, so it is
    // intentionally skipped here (targetProviders scoping still applies).
    if (this._targetPaths === null && options[this._optionFlag] !== true) {
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
   * Executes entity substitution. In `targetPaths` mode, walks each configured
   * path (via the base class's `_forEachAt`) and applies `substitutionLookup`'s
   * per-item outcome; in the default atomic mode, moves the whole `data`
   * payload to a nested property and merges the substitute with metadata (the
   * original, unchanged single-swap behavior).
   * @param {string} name Provider name.
   * @param {*} data Original entity data (atomic mode) or the shared object
   *   containing the arrays at `config.targetPaths` (targetPaths mode).
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {*} `data` in both modes: in atomic mode it is either replaced by
   *   the swapped/enriched object or returned unchanged; in targetPaths mode
   *   `data` itself is mutated in place (matching `_forEachAt`'s contract) and
   *   returned as-is.
   * @throws {Error} If substitutionLookup logic fails.
   * @protected
   * @override
   */
  _performIntercept(name, data, context, options) {
    if (this._targetPaths !== null) {
      return this._performIntercept_targetPaths(name, data, context, options);
    }

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

  /**
   * `targetPaths` mode implementation of `_performIntercept`: walks every
   * configured path via the base class's `_forEachAt` and applies
   * `substitutionLookup`'s per-item outcome. Unlike atomic mode,
   * `substitutionLookup` here returns the 3-way outcome descriptor directly
   * (or `null` for "no swap") — `_forEachAt` applies it; this method does not
   * additionally wrap it in `metadataFlags`/`originalPropertyName`, since
   * those are specific to the atomic mode's "one payload, one substitute"
   * shape and don't generalize to arbitrary per-item outcomes.
   * @param {string} name Provider name.
   * @param {*} data The shared object containing the arrays at `this._targetPaths`.
   * @param {Object} context Current context.
   * @param {Object} options Runtime options.
   * @returns {*} `data`, mutated in place.
   * @private
   */
  _performIntercept_targetPaths(name, data, context, options) {
    for (const path of this._targetPaths) {
      this._forEachAt(data, path, (item, _index, _array) => {
        try {
          return this._substitutionLookup(item, context, options);
        } catch (error) {
          this._logger.error(
            `[${name}] SwapAndEnrichInterceptor: Substitution lookup failed for path '${path}': ${error.message}`
          );
          throw new Error(`Substitution lookup failed: ${error.message}`);
        }
      });
    }
    return data;
  }
}
