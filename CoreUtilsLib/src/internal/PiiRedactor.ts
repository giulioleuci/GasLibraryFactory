/**
 * @file CoreUtilsLib/src/PiiRedactor.js
 * @description Utility for redacting Personally Identifiable Information (PII) from strings.
 * Provides comprehensive redaction for common PII patterns in error messages and logs.
 * @version 1.0.0
 */

/**
 * Static utility for detecting and masking Personally Identifiable Information (PII) using regex patterns.
 * @class PiiRedactor
 */
export class PiiRedactor {
  /**
   * Default masking labels for recognized PII categories.
   * @static
   * @type {Object<string, string>}
   */
  static get REDACTION_LABELS() {
    return {
      EMAIL: '[EMAIL_REDACTED]',
      TOKEN: '[TOKEN_REDACTED]',
      API_KEY: '[KEY_REDACTED]',
      URL_PARAMS: '[PARAMS_REDACTED]',
      JWT: '[JWT_REDACTED]',
      CREDIT_CARD: '[CC_REDACTED]',
      PHONE: '[PHONE_REDACTED]',
      SESSION_ID: '[ID_REDACTED]'
    };
  }

  /**
   * Collection of regular expressions for PII detection.
   * @static
   * @type {Object<string, RegExp>}
   */
  static get PATTERNS() {
    return {
      EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      TOKEN: /\b(bearer|token|oauth)\s+[\w\-._~+/]+=*/gi,
      API_KEY: /\b(api[_-]?key|apikey|key)[=:]\s*['"]?[\w-]{20,}['"]?/gi,
      URL_PARAMS: /(https?:\/\/[^\s?]+)\?[^\s]*/gi,
      JWT: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
      CREDIT_CARD: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      PHONE: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      SESSION_ID: /\b[A-Fa-f0-9]{32,}\b/g
    };
  }

  /**
   * Mask all recognized PII patterns within a text string.
   * @param {string} message - Input text to sanitize.
   * @returns {string} Sanitized string with masked placeholders.
   */
  static redact(message: unknown): string {
    if (typeof message !== 'string') {
      return String(message);
    }

    let sanitized = message;
    const labels = PiiRedactor.REDACTION_LABELS;
    const patterns = PiiRedactor.PATTERNS;

    // Apply redactions in order
    sanitized = sanitized.replace(patterns.EMAIL, labels.EMAIL);
    sanitized = sanitized.replace(patterns.TOKEN, '$1 ' + labels.TOKEN);
    sanitized = sanitized.replace(patterns.API_KEY, '$1=' + labels.API_KEY);
    sanitized = sanitized.replace(patterns.URL_PARAMS, '$1?' + labels.URL_PARAMS);
    sanitized = sanitized.replace(patterns.JWT, labels.JWT);
    sanitized = sanitized.replace(patterns.CREDIT_CARD, labels.CREDIT_CARD);
    sanitized = sanitized.replace(patterns.PHONE, labels.PHONE);
    sanitized = sanitized.replace(patterns.SESSION_ID, labels.SESSION_ID);

    return sanitized;
  }
}
