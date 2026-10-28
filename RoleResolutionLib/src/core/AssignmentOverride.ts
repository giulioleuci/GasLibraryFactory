import type { AssignmentOverrideDefinition, DimensionValue, SlotDimensions } from '../types.js';
import type { AssignmentSlot } from './AssignmentSlot.js';
import { parseDate } from '@CoreUtilsLib/src/utils/DateUtils.js';
import { AssignmentCandidate } from './AssignmentCandidate.js';
import { cloneAndFreeze } from '../internal/ImmutableValue.js';
import { InconsistentAssignmentOverrideError } from '../internal/errors/RoleResolutionError.js';

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new InconsistentAssignmentOverrideError(
      `${field} is required and must be a non-blank string`
    );
  }
  return value;
}

function isDimensionValue(value: unknown): value is DimensionValue {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
}

/** Immutable, dated actor replacement scoped by opaque assignment dimensions. */
export class AssignmentOverride {
  declare readonly id: string;
  declare readonly previousActorId: string;
  declare readonly nextActorId: string;
  declare readonly slotScope: Readonly<SlotDimensions>;
  declare readonly effectiveFrom: Date;
  declare readonly source: string;
  declare readonly metadata: Readonly<Record<string, unknown>>;

  constructor({
    id,
    previousActorId,
    nextActorId,
    slotScope,
    effectiveFrom,
    source = 'override',
    metadata = {}
  }: AssignmentOverrideDefinition = {}) {
    this.id = requiredString(id, 'Assignment override id');
    this.previousActorId = requiredString(previousActorId, 'Assignment override previousActorId');
    this.nextActorId = requiredString(nextActorId, 'Assignment override nextActorId');
    if (this.previousActorId === this.nextActorId) {
      throw new InconsistentAssignmentOverrideError('Assignment override must change actor');
    }
    if (!slotScope || typeof slotScope !== 'object' || Array.isArray(slotScope)) {
      throw new InconsistentAssignmentOverrideError(
        'Assignment override slotScope must be an object'
      );
    }
    const scopeEntries = Object.entries(slotScope);
    if (
      scopeEntries.length === 0 ||
      scopeEntries.some(([name, value]) => !name.trim() || !isDimensionValue(value))
    ) {
      throw new InconsistentAssignmentOverrideError(
        'Assignment override slotScope must not be empty'
      );
    }
    this.slotScope = Object.freeze({ ...slotScope }) as SlotDimensions;
    this.effectiveFrom = parseDate(effectiveFrom)!;
    if (this.effectiveFrom === null) {
      throw new InconsistentAssignmentOverrideError(
        'Assignment override effectiveFrom must be a valid ISO-safe date'
      );
    }
    this.source = requiredString(source, 'Assignment override source');
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new InconsistentAssignmentOverrideError(
        'Assignment override metadata must be an object'
      );
    }
    this.metadata = cloneAndFreeze(metadata);
    Object.freeze(this);
  }

  appliesAtDate(date: unknown) {
    const asOf = parseDate(date);
    return asOf !== null && asOf >= this.effectiveFrom;
  }

  matchesActor(actorId: string) {
    return actorId === this.previousActorId;
  }

  matchesSlot(slot: AssignmentSlot | null | undefined) {
    return Boolean(slot) && slot!.matches(this.slotScope);
  }

  matches(candidate: unknown, date: unknown = new Date()) {
    const asOf = parseDate(date);
    return (
      candidate instanceof AssignmentCandidate &&
      asOf !== null &&
      this.appliesAtDate(asOf) &&
      this.matchesActor(candidate.actorId) &&
      candidate.isValidAt(asOf) &&
      this.matchesSlot(candidate.slot)
    );
  }

  toJSON() {
    return {
      id: this.id,
      previousActorId: this.previousActorId,
      nextActorId: this.nextActorId,
      slotScope: { ...this.slotScope },
      effectiveFrom: this.effectiveFrom.toISOString(),
      source: this.source,
      metadata: { ...this.metadata }
    };
  }
}
