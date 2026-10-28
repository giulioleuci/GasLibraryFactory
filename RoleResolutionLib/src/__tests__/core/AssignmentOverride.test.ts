import { AssignmentCandidate } from '../../core/AssignmentCandidate.js';
import { AssignmentOverride } from '../../core/AssignmentOverride.js';
import { AssignmentSlot } from '../../core/AssignmentSlot.js';

describe('AssignmentOverride decomposed match predicates', () => {
  const slot = new AssignmentSlot({ dimensions: { group: 'G1', subject: 'S1' } });
  const candidate = new AssignmentCandidate({ id: 'c-1', actorId: 'old', slot });
  const override = new AssignmentOverride({
    id: 'o-1',
    previousActorId: 'old',
    nextActorId: 'new',
    slotScope: { group: 'G1' },
    effectiveFrom: '2026-01-10'
  });

  test('appliesAtDate is true on/after effectiveFrom and false before it', () => {
    expect(override.appliesAtDate(new Date('2026-01-09'))).toBe(false);
    expect(override.appliesAtDate(new Date('2026-01-10'))).toBe(true);
    expect(override.appliesAtDate(new Date('2026-01-11'))).toBe(true);
  });

  test('matchesActor compares against an arbitrary actor id, not just the candidate', () => {
    expect(override.matchesActor('old')).toBe(true);
    expect(override.matchesActor('new')).toBe(false);
    expect(override.matchesActor('middle')).toBe(false);
  });

  test('matchesSlot delegates to the slot scope match', () => {
    expect(override.matchesSlot(slot)).toBe(true);
    expect(
      override.matchesSlot(new AssignmentSlot({ dimensions: { group: 'G2', subject: 'S1' } }))
    ).toBe(false);
  });

  test('matches composes appliesAtDate + matchesActor(candidate.actorId) + matchesSlot + candidate validity', () => {
    expect(override.matches(candidate, new Date('2026-01-09'))).toBe(false);
    expect(override.matches(candidate, new Date('2026-01-10'))).toBe(true);

    const otherActor = new AssignmentCandidate({ id: 'c-2', actorId: 'someone-else', slot });
    expect(override.matches(otherActor, new Date('2026-01-10'))).toBe(false);
  });
});
