/**
 * @file CoreUtilsLib/src/__tests__/RegexUtils.test.js
 * @description Comprehensive test suite for RegexUtils with ReDoS protection
 * @version 1.0
 */

import { RegexUtils } from '../internal/RegexUtils';

describe('RegexUtils - Comprehensive Test Suite', () => {
  describe('escape() - Special Character Escaping', () => {
    it('should escape dot character', () => {
      expect(RegexUtils.escape('hello.world')).toBe('hello\\.world');
    });

    it('should escape asterisk character', () => {
      expect(RegexUtils.escape('file*.txt')).toBe('file\\*\\.txt');
    });

    it('should escape plus character', () => {
      expect(RegexUtils.escape('a+b')).toBe('a\\+b');
    });

    it('should escape question mark character', () => {
      expect(RegexUtils.escape('is this?')).toBe('is this\\?');
    });

    it('should escape caret character', () => {
      expect(RegexUtils.escape('^start')).toBe('\\^start');
    });

    it('should escape dollar sign', () => {
      expect(RegexUtils.escape('price: $10.99')).toBe('price: \\$10\\.99');
    });

    it('should escape curly braces', () => {
      expect(RegexUtils.escape('a{1,3}')).toBe('a\\{1,3\\}');
    });

    it('should escape parentheses', () => {
      expect(RegexUtils.escape('(group)')).toBe('\\(group\\)');
    });

    it('should escape pipe character', () => {
      expect(RegexUtils.escape('a|b')).toBe('a\\|b');
    });

    it('should escape square brackets', () => {
      expect(RegexUtils.escape('[0-9]')).toBe('\\[0-9\\]');
    });

    it('should escape backslash', () => {
      expect(RegexUtils.escape('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('should escape multiple special characters', () => {
      const input = 'What is $10.99? (or more)';
      const expected = 'What is \\$10\\.99\\? \\(or more\\)';
      expect(RegexUtils.escape(input)).toBe(expected);
    });

    it('should return empty string for empty input', () => {
      expect(RegexUtils.escape('')).toBe('');
    });

    it('should not modify strings without special characters', () => {
      expect(RegexUtils.escape('hello world')).toBe('hello world');
    });

    it('should handle Windows file paths', () => {
      const path = 'C:\\Users\\Documents\\file.txt';
      const escaped = RegexUtils.escape(path);
      expect(escaped).toBe('C:\\\\Users\\\\Documents\\\\file\\.txt');

      // Verify it matches literally
      const regex = new RegExp(escaped);
      expect(regex.test(path)).toBe(true);
    });

    it('should handle complex regex patterns', () => {
      const pattern = '(a+)+b*[c-e]{1,2}';
      const escaped = RegexUtils.escape(pattern);

      // Verify escaped pattern matches literally
      const regex = new RegExp(escaped);
      expect(regex.test(pattern)).toBe(true);
      expect(regex.test('aab')).toBe(false);
    });
  });

  describe('validateSafety() - ReDoS Protection', () => {
    describe('Safe Patterns', () => {
      it('should accept simple character class patterns', () => {
        RegexUtils.validateSafety('^[a-z]+$');
        expect(() => RegexUtils.validateSafety('^([a-z]+)+$')).toThrow(/nested quantifiers/);
      });

      it('should accept email-like patterns', () => {
        RegexUtils.validateSafety('^[^@]+@[^@]+\\.[^@]+$');
        expect(() => RegexUtils.validateSafety('^([^@]+)+@[^@]+\\.[^@]+$')).toThrow(
          /nested quantifiers/
        );
      });

      it('should accept digit patterns', () => {
        RegexUtils.validateSafety('\\d{3}-\\d{4}');
        expect(() => RegexUtils.validateSafety('\\d{101}-\\d{4}')).toThrow(/too large/);
      });

      it('should accept word boundary patterns', () => {
        RegexUtils.validateSafety('\\bword\\b');
        expect(() => RegexUtils.validateSafety('\\b(word+)+\\b')).toThrow(/nested quantifiers/);
      });

      it('should accept patterns with small quantifiers', () => {
        RegexUtils.validateSafety('a{1,10}');
        RegexUtils.validateSafety('a{100}');
        expect(() => RegexUtils.validateSafety('a{101}')).toThrow(/too large/);
      });

      it('should accept patterns at max length limit', () => {
        const pattern = 'a'.repeat(500);
        RegexUtils.validateSafety(pattern);
        expect(() => RegexUtils.validateSafety(`${pattern}a`)).toThrow(/too long/);
      });
    });

    describe('Pattern Length Limit', () => {
      it('should reject patterns exceeding 500 characters', () => {
        const longPattern = 'a'.repeat(501);
        expect(() => RegexUtils.validateSafety(longPattern)).toThrow(/too long/);
      });

      it('should include character count in error message', () => {
        const pattern = 'x'.repeat(600);
        expect(() => RegexUtils.validateSafety(pattern)).toThrow(/600 characters/);
      });
    });

    describe('Nested Quantifier Detection', () => {
      it('should reject (a+)+ pattern', () => {
        expect(() => RegexUtils.validateSafety('(a+)+')).toThrow(/nested quantifiers/i);
      });

      it('should reject (a*)* pattern', () => {
        expect(() => RegexUtils.validateSafety('(a*)*')).toThrow(/nested quantifiers/i);
      });

      it('should reject (a+)* pattern', () => {
        expect(() => RegexUtils.validateSafety('(a+)*')).toThrow(/nested quantifiers/i);
      });

      it('should reject (a?){3} pattern', () => {
        expect(() => RegexUtils.validateSafety('(a?){3}')).toThrow(/nested quantifiers/i);
      });

      it('should reject character class with internal quantifier followed by outer quantifier', () => {
        // The implementation detects patterns like [a*]+ where a quantifier is inside brackets
        // followed by an outer quantifier - this matches [^\]]*[*+?]\][*+?{]
        expect(() => RegexUtils.validateSafety('[a*]+')).toThrow(/nested quantifiers/i);
      });

      it('should reject complex nested patterns', () => {
        expect(() => RegexUtils.validateSafety('(ab+cd*)+e')).toThrow(/nested quantifiers/i);
      });
    });

    describe('Excessive Quantifier Detection', () => {
      it('should reject {101} quantifier', () => {
        expect(() => RegexUtils.validateSafety('a{101}')).toThrow(/too large/);
      });

      it('should reject {200} quantifier', () => {
        expect(() => RegexUtils.validateSafety('x{200}')).toThrow(/too large/);
      });

      it('should reject {999,1000} quantifier', () => {
        expect(() => RegexUtils.validateSafety('y{999,1000}')).toThrow(/too large/);
      });

      it('should accept {100} quantifier (boundary)', () => {
        RegexUtils.validateSafety('z{100}');
        expect(() => RegexUtils.validateSafety('z{101}')).toThrow(/too large/);
      });

      it('should accept {50,100} quantifier', () => {
        RegexUtils.validateSafety('a{50,100}');
        expect(() => RegexUtils.validateSafety('a{101,200}')).toThrow(/too large/);
      });
    });

    describe('Alternation Warning', () => {
      it('should warn about (a|b)+ patterns with logger', () => {
        const mockLogger = { warn: jest.fn() };
        RegexUtils.validateSafety('(a|b)+', mockLogger);
        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('alternation'));
      });

      it('should not throw for alternation patterns', () => {
        // Alternation is a warning, not an error
        const logger = { warn: jest.fn() };
        RegexUtils.validateSafety('(hello|world)+', logger);
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('alternation'));
        expect(() => RegexUtils.validateSafety('(hello+)+')).toThrow(/nested quantifiers/);
      });

      it('should work without logger', () => {
        RegexUtils.validateSafety('(a|b)+', null);
        expect(() => RegexUtils.validateSafety('(a+)+', null)).toThrow(/nested quantifiers/);
      });
    });
  });

  describe('createSafeRegex() - Safe RegExp Factory', () => {
    it('should create RegExp for safe patterns', () => {
      const regex = RegexUtils.createSafeRegex('^[a-z]+$');
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.test('hello')).toBe(true);
    });

    it('should support flags', () => {
      const regex = RegexUtils.createSafeRegex('hello', 'i');
      expect(regex.test('HELLO')).toBe(true);
    });

    it('should support global flag', () => {
      const regex = RegexUtils.createSafeRegex('[a-z]+', 'g');
      expect('abc 123 def'.match(regex)).toEqual(['abc', 'def']);
    });

    it('should reject unsafe patterns', () => {
      expect(() => RegexUtils.createSafeRegex('(a+)+')).toThrow(/nested quantifiers/i);
    });

    it('should reject patterns exceeding length limit', () => {
      const longPattern = 'x'.repeat(501);
      expect(() => RegexUtils.createSafeRegex(longPattern)).toThrow(/too long/);
    });

    it('should reject invalid regex syntax', () => {
      expect(() => RegexUtils.createSafeRegex('[')).toThrow(/Invalid regex/);
    });

    it('should reject unbalanced parentheses', () => {
      expect(() => RegexUtils.createSafeRegex('(abc')).toThrow(/Invalid regex/);
    });

    it('should accept logger for warnings', () => {
      const mockLogger = { warn: jest.fn() };
      const regex = RegexUtils.createSafeRegex('(a|b)+', '', mockLogger);
      expect(regex).toBeInstanceOf(RegExp);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should safely match email addresses', () => {
      const pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
      RegexUtils.validateSafety(pattern);
      const regex = RegexUtils.createSafeRegex(pattern);

      expect(regex.test('user@example.com')).toBe(true);
      expect(regex.test('user.name+tag@example.co.uk')).toBe(true);
      expect(regex.test('invalid')).toBe(false);
    });

    it('should safely match phone numbers', () => {
      const pattern = '^\\d{3}[-.]?\\d{3}[-.]?\\d{4}$';
      const regex = RegexUtils.createSafeRegex(pattern);

      expect(regex.test('123-456-7890')).toBe(true);
      expect(regex.test('123.456.7890')).toBe(true);
      expect(regex.test('1234567890')).toBe(true);
    });

    it('should safely match URLs', () => {
      const pattern = '^https?://[a-zA-Z0-9][a-zA-Z0-9.-]+[a-zA-Z0-9]';
      const regex = RegexUtils.createSafeRegex(pattern);

      expect(regex.test('https://example.com')).toBe(true);
      expect(regex.test('http://sub.domain.org')).toBe(true);
    });

    it('should escape user search input for literal matching', () => {
      const userInput = 'What is $10.99?';
      const escaped = RegexUtils.escape(userInput);
      const regex = new RegExp(escaped);

      expect(regex.test(userInput)).toBe(true);
      expect(regex.test('What is X10.99?')).toBe(false);
    });

    it('should prevent ReDoS from malicious patterns', () => {
      // These patterns would cause catastrophic backtracking
      const maliciousPatterns = [
        '(a+)+',
        '(a*)*',
        '(a?)*',
        '(a+)+b',
        '([a-z]+)+',
        'a'.repeat(600),
        'x{1000}'
      ];

      for (const pattern of maliciousPatterns) {
        expect(() => RegexUtils.validateSafety(pattern)).toThrow();
      }
    });

    it('should handle SQL LIKE pattern conversion', () => {
      // Convert SQL LIKE pattern to regex safely
      const likePattern = 'prefix%suffix_';
      const escaped = RegexUtils.escape(likePattern);

      // The escaped pattern should be literal
      expect(escaped).toBe('prefix%suffix_');

      // Now we can safely replace wildcards
      const regexPattern = escaped.replace(/%/g, '.*').replace(/_/g, '.');

      // Validate the resulting pattern is safe
      expect(() => RegexUtils.validateSafety(regexPattern)).not.toThrow();
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle patterns with unicode characters', () => {
      const pattern = '^[\\u0400-\\u04FF]+$'; // Cyrillic
      const regex = RegexUtils.createSafeRegex(pattern);
      expect(regex).toBeInstanceOf(RegExp);
    });

    it('should handle escaped special characters in patterns', () => {
      const pattern = '\\[\\]\\(\\)\\{\\}';
      const regex = RegexUtils.createSafeRegex(pattern);
      expect(regex.test('[](){}')).toBe(true);
    });

    it('should handle lookahead patterns', () => {
      const pattern = '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}$';
      const regex = RegexUtils.createSafeRegex(pattern);
      expect(regex.test('Password1')).toBe(true);
      expect(regex.test('password')).toBe(false);
    });

    it('should handle quantifier at exact limit {100}', () => {
      const pattern = 'a{100}';
      RegexUtils.validateSafety(pattern);
      expect(() => RegexUtils.validateSafety('a{101}')).toThrow(/too large/);
    });

    it('should reject quantifier just over limit {101}', () => {
      const pattern = 'a{101}';
      expect(() => RegexUtils.validateSafety(pattern)).toThrow(/too large/);
    });
  });
});
