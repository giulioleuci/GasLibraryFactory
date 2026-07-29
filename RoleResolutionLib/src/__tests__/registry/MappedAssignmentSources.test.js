import {
  AssignmentSource,
  ActorSource,
  OverrideSource,
  WideRowAssignmentSource,
  MappedOverrideSource,
  MappedDelegationSource,
  CompositeAssignmentSource
} from '../../registry/MappedAssignmentSources.js';
import { Actor } from '../../core/Actor.js';

const actors = new Map([
  ['a@example.test', Actor.person('a@example.test', 'a@example.test', 'A')],
  ['b@example.test', Actor.person('b@example.test', 'b@example.test', 'B')]
]);
const actorSource = { getActor: (id) => actors.get(id) || null };

describe('mapped effective-assignment sources', () => {
  test('source interfaces require their lookup implementation', () => {
    expect(() => new AssignmentSource().getAssignments({}, new Date())).toThrow(
      'must be implemented'
    );
    expect(() => new OverrideSource().getOverrides({}, new Date())).toThrow('must be implemented');
    expect(() => new ActorSource().getActor('a')).toThrow('must be implemented');
  });

  test('wide rows emit one candidate per CSV actor and preserve arbitrary slot dimensions', () => {
    const source = new WideRowAssignmentSource({
      rows: [{ ID: 'group-1', BASE: ' a@example.test, b@example.test ' }],
      rowIdentityPath: 'ID',
      actorSource,
      columns: [
        {
          name: 'BASE',
          slotDimensions: { subject: 'S1', kind: 'K1', discriminator: 'D1' },
          contextDimensions: { group: { from: 'ID' } }
        }
      ]
    });

    const candidates = source.getAssignments({ group: 'group-1' }, new Date('2026-02-01'));
    expect(candidates.map((c) => c.actorId)).toEqual(['a@example.test', 'b@example.test']);
    expect(candidates[0].slot.get('discriminator')).toBe('D1');
  });

  test('wide rows ignore blank cells and match configured fields using wildcard and CSV values', () => {
    const source = new WideRowAssignmentSource({
      rows: [
        { identity: 'one', owners: '  ', groups: 'G1,G2' },
        { identity: 'two', owners: 'a@example.test', groups: '*' }
      ],
      rowIdentityPath: 'identity',
      actorSource,
      columns: [
        {
          name: 'owners',
          slotDimensions: { channel: 'opaque' },
          contextDimensions: { group: { parse: 'csv', from: 'groups' } }
        }
      ]
    });

    expect(
      source.getAssignments({ group: 'G2' }, new Date()).map((candidate) => candidate.id)
    ).toEqual(['two:owners:a@example.test']);
    expect(
      source.getAssignments({ group: 'G9' }, new Date()).map((candidate) => candidate.id)
    ).toEqual(['two:owners:a@example.test']);
  });

  test('mapped override and delegation rows support plain arrays and synchronous row providers', () => {
    const overrides = new MappedOverrideSource({
      rows: () => [{ ID: 'o1', PREV: 'old', NEXT: 'new', DATE: '2026-01-10', GROUP: 'G1' }],
      mapping: {
        id: { from: 'ID' },
        previousActorId: { from: 'PREV' },
        nextActorId: { from: 'NEXT' },
        effectiveFrom: { from: 'DATE' },
        scope: { group: { from: 'GROUP' } }
      }
    });
    const delegations = new MappedDelegationSource({
      rows: [{ ID: 'd1', PRINCIPAL: 'new', DELEGATE: 'sub', FROM: '2026-01-11', GROUP: '*' }],
      mapping: {
        id: { from: 'ID' },
        principalId: { from: 'PRINCIPAL' },
        delegateId: { from: 'DELEGATE' },
        validFrom: { from: 'FROM' },
        validTo: null,
        scope: { group: { from: 'GROUP' } }
      }
    });

    expect(overrides.getOverrides({ group: 'G1' }, new Date()).map((item) => item.id)).toEqual([
      'o1'
    ]);
    expect(
      delegations.getDelegations({ group: 'anything' }, new Date()).map((item) => item.id)
    ).toEqual(['d1']);
  });

  test('mapped override sources expand CSV scopes into independently valid override values', () => {
    const source = new MappedOverrideSource({
      rows: [{ ID: 'o1', PREV: 'old', NEXT: 'new', DATE: '2026-01-10', GROUPS: 'G1, G2' }],
      mapping: {
        id: { from: 'ID' },
        previousActorId: { from: 'PREV' },
        nextActorId: { from: 'NEXT' },
        effectiveFrom: { from: 'DATE' },
        scope: { group: { parse: 'csv', from: 'GROUPS' } }
      }
    });

    expect(
      source.getOverrides({ group: 'G2' }, new Date()).map((item) => item.slotScope.group)
    ).toEqual(['G2']);
  });

  test('composite sources deduplicate candidates by the configured identity and merge metadata', () => {
    const base = {
      getAssignments: () => [
        { id: 'a', actorId: 'x', slot: { key: 'slot' }, metadata: { left: 1 } }
      ]
    };
    const duplicate = {
      getAssignments: () => [
        { id: 'b', actorId: 'x', slot: { key: 'slot' }, metadata: { right: 2 } }
      ]
    };
    const source = new CompositeAssignmentSource({
      sources: [base, duplicate],
      mergeMetadata: (left, right) => ({ ...left, ...right })
    });

    expect(source.getAssignments({}, new Date())).toEqual([
      { id: 'a', actorId: 'x', slot: { key: 'slot' }, metadata: { left: 1, right: 2 } }
    ]);
  });
});
