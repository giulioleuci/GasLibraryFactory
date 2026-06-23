// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/ValueObject.test.js
// ===================================================================
// Comprehensive test suite for ValueObject base class
// Coverage: All methods and features
// ===================================================================

import { ValueObject } from '../ValueObject';
import { MockFactory } from '../../../test/fakes';

// Create concrete value object implementations for testing
class SimpleValue extends ValueObject {
  constructor(value) {
    super();
    this._value = value;
    this._freeze();
  }

  getValue() {
    return this._value;
  }
}

class EmailAddress extends ValueObject {
  constructor(email) {
    super();
    this._email = this._validate(email);
    this._freeze();
  }

  _validate(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      throw new Error('Invalid email format');
    }

    return email.toLowerCase();
  }

  getValue() {
    return this._email;
  }

  getLocalPart() {
    return this._email.split('@')[0];
  }

  getDomain() {
    return this._email.split('@')[1];
  }
}

class Money extends ValueObject {
  constructor(amount, currency = 'USD') {
    super();
    this._amount = amount;
    this._currency = currency;
    this._freeze();
  }

  getAmount() {
    return this._amount;
  }

  getCurrency() {
    return this._currency;
  }

  add(other) {
    if (this._currency !== other.getCurrency()) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this._amount + other.getAmount(), this._currency);
  }

  getValue() {
    return { amount: this._amount, currency: this._currency };
  }
}

