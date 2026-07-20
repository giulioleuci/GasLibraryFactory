import he from 'he';

/**
 * Escapes text for an HTML text node while preserving the legacy five-character
 * output used by HtmlSanitizer.
 * @param {*} value Raw value; nullish values become an empty string.
 * @returns {string} HTML-escaped text.
 */
export function escapeHtmlText(value) {
  const escaped = he.escape(String(value ?? ''), { useNamedReferences: true, decimal: false });

  return escaped
    .replace(/©/g, he.encode('©', { useNamedReferences: true, decimal: false }))
    .replace(/&#x27;/g, '&#39;');
}

/**
 * Decodes HTML entities in a null-safe input value.
 * @param {*} value Entity-encoded text; nullish values become an empty string.
 * @returns {string} Decoded text.
 */
export function decodeHtmlEntities(value) {
  return he.decode(String(value ?? ''));
}
