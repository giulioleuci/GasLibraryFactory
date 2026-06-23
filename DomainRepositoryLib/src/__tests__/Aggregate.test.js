// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/Aggregate.test.js
// ===================================================================
// Comprehensive test suite for Aggregate base class
// Coverage: All methods and features
// ===================================================================

import { Aggregate } from '../Aggregate';
import { InvariantViolationException } from '../internal/errors/InvariantViolationException';
import { MockFactory } from '../../../test/fakes';

// Create concrete aggregate implementations for testing
class OrderItem {
  constructor(productId, quantity, price) {
    this.productId = productId;
    this.quantity = quantity;
    this.price = price;
  }

  getTotal() {
    return this.quantity * this.price;
  }
}

class Order extends Aggregate {
  constructor(data) {
    super(data);
    this.customerId = data.customerId;
    this.items = data.items || [];
    this.status = data.status || 'draft';
  }

  addItem(productId, quantity, price) {
    const item = new OrderItem(productId, quantity, price);
    this.items.push(item);
    this.addChild(item);
    this.markDirty('items');
  }

  removeItem(productId) {
    const index = this.items.findIndex((item) => item.productId === productId);
    if (index >= 0) {
      const removed = this.items.splice(index, 1)[0];
      this.removeChild(removed);
      this.markDirty('items');
    }
  }

  getTotalAmount() {
    return this.items.reduce((sum, item) => sum + item.getTotal(), 0);
  }

  validateInvariants() {
    super.validateInvariants();

    if (!this.customerId) {
      this.addInvariantViolation('Order must have a customer');
    }

    if (this.items.length === 0) {
      this.addInvariantViolation('Order must have at least one item');
    }

    if (this.getTotalAmount() <= 0) {
      this.addInvariantViolation('Order total must be positive');
    }

    if (this.status === 'completed' && this.items.length === 0) {
      this.addInvariantViolation('Completed order cannot be empty');
    }

    return !this.hasInvariantViolations();
  }

  toData() {
    return {
      id: this.id,
      customerId: this.customerId,
      items: this.items,
      status: this.status
    };
  }

  static fromData(data) {
    return new Order(data);
  }
}

