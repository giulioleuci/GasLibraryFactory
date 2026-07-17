import { describe, it, expect } from '@jest/globals';
import { DelegationChain } from '../../../internal/delegation/DelegationChain.js';
import { Delegation } from '../../../internal/delegation/Delegation.js';

describe('DelegationChain', () => {
  const createDelegation = (id, principalId, delegateId) => {
    return new Delegation({
      id,
      principalId,
      delegateId
    });
  };

  describe('Constructor & Factories', () => {
    it('should create an empty chain', () => {
      const chain = DelegationChain.empty();
      expect(chain.isEmpty()).toBe(true);
      expect(chain.getDepth()).toBe(0);
    });

    it('should create a single-hop chain', () => {
      const del = createDelegation('del1', 'A', 'B');
      const chain = DelegationChain.single(del);

      expect(chain.isEmpty()).toBe(false);
      expect(chain.getDepth()).toBe(1);
      expect(chain.getFirst().id).toBe('del1');
    });

    it('should construct from a valid array of delegations', () => {
      const del1 = createDelegation('del1', 'A', 'B');
      const del2 = createDelegation('del2', 'B', 'C');
      const chain = new DelegationChain([del1, del2]);

      expect(chain.getDepth()).toBe(2);
      expect(chain.getFirst().id).toBe('del1');
      expect(chain.getLast().id).toBe('del2');
    });

    it('should throw if delegations is not an array', () => {
      expect(() => new DelegationChain('not-an-array')).toThrow('Delegations must be an array');
    });

    it('should throw if an element is not a Delegation', () => {
      expect(() => new DelegationChain([{}])).toThrow('Element at index 0 is not a Delegation');
    });

    it('should throw if linkage is broken', () => {
      const del1 = createDelegation('del1', 'A', 'B');
      const del3 = createDelegation('del3', 'C', 'D'); // B != C

      expect(() => new DelegationChain([del1, del3])).toThrow('Chain is broken at index 1');
    });
  });

  describe('Properties & Accessors', () => {
    let emptyChain;
    let singleChain;
    let multiChain;

    beforeEach(() => {
      emptyChain = DelegationChain.empty();
      const del1 = createDelegation('del1', 'A', 'B');
      singleChain = DelegationChain.single(del1);

      const del2 = createDelegation('del2', 'B', 'C');
      const del3 = createDelegation('del3', 'C', 'D');
      multiChain = new DelegationChain([del1, del2, del3]);
    });

    it('isEmpty should return correct boolean', () => {
      expect(emptyChain.isEmpty()).toBe(true);
      expect(singleChain.isEmpty()).toBe(false);
      expect(multiChain.isEmpty()).toBe(false);
    });

    it('getDepth should return correct count', () => {
      expect(emptyChain.getDepth()).toBe(0);
      expect(singleChain.getDepth()).toBe(1);
      expect(multiChain.getDepth()).toBe(3);
    });

    it('getOriginalPrincipalId should return first actor or null', () => {
      expect(emptyChain.getOriginalPrincipalId()).toBeNull();
      expect(singleChain.getOriginalPrincipalId()).toBe('A');
      expect(multiChain.getOriginalPrincipalId()).toBe('A');
    });

    it('getFinalDelegateId should return last actor or null', () => {
      expect(emptyChain.getFinalDelegateId()).toBeNull();
      expect(singleChain.getFinalDelegateId()).toBe('B');
      expect(multiChain.getFinalDelegateId()).toBe('D');
    });

    it('getAllActorIds should return array of all actors', () => {
      expect(emptyChain.getAllActorIds()).toEqual([]);
      expect(singleChain.getAllActorIds()).toEqual(['A', 'B']);
      expect(multiChain.getAllActorIds()).toEqual(['A', 'B', 'C', 'D']);
    });

    it('getFirst should return first delegation or null', () => {
      expect(emptyChain.getFirst()).toBeNull();
      expect(singleChain.getFirst().id).toBe('del1');
      expect(multiChain.getFirst().id).toBe('del1');
    });

    it('getLast should return final delegation or null', () => {
      expect(emptyChain.getLast()).toBeNull();
      expect(singleChain.getLast().id).toBe('del1');
      expect(multiChain.getLast().id).toBe('del3');
    });

    it('getAt should return segment at index or null', () => {
      expect(emptyChain.getAt(0)).toBeNull();
      expect(multiChain.getAt(0).id).toBe('del1');
      expect(multiChain.getAt(1).id).toBe('del2');
      expect(multiChain.getAt(2).id).toBe('del3');
      expect(multiChain.getAt(3)).toBeNull();
      expect(multiChain.getAt(-1)).toBeNull();
    });

    it('containsActor should return true if actor exists in chain', () => {
      expect(emptyChain.containsActor('A')).toBe(false);
      expect(singleChain.containsActor('B')).toBe(true);
      expect(singleChain.containsActor('C')).toBe(false);
      expect(multiChain.containsActor('A')).toBe(true);
      expect(multiChain.containsActor('C')).toBe(true);
      expect(multiChain.containsActor('D')).toBe(true);
      expect(multiChain.containsActor('E')).toBe(false);
    });
  });

  describe('Cycle Detection & Extension', () => {
    let emptyChain;
    let chain;

    beforeEach(() => {
      emptyChain = DelegationChain.empty();
      const del1 = createDelegation('del1', 'A', 'B');
      const del2 = createDelegation('del2', 'B', 'C');
      chain = new DelegationChain([del1, del2]);
    });

    it('wouldCreateCycle should return true if new delegate is already in chain', () => {
      const delCycle = createDelegation('delCycle', 'C', 'A');
      expect(chain.wouldCreateCycle(delCycle)).toBe(true);

      const delCycle2 = createDelegation('delCycle2', 'C', 'B');
      expect(chain.wouldCreateCycle(delCycle2)).toBe(true);

      const delNoCycle = createDelegation('delNoCycle', 'C', 'D');
      expect(chain.wouldCreateCycle(delNoCycle)).toBe(false);
    });

    it('extend should create a new chain with the added delegation', () => {
      const del3 = createDelegation('del3', 'C', 'D');
      const extended = chain.extend(del3);

      expect(extended).not.toBe(chain);
      expect(extended.getDepth()).toBe(3);
      expect(extended.getLast().id).toBe('del3');
      expect(extended.getOriginalPrincipalId()).toBe('A');
      expect(extended.getFinalDelegateId()).toBe('D');
    });

    it('extend from empty should create a single chain', () => {
      const del1 = createDelegation('del1', 'A', 'B');
      const extended = emptyChain.extend(del1);

      expect(extended.getDepth()).toBe(1);
      expect(extended.getFirst().id).toBe('del1');
    });

    it('extend should throw if not a Delegation instance', () => {
      expect(() => chain.extend({ id: 'bad' })).toThrow('Must provide a Delegation instance');
    });

    it('extend should throw if linkage fails', () => {
      const badLink = createDelegation('badLink', 'X', 'Y');
      expect(() => chain.extend(badLink)).toThrow(
        'Cannot extend chain: last delegate is C, but new delegation is from X'
      );
    });

    it('extend should throw if cycle is detected', () => {
      const cycleLink = createDelegation('cycleLink', 'C', 'A');
      expect(() => chain.extend(cycleLink)).toThrow(
        'Cannot extend chain: would create a cycle with delegate A'
      );
    });
  });

  describe('Iterator, Map, Validity Checking and Serialization', () => {
    let chain;
    let del1;
    let del2;

    beforeEach(() => {
      del1 = createDelegation('del1', 'A', 'B');
      del2 = createDelegation('del2', 'B', 'C');
      chain = new DelegationChain([del1, del2]);
    });

    it('forEach should iterate over all delegations', () => {
      const mockCallback = jest.fn();
      chain.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toBe(2);
      expect(mockCallback.mock.calls[0][0]).toBe(del1);
      expect(mockCallback.mock.calls[1][0]).toBe(del2);
    });

    it('map should return mapped array', () => {
      const ids = chain.map((d) => d.id);
      expect(ids).toEqual(['del1', 'del2']);
    });

    it('isValidAt should return true if all segments are valid', () => {
      // Create fresh delegations and chain using specific validTo dates for testing isValidAt
      // Since Delegation is frozen we cannot use jest.spyOn
      const date = new Date('2025-01-01');

      const d1 = new Delegation({
        id: 'd1',
        principalId: 'A',
        delegateId: 'B',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2026-01-01')
      });
      const d2 = new Delegation({
        id: 'd2',
        principalId: 'B',
        delegateId: 'C',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2026-01-01')
      });
      const c = new DelegationChain([d1, d2]);

      expect(c.isValidAt(date)).toBe(true);
    });

    it('isValidAt should return false if any segment is invalid', () => {
      const date = new Date('2025-01-01');

      const d1 = new Delegation({
        id: 'd1',
        principalId: 'A',
        delegateId: 'B',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2026-01-01')
      });
      const d2 = new Delegation({
        id: 'd2',
        principalId: 'B',
        delegateId: 'C',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31') // Expired
      });
      const c = new DelegationChain([d1, d2]);

      expect(c.isValidAt(date)).toBe(false);
    });

    it('toJSON should serialize the chain correctly', () => {
      const json = chain.toJSON();

      expect(json).toHaveProperty('depth', 2);
      expect(json).toHaveProperty('originalPrincipalId', 'A');
      expect(json).toHaveProperty('finalDelegateId', 'C');
      expect(json.delegations).toHaveLength(2);
      expect(json.delegations[0]).toHaveProperty('id', 'del1');
      expect(json.delegations[1]).toHaveProperty('id', 'del2');
    });

    it('fromJSON should restore the chain correctly', () => {
      const json = chain.toJSON();
      const restored = DelegationChain.fromJSON(json);

      expect(restored).toBeInstanceOf(DelegationChain);
      expect(restored.getDepth()).toBe(2);
      expect(restored.getFirst().id).toBe('del1');
      expect(restored.getLast().id).toBe('del2');
    });

    it('fromJSON should throw for invalid object', () => {
      expect(() => DelegationChain.fromJSON(null)).toThrow('Invalid chain object');
      expect(() => DelegationChain.fromJSON('string')).toThrow('Invalid chain object');
    });

    it('toString should format correctly', () => {
      expect(DelegationChain.empty().toString()).toBe('DelegationChain[empty]');
      expect(chain.toString()).toBe('DelegationChain[A -> B -> C]');
    });
  });
});
