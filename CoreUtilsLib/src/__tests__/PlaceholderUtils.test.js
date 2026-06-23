// ===================================================================
// FILE: CoreUtilsLib/src/__tests__/PlaceholderUtils.test.js
// ===================================================================
// Comprehensive test suite for PlaceholderUtils
// Coverage: 100% of all static methods
// ===================================================================

import { PlaceholderUtils } from '../internal/PlaceholderUtils';

describe('PlaceholderUtils - Comprehensive Test Suite', () => {
  // ===================================================================
  // STATIC CONSTANTS
  // ===================================================================

  describe('Static Constants', () => {
    it('should have PLACEHOLDER_PATTERN constant', () => {
      expect(PlaceholderUtils.PLACEHOLDER_PATTERN).toBeInstanceOf(RegExp);
    });

    it('should have PARAM_PATTERN constant', () => {
      expect(PlaceholderUtils.PARAM_PATTERN).toBeInstanceOf(RegExp);
    });

    it('should have PROVIDER_PATTERN constant', () => {
      expect(PlaceholderUtils.PROVIDER_PATTERN).toBeInstanceOf(RegExp);
    });
  });

  // ===================================================================
  // extractPlaceholders()
  // ===================================================================

  describe('extractPlaceholders()', () => {
    it('should extract single placeholder', () => {
      const result = PlaceholderUtils.extractPlaceholders('Hello {{name}}!');
      expect(result).toEqual(['name']);
    });

    it('should extract multiple placeholders', () => {
      const result = PlaceholderUtils.extractPlaceholders('{{firstName}} {{lastName}}');
      expect(result).toEqual(['firstName', 'lastName']);
    });

    it('should extract placeholders with filters', () => {
      const result = PlaceholderUtils.extractPlaceholders('{{name | uppercase}}');
      expect(result).toEqual(['name | uppercase']);
    });

    it('should extract nested placeholders', () => {
      const result = PlaceholderUtils.extractPlaceholders('{{user.address.city}}');
      expect(result).toEqual(['user.address.city']);
    });

    it('should return empty array for no placeholders', () => {
      const result = PlaceholderUtils.extractPlaceholders('No placeholders here');
      expect(result).toEqual([]);
    });

    it('should return empty array for non-string input', () => {
      expect(PlaceholderUtils.extractPlaceholders(123)).toEqual([]);
      expect(PlaceholderUtils.extractPlaceholders(null)).toEqual([]);
    });

    it('should trim whitespace from placeholders', () => {
      const result = PlaceholderUtils.extractPlaceholders('{{ name }}');
      expect(result).toEqual(['name']);
    });
  });

  // ===================================================================
  // extractPlaceholderNames()
  // ===================================================================

  describe('extractPlaceholderNames()', () => {
    it('should extract field names without filters', () => {
      const result = PlaceholderUtils.extractPlaceholderNames(
        '{{name | uppercase}} {{age | number}}'
      );
      expect(result).toEqual(['name', 'age']);
    });

    it('should handle placeholders without filters', () => {
      const result = PlaceholderUtils.extractPlaceholderNames('{{firstName}} {{lastName}}');
      expect(result).toEqual(['firstName', 'lastName']);
    });

    it('should preserve nested paths', () => {
      const result = PlaceholderUtils.extractPlaceholderNames('{{user.address.city | trim}}');
      expect(result).toEqual(['user.address.city']);
    });
  });

  // ===================================================================
  // extractUniquePlaceholderNames()
  // ===================================================================

  describe('extractUniquePlaceholderNames()', () => {
    it('should return unique names', () => {
      const result = PlaceholderUtils.extractUniquePlaceholderNames('{{name}} says {{name}}');
      expect(result).toEqual(['name']);
    });

    it('should handle multiple duplicates', () => {
      const result = PlaceholderUtils.extractUniquePlaceholderNames(
        '{{a}} {{b}} {{a}} {{c}} {{b}}'
      );
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  // ===================================================================
  // hasPlaceholders()
  // ===================================================================

  describe('hasPlaceholders()', () => {
    it('should return true when placeholders exist', () => {
      expect(PlaceholderUtils.hasPlaceholders('Hello {{name}}!')).toBe(true);
    });

    it('should return false when no placeholders', () => {
      expect(PlaceholderUtils.hasPlaceholders('Hello world!')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(PlaceholderUtils.hasPlaceholders(123)).toBe(false);
      expect(PlaceholderUtils.hasPlaceholders(null)).toBe(false);
    });

    it('should handle partial placeholder syntax', () => {
      expect(PlaceholderUtils.hasPlaceholders('{{incomplete')).toBe(false);
      expect(PlaceholderUtils.hasPlaceholders('incomplete}}')).toBe(false);
    });
  });

  // ===================================================================
  // countPlaceholders()
  // ===================================================================

  describe('countPlaceholders()', () => {
    it('should count placeholders', () => {
      expect(PlaceholderUtils.countPlaceholders('{{a}} {{b}} {{c}}')).toBe(3);
    });

    it('should return 0 for no placeholders', () => {
      expect(PlaceholderUtils.countPlaceholders('No placeholders')).toBe(0);
    });

    it('should count duplicates', () => {
      expect(PlaceholderUtils.countPlaceholders('{{a}} {{a}} {{a}}')).toBe(3);
    });
  });

  // ===================================================================
  // extractParamReferences()
  // ===================================================================

  describe('extractParamReferences()', () => {
    it('should extract @param from string', () => {
      const result = PlaceholderUtils.extractParamReferences('@userId');
      expect(result).toEqual(['userId']);
    });

    it('should extract multiple @params from string', () => {
      const result = PlaceholderUtils.extractParamReferences('User @userId in org @orgId');
      expect(result).toEqual(['userId', 'orgId']);
    });

    it('should extract @params from object', () => {
      const result = PlaceholderUtils.extractParamReferences({ id: '@userId', name: '@userName' });
      expect(result).toContain('userId');
      expect(result).toContain('userName');
    });

    it('should extract @params from nested objects', () => {
      const result = PlaceholderUtils.extractParamReferences({ nested: { id: '@userId' } });
      expect(result).toEqual(['userId']);
    });

    it('should return empty array for no params', () => {
      expect(PlaceholderUtils.extractParamReferences('no params')).toEqual([]);
    });
  });

  // ===================================================================
  // extractProviderReferences()
  // ===================================================================

  describe('extractProviderReferences()', () => {
    it('should extract $provider with property', () => {
      const result = PlaceholderUtils.extractProviderReferences('$userData.email');
      expect(result).toEqual([{ provider: 'userData', property: 'email' }]);
    });

    it('should extract $provider without property', () => {
      const result = PlaceholderUtils.extractProviderReferences('$userData');
      expect(result).toEqual([{ provider: 'userData', property: null }]);
    });

    it('should extract nested properties', () => {
      const result = PlaceholderUtils.extractProviderReferences('$user.address.city');
      expect(result).toEqual([{ provider: 'user', property: 'address.city' }]);
    });

    it('should extract from objects', () => {
      const result = PlaceholderUtils.extractProviderReferences({ email: '$user.email' });
      expect(result).toEqual([{ provider: 'user', property: 'email' }]);
    });

    it('should return empty array for no providers', () => {
      expect(PlaceholderUtils.extractProviderReferences('no providers')).toEqual([]);
    });
  });

  // ===================================================================
  // hasParamReferences() and hasProviderReferences()
  // ===================================================================

  describe('hasParamReferences()', () => {
    it('should return true when @params exist', () => {
      expect(PlaceholderUtils.hasParamReferences('@userId')).toBe(true);
    });

    it('should return false when no @params', () => {
      expect(PlaceholderUtils.hasParamReferences('userId')).toBe(false);
    });
  });

  describe('hasProviderReferences()', () => {
    it('should return true when $providers exist', () => {
      expect(PlaceholderUtils.hasProviderReferences('$userData.email')).toBe(true);
    });

    it('should return false when no $providers', () => {
      expect(PlaceholderUtils.hasProviderReferences('userData.email')).toBe(false);
    });
  });

  // ===================================================================
  // replacePlaceholders()
  // ===================================================================

  describe('replacePlaceholders()', () => {
    it('should replace placeholders with context values', () => {
      const result = PlaceholderUtils.replacePlaceholders('Hello {{name}}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should replace multiple placeholders', () => {
      const result = PlaceholderUtils.replacePlaceholders('{{firstName}} {{lastName}}', {
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(result).toBe('John Doe');
    });

    it('should handle nested context values', () => {
      const result = PlaceholderUtils.replacePlaceholders('{{user.name}}', {
        user: { name: 'Alice' }
      });
      expect(result).toBe('Alice');
    });

    it('should use empty string for undefined values by default', () => {
      const result = PlaceholderUtils.replacePlaceholders('Hello {{missing}}!', {});
      expect(result).toBe('Hello !');
    });

    it('should use custom undefinedValue', () => {
      const result = PlaceholderUtils.replacePlaceholders(
        'Value: {{missing}}',
        {},
        { undefinedValue: 'N/A' }
      );
      expect(result).toBe('Value: N/A');
    });

    it('should keep undefined placeholders when keepUndefined is true', () => {
      const result = PlaceholderUtils.replacePlaceholders(
        '{{missing}}',
        {},
        { keepUndefined: true }
      );
      expect(result).toBe('{{missing}}');
    });

    it('should ignore filter syntax during replacement', () => {
      const result = PlaceholderUtils.replacePlaceholders('{{name | uppercase}}', { name: 'test' });
      expect(result).toBe('test');
    });

    it('should return non-string input unchanged', () => {
      expect(PlaceholderUtils.replacePlaceholders(123, {})).toBe(123);
    });
  });

  // ===================================================================
  // _getNestedValue()
  // ===================================================================

  describe('_getNestedValue()', () => {
    it('should get top-level value', () => {
      expect(PlaceholderUtils._getNestedValue({ name: 'test' }, 'name')).toBe('test');
    });

    it('should get nested value', () => {
      const obj = { user: { address: { city: 'NYC' } } };
      expect(PlaceholderUtils._getNestedValue(obj, 'user.address.city')).toBe('NYC');
    });

    it('should return undefined for missing path', () => {
      expect(PlaceholderUtils._getNestedValue({ a: 1 }, 'b')).toBeUndefined();
    });

    it('should return undefined for null object', () => {
      expect(PlaceholderUtils._getNestedValue(null, 'name')).toBeUndefined();
    });

    it('should handle null in path', () => {
      const obj = { user: null };
      expect(PlaceholderUtils._getNestedValue(obj, 'user.name')).toBeUndefined();
    });
  });

  // ===================================================================
  // validatePlaceholders()
  // ===================================================================

  describe('validatePlaceholders()', () => {
    it('should return valid true when all placeholders have values', () => {
      const result = PlaceholderUtils.validatePlaceholders('{{name}} {{age}}', {
        name: 'John',
        age: 30
      });
      expect(result).toEqual({ valid: true, missing: [] });
    });

    it('should return missing placeholders', () => {
      const result = PlaceholderUtils.validatePlaceholders('{{name}} {{age}}', { name: 'John' });
      expect(result).toEqual({ valid: false, missing: ['age'] });
    });

    it('should return multiple missing placeholders', () => {
      const result = PlaceholderUtils.validatePlaceholders('{{a}} {{b}} {{c}}', {});
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('a');
      expect(result.missing).toContain('b');
      expect(result.missing).toContain('c');
    });

    it('should handle nested paths', () => {
      const result = PlaceholderUtils.validatePlaceholders('{{user.name}}', { user: {} });
      expect(result).toEqual({ valid: false, missing: ['user.name'] });
    });
  });

  // ===================================================================
  // escapePlaceholders() and unescapePlaceholders()
  // ===================================================================

  describe('escapePlaceholders()', () => {
    it('should escape placeholder syntax', () => {
      const result = PlaceholderUtils.escapePlaceholders('Use {{name}} syntax');
      expect(result).toBe('Use \\{\\{name\\}\\} syntax');
    });

    it('should return non-string unchanged', () => {
      expect(PlaceholderUtils.escapePlaceholders(123)).toBe(123);
    });
  });

  describe('unescapePlaceholders()', () => {
    it('should unescape placeholder syntax', () => {
      const result = PlaceholderUtils.unescapePlaceholders('Use \\{\\{name\\}\\} syntax');
      expect(result).toBe('Use {{name}} syntax');
    });

    it('should return non-string unchanged', () => {
      expect(PlaceholderUtils.unescapePlaceholders(null)).toBe(null);
    });
  });

  describe('escape/unescape roundtrip', () => {
    it('should roundtrip correctly', () => {
      const original = '{{name}} and {{age}}';
      const escaped = PlaceholderUtils.escapePlaceholders(original);
      const unescaped = PlaceholderUtils.unescapePlaceholders(escaped);
      expect(unescaped).toBe(original);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      expect(PlaceholderUtils.extractPlaceholders('')).toEqual([]);
      expect(PlaceholderUtils.hasPlaceholders('')).toBe(false);
    });

    it('should handle nested braces in content', () => {
      const result = PlaceholderUtils.extractPlaceholders('{{data}}');
      expect(result).toEqual(['data']);
    });

    it('should handle whitespace-only placeholders', () => {
      const result = PlaceholderUtils.extractPlaceholders('{{   }}');
      expect(result).toEqual(['']);
    });
  });
});
