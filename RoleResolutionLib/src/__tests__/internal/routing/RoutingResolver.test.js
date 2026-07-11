// ===================================================================
// FILE: RoleResolutionLib/src/internal/routing/__tests__/RoutingResolver.test.js
// ===================================================================

import { RoutingResolver } from '../../../internal/routing/RoutingResolver';
import { RoutingPolicy } from '../../../internal/routing/RoutingPolicy';
import { Actor } from '../../../core/Actor';
import { ActorType } from '../../../core/ActorType';

function actor(id) {
  return new Actor(id, ActorType.PERSON, `${id}@school.it`, id);
}

describe('RoutingResolver', () => {
  let resolver;

  beforeEach(() => {
    resolver = new RoutingResolver();
  });

  describe('resolve() with no delegation chain', () => {
    it('routes to the principal only when there is no delegation chain', () => {
      const principal = actor('titolare');
      const result = resolver.resolve({ principalActor: principal });

      expect(result.primary).toEqual([principal]);
      expect(result.cc).toEqual([]);
    });
  });

  describe('DELEGATE_ONLY (baseline sanity)', () => {
    it('yields no recipient when no delegate is resolved', () => {
      const principal = actor('titolare');
      const result = resolver.resolve({
        principalActor: principal,
        effectiveActor: null,
        delegationChain: { isEmpty: () => false },
        routingPolicy: RoutingPolicy.DELEGATE_ONLY
      });

      expect(result.primary).toEqual([]);
    });
  });

  describe('DELEGATE_OR_PRINCIPAL (ref REPORT_GLF.md B4)', () => {
    const activeChain = { isEmpty: () => false };

    it('routes to the delegate when one is resolved', () => {
      const principal = actor('titolare');
      const delegate = actor('supplente');

      const result = resolver.resolve({
        principalActor: principal,
        effectiveActor: delegate,
        delegationChain: activeChain,
        routingPolicy: RoutingPolicy.DELEGATE_OR_PRINCIPAL
      });

      expect(result.primary).toEqual([delegate]);
      expect(result.cc).toEqual([]);
      expect(result.metadata.policy).toBe(RoutingPolicy.DELEGATE_OR_PRINCIPAL);
    });

    it('falls back to the principal when no delegate is resolved', () => {
      const principal = actor('titolare');

      const result = resolver.resolve({
        principalActor: principal,
        effectiveActor: null,
        delegationChain: activeChain,
        routingPolicy: RoutingPolicy.DELEGATE_OR_PRINCIPAL
      });

      expect(result.primary).toEqual([principal]);
    });

    it('is distinct from DELEGATE_ONLY: yields a recipient even with no delegate', () => {
      const principal = actor('titolare');

      const delegateOnly = resolver.resolve({
        principalActor: principal,
        effectiveActor: null,
        delegationChain: activeChain,
        routingPolicy: RoutingPolicy.DELEGATE_ONLY
      });
      const delegateOrPrincipal = resolver.resolve({
        principalActor: principal,
        effectiveActor: null,
        delegationChain: activeChain,
        routingPolicy: RoutingPolicy.DELEGATE_OR_PRINCIPAL
      });

      expect(delegateOnly.primary).toEqual([]);
      expect(delegateOrPrincipal.primary).toEqual([principal]);
    });

    it('yields empty routing when neither principal nor delegate is available', () => {
      const result = resolver.resolve({
        principalActor: null,
        effectiveActor: null,
        delegationChain: activeChain,
        routingPolicy: RoutingPolicy.DELEGATE_OR_PRINCIPAL
      });

      expect(result.primary).toEqual([]);
    });
  });
});
