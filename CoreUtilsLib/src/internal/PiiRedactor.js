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
  static redact(message) {
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

  /**
   * Mask email addresses using a specific or default placeholder.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
  static redactEmails(message, label = PiiRedactor.REDACTION_LABELS.EMAIL) {
    if (typeof message !== 'string') {
      return String(message);
    }
    return message.replace(PiiRedactor.PATTERNS.EMAIL, label);
  }

  /**
   * Mask OAuth and Bearer tokens while preserving the prefix.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
  static redactTokens(message, label = PiiRedactor.REDACTION_LABELS.TOKEN) {
    if (typeof message !== 'string') {
      return String(message);
    }
    return message.replace(PiiRedactor.PATTERNS.TOKEN, '$1 ' + label);
  }

  /**
   * Mask API keys identified by common key-value delimiters.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
  static redactApiKeys(message, label = PiiRedactor.REDACTION_LABELS.API_KEY) {
    if (typeof message !== 'string') {
      return String(message);
    }
    return message.replace(PiiRedactor.PATTERNS.API_KEY, '$1=' + label);
  }

  /**
   * Mask URL query parameters to prevent exposure of sensitive GET data.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
  static redactUrlParams(message, label = PiiRedactor.REDACTION_LABELS.URL_PARAMS) {
    if (typeof message !== 'string') {
      return String(message);
    }
    return message.replace(PiiRedactor.PATTERNS.URL_PARAMS, '$1?' + label);
  }

  /**
   * Mask JSON Web Tokens (JWT) based on base64 segment patterns.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
  static redactJwt(message, label = PiiRedactor.REDACTION_LABELS.JWT) {
    if (typeof message !== 'string') {
      return String(message);
    }
    return message.replace(PiiRedactor.PATTERNS.JWT, label);
  }

  /**
   * Mask credit card numbers matching 16-digit patterns.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
  static redactCreditCards(message, label = PiiRedactor.REDACTION_LABELS.CREDIT_CARD) {
    if (typeof message !== 'string') {
      return String(message);
    }
    return message.replace(PiiRedactor.PATTERNS.CREDIT_CARD, label);
  }

  /**
   * Mask phone numbers matching common US and international formats.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
  static redactPhones(message, label = PiiRedactor.REDACTION_LABELS.PHONE) {
    if (typeof message !== 'string') {
      return String(message);
    }
    return message.replace(PiiRedactor.PATTERNS.PHONE, label);
  }

  /**
   * Mask long hexadecimal strings often used as session identifiers.
   * @param {string} message - Input text to sanitize.
   * @param {string} [label] - Override placeholder string.
   * @returns {string} Sanitized string.
   */
  static redactSessionIds(message, label = PiiRedactor.REDACTION_LABELS.SESSION_ID) {
    if (typeof message !== 'string') {
      return String(message);
    }
    return message.replace(PiiRedactor.PATTERNS.SESSION_ID, label);
  }

  /**
   * Validate if a string contains any detectable PII patterns.
   * @param {string} message - Text to inspect.
   * @returns {boolean} True if any pattern matches.
   */
  static containsPii(message) {
    if (typeof message !== 'string') {
      return false;
    }

    const patterns = PiiRedactor.PATTERNS;
    return (
      patterns.EMAIL.test(message) ||
      patterns.TOKEN.test(message) ||
      patterns.API_KEY.test(message) ||
      patterns.JWT.test(message) ||
      patterns.CREDIT_CARD.test(message) ||
      patterns.PHONE.test(message) ||
      patterns.SESSION_ID.test(message)
    );
  }

  /**
   * Isolate which PII categories are present in a message.
   * @param {string} message - Text to inspect.
   * @returns {string[]} List of detected category identifiers (e.g., ['EMAIL', 'PHONE']).
   */
  static detectPiiTypes(message) {
    if (typeof message !== 'string') {
      return [];
    }

    const detected = [];
    const patterns = PiiRedactor.PATTERNS;

    // Reset regex lastIndex for global patterns
    Object.keys(patterns).forEach((key) => {
      patterns[key].lastIndex = 0;
    });

    if (patterns.EMAIL.test(message)) {
      detected.push('EMAIL');
    }
    patterns.EMAIL.lastIndex = 0;

    if (patterns.TOKEN.test(message)) {
      detected.push('TOKEN');
    }
    patterns.TOKEN.lastIndex = 0;

    if (patterns.API_KEY.test(message)) {
      detected.push('API_KEY');
    }
    patterns.API_KEY.lastIndex = 0;

    if (patterns.JWT.test(message)) {
      detected.push('JWT');
    }
    patterns.JWT.lastIndex = 0;

    if (patterns.CREDIT_CARD.test(message)) {
      detected.push('CREDIT_CARD');
    }
    patterns.CREDIT_CARD.lastIndex = 0;

    if (patterns.PHONE.test(message)) {
      detected.push('PHONE');
    }
    patterns.PHONE.lastIndex = 0;

    if (patterns.SESSION_ID.test(message)) {
      detected.push('SESSION_ID');
    }
    patterns.SESSION_ID.lastIndex = 0;

    return detected;
  }
}
