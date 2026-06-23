/**
 * @file CoreUtilsLib/src/PlaceholderUtils.js
 * @description Utilities for working with placeholder patterns like {{fieldName}}.
 * Centralizes placeholder extraction and manipulation across all GasLibraryFactory libraries.
 * @version 1.0.0
 */

/**
 * Static utility for mustache-style placeholder extraction, detection, and basic replacement.
 * @class PlaceholderUtils
 */
export class PlaceholderUtils {
  /**
   * Pattern for matching mustache-style delimiters {{...}} including filters.
   * @static
   * @type {RegExp}
   */
  static get PLACEHOLDER_PATTERN() {
    return /\{\{([^}]+)\}\}/g;
  }

  /**
   * Pattern for matching recipe parameter references @paramName.
   * @static
   * @type {RegExp}
   */
  static get PARAM_PATTERN() {
    return /@(\w+)/g;
  }

  /**
   * Pattern for matching provider output references $providerName.property.
   * @static
   * @type {RegExp}
   */
  static get PROVIDER_PATTERN() {
    return /\$(\w+)(?:\.(\w+(?:\.\w+)*))?/g;
  }

  /**
   * Extract raw content from all {{...}} blocks in a template.
   * @param {string} template - Input string to parse.
   * @returns {string[]} Collection of raw placeholder segments.
   */
  static extractPlaceholders(template) {
    if (typeof template !== 'string') {
      return [];
    }

    const matches = [];
    const regex = new RegExp(PlaceholderUtils.PLACEHOLDER_PATTERN.source, 'g');
    let match;

    while ((match = regex.exec(template)) !== null) {
      matches.push(match[1].trim());
    }

    return matches;
  }

  /**
   * Extract field identifiers from placeholders, stripping filter syntax.
   * @param {string} template - Input string to parse.
   * @returns {string[]} Collection of cleaned field names.
   */
  static extractPlaceholderNames(template) {
    const placeholders = PlaceholderUtils.extractPlaceholders(template);
    return placeholders.map((p) => {
      // Remove filter syntax (everything after |)
      const pipeIndex = p.indexOf('|');
      return (pipeIndex >= 0 ? p.substring(0, pipeIndex) : p).trim();
    });
  }

  /**
   * Extract a unique set of field identifiers from a template.
   * @param {string} template - Input string to parse.
   * @returns {string[]} De-duplicated collection of field names.
   */
  static extractUniquePlaceholderNames(template) {
    const names = PlaceholderUtils.extractPlaceholderNames(template);
    return [...new Set(names)];
  }

  /**
   * Validate if a string contains any mustache-style placeholders.
   * @param {string} str - String to inspect.
   * @returns {boolean} True if placeholders are detected.
   */
  static hasPlaceholders(str) {
    if (typeof str !== 'string') {
      return false;
    }
    return PlaceholderUtils.PLACEHOLDER_PATTERN.test(str);
  }

  /**
   * Quantify the number of placeholder occurrences in a string.
   * @param {string} str - String to inspect.
   * @returns {number} Frequency of placeholders.
   */
  static countPlaceholders(str) {
    return PlaceholderUtils.extractPlaceholders(str).length;
  }

  /**
   * Isolate @param identifiers from strings or complex nested objects.
   * @param {*} value - Data structure to scan.
   * @returns {string[]} Collection of parameter names without prefixes.
   */
  static extractParamReferences(value) {
    const refs = [];

    if (typeof value === 'string') {
      const regex = new RegExp(PlaceholderUtils.PARAM_PATTERN.source, 'g');
      let match;
      while ((match = regex.exec(value)) !== null) {
        refs.push(match[1]);
      }
    } else if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        refs.push(...PlaceholderUtils.extractParamReferences(value[key]));
      }
    }

    return refs;
  }

  /**
   * Isolate $provider identifiers and property paths from strings or objects.
   * @param {*} value - Data structure to scan.
   * @returns {Array<{provider: string, property: string|null}>} Collection of provider metadata.
   */
  static extractProviderReferences(value) {
    const refs = [];

    if (typeof value === 'string') {
      const regex = new RegExp(PlaceholderUtils.PROVIDER_PATTERN.source, 'g');
      let match;
      while ((match = regex.exec(value)) !== null) {
        refs.push({
          provider: match[1],
          property: match[2] || null
        });
      }
    } else if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        refs.push(...PlaceholderUtils.extractProviderReferences(value[key]));
      }
    }

    return refs;
  }

  /**
   * Validate if a data structure contains any @param references.
   * @param {*} value - Data structure to inspect.
   * @returns {boolean} True if references are found.
   */
  static hasParamReferences(value) {
    return PlaceholderUtils.extractParamReferences(value).length > 0;
  }

  /**
   * Validate if a data structure contains any $provider references.
   * @param {*} value - Data structure to inspect.
   * @returns {boolean} True if references are found.
   */
  static hasProviderReferences(value) {
    return PlaceholderUtils.extractProviderReferences(value).length > 0;
  }

  /**
   * Perform basic string interpolation using a flat or nested context object.
   * @param {string} template - Text containing placeholders.
   * @param {Object} context - Data source for replacement.
   * @param {Object} [options={}] - Configuration for missing value handling.
   * @returns {string} Interpolated result string.
   */
  static replacePlaceholders(template, context, options = {}) {
    if (typeof template !== 'string') {
      return template;
    }

    const { undefinedValue = '', keepUndefined = false } = options;

    return template.replace(PlaceholderUtils.PLACEHOLDER_PATTERN, (match, placeholder) => {
      const fieldName = placeholder.trim().split('|')[0].trim();
      const value = PlaceholderUtils._getNestedValue(context, fieldName);

      if (value === undefined) {
        return keepUndefined ? match : undefinedValue;
      }

      return String(value);
    });
  }

  /**
   * Resolve a nested property value using dot-notation paths.
   * @private
   * @param {Object} obj - Source object.
   * @param {string} path - Target property path (e.g., 'user.profile.id').
   * @returns {*} Resolved value or undefined.
   */
  static _getNestedValue(obj, path) {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Verify placeholder coverage against a specific data context.
   * @param {string} template - Text to validate.
   * @param {Object} context - Data source for verification.
   * @returns {{valid: boolean, missing: string[]}} Results mapping missing identifiers.
   */
  static validatePlaceholders(template, context) {
    const names = PlaceholderUtils.extractUniquePlaceholderNames(template);
    const missing = [];

    for (const name of names) {
      const value = PlaceholderUtils._getNestedValue(context, name);
      if (value === undefined) {
        missing.push(name);
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Escape mustache delimiters to prevent accidental interpolation.
   * @param {string} str - Text to process.
   * @returns {string} Text with escaped delimiters.
   */
  static escapePlaceholders(str) {
    if (typeof str !== 'string') {
      return str;
    }
    return str.replace(/\{\{/g, '\\{\\{').replace(/\}\}/g, '\\}\\}');
  }

  /**
   * Restore escaped mustache delimiters to their raw format.
   * @param {string} str - Text to process.
   * @returns {string} Text with raw delimiters.
   */
  static unescapePlaceholders(str) {
    if (typeof str !== 'string') {
      return str;
    }
    return str.replace(/\\\{\\\{/g, '{{').replace(/\\\}\\\}/g, '}}');
  }
}
