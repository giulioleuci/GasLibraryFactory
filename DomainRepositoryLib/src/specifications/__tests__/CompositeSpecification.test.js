// ===================================================================
// FILE: DomainRepositoryLib/src/specifications/__tests__/CompositeSpecification.test.js
// ===================================================================

import { CompositeSpecification } from '../CompositeSpecification';
import { FieldSpecification } from '../FieldSpecification';
import { FunctionSpecification } from '../FunctionSpecification';
import { SpecificationException } from '../../internal/errors/SpecificationException';

describe('CompositeSpecification - Comprehensive Test Suite', () => {
  let spec1, spec2, spec3;
  let testObject;

  beforeEach(() => {
    spec1 = new FieldSpecification('age', 'greaterThan', 18);
    spec2 = new FieldSpecification('status', 'equals', 'active');
    spec3 = new FieldSpecification('score', 'greaterThanOrEqual', 60);

    testObject = {
      name: 'John Doe',
      age: 25,
      status: 'active',
      score: 85
    };
  });

  describe('Constructor and Initialization', () => {
    it('should create AND composite specification', () => {
      const composite = new CompositeSpecification('AND', [spec1, spec2]);

      expect(composite.operator).toBe('AND');
      expect(composite.specifications.length).toBe(2);
    });

    it('should create OR composite specification', () => {
      const composite = new CompositeSpecification('OR', [spec1, spec2]);

      expect(composite.operator).toBe('OR');
    });

    it('should create NOT composite specification', () => {
      const composite = new CompositeSpecification('NOT', [spec1]);

      expect(composite.operator).toBe('NOT');
    });

    it('should normalize operator to uppercase', () => {
      const composite = new CompositeSpecification('and', [spec1, spec2]);

      expect(composite.operator).toBe('AND');
    });

    it('should throw error for invalid operator', () => {
      expect(() => new CompositeSpecification('INVALID', [spec1])).toThrow(SpecificationException);
    });

    it('should throw error for empty specifications array', () => {
      expect(() => new CompositeSpecification('AND', [])).toThrow(SpecificationException);
    });

    it('should throw error for non-array specifications', () => {
      expect(() => new CompositeSpecification('AND', spec1)).toThrow(SpecificationException);
    });
  });

  describe('AND Operator', () => {
    it('should satisfy when all specifications are satisfied', () => {
      const composite = new CompositeSpecification('AND', [spec1, spec2]);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not satisfy when one specification fails', () => {
      const composite = new CompositeSpecification('AND', [spec1, spec2, spec3]);
      const failObject = { age: 25, status: 'inactive', score: 85 };

      expect(composite.isSatisfiedBy(failObject)).toBe(false);
    });

    it('should not satisfy when all specifications fail', () => {
      const composite = new CompositeSpecification('AND', [spec1, spec2]);
      const failObject = { age: 15, status: 'inactive', score: 40 };

      expect(composite.isSatisfiedBy(failObject)).toBe(false);
    });

    it('should handle single specification', () => {
      const composite = new CompositeSpecification('AND', [spec1]);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle many specifications', () => {
      const specs = [spec1, spec2, spec3];
      const composite = new CompositeSpecification('AND', specs);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('OR Operator', () => {
    it('should satisfy when at least one specification is satisfied', () => {
      const composite = new CompositeSpecification('OR', [spec1, spec2]);
      const obj = { age: 25, status: 'inactive', score: 40 };

      expect(composite.isSatisfiedBy(obj)).toBe(true);
    });

    it('should satisfy when all specifications are satisfied', () => {
      const composite = new CompositeSpecification('OR', [spec1, spec2]);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not satisfy when all specifications fail', () => {
      const composite = new CompositeSpecification('OR', [spec1, spec2]);
      const failObject = { age: 15, status: 'inactive', score: 40 };

      expect(composite.isSatisfiedBy(failObject)).toBe(false);
    });

    it('should handle single specification', () => {
      const composite = new CompositeSpecification('OR', [spec1]);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('NOT Operator', () => {
    it('should negate single specification', () => {
      const inactiveSpec = new FieldSpecification('status', 'equals', 'inactive');
      const composite = new CompositeSpecification('NOT', [inactiveSpec]);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should not satisfy when specification is satisfied', () => {
      const composite = new CompositeSpecification('NOT', [spec2]);

      expect(composite.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should throw error for multiple specifications with NOT', () => {
      const composite = new CompositeSpecification('NOT', [spec1, spec2]);

      expect(() => composite.isSatisfiedBy(testObject)).toThrow(SpecificationException);
    });
  });

  describe('Nested Composites', () => {
    it('should support nested AND/OR', () => {
      const innerOr = new CompositeSpecification('OR', [spec1, spec2]);
      const composite = new CompositeSpecification('AND', [innerOr, spec3]);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should support nested OR/AND', () => {
      const innerAnd = new CompositeSpecification('AND', [spec1, spec2]);
      const composite = new CompositeSpecification('OR', [innerAnd, spec3]);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should support deeply nested composites', () => {
      const level1 = new CompositeSpecification('AND', [spec1, spec2]);
      const level2 = new CompositeSpecification('OR', [level1, spec3]);
      const level3 = new CompositeSpecification('AND', [level2, spec1]);

      expect(level3.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('Mixed Specification Types', () => {
    it('should combine field and function specifications', () => {
      const funcSpec = new FunctionSpecification((obj) => obj.name.startsWith('J'));
      const composite = new CompositeSpecification('AND', [spec1, funcSpec]);

      expect(composite.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null object', () => {
      const composite = new CompositeSpecification('AND', [spec1, spec2]);

      expect(() => composite.isSatisfiedBy(null)).toThrow();
    });

    it('should handle undefined object', () => {
      const composite = new CompositeSpecification('AND', [spec1, spec2]);

      expect(() => composite.isSatisfiedBy(undefined)).toThrow();
    });

    it('should handle empty object', () => {
      const composite = new CompositeSpecification('AND', [spec1, spec2]);

      expect(composite.isSatisfiedBy({})).toBe(false);
    });
  });

  describe('toString', () => {
    it('should provide string representation for AND', () => {
      const composite = new CompositeSpecification('AND', [spec1, spec2]);
      const str = composite.toString();

      expect(str).toContain('AND');
      expect(str).toContain('age');
      expect(str).toContain('status');
    });

    it('should provide string representation for OR', () => {
      const composite = new CompositeSpecification('OR', [spec1, spec2]);
      const str = composite.toString();

      expect(str).toContain('OR');
    });

    it('should provide string representation for NOT', () => {
      const composite = new CompositeSpecification('NOT', [spec1]);
      const str = composite.toString();

      expect(str).toContain('NOT');
    });
  });
});
