import { DelegationValidator } from '../../../internal/delegation/DelegationValidator.js';
import { Delegation } from '../../../internal/delegation/Delegation.js';
import { DelegationChain } from '../../../internal/delegation/DelegationChain.js';
import { Scope } from '../../../core/Scope.js';

describe('DelegationValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new DelegationValidator();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultValidator = new DelegationValidator();
      expect(defaultValidator.getMaxDelegationDepth()).toBe(10);
    });

    it('should initialize with provided maxDelegationDepth', () => {
      const customValidator = new DelegationValidator({ maxDelegationDepth: 5 });
      expect(customValidator.getMaxDelegationDepth()).toBe(5);
    });
  });

  describe('validate(delegation, context)', () => {
    it('should return error if input is not a Delegation instance', () => {
      const result = validator.validate({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input is not a Delegation instance');
    });

    it('should return error if principal and delegate are the same', () => {
      // Create a fake delegation to bypass the Delegation constructor check which throws before the validator is even called.
      // But we must pass the instanceof Delegation check.
      // We can use Object.create(Delegation.prototype) and manually set the properties to test the validator's check.
      const delegation = Object.create(Delegation.prototype);
      Object.assign(delegation, {
        id: 'del-1',
        principalId: 'user-a',
        delegateId: 'user-a',
        validFrom: new Date('2025-01-01T00:00:00Z'),
        validTo: new Date('2025-12-31T00:00:00Z'),
        roleIds: '*'
      });

      const result = validator.validate(delegation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Principal and delegate cannot be the same actor');
    });

    it('should return error if validTo is before validFrom', () => {
      const delegation = new Delegation({
        id: 'del-2',
        principalId: 'user-a',
        delegateId: 'user-b',
        validFrom: new Date('2025-01-10T00:00:00Z'),
        validTo: new Date('2025-01-01T00:00:00Z')
      });
      const result = validator.validate(delegation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('validTo must be after validFrom');
    });

    it('should warn if delegation is expired', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-01T00:00:00Z'));

      const delegation = new Delegation({
        id: 'del-3',
        principalId: 'user-a',
        delegateId: 'user-b',
        validFrom: new Date('2025-01-01T00:00:00Z'),
        validTo: new Date('2025-01-15T00:00:00Z')
      });

      const result = validator.validate(delegation);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Delegation is expired');

      jest.useRealTimers();
    });

    it('should warn if delegation has not started yet', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

      const delegation = new Delegation({
        id: 'del-4',
        principalId: 'user-a',
        delegateId: 'user-b',
        validFrom: new Date('2025-02-01T00:00:00Z'),
        validTo: new Date('2025-03-01T00:00:00Z')
      });

      const result = validator.validate(delegation);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Delegation has not started yet');

      jest.useRealTimers();
    });

    it('should validate actors if context.actorExists is provided', () => {
      const delegation = new Delegation({
        id: 'del-5',
        principalId: 'user-a',
        delegateId: 'user-b'
      });

      const context = {
        actorExists: (id) => id === 'user-a'
      };

      const result = validator.validate(delegation, context);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Delegate actor not found: user-b');
      expect(result.errors).not.toContain('Principal actor not found: user-a');
    });

    it('should validate roles if context.roleExists is provided', () => {
      const delegation = new Delegation({
        id: 'del-6',
        principalId: 'user-a',
        delegateId: 'user-b',
        roleIds: ['role-1', 'role-2']
      });

      const context = {
        roleExists: (id) => id === 'role-1'
      };

      const result = validator.validate(delegation, context);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Role not found: role-2');
      expect(result.errors).not.toContain('Role not found: role-1');
    });

    it('should be valid for a correct delegation with context', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-10T00:00:00Z'));

      const delegation = new Delegation({
        id: 'del-7',
        principalId: 'user-a',
        delegateId: 'user-b',
        roleIds: ['role-1'],
        validFrom: new Date('2025-01-01T00:00:00Z'),
        validTo: new Date('2025-02-01T00:00:00Z')
      });

      const context = {
        actorExists: () => true,
        roleExists: () => true
      };

      const result = validator.validate(delegation, context);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);

      jest.useRealTimers();
    });
  });

  describe('validateChain(chain, context)', () => {
    it('should return error if input is not a DelegationChain instance', () => {
      const result = validator.validateChain({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input is not a DelegationChain instance');
    });

    it('should return valid for an empty chain', () => {
      const chain = new DelegationChain([]);
      const result = validator.validateChain(chain);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect cycles in the chain', () => {
      const del1 = new Delegation({ id: 'del-1', principalId: 'user-a', delegateId: 'user-b' });
      // The DelegationChain constructor might actually throw before we even validate it, if we're not careful.
      // But DelegationChain constructor checks linkage, not cycles according to its code? Let's assume we can build one.
      // Actually DelegationChain constructor might throw on linkage errors. We need valid linkage but cyclic.
      // A -> B -> A
      const del2 = new Delegation({ id: 'del-2', principalId: 'user-b', delegateId: 'user-a' });
      const chain = new DelegationChain([del1, del2]);

      const result = validator.validateChain(chain);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Circular delegation detected: Actor user-a appears multiple times in chain'
      );
    });

    it('should detect exceeding maximum depth', () => {
      const customValidator = new DelegationValidator({ maxDelegationDepth: 1 });
      const del1 = new Delegation({ id: 'del-1', principalId: 'user-a', delegateId: 'user-b' });
      const del2 = new Delegation({ id: 'del-2', principalId: 'user-b', delegateId: 'user-c' });
      const chain = new DelegationChain([del1, del2]);

      const result = customValidator.validateChain(chain);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Delegation chain depth (2) exceeds maximum (1)');
    });

    it('should propagate individual delegation errors and warnings', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

      // Expired delegation
      const del1 = new Delegation({
        id: 'del-1',
        principalId: 'user-a',
        delegateId: 'user-b',
        validFrom: new Date('2024-01-01T00:00:00Z'),
        validTo: new Date('2024-12-31T00:00:00Z')
      });

      // Valid delegation
      const del2 = new Delegation({
        id: 'del-2',
        principalId: 'user-b',
        delegateId: 'user-c'
      });

      const chain = new DelegationChain([del1, del2]);
      const result = validator.validateChain(chain);

      expect(result.warnings).toContain('Delegation 0 (del-1): Delegation is expired');
      jest.useRealTimers();
    });

    it('should warn about scope coherence if restrictions are progressively broader', () => {
      const del1 = new Delegation({
        id: 'del-1',
        principalId: 'user-a',
        delegateId: 'user-b',
        scopeRestriction: Scope.project('PRJ-1')
      });
      // A broader or disjoint scope
      const del2 = new Delegation({
        id: 'del-2',
        principalId: 'user-b',
        delegateId: 'user-c',
        scopeRestriction: Scope.project('PRJ-2')
      });

      const chain = new DelegationChain([del1, del2]);
      const result = validator.validateChain(chain);

      // We expect a warning because PRJ-1 does not contain PRJ-2
      expect(result.warnings).toContain(
        'Delegation 1: scope restriction may be inconsistent with previous delegation'
      );
    });

    it('should return valid for a correct chain', () => {
      const del1 = new Delegation({ id: 'del-1', principalId: 'user-a', delegateId: 'user-b' });
      const del2 = new Delegation({ id: 'del-2', principalId: 'user-b', delegateId: 'user-c' });
      const chain = new DelegationChain([del1, del2]);

      const result = validator.validateChain(chain);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateExtension(chain, delegation, context)', () => {
    it('should return error if extension creates a linkage break', () => {
      const del1 = new Delegation({ id: 'del-1', principalId: 'user-a', delegateId: 'user-b' });
      const chain = new DelegationChain([del1]);

      const extension = new Delegation({
        id: 'del-2',
        principalId: 'user-c',
        delegateId: 'user-d'
      });

      const result = validator.validateExtension(chain, extension);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Cannot extend chain: last delegate is user-b, but new delegation is from user-c'
      );
    });

    it('should return error if extension creates a cycle', () => {
      const del1 = new Delegation({ id: 'del-1', principalId: 'user-a', delegateId: 'user-b' });
      const chain = new DelegationChain([del1]);

      const extension = new Delegation({
        id: 'del-2',
        principalId: 'user-b',
        delegateId: 'user-a'
      });

      const result = validator.validateExtension(chain, extension);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Would create cycle: user-a already in chain');
    });

    it('should return error if extension exceeds max depth', () => {
      const customValidator = new DelegationValidator({ maxDelegationDepth: 1 });
      const del1 = new Delegation({ id: 'del-1', principalId: 'user-a', delegateId: 'user-b' });
      const chain = new DelegationChain([del1]);

      const extension = new Delegation({
        id: 'del-2',
        principalId: 'user-b',
        delegateId: 'user-c'
      });

      const result = customValidator.validateExtension(chain, extension);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Would exceed maximum depth: 2 > 1');
    });

    it('should propagate validation errors from the extension delegation', () => {
      const chain = new DelegationChain([]);
      const extension = new Delegation({
        id: 'del-1',
        principalId: 'user-a',
        delegateId: 'user-b',
        validFrom: new Date('2025-01-10T00:00:00Z'),
        validTo: new Date('2025-01-01T00:00:00Z')
      });

      const result = validator.validateExtension(chain, extension);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('validTo must be after validFrom');
    });

    it('should return valid if the extension is correct', () => {
      const del1 = new Delegation({ id: 'del-1', principalId: 'user-a', delegateId: 'user-b' });
      const chain = new DelegationChain([del1]);

      const extension = new Delegation({
        id: 'del-2',
        principalId: 'user-b',
        delegateId: 'user-c'
      });

      const result = validator.validateExtension(chain, extension);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
