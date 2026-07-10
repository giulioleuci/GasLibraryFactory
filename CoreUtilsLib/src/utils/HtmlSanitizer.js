/**
 * @file CoreUtilsLib/src/utils/HtmlSanitizer.js
 * @description Centralized HTML-context escaping utilities (XSS prevention) for
 * rendering sheet-sourced free text/colours/URLs into generated HTML (e.g. ALDO
 * email boxes). Ported 1:1 from ALDO's `src/application/email/boxes.ts`.
 */

/**
 * Static utilities for escaping/validating sheet-sourced values before HTML
 * interpolation. Stateless, so all methods are static (matches the
 * `ValidationUtils` convention used elsewhere in this library).
 * @class
 */
export class HtmlSanitizer {
  /**
   * Escapes `&`, `<`, `>`, `"`, `'` so free text is safe to interpolate into
   * HTML markup (e.g. names, notes, error strings sourced from sheets).
   * @param {string} value Raw text.
   * @returns {string} HTML-escaped text.
   */
  static escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Validates a sheet-sourced colour value going into a style attribute: only
   * hex codes (`#` + 3-8 hex digits) or bare CSS colour keywords pass.
   * @param {string} value Raw colour value.
   * @param {string} fallback Value returned when `value` fails validation.
   * @returns {string} `value` if safe, otherwise `fallback`.
   */
  static safeColor(value, fallback) {
    return /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/.test(value) ? value : fallback;
  }

  /**
   * Validates a sheet-sourced link target: only `http(s)` URLs pass (blocks
   * `javascript:`/`data:`/other schemes). Input is trimmed before testing and
   * before being returned.
   * @param {string} value Raw URL value.
   * @returns {string} The trimmed URL if safe, otherwise `'#'`.
   */
  static safeUrl(value) {
    return /^https?:\/\//i.test(value.trim()) ? value.trim() : '#';
  }
}
