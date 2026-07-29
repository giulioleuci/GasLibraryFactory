import { RoleValidationError } from '../errors/RoleResolutionError.js';

const STAGES = Object.freeze(['BASE', 'OVERRIDE', 'DELEGATION', 'ROUTING']);
const DECISIONS = Object.freeze(['CONSIDERED', 'REJECTED', 'SELECTED', 'APPLIED']);

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

function normalizeEntry({
  stage,
  decision,
  candidateId = null,
  actorId = null,
  reason,
  metadata = {}
} = {}) {
  if (!STAGES.includes(stage) || !DECISIONS.includes(decision)) {
    throw new RoleValidationError('Resolution trace entry has an invalid stage or decision');
  }
  if (
    (candidateId !== null && typeof candidateId !== 'string') ||
    (actorId !== null && typeof actorId !== 'string')
  ) {
    throw new RoleValidationError(
      'Resolution trace candidateId and actorId must be strings or null'
    );
  }
  if (typeof reason !== 'string' || !reason.trim()) {
    throw new RoleValidationError('Resolution trace reason must be a non-blank string');
  }
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new RoleValidationError('Resolution trace metadata must be an object');
  }
  return freezeCopy({ stage, decision, candidateId, actorId, reason, metadata });
}

/** Immutable sequence of explainable effective-assignment decisions. */
export class ResolutionTrace {
  constructor(entries = []) {
    if (!Array.isArray(entries)) {
      throw new RoleValidationError('Resolution trace entries must be an array');
    }
    this.entries = Object.freeze(entries.map(normalizeEntry));
    Object.freeze(this);
  }

  append(entry) {
    return new ResolutionTrace([...this.entries, entry]);
  }

  toJSON() {
    return this.entries.map((entry) => ({
      ...entry,
      metadata: { ...entry.metadata }
    }));
  }
}