describe('Aggregate - Comprehensive Test Suite', () => {
  let mocks;

  beforeEach(() => {
    mocks = MockFactory.createAllJest();
  });

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  describe('Constructor and Initialization', () => {
    it('should create aggregate with data', () => {
      const order = new Order({ customerId: 'CUST123' });

      expect(order.customerId).toBe('CUST123');
      expect(order.items).toEqual([]);
      expect(order.status).toBe('draft');
    });

    it('should initialize with empty children collection', () => {
      const order = new Order({ customerId: 'CUST123' });

      expect(order.getChildren()).toEqual([]);
      expect(order.getChildCount()).toBe(0);
    });

    it('should initialize without invariant violations', () => {
      const order = new Order({ customerId: 'CUST123' });

      expect(order.hasInvariantViolations()).toBe(false);
      expect(order.getInvariantViolations()).toEqual([]);
    });
  });

  // ===================================================================
  // CHILD MANAGEMENT
  // ===================================================================

  describe('Child Management', () => {
    it('should add child entity', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);

      expect(order.getChildCount()).toBe(1);
      expect(order.items.length).toBe(1);
    });

    it('should add multiple children', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      order.addItem('PROD2', 1, 5.99);
      order.addItem('PROD3', 3, 7.5);

      expect(order.getChildCount()).toBe(3);
      expect(order.items.length).toBe(3);
    });

    it('should remove child entity', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      order.addItem('PROD2', 1, 5.99);
      order.removeItem('PROD1');

      expect(order.getChildCount()).toBe(1);
      expect(order.items.length).toBe(1);
      expect(order.items[0].productId).toBe('PROD2');
    });

    it('should get all children', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      order.addItem('PROD2', 1, 5.99);

      const children = order.getChildren();

      expect(children.length).toBe(2);
      expect(children[0]).toBeInstanceOf(OrderItem);
    });

    it('should clear all children', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      order.addItem('PROD2', 1, 5.99);
      order.clearChildren();

      expect(order.getChildCount()).toBe(0);
      expect(order.getChildren()).toEqual([]);
    });

    it('should handle removing non-existent child', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      order.removeItem('PROD2'); // doesn't exist

      expect(order.getChildCount()).toBe(1); // unchanged
    });
  });

  // ===================================================================
  // INVARIANT VALIDATION
  // ===================================================================

  describe('Invariant Validation', () => {
    it('should pass validation for valid aggregate', () => {
      const order = new Order({ customerId: 'CUST123' });
      order.addItem('PROD1', 2, 10.99);

      expect(order.validateInvariants()).toBe(true);
      expect(order.hasInvariantViolations()).toBe(false);
    });

    it('should fail validation for invalid aggregate', () => {
      const order = new Order({ customerId: 'CUST123' });

      expect(order.validateInvariants()).toBe(false);
      expect(order.hasInvariantViolations()).toBe(true);
    });

    it('should collect invariant violations', () => {
      const order = new Order({ customerId: null });

      order.validateInvariants();
      const violations = order.getInvariantViolations();

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some((v) => v.includes('customer'))).toBe(true);
      expect(violations.some((v) => v.includes('at least one item'))).toBe(true);
    });

    it('should add invariant violation manually', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addInvariantViolation('Custom violation');

      expect(order.hasInvariantViolations()).toBe(true);
      expect(order.getInvariantViolations()).toContain('Custom violation');
    });

    it('should clear invariant violations on re-validation', () => {
      const order = new Order({ customerId: null });

      order.validateInvariants();
      expect(order.hasInvariantViolations()).toBe(true);

      // Update the aggregate and validate again - this clears violations
      order.customerId = 'CUST123';
      order.addItem('PROD1', 2, 10.99);
      order.validateInvariants();
      expect(order.hasInvariantViolations()).toBe(false);
      expect(order.getInvariantViolations()).toEqual([]);
    });

    it('should throw exception with validateInvariantsOrThrow', () => {
      const order = new Order({ customerId: null });

      expect(() => order.validateInvariantsOrThrow()).toThrow(InvariantViolationException);
    });

    it('should not throw with validateInvariantsOrThrow on valid aggregate', () => {
      const order = new Order({ customerId: 'CUST123' });
      order.addItem('PROD1', 2, 10.99);

      expect(() => order.validateInvariantsOrThrow()).not.toThrow();
    });

    it('should re-validate and clear previous violations', () => {
      const order = new Order({ customerId: null });

      order.validateInvariants();
      expect(order.hasInvariantViolations()).toBe(true);

      order.customerId = 'CUST123';
      order.addItem('PROD1', 2, 10.99);
      order.validateInvariants();

      expect(order.hasInvariantViolations()).toBe(false);
    });

    it('should validate complex business rules', () => {
      const order = new Order({ customerId: 'CUST123', status: 'completed' });

      order.validateInvariants();
      const violations = order.getInvariantViolations();

      expect(violations.some((v) => v.includes('Completed order cannot be empty'))).toBe(true);
    });
  });

  // ===================================================================
  // BUSINESS LOGIC
  // ===================================================================

  describe('Business Logic', () => {
    it('should calculate aggregate totals', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      order.addItem('PROD2', 1, 5.99);

      expect(order.getTotalAmount()).toBeCloseTo(27.97, 2);
    });

    it('should maintain consistency when adding items', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);

      expect(order.items.length).toBe(order.getChildCount());
    });

    it('should maintain consistency when removing items', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      order.addItem('PROD2', 1, 5.99);
      order.removeItem('PROD1');

      expect(order.items.length).toBe(order.getChildCount());
    });

    it('should recalculate totals after modifications', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      expect(order.getTotalAmount()).toBeCloseTo(21.98, 2);

      order.addItem('PROD2', 1, 5.99);
      expect(order.getTotalAmount()).toBeCloseTo(27.97, 2);

      order.removeItem('PROD1');
      expect(order.getTotalAmount()).toBeCloseTo(5.99, 2);
    });
  });

  // ===================================================================
  // ENTITY FEATURES (INHERITED)
  // ===================================================================

  describe('Entity Features (Inherited)', () => {
    it('should support dirty tracking', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);

      expect(order.isDirty('items')).toBe(true);
      expect(order.hasDirtyFields()).toBe(true);
    });

    it('should support validation', () => {
      const order = new Order({ customerId: 'CUST123' });
      order.addItem('PROD1', 2, 10.99);

      expect(order.validate()).toBe(true);
    });

    it('should have identity', () => {
      const order1 = new Order({ id: 'ORDER1', customerId: 'CUST123' });
      const order2 = new Order({ id: 'ORDER1', customerId: 'CUST456' });
      const order3 = new Order({ id: 'ORDER2', customerId: 'CUST123' });

      expect(order1.equals(order2)).toBe(true);
      expect(order1.equals(order3)).toBe(false);
    });
  });

  // ===================================================================
  // SERIALIZATION
  // ===================================================================

  describe('Serialization', () => {
    it('should serialize to data', () => {
      const order = new Order({ id: 'ORDER1', customerId: 'CUST123' });
      order.addItem('PROD1', 2, 10.99);

      const data = order.toData();

      expect(data.id).toBe('ORDER1');
      expect(data.customerId).toBe('CUST123');
      expect(data.items.length).toBe(1);
      expect(data.status).toBe('draft');
    });

    it('should restore from data', () => {
      const data = {
        id: 'ORDER1',
        customerId: 'CUST123',
        items: [{ productId: 'PROD1', quantity: 2, price: 10.99 }],
        status: 'draft'
      };

      const order = Order.fromData(data);

      expect(order.id).toBe('ORDER1');
      expect(order.customerId).toBe('CUST123');
      expect(order.items.length).toBe(1);
    });

    it('should round-trip serialize and deserialize', () => {
      const original = new Order({ id: 'ORDER1', customerId: 'CUST123' });
      original.addItem('PROD1', 2, 10.99);
      original.addItem('PROD2', 1, 5.99);

      const data = original.toData();
      const restored = Order.fromData(data);

      expect(restored.id).toBe(original.id);
      expect(restored.customerId).toBe(original.customerId);
      expect(restored.items.length).toBe(original.items.length);
      expect(restored.getTotalAmount()).toBeCloseTo(original.getTotalAmount(), 2);
    });
  });

  // ===================================================================
  // EDGE CASES
  // ===================================================================

  describe('Edge Cases', () => {
    it('should handle aggregate with no children', () => {
      const order = new Order({ customerId: 'CUST123' });

      expect(order.getChildCount()).toBe(0);
      expect(order.getTotalAmount()).toBe(0);
    });

    it('should handle adding same item multiple times', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('PROD1', 2, 10.99);
      order.addItem('PROD1', 1, 10.99);

      expect(order.getChildCount()).toBe(2);
      expect(order.items.length).toBe(2);
    });

    it('should handle zero-price items', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.addItem('FREE_ITEM', 1, 0);

      expect(order.getTotalAmount()).toBe(0);
      expect(order.validateInvariants()).toBe(false); // total must be positive
    });

    it('should handle large number of children', () => {
      const order = new Order({ customerId: 'CUST123' });

      for (let i = 0; i < 100; i++) {
        order.addItem(`PROD${i}`, 1, 1.0);
      }

      expect(order.getChildCount()).toBe(100);
      expect(order.getTotalAmount()).toBe(100);
    });

    it('should handle clearing children on empty aggregate', () => {
      const order = new Order({ customerId: 'CUST123' });

      order.clearChildren();

      expect(order.getChildCount()).toBe(0);
    });
  });

  // ===================================================================
  // COMPLEX SCENARIOS
  // ===================================================================

  describe('Complex Scenarios', () => {
    it('should maintain consistency across multiple operations', () => {
      const order = new Order({ customerId: 'CUST123' });

      // Add items
      order.addItem('PROD1', 2, 10.99);
      order.addItem('PROD2', 1, 5.99);
      order.addItem('PROD3', 3, 7.5);

      // Remove one
      order.removeItem('PROD2');

      // Validate
      expect(order.validateInvariants()).toBe(true);
      expect(order.getChildCount()).toBe(2);
      expect(order.items.length).toBe(2);
      expect(order.getTotalAmount()).toBeCloseTo(44.48, 2);
    });

    it('should enforce invariants after state changes', () => {
      const order = new Order({ customerId: 'CUST123' });
      order.addItem('PROD1', 2, 10.99);

      // Valid state
      expect(order.validateInvariants()).toBe(true);

      // Make invalid
      order.items = [];
      order.clearChildren();

      // Should be invalid now
      expect(order.validateInvariants()).toBe(false);
    });

    it('should handle complex invariant scenarios', () => {
      const order = new Order({ customerId: 'CUST123', status: 'completed' });

      // Completed order with no items should violate multiple rules
      order.validateInvariants();
      const violations = order.getInvariantViolations();

      expect(violations.length).toBeGreaterThan(1);
    });

    it('should support aggregate modification workflow', () => {
      // Create
      const order = new Order({ customerId: 'CUST123' });
      expect(order.validateInvariants()).toBe(false);

      // Add items
      order.addItem('PROD1', 2, 10.99);
      expect(order.validateInvariants()).toBe(true);

      // Modify
      order.status = 'completed';
      expect(order.validateInvariants()).toBe(true);

      // Save checkpoint
      const data = order.toData();

      // Restore
      const restored = Order.fromData(data);
      expect(restored.validateInvariants()).toBe(true);
    });
  });

  // ===================================================================
  // INHERITANCE
  // ===================================================================

  describe('Inheritance', () => {
    it('should support aggregate inheritance', () => {
      class PremiumOrder extends Order {
        constructor(data) {
          super(data);
          this.discount = data.discount || 0;
        }

        getTotalAmount() {
          const subtotal = super.getTotalAmount();
          return subtotal * (1 - this.discount);
        }

        validateInvariants() {
          super.validateInvariants();

          if (this.discount < 0 || this.discount > 0.5) {
            this.addInvariantViolation('Discount must be between 0 and 50%');
          }

          return !this.hasInvariantViolations();
        }

        toData() {
          return {
            ...super.toData(),
            discount: this.discount
          };
        }

        static fromData(data) {
          return new PremiumOrder(data);
        }
      }

      const order = new PremiumOrder({ customerId: 'CUST123', discount: 0.1 });
      order.addItem('PROD1', 2, 10.99);

      expect(order.getTotalAmount()).toBeCloseTo(19.782, 2);
      expect(order.validateInvariants()).toBe(true);
    });
  });
});
