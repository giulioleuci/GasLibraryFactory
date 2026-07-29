import { EffectiveAssignmentResolver } from '../../internal/resolution/EffectiveAssignmentResolver.js';
import { Actor } from '../../core/Actor.js';
import { AssignmentCandidate } from '../../core/AssignmentCandidate.js';
import { AssignmentOverride } from '../../core/AssignmentOverride.js';
import { AssignmentSlot } from '../../core/AssignmentSlot.js';
import { Delegation } from '../../internal/delegation/Delegation.js';
import { ResolutionPolicy } from '../../internal/resolution/ResolutionPolicy.js';
import { RoutingPolicy } from '../../internal/routing/RoutingPolicy.js';
import {
  AmbiguousAssignmentOverrideError,
  AssignmentActorNotFoundError,
  InconsistentAssignmentOverrideError,
  OverlappingDelegationError,
  CircularDelegationError,
  DelegationDepthExceededError
} from '../../internal/errors/RoleResolutionError.js';

const actor = (id) => Actor.person(id, `${id}@example.test`, id);
const slot = (kind = 'K1') =>
  new AssignmentSlot({ dimensions: { group: 'G1', subject: 'S1', kind } });
const candidate = (id, actorId, assignmentSlot = slot()) =>
  new AssignmentCandidate({ id, actorId, slot: assignmentSlot });
const override = (id, previousActorId, nextActorId, effectiveFrom = '2026-01-10') =>
  new AssignmentOverride({
    id,
    previousActorId,
    nextActorId,
    effectiveFrom,
    slotScope: { group: 'G1', subject: 'S1' }
  });
const delegation = (id, principalId, delegateId, options = {}) =>
  new Delegation({
    id,
    principalId,
    delegateId,
    roleIds: '*',
    scope: null,
    validFrom: '2026-01-01',
    ...options
  });

function createResolver({
  candidates = [candidate('base', 'old')],
  overrides = [override('change', 'old', 'new')],
  delegations = [],
  policy = new ResolutionPolicy(),
  actors = ['old', 'new', 'substitute-2']
} = {}) {
  const actorMap = new Map(actors.map((id) => [id, actor(id)]));
  return new EffectiveAssignmentResolver({
    actorSource: { getActor: (id) => actorMap.get(id) || null },
    assignmentSource: { getAssignments: () => candidates },
    overrideSource: { getOverrides: () => overrides },
    delegationSource: { getDelegations: () => delegations },
    policy
  });
}

