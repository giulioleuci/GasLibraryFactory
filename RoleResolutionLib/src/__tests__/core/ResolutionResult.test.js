import { ResolutionResult } from '../../core/ResolutionResult.js';

describe('ResolutionResult', () => {
  const mockRole = { id: 'role-1', toJSON: () => ({ id: 'role-1' }) };
  const mockScope = { id: 'scope-1', toJSON: () => ({ id: 'scope-1' }) };
  const mockActor1 = {
    id: 'user-1',
    displayName: 'User 1',
    toJSON: () => ({ id: 'user-1', displayName: 'User 1' })
  };
  const mockActor2 = {
    id: 'user-2',
    displayName: 'User 2',
    toJSON: () => ({ id: 'user-2', displayName: 'User 2' })
  };

  describe('constructor', () => {
    it('should create a valid ResolutionResult with all fields', () => {
      const data = {
        requestedRole: mockRole,
        scope: mockScope,
        effectiveActor: mockActor2,
        principalActor: mockActor1,
        allActors: [mockActor1, mockActor2],
        delegationChain: [{ from: mockActor1, to: mockActor2 }],
        routing: { primary: [mockActor2], cc: [mockActor1], bcc: [] },
        metadata: { customField: true },
        fallbackUsed: false,
        fallbackRoleId: null
      };

      const result = new ResolutionResult(data);

      expect(result.requestedRole).toBe(mockRole);
      expect(result.scope).toBe(mockScope);
      expect(result.effectiveActor).toBe(mockActor2);
      expect(result.principalActor).toBe(mockActor1);
      expect(result.allActors).toEqual([mockActor1, mockActor2]);
      expect(result.delegationChain).toEqual([{ from: mockActor1, to: mockActor2 }]);
      expect(result.routing.primary).toEqual([mockActor2]);
      expect(result.routing.cc).toEqual([mockActor1]);
      expect(result.routing.bcc).toEqual([]);
      expect(result.metadata.customField).toBe(true);
      expect(result.metadata.resolvedAt).toBeInstanceOf(Date);
      expect(result.fallbackUsed).toBe(false);
      expect(result.fallbackRoleId).toBeNull();
    });

    it('should apply defaults for optional fields', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope
      });

      expect(result.effectiveActor).toBeNull();
      expect(result.principalActor).toBeNull();
      expect(result.allActors).toEqual([]);
      expect(result.delegationChain).toEqual([]);
      expect(result.routing).toEqual({ primary: [], cc: [], bcc: [] });
      expect(result.metadata.resolvedAt).toBeInstanceOf(Date);
      expect(result.fallbackUsed).toBe(false);
      expect(result.fallbackRoleId).toBeNull();
    });

    it('should throw an error if data is missing or not an object', () => {
      expect(() => new ResolutionResult()).toThrow('ResolutionResult data is required');
      expect(() => new ResolutionResult(null)).toThrow('ResolutionResult data is required');
      expect(() => new ResolutionResult('string')).toThrow('ResolutionResult data is required');
    });

    it('should freeze properties for immutability', () => {
      const result = new ResolutionResult({ requestedRole: mockRole, scope: mockScope });

      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.allActors)).toBe(true);
      expect(Object.isFrozen(result.delegationChain)).toBe(true);
      expect(Object.isFrozen(result.routing)).toBe(true);
      expect(Object.isFrozen(result.routing.primary)).toBe(true);
      expect(Object.isFrozen(result.routing.cc)).toBe(true);
      expect(Object.isFrozen(result.routing.bcc)).toBe(true);
      expect(Object.isFrozen(result.metadata)).toBe(true);

      // Verify that modification attempts throw in strict mode (Jest runs in strict mode)
      expect(() => {
        result.effectiveActor = mockActor1;
      }).toThrow();
      expect(() => {
        result.allActors.push(mockActor1);
      }).toThrow();
    });
  });

  describe('isResolved', () => {
    it('should return true if effectiveActor is present', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        effectiveActor: mockActor1
      });
      expect(result.isResolved()).toBe(true);
    });

    it('should return false if effectiveActor is null', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        effectiveActor: null
      });
      expect(result.isResolved()).toBe(false);
    });
  });

  describe('isDelegated', () => {
    it('should return true if delegationChain has items', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        delegationChain: [{ from: mockActor1, to: mockActor2 }]
      });
      expect(result.isDelegated()).toBe(true);
    });

    it('should return false if delegationChain is empty', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        delegationChain: []
      });
      expect(result.isDelegated()).toBe(false);
    });
  });

  describe('getDelegationDepth', () => {
    it('should return the length of the delegation chain', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        delegationChain: [1, 2, 3]
      });
      expect(result.getDelegationDepth()).toBe(3);
    });
  });

  describe('hasEffectiveActorChange', () => {
    it('should return true if effectiveActor differs from principalActor', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        principalActor: mockActor1,
        effectiveActor: mockActor2
      });
      expect(result.hasEffectiveActorChange()).toBe(true);
    });

    it('should return false if effectiveActor is same as principalActor', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        principalActor: mockActor1,
        effectiveActor: mockActor1
      });
      expect(result.hasEffectiveActorChange()).toBe(false);
    });

    it('should return false if either actor is missing', () => {
      const result1 = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        principalActor: mockActor1
      });
      expect(result1.hasEffectiveActorChange()).toBe(false);

      const result2 = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        effectiveActor: mockActor1
      });
      expect(result2.hasEffectiveActorChange()).toBe(false);
    });
  });

  describe('getAllRoutingRecipients', () => {
    it('should combine primary, cc, and bcc arrays', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        routing: { primary: [mockActor1], cc: [mockActor2], bcc: [{ id: 'user-3' }] }
      });
      const recipients = result.getAllRoutingRecipients();
      expect(recipients).toHaveLength(3);
      expect(recipients).toEqual(
        expect.arrayContaining([mockActor1, mockActor2, { id: 'user-3' }])
      );
    });
  });

  describe('getAllActorIds', () => {
    it('should return unique actor IDs from all resolution facets', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        principalActor: mockActor1,
        effectiveActor: mockActor2,
        allActors: [{ id: 'user-3' }, mockActor1],
        routing: { primary: [mockActor2], cc: [{ id: 'user-4' }], bcc: [] }
      });

      const ids = result.getAllActorIds();
      expect(ids).toHaveLength(4);
      expect(ids).toEqual(expect.arrayContaining(['user-1', 'user-2', 'user-3', 'user-4']));
    });
  });

  describe('static empty', () => {
    it('should create an unresolved result', () => {
      const result = ResolutionResult.empty(mockRole, mockScope, { reason: 'No mapping' });
      expect(result.isResolved()).toBe(false);
      expect(result.requestedRole).toBe(mockRole);
      expect(result.scope).toBe(mockScope);
      expect(result.metadata.isEmpty).toBe(true);
      expect(result.metadata.reason).toBe('No mapping');
    });
  });

  describe('static simple', () => {
    it('should create a resolved result for a single actor', () => {
      const result = ResolutionResult.simple(mockRole, mockScope, mockActor1);
      expect(result.isResolved()).toBe(true);
      expect(result.effectiveActor).toBe(mockActor1);
      expect(result.principalActor).toBe(mockActor1);
      expect(result.routing.primary).toEqual([mockActor1]);
      expect(result.isDelegated()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize the result properly', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        effectiveActor: mockActor1,
        principalActor: mockActor1,
        allActors: [mockActor1],
        delegationChain: [{ toJSON: () => ({ type: 'delegation' }) }],
        routing: { primary: [mockActor1], cc: [], bcc: [] },
        fallbackUsed: true,
        fallbackRoleId: 'fallback-1'
      });

      const json = result.toJSON();
      expect(json.requestedRole).toEqual({ id: 'role-1' });
      expect(json.scope).toEqual({ id: 'scope-1' });
      expect(json.effectiveActor).toEqual({ id: 'user-1', displayName: 'User 1' });
      expect(json.principalActor).toEqual({ id: 'user-1', displayName: 'User 1' });
      expect(json.allActors).toEqual([{ id: 'user-1', displayName: 'User 1' }]);
      expect(json.delegationChain).toEqual([{ type: 'delegation' }]);
      expect(json.routing.primary).toEqual([{ id: 'user-1', displayName: 'User 1' }]);
      expect(json.fallbackUsed).toBe(true);
      expect(json.fallbackRoleId).toBe('fallback-1');
      expect(json.metadata).toBeDefined();
    });
  });

  describe('toString', () => {
    it('should format correctly for unresolved result', () => {
      const result = ResolutionResult.empty(mockRole, mockScope);
      expect(result.toString()).toBe('ResolutionResult[role-1] NOT RESOLVED');
    });

    it('should format correctly for resolved result without delegation or fallback', () => {
      const result = ResolutionResult.simple(mockRole, mockScope, mockActor1);
      expect(result.toString()).toBe('ResolutionResult[role-1] -> User 1');
    });

    it('should include delegation info when applicable', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        principalActor: mockActor1,
        effectiveActor: mockActor2,
        delegationChain: [{}]
      });
      expect(result.toString()).toBe('ResolutionResult[role-1] -> User 2 (delegated from User 1)');
    });

    it('should include fallback info when applicable', () => {
      const result = new ResolutionResult({
        requestedRole: mockRole,
        scope: mockScope,
        effectiveActor: mockActor1,
        fallbackUsed: true,
        fallbackRoleId: 'fallback-role'
      });
      expect(result.toString()).toBe(
        'ResolutionResult[role-1] -> User 1 [fallback: fallback-role]'
      );
    });
  });
});
