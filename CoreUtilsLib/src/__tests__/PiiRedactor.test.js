// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/PiiRedactor.test.js
// ===================================================================
// Comprehensive test suite for PiiRedactor
// Coverage: 100% of all static methods
// ===================================================================

import { PiiRedactor } from '../internal/PiiRedactor';

describe('PiiRedactor - Comprehensive Test Suite', () => {
  // ===================================================================
  // STATIC CONSTANTS
  // ===================================================================

  describe('Static Constants', () => {
    it('should have REDACTION_LABELS constant', () => {
      expect(PiiRedactor.REDACTION_LABELS).toEqual({
        EMAIL: '[EMAIL_REDACTED]',
        TOKEN: '[TOKEN_REDACTED]',
        API_KEY: '[KEY_REDACTED]',
        URL_PARAMS: '[PARAMS_REDACTED]',
        JWT: '[JWT_REDACTED]',
        CREDIT_CARD: '[CC_REDACTED]',
        PHONE: '[PHONE_REDACTED]',
        SESSION_ID: '[ID_REDACTED]'
      });
    });

    it('should have PATTERNS constant with all PII patterns', () => {
      expect(PiiRedactor.PATTERNS.EMAIL).toBeInstanceOf(RegExp);
      expect(PiiRedactor.PATTERNS.TOKEN).toBeInstanceOf(RegExp);
      expect(PiiRedactor.PATTERNS.API_KEY).toBeInstanceOf(RegExp);
      expect(PiiRedactor.PATTERNS.URL_PARAMS).toBeInstanceOf(RegExp);
      expect(PiiRedactor.PATTERNS.JWT).toBeInstanceOf(RegExp);
      expect(PiiRedactor.PATTERNS.CREDIT_CARD).toBeInstanceOf(RegExp);
      expect(PiiRedactor.PATTERNS.PHONE).toBeInstanceOf(RegExp);
      expect(PiiRedactor.PATTERNS.SESSION_ID).toBeInstanceOf(RegExp);
    });
  });

  // ===================================================================
  // redact()
  // ===================================================================

  describe('redact()', () => {
    it('should redact email addresses', () => {
      const input = 'User test@example.com failed login';
      const result = PiiRedactor.redact(input);
      expect(result).toBe('User [EMAIL_REDACTED] failed login');
    });

    it('should redact multiple emails', () => {
      const input = 'From admin@test.com to user@domain.org';
      const result = PiiRedactor.redact(input);
      expect(result).toBe('From [EMAIL_REDACTED] to [EMAIL_REDACTED]');
    });

    it('should redact bearer tokens', () => {
      const input = 'Auth: bearer abc123xyz456';
      const result = PiiRedactor.redact(input);
      expect(result).toContain('[TOKEN_REDACTED]');
    });

    it('should redact API keys', () => {
      const input = 'Using api_key=abcdefghij1234567890123456';
      const result = PiiRedactor.redact(input);
      expect(result).toContain('[KEY_REDACTED]');
    });

    it('should redact URL parameters', () => {
      const input = 'Fetching https://api.example.com/data?token=abc&user=123';
      const result = PiiRedactor.redact(input);
      expect(result).toBe('Fetching https://api.example.com/data?[PARAMS_REDACTED]');
    });

    it('should redact JWT tokens', () => {
      const input =
        'Token: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const result = PiiRedactor.redact(input);
      expect(result).toBe('Token: [JWT_REDACTED]');
    });

    it('should redact credit card numbers', () => {
      const input = 'Card: 4111-1111-1111-1111';
      const result = PiiRedactor.redact(input);
      expect(result).toBe('Card: [CC_REDACTED]');
    });

    it('should redact phone numbers', () => {
      // Simple US phone format without leading special characters
      const input = 'Call 555-123-4567';
      const result = PiiRedactor.redact(input);
      expect(result).toBe('Call [PHONE_REDACTED]');
    });

    it('should redact session IDs', () => {
      const input = 'Session: 5d41402abc4b2a76b9719d911017c592';
      const result = PiiRedactor.redact(input);
      expect(result).toBe('Session: [ID_REDACTED]');
    });

    it('should redact multiple PII types', () => {
      const input = 'User test@example.com called 555-123-4567';
      const result = PiiRedactor.redact(input);
      expect(result).toBe('User [EMAIL_REDACTED] called [PHONE_REDACTED]');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redact(123)).toBe('123');
      expect(PiiRedactor.redact(null)).toBe('null');
      expect(PiiRedactor.redact(undefined)).toBe('undefined');
    });

    it('should preserve text without PII', () => {
      const input = 'Hello world, this is a test message';
      expect(PiiRedactor.redact(input)).toBe(input);
    });
  });

  // ===================================================================
  // Individual redaction methods
  // ===================================================================

  describe('redactEmails()', () => {
    it('should redact emails with default label', () => {
      const result = PiiRedactor.redactEmails('Contact admin@example.com');
      expect(result).toBe('Contact [EMAIL_REDACTED]');
    });

    it('should redact emails with custom label', () => {
      const result = PiiRedactor.redactEmails('Contact admin@example.com', '***HIDDEN***');
      expect(result).toBe('Contact ***HIDDEN***');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redactEmails(123)).toBe('123');
    });
  });

  describe('redactTokens()', () => {
    it('should redact bearer tokens', () => {
      const result = PiiRedactor.redactTokens('Auth: bearer abc123');
      expect(result).toContain('[TOKEN_REDACTED]');
    });

    it('should redact oauth tokens', () => {
      const result = PiiRedactor.redactTokens('oauth xyz789token');
      expect(result).toContain('[TOKEN_REDACTED]');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redactTokens(null)).toBe('null');
    });
  });

  describe('redactApiKeys()', () => {
    it('should redact api_key patterns', () => {
      const result = PiiRedactor.redactApiKeys('Using api_key=abcdefghij1234567890');
      expect(result).toContain('[KEY_REDACTED]');
    });

    it('should redact apikey patterns', () => {
      const result = PiiRedactor.redactApiKeys('apikey: "abcdefghij1234567890"');
      expect(result).toContain('[KEY_REDACTED]');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redactApiKeys(undefined)).toBe('undefined');
    });
  });

  describe('redactUrlParams()', () => {
    it('should redact URL query parameters', () => {
      const result = PiiRedactor.redactUrlParams('https://api.example.com/data?token=abc');
      expect(result).toBe('https://api.example.com/data?[PARAMS_REDACTED]');
    });

    it('should preserve URL without params', () => {
      const result = PiiRedactor.redactUrlParams('https://api.example.com/data');
      expect(result).toBe('https://api.example.com/data');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redactUrlParams(42)).toBe('42');
    });
  });

  describe('redactJwt()', () => {
    it('should redact JWT tokens', () => {
      const jwt =
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const result = PiiRedactor.redactJwt(`Token: ${jwt}`);
      expect(result).toBe('Token: [JWT_REDACTED]');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redactJwt({})).toBe('[object Object]');
    });
  });

  describe('redactCreditCards()', () => {
    it('should redact credit cards with dashes', () => {
      const result = PiiRedactor.redactCreditCards('Card: 4111-1111-1111-1111');
      expect(result).toBe('Card: [CC_REDACTED]');
    });

    it('should redact credit cards with spaces', () => {
      const result = PiiRedactor.redactCreditCards('Card: 4111 1111 1111 1111');
      expect(result).toBe('Card: [CC_REDACTED]');
    });

    it('should redact credit cards without separators', () => {
      const result = PiiRedactor.redactCreditCards('Card: 4111111111111111');
      expect(result).toBe('Card: [CC_REDACTED]');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redactCreditCards(false)).toBe('false');
    });
  });

  describe('redactPhones()', () => {
    it('should redact US phone numbers', () => {
      const result = PiiRedactor.redactPhones('Call 555-123-4567');
      expect(result).toBe('Call [PHONE_REDACTED]');
    });

    it('should redact phone numbers with parentheses', () => {
      // Note: word boundary starts inside parens, so ( is preserved
      const result = PiiRedactor.redactPhones('Call (555) 123-4567');
      expect(result).toBe('Call ([PHONE_REDACTED]');
    });

    it('should redact phone numbers with country code', () => {
      // Note: word boundary starts after +, so + is preserved
      const result = PiiRedactor.redactPhones('Call +1 555 123 4567');
      expect(result).toBe('Call +[PHONE_REDACTED]');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redactPhones([])).toBe('');
    });
  });

  describe('redactSessionIds()', () => {
    it('should redact MD5 hashes', () => {
      const result = PiiRedactor.redactSessionIds('ID: 5d41402abc4b2a76b9719d911017c592');
      expect(result).toBe('ID: [ID_REDACTED]');
    });

    it('should redact SHA-256 hashes', () => {
      const result = PiiRedactor.redactSessionIds(
        'ID: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
      );
      expect(result).toBe('ID: [ID_REDACTED]');
    });

    it('should redact longer hex strings', () => {
      const result = PiiRedactor.redactSessionIds(
        'Token: 1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      expect(result).toBe('Token: [ID_REDACTED]');
    });

    it('should handle non-string input', () => {
      expect(PiiRedactor.redactSessionIds(true)).toBe('true');
    });
  });

  // ===================================================================
  // containsPii()
  // ===================================================================

  describe('containsPii()', () => {
    it('should return true for emails', () => {
      expect(PiiRedactor.containsPii('test@example.com')).toBe(true);
    });

    it('should return true for phone numbers', () => {
      expect(PiiRedactor.containsPii('555-123-4567')).toBe(true);
    });

    it('should return true for credit cards', () => {
      expect(PiiRedactor.containsPii('4111111111111111')).toBe(true);
    });

    it('should return false for clean text', () => {
      expect(PiiRedactor.containsPii('Hello world')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(PiiRedactor.containsPii(123)).toBe(false);
      expect(PiiRedactor.containsPii(null)).toBe(false);
    });
  });

  // ===================================================================
  // detectPiiTypes()
  // ===================================================================

  describe('detectPiiTypes()', () => {
    it('should detect email', () => {
      const types = PiiRedactor.detectPiiTypes('test@example.com');
      expect(types).toContain('EMAIL');
    });

    it('should detect multiple types', () => {
      const types = PiiRedactor.detectPiiTypes('Email: test@example.com, Phone: 555-123-4567');
      expect(types).toContain('EMAIL');
      expect(types).toContain('PHONE');
    });

    it('should return empty array for clean text', () => {
      const types = PiiRedactor.detectPiiTypes('Hello world');
      expect(types).toEqual([]);
    });

    it('should return empty array for non-string input', () => {
      expect(PiiRedactor.detectPiiTypes(123)).toEqual([]);
      expect(PiiRedactor.detectPiiTypes(null)).toEqual([]);
    });

    it('should detect session IDs (MD5)', () => {
      const types = PiiRedactor.detectPiiTypes('5d41402abc4b2a76b9719d911017c592');
      expect(types).toContain('SESSION_ID');
    });

    it('should detect session IDs (SHA-256)', () => {
      const types = PiiRedactor.detectPiiTypes(
        '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
      );
      expect(types).toContain('SESSION_ID');
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      expect(PiiRedactor.redact('')).toBe('');
      expect(PiiRedactor.containsPii('')).toBe(false);
      expect(PiiRedactor.detectPiiTypes('')).toEqual([]);
    });

    it('should handle emails with plus signs', () => {
      const result = PiiRedactor.redactEmails('test+tag@example.com');
      expect(result).toBe('[EMAIL_REDACTED]');
    });

    it('should handle emails with dots in local part', () => {
      const result = PiiRedactor.redactEmails('first.last@example.com');
      expect(result).toBe('[EMAIL_REDACTED]');
    });

    it('should handle mixed content with multiple PII types', () => {
      const input = 'User test@example.com (555-123-4567) paid with 4111-1111-1111-1111';
      const result = PiiRedactor.redact(input);

      expect(result).not.toContain('test@example.com');
      expect(result).not.toContain('555-123-4567');
      expect(result).not.toContain('4111-1111-1111-1111');
    });
  });
});
