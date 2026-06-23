/**
 * @file CoreUtilsLib/src/RegexUtils.js
 * @description Regular expression utilities for safe regex handling and escaping.
 * Provides ReDoS (Regular Expression Denial of Service) protection and regex escaping.
 * @version 1.0
 */

/**
 * Static security utility for safe regular expression handling and ReDoS prevention.
 * @class RegexUtils
 */
export class RegexUtils {
  /**
   * Escape special characters in a string for literal matching within a regular expression.
   * @param {string} str - Text to escape.
   * @returns {string} Sanitized string safe for literal RegExp inclusion.
   */
  static escape(str) {
    // Escape all special regex characters: . * + ? ^ $ { } ( ) | [ ] \
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Validate a regex pattern for potential catastrophic backtracking or ReDoS vulnerabilities.
   * @param {string} pattern - Regex structure to test.
   * @param {Object} [logger=null] - Optional diagnostic reporter.
   * @throws {Error} If the pattern violates complexity or safety constraints.
   */
  static validateSafety(pattern, logger = null) {
    // SEC-003: Maximum regex length to prevent complexity attacks
    const MAX_REGEX_LENGTH = 500;
    if (pattern.length > MAX_REGEX_LENGTH) {
      throw new Error(
        `Regex pattern too long (max ${MAX_REGEX_LENGTH} characters): ${pattern.length} characters`
      );
    }

    // Check for nested quantifiers (catastrophic backtracking patterns)
    // Patterns like (a+)+, (a*)*, (a+)*, (a?)+, etc.
    // These can cause exponential time complexity
    const nestedQuantifiers = /(\([^)]*[*+?]\)[*+?{])|(\[[^\]]*[*+?]\][*+?{])/;
    if (nestedQuantifiers.test(pattern)) {
      throw new Error('Regex pattern contains nested quantifiers which can cause ReDoS attacks');
    }

    // Check for excessive repetition quantifiers
    // e.g., a{101}, a{200,300}
    const excessiveRepetition = /\{(\d+),?\d*\}/g;
    let match;
    while ((match = excessiveRepetition.exec(pattern)) !== null) {
      const min = parseInt(match[1], 10);
      if (min > 100) {
        throw new Error(`Regex quantifier too large: {${match[1]}} (max 100)`);
      }
    }

    // Check for alternation with overlapping patterns followed by quantifiers
    // e.g., (a|a)+ or (ab|a)+ can cause exponential backtracking
    const dangerousAlternation = /\([^)]*\|[^)]*\)[*+]/;
    if (dangerousAlternation.test(pattern)) {
      if (logger && typeof logger.warn === 'function') {
        logger.warn(
          'Regex pattern contains alternation with quantifiers which may cause performance issues'
        );
      }
    }
  }

  /**
   * Initialize a validated RegExp instance, enforcing ReDoS protection.
   * @param {string} pattern - Regex structure to test and instantiate.
   * @param {string} [flags=''] - Standard RegExp control flags.
   * @param {Object} [logger=null] - Optional diagnostic reporter.
   * @returns {RegExp} Validated regular expression object.
   * @throws {Error} If the pattern is unsafe or syntactically invalid.
   */
  static createSafeRegex(pattern, flags = '', logger = null) {
    // Validate pattern safety
    RegexUtils.validateSafety(pattern, logger);

    // Try to create the RegExp
    try {
      return new RegExp(pattern, flags);
    } catch (err) {
      throw new Error(`Invalid regex pattern: ${err.message}`);
    }
  }

  /**
   * Execute a regex test with pre-flight safety validation.
   * @param {string} str - Text to test.
   * @param {string} pattern - Regex structure to validate and apply.
   * @param {string} [flags=''] - Standard RegExp control flags.
   * @param {Object} [logger=null] - Optional diagnostic reporter.
   * @returns {boolean} True if the string satisfies the validated pattern.
   * @throws {Error} If the pattern is unsafe or invalid.
   */
  static testSafe(str, pattern, flags = '', logger = null) {
    const regex = RegexUtils.createSafeRegex(pattern, flags, logger);
    return regex.test(str);
  }

  /**
   * Extract matches from a string using a pre-validated, safe regex pattern.
   * @param {string} str - Text to scan.
   * @param {string} pattern - Regex structure to validate and apply.
   * @param {string} [flags=''] - Standard RegExp control flags.
   * @param {Object} [logger=null] - Optional diagnostic reporter.
   * @returns {Array|null} Collection of matches or null.
   * @throws {Error} If the pattern is unsafe or invalid.
   */
  static matchSafe(str, pattern, flags = '', logger = null) {
    const regex = RegexUtils.createSafeRegex(pattern, flags, logger);
    return str.match(regex);
  }

  /**
   * Evaluate regex pattern safety without throwing exceptions.
   * @param {string} pattern - Regex structure to analyze.
   * @returns {Object} Diagnostic result: {safe: boolean, warnings: string[]}.
   */
  static checkSafety(pattern) {
    const warnings = [];
    let safe = true;

    // Check length
    const MAX_REGEX_LENGTH = 500;
    if (pattern.length > MAX_REGEX_LENGTH) {
      warnings.push(`Pattern too long: ${pattern.length} characters (max ${MAX_REGEX_LENGTH})`);
      safe = false;
    }

    // Check for nested quantifiers
    const nestedQuantifiers = /(\([^)]*[*+?]\)[*+?{])|(\[[^\]]*[*+?]\][*+?{])/;
    if (nestedQuantifiers.test(pattern)) {
      warnings.push('Nested quantifiers detected (can cause ReDoS)');
      safe = false;
    }

    // Check for excessive repetition
    const excessiveRepetition = /\{(\d+),?\d*\}/g;
    let match;
    while ((match = excessiveRepetition.exec(pattern)) !== null) {
      const min = parseInt(match[1], 10);
      if (min > 100) {
        warnings.push(`Excessive quantifier: {${match[1]}} (max 100)`);
        safe = false;
      }
    }

    // Check for dangerous alternation
    const dangerousAlternation = /\([^)]*\|[^)]*\)[*+]/;
    if (dangerousAlternation.test(pattern)) {
      warnings.push('Alternation with quantifiers (may cause performance issues)');
      // Note: This is a warning, not necessarily unsafe
    }

    return { safe, warnings };
  }
}
