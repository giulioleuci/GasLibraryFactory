// ===================================================================
// FILE: DomainRepositoryLib/src/specifications/__tests__/ExpressionSpecification.test.js
// ===================================================================

import { ExpressionSpecification } from '../ExpressionSpecification';
import { SpecificationException } from '../../internal/errors/SpecificationException';

// Mock ExpressionEngineService
const mockExpressionEngine = {
  evaluate: jest.fn()
};

describe('ExpressionSpecification - Comprehensive Test Suite', () => {
  let testObject;

  beforeEach(() => {
    testObject = {
      name: 'John Doe',
      age: 30,
      status: 'active',
      score: 85
    };

    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should create specification with expression', () => {
      const spec = new ExpressionSpecification('{{age}} > 18', mockExpressionEngine);

      expect(spec.expression).toBe('{{age}} > 18');
      expect(spec.expressionEngine).toBe(mockExpressionEngine);
    });

    it('should throw error for empty expression', () => {
      expect(() => new ExpressionSpecification('', mockExpressionEngine)).toThrow(
        SpecificationException
      );
      expect(() => new ExpressionSpecification(null, mockExpressionEngine)).toThrow(
        SpecificationException
      );
    });

    it('should throw error for non-string expression', () => {
      expect(() => new ExpressionSpecification(123, mockExpressionEngine)).toThrow(
        SpecificationException
      );
    });

    it('should require expression engine', () => {
      expect(() => new ExpressionSpecification('{{age}} > 18', null)).toThrow(
        SpecificationException
      );
    });
  });

  describe('Expression Evaluation', () => {
    it('should evaluate simple comparison', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification('{{age}} > 18', mockExpressionEngine);

      const result = spec.isSatisfiedBy(testObject);

      expect(result).toBe(true);
      expect(mockExpressionEngine.evaluate).toHaveBeenCalledWith('{{age}} > 18', testObject);
    });

    it('should evaluate to false', () => {
      mockExpressionEngine.evaluate.mockReturnValue(false);
      const spec = new ExpressionSpecification('{{age}} < 18', mockExpressionEngine);

      const result = spec.isSatisfiedBy(testObject);

      expect(result).toBe(false);
    });

    it('should evaluate complex expression', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification(
        '{{age}} >= 18 && {{status}} == "active"',
        mockExpressionEngine
      );

      const result = spec.isSatisfiedBy(testObject);

      expect(result).toBe(true);
    });

    it('should pass entity to expression engine', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification('{{age}} > 18', mockExpressionEngine);

      spec.isSatisfiedBy(testObject);

      expect(mockExpressionEngine.evaluate).toHaveBeenCalledWith('{{age}} > 18', testObject);
    });
  });

  describe('Error Handling', () => {
    it('should throw SpecificationException on evaluation error', () => {
      mockExpressionEngine.evaluate.mockImplementation(() => {
        throw new Error('Parse error');
      });

      const spec = new ExpressionSpecification('invalid expression', mockExpressionEngine);

      expect(() => spec.isSatisfiedBy(testObject)).toThrow(SpecificationException);
    });

    it('should include original error message', () => {
      mockExpressionEngine.evaluate.mockImplementation(() => {
        throw new Error('Custom error message');
      });

      const spec = new ExpressionSpecification('{{age}} > 18', mockExpressionEngine);

      try {
        spec.isSatisfiedBy(testObject);
        fail('Should have thrown');
      } catch (e) {
        expect(e.message).toContain('Custom error message');
      }
    });
  });

  describe('Different Expression Types', () => {
    it('should handle equality check', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification('{{status}} == "active"', mockExpressionEngine);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle inequality check', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification('{{status}} != "inactive"', mockExpressionEngine);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle AND operator', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification(
        '{{age}} > 18 && {{score}} >= 60',
        mockExpressionEngine
      );

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle OR operator', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification(
        '{{age}} > 50 || {{status}} == "active"',
        mockExpressionEngine
      );

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle IN operator', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification(
        '{{status}} in ["active", "pending"]',
        mockExpressionEngine
      );

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle BETWEEN operator', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification('{{age}} between 18, 65', mockExpressionEngine);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('Composite with Other Specifications', () => {
    it('should work in AND composition', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec1 = new ExpressionSpecification('{{age}} > 18', mockExpressionEngine);
      const spec2 = new ExpressionSpecification('{{status}} == "active"', mockExpressionEngine);

      const andSpec = spec1.and(spec2);

      expect(andSpec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should work in OR composition', () => {
      mockExpressionEngine.evaluate.mockReturnValueOnce(false).mockReturnValueOnce(true);

      const spec1 = new ExpressionSpecification('{{age}} > 50', mockExpressionEngine);
      const spec2 = new ExpressionSpecification('{{status}} == "active"', mockExpressionEngine);

      const orSpec = spec1.or(spec2);

      expect(orSpec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return expression', () => {
      const expression = '{{age}} > 18 && {{status}} == "active"';
      const spec = new ExpressionSpecification(expression, mockExpressionEngine);

      expect(spec.toString()).toContain(expression);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null entity', () => {
      mockExpressionEngine.evaluate.mockImplementation(() => {
        throw new Error('Cannot read properties of null');
      });

      const spec = new ExpressionSpecification('{{age}} > 18', mockExpressionEngine);

      expect(() => spec.isSatisfiedBy(null)).toThrow(SpecificationException);
    });

    it('should handle missing properties', () => {
      mockExpressionEngine.evaluate.mockReturnValue(false);
      const spec = new ExpressionSpecification('{{missing}} > 18', mockExpressionEngine);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should handle complex nested expressions', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification(
        '({{age}} > 18 && {{status}} == "active") || ({{score}} > 90)',
        mockExpressionEngine
      );

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should validate business rule', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification(
        '{{age}} >= 18 && {{age}} <= 65 && {{status}} == "active"',
        mockExpressionEngine
      );

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should check eligibility criteria', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification(
        '{{score}} >= 60 && {{attendance}} >= 80',
        mockExpressionEngine
      );

      const student = { score: 85, attendance: 90 };
      expect(spec.isSatisfiedBy(student)).toBe(true);
    });

    it('should validate access permissions', () => {
      mockExpressionEngine.evaluate.mockReturnValue(true);
      const spec = new ExpressionSpecification(
        '{{role}} in ["admin", "moderator"] && {{status}} == "active"',
        mockExpressionEngine
      );

      const user = { role: 'admin', status: 'active' };
      expect(spec.isSatisfiedBy(user)).toBe(true);
    });
  });
});
