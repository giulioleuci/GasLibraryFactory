// ===================================================================
// FILE: RoleResolutionLib/src/internal/routing/__tests__/RoutingResolver.test.js
// ===================================================================

import { RoutingResolver } from '../../../internal/routing/RoutingResolver.js';
import { RoutingPolicy } from '../../../internal/routing/RoutingPolicy.js';
import { Actor } from '../../../core/Actor.js';
import { ActorType } from '../../../core/ActorType.js';

function actor(id: string) {
  return new Actor(id, ActorType.PERSON, `${id}@school.it`, id);
}

describe('RoutingResolver', () => {
  let resolver: RoutingResolver;

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
        delegationChain: {
          getLast: () => null,
          getAllActorIds: () => [],
          isEmpty: () => false
        },
        routingPolicy: RoutingPolicy.DELEGATE_ONLY
      });

      expect(result.primary).toEqual([]);
    });
  });

  describe('DELEGATE_OR_PRINCIPAL (ref REPORT_GLF.md B4)', () => {
    const activeChain = {
      getLast: () => null,
      getAllActorIds: () => [],
      isEmpty: () => false
    };

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

  it.each([
    [RoutingPolicy.DELEGATE_PRIMARY_PRINCIPAL_CC, ['supplente'], ['titolare']],
    [RoutingPolicy.PRINCIPAL_PRIMARY_DELEGATE_CC, ['titolare'], ['supplente']],
    [RoutingPolicy.BOTH_EQUAL, ['supplente', 'titolare'], []]
  ])('routes an active delegation by %s', (routingPolicy, primaryIds, ccIds) => {
    const principal = actor('titolare');
    const delegate = actor('supplente');

    const result = resolver.resolve({
      principalActor: principal,
      effectiveActor: delegate,
      delegationChain: {
        getLast: () => null,
        getAllActorIds: () => [],
        isEmpty: () => false
      },
      routingPolicy
    });

    expect(result.primary.map(({ id }) => id)).toEqual(primaryIds);
    expect(result.cc.map(({ id }) => id)).toEqual(ccIds);
    expect(result.metadata.policy).toBe(routingPolicy);
  });
});
