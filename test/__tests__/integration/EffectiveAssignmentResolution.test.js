import {
  Actor,
  EffectiveAssignmentResolver,
  MappedDelegationSource,
  MappedOverrideSource,
  ResolutionPolicy,
  WideRowAssignmentSource
} from '../../../RoleResolutionLib/index.js';

test('resolves a complete effective assignment from plain mapped rows', () => {
  const actors = new Map(
    ['old', 'new', 'delegate'].map((id) => [id, Actor.person(id, `${id}@example.test`, id)])
  );
  const actorSource = { getActor: (id) => actors.get(id) || null };
  const assignmentSource = new WideRowAssignmentSource({
    rows: [{ GROUP: 'G1', OWNER: 'old' }],
    rowIdentityPath: 'GROUP',
    actorSource,
    columns: [
      {
        name: 'OWNER',
        slotDimensions: { group: { from: 'GROUP' }, kind: 'opaque' },
        contextDimensions: { group: { from: 'GROUP' } }
      }
    ]
  });
  const overrideSource = new MappedOverrideSource({
    rows: [{ ID: 'o1', OLD: 'old', NEW: 'new', FROM: '2026-01-10', GROUP: 'G1' }],
    mapping: {
      id: { from: 'ID' },
      previousActorId: { from: 'OLD' },
      nextActorId: { from: 'NEW' },
      effectiveFrom: { from: 'FROM' },
      scope: { group: { from: 'GROUP' } }
    }
  });
  const delegationSource = new MappedDelegationSource({
    rows: [{ ID: 'd1', FROM_ACTOR: 'new', TO_ACTOR: 'delegate', FROM: '2026-01-11', GROUP: 'G1' }],
    mapping: {
      id: { from: 'ID' },
      principalId: { from: 'FROM_ACTOR' },
      delegateId: { from: 'TO_ACTOR' },
      validFrom: { from: 'FROM' },
      validTo: null,
      scope: { group: { from: 'GROUP' } }
    }
  });
  const resolver = new EffectiveAssignmentResolver({
    actorSource,
    assignmentSource,
    overrideSource,
    delegationSource,
    policy: new ResolutionPolicy()
  });

  const [result] = resolver.resolve({ context: { group: 'G1' }, asOfDate: new Date('2026-01-12') });
  expect(result.baseActor.id).toBe('old');
  expect(result.permanentActor.id).toBe('new');
  expect(result.effectiveActor.id).toBe('delegate');
});
