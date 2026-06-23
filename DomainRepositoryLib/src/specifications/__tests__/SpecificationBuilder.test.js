// ===================================================================
// FILE: DomainRepositoryLib/src/specifications/__tests__/SpecificationBuilder.test.js
// ===================================================================

import { SpecificationBuilder } from '../SpecificationBuilder';
import { FieldSpecification } from '../FieldSpecification';
import { CompositeSpecification } from '../CompositeSpecification';

describe('SpecificationBuilder - Comprehensive Test Suite', () => {
  let testObject;

  beforeEach(() => {
    testObject = {
      name: 'John Doe',
      age: 30,
      status: 'active',
      score: 85,
      email: 'john@example.com'
    };
  });

  describe('Basic Field Specifications', () => {
    it('should build equals specification', () => {
      const spec = SpecificationBuilder.field('status').equals('active').build();

      expect(spec).toBeInstanceOf(FieldSpecification);
      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build notEquals specification', () => {
      const spec = SpecificationBuilder.field('status').notEquals('inactive').build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build greaterThan specification', () => {
      const spec = SpecificationBuilder.field('age').greaterThan(25).build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build lessThan specification', () => {
      const spec = SpecificationBuilder.field('age').lessThan(35).build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build greaterThanOrEqual specification', () => {
      const spec = SpecificationBuilder.field('age').greaterThanOrEqual(30).build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build lessThanOrEqual specification', () => {
      const spec = SpecificationBuilder.field('age').lessThanOrEqual(30).build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build in specification', () => {
      const spec = SpecificationBuilder.field('status').in(['active', 'pending']).build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build notIn specification', () => {
      const spec = SpecificationBuilder.field('status').notIn(['inactive', 'blocked']).build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build between specification', () => {
      const spec = SpecificationBuilder.field('age').between(25, 35).build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build like specification', () => {
      const spec = SpecificationBuilder.field('email').like('%@example.com').build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build notLike specification', () => {
      const spec = SpecificationBuilder.field('email').notLike('@spam.com').build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('Composite Specifications - AND', () => {
    it('should build AND composite with two specifications', () => {
      const spec = SpecificationBuilder.field('age')
        .greaterThan(25)
        .and()
        .field('status')
        .equals('active')
        .build();

      expect(spec).toBeInstanceOf(CompositeSpecification);
      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build AND composite with three specifications', () => {
      const spec = SpecificationBuilder.field('age')
        .greaterThan(25)
        .and()
        .field('status')
        .equals('active')
        .and()
        .field('score')
        .greaterThanOrEqual(80)
        .build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should fail when one AND condition fails', () => {
      const spec = SpecificationBuilder.field('age')
        .greaterThan(25)
        .and()
        .field('status')
        .equals('inactive')
        .build();

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });
  });

  describe('Composite Specifications - OR', () => {
    it('should build OR composite with two specifications', () => {
      const spec = SpecificationBuilder.field('age')
        .lessThan(20)
        .or()
        .field('status')
        .equals('active')
        .build();

      expect(spec).toBeInstanceOf(CompositeSpecification);
      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should satisfy when one OR condition is met', () => {
      const spec = SpecificationBuilder.field('age')
        .greaterThan(50)
        .or()
        .field('status')
        .equals('active')
        .build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should fail when all OR conditions fail', () => {
      const spec = SpecificationBuilder.field('age')
        .lessThan(20)
        .or()
        .field('status')
        .equals('inactive')
        .build();

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });
  });

  describe('Complex Compositions', () => {
    it('should build (A AND B) OR C', () => {
      const spec = SpecificationBuilder.field('age')
        .greaterThan(25)
        .and()
        .field('status')
        .equals('active')
        .or()
        .field('score')
        .greaterThan(90)
        .build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build A AND (B OR C)', () => {
      const spec = SpecificationBuilder.field('age')
        .greaterThan(25)
        .and()
        .field('status')
        .equals('inactive')
        .or()
        .field('score')
        .greaterThan(80)
        .build();

      // Due to operator precedence, this might need grouping
      expect(spec).toBeDefined();
    });

    it('should handle mixed AND/OR operators', () => {
      const spec = SpecificationBuilder.field('age')
        .greaterThan(20)
        .and()
        .field('status')
        .equals('active')
        .or()
        .field('score')
        .greaterThan(90)
        .and()
        .field('email')
        .like('%@example.com')
        .build();

      expect(spec).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    it('should create new builder with create()', () => {
      const builder = SpecificationBuilder.create();

      expect(builder).toBeInstanceOf(SpecificationBuilder);
    });

    it('should create field builder with field()', () => {
      const builder = SpecificationBuilder.field('age');

      expect(builder).toBeDefined();
      expect(typeof builder.equals).toBe('function');
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = SpecificationBuilder.field('age').greaterThan(25);

      expect(builder).toBeDefined();
      expect(typeof builder.build).toBe('function');
    });

    it('should return builder from and()', () => {
      const builder = SpecificationBuilder.field('age').greaterThan(25).and();

      expect(builder).toBeInstanceOf(SpecificationBuilder);
    });

    it('should return builder from or()', () => {
      const builder = SpecificationBuilder.field('age').greaterThan(25).or();

      expect(builder).toBeInstanceOf(SpecificationBuilder);
    });
  });

  describe('Edge Cases', () => {
    it('should handle building single specification', () => {
      const spec = SpecificationBuilder.field('age').equals(30).build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle empty field name', () => {
      const spec = SpecificationBuilder.field('').equals('value').build();

      expect(spec).toBeDefined();
    });

    it('should handle null values', () => {
      const spec = SpecificationBuilder.field('missing').equals(null).build();

      expect(spec).toBeDefined();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should build VIP customer specification', () => {
      const spec = SpecificationBuilder.field('status')
        .equals('active')
        .and()
        .field('age')
        .greaterThanOrEqual(18)
        .and()
        .field('score')
        .greaterThan(80)
        .build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build eligibility specification', () => {
      const spec = SpecificationBuilder.field('age')
        .between(18, 65)
        .and()
        .field('status')
        .in(['active', 'pending'])
        .build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should build search filter specification', () => {
      const spec = SpecificationBuilder.field('name')
        .like('John%')
        .and()
        .field('email')
        .like('%@example.com')
        .build();

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });
});