describe('ValueObject - Comprehensive Test Suite', () => {
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create value object with single value', () => {
      const value = new SimpleValue(42);

      expect(value.getValue()).toBe(42);
    });

    it('should create value object with validation', () => {
      const email = new EmailAddress('test@example.com');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('should create value object with multiple properties', () => {
      const money = new Money(100, 'USD');

      expect(money.getAmount()).toBe(100);
      expect(money.getCurrency()).toBe('USD');
    });

    it('should normalize values in constructor', () => {
      const email = new EmailAddress('TeSt@ExAmPlE.CoM');

      expect(email.getValue()).toBe('test@example.com'); // normalized to lowercase
    });

    it('should throw error for invalid data', () => {
      expect(() => new EmailAddress('invalid-email')).toThrow('Invalid email format');
      expect(() => new EmailAddress(null)).toThrow();
      expect(() => new EmailAddress('')).toThrow();
    });
  });

  // ===================================================================
  // IMMUTABILITY
  // ===================================================================

  describe('Immutability', () => {
    it('should be immutable (frozen)', () => {
      const value = new SimpleValue(42);

      expect(Object.isFrozen(value)).toBe(true);
    });

    it('should not allow property modification', () => {
      const email = new EmailAddress('test@example.com');

      expect(() => {
        email._email = 'modified@example.com';
      }).toThrow();
    });

    it('should not allow adding new properties', () => {
      const value = new SimpleValue(42);

      expect(() => {
        value.newProperty = 'test';
      }).toThrow();
    });

    it('should not allow deleting properties', () => {
      const money = new Money(100, 'USD');

      expect(() => {
        delete money._amount;
      }).toThrow();
    });
  });

  // ===================================================================
  // EQUALITY
  // ===================================================================

  describe('Equality', () => {
    it('should compare by value, not reference', () => {
      const value1 = new SimpleValue(42);
      const value2 = new SimpleValue(42);

      expect(value1).not.toBe(value2); // different objects
      expect(value1.equals(value2)).toBe(true); // but equal values
    });

    it('should return false for different values', () => {
      const value1 = new SimpleValue(42);
      const value2 = new SimpleValue(43);

      expect(value1.equals(value2)).toBe(false);
    });

    it('should handle complex value comparison', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(100, 'USD');
      const money3 = new Money(100, 'EUR');
      const money4 = new Money(200, 'USD');

      expect(money1.equals(money2)).toBe(true);
      expect(money1.equals(money3)).toBe(false); // different currency
      expect(money1.equals(money4)).toBe(false); // different amount
    });

    it('should handle email comparison', () => {
      const email1 = new EmailAddress('test@example.com');
      const email2 = new EmailAddress('TEST@EXAMPLE.COM'); // different case
      const email3 = new EmailAddress('other@example.com');

      expect(email1.equals(email2)).toBe(true); // normalized to same value
      expect(email1.equals(email3)).toBe(false);
    });

    it('should return false when comparing to null', () => {
      const value = new SimpleValue(42);

      expect(value.equals(null)).toBe(false);
    });

    it('should return false when comparing to undefined', () => {
      const value = new SimpleValue(42);

      expect(value.equals(undefined)).toBe(false);
    });

    it('should return false when comparing to different type', () => {
      const value = new SimpleValue(42);

      expect(value.equals(42)).toBe(false);
      expect(value.equals({ value: 42 })).toBe(false);
    });

    it('should handle nested object equality', () => {
      const value1 = new SimpleValue({ a: 1, b: 2 });
      const value2 = new SimpleValue({ a: 1, b: 2 });
      const value3 = new SimpleValue({ a: 1, b: 3 });

      expect(value1.equals(value2)).toBe(true);
      expect(value1.equals(value3)).toBe(false);
    });

    it('should handle array equality', () => {
      const value1 = new SimpleValue([1, 2, 3]);
      const value2 = new SimpleValue([1, 2, 3]);
      const value3 = new SimpleValue([1, 2, 4]);

      expect(value1.equals(value2)).toBe(true);
      expect(value1.equals(value3)).toBe(false);
    });
  });

  // ===================================================================
  // DOMAIN BEHAVIOR
  // ===================================================================

  describe('Domain Behavior', () => {
    it('should provide domain-specific methods', () => {
      const email = new EmailAddress('user@example.com');

      expect(email.getLocalPart()).toBe('user');
      expect(email.getDomain()).toBe('example.com');
    });

    it('should support operations that return new value objects', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(50, 'USD');

      const result = money1.add(money2);

      expect(result).not.toBe(money1); // new object
      expect(result.getAmount()).toBe(150);
      expect(result.getCurrency()).toBe('USD');
    });

    it('should validate operations with business rules', () => {
      const usd = new Money(100, 'USD');
      const eur = new Money(50, 'EUR');

      expect(() => usd.add(eur)).toThrow('Cannot add money with different currencies');
    });

    it('should maintain immutability in operations', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(50, 'USD');

      money1.add(money2);

      expect(money1.getAmount()).toBe(100); // unchanged
    });
  });

  // ===================================================================
  // ABSTRACT METHOD ENFORCEMENT
  // ===================================================================

  describe('Abstract Method Enforcement', () => {
    it('should throw error if getValue not implemented', () => {
      class IncompleteValueObject extends ValueObject {
        constructor() {
          super();
        }
      }

      const vo = new IncompleteValueObject();
      expect(() => vo.getValue()).toThrow();
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle null as value', () => {
      const value = new SimpleValue(null);

      expect(value.getValue()).toBeNull();
    });

    it('should handle undefined as value', () => {
      const value = new SimpleValue(undefined);

      expect(value.getValue()).toBeUndefined();
    });

    it('should handle zero as value', () => {
      const money = new Money(0, 'USD');

      expect(money.getAmount()).toBe(0);
    });

    it('should handle empty string as value', () => {
      expect(() => new EmailAddress('')).toThrow();
    });

    it('should handle special characters in email', () => {
      const email = new EmailAddress('user+tag@example.com');

      expect(email.getValue()).toBe('user+tag@example.com');
    });

    it('should handle long email addresses', () => {
      const longEmail = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.com';
      const email = new EmailAddress(longEmail);

      expect(email.getValue()).toBe(longEmail.toLowerCase());
    });
  });

  // ===================================================================
  // TYPE SAFETY
  // ===================================================================

  describe('Type Safety', () => {
    it('should maintain type through operations', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(50, 'USD');

      const result = money1.add(money2);

      expect(result).toBeInstanceOf(Money);
      expect(result).toBeInstanceOf(ValueObject);
    });

    it('should support instanceof checks', () => {
      const email = new EmailAddress('test@example.com');

      expect(email instanceof EmailAddress).toBe(true);
      expect(email instanceof ValueObject).toBe(true);
    });
  });

  // ===================================================================
  // SERIALIZATION
  // ===================================================================

  describe('Serialization', () => {
    it('should serialize to simple value', () => {
      const value = new SimpleValue(42);

      expect(value.getValue()).toBe(42);
    });

    it('should serialize to object', () => {
      const money = new Money(100, 'USD');

      const serialized = money.getValue();

      expect(serialized).toEqual({ amount: 100, currency: 'USD' });
    });

    it('should serialize email to string', () => {
      const email = new EmailAddress('test@example.com');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('should be JSON serializable', () => {
      const money = new Money(100, 'USD');

      const json = JSON.stringify({ value: money.getValue() });
      const parsed = JSON.parse(json);

      expect(parsed.value.amount).toBe(100);
      expect(parsed.value.currency).toBe('USD');
    });
  });

  // ===================================================================
  // INHERITANCE
  // ===================================================================

  describe('Inheritance', () => {
    it('should support value object inheritance', () => {
      class ExtendedEmail extends EmailAddress {
        constructor(email) {
          super(email);
        }

        isFromDomain(domain) {
          return this.getDomain() === domain;
        }
      }

      const email = new ExtendedEmail('test@example.com');

      expect(email.isFromDomain('example.com')).toBe(true);
      expect(email.isFromDomain('other.com')).toBe(false);
    });

    it('should maintain immutability in subclasses', () => {
      class ExtendedEmail extends EmailAddress {
        constructor(email) {
          super(email);
        }
      }

      const email = new ExtendedEmail('test@example.com');

      expect(Object.isFrozen(email)).toBe(true);
    });
  });

  // ===================================================================
  // REAL-WORLD SCENARIOS
  // ===================================================================

  describe('Real-World Scenarios', () => {
    it('should work as Map keys', () => {
      const map = new Map();
      const email1 = new EmailAddress('test@example.com');
      const email2 = new EmailAddress('test@example.com');

      map.set(email1, 'value1');

      // Note: Map uses reference equality, not value equality
      expect(map.get(email1)).toBe('value1');
      expect(map.get(email2)).toBeUndefined(); // different reference
    });

    it('should work in collections', () => {
      const emails = [
        new EmailAddress('user1@example.com'),
        new EmailAddress('user2@example.com'),
        new EmailAddress('user3@example.com')
      ];

      expect(emails.length).toBe(3);
      expect(emails[0].getValue()).toBe('user1@example.com');
    });

    it('should support filtering with equals', () => {
      const target = new EmailAddress('user2@example.com');
      const emails = [
        new EmailAddress('user1@example.com'),
        new EmailAddress('user2@example.com'),
        new EmailAddress('user3@example.com')
      ];

      const found = emails.filter((email) => email.equals(target));

      expect(found.length).toBe(1);
      expect(found[0].getValue()).toBe('user2@example.com');
    });

    it('should support currency calculations', () => {
      const items = [new Money(10, 'USD'), new Money(20, 'USD'), new Money(30, 'USD')];

      let total = new Money(0, 'USD');
      items.forEach((item) => {
        total = total.add(item);
      });

      expect(total.getAmount()).toBe(60);
    });
  });
});