describe('EffectiveAssignmentResolver', () => {
  test.each([
    ['before override', '2026-01-09', 'old', 'old'],
    ['after override', '2026-01-10', 'new', 'new'],
    ['after override with delegate', '2026-01-15', 'new', 'substitute-2']
  ])('%s', (_name, iso, permanentId, effectiveId) => {
    const resolver = createResolver({
      delegations: [delegation('d1', 'new', 'substitute-2', { validFrom: '2026-01-15' })]
    });
    const [result] = resolver.resolve({
      context: { group: 'G1', subject: 'S1' },
      asOfDate: new Date(iso)
    });

    expect(result.permanentActor.id).toBe(permanentId);
    expect(result.effectiveActor.id).toBe(effectiveId);
    expect(result.trace.entries.map((entry) => entry.stage)).toEqual(
      expect.arrayContaining(['BASE', 'OVERRIDE', 'DELEGATION', 'ROUTING'])
    );
  });

  test('chooses the latest override and rejects ties at that timestamp', () => {
    const latest = createResolver({
      overrides: [
        override('old', 'old', 'middle', '2026-01-10'),
        override('latest', 'old', 'new', '2026-01-11')
      ],
      actors: ['old', 'middle', 'new']
    });
    expect(
      latest.resolve({
        context: { group: 'G1', subject: 'S1' },
        asOfDate: new Date('2026-01-12')
      })[0].permanentActor.id
    ).toBe('new');
    const tied = createResolver({
      overrides: [override('left', 'old', 'new'), override('right', 'old', 'middle')],
      actors: ['old', 'new', 'middle']
    });
    expect(() =>
      tied.resolve({ context: { group: 'G1', subject: 'S1' }, asOfDate: new Date('2026-01-12') })
    ).toThrow(AmbiguousAssignmentOverrideError);
  });

  test('rejects a stale override and a missing replacement actor', () => {
    const stale = createResolver({ overrides: [override('stale', 'other', 'new')] });
    expect(() =>
      stale.resolve({ context: { group: 'G1', subject: 'S1' }, asOfDate: new Date('2026-01-12') })
    ).toThrow(InconsistentAssignmentOverrideError);
    const missing = createResolver({ overrides: [override('missing', 'old', 'absent')] });
    expect(() =>
      missing.resolve({ context: { group: 'G1', subject: 'S1' }, asOfDate: new Date('2026-01-12') })
    ).toThrow(AssignmentActorNotFoundError);
  });

  test('keeps multiple base actors in the same slot and orders results by slot then actor id', () => {
    const resolver = createResolver({
      candidates: [
        candidate('b', 'new', slot('K2')),
        candidate('a', 'old', slot('K1')),
        candidate('c', 'new', slot('K1'))
      ],
      overrides: []
    });
    expect(
      resolver
        .resolve({ context: {}, asOfDate: new Date('2026-01-01') })
        .map((item) => `${item.slot.get('kind')}:${item.baseActor.id}`)
    ).toEqual(['K1:new', 'K1:old', 'K2:new']);
  });

  test('follows a direct and transitive delegation chain, rejecting cycles and overlapping outgoing arcs', () => {
    const resolver = createResolver({
      delegations: [delegation('ab', 'old', 'new'), delegation('bc', 'new', 'substitute-2')],
      overrides: []
    });
    const [result] = resolver.resolve({
      context: { group: 'G1', subject: 'S1' },
      asOfDate: new Date('2026-01-12')
    });
    expect(result.effectiveActor.id).toBe('substitute-2');
    expect(result.delegationChain.getDepth()).toBe(2);
    expect(() =>
      createResolver({
        delegations: [delegation('ab', 'old', 'new'), delegation('ac', 'old', 'substitute-2')],
        overrides: []
      }).resolve({ context: {}, asOfDate: new Date('2026-01-12') })
    ).toThrow(OverlappingDelegationError);
    expect(() =>
      createResolver({
        delegations: [delegation('ab', 'old', 'new'), delegation('ba', 'new', 'old')],
        overrides: []
      }).resolve({ context: {}, asOfDate: new Date('2026-01-12') })
    ).toThrow(CircularDelegationError);
  });

  test('supports an unbounded chain and rejects a configured depth overflow', () => {
    const ids = Array.from({ length: 12 }, (_value, index) => `a${index}`);
    const delegations = ids
      .slice(0, -1)
      .map((id, index) => delegation(`d${index}`, id, ids[index + 1]));
    const base = [candidate('base', 'a0')];
    expect(
      createResolver({ candidates: base, overrides: [], delegations, actors: ids }).resolve({
        context: {},
        asOfDate: new Date('2026-01-12')
      })[0].effectiveActor.id
    ).toBe('a11');
    expect(() =>
      createResolver({
        candidates: base,
        overrides: [],
        delegations,
        actors: ids,
        policy: new ResolutionPolicy({ maxDelegationDepth: 2 })
      }).resolve({ context: {}, asOfDate: new Date('2026-01-12') })
    ).toThrow(DelegationDepthExceededError);
  });

  test.each(Object.values(RoutingPolicy))(
    'delegates all routing policy decisions to RoutingResolver: %s',
    (routingPolicy) => {
      const resolver = createResolver({
        overrides: [],
        delegations: [delegation('d', 'old', 'new')],
        policy: new ResolutionPolicy({ routingPolicy })
      });
      const [result] = resolver.resolve({ context: {}, asOfDate: new Date('2026-01-12') });
      expect(result.routing.metadata.policy).toBe(routingPolicy);
    }
  );
});
