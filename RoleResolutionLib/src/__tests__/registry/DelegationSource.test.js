/**
 * @file RoleResolutionLib/src/__tests__/registry/DelegationSource.test.js
 * @description Unit tests for DelegationSource and InMemoryDelegationSource
 */

import { DelegationSource, InMemoryDelegationSource } from '../../registry/DelegationSource.js';
import { Delegation } from '../../internal/delegation/Delegation.js';
import { Scope } from '../../core/Scope.js';

describe('DelegationSource Interface', () => {
  let source;

  beforeEach(() => {
    source = new DelegationSource();
  });

  it('should throw an error for getActiveDelegationsForPrincipal', () => {
    expect(() => source.getActiveDelegationsForPrincipal('actor1')).toThrow(
      'DelegationSource.getActiveDelegationsForPrincipal() must be implemented'
    );
  });

  it('should throw an error for getActiveDelegationsForDelegate', () => {
    expect(() => source.getActiveDelegationsForDelegate('actor2')).toThrow(
      'DelegationSource.getActiveDelegationsForDelegate() must be implemented'
    );
  });

  it('should throw an error for getDelegationChain', () => {
    expect(() => source.getDelegationChain('actor1', 'role1', Scope.global())).toThrow(
      'DelegationSource.getDelegationChain() must be implemented'
    );
  });
});

