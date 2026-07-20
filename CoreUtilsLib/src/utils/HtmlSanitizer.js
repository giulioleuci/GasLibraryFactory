import { escapeHtmlText } from '../internal/HtmlEntityCodec.js';

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
   * Null-safe: `null`/`undefined` are coerced to `''` (not the throw or the
   * literal string `"null"`).
   * @param {*} value Raw text (coerced to string; `null`/`undefined` become `''`).
   * @returns {string} HTML-escaped text.
   */
  static escapeHtml(value) {
    return escapeHtmlText(value);
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

  /**
   * Recursively walks a plain object/array (e.g. a CDU context) and HTML-escapes
   * every string leaf via {@link HtmlSanitizer.escapeHtml}, returning a **new**
   * structure — the input is never mutated. Intended for callers who must render
   * an admin-authored Mustache template (`{{var}}`, which does not itself escape)
   * against untrusted data (e.g. student/parent names imported from spreadsheets)
   * into an HTML email body: escape the context once with this method, then pass
   * the result into the existing (non-escaping) `processString`/`render`.
   *
   * Non-string leaves (numbers, booleans, `null`, `undefined`) are returned
   * unchanged — they are not coerced to strings, so template logic that branches
   * on falsiness/type (e.g. `{{#count}}`) keeps working. Only plain objects
   * (object literals, or objects with `null` prototype) and arrays are recursed
   * into; other object types (`Date`, class instances, functions, etc.) are
   * returned as-is, unescaped and unrecursed, since walking their internals
   * could break them (e.g. a `Date`'s methods) or silently discard data.
   * @param {*} value Raw value — typically a context object, but any shape is
   *   accepted (arrays and primitives included) since the function recurses.
   * @returns {*} A deep copy with every string leaf HTML-escaped; non-plain
   *   objects/functions/primitives other than strings pass through unchanged.
   */
  static escapeContextDeep(value) {
    if (typeof value === 'string') {
      return HtmlSanitizer.escapeHtml(value);
    }
    if (Array.isArray(value)) {
      return value.map((item) => HtmlSanitizer.escapeContextDeep(item));
    }
    if (value !== null && typeof value === 'object') {
      const proto = Object.getPrototypeOf(value);
      const isPlainObject = proto === Object.prototype || proto === null;
      if (!isPlainObject) {
        return value;
      }
      const result = {};
      for (const key of Object.keys(value)) {
        result[key] = HtmlSanitizer.escapeContextDeep(value[key]);
      }
      return result;
    }
    return value;
  }
}
