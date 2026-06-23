// ===================================================================
// FILE: DomainRepositoryLib/src/query/__tests__/QueryTranslator.test.js
// ===================================================================

import { QueryTranslator } from '../QueryTranslator';
import { FieldSpecification } from '../../../specifications/FieldSpecification';
import { FunctionSpecification } from '../../../specifications/FunctionSpecification';
import { CompositeSpecification } from '../../../specifications/CompositeSpecification';

describe('QueryTranslator - Comprehensive Test Suite', () => {
  let translator;
  let mockQueryBuilder;

  beforeEach(() => {
    translator = new QueryTranslator();

    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      whereIn: jest.fn().mockReturnThis()
    };
  });

  describe('Validation', () => {
    it('should validate translatable field specification', () => {
      const spec = new FieldSpecification('age', 'greaterThan', 18);
      const result = translator.validate(spec);

      expect(result.valid).toBe(true);
    });

    it('should not validate function specification', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 18);
      const result = translator.validate(spec);

      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should validate simple composite AND', () => {
      const spec1 = new FieldSpecification('age', 'greaterThan', 18);
      const spec2 = new FieldSpecification('status', 'equals', 'active');
      const composite = new CompositeSpecification('AND', [spec1, spec2]);

      const result = translator.validate(composite);

      expect(result.valid).toBe(true);
    });

    it('should not validate composite with function spec', () => {
      const spec1 = new FieldSpecification('age', 'greaterThan', 18);
      const spec2 = new FunctionSpecification((obj) => obj.name.startsWith('A'));
      const composite = new CompositeSpecification('AND', [spec1, spec2]);

      const result = translator.validate(composite);

      expect(result.valid).toBe(false);
    });
  });

  describe('Translation - Simple Specifications', () => {
    it('should translate equals specification', () => {
      const spec = new FieldSpecification('status', 'equals', 'active');

      translator.translate(spec, mockQueryBuilder);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('status', '=', 'active');
    });

    it('should translate greaterThan specification', () => {
      const spec = new FieldSpecification('age', 'greaterThan', 18);

      translator.translate(spec, mockQueryBuilder);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('age', '>', 18);
    });

    it('should translate lessThan specification', () => {
      const spec = new FieldSpecification('age', 'lessThan', 65);

      translator.translate(spec, mockQueryBuilder);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('age', '<', 65);
    });

    it('should translate in specification', () => {
      const spec = new FieldSpecification('status', 'in', ['active', 'pending']);

      translator.translate(spec, mockQueryBuilder);

      expect(mockQueryBuilder.whereIn).toHaveBeenCalledWith('status', ['active', 'pending']);
    });
  });

  describe('Translation - Composite Specifications', () => {
    it('should translate AND composite', () => {
      const spec1 = new FieldSpecification('age', 'greaterThan', 18);
      const spec2 = new FieldSpecification('status', 'equals', 'active');
      const composite = new CompositeSpecification('AND', [spec1, spec2]);

      translator.translate(composite, mockQueryBuilder);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should translate OR composite', () => {
      const spec1 = new FieldSpecification('age', 'greaterThan', 65);
      const spec2 = new FieldSpecification('status', 'equals', 'vip');
      const composite = new CompositeSpecification('OR', [spec1, spec2]);

      translator.translate(composite, mockQueryBuilder);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-translatable specification', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 18);

      expect(() => translator.translate(spec, mockQueryBuilder)).toThrow();
    });

    it('should throw error for null specification', () => {
      expect(() => translator.translate(null, mockQueryBuilder)).toThrow();
    });

    it('should throw error for null query builder', () => {
      const spec = new FieldSpecification('age', 'greaterThan', 18);

      expect(() => translator.translate(spec, null)).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle nested composite specifications', () => {
      const spec1 = new FieldSpecification('age', 'greaterThan', 18);
      const spec2 = new FieldSpecification('status', 'equals', 'active');
      const inner = new CompositeSpecification('AND', [spec1, spec2]);
      const spec3 = new FieldSpecification('score', 'greaterThan', 60);
      const outer = new CompositeSpecification('AND', [inner, spec3]);

      translator.translate(outer, mockQueryBuilder);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should handle empty string values', () => {
      const spec = new FieldSpecification('name', 'equals', '');

      translator.translate(spec, mockQueryBuilder);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('name', '=', '');
    });

    it('should handle null values', () => {
      const spec = new FieldSpecification('email', 'equals', null);

      translator.translate(spec, mockQueryBuilder);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });
});
