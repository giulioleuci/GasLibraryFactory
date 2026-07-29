import { AssignmentSlot } from '../../core/AssignmentSlot.js';
import { AssignmentCandidate } from '../../core/AssignmentCandidate.js';
import { AssignmentOverride } from '../../core/AssignmentOverride.js';
import { EffectiveAssignmentResult } from '../../core/EffectiveAssignmentResult.js';
import { Actor } from '../../core/Actor.js';
import { DelegationChain } from '../../internal/delegation/DelegationChain.js';
import { ResolutionPolicy } from '../../internal/resolution/ResolutionPolicy.js';
import { ResolutionTrace } from '../../internal/resolution/ResolutionTrace.js';
import { RoutingPolicy } from '../../internal/routing/RoutingPolicy.js';
import {
  MalformedAssignmentSlotError,
  RoleValidationError
} from '../../internal/errors/RoleResolutionError.js';

describe('effective-assignment value model', () => {
  test('slot keys are deterministic and arbitrary dimensions remain opaque', () => {
    const a = new AssignmentSlot({
      dimensions: { discriminator: 'ANY_VALUE', kind: 'CUSTOM', subject: 'S1' }
    });
    const b = new AssignmentSlot({
      dimensions: { subject: 'S1', kind: 'CUSTOM', discriminator: 'ANY_VALUE' }
    });

    expect(a.key).toBe(b.key);
    expect(a.get('kind')).toBe('CUSTOM');
  });

  test('a dated override matches every candidate held by its previous actor in scope', () => {
    const slot = new AssignmentSlot({
      dimensions: { subject: 'S1', kind: 'CUSTOM', discriminator: 'A' }
    });
    const candidate = new AssignmentCandidate({ id: 'base-1', actorId: 'old', slot });
    const override = new AssignmentOverride({
      id: 'change-1',
      previousActorId: 'old',
      nextActorId: 'new',
      slotScope: { subject: 'S1' },
      effectiveFrom: new Date('2026-01-10')
    });

    expect(override.matches(candidate, new Date('2026-01-09'))).toBe(false);
    expect(override.matches(candidate, new Date('2026-01-10'))).toBe(true);
  });

  test('candidate validity includes both temporal boundaries', () => {
    const candidate = new AssignmentCandidate({
      id: 'base-1',
      actorId: 'actor-1',
      slot: new AssignmentSlot({ dimensions: { kind: 'CUSTOM' } }),
      validFrom: '2026-01-10T00:00:00.000Z',
      validTo: '2026-01-20T00:00:00.000Z'
    });

    expect(candidate.isValidAt(new Date('2026-01-10T00:00:00.000Z'))).toBe(true);
    expect(candidate.isValidAt(new Date('2026-01-20T00:00:00.000Z'))).toBe(true);
  });

  test('value objects serialize to round-trip-safe plain data', () => {
    const slot = new AssignmentSlot({ dimensions: { kind: 'CUSTOM', enabled: true } });
    const candidate = new AssignmentCandidate({ id: 'c-1', actorId: 'a-1', slot });
    const override = new AssignmentOverride({
      id: 'o-1',
      previousActorId: 'a-1',
      nextActorId: 'a-2',
      slotScope: { kind: 'CUSTOM' },
      effectiveFrom: '2026-01-10T00:00:00.000Z'
    });

    expect(JSON.parse(JSON.stringify(slot))).toEqual(slot.toJSON());
    expect(JSON.parse(JSON.stringify(candidate))).toEqual(candidate.toJSON());
    expect(JSON.parse(JSON.stringify(override))).toEqual(override.toJSON());
  });

  test('metadata is defensively copied and deeply frozen', () => {
    const metadata = { nested: { source: 'input' } };
    const candidate = new AssignmentCandidate({
      id: 'c-1',
      actorId: 'a-1',
      slot: new AssignmentSlot({ dimensions: { kind: 'CUSTOM' } }),
      metadata
    });

    metadata.nested.source = 'changed externally';

    expect(candidate.metadata.nested.source).toBe('input');
    expect(Object.isFrozen(candidate.metadata.nested)).toBe(true);
  });

  test('result and trace are immutable', () => {
    const trace = new ResolutionTrace().append({
      stage: 'BASE',
      decision: 'SELECTED',
      candidateId: 'base-1',
      actorId: 'a-1',
      reason: 'highest priority',
      metadata: { priority: 1 }
    });
    const result = new EffectiveAssignmentResult({
      slot: new AssignmentSlot({ dimensions: { kind: 'CUSTOM' } }),
      baseActor: Actor.person('a-1', 'a1@example.test', 'Actor One'),
      permanentActor: null,
      effectiveActor: Actor.person('a-1', 'a1@example.test', 'Actor One'),
      delegationChain: DelegationChain.empty(),
      routing: { primary: ['a-1'] },
      trace,
      metadata: { source: 'test' }
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.trace)).toBe(true);
    expect(Object.isFrozen(result.trace.entries[0])).toBe(true);
    expect(result.toJSON().trace).toEqual(trace.toJSON());
  });

  test('resolution policy defaults are explicit and valid', () => {
    const policy = new ResolutionPolicy();

    expect(policy.tieBehavior).toBe('THROW');
    expect(policy.missingActorBehavior).toBe('THROW');
    expect(policy.maxDelegationDepth).toBeNull();
    expect(policy.routingPolicy).toBe(RoutingPolicy.DELEGATE_OR_PRINCIPAL);
    expect(policy.resultIdentity).toEqual(['slot', 'principalActor']);
    expect(Object.isFrozen(policy.resultIdentity)).toBe(true);
  });

  test('invalid slot and policy definitions use typed validation errors', () => {
    expect(() => new AssignmentSlot({ dimensions: {} })).toThrow(MalformedAssignmentSlotError);
    expect(
      () => new AssignmentCandidate({ id: 'c-1', actorId: ' ', slot: { dimensions: { x: 1 } } })
    ).toThrow(RoleValidationError);
    expect(() => new ResolutionPolicy({ tieBehavior: 'IGNORE' })).toThrow(RoleValidationError);
  });
});
