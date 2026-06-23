// ===================================================================
// FILE: DomainRepositoryLib/src/specifications/__tests__/FunctionSpecification.test.js
// ===================================================================

import { FunctionSpecification } from '../FunctionSpecification';
import { SpecificationException } from '../../internal/errors/SpecificationException';

describe('FunctionSpecification - Comprehensive Test Suite', () => {
  let testObject;

  beforeEach(() => {
    testObject = {
      name: 'John Doe',
      age: 30,
      status: 'active',
      score: 85,
      tags: ['admin', 'user']
    };
  });

  describe('Constructor and Initialization', () => {
    it('should create specification with predicate function', () => {
      const predicate = (obj) => obj.age > 18;
      const spec = new FunctionSpecification(predicate);

      expect(spec.predicateFunction).toBe(predicate);
      expect(spec.description).toBeNull();
    });

    it('should create specification with description', () => {
      const predicate = (obj) => obj.age > 18;
      const spec = new FunctionSpecification(predicate, 'Adult check');

      expect(spec.description).toBe('Adult check');
    });

    it('should throw error for non-function predicate', () => {
      expect(() => new FunctionSpecification('not a function')).toThrow(SpecificationException);
      expect(() => new FunctionSpecification(null)).toThrow(SpecificationException);
      expect(() => new FunctionSpecification(123)).toThrow(SpecificationException);
    });
  });

  describe('Basic Predicates', () => {
    it('should evaluate simple predicate', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 18);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should evaluate false predicate', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 50);

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should evaluate string predicate', () => {
      const spec = new FunctionSpecification((obj) => obj.name.startsWith('John'));

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should evaluate array predicate', () => {
      const spec = new FunctionSpecification((obj) => obj.tags.includes('admin'));

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should evaluate multiple conditions', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 18 && obj.status === 'active');

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('Complex Predicates', () => {
    it('should handle nested property access', () => {
      const obj = { user: { profile: { verified: true } } };
      const spec = new FunctionSpecification((o) => o.user.profile.verified === true);

      expect(spec.isSatisfiedBy(obj)).toBe(true);
    });

    it('should handle array operations', () => {
      const spec = new FunctionSpecification(
        (obj) => obj.tags.filter((t) => t.length > 3).length > 0
      );

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle mathematical operations', () => {
      const spec = new FunctionSpecification((obj) => Math.floor(obj.score / 10) >= 8);

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle regex patterns', () => {
      const spec = new FunctionSpecification((obj) => /^John/.test(obj.name));

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should handle custom logic', () => {
      const spec = new FunctionSpecification((obj) => {
        if (obj.age < 18) {
          return false;
        }
        if (obj.status !== 'active') {
          return false;
        }
        if (obj.score < 60) {
          return false;
        }
        return true;
      });

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('Return Value Coercion', () => {
    it('should coerce truthy values to true', () => {
      const spec = new FunctionSpecification((obj) => obj.age); // returns 30

      expect(spec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should coerce falsy values to false', () => {
      const spec = new FunctionSpecification((obj) => obj.missing); // returns undefined

      expect(spec.isSatisfiedBy(testObject)).toBe(false);
    });

    it('should handle 0 as false', () => {
      const obj = { count: 0 };
      const spec = new FunctionSpecification((o) => o.count);

      expect(spec.isSatisfiedBy(obj)).toBe(false);
    });

    it('should handle empty string as false', () => {
      const obj = { value: '' };
      const spec = new FunctionSpecification((o) => o.value);

      expect(spec.isSatisfiedBy(obj)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw SpecificationException on predicate error', () => {
      const spec = new FunctionSpecification((obj) => obj.missing.property);

      expect(() => spec.isSatisfiedBy(testObject)).toThrow(SpecificationException);
    });

    it('should handle null object gracefully', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 18);

      expect(() => spec.isSatisfiedBy(null)).toThrow(SpecificationException);
    });

    it('should handle undefined object gracefully', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 18);

      expect(() => spec.isSatisfiedBy(undefined)).toThrow(SpecificationException);
    });

    it('should include error message in exception', () => {
      const spec = new FunctionSpecification((obj) => obj.missing.property);

      try {
        spec.isSatisfiedBy(testObject);
        fail('Should have thrown');
      } catch (e) {
        expect(e.message).toContain('Failed to evaluate');
      }
    });
  });

  describe('Composite with Other Specifications', () => {
    it('should work in AND composition', () => {
      const funcSpec = new FunctionSpecification((obj) => obj.age > 18);
      const otherSpec = new FunctionSpecification((obj) => obj.status === 'active');

      const andSpec = funcSpec.and(otherSpec);

      expect(andSpec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should work in OR composition', () => {
      const funcSpec = new FunctionSpecification((obj) => obj.age > 50);
      const otherSpec = new FunctionSpecification((obj) => obj.status === 'active');

      const orSpec = funcSpec.or(otherSpec);

      expect(orSpec.isSatisfiedBy(testObject)).toBe(true);
    });

    it('should work in NOT composition', () => {
      const funcSpec = new FunctionSpecification((obj) => obj.status === 'inactive');

      const notSpec = funcSpec.not();

      expect(notSpec.isSatisfiedBy(testObject)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return description if provided', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 18, 'Adult check');

      expect(spec.toString()).toContain('Adult check');
    });

    it('should return default message if no description', () => {
      const spec = new FunctionSpecification((obj) => obj.age > 18);

      const str = spec.toString();
      expect(str).toContain('Function');
      expect(str).toBeDefined();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should validate email format', () => {
      const emailSpec = new FunctionSpecification(
        (obj) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email),
        'Valid email'
      );

      const validObj = { email: 'test@example.com' };
      const invalidObj = { email: 'invalid' };

      expect(emailSpec.isSatisfiedBy(validObj)).toBe(true);
      expect(emailSpec.isSatisfiedBy(invalidObj)).toBe(false);
    });

    it('should check business hours', () => {
      const businessHoursSpec = new FunctionSpecification((obj) => {
        const hour = new Date(obj.timestamp).getHours();
        return hour >= 9 && hour < 17;
      }, 'Within business hours');

      const morningObj = { timestamp: new Date('2024-01-01T10:00:00').getTime() };
      const eveningObj = { timestamp: new Date('2024-01-01T20:00:00').getTime() };

      expect(businessHoursSpec.isSatisfiedBy(morningObj)).toBe(true);
      expect(businessHoursSpec.isSatisfiedBy(eveningObj)).toBe(false);
    });

    it('should validate complex eligibility', () => {
      const eligibilitySpec = new FunctionSpecification((obj) => {
        if (obj.age < 18 || obj.age > 65) {
          return false;
        }
        if (!obj.hasLicense) {
          return false;
        }
        if (obj.violations > 3) {
          return false;
        }
        return true;
      }, 'Driver eligibility');

      const eligible = { age: 30, hasLicense: true, violations: 1 };
      const notEligible = { age: 30, hasLicense: true, violations: 5 };

      expect(eligibilitySpec.isSatisfiedBy(eligible)).toBe(true);
      expect(eligibilitySpec.isSatisfiedBy(notEligible)).toBe(false);
    });

    it('should perform custom calculations', () => {
      const discountSpec = new FunctionSpecification((obj) => {
        const totalSpent = obj.orders.reduce((sum, order) => sum + order.total, 0);
        return totalSpent > 1000;
      }, 'Eligible for VIP discount');

      const vipCustomer = { orders: [{ total: 600 }, { total: 500 }] };
      const regularCustomer = { orders: [{ total: 100 }, { total: 50 }] };

      expect(discountSpec.isSatisfiedBy(vipCustomer)).toBe(true);
      expect(discountSpec.isSatisfiedBy(regularCustomer)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty object', () => {
      const spec = new FunctionSpecification((obj) => Object.keys(obj).length > 0);

      expect(spec.isSatisfiedBy({})).toBe(false);
    });

    it('should handle object with null values', () => {
      const spec = new FunctionSpecification((obj) => obj.value !== null);

      expect(spec.isSatisfiedBy({ value: null })).toBe(false);
      expect(spec.isSatisfiedBy({ value: 'something' })).toBe(true);
    });

    it('should handle arrays as entities', () => {
      const spec = new FunctionSpecification((arr) => arr.length > 2);

      expect(spec.isSatisfiedBy([1, 2, 3])).toBe(true);
      expect(spec.isSatisfiedBy([1])).toBe(false);
    });

    it('should handle primitives as entities', () => {
      const spec = new FunctionSpecification((num) => num > 10);

      expect(spec.isSatisfiedBy(15)).toBe(true);
      expect(spec.isSatisfiedBy(5)).toBe(false);
    });
  });
});