describe('InMemoryDelegationSource', () => {
  let source;
  const now = new Date('2023-01-01T12:00:00Z');
  const pastDate = new Date('2022-01-01T12:00:00Z');
  const futureDate = new Date('2024-01-01T12:00:00Z');

  beforeEach(() => {
    source = new InMemoryDelegationSource();
  });

  describe('constructor', () => {
    it('should initialize empty if no data provided', () => {
      expect(source.getAllDelegations()).toEqual([]);
    });

    it('should initialize with provided delegations', () => {
      const del = new Delegation({
        id: 'del-1',
        principalId: 'p1',
        delegateId: 'd1'
      });
      const s2 = new InMemoryDelegationSource({ delegations: [del] });
      expect(s2.getAllDelegations()).toEqual([del]);
    });
  });

  describe('addDelegation and clear', () => {
    it('should add a delegation and clear it', () => {
      const del = new Delegation({
        id: 'del-1',
        principalId: 'p1',
        delegateId: 'd1'
      });
      source.addDelegation(del);
      expect(source.getAllDelegations()).toEqual([del]);

      source.clear();
      expect(source.getAllDelegations()).toEqual([]);
    });
  });

  describe('_isValidDelegation', () => {
    it('should use delegation.isValidAt if it exists and returns true', () => {
      const del = new Delegation({
        id: 'del-1',
        principalId: 'p1',
        delegateId: 'd1',
        validFrom: pastDate,
        validTo: futureDate,
      });
      // The Delegation value object has an isValidAt method
      expect(source._isValidDelegation(del, now)).toBe(true);
    });

    it('should use delegation.isValidAt if it exists and returns false', () => {
        const del = new Delegation({
          id: 'del-1',
          principalId: 'p1',
          delegateId: 'd1',
          validFrom: pastDate,
          validTo: new Date('2022-12-31T12:00:00Z'),
        });
        expect(source._isValidDelegation(del, now)).toBe(false);
      });

    it('should fallback to manual checking - inactive', () => {
      const del = {
        id: 'del-1',
        principalId: 'p1',
        delegateId: 'd1',
        isActive: false
      };
      expect(source._isValidDelegation(del, now)).toBe(false);
    });

    it('should fallback to manual checking - validFrom in future', () => {
      const del = {
        id: 'del-1',
        principalId: 'p1',
        delegateId: 'd1',
        isActive: true,
        validFrom: futureDate
      };
      expect(source._isValidDelegation(del, now)).toBe(false);
    });

    it('should fallback to manual checking - validTo in past', () => {
      const del = {
        id: 'del-1',
        principalId: 'p1',
        delegateId: 'd1',
        isActive: true,
        validFrom: new Date('2020-01-01'),
        validTo: pastDate
      };
      expect(source._isValidDelegation(del, now)).toBe(false);
    });

    it('should fallback to manual checking - valid', () => {
      const del = {
        id: 'del-1',
        principalId: 'p1',
        delegateId: 'd1',
        isActive: true,
        validFrom: pastDate,
        validTo: futureDate
      };
      expect(source._isValidDelegation(del, now)).toBe(true);
    });
  });

  describe('Retrieval Methods', () => {
    let del1, del2, del3;

    beforeEach(() => {
      del1 = new Delegation({
        id: 'del-1',
        principalId: 'p1',
        delegateId: 'd1',
        validFrom: pastDate,
        validTo: futureDate
      });
      del2 = new Delegation({
        id: 'del-2',
        principalId: 'p1',
        delegateId: 'd2',
        validFrom: pastDate,
        validTo: new Date('2022-12-31T12:00:00Z') // Expired
      });
      del3 = new Delegation({
        id: 'del-3',
        principalId: 'p2',
        delegateId: 'd1',
        validFrom: pastDate,
        validTo: futureDate
      });

      source.addDelegation(del1);
      source.addDelegation(del2);
      source.addDelegation(del3);
    });

    describe('getActiveDelegationsForPrincipal', () => {
      it('should return active delegations for a principal', () => {
        const results = source.getActiveDelegationsForPrincipal('p1', now);
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe('del-1');
      });

      it('should return empty array if principal has no active delegations', () => {
        const results = source.getActiveDelegationsForPrincipal('p1', new Date('2025-01-01'));
        expect(results).toHaveLength(0);
      });
    });

    describe('getActiveDelegationsForDelegate', () => {
      it('should return active delegations for a delegate', () => {
        const results = source.getActiveDelegationsForDelegate('d1', now);
        expect(results).toHaveLength(2);
        expect(results.map(d => d.id)).toEqual(['del-1', 'del-3']);
      });

      it('should return empty array if delegate has no active delegations', () => {
        const results = source.getActiveDelegationsForDelegate('d2', now); // d2 is expired
        expect(results).toHaveLength(0);
      });
    });
  });

  describe('getDelegationChain', () => {
    const scope = Scope.global();

    beforeEach(() => {
      // p1 -> p2 -> p3
      source.addDelegation(new Delegation({
        id: 'chain-1',
        principalId: 'p1',
        delegateId: 'p2',
        roleIds: ['role-a'],
        validFrom: pastDate,
        validTo: futureDate
      }));
      source.addDelegation(new Delegation({
        id: 'chain-2',
        principalId: 'p2',
        delegateId: 'p3',
        roleIds: ['role-a'],
        validFrom: pastDate,
        validTo: futureDate
      }));

      // another unrelated delegation
      source.addDelegation(new Delegation({
        id: 'other',
        principalId: 'p1',
        delegateId: 'p4',
        roleIds: ['role-b'],
        validFrom: pastDate,
        validTo: futureDate
      }));

      // Circular delegation: p5 -> p6 -> p5
      source.addDelegation(new Delegation({
        id: 'circ-1',
        principalId: 'p5',
        delegateId: 'p6',
        roleIds: ['role-c'],
        validFrom: pastDate,
        validTo: futureDate
      }));
      source.addDelegation(new Delegation({
        id: 'circ-2',
        principalId: 'p6',
        delegateId: 'p5',
        roleIds: ['role-c'],
        validFrom: pastDate,
        validTo: futureDate
      }));

      // Delegation using manual object (no appliesToRole method)
      source.addDelegation({
          id: 'manual-1',
          principalId: 'p7',
          delegateId: 'p8',
          roleIds: ['role-d'],
          isActive: true,
          validFrom: pastDate,
          validTo: futureDate
      });
    });

    it('should return linear delegation chain', () => {
      const chain = source.getDelegationChain('p1', 'role-a', scope, now);
      expect(chain).toHaveLength(2);
      expect(chain[0].id).toBe('chain-1');
      expect(chain[1].id).toBe('chain-2');
    });

    it('should return empty array if no delegations apply', () => {
      const chain = source.getDelegationChain('p1', 'role-x', scope, now);
      expect(chain).toHaveLength(0);
    });

    it('should prevent infinite loops on circular delegations', () => {
      const chain = source.getDelegationChain('p5', 'role-c', scope, now);
      expect(chain).toHaveLength(2); // p5->p6, p6->p5 and then stops
      expect(chain[0].id).toBe('circ-1');
      expect(chain[1].id).toBe('circ-2');
    });

    it('should work with manual objects lacking appliesToRole/appliesToScope', () => {
        const chain = source.getDelegationChain('p7', 'role-d', scope, now);
        expect(chain).toHaveLength(1);
        expect(chain[0].id).toBe('manual-1');
    });

    it('should not include manual objects if role mismatch', () => {
        const chain = source.getDelegationChain('p7', 'role-a', scope, now);
        expect(chain).toHaveLength(0);
    });
  });
});
