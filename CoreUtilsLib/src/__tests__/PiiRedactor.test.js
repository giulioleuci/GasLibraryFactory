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

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      expect(PiiRedactor.redact('')).toBe('');
    });

    it('should handle emails with plus signs', () => {
      const result = PiiRedactor.redact('test+tag@example.com');
      expect(result).toBe('[EMAIL_REDACTED]');
    });

    it('should handle emails with dots in local part', () => {
      const result = PiiRedactor.redact('first.last@example.com');
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
