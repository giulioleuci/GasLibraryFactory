import { parseDate } from '../internal/DateParsing.js';
import { AssignmentCandidate } from './AssignmentCandidate.js';
import { InconsistentAssignmentOverrideError } from '../internal/errors/RoleResolutionError.js';

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new InconsistentAssignmentOverrideError(
      `${field} is required and must be a non-blank string`
    );
  }
  return value;
}

function freezeCopy(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }
  const copy = Array.isArray(value) ? value.map(freezeCopy) : {};
  if (!Array.isArray(value)) {
    Object.keys(value).forEach((key) => {
      copy[key] = freezeCopy(value[key]);
    });
  }
  return Object.freeze(copy);
}

/** Immutable, dated actor replacement scoped by opaque assignment dimensions. */
export class AssignmentOverride {
  constructor({
    id,
    previousActorId,
    nextActorId,
    slotScope,
    effectiveFrom,
    source = 'override',
    metadata = {}
  } = {}) {
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
    if (scopeEntries.length === 0 || scopeEntries.some(([name]) => !name.trim())) {
      throw new InconsistentAssignmentOverrideError(
        'Assignment override slotScope must not be empty'
      );
    }
    this.slotScope = Object.freeze({ ...slotScope });
    this.effectiveFrom = parseDate(effectiveFrom);
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
    this.metadata = freezeCopy(metadata);
    Object.freeze(this);
  }

  matches(candidate, date = new Date()) {
    const asOf = parseDate(date);
    return (
      candidate instanceof AssignmentCandidate &&
      asOf !== null &&
      asOf >= this.effectiveFrom &&
      candidate.actorId === this.previousActorId &&
      candidate.isValidAt(asOf) &&
      candidate.slot.matches(this.slotScope)
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
