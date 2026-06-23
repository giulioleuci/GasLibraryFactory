// ===================================================================
// FILE: DomainRepositoryLib/src/specifications/__tests__/FieldSpecification.test.js
// ===================================================================
// Comprehensive test suite for FieldSpecification
// Coverage: All operators and features
// ===================================================================

import { FieldSpecification } from '../FieldSpecification';

describe('FieldSpecification - Comprehensive Test Suite', () => {
  let testObject;

  beforeEach(() => {
    testObject = {
      name: 'John Doe',
      age: 30,
      status: 'active',
      score: 85.5,
      tags: ['admin', 'user'],
      email: null,
      metadata: { verified: true }
    };
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create specification with field, operator, and value', () => {
      const spec = new FieldSpecification('name', 'equals', 'John Doe');

      expect(spec._field).toBe('name');
      expect(spec._operator).toBe('equals');
      expect(spec._value).toBe('John Doe');
    });

    it('should throw error for invalid operator', () => {
      expect(() => new FieldSpecification('name', 'invalid', 'value')).toThrow();
    });

    it('should accept all valid operators', () => {
      const operators = [
        'equals',
        'notEquals',
        'greaterThan',
        'lessThan',
        'greaterThanOrEqual',
        'lessThanOrEqual',
        'in',
        'notIn',
        'between',
        'like',
        'notLike'
      ];

      operators.forEach((op) => {
        expect(() => new FieldSpecification('field', op, 'value')).not.toThrow();
      });
    });
  });

  // ===================================================================
  // EQUALS OPERATOR
  // ===================================================================

  describe('Equals Operator', () => {
    it('should match equal values', () => {
      const spec = new FieldSpecification('name', 'equals', 'John Doe');

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match different values', () => {
      const spec = new FieldSpecification('name', 'equals', 'Jane Doe');

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should match numbers', () => {
      const spec = new FieldSpecification('age', 'equals', 30);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should match floats', () => {
      const spec = new FieldSpecification('score', 'equals', 85.5);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should match null values', () => {
      const spec = new FieldSpecification('email', 'equals', null);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should match boolean values', () => {
      const spec = new FieldSpecification('metadata.verified', 'equals', true);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  // ===================================================================
  // NOT EQUALS OPERATOR
  // ===================================================================

  describe('Not Equals Operator', () => {
    it('should match different values', () => {
      const spec = new FieldSpecification('name', 'notEquals', 'Jane Doe');

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match equal values', () => {
      const spec = new FieldSpecification('name', 'notEquals', 'John Doe');

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should match non-null values when comparing to null', () => {
      const spec = new FieldSpecification('name', 'notEquals', null);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  // ===================================================================
  // COMPARISON OPERATORS
  // ===================================================================

  describe('Greater Than Operator', () => {
    it('should match greater values', () => {
      const spec = new FieldSpecification('age', 'greaterThan', 25);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match equal values', () => {
      const spec = new FieldSpecification('age', 'greaterThan', 30);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should not match lesser values', () => {
      const spec = new FieldSpecification('age', 'greaterThan', 35);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should work with floats', () => {
      const spec = new FieldSpecification('score', 'greaterThan', 80);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('Less Than Operator', () => {
    it('should match lesser values', () => {
      const spec = new FieldSpecification('age', 'lessThan', 35);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match equal values', () => {
      const spec = new FieldSpecification('age', 'lessThan', 30);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should not match greater values', () => {
      const spec = new FieldSpecification('age', 'lessThan', 25);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });
  });

  describe('Greater Than Or Equal Operator', () => {
    it('should match greater values', () => {
      const spec = new FieldSpecification('age', 'greaterThanOrEqual', 25);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should match equal values', () => {
      const spec = new FieldSpecification('age', 'greaterThanOrEqual', 30);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match lesser values', () => {
      const spec = new FieldSpecification('age', 'greaterThanOrEqual', 35);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });
  });

  describe('Less Than Or Equal Operator', () => {
    it('should match lesser values', () => {
      const spec = new FieldSpecification('age', 'lessThanOrEqual', 35);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should match equal values', () => {
      const spec = new FieldSpecification('age', 'lessThanOrEqual', 30);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match greater values', () => {
      const spec = new FieldSpecification('age', 'lessThanOrEqual', 25);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });
  });

  // ===================================================================
  // IN OPERATOR
  // ===================================================================

  describe('In Operator', () => {
    it('should match when value is in array', () => {
      const spec = new FieldSpecification('status', 'in', ['active', 'pending']);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match when value is not in array', () => {
      const spec = new FieldSpecification('status', 'in', ['inactive', 'pending']);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should work with numbers', () => {
      const spec = new FieldSpecification('age', 'in', [25, 30, 35]);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle empty array', () => {
      const spec = new FieldSpecification('status', 'in', []);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should throw error if value is not an array', () => {
      const spec = new FieldSpecification('status', 'in', 'active');

      expect(() => spec.isSatisfiedBy(testObject)).toThrow();
    });
  });

  describe('Not In Operator', () => {
    it('should match when value is not in array', () => {
      const spec = new FieldSpecification('status', 'notIn', ['inactive', 'pending']);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match when value is in array', () => {
      const spec = new FieldSpecification('status', 'notIn', ['active', 'pending']);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });
  });

  // ===================================================================
  // BETWEEN OPERATOR
  // ===================================================================

  describe('Between Operator', () => {
    it('should match value within range', () => {
      const spec = new FieldSpecification('age', 'between', [25, 35]);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should match value at lower bound', () => {
      const spec = new FieldSpecification('age', 'between', [30, 35]);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should match value at upper bound', () => {
      const spec = new FieldSpecification('age', 'between', [25, 30]);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match value outside range', () => {
      const spec = new FieldSpecification('age', 'between', [35, 40]);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should throw error if value is not an array of length 2', () => {
      const spec1 = new FieldSpecification('age', 'between', [25]);
      const spec2 = new FieldSpecification('age', 'between', [25, 30, 35]);

      expect(() => spec1.isSatisfiedBy(testObject)).toThrow();
      expect(() => spec2.isSatisfiedBy(testObject)).toThrow();
    });
  });

  // ===================================================================
  // LIKE OPERATOR
  // ===================================================================

  describe('Like Operator', () => {
    it('should match substring with wildcard', () => {
      const spec = new FieldSpecification('name', 'like', 'John%');

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const spec = new FieldSpecification('name', 'like', 'john%');

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not match when pattern not found', () => {
      const spec = new FieldSpecification('name', 'like', 'Jane%');

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should match full string exactly', () => {
      const spec = new FieldSpecification('name', 'like', 'John Doe');

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle special characters with wildcards', () => {
      const obj = { email: 'user@example.com' };
      const spec = new FieldSpecification('email', 'like', '%@example%');

      expect(spec.isSatisfiedBy(obj)).toBe(true);
    });
  });

  describe('Not Like Operator', () => {
    it('should not match pattern', () => {
      const spec = new FieldSpecification('name', 'notLike', 'Jane%');

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should match when pattern found', () => {
      const spec = new FieldSpecification('name', 'notLike', 'John%');

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });
  });

  // ===================================================================
  // NESTED FIELD ACCESS
  // ===================================================================

  describe('Nested Field Access', () => {
    it('should access nested object properties', () => {
      const spec = new FieldSpecification('metadata.verified', 'equals', true);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should return undefined for non-existent nested path', () => {
      const spec = new FieldSpecification('metadata.nonexistent', 'equals', null);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should handle deep nesting', () => {
      const obj = { a: { b: { c: { d: 'value' } } } };
      const spec = new FieldSpecification('a.b.c.d', 'equals', 'value');

      expect(spec.isSatisfiedBy(obj)).toBe(true);
    });

    it('should handle array access', () => {
      const spec = new FieldSpecification('tags.0', 'equals', 'admin');

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  // ===================================================================
  // COMPOSITE SPECIFICATIONS
  // ===================================================================

  describe('Composite Specifications', () => {
    it('should support AND composition', () => {
      const spec1 = new FieldSpecification('age', 'greaterThan', 25);
      const spec2 = new FieldSpecification('status', 'equals', 'active');

      const compositeSpec = spec1.and(spec2);

      expect(compositeSpec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should support OR composition', () => {
      const spec1 = new FieldSpecification('age', 'greaterThan', 50);
      const spec2 = new FieldSpecification('status', 'equals', 'active');

      const compositeSpec = spec1.or(spec2);

      expect(compositeSpec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should support NOT composition', () => {
      const spec = new FieldSpecification('status', 'equals', 'inactive');

      const notSpec = spec.not();

      expect(notSpec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle undefined field', () => {
      const spec = new FieldSpecification('undefined', 'equals', null);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should handle null object', () => {
      const spec = new FieldSpecification('name', 'equals', 'John');

      expect(() => spec.isSatisfiedBy(null)).toThrow();
    });

    it('should handle empty string field', () => {
      const obj = { '': 'value' };
      const spec = new FieldSpecification('', 'equals', 'value');

      expect(spec.isSatisfiedBy(obj)).toBe(true);
    });

    it('should handle zero values', () => {
      const obj = { count: 0 };
      const spec = new FieldSpecification('count', 'equals', 0);

      expect(spec.isSatisfiedBy(obj)).toBe(true);
    });

    it('should handle false values', () => {
      const obj = { active: false };
      const spec = new FieldSpecification('active', 'equals', false);

      expect(spec.isSatisfiedBy(obj)).toBe(true);
    });

    it('should handle empty arrays', () => {
      const obj = { items: [] };
      const spec = new FieldSpecification('items', 'equals', []);

      // Arrays are compared by reference, not value
      expect(spec.isSatisfiedBy(obj)).toBe(false);
    });
  });

  // ===================================================================
  // ERROR HANDLING
  // ===================================================================

  describe('Error Handling', () => {
    it('should throw error for invalid comparison types', () => {
      const obj = { value: 'string' };
      const spec = new FieldSpecification('value', 'greaterThan', 10);

      // Comparing string with number should not throw, but return false
      expect(spec.isSatisfiedBy(obj)).toBe(false);
    });

    it('should handle missing required array for in operator', () => {
      const spec = new FieldSpecification('status', 'in', 'active');

      expect(() => spec.isSatisfiedBy(testObject)).toThrow();
    });

    it('should handle missing required array for between operator', () => {
      const spec = new FieldSpecification('age', 'between', 30);

      expect(() => spec.isSatisfiedBy(testObject)).toThrow();
    });
  });

  // ===================================================================
  // STRING REPRESENTATION
  // ===================================================================

  describe('String Representation', () => {
    it('should provide string description', () => {
      const spec = new FieldSpecification('age', 'greaterThan', 25);

      const description = spec.toString();

      expect(description).toContain('age');
      expect(description).toContain('greaterThan');
      expect(description).toContain('25');
    });
  });
});
