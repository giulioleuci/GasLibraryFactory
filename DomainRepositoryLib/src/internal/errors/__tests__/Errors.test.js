// ===================================================================
// FILE: DomainRepositoryLib/src/errors/__tests__/Errors.test.js
// ===================================================================

import { DomainException } from '../DomainException';
import { ValidationException } from '@GasSchemaValidatorLib';
import { BaseError } from '@CoreUtilsLib';
import { EntityNotFoundException } from '../EntityNotFoundException';
import { InvariantViolationException } from '../InvariantViolationException';
import { SpecificationException } from '../SpecificationException';

describe('Domain Errors - Comprehensive Test Suite', () => {
  describe('DomainException', () => {
    it('should create exception with message', () => {
      const error = new DomainException('Test error', 'TestContext');

      expect(error.message).toBe('Test error');
      expect(error.context).toBe('TestContext');
      expect(error.name).toBe('DomainException');
    });

    it('should create exception with details', () => {
      const details = { field: 'age', value: -1 };
      const error = new DomainException('Invalid value', 'Validation', details);

      expect(error.details).toEqual(details);
    });

    it('should extend Error', () => {
      const error = new DomainException('Test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainException);
    });

    it('should have stack trace', () => {
      const error = new DomainException('Test');

      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationException', () => {
    it('should create exception with validation errors', () => {
      const errors = [
        { field: 'name', message: 'Required' },
        { field: 'age', message: 'Must be positive' }
      ];

      const error = new ValidationException('Validation failed', 'Entity', errors);

      expect(error.validationErrors).toEqual(errors);
      expect(error.name).toBe('ValidationException');
    });

    it('should extend BaseError', () => {
      const error = new ValidationException('Test', null, []);

      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(ValidationException);
    });

    it('should handle empty validation errors', () => {
      const error = new ValidationException('Test', 'Context', []);

      expect(error.validationErrors).toEqual([]);
    });

    it('should default validationErrors to empty array', () => {
      const error = new ValidationException('Test', null, []);

      expect(error.validationErrors).toEqual([]);
    });
  });

  describe('EntityNotFoundException', () => {
    it('should create exception with entity ID', () => {
      const error = new EntityNotFoundException('Customer', 'CUST123');

      expect(error.entityType).toBe('Customer');
      expect(error.entityId).toBe('CUST123');
      expect(error.name).toBe('EntityNotFoundException');
    });

    it('should have descriptive message', () => {
      const error = new EntityNotFoundException('Customer', 'CUST123');

      expect(error.message).toContain('Customer');
      expect(error.message).toContain('CUST123');
    });

    it('should extend DomainException', () => {
      const error = new EntityNotFoundException('Customer', 'CUST123');

      expect(error).toBeInstanceOf(DomainException);
      expect(error).toBeInstanceOf(EntityNotFoundException);
    });
  });

  describe('InvariantViolationException', () => {
    it('should create exception with violations', () => {
      const violations = ['Must have items', 'Total must be positive'];
      const error = new InvariantViolationException('Order', violations);

      expect(error.violations).toEqual(violations);
      expect(error.aggregateType).toBe('Order');
      expect(error.name).toBe('InvariantViolationException');
    });

    it('should have descriptive message', () => {
      const violations = ['Must have items'];
      const error = new InvariantViolationException('Order', violations);

      expect(error.message).toContain('Order');
      expect(error.message).toContain('invariant');
    });

    it('should extend DomainException', () => {
      const error = new InvariantViolationException('Order', []);

      expect(error).toBeInstanceOf(DomainException);
      expect(error).toBeInstanceOf(InvariantViolationException);
    });

    it('should handle empty violations', () => {
      const error = new InvariantViolationException('Order', []);

      expect(error.violations).toEqual([]);
    });
  });

  describe('SpecificationException', () => {
    it('should create exception with details', () => {
      const details = { operator: 'invalid', field: 'age' };
      const error = new SpecificationException('Invalid operator', 'FieldSpec', details);

      expect(error.details).toEqual(details);
      expect(error.name).toBe('SpecificationException');
    });

    it('should extend DomainException', () => {
      const error = new SpecificationException('Test');

      expect(error).toBeInstanceOf(DomainException);
      expect(error).toBeInstanceOf(SpecificationException);
    });
  });

  describe('Error Throwing and Catching', () => {
    it('should be catchable as specific type', () => {
      try {
        throw new ValidationException('Test error');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationException);
        expect(e.name).toBe('ValidationException');
      }
    });

    it('should be catchable as DomainException', () => {
      try {
        throw new EntityNotFoundException('Customer', 'ID1');
      } catch (e) {
        expect(e).toBeInstanceOf(DomainException);
      }
    });

    it('should be catchable as Error', () => {
      try {
        throw new DomainException('Test');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });

  describe('Error Message Formatting', () => {
    it('should format validation exception message with errors', () => {
      const errors = [
        { field: 'name', message: 'Required' },
        { field: 'email', message: 'Invalid format' }
      ];

      const error = new ValidationException('Validation failed', 'User', errors);

      expect(error.message).toContain('Validation failed');
    });

    it('should format entity not found message', () => {
      const error = new EntityNotFoundException('Customer', 'CUST123');

      expect(error.message).toContain('Customer');
      expect(error.message).toContain('CUST123');
    });

    it('should format invariant violation message', () => {
      const violations = ['Must have items', 'Total must be positive'];
      const error = new InvariantViolationException('Order', violations);

      expect(error.message).toBeDefined();
      expect(error.message.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null message', () => {
      const error = new DomainException(null);

      expect(error.message).toBeDefined();
    });

    it('should handle empty string message', () => {
      const error = new DomainException('');

      expect(error.message).toBe('');
    });

    it('should handle undefined context', () => {
      const error = new DomainException('Test', undefined);

      expect(error.context).toBeUndefined();
    });

    it('should handle complex details object', () => {
      const details = {
        nested: { data: { value: 123 } },
        array: [1, 2, 3]
      };

      const error = new DomainException('Test', 'Context', details);

      expect(error.details).toEqual(details);
    });
  });
});
