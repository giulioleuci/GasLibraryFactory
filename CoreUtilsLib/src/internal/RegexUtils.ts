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
  static escape(str: string) {
    // Escape all special regex characters: . * + ? ^ $ { } ( ) | [ ] \
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Validate a regex pattern for potential catastrophic backtracking or ReDoS vulnerabilities.
   * @param {string} pattern - Regex structure to test.
   * @param {Object} [logger=null] - Optional diagnostic reporter.
   * @throws {Error} If the pattern violates complexity or safety constraints.
   */
  static validateSafety(
    pattern: string,
    logger: { warn?: (message: string) => void } | null = null
  ) {
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
  static createSafeRegex(
    pattern: string,
    flags = '',
    logger: { warn?: (message: string) => void } | null = null
  ) {
    // Validate pattern safety
    RegexUtils.validateSafety(pattern, logger);

    // Try to create the RegExp
    try {
      return new RegExp(pattern, flags);
    } catch (err) {
      throw new Error(`Invalid regex pattern: ${(err as Error).message}`);
    }
  }
}
