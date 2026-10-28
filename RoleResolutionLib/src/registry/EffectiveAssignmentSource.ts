import type { RoleContext, AssignmentCandidateRecord } from '../types.js';
import type { Actor } from '../core/Actor.js';
import type { AssignmentCandidate } from '../core/AssignmentCandidate.js';
import type { AssignmentOverride } from '../core/AssignmentOverride.js';
/** Generic persistence contracts for effective-assignment resolution. */
export class EffectiveAssignmentSource<
  C extends object = RoleContext,
  T extends AssignmentCandidateRecord = AssignmentCandidate
> {
  getAssignments(_context: C, _asOfDate: Date): T[] {
    throw new Error('EffectiveAssignmentSource.getAssignments() must be implemented');
  }
}

export class OverrideSource<C extends object = RoleContext> {
  getOverrides(_context: C, _asOfDate: Date): AssignmentOverride[] {
    throw new Error('OverrideSource.getOverrides() must be implemented');
  }
}

export class ActorSource<A extends Actor = Actor> {
  getActor(_actorId: string): A | null | undefined {
    throw new Error('ActorSource.getActor() must be implemented');
  }
}

export function splitCsv(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(splitCsv);
  }
  if (typeof value !== 'string') {
    return value == null ? [] : [String(value)];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Matches opaque dimensions against literal, CSV, and wildcard values. */
export function matchesContextDimensions<C extends object>(
  context: C,
  dimensions: Record<string, unknown> = {}
) {
  return Object.entries(dimensions).every(([name, expected]) => {
    const values = splitCsv(expected);
    return (
      values.includes('*') || values.includes(String((context as Record<string, unknown>)[name]))
    );
  });
}
